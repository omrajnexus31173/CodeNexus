# Code Nexus Repository Recovery Audit — 2026-10-23

## 1. Scope and outcome

- Repository audited: `https://github.com/omrajnexus31173/CodeNexus.git`
- Starting branch/commit: `main` at `bdea929`
- Working branch for this recovery: `fix/deployment-readiness`
- Starting tracked inventory: 223 files, 7,359,348 bytes
- Architecture decision: **keep the existing Next.js/PostgreSQL architecture**. It was usable; no rebuild or feature removal was necessary.
- Deployment outcome at the time of this report: **deployment prepared and locally production-verified, but no public deployment or live URL is claimed**. Account-owned hosting, DNS, database, Resend, and any external execution service still have to be provisioned by the project owner.

The audit inspected the application pages, API routes, database creation/migration/seed scripts, environment contract, auth/session/email code, learning/progress/exam logic, sandbox adapters, production configuration, responsive layout/accessibility, and deployment options before source changes were made.

## 2. Baseline audit

### 2.1 Repository shape at `bdea929`

- 20 App Router pages.
- 29 API route handlers before this recovery; 31 after adding health endpoints.
- 27 PostgreSQL tables after all current migrations.
- Next.js 15.5.28, React/ReactDOM 18.3.1, Node 20 locally.
- Existing security/question-bank work was present in the GitHub clone. Compared with the previously tested local workspace, the only tracked difference was `package.json`: GitHub uses `next start -H 0.0.0.0` without a fixed port so a platform can inject `PORT`.

### 2.2 Exact baseline gates in the fresh clone

| Gate | Baseline result |
| --- | --- |
| `npm ci` | Exit 0; 456 packages added, 457 audited |
| `npm audit --omit=dev --json` | Exit 0; **0 production findings** |
| `npm audit --json` | Exit 1; 3 moderate development-only findings |
| `npx tsc --noEmit` | Exit 0 |
| `npm run lint` | Exit 0 with 13 React Hook `exhaustive-deps` warnings, no errors |
| `npm run build` without `DATABASE_URL` | **Exit 1** during page-data collection for `/api/auth/forgot-password` |

The build failure was traced to `src/lib/db.ts`: it validated `DATABASE_URL` and created the PostgreSQL pool at module import. Next.js imports API route modules during production page-data collection, so a runtime secret was incorrectly required just to build.

JWT and Resend configuration were already lazy and did not block the build.

## 3. Confirmed findings

### Priority 1 — build/startup and deployment architecture

1. **Production build required `DATABASE_URL`.** This breaks hosted builders that correctly keep runtime secrets out of the build stage.
2. **No verified full-function managed-host path was documented.** Local execution requires Bubblewrap, `prlimit`, GCC/G++, OpenJDK, Python, Node, and SQLite. Netlify/serverless and ordinary managed Node services cannot be assumed to provide that environment.
3. **No health/readiness endpoints, Node version pin, Render Blueprint, production preflight, or post-deployment smoke script existed.**

### Priority 2 — database/deployment operations

4. Database setup was spread across many manually ordered scripts; cloud instructions were easy to run out of order and did not clearly separate Neon's pooled runtime URL from a direct maintenance URL.
5. `scripts/verify-db.js` could print a production-ready message even when fewer than all checks passed. It also:
   - listed only 25 required tables, omitting `exam_sessions` and `user_topic_quiz_attempts`;
   - printed a student email;
   - could throw on a fresh database with no student;
   - treated missing critical indexes as a warning; and
   - passed content counts without minimum thresholds.
6. There was no safe, non-destructive bootstrap that made the no-demo-users rule explicit.

### Priority 3 — responsiveness, accessibility, and honesty of UI copy

7. The desktop navbar appeared at `lg`, where seven links plus points/theme/account controls are crowded. Icon-only controls lacked complete accessible state/labels, and the authenticated points pill competed for space on very small screens.
8. The fixed assistant used a 380px minimum window at a 24px right offset, risking horizontal overflow on narrow phones.
9. The keyword-based assistant was labelled “AI Assistant” and claimed broader capabilities than it implements. Its OOP and SQL JOIN quick prompts fell through to a generic response.
10. Website-support copy incorrectly said exams draw from “50–100 questions randomized dynamically.” The implemented strict exams use 25 questions from the exact supported course pool.
11. There was no skip-to-content link, global visible `:focus-visible` rule, or reduced-motion guard.

### Known limits that are not new defects

- Live Resend delivery remains unverified until a real API key, verified sender/domain, and mailbox test exist.
- HTML/CSS and App Development exams remain unavailable: no deterministic grader/runtime is integrated.
- 17 topics remain `reviewed`, not execution-`tested`.
- 17,991 generated questions remain unassigned/practice-only and exam-ineligible; only 200 tested questions form exam pools.
- Local Java sandbox evidence is for OpenJDK 11. OpenJDK 21 sandbox compatibility is not claimed.
- Stateless JWTs are not instantly revocable before expiry.

## 4. Fixes implemented

### 4.1 Lazy, fail-closed database pool

`src/lib/db.ts`:

- Creates the PostgreSQL pool on first `query()`, `getClient()`, `checkDatabaseConnection()`, or default-export property access—not at import.
- Preserves strict runtime validation of `DATABASE_URL`, production TLS rules, and the existing query/point-ledger APIs.
- Caches the pool on `globalThis` to avoid duplicate pools during module reloads.
- Adds `getPool()`, `isDatabaseConfigured()`, and `checkDatabaseConnection()`.
- Supports `DATABASE_POOL_MAX` (clamped to 1–20; default 10).
- Redacts idle-client errors through `safeErrorForLog()`.

### 4.2 Health endpoints

- `GET /api/health`: dependency-free liveness response.
- `GET /api/health/ready`: performs `SELECT 1`; returns generic `ok`, `not_configured`, or `unavailable` states with no host/credential/provider details.

### 4.3 Database bootstrap and verifier

- Added `scripts/bootstrap-database.js` and npm commands `db:bootstrap` / `db:bootstrap:content`.
- The bootstrap runs migrations/seeders in the correct order, prefers `DATABASE_URL_UNPOOLED` for maintenance, never prints a connection string, never seeds users, and requires explicit confirmation before content-seeding a production database.
- Reworked `scripts/verify-db.js` so it checks all 27 tables, requires critical indexes, checks core content minimums and orphan/ledger consistency across users, prints no student email, supports `--schema-only`, and supports `--require-exam-bank`. It exits non-zero on any failed required check.

### 4.4 Deployment tooling and documentation

- Added `scripts/check-production-config.js`: validates the production environment contract without printing secret values; optional `--ping` does one database `SELECT 1`.
- Added `scripts/smoke-production.js`: read-only checks for liveness/readiness, key pages, courses API, unauthenticated session rejection, and baseline security headers.
- Added `.nvmrc` and Node/npm `engines` for Node 20.
- Added `render.yaml` for the web/API layer. It intentionally uses external PostgreSQL and external code execution; it does not pretend Render's managed Node image is the verified Bubblewrap host.
- Added `DEPLOYMENT.md` with VM, Render, and Netlify paths, Neon pooled/direct guidance, environment sources, the external execution JSON contract, update/rollback notes, and live verification steps.
- Updated `.env.example`, `README.md`, and `DATABASE_SETUP.md` for pooled/direct URLs, pool size, bootstrap commands, the 27-table schema, and honest guide/deployment wording.

### 4.5 Responsive/accessible and copy corrections

- Navbar now switches to the full link row at `xl`, closes menus on route change, mutually closes account/theme dropdowns, exposes `aria-expanded`/`aria-haspopup`/`aria-current`, gives icon controls labels, and hides the navbar points pill below 420px (the dashboard still shows the balance).
- The guide widget now fits `min(420px, 100vw - 2rem)` by `min(550px, 100dvh - 2rem)`, uses dialog/input/send labels, `aria-pressed` mode buttons, a polite live region, and no bouncing icon.
- Renamed the keyword assistant to **Code Nexus Guide** in the UI/docs. Added real OOP-encapsulation and SQL JOIN branches and corrected exam copy to 25 strict-pool questions for eight supported courses.
- Added a skip link, focus-visible outline, reduced-motion CSS, and a metadata description that does not depend on a particular database's question count.

## 5. Verification actually performed

### 5.1 Local evidence environment

The recovery test environment used Node 20.20.2, npm 10.8.2, PostgreSQL 17.11, Chromium 156, GCC/G++ 14.2, OpenJDK 11, Python 3.13, Bubblewrap, `prlimit`, and SQLite 3.46.1. A disposable local PostgreSQL database was reconstructed from repository scripts. It is **not** an exact restore of an original production dump, and no real user data was available or fabricated as restored data. Local demo/test accounts were created only in that disposable database.

### 5.2 Database/question-bank reconstruction

- `npm run db:bootstrap:content` passed: 10 courses, 129 topics, 141 base questions, 6 library resources, 0 users; verifier 6/6.
- Explicit legacy-draft reconstruction added 17,859 generated rows, reaching 18,000 before topic/core seeding. They remained generated, unassigned, practice-only, and exam-ineligible.
- Curriculum examples: **400 passed**, 0 execution failures, 0 output mismatches, 87 static-only examples; 100 topics marked tested by that validator.
- PostgreSQL SQL lesson fixtures: **58/58 passed**; 12 SQL topics marked tested (the EXPLAIN topic remains reviewed by design).
- Topic-linked question execution: **79/79 passed**.
- Curated starters/references: **9/9 ok** (starter `Wrong Answer`, reference `Accepted`).
- Verified-core validation: **112/112 passed** across 224 reference/starter executions.
- After seeding and separate approval: 18,191 total = 200 tested + 17,991 generated; each of C, C++, Python, Java, JavaScript, SQL & Databases, DSA, and System Design had strict pool 25; generated/non-tested eligible = 0.
- `node scripts/verify-db.js --require-exam-bank`: **7/7 passed**, including after the API suites.
- Deep structural question-bank audit: passed; all 141 original IDs present, tested-pool canonical duplicates = 0.
- Generated deterministic oracle agreement: **17,991/17,991**; this is deterministic consistency, not exam promotion.
- Generated execution sample in this reconstruction: **34/34 execution-ok and behaviorally consistent**, 0 exam-ready. This was a sample only; the sample size differs from the preserved 2026-10-20 run because the fresh generator produced a different SQL-string cohort.
- SQL string-contract validator in this fresh reconstruction: **0/0** because that legacy string cohort is absent. This run therefore does not claim the preserved historical 186-row cohort result.
- Final question-bank verifier: **passed** with 400 fresh DB executions (200 references and 200 starters), 0 failures/global failures.

Generated evidence JSON files in `scripts/question-bank/` were intentionally restored to the GitHub `bdea929` versions after the local rerun so this recovery branch does not overwrite preserved historical evidence with fresh-generator timestamps/cohort differences.

### 5.3 Application/API suites

| Suite | Result |
| --- | ---: |
| Business/features (`test-all.js`) | **16/16** |
| Security/auth/sandbox (`test-security-suite.js`) | **20/20** |
| Learning integrity API | **61/61** |
| Curriculum engine | **46/46** |
| Curriculum expansion | **29/29** |
| Deep sandbox | **7/7** |
| Topic-linked duplicate/mapping check | 0 failures, 0 warnings |

Security test 20 verifies graceful Resend-provider handling/no token leakage in the local unconfigured-provider environment; it is **not** live email-delivery evidence.

### 5.4 Final clean-install and HTTP/browser gates

Final clean gate after the code/docs changes:

- `npm ci`: exit 0.
- `npm audit --omit=dev --json`: exit 0; **0 production findings across 112 production dependencies**.
- `npm audit --json`: exit 1 with exactly 3 moderate development-only findings: `postcss-selector-parser 6.1.4 <7.1.6` (`GHSA-rj75-hqrm-r3gf`), `postcss-nested 6.2.0`, and direct dev dependency `tailwindcss 3.4.19`. npm's offered fix is the breaking Tailwind 4.3.3 migration; no `npm audit fix --force` was run.
- `npx tsc --noEmit`: exit 0.
- `npm run lint`: exit 0 with the same 13 Hook dependency warnings and no errors.
- `npm run build` with `.env` temporarily removed and database/JWT/Resend secrets unset: **exit 0**. This directly confirms the Priority 1 build fix.
- `PORT=3100 npm start` was verified after the lazy-pool fix: Next used the injected port; `/api/health` returned 200 and `/api/health/ready` returned a generic 503 `not_configured` without a database URL.
- Final local smoke script: **15/15 checks passed**, including database readiness.
- Final `npm test` rerun: 16/16 + 20/20. Final learning-integrity rerun: 61/61.
- Browser audit (Chromium/Playwright, desktop 1440px and mobile 390px): **53/53 passed**. It covered guest pages, protected-dashboard redirect, student/admin login, dashboard/course/topic/practice/exam/library/profile/resume/settings, mobile navigation, and the guide dialog/OOP answer. There were 0 unexpected console/page errors and 0 non-RSC failed requests. Sixteen expected guest `/api/auth/me` 401 resource messages and Next RSC prefetch `ERR_ABORTED` cancellations from rapid test navigation were classified separately.
- Production-config checker: the local development `.env` correctly exits 1 with 5 production failures (non-production mode, loopback app URLs, missing Resend key, test sender). A synthetic production-shaped environment exited 0; that validates only the configuration contract, not live providers.
- Static internal-link scan: 58 static internal references, 0 missing page routes.

## 6. Verified versus unverified

### Verified locally

- Clean install, type-check, lint (warnings only), production build without runtime secrets, and platform-style `PORT` startup.
- PostgreSQL schema/migrations/bootstrap, reconstructed curriculum/question state, strict exam pools, and database persistence.
- Registration data rules, hashed/single-use token handling, unverified-login blocking, verified login, tampered-token/wrong-password rejection, and protected dashboard behavior.
- Topic payload privacy, server-scored quiz persistence/isolation/retake upsert, exact-course progress, hint/reference gating, point rules, exam session ownership, supported/unsupported exam starts, pass/fail grading, certificate issuance, and duplicate-submission rejection.
- Sandboxed execution isolation and multi-language execution in the local Linux environment.
- Desktop/mobile page rendering and key navigation without unexpected browser errors.

### Not verified

- Any public deployment, live domain/TLS, hosted PostgreSQL connection, hosted middleware/cookie behavior, or platform cold-start behavior.
- Live Resend signup/password-reset delivery to a real mailbox.
- An external execution service, because none is configured. Render/Netlify grading therefore remains unverified and unavailable until one implements the documented contract.
- OpenJDK 21 in the sandbox.
- Instant JWT revocation, because the current design does not implement it.

## 7. Files changed in this recovery

Modified:

- `.env.example`
- `DATABASE_SETUP.md`
- `README.md`
- `package.json`
- `scripts/verify-db.js`
- `src/app/api/chatbot/route.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/ChatbotWidget.tsx`
- `src/components/Navbar.tsx`
- `src/lib/db.ts`

Added:

- `.nvmrc`
- `DEPLOYMENT.md`
- `render.yaml`
- `scripts/bootstrap-database.js`
- `scripts/check-production-config.js`
- `scripts/smoke-production.js`
- `src/app/api/health/route.ts`
- `src/app/api/health/ready/route.ts`
- `docs/REPOSITORY_RECOVERY_AUDIT_2026-10-23.md` (this report)

No question records were deleted in Git, no database reset was used to hide a defect, exam eligibility was not weakened, and no generated question was promoted. The local disposable database was reconstructed from scripts; real production user data, if any exists elsewhere, remains only in that production database/backup.

## 8. Remaining owner actions before calling the site deployed

1. Review and merge `fix/deployment-readiness` into `main` (after the push status recorded in the final handoff is confirmed).
2. Choose the full-function Linux VM path, or provision an authenticated sandboxed external execution service for Render/Netlify.
3. Create/identify the production PostgreSQL database. If users/progress already exist, back up and restore that database; do not regenerate it and do not seed demo users.
4. Apply `db:bootstrap` for an existing database, or the documented fresh/full-bank sequence for a new one. Verify with `--require-exam-bank`.
5. Create the Resend API key, verify the sender domain/DNS, and set `RESEND_API_KEY`/`EMAIL_FROM`.
6. Set a unique `JWT_SECRET`, Neon pooled runtime `DATABASE_URL` (if Neon is used), `DATABASE_POOL_MAX=5` as a starting point, canonical HTTPS `APP_URL`/`NEXT_PUBLIC_APP_URL`, correct `TRUST_PROXY_HEADERS`, and execution variables.
7. Run `npm run check:production -- --ping` with the real production environment.
8. Deploy, then run `node scripts/smoke-production.js https://<live-domain>` and the manual real-inbox/auth/learning/exam checklist in `DEPLOYMENT.md`.
9. Only after those live checks pass should the deployment be described as successful.
