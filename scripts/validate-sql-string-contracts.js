'use strict';

/**
 * Executes every repaired SQL string-contract row in the real SQLite
 * practice sandbox. This validates behavior only; it never promotes the
 * generated rows or makes them exam-eligible.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const BASE_URL = (process.env.CODE_NEXUS_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = path.join(__dirname, 'question-bank', 'sql-string-contract-validation-report.json');

async function execute(code, testCases) {
  const response = await fetch(`${BASE_URL}/api/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ language: 'sql', code, testCases }),
  });
  return response.json();
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  try {
    const rows = (await pool.query(
      `SELECT id, starter_code, reference_solution, test_cases, validation_status, is_exam_eligible
         FROM questions
        WHERE language='sql'
          AND statement LIKE '%table phrases(id INTEGER, phrase TEXT)%'
        ORDER BY id`
    )).rows;

    const results = [];
    for (let i = 0; i < rows.length; i++) {
      const q = rows[i];
      const starter = typeof q.starter_code === 'string' ? JSON.parse(q.starter_code).sql : q.starter_code.sql;
      const reference = await execute(q.reference_solution, q.test_cases);
      const starterResult = await execute(starter, q.test_cases);
      const passed = reference.status === 'Accepted' && starterResult.status === 'Wrong Answer';
      results.push({
        id: q.id,
        reference_status: reference.status,
        starter_status: starterResult.status,
        passed,
        validation_status: q.validation_status,
        is_exam_eligible: q.is_exam_eligible,
      });
      if ((i + 1) % 50 === 0 || i === rows.length - 1) console.log(`Validated ${i + 1}/${rows.length}`);
    }

    const report = {
      generated_at: new Date().toISOString(),
      dialect: 'SQLite practice runner only',
      total: rows.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      results,
    };
    fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`SQL string-contract execution validation: ${report.passed}/${report.total} passed.`);
    console.log(`Report: ${OUT}`);
    if (report.failed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
