import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { adjustPointsWithLedger } from '@/lib/db';

export async function POST(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClient();
  try {
    const { topic_id, course_id, assignment_code, completed } = await req.json();

    if (!topic_id || !course_id) {
      return NextResponse.json(
        { error: 'topic_id and course_id are required' },
        { status: 400 }
      );
    }

    // The topic must actually belong to the supplied course. Without this
    // composite check a client could mark progress against a mismatched
    // course and distort enrollment/completion accounting.
    const topicRes = await client.query(
      'SELECT id FROM course_topics WHERE id = $1 AND course_id = $2',
      [topic_id, course_id]
    );
    if (topicRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Topic does not belong to the specified course' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // 1. Upsert topic progress
    const isCompleted = completed !== false;
    const hasAssignment = !!assignment_code;

    await client.query(
      `INSERT INTO user_topic_progress (
        user_id, topic_id, course_id, completed, assignment_submitted, assignment_code, last_read_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id, topic_id) DO UPDATE SET
        completed = EXCLUDED.completed,
        assignment_submitted = CASE WHEN EXCLUDED.assignment_submitted THEN true ELSE user_topic_progress.assignment_submitted END,
        assignment_code = COALESCE(EXCLUDED.assignment_code, user_topic_progress.assignment_code),
        last_read_at = NOW();`,
      [userPayload.id, topic_id, course_id, isCompleted, hasAssignment, assignment_code || '']
    );

    // 2. Count total topics and completed topics in this course
    const totalTopicsRes = await client.query(
      `SELECT COUNT(*) as count FROM course_topics WHERE course_id = $1`,
      [course_id]
    );
    const completedTopicsRes = await client.query(
      `SELECT COUNT(*) as count FROM user_topic_progress
       WHERE user_id = $1 AND course_id = $2 AND completed = true`,
      [userPayload.id, course_id]
    );

    const totalCount = parseInt(totalTopicsRes.rows[0].count, 10);
    const completedCount = parseInt(completedTopicsRes.rows[0].count, 10);
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const allDone = totalCount > 0 && completedCount >= totalCount;

    // 3. Upsert Course Enrollment
    const enrollmentRes = await client.query(
      `SELECT is_completed, completion_points_awarded FROM user_course_enrollments
       WHERE user_id = $1 AND course_id = $2`,
      [userPayload.id, course_id]
    );

    let pointsAwarded = 0;
    let newlyCompletedCourse = false;

    if (enrollmentRes.rows.length === 0) {
      // First enrollment
      if (allDone) {
        // Award 50 points
        const { newBalance } = await adjustPointsWithLedger(
          client,
          userPayload.id,
          50,
          'COURSE_COMPLETED',
          'course',
          course_id
        );
        pointsAwarded = 50;
        newlyCompletedCourse = true;

        await client.query(
          `INSERT INTO user_course_enrollments (user_id, course_id, is_completed, completion_points_awarded, progress_percent, completed_at)
           VALUES ($1, $2, true, true, 100, NOW());`,
          [userPayload.id, course_id]
        );
      } else {
        await client.query(
          `INSERT INTO user_course_enrollments (user_id, course_id, is_completed, completion_points_awarded, progress_percent)
           VALUES ($1, $2, false, false, $3);`,
          [userPayload.id, course_id, progressPercent]
        );
      }
    } else {
      const current = enrollmentRes.rows[0];
      if (allDone && !current.completion_points_awarded) {
        // Award 50 points
        await adjustPointsWithLedger(
          client,
          userPayload.id,
          50,
          'COURSE_COMPLETED',
          'course',
          course_id
        );
        pointsAwarded = 50;
        newlyCompletedCourse = true;

        await client.query(
          `UPDATE user_course_enrollments
           SET is_completed = true, completion_points_awarded = true, progress_percent = 100, completed_at = NOW()
           WHERE user_id = $1 AND course_id = $2;`,
          [userPayload.id, course_id]
        );
      } else {
        await client.query(
          `UPDATE user_course_enrollments
           SET progress_percent = $1, is_completed = $2
           WHERE user_id = $3 AND course_id = $4;`,
          [progressPercent, allDone, userPayload.id, course_id]
        );
      }
    }

    if (newlyCompletedCourse) {
      // Create notification
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Course Completed! +50 Points Awarded', 'Congratulations on mastering ' || $2 || '! You earned 50 points and are now eligible for the Certification Exam.', 'course');`,
        [userPayload.id, course_id]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      completed: isCompleted,
      progressPercent,
      completedCount,
      totalCount,
      allDone,
      pointsAwarded,
      newlyCompletedCourse,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Progress POST error:', err);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  } finally {
    client.release();
  }
}
