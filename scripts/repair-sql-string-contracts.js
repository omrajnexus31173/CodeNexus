'use strict';

/**
 * Repairs the 186 legacy rows whose language is SQL but whose original
 * contract was a plain-text stdin string exercise.
 *
 * The semantic task is preserved (count vowels/consonants and selectively
 * reverse words), but it is now a real SQL contract:
 *   - fixture table phrases(id, phrase), supplied by each test input;
 *   - one submitted SQLite query;
 *   - one output row: selected_count | transformed_phrase;
 *   - a recursive-CTE reference implementation.
 *
 * IDs, records, generated status and exam ineligibility are preserved.
 * This repair alone never promotes a row.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DRY_RUN = process.argv.includes('--dry-run');
const OUT = path.join(__dirname, 'question-bank', 'sql-string-contract-repair-report.json');

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function oracle(phrase, countVowels, threshold) {
  const words = String(phrase).trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const ch of words.join(' ')) {
    if (!/[A-Za-z]/.test(ch)) continue;
    const vowel = 'aeiouAEIOU'.includes(ch);
    if ((countVowels && vowel) || (!countVowels && !vowel)) count++;
  }
  const transformed = words.map((w) => (w.length > threshold ? w.split('').reverse().join('') : w)).join(' ');
  return `${count}|${transformed}`;
}

function referenceSql(countVowels, threshold) {
  const selectedPredicate = countVowels
    ? `lower(ch) IN ('a', 'e', 'i', 'o', 'u')`
    : `ch GLOB '[A-Za-z]' AND lower(ch) NOT IN ('a', 'e', 'i', 'o', 'u')`;
  return `WITH RECURSIVE
src(phrase) AS (
  SELECT phrase FROM phrases ORDER BY id LIMIT 1
),
chars(pos, ch) AS (
  SELECT 1, substr(phrase, 1, 1) FROM src WHERE length(phrase) > 0
  UNION ALL
  SELECT pos + 1, substr((SELECT phrase FROM src), pos + 1, 1)
  FROM chars
  WHERE pos < length((SELECT phrase FROM src))
),
tokens(idx, token, rest) AS (
  SELECT
    1,
    CASE WHEN instr(phrase, ' ') = 0 THEN phrase ELSE substr(phrase, 1, instr(phrase, ' ') - 1) END,
    CASE WHEN instr(phrase, ' ') = 0 THEN '' ELSE substr(phrase, instr(phrase, ' ') + 1) END
  FROM src
  UNION ALL
  SELECT
    idx + 1,
    CASE WHEN instr(rest, ' ') = 0 THEN rest ELSE substr(rest, 1, instr(rest, ' ') - 1) END,
    CASE WHEN instr(rest, ' ') = 0 THEN '' ELSE substr(rest, instr(rest, ' ') + 1) END
  FROM tokens
  WHERE rest <> ''
),
rev(idx, pos, acc, token) AS (
  SELECT idx, 1, '', token FROM tokens
  UNION ALL
  SELECT idx, pos + 1, substr(token, pos, 1) || acc, token
  FROM rev
  WHERE pos <= length(token)
),
transformed(idx, word) AS (
  SELECT
    t.idx,
    CASE
      WHEN length(t.token) > ${threshold}
        THEN (SELECT acc FROM rev r WHERE r.idx = t.idx AND r.pos = length(t.token) + 1)
      ELSE t.token
    END
  FROM tokens t
)
SELECT
  (SELECT COUNT(*) FROM chars WHERE ${selectedPredicate}) AS selected_count,
  (SELECT group_concat(word, ' ') FROM (SELECT word FROM transformed ORDER BY idx)) AS transformed_phrase;`;
}

function starterSql(countVowels, threshold) {
  return `-- Table phrases(id INTEGER, phrase TEXT) contains exactly one row.
-- Return selected_count and transformed_phrase.
-- Count ${countVowels ? 'vowels' : 'consonants'}; reverse words longer than ${threshold} characters.
-- TODO: use recursive CTEs to scan characters, split words, and reverse selected words.
SELECT 0 AS selected_count, phrase AS transformed_phrase
FROM phrases
ORDER BY id
LIMIT 1;`;
}

function fixture(phrase) {
  return `DROP TABLE IF EXISTS phrases;\nCREATE TABLE phrases (id INTEGER PRIMARY KEY, phrase TEXT NOT NULL);\nINSERT INTO phrases VALUES (1, ${sqlLiteral(phrase)});`;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: DRY_RUN,
    scanned: 0,
    updated: 0,
    by_rule_threshold: {},
    examples: [],
  };

  try {
    const rows = (await client.query(
      `SELECT *
         FROM questions
        WHERE language='sql'
          AND validation_status='generated'
          AND statement ~ 'count of (vowels|consonants) and reverse every word'
        ORDER BY id`
    )).rows;
    report.scanned = rows.length;

    await client.query('BEGIN');
    for (const q of rows) {
      const countVowels = q.statement.includes('count of vowels');
      const threshold = Number(q.statement.match(/length exceeds (\d+)/)?.[1]);
      if (!Number.isInteger(threshold)) throw new Error(`${q.id}: could not parse word-length threshold`);

      const originalTests = Array.isArray(q.test_cases) ? q.test_cases : JSON.parse(q.test_cases || '[]');
      const phrases = [...new Set([q.sample_input, ...originalTests.map((tc) => tc.input)].map((x) => String(x || '').trim()).filter(Boolean))];
      if (phrases.length < 3) throw new Error(`${q.id}: expected sample + two original phrases, found ${phrases.length}`);

      const samplePhrase = phrases[0];
      const testCases = phrases.map((phrase, index) => ({
        input: fixture(phrase),
        expected_output: oracle(phrase, countVowels, threshold),
        is_hidden: index !== 0,
      }));

      const statement = `[Challenge ${q.id}] The test fixture creates a table phrases(id INTEGER, phrase TEXT) containing exactly one phrase. Write one SQLite query that computes the count of ${countVowels ? 'vowels' : 'consonants'} in that phrase and reverses every word whose length exceeds ${threshold} characters. Return the count and the transformed phrase.`;
      const starterCode = { sql: starterSql(countVowels, threshold) };
      const key = `${countVowels ? 'vowels' : 'consonants'}|threshold-${threshold}`;
      report.by_rule_threshold[key] = (report.by_rule_threshold[key] || 0) + 1;
      if (report.examples.length < 10) report.examples.push(q.id);
      report.updated++;

      if (!DRY_RUN) {
        await client.query(
          `UPDATE questions
              SET statement=$2,
                  input_format=$3,
                  output_format=$4,
                  constraints=$5,
                  sample_input=$6,
                  sample_output=$7,
                  starter_code=$8::jsonb,
                  reference_solution=$9,
                  solution_explanation=$10,
                  hint_1=$11,
                  hint_2=$12,
                  test_cases=$13::jsonb,
                  expected_time_complexity='O(N * W)',
                  expected_space_complexity='O(N)',
                  difficulty='Hard',
                  validation_status='generated',
                  is_exam_eligible=FALSE
            WHERE id=$1`,
          [
            q.id,
            statement,
            'SQL fixture creating phrases(id INTEGER, phrase TEXT) with exactly one row. The phrase contains ASCII letters separated by single spaces.',
            'One row with columns selected_count and transformed_phrase (rendered by the runner as selected_count|transformed_phrase).',
            'SQLite 3. Phrase length <= 10^4 characters; words contain ASCII letters and are separated by single spaces. Submit exactly one query.',
            testCases[0].input,
            testCases[0].expected_output,
            JSON.stringify(starterCode),
            referenceSql(countVowels, threshold),
            'Use recursive CTEs: one scans characters for the requested count, one splits the phrase into ordered tokens, and one builds each reversed token character by character. group_concat over an ordered subquery rebuilds the phrase.',
            'A recursive CTE over substr(phrase, pos, 1) can classify every character without a procedural loop.',
            `Split on spaces with instr/substr, reverse only tokens with length > ${threshold}, then group_concat them in token order.`,
            JSON.stringify(testCases),
          ]
        );
      }
    }

    if (DRY_RUN) await client.query('ROLLBACK');
    else await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  if (!DRY_RUN) fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!DRY_RUN) console.log(`Report: ${OUT}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
