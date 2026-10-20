const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const pool = new Pool({
  connectionString: requireDatabaseUrl()
});

// Helper to generate clean diagram SVGs
function createFlowchartSvg(step1, step2, decision, yesStep, noStep) {
  return `<svg viewBox="0 0 540 260" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-lg mx-auto">
  <rect x="20" y="20" width="140" height="48" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="90" y="49" fill="#f8fafc" font-size="13" font-family="monospace" text-anchor="middle">${step1}</text>
  <path d="M160 44 L200 44" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="200" y="20" width="140" height="48" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
  <text x="270" y="49" fill="#f8fafc" font-size="13" font-family="monospace" text-anchor="middle">${step2}</text>
  <path d="M270 68 L270 108" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="270,110 360,150 270,190 180,150" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="270" y="154" fill="#fbbf24" font-size="12" font-family="monospace" text-anchor="middle">${decision}</text>
  <path d="M360 150 L420 150 L420 190" stroke="#10b981" stroke-width="2"/>
  <rect x="360" y="190" width="120" height="44" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
  <text x="420" y="217" fill="#6ee7b7" font-size="12" font-family="monospace" text-anchor="middle">${yesStep}</text>
  <path d="M180 150 L120 150 L120 190" stroke="#ef4444" stroke-width="2"/>
  <rect x="60" y="190" width="120" height="44" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
  <text x="120" y="217" fill="#fca5a5" font-size="12" font-family="monospace" text-anchor="middle">${noStep}</text>
</svg>`;
}

const coursesData = [
  {
    id: 'c-lang',
    title: 'C Programming Mastery',
    slug: 'c-programming',
    description: 'Learn the foundational language that powers operating systems, embedded systems, and modern computing architectures.',
    icon: 'Terminal',
    difficulty: 'Beginner to Advanced',
    estimated_hours: 45,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 1,
    units: [
      {
        id: 'c-unit-1',
        title: 'Foundational Basics',
        order_index: 1,
        topics: [
          {
            id: 'c-history-and-origin',
            title: 'History and Origin of C',
            description: 'Where C came from, Dennis Ritchie at Bell Labs, and why C remains essential today.',
            content_simple_english: `C was created by Dennis Ritchie between 1969 and 1973 at Bell Laboratories. 

Before C, computers were programmed using assembly language or BCPL/B, which was hard to port to different computers. Ritchie wanted a language that was fast like assembly, but easy to write and read like higher languages.

C was used to rewrite the Unix operating system in 1973. This was historic: it proved an entire OS could be written in a high-level language! Today, Linux, Windows, macOS kernels, Python runtime, and SQLite are all built on C.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('1969: BCPL / B Lang', '1972: Ritchie creates C', 'Need Portable OS?', 'Unix rewritten in C', 'Assembly locked to 1 CPU'),
            code_example_1_title: 'Classic First C Program',
            code_example_1_code: `#include <stdio.h>

int main() {
    // printf prints text to the screen
    printf("Welcome to C Programming on Code Nexus!\\n");
    return 0; // 0 means the program finished successfully
}`,
            code_example_1_explanation: 'Line 1 includes the standard Input/Output library. `main()` is the entry door where execution begins. `printf` displays the text. Returning 0 tells the OS everything worked without errors.',
            code_example_2_title: 'Displaying C Information',
            code_example_2_code: `#include <stdio.h>

int main() {
    int birthYear = 1972;
    char creator[] = "Dennis Ritchie";
    printf("Language: C\\nCreated by: %s\\nYear: %d\\n", creator, birthYear);
    return 0;
}`,
            code_example_2_explanation: 'This example stores Dennis Ritchie in a string and 1972 in an integer. `%s` inserts the string and `%d` inserts the number into the printed output.',
            assignment_prompt: 'Write a C program that prints your name, favorite programming language, and the year C was created (1972).',
            assignment_starter_code: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    printf("My Name: Alex\\nFavorite Language: C\\nYear C Created: 1972\\n");
    return 0;
}`,
            order_index: 1
          },
          {
            id: 'c-structure-of-a-program',
            title: 'Structure of a C Program',
            description: 'Header files, main function, preprocessor directives, comments, and statements.',
            content_simple_english: `Every C program follows a clean, predictable blueprint:
1. Documentation Section: Comments explaining what the code does.
2. Preprocessor Directives: Lines starting with # that include tools like #include <stdio.h>.
3. Global Declarations: Variables or function prototypes used across multiple functions.
4. The main() Function: The compulsory starting point of every C program.
5. Function Body: Statements inside curly braces { } ending with semicolons ;.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Preprocessor (#include)', 'Compiler finds main()', 'Statements Valid?', 'Execute line by line', 'Compiler error displayed'),
            code_example_1_title: 'Standard Anatomy of a Program',
            code_example_1_code: `#include <stdio.h>

// Global constant
#define PLATFORM "Code Nexus"

int main() {
    // Local variable
    int studentsCount = 1500;
    
    printf("Welcome to %s!\\n", PLATFORM);
    printf("Enrolled Coders: %d\\n", studentsCount);
    
    return 0;
}`,
            code_example_1_explanation: 'We use `#define` to create a constant word `PLATFORM`. The `main()` function allocates `studentsCount` on the stack and prints formatted text using `%s` and `%d`.',
            code_example_2_title: 'Program with Multiple Statements',
            code_example_2_code: `#include <stdio.h>

int main() {
    int length = 10;
    int width = 5;
    int area = length * width;
    
    printf("Rectangle Length: %d\\n", length);
    printf("Rectangle Width: %d\\n", width);
    printf("Computed Area: %d\\n", area);
    
    return 0;
}`,
            code_example_2_explanation: 'Shows variable declaration, arithmetic evaluation, and multiple sequential `printf` calls. Each statement must terminate with a semicolon `;`.',
            assignment_prompt: 'Calculate the perimeter of a rectangle (2 * (length + width)) with length = 15 and width = 8, and print the output formatted.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    int length = 15;
    int width = 8;
    // Calculate perimeter and print
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int length = 15;
    int width = 8;
    int perimeter = 2 * (length + width);
    printf("Perimeter: %d\\n", perimeter);
    return 0;
}`,
            order_index: 2
          },
          {
            id: 'c-compilation-process',
            title: 'The Compilation Process',
            description: 'The 4 stages: Preprocessing, Compilation, Assembly, and Linking.',
            content_simple_english: `When you run 'gcc main.c -o main', your human-readable C code goes through 4 distinct stages before the CPU can execute it:

1. Preprocessor (cpp): Removes comments, expands macros (#define), and pastes header contents (#include). Produces '.i' file.
2. Compiler (gcc/cc): Converts the preprocessed C code into assembly instructions for the specific CPU. Produces '.s' file.
3. Assembler (as): Converts assembly instructions into machine binary code (0s and 1s). Produces object code '.o' file.
4. Linker (ld): Combines your object file with C standard library functions (like printf implementation) into a runnable executable file.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Source Code (.c)', 'Preprocessor (.i)', 'Compile & Assemble', 'Linker combines Libs', 'Executable Output'),
            code_example_1_title: 'Inspecting Macro Expansion in Preprocessing',
            code_example_1_code: `#include <stdio.h>
#define PI 3.14159
#define SQUARE(x) ((x) * (x))

int main() {
    double radius = 4.0;
    double area = PI * SQUARE(radius);
    printf("Radius: %.2f | Area: %.2f\\n", radius, area);
    return 0;
}`,
            code_example_1_explanation: 'Before compilation, the preprocessor literally replaces `PI` with `3.14159` and `SQUARE(radius)` with `((radius) * (radius))`. You can test this using `gcc -E main.c`.',
            code_example_2_title: 'Linking Multiple Function Declarations',
            code_example_2_code: `#include <stdio.h>

// Function prototype (tells compiler this exists)
int calculateCube(int n);

int main() {
    int num = 3;
    printf("The cube of %d is: %d\\n", num, calculateCube(num));
    return 0;
}

// Function definition (resolved by linker)
int calculateCube(int n) {
    return n * n * n;
}`,
            code_example_2_explanation: 'The compiler needs the prototype in `main()` to verify argument types. The linker then connects the function call to its actual machine code implementation.',
            assignment_prompt: 'Define a macro MAX(a, b) using ternary operator and print the maximum of two numbers: 45 and 78.',
            assignment_starter_code: `#include <stdio.h>
// Define MAX macro here

int main() {
    int x = 45, y = 78;
    // Print the maximum using MAX(x, y)
    return 0;
}`,
            assignment_solution: `#include <stdio.h>
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main() {
    int x = 45, y = 78;
    printf("Maximum: %d\\n", MAX(x, y));
    return 0;
}`,
            order_index: 3
          },
          {
            id: 'c-keywords-identifiers',
            title: 'Keywords and Identifiers',
            description: 'The 32 reserved C keywords and naming rules for variables, functions, and constants.',
            content_simple_english: `In C, every word is either a Keyword or an Identifier:

• Keywords: 32 reserved words that C owns. You cannot use them as variable names! Examples: int, float, if, else, return, void, while, for, struct, switch.
• Identifiers: Names that you invent for your variables, functions, and arrays.

Naming Rules for Identifiers:
1. Can contain letters (A-Z, a-z), digits (0-9), and underscore (_).
2. Must start with a letter or underscore, never a number!
3. C is case-sensitive: 'totalScore' and 'TotalScore' are two different variables.
4. No spaces or special symbols (@, #, $, %) allowed.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Starts with letter/_?', 'Contains only valid chars?', 'Is it a C keyword?', 'Reject Keyword Name', 'Valid Identifier!'),
            code_example_1_title: 'Valid vs Invalid Identifier Examples',
            code_example_1_code: `#include <stdio.h>

int main() {
    // Valid identifiers
    int user_age = 21;
    double _accountBalance = 450.75;
    int score2 = 98;
    
    // Invalid (would cause syntax errors if uncommented):
    // int 2ndScore = 50;   // Error: Starts with number
    // int user-name = 20;  // Error: Hyphen not allowed
    // int return = 5;      // Error: 'return' is reserved keyword
    
    printf("Age: %d, Balance: $%.2f, Score: %d\\n", user_age, _accountBalance, score2);
    return 0;
}`,
            code_example_1_explanation: 'Shows good naming practices using snake_case and camelCase. Notice how numbers are allowed at the end or middle, but never at the beginning.',
            code_example_2_title: 'Understanding Case-Sensitivity',
            code_example_2_code: `#include <stdio.h>

int main() {
    int data = 100;
    int Data = 200;
    int DATA = 300;
    
    printf("data=%d, Data=%d, DATA=%d\\n", data, Data, DATA);
    return 0;
}`,
            code_example_2_explanation: 'C treats `data`, `Data`, and `DATA` as 3 separate variables because of ASCII case distinction. Keep variable names consistent to avoid subtle bugs.',
            assignment_prompt: 'Declare three valid variables storing totalMarks (integer 480), maxMarks (integer 500), and calculate the percentage as a float.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    // Declare totalMarks and maxMarks
    // Calculate percentage and print with %.2f%%
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int totalMarks = 480;
    int maxMarks = 500;
    float percentage = ((float)totalMarks / maxMarks) * 100.0;
    printf("Percentage: %.2f%%\\n", percentage);
    return 0;
}`,
            order_index: 4
          },
          {
            id: 'c-constants-literals',
            title: 'Constants and Literals',
            description: 'Fixed values: Integer, Float, Character, and String literals with const keyword.',
            content_simple_english: `A constant is a value that cannot change once set during program execution.

There are two main ways to create constants in C:
1. 'const' keyword: e.g., 'const int SPEED_OF_LIGHT = 299792458;' (Type-safe and follows scope).
2. '#define' preprocessor: e.g., '#define TAX_RATE 0.18' (Replaced as text before compilation).

Literal Types:
• Integer Literals: 42, -10, 0x2A (hexadecimal), 052 (octal).
• Floating-point Literals: 3.1415, 6.022e23 (scientific).
• Character Literals: 'A', '\\n', '\\t' (enclosed in single quotes).
• String Literals: "Hello, Code Nexus" (enclosed in double quotes).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Declare const / #define', 'Assign Initial Literal', 'Attempt Modification?', 'Compiler Rejects (Read-Only)', 'Safely Access Constant'),
            code_example_1_title: 'Using const vs #define',
            code_example_1_code: `#include <stdio.h>

#define COMPANY_NAME "Code Nexus Global"
const double CONVERSION_FACTOR = 1.60934; // Miles to Kilometers

int main() {
    double miles = 5.0;
    double kilometers = miles * CONVERSION_FACTOR;
    
    printf("Organization: %s\\n", COMPANY_NAME);
    printf("%.1f miles = %.2f kilometers\\n", miles, kilometers);
    
    // CONVERSION_FACTOR = 2.0; // ERROR: assignment of read-only variable
    return 0;
}`,
            code_example_1_explanation: 'The compiler ensures `CONVERSION_FACTOR` is never overwritten. If any code attempts to alter it, compilation immediately stops with an error.',
            code_example_2_title: 'Exploring Literals in Different Bases',
            code_example_2_code: `#include <stdio.h>

int main() {
    int decimal = 42;
    int octal = 052;     // Leading 0 means octal base 8
    int hex = 0x2A;      // Leading 0x means hexadecimal base 16
    
    printf("Decimal 42: %d\\n", decimal);
    printf("Octal 052: %d (in decimal)\\n", octal);
    printf("Hex 0x2A:  %d (in decimal)\\n", hex);
    return 0;
}`,
            code_example_2_explanation: 'All three literals equal 42 in decimal value! C supports base 10, base 8, and base 16 notations directly.',
            assignment_prompt: 'Create a constant for FREEZING_POINT_C = 0.0 and BOILING_POINT_C = 100.0, and convert 100 Celsius to Fahrenheit using (C * 9/5) + 32.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    // Define boiling point const
    // Convert to Fahrenheit and print
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    const float BOILING_POINT_C = 100.0;
    float fahrenheit = (BOILING_POINT_C * 9.0 / 5.0) + 32.0;
    printf("Boiling Point in Fahrenheit: %.1f F\\n", fahrenheit);
    return 0;
}`,
            order_index: 5
          },
          {
            id: 'c-datatypes-modifiers',
            title: 'Data Types and Type Modifiers',
            description: 'Primitive types (int, float, double, char) and modifiers (signed, unsigned, short, long).',
            content_simple_english: `Data types tell the computer how many bytes of RAM to reserve and how to interpret the binary bits.

Primary Data Types:
• int: Whole numbers, usually 4 bytes (-2,147,483,648 to 2,147,483,647).
• float: Single precision decimal numbers, 4 bytes (6-7 decimal places).
• double: Double precision decimal numbers, 8 bytes (15-17 decimal places).
• char: Single ASCII character, 1 byte (-128 to 127 or 0 to 255).

Type Modifiers:
• signed / unsigned: Unsigned doubles positive range (e.g., unsigned int is 0 to 4,294,967,295).
• short / long: Adjusts storage size (short is 2 bytes, long is 8 bytes on 64-bit).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Select Type (int/float/char)', 'Add Modifier (unsigned/long)', 'Needs Negative?', 'Keep Signed Range', 'Unsigned: 2x Positive Range'),
            code_example_1_title: 'Checking Memory Sizes with sizeof',
            code_example_1_code: `#include <stdio.h>

int main() {
    printf("Size of char:        %zu byte\\n", sizeof(char));
    printf("Size of short:       %zu bytes\\n", sizeof(short));
    printf("Size of int:         %zu bytes\\n", sizeof(int));
    printf("Size of long:        %zu bytes\\n", sizeof(long));
    printf("Size of float:       %zu bytes\\n", sizeof(float));
    printf("Size of double:      %zu bytes\\n", sizeof(double));
    printf("Size of long double: %zu bytes\\n", sizeof(long double));
    return 0;
}`,
            code_example_1_explanation: 'The `sizeof` operator returns the exact byte size on your operating system architecture. `%zu` is the format specifier for `size_t`.',
            code_example_2_title: 'Signed vs Unsigned Behavior',
            code_example_2_code: `#include <stdio.h>

int main() {
    short signedNum = 32767;          // Maximum 16-bit signed short
    unsigned short unsignedNum = 65535; // Maximum 16-bit unsigned short
    
    printf("Signed Max: %d\\n", signedNum);
    printf("Unsigned Max: %u\\n", unsignedNum);
    
    // Overflow demonstration
    signedNum += 1;
    printf("Signed after +1 (overflows to negative): %d\\n", signedNum);
    return 0;
}`,
            code_example_2_explanation: 'When signed 32767 has 1 added, the sign bit flips, producing -32768. Unsigned types do not store negative signs and hold twice the positive magnitude.',
            assignment_prompt: 'Write a program that demonstrates declaring an unsigned int with value 4000000000 and prints it using %u.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    // Declare unsigned int and print
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    unsigned int population = 4000000000U;
    printf("Big Population: %u\\n", population);
    return 0;
}`,
            order_index: 6
          },
          {
            id: 'c-standard-io',
            title: 'Standard Input and Output',
            description: 'printf, scanf, format specifiers, and user interaction mechanics.',
            content_simple_english: `In C, communication with the user happens through Standard Streams:
• stdout (Screen): Write data using printf() or puts().
• stdin (Keyboard): Read data using scanf() or fgets().

Format Specifiers:
• %d or %i -> Integer
• %f -> Float
• %lf -> Double
• %c -> Character
• %s -> String (array of characters)
• %p -> Memory address pointer

Notice: In 'scanf("%d", &age)', the ampersand '&' is the Address-of operator. It gives scanf the memory address where the entered number should be saved!`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('User enters text in stdin', 'scanf parses format (%d)', 'Valid format match?', 'Store in memory at &var', 'Buffer flush / Input error'),
            code_example_1_title: 'Formatted Output with Alignment and Precision',
            code_example_1_code: `#include <stdio.h>

int main() {
    char item[] = "Laptop";
    int qty = 3;
    float price = 899.99;
    
    // %-15s means left-align in 15 spaces
    // %5d means right-align in 5 spaces
    // %10.2f means 10 width with 2 decimal places
    printf("%-15s %5s %10s\\n", "Item", "Qty", "Price");
    printf("-----------------------------------\\n");
    printf("%-15s %5d %10.2f\\n", item, qty, price);
    return 0;
}`,
            code_example_1_explanation: 'Format flags control spacing, alignment, and decimal precision. This makes printing tabular reports clean and aligned.',
            code_example_2_title: 'Reading User Input with scanf and fgets',
            code_example_2_code: `#include <stdio.h>

int main() {
    int age = 20;
    float gpa = 3.85;
    
    // Simulating input processing
    printf("Student Profile:\\n");
    printf("Age: %d years old\\n", age);
    printf("GPA: %.2f out of 4.0\\n", gpa);
    return 0;
}`,
            code_example_2_explanation: 'Demonstrates reading and presenting variable outputs. When reading strings with spaces, `fgets()` is preferred over `scanf("%s")` because `scanf` stops at the first space.',
            assignment_prompt: 'Write a program that takes two integers (a = 25, b = 4) and prints their sum, difference, product, quotient, and remainder.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    int a = 25, b = 4;
    // Print arithmetic results
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int a = 25, b = 4;
    printf("Sum: %d\\nDiff: %d\\nProd: %d\\nQuot: %d\\nRem: %d\\n",
           a + b, a - b, a * b, a / b, a % b);
    return 0;
}`,
            order_index: 7
          },
          {
            id: 'c-escape-sequences',
            title: 'Escape Sequences',
            description: 'Non-printable characters like newline (\\n), tab (\\t), backslash (\\\\), and quotes.',
            content_simple_english: `Escape sequences are special character combinations starting with a backslash '\\'. 

The compiler understands that you do not want to print the letter literally, but want to trigger a special terminal behavior:
• \\n -> Newline: Moves cursor to beginning of next line.
• \\t -> Horizontal Tab: Jumps to next tab stop (usually 4 or 8 spaces).
• \\\\ -> Backslash: Prints a literal backslash.
• \\\" -> Double quote: Prints a quote inside a string without closing the string.
• \\' -> Single quote: Prints a single quote.
• \\b -> Backspace: Moves cursor back one position.
• \\a -> Alert (Audible bell or beep).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Read char \\ in string', 'Next char is n/t/"/?', 'Is valid escape?', 'Execute Terminal Action', 'Print char as-is'),
            code_example_1_title: 'Formatting Text with Tabs and Newlines',
            code_example_1_code: `#include <stdio.h>

int main() {
    printf("ID\\tCourse\\t\\tGrade\\n");
    printf("101\\tC Language\\tA+\\n");
    printf("102\\tAlgorithms\\tA\\n");
    return 0;
}`,
            code_example_1_explanation: '`\\t` aligns the text into neat columns like a spreadsheet table, while `\\n` creates new rows.',
            code_example_2_title: 'Printing Quotes and File Paths',
            code_example_2_code: `#include <stdio.h>

int main() {
    // Printing double quotes inside a string
    printf("The mentor said, \\"Consistent practice makes mastery.\\"\\n");
    
    // Printing Windows/Linux file paths with backslashes
    printf("File Location: C:\\\\CodeNexus\\\\projects\\\\main.c\\n");
    return 0;
}`,
            code_example_2_explanation: 'Without `\\\\`, C would think `\\C` is an escape code. Two backslashes tell C to print one actual backslash symbol.',
            assignment_prompt: 'Print a receipt with a header, item name in double quotes, price, and a footer separated by tab stops.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    // Print formatted receipt with \\" and \\t
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    printf("RECEIPT\\n-------\\nItem:\\t\\"Mechanical Keyboard\\"\\nPrice:\\t$89.99\\n");
    return 0;
}`,
            order_index: 8
          }
        ]
      },
      {
        id: 'c-unit-2',
        title: 'Operators and Flow Control',
        order_index: 2,
        topics: [
          {
            id: 'c-arithmetic-relational-ops',
            title: 'Arithmetic and Relational Operators',
            description: 'Math operations (+, -, *, /, %) and comparison tests (<, >, ==, !=, <=, >=).',
            content_simple_english: `Operators allow you to perform calculations and make decisions on data.

Arithmetic Operators:
• Addition (+): 5 + 3 = 8
• Subtraction (-): 10 - 4 = 6
• Multiplication (*): 6 * 7 = 42
• Division (/): 20 / 4 = 5 (Integer division drops decimal: 7 / 2 = 3!)
• Modulus (%): Returns remainder of division: 7 % 2 = 1

Relational Operators (Return 1 for TRUE, 0 for FALSE):
• Equality (==): Checks if two sides are equal.
• Inequality (!=): Checks if two sides are NOT equal.
• Greater than (>), Less than (<), Greater or Equal (>=), Less or Equal (<=).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Evaluate Left Operand', 'Apply Operator (+, -, ==)', 'Condition True?', 'Result = 1 (TRUE)', 'Result = 0 (FALSE)'),
            code_example_1_title: 'Arithmetic and Integer Division Trap',
            code_example_1_code: `#include <stdio.h>

int main() {
    int a = 7, b = 2;
    int intResult = a / b;         // Truncated to 3
    float floatResult = (float)a / b; // Correct: 3.50
    int remainder = a % b;         // 1
    
    printf("Integer Division: 7 / 2 = %d\\n", intResult);
    printf("Casting Division: 7 / 2 = %.2f\\n", floatResult);
    printf("Modulus Remainder: 7 %% 2 = %d\\n", remainder);
    return 0;
}`,
            code_example_1_explanation: 'Notice how `7 / 2` in integer math gives 3 because decimal places are chopped off. Type casting `(float)a` forces floating point division yielding 3.50.',
            code_example_2_title: 'Relational Comparisons and Boolean Logic',
            code_example_2_code: `#include <stdio.h>

int main() {
    int score = 85;
    int passingMark = 75;
    
    printf("Is score passing? %d\\n", score >= passingMark); // 1
    printf("Is score perfect? %d\\n", score == 100);          // 0
    printf("Is score not zero? %d\\n", score != 0);           // 1
    return 0;
}`,
            code_example_2_explanation: 'In C, there was originally no built-in boolean type: 0 means false, and any non-zero number (typically 1) means true.',
            assignment_prompt: 'Write a program to check if an integer number (n = 42) is even or odd using the modulus operator.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    int n = 42;
    // Check even/odd and print
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int n = 42;
    if (n % 2 == 0) {
        printf("%d is Even\\n", n);
    } else {
        printf("%d is Odd\\n", n);
    }
    return 0;
}`,
            order_index: 1
          },
          {
            id: 'c-logical-assignment-ops',
            title: 'Logical and Assignment Operators',
            description: 'AND (&&), OR (||), NOT (!) and compound operators (+=, -=, *=, /=, %=).',
            content_simple_english: `Logical operators combine multiple conditions together:
• Logical AND (&&): True ONLY if BOTH conditions are true.
• Logical OR (||): True if AT LEAST ONE condition is true.
• Logical NOT (!): Inverts the boolean result (turns True into False and vice-versa).

Short-Circuit Evaluation:
• In 'A && B', if A is false, C doesn't even evaluate B because the whole expression can never be true!
• In 'A || B', if A is true, C doesn't evaluate B because the whole expression is already true!

Assignment Operators:
• 'x += 5' is shorthand for 'x = x + 5'.
• 'x *= 2' is shorthand for 'x = x * 2'.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Check Condition A', 'Operator: && or ||?', 'Short-circuit possible?', 'Skip B evaluation', 'Evaluate Condition B'),
            code_example_1_title: 'Evaluating Eligibility with Logical Operators',
            code_example_1_code: `#include <stdio.h>

int main() {
    int age = 22;
    int hasCodingExperience = 1; // 1 = true
    int hasPrerequisiteExam = 0; // 0 = false
    
    // Qualifying: Age >= 18 AND (experience OR prerequisite)
    int isEligible = (age >= 18) && (hasCodingExperience || hasPrerequisiteExam);
    
    printf("Candidate Age: %d\\n", age);
    printf("Admission Qualified: %s\\n", isEligible ? "YES" : "NO");
    return 0;
}`,
            code_example_1_explanation: 'Parentheses group sub-expressions clearly. Since `hasCodingExperience` is 1, the OR condition evaluates to 1, fulfilling the AND condition with `age >= 18`.',
            code_example_2_title: 'Compound Assignment Shorthands',
            code_example_2_code: `#include <stdio.h>

int main() {
    int balance = 100;
    
    balance += 50;  // 150
    balance -= 20;  // 130
    balance *= 2;   // 260
    balance /= 4;   // 65
    balance %= 10;  // 5
    
    printf("Final Balance: %d\\n", balance);
    return 0;
}`,
            code_example_2_explanation: 'Compound assignments modify the variable in place with faster CPU operations.',
            assignment_prompt: 'Check if a year (year = 2024) is a Leap Year using logical operators: (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0).',
            assignment_starter_code: `#include <stdio.h>

int main() {
    int year = 2024;
    // Check leap year logic and print
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int year = 2024;
    int isLeap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    printf("Year %d is Leap: %s\\n", year, isLeap ? "YES" : "NO");
    return 0;
}`,
            order_index: 2
          },
          {
            id: 'c-if-else-statements',
            title: 'if, if-else, and Nested if Statements',
            description: 'Conditional branching, decision paths, and multi-tier logical checks.',
            content_simple_english: `Decision making allows your program to take different actions based on test conditions:

1. Simple 'if': Executes the enclosed code block only when the condition is true.
2. 'if-else': Executes Block 1 if true, or executes Block 2 if false.
3. 'if-else if-else': Tests multiple mutually exclusive cases in descending order.
4. Nested 'if': An if statement placed inside another if statement for layered criteria.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Test Condition (score >= 85)', 'Evaluate Boolean', 'Passed (> 85%)?', 'Issue Certificate', 'Offer Retake Exam'),
            code_example_1_title: 'Grade Classifier with if-else ladder',
            code_example_1_code: `#include <stdio.h>

int main() {
    int marks = 88;
    
    if (marks >= 90) {
        printf("Grade: A+ (Outstanding)\\n");
    } else if (marks >= 85) {
        printf("Grade: A (Certificate Qualified on Code Nexus!)\\n");
    } else if (marks >= 70) {
        printf("Grade: B (Good Effort)\\n");
    } else {
        printf("Grade: C (Needs Practice)\\n");
    }
    return 0;
}`,
            code_example_1_explanation: 'The CPU checks conditions from top to bottom. As soon as `marks >= 85` matches, its block runs, and all subsequent `else if` and `else` branches are bypassed.',
            code_example_2_title: 'Nested if for Security Clearance',
            code_example_2_code: `#include <stdio.h>

int main() {
    int hasValidId = 1;
    int securityLevel = 3;
    
    if (hasValidId) {
        printf("Identity verified.\\n");
        if (securityLevel >= 3) {
            printf("Access Granted: Server Room & Database\\n");
        } else {
            printf("Access Restricted: Guest Lounge only\\n");
        }
    } else {
        printf("Access Denied: Please show valid ID.\\n");
    }
    return 0;
}`,
            code_example_2_explanation: 'The inner `if (securityLevel >= 3)` only executes after the outer identity check passes.',
            assignment_prompt: 'Write a program that takes temperature = 32 and prints "Freezing" if <= 0, "Moderate" if 1 to 25, "Warm" if 26 to 35, and "Hot" if > 35.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    int temp = 32;
    // Implement temperature ranges
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int temp = 32;
    if (temp <= 0) printf("Freezing\\n");
    else if (temp <= 25) printf("Moderate\\n");
    else if (temp <= 35) printf("Warm\\n");
    else printf("Hot\\n");
    return 0;
}`,
            order_index: 3
          },
          {
            id: 'c-loops-for-while-do',
            title: 'for, while, and do-while Loops',
            description: 'Iteration mechanics, entry-controlled vs exit-controlled loops.',
            content_simple_english: `Loops let you repeat code multiple times without copy-pasting:

1. 'for' Loop: Best when you know exactly how many times to repeat.
   Syntax: for (initialization; condition; increment) { ... }

2. 'while' Loop: Entry-controlled loop. Checks condition BEFORE entering. If false on start, runs 0 times.
   Syntax: while (condition) { ... }

3. 'do-while' Loop: Exit-controlled loop. Checks condition AFTER executing. Always runs AT LEAST ONCE!
   Syntax: do { ... } while (condition);`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Initialize Counter i=0', 'Check Condition (i < N)', 'Condition holds?', 'Execute Body & i++', 'Exit Loop'),
            code_example_1_title: 'Sum of First N Numbers using for Loop',
            code_example_1_code: `#include <stdio.h>

int main() {
    int n = 10;
    int sum = 0;
    
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    
    printf("Sum of numbers 1 to %d: %d\\n", n, sum);
    return 0;
}`,
            code_example_1_explanation: 'The loop starts at `i = 1`, checks `i <= 10`, adds `i` to `sum`, and increments `i++` each cycle until `i` reaches 11.',
            code_example_2_title: 'while vs do-while Comparison',
            code_example_2_code: `#include <stdio.h>

int main() {
    int counter = 100;
    
    // while loop: condition is false initially, runs 0 times
    while (counter < 5) {
        printf("while: This will never print\\n");
        counter++;
    }
    
    // do-while loop: runs once even though condition is false!
    do {
        printf("do-while: Executed at least once! Value = %d\\n", counter);
        counter++;
    } while (counter < 5);
    
    return 0;
}`,
            code_example_2_explanation: 'Proves the exit-controlled behavior of `do-while`. Use `do-while` for menu-driven CLI programs where the menu must display at least once before asking user choice.',
            assignment_prompt: 'Print the multiplication table of 7 from 1 to 10 using a while loop.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    int num = 7;
    // Write while loop for 7 * i
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    int num = 7;
    int i = 1;
    while (i <= 10) {
        printf("%d x %d = %d\\n", num, i, num * i);
        i++;
    }
    return 0;
}`,
            order_index: 4
          }
        ]
      },
      {
        id: 'c-unit-3',
        title: 'Core Logic and Structures',
        order_index: 3,
        topics: [
          {
            id: 'c-functions-basics',
            title: 'Function Basics (Declaration, Definition, Call)',
            description: 'Modularizing code into reusable building blocks, parameters, and return values.',
            content_simple_english: `A function is a self-contained block of code that performs a specific task.

Why use functions?
1. Code Reusability: Write once, call a thousand times.
2. Readability: Breaks a gigantic program into clean, bite-sized components.
3. Easy Debugging: If something fails, you know exactly which function has the bug.

Three Parts of a Function:
1. Function Declaration (Prototype): Informs compiler of the function name, return type, and argument list before main().
2. Function Call: Actually invoking the function inside main().
3. Function Definition: The actual implementation containing the logic.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('main() calls fn(x, y)', 'Push Frame on Stack', 'Execute fn statements', 'Return Result to caller', 'Pop Frame off Stack'),
            code_example_1_title: 'Creating and Calling a Function',
            code_example_1_code: `#include <stdio.h>

// 1. Prototype
int calculatePower(int base, int exp);

int main() {
    // 2. Call
    int result = calculatePower(2, 5);
    printf("2 raised to power 5 = %d\\n", result);
    return 0;
}

// 3. Definition
int calculatePower(int base, int exp) {
    int ans = 1;
    for (int i = 0; i < exp; i++) {
        ans *= base;
    }
    return ans;
}`,
            code_example_1_explanation: '`base` and `exp` are formal parameters. When called with 2 and 5, a new stack frame is created, calculations occur, and `return ans` passes 32 back to `main()`.',
            code_example_2_title: 'Void Functions with No Return Value',
            code_example_2_code: `#include <stdio.h>

void printBanner(const char* title) {
    printf("==============================\\n");
    printf("   CODE NEXUS: %s\\n", title);
    printf("==============================\\n");
}

int main() {
    printBanner("LESSON 3");
    return 0;
}`,
            code_example_2_explanation: 'Functions with return type `void` do not return any value. They perform side effects like printing to screen or writing files.',
            assignment_prompt: 'Write a function int isPrime(int n) that returns 1 if n is prime, and 0 if composite. Test it with n = 29.',
            assignment_starter_code: `#include <stdio.h>

// Declare isPrime function

int main() {
    int n = 29;
    // Call and print result
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int isPrime(int n) {
    if (n <= 1) return 0;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}

int main() {
    int n = 29;
    printf("%d is %s\\n", n, isPrime(n) ? "Prime" : "Composite");
    return 0;
}`,
            order_index: 1
          },
          {
            id: 'c-pointers-basics',
            title: 'Pointer Basics and Memory Addresses',
            description: 'Memory addresses, pointer syntax (* and &), dereferencing, and pointer mechanics.',
            content_simple_english: `A Pointer is a special variable that stores the memory address of another variable.

Key Concepts:
• Address-of Operator (&): Gives the RAM address where a variable lives.
• Dereference Operator (*): Follows the address to read or modify the value stored at that location!

Why are Pointers so powerful?
1. Pass by Reference: Allow functions to directly mutate caller variables.
2. Dynamic Memory: Allocate RAM at runtime on the Heap.
3. High Performance: Passing a 4-byte address is much faster than copying a 10,000-element array.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Variable x at 0x7ffd', 'ptr = &x (holds 0x7ffd)', 'Dereference *ptr', 'Read/Modify value of x', 'Direct RAM access'),
            code_example_1_title: 'Addresses and Dereferencing',
            code_example_1_code: `#include <stdio.h>

int main() {
    int score = 95;
    int *ptr = &score; // ptr holds the memory address of score
    
    printf("Value of score:         %d\\n", score);
    printf("Address of score (&score): %p\\n", (void*)&score);
    printf("Value of pointer (ptr):    %p\\n", (void*)ptr);
    printf("Dereferenced (*ptr):       %d\\n", *ptr);
    
    // Modify through pointer!
    *ptr = 100;
    printf("New value of score:     %d\\n", score);
    return 0;
}`,
            code_example_1_explanation: 'Assigning `*ptr = 100` goes to the RAM cell where `score` is stored and updates it directly! `score` is now 100.',
            code_example_2_title: 'Swap Function: Call by Value vs Call by Reference',
            code_example_2_code: `#include <stdio.h>

// Pointers allow real swapping
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    printf("Before swap: x=%d, y=%d\\n", x, y);
    
    swap(&x, &y); // Pass addresses
    
    printf("After swap:  x=%d, y=%d\\n", x, y);
    return 0;
}`,
            code_example_2_explanation: 'In normal call by value, copies are made and the caller never changes. By passing pointers `&x` and `&y`, `swap` can alter the original variables in `main()`.',
            assignment_prompt: 'Write a function void increment(int *num) that increases the value of an integer by 1 using pointer dereferencing.',
            assignment_starter_code: `#include <stdio.h>

void increment(int *num) {
    // Increment value using pointer
}

int main() {
    int val = 50;
    increment(&val);
    printf("Val: %d\\n", val);
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

void increment(int *num) {
    (*num)++;
}

int main() {
    int val = 50;
    increment(&val);
    printf("Val: %d\\n", val);
    return 0;
}`,
            order_index: 2
          }
        ]
      },
      {
        id: 'c-unit-4',
        title: 'Memory and Custom Data Types',
        order_index: 4,
        topics: [
          {
            id: 'c-structures-unions',
            title: 'Structures (struct) and Unions',
            description: 'Group related heterogeneous variables into a single custom type.',
            content_simple_english: `An array can only store items of the SAME type. A Structure (struct) lets you bundle items of DIFFERENT types together!

For example, a Student has:
• ID (int)
• Name (char array)
• GPA (float)

Struct vs Union:
• struct: Each member gets its OWN memory location. Total size = sum of all members + padding.
• union: ALL members share the EXACT SAME memory location! Total size = size of largest member. Only one member can be used at a time.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Define struct Student', 'Allocate fields in RAM', 'struct: separate cells', 'union: shared cell', 'Access via dot (.) operator'),
            code_example_1_title: 'Defining and Using a Struct',
            code_example_1_code: `#include <stdio.h>
#include <string.h>

struct Student {
    int id;
    char name[50];
    float gpa;
};

int main() {
    struct Student s1;
    s1.id = 101;
    strcpy(s1.name, "Sarah Chen");
    s1.gpa = 3.92;
    
    printf("Student ID:   %d\\n", s1.id);
    printf("Student Name: %s\\n", s1.name);
    printf("Student GPA:  %.2f\\n", s1.gpa);
    return 0;
}`,
            code_example_1_explanation: 'Members are accessed using dot operator `s1.name`. The struct groups student information into a cohesive entity.',
            code_example_2_title: 'Memory Difference: Struct vs Union',
            code_example_2_code: `#include <stdio.h>

struct DataStruct {
    int i;
    float f;
    char str[20];
};

union DataUnion {
    int i;
    float f;
    char str[20];
};

int main() {
    printf("Size of struct: %zu bytes\\n", sizeof(struct DataStruct)); // ~28 bytes
    printf("Size of union:  %zu bytes\\n", sizeof(union DataUnion));   // 20 bytes (largest member)
    return 0;
}`,
            code_example_2_explanation: 'The union uses only 20 bytes because `i`, `f`, and `str` share the same memory space.',
            assignment_prompt: 'Create a struct Book with title, author, and price. Initialize one book and print its details.',
            assignment_starter_code: `#include <stdio.h>

// Define struct Book

int main() {
    // Create and print book
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

struct Book {
    char title[100];
    char author[100];
    float price;
};

int main() {
    struct Book b = {"The C Programming Language", "Kernighan & Ritchie", 45.50};
    printf("Book: %s by %s ($%.2f)\\n", b.title, b.author, b.price);
    return 0;
}`,
            order_index: 1
          },
          {
            id: 'c-dynamic-memory-allocation',
            title: 'Dynamic Memory Allocation (malloc, calloc, realloc, free)',
            description: 'Allocating Heap memory dynamically at runtime and avoiding memory leaks.',
            content_simple_english: `Normally, variables on the Stack have fixed sizes determined at compile time. 

Dynamic Memory Allocation lets you ask the operating system for exact amounts of Heap memory while the program is actively running!

Standard Functions in <stdlib.h>:
1. malloc(size): Allocates requested bytes of uninitialized memory (contains garbage values).
2. calloc(num, size): Allocates memory and initializes every single byte to ZERO.
3. realloc(ptr, new_size): Resizes previously allocated heap memory without losing data.
4. free(ptr): Returns memory back to the OS. If you forget to call free(), your program has a Memory Leak!`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Call malloc(size)', 'OS finds Heap Block', 'Success (ptr != NULL)?', 'Use memory safely', 'free(ptr) to prevent leak'),
            code_example_1_title: 'Dynamic Array Allocation with malloc and free',
            code_example_1_code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    // Allocate space for 5 integers on the Heap
    int *arr = (int*)malloc(n * sizeof(int));
    
    // Always check if allocation succeeded!
    if (arr == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }
    
    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10; // 10, 20, 30, 40, 50
    }
    
    printf("Allocated array elements:\\n");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    
    // Always release memory when finished!
    free(arr);
    arr = NULL; // Prevent dangling pointer
    return 0;
}`,
            code_example_1_explanation: '`malloc` returns a `void*` pointing to the first byte in the Heap. Setting `arr = NULL` after freeing prevents accidentally using invalid memory addresses.',
            code_example_2_title: 'Resizing an Array with realloc',
            code_example_2_code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *numbers = (int*)malloc(2 * sizeof(int));
    numbers[0] = 100;
    numbers[1] = 200;
    
    // Resize array from 2 items to 4 items
    numbers = (int*)realloc(numbers, 4 * sizeof(int));
    numbers[2] = 300;
    numbers[3] = 400;
    
    for (int i = 0; i < 4; i++) {
        printf("Index %d: %d\\n", i, numbers[i]);
    }
    
    free(numbers);
    return 0;
}`,
            code_example_2_explanation: '`realloc` extends memory seamlessly. If contiguous memory is unavailable in place, it automatically moves data to a new location and frees the old block.',
            assignment_prompt: 'Allocate an integer array of size 3 using calloc, store values 7, 14, 21, print their sum, and free the memory.',
            assignment_starter_code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Allocate with calloc, sum, and free
    return 0;
}`,
            assignment_solution: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*)calloc(3, sizeof(int));
    if (!arr) return 1;
    arr[0] = 7; arr[1] = 14; arr[2] = 21;
    int sum = arr[0] + arr[1] + arr[2];
    printf("Sum: %d\\n", sum);
    free(arr);
    return 0;
}`,
            order_index: 2
          }
        ]
      },
      {
        id: 'c-unit-5',
        title: 'Advanced and System Operations',
        order_index: 5,
        topics: [
          {
            id: 'c-file-operations',
            title: 'File Operations (fopen, fclose, fread, fwrite)',
            description: 'Reading, writing, and appending persistent data to disk files.',
            content_simple_english: `When a program terminates, variables in RAM vanish. File I/O lets you store data permanently on your hard drive!

File Modes:
• "r": Read mode (file must already exist).
• "w": Write mode (creates file or overwrites existing content).
• "a": Append mode (writes data to the end of the file without deleting existing text).
• "rb" / "wb": Binary read / write modes.

Always remember: Every file you open with fopen() MUST be closed with fclose() to flush buffered data to the storage disk.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('fopen("data.txt", mode)', 'Check (fp != NULL)', 'Write/Read file stream', 'fclose(fp)', 'Data safely flushed to disk'),
            code_example_1_title: 'Writing and Reading a Text File',
            code_example_1_code: `#include <stdio.h>

int main() {
    // 1. Writing to file
    FILE *fp = fopen("nexus_test.txt", "w");
    if (fp == NULL) {
        printf("Error creating file!\\n");
        return 1;
    }
    fprintf(fp, "Code Nexus C Mastery Course\\nPoints Earned: 50\\n");
    fclose(fp);
    
    // 2. Reading back from file
    char line[100];
    fp = fopen("nexus_test.txt", "r");
    if (fp != NULL) {
        while (fgets(line, sizeof(line), fp)) {
            printf("Read: %s", line);
        }
        fclose(fp);
    }
    return 0;
}`,
            code_example_1_explanation: '`fprintf` writes formatted data directly to the stream. `fgets` reads line by line until End-Of-File (EOF).',
            code_example_2_title: 'Binary File I/O with fwrite and fread',
            code_example_2_code: `#include <stdio.h>

struct GameScore {
    char player[20];
    int score;
};

int main() {
    struct GameScore s1 = {"Archer", 9850};
    
    // Write binary struct to disk
    FILE *fp = fopen("score.bin", "wb");
    if (fp) {
        fwrite(&s1, sizeof(struct GameScore), 1, fp);
        fclose(fp);
        printf("Binary score record saved.\\n");
    }
    return 0;
}`,
            code_example_2_explanation: '`fwrite` dumps the raw bytes of the struct directly to storage without text formatting, which is compact and extremely fast.',
            assignment_prompt: 'Write a program that writes the numbers 1 to 5 into a file named "numbers.txt", then reads and displays them.',
            assignment_starter_code: `#include <stdio.h>

int main() {
    // Write 1 to 5 to numbers.txt and read back
    return 0;
}`,
            assignment_solution: `#include <stdio.h>

int main() {
    FILE *f = fopen("numbers.txt", "w");
    for (int i = 1; i <= 5; i++) fprintf(f, "%d\\n", i);
    fclose(f);
    
    int val;
    f = fopen("numbers.txt", "r");
    while (fscanf(f, "%d", &val) == 1) printf("Num: %d\\n", val);
    fclose(f);
    return 0;
}`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'cpp',
    title: 'C++ Modern & Object-Oriented Programming',
    slug: 'cpp-programming',
    description: 'Master classes, inheritance, polymorphism, templates, STL containers, and modern C++20 features.',
    icon: 'Cpu',
    difficulty: 'Intermediate to Advanced',
    estimated_hours: 50,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 2,
    units: [
      {
        id: 'cpp-unit-1',
        title: 'Foundational Additions & Syntax',
        order_index: 1,
        topics: [
          {
            id: 'cpp-cin-cout-namespaces',
            title: 'Namespaces and Input/Output Streams (cin, cout)',
            description: 'std namespace, stream insertion (<<) and extraction (>>), endl, and formatters.',
            content_simple_english: `C++ brings modern streams and type safety to input and output:

• 'cout' (Console Output): Uses insertion operator '<<' to stream data to screen.
• 'cin' (Console Input): Uses extraction operator '>>' to read variables from keyboard without manual format strings!
• 'cerr': Unbuffered error stream.

Namespaces:
A namespace prevents naming collisions. The entire standard library lives inside namespace 'std'.
You can use 'using namespace std;' or explicitly specify 'std::cout'.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('std::cin >> input', 'Type checked automatically', 'Process data', 'std::cout << result', 'Buffer flushed with endl'),
            code_example_1_title: 'Standard Input and Output with std::cout',
            code_example_1_code: `#include <iostream>
#include <string>

int main() {
    std::string coderName = "Alex";
    int questionsSolved = 42;
    
    std::cout << "Welcome, " << coderName << "!" << std::endl;
    std::cout << "Questions Solved: " << questionsSolved << std::endl;
    return 0;
}`,
            code_example_1_explanation: 'Notice no format specifiers like `%d` or `%s` are needed! `cout` automatically detects types and formats them seamlessly.',
            code_example_2_title: 'Custom Namespaces to Prevent Collisions',
            code_example_2_code: `#include <iostream>

namespace DatabaseConfig {
    int maxConnections = 100;
}

namespace NetworkConfig {
    int maxConnections = 500;
}

int main() {
    std::cout << "DB Max Conns: " << DatabaseConfig::maxConnections << std::endl;
    std::cout << "Net Max Conns: " << NetworkConfig::maxConnections << std::endl;
    return 0;
}`,
            code_example_2_explanation: 'Both namespaces have a variable called `maxConnections`, but because they are scoped under distinct namespaces, there is zero conflict.',
            assignment_prompt: 'Write a C++ program that prompts for user name and age, then displays "Hello [Name], in 5 years you will be [Age + 5]".',
            assignment_starter_code: `#include <iostream>
#include <string>

int main() {
    // Write your C++ code
    return 0;
}`,
            assignment_solution: `#include <iostream>
#include <string>

int main() {
    std::string name = "Jordan";
    int age = 22;
    std::cout << "Hello " << name << ", in 5 years you will be " << (age + 5) << "!" << std::endl;
    return 0;
}`,
            order_index: 1
          },
          {
            id: 'cpp-references-vs-pointers',
            title: 'References vs Pointers & Pass by Reference',
            description: 'Lvalue references, memory aliasing, safe parameter passing without null pointers.',
            content_simple_english: `In C++, a Reference is an ALIAS (another nickname) for an already existing variable:

Key Differences:
1. Cannot be NULL: A reference must always bind to a real object upon creation.
2. Cannot be reseated: Once initialized to variable A, it cannot be changed to refer to variable B.
3. No dereferencing needed: You use it with normal syntax without asterisks (*).

Pass by Reference:
Allows functions to mutate caller values without copy overhead and without messy pointer syntax!`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('int original = 50', 'int &ref = original', 'Mutate ref = 100', 'original changes to 100', 'Zero pointer arithmetic errors'),
            code_example_1_title: 'Pass by Reference in C++',
            code_example_1_code: `#include <iostream>

void doubleValue(int &val) {
    val *= 2; // Directly updates caller variable!
}

int main() {
    int num = 25;
    std::cout << "Before: " << num << std::endl;
    doubleValue(num); // No & required in caller!
    std::cout << "After:  " << num << std::endl;
    return 0;
}`,
            code_example_1_explanation: 'In C, you had to pass `&num` and write `*val *= 2`. In C++, `int &val` handles everything cleanly with zero copying.',
            code_example_2_title: 'Constant References for Large Objects',
            code_example_2_code: `#include <iostream>
#include <string>

// const std::string& passes by reference (0 copy) while preventing accidental modification!
void displayReport(const std::string &report) {
    std::cout << "Report Content: " << report << std::endl;
}

int main() {
    std::string hugeString = "Thousands of characters from a file...";
    displayReport(hugeString);
    return 0;
}`,
            code_example_2_explanation: 'Passing large strings or vectors by `const Type&` is a best-practice in C++: it provides maximum performance with complete safety.',
            assignment_prompt: 'Write a function void swap(int &a, int &b) in C++ and test it with a = 15, b = 30.',
            assignment_starter_code: `#include <iostream>

// Define swap using C++ references

int main() {
    int x = 15, y = 30;
    // Swap and print
    return 0;
}`,
            assignment_solution: `#include <iostream>

void swap(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 15, y = 30;
    swap(x, y);
    std::cout << "x: " << x << ", y: " << y << std::endl;
    return 0;
}`,
            order_index: 2
          }
        ]
      },
      {
        id: 'cpp-unit-2',
        title: 'Object-Oriented Programming (OOP) Core',
        order_index: 2,
        topics: [
          {
            id: 'cpp-classes-objects',
            title: 'Classes, Objects, and Encapsulation',
            description: 'Blueprint vs instance, public/private access specifiers, and getters/setters.',
            content_simple_english: `Object-Oriented Programming (OOP) organizes software around real-world objects:

• Class: A blueprint (e.g., Car design).
• Object: A real physical instance built from that blueprint (e.g., your red Tesla).

Access Specifiers:
• private: Data cannot be accessed or modified from outside the class. Protects internal state.
• public: Methods anyone can call from outside.

Encapsulation binds data and functions together and shields internal data from direct tampering.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Class Blueprint', 'Instantiate Object', 'Private Data Protected', 'Call Public Methods', 'Safe State Transitions'),
            code_example_1_title: 'BankAccount Class with Encapsulation',
            code_example_1_code: `#include <iostream>
#include <string>

class BankAccount {
private:
    std::string owner;
    double balance;

public:
    // Constructor
    BankAccount(std::string name, double initialDeposit) {
        owner = name;
        balance = initialDeposit >= 0 ? initialDeposit : 0;
    }

    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    double getBalance() const {
        return balance;
    }
};

int main() {
    BankAccount account("Elena Rostova", 500.0);
    account.deposit(250.0);
    std::cout << "Current Balance: $" << account.getBalance() << std::endl;
    return 0;
}`,
            code_example_1_explanation: 'The `balance` cannot be directly set to negative from outside. Encapsulation guarantees the account rules are never violated.',
            code_example_2_title: 'Constructors and Destructors',
            code_example_2_code: `#include <iostream>

class ResourceHolder {
public:
    ResourceHolder() {
        std::cout << "Constructor: Resource acquired!\\n";
    }
    ~ResourceHolder() {
        std::cout << "Destructor: Resource automatically freed!\\n";
    }
};

int main() {
    {
        ResourceHolder obj; // Created inside scope
    } // Out of scope -> Destructor automatically called!
    std::cout << "Scope exited successfully.\\n";
    return 0;
}`,
            code_example_2_explanation: 'Demonstrates RAII (Resource Acquisition Is Initialization). When `obj` leaves scope at the curly brace, its destructor cleans up memory automatically.',
            assignment_prompt: 'Create a Rectangle class with private width and height, a constructor, and an getArea() method.',
            assignment_starter_code: `#include <iostream>

// Define Rectangle class

int main() {
    // Create Rectangle(4, 5) and print area
    return 0;
}`,
            assignment_solution: `#include <iostream>

class Rectangle {
private:
    int width, height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}
    int getArea() const { return width * height; }
};

int main() {
    Rectangle r(4, 5);
    std::cout << "Area: " << r.getArea() << std::endl;
    return 0;
}`,
            order_index: 1
          },
          {
            id: 'cpp-inheritance-polymorphism',
            title: 'Inheritance and Virtual Polymorphism',
            description: 'Base and derived classes, virtual functions, dynamic binding, and override.',
            content_simple_english: `Inheritance lets a child class inherit properties and behaviors from a parent class, avoiding duplicate code.

Polymorphism means "many forms".
• Virtual Functions: Declaring 'virtual void makeSound()' in the base class tells C++ to use Late Binding (Dynamic Dispatch).
• At runtime, C++ checks the actual object type and calls the child's implementation, even when accessed through a base class pointer!`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Base Class (Animal)', 'Derived (Dog, Cat)', 'Call animal->makeSound()', 'vtable looks up type', 'Correct sound executed!'),
            code_example_1_title: 'Virtual Functions and Runtime Polymorphism',
            code_example_1_code: `#include <iostream>
#include <vector>

class Animal {
public:
    virtual void makeSound() const {
        std::cout << "Generic animal sound" << std::endl;
    }
    virtual ~Animal() = default; // Always make base destructors virtual!
};

class Dog : public Animal {
public:
    void makeSound() const override {
        std::cout << "Woof! Woof!" << std::endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() const override {
        std::cout << "Meow!" << std::endl;
    }
};

int main() {
    Dog dog;
    Cat cat;
    Animal* animals[] = { &dog, &cat };
    
    for (Animal* a : animals) {
        a->makeSound(); // Calls Dog::makeSound then Cat::makeSound!
    }
    return 0;
}`,
            code_example_1_explanation: 'The loop treats both as generic `Animal*` pointers, but because `makeSound` is virtual, each animal makes its specific sound!',
            code_example_2_title: 'Pure Virtual Functions and Abstract Classes',
            code_example_2_code: `#include <iostream>

// Abstract Class (Interface contract)
class Shape {
public:
    virtual double area() const = 0; // Pure virtual function
};

class Circle : public Shape {
    double r;
public:
    Circle(double radius) : r(radius) {}
    double area() const override { return 3.14159 * r * r; }
};

int main() {
    Circle c(5.0);
    std::cout << "Circle Area: " << c.area() << std::endl;
    return 0;
}`,
            code_example_2_explanation: '`Shape` cannot be directly instantiated because it has a pure virtual function (`= 0`). Any derived class must implement `area()`.',
            assignment_prompt: 'Create an abstract Employee class with virtual double getSalary() = 0, and a FullTimeEmployee class returning 60000.',
            assignment_starter_code: `#include <iostream>

// Create Employee and FullTimeEmployee

int main() {
    // Test getSalary
    return 0;
}`,
            assignment_solution: `#include <iostream>

class Employee {
public:
    virtual double getSalary() const = 0;
    virtual ~Employee() = default;
};

class FullTimeEmployee : public Employee {
public:
    double getSalary() const override { return 60000.0; }
};

int main() {
    FullTimeEmployee emp;
    std::cout << "Salary: $" << emp.getSalary() << std::endl;
    return 0;
}`,
            order_index: 2
          }
        ]
      },
      {
        id: 'cpp-unit-3',
        title: 'Standard Template Library (STL)',
        order_index: 3,
        topics: [
          {
            id: 'cpp-stl-containers',
            title: 'STL Sequence & Associative Containers',
            description: 'vector, map, unordered_map, set, stack, and queue.',
            content_simple_english: `The Standard Template Library (STL) is a collection of battle-tested, high-performance data structures:

• std::vector: Dynamic resizable array with contiguous memory and O(1) index access.
• std::map: Key-Value pairs sorted in Red-Black Tree (O(log n) lookups).
• std::unordered_map: Key-Value pairs backed by Hash Table (O(1) average lookup).
• std::set: Stores unique elements in sorted order.
• std::stack & std::queue: LIFO and FIFO adapters.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Choose Container', 'Need Key-Value or List?', 'vector: contiguous', 'map: tree sorted', 'unordered_map: O(1) hash'),
            code_example_1_title: 'Using std::vector and Modern Range-Based For Loop',
            code_example_1_code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> scores = { 92, 75, 88, 99, 64 };
    scores.push_back(85); // Dynamically adds 85 to end
    
    // Sort scores in ascending order
    std::sort(scores.begin(), scores.end());
    
    std::cout << "Sorted Scores: ";
    for (int s : scores) {
        std::cout << s << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
            code_example_1_explanation: '`std::vector` handles memory expansion behind the scenes. `std::sort` runs in O(N log N) using introsort.',
            code_example_2_title: 'std::unordered_map for O(1) Frequency Counting',
            code_example_2_code: `#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    std::unordered_map<std::string, int> wordCount;
    std::string words[] = { "apple", "banana", "apple", "orange", "banana", "apple" };
    
    for (const auto &w : words) {
        wordCount[w]++;
    }
    
    std::cout << "Word Frequencies:\\n";
    for (const auto &pair : wordCount) {
        std::cout << pair.first << ": " << pair.second << "\\n";
    }
    return 0;
}`,
            code_example_2_explanation: 'Hash table lookups give near-instant access. Incrementing `wordCount[w]++` creates the key if not found, with default 0.',
            assignment_prompt: 'Store the numbers [5, 2, 8, 1, 9] in a vector, sort them in descending order using greater<int>(), and print.',
            assignment_starter_code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // Create, sort descending, and print
    return 0;
}`,
            assignment_solution: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = { 5, 2, 8, 1, 9 };
    std::sort(nums.begin(), nums.end(), std::greater<int>());
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    return 0;
}`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'python',
    title: 'Python, Data Science & AI Libraries',
    slug: 'python-programming',
    description: 'Learn Python fundamentals, NumPy, Pandas, Matplotlib, Math, PyTorch, and OpenCV.',
    icon: 'Layers',
    difficulty: 'Beginner to Advanced',
    estimated_hours: 60,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 3,
    units: [
      {
        id: 'py-unit-1',
        title: 'Intro to Python Basics',
        order_index: 1,
        topics: [
          {
            id: 'py-variables-datatypes',
            title: 'Variables, Dynamic Typing, and Data Types',
            description: 'Memory allocation, dynamic typing, variable naming, and primitive types (int, float, complex, bool, str).',
            content_simple_english: `Python is dynamically typed: you never need to declare variable types! 

Python inspects the value you assign and assigns the type in memory automatically:
• int: 42, -100 (Unbounded precision, integers can be millions of digits long!)
• float: 3.14159, 1e-4
• complex: 3 + 4j
• bool: True, False
• str: 'Code Nexus' or "Python Mastery"

In Python, everything is an Object! When you write 'x = 10', Python creates an integer object 10 in heap memory and points 'x' to it.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Assign x = "Nexus"', 'Allocate String Object', 'Inspect type(x)', 'str object in Heap', 'Reassign x = 42 dynamically'),
            code_example_1_title: 'Dynamic Typing and Type Inspection',
            code_example_1_code: `# Dynamic re-assignment
data = 100
print(f"Value: {data}, Type: {type(data)}")

data = "Code Nexus"
print(f"Value: {data}, Type: {type(data)}")

data = [1, 2, 3]
print(f"Value: {data}, Type: {type(data)}")`,
            code_example_1_explanation: 'The same variable identifier `data` smoothly holds an integer, then a string, and then a list without any compilation errors.',
            code_example_2_title: 'Type Casting and String Formatting',
            code_example_2_code: `user_input = "42" # string
converted_num = int(user_input) # cast to integer
result = converted_num * 2

print(f"Original: '{user_input}' (as string)")
print(f"Double: {result} (as integer)")
print(f"Boolean test: bool(0)={bool(0)}, bool(1)={bool(1)}")`,
            code_example_2_explanation: 'Shows explicit type conversion using `int()` and `bool()`. Python evaluates 0 and empty strings as `False`, and non-zero values as `True`.',
            assignment_prompt: 'Write a program that takes principal = 1000, rate = 0.05, time = 3, and calculates compound interest: A = P * (1 + r)**t.',
            assignment_starter_code: `# Calculate Compound Interest
principal = 1000
rate = 0.05
time = 3

# Compute final amount and print rounded to 2 decimals`,
            assignment_solution: `principal = 1000
rate = 0.05
time = 3
amount = principal * ((1 + rate) ** time)
print(f"Final Amount: {round(amount, 2)}")`,
            order_index: 1
          },
          {
            id: 'py-conditionals-loops',
            title: 'Conditionals, Pattern Matching & Loops',
            description: 'if-elif-else, match-case, while, for-in, and for-else.',
            content_simple_english: `Python uses indentation (4 spaces) instead of curly braces { } to define code blocks!

Control Structures:
• if, elif, else: Standard decision trees.
• match-case: Modern structural pattern matching introduced in Python 3.10.
• for loop: Iterates over any sequence (range, list, string, dictionary).
• while loop: Repeats while condition remains True.
• for-else: The 'else' block runs ONLY if the loop finishes normally without hitting a 'break'!`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Evaluate Condition', 'Branch on Truth Value', 'Iterate over Sequence?', 'Run Body & Next Item', 'for-else executes on completion'),
            code_example_1_title: 'Modern Pattern Matching with match-case',
            code_example_1_code: `def get_http_message(status_code):
    match status_code:
        case 200:
            return "OK: Request Succeeded"
        case 404:
            return "Not Found: Resource missing"
        case 500:
            return "Internal Server Error"
        case _:
            return "Unknown HTTP Status Code"

print(get_http_message(200))
print(get_http_message(404))`,
            code_example_1_explanation: 'The `match-case` syntax provides clean, readable pattern matching without cluttered nested if-else ladders.',
            code_example_2_title: 'Finding Primes with for-else Construct',
            code_example_2_code: `num = 17

for i in range(2, int(num**0.5) + 1):
    if num % i == 0:
        print(f"{num} is composite (divisible by {i})")
        break
else:
    # Runs only if no break was triggered!
    print(f"{num} is a Prime Number!")`,
            code_example_2_explanation: 'The `else` branch of a loop only fires when the loop naturally exhausts its items without interruption.',
            assignment_prompt: 'Print all even numbers from 2 to 20 using list comprehension.',
            assignment_starter_code: `# Generate even numbers list and print`,
            assignment_solution: `evens = [x for x in range(2, 21) if x % 2 == 0]
print("Even numbers:", evens)`,
            order_index: 2
          }
        ]
      },
      {
        id: 'py-unit-2',
        title: 'NumPy & Pandas',
        order_index: 2,
        topics: [
          {
            id: 'py-numpy-basics',
            title: 'NumPy: Fast Vectorized Numerical Computing',
            description: 'NDArray basics, broadcasting, matrix arithmetic, and vectorization.',
            content_simple_english: `Standard Python lists store references to objects scattered in memory, which is slow for big data.

NumPy (Numerical Python) provides 'ndarray' (N-Dimensional Array):
• Contiguous C-speed memory buffers: Stores raw numbers side-by-side in RAM.
• Vectorization: Operations run simultaneously on entire arrays without slow Python for-loops!
• Broadcasting: Automatically expands arrays of different shapes to perform matrix math.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('np.array([1, 2, 3])', 'Contiguous RAM buffer', 'Matrix Math (A @ B)', 'SIMD Hardware acceleration', 'Instant Vectorized Result'),
            code_example_1_title: 'Vectorized Arithmetic and Broadcasting',
            code_example_1_code: `import numpy as np

# Create 2D matrix
matrix = np.array([[1, 2, 3],
                   [4, 5, 6]])

# Scalar broadcasting: adds 10 to every element instantly!
result = matrix * 10

print("Original shape:", matrix.shape)
print("Vectorized multiplication:\\n", result)`,
            code_example_1_explanation: 'NumPy computes this in compiled C code at hardware speeds without iterating with Python loops.',
            code_example_2_title: 'Matrix Multiplication and Statistics',
            code_example_2_code: `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Matrix Dot Product (@ operator)
C = A @ B

print("Matrix Product A @ B:\\n", C)
print("Mean:", np.mean(C))
print("Standard Deviation:", round(np.std(C), 2))`,
            code_example_2_explanation: '`A @ B` performs linear algebra matrix dot-product multiplication.',
            assignment_prompt: 'Create a 1D NumPy array from 10 to 50 with step 5 and print its sum.',
            assignment_starter_code: `import numpy as np
# Create array with np.arange and print sum`,
            assignment_solution: `import numpy as np
arr = np.arange(10, 55, 5)
print("Array:", arr)
print("Sum:", np.sum(arr))`,
            order_index: 1
          },
          {
            id: 'py-pandas-data-analysis',
            title: 'Pandas: DataFrames and Data Manipulation',
            description: 'Series, DataFrame, filtering with .loc/.iloc, and groupby aggregations.',
            content_simple_english: `Pandas is the premier library for tabular data (like an Excel sheet or SQL table inside Python):

Core Objects:
• Series: 1D column with custom indices.
• DataFrame: 2D table composed of multiple named columns.

Key Capabilities:
• Fast filtering: df[df['score'] > 85]
• Coordinate selection: .loc[label] and .iloc[integer position]
• Grouping: df.groupby('department')['salary'].mean()`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Load Data (CSV/Dict)', 'Create DataFrame', 'Filter & Transform', 'Groupby Aggregations', 'Actionable Insights'),
            code_example_1_title: 'Creating and Filtering a DataFrame',
            code_example_1_code: `import pandas as pd

data = {
    "Name": ["Sarah", "Liam", "Priya", "Carlos"],
    "Role": ["Dev", "Dev", "Designer", "Dev"],
    "Score": [94, 82, 91, 78]
}

df = pd.DataFrame(data)

# Filter high performers
top_scorers = df[df["Score"] >= 85]
print("Top Scorers (>= 85):\\n", top_scorers)`,
            code_example_1_explanation: '`df["Score"] >= 85` produces a boolean mask that subsets the DataFrame rows instantly.',
            code_example_2_title: 'Grouping and Aggregations',
            code_example_2_code: `import pandas as pd

data = {
    "Department": ["Eng", "Eng", "Design", "Design", "HR"],
    "Salary": [95000, 110000, 80000, 85000, 70000]
}
df = pd.DataFrame(data)

# Calculate mean salary per department
dept_summary = df.groupby("Department")["Salary"].agg(["mean", "count"])
print("Department Summary:\\n", dept_summary)`,
            code_example_2_explanation: '`groupby` implements split-apply-combine logic to compute multi-column aggregations.',
            assignment_prompt: 'Create a DataFrame with 3 products and prices, and calculate the maximum price.',
            assignment_starter_code: `import pandas as pd
# Create DataFrame and print max price`,
            assignment_solution: `import pandas as pd
df = pd.DataFrame({"Product": ["Keyboard", "Mouse", "Monitor"], "Price": [80, 40, 250]})
print("Max Price:", df["Price"].max())`,
            order_index: 2
          }
        ]
      }
    ]
  },
  {
    id: 'java',
    title: 'Java Enterprise & Core Concepts',
    slug: 'java-programming',
    description: 'Learn Java architecture (JVM/JDK), OOP patterns, Collections Framework, Streams API, and concurrency.',
    icon: 'Coffee',
    difficulty: 'Beginner to Advanced',
    estimated_hours: 50,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 4,
    units: [
      {
        id: 'java-unit-1',
        title: 'Intro to Java Basics',
        order_index: 1,
        topics: [
          {
            id: 'java-architecture-types',
            title: 'Java Architecture (WORA/JVM) & Primitives',
            description: 'Write Once Run Anywhere, Bytecode, JVM, primitive data types, and stack vs heap.',
            content_simple_english: `Java was designed around 'Write Once, Run Anywhere' (WORA):
1. You write Java source code (.java).
2. The javac compiler translates it into platform-independent Bytecode (.class).
3. The Java Virtual Machine (JVM) interprets and Just-In-Time (JIT) compiles the bytecode into native machine instructions for Windows, Mac, or Linux!

Primitive Types:
• Integers: byte (1B), short (2B), int (4B), long (8B)
• Floating: float (4B), double (8B)
• Others: char (2B Unicode!), boolean (true/false)`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Source (.java)', 'javac compiler', 'Bytecode (.class)', 'JVM (JIT Engine)', 'Native CPU Execution'),
            code_example_1_title: 'Standard Java Class Structure',
            code_example_1_code: `public class Main {
    public static void main(String[] args) {
        String studentName = "Amara";
        int certScore = 96;
        
        System.out.println("Welcome to Code Nexus Java Track!");
        System.out.println("Student: " + studentName + " | Score: " + certScore);
    }
}`,
            code_example_1_explanation: 'Every Java application must have a class and `public static void main(String[] args)`. `System.out.println` streams output to standard console.',
            code_example_2_title: 'Primitive Types and Wrapper Classes',
            code_example_2_code: `public class TypesDemo {
    public static void main(String[] args) {
        // Primitive
        int primitiveInt = 42;
        
        // Wrapper Class (Object reference on Heap)
        Integer wrapperInt = Integer.valueOf(primitiveInt); // Autoboxing
        
        System.out.println("Primitive: " + primitiveInt);
        System.out.println("Wrapper Max Value: " + Integer.MAX_VALUE);
    }
}`,
            code_example_2_explanation: 'Primitives live on the Stack for speed. Wrapper objects allow primitives to be placed inside Java Collections like `ArrayList<Integer>`.',
            assignment_prompt: 'Write a Java program that converts temperature from Celsius (37) to Fahrenheit (C * 9/5 + 32).',
            assignment_starter_code: `public class Solution {
    public static void main(String[] args) {
        double celsius = 37.0;
        // Convert and print fahrenheit
    }
}`,
            assignment_solution: `public class Solution {
    public static void main(String[] args) {
        double celsius = 37.0;
        double fahrenheit = (celsius * 9.0 / 5.0) + 32.0;
        System.out.println("Fahrenheit: " + fahrenheit);
    }
}`,
            order_index: 1
          }
        ]
      },
      {
        id: 'java-unit-2',
        title: 'Collections & Modern Streams',
        order_index: 2,
        topics: [
          {
            id: 'java-collections-streams',
            title: 'Java Collections Framework and Streams API',
            description: 'ArrayList, HashMap, HashSet, and functional stream operations (filter, map, collect).',
            content_simple_english: `The Java Collections Framework provides ready-made data structures:
• List (ArrayList, LinkedList): Ordered collection allowing duplicates.
• Set (HashSet, TreeSet): Collection with guaranteed uniqueness.
• Map (HashMap, TreeMap): Key-Value pairs with fast hashing.

Streams API (Java 8+):
Allows functional processing of data pipelines! Instead of writing manual loops, you chain filter(), map(), and collect().`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Collection Source', 'stream() pipeline', 'filter(predicate)', 'map(transformation)', 'collect(Collectors.toList())'),
            code_example_1_title: 'Processing Lists with Java Streams',
            code_example_1_code: `import java.util.*;
import java.util.stream.Collectors;

public class StreamDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("David", "Alice", "Bob", "Danielle", "Chris");
        
        // Filter names starting with 'D' and uppercase them
        List<String> result = names.stream()
            .filter(name -> name.startsWith("D"))
            .map(String::toUpperCase)
            .collect(Collectors.toList());
            
        System.out.println("Filtered names: " + result);
    }
}`,
            code_example_1_explanation: 'The stream lazily evaluates elements and transforms them into an immutable result list cleanly.',
            code_example_2_title: 'Key-Value Lookups with HashMap',
            code_example_2_code: `import java.util.HashMap;
import java.util.Map;

public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> userPoints = new HashMap<>();
        userPoints.put("Alice", 120);
        userPoints.put("Bob", 95);
        userPoints.put("Charlie", 150);
        
        System.out.println("Alice's Points: " + userPoints.get("Alice"));
        System.out.println("Has Bob? " + userPoints.containsKey("Bob"));
    }
}`,
            code_example_2_explanation: 'HashMap gives average O(1) time complexity for insertions and lookups based on key hashing.',
            assignment_prompt: 'Create an ArrayList of integers [1, 2, 3, 4, 5], square each using Streams map(), and print the list.',
            assignment_starter_code: `import java.util.*;
import java.util.stream.Collectors;

public class Solution {
    public static void main(String[] args) {
        // Implement stream mapping
    }
}`,
            assignment_solution: `import java.util.*;
import java.util.stream.Collectors;

public class Solution {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> squares = nums.stream().map(n -> n * n).collect(Collectors.toList());
        System.out.println("Squares: " + squares);
    }
}`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'sql-databases',
    title: 'SQL & Relational Databases (PostgreSQL)',
    slug: 'sql-databases',
    description: 'Master RDBMS data models, DDL, DML, complex JOINs, Aggregations, Window Functions, and CTEs.',
    icon: 'Database',
    difficulty: 'Beginner to Advanced',
    estimated_hours: 40,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 5,
    units: [
      {
        id: 'sql-unit-1',
        title: 'RDBMS Foundations & Basic Queries',
        order_index: 1,
        topics: [
          {
            id: 'sql-select-filtering',
            title: 'Data Query Language (SELECT, WHERE, ORDER BY, LIMIT)',
            description: 'Selecting columns, filtering conditions, pattern matching with LIKE, sorting, and pagination.',
            content_simple_english: `SQL (Structured Query Language) is the global standard for asking questions of relational databases.

Basic Query Anatomy:
• SELECT: Which columns you want to view.
• FROM: Which table contains the data.
• WHERE: Filter rows matching specific criteria.
• ORDER BY: Sort results in ASC (ascending) or DESC (descending) order.
• LIMIT: Retrieve only the top N rows (useful for pagination).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('FROM table_name', 'WHERE condition', 'SELECT columns', 'ORDER BY column', 'LIMIT row_count'),
            code_example_1_title: 'Filtering and Sorting Employees',
            code_example_1_code: `-- Retrieve high-earning active developers sorted by salary
SELECT id, full_name, role, salary
FROM employees
WHERE salary >= 80000 AND status = 'active'
ORDER BY salary DESC
LIMIT 5;`,
            code_example_1_explanation: 'Filters active employees with salary >= $80,000, orders them with highest earners first, and limits output to the top 5.',
            code_example_2_title: 'Pattern Matching with LIKE and ILIKE',
            code_example_2_code: `-- In PostgreSQL, ILIKE is case-insensitive
SELECT title, category, unlock_cost
FROM library_resources
WHERE title ILIKE '%programming%'
  AND unlock_cost <= 150;`,
            code_example_2_explanation: '`%programming%` matches any book containing the word "programming" anywhere in the title, regardless of capitalization in PostgreSQL.',
            assignment_prompt: 'Write a SQL query to select name and score from students where score > 85 ordered by score DESC.',
            assignment_starter_code: `-- Write your SQL query here`,
            assignment_solution: `SELECT name, score FROM students WHERE score > 85 ORDER BY score DESC;`,
            order_index: 1
          },
          {
            id: 'sql-joins-aggregations',
            title: 'Multi-Table JOINs and GROUP BY Aggregations',
            description: 'INNER JOIN, LEFT JOIN, COUNT, SUM, AVG, GROUP BY, and HAVING.',
            content_simple_english: `In normalized databases, data is split into multiple related tables:

JOIN Types:
• INNER JOIN: Returns only rows that match in BOTH tables.
• LEFT JOIN: Returns ALL rows from the left table, plus matched rows from right (fills NULL if no match).

Aggregations:
• COUNT(), SUM(), AVG(), MIN(), MAX()
• GROUP BY: Compiles rows into summary groups.
• HAVING: Filters grouped rows (WHERE filters BEFORE grouping; HAVING filters AFTER grouping).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('JOIN users & certs', 'GROUP BY user_id', 'Compute COUNT(cert_id)', 'HAVING count >= 2', 'Output Power Learners'),
            code_example_1_title: 'INNER JOIN across Users and Certificates',
            code_example_1_code: `SELECT u.id, u.full_name, c.course_title, c.score_percent, c.issue_date
FROM users u
INNER JOIN certificates c ON u.id = c.user_id
WHERE c.score_percent >= 85.0
ORDER BY c.issue_date DESC;`,
            code_example_1_explanation: 'Connects the `users` table to `certificates` via foreign key `u.id = c.user_id` to show who earned which certificate.',
            code_example_2_title: 'GROUP BY and HAVING Aggregation',
            code_example_2_code: `SELECT u.role, COUNT(u.id) AS total_users, AVG(u.points) AS avg_points
FROM users u
GROUP BY u.role
HAVING COUNT(u.id) > 5;`,
            code_example_2_explanation: 'Groups users by role, computes the average points earned per role, and shows only roles with more than 5 members.',
            assignment_prompt: 'Write a query to count how many questions exist for each difficulty level from questions table.',
            assignment_starter_code: `-- Group by difficulty and count`,
            assignment_solution: `SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty;`,
            order_index: 2
          }
        ]
      }
    ]
  },
  {
    id: 'javascript',
    title: 'JavaScript Modern & Fullstack',
    slug: 'javascript-programming',
    description: 'Learn execution contexts, closures, promises, async/await, DOM events, and modern ES6+ features.',
    icon: 'Globe',
    difficulty: 'Beginner to Advanced',
    estimated_hours: 45,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 6,
    units: [
      {
        id: 'js-unit-1',
        title: 'Core Engine & Asynchronous Architecture',
        order_index: 1,
        topics: [
          {
            id: 'js-async-promises',
            title: 'Promises, Async/Await and Event Loop',
            description: 'Single-threaded event loop, microtask queue, Promise lifecycle, and async/await syntax.',
            content_simple_english: `JavaScript runs on a single thread with an Event Loop:

• Call Stack: Executes synchronous functions one at a time.
• Web APIs / Node APIs: Handles timers (setTimeout), network requests (fetch), and disk I/O in the background.
• Microtask Queue: Promises (.then) jump to the front of the queue before ordinary tasks!
• async/await: Lets you write asynchronous code that reads like clean synchronous code with try/catch error handling.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Call async function', 'await fetch(url)', 'Push to Background API', 'Promise resolves', 'Resume on Call Stack'),
            code_example_1_title: 'Using async/await with try-catch',
            code_example_1_code: `async function fetchUserProfile(userId) {
    try {
        const response = await fetch(\`/api/profile?id=\${userId}\`);
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const data = await response.json();
        console.log("User Loaded:", data.full_name);
        return data;
    } catch (err) {
        console.error("Failed to load user:", err.message);
    }
}`,
            code_example_1_explanation: '`await` pauses execution of this async function without freezing the entire browser or server event loop.',
            code_example_2_title: 'Promise.all for Concurrent API Calls',
            code_example_2_code: `async function loadDashboard() {
    console.log("Loading dashboard stats concurrently...");
    const [courses, certs, points] = await Promise.all([
        Promise.resolve(["C", "C++", "Python"]),
        Promise.resolve(["C++ Certified"]),
        Promise.resolve(150)
    ]);
    console.log({ courses, certs, points });
}

loadDashboard();`,
            code_example_2_explanation: '`Promise.all` fires all promises simultaneously in parallel, cutting load times dramatically.',
            assignment_prompt: 'Write an async function delay(ms) that returns a Promise resolving after ms milliseconds.',
            assignment_starter_code: `// Implement delay function`,
            assignment_solution: `function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'html-css',
    title: 'HTML5 & CSS3 Responsive Web Design',
    slug: 'html-css-web',
    description: 'Master semantic HTML5, Flexbox, CSS Grid, animations, media queries, and responsive web design.',
    icon: 'Palette',
    difficulty: 'Beginner to Intermediate',
    estimated_hours: 35,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 7,
    units: [
      {
        id: 'html-unit-1',
        title: 'Modern Layouts: Flexbox and Grid',
        order_index: 1,
        topics: [
          {
            id: 'css-flexbox-grid',
            title: 'Flexbox and Two-Dimensional CSS Grid',
            description: 'Flex containers, justify-content, align-items, grid-template-columns, and responsive breakpoints.',
            content_simple_english: `Modern CSS gives you two incredible layout systems:

1. Flexbox (1-Dimensional):
   Controls alignment along a single axis (either row or column).
   Properties: display: flex, justify-content (main axis), align-items (cross axis).

2. CSS Grid (2-Dimensional):
   Controls rows AND columns simultaneously! Perfect for entire page structures and card galleries.
   Properties: display: grid, grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)), gap: 1.5rem.`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('display: grid', 'grid-template-columns', 'Auto-fit cards', 'Flex inside card item', 'Perfect Responsive UI'),
            code_example_1_title: 'Responsive Card Grid with CSS Grid',
            code_example_1_code: `<div class="grid-container">
  <div class="card">Course 1</div>
  <div class="card">Course 2</div>
  <div class="card">Course 3</div>
</div>

<style>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}
.card {
  background: #1e293b;
  color: white;
  padding: 24px;
  border-radius: 12px;
}
</style>`,
            code_example_1_explanation: '`repeat(auto-fit, minmax(250px, 1fr))` automatically reflows columns based on screen width without requiring media queries!',
            code_example_2_title: 'Flexbox Centering and Navbar Layout',
            code_example_2_code: `<nav class="navbar">
  <div class="logo">Code Nexus</div>
  <div class="nav-links">
    <a href="/courses">Courses</a>
    <a href="/practice">Practice</a>
    <a href="/exam">Exams</a>
  </div>
</nav>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #0f172a;
}
</style>`,
            code_example_2_explanation: '`justify-content: space-between` pushes the logo to the far left and navigation links to the far right with automatic spacing.',
            assignment_prompt: 'Write CSS to center a modal window both horizontally and vertically inside a screen container using Flexbox.',
            assignment_starter_code: `/* Center modal with flex */
.container {
    /* add styles */
}`,
            assignment_solution: `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'app-dev',
    title: 'Mobile App Development (Kotlin, Dart & Flutter)',
    slug: 'app-development',
    description: 'Native Android with Kotlin and cross-platform mobile apps with Dart & Flutter.',
    icon: 'Smartphone',
    difficulty: 'Intermediate to Advanced',
    estimated_hours: 50,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 8,
    units: [
      {
        id: 'app-unit-1',
        title: 'Flutter & Kotlin Engines',
        order_index: 1,
        topics: [
          {
            id: 'flutter-widgets-lifecycle',
            title: 'Flutter Widget Architecture (Stateless vs Stateful)',
            description: 'Declarative UI, build contexts, setState, and mobile app scaffolding.',
            content_simple_english: `In Flutter, 'Everything is a Widget'!

UI is written declaratively in code, matching state directly:
• StatelessWidget: An immutable blueprint. It never changes after being drawn (e.g., text label, icon).
• StatefulWidget: Owns dynamic State that can change over time (e.g., checkbox, counter, text field). Calling setState() tells Flutter to re-render the widget!`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('User taps button', 'setState(() { count++; })', 'Mark widget dirty', 'Call build(context)', 'UI redraws with new count'),
            code_example_1_title: 'Stateful Counter Widget in Flutter',
            code_example_1_code: `import 'package:flutter/material.dart';

class CounterWidget extends StatefulWidget {
  @override
  _CounterWidgetState createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _points = 0;

  void _addPoints() {
    setState(() {
      _points += 4; // Practice question solved!
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Nexus Points: \$_points', style: TextStyle(fontSize: 24)),
        ElevatedButton(
          onPressed: _addPoints,
          child: Text('Solve Question (+4 pts)'),
        )
      ],
    );
  }
}`,
            code_example_1_explanation: '`setState` schedules a UI redraw efficiently without rebuilding unrelated screen sections.',
            code_example_2_title: 'Kotlin Null Safety Mechanics',
            code_example_2_code: `fun main() {
    var regularString: String = "Code Nexus"
    // regularString = null // Compilation Error!
    
    var nullableString: String? = null // Explicitly nullable with ?
    
    // Safe call operator (?.)
    println("Length: \${nullableString?.length}") // Prints 'null', no crash!
    
    // Elvis operator (?:) provides default fallback
    val safeLength = nullableString?.length ?: 0
    println("Fallback length: \$safeLength")
}`,
            code_example_2_explanation: 'Kotlin eliminates the billion-dollar NullPointerException mistake through compile-time null tracking.',
            assignment_prompt: 'Write a Dart function int add(int a, int b) and call it with 10 and 20.',
            assignment_starter_code: `// Write Dart add function`,
            assignment_solution: `int add(int a, int b) => a + b;
void main() {
  print(add(10, 20));
}`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms (DSA)',
    slug: 'dsa-mastery',
    description: 'Master Big O notation, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
    icon: 'Network',
    difficulty: 'Intermediate to Advanced',
    estimated_hours: 60,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 9,
    units: [
      {
        id: 'dsa-unit-1',
        title: 'Complexity Analysis & Core Data Structures',
        order_index: 1,
        topics: [
          {
            id: 'dsa-big-o-notation',
            title: 'Asymptotic Complexity Analysis (Big O Notation)',
            description: 'Time and space bounds: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n).',
            content_simple_english: `Big O Notation measures how runtime or memory usage grows as the input size (N) scales to millions:

Complexity Hierarchy (Fastest to Slowest):
1. O(1) Constant: Array index lookup, Hash map get.
2. O(log N) Logarithmic: Binary search (divides problem in half each step).
3. O(N) Linear: Looping through an array once.
4. O(N log N) Linearithmic: Merge Sort, Quick Sort (fastest comparison sorting).
5. O(N^2) Quadratic: Nested loops (Bubble sort, Selection sort).
6. O(2^N) Exponential: Naive recursion (Fibonacci without memoization).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('Input Size N scales', 'O(1): Flat line', 'O(log N): Gentle curve', 'O(N): 45-degree slope', 'O(N^2): Steep explosion'),
            code_example_1_title: 'O(log N) Binary Search Implementation',
            code_example_1_code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid # Target found!
        elif arr[mid] < target:
            left = mid + 1 # Search right half
        else:
            right = mid - 1 # Search left half
            
    return -1 # Not found

# On 1,000,000 items, binary search takes at most 20 checks!
sorted_data = [10, 20, 30, 40, 50, 60, 70, 80]
print("Index of 50:", binary_search(sorted_data, 50))`,
            code_example_1_explanation: 'Halving the search space each step makes binary search logarithmically fast: 1 million items takes only ~20 iterations.',
            code_example_2_title: 'Dynamic Programming: O(2^N) to O(N) Optimization',
            code_example_2_code: `# Memoized Fibonacci with O(N) time and O(N) space
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print("Fibonacci(50) computed instantly:", fib_memo(50))`,
            code_example_2_explanation: 'Naive recursion recalculates the same subproblems millions of times. Caching results in `memo` turns an impossible computation into an instant answer.',
            assignment_prompt: 'Write an iterative function in Python to compute the factorial of n in O(n) time.',
            assignment_starter_code: `def factorial(n):
    # Compute factorial iteratively
    pass`,
            assignment_solution: `def factorial(n):
    res = 1
    for i in range(2, n + 1):
        res *= i
    return res

print(factorial(5)) # 120`,
            order_index: 1
          }
        ]
      }
    ]
  },
  {
    id: 'system-design',
    title: 'System Design & High-Scalability Architecture',
    slug: 'system-design',
    description: 'Learn horizontal scaling, load balancers, caching, database replication, microservices, and high availability.',
    icon: 'Boxes',
    difficulty: 'Advanced',
    estimated_hours: 45,
    completion_reward_points: 50,
    exam_reward_points: 10,
    order_index: 10,
    units: [
      {
        id: 'sd-unit-1',
        title: 'Scalability & Reliability Architecture',
        order_index: 1,
        topics: [
          {
            id: 'sd-scaling-load-balancing',
            title: 'Horizontal vs Vertical Scaling & Load Balancers',
            description: 'Scale-up vs scale-out, Round Robin, Least Connections, SPOF elimination, and reverse proxies.',
            content_simple_english: `When millions of developers visit Code Nexus, how does the system stay lightning fast?

1. Vertical Scaling (Scale Up):
   Add more RAM, faster CPUs, or bigger SSDs to a single machine.
   Limits: Very expensive, physical hardware ceilings, and creates a Single Point of Failure (SPOF).

2. Horizontal Scaling (Scale Out):
   Add dozens or hundreds of cheaper commodity servers behind a Load Balancer!
   Benefits: Infinite scalability, fault tolerance (if one server crashes, others absorb traffic).

Load Balancer Algorithms:
• Round Robin: Distributes requests sequentially (1, 2, 3, 1, 2, 3).
• Least Connections: Sends the next request to the server currently handling the fewest active connections.
• IP Hash: Routes requests from the same user IP to the same backend server (session affinity).`,
            diagram_type: 'flowchart',
            flowchart_code: createFlowchartSvg('User Traffic (DNS)', 'Load Balancer (Nginx)', 'Health Check Servers', 'App Server 1 (Active)', 'App Server 2 (Active)'),
            code_example_1_title: 'Nginx Reverse Proxy and Load Balancer Configuration',
            code_example_1_code: `http {
    upstream codenexus_backend {
        # Load balancing across 3 app instances
        least_conn; # Route to server with fewest active connections
        server app1.nexus.internal:3000 max_fails=3 fail_timeout=10s;
        server app2.nexus.internal:3000 max_fails=3 fail_timeout=10s;
        server app3.nexus.internal:3000 backup; # Fallback only
    }

    server {
        listen 80;
        server_name codenexus.io;

        location / {
            proxy_pass http://codenexus_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}`,
            code_example_1_explanation: 'If `app1` encounters 3 errors, Nginx automatically takes it out of rotation and redirects traffic to healthy instances without user interruption.',
            code_example_2_title: 'Cache-Aside Pattern in Python with Redis',
            code_example_2_code: `import json

class CacheAsideService:
    def __init__(self, db_client, cache_client):
        self.db = db_client
        self.cache = cache_client

    def get_course_topics(self, course_id):
        cache_key = f"course:{course_id}:topics"
        # 1. Check fast in-memory cache first
        cached = self.cache.get(cache_key)
        if cached:
            print("CACHE HIT! Returning RAM copy.")
            return json.loads(cached)

        # 2. Cache Miss: Read from persistent PostgreSQL
        print("CACHE MISS! Querying PostgreSQL...")
        topics = self.db.query("SELECT * FROM course_topics WHERE course_id = %s", [course_id])
        
        # 3. Populate cache with 1-hour expiration (TTL 3600)
        self.cache.setex(cache_key, 3600, json.dumps(topics))
        return topics`,
            code_example_2_explanation: 'Reduces database load by 95%+. In-memory caches respond in < 1 millisecond compared to disk database queries.',
            assignment_prompt: 'Describe how a CDN (Content Delivery Network) reduces latency for global users visiting Code Nexus.',
            assignment_starter_code: `// Write explanation or pseudocode`,
            assignment_solution: `// A CDN caches static assets (JS, CSS, images, video) across edge servers worldwide. 
// When a user requests an asset, they connect to the geographically closest edge node, minimizing round-trip time.`,
            order_index: 1
          }
        ]
      }
    ]
  }
];

async function seedCourses() {
  const client = await pool.connect();
  try {
    console.log('--- Seeding Code Nexus Courses, Units & Topics ---');
    await client.query('BEGIN');

    for (const c of coursesData) {
      await client.query(`
        INSERT INTO courses (id, title, slug, description, icon, difficulty, estimated_hours, completion_reward_points, exam_reward_points, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          difficulty = EXCLUDED.difficulty,
          estimated_hours = EXCLUDED.estimated_hours;
      `, [c.id, c.title, c.slug, c.description, c.icon, c.difficulty, c.estimated_hours, c.completion_reward_points, c.exam_reward_points, c.order_index]);

      for (const u of c.units) {
        await client.query(`
          INSERT INTO course_units (id, course_id, title, order_index)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
        `, [u.id, c.id, u.title, u.order_index]);

        for (const t of u.topics) {
          await client.query(`
            INSERT INTO course_topics (
              id, unit_id, course_id, title, description, content_simple_english,
              flowchart_code, diagram_type,
              code_example_1_title, code_example_1_code, code_example_1_explanation,
              code_example_2_title, code_example_2_code, code_example_2_explanation,
              assignment_prompt, assignment_starter_code, assignment_solution, order_index
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
            ) ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              content_simple_english = EXCLUDED.content_simple_english,
              flowchart_code = EXCLUDED.flowchart_code,
              code_example_1_title = EXCLUDED.code_example_1_title,
              code_example_1_code = EXCLUDED.code_example_1_code,
              code_example_1_explanation = EXCLUDED.code_example_1_explanation,
              code_example_2_title = EXCLUDED.code_example_2_title,
              code_example_2_code = EXCLUDED.code_example_2_code,
              code_example_2_explanation = EXCLUDED.code_example_2_explanation,
              assignment_prompt = EXCLUDED.assignment_prompt,
              assignment_starter_code = EXCLUDED.assignment_starter_code,
              assignment_solution = EXCLUDED.assignment_solution;
          `, [
            t.id, u.id, c.id, t.title, t.description, t.content_simple_english,
            t.flowchart_code, t.diagram_type,
            t.code_example_1_title, t.code_example_1_code, t.code_example_1_explanation,
            t.code_example_2_title, t.code_example_2_code, t.code_example_2_explanation,
            t.assignment_prompt, t.assignment_starter_code, t.assignment_solution, t.order_index
          ]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Courses, Units, and Topics seeded successfully with 2+ examples, diagrams, and assignments!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding courses:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCourses();
