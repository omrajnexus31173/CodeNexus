import { NextRequest, NextResponse } from 'next/server';
import { getClient, query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const userPayload = getUserFromRequest(req);

    const targetUserId = userIdParam ? parseInt(userIdParam, 10) : userPayload?.id;

    if (!targetUserId || !Number.isInteger(targetUserId) || targetUserId < 1) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // 1. Fetch User
    const userRes = await query(
      `SELECT id, email, full_name, avatar_url, role, points, created_at FROM users WHERE id = $1`,
      [targetUserId]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userRes.rows[0];

    // 2. Fetch Career Profile
    const profileRes = await query(`SELECT * FROM career_profiles WHERE user_id = $1`, [targetUserId]);
    const profile = profileRes.rows[0] || {};

    // Check privacy if looking at another user's profile
    if (userPayload?.id !== targetUserId && profile.is_public !== true) {
      return NextResponse.json({ isPrivate: true, message: 'This profile is private.' }, { status: 403 });
    }

    // 3. Fetch Skills
    const skillsRes = await query(`SELECT * FROM user_skills WHERE user_id = $1 ORDER BY is_verified DESC, name ASC`, [targetUserId]);

    // 4. Fetch Work Experiences
    const expRes = await query(`SELECT * FROM work_experiences WHERE user_id = $1 ORDER BY id DESC`, [targetUserId]);

    // 5. Fetch Education
    const eduRes = await query(`SELECT * FROM education WHERE user_id = $1 ORDER BY id DESC`, [targetUserId]);

    // 6. Fetch Projects
    const projectsRes = await query(`SELECT * FROM user_projects WHERE user_id = $1 ORDER BY id DESC`, [targetUserId]);

    // 7. Fetch Official Code Nexus Certificates
    const certsRes = await query(
      `SELECT id, course_id, course_title, score_percent, issue_date, is_valid, qr_code_data
       FROM certificates WHERE user_id = $1 AND is_valid = true ORDER BY issue_date DESC`,
      [targetUserId]
    );

    // 8. Fetch External Certificates
    const extCertsRes = await query(`SELECT * FROM external_certificates WHERE user_id = $1 ORDER BY id DESC`, [targetUserId]);

    // 9. Fetch Course Completion Records
    const enrollmentsRes = await query(
      `SELECT e.*, c.title as course_title, c.icon
       FROM user_course_enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.is_completed DESC, e.progress_percent DESC`,
      [targetUserId]
    );

    return NextResponse.json({
      user,
      profile,
      skills: skillsRes.rows,
      workExperiences: expRes.rows,
      education: eduRes.rows,
      projects: projectsRes.rows,
      certificates: certsRes.rows,
      externalCertificates: extCertsRes.rows,
      enrollments: enrollmentsRes.rows,
      isOwner: userPayload?.id === targetUserId,
    });
  } catch (err: any) {
    console.error('Career profile GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch career profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClient();
  try {
    const body = await req.json();
    const {
      headline,
      bio,
      career_objective,
      phone,
      location,
      github_url,
      linkedin_url,
      portfolio_url,
      is_public,
      avatar_url,
      full_name,
      skills,
      workExperiences,
      education,
      projects,
    } = body;

    await client.query('BEGIN');

    // Update user base fields if provided
    if (full_name || avatar_url !== undefined) {
      await client.query(
        `UPDATE users SET
           full_name = COALESCE($1, full_name),
           avatar_url = COALESCE($2, avatar_url),
           updated_at = NOW()
         WHERE id = $3`,
        [full_name, avatar_url, userPayload.id]
      );
    }

    // Upsert career profile
    await client.query(
      `INSERT INTO career_profiles (
        user_id, headline, bio, career_objective, phone, location,
        github_url, linkedin_url, portfolio_url, is_public, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        career_objective = EXCLUDED.career_objective,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        github_url = EXCLUDED.github_url,
        linkedin_url = EXCLUDED.linkedin_url,
        portfolio_url = EXCLUDED.portfolio_url,
        is_public = EXCLUDED.is_public,
        updated_at = NOW();`,
      [
        userPayload.id,
        headline || '',
        bio || '',
        career_objective || '',
        phone || '',
        location || '',
        github_url || '',
        linkedin_url || '',
        portfolio_url || '',
        is_public !== undefined ? is_public : true,
      ]
    );

    // Update Skills if array provided
    if (Array.isArray(skills)) {
      // Keep verified skills, replace self-declared skills
      await client.query(`DELETE FROM user_skills WHERE user_id = $1 AND is_verified = false`, [userPayload.id]);
      for (const s of skills) {
        if (!s.is_verified && s.name && s.name.trim()) {
          await client.query(
            `INSERT INTO user_skills (user_id, name, level, is_verified)
             VALUES ($1, $2, $3, false);`,
            [userPayload.id, s.name.trim(), s.level || 'Intermediate']
          );
        }
      }
    }

    // Update Work Experiences if array provided (enforce max 2 photos)
    if (Array.isArray(workExperiences)) {
      await client.query(`DELETE FROM work_experiences WHERE user_id = $1`, [userPayload.id]);
      for (const exp of workExperiences) {
        if (exp.company && exp.role) {
          await client.query(
            `INSERT INTO work_experiences (
               user_id, role, company, location, start_date, end_date,
               is_current, description, photo_1, photo_2
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
            [
              userPayload.id,
              exp.role.trim(),
              exp.company.trim(),
              exp.location || '',
              exp.start_date || '2023',
              exp.end_date || '',
              !!exp.is_current,
              exp.description || '',
              exp.photo_1 || '',
              exp.photo_2 || '',
            ]
          );
        }
      }
    }

    // Update Education if array provided
    if (Array.isArray(education)) {
      await client.query(`DELETE FROM education WHERE user_id = $1`, [userPayload.id]);
      for (const edu of education) {
        if (edu.degree && edu.institution) {
          await client.query(
            `INSERT INTO education (
               user_id, degree, institution, year_start, year_end, grade_or_gpa, details
             ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [
              userPayload.id,
              edu.degree.trim(),
              edu.institution.trim(),
              edu.year_start || '2020',
              edu.year_end || '',
              edu.grade_or_gpa || '',
              edu.details || '',
            ]
          );
        }
      }
    }

    // Update Projects if array provided
    if (Array.isArray(projects)) {
      await client.query(`DELETE FROM user_projects WHERE user_id = $1`, [userPayload.id]);
      for (const p of projects) {
        if (p.title) {
          const techArr = Array.isArray(p.technologies)
            ? p.technologies
            : (p.technologies || '').split(',').map((t: string) => t.trim()).filter(Boolean);

          await client.query(
            `INSERT INTO user_projects (
               user_id, title, description, technologies, repo_url, live_url
             ) VALUES ($1, $2, $3, $4, $5, $6);`,
            [
              userPayload.id,
              p.title.trim(),
              p.description || '',
              techArr,
              p.repo_url || '',
              p.live_url || '',
            ]
          );
        }
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Career profile updated successfully!',
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Career profile update error:', err);
    return NextResponse.json({ error: 'Failed to update career profile' }, { status: 500 });
  } finally {
    client.release();
  }
}
