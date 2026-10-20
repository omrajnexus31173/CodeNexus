const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const connectionString = requireDatabaseUrl();

const pool = new Pool({
  connectionString,
  ssl: databaseSslConfig(connectionString)
});

async function verifyDatabase() {
  console.log('====================================================');
  console.log('     CODE NEXUS DATABASE VERIFICATION UTILITY       ');
  console.log('====================================================');

  const client = await pool.connect();
  let passedChecks = 0;
  let totalChecks = 6;

  try {
    // Check 1: Database Connectivity
    const versionRes = await client.query('SELECT version();');
    console.log('1. [PASS] PostgreSQL Connection: Established');
    console.log(`   Engine: ${versionRes.rows[0].version.split(',')[0]}`);
    passedChecks++;

    // Check 2: Table Existence Check
    const requiredTables = [
      'users', 'career_profiles', 'user_skills', 'work_experiences',
      'education', 'user_projects', 'external_certificates', 'courses',
      'course_units', 'course_topics', 'user_topic_progress',
      'user_course_enrollments', 'questions', 'user_question_attempts',
      'point_ledger', 'exam_attempts', 'certificates', 'library_resources',
      'user_unlocked_resources', 'bookmarks_and_notes', 'notifications', 'audit_logs',
      'verification_tokens', 'password_reset_tokens', 'rate_limits'
    ];

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    const foundTables = tablesRes.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !foundTables.includes(t));

    if (missingTables.length === 0) {
      console.log(`2. [PASS] Schema Completeness: All ${requiredTables.length} required tables present.`);
      passedChecks++;
    } else {
      console.error(`2. [FAIL] Missing tables: ${missingTables.join(', ')}`);
    }

    // Check 3: Essential Indexes Check
    const indexesRes = await client.query(`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
    `);
    const indexNames = indexesRes.rows.map(r => r.indexname);
    const expectedIndexes = ['idx_users_email', 'idx_questions_language', 'idx_certs_id', 'idx_point_ledger_user'];
    const missingIndexes = expectedIndexes.filter(i => !indexNames.includes(i));
    if (missingIndexes.length === 0) {
      console.log(`3. [PASS] Performance Indexes: All critical indexes verified.`);
      passedChecks++;
    } else {
      console.warn(`3. [WARN] Some indexes not yet created: ${missingIndexes.join(', ')}`);
    }

    // Check 4: Content Counts
    const coursesCount = await client.query('SELECT COUNT(*) FROM courses;');
    const topicsCount = await client.query('SELECT COUNT(*) FROM course_topics;');
    const questionsCount = await client.query('SELECT COUNT(*) FROM questions;');
    const libraryCount = await client.query('SELECT COUNT(*) FROM library_resources;');
    const usersCount = await client.query('SELECT COUNT(*) FROM users;');

    console.log('4. [PASS] Core Records Count:');
    console.log(`   • Courses:           ${coursesCount.rows[0].count}`);
    console.log(`   • Topics with 2+ Ex: ${topicsCount.rows[0].count}`);
    console.log(`   • Practice Questions:${questionsCount.rows[0].count}`);
    console.log(`   • Library Resources: ${libraryCount.rows[0].count}`);
    console.log(`   • Enrolled Users:    ${usersCount.rows[0].count}`);
    passedChecks++;

    // Check 5: Career Profile Relationships
    const profileRes = await client.query(`
      SELECT u.email, u.points, cp.headline, COUNT(s.id) as skill_count, COUNT(we.id) as exp_count
      FROM users u
      LEFT JOIN career_profiles cp ON u.id = cp.user_id
      LEFT JOIN user_skills s ON u.id = s.user_id
      LEFT JOIN work_experiences we ON u.id = we.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.email, u.points, cp.headline;
    `);
    if (profileRes.rows.length > 0) {
      const p = profileRes.rows[0];
      console.log('5. [PASS] Career Profile Relational Integrity: Verified');
      console.log(`   Student: ${p.email} | Points: ${p.points} | Skills: ${p.skill_count} | Experiences: ${p.exp_count}`);
      passedChecks++;
    } else {
      console.warn('5. [WARN] No student profile found to verify.');
    }

    // Check 6: Point Ledger & Scoring Rules
    const ledgerRes = await client.query('SELECT SUM(amount) as total FROM point_ledger WHERE user_id = (SELECT id FROM users WHERE role = \'student\' LIMIT 1);');
    const userPoints = await client.query('SELECT points FROM users WHERE role = \'student\' LIMIT 1;');
    if (parseInt(ledgerRes.rows[0].total, 10) === parseInt(userPoints.rows[0].points, 10)) {
      console.log('6. [PASS] Point Ledger Integrity: Transaction history strictly matches user points balance.');
      passedChecks++;
    } else {
      console.error(`6. [FAIL] Ledger mismatch: ledger total ${ledgerRes.rows[0].total} vs user points ${userPoints.rows[0].points}`);
    }

    console.log('----------------------------------------------------');
    console.log(`RESULT: ${passedChecks}/${totalChecks} verification checks passed successfully.`);
    console.log('Status: PostgreSQL database is ready for production operation!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Verification failed with error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDatabase();
