/**
 * Code Nexus — Curriculum Example Execution Validator
 * Executes every runnable lesson example (1-3) and assignment solution
 * through the live bubblewrap sandbox endpoint (/api/execute) and compares
 * stdout with the documented expected output stored in course_topics.
 *
 * Non-runnable tracks (HTML/CSS snippets, Flutter/Dart) and schema-dependent
 * SQL queries are reported as STATIC (reviewed, not execution-tested) so the
 * `tested` label is only earned by topics whose examples really ran.
 *
 * Usage: node scripts/validate-curriculum-examples.js [--mark-tested]
 *   --mark-tested  Promote topics whose 3 examples + solution all pass to
 *                  validation_status='tested' and stamp tested_at.
 */

require('dotenv').config({ path: '.env' });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');
const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: requireDatabaseUrl(),
});

// Browser-only topics (live DOM required): static/reviewed even though
// their course is sandbox-runnable in Node. Mirrors the lesson UI.
const STATIC_TOPIC_IDS = new Set(['js-dom-basics', 'js-events-delegation']);

const LANG_MAP = {
  'c-lang': 'c',
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  dsa: 'c',
  'system-design': 'javascript',
  // 'sql-databases' -> schema-dependent queries: static review only
  // 'html-css'      -> CSS snippets: static only
  // 'app-dev'       -> Dart/Flutter: no sandbox runtime: static only
};

function postExecute(language, code) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ language, code });
    const req = http.request(
      'http://127.0.0.1:3000/api/execute',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        timeout: 20000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve({ status: 'ParseError', stdout: '', stderr: data }); }
        });
      }
    );
    req.on('error', (e) => resolve({ status: 'HttpError', stdout: '', stderr: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'Timeout', stdout: '', stderr: 'timeout' }); });
    req.write(payload);
    req.end();
  });
}

function normalize(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/g, ''))
    .join('\n')
    .trim();
}

function isNondeterministic(code) {
  return /\bid\s*\(/.test(code) || /Math\.random/.test(code) || /\btime\s*\(/.test(code) || /rand\s*\(/.test(code);
}

async function main() {
  const markTested = process.argv.includes('--mark-tested');
  console.log('='.repeat(70));
  console.log('  CODE NEXUS — CURRICULUM EXAMPLE EXECUTION VALIDATOR');
  console.log('='.repeat(70));

  const { rows: topics } = await pool.query(
    'SELECT * FROM course_topics ORDER BY course_id, order_index'
  );

  let pass = 0, fail = 0, mismatch = 0, nondet = 0, staticCount = 0;
  const failures = [];
  const topicResults = {};

  for (const t of topics) {
    const lang = STATIC_TOPIC_IDS.has(t.id) ? null : LANG_MAP[t.course_id];
    if (!lang) {
      staticCount += 3;
      topicResults[t.id] = 'static';
      console.log(`\n[STATIC] ${t.id} (${t.course_id}) — no sandbox runtime / schema-dependent; reviewed only`);
      continue;
    }

    console.log(`\n[${t.course_id}] ${t.id}`);
    let topicOk = true;

    const items = [
      ['ex1', t.code_example_1_code, t.code_example_1_output],
      ['ex2', t.code_example_2_code, t.code_example_2_output],
      ['ex3', t.code_example_3_code, t.code_example_3_output],
      ['solution', t.assignment_solution, null],
    ];

    for (const [label, code, expected] of items) {
      if (!code || !code.trim()) {
        console.log(`  [FAIL] ${label}: empty code`);
        fail++; failures.push({ topic: t.id, label, reason: 'empty code' }); topicOk = false;
        continue;
      }
      const r = await postExecute(lang, code);
      if (r.status !== 'Accepted') {
        console.log(`  [FAIL] ${label}: status=${r.status} :: ${(r.stderr || '').split('\n')[0].slice(0, 160)}`);
        fail++; failures.push({ topic: t.id, label, reason: `status=${r.status}`, stderr: (r.stderr || '').slice(0, 400) });
        topicOk = false;
        continue;
      }
      if (label !== 'solution' && expected && expected.trim()) {
        if (isNondeterministic(code)) {
          console.log(`  [PASS*] ${label}: Accepted (nondeterministic output — not byte-compared)`);
          nondet++; pass++;
        } else if (normalize(r.stdout) === normalize(expected)) {
          console.log(`  [PASS] ${label}: Accepted + output matches documented expected output`);
          pass++;
        } else {
          console.log(`  [MISMATCH] ${label}: Accepted but stdout != documented expected output`);
          console.log(`      expected: ${JSON.stringify(normalize(expected).slice(0, 180))}`);
          console.log(`      actual  : ${JSON.stringify(normalize(r.stdout).slice(0, 180))}`);
          mismatch++; failures.push({ topic: t.id, label, reason: 'output mismatch', expected: normalize(expected), actual: normalize(r.stdout) });
          topicOk = false;
        }
      } else {
        console.log(`  [PASS] ${label}: Accepted`);
        pass++;
      }
    }
    topicResults[t.id] = topicOk ? 'tested' : 'needs-fix';
  }

  console.log('\n' + '='.repeat(70));
  console.log(`SUMMARY: ${pass} passed (${nondet} nondeterministic Accepted-only), ${fail} execution failures, ${mismatch} output mismatches, ${staticCount} static-only examples`);
  const testedTopics = Object.entries(topicResults).filter(([, v]) => v === 'tested').map(([k]) => k);
  const fixTopics = Object.entries(topicResults).filter(([, v]) => v === 'needs-fix').map(([k]) => k);
  console.log(`Topics fully execution-tested: ${testedTopics.length}`);
  console.log(`Topics needing fixes: ${fixTopics.length}${fixTopics.length ? ' -> ' + fixTopics.join(', ') : ''}`);

  if (failures.length) {
    console.log('\nFAILURE DETAILS:');
    for (const f of failures) console.log(` - ${f.topic} ${f.label}: ${f.reason}${f.stderr ? ' :: ' + f.stderr.split('\n')[0] : ''}`);
  }

  if (markTested && testedTopics.length) {
    await pool.query(
      `UPDATE course_topics SET validation_status='tested', tested_at=NOW() WHERE id = ANY($1)`,
      [testedTopics]
    );
    console.log(`\nMarked ${testedTopics.length} topics as validation_status='tested' with tested_at=NOW().`);
  }

  await pool.end();
  process.exit(fail + mismatch > 0 ? 1 : 0);
}

main().catch(async (e) => { console.error(e); await pool.end(); process.exit(1); });
