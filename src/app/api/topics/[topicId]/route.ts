import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const userPayload = getUserFromRequest(req);

    const topicRes = await query(
      `SELECT t.*, c.title as course_title, c.slug as course_slug
       FROM course_topics t
       JOIN courses c ON t.course_id = c.id
       WHERE t.id = $1`,
      [topicId]
    );

    if (topicRes.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const rawTopic = topicRes.rows[0];

    // Never ship quiz answers/explanations before submission. The client
    // receives only the question text and options; scoring happens in
    // POST /api/topics/[topicId]/quiz.
    const rawQuiz = Array.isArray(rawTopic.quiz_questions)
      ? rawTopic.quiz_questions
      : JSON.parse(rawTopic.quiz_questions || '[]');
    const topic = {
      ...rawTopic,
      quiz_questions: rawQuiz.map((q: any, index: number) => ({
        id: q.id ?? index + 1,
        type: q.type,
        question: q.question,
        options: q.options,
      })),
    };

    // Find neighboring topics for Prev / Next navigation.
    // order_index is per-unit, so global lesson order must sort by the
    // parent unit's order first, then the topic's order within its unit
    // (with id as a stable tie-breaker).
    const allCourseTopicsRes = await query(
      `SELECT t.id, t.title, t.order_index
       FROM course_topics t
       LEFT JOIN course_units u ON u.id = t.unit_id
       WHERE t.course_id = $1
       ORDER BY COALESCE(u.order_index, 0) ASC, t.order_index ASC, t.id ASC`,
      [topic.course_id]
    );
    const allTopics = allCourseTopicsRes.rows;
    const currentIndex = allTopics.findIndex((t) => t.id === topic.id);
    const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

    // Check user topic progress and any previously submitted quiz.
    let userProgress = null;
    let quizProgress = null;
    if (userPayload) {
      const progressRes = await query(
        `SELECT * FROM user_topic_progress WHERE user_id = $1 AND topic_id = $2`,
        [userPayload.id, topic.id]
      );
      if (progressRes.rows.length > 0) {
        userProgress = progressRes.rows[0];
      }

      const quizRes = await query(
        `SELECT answers, score, total_questions, submitted_at, updated_at
         FROM user_topic_quiz_attempts
         WHERE user_id = $1 AND topic_id = $2`,
        [userPayload.id, topic.id]
      );
      if (quizRes.rows.length > 0) {
        const attempt = quizRes.rows[0];
        const answers = Array.isArray(attempt.answers) ? attempt.answers : JSON.parse(attempt.answers || '[]');
        if (answers.length === rawQuiz.length) {
          // Correct answers/explanations are returned only because this user
          // already submitted this topic's quiz.
          quizProgress = {
            answers,
            score: attempt.score,
            totalQuestions: attempt.total_questions,
            submittedAt: attempt.submitted_at,
            updatedAt: attempt.updated_at,
            correctIndices: rawQuiz.map((q: any) => q.correct_index),
            explanations: rawQuiz.map((q: any) => q.explanation),
            results: rawQuiz.map((q: any, i: number) => answers[i] === q.correct_index),
          };
        }
      }
    }

    return NextResponse.json({
      topic,
      prevTopic,
      nextTopic,
      userProgress,
      quizProgress,
    });
  } catch (err: any) {
    console.error('Topic detail GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
