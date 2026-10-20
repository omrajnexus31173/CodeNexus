import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userPayload = getUserFromRequest(req);
    const suppliedCredential = req.headers.get('Authorization') || req.cookies.get('cn_auth_token')?.value;
    if (suppliedCredential && !userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = await req.json();
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers must be an array' }, { status: 400 });
    }

    const topicRes = await query(
      'SELECT id, course_id, quiz_questions FROM course_topics WHERE id = $1',
      [(await params).topicId]
    );
    if (topicRes.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const topic = topicRes.rows[0];
    const quiz = Array.isArray(topic.quiz_questions)
      ? topic.quiz_questions
      : JSON.parse(topic.quiz_questions || '[]');

    if (answers.length !== quiz.length) {
      return NextResponse.json(
        { error: `Expected ${quiz.length} answers, received ${answers.length}` },
        { status: 400 }
      );
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      if (answer === null) continue;
      if (!Number.isInteger(answer) || answer < 0 || answer >= quiz[i].options.length) {
        return NextResponse.json(
          { error: `Answer ${i + 1} is outside the valid option range` },
          { status: 400 }
        );
      }
    }

    const results = quiz.map((q: any, i: number) => answers[i] === q.correct_index);
    const score = results.filter(Boolean).length;

    let persisted = false;
    if (userPayload) {
      await query(
        `INSERT INTO user_topic_quiz_attempts (
           user_id, topic_id, course_id, answers, score, total_questions, submitted_at, updated_at
         ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, NOW(), NOW())
         ON CONFLICT (user_id, topic_id) DO UPDATE SET
           course_id = EXCLUDED.course_id,
           answers = EXCLUDED.answers,
           score = EXCLUDED.score,
           total_questions = EXCLUDED.total_questions,
           updated_at = NOW()`,
        [userPayload.id, topic.id, topic.course_id, JSON.stringify(answers), score, quiz.length]
      );
      persisted = true;
    }

    return NextResponse.json({
      success: true,
      persisted,
      score,
      totalQuestions: quiz.length,
      answers,
      correctIndices: quiz.map((q: any) => q.correct_index),
      explanations: quiz.map((q: any) => q.explanation),
      results,
    });
  } catch (err: any) {
    console.error('Topic quiz POST error:', err);
    return NextResponse.json({ error: 'Failed to score quiz' }, { status: 500 });
  }
}
