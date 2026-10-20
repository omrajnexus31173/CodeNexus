const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const connectionString = requireDatabaseUrl();

const pool = new Pool({
  connectionString,
  ssl: databaseSslConfig(connectionString)
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('--- Initializing Code Nexus PostgreSQL Database ---');

    await client.query('BEGIN');

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT DEFAULT '',
        role VARCHAR(50) DEFAULT 'student',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        points INTEGER DEFAULT 0,
        theme_preference VARCHAR(20) DEFAULT 'dark',
        custom_bg_color VARCHAR(30) DEFAULT '#0a0f1d',
        editor_theme VARCHAR(50) DEFAULT 'vs-dark',
        editor_font_size INTEGER DEFAULT 14,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Career Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS career_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        headline VARCHAR(255) DEFAULT 'Aspiring Software Engineer',
        bio TEXT DEFAULT '',
        career_objective TEXT DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        location VARCHAR(150) DEFAULT '',
        github_url TEXT DEFAULT '',
        linkedin_url TEXT DEFAULT '',
        portfolio_url TEXT DEFAULT '',
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. User Skills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced, Expert
        is_verified BOOLEAN DEFAULT FALSE,
        verified_via TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Work Experiences (max 2 photos requirement)
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_experiences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(200) NOT NULL,
        company VARCHAR(200) NOT NULL,
        location VARCHAR(150) DEFAULT '',
        start_date VARCHAR(50) NOT NULL,
        end_date VARCHAR(50) DEFAULT '',
        is_current BOOLEAN DEFAULT FALSE,
        description TEXT DEFAULT '',
        photo_1 TEXT DEFAULT '',
        photo_2 TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Education
    await client.query(`
      CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        degree VARCHAR(200) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        year_start VARCHAR(30) NOT NULL,
        year_end VARCHAR(30) DEFAULT '',
        grade_or_gpa VARCHAR(50) DEFAULT '',
        details TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. User Projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        technologies TEXT[] DEFAULT '{}',
        repo_url TEXT DEFAULT '',
        live_url TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. External Certificates
    await client.query(`
      CREATE TABLE IF NOT EXISTS external_certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(200) NOT NULL,
        issue_date VARCHAR(50) NOT NULL,
        credential_url TEXT DEFAULT '',
        verification_status VARCHAR(50) DEFAULT 'unverified',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'Beginner to Advanced',
        estimated_hours INTEGER DEFAULT 40,
        completion_reward_points INTEGER DEFAULT 50,
        exam_reward_points INTEGER DEFAULT 10,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Course Units
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_units (
        id VARCHAR(150) PRIMARY KEY,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        order_index INTEGER DEFAULT 0
      );
    `);

    // 10. Course Topics (Complete 14-Section Educational Curriculum Engine)
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_topics (
        id VARCHAR(200) PRIMARY KEY,
        unit_id VARCHAR(150) REFERENCES course_units(id) ON DELETE CASCADE,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        content_simple_english TEXT NOT NULL,
        flowchart_code TEXT DEFAULT '',
        diagram_type VARCHAR(50) DEFAULT 'flowchart',
        code_example_1_title VARCHAR(255) NOT NULL,
        code_example_1_code TEXT NOT NULL,
        code_example_1_explanation TEXT NOT NULL,
        code_example_1_output TEXT DEFAULT '',
        code_example_2_title VARCHAR(255) NOT NULL,
        code_example_2_code TEXT NOT NULL,
        code_example_2_explanation TEXT NOT NULL,
        code_example_2_output TEXT DEFAULT '',
        code_example_3_title VARCHAR(255) DEFAULT '',
        code_example_3_code TEXT DEFAULT '',
        code_example_3_explanation TEXT DEFAULT '',
        code_example_3_output TEXT DEFAULT '',
        assignment_prompt TEXT NOT NULL,
        assignment_starter_code TEXT NOT NULL,
        assignment_solution TEXT NOT NULL,
        learning_objectives JSONB DEFAULT '[]'::jsonb,
        prerequisites JSONB DEFAULT '[]'::jsonb,
        expected_outcomes JSONB DEFAULT '[]'::jsonb,
        formal_definition TEXT DEFAULT '',
        hinglish_explanation TEXT DEFAULT '',
        why_it_matters TEXT DEFAULT '',
        when_to_use TEXT DEFAULT '',
        syntax_guide JSONB DEFAULT '{}'::jsonb,
        code_walkthrough JSONB DEFAULT '{}'::jsonb,
        rules_and_restrictions JSONB DEFAULT '[]'::jsonb,
        common_mistakes JSONB DEFAULT '[]'::jsonb,
        comparison_table JSONB DEFAULT '{}'::jsonb,
        diagram_svg TEXT DEFAULT '',
        practical_applications JSONB DEFAULT '[]'::jsonb,
        quiz_questions JSONB DEFAULT '[]'::jsonb,
        key_takeaways JSONB DEFAULT '[]'::jsonb,
        quick_revision_notes TEXT DEFAULT '',
        validation_status VARCHAR(50) DEFAULT 'reviewed',
        tested_at TIMESTAMP WITH TIME ZONE,
        engine_version VARCHAR(20) DEFAULT 'v2.0',
        last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        order_index INTEGER DEFAULT 0
      );
    `);

    // 11. User Topic Progress
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_topic_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        topic_id VARCHAR(200) REFERENCES course_topics(id) ON DELETE CASCADE,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        assignment_submitted BOOLEAN DEFAULT FALSE,
        assignment_code TEXT DEFAULT '',
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic_id)
      );
    `);

    // 11b. Persisted lesson-quiz attempts (server-scored)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_topic_quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic_id VARCHAR(200) NOT NULL REFERENCES course_topics(id) ON DELETE CASCADE,
        course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        answers JSONB NOT NULL DEFAULT '[]'::jsonb,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL DEFAULT 0,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic_id)
      );
    `);

    // 12. User Course Enrollments
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_course_enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        is_completed BOOLEAN DEFAULT FALSE,
        completion_points_awarded BOOLEAN DEFAULT FALSE,
        progress_percent INTEGER DEFAULT 0,
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, course_id)
      );
    `);

    // 13. Questions (Practice & Exam question bank)
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(150) PRIMARY KEY,
        language VARCHAR(50) NOT NULL,
        course_id VARCHAR(100) NOT NULL,
        topic_id VARCHAR(200),
        difficulty VARCHAR(30) DEFAULT 'Easy',
        title VARCHAR(255) NOT NULL,
        statement TEXT NOT NULL,
        input_format TEXT DEFAULT '',
        output_format TEXT DEFAULT '',
        constraints TEXT DEFAULT '',
        sample_input TEXT DEFAULT '',
        sample_output TEXT DEFAULT '',
        starter_code JSONB NOT NULL,
        reference_solution TEXT NOT NULL,
        solution_explanation TEXT NOT NULL,
        hint_1 TEXT NOT NULL,
        hint_2 TEXT NOT NULL,
        test_cases JSONB NOT NULL,
        expected_time_complexity VARCHAR(100) DEFAULT 'O(N)',
        expected_space_complexity VARCHAR(100) DEFAULT 'O(1)',
        tags TEXT[] DEFAULT '{}',
        is_exam_eligible BOOLEAN DEFAULT FALSE,
        validation_status VARCHAR(50) DEFAULT 'generated',
        task_type VARCHAR(100),
        runtime VARCHAR(160),
        input_contract JSONB NOT NULL DEFAULT '{}'::jsonb,
        mapping_status VARCHAR(30) NOT NULL DEFAULT 'unassigned',
        practice_only BOOLEAN NOT NULL DEFAULT TRUE,
        duplicate_signature TEXT,
        difficulty_rationale TEXT,
        validation_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
        generation_schema_version INTEGER NOT NULL DEFAULT 1,
        taxonomy_version VARCHAR(80),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 14. User Question Attempts
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_question_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id VARCHAR(150) REFERENCES questions(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'attempted', -- 'solved', 'attempted', 'revealed'
        hints_used INTEGER DEFAULT 0, -- 0, 1, or 2
        revealed_solution BOOLEAN DEFAULT FALSE,
        points_awarded INTEGER DEFAULT 0,
        submitted_code TEXT DEFAULT '',
        language VARCHAR(50) DEFAULT 'python',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id)
      );
    `);

    // 15. Point Ledger (auditable point transactions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS point_ledger (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        reason VARCHAR(100) NOT NULL,
        reference_type VARCHAR(50) DEFAULT '',
        reference_id VARCHAR(150) DEFAULT '',
        balance_after INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 16. Exam Attempts
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        score_percent NUMERIC(5,2) NOT NULL,
        passed BOOLEAN NOT NULL,
        duration_seconds INTEGER DEFAULT 0,
        violations_count INTEGER DEFAULT 0,
        question_pool JSONB NOT NULL,
        user_answers JSONB NOT NULL,
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 16b. Server-issued one-time exam sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        id UUID PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        question_pool JSONB NOT NULL,
        duration_seconds INTEGER NOT NULL DEFAULT 7200,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        submitted_at TIMESTAMP WITH TIME ZONE,
        attempt_id INTEGER REFERENCES exam_attempts(id) ON DELETE SET NULL
      );
      ALTER TABLE questions
        ADD COLUMN IF NOT EXISTS task_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS runtime VARCHAR(160),
        ADD COLUMN IF NOT EXISTS input_contract JSONB NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS mapping_status VARCHAR(30) NOT NULL DEFAULT 'unassigned',
        ADD COLUMN IF NOT EXISTS practice_only BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS duplicate_signature TEXT,
        ADD COLUMN IF NOT EXISTS difficulty_rationale TEXT,
        ADD COLUMN IF NOT EXISTS validation_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS generation_schema_version INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS taxonomy_version VARCHAR(80);
      CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
      CREATE INDEX IF NOT EXISTS idx_questions_course_exam ON questions(course_id, is_exam_eligible, validation_status);
      CREATE INDEX IF NOT EXISTS idx_questions_mapping_topic ON questions(mapping_status, topic_id, course_id);
      CREATE INDEX IF NOT EXISTS idx_questions_verified_pool ON questions(course_id, validation_status, is_exam_eligible, practice_only, difficulty);
      CREATE INDEX IF NOT EXISTS idx_questions_duplicate_signature ON questions(duplicate_signature);
    `);

    // 17. Certificates
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(150) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        exam_attempt_id INTEGER REFERENCES exam_attempts(id) ON DELETE SET NULL,
        recipient_name VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        score_percent NUMERIC(5,2) NOT NULL,
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_valid BOOLEAN DEFAULT TRUE,
        qr_code_data TEXT DEFAULT ''
      );
    `);

    // 18. Library Resources
    await client.query(`
      CREATE TABLE IF NOT EXISTS library_resources (
        id VARCHAR(150) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
        language VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL, -- 'Notes', 'Book', 'Cheat Sheet', 'Diagram Guide'
        difficulty VARCHAR(50) DEFAULT 'All Levels',
        author VARCHAR(150) DEFAULT 'Code Nexus Editorial Team',
        description TEXT NOT NULL,
        file_size VARCHAR(50) DEFAULT '3.4 MB',
        pages_or_read_time VARCHAR(50) DEFAULT '120 pages',
        unlock_cost INTEGER DEFAULT 150,
        content_summary TEXT NOT NULL,
        pdf_preview_text TEXT NOT NULL,
        is_premium BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 19. User Unlocked Resources
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_unlocked_resources (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        resource_id VARCHAR(150) REFERENCES library_resources(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        points_spent INTEGER DEFAULT 150,
        UNIQUE(user_id, resource_id)
      );
    `);

    // 20. Bookmarks & Notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks_and_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL, -- 'question', 'topic', 'resource'
        item_id VARCHAR(200) NOT NULL,
        user_note TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 21. Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 22. Audit Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER,
        action VARCHAR(150) NOT NULL,
        target_type VARCHAR(50) DEFAULT '',
        target_id VARCHAR(150) DEFAULT '',
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 23. Verification Tokens (SHA-256 hash storage)
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 24. Password Reset Tokens (SHA-256 hash storage)
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 25. Rate Limits
    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        identifier VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create useful indexes for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_hash ON verification_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_expires ON verification_tokens(user_id, expires_at);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_expires ON password_reset_tokens(user_id, expires_at);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_action_ident ON rate_limits(action, identifier, created_at);
      CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(language);
      CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
      CREATE INDEX IF NOT EXISTS idx_topics_course ON course_topics(course_id);
      CREATE INDEX IF NOT EXISTS idx_topics_unit ON course_topics(unit_id);
      CREATE INDEX IF NOT EXISTS idx_point_ledger_user ON point_ledger(user_id);
      CREATE INDEX IF NOT EXISTS idx_attempts_user_q ON user_question_attempts(user_id, question_id);
      CREATE INDEX IF NOT EXISTS idx_certs_user ON certificates(user_id);
      CREATE INDEX IF NOT EXISTS idx_certs_id ON certificates(id);
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL Schema initialized successfully with all 22 tables and indexes!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize database schema:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
