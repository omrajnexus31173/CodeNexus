/**
 * Code Nexus — Learning Integrity Migration
 *
 * Adds:
 * - user_topic_quiz_attempts: server-scored, persisted lesson quiz results
 * - exam_sessions: server-issued, one-time exam question pools
 * - question-bank indexes used by topic filtering and exam selection
 * - fail-closed question defaults (generated + not exam-eligible)
 *
 * Idempotent. Usage: node scripts/migrate-learning-integrity.js
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { requireDatabaseUrl } = require('./lib/database-url');

const pool = new Pool({ connectionString: requireDatabaseUrl() });

async function migrateLearningIntegrity() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_topic_quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic_id VARCHAR(200) NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
        course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        answers JSONB NOT NULL DEFAULT '[]'::jsonb,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL DEFAULT 0,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        id UUID PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        question_pool JSONB NOT NULL,
        duration_seconds INTEGER NOT NULL DEFAULT 7200,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        submitted_at TIMESTAMP WITH TIME ZONE,
        attempt_id INTEGER REFERENCES exam_attempts(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      ALTER TABLE questions ALTER COLUMN is_exam_eligible SET DEFAULT FALSE;
      ALTER TABLE questions ALTER COLUMN validation_status SET DEFAULT 'generated';
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_topic_quiz_attempts_user
        ON user_topic_quiz_attempts(user_id, topic_id);
      CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_course
        ON exam_sessions(user_id, course_id, started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_questions_topic_id
        ON questions(topic_id);
      CREATE INDEX IF NOT EXISTS idx_questions_course_exam
        ON questions(course_id, is_exam_eligible, validation_status);
    `);

    await client.query('COMMIT');
    console.log('Learning-integrity migration completed: quiz attempts + exam sessions are ready.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Learning-integrity migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) migrateLearningIntegrity();
module.exports = { migrateLearningIntegrity };
