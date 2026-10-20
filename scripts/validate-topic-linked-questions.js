'use strict';

/**
 * Executes every topic-linked reference solution and starter through the
 * running application's real /api/execute sandbox.
 *
 * A question passes only when:
 *   1. its reference solution is Accepted on every authored test case; and
 *   2. its starter runs but is Wrong Answer (not Accepted and not an
 *      execution/compile error).
 *
 * Usage:
 *   node scripts/validate-topic-linked-questions.js
 *   node scripts/validate-topic-linked-questions.js --language python
 *   node scripts/validate-topic-linked-questions.js --topic py-dicts-sets
 *
 * The application must already be running (default http://127.0.0.1:3000).
 * Set CODE_NEXUS_URL to use another local origin.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const questions = require('./question-bank/topic-linked');

const REPORT_PATH = path.join(__dirname, 'question-bank', 'topic-linked', 'validation-report.json');
const BASE_URL = (process.env.CODE_NEXUS_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function hashQuestion(question) {
  return crypto.createHash('sha256').update(JSON.stringify(question)).digest('hex');
}

async function execute(language, code, testCases) {
  const response = await fetch(`${BASE_URL}/api/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ language, code, testCases }),
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Execution endpoint returned non-JSON HTTP ${response.status}`);
  }
  if (!response.ok && !body.status) {
    throw new Error(`Execution endpoint HTTP ${response.status}: ${body.error || JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
}

function compactResult(result) {
  if (!result) return null;
  return {
    status: result.status,
    stderr: (result.stderr || '').slice(0, 1200),
    executionTimeMs: result.executionTimeMs,
    testCaseResults: (result.testCaseResults || []).map((r) => ({
      testCaseIndex: r.testCaseIndex,
      expectedOutput: r.expectedOutput,
      actualOutput: r.actualOutput,
      passed: r.passed,
    })),
  };
}

async function main() {
  const languageFilter = argValue('--language');
  const topicFilter = argValue('--topic');
  const selected = questions.filter((q) =>
    (!languageFilter || q.language === languageFilter) &&
    (!topicFilter || q.topic_id === topicFilter));

  if (selected.length === 0) {
    throw new Error('No topic-linked questions matched the supplied filter.');
  }

  // Fail quickly if the app/sandbox is unavailable.
  await execute('python', 'print(1)', [{ input: '', expected_output: '1', is_hidden: false }]);

  const startedAt = new Date().toISOString();
  const results = [];
  let passed = 0;

  for (let i = 0; i < selected.length; i++) {
    const q = selected[i];
    process.stdout.write(`[${i + 1}/${selected.length}] ${q.id} (${q.language}) `);
    const entry = {
      id: q.id,
      topic_id: q.topic_id,
      language: q.language,
      hash: hashQuestion(q),
      reference: null,
      starter: null,
      passed: false,
      reason: null,
    };

    try {
      const referenceResult = await execute(q.language, q.reference_solution, q.test_cases);
      entry.reference = compactResult(referenceResult);
      if (referenceResult.status !== 'Accepted') {
        entry.reason = `reference status ${referenceResult.status}`;
        console.log(`FAIL (${entry.reason})`);
        results.push(entry);
        continue;
      }

      const starterCode = q.starter_code[q.language];
      const starterResult = await execute(q.language, starterCode, q.test_cases);
      entry.starter = compactResult(starterResult);
      if (starterResult.status !== 'Wrong Answer') {
        entry.reason = starterResult.status === 'Accepted'
          ? 'starter already passes all tests'
          : `starter status ${starterResult.status} (expected Wrong Answer)`;
        console.log(`FAIL (${entry.reason})`);
        results.push(entry);
        continue;
      }

      entry.passed = true;
      passed++;
      console.log('PASS');
    } catch (error) {
      entry.reason = error.message;
      console.log(`ERROR (${entry.reason})`);
    }
    results.push(entry);
  }

  const report = {
    generated_at: new Date().toISOString(),
    started_at: startedAt,
    base_url: BASE_URL,
    filters: { language: languageFilter, topic: topicFilter },
    total: selected.length,
    passed,
    failed: selected.length - passed,
    results,
  };

  // A filtered run must not create a report that the seeder could mistake for
  // a full validation. Only full runs replace the canonical report.
  if (!languageFilter && !topicFilter) {
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Report: ${REPORT_PATH}`);
  } else {
    console.log('Filtered run: canonical validation-report.json was not replaced.');
  }

  console.log(`Topic-linked execution validation: ${passed}/${selected.length} passed.`);
  if (passed !== selected.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
