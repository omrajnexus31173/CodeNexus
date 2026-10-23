'use strict';

/**
 * Import a verified Code Nexus question-bank-only export.
 *
 * Safety properties:
 * - Validates the gzip file, manifest hashes, duplicate IDs, and counts
 *   before opening a write transaction.
 * - Requires an explicit --confirm-upsert flag for writes.
 * - Writes only public.questions.
 * - Never deletes or truncates rows; rows are upserted by questions.id.
 * - Never reads or writes users, credentials, or learner data.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const readline = require('readline');
const { Transform } = require('stream');
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
  console.log(`Usage:
  node scripts/import-question-bank.js --input <questions.ndjson.gz> [--manifest <manifest.json>] --dry-run
  node scripts/import-question-bank.js --input <questions.ndjson.gz> [--manifest <manifest.json>] --confirm-upsert [--exact]

Options:
  --input <file>       questions.ndjson.gz produced by export-question-bank.js
  --manifest <file>    defaults to manifest.json beside the input file
  --dry-run            validate file/manifest only; do not connect or write
  --confirm-upsert     required before any write; upserts public.questions by id
  --exact              fail unless target total equals export total afterward
  --batch-size <n>     rows per INSERT batch (default 50, max 250)

The target database must already contain the Code Nexus schema and the
course/topic taxonomy. This importer does not create the schema and does not
touch users or learner tables. DATABASE_URL_UNPOOLED is preferred.`);
  process.exit(0);
}

const inputFile = path.resolve(argValue('--input', ''));
const manifestFile = path.resolve(
  argValue('--manifest', path.join(path.dirname(inputFile), 'manifest.json'))
);
const dryRun = args.includes('--dry-run');
const confirmUpsert = args.includes('--confirm-upsert');
const exact = args.includes('--exact');
const batchSize = Math.max(
  1,
  Math.min(250, Number.parseInt(argValue('--batch-size', '50'), 10) || 50)
);

if (!argValue('--input', '')) {
  console.error('Missing --input <questions.ndjson.gz>.');
  process.exit(2);
}
if (!fs.existsSync(inputFile)) {
  console.error(`Input file does not exist: ${inputFile}`);
  process.exit(2);
}
if (!fs.existsSync(manifestFile)) {
  console.error(`Manifest file does not exist: ${manifestFile}`);
  process.exit(2);
}
if (!dryRun && !confirmUpsert) {
  console.error('Refusing to write without --confirm-upsert. Use --dry-run to validate only.');
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
if (manifest.format !== 'code-nexus-question-bank-export/v1') {
  console.error(`Unsupported export format: ${manifest.format || '(missing)'}`);
  process.exit(2);
}
if (manifest.contains_user_accounts_or_passwords !== false || manifest.contains_learner_data !== false) {
  console.error('Manifest does not confirm the export is question-bank-only.');
  process.exit(2);
}

const expectedColumns = (manifest.schema?.columns || []).map((column) => column.column_name);
if (!expectedColumns.length || !expectedColumns.includes('id')) {
  console.error('Manifest has no usable questions schema.');
  process.exit(2);
}

function increment(map, key) {
  const normalized = key === null || key === undefined || key === '' ? '(null)' : String(key);
  map[normalized] = (map[normalized] || 0) + 1;
}

function countsEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function eachRow(handler) {
  const gunzip = zlib.createGunzip();
  const ndjsonHash = crypto.createHash('sha256');
  const hashTransform = new Transform({
    transform(chunk, _encoding, callback) {
      ndjsonHash.update(chunk);
      callback(null, chunk);
    },
  });

  const stream = fs.createReadStream(inputFile).pipe(gunzip).pipe(hashTransform);
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    await handler(JSON.parse(line));
  }
  return ndjsonHash.digest('hex');
}

async function validateExport() {
  const ids = new Set();
  const idsInOrder = [];
  const counts = {
    total: 0,
    by_validation_status: {},
    by_mapping_status: {},
    by_course: {},
    by_language: {},
    exam_eligible: 0,
    non_tested_exam_eligible: 0,
  };

  const ndjsonHash = await eachRow(async (row) => {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !row.id) {
      throw new Error('Export row is missing a string id.');
    }
    if (ids.has(row.id)) throw new Error(`Duplicate question id in export: ${row.id}`);
    ids.add(row.id);
    idsInOrder.push(row.id);

    const rowColumns = Object.keys(row).sort();
    const expected = [...expectedColumns].sort();
    if (JSON.stringify(rowColumns) !== JSON.stringify(expected)) {
      throw new Error(`Row ${row.id} columns do not match the manifest schema.`);
    }
    if ('password' in row || 'password_hash' in row || 'email' in row || 'full_name' in row) {
      throw new Error(`Row ${row.id} contains a forbidden user/credential field.`);
    }

    counts.total += 1;
    increment(counts.by_validation_status, row.validation_status);
    increment(counts.by_mapping_status, row.mapping_status);
    increment(counts.by_course, row.course_id);
    increment(counts.by_language, row.language);
    if (row.is_exam_eligible) counts.exam_eligible += 1;
    if (row.is_exam_eligible && row.validation_status !== 'tested') {
      counts.non_tested_exam_eligible += 1;
    }
  });

  if (ndjsonHash !== manifest.integrity?.questions_ndjson_uncompressed_sha256) {
    throw new Error('Uncompressed NDJSON SHA-256 does not match manifest.json.');
  }
  if (counts.total !== manifest.question_row_count) {
    throw new Error(`Row count ${counts.total} does not match manifest ${manifest.question_row_count}.`);
  }

  const expectedCounts = manifest.counts || {};
  const comparisons = [
    ['by_validation_status', counts.by_validation_status, expectedCounts.by_validation_status],
    ['by_mapping_status', counts.by_mapping_status, expectedCounts.by_mapping_status],
    ['by_course', counts.by_course, expectedCounts.by_course],
    ['by_language', counts.by_language, expectedCounts.by_language],
  ];
  for (const [label, actual, expected] of comparisons) {
    if (expected && !countsEqual(actual, expected)) {
      throw new Error(`Export ${label} counts do not match manifest.json.`);
    }
  }
  if (counts.exam_eligible !== expectedCounts.exam_eligible) {
    throw new Error('Export exam-eligible count does not match manifest.json.');
  }
  if (counts.non_tested_exam_eligible !== expectedCounts.non_tested_exam_eligible) {
    throw new Error('Export non-tested eligible count does not match manifest.json.');
  }

  return { ids: idsInOrder, counts, ndjsonHash };
}

function databasePool() {
  const selectedDatabaseUrl =
    process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!selectedDatabaseUrl) {
    throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be configured.');
  }
  process.env.DATABASE_URL = selectedDatabaseUrl;
  const connectionString = requireDatabaseUrl();
  return new Pool({
    connectionString,
    ssl: databaseSslConfig(connectionString),
    max: 1,
  });
}

function pgValue(value, column) {
  if (value === null || value === undefined) return null;
  if (column.data_type === 'jsonb' || column.data_type === 'json') return JSON.stringify(value);
  return value;
}

async function insertBatch(client, rows, columns, columnByName) {
  if (!rows.length) return;
  const values = [];
  const tuples = [];

  for (const row of rows) {
    const placeholders = [];
    for (const column of columns) {
      values.push(pgValue(row[column], columnByName.get(column)));
      placeholders.push(`$${values.length}`);
    }
    tuples.push(`(${placeholders.join(', ')})`);
  }

  const updates = columns
    .filter((column) => column !== 'id')
    .map((column) => `"${column}" = EXCLUDED."${column}"`)
    .join(', ');

  await client.query(
    `INSERT INTO questions (${columns.map((column) => `"${column}"`).join(', ')})
     VALUES ${tuples.join(', ')}
     ON CONFLICT (id) DO UPDATE SET ${updates}`,
    values
  );
}

async function main() {
  const validation = await validateExport();
  console.log(`Export validation passed: ${validation.counts.total} rows`);
  console.log(`Uncompressed NDJSON SHA-256: ${validation.ndjsonHash}`);

  if (dryRun) {
    console.log('Dry run only: no database connection or write was attempted.');
    return;
  }

  const pool = databasePool();
  const client = await pool.connect();
  try {
    const targetColumns = (
      await client.query(`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'questions'
        ORDER BY ordinal_position
      `)
    ).rows;
    const targetColumnNames = targetColumns.map((column) => column.column_name);
    if (JSON.stringify([...targetColumnNames].sort()) !== JSON.stringify([...expectedColumns].sort())) {
      throw new Error('Target public.questions columns do not exactly match the export manifest.');
    }
    const columnByName = new Map(targetColumns.map((column) => [column.column_name, column]));

    const before = (
      await client.query(`
        SELECT current_database() AS database_name,
               COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE validation_status = 'tested')::int AS tested,
               COUNT(*) FILTER (WHERE validation_status = 'generated')::int AS generated
        FROM questions
      `)
    ).rows[0];
    console.log(
      `Target database ${before.database_name}: before=${before.total} tested=${before.tested} generated=${before.generated}`
    );
    console.log('Writing only public.questions by id upsert. No rows will be deleted.');

    await client.query('BEGIN');
    let batch = [];
    let written = 0;
    await eachRow(async (row) => {
      batch.push(row);
      if (batch.length >= batchSize) {
        await insertBatch(client, batch, targetColumnNames, columnByName);
        written += batch.length;
        batch = [];
      }
    });
    if (batch.length) {
      await insertBatch(client, batch, targetColumnNames, columnByName);
      written += batch.length;
    }
    await client.query('COMMIT');

    const after = (
      await client.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE validation_status = 'tested')::int AS tested,
               COUNT(*) FILTER (WHERE validation_status = 'generated')::int AS generated,
               COUNT(*) FILTER (WHERE is_exam_eligible)::int AS eligible,
               COUNT(*) FILTER (WHERE validation_status <> 'tested' AND is_exam_eligible)::int AS non_tested_eligible,
               COUNT(*) FILTER (WHERE id = ANY($1::text[]))::int AS exported_ids_present
        FROM questions
      `, [validation.ids])
    ).rows[0];

    console.log(
      `Import complete: written=${written} after=${after.total} tested=${after.tested} generated=${after.generated} eligible=${after.eligible}`
    );
    if (after.exported_ids_present !== validation.ids.length) {
      throw new Error(
        `Only ${after.exported_ids_present}/${validation.ids.length} exported IDs are present after import.`
      );
    }
    if (exact && after.total !== manifest.question_row_count) {
      throw new Error(
        `Exact check failed: target total ${after.total} != export total ${manifest.question_row_count}. Extra target rows were not deleted.`
      );
    }
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Question-bank import failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
