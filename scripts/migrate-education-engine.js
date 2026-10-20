/**
 * Database Migration: Upgrade Course Topics to 14-Section Content Engine
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const pool = new Pool({
  connectionString: requireDatabaseUrl()
});

async function migrateEducationEngine() {
  const client = await pool.connect();
  console.log('====================================================');
  console.log('  MIGRATING CODE NEXUS DATABASE: CONTENT ENGINE     ');
  console.log('====================================================\n');

  try {
    await client.query('BEGIN');

    console.log('1. Adding 14-Section Educational Columns to course_topics...');
    await client.query(`
      ALTER TABLE course_topics 
        ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS expected_outcomes JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS formal_definition TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS hinglish_explanation TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS why_it_matters TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS when_to_use TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS syntax_guide JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS code_example_1_output TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS code_example_2_output TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS code_example_3_title VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS code_example_3_code TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS code_example_3_explanation TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS code_example_3_output TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS code_walkthrough JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS rules_and_restrictions JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS common_mistakes JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS comparison_table JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS diagram_svg TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS practical_applications JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS key_takeaways JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS quick_revision_notes TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50) DEFAULT 'reviewed',
        ADD COLUMN IF NOT EXISTS tested_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS engine_version VARCHAR(20) DEFAULT 'v2.0',
        ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);

    console.log('2. Creating Performance Indexes on educational content...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_topics_validation ON course_topics(validation_status);
      CREATE INDEX IF NOT EXISTS idx_course_topics_course_order ON course_topics(course_id, order_index);
    `);

    console.log('3. Repairing question-bank course linkage (legacy generated rows)...');
    // Older generator runs mapped JavaScript -> 'fullstack-js' and SQL -> 'sql',
    // which are not real courses.id values. Reconnect them to their tracks.
    await client.query(`UPDATE questions SET course_id = 'javascript' WHERE course_id = 'fullstack-js'`);
    await client.query(`UPDATE questions SET course_id = 'sql-databases' WHERE course_id = 'sql'`);

    console.log('4. Normalizing JavaScript lesson order (variables before async)...');
    await client.query(`UPDATE course_topics SET order_index = 1 WHERE id = 'js-variables-scope-coercion'`);
    await client.query(`UPDATE course_topics SET order_index = 2 WHERE id = 'js-async-promises'`);

    await client.query('COMMIT');
    console.log('✅ Schema migration for Complete Educational Content Engine completed successfully!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrateEducationEngine();
}

module.exports = { migrateEducationEngine };
