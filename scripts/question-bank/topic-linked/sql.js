'use strict';
const { question } = require('./helper');

function sqlQuestion(cfg) {
  return question({ ...cfg, language: 'sql', course: 'sql-databases' });
}
function studentsSetup(rows) {
  return `DROP VIEW IF EXISTS top_students;\nDROP TABLE IF EXISTS scores;\nDROP TABLE IF EXISTS results;\nDROP TABLE IF EXISTS students;\nCREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, course TEXT, marks INTEGER);\nINSERT INTO students VALUES ${rows};`;
}

module.exports = [
  sqlQuestion({
    topic: 'sql-relational-model-keys', title: 'Authors and Books with Primary and Foreign Keys',
    statement: 'Setup SQL creates filled seed tables author_seed(author_id, name) and book_seed(book_id, title, author_id). Create authors(author_id INTEGER PRIMARY KEY, name TEXT NOT NULL) and books(book_id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(author_id)). Copy every author and book from the seed tables into the new tables. Output each book title with its author name, ordered by book_id.',
    input: 'Setup SQL drops any prior target/seed tables, then creates and fills author_seed and book_seed. Seed rows differ between tests.',
    output: 'Rows: title|author-name.',
    constraints: 'Declare both primary keys and the books.author_id foreign key. Write SQLite-compatible SQL for the practice runner.',
    difficulty: 'Easy', tags: ['relational model', 'primary key', 'foreign key'],
    starter: `-- TODO: create authors before books, declare the PK/FK, copy both seed tables, then join for names.\nCREATE TABLE books (book_id INTEGER, title TEXT, author_id INTEGER);\nINSERT INTO books SELECT book_id, title, author_id FROM book_seed;\nSELECT title, author_id FROM books ORDER BY book_id;`,
    solution: `CREATE TABLE authors (author_id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE books (book_id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(author_id));\nINSERT INTO authors (author_id, name) SELECT author_id, name FROM author_seed;\nINSERT INTO books (book_id, title, author_id) SELECT book_id, title, author_id FROM book_seed;\nSELECT books.title, authors.name FROM books JOIN authors ON authors.author_id = books.author_id ORDER BY books.book_id;`,
    explanation: 'Each entity table uses its own primary key, while books.author_id is a foreign key that lets a join recover the author name without repeating it on every book row. Copying from the seed tables makes the same DDL work for different authors, repeated authors, unused authors, and an empty book set.',
    hints: ['Create and fill the referenced authors table before copying books.', 'Use INSERT INTO ... SELECT for both seed tables, then join on authors.author_id = books.author_id.'],
    tests: [
      [`DROP TABLE IF EXISTS books;\nDROP TABLE IF EXISTS authors;\nDROP TABLE IF EXISTS book_seed;\nDROP TABLE IF EXISTS author_seed;\nCREATE TABLE author_seed (author_id INTEGER, name TEXT);\nCREATE TABLE book_seed (book_id INTEGER, title TEXT, author_id INTEGER);\nINSERT INTO author_seed VALUES (1,'Ruskin Bond'),(2,'Jhumpa Lahiri');\nINSERT INTO book_seed VALUES (101,'The Blue Umbrella',1),(102,'Interpreter of Maladies',2),(103,'Rusty',1);`, 'The Blue Umbrella|Ruskin Bond\nInterpreter of Maladies|Jhumpa Lahiri\nRusty|Ruskin Bond'],
      [`DROP TABLE IF EXISTS books;\nDROP TABLE IF EXISTS authors;\nDROP TABLE IF EXISTS book_seed;\nDROP TABLE IF EXISTS author_seed;\nCREATE TABLE author_seed (author_id INTEGER, name TEXT);\nCREATE TABLE book_seed (book_id INTEGER, title TEXT, author_id INTEGER);\nINSERT INTO author_seed VALUES (12,'Arundhati Roy'),(7,'Evelyn Waugh'),(99,'Unused Author');\nINSERT INTO book_seed VALUES (30,'Brideshead Revisited',7),(10,'The God of Small Things',12),(20,'A Handful of Dust',7);`, 'The God of Small Things|Arundhati Roy\nA Handful of Dust|Evelyn Waugh\nBrideshead Revisited|Evelyn Waugh'],
      [`DROP TABLE IF EXISTS books;\nDROP TABLE IF EXISTS authors;\nDROP TABLE IF EXISTS book_seed;\nDROP TABLE IF EXISTS author_seed;\nCREATE TABLE author_seed (author_id INTEGER, name TEXT);\nCREATE TABLE book_seed (book_id INTEGER, title TEXT, author_id INTEGER);\nINSERT INTO author_seed VALUES (42,'Flann O''Brien');\nINSERT INTO book_seed VALUES (5,'At Swim-Two-Birds',42);`, 'At Swim-Two-Birds|Flann O\'Brien'],
      [`DROP TABLE IF EXISTS books;\nDROP TABLE IF EXISTS authors;\nDROP TABLE IF EXISTS book_seed;\nDROP TABLE IF EXISTS author_seed;\nCREATE TABLE author_seed (author_id INTEGER, name TEXT);\nCREATE TABLE book_seed (book_id INTEGER, title TEXT, author_id INTEGER);\nINSERT INTO author_seed VALUES (1,'No Books Yet');`, ''],
    ],
  }),

  sqlQuestion({
    topic: 'sql-create-table-constraints', title: 'Movies Table with Types Defaults and Check',
    statement: 'Setup SQL creates a filled seed table movie_seed(title, rating). Create movies(movie_id INTEGER PRIMARY KEY, title TEXT NOT NULL, rating REAL CHECK(rating BETWEEN 0 AND 10), watched INTEGER NOT NULL DEFAULT 0). Copy only title and rating from movie_seed in seed order, letting watched default. Output title, rating, and watched ordered by movie_id.',
    input: 'Setup SQL drops any prior movies/movie_seed tables, then creates and fills movie_seed. Seed rows differ between tests.',
    output: 'Rows: title|rating|watched.',
    constraints: 'Include the CHECK and DEFAULT in CREATE TABLE. SQLite represents the boolean-style watched flag as INTEGER 0/1.',
    difficulty: 'Easy', tags: ['CREATE TABLE', 'constraints', 'DEFAULT'],
    starter: `-- TODO: add NOT NULL, CHECK(rating BETWEEN 0 AND 10), and DEFAULT 0 for watched, then copy movie_seed.\nCREATE TABLE movies (movie_id INTEGER, title TEXT, rating REAL, watched INTEGER);\nINSERT INTO movies (title, rating, watched) SELECT title, rating, 1 FROM movie_seed ORDER BY rowid;\nSELECT title, rating, watched FROM movies ORDER BY movie_id;`,
    solution: `CREATE TABLE movies (movie_id INTEGER PRIMARY KEY, title TEXT NOT NULL, rating REAL CHECK(rating BETWEEN 0 AND 10), watched INTEGER NOT NULL DEFAULT 0);\nINSERT INTO movies (title, rating) SELECT title, rating FROM movie_seed ORDER BY rowid;\nSELECT title, rating, watched FROM movies ORDER BY movie_id;`,
    explanation: 'Column types and constraints encode the table rules once; copying only title and rating proves DEFAULT supplies watched=0 for every seed row. Boundary ratings 0 and 10 are valid under the inclusive CHECK, and an empty seed produces no rows.',
    hints: ['Use INSERT INTO movies (title, rating) SELECT ... so the watched default is exercised.', 'ORDER BY movie_seed.rowid during the copy to preserve seed order.'],
    tests: [
      [`DROP TABLE IF EXISTS movies;\nDROP TABLE IF EXISTS movie_seed;\nCREATE TABLE movie_seed (title TEXT, rating REAL);\nINSERT INTO movie_seed VALUES ('3 Idiots',8.4),('Dangal',8.8);`, '3 Idiots|8.4|0\nDangal|8.8|0'],
      [`DROP TABLE IF EXISTS movies;\nDROP TABLE IF EXISTS movie_seed;\nCREATE TABLE movie_seed (title TEXT, rating REAL);\nINSERT INTO movie_seed VALUES ('Floor',0),('Ceiling',10),('Ocean''s Eleven',7.25);`, 'Floor|0.0|0\nCeiling|10.0|0\nOcean\'s Eleven|7.25|0'],
      [`DROP TABLE IF EXISTS movies;\nDROP TABLE IF EXISTS movie_seed;\nCREATE TABLE movie_seed (title TEXT, rating REAL);\nINSERT INTO movie_seed VALUES ('Solo',5.5);`, 'Solo|5.5|0'],
      [`DROP TABLE IF EXISTS movies;\nDROP TABLE IF EXISTS movie_seed;\nCREATE TABLE movie_seed (title TEXT, rating REAL);`, ''],
    ],
  }),

  sqlQuestion({
    topic: 'sql-crud-dml', title: 'Grace Marks Update Then Cleanup Delete',
    statement: 'Table scores(student, marks) already contains rows. First add 5 grace marks only where marks < 60. Then delete rows still below 40. Finally output student and marks ordered by marks descending, then student.',
    input: 'Setup SQL creates and fills scores.',
    output: 'Rows after both changes: student|marks.',
    constraints: 'Both UPDATE and DELETE need restrictive WHERE clauses. Write SQLite-compatible SQL.',
    difficulty: 'Easy', tags: ['UPDATE', 'DELETE'],
    starter: `-- TODO: UPDATE only marks < 60, DELETE only marks < 40, then SELECT.\nUPDATE scores SET marks = marks + 5;\nSELECT student, marks FROM scores ORDER BY marks DESC, student;`,
    solution: `UPDATE scores SET marks = marks + 5 WHERE marks < 60;\nDELETE FROM scores WHERE marks < 40;\nSELECT student, marks FROM scores ORDER BY marks DESC, student;`,
    explanation: 'The WHERE clauses scope each DML statement: only low scores receive grace, and only rows still below the floor are removed.',
    hints: ['An UPDATE without WHERE changes every row—add WHERE marks < 60.', 'Run the DELETE after grace marks so borderline rows can survive.'],
    tests: [
      [`DROP TABLE IF EXISTS scores;\nCREATE TABLE scores (student TEXT, marks INTEGER);\nINSERT INTO scores VALUES ('Diya',92),('Kabir',55),('Meera',61),('Nils',30);`, 'Diya|92\nMeera|61\nKabir|60'],
      [`DROP TABLE IF EXISTS scores;\nCREATE TABLE scores (student TEXT, marks INTEGER);\nINSERT INTO scores VALUES ('Ana',35),('Bo',39),('Cy',40),('Dee',59),('Eli',60);`, 'Dee|64\nEli|60\nCy|45\nBo|44\nAna|40'],
      [`DROP TABLE IF EXISTS scores;\nCREATE TABLE scores (student TEXT, marks INTEGER);\nINSERT INTO scores VALUES ('Zed',10),('Yan',34);`, ''],
    ],
  }),

  sqlQuestion({
    topic: 'sql-filtering-like-patterns', title: 'LIKE Filters Plus Distinct Cities',
    statement: 'From learners(name,email,city), first output names whose email ends with @gmail.com (case-insensitive) AND whose city does NOT end with pur (case-insensitive), ordered by name. Then output DISTINCT cities from the whole table, ordered alphabetically.',
    input: 'Setup SQL creates and fills learners.',
    output: 'Matching names first, then distinct cities; one value per line.',
    constraints: 'Use LIKE/NOT LIKE with leading % patterns and a separate DISTINCT query. Write SQLite-compatible SQL.',
    difficulty: 'Easy', tags: ['LIKE', 'DISTINCT'],
    starter: `-- TODO: email LIKE '%@gmail.com', city NOT LIKE '%pur', then SELECT DISTINCT city.\nSELECT name FROM learners ORDER BY name;\nSELECT city FROM learners ORDER BY city;`,
    solution: `SELECT name FROM learners WHERE LOWER(email) LIKE '%@gmail.com' AND LOWER(city) NOT LIKE '%pur' ORDER BY name;\nSELECT DISTINCT city FROM learners ORDER BY city;`,
    explanation: 'A leading % anchors the pattern to the end of the text, NOT LIKE excludes cities ending in pur, and DISTINCT removes repeated cities.',
    hints: ['Suffix patterns start with %: \'%@gmail.com\' and \'%pur\'.', 'Use AND so both filters apply, not OR.'],
    tests: [
      [`DROP TABLE IF EXISTS learners;\nCREATE TABLE learners (name TEXT, email TEXT, city TEXT);\nINSERT INTO learners VALUES ('Asha','asha@GMAIL.com','Vadodara'),('Bina','bina@gmail.com','Jaipur'),('Chet','chet@yahoo.com','Surat'),('Diya','diya@gmail.com','Vadodara');`, 'Asha\nDiya\nJaipur\nSurat\nVadodara'],
      [`DROP TABLE IF EXISTS learners;\nCREATE TABLE learners (name TEXT, email TEXT, city TEXT);\nINSERT INTO learners VALUES ('Kim','kim@gmail.com','Kanpur'),('Lee','lee@outlook.com','Goa'),('Ana','ana@gmail.com','Goa');`, 'Ana\nGoa\nKanpur'],
      [`DROP TABLE IF EXISTS learners;\nCREATE TABLE learners (name TEXT, email TEXT, city TEXT);\nINSERT INTO learners VALUES ('Solo','solo@gmail.com','NagPUR');`, 'NagPUR'],
    ],
  }),

  sqlQuestion({
    topic: 'sql-case-conditional-aggregation', title: 'Result Bands by Conditional Aggregation',
    statement: 'Table results(student, marks) needs band counts in one aggregate query: distinction for marks >= 75, first_class for 60..74, others below 60. Output the three counts on one line. Then output each student as student:band using CASE, ordered by marks descending then student.',
    input: 'Setup SQL creates and fills results.',
    output: 'First line: distinction|first_class|others. Then one student:band per line.',
    constraints: 'Use SUM(CASE WHEN ... THEN 1 ELSE 0 END) for counts. Write SQLite-compatible SQL.',
    difficulty: 'Medium', tags: ['CASE', 'conditional aggregation'],
    starter: `-- TODO: count bands with SUM(CASE...) and label rows with the same CASE bands.\nSELECT COUNT(*), 0, 0 FROM results;\nSELECT student || ':others' FROM results ORDER BY marks DESC, student;`,
    solution: `SELECT SUM(CASE WHEN marks >= 75 THEN 1 ELSE 0 END), SUM(CASE WHEN marks >= 60 AND marks < 75 THEN 1 ELSE 0 END), SUM(CASE WHEN marks < 60 THEN 1 ELSE 0 END) FROM results;\nSELECT student || ':' || CASE WHEN marks >= 75 THEN 'distinction' WHEN marks >= 60 THEN 'first_class' ELSE 'others' END FROM results ORDER BY marks DESC, student;`,
    explanation: 'Conditional aggregation counts rows per band in a single pass by summing 1 only when the CASE condition matches; the same thresholds label individual rows.',
    hints: ['Each count is SUM(CASE WHEN <band> THEN 1 ELSE 0 END).', 'Order CASE arms from highest threshold to lowest.'],
    tests: [
      [`DROP TABLE IF EXISTS results;\nCREATE TABLE results (student TEXT, marks INTEGER);\nINSERT INTO results VALUES ('Diya',92),('Kabir',55),('Meera',61),('Asha',75),('Bina',60),('Chet',59);`, '2|2|2\nDiya:distinction\nAsha:distinction\nMeera:first_class\nBina:first_class\nChet:others\nKabir:others'],
      [`DROP TABLE IF EXISTS results;\nCREATE TABLE results (student TEXT, marks INTEGER);\nINSERT INTO results VALUES ('Kim',74),('Lee',100);`, '1|1|0\nLee:distinction\nKim:first_class'],
      [`DROP TABLE IF EXISTS results;\nCREATE TABLE results (student TEXT, marks INTEGER);\nINSERT INTO results VALUES ('Solo',0);`, '0|0|1\nSolo:others'],
    ],
  }),

  sqlQuestion({
    topic: 'sql-subqueries', title: 'Above the Maths Average and NO Science Rows',
    statement: 'Using results(student,subject,marks) and learners(name), first output students whose Maths marks are strictly above the overall Maths average (scalar subquery), ordered by student. Then output learner names who have NO Science row in results using NOT EXISTS, ordered by name.',
    input: 'Setup SQL creates results and learners.',
    output: 'Above-average Maths students first, then no-Science learner names; one per line.',
    constraints: 'Use a scalar AVG subquery and a correlated NOT EXISTS. Write SQLite-compatible SQL.',
    difficulty: 'Medium', tags: ['subqueries', 'EXISTS'],
    starter: `-- TODO: scalar subquery for the Maths average, NOT EXISTS for missing Science rows.\nSELECT student FROM results WHERE subject = 'Maths' ORDER BY student;\nSELECT name FROM learners ORDER BY name;`,
    solution: `SELECT student FROM results WHERE subject = 'Maths' AND marks > (SELECT AVG(marks) FROM results WHERE subject = 'Maths') ORDER BY student;\nSELECT learners.name FROM learners WHERE NOT EXISTS (SELECT 1 FROM results WHERE results.student = learners.name AND results.subject = 'Science') ORDER BY learners.name;`,
    explanation: 'The scalar subquery supplies the single Maths average to compare against, while NOT EXISTS tests row absence per learner without NULL pitfalls from NOT IN.',
    hints: ['Compare marks > (SELECT AVG(marks) ... Maths only).', 'Correlate the inner results.student with the outer learners.name.'],
    tests: [
      [`DROP TABLE IF EXISTS results;\nDROP TABLE IF EXISTS learners;\nCREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);\nCREATE TABLE learners (name TEXT);\nINSERT INTO learners VALUES ('Diya'),('Kabir'),('Meera');\nINSERT INTO results VALUES ('Diya','Maths',92),('Kabir','Maths',60),('Meera','Maths',76),('Diya','Science',80),('Meera','Science',70);`, 'Diya\nKabir'],
      [`DROP TABLE IF EXISTS results;\nDROP TABLE IF EXISTS learners;\nCREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);\nCREATE TABLE learners (name TEXT);\nINSERT INTO learners VALUES ('Ana'),('Bo'),('Cy');\nINSERT INTO results VALUES ('Ana','Maths',50),('Bo','Maths',90),('Cy','Maths',70),('Bo','Science',60),('Cy','Science',65);`, 'Bo\nAna'],
      [`DROP TABLE IF EXISTS results;\nDROP TABLE IF EXISTS learners;\nCREATE TABLE results (student TEXT, subject TEXT, marks INTEGER);\nCREATE TABLE learners (name TEXT);\nINSERT INTO learners VALUES ('Solo');\nINSERT INTO results VALUES ('Solo','Maths',42),('Solo','Science',42);`, ''],
    ],
  }),

  sqlQuestion({
    topic: 'sql-ctes', title: 'Names Above the CTE Average',
    statement: 'Use a WITH clause named avg_score to compute AVG(score) from scores, then output names whose score is strictly above that average. Print the integer-truncated average first as avg=<value> (CAST to INTEGER), followed by qualifying names ordered alphabetically.',
    input: 'Setup SQL creates scores(name, score).',
    output: 'First line avg=<integer average>, then one name per line.',
    constraints: 'Use a named CTE in each statement that needs it. Write SQLite-compatible SQL.',
    difficulty: 'Medium', tags: ['CTE', 'WITH'],
    starter: `-- TODO: WITH avg_score AS (...) then compare each score with the CTE value.\nSELECT name FROM scores ORDER BY name;`,
    solution: `WITH avg_score AS (SELECT AVG(score) AS avg_marks FROM scores)\nSELECT 'avg=' || CAST(avg_marks AS INTEGER) FROM avg_score;\nWITH avg_score AS (SELECT AVG(score) AS avg_marks FROM scores)\nSELECT scores.name FROM scores, avg_score WHERE scores.score > avg_score.avg_marks ORDER BY scores.name;`,
    explanation: 'The CTE names the average subquery once per statement and the main query filters against it, making the intent readable without a repeated nested expression.',
    hints: ['Define avg_score with SELECT AVG(score) AS avg_marks FROM scores.', 'A CTE belongs to one statement, so the second SELECT defines it again.'],
    tests: [
      [`DROP TABLE IF EXISTS scores;\nCREATE TABLE scores (name TEXT, score INTEGER);\nINSERT INTO scores VALUES ('Asha',92),('Bina',76),('Chet',88),('Diya',64);`, 'avg=80\nAsha\nChet'],
      [`DROP TABLE IF EXISTS scores;\nCREATE TABLE scores (name TEXT, score INTEGER);\nINSERT INTO scores VALUES ('Kim',50),('Lee',50),('Ana',80);`, 'avg=60\nAna'],
      [`DROP TABLE IF EXISTS scores;\nCREATE TABLE scores (name TEXT, score INTEGER);\nINSERT INTO scores VALUES ('Solo',42);`, 'avg=42'],
    ],
  }),

  sqlQuestion({
    topic: 'sql-views', title: 'Create and Read the Top-Students View',
    statement: 'Create a view named top_students containing name and marks for students with marks >= 90. Then select name and marks from the view ordered by marks descending, then name.',
    input: 'Setup SQL creates students(id,name,course,marks) and drops any prior top_students view.',
    output: 'Rows from the view: name|marks.',
    constraints: 'The final SELECT must read from top_students. Write SQLite-compatible SQL.',
    difficulty: 'Easy', tags: ['views'],
    starter: `-- TODO: CREATE VIEW top_students AS ..., then SELECT from that view.\nSELECT name, marks FROM students ORDER BY marks DESC, name;`,
    solution: `CREATE VIEW top_students AS SELECT name, marks FROM students WHERE marks >= 90;\nSELECT name, marks FROM top_students ORDER BY marks DESC, name;`,
    explanation: 'The view stores the reusable query definition; selecting from it applies the marks filter and exposes only the chosen columns.',
    hints: ['The view definition needs WHERE marks >= 90.', 'Put ORDER BY in the outer SELECT from the view.'],
    tests: [
      [studentsSetup("(1,'Asha','DB',92),(2,'Bina','DB',81),(3,'Chet','DB',90),(4,'Diya','DB',99)"), 'Diya|99\nAsha|92\nChet|90'],
      [studentsSetup("(1,'Kim','X',89),(2,'Lee','X',90),(3,'Ana','X',90)"), 'Ana|90\nLee|90'],
      [studentsSetup("(1,'Low','X',10),(2,'Mid','X',89)"), ''],
    ],
  }),

  sqlQuestion({
    topic: 'sql-normalization', title: 'Normalize Repeated Enrollment Facts',
    statement: 'Table enrollments_raw(student_id, student_name, course_id, course_title) repeats student and course names. Create students_norm as the distinct student facts, courses_norm as the distinct course facts, and enrollments_norm as student_id/course_id pairs. Then output counts as "<s> students, <c> courses, <e> enrollments" and joined student:course pairs ordered by student name then course title.',
    input: 'Setup SQL creates enrollments_raw and drops the three normalized tables.',
    output: 'First line: counts sentence. Following lines: student_name:course_title.',
    constraints: 'Use SELECT DISTINCT for entity tables and joins through enrollments_norm. Write SQLite-compatible SQL.',
    difficulty: 'Medium', tags: ['normalization', 'DISTINCT'],
    starter: `-- TODO: create students_norm/courses_norm with SELECT DISTINCT and enrollments_norm with ids only.\nSELECT student_name || ':' || course_title FROM enrollments_raw ORDER BY student_name, course_title;`,
    solution: `CREATE TABLE students_norm AS SELECT DISTINCT student_id, student_name FROM enrollments_raw;\nCREATE TABLE courses_norm AS SELECT DISTINCT course_id, course_title FROM enrollments_raw;\nCREATE TABLE enrollments_norm AS SELECT student_id, course_id FROM enrollments_raw;\nSELECT (SELECT COUNT(*) FROM students_norm) || ' students, ' || (SELECT COUNT(*) FROM courses_norm) || ' courses, ' || (SELECT COUNT(*) FROM enrollments_norm) || ' enrollments';\nSELECT s.student_name || ':' || c.course_title FROM enrollments_norm e JOIN students_norm s ON s.student_id = e.student_id JOIN courses_norm c ON c.course_id = e.course_id ORDER BY s.student_name, c.course_title;`,
    explanation: 'Distinct entity tables store each name/title once, while enrollments_norm stores only id pairs; joins reconstruct readable combinations without repeating facts.',
    hints: ['students_norm comes from SELECT DISTINCT student_id, student_name.', 'Join enrollments_norm to both entity tables on their ids.'],
    tests: [
      [`DROP TABLE IF EXISTS students_norm;\nDROP TABLE IF EXISTS courses_norm;\nDROP TABLE IF EXISTS enrollments_norm;\nDROP TABLE IF EXISTS enrollments_raw;\nCREATE TABLE enrollments_raw (student_id INTEGER, student_name TEXT, course_id INTEGER, course_title TEXT);\nINSERT INTO enrollments_raw VALUES (1,'Asha',10,'DB'),(1,'Asha',11,'OS'),(2,'Bina',10,'DB');`, '2 students, 2 courses, 3 enrollments\nAsha:DB\nAsha:OS\nBina:DB'],
      [`DROP TABLE IF EXISTS students_norm;\nDROP TABLE IF EXISTS courses_norm;\nDROP TABLE IF EXISTS enrollments_norm;\nDROP TABLE IF EXISTS enrollments_raw;\nCREATE TABLE enrollments_raw (student_id INTEGER, student_name TEXT, course_id INTEGER, course_title TEXT);\nINSERT INTO enrollments_raw VALUES (7,'Kim',1,'Math'),(7,'Kim',2,'Art'),(8,'Lee',1,'Math'),(9,'Ann',2,'Art');`, '3 students, 2 courses, 4 enrollments\nAnn:Art\nKim:Art\nKim:Math\nLee:Math'],
      [`DROP TABLE IF EXISTS students_norm;\nDROP TABLE IF EXISTS courses_norm;\nDROP TABLE IF EXISTS enrollments_norm;\nDROP TABLE IF EXISTS enrollments_raw;\nCREATE TABLE enrollments_raw (student_id INTEGER, student_name TEXT, course_id INTEGER, course_title TEXT);\nINSERT INTO enrollments_raw VALUES (1,'Solo',5,'Only');`, '1 students, 1 courses, 1 enrollments\nSolo:Only'],
    ],
  }),

  sqlQuestion({
    topic: 'sql-indexes-explain', title: 'Index the Course Column and Aggregate',
    statement: 'Create an index named idx_students_course on students(course). Then, for course Data Structures, output the student count, total marks, and "indexed:<integer average>" on one row.',
    input: 'Setup SQL drops the index and creates students(id,name,course,marks).',
    output: 'One row: count|total|indexed:<average>.',
    constraints: 'Create the named index before the aggregate SELECT. Write SQLite-compatible SQL.',
    difficulty: 'Easy', tags: ['indexes', 'aggregates'],
    starter: `-- TODO: CREATE INDEX idx_students_course ON students(course), then aggregate only 'Data Structures'.\nSELECT COUNT(*), SUM(marks), 'all' FROM students;`,
    solution: `CREATE INDEX idx_students_course ON students(course);\nSELECT COUNT(*), SUM(marks), 'indexed:' || (SUM(marks) / COUNT(*)) FROM students WHERE course = 'Data Structures';`,
    explanation: 'An index on course gives the planner a direct path to matching rows (benefit depends on size/selectivity); the aggregate then summarizes only the filtered course.',
    hints: ['CREATE INDEX idx_students_course ON students(course);', "Filter with WHERE course = 'Data Structures' before aggregating."],
    tests: [
      [`DROP INDEX IF EXISTS idx_students_course;\n${studentsSetup("(1,'Asha','Data Structures',92),(2,'Bina','Web',80),(3,'Chet','Data Structures',88),(4,'Diya','Data Structures',100)")}`, '3|280|indexed:93'],
      [`DROP INDEX IF EXISTS idx_students_course;\n${studentsSetup("(1,'Kim','Data Structures',70),(2,'Lee','Data Structures',90),(3,'Ana','Art',60)")}`, '2|160|indexed:80'],
      [`DROP INDEX IF EXISTS idx_students_course;\n${studentsSetup("(1,'Solo','Data Structures',77)")}`, '1|77|indexed:77'],
    ],
  }),

  sqlQuestion({
    topic: 'sql-transactions-acid', title: 'Commit an Atomic Money Transfer',
    statement: 'Table accounts(name, balance) contains Asha and Bina. Inside one transaction, move 100 from Asha to Bina, commit, and then output name:balance rows ordered by name.',
    input: 'Setup SQL creates accounts with Asha and Bina rows.',
    output: 'Two rows: Asha:<balance-100> and Bina:<balance+100>.',
    constraints: 'Both UPDATEs must be between BEGIN and COMMIT. Write SQLite-compatible SQL.',
    difficulty: 'Easy', tags: ['transactions', 'COMMIT', 'ACID'],
    starter: `-- TODO: wrap BOTH updates in BEGIN ... COMMIT.\nUPDATE accounts SET balance = balance - 100 WHERE name = 'Asha';\nSELECT name || ':' || balance FROM accounts ORDER BY name;`,
    solution: `BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE name = 'Asha';\nUPDATE accounts SET balance = balance + 100 WHERE name = 'Bina';\nCOMMIT;\nSELECT name || ':' || balance FROM accounts ORDER BY name;`,
    explanation: 'BEGIN groups debit and credit into one atomic unit; COMMIT makes both visible together so money cannot vanish between the two updates.',
    hints: ['Start with BEGIN; before the first UPDATE.', 'Do not forget the matching credit UPDATE for Bina before COMMIT.'],
    tests: [
      [`DROP TABLE IF EXISTS accounts;\nCREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER);\nINSERT INTO accounts VALUES ('Asha',1000),('Bina',500);`, 'Asha:900\nBina:600'],
      [`DROP TABLE IF EXISTS accounts;\nCREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER);\nINSERT INTO accounts VALUES ('Asha',100),('Bina',0);`, 'Asha:0\nBina:100'],
      [`DROP TABLE IF EXISTS accounts;\nCREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER);\nINSERT INTO accounts VALUES ('Asha',250),('Bina',750);`, 'Asha:150\nBina:850'],
    ],
  }),
];
