'use strict';

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const args = new Set(process.argv.slice(2));
const schemaOnly = args.has('--schema-only');
const requireExamBank = args.has('--require-exam-bank');
const allowedArgs = new Set(['--schema-only', '--require-exam-bank', '--help', '-h']);

if (args.has('--help') || args.has('-h')) {
  console.log(`Usage: node scripts/verify-db.js [--schema-only] [--require-exam-bank]

Default mode verifies connectivity, schema, indexes, core content counts,
referential integrity, and point-ledger consistency. --schema-only stops
after connectivity/schema/index checks. --require-exam-bank additionally
requires at least 25 strict-pool questions in each supported exam course.`);
  process.exit(0);
}

for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown option: ${arg}`);
    process.exit(2);
  }
}

if (schemaOnly && requireExamBank) {
  console.error('--schema-only and --require-exam-bank cannot be used together.');
  process.exit(2);
}

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || requireDatabaseUrl();
if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
  process.env.DATABASE_URL = connectionString;
  requireDatabaseUrl();
}

const pool = new Pool({
  connectionString,
  ssl: databaseSslConfig(connectionString),
});

const requiredTables = [
  'users',
  'career_profiles',
  'user_skills',
  'work_experiences',
  'education',
  'user_projects',
  'external_certificates',
  'courses',
  'course_units',
  'course_topics',
  'user_topic_progress',
  'user_topic_quiz_attempts',
  'user_course_enrollments',
  'questions',
  'user_question_attempts',
  'point_ledger',
  'exam_attempts',
  'exam_sessions',
  'certificates',
  'library_resources',
  'user_unlocked_resources',
  'bookmarks_and_notes',
  'notifications',
  'audit_logs',
  'verification_tokens',
  'password_reset_tokens',
  'rate_limits',
];

const supportedExamCourses = [
  'c-lang',
  'cpp',
  'python',
  'java',
  'javascript',
  'sql-databases',
  'dsa',
  'system-design',
];

function asInt(value) {
  return Number.parseInt(value, 10) || 0;
}

async function verifyDatabase() {
  console.log('====================================================');
  console.log('     CODE NEXUS DATABASE VERIFICATION UTILITY       ');
  console.log('====================================================');

  let client;
  let passedChecks = 0;
  let totalChecks = schemaOnly ? 3 : 6;
  if (requireExamBank) totalChecks += 1;

  const record = (passed, passMessage, failMessage) => {
    if (passed) {
      passedChecks += 1;
      console.log(passMessage);
    } else {
      console.error(failMessage);
    }
  };

  try {
    client = await pool.connect();

    const versionRes = await client.query('SELECT version() AS version;');
    record(
      true,
      `1. [PASS] PostgreSQL Connection: Established (${versionRes.rows[0].version.split(',')[0]})`,
      '1. [FAIL] PostgreSQL Connection: Failed'
    );

    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    const foundTables = new Set(tablesRes.rows.map((row) => row.table_name));
    const missingTables = requiredTables.filter((table) => !foundTables.has(table));
    record(
      missingTables.length === 0,
      `2. [PASS] Schema Completeness: All ${requiredTables.length} required tables present.`,
      `2. [FAIL] Missing tables: ${missingTables.join(', ')}`
    );

    const indexesRes = await client.query(`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
    `);
    const indexNames = new Set(indexesRes.rows.map((row) => row.indexname));
    const expectedIndexes = [
      'idx_users_email',
      'idx_questions_language',
      'idx_certs_id',
      'idx_point_ledger_user',
    ];
    const missingIndexes = expectedIndexes.filter((index) => !indexNames.has(index));
    record(
      missingIndexes.length === 0,
      '3. [PASS] Performance Indexes: All critical indexes verified.',
      `3. [FAIL] Missing critical indexes: ${missingIndexes.join(', ')}`
    );

    if (!schemaOnly) {
      const countsRes = await client.query(`
        SELECT
          (SELECT COUNT(*)::int FROM courses) AS courses,
          (SELECT COUNT(*)::int FROM course_topics) AS topics,
          (SELECT COUNT(*)::int FROM questions) AS questions,
          (SELECT COUNT(*)::int FROM library_resources) AS library,
          (SELECT COUNT(*)::int FROM users) AS users;
      `);
      const counts = countsRes.rows[0];
      console.log('4. Core Records Count:');
      console.log(`   - Courses:            ${counts.courses}`);
      console.log(`   - Topics:             ${counts.topics}`);
      console.log(`   - Practice Questions: ${counts.questions}`);
      console.log(`   - Library Resources:  ${counts.library}`);
      console.log(`   - Users:              ${counts.users}`);
      record(
        counts.courses >= 10 &&
          counts.topics >= 129 &&
          counts.questions >= 141 &&
          counts.library >= 1,
        '   [PASS] Core repository content is present.',
        '   [FAIL] Core content is incomplete; expected at least 10 courses, 129 topics, 141 questions, and 1 library resource.'
      );

      const orphansRes = await client.query(`
        SELECT
          (SELECT COUNT(*)::int FROM career_profiles cp
             LEFT JOIN users u ON u.id = cp.user_id WHERE u.id IS NULL) AS profiles,
          (SELECT COUNT(*)::int FROM user_skills s
             LEFT JOIN users u ON u.id = s.user_id WHERE u.id IS NULL) AS skills,
          (SELECT COUNT(*)::int FROM work_experiences we
             LEFT JOIN users u ON u.id = we.user_id WHERE u.id IS NULL) AS experiences,
          (SELECT COUNT(*)::int FROM point_ledger pl
             LEFT JOIN users u ON u.id = pl.user_id WHERE u.id IS NULL) AS ledger;
      `);
      const orphans = orphansRes.rows[0];
      const orphanTotal =
        orphans.profiles + orphans.skills + orphans.experiences + orphans.ledger;
      record(
        orphanTotal === 0,
        '5. [PASS] Career/ledger relational integrity: No orphan user-owned rows found.',
        `5. [FAIL] Orphan user-owned rows found: profiles=${orphans.profiles}, skills=${orphans.skills}, experiences=${orphans.experiences}, ledger=${orphans.ledger}`
      );

      const ledgerRes = await client.query(`
        SELECT COUNT(*)::int AS mismatches
        FROM users u
        WHERE EXISTS (SELECT 1 FROM point_ledger pl WHERE pl.user_id = u.id)
          AND u.points <> COALESCE((
            SELECT SUM(pl.amount)::int FROM point_ledger pl WHERE pl.user_id = u.id
          ), 0);
      `);
      const mismatches = asInt(ledgerRes.rows[0].mismatches);
      record(
        mismatches === 0,
        '6. [PASS] Point Ledger Integrity: Ledger-backed balances match user points.',
        `6. [FAIL] Point ledger mismatches for ${mismatches} user(s).`
      );
    }

    if (requireExamBank) {
      const poolsRes = await client.query(
        `
          SELECT c.id AS course_id, COUNT(q.id)::int AS strict_pool
          FROM courses c
          LEFT JOIN questions q
            ON q.course_id = c.id
           AND q.is_exam_eligible = true
           AND q.validation_status = 'tested'
           AND q.mapping_status = 'mapped'
           AND q.practice_only = false
           AND EXISTS (
             SELECT 1 FROM course_topics t
             WHERE t.id = q.topic_id AND t.course_id = q.course_id
           )
           AND jsonb_typeof(q.test_cases) = 'array'
           AND jsonb_array_length(q.test_cases) >= 3
          WHERE c.id = ANY($1::text[])
          GROUP BY c.id
          ORDER BY c.id;
        `,
        [supportedExamCourses]
      );
      const poolByCourse = new Map(
        poolsRes.rows.map((row) => [row.course_id, row.strict_pool])
      );
      const insufficient = supportedExamCourses.filter(
        (courseId) => (poolByCourse.get(courseId) || 0) < 25
      );
      console.log('7. Strict exam pools:');
      for (const courseId of supportedExamCourses) {
        console.log(`   - ${courseId}: ${poolByCourse.get(courseId) || 0}`);
      }
      record(
        insufficient.length === 0,
        '   [PASS] Every supported exam course has at least 25 strict-pool questions.',
        `   [FAIL] Supported courses below 25 strict-pool questions: ${insufficient.join(', ')}`
      );
    }

    console.log('----------------------------------------------------');
    console.log(`RESULT: ${passedChecks}/${totalChecks} verification checks passed.`);
    if (passedChecks !== totalChecks) {
      console.error('Status: Database verification FAILED.');
      process.exitCode = 1;
    } else if (schemaOnly) {
      console.log('Status: PostgreSQL schema is present; content was not checked.');
    } else {
      console.log('Status: PostgreSQL database checks passed.');
    }
    console.log('====================================================');
  } catch (err) {
    console.error('Verification failed:', err instanceof Error ? err.message : 'Unknown error');
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

verifyDatabase();
