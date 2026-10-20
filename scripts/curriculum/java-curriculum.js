/**
 * Code Nexus — Comprehensive Java Curriculum
 * Master topic definitions for Java Track
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createMemoryLayoutSvg, createControlFlowSvg } = require('./diagrams');

const javaTopics = [
  {
    id: 'java-architecture-types',
    course_id: 'java',
    unit_id: 'java-unit-1',
    title: 'JVM Architecture, Primitive vs Reference Types',
    description: 'Master Java virtual machine architecture (JDK vs JRE vs JVM), bytecode, garbage collection, and primitive vs reference memory.',
    order_index: 1,
    learning_objectives: [
      'Understand the roles of JDK, JRE, JVM, and Bytecode (.class files)',
      'Learn how Java achieves "Write Once, Run Anywhere" (WORA)',
      'Master primitive types vs reference types on Stack and Heap'
    ],
    prerequisites: ['Basic programming concepts'],
    expected_outcomes: ['Able to explain JVM internals, memory allocation, and pass-by-value semantics in Java'],
    formal_definition: 'The Java Virtual Machine (JVM) is an abstract computing machine that provides a runtime environment in which Java bytecode (.class) can be executed. Java enforces strict static typing with 8 primitive types and reference types pointing to heap-allocated objects.',
    content_simple_english: `When you write Java code in a file like Main.java:
1. The Java Compiler (javac) compiles your source code into intermediate **Bytecode** stored in Main.class.
2. The Java Virtual Machine (JVM) reads this bytecode and uses a Just-In-Time (JIT) compiler to translate it into native CPU instructions at runtime!
This two-step process is how Java achieves "Write Once, Run Anywhere": the same .class bytecode file runs on Linux, Windows, macOS, or servers without re-compilation.

Memory Models:
- Primitive Types (byte, short, int, long, float, double, boolean, char): Stored directly on the Thread Stack. They hold raw binary values.
- Reference Types (Objects, Arrays, Strings, Classes): The reference address lives on the Stack, while the actual object data is allocated on the Heap. Java's Garbage Collector (GC) automatically frees heap objects when they have no more references pointing to them!`,
    hinglish_explanation: `Java ka sabse bada feature hai WORA (Write Once, Run Anywhere)!
Jab aap C code compile karte hain, toh wo direct aapke laptop ke CPU ke liye binary banata hai (wo kisi aur OS pe nahi chalega). Lekin Java me:
1. javac compiler aapke code ko **Bytecode** (.class) me badalta hai.
2. Ab is .class file ko kisi bhi computer pe le jao, agar waha JVM install hai, toh wo use chala dega!

Memory me do types hote hain:
1. Primitive Types (int, float, char): Ye direct Stack memory me rehte hain aur fast hote hain.
2. Reference Types (Objects, Strings, Arrays): Inka naam Stack me rehta hai, lekin actual data Heap memory me banta hai. Java me hume C ki tarah free() nahi karna padta—Java ka **Garbage Collector (GC)** purane kachre ko apne aap clean kar deta hai!`,
    why_it_matters: 'Understanding JVM memory layout prevents OutOfMemoryError (OOM), garbage collection pauses, and subtle bugs related to reference equality vs value equality.',
    when_to_use: 'Use primitive types (int, double) for tight math loops to avoid object wrapping overhead. Use reference types (Integer, String, Objects) when working with Java Collections like ArrayList and HashMap.',
    syntax_guide: {
      template: 'public class Main {\n    public static void main(String[] args) {\n        int primitiveVal = 42;\n        String refVal = new String("Nexus");\n        System.out.println(primitiveVal);\n    }\n}',
      components: [
        { name: 'public class Main', role: 'Class name must strictly match filename Main.java', required: true },
        { name: 'public static void main', role: 'JVM entry point signature', required: true },
        { name: 'System.out.println', role: 'Standard output stream print method', required: true }
      ],
      rules: ['Java source filenames must match the public class name exactly', 'Java is strictly pass-by-value (for references, it passes a copy of the reference address)']
    },
    code_example_1_title: 'Basic Foundational: Primitive vs Reference Memory Behavior',
    code_example_1_code: `public class Main {
    public static void main(String[] args) {
        // Primitive variable
        int a = 10;
        int b = a;
        b = 20;
        System.out.println("Primitive a unchanged: " + a);
        System.out.println("Primitive b modified : " + b);

        // Reference array object
        int[] arr1 = {10, 20};
        int[] arr2 = arr1; // Shares exact same heap array!
        arr2[0] = 99;
        System.out.println("Reference arr1[0] reflects mutation: " + arr1[0]);
    }
}`,
    code_example_1_explanation: 'Shows primitive copying (independent values) vs reference copying (both references point to the same heap array object).',
    code_example_1_output: `Primitive a unchanged: 10
Primitive b modified : 20
Reference arr1[0] reflects mutation: 99`,

    code_example_2_title: 'Intermediate Logic: String Pool & .equals() vs ==',
    code_example_2_code: `public class Main {
    public static void main(String[] args) {
        String s1 = "CodeNexus"; // String Literal Pool
        String s2 = "CodeNexus"; // Reuses pooled object
        String s3 = new String("CodeNexus"); // Forces new heap allocation

        System.out.println("s1 == s2 (Same pool address?): " + (s1 == s2));
        System.out.println("s1 == s3 (Same heap address?): " + (s1 == s3));
        System.out.println("s1.equals(s3) (Equal text?)   : " + s1.equals(s3));
    }
}`,
    code_example_2_explanation: 'Demonstrates Java String Constant Pool optimization and highlights why == compares memory addresses while .equals() compares string contents.',
    code_example_2_output: `s1 == s2 (Same pool address?): true
s1 == s3 (Same heap address?): false
s1.equals(s3) (Equal text?)   : true`,

    code_example_3_title: 'Practical Application: Enterprise Production Service Metrics',
    code_example_3_code: `public class Main {
    static class SystemMetrics {
        final String serviceName;
        final long uptimeSeconds;
        final double heapMemoryUsageMB;

        SystemMetrics(String name, long uptime, double heapMB) {
            this.serviceName = name;
            this.uptimeSeconds = uptime;
            this.heapMemoryUsageMB = heapMB;
        }

        void printTelemetry() {
            System.out.printf("Service: %s | Uptime: %d s | Heap: %.2f MB%n",
                serviceName, uptimeSeconds, heapMemoryUsageMB);
        }
    }

    public static void main(String[] args) {
        SystemMetrics metrics = new SystemMetrics("OrderProcessingService", 86400, 512.75);
        metrics.printTelemetry();
    }
}`,
    code_example_3_explanation: 'Demonstrates enterprise Java encapsulation with immutability (final fields) and formatted stream printing.',
    code_example_3_output: `Service: OrderProcessingService | Uptime: 86400 s | Heap: 512.75 MB`,

    code_walkthrough: {
      code: `int x = 5;\nString s = "Hi";\nSystem.out.println(s + x);`,
      steps: [
        { line: 1, explanation: 'Allocates primitive integer 5 on thread stack frame.', state: 'Stack: x=5' },
        { line: 2, explanation: 'Creates string "Hi" in heap string pool; stores reference on stack.', state: 'Stack: s -> Heap("Hi")' },
        { line: 3, explanation: 'String concatenation creates new string "Hi5" and prints.', state: 'Stdout: Hi5' }
      ],
      output: 'Hi5',
      output_reasoning: 'Java converts integer 5 to string and concatenates with "Hi".'
    },

    rules_and_restrictions: [
      'In Java, you can NEVER compare Strings with ==; always use .equals()',
      'Java does not support explicit pointer arithmetic or manual memory freeing',
      'The source file Main.java must contain the public class Main'
    ],
    common_mistakes: [
      {
        title: 'Comparing Strings with == instead of .equals()',
        incorrect_code: `String input = new String("ADMIN");\nif (input == "ADMIN") { ... } // Evaluates FALSE!`,
        explanation: '== compares object memory references. Because new String() forces a distinct heap allocation, == returns false even though the characters match.',
        corrected_code: `if ("ADMIN".equals(input)) { ... }`,
        error_message: 'Silent logical authorization bypass bug',
        debug_tip: 'Always use .equals() for content comparison in Java.'
      }
    ],
    comparison_table: {
      title: '== vs .equals() in Java',
      concept_a: '== Operator',
      concept_b: '.equals() Method',
      headers: ['Aspect', '== Operator', '.equals() Method'],
      rows: [
        ['Primitives', 'Compares literal values (5 == 5 is true)', 'Cannot be called on primitives'],
        ['Objects / Strings', 'Compares heap memory address (reference identity)', 'Compares actual state or string contents'],
        ['Overridable', 'No (built into language syntax)', 'Yes (can be overridden in custom classes)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Spring Boot enterprise microservices and backend banking systems',
      'Android mobile application lifecycle management'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the correct way to compare the contents of two String objects in Java?',
        options: ['s1 == s2', 's1.equals(s2)', 's1.compare(s2)', 's1 is s2'],
        correct_index: 1,
        explanation: 'In Java, .equals() must be used to compare the textual contents of String objects. == only compares reference addresses.'
      }
    ],
    key_takeaways: [
      'JVM executes bytecode (.class) using a Just-In-Time (JIT) compiler.',
      'Primitives live on the stack; objects live on the heap.',
      'Always compare strings using .equals(), never ==.'
    ],
    quick_revision_notes: 'JDK = Development Tools; JRE = Runtime; JVM = Execution Engine. Primitives = Stack; Objects = Heap + GC. Use .equals() for strings.',
    assignment_prompt: 'Write a Java program that creates an array of 3 strings {"C", "C++", "Java"}, prints them using a for-each loop, and verifies array length.',
    assignment_starter_code: `public class Main {
    public static void main(String[] args) {
        // Create array and print elements using for-each loop
    }
}`,
    assignment_solution: `public class Main {
    public static void main(String[] args) {
        String[] languages = {"C", "C++", "Java"};
        System.out.println("Track count: " + languages.length);
        for (String lang : languages) {
            System.out.println("Language: " + lang);
        }
    }
}`
  }
];

module.exports = { javaTopics };
