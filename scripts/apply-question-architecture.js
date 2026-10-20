'use strict';

/**
 * Applies the curriculum-129 v2 metadata architecture to existing rows.
 *
 * Safety rules:
 *   - No row or ID is deleted.
 *   - No validation status is promoted.
 *   - Every generated row is forced exam-ineligible and practice-only.
 *   - Existing generated synthetic topic IDs are replaced with NULL +
 *     mapping_status='unassigned'. The audit proved that their titles often
 *     do not describe the actual task, so inventing a curriculum mapping
 *     would be false precision.
 *   - Existing tested rows keep a topic only when it is a real curriculum
 *     topic in the same course.
 *   - Legacy generated difficulty is normalized from the actual task family,
 *     removing the former row-index relationship. This metadata correction
 *     does not validate the rows.
 */

require('dotenv').config();
const { requireDatabaseUrl } = require('./lib/database-url');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const {
  TAXONOMY_VERSION,
  GENERATION_SCHEMA_VERSION,
  COURSE_RUNTIME,
  TOPIC_BY_ID,
  validateTopicCourse,
  difficultyRationale,
} = require('./question-bank/taxonomy');

const DRY_RUN = process.argv.includes('--dry-run');
const OUT = path.join(__dirname, 'question-bank', 'question-architecture-report.json');
const HAND_IDS = ['c-001', 'c-002', 'cpp-001', 'java-001', 'js-001', 'py-001', 'py-002', 'py-003', 'sql-001'];

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function canonicalize(value) {
  return String(value ?? '')
    .replace(/\[(?:Challenge )?[^\]]+\]/g, '[ID]')
    .replace(/-bank-\d+/g, '-bank-#')
    .replace(/\b\d+(?:\.\d+)?\b/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cohortOf(q) {
  if (q.id.startsWith('core-')) return 'verified-core';
  if (q.id.includes('-bank-')) return 'pipeline-bank';
  if (/^(c|cpp|python|java|sql|javascript)-0(0[4-9]|1[0-9]|2[0-5])$/.test(q.id)) return 'procedural-seed';
  if (q.id.startsWith('topic-')) return 'topic-linked';
  if (HAND_IDS.includes(q.id)) return 'hand-curated';
  return 'other';
}

function familyOf(q) {
  const s = String(q.statement || '');
  if (q.language === 'sql' && /table phrases\(id INTEGER, phrase TEXT\)/.test(s)) return 'sql-string-token-transform';
  if (/transformed into \(x \*/.test(s)) return 'arithmetic-transform';
  if (/count of (vowels|consonants) and reverse every word/.test(s)) return 'string-token-transform';
  if (/primary perimeter border/.test(s)) return 'matrix-border-interior-max';
  if (/Write an optimized SQL query/.test(s)) return 'sql-department-aggregate';
  if (/longest contiguous subsegment/.test(s)) return 'sliding-window-minmax';
  if (cohortOf(q) === 'procedural-seed') return q.language === 'sql' ? 'sql-sum-stream' : 'sum-stream';
  return 'authored-topic-task';
}

function taskTypeOf(q, family) {
  if (q.course_id === 'system-design') return 'system-simulation';
  if (q.language === 'sql') return family === 'authored-topic-task' ? 'sql-query' : 'sql-query';
  if (family === 'sliding-window-minmax') return 'algorithm-implementation';
  if (family === 'matrix-border-interior-max') return 'data-structure-operation';
  if (family === 'string-token-transform') return 'combined-concepts';
  if (q.course_id === 'dsa') return 'algorithm-implementation';
  return 'direct-application';
}

function generatedDifficulty(family) {
  if (family === 'sql-string-token-transform') return 'Hard';
  if (family === 'sliding-window-minmax' || family === 'sql-department-aggregate') return 'Medium';
  return 'Easy';
}

function generatedDifficultyReason(family) {
  switch (family) {
    case 'arithmetic-transform': return 'One pass applying a fixed linear transform and modulo accumulation.';
    case 'string-token-transform': return 'Tokenization, character classification and selective word reversal in one direct pass.';
    case 'matrix-border-interior-max': return 'Single grid traversal with a boundary predicate and interior maximum.';
    case 'sliding-window-minmax': return 'Requires maintaining a valid window invariant and efficient min/max state rather than a single direct formula.';
    case 'sql-department-aggregate': return 'Combines filtering, grouping, aggregate HAVING conditions, rounding and ordering.';
    case 'sql-string-token-transform': return 'Requires recursive CTE character scanning, ordered tokenization and per-word reversal in declarative SQL.';
    case 'sql-sum-stream': return 'Single aggregate SUM over a prepared table.';
    case 'sum-stream': return 'Single pass summing all input integers.';
    default: return 'Legacy generated task assessed from its actual statement family, not row position.';
  }
}

function inputContract(q, family) {
  if (q.language === 'sql') {
    return {
      version: 1,
      kind: 'sql_fixture_query',
      dialect: 'sqlite',
      setup_source: 'test_cases[].input',
      submission: 'exactly one SQL statement/query as described by the prompt',
      output: 'pipe-separated SQLite rows in statement-specified order',
      deterministic: true,
      family,
    };
  }
  return {
    version: 1,
    kind: 'stdin_stdout',
    input_source: 'stdin',
    output_source: 'stdout',
    comparison: 'normalized exact text',
    deterministic: true,
    family,
  };
}

function runtimeOf(q) {
  const byCourse = COURSE_RUNTIME[q.course_id];
  if (byCourse?.runtime && byCourse.language === q.language) return byCourse.runtime;
  return {
    python: 'Python 3, bubblewrap sandbox',
    c: 'GCC 14 (default C mode), bubblewrap sandbox',
    cpp: 'G++ 14 -std=c++17, bubblewrap sandbox',
    java: 'OpenJDK 11, bubblewrap sandbox',
    javascript: 'Node.js 20, bubblewrap sandbox',
    sql: 'SQLite 3 practice runner, bubblewrap sandbox',
  }[q.language] || null;
}

function increment(obj, key) { obj[key] = (obj[key] || 0) + 1; }

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const client = await pool.connect();

  try {
    const dbTopics = await client.query('SELECT id, course_id FROM course_topics');
    if (dbTopics.rows.length !== TOPIC_BY_ID.size) {
      throw new Error(`DB topic count ${dbTopics.rows.length} != taxonomy count ${TOPIC_BY_ID.size}`);
    }
    for (const row of dbTopics.rows) {
      if (!validateTopicCourse(row.id, row.course_id)) throw new Error(`DB topic ${row.id} is absent or mismatched in taxonomy`);
    }

    const questions = (await client.query('SELECT * FROM questions ORDER BY id')).rows;
    const before = {
      total: questions.length,
      generated: questions.filter((q) => q.validation_status === 'generated').length,
      tested: questions.filter((q) => q.validation_status === 'tested').length,
      eligible: questions.filter((q) => q.is_exam_eligible).length,
    };

    const duplicateGroups = new Map();
    const exactStatementGroups = new Map();
    const updates = [];

    for (const q of questions) {
      const cohort = cohortOf(q);
      const family = familyOf(q);
      const tests = Array.isArray(q.test_cases) ? q.test_cases : JSON.parse(q.test_cases || '[]');
      const signature = sha256(`${canonicalize(q.statement)}|${JSON.stringify(tests)}`);
      if (!duplicateGroups.has(signature)) duplicateGroups.set(signature, []);
      duplicateGroups.get(signature).push(q.id);
      const exactKey = sha256(q.statement || '');
      if (!exactStatementGroups.has(exactKey)) exactStatementGroups.set(exactKey, []);
      exactStatementGroups.get(exactKey).push(q.id);

      const isGenerated = q.validation_status === 'generated';
      const validExistingTopic = validateTopicCourse(q.topic_id, q.course_id);
      const topicId = !isGenerated && validExistingTopic ? q.topic_id : null;
      const difficulty = isGenerated ? generatedDifficulty(family) : q.difficulty;
      const rationale = isGenerated
        ? difficultyRationale(difficulty, generatedDifficultyReason(family))
        : (q.difficulty_rationale || difficultyRationale(difficulty, 'Retained the authored difficulty pending the separate verified-core approval review.'));

      // Reapplying this migration must never downgrade an approved schema-v2
      // row to the generic legacy contract or erase its execution evidence.
      const preserveApprovedV2 = !isGenerated && (
        Number(q.generation_schema_version) === GENERATION_SCHEMA_VERSION ||
        q.validation_evidence?.exam_ready === true
      );
      const computedEvidence = isGenerated
        ? {
            source: cohort,
            architecture: 'legacy-generated-normalized',
            deterministic_audit: 'scripts/question-bank/generated-question-audit.json',
            exam_ready: false,
            reasons: ['unassigned curriculum topic', 'duplicate/title-domain review unresolved'],
          }
        : {
            source: cohort,
            execution_report: cohort === 'verified-core'
              ? 'scripts/question-bank/verified-core/validation-report.json'
              : cohort === 'topic-linked'
                ? 'scripts/question-bank/topic-linked/validation-report.json'
                : 'scripts/question-bank/curated-starter-audit.json',
            exam_ready: Boolean(q.is_exam_eligible),
          };
      const evidence = preserveApprovedV2 && q.validation_evidence ? q.validation_evidence : computedEvidence;

      updates.push({
        id: q.id,
        oldTopicId: q.topic_id,
        oldDifficulty: q.difficulty,
        topic_id: topicId,
        difficulty,
        task_type: preserveApprovedV2 && q.task_type ? q.task_type : taskTypeOf(q, family),
        runtime: preserveApprovedV2 && q.runtime ? q.runtime : runtimeOf(q),
        input_contract: preserveApprovedV2 && q.input_contract ? q.input_contract : inputContract(q, family),
        mapping_status: topicId ? 'mapped' : 'unassigned',
        practice_only: isGenerated ? true : preserveApprovedV2 ? q.practice_only : !q.is_exam_eligible,
        duplicate_signature: signature,
        difficulty_rationale: preserveApprovedV2 && q.difficulty_rationale ? q.difficulty_rationale : rationale,
        validation_evidence: evidence,
        generation_schema_version: preserveApprovedV2 ? Number(q.generation_schema_version) : 1,
        is_generated: isGenerated,
        cohort,
        family,
      });
    }

    let duplicateGroupCount = 0;
    let rowsInDuplicateGroups = 0;
    for (const ids of duplicateGroups.values()) {
      if (ids.length > 1) { duplicateGroupCount++; rowsInDuplicateGroups += ids.length; }
    }
    let exactStatementDuplicateGroups = 0;
    let rowsInExactStatementGroups = 0;
    for (const ids of exactStatementGroups.values()) {
      if (ids.length > 1) { exactStatementDuplicateGroups++; rowsInExactStatementGroups += ids.length; }
    }

    const report = {
      generated_at: new Date().toISOString(),
      dry_run: DRY_RUN,
      taxonomy_version: TAXONOMY_VERSION,
      taxonomy_topics: TOPIC_BY_ID.size,
      before,
      rows_updated: updates.length,
      valid_mapped: updates.filter((u) => u.mapping_status === 'mapped').length,
      unresolved_unassigned: updates.filter((u) => u.mapping_status === 'unassigned').length,
      generated_difficulties_changed: updates.filter((u) => u.is_generated && u.oldDifficulty !== u.difficulty).length,
      synthetic_topics_cleared: updates.filter((u) => u.is_generated && u.oldTopicId).length,
      duplicates: {
        canonical_task_and_test_groups: duplicateGroupCount,
        rows_in_canonical_duplicate_groups: rowsInDuplicateGroups,
        exact_statement_groups: exactStatementDuplicateGroups,
        rows_in_exact_statement_groups: rowsInExactStatementGroups,
      },
      by_cohort: {},
      by_family: {},
    };
    for (const u of updates) {
      increment(report.by_cohort, u.cohort);
      increment(report.by_family, u.family);
    }

    await client.query('BEGIN');
    if (!DRY_RUN) {
      for (const u of updates) {
        await client.query(
          `UPDATE questions
              SET topic_id=$2,
                  difficulty=$3,
                  task_type=$4,
                  runtime=$5,
                  input_contract=$6::jsonb,
                  mapping_status=$7,
                  practice_only=$8,
                  duplicate_signature=$9,
                  difficulty_rationale=$10,
                  validation_evidence=$11::jsonb,
                  generation_schema_version=$13,
                  taxonomy_version=$12,
                  is_exam_eligible=CASE WHEN validation_status='generated' THEN FALSE ELSE is_exam_eligible END
            WHERE id=$1`,
          [
            u.id, u.topic_id, u.difficulty, u.task_type, u.runtime,
            JSON.stringify(u.input_contract), u.mapping_status, u.practice_only,
            u.duplicate_signature, u.difficulty_rationale,
            JSON.stringify(u.validation_evidence), TAXONOMY_VERSION,
            u.generation_schema_version,
          ]
        );
      }
    }

    const check = await client.query(
      `SELECT COUNT(*)::int total,
              COUNT(*) FILTER (WHERE id = ANY($1::text[]) OR id ~ '^(c|cpp|python|java|sql|javascript)-0(0[4-9]|1[0-9]|2[0-5])$')::int curated_141,
              COUNT(*) FILTER (WHERE validation_status='generated' AND is_exam_eligible)::int generated_eligible
         FROM questions`,
      [HAND_IDS]
    );
    if (check.rows[0].total !== before.total) throw new Error('Total changed during architecture application');
    if (check.rows[0].curated_141 !== 141) throw new Error(`Curated IDs present: ${check.rows[0].curated_141}`);
    if (check.rows[0].generated_eligible !== 0) throw new Error('Generated exam quarantine was violated');

    if (DRY_RUN) await client.query('ROLLBACK');
    else {
      await client.query('COMMIT');
      fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    }
    console.log(JSON.stringify(report, null, 2));
    if (!DRY_RUN) console.log(`Report: ${OUT}`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
