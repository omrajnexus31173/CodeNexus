# Code Nexus — Question Bank Audit Report

Last evidence run: 2026-10-20. Current-state final verification is in `docs/FINAL_QUESTION_BANK_VERIFICATION.md`; pre-final JSON evidence is preserved under `scripts/question-bank/history/2026-10-19-pre-final-verification/`, and the immediately prior verified release reports are preserved under `scripts/question-bank/history/2026-10-20-pre-security-remediation/`. The 2026-10-20 database was reconstructed from preserved scripts after a sandbox reset, not restored from an original database backup.

This report separates three different claims that must never be conflated:

1. **Structural presence** — fields and JSON exist.
2. **Behavioral execution** — a stored reference/starter was actually run in the sandbox.
3. **Exam readiness** — execution, expected outputs, topic/course mapping, stated concept, difficulty and duplication are all sound enough for a graded certificate exam.

Currently **200 questions** carry `validation_status='tested'`: 9 hand-written curated questions, 79 topic-linked questions, and 112 schema-v2 verified-core questions. The other **17,991 remain `generated`**, including rows whose narrow reference/output defects were repaired during this audit. This report does **not** claim that all 18,191 questions are correct or curriculum-mapped.

## 1. Current composition

| Group | Count | Status | Exam eligible now | Interpretation |
|---|---:|---|---:|---|
| Pipeline bank (`*-bank-*`) | 17,859 | `generated` | 0 | Legacy template corpus. Deterministic output defects were repaired where provable, but mappings were honestly cleared to unassigned and duplicate/title-domain review remains unresolved. |
| Procedural seed variants (`*-004`…`*-025`) | 132 | `generated` | 0 | One stdin/SQL sum exercise repeated 22 times per language. References/starters were repaired in the prior audit; still not promoted. |
| Hand-written curated | 9 | `tested` | 9 | Starter and reference execution-audited; exact curriculum topics reviewed and approved. |
| Topic-linked additions (`topic-*`) | 79 | `tested` | 79 | Execution-validated lesson practice; subsequently passed the separate verified-core approval gate. |
| Verified-core additions (`core-*`) | 112 | `tested` | 112 | Schema-v2 questions with exact topic/course mapping, contracts, rationales, hidden tests and individual execution evidence; approved only after seeding. |
| **Total** | **18,191** | **200 tested / 17,991 generated / 0 reviewed** | **200** | All 141 original curated IDs are preserved; no question was deleted. |

### Counts by course

| Course | Total | Generated / still unverified | Tested | Eligible tested exam pool |
|---|---:|---:|---:|---:|
| `c-lang` | 3,023 | 2,998 | 25 | 25 |
| `cpp` | 3,024 | 2,999 | 25 | 25 |
| `java` | 3,024 | 2,999 | 25 | 25 |
| `javascript` | 3,024 | 2,999 | 25 | 25 |
| `python` | 3,022 | 2,997 | 25 | 25 |
| `sql-databases` | 3,024 | 2,999 | 25 | 25 |
| `dsa` | 25 | 0 | 25 | 25 |
| `system-design` | 25 | 0 | 25 | 25 |
| `html-css` | 0 | 0 | 0 | 0 (unsupported grader) |
| `app-dev` | 0 | 0 | 0 | 0 (unsupported runtime) |
| **Total** | **18,191** | **17,991** | **200** | **200** |

The eight supported exam courses each have the required 25 eligible tested questions. The API still returns **409 with the actual available count** whenever a supported pool falls below 25, and explicitly reports HTML/CSS and App Development as unsupported rather than padding an exam with generated or unrelated questions.

### Curriculum-129 architecture and progression (current state)

- Taxonomy version: `curriculum-129-v2`; generation schema version 2 for verified-core candidates.
- Valid mapped questions: **200**.
- Honestly unassigned legacy generated questions: **17,991** (`topic_id=NULL`, `practice_only=true`, `is_exam_eligible=false`).
- Invalid mapped or invalid unassigned rows: **0**.
- Canonical task-and-test duplicate groups across all preserved rows: **198**, covering **17,892** rows.
- Exact-statement duplicate groups: **22**, covering **110** rows.
- Canonical duplicate groups inside the tested pool: **0**.
- Tested questions cover **108 distinct curriculum topics**.
- Difficulty is no longer row-order-derived for generated rows: the original architecture pass changed **10,682** generated labels from the historical row-order scheme to task-family labels and recorded rationales. In the current DB, canonical generated tasks spanning multiple difficulties are **0**. This is metadata correction only, not promotion; the 132 one-sum procedural variants are now also Easy in source so a reseed cannot reintroduce index-derived labels.
- Progression is derived consistently as Easy→Beginner, Medium→Intermediate, Hard→Advanced, with course pools distributed as: C 9/10/6, C++ 10/9/6, Python 13/7/5, Java 11/7/7, JavaScript 9/10/6, SQL 8/10/7, DSA 7/9/9, System Design 4/12/9.
- Lesson recommendations use only tested questions mapped to the exact lesson topic and course; there is no generated or unrelated fallback.
- The separate approval report is `scripts/question-bank/verified-core/approval-report.json`: **200/200 approved**, with source/DB parity, sample-as-test, hidden-test, topic, signature, explanation/hint, and execution-report checks.
- The final DB verifier (`scripts/verify-final-question-bank.js`) additionally required at least three distinct inputs and two distinct expected outputs. It found two SQL DDL topic questions repeating one fixture; those prompts/tests were redesigned around varying seed fixtures, rerun through the 79-question validator, reseeded, architecture-applied, and reapproved. The verifier then freshly executed every DB-stored reference/starter: **200/200** references `Accepted`, **200/200** starters `Wrong Answer`.

## 2. How the generated audit was performed

New audit entry point:

```bash
npm run audit:generated
# equivalent to:
node scripts/audit-generated-questions.js
```

Evidence files:

- Historical baseline: `scripts/question-bank/generated-question-audit-baseline.json`
- Historical pre-final snapshot: `scripts/question-bank/history/2026-10-19-pre-final-verification/`
- Current generated audit: `scripts/question-bank/generated-question-audit.json`
- Current deterministic-only generated audit: `scripts/question-bank/generated-question-audit-deterministic.json`
- Current sampled generated audit copy: `scripts/question-bank/generated-question-audit-current.json`
- Current final core/DB verification: `scripts/question-bank/final-question-bank-verification.json`
- Repairs (current run): `scripts/question-bank/generated-question-repair-report.json`
- Quarantine (current run): `scripts/question-bank/generated-question-quarantine-report.json`

### Full-corpus deterministic pass: all 17,991 generated rows

For every generated row the audit checks:

- required content fields and starter for the row's own language;
- test-case JSON shape and test count;
- course existence and exact `course_topics(id, course_id)` mapping;
- independent expected-output oracles for every actual generated task family;
- sample-output agreement with the same oracle;
- sample/test consistency and SQL answer leakage in `sample_input`;
- reference structure (executable code versus prose);
- SQL semantic requirements (including the stated average-salary threshold);
- title-domain versus actual task-family alignment;
- exact/canonical duplicate statements, tests and references;
- whether the same canonical task/tests appear under multiple difficulty labels;
- exam eligibility at the time of audit.

There are no generated MCQ/answer-option rows in this schema: all generated bank rows are code/SQL stdin/stdout tasks, so there are no generated answer options or option indexes to validate.

### Stratified sandbox-execution pass

The execution sample is deterministic (SHA-256 ordering of IDs) and selects two rows per available stratum. Historical runs contained different numbers of strata: 612 rows before difficulty normalization, 228 in the preserved pre-final run, and 204 in the immediately prior verified release. In the 2026-10-20 reconstructed current audit, the available cohort/language/family strata produce **36 sampled rows**, all behaviorally consistent and none promoted. Separately, all 186 repaired SQL `phrases` rows and all 200 tested-pool questions were execution-validated individually through their dedicated validators/audits and the final DB verifier.

For each sampled row, both the stored starter and stored reference were executed through the real `/api/execute` sandbox against all stored tests. A sampled row is only called behaviorally consistent when:

- reference = `Accepted`;
- starter != `Accepted`;
- every stored expected output agrees with the independent oracle;
- sample output agrees with the oracle.

Even then, it is **not** called exam-ready unless topic/domain/difficulty/duplicate requirements also pass.

SQL execution evidence in this generated audit is from the **SQLite practice runner only**. It is not PostgreSQL validation. PostgreSQL evidence applies separately to the SQL lesson fixtures checked by `validate-sql-examples.js`.

## 3. Baseline findings before repair/quarantine

The baseline was materially unsafe for graded exams:

| Baseline measure | Result |
|---|---:|
| Generated rows deterministically audited | 17,991 |
| Pipeline rows exam-eligible | 17,859 |
| Generated rows meeting deterministic exam-readiness rules | 0 |
| Valid exact topic→course mappings | 0 / 17,991 |
| Rows whose all stored expected outputs matched an independent oracle | 3,853 / 17,991 |
| Rows with at least one expected-output mismatch | 14,138 |
| Rows with sample-output mismatch | 14,138 |
| Non-executable prose references | 15,068 |
| SQL aggregate references missing the stated `AVG(salary)` threshold | 2,791 |
| SQL samples containing the answer query | 2,791 |
| SQL-language rows containing a non-SQL string task | 186 |
| Rows in a same-language exact-test duplicate group | 17,553 |
| Rows whose canonical task/tests spanned multiple difficulties | 17,892 |
| Direct title-domain/task alignment | 2,419 |
| Partial alignment | 2,232 |
| Domain mismatch | 13,208 |
| No concept stated in title (procedural) | 132 |

Baseline stratified execution:

| Sample result | Count |
|---|---:|
| Sampled | 612 |
| Reference Accepted | 36 |
| Reference Compile Error | 288 |
| Reference Runtime Error | 288 |
| Execution-ok + oracle-consistent | 36 |
| Exam-ready after execution | 0 |

All 36 baseline passes were from the already-repaired procedural subset. **0 of the 576 sampled pipeline rows passed.** The 90 sampled SQL aggregate rows also failed at runtime because sequential fixtures recreated `employees` without dropping it.

### Why the corpus collapsed

Source inspection of the legacy pipeline showed:

- 16 title-domain labels per language, but only five actual tasks;
- English `solSummary` prose inserted directly into code skeletons;
- synthetic topic IDs (`<lang>-topic-1…10`) rather than real curriculum topics;
- difficulty assigned from the global row index, not task complexity;
- every generated row inserted as exam-eligible;
- string and sliding-window expected outputs hard-coded independently of the varying statement parameters;
- SQL reference omitted the statement's salary threshold;
- SQL sample input appended the answer query;
- a final pipeline step claimed a sandbox test and marked six curated IDs `tested` without executing anything.

## 4. Evidence-backed repairs applied

Repair entry point:

```bash
npm run repair:generated
```

The repair script is transactional and idempotent. It preserved every ID and row and changed no validation status.

| Repair | Count |
|---|---:|
| Pipeline rows scanned | 17,859 |
| Rows updated | 17,673 |
| Non-SQL prose references replaced with executable family implementations | 14,882 |
| Test expected outputs corrected | 17,550 tests |
| Rows with at least one expected-output correction | 13,952 |
| Sample outputs corrected | 13,952 |
| SQL average-salary thresholds added | 2,791 |
| SQL fixture inputs given `DROP TABLE IF EXISTS employees;` | 8,373 inputs (tests + samples) |
| SQL answer queries removed from `sample_input` | 2,791 |
| Generic SQL starters replaced with an employees-table scaffold | 2,791 |
| Rows initially left for a contract redesign | 186 SQL-language string tasks |

The 186 rows originally asked for a plain-text word transformation while their language/test contract was SQL. In the architecture phase their prompt and tests were deliberately changed to a valid SQLite contract: a `phrases(id INTEGER, phrase TEXT)` fixture with exactly one phrase, one output row `selected_count|transformed_phrase`, non-solving starters, and recursive-CTE reference queries. `scripts/validate-sql-string-contracts.js` now passes **186/186** (reference `Accepted`, starter `Wrong Answer` for every row). They remain `generated`, unassigned, and exam-ineligible; fixing the contract does not resolve duplicate/title-domain review.

The legacy generator source was also corrected so a rerun cannot recreate the same unsafe state:

- executable reference templates instead of prose;
- parameter-derived string/sliding expected outputs;
- SQL threshold, safe fixtures and no sample answer leak;
- task-family-based provisional difficulty instead of index-only cycling;
- `topic_id=NULL` instead of fabricating a curriculum topic;
- `validation_status='generated'`;
- `is_exam_eligible=false`;
- no unexecuted “mark tested” step;
- no database credential fallback in that pipeline;
- ingestion is disabled unless both `--allow-legacy-drafts` and `ALLOW_LEGACY_QUESTION_DRAFTS=1` are supplied, and allowed drafts receive explicit family titles/tags and v2 quarantine metadata instead of reviving the 96 synthetic labels.

## 5. Exam quarantine and defense in depth

Quarantine entry point:

```bash
npm run quarantine:generated
```

Historical applied result at the pre-verified-core stage (preserved for provenance; current totals are in section 1):

| Measure | Before | After |
|---|---:|---:|
| Total questions | 18,079 | 18,079 |
| Generated | 17,991 | 17,991 |
| Tested | 88 | 88 |
| Generated exam-eligible | 17,859 | **0** |
| Any non-tested exam-eligible | 17,859 | **0** |
| Tested exam-eligible | 9 | 9 |
| Original curated IDs present | 141 | 141 |

Application code requires all of the following for an exam question: exact `course_id`, `validation_status='tested'`, `is_exam_eligible=true`, `mapping_status='mapped'`, `practice_only=false`, an existing `course_topics` row with the same course, and at least three test cases. The course must also be exam-supported and its strict pool must contain at least 25 rows. These rules are enforced in:

- `POST /api/exam/start` pool counting and question selection;
- `GET /api/courses` exam-pool counts and availability;
- `POST /api/exam/submit` pool revalidation before grading.

New question rows fail closed in the schema/migration defaults: `validation_status='generated'`, `is_exam_eligible=false`, `mapping_status='unassigned'`, and `practice_only=true`. A rolled-back insert probe in the final verifier returned exactly those defaults.

The current learning-integrity suite (61/61) and an all-course exam-start probe prove:

- each of the eight supported courses starts with 25 unique strict-pool questions and leaks no reference/explanation/hints/tests/starter;
- HTML/CSS and App Development return HTTP 409 as unsupported, with `availableQuestions=0`;
- generated rows remain excluded even if 30 are temporarily mis-flagged eligible, and a 50-question request cannot expand Python’s real 25-question pool;
- blank submission fails with no points/certificate;
- 9/10 known-good answers pass at 90%, award +10 and issue a certificate;
- cross-user, guest, fabricated-session and duplicate submissions are rejected.

## 6. Historical generated-audit result after repair, before architecture/SQL-contract redesign

The tables in this section are preserved baseline-stage evidence. They are **not** the current generated state; current values are in section 6A.

| Historical post-repair measure | Result |
|---|---:|
| Generated rows deterministically audited | 17,991 |
| Rows whose all expected outputs now match the oracle | 17,805 |
| Rows still failing oracle agreement | 186 (the impossible SQL string rows) |
| Sample outputs matching oracle | 17,805 |
| Executable-shaped references | 17,805 |
| Prose/non-SQL references remaining | 186 |
| Generated exam-eligible | **0** |
| Generated rows promoted | **0** |
| Generated rows meeting full exam-readiness rules | **0** |
| Valid exact topic→course mappings | **0 / 17,991** |
| Domain direct / partial / mismatch | 2,419 / 2,232 / 13,208 |
| Rows in same-language exact-test duplicate groups | 17,553 |
| Rows in canonical tasks spanning multiple difficulties | 17,892 |
| Rows with fewer than 3 tests | 4,412 |

Historical post-repair stratified execution:

| Sample result | Count |
|---|---:|
| Sampled | 612 |
| Reference Accepted | 606 |
| Starter Wrong Answer | 606 |
| Reference/starter Runtime Error | 6 / 6 |
| Execution-ok + oracle-consistent | **606** |
| Exam-ready after execution | **0** |

The six failures are exactly the six sampled SQL-language string-transform rows. Every sampled repaired pipeline family/language combination other than that impossible group passed, as did all 36 sampled procedural rows.

### Historical post-repair sample by task family

| Family | Generated rows | Historical sampled | Behaviorally consistent |
|---|---:|---:|---:|
| Sliding-window min/max | 12,835 | 414 | 414 |
| SQL department aggregate (SQLite runner) | 2,791 | 90 | 90 |
| String token transform, non-SQL | 1,117 | 36 | 36 |
| Arithmetic transform | 744 | 24 | 24 |
| Matrix border/interior max | 186 | 6 | 6 |
| String token transform in SQL language | 186 | 6 | 0 |
| Procedural sum stream | 110 | 30 | 30 |
| Procedural SQL sum | 22 | 6 | 6 |
| **Total generated** | **17,991** | **612** | **606** |

## 6A. Current final generated-audit result

| Current measure | Result |
|---|---:|
| Generated rows deterministically audited | 17,991 |
| Rows whose all expected outputs match the defined oracle | 17,991 |
| Rows whose sample output matches the oracle | 17,991 |
| Valid exact topic→course mappings | 0 / 17,991 |
| Generated rows meeting deterministic exam-readiness rules | 0 |
| Generated exam-eligible | 0 |
| Generated rows promoted | 0 |
| Current sampled rows | 36 |
| Sample execution-ok | 36 |
| Sample behaviorally consistent | 36 |
| Exam-ready after execution | 0 |
| Canonical duplicate groups / rows in groups | 198 / 17,892 |
| Exact-statement duplicate groups / rows in groups | 22 / 110 |
| Rows with fewer than 3 tests | 4,226 |
| Title-domain mismatch / not stated | 17,859 / 132 |

The former SQL string rows are now the `sql-phrase-token-transform` family: 186 rows, all `generated`, unassigned, practice-only, and ineligible. The deterministic audit evaluates them with an independent phrase oracle and fixture-shape checks; `scripts/validate-sql-string-contracts.js` separately executed **186/186** references to `Accepted` and starters to `Wrong Answer` in the SQLite practice runner. That repairs their language contract; it does not make them curriculum-mapped, deduped, or exam-ready.

## 7. What remains unverified and why nothing was promoted

All **17,991 generated rows remain unverified as complete questions**, despite the successful repair sample, because:

- none has a valid real curriculum topic mapping;
- 17,859 pipeline titles do not state a matching curriculum domain in the current audit and the 132 procedural titles do not state one;
- historical row-order difficulty has been corrected to family-based metadata, but a label/rationale alone does not prove that an unmapped, domain-mismatched task tests a curriculum topic;
- duplication is pervasive: 198 canonical task-and-test groups cover 17,892 rows, and the corpus still comes from only a small number of template families;
- 4,226 rows have fewer than three tests;
- only the current 36-row stratified sample was sandbox-executed in the generated audit (plus all 186 SQL phrases rows through their dedicated validator), not all 17,991 rows individually;
- the former impossible SQL string contract is fixed for all 186 rows, but those rows remain unmapped/duplicate-prone generated practice only.

A future promotion pass would need, per candidate row:

1. assign a real topic only where the task genuinely tests that topic;
2. rewrite or retitle domain-mismatched tasks;
3. assign difficulty from reviewed task complexity;
4. deduplicate/select representatives rather than promoting hundreds of copies;
5. execute reference and starter on every candidate;
6. independently verify expected outputs and explanations;
7. only then set `tested` and separately approve exam eligibility.

Until that work is done, generated questions may be surfaced only as honestly labelled generated practice, never as certificate-exam evidence.

## 8. Validated non-generated subsets

- Hand-written curated: **9/9** references Accepted and starters not Accepted (`scripts/audit-curated-starters.js`).
- Topic-linked: **79/79** references Accepted and starters Wrong Answer (`scripts/validate-topic-linked-questions.js`), with 0 duplicate-check failures/warnings.
- Verified core: **112/112** references Accepted and starters Wrong Answer (`scripts/validate-verified-core.js`), gated by exact validation-report hashes at seed time.
- Separate approval: **200/200** (`scripts/approve-verified-core.js`) only after architecture metadata was present.
- Final unified DB verification: **200/200** freshly executed DB references Accepted and starters Wrong Answer, 0 global failures (`scripts/question-bank/final-question-bank-verification.json`). Exact IDs/topic distributions are listed in `docs/FINAL_QUESTION_BANK_VERIFICATION.md`.
- The seed source marks only audit-covered rows as `tested`; the legacy pipeline no longer performs a status promotion.

## 9. Regression evidence for final verification

- Learning integrity/API/exam suite: **61/61**
- Curriculum engine: **46/46**
- Curriculum expansion: **29/29**
- Curriculum examples: **400 passed**, 0 execution failures/mismatches, 87 static-only examples
- PostgreSQL SQL lesson fixtures: **58/58**
- Deep sandbox isolation: **7/7**
- Security/auth: **20/20**
- Business/integration: **16/16**
- Database verification: **6/6**
- Deep structural question-bank validator: passed, including non-tested-eligible = 0
- Topic-linked execution validation: **79/79**
- Verified-core execution validation: **112/112**
- Curated starter/reference audit: **9/9 ok**
- SQL phrases contracts: **186/186**
- Final unified DB verifier: **200/200**, 0 global failures
- Generated audit: **17,991/17,991 oracle agreement; 36/36 current sampled executions behaviorally consistent; 0 exam-ready**
- Learning-integrity exam probes: supported strict pools start without answer/test leakage; unsupported tracks return HTTP 409 rather than substituting questions
- Focused Chromium browser audit for the 2026-10-20 security gate: **27/27** (UI login, dashboard, course/topic/practice, all eight supported exam pages, both unsupported exam pages, library/profile/settings, student admin denial, certificate verification, cookie/local-storage checks, and no unexpected console errors)
- TypeScript and production build: passed

See `README.md` for production blockers that remain outside question-bank correctness, especially live Resend mailbox verification and sandbox-capable hosting.
