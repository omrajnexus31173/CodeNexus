'use strict';

const groups = {
  python: require('./python'),
  c: require('./c'),
  cpp: require('./cpp'),
  java: require('./java'),
  javascript: require('./javascript'),
  sql: require('./sql'),
  dsa: require('./dsa'),
  'system-design': require('./system-design'),
};

const all = Object.values(groups).flat();
const seenIds = new Set();
const seenStatements = new Map();

function canonical(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

for (const q of all) {
  if (seenIds.has(q.id)) throw new Error(`Duplicate verified-core id: ${q.id}`);
  seenIds.add(q.id);
  const key = canonical(q.statement);
  if (seenStatements.has(key)) {
    throw new Error(`Duplicate verified-core statement: ${q.id} duplicates ${seenStatements.get(key)}`);
  }
  seenStatements.set(key, q.id);
}

module.exports = { groups, all };
