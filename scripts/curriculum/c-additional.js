const {
  createPointerMemorySvg,
  createMemoryLayoutSvg,
  createControlFlowSvg,
} = require('./diagrams.js');

const cAdditionalTopics = [
  {
    id: 'c-compilation-process',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'The Compilation Process (Preprocessor, Compiler, Assembler, Linker)',
    description: 'Deconstruct the 4 stages of C compilation: preprocessing (.i), compilation (.s), assembly (.o), and linking (.out/exe).',
    order_index: 3,
    learning_objectives: [
      'Understand the 4 distinct stages of transforming C source code into machine binary',
      'Learn what gcc -E, -S, -c, and -o flags actually execute',
      'Diagnose preprocessor errors vs compiler syntax errors vs linker unresolved symbol errors'
    ],
    prerequisites: ['Structure of a C Program'],
    expected_outcomes: ['Able to trace compiler stages and troubleshoot linker vs compilation errors with confidence'],
    formal_definition: 'The C translation model comprises four sequential translation phases: preprocessing (macro expansion and header inclusion), compilation (translation from C AST to target assembly language), assembly (conversion of assembly to relocatable object code), and linking (resolving cross-file symbol references with libraries to produce an executable).',
    content_simple_english: `When you click "Run" or type gcc main.c -o program, your computer does not magically execute C text directly. Instead, your code passes through four distinct factory stages:

1. Preprocessing (gcc -E): Lines starting with # are handled. Macros (#define) are substituted directly into source text, and header files (#include) are literally pasted into your file. The output is a preprocessed .i file.
2. Compilation (gcc -S): The C compiler checks syntax and converts the preprocessed C code into assembly instructions specific to your CPU (x86_64 or ARM). The output is a .s assembly file.
3. Assembly (gcc -c): The assembler translates assembly mnemonics into machine code (0s and 1s) packaged into an object file (.o).
4. Linking (gcc): The linker merges all your .o object files together with system libraries (like libc.a for printf) and resolves memory addresses to produce the final executable binary!`,
    hinglish_explanation: `Jab aap gcc code.c chalate hain, toh background me 4 steps hote hain:
1. Preprocessor (#include aur #define): Ye header files ke code ko copy-paste karta hai aur macros ko replace karta hai (.i file banti hai).
2. Compiler (Syntax Check): Ye check karta hai ki syntax sahi hai ya nahi aur C code ko Assembly language me badalta hai (.s file).
3. Assembler: Assembly language ko 0 aur 1 (machine code) me convert karta hai (.o object file).
4. Linker: Ye sabse important hai! Aapke object code ko printf aur system libraries ke sath link karke final executable (.out ya .exe) banata hai.
Agar aapne function declare kiya lekin uski body nahi likhi, toh Linker error aayega (undefined reference to ...)!`,
    why_it_matters: 'Knowing these 4 phases is crucial for debugging real engineering problems—such as macro bugs, header guard omissions, unresolved external symbols, and performance optimization.',
    when_to_use: 'Use compiler flags (-E, -S, -c) when profiling build times, inspecting macro expansions, analyzing generated assembly, or building multi-file libraries.',
    syntax_guide: {
      template: 'gcc -E file.c -o file.i   # Step 1: Preprocess\ngcc -S file.i -o file.s   # Step 2: Compile to Assembly\ngcc -c file.s -o file.o   # Step 3: Assemble to Object Code\ngcc file.o -o program     # Step 4: Link into Executable',
      components: [
        { name: '-E', role: 'Stop after preprocessing stage', required: false },
        { name: '-S', role: 'Stop after compilation into assembly', required: false },
        { name: '-c', role: 'Compile and assemble into object file, skip linking', required: false },
        { name: '-o', role: 'Specify output executable filename', required: true }
      ],
      rules: ['Linker fails if symbols are declared but never defined', 'Macros are simple text replacements done in step 1']
    },
    code_example_1_title: 'Basic Foundational: Macro Replacement in Preprocessing',
    code_example_1_code: `#include <stdio.h>

#define MULTIPLIER 5

int main(void) {
    int value = 10;
    int result = value * MULTIPLIER;
    printf("Result after macro expansion: %d\\n", result);
    return 0;
}`,
    code_example_1_explanation: 'Before the compiler parses syntax, the preprocessor literally substitutes MULTIPLIER with 5 throughout the source text.',
    code_example_1_output: 'Result after macro expansion: 50',

    code_example_2_title: 'Intermediate Logic: Conditional Compilation with #ifdef',
    code_example_2_code: `#include <stdio.h>

#define DEBUG_MODE 1

int main(void) {
    int sensorReading = 42;

#if DEBUG_MODE
    printf("[DEBUG TELEMETRY] Raw sensor register: %d\\n", sensorReading);
#endif

    printf("Production output: Sensor active.\\n");
    return 0;
}`,
    code_example_2_explanation: 'Conditional compilation directives (#if, #endif) exclude debug code completely from the final binary in production builds.',
    code_example_2_output: `[DEBUG TELEMETRY] Raw sensor register: 42
Production output: Sensor active.`,

    code_example_3_title: 'Practical Application: Multi-File Modular Compilation Interface',
    code_example_3_code: `#include <stdio.h>

// Forward function prototype (Linking stage resolves definition)
int computeChecksum(const char *data);

int computeChecksum(const char *data) {
    int sum = 0;
    while (*data) {
        sum += (int)(*data);
        data++;
    }
    return sum % 256;
}

int main(void) {
    const char *payload = "NEXUS_PACKET";
    int check = computeChecksum(payload);
    printf("Data payload    : %s\\n", payload);
    printf("Computed Checksum: 0x%02X\\n", check);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates modular function prototype declaration and hexadecimal formatted output (%02X). The linker matches callers with definitions.',
    code_example_3_output: `Data payload    : NEXUS_PACKET
Computed Checksum: 0xAA`,

    code_walkthrough: {
      code: `int main(void) {\n    int x = 20;\n    return x;\n}`,
      steps: [
        { line: 1, explanation: 'Source text read by GCC preprocessor; no macros to expand.', state: 'Stage 1: Preprocessing' },
        { line: 2, explanation: 'Compiler builds Abstract Syntax Tree, generates assembly (movl $20, -4(%rbp)).', state: 'Stage 2: Compilation' },
        { line: 3, explanation: 'Assembler outputs binary opcode bytes into ELF object file.', state: 'Stage 3: Assembly' },
        { line: 4, explanation: 'Linker binds crt1.o startup entry with main to create executable.', state: 'Stage 4: Linking' }
      ],
      output: 'Exit code: 20',
      output_reasoning: 'The program returns 20 to the operating system shell as its exit status.'
    },

    rules_and_restrictions: [
      'Missing function definition produces a Linker error (ld returned 1 exit status)',
      'Syntax typos produce a Compiler error (gcc syntax error)',
      'Missing header files produce a Preprocessor error (fatal error: ... file not found)'
    ],
    common_mistakes: [
      {
        title: 'Confusing Compiler Errors with Linker Errors',
        incorrect_code: `int calculate(int a);\nint main(void) {\n    return calculate(5); // Declared but not defined!\n}`,
        explanation: 'The code compiles without syntax errors because the prototype exists, but the Linker crashes because the implementation of calculate is missing.',
        corrected_code: `int calculate(int a) { return a * 2; }\nint main(void) {\n    return calculate(5);\n}`,
        error_message: 'undefined reference to "calculate"',
        debug_tip: 'If error mentions "undefined reference", check your function definition or missing object files in linker invocation.'
      }
    ],
    comparison_table: {
      title: 'Compiler Error vs Linker Error',
      concept_a: 'Compiler Error',
      concept_b: 'Linker Error',
      headers: ['Aspect', 'Compiler Error', 'Linker Error'],
      rows: [
        ['Stage', 'Occurs during syntax and type analysis', 'Occurs after all files are compiled into object code'],
        ['Typical Cause', 'Missing semicolon, mismatched types, undeclared identifier', 'Undefined function implementation, duplicate symbols, missing library'],
        ['Error Tool', 'cc1 / gcc parser', 'ld / GNU Gold Linker']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Configuring automated Makefile and CMake build systems in C/C++',
      'Creating shared (.so / .dll) dynamic libraries and static archives (.a)'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which toolchain stage replaces #include and #define directives with plain C text?',
        options: ['The Assembler', 'The Preprocessor', 'The Linker', 'The CPU Loader'],
        correct_index: 1,
        explanation: 'The Preprocessor runs before compilation and handles all directives starting with the # character.'
      }
    ],
    key_takeaways: [
      'C compilation has 4 distinct steps: Preprocessor, Compiler, Assembler, Linker.',
      'Object files (.o) contain raw machine code that must be linked before execution.',
      'Undefined reference errors occur at the linking phase.'
    ],
    quick_revision_notes: 'Pipeline: Source (.c) -> Preprocessor (.i) -> Compiler (.s) -> Assembler (.o) -> Linker (.out/exe).',
    assignment_prompt: 'Write a C program with a macro #define SQUARE(x) ((x) * (x)) and compute the square of 9 in main.',
    assignment_starter_code: `#include <stdio.h>
// Define SQUARE macro and test in main
int main(void) {
    return 0;
}`,
    assignment_solution: `#include <stdio.h>
#define SQUARE(x) ((x) * (x))

int main(void) {
    int num = 9;
    int sq = SQUARE(num);
    printf("Number: %d\\nSquare: %d\\n", num, sq);
    return 0;
}`
  },

  {
    id: 'c-datatypes-modifiers',
    course_id: 'c-lang',
    unit_id: 'c-unit-1',
    title: 'Data Types, Sizes & Type Modifiers',
    description: 'Master primitive C data types: char, int, float, double, sizeof operator, signed/unsigned modifiers, and integer overflow traps.',
    order_index: 6,
    learning_objectives: [
      'Master the primitive data types of C and their byte sizes',
      'Understand signed vs unsigned representation and 2s complement',
      'Prevent integer overflow and truncation errors'
    ],
    prerequisites: ['Structure of a C Program'],
    expected_outcomes: ['Able to select memory-optimal types and avoid subtle integer overflow bugs in production systems'],
    formal_definition: 'A data type in C defines the binary memory representation, bit width, value range, and legal operations for a storage location. Type modifiers alter the size or sign interpretation of basic primitive types.',
    content_simple_english: `In C, data types specify exactly how many bytes the CPU allocates in RAM and how the binary bits are interpreted:
- char (1 byte): Stores ASCII characters (-128 to 127, or 0 to 255 unsigned).
- int (typically 4 bytes on modern 64-bit platforms): Stores integers from -2,147,483,648 to 2,147,483,647.
- float (4 bytes): Single-precision floating point (~6-7 decimal digits of precision).
- double (8 bytes): Double-precision floating point (~15-17 decimal digits of precision).

Modifiers:
- signed: Allows positive and negative values (default for int).
- unsigned: Allows only non-negative values, doubling the positive range (unsigned int: 0 to 4,294,967,295).
- short (2 bytes) and long (8 bytes on 64-bit Linux).

The sizeof Operator: Always use sizeof(type) rather than assuming a size, because C sizes can vary across architectures!`,
    hinglish_explanation: `C me har variable ko memory me kitni jagah (bytes) milegi, ye uska Data Type decide karta hai:
1. char: 1 byte leta hai (characters store karne ke liye).
2. int: 4 bytes leta hai (-2 arab se +2 arab tak numbers ke liye).
3. float & double: Decimals (points wale numbers) ke liye. double 8 bytes leta hai aur zyada accurate hota hai.

Modifiers:
- signed: Positive aur Negative dono numbers ke liye.
- unsigned: Sirf Positive numbers ke liye. Isse positive range double ho jaati hai!
- sizeof: Ye ek operator hai jo batata hai ki variable kitne bytes kha raha hai. Jaise sizeof(int) aapko 4 dega.`,
    why_it_matters: 'Incorrect type choices cause security vulnerabilities (like the Ariane 5 rocket disaster caused by 64-bit float to 16-bit integer conversion overflow).',
    when_to_use: 'Use unsigned types for memory buffers, counts, and sizes (size_t). Use double for financial and scientific calculations where single-precision float introduces rounding errors.',
    syntax_guide: {
      template: 'int x = 42;\nunsigned int count = 1000U;\nshort s = 32000;\nlong large = 9000000000L;\ndouble precise = 3.141592653589793;',
      components: [
        { name: 'unsigned', role: 'Modifier eliminating negative numbers and doubling positive capacity', required: false },
        { name: 'sizeof(type)', role: 'Compile-time operator returning size in bytes (size_t)', required: true }
      ],
      rules: ['Unsigned overflow wraps around predictably via modulo 2^N', 'Signed integer overflow is undefined behavior in ISO C']
    },
    code_example_1_title: 'Basic Foundational: Inspecting Memory Footprints with sizeof',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    printf("Byte sizes on this system:\\n");
    printf("sizeof(char)   : %zu byte\\n", sizeof(char));
    printf("sizeof(short)  : %zu bytes\\n", sizeof(short));
    printf("sizeof(int)    : %zu bytes\\n", sizeof(int));
    printf("sizeof(long)   : %zu bytes\\n", sizeof(long));
    printf("sizeof(float)  : %zu bytes\\n", sizeof(float));
    printf("sizeof(double) : %zu bytes\\n", sizeof(double));
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates sizeof operator and the %zu format specifier designed specifically for size_t return types.',
    code_example_1_output: `Byte sizes on this system:
sizeof(char)   : 1 byte
sizeof(short)  : 2 bytes
sizeof(int)    : 4 bytes
sizeof(long)   : 8 bytes
sizeof(float)  : 4 bytes
sizeof(double) : 8 bytes`,

    code_example_2_title: 'Intermediate Logic: Signed vs Unsigned Wrap-around Behavior',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    unsigned char u = 255;
    printf("Initial unsigned char: %u\\n", u);
    u = u + 1; // Wraps around to 0
    printf("After adding 1       : %u (Modular wrap)\\n", u);

    signed char s = 127;
    printf("Initial signed char  : %d\\n", s);
    s = s + 1; // 2s complement overflow
    printf("After adding 1       : %d\\n", s);

    return 0;
}`,
    code_example_2_explanation: 'Shows unsigned modulo wrap-around (255 + 1 = 0) vs signed overflow bit flip (127 + 1 = -128 in 8-bit two complement).',
    code_example_2_output: `Initial unsigned char: 255
After adding 1       : 0 (Modular wrap)
Initial signed char  : 127
After adding 1       : -128`,

    code_example_3_title: 'Practical Application: High-Precision Telemetry Metrics',
    code_example_3_code: `#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint32_t packetSequence = 4000000000U;
    uint64_t totalBytesReceived = 18446744073709551615ULL; // Max 64-bit int
    double cpuUtilization = 99.875;

    printf("--- TELEMETRY METRIC SNAPSHOT ---\\n");
    printf("Sequence ID      : %u\\n", packetSequence);
    printf("Max 64-bit Cap   : %llu\\n", (unsigned long long)totalBytesReceived);
    printf("Core Utilization : %.3f%%\\n", cpuUtilization);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates fixed-width integer types from <stdint.h> (uint32_t, uint64_t) ensuring bit-exact sizes across CPU architectures.',
    code_example_3_output: `--- TELEMETRY METRIC SNAPSHOT ---
Sequence ID      : 4000000000
Max 64-bit Cap   : 18446744073709551615
Core Utilization : 99.875%`,

    code_walkthrough: {
      code: `unsigned short x = 65535;\nx++;\nprintf("%u\\n", x);`,
      steps: [
        { line: 1, explanation: '16-bit unsigned integer holding max value 0xFFFF (65535).', state: 'x = 65535' },
        { line: 2, explanation: 'Adding 1 overflows 16 bits; wraps to 0x0000 (0).', state: 'x = 0' },
        { line: 3, explanation: 'Print value formatted with %u.', state: 'Stdout: 0' }
      ],
      output: '0',
      output_reasoning: 'Unsigned arithmetic in C wraps modulo 2^16 = 65536, yielding 0.'
    },

    rules_and_restrictions: [
      'Never use %d to print size_t; always use %zu to avoid 64-bit truncation warnings',
      'Signed integer overflow invokes Undefined Behavior in C compilers',
      'Double provides 53 bits of mantissa precision; float provides only 24 bits'
    ],
    common_mistakes: [
      {
        title: 'Integer Division Truncation',
        incorrect_code: `int a = 5, b = 2;\ndouble res = a / b; // Evaluates to 2.0, NOT 2.5!`,
        explanation: 'In C, dividing two integers performs integer division, discarding the fractional part before the assignment to double occurs.',
        corrected_code: `int a = 5, b = 2;\ndouble res = (double)a / b; // Explicit cast yields 2.5`,
        error_message: 'Logical calculation defect (silent loss of precision)',
        debug_tip: 'Cast at least one operand to double or float: (double)a / b.'
      }
    ],
    comparison_table: {
      title: 'float vs double in C',
      concept_a: 'float',
      concept_b: 'double',
      headers: ['Property', 'float', 'double'],
      rows: [
        ['Size in Memory', '4 bytes (32 bits)', '8 bytes (64 bits)'],
        ['Precision', '~7 decimal digits', '~15-17 decimal digits'],
        ['Format Specifier', '%f', '%lf in scanf, %f in printf'],
        ['Standard Default', '3.14f (requires f suffix)', '3.14 (literals are double by default)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Financial transaction accounting using fixed-point integer cents to eliminate float rounding errors',
      'Network protocol packet serialization using fixed-width uint16_t and uint32_t'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the correct format specifier for the sizeof operator return value in ISO C?',
        options: ['%d', '%u', '%zu', '%lf'],
        correct_index: 2,
        explanation: 'sizeof returns size_t, and the ISO C99 standard defines %zu specifically to format size_t portably.'
      }
    ],
    key_takeaways: [
      'char is 1 byte, int is typically 4 bytes, double is 8 bytes.',
      'Unsigned numbers wrap around cleanly on overflow; signed overflow is undefined.',
      'Integer division truncates decimals unless an operand is explicitly cast to a float type.'
    ],
    quick_revision_notes: 'char: 1B, short: 2B, int: 4B, long: 8B, float: 4B, double: 8B. sizeof() returns bytes. Use %zu.',
    assignment_prompt: 'Write a C program that divides 7 by 2 using both integer division and floating-point division and prints both results.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Show integer division vs float division
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    int a = 7, b = 2;
    int intDiv = a / b;
    double floatDiv = (double)a / b;

    printf("Integer Division: %d / %d = %d\\n", a, b, intDiv);
    printf("Float Division  : %d / %d = %.1f\\n", a, b, floatDiv);
    return 0;
}`
  },

  {
    id: 'c-if-else-statements',
    course_id: 'c-lang',
    unit_id: 'c-unit-2',
    title: 'Conditional Branching: if, else if, else & switch-case',
    description: 'Control flow execution paths, truthiness in C, nested decisions, switch jump tables, and fallthrough mechanics.',
    order_index: 11,
    learning_objectives: [
      'Master conditional branching with if, else if, and else',
      'Understand boolean logic in C (0 is False, non-zero is True)',
      'Master the switch-case construct, break statements, and jump tables'
    ],
    prerequisites: ['Arithmetic and Relational Operators'],
    expected_outcomes: ['Able to write clean, branching logic without unintended fallthrough or dangling else bugs'],
    formal_definition: 'Conditional control flow statements alter the sequential program counter execution based on the truth value of a scalar predicate expression.',
    content_simple_english: `Computers make decisions using conditional statements. In C, there is no built-in primitive boolean keyword in traditional C89:
- Any expression that evaluates to 0 is considered FALSE.
- Any expression that evaluates to NON-ZERO (e.g. 1, -5, 99) is considered TRUE!

1. if-else Statements: Evaluates conditions sequentially. As soon as a branch is true, its block executes and the rest of the chain is skipped.
2. switch-case: Best when testing a single integer or character against multiple constant values. Modern compilers optimize switch statements into high-performance O(1) jump tables! Remember to put break after each case, or execution will "fall through" into the next case!`,
    hinglish_explanation: `Decision making C me bilkul real life jaisi hoti hai: "Agar barish hui toh umbrella lo, nahi toh mat lo".

C me Boolean logic bohot simple hai:
- 0 ka matlab hota hai FALSE (Galat).
- 0 ke alawa koi bhi number (1, 10, -5) ka matlab hota hai TRUE (Sahi)!

1. if-else: Conditions check karne ke liye.
2. switch-case: Jab ek hi variable ko alag-alag fixed numbers (jaise Menu options: 1 for Start, 2 for Exit) se match karna ho. Har case ke aakhiri me break; lagana zaroori hai, warna code agle case me bhi ghus jayega (isko fallthrough kehte hain)!`,
    why_it_matters: 'Every business rule, validation gate, authentication barrier, and algorithm uses conditional branching.',
    when_to_use: 'Use if-else for range checks (x > 10 && x < 50) and complex relational expressions. Use switch for discrete integer/enum dispatch tables.',
    syntax_guide: {
      template: 'if (condition) {\n    // code\n} else if (other_condition) {\n    // code\n} else {\n    // default code\n}\n\nswitch (val) {\n    case 1: break;\n    default: break;\n}',
      components: [
        { name: 'if (expr)', role: 'Executes block if expr != 0', required: true },
        { name: 'switch (expr)', role: 'Evaluates integer expression and jumps to matching case', required: false },
        { name: 'break;', role: 'Exits the switch statement block immediately', required: true }
      ],
      rules: ['switch expressions must evaluate to integer or char constants (no floats or strings allowed)', '0 is false, everything else is true']
    },
    code_example_1_title: 'Basic Foundational: Simple if-else Logic',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    int score = 88;

    if (score >= 85) {
        printf("Result: PASS (Eligible for Certification!)\\n");
    } else {
        printf("Result: Needs Review (Below 85%% pass threshold)\\n");
    }

    return 0;
}`,
    code_example_1_explanation: 'Tests score >= 85. Since 88 >= 85 evaluates to 1 (true), the if branch executes.',
    code_example_1_output: 'Result: PASS (Eligible for Certification!)',

    code_example_2_title: 'Intermediate Logic: Multi-Tiered Ladder & Boolean Truthiness',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    int accessLevel = 2; // 0=Guest, 1=Student, 2=Admin

    if (accessLevel == 2) {
        printf("Access Granted: Administrator Full Control\\n");
    } else if (accessLevel == 1) {
        printf("Access Granted: Student Dashboard\\n");
    } else {
        printf("Access Denied: Unregistered Guest\\n");
    }

    return 0;
}`,
    code_example_2_explanation: 'Demonstrates multi-branch else-if ladder evaluating matching access privilege levels.',
    code_example_2_output: 'Access Granted: Administrator Full Control',

    code_example_3_title: 'Practical Application: Command Dispatcher via switch-case Jump Table',
    code_example_3_code: `#include <stdio.h>

int main(void) {
    char commandCode = 'R'; // S=Start, P=Pause, R=Resume, X=Stop

    printf("Executing Server Controller:\\n");
    switch (commandCode) {
        case 'S':
            printf("Action: Service Initiated\\n");
            break;
        case 'P':
            printf("Action: Service Paused\\n");
            break;
        case 'R':
            printf("Action: Service Resumed to Active State\\n");
            break;
        case 'X':
            printf("Action: Service Gracefully Terminated\\n");
            break;
        default:
            printf("Error: Unrecognized command code '%c'\\n", commandCode);
            break;
    }

    return 0;
}`,
    code_example_3_explanation: 'Demonstrates industrial switch-case state dispatch. Fast constant-time branch evaluation without multi-if overhead.',
    code_example_3_output: `Executing Server Controller:
Action: Service Resumed to Active State`,

    code_walkthrough: {
      code: `int x = 10;\nif (x > 5) printf("Big\\n");\nelse printf("Small\\n");`,
      steps: [
        { line: 1, explanation: 'Initialize x to 10 on the stack.', state: 'x = 10' },
        { line: 2, explanation: 'Compare 10 > 5; condition is true (1). Jump to if block.', state: 'Condition TRUE' },
        { line: 3, explanation: 'Print "Big\\n"; skip the else block entirely.', state: 'Stdout: Big' }
      ],
      output: 'Big',
      output_reasoning: '10 is greater than 5, so only the true branch is evaluated.'
    },

    rules_and_restrictions: [
      'switch cases must be constant expressions known at compile time',
      'Floating point numbers cannot be used in switch statements',
      'Watch out for the dangling else: else attaches to the nearest preceding if without an else'
    ],
    common_mistakes: [
      {
        title: 'Accidental Assignment = inside if condition',
        incorrect_code: `int x = 0;\nif (x = 5) { // BUG: Assigns 5, then evaluates 5 (TRUE)! }\n`,
        explanation: 'Using single = performs an assignment instead of equality check (==). Since 5 is non-zero, the condition is always true!',
        corrected_code: `int x = 0;\nif (x == 5) {\n    printf("Equals 5");\n}`,
        error_message: 'warning: suggest parentheses around assignment used as truth value',
        debug_tip: 'Use Yoda conditions (5 == x) or enable compiler warnings (-Wall) to catch accidental assignments.'
      },
      {
        title: 'Unintended Fallthrough in switch-case',
        incorrect_code: `switch (op) {\n    case 1: printf("One\\n"); // Missing break!\n    case 2: printf("Two\\n");\n}`,
        explanation: 'Without break, after case 1 finishes, execution drops straight into case 2 regardless of value.',
        corrected_code: `switch (op) {\n    case 1: printf("One\\n"); break;\n    case 2: printf("Two\\n"); break;\n}`,
        error_message: 'warning: this statement may fall through',
        debug_tip: 'Always include break; at the end of each case block unless deliberate fallthrough is intended.'
      }
    ],
    comparison_table: {
      title: 'if-else Ladder vs switch-case',
      concept_a: 'if-else Ladder',
      concept_b: 'switch-case Statement',
      headers: ['Feature', 'if-else Ladder', 'switch-case'],
      rows: [
        ['Conditions Supported', 'Any relational, logical, range, float expressions', 'Only discrete integer and character constants'],
        ['Internal Optimization', 'Sequential evaluation (O(N) time)', 'Compiled to O(1) direct Jump Table'],
        ['Best Use Case', 'Range checking (x > 10 && x < 20)', 'Enum dispatch, menu choices, state machines']
      ]
    },
    diagram_svg: createControlFlowSvg('Start', 'score >= 85 ?', 'Award Cert', 'Retake Exam', 'Exit'),
    practical_applications: [
      'Network router packet dispatching based on IP protocol header byte',
      'Role-based authorization checks in backend systems'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'In C, which integer value is treated as Boolean FALSE?',
        options: ['-1', '0', '1', 'NULL character only'],
        correct_index: 1,
        explanation: 'In C, exactly 0 evaluates to false. Any non-zero numeric value (positive or negative) evaluates to true.'
      }
    ],
    key_takeaways: [
      '0 is false; any non-zero value is true in C.',
      'Always use == for equality comparison, never accidental =.',
      'Always terminate switch cases with break unless intentional fallthrough is needed.'
    ],
    quick_revision_notes: 'if(cond){...} else{...}; switch(int_val){ case 1: break; default: break; }. Avoid x = 5 assignment trap in if.',
    assignment_prompt: 'Write a C program that takes an integer temperature = 35. If temp > 30 print "Hot", else if temp < 15 print "Cold", else print "Moderate".',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    int temp = 35;
    // Write if-else ladder here
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    int temp = 35;
    if (temp > 30) {
        printf("Hot\\n");
    } else if (temp < 15) {
        printf("Cold\\n");
    } else {
        printf("Moderate\\n");
    }
    return 0;
}`
  },

  {
    id: 'c-loops-for-while-do',
    course_id: 'c-lang',
    unit_id: 'c-unit-2',
    title: 'Loops and Iteration: for, while & do-while',
    description: 'Iterative control structures, entry-controlled vs exit-controlled loops, break, continue, and avoiding infinite loops.',
    order_index: 12,
    learning_objectives: [
      'Master the 3 loop constructs in C: for, while, and do-while',
      'Understand entry-controlled vs exit-controlled iteration',
      'Properly control loop flow using break and continue'
    ],
    prerequisites: ['Conditional Branching: if, else if, else & switch-case'],
    expected_outcomes: ['Able to write optimal loops, iterate over arrays, and avoid off-by-one and infinite loop bugs'],
    formal_definition: 'Loops are control flow statements that execute a block of instructions repeatedly while a given boolean termination condition remains true.',
    content_simple_english: `When you need to execute code repeatedly (e.g. processing 10,000 database records), loops automate the iteration:
1. for loop: Best when the number of iterations is known in advance. Consists of 3 parts in the header: for (init; condition; update).
2. while loop: Entry-controlled loop. Tests condition BEFORE entering the loop. If the condition is false initially, it executes 0 times.
3. do-while loop: Exit-controlled loop. Tests condition AFTER executing the loop body. Guaranteed to execute at least ONCE!

Flow Modifiers:
- break: Terminates the loop immediately and jumps out.
- continue: Skips the remainder of the current iteration and jumps directly to the next iteration loop step.`,
    hinglish_explanation: `Loops ka matlab hota hai kisi kaam ko baar-baar repeat karna:
1. for loop: Jab aapko pehle se pata ho ki loop kitni baar chalana hai (jaise 1 se 100 tak print karna).
2. while loop: Jab tak condition TRUE hai, tab tak loop chalta rahega. Pehle condition check hoti hai, fir code chalta hai.
3. do-while loop: Isme code kam se kam 1 baar zaroor chalta hai, chahe condition shuru me hi galat kyu na ho! (Kyunki condition aakhiri me check hoti hai).

Keywords:
- break: Loop ko turant band karke bahar nikal deta hai.
- continue: Current step ko chhod kar turant agle step pe chala jata hai.`,
    why_it_matters: 'Almost every algorithm (sorting, searching, processing buffers, streaming networks) relies on iterative loops.',
    when_to_use: 'Use for loops for counting and iterating over arrays. Use while loops for event polling and streams. Use do-while for interactive CLI prompts that must run at least once.',
    syntax_guide: {
      template: 'for (int i = 0; i < n; i++) { ... }\nwhile (condition) { ... }\ndo { ... } while (condition);',
      components: [
        { name: 'init', role: 'Executes once before loop begins (int i = 0)', required: false },
        { name: 'condition', role: 'Evaluated before each iteration; exits when 0', required: true },
        { name: 'update', role: 'Executes after loop body before next check (i++)', required: false }
      ],
      rules: ['do-while must end with a semicolon after while(cond);', 'Beware of missing updates causing infinite loops']
    },
    code_example_1_title: 'Basic Foundational: Counting with for loop',
    code_example_1_code: `#include <stdio.h>

int main(void) {
    printf("Counting from 1 to 5:\\n");
    for (int i = 1; i <= 5; i++) {
        printf("Iteration: %d\\n", i);
    }
    return 0;
}`,
    code_example_1_explanation: 'Initializes i=1. Tests i <= 5. Executes printf, then increments i++. Terminates when i becomes 6.',
    code_example_1_output: `Counting from 1 to 5:
Iteration: 1
Iteration: 2
Iteration: 3
Iteration: 4
Iteration: 5`,

    code_example_2_title: 'Intermediate Logic: while loop with break and continue',
    code_example_2_code: `#include <stdio.h>

int main(void) {
    int counter = 0;

    printf("Even numbers up to 10 (skipping 6):\\n");
    while (counter < 10) {
        counter++;
        if (counter % 2 != 0) continue; // Skip odd numbers
        if (counter == 6) continue;     // Skip 6
        printf("Value: %d\\n", counter);
    }

    return 0;
}`,
    code_example_2_explanation: 'Uses continue to skip odd numbers and 6. Demonstrates loop flow interruption.',
    code_example_2_output: `Even numbers up to 10 (skipping 6):
Value: 2
Value: 4
Value: 8
Value: 10`,

    code_example_3_title: 'Practical Application: Binary Search Iteration Loop',
    code_example_3_code: `#include <stdio.h>

int binarySearch(const int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid; // Found!
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1; // Not found
}

int main(void) {
    int numbers[] = {11, 22, 33, 44, 55, 66, 77};
    int target = 44;
    int index = binarySearch(numbers, 7, target);
    printf("Target %d located at array index: %d\\n", target, index);
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates professional use of while loop in binary search, achieving O(log N) search complexity.',
    code_example_3_output: 'Target 44 located at array index: 3',

    code_walkthrough: {
      code: `int s = 0;\nfor (int i=1; i<=3; i++) s += i;\nprintf("%d\\n", s);`,
      steps: [
        { line: 1, explanation: 'Initialize s to 0 on stack.', state: 's = 0' },
        { line: 2, explanation: 'Iteration 1: i=1, s=0+1=1. Iteration 2: i=2, s=1+2=3. Iteration 3: i=3, s=3+3=6.', state: 's = 6' },
        { line: 3, explanation: 'Print total sum.', state: 'Stdout: 6' }
      ],
      output: '6',
      output_reasoning: 'Sum of 1 + 2 + 3 equals 6.'
    },

    rules_and_restrictions: [
      'In C99+, variables declared in for (int i=0; ...) header have loop scope only',
      'The loop condition must eventually become false, or an infinite loop will lock the CPU core'
    ],
    common_mistakes: [
      {
        title: 'Accidental Semicolon immediately after for header',
        incorrect_code: `for (int i = 0; i < 5; i++);\n{\n    printf("%d\\n", i); // Loop body ran 0 times!\n}`,
        explanation: 'Putting a semicolon after for creates an empty loop that spins 5 times doing nothing. The block below runs only ONCE after loop ends.',
        corrected_code: `for (int i = 0; i < 5; i++) {\n    printf("%d\\n", i);\n}`,
        error_message: 'Logical bug: loop statement terminated prematurely',
        debug_tip: 'Never place a semicolon right after for(...) or while(...) headers.'
      }
    ],
    comparison_table: {
      title: 'while vs do-while Loops',
      concept_a: 'while Loop',
      concept_b: 'do-while Loop',
      headers: ['Feature', 'while Loop', 'do-while Loop'],
      rows: [
        ['Condition Checked', 'At the beginning (Entry-controlled)', 'At the end (Exit-controlled)'],
        ['Minimum Iterations', '0 (May never execute if condition is false initially)', '1 (Guaranteed to execute at least once)'],
        ['Syntax Terminator', 'No semicolon after header', 'Must end with while(cond); semicolon']
      ]
    },
    diagram_svg: createControlFlowSvg('Init', 'i < N ?', 'Exec Body & Inc', 'Exit Loop', 'Done'),
    practical_applications: [
      'Game engine main loops (while running: update; render;)',
      'Polling sensors until data is available in IoT devices'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'How many times is a do-while loop guaranteed to execute its body?',
        options: ['0 times', 'At least once', 'Exactly twice', 'Infinite times'],
        correct_index: 1,
        explanation: 'Because do-while checks its condition at the end of the block, the body is guaranteed to execute at least once.'
      }
    ],
    key_takeaways: [
      'for loops are ideal for fixed count iterations.',
      'while checks condition first; do-while checks condition last.',
      'break exits loop; continue skips to next iteration.'
    ],
    quick_revision_notes: 'for(init; cond; update). while(cond). do{...}while(cond);. break = exit. continue = next iteration.',
    assignment_prompt: 'Write a program using a for loop to calculate the factorial of 5 (5 * 4 * 3 * 2 * 1) and print the result.',
    assignment_starter_code: `#include <stdio.h>

int main(void) {
    // Calculate 5! and print
    return 0;
}`,
    assignment_solution: `#include <stdio.h>

int main(void) {
    int n = 5;
    long long fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    printf("Factorial of %d = %lld\\n", n, fact);
    return 0;
}`
  }
];

module.exports = { cAdditionalTopics };
