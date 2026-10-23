# Code Nexus — Deployment Guide

> **Status:** deployment-ready configuration and local production-build verification are included in this repository. This document does **not** claim that a public deployment has already been created. A deployment is complete only after the live URL passes the smoke and account/email checks in section 10.

## 1. Architecture and hosting decision

Code Nexus has four runtime parts:

1. **Next.js 15 application** — pages, API routes, authentication, and server-side scoring.
2. **PostgreSQL** — users, progress, questions, point ledger, exams, certificates, and library state.
3. **Resend HTTPS API** — real email verification and password-reset delivery.
4. **Sandboxed code execution** — practice grading, lesson examples, and exam grading.

### Recommended full-function host: one Linux VM

The only architecture verified end-to-end in this repository is the Next.js server running on a Linux host that provides Bubblewrap (`bwrap`), `prlimit`, GCC/G++, Python 3, Node 20, OpenJDK 11, and SQLite. A small Ubuntu VM (start with 2 vCPU, 4 GB RAM, and 20 GB disk) can run the app with `CODE_RUNNER_MODE=sandboxed_local`; PostgreSQL may be local or managed (for example Neon).

### Budget managed hosting: web/API only unless execution is externalized

Render and Netlify can host the Next.js web/API layer with an externally reachable PostgreSQL database, but their managed/serverless environments are not the verified Bubblewrap/compiler host. For those platforms set:

```env
CODE_RUNNER_MODE=external
CODE_EXECUTION_SERVICE_URL=https://<your-execution-service>
CODE_EXECUTION_API_KEY=<secret>
```

If no compatible external execution service exists, execution-dependent grading fails closed with a configuration/runtime error. Do not describe that deployment as fully functional, and never fall back to executing learner code in the Next.js process.

- A Render Blueprint is provided in `render.yaml` (web service only; PostgreSQL and execution remain external).
- Netlify supports modern Next.js through its OpenNext adapter with zero configuration; no `netlify.toml` is required for the default setup.

Official references:

- Netlify Next.js support: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Render web services: https://render.com/docs/web-services
- Render Blueprint YAML: https://render.com/docs/blueprint-spec
- Neon connection pooling: https://neon.com/docs/connect/connection-pooling

## 2. Environment variables

Set secrets in the host dashboard or a mode-`600` server `.env` file. Never commit a populated `.env`.

| Variable | Required | Source / rule |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Host-dependent | Render/most PaaS platforms inject it. `npm start` binds `0.0.0.0` and uses the platform `PORT`. Use `3000` on a VM behind a reverse proxy. |
| `DATABASE_URL` | Yes | Runtime PostgreSQL URL. For Neon/serverless use the pooled (`-pooler`) endpoint with verified TLS such as `sslmode=require`. |
| `DATABASE_URL_UNPOOLED` | Maintenance only | Direct/unpooled PostgreSQL URL used by `scripts/bootstrap-database.js` and `scripts/verify-db.js` when set. The running app does not read it; do not add it to a web host unless needed there. |
| `DATABASE_POOL_MAX` | No | Per-process pool size, 1–20. Default `10`; `5` is a conservative starting point for small/free plans. |
| `JWT_SECRET` | Yes | Unique random secret of at least 32 characters. Generate with `openssl rand -hex 32`. Render Blueprint can generate it. |
| `APP_URL` | Yes | Canonical public HTTPS origin, for example `https://app.example.com` (replace with the real domain). Used in email/certificate links. |
| `NEXT_PUBLIC_APP_URL` | Yes | Same public HTTPS origin as `APP_URL`. |
| `RESEND_API_KEY` | Yes for real signup/reset | Resend API key with sending access. |
| `EMAIL_FROM` | Yes for real signup/reset | Verified sender/domain, for example `Code Nexus <noreply@your-domain>`. Resend test senders are rejected for production. |
| `CODE_RUNNER_MODE` | Yes | `sandboxed_local` only on a verified Linux sandbox host; otherwise `external`. |
| `CODE_EXECUTION_SERVICE_URL` | External mode | HTTPS base URL of the execution service described in section 9. |
| `CODE_EXECUTION_API_KEY` | External mode | Bearer key for that service, at least 16 characters. |
| `TRUST_PROXY_HEADERS` | Yes | `true` only behind a platform/reverse proxy that strips or overwrites forwarded client-IP/host headers. Keep `false` for direct exposure. |
| `ALLOW_SOURCE_DOWNLOAD` | No | Keep `false` in production. |
| `SEED_ADMIN_PASSWORD`, `SEED_STUDENT_PASSWORD` | Local only | Only for intentional local demo seeding. Never seed demo accounts into public production. |

## 3. Preflight and build checks

On a trusted machine with the production values present in the process environment or a private `.env`:

```bash
npm ci
npm run check:production -- --ping
npx tsc --noEmit
npm run lint
npm run build
npm audit --omit=dev
```

`src/lib/db.ts` now creates its PostgreSQL pool lazily, so `next build` does not need a database secret merely to collect page data. Runtime API calls still fail closed if `DATABASE_URL` is missing or invalid.

## 4. Database setup

### 4.1 Existing production database (preserve users and progress)

Git does not contain user accounts, progress, certificates, or point history. Back up the existing database before changing hosts or running migrations:

```bash
pg_dump "$DATABASE_URL_UNPOOLED_OR_DIRECT_URL" -F c -f code-nexus-backup.dump
```

Do not print or commit the connection string. Test-restore the backup to a disposable database where practical.

Apply only schema/migrations, without reseeding content or users:

```bash
npm run db:bootstrap
node scripts/verify-db.js --require-exam-bank
```

The bootstrap prefers `DATABASE_URL_UNPOOLED` for maintenance scripts and falls back to `DATABASE_URL`.

### 4.2 Fresh database with repository base content

```bash
npm run db:bootstrap:content
npm run verify:db
```

This creates the 27-table schema and seeds 10 courses, 129 topics, the original 141 question IDs, and 6 library resources. It deliberately creates **no users**. This base state is not yet the strict 200-question exam bank.

When `NODE_ENV=production`, content seeding additionally requires:

```bash
node scripts/bootstrap-database.js --with-content --verify --confirm-production-content
```

Back up first: content seeders upsert repository content, and education seeding can reset topic validation status.

### 4.3 Reconstruct the verified 18,191-row question bank in a maintenance environment

Prefer restoring a known database backup for an existing production service. The sequence below deterministically reconstructs the audited counts from repository scripts in a disposable/maintenance Linux environment with the full local sandbox installed. It is a reconstruction, not an exact restore of lost user data or a lost database dump.

```bash
npm ci
npm run db:bootstrap:content

# Legacy drafts remain generated/unassigned/practice-only/exam-ineligible.
ALLOW_LEGACY_QUESTION_DRAFTS=1 node scripts/pipeline/build-question-bank.js --allow-legacy-drafts
npm run repair:generated
node scripts/repair-sql-string-contracts.js
node scripts/apply-question-architecture.js
npm run quarantine:generated

npm run build
PORT=3000 NODE_ENV=production npm start
# In another shell, after http://127.0.0.1:3000/api/health/ready is ready:
node scripts/validate-curriculum-examples.js --mark-tested
node scripts/validate-sql-examples.js --mark-tested
node scripts/validate-topic-linked-questions.js
node scripts/audit-curated-starters.js
node scripts/validate-verified-core.js
node scripts/seed-topic-linked-questions.js
node scripts/seed-verified-core.js
node scripts/apply-question-architecture.js
node scripts/approve-verified-core.js
node scripts/verify-db.js --require-exam-bank
node scripts/verify-final-question-bank.js
```

Expected final state: 18,191 questions = 200 tested + 17,991 generated; eight supported courses have strict pools of 25; HTML/CSS and App Development remain exam-unavailable. These scripts update evidence JSON files—review `git diff` before committing any regenerated evidence.

### 4.4 Neon pooled versus direct URLs

- Runtime/serverless: pooled `-pooler` endpoint in `DATABASE_URL`.
- Migrations, dumps, restores, and long maintenance scripts: direct endpoint in `DATABASE_URL_UNPOOLED` on the maintenance machine.
- Never use a private/internal database hostname from a different provider (for example, do not give Netlify a Render internal-only database URL).

## 5. Full-function Ubuntu VM deployment

1. Provision Ubuntu 24.04 LTS and point DNS to it.
2. Install Node.js 20 and system tools:

```bash
sudo apt-get update
sudo apt-get install -y git curl build-essential bubblewrap util-linux \
  python3 python3-numpy sqlite3 openjdk-11-jdk-headless postgresql-client
# Install Node.js 20 from your preferred official distribution channel, then:
node --version
bwrap --version
prlimit --version
gcc --version
javac -version
sqlite3 --version
```

3. Confirm unprivileged Bubblewrap works as the application user. If the VM/container policy blocks user namespaces, local execution is not verified on that host.

4. Clone and build:

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin codenexus || true
sudo install -d -o codenexus -g codenexus /opt/code-nexus
sudo -u codenexus git clone https://github.com/omrajnexus31173/CodeNexus.git /opt/code-nexus/app
cd /opt/code-nexus/app
sudo -u codenexus npm ci
sudo -u codenexus npm run build
```

5. Create `/opt/code-nexus/app/.env` with production values, `CODE_RUNNER_MODE=sandboxed_local`, `PORT=3000`, and owner-only permissions:

```bash
sudo chown codenexus:codenexus /opt/code-nexus/app/.env
sudo chmod 600 /opt/code-nexus/app/.env
sudo -u codenexus npm run check:production -- --ping
```

6. Prepare PostgreSQL using section 4. Do not run `seed-users.js` in public production.

7. Create `/etc/systemd/system/code-nexus.service`:

```ini
[Unit]
Description=Code Nexus
After=network.target

[Service]
Type=simple
User=codenexus
Group=codenexus
WorkingDirectory=/opt/code-nexus/app
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now code-nexus
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3000/api/health/ready
```

8. Put Caddy or another TLS reverse proxy in front. Caddy example:

```caddyfile
your-domain.example {
  reverse_proxy 127.0.0.1:3000
}
```

Set `TRUST_PROXY_HEADERS=true` only when that proxy is the public entry point and overwrites forwarded headers. Expose only SSH and 80/443 publicly; keep 3000 and PostgreSQL private.

9. Update procedure:

```bash
cd /opt/code-nexus/app
sudo -u codenexus git pull --ff-only
sudo -u codenexus npm ci
# Back up PostgreSQL, then apply schema-only bootstrap if this release includes migrations:
sudo -u codenexus npm run db:bootstrap
sudo -u codenexus npm run build
sudo systemctl restart code-nexus
node scripts/smoke-production.js https://your-domain.example
```

## 6. Render + Neon deployment (budget web/API option)

1. Merge the deployment-readiness branch into `main`; `render.yaml` deploys `main`.
2. Create a Neon project and record both pooled and direct connection strings privately.
3. From a trusted maintenance machine, set the direct URL as `DATABASE_URL_UNPOOLED` and prepare the database using section 4. Do not seed demo users.
4. In Render, create a Blueprint from this repository, or configure a Web Service manually:
   - Runtime: Node
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
5. Fill every `sync: false` variable. Use Neon's pooled endpoint for runtime `DATABASE_URL`. After Render assigns the public URL, set both `APP_URL` and `NEXT_PUBLIC_APP_URL` to that HTTPS origin (or your custom domain) and redeploy.
6. Keep `CODE_RUNNER_MODE=external` from the Blueprint. Without a compatible execution service, grading is unavailable.
7. Free web services may spin down when idle; expect cold starts and check current Render plan limits before relying on the service.

## 7. Netlify + Neon deployment (budget web/API option)

1. Connect the GitHub repository in Netlify. Netlify detects Next.js and applies its OpenNext adapter automatically.
2. Build command: `npm run build`. No start command is used; do not force a static publish directory that bypasses the Next.js adapter.
3. Set Node 20 (the repository includes `.nvmrc`), Neon pooled `DATABASE_URL`, a small `DATABASE_POOL_MAX` such as `5`, JWT/Resend values, public app URLs, and `CODE_RUNNER_MODE=external` with its service URL/key.
4. Prepare PostgreSQL from a maintenance machine with the direct Neon URL.
5. After the first deploy, set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the Netlify/custom HTTPS origin and redeploy.
6. Live-test middleware-protected POST APIs, cookies, and auth on the real domain; local Next.js behavior alone is not proof of adapter behavior.

## 8. Resend production setup

1. Create a Resend API key with sending access.
2. Verify the sending domain and publish the DNS records Resend provides.
3. Set `RESEND_API_KEY` and a verified `EMAIL_FROM`.
4. Register with a real mailbox you control, verify from the received email, then test password reset. Check Resend delivery logs. Until this is done, live email delivery is **unverified**, even if local auth tests pass.

## 9. External execution-service contract

The app sends `POST {CODE_EXECUTION_SERVICE_URL}/execute` with `Authorization: Bearer <CODE_EXECUTION_API_KEY>` and JSON:

```json
{
  "language": "python|c|cpp|java|javascript|sql",
  "code": "<learner code>",
  "testCases": [
    { "input": "...", "expected_output": "...", "is_hidden": false }
  ],
  "limits": {
    "timeoutMs": 5000,
    "maxMemoryBytes": 268435456,
    "maxOutputBytes": 65536
  }
}
```

It must return JSON shaped like:

```json
{
  "stdout": "...",
  "stderr": "",
  "exitCode": 0,
  "executionTimeMs": 42,
  "status": "Accepted",
  "testCaseResults": [
    {
      "testCaseIndex": 0,
      "input": "...",
      "expectedOutput": "...",
      "actualOutput": "...",
      "passed": true,
      "is_hidden": false
    }
  ],
  "truncated": false
}
```

Valid statuses are `Accepted`, `Wrong Answer`, `Compile Error`, `Runtime Error`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Output Limit Exceeded`, and `Configuration Error`.

The external service itself must isolate every submission with no host secrets, no outbound network, a throwaway filesystem, and CPU/time/memory/process/disk/output limits. The adapter contract alone is not a sandbox. SQL submissions use the repository's SQLite fixture contract unless a separately reviewed service implements identical semantics.

## 10. Post-deployment verification

Run the read-only smoke script against the live HTTPS origin:

```bash
node scripts/smoke-production.js https://your-domain.example
```

It checks `/api/health`, `/api/health/ready`, home/login/signup/courses/certificate pages, the courses API, unauthenticated session rejection, and baseline security headers.

Then manually verify on the live domain:

- Register with a real inbox; receive and consume the verification email.
- Confirm an unverified account cannot log in, then log in after verification.
- Complete a password-reset email flow.
- Open a course/topic, submit its quiz, reload, and confirm progress persists.
- Run practice code, use one hint, solve, and confirm the point ledger/balance.
- Start a supported 25-question exam; confirm HTML/CSS and App Development remain unavailable.
- Verify a certificate ID on `/verify-certificate`.
- Check admin authorization with a real admin account created through a controlled database/admin process—not demo seeding.
- Repeat key pages at a mobile width and confirm the guide dialog and navigation fit.
- Redeploy/restart once and confirm account/progress data still persists in PostgreSQL.

## 11. Remaining blockers and limits

- No public deployment or live mailbox delivery is claimed by this guide.
- Render/Netlify full functionality requires a separately hosted, authenticated, sandboxed execution service.
- Public code-execution APIs must not be assumed free or available; obtain and test the actual provider contract.
- 17 topics remain `reviewed`, not execution-`tested`.
- 17,991 generated questions remain practice-only/unassigned and exam-ineligible; only the 200 tested questions form exam pools.
- HTML/CSS and App Development have no graded exam until deterministic graders/runtimes are integrated.
- Local sandbox evidence uses OpenJDK 11. Do not claim OpenJDK 21 sandbox compatibility without a new gate.
- Stateless JWTs are not instantly revocable before expiry; add a revocation/session-version design if the production threat model requires it.
