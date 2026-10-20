'use strict';

/**
 * Deterministic, evidence-backed repairs for the legacy pipeline-generated
 * question rows.
 *
 * What this script repairs:
 *   1. Non-SQL reference solutions that contain English prose inside a code
 *      skeleton are replaced with executable implementations of the actual
 *      stated task family.
 *   2. Stored expected outputs and sample outputs for the string and
 *      sliding-window families are recomputed from the statement parameters.
 *      (Arithmetic and matrix outputs are checked too; they already agree.)
 *   3. SQL department-aggregate references gain the statement's omitted
 *      AVG(salary) threshold.
 *   4. SQL fixtures recreate `employees` safely across sequential tests by
 *      adding DROP TABLE IF EXISTS, and sample_input no longer contains the
 *      answer query.
 *   5. The generic SQL starter that queried a non-existent `records` table is
 *      replaced with a task-specific employees scaffold for SQL aggregate rows.
 *
 * What this script deliberately does NOT do:
 *   - It does not promote any row from `generated`.
 *   - It does not invent topic mappings, rewrite title domains, assign new
 *     difficulties, deduplicate/delete rows, or make rows exam-eligible.
 *   - It leaves the 186 SQL-language rows whose statement is a non-SQL string
 *     task unchanged; there is no valid SQLite reference for their plain-text
 *     test input contract.
 *
 * Usage:
 *   node scripts/repair-generated-question-bank.js --dry-run
 *   node scripts/repair-generated-question-bank.js
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { buildGeneratedReference } = require('./question-bank/generated-reference-templates');

const DRY_RUN = process.argv.includes('--dry-run');
const OUT = path.join(__dirname, 'question-bank', 'generated-question-repair-report.json');
const MOD = 1000000007n;

function familyOf(statement) {
  if (/transformed into \(x \*/.test(statement)) return 'arithmetic-transform';
  if (/count of (vowels|consonants) and reverse every word/.test(statement)) return 'string-token-transform';
  if (/primary perimeter border/.test(statement)) return 'matrix-border-interior-max';
  if (/Write an optimized SQL query/.test(statement)) return 'sql-department-aggregate';
  if (/longest contiguous subsegment/.test(statement)) return 'sliding-window-minmax';
  return 'unknown';
}

function ints(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean).map(Number);
}

function paramsOf(question, family) {
  const statement = String(question.statement || '');
  if (family === 'arithmetic-transform') {
    const match = statement.match(/\(x \* (-?\d+) \+ (-?\d+)\)/);
    return match ? { multiplier: Number(match[1]), offset: Number(match[2]) } : null;
  }
  if (family === 'string-token-transform') {
    const match = statement.match(/length exceeds (\d+)/);
    return match ? { countVowels: statement.includes('count of vowels'), threshold: Number(match[1]) } : null;
  }
  if (family === 'sliding-window-minmax') {
    const match = statement.match(/does not exceed (-?\d+)/);
    return match ? { limit: Number(match[1]) } : null;
  }
  if (family === 'sql-department-aggregate') {
    const match = statement.match(/average salary exceeds \$(\d+)/);
    return match ? { threshold: Number(match[1]) } : null;
  }
  return {};
}

function oracle(question, family, params, input) {
  if (family === 'arithmetic-transform') {
    const values = ints(input);
    const count = values[0] || 0;
    let total = 0n;
    for (const x of values.slice(1, 1 + count)) {
      total = (total + BigInt(x) * BigInt(params.multiplier) + BigInt(params.offset)) % MOD;
    }
    return String((total + MOD) % MOD);
  }
  if (family === 'string-token-transform') {
    const words = String(input ?? '').trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const ch of words.join(' ')) {
      if (!/[A-Za-z]/.test(ch)) continue;
      const vowel = 'aeiouAEIOU'.includes(ch);
      if ((params.countVowels && vowel) || (!params.countVowels && !vowel)) count++;
    }
    return `${count}\n${words.map((w) => (w.length > params.threshold ? w.split('').reverse().join('') : w)).join(' ')}`;
  }
  if (family === 'matrix-border-interior-max') {
    const values = ints(input);
    const rows = values[0];
    const cols = values[1];
    const cells = values.slice(2);
    let border = 0;
    let interiorMax = null;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const value = cells[r * cols + c];
        if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) border += value;
        else interiorMax = interiorMax === null ? value : Math.max(interiorMax, value);
      }
    }
    return interiorMax === null ? null : `${border} ${interiorMax}`;
  }
  if (family === 'sliding-window-minmax') {
    const values = ints(input);
    const items = values.slice(1, 1 + (values[0] || 0));
    let best = 0;
    for (let left = 0; left < items.length; left++) {
      let min = Infinity;
      let max = -Infinity;
      for (let right = left; right < items.length; right++) {
        min = Math.min(min, items[right]);
        max = Math.max(max, items[right]);
        if (max - min > params.limit) break;
        best = Math.max(best, right - left + 1);
      }
    }
    return String(best);
  }
  if (family === 'sql-department-aggregate') {
    const records = [...String(input ?? '').matchAll(/\(\s*\d+\s*,\s*(\d+)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*([01])\s*\)/g)]
      .map((m) => ({ department: m[1], salary: Number(m[2]), active: m[3] === '1' }));
    const groups = new Map();
    for (const record of records.filter((r) => r.active)) {
      if (!groups.has(record.department)) groups.set(record.department, []);
      groups.get(record.department).push(record.salary);
    }
    return [...groups.entries()]
      .map(([department, salaries]) => ({
        department,
        count: salaries.length,
        average: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
      }))
      .filter((row) => row.count > 3 && row.average > params.threshold)
      .sort((a, b) => b.average - a.average || Number(a.department) - Number(b.department))
      .map((row) => `${row.department}|${row.count}|${row.average}.0`)
      .join('\n');
  }
  return null;
}

function normalize(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').trim();
}

function ensureDropEmployees(sql) {
  const text = String(sql ?? '').trim();
  if (/DROP\s+TABLE\s+IF\s+EXISTS\s+employees\s*;/i.test(text)) return { text: `${text}\n`, changed: false };
  return { text: `DROP TABLE IF EXISTS employees;\n${text}\n`, changed: true };
}

function stripAnswerFromSampleInput(sql) {
  const text = String(sql ?? '');
  const match = text.match(/;\s*SELECT\s+department_id[\s\S]*$/i);
  if (!match) return { text, changed: false };
  return { text: `${text.slice(0, match.index).trim()};\n`, changed: true };
}

function sqlAggregateStarter() {
  return `-- employees(id, department_id, salary, is_active)
-- Return department_id, employee_count and rounded avg_salary.
SELECT department_id
FROM employees
WHERE is_active = 1;
`;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: DRY_RUN,
    rows_scanned: 0,
    rows_updated: 0,
    tests_with_expected_output_changed: 0,
    rows_with_expected_output_changed: 0,
    sample_outputs_changed: 0,
    references_replaced: 0,
    references_replaced_by_language_family: {},
    sql_thresholds_added: 0,
    sql_fixture_inputs_with_drop_added: 0,
    sql_sample_answer_queries_removed: 0,
    sql_starters_replaced: 0,
    skipped_sql_language_string_rows: 0,
    skipped_unknown_rows: 0,
    example_ids: {
      expected_output_changed: [],
      reference_replaced: [],
      sql_repaired: [],
      skipped_sql_string: [],
    },
  };

  try {
    const rows = (await client.query(
      `SELECT * FROM questions
        WHERE validation_status='generated' AND id LIKE '%-bank-%'
        ORDER BY id`
    )).rows;
    report.rows_scanned = rows.length;

    await client.query('BEGIN');

    for (const question of rows) {
      const family = familyOf(question.statement || '');
      const params = paramsOf(question, family);

      if (question.language === 'sql' && family === 'string-token-transform') {
        report.skipped_sql_language_string_rows++;
        if (report.example_ids.skipped_sql_string.length < 10) report.example_ids.skipped_sql_string.push(question.id);
        continue;
      }
      if (family === 'unknown' || params === null) {
        report.skipped_unknown_rows++;
        continue;
      }

      let sampleInput = question.sample_input;
      let sampleOutput = question.sample_output;
      let starterCode = typeof question.starter_code === 'string' ? JSON.parse(question.starter_code) : { ...question.starter_code };
      let reference = question.reference_solution;
      let testCases = (Array.isArray(question.test_cases) ? question.test_cases : JSON.parse(question.test_cases || '[]'))
        .map((tc) => ({ ...tc }));
      let changed = false;
      let rowExpectedChanged = false;

      if (family === 'sql-department-aggregate') {
        for (const testCase of testCases) {
          const dropped = ensureDropEmployees(testCase.input);
          if (dropped.changed) {
            testCase.input = dropped.text;
            report.sql_fixture_inputs_with_drop_added++;
            changed = true;
          }
          const expected = oracle(question, family, params, testCase.input);
          if (expected !== null && normalize(expected) !== normalize(testCase.expected_output)) {
            testCase.expected_output = expected;
            report.tests_with_expected_output_changed++;
            rowExpectedChanged = true;
            changed = true;
          }
        }

        const stripped = stripAnswerFromSampleInput(sampleInput);
        if (stripped.changed) {
          sampleInput = stripped.text;
          report.sql_sample_answer_queries_removed++;
          changed = true;
        }
        const droppedSample = ensureDropEmployees(sampleInput);
        if (droppedSample.changed) {
          sampleInput = droppedSample.text;
          report.sql_fixture_inputs_with_drop_added++;
          changed = true;
        }
        const expectedSample = oracle(question, family, params, sampleInput);
        if (expectedSample !== null && normalize(expectedSample) !== normalize(sampleOutput)) {
          sampleOutput = expectedSample;
          report.sample_outputs_changed++;
          changed = true;
        }

        if (!new RegExp(`AVG\\s*\\(\\s*salary\\s*\\)\\s*>\\s*${params.threshold}\\b`, 'i').test(reference)) {
          const updated = reference.replace(
            /HAVING\s+COUNT\(\*\)\s*>\s*3/i,
            `HAVING COUNT(*) > 3 AND AVG(salary) > ${params.threshold}`
          );
          if (updated !== reference) {
            reference = updated;
            report.sql_thresholds_added++;
            changed = true;
            if (report.example_ids.sql_repaired.length < 10) report.example_ids.sql_repaired.push(question.id);
          }
        }

        const starter = sqlAggregateStarter();
        if (starterCode.sql !== starter) {
          starterCode.sql = starter;
          report.sql_starters_replaced++;
          changed = true;
        }
      } else {
        for (const testCase of testCases) {
          const expected = oracle(question, family, params, testCase.input);
          if (expected === null) throw new Error(`${question.id}: oracle failed for ${family}`);
          if (normalize(expected) !== normalize(testCase.expected_output)) {
            testCase.expected_output = expected;
            report.tests_with_expected_output_changed++;
            rowExpectedChanged = true;
            changed = true;
          }
        }
        const expectedSample = oracle(question, family, params, sampleInput);
        if (expectedSample === null) throw new Error(`${question.id}: sample oracle failed for ${family}`);
        if (normalize(expectedSample) !== normalize(sampleOutput)) {
          sampleOutput = expectedSample;
          report.sample_outputs_changed++;
          changed = true;
        }

        const replacement = buildGeneratedReference(question.language, family, params);
        if (!replacement) throw new Error(`${question.id}: no reference template for ${question.language}/${family}`);
        if (replacement !== reference) {
          reference = replacement;
          report.references_replaced++;
          const key = `${question.language}|${family}`;
          report.references_replaced_by_language_family[key] = (report.references_replaced_by_language_family[key] || 0) + 1;
          changed = true;
          if (report.example_ids.reference_replaced.length < 10) report.example_ids.reference_replaced.push(question.id);
        }
      }

      if (rowExpectedChanged) {
        report.rows_with_expected_output_changed++;
        if (report.example_ids.expected_output_changed.length < 10) report.example_ids.expected_output_changed.push(question.id);
      }

      if (!changed) continue;
      report.rows_updated++;

      if (!DRY_RUN) {
        await client.query(
          `UPDATE questions
              SET sample_input=$2,
                  sample_output=$3,
                  starter_code=$4::jsonb,
                  reference_solution=$5,
                  test_cases=$6::jsonb,
                  validation_status='generated'
            WHERE id=$1`,
          [question.id, sampleInput, sampleOutput, JSON.stringify(starterCode), reference, JSON.stringify(testCases)]
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
