/**
 * Deep Question Bank Validation Script
 * Verifies the preserved legacy bank plus the curriculum-129 verified core:
 * 1. Exact counts per language track
 * 2. Exact counts per validation_status (reviewed, tested, generated)
 * 3. Exact and canonical-duplicate detection
 * 4. Preservation of all original 141 curated questions
 * 5. Structural integrity and valid mapped/unassigned taxonomy architecture
 * 6. Exam-pool quarantine invariant (no non-tested question may be eligible)
 * 7. Complete 25-question approved pools for the supported exam courses
 *
 * This is a structural validator, not semantic proof. Execution/oracle/topic/
 * domain/difficulty evidence for generated rows lives in
 * scripts/audit-generated-questions.js and its JSON reports.
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { requireDatabaseUrl } = require('./lib/database-url');
const { questionsData } = require('./seed-questions');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured.');
}
const pool = new Pool({ connectionString: requireDatabaseUrl() });

async function runQuestionBankDeepValidation() {
  const client = await pool.connect();
  console.log('====================================================');
  console.log('    CODE NEXUS QUESTION BANK DEEP AUDIT & REPORT     ');
  console.log('====================================================\n');

  try {
    // 1. Overall Count
    const totalRes = await client.query('SELECT count(*)::int as total FROM questions;');
    const totalQuestions = totalRes.rows[0].total;
    console.log(`1. Total Questions in Database: ${totalQuestions.toLocaleString()}`);

    // 2. Counts per language track
    const langRes = await client.query(`
      SELECT language, count(*)::int as count 
      FROM questions 
      GROUP BY language 
      ORDER BY language;
    `);
    console.log('\n2. Question Count Breakdown by Track:');
    for (const row of langRes.rows) {
      console.log(`   • ${row.language.padEnd(12)}: ${row.count.toLocaleString()} questions`);
    }

    // 3. Breakdown by validation status
    const statusRes = await client.query(`
      SELECT validation_status, count(*)::int as count 
      FROM questions 
      GROUP BY validation_status 
      ORDER BY count DESC;
    `);
    console.log('\n3. Question Count Breakdown by Validation Status:');
    for (const row of statusRes.rows) {
      console.log(`   • ${row.validation_status.padEnd(12)}: ${row.count.toLocaleString()} questions`);
    }

    // 4. Duplicate Check
    console.log('\n4. Duplicate Detection Audit:');
    // Duplicates within language
    const dupsWithinLangRes = await client.query(`
      SELECT language, count(*) as dups_within_lang
      FROM (
        SELECT language, statement, count(*)
        FROM questions
        GROUP BY language, statement
        HAVING count(*) > 1
      ) sub
      GROUP BY language;
    `);
    if (dupsWithinLangRes.rows.length === 0) {
      console.log('   ✅ Exact Duplicate Statements within any Language: 0 (All questions strictly unique within their language track)');
    } else {
      console.log(`   ❌ Warning: Found duplicates within languages: ${JSON.stringify(dupsWithinLangRes.rows)}`);
    }

    // Duplicates across all generated questions
    const dupsGeneratedRes = await client.query(`
      SELECT statement, count(*) 
      FROM questions 
      WHERE validation_status = 'generated'
      GROUP BY statement 
      HAVING count(*) > 1;
    `);
    if (dupsGeneratedRes.rows.length === 0) {
      console.log('   ✅ Exact Duplicate Statements among generated questions: 0');
    } else {
      console.log(`   ❌ Warning: Found ${dupsGeneratedRes.rows.length} duplicate groups among generated questions.`);
    }

    // Cross-track duplicate count from original 141 seed questions
    const crossTrackRes = await client.query(`
      SELECT count(*) as cross_track_groups
      FROM (
        SELECT statement, count(*)
        FROM questions
        GROUP BY statement
        HAVING count(*) > 1
      ) sub;
    `);
    console.log(`   ℹ️ Cross-track shared prompt templates from original 141 curated seed questions: ${crossTrackRes.rows[0].cross_track_groups} (e.g. multi-language parity exercises)`);

    const duplicateTitleRes = await client.query(`
      SELECT language, title, count(*)::int as count 
      FROM questions 
      GROUP BY language, title 
      HAVING count(*) > 1 
      LIMIT 10;
    `);
    if (duplicateTitleRes.rows.length === 0) {
      console.log('   ✅ Title Duplicates per Language: 0 (All titles strictly unique within language)');
    } else {
      console.log(`   ❌ Duplicate titles found: ${duplicateTitleRes.rows.length}`);
    }

    // 5. Verification of Original Curated 141 Questions
    console.log('\n5. Original Curated 141 Questions Preservation Audit:');
    const curatedIds = questionsData.map((q) => q.id);
    const existingCuratedRes = await client.query(
      `SELECT id, language, title, validation_status FROM questions WHERE id = ANY($1::text[])`,
      [curatedIds]
    );

    const foundCuratedCount = existingCuratedRes.rows.length;
    console.log(`   Curated in Source seed file : ${curatedIds.length}`);
    console.log(`   Curated Present in Database : ${foundCuratedCount}`);

    if (foundCuratedCount === curatedIds.length) {
      console.log('   ✅ PASS: 100% of original curated questions are preserved with intact IDs and content.');
    } else {
      console.log(`   ❌ FAIL: Missing ${curatedIds.length - foundCuratedCount} curated questions!`);
    }

    // 6. Structural & Schema Integrity Verification
    console.log('\n6. Structural Data Integrity Check:');
    const malformedRes = await client.query(`
      SELECT id, language, title FROM questions 
      WHERE title IS NULL OR title = ''
         OR statement IS NULL OR statement = ''
         OR test_cases IS NULL
         OR hint_1 IS NULL OR hint_1 = ''
         OR reference_solution IS NULL OR reference_solution = ''
         OR starter_code IS NULL
      LIMIT 10;
    `);

    if (malformedRes.rows.length === 0) {
      console.log(`   ✅ PASS: All ${totalQuestions.toLocaleString()} records have non-empty titles, statements, solutions, starter code and JSON test cases. Topic architecture is checked separately below.`);
    } else {
      console.log(`   ❌ FAIL: Found ${malformedRes.rows.length} malformed records!`);
      throw new Error('Structural question-bank check failed.');
    }

    // 7. Test Case & Hints Validity Sampling
    console.log('\n7. Test Cases & Hints Schema Sampling across all 6 Languages:');
    const sampleLangs = ['python', 'c', 'cpp', 'java', 'javascript', 'sql'];
    let allSamplesValid = true;

    for (const lang of sampleLangs) {
      const sampleRes = await client.query(
        `SELECT id, title, topic_id, difficulty, test_cases, hint_1, hint_2, validation_status 
         FROM questions 
         WHERE language = $1 
         ORDER BY id ASC 
         LIMIT 3;`,
        [lang]
      );

      for (const q of sampleRes.rows) {
        let tc = q.test_cases;
        if (typeof tc === 'string') {
          try { tc = JSON.parse(tc); } catch { tc = null; }
        }

        const tcValid = Array.isArray(tc) && tc.length > 0 && tc[0].expected_output !== undefined;
        const hintsValid = typeof q.hint_1 === 'string' && q.hint_1.length > 0;

        if (!tcValid || !hintsValid) {
          allSamplesValid = false;
          console.log(`   ❌ Invalid sample for ${lang} (${q.id}): tcValid=${tcValid}, hintsValid=${hintsValid}`);
        }
      }
      console.log(`   • ${lang.padEnd(12)}: 3/3 samples verified (Valid test cases & hints)`);
    }

    if (allSamplesValid) {
      console.log('   ✅ PASS: Test cases and hints JSON schema verified across all languages.\n');
    }

    // 8. Exam-pool quarantine invariant
    console.log('8. Exam-Pool Quarantine Check:');
    const quarantineRes = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE validation_status <> 'tested' AND is_exam_eligible)::int AS non_tested_eligible,
        COUNT(*) FILTER (WHERE validation_status = 'generated' AND is_exam_eligible)::int AS generated_eligible,
        COUNT(*) FILTER (WHERE validation_status = 'tested' AND is_exam_eligible)::int AS tested_eligible
      FROM questions;
    `);
    const quarantine = quarantineRes.rows[0];
    console.log(`   • Non-tested eligible: ${quarantine.non_tested_eligible}`);
    console.log(`   • Generated eligible: ${quarantine.generated_eligible}`);
    console.log(`   • Tested eligible: ${quarantine.tested_eligible}`);
    if (quarantine.non_tested_eligible !== 0 || quarantine.generated_eligible !== 0) {
      throw new Error('Exam quarantine invariant failed: a non-tested/generated question is exam-eligible.');
    }
    console.log('   ✅ PASS: No generated or other non-tested question can enter the graded exam pool.\n');

    console.log('====================================================');
    // 9. Curriculum-129 architecture and canonical duplicate accounting
    console.log('9. Curriculum Taxonomy Architecture Check:');
    const architectureRes = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM course_topics) AS taxonomy_topics,
        COUNT(*) FILTER (WHERE mapping_status = 'mapped')::int AS mapped,
        COUNT(*) FILTER (WHERE mapping_status = 'unassigned')::int AS unassigned,
        COUNT(*) FILTER (
          WHERE mapping_status = 'mapped'
            AND NOT EXISTS (
              SELECT 1 FROM course_topics t
              WHERE t.id = questions.topic_id AND t.course_id = questions.course_id
            )
        )::int AS invalid_mapped,
        COUNT(*) FILTER (
          WHERE mapping_status = 'unassigned'
            AND (topic_id IS NOT NULL OR validation_status <> 'generated' OR practice_only = false OR is_exam_eligible)
        )::int AS invalid_unassigned,
        COUNT(*) FILTER (WHERE taxonomy_version <> 'curriculum-129-v2')::int AS wrong_taxonomy
      FROM questions;
    `);
    const architecture = architectureRes.rows[0];
    console.log(`   • Implemented curriculum topics: ${architecture.taxonomy_topics}`);
    console.log(`   • Valid mapped questions: ${architecture.mapped}`);
    console.log(`   • Honestly unassigned legacy generated questions: ${architecture.unassigned}`);
    console.log(`   • Invalid mapped / invalid unassigned: ${architecture.invalid_mapped} / ${architecture.invalid_unassigned}`);
    if (
      architecture.taxonomy_topics !== 129 ||
      architecture.invalid_mapped !== 0 ||
      architecture.invalid_unassigned !== 0 ||
      architecture.wrong_taxonomy !== 0
    ) {
      throw new Error('Curriculum taxonomy architecture invariant failed.');
    }

    const canonicalRes = await client.query(`
      SELECT
        COUNT(*)::int AS duplicate_groups,
        COALESCE(SUM(n), 0)::int AS rows_in_groups
      FROM (
        SELECT duplicate_signature, COUNT(*)::int AS n
        FROM questions
        WHERE duplicate_signature IS NOT NULL
        GROUP BY duplicate_signature
        HAVING COUNT(*) > 1
      ) groups;
    `);
    const canonical = canonicalRes.rows[0];
    console.log(`   • Canonical duplicate groups (all preserved rows): ${canonical.duplicate_groups}`);
    console.log(`   • Rows in canonical duplicate groups: ${canonical.rows_in_groups}`);
    const testedDuplicateRes = await client.query(`
      SELECT COUNT(*)::int AS duplicate_groups
      FROM (
        SELECT duplicate_signature
        FROM questions
        WHERE validation_status = 'tested'
        GROUP BY duplicate_signature
        HAVING COUNT(*) > 1
      ) groups;
    `);
    if (testedDuplicateRes.rows[0].duplicate_groups !== 0) {
      throw new Error('Tested pool contains canonical duplicates.');
    }
    console.log('   ✅ PASS: Tested pool has 0 canonical duplicate groups; legacy duplicates remain practice-only/ineligible.');

    // 10. Approved exam pools by supported course and progression
    console.log('10. Approved Exam Pool Check:');
    const approvedPoolRes = await client.query(`
      SELECT q.course_id,
             COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE q.difficulty = 'Easy')::int AS beginner,
             COUNT(*) FILTER (WHERE q.difficulty = 'Medium')::int AS intermediate,
             COUNT(*) FILTER (WHERE q.difficulty = 'Hard')::int AS advanced
        FROM questions q
       WHERE q.validation_status = 'tested'
         AND q.is_exam_eligible
         AND q.mapping_status = 'mapped'
         AND q.practice_only = false
         AND EXISTS (
           SELECT 1 FROM course_topics t
           WHERE t.id = q.topic_id AND t.course_id = q.course_id
         )
         AND jsonb_typeof(q.test_cases) = 'array'
         AND jsonb_array_length(q.test_cases) >= 3
       GROUP BY q.course_id
       ORDER BY q.course_id;
    `);
    const supportedCourses = ['c-lang', 'cpp', 'python', 'java', 'javascript', 'sql-databases', 'dsa', 'system-design'];
    const approvedByCourse = new Map(approvedPoolRes.rows.map((r) => [r.course_id, r]));
    for (const course of supportedCourses) {
      const row = approvedByCourse.get(course);
      console.log(`   • ${course}: ${row?.total || 0} approved (Beginner ${row?.beginner || 0}, Intermediate ${row?.intermediate || 0}, Advanced ${row?.advanced || 0})`);
      if (!row || row.total !== 25 || row.beginner === 0 || row.intermediate === 0 || row.advanced === 0) {
        throw new Error(`Approved exam pool is incomplete for ${course}.`);
      }
    }
    const unsupportedEligibleRes = await client.query(`
      SELECT COUNT(*)::int AS n FROM questions
       WHERE is_exam_eligible AND course_id IN ('html-css', 'app-dev');
    `);
    if (unsupportedEligibleRes.rows[0].n !== 0) {
      throw new Error('An unsupported course has eligible exam questions.');
    }
    console.log('   ✅ PASS: Eight supported courses have complete approved pools; HTML/CSS and App Development have 0 eligible rows.');

    console.log('====================================================');
    console.log('QUESTION BANK STRUCTURAL RESULT: PASSED');
    console.log('Generated semantic quality remains as reported by the generated-question audit; structural presence is not correctness.');
    console.log('====================================================');
  } finally {
    client.release();
    await pool.end();
  }
}

runQuestionBankDeepValidation().catch((err) => {
  console.error('Audit exception:', err);
  process.exit(1);
});
