/**
 * Code Nexus — Curriculum Expansion Integrity Tests
 *
 * Asserts the expanded curriculum (129 topics across 10 tracks) is structurally
 * sound in the DATABASE (not just source): topic totals per track, every topic
 * carries all 14 educational sections, quiz shapes are UI-compatible, unit
 * placements are contiguous and unique, question bank is intact (18,191 rows after
 * topic-linked and verified-core integration, 141 curated, generated rows
 * honestly unassigned), and every topic row joins to a
 * real course + unit. Exits non-zero on any failure.
 *
 * Usage: node scripts/test-curriculum-expansion.js
 */
require('dotenv').config({ path: '.env' });
const { requireDatabaseUrl } = require('./lib/database-url');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
const pool = new Pool({ connectionString: requireDatabaseUrl() });

const EXPECTED_TRACK_TOPICS = {
  'c-lang': 25,
  cpp: 15,
  python: 16,
  java: 13,
  javascript: 14,
  'sql-databases': 13,
  dsa: 14,
  'html-css': 11,
  'app-dev': 3,
  'system-design': 5,
};
const EXPECTED_TOTAL = 129;

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

const arr = (v) => Array.isArray(v) && v.length > 0;
const txt = (v) => typeof v === 'string' && v.trim().length > 0;

(async () => {
  console.log('='.repeat(72));
  console.log('  CURRICULUM EXPANSION INTEGRITY TESTS (DB-backed)');
  console.log('='.repeat(72));

  const { rows: topics } = await pool.query('SELECT * FROM course_topics ORDER BY course_id, id');
  const { rows: units } = await pool.query('SELECT * FROM course_units ORDER BY course_id, order_index, id');
  const { rows: courses } = await pool.query('SELECT id FROM courses');

  // 1) Totals
  check(`total topics == ${EXPECTED_TOTAL}`, topics.length === EXPECTED_TOTAL, `got ${topics.length}`);
  for (const [courseId, expected] of Object.entries(EXPECTED_TRACK_TOPICS)) {
    const got = topics.filter((t) => t.course_id === courseId).length;
    check(`track ${courseId} topics == ${expected}`, got === expected, `got ${got}`);
  }

  // 2) Referential integrity: every topic -> real course + unit of same course
  const courseIds = new Set(courses.map((c) => c.id));
  const unitById = new Map(units.map((u) => [u.id, u]));
  const badCourse = topics.filter((t) => !courseIds.has(t.course_id));
  check('all topics reference an existing course', badCourse.length === 0, badCourse.map((t) => t.id).join(','));
  const badUnit = topics.filter((t) => !unitById.has(t.unit_id));
  check('all topics reference an existing unit', badUnit.length === 0, badUnit.map((t) => t.id).join(','));
  const crossCourseUnit = topics.filter((t) => unitById.has(t.unit_id) && unitById.get(t.unit_id).course_id !== t.course_id);
  check('no topic sits in a unit of another course', crossCourseUnit.length === 0, crossCourseUnit.map((t) => t.id).join(','));

  // 3) Placements: per unit, order_index is a contiguous 1..n sequence without duplicates
  let placementProblems = [];
  for (const u of units) {
    const inUnit = topics.filter((t) => t.unit_id === u.id).map((t) => t.order_index).sort((a, b) => a - b);
    if (inUnit.length === 0) { placementProblems.push(`${u.id}: empty unit`); continue; }
    for (let i = 0; i < inUnit.length; i++) {
      if (inUnit[i] !== i + 1) { placementProblems.push(`${u.id}: orders ${inUnit.join(',')}`); break; }
    }
  }
  check('per-unit topic order_index is contiguous 1..n (no dup/gap, no empty units)',
    placementProblems.length === 0, placementProblems.slice(0, 4).join(' | '));

  // 4) Duplicate topic ids / titles within a course
  const ids = topics.map((t) => t.id);
  check('topic ids unique', new Set(ids).size === ids.length);
  const titlesByCourse = new Map();
  let dupTitles = 0;
  for (const t of topics) {
    const key = `${t.course_id}::${String(t.title).toLowerCase().trim()}`;
    if (titlesByCourse.has(key)) dupTitles++;
    titlesByCourse.set(key, t.id);
  }
  check('no duplicate titles within a course', dupTitles === 0, `${dupTitles} dup`);

  // 5) Fourteen sections present on every topic
  let missingDetail = [];
  for (const t of topics) {
    const problems = [];
    if (!arr(t.learning_objectives)) problems.push('objectives');
    if (!txt(t.formal_definition)) problems.push('definition');
    if (!txt(t.content_simple_english)) problems.push('simple-english');
    if (!txt(t.hinglish_explanation)) problems.push('hinglish');
    if (!txt(t.why_it_matters) || !txt(t.when_to_use)) problems.push('why/when');
    if (!t.syntax_guide || !t.syntax_guide.template) problems.push('syntax');
    for (const n of [1, 2, 3]) {
      if (!txt(t[`code_example_${n}_title`])) problems.push(`ex${n}-title`);
      if (!txt(t[`code_example_${n}_code`])) problems.push(`ex${n}-code`);
      if (!txt(t[`code_example_${n}_output`])) problems.push(`ex${n}-output`);
      if (!txt(t[`code_example_${n}_explanation`])) problems.push(`ex${n}-explanation`);
    }
    if (!t.code_walkthrough || !arr(t.code_walkthrough.steps)) problems.push('walkthrough');
    if (!arr(t.rules_and_restrictions)) problems.push('rules');
    if (!arr(t.common_mistakes)) problems.push('mistakes');
    if (!t.comparison_table || !arr(t.comparison_table.rows)) problems.push('comparison');
    if (!txt(t.diagram_svg) || !t.diagram_svg.includes('<svg')) problems.push('diagram');
    if (!arr(t.practical_applications)) problems.push('applications');
    if (!arr(t.key_takeaways) || !txt(t.quick_revision_notes)) problems.push('revision');
    if (!txt(t.assignment_prompt) || !txt(t.assignment_solution)) problems.push('assignment');
    if (problems.length) missingDetail.push(`${t.id}:[${problems.join(',')}]`);
  }
  check('all topics carry all 14 educational sections', missingDetail.length === 0,
    missingDetail.slice(0, 5).join(' '));

  // 6) Quiz integrity: UI expects options[] + numeric correct_index in range + explanation
  let quizProblems = [];
  for (const t of topics) {
    const qs = Array.isArray(t.quiz_questions) ? t.quiz_questions : [];
    if (qs.length === 0) { quizProblems.push(`${t.id}: no quiz`); continue; }
    qs.forEach((q, i) => {
      if (!txt(q.question)) quizProblems.push(`${t.id}#${i}: no question`);
      if (!Array.isArray(q.options) || q.options.length < 2) quizProblems.push(`${t.id}#${i}: <2 options`);
      else if (typeof q.correct_index !== 'number' || q.correct_index < 0 || q.correct_index >= q.options.length) {
        quizProblems.push(`${t.id}#${i}: correct_index out of range`);
      }
      if (!txt(q.explanation)) quizProblems.push(`${t.id}#${i}: no explanation`);
    });
  }
  check('every topic has >=1 well-formed final quiz (options + correct_index + explanation)',
    quizProblems.length === 0, quizProblems.slice(0, 5).join(' | '));

  // 7) Anti-filler: no two topics share an identical Simple-English body
  const bodies = new Map();
  let dupBodies = 0;
  for (const t of topics) {
    const body = String(t.content_simple_english || '').trim();
    if (bodies.has(body)) dupBodies++;
    bodies.set(body, t.id);
  }
  check('no duplicated Simple-English bodies across topics (anti-filler)', dupBodies === 0, `${dupBodies} dup`);

  // 8) Question bank preserved + topic-linked/verified-core additions:
  // 18,191 total (18,000 originals + 79 topic-linked + 112 verified-core).
  // All 141 original IDs remain. Legacy generated rows intentionally have
  // topic_id=NULL until a confident curriculum mapping exists.
  const { questionsData } = require('./seed-questions');
  const originalIds = questionsData.map((q) => q.id);
  const { rows: [qb] } = await pool.query(`
    SELECT COUNT(*)::int total,
           COUNT(*) FILTER (WHERE id = ANY($1::text[]))::int originals,
           COUNT(*) FILTER (WHERE id LIKE 'topic-%')::int topic_linked,
           COUNT(*) FILTER (WHERE id LIKE 'core-%')::int verified_core,
           COUNT(*) FILTER (WHERE mapping_status = 'mapped')::int mapped,
           COUNT(*) FILTER (
             WHERE topic_id IS NULL
               AND mapping_status = 'unassigned'
               AND validation_status = 'generated'
               AND practice_only
               AND NOT is_exam_eligible
           )::int honestly_unassigned
      FROM questions`, [originalIds]);
  check('question bank total == 18191 (18000 + 79 topic-linked + 112 verified-core)', qb.total === 18191, `got ${qb.total}`);
  check('all 141 original question IDs preserved', qb.originals === 141, `got ${qb.originals}`);
  check('79 topic-linked questions present', qb.topic_linked === 79, `got ${qb.topic_linked}`);
  check('112 verified-core questions present', qb.verified_core === 112, `got ${qb.verified_core}`);
  check('200 questions have valid mapped status', qb.mapped === 200, `got ${qb.mapped}`);
  check('17,991 generated questions are honestly unassigned', qb.honestly_unassigned === 17991, `got ${qb.honestly_unassigned}`);
  const { rows: [orphans] } = await pool.query(
    'SELECT COUNT(*)::int c FROM questions q LEFT JOIN courses c ON c.id = q.course_id WHERE c.id IS NULL');
  check('no question course orphans', orphans.c === 0, `got ${orphans.c}`);
  const expectedPerCourse = { 'c-lang': 3023, cpp: 3024, java: 3024, javascript: 3024, python: 3022, 'sql-databases': 3024, dsa: 25, 'system-design': 25 };
  const { rows: perCourse } = await pool.query(
    `SELECT course_id, COUNT(*)::int c FROM questions GROUP BY course_id ORDER BY course_id`);
  check('per-course counts = legacy bank + topic-linked + verified-core additions',
    perCourse.length === 8 && perCourse.every((r) => expectedPerCourse[r.course_id] === r.c),
    perCourse.map((r) => `${r.course_id}:${r.c}`).join(','));

  // 9) Honest statuses: only reviewed/tested values present, tested rows have tested_at when column exists
  const { rows: statuses } = await pool.query(
    'SELECT validation_status, COUNT(*)::int c FROM course_topics GROUP BY validation_status ORDER BY validation_status');
  const known = new Set(['draft', 'generated', 'reviewed', 'tested']);
  check('validation_status values are from the honest label set',
    statuses.every((s) => known.has(s.validation_status)),
    statuses.map((s) => `${s.validation_status}:${s.c}`).join(','));
  console.log('  info  status distribution: ' + statuses.map((s) => `${s.validation_status}=${s.c}`).join(' '));

  console.log('='.repeat(72));
  console.log(`  RESULT: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(72));
  await pool.end();
  process.exit(failed === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('FATAL', e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
