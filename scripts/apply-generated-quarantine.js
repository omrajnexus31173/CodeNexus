'use strict';

/**
 * Quarantines every non-tested question from graded exam pools.
 *
 * Policy applied by this script:
 *   - validation_status <> 'tested'  => is_exam_eligible = false
 *   - validation_status = 'tested'   => eligibility is left unchanged
 *
 * This is intentionally not a promotion script. Execution-tested topic
 * practice questions that were seeded as exam-ineligible remain ineligible
 * until a separate exam-pool review approves them. No question is deleted
 * and no status is changed.
 *
 * Usage:
 *   node scripts/apply-generated-quarantine.js --dry-run
 *   node scripts/apply-generated-quarantine.js
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DRY_RUN = process.argv.includes('--dry-run');
const OUT = path.join(__dirname, 'question-bank', 'generated-question-quarantine-report.json');
const HAND_CURATED_IDS = ['c-001', 'c-002', 'cpp-001', 'java-001', 'js-001', 'py-001', 'py-002', 'py-003', 'sql-001'];

async function snapshot(client) {
  const totals = await client.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE validation_status='generated')::int AS generated,
            COUNT(*) FILTER (WHERE validation_status='generated' AND is_exam_eligible)::int AS generated_eligible,
            COUNT(*) FILTER (WHERE validation_status<>'tested' AND is_exam_eligible)::int AS non_tested_eligible,
            COUNT(*) FILTER (WHERE validation_status='tested')::int AS tested,
            COUNT(*) FILTER (WHERE validation_status='tested' AND is_exam_eligible)::int AS tested_eligible
       FROM questions`
  );

  const pools = await client.query(
    `SELECT c.id AS course_id,
            COUNT(q.id) FILTER (
              WHERE q.validation_status='tested'
                AND q.is_exam_eligible
                AND jsonb_typeof(q.test_cases)='array'
                AND jsonb_array_length(q.test_cases)>0
            )::int AS eligible_tested_pool,
            COUNT(q.id) FILTER (WHERE q.validation_status='tested')::int AS tested_total,
            COUNT(q.id) FILTER (WHERE q.validation_status='generated' AND q.is_exam_eligible)::int AS generated_eligible
       FROM courses c
       LEFT JOIN questions q ON q.course_id=c.id
      GROUP BY c.id
      ORDER BY c.id`
  );

  const curated = await client.query(
    `SELECT COUNT(*)::int AS present
       FROM questions
      WHERE id = ANY($1::text[])
         OR id ~ '^(c|cpp|python|java|sql|javascript)-0(0[4-9]|1[0-9]|2[0-5])$'`,
    [HAND_CURATED_IDS]
  );

  return {
    ...totals.rows[0],
    original_curated_ids_present: curated.rows[0].present,
    pools_by_course: pools.rows,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const before = await snapshot(client);

    const generated = await client.query(
      `UPDATE questions
          SET is_exam_eligible=false
        WHERE validation_status='generated' AND is_exam_eligible
        RETURNING id`
    );
    const otherNonTested = await client.query(
      `UPDATE questions
          SET is_exam_eligible=false
        WHERE validation_status<>'tested' AND is_exam_eligible
        RETURNING id`
    );

    const after = await snapshot(client);

    if (after.total !== before.total) throw new Error(`Question count changed: ${before.total} -> ${after.total}`);
    if (after.generated !== before.generated) throw new Error('Generated count changed during quarantine.');
    if (after.tested !== before.tested) throw new Error('Tested count changed during quarantine.');
    if (after.original_curated_ids_present !== 141) throw new Error(`Original curated IDs present: ${after.original_curated_ids_present}, expected 141.`);
    if (after.non_tested_eligible !== 0) throw new Error(`Non-tested eligible rows remain: ${after.non_tested_eligible}`);
    if (after.generated_eligible !== 0) throw new Error(`Generated eligible rows remain: ${after.generated_eligible}`);

    const report = {
      generated_at: new Date().toISOString(),
      dry_run: DRY_RUN,
      generated_rows_quarantined_from_exams: generated.rowCount,
      other_non_tested_rows_quarantined_from_exams: otherNonTested.rowCount,
      before,
      after,
      note: 'Eligibility of tested rows was not changed. No records were deleted and no validation statuses were promoted.',
    };

    if (DRY_RUN) await client.query('ROLLBACK');
    else {
      await client.query('COMMIT');
      fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    }

    console.log(JSON.stringify(report, null, 2));
    if (!DRY_RUN) console.log(`Report: ${OUT}`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
