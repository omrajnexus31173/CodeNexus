'use strict';

/**
 * Ordered, non-destructive database bootstrap for Code Nexus.
 *
 * Default mode applies schema creation/migrations only and never seeds users.
 * --with-content additionally runs the repository's idempotent course,
 * curriculum, base-question, and library seeders. It does not recreate the
 * separately validated 18,191-row question bank; restore a database backup
 * or run the documented question-bank reconstruction pipeline for that.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set([
  '--with-content',
  '--verify',
  '--confirm-production-content',
  '--help',
  '-h',
]);

function printHelp() {
  console.log(`Usage: node scripts/bootstrap-database.js [options]

Options:
  --with-content                 Also seed courses, curriculum, base questions,
                                 and library resources. Never seeds users.
  --verify                       Run scripts/verify-db.js after bootstrapping.
  --confirm-production-content  Required with --with-content when
                                 NODE_ENV=production.
  --help                         Show this help.

The bootstrap prefers DATABASE_URL_UNPOOLED for maintenance scripts and
falls back to DATABASE_URL. It never prints either connection string.`);
}

if (args.has('--help') || args.has('-h')) {
  printHelp();
  process.exit(0);
}

for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown option: ${arg}`);
    printHelp();
    process.exit(2);
  }
}

const withContent = args.has('--with-content');
const verify = args.has('--verify');

if (
  withContent &&
  process.env.NODE_ENV === 'production' &&
  !args.has('--confirm-production-content')
) {
  console.error(
    'Refusing to seed content into a production database without --confirm-production-content. Back up the database first.'
  );
  process.exit(2);
}

const maintenanceDatabaseUrl =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!maintenanceDatabaseUrl) {
  console.error(
    'DATABASE_URL_UNPOOLED or DATABASE_URL must be configured before running the database bootstrap.'
  );
  process.exit(2);
}

// Validate without printing the value. Child scripts receive the selected
// maintenance URL as DATABASE_URL; dotenv does not overwrite existing env.
process.env.DATABASE_URL = maintenanceDatabaseUrl;
try {
  require('./lib/database-url').requireDatabaseUrl();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Invalid database configuration.');
  process.exit(2);
}

const childEnv = {
  ...process.env,
  DATABASE_URL: maintenanceDatabaseUrl,
};

const steps = [
  ['Initialize base schema', 'init-db.js'],
];

if (withContent) {
  steps.push(['Seed courses and base topics', 'seed-courses.js']);
}

steps.push(['Apply education-engine migration', 'migrate-education-engine.js']);

if (withContent) {
  steps.push(['Seed the 129-topic education engine', 'seed-education-engine.js']);
}

steps.push(
  ['Apply learning-integrity migration', 'migrate-learning-integrity.js'],
  ['Apply question-architecture migration', 'migrate-question-architecture.js'],
  ['Apply authentication-security migration', 'migrate-auth-security.js']
);

if (withContent) {
  steps.push(
    ['Seed base practice questions', 'seed-questions.js'],
    ['Seed library resources', 'seed-library.js']
  );
}

if (verify) {
  steps.push([
    withContent ? 'Verify database and core content' : 'Verify database schema',
    'verify-db.js',
    withContent ? [] : ['--schema-only'],
  ]);
}

console.log('Code Nexus database bootstrap');
console.log(`Mode: ${withContent ? 'schema + repository content' : 'schema only'}`);
console.log('Demo/user seeding: disabled');

if (withContent) {
  console.log(
    'Warning: content seeders upsert repository content and education seeding can reset topic validation status. Back up an existing database before continuing in production.'
  );
}

for (const [label, file, scriptArgs = []] of steps) {
  console.log(`\n==> ${label} (${file})`);
  const result = spawnSync(process.execPath, [path.join(__dirname, file), ...scriptArgs], {
    cwd: rootDir,
    env: childEnv,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to start ${file}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Bootstrap stopped: ${file} exited with status ${result.status}.`);
    process.exit(result.status || 1);
  }
}

console.log('\nDatabase bootstrap completed successfully.');
if (!withContent) {
  console.log('No courses, questions, library resources, or users were seeded.');
}
