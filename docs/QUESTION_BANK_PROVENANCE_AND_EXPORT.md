# Question-bank provenance, export, and fresh-database reproduction

**Verified local evidence date:** 23 October 2026  
**Repository base for the original export:** `076194e0c65ae3d4da791573130fca36e7f60830`

## Bottom line

The reported **18,191** questions are not merely a number in a document. They
were read from the local PostgreSQL database named `codenexus`, exported to a
question-bank-only artifact, imported into a separate newly-created local
PostgreSQL database, and re-exported from that fresh database with the same
canonical question-file hash.

A second newly-created local database was then rebuilt **from repository
source definitions and generator code without importing the export**. It also
reached 18,191 rows. Excluding only run timestamps (`created_at`,
`approved_at`, and `execution_report_generated_at`), every question row and
course/topic mapping matched the exported rows exactly.

> **Online-storage limitation:** No accessible persistent online production
> PostgreSQL database was verified during this work. The verified physical
> locations are (1) the local reconstructed PostgreSQL databases used for
> testing and (2) the standalone verified export artifact outside the Git
> repository. Do not describe the bank as safely stored online until it has
> been imported into the owner's production database and the SQL counts and
> re-export hash below are checked there.

## Verified counts

| Measure | Count |
|---|---:|
| Total questions | 18,191 |
| `validation_status='tested'` | 200 |
| `validation_status='generated'` | 17,991 |
| Exam-eligible | 200 |
| Non-tested exam-eligible | 0 |
| Generated exam-eligible | 0 |
| `mapping_status='mapped'` with a topic | 200 |
| `mapping_status='unassigned'` with `topic_id IS NULL` | 17,991 |
| Courses | 10 |
| Course topics | 129 |

This is intentionally **not** a claim that the 17,991 generated rows are all
high-quality exam questions or that they have real topic mappings. They are
preserved, generated/practice-only drafts, honestly unassigned and excluded
from graded exams. “18,191 questions” means 18,191 preserved records with the
status split above.

## Exact row arithmetic

The 18,191 rows are the sum of four ID cohorts:

| Cohort | Rows | Inserted by |
|---|---:|---|
| Original seed IDs (not `core-*`, `topic-*`, or `*-bank-*`) | 141 | `scripts/seed-questions.js` |
| Pipeline bank IDs (`*-bank-*`) | 17,859 | `scripts/pipeline/build-question-bank.js` |
| Topic-linked IDs (`topic-*`) | 79 | `scripts/seed-topic-linked-questions.js` |
| Verified-core IDs (`core-*`) | 112 | `scripts/seed-verified-core.js` |
| **Total** | **18,191** | |

The generated/status arithmetic is:

```text
141 original seed rows = 9 hand-tested + 132 generated procedural variants
17,859 pipeline rows   = 17,859 generated legacy drafts
79 topic-linked rows   = 79 tested
112 verified-core rows = 112 tested
---------------------------------------------------------
18,191 total           = 200 tested + 17,991 generated
```

## Exact source and insertion files

### 1. Original 141 rows — `scripts/seed-questions.js`

- `questionsData` begins at line 9 and contains the nine hand-written rows.
- Lines 550–615 procedurally create variants for C, C++, Python, Java, SQL,
  and JavaScript. The loop uses indexes 4–25 inclusive: 6 × 22 = 132 rows.
- The procedural rows are explicitly `validation_status='generated'` and
  exam-ineligible.
- Lines 677–680 mark only the nine hand-tested IDs as `tested`.
- `seedQuestions()` begins at line 682 and inserts/upserts `questions`
  beginning at line 690.
- During insertion, only the nine tested rows retain a topic; the 132
  procedural rows are written with `topic_id=NULL`,
  `mapping_status='unassigned'`, and `practice_only=true`.

`scripts/bootstrap-database.js --with-content` runs this seeder as part of a
fresh schema/content bootstrap. It produces the first 141 rows; it does **not**
by itself recreate all 18,191 rows.

### 2. Pipeline 17,859 rows — legacy generated drafts

Main generator/inserter:

- `scripts/pipeline/build-question-bank.js`
  - Lines 38–40 require both `--allow-legacy-drafts` and
    `ALLOW_LEGACY_QUESTION_DRAFTS=1`.
  - `generateQuestionSpec(lang, globalIdx, domainObj)` begins around line 334
    and deterministically creates `${lang}-bank-${zeroPaddedIndex}` IDs.
  - Its parameters are formulas of language and index—there is no
    `Math.random`, random UUID, or shuffle in the question-generation path.
  - It creates five actual task families:
    `arithmetic-transform`, `string-token-transform`,
    `matrix-border-interior-max`, `sql-department-aggregate`, and
    `sliding-window-minmax`.
  - Lines 501, 521–522, and 530–531 force `topic_id=NULL`,
    `is_exam_eligible=false`, `validation_status='generated'`,
    `mapping_status='unassigned'`, and `practice_only=true`.
  - `runPipeline()` begins at line 546. Lines 558–583 set a target of 3,000
    rows **per language** and subtract rows already present. Because the
    141-row base seed runs first, the pipeline inserts
    `6 × 3,000 − 141 = 17,859` new rows, bringing the six generated-language
    tracks to 18,000 total rows before the topic-linked/core additions.

Reference-solution generator:

- `scripts/question-bank/generated-reference-templates.js`
  - Implements deterministic non-SQL reference generators for Python, C,
    C++, Java, and JavaScript across arithmetic, string-token, matrix, and
    sliding-window families.
  - `buildGeneratedReference` begins at line 559 and is exported at line 570.
  - SQL aggregate references are constructed in the pipeline generator.

Post-generation repairs/state guards (these update generated rows but never
promote them):

- `scripts/repair-generated-question-bank.js` — scans only
  `validation_status='generated' AND id LIKE '%-bank-%'`; repairs legacy
  references/fixtures/starters while keeping rows generated/ineligible.
- `scripts/repair-sql-string-contracts.js` — scoped repair for legacy
  SQL/string-contract rows. In the current fresh generator output it found
  0 such rows and updated 0, so it is not a hidden source of current rows.
- `scripts/apply-question-architecture.js` — applies course/runtime/input
  metadata, clears synthetic generated topics, and forces generated rows to
  unassigned/practice-only/ineligible.
- `scripts/apply-generated-quarantine.js` — forces every non-tested row to
  `is_exam_eligible=false` without changing tested-row eligibility.

### 3. Topic-linked 79 tested rows

Question definitions:

- `scripts/question-bank/topic-linked/c.js` — 8
- `scripts/question-bank/topic-linked/cpp.js` — 10
- `scripts/question-bank/topic-linked/python.js` — 12
- `scripts/question-bank/topic-linked/java.js` — 11
- `scripts/question-bank/topic-linked/javascript.js` — 10
- `scripts/question-bank/topic-linked/sql.js` — 11
- `scripts/question-bank/topic-linked/dsa.js` — 13
- `scripts/question-bank/topic-linked/system-design.js` — 4
- `scripts/question-bank/topic-linked/helper.js` — shared factory
- `scripts/question-bank/topic-linked/index.js` — combines all 79 rows

Validation/insertion:

- `scripts/validate-topic-linked-questions.js` executes reference and starter
  code through the running application's sandbox and writes
  `scripts/question-bank/topic-linked/validation-report.json`.
- `scripts/seed-topic-linked-questions.js` requires a full 79/79,
  hash-matching validation report, verifies each `topic_id` exists and
  belongs to the stated `course_id`, then inserts/upserts the rows as tested.

### 4. Verified-core 112 tested rows

Question definitions:

- `scripts/question-bank/verified-core/python.js` — 10
- `scripts/question-bank/verified-core/c.js` — 15
- `scripts/question-bank/verified-core/cpp.js` — 14
- `scripts/question-bank/verified-core/java.js` — 13
- `scripts/question-bank/verified-core/javascript.js` — 14
- `scripts/question-bank/verified-core/sql.js` — 13
- `scripts/question-bank/verified-core/dsa.js` — 12
- `scripts/question-bank/verified-core/system-design.js` — 21
- `scripts/question-bank/verified-core/helper.js` — shared factory
- `scripts/question-bank/verified-core/index.js` — combines all 112 rows

Validation/insertion/approval:

- `scripts/validate-verified-core.js` separately execution-validates the
  candidates and writes the hash-checked validation report.
- `scripts/seed-verified-core.js` inserts hash-matched candidates as tested
  but practice-only and exam-ineligible.
- `scripts/approve-verified-core.js` is the separate final approval step. It
  re-checks the hand-curated, topic-linked, and verified-core evidence and
  approves exactly 25 tested questions for each of the eight supported exam
  courses (200 total), leaving generated/non-tested eligible at zero.

The nine original hand-tested rows are included in that exact 200 through
`scripts/audit-curated-starters.js` and
`scripts/question-bank/curated-starter-audit.json`.

## Course/topic mapping sources

Question mappings are logical IDs; `public.questions` currently has no
foreign-key constraint to `courses` or `course_topics`, so mapping integrity
is checked explicitly by the seeders, validators, SQL below, and
`scripts/verify-db.js`.

Taxonomy sources:

- `scripts/seed-courses.js` seeds the 10 courses, units, and base topics.
- `scripts/curriculum/master-curriculum.js` combines the curriculum modules.
- `scripts/curriculum/**/*.js` contains the underlying 129-topic curriculum
  definitions.
- `scripts/seed-education-engine.js` upserts the 129 topics and 28 units into
  `course_units` and `course_topics`.
- `scripts/question-bank/taxonomy.js` loads `masterTopics`, asserts exactly
  129 topics, defines `TAXONOMY_VERSION='curriculum-129-v2'`, course runtimes,
  supported/unsupported exam courses, and topic/course validation helpers.

Mapping outcome:

- All 18,191 rows have an existing `course_id`.
- Exactly the 200 tested rows have `topic_id` values and
  `mapping_status='mapped'`.
- Topic/course mismatches: 0.
- The 17,991 generated rows have a course but **no claimed topic mapping**:
  `topic_id IS NULL`, `mapping_status='unassigned'`. That absence is
  deliberate; no topic was invented for the legacy generated drafts.

## Are the questions reproducible from the repository?

**Yes for question content and question course/topic mappings, with two exact
qualifications:**

1. The documented sequence/commit and hash-matched evidence reports must be
   used. Running only `db:bootstrap:content` creates just the base 141.
2. Database run timestamps are not byte-identical across independent
   reconstructions. `created_at` is assigned by PostgreSQL, and approval
   evidence contains `approved_at` and `execution_report_generated_at`.
   The verified export preserves the existing values of those fields; a
   source regeneration creates new timestamps.

This was tested on 23 October 2026 in a new local database
`codenexus_qb_source_20261023` using the repository-only sequence below. The
checked-in validation reports were hash-checked by the seeders; this
source-only reproduction did not rerun the execution validators. (Fresh
execution validation had been performed separately during the preceding
reconstruction: curated 9/9, topic-linked 79/79, verified-core 112/112, and
final verifier 400/400.)

Source-only result:

```text
18,191 total | 200 tested | 17,991 generated | 200 eligible
0 non-tested eligible | 0 users
question-mappings.csv: exact hash match with the verified export
normalized row comparison: 0 mismatches after removing only
created_at, approved_at, and execution_report_generated_at
normalized SHA-256 (both banks):
de1706b2bb378b81d5dd4b89d44e9bcec742855680f9a297fa05b551e97188fa
```

### Repository-only reconstruction commands

Run these only against a **new/disposable** database first. Never run the
legacy generator against production merely to “top up” counts without a
backup and a reviewed change plan.

```bash
cd /path/to/CodeNexus
npm ci
cp .env.example .env
# Configure .env for the disposable PostgreSQL database. Do not print it.

npm run db:bootstrap:content

ALLOW_LEGACY_QUESTION_DRAFTS=1 \
  node scripts/pipeline/build-question-bank.js --allow-legacy-drafts

node scripts/repair-generated-question-bank.js
node scripts/repair-sql-string-contracts.js
node scripts/apply-question-architecture.js
node scripts/apply-generated-quarantine.js
node scripts/seed-topic-linked-questions.js
node scripts/seed-verified-core.js
node scripts/apply-question-architecture.js
node scripts/approve-verified-core.js

node scripts/verify-db.js --require-exam-bank
```

Expected milestones:

```text
after bootstrap content:       141 questions (9 tested, 132 generated)
after legacy pipeline:      18,000 questions
after topic-linked seed:    18,079 questions (88 tested, 17,991 generated)
after verified-core seed:   18,191 questions (200 tested, 17,991 generated)
after approval:                200 eligible, 0 non-tested eligible
```

## Question-bank-only verified export

New tools:

- `scripts/export-question-bank.js`
- `scripts/import-question-bank.js`
- npm aliases: `npm run questions:export`, `npm run questions:import`

The exporter uses a read-only repeatable-read transaction and writes:

| File | Contents |
|---|---|
| `questions.ndjson.gz` | All 34 columns of every `public.questions` row, canonical NDJSON sorted by ID |
| `manifest.json` | Row/status/course/cohort counts, schema, hashes, source scope, and source-file list |
| `question-mappings.csv` | One row per question with language, course, topic, mapping, status, eligibility |
| `courses.csv` | Course ID/title/slug mapping reference |
| `course-topics-mapping.csv` | Topic ID/course/unit/title/order/validation reference |
| `SHA256SUMS` | SHA-256 checksums for the files above and manifest |

It does **not** export `users`, password hashes, email/token data, progress,
attempts, point ledgers, certificates, resumes, or any other learner-owned
rows. The importer writes only `public.questions`, requires
`--confirm-upsert`, validates hashes/counts/schema before writing, and never
deletes or truncates existing question rows.

### Export command used

```bash
node scripts/export-question-bank.js \
  --out-dir /home/user/CodeNexus-question-bank-export-2026-10-23
```

Verified export facts:

```text
Rows: 18,191
questions.ndjson.gz bytes: 2,527,476
questions.ndjson.gz SHA-256:
c8598c893676f146d22a5c19d9506a6b26d9906fb39161f9902bf6258f3d1cc8
Uncompressed canonical NDJSON SHA-256:
6b9671748a7b1c9a0ef205e06a36b52a88c95ffc210261ec8bca7f1b322a3840
Sorted question IDs SHA-256:
7cd304bd526640ec62547f61790fc626895a6151c4e407a784d6528060840dbf
question-mappings.csv SHA-256:
1a235aa7c013edb194bef3e5c45677e5b6fe5dfd6e90d888e92d20cdcd27e57f
Source scope recorded in manifest: loopback/local database `codenexus`
Online persistent database verified: false
User accounts/passwords/learner data exported: false
```

`sha256sum -c SHA256SUMS` returned `OK` for every export file.

## Fresh-database reproduction from the export

This is the preferred production-transfer method because it preserves the
exact existing rows—including timestamps and validation evidence—instead of
regenerating them.

### 1. Create a new empty PostgreSQL database

Example for a local/disposable PostgreSQL instance; replace names/owner with
the target environment's values:

```bash
sudo -u postgres createdb -O <app-database-user> codenexus_fresh_verify
```

For Neon or another hosted PostgreSQL provider, create a new database/branch
in the provider instead and configure that database's direct/unpooled URL for
maintenance plus the pooled URL for application runtime.

### 2. Configure the fresh target and create schema/taxonomy

Point `.env` (or the process environment) at the **new** database. Prefer
`DATABASE_URL_UNPOOLED` for these maintenance commands. Then:

```bash
npm ci
npm run db:bootstrap:content
```

This creates the schema, 10 courses, 129 topics, the base 141 questions, and
library resources. It does not seed users.

### 3. Validate the export without writing

```bash
node scripts/import-question-bank.js \
  --input /path/to/questions.ndjson.gz \
  --dry-run
```

Expected:

```text
Export validation passed: 18191 rows
Uncompressed NDJSON SHA-256: 6b9671748a7b1c9a0ef205e06a36b52a88c95ffc210261ec8bca7f1b322a3840
Dry run only: no database connection or write was attempted.
```

### 4. Import into the fresh database

```bash
node scripts/import-question-bank.js \
  --input /path/to/questions.ndjson.gz \
  --confirm-upsert \
  --exact
```

`--exact` fails if the final target total is not the export total. It still
never deletes extra pre-existing rows. For that reason, use it on a genuinely
fresh database, not as a destructive reconciliation tool.

Verified local run:

```text
Target database codenexus_qb_verify_20261023:
  before=141 tested=9 generated=132
Import complete:
  written=18191 after=18191 tested=200 generated=17991 eligible=200
```

### 5. Verify and re-export

```bash
node scripts/verify-db.js --require-exam-bank

node scripts/export-question-bank.js \
  --out-dir /tmp/codenexus-qb-verify-export
```

Verified local result:

```text
verify-db --require-exam-bank: 7/7 passed
Courses 10 | Topics 129 | Questions 18,191 | Users 0
Each supported course strict exam pool: 25
Re-exported questions.ndjson.gz SHA-256:
c8598c893676f146d22a5c19d9506a6b26d9906fb39161f9902bf6258f3d1cc8
Result: exact match with the original verified export
```

One non-question difference is expected after a plain fresh bootstrap:
`course_topics.validation_status` begins as `reviewed` for all 129 topics in
the fresh DB, whereas the previously validated local source DB had 112
`tested` and 17 `reviewed`. The topic IDs, course IDs, unit IDs, titles, and
orders all matched, and every question row/mapping matched. Topic
educational-content validation state is separate from question rows; marking
it `tested` requires the curriculum-example validation flow, not the
question-bank importer.

## Exact SQL count queries

The complete read-only file is:

```text
scripts/question-bank/verify-question-bank-counts.sql
```

Run it with `psql` against the database being checked. One common form is:

```bash
psql "$DATABASE_URL_UNPOOLED" -v ON_ERROR_STOP=1 \
  -f scripts/question-bank/verify-question-bank-counts.sql
```

Do not paste a real connection string into shared logs or documentation. In
hosted consoles, paste the SQL into the provider's SQL editor instead.

The headline query is:

```sql
SELECT
  current_database() AS database_name,
  COUNT(*) AS total_questions,
  COUNT(*) FILTER (WHERE validation_status = 'tested') AS tested_questions,
  COUNT(*) FILTER (WHERE validation_status = 'generated') AS generated_questions,
  COUNT(*) FILTER (WHERE is_exam_eligible) AS exam_eligible_questions,
  COUNT(*) FILTER (
    WHERE validation_status <> 'tested' AND is_exam_eligible
  ) AS non_tested_eligible_questions
FROM public.questions;
```

Expected headline result for the verified bank:

```text
total_questions = 18191
tested_questions = 200
generated_questions = 17991
exam_eligible_questions = 200
non_tested_eligible_questions = 0
```

Course/status query:

```sql
SELECT
  course_id,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE validation_status = 'tested') AS tested,
  COUNT(*) FILTER (WHERE validation_status = 'generated') AS generated,
  COUNT(*) FILTER (
    WHERE validation_status = 'tested'
      AND is_exam_eligible
      AND NOT practice_only
  ) AS strict_exam_pool
FROM public.questions
GROUP BY course_id
ORDER BY course_id;
```

Expected course totals:

| Course | Total | Tested | Generated | Strict pool |
|---|---:|---:|---:|---:|
| `c-lang` | 3,023 | 25 | 2,998 | 25 |
| `cpp` | 3,024 | 25 | 2,999 | 25 |
| `dsa` | 25 | 25 | 0 | 25 |
| `java` | 3,024 | 25 | 2,999 | 25 |
| `javascript` | 3,024 | 25 | 2,999 | 25 |
| `python` | 3,022 | 25 | 2,997 | 25 |
| `sql-databases` | 3,024 | 25 | 2,999 | 25 |
| `system-design` | 25 | 25 | 0 | 25 |

Cohort query:

```sql
SELECT
  CASE
    WHEN id LIKE 'core-%' THEN 'verified-core (core-*)'
    WHEN id LIKE 'topic-%' THEN 'topic-linked (topic-*)'
    WHEN id LIKE '%-bank-%' THEN 'pipeline-bank (*-bank-*)'
    ELSE 'original-seed (all other IDs)'
  END AS cohort,
  COUNT(*) AS rows
FROM public.questions
GROUP BY 1
ORDER BY 1;
```

Expected: original-seed 141, pipeline-bank 17,859, topic-linked 79,
verified-core 112.

Mapping-integrity query:

```sql
SELECT
  (SELECT COUNT(*) FROM public.courses) AS courses,
  (SELECT COUNT(*) FROM public.course_topics) AS topics,
  (
    SELECT COUNT(*)
    FROM public.questions q
    LEFT JOIN public.courses c ON c.id = q.course_id
    WHERE c.id IS NULL
  ) AS questions_missing_course,
  (
    SELECT COUNT(*)
    FROM public.questions q
    WHERE q.mapping_status = 'mapped'
      AND q.topic_id IS NULL
  ) AS mapped_questions_missing_topic,
  (
    SELECT COUNT(*)
    FROM public.questions q
    JOIN public.course_topics t ON t.id = q.topic_id
    WHERE t.course_id <> q.course_id
  ) AS topic_course_mismatches,
  (
    SELECT COUNT(*)
    FROM public.questions
    WHERE mapping_status = 'unassigned'
      AND topic_id IS NOT NULL
  ) AS unassigned_questions_with_topic;
```

Expected: courses 10, topics 129, and all four defect counts 0.

## Production-use warning

Before importing into any real production database:

1. Take a provider/database backup.
2. Run the SQL counts on production first.
3. Run the importer with `--dry-run`.
4. Confirm the production `public.questions` schema exactly matches the
   export manifest.
5. Import only during an owner-approved maintenance/change window.
6. Re-run the SQL counts, `verify-db.js --require-exam-bank`, and a re-export;
   compare the canonical NDJSON hash.
7. Do not use `--exact` as permission to delete anything—the importer does
   not delete extras; it reports a mismatch instead.

No step in the 23 October 2026 verification wrote to an online production
database, and no production data was deleted, regenerated, or overwritten.
