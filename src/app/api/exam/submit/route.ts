import { NextRequest, NextResponse } from 'next/server';
import { getClient, query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { adjustPointsWithLedger } from '@/lib/db';
import { executeCode } from '@/lib/runner';
import { isExamSupportedCourse } from '@/lib/questionTaxonomy';
import { getAppUrl } from '@/lib/env';
import crypto from 'crypto';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClient();
  let transactionStarted = false;
  try {
    const appUrl = getAppUrl();
    const {
      course_id,
      session_id,
      answers,
      duration_seconds = 0,
      violations_count = 0,
    } = await req.json();

    if (!course_id || !session_id || !answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid exam submission data' }, { status: 400 });
    }
    if (!UUID_RE.test(session_id)) {
      return NextResponse.json({ error: 'Invalid exam session' }, { status: 400 });
    }

    const durationSeconds = Number(duration_seconds);
    const violationsCount = Number(violations_count);
    if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 7500 ||
        !Number.isInteger(violationsCount) || violationsCount < 0 || violationsCount > 99) {
      return NextResponse.json({ error: 'Invalid exam duration or violations count' }, { status: 400 });
    }

    const courseRes = await query('SELECT * FROM courses WHERE id = $1', [course_id]);
    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courseRes.rows[0];
    if (!isExamSupportedCourse(course_id)) {
      return NextResponse.json({ error: 'This track does not offer a sandbox-graded certificate exam' }, { status: 409 });
    }

    // The question pool comes from the server-issued session, never from
    // client-supplied IDs or a client-supplied total.
    const sessionRes = await query(
      `SELECT * FROM exam_sessions
       WHERE id = $1 AND user_id = $2 AND course_id = $3`,
      [session_id, userPayload.id, course_id]
    );
    if (sessionRes.rows.length === 0) {
      return NextResponse.json({ error: 'Exam session not found for this user and course' }, { status: 404 });
    }
    const session = sessionRes.rows[0];
    if (session.submitted_at) {
      return NextResponse.json({ error: 'This exam session has already been submitted' }, { status: 409 });
    }
    // Allow a short network/grading grace period after the visible timer.
    if (Date.now() > new Date(session.expires_at).getTime() + 5 * 60 * 1000) {
      return NextResponse.json({ error: 'This exam session has expired' }, { status: 410 });
    }

    const questionIds: string[] = Array.isArray(session.question_pool)
      ? session.question_pool
      : JSON.parse(session.question_pool || '[]');
    const total = questionIds.length;
    if (total === 0) {
      return NextResponse.json({ error: 'Exam session contains no questions' }, { status: 409 });
    }

    const unknownIds = Object.keys(answers).filter((id) => !questionIds.includes(id));
    if (unknownIds.length > 0) {
      return NextResponse.json({ error: 'Submission contains questions outside this exam session' }, { status: 400 });
    }
    for (const [id, value] of Object.entries(answers)) {
      if (typeof value !== 'string' || value.length > 100000) {
        return NextResponse.json({ error: `Invalid answer for question ${id}` }, { status: 400 });
      }
    }

    const questionsRes = await query(
      `SELECT q.id, q.language, q.course_id, q.topic_id, q.is_exam_eligible,
              q.validation_status, q.mapping_status, q.practice_only, q.test_cases,
              EXISTS (
                SELECT 1 FROM course_topics t
                WHERE t.id = q.topic_id AND t.course_id = q.course_id
              ) AS has_valid_topic
       FROM questions q WHERE q.id = ANY($1::text[])`,
      [questionIds]
    );
    const questionById = new Map(questionsRes.rows.map((q: any) => [q.id, q]));
    if (questionById.size !== total || !Array.from(questionById.values()).every((q: any) =>
      q.course_id === course_id &&
      q.is_exam_eligible &&
      q.validation_status === 'tested' &&
      q.mapping_status === 'mapped' &&
      q.practice_only === false &&
      q.has_valid_topic &&
      Array.isArray(q.test_cases) &&
      q.test_cases.length >= 3
    )) {
      return NextResponse.json({ error: 'Exam question pool is no longer valid for this course' }, { status: 409 });
    }

    // Real grading: execute each non-empty answer in the isolated sandbox
    // against that question's stored test cases. A question is correct only
    // when the runner reports Accepted (all tests passed).
    let correctCount = 0;
    const perQuestionResults: Array<{ questionId: string; correct: boolean; status: string }> = [];
    for (const qId of questionIds) {
      const question: any = questionById.get(qId);
      const userAnswer = typeof answers[qId] === 'string' ? answers[qId] : '';
      if (!userAnswer.trim()) {
        perQuestionResults.push({ questionId: qId, correct: false, status: 'Unanswered' });
        continue;
      }
      const testCases = Array.isArray(question.test_cases)
        ? question.test_cases
        : JSON.parse(question.test_cases || '[]');
      if (testCases.length === 0) {
        return NextResponse.json({ error: `Exam question ${qId} has no grading test cases` }, { status: 409 });
      }
      const runResult: any = await executeCode(question.language, userAnswer, testCases);
      const correct = runResult.status === 'Accepted';
      if (correct) correctCount++;
      perQuestionResults.push({ questionId: qId, correct, status: runResult.status || 'Execution Error' });
    }

    const scorePercent = Number(((correctCount / total) * 100).toFixed(2));
    // Passing threshold: strictly more than 85%.
    const passed = scorePercent > 85.0;

    await client.query('BEGIN');
    transactionStarted = true;

    // Re-check under a row lock so concurrent duplicate submissions cannot
    // both record attempts/certificates for one session.
    const lockedSession = await client.query(
      'SELECT submitted_at FROM exam_sessions WHERE id = $1 FOR UPDATE',
      [session_id]
    );
    if (lockedSession.rows.length === 0 || lockedSession.rows[0].submitted_at) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json({ error: 'This exam session has already been submitted' }, { status: 409 });
    }

    let pointsAwarded = 0;
    let certificate = null;
    let attemptId: number;

    if (passed) {
      const previousPass = await client.query(
        `SELECT id FROM exam_attempts WHERE user_id = $1 AND course_id = $2 AND passed = true`,
        [userPayload.id, course_id]
      );

      if (previousPass.rows.length === 0) {
        await adjustPointsWithLedger(
          client,
          userPayload.id,
          10,
          'EXAM_PASSED',
          'exam',
          course_id
        );
        pointsAwarded = 10;
      }

      const attemptRes = await client.query(
        `INSERT INTO exam_attempts (
           user_id, course_id, total_questions, correct_answers, score_percent,
           passed, duration_seconds, violations_count, question_pool, user_answers, points_awarded
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id;`,
        [
          userPayload.id,
          course_id,
          total,
          correctCount,
          scorePercent,
          true,
          durationSeconds,
          violationsCount,
          JSON.stringify(questionIds),
          JSON.stringify(answers),
          pointsAwarded,
        ]
      );
      attemptId = attemptRes.rows[0].id;

      const randomPart1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const randomPart2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const certId = `CN-CERT-2026-${randomPart1}-${randomPart2}`;
      const verifyUrl = `${appUrl}/verify-certificate?id=${certId}`;

      const certRes = await client.query(
        `INSERT INTO certificates (
           id, user_id, course_id, exam_attempt_id, recipient_name,
           course_title, score_percent, is_valid, qr_code_data
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
         RETURNING *;`,
        [
          certId,
          userPayload.id,
          course_id,
          attemptId,
          userPayload.full_name,
          course.title,
          scorePercent,
          verifyUrl,
        ]
      );
      certificate = certRes.rows[0];

      const skillName = course.title.split(' ')[0];
      await client.query(
        `INSERT INTO user_skills (user_id, name, level, is_verified, verified_via)
         VALUES ($1, $2, 'Advanced', true, $3)
         ON CONFLICT DO NOTHING;`,
        [
          userPayload.id,
          skillName,
          `Code Nexus Certified (${course.title}) - Score: ${scorePercent}%`,
        ]
      );

      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Certificate Issued! +10 Points', $2, 'certificate');`,
        [
          userPayload.id,
          `Congratulations! You scored ${scorePercent}% on the ${course.title} Exam and earned an official verified certificate.`,
        ]
      );
    } else {
      const attemptRes = await client.query(
        `INSERT INTO exam_attempts (
           user_id, course_id, total_questions, correct_answers, score_percent,
           passed, duration_seconds, violations_count, question_pool, user_answers, points_awarded
         ) VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, $9, 0)
         RETURNING id;`,
        [
          userPayload.id,
          course_id,
          total,
          correctCount,
          scorePercent,
          durationSeconds,
          violationsCount,
          JSON.stringify(questionIds),
          JSON.stringify(answers),
        ]
      );
      attemptId = attemptRes.rows[0].id;
    }

    await client.query(
      'UPDATE exam_sessions SET submitted_at = NOW(), attempt_id = $2 WHERE id = $1',
      [session_id, attemptId]
    );
    await client.query('COMMIT');
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      passed,
      scorePercent,
      correctCount,
      totalQuestions: total,
      pointsAwarded,
      violationsCount,
      certificate,
      gradingMethod: 'isolated-sandbox-test-cases',
      perQuestionResults,
      message: passed
        ? `Outstanding! You scored ${scorePercent}% (above the 85% requirement) and earned your official Code Nexus Certificate!`
        : `You scored ${scorePercent}%. A score of more than 85% is required to earn the certificate. Review course notes and try again!`,
    });
  } catch (err: any) {
    if (transactionStarted) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    console.error('Exam submit error:', err);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  } finally {
    client.release();
  }
}
