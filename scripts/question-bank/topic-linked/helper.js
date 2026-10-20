'use strict';

/**
 * Helpers for the audit's topic-linked Practice questions.
 *
 * Every object produced here is inserted only after
 * scripts/validate-topic-linked-questions.js has executed the reference
 * solution against every test case in the real sandbox and confirmed that
 * the starter does NOT already pass.
 */

function tc(input, expected_output, is_hidden = true) {
  return { input: String(input), expected_output: String(expected_output), is_hidden };
}

function question(cfg) {
  if (!cfg.topic || !cfg.language || !cfg.course || !cfg.title || !cfg.statement) {
    throw new Error(`Incomplete topic-linked question: ${JSON.stringify(cfg).slice(0, 160)}`);
  }
  if (!Array.isArray(cfg.tests) || cfg.tests.length < 3) {
    throw new Error(`${cfg.topic}: at least 3 test cases are required`);
  }
  const tests = cfg.tests.map((t, i) => tc(t[0], t[1], i !== 0));
  return {
    id: `topic-${cfg.topic}`,
    language: cfg.language,
    course_id: cfg.course,
    topic_id: cfg.topic,
    difficulty: cfg.difficulty || 'Easy',
    title: cfg.title,
    statement: cfg.statement.trim(),
    input_format: cfg.input.trim(),
    output_format: cfg.output.trim(),
    constraints: cfg.constraints.trim(),
    sample_input: tests[0].input,
    sample_output: tests[0].expected_output,
    starter_code: { [cfg.language]: cfg.starter.trim() },
    reference_solution: cfg.solution.trim(),
    solution_explanation: cfg.explanation.trim(),
    hint_1: cfg.hints[0],
    hint_2: cfg.hints[1],
    test_cases: tests,
    expected_time_complexity: cfg.time || 'O(N)',
    expected_space_complexity: cfg.space || 'O(1)',
    tags: [cfg.topic, ...(cfg.tags || [])],
    is_exam_eligible: false,
    validation_status: 'reviewed',
  };
}

module.exports = { tc, question };
