'use strict';

/**
 * Structural, mapping, and duplicate checks for topic-linked questions.
 * This script does not execute code; use validate-topic-linked-questions.js
 * for execution evidence.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');
const { Pool } = require('pg');
const questions = require('./question-bank/topic-linked');
const { masterTopics } = require('./curriculum/master-curriculum');

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function normalizeCode(value) {
  return String(value || '').replace(/\s+/g, '');
}
function tokenSet(value) {
  return new Set(normalizeText(value).split(' ').filter(Boolean));
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap++;
  return overlap / (a.size + b.size - overlap);
}
function addToMap(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

async function main() {
  const failures = [];
  const warnings = [];
  const topicById = new Map(masterTopics.map((t) => [t.id, t]));

  const ids = new Map();
  const titles = new Map();
  const statements = new Map();
  const references = new Map();
  const testSignatures = new Map();

  for (const q of questions) {
    addToMap(ids, q.id, q.id);
    addToMap(titles, normalizeText(q.title), q.id);
    addToMap(statements, normalizeText(q.statement), q.id);
    addToMap(references, normalizeCode(q.reference_solution), q.id);
    addToMap(testSignatures, JSON.stringify(q.test_cases.map((t) => [t.input, t.expected_output])), q.id);

    const topic = topicById.get(q.topic_id);
    if (!topic) failures.push(`${q.id}: unknown lesson topic ${q.topic_id}`);
    else if (topic.course_id !== q.course_id) failures.push(`${q.id}: course mismatch ${q.course_id} != lesson ${topic.course_id}`);

    for (const field of ['title', 'statement', 'input_format', 'output_format', 'constraints', 'sample_input', 'reference_solution', 'solution_explanation', 'hint_1', 'hint_2']) {
      if (field === 'sample_input') continue; // An empty sample input can be legitimate.
      if (!String(q[field] || '').trim()) failures.push(`${q.id}: empty ${field}`);
    }
    const starter = q.starter_code[q.language];
    if (!starter || !starter.trim()) failures.push(`${q.id}: missing starter for language ${q.language}`);
    if (normalizeCode(starter) === normalizeCode(q.reference_solution)) failures.push(`${q.id}: starter is identical to reference`);
    if (normalizeCode(starter).includes(normalizeCode(q.reference_solution))) failures.push(`${q.id}: starter contains the full reference`);
    if (!Array.isArray(q.test_cases) || q.test_cases.length < 3) failures.push(`${q.id}: fewer than 3 test cases`);
    if (q.sample_input !== q.test_cases[0]?.input || q.sample_output !== q.test_cases[0]?.expected_output) failures.push(`${q.id}: sample does not match first test case`);
    if (q.is_exam_eligible !== false) failures.push(`${q.id}: topic-linked questions must start as exam-ineligible`);
    if (q.validation_status !== 'reviewed') failures.push(`${q.id}: source status must remain reviewed until execution validation gates insertion`);
  }

  for (const [label, map] of [['id', ids], ['title', titles], ['statement', statements], ['reference', references], ['test signature', testSignatures]]) {
    for (const values of map.values()) {
      if (values.length > 1) failures.push(`duplicate ${label}: ${values.join(', ')}`);
    }
  }

  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  try {
    const topicRows = await pool.query('SELECT id, course_id FROM course_topics');
    const dbTopicById = new Map(topicRows.rows.map((r) => [r.id, r.course_id]));
    for (const q of questions) {
      if (!dbTopicById.has(q.topic_id)) failures.push(`${q.id}: topic not present in DB`);
      else if (dbTopicById.get(q.topic_id) !== q.course_id) failures.push(`${q.id}: DB course mismatch`);
    }

    const existing = await pool.query('SELECT id, title, statement FROM questions ORDER BY id');
    const existingIds = new Map(existing.rows.map((r) => [r.id, r]));
    const existingTitles = new Map();
    const existingStatements = new Map();
    for (const row of existing.rows) {
      addToMap(existingTitles, normalizeText(row.title), row.id);
      addToMap(existingStatements, normalizeText(row.statement), row.id);
    }

    for (const q of questions) {
      // After seeding, a DB row with the same ID is expected; it is a
      // collision only when its content differs from the authored source.
      const self = existingIds.get(q.id);
      if (self && (normalizeText(self.title) !== normalizeText(q.title) || normalizeText(self.statement) !== normalizeText(q.statement))) {
        failures.push(`${q.id}: ID already exists in DB with different title/statement`);
      }
      const titleMatches = (existingTitles.get(normalizeText(q.title)) || []).filter((id) => id !== q.id);
      if (titleMatches.length) failures.push(`${q.id}: normalized title duplicates ${titleMatches.join(', ')}`);
      const statementMatches = (existingStatements.get(normalizeText(q.statement)) || []).filter((id) => id !== q.id);
      if (statementMatches.length) failures.push(`${q.id}: normalized statement duplicates ${statementMatches.join(', ')}`);
    }

    // High textual similarity is a warning requiring manual review; generated
    // question families naturally share vocabulary, so only near-identical
    // statements are reported.
    const existingTokenSets = existing.rows.map((r) => ({ id: r.id, tokens: tokenSet(r.statement) }));
    for (const q of questions) {
      const tokens = tokenSet(q.statement);
      let best = { id: null, score: 0 };
      for (const row of existingTokenSets) {
        if (row.id === q.id) continue; // own seeded row
        const score = jaccard(tokens, row.tokens);
        if (score > best.score) best = { id: row.id, score };
      }
      if (best.score >= 0.85) warnings.push(`${q.id}: statement Jaccard ${best.score.toFixed(3)} with ${best.id}`);
    }

    console.log(JSON.stringify({
      authored: questions.length,
      existing_db_questions: existing.rows.length,
      db_topics: topicRows.rows.length,
      failures,
      warnings,
    }, null, 2));
  } finally {
    await pool.end();
  }

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
