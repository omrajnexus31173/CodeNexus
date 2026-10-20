'use strict';
/**
 * Curriculum expansion manifest — single source of truth for:
 *  - course unit definitions (new units + re-ordered/re-titled existing ones)
 *  - topic placements (unit + 1-based order inside the unit) for ALL topics,
 *    applied centrally in master-curriculum.js so lesson sequencing is
 *    coherent regardless of per-file source order hints.
 *
 * Unit `order_index` + topic `order_index` drive lesson navigation
 * (see src/app/api/topics/[topicId]/route.ts).
 */

const UNITS = [
  // course_id, id, title, order_index  (existing units keep ids; new ones appended ids)
  { course_id: 'c-lang', id: 'c-unit-1', title: 'Foundational Basics', order_index: 1 },
  { course_id: 'c-lang', id: 'c-unit-2', title: 'Operators and Flow Control', order_index: 2 },
  { course_id: 'c-lang', id: 'c-unit-3', title: 'Core Logic and Structures', order_index: 3 },
  { course_id: 'c-lang', id: 'c-unit-4', title: 'Memory and Custom Data Types', order_index: 4 },
  { course_id: 'c-lang', id: 'c-unit-5', title: 'Advanced and System Operations', order_index: 5 },

  { course_id: 'cpp', id: 'cpp-unit-1', title: 'Foundational Additions & Syntax', order_index: 1 },
  { course_id: 'cpp', id: 'cpp-unit-2', title: 'Object-Oriented Programming (OOP) Core', order_index: 2 },
  { course_id: 'cpp', id: 'cpp-unit-3', title: 'Standard Template Library (STL)', order_index: 3 },
  { course_id: 'cpp', id: 'cpp-unit-4', title: 'Modern C++: Smart Pointers, Exceptions & Files', order_index: 4 },

  { course_id: 'python', id: 'py-unit-1', title: 'Intro to Python Basics', order_index: 1 },
  { course_id: 'python', id: 'py-unit-3', title: 'Core Python Programming', order_index: 2 },
  { course_id: 'python', id: 'py-unit-2', title: 'NumPy & Pandas', order_index: 3 },

  { course_id: 'java', id: 'java-unit-1', title: 'Intro to Java Basics', order_index: 1 },
  { course_id: 'java', id: 'java-unit-3', title: 'Object-Oriented Java', order_index: 2 },
  { course_id: 'java', id: 'java-unit-2', title: 'Collections, Generics & Modern Streams', order_index: 3 },
  { course_id: 'java', id: 'java-unit-4', title: 'Concurrency Essentials', order_index: 4 },

  { course_id: 'javascript', id: 'js-unit-1', title: 'Core JavaScript & Asynchronous Architecture', order_index: 1 },
  { course_id: 'javascript', id: 'js-unit-2', title: 'Browser JavaScript: DOM, Events & Storage', order_index: 2 },

  { course_id: 'sql-databases', id: 'sql-unit-1', title: 'RDBMS Foundations & Queries', order_index: 1 },
  { course_id: 'sql-databases', id: 'sql-unit-2', title: 'Database Design, Indexes & Transactions', order_index: 2 },

  { course_id: 'dsa', id: 'dsa-unit-1', title: 'Complexity Analysis & Core Data Structures', order_index: 1 },
  { course_id: 'dsa', id: 'dsa-unit-2', title: 'Linear Structures, Hashing & Sorting', order_index: 2 },
  { course_id: 'dsa', id: 'dsa-unit-3', title: 'Trees, Graphs & Dynamic Programming', order_index: 3 },

  { course_id: 'html-css', id: 'html-unit-2', title: 'HTML Foundations & Accessibility', order_index: 1 },
  { course_id: 'html-css', id: 'html-unit-1', title: 'CSS Foundations & Modern Layouts', order_index: 2 },
  { course_id: 'html-css', id: 'html-unit-3', title: 'Responsive Design, Motion & Project', order_index: 3 },

  { course_id: 'app-dev', id: 'app-unit-1', title: 'Flutter & Mobile App Development', order_index: 1 },

  { course_id: 'system-design', id: 'sd-unit-1', title: 'Scalability & Reliability Architecture', order_index: 1 },
];

// Ordered topic ids per unit. Order in array = lesson order (1-based).
const UNIT_TOPICS = {
  'c-unit-1': [
    'c-history-and-origin', 'c-structure-of-a-program', 'c-compilation-process',
    'c-keywords-identifiers', 'c-constants-literals', 'c-datatypes-modifiers',
    'c-standard-io', 'c-escape-sequences', 'c-arithmetic-relational-ops',
    'c-logical-assignment-ops',
  ],
  'c-unit-2': [
    'c-functions-basics', 'c-if-else-statements', 'c-loops-for-while-do',
    'c-bitwise-operators',
  ],
  'c-unit-3': [
    'c-arrays-1d', 'c-pointers-basics', 'c-pointer-arithmetic-arrays',
    'c-strings-stringh', 'c-structures-unions', 'c-recursion-basics',
  ],
  'c-unit-4': ['c-enums-typedef', 'c-dynamic-memory-allocation'],
  'c-unit-5': ['c-file-operations', 'c-preprocessor-macros', 'c-command-line-args'],

  'cpp-unit-1': [
    'cpp-cin-cout-namespaces', 'cpp-variables-auto-const', 'cpp-references-vs-pointers',
    'cpp-functions-overloading', 'cpp-std-string-deep',
  ],
  'cpp-unit-2': [
    'cpp-classes-objects', 'cpp-operator-overloading',
    'cpp-inheritance-polymorphism', 'cpp-copy-move-semantics',
  ],
  'cpp-unit-3': ['cpp-stl-containers', 'cpp-lambdas-algorithms', 'cpp-templates-basics'],
  'cpp-unit-4': ['cpp-smart-pointers', 'cpp-exception-handling', 'cpp-file-streams'],

  'py-unit-1': [
    'py-variables-datatypes', 'py-operators-expressions', 'py-conditionals-loops',
    'py-strings-in-depth', 'py-lists-tuples', 'py-dicts-sets',
  ],
  'py-unit-3': [
    'py-functions-scope', 'py-exception-handling', 'py-file-handling',
    'py-modules-imports', 'py-oop-classes', 'py-iterators-generators',
    'py-decorators-closures', 'py-testing-basics',
  ],
  'py-unit-2': ['py-numpy-basics', 'py-pandas-data-analysis'],

  'java-unit-1': [
    'java-architecture-types', 'java-variables-operators', 'java-control-flow',
    'java-methods-overloading-recursion', 'java-arrays-varargs',
    'java-strings-stringbuilder',
  ],
  'java-unit-3': [
    'java-classes-objects', 'java-inheritance-polymorphism',
    'java-abstract-interfaces', 'java-exception-handling',
  ],
  'java-unit-2': ['java-collections-streams', 'java-generics-basics'],
  'java-unit-4': ['java-multithreading-basics'],

  'js-unit-1': [
    'js-variables-scope-coercion', 'js-strings-template-literals', 'js-arrays-methods',
    'js-objects-destructuring', 'js-functions-arrow-scope', 'js-closures-scope',
    'js-classes-prototypes', 'js-error-handling', 'js-modules-pattern',
    'js-async-promises', 'js-fetch-async-data',
  ],
  'js-unit-2': ['js-dom-basics', 'js-events-delegation', 'js-browser-storage-json'],

  'sql-unit-1': [
    'sql-relational-model-keys', 'sql-create-table-constraints', 'sql-select-filtering',
    'sql-crud-dml', 'sql-filtering-like-patterns', 'sql-joins-aggregations',
    'sql-case-conditional-aggregation', 'sql-subqueries', 'sql-ctes', 'sql-views',
  ],
  'sql-unit-2': ['sql-normalization', 'sql-indexes-explain', 'sql-transactions-acid'],

  'dsa-unit-1': [
    'dsa-big-o-notation', 'dsa-arrays-searching', 'dsa-strings-algorithms',
    'dsa-recursion-backtracking',
  ],
  'dsa-unit-2': [
    'dsa-linked-lists', 'dsa-stacks', 'dsa-queues', 'dsa-hashing-basics',
    'dsa-sorting-basics', 'dsa-sorting-divide-conquer',
  ],
  'dsa-unit-3': [
    'dsa-binary-trees-traversals', 'dsa-binary-search-tree', 'dsa-graphs-bfs-dfs',
    'dsa-dynamic-programming-intro',
  ],

  'html-unit-2': [
    'html-document-structure-semantic', 'html-text-links-media',
    'html-forms-inputs', 'html-accessibility-basics',
  ],
  'html-unit-1': [
    'css-selectors-cascade', 'css-box-model-positioning',
    'css-colors-units-typography', 'css-flexbox-grid',
  ],
  'html-unit-3': [
    'css-responsive-media-queries', 'css-transitions-animations',
    'html-css-landing-project',
  ],

  'app-unit-1': [
    'flutter-widgets-lifecycle', 'app-state-navigation', 'app-data-networking-storage',
  ],

  'sd-unit-1': [
    'sd-scaling-load-balancing', 'sd-caching-strategies', 'sd-load-balancing-scaling',
    'sd-queues-rate-limiting', 'sd-databases-sharding-replication',
  ],
};

const topicPlacements = {};
for (const [unitId, topicIds] of Object.entries(UNIT_TOPICS)) {
  topicIds.forEach((topicId, i) => {
    if (topicPlacements[topicId]) {
      throw new Error(`Duplicate topic placement for ${topicId}`);
    }
    topicPlacements[topicId] = { unit_id: unitId, order_index: i + 1 };
  });
}

module.exports = { UNITS, UNIT_TOPICS, topicPlacements };
