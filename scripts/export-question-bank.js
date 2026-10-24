'use strict';

/**
 * Export the Code Nexus question bank only.
 *
 * The export contains every column of public.questions plus small
 * course/topic mapping reference CSV files. It contains no users,
 * password hashes, tokens, progress, attempts, certificates, or any
 * other learner-owned table.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { Pool } = require('pg');

const rootDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const args = process.argv.slice(2);

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: node scripts/export-question-bank.js [--out-dir <directory>] [--batch-size <n>]

Exports public.questions only as canonical NDJSON.GZ, plus:
  - manifest.json (counts, schema, hashes, source scope)
  - question-mappings.csv
  - courses.csv and course-topics-mapping.csv (mapping references only)
  - SHA256SUMS

Only public.questions rows are exported in full. The courses and
course_topics tables are read only for small mapping-reference CSV files;
no user/learner rows are read or exported. The export uses a read-only
repeatable-read snapshot. DATABASE_URL_UNPOOLED is preferred when set.`);
  process.exit(0);
}

const outDir = path.resolve(argValue('--out-dir', path.join(rootDir, 'exports', 'question-bank')));
const batchSize = Math.max(1, Math.min(5000, Number.parseInt(argValue('--batch-size', '500'), 10) || 500));

const selectedDatabaseUrl = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
if (!selectedDatabaseUrl) {
  console.error('DATABASE_URL_UNPOOLED or DATABASE_URL must be configured.');
  process.exit(2);
}
process.env.DATABASE_URL = selectedDatabaseUrl;

let connectionString;
try {
  connectionString = requireDatabaseUrl();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Invalid database configuration.');
  process.exit(2);
}

function sha256File(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function canonicalize(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
    return out;
  }
  return value;
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(file, columns, rows) {
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map((column) => csvCell(row[column])).join(','));
  fs.writeFileSync(file, `${lines.join('\n')}\n`, 'utf8');
}

function increment(map, key) {
  const normalized = key === null || key === undefined || key === '' ? '(null)' : String(key);
  map[normalized] = (map[normalized] || 0) + 1;
}

function cohortOf(id) {
  if (id.startsWith('core-')) return 'verified-core';
  if (id.startsWith('topic-')) return 'topic-linked';
  if (id.includes('-bank-')) return 'pipeline-bank';
  return 'original-seed';
}

function gitCommit() {
  try {
    return execFileSync('git', ['-C', rootDir, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function sourceScope(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname.toLowerCase();
    const loopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    return {
      database_name: decodeURIComponent(parsed.pathname.replace(/^\//, '')) || null,
      connection_scope: loopback ? 'loopback/local' : 'remote host (name not recorded)',
      online_persistent_database_verified: false,
      note:
        'This manifest proves what was read from the configured database at export time. It does not, by itself, prove that a public online production database remains available or unchanged after export.',
    };
  } catch {
    return {
      database_name: null,
      connection_scope: 'configured PostgreSQL database',
      online_persistent_database_verified: false,
      note: 'Source scope could not be classified without recording connection details.',
    };
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const questionsFile = path.join(outDir, 'questions.ndjson.gz');
  const mappingsFile = path.join(outDir, 'question-mappings.csv');
  const coursesFile = path.join(outDir, 'courses.csv');
  const topicsFile = path.join(outDir, 'course-topics-mapping.csv');
  const manifestFile = path.join(outDir, 'manifest.json');
  const sumsFile = path.join(outDir, 'SHA256SUMS');

  for (const file of [questionsFile, mappingsFile, coursesFile, topicsFile, manifestFile, sumsFile]) {
    if (fs.existsSync(file)) {
      throw new Error(`Refusing to overwrite existing export file: ${file}`);
    }
  }

  const pool = new Pool({
    connectionString,
    ssl: databaseSslConfig(connectionString),
    max: 1,
  });

  const ndjsonHash = crypto.createHash('sha256');
  const idsHash = crypto.createHash('sha256');
  const rowHashesHash = crypto.createHash('sha256');
  const counts = {
    total: 0,
    by_validation_status: {},
    by_mapping_status: {},
    by_course: {},
    by_language: {},
    by_cohort: {},
    exam_eligible: 0,
    non_tested_exam_eligible: 0,
    generated_exam_eligible: 0,
    mapped_with_topic: 0,
    unassigned_without_topic: 0,
  };

  let client;
  let gzip;
  try {
    client = await pool.connect();
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');

    const columnsResult = await client.query(`
      SELECT column_name, data_type, udt_name, is_nullable, ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'questions'
      ORDER BY ordinal_position
    `);
    if (columnsResult.rowCount === 0) throw new Error('public.questions does not exist in the configured database.');
    const columns = columnsResult.rows;

    const courses = (
      await client.query('SELECT id, title, slug FROM courses ORDER BY order_index, id')
    ).rows;
    const topics = (
      await client.query(
        'SELECT id, course_id, unit_id, title, order_index, validation_status FROM course_topics ORDER BY course_id, unit_id, order_index, id'
      )
    ).rows;
    const mappings = (
      await client.query(`
        SELECT id, language, course_id, topic_id, mapping_status,
               validation_status, is_exam_eligible, practice_only
        FROM questions
        ORDER BY id
      `)
    ).rows;

    writeCsv(coursesFile, ['id', 'title', 'slug'], courses);
    writeCsv(
      topicsFile,
      ['id', 'course_id', 'unit_id', 'title', 'order_index', 'validation_status'],
      topics
    );
    writeCsv(
      mappingsFile,
      [
        'id',
        'language',
        'course_id',
        'topic_id',
        'mapping_status',
        'validation_status',
        'is_exam_eligible',
        'practice_only',
      ],
      mappings
    );

    gzip = zlib.createGzip({ level: 9 });
    const output = fs.createWriteStream(questionsFile, { flags: 'wx' });
    gzip.pipe(output);

    let lastId = null;
    for (;;) {
      const result = await client.query(
        `SELECT * FROM questions
         WHERE ($1::text IS NULL OR id > $1)
         ORDER BY id
         LIMIT $2`,
        [lastId, batchSize]
      );
      if (result.rowCount === 0) break;

      for (const row of result.rows) {
        const line = `${JSON.stringify(canonicalize(row))}\n`;
        const lineBuffer = Buffer.from(line, 'utf8');
        ndjsonHash.update(lineBuffer);
        idsHash.update(`${row.id}\n`, 'utf8');
        rowHashesHash.update(crypto.createHash('sha256').update(lineBuffer).digest('hex'), 'utf8');
        rowHashesHash.update('\n', 'utf8');

        counts.total += 1;
        increment(counts.by_validation_status, row.validation_status);
        increment(counts.by_mapping_status, row.mapping_status);
        increment(counts.by_course, row.course_id);
        increment(counts.by_language, row.language);
        increment(counts.by_cohort, cohortOf(row.id));
        if (row.is_exam_eligible) counts.exam_eligible += 1;
        if (row.is_exam_eligible && row.validation_status !== 'tested') {
          counts.non_tested_exam_eligible += 1;
        }
        if (row.is_exam_eligible && row.validation_status === 'generated') {
          counts.generated_exam_eligible += 1;
        }
        if (row.mapping_status === 'mapped' && row.topic_id) counts.mapped_with_topic += 1;
        if (row.mapping_status === 'unassigned' && !row.topic_id) {
          counts.unassigned_without_topic += 1;
        }

        if (!gzip.write(lineBuffer)) {
          await new Promise((resolve) => gzip.once('drain', resolve));
        }
        lastId = row.id;
      }
    }

    gzip.end();
    await new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
      gzip.on('error', reject);
    });

    await client.query('COMMIT');

    const files = {
      'questions.ndjson.gz': {
        bytes: fs.statSync(questionsFile).size,
        sha256: await sha256File(questionsFile),
      },
      'question-mappings.csv': {
        bytes: fs.statSync(mappingsFile).size,
        sha256: await sha256File(mappingsFile),
      },
      'courses.csv': {
        bytes: fs.statSync(coursesFile).size,
        sha256: await sha256File(coursesFile),
      },
      'course-topics-mapping.csv': {
        bytes: fs.statSync(topicsFile).size,
        sha256: await sha256File(topicsFile),
      },
    };

    const manifest = {
      format: 'code-nexus-question-bank-export/v1',
      generated_at: new Date().toISOString(),
      git_commit_at_export: gitCommit(),
      source: sourceScope(connectionString),
      tables_with_full_rows_exported: ['public.questions'],
      mapping_reference_csv_tables: ['public.courses', 'public.course_topics'],
      contains_user_accounts_or_passwords: false,
      contains_learner_data: false,
      question_row_count: counts.total,
      mapping_reference_counts: {
        courses: courses.length,
        course_topics: topics.length,
      },
      counts,
      schema: {
        table: 'public.questions',
        columns,
      },
      integrity: {
        questions_ndjson_uncompressed_sha256: ndjsonHash.digest('hex'),
        sorted_question_ids_sha256: idsHash.digest('hex'),
        aggregate_row_hashes_sha256: rowHashesHash.digest('hex'),
      },
      files,
      question_source_files: [
        'scripts/seed-questions.js',
        'scripts/pipeline/build-question-bank.js',
        'scripts/question-bank/generated-reference-templates.js',
        'scripts/question-bank/topic-linked/*.js',
        'scripts/seed-topic-linked-questions.js',
        'scripts/question-bank/verified-core/*.js',
        'scripts/seed-verified-core.js',
        'scripts/apply-question-architecture.js',
        'scripts/approve-verified-core.js',
      ],
      mapping_source_files: [
        'scripts/seed-courses.js',
        'scripts/seed-education-engine.js',
        'scripts/curriculum/master-curriculum.js',
        'scripts/curriculum/**/*.js',
        'scripts/question-bank/taxonomy.js',
      ],
    };

    fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });

    const sums = [];
    for (const [name, info] of Object.entries(files)) sums.push(`${info.sha256}  ${name}`);
    sums.push(`${await sha256File(manifestFile)}  manifest.json`);
    fs.writeFileSync(sumsFile, `${sums.join('\n')}\n`, { flag: 'wx' });

    console.log(`Question-bank export complete: ${outDir}`);
    console.log(`Rows: ${counts.total}`);
    console.log(`Tested: ${counts.by_validation_status.tested || 0}`);
    console.log(`Generated: ${counts.by_validation_status.generated || 0}`);
    console.log(`questions.ndjson.gz SHA-256: ${files['questions.ndjson.gz'].sha256}`);
    console.log('User accounts/passwords/learner data exported: no');
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    throw error;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Question-bank export failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
