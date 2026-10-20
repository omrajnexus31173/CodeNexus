# Code Nexus — Final Question-Bank Verification

Evidence date: 2026-10-20 (Asia/Calcutta), refreshed during the production security-remediation release gate.

This is the current-state verification report. Historical baseline and pre-final reports are preserved unchanged under `scripts/question-bank/history/2026-10-19-pre-final-verification/`; reports supporting the immediately prior verified ZIP are preserved under `scripts/question-bank/history/2026-10-20-pre-security-remediation/`. The original generated-bank baseline remains `scripts/question-bank/generated-question-audit-baseline.json`.

## Environment and provenance note

At the start of this security-remediation rerun, the disposable execution sandbox again contained the preserved workspace source but no PostgreSQL data or system sandbox/browser packages. The runtime was reprovisioned and the local PostgreSQL database was reconstructed from the preserved init/migration/seed/validation scripts. No populated database was deleted by this verification, and no question record was deleted from the reconstructed bank. All counts below are from queries against that reconstructed database; because no original populated-database backup was available, this is a reconstruction—not an exact database restore—and the ZIP is a source release, not a PostgreSQL dump.

## 1. Database totals

| Measure | Count |
|---|---:|
| total | 18191 |
| tested | 200 |
| generated | 17991 |
| reviewed | 0 |
| eligible | 200 |
| tested_eligible | 200 |
| non_tested_eligible | 0 |
| generated_eligible | 0 |

| Course | Total | Generated | Tested | Strict exam pool | Beginner | Intermediate | Advanced | Exam state |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| c-lang | 3023 | 2998 | 25 | 25 | 9 | 10 | 6 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| cpp | 3024 | 2999 | 25 | 25 | 10 | 9 | 6 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| python | 3022 | 2997 | 25 | 25 | 13 | 7 | 5 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| java | 3024 | 2999 | 25 | 25 | 11 | 7 | 7 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| sql-databases | 3024 | 2999 | 25 | 25 | 8 | 10 | 7 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| javascript | 3024 | 2999 | 25 | 25 | 9 | 10 | 6 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| html-css | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Unavailable — No deterministic rendering grader is integrated. |
| app-dev | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Unavailable — No Dart/Flutter sandbox runtime is integrated. |
| dsa | 25 | 0 | 25 | 25 | 7 | 9 | 9 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |
| system-design | 25 | 0 | 25 | 25 | 4 | 12 | 9 | Available — Supported deterministic sandbox course with at least 25 strict-pool questions. |

Strict pool criteria: exact course, `tested`, exam-eligible, `mapped`, not practice-only, an existing same-course topic, and at least three test cases. An all-course authenticated exam-start probe returned 25 unique strict-pool questions and no solution/test/hint/starter leakage for each supported course; `html-css` and `app-dev` returned HTTP 409 with `examSupported=false` and `availableQuestions=0`.

## 2. Verified 200-question core

Cohorts: hand-curated 9, topic-linked 79, verified-core 112.
Generation schema versions: v1=88, v2=112. Taxonomy: curriculum-129-v2=200.
Distinct exact curriculum topics covered: 108.

`scripts/verify-final-question-bank.js` checked, for every DB-tested row: exact same-course topic existence; title/statement/input/output/constraints; at least three tests, at least two hidden tests, at least three distinct inputs and two distinct expected outputs; sample equals an executed test; explanation and two distinct hints; complexity; runtime/task type/input contract/difficulty rationale; unique exact statement and duplicate signature; saved cohort execution evidence; and `validation_evidence.exam_ready=true`. It then freshly executed the DB-stored reference and starter for every row sequentially: **200/200 references Accepted and 200/200 starters Wrong Answer**. Full machine-readable detail is in `scripts/question-bank/final-question-bank-verification.json`.

Final-verification remediation disclosed: `topic-sql-relational-model-keys` and `topic-sql-create-table-constraints` originally repeated one identical fixture three times. Their prompts/tests were redesigned around varying seed fixtures (including an apostrophe case, boundary ratings 0 and 10, and empty-seed cases), the 79-question validator was rerun, and only then were the rows reseeded/reapproved. The pre-final report snapshot preserves the earlier evidence; this correction is not hidden.

### Exact verified IDs by course

#### c-lang (25)

`c-001`, `core-c-longest-subarray-sum-k`, `topic-c-arrays-1d`, `core-c-toggle-bit-range`, `topic-c-bitwise-operators`, `core-c-argv-style-calculator`, `topic-c-command-line-args`, `core-c-checked-int-multiply`, `core-c-dynamic-unique-array`, `topic-c-enums-typedef`, `core-c-file-odds-roundtrip`, `core-c-gcd-lcm-function`, `core-c-leap-month-days`, `c-002`, `core-c-collatz-trace-summary`, `core-c-pointer-partition-parity`, `topic-c-pointer-arithmetic-arrays`, `core-c-swap-min-max-pointers`, `topic-c-preprocessor-macros`, `core-c-recursive-hanoi-trace`, `topic-c-recursion-basics`, `core-c-formatted-receipt`, `core-c-char-array-rle`, `topic-c-strings-stringh`, `core-c-struct-score-sort`

#### cpp (25)

`core-cpp-stream-score-summary`, `core-cpp-shopping-cart-class`, `core-cpp-deep-copy-int-array`, `topic-cpp-copy-move-semantics`, `core-cpp-safe-division-exceptions`, `topic-cpp-exception-handling`, `core-cpp-fstream-long-words`, `topic-cpp-file-streams`, `core-cpp-overloaded-area-commands`, `topic-cpp-functions-overloading`, `core-cpp-polymorphic-shape-areas`, `core-cpp-lambda-employee-rank`, `topic-cpp-lambdas-algorithms`, `core-cpp-fraction-operator-plus`, `topic-cpp-operator-overloading`, `core-cpp-reference-clamp-batch`, `core-cpp-shared-ptr-use-count`, `topic-cpp-smart-pointers`, `core-cpp-csv-field-inspector`, `topic-cpp-std-string-deep`, `core-cpp-stl-topk-words`, `cpp-001`, `core-cpp-template-clamp-values`, `topic-cpp-templates-basics`, `topic-cpp-variables-auto-const`

#### dsa (25)

`core-dsa-two-sum-sorted-pointers`, `topic-dsa-arrays-searching`, `core-dsa-loop-operation-counts`, `core-dsa-bst-kth-and-range-sum`, `topic-dsa-binary-search-tree`, `topic-dsa-binary-trees-traversals`, `core-dsa-coin-change-min-coins`, `topic-dsa-dynamic-programming-intro`, `topic-dsa-graphs-bfs-dfs`, `core-dsa-hash-two-sum-first-pair`, `topic-dsa-hashing-basics`, `core-dsa-linked-remove-duplicates-sorted`, `topic-dsa-linked-lists`, `core-dsa-sliding-max-deque`, `topic-dsa-queues`, `core-dsa-subsets-with-target-sum`, `topic-dsa-recursion-backtracking`, `core-dsa-bubble-sort-swap-accounting`, `topic-dsa-sorting-basics`, `core-dsa-count-inversions-merge`, `topic-dsa-sorting-divide-conquer`, `core-dsa-rpn-stack-evaluator`, `topic-dsa-stacks`, `core-dsa-kmp-overlapping-occurrences`, `topic-dsa-strings-algorithms`

#### java (25)

`core-java-payment-interface-fees`, `topic-java-abstract-interfaces`, `core-java-smallest-int-type`, `core-java-rotate-matrix-clockwise`, `topic-java-arrays-varargs`, `core-java-inventory-item-class`, `topic-java-classes-objects`, `core-java-stream-department-average`, `core-java-grade-attendance-gate`, `topic-java-control-flow`, `core-java-config-custom-exception`, `topic-java-exception-handling`, `core-java-generic-stack-ops`, `topic-java-generics-basics`, `core-java-employee-weekly-pay`, `topic-java-inheritance-polymorphism`, `core-java-recursive-binary-search`, `topic-java-methods-overloading-recursion`, `core-java-parallel-sum-threads`, `topic-java-multithreading-basics`, `core-java-stringbuilder-slugify`, `java-001`, `topic-java-strings-stringbuilder`, `core-java-compound-interest`, `topic-java-variables-operators`

#### javascript (25)

`core-js-chunked-window-sums`, `js-001`, `topic-js-arrays-methods`, `core-js-promise-pool-schedule`, `core-js-ttl-storage-simulation`, `topic-js-browser-storage-json`, `core-js-private-cart-class`, `topic-js-classes-prototypes`, `core-js-memoized-square-cache`, `topic-js-closures-scope`, `core-js-virtual-dom-query`, `core-js-parse-records-collect-errors`, `topic-js-error-handling`, `core-js-event-bubbling-chain`, `core-js-fetch-pagination-aggregate`, `topic-js-fetch-async-data`, `core-js-function-pipeline`, `topic-js-functions-arrow-scope`, `core-js-config-registry-module`, `topic-js-modules-pattern`, `core-js-deep-merge-settings`, `topic-js-objects-destructuring`, `core-js-mask-email-local`, `topic-js-strings-template-literals`, `core-js-safe-numeric-tokens`

#### python (25)

`core-py-tiered-shipping-fee`, `py-002`, `core-py-memoized-fib-states`, `topic-py-decorators-closures`, `core-py-topk-word-frequency`, `topic-py-dicts-sets`, `topic-py-exception-handling`, `topic-py-file-handling`, `core-py-closure-counter-ops`, `topic-py-functions-scope`, `core-py-sliding-window-maximum`, `topic-py-iterators-generators`, `topic-py-lists-tuples`, `topic-py-modules-imports`, `core-py-numpy-row-means`, `core-py-bank-account-ledger`, `topic-py-oop-classes`, `topic-py-operators-expressions`, `core-py-pandas-category-totals`, `core-py-run-length-codec`, `py-003`, `topic-py-strings-in-depth`, `topic-py-testing-basics`, `core-py-mixed-token-ledger`, `py-001`

#### sql-databases (25)

`core-sql-case-band-counts`, `topic-sql-case-conditional-aggregation`, `core-sql-create-products-constraints`, `topic-sql-create-table-constraints`, `core-sql-crud-task-cleanup`, `topic-sql-crud-dml`, `core-sql-recursive-org-depth`, `topic-sql-ctes`, `core-sql-filter-pattern-range-distinct`, `topic-sql-filtering-like-patterns`, `core-sql-composite-index-proof`, `topic-sql-indexes-explain`, `core-sql-join-department-totals`, `core-sql-normalize-supplier-dimension`, `topic-sql-normalization`, `core-sql-orphan-foreign-keys`, `topic-sql-relational-model-keys`, `core-sql-page-three-results`, `sql-001`, `core-sql-above-department-average`, `topic-sql-subqueries`, `core-sql-guarded-balance-transfer`, `topic-sql-transactions-acid`, `core-sql-view-category-totals`, `topic-sql-views`

#### system-design (25)

`core-sd-cache-aside-ttl-invalidate`, `core-sd-cache-stampede-singleflight`, `core-sd-cdn-edge-cache-regions`, `core-sd-lfu-cache-eviction`, `topic-sd-caching-strategies`, `core-sd-hash-shard-distribution`, `core-sd-quorum-availability-matrix`, `core-sd-rebalance-partitions-new-node`, `core-sd-replica-lag-stale-reads`, `topic-sd-databases-sharding-replication`, `core-sd-health-check-failover-rr`, `core-sd-ip-hash-affinity`, `core-sd-least-connections-completions`, `core-sd-power-of-two-choices`, `topic-sd-load-balancing-scaling`, `core-sd-bounded-queue-backpressure`, `core-sd-fixed-window-limiter`, `core-sd-priority-job-scheduler`, `core-sd-sliding-window-log-limiter`, `topic-sd-queues-rate-limiting`, `core-sd-autoscaler-rate-limits`, `core-sd-canary-hash-routing`, `core-sd-n-plus-one-redundancy`, `core-sd-scale-up-vs-out-cost`, `core-sd-smooth-weighted-round-robin`

### Exact tested counts by topic

| Course | Topic ID | Topic title | Tested questions | IDs |
|---|---|---|---:|---|
| c-lang | c-arithmetic-relational-ops | Arithmetic and Relational Operators | 1 | `c-001` |
| c-lang | c-arrays-1d | One-Dimensional Arrays: Declaration, Traversal & Bounds | 2 | `core-c-longest-subarray-sum-k`, `topic-c-arrays-1d` |
| c-lang | c-bitwise-operators | Bitwise Operators & Bit Masks | 2 | `core-c-toggle-bit-range`, `topic-c-bitwise-operators` |
| c-lang | c-command-line-args | Command-Line Arguments: argc, argv & Parsing | 2 | `core-c-argv-style-calculator`, `topic-c-command-line-args` |
| c-lang | c-datatypes-modifiers | Data Types, Sizes & Type Modifiers | 1 | `core-c-checked-int-multiply` |
| c-lang | c-dynamic-memory-allocation | Dynamic Memory Allocation (malloc, calloc, realloc, free) | 1 | `core-c-dynamic-unique-array` |
| c-lang | c-enums-typedef | Enumerations (enum) & typedef Aliases | 1 | `topic-c-enums-typedef` |
| c-lang | c-file-operations | File Operations (fopen, fclose, fread, fwrite, fprintf) | 1 | `core-c-file-odds-roundtrip` |
| c-lang | c-functions-basics | Function Basics (Declaration, Definition, Call) | 1 | `core-c-gcd-lcm-function` |
| c-lang | c-if-else-statements | Conditional Branching: if, else if, else & switch-case | 1 | `core-c-leap-month-days` |
| c-lang | c-loops-for-while-do | Loops and Iteration: for, while & do-while | 2 | `c-002`, `core-c-collatz-trace-summary` |
| c-lang | c-pointer-arithmetic-arrays | Pointer Arithmetic & the Array–Pointer Relationship | 2 | `core-c-pointer-partition-parity`, `topic-c-pointer-arithmetic-arrays` |
| c-lang | c-pointers-basics | Pointers, Addresses & Dereferencing | 1 | `core-c-swap-min-max-pointers` |
| c-lang | c-preprocessor-macros | Preprocessor Deep Dive: Macros, Guards & Conditional Compilation | 1 | `topic-c-preprocessor-macros` |
| c-lang | c-recursion-basics | Recursion: Base Cases & the Call Stack | 2 | `core-c-recursive-hanoi-trace`, `topic-c-recursion-basics` |
| c-lang | c-standard-io | Standard Input and Output (printf, scanf, format specifiers) | 1 | `core-c-formatted-receipt` |
| c-lang | c-strings-stringh | Strings & the <string.h> Library | 2 | `core-c-char-array-rle`, `topic-c-strings-stringh` |
| c-lang | c-structures-unions | Structures (struct), Unions, and Memory Alignment | 1 | `core-c-struct-score-sort` |
| cpp | cpp-cin-cout-namespaces | Modern I/O Streams, Namespaces & std:: | 1 | `core-cpp-stream-score-summary` |
| cpp | cpp-classes-objects | Classes, Objects, Encapsulation & Constructors | 1 | `core-cpp-shopping-cart-class` |
| cpp | cpp-copy-move-semantics | Copy & Move Semantics: Rule of Three/Five/Zero | 2 | `core-cpp-deep-copy-int-array`, `topic-cpp-copy-move-semantics` |
| cpp | cpp-exception-handling | Exception Handling in C++: throw, try & catch | 2 | `core-cpp-safe-division-exceptions`, `topic-cpp-exception-handling` |
| cpp | cpp-file-streams | File Streams: Reading & Writing with fstream | 2 | `core-cpp-fstream-long-words`, `topic-cpp-file-streams` |
| cpp | cpp-functions-overloading | Functions: Overloading, Default Arguments & inline | 2 | `core-cpp-overloaded-area-commands`, `topic-cpp-functions-overloading` |
| cpp | cpp-inheritance-polymorphism | Inheritance and Virtual Polymorphism | 1 | `core-cpp-polymorphic-shape-areas` |
| cpp | cpp-lambdas-algorithms | Lambda Expressions & <algorithm> Essentials | 2 | `core-cpp-lambda-employee-rank`, `topic-cpp-lambdas-algorithms` |
| cpp | cpp-operator-overloading | Operator Overloading: +, ==, << and Friends | 2 | `core-cpp-fraction-operator-plus`, `topic-cpp-operator-overloading` |
| cpp | cpp-references-vs-pointers | References vs Pointers & Const References | 1 | `core-cpp-reference-clamp-batch` |
| cpp | cpp-smart-pointers | Smart Pointers: unique_ptr & shared_ptr Ownership | 2 | `core-cpp-shared-ptr-use-count`, `topic-cpp-smart-pointers` |
| cpp | cpp-std-string-deep | std::string in Depth: Search, Substrings & Conversion | 2 | `core-cpp-csv-field-inspector`, `topic-cpp-std-string-deep` |
| cpp | cpp-stl-containers | Standard Template Library (STL) Containers | 2 | `core-cpp-stl-topk-words`, `cpp-001` |
| cpp | cpp-templates-basics | Templates Basics: Generic Functions & Classes | 2 | `core-cpp-template-clamp-values`, `topic-cpp-templates-basics` |
| cpp | cpp-variables-auto-const | Variables, auto Type Deduction & const Correctness | 1 | `topic-cpp-variables-auto-const` |
| dsa | dsa-arrays-searching | Arrays as a Data Structure: Traversal & Searching | 2 | `core-dsa-two-sum-sorted-pointers`, `topic-dsa-arrays-searching` |
| dsa | dsa-big-o-notation | Asymptotic Analysis & Big-O Notation | 1 | `core-dsa-loop-operation-counts` |
| dsa | dsa-binary-search-tree | Binary Search Trees: Insert, Search, Delete | 2 | `core-dsa-bst-kth-and-range-sum`, `topic-dsa-binary-search-tree` |
| dsa | dsa-binary-trees-traversals | Binary Trees & Traversals | 1 | `topic-dsa-binary-trees-traversals` |
| dsa | dsa-dynamic-programming-intro | Dynamic Programming Introduction: Memoisation & Tabulation | 2 | `core-dsa-coin-change-min-coins`, `topic-dsa-dynamic-programming-intro` |
| dsa | dsa-graphs-bfs-dfs | Graphs: Representation, BFS & DFS | 1 | `topic-dsa-graphs-bfs-dfs` |
| dsa | dsa-hashing-basics | Hashing Basics: Hash Functions & Collision Handling | 2 | `core-dsa-hash-two-sum-first-pair`, `topic-dsa-hashing-basics` |
| dsa | dsa-linked-lists | Singly Linked Lists: Build, Traverse, Insert, Delete & Reverse | 2 | `core-dsa-linked-remove-duplicates-sorted`, `topic-dsa-linked-lists` |
| dsa | dsa-queues | Queues: FIFO Discipline & the Circular Buffer | 2 | `core-dsa-sliding-max-deque`, `topic-dsa-queues` |
| dsa | dsa-recursion-backtracking | Recursion & Backtracking Patterns | 2 | `core-dsa-subsets-with-target-sum`, `topic-dsa-recursion-backtracking` |
| dsa | dsa-sorting-basics | Sorting I: Bubble, Selection & Insertion Sort | 2 | `core-dsa-bubble-sort-swap-accounting`, `topic-dsa-sorting-basics` |
| dsa | dsa-sorting-divide-conquer | Sorting II: Merge Sort & Quick Sort thinking | 2 | `core-dsa-count-inversions-merge`, `topic-dsa-sorting-divide-conquer` |
| dsa | dsa-stacks | Stacks: LIFO Discipline & Applications | 2 | `core-dsa-rpn-stack-evaluator`, `topic-dsa-stacks` |
| dsa | dsa-strings-algorithms | String Algorithms: Frequency, Palindromes & Anagrams | 2 | `core-dsa-kmp-overlapping-occurrences`, `topic-dsa-strings-algorithms` |
| java | java-abstract-interfaces | Abstract Classes & Interfaces: Contracts and Capabilities | 2 | `core-java-payment-interface-fees`, `topic-java-abstract-interfaces` |
| java | java-architecture-types | JVM Architecture, Primitive vs Reference Types | 1 | `core-java-smallest-int-type` |
| java | java-arrays-varargs | Arrays in Java: 1-D, 2-D & the Arrays Utility | 2 | `core-java-rotate-matrix-clockwise`, `topic-java-arrays-varargs` |
| java | java-classes-objects | Classes & Objects: Fields, Constructors & Encapsulation | 2 | `core-java-inventory-item-class`, `topic-java-classes-objects` |
| java | java-collections-streams | Java Collections Framework and Streams API | 1 | `core-java-stream-department-average` |
| java | java-control-flow | Control Flow: if, switch & Loops | 2 | `core-java-grade-attendance-gate`, `topic-java-control-flow` |
| java | java-exception-handling | Exception Handling in Java: try, catch, finally & throws | 2 | `core-java-config-custom-exception`, `topic-java-exception-handling` |
| java | java-generics-basics | Generics Basics: Type Parameters, Bounded Types & Wildcards | 2 | `core-java-generic-stack-ops`, `topic-java-generics-basics` |
| java | java-inheritance-polymorphism | Inheritance & Polymorphism: extends, super and Overriding | 2 | `core-java-employee-weekly-pay`, `topic-java-inheritance-polymorphism` |
| java | java-methods-overloading-recursion | Methods, Overloading & Recursion in Java | 2 | `core-java-recursive-binary-search`, `topic-java-methods-overloading-recursion` |
| java | java-multithreading-basics | Multithreading Basics: Threads, join & Synchronization | 2 | `core-java-parallel-sum-threads`, `topic-java-multithreading-basics` |
| java | java-strings-stringbuilder | Strings, StringBuilder & Text Processing | 3 | `core-java-stringbuilder-slugify`, `java-001`, `topic-java-strings-stringbuilder` |
| java | java-variables-operators | Variables, Primitive Types & Operators in Java | 2 | `core-java-compound-interest`, `topic-java-variables-operators` |
| javascript | js-arrays-methods | Arrays & Essential Methods (map, filter, reduce) | 3 | `core-js-chunked-window-sums`, `js-001`, `topic-js-arrays-methods` |
| javascript | js-async-promises | Asynchronous JavaScript, Promises & async/await | 1 | `core-js-promise-pool-schedule` |
| javascript | js-browser-storage-json | Browser Storage & JSON: localStorage Patterns | 2 | `core-js-ttl-storage-simulation`, `topic-js-browser-storage-json` |
| javascript | js-classes-prototypes | Classes & Prototypes: constructor, extends, super | 2 | `core-js-private-cart-class`, `topic-js-classes-prototypes` |
| javascript | js-closures-scope | Closures & Lexical Scope | 2 | `core-js-memoized-square-cache`, `topic-js-closures-scope` |
| javascript | js-dom-basics | DOM Basics: Selecting & Manipulating Elements | 1 | `core-js-virtual-dom-query` |
| javascript | js-error-handling | Error Handling: try/catch, throw & Custom Errors | 2 | `core-js-parse-records-collect-errors`, `topic-js-error-handling` |
| javascript | js-events-delegation | Events & Event Delegation | 1 | `core-js-event-bubbling-chain` |
| javascript | js-fetch-async-data | Working with API Data: fetch, Response & JSON | 2 | `core-js-fetch-pagination-aggregate`, `topic-js-fetch-async-data` |
| javascript | js-functions-arrow-scope | Functions & Arrow Functions, Defaults and Rest Parameters | 2 | `core-js-function-pipeline`, `topic-js-functions-arrow-scope` |
| javascript | js-modules-pattern | Modules in JavaScript: export/import & Namespacing | 2 | `core-js-config-registry-module`, `topic-js-modules-pattern` |
| javascript | js-objects-destructuring | Objects, Destructuring, Spread & Rest | 2 | `core-js-deep-merge-settings`, `topic-js-objects-destructuring` |
| javascript | js-strings-template-literals | Strings & Template Literals | 2 | `core-js-mask-email-local`, `topic-js-strings-template-literals` |
| javascript | js-variables-scope-coercion | var, let, const, Scope & Type Coercion | 1 | `core-js-safe-numeric-tokens` |
| python | py-conditionals-loops | Control Flow, Comprehensions & Iteration | 2 | `core-py-tiered-shipping-fee`, `py-002` |
| python | py-decorators-closures | Closures & Decorators: Functions that Wrap Functions | 2 | `core-py-memoized-fib-states`, `topic-py-decorators-closures` |
| python | py-dicts-sets | Dictionaries & Sets: Key–Value and Unique Collections | 2 | `core-py-topk-word-frequency`, `topic-py-dicts-sets` |
| python | py-exception-handling | Exception Handling: try / except / else / finally | 1 | `topic-py-exception-handling` |
| python | py-file-handling | File Handling & Context Managers (with) | 1 | `topic-py-file-handling` |
| python | py-functions-scope | Functions in Depth: Arguments, Return Values & Scope | 2 | `core-py-closure-counter-ops`, `topic-py-functions-scope` |
| python | py-iterators-generators | Iterators & Generators: Lazy Sequences with yield | 2 | `core-py-sliding-window-maximum`, `topic-py-iterators-generators` |
| python | py-lists-tuples | Lists & Tuples: Ordered Collections | 1 | `topic-py-lists-tuples` |
| python | py-modules-imports | Modules & Imports: Organising and Reusing Code | 1 | `topic-py-modules-imports` |
| python | py-numpy-basics | NumPy: Fast Vectorized Numerical Computing | 1 | `core-py-numpy-row-means` |
| python | py-oop-classes | OOP in Python: Classes, Objects & Inheritance | 2 | `core-py-bank-account-ledger`, `topic-py-oop-classes` |
| python | py-operators-expressions | Operators & Expressions: Arithmetic, Comparison and Precedence | 1 | `topic-py-operators-expressions` |
| python | py-pandas-data-analysis | Pandas: DataFrames and Data Manipulation | 1 | `core-py-pandas-category-totals` |
| python | py-strings-in-depth | Strings in Depth: Slicing, Methods & f-strings | 3 | `core-py-run-length-codec`, `py-003`, `topic-py-strings-in-depth` |
| python | py-testing-basics | Testing Basics: assert, Test Functions & Edge Cases | 1 | `topic-py-testing-basics` |
| python | py-variables-datatypes | Variables, Dynamic Typing & Mutability | 2 | `core-py-mixed-token-ledger`, `py-001` |
| sql-databases | sql-case-conditional-aggregation | CASE Expressions & Conditional Aggregation | 2 | `core-sql-case-band-counts`, `topic-sql-case-conditional-aggregation` |
| sql-databases | sql-create-table-constraints | CREATE TABLE, Data Types & Constraints | 2 | `core-sql-create-products-constraints`, `topic-sql-create-table-constraints` |
| sql-databases | sql-crud-dml | Changing Data: INSERT, UPDATE & DELETE | 2 | `core-sql-crud-task-cleanup`, `topic-sql-crud-dml` |
| sql-databases | sql-ctes | Common Table Expressions (WITH / CTEs) | 2 | `core-sql-recursive-org-depth`, `topic-sql-ctes` |
| sql-databases | sql-filtering-like-patterns | Advanced Filtering: LIKE, IN, BETWEEN, DISTINCT & LIMIT | 2 | `core-sql-filter-pattern-range-distinct`, `topic-sql-filtering-like-patterns` |
| sql-databases | sql-indexes-explain | Indexes & Reading EXPLAIN Plans | 2 | `core-sql-composite-index-proof`, `topic-sql-indexes-explain` |
| sql-databases | sql-joins-aggregations | Multi-Table Relational JOINs & Aggregations | 1 | `core-sql-join-department-totals` |
| sql-databases | sql-normalization | Normalization: 1NF, 2NF & 3NF by Example | 2 | `core-sql-normalize-supplier-dimension`, `topic-sql-normalization` |
| sql-databases | sql-relational-model-keys | The Relational Model: Tables, Tuples & Keys | 2 | `core-sql-orphan-foreign-keys`, `topic-sql-relational-model-keys` |
| sql-databases | sql-select-filtering | SELECT, Column Aliasing, WHERE & Logical Filtering | 2 | `core-sql-page-three-results`, `sql-001` |
| sql-databases | sql-subqueries | Subqueries: Scalar, IN & EXISTS | 2 | `core-sql-above-department-average`, `topic-sql-subqueries` |
| sql-databases | sql-transactions-acid | Transactions & ACID: BEGIN, COMMIT, ROLLBACK | 2 | `core-sql-guarded-balance-transfer`, `topic-sql-transactions-acid` |
| sql-databases | sql-views | Views: Saved Queries as Virtual Tables | 2 | `core-sql-view-category-totals`, `topic-sql-views` |
| system-design | sd-caching-strategies | Caching: Strategies, Eviction & Invalidation | 5 | `core-sd-cache-aside-ttl-invalidate`, `core-sd-cache-stampede-singleflight`, `core-sd-cdn-edge-cache-regions`, `core-sd-lfu-cache-eviction`, `topic-sd-caching-strategies` |
| system-design | sd-databases-sharding-replication | Database Scaling: Replication, Sharding & SQL vs NoSQL | 5 | `core-sd-hash-shard-distribution`, `core-sd-quorum-availability-matrix`, `core-sd-rebalance-partitions-new-node`, `core-sd-replica-lag-stale-reads`, `topic-sd-databases-sharding-replication` |
| system-design | sd-load-balancing-scaling | Load-Balancing Algorithms & Consistent Hashing | 5 | `core-sd-health-check-failover-rr`, `core-sd-ip-hash-affinity`, `core-sd-least-connections-completions`, `core-sd-power-of-two-choices`, `topic-sd-load-balancing-scaling` |
| system-design | sd-queues-rate-limiting | Queues, Backpressure & Rate Limiting | 5 | `core-sd-bounded-queue-backpressure`, `core-sd-fixed-window-limiter`, `core-sd-priority-job-scheduler`, `core-sd-sliding-window-log-limiter`, `topic-sd-queues-rate-limiting` |
| system-design | sd-scaling-load-balancing | Horizontal vs Vertical Scaling & Load Balancers | 5 | `core-sd-autoscaler-rate-limits`, `core-sd-canary-hash-routing`, `core-sd-n-plus-one-redundancy`, `core-sd-scale-up-vs-out-cost`, `core-sd-smooth-weighted-round-robin` |

## 3. Generated corpus (kept separate)

Generated total: **17991**. Exam-eligible: **0**. Unassigned with null topic: **17991**. Practice-only: **17991**. Fewer than three tests: **4226**.

Current deterministic audit: **17991/17991 oracle_all_match**, **17991 sample_oracle_match**, valid exact topic/course mappings **0**, deterministic exam-ready **0**. Current stratified execution sample: **36/36 behaviorally consistent**; exam-ready after execution remains **0**. Oracle/sample agreement is not individual execution validation, taxonomy validity, semantic title quality, or exam eligibility.

| Generated family | Rows |
|---|---:|
| sliding-window-minmax | 12835 |
| sql-department-aggregate | 2791 |
| string-token-transform | 1117 |
| arithmetic-transform | 744 |
| matrix-border-interior-max | 186 |
| sql-phrase-token-transform | 186 |
| sum-stream | 110 |
| sql-sum-stream | 22 |

Domain alignment in the current reconstructed generated audit remains unresolved: mismatch 17859, not stated in title 132, valid exact mappings 0.

Repaired SQL phrases family: DB query found 186 rows, all generated/quarantined and 0 eligible. Dedicated execution evidence is **186/186 passed** in SQLite practice runner only; references were Accepted and starters Wrong Answer.

Legacy generator: the default command exits without ingestion. A disposable probe database verified that explicit opt-in creates only `generated`, unassigned, practice-only, ineligible rows with honest `Legacy Draft:` family titles and architecture metadata. The probe also found that runtime was initially serialized as a JSON object; `scripts/pipeline/build-question-bank.js` now writes the runtime string (`COURSE_RUNTIME[courseId]?.runtime`).

## 4. Integrity, duplicates, defaults

Original seed IDs preserved: **141/141**; missing: 0.
Canonical task-and-test duplicates (all preserved rows): **198 groups / 17892 rows**. Exact-statement duplicates: **22 groups / 110 rows**. Tested-pool canonical duplicates: **0 groups / 0 rows**.
Taxonomy: 10 courses, 129 topics (112 tested, 17 reviewed), invalid mapped 0, invalid unassigned 0.
Rolled-back default probe returned validation_status=generated, is_exam_eligible=false, mapping_status=unassigned, practice_only=true, generation_schema_version=1, topic_id=null.

## 5. Regression evidence

See the final release response for the exact command/exit table. Current evidence files include:

- `scripts/question-bank/final-question-bank-verification.json` — 200/200 fresh DB execution verification.
- `scripts/question-bank/generated-question-audit.json` — current deterministic + 36-row stratified generated audit.
- `scripts/question-bank/generated-question-audit-deterministic.json` — deterministic-only current audit.
- `scripts/question-bank/generated-question-audit-current.json` — copy of the current sampled generated audit.
- `scripts/question-bank/sql-string-contract-validation-report.json` — 186/186 SQLite phrases execution.
- `scripts/question-bank/topic-linked/validation-report.json` — 79/79.
- `scripts/question-bank/verified-core/validation-report.json` — 112/112.
- `scripts/question-bank/curated-starter-audit.json` — 9/9 ok.
- `scripts/question-bank/verified-core/approval-report.json` — separate 200-row approval gate.
- Focused Chromium browser audit for the 2026-10-20 security gate: **27/27**, including UI login with a disposable verified user, dashboard, course/topic/practice pages, all eight supported exam pages, both unsupported exam pages, library/profile/settings, student admin denial, certificate verification, cookie/local-storage checks, no login demo hints, and no unexpected console errors. The prior release's separate 31-check browser evidence remains a prior-run result, not a substitute for this rerun.

## 6. Remaining limitations

- The 17,991 generated rows remain unmapped and are not certificate evidence.
- Seventeen curriculum topics remain reviewed rather than execution-tested.
- HTML/CSS has no deterministic rendering grader; App Development has no Dart/Flutter sandbox runtime.
- SQL question execution uses the SQLite practice runner unless a separate PostgreSQL fixture test is explicitly identified.
- Live Resend mailbox delivery, production HTTPS/domain checks, credential rotation, managed PostgreSQL provisioning, and sandbox-capable production hosting still require deployment-environment verification.
- `npm audit --omit=dev --json` currently exits 1 with 4 production dependency vulnerabilities (2 low, 1 high, 1 critical); the suggested Next.js remediation is a major upgrade and was not attempted during this question-bank verification.
- The release ZIP contains source and seed/validation scripts, not a live PostgreSQL dump; deployment must run the documented database setup or restore its own database backup.
