/**
 * Code Nexus — Topic Coverage Report Generator
 * Audits every course_topics record against the 14-Section Educational
 * Standard, checks quiz/walkthrough integrity and duplicate content,
 * verifies question-bank linkage, and writes docs/TOPIC_COVERAGE_REPORT.md.
 * Exits non-zero if any published topic is incomplete or invalid.
 */

require('dotenv').config({ path: '.env' });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: requireDatabaseUrl(),
});

function missingSections(t) {
  const miss = [];
  const arr = (v) => Array.isArray(v) && v.length > 0;
  const txt = (v) => typeof v === 'string' && v.trim().length > 0;
  if (!arr(t.learning_objectives)) miss.push('1.learning_objectives');
  if (!txt(t.formal_definition)) miss.push('2.formal_definition');
  if (!txt(t.content_simple_english) || !txt(t.hinglish_explanation)) miss.push('3.explanations(en+hinglish)');
  if (!txt(t.why_it_matters) || !txt(t.when_to_use)) miss.push('4.why_it_matters/when_to_use');
  if (!t.syntax_guide || !t.syntax_guide.template) miss.push('5.syntax_guide');
  if (!txt(t.code_example_1_code) || !txt(t.code_example_2_code) || !txt(t.code_example_3_code)) miss.push('6.three_examples');
  if (!txt(t.code_example_1_output) || !txt(t.code_example_2_output) || !txt(t.code_example_3_output)) miss.push('6.expected_outputs');
  if (!t.code_walkthrough || !arr(t.code_walkthrough.steps)) miss.push('7.code_walkthrough');
  if (!arr(t.rules_and_restrictions)) miss.push('8.rules_and_restrictions');
  if (!arr(t.common_mistakes)) miss.push('9.common_mistakes');
  if (!t.comparison_table || !arr(t.comparison_table.rows)) miss.push('10.comparison_table');
  if (!txt(t.diagram_svg) || !t.diagram_svg.includes('<svg')) miss.push('11.diagram_svg');
  if (!arr(t.practical_applications)) miss.push('12.practical_applications');
  if (!arr(t.quiz_questions) || !txt(t.assignment_prompt) || !txt(t.assignment_solution)) miss.push('13.quiz+practice');
  if (!arr(t.key_takeaways) || !txt(t.quick_revision_notes)) miss.push('14.revision_notes');
  return miss;
}

async function main() {
  const { rows: courses } = await pool.query('SELECT id, title FROM courses ORDER BY order_index, id');
  const { rows: topics } = await pool.query(
    `SELECT t.* FROM course_topics t
     LEFT JOIN course_units u ON u.id = t.unit_id
     ORDER BY t.course_id, COALESCE(u.order_index, 0), t.order_index, t.id`
  );
  const { rows: qByCourse } = await pool.query(
    `SELECT course_id, validation_status, COUNT(*)::int c FROM questions GROUP BY course_id, validation_status ORDER BY course_id, validation_status`
  );
  const { rows: [qTotals] } = await pool.query(
    `SELECT COUNT(*)::int total,
            COUNT(*) FILTER (WHERE q.topic_id IS NULL)::int null_topic,
            COUNT(DISTINCT q.topic_id)::int distinct_topic_ids,
            COUNT(*) FILTER (
              WHERE q.mapping_status='unassigned'
                AND q.topic_id IS NULL
                AND q.validation_status='generated'
                AND q.practice_only
                AND NOT q.is_exam_eligible
            )::int valid_unassigned,
            COUNT(*) FILTER (
              WHERE (q.mapping_status='mapped' AND NOT EXISTS (
                      SELECT 1 FROM course_topics t
                       WHERE t.id=q.topic_id AND t.course_id=q.course_id
                    ))
                 OR (q.mapping_status='unassigned' AND NOT (
                      q.topic_id IS NULL
                      AND q.validation_status='generated'
                      AND q.practice_only
                      AND NOT q.is_exam_eligible
                    ))
                 OR q.mapping_status IS NULL
                 OR q.mapping_status NOT IN ('mapped','unassigned')
            )::int invalid_mapping
       FROM questions q`
  );
  const { rows: [orphans] } = await pool.query(
    `SELECT COUNT(*)::int c FROM questions q LEFT JOIN courses c ON c.id = q.course_id WHERE c.id IS NULL`
  );

  // Integrity checks beyond field presence
  const problems = [];
  const seenDefinition = new Map();
  const seenExample = new Map();
  for (const t of topics) {
    for (const q of t.quiz_questions || []) {
      if (!Array.isArray(q.options) || q.options.length < 2) problems.push(`${t.id}: quiz ${q.id} has <2 options`);
      if (typeof q.correct_index !== 'number' || q.correct_index < 0 || q.correct_index >= (q.options || []).length)
        problems.push(`${t.id}: quiz ${q.id} correct_index out of range`);
      if (!q.explanation || !String(q.explanation).trim()) problems.push(`${t.id}: quiz ${q.id} missing explanation`);
    }
    for (const m of t.common_mistakes || []) {
      if (!m.incorrect_code || !m.corrected_code) problems.push(`${t.id}: common_mistake '${m.title}' missing incorrect/corrected code`);
    }
    const defKey = (t.formal_definition || '').trim().toLowerCase();
    if (defKey && seenDefinition.has(defKey)) problems.push(`duplicate formal_definition: ${t.id} == ${seenDefinition.get(defKey)}`);
    seenDefinition.set(defKey, t.id);
    for (const col of ['code_example_1_code', 'code_example_2_code', 'code_example_3_code']) {
      const key = (t[col] || '').trim();
      if (key && seenExample.has(key)) problems.push(`duplicate example code: ${t.id}.${col} == ${seenExample.get(key)}`);
      seenExample.set(key, `${t.id}.${col}`);
    }
  }

  const perCourse = courses.map((c) => {
    const ts = topics.filter((t) => t.course_id === c.id);
    const complete = ts.filter((t) => missingSections(t).length === 0);
    return {
      ...c,
      total: ts.length,
      complete: complete.length,
      incomplete: ts.filter((t) => missingSections(t).length > 0)
        .map((t) => `${t.id} [${missingSections(t).join(', ')}]`),
      tested: ts.filter((t) => t.validation_status === 'tested').length,
      reviewed: ts.filter((t) => t.validation_status === 'reviewed').length,
      other: ts.filter((t) => !['tested', 'reviewed'].includes(t.validation_status)).length,
      topics: ts,
    };
  });

  const totalTopics = topics.length;
  const totalComplete = perCourse.reduce((s, c) => s + c.complete, 0);
  const totalTested = perCourse.reduce((s, c) => s + c.tested, 0);
  const totalReviewed = perCourse.reduce((s, c) => s + c.reviewed, 0);

  const lines = [];
  lines.push('# Code Nexus — Topic Coverage Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()} by \`node scripts/generate-coverage-report.js\``);
  lines.push('Standard: 14-Section Educational Content Engine v2.0 (3 progressive examples, walkthrough, rules, mistakes, comparison, SVG diagram, quiz, practice, revision).');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Learning tracks (courses): **${courses.length}**`);
  lines.push(`- Published topics: **${totalTopics}**`);
  lines.push(`- Topics complete against all 14 sections: **${totalComplete} / ${totalTopics}**`);
  lines.push(`- Topics execution-**tested** (examples really ran in the sandbox / PostgreSQL fixtures): **${totalTested}**`);
  lines.push(`- Topics **reviewed** (statically reviewed, not sandbox-executed: 11 browser-rendered HTML/CSS topics, 2 DOM/event JavaScript topics, 3 Flutter/Dart topics (no Dart runtime), and sql-indexes-explain (planner output is environment-dependent; its companion 12 SQL topics are PostgreSQL-fixture tested)): **${totalReviewed}**`);
  lines.push(`- Integrity problems (quiz ranges, duplicate definitions/examples, mistake pairs): **${problems.length}**`);
  lines.push('');
  lines.push('## Coverage by track');
  lines.push('');
  lines.push('| Track | Topics | Complete (14/14) | Tested | Reviewed | Incomplete topics |');
  lines.push('|---|---:|---:|---:|---:|---|');
  for (const c of perCourse) {
    lines.push(`| ${c.title} (\`${c.id}\`) | ${c.total} | ${c.complete} | ${c.tested} | ${c.reviewed} | ${c.incomplete.length ? c.incomplete.join('<br>') : '—'} |`);
  }
  lines.push('');
  lines.push('## Topic inventory');
  lines.push('');
  for (const c of perCourse) {
    lines.push(`### ${c.title} (\`${c.id}\`)`);
    lines.push('');
    lines.push('| # | Topic ID | Title | Status | Examples | Quizzes | Diagram |');
    lines.push('|---:|---|---|---|---:|---:|---|');
    c.topics.forEach((t, i) => {
      const ex = [t.code_example_1_code, t.code_example_2_code, t.code_example_3_code].filter((x) => x && x.trim()).length;
      lines.push(`| ${i + 1} | \`${t.id}\` | ${t.title} | ${t.validation_status} | ${ex}/3 | ${(t.quiz_questions || []).length} | ${t.diagram_svg ? 'SVG' : '—'} |`);
    });
    lines.push('');
  }
  lines.push('## Question-bank linkage');
  lines.push('');
  lines.push(`- Total questions: **${qTotals.total}**`);
  lines.push(`- Questions with NULL topic_id: **${qTotals.null_topic}**`);
  lines.push(`- Honestly unassigned generated/practice-only/ineligible questions: **${qTotals.valid_unassigned}**`);
  lines.push(`- Invalid mapped or invalid unassigned questions: **${qTotals.invalid_mapping}**`);
  lines.push(`- Distinct question topic_id values: **${qTotals.distinct_topic_ids}**`);
  lines.push(`- Questions whose course_id matches no real course: **${orphans.c}**`);
  lines.push('');
  lines.push('| Course | Validation status | Questions |');
  lines.push('|---|---|---:|');
  for (const r of qByCourse) lines.push(`| \`${r.course_id}\` | ${r.validation_status} | ${r.c} |`);
  lines.push('');
  lines.push('## Integrity problems');
  lines.push('');
  if (problems.length === 0) lines.push('None detected.');
  else problems.forEach((p) => lines.push(`- ${p}`));
  lines.push('');

  const outPath = path.join(__dirname, '..', 'docs', 'TOPIC_COVERAGE_REPORT.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n') + '\n');

  console.log(`Tracks: ${courses.length} | Topics: ${totalTopics} | Complete: ${totalComplete} | Tested: ${totalTested} | Reviewed: ${totalReviewed} | Problems: ${problems.length}`);
  for (const c of perCourse) {
    console.log(` - ${c.id.padEnd(16)} topics=${String(c.total).padStart(2)} complete=${c.complete} tested=${c.tested} reviewed=${c.reviewed}${c.incomplete.length ? ' INCOMPLETE: ' + c.incomplete.join('; ') : ''}`);
  }
  console.log(`Questions: ${qTotals.total} total, null_topic=${qTotals.null_topic}, valid_unassigned=${qTotals.valid_unassigned}, invalid_mapping=${qTotals.invalid_mapping}, orphan_course=${orphans.c}`);
  console.log(`Report written: ${outPath}`);

  await pool.end();
  // Generated rows may be honestly unassigned; only an invalid mapping state fails this report.
  const ok = totalComplete === totalTopics && problems.length === 0 && orphans.c === 0 && qTotals.invalid_mapping === 0;
  process.exit(ok ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await pool.end(); process.exit(1); });
