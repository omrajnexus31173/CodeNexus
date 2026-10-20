import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { isExamSupportedCourse, unsupportedExamReason } from '@/lib/questionTaxonomy';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userPayload = getUserFromRequest(req);

    // Get Course
    const courseRes = await query(`SELECT * FROM courses WHERE id = $1 OR slug = $1`, [courseId]);
    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courseRes.rows[0];

    // Get Units
    const unitsRes = await query(
      `SELECT * FROM course_units WHERE course_id = $1 ORDER BY order_index ASC`,
      [course.id]
    );

    // Get Topics
    const topicsRes = await query(
      `SELECT id, unit_id, course_id, title, description, order_index, diagram_type
       FROM course_topics WHERE course_id = $1 ORDER BY order_index ASC`,
      [course.id]
    );

    const examPoolRes = await query(
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
      [course.id]
    );
    const examQuestionCount = examPoolRes.rows[0]?.count || 0;
    const examSupported = isExamSupportedCourse(course.id);
    const examAvailable = examSupported && examQuestionCount >= 25;
    const courseWithExamState = {
      ...course,
      exam_question_count: examQuestionCount,
      exam_supported: examSupported,
      exam_available: examAvailable,
      exam_unavailable_reason: examAvailable
        ? null
        : examSupported
          ? `Needs 25 eligible tested questions (currently ${examQuestionCount}).`
          : unsupportedExamReason(course.id),
    };

    // Get user progress if logged in
    let completedTopicIds = new Set<string>();
    let enrollment = null;

    if (userPayload) {
      const progressRes = await query(
        `SELECT topic_id FROM user_topic_progress WHERE user_id = $1 AND course_id = $2 AND completed = true`,
        [userPayload.id, course.id]
      );
      progressRes.rows.forEach((r) => completedTopicIds.add(r.topic_id));

      const enrollRes = await query(
        `SELECT * FROM user_course_enrollments WHERE user_id = $1 AND course_id = $2`,
        [userPayload.id, course.id]
      );
      if (enrollRes.rows.length > 0) {
        enrollment = enrollRes.rows[0];
      }
    }

    // Structure units with nested topics
    const structuredUnits = unitsRes.rows.map((unit) => {
      const unitTopics = topicsRes.rows
        .filter((t) => t.unit_id === unit.id)
        .map((t) => ({
          ...t,
          completed: completedTopicIds.has(t.id),
        }));
      return {
        ...unit,
        topics: unitTopics,
      };
    });

    return NextResponse.json({
      course: courseWithExamState,
      units: structuredUnits,
      enrollment,
      totalTopics: topicsRes.rows.length,
      completedCount: completedTopicIds.size,
      percentCompleted:
        topicsRes.rows.length > 0
          ? Math.round((completedTopicIds.size / topicsRes.rows.length) * 100)
          : 0,
    });
  } catch (err: any) {
    console.error('Course detail GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
