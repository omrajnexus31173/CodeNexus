const { cBatch3Topics } = require('./c-batch3');
const { createMemoryLayoutSvg } = require('./diagrams');

const twoRemaining = [
  {
    id: 'c-keywords-identifiers',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Keywords, Identifiers & Naming Conventions',
    description: '32 standard C keywords, identifier naming rules, case sensitivity, and good variable naming conventions.',
    order_index: 4,
    learning_objectives: [
      'Learn the 32 reserved keywords in ANSI C89 and modern C99/C11 additions',
      'Master the strict lexical rules for naming identifiers in C',
      'Adopt professional snake_case naming conventions for readable systems code'
    ],
    prerequisites: ['Structure of a C Program'],
    expected_outcomes: ['Able to write valid C identifiers and avoid illegal keyword clashes and shadow errors'],
    formal_definition: 'Keywords are reserved lexical tokens in C that have predefined syntactic meanings and cannot be used as identifiers. Identifiers are user-defined names given to variables, functions, and structures.',
    content_simple_english: `In C, words in your source code fall into two main categories:
1. Keywords (Reserved Words): Exactly 32 words reserved by the language (like int, return, if, while, struct, sizeof). You CANNOT use these words as variable or function names!
2. Identifiers: Custom names you invent for your variables and functions (like totalScore, studentCount, calculateAverage).

Rules for Naming Identifiers:
- Allowed characters: Letters (a-z, A-Z), Digits (0-9), and Underscores (_).
- First character MUST be a letter or underscore (it can NEVER start with a digit: 1stScore is ILLEGAL).
- C is strictly CASE-SENSITIVE: count, Count, and COUNT are three completely separate variables!
- No spaces or special symbols ($ # @ -) are permitted in identifier names.`,
    hinglish_explanation: `C me do tarah ke shabd hote hain:
1. Keywords: C ke apne reserved shabd (jaise int, float, if, else, return). Ye 32 hote hain aur inko aap variable ka naam nahi bana sakte! (jaise int return = 5; likhna galat hai).
2. Identifiers: Jo naam aap khud sochte ho (jaise int student_age = 20;).

Rules:
- Naam hamesha letter ya underscore se shuru hona chahiye (1st_rank galat hai, rank_1 sahi hai).
- C case-sensitive hai: name, Name, aur NAME teeno alag-alag hain!
- Beech me space ya symbols jaise @, #, - use nahi kar sakte.`,
    why_it_matters: 'Naming rules prevent compiler lexical analysis errors. Clean naming conventions (snake_case) make systems code readable and maintainable across large teams.',
    when_to_use: 'Use snake_case for C variables (e.g. user_id, buffer_len) and UPPER_SNAKE_CASE for constants and macros (#define MAX_RETRIES 3).',
    syntax_guide: {
      template: 'int valid_identifier_name = 10;\nconst int MAX_LIMIT = 100;\nvoid process_telemetry_packet(void);',
      components: [
        { name: 'valid_identifier', role: 'Must start with [a-zA-Z_] followed by [a-zA-Z0-9_]*', required: true }
      ],
      rules: ['Cannot match any of the 32 reserved keywords', 'Must not exceed 63 significant initial characters in C99']
    },
    code_example_1_title: 'Basic Foundational: Valid vs Invalid Identifier Demonstration',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    // Valid identifiers
    int total_score = 95;
    int _session_id = 1024;
    int userAge2 = 21;

    printf("Total Score: %d\\n", total_score);
    printf("Session ID : %d\\n", _session_id);
    printf("User Age   : %d\\n", userAge2);
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates valid identifiers using lowercase, underscores, leading underscores, and trailing digits.',
    code_example_1_output: `Total Score: 95
Session ID : 1024
User Age   : 21`,

    code_example_2_title: 'Intermediate Logic: Case Sensitivity in Practice',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    int item = 10;
    int Item = 20;
    int ITEM = 30;

    printf("item (lower) : %d\\n", item);
    printf("Item (mixed) : %d\\n", Item);
    printf("ITEM (upper) : %d\\n", ITEM);

    return 0;
}`,
    code_example_2_explanation: 'Proves that C distinguishes case: item, Item, and ITEM hold independent stack memory allocations.',
    code_example_2_output: `item (lower) : 10
Item (mixed) : 20
ITEM (upper) : 30`,

    code_example_3_title: 'Practical Application: Systems Configuration Registry Structure',
    code_example_3_code: `#include <stdio.h>

#define SYS_CONF_MAX_QUEUE 1000

typedef struct {
    int worker_thread_count;
    int timeout_seconds;
} server_config_t;

int main(void) {
    server_config_t default_cfg = {4, 30};
    printf("--- SYS REGISTRY ---\\n");
    printf("Max Queue Capacity: %d\\n", SYS_CONF_MAX_QUEUE);
    printf("Worker Threads    : %d\\n", default_cfg.worker_thread_count);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates professional C systems naming: UPPER_SNAKE_CASE macros, snake_case_t typedefs, and clear descriptive field identifiers.',
    code_example_3_output: `--- SYS REGISTRY ---
Max Queue Capacity: 1000
Worker Threads    : 4`,

    code_walkthrough: {
      code: `int x_1 = 5;\nint _x = 10;\nprintf("%d\\n", x_1 + _x);`,
      steps: [
        { line: 1, explanation: 'Valid identifier x_1 allocated with value 5.', state: 'x_1 = 5' },
        { line: 2, explanation: 'Valid identifier _x allocated with value 10.', state: '_x = 10' },
        { line: 3, explanation: 'Sum of x_1 and _x is computed and printed.', state: 'Stdout: 15' }
      ],
      output: '15',
      output_reasoning: '5 + 10 evaluates to 15.'
    },

    rules_and_restrictions: [
      'Keywords like int, for, while, return cannot be redefined as identifiers',
      'Identifiers starting with double underscore (__) or underscore and uppercase letter (_A) are reserved for compiler internals'
    ],
    common_mistakes: [
      {
        title: 'Starting identifier with a digit',
        incorrect_code: `int 1st_rank = 1; // ILLEGAL: starts with 1`,
        explanation: 'Lexical grammar requires identifiers to begin with a nondigit character (letter or underscore).',
        corrected_code: `int rank_1 = 1;`,
        error_message: 'error: invalid suffix on integer constant',
        debug_tip: 'Always start variable names with a lowercase letter or underscore.'
      }
    ],
    comparison_table: {
      title: 'Keywords vs Identifiers',
      concept_a: 'Keywords',
      concept_b: 'Identifiers',
      headers: ['Feature', 'Keywords', 'Identifiers'],
      rows: [
        ['Definition', 'Reserved by C language grammar (32 in C89)', 'Custom names created by the developer'],
        ['Examples', 'int, if, while, return, sizeof, struct', 'student_name, total_points, calculate_gpa'],
        ['Customizability', 'Cannot be altered or reused', 'Can be customized freely adhering to naming rules']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Linux kernel coding style guidelines (clean snake_case naming)',
      'Enterprise C API design ensuring symbol clarity across global codebases'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which of the following is an ILLEGAL identifier in C?',
        options: ['_count', 'total_score', '2nd_value', 'MAX_BUFFER'],
        correct_index: 2,
        explanation: 'Identifiers in C cannot begin with a numeric digit. 2nd_value violates this rule.'
      }
    ],
    key_takeaways: [
      'Keywords are reserved by C and cannot be used as variable names.',
      'Identifiers must start with a letter or underscore, never a digit.',
      'C is case-sensitive.'
    ],
    quick_revision_notes: '32 C89 keywords. Identifiers: [a-zA-Z_][a-zA-Z0-9_]*. Case-sensitive. No spaces or dashes.',
    assignment_prompt: 'Write a program declaring three variables total_apples = 10, total_oranges = 5, and total_fruits = total_apples + total_oranges, and print the total.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Declare valid identifiers and print sum
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    int total_apples = 10;
    int total_oranges = 5;
    int total_fruits = total_apples + total_oranges;

    printf("Total Fruits: %d\\n", total_fruits);
    return 0;
}`
  },

  {
    id: 'c-constants-literals',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Constants, Literals & #define vs const',
    description: 'Master fixed values in C: integer literals, float literals, string literals, preprocessor macros (#define), and type-safe const variables.',
    order_index: 5,
    learning_objectives: [
      'Learn the types of literals in C: decimal, octal, hexadecimal, float, and character',
      'Understand the architectural differences between #define macros and const variables',
      'Prevent accidental macro side effects and type-safety errors'
    ],
    prerequisites: ['Keywords, Identifiers & Naming Conventions'],
    expected_outcomes: ['Able to choose appropriately between const and #define and format literals in various number bases'],
    formal_definition: 'A literal is a fixed source code representation of an immutable value. A constant in C is an identifier whose bound value cannot be modified at runtime, declared using the const type qualifier or preprocessor macro.',
    content_simple_english: `When developing software, some values should never change (like mathematical constants, max retry limits, or array buffer sizes).
In C, we have two primary ways to create constants:
1. #define Macros (#define MAX_USERS 100):
   - Handled by the Preprocessor (text search-and-replace).
   - Does NOT have a data type or scope.
   - Does NOT take up memory in the data segment.
2. const Variables (const int maxUsers = 100;):
   - Handled by the C Compiler.
   - Strictly TYPE-SAFE and follows normal scope rules.
   - Stored in read-only memory (RODATA segment).

Literal representations in C:
- Decimal: 42
- Hexadecimal: 0x2A (starts with 0x)
- Octal: 052 (starts with 0)
- Character: 'A' (enclosed in single quotes)
- String: "Hello" (enclosed in double quotes)`,
    hinglish_explanation: `Constants wo values hoti hain jo program chalne ke dauran kabhi badalni nahi chahiye (jaise PI = 3.14 ya MAX_ATTEMPTS = 3).

C me constants banane ke 2 tareeqe hain:
1. #define PI 3.14: Ye preprocessor directive hai. Compiler ke aane se pehle hi ye code me jaha bhi PI likha hoga, waha 3.14 chipka dega. Iska koi data type nahi hota.
2. const float PI = 3.14;: Ye type-safe hota hai aur compiler check karta hai ki aap galti se PI ki value ko badal na dein!

Number formats:
- Normal number: 10
- Hexadecimal: 0xFF (0x se shuru hota hai)
- Character: 'C' (single quote)
- String: "Code Nexus" (double quotes)`,
    why_it_matters: 'Avoids "magic numbers" scattered through code, improves readability, and allows compilers to place constants in secure read-only memory pages.',
    when_to_use: 'Prefer const int or enum over #define for values, because const provides type-safety, debugger symbol visibility, and scope boundaries. Use #define for conditional compilation flags (#ifdef).',
    syntax_guide: {
      template: '#define BUFFER_LIMIT 1024\nconst double PI = 3.14159265;\nenum { STATE_IDLE, STATE_RUNNING };',
      components: [
        { name: 'const type name', role: 'Qualifies variable as read-only storage', required: true },
        { name: '#define NAME val', role: 'Macro text replacement', required: false }
      ],
      rules: ['const variables cannot be modified after initialization', 'Preprocessor macros do not have scope and ignore namespace rules']
    },
    code_example_1_title: 'Basic Foundational: Using const and Number Bases',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    const int decimalVal = 255;
    const int hexVal = 0xFF; // 255 in hex
    const int octalVal = 0377; // 255 in octal

    printf("Decimal     : %d\\n", decimalVal);
    printf("Hexadecimal : %d (formatted as 0x%X)\\n", hexVal, hexVal);
    printf("Octal       : %d (formatted as 0%o)\\n", octalVal, octalVal);

    return 0;
}`,
    code_example_1_explanation: 'Demonstrates that 255, 0xFF, and 0377 evaluate to the exact same binary value in memory.',
    code_example_1_output: `Decimal     : 255
Hexadecimal : 255 (formatted as 0xFF)
Octal       : 255 (formatted as 0377)`,

    code_example_2_title: 'Intermediate Logic: #define Macro Side Effects vs const',
    code_example_2_code: `#include <stdio.h>

// Dangerous macro without parentheses!
#define SQUARE_BAD(x) x * x
// Safe macro with parentheses
#define SQUARE_SAFE(x) ((x) * (x))

int main(void) {
    // The pitfall only appears when the argument is an expression:
    // SQUARE_BAD(2+3) expands to 2 + 3 * 2 + 3 = 11, not 25!
    printf("Bad Macro Result (2+3)^2 : %d (WRONG!)\\n", SQUARE_BAD(2 + 3));
    printf("Safe Macro Result (2+3)^2: %d (CORRECT!)\\n", SQUARE_SAFE(2 + 3));
    return 0;
}`,
    code_example_2_explanation: 'Proves the operator precedence pitfall of unparenthesized macros versus safe expressions.',
    code_example_2_output: `Bad Macro Result (2+3)^2 : 11 (WRONG!)
Safe Macro Result (2+3)^2: 25 (CORRECT!)`,

    code_example_3_title: 'Practical Application: Read-Only System Configuration Table',
    code_example_3_code: `#include <stdio.h>

typedef struct {
    const char *endpoint;
    const int port;
    const int max_retries;
} ServiceConfig;

int main(void) {
    const ServiceConfig API_CONFIG = {"https://api.codenexus.dev", 443, 3};

    printf("Service Endpoint : %s\\n", API_CONFIG.endpoint);
    printf("Target Port      : %d\\n", API_CONFIG.port);
    printf("Max Retry Limit  : %d\\n", API_CONFIG.max_retries);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates an immutable configuration struct placed in read-only memory to protect critical production parameters.',
    code_example_3_output: `Service Endpoint : https://api.codenexus.dev
Target Port      : 443
Max Retry Limit  : 3`,

    code_walkthrough: {
      code: `const int MAX = 100;\nprintf("%d\\n", MAX);`,
      steps: [
        { line: 1, explanation: 'Compiler allocates read-only integer MAX with value 100.', state: 'MAX = 100 (RO)' },
        { line: 2, explanation: 'Prints value 100.', state: 'Stdout: 100' }
      ],
      output: '100',
      output_reasoning: 'MAX is an immutable constant holding 100.'
    },

    rules_and_restrictions: [
      'Attempting to reassign a const variable produces a compilation error',
      'Always wrap macro parameters in parentheses: #define MULT(a, b) ((a) * (b))'
    ],
    common_mistakes: [
      {
        title: 'Attempting to reassign a const variable',
        incorrect_code: `const int LIMIT = 50;\nLIMIT = 100; // COMPILER ERROR!`,
        explanation: 'const qualifier marks storage location as read-only.',
        corrected_code: `int limit = 50;\nlimit = 100; // If mutation is needed, omit const`,
        error_message: 'error: assignment of read-only variable "LIMIT"',
        debug_tip: 'Only use const for values that must never change during execution.'
      }
    ],
    comparison_table: {
      title: '#define vs const in C',
      concept_a: '#define Macro',
      concept_b: 'const Variable',
      headers: ['Feature', '#define', 'const Variable'],
      rows: [
        ['Processed by', 'Preprocessor (Text substitution)', 'Compiler (Type check and AST)'],
        ['Type Safety', 'None (untyped token replacement)', 'Strictly type-safe (enforces data types)'],
        ['Scope', 'Global from point of definition onward', 'Respects block and function scope { }'],
        ['Debugger Support', 'Symbol often not visible in GDB', 'Full symbol name and address visible in debugger']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Defining firmware hardware register masks (e.g. 0x01, 0x02)',
      'Security policies setting maximum failed login thresholds'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which prefix denotes a hexadecimal literal in C?',
        options: ['0b', '0x', '0o', '#'],
        correct_index: 1,
        explanation: 'In C, hexadecimal literals begin with 0x or 0X (e.g. 0xFF represents 255).'
      }
    ],
    key_takeaways: [
      'const variables are type-safe and respect scope; #define macros are text replacements.',
      'Always wrap macro arguments in parentheses to avoid precedence bugs.',
      'Literals support decimal, octal (0), and hexadecimal (0x) notation.'
    ],
    quick_revision_notes: 'const type var = val; #define NAME ((val)). 0x = hex, 0 = octal. Single quotes for char, double for string.',
    assignment_prompt: 'Write a C program that defines a constant SPEED_OF_LIGHT = 299792458 (m/s) using const long and prints it.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Declare SPEED_OF_LIGHT and print
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    const long SPEED_OF_LIGHT = 299792458L;
    printf("Speed of Light: %ld m/s\\n", SPEED_OF_LIGHT);
    return 0;
}`
  }
];

cBatch3Topics.push(...twoRemaining);
