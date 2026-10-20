/**
 * Code Nexus — C Programming Curriculum Batch 3
 * Completes all 17 C topics with full 14-section educational engine standard.
 */

const {
  createPointerMemorySvg,
  createMemoryLayoutSvg,
  createControlFlowSvg,
} = require('./diagrams');

const cBatch3Topics = [
  {
    id: 'c-arithmetic-relational-ops',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Arithmetic and Relational Operators',
    description: 'Master binary and unary arithmetic operators (+, -, *, /, %), integer division truncation, and relational comparisons (==, !=, <, >, <=, >=).',
    order_index: 8,
    learning_objectives: [
      'Master the five standard arithmetic operators (+, -, *, /, %) in C',
      'Understand why integer division truncates decimal remainders towards zero',
      'Learn relational comparison operators and how C represents boolean truth as 1 and false as 0'
    ],
    prerequisites: ['Data Types and Type Modifiers'],
    expected_outcomes: ['Able to write arithmetic expressions without integer division loss or operator precedence errors'],
    formal_definition: 'Arithmetic operators compute mathematical operations on numerical operands. Relational operators test the relationship between two operands, yielding integer 1 for true and integer 0 for false in C.',
    content_simple_english: `Computers spend most of their time performing calculations and making comparisons.
1. Arithmetic Operators:
   - Addition (+), Subtraction (-), Multiplication (*).
   - Division (/): CRITICAL TRAP! In C, if both numbers are integers, 5 / 2 gives **2**, NOT 2.5! The decimal is discarded (truncated). To get 2.5, at least one operand must be a float: 5.0 / 2.
   - Modulo (%): Gives the remainder after integer division. 7 % 3 gives 1. Note: % works ONLY on integers!

2. Relational Operators:
   - Equal to (==): Note the double equals sign! A single = is assignment!
   - Not equal to (!=).
   - Greater than (>), Less than (<), Greater than or equal (>=), Less than or equal (<=).
   In C, there is no separate boolean type in basic C89; comparisons evaluate to integer **1** (true) or **0** (false).`,
    hinglish_explanation: `C me hisaab-kitaab karne ke liye Arithmetic operators hote hain:
1. Division Trap (/):
   C me agar aap do integers ko divide karoge, jaise 7 / 2, toh answer 3 aayega (point ke baad wala part cut ho jata hai)!
   Agar aapko 3.5 chahiye, toh aapko likhna padega: 7.0 / 2 ya (float)7 / 2.
2. Modulo (%):
   Ye bacha hua remainder (sheshphal) deta hai. Jaise 10 % 3 = 1. Ye sirf integers ke sath chalta hai.

Relational Operators (Tulna karna):
- == (barabar hai ya nahi? Yaad rahe double = lagate hain!)
- != (barabar nahi hai)
- >, <, >=, <=
C me true ka matlab 1 hota hai aur false ka matlab 0 hota hai!`,
    why_it_matters: 'Integer division truncation is one of the most common causes of calculation bugs in financial and scientific computing software.',
    when_to_use: 'Use % to check for even/odd numbers (num % 2 == 0) or cyclic array indices. Cast to float/double before division whenever decimal precision is needed.',
    syntax_guide: {
      template: 'int sum = a + b;\nfloat avg = (float)total / count;\nint is_greater = (x > y);',
      components: [
        { name: '/', role: 'Division: integer if operands are int; floating if any operand is float', required: true },
        { name: '%', role: 'Modulo: yields remainder; requires integer operands', required: true },
        { name: '==', role: 'Relational equality test yielding 1 (true) or 0 (false)', required: true }
      ],
      rules: ['Modulo operator % cannot be used on float or double operands', 'Division by zero triggers SIGFPE (Floating point exception crash)']
    },
    code_example_1_title: 'Basic Foundational: Integer Truncation vs Float Division',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    int a = 7, b = 2;
    int int_div = a / b;
    float float_div = (float)a / b;
    int remainder = a % b;

    printf("Integer Division   7 / 2 = %d (Truncated!)\\n", int_div);
    printf("Float Division (float)7 / 2 = %.2f (Accurate)\\n", float_div);
    printf("Modulo Remainder   7 %% 2 = %d\\n", remainder);
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates integer truncation vs explicit float casting and modulo remainder.',
    code_example_1_output: `Integer Division   7 / 2 = 3 (Truncated!)
Float Division (float)7 / 2 = 3.50 (Accurate)
Modulo Remainder   7 % 2 = 1`,

    code_example_2_title: 'Intermediate Logic: Relational Operators and Boolean Representation',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    int score = 85;
    int passing = 50;

    int passed = (score >= passing);
    int is_perfect = (score == 100);

    printf("Score >= Passing : %d (1 represents TRUE)\\n", passed);
    printf("Score == 100     : %d (0 represents FALSE)\\n", is_perfect);

    return 0;
}`,
    code_example_2_explanation: 'Shows relational comparisons returning integer 1 for true and 0 for false in C.',
    code_example_2_output: `Score >= Passing : 1 (1 represents TRUE)
Score == 100     : 0 (0 represents FALSE)`,

    code_example_3_title: 'Practical Application: Circular Ring Buffer Indexing with Modulo',
    code_example_3_code: `#include <stdio.h>

#define BUFFER_SIZE 4

int main(void) {
    int events[] = {101, 102, 103, 104, 105, 106};
    int ring_buffer[BUFFER_SIZE] = {0};

    printf("Simulating Circular Event Ring Buffer:\\n");
    for (int i = 0; i < 6; i++) {
        int slot = i % BUFFER_SIZE; // Wraps around [0, 1, 2, 3]
        ring_buffer[slot] = events[i];
        printf("Event %d stored in slot %d\\n", events[i], slot);
    }
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates how modulo operator % is used in systems programming to build circular queues and ring buffers.',
    code_example_3_output: `Simulating Circular Event Ring Buffer:
Event 101 stored in slot 0
Event 102 stored in slot 1
Event 103 stored in slot 2
Event 104 stored in slot 3
Event 105 stored in slot 0
Event 106 stored in slot 1`,

    code_walkthrough: {
      code: `int x = 10 % 3;\nint y = (x == 1);\nprintf("%d", y);`,
      steps: [
        { line: 1, explanation: '10 divided by 3 has quotient 3 and remainder 1. x becomes 1.', state: 'x = 1' },
        { line: 2, explanation: 'x == 1 evaluates to true. In C, true evaluates to 1. y becomes 1.', state: 'y = 1' },
        { line: 3, explanation: 'Prints value of y: 1.', state: 'Stdout: 1' }
      ],
      output: '1',
      output_reasoning: '10 % 3 = 1; 1 == 1 evaluates to 1 (true).'
    },

    rules_and_restrictions: [
      'Division by zero (x / 0 or x % 0) results in undefined behavior and crashes the program with SIGFPE',
      'The operands of % must have integer types (e.g. 5.5 % 2 is a compilation error)'
    ],
    common_mistakes: [
      {
        title: 'Accidental assignment inside comparison (if (x = 5))',
        incorrect_code: `int x = 0;\nif (x = 5) { // Single equals assignment!\n    printf("Always runs!\\n");\n}`,
        explanation: 'x = 5 assigns 5 to x, and the expression evaluates to 5 (non-zero/true), so the if branch runs unconditionally.',
        corrected_code: `if (x == 5) { ... }`,
        error_message: 'warning: suggest parentheses around assignment used as truth value',
        debug_tip: 'Always use double equals == for comparisons.'
      }
    ],
    comparison_table: {
      title: 'Assignment (=) vs Equality (==)',
      concept_a: '= (Assignment)',
      concept_b: '== (Relational Equality)',
      headers: ['Feature', '= (Assignment)', '== (Relational Equality)'],
      rows: [
        ['Purpose', 'Stores value of RHS expression into LHS variable', 'Compares LHS and RHS values for equality'],
        ['Return Value', 'The assigned value', 'Integer 1 (if equal) or 0 (if not equal)'],
        ['Operands', 'LHS must be a modifiable lvalue', 'Both sides can be any rvalue expression']
      ]
    },
    diagram_svg: createControlFlowSvg('Relational Decision', 'score >= 50?', 'Return 1 (PASS)', 'Return 0 (FAIL)', 'Complete'),
    practical_applications: [
      'Packet checksum calculations in networking protocols',
      'Circular buffer pointer arithmetic in operating system kernel device drivers'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the result of 9 / 2 in C when both operands are integers?',
        options: ['4.5', '4', '5', '4.0'],
        correct_index: 1,
        explanation: 'In C, integer division truncates any fractional portion towards zero. 9 / 2 evaluates to integer 4.'
      }
    ],
    key_takeaways: [
      'Integer division truncates decimals in C; use float casting when decimals are needed.',
      'Modulo % produces remainder and requires integer operands.',
      'Relational operators evaluate to 1 for true and 0 for false.'
    ],
    quick_revision_notes: '+, -, *, /, %. 5 / 2 = 2. (float)5 / 2 = 2.5. == compares; = assigns. 1 = true, 0 = false.',
    assignment_prompt: 'Write a C program that takes two integers a = 17 and b = 5, and prints both the quotient and the remainder.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    int a = 17, b = 5;
    // Compute quotient and remainder and print
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    int a = 17, b = 5;
    int quotient = a / b;
    int remainder = a % b;

    printf("Quotient : %d\\n", quotient);
    printf("Remainder: %d\\n", remainder);
    return 0;
}`
  },

  {
    id: 'c-logical-assignment-ops',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Logical and Compound Assignment Operators',
    description: 'Master logical operators (&&, ||, !), short-circuit evaluation, compound assignment (+=, -=, *=, /=), and increment/decrement operators (++x vs x++).',
    order_index: 9,
    learning_objectives: [
      'Master logical operators (&&, ||, !) and boolean logic in C',
      'Understand Short-Circuit Evaluation and how to prevent dangerous side effects',
      'Master prefix vs postfix increment/decrement (++x vs x++) and compound operators'
    ],
    prerequisites: ['Arithmetic and Relational Operators'],
    expected_outcomes: ['Able to write safe logical conditions relying on short-circuit order and correctly predict ++ side effects'],
    formal_definition: 'Logical operators (&&, ||, !) perform boolean conjunction, disjunction, and negation with short-circuit evaluation semantics. Compound assignment operators combine binary operations with variable storage.',
    content_simple_english: `Logical operators allow you to combine multiple conditions:
1. Logical AND (&&): True ONLY if BOTH conditions are true.
2. Logical OR (||): True if AT LEAST ONE condition is true.
3. Logical NOT (!): Inverts truth (turns true into false, and false into true).

Short-Circuit Evaluation:
C evaluates logical expressions from left to right and STOPS as soon as the outcome is certain!
- In (A && B): If A is false (0), C NEVER evaluates B! (Because false AND anything is always false).
- In (A || B): If A is true (1), C NEVER evaluates B! (Because true OR anything is always true).
This is crucial: programmers rely on short-circuiting to check pointers before dereferencing: if (ptr != NULL && *ptr > 0)!

Increment Operators:
- Pre-increment (++x): Increments x FIRST, then returns the new value.
- Post-increment (x++): Returns current value of x FIRST, then increments x afterwards.`,
    hinglish_explanation: `Conditions ko aapas me jodne ke liye Logical Operators use hote hain:
1. && (AND): Jab dono conditions true honi chahiye (jaise age >= 18 && has_license == 1).
2. || (OR): Jab koi bhi EK condition true ho toh chal jayega (jaise is_admin || is_editor).
3. ! (NOT): Ulta kar deta hai (!true ban jata hai false).

Short-Circuit Evaluation (Dimag lagana):
C left se right check karta hai:
- Agar && me pehli condition hi FALSE ho gayi, toh C doosri condition ko check hi nahi karega!
- Agar || me pehli condition TRUE ho gayi, toh doosri ko check karne ki zaroorat hi nahi!
Iska sabse bada faayda: if (ptr != NULL && *ptr == 10) — agar ptr NULL hai toh C aage badhega hi nahi, jisse program crash hone se bach jata hai!

Increment Trap (++x vs x++):
- ++x: Pehle value badhao, phir use karo.
- x++: Pehle purani value use karo, baad me badhao.`,
    why_it_matters: 'Short-circuiting prevents Null Pointer Exceptions (Segmentation Faults) and avoids executing expensive database/network calls unnecessarily.',
    when_to_use: 'Always put safety checks on the left side of && (e.g. index >= 0 && index < size && arr[index] == target).',
    syntax_guide: {
      template: 'if (conditionA && conditionB) { ... }\nx += 5; // equivalent to x = x + 5;\nint next = ++count;',
      components: [
        { name: '&&', role: 'Short-circuit logical AND', required: true },
        { name: '||', role: 'Short-circuit logical OR', required: true },
        { name: '+=', role: 'Compound assignment: adds RHS to LHS in-place', required: false }
      ],
      rules: ['Never modify the same variable more than once in an unsequenced expression (e.g. i = i++ + ++i is Undefined Behavior)']
    },
    code_example_1_title: 'Basic Foundational: Logical AND, OR, and NOT',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    int age = 22;
    int has_id = 1;

    if (age >= 18 && has_id) {
        printf("Verification: Access Granted!\\n");
    }

    int is_weekend = 0;
    int is_holiday = 1;
    if (is_weekend || is_holiday) {
        printf("Office Status: Closed today.\\n");
    }

    return 0;
}`,
    code_example_1_explanation: 'Demonstrates basic logical conjunction (&&) and disjunction (||) evaluation.',
    code_example_1_output: `Verification: Access Granted!
Office Status: Closed today.`,

    code_example_2_title: 'Intermediate Logic: Short-Circuit Evaluation Guarding Pointers',
    code_example_2_code: `#include <stdio.h>

int sideEffect(void) {
    printf("Side effect executed!\\n");
    return 1;
}

int main(void) {
    int *ptr = NULL;

    printf("--- Test 1: Short-Circuit NULL Guard ---\\n");
    // If ptr is NULL, the second check (*ptr > 0) is NEVER evaluated, preventing crash!
    if (ptr != NULL && *ptr > 0) {
        printf("Value is positive\\n");
    } else {
        printf("Safely blocked without SegFault!\\n");
    }

    printf("\\n--- Test 2: OR Short-Circuit ---\\n");
    if (1 || sideEffect()) {
        printf("OR short-circuited; side effect did not run.\\n");
    }

    return 0;
}`,
    code_example_2_explanation: 'Shows short-circuit evaluation preventing segmentation faults when testing NULL pointers.',
    code_example_2_output: `--- Test 1: Short-Circuit NULL Guard ---
Safely blocked without SegFault!

--- Test 2: OR Short-Circuit ---
OR short-circuited; side effect did not run.`,

    code_example_3_title: 'Practical Application: Prefix vs Postfix in Buffer Consumption',
    code_example_3_code: `#include <stdio.h>

int main(void) {
    int buffer[] = {10, 20, 30, 40};
    int read_idx = 0;

    // Postfix: uses current read_idx, then increments for next read
    int item1 = buffer[read_idx++];
    int item2 = buffer[read_idx++];

    printf("Read item 1: %d (new read_idx: %d)\\n", item1, read_idx - 1);
    printf("Read item 2: %d (current read_idx: %d)\\n", item2, read_idx);

    return 0;
}`,
    code_example_3_explanation: 'Demonstrates idiomatic C systems programming where postfix increment buffer[idx++] consumes and advances indices in a single statement.',
    code_example_3_output: `Read item 1: 10 (new read_idx: 1)
Read item 2: 20 (current read_idx: 2)`,

    code_walkthrough: {
      code: `int a = 5;\nint b = a++;\nint c = ++a;\nprintf("%d %d %d", a, b, c);`,
      steps: [
        { line: 1, explanation: 'a is initialized to 5.', state: 'a = 5' },
        { line: 2, explanation: 'Postfix: b gets old value (5), then a becomes 6.', state: 'b = 5, a = 6' },
        { line: 3, explanation: 'Prefix: a increments first to 7, then c gets 7.', state: 'a = 7, c = 7' },
        { line: 4, explanation: 'Prints a, b, c: 7 5 7.', state: 'Stdout: 7 5 7' }
      ],
      output: '7 5 7',
      output_reasoning: 'b receives a before increment (5); c receives a after increment (7); final a is 7.'
    },

    rules_and_restrictions: [
      'In C, any non-zero integer is considered TRUE, and exactly zero (0) is considered FALSE',
      'Never write code with unsequenced modifications like arr[i] = i++; this produces undefined behavior in standard C'
    ],
    common_mistakes: [
      {
        title: 'Using bitwise & instead of logical &&',
        incorrect_code: `if (a > 0 & b > 0) { ... } // Bitwise AND! Does NOT short-circuit!`,
        explanation: '& is bitwise AND, not logical AND. Bitwise & evaluates BOTH sides unconditionally, defeating NULL pointer guards.',
        corrected_code: `if (a > 0 && b > 0) { ... }`,
        error_message: 'Potential crash due to lack of short-circuiting',
        debug_tip: 'Always use double && and double || for logical conditional checks.'
      }
    ],
    comparison_table: {
      title: 'Prefix (++x) vs Postfix (x++)',
      concept_a: 'Prefix (++x)',
      concept_b: 'Postfix (x++)',
      headers: ['Aspect', 'Prefix (++x)', 'Postfix (x++)'],
      rows: [
        ['Timing', 'Increments variable BEFORE expression evaluation', 'Increments variable AFTER expression evaluation'],
        ['Value Returned', 'The newly incremented value', 'The original value before increment'],
        ['Performance in C', 'Identical for primitive types', 'Identical for primitive types']
      ]
    },
    diagram_svg: createControlFlowSvg('Short-Circuit', 'Left condition true?', 'Evaluate Right condition', 'Skip Right (Short-Circuit)', 'Done'),
    practical_applications: [
      'Kernel memory safety guards verifying pointers prior to struct access',
      'High-speed network packet header validation'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'In the expression (0 && func()), will func() be called?',
        options: ['Yes, always', 'No, because of short-circuit evaluation', 'Only if compiled with -O0', 'It depends on the compiler'],
        correct_index: 1,
        explanation: 'In C logical AND (&&), if the left operand evaluates to 0 (false), the entire expression is guaranteed false and the right side is never evaluated.'
      }
    ],
    key_takeaways: [
      '&& and || perform short-circuit evaluation from left to right.',
      'Postfix (x++) uses then increments; prefix (++x) increments then uses.',
      'Short-circuiting is an essential security idiom for guarding against NULL pointers.'
    ],
    quick_revision_notes: '&& = AND, || = OR, ! = NOT. Short-circuits left-to-right. Postfix: use old val, then inc. Prefix: inc, then use new val.',
    assignment_prompt: 'Write a program demonstrating short-circuit evaluation: write an is_safe() function that returns 0, and verify in an if (is_safe() && side_effect()) that side_effect() is never called.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Demonstrate short-circuiting
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int side_effect(void) {
    printf("THIS SHOULD NOT PRINT!\\n");
    return 1;
}

int main(void) {
    int is_authorized = 0;
    if (is_authorized && side_effect()) {
        printf("Authorized\\n");
    } else {
        printf("Short-circuit protected: side effect skipped.\\n");
    }
    return 0;
}`
  },

  {
    id: 'c-standard-io',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Standard Input and Output (printf, scanf, format specifiers)',
    description: 'Master standard I/O in <stdio.h>: printf formatting flags, field width, precision, scanf address-of operator (&), and buffer input safety.',
    order_index: 6,
    learning_objectives: [
      'Master printf format specifiers (%d, %f, %lf, %c, %s, %p, %x)',
      'Control output alignment, width, padding, and precision with printf formatting',
      'Understand scanf mechanics, why & (address-of) is required, and how to avoid buffer overflow'
    ],
    prerequisites: ['Data Types and Type Modifiers'],
    expected_outcomes: ['Able to format complex terminal reports and safely read numeric and string user inputs'],
    formal_definition: 'Standard I/O in C provides buffered character and formatted input/output streams via stdout, stdin, and stderr defined in <stdio.h>.',
    content_simple_english: `Communication between your program and the user occurs through Standard Streams:
1. stdout (Standard Output): Displays text on the screen via printf().
2. stdin (Standard Input): Reads keyboard input via scanf().
3. stderr (Standard Error): Displays unbuffered error messages.

printf Formatting Power:
- %d / %i: signed decimal integer
- %u: unsigned decimal integer
- %f: float (double)
- %.2f: float with exactly 2 digits after decimal
- %c: single character
- %s: null-terminated character string
- %p: hexadecimal memory pointer address
- %10d: right-align integer in 10-character width
- %-10d: left-align integer in 10-character width

scanf & The & Address-of Operator:
When you call scanf("%d", &age), you MUST pass the memory address (&age), NOT age itself! Why? Because C functions receive parameters by value (copies). To modify your original variable, scanf needs to know where it lives in memory!`,
    hinglish_explanation: `Terminal pe text print karne aur user se input lene ke liye <stdio.h> use hota hai:
1. printf(): Screen pe print karta hai.
   - %d: Integer ke liye
   - %.2f: Point ke baad sirf 2 digits dikhane ke liye (jaise 45.50)
   - %s: Text (string) ke liye
   - %p: Memory ka address dekhne ke liye (hexadecimal)

2. scanf(): User se input lene ke liye.
   - Isme hamesha **& (address-of)** lagana padta hai: scanf("%d", &age);
   - Kyun? Kyunki scanf ko aapke variable ka memory address chahiye taaki wo usme value store kar sake! Agar & bhool gaye, toh program Segmentation Fault se crash ho jayega!`,
    why_it_matters: 'Incorrect format specifiers cause undefined behavior and memory leaks. Insecure scanf calls without width limits (%s) cause buffer overflow vulnerabilities.',
    when_to_use: 'Use printf for formatted outputs. Use fgets() instead of scanf("%s") when reading strings to avoid buffer overflow exploits.',
    syntax_guide: {
      template: 'printf("Formatted: %-10s %5.2f\\n", name, price);\nscanf("%d", &integer_variable);',
      components: [
        { name: 'printf', role: 'Formatted stream output method', required: true },
        { name: 'scanf', role: 'Formatted stream input parsing method', required: true },
        { name: '&', role: 'Address-of operator required for scalar arguments in scanf', required: true }
      ],
      rules: ['Format specifier must match argument data type exactly', 'Never use gets(); it is permanently removed from standard C']
    },
    code_example_1_title: 'Basic Foundational: printf Formatting Flags and Width',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    int id = 42;
    double price = 19.995;
    char code = 'A';

    printf("ID with zero padding (4 digits): %04d\\n", id);
    printf("Price rounded to 2 decimals    : $%.2f\\n", price);
    printf("Character code                 : %c (ASCII %d)\\n", code, code);
    return 0;
}`,
    code_example_1_explanation: 'Shows width padding (%04d), precision truncation (%.2f), and character-to-ASCII conversion.',
    code_example_1_output: `ID with zero padding (4 digits): 0042
Price rounded to 2 decimals    : $20.00
Character code                 : A (ASCII 65)`,

    code_example_2_title: 'Intermediate Logic: Reading Formatted Numerical Input with scanf',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    int day, month, year;
    // Simulating input parsing: expects DD/MM/YYYY
    const char *input = "19/10/2026";
    
    // sscanf reads from an in-memory string buffer
    int items_read = sscanf(input, "%d/%d/%d", &day, &month, &year);

    if (items_read == 3) {
        printf("Parsed Date -> Day: %02d | Month: %02d | Year: %d\\n", day, month, year);
    } else {
        printf("Malformed date string!\\n");
    }
    return 0;
}`,
    code_example_2_explanation: 'Demonstrates reading multiple formatted values and validating the return value of scan functions.',
    code_example_2_output: `Parsed Date -> Day: 19 | Month: 10 | Year: 2026`,

    code_example_3_title: 'Practical Application: Tabular Ledger Report Alignment',
    code_example_3_code: `#include <stdio.h>

typedef struct {
    int id;
    const char *name;
    double balance;
} Account;

int main(void) {
    Account accounts[] = {
        {101, "Nexus Systems", 15420.50},
        {102, "Cyber Corp", 8940.25},
        {103, "Dev Labs", 320.00}
    };

    printf("%-6s | %-15s | %10s\\n", "ACC_ID", "CLIENT NAME", "BALANCE");
    printf("----------------------------------------\\n");
    for (int i = 0; i < 3; i++) {
        printf("%-6d | %-15s | $%9.2f\\n", 
               accounts[i].id, accounts[i].name, accounts[i].balance);
    }
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates professional console reporting using left alignment (%-15s) and right alignment (%10s).',
    code_example_3_output: `ACC_ID | CLIENT NAME     |    BALANCE
----------------------------------------
101    | Nexus Systems   | $ 15420.50
102    | Cyber Corp      | $  8940.25
103    | Dev Labs        | $   320.00`,

    code_walkthrough: {
      code: `int x = 42;\nprintf("Hex: 0x%X", x);`,
      steps: [
        { line: 1, explanation: 'Integer variable x allocated with decimal value 42.', state: 'x = 42' },
        { line: 2, explanation: 'Format specifier %X converts 42 to uppercase hexadecimal 2A.', state: 'Formatted: 0x2A' },
        { line: 2, explanation: 'String emitted to standard output stream.', state: 'Stdout: Hex: 0x2A' }
      ],
      output: 'Hex: 0x2A',
      output_reasoning: '42 in hexadecimal is 2 * 16 + 10 = 2A.'
    },

    rules_and_restrictions: [
      'In scanf, forgetting the & operator causes invalid memory writes and crashes with Segmentation Fault',
      'Always limit string inputs: scanf("%99s", buffer) to prevent buffer overflows into adjacent memory'
    ],
    common_mistakes: [
      {
        title: 'Omitting & in scanf for numeric variables',
        incorrect_code: `int age;\nscanf("%d", age); // MISSING & operator!`,
        explanation: 'Without &, the uninitialized value of age is treated as a memory address, writing user data into arbitrary RAM.',
        corrected_code: `scanf("%d", &age);`,
        error_message: 'warning: format "%d" expects argument of type "int *", but argument 2 has type "int"',
        debug_tip: 'Always pass the address &variable to scanf for primitive scalar types.'
      }
    ],
    comparison_table: {
      title: 'printf vs scanf in C',
      concept_a: 'printf()',
      concept_b: 'scanf()',
      headers: ['Feature', 'printf()', 'scanf()'],
      rows: [
        ['Purpose', 'Formatted output to stdout stream', 'Formatted input from stdin stream'],
        ['Argument Passing', 'Passes values directly (pass-by-value)', 'Requires pointers/addresses &var (pass-by-reference)'],
        ['Return Value', 'Number of characters printed', 'Number of input items successfully matched and assigned']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Command-line utilities and CLI admin tools (e.g. git, docker, top)',
      'Embedded microcontroller serial telemetry outputs'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What happens if you omit the & operator when reading an int with scanf("%d", x)?',
        options: [
          'It compiles and works fine',
          'It writes data to an invalid memory location causing a crash or corruption',
          'It automatically fixes it at runtime',
          'It converts it to a character'
        ],
        correct_index: 1,
        explanation: 'scanf expects a pointer to int (int *). Passing x passes its current raw integer value as a pointer address, leading to undefined memory corruption.'
      }
    ],
    key_takeaways: [
      'printf formats data for screen output; scanf parses input streams.',
      'Always use & with scalar variables in scanf.',
      'Always specify maximum width when reading strings to avoid buffer overflows.'
    ],
    quick_revision_notes: 'printf("%d %f %s", val); scanf("%d", &val); %.2f = 2 decimals. %-10s = left aligned 10 width. Pass & to scanf.',
    assignment_prompt: 'Write a C program that prints an invoice line item with Item: "SSD", Quantity: 2, Unit Price: 49.99, and Total formatted to 2 decimal places.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Print formatted invoice line
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    const char *item = "SSD";
    int qty = 2;
    double price = 49.99;
    double total = qty * price;

    printf("Item: %s | Qty: %d | Unit: $%.2f | Total: $%.2f\\n", item, qty, price, total);
    return 0;
}`
  },

  {
    id: 'c-escape-sequences',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Escape Sequences and Special Characters',
    description: 'Master C escape sequences (\\n, \\t, \\r, \\b, \\\\, \\", \\\', \\0) and understand ASCII control characters.',
    order_index: 7,
    learning_objectives: [
      'Understand the ASCII control characters represented by escape sequences',
      'Master the standard escape sequences in C (\\n, \\t, \\\\, \\", \\\', \\0)',
      'Understand null terminator \\0 and its role in C string boundaries'
    ],
    prerequisites: ['Standard Input and Output'],
    expected_outcomes: ['Able to control terminal cursor movement and format multi-line text strings accurately'],
    formal_definition: 'An escape sequence is a character sequence in a string or character literal that begins with a backslash (\\) and is translated by the compiler into an ASCII control character or special literal symbol.',
    content_simple_english: `When writing strings, how do you include a quotation mark inside the quotes? Or how do you tell the computer to jump to a new line or insert a tab space?
We use the **Backslash (\\)** as an "escape character":
- \\n: Newline (moves cursor to next line)
- \\t: Horizontal tab (aligns to 8-character tab stops)
- \\\\: Literal backslash character
- \\": Double quotation mark inside a string
- \\': Single quotation mark inside a character constant
- \\0: The **Null Terminator**! (Marks the exact end of a C string in memory)
- \\r: Carriage return (moves cursor back to the start of the current line)`,
    hinglish_explanation: `Strings likhte time jab hume special commands dene hote hain (jaise nayi line pe jana ya quotation mark print karna), toh hum **Backslash (\\)** use karte hain:
- \\n: Nayi line pe jane ke liye (Enter dabane jaisa)
- \\t: Tab space (bada gap) dene ke liye
- \\": Double quotes print karne ke liye (jaise "Usne kaha \\"Hello\\"")
- \\\\: Asli backslash print karne ke liye (kyunki akele \\ ko C command samajh leta hai)
- \\0: Sabse zaroori! **Null Terminator**—ye C ko batata hai ki String yaha khatam ho gayi hai!`,
    why_it_matters: 'The null terminator \\0 is the fundamental cornerstone of string security in C; missing it causes buffer overflows and memory leakage.',
    when_to_use: 'Use \\n for console line breaks and \\t for quick terminal column alignment. Use \\0 to terminate custom char buffers.',
    syntax_guide: {
      template: 'printf("Line 1\\nLine 2\\tTabbed\\n");\nchar quote[] = "She said, \\"Hello!\\"";',
      components: [
        { name: '\\n', role: 'ASCII 10 (Line Feed / Newline)', required: false },
        { name: '\\t', role: 'ASCII 9 (Horizontal Tab)', required: false },
        { name: '\\0', role: 'ASCII 0 (Null Terminator string boundary)', required: true }
      ],
      rules: ['Unrecognized escape sequences like \\z result in compiler warnings or undefined behavior']
    },
    code_example_1_title: 'Basic Foundational: Newlines and Tabs in Output Formatting',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    printf("1. First Line\\n2. Second Line\\n");
    printf("ColA\\tColB\\tColC\\n");
    printf("100\\t200\\t300\\n");
    return 0;
}`,
    code_example_1_explanation: 'Shows \\n moving output to a fresh line and \\t aligning columns along tab stops.',
    code_example_1_output: `1. First Line
2. Second Line
ColA	ColB	ColC
100	200	300`,

    code_example_2_title: 'Intermediate Logic: Quotes and File Paths with Double Backslash',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    // Printing double quotes inside a string
    printf("System message: \\"Nexus Kernel Online\\"\\n");

    // Printing backslashes in Windows file paths
    printf("Config Path: C:\\\\Nexus\\\\Config\\\\settings.json\\n");

    return 0;
}`,
    code_example_2_explanation: 'Shows escaping double quotes with \\" and literal backslashes with \\\\.',
    code_example_2_output: `System message: "Nexus Kernel Online"
Config Path: C:\\Nexus\\Config\\settings.json`,

    code_example_3_title: 'Practical Application: Null Terminator String Truncation',
    code_example_3_code: `#include <stdio.h>

int main(void) {
    char greeting[] = "Hello Code Nexus";
    printf("Original String: %s\\n", greeting);

    // Manually placing null terminator \\0 cuts string short!
    greeting[5] = '\\0';

    printf("After \\\\0 at index 5: %s\\n", greeting);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates how printf(%s) reads memory until it encounters \\0. Inserting \\0 at index 5 truncates the string cleanly.',
    code_example_3_output: `Original String: Hello Code Nexus
After \\0 at index 5: Hello`,

    code_walkthrough: {
      code: `char str[] = "A\\nB";\nprintf("%s", str);`,
      steps: [
        { line: 1, explanation: 'Array contains 4 bytes: \'A\', \'\\n\' (ASCII 10), \'B\', and \'\\0\'.', state: 'Memory: [\'A\', 10, \'B\', 0]' },
        { line: 2, explanation: 'Prints \'A\', advances to newline, then prints \'B\'.', state: 'Stdout: A\\nB' }
      ],
      output: 'A\nB',
      output_reasoning: '\\n instructs the terminal output stream to advance to the next line.'
    },

    rules_and_restrictions: [
      'In C, every string literal automatically includes a trailing \\0 null byte inserted by the compiler',
      'Forgetting \\\\ when writing file paths results in malformed strings (e.g. "C:\\temp" is read as tab \\t)'
    ],
    common_mistakes: [
      {
        title: 'Single backslash in Windows file paths',
        incorrect_code: `char path[] = "C:\\test\\notes.txt"; // \\t and \\n become escape sequences!`,
        explanation: '\\t is interpreted as Tab and \\n as Newline, completely corrupting the filename path.',
        corrected_code: `char path[] = "C:\\\\test\\\\notes.txt";`,
        error_message: 'File open failure (ENOENT: file not found)',
        debug_tip: 'Always use double backslashes \\\\ for literal directory separators.'
      }
    ],
    comparison_table: {
      title: 'Common Escape Sequences',
      concept_a: 'Control Sequences',
      concept_b: 'Literal Sequences',
      headers: ['Sequence', 'Meaning', 'ASCII Value', 'Type'],
      rows: [
        ['\\n', 'Newline (Line Feed)', '10 (0x0A)', 'Cursor control'],
        ['\\t', 'Horizontal Tab', '9 (0x09)', 'Cursor control'],
        ['\\0', 'Null Terminator', '0 (0x00)', 'String boundary'],
        ['\\\\', 'Literal Backslash', '92 (0x5C)', 'Literal character'],
        ['\\"', 'Double Quote', '34 (0x22)', 'Literal character']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Formatting terminal logging output with ANSI color and cursor codes',
      'Low-level parsing of CSV and TSV (Tab Separated Values) data files'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What character terminates strings in C memory?',
        options: ['\\n', '\\t', '\\0', ';'],
        correct_index: 2,
        explanation: 'Strings in C are terminated by the null character \\0 (ASCII 0), which signals the end of the character array.'
      }
    ],
    key_takeaways: [
      'Escape sequences start with backslash \\ to represent non-printable or special characters.',
      '\\n creates a newline; \\t inserts a tab; \\0 terminates strings.',
      'Use \\\\ to print a literal backslash.'
    ],
    quick_revision_notes: '\\n = Newline. \\t = Tab. \\" = Quote. \\\\ = Backslash. \\0 = Null byte (string end).',
    assignment_prompt: 'Write a program that prints: He said, "C is powerful!" on one line, followed by a tabbed line with Version: \\1.0\\.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Print escaped string
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    printf("He said, \\"C is powerful!\\"\\n");
    printf("\\tVersion: \\\\1.0\\\\\\n");
    return 0;
}`
  },

  {
    id: 'c-functions-basics',
    course_id: 'c-lang',
    unit_id: 'c-unit-2',
    title: 'Function Basics (Declaration, Definition, Call)',
    description: 'Master modular C programming: function prototypes, definitions, parameters, return types, call stack execution, and pass-by-value semantics.',
    order_index: 10,
    learning_objectives: [
      'Master the distinction between function declaration (prototype) and definition',
      'Understand how the CPU Call Stack manages stack frames, return addresses, and local variables',
      'Understand pass-by-value semantics and why local variable modifications do not persist in caller'
    ],
    prerequisites: ['Structure of a C Program', 'Data Types and Type Modifiers'],
    expected_outcomes: ['Able to write clean, modular multi-function C programs with forward declarations'],
    formal_definition: 'A function in C is an invokable subprogram with a defined signature specifying return type, identifier, and parameter types. In C, all arguments are passed strictly by value.',
    content_simple_english: `Functions allow you to break large programs into smaller, reusable building blocks (DRY - Don't Repeat Yourself).
A C function consists of three key stages:
1. Declaration (Function Prototype):
   Tells the compiler in advance: "A function with this name and parameters exists, trust me!"
   int calculate_total(int price, int qty);
2. Definition (The actual code body):
   Contains the curly braces { } with the instructions.
3. Function Call:
   Executes the function: int bill = calculate_total(10, 5);

Call Stack Mechanics:
When a function is called, the CPU pushes a new **Stack Frame** onto the Call Stack. This frame holds:
- Local variables of that function.
- Function parameters.
- Return address (where to jump back when finished).
When the function returns, its stack frame is POPPED and destroyed instantly!

Pass-by-Value Rule:
In C, functions receive COPIES of variables. If you change a parameter inside a function, the original variable in main() is completely untouched!`,
    hinglish_explanation: `Functions code ko chhote-chhote hisson me todne ke liye hote hain taaki baar-baar same code na likhna pade.
C me 3 steps hote hain:
1. Prototype (Declaration): Compiler ko pehle hi bata dena ki "Aisa ek function aage aane wala hai": int add(int a, int b);
2. Definition: Function ka asli kaam { curly braces ke andar }.
3. Call: Function ko chalana: int result = add(5, 10);

Pass-by-Value (Copy banna):
C me jab aap koi variable function me bhejte ho, toh function ke paas uski ek **COPY (Xerox)** jaati hai.
Agar function ke andar aapne us copy ko change kar diya, toh main() me jo asli variable tha, uspe koi asar nahi padega! Asli variable ko badalna ho toh Pointers use karte hain!`,
    why_it_matters: 'Modular programming prevents massive monolithic files and makes code testable and reusable across multi-developer software projects.',
    when_to_use: 'Break code into a function whenever a logic block is repeated more than once, or whenever a function exceeds ~50 lines of code.',
    syntax_guide: {
      template: '// Prototype\nreturn_type function_name(param_type param_name);\n\n// Definition\nreturn_type function_name(param_type param_name) {\n    return result;\n}',
      components: [
        { name: 'return_type', role: 'Type of value returned (void if no return)', required: true },
        { name: 'prototype', role: 'Forward declaration enabling compiler type verification', required: true }
      ],
      rules: ['Functions must be declared or defined before their first call in the file', 'Parameters are strictly pass-by-value']
    },
    code_example_1_title: 'Basic Foundational: Function Prototype, Definition, and Call',
    code_example_1_code: `#include <stdio.h>

// 1. Prototype (Forward Declaration)
int multiply(int a, int b);

int main(void) {
    // 3. Call
    int product = multiply(6, 7);
    printf("6 * 7 = %d\\n", product);
    return 0;
}

// 2. Definition
int multiply(int a, int b) {
    return a * b;
}`,
    code_example_1_explanation: 'Demonstrates the standard 3-step lifecycle: prototype, call in main, and definition below.',
    code_example_1_output: `6 * 7 = 42`,

    code_example_2_title: 'Intermediate Logic: Demonstrating Pass-by-Value Independence',
    code_example_2_code: `#include <stdio.h>

void modifyCopy(int x) {
    x = 999; // Modifies local stack copy only!
    printf("Inside modifyCopy(): x = %d\\n", x);
}

int main(void) {
    int original = 10;
    printf("Before function call: original = %d\\n", original);
    modifyCopy(original);
    printf("After function call : original = %d (UNTOUCHED!)\\n", original);
    return 0;
}`,
    code_example_2_explanation: 'Proves pass-by-value: the modifyCopy function modifies only its local stack frame copy.',
    code_example_2_output: `Before function call: original = 10
Inside modifyCopy(): x = 999
After function call : original = 10 (UNTOUCHED!)`,

    code_example_3_title: 'Practical Application: Mathematical Utility Library Module',
    code_example_3_code: `#include <stdio.h>

double calculateDiscount(double price, double discount_pct) {
    if (discount_pct < 0.0 || discount_pct > 100.0) {
        return price; // Guard clause against invalid input
    }
    return price - (price * (discount_pct / 100.0));
}

int main(void) {
    double original_price = 120.00;
    double final_price = calculateDiscount(original_price, 25.0);

    printf("Original Price: $%.2f\\n", original_price);
    printf("Final Price after 25%% discount: $%.2f\\n", final_price);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates pure functions with input guard clauses returning deterministic values.',
    code_example_3_output: `Original Price: $120.00
Final Price after 25% discount: $90.00`,

    code_walkthrough: {
      code: `int sq(int n) { return n*n; }\nint r = sq(4);`,
      steps: [
        { line: 2, explanation: 'main() evaluates sq(4). Pushes stack frame for sq with n=4.', state: 'Stack: [main] -> [sq: n=4]' },
        { line: 1, explanation: 'sq computes 4*4 = 16 and returns 16.', state: 'sq frame popped' },
        { line: 2, explanation: 'Return value 16 assigned to variable r in main.', state: 'main: r = 16' }
      ],
      output: '16',
      output_reasoning: 'Function computes 4 * 4 and returns 16 to caller.'
    },

    rules_and_restrictions: [
      'Functions cannot be nested inside other functions in standard ANSI C',
      'Returning a pointer to a local stack variable is undefined behavior (dangling pointer)'
    ],
    common_mistakes: [
      {
        title: 'Calling a function before declaration without prototype',
        incorrect_code: `int main() { double x = sqrt(16.0); } // Missing #include <math.h>`,
        explanation: 'In legacy C, undeclared functions default to returning int, causing truncation or corrupted floating-point returns.',
        corrected_code: `#include <math.h>\nint main() { double x = sqrt(16.0); }`,
        error_message: 'warning: implicit declaration of function "sqrt"',
        debug_tip: 'Always declare prototypes or include proper header files before calling functions.'
      }
    ],
    comparison_table: {
      title: 'Declaration vs Definition in C',
      concept_a: 'Declaration (Prototype)',
      concept_b: 'Definition (Implementation)',
      headers: ['Feature', 'Declaration', 'Definition'],
      rows: [
        ['Purpose', 'Announces name, return type, and parameter types', 'Provides actual executable body instructions { }'],
        ['Memory Allocation', 'Allocates zero code memory', 'Allocates machine code in TEXT segment'],
        ['Placement', 'Header files (.h) or top of source file', 'Source files (.c)']
      ]
    },
    diagram_svg: createControlFlowSvg('Function Call', 'Valid params?', 'Execute body & return', 'Trigger error / early exit', 'Pop Stack Frame'),
    practical_applications: [
      'Decomposing operating system system calls (read, write, fork, exec)',
      'Designing clean public C APIs for libraries'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Why does passing a variable to a standard C function NOT modify its value in the caller?',
        options: [
          'Because variables are immutable by default',
          'Because C passes arguments strictly by value (copying)',
          'Because the compiler protects caller memory automatically',
          'Because return values overwrite caller variables'
        ],
        correct_index: 1,
        explanation: 'In C, arguments are passed strictly by value: the function receives a copy of the argument on its stack frame.'
      }
    ],
    key_takeaways: [
      'Function prototypes inform the compiler of signatures before calls.',
      'C is strictly pass-by-value; parameters receive copies.',
      'Stack frames are destroyed when functions return.'
    ],
    quick_revision_notes: 'Prototype: type name(args); Call: name(vals); Body: type name(args){ return x; }. Pass-by-value copies data.',
    assignment_prompt: 'Write a C function int maxOfThree(int a, int b, int c) that returns the largest of three numbers, and test it in main.',
    assignment_starter_code: `#include <stdio.h>

// Write prototype and definition of maxOfThree
int main(void) {
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int maxOfThree(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}

int main(void) {
    printf("Max of 12, 45, 23: %d\\n", maxOfThree(12, 45, 23));
    return 0;
}`
  },

  {
    id: 'c-structures-unions',
    course_id: 'c-lang',
    unit_id: 'c-unit-2',
    title: 'Structures (struct), Unions, and Memory Alignment',
    description: 'Master composite types in C: struct syntax, member access (. vs ->), memory padding/alignment, sizeof calculations, and unions.',
    order_index: 14,
    learning_objectives: [
      'Master composite data modeling using struct and typedef',
      'Understand struct memory alignment and structure padding',
      'Learn the differences between struct (independent fields) and union (shared memory)'
    ],
    prerequisites: ['Function Basics', 'Pointer Basics and Memory Addresses'],
    expected_outcomes: ['Able to design packed memory-efficient structures and utilize unions for low-level byte manipulation'],
    formal_definition: 'A struct is a user-defined composite type that groups sequentially allocated variables of differing types under a single name. A union is a composite type where all member variables share the exact same starting memory address.',
    content_simple_english: `In real applications, data belongs together. A student has a name, an age, and a GPA.
Instead of managing three separate arrays, C provides **Structures (struct)**:
- A struct bundles multiple variables together into one unified custom type.
- Members are accessed using the dot operator: student.age = 20.
- When using a pointer to a struct, access members with the arrow operator: ptr->age = 20.

Structure Padding & Memory Alignment:
CPUs access memory much faster in 4-byte or 8-byte word boundaries. Because of this, the compiler will insert invisible "padding bytes" between struct members!
For example:
struct Example { char a; int b; };
You might think this takes 1 + 4 = 5 bytes. In reality, sizeof(struct Example) is **8 bytes** because the compiler adds 3 padding bytes after the char so the int is 4-byte aligned!

Unions:
A **union** looks like a struct, but ALL its members share the EXACT same memory location! The size of a union is simply the size of its largest member. Writing to one member overwrites all other members!`,
    hinglish_explanation: `Real life me data ek doosre se juda hota hai (jaise ek User ka name, id, aur balance). In sabko ek sath rakhne ke liye C me **struct** use hota hai.

Struct vs Pointer:
- Normal struct variable: dot (.) use karte hain -> user1.name
- Struct ka pointer: arrow (->) use karte hain -> ptr->name

Memory Padding (Invisible bytes):
Computer ka CPU memory ko 4 ya 8 bytes ke chunks me padhta hai. Isliye agar aap ek char (1 byte) aur int (4 bytes) ka struct banaoge, toh C beech me 3 khali bytes (padding) daal dega taaki int sahi jagah baithe! Isliye 1 + 4 = 5 nahi, balki 8 bytes lagte hain!

Union:
Union dekhne me struct jaisa hota hai, lekin isme saare members **ek hi memory address** share karte hain! Agar aapne ek member ki value badli, toh doosre ki value overwrite ho jayegi. Union ka size uske sabse bade member ke barabar hota hai.`,
    why_it_matters: 'Structures are the backbone of systems programming (file descriptors, network packets, OS process control blocks). Knowing alignment prevents bloated memory consumption in high-volume services.',
    when_to_use: 'Use struct to model entities with multiple concurrent attributes. Use union when an entity can hold only one variant of several types at any given time (tagged unions/variant records).',
    syntax_guide: {
      template: 'typedef struct {\n    int id;\n    double salary;\n} Employee;\n\nEmployee e1;\ne1.id = 101;\nEmployee *ptr = &e1;\nptr->salary = 85000.0;',
      components: [
        { name: 'struct', role: 'Composite data container keyword', required: true },
        { name: '.', role: 'Member access on value instances', required: true },
        { name: '->', role: 'Member access through pointer (shorthand for (*ptr).member)', required: true }
      ],
      rules: ['struct members are allocated sequentially in memory with alignment padding', 'sizeof(union) equals the size of its largest member']
    },
    code_example_1_title: 'Basic Foundational: Defining and Using a struct with typedef',
    code_example_1_code: `#include <stdio.h>

typedef struct {
    int id;
    char grade;
    float score;
} Student;

int main(void) {
    Student s1 = {101, 'A', 94.5f};

    printf("Student ID   : %d\\n", s1.id);
    printf("Grade Letter : %c\\n", s1.grade);
    printf("Exam Score   : %.1f\\n", s1.score);
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates typedef struct declaration, aggregate initialization, and dot operator member access.',
    code_example_1_output: `Student ID   : 101
Grade Letter : A
Exam Score   : 94.5`,

    code_example_2_title: 'Intermediate Logic: Struct Pointers and the Arrow Operator (->)',
    code_example_2_code: `#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

void movePoint(Point *p, int dx, int dy) {
    // Arrow operator accesses members through pointer
    p->x += dx;
    p->y += dy;
}

int main(void) {
    Point pt = {10, 20};
    printf("Initial Point: (%d, %d)\\n", pt.x, pt.y);

    movePoint(&pt, 5, -8);
    printf("Moved Point  : (%d, %d)\\n", pt.x, pt.y);
    return 0;
}`,
    code_example_2_explanation: 'Demonstrates passing struct pointers to functions and mutating fields via the arrow operator ->.',
    code_example_2_output: `Initial Point: (10, 20)
Moved Point  : (15, 12)`,

    code_example_3_title: 'Practical Application: Union for Low-Level Network Packet Reinterpretation',
    code_example_3_code: `#include <stdio.h>
#include <stdint.h>

// Union allows viewing the exact same 4 bytes as a 32-bit int OR 4 separate 8-bit bytes
typedef union {
    uint32_t raw_ip;
    uint8_t octet[4];
} IpAddress;

int main(void) {
    IpAddress ip;
    // Set 4 octets: 192.168.1.1
    ip.octet[0] = 192;
    ip.octet[1] = 168;
    ip.octet[2] = 1;
    ip.octet[3] = 1;

    printf("IP Dotted Quad: %u.%u.%u.%u\\n", 
           ip.octet[0], ip.octet[1], ip.octet[2], ip.octet[3]);
    printf("Raw 32-bit Integer Value: 0x%08X\\n", ip.raw_ip);
    printf("Sizeof struct vs union: sizeof(IpAddress) = %zu bytes\\n", sizeof(IpAddress));
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates union for type punning and multi-byte register interpretation in networking protocols.',
    code_example_3_output: `IP Dotted Quad: 192.168.1.1
Raw 32-bit Integer Value: 0x0101A8C0
Sizeof struct vs union: sizeof(IpAddress) = 4 bytes`,

    code_walkthrough: {
      code: `struct S { char c; int i; };\nstruct S s = {'A', 42};\nprintf("%zu", sizeof(s));`,
      steps: [
        { line: 1, explanation: 'Compiler defines layout: 1 byte char, 3 padding bytes, 4 bytes int.', state: 'Layout: [c][pad][pad][pad][i, i, i, i]' },
        { line: 2, explanation: 'Initializes c to \'A\' and i to 42.', state: 'Data stored' },
        { line: 3, explanation: 'Prints total size: 1 + 3 + 4 = 8 bytes.', state: 'Stdout: 8' }
      ],
      output: '8',
      output_reasoning: 'Memory alignment padding forces the struct size up to 8 bytes on 32-bit/64-bit systems.'
    },

    rules_and_restrictions: [
      'In a union, modifying one member overwrites all other members because they share the same memory',
      'The dot operator (.) is used for struct instances; the arrow operator (->) is used for struct pointers'
    ],
    common_mistakes: [
      {
        title: 'Using dot operator on a pointer to struct',
        incorrect_code: `Point *p = &pt;\np.x = 10; // COMPILER ERROR!`,
        explanation: 'p is a pointer address, not the struct instance itself. You must use p->x or (*p).x.',
        corrected_code: `p->x = 10;`,
        error_message: 'error: request for member "x" in something not a structure or union',
        debug_tip: 'Use -> whenever the variable on the left is a pointer.'
      }
    ],
    comparison_table: {
      title: 'struct vs union in C',
      concept_a: 'struct',
      concept_b: 'union',
      headers: ['Feature', 'struct', 'union'],
      rows: [
        ['Memory Allocation', 'Each member gets its own independent storage', 'All members share the same starting memory address'],
        ['Total Size', 'Sum of all member sizes + alignment padding', 'Size of the largest member only'],
        ['Member Accessibility', 'All members can be used simultaneously', 'Only one member can hold meaningful data at a time'],
        ['Common Use', 'Entity data modeling (User, Order, Point)', 'Hardware registers, variant types, packet dissection']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Linux kernel task_struct representing running operating system processes',
      'TCP/IP network packet headers parsing and byte serialization'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'If a struct contains a char (1 byte) and an int (4 bytes) on a 64-bit system, what is usually its sizeof?',
        options: ['5 bytes', '8 bytes', '4 bytes', '16 bytes'],
        correct_index: 1,
        explanation: 'Due to compiler memory alignment padding, 3 padding bytes are added after the 1-byte char so the 4-byte int aligns to a 4-byte boundary, totaling 8 bytes.'
      }
    ],
    key_takeaways: [
      'struct groups heterogeneous data; members are accessed via . or ->.',
      'Compilers insert padding bytes to maintain CPU memory alignment.',
      'union members share the same memory; size equals the largest member.'
    ],
    quick_revision_notes: 'struct { ... } var; var.x for values; ptr->x for pointers. Unions share memory. Padding aligns data to CPU boundaries.',
    assignment_prompt: 'Define a struct Rectangle with width and height integers, write a function int area(const Rectangle *r) that returns the area, and call it in main.',
    assignment_starter_code: `#include <stdio.h>

// Define struct and area function
int main(void) {
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

typedef struct {
    int width;
    int height;
} Rectangle;

int area(const Rectangle *r) {
    return r->width * r->height;
}

int main(void) {
    Rectangle rect = {10, 5};
    printf("Rectangle Area: %d\\n", area(&rect));
    return 0;
}`
  },

  {
    id: 'c-file-operations',
    course_id: 'c-lang',
    unit_id: 'c-unit-2',
    title: 'File Operations (fopen, fclose, fread, fwrite, fprintf)',
    description: 'Master persistent C file handling: file pointers (FILE *), open modes (r, w, a, rb, wb), formatted file I/O, binary streaming, and error handling.',
    order_index: 15,
    learning_objectives: [
      'Master the lifecycle of C file streams: fopen, check NULL, read/write, fclose',
      'Understand text modes (r, w, a) vs binary modes (rb, wb, ab)',
      'Perform binary file operations using fread and fwrite and handle EOF'
    ],
    prerequisites: ['Function Basics', 'Structures (struct) and Unions'],
    expected_outcomes: ['Able to write robust C applications that persist application state to disk with complete resource cleanup'],
    formal_definition: 'File operations in C provide buffered stream access to persistent storage devices via the FILE control structure defined in <stdio.h>, managing file descriptors, buffers, and cursor offsets.',
    content_simple_english: `When your program finishes running, all variables in RAM vanish. To keep data permanently, you must store it in **Files** on disk.
In C, file handling follows a mandatory 4-step sequence:
1. Open the file with fopen():
   FILE *fp = fopen("data.txt", "w");
   Modes: "r" (read), "w" (write/overwrite), "a" (append), "rb"/"wb" (binary).
2. ALWAYS check for NULL:
   If the file does not exist or disk permissions fail, fopen returns NULL! If you don't check, your program will crash!
3. Read or Write data:
   - Text files: fprintf(fp, "...") and fgets(buffer, sizeof, fp).
   - Binary files: fwrite(&struct_data, sizeof, 1, fp) and fread().
4. ALWAYS close the file with fclose():
   fclose(fp); flushes the operating system write buffers to disk and frees the file descriptor. Forgetting fclose causes **File Descriptor Leaks**!`,
    hinglish_explanation: `Jab program band hota hai, toh RAM ka saara data gayab ho jata hai. Data ko hamesha ke liye bachane ke liye hum use Files me save karte hain.

C me File use karne ke 4 niyam:
1. File kholna: FILE *fp = fopen("notes.txt", "w"); ("w" = likhna, "r" = padhna, "a" = aage jodna).
2. NULL check karna: Agar file nahi mili ya permission nahi hai, toh fopen NULL dega. Agar aapne check nahi kiya toh program turant crash ho jayega: if (fp == NULL) { error... }
3. Padhna ya Likhna: fprintf(fp, "Hello\\n");
4. File band karna (fclose): File ka kaam hote hi **fclose(fp)** zaroor karein, warna file corrupt ho sakti hai ya memory leak ho jayegi!`,
    why_it_matters: 'Failing to close files causes system resource starvation. Mishandling binary file offsets causes file corruption and security flaws.',
    when_to_use: 'Use text mode (fprintf/fgets) for human-readable configs and logs. Use binary mode (fread/fwrite) for images, database records, and fast serialization.',
    syntax_guide: {
      template: 'FILE *fp = fopen("output.txt", "w");\nif (fp == NULL) { perror("fopen"); return 1; }\nfprintf(fp, "Data\\n");\nfclose(fp);',
      components: [
        { name: 'fopen', role: 'Opens file stream with specified mode string', required: true },
        { name: 'fclose', role: 'Flushes buffer and releases OS file handle', required: true },
        { name: 'NULL check', role: 'Verifies file stream was opened successfully', required: true }
      ],
      rules: ['Every fopen() must have a corresponding fclose()', 'Never access a FILE * that evaluated to NULL']
    },
    code_example_1_title: 'Basic Foundational: Writing and Closing a Formatted Text File',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    FILE *fp = fopen("sample_log.txt", "w");
    if (fp == NULL) {
        printf("Error: Unable to open file for writing!\\n");
        return 1;
    }

    fprintf(fp, "TIMESTAMP: 2026-10-19 10:00:00\\n");
    fprintf(fp, "STATUS: SYSTEM_INITIALIZED\\n");

    fclose(fp); // Flushes buffers to physical disk
    printf("Log written and file closed successfully.\\n");
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates opening a file in write mode, writing formatted strings with fprintf, and closing.',
    code_example_1_output: 'Log written and file closed successfully.',

    code_example_2_title: 'Intermediate Logic: Reading Lines Safely with fgets and EOF',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    // Self-contained demo: create the log file first (as in Example 1)
    FILE *wfp = fopen("sample_log.txt", "w");
    if (wfp == NULL) {
        printf("Error: Unable to create file!\\n");
        return 1;
    }
    fprintf(wfp, "TIMESTAMP: 2026-10-19 10:00:00\\nSTATUS: SYSTEM_INITIALIZED\\n");
    fclose(wfp);

    // Now open it back in read mode
    FILE *fp = fopen("sample_log.txt", "r");
    if (fp == NULL) {
        printf("File not found!\\n");
        return 1;
    }

    char line_buffer[128];
    int line_number = 1;

    // fgets safely reads until newline or buffer capacity
    while (fgets(line_buffer, sizeof(line_buffer), fp) != NULL) {
        printf("Line %d: %s", line_number++, line_buffer);
    }

    fclose(fp);
    return 0;
}`,
    code_example_2_explanation: 'Self-contained demo: first creates the log file, then demonstrates safe line-by-line reading with fgets (bounded by sizeof buffer) preventing buffer overflows.',
    code_example_2_output: `Line 1: TIMESTAMP: 2026-10-19 10:00:00
Line 2: STATUS: SYSTEM_INITIALIZED`,

    code_example_3_title: 'Practical Application: Binary Record Serialization with fwrite and fread',
    code_example_3_code: `#include <stdio.h>

typedef struct {
    int record_id;
    double telemetry_val;
} SensorRecord;

int main(void) {
    SensorRecord original = {42, 98.6};

    // 1. Write binary struct directly to disk
    FILE *wfp = fopen("sensor.bin", "wb");
    if (wfp) {
        fwrite(&original, sizeof(SensorRecord), 1, wfp);
        fclose(wfp);
    }

    // 2. Read binary struct back from disk
    SensorRecord loaded = {0, 0.0};
    FILE *rfp = fopen("sensor.bin", "rb");
    if (rfp) {
        fread(&loaded, sizeof(SensorRecord), 1, rfp);
        fclose(rfp);
    }

    printf("Read from disk -> ID: %d | Val: %.1f\\n", loaded.record_id, loaded.telemetry_val);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates high-performance binary file serialization with fwrite and fread.',
    code_example_3_output: `Read from disk -> ID: 42 | Val: 98.6`,

    code_walkthrough: {
      code: `FILE *f = fopen("t.txt", "w");\nfputs("Hi", f);\nfclose(f);`,
      steps: [
        { line: 1, explanation: 'OS allocates file descriptor and returns FILE pointer.', state: 'fp != NULL' },
        { line: 2, explanation: '"Hi" written into userspace I/O buffer.', state: 'Buffer updated' },
        { line: 3, explanation: 'fclose flushes buffer to OS page cache and frees FILE struct.', state: 'File Closed' }
      ],
      output: 'File Written',
      output_reasoning: 'fputs writes string to buffer, and fclose flushes it to disk.'
    },

    rules_and_restrictions: [
      'Operating systems enforce a per-process limit on open file descriptors; unclosed files cause resource exhaustion (EMFILE)',
      'Always open binary files with "b" (e.g. "rb", "wb") to prevent CRLF line-ending translation on Windows'
    ],
    common_mistakes: [
      {
        title: 'Forgetting to check if fopen returned NULL',
        incorrect_code: `FILE *fp = fopen("missing.txt", "r");\nfgetc(fp); // Crashes with Segmentation Fault if missing!`,
        explanation: 'If the file cannot be opened, fp is NULL. Dereferencing NULL inside fgetc triggers an instant crash.',
        corrected_code: `FILE *fp = fopen("missing.txt", "r");\nif (fp == NULL) { return 1; }\nfgetc(fp);`,
        error_message: 'Segmentation fault (core dumped)',
        debug_tip: 'Always check if (fp == NULL) immediately after every fopen() call.'
      }
    ],
    comparison_table: {
      title: 'Text Mode vs Binary Mode in C',
      concept_a: 'Text Mode ("r", "w")',
      concept_b: 'Binary Mode ("rb", "wb")',
      headers: ['Feature', 'Text Mode', 'Binary Mode'],
      rows: [
        ['Line Endings', 'Translates \\n to \\r\\n on Windows', 'Raw exact bytes written/read without alteration'],
        ['Functions Used', 'fprintf, fscanf, fgets, fputs', 'fread, fwrite'],
        ['Best For', 'Configuration files, source code, logs', 'Images, audio, compiled binaries, database records']
      ]
    },
    diagram_svg: createControlFlowSvg('File I/O Stream', 'fopen() == NULL?', 'Abort with Error', 'Read/Write operations', 'fclose() Resource Free'),
    practical_applications: [
      'Database storage engines writing write-ahead logs (WAL) to disk',
      'Game engines loading textures, 3D meshes, and save-game states'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What does fopen() return if the requested file cannot be opened?',
        options: ['-1', '0', 'NULL', 'EOF'],
        correct_index: 2,
        explanation: 'If fopen() fails for any reason (missing file, invalid permissions, etc.), it returns the NULL pointer.'
      }
    ],
    key_takeaways: [
      'Always check fopen() return value against NULL.',
      'Always close open file streams with fclose() to prevent leaks.',
      'Use binary modes ("rb", "wb") when dealing with raw structs or non-text data.'
    ],
    quick_revision_notes: 'FILE *f = fopen(path, mode); if (!f) err; fprintf/fgets; fclose(f); Text: r, w, a; Binary: rb, wb, ab.',
    assignment_prompt: 'Write a program that writes the string "Code Nexus Engine" into a file named nexus.txt and verifies completion.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Open nexus.txt and write string
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    FILE *fp = fopen("nexus.txt", "w");
    if (fp == NULL) {
        printf("Error opening file!\\n");
        return 1;
    }
    fprintf(fp, "Code Nexus Engine\\n");
    fclose(fp);
    printf("Successfully written to nexus.txt\\n");
    return 0;
}`
  }
];

module.exports = { cBatch3Topics };
