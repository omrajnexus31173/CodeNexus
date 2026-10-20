import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { DIFFICULTY_BY_PROGRESSION, progressionForDifficulty } from '@/lib/questionTaxonomy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || '';
    let difficulty = searchParams.get('difficulty') || '';
    const progression = searchParams.get('progression') || '';
    const validationStatus = searchParams.get('validationStatus') || '';
    const courseId = searchParams.get('courseId') || '';
    const topicId = searchParams.get('topicId') || '';
    const search = searchParams.get('search') || '';
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '25', 10);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 25;
    const offset = (page - 1) * limit;

    if (progression && progression !== 'all') {
      const mappedDifficulty = DIFFICULTY_BY_PROGRESSION[progression];
      if (!mappedDifficulty) {
        return NextResponse.json({ error: 'Invalid progression filter' }, { status: 400 });
      }
      difficulty = mappedDifficulty;
    }
    if (validationStatus && validationStatus !== 'all' && !['generated', 'draft', 'reviewed', 'tested'].includes(validationStatus)) {
      return NextResponse.json({ error: 'Invalid validationStatus filter' }, { status: 400 });
    }

    let topicCourseId = '';
    if (topicId && topicId !== 'all') {
      const topicRes = await query('SELECT course_id FROM course_topics WHERE id = $1', [topicId]);
      if (topicRes.rows.length === 0) {
        return NextResponse.json({ error: 'Lesson topic not found' }, { status: 404 });
      }
      topicCourseId = topicRes.rows[0].course_id;
      if (courseId && courseId !== 'all' && courseId !== topicCourseId) {
        return NextResponse.json({
          questions: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          warning: 'The selected topic does not belong to the selected course.',
        });
      }
    }

    const userPayload = getUserFromRequest(req);

    let whereClauses: string[] = [];
    let params: any[] = [];
    let idx = 1;

    if (language && language !== 'all') {
      whereClauses.push(`language = $${idx++}`);
      params.push(language.toLowerCase());
    }
    if (difficulty && difficulty !== 'all') {
      whereClauses.push(`difficulty = $${idx++}`);
      params.push(difficulty);
    }
    if (courseId && courseId !== 'all') {
      whereClauses.push(`course_id = $${idx++}`);
      params.push(courseId);
    }
    if (validationStatus && validationStatus !== 'all') {
      whereClauses.push(`validation_status = $${idx++}`);
      params.push(validationStatus);
    }
    if (topicId && topicId !== 'all') {
      // A topic filter is meaningful only for an actually mapped curriculum
      // topic in the topic's own course. Generated legacy rows are now
      // topic-NULL/unassigned, so they correctly never appear here.
      whereClauses.push(`topic_id = $${idx++}`);
      params.push(topicId);
      whereClauses.push(`course_id = $${idx++}`);
      params.push(topicCourseId);
      whereClauses.push("mapping_status = 'mapped'");
    }
    if (search) {
      whereClauses.push(`(title ILIKE $${idx} OR statement ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count
    const countRes = await query(`SELECT COUNT(*) as total FROM questions ${whereSql}`, params);
    const totalQuestions = parseInt(countRes.rows[0].total, 10);

    // Get paginated questions
    params.push(limit);
    params.push(offset);
    const questionsRes = await query(
      `SELECT id, language, course_id, topic_id, difficulty, title, tags,
              expected_time_complexity, validation_status, is_exam_eligible,
              task_type, runtime, mapping_status, practice_only,
              generation_schema_version, taxonomy_version, created_at
       FROM questions
       ${whereSql}
       ORDER BY id ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    // If user logged in, check user attempt statuses
    let userAttemptsMap: Record<string, { status: string; hints_used: number; points_awarded: number }> = {};
    if (userPayload) {
      const attemptsRes = await query(
        `SELECT question_id, status, hints_used, points_awarded FROM user_question_attempts WHERE user_id = $1`,
        [userPayload.id]
      );
      attemptsRes.rows.forEach((r) => {
        userAttemptsMap[r.question_id] = {
          status: r.status,
          hints_used: r.hints_used,
          points_awarded: r.points_awarded,
        };
      });
    }

    const questions = questionsRes.rows.map((q) => ({
      ...q,
      progression: progressionForDifficulty(q.difficulty),
      userAttempt: userAttemptsMap[q.id] || null,
    }));

    return NextResponse.json({
      questions,
      total: totalQuestions,
      page,
      limit,
      totalPages: Math.ceil(totalQuestions / limit),
    });
  } catch (err: any) {
    console.error('Questions GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
