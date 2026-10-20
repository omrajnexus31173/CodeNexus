'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'sql-relational-model-keys', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:1,
  title:'The Relational Model: Tables, Tuples & Keys', desc:'Understand relations, attributes, primary keys, foreign keys and candidate keys before writing queries.',
  obj:['Map real-world entities to tables, rows and columns','Distinguish primary, foreign, candidate and composite keys','Explain referential integrity in one sentence and spot violations'],
  pre:['Basic data/tabular thinking'],
  outcomes:['Learner can read any schema diagram and identify how tables connect'],
  def:'The relational model organises data into relations (tables) of tuples (rows) over named attributes (columns) with atomic values. A primary key uniquely identifies each row; a foreign key in one table references a primary key in another, and referential integrity forbids references to non-existent rows.',
  simple:'Imagine the database as a set of super-disciplined spreadsheets. Each sheet (table) is about ONE kind of thing — students, or courses, never a mixture. Each row is one actual student; each column is one fact type (name, city). Every row needs a unique badge number so you can point at exactly her — that is the primary key, like an Aadhaar number for the row. When the enrolments sheet says "student 7 took course 3", those numbers are foreign keys: pointers that must match real badge numbers in the students and courses sheets. If student 7 does not exist, the database refuses the row — that refusal is referential integrity, your built-in lie detector.',
  hing:'Database ko kuch anushasan-wali register copies samjho. Har register (table) ek hi cheez ke baare me hai — sirf students, ya sirf courses. Har row ek asal entry, har column ek qism ki jaankari. Primary key har row ka unique pehchan number hai (jaise roll number) — do students ka same PK ho hi nahi sakta. Jab dusri table me kisi ka roll number likha jaata hai (jaise enrolment table me student_id), use foreign key kehte hain — ye ek ishara hai dusri table ki taraf. Agar woh student exist hi nahi karta, database entry reject kar deta hai — ise referential integrity kehte hain. Ek table me kai candidate keys ho sakti hain (email bhi unique ho sakta hai), unme se ek ko primary chuna jaata hai.',
  why:'Every select, join and constraint later in this track is expressed in key terms: joins match foreign keys to primary keys; uniqueness bugs and orphan rows are key-model misunderstandings. Schema literacy is the single highest-leverage database skill.',
  when:'Sketch entities and keys before creating tables for any application (shop: customers, orders, order_items keyed as (order_id, product_id)). Prefer stable surrogate IDs for primary keys when natural identifiers can change (emails get updated; IDs should not).',
  syntax:'students(\n  student_id   INTEGER PRIMARY KEY,      -- unique badge per row\n  full_name    TEXT, TEXT NOT NULL UNIQUE,     -- candidate key\n  city         TEXT\n)\nenrolments(\n  student_id  INTEGER REFERENCES students(student_id),  -- foreign key\n  course_id   INTEGER REFERENCES courses(course_id),\n  PRIMARY KEY (student_id, course_id)    -- composite key\n)',
  comp:[['Primary key','Minimal unique, non-NULL identifier chosen for the table'],['Foreign key','Column(s) referencing another table\'s key; may repeat'],['Candidate key','Any minimal unique column set; one becomes the primary key']],
  ex:[
   {t:'Basic: one entity, one primary key',code:`-- PostgreSQL
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    full_name  TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    city       TEXT
);

INSERT INTO students VALUES
    (1, 'Diya Sharma', 'diya@example.com', 'Pune'),
    (2, 'Kabir Shah', 'kabir@example.com', 'Vadodara');

SELECT student_id, full_name, city FROM students ORDER BY student_id;`,out:` student_id |  full_name  |   city
------------+-------------+----------
          1 | Diya Sharma |   Pune
          2 | Kabir Shah  | Vadodara
(2 rows)`,why:'student_id is the primary key (unique, never NULL); email is also unique — a candidate key that was not chosen as primary. Attempting a second row with student_id 1 or the same email would be rejected.'},
   {t:'Intermediate: foreign keys link ranges of facts',code:`CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    title     TEXT NOT NULL
);

CREATE TABLE enrolments (
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    course_id  INTEGER NOT NULL REFERENCES courses(course_id),
    PRIMARY KEY (student_id, course_id)
);

INSERT INTO courses VALUES (101, 'Databases'), (102, 'Networks');
INSERT INTO enrolments VALUES (1, 101), (1, 102), (2, 101);

SELECT * FROM enrolments ORDER BY student_id, course_id;`,out:` student_id | course_id
------------+-----------
          1 |       101
          1 |       102
          2 |       101
(3 rows)`,why:'The composite primary key (student_id, course_id) enforces "a student enrols in a course at most once" while each column individually references its parent table. This resolving table is how many-to-many relationships are stored.'},
   {t:'Advanced: integrity refuses orphans and duplicate keys',code:`-- Attempt A: enrol a student who does not exist
INSERT INTO enrolments VALUES (99, 101);
-- ERROR: insert or update on table "enrolments" violates foreign key constraint

-- Attempt B: duplicate primary key
INSERT INTO students VALUES (1, 'Copy', 'copy@example.com', 'Surat');
-- ERROR: duplicate key value violates unique constraint "students_pkey"

-- Attempt C (allowed): a new course, then a valid enrolment
INSERT INTO courses VALUES (103, 'Operating Systems');
INSERT INTO enrolments VALUES (2, 103);
SELECT COUNT(*) AS enrolment_rows FROM enrolments;`,out:` enrolment_rows
----------------
              4
(1 row)`,why:'The failures are features: keys turn "we hope the data matches" into database-enforced truth. Only the valid sequence (insert parent first, then child) moved the count from 3 to 4.'}
  ],
  walk:[[3,'The table has ONE row per student: the column list declares the facts we keep and student_id as the row identity.','entity identified'],[5,'email is UNIQUE — a candidate key. Both student_id and email could single out a row.','two candidate keys'],[9,'Inserting two rows populates tuples; the PK values 1 and 2 can now be referenced from enrolments.','parents exist'],[13,'SELECT projects chosen columns, ordered by the key for stable reading.','2 rows shown']],
  walkWhy:'Modelling facts as rows identified by keys is the entire foundation: once parents have stable identities, child tables can reference them and every later join becomes key-matching.',
  rules:['Primary key columns are implicitly UNIQUE and NOT NULL; there is exactly one primary key per table (possibly composite).','Foreign key values must match an existing referenced key or be NULL (when the column allows it) — enforced on insert/update/delete.','Each cell holds one atomic value: no comma-lists of phone numbers (that violation is the 1NF lesson ahead).','Key choice: stable, never-changing values; surrogate INTEGER/BIGINT ids are the common default.'],
  mistakes:[
   {t:'Using a changeable natural value as the primary key',bad:'-- students keyed by email; Diya changes her email...\nUPDATE students SET email = \'new@example.com\' WHERE email = \'old@example.com\';\n-- every enrolment row referencing the old email now breaks / must cascade',why:'Primary keys are referenced from many places; mutating one forces updates everywhere and risks breaking external references (URLs, printed IDs).',fix:'-- surrogate key stays forever; email remains UNIQUE but editable\nstudent_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\nemail TEXT NOT NULL UNIQUE',tip:'Rule of thumb: keys are for the DATABASE to point with; business values (email/phone) are data that changes.'},
   {t:'Inserting child rows before their parents',bad:'INSERT INTO enrolments VALUES (5, 101);  -- student 5 not created yet\nINSERT INTO students VALUES (5, \'New\', \'n@example.com\', \'Surat\');',err:'ERROR: insert or update on table "enrolments" violates foreign key constraint "enrolments_student_id_fkey"',why:'Referential integrity is checked per statement (by default): at insert time, parent student 5 does not exist yet, sequence reversed = rejection.',fix:'INSERT INTO students VALUES (5, \'New\', \'n@example.com\', \'Surat\');\nINSERT INTO enrolments VALUES (5, 101);',tip:'Load order: parents first, children after — the same topologically sorted order migrations use.'}
  ],
  cmp:['Primary key vs foreign key vs candidate key',['Key type','Unique?','Purpose'],[['Primary','Yes, + NOT NULL','The row\'s official identity'],['Candidate (→ alternate)','Yes','Another valid identifier not chosen as primary'],['Foreign','No — repeats freely','References another table\'s key'],['Composite','The COMBINATION is unique','Junction tables e.g. (student, course)']]],
  diag:{kind:'join',joinType:'Keys & Referential Integrity',left:{name:'students (PK)',rows:['1 | Diya','2 | Kabir']},right:{name:'enrolments (FK)',rows:['1 | course 101','2 | course 101']},result:{name:'rule',rows:['every FK must exist as a PK','or the write is refused']}},
  apps:['College ERP: students/courses/enrolments exactly as modelled here.','E-commerce: orders reference customers; order_items composite-key orders to products.','Library systems: loans carry member_id and book_id foreign keys with due dates.'],
  quizzes:[{q:'Which statement about a foreign key column is correct?',options:['It must be unique in its table','Its values must exist in the referenced table (or be NULL if allowed)','It is automatically the primary key','It cannot repeat'],correct:1,why:'Foreign keys commonly repeat (many enrolments per student); their constraint is existence in the parent, not uniqueness.'},
            {q:'A table has unique columns email and student_id; student_id is the PRIMARY KEY. email is called a…',options:['Foreign key','Candidate/alternate key','Composite key','Superkey only, not a candidate'],correct:1,why:'Any minimal unique identifier is a candidate key; non-chosen ones are alternate keys (enforced via UNIQUE).'}],
  take:['Tables = one entity type; rows identified forever by a primary key.','Foreign keys reference parent keys; the database refuses orphans automatically.','Choose stable surrogate PKs; keep changeable business values as unique data.'],
  rev:'PK unique+NOT NULL, one per table (can be composite). FK references parent PK, repeats allowed. Candidate = any minimal unique set. Parents before children on insert.',
  assign:{p:'Design (as CREATE TABLE statements, PostgreSQL) tables authors(author_id PK, name) and books(book_id PK, title, author_id FK). Then insert author 1 and a book by her, and show a SELECT listing book titles with author ids.',s:`-- TODO: two CREATE TABLEs with PK/FK, two INSERTs (parent first), one SELECT`,sol:`CREATE TABLE authors (
    author_id INTEGER PRIMARY KEY,
    name      TEXT NOT NULL
);

CREATE TABLE books (
    book_id   INTEGER PRIMARY KEY,
    title     TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES authors(author_id)
);

INSERT INTO authors VALUES (1, 'Ruskin Bond');
INSERT INTO books VALUES (10, 'The Room on the Roof', 1);

SELECT book_id, title, author_id FROM books;`}
},
{
  id:'sql-create-table-constraints', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:2,
  title:'CREATE TABLE, Data Types & Constraints', desc:'Define schemas with precise types and protect data with NOT NULL, UNIQUE, CHECK and DEFAULT.',
  obj:['Choose column types (INTEGER, NUMERIC, TEXT, BOOLEAN, DATE/TIMESTAMP)','Apply NOT NULL, UNIQUE, CHECK, DEFAULT and identity columns','Note major dialect differences in auto-increment and boolean storage'],
  pre:['Relational model & keys'],
  outcomes:['Learner writes production-shaped DDL whose rules reject bad data at write time'],
  def:'CREATE TABLE defines a relation\'s columns, their data types and integrity constraints. NOT NULL forbids missing values, UNIQUE forbids duplicates, CHECK enforces row-level predicates, and DEFAULT supplies values when inserts omit columns. Identity/serial columns generate surrogate key values automatically.',
  simple:'Creating a table is writing the admission form rules for your data: which boxes exist (columns), what each box accepts (types — numbers in marks, dates in joined_on), which boxes are compulsory (NOT NULL), which answers must be one-of-a-kind (UNIQUE email), and sanity rules like marks between 0 and 100 (CHECK). Defaults pre-fill boxes the applicant skips, and an identity column is the token machine handing out fresh ID numbers automatically. Good constraints are free bodyguards: invalid rows are rejected at the door no matter which application (or careless script) tries to sneak them in.',
  hing:'CREATE TABLE matlab register ka format tay karna: kaunse column honge, kis type ka data jayega (marks me number, naam me TEXT), aur kya rules lagenge. NOT NULL matlab ye box khaali nahi chalega; UNIQUE matlab duplicate mana hai; CHECK custom sharth hai jaise marks 0 se 100 ke beech; DEFAULT matlab value na do to ye bhar jayegi (status = \'active\'). Auto-number wale ID ke liye GENERATED ALWAYS AS IDENTITY lagao — database khud 1,2,3 deta rahega. Dhyan Rahe dialect farak: PostgreSQL me purana tareeka SERIAL tha, MySQL me AUTO_INCREMENT, SQLite me INTEGER PRIMARY KEY apne aap number deta hai. Paise ke liye float kabhi mat use karna — NUMERIC(10,2) sahi hai kyunki float ghata-badhi kar deta hai!',
  why:'Constraints are the last line of defence that no application bug can bypass. Most "impossible" production data (negative prices, NULL emails, duplicate accounts) traces to schemas that politely accepted everything. Types also decide storage, comparisons, and arithmetic correctness (money!).',
  when:'Default every column to NOT NULL unless absence is meaningful; add CHECKs for numeric ranges/statuses; money = NUMERIC(p,2) never FLOAT; timestamps with time zone (TIMESTAMPTZ) for event times. Prefer standard identity syntax in modern PostgreSQL.',
  syntax:'CREATE TABLE products (\n    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    name       TEXT NOT NULL,\n    price      NUMERIC(10,2) NOT NULL CHECK (price >= 0),\n    stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),\n    created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);',
  comp:[['NOT NULL / UNIQUE','Presence and uniqueness enforcement per column(set)'],['CHECK (predicate)','Row must satisfy the boolean rule or the write is rejected'],['DEFAULT expr','Value used when an INSERT omits the column']],
  ex:[
   {t:'Basic: a strict products table (PostgreSQL)',code:`CREATE TABLE products (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       TEXT NOT NULL,
    price      NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

INSERT INTO products (name, price) VALUES ('Pen', 20.00);
INSERT INTO products (name, price, stock) VALUES ('Notebook', 80.50, 12);

SELECT * FROM products ORDER BY product_id;`,out:` product_id |   name   | price | stock
------------+----------+-------+-------
          1 | Pen      | 20.00 |     0
          2 | Notebook | 80.50 |    12
(2 rows)`,why:'The identity column generated 1 and 2 automatically; the first insert omitted stock so DEFAULT 0 applied. NUMERIC keeps 80.50 exact — binary floats cannot promise that.'},
   {t:'Intermediate: constraints rejecting bad rows',code:`-- Negative price violates the CHECK
INSERT INTO products (name, price) VALUES ('Free?', -5);
-- ERROR: new row for relation "products" violates check constraint

-- Missing name violates NOT NULL
INSERT INTO products (price) VALUES (10);
-- ERROR: null value in column "name" violates not-null constraint

CREATE TABLE accounts (
    account_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    status     TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'suspended', 'closed'))
);

INSERT INTO accounts (email) VALUES ('diya@example.com');
SELECT account_id, email, status FROM accounts;`,out:` account_id |      email       | status
------------+------------------+--------
          1 | diya@example.com | active
(1 row)`,why:'Each invalid insert is refused with a precise message naming the broken rule. The status CHECK restricts to an allowed vocabulary while DEFAULT spares callers from repeating the common case.'},
   {t:'Advanced: dialect differences for auto-numbering and booleans',code:`-- PostgreSQL (standard identity; older code uses SERIAL)
--   id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY

-- MySQL equivalent
--   id INT AUTO_INCREMENT PRIMARY KEY

-- SQLite equivalent (rowid alias auto-assigns)
--   id INTEGER PRIMARY KEY

-- Boolean storage:
--   PostgreSQL: BOOLEAN true/false
--   MySQL     : BOOLEAN is TINYINT(1) 0/1
--   SQLite    : no native type -> INTEGER 0/1 by convention

CREATE TABLE flags (
    flag_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT INTO flags DEFAULT VALUES;
SELECT * FROM flags;`,out:` flag_id | is_active
---------+-----------
       1 | t
(1 row)`,why:'The concepts port across engines; the spelling does not. Writing portable apps means isolating dialect DDL (migrations/frameworks) rather than sprinkling assumptions through queries.'}
  ],
  walk:[[2,'GENERATED ALWAYS AS IDENTITY makes product_id a database-fed sequence: inserts must NOT supply it.','auto IDs'],[4,'price NUMERIC(10,2) stores up to 8 integer digits with 2 exact decimals, with a CHECK forbidding negatives.','exact money + rule'],[5,'stock combines NOT NULL, DEFAULT 0 (fills omissions) and its own CHECK.','safe defaults'],[8,'The first INSERT names only (name, price): id came from identity, stock from DEFAULT — visible in the result as 1 and 0.','two mechanisms fired']],
  walkWhy:'DDL encodes policy once, centrally. Every application path — web form, batch import, manual SQL — inherits the same guarantees without duplicating validation.',
  rules:['Money and precise decimals belong in NUMERIC/DECIMAL, never FLOAT/REAL (binary rounding).','CHECK expressions see only the row being written (no subqueries in mainstream engines).','UNIQUE allows multiple NULLs in PostgreSQL (NULLs are distinct); behaviour differs subtly elsewhere — check your dialect.','Adding constraints to populated tables validates existing rows (PostgreSQL) and can fail until data is cleaned.'],
  mistakes:[
   {t:'Storing money in FLOAT columns',bad:'price DOUBLE PRECISION  -- 0.1 + 0.2 style rounding creeps into invoices',why:'Binary floating point cannot represent most decimal fractions exactly; totals drift by paise/cents and equality comparisons misfire — unacceptable in billing.',fix:'price NUMERIC(10,2) NOT NULL  -- exact decimal arithmetic',tip:'If it is denominated in currency, it is NUMERIC (or integer minor units). No exceptions.'},
   {t:'Making every column nullable "to be safe"',bad:'CREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,        -- nullable: orders by nobody?!\n  total NUMERIC(10,2)          -- nullable: bills for unknown amounts\n);',why:'Permissive schemas defer every question to application code; reports then drown in NULL-handling and impossible states (orders without customers) become representable.',fix:'customer_id INTEGER NOT NULL REFERENCES customers(customer_id),\ntotal NUMERIC(10,2) NOT NULL CHECK (total >= 0)',tip:'Ask of every column "is absence meaningful?" — default answer: NOT NULL.'}
  ],
  cmp:['Constraint toolkit',['Constraint','Rejects','Typical use'],[['NOT NULL','Missing values','Required fields everywhere'],['UNIQUE','Duplicates (NULLs special)','Emails, SKUs, usernames'],['CHECK','Rows failing a predicate','Ranges, status vocabularies'],['DEFAULT','— fills omissions','status, timestamps, counters']]],
  diag:{kind:'flow',start:'INSERT proposes a row',condition:'All constraints satisfied?',trueAction:'Row stored',falseAction:'Statement rejected with the broken rule named',end:'Guarantees hold for every writer'},
  apps:['Registration tables: UNIQUE email prevents duplicate accounts even under race conditions.', 'Inventory: stock CHECK >= 0 makes negative inventory unrepresentable.','Audit columns: created_at DEFAULT now() stamps every row uniformly.'],
  quizzes:[{q:'Why is NUMERIC(10,2) preferred over DOUBLE for prices?',options:['It is faster','Binary floats cannot store most decimal fractions exactly, causing paise-level drift','DOUBLE cannot be negative','NUMERIC allows text'],correct:1,why:'Exact decimal representation keeps sums/comparisons penny-perfect.'},
            {q:'An INSERT omits a column declared DEFAULT 0 NOT NULL. Result?',options:['NULL is stored','Error','0 is stored','Row is rejected unless DEFAULT removed'],correct:2,why:'The DEFAULT fills omissions before NOT NULL is evaluated, so 0 lands in the row.'}],
  take:['Types + constraints are database-enforced contracts; applications get them for free.','Money = NUMERIC, absence needs justification (default NOT NULL), vocabulary via CHECK/IN.','Auto-ID spelling varies by dialect (IDENTITY/SERIAL/AUTO_INCREMENT/SQLite rowid).'],
  rev:'CREATE TABLE + types. NOT NULL default stance. UNIQUE, CHECK ranges/sets, DEFAULT fills. IDENTITY auto PK. Money NUMERIC(10,2). Dialects differ.',
  assign:{p:'Create table movies(movie_id identity PK, title TEXT NOT NULL, rating NUMERIC(2,1) CHECK 0..10, watched BOOLEAN NOT NULL DEFAULT FALSE). Insert (title, rating) for "3 Idiots", 8.4 and select all columns. Mention in a comment what a rating of 12 would do.',s:`-- TODO: CREATE TABLE movies + one insert + select`,sol:`CREATE TABLE movies (
    movie_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title    TEXT NOT NULL,
    rating   NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 10),
    watched  BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO movies (title, rating) VALUES ('3 Idiots', 8.4);
-- A rating of 12 would violate the CHECK and be rejected.

SELECT movie_id, title, rating, watched FROM movies;`}
},
{
  id:'sql-crud-dml', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:4,
  title:'Changing Data: INSERT, UPDATE & DELETE', desc:'Add rows in bulk, modify precisely with WHERE, and delete safely — RETURNING included.',
  obj:['Insert single/multi rows and from SELECT results','Scope UPDATE/DELETE with WHERE and verify affected counts','Use RETURNING (PostgreSQL) to read back changed rows'],
  pre:['SELECT foundations','Constraints & keys'],
  outcomes:['Learner performs the full write lifecycle without accidental whole-table edits'],
  def:'Data Manipulation Language statements change table contents: INSERT adds rows, UPDATE modifies columns of rows matching a predicate, DELETE removes matching rows. Omitting WHERE on UPDATE/DELETE affects the entire table. PostgreSQL\'s RETURNING clause emits the affected rows as a result set.',
  simple:'INSERT, UPDATE and DELETE are the write-side verbs of SQL. INSERT slips new entries into the register — one at a time or a whole list in one statement. UPDATE corrects entries, and DELETE crosses them out; both are steered by the WHERE clause, your targeting scope. The single most expensive beginner accident in all of SQL is pressing run on UPDATE or DELETE with the WHERE forgotten — suddenly every row is edited or gone. Professionals make a ritual of running the matching SELECT with the same WHERE first to preview exactly which rows are in the blast radius, and only then firing the write.',
  hing:'INSERT naya data daalta hai, UPDATE purana sudhaarta hai, DELETE hatata hai. Teeno ke saath sabse zaroori baat hai WHERE — yehi tay karta hai ki kaunsi rows badlengi. WHERE bhoolna matlab PURI table par asar — ye SQL ki sabse mehengi galti hai jo asal companies me bhi ho chuki hai! Isse bachne ki professional aadat: pehle wahi WHERE lagakar SELECT chalao, dekho kaunsi rows aayengi, phir UPDATE/DELETE chalao. INSERT me ek saath kai rows daal sakte ho (VALUES (...), (...), (...)). PostgreSQL me RETURNING lagakar badli hui rows wahi dekh sakte ho. Aur DELETE row hatata hai par table rehti hai; TRUNCATE poori table khaali karta hai tezi se.',
  why:'All application state flows through these three statements. Their failure modes (mass update/delete, silent zero-row writes from wrong predicates) are catastrophic yet entirely preventable with preview-count discipline and transactions.',
  when:'Batch inserts in one statement (faster, atomic); update computed values with expressions (price = price * 1.1); prefer soft-delete flags (status) in audited systems; always preview writes with an equivalent SELECT/COUNT and wrap risky batches in transactions.',
  syntax:'INSERT INTO t (a, b) VALUES (1, \'x\'), (2, \'y\');\nUPDATE t SET b = \'z\', n = n + 1 WHERE a = 1;\nDELETE FROM t WHERE a = 2;\nUPDATE t SET n = n + 1 WHERE a = 1 RETURNING *;  -- PostgreSQL',
  comp:[['Column list in INSERT','Always name columns: order-independent and refactor-safe'],['WHERE predicate','Row scope for UPDATE/DELETE; absence means ALL rows'],['RETURNING *','Emits inserted/updated/deleted rows (PostgreSQL; SQLite 3.35+; not MySQL)']],
  ex:[
   {t:'Basic: batched inserts and a peek back',code:`CREATE TABLE tasks (
    task_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title   TEXT NOT NULL,
    done    BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tasks (title) VALUES
    ('Read chapter 4'),
    ('Solve exercises'),
    ('Revise JOINs');

SELECT task_id, title, done FROM tasks ORDER BY task_id;`,out:` task_id |      title      | done
---------+-----------------+------
       1 | Read chapter 4  | f
       2 | Solve exercises | f
       3 | Revise JOINs    | f
(3 rows)`,why:'One statement inserted three rows atomically; identity and the FALSE default filled the unspecified columns. INSERT reports "INSERT 0 3" in psql — 3 rows affected.'},
   {t:'Intermediate: targeted update with RETURNING',code:`UPDATE tasks
SET done = TRUE
WHERE task_id IN (1, 3)
RETURNING task_id, title, done;

UPDATE tasks
SET title = title || ' (priority)'
WHERE NOT done
RETURNING task_id, title;`,out:` task_id |     title      | done
---------+----------------+------
       1 | Read chapter 4 | t
       3 | Revise JOINs   | t
(2 rows)

 task_id |          title
---------+--------------------------
       2 | Solve exercises (priority)
(1 row)`,why:'WHERE task_id IN (1,3) scoped the first update to exactly two rows; RETURNING shows the new state without a follow-up SELECT. The second update uses the existing title in an expression to suffix only unfinished tasks.'},
   {t:'Advanced: preview-then-delete discipline',code:`-- Step 1: preview exactly what a DELETE using this WHERE would hit
SELECT task_id, title FROM tasks WHERE done;

-- Step 2: count agrees with expectations (2) -> proceed
DELETE FROM tasks WHERE done;

-- Step 3: verify survivors
SELECT task_id, title, done FROM tasks;`,out:` task_id |      title
---------+----------------
       1 | Read chapter 4
       3 | Revise JOINs
(2 rows)

DELETE 2

 task_id |           title            | done
---------+----------------------------+------
       2 | Solve exercises (priority) | f
(1 row)`,why:'The preview SELECT shares the DELETE\'s WHERE verbatim, so the 2-row blast radius was confirmed before destruction. DELETE 2 in the response corroborates the count — always read that number.'}
  ],
  walk:[[7,'A single multi-row VALUES list is one atomic statement: either all three tasks land or none does.','atomic batch'],[10,'Identity assigned 1, 2, 3 in insertion order; done defaulted FALSE per row.','generated columns filled'],[12,'The verification SELECT establishes the ground truth the later UPDATE/DELETE steps are measured against.','baseline known']],
  walkWhy:'Write statements are measured by affected-row counts at every step — insert 3, update 2, delete 2 — and professionals reconcile those counts against previews before moving on.',
  rules:['UPDATE/DELETE without WHERE affect EVERY row — the costliest typo in SQL; preview with the same predicate first.','Name INSERT columns explicitly; positional inserts break silently when schemas evolve.','A zero-row UPDATE/DELETE is NOT an error — always inspect the affected count (application drivers expose it).','TRUNCATE wipes a table fast and resets identity optionally (RESTART IDENTITY), but cannot have WHERE.'],
  mistakes:[
   {t:'The missing-WHERE mass update',bad:'UPDATE students SET city = \'Surat\';  -- intended one transfer student',why:'Without a predicate the statement is perfectly legal SQL — it simply re-homes every student in the institution. No constraint can object; only previews/transactions/backups stand between a typo and disaster.',fix:'-- preview first:\nSELECT COUNT(*) FROM students WHERE student_id = 42;  -- expect 1\nUPDATE students SET city = \'Surat\' WHERE student_id = 42;',tip:'Habit stack: SELECT-count → write → verify affected count. In psql, wrap experiments in BEGIN; ... ROLLBACK;'},
   {t:'Assuming a failed match raises an error',bad:'DELETE FROM tasks WHERE task_id = 999;  -- DELETE 0, no error',why:'Zero matching rows is a successful no-op. Application code that reports "deleted!" without checking the driver\'s affected-rows count lies to users when ids are wrong or already deleted.',fix:'-- check the command tag / driver rowCount; if 0, surface "not found"',tip:'Every UPDATE/DELETE in app code should branch on affected count: 0 = not found, 1 = expected, many = investigate.'}
  ],
  cmp:['DELETE vs TRUNCATE vs DROP',['Statement','Rows','Table stays?'],[['DELETE FROM t WHERE...','Chosen rows removed','Yes'],['TRUNCATE t','All rows, fast','Yes (empty)'],['DROP TABLE t','All rows','No — schema gone too'],['DELETE without WHERE','All rows (slow, logged)','Yes']]],
  diag:{kind:'flow',start:'Prepare write + WHERE',condition:'Preview count as expected?',trueAction:'Execute write; read affected count',falseAction:'Fix the predicate; do NOT run',end:'Verify with a follow-up SELECT'},
  apps:['Marking orders shipped (UPDATE ... WHERE status=... batch flows).','GDPR erasure: targeted DELETEs by user id with audit previews.','Seeding reference data with multi-row INSERTs in migrations.'],
  quizzes:[{q:'DELETE FROM tasks; (no WHERE) on a 500-row table results in…',options:['Syntax error','All 500 rows deleted, table remains empty','Only the first row deleted','Confirmation prompt'],correct:1,why:'WHERE is optional grammar: omission deliberately targets the whole table (contents, not schema).'},
            {q:'An UPDATE reports "UPDATE 0". Interpretation?',options:['The table is empty','No rows matched the WHERE — check the predicate/ids','It failed and rolled back','Zero is an error code'],correct:1,why:'Zero-row writes succeed silently; the count is the only signal that nothing matched.'}],
  take:['Preview the identical WHERE as a SELECT before any UPDATE/DELETE.','Batch INSERTs, name columns, and reconcile every affected-row count.','RETURNING (dialect permitting) verifies changed rows inline.'],
  rev:'INSERT multi-VALUES atomic. UPDATE/DELETE need WHERE (else all rows!). Affected count is gospel. RETURNING shows changed rows (PG/SQLite).',
  assign:{p:'With table scores(student TEXT, marks INTEGER) containing (Diya, 92), (Kabir, 55), (Meera, 61), write: (1) an UPDATE adding 5 grace marks only where marks < 60, (2) a DELETE removing rows below 40 after a preview SELECT, (3) final SELECT ordered by marks DESC. State expected Kabir marks (60) in a comment.',s:`-- TODO: create+seed scores, grace UPDATE, preview, DELETE, final SELECT`,sol:`CREATE TABLE scores (student TEXT PRIMARY KEY, marks INTEGER NOT NULL);
INSERT INTO scores VALUES ('Diya', 92), ('Kabir', 55), ('Meera', 61);

UPDATE scores SET marks = marks + 5 WHERE marks < 60;
-- Kabir becomes 60; Diya/Meera untouched

SELECT * FROM scores WHERE marks < 40;   -- preview: (0 rows)
DELETE FROM scores WHERE marks < 40;     -- DELETE 0 (safe no-op)

SELECT * FROM scores ORDER BY marks DESC;`}
},
{
  id:'sql-filtering-like-patterns', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:5,
  title:'Advanced Filtering: LIKE, IN, BETWEEN, DISTINCT & LIMIT', desc:'Pattern-match text, test sets and ranges, remove duplicates and page through results.',
  obj:['Use LIKE/ILIKE with % and _ wildcards correctly','Apply IN, BETWEEN, IS NULL and compound AND/OR with safe precedence','Shape outputs with DISTINCT, ORDER BY, LIMIT and OFFSET'],
  pre:['SELECT foundations'],
  outcomes:['Learner writes precise search-style queries for real datasets'],
  def:'Filter predicates decide row inclusion. LIKE pattern-matches text (% any run, _ single character; ILIKE is PostgreSQL\'s case-insensitive form). IN tests set membership, BETWEEN is an inclusive range, and IS NULL tests missingness (since = NULL is never true). DISTINCT collapses duplicate result rows; LIMIT/OFFSET page them deterministically only alongside ORDER BY.',
  simple:'Filters are the search box of SQL. LIKE lets you search with wildcards: \'A%\' means "starts with A", \'%pur\' means "ends with pur" (Jaipur!), and _ stands for exactly one unknown letter. IN is shorthand for a chain of ORs (city IN (\'Pune\',\'Goa\')), BETWEEN grabs an inclusive range, and IS NULL finds the blanks — remember, asking = NULL never matches anything because NULL means "unknown", and unknown-equals-unknown is itself unknown. DISTINCT removes repeated answer rows, and LIMIT with ORDER BY gives you tidy pages of results (without ORDER BY, "the first 10" is whatever the database feels like).',
  hing:'Filtering matlab chhaantna. LIKE me do wildcard hain: % matlab kitne bhi akshar (zero bhi chalega), _ matlab exactly ek akshar. \'A%\' A se shuru hone wale, \'%@gmail.com\' gmail wale emails. PostgreSQL me ILIKE case ko ignore karta hai (MySQL me LIKE aksar case-insensitive pehle se hota hai — dialect dhyan do!). IN (a, b, c) kai OR ki shortcut hai; BETWEEN dono kinaare jod ke range hai. Sabse bada dhokha: = NULL kabhi kaam nahi karta, khaali jagah dhundni ho to IS NULL likhna hoga. Duplicate hatane ke liye DISTINCT, aur pages ke liye ORDER BY + LIMIT/OFFSET — bina ORDER BY ke LIMIT ka koi bharosa nahi ki kaunsi rows aayengi!',
  why:'Search screens, report filters and data-quality checks are built from exactly these predicates. The subtleties — NULL comparisons, wildcard escaping, pagination stability — are where naive queries silently return wrong subsets.',
  when:'Use LIKE with a leading literal (index-friendly) when possible; IN for modest literal sets (or subqueries); IS NULL deliberately for optionality audits; DISTINCT when duplicates are structural (joins) rather than meaningful; always ORDER BY with LIMIT for pages (keyset pagination for large data).',
  syntax:'SELECT DISTINCT city FROM students\nWHERE city ILIKE \'%pur\'\n   OR marks BETWEEN 60 AND 90\nORDER BY city\nLIMIT 10 OFFSET 0;',
  comp:[['% and _','Any-length run / exactly one character in LIKE patterns'],['IS NULL / IS NOT NULL','The ONLY correct nullness tests (= NULL is UNKNOWN)'],['LIMIT + ORDER BY','Page size + deterministic order — inseparable in practice']],
  ex:[
   {t:'Basic: pattern searches over names and emails (PostgreSQL)',code:`CREATE TABLE learners (name TEXT, email TEXT, city TEXT);
INSERT INTO learners VALUES
    ('Diya Sharma',  'diya@gmail.com',  'Pune'),
    ('Divya Nair',   'divya@yahoo.in',  'Kochi'),
    ('Kabir Shah',   'kabir@gmail.com', 'Jaipur'),
    ('Meera Iyer',   'meera@gmail.com', 'Nagpur');

SELECT name FROM learners WHERE name LIKE 'Di%';
SELECT name FROM learners WHERE email LIKE '%@gmail.com';
SELECT name FROM learners WHERE city ILIKE '%PUR';`,out:`     name
-------------
 Diya Sharma
 Divya Nair
(2 rows)

     name
-------------
 Diya Sharma
 Kabir Shah
 Meera Iyer
(3 rows)

     name
-------------
 Kabir Shah
 Meera Iyer
(2 rows)`,why:'Prefix, suffix and contains patterns all use %. ILIKE makes %PUR match Jaipur/Nagpur regardless of case (PostgreSQL-specific spelling; portable code uses LOWER(city) LIKE \'%pur\').'},
   {t:'Intermediate: sets, ranges and NULL-aware filters',code:`CREATE TABLE applications (
    applicant TEXT,
    score     INTEGER,
    city      TEXT,
    referred_by TEXT
);
INSERT INTO applications VALUES
    ('Asha', 88, 'Pune',   'Diya'),
    ('Ravi', 57, 'Surat',  NULL),
    ('Sana', 73, 'Goa',    NULL),
    ('Vikram', 91, 'Pune',   'Kabir');

SELECT applicant FROM applications
WHERE city IN ('Pune', 'Goa') AND score BETWEEN 60 AND 90;

SELECT applicant FROM applications WHERE referred_by IS NULL;

SELECT COUNT(*) AS everyone FROM applications WHERE referred_by = NULL;`,out:` applicant
-----------
 Asha
 Sana
(2 rows)

 applicant
-----------
 Ravi
 Sana
(2 rows)

 everyone
----------
        0
(1 row)`,why:'IN + BETWEEN compose cleanly with AND. The final query proves the NULL rule: referred_by = NULL evaluates to UNKNOWN for every row, so zero rows qualify even though two referrals ARE missing — IS NULL is mandatory.'},
   {t:'Advanced: DISTINCT values and stable pagination',code:`SELECT DISTINCT city FROM applications ORDER BY city;

SELECT applicant, score
FROM applications
ORDER BY score DESC, applicant ASC
LIMIT 2 OFFSET 0;

SELECT applicant, score
FROM applications
ORDER BY score DESC, applicant ASC
LIMIT 2 OFFSET 2;`,out:` city
-------
 Goa
 Pune
 Surat
(3 rows)

 applicant | score
-----------+-------
 Vikram    |    91
 Asha      |    88
(2 rows)

 applicant | score
-----------+-------
 Sana      |    73
 Ravi      |    57
(2 rows)`,why:'DISTINCT collapsed the repeated Pune. The tie-breaking second sort key (applicant) makes page boundaries reproducible — without a total order, equal scores could migrate between pages across executions.'}
  ],
  walk:[[8,'LIKE \'Di%\' anchors at the start: Diya, Divya match; Kabir/Meera fail on the first character.','prefix pattern'],[9,'\'%@gmail.com\' allows anything before the literal domain, matching three of four rows.','suffix pattern'],[10,'ILIKE folds case before matching, so %PUR finds Jaipur and Nagpur (and would find PUR/pUr spellings).','case-insensitive']],
  walkWhy:'Patterns are anchored to the WHOLE string by definition — forgetting leading/trailing % is the classic reason a "contains" search mysteriously returns nothing.',
  rules:['LIKE patterns match entire strings: contains needs %x%, prefix x%, suffix %x.','Escape literal %/_ with backslash (or ESCAPE clause) when searching for them as data.','Comparisons with NULL yield UNKNOWN: use IS NULL/IS NOT NULL; remember NOT IN with a NULL in the list also yields no rows.','LIMIT without ORDER BY is nondeterministic; for meaningful pages include a unique tie-breaker.'],
  mistakes:[
   {t:'Filtering missing values with = NULL',bad:'SELECT * FROM applications WHERE referred_by = NULL;  -- always zero rows',why:'NULL represents unknown; unknown = unknown is UNKNOWN, and WHERE keeps only TRUE. The query is valid, fast, and eternally empty — a legendary silent bug.',fix:'SELECT * FROM applications WHERE referred_by IS NULL;',tip:'Any time you type = NULL or <> NULL, stop and rewrite with IS [NOT] NULL.'},
   {t:'Expecting LIMIT to imply an order',bad:'SELECT * FROM applications LIMIT 2;  -- two rows... which two?',why:'Relational tables are unordered sets; the engine may return rows in storage, index or parallel order, and the chosen pair can change after updates/vacuum/plan changes.',fix:'SELECT * FROM applications ORDER BY score DESC, applicant LIMIT 2;',tip:'LIMIT has a silent partner requirement: a total ORDER BY (with tie-breaker) for reproducibility.'}
  ],
  cmp:['Predicate shoppers guide',['Need','Predicate','Inclusive?'],[['Exact list of values','IN (v1, v2, ...)','—'],['Numeric/date range','BETWEEN a AND b','Both ends included'],['Text pattern','LIKE / ILIKE with % _','Whole-string match'],['Missing data','IS NULL','Only correct test']]],
  diag:{kind:'flow',start:'All rows',condition:'Predicate is TRUE?',trueAction:'Row survives WHERE',falseAction:'FALSE or UNKNOWN → row dropped',end:'DISTINCT, ORDER BY, LIMIT shape the output'},
  apps:['Admin search boxes mapping to ILIKE %term% across name/email columns.','Cohort reports: city IN (...) AND score BETWEEN windows.','Data hygiene dashboards listing records with IS NULL gaps to backfill.'],
  quizzes:[{q:'Which pattern matches names ENDING in "sharma" (any case, PostgreSQL)?',options:['LIKE \'sharma%\'','ILIKE \'%sharma\'','LIKE \'%sharma%\'','= \'sharma\''],correct:1,why:'Suffix anchoring puts % at the front only; ILIKE covers case variants. %x% would over-match middles.'},
            {q:'SELECT ... WHERE city NOT IN (\'Pune\', NULL) returns how many rows?',options:['All non-Pune rows','Zero rows — NULL poisons NOT IN','Only Pune rows','Error'],correct:1,why:'x NOT IN (..., NULL) becomes NOT (x=\'Pune\' OR x=NULL→UNKNOWN) washing out to UNKNOWN for non-Pune rows: nothing qualifies — filter the NULL out of the list.'}],
  take:['Wildcard discipline: % any run, _ one char, anchor maths matters.','NULL never equals: IS NULL only; beware NOT IN + NULL.','DISTINCT removes dup rows; ORDER BY + tie-breaker makes LIMIT pages meaningful.'],
  rev:'LIKE %/_ whole-string; ILIKE (PG) case-free. IN set, BETWEEN inclusive. IS [NOT] NULL. DISTINCT dedupes output. LIMIT requires ORDER BY.',
  assign:{p:'From learners(name,email,city) of the lesson, write one query: names of learners whose email ends with @gmail.com AND whose city does NOT end with pur (case-insensitive), ordered by name. Then a second query listing DISTINCT cities.',s:`-- TODO: gmail AND not-pur filter; distinct cities`,sol:`SELECT name
FROM learners
WHERE email LIKE '%@gmail.com'
  AND city NOT ILIKE '%pur'
ORDER BY name;

SELECT DISTINCT city FROM learners ORDER BY city;`}
},
{
  id:'sql-case-conditional-aggregation', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:7,
  title:'CASE Expressions & Conditional Aggregation', desc:'Bucket rows into labels and compute per-category counts/sums in a single scan.',
  obj:['Write searched and simple CASE expressions with ELSE discipline','Combine CASE with COUNT/SUM for one-pass pivot-style summaries','Use COALESCE to present reader-friendly defaults'],
  pre:['Aggregate basics from JOINs topic (COUNT/SUM/GROUP BY preview)','Filtering'],
  outcomes:['Learner produces dashboard-ready categorical summaries without multiple queries'],
  def:'CASE is SQL\'s conditional expression: WHEN clauses are tested in order and the first true branch\'s value is returned (ELSE covers the remainder; absent ELSE yields NULL). Placed inside aggregate functions (COUNT/SUM) it yields conditional aggregation — multiple category metrics from one table scan.',
  simple:'CASE is SQL\'s if-else ladder living inside a SELECT. It reads top to bottom: WHEN marks >= 90 THEN \'A\' WHEN marks >= 60 THEN \'B\' ELSE \'C\' — first true condition wins, so order matters exactly like Python/Java ladders. The superpower appears when CASE hides inside COUNT or SUM: instead of running five separate queries for "how many A, how many B...", one pass computes them all side by side, which is how real dashboards summarise crores of rows efficiently. Its best friend COALESCE(a, b) means "use a unless it is NULL, then b" — perfect for showing 0 or \'Not provided\' instead of blanks.',
  hing:'CASE SQL ka if-else hai jo SELECT ke andar rehta hai. WHEN shartein upar se neeche check hoti hain, jo pehli sach — wahi jawab. Isiliye sabse specific shart pehle rakho (marks>=90 wali pehle, warna >=40 wali sabko kha jayegi). Asli jaadu tab hota hai jab CASE ko COUNT/SUM ke andar ghusa do — ek hi query me pass kitne, fail kitne, dono pata chal jayenge (conditional aggregation). COUNT(CASE WHEN ... THEN 1 END) trick yaad rakho: shart jhooti ho to NULL aata hai aur COUNT use ginta hi nahi. Aur COALESCE(col, \'default\') NULL ki jagah apni pasand ki value dikhata hai. ELSE lagana mat bhoolna, warna bina match wali rows chup-chaap NULL ban jayengi!',
  why:'Bucketing (age bands, grade labels, churn segments) and one-scan category metrics are bread-and-butter analytics. Conditional aggregation replaces sprinkle-of-queries reports with set-based single passes that stay fast as tables grow.',
  when:'Use CASE in SELECT for display labels/buckets, in aggregates for pivot-like metrics, and in ORDER BY for custom orderings (status priority). Keep branch order strict-to-loose and always decide the ELSE deliberately.',
  syntax:'CASE\n  WHEN marks >= 90 THEN \'A\'\n  WHEN marks >= 60 THEN \'B\'\n  ELSE \'C\'\nEND AS grade\n\nCOUNT(CASE WHEN marks >= 40 THEN 1 END) AS passed',
  comp:[['Searched CASE','WHEN <any predicate> THEN ... — first true wins'],['Simple CASE','CASE col WHEN value THEN ... — equality dispatch'],['Conditional aggregate','Aggregate over CASE-filtered contributions (NULLs skipped)']],
  ex:[
   {t:'Basic: labelling rows with CASE',code:`CREATE TABLE results (student TEXT, marks INTEGER);
INSERT INTO results VALUES
    ('Diya', 92), ('Kabir', 57), ('Meera', 74), ('Aarav', 38);

SELECT student, marks,
       CASE
           WHEN marks >= 90 THEN 'A'
           WHEN marks >= 60 THEN 'B'
           WHEN marks >= 40 THEN 'C'
           ELSE 'Fail'
       END AS grade
FROM results
ORDER BY marks DESC;`,out:` student | marks | grade
---------+-------+-------
 Diya    |    92 | A
 Meera   |    74 | B
 Kabir   |    57 | C
 Aarav   |    38 | Fail
(4 rows)`,why:'Branches test high-to-low, so 92 lands in the A arm rather than B: the FIRST true WHEN wins. CASE contributes a computed column per row without changing stored data.'},
   {t:'Intermediate: one-scan conditional aggregates',code:`SELECT
    COUNT(*)                                        AS total,
    COUNT(CASE WHEN marks >= 40 THEN 1 END)         AS passed,
    COUNT(CASE WHEN marks < 40 THEN 1 END)          AS failed,
    ROUND(100.0 * COUNT(CASE WHEN marks >= 40 THEN 1 END) / COUNT(*), 1)
                                                    AS pass_pct,
    SUM(CASE WHEN marks >= 90 THEN 1 ELSE 0 END)    AS a_grades
FROM results;`,out:` total | passed | failed | pass_pct | a_grades
-------+--------+--------+----------+----------
     4 |      3 |      1 |     75.0 |        1
(1 row)`,why:'COUNT ignores the NULLs CASE yields for non-matching rows, counting only contributions of 1. SUM(...THEN 1 ELSE 0) is the same idea written arithmetically. One scan produced five dashboard numbers.'},
   {t:'Advanced: grouped matrix + COALESCE presentation',code:`CREATE TABLE sales (region TEXT, channel TEXT, amount NUMERIC(10,2));
INSERT INTO sales VALUES
    ('West', 'online', 1200.00), ('West', 'store', 800.00),
    ('West', 'online', 300.00),  ('East', 'store', 950.00),
    ('East', 'online', NULL);

SELECT region,
       SUM(CASE WHEN channel = 'online' THEN COALESCE(amount, 0) ELSE 0 END) AS online_total,
       SUM(CASE WHEN channel = 'store'  THEN COALESCE(amount, 0) ELSE 0 END) AS store_total,
       COUNT(*) AS rows_seen
FROM sales
GROUP BY region
ORDER BY region;`,out:` region | online_total | store_total | rows_seen
--------+--------------+-------------+-----------
 East   |         0.00 |      950.00 |         2
 West   |      1500.00 |      800.00 |         3
(2 rows)`,why:'GROUP BY region plus per-channel conditional SUMs creates a small pivot. COALESCE(amount, 0) turns the East online NULL into an explicit 0 contribution so the cell reads 0.00 instead of vanishing.'}
  ],
  walk:[[5,'For Diya (92): WHEN marks>=90 is immediately true, CASE yields A and skips all later arms.','first match wins'],[6,'Meera (74) fails >=90, satisfies >=60 → B. The descending threshold order is what routes each score uniquely.','cascade evaluation'],[8,'Aarav (38) fails every WHEN; ELSE catches him with Fail rather than leaving NULL.','ELSE as safety net']],
  walkWhy:'CASE evaluates like the if-ladders you already know, per row, inside the query — making it the bridge between row logic and aggregate analytics.',
  rules:['Branch order is semantic: put narrow conditions before broad ones or the broad ones swallow rows.','Omitting ELSE yields NULL for unmatched rows — sometimes desired, usually a latent bug.','All THEN/ELSE arms should return compatible types; engines coerce or error (PostgreSQL requires a resolvable common type).','CASE works anywhere an expression does: SELECT, WHERE (rare), GROUP BY, ORDER BY, inside aggregates.'],
  mistakes:[
   {t:'Broad condition placed first swallows specific bands',bad:'CASE WHEN marks >= 40 THEN \'Pass\'\n     WHEN marks >= 90 THEN \'Distinction\'  -- unreachable\n     ELSE \'Fail\' END',why:'Every distinction-scorer satisfies >=40 first, so the Distinction band reports zero forever. The SQL runs happily — only the business numbers are fictional.',fix:'CASE WHEN marks >= 90 THEN \'Distinction\'\n     WHEN marks >= 40 THEN \'Pass\'\n     ELSE \'Fail\' END',tip:'Write bands from rarest/strictest to loosest; mentally run a boundary value (95, 40) down the ladder before executing.'},
   {t:'Counting with COUNT(CASE ... ELSE 0 END)',bad:'COUNT(CASE WHEN marks >= 40 THEN 1 ELSE 0 END) AS passed  -- counts EVERY row',why:'COUNT(any non-NULL) counts it — and 0 is not NULL. The ELSE 0 variant therefore tallies all rows, looking superficially reasonable while being wrong. The NULL-yielding form is essential with COUNT.',fix:'COUNT(CASE WHEN marks >= 40 THEN 1 END)          -- NULLs skipped\n-- or\nSUM(CASE WHEN marks >= 40 THEN 1 ELSE 0 END)      -- arithmetic style',tip:'Pairing rule: COUNT + no ELSE (NULL), SUM + ELSE 0. Never cross them.'}
  ],
  cmp:['Simple vs searched CASE',['Form','Syntax seed','Can express ranges?'],[['Simple','CASE status WHEN \'active\' THEN ...','No — equality only'],['Searched','CASE WHEN marks >= 90 THEN ...','Yes — any predicates'],['Missing ELSE','NULL for unmatched','NULL for unmatched'],['In aggregates','Both work','Both work']]],
  diag:{kind:'flow',start:'Row enters CASE',condition:'First true WHEN?',trueAction:'Yield that arm\'s value',falseAction:'ELSE value (or NULL if omitted)',end:'Optional: aggregate the outcomes'},
  apps:['Grade/band labelling in result sheets and leaderboards.','Single-query dashboards: pass/fail/A-count style metric tiles.','Region × channel mini-pivots for sales reporting.'],
  quizzes:[{q:'COUNT(CASE WHEN marks>=40 THEN 1 ELSE 0 END) over 10 rows (6 passing) returns…',options:['6','10','4','NULL'],correct:1,why:'COUNT counts every non-NULL result — the ELSE 0 arm is non-NULL too, so all 10 rows count. Drop the ELSE (or use SUM).'},
            {q:'CASE WHEN a>10 THEN \'big\' WHEN a>5 THEN \'mid\' END with a=20 returns…',options:['mid','big','NULL','Error'],correct:1,why:'First true WHEN wins in declaration order: a>10 is checked (and taken) before a>5.'}],
  take:['Order WHEN arms strict-to-loose; always decide ELSE deliberately.','COUNT packs with no-ELSE CASE; SUM packs with ELSE 0 — the conditional-aggregation pair.','COALESCE turns NULLs into reader-friendly defaults at presentation time.'],
  rev:'CASE WHEN..THEN..ELSE..END first-match. In aggregates: COUNT(CASE..THEN 1 END), SUM(CASE..THEN x ELSE 0). COALESCE(a,b) first non-NULL.',
  assign:{p:'On results(student,marks) from the lesson, write one query returning: distinction count (marks>=75), first_class (60-74), others (<60) using conditional aggregation. Then a second query labelling each student with the same bands via CASE.',s:`-- TODO: one aggregate query + one per-row CASE query on results`,sol:`SELECT
    COUNT(CASE WHEN marks >= 75 THEN 1 END) AS distinction,
    COUNT(CASE WHEN marks >= 60 AND marks < 75 THEN 1 END) AS first_class,
    COUNT(CASE WHEN marks < 60 THEN 1 END) AS others
FROM results;

SELECT student, marks,
       CASE
           WHEN marks >= 75 THEN 'Distinction'
           WHEN marks >= 60 THEN 'First class'
           ELSE 'Others'
       END AS band
FROM results
ORDER BY marks DESC;`}
},
{
  id:'sql-subqueries', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:8,
  title:'Subqueries: Scalar, IN & EXISTS', desc:'Nest queries inside queries to compare against computed values and related rows.',
  obj:['Use scalar subqueries for single-value comparisons (averages, max)','Filter with IN (subquery) and correlated EXISTS','Avoid NOT IN + NULL traps by choosing NOT EXISTS'],
  pre:['JOINs','Aggregates & CASE'],
  outcomes:['Learner answers "compared to what?" questions natively in SQL'],
  def:'A subquery is a SELECT nested inside another statement. Scalar subqueries return one value for comparison; IN-subqueries return a set for membership; EXISTS tests row existence and may be correlated (referencing outer-row columns, re-evaluated per row).',
  simple:'Subqueries are questions inside questions. "Show students scoring above the CLASS AVERAGE" cannot be answered in one breath — first compute the average (inner question), then compare each student against it (outer question). SQL lets you nest them so the database does both steps: WHERE marks > (SELECT AVG(marks) FROM results). IN asks a set-membership question ("whose city appears in this other computed list?"), and EXISTS asks "does a related row exist at all?" — for example, students who have at least one enrolment. EXISTS can peek at the outer row being tested (called correlated), like asking about each student one by one.',
  hing:'Subquery matlab sawal ke andar sawal. "Class average se zyada laane wale students" — pehle average nikalo (andar wala sawal), phir har student ko usse tolna hai (bahar wala). SQL me ye aise judta hai: WHERE marks > (SELECT AVG(marks) FROM results). IN wala subquery ek list banata hai jisse membership check hoti hai. EXISTS sirf "kya aisi row hai bhi ya nahi" poochta hai — related record ki maujoodgi jaanna. Jab andar wala sawal bahar wali row ki value use kare (har student ke liye alag chale) to use correlated subquery kehte hain. Ek bada khatra: NOT IN ke andar wali list me NULL aa jaye to poora result khaali ho jata hai — iska ilaaj NOT EXISTS hai!',
  why:'Comparative questions (above average, highest in group, customers who never ordered) are how analysts actually talk. Subqueries express them directly without application round-trips, and EXISTS/NOT EXISTS provide NULL-safe anti-membership that NOT IN cannot.',
  when:'Scalar subquery for a single benchmark value; IN for set membership from a computed list; EXISTS for presence (especially correlated) and NOT EXISTS for "never happened" questions. JOINs often replace IN for performance/readability — know how to convert.',
  syntax:'SELECT * FROM results\nWHERE marks > (SELECT AVG(marks) FROM results);\n\nSELECT * FROM students s\nWHERE EXISTS (\n    SELECT 1 FROM enrolments e WHERE e.student_id = s.student_id\n);',
  comp:[['Scalar subquery','Exactly one row/column: usable with =, >, < comparisons'],['IN (SELECT ...)','Membership in a computed set (NULL semantics apply)'],['EXISTS / NOT EXISTS','Row-existence test; NULL-safe anti-join alternative to NOT IN']],
  ex:[
   {t:'Basic: above-average via scalar subquery',code:`CREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);
INSERT INTO results VALUES
    ('Diya', 'Maths', 92), ('Diya', 'Science', 85),
    ('Kabir', 'Maths', 57), ('Kabir', 'Science', 49),
    ('Meera', 'Maths', 74);

SELECT ROUND(AVG(marks), 1) AS class_avg FROM results;

SELECT student, subject, marks
FROM results
WHERE marks > (SELECT AVG(marks) FROM results)
ORDER BY marks DESC;`,out:` class_avg
-----------
      71.4
(1 row)

 student | subject | marks
---------+---------+-------
 Diya    | Maths   |    92
 Diya    | Science |    85
 Meera   | Maths   |    74
(3 rows)`,why:'The scalar subquery computes 71.4 once; the outer filter compares each row against it. A scalar subquery returning more than one row would be an error — single-value intent is enforced.'},
   {t:'Intermediate: IN-subquery vs JOIN equivalence',code:`CREATE TABLE students (student_id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE enrolments (student_id INTEGER, course_id INTEGER);
INSERT INTO students VALUES (1, 'Diya'), (2, 'Kabir'), (3, 'Meera');
INSERT INTO enrolments VALUES (1, 101), (1, 102), (3, 101);

SELECT name FROM students
WHERE student_id IN (SELECT student_id FROM enrolments WHERE course_id = 101)
ORDER BY name;

SELECT DISTINCT s.name
FROM students s
JOIN enrolments e ON e.student_id = s.student_id
WHERE e.course_id = 101
ORDER BY s.name;`,out:` name
-------
 Diya
 Meera
(2 rows)

 name
-------
 Diya
 Meera
(2 rows)`,why:'Both forms answer identically here. Note the JOIN version needed DISTINCT because a student in two listed courses would otherwise appear twice — membership (IN) semantics never duplicate outer rows.'},
   {t:'Advanced: NOT EXISTS for "never happened" (NULL-safe)',code:`SELECT name
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM enrolments e
    WHERE e.student_id = s.student_id
);

INSERT INTO enrolments VALUES (NULL, 101);

SELECT name FROM students
WHERE student_id NOT IN (SELECT student_id FROM enrolments);`,out:` name
-------
 Kabir
(1 row)

 name
------
(0 rows)`,why:'Kabir truly has no enrolments, correctly reported by NOT EXISTS (correlated per student). After inserting a NULL student_id, NOT IN collapses to zerorows: for each outer id, comparison against the NULL member makes the whole NOT-UNKNOWN. This asymmetry is why NOT EXISTS is the professional default for anti-membership.'}
  ],
  walk:[[7,'Run standalone, the inner query returns ONE value 71.4 — exactly the contract a scalar subquery must fulfil.','benchmark = 71.4'],[9,'The outer SELECT begins scanning results with the benchmark in hand.','comparison mode'],[11,'Each row\'s marks are compared to 71.4; Diya(92/85) and Meera(74) pass, both of Kabir\'s fail.','3 rows qualify']],
  walkWhy:'Decomposition is the skill: name the benchmark/set/existence question first, verify it alone, then embed it. Debuggable subqueries are built inside-out.',
  rules:['Scalar subqueries MUST return at most one row of one column or the statement errors at runtime.','Correlated subqueries reference outer columns and conceptually re-run per outer row (planners may optimise).','NOT IN against any list containing NULL returns no rows (UNKNOWN logic) — use NOT EXISTS for anti-membership.','EXISTS ignores the inner SELECT list; SELECT 1 is the convention.'],
  mistakes:[
   {t:'NOT IN wiped out by a NULL in the subquery',bad:'SELECT * FROM students\nWHERE student_id NOT IN (SELECT student_id FROM enrolments);\n-- enrolments has one NULL student_id -> zero rows, always',why:'student_id NOT IN (1, 3, NULL) unfolds to id<>1 AND id<>3 AND id<>NULL; the last term is UNKNOWN, contaminating the conjunction for candidates like 2. The report says nobody is unenrolled even though Kabir is.',fix:'SELECT * FROM students s\nWHERE NOT EXISTS (\n  SELECT 1 FROM enrolments e WHERE e.student_id = s.student_id\n);',tip:'Anti-membership ("has no related rows") = NOT EXISTS, every time. NOT IN is safe only with guaranteed NOT NULL lists.'},
   {t:'Scalar subquery that returns many rows',bad:'SELECT * FROM results\nWHERE marks = (SELECT marks FROM results WHERE subject = \'Maths\');',err:'ERROR: more than one row returned by a subquery used as an expression',why:'= demands a single value, but three Maths rows exist. The intent was probably membership (IN) or an aggregate benchmark (MAX).',fix:'WHERE marks IN (SELECT marks FROM results WHERE subject = \'Maths\')\n-- or for the topper specifically:\nWHERE marks = (SELECT MAX(marks) FROM results WHERE subject = \'Maths\')',tip:'Match operator to cardinality: =/> scalar only; IN for sets; aggregates to force one value.'}
  ],
  cmp:['IN vs EXISTS (typical guidance)',['Aspect','IN (subquery)','EXISTS (correlated)'],[['Question','Value in computed set?','Related row exists?'],['Duplicates of outer rows','Never','Never'],['NULL behaviour','NOT IN is NULL-toxic','NULL-safe both ways'],['Reads best as','One-column set list','Relationship presence']]],
  diag:{kind:'join',note:'The inner query produces a value/set/existence the outer query consumes.'},
  apps:['Above-average / top-performer lists for grade analytics.','Customers with no orders (NOT EXISTS) for win-back campaigns.','Products priced above their category average via correlated scalar subqueries.'],
  quizzes:[{q:'Why does NOT IN return zero rows when the subquery list contains a NULL?',options:['Syntax restriction','Every candidate comparison chain hits UNKNOWN against NULL, so no row is definitively NOT IN','NULL sorts first','It is a PostgreSQL bug'],correct:1,why:'Three-valued logic: id <> NULL is UNKNOWN, and AND with UNKNOWN cannot be TRUE, disqualifying all candidates. NOT EXISTS avoids the trap.'},
            {q:'A scalar subquery used with > must return…',options:['Many rows','Exactly zero or one row of one column','Any table','Only integers'],correct:1,why:'Scalar comparison needs a single value; more than one row raises a runtime error.'}],
  take:['Build subqueries inside-out: verify the inner value/set alone first.','Scalar for benchmarks, IN for set membership, EXISTS for presence.','NOT EXISTS is the NULL-safe anti-membership; NOT IN is a trap with nullable lists.'],
  rev:'Scalar: single value (AVG/MAX). IN: set membership. EXISTS: correlated presence; NOT EXISTS for never-happened. NOT IN + NULL = empty.',
  assign:{p:'On results(student,subject,marks) from this lesson, write: (1) students with a Maths mark above the overall Maths average (correlated not needed), (2) a NOT EXISTS query listing students (in a copied students table of Diya/Kabir/Meera names) who have NO Science row in results.',s:`-- TODO: scalar-subquery query + NOT EXISTS query`,sol:`SELECT student, marks
FROM results
WHERE subject = 'Maths'
  AND marks > (SELECT AVG(marks) FROM results WHERE subject = 'Maths');

CREATE TABLE class_list (name TEXT PRIMARY KEY);
INSERT INTO class_list VALUES ('Diya'), ('Kabir'), ('Meera');

SELECT name FROM class_list c
WHERE NOT EXISTS (
    SELECT 1 FROM results r
    WHERE r.student = c.name AND r.subject = 'Science'
);`}
},
{
  id:'sql-ctes', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:9,
  title:'Common Table Expressions (WITH / CTEs)', desc:'Name intermediate result sets to compose readable, step-by-step queries — including recursion.',
  obj:['Write single and chained WITH clauses replacing nested subqueries','Use CTEs for aggregation-then-comparison patterns','Read a recursive CTE (WITH RECURSIVE) structure'],
  pre:['Subqueries','Aggregates'],
  outcomes:['Learner structures complex analytics into named, testable steps'],
  def:'A common table expression defines a temporary named result set usable by the following statement: WITH name AS (SELECT ...) main_query. Multiple CTEs chain with commas, later ones referencing earlier ones. WITH RECURSIVE adds a self-referencing UNION ALL step for hierarchies and sequences.',
  simple:'A CTE is giving a nickname to a halfway answer. Instead of one enormous query with subqueries buried like Russian dolls, you write steps: WITH per_student AS (averages computed...) SELECT ... FROM per_student WHERE avg > 80. Readers can check each named step alone, and you can reuse a step twice without repeating it. Chained CTEs read like a recipe — mix this, filter that, serve. The exotic cousin, WITH RECURSIVE, can even walk family trees (manager → report → report...) or generate number series by repeatedly adding one row based on the previous.',
  hing:'CTE matlab query ke beech ke hisse ko naam dekar step-by-step likhna. Bade nested subquery ke jaal ki jagah: WITH avg_marks AS (SELECT ... AVG ...) phir main query me us naam se kaam karo — jaise ek temporary table ho. Kai steps ko comma se jod sakte ho, pichhle step ka result agle me use hoga — bilkul recipe ki tarah padho. Ek fayda: ek step ko debug karna ho to usi ko alag chalake dekh lo. WITH RECURSIVE uska advanced roop hai jo tree jaise data (boss → team → unki team) ko ghum sakta hai aur series bhi bana sakta hai. dhyan Rahe: CTE sirf usi ek query ke liye hota hai, database me save nahi hota (uske liye VIEW hai, agla topic).',
  why:'Readability is a correctness feature: multi-stage analytics (aggregate → compare → rank) fail silently when buried in nested subqueries. Named steps make queries reviewable, and recursive CTEs unlock hierarchy questions impossible for plain joins.',
  when:'Reach for WITH when a subquery is reused, deeply nested, or when a query has natural stages. Keep simple two-liners as plain SELECTs. Recursive CTEs for org charts, category trees and generated series — guard their termination conditions carefully.',
  syntax:'WITH per_student AS (\n    SELECT student, AVG(marks) AS avg_marks\n    FROM results GROUP BY student\n),\ntoppers AS (\n    SELECT * FROM per_student WHERE avg_marks >= 80\n)\nSELECT * FROM toppers ORDER BY avg_marks DESC;',
  comp:[['WITH name AS (...)','Named intermediate result for the ONE following statement'],['Chained CTEs','Comma-separated; later steps may reference earlier names'],['WITH RECURSIVE','Anchor member + UNION ALL + recursive member for trees/series']],
  ex:[
   {t:'Basic: replacing a nested subquery with a named step',code:`CREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);
INSERT INTO results VALUES
    ('Diya', 'Maths', 92), ('Diya', 'Science', 85),
    ('Kabir', 'Maths', 57), ('Kabir', 'Science', 49),
    ('Meera', 'Maths', 74), ('Meera', 'Science', 95);

WITH per_student AS (
    SELECT student, ROUND(AVG(marks), 1) AS avg_marks
    FROM results
    GROUP BY student
)
SELECT student, avg_marks
FROM per_student
WHERE avg_marks >= 80
ORDER BY avg_marks DESC;`,out:` student | avg_marks
---------+-----------
 Diya    |      88.5
 Meera   |      84.5
(2 rows)`,why:'Filtering on an aggregate cannot happen in WHERE of the same SELECT (HAVING aside); naming the grouped result first gives the outer query a clean table to filter with ordinary WHERE and reusable columns.'},
   {t:'Intermediate: chained CTEs — aggregate, benchmark, compare',code:`WITH per_student AS (
    SELECT student, AVG(marks) AS avg_marks
    FROM results
    GROUP BY student
),
class_stats AS (
    SELECT AVG(avg_marks) AS class_mean FROM per_student
)
SELECT p.student,
       ROUND(p.avg_marks, 1) AS student_avg,
       ROUND(c.class_mean, 1) AS class_mean,
       CASE WHEN p.avg_marks >= c.class_mean THEN 'above' ELSE 'below' END AS standing
FROM per_student p
CROSS JOIN class_stats c
ORDER BY p.avg_marks DESC;`,out:` student | student_avg | class_mean | standing
---------+-------------+------------+----------
 Diya    |        88.5 |       75.3 | above
 Meera   |        84.5 |       75.3 | above
 Kabir   |        53.0 |       75.3 | below
(3 rows)`,why:'Each stage consumes the previous name. The single-row class_stats cross-joins the benchmark onto every student row — a reusable pattern for vs-average dashboards, all readable top-to-bottom.'},
   {t:'Advanced: recursive CTE walking an org chart',code:`CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES
    (1, 'Asha (CEO)', NULL),
    (2, 'Ravi', 1), (3, 'Sana', 1),
    (4, 'Vikram', 2), (5, 'Tara', 2);

WITH RECURSIVE org AS (
    SELECT emp_id, name, manager_id, 0 AS depth
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    SELECT e.emp_id, e.name, e.manager_id, o.depth + 1
    FROM employees e
    JOIN org o ON e.manager_id = o.emp_id
)
SELECT emp_id, name, depth FROM org ORDER BY depth, emp_id;`,out:` emp_id |    name    | depth
--------+------------+-------
      1 | Asha (CEO) |     0
      2 | Ravi       |     1
      3 | Sana       |     1
      4 | Vikram     |     2
      5 | Tara       |     2
(5 rows)`,why:'The anchor picks the root(s); each recursive pass joins the next layer down (manager_id = previous emp_id) and increments depth, stopping when no new rows match. Plain joins cannot express unknown-depth traversal like this.'}
  ],
  walk:[[8,'The CTE computes one row per student with their average — conceptually a result table named per_student.','3 averaged rows'],[13,'The main query treats per_student exactly like a table, filtering its derived column avg_marks.','Asha-two-stage logic'],[14,'Only Diya (88.5) and Meera (84.5) pass the 80 bar; Kabir (53.0) drops out.','2 rows out']],
  walkWhy:'Staging names each transformation; reviewing or debugging means running just the CTE body to inspect the intermediate truth — impossible when the same logic is buried inline.',
  rules:['CTEs exist only for the single statement they prefix; define VIEWs for persisted reuse.','A CTE may be referenced multiple times in the main query (self-joins across stages are common).','Recursive CTEs need a terminating condition — structural (no new rows) or explicit (depth < n) — or they loop forever on cyclic data.','PostgreSQL may inline or materialise CTEs (MATERIALIZED hint exists); correctness is unaffected either way.'],
  mistakes:[
   {t:'Expecting the CTE to persist like a table',bad:'WITH recent AS (SELECT * FROM orders WHERE created_at > now() - interval \'1 day\')\nSELECT count(*) FROM recent;\n-- next statement:\nSELECT * FROM recent;  -- ERROR: relation "recent" does not exist',err:'ERROR: relation "recent" does not exist',why:'WITH scopes its names to exactly one statement. Treating it as session state fails immediately. Cross-statement reuse needs a VIEW or an actual (temp) table.',fix:'CREATE VIEW recent_orders AS\nSELECT * FROM orders WHERE created_at > now() - interval \'1 day\';',tip:'One statement = CTE; many statements/days = VIEW. Choose by lifetime, not habit.'},
   {t:'Unbounded recursion on cyclic data',bad:'-- if employee 1\'s manager is later set to 4 (a cycle),\n-- the recursive term keeps producing rows forever',why:'Recursion stops only when the recursive member yields zero new rows. Cycles violate that assumption, spinning until cancelled or resource limits intervene.',fix:'-- track the visited path and cut repeats, or cap depth:\nSELECT ... , o.depth + 1 FROM ... WHERE o.depth < 10',tip:'Always design the stop condition before the step; real hierarchies are messy enough to contain surprises.'}
  ],
  cmp:['CTE vs subquery vs view',['Feature','Inline subquery','CTE (WITH)','VIEW'],[['Lifetime','Inside one expression','One statement','Persisted in schema'],['Reusable in same query','Re-type it','Reference by name','Reference like a table'],['Readability at depth','Poor','Step-by-step','Hidden behind a name'],['Recursion','No','Yes (WITH RECURSIVE)','No (except recursive views variants)']]],
  diag:{kind:'flow',start:'Raw tables',condition:'Multi-stage logic?',trueAction:'Name stages with WITH',falseAction:'Plain SELECT suffices',end:'Main query reads like prose'},
  apps:['Funnel analytics staged as sessions → engaged → converted.','Org/category tree traversal with WITH RECURSIVE.','De-duplication workflows: rank rows in a CTE, delete losers in the main statement.'],
  quizzes:[{q:'What is the scope of a CTE defined by WITH x AS (...)?',options:['The whole session','Only the single statement it prefixes','Until dropped','The whole database'],correct:1,why:'CTE names live and die with their one statement; persisted reuse is what VIEWs are for.'},
            {q:'In WITH RECURSIVE, the part before UNION ALL is called…',options:['The seed index','The anchor member (starting rows)','The termination check','The accumulator'],correct:1,why:'The anchor produces the initial row set; the recursive member repeatedly extends it until it produces nothing new.'}],
  take:['Name stages; read/debug queries top-to-bottom.','Chain CTEs so each step has one job; reuse names freely within the statement.','Recursive CTEs = anchor + self-join step + a termination guarantee.'],
  rev:'WITH n AS (SELECT...) SELECT...; chains with commas; one-statement scope. RECURSIVE: anchor UNION ALL step; ensure it stops.',
  assign:{p:'Using results(student,subject,marks), write a two-CTE query: per_subject_top computes MAX(marks) per subject; main query lists student, subject, marks for rows equalling their subject top (join to the CTE).',s:`-- TODO: WITH per_subject_top AS (...) main join query`,sol:`WITH per_subject_top AS (
    SELECT subject, MAX(marks) AS top_marks
    FROM results
    GROUP BY subject
)
SELECT r.student, r.subject, r.marks
FROM results r
JOIN per_subject_top t
  ON t.subject = r.subject
 AND t.top_marks = r.marks
ORDER BY r.subject;`}
},
{
  id:'sql-views', course_id:'sql-databases', unit_id:'sql-unit-1', order_index:10,
  title:'Views: Saved Queries as Virtual Tables', desc:'Encapsulate joins/filters behind stable names for reuse and access control.',
  obj:['Create, query and replace views; explain they store the QUERY, not data','Use views for stable interfaces over evolving schemas','Know updatable-view limits and materialized view trade-offs'],
  pre:['CTEs','JOINs, aggregates'],
  outcomes:['Learner publishes reusable, stable query interfaces for a schema'],
  def:'A view is a named, stored SELECT statement that behaves like a read-only table: querying it executes the underlying query against current base-table data. CREATE OR REPLACE VIEW updates the definition; a MATERIALIZED VIEW additionally stores a snapshot that must be refreshed.',
  simple:'A view is a saved question with a name. When people keep asking "show me each student with their average and grade", instead of retyping the five-line query forever you store it once as student_report — and thereafter SELECT * FROM student_report WHERE grade = \'A\' just works. The magic: no data is copied; the view re-runs its question fresh each time, so it is always up to date. Views also hide messiness: rename ugly columns, pre-join tables, and even expose only SOME columns to junior staff (leave salary out) — a friendly shop window over a complicated warehouse.',
  hing:'View matlab ek saved query jiska naam table jaisa hota hai. CREATE VIEW student_report AS SELECT ... ke baad aap SELECT * FROM student_report kar sakte ho — andar wahi purani lambi query chalti hai, har baar fresh data ke saath. Data copy NAHI hota, sirf sawal save hota hai! Iske fayde: complex joins chhup jaate hain, columnon ke saaf naam milte hain, aur sensitive columns (jaise salary) ko view se baahar rakhkar access control ho sakta hai. Dhyan rahe, views par aam taur par UPDATE seedha nahi chalta (kuch simple views par chalta hai). Agar query bohot bhaari hai aur data purana chal sakta hai to MATERIALIZED VIEW snapshot bana leta hai — par use REFRESH karna padta hai warna puraana data dikhega.',
  why:'Views are the schema\'s public API: applications and reports bind to stable names/shapes while base tables evolve underneath. They centralise business definitions ("active customer") so ten reports stop disagreeing about what the words mean.',
  when:'Create views for frequently reused joins/aggregates and permission-shaped slices of data. Choose materialized views for expensive, staleness-tolerant summaries (nightly dashboards), with a refresh schedule. Avoid hiding business-critical logic so deep that debugging becomes archaeology.',
  syntax:'CREATE VIEW student_report AS\nSELECT student,\n       ROUND(AVG(marks), 1) AS avg_marks\nFROM results\nGROUP BY student;\n\nSELECT * FROM student_report WHERE avg_marks >= 80;\nCREATE OR REPLACE VIEW student_report AS ...;  -- evolve it',
  comp:[['Virtual (stored query)','Always reflects current base data; costs the query per use'],['Materialized view','Stored snapshot; fast reads, stale until REFRESH'],['Updatable views','Simple single-table views may accept INSERT/UPDATE under restrictions']],
  ex:[
   {t:'Basic: defining and consuming a view',code:`CREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);
INSERT INTO results VALUES
    ('Diya', 'Maths', 92), ('Diya', 'Science', 85),
    ('Kabir', 'Maths', 57), ('Meera', 'Maths', 95);

CREATE VIEW student_report AS
SELECT student,
       ROUND(AVG(marks), 1) AS avg_marks,
       COUNT(*) AS subjects_taken
FROM results
GROUP BY student;

SELECT * FROM student_report ORDER BY avg_marks DESC;
SELECT student FROM student_report WHERE avg_marks >= 80 ORDER BY avg_marks DESC;`,out:` student | avg_marks | subjects_taken
---------+-----------+----------------
 Meera   |      95.0 |              1
 Diya    |      88.5 |              2
 Kabir   |      57.0 |              1
(3 rows)

 student
---------
 Meera
 Diya
(2 rows)`,why:'The view encapsulates the GROUP BY once; consumers filter the derived avg_marks column as if it were stored. Adding a new results row would instantly change subsequent view reads — nothing is cached.'},
   {t:'Intermediate: reshaping the view without breaking callers',code:`CREATE OR REPLACE VIEW student_report AS
SELECT student,
       ROUND(AVG(marks), 1) AS avg_marks,
       COUNT(*) AS subjects_taken,
       CASE WHEN AVG(marks) >= 75 THEN 'Distinction'
            WHEN AVG(marks) >= 50 THEN 'Pass'
            ELSE 'Remedial' END AS band
FROM results
GROUP BY student;

SELECT student, band FROM student_report ORDER BY student;`,out:` student |    band
---------+-------------
 Diya    | Distinction
 Kabir   | Pass
 Meera   | Distinction
(3 rows)`,why:'OR REPLACE extended the contract with a band column; existing queries using the original three columns keep working (PostgreSQL requires the replacement to keep prior columns\' names/order/types, allowing appends at the end).'},
   {t:'Advanced: materialized snapshot vs live view',code:`CREATE MATERIALIZED VIEW results_snapshot AS
SELECT COUNT(*) AS rows_now FROM results;

INSERT INTO results VALUES ('Kabir', 'Science', 66);

SELECT * FROM results_snapshot;            -- still the old count
SELECT COUNT(*) AS live_now FROM results;  -- current truth

REFRESH MATERIALIZED VIEW results_snapshot;
SELECT * FROM results_snapshot;            -- caught up`,out:` rows_now
----------
        4
(1 row)

 live_now
----------
        5
(1 row)

 rows_now
----------
        5
(1 row)`,why:'The snapshot froze at 4 rows; the live count moved to 5 after the insert. Materialization trades freshness for speed and is only correct with an explicit refresh strategy (schedule or post-load hook).'}
  ],
  walk:[[6,'CREATE VIEW stores just this SELECT text under the name student_report — no rows are copied anywhere.','definition saved'],[13,'Querying the view inlines/executes the stored GROUP BY against TODAY\'s results contents.','live computation'],[14,'Filtering by avg_marks works with plain WHERE because the outer query sees finished aggregate rows.','stable consumer interface']],
  walkWhy:'A view is a query wearing a table\'s name; the freshness and the per-use compute cost both descend from that single design fact.',
  rules:['Plain views store no data; every read pays the underlying query cost on current rows.','CREATE OR REPLACE VIEW cannot drop/rename/retype existing columns in PostgreSQL — append-only evolution (or DROP + CREATE).','Aggregated/joined views are not updatable; simple single-table views may be (with CHECK OPTION to keep writes in-scope).','Views do not have their own indexes (materialized ones can); performance remains the base query\'s.'],
  mistakes:[
   {t:'Treating a materialized view as always fresh',bad:'-- dashboard reads nightly_snapshot at 4pm and presents it as live sales',why:'Snapshots freeze at creation/last REFRESH. Quiet staleness is worse than slow truth: decisions get made on yesterday\'s numbers wearing today\'s clothes.',fix:'REFRESH MATERIALIZED VIEW nightly_snapshot;  -- scheduled / post-load\n-- label dashboards with the snapshot timestamp',tip:'Every materialized view ships with two questions: how stale may this be, and what refreshes it? Answer both in writing.'},
   {t:'Trying to UPDATE through an aggregate view',bad:'UPDATE student_report SET avg_marks = 100 WHERE student = \'Kabir\';',err:'ERROR: cannot update view "student_report" (views with GROUP BY are not automatically updatable)',why:'An average maps many base rows to one view row; the database cannot know which underlying marks to change to make the average 100. Ambiguity = refusal.',fix:'UPDATE results SET marks = 100\nWHERE student = \'Kabir\' AND subject = \'Maths\';  -- edit base rows',tip:'Write to base tables; read through views. (Simple pass-through views are the narrow exception.)'}
  ],
  cmp:['View vs materialized view vs table',['Aspect','VIEW','MATERIALIZED VIEW','TABLE'],[['Stores data','No (query only)','Yes (snapshot)','Yes (authoritative)'],['Freshness','Always current','As of last refresh','Always current'],['Read cost','Pays query each time','Fast, indexable','Fast, indexable'],['Updatable','Limited cases','No (refresh replaces)','Yes fully']]],
  diag:{kind:'flow',start:'Same query asked repeatedly',condition:'May results be slightly stale?',trueAction:'Materialized view + refresh plan',falseAction:'Plain view (live)',end:'Consumers use one stable name'},
  apps:['BI tools binding to governed views (single definition of revenue/active user).','Permission shaping: staff_directory view omitting salary columns.','Legacy compatibility: old column names preserved via a view after a table redesign.'],
  quizzes:[{q:'After INSERT into a base table, SELECT from a plain VIEW on it shows…',options:['Old data until REFRESH','The new row immediately (query runs live)','An error','Only after reconnect'],correct:1,why:'A view is a stored query executed at read time over current base data.'},
            {q:'Why can\'t you UPDATE a GROUP BY view\'s AVG column?',options:['Views are encrypted','One aggregated row maps to many base rows — the inverse edit is ambiguous','AVG is read-only syntax','Permissions'],correct:1,why:'There is no unique base-row change corresponding to editing an aggregate, so engines refuse.'}],
  take:['Views = named stored queries: stable interfaces, always-fresh reads, per-use cost.','Materialized views trade freshness for speed — schedule REFRESH explicitly.','Write to base tables; evolve views compatibly (append columns, keep names).'],
  rev:'CREATE VIEW name AS SELECT... query stored, not data. OR REPLACE appends only. MATERIALIZED = snapshot + REFRESH. Aggregated views not updatable.',
  assign:{p:'Create view maths_scores AS SELECT student, marks FROM results WHERE subject = \'Maths\'; then (a) list it ordered by marks DESC, (b) insert a new Maths row into results and re-select from the view to prove freshness (comment the new count).',s:`-- TODO: CREATE VIEW + two selects with an insert between`,sol:`CREATE VIEW maths_scores AS
SELECT student, marks
FROM results
WHERE subject = 'Maths';

SELECT * FROM maths_scores ORDER BY marks DESC;

INSERT INTO results VALUES ('Sana', 'Maths', 88);

SELECT * FROM maths_scores ORDER BY marks DESC;
-- The view now shows Sana immediately: it re-ran its stored query.`}
},
{
  id:'sql-normalization', course_id:'sql-databases', unit_id:'sql-unit-2', order_index:1,
  title:'Normalization: 1NF, 2NF & 3NF by Example', desc:'Eliminate redundancy and anomalies by splitting facts into the right tables.',
  obj:['Recognise and fix 1NF violations (repeating groups, multi-valued cells)','Remove partial (2NF) and transitive (3NF) dependencies','Name the update/insert/delete anomalies normalization prevents'],
  pre:['Relational model & keys','CREATE TABLE & constraints'],
  outcomes:['Learner can critique a denormalised schema and refactor it into 3NF'],
  def:'Normalization is a design discipline decomposing tables so each fact is stored once. First Normal Form (1NF) requires atomic values and no repeating groups. Second (2NF) removes attributes depending on only part of a composite key. Third (3NF) removes attributes depending on non-key attributes (transitive dependencies).',
  simple:'Normalization is database tidiness with a purpose: store every fact exactly once, in the table it belongs to. A messy spreadsheet with "Maths:90; Science:85" written inside ONE cell, or the teacher\'s phone number repeated next to every student she teaches, guarantees chaos — fix a phone number in three places, miss the fourth, and now your database tells two truths. The normal forms are progressive decluttering rules: 1NF says one value per cell, one row per fact; 2NF says details must depend on the WHOLE key, not half of it; 3NF says details must hang directly from the key, not via another non-key column. Follow them and whole categories of contradictions simply cannot exist.',
  hing:'Normalization ka seedha matlab hai: har fact ek hi jagah, ek hi baar rakho. Socho ek hi cell me "Maths:90, Science:85" likha hai — ye 1NF ka ullanghan hai, kyunki phir search/average sab mushkil hoga. Har subject-marks ki alag row honi chahiye. 2NF kehta hai: agar key do hisso ki hai (student+subject), to koi column sirf aadhi key par nirbhar nahi hona chahiye — jaise student ka naam sirf student par nirbhar hai, subject se uska lena-dena nahi, isliye naam students table me jayega. 3NF: teacher ka phone teacher_id par nirbhar hai, student par nahi — use har student ke saath dohrana bevakoofi hai. In niyamo se teen bimariyan khatm hoti hain: update anomaly (ek jagah badlo, dusri jagah purana reh jayein), insert anomaly, aur delete anomaly (student hatao to teacher ki jaankari bhi gayab!).',
  why:'Redundancy is the root of inconsistent data: the same city spelled three ways, prices updated in some rows but not others. Normalization makes inconsistency structurally impossible and shrinks storage; deliberate denormalization later (for measured performance) is then an informed trade, not an accident.',
  when:'Design OLTP (transactional) schemas to 3NF by default. Consider controlled denormalisation only for read-heavy analytics with measured pain, maintaining derived copies via triggers/materialized views so the copies cannot silently diverge.',
  syntax:'-- Smell (one wide table):\n-- enrolments(student_id, student_name, course, teacher, teacher_phone)\n\n-- 3NF split:\n-- students(student_id PK, student_name)\n-- teachers(teacher_id PK, teacher_name, teacher_phone)\n-- courses(course_id PK, title, teacher_id FK)\n-- enrolments(student_id FK, course_id FK, PK(student_id, course_id))',
  comp:[['1NF','Atomic cell values; no repeating groups/arrays-in-a-cell'],['2NF','1NF + no partial dependency on part of a composite key'],['3NF','2NF + no transitive dependency through non-key columns']],
  ex:[
   {t:'Basic: 1NF — from packed cell to atomic rows',code:`-- BEFORE (violates 1NF): one cell carries a whole list
CREATE TABLE messy_marks (student TEXT, marks_list TEXT);
INSERT INTO messy_marks VALUES ('Diya', 'Maths:92, Science:85');

-- Average per subject is now a string-parsing adventure. Refactor:
CREATE TABLE marks_1nf (
    student TEXT NOT NULL,
    subject TEXT NOT NULL,
    marks   INTEGER NOT NULL,
    PRIMARY KEY (student, subject)
);
INSERT INTO marks_1nf VALUES
    ('Diya', 'Maths', 92),
    ('Diya', 'Science', 85);

SELECT subject, AVG(marks) AS avg_marks FROM marks_1nf GROUP BY subject ORDER BY subject;`,out:` subject | avg_marks
---------+-----------
 Maths   |     92.00
 Science |     85.00
(2 rows)`,why:'Atomic rows per (student, subject) make every SQL verb usable directly: filtering, joining and aggregating over typed values instead of substrings.'},
   {t:'Intermediate: 2NF — removing partial dependency',code:`-- Key is (student_id, course_id), but student_name depends ONLY on student_id
CREATE TABLE enrol_wide (
    student_id   INTEGER,
    course_id    INTEGER,
    student_name TEXT,          -- partial dependency: repeats per course
    grade        TEXT,
    PRIMARY KEY (student_id, course_id)
);

-- Split so each fact hangs on its whole key:
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    student_name TEXT NOT NULL
);
CREATE TABLE enrolments (
    student_id INTEGER REFERENCES students(student_id),
    course_id  INTEGER,
    grade      TEXT,
    PRIMARY KEY (student_id, course_id)
);`,out:`CREATE TABLE
CREATE TABLE
CREATE TABLE
(Schema accepted: names now live once; grade remains per (student, course).)`,why:'In the wide table, renaming a student enrolled in 6 courses needs 6 row edits (update anomaly). After the split, name lives exactly once and enrolments hold only facts about the pairing.'},
   {t:'Advanced: 3NF — removing transitive dependency',code:`-- course_teacher depends on course, teacher_phone depends on the TEACHER,
-- not on the course key -> transitive dependency chain in one table
CREATE TABLE course_flat (
    course_id     INTEGER PRIMARY KEY,
    title         TEXT,
    teacher_name  TEXT,
    teacher_phone TEXT      -- repeated for every course the teacher runs
);

-- 3NF redesign
CREATE TABLE teachers (
    teacher_id    INTEGER PRIMARY KEY,
    teacher_name  TEXT NOT NULL,
    teacher_phone TEXT
);
CREATE TABLE courses (
    course_id  INTEGER PRIMARY KEY,
    title      TEXT NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES teachers(teacher_id)
);

INSERT INTO teachers VALUES (7, 'Ms Rao', '98100-12345');
INSERT INTO courses VALUES (101, 'Databases', 7), (102, 'Networks', 7);

SELECT c.title, t.teacher_name, t.teacher_phone
FROM courses c JOIN teachers t ON t.teacher_id = c.teacher_id
ORDER BY c.course_id;`,out:`   title   | teacher_name | teacher_phone
-----------+--------------+---------------
 Databases | Ms Rao       | 98100-12345
 Networks  | Ms Rao       | 98100-12345
(2 rows)`,why:'Ms Rao\'s phone is stored ONCE; her two courses fetch it by join. A phone change is a one-row update, deleting a course cannot orphan teacher facts, and a teacher with no courses can exist — all three anomalies retired.'}
  ],
  walk:[[3,'The packed string defeats typing: the database sees text, not two marks, so AVG and comparisons are impossible without parsing.','1NF violated'],[6,'The refactored table gives every (student, subject) fact its own row with a typed numeric column.','atomic rows, composite key'],[16,'Now GROUP BY subject computes averages directly — the design change is what UNLOCKED the query.','analytics possible']],
  walkWhy:'Each normal form removes a structural reason for duplicated facts; queries get simpler as a side effect because data finally matches the questions asked of it.',
  rules:['1NF: every cell one atomic value; no comma-lists, no columns like phone1/phone2/phone3.','2NF: with composite keys, non-key columns must depend on the ENTIRE key.','3NF: non-key columns must not depend on other non-key columns (teachers\' phones belong with teachers).','Normalising replaces repeated text with foreign keys + joins; keys/indexes keep those joins cheap.'],
  mistakes:[
   {t:'Repeating groups as numbered columns',bad:'-- students(id, name, phone1, phone2, phone3)',why:'A fourth phone has nowhere to live; queries must OR across three columns; most cells sit NULL. This is the spreadsheet anti-pattern wearing a table costume — a clear 1NF spirit violation.',fix:'-- student_phones(student_id FK, phone, kind, PRIMARY KEY(student_id, phone))',tip:'Numbered column suffixes (x1, x2, x3) are the visible rash of a missing child table.'},
   {t:'Copying descriptive text into transaction rows',bad:'-- orders(order_id, customer_name, customer_city, total)\n-- a customer moves: 400 historical rows now disagree with the new city',why:'Every copied fact forks the truth. Reporting "customers by city" starts double-counting movers under both cities, and nobody knows which rows were "fixed".',fix:'-- orders(order_id, customer_id FK, total) + customers(customer_id, name, city)\n-- deliberate historical snapshots are a separate, named pattern',tip:'Store the reference (FK), not the description — unless it is a conscious point-in-time snapshot (invoice address), labelled as such.'}
  ],
  cmp:['The three anomalies',['Anomaly','Denormalised symptom','After 3NF'],[['Update','Phone changed in 3 of 4 copied rows → two truths','One row, one update'],['Insert','Cannot add a teacher until she has a course','Teachers table accepts her now'],['Delete','Dropping a course erases the only copy of teacher phone','Course delete leaves teacher intact'],['Storage','Repeated text everywhere','Short FK integers']]],
  diag:{kind:'flow',start:'Examine each column',condition:'Depends on whole key, directly?',trueAction:'Keep it in this table',falseAction:'Move it to the table it truly describes + FK',end:'Each fact stored exactly once'},
  apps:['University schema: students/teachers/courses/enrolments as designed in this lesson.','E-commerce: product names/prices out of order_items (except deliberate price-at-sale snapshot).', 'HR systems: department locations with departments, not pasted onto every employee row.'],
  quizzes:[{q:'students(id, name, phone1, phone2) mainly violates…',options:['3NF transitivity','1NF spirit: repeating groups instead of atomic rows in a child table','Referential integrity','Nothing — this is fine'],correct:1,why:'Numbered repeating columns simulate a list inside a row; the relational fix is a phones child table.'},
            {q:'In enrol_wide(student_id, course_id, student_name, grade), student_name is a problem for which form?',options:['1NF','2NF — it depends on part (student_id) of the composite key','3NF only','BCNF only'],correct:1,why:'Partial dependency on half the composite key is exactly the 2NF violation; name belongs in students.'}],
  take:['1NF atomic, 2NF whole-key, 3NF only-the-key — each kills a duplication pattern.','Anomalies are symptoms; single-source-of-truth tables are the cure.','Denormalise later, deliberately, with maintenance machinery — never by accident.'],
  rev:'1NF: one value per cell, no repeating columns. 2NF: no partial-key dependencies. 3NF: no non-key → non-key dependencies. Facts once, keys everywhere.',
  assign:{p:'Critique library_flat(member_id, member_name, member_city, book_id, book_title, due_date) with PK(member_id, book_id): in comments name the 2NF issue; then write 3NF CREATE TABLEs (members, books, loans) with suitable keys/FKs.',s:`-- TODO: comment the partial dependency, then 3NF DDL`,sol:`-- 2NF problem: member_name/member_city depend only on member_id (part of the
-- PK) and book_title only on book_id. Both get repeated on every loan row,
-- inviting update anomalies. City also repeats transitively via member data.

CREATE TABLE members (
    member_id   INTEGER PRIMARY KEY,
    member_name TEXT NOT NULL,
    member_city TEXT
);

CREATE TABLE books (
    book_id   INTEGER PRIMARY KEY,
    book_title TEXT NOT NULL
);

CREATE TABLE loans (
    member_id INTEGER NOT NULL REFERENCES members(member_id),
    book_id   INTEGER NOT NULL REFERENCES books(book_id),
    due_date  DATE NOT NULL,
    PRIMARY KEY (member_id, book_id)
);`}
},
{
  id:'sql-indexes-explain', course_id:'sql-databases', unit_id:'sql-unit-2', order_index:2,
  title:'Indexes & Reading EXPLAIN Plans', desc:'Speed lookups with B-tree indexes and verify with EXPLAIN — plus their write costs.',
  obj:['Explain how a B-tree index turns scans into lookups','Create single/composite/unique indexes for real query shapes','Read EXPLAIN output: Seq Scan vs Index Scan, and index trade-offs'],
  pre:['SELECT/filtering','JOINs'],
  outcomes:['Learner diagnoses slow queries and adds justified indexes'],
  def:'An index is an auxiliary ordered structure (typically a B-tree) mapping key values to row locations, letting the engine find matching rows in logarithmic time instead of scanning the whole table. EXPLAIN shows the planner\'s chosen strategy (Seq Scan, Index Scan, joins) with cost estimates before running a query.',
  simple:'An index is the alphabetical index at the back of a textbook: without it, finding "photosynthesis" means reading every page (a sequential scan); with it, you jump straight to the listed pages. Database B-tree indexes do exactly that for columns you search by — student_id, email, order dates — going from millions of row checks to a handful. The price: the index must be updated on every insert/update, and it occupies disk, so index the columns your WHERE/JOIN/ORDER BY actually use, not everything. EXPLAIN is the X-ray that shows which strategy the database picked, so you never have to guess.',
  hing:'Index bilkul kitaab ke aakhir wala index hai — bina uske "normalization" shabd doondhna matlab saari kitaab padna (Seq Scan), uske saath seedha page number milta hai (Index Scan). Jo column WHERE ya JOIN me baar-baar aata hai, usi par index banta hai — primary key par to auto bann jata hai. Lekin index muft ka nahi hai: har INSERT/UPDATE par index ko bhi badalna padta hai aur jaga bhi khata hai. Isliye har column par index == bevakoofi. EXPLAIN likhte hi database bata deta hai ki query kis raaste se jayegi — Seq Scan dikha aur table badi hai, to samjho index ki zaroorat hai. Ek aur baat: ORDER BY ke saath bhi index kaam aata hai kyunki wo pehle se sorted hota hai!',
  why:'Indexing is the first and highest-leverage performance tool in SQL; missing indexes on foreign keys/filter columns are the top cause of "database is slow" in real projects. Reading plans turns optimization from folklore into evidence.',
  when:'Index columns used in equality/range filters, join keys, and ORDER BY on large tables; composite indexes follow most-selective-first and query column order. Skip indexes on tiny tables, low-cardinality flags alone, and write-heavy columns with no read benefit. Validate with EXPLAIN (ANALYZE cautiously on prod).',
  syntax:'CREATE INDEX idx_results_student ON results(student);\nCREATE UNIQUE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_orders_cust_date ON orders(customer_id, created_at DESC);\nEXPLAIN SELECT * FROM results WHERE student = \'Diya\';',
  comp:[['B-tree index','Balanced sorted tree: equality, ranges and ORDER BY friendly'],['Seq Scan vs Index Scan','Read everything vs tree-guided row fetches'],['Composite index','Multiple columns ordered; usable from the leftmost prefix']],
  ex:[
   {t:'Basic: the planner still chooses by cost (PostgreSQL)',code:`CREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);
INSERT INTO results VALUES
    ('Diya', 'Maths', 92), ('Kabir', 'Maths', 57), ('Meera', 'Maths', 74);

EXPLAIN SELECT * FROM results WHERE student = 'Diya';

CREATE INDEX idx_results_student ON results(student);
ANALYZE results;

EXPLAIN SELECT * FROM results WHERE student = 'Diya';`,out:`QUERY PLAN (exact costs/width vary)
Seq Scan on results
  Filter: (student = 'Diya'::text)

QUERY PLAN (after CREATE INDEX + ANALYZE)
Seq Scan on results
  Filter: (student = 'Diya'::text)

-- Only 3 rows live on one page, so scanning is still cheaper.
-- Creating an index makes it available; it never forces its use.`,why:'This is the honest small-table result: CREATE INDEX does not command the planner. On a large table where very few rows match, the same index can make an Index Scan/Bitmap Heap Scan cheaper than a full read; verify that with EXPLAIN on realistic row counts and statistics.'},
   {t:'Intermediate: composite and foreign-key indexing',code:`-- Self-contained fixture (5,000 orders) so the plan is reproducible
CREATE TABLE enrolments (student_id INTEGER, course_id INTEGER);
CREATE TABLE orders (
    order_id    INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status      TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL
);
INSERT INTO orders
SELECT g, g % 50, 'paid', NOW() - (g || ' minutes')::interval
FROM generate_series(1, 5000) AS g;

-- Join/filter keys are NOT auto-indexed for plain FK columns in PostgreSQL
CREATE INDEX idx_enrolments_student ON enrolments(student_id);

-- Supports: WHERE customer_id = ? ORDER BY created_at DESC (one tree walk)
CREATE INDEX idx_orders_cust_date ON orders(customer_id, created_at DESC);
ANALYZE orders;

-- The same composite index also serves WHERE customer_id = ? alone
-- (leftmost prefix), but NOT a filter on created_at by itself.
EXPLAIN
SELECT * FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC
LIMIT 5;`,out:`QUERY PLAN (exact costs vary)
Limit
  ->  Index Scan using idx_orders_cust_date on orders
        Index Cond: (customer_id = 42)

-- Plan shape verified against this 5,000-row PostgreSQL fixture.`,why:'The composite key order matches filter-then-sort, so the first 5 matching index entries in order ARE the answer — no separate sort step. Reversing the columns would not serve this query shape nearly as well.'},
   {t:'Advanced: unique indexes, and what indexes cannot fix',code:`-- Self-contained fixture (20,000 accounts)
CREATE TABLE accounts (account_id INTEGER PRIMARY KEY, email TEXT NOT NULL);
INSERT INTO accounts
SELECT g, 'user' || g || '@example.com'
FROM generate_series(1, 20000) AS g;

-- Uniqueness RULE plus a pattern-search-capable operator class.
-- (A plain text B-tree may not accelerate LIKE under a non-C collation.)
CREATE UNIQUE INDEX idx_accounts_email_pattern
    ON accounts(email text_pattern_ops);
ANALYZE accounts;

-- Leading wildcard defeats B-tree ordering:
EXPLAIN SELECT * FROM accounts WHERE email LIKE '%@gmail.com';

-- A prefix becomes a seekable range for the pattern index:
EXPLAIN SELECT * FROM accounts WHERE email LIKE 'user42%';`,out:`QUERY PLAN (exact costs vary)
Seq Scan on accounts
  Filter: (email ~~ '%@gmail.com'::text)

QUERY PLAN (exact costs/node may vary by selectivity)
Bitmap Heap Scan on accounts
  Filter: (email ~~ 'user42%'::text)
  ->  Bitmap Index Scan on idx_accounts_email_pattern
        Index Cond: ((email ~>=~ 'user42'::text)
                     AND (email ~<~ 'user43'::text))

-- Plan shapes verified against this 20,000-row PostgreSQL fixture.`,why:'B-trees order from the FIRST character: prefix patterns can become seekable ranges, leading-wildcard patterns cannot. For LIKE on text, collation/operator class matters — text_pattern_ops is the deliberate choice here. Unique indexes also enforce the no-duplicate-email rule at write time.'}
  ],
  walk:[[5,'Before any index exists the only strategy is Seq Scan: read all rows, keep those passing the Filter. Cost scales with table size.','Seq Scan + Filter'],[7,'CREATE INDEX builds the sorted map from student values to row locations (a one-time cost now, maintained per write).','B-tree built'],[10,'The second EXPLAIN still shows Seq Scan on this 3-row table: one page is cheaper to scan than traversing the new tree. On large, selective tables the same index can become the cheaper plan.','cost-based choice']],
  walkWhy:'Plans are chosen from statistics, not vibes: tiny tables legitimately prefer Seq Scan, which is why benchmarks must use realistic row counts before declaring an index useless.',
  rules:['Primary keys and UNIQUE constraints already maintain indexes — do not duplicate them.','PostgreSQL does NOT auto-index foreign-key columns; join-heavy FKs usually deserve explicit indexes.','Each index slows writes and consumes storage: index for measured query shapes, delete unused ones.','Functions on a column (WHERE LOWER(email)=...) bypass plain indexes — use expression indexes when needed.'],
  mistakes:[
   {t:'Indexing every column "for speed"',bad:'CREATE INDEX ON orders(status);\nCREATE INDEX ON orders(country);\nCREATE INDEX ON orders(channel);\n-- ...and 14 more, while invoices insert all day',why:'Write amplification: every INSERT now maintains 17 trees. Bulk loads crawl, storage balloons, and several low-value indexes are never chosen by the planner anyway.',fix:'-- index from evidence: slow-query logs + EXPLAIN on real shapes\nCREATE INDEX idx_orders_customer ON orders(customer_id);',tip:'One justified index beats ten speculative ones. Audit usage (pg_stat_user_indexes) and drop the dead weight.'},
   {t:'Expecting a leading-wildcard LIKE to use the index',bad:"WHERE email LIKE '%@gmail.com'  -- Seq Scan despite the email index",why:'B-tree order starts at the first character; an unknown prefix leaves no seekable range. Blaming the database misses that the data structure fundamentally cannot answer this with ordering alone.',fix:'-- PostgreSQL trigram option:\nCREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX idx_email_trgm ON accounts USING gin (email gin_trgm_ops);',tip:'Contains-search at scale needs trigram/full-text indexes — a deliberate extra structure, not a bigger B-tree.'}
  ],
  cmp:['Scan strategies at a glance',['Plan node','What happens','When chosen'],[['Seq Scan','Reads the entire table','Tiny tables or most rows qualify'],['Index Scan','Tree lookup + row fetch per match','Few matching rows, ordered output'],['Bitmap Index Scan','Collect matching pages then fetch','Moderate match counts'],['Index Only Scan','Answers from index alone','All needed columns are in the index']]],
  diag:{kind:'flow',start:'Slow query reported',condition:'EXPLAIN shows scan on big table?',trueAction:'Add targeted index, re-EXPLAIN',falseAction:'Investigate query/data shape first',end:'Measure before/after honestly'},
  apps:['Login lookup by unique email index (instant + duplicate-proof).','Order history per customer via (customer_id, created_at) composite.','Foreign-key join acceleration across enrolments/students in ERP schemas.'],
  quizzes:[{q:'A small 30-row lookup table uses Seq Scan despite an index. Likely verdict?',options:['Broken index','Planner judged Seq Scan cheaper than tree overhead at this size — normal','Must force with hints','Table needs VACUUM first in all cases'],correct:1,why:'Cost-based planning: scanning 30 rows on one page beats index traversal + heap fetches. Not a defect.'},
            {q:'Composite index (customer_id, created_at) helps which filter most directly?',options:['WHERE created_at > X alone','WHERE customer_id = 5 (leftmost prefix)','WHERE notes LIKE %x%','All text filters'],correct:1,why:'B-tree composites serve prefixes from the left; a lone second-column filter cannot seek efficiently.'}],
  take:['Indexes trade write cost + storage for logarithmic reads — spend them on evidence.','Read plans: node type first (Seq vs Index), then rows/cost direction.','PK/UNIQUE already indexed; FKs usually are not (PostgreSQL) — check yours.'],
  rev:'B-tree: equality/range/sort. Composite = column order matters (left prefix). EXPLAIN before/after. Leading % defeats B-tree. Writes maintain every index.',
  assign:{p:'For orders(order_id PK, customer_id, status, created_at) the hot query is: recent orders of one customer, newest first, 20 at a time. Write the CREATE INDEX you would add, the query, and (as a comment) which EXPLAIN node you hope to see and why status alone is a weak index candidate.',s:`-- TODO: index choice + query + plan expectation comment`,sol:`CREATE INDEX idx_orders_customer_recent
    ON orders(customer_id, created_at DESC);

SELECT order_id, status, created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC
LIMIT 20;

-- Hope to see: Limit -> Index Scan using idx_orders_customer_recent
-- (seek to customer 42, already newest-first, stop after 20 rows).
-- status alone is low-cardinality (few distinct values over many rows),
-- so it rarely prunes enough to beat other plans by itself.`}
},
{
  id:'sql-transactions-acid', course_id:'sql-databases', unit_id:'sql-unit-2', order_index:3,
  title:'Transactions & ACID: BEGIN, COMMIT, ROLLBACK', desc:'Group statements into atomic units and understand isolation basics.',
  obj:['Execute BEGIN/COMMIT/ROLLBACK around multi-statement work','Explain Atomicity, Consistency, Isolation, Durability with examples','Use savepoints and choose awareness of isolation phenomena'],
  pre:['INSERT/UPDATE/DELETE','Constraints'],
  outcomes:['Learner makes money-transfer-style operations all-or-nothing'],
  def:'A transaction is a sequence of statements treated as one atomic unit: COMMIT makes all its changes durable and visible; ROLLBACK discards them entirely. ACID summarises the guarantees — Atomicity (all-or-nothing), Consistency (constraints hold), Isolation (concurrent transactions do not see partial work), Durability (committed data survives crashes).',
  simple:'A bank transfer is two updates: take 500 from Asha, give 500 to Ravi. If the power dies between them without transactions, money vanishes into thin air. A transaction wraps both steps in an all-or-nothing envelope: BEGIN opens the envelope, COMMIT seals it forever, and ROLLBACK (or a crash) tears it up completely — the database guarantees the outside world will NEVER see a half-transfer. Those guarantees have a famous name, ACID: Atomic (one indivisible unit), Consistent (all rules still hold), Isolated (other people\'s half-finished work is invisible to you), Durable (once committed, even a crash cannot undo it).',
  hing:'Bank transfer ko socho: Asha se 500 katega, Ravi ko 500 badhega. Agar beech me bijli gayi to? Bina transaction ke paise gayab! Transaction in dono steps ko ek band lifafe me daal deta hai: BEGIN se shuru, COMMIT matlab pakka seal, ROLLBACK matlab poora kaam radd — ek bhi hissa nahi bachega. In waadon ko ACID kehte hain: Atomic (sab ya kuch nahi), Consistency (saare rules barkarar), Isolation (dusre ke aadhe kaam tumhe nahi dikhenge), Durability (COMMIT ke baad crash bhi data nahi kha sakta). Ek khaas baat: transaction ke andar error aate hi PostgreSQL poore transaction ko "aborted" kar deta hai — phir sirf ROLLBACK chalega. SAVEPOINT beech ka checkpoint hai, jahan tak wapas ja sakte ho.',
  why:'Correctness of money, inventory and seat-booking systems rests on atomic multi-step writes. Transactions are also the safety harness for dangerous migrations and experiments. Understanding isolation explains phenomena (dirty/non-repeatable reads) that otherwise look like database hauntings.',
  when:'Wrap any logically-single multi-statement change (transfer, order+items, stock adjustments) in one transaction. Keep transactions short; never hold them open across user think-time. Use default READ COMMITTED normally; escalate isolation when invariants demand it (with retry logic).',
  syntax:'BEGIN;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;   -- or ROLLBACK to undo everything',
  comp:[['BEGIN/COMMIT','Opens the atomic envelope; commit seals it durably'],['ROLLBACK [TO SAVEPOINT]','Discards all (or back to a savepoint) changes of the transaction'],['Isolation level','How much of others\' in-flight work you may observe (READ COMMITTED default in PostgreSQL)']],
  ex:[
   {t:'Basic: an atomic transfer',code:`CREATE TABLE accounts (
    id      INTEGER PRIMARY KEY,
    owner   TEXT NOT NULL,
    balance NUMERIC(10,2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts VALUES (1, 'Asha', 1000.00), (2, 'Ravi', 200.00);

BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;

SELECT * FROM accounts ORDER BY id;`,out:` id | owner | balance
----+-------+---------
  1 | Asha  |  500.00
  2 | Ravi  |  700.00
(2 rows)`,why:'Both updates landed or neither would: observers see only the before (1000/200) or after (500/700) state. Total money (1200) is invariant — the essence of atomicity.'},
   {t:'Intermediate: rollback and auto-abort on error',code:`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
ROLLBACK;   -- changed our mind: the valid debit is discarded

SELECT balance FROM accounts WHERE id = 1;

BEGIN;
UPDATE accounts SET balance = balance - 5000 WHERE id = 1;
COMMIT;`,out:` balance
---------
  500.00
(1 row)

ERROR: new row for relation "accounts" violates check constraint "accounts_balance_check"
(and the whole second transaction aborted: its UPDATE failed the balance>=0 CHECK)`,why:'Explicit ROLLBACK erased the first attempt. In the second, the CHECK constraint fired mid-transaction; PostgreSQL marks the transaction aborted and a COMMIT there behaves as ROLLBACK — balances remain 500/700. Constraints + atomicity together are the integrity story.'},
   {t:'Advanced: savepoints and a guarded transfer',code:`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SAVEPOINT after_debit;
UPDATE accounts SET balance = balance + 100 WHERE id = 999;  -- no such account (0 rows)
ROLLBACK TO SAVEPOINT after_debit;   -- undo only the stray step region
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

SELECT * FROM accounts ORDER BY id;`,out:` id | owner | balance
----+-------+---------
  1 | Asha  |  400.00
  2 | Ravi  |  800.00
(2 rows)`,why:'The savepoint let the flow rewind just the mistaken region (which affected 0 rows, requiring application COUNT-checks in real code) and redo the credit correctly, committing a coherent 100 transfer. Applications typically rollback whole transactions on 0-row surprises.'}
  ],
  walk:[[8,'BEGIN starts the envelope: subsequent statements\' effects are private until commit.','transaction open'],[9,'The debit updates Asha inside the transaction — other sessions still read the last committed 1000 (READ COMMITTED).','uncommitted state'],[10,'The matching credit completes the logical single operation.','invariant restored internally'],[11,'COMMIT makes both changes durable and atomically visible.','500/700 published']],
  walkWhy:'The envelope boundary is what converts two individually-dangerous statements into one safe business operation; every serious write path in production systems maps to such a boundary.',
  rules:['Explicit BEGIN...COMMIT groups statements; without it, each statement auto-commits individually (in typical client defaults).','Any error inside a PostgreSQL transaction aborts it: further commands fail until ROLLBACK (savepoints can localise recovery).','Isolation levels trade concurrency for guarantees; SERIALIZABLE can raise serialization failures that callers must retry.','Long-lived open transactions block cleanup (VACUUM) and hold locks — keep them milliseconds-short.'],
  mistakes:[
   {t:'Auto-committed multi-step business operation',bad:'-- no BEGIN: each statement commits separately in many clients\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\n-- crash / app exception here\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;  -- never runs',why:'The debit is already durable when failure strikes; 500 rupees evaporate. Each statement being individually correct did not make the PAIR correct.',fix:'BEGIN;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;',tip:'If two writes describe ONE business event, they share one transaction — no exceptions in money/stock code.'},
   {t:'Leaving transactions open across user interaction',bad:'BEGIN;\nSELECT * FROM seats WHERE id = 10 FOR UPDATE;\n-- show a web page, wait 4 minutes for the user...\nUPDATE seats SET booked_by = 7 WHERE id = 10;\nCOMMIT;',why:'Row locks and snapshot resources are held the whole think-time, serialising or deadlocking everyone else touching those rows and bloating the database. Throughput collapses with each idle user.',fix:'-- read first (no tx), then a SHORT conditional write:\nUPDATE seats SET booked_by = 7\nWHERE id = 10 AND booked_by IS NULL;  -- check affected count = 1',tip:'Design for optimistic single-statement writes at decision time; keep BEGIN..COMMIT spans tight around machine-speed work.'}
  ],
  cmp:['ACID in one line each',['Letter','Guarantee','Without it'],[['A — Atomicity','All steps land or none','Half-transfers lose money'],['C — Consistency','Constraints/invariants hold at commit','Negative balances creep in'],['I — Isolation','No peeking at half-finished work','Reports read impossible states'],['D — Durability','Committed = survives crashes','Acknowledged payments vanish']]],
  diag:{kind:'flow',start:'BEGIN',condition:'All steps succeed + rules hold?',trueAction:'COMMIT: publish durably',falseAction:'ROLLBACK: as if nothing happened',end:'Others only ever see whole states'},
  apps:['Inter-account transfers, wallet debits/credits, double-entry bookkeeping.','Order placement: order row + items + stock decrement as one unit.','Seat/ticket allocation with count-guarded conditional updates.'],
  quizzes:[{q:'A transfer debits, then the app crashes before the credit — with both inside one uncommitted transaction, the database will…',options:['Keep the debit only','Roll back the debit on recovery; balances unchanged','Invent the credit','Mark account corrupt'],correct:1,why:'Atomicity: an uncommitted transaction\'s effects are discarded during crash recovery — no half-transfer persists.'},
            {q:'Which ACID property does a CHECK (balance >= 0) primarily support at commit time?',options:['Durability','Consistency','Isolation','Atomicity'],correct:1,why:'Constraints define the valid states a transaction may move the database between — the consistency guarantee.'}],
  take:['One business event = one transaction, always (esp. money/stock).','Errors abort the whole unit (savepoints localise recovery when needed).','Keep transactions short; read phenomena before raising isolation levels.'],
  rev:'BEGIN..COMMIT all-or-nothing; ROLLBACK discards; SAVEPOINT partial rewind. ACID = Atomic, Consistent, Isolated, Durable. Short txns; default READ COMMITTED (PG).',
  assign:{p:'Write a transaction moving Rs.250 from account 2 to 1 (lesson table), but only debit when source balance suffices: use UPDATE ... WHERE id=2 AND balance >= 250, note in comments how the app must check affected count and rollback if 0. End with COMMIT and a final select.',s:`-- TODO: guarded transfer transaction`,sol:`BEGIN;

UPDATE accounts
SET balance = balance - 250
WHERE id = 2 AND balance >= 250;
-- App check: if this affected 0 rows, issue ROLLBACK and report
-- "insufficient funds" -- never proceed to the credit blindly.

UPDATE accounts
SET balance = balance + 250
WHERE id = 1;

COMMIT;

SELECT * FROM accounts ORDER BY id;`}
},
];

module.exports = { topics: makeTopics(specs) };
