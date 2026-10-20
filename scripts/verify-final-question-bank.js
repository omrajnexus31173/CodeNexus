'use strict';

/**
 * Final, non-mutating question-bank verification.
 *
 * This verifier deliberately distinguishes:
 *   - database counts and strict server-side exam eligibility;
 *   - structural completeness of every claimed tested question;
 *   - saved cohort execution reports; and
 *   - a fresh sequential execution of the reference and starter stored in
 *     the DB for every tested row.
 *
 * It never promotes, demotes, inserts, updates, or deletes a question. The
 * one default-value probe is performed inside a transaction that is always
 * rolled back.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { questionsData } = require('./seed-questions');

const EXECUTE_API = process.env.EXECUTE_API || 'http://127.0.0.1:3000/api/execute';
const NO_EXECUTE = process.argv.includes('--no-execute');
const OUT = path.join(__dirname, 'question-bank', 'final-question-bank-verification.json');

const SUPPORTED_COURSES = [
  'c-lang',
  'cpp',
  'python',
  'java',
  'javascript',
  'sql-databases',
  'dsa',
  'system-design',
];
const UNSUPPORTED_COURSES = {
  'html-css': 'No deterministic rendering grader is integrated.',
  'app-dev': 'No Dart/Flutter sandbox runtime is integrated.',
};
const PROGRESSION = { Easy: 'Beginner', Medium: 'Intermediate', Hard: 'Advanced' };
const HAND_IDS = new Set([
  'c-001',
  'c-002',
  'cpp-001',
  'java-001',
  'js-001',
  'py-001',
  'py-002',
  'py-003',
  'sql-001',
]);

const STRICT_POOL_WHERE = `
  q.is_exam_eligible = true
  AND q.validation_status = 'tested'
  AND q.mapping_status = 'mapped'
  AND q.practice_only = false
  AND EXISTS (
    SELECT 1 FROM course_topics t
    WHERE t.id = q.topic_id AND t.course_id = q.course_id
  )
  AND jsonb_typeof(q.test_cases) = 'array'
  AND jsonb_array_length(q.test_cases) >= 3
`;

function cohortOf(id) {
  if (HAND_IDS.has(id)) return 'hand-curated';
  if (id.startsWith('topic-')) return 'topic-linked';
  if (id.startsWith('core-')) return 'verified-core';
  return 'unknown-tested-cohort';
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function starterFor(question) {
  const raw = question.starter_code;
  if (!raw) return '';
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return String(parsed?.[question.language] || '');
    } catch {
      return raw;
    }
  }
  return String(raw[question.language] || '');
}

function normalizeCode(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeText(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').trim();
}

function readJson(relativePath) {
  const full = path.join(__dirname, relativePath);
  if (!fs.existsSync(full)) return { missing: true, path: relativePath };
  return { ...JSON.parse(fs.readFileSync(full, 'utf8')), __path: relativePath };
}

function increment(map, key) {
  map[key] = (map[key] || 0) + 1;
}

async function execute(language, code, testCases) {
  const response = await fetch(EXECUTE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, testCases }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Execute API returned ${response.status}`);
  return data;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');

  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();

  const report = {
    generated_at: new Date().toISOString(),
    mode: {
      execute_stored_references_and_starters: !NO_EXECUTE,
      database_mutations: 'none (default probe transaction is rolled back)',
    },
    database: {},
    taxonomy: {},
    approved_core: {},
    exam_pools: {},
    generated_corpus: {},
    defaults: {},
    preserved_ids: {},
    duplicates: {},
    failures: [],
  };

  try {
    const totals = (await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE validation_status='tested')::int AS tested,
        COUNT(*) FILTER (WHERE validation_status='generated')::int AS generated,
        COUNT(*) FILTER (WHERE validation_status='reviewed')::int AS reviewed,
        COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible,
        COUNT(*) FILTER (WHERE validation_status='tested' AND is_exam_eligible)::int AS tested_eligible,
        COUNT(*) FILTER (WHERE validation_status<>'tested' AND is_exam_eligible)::int AS non_tested_eligible,
        COUNT(*) FILTER (WHERE validation_status='generated' AND is_exam_eligible)::int AS generated_eligible
      FROM questions
    `)).rows[0];
    report.database.totals = totals;

    report.database.by_course_status_eligibility = (await client.query(`
      SELECT course_id, validation_status, is_exam_eligible, mapping_status,
             practice_only, generation_schema_version, taxonomy_version,
             COUNT(*)::int AS n
        FROM questions
       GROUP BY course_id, validation_status, is_exam_eligible, mapping_status,
                practice_only, generation_schema_version, taxonomy_version
       ORDER BY course_id, validation_status, is_exam_eligible,
                generation_schema_version
    `)).rows;

    report.database.by_language_status = (await client.query(`
      SELECT language, validation_status,
             COUNT(*)::int AS n,
             COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible
        FROM questions
       GROUP BY language, validation_status
       ORDER BY language, validation_status
    `)).rows;

    report.database.by_difficulty_status = (await client.query(`
      SELECT difficulty, validation_status,
             COUNT(*)::int AS n,
             COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible
        FROM questions
       GROUP BY difficulty, validation_status
       ORDER BY difficulty, validation_status
    `)).rows;

    const taxonomySummary = (await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM courses) AS courses,
        (SELECT COUNT(*)::int FROM course_topics) AS topics,
        (SELECT COUNT(*)::int FROM course_topics WHERE validation_status='tested') AS tested_topics,
        (SELECT COUNT(*)::int FROM course_topics WHERE validation_status='reviewed') AS reviewed_topics,
        COUNT(*) FILTER (WHERE mapping_status='mapped')::int AS mapped_questions,
        COUNT(*) FILTER (WHERE mapping_status='unassigned')::int AS unassigned_questions,
        COUNT(*) FILTER (
          WHERE mapping_status='mapped'
            AND NOT EXISTS (
              SELECT 1 FROM course_topics t
               WHERE t.id=questions.topic_id AND t.course_id=questions.course_id
            )
        )::int AS invalid_mapped_questions,
        COUNT(*) FILTER (
          WHERE mapping_status='unassigned'
            AND (topic_id IS NOT NULL OR validation_status<>'generated'
                 OR practice_only=false OR is_exam_eligible)
        )::int AS invalid_unassigned_questions,
        COUNT(*) FILTER (WHERE taxonomy_version<>'curriculum-129-v2')::int AS wrong_taxonomy_version
      FROM questions
    `)).rows[0];
    report.taxonomy = taxonomySummary;

    const courseRows = (await client.query('SELECT id, title FROM courses ORDER BY order_index, id')).rows;
    const strictPoolRows = (await client.query(`
      SELECT c.id AS course_id, c.title AS course_title,
             COUNT(q.id)::int AS strict_exam_pool
        FROM courses c
        LEFT JOIN questions q
          ON q.course_id=c.id AND ${STRICT_POOL_WHERE}
       GROUP BY c.id, c.title, c.order_index
       ORDER BY c.order_index, c.id
    `)).rows;

    report.exam_pools.criteria = [
      'course_id equals the requested course',
      "validation_status='tested'",
      'is_exam_eligible=true',
      "mapping_status='mapped'",
      'practice_only=false',
      'topic exists in course_topics with the same course_id',
      'test_cases is a JSON array with at least 3 cases',
      'course is in SUPPORTED_EXAM_COURSE_IDS',
      'strict pool is at least 25',
    ];
    report.exam_pools.by_course = strictPoolRows.map((row) => {
      const supported = SUPPORTED_COURSES.includes(row.course_id);
      const available = supported && row.strict_exam_pool >= 25;
      return {
        course_id: row.course_id,
        course_title: row.course_title,
        strict_exam_pool: row.strict_exam_pool,
        exam_supported: supported,
        exam_available: available,
        reason: available
          ? 'Supported deterministic sandbox course with at least 25 strict-pool questions.'
          : supported
            ? `Only ${row.strict_exam_pool} strict-pool questions; 25 are required.`
            : (UNSUPPORTED_COURSES[row.course_id] || 'Course is not configured as an exam-supported track.'),
      };
    });
    void courseRows;

    const testedRows = (await client.query(`
      SELECT q.*, t.title AS topic_title, t.course_id AS topic_course_id
        FROM questions q
        LEFT JOIN course_topics t ON t.id=q.topic_id
       WHERE q.validation_status='tested'
       ORDER BY q.course_id, q.topic_id, q.id
    `)).rows;

    const coreReport = readJson('question-bank/verified-core/validation-report.json');
    const topicReport = readJson('question-bank/topic-linked/validation-report.json');
    const curatedReport = readJson('question-bank/curated-starter-audit.json');
    const approvalReport = readJson('question-bank/verified-core/approval-report.json');

    const coreResults = new Map((coreReport.results || []).map((r) => [r.id, r]));
    const topicResults = new Map((topicReport.results || []).map((r) => [r.id, r]));
    const curatedResults = new Map((curatedReport.curated || curatedReport.results || []).map((r) => [r.id, r]));

    report.approved_core.saved_execution_reports = {
      verified_core: {
        path: 'scripts/question-bank/verified-core/validation-report.json',
        generated_at: coreReport.generated_at || null,
        candidate_count: coreReport.candidate_count ?? null,
        passed_count: coreReport.passed_count ?? null,
        failed_count: coreReport.failed_count ?? null,
      },
      topic_linked: {
        path: 'scripts/question-bank/topic-linked/validation-report.json',
        generated_at: topicReport.generated_at || null,
        total: topicReport.total ?? null,
        passed: topicReport.passed ?? null,
        failed: topicReport.failed ?? null,
      },
      hand_curated: {
        path: 'scripts/question-bank/curated-starter-audit.json',
        generated_at: curatedReport.generated_at || null,
        audited: curatedReport.curated_total ?? curatedReport.audited ?? (curatedReport.curated || curatedReport.results || []).length,
        ok: curatedReport.curated_summary?.ok ?? curatedReport.summary?.ok ?? null,
      },
      approval: {
        path: 'scripts/question-bank/verified-core/approval-report.json',
        generated_at: approvalReport.generated_at || null,
        approved: approvalReport.approved ?? null,
        approved_count: approvalReport.approved_count ?? null,
      },
    };

    const byCourse = {};
    const byCohort = {};
    const byGenerationVersion = {};
    const byTaxonomyVersion = {};
    const byCourseDifficulty = {};
    const byTopic = {};
    const signatureOwners = new Map();
    const statementOwners = new Map();
    const details = [];

    for (const q of testedRows) {
      const failures = [];
      const cohort = cohortOf(q.id);
      const tests = asArray(q.test_cases);
      const starter = starterFor(q);
      const progression = PROGRESSION[q.difficulty] || null;

      increment(byCohort, cohort);
      increment(byGenerationVersion, String(q.generation_schema_version));
      increment(byTaxonomyVersion, String(q.taxonomy_version));
      const courseKey = q.course_id;
      byCourse[courseKey] ||= { total: 0, ids: [] };
      byCourse[courseKey].total++;
      byCourse[courseKey].ids.push(q.id);
      byCourseDifficulty[courseKey] ||= { Easy: 0, Medium: 0, Hard: 0, Beginner: 0, Intermediate: 0, Advanced: 0, other: 0 };
      if (byCourseDifficulty[courseKey][q.difficulty] !== undefined) byCourseDifficulty[courseKey][q.difficulty]++;
      else byCourseDifficulty[courseKey].other++;
      if (progression) byCourseDifficulty[courseKey][progression]++;

      const topicKey = q.topic_id || '(unassigned)';
      byTopic[topicKey] ||= {
        topic_id: q.topic_id,
        topic_title: q.topic_title || null,
        course_id: q.course_id,
        topic_course_id: q.topic_course_id || null,
        count: 0,
        ids: [],
      };
      byTopic[topicKey].count++;
      byTopic[topicKey].ids.push(q.id);

      if (!SUPPORTED_COURSES.includes(q.course_id)) failures.push('tested row is in an unsupported exam course');
      if (q.mapping_status !== 'mapped') failures.push('mapping_status is not mapped');
      if (!q.topic_id || !q.topic_title) failures.push('missing linked curriculum topic');
      if (q.topic_course_id !== q.course_id) failures.push('linked topic belongs to another course');
      if (!q.is_exam_eligible) failures.push('tested row is not exam-eligible');
      if (q.practice_only !== false) failures.push('approved row is still practice_only');
      if (q.taxonomy_version !== 'curriculum-129-v2') failures.push('taxonomy_version is not curriculum-129-v2');
      if (!q.runtime) failures.push('missing runtime');
      if (!q.task_type) failures.push('missing task_type');
      if (!q.duplicate_signature) failures.push('missing duplicate_signature');
      if (!q.difficulty_rationale || q.difficulty_rationale.trim().length < 20) failures.push('missing/short difficulty_rationale');
      if (!q.input_contract || typeof q.input_contract !== 'object' || Array.isArray(q.input_contract) || Object.keys(q.input_contract).length === 0) {
        failures.push('missing input_contract');
      }
      if (!q.validation_evidence || q.validation_evidence.exam_ready !== true) failures.push('validation_evidence.exam_ready is not true');
      if (!progression) failures.push('difficulty does not map to a progression stage');

      if (!q.title || q.title.trim().length < 8) failures.push('missing/short title');
      if (!q.statement || q.statement.trim().length < 60) failures.push('missing/short statement');
      if (!q.input_format || q.input_format.trim().length < 10) failures.push('missing/short input_format');
      if (!q.output_format || q.output_format.trim().length < 10) failures.push('missing/short output_format');
      if (!q.constraints || q.constraints.trim().length < 8) failures.push('missing/short constraints');
      if (!q.solution_explanation || q.solution_explanation.trim().length < 30) failures.push('missing/short solution_explanation');
      if (!q.hint_1 || !q.hint_2 || q.hint_1.trim() === q.hint_2.trim()) failures.push('missing or duplicated hints');
      if (!q.expected_time_complexity || !q.expected_space_complexity) failures.push('missing expected complexity');
      if (!q.reference_solution || !q.reference_solution.trim()) failures.push('missing reference_solution');
      if (!starter.trim()) failures.push('missing starter for the row language');
      if (normalizeCode(starter) === normalizeCode(q.reference_solution)) failures.push('starter equals reference_solution');

      if (!tests) {
        failures.push('test_cases is not a JSON array');
      } else {
        if (tests.length < 3) failures.push('fewer than 3 test cases');
        const hidden = tests.filter((t) => t && t.is_hidden === true).length;
        if (hidden < 2) failures.push('fewer than 2 hidden test cases');
        const distinctInputs = new Set();
        const distinctOutputs = new Set();
        for (const [index, test] of tests.entries()) {
          if (!test || typeof test !== 'object') {
            failures.push(`test case ${index} is not an object`);
            continue;
          }
          if (!Object.prototype.hasOwnProperty.call(test, 'input')) failures.push(`test case ${index} has no input`);
          if (!Object.prototype.hasOwnProperty.call(test, 'expected_output')) failures.push(`test case ${index} has no expected_output`);
          distinctInputs.add(JSON.stringify(test.input ?? null));
          distinctOutputs.add(JSON.stringify(test.expected_output ?? null));
        }
        if (distinctInputs.size < 3) failures.push('fewer than 3 distinct test inputs');
        if (distinctOutputs.size < 2) failures.push('fewer than 2 distinct expected outputs');
        const sampleIsExecutedTest = tests.some((t) =>
          normalizeText(t.input) === normalizeText(q.sample_input) &&
          normalizeText(t.expected_output) === normalizeText(q.sample_output)
        );
        if (!sampleIsExecutedTest) failures.push('sample_input/sample_output is not one of the executed tests');
        q.__hidden_tests = hidden;
        q.__distinct_inputs = distinctInputs.size;
        q.__distinct_outputs = distinctOutputs.size;
        q.__sample_is_test = sampleIsExecutedTest;
      }

      if (q.duplicate_signature) {
        if (signatureOwners.has(q.duplicate_signature)) {
          failures.push(`duplicate_signature also used by ${signatureOwners.get(q.duplicate_signature)}`);
        } else {
          signatureOwners.set(q.duplicate_signature, q.id);
        }
      }
      const exactStatement = normalizeText(q.statement).toLowerCase();
      if (exactStatement) {
        if (statementOwners.has(exactStatement)) failures.push(`exact statement duplicates ${statementOwners.get(exactStatement)}`);
        else statementOwners.set(exactStatement, q.id);
      }

      let savedEvidence = null;
      if (cohort === 'verified-core') {
        const r = coreResults.get(q.id);
        savedEvidence = r ? {
          report: 'verified-core',
          passed: r.passed === true,
          reference_verdict: r.reference_verdict || r.reference_status || null,
          starter_verdict: r.starter_verdict || r.starter_status || null,
          hash_present: Boolean(r.hash),
        } : null;
        if (!r || r.passed !== true) failures.push('no passing saved verified-core execution result');
      } else if (cohort === 'topic-linked') {
        const r = topicResults.get(q.id);
        savedEvidence = r ? {
          report: 'topic-linked',
          passed: r.passed === true,
          reference_verdict: r.reference_verdict || r.reference_status || r.reference?.status || null,
          starter_verdict: r.starter_verdict || r.starter_status || r.starter?.status || null,
          hash_present: Boolean(r.hash),
        } : null;
        if (!r || r.passed !== true) failures.push('no passing saved topic-linked execution result');
      } else if (cohort === 'hand-curated') {
        const r = curatedResults.get(q.id);
        savedEvidence = r ? {
          report: 'curated-starter-audit',
          passed: r.classification === 'ok' || r.verdict === 'ok' || r.passed === true,
          reference_verdict: r.reference_status || r.reference_verdict || null,
          starter_verdict: r.starter_status || r.starter_verdict || null,
          hash_present: Boolean(r.hash),
        } : null;
        if (!r || !(r.classification === 'ok' || r.verdict === 'ok' || r.passed === true)) {
          failures.push('no passing saved curated execution audit result');
        }
      } else {
        failures.push('tested row belongs to no recognized individually validated cohort');
      }

      details.push({
        id: q.id,
        cohort,
        course_id: q.course_id,
        topic_id: q.topic_id,
        topic_title: q.topic_title,
        language: q.language,
        runtime: q.runtime,
        task_type: q.task_type,
        difficulty: q.difficulty,
        progression,
        generation_schema_version: q.generation_schema_version,
        taxonomy_version: q.taxonomy_version,
        title: q.title,
        statement_chars: q.statement?.length || 0,
        input_contract: q.input_contract,
        tests: tests?.length || 0,
        hidden_tests: q.__hidden_tests || 0,
        distinct_inputs: q.__distinct_inputs || 0,
        distinct_expected_outputs: q.__distinct_outputs || 0,
        sample_is_executed_test: Boolean(q.__sample_is_test),
        explanation_chars: q.solution_explanation?.length || 0,
        hints_present: Boolean(q.hint_1 && q.hint_2),
        validation_evidence_exam_ready: q.validation_evidence?.exam_ready === true,
        saved_execution_evidence: savedEvidence,
        structural_failures: failures,
        fresh_execution: NO_EXECUTE ? null : { reference: null, starter: null },
        passed: false,
      });
    }

    report.approved_core.count = details.length;
    report.approved_core.by_course = byCourse;
    report.approved_core.by_cohort = byCohort;
    report.approved_core.by_generation_schema_version = byGenerationVersion;
    report.approved_core.by_taxonomy_version = byTaxonomyVersion;
    report.approved_core.by_course_difficulty_progression = byCourseDifficulty;
    report.approved_core.by_topic = Object.values(byTopic).sort((a, b) =>
      String(a.course_id).localeCompare(String(b.course_id)) ||
      String(a.topic_id).localeCompare(String(b.topic_id))
    );
    report.approved_core.distinct_topics = report.approved_core.by_topic.filter((t) => t.topic_id).length;
    report.approved_core.questions = details;

    if (!NO_EXECUTE) {
      let completed = 0;
      for (const [index, q] of testedRows.entries()) {
        const detail = details[index];
        const tests = asArray(q.test_cases) || [];
        try {
          const ref = await execute(q.language, q.reference_solution, tests);
          detail.fresh_execution.reference = {
            status: ref.status || null,
            passed: ref.status === 'Accepted',
            stderr_excerpt: ref.status === 'Accepted' ? null : String(ref.stderr || '').slice(0, 800),
          };
          if (ref.status !== 'Accepted') detail.structural_failures.push(`fresh DB reference execution returned ${ref.status}`);
        } catch (error) {
          detail.fresh_execution.reference = { status: `ERROR: ${error.message}`, passed: false };
          detail.structural_failures.push(`fresh DB reference execution error: ${error.message}`);
        }
        completed++;

        try {
          const starterResult = await execute(q.language, starterFor(q), tests);
          detail.fresh_execution.starter = {
            status: starterResult.status || null,
            passed: starterResult.status === 'Wrong Answer',
            stderr_excerpt: starterResult.status === 'Wrong Answer' ? null : String(starterResult.stderr || '').slice(0, 800),
          };
          if (starterResult.status !== 'Wrong Answer') {
            detail.structural_failures.push(`fresh DB starter execution returned ${starterResult.status}, expected Wrong Answer`);
          }
        } catch (error) {
          detail.fresh_execution.starter = { status: `ERROR: ${error.message}`, passed: false };
          detail.structural_failures.push(`fresh DB starter execution error: ${error.message}`);
        }
        completed++;

        if (completed % 50 === 0 || index === testedRows.length - 1) {
          console.log(`Fresh DB executions completed: ${completed}/${testedRows.length * 2}`);
        }
      }
    }

    let passedCore = 0;
    for (const detail of details) {
      detail.passed = detail.structural_failures.length === 0 &&
        (NO_EXECUTE || (detail.fresh_execution.reference?.passed && detail.fresh_execution.starter?.passed));
      if (detail.passed) passedCore++;
      else report.failures.push({ id: detail.id, course_id: detail.course_id, failures: detail.structural_failures });
    }
    report.approved_core.fresh_passed = passedCore;
    report.approved_core.fresh_failed = details.length - passedCore;

    const generatedSummary = (await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible,
        COUNT(*) FILTER (WHERE mapping_status='unassigned' AND topic_id IS NULL)::int AS unassigned_null_topic,
        COUNT(*) FILTER (WHERE practice_only)::int AS practice_only,
        COUNT(*) FILTER (WHERE generation_schema_version=1)::int AS generation_schema_v1,
        COUNT(*) FILTER (WHERE taxonomy_version='curriculum-129-v2')::int AS taxonomy_v2,
        COUNT(*) FILTER (WHERE jsonb_typeof(test_cases)='array' AND jsonb_array_length(test_cases)<3)::int AS fewer_than_3_tests
      FROM questions
      WHERE validation_status='generated'
    `)).rows[0];
    report.generated_corpus = {
      summary: generatedSummary,
      note: 'Oracle agreement, sampled execution, and the individually executed SQL phrases family are reported by audit-generated-questions.js and validate-sql-string-contracts.js; none of those results promotes generated rows.',
      by_course: (await client.query(`
        SELECT course_id, COUNT(*)::int AS n,
               COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible
          FROM questions WHERE validation_status='generated'
         GROUP BY course_id ORDER BY course_id
      `)).rows,
      by_language: (await client.query(`
        SELECT language, COUNT(*)::int AS n,
               COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible
          FROM questions WHERE validation_status='generated'
         GROUP BY language ORDER BY language
      `)).rows,
      by_difficulty: (await client.query(`
        SELECT difficulty, COUNT(*)::int AS n
          FROM questions WHERE validation_status='generated'
         GROUP BY difficulty ORDER BY difficulty
      `)).rows,
      by_task_type: (await client.query(`
        SELECT task_type, difficulty, COUNT(*)::int AS n
          FROM questions WHERE validation_status='generated'
         GROUP BY task_type, difficulty ORDER BY task_type, difficulty
      `)).rows,
      sql_phrases_family: (await client.query(`
        SELECT COUNT(*)::int AS n,
               COUNT(*) FILTER (WHERE validation_status='generated')::int AS generated,
               COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible,
               COUNT(*) FILTER (WHERE mapping_status='unassigned' AND topic_id IS NULL AND practice_only)::int AS quarantined
          FROM questions
         WHERE language='sql'
           AND statement LIKE '%table phrases(id INTEGER, phrase TEXT)%'
      `)).rows[0],
    };

    const defaults = (await client.query(`
      SELECT column_name, column_default
        FROM information_schema.columns
       WHERE table_schema='public' AND table_name='questions'
         AND column_name IN ('validation_status','is_exam_eligible','mapping_status','practice_only','generation_schema_version')
       ORDER BY column_name
    `)).rows;
    report.defaults.columns = defaults;

    const probeClient = await pool.connect();
    try {
      await probeClient.query('BEGIN');
      const probe = (await probeClient.query(`
        INSERT INTO questions (
          id, language, course_id, title, statement, starter_code,
          reference_solution, solution_explanation, hint_1, hint_2, test_cases
        ) VALUES (
          'final-verification-default-probe', 'python', 'python',
          'Default probe', 'This row exists only inside a rolled-back verification transaction.',
          '{"python":"# probe"}'::jsonb, 'print(1)', 'Probe explanation.',
          'Probe hint one.', 'Probe hint two.',
          '[{"input":"","expected_output":"1","is_hidden":false}]'::jsonb
        )
        RETURNING validation_status, is_exam_eligible, mapping_status, practice_only,
                  generation_schema_version, topic_id
      `)).rows[0];
      report.defaults.rolled_back_insert_probe = probe;
      await probeClient.query('ROLLBACK');
    } finally {
      probeClient.release();
    }

    const originalIds = questionsData.map((q) => q.id);
    const preserved = (await client.query(
      'SELECT id FROM questions WHERE id = ANY($1::text[]) ORDER BY id',
      [originalIds]
    )).rows.map((r) => r.id);
    const preservedSet = new Set(preserved);
    report.preserved_ids = {
      source_seed_ids: originalIds.length,
      present_in_database: preserved.length,
      missing_ids: originalIds.filter((id) => !preservedSet.has(id)),
    };

    report.duplicates = {
      canonical_task_and_tests: (await client.query(`
        SELECT COUNT(*)::int AS duplicate_groups,
               COALESCE(SUM(n),0)::int AS rows_in_duplicate_groups
          FROM (
            SELECT duplicate_signature, COUNT(*)::int AS n
              FROM questions
             WHERE duplicate_signature IS NOT NULL
             GROUP BY duplicate_signature
            HAVING COUNT(*) > 1
          ) g
      `)).rows[0],
      exact_statement: (await client.query(`
        SELECT COUNT(*)::int AS duplicate_groups,
               COALESCE(SUM(n),0)::int AS rows_in_duplicate_groups
          FROM (
            SELECT statement, COUNT(*)::int AS n
              FROM questions
             GROUP BY statement
            HAVING COUNT(*) > 1
          ) g
      `)).rows[0],
      tested_pool_canonical: (await client.query(`
        SELECT COUNT(*)::int AS duplicate_groups,
               COALESCE(SUM(n),0)::int AS rows_in_duplicate_groups
          FROM (
            SELECT duplicate_signature, COUNT(*)::int AS n
              FROM questions
             WHERE validation_status='tested' AND duplicate_signature IS NOT NULL
             GROUP BY duplicate_signature
            HAVING COUNT(*) > 1
          ) g
      `)).rows[0],
      handling: 'All legacy rows are preserved. Generated duplicates remain unassigned, practice-only, and exam-ineligible. The tested pool must have zero duplicate signatures.',
    };

    const globalFailures = [];
    if (totals.total !== 18191) globalFailures.push(`expected total 18191, got ${totals.total}`);
    if (totals.tested !== 200) globalFailures.push(`expected tested 200, got ${totals.tested}`);
    if (totals.generated !== 17991) globalFailures.push(`expected generated 17991, got ${totals.generated}`);
    if (totals.non_tested_eligible !== 0) globalFailures.push(`non-tested eligible is ${totals.non_tested_eligible}`);
    if (totals.generated_eligible !== 0) globalFailures.push(`generated eligible is ${totals.generated_eligible}`);
    if (taxonomySummary.topics !== 129) globalFailures.push(`expected 129 topics, got ${taxonomySummary.topics}`);
    if (taxonomySummary.invalid_mapped_questions !== 0) globalFailures.push('invalid mapped questions exist');
    if (taxonomySummary.invalid_unassigned_questions !== 0) globalFailures.push('invalid unassigned questions exist');
    if (report.preserved_ids.present_in_database !== 141) globalFailures.push('not all 141 original curated IDs are present');
    if (report.duplicates.tested_pool_canonical.duplicate_groups !== 0) globalFailures.push('tested pool has canonical duplicates');
    for (const course of report.exam_pools.by_course) {
      if (SUPPORTED_COURSES.includes(course.course_id) && course.strict_exam_pool !== 25) {
        globalFailures.push(`${course.course_id} strict pool is ${course.strict_exam_pool}, expected 25 in the claimed final state`);
      }
      if (!SUPPORTED_COURSES.includes(course.course_id) && course.strict_exam_pool !== 0) {
        globalFailures.push(`${course.course_id} is unsupported but has a strict pool of ${course.strict_exam_pool}`);
      }
    }
    report.global_failures = globalFailures;
    report.passed = globalFailures.length === 0 && report.failures.length === 0;
  } finally {
    client.release();
    await pool.end();
  }

  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    passed: report.passed,
    total: report.database.totals?.total,
    tested: report.database.totals?.tested,
    generated: report.database.totals?.generated,
    eligible: report.database.totals?.eligible,
    approved_core_fresh_passed: report.approved_core?.fresh_passed,
    approved_core_fresh_failed: report.approved_core?.fresh_failed,
    global_failures: report.global_failures,
    report: OUT,
  }, null, 2));

  if (!report.passed) process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
