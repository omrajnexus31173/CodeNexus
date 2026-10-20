'use strict';

/**
 * Separate exam-approval step for the verified core.
 *
 * This is intentionally not part of seeding or execution validation. It
 * re-checks database rows against source definitions and the three execution
 * reports, then approves only complete 25-question pools for the eight
 * supported exam courses. Any failure aborts the whole approval transaction.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { all: coreDefinitions } = require('./question-bank/verified-core');
const topicDefinitions = require('./question-bank/topic-linked');
const {
  SUPPORTED_EXAM_COURSES,
  TAXONOMY_VERSION,
  DIFFICULTY_RUBRIC,
  topicFor,
  validateTopicCourse,
  difficultyRationale,
} = require('./question-bank/taxonomy');

const OUT = path.join(__dirname, 'question-bank', 'verified-core', 'approval-report.json');
const CORE_REPORT = path.join(__dirname, 'question-bank', 'verified-core', 'validation-report.json');
const TOPIC_REPORT = path.join(__dirname, 'question-bank', 'topic-linked', 'validation-report.json');
const CURATED_REPORT = path.join(__dirname, 'question-bank', 'curated-starter-audit.json');
const HAND_IDS = ['c-001', 'c-002', 'cpp-001', 'java-001', 'js-001', 'py-001', 'py-002', 'py-003', 'sql-001'];

function readJson(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing required evidence report: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function norm(value) { return String(value ?? '').replace(/\s+/g, ' ').trim(); }
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}
function sameJson(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
function sameSet(a, b) {
  const left = [...(a || [])].map(String).sort();
  const right = [...(b || [])].map(String).sort();
  return sameJson(left, right);
}

function compareSource(row, source, failures) {
  const fields = [
    'language', 'course_id', 'topic_id', 'difficulty', 'title', 'statement',
    'input_format', 'output_format', 'constraints', 'sample_input',
    'sample_output', 'reference_solution', 'solution_explanation',
    'hint_1', 'hint_2', 'expected_time_complexity', 'expected_space_complexity',
  ];
  for (const field of fields) {
    if (String(row[field] ?? '') !== String(source[field] ?? '')) failures.push(`DB/source mismatch: ${field}`);
  }
  if (!sameJson(row.starter_code, source.starter_code)) failures.push('DB/source mismatch: starter_code');
  if (!sameJson(row.test_cases, source.test_cases)) failures.push('DB/source mismatch: test_cases');
  if (!sameSet(row.tags, source.tags)) failures.push('DB/source mismatch: tags');
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');

  const coreReport = readJson(CORE_REPORT);
  const topicReport = readJson(TOPIC_REPORT);
  const curatedReport = readJson(CURATED_REPORT);
  if (coreReport.passed_count !== coreDefinitions.length) throw new Error('Verified-core report is not a full pass');
  if (topicReport.passed !== topicDefinitions.length || topicReport.failed !== 0) throw new Error('Topic-linked report is not a full pass');
  if (curatedReport.curated_total !== HAND_IDS.length || curatedReport.curated_summary?.ok !== HAND_IDS.length) {
    throw new Error('Curated starter report is not a full 9/9 pass');
  }

  const coreEvidence = new Map(coreReport.results.map((r) => [r.id, r]));
  const topicEvidence = new Map(topicReport.results.map((r) => [r.id, r]));
  const curatedEvidence = new Map(curatedReport.curated.map((r) => [r.id, r]));
  const sourceById = new Map();
  for (const q of [...coreDefinitions, ...topicDefinitions]) sourceById.set(q.id, q);

  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();
  try {
    const rows = (await client.query(
      `SELECT * FROM questions
        WHERE validation_status='tested' AND course_id = ANY($1::text[])
        ORDER BY course_id, id`,
      [SUPPORTED_EXAM_COURSES]
    )).rows;

    const failures = [];
    const byCourse = new Map(SUPPORTED_EXAM_COURSES.map((course) => [course, []]));
    const signatures = new Map();

    for (const row of rows) {
      const local = [];
      const topic = topicFor(row.topic_id);
      if (!byCourse.has(row.course_id)) local.push('unsupported course');
      else byCourse.get(row.course_id).push(row);
      if (!validateTopicCourse(row.topic_id, row.course_id) || row.mapping_status !== 'mapped') local.push('invalid or unassigned topic mapping');
      if (!topic?.exam_supported) local.push('course is not exam-supported');
      if (row.taxonomy_version !== TAXONOMY_VERSION) local.push('taxonomy version mismatch');
      if (!row.runtime) local.push('missing runtime');
      if (!row.task_type) local.push('missing task_type');
      if (!row.duplicate_signature) local.push('missing duplicate signature');
      if (signatures.has(row.duplicate_signature)) local.push(`duplicate signature also used by ${signatures.get(row.duplicate_signature)}`);
      signatures.set(row.duplicate_signature, row.id);

      const tests = Array.isArray(row.test_cases) ? row.test_cases : [];
      if (tests.length < 3) local.push('fewer than 3 tests');
      if (row.id.startsWith('core-') && tests.length < 4) local.push('verified-core rows require at least 4 tests');
      if (tests.filter((t) => t.is_hidden).length < 2) local.push('fewer than 2 hidden tests');
      if (!tests.some((t) => t.input === row.sample_input && t.expected_output === row.sample_output)) local.push('sample is not an executed test');
      if (!norm(row.solution_explanation)) local.push('missing explanation');
      if (!norm(row.hint_1) || !norm(row.hint_2)) local.push('missing hint');
      const starter = row.starter_code?.[row.language];
      if (!starter) local.push('missing starter for language');
      if (norm(starter) === norm(row.reference_solution)) local.push('starter equals reference');
      if (starter && norm(starter).includes(norm(row.reference_solution))) local.push('starter embeds reference solution');

      if (sourceById.has(row.id)) compareSource(row, sourceById.get(row.id), local);
      else if (!HAND_IDS.includes(row.id)) local.push('no reviewed source definition or hand-curated evidence cohort');

      if (row.id.startsWith('core-')) {
        const evidence = coreEvidence.get(row.id);
        if (!evidence?.passed || evidence.reference_verdict !== 'Accepted' || evidence.starter_verdict !== 'Wrong Answer') {
          local.push('missing verified-core execution evidence');
        }
        if (row.validation_evidence?.question_hash !== evidence?.hash) local.push('DB evidence hash does not match validation report');
      } else if (row.id.startsWith('topic-')) {
        const evidence = topicEvidence.get(row.id);
        if (!evidence?.passed || evidence.reference?.status !== 'Accepted' || evidence.starter?.status !== 'Wrong Answer') {
          local.push('missing topic-linked execution evidence');
        }
      } else if (HAND_IDS.includes(row.id)) {
        const evidence = curatedEvidence.get(row.id);
        if (!evidence || evidence.classification !== 'ok' || evidence.reference_status !== 'Accepted' || evidence.starter_status !== 'Wrong Answer') {
          local.push('missing curated DB execution evidence');
        }
      }

      if (local.length) failures.push({ id: row.id, course_id: row.course_id, failures: local });
    }

    for (const course of SUPPORTED_EXAM_COURSES) {
      const candidates = byCourse.get(course) || [];
      if (candidates.length !== 25) failures.push({ id: `pool:${course}`, course_id: course, failures: [`expected exactly 25 candidates, found ${candidates.length}`] });
      for (const difficulty of ['Easy', 'Medium', 'Hard']) {
        if (!candidates.some((q) => q.difficulty === difficulty)) {
          failures.push({ id: `pool:${course}:${difficulty}`, course_id: course, failures: [`no ${difficulty} candidate`] });
        }
      }
    }
    if (failures.length) {
      const report = { generated_at: new Date().toISOString(), approved: false, failures };
      fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
      console.error(JSON.stringify(report, null, 2));
      throw new Error(`Verified-core approval failed with ${failures.length} failure groups`);
    }

    await client.query('BEGIN');
    for (const row of rows) {
      const topic = topicFor(row.topic_id);
      const progression = DIFFICULTY_RUBRIC[row.difficulty].progression.toLowerCase();
      const tags = [...new Set([...(row.tags || []), progression])];
      const isCore = row.id.startsWith('core-');
      const rationale = isCore
        ? row.difficulty_rationale
        : difficultyRationale(
            row.difficulty,
            `Authored label reviewed for “${row.title}” in ${topic.title}; curriculum outcome: ${topic.expected_outcomes[0] || topic.title}. Expected time ${row.expected_time_complexity}, space ${row.expected_space_complexity}; ${row.test_cases.length} executed tests cover the stated behavior and edge cases.`
          );
      const contract = {
        ...(row.input_contract || {}),
        version: 2,
        kind: row.language === 'sql' ? 'sql_fixture_query' : 'stdin_stdout',
        dialect: row.language === 'sql' ? 'sqlite' : undefined,
        input: row.input_format,
        output: row.output_format,
        deterministic: true,
        test_count: row.test_cases.length,
        sample_is_executed_test: true,
        source_generation_schema_version: row.generation_schema_version,
      };
      const evidence = {
        ...(row.validation_evidence || {}),
        exam_ready: true,
        approved_at: new Date().toISOString(),
        approval_script: 'scripts/approve-verified-core.js',
        approval_criteria: [
          'exact curriculum topic/course mapping',
          'source-to-database content match where a reviewed source exists',
          'reference Accepted and starter Wrong Answer in a dedicated execution report',
          'sample is an executed test',
          'at least two hidden tests',
          'unique canonical duplicate signature within the tested pool',
          'complete 25-question exact-course pool with Easy, Medium and Hard coverage',
        ],
        evidence_reports: {
          verified_core: isCore ? 'scripts/question-bank/verified-core/validation-report.json' : undefined,
          topic_linked: row.id.startsWith('topic-') ? 'scripts/question-bank/topic-linked/validation-report.json' : undefined,
          hand_curated: HAND_IDS.includes(row.id) ? 'scripts/question-bank/curated-starter-audit.json' : undefined,
        },
      };
      await client.query(
        `UPDATE questions
            SET tags=$2, difficulty_rationale=$3, input_contract=$4::jsonb,
                validation_evidence=$5::jsonb, practice_only=FALSE,
                is_exam_eligible=TRUE
          WHERE id=$1 AND validation_status='tested'`,
        [row.id, tags, rationale, JSON.stringify(contract), JSON.stringify(evidence)]
      );
    }

    const after = (await client.query(
      `SELECT course_id, COUNT(*)::int eligible
         FROM questions
        WHERE validation_status='tested' AND is_exam_eligible AND NOT practice_only
        GROUP BY course_id ORDER BY course_id`
    )).rows;
    const safety = (await client.query(
      `SELECT COUNT(*) FILTER (WHERE validation_status='generated' AND is_exam_eligible)::int generated_eligible,
              COUNT(*) FILTER (WHERE validation_status <> 'tested' AND is_exam_eligible)::int non_tested_eligible,
              COUNT(*)::int total
         FROM questions`
    )).rows[0];
    if (safety.generated_eligible !== 0 || safety.non_tested_eligible !== 0) {
      throw new Error('Approval would violate the non-tested exam quarantine');
    }
    for (const course of SUPPORTED_EXAM_COURSES) {
      if (after.find((r) => r.course_id === course)?.eligible !== 25) throw new Error(`Eligible pool mismatch for ${course}`);
    }

    await client.query('COMMIT');
    const report = {
      generated_at: new Date().toISOString(),
      approved: true,
      approved_count: rows.length,
      pools: Object.fromEntries(after.map((r) => [r.course_id, r.eligible])),
      safety,
      evidence_reports: {
        verified_core_generated_at: coreReport.generated_at,
        topic_linked_generated_at: topicReport.generated_at,
        hand_curated_generated_at: curatedReport.generated_at,
      },
    };
    fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
    console.log(`Report: ${OUT}`);
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
