'use strict';

/**
 * Curriculum-derived question taxonomy.
 *
 * The legacy pipeline's 96 free-text domain labels are not a taxonomy: most
 * did not correspond to the generated statement. This module derives the
 * only valid question topics from the 129 topics that actually exist in the
 * implemented curriculum. A question may be mapped only to one of these
 * topic IDs and only when the topic's course matches the question course.
 */

const { masterTopics, masterUnits } = require('../curriculum/master-curriculum');

const TAXONOMY_VERSION = 'curriculum-129-v2';
const GENERATION_SCHEMA_VERSION = 2;

const COURSE_RUNTIME = {
  'c-lang': { language: 'c', runtime: 'GCC 14 (default C mode), bubblewrap sandbox' },
  cpp: { language: 'cpp', runtime: 'G++ 14 -std=c++17, bubblewrap sandbox' },
  python: { language: 'python', runtime: 'Python 3, bubblewrap sandbox' },
  java: { language: 'java', runtime: 'OpenJDK 11, bubblewrap sandbox' },
  javascript: { language: 'javascript', runtime: 'Node.js 20, bubblewrap sandbox' },
  'sql-databases': { language: 'sql', runtime: 'SQLite 3 practice runner, bubblewrap sandbox' },
  dsa: { language: 'c', runtime: 'GCC 14 (C implementations), bubblewrap sandbox' },
  'system-design': { language: 'javascript', runtime: 'Node.js 20 deterministic simulations, bubblewrap sandbox' },
  'html-css': { language: null, runtime: null },
  'app-dev': { language: null, runtime: null },
};

const SUPPORTED_EXAM_COURSES = Object.freeze([
  'c-lang',
  'cpp',
  'python',
  'java',
  'javascript',
  'sql-databases',
  'dsa',
  'system-design',
]);

const UNSUPPORTED_EXAM_COURSES = Object.freeze({
  'html-css': 'No deterministic browser-rendering grader is integrated for certificate exams.',
  'app-dev': 'No Dart/Flutter runtime is available in the sandbox.',
});

const TASK_TYPES = Object.freeze([
  'direct-application',
  'combined-concepts',
  'edge-case-reasoning',
  'algorithm-implementation',
  'data-structure-operation',
  'sql-query',
  'sql-schema-or-dml',
  'system-simulation',
  'debugging-by-contract',
]);

const DIFFICULTY_RUBRIC = Object.freeze({
  Easy: Object.freeze({
    progression: 'Beginner',
    prerequisite_depth: 'One lesson concept, introduced in the mapped topic or an immediate prerequisite.',
    reasoning_steps: 'Direct application with one to three obvious transformations; edge cases are explicit.',
    complexity: 'Small input handling and a single control/data structure; no hidden algorithmic trick.',
  }),
  Medium: Object.freeze({
    progression: 'Intermediate',
    prerequisite_depth: 'Combines the mapped topic with one or two prerequisite concepts.',
    reasoning_steps: 'Multiple dependent steps, state tracking, or non-trivial edge-case handling.',
    complexity: 'Requires choosing an appropriate structure/algorithm and reasoning about correctness.',
  }),
  Hard: Object.freeze({
    progression: 'Advanced',
    prerequisite_depth: 'Integrates several prerequisite concepts or an advanced topic mechanism.',
    reasoning_steps: 'Algorithmic/optimization reasoning, invariant maintenance, recursion/dynamic programming, or multi-stage simulation.',
    complexity: 'Naive approaches are either incorrect on edge cases or asymptotically unsuitable for the stated bounds.',
  }),
});

const unitById = new Map(masterUnits.map((unit) => [unit.id, unit]));

const TOPICS = Object.freeze(masterTopics.map((topic) => {
  const unit = unitById.get(topic.unit_id);
  if (!unit) throw new Error(`Curriculum topic ${topic.id} references unknown unit ${topic.unit_id}`);
  if (unit.course_id !== topic.course_id) throw new Error(`Curriculum topic ${topic.id} unit/course mismatch`);
  return Object.freeze({
    topic_id: topic.id,
    course_id: topic.course_id,
    unit_id: topic.unit_id,
    unit_title: unit.title,
    unit_order: unit.order_index,
    title: topic.title,
    order_index: topic.order_index,
    prerequisites: topic.prerequisites || [],
    learning_objectives: topic.learning_objectives || [],
    expected_outcomes: topic.expected_outcomes || [],
    language: COURSE_RUNTIME[topic.course_id]?.language || null,
    runtime: COURSE_RUNTIME[topic.course_id]?.runtime || null,
    exam_supported: SUPPORTED_EXAM_COURSES.includes(topic.course_id),
  });
}));

if (TOPICS.length !== 129) throw new Error(`Expected 129 curriculum topics, found ${TOPICS.length}`);

const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.topic_id, topic]));

function topicFor(topicId) {
  return TOPIC_BY_ID.get(topicId) || null;
}

function validateTopicCourse(topicId, courseId) {
  const topic = topicFor(topicId);
  return Boolean(topic && topic.course_id === courseId);
}

function difficultyRationale(difficulty, specificReason) {
  const rubric = DIFFICULTY_RUBRIC[difficulty];
  if (!rubric) throw new Error(`Unknown difficulty: ${difficulty}`);
  return `${rubric.progression}: ${specificReason} Rubric — prerequisites: ${rubric.prerequisite_depth} Reasoning: ${rubric.reasoning_steps} Complexity: ${rubric.complexity}`;
}

module.exports = {
  TAXONOMY_VERSION,
  GENERATION_SCHEMA_VERSION,
  COURSE_RUNTIME,
  SUPPORTED_EXAM_COURSES,
  UNSUPPORTED_EXAM_COURSES,
  TASK_TYPES,
  DIFFICULTY_RUBRIC,
  TOPICS,
  TOPIC_BY_ID,
  topicFor,
  validateTopicCourse,
  difficultyRationale,
};
