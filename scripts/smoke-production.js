'use strict';

/**
 * Read-only post-deployment smoke checks.
 *
 * Usage:
 *   node scripts/smoke-production.js https://your-app.example
 *   APP_URL=https://your-app.example node scripts/smoke-production.js
 *
 * No account is created and no application data is modified.
 */

const baseArg = process.argv[2] || process.env.SMOKE_BASE_URL || process.env.APP_URL;

if (!baseArg || baseArg === '--help' || baseArg === '-h') {
  console.log('Usage: node scripts/smoke-production.js <https://deployed-app-url>');
  process.exit(baseArg ? 0 : 2);
}

let base;
try {
  base = new URL(baseArg);
} catch {
  console.error('The smoke-test base URL is invalid.');
  process.exit(2);
}

if (!['http:', 'https:'].includes(base.protocol)) {
  console.error('The smoke-test base URL must use http:// or https://.');
  process.exit(2);
}

const baseUrl = base.toString().replace(/\/+$/, '');
let failures = 0;

function pass(label) {
  console.log(`[PASS] ${label}`);
}

function fail(label, detail) {
  failures += 1;
  console.error(`[FAIL] ${label}: ${detail}`);
}

async function request(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(`${baseUrl}${path}`, {
      headers: { Accept: 'application/json,text/html;q=0.9,*/*;q=0.1' },
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function expectStatus(path, expected, label = path) {
  try {
    const response = await request(path);
    const text = await response.text();
    if (response.status === expected) pass(`${label} -> ${expected}`);
    else fail(label, `expected HTTP ${expected}, received ${response.status}`);
    return { response, text };
  } catch {
    fail(label, 'request failed or timed out');
    return null;
  }
}

(async () => {
  console.log(`Code Nexus smoke checks: ${base.origin}`);

  const health = await expectStatus('/api/health', 200, 'Liveness endpoint');
  if (health) {
    try {
      const body = JSON.parse(health.text);
      if (body.status === 'ok' && body.service === 'code-nexus') {
        pass('Liveness payload identifies Code Nexus');
      } else {
        fail('Liveness payload', 'unexpected status/service fields');
      }
    } catch {
      fail('Liveness payload', 'response was not valid JSON');
    }
  }

  const ready = await expectStatus('/api/health/ready', 200, 'Database readiness endpoint');
  if (ready) {
    try {
      const body = JSON.parse(ready.text);
      if (body.status === 'ready' && body.checks?.database === 'ok') {
        pass('Database readiness payload reports database ok');
      } else {
        fail('Database readiness payload', 'database was not reported ready');
      }
    } catch {
      fail('Database readiness payload', 'response was not valid JSON');
    }
  }

  const home = await expectStatus('/', 200, 'Home page');
  if (home) {
    if (/code\s*nexus/i.test(home.text)) pass('Home page contains Code Nexus branding');
    else fail('Home page content', 'Code Nexus branding was not found');

    const contentTypeOptions = home.response.headers.get('x-content-type-options');
    const frameOptions = home.response.headers.get('x-frame-options');
    if (contentTypeOptions?.toLowerCase() === 'nosniff') pass('X-Content-Type-Options header present');
    else fail('Security headers', 'X-Content-Type-Options: nosniff missing');
    if (frameOptions) pass('X-Frame-Options header present');
    else fail('Security headers', 'X-Frame-Options missing');

    if (base.protocol === 'https:') {
      const hsts = home.response.headers.get('strict-transport-security');
      if (hsts) pass('Strict-Transport-Security header present');
      else fail('Security headers', 'Strict-Transport-Security missing on HTTPS origin');
    }
  }

  await expectStatus('/login', 200, 'Login page');
  await expectStatus('/signup', 200, 'Registration page');
  await expectStatus('/courses', 200, 'Courses page');
  await expectStatus('/verify-certificate', 200, 'Certificate verification page');

  const courses = await expectStatus('/api/courses', 200, 'Courses API');
  if (courses) {
    try {
      const body = JSON.parse(courses.text);
      const list = Array.isArray(body) ? body : body.courses;
      if (Array.isArray(list) && list.length > 0) pass(`Courses API returned ${list.length} course record(s)`);
      else fail('Courses API payload', 'no courses were returned');
    } catch {
      fail('Courses API payload', 'response was not valid JSON');
    }
  }

  await expectStatus('/api/auth/me', 401, 'Unauthenticated session check');

  console.log(`\nSmoke result: ${failures} failure(s).`);
  if (failures > 0) process.exit(1);
  console.log('Read-only smoke checks passed. Authenticated learning, email, and grading still require their own live tests.');
})();
