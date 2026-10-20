/**
 * Complete Curriculum Data: C Programming Track (17 Topics)
 * Conforms strictly to the 14-Section Educational Content Engine Standard.
 */

const {
  createPointerMemorySvg,
  createMemoryLayoutSvg,
  createControlFlowSvg,
} = require('./diagrams');

const cTopics = [
  {
    id: 'c-history-and-origin',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'History and Origin of C',
    description: 'Dennis Ritchie at Bell Labs, Unix operating system rewrite, and why C remains the foundation of modern computing.',
    order_index: 1,
    learning_objectives: [
      'Understand why C was invented and how it evolved from BCPL and B',
      'No programming prerequisites required; assumes basic computer literacy',
      'Recognize why major operating systems, runtimes, and databases are written in C'
    ],
    prerequisites: ['Basic understanding of hardware vs software'],
    expected_outcomes: ['Able to explain the role of C in systems programming and its historical impact on modern languages'],
    formal_definition: 'C is a general-purpose, procedural, statically typed computer programming language featuring structured programming, lexical variable scope, and low-level memory access capabilities through pointers.',
    content_simple_english: `Before C was created, programmers faced a brutal choice: write assembly language (which was blazingly fast but locked to only one specific CPU model), or write early high-level languages like FORTRAN (which were portable but lacked direct hardware access and were too slow for operating systems).

Between 1969 and 1973, Dennis Ritchie and Ken Thompson at Bell Laboratories developed C to rewrite the Unix operating system. In 1973, when Unix was successfully rewritten in C, it marked a computing revolution: for the first time in history, an entire operating system could be ported to different hardware architectures simply by writing a new C compiler.

Today, C is everywhere under the hood. The Linux kernel, macOS Darwin kernel, Windows NT kernel, Python interpreter (CPython), Git, and SQLite are all engineered in C. Learning C teaches you how the CPU, stack, heap, and operating system actually behave.`,
    hinglish_explanation: `C language ko 1972 me Dennis Ritchie ne Bell Labs me create kiya tha. 

C se pehle developers ko Assembly language likhni padti thi jo hardware-dependent hoti thi (ek computer ka code dusre computer pe nahi chalta tha). Dennis Ritchie ne C ko aisa design kiya ki ye Assembly jitna fast hai aur memory ko directly control kar sakta hai, lekin English-like syntax ke sath. 1973 me Unix Operating System ko C me dobara likha gaya. Aaj hum jo Windows, Linux, Android, ya Python use karte hain—sabka core C language me hi bana hai!`,
    why_it_matters: 'C provides direct hardware access without runtime overhead, making it indispensable for operating systems, device drivers, game engines, and embedded microcontrollers.',
    when_to_use: 'Use C when you need predictable microsecond latency, zero garbage collection pauses, direct hardware control, or embedded systems programming. Avoid C for rapid GUI prototyping or heavy web applications where memory safety and development speed outweigh raw CPU efficiency.',
    syntax_guide: {
      template: '#include <stdio.h>\n\nint main(void) {\n    // executable statements\n    return 0;\n}',
      components: [
        { name: '#include <stdio.h>', role: 'Preprocessor directive importing standard input/output declarations', required: true },
        { name: 'int main()', role: 'Entry point function where operating system transfers control', required: true },
        { name: 'return 0;', role: 'Exit code 0 signaling successful termination to OS shell', required: true }
      ],
      rules: ['Every C statement must end with a semicolon', 'C is strictly case-sensitive', 'main() must return an integer status']
    },
    code_example_1_title: 'Basic Foundational: Hello Code Nexus',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    printf("Hello, Code Nexus! Welcome to C.\\n");
    return 0;
}`,
    code_example_1_explanation: 'Line 1 includes standard I/O library headers. main(void) is the entry door. printf displays the string to stdout, and \\n triggers a newline flush. return 0 signals success.',
    code_example_1_output: 'Hello, Code Nexus! Welcome to C.',

    code_example_2_title: 'Intermediate Logic: Displaying Language Evolution Timeline',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    int yearB = 1969;
    int yearC = 1972;
    int yearUnixC = 1973;

    printf("Timeline of Systems Programming:\\n");
    printf("- %d: Ken Thompson develops B language\\n", yearB);
    printf("- %d: Dennis Ritchie develops C language\\n", yearC);
    printf("- %d: Unix Kernel rewritten in C\\n", yearUnixC);

    return 0;
}`,
    code_example_2_explanation: 'Demonstrates integer variable declaration, formatted printing using %d placeholders, and deterministic execution order.',
    code_example_2_output: `Timeline of Systems Programming:
- 1969: Ken Thompson develops B language
- 1972: Dennis Ritchie develops C language
- 1973: Unix Kernel rewritten in C`,

    code_example_3_title: 'Practical Application: Operating System Architecture Report',
    code_example_3_code: `#include <stdio.h>

int main(void) {
    const char *osName = "Linux Kernel";
    const char *creator = "Linus Torvalds";
    int initialYear = 1991;
    double estimatedCLinesPercent = 95.5;

    printf("--- SYSTEM ARCHITECTURE AUDIT ---\\n");
    printf("Target OS       : %s\\n", osName);
    printf("Originator      : %s\\n", creator);
    printf("Birth Year      : %d\\n", initialYear);
    printf("C Codebase Ratio: %.1f%%\\n", estimatedCLinesPercent);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates real-world use of string pointers (const char*), integer timestamps, formatted floating-point output with precision specifiers (%.1f), and literal percent escaping (%%).',
    code_example_3_output: `--- SYSTEM ARCHITECTURE AUDIT ---
Target OS       : Linux Kernel
Originator      : Linus Torvalds
Birth Year      : 1991
C Codebase Ratio: 95.5%`,

    code_walkthrough: {
      code: `#include <stdio.h>\nint main(void) {\n    printf("Origin: Bell Labs\\n");\n    return 0;\n}`,
      steps: [
        { line: 1, explanation: 'Preprocessor parses stdio.h and injects declarations into compilation unit.', state: 'Compilation Unit Ready' },
        { line: 2, explanation: 'main() function is entered; operating system prepares stack frame.', state: 'Stack Frame Allocated' },
        { line: 3, explanation: 'printf writes the byte stream to stdout file descriptor (fd 1).', state: 'Stdout Buffer Flushed' },
        { line: 4, explanation: 'Returns status code 0; stack frame popped; process exits.', state: 'Process Terminated (0)' }
      ],
      output: 'Origin: Bell Labs',
      output_reasoning: 'The string literal in printf followed by \\n is pushed to standard output.'
    },

    rules_and_restrictions: [
      'C is case-sensitive: main, Main, and MAIN are completely different symbols',
      'The entry point must be named main, returning int',
      'Statements must terminate with a semicolon (;)',
      'Identifiers cannot begin with a number or contain hyphens'
    ],
    common_mistakes: [
      {
        title: 'Missing Semicolon after statement',
        incorrect_code: `printf("Hello World")\nreturn 0;`,
        explanation: 'In C, semicolons are statement terminators, not separators. Omitting one causes a parse error.',
        corrected_code: `printf("Hello World");\nreturn 0;`,
        error_message: 'error: expected ";" before "return"',
        debug_tip: 'Always verify that every statement ends with a semicolon before the closing curly brace.'
      },
      {
        title: 'Using Void main without return type',
        incorrect_code: `void main() {\n    printf("Hello");\n}`,
        explanation: 'void main() is non-standard in ISO C. ISO C99 and C11 require main to return int to provide an exit status to the operating system shell.',
        corrected_code: `int main(void) {\n    printf("Hello\\n");\n    return 0;\n}`,
        error_message: 'warning: return type of "main" is not "int"',
        debug_tip: 'Always declare int main(void) or int main(int argc, char *argv[]).'
      }
    ],
    comparison_table: {
      title: 'C vs Assembly vs Python',
      concept_a: 'C Language',
      concept_b: 'Python / Modern High-Level',
      headers: ['Attribute', 'C Language', 'Python / Modern Scripting'],
      rows: [
        ['Execution Speed', 'Near-native bare-metal speed', 'Interpreted bytecode (10x-50x slower)'],
        ['Memory Control', 'Manual via pointers & malloc/free', 'Automatic garbage collection'],
        ['Portability', 'Compile-time portable across CPU architectures', 'Interpreted everywhere Python runtime is installed'],
        ['Typical Domain', 'OS kernels, embedded, game engines, drivers', 'Data science, web apps, automation scripts']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Linux & Windows operating system kernel development',
      'Microcontroller firmware in automotive and aerospace systems',
      'High-frequency algorithmic trading engines requiring sub-microsecond execution'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Who created the C programming language and at which research facility?',
        options: [
          'James Gosling at Sun Microsystems',
          'Dennis Ritchie at Bell Laboratories',
          'Bjarne Stroustrup at Bell Laboratories',
          'Guido van Rossum at CWI Amsterdam'
        ],
        correct_index: 1,
        explanation: 'Dennis Ritchie designed and implemented C between 1969 and 1973 at AT&T Bell Laboratories to develop the Unix operating system.'
      },
      {
        id: 2,
        type: 'output_prediction',
        question: 'What is the standard ISO C return type and required name of the program entry function?',
        options: ['void start()', 'int main()', 'void main()', 'int init()'],
        correct_index: 1,
        explanation: 'The ISO C standard mandates that the program entry point be int main(), returning an integer status code to the host environment.'
      }
    ],
    key_takeaways: [
      'C was created by Dennis Ritchie in 1972 at Bell Labs to write the Unix OS.',
      'C combines high-level syntax with low-level bare-metal hardware access.',
      'Linux, Windows, macOS kernels, and CPython are fundamentally implemented in C.'
    ],
    quick_revision_notes: 'C: Procedural, compiled, statically typed. Created 1972 by Dennis Ritchie. Entry point: int main(void). Terminated by semicolons. Standard I/O via <stdio.h>.',
    assignment_prompt: 'Write a complete C program that prints the title "C Systems Foundation", your name as the author, and Dennis Ritchie birth year (1941) formatted on separate lines.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Write your code here
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    printf("C Systems Foundation\\n");
    printf("Author: Developer\\n");
    printf("Dennis Ritchie Birth Year: %d\\n", 1941);
    return 0;
}`
  },

  {
    id: 'c-structure-of-a-program',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Structure of a C Program',
    description: 'Anatomy of a C program: preprocessor directives, global scope, main() function, statements, and blocks.',
    order_index: 2,
    learning_objectives: [
      'Understand the 5 mandatory sections of a C source file',
      'Learn how the main() function interacts with the operating system',
      'Master the usage of curly braces, code blocks, and statement termination'
    ],
    prerequisites: ['History and Origin of C'],
    expected_outcomes: ['Able to structure any C program correctly from scratch without compiler syntax errors'],
    formal_definition: 'A C program is a collection of one or more translation units consisting of external declarations, preprocessor directives, type definitions, function prototypes, and at least one function definition named main.',
    content_simple_english: `Every C program follows a clean, predictable structural blueprint:
1. Documentation & Comments: Explains author, license, and intent (ignored by compiler).
2. Preprocessor Directives: Lines beginning with '#' (like #include <stdio.h> or #define PI 3.14159) handled before compilation begins.
3. Global Declarations: Variables, constants, or function declarations accessible across the file.
4. The main() Function: The mandatory entry point where the operating system starts execution.
5. Function Body & Blocks: Statements enclosed within curly braces { }, each ending with a semicolon (;).`,
    hinglish_explanation: `C program ka structure ek ghar ke nakshe (blueprint) jaisa hota hai:
1. Sabse upar Header Files aati hain (#include <stdio.h>) jo compiler ko batati hain ki kaunse tools use karne hain.
2. Uske baad Macros (#define) aur Global Variables aate hain.
3. Fir aata hai sabse important main() function. Program ka execution hamesha main() ki pehli line se start hota hai chahe function code me kahi bhi ho.
4. Statements curly braces { } ke andar likhi jaati hain aur har statement ; pe khatam hoti hai.
5. Aakhiri me return 0; likhte hain jo OS ko batata hai ki program bina kisi crash ke complete ho gaya.`,
    why_it_matters: 'Understanding structure prevents compilation errors, linker failures, and scope bugs. It ensures your code integrates predictably with system toolchains.',
    when_to_use: 'Every C application adheres to this canonical structure. Modular code spreads declarations into header (.h) files and definitions into source (.c) files.',
    syntax_guide: {
      template: `#include <header.h>\n#define MACRO value\n\n// global declarations\n\nint main(int argc, char *argv[]) {\n    // local variable declarations\n    // executable statements\n    return 0;\n}`,
      components: [
        { name: '#include', role: 'Copies contents of header file into current source file', required: true },
        { name: '{ ... }', role: 'Defines a compound statement block and scope', required: true },
        { name: 'return 0;', role: 'Passes exit status 0 back to calling process', required: true }
      ],
      rules: ['Execution strictly begins at main()', 'Opening brace { must have matching closing brace }', 'Preprocessor directives do not use semicolons']
    },
    code_example_1_title: 'Basic Structure: Complete Minimal C Blueprint',
    code_example_1_code: `#include <stdio.h>

#define MAX_BUFFER 128

int main(void) {
    int bufferSize = MAX_BUFFER;
    printf("Allocated buffer capacity: %d bytes\\n", bufferSize);
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates header inclusion, preprocessor macro replacement, local stack variable allocation, and formatted standard output.',
    code_example_1_output: 'Allocated buffer capacity: 128 bytes',

    code_example_2_title: 'Intermediate Structure: Multi-Statement Function Execution',
    code_example_2_code: `#include <stdio.h>

// Global constant definition
const int EXIT_SUCCESS_CODE = 0;

int main(void) {
    int step1 = 10;
    int step2 = 20;
    int total = step1 + step2;

    printf("Executing Step 1: %d\\n", step1);
    printf("Executing Step 2: %d\\n", step2);
    printf("Cumulative Total : %d\\n", total);

    return EXIT_SUCCESS_CODE;
}`,
    code_example_2_explanation: 'Demonstrates global constants, sequential statement execution, arithmetic computation, and explicit return status.',
    code_example_2_output: `Executing Step 1: 10
Executing Step 2: 20
Cumulative Total : 30`,

    code_example_3_title: 'Practical Application: Command Line Arguments & State Inspection',
    code_example_3_code: `#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    // argv[0] holds the invocation path; strip directories for the file name
    const char *slash = strrchr(argv[0], '/');
    const char *program_name = slash ? slash + 1 : argv[0];

    printf("Process Invocation Report:\\n");
    printf("Argument count (argc) : %d\\n", argc);
    printf("Program executable    : %s\\n", program_name);

    if (argc == 1) {
        printf("Status: Executed with default parameters.\\n");
    }

    return 0;
}`,
    code_example_3_explanation: 'Demonstrates standard full signature int main(int argc, char *argv[]). argc represents argument count, argv[0] contains executable invocation path.',
    code_example_3_output: `Process Invocation Report:
Argument count (argc) : 1
Program executable    : solution.out
Status: Executed with default parameters.`,

    code_walkthrough: {
      code: `#include <stdio.h>\nint main(void) {\n    int a = 5;\n    int b = a * 2;\n    printf("Val: %d\\n", b);\n    return 0;\n}`,
      steps: [
        { line: 1, explanation: 'Incorporate standard input/output prototypes.', state: 'Headers Loaded' },
        { line: 3, explanation: 'Allocate 4 bytes on stack for a and store 5.', state: 'Stack: a=5' },
        { line: 4, explanation: 'Calculate 5 * 2, allocate stack memory for b, store 10.', state: 'Stack: a=5, b=10' },
        { line: 5, explanation: 'Pass format string and value of b (10) to printf.', state: 'Stdout: Val: 10' },
        { line: 6, explanation: 'Return 0 to terminate process and free stack frame.', state: 'Exited' }
      ],
      output: 'Val: 10',
      output_reasoning: 'a is initialized to 5, b is assigned 5 * 2 = 10, which printf displays.'
    },

    rules_and_restrictions: [
      'Preprocessor directives (#include, #define) must NOT end with a semicolon',
      'Variables declared inside { } have block scope and cease to exist when the block ends',
      'C requires matching opening and closing braces for every code block'
    ],
    common_mistakes: [
      {
        title: 'Putting semicolon at the end of #include or #define',
        incorrect_code: `#include <stdio.h>;\n#define MAX 100;`,
        explanation: 'Preprocessor directives are handled by macro expansion, not the C statement parser. Adding a semicolon injects an unintended stray semicolon into source text.',
        corrected_code: `#include <stdio.h>\n#define MAX 100`,
        error_message: 'warning: extra tokens at end of #include directive',
        debug_tip: 'Never put semicolons on lines starting with the # hash symbol.'
      }
    ],
    comparison_table: {
      title: 'main(void) vs main(int argc, char *argv[])',
      concept_a: 'int main(void)',
      concept_b: 'int main(int argc, char *argv[])',
      headers: ['Feature', 'int main(void)', 'int main(int argc, char *argv[])'],
      rows: [
        ['Parameter Count', '0 arguments accepted', '2 arguments accepted from OS shell'],
        ['Use Case', 'Simple programs, utility tools', 'CLI tools, scripts receiving user inputs/flags'],
        ['CLI Access', 'Cannot read command line flags', 'Full access to CLI strings via argv array']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Creating UNIX CLI tools accepting flags (e.g. ls -la, git commit)',
      'Structuring production embedded firmware with clean modular separation'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which of the following is NOT valid syntax for preprocessor directives in C?',
        options: ['#include <stdlib.h>', '#define BUFFER_SIZE 1024', '#include <stdio.h>;', '#define PI 3.14159'],
        correct_index: 2,
        explanation: 'Preprocessor directives do not use semicolon terminators. #include <stdio.h>; produces syntax errors or warnings.'
      }
    ],
    key_takeaways: [
      'A C program begins execution at the main() function.',
      'Preprocessor lines start with # and do not end with semicolons.',
      'return 0 from main() indicates clean execution to the operating system.'
    ],
    quick_revision_notes: 'Structure: #include -> #define -> Globals -> int main() { locals; statements; return 0; }',
    assignment_prompt: 'Write a program containing a macro #define PI 3.14159, declare radius = 7 in main, and calculate and print the circle area.',
    assignment_starter_code: `#include <stdio.h>
// Define macro and calculate circle area
int main(void) {
    return 0;
}`,
    assignment_solution: `#include <stdio.h>
#define PI 3.14159

int main(void) {
    double radius = 7.0;
    double area = PI * radius * radius;
    printf("Radius: %.1f\\n", radius);
    printf("Area  : %.2f\\n", area);
    return 0;
}`
  },

  {
    id: 'c-pointers-basics',
    course_id: 'c-lang',
    unit_id: 'c-unit-3',
    title: 'Pointers, Addresses & Dereferencing',
    description: 'Master memory addresses, address-of operator (&), dereference operator (*), and pointer mechanics in C.',
    order_index: 14,
    learning_objectives: [
      'Understand how the CPU addresses memory cells in RAM',
      'Master the address-of operator (&) and dereference operator (*)',
      'Learn how pointers enable pass-by-reference and dynamic memory'
    ],
    prerequisites: ['Variables and Data Types', 'Functions in C'],
    expected_outcomes: ['Able to manipulate memory addresses directly, inspect values via dereferencing, and avoid segmentation faults'],
    formal_definition: 'A pointer is a variable whose rvalue is the memory address of another object in the program address space. Dereferencing a pointer accesses or modifies the value stored at that target memory location.',
    content_simple_english: `Every variable you declare in C lives at an address in your process virtual address space (the operating system maps virtual pages to RAM). Addresses printed by a C program are virtual addresses: for example, int age = 25 might be at virtual address 0x7ffee4b589ac.

In C, we have two fundamental pointer operators:
1. The Address-Of Operator (&): When placed in front of a variable (&age), it retrieves the memory address where that variable lives.
2. The Dereference Operator (*): When placed in front of a pointer (*ptr), it goes to that memory address and accesses or changes the value stored inside.

Why do pointers exist?
1. Efficiency: Passing a massive 1,000,000-byte struct to a function by value copies all 1,000,000 bytes. Passing a pointer copies only 8 bytes (the memory address)!
2. Mutability in Functions: C functions are strictly pass-by-value. Pointers allow functions to modify caller variables directly.
3. Dynamic Memory: Structures like linked lists, trees, and dynamically resizable arrays cannot exist without pointers.`,
    hinglish_explanation: `Computer ki RAM ek bohot badi building jaisi hoti hai jisme hazaron rooms hote hain, aur har room ka ek unique Room Number (Memory Address) hota hai.

Jab aap int x = 50; likhte hain, toh RAM me ek room reserve hota hai jisme 50 store hota hai.
- & Operator (Address-of): &x ka matlab hai "x ka room number kya hai?"
- Pointer Variable: int *ptr = &x; iska matlab ptr ek aisa variable hai jo x ka room number store karta hai.
- * Operator (Dereference): *ptr ka matlab hai "ptr me jo room number likha hai, us room ke andar jao aur uski value nikalo ya badlo".

Agar aap *ptr = 100; kar denge, toh x ki value automatically 100 ho jayegi kyunki pointer ne directly memory location par jake value overwrite kar di!`,
    why_it_matters: 'Pointers give C its raw speed and efficiency. Without pointers, dynamic memory allocation (malloc), system calls, fast array traversal, and data structures like trees and graphs are impossible in C.',
    when_to_use: 'Use pointers when modifying function arguments in caller scope, dynamically allocating heap buffers, avoiding costly data copying, or implementing data structures. Never dereference a NULL pointer or uninitialized wild pointer.',
    syntax_guide: {
      template: 'int x = 42;\nint *ptr = &x;     // Declaration: ptr holds address of x\n*ptr = 99;         // Dereference: x is now 99',
      components: [
        { name: '&variable', role: 'Returns memory address of target variable', required: true },
        { name: 'type *ptr', role: 'Declares pointer variable holding address of specified type', required: true },
        { name: '*ptr', role: 'Dereference operator: accesses value at stored memory address', required: true }
      ],
      rules: [
        'A pointer must be initialized before dereferencing (to a valid address or NULL)',
        'Dereferencing NULL or invalid memory causes a Segmentation Fault (SIGSEGV)',
        'On the common 64-bit LP64/LLP64 data models, object pointers are 8 bytes, but the C standard does not promise every pointer type has the same size or representation'
      ]
    },
    code_example_1_title: 'Basic Pointer: Address Inspection & Value Dereference',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    int count = 42;
    int *pCount = &count; // pCount stores address of count

    printf("Value of count        : %d\\n", count);
    printf("Dereferenced (*pCount): %d\\n", *pCount);

    // Modify count via pointer
    *pCount = 100;
    printf("New value of count    : %d\\n", count);

    return 0;
}`,
    code_example_1_explanation: 'Line 5 creates pointer pCount storing &count. *pCount reads 42. In line 10, *pCount = 100 mutates the original variable count through its memory address.',
    code_example_1_output: `Value of count        : 42
Dereferenced (*pCount): 42
New value of count    : 100`,

    code_example_2_title: 'Intermediate Pointer: Passing by Pointer to Swap Values',
    code_example_2_code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 10;
    int y = 20;

    printf("Before swap: x=%d, y=%d\\n", x, y);
    swap(&x, &y); // Pass memory addresses
    printf("After swap : x=%d, y=%d\\n", x, y);

    return 0;
}`,
    code_example_2_explanation: 'Because C is strictly pass-by-value, swapping regular integers inside a function does nothing to the caller. By passing addresses &x and &y, swap() modifies caller variables in place.',
    code_example_2_output: `Before swap: x=10, y=20
After swap : x=20, y=10`,

    code_example_3_title: 'Practical Application: Safe Buffer Pointer Traversal & Counter',
    code_example_3_code: `#include <stdio.h>

int calculateLength(const char *str) {
    const char *ptr = str;
    while (*ptr != '\\0') {
        ptr++; // Advance pointer to next byte
    }
    return (int)(ptr - str); // Pointer subtraction yields count
}

int main(void) {
    const char message[] = "Code Nexus";
    int len = calculateLength(message);
    printf("String text: \\"%s\\"\\n", message);
    printf("Calculated length via pointer arithmetic: %d\\n", len);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates pointer arithmetic: ptr++ advances memory address by sizeof(char) = 1 byte. Subtracting start pointer from end pointer yields element count in O(N) time with O(1) space.',
    code_example_3_output: `String text: "Code Nexus"
Calculated length via pointer arithmetic: 10`,

    code_walkthrough: {
      code: `int n = 7;\nint *p = &n;\n*p = *p + 3;\nprintf("%d\\n", n);`,
      steps: [
        { line: 1, explanation: 'Allocate 4 bytes for n at address (e.g. 0x1000); store 7.', state: 'n = 7 @ 0x1000' },
        { line: 2, explanation: 'Allocate 8 bytes for pointer p at (e.g. 0x2000); store 0x1000.', state: 'p = 0x1000' },
        { line: 3, explanation: 'Dereference p to read 7, add 3 (=10), write 10 into address 0x1000.', state: 'n = 10' },
        { line: 4, explanation: 'Print value of n (which is now 10).', state: 'Stdout: 10' }
      ],
      output: '10',
      output_reasoning: '*p directly mutates the value in address 0x1000, so n reflects 10.'
    },

    rules_and_restrictions: [
      'Uninitialized pointers point to arbitrary memory addresses; dereferencing them causes undefined behavior or crashes',
      'Always initialize pointers to NULL if they do not yet point to an object',
      'Pointer types must match: you cannot safely store a double address in an int* without explicit cast'
    ],
    common_mistakes: [
      {
        title: 'Dereferencing an Uninitialized Wild Pointer',
        incorrect_code: `int *ptr;\n*ptr = 50; // CRASH! Wild pointer`,
        explanation: 'ptr contains garbage memory bits from the stack. Dereferencing attempts to write 50 to an arbitrary protected address, causing SIGSEGV (Segmentation Fault).',
        corrected_code: `int val = 0;\nint *ptr = &val;\n*ptr = 50;`,
        error_message: 'Segmentation fault (core dumped)',
        debug_tip: 'Always initialize pointers: int *ptr = NULL; or point them to an existing variable.'
      },
      {
        title: 'Confusing pointer declaration * with dereference *',
        incorrect_code: `int x = 5;\nint *ptr;\n*ptr = &x; // WRONG: *ptr is int, &x is address`,
        explanation: 'In declaration, * marks the variable as a pointer. In statements, * dereferences. Assigning an address to *ptr tries to cram an address into an integer value.',
        corrected_code: `int x = 5;\nint *ptr = &x; // Correctly assigns address`,
        error_message: 'warning: assignment makes integer from pointer without a cast',
        debug_tip: 'Remember: ptr holds the address; *ptr is the object at that address.'
      }
    ],
    comparison_table: {
      title: 'Direct Variable Access vs Pointer Access',
      concept_a: 'Direct Variable (x)',
      concept_b: 'Pointer (ptr) and dereference (*ptr)',
      headers: ['Feature', 'Direct Variable (x)', 'Pointer (ptr) / dereference (*ptr)'],
      rows: [
        ['Syntax', 'x = 10;', '*ptr = 10;'],
        ['Memory Stored', 'x stores the data value (e.g. 10)', 'ptr stores the targets address (e.g. 0x7fff...); *ptr is the target data'],
        ['Function Passing', 'Copies full value (caller cannot see changes)', 'Passes address (caller sees in-place modifications)'],
        ['Risk of Crash', 'No pointer-dereference risk (other bugs can still crash a program)', 'Can crash if NULL, dangling, or otherwise invalid']
      ]
    },
    diagram_svg: createPointerMemorySvg('count', '42', '0x7ffee4b589ac', 'pCount', '0x7ffee4b589a0'),
    practical_applications: [
      'Implementing dynamic data structures (Linked Lists, Binary Trees, Graphs)',
      'Passing large buffers and structs to functions with zero copy overhead',
      'Interacting with hardware memory-mapped I/O registers in embedded systems'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Given int x = 10; int *p = &x; what does the expression *p evaluate to?',
        options: ['The memory address of x', 'The integer value 10', 'The memory address of p', 'A compiler error'],
        correct_index: 1,
        explanation: 'The asterisk (*) operator dereferences the pointer, fetching the integer value (10) stored at the address pointed to by p.'
      },
      {
        id: 2,
        type: 'output_prediction',
        question: 'On the common LP64/LLP64 64-bit data models, how large is an object/data pointer?',
        options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on whether it points to char or double'],
        correct_index: 2,
        explanation: 'On LP64 and LLP64, data pointers are 64 bits (8 bytes), so char*, int*, and double* are 8 bytes there. The C standard itself does not guarantee every pointer type has identical size/representation.'
      }
    ],
    key_takeaways: [
      '& returns memory address of a variable; * accesses the value at an address.',
      'Pointers enable pass-by-reference and zero-copy data manipulation in C.',
      'Never dereference an uninitialized pointer or a NULL pointer.'
    ],
    quick_revision_notes: 'Pointers: & = address-of, * = dereference. 64-bit pointer size is 8 bytes. NULL pointer check before dereference prevents SIGSEGV.',
    assignment_prompt: 'Write a C function void doubleValue(int *val) that doubles the integer variable pointed to by val. In main(), declare x = 25, call doubleValue(&x), and print the result.',
    assignment_starter_code: `#include <stdio.h>

void doubleValue(int *val) {
    // Write code to double the value at val
}

int main(void) {
    int x = 25;
    // Call doubleValue and print x
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

void doubleValue(int *val) {
    if (val != NULL) {
        *val = *val * 2;
    }
}

int main(void) {
    int x = 25;
    printf("Initial x: %d\\n", x);
    doubleValue(&x);
    printf("Doubled x: %d\\n", x);
    return 0;
}`
  },

  {
    id: 'c-dynamic-memory-allocation',
    course_id: 'c-lang',
    unit_id: 'c-unit-4',
    title: 'Dynamic Memory Allocation (malloc, calloc, realloc, free)',
    description: 'Master heap memory management: malloc, calloc, realloc, free, memory leaks, and dangling pointers.',
    order_index: 16,
    learning_objectives: [
      'Understand the difference between Stack and Heap memory',
      'Master malloc(), calloc(), realloc(), and free() in <stdlib.h>',
      'Learn how to prevent memory leaks, dangling pointers, and double-free bugs'
    ],
    prerequisites: ['Pointers, Addresses & Dereferencing', 'Data Types and Type Modifiers'],
    expected_outcomes: ['Able to dynamically allocate, resize, and properly deallocate heap memory blocks without memory leaks'],
    formal_definition: 'Dynamic memory allocation is the process of allocating memory space from the heap segment during runtime execution using system allocator functions, retaining memory lifetime until explicitly deallocated via free().',
    content_simple_english: `When you declare a normal array in C like int arr[100];, its size must be known at compile time, and its memory is allocated on the Stack. When the function returns, stack memory is automatically destroyed.

However, real programs do not know in advance how much data a user will upload or request. This requires Heap Memory:
1. malloc(size_t size): Allocates uninitialized memory of given byte size. Returns void* pointer to first byte, or NULL if allocation fails.
2. calloc(size_t n, size_t size): Allocates memory for n items and initializes every single byte to zero (0).
3. realloc(void *ptr, size_t new_size): Resizes an existing heap allocation larger or smaller.
4. free(void *ptr): Returns allocated heap memory back to the operating system.

Golden Rule of C Heap Memory: For every malloc/calloc/realloc call, there MUST be exactly one corresponding free() call! Omitting free() creates a Memory Leak. Calling free() twice causes a Double Free crash.`,
    hinglish_explanation: `Stack memory automatic hoti hai—jaise hi function khatam hota hai, variables destroy ho jaate hain. Lekin agar aapko runtime par user se poochna ho ki "Kitne students ka data store karna hai?" toh aapko Heap Memory use karni padti hai.

C me heap memory ke 4 main functions hote hain:
1. malloc(n * sizeof(int)): Heap me n integers jitni jagah mangta hai. Isme garbage values hoti hain.
2. calloc(n, sizeof(int)): Jagah mangta hai aur sabhi bytes ko 0 se clean kar deta hai.
3. realloc(ptr, new_size): Pehle se allocated memory ko bada ya chhota karne ke liye.
4. free(ptr): Sabse important function! Ye allocated memory ko OS ko wapas lautata hai.

Agar aap free(ptr) karna bhool gaye, toh memory leak ho jayega (server ki RAM dheere-dheere bhar jayegi aur server crash ho jayega). Aur free karne ke baad hamesha ptr = NULL; kar dena chahiye taaki galti se usko dubara use na karein!`,
    why_it_matters: 'Modern applications handle dynamic workloads (variable file sizes, dynamic user tables, streaming data). Efficient heap management is fundamental to building high-uptime servers and scalable systems.',
    when_to_use: 'Use heap allocation when the required memory size is only known at runtime, or when data must persist across function calls until explicitly released. Avoid heap allocations for tiny, short-lived variables that belong on the stack.',
    syntax_guide: {
      template: 'int *arr = (int *)malloc(n * sizeof(int));\nif (arr == NULL) { /* handle failure */ }\n// use arr[i]\nfree(arr);\narr = NULL;',
      components: [
        { name: 'malloc(bytes)', role: 'Allocates raw bytes on heap, uninitialized', required: true },
        { name: 'calloc(count, size)', role: 'Allocates and zero-initializes memory block', required: true },
        { name: 'free(ptr)', role: 'Deallocates memory block and returns it to OS allocator', required: true },
        { name: 'ptr = NULL;', role: 'Prevents dangling pointer references', required: true }
      ],
      rules: [
        'Always check if the returned pointer is NULL before using it',
        'Never use memory after it has been freed (Dangling pointer / Use-after-free)',
        'Never call free() on memory that was not returned by malloc/calloc/realloc or already freed'
      ]
    },
    code_example_1_title: 'Basic Foundational: Dynamic Integer Array with malloc',
    code_example_1_code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));

    if (arr == NULL) {
        fprintf(stderr, "Memory allocation failed!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        printf("arr[%d] = %d\\n", i, arr[i]);
    }

    free(arr);
    arr = NULL; // Safe hygiene
    printf("Memory cleanly deallocated.\\n");

    return 0;
}`,
    code_example_1_explanation: 'Allocates 5 * 4 = 20 bytes on heap. Verifies allocation non-NULL. Populates array elements, prints values, frees memory with free(arr), and nullifies pointer.',
    code_example_1_output: `arr[0] = 10
arr[1] = 20
arr[2] = 30
arr[3] = 40
arr[4] = 50
Memory cleanly deallocated.`,

    code_example_2_title: 'Intermediate Logic: Zero-Initialized Buffer with calloc & realloc',
    code_example_2_code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int count = 3;
    int *scores = (int *)calloc(count, sizeof(int));
    if (!scores) return 1;

    scores[0] = 85;
    scores[1] = 92;
    scores[2] = 78;

    // Dynamically expand capacity to 5 items
    int newCount = 5;
    int *temp = (int *)realloc(scores, newCount * sizeof(int));
    if (!temp) {
        free(scores);
        return 1;
    }
    scores = temp;
    scores[3] = 95;
    scores[4] = 88;

    printf("Expanded scores array:\\n");
    for (int i = 0; i < newCount; i++) {
        printf("Score %d: %d\\n", i + 1, scores[i]);
    }

    free(scores);
    scores = NULL;
    return 0;
}`,
    code_example_2_explanation: 'Demonstrates calloc zero-initialization, followed by safe realloc expansion using a temporary pointer to avoid leaking original memory if realloc returns NULL.',
    code_example_2_output: `Expanded scores array:
Score 1: 85
Score 2: 92
Score 3: 78
Score 4: 95
Score 5: 88`,

    code_example_3_title: 'Practical Application: Dynamic String Buffer Collector',
    code_example_3_code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *buffer;
    size_t length;
    size_t capacity;
} StringBuffer;

StringBuffer createBuffer(size_t initialCapacity) {
    StringBuffer sb;
    sb.buffer = (char *)malloc(initialCapacity);
    sb.length = 0;
    sb.capacity = initialCapacity;
    if (sb.buffer) sb.buffer[0] = '\\0';
    return sb;
}

void appendBuffer(StringBuffer *sb, const char *str) {
    size_t strLen = strlen(str);
    if (sb->length + strLen + 1 > sb->capacity) {
        sb->capacity = (sb->capacity + strLen) * 2;
        sb->buffer = (char *)realloc(sb->buffer, sb->capacity);
    }
    strcat(sb->buffer, str);
    sb->length += strLen;
}

int main(void) {
    StringBuffer sb = createBuffer(16);
    appendBuffer(&sb, "Code ");
    appendBuffer(&sb, "Nexus ");
    appendBuffer(&sb, "Systems Platform");

    printf("Accumulated String: %s\\n", sb.buffer);
    printf("Bytes Allocated   : %zu\\n", sb.capacity);

    free(sb.buffer);
    sb.buffer = NULL;
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates real-world engineering pattern: dynamic self-resizing string buffer (similar to Java StringBuilder or C++ std::string) using malloc, realloc, and free.',
    code_example_3_output: `Accumulated String: Code Nexus Systems Platform
Bytes Allocated   : 64`,

    code_walkthrough: {
      code: `int *p = malloc(sizeof(int));\n*p = 42;\nfree(p);\np = NULL;`,
      steps: [
        { line: 1, explanation: 'OS kernel allocates 4 bytes on Heap; p points to heap block address.', state: 'Heap Block: [4 bytes]' },
        { line: 2, explanation: 'Store 42 into the allocated heap address.', state: 'Heap Block Value: 42' },
        { line: 3, explanation: 'free(p) deallocates heap block back to free list; address becomes invalid.', state: 'Heap Block Released' },
        { line: 4, explanation: 'Assign NULL to p to eliminate dangling pointer.', state: 'p = NULL (Safe)' }
      ],
      output: 'Heap block allocated and safely released',
      output_reasoning: 'malloc reserves heap space, *p writes to it, free releases it, p=NULL guarantees no dangling pointer access.'
    },

    rules_and_restrictions: [
      'Every malloc/calloc/realloc must have a corresponding free() to prevent memory leaks',
      'Never dereference memory after calling free() (Use-After-Free vulnerability)',
      'Assigning pointer = NULL after free() ensures any subsequent accidental dereference crashes immediately rather than corrupting memory'
    ],
    common_mistakes: [
      {
        title: 'Memory Leak from Losing the Pointer',
        incorrect_code: `int *ptr = malloc(100);\nptr = malloc(200); // Original 100 bytes lost forever!`,
        explanation: 'Overwriting ptr with a new allocation loses the address of the first 100 bytes. Those 100 bytes can never be freed, permanently wasting RAM.',
        corrected_code: `int *ptr = malloc(100);\nfree(ptr); // Free first\nptr = malloc(200);`,
        error_message: 'Valgrind: 100 bytes in 1 blocks are definitely lost in loss record',
        debug_tip: 'Always free an existing allocation before reassigning its pointer variable.'
      },
      {
        title: 'Dangling Pointer & Use-After-Free',
        incorrect_code: `int *p = malloc(sizeof(int));\nfree(p);\n*p = 10; // CRASH or Silent Memory Corruption!`,
        explanation: 'After free(p), the memory no longer belongs to your program. Accessing it is undefined behavior and a critical security flaw (CWE-416).',
        corrected_code: `int *p = malloc(sizeof(int));\nfree(p);\np = NULL; // Safe guard`,
        error_message: 'Valgrind: Invalid write of size 4 after free',
        debug_tip: 'Always set pointers to NULL immediately after freeing them.'
      }
    ],
    comparison_table: {
      title: 'malloc() vs calloc() vs realloc()',
      concept_a: 'malloc()',
      concept_b: 'calloc()',
      headers: ['Function', 'Initialization', 'Arguments', 'Performance'],
      rows: [
        ['malloc', 'Uninitialized (Contains random garbage)', 'malloc(total_bytes)', 'Fastest (no zeroing step)'],
        ['calloc', 'Zero-initialized (All bytes 0)', 'calloc(count, size)', 'Slightly slower (clears all bits)'],
        ['realloc', 'Preserves existing data, new space uninitialized', 'realloc(ptr, new_size)', 'Resizes in-place or reallocates & copies']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Building database query buffers and caching engines',
      'Audio and video stream decoders handling arbitrary file sizes',
      'Resizable collections like dynamic arrays and hash tables'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the primary difference between malloc() and calloc()?',
        options: [
          'malloc allocates on stack while calloc allocates on heap',
          'calloc zero-initializes allocated memory while malloc leaves it uninitialized',
          'malloc can resize memory while calloc cannot',
          'malloc returns int* while calloc returns void*'
        ],
        correct_index: 1,
        explanation: 'calloc(n, size) initializes every byte to 0, whereas malloc(size) allocates raw bytes containing indeterminate garbage values.'
      },
      {
        id: 2,
        type: 'mcq',
        question: 'What happens if a program continuously calls malloc() inside a loop without calling free()?',
        options: [
          'The compiler automatically frees the memory at runtime',
          'A memory leak occurs, eventually causing out-of-memory errors',
          'The stack overflows',
          'The program executes faster'
        ],
        correct_index: 1,
        explanation: 'Unfreed heap memory remains allocated until the process terminates. Continuing to allocate without releasing causes memory exhaustion (Memory Leak).'
      }
    ],
    key_takeaways: [
      'Heap memory persists until explicitly released with free().',
      'Always check if allocation functions return NULL.',
      'Set pointers to NULL after calling free() to eliminate dangling pointers.'
    ],
    quick_revision_notes: 'Heap Allocation: malloc(bytes) -> uninitialized; calloc(n, size) -> zeroed; realloc(ptr, size) -> resize; free(ptr) -> release; ptr = NULL.',
    assignment_prompt: 'Write a program that dynamically allocates an array of 4 floats using malloc(), sets them to 1.5, 2.5, 3.5, 4.5, prints their sum, and frees the memory.',
    assignment_starter_code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    // Dynamically allocate 4 floats and compute sum
    return 0;
}`,
    assignment_solution: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 4;
    float *arr = (float *)malloc(n * sizeof(float));
    if (!arr) return 1;

    arr[0] = 1.5f;
    arr[1] = 2.5f;
    arr[2] = 3.5f;
    arr[3] = 4.5f;

    float sum = 0.0f;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }

    printf("Calculated Sum: %.2f\\n", sum);
    free(arr);
    arr = NULL;
    return 0;
}`
  }
];

module.exports = { cTopics };
