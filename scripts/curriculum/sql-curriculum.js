/**
 * Code Nexus — Comprehensive SQL & Relational Database Curriculum
 * Master topic definitions for SQL Track
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createSqlJoinSvg } = require('./diagrams');

const sqlTopics = [
  {
    id: 'sql-select-filtering',
    course_id: 'sql-databases',
    unit_id: 'sql-unit-1',
    title: 'SELECT, Column Aliasing, WHERE & Logical Filtering',
    description: 'Master relational data retrieval: SELECT, projection, aliases, WHERE clauses, comparison operators, and NULL handling in SQL.',
    order_index: 1,
    learning_objectives: [
      'Master query projection with SELECT and column aliasing with AS',
      'Filter rows accurately using WHERE with AND, OR, NOT, IN, and BETWEEN',
      'Understand Three-Valued Logic and how to properly filter NULL values with IS NULL'
    ],
    prerequisites: ['Basic database concepts (Tables, Rows, Columns)'],
    expected_outcomes: ['Able to write accurate data retrieval queries with complex boolean filtering and proper NULL handling'],
    formal_definition: 'SQL SELECT executes relational projection and selection operations on stored relations (tables). The WHERE clause specifies a boolean filter predicate that restricts the rows returned by the query.',
    content_simple_english: `In a relational database (like PostgreSQL), data is stored in Tables made of Rows (records) and Columns (attributes).
The most fundamental SQL query consists of two parts:
1. SELECT: Chooses WHICH COLUMNS you want to see.
2. FROM: Chooses WHICH TABLE you are querying.
3. WHERE: Filters WHICH ROWS match your criteria.

Three-Valued Logic & The NULL Trap:
In SQL, NULL does not mean "zero" or "empty string"—it means **UNKNOWN**!
Because NULL is unknown:
- You CANNOT use = NULL (e.g. WHERE salary = NULL will NEVER return any rows)!
- You MUST use IS NULL or IS NOT NULL!

Logical Operators:
- AND: Both conditions must be true.
- OR: At least one condition must be true.
- IN (val1, val2): Matches any value in a specified set.
- BETWEEN low AND high: Matches inclusive numerical or date ranges.`,
    hinglish_explanation: `Database me data Tables me store hota hai (jaise Excel sheet hoti hai jisme rows aur columns hote hain).

Jab hume data nikalna hota hai, hum SQL use karte hain:
1. SELECT: Batata hai kaunse columns dekhne hain (jaise SELECT name, email).
2. FROM: Batata hai kis table se nikalna hai (jaise FROM users).
3. WHERE: Condition lagata hai (jaise WHERE age >= 18).

Sabse bada trap: NULL value!
SQL me NULL ka matlab 0 ya khali nahi hota, balki "UNKNOWN" hota hai. Isliye SQL me kabhi WHERE status = NULL mat likhna, hamesha **WHERE status IS NULL** likhte hain!`,
    why_it_matters: 'Every backend service and analytics report queries relational data using SELECT and WHERE. Inaccurate filtering leads to data leaks or corrupted metrics.',
    when_to_use: 'Use SELECT to retrieve data. Avoid SELECT * in production applications; always specify explicit column names to reduce network payload and memory footprint.',
    syntax_guide: {
      template: 'SELECT column1, column2 AS alias_name\nFROM table_name\nWHERE condition1 AND (condition2 OR condition3)\nORDER BY column1 ASC;',
      components: [
        { name: 'SELECT', role: 'Projection: specifies attributes to retrieve', required: true },
        { name: 'FROM', role: 'Identifies source relation / table', required: true },
        { name: 'WHERE', role: 'Filter predicate executed before grouping or projection', required: false },
        { name: 'AS', role: 'Aliases column name in the result set', required: false }
      ],
      rules: ['Dialect: Standard ANSI SQL (compatible with PostgreSQL and SQLite)', 'SQL keywords are case-insensitive, but uppercase is standard convention']
    },
    code_example_1_title: 'Basic Foundational: Simple Projection and Numeric Filter',
    code_example_1_code: `-- Dialect: PostgreSQL / SQLite
SELECT 
    id, 
    title, 
    difficulty 
FROM questions 
WHERE difficulty = 'Easy';`,
    code_example_1_explanation: 'Selects the id, title, and difficulty columns from the questions table, filtering only records where difficulty strictly matches "Easy".',
    code_example_1_output: `id     | title                               | difficulty
-------+-------------------------------------+-----------
py-001 | Python Variables & Arithmetic       | Easy
c-001  | C First Hello Program               | Easy
c-002  | C Primitive Data Sizes              | Easy`,

    code_example_2_title: 'Intermediate Logic: Compound Filtering with AND, OR & IN',
    code_example_2_code: `-- Dialect: PostgreSQL / SQLite
SELECT 
    id, 
    email, 
    points, 
    role 
FROM users 
WHERE points >= 100 
  AND role IN ('student', 'admin')
ORDER BY points DESC;`,
    code_example_2_explanation: 'Combines comparison operator (>=), set membership (IN), and sorting (ORDER BY DESC) to extract qualified active users.',
    code_example_2_output: `id | email                  | points | role
---+------------------------+--------+--------
1  | admin@codenexus.dev    | 500    | admin
2  | alex.dev@codenexus.io  | 190    | student`,

    code_example_3_title: 'Practical Application: High-Value E-Commerce Order Inspection',
    code_example_3_code: `-- Dialect: PostgreSQL / SQLite
-- Input Table: orders (order_id INT, customer_id INT, total_amount NUMERIC, status VARCHAR)
SELECT 
    order_id,
    customer_id,
    total_amount AS amount_usd,
    status
FROM orders
WHERE status = 'completed'
  AND total_amount BETWEEN 100.00 AND 5000.00
  AND customer_id IS NOT NULL;`,
    code_example_3_explanation: 'Demonstrates real-world e-commerce query filtering completed orders in a target price range with NULL validation.',
    code_example_3_output: `order_id | customer_id | amount_usd | status
---------+-------------+------------+----------
1042     | 55          | 450.00     | completed
1049     | 82          | 1200.50    | completed`,

    code_walkthrough: {
      code: `SELECT name, points FROM users WHERE points > 50;`,
      steps: [
        { line: 1, explanation: 'FROM clause reads the users table relation into memory.', state: 'Table Loaded' },
        { line: 1, explanation: 'WHERE evaluates points > 50 for each row, filtering non-qualifying rows.', state: 'Rows Filtered' },
        { line: 1, explanation: 'SELECT projects only name and points columns to client.', state: 'Projection Result' }
      ],
      output: 'name | points\nAlex | 190',
      output_reasoning: 'Alex has 190 points which is > 50, so the record is returned.'
    },

    rules_and_restrictions: [
      'In SQL, checking for NULL requires IS NULL or IS NOT NULL; = NULL always evaluates to UNKNOWN (false)',
      'Never use SELECT * in production API endpoints; select only required columns to optimize index scans and network transfer',
      'String literals in SQL must be enclosed in single quotes (\"text\"), not double quotes'
    ],
    common_mistakes: [
      {
        title: 'Using = NULL instead of IS NULL',
        incorrect_code: `SELECT * FROM users WHERE phone = NULL; // Returns 0 rows always!`,
        explanation: 'In SQL three-valued logic, comparison with NULL yields UNKNOWN. Since WHERE only returns TRUE rows, this query will never return anything.',
        corrected_code: `SELECT * FROM users WHERE phone IS NULL;`,
        error_message: 'Silent empty result set defect',
        debug_tip: 'Always use IS NULL or IS NOT NULL when checking for missing values.'
      }
    ],
    comparison_table: {
      title: 'WHERE vs HAVING in SQL',
      concept_a: 'WHERE Clause',
      concept_b: 'HAVING Clause',
      headers: ['Feature', 'WHERE Clause', 'HAVING Clause'],
      rows: [
        ['Filtering Target', 'Individual input rows before aggregation', 'Aggregated groups created by GROUP BY'],
        ['Aggregate Functions', 'Cannot use aggregates (e.g. WHERE SUM(x) > 10 is illegal)', 'Permits aggregates (e.g. HAVING COUNT(*) > 5)'],
        ['Execution Order', 'Executes before GROUP BY', 'Executes after GROUP BY']
      ]
    },
    diagram_svg: createSqlJoinSvg('Filter (WHERE)', { name: 'users', rows: ['1 | Alex | 190', '2 | Sam  | 40', '3 | Sara | 120'] }, { name: 'Condition', rows: ['points >= 100'] }, { name: 'Result', rows: ['Alex | 190', 'Sara | 120'] }),
    practical_applications: [
      'User authentication verification queries in PostgreSQL backend services',
      'Financial audit reporting on high-value ledger transactions'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the result of executing: SELECT * FROM table WHERE col = NULL; in SQL?',
        options: [
          'It returns all rows where col is NULL',
          'It returns 0 rows because comparison with NULL evaluates to UNKNOWN',
          'It causes a syntax error',
          'It returns all rows where col is not NULL'
        ],
        correct_index: 1,
        explanation: 'In SQL Three-Valued Logic, any equality comparison with NULL evaluates to UNKNOWN. Therefore, col = NULL will never return any rows. You must use col IS NULL.'
      }
    ],
    key_takeaways: [
      'SELECT specifies columns; FROM specifies table; WHERE specifies row filters.',
      'NULL means UNKNOWN; always use IS NULL or IS NOT NULL.',
      'Avoid SELECT * in production; project only needed columns.'
    ],
    quick_revision_notes: 'SELECT cols FROM table WHERE cond1 AND cond2. Always use IS NULL (not = NULL). String literals use single quotes.',
    assignment_prompt: 'Write an ANSI SQL query to select id, full_name, and points from users where is_verified = true and points >= 50, sorted descending by points.',
    assignment_starter_code: `-- Write SQL query below
SELECT 
    id, full_name, points
FROM users;`,
    assignment_solution: `SELECT 
    id, full_name, points
FROM users
WHERE is_verified = true
  AND points >= 50
ORDER BY points DESC;`
  },

  {
    id: 'sql-joins-aggregations',
    course_id: 'sql-databases',
    unit_id: 'sql-unit-1',
    title: 'Multi-Table Relational JOINs & Aggregations',
    description: 'Master relational data combination: INNER JOIN, LEFT OUTER JOIN, RIGHT JOIN, GROUP BY, HAVING, and aggregate functions in SQL.',
    order_index: 2,
    learning_objectives: [
      'Master the relational mechanics of INNER JOIN vs LEFT OUTER JOIN',
      'Learn how to group data with GROUP BY and compute aggregate metrics (COUNT, SUM, AVG)',
      'Understand why HAVING is used to filter aggregated groups instead of WHERE'
    ],
    prerequisites: ['SELECT, Column Aliasing, WHERE & Logical Filtering'],
    expected_outcomes: ['Able to combine multiple normalized database tables and generate complex aggregated analytics reports'],
    formal_definition: 'A JOIN is a binary relational operator that combines attributes from two relations based on a join predicate. Aggregate functions compute a single summary value over a set of rows grouped by a GROUP BY clause.',
    content_simple_english: `In professional databases, data is split across multiple tables to avoid duplication (Normalization). For example, users live in a 'users' table, and their course enrollments live in a 'user_course_enrollments' table.
To connect them back together, we use **JOINs**:
1. INNER JOIN: Returns ONLY rows where there is a match in BOTH tables. If a user has no enrollments, they are omitted.
2. LEFT OUTER JOIN: Returns ALL rows from the Left table, plus matching rows from the Right table. If no match exists, the right side is filled with NULLs!
3. GROUP BY: Collapses multiple rows sharing the same value into summary rows.
4. Aggregates: COUNT(), SUM(), AVG(), MIN(), MAX().
5. HAVING: Filters the grouped rows AFTER aggregation (e.g. HAVING COUNT(*) > 3).`,
    hinglish_explanation: `Database me hum saara data ek hi table me nahi rakhte, alag-alag tables me rakhte hain taaki data repeat na ho (jaise Ek Students ki table, aur Ek Courses ki table).

Jab dono tables ko jod kar data nikalna ho, hum **JOIN** use karte hain:
1. INNER JOIN: Sirf wahi records dikhata hai jo dono tables me match karte hain.
2. LEFT JOIN: Left wali table ke saare records aayenge, chahe Right table me unka koi match ho ya na ho! Agar match nahi mila, toh Right table ke columns me NULL bhar jata hai.

Aggregation (Ganna karna):
- COUNT(*): Kitne rows hain.
- AVG(salary): Average salary kitni hai.
- GROUP BY: Group banane ke liye (jaise har department ke hisaab se count karna).
- HAVING: Group banne ke baad filter lagane ke liye (jaise unhi departments ko dikhao jisme 3 se zyada log hain).`,
    why_it_matters: 'Almost every enterprise database query involves multi-table JOINs and aggregation to generate dashboards, invoices, and analytics.',
    when_to_use: 'Use INNER JOIN when you only care about records with complete matching relationships. Use LEFT JOIN when you want to preserve all primary records even if related secondary data is absent.',
    syntax_guide: {
      template: 'SELECT A.id, A.name, COUNT(B.id) as total_items\nFROM table_a A\nLEFT JOIN table_b B ON A.id = B.a_id\nGROUP BY A.id, A.name\nHAVING COUNT(B.id) > 2;',
      components: [
        { name: 'INNER JOIN', role: 'Retains only matching rows between both relations', required: false },
        { name: 'LEFT JOIN', role: 'Retains all left rows; fills right columns with NULL when no match', required: false },
        { name: 'ON', role: 'Specifies the relational foreign-key equality predicate', required: true },
        { name: 'GROUP BY', role: 'Groups rows sharing same values in specified columns', required: false }
      ],
      rules: ['Every non-aggregated column in the SELECT list must appear in the GROUP BY clause', 'Dialect: Standard ANSI SQL (PostgreSQL & SQLite compatible)']
    },
    code_example_1_title: 'Basic Foundational: INNER JOIN Between Users and Enrollments',
    code_example_1_code: `-- Dialect: PostgreSQL / SQLite
SELECT 
    u.id AS user_id,
    u.full_name,
    e.course_id,
    e.progress_percent
FROM users u
INNER JOIN user_course_enrollments e ON u.id = e.user_id
WHERE e.is_completed = true;`,
    code_example_1_explanation: 'Joins users with course enrollments matching on user_id, returning only users who have completed courses.',
    code_example_1_output: `user_id | full_name   | course_id | progress_percent
--------+-------------+-----------+-----------------
2       | Alex Morgan | c-lang    | 100
2       | Alex Morgan | cpp       | 100`,

    code_example_2_title: 'Intermediate Logic: LEFT JOIN Preserving Users Without Certs',
    code_example_2_code: `-- Dialect: PostgreSQL / SQLite
SELECT 
    u.email,
    c.id AS certificate_id,
    c.score_percent
FROM users u
LEFT JOIN certificates c ON u.id = c.user_id
WHERE u.role = 'student';`,
    code_example_2_explanation: 'A LEFT JOIN returns all students. Students who have not yet earned a certificate show NULL in the certificate_id column.',
    code_example_2_output: `email                 | certificate_id           | score_percent
----------------------+--------------------------+--------------
alex.dev@codenexus.io | CN-CERT-2026-9A82-C104   | 92.00
newbie@example.com    | NULL                     | NULL`,

    code_example_3_title: 'Practical Application: Department Salary Analytics with GROUP BY & HAVING',
    code_example_3_code: `-- Dialect: PostgreSQL / SQLite
-- Input Table: employees (id, dept_id, name, salary, is_active)
SELECT 
    dept_id,
    COUNT(*) AS active_employee_count,
    ROUND(AVG(salary), 2) AS average_salary,
    MAX(salary) AS highest_salary
FROM employees
WHERE is_active = true
GROUP BY dept_id
HAVING COUNT(*) >= 2
ORDER BY average_salary DESC;`,
    code_example_3_explanation: 'Calculates active employee headcount, average salary, and max salary grouped by department, filtering only departments with at least 2 staff.',
    code_example_3_output: `dept_id | active_employee_count | average_salary | highest_salary
--------+-----------------------+----------------+---------------
10      | 4                     | 825.00         | 900.00
20      | 2                     | 750.50         | 800.00`,

    code_walkthrough: {
      code: `SELECT u.name, COUNT(e.id) FROM users u JOIN enrollments e ON u.id=e.user_id GROUP BY u.name;`,
      steps: [
        { line: 1, explanation: 'Join users and enrollments matching u.id == e.user_id.', state: 'Joined Tuples Formed' },
        { line: 1, explanation: 'Partition joined rows into buckets grouped by u.name.', state: 'Buckets Created' },
        { line: 1, explanation: 'Calculate COUNT(e.id) for each name bucket and project result.', state: 'Aggregates Projected' }
      ],
      output: 'name | count\nAlex | 2',
      output_reasoning: 'Alex has 2 matching enrollment records, yielding a count of 2.'
    },

    rules_and_restrictions: [
      'In SQL, if you use GROUP BY, every column in the SELECT list that is not inside an aggregate function MUST be in the GROUP BY clause',
      'WHERE cannot filter aggregate functions; you must use HAVING to filter aggregates'
    ],
    common_mistakes: [
      {
        title: 'Using WHERE to filter an aggregate function',
        incorrect_code: `SELECT dept_id, COUNT(*) FROM emp WHERE COUNT(*) > 3 GROUP BY dept_id;`,
        explanation: 'WHERE filters rows BEFORE grouping occurs. At the time WHERE runs, COUNT(*) has not been computed yet.',
        corrected_code: `SELECT dept_id, COUNT(*) FROM emp GROUP BY dept_id HAVING COUNT(*) > 3;`,
        error_message: 'error: aggregate functions are not allowed in WHERE',
        debug_tip: 'Remember: Filter raw rows with WHERE; filter aggregated summary groups with HAVING.'
      }
    ],
    comparison_table: {
      title: 'INNER JOIN vs LEFT OUTER JOIN',
      concept_a: 'INNER JOIN',
      concept_b: 'LEFT OUTER JOIN',
      headers: ['Feature', 'INNER JOIN', 'LEFT OUTER JOIN'],
      rows: [
        ['Non-Matching Left Rows', 'Discarded (Not in result)', 'Retained (Filled with NULLs on right side)'],
        ['Result Set Size', 'Smaller or equal to left table', 'Always at least as large as left table'],
        ['Best Use Case', 'Querying strictly existing relationships', 'Audit queries (finding users who have NOT made an order)']
      ]
    },
    diagram_svg: createSqlJoinSvg('INNER JOIN', { name: 'users', rows: ['1 | Alex | 10', '2 | Sam  | 20'] }, { name: 'departments', rows: ['10 | Engineering', '20 | Security'] }, { name: 'Result', rows: ['Alex | Engineering', 'Sam  | Security'] }),
    practical_applications: [
      'Generating monthly billing invoices by joining accounts, subscriptions, and payment ledgers',
      'Generating user profile metrics by joining users, certificates, and solved challenge attempts'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which clause is used to filter aggregated groups AFTER a GROUP BY clause in SQL?',
        options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
        correct_index: 1,
        explanation: 'HAVING filters the aggregated result groups produced by GROUP BY. WHERE filters individual rows before grouping.'
      }
    ],
    key_takeaways: [
      'INNER JOIN returns matching rows only; LEFT JOIN keeps all rows from the left table.',
      'GROUP BY aggregates rows into summary groups.',
      'Filter raw rows with WHERE; filter aggregate results with HAVING.'
    ],
    quick_revision_notes: 'JOIN: table_a A [INNER|LEFT] JOIN table_b B ON A.id = B.a_id. GROUP BY cols HAVING aggregate > val.',
    assignment_prompt: 'Write an SQL query to join courses c and course_topics t on c.id = t.course_id, and count how many topics each course contains, grouping by course id and title.',
    assignment_starter_code: `-- Count topics per course
SELECT 
    c.id, c.title
FROM courses c;`,
    assignment_solution: `SELECT 
    c.id, 
    c.title, 
    COUNT(t.id) AS topic_count
FROM courses c
INNER JOIN course_topics t ON c.id = t.course_id
GROUP BY c.id, c.title
ORDER BY topic_count DESC;`
  }
];

module.exports = { sqlTopics };
