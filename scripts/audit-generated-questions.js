'use strict';

/**
 * Full-corpus deterministic audit + stratified sandbox-execution audit for
 * questions whose validation_status is still "generated".
 *
 * This script is intentionally read-only. It never promotes a question and
 * never changes exam eligibility. Use scripts/apply-generated-quarantine.js
 * for the separate, explicit quarantine step.
 *
 * The deterministic pass covers every generated row:
 *   - schema/content completeness
 *   - course/topic mapping validity
 *   - reference/starter structure
 *   - independent expected-output oracles for the generated task families
 *   - sample/test consistency
 *   - exact and canonical duplicate groups
 *   - title-domain versus actual task-family alignment
 *   - difficulty consistency across duplicate task shapes
 *
 * The execution pass uses deterministic strata:
 *   - pipeline rows: language x title-domain x difficulty
 *   - procedural rows: language x difficulty
 * and executes both the stored starter and stored reference through the real
 * /api/execute sandbox. SQL therefore means the actual SQLite practice
 * runner, not a claim of PostgreSQL validation.
 *
 * Usage:
 *   node scripts/audit-generated-questions.js
 *   node scripts/audit-generated-questions.js --no-execute
 *   node scripts/audit-generated-questions.js --sample-per-stratum 1
 *   node scripts/audit-generated-questions.js --out /tmp/audit.json
 *
 * Exit status 2 means at least one generated row is still exam-eligible
 * while failing the deterministic exam-readiness requirements.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const BASE_URL = (process.env.CODE_NEXUS_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const DEFAULT_OUT = path.join(__dirname, 'question-bank', 'generated-question-audit.json');
const MOD = 1000000007n;

function optionValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const EXECUTE = !process.argv.includes('--no-execute');
const SAMPLE_PER_STRATUM = Math.max(1, Number(optionValue('--sample-per-stratum', '2')) || 2);
const OUT = path.resolve(optionValue('--out', DEFAULT_OUT));

const DIRECT_DOMAINS = new Set([
  'Arithmetic & Number Theory',
  'String Processing & Parsing',
  'Matrices & 2D Grid Traversals',
  'Statistics & Moving Windows',
  'String Manipulation & Pointers',
  'String Streams & Formatted Parsing',
  'Sliding Window & Substrings',
  'Number Manipulation & BigInteger',
  'StringBuilder & String Parsing',
  'Sliding Window Frequency Maps',
  'Sliding Window Techniques',
  'Aggregate Functions & Calculations',
  'GROUP BY & HAVING Conditions',
]);

const PARTIAL_DOMAINS = new Set([
  'Primitive Types & Overflows',
  'Standard I/O & Formatted Parsing',
  'JSON Schema Parsing & Manipulation',
  'Lists, Arrays & Slices',
  'Array Indexing & Offsets',
  'Collections Framework - ArrayList & Lists',
  'STL Sequential Containers (vector, deque)',
  'Two-Pointer Algorithms in C++',
  'Classic Two-Pointer Problems in Java',
  'Two-Pointer Algorithms in JS',
  'SELECT Projections & Aliasing',
  'WHERE Filtering & Logical Operators',
]);

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function normalizeOutput(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();
}

function canonicalize(value) {
  return String(value ?? '')
    .replace(/\[(?:Challenge )?[^\]]+\]/g, '[ID]')
    .replace(/-bank-\d+/g, '-bank-#')
    .replace(/\b\d+(?:\.\d+)?\b/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function parseInts(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean).map(Number);
}

function cohortOf(question) {
  if (question.id.includes('-bank-')) return 'pipeline-bank';
  if (/^(c|cpp|python|java|sql|javascript)-0(0[4-9]|1[0-9]|2[0-5])$/.test(question.id)) return 'procedural-seed';
  return 'other-generated';
}

function domainOf(question) {
  return String(question.title || '').split(':')[0].trim();
}

function familyOf(question) {
  // The 186 formerly impossible SQL string rows now use a defined SQLite
  // phrases(id, phrase) fixture. Keep this family distinct from stdin text:
  // its rendered result is one pipe-separated SQL row, not two text lines.
  const statementForSqlPhrase = String(question.statement || '');
  if (
    question.language === 'sql' &&
    /table phrases\(id INTEGER, phrase TEXT\)/.test(statementForSqlPhrase) &&
    /one SQLite query/.test(statementForSqlPhrase)
  ) return 'sql-phrase-token-transform';
  const statement = String(question.statement || '');
  if (/transformed into \(x \*/.test(statement)) return 'arithmetic-transform';
  if (/count of (vowels|consonants) and reverse every word/.test(statement)) return 'string-token-transform';
  if (/primary perimeter border/.test(statement)) return 'matrix-border-interior-max';
  if (/Write an optimized SQL query/.test(statement)) return 'sql-department-aggregate';
  if (/longest contiguous subsegment/.test(statement)) return 'sliding-window-minmax';
  if (cohortOf(question) === 'procedural-seed') return question.language === 'sql' ? 'sql-sum-stream' : 'sum-stream';
  return 'unknown';
}

function alignmentOf(question) {
  if (cohortOf(question) !== 'pipeline-bank') return 'not-stated-in-title';
  if (question.language === 'sql' && familyOf(question) === 'string-token-transform') return 'mismatch';
  const domain = domainOf(question);
  if (DIRECT_DOMAINS.has(domain)) return 'direct';
  if (PARTIAL_DOMAINS.has(domain)) return 'partial';
  return 'mismatch';
}

function referenceKind(question) {
  const reference = String(question.reference_solution || '').trim();
  const family = familyOf(question);
  if (!reference) return 'missing';
  if (question.language === 'sql') {
    if (/^(SELECT|WITH)\b/i.test(reference)) {
      return family === 'sql-department-aggregate' && !/AVG\s*\(\s*salary\s*\)\s*>\s*\d+/i.test(reference)
        ? 'sql-query-missing-stated-threshold'
        : 'sql-query';
    }
    return 'prose-not-sql';
  }
  const hasOutput = /(print\s*\(|System\.out|console\.log|printf\s*\(|cout\s*<<)/.test(reference);
  const proseSummary = /(Accumulate the sum|Count (vowels|consonants)|Sum coordinates|Sliding window approach)/.test(reference);
  if (proseSummary && !hasOutput) return 'prose-summary-in-code-skeleton';
  return hasOutput ? 'code-with-output' : 'code-without-output-statement';
}

function starterOf(question) {
  if (!question.starter_code) return '';
  if (typeof question.starter_code === 'string') {
    try {
      const parsed = JSON.parse(question.starter_code);
      return String(parsed?.[question.language] || '');
    } catch {
      return '';
    }
  }
  return String(question.starter_code[question.language] || '');
}

function starterKind(question) {
  const starter = starterOf(question);
  if (!starter.trim()) return 'missing';
  if (question.language === 'sql' && /SELECT\s+\*\s+FROM\s+records/i.test(starter)) return 'generic-select-records';
  if (/(TODO|Write your solution|Implement your solution|\bpass\b)/i.test(starter)) return 'task-scaffold';
  return 'other-code';
}

function testCasesOf(question) {
  if (Array.isArray(question.test_cases)) return question.test_cases;
  try {
    const parsed = JSON.parse(question.test_cases || '[]');
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function oracleOutput(question, input) {
  const statement = String(question.statement || '');
  const family = familyOf(question);

  if (family === 'arithmetic-transform') {
    const match = statement.match(/\(x \* (-?\d+) \+ (-?\d+)\)/);
    if (!match) return null;
    const multiplier = BigInt(match[1]);
    const offset = BigInt(match[2]);
    const values = parseInts(input);
    const count = values[0] || 0;
    let total = 0n;
    for (const value of values.slice(1, 1 + count)) total = (total + BigInt(value) * multiplier + offset) % MOD;
    return String((total + MOD) % MOD);
  }

  if (family === 'string-token-transform') {
    const thresholdMatch = statement.match(/length exceeds (\d+)/);
    if (!thresholdMatch) return null;
    const countVowels = statement.includes('count of vowels');
    const threshold = Number(thresholdMatch[1]);
    const words = String(input ?? '').trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const char of words.join(' ')) {
      if (!/[A-Za-z]/.test(char)) continue;
      const isVowel = 'aeiouAEIOU'.includes(char);
      if ((countVowels && isVowel) || (!countVowels && !isVowel)) count++;
    }
    const transformed = words.map((word) => (word.length > threshold ? word.split('').reverse().join('') : word));
    return `${count}\n${transformed.join(' ')}`;
  }

  if (family === 'matrix-border-interior-max') {
    const values = parseInts(input);
    const rows = values[0];
    const cols = values[1];
    const cells = values.slice(2);
    if (!rows || !cols || cells.length < rows * cols) return null;
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
    const thresholdMatch = statement.match(/does not exceed (-?\d+)/);
    if (!thresholdMatch) return null;
    const limit = Number(thresholdMatch[1]);
    const values = parseInts(input);
    const count = values[0] || 0;
    const items = values.slice(1, 1 + count);
    let best = 0;
    for (let left = 0; left < items.length; left++) {
      let min = Infinity;
      let max = -Infinity;
      for (let right = left; right < items.length; right++) {
        min = Math.min(min, items[right]);
        max = Math.max(max, items[right]);
        if (max - min > limit) break;
        best = Math.max(best, right - left + 1);
      }
    }
    return String(best);
  }

  if (family === 'sql-phrase-token-transform') {
    const thresholdMatch = statement.match(/length exceeds (\d+)/);
    const phraseMatch = String(input ?? '').match(
      /INSERT INTO phrases VALUES\s*\(\s*\d+\s*,\s*'([^']*)'\s*\)/i
    );
    if (!thresholdMatch || !phraseMatch) return null;
    const countVowels = statement.includes('count of vowels');
    const threshold = Number(thresholdMatch[1]);
    const words = phraseMatch[1].trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const char of words.join(' ')) {
      if (!/[A-Za-z]/.test(char)) continue;
      const isVowel = 'aeiouAEIOU'.includes(char);
      if ((countVowels && isVowel) || (!countVowels && !isVowel)) count++;
    }
    const transformed = words.map((word) => (
      word.length > threshold ? word.split('').reverse().join('') : word
    ));
    return `${count}|${transformed.join(' ')}`;
  }

  if (family === 'sql-department-aggregate') {
    const thresholdMatch = statement.match(/average salary exceeds \$(\d+)/);
    if (!thresholdMatch) return null;
    const threshold = Number(thresholdMatch[1]);
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
      .filter((row) => row.count > 3 && row.average > threshold)
      .sort((a, b) => b.average - a.average || Number(a.department) - Number(b.department))
      .map((row) => `${row.department}|${row.count}|${row.average}.0`)
      .join('\n');
  }

  if (family === 'sum-stream') {
    return String(parseInts(input).reduce((a, b) => a + b, 0));
  }

  if (family === 'sql-sum-stream') {
    const values = [...String(input ?? '').matchAll(/\(\s*(-?\d+)\s*\)/g)].map((m) => Number(m[1]));
    return String(values.reduce((a, b) => a + b, 0));
  }

  return null;
}

function increment(object, key, amount = 1) {
  object[key] = (object[key] || 0) + amount;
}

function addToMap(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function duplicateStats(map) {
  let duplicateGroups = 0;
  let rowsInDuplicateGroups = 0;
  let largestGroup = 0;
  for (const rows of map.values()) {
    if (rows.length > 1) {
      duplicateGroups++;
      rowsInDuplicateGroups += rows.length;
      largestGroup = Math.max(largestGroup, rows.length);
    }
  }
  return { unique_signatures: map.size, duplicate_groups: duplicateGroups, rows_in_duplicate_groups: rowsInDuplicateGroups, largest_group: largestGroup };
}

function sqlFixtureRecreatesTableWithoutDrop(testCases) {
  const createdEarlier = new Set();
  for (const testCase of testCases) {
    const input = String(testCase?.input || '');
    const drops = new Set([...input.matchAll(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?["`]?([A-Za-z_][A-Za-z0-9_]*)["`]?/gi)].map((m) => m[1].toLowerCase()));
    const creates = [...input.matchAll(/CREATE\s+(?:TEMP\s+|TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([A-Za-z_][A-Za-z0-9_]*)["`]?/gi)].map((m) => m[1].toLowerCase());
    for (const table of creates) {
      if (createdEarlier.has(table) && !drops.has(table) && !/CREATE\s+(?:TEMP\s+|TEMPORARY\s+)?TABLE\s+IF\s+NOT\s+EXISTS/i.test(input)) return true;
      createdEarlier.add(table);
    }
  }
  return false;
}

function deterministicExamReady(row, duplicateWithinLanguage) {
  return Boolean(
    row.validCourse &&
    row.validTopicCourse &&
    row.oracleKnown &&
    row.oracleAllMatch &&
    row.sampleOracleMatch &&
    ['code-with-output', 'sql-query'].includes(row.referenceKind) &&
    row.alignment === 'direct' &&
    row.testCases.length >= 3 &&
    !duplicateWithinLanguage &&
    !row.flags.has('sample_contains_reference_query') &&
    !row.flags.has('sql_fixture_recreates_table_without_drop')
  );
}

async function execute(language, code, testCases) {
  const response = await fetch(`${BASE_URL}/api/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ language, code, testCases }),
  });
  let body;
  try {
    body = await response.json();
  } catch {
    return { status: `HTTP ${response.status}`, passed: null, total: testCases.length, detail: 'Non-JSON response' };
  }
  const results = Array.isArray(body.testCaseResults)
    ? body.testCaseResults
    : (Array.isArray(body.results) ? body.results : []);
  return {
    status: body.status || `HTTP ${response.status}`,
    passed: results.length ? results.filter((r) => r.passed || r.status === 'Accepted').length : (body.status === 'Accepted' ? testCases.length : null),
    total: testCases.length,
    detail: String(body.error || body.stderr || '').slice(0, 300),
  };
}

function selectedSample(rows) {
  const strata = new Map();
  for (const row of rows) {
    const key = row.cohort === 'pipeline-bank'
      ? `pipeline|${row.question.language}|${row.domain}|${row.question.difficulty}`
      : `${row.cohort}|${row.question.language}|${row.question.difficulty}`;
    addToMap(strata, key, row);
  }
  const selected = new Map();
  for (const group of strata.values()) {
    [...group]
      .sort((a, b) => sha256(a.question.id).localeCompare(sha256(b.question.id)))
      .slice(0, SAMPLE_PER_STRATUM)
      .forEach((row) => selected.set(row.question.id, row));
  }

  // Ensure every synthetic pipeline topic id is represented at least once.
  const coveredTopics = new Set([...selected.values()].map((row) => `${row.question.language}|${row.question.topic_id}`));
  for (const row of rows) {
    const key = `${row.question.language}|${row.question.topic_id}`;
    if (!coveredTopics.has(key)) {
      selected.set(row.question.id, row);
      coveredTopics.add(key);
    }
  }
  return [...selected.values()].sort((a, b) => a.question.id.localeCompare(b.question.id));
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');

  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  try {
    const result = await pool.query(
      `SELECT q.*,
              (c.id IS NOT NULL) AS valid_course,
              (t.id IS NOT NULL AND t.course_id = q.course_id) AS valid_topic_course
         FROM questions q
         LEFT JOIN courses c ON c.id = q.course_id
         LEFT JOIN course_topics t ON t.id = q.topic_id
        WHERE q.validation_status = 'generated'
        ORDER BY q.id`
    );

    const exactStatement = new Map();
    const canonicalStatement = new Map();
    const exactTests = new Map();
    const exactTestsWithinLanguage = new Map();
    const exactReference = new Map();
    const canonicalReference = new Map();
    const canonicalTaskAndTests = new Map();

    const rows = result.rows.map((question) => {
      const testCases = testCasesOf(question) || [];
      const row = {
        question,
        cohort: cohortOf(question),
        domain: domainOf(question),
        family: familyOf(question),
        alignment: alignmentOf(question),
        referenceKind: referenceKind(question),
        starterKind: starterKind(question),
        testCases,
        validCourse: Boolean(question.valid_course),
        validTopicCourse: Boolean(question.valid_topic_course),
        flags: new Set(),
        oracleKnown: true,
        oracleAllMatch: true,
        oracleMismatchCount: 0,
        sampleOracleMatch: true,
      };

      addToMap(exactStatement, sha256(question.statement || ''), row);
      addToMap(canonicalStatement, sha256(canonicalize(question.statement || '')), row);
      addToMap(exactTests, sha256(JSON.stringify(testCases)), row);
      addToMap(exactTestsWithinLanguage, `${question.language}|${sha256(JSON.stringify(testCases))}`, row);
      addToMap(exactReference, sha256(question.reference_solution || ''), row);
      addToMap(canonicalReference, sha256(canonicalize(question.reference_solution || '')), row);
      addToMap(canonicalTaskAndTests, sha256(`${canonicalize(question.statement || '')}|${JSON.stringify(testCases)}`), row);
      return row;
    });

    const missingFields = {};
    const flagCounts = {};
    const flagExamples = {};
    const byLanguage = {};
    const byCohort = {};
    const byFamily = {};
    const byDifficulty = {};
    const byCohortLanguageFamily = {};
    const byAlignment = {};
    const byReferenceKind = {};
    const byStarterKind = {};

    const duplicateTestIdsWithinLanguage = new Set();
    for (const group of exactTestsWithinLanguage.values()) {
      if (group.length > 1) group.forEach((row) => duplicateTestIdsWithinLanguage.add(row.question.id));
    }
    const multiDifficultyIds = new Set();
    for (const group of canonicalTaskAndTests.values()) {
      if (group.length > 1 && new Set(group.map((row) => row.question.difficulty)).size > 1) {
        group.forEach((row) => multiDifficultyIds.add(row.question.id));
      }
    }

    for (const row of rows) {
      const q = row.question;
      const addFlag = (flag) => row.flags.add(flag);

      for (const field of ['language', 'course_id', 'topic_id', 'difficulty', 'title', 'statement', 'input_format', 'output_format', 'constraints', 'sample_input', 'sample_output', 'reference_solution', 'solution_explanation', 'hint_1', 'hint_2']) {
        if (!String(q[field] ?? '').trim()) {
          increment(missingFields, field);
          addFlag(`missing_${field}`);
        }
      }
      if (!starterOf(q).trim()) {
        increment(missingFields, 'starter_code_for_language');
        addFlag('missing_starter_code_for_language');
      }
      if (!testCasesOf(q)) addFlag('invalid_test_cases_json');
      if (row.testCases.length === 0) addFlag('no_test_cases');
      if (row.testCases.length < 3) addFlag('fewer_than_3_tests');
      if (row.testCases.some((tc) => tc == null || !Object.prototype.hasOwnProperty.call(tc, 'input') || !Object.prototype.hasOwnProperty.call(tc, 'expected_output'))) {
        addFlag('test_case_missing_input_or_expected_output');
      }
      if (row.testCases[0] && (normalizeOutput(q.sample_input) !== normalizeOutput(row.testCases[0].input) || normalizeOutput(q.sample_output) !== normalizeOutput(row.testCases[0].expected_output))) {
        addFlag('sample_differs_from_first_test');
      }
      if (q.language === 'sql' && /;\s*SELECT\s+department_id/i.test(q.sample_input || '')) addFlag('sample_contains_reference_query');
      if (q.language === 'sql' && sqlFixtureRecreatesTableWithoutDrop(row.testCases)) addFlag('sql_fixture_recreates_table_without_drop');
      if (!row.validCourse) addFlag('invalid_course_mapping');
      if (!row.validTopicCourse) addFlag('invalid_topic_course_mapping');
      if (row.referenceKind === 'prose-summary-in-code-skeleton' || row.referenceKind === 'prose-not-sql') addFlag('reference_not_executable_code');
      if (row.referenceKind === 'sql-query-missing-stated-threshold') addFlag('sql_reference_missing_average_threshold');
      if (q.language === 'sql' && row.family === 'string-token-transform') addFlag('sql_language_has_non_sql_string_task');
      if (row.alignment === 'partial') addFlag('domain_family_partial_alignment');
      if (row.alignment === 'mismatch') addFlag('domain_family_mismatch');
      if (row.starterKind === 'generic-select-records') addFlag('starter_not_task_specific');
      if (duplicateTestIdsWithinLanguage.has(q.id)) addFlag('duplicate_exact_tests_within_language');
      if (multiDifficultyIds.has(q.id)) addFlag('same_canonical_task_has_multiple_difficulties');
      if (/The optimal approach revolves around the core properties of/i.test(q.solution_explanation || '')) addFlag('generic_solution_explanation');

      for (const testCase of row.testCases) {
        const expected = oracleOutput(q, testCase.input);
        if (expected === null) {
          row.oracleKnown = false;
          row.oracleAllMatch = false;
        } else if (normalizeOutput(expected) !== normalizeOutput(testCase.expected_output)) {
          row.oracleAllMatch = false;
          row.oracleMismatchCount++;
        }
      }
      const sampleExpected = oracleOutput(q, q.sample_input);
      if (sampleExpected === null) {
        row.oracleKnown = false;
        row.sampleOracleMatch = false;
      } else if (normalizeOutput(sampleExpected) !== normalizeOutput(q.sample_output)) {
        row.sampleOracleMatch = false;
      }
      if (!row.oracleKnown) addFlag('oracle_unknown_family_or_input');
      if (row.oracleMismatchCount > 0) addFlag('expected_output_oracle_mismatch');
      if (!row.sampleOracleMatch) addFlag('sample_output_oracle_mismatch');

      row.deterministicExamReady = deterministicExamReady(row, duplicateTestIdsWithinLanguage.has(q.id));
      if (q.is_exam_eligible) addFlag('exam_eligible_generated');
      if (q.is_exam_eligible && !row.deterministicExamReady) addFlag('exam_eligible_but_not_exam_ready');

      increment(byLanguage, q.language);
      increment(byCohort, row.cohort);
      increment(byFamily, row.family);
      increment(byDifficulty, q.difficulty || '(missing)');
      increment(byAlignment, row.alignment);
      increment(byReferenceKind, row.referenceKind);
      increment(byStarterKind, row.starterKind);
      const nestedKey = `${row.cohort}|${q.language}|${row.family}`;
      byCohortLanguageFamily[nestedKey] ||= {
        total: 0,
        exam_eligible: 0,
        valid_topic_course: 0,
        oracle_all_match: 0,
        expected_output_mismatch: 0,
        sample_output_mismatch: 0,
        domain_direct: 0,
        domain_partial: 0,
        domain_mismatch: 0,
        reference_not_executable: 0,
      };
      const nested = byCohortLanguageFamily[nestedKey];
      nested.total++;
      if (q.is_exam_eligible) nested.exam_eligible++;
      if (row.validTopicCourse) nested.valid_topic_course++;
      if (row.oracleAllMatch) nested.oracle_all_match++;
      if (row.flags.has('expected_output_oracle_mismatch')) nested.expected_output_mismatch++;
      if (row.flags.has('sample_output_oracle_mismatch')) nested.sample_output_mismatch++;
      if (row.alignment === 'direct') nested.domain_direct++;
      if (row.alignment === 'partial') nested.domain_partial++;
      if (row.alignment === 'mismatch') nested.domain_mismatch++;
      if (row.flags.has('reference_not_executable_code')) nested.reference_not_executable++;

      for (const flag of row.flags) {
        increment(flagCounts, flag);
        flagExamples[flag] ||= [];
        if (flagExamples[flag].length < 10) flagExamples[flag].push(q.id);
      }
    }

    let executionResults = [];
    if (EXECUTE) {
      const sample = selectedSample(rows);
      console.log(`Deterministic audit: ${rows.length} generated rows.`);
      console.log(`Executing stratified sample: ${sample.length} rows (${SAMPLE_PER_STRATUM} per stratum).`);
      for (let i = 0; i < sample.length; i++) {
        const row = sample[i];
        const q = row.question;
        const starter = starterOf(q);
        const starterResult = starter ? await execute(q.language, starter, row.testCases) : { status: 'Missing starter', passed: null, total: row.testCases.length, detail: '' };
        const referenceResult = await execute(q.language, q.reference_solution, row.testCases);
        const executionOk = referenceResult.status === 'Accepted' && starterResult.status !== 'Accepted';
        executionResults.push({
          id: q.id,
          cohort: row.cohort,
          language: q.language,
          course_id: q.course_id,
          topic_id: q.topic_id,
          domain: row.domain,
          family: row.family,
          difficulty: q.difficulty,
          is_exam_eligible: q.is_exam_eligible,
          alignment: row.alignment,
          reference_kind: row.referenceKind,
          starter_kind: row.starterKind,
          oracle_all_match: row.oracleAllMatch,
          sample_oracle_match: row.sampleOracleMatch,
          starter_status: starterResult.status,
          starter_passed: starterResult.passed,
          reference_status: referenceResult.status,
          reference_passed: referenceResult.passed,
          test_count: row.testCases.length,
          execution_ok: executionOk,
          behaviorally_consistent: executionOk && row.oracleAllMatch && row.sampleOracleMatch,
          exam_ready_after_execution: executionOk && row.deterministicExamReady,
          flags: [...row.flags].sort(),
        });
        if ((i + 1) % 50 === 0 || i === sample.length - 1) console.log(`Executed ${i + 1}/${sample.length}`);
      }
    }

    const executionSummary = {
      sampled: executionResults.length,
      reference_statuses: {},
      starter_statuses: {},
      execution_ok: 0,
      behaviorally_consistent: 0,
      exam_ready_after_execution: 0,
      by_cohort_language_family: {},
    };
    for (const entry of executionResults) {
      increment(executionSummary.reference_statuses, entry.reference_status);
      increment(executionSummary.starter_statuses, entry.starter_status);
      if (entry.execution_ok) executionSummary.execution_ok++;
      if (entry.behaviorally_consistent) executionSummary.behaviorally_consistent++;
      if (entry.exam_ready_after_execution) executionSummary.exam_ready_after_execution++;
      const key = `${entry.cohort}|${entry.language}|${entry.family}`;
      executionSummary.by_cohort_language_family[key] ||= { sampled: 0, reference_accepted: 0, execution_ok: 0, behaviorally_consistent: 0 };
      const item = executionSummary.by_cohort_language_family[key];
      item.sampled++;
      if (entry.reference_status === 'Accepted') item.reference_accepted++;
      if (entry.execution_ok) item.execution_ok++;
      if (entry.behaviorally_consistent) item.behaviorally_consistent++;
    }

    const report = {
      generated_at: new Date().toISOString(),
      scope: {
        generated_rows: rows.length,
        execution_enabled: EXECUTE,
        sample_per_stratum: SAMPLE_PER_STRATUM,
        sql_execution_dialect: 'SQLite practice runner only; this is not PostgreSQL validation',
      },
      totals: {
        by_language: byLanguage,
        by_cohort: byCohort,
        by_family: byFamily,
        by_difficulty: byDifficulty,
        by_domain_alignment: byAlignment,
        by_reference_kind: byReferenceKind,
        by_starter_kind: byStarterKind,
        exam_eligible_generated: rows.filter((row) => row.question.is_exam_eligible).length,
        deterministic_exam_ready: rows.filter((row) => row.deterministicExamReady).length,
        exam_eligible_but_not_exam_ready: rows.filter((row) => row.question.is_exam_eligible && !row.deterministicExamReady).length,
        valid_course: rows.filter((row) => row.validCourse).length,
        valid_topic_course: rows.filter((row) => row.validTopicCourse).length,
        oracle_all_match: rows.filter((row) => row.oracleAllMatch).length,
        sample_oracle_match: rows.filter((row) => row.sampleOracleMatch).length,
      },
      missing_fields: missingFields,
      flags: flagCounts,
      flag_examples: flagExamples,
      duplicates: {
        exact_statement: duplicateStats(exactStatement),
        canonical_statement: duplicateStats(canonicalStatement),
        exact_tests: duplicateStats(exactTests),
        exact_tests_within_language: duplicateStats(exactTestsWithinLanguage),
        exact_reference: duplicateStats(exactReference),
        canonical_reference: duplicateStats(canonicalReference),
        canonical_task_and_tests: duplicateStats(canonicalTaskAndTests),
        canonical_task_rows_spanning_multiple_difficulties: multiDifficultyIds.size,
      },
      by_cohort_language_family: byCohortLanguageFamily,
      execution: executionSummary,
      execution_sample: executionResults,
      interpretation: [
        'Generated status is not evidence of correctness.',
        'A reference being executable is insufficient; oracle, domain, topic, difficulty, starter and duplicate checks must also pass before promotion.',
        'SQL execution results in this report are SQLite practice-runner results only.',
      ],
    };

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

    console.log(JSON.stringify({
      generated_rows: report.scope.generated_rows,
      exam_eligible_generated: report.totals.exam_eligible_generated,
      deterministic_exam_ready: report.totals.deterministic_exam_ready,
      exam_eligible_but_not_exam_ready: report.totals.exam_eligible_but_not_exam_ready,
      valid_topic_course: report.totals.valid_topic_course,
      oracle_all_match: report.totals.oracle_all_match,
      sampled: executionSummary.sampled,
      execution_ok: executionSummary.execution_ok,
      behaviorally_consistent: executionSummary.behaviorally_consistent,
      exam_ready_after_execution: executionSummary.exam_ready_after_execution,
      report: OUT,
    }, null, 2));

    if (report.totals.exam_eligible_but_not_exam_ready > 0) process.exitCode = 2;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
