/**
 * Code Nexus — Comprehensive Educational Engine & Curriculum Verification Suite
 * Validates 14-section compliance, code runner sandbox integration, and DB data preservation.
 */

require('dotenv').config({ path: '.env' });
const { requireDatabaseUrl } = require('./lib/database-url');
const http = require('http');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
const pool = new Pool({ connectionString: requireDatabaseUrl() });

function postExecute(language, code) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ language, code });
    const req = http.request(
      'http://127.0.0.1:3000/api/execute',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ httpStatus: res.statusCode, ...JSON.parse(data) });
          } catch {
            resolve({ httpStatus: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('   CODE NEXUS — CURRICULUM ENGINE VERIFICATION SUITE           ');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 1: Database Schema & Migration Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Test Group 1: Educational Engine Schema & Indexes ---');
  const colRes = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'course_topics'
  `);
  const columns = new Set(colRes.rows.map(r => r.column_name));

  const mandatoryCols = [
    'learning_objectives', 'prerequisites', 'expected_outcomes',
    'formal_definition', 'content_simple_english', 'hinglish_explanation',
    'why_it_matters', 'syntax_guide',
    'code_example_1_code', 'code_example_2_code', 'code_example_3_code',
    'code_walkthrough', 'rules_and_restrictions', 'common_mistakes',
    'comparison_table', 'diagram_svg', 'practical_applications',
    'quiz_questions', 'key_takeaways', 'quick_revision_notes',
    'assignment_prompt', 'assignment_starter_code', 'assignment_solution',
    'validation_status', 'engine_version'
  ];

  for (const col of mandatoryCols) {
    assert(columns.has(col), `Schema column '${col}' exists in course_topics`);
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Track & Topic Coverage (All 10 Tracks)
  // -------------------------------------------------------------------------
  console.log('\n--- Test Group 2: Track Coverage & Inventory Verification ---');
  const courseRes = await pool.query(`
    SELECT c.id, c.title, count(t.id) as topic_count
    FROM courses c
    LEFT JOIN course_topics t ON c.id = t.course_id
    GROUP BY c.id, c.title
    ORDER BY c.id;
  `);

  assert(courseRes.rows.length === 10, 'All 10 learning tracks are present in database', `Found ${courseRes.rows.length}`);

  for (const c of courseRes.rows) {
    assert(parseInt(c.topic_count) >= 1, `Track '${c.id}' has populated educational topics`, `Count: ${c.topic_count}`);
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Strict 14-Section Completeness Audit
  // -------------------------------------------------------------------------
  console.log('\n--- Test Group 3: 14-Section Completeness Verification ---');
  const allTopicsRes = await pool.query(`
    SELECT * FROM course_topics ORDER BY course_id, order_index
  `);
  const topics = allTopicsRes.rows;

  let total14SectionPass = 0;
  for (const t of topics) {
    const hasObj = Array.isArray(t.learning_objectives) && t.learning_objectives.length > 0;
    const hasDef = typeof t.formal_definition === 'string' && t.formal_definition.trim().length > 0;
    const hasEnglish = typeof t.content_simple_english === 'string' && t.content_simple_english.trim().length > 0;
    const hasHinglish = typeof t.hinglish_explanation === 'string' && t.hinglish_explanation.trim().length > 0;
    const hasWhy = typeof t.why_it_matters === 'string' && t.why_it_matters.trim().length > 0;
    const hasSyntax = t.syntax_guide && typeof t.syntax_guide === 'object';
    const hasEx1 = typeof t.code_example_1_code === 'string' && t.code_example_1_code.trim().length > 0;
    const hasEx2 = typeof t.code_example_2_code === 'string' && t.code_example_2_code.trim().length > 0;
    const hasEx3 = typeof t.code_example_3_code === 'string' && t.code_example_3_code.trim().length > 0;
    const hasWalkthrough = t.code_walkthrough && Array.isArray(t.code_walkthrough.steps) && t.code_walkthrough.steps.length > 0;
    const hasRules = Array.isArray(t.rules_and_restrictions) && t.rules_and_restrictions.length > 0;
    const hasMistakes = Array.isArray(t.common_mistakes) && t.common_mistakes.length > 0;
    const hasTable = t.comparison_table && Array.isArray(t.comparison_table.rows) && t.comparison_table.rows.length > 0;
    const hasDiagram = typeof t.diagram_svg === 'string' && t.diagram_svg.includes('<svg');
    const hasApps = Array.isArray(t.practical_applications) && t.practical_applications.length > 0;
    const hasQuiz = Array.isArray(t.quiz_questions) && t.quiz_questions.length > 0;
    const hasNotes = typeof t.quick_revision_notes === 'string' && t.quick_revision_notes.trim().length > 0;
    const hasPractice = typeof t.assignment_prompt === 'string' && typeof t.assignment_solution === 'string';

    const is14Compliant = hasObj && hasDef && hasEnglish && hasHinglish && hasWhy &&
                          hasSyntax && hasEx1 && hasEx2 && hasEx3 && hasWalkthrough &&
                          hasRules && hasMistakes && hasTable && hasDiagram &&
                          hasApps && hasQuiz && hasNotes && hasPractice;

    if (is14Compliant) {
      total14SectionPass++;
    } else {
      console.warn(`    ⚠️ Topic '${t.id}' missing some mandatory 14-section fields.`);
    }
  }

  assert(total14SectionPass === topics.length, `All ${topics.length} topics meet the 14-Section Educational Standard (100%)`, `Passed: ${total14SectionPass}/${topics.length}`);

  // -------------------------------------------------------------------------
  // TEST GROUP 4: Sandbox Isolated Code Execution Test
  // -------------------------------------------------------------------------
  console.log('\n--- Test Group 4: Bubblewrap Container Code Execution Smoke Test ---');

  // Test C execution
  const cResult = await postExecute('c', '#include <stdio.h>\nint main(void){ printf("C_OK\\n"); return 0; }');
  assert(cResult.status === 'Accepted' && cResult.stdout.trim() === 'C_OK', 'C isolated code execution via bwrap container');

  // Test Python execution
  const pyResult = await postExecute('python', 'print("PY_OK")');
  assert(pyResult.status === 'Accepted' && pyResult.stdout.trim() === 'PY_OK', 'Python isolated code execution via bwrap container');

  // Test JavaScript execution
  const jsResult = await postExecute('javascript', 'console.log("JS_OK");');
  assert(jsResult.status === 'Accepted' && jsResult.stdout.trim() === 'JS_OK', 'JavaScript isolated code execution via bwrap container');

  // Test C++ execution
  const cppResult = await postExecute('cpp', '#include <iostream>\nint main(){ std::cout << "CPP_OK" << std::endl; return 0; }');
  assert(cppResult.status === 'Accepted' && cppResult.stdout.trim() === 'CPP_OK', 'C++ isolated code execution via bwrap container');

  // -------------------------------------------------------------------------
  // TEST GROUP 5: Existing Data Preservation Audit
  // -------------------------------------------------------------------------
  console.log('\n--- Test Group 5: Data Preservation & Integrity Audit ---');

  // Questions count
  const qCountRes = await pool.query('SELECT COUNT(*) as total FROM questions');
  const totalQuestions = parseInt(qCountRes.rows[0].total);
  assert(totalQuestions === 18191, 'Question Bank count = 18,000 originals + 79 topic-linked + 112 verified-core', `Count: ${totalQuestions}`);

  // Curated hand-written questions preserved and execution-tested.
  // (The 132 procedural rows were honestly relabelled 'generated' by the
  // starter-leak audit; no rows were deleted.)
  const curatedRes = await pool.query(
    "SELECT COUNT(*) as total FROM questions WHERE id IN ('py-001','py-002','py-003','c-001','c-002','cpp-001','java-001','js-001','sql-001') AND validation_status = 'tested'");
  assert(parseInt(curatedRes.rows[0].total) === 9, '9 hand-written curated questions present and tested', `Count: ${curatedRes.rows[0].total}`);

  // Seeded user preservation must not depend on how many throwaway users
  // other suites created earlier; verify the two actual seed accounts.
  const uCountRes = await pool.query(
    "SELECT COUNT(*)::int as total FROM users WHERE email IN ('admin@codenexus.dev', 'alex.dev@codenexus.io')"
  );
  assert(parseInt(uCountRes.rows[0].total) === 2, 'Seeded user accounts preserved', `Seeded count: ${uCountRes.rows[0].total}`);

  // Certificates count
  const certRes = await pool.query('SELECT COUNT(*) as total FROM certificates');
  assert(parseInt(certRes.rows[0].total) >= 1, 'Certificates table intact', `Count: ${certRes.rows[0].total}`);

  // Library resources preserved
  const libRes = await pool.query('SELECT COUNT(*) as total FROM library_resources');
  assert(parseInt(libRes.rows[0].total) >= 6, 'Library unlocks catalogue intact', `Count: ${libRes.rows[0].total}`);

  console.log('\n===============================================================');
  console.log(`   CURRICULUM ENGINE TESTS: ${passed} PASSED, ${failed} FAILED `);
  console.log('===============================================================');

  await pool.end();
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
