'use strict';

/**
 * Verified-core question factory (generation schema v2).
 *
 * A definition produced here is only a candidate. It starts as
 * validation_status='reviewed', practice_only=true and exam-ineligible.
 * scripts/validate-verified-core.js must execute its reference and starter;
 * scripts/seed-verified-core.js inserts only hash-matched passes as tested;
 * exam eligibility is enabled by a separate approval script.
 */

const {
  TAXONOMY_VERSION,
  GENERATION_SCHEMA_VERSION,
  TASK_TYPES,
  DIFFICULTY_RUBRIC,
  topicFor,
  difficultyRationale,
} = require('../taxonomy');

function tc(input, expected_output, is_hidden = true) {
  return { input: String(input), expected_output: String(expected_output), is_hidden };
}

function requireText(cfg, field) {
  if (!String(cfg[field] || '').trim()) throw new Error(`${cfg.slug || '(missing slug)'}: ${field} is required`);
  return String(cfg[field]).trim();
}

function question(cfg) {
  if (!/^[a-z0-9][a-z0-9-]+$/.test(cfg.slug || '')) throw new Error(`Invalid verified-core slug: ${cfg.slug}`);
  const topic = topicFor(cfg.topic);
  if (!topic) throw new Error(`${cfg.slug}: unknown curriculum topic ${cfg.topic}`);
  if (!topic.exam_supported) throw new Error(`${cfg.slug}: topic course ${topic.course_id} is not exam-supported`);
  if (cfg.course && cfg.course !== topic.course_id) throw new Error(`${cfg.slug}: course/topic mismatch`);
  if (cfg.language !== topic.language) {
    throw new Error(`${cfg.slug}: language ${cfg.language} does not match taxonomy runtime language ${topic.language} for ${topic.topic_id}`);
  }
  if (!TASK_TYPES.includes(cfg.taskType)) throw new Error(`${cfg.slug}: invalid taskType ${cfg.taskType}`);
  if (!DIFFICULTY_RUBRIC[cfg.difficulty]) throw new Error(`${cfg.slug}: invalid difficulty ${cfg.difficulty}`);
  if (!Array.isArray(cfg.tests) || cfg.tests.length < 4) throw new Error(`${cfg.slug}: at least 4 tests are required`);
  if (!Array.isArray(cfg.prerequisites) || cfg.prerequisites.length === 0) throw new Error(`${cfg.slug}: explicit prerequisites are required`);
  for (const prerequisite of cfg.prerequisites) {
    const p = topicFor(prerequisite);
    if (!p) throw new Error(`${cfg.slug}: unknown prerequisite topic ${prerequisite}`);
    if (p.course_id !== topic.course_id) throw new Error(`${cfg.slug}: prerequisite ${prerequisite} is in another course`);
  }
  if (!Array.isArray(cfg.hints) || cfg.hints.length !== 2) throw new Error(`${cfg.slug}: exactly two hints are required`);

  const tests = cfg.tests.map((t, i) => tc(t[0], t[1], i !== 0));
  const inputContract = {
    version: GENERATION_SCHEMA_VERSION,
    kind: cfg.language === 'sql' ? 'sql_fixture_query' : 'stdin_stdout',
    dialect: cfg.language === 'sql' ? 'sqlite' : undefined,
    input: requireText(cfg, 'input'),
    output: requireText(cfg, 'output'),
    deterministic: true,
    test_count: tests.length,
    sample_is_test_1: true,
  };

  return {
    id: `core-${cfg.slug}`,
    language: cfg.language,
    course_id: topic.course_id,
    topic_id: topic.topic_id,
    difficulty: cfg.difficulty,
    title: requireText(cfg, 'title'),
    statement: requireText(cfg, 'statement'),
    input_format: inputContract.input,
    output_format: inputContract.output,
    constraints: requireText(cfg, 'constraints'),
    sample_input: tests[0].input,
    sample_output: tests[0].expected_output,
    starter_code: { [cfg.language]: requireText(cfg, 'starter') },
    reference_solution: requireText(cfg, 'solution'),
    solution_explanation: requireText(cfg, 'explanation'),
    hint_1: String(cfg.hints[0]).trim(),
    hint_2: String(cfg.hints[1]).trim(),
    test_cases: tests,
    expected_time_complexity: cfg.time || 'O(N)',
    expected_space_complexity: cfg.space || 'O(N)',
    tags: [...new Set([topic.topic_id, cfg.taskType, DIFFICULTY_RUBRIC[cfg.difficulty].progression.toLowerCase(), ...(cfg.tags || [])])],
    is_exam_eligible: false,
    validation_status: 'reviewed',
    task_type: cfg.taskType,
    runtime: topic.runtime,
    input_contract: inputContract,
    mapping_status: 'mapped',
    practice_only: true,
    duplicate_signature: null,
    difficulty_rationale: difficultyRationale(cfg.difficulty, requireText(cfg, 'difficultyReason')),
    validation_evidence: {
      schema: 'verified-core-candidate',
      prerequisites: cfg.prerequisites,
      taxonomy_version: TAXONOMY_VERSION,
      execution_validated: false,
    },
    generation_schema_version: GENERATION_SCHEMA_VERSION,
    taxonomy_version: TAXONOMY_VERSION,
  };
}

module.exports = { tc, question };
