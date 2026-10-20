'use strict';

/**
 * Inserts hash-matched verified-core candidates as validation_status='tested'
 * but deliberately leaves them practice-only and exam-ineligible. Exam
 * eligibility is a separate approval in approve-verified-core.js.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { all } = require('./question-bank/verified-core');

const REPORT = path.join(__dirname, 'question-bank', 'verified-core', 'validation-report.json');
const OUT = path.join(__dirname, 'question-bank', 'verified-core', 'seed-report.json');

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function questionHash(q) {
  const material = {
    id: q.id,
    language: q.language,
    course_id: q.course_id,
    topic_id: q.topic_id,
    difficulty: q.difficulty,
    title: q.title,
    statement: q.statement,
    input_format: q.input_format,
    output_format: q.output_format,
    constraints: q.constraints,
    starter_code: q.starter_code,
    reference_solution: q.reference_solution,
    solution_explanation: q.solution_explanation,
    hint_1: q.hint_1,
    hint_2: q.hint_2,
    test_cases: q.test_cases,
    expected_time_complexity: q.expected_time_complexity,
    expected_space_complexity: q.expected_space_complexity,
    tags: [...q.tags].sort(),
    task_type: q.task_type,
    runtime: q.runtime,
    input_contract: q.input_contract,
    difficulty_rationale: q.difficulty_rationale,
    taxonomy_version: q.taxonomy_version,
    generation_schema_version: q.generation_schema_version,
  };
  return crypto.createHash('sha256').update(JSON.stringify(stable(material))).digest('hex');
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  if (!fs.existsSync(REPORT)) throw new Error('Verified-core validation report is missing.');
  const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  if (report.candidate_count !== all.length || report.passed_count !== all.length) {
    throw new Error(`Validation report is not a full pass: ${report.passed_count}/${report.candidate_count}`);
  }
  const resultById = new Map(report.results.map((r) => [r.id, r]));

  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();
  try {
    const before = (await client.query(
      `SELECT COUNT(*)::int total,
              COUNT(*) FILTER (WHERE validation_status='generated')::int generated,
              COUNT(*) FILTER (WHERE validation_status='tested')::int tested
         FROM questions`
    )).rows[0];

    await client.query('BEGIN');
    for (const q of all) {
      const result = resultById.get(q.id);
      const hash = questionHash(q);
      if (!result || !result.passed || result.hash !== hash) {
        throw new Error(`${q.id}: missing or hash-mismatched execution validation`);
      }
      if (result.duplicate_signature !== result.duplicate_signature) throw new Error(`${q.id}: invalid duplicate signature`);
      const evidence = {
        ...q.validation_evidence,
        execution_validated: true,
        execution_report: 'scripts/question-bank/verified-core/validation-report.json',
        execution_report_generated_at: report.generated_at,
        question_hash: hash,
        reference_status: result.reference_verdict,
        starter_status: result.starter_verdict,
        seeded_as: 'tested-practice-only-pending-approval',
      };

      await client.query(
        `INSERT INTO questions (
           id, language, course_id, topic_id, difficulty, title, statement,
           input_format, output_format, constraints, sample_input, sample_output,
           starter_code, reference_solution, solution_explanation, hint_1, hint_2,
           test_cases, expected_time_complexity, expected_space_complexity, tags,
           is_exam_eligible, validation_status,
           task_type, runtime, input_contract, mapping_status, practice_only,
           duplicate_signature, difficulty_rationale, validation_evidence,
           generation_schema_version, taxonomy_version
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,
           $18::jsonb,$19,$20,$21,FALSE,'tested',
           $22,$23,$24::jsonb,'mapped',TRUE,$25,$26,$27::jsonb,$28,$29
         )
         ON CONFLICT (id) DO UPDATE SET
           language=EXCLUDED.language, course_id=EXCLUDED.course_id,
           topic_id=EXCLUDED.topic_id, difficulty=EXCLUDED.difficulty,
           title=EXCLUDED.title, statement=EXCLUDED.statement,
           input_format=EXCLUDED.input_format, output_format=EXCLUDED.output_format,
           constraints=EXCLUDED.constraints, sample_input=EXCLUDED.sample_input,
           sample_output=EXCLUDED.sample_output, starter_code=EXCLUDED.starter_code,
           reference_solution=EXCLUDED.reference_solution,
           solution_explanation=EXCLUDED.solution_explanation,
           hint_1=EXCLUDED.hint_1, hint_2=EXCLUDED.hint_2,
           test_cases=EXCLUDED.test_cases,
           expected_time_complexity=EXCLUDED.expected_time_complexity,
           expected_space_complexity=EXCLUDED.expected_space_complexity,
           tags=EXCLUDED.tags, is_exam_eligible=FALSE,
           validation_status='tested', task_type=EXCLUDED.task_type,
           runtime=EXCLUDED.runtime, input_contract=EXCLUDED.input_contract,
           mapping_status='mapped', practice_only=TRUE,
           duplicate_signature=EXCLUDED.duplicate_signature,
           difficulty_rationale=EXCLUDED.difficulty_rationale,
           validation_evidence=EXCLUDED.validation_evidence,
           generation_schema_version=EXCLUDED.generation_schema_version,
           taxonomy_version=EXCLUDED.taxonomy_version`,
        [
          q.id, q.language, q.course_id, q.topic_id, q.difficulty, q.title,
          q.statement, q.input_format, q.output_format, q.constraints,
          q.sample_input, q.sample_output, JSON.stringify(q.starter_code),
          q.reference_solution, q.solution_explanation, q.hint_1, q.hint_2,
          JSON.stringify(q.test_cases), q.expected_time_complexity,
          q.expected_space_complexity, q.tags, q.task_type,
          q.runtime, JSON.stringify(q.input_contract), result.duplicate_signature,
          q.difficulty_rationale, JSON.stringify(evidence),
          q.generation_schema_version, q.taxonomy_version,
        ]
      );
    }

    const after = (await client.query(
      `SELECT COUNT(*)::int total,
              COUNT(*) FILTER (WHERE validation_status='generated')::int generated,
              COUNT(*) FILTER (WHERE validation_status='tested')::int tested,
              COUNT(*) FILTER (WHERE validation_status <> 'tested' AND is_exam_eligible)::int non_tested_eligible,
              COUNT(*) FILTER (WHERE id LIKE 'core-%' AND is_exam_eligible)::int core_eligible,
              COUNT(*) FILTER (WHERE id LIKE 'core-%')::int core_total
         FROM questions`
    )).rows[0];
    if (after.generated !== before.generated) throw new Error('Generated count changed during verified-core seed');
    if (after.non_tested_eligible !== 0) throw new Error('Non-tested exam quarantine was violated');
    if (after.core_eligible !== 0) throw new Error('Verified core was approved during seed');
    if (after.core_total !== all.length) throw new Error(`Core rows in DB: ${after.core_total}`);

    await client.query('COMMIT');
    const seedReport = {
      generated_at: new Date().toISOString(),
      candidates: all.length,
      validation_report_generated_at: report.generated_at,
      before,
      after,
      status_inserted_or_updated: 'tested',
      exam_eligible: false,
      practice_only: true,
    };
    fs.writeFileSync(OUT, `${JSON.stringify(seedReport, null, 2)}\n`);
    console.log(JSON.stringify(seedReport, null, 2));
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
