/**
 * Code Nexus — SQL Curriculum Fixture Validator
 * Executes exact SQL stored in course_topics for the sql-databases track.
 * The two original topics use TEMP tables inside BEGIN ... ROLLBACK. The
 * expanded topics run their exact multi-statement examples in isolated,
 * throwaway PostgreSQL schemas so DDL, views and real transaction control
 * can be exercised without touching application tables.
 *
 * Usage: node scripts/validate-sql-examples.js [--mark-tested]
 */

require('dotenv').config({ path: '.env' });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');
const { Client } = require('pg');

const client = new Client({
  connectionString: requireDatabaseUrl(),
});

let passed = 0, failed = 0;
function assert(cond, name, detail = '') {
  if (cond) { console.log(`  [PASS] ${name}`); passed++; }
  else { console.log(`  [FAIL] ${name} ${detail}`); failed++; }
}

async function getTopic(id) {
  const r = await client.query('SELECT * FROM course_topics WHERE id = $1', [id]);
  return r.rows[0];
}

async function runCase(label, setupSql, querySql, checks) {
  await client.query('BEGIN');
  try {
    for (const s of setupSql) await client.query(s);
    const res = await client.query(querySql);
    checks(res.rows, label);
  } catch (e) {
    assert(false, label, `(${e.message.split('\n')[0]})`);
  } finally {
    await client.query('ROLLBACK');
  }
}

function splitStatements(sql) {
  const out = [];
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1] || '';
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inSingle) {
      if (ch === "'" && next === "'") { i++; continue; }
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"' && next === '"') { i++; continue; }
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === '-' && next === '-') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === "'") { inSingle = true; continue; }
    if (ch === '"') { inDouble = true; continue; }
    if (ch === ';') {
      out.push(sql.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < sql.length) out.push(sql.slice(start));
  return out.filter((s) => s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim());
}

async function execExact(label, sql, expectedErrors = []) {
  const results = [];
  const seenExpected = new Set();
  for (const stmt of splitStatements(sql || '')) {
    try {
      const res = await client.query(stmt);
      const clean = stmt.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      const kind = (clean.match(/^[A-Za-z]+/) || [''])[0].toUpperCase();
      results.push({ command: res.command, kind, rows: res.rows, rowCount: res.rowCount, sql: stmt });
    } catch (e) {
      const idx = expectedErrors.findIndex((x) => x.statement.test(stmt));
      if (idx < 0) throw new Error(`${label}: ${e.message.split('\n')[0]} :: ${stmt.trim().slice(0, 120)}`);
      const spec = expectedErrors[idx];
      seenExpected.add(idx);
      assert(spec.message.test(e.message), `${label}: expected error — ${spec.label}`, `(${e.message.split('\n')[0]})`);
      results.push({ command: 'EXPECTED_ERROR', rows: [], rowCount: null, sql: stmt, error: e.message });
    }
  }
  expectedErrors.forEach((spec, idx) => {
    if (!seenExpected.has(idx)) assert(false, `${label}: expected error was not raised — ${spec.label}`);
  });
  return results;
}

async function withSchema(label, fn) {
  const schema = `sql_fixture_${label.replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    await fn();
  } catch (e) {
    assert(false, `${label}: exact SQL execution`, `(${e.message.split('\n')[0]})`);
  } finally {
    try { await client.query('ROLLBACK'); } catch {}
    try { await client.query('SET search_path TO public'); } catch {}
    try { await client.query(`DROP SCHEMA ${schema} CASCADE`); } catch {}
  }
}

// Classify by the statement's first keyword, not pg's command tag:
// CREATE MATERIALIZED VIEW reports a SELECT tag, while EXPLAIN has its own.
// CTE queries begin with WITH but return ordinary result rows.
const selects = (results) => results.filter((r) => r.kind === 'SELECT' || r.kind === 'WITH');
const explains = (results) => results.filter((r) => r.kind === 'EXPLAIN');
const lastSelect = (results) => selects(results).at(-1)?.rows || [];
const num = (v) => Number(v);
const vals = (rows, key) => rows.map((r) => r[key]);
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

async function validateExpandedSqlTopics() {
  const ids = [
    'sql-relational-model-keys', 'sql-create-table-constraints', 'sql-crud-dml',
    'sql-filtering-like-patterns', 'sql-case-conditional-aggregation', 'sql-subqueries',
    'sql-ctes', 'sql-views', 'sql-normalization', 'sql-indexes-explain',
    'sql-transactions-acid',
  ];
  const topics = {};
  for (const id of ids) topics[id] = await getTopic(id);

  console.log('\n[sql-relational-model-keys]');
  await withSchema('sql-relational-model-keys', async () => {
    const t = topics['sql-relational-model-keys'];
    let rows = lastSelect(await execExact('relational ex1', t.code_example_1_code));
    assert(rows.length === 2 && rows[0].full_name === 'Diya Sharma' && rows[1].city === 'Vadodara', 'relational ex1: two students with PK/unique email', JSON.stringify(rows));
    rows = lastSelect(await execExact('relational ex2', t.code_example_2_code));
    assert(rows.length === 3 && rows.every((r) => [101, 102].includes(r.course_id)), 'relational ex2: composite-key enrolments', JSON.stringify(rows));
    rows = lastSelect(await execExact('relational ex3', t.code_example_3_code, [
      { statement: /INSERT INTO enrolments VALUES \(99, 101\)/i, message: /foreign key/i, label: 'orphan enrolment rejected' },
      { statement: /INSERT INTO students VALUES \(1,/i, message: /duplicate key.*students_pkey/i, label: 'duplicate student PK rejected' },
    ]));
    assert(num(rows[0]?.enrolment_rows) === 4, 'relational ex3: valid follow-up enrolment makes 4 rows', JSON.stringify(rows));
    rows = lastSelect(await execExact('relational solution', t.assignment_solution));
    assert(rows.length === 1 && rows[0].title === 'The Room on the Roof' && rows[0].author_id === 1, 'relational solution: book references author', JSON.stringify(rows));
  });

  console.log('\n[sql-create-table-constraints]');
  await withSchema('sql-create-table-constraints', async () => {
    const t = topics['sql-create-table-constraints'];
    let rows = lastSelect(await execExact('constraints ex1', t.code_example_1_code));
    assert(rows.length === 2 && rows[0].stock === 0 && num(rows[1].price) === 80.5, 'constraints ex1: identity/default/check table accepts valid rows', JSON.stringify(rows));
    rows = lastSelect(await execExact('constraints ex2', t.code_example_2_code, [
      { statement: /VALUES \('Free\?', -5\)/i, message: /check constraint/i, label: 'negative price rejected' },
      { statement: /INSERT INTO products \(price\)/i, message: /not-null constraint/i, label: 'missing name rejected' },
    ]));
    assert(rows.length === 1 && rows[0].status === 'active', 'constraints ex2: account default status is active', JSON.stringify(rows));
    rows = lastSelect(await execExact('constraints ex3', t.code_example_3_code));
    assert(rows.length === 1 && rows[0].is_active === true, 'constraints ex3: Boolean default true', JSON.stringify(rows));
    rows = lastSelect(await execExact('constraints solution', t.assignment_solution));
    assert(rows.length === 1 && rows[0].title === '3 Idiots' && rows[0].watched === false, 'constraints solution: movie row/defaults', JSON.stringify(rows));
  });

  console.log('\n[sql-crud-dml]');
  await withSchema('sql-crud-dml', async () => {
    const t = topics['sql-crud-dml'];
    let rows = lastSelect(await execExact('crud ex1', t.code_example_1_code));
    assert(rows.length === 3 && rows.every((r) => r.done === false), 'crud ex1: batch insert creates 3 open tasks', JSON.stringify(rows));
    let results = await execExact('crud ex2', t.code_example_2_code);
    const updates = results.filter((r) => r.command === 'UPDATE');
    assert(updates.length === 2 && updates[0].rows.length === 2 && updates[1].rows[0]?.title.endsWith('(priority)'), 'crud ex2: RETURNING updates targeted rows', JSON.stringify(updates.map((u) => u.rows)));
    results = await execExact('crud ex3', t.code_example_3_code);
    rows = lastSelect(results);
    assert(results.find((r) => r.command === 'DELETE')?.rowCount === 2 && rows.length === 1 && rows[0].task_id === 2, 'crud ex3: preview/delete leaves only open priority task', JSON.stringify(rows));
    rows = lastSelect(await execExact('crud solution', t.assignment_solution));
    assert(vals(rows, 'student').join(',') === 'Diya,Meera,Kabir' && rows.at(-1).marks === 60, 'crud solution: Kabir receives grace marks to 60', JSON.stringify(rows));
  });

  console.log('\n[sql-filtering-like-patterns]');
  await withSchema('sql-filtering-like-patterns', async () => {
    const t = topics['sql-filtering-like-patterns'];
    let found = selects(await execExact('filtering ex1', t.code_example_1_code)).map((r) => vals(r.rows, 'name'));
    assert(found.length === 3 && sameSet(found[0], ['Diya Sharma', 'Divya Nair']) && sameSet(found[1], ['Diya Sharma', 'Kabir Shah', 'Meera Iyer']) && sameSet(found[2], ['Kabir Shah', 'Meera Iyer']), 'filtering ex1: LIKE/ILIKE result sets', JSON.stringify(found));
    found = selects(await execExact('filtering ex2', t.code_example_2_code));
    assert(sameSet(vals(found[0].rows, 'applicant'), ['Asha', 'Sana']) && sameSet(vals(found[1].rows, 'applicant'), ['Ravi', 'Sana']) && num(found[2].rows[0].everyone) === 0, 'filtering ex2: IN/BETWEEN/IS NULL and =NULL trap', JSON.stringify(found.map((x) => x.rows)));
    found = selects(await execExact('filtering ex3', t.code_example_3_code));
    assert(vals(found[0].rows, 'city').join(',') === 'Goa,Pune,Surat' && vals(found[1].rows, 'applicant').join(',') === 'Vikram,Asha' && vals(found[2].rows, 'applicant').join(',') === 'Sana,Ravi', 'filtering ex3: DISTINCT and stable pagination', JSON.stringify(found.map((x) => x.rows)));
    found = selects(await execExact('filtering solution', t.assignment_solution));
    assert(vals(found[0].rows, 'name').join(',') === 'Diya Sharma' && vals(found[1].rows, 'city').join(',') === 'Jaipur,Kochi,Nagpur,Pune', 'filtering solution: Gmail non-pur learner + distinct cities', JSON.stringify(found.map((x) => x.rows)));
  });

  console.log('\n[sql-case-conditional-aggregation]');
  await withSchema('sql-case-conditional-aggregation', async () => {
    const t = topics['sql-case-conditional-aggregation'];
    let rows = lastSelect(await execExact('case ex1', t.code_example_1_code));
    assert(rows.map((r) => r.grade).join(',') === 'A,B,C,Fail', 'case ex1: grade bands in marks order', JSON.stringify(rows));
    rows = lastSelect(await execExact('case ex2', t.code_example_2_code));
    assert(num(rows[0].total) === 4 && num(rows[0].passed) === 3 && num(rows[0].pass_pct) === 75 && num(rows[0].a_grades) === 1, 'case ex2: one-scan conditional aggregates', JSON.stringify(rows));
    rows = lastSelect(await execExact('case ex3', t.code_example_3_code));
    assert(rows.length === 2 && num(rows[0].online_total) === 0 && num(rows[1].online_total) === 1500 && num(rows[1].store_total) === 800, 'case ex3: grouped channel matrix', JSON.stringify(rows));
    const found = selects(await execExact('case solution', t.assignment_solution));
    assert(num(found[0].rows[0].distinction) === 1 && num(found[0].rows[0].first_class) === 1 && num(found[0].rows[0].others) === 2 && found[1].rows.length === 4, 'case solution: band counts and labels', JSON.stringify(found.map((x) => x.rows)));
  });

  console.log('\n[sql-subqueries]');
  await withSchema('sql-subqueries', async () => {
    const t = topics['sql-subqueries'];
    let found = selects(await execExact('subqueries ex1', t.code_example_1_code));
    assert(num(found[0].rows[0].class_avg) === 71.4 && vals(found[1].rows, 'marks').join(',') === '92,85,74', 'subqueries ex1: scalar average benchmark', JSON.stringify(found.map((x) => x.rows)));
    found = selects(await execExact('subqueries ex2', t.code_example_2_code));
    assert(found.length === 2 && found.every((r) => vals(r.rows, 'name').join(',') === 'Diya,Meera'), 'subqueries ex2: IN and JOIN agree', JSON.stringify(found.map((x) => x.rows)));
    found = selects(await execExact('subqueries ex3', t.code_example_3_code));
    assert(vals(found[0].rows, 'name').join(',') === 'Kabir' && found[1].rows.length === 0, 'subqueries ex3: NOT EXISTS vs NOT IN NULL trap', JSON.stringify(found.map((x) => x.rows)));
    found = selects(await execExact('subqueries solution', t.assignment_solution));
    assert(found[0].rows.length === 1 && found[0].rows[0].student === 'Diya' && vals(found[1].rows, 'name').join(',') === 'Meera', 'subqueries solution: above Maths average + no-Science student', JSON.stringify(found.map((x) => x.rows)));
  });

  console.log('\n[sql-ctes]');
  await withSchema('sql-ctes', async () => {
    const t = topics['sql-ctes'];
    let rows = lastSelect(await execExact('ctes ex1', t.code_example_1_code));
    assert(vals(rows, 'student').join(',') === 'Diya,Meera' && num(rows[0].avg_marks) === 88.5, 'ctes ex1: per-student averages >=80', JSON.stringify(rows));
    rows = lastSelect(await execExact('ctes ex2', t.code_example_2_code));
    assert(rows.length === 3 && rows.every((r) => num(r.class_mean) === 75.3) && rows[2].standing === 'below', 'ctes ex2: chained benchmark comparison', JSON.stringify(rows));
    rows = lastSelect(await execExact('ctes ex3', t.code_example_3_code));
    assert(rows.length === 5 && rows.map((r) => r.depth).join(',') === '0,1,1,2,2', 'ctes ex3: recursive org depths', JSON.stringify(rows));
    rows = lastSelect(await execExact('ctes solution', t.assignment_solution));
    assert(rows.length === 2 && sameSet(vals(rows, 'student'), ['Diya', 'Meera']), 'ctes solution: per-subject toppers', JSON.stringify(rows));
  });

  console.log('\n[sql-views]');
  await withSchema('sql-views', async () => {
    const t = topics['sql-views'];
    let found = selects(await execExact('views ex1', t.code_example_1_code));
    assert(vals(found[0].rows, 'student').join(',') === 'Meera,Diya,Kabir' && sameSet(vals(found[1].rows, 'student'), ['Meera', 'Diya']), 'views ex1: live report and >=80 filter', JSON.stringify(found.map((x) => x.rows)));
    let rows = lastSelect(await execExact('views ex2', t.code_example_2_code));
    assert(rows.map((r) => r.band).join(',') === 'Distinction,Pass,Distinction', 'views ex2: replaced view adds bands', JSON.stringify(rows));
    found = selects(await execExact('views ex3', t.code_example_3_code));
    assert(num(found[0].rows[0].rows_now) === 4 && num(found[1].rows[0].live_now) === 5 && num(found[2].rows[0].rows_now) === 5, 'views ex3: materialized snapshot stale until refresh', JSON.stringify(found.map((x) => x.rows)));
    found = selects(await execExact('views solution', t.assignment_solution));
    assert(found[0].rows.length === 3 && found[1].rows.length === 4 && vals(found[1].rows, 'student').includes('Sana'), 'views solution: inserted Maths row appears immediately', JSON.stringify(found.map((x) => x.rows)));
  });

  console.log('\n[sql-normalization]');
  await withSchema('sql-normalization', async () => {
    const t = topics['sql-normalization'];
    let rows = lastSelect(await execExact('normalization ex1', t.code_example_1_code));
    assert(rows.length === 2 && sameSet(vals(rows, 'subject'), ['Maths', 'Science']) && rows.every((r) => [92, 85].includes(num(r.avg_marks))), 'normalization ex1: atomic rows aggregate by subject', JSON.stringify(rows));
    let results = await execExact('normalization ex2', t.code_example_2_code);
    assert(results.filter((r) => r.command === 'CREATE').length === 3, 'normalization ex2: 2NF split DDL accepted', JSON.stringify(results.map((r) => r.command)));
    rows = lastSelect(await execExact('normalization ex3', t.code_example_3_code));
    assert(rows.length === 2 && rows.every((r) => r.teacher_phone === '98100-12345'), 'normalization ex3: teacher fact joined from one row', JSON.stringify(rows));
    results = await execExact('normalization solution', t.assignment_solution);
    assert(results.filter((r) => r.command === 'CREATE').length === 3, 'normalization solution: members/books/loans DDL accepted', JSON.stringify(results.map((r) => r.command)));
  });

  console.log('\n[sql-indexes-explain] (semantic plan checks; topic remains reviewed)');
  await withSchema('sql-indexes-explain', async () => {
    const t = topics['sql-indexes-explain'];
    const planText = (results) => explains(results).flatMap((r) => r.rows.map((x) => x['QUERY PLAN'])).join('\n');
    let plans = planText(await execExact('indexes ex1', t.code_example_1_code));
    assert((plans.match(/Seq Scan on results/g) || []).length >= 2, 'indexes ex1: tiny table honestly remains Seq Scan after index', plans);
    plans = planText(await execExact('indexes ex2', t.code_example_2_code));
    assert(/Index Scan using idx_orders_cust_date/.test(plans), 'indexes ex2: 5k-row composite fixture uses index', plans);
    const ex3 = await execExact('indexes ex3', t.code_example_3_code);
    const ex3Plans = explains(ex3).map((r) => r.rows.map((x) => x['QUERY PLAN']).join('\n'));
    assert(/Seq Scan on accounts/.test(ex3Plans[0] || '') && /idx_accounts_email_pattern/.test(ex3Plans[1] || ''), 'indexes ex3: leading wildcard seq scan, prefix uses pattern index', ex3Plans.join('\n---\n'));
    const rows = lastSelect(await execExact('indexes solution', t.assignment_solution));
    assert(rows.length === 20 && rows.every((r, i) => i === 0 || new Date(rows[i - 1].created_at) >= new Date(r.created_at)), 'indexes solution: newest 20 customer orders', JSON.stringify(rows.slice(0, 2)));
  });

  console.log('\n[sql-transactions-acid]');
  await withSchema('sql-transactions-acid', async () => {
    const t = topics['sql-transactions-acid'];
    let rows = lastSelect(await execExact('transactions ex1', t.code_example_1_code));
    assert(rows.map((r) => num(r.balance)).join(',') === '500,700', 'transactions ex1: atomic 500 transfer committed', JSON.stringify(rows));
    const found = selects(await execExact('transactions ex2', t.code_example_2_code, [
      { statement: /balance = balance - 5000 WHERE id = 1/i, message: /check constraint/i, label: 'overdraft update aborts transaction' },
    ]));
    assert(num(found[0]?.rows[0]?.balance) === 500, 'transactions ex2: explicit rollback left Asha at 500', JSON.stringify(found.map((x) => x.rows)));
    rows = (await client.query('SELECT balance FROM accounts ORDER BY id')).rows;
    assert(rows.map((r) => num(r.balance)).join(',') === '500,700', 'transactions ex2: aborted overdraft changed no balances', JSON.stringify(rows));
    rows = lastSelect(await execExact('transactions ex3', t.code_example_3_code));
    assert(rows.map((r) => num(r.balance)).join(',') === '400,800', 'transactions ex3: savepoint flow commits corrected 100 transfer', JSON.stringify(rows));
    rows = lastSelect(await execExact('transactions solution', t.assignment_solution));
    assert(rows.map((r) => num(r.balance)).join(',') === '650,550', 'transactions solution: guarded 250 transfer Ravi -> Asha', JSON.stringify(rows));
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('  CODE NEXUS — SQL FIXTURE VALIDATOR (PostgreSQL dialect)');
  console.log('='.repeat(70));
  await client.connect();

  const sel = await getTopic('sql-select-filtering');
  const join = await getTopic('sql-joins-aggregations');

  console.log('\n[sql-select-filtering]');
  await runCase('ex1: Easy questions projection', [
    `CREATE TEMP TABLE questions (id TEXT, title TEXT, difficulty TEXT)`,
    `INSERT INTO questions VALUES ('py-001','Python Variables & Arithmetic','Easy'),('c-001','C First Hello Program','Easy'),('c-002','C Primitive Data Sizes','Easy'),('cpp-050','Hard Templates','Hard')`,
  ], sel.code_example_1_code, (rows, label) => {
    assert(rows.length === 3 && rows.every(r => r.difficulty === 'Easy'), label, `(rows=${rows.length})`);
  });

  await runCase('ex2: points >= 100 AND role IN (...) ORDER BY points DESC', [
    `CREATE TEMP TABLE users (id INT, email TEXT, points INT, role TEXT)`,
    `INSERT INTO users VALUES (1,'admin@codenexus.dev',500,'admin'),(2,'alex.dev@codenexus.io',190,'student'),(3,'low@example.com',40,'student'),(4,'guest@example.com',900,'guest')`,
  ], sel.code_example_2_code, (rows, label) => {
    assert(rows.length === 2 && rows[0].points === 500 && rows[1].points === 190, label, `(rows=${JSON.stringify(rows)})`);
  });

  await runCase('ex3: completed orders BETWEEN 100 AND 5000, customer NOT NULL', [
    `CREATE TEMP TABLE orders (order_id INT, customer_id INT, total_amount NUMERIC, status TEXT)`,
    `INSERT INTO orders VALUES (1042,55,450.00,'completed'),(1049,82,1200.50,'completed'),(1050,10,300.00,'pending'),(1051,NULL,400.00,'completed'),(1052,9,50.00,'completed')`,
  ], sel.code_example_3_code, (rows, label) => {
    assert(rows.length === 2 && Number(rows[0].amount_usd) === 450 && Number(rows[1].amount_usd) === 1200.5, label, `(rows=${JSON.stringify(rows)})`);
  });

  await runCase('solution: verified users with points >= 50 sorted DESC', [
    `CREATE TEMP TABLE users (id INT, full_name TEXT, points INT, is_verified BOOLEAN)`,
    `INSERT INTO users VALUES (1,'Alex Morgan',190,true),(2,'Sara Low',30,true),(3,'Unverified Uma',500,false)`,
  ], sel.assignment_solution, (rows, label) => {
    assert(rows.length === 1 && rows[0].full_name === 'Alex Morgan', label, `(rows=${JSON.stringify(rows)})`);
  });

  console.log('\n[sql-joins-aggregations]');
  await runCase('ex1: INNER JOIN users x completed enrollments', [
    `CREATE TEMP TABLE users (id INT, full_name TEXT)`,
    `CREATE TEMP TABLE user_course_enrollments (user_id INT, course_id TEXT, progress_percent INT, is_completed BOOLEAN)`,
    `INSERT INTO users VALUES (2,'Alex Morgan'),(3,'No Courses')`,
    `INSERT INTO user_course_enrollments VALUES (2,'c-lang',100,true),(2,'cpp',100,true),(2,'java',40,false)`,
  ], join.code_example_1_code, (rows, label) => {
    assert(rows.length === 2 && rows.every(r => r.full_name === 'Alex Morgan'), label, `(rows=${JSON.stringify(rows)})`);
  });

  await runCase('ex2: LEFT JOIN certificates keeps student without a certificate (NULLs)', [
    `CREATE TEMP TABLE users (id INT, email TEXT, role TEXT)`,
    `CREATE TEMP TABLE certificates (id TEXT, user_id INT, score_percent NUMERIC)`,
    `INSERT INTO users VALUES (2,'alex.dev@codenexus.io','student'),(7,'newbie@example.com','student'),(1,'admin@codenexus.dev','admin')`,
    `INSERT INTO certificates VALUES ('CN-CERT-2026-9A82-C104',2,92.00)`,
  ], join.code_example_2_code, (rows, label) => {
    const newbie = rows.find(r => r.email === 'newbie@example.com');
    assert(rows.length === 2 && newbie && newbie.certificate_id === null, label, `(rows=${JSON.stringify(rows)})`);
  });

  await runCase('ex3: GROUP BY dept + HAVING COUNT(*) >= 2 with AVG/MAX', [
    `CREATE TEMP TABLE employees (id INT, dept_id INT, name TEXT, salary NUMERIC, is_active BOOLEAN)`,
    `INSERT INTO employees VALUES (1,10,'A',900,true),(2,10,'B',800,true),(3,10,'C',800,true),(4,10,'D',800,true),(5,20,'E',800,true),(6,20,'F',701,true),(7,30,'G',999,true),(8,10,'H',10000,false)`,
  ], join.code_example_3_code, (rows, label) => {
    assert(
      rows.length === 2 &&
      Number(rows[0].active_employee_count) === 4 && Number(rows[0].average_salary) === 825 &&
      Number(rows[1].average_salary) === 750.5,
      label, `(rows=${JSON.stringify(rows)})`
    );
  });

  await runCase('solution: topic count per course via JOIN + GROUP BY', [
    `CREATE TEMP TABLE courses (id TEXT, title TEXT)`,
    `CREATE TEMP TABLE course_topics (id TEXT, course_id TEXT)`,
    `INSERT INTO courses VALUES ('c-lang','C Programming Mastery'),('cpp','C++ Modern')`,
    `INSERT INTO course_topics VALUES ('t1','c-lang'),('t2','c-lang'),('t3','cpp')`,
  ], join.assignment_solution, (rows, label) => {
    assert(rows.length === 2 && Number(rows[0].topic_count) === 2 && Number(rows[1].topic_count) === 1, label, `(rows=${JSON.stringify(rows)})`);
  });

  await validateExpandedSqlTopics();

  console.log('\n' + '='.repeat(70));
  console.log(`SQL FIXTURE TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('='.repeat(70));

  if (failed === 0 && process.argv.includes('--mark-tested')) {
    // Honesty guard: mark only topics whose exact examples and assignment
    // solutions were semantically asserted above. sql-indexes-explain is
    // deliberately excluded: its fixture checks plan shapes on this
    // PostgreSQL instance, but planner text/cost choices are environment-
    // and statistics-dependent, so that topic remains 'reviewed'.
    const FIXTURE_TESTED_TOPIC_IDS = [
      'sql-select-filtering', 'sql-joins-aggregations',
      'sql-relational-model-keys', 'sql-create-table-constraints', 'sql-crud-dml',
      'sql-filtering-like-patterns', 'sql-case-conditional-aggregation',
      'sql-subqueries', 'sql-ctes', 'sql-views', 'sql-normalization',
      'sql-transactions-acid',
    ];
    await client.query(
      `UPDATE course_topics SET validation_status='tested', tested_at=NOW() WHERE id = ANY($1::text[])`,
      [FIXTURE_TESTED_TOPIC_IDS]
    );
    console.log(`Marked ${FIXTURE_TESTED_TOPIC_IDS.join(', ')} as validation_status='tested' (fixture-covered topics only).`);
  }

  await client.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => { console.error(e); try { await client.end(); } catch {} process.exit(1); });
