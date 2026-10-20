'use strict';

/**
 * Idempotently inserts topic-linked questions ONLY when the canonical full
 * execution-validation report says every current definition (matched by
 * SHA-256 hash) passed. Therefore the DB rows may be marked tested even
 * though the source factories deliberately remain labelled reviewed.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const questions = require('./question-bank/topic-linked');

const REPORT_PATH = path.join(__dirname, 'question-bank', 'topic-linked', 'validation-report.json');

function hashQuestion(question) {
  return crypto.createHash('sha256').update(JSON.stringify(question)).digest('hex');
}

function loadPassedReport() {
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error('Missing validation-report.json. Run scripts/validate-topic-linked-questions.js first.');
  }
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  if (report.total !== questions.length || report.passed !== questions.length || report.failed !== 0) {
    throw new Error(`Refusing to seed: validation report is ${report.passed}/${report.total}, current authored count is ${questions.length}.`);
  }
  const byId = new Map(report.results.map((r) => [r.id, r]));
  for (const q of questions) {
    const result = byId.get(q.id);
    if (!result?.passed) throw new Error(`Refusing to seed: ${q.id} has no passing validation result.`);
    if (result.hash !== hashQuestion(q)) throw new Error(`Refusing to seed: ${q.id} changed after validation (hash mismatch).`);
  }
  return report;
}

async function main() {
  const report = loadPassedReport();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');

  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const topicRows = await client.query('SELECT id, course_id FROM course_topics WHERE id = ANY($1::text[])', [questions.map((q) => q.topic_id)]);
    const topicCourse = new Map(topicRows.rows.map((r) => [r.id, r.course_id]));
    for (const q of questions) {
      if (!topicCourse.has(q.topic_id)) throw new Error(`${q.id}: topic ${q.topic_id} is not in the DB.`);
      if (topicCourse.get(q.topic_id) !== q.course_id) throw new Error(`${q.id}: topic/course mismatch in DB.`);
    }

    let inserted = 0;
    let updated = 0;
    for (const q of questions) {
      const result = await client.query(
        `INSERT INTO questions (
           id, language, course_id, topic_id, difficulty, title, statement,
           input_format, output_format, constraints, sample_input, sample_output,
           starter_code, reference_solution, solution_explanation, hint_1, hint_2,
           test_cases, expected_time_complexity, expected_space_complexity, tags,
           is_exam_eligible, validation_status
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,$18::jsonb,$19,$20,$21::text[],$22,'tested'
         )
         ON CONFLICT (id) DO UPDATE SET
           language = EXCLUDED.language,
           course_id = EXCLUDED.course_id,
           topic_id = EXCLUDED.topic_id,
           difficulty = EXCLUDED.difficulty,
           title = EXCLUDED.title,
           statement = EXCLUDED.statement,
           input_format = EXCLUDED.input_format,
           output_format = EXCLUDED.output_format,
           constraints = EXCLUDED.constraints,
           sample_input = EXCLUDED.sample_input,
           sample_output = EXCLUDED.sample_output,
           starter_code = EXCLUDED.starter_code,
           reference_solution = EXCLUDED.reference_solution,
           solution_explanation = EXCLUDED.solution_explanation,
           hint_1 = EXCLUDED.hint_1,
           hint_2 = EXCLUDED.hint_2,
           test_cases = EXCLUDED.test_cases,
           expected_time_complexity = EXCLUDED.expected_time_complexity,
           expected_space_complexity = EXCLUDED.expected_space_complexity,
           tags = EXCLUDED.tags,
           is_exam_eligible = EXCLUDED.is_exam_eligible,
           validation_status = 'tested'
         RETURNING (xmax = 0) AS was_inserted`,
        [
          q.id, q.language, q.course_id, q.topic_id, q.difficulty, q.title, q.statement,
          q.input_format, q.output_format, q.constraints, q.sample_input, q.sample_output,
          JSON.stringify(q.starter_code), q.reference_solution, q.solution_explanation,
          q.hint_1, q.hint_2, JSON.stringify(q.test_cases), q.expected_time_complexity,
          q.expected_space_complexity, q.tags, q.is_exam_eligible,
        ]
      );
      if (result.rows[0].was_inserted) inserted++; else updated++;
    }

    await client.query('COMMIT');
    console.log(`Topic-linked questions seeded from validation ${report.generated_at}: ${inserted} inserted, ${updated} updated.`);
  } catch (error) {
    await client.query('ROLLBACK');
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
