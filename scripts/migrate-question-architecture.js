'use strict';

/**
 * Adds the explicit v2 question-bank architecture fields.
 *
 * Existing content fields already held the statement, starter, reference,
 * tests, explanation and difficulty, but there was no reliable place to
 * record task type, runtime, structured input contract, topic-mapping
 * status, practice-only quarantine, duplicate signature, difficulty
 * rationale or validation evidence. This migration is idempotent and does
 * not change question content, statuses or eligibility.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const pool = new Pool({ connectionString: requireDatabaseUrl() });

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE questions
        ADD COLUMN IF NOT EXISTS task_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS runtime VARCHAR(160),
        ADD COLUMN IF NOT EXISTS input_contract JSONB NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS mapping_status VARCHAR(30) NOT NULL DEFAULT 'unassigned',
        ADD COLUMN IF NOT EXISTS practice_only BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS duplicate_signature TEXT,
        ADD COLUMN IF NOT EXISTS difficulty_rationale TEXT,
        ADD COLUMN IF NOT EXISTS validation_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS generation_schema_version INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS taxonomy_version VARCHAR(80);
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'questions_mapping_status_check'
        ) THEN
          ALTER TABLE questions
            ADD CONSTRAINT questions_mapping_status_check
            CHECK (mapping_status IN ('mapped', 'unassigned'));
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'questions_generation_schema_version_check'
        ) THEN
          ALTER TABLE questions
            ADD CONSTRAINT questions_generation_schema_version_check
            CHECK (generation_schema_version >= 1);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_mapping_topic
        ON questions(mapping_status, topic_id, course_id);
      CREATE INDEX IF NOT EXISTS idx_questions_verified_pool
        ON questions(course_id, validation_status, is_exam_eligible, practice_only, difficulty);
      CREATE INDEX IF NOT EXISTS idx_questions_duplicate_signature
        ON questions(duplicate_signature);
      CREATE INDEX IF NOT EXISTS idx_questions_task_type
        ON questions(task_type, language);
    `);

    await client.query('COMMIT');
    console.log('Question architecture migration completed: v2 metadata columns and indexes are ready.');
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
