import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { isExamSupportedCourse, progressionForDifficulty, unsupportedExamReason } from '@/lib/questionTaxonomy';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Please log in to start an examination.' }, { status: 401 });
  }

  try {
    const { course_id, question_count = 25 } = await req.json();

    if (!course_id) {
      return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
    }

    const parsedCount = Number(question_count);
    if (!Number.isInteger(parsedCount)) {
      return NextResponse.json({ error: 'question_count must be an integer' }, { status: 400 });
    }
    const count = Math.min(50, Math.max(10, parsedCount));

    const courseRes = await query('SELECT * FROM courses WHERE id = $1', [course_id]);
    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courseRes.rows[0];
    if (!isExamSupportedCourse(course_id)) {
      return NextResponse.json(
        {
          error: `This track does not offer a sandbox-graded certificate exam. ${unsupportedExamReason(course_id)}`,
          reason: unsupportedExamReason(course_id),
          availableQuestions: 0,
          requestedQuestions: count,
          examSupported: false,
        },
        { status: 409 }
      );
    }

    const eligiblePoolRes = await query(
      `SELECT COUNT(*)::int AS count
       FROM questions q
       WHERE q.course_id = $1
         AND q.is_exam_eligible = true
         AND q.validation_status = 'tested'
         AND q.mapping_status = 'mapped'
         AND q.practice_only = false
         AND EXISTS (
           SELECT 1 FROM course_topics t
           WHERE t.id = q.topic_id AND t.course_id = q.course_id
         )
         AND jsonb_typeof(q.test_cases) = 'array'
         AND jsonb_array_length(q.test_cases) >= 3`,
      [course_id]
    );
    const eligiblePoolCount = eligiblePoolRes.rows[0]?.count || 0;
    if (eligiblePoolCount < 25) {
      return NextResponse.json(
        {
          error: `This course has only ${eligiblePoolCount} approved execution-tested exam questions; 25 are required. No generated or unrelated questions were substituted.`,
          availableQuestions: eligiblePoolCount,
          requestedQuestions: count,
          requiredPool: 25,
        },
        { status: 409 }
      );
    }

    // Only execution-validated questions explicitly marked exam-eligible for
    // THIS course may be used. Eligibility alone is not enough: generated,
    // draft and merely reviewed code questions are excluded by the tested
    // status filter as a defense against stale or incorrect flags. There is
    // deliberately no fallback to unrelated tracks: a certificate must not be
    // based on questions from another course.
    const questionsRes = await query(
      `SELECT id, language, course_id, topic_id, title, statement, input_format,
              output_format, constraints, sample_input, sample_output, difficulty
       FROM questions
       WHERE course_id = $1
         AND is_exam_eligible = true
         AND validation_status = 'tested'
         AND mapping_status = 'mapped'
         AND practice_only = false
         AND EXISTS (
           SELECT 1 FROM course_topics t
           WHERE t.id = questions.topic_id AND t.course_id = questions.course_id
         )
         AND jsonb_typeof(test_cases) = 'array'
         AND jsonb_array_length(test_cases) >= 3
       ORDER BY RANDOM()
       LIMIT $2`,
      [course_id, count]
    );

    const examQuestions = questionsRes.rows.map((q) => ({
      ...q,
      progression: progressionForDifficulty(q.difficulty),
    }));
    if (examQuestions.length < count) {
      return NextResponse.json(
        {
          error: `This course does not yet have ${count} eligible, execution-tested exam questions (found ${examQuestions.length}). No generated or unrelated questions were substituted.`,
          availableQuestions: examQuestions.length,
          requestedQuestions: count,
        },
        { status: 409 }
      );
    }

    const durationSeconds = 7200;
    const sessionId = crypto.randomUUID();
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationSeconds * 1000);

    await query(
      `INSERT INTO exam_sessions (id, user_id, course_id, question_pool, duration_seconds, started_at, expires_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
      [
        sessionId,
        userPayload.id,
        course_id,
        JSON.stringify(examQuestions.map((q) => q.id)),
        durationSeconds,
        startedAt.toISOString(),
        expiresAt.toISOString(),
      ]
    );

    return NextResponse.json({
      success: true,
      sessionId,
      course: {
        id: course.id,
        title: course.title,
        passingThresholdPercent: 85,
        pointsOnPass: 10,
      },
      durationSeconds,
      totalQuestions: examQuestions.length,
      questions: examQuestions,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error('Exam start error:', err);
    return NextResponse.json({ error: 'Failed to initialize exam session' }, { status: 500 });
  }
}
