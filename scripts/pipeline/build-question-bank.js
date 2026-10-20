/**
 * Code Nexus — Legacy generated-question ingestion pipeline
 *
 * IMPORTANT QUALITY LIMITATION:
 * This legacy generator creates UNVERIFIED practice drafts. The historical
 * 16-per-language title labels are retained only to explain the preserved
 * legacy data; they are no longer used in new titles/tags because the
 * statements collapse to only five actual task families and many labels did
 * not describe the task. Newly generated rows are always inserted with
 * validation_status='generated', topic_id=NULL and is_exam_eligible=false.
 * They must pass scripts/audit-generated-questions.js and a separate
 * topic/concept review before any promotion.
 *
 * The ingestion path is disabled unless both --allow-legacy-drafts and
 * ALLOW_LEGACY_QUESTION_DRAFTS=1 are supplied. Prefer the schema-v2
 * verified-core authoring workflow for new questions.
 *
 * The generator never marks any question as tested. Generation is not
 * validation.
 */

const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { requireDatabaseUrl } = require('../lib/database-url');
const { buildGeneratedReference } = require('../question-bank/generated-reference-templates');
const {
  TAXONOMY_VERSION,
  COURSE_RUNTIME,
  difficultyRationale,
} = require('../question-bank/taxonomy');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required; this pipeline has no credential fallback.');
}

const pool = new Pool({ connectionString: requireDatabaseUrl() });
const ALLOW_LEGACY_DRAFTS =
  process.argv.includes('--allow-legacy-drafts') &&
  process.env.ALLOW_LEGACY_QUESTION_DRAFTS === '1';

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

function taskTypeForFamily(family) {
  return family === 'sql-department-aggregate'
    ? 'sql-aggregate-query'
    : family === 'sliding-window-minmax'
      ? 'stdin-algorithm'
      : 'stdin-transform';
}

function difficultyReasonForFamily(family) {
  switch (family) {
    case 'arithmetic-transform':
      return 'A single linear pass applies one arithmetic transformation and accumulation.';
    case 'string-token-transform':
      return 'One token scan combines character classification with selective word reversal.';
    case 'matrix-border-interior-max':
      return 'A direct grid scan separates border cells from interior cells.';
    case 'sql-department-aggregate':
      return 'Grouping, HAVING thresholds and aggregate ordering must be combined.';
    case 'sliding-window-minmax':
      return 'The optimal solution must maintain window bounds and current minimum/maximum state.';
    default:
      return 'Difficulty is provisional because this legacy draft has not been concept reviewed.';
  }
}

// Historical labels retained only for reproducibility of the preserved legacy
// cohort. They no longer determine new titles or tags.
const DOMAINS = {
  python: [
    { name: 'Arithmetic & Number Theory', tags: ['math', 'numbers'] },
    { name: 'String Processing & Parsing', tags: ['strings', 'parsing'] },
    { name: 'Lists, Arrays & Slices', tags: ['arrays', 'lists'] },
    { name: 'Dictionaries & Hash Maps', tags: ['hashmap', 'lookup'] },
    { name: 'Sets & Combinatorics', tags: ['sets', 'combinations'] },
    { name: 'Recursion & Divide and Conquer', tags: ['recursion', 'divide-conquer'] },
    { name: 'Matrices & 2D Grid Traversals', tags: ['matrix', 'grid'] },
    { name: 'Stack, Queue & Deque Mechanics', tags: ['stacks', 'queues'] },
    { name: 'Sorting & Custom Comparators', tags: ['sorting', 'algorithms'] },
    { name: 'Binary Search & Monotonic Space', tags: ['binary-search', 'search'] },
    { name: 'Vector Math & NumPy Simulation', tags: ['math', 'vectors'] },
    { name: 'Statistics & Moving Windows', tags: ['sliding-window', 'stats'] },
    { name: 'Graph Foundations & Paths', tags: ['graphs', 'bfs-dfs'] },
    { name: 'Dynamic Programming Patterns', tags: ['dp', 'optimization'] },
    { name: 'Bitwise Logic & Masks', tags: ['bitwise', 'binary'] },
    { name: 'Simulation & State Machines', tags: ['simulation', 'state'] }
  ],
  c: [
    { name: 'Primitive Types & Overflows', tags: ['types', 'memory'] },
    { name: 'Pointers & Pointer Arithmetic', tags: ['pointers', 'memory'] },
    { name: 'Dynamic Memory & Buffers', tags: ['malloc', 'buffers'] },
    { name: 'Bitwise Operators & Bitflags', tags: ['bitwise', 'low-level'] },
    { name: 'Structs, Padding & Unions', tags: ['structs', 'layout'] },
    { name: 'String Manipulation & Pointers', tags: ['strings', 'pointers'] },
    { name: 'Array Indexing & Offsets', tags: ['arrays', 'memory'] },
    { name: 'Linked List Pointers', tags: ['linked-list', 'data-structures'] },
    { name: 'Stack & Ring Buffers in C', tags: ['stacks', 'buffers'] },
    { name: 'Standard I/O & Formatted Parsing', tags: ['io', 'parsing'] },
    { name: 'Sorting & Custom qsort Comparators', tags: ['sorting', 'pointers'] },
    { name: 'Binary Search & Pointer Bounds', tags: ['binary-search', 'arrays'] },
    { name: 'Recursion & Stack Frames', tags: ['recursion', 'stack'] },
    { name: 'Simple Hash Tables in C', tags: ['hashing', 'arrays'] },
    { name: 'Binary Trees with Pointers', tags: ['trees', 'pointers'] },
    { name: 'Bit Packing & Encodings', tags: ['bitwise', 'encoding'] }
  ],
  cpp: [
    { name: 'Classes, OOP & Encapsulation', tags: ['oop', 'classes'] },
    { name: 'Inheritance & Virtual Functions', tags: ['polymorphism', 'inheritance'] },
    { name: 'Function & Class Templates', tags: ['templates', 'generics'] },
    { name: 'STL Sequential Containers (vector, deque)', tags: ['stl', 'vector'] },
    { name: 'STL Associative Containers (set, map)', tags: ['stl', 'map'] },
    { name: 'STL Unordered Hash Maps & Sets', tags: ['stl', 'unordered-map'] },
    { name: 'STL Algorithms & Iterators', tags: ['stl', 'algorithms'] },
    { name: 'Lambda Expressions & Closures', tags: ['lambdas', 'functional'] },
    { name: 'Smart Pointers & RAII Patterns', tags: ['raii', 'smart-pointers'] },
    { name: 'String Streams & Formatted Parsing', tags: ['strings', 'stringstream'] },
    { name: 'Two-Pointer Algorithms in C++', tags: ['two-pointer', 'arrays'] },
    { name: 'Sliding Window & Substrings', tags: ['sliding-window', 'strings'] },
    { name: 'Graph Adjacency Lists & Dijkstra', tags: ['graphs', 'priority-queue'] },
    { name: 'Dynamic Programming with STL', tags: ['dp', 'vectors'] },
    { name: 'Bitset & Fast Exponentiation', tags: ['math', 'bitset'] },
    { name: 'Custom Heaps & Priority Queues', tags: ['heap', 'priority-queue'] }
  ],
  java: [
    { name: 'Object-Oriented Abstractions', tags: ['oop', 'classes'] },
    { name: 'Interfaces & Polymorphic Dispatch', tags: ['interfaces', 'polymorphism'] },
    { name: 'Exception Hierarchies & Safety', tags: ['exceptions', 'robustness'] },
    { name: 'Collections Framework - ArrayList & Lists', tags: ['collections', 'lists'] },
    { name: 'Collections Framework - HashMaps & Sets', tags: ['collections', 'hashmap'] },
    { name: 'Streams API - Filter, Map & Reduce', tags: ['streams', 'functional'] },
    { name: 'Generics & Type Parameters', tags: ['generics', 'types'] },
    { name: 'StringBuilder & String Parsing', tags: ['strings', 'stringbuilder'] },
    { name: 'Classic Two-Pointer Problems in Java', tags: ['two-pointer', 'arrays'] },
    { name: 'Stack & Queue Data Structures', tags: ['stacks', 'queues'] },
    { name: 'PriorityQueue & K-th Element Sorting', tags: ['priority-queue', 'heaps'] },
    { name: 'Binary Trees & BFS/DFS in Java', tags: ['trees', 'traversal'] },
    { name: 'Comparable & Custom Comparators', tags: ['sorting', 'comparators'] },
    { name: 'Recursion & Backtracking in Java', tags: ['recursion', 'backtracking'] },
    { name: 'Number Manipulation & BigInteger', tags: ['math', 'numbers'] },
    { name: 'Sliding Window Frequency Maps', tags: ['sliding-window', 'hashmap'] }
  ],
  javascript: [
    { name: 'Closures & Scoping Mechanics', tags: ['closures', 'scope'] },
    { name: 'Higher-Order Functions (map, filter, reduce)', tags: ['functional', 'arrays'] },
    { name: 'Object Destructuring & Prototypes', tags: ['objects', 'prototypes'] },
    { name: 'Promises & Asynchronous Pipelines', tags: ['async', 'promises'] },
    { name: 'Set & Map Unique Collections', tags: ['collections', 'map-set'] },
    { name: 'Regular Expressions & Pattern Matching', tags: ['regex', 'strings'] },
    { name: 'Deep Object Transformations', tags: ['objects', 'recursion'] },
    { name: 'Currying & Function Composition', tags: ['functional', 'currying'] },
    { name: 'Event Loop & Debounce Simulation', tags: ['async', 'timing'] },
    { name: 'Two-Pointer Algorithms in JS', tags: ['two-pointer', 'arrays'] },
    { name: 'Sliding Window Techniques', tags: ['sliding-window', 'strings'] },
    { name: 'Stack & Queue Implementation with Arrays', tags: ['stacks', 'queues'] },
    { name: 'Tree Traversals with JS Objects', tags: ['trees', 'recursion'] },
    { name: 'Custom Sorting & Sorting Comparators', tags: ['sorting', 'arrays'] },
    { name: 'Math & Bitwise Transformations', tags: ['math', 'bitwise'] },
    { name: 'JSON Schema Parsing & Manipulation', tags: ['json', 'parsing'] }
  ],
  sql: [
    { name: 'SELECT Projections & Aliasing', tags: ['select', 'basics'] },
    { name: 'WHERE Filtering & Logical Operators', tags: ['where', 'filtering'] },
    { name: 'Aggregate Functions & Calculations', tags: ['aggregates', 'math'] },
    { name: 'GROUP BY & HAVING Conditions', tags: ['group-by', 'having'] },
    { name: 'INNER JOIN Multi-Table Queries', tags: ['joins', 'inner-join'] },
    { name: 'LEFT & RIGHT OUTER JOINs', tags: ['joins', 'outer-join'] },
    { name: 'Subqueries & IN Conditions', tags: ['subqueries', 'nested'] },
    { name: 'Correlated Subqueries & Exists', tags: ['correlated', 'exists'] },
    { name: 'Conditional Logic with CASE WHEN', tags: ['case-when', 'logic'] },
    { name: 'Window Functions - Ranking (ROW_NUMBER)', tags: ['window-functions', 'ranking'] },
    { name: 'Window Functions - Cumulative Totals', tags: ['window-functions', 'aggregates'] },
    { name: 'Common Table Expressions (WITH CTE)', tags: ['cte', 'subqueries'] },
    { name: 'String Functions & Concatenations', tags: ['strings', 'functions'] },
    { name: 'Date & Time Timestamp Calculations', tags: ['dates', 'datetime'] },
    { name: 'DISTINCT Counts & Deduplication', tags: ['distinct', 'sets'] },
    { name: 'Set Operations (UNION, INTERSECT)', tags: ['set-operations', 'union'] }
  ]
};

// Course mappings — must match real courses.id values so every question
// is connected to its actual learning track (see scripts/seed-courses.js).
const COURSE_MAP = {
  python: 'python',
  c: 'c-lang',
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript',
  sql: 'sql-databases'
};

/**
 * Builds starter code for a specific language
 */
function buildStarterCode(lang, funcName, paramDesc) {
  switch (lang) {
    case 'python':
      return {
        python: `import sys

def ${funcName}():
    lines = sys.stdin.read().strip().split()
    if not lines:
        return
    # Process inputs: ${paramDesc}
    # Write your solution below
    pass

if __name__ == '__main__':
    ${funcName}()`
      };
    case 'c':
      return {
        c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Process input: ${paramDesc}
    // Write your solution below
    return 0;
}`
      };
    case 'cpp':
      return {
        cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Process input: ${paramDesc}
    // Write your solution below
    return 0;
}`
      };
    case 'java':
      return {
        java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Process input: ${paramDesc}
        // Write your solution below
    }
}`
      };
    case 'javascript':
      return {
        javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    // Process input: ${paramDesc}
    // Write your solution below
}

solve();`
      };
    case 'sql':
      return {
        sql: `-- employees(id, department_id, salary, is_active)
-- Return department_id, employee_count and rounded avg_salary.
SELECT department_id
FROM employees
WHERE is_active = 1;`
      };
    default:
      return { [lang]: `// Code template for ${lang}` };
  }
}

/**
 * Builds an executable reference for one of the generator's actual task
 * families. English solution summaries are never inserted as code.
 */
function buildReferenceSolution(lang, family, referenceParams, sqlReference) {
  if (lang === 'sql') return sqlReference;
  const reference = buildGeneratedReference(lang, family, referenceParams);
  if (!reference) throw new Error(`No generated reference template for ${lang}/${family}`);
  return reference;
}

function stringTaskOutput(input, countVowels, threshold) {
  const words = String(input).trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const ch of words.join(' ')) {
    if (!/[A-Za-z]/.test(ch)) continue;
    const vowel = 'aeiouAEIOU'.includes(ch);
    if ((countVowels && vowel) || (!countVowels && !vowel)) count++;
  }
  return `${count}\n${words.map((w) => (w.length > threshold ? w.split('').reverse().join('') : w)).join(' ')}`;
}

function slidingWindowOutput(values, limit) {
  let best = 0;
  for (let left = 0; left < values.length; left++) {
    let min = Infinity;
    let max = -Infinity;
    for (let right = left; right < values.length; right++) {
      min = Math.min(min, values[right]);
      max = Math.max(max, values[right]);
      if (max - min > limit) break;
      best = Math.max(best, right - left + 1);
    }
  }
  return String(best);
}

/**
 * Procedurally generates a challenge specification given index and domain
 */
function generateQuestionSpec(lang, globalIdx, domainObj) {
  const pad = String(globalIdx).padStart(4, '0');
  const id = `${lang}-bank-${pad}`;
  const domain = domainObj.name;
  // Difficulty is assigned from the actual generated task family below, not
  // from the row index. It is provisional because the row remains generated.
  let difficulty = 'Easy';

  let title = '';
  let statement = '';
  let inputFormat = '';
  let outputFormat = '';
  let constraints = '';
  let testCases = [];
  let sampleInput = '';
  let sampleOutput = '';
  let paramDesc = '';
  let family = '';
  let referenceParams = {};
  let sqlReference = '';
  let explanation = '';
  let hint1 = '';
  let hint2 = '';

  const variant = globalIdx % 20;

  // Domain-specific variation generators
  if (domain.includes('Arithmetic') || domain.includes('Primitive') || domain.includes('Number')) {
    family = 'arithmetic-transform';
    difficulty = 'Easy';
    title = `Legacy Draft: Linear Transform Accumulator [${id}]`;
    const multiplier = (globalIdx % 17) + 2;
    const offset = (globalIdx % 31) + 1;
    statement = `[Challenge ${id}] Given a sequence of integers from standard input, calculate the accumulated transformation where each value x is transformed into (x * ${multiplier} + ${offset}), and output the total modulo 1000000007.`;
    inputFormat = `An integer N followed by N space-separated integers.`;
    outputFormat = `A single integer representing the final transformed sum modulo 1000000007.`;
    constraints = `1 <= N <= 10^5, -10^9 <= x <= 10^9`;
    paramDesc = `N count followed by N integers`;

    const sampleN = 3;
    const s1 = 4;
    const s2 = 10;
    const s3 = 2;
    const ans1 = (((s1 * multiplier + offset) + (s2 * multiplier + offset) + (s3 * multiplier + offset)) % 1000000007);
    sampleInput = `${sampleN}\n${s1} ${s2} ${s3}`;
    sampleOutput = String(ans1);

    testCases = [
      { input: `${sampleN}\n${s1} ${s2} ${s3}`, expected_output: String(ans1), is_hidden: false },
      { input: `2\n1 1`, expected_output: String(((1 * multiplier + offset) * 2) % 1000000007), is_hidden: true },
      { input: `4\n0 5 10 15`, expected_output: String(((0 * multiplier + offset) + (5 * multiplier + offset) + (10 * multiplier + offset) + (15 * multiplier + offset)) % 1000000007), is_hidden: true }
    ];

    referenceParams = { multiplier, offset };
    explanation = `Iterate over the array of integers, applying linear scaling with multiplier ${multiplier} and offset ${offset}, taking modulo at each addition step to prevent integer overflow.`;
    hint1 = `Read the count N first, then use a running sum variable.`;
    hint2 = `Ensure 64-bit integer types are used during multiplication to prevent intermediate 32-bit overflow before modulo.`;
  } else if (lang !== 'sql' && (domain.includes('String') || domain.includes('Regex') || domain.includes('Parsing'))) {
    family = 'string-token-transform';
    difficulty = 'Easy';
    title = `Legacy Draft: Character Count and Selective Word Reversal [${id}]`;
    const vowelRule = variant % 2 === 0 ? 'vowels' : 'consonants';
    const wordThreshold = (variant % 4) + 3;
    statement = `[Challenge ${id}] Given an input string for stream processing, compute the count of ${vowelRule} and reverse every word whose length exceeds ${wordThreshold} characters. Print the count followed by the modified string.`;
    inputFormat = `A single line containing space-separated words.`;
    outputFormat = `First line: the count of ${vowelRule}. Second line: the modified string with selective word reversals.`;
    constraints = `String length up to 10^4 characters. ASCII letters and spaces only.`;
    paramDesc = `Single line containing space-separated tokens`;

    const countVowels = vowelRule === 'vowels';
    sampleInput = `code nexus software platform`;
    sampleOutput = stringTaskOutput(sampleInput, countVowels, wordThreshold);
    testCases = [
      { input: `code nexus`, expected_output: stringTaskOutput(`code nexus`, countVowels, wordThreshold), is_hidden: false },
      { input: `hello world test`, expected_output: stringTaskOutput(`hello world test`, countVowels, wordThreshold), is_hidden: true }
    ];
    referenceParams = { countVowels, threshold: wordThreshold };
    explanation = `Split the input by whitespace, inspect character classifications, and selectively reverse words exceeding the target length limit.`;
    hint1 = `Use standard library string splitting or scanning functions.`;
    hint2 = `Two-pointer swap makes in-place word reversal O(length) with O(1) extra space.`;
  } else if (domain.includes('Matrix') || domain.includes('Grid') || domain.includes('2D')) {
    family = 'matrix-border-interior-max';
    difficulty = 'Easy';
    title = `Legacy Draft: Matrix Border Sum and Interior Maximum [${id}]`;
    statement = `[Challenge ${id}] Given an N x M matrix of integers, calculate the sum of elements along the primary perimeter border, and find the maximum element strictly located inside the inner submatrix.`;
    inputFormat = `Two integers N and M followed by N lines of M integers each.`;
    outputFormat = `Two space-separated integers: perimeter sum and inner maximum.`;
    constraints = `3 <= N, M <= 500, -10^6 <= matrix[i][j] <= 10^6`;
    paramDesc = `N rows, M cols, followed by N*M integers`;

    sampleInput = `3 3\n1 2 3\n4 9 5\n6 7 8`;
    sampleOutput = `36 9`;
    testCases = [
      { input: `3 3\n1 2 3\n4 9 5\n6 7 8`, expected_output: `36 9`, is_hidden: false },
      { input: `3 4\n1 1 1 1\n1 5 6 1\n1 1 1 1`, expected_output: `10 6`, is_hidden: true }
    ];
    referenceParams = {};
    explanation = `Loop through the 2D grid: if cell is on boundary (first/last row or column), add to border sum; otherwise update the interior maximum tracker.`;
    hint1 = `Boundary elements satisfy: row == 0 or row == N-1 or col == 0 or col == M-1.`;
    hint2 = `Initialize inner max with negative infinity or the first non-boundary element found.`;
  } else if (domain.includes('SQL') || lang === 'sql') {
    family = 'sql-department-aggregate';
    difficulty = 'Medium';
    title = `Legacy Draft: Department Salary Aggregation [${id}]`;
    const threshold = ((globalIdx * 13) % 500) + 50;
    statement = `[Challenge ${id}] Write an optimized SQL query to retrieve all departments with more than 3 active employees whose average salary exceeds $${threshold}. Return department_id, employee_count, and rounded average_salary sorted by average_salary descending.`;
    inputFormat = `Employees table schema (id INT, department_id INT, name VARCHAR, salary NUMERIC, is_active BOOLEAN).`;
    outputFormat = `Columns: department_id, employee_count, avg_salary.`;
    constraints = `Standard SQL syntax compatible with PostgreSQL and SQLite.`;
    paramDesc = `Table schema predefined in test runner`;

    sqlReference = `SELECT department_id, COUNT(*) as employee_count, ROUND(AVG(salary)) as avg_salary FROM employees WHERE is_active = 1 GROUP BY department_id HAVING COUNT(*) > 3 AND AVG(salary) > ${threshold} ORDER BY avg_salary DESC;`;
    sampleInput = `DROP TABLE IF EXISTS employees;\nCREATE TABLE employees (id INT, department_id INT, salary NUMERIC, is_active INT);\nINSERT INTO employees VALUES (1, 10, 800, 1), (2, 10, 900, 1), (3, 10, 850, 1), (4, 10, 750, 1);`;
    sampleOutput = `10|4|825.0`;
    testCases = [
      {
        input: sampleInput,
        expected_output: `10|4|825.0`,
        is_hidden: false
      },
      {
        input: `DROP TABLE IF EXISTS employees;\nCREATE TABLE employees (id INT, department_id INT, salary NUMERIC, is_active INT);\nINSERT INTO employees VALUES (1, 20, 1200, 1), (2, 20, 1300, 1), (3, 20, 1400, 1), (4, 20, 1500, 1), (5, 30, 400, 1);`,
        expected_output: `20|4|1350.0`,
        is_hidden: true
      }
    ];
    referenceParams = { threshold };
    explanation = `Use GROUP BY on department_id, filter rows with WHERE is_active = 1, apply aggregate filtering with HAVING COUNT(*) > 3 AND AVG(salary) > ${threshold}, and order descending by the aggregated average.`;
    hint1 = `Filter non-aggregate criteria (is_active) in WHERE, and group criteria (COUNT > 3) in HAVING.`;
    hint2 = `Use ROUND(AVG(salary)) for average representation.`;
  } else {
    // General Algorithmic and Data Structure Template
    family = 'sliding-window-minmax';
    difficulty = 'Medium';
    title = `Legacy Draft: Longest Bounded-Range Subarray [${id}]`;
    const targetK = (globalIdx % 9) + 1;
    statement = `[Challenge ${id}] Given an array of N integers, find the length of the longest contiguous subsegment where the difference between the maximum and minimum elements does not exceed ${targetK}.`;
    inputFormat = `First line: integer N. Second line: N space-separated integers.`;
    outputFormat = `A single integer representing the maximum valid subarray length.`;
    constraints = `1 <= N <= 10^5, -10^6 <= array[i] <= 10^6, K = ${targetK}`;
    paramDesc = `N followed by array elements`;

    sampleInput = `6\n1 3 2 4 1 2`;
    sampleOutput = slidingWindowOutput([1, 3, 2, 4, 1, 2], targetK);
    testCases = [
      { input: sampleInput, expected_output: sampleOutput, is_hidden: false },
      { input: `5\n10 10 10 10 10`, expected_output: slidingWindowOutput([10, 10, 10, 10, 10], targetK), is_hidden: true },
      { input: `4\n1 10 2 20`, expected_output: slidingWindowOutput([1, 10, 2, 20], targetK), is_hidden: true }
    ];
    referenceParams = { limit: targetK };
    explanation = `Maintain a sliding window [L, R] using two deques to track the minimum and maximum within the current window in amortized O(1) per step. Advance R and shrink L whenever max - min > K.`;
    hint1 = `A naive nested loop takes O(N^2) time. Think about a two-pointer sliding window.`;
    hint2 = `Monotonic queues or balanced BST can maintain min/max in the current window efficiently.`;
  }

  const funcName = `solve_${lang}_${globalIdx}`;
  const starterCode = buildStarterCode(lang, funcName, paramDesc);
  const referenceSol = buildReferenceSolution(lang, family, referenceParams, sqlReference);
  const tagList = ['legacy-generated', family, difficulty.toLowerCase(), `${lang}-bank`, 'generated-unverified', 'unmapped-topic'];
  const courseId = COURSE_MAP[lang] || lang;
  const duplicateSignature = sha256(`${canonicalize(statement)}|${JSON.stringify(testCases)}`);

  return {
    id,
    language: lang,
    course_id: COURSE_MAP[lang] || lang,
    // Do not fabricate a curriculum topic. A later review must assign a real
    // course_topics.id only when the task genuinely tests that topic.
    topic_id: null,
    difficulty,
    title,
    statement,
    input_format: inputFormat,
    output_format: outputFormat,
    constraints,
    sample_input: sampleInput,
    sample_output: sampleOutput,
    starter_code: starterCode,
    reference_solution: referenceSol,
    solution_explanation: explanation,
    hint_1: hint1,
    hint_2: hint2,
    test_cases: testCases,
    expected_time_complexity: family === 'sql-department-aggregate' ? 'O(N)' : 'O(N)',
    expected_space_complexity: family === 'sliding-window-minmax' ? 'O(N)' : 'O(N)',
    tags: tagList,
    // Generated rows are quarantined from graded exams until independently
    // execution-tested and topic/concept reviewed.
    is_exam_eligible: false,
    validation_status: 'generated',
    task_type: taskTypeForFamily(family),
    runtime: COURSE_RUNTIME[courseId]?.runtime || lang,
    input_contract: {
      version: 1,
      kind: lang === 'sql' ? 'sql-fixture-statements' : 'stdin-text',
      description: inputFormat,
    },
    mapping_status: 'unassigned',
    practice_only: true,
    duplicate_signature: duplicateSignature,
    difficulty_rationale: difficultyRationale(difficulty, difficultyReasonForFamily(family)),
    validation_evidence: {
      source: 'legacy-generator',
      execution_validated: false,
      concept_reviewed: false,
      exam_ready: false,
      reasons: ['unassigned curriculum topic', 'duplicate/title-domain review unresolved'],
    },
    generation_schema_version: 1,
    taxonomy_version: TAXONOMY_VERSION,
  };
}

async function runPipeline() {
  if (!ALLOW_LEGACY_DRAFTS) {
    console.log('Legacy question ingestion is disabled. New questions should use the schema-v2 verified-core workflow.');
    console.log('To create quarantined legacy drafts intentionally, rerun with --allow-legacy-drafts and ALLOW_LEGACY_QUESTION_DRAFTS=1.');
    await pool.end();
    return;
  }
  console.log('======================================================================');
  console.log('     CODE NEXUS QUESTION BANK GENERATION & INGESTION PIPELINE         ');
  console.log('======================================================================\n');

  const client = await pool.connect();
  const targetPerLanguage = 3000;
  const languages = ['python', 'c', 'cpp', 'java', 'javascript', 'sql'];

  try {
    // Step 1: Inspect existing database counts
    const initialCountsRes = await client.query(`
      SELECT language, validation_status, COUNT(*) as count
      FROM questions
      GROUP BY language, validation_status
      ORDER BY language, validation_status;
    `);

    console.log('📊 Current Database State:');
    initialCountsRes.rows.forEach(r => {
      console.log(`   • ${r.language.padEnd(12)} [${(r.validation_status || 'unassigned').padEnd(9)}]: ${r.count}`);
    });
    console.log('');

    // Step 2: Generate and batch insert questions per language up to target
    for (const lang of languages) {
      const existingRes = await client.query(
        'SELECT COUNT(*) as count FROM questions WHERE language = $1',
        [lang]
      );
      const existingCount = parseInt(existingRes.rows[0].count, 10);
      const needed = Math.max(0, targetPerLanguage - existingCount);

      console.log(`⚙️ Processing [${lang.toUpperCase()}]: existing = ${existingCount}, generating = ${needed} ...`);

      if (needed === 0) {
        console.log(`   Target already satisfied for ${lang}.\n`);
        continue;
      }

      const domainList = DOMAINS[lang] || DOMAINS.python;
      const batchSize = 250;
      let batch = [];
      let totalInsertedForLang = 0;

      for (let i = 1; i <= needed; i++) {
        const globalIdx = existingCount + i;
        const domainObj = domainList[(globalIdx - 1) % domainList.length];
        const qSpec = generateQuestionSpec(lang, globalIdx, domainObj);
        batch.push(qSpec);

        if (batch.length === batchSize || i === needed) {
          // Batch insertion inside transaction
          await client.query('BEGIN');
          for (const q of batch) {
            await client.query(
              `INSERT INTO questions (
                id, language, course_id, topic_id, difficulty, title,
                statement, input_format, output_format, constraints,
                sample_input, sample_output, starter_code, reference_solution,
                solution_explanation, hint_1, hint_2, test_cases,
                expected_time_complexity, expected_space_complexity, tags,
                is_exam_eligible, validation_status,
                task_type, runtime, input_contract, mapping_status, practice_only,
                duplicate_signature, difficulty_rationale, validation_evidence,
                generation_schema_version, taxonomy_version
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26::jsonb, $27, $28,
                $29, $30, $31::jsonb, $32, $33
              ) ON CONFLICT (id) DO NOTHING;`,
              [
                q.id, q.language, q.course_id, q.topic_id, q.difficulty, q.title,
                q.statement, q.input_format, q.output_format, q.constraints,
                q.sample_input, q.sample_output, JSON.stringify(q.starter_code), q.reference_solution,
                q.solution_explanation, q.hint_1, q.hint_2, JSON.stringify(q.test_cases),
                q.expected_time_complexity, q.expected_space_complexity, q.tags,
                q.is_exam_eligible, q.validation_status,
                q.task_type, q.runtime, JSON.stringify(q.input_contract), q.mapping_status, q.practice_only,
                q.duplicate_signature, q.difficulty_rationale, JSON.stringify(q.validation_evidence),
                q.generation_schema_version, q.taxonomy_version
              ]
            );
          }
          await client.query('COMMIT');
          totalInsertedForLang += batch.length;
          process.stdout.write(`   • Inserted ${totalInsertedForLang}/${needed} questions...\r`);
          batch = [];
        }
      }
      console.log(`\n   ✅ Successfully ingested ${totalInsertedForLang} questions for ${lang}!\n`);
    }

    // No status promotion happens here. This generator does not execute a
    // sandbox audit, so it must never label any question as tested.
    console.log('⚠️ Generated rows remain validation_status="generated" and exam-ineligible. Run scripts/audit-generated-questions.js separately.\n');

    // Step 3: Final Summary Report
    const finalCountsRes = await client.query(`
      SELECT language, validation_status, COUNT(*) as count
      FROM questions
      GROUP BY language, validation_status
      ORDER BY language, validation_status;
    `);

    const totalsRes = await client.query(`
      SELECT language, COUNT(*) as total_count
      FROM questions
      GROUP BY language
      ORDER BY language;
    `);

    console.log('======================================================================');
    console.log('                   FINAL QUESTION BANK AUDIT REPORT                   ');
    console.log('======================================================================');
    totalsRes.rows.forEach(r => {
      console.log(`📍 ${r.language.toUpperCase().padEnd(12)}: Total = ${r.total_count} questions`);
    });

    console.log('\nBreakdown by Validation Status:');
    finalCountsRes.rows.forEach(r => {
      console.log(`   • ${r.language.padEnd(12)} [${r.validation_status.padEnd(9)}]: ${r.count}`);
    });

    const totalOverall = await client.query('SELECT COUNT(*) as count FROM questions');
    console.log(`\n🏆 Total Questions across all tracks: ${totalOverall.rows[0].count}`);
    console.log('======================================================================');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Pipeline error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runPipeline();
