/**
 * Code Nexus — Comprehensive Educational Content Engine
 * Master topic definitions across all 10 programming and engineering tracks.
 * Every topic adheres strictly to the 14-Section Educational Standard.
 */

const {
  createPointerMemorySvg,
  createMemoryLayoutSvg,
  createSqlJoinSvg,
  createEventLoopSvg,
  createControlFlowSvg,
  createBoxModelSvg
} = require('./diagrams');

const { cTopics } = require('./c-curriculum');

// ====================================================================
// C++ TOPICS (C++ Modern Systems & OOP)
// ====================================================================
const cppTopics = [
  {
    id: 'cpp-cin-cout-namespaces',
    course_id: 'cpp',
    unit_id: 'cpp-unit-1',
    title: 'Modern I/O Streams, Namespaces & std::',
    description: 'Type-safe I/O with std::cin and std::cout, stream manipulators, and namespace scoping in modern C++.',
    order_index: 1,
    learning_objectives: [
      'Master type-safe stream input and output using std::cin and std::cout',
      'Understand the role of namespaces and the dangers of using namespace std;',
      'Learn fast I/O techniques used in competitive programming and high-performance systems'
    ],
    prerequisites: ['Basic C Program Structure'],
    expected_outcomes: ['Able to write type-safe C++ console programs and properly manage scope with namespaces'],
    formal_definition: 'In C++, I/O streams are object-oriented abstractions defined in <iostream> that overload bitwise shift operators (<< as stream insertion, >> as stream extraction) to perform type-safe console I/O.',
    content_simple_english: `In C, you had to memorize format specifiers like %d, %s, and %f, which easily led to memory bugs if you made a typo. C++ replaces this with I/O Streams (<iostream>):
- std::cout << data: Inserts data into the standard output stream. The compiler automatically figures out the data type!
- std::cin >> var: Extracts data from user input into a variable safely.
- std::endl: Inserts a newline character ('\\n') AND forces the buffer to flush immediately.

Namespaces: A namespace is an organized container for names (functions, classes, variables) to prevent name collisions. std is the standard namespace. While beginners often write using namespace std;, in professional C++ this is discouraged because it pollutes the global scope.`,
    hinglish_explanation: `C me hume printf me %d, %f, %s yaad rakhna padta tha aur galti hone par program crash ho jata tha. C++ ne isko solve kiya Streams ke sath:
- std::cout << "Hello": Ye apne aap pehchaan leta hai ki aap number print kar rahe ho ya string!
- std::cin >> x: User se input lene ke liye.
- std::endl: New line ke liye aur buffer ko turant flush karne ke liye.

Namespaces: Socho ek school me do bacchon ka naam "Rahul" hai. Confusion na ho isliye hum bolte hain "Class A ka Rahul" aur "Class B ka Rahul". C++ me yahi kaam Namespace karta hai! std::cout ka matlab hai "std" namespace ke andar ka cout tool.`,
    why_it_matters: 'Type-safe streams eliminate format-string security vulnerabilities (CWE-134) and make code significantly easier to maintain and extend with custom classes.',
    when_to_use: 'Use std::cout and std::cin for all standard C++ console applications. For high-throughput servers handling gigabytes of logging, use "\\n" instead of std::endl to avoid unnecessary flush pauses.',
    syntax_guide: {
      template: '#include <iostream>\n\nint main() {\n    std::cout << "Value: " << 42 << std::endl;\n    return 0;\n}',
      components: [
        { name: 'std::cout', role: 'Standard output stream object', required: true },
        { name: '<<', role: 'Stream insertion operator', required: true },
        { name: 'std::endl', role: 'Appends newline and flushes stream buffer', required: false }
      ],
      rules: ['Never put using namespace std; in header files', 'Stream extraction (>>) skips leading whitespace by default']
    },
    code_example_1_title: 'Basic Foundational: Type-Safe Console Stream Output',
    code_example_1_code: `#include <iostream>
#include <string>

int main() {
    std::string studentName = "Alice Morgan";
    int score = 96;
    double gpa = 3.95;

    std::cout << "Student Record:" << std::endl;
    std::cout << "Name : " << studentName << std::endl;
    std::cout << "Score: " << score << " / 100" << std::endl;
    std::cout << "GPA  : " << gpa << std::endl;

    return 0;
}`,
    code_example_1_explanation: 'Notice that std::cout automatically handles std::string, int, and double seamlessly without format specifiers.',
    code_example_1_output: `Student Record:
Name : Alice Morgan
Score: 96 / 100
GPA  : 3.95`,

    code_example_2_title: 'Intermediate Logic: Custom Namespaces to Prevent Collisions',
    code_example_2_code: `#include <iostream>

namespace DatabaseEngine {
    int maxConnections = 500;
    void logStatus() {
        std::cout << "DB Engine active. Pool limit: " << maxConnections << std::endl;
    }
}

namespace WebServer {
    int maxConnections = 10000;
    void logStatus() {
        std::cout << "Web Server active. Epoll max: " << maxConnections << std::endl;
    }
}

int main() {
    DatabaseEngine::logStatus();
    WebServer::logStatus();
    return 0;
}`,
    code_example_2_explanation: 'Demonstrates custom namespaces resolving potential name collisions between identically named symbols across subsystems.',
    code_example_2_output: `DB Engine active. Pool limit: 500
Web Server active. Epoll max: 10000`,

    code_example_3_title: 'Practical Application: Fast I/O Optimization in High-Throughput C++',
    code_example_3_code: `#include <iostream>

int main() {
    // Fast I/O: Untie C++ streams from C stdio buffers
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int packetCount = 3;
    std::cout << "Optimized Systems Telemetry Stream\\n";
    for (int i = 1; i <= packetCount; ++i) {
        std::cout << "Packet #" << i << " verified\\n";
    }

    return 0;
}`,
    code_example_3_explanation: 'sync_with_stdio(false) detaches C++ stream buffers from C stdio, boosting terminal I/O speed by up to 5x.',
    code_example_3_output: `Optimized Systems Telemetry Stream
Packet #1 verified
Packet #2 verified
Packet #3 verified`,

    code_walkthrough: {
      code: `std::cout << "Num: " << 10 << "\\n";`,
      steps: [
        { line: 1, explanation: 'String "Num: " pushed to output stream buffer.', state: 'Buffer: "Num: "' },
        { line: 1, explanation: 'Integer 10 formatted to ASCII chars "10" and appended.', state: 'Buffer: "Num: 10"' },
        { line: 1, explanation: 'Newline character \"\\n\" appended; ready for OS flush.', state: 'Buffer: "Num: 10\\n"' }
      ],
      output: 'Num: 10',
      output_reasoning: 'Stream operators chain from left to right, accumulating in the stream buffer.'
    },

    rules_and_restrictions: [
      'Do not include using namespace std; inside header (.h) files; it contaminates every file including that header',
      'Prefer \"\\n\" over std::endl in performance-critical loops to prevent premature buffer flushes'
    ],
    common_mistakes: [
      {
        title: 'Confusing stream operators << and >>',
        incorrect_code: `std::cin << x;\nstd::cout >> "Hello";`,
        explanation: '<< points into the stream (output); >> points away from the stream into the variable (input).',
        corrected_code: `std::cin >> x;\nstd::cout << "Hello";`,
        error_message: 'error: no match for "operator<<"',
        debug_tip: 'Remember the arrows: << points towards cout (outward); >> points towards variable (inward).'
      }
    ],
    comparison_table: {
      title: 'printf (C) vs std::cout (C++)',
      concept_a: 'printf()',
      concept_b: 'std::cout',
      headers: ['Feature', 'printf (C)', 'std::cout (C++)'],
      rows: [
        ['Type Safety', 'No (mismatches cause crashes/CVEs)', 'Yes (compile-time type deduction)'],
        ['Extensibility', 'Hardcoded to primitives', 'Extensible to custom classes via operator<<'],
        ['Syntax', 'Format strings (%d, %s)', 'Chained stream operators (<<)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Industrial C++ command line tools and diagnostics dashboards',
      'High-performance competitive programming engines'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Why is using namespace std; discouraged in professional C++ header files?',
        options: [
          'It slows down program execution at runtime',
          'It pollutes the global scope and can cause ambiguous symbol naming collisions',
          'It causes memory leaks',
          'It is deprecated in C++20'
        ],
        correct_index: 1,
        explanation: 'Injecting the entire std namespace into headers forces every file that includes that header into the same global namespace, causing name collisions.'
      }
    ],
    key_takeaways: [
      'std::cout << and std::cin >> provide type-safe stream I/O in C++.',
      'Namespaces organize code and avoid naming collisions.',
      'Prefer \"\\n\" over std::endl for faster buffered output.'
    ],
    quick_revision_notes: 'I/O: #include <iostream>. std::cout << output; std::cin >> input. std::endl flushes. Avoid using namespace std in headers.',
    assignment_prompt: 'Write a C++ program that prompts and prints an employee name, id (int), and salary (double) using std::cout.',
    assignment_starter_code: `#include <iostream>
#include <string>

int main() {
    // Write your C++ stream output code
    return 0;
}`,
    assignment_solution: `#include <iostream>
#include <string>

int main() {
    std::string name = "John Doe";
    int id = 101;
    double salary = 75000.50;

    std::cout << "Employee ID    : " << id << std::endl;
    std::cout << "Employee Name  : " << name << std::endl;
    std::cout << "Base Salary    : $" << salary << std::endl;
    return 0;
}`
  },

  {
    id: 'cpp-references-vs-pointers',
    course_id: 'cpp',
    unit_id: 'cpp-unit-1',
    title: 'References vs Pointers & Const References',
    description: 'Master C++ references (T&), const references (const T&), pointer comparisons, and zero-cost parameter passing.',
    order_index: 2,
    learning_objectives: [
      'Understand the fundamental differences between References and Pointers in C++',
      'Master pass-by-const-reference to achieve zero-copy function efficiency',
      'Avoid returning references to local stack variables'
    ],
    prerequisites: ['Pointers, Addresses & Dereferencing'],
    expected_outcomes: ['Able to write memory-efficient C++ functions using const references without unnecessary copying'],
    formal_definition: 'A C++ reference is an alias for an existing object in memory. Once initialized, a reference cannot be rebound to refer to another object, nor can it be null.',
    content_simple_english: `In C, if you wanted a function to modify a variable without copying it, you had to use Pointers (int*). But pointers can be tricky: they can be NULL, they require the dereference operator (*), and they can be accidentally pointed somewhere else.

C++ introduces References (type&):
- A reference is an ALIAS (an alternative nickname) for an existing variable.
- It shares the exact same memory address as the original variable.
- It CANNOT be NULL (guaranteed to refer to an existing object).
- It CANNOT be reassigned to another variable after initialization.

Const References (const type&):
This is the gold standard for C++ function parameters:
void processData(const std::string& text);
This means: "Pass text by reference so we do not waste CPU time copying millions of characters, but mark it const so the function cannot accidentally alter the original string!"`,
    hinglish_explanation: `Pointer aur Reference me kya farak hai?
- Pointer ek alag variable hota hai jo dusre ka memory address store karta hai.
- Reference ek ALIAS (nickname) hota hai. Jaise ek ladke ka naam "Vikas" hai aur ghar pe log use "Vicky" bulate hain. Vikas aur Vicky dono ek hi insaan hain! Agar aap Vicky ki jeb me 100 rupaye daalenge, toh Vikas ki jeb me bhi 100 rupaye aayenge!

C++ me int &ref = x; likhne se ref aur x ek hi memory cell ban jaate hain.
Sabse best practice C++ me hoti hai: const Type &var. Iska matlab: "Data ko copy mat karo (memory bachegi), aur function ko bolo ki wo ise badal na sake (safe rahega)."`,
    why_it_matters: 'Passing large C++ objects by value copies their entire internal state (heap buffers, capacity). Passing by const reference achieves zero-copy speed while preserving safety.',
    when_to_use: 'Use const references for passing complex objects (std::string, std::vector, custom classes) into functions. Use pointers only when the target can legitimately be optional/NULL or needs to be rebound.',
    syntax_guide: {
      template: 'int original = 42;\nint &ref = original;         // ref is an alias\nconst std::string &safeRef = str; // zero-copy read-only view',
      components: [
        { name: 'type &ref', role: 'Declares an lvalue reference alias', required: true },
        { name: 'const type &ref', role: 'Read-only reference permitting temporary rvalues', required: true }
      ],
      rules: ['References must be initialized upon declaration', 'A reference cannot be NULL', 'A reference cannot be rebound']
    },
    code_example_1_title: 'Basic Foundational: Reference Alias Behavior',
    code_example_1_code: `#include <iostream>

int main() {
    int score = 50;
    int &refScore = score; // refScore is an alias for score

    std::cout << "Original score : " << score << std::endl;
    refScore = 85; // Modifying alias modifies original!
    std::cout << "Score after ref: " << score << std::endl;

    return 0;
}`,
    code_example_1_explanation: 'refScore shares the exact memory address as score. Mutating refScore mutates score directly.',
    code_example_1_output: `Original score : 50
Score after ref: 85`,

    code_example_2_title: 'Intermediate Logic: In-Place Swap via References',
    code_example_2_code: `#include <iostream>

void swapNumbers(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10, y = 99;
    std::cout << "Before swap: x=" << x << ", y=" << y << std::endl;
    swapNumbers(x, y); // Clean syntax, no & or * needed!
    std::cout << "After swap : x=" << x << ", y=" << y << std::endl;
    return 0;
}`,
    code_example_2_explanation: 'Unlike C pointers where caller must pass &x and callee must dereference *a, C++ references offer clean natural syntax while mutating caller memory in place.',
    code_example_2_output: `Before swap: x=10, y=99
After swap : x=99, y=10`,

    code_example_3_title: 'Practical Application: Zero-Copy String Inspection with const Ref',
    code_example_3_code: `#include <iostream>
#include <string>

// Zero-copy: 10MB string is inspected without allocating any memory
void printAudit(const std::string &serviceName, const std::string &status) {
    std::cout << "[AUDIT] Service '" << serviceName << "' reported: " << status << std::endl;
}

int main() {
    std::string sName = "PaymentGateway";
    std::string sStatus = "OPERATIONAL_STABLE";
    printAudit(sName, sStatus);
    return 0;
}`,
    code_example_3_explanation: 'Passes strings by const reference. No memory allocation occurs, eliminating heap copy overhead.',
    code_example_3_output: `[AUDIT] Service 'PaymentGateway' reported: OPERATIONAL_STABLE`,

    code_walkthrough: {
      code: `int x = 100;\nint &r = x;\nr += 50;\nstd::cout << x;`,
      steps: [
        { line: 1, explanation: 'Allocates integer x on stack with value 100.', state: 'x = 100' },
        { line: 2, explanation: 'Creates reference r bound to x. Shares same memory address.', state: '&r == &x' },
        { line: 3, explanation: 'Adds 50 to r; value at address becomes 150.', state: 'x = 150' },
        { line: 4, explanation: 'Print x.', state: 'Stdout: 150' }
      ],
      output: '150',
      output_reasoning: 'r is an alias for x, so r += 50 modifies x.'
    },

    rules_and_restrictions: [
      'A reference cannot be uninitialized: int &r; is a fatal compiler error',
      'Never return a reference to a local variable: the memory is destroyed when function exits (Dangling Reference)'
    ],
    common_mistakes: [
      {
        title: 'Returning Reference to Local Stack Variable',
        incorrect_code: `int& calculate() {\n    int temp = 42;\n    return temp; // CRITICAL BUG: temp destroyed upon return!\n}`,
        explanation: 'Returning a reference to a local variable returns an alias to destroyed stack memory, causing undefined behavior or crashes.',
        corrected_code: `int calculate() {\n    int temp = 42;\n    return temp; // Return by value\n}`,
        error_message: 'warning: reference to local variable "temp" returned',
        debug_tip: 'Only return references to variables that outlive the function (like heap objects or class member variables).'
      }
    ],
    comparison_table: {
      title: 'Pointers vs References in C++',
      concept_a: 'Pointer (T*)',
      concept_b: 'Reference (T&)',
      headers: ['Feature', 'Pointer (T*)', 'Reference (T&)'],
      rows: [
        ['Nullability', 'Can be NULL (nullptr)', 'Cannot be NULL (must bind to valid object)'],
        ['Reassignment', 'Can be changed to point to another object', 'Cannot be rebound after initialization'],
        ['Syntax', 'Requires & to take address, * to dereference', 'Used directly like a regular variable'],
        ['Initialization', 'Can be uninitialized (holds garbage)', 'Must be initialized when declared']
      ]
    },
    diagram_svg: createPointerMemorySvg('original', '50', '0x7ffcd3e120', 'aliasRef', '0x7ffcd3e120'),
    practical_applications: [
      'Copy-free parameter passing in game engines and graphics pipelines',
      'Operator overloading (e.g. operator[] returning a reference for in-place assignment)'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which statement about C++ references is FALSE?',
        options: [
          'A reference must be initialized when declared',
          'A reference can be rebound to refer to a different variable later',
          'A reference cannot be null',
          'A reference shares the same memory address as the referent'
        ],
        correct_index: 1,
        explanation: 'Once initialized, a C++ reference cannot be rebound to refer to another object. Any assignment to the reference mutates the underlying referent.'
      }
    ],
    key_takeaways: [
      'References are non-null aliases to existing objects.',
      'Pass by const reference (const T&) eliminates copying overhead while preserving safety.',
      'Never return a reference to a local stack variable.'
    ],
    quick_revision_notes: 'Reference: T &ref = var; Cannot be null or rebound. Pass by const T& for zero-copy read-only arguments.',
    assignment_prompt: 'Write a C++ function void increment(int &val) that increments the integer reference by 1. In main, declare n = 99, call increment(n), and print n.',
    assignment_starter_code: `#include <iostream>

void increment(int &val) {
    // Increment val
}

int main() {
    int n = 99;
    // Call increment and print n
    return 0;
}`,
    assignment_solution: `#include <iostream>

void increment(int &val) {
    val++;
}

int main() {
    int n = 99;
    std::cout << "Before: " << n << std::endl;
    increment(n);
    std::cout << "After : " << n << std::endl;
    return 0;
}`
  },

  {
    id: 'cpp-classes-objects',
    course_id: 'cpp',
    unit_id: 'cpp-unit-2',
    title: 'Classes, Objects, Encapsulation & Constructors',
    description: 'Object-Oriented Programming in C++: classes, access specifiers (public/private), constructors, destructors, and RAII.',
    order_index: 3,
    learning_objectives: [
      'Master class design, state encapsulation, and access specifiers',
      'Understand default, parameterized, and copy constructors',
      'Master destructors and the RAII (Resource Acquisition Is Initialization) pattern'
    ],
    prerequisites: ['References vs Pointers'],
    expected_outcomes: ['Able to design robust C++ classes with encapsulated state and automatic resource cleanup via RAII'],
    formal_definition: 'A class in C++ is a user-defined blueprint type that encapsulates data members (state) and member functions (behavior), enforcing access restrictions through private, protected, and public specifiers.',
    content_simple_english: `Procedural programming in C separated functions from the data they manipulated. Object-Oriented Programming (OOP) in C++ groups data and the functions that manipulate that data into a single coherent unit called a Class.

Key Components:
1. Access Specifiers:
   - private: Only member functions inside the class can touch these variables (Encapsulation).
   - public: Accessible from anywhere outside the class.
2. Constructors: Special member functions called automatically when an object is created. Used to initialize variables and allocate resources.
3. Destructors (~ClassName): Special member function called automatically when an object goes out of scope.
4. RAII (Resource Acquisition Is Initialization): This is modern C++ super-power! When an object is created, it acquires resources (memory, file handle, network lock). When the object leaves its scope, its destructor automatically frees the resource. No memory leaks!`,
    hinglish_explanation: `Class ek naksha (blueprint) hoti hai, aur Object us nakshe se bana hua real ghar (instance) hota hai!

1. Encapsulation: Class ke andar ke data (variables) ko private rakhte hain taaki bahar ka koi bhi code unhe direct modify karke kharab na kar sake. Data ko access karne ke liye hum public functions (getters/setters) dete hain.
2. Constructor: Jaise hi aap naya object banate hain, Constructor automatically call hota hai aur initial values set karta hai.
3. Destructor (~ClassName): Jaise hi object ka kaam khatam hota hai (block ke bahar nikalta hai), Destructor automatically call hota hai aur memory ko clean kar deta hai. C++ ka sabse bada rule hai RAII: resource kholo constructor me, aur band karo destructor me!`,
    why_it_matters: 'Encapsulation protects data invariants, while RAII guarantees zero memory and resource leaks even when runtime exceptions are thrown.',
    when_to_use: 'Use classes to model entities with internal state and behavior. Prefer private member variables with public member methods to maintain data validity.',
    syntax_guide: {
      template: 'class BankAccount {\nprivate:\n    double balance;\npublic:\n    BankAccount(double initial) : balance(initial) {} // Constructor\n    ~BankAccount() {} // Destructor\n    void deposit(double amount) { balance += amount; }\n};',
      components: [
        { name: 'class', role: 'Keyword declaring a class type (default private access)', required: true },
        { name: 'constructor', role: 'Function sharing class name, no return type, initializes members', required: true },
        { name: '~destructor', role: 'Tilde + class name, cleans up resources upon destruction', required: false }
      ],
      rules: ['Class members are private by default (unlike struct where members are public by default)', 'Constructors and destructors have no return type']
    },
    code_example_1_title: 'Basic Foundational: Encapsulated Account Class',
    code_example_1_code: `#include <iostream>
#include <string>

class BankAccount {
private:
    std::string accountHolder;
    double balance;

public:
    // Parameterized Constructor with Member Initializer List
    BankAccount(const std::string &name, double initialBalance)
        : accountHolder(name), balance(initialBalance) {}

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            std::cout << "Deposited $" << amount << ". New balance: $" << balance << std::endl;
        }
    }

    void display() const {
        std::cout << "Holder : " << accountHolder << " | Balance: $" << balance << std::endl;
    }
};

int main() {
    BankAccount acc("Alex Morgan", 500.0);
    acc.display();
    acc.deposit(250.0);
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates private data encapsulation, constructor member initializer list (: accountHolder(name)), and public member methods.',
    code_example_1_output: `Holder : Alex Morgan | Balance: $500
Deposited $250. New balance: $750`,

    code_example_2_title: 'Intermediate Logic: RAII Resource Lifetime & Destructor',
    code_example_2_code: `#include <iostream>
#include <string>

class ScopedTimer {
private:
    std::string taskName;

public:
    ScopedTimer(const std::string &name) : taskName(name) {
        std::cout << "[START] Task: " << taskName << std::endl;
    }

    ~ScopedTimer() {
        std::cout << "[STOP]  Task: " << taskName << " (Destructor Cleaned Resources)" << std::endl;
    }
};

int main() {
    std::cout << "Entering local scope..." << std::endl;
    {
        ScopedTimer timer("DatabaseQueryProcess");
        std::cout << "Performing query operations..." << std::endl;
    } // timer automatically destructed HERE!
    std::cout << "Exited local scope." << std::endl;
    return 0;
}`,
    code_example_2_explanation: 'Illustrates the RAII idiom: ScopedTimer destructor executes automatically the microsecond execution leaves the enclosing curly brace block {}.',
    code_example_2_output: `Entering local scope...
[START] Task: DatabaseQueryProcess
Performing query operations...
[STOP]  Task: DatabaseQueryProcess (Destructor Cleaned Resources)
Exited local scope.`,

    code_example_3_title: 'Practical Application: Self-Managing Dynamic Heap Buffer (RAII)',
    code_example_3_code: `#include <iostream>

class DynamicArray {
private:
    int *data;
    size_t size;

public:
    DynamicArray(size_t s) : size(s), data(new int[s]) {
        for (size_t i = 0; i < size; ++i) data[i] = 0;
        std::cout << "Heap buffer allocated (" << size * sizeof(int) << " bytes)" << std::endl;
    }

    ~DynamicArray() {
        delete[] data; // Guaranteed cleanup!
        std::cout << "Heap buffer freed automatically by destructor." << std::endl;
    }

    void set(size_t idx, int val) { if (idx < size) data[idx] = val; }
    int get(size_t idx) const { return idx < size ? data[idx] : 0; }
};

int main() {
    {
        DynamicArray arr(3);
        arr.set(0, 100);
        arr.set(1, 200);
        std::cout << "arr[1] = " << arr.get(1) << std::endl;
    } // No memory leak! delete[] called automatically
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates modern RAII memory safety: manual new and delete are enclosed inside a class wrapper, preventing memory leaks.',
    code_example_3_output: `Heap buffer allocated (12 bytes)
arr[1] = 200
Heap buffer freed automatically by destructor.`,

    code_walkthrough: {
      code: `BankAccount b("Alex", 100);\nb.deposit(50);`,
      steps: [
        { line: 1, explanation: 'Memory allocated on stack for b; constructor initializes balance to 100.', state: 'b.balance = 100' },
        { line: 2, explanation: 'deposit(50) invoked; balance updated to 150.', state: 'b.balance = 150' },
        { line: 2, explanation: 'End of scope reached; destructor called automatically.', state: 'Destructed' }
      ],
      output: 'Deposited $50. New balance: $150',
      output_reasoning: 'Member function validates positive amount and updates balance.'
    },

    rules_and_restrictions: [
      'In C++, class members default to private; struct members default to public',
      'Destructors take no arguments and cannot be overloaded',
      'Always use delete[] when freeing memory allocated with new[]'
    ],
    common_mistakes: [
      {
        title: 'Mismatched new[] and delete',
        incorrect_code: `int *arr = new int[100];\ndelete arr; // WRONG: Missing []`,
        explanation: 'Using delete instead of delete[] on an array invokes undefined behavior, corrupting heap metadata.',
        corrected_code: `int *arr = new int[100];\ndelete[] arr; // Correct array delete`,
        error_message: 'Valgrind: Mismatched free() / delete / delete []',
        debug_tip: 'Always match new with delete, and new[] with delete[].'
      }
    ],
    comparison_table: {
      title: 'class vs struct in C++',
      concept_a: 'class',
      concept_b: 'struct',
      headers: ['Feature', 'class', 'struct'],
      rows: [
        ['Default Member Access', 'private', 'public'],
        ['Default Inheritance', 'private', 'public'],
        ['Idiomatic Usage', 'Objects with encapsulated logic and invariants', 'Passive data carriers (Plain Old Data / DTOs)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Encapsulating database connection pools, file handles, and mutex locks in backend servers',
      'Game character entities (HP, mana, movement physics)'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the default access specifier for members of a C++ class?',
        options: ['public', 'private', 'protected', 'internal'],
        correct_index: 1,
        explanation: 'In C++, class members are private by default. In contrast, struct members are public by default.'
      }
    ],
    key_takeaways: [
      'Classes bundle state and behavior while enforcing encapsulation via private.',
      'Constructors initialize state; destructors cleanly release resources upon scope exit.',
      'RAII prevents memory leaks by binding resource lifetime to object lifetime.'
    ],
    quick_revision_notes: 'Class: private by default. Constructor initializes. ~Destructor frees resources. RAII: cleanup happens automatically upon scope exit.',
    assignment_prompt: 'Write a C++ class Rectangle with private members width and height, a constructor to set them, and a public method area() returning width * height.',
    assignment_starter_code: `#include <iostream>

class Rectangle {
    // Write Rectangle class with private members and area() method
};

int main() {
    Rectangle r(5, 4);
    // Print area
    return 0;
}`,
    assignment_solution: `#include <iostream>

class Rectangle {
private:
    int width;
    int height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}
    int area() const {
        return width * height;
    }
};

int main() {
    Rectangle r(5, 4);
    std::cout << "Rectangle Area: " << r.area() << std::endl;
    return 0;
}`
  }
];

// Export all modules
module.exports = {
  cTopics,
  cppTopics,
};
