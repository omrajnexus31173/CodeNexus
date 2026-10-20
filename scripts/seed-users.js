const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig, isPlaceholderValue } = require('./lib/database-url');

const pool = new Pool({
  connectionString: requireDatabaseUrl()
});

function requireSeedPassword(name) {
  const value = process.env[name]?.trim();
  if (!value || isPlaceholderValue(value) || value.length < 12 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new Error(`${name} must be set to a unique password of 12-72 UTF-8 bytes before seeding demo users.`);
  }
  return value;
}

async function seedUsers() {
  const client = await pool.connect();
  try {
    console.log('--- Seeding Initial Users, Profiles, and Progress ---');
    await client.query('BEGIN');

    const adminPasswordHash = await bcrypt.hash(requireSeedPassword('SEED_ADMIN_PASSWORD'), 12);
    const studentPasswordHash = await bcrypt.hash(requireSeedPassword('SEED_STUDENT_PASSWORD'), 12);

    // 1. Create Admin
    const adminRes = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_verified, points, theme_preference, custom_bg_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role, is_verified = EXCLUDED.is_verified, points = 500
      RETURNING id;
    `, ['admin@codenexus.dev', adminPasswordHash, 'Administrator', 'admin', true, 500, 'dark', '#0a0f1d']);
    const adminId = adminRes.rows[0].id;

    // 2. Create Student Alex Morgan
    const studentRes = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_verified, points, theme_preference, custom_bg_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role, is_verified = EXCLUDED.is_verified, points = 190
      RETURNING id;
    `, ['alex.dev@codenexus.io', studentPasswordHash, 'Alex Morgan', 'student', true, 190, 'dark', '#0a0f1d']);
    const studentId = studentRes.rows[0].id;

    // Career Profile for Alex
    await client.query(`
      INSERT INTO career_profiles (
        user_id, headline, bio, career_objective, phone, location,
        github_url, linkedin_url, portfolio_url, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        career_objective = EXCLUDED.career_objective,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location;
    `, [
      studentId,
      'Full-Stack & Systems Developer | C++ & Python Specialist',
      'Passionate software craftsman building scalable web systems, low-latency algorithms, and robust microservices.',
      'Seeking High-Impact Software Engineering roles focusing on backend systems, cloud architectures, and developer tooling.',
      '+1 (555) 234-5678',
      'San Francisco, CA',
      'https://github.com/alexmorgan-dev',
      'https://linkedin.com/in/alexmorgan-dev',
      'https://alexmorgan.dev',
      true
    ]);

    // Skills for Alex
    await client.query(`DELETE FROM user_skills WHERE user_id = $1`, [studentId]);
    const skills = [
      { name: 'C++', level: 'Advanced', is_verified: true, verified_via: 'Code Nexus C++ Certification Exam Score: 92%' },
      { name: 'Python', level: 'Advanced', is_verified: true, verified_via: 'Code Nexus Python Assessment Score: 95%' },
      { name: 'PostgreSQL & SQL', level: 'Intermediate', is_verified: false, verified_via: '' },
      { name: 'Data Structures & Algorithms', level: 'Advanced', is_verified: false, verified_via: '' },
      { name: 'JavaScript & React', level: 'Intermediate', is_verified: false, verified_via: '' },
      { name: 'Linux & Docker', level: 'Intermediate', is_verified: false, verified_via: '' }
    ];
    for (const s of skills) {
      await client.query(`
        INSERT INTO user_skills (user_id, name, level, is_verified, verified_via)
        VALUES ($1, $2, $3, $4, $5);
      `, [studentId, s.name, s.level, s.is_verified, s.verified_via]);
    }

    // Work Experiences (Max 2 photos per experience constraint)
    await client.query(`DELETE FROM work_experiences WHERE user_id = $1`, [studentId]);
    await client.query(`
      INSERT INTO work_experiences (user_id, role, company, location, start_date, end_date, is_current, description, photo_1, photo_2)
      VALUES 
      ($1, 'Junior Backend Developer', 'Apex Cloud Systems', 'San Francisco, CA', '2024', 'Present', true, 'Engineered high-throughput microservices using Node.js, C++, and PostgreSQL. Optimized SQL queries cutting P99 latency by 40%. Participated in system architecture reviews and CI/CD automation.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80'),
      ($1, 'Software Engineering Intern', 'ByteWave Solutions', 'Austin, TX', 'May 2023', 'Aug 2023', false, 'Developed automated data ingestion pipelines in Python. Designed real-time telemetry dashboards using modern JavaScript and WebSockets.', '', '');
    `, [studentId]);

    // Education
    await client.query(`DELETE FROM education WHERE user_id = $1`, [studentId]);
    await client.query(`
      INSERT INTO education (user_id, degree, institution, year_start, year_end, grade_or_gpa, details)
      VALUES ($1, 'B.S. in Computer Science', 'University of California, Berkeley', '2020', '2024', '3.85 / 4.0', 'Coursework: Operating Systems, Algorithms & Complexity, Database System Architecture, Computer Networks.');
    `, [studentId]);

    // Projects
    await client.query(`DELETE FROM user_projects WHERE user_id = $1`, [studentId]);
    await client.query(`
      INSERT INTO user_projects (user_id, title, description, technologies, repo_url, live_url)
      VALUES 
      ($1, 'Distributed Task Queue Engine', 'A high-performance thread-pool worker queue in modern C++ with low-latency priority queuing and graceful shutdown.', ARRAY['C++', 'POSIX Threads', 'Networking'], 'https://github.com/alexmorgan-dev/distributed-task-queue', ''),
      ($1, 'Real-Time Code Execution Engine', 'Secure sandboxed runner executing untrusted code with resource isolation, CPU timeouts, and test evaluation.', ARRAY['Python', 'Node.js', 'PostgreSQL', 'Docker'], 'https://github.com/alexmorgan-dev/sandbox-code-runner', 'https://runner.alexmorgan.dev');
    `, [studentId]);

    // Point Ledger entries for Alex (190 points total)
    await client.query(`DELETE FROM point_ledger WHERE user_id = $1`, [studentId]);
    await client.query(`
      INSERT INTO point_ledger (user_id, amount, reason, reference_type, reference_id, balance_after)
      VALUES 
      ($1, 50, 'COURSE_COMPLETED', 'course', 'c-lang', 50),
      ($1, 10, 'EXAM_PASSED', 'exam', 'c-lang-exam-1', 60),
      ($1, 50, 'COURSE_COMPLETED', 'course', 'cpp', 110),
      ($1, 10, 'EXAM_PASSED', 'exam', 'cpp-exam-1', 120),
      ($1, 4, 'PRACTICE_SOLVED', 'question', 'py-001', 124),
      ($1, 4, 'PRACTICE_SOLVED', 'question', 'py-002', 128),
      ($1, 4, 'PRACTICE_SOLVED', 'question', 'py-003', 132),
      ($1, 4, 'PRACTICE_SOLVED', 'question', 'c-001', 136),
      ($1, 4, 'PRACTICE_SOLVED', 'question', 'c-002', 140),
      ($1, 50, 'COURSE_COMPLETED', 'course', 'python', 190);
    `, [studentId]);

    // Exam Attempt & Certificate
    const examRes = await client.query(`
      INSERT INTO exam_attempts (
        user_id, course_id, total_questions, correct_answers, score_percent,
        passed, duration_seconds, violations_count, question_pool, user_answers, points_awarded
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id;
    `, [
      studentId, 'cpp', 50, 46, 92.00,
      true, 3720, 0, JSON.stringify(['cpp-001', 'cpp-002']), JSON.stringify({ 'cpp-001': 'A' }), 10
    ]);
    const examAttemptId = examRes.rows[0].id;

    const certId = 'CN-CERT-2026-9A82-C104';
    await client.query(`
      INSERT INTO certificates (
        id, user_id, course_id, exam_attempt_id, recipient_name,
        course_title, score_percent, is_valid, qr_code_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET score_percent = EXCLUDED.score_percent;
    `, [
      certId, studentId, 'cpp', examAttemptId, 'Alex Morgan',
      'C++ Modern & Object-Oriented Programming', 92.00, true,
      `http://localhost:3000/verify-certificate?id=${certId}`
    ]);

    // Initial course enrollments
    await client.query(`
      INSERT INTO user_course_enrollments (user_id, course_id, is_completed, completion_points_awarded, progress_percent)
      VALUES 
      ($1, 'c-lang', true, true, 100),
      ($1, 'cpp', true, true, 100),
      ($1, 'python', false, false, 65)
      ON CONFLICT (user_id, course_id) DO UPDATE SET progress_percent = EXCLUDED.progress_percent;
    `, [studentId]);

    await client.query('COMMIT');
    console.log('✅ Initial users, career profile, certificate, and ledger seeded successfully!');
    console.log('Seeded local accounts: admin@codenexus.dev and alex.dev@codenexus.io (passwords were supplied through environment variables and are not logged).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
