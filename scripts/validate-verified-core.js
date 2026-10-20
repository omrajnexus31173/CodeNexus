'use strict';

/**
 * Separate execution validation for verified-core candidates.
 * This script does not insert rows or change validation_status. A candidate
 * passes only when its reference is Accepted on every test and its starter
 * returns Wrong Answer (not a compile/runtime failure and not a pass).
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { all } = require('./question-bank/verified-core');

const API = process.env.EXECUTE_API || 'http://127.0.0.1:3000/api/execute';
const OUT = path.join(__dirname, 'question-bank', 'verified-core', 'validation-report.json');
const FILTER = (process.argv.find((arg) => arg.startsWith('--course=')) || '').split('=')[1];

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function questionHash(q) {
  const material = {
    id: q.id,
    language: q.language,
    course_id: q.course_id,
    topic_id: q.topic_id,
    difficulty: q.difficulty,
    title: q.title,
    statement: q.statement,
    input_format: q.input_format,
    output_format: q.output_format,
    constraints: q.constraints,
    starter_code: q.starter_code,
    reference_solution: q.reference_solution,
    solution_explanation: q.solution_explanation,
    hint_1: q.hint_1,
    hint_2: q.hint_2,
    test_cases: q.test_cases,
    expected_time_complexity: q.expected_time_complexity,
    expected_space_complexity: q.expected_space_complexity,
    tags: [...q.tags].sort(),
    task_type: q.task_type,
    runtime: q.runtime,
    input_contract: q.input_contract,
    difficulty_rationale: q.difficulty_rationale,
    taxonomy_version: q.taxonomy_version,
    generation_schema_version: q.generation_schema_version,
  };
  return crypto.createHash('sha256').update(JSON.stringify(stable(material))).digest('hex');
}

function canonicalStatement(value) {
  return String(value || '')
    .replace(/\[(?:Challenge )?[^\]]+\]/g, '[ID]')
    .replace(/-bank-\d+/g, '-bank-#')
    .replace(/\b\d+(?:\.\d+)?\b/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function duplicateSignature(q) {
  return crypto.createHash('sha256')
    .update(`${canonicalStatement(q.statement)}|${JSON.stringify(q.test_cases)}`)
    .digest('hex');
}

function norm(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function runCode(language, code, testCases) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, testCases }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Execute API returned ${response.status}`);
  return data;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const candidates = FILTER ? all.filter((q) => q.course_id === FILTER) : all;
  if (!candidates.length) throw new Error(`No candidates for course filter: ${FILTER}`);

  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  let existing = [];
  try {
    existing = (await pool.query('SELECT id, statement, test_cases FROM questions')).rows;
  } finally {
    await pool.end();
  }
  const existingExact = new Map();
  const existingCanonical = new Map();
  for (const row of existing) {
    const exact = norm(row.statement).toLowerCase();
    if (!existingExact.has(exact)) existingExact.set(exact, row.id);
    const tests = Array.isArray(row.test_cases) ? row.test_cases : JSON.parse(row.test_cases || '[]');
    const sig = duplicateSignature({ statement: row.statement, test_cases: tests });
    if (!existingCanonical.has(sig)) existingCanonical.set(sig, row.id);
  }

  const results = new Map();
  const jobs = [];
  for (const q of candidates) {
    const hash = questionHash(q);
    const sig = duplicateSignature(q);
    const staticFailures = [];
    if (norm(q.starter_code[q.language]) === norm(q.reference_solution)) staticFailures.push('starter equals reference');
    if (q.test_cases.length < 4) staticFailures.push('fewer than 4 tests');
    if (q.test_cases.filter((t) => t.is_hidden).length < 3) staticFailures.push('fewer than 3 hidden tests');
    if (q.sample_input !== q.test_cases[0].input || q.sample_output !== q.test_cases[0].expected_output) staticFailures.push('sample differs from first test');
    if (existingExact.has(norm(q.statement).toLowerCase())) staticFailures.push(`exact statement duplicates ${existingExact.get(norm(q.statement).toLowerCase())}`);
    if (existingCanonical.has(sig)) staticFailures.push(`canonical statement+tests duplicates ${existingCanonical.get(sig)}`);
    results.set(q.id, {
      id: q.id,
      course_id: q.course_id,
      topic_id: q.topic_id,
      difficulty: q.difficulty,
      language: q.language,
      tests: q.test_cases.length,
      hash,
      duplicate_signature: sig,
      static_failures: staticFailures,
      reference_verdict: null,
      starter_verdict: null,
      reference_details: null,
      starter_details: null,
      passed: false,
    });
    jobs.push({ q, kind: 'reference' }, { q, kind: 'starter' });
  }

  let cursor = 0;
  let completed = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const result = results.get(job.q.id);
      try {
        const code = job.kind === 'reference'
          ? job.q.reference_solution
          : job.q.starter_code[job.q.language];
        const data = await runCode(job.q.language, code, job.q.test_cases);
        const expectedStatus = job.kind === 'reference' ? 'Accepted' : 'Wrong Answer';
        const details = data.status === expectedStatus ? null : {
          status: data.status,
          stdout: String(data.stdout || '').slice(0, 1000),
          stderr: String(data.stderr || '').slice(0, 2000),
          failed_tests: (data.testCaseResults || []).filter((t) => !t.passed).slice(0, 3),
        };
        if (job.kind === 'reference') {
          result.reference_verdict = data.status;
          result.reference_details = details;
        } else {
          result.starter_verdict = data.status;
          result.starter_details = details;
        }
      } catch (error) {
        if (job.kind === 'reference') result.reference_verdict = `ERROR: ${error.message}`;
        else result.starter_verdict = `ERROR: ${error.message}`;
      }
      completed++;
      if (completed % 25 === 0 || completed === jobs.length) {
        console.log(`Executed ${completed}/${jobs.length} reference/starter submissions`);
      }
    }
  }
  // Sequential on purpose: parallel JVM/compiler launches in the local
  // sandbox can fail spuriously under memory/CPU limits.
  await worker();

  for (const q of candidates) {
    const result = results.get(q.id);
    result.passed = result.static_failures.length === 0
      && result.reference_verdict === 'Accepted'
      && result.starter_verdict === 'Wrong Answer';
  }

  const ordered = candidates.map((q) => results.get(q.id));
  const passed = ordered.filter((r) => r.passed);
  const byCourse = {};
  for (const r of ordered) {
    byCourse[r.course_id] ||= { candidates: 0, passed: 0 };
    byCourse[r.course_id].candidates++;
    if (r.passed) byCourse[r.course_id].passed++;
  }
  const report = {
    generated_at: new Date().toISOString(),
    api: API,
    candidate_count: ordered.length,
    passed_count: passed.length,
    failed_count: ordered.length - passed.length,
    by_course: byCourse,
    results: ordered,
  };
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Verified-core execution validation: ${passed.length}/${ordered.length} passed.`);
  console.log(`Report: ${OUT}`);
  if (report.failed_count) {
    for (const r of ordered.filter((x) => !x.passed)) {
      console.log(`FAIL ${r.id}: ref=${r.reference_verdict} starter=${r.starter_verdict} static=${r.static_failures.join('; ')}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
