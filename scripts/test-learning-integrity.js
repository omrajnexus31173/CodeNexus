'use strict';

/**
 * End-to-end learner-integrity API tests against a running Code Nexus app.
 * Covers: unverified-login blocking, quiz sanitization + server scoring +
 * persistence + retake + cross-user isolation, progress course matching,
 * question topic filtering, hint gating (before/after unlock, cross-user),
 * solve points with hint deduction, reveal-then-solve zero points, and the
 * exam session lifecycle (auth, insufficient pool, payload leakage,
 * cross-user session replay, duplicate submission).
 *
 * Usage: node scripts/test-learning-integrity.js
 * Requires the app at CODE_NEXUS_URL (default http://127.0.0.1:3000).
 * Creates audit-*@code-nexus.test users and removes them afterwards.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');

const BASE = (process.env.CODE_NEXUS_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const TEST_PASSWORD = `Audit-${crypto.randomBytes(16).toString('hex')}!`;
const pool = new Pool({ connectionString: requireDatabaseUrl() });

let passed = 0;
let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name}${extra ? ` :: ${extra}` : ''}`); }
}

async function req(method, path, { token = null, body = null } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

async function cleanupAuditUsers() {
  const users = await pool.query(
    `SELECT id FROM users WHERE email LIKE 'audit-%@code-nexus.test'`
  );
  const ids = users.rows.map((r) => r.id);
  if (!ids.length) return;
  const tables = await pool.query(
    `SELECT DISTINCT table_name FROM information_schema.columns
      WHERE table_schema='public' AND column_name='user_id'`
  );
  for (const { table_name } of tables.rows) {
    await pool.query(`DELETE FROM ${table_name} WHERE user_id = ANY($1)`, [ids]);
  }
  await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [ids]);
}

async function makeUser(email, verified) {
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  const r = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, is_verified, points)
     VALUES ($1,$2,$3,'student',$4,100) RETURNING id`,
    [email, hash, 'Audit User', verified]
  );
  return r.rows[0].id;
}

async function login(email) {
  return req('POST', '/api/auth/login', { body: { email, password: TEST_PASSWORD } });
}

async function main() {
  await cleanupAuditUsers();
  const userA = await makeUser('audit-a@code-nexus.test', true);
  const userB = await makeUser('audit-b@code-nexus.test', true);
  await makeUser('audit-unverified@code-nexus.test', false);

  try {
    console.log('— Auth —');
    const unverified = await login('audit-unverified@code-nexus.test');
    check('unverified login blocked with 403', unverified.status === 403 && unverified.json?.unverified === true, JSON.stringify(unverified.json).slice(0, 200));
    const loginA = await login('audit-a@code-nexus.test');
    const loginB = await login('audit-b@code-nexus.test');
    check('verified login A succeeds', loginA.status === 200 && !!loginA.json?.token);
    check('verified login B succeeds', loginB.status === 200 && !!loginB.json?.token);
    const tokenA = loginA.json.token;
    const tokenB = loginB.json.token;
    const badToken = await req('GET', '/api/auth/me', { token: 'tampered.token.value' });
    check('tampered token rejected on /auth/me', badToken.status === 401, `got ${badToken.status}`);
    const wrongPw = await req('POST', '/api/auth/login', { body: { email: 'audit-a@code-nexus.test', password: `${TEST_PASSWORD}-wrong` } });
    check('wrong password rejected', wrongPw.status === 401);

    console.log('— Lesson topic payload & quiz —');
    const topicId = 'py-dicts-sets';
    const dbTopic = await pool.query('SELECT quiz_questions, course_id FROM course_topics WHERE id=$1', [topicId]);
    const quiz = dbTopic.rows[0].quiz_questions;
    const correct = quiz.map((q) => q.correct_index);
    const wrong = quiz.map((q) => (q.correct_index + 1) % q.options.length);

    const guestTopic = await req('GET', `/api/topics/${topicId}`);
    check('guest topic 200', guestTopic.status === 200);
    const guestQuiz = guestTopic.json?.topic?.quiz_questions || [];
    check('guest quiz has no correct_index/answers leaked', guestQuiz.length > 0 && guestQuiz.every((q) => !('correct_index' in q) && !('correctIndex' in q) && !('explanation' in q)));
    check('guest quizProgress null', guestTopic.json?.quizProgress === null);
    check('topic has next navigation', !!guestTopic.json?.nextTopic?.id);

    const guestSubmit = await req('POST', `/api/topics/${topicId}/quiz`, { body: { answers: correct } });
    check('guest quiz scored but not persisted', guestSubmit.status === 200 && guestSubmit.json?.persisted === false && guestSubmit.json?.score === correct.length, JSON.stringify(guestSubmit.json).slice(0, 200));

    const badCred = await req('POST', `/api/topics/${topicId}/quiz`, { token: 'tampered', body: { answers: correct } });
    check('quiz with invalid credential -> 401', badCred.status === 401);

    const shortAnswers = await req('POST', `/api/topics/${topicId}/quiz`, { token: tokenA, body: { answers: correct.slice(1) } });
    check('quiz wrong answer count -> 400', shortAnswers.status === 400);

    const aWrong = await req('POST', `/api/topics/${topicId}/quiz`, { token: tokenA, body: { answers: wrong } });
    check('A wrong quiz persisted with score 0', aWrong.status === 200 && aWrong.json?.persisted === true && aWrong.json?.score === 0, JSON.stringify(aWrong.json).slice(0, 200));

    const aTopic = await req('GET', `/api/topics/${topicId}`, { token: tokenA });
    check('A sees own quizProgress after attempt', (aTopic.json?.quizProgress?.score ?? null) === 0 && Array.isArray(aTopic.json?.quizProgress?.answers));
    const bTopic = await req('GET', `/api/topics/${topicId}`, { token: tokenB });
    check('B does NOT see A quizProgress', bTopic.json?.quizProgress === null);

    const aRetake = await req('POST', `/api/topics/${topicId}/quiz`, { token: tokenA, body: { answers: correct } });
    check('A retake improves score', aRetake.json?.score === correct.length);
    const attemptRows = await pool.query('SELECT score FROM user_topic_quiz_attempts WHERE user_id=$1 AND topic_id=$2', [userA, topicId]);
    check('retake upserts single attempt row with new score', attemptRows.rows.length === 1 && attemptRows.rows[0].score === correct.length);

    console.log('— Progress course matching —');
    const badProgress = await req('POST', '/api/progress', { token: tokenA, body: { topic_id: topicId, course_id: 'java', completed: true } });
    check('progress with wrong course -> 400', badProgress.status === 400);
    const goodProgress = await req('POST', '/api/progress', { token: tokenA, body: { topic_id: topicId, course_id: dbTopic.rows[0].course_id, completed: true } });
    check('progress with correct course -> 200', goodProgress.status === 200, JSON.stringify(goodProgress.json).slice(0, 160));
    const progRowsA = await pool.query('SELECT completed FROM user_topic_progress WHERE user_id=$1 AND topic_id=$2', [userA, topicId]);
    const progRowsB = await pool.query('SELECT completed FROM user_topic_progress WHERE user_id=$1 AND topic_id=$2', [userB, topicId]);
    check('progress persisted for A only', progRowsA.rows.length === 1 && progRowsB.rows.length === 0);
    const guestProgress = await req('POST', '/api/progress', { body: { topic_id: topicId, course_id: dbTopic.rows[0].course_id } });
    check('guest progress -> 401', guestProgress.status === 401);

    console.log('— Questions: topic filter, hint gating, points —');
    const qid = 'topic-py-dicts-sets';
    const filtered = await req('GET', `/api/questions?topicId=${topicId}`);
    const list = filtered.json?.questions || filtered.json || [];
    check('topic filter returns only linked question(s)', Array.isArray(list) && list.length >= 1 && list.every((q) => q.topic_id === topicId && q.mapping_status === 'mapped'), `len=${list.length}`);
    const mismatchedTopicFilter = await req('GET', `/api/questions?topicId=${topicId}&courseId=java`);
    check('topic filter rejects a mismatched course instead of substituting questions', mismatchedTopicFilter.status === 200 && mismatchedTopicFilter.json?.total === 0 && !!mismatchedTopicFilter.json?.warning);
    const recommendations = await req('GET', `/api/topics/${topicId}/recommendations?limit=5`);
    const recs = recommendations.json?.recommendations || [];
    check(
      'lesson recommendations are exact-topic execution-tested only',
      recommendations.status === 200 && recs.length >= 1 && recs.every((q) => q.topic_id === topicId && q.course_id === dbTopic.rows[0].course_id && q.validation_status === 'tested' && !!q.progression),
      JSON.stringify(recs).slice(0, 220)
    );
    const recLeak = recs.some((q) => 'reference_solution' in q || 'test_cases' in q || 'starter_code' in q || 'hint_1' in q);
    check('lesson recommendations leak no solutions/tests/hints', !recLeak);

    const guestQ = await req('GET', `/api/questions/${qid}`);
    check('guest question: hints null', guestQ.json?.question?.hint_1 === null && guestQ.json?.question?.hint_2 === null);
    check('guest question: reference null', guestQ.json?.question?.reference_solution === null);
    check('guest question: difficulty rationale gated until solved/revealed', guestQ.json?.question?.difficulty_rationale === null && guestQ.json?.question?.validation_status === 'tested' && !!guestQ.json?.question?.progression);
    check('guest question: only public tests exposed', (guestQ.json?.question?.publicTestCases?.length || 0) === 1 && (guestQ.json?.question?.totalTestCasesCount || 0) > 1);

    const guestHint = await req('POST', '/api/submit-practice', { body: { question_id: qid, language: 'python', action: 'use_hint', hint_number: 1 } });
    check('guest use_hint -> 401', guestHint.status === 401, `got ${guestHint.status}`);

    const bQ1 = await req('GET', `/api/questions/${qid}`, { token: tokenB });
    check('B question before unlock: hint null', bQ1.json?.question?.hint_1 === null);

    const aHint = await req('POST', '/api/submit-practice', { token: tokenA, body: { question_id: qid, language: 'python', action: 'use_hint', hint_number: 1 } });
    check('A use_hint returns hint text', aHint.status === 200 && !!aHint.json?.hintText, JSON.stringify(aHint.json).slice(0, 160));
    const aQAfterHint = await req('GET', `/api/questions/${qid}`, { token: tokenA });
    check('A sees hint_1 after unlock, hint_2 still null', !!aQAfterHint.json?.question?.hint_1 && aQAfterHint.json?.question?.hint_2 === null);
    const bQAfterAHint = await req('GET', `/api/questions/${qid}`, { token: tokenB });
    check('B still cannot see hint after A unlocked it', bQAfterAHint.json?.question?.hint_1 === null);

    const qRow = await pool.query('SELECT reference_solution, language FROM questions WHERE id=$1', [qid]);
    const pointsBefore = (await pool.query('SELECT points FROM users WHERE id=$1', [userA])).rows[0].points;
    const aSolve = await req('POST', '/api/submit-practice', {
      token: tokenA,
      body: { question_id: qid, language: qRow.rows[0].language, code: qRow.rows[0].reference_solution, action: 'submit' },
    });
    check('A solve with reference -> Accepted', aSolve.json?.status === 'Accepted' || aSolve.json?.result?.status === 'Accepted', JSON.stringify(aSolve.json).slice(0, 200));
    check('A solve awards 3 points (4 - 1 hint)', aSolve.json?.pointsAwarded === 3, `pointsAwarded=${aSolve.json?.pointsAwarded}`);
    const pointsAfter = (await pool.query('SELECT points FROM users WHERE id=$1', [userA])).rows[0].points;
    check('A DB points increased by 3', pointsAfter - pointsBefore === 3, `${pointsBefore}->${pointsAfter}`);
    const aQAfterSolve = await req('GET', `/api/questions/${qid}`, { token: tokenA });
    check('A sees reference after solving', !!aQAfterSolve.json?.question?.reference_solution);
    const bQAfterASolve = await req('GET', `/api/questions/${qid}`, { token: tokenB });
    check('B still cannot see reference after A solved', bQAfterASolve.json?.question?.reference_solution === null);

    const qid2 = 'topic-py-lists-tuples';
    const q2 = await pool.query('SELECT reference_solution, language FROM questions WHERE id=$1', [qid2]);
    const bReveal = await req('POST', '/api/submit-practice', { token: tokenB, body: { question_id: qid2, language: 'python', action: 'reveal' } });
    check('B reveal succeeds with zero-points notice', bReveal.status === 200, JSON.stringify(bReveal.json).slice(0, 160));
    const bSolveAfterReveal = await req('POST', '/api/submit-practice', {
      token: tokenB,
      body: { question_id: qid2, language: q2.rows[0].language, code: q2.rows[0].reference_solution, action: 'submit' },
    });
    check('B solve after reveal awards 0 points', bSolveAfterReveal.json?.pointsAwarded === 0, `pointsAwarded=${bSolveAfterReveal.json?.pointsAwarded}`);

    console.log('— Exam sessions —');
    const guestStart = await req('POST', '/api/exam/start', { body: { course_id: 'python' } });
    check('guest exam start -> 401', guestStart.status === 401);
    const dsaStart = await req('POST', '/api/exam/start', { token: tokenA, body: { course_id: 'dsa' } });
    check('approved DSA pool starts a real 25-question exam', dsaStart.status === 200 && dsaStart.json?.questions?.length === 25, JSON.stringify(dsaStart.json).slice(0, 220));
    const unsupportedStart = await req('POST', '/api/exam/start', { token: tokenA, body: { course_id: 'html-css' } });
    check('unsupported track without deterministic grader -> 409', unsupportedStart.status === 409 && unsupportedStart.json?.examSupported === false, JSON.stringify(unsupportedStart.json).slice(0, 220));
    const pythonPoolBefore = await pool.query(
      `SELECT COUNT(*)::int n FROM questions q
        WHERE q.course_id='python' AND q.validation_status='tested' AND q.is_exam_eligible
          AND q.mapping_status='mapped' AND q.practice_only=false
          AND EXISTS (SELECT 1 FROM course_topics t WHERE t.id=q.topic_id AND t.course_id=q.course_id)
          AND jsonb_array_length(q.test_cases) >= 3`
    );
    const realPython = await req('POST', '/api/exam/start', { token: tokenA, body: { course_id: 'python', question_count: 25 } });
    check(
      'python has a complete approved 25-question pool',
      pythonPoolBefore.rows[0].n === 25 && realPython.status === 200 && realPython.json?.questions?.length === 25,
      `pool=${pythonPoolBefore.rows[0].n} status=${realPython.status}`
    );

    // Defense-in-depth: even if generated rows are incorrectly flagged, the
    // tested-status filter must keep them out of a graded pool. Flagging 30
    // generated C rows must not let a 50-question request exceed the real
    // approved pool of 25.
    const generatedFlagRows = await pool.query(
      `SELECT id FROM questions
        WHERE course_id='c-lang' AND validation_status='generated'
        ORDER BY id LIMIT 30`
    );
    const generatedFlagIds = generatedFlagRows.rows.map((r) => r.id);
    const cTestedPool = await pool.query(
      `SELECT COUNT(*)::int n FROM questions q
        WHERE q.course_id='c-lang' AND q.validation_status='tested' AND q.is_exam_eligible
          AND q.mapping_status='mapped' AND q.practice_only=false
          AND EXISTS (SELECT 1 FROM course_topics t WHERE t.id=q.topic_id AND t.course_id=q.course_id)
          AND jsonb_array_length(q.test_cases) >= 3`
    );
    await pool.query('UPDATE questions SET is_exam_eligible=true WHERE id = ANY($1)', [generatedFlagIds]);
    try {
      const generatedDefense = await req('POST', '/api/exam/start', { token: tokenA, body: { course_id: 'c-lang', question_count: 50 } });
      check(
        'generated rows flagged eligible still cannot expand the approved pool',
        cTestedPool.rows[0].n === 25 && generatedDefense.status === 409 && generatedDefense.json?.availableQuestions === cTestedPool.rows[0].n,
        JSON.stringify(generatedDefense.json).slice(0, 220)
      );
    } finally {
      await pool.query('UPDATE questions SET is_exam_eligible=false WHERE id = ANY($1)', [generatedFlagIds]);
    }

    // Exercise a shorter 10-question draw from the real approved Python
    // pool. The topic rows queried here are only a sanity cohort; start may
    // legitimately select any of the 25 approved Python questions.
    const passPool = await pool.query(
      `SELECT id, reference_solution, is_exam_eligible FROM questions
        WHERE id LIKE 'topic-py-%' AND validation_status='tested'
        ORDER BY id LIMIT 10`
    );
    const passIds = passPool.rows.map((r) => r.id);
    const originalEligibility = new Map(passPool.rows.map((r) => [r.id, r.is_exam_eligible]));
    check('found 10 validated python topic questions in the approved pool', passIds.length === 10);
    await pool.query('UPDATE questions SET is_exam_eligible=true WHERE id = ANY($1)', [passIds]);
    try {
      const start = await req('POST', '/api/exam/start', { token: tokenA, body: { course_id: 'python', question_count: 10 } });
      check('approved pool starts a 10-question exam draw', start.status === 200 && !!start.json?.sessionId && start.json?.questions?.length === 10, JSON.stringify(start.json).slice(0, 180));
      const selectedIds = (start.json?.questions || []).map((q) => q.id);
      const selectedRows = selectedIds.length
        ? await pool.query(
            `SELECT q.id, q.validation_status, q.is_exam_eligible, q.course_id,
                    q.mapping_status, q.practice_only,
                    EXISTS (SELECT 1 FROM course_topics t WHERE t.id=q.topic_id AND t.course_id=q.course_id) AS has_valid_topic
               FROM questions q WHERE q.id = ANY($1)`,
            [selectedIds]
          )
        : { rows: [] };
      check(
        'every started exam question is tested, eligible, mapped, non-practice-only and in python',
        selectedRows.rows.length === 10 && selectedRows.rows.every((q) => q.validation_status === 'tested' && q.is_exam_eligible && q.course_id === 'python' && q.mapping_status === 'mapped' && q.practice_only === false && q.has_valid_topic),
        JSON.stringify(selectedRows.rows).slice(0, 220)
      );
      const leaked = (start.json?.questions || []).some((q) => 'reference_solution' in q || 'test_cases' in q || 'starter_code' in q || 'hint_1' in q);
      check('exam start payload leaks no solutions/tests/hints', !leaked);
      const sessionId = start.json.sessionId;

      const bSubmit = await req('POST', '/api/exam/submit', { token: tokenB, body: { course_id: 'python', session_id: sessionId, answers: {}, duration_seconds: 30 } });
      check('B submitting A session -> 404', bSubmit.status === 404, `got ${bSubmit.status}`);
      const guestSubmitExam = await req('POST', '/api/exam/submit', { body: { course_id: 'python', session_id: sessionId, answers: {} } });
      check('guest exam submit -> 401', guestSubmitExam.status === 401);
      const fakeSubmit = await req('POST', '/api/exam/submit', { token: tokenA, body: { course_id: 'python', session_id: '00000000-0000-4000-8000-000000000000', answers: {}, duration_seconds: 30 } });
      check('fabricated session -> 404', fakeSubmit.status === 404, `got ${fakeSubmit.status}`);

      const aSubmit = await req('POST', '/api/exam/submit', { token: tokenA, body: { course_id: 'python', session_id: sessionId, answers: {}, duration_seconds: 60, violations_count: 0 } });
      check('A blank exam graded as fail', aSubmit.status === 200 && aSubmit.json?.passed === false, JSON.stringify(aSubmit.json).slice(0, 220));
      const attempt = await pool.query('SELECT passed, points_awarded FROM exam_attempts WHERE user_id=$1 AND course_id=$2', [userA, 'python']);
      check('exam attempt persisted, no points on fail', attempt.rows.length === 1 && attempt.rows[0].passed === false && Number(attempt.rows[0].points_awarded) === 0);
      const certs = await pool.query('SELECT COUNT(*)::int n FROM certificates WHERE user_id=$1', [userA]);
      check('no certificate issued on fail', certs.rows[0].n === 0);
      const dupSubmit = await req('POST', '/api/exam/submit', { token: tokenA, body: { course_id: 'python', session_id: sessionId, answers: {}, duration_seconds: 60 } });
      check('duplicate submission of same session -> 409', dupSubmit.status === 409, `got ${dupSubmit.status}`);

      console.log('— Exam pass path (real start, approved tested pool) —');
      const passStart = await req('POST', '/api/exam/start', { token: tokenB, body: { course_id: 'python', question_count: 10 } });
      check('B real pass-path exam starts', passStart.status === 200 && passStart.json?.questions?.length === 10, JSON.stringify(passStart.json).slice(0, 180));
      const passSelectedIds = (passStart.json?.questions || []).map((q) => q.id);
      const answerRows = passSelectedIds.length
        ? await pool.query('SELECT id, reference_solution FROM questions WHERE id = ANY($1)', [passSelectedIds])
        : { rows: [] };
      const referenceById = new Map(answerRows.rows.map((r) => [r.id, r.reference_solution]));
      const answers = {};
      passSelectedIds.forEach((id, i) => { answers[id] = i === 0 ? '' : referenceById.get(id); }); // 9/10 = 90%
      const bPointsBefore = (await pool.query('SELECT points FROM users WHERE id=$1', [userB])).rows[0].points;
      const passSubmit = await req('POST', '/api/exam/submit', {
        token: tokenB,
        body: { course_id: 'python', session_id: passStart.json.sessionId, answers, duration_seconds: 300, violations_count: 0 },
      });
      check('90% exam passes with +10 points', passSubmit.status === 200 && passSubmit.json?.passed === true && passSubmit.json?.pointsAwarded === 10, JSON.stringify(passSubmit.json).slice(0, 260));
      check('certificate issued in response and DB', !!passSubmit.json?.certificate?.id);
      const bCerts = await pool.query('SELECT COUNT(*)::int n FROM certificates WHERE user_id=$1', [userB]);
      const bPointsAfter = (await pool.query('SELECT points FROM users WHERE id=$1', [userB])).rows[0].points;
      check('B DB: certificate row exists, points +10', bCerts.rows[0].n === 1 && bPointsAfter - bPointsBefore === 10, `certs=${bCerts.rows[0].n} points ${bPointsBefore}->${bPointsAfter}`);
    } finally {
      for (const [id, eligible] of originalEligibility.entries()) {
        await pool.query('UPDATE questions SET is_exam_eligible=$2 WHERE id=$1', [id, eligible]);
      }
    }
  } finally {
    await cleanupAuditUsers();
    await pool.end();
  }

  console.log(`\nLearning-integrity API tests: ${passed} passed, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
