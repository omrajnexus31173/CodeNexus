# Code Nexus — Database Setup & Architecture Guide

Welcome to the **Code Nexus** database setup documentation! This guide is written in clear, simple language so anyone can set up, verify, migrate, and backup the PostgreSQL database without guessing.

---

## 1. Selected Database Provider: PostgreSQL

### Why PostgreSQL?
- **Industrial Reliability**: Full ACID transactions, row-level concurrency, and rock-solid relational integrity for student progress, point ledgers, and certifications.
- **Auditable Financial-Grade Ledger**: Point awards and deductions are recorded as immutable transaction rows.
- **Native JSONB Support**: Handles complex multi-language starter code, test case matrices, and randomized examination answer tracking.
- **Universal Portability**: Runs locally on Linux/macOS/Windows, or on free managed cloud tiers like **Neon Serverless**, **Supabase**, **Railway**, or **Render**.

---

## 2. Fast Local Setup (Already Running in this Environment)

Configure local PostgreSQL 17 through `.env`; credentials are intentionally not documented or hard-coded. Use a locally provisioned database/user and set:

```env
DATABASE_URL=postgresql://<db_user>:<db_password>@localhost:5432/<db_name>
```

The application and maintenance scripts fail closed when `DATABASE_URL` is missing or still contains placeholder credentials.

To start PostgreSQL locally if ever stopped:
```bash
sudo service postgresql start
```

---

## 3. Alternative: Using Free Cloud PostgreSQL (Neon / Supabase / Railway)

If you wish to deploy Code Nexus online:

### Option A: Neon Serverless PostgreSQL (Recommended & Fastest)
1. Go to [neon.tech](https://neon.tech) and click **Sign Up** (Free).
2. Click **Create Project**, name it `code-nexus-db`, and choose your nearest region.
3. Copy **two different** connection strings from Neon's Connection Details:
   - **Pooled (`-pooler`) endpoint** for application runtime, especially serverless hosting.
   - **Direct/unpooled endpoint** for migrations, dumps, and maintenance scripts.
4. Put them in the maintenance machine's private `.env` (never commit it):
   ```env
   DATABASE_URL=postgresql://<db_user>:<db_password>@<pooler-host>/<db_name>?sslmode=require
   DATABASE_URL_UNPOOLED=postgresql://<db_user>:<db_password>@<direct-host>/<db_name>?sslmode=require
   ```
   The running application reads only `DATABASE_URL`; the bootstrap and verifier prefer `DATABASE_URL_UNPOOLED` for maintenance.
5. Create the complete ordered schema and repository base content:
   ```bash
   npm ci
   npm run db:bootstrap:content
   npm run verify:db
   ```
   This runs base schema creation, course/129-topic seeding, education/learning-integrity/question-architecture/auth migrations, the original 141 question IDs, and library resources in order. It does not create demo users. Never run `seed-users.js` against a public production database.

Those base commands do **not** by themselves restore the exact audited 18,191-row local bank. Build/start the app, run the curriculum example validators with `--mark-tested`, then follow the evidence order in `README.md`: topic-linked validation → curated audit → verified-core validation → topic/core seeding → `node scripts/apply-question-architecture.js` → `node scripts/approve-verified-core.js` → `node scripts/verify-final-question-bank.js`. The 17,859 legacy pipeline rows must be restored from a database backup if exact preservation is required; the source ZIP is not a PostgreSQL dump, and the legacy generator is disabled by default.

---

## 4. Automated Database Scripts Reference

| Command | Action | Description |
| :--- | :--- | :--- |
| `node scripts/init-db.js` | **Base Schema** | Creates the base relational tables, foreign keys, and indexes; later ordered migrations complete the current 27-table schema. |
| `npm run db:bootstrap` | **Ordered Schema Bootstrap** | Runs schema creation and all current migrations in order without seeding content or users. |
| `npm run db:bootstrap:content` | **Ordered Content Bootstrap** | Runs the schema bootstrap plus course, 129-topic, base-question, and library seeders, then verifies core content. Never seeds users. |
| `node scripts/seed-courses.js` | **Course Syllabus** | Seeds 10 programming tracks, units, and base topic rows. |
| `npm run migrate:education` | **Curriculum Migration** | Idempotently adds 14-section educational columns/indexes to `course_topics` and repairs legacy question→course linkage (`fullstack-js`→`javascript`, `sql`→`sql-databases`). |
| `npm run seed:education` | **Curriculum Content** | Applies the complete 129-topic, 14-section curriculum from `scripts/curriculum/` (idempotent; preserves user progress, points, and certificates). |
| `npm run test:curriculum` | **Curriculum Tests** | 46 checks: engine schema, 10-track/129-topic 14-section completeness, sandbox smoke tests, data-preservation audit. |
| `npm run test:examples` | **Example Execution** | Runs every runnable lesson example + assignment solution in the bubblewrap sandbox and byte-compares documented expected output. `--mark-tested` promotes passing topics to `validation_status='tested'`. |
| `npm run test:sql` | **SQL Fixtures** | Executes the stored SQL lesson queries against throwaway PostgreSQL TEMP tables and verifies the documented result sets. |
| `npm run report:coverage` | **Coverage Report** | Regenerates `docs/TOPIC_COVERAGE_REPORT.md` (per-track completeness, tested/reviewed status, question linkage, duplicate detection). |
| `node scripts/seed-questions.js` | **Question Bank** | Seeds the original 141 IDs: 9 execution-tested hand-written questions and 132 honestly labelled generated variants (exam-ineligible). |
| `npm run repair:generated` | **Generated Repair** | Transactionally repairs only oracle-provable legacy pipeline reference/output/SQL-fixture defects; promotes nothing. |
| `npm run quarantine:generated` | **Exam Quarantine** | Sets every non-tested question `is_exam_eligible=false` without deleting rows or changing tested eligibility. |
| `npm run audit:generated` | **Generated Audit** | Deterministically audits all 17,991 generated rows and sandbox-executes the current stratified sample (36 rows in the 2026-10-20 run); fails if an unready generated row is exam-eligible. |
| `node scripts/apply-question-architecture.js` | **Question Architecture** | Applies curriculum-129 taxonomy, task/duplicate/difficulty metadata, and fail-closed mapping/eligibility; required before verified-core approval. |
| `node scripts/verify-final-question-bank.js` | **Final Bank Verification** | Queries DB totals/strict pools/defaults and sequentially executes every tested row’s stored reference and starter; writes the final JSON evidence report. |
| `node scripts/seed-library.js` | **Library Resources** | Seeds textbooks, architecture blueprints, and cheatsheets for the 150-pt unlock rule. |
| `node scripts/seed-users.js` | **Local Demo Accounts** | Local-only student/admin profiles using `SEED_STUDENT_PASSWORD`/`SEED_ADMIN_PASSWORD`; never run in public production. |
| `node scripts/verify-db.js` | **Verification Check** | Runs 6 core checks, exits non-zero on failure, and prints no student email. Add `--schema-only` for 3 schema checks or `--require-exam-bank` for a 7th strict-pool check. |
| `node scripts/test-all.js` | **Integration Tests** | Runs 16 automated tests covering registration, scoring, hints, exams & certs. |

---

## 5. Setup Verification Command

To test database connectivity and verify table integrity without exposing secrets:
```bash
node scripts/verify-db.js --schema-only       # connectivity + 27 tables + critical indexes
node scripts/verify-db.js --require-exam-bank # full checks + strict exam pools
```

Sample success summary:
```
1. [PASS] PostgreSQL Connection: Established
2. [PASS] Schema Completeness: All 27 required tables present.
3. [PASS] Performance Indexes: All critical indexes verified.
4. Core Records Count:
   - Courses:            10
   - Topics:             129
   - Practice Questions: 18191
   - Library Resources:  6
   - Users:              <environment-specific>
   [PASS] Core repository content is present.
5. [PASS] Career/ledger relational integrity: No orphan user-owned rows found.
6. [PASS] Point Ledger Integrity: Ledger-backed balances match user points.
7. Strict exam pools: eight supported courses at 25 each
RESULT: 7/7 verification checks passed.
```
The verifier exits non-zero if any required check fails.
---

## 6. Database Schema Entity Relationship Summary

The schema consists of 27 normalized relational tables:
1. `users`: Authentication, bcrypt password hashes, points balance, appearance mode, custom background color.
2. `career_profiles`: Developer headline, bio, career objective, contact information, GitHub/LinkedIn links, public toggle.
3. `user_skills`: Known programming languages and proficiency levels (Beginner, Intermediate, Advanced, Expert), verified badges.
4. `work_experiences`: Professional roles, company, dates, description, and **maximum 2 photos per entry**.
5. `education`: Degree, institution, dates, GPA, academic details.
6. `user_projects`: Project title, description, technologies, GitHub repo link, live deployment link.
7. `courses`: 10 comprehensive courses (C, C++, Python, Java, SQL, Full-Stack, DSA, System Design).
8. `course_units`: Logical curricular units per course.
9. `course_topics`: Lessons with simple English explanations, SVG flowcharts, 2+ code examples each, and assignments.
10. `user_topic_progress`: Topic completion tracking and assignment code.
11. `user_course_enrollments`: Course progress percentage and +50 points completion reward tracker.
12. `questions`: Practice and examination questions with difficulty, test cases, and exactly 2 hints.
13. `user_question_attempts`: Tracks code submissions, hints used (0, 1, or 2), reveal status, and awarded points.
14. `point_ledger`: Auditable financial-grade ledger of all point transactions.
15. `exam_attempts`: Proctored examination session results, randomized question pools, and violation counts.
16. `certificates`: Publicly verifiable certificate records with unique IDs (`CN-CERT-2026-XXXX-XXXX`).
17. `library_resources`: Premium textbooks, notes, and cheat sheets for the 150-point unlock rule.
18. `user_unlocked_resources`: Permanent access ownership tracking for unlocked books.
19. `bookmarks_and_notes`: User bookmarks and personal notes.
20. `notifications`: In-app alert notification centre.
21. `audit_logs`: Administrative actions audit trails.
22. `external_certificates`: User-uploaded external certificates with verification tags.
23. `user_topic_quiz_attempts`: One persisted server-scored quiz attempt per learner/topic, upserted on retake.
24. `exam_sessions`: Server-issued exam sessions that bind a learner to one strict-pool draw and prevent duplicate submission.
25. `verification_tokens`: Hashed, expiring, single-use email-verification tokens.
26. `password_reset_tokens`: Hashed, expiring, single-use password-reset tokens.
27. `rate_limits`: Timestamped auth/email action records used for rate limiting.

---

## 7. Backup and Restoration Procedures

### Creating a Database Backup
```bash
pg_dump -h localhost -U codenexus -d codenexus -F c -b -v -f /home/user/backup_codenexus_$(date +%Y%m%d).dump
```

### Restoring from a Backup

> `pg_restore -c` drops existing objects in the target database. Test-restore to a disposable database first and confirm the exact target before using it on production data.

```bash
pg_restore -h localhost -U codenexus -d codenexus -v -c /home/user/backup_codenexus_20261018.dump
```

---

## 8. Troubleshooting Common Database Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL service stopped | Run `sudo service postgresql start` |
| `password authentication failed` | Incorrect password in `.env` | Ensure `.env` contains the password for the database user you provisioned; no default password exists |
| `SSL off error` on Cloud PG | Cloud provider requires SSL | Append `?sslmode=require` to your connection URL |
| `Table does not exist` | Migrations not yet run | Run `npm run db:bootstrap` for schema only, or `npm run db:bootstrap:content` for a fresh content database |
