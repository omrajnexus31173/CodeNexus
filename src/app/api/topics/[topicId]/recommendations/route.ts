import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { progressionForDifficulty } from '@/lib/questionTaxonomy';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const userPayload = getUserFromRequest(req);
    const rawLimit = parseInt(new URL(req.url).searchParams.get('limit') || '5', 10);
    const limit = Number.isInteger(rawLimit) ? Math.min(10, Math.max(1, rawLimit)) : 5;

    const topicRes = await query(
      'SELECT id, course_id, title FROM course_topics WHERE id = $1',
      [topicId]
    );
    if (topicRes.rows.length === 0) {
      return NextResponse.json({ error: 'Lesson topic not found' }, { status: 404 });
    }
    const topic = topicRes.rows[0];

    const recommendationsRes = userPayload
      ? await query(
          `SELECT q.id, q.language, q.course_id, q.topic_id, q.difficulty,
                  q.title, q.tags, q.task_type, q.expected_time_complexity,
                  q.validation_status, q.is_exam_eligible,
                  attempt.status AS attempt_status
             FROM questions q
             LEFT JOIN user_question_attempts attempt
               ON attempt.question_id = q.id AND attempt.user_id = $3
            WHERE q.topic_id = $1
              AND q.course_id = $2
              AND q.mapping_status = 'mapped'
              AND q.validation_status = 'tested'
            ORDER BY
              CASE WHEN attempt.status = 'solved' THEN 1 ELSE 0 END,
              CASE q.difficulty WHEN 'Easy' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END,
              q.id
            LIMIT $4`,
          [topic.id, topic.course_id, userPayload.id, limit]
        )
      : await query(
          `SELECT id, language, course_id, topic_id, difficulty, title, tags,
                  task_type, expected_time_complexity, validation_status,
                  is_exam_eligible, NULL AS attempt_status
             FROM questions
            WHERE topic_id = $1
              AND course_id = $2
              AND mapping_status = 'mapped'
              AND validation_status = 'tested'
            ORDER BY
              CASE difficulty WHEN 'Easy' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END,
              id
            LIMIT $3`,
          [topic.id, topic.course_id, limit]
        );

    const recommendations = recommendationsRes.rows.map((q: any) => ({
      ...q,
      progression: progressionForDifficulty(q.difficulty),
      recommendation_reason: 'Execution-tested question mapped to this lesson topic.',
    }));

    return NextResponse.json({
      topic: {
        id: topic.id,
        course_id: topic.course_id,
        title: topic.title,
      },
      recommendations,
      fallback_used: false,
      message: recommendations.length
        ? undefined
        : 'No execution-tested practice question is mapped to this lesson yet. No unrelated or generated question was substituted.',
    });
  } catch (err: any) {
    console.error('Topic recommendations GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch topic practice recommendations' }, { status: 500 });
  }
}
