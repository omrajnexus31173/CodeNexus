'use strict';

/**
 * Production configuration preflight.
 *
 * It reports only variable names and pass/fail status. Secret values,
 * connection strings, hosts, and provider responses are never printed.
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { databaseSslConfig } = require('./lib/database-url');

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(['--ping', '--help', '-h']);

if (args.has('--help') || args.has('-h')) {
  console.log(`Usage: node scripts/check-production-config.js [--ping]

Validates the production environment-variable contract without printing
secret values. --ping additionally performs one SELECT 1 database query.`);
  process.exit(0);
}

for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown option: ${arg}`);
    process.exit(2);
  }
}

const placeholderPatterns = [
  /replace_with/i,
  /your_/i,
  /example/i,
  /change[_-]?me/i,
  /development[_-]?fallback/i,
  /super[_-]?safe/i,
  /username:password/i,
  /code-nexus-super-secret/i,
  /^secret$/i,
  /^password$/i,
];

function isPlaceholder(value) {
  return !value || placeholderPatterns.some((pattern) => pattern.test(value));
}

let failures = 0;
let warnings = 0;

function pass(name, detail = 'configured') {
  console.log(`[PASS] ${name}: ${detail}`);
}

function fail(name, detail) {
  failures += 1;
  console.error(`[FAIL] ${name}: ${detail}`);
}

function warn(name, detail) {
  warnings += 1;
  console.warn(`[WARN] ${name}: ${detail}`);
}

function check(name, condition, passDetail, failDetail) {
  if (condition) pass(name, passDetail);
  else fail(name, failDetail);
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isLoopback(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function commandExists(command) {
  const pathValue = process.env.PATH || '';
  return pathValue.split(path.delimiter).some((directory) => {
    if (!directory) return false;
    try {
      fs.accessSync(path.join(directory, command), fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

const nodeEnv = process.env.NODE_ENV?.trim();
check('NODE_ENV', nodeEnv === 'production', 'production', 'must be "production" for a production deployment');

let databaseUrl = null;
const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
if (!rawDatabaseUrl || isPlaceholder(rawDatabaseUrl)) {
  fail('DATABASE_URL', 'missing or still contains a placeholder');
} else {
  databaseUrl = parseUrl(rawDatabaseUrl);
  if (!databaseUrl || !['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    fail('DATABASE_URL', 'must be a valid postgres:// or postgresql:// URL');
    databaseUrl = null;
  } else {
    pass('DATABASE_URL', 'valid PostgreSQL URL format (value hidden)');
    const sslMode = databaseUrl.searchParams.get('sslmode')?.toLowerCase();
    if (!isLoopback(databaseUrl.hostname)) {
      check(
        'DATABASE_URL TLS',
        Boolean(sslMode && !['disable', 'no-verify'].includes(sslMode)),
        'verified TLS mode requested',
        'remote production databases must request verified TLS (for example sslmode=require); sslmode=no-verify/disable is not accepted'
      );
    }
  }
}

if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
  const unpooled = parseUrl(process.env.DATABASE_URL_UNPOOLED.trim());
  check(
    'DATABASE_URL_UNPOOLED',
    Boolean(unpooled && ['postgres:', 'postgresql:'].includes(unpooled.protocol)),
    'valid maintenance URL format (value hidden)',
    'must be a valid postgres:// or postgresql:// URL when set'
  );
}

if (process.env.DATABASE_POOL_MAX?.trim()) {
  const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX, 10);
  check(
    'DATABASE_POOL_MAX',
    Number.isInteger(poolMax) && poolMax >= 1 && poolMax <= 20,
    'between 1 and 20',
    'must be an integer between 1 and 20 when set'
  );
}

const jwtSecret = process.env.JWT_SECRET?.trim();
check(
  'JWT_SECRET',
  Boolean(jwtSecret && jwtSecret.length >= 32 && !isPlaceholder(jwtSecret)),
  'present, non-placeholder, and at least 32 characters (value hidden)',
  'must be a unique non-placeholder secret of at least 32 characters'
);

function checkAppUrl(name, required) {
  const raw = process.env[name]?.trim();
  if (!raw) {
    if (required) fail(name, 'missing');
    return null;
  }
  const parsed = parseUrl(raw);
  const valid =
    Boolean(parsed) &&
    parsed.protocol === 'https:' &&
    !isLoopback(parsed.hostname) &&
    !isPlaceholder(raw);
  check(
    name,
    valid,
    'public HTTPS URL (value hidden)',
    'must be the public https:// origin of the deployed application'
  );
  return valid ? parsed : null;
}

const appUrl = checkAppUrl('APP_URL', true);
const publicAppUrl = checkAppUrl('NEXT_PUBLIC_APP_URL', true);
if (appUrl && publicAppUrl) {
  check(
    'APP_URL consistency',
    appUrl.origin === publicAppUrl.origin,
    'APP_URL and NEXT_PUBLIC_APP_URL use the same origin',
    'APP_URL and NEXT_PUBLIC_APP_URL should use the same public origin'
  );
}

const resendKey = process.env.RESEND_API_KEY?.trim();
check(
  'RESEND_API_KEY',
  Boolean(resendKey && resendKey.startsWith('re_') && resendKey.length >= 10 && !isPlaceholder(resendKey)),
  'present in expected Resend format (value hidden)',
  'must be a real Resend API key beginning with re_'
);

const emailFrom = process.env.EMAIL_FROM?.trim();
const emailPattern = /^(?:[^<>\s]+@[^<>\s]+\.[^<>\s]+|.+\s<[^<>\s]+@[^<>\s]+\.[^<>\s]+>)$/;
check(
  'EMAIL_FROM',
  Boolean(emailFrom && emailPattern.test(emailFrom) && !/@resend\.dev(?:>)?$/i.test(emailFrom) && !isPlaceholder(emailFrom)),
  'valid non-test sender format (value hidden)',
  'must be a verified sender/domain address; Resend test senders are not production-ready'
);

const runnerMode = (process.env.CODE_RUNNER_MODE?.trim() || 'sandboxed_local').toLowerCase();
if (!['sandboxed_local', 'external'].includes(runnerMode)) {
  fail('CODE_RUNNER_MODE', 'must be "sandboxed_local" or "external"');
} else if (runnerMode === 'sandboxed_local') {
  pass('CODE_RUNNER_MODE', 'sandboxed_local');
  check(
    'Local sandbox tools',
    commandExists('bwrap') && commandExists('prlimit'),
    'bubblewrap and prlimit are installed',
    'bubblewrap (bwrap) and prlimit are required for local sandboxed execution'
  );
  const compilers = ['gcc', 'g++', 'python3', 'node', 'javac', 'java', 'sqlite3'];
  const missingCompilers = compilers.filter((command) => !commandExists(command));
  check(
    'Local language runtimes',
    missingCompilers.length === 0,
    'GCC/G++, Python, Node, JDK, and SQLite commands are installed',
    `missing required command(s): ${missingCompilers.join(', ')}`
  );
} else {
  pass('CODE_RUNNER_MODE', 'external');
  const executionUrl = parseUrl(process.env.CODE_EXECUTION_SERVICE_URL?.trim() || '');
  check(
    'CODE_EXECUTION_SERVICE_URL',
    Boolean(executionUrl && executionUrl.protocol === 'https:' && !isLoopback(executionUrl.hostname)),
    'public HTTPS execution endpoint (value hidden)',
    'must be a non-loopback https:// endpoint in production'
  );
  const executionKey = process.env.CODE_EXECUTION_API_KEY?.trim();
  check(
    'CODE_EXECUTION_API_KEY',
    Boolean(executionKey && executionKey.length >= 16 && !isPlaceholder(executionKey)),
    'present and at least 16 characters (value hidden)',
    'must be a non-placeholder API key of at least 16 characters'
  );
}

const trustProxy = process.env.TRUST_PROXY_HEADERS?.trim().toLowerCase();
if (trustProxy) {
  check(
    'TRUST_PROXY_HEADERS',
    ['true', 'false'].includes(trustProxy),
    trustProxy,
    'must be exactly "true" or "false" when set'
  );
  if (trustProxy === 'true') {
    warn(
      'TRUST_PROXY_HEADERS',
      'enabled; use only behind a proxy/platform that strips or overwrites forwarded client-IP headers'
    );
  }
}

if (process.env.ALLOW_SOURCE_DOWNLOAD?.trim().toLowerCase() === 'true') {
  warn(
    'ALLOW_SOURCE_DOWNLOAD',
    'enabled; the source archive endpoint will be available in production if an archive is placed in public/'
  );
}

if (process.env.PORT?.trim()) {
  const port = Number.parseInt(process.env.PORT, 10);
  check(
    'PORT',
    Number.isInteger(port) && port >= 1 && port <= 65535,
    'valid TCP port (value hidden)',
    'must be an integer between 1 and 65535 when set'
  );
}

async function pingDatabase() {
  if (!rawDatabaseUrl || !databaseUrl) {
    fail('Database ping', 'skipped because DATABASE_URL is invalid');
    return;
  }

  const { Pool } = require('pg');
  let pool;
  try {
    pool = new Pool({
      connectionString: rawDatabaseUrl,
      ssl: databaseSslConfig(rawDatabaseUrl),
      connectionTimeoutMillis: 5000,
      max: 1,
    });
    await pool.query('SELECT 1');
    pass('Database ping', 'SELECT 1 succeeded');
  } catch {
    fail('Database ping', 'connection failed (provider error hidden)');
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}

(async () => {
  if (args.has('--ping')) {
    await pingDatabase();
  }

  console.log(`\nProduction configuration preflight: ${failures} failure(s), ${warnings} warning(s).`);
  if (failures > 0) {
    console.error('Status: NOT READY. Fix the failed items above; do not deploy yet.');
    process.exit(1);
  }
  console.log('Status: Configuration contract passed. This does not by itself prove email delivery or live deployment health.');
})();
