const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const pool = new Pool({
  connectionString: requireDatabaseUrl()
});

const questionsData = [
  // --- PYTHON QUESTIONS ---
  {
    id: 'py-001',
    language: 'python',
    course_id: 'python',
    topic_id: 'py-variables-datatypes',
    difficulty: 'Easy',
    title: 'Sum of Two Numbers',
    statement: 'Read two integers separated by space or newline, compute their sum, and print the result.',
    input_format: 'Two integers a and b.',
    output_format: 'A single integer representing the sum.',
    constraints: '-10^9 <= a, b <= 10^9',
    sample_input: '5 7',
    sample_output: '12',
    starter_code: {
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    a = int(lines[0])
    b = int(lines[1])
    # Write your solution here
    print(a + b)

solve()`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
  const a = parseInt(input[0], 10);
  const b = parseInt(input[1], 10);
  console.log(a + b);
}`,
      c: `#include <stdio.h>
int main() {
    long long a, b;
    if (scanf("%lld %lld", &a, &b) == 2) {
        printf("%lld\\n", a + b);
    }
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << endl;
    }
    return 0;
}`,
      java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLong()) {
            long a = sc.nextLong();
            long b = sc.nextLong();
            System.out.println(a + b);
        }
    }
}`
    },
    reference_solution: `import sys
lines = sys.stdin.read().split()
if lines:
    print(int(lines[0]) + int(lines[1]))`,
    solution_explanation: 'We read the two input tokens from standard input, convert them to 64-bit integers, and print their sum using the + operator.',
    hint_1: 'Read input using sys.stdin.read().split() to handle both spaces and newlines reliably.',
    hint_2: 'Convert the string tokens to integers using int(token) before adding them together.',
    test_cases: [
      { input: '5 7', expected_output: '12', is_hidden: false },
      { input: '100 -25', expected_output: '75', is_hidden: false },
      { input: '0 0', expected_output: '0', is_hidden: false },
      { input: '999999999 1', expected_output: '1000000000', is_hidden: true },
      { input: '-500 -500', expected_output: '-1000', is_hidden: true }
    ],
    expected_time_complexity: 'O(1)',
    expected_space_complexity: 'O(1)',
    tags: ['math', 'basics', 'io'],
    is_exam_eligible: true
  },
  {
    id: 'py-002',
    language: 'python',
    course_id: 'python',
    topic_id: 'py-conditionals-loops',
    difficulty: 'Easy',
    title: 'Even or Odd Number Check',
    statement: 'Given an integer n, print "EVEN" if the number is divisible by 2, or "ODD" if it is not.',
    input_format: 'A single integer n.',
    output_format: 'Print "EVEN" or "ODD" in uppercase.',
    constraints: '-10^9 <= n <= 10^9',
    sample_input: '14',
    sample_output: 'EVEN',
    starter_code: {
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    # Check even or odd
    if n % 2 == 0:
        print("EVEN")
    else:
        print("ODD")

main()`,
      c: `#include <stdio.h>
int main() {
    long long n;
    if (scanf("%lld", &n) == 1) {
        printf("%s\\n", (n % 2 == 0) ? "EVEN" : "ODD");
    }
    return 0;
}`
    },
    reference_solution: `import sys
n = int(sys.stdin.read().split()[0])
print("EVEN" if n % 2 == 0 else "ODD")`,
    solution_explanation: 'The modulo operator % returns 0 when a number is perfectly divisible by 2.',
    hint_1: 'Check if n % 2 == 0.',
    hint_2: 'Remember that negative even numbers (like -4) also yield n % 2 == 0.',
    test_cases: [
      { input: '14', expected_output: 'EVEN', is_hidden: false },
      { input: '7', expected_output: 'ODD', is_hidden: false },
      { input: '0', expected_output: 'EVEN', is_hidden: false },
      { input: '-8', expected_output: 'EVEN', is_hidden: true },
      { input: '-13', expected_output: 'ODD', is_hidden: true }
    ],
    expected_time_complexity: 'O(1)',
    expected_space_complexity: 'O(1)',
    tags: ['modulo', 'conditionals'],
    is_exam_eligible: true
  },
  {
    id: 'py-003',
    language: 'python',
    course_id: 'python',
    topic_id: 'py-strings-in-depth',
    difficulty: 'Medium',
    title: 'Reverse Words in a String',
    statement: 'Given a sentence containing multiple space-separated words, reverse the order of the words while keeping each individual word intact.',
    input_format: 'A line of text representing the sentence.',
    output_format: 'The sentence with its words reversed.',
    constraints: '1 <= Length of string <= 10^5',
    sample_input: 'Code Nexus makes coding fun',
    sample_output: 'fun coding makes Nexus Code',
    starter_code: {
      python: `import sys

def reverse_words():
    line = sys.stdin.read().strip()
    words = line.split()
    # Reverse the list of words and join with space
    print(" ".join(reversed(words)))

reverse_words()`,
      javascript: `const fs = require('fs');
const text = fs.readFileSync('/dev/stdin', 'utf-8').trim();
console.log(text.split(/\\s+/).reverse().join(' '));`
    },
    reference_solution: `import sys
words = sys.stdin.read().strip().split()
print(" ".join(words[::-1]))`,
    solution_explanation: 'We split the string on whitespace, slice with step -1 to reverse the array in O(N) time, and join with spaces.',
    hint_1: 'Use string.split() to break the input into a list of words.',
    hint_2: 'Use list[::-1] or reversed() and " ".join(...) to assemble the output.',
    test_cases: [
      { input: 'Code Nexus makes coding fun', expected_output: 'fun coding makes Nexus Code', is_hidden: false },
      { input: 'Hello World', expected_output: 'World Hello', is_hidden: false },
      { input: 'SingleWord', expected_output: 'SingleWord', is_hidden: true },
      { input: 'The quick brown fox jumps', expected_output: 'jumps fox brown quick The', is_hidden: true }
    ],
    expected_time_complexity: 'O(N)',
    expected_space_complexity: 'O(N)',
    tags: ['strings', 'array', 'two-pointer'],
    is_exam_eligible: true
  },

  // --- C LANGUAGE QUESTIONS ---
  {
    id: 'c-001',
    language: 'c',
    course_id: 'c-lang',
    topic_id: 'c-arithmetic-relational-ops',
    difficulty: 'Easy',
    title: 'Find Maximum of Three Numbers',
    statement: 'Read three integers a, b, and c. Print the maximum of the three numbers.',
    input_format: 'Three space-separated integers a, b, and c.',
    output_format: 'A single integer representing the greatest value.',
    constraints: '-10^6 <= a, b, c <= 10^6',
    sample_input: '12 45 30',
    sample_output: '45',
    starter_code: {
      c: `#include <stdio.h>

int main() {
    int a, b, c;
    if (scanf("%d %d %d", &a, &b, &c) == 3) {
        int maxVal = a;
        if (b > maxVal) maxVal = b;
        if (c > maxVal) maxVal = c;
        printf("%d\\n", maxVal);
    }
    return 0;
}`,
      cpp: `#include <iostream>
#include <algorithm>
using namespace std;
int main() {
    int a, b, c;
    if (cin >> a >> b >> c) {
        cout << max({a, b, c}) << endl;
    }
    return 0;
}`
    },
    reference_solution: `#include <stdio.h>
int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int m = (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
    printf("%d\\n", m);
    return 0;
}`,
    solution_explanation: 'We initialize max to a, and conditionally update with b and c if they are greater.',
    hint_1: 'Initialize a variable max = a.',
    hint_2: 'Use two if statements to compare max with b and then with c.',
    test_cases: [
      { input: '12 45 30', expected_output: '45', is_hidden: false },
      { input: '99 10 20', expected_output: '99', is_hidden: false },
      { input: '5 5 5', expected_output: '5', is_hidden: false },
      { input: '-10 -2 -50', expected_output: '-2', is_hidden: true },
      { input: '100 200 300', expected_output: '300', is_hidden: true }
    ],
    expected_time_complexity: 'O(1)',
    expected_space_complexity: 'O(1)',
    tags: ['conditionals', 'c-basics'],
    is_exam_eligible: true
  },
  {
    id: 'c-002',
    language: 'c',
    course_id: 'c-lang',
    topic_id: 'c-loops-for-while-do',
    difficulty: 'Medium',
    title: 'Calculate Factorial of N',
    statement: 'Given a non-negative integer n, compute its factorial: n! = 1 * 2 * ... * n. (0! = 1)',
    input_format: 'An integer n.',
    output_format: 'A 64-bit integer representing n!.',
    constraints: '0 <= n <= 20',
    sample_input: '5',
    sample_output: '120',
    starter_code: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        unsigned long long fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        printf("%llu\\n", fact);
    }
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        unsigned long long fact = 1;
        for (int i = 1; i <= n; i++) fact *= i;
        cout << fact << endl;
    }
    return 0;
}`
    },
    reference_solution: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    unsigned long long f = 1;
    for (int i = 1; i <= n; i++) f *= i;
    printf("%llu\\n", f);
    return 0;
}`,
    solution_explanation: 'A 64-bit unsigned integer (`unsigned long long`) holds values up to 20! without 32-bit overflow.',
    hint_1: 'Use `unsigned long long` to avoid integer overflow because factorials grow very fast.',
    hint_2: 'Special case: 0! is defined as 1. Initializing fact = 1 handles both 0 and 1.',
    test_cases: [
      { input: '5', expected_output: '120', is_hidden: false },
      { input: '0', expected_output: '1', is_hidden: false },
      { input: '1', expected_output: '1', is_hidden: false },
      { input: '10', expected_output: '3628800', is_hidden: true },
      { input: '15', expected_output: '1307674368000', is_hidden: true }
    ],
    expected_time_complexity: 'O(N)',
    expected_space_complexity: 'O(1)',
    tags: ['math', 'loops', 'overflow-safety'],
    is_exam_eligible: true
  },

  // --- C++ QUESTIONS ---
  {
    id: 'cpp-001',
    language: 'cpp',
    course_id: 'cpp',
    topic_id: 'cpp-stl-containers',
    difficulty: 'Easy',
    title: 'Find Kth Largest Element in Array',
    statement: 'Given an array of integers and an integer k, find the kth largest element in the array.',
    input_format: 'First line contains n and k. Second line contains n integers.',
    output_format: 'The kth largest element.',
    constraints: '1 <= k <= n <= 10^5',
    sample_input: '6 2\n3 2 1 5 6 4',
    sample_output: '5',
    starter_code: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        
        // Sort in descending order
        sort(nums.begin(), nums.end(), greater<int>());
        cout << nums[k - 1] << endl;
    }
    return 0;
}`,
      python: `import sys
lines = sys.stdin.read().split()
if lines:
    n, k = int(lines[0]), int(lines[1])
    nums = [int(x) for x in lines[2:2+n]]
    nums.sort(reverse=True)
    print(nums[k - 1])`
    },
    reference_solution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a.begin(), a.end(), greater<int>());
    cout << a[k-1] << endl;
    return 0;
}`,
    solution_explanation: 'By sorting the array in descending order with `greater<int>()`, the kth largest is directly at index k - 1.',
    hint_1: 'Sort the array descending using std::sort(nums.begin(), nums.end(), greater<int>()).',
    hint_2: 'The kth largest element will be at 0-indexed position (k - 1).',
    test_cases: [
      { input: '6 2\n3 2 1 5 6 4', expected_output: '5', is_hidden: false },
      { input: '5 1\n10 20 50 40 30', expected_output: '50', is_hidden: false },
      { input: '4 4\n1 2 3 4', expected_output: '1', is_hidden: true },
      { input: '7 3\n100 500 200 400 300 600 700', expected_output: '500', is_hidden: true }
    ],
    expected_time_complexity: 'O(N log N)',
    expected_space_complexity: 'O(1)',
    tags: ['stl', 'sort', 'heap'],
    is_exam_eligible: true
  },

  // --- JAVA QUESTIONS ---
  {
    id: 'java-001',
    language: 'java',
    course_id: 'java',
    topic_id: 'java-strings-stringbuilder',
    difficulty: 'Easy',
    title: 'Palindrome String Checker',
    statement: 'Given a word (alphanumeric characters, lowercase), determine if it reads the same backwards as forwards. Print "TRUE" or "FALSE".',
    input_format: 'A single word string.',
    output_format: 'Print "TRUE" or "FALSE".',
    constraints: '1 <= Length <= 10^5',
    sample_input: 'racecar',
    sample_output: 'TRUE',
    starter_code: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            boolean isPal = true;
            int left = 0, right = s.length() - 1;
            while (left < right) {
                if (s.charAt(left) != s.charAt(right)) {
                    isPal = false;
                    break;
                }
                left++;
                right--;
            }
            System.out.println(isPal ? "TRUE" : "FALSE");
        }
    }
}`,
      python: `import sys
s = sys.stdin.read().strip()
print("TRUE" if s == s[::-1] else "FALSE")`
    },
    reference_solution: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        String rev = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(rev) ? "TRUE" : "FALSE");
    }
}`,
    solution_explanation: 'We use two pointers meeting in the middle, comparing characters at symmetrical positions in O(N) time and O(1) extra space.',
    hint_1: 'Compare the first and last character. If they match, move inward towards the center.',
    hint_2: 'Alternatively, reverse the string with StringBuilder and test equality.',
    test_cases: [
      { input: 'racecar', expected_output: 'TRUE', is_hidden: false },
      { input: 'nexus', expected_output: 'FALSE', is_hidden: false },
      { input: 'a', expected_output: 'TRUE', is_hidden: false },
      { input: 'deified', expected_output: 'TRUE', is_hidden: true },
      { input: 'programming', expected_output: 'FALSE', is_hidden: true }
    ],
    expected_time_complexity: 'O(N)',
    expected_space_complexity: 'O(1)',
    tags: ['strings', 'two-pointer'],
    is_exam_eligible: true
  },

  // --- JAVASCRIPT QUESTIONS ---
  {
    id: 'js-001',
    language: 'javascript',
    course_id: 'javascript',
    topic_id: 'js-arrays-methods',
    difficulty: 'Easy',
    title: 'Array Flatten and Deduplicate',
    statement: 'Given an array of integers that may contain duplicates, output the unique numbers in ascending sorted order.',
    input_format: 'A list of space-separated integers.',
    output_format: 'Unique sorted integers separated by space.',
    constraints: '1 <= Length <= 10^5',
    sample_input: '4 2 5 2 4 1 5',
    sample_output: '1 2 4 5',
    starter_code: {
      javascript: `const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();
if (input) {
  const nums = input.split(/\\s+/).map(Number);
  const uniqueSorted = Array.from(new Set(nums)).sort((a, b) => a - b);
  console.log(uniqueSorted.join(' '));
}`,
      python: `import sys
nums = [int(x) for x in sys.stdin.read().split()]
print(" ".join(str(x) for x in sorted(set(nums))))`
    },
    reference_solution: `const fs = require('fs');
const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).map(Number);
console.log([...new Set(nums)].sort((a, b) => a - b).join(' '));`,
    solution_explanation: 'Passing the array to `new Set()` removes duplicates in O(N). Then `sort((a,b) => a - b)` sorts numerically.',
    hint_1: 'JavaScript Set automatically removes duplicate items.',
    hint_2: 'Remember that standard .sort() sorts alphabetically! Use .sort((a, b) => a - b) for numbers.',
    test_cases: [
      { input: '4 2 5 2 4 1 5', expected_output: '1 2 4 5', is_hidden: false },
      { input: '10 10 10', expected_output: '10', is_hidden: false },
      { input: '9 8 7 6', expected_output: '6 7 8 9', is_hidden: true },
      { input: '100 -5 20 -5 100', expected_output: '-5 20 100', is_hidden: true }
    ],
    expected_time_complexity: 'O(N log N)',
    expected_space_complexity: 'O(N)',
    tags: ['set', 'sort', 'javascript'],
    is_exam_eligible: true
  },

  // --- SQL QUESTIONS ---
  {
    id: 'sql-001',
    language: 'sql',
    course_id: 'sql-databases',
    topic_id: 'sql-select-filtering',
    difficulty: 'Easy',
    title: 'Top 3 Highest Scoring Students',
    statement: 'From the `students` table (columns: `id`, `name`, `score`), write a SQL query to return the `name` and `score` of the top 3 students with the highest scores. If scores tie, sort by name ascending.',
    input_format: 'Table `students(id INT, name VARCHAR, score INT)` is available.',
    output_format: 'Columns: `name`, `score`',
    constraints: 'At least 3 rows exist. Scores may tie or be negative; ties use name ASC.',
    sample_input: 'DROP TABLE IF EXISTS students; CREATE TABLE students (id INT, name TEXT, score INT); INSERT INTO students VALUES (1, "Alice", 95), (2, "Bob", 82), (3, "Charlie", 99), (4, "David", 91), (5, "Eva", 95);',
    sample_output: 'Charlie|99\nAlice|95\nEva|95',
    starter_code: {
      sql: `-- Write your SQL query below
SELECT name, score
FROM students
ORDER BY score DESC, name ASC
LIMIT 3;`
    },
    reference_solution: `SELECT name, score FROM students ORDER BY score DESC, name ASC LIMIT 3;`,
    solution_explanation: '`ORDER BY score DESC, name ASC` sorts primary by highest score and secondary by alphabetical name, while `LIMIT 3` selects the top 3.',
    hint_1: 'Use ORDER BY score DESC to sort highest scores first.',
    hint_2: 'Use LIMIT 3 to restrict the returned rows to 3.',
    test_cases: [
      {
        input: 'DROP TABLE IF EXISTS students; CREATE TABLE students (id INT, name TEXT, score INT); INSERT INTO students VALUES (1, "Alice", 95), (2, "Bob", 82), (3, "Charlie", 99), (4, "David", 91), (5, "Eva", 95);',
        expected_output: 'Charlie|99\nAlice|95\nEva|95',
        is_hidden: false
      },
      {
        input: 'DROP TABLE IF EXISTS students; CREATE TABLE students (id INT, name TEXT, score INT); INSERT INTO students VALUES (1, "Mina", 70), (2, "Ari", 70), (3, "Zed", 70), (4, "Bea", 69);',
        expected_output: 'Ari|70\nMina|70\nZed|70',
        is_hidden: true
      },
      {
        input: 'DROP TABLE IF EXISTS students; CREATE TABLE students (id INT, name TEXT, score INT); INSERT INTO students VALUES (1, "Nia", -5), (2, "Omar", -1), (3, "Pam", -10);',
        expected_output: 'Omar|-1\nNia|-5\nPam|-10',
        is_hidden: true
      },
      {
        input: 'DROP TABLE IF EXISTS students; CREATE TABLE students (id INT, name TEXT, score INT); INSERT INTO students VALUES (1, "Ivy", 88), (2, "Jay", 92), (3, "Kim", 92), (4, "Leo", 92), (5, "Ana", 92);',
        expected_output: 'Ana|92\nJay|92\nKim|92',
        is_hidden: true
      }
    ],
    expected_time_complexity: 'O(N log N)',
    expected_space_complexity: 'O(1)',
    tags: ['sql', 'order-by', 'limit'],
    is_exam_eligible: true
  }
];

// Generate procedural practice questions for all languages to reach large question pool!
const additionalLangs = ['c', 'cpp', 'python', 'java', 'sql', 'javascript'];
for (const lang of additionalLangs) {
  for (let i = 4; i <= 25; i++) {
    const qId = `${lang}-${String(i).padStart(3, '0')}`;
    // Every procedural variant is the same one-pass sum task, so its honest
    // difficulty is Easy. It must not be derived from the row/variant index.
    const diff = 'Easy';
    // Audit remediation: these 22-per-language rows are procedural variants
    // of one stdin-sum exercise. They previously shipped with an English
    // sentence as reference_solution, complete/wrong-language starters, and
    // inherited the DB default validation_status='reviewed'. They now carry
    // real per-language references, incomplete starters, an honest
    // validation_status='generated', and are not exam-eligible.
    const sumReferences = {
      python: "import sys\nprint(sum(int(x) for x in sys.stdin.read().split()))",
      c: "#include <stdio.h>\nint main() {\n    long long x, s = 0;\n    while (scanf(\"%lld\", &x) == 1) s += x;\n    printf(\"%lld\\n\", s);\n    return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    long long x, s = 0;\n    while (cin >> x) s += x;\n    cout << s << endl;\n    return 0;\n}",
      java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long s = 0;\n        while (sc.hasNextLong()) s += sc.nextLong();\n        System.out.println(s);\n    }\n}",
      javascript: "const fs = require('fs');\nconst nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);\nconsole.log(nums.reduce((a, b) => a + b, 0));",
      sql: "SELECT COALESCE(SUM(v), 0) FROM nums;",
    };
    const sumStarters = {
      python: "import sys\nnums = [int(x) for x in sys.stdin.read().split()]\n# TODO: print the sum of nums",
      c: "#include <stdio.h>\nint main() {\n    // TODO: read integers until EOF and print their sum\n    printf(\"0\\n\");\n    return 0;\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    // TODO: read integers until EOF and print their sum\n    cout << 0 << endl;\n    return 0;\n}",
      java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: sum every long from stdin and print the total\n        System.out.println(0);\n    }\n}",
      javascript: "const fs = require('fs');\nconst nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);\n// TODO: print the sum of nums\nconsole.log(0);",
      sql: "-- Table nums(v INTEGER) is created by the setup SQL.\n-- TODO: output the sum of v over all rows\nSELECT 0;",
    };
    const isSql = lang === 'sql';
    const sqlSetup1 = 'DROP TABLE IF EXISTS nums; CREATE TABLE nums (v INTEGER); INSERT INTO nums VALUES (1),(2),(3),(4),(5);';
    const sqlSetup2 = 'DROP TABLE IF EXISTS nums; CREATE TABLE nums (v INTEGER); INSERT INTO nums VALUES (10),(20),(30);';
    questionsData.push({
      id: qId,
      language: lang,
      course_id: lang === 'c' ? 'c-lang' : (lang === 'cpp' ? 'cpp' : (lang === 'sql' ? 'sql-databases' : lang)),
      topic_id: `${lang}-algorithms`,
      difficulty: diff,
      title: `${lang.toUpperCase()} Problem #${i}: Algorithmic Challenge`,
      statement: isSql
        ? `The setup SQL creates table nums(v INTEGER) with several rows. Write a query that outputs the sum of all v values (variant ${i}).`
        : `Read an array of ${i} values from input and calculate the aggregate target sum and check boundary constraints for index ${i}.`,
      input_format: isSql ? 'Setup SQL creating and filling nums(v).' : 'Space-separated integers.',
      output_format: 'Single integer computed value.',
      constraints: `N <= ${i * 100}`,
      sample_input: isSql ? sqlSetup1 : '1 2 3 4 5',
      sample_output: '15',
      starter_code: { [lang]: sumStarters[lang] },
      reference_solution: sumReferences[lang],
      solution_explanation: 'Accumulate array elements using standard loop or sum function.',
      hint_1: 'Iterate through all tokens provided on standard input.',
      hint_2: 'Accumulate each integer value into a 64-bit running sum variable.',
      test_cases: isSql
        ? [
            { input: sqlSetup1, expected_output: '15', is_hidden: false },
            { input: sqlSetup2, expected_output: '60', is_hidden: true }
          ]
        : [
            { input: '1 2 3 4 5', expected_output: '15', is_hidden: false },
            { input: '10 20 30', expected_output: '60', is_hidden: true }
          ],
      expected_time_complexity: 'O(N)',
      expected_space_complexity: 'O(1)',
      tags: ['algorithms', 'math', lang],
      is_exam_eligible: false,
      validation_status: 'generated'
    });
  }
}

// ---------------------------------------------------------------------------
// Audit remediation (starter-leak fix): the original starter_code for these
// hand-written questions contained complete solutions, so learners could
// submit the untouched starter and pass. Execution audit
// (scripts/audit-curated-starters.js) verified the leak; these scaffolds keep
// only input parsing plus a TODO. They run but produce no solved output.
// ---------------------------------------------------------------------------
const STARTER_SCAFFOLDS = {
  'py-001': {
    python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    a = int(lines[0])\n    b = int(lines[1])\n    # TODO: compute and print the sum of a and b\n\nsolve()`,
    javascript: `const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n  const a = parseInt(input[0], 10);\n  const b = parseInt(input[1], 10);\n  // TODO: print the sum of a and b\n}`,
    c: `#include <stdio.h>\nint main() {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) == 2) {\n        // TODO: print the sum of a and b\n    }\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        // TODO: print the sum of a and b\n    }\n    return 0;\n}`,
    java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long a = sc.nextLong();\n            long b = sc.nextLong();\n            // TODO: print the sum of a and b\n        }\n    }\n}`,
  },
  'py-002': {
    python: `import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    # TODO: print EVEN or ODD for n\n\nmain()`,
    c: `#include <stdio.h>\nint main() {\n    long long n;\n    if (scanf("%lld", &n) == 1) {\n        // TODO: print EVEN or ODD for n\n    }\n    return 0;\n}`,
  },
  'py-003': {
    python: `import sys\n\ndef reverse_words():\n    line = sys.stdin.read().strip()\n    words = line.split()\n    # TODO: print the words in reverse order, joined by single spaces\n\nreverse_words()`,
    javascript: `const fs = require('fs');\nconst text = fs.readFileSync('/dev/stdin', 'utf-8').trim();\n// TODO: print the words of text in reverse order`,
  },
  'c-001': {
    c: `#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    if (scanf("%d %d %d", &a, &b, &c) == 3) {\n        // TODO: print the largest of a, b and c\n    }\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int a, b, c;\n    if (cin >> a >> b >> c) {\n        // TODO: print the largest of a, b and c\n    }\n    return 0;\n}`,
  },
  'c-002': {
    c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        // TODO: compute and print n! (use unsigned long long)\n    }\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    if (cin >> n) {\n        // TODO: compute and print n! (use unsigned long long)\n    }\n    return 0;\n}`,
  },
  'cpp-001': {
    cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> nums(n);\n        for (int i = 0; i < n; i++) cin >> nums[i];\n        // TODO: print the kth largest element of nums\n    }\n    return 0;\n}`,
    python: `import sys\nlines = sys.stdin.read().split()\nif lines:\n    n, k = int(lines[0]), int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    # TODO: print the kth largest element of nums`,
  },
  'java-001': {
    java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // TODO: print TRUE if s is a palindrome, otherwise FALSE\n        }\n    }\n}`,
    python: `import sys\ns = sys.stdin.read().strip()\n# TODO: print TRUE if s is a palindrome, otherwise FALSE`,
  },
  'js-001': {
    javascript: `const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nif (input) {\n  const nums = input.split(/\\s+/).map(Number);\n  // TODO: print the unique numbers sorted ascending, space-separated\n}`,
    python: `import sys\nnums = [int(x) for x in sys.stdin.read().split()]\n# TODO: print the unique numbers sorted ascending, space-separated`,
  },
  'sql-001': {
    sql: `-- TODO: return the top 3 students by score (ties by name ASC)\nSELECT name, score FROM students ORDER BY name;`,
  },
};
for (const q of questionsData) {
  if (STARTER_SCAFFOLDS[q.id]) q.starter_code = STARTER_SCAFFOLDS[q.id];
}

// The nine hand-written rows above are the exact rows covered by
// scripts/audit-curated-starters.js: every reference was executed Accepted
// and every starter was not Accepted (persisted evidence:
// scripts/question-bank/curated-starter-audit.json). Mark only these seeded
// hand-written rows as tested; the legacy pipeline no longer performs an
// unexecuted status promotion.
const HAND_TESTED_IDS = new Set(Object.keys(STARTER_SCAFFOLDS));
for (const q of questionsData) {
  if (HAND_TESTED_IDS.has(q.id)) q.validation_status = 'tested';
}

async function seedQuestions() {
  const client = await pool.connect();
  try {
    console.log(`--- Seeding ${questionsData.length} Questions into Code Nexus Bank ---`);
    await client.query('BEGIN');

    for (const q of questionsData) {
      await client.query(`
        INSERT INTO questions (
          id, language, course_id, topic_id, difficulty, title, statement,
          input_format, output_format, constraints, sample_input, sample_output,
          starter_code, reference_solution, solution_explanation,
          hint_1, hint_2, test_cases, expected_time_complexity, expected_space_complexity,
          tags, is_exam_eligible, validation_status,
          mapping_status, practice_only, taxonomy_version, generation_schema_version
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
          $24, $25, $26, $27
        ) ON CONFLICT (id) DO UPDATE SET
          language = EXCLUDED.language,
          course_id = EXCLUDED.course_id,
          topic_id = EXCLUDED.topic_id,
          title = EXCLUDED.title,
          statement = EXCLUDED.statement,
          input_format = EXCLUDED.input_format,
          output_format = EXCLUDED.output_format,
          constraints = EXCLUDED.constraints,
          difficulty = EXCLUDED.difficulty,
          sample_input = EXCLUDED.sample_input,
          sample_output = EXCLUDED.sample_output,
          starter_code = EXCLUDED.starter_code,
          reference_solution = EXCLUDED.reference_solution,
          solution_explanation = EXCLUDED.solution_explanation,
          hint_1 = EXCLUDED.hint_1,
          hint_2 = EXCLUDED.hint_2,
          test_cases = EXCLUDED.test_cases,
          expected_time_complexity = EXCLUDED.expected_time_complexity,
          expected_space_complexity = EXCLUDED.expected_space_complexity,
          tags = EXCLUDED.tags,
          is_exam_eligible = EXCLUDED.is_exam_eligible,
          mapping_status = EXCLUDED.mapping_status,
          practice_only = EXCLUDED.practice_only,
          taxonomy_version = EXCLUDED.taxonomy_version,
          generation_schema_version = EXCLUDED.generation_schema_version,
          -- Procedural rows are explicitly 'generated'; never let a reseed
          -- downgrade a hand-verified row from 'tested'.
          validation_status = CASE WHEN EXCLUDED.validation_status = 'generated' THEN 'generated' ELSE questions.validation_status END;
      `, [
        q.id, q.language, q.course_id,
        // Only the nine execution-audited hand rows keep a curriculum topic.
        // The 132 procedural rows are legacy generated records and must stay
        // honestly unassigned rather than revive synthetic topic labels.
        q.validation_status === 'tested' ? q.topic_id : null,
        q.difficulty, q.title, q.statement,
        q.input_format, q.output_format, q.constraints, q.sample_input, q.sample_output,
        JSON.stringify(q.starter_code), q.reference_solution, q.solution_explanation,
        q.hint_1, q.hint_2, JSON.stringify(q.test_cases), q.expected_time_complexity,
        q.expected_space_complexity, q.tags,
        q.validation_status === 'tested' ? q.is_exam_eligible : false,
        q.validation_status || 'generated',
        q.validation_status === 'tested' ? 'mapped' : 'unassigned',
        q.validation_status === 'tested' ? !q.is_exam_eligible : true,
        'curriculum-129-v2',
        1
      ]);
    }

    await client.query('COMMIT');
    console.log(`✅ ${questionsData.length} Questions seeded into PostgreSQL question bank!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding questions:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedQuestions();
}

module.exports = { questionsData, seedQuestions };
