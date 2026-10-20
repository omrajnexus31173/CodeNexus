import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { isExamSupportedCourse, unsupportedExamReason } from '@/lib/questionTaxonomy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);

    // Get courses with topic counts
    const coursesRes = await query(`
      SELECT 
        c.id, c.title, c.slug, c.description, c.icon, c.difficulty,
        c.estimated_hours, c.completion_reward_points, c.exam_reward_points, c.order_index,
        COUNT(DISTINCT ct.id) as topic_count,
        COUNT(DISTINCT cu.id) as unit_count,
        (
          SELECT COUNT(*)
          FROM questions q
          WHERE q.course_id = c.id
            AND q.is_exam_eligible = true
            AND q.validation_status = 'tested'
            AND q.mapping_status = 'mapped'
            AND q.practice_only = false
            AND EXISTS (
              SELECT 1 FROM course_topics exam_topic
              WHERE exam_topic.id = q.topic_id AND exam_topic.course_id = q.course_id
            )
            AND jsonb_typeof(q.test_cases) = 'array'
            AND jsonb_array_length(q.test_cases) >= 3
        ) as exam_question_count,
        (
          SELECT jsonb_build_object(
            'Beginner', COUNT(*) FILTER (WHERE q.difficulty = 'Easy'),
            'Intermediate', COUNT(*) FILTER (WHERE q.difficulty = 'Medium'),
            'Advanced', COUNT(*) FILTER (WHERE q.difficulty = 'Hard')
          )
          FROM questions q
          WHERE q.course_id = c.id
            AND q.validation_status = 'tested'
            AND q.mapping_status = 'mapped'
            AND EXISTS (
              SELECT 1 FROM course_topics progression_topic
              WHERE progression_topic.id = q.topic_id AND progression_topic.course_id = q.course_id
            )
        ) as progression_counts,
        (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_build_object('id', ct2.id, 'title', ct2.title)
              ORDER BY COALESCE(cu2.order_index, 0), ct2.order_index, ct2.id
            ),
            '[]'::jsonb
          )
          FROM course_topics ct2
          LEFT JOIN course_units cu2 ON cu2.id = ct2.unit_id
          WHERE ct2.course_id = c.id
        ) as topics
      FROM courses c
      LEFT JOIN course_units cu ON c.id = cu.course_id
      LEFT JOIN course_topics ct ON c.id = ct.course_id
      GROUP BY c.id
      ORDER BY c.order_index ASC;
    `);

    let enrollmentsMap: Record<string, { progress_percent: number; is_completed: boolean }> = {};
    if (userPayload) {
      const enrollRes = await query(
        `SELECT course_id, progress_percent, is_completed FROM user_course_enrollments WHERE user_id = $1`,
        [userPayload.id]
      );
      enrollRes.rows.forEach((r) => {
        enrollmentsMap[r.course_id] = {
          progress_percent: r.progress_percent,
          is_completed: r.is_completed,
        };
      });
    }

    const courses = coursesRes.rows.map((course) => {
      const examQuestionCount = parseInt(course.exam_question_count, 10);
      const examSupported = isExamSupportedCourse(course.id);
      return {
        ...course,
        topic_count: parseInt(course.topic_count, 10),
        unit_count: parseInt(course.unit_count, 10),
        exam_question_count: examQuestionCount,
        exam_supported: examSupported,
        exam_available: examSupported && examQuestionCount >= 25,
        exam_unavailable_reason: examSupported
          ? examQuestionCount >= 25
            ? null
            : `Needs 25 eligible tested questions (currently ${examQuestionCount}).`
          : unsupportedExamReason(course.id),
        progression_counts: course.progression_counts || { Beginner: 0, Intermediate: 0, Advanced: 0 },
        userProgress: enrollmentsMap[course.id] || { progress_percent: 0, is_completed: false },
      };
    });

    return NextResponse.json({ courses });
  } catch (err: any) {
    console.error('Courses GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
