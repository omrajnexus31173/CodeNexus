'use strict';

/**
 * Execution audit of the nine pre-existing hand-curated tested questions,
 * excluding both topic-linked and verified-core additions (those have their
 * own dedicated execution validators and reports).
 *
 * For every curated question it executes BOTH the stored starter code and
 * the stored reference solution against the stored test cases through the
 * real /api/execute sandbox, in the question's own language.
 *
 * Classifications:
 *  - starter_leak   : starter is Accepted on every test (learner can submit
 *                     the untouched starter and pass).
 *  - reference_bad  : reference solution is NOT Accepted (wrong, error, or
 *                     not code at all).
 *  - ok             : reference Accepted, starter not Accepted.
 *
 * Usage: node scripts/audit-curated-starters.js [--generated-sample N]
 * Requires the app at CODE_NEXUS_URL (default http://127.0.0.1:3000).
 * Writes scripts/question-bank/curated-starter-audit.json.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const BASE_URL = (process.env.CODE_NEXUS_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = path.join(__dirname, 'question-bank', 'curated-starter-audit.json');
const sampleIdx = process.argv.indexOf('--generated-sample');
const GENERATED_SAMPLE = sampleIdx >= 0 ? Number(process.argv[sampleIdx + 1] || 0) : 0;

async function execute(language, code, testCases) {
  const r = await fetch(`${BASE_URL}/api/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ language, code, testCases }),
  });
  const j = await r.json();
  return j.status || `HTTP ${r.status}`;
}

async function auditRow(row) {
  const starter = row.starter_code?.[row.language];
  const entry = {
    id: row.id,
    language: row.language,
    validation_status: row.validation_status,
    starter_missing: !starter,
    starter_status: null,
    reference_status: null,
    classification: null,
  };
  if (starter) entry.starter_status = await execute(row.language, starter, row.test_cases);
  entry.reference_status = await execute(row.language, row.reference_solution, row.test_cases);
  if (entry.reference_status !== 'Accepted') entry.classification = 'reference_bad';
  else if (entry.starter_status === 'Accepted') entry.classification = 'starter_leak';
  else entry.classification = 'ok';
  return entry;
}

async function main() {
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  try {
    const curated = await pool.query(
      `SELECT id, language, validation_status, starter_code, reference_solution, test_cases
         FROM questions
        WHERE validation_status IN ('reviewed','tested')
          AND id NOT LIKE 'topic-%'
          AND id NOT LIKE 'core-%'
        ORDER BY id`
    );
    console.log(`Auditing ${curated.rows.length} curated questions...`);
    const results = [];
    for (let i = 0; i < curated.rows.length; i++) {
      const entry = await auditRow(curated.rows[i]);
      results.push(entry);
      process.stdout.write(`[${i + 1}/${curated.rows.length}] ${entry.id} starter=${entry.starter_status} ref=${entry.reference_status} -> ${entry.classification}\n`);
    }

    let generatedResults = [];
    if (GENERATED_SAMPLE > 0) {
      const gen = await pool.query(
        `SELECT id, language, validation_status, starter_code, reference_solution, test_cases
           FROM questions WHERE validation_status='generated'
          ORDER BY md5(id) LIMIT $1`,
        [GENERATED_SAMPLE]
      );
      console.log(`Auditing ${gen.rows.length} generated sample questions...`);
      for (let i = 0; i < gen.rows.length; i++) {
        const entry = await auditRow(gen.rows[i]);
        generatedResults.push(entry);
        process.stdout.write(`[gen ${i + 1}/${gen.rows.length}] ${entry.id} starter=${entry.starter_status} ref=${entry.reference_status} -> ${entry.classification}\n`);
      }
    }

    const summarize = (rows) => rows.reduce((acc, r) => {
      acc[r.classification] = (acc[r.classification] || 0) + 1;
      return acc;
    }, {});
    const report = {
      generated_at: new Date().toISOString(),
      curated_total: results.length,
      curated_summary: summarize(results),
      curated: results,
      generated_sample_total: generatedResults.length,
      generated_sample_summary: summarize(generatedResults),
      generated_sample: generatedResults,
    };
    fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    console.log('Curated summary:', report.curated_summary);
    if (generatedResults.length) console.log('Generated sample summary:', report.generated_sample_summary);
    console.log(`Report: ${OUT}`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
