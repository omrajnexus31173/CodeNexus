/**
 * Code Nexus — Curriculum: Final 4 Topics to Achieve 100% Coverage (35/35)
 * Covers: cpp-stl-containers, cpp-inheritance-polymorphism, py-numpy-basics, py-pandas-data-analysis
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createMemoryLayoutSvg, createControlFlowSvg } = require('./diagrams');

const finalFourTopics = [
  // 1. C++ STL Containers
  {
    id: 'cpp-stl-containers',
    course_id: 'cpp',
    unit_id: 'cpp-unit-1',
    title: 'Standard Template Library (STL) Containers',
    description: 'Master STL sequence and associative containers: std::vector, std::map, std::unordered_map, iterators, and algorithmic efficiency.',
    order_index: 3,
    learning_objectives: [
      'Master dynamic array manipulation with std::vector (push_back, emplace_back, reserve)',
      'Understand the trade-offs between std::map (Red-Black Tree, O(log N)) and std::unordered_map (Hash Table, O(1))',
      'Navigate and manipulate collections idiomatically using modern C++ range-based for loops and iterators'
    ],
    prerequisites: ['Classes, Objects, and Encapsulation'],
    expected_outcomes: ['Able to select optimal STL containers for real-world memory and computational performance'],
    formal_definition: 'The C++ Standard Template Library (STL) provides generic container class templates categorized into Sequence Containers (vector, deque, list) and Associative Containers (map, set, unordered_map, unordered_set) operating with unified iterator interfaces.',
    content_simple_english: `In C, if you wanted an array that could grow, you had to manually call malloc(), realloc(), and calculate byte offsets.
C++ solves this with the **Standard Template Library (STL)**:
1. std::vector:
   - Dynamic resizable array stored contiguously in heap memory.
   - O(1) random index access (vec[i]), amortized O(1) insertion at the back (push_back()).
   - Always prefer vector by default due to high CPU cache locality!
2. std::map vs std::unordered_map:
   - std::map: Implemented as a Self-Balancing Red-Black Binary Search Tree. Elements are ALWAYS automatically kept SORTED by key! Search, insertion, and deletion are guaranteed O(log N).
   - std::unordered_map: Implemented as a Hash Table. Keys are unsorted, but average lookup time is O(1) constant time!
3. std::set: Stores unique elements only.`,
    hinglish_explanation: `C me dynamic array banane ke liye malloc aur realloc ka jhanjhat hota tha.
C++ me **STL (Standard Template Library)** ne pre-built powerful containers diye hain:
1. std::vector:
   - Dynamic array jo zaroorat padne par apne aap bada ho jata hai.
   - vec.push_back(10) se naye elements judte hain. Iska memory ek sath (contiguous) hota hai, isliye ye CPU ke liye super fast hai!
2. std::map vs std::unordered_map:
   - std::map: Ye Red-Black Tree use karta hai. Isme saare keys hamesha SORTED rehte hain (A to Z ya 1 to 100). Dhoondne me O(log N) time lagta hai.
   - std::unordered_map: Ye Hash Table use karta hai. Isme sorting nahi hoti, lekin dhoondna O(1) super fast hota hai!`,
    why_it_matters: 'Selecting the wrong container (e.g. std::list instead of std::vector) degrades performance by up to 10x due to CPU cache misses.',
    when_to_use: 'Use std::vector for 90% of collections. Use std::unordered_map when you need ultra-fast O(1) key-value lookups. Use std::map when you need sorted keys or range queries.',
    syntax_guide: {
      template: '#include <vector>\n#include <unordered_map>\n\nstd::vector<int> nums = {1, 2, 3};\nnums.push_back(4);\nstd::unordered_map<std::string, int> ages;\nages["Alice"] = 25;',
      components: [
        { name: 'std::vector<T>', role: 'Dynamic contiguous array template', required: false },
        { name: 'std::unordered_map<K, V>', role: 'Hash table key-value associative container', required: false },
        { name: 'reserve()', role: 'Pre-allocates capacity to prevent repeated reallocations', required: false }
      ],
      rules: ['vector iterators are invalidated when reallocation occurs during push_back', 'unordered_map keys must provide a hash function and equality operator']
    },
    code_example_1_title: 'Basic Foundational: Dynamic Vector Operations and Capacity',
    code_example_1_code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores;
    scores.reserve(5); // Pre-allocates heap memory to prevent reallocations

    scores.push_back(88);
    scores.push_back(95);
    scores.push_back(79);

    std::cout << "Vector size    : " << scores.size() << "\\n";
    std::cout << "Vector capacity: " << scores.capacity() << "\\n";

    std::cout << "Elements: ";
    for (int score : scores) {
        std::cout << score << " ";
    }
    std::cout << "\\n";
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates std::vector initialization, reserve() optimization, and modern range-based for loop iteration.',
    code_example_1_output: `Vector size    : 3
Vector capacity: 5
Elements: 88 95 79`,

    code_example_2_title: 'Intermediate Logic: Sorted std::map vs Fast std::unordered_map',
    code_example_2_code: `#include <iostream>
#include <map>
#include <unordered_map>
#include <string>

int main() {
    // 1. std::map: Auto-sorted by key (Red-Black Tree)
    std::map<std::string, int> sortedRanks;
    sortedRanks["Charlie"] = 3;
    sortedRanks["Alice"] = 1;
    sortedRanks["Bob"] = 2;

    std::cout << "--- std::map (Sorted Alphabetically) ---\\n";
    for (const auto &[name, rank] : sortedRanks) {
        std::cout << name << " -> Rank " << rank << "\\n";
    }

    // 2. std::unordered_map: O(1) lookup speed
    std::unordered_map<std::string, int> fastLookup;
    fastLookup["port"] = 8080;
    std::cout << "\\nFast lookup port: " << fastLookup["port"] << "\\n";

    return 0;
}`,
    code_example_2_explanation: 'Proves std::map automatically sorts entries by key, while std::unordered_map optimizes for O(1) lookup.',
    code_example_2_output: `--- std::map (Sorted Alphabetically) ---
Alice -> Rank 1
Bob -> Rank 2
Charlie -> Rank 3

Fast lookup port: 8080`,

    code_example_3_title: 'Practical Application: High-Throughput Packet Frequency Counter',
    code_example_3_code: `#include <iostream>
#include <unordered_map>
#include <map>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> incomingLogs = {
        "AUTH_SUCCESS", "PAGE_NOT_FOUND", "AUTH_SUCCESS", "SERVER_ERROR", "AUTH_SUCCESS"
    };

    std::unordered_map<std::string, int> frequencyTable;
    for (const auto &log : incomingLogs) {
        frequencyTable[log]++;
    }

    // unordered_map iteration order is unspecified, so copy into
    // std::map (sorted by key) for a deterministic report.
    std::map<std::string, int> sortedTable(frequencyTable.begin(), frequencyTable.end());

    std::cout << "Telemetry Frequency Summary:\\n";
    for (const auto &[event, count] : sortedTable) {
        std::cout << "Event [" << event << "]: " << count << " occurrences\\n";
    }
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates real-world telemetry aggregation using std::unordered_map counting event frequencies in linear O(N) time. Because unordered_map iteration order is unspecified, the report copies into std::map for deterministic sorted output.',
    code_example_3_output: `Telemetry Frequency Summary:
Event [AUTH_SUCCESS]: 3 occurrences
Event [PAGE_NOT_FOUND]: 1 occurrences
Event [SERVER_ERROR]: 1 occurrences`,

    code_walkthrough: {
      code: `std::vector<int> v = {10, 20};\nv.push_back(30);\nstd::cout << v[2];`,
      steps: [
        { line: 1, explanation: 'Allocates dynamic array on heap with elements 10 and 20.', state: 'Heap: [10, 20]' },
        { line: 2, explanation: 'push_back appends 30 to end, expanding capacity if needed.', state: 'Heap: [10, 20, 30]' },
        { line: 3, explanation: 'Accesses index 2 directly in O(1) time and prints 30.', state: 'Stdout: 30' }
      ],
      output: '30',
      output_reasoning: 'Index 2 corresponds to the third element (30).'
    },

    rules_and_restrictions: [
      'Accessing vector with [] does not check bounds; use v.at(index) if you want out-of-range exception safety',
      'Modifying a vector during range-based iteration causes iterator invalidation bugs'
    ],
    common_mistakes: [
      {
        title: 'Using operator[] on map for read-only lookups',
        incorrect_code: `if (myMap["missingKey"] == 5) { ... }`,
        explanation: 'operator[] on std::map automatically INSERTS a default-constructed value if the key does not exist! This mutates the map during read checks.',
        corrected_code: `if (myMap.find("missingKey") != myMap.end()) { ... }`,
        error_message: 'Unintended map insertion side effect',
        debug_tip: 'Use map.find() or map.contains() (C++20) for read-only key existence checks.'
      }
    ],
    comparison_table: {
      title: 'std::vector vs std::list vs std::unordered_map',
      concept_a: 'std::vector',
      concept_b: 'std::unordered_map',
      headers: ['Container', 'Internal Structure', 'Access Complexity', 'Search by Key'],
      rows: [
        ['std::vector', 'Contiguous dynamic array', 'O(1) by index', 'O(N) linear scan'],
        ['std::list', 'Doubly linked list', 'O(N) pointer traversal', 'O(N) linear scan'],
        ['std::unordered_map', 'Hash table with buckets', 'N/A', 'O(1) average constant time']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Game engine entity component systems (vectors of components for cache speed)',
      'High-frequency trading order matching engines utilizing unordered maps'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which STL container provides O(1) average time complexity for key-based lookups?',
        options: ['std::vector', 'std::list', 'std::map', 'std::unordered_map'],
        correct_index: 3,
        explanation: 'std::unordered_map uses a hash table internally, offering O(1) average constant time complexity for key lookups.'
      }
    ],
    key_takeaways: [
      'std::vector is the default choice for dynamic sequences due to CPU cache locality.',
      'std::map keeps keys ordered (O(log N)); std::unordered_map is hashed (O(1)).',
      'Use reserve() with vectors to eliminate redundant memory reallocations.'
    ],
    quick_revision_notes: 'vector: dynamic array O(1) index. map: Red-Black tree (sorted, O(log N)). unordered_map: Hash table (O(1)). reserve() pre-allocates.',
    assignment_prompt: 'Write a C++ program that populates a std::vector with numbers 5, 10, 15, calculates the total sum using a range-based loop, and prints it.',
    assignment_starter_code: `#include <iostream>
#include <vector>

int main() {
    // Populate vector and print sum
    return 0;
}`,
    assignment_solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {5, 10, 15};
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    std::cout << "Sum: " << total << std::endl;
    return 0;
}`
  },

  // 2. C++ Inheritance and Polymorphism
  {
    id: 'cpp-inheritance-polymorphism',
    course_id: 'cpp',
    unit_id: 'cpp-unit-1',
    title: 'Inheritance and Virtual Polymorphism',
    description: 'Master Object-Oriented C++: Base and Derived classes, access specifiers, virtual functions, vtable mechanics, and abstract interfaces.',
    order_index: 4,
    learning_objectives: [
      'Understand Base class inheritance and public/protected/private access rules',
      'Master dynamic dispatch and runtime polymorphism using virtual functions',
      'Learn how the virtual table (vtable) and virtual pointer (vptr) work under the hood'
    ],
    prerequisites: ['Classes, Objects, and Encapsulation'],
    expected_outcomes: ['Able to design extensible polymorphic class hierarchies with virtual destructors to prevent memory leaks'],
    formal_definition: 'Inheritance enables a derived class to acquire the properties and methods of a base class. Runtime polymorphism is the ability of different classes in an inheritance hierarchy to respond to the same member function call via dynamic dispatch mediated by a vtable.',
    content_simple_english: `When building software systems, you often have generic concepts with specialized variations. For example, a Vehicle can be a Car, a Boat, or an Airplane.
C++ models this with **Inheritance**:
- Base Class: class Shape { ... }
- Derived Class: class Circle : public Shape { ... } (Circle inherits all public members of Shape).

The Magic of Polymorphism & virtual:
If you have a pointer to a Base class (Shape *ptr), and you call ptr->draw(), which draw() function runs?
- WITHOUT virtual: C++ decides at COMPILE TIME (Static Binding) and runs Shape::draw(), IGNORING that the actual object is a Circle!
- WITH virtual: C++ uses RUNTIME DYNAMIC DISPATCH! It checks the object's internal **vptr** (virtual pointer) pointing to the **vtable** (virtual table) and calls Circle::draw()!

CRITICAL RULE: Virtual Destructors:
Whenever a class has virtual functions, its destructor MUST be declared virtual (~Shape())! Otherwise, deleting a derived object through a base pointer causes undefined behavior and memory leaks!`,
    hinglish_explanation: `OOP ka sabse powerful concept hai **Inheritance aur Polymorphism**:
1. Inheritance: Ek Parent (Base) class ki properties ko Child (Derived) class me use karna.
   Jaise Animal ek Parent hai, aur Dog ek Child hai jo Animal ki khasiyat le leta hai.

2. Polymorphism (Ek naam, alag kaam):
   Agar hum Parent class ka pointer banayein: Shape *s = new Circle();
   Aur call karein s->draw();
   Toh C++ ko kaise pata chale ki Circle ka draw chalana hai ya Shape ka?
   - Agar function ke aage **virtual** nahi lagaya, toh C++ Parent ka draw() chala dega (compile time binding).
   - Agar function ke aage **virtual** lagaya, toh C++ runtime pe check karega ki asli object kiska hai (Circle ka), aur Circle ka draw() chalayega!

Sabse zaroori niyam: **Virtual Destructor**:
Agar Parent class me virtual functions hain, toh uske destructor ke aage bhi virtual (~Parent()) lagana zaroori hai, warna child class ki memory leak ho jayegi!`,
    why_it_matters: 'Runtime polymorphism is the foundation of extensible enterprise software, GUI frameworks, game engines, and driver plugin architectures.',
    when_to_use: 'Use inheritance for genuine "is-a" relationships (Dog is an Animal). Always use virtual destructors in base classes meant to be inherited.',
    syntax_guide: {
      template: 'class Base {\npublic:\n    virtual void speak() = 0; // Pure virtual (Abstract)\n    virtual ~Base() {}        // Mandatory virtual destructor\n};\nclass Derived : public Base {\npublic:\n    void speak() override { ... }\n};',
      components: [
        { name: 'virtual', role: 'Enables dynamic dispatch via vtable', required: true },
        { name: 'override', role: 'Compiler check ensuring member function overrides a base virtual method', required: true },
        { name: '= 0', role: 'Declares pure virtual function making class abstract', required: false }
      ],
      rules: ['Always mark base class destructors virtual', 'Use override keyword on derived methods to catch signature typos']
    },
    code_example_1_title: 'Basic Foundational: Virtual Functions and Dynamic Dispatch',
    code_example_1_code: `#include <iostream>

class Animal {
public:
    virtual void makeSound() const {
        std::cout << "Generic animal sound\\n";
    }
    virtual ~Animal() {} // Virtual destructor
};

class Dog : public Animal {
public:
    void makeSound() const override {
        std::cout << "Dog barks: Woof! Woof!\\n";
    }
};

int main() {
    Animal *pet = new Dog(); // Base pointer to Derived object
    pet->makeSound();        // Dynamic dispatch calls Dog::makeSound()

    delete pet; // Clean virtual destruction
    return 0;
}`,
    code_example_1_explanation: 'Demonstrates virtual keyword enabling runtime dispatch: pet->makeSound() calls Dog::makeSound() instead of Animal::makeSound().',
    code_example_1_output: 'Dog barks: Woof! Woof!',

    code_example_2_title: 'Intermediate Logic: Abstract Class Interface with Pure Virtual Function',
    code_example_2_code: `#include <iostream>

// Abstract Interface (cannot be instantiated directly)
class PaymentGateway {
public:
    virtual void processPayment(double amount) = 0; // Pure virtual
    virtual ~PaymentGateway() {}
};

class StripeGateway : public PaymentGateway {
public:
    void processPayment(double amount) override {
        std::cout << "Processing Stripe charge: $" << amount << "\\n";
    }
};

int main() {
    StripeGateway stripe;
    PaymentGateway &gateway = stripe;
    gateway.processPayment(150.0);
    return 0;
}`,
    code_example_2_explanation: 'Demonstrates an abstract class defining a contract (= 0) and derived implementation verified by override keyword.',
    code_example_2_output: 'Processing Stripe charge: $150',

    code_example_3_title: 'Practical Application: Game Engine Entity Polymorphic Render Fleet',
    code_example_3_code: `#include <iostream>
#include <vector>
#include <memory>

class Renderable {
public:
    virtual void render() const = 0;
    virtual ~Renderable() {}
};

class Player : public Renderable {
public:
    void render() const override { std::cout << "Rendering Player Character at (10, 20)\\n"; }
};

class Enemy : public Renderable {
public:
    void render() const override { std::cout << "Rendering Enemy Boss at (50, 80)\\n"; }
};

int main() {
    std::vector<std::unique_ptr<Renderable>> world;
    world.push_back(std::make_unique<Player>());
    world.push_back(std::make_unique<Enemy>());

    for (const auto &entity : world) {
        entity->render(); // Polymorphic invocation on each entity
    }
    return 0;
}`,
    code_example_3_explanation: 'Demonstrates modern C++ polymorphic ownership using std::unique_ptr and smart pointers managing entity rendering.',
    code_example_3_output: `Rendering Player Character at (10, 20)
Rendering Enemy Boss at (50, 80)`,

    code_walkthrough: {
      code: `Animal *a = new Dog();\na->makeSound();\ndelete a;`,
      steps: [
        { line: 1, explanation: 'Dog instance allocated on heap; vptr initialized to Dog vtable.', state: 'Heap Dog allocated' },
        { line: 2, explanation: 'vptr dereferenced to find Dog::makeSound offset; invokes Dog implementation.', state: 'Dynamic Dispatch' },
        { line: 3, explanation: 'Virtual destructor executes Dog destructor first, then Animal destructor.', state: 'Heap freed cleanly' }
      ],
      output: 'Dog barks',
      output_reasoning: 'vtable dynamic dispatch invokes Dog::makeSound at runtime.'
    },

    rules_and_restrictions: [
      'Base classes designed for polymorphic deletion MUST have virtual destructors',
      'Abstract classes containing at least one pure virtual function cannot be directly instantiated'
    ],
    common_mistakes: [
      {
        title: 'Non-virtual destructor in polymorphic base class',
        incorrect_code: `class Base {\n    ~Base() {} // NOT virtual!\n};\nBase *b = new Derived();\ndelete b; // LEAKS derived members!`,
        explanation: 'Without virtual destructor, deleting through Base * only calls ~Base(), completely skipping ~Derived() and leaking its allocated resources.',
        corrected_code: `virtual ~Base() {}`,
        error_message: 'Undefined behavior and derived resource leaks',
        debug_tip: 'Always declare base class destructors virtual.'
      }
    ],
    comparison_table: {
      title: 'Static Binding vs Dynamic Binding',
      concept_a: 'Static Binding (Non-Virtual)',
      concept_b: 'Dynamic Binding (Virtual)',
      headers: ['Feature', 'Static Binding', 'Dynamic Binding'],
      rows: [
        ['Resolution Time', 'Compile time (based on pointer type)', 'Runtime (based on actual pointed object)'],
        ['Overhead', 'Zero runtime overhead (direct jump)', '1 pointer dereference (vptr -> vtable)'],
        ['Keyword', 'Standard member function', 'virtual keyword in base class'],
        ['Extensibility', 'Inflexible (cannot override behavior via base pointer)', 'Highly extensible (supports plugin architectures)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'GUI widget component trees (Button, Slider inheriting from Widget)',
      'Cross-platform audio/graphics backend hardware driver abstractions'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the purpose of the virtual keyword on a base class destructor in C++?',
        options: [
          'To make the class abstract',
          'To ensure the derived class destructor is called when deleting through a base pointer',
          'To speed up object destruction',
          'To prevent destruction of the object'
        ],
        correct_index: 1,
        explanation: 'Declaring a virtual destructor guarantees that the derived class destructor is invoked first when an object is destroyed through a base class pointer, preventing memory leaks.'
      }
    ],
    key_takeaways: [
      'virtual enables dynamic runtime dispatch via the vtable.',
      'Pure virtual functions (= 0) define abstract interfaces.',
      'Always use virtual destructors in polymorphic base classes.'
    ],
    quick_revision_notes: 'virtual func(): runtime dispatch via vtable. = 0: pure virtual. override: compiler check. virtual ~Base(): avoids memory leaks.',
    assignment_prompt: 'Define an abstract class Shape with pure virtual double area() = 0, implement a derived Square class with side length, and calculate area in main.',
    assignment_starter_code: `#include <iostream>

// Define Shape and Square
int main() {
    return 0;
}`,
    assignment_solution: `#include <iostream>

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() {}
};

class Square : public Shape {
private:
    double side;
public:
    Square(double s) : side(s) {}
    double area() const override {
        return side * side;
    }
};

int main() {
    Square sq(5.0);
    std::cout << "Square Area: " << sq.area() << std::endl;
    return 0;
}`
  },

  // 3. Python NumPy Basics
  {
    id: 'py-numpy-basics',
    course_id: 'python',
    unit_id: 'py-unit-2',
    title: 'NumPy: Fast Vectorized Numerical Computing',
    description: 'Master high-performance numerical computing in Python: ndarray creation, shapes, slicing, vectorized arithmetic, broadcasting, and axis reductions.',
    order_index: 3,
    learning_objectives: [
      'Understand why NumPy ndarrays execute 50-100x faster than standard Python lists',
      'Master ndarray creation, data types (dtype), dimensions (shape), and slicing',
      'Learn array broadcasting rules and axis-based mathematical reductions (sum, mean, max)'
    ],
    prerequisites: ['Variables, Dynamic Typing, and Data Types', 'Conditionals, Pattern Matching & Loops'],
    expected_outcomes: ['Able to write vectorized numerical algorithms without slow Python for-loops'],
    formal_definition: 'NumPy (Numerical Python) is the foundational package for scientific computing in Python, providing a multidimensional homogeneous array object (ndarray), broadcasting functions, and compiled C-level vector execution.',
    content_simple_english: `In pure Python, a list is an array of pointers pointing to scattered heap objects. If you add 1 to every number in a 1,000,000-element list using a for-loop, Python has to unpack every object, look up its type, and execute slow dynamic bytecode.

NumPy changes everything:
1. Contiguous C Memory: A NumPy ndarray stores raw numbers sequentially in one contiguous memory block with zero object overhead.
2. Vectorization: Instead of writing for-loops, operations execute on entire arrays simultaneously via compiled C code: arr + 5 adds 5 to all elements in milliseconds!
3. Broadcasting: NumPy automatically expands smaller arrays to match the shape of larger arrays during arithmetic!
4. Axis Reductions:
   - axis=0: Computes along columns (downwards).
   - axis=1: Computes along rows (across).`,
    hinglish_explanation: `Normal Python lists me har number ek alag object hota hai jo RAM me idhar-udhar bikhra rehta hai. Agar 10 lakh numbers ko loop me add karoge, toh Python bohot slow chalega.

NumPy isko rocket bana deta hai (50x fast!):
1. ndarray: Saare numbers ek sath C language ke continuous memory block me store hote hain.
2. Vectorization (Bina loop ke kaam):
   Aapko loop likhne ki zaroorat nahi hai! Bas likho arr * 2 — aur 10 lakh numbers ek millisecond me double ho jayenge!
3. Broadcasting: Agar aap ek bade array me ek chota number add karoge (arr + 10), toh NumPy us 10 ko poore array me apne aap spread kar dega.
4. Axis:
   - axis=0: Upar se neeche (Columns) ka total nikalna.
   - axis=1: Left se right (Rows) ka total nikalna.`,
    why_it_matters: 'NumPy is the bedrock of the entire AI/Data Science ecosystem (Pandas, PyTorch, TensorFlow, Scikit-Learn).',
    when_to_use: 'Use NumPy whenever you process matrices, scientific data, image pixels, or numerical datasets exceeding 1,000 values.',
    syntax_guide: {
      template: 'import numpy as np\n\narr = np.array([1, 2, 3], dtype=np.int32)\nmatrix = np.zeros((3, 3))\nvectorized = arr * 2\ncol_sum = matrix.sum(axis=0)',
      components: [
        { name: 'np.array()', role: 'Converts Python sequence into homogeneous ndarray', required: true },
        { name: 'shape', role: 'Tuple representing dimensions (e.g. (rows, cols))', required: true },
        { name: 'dtype', role: 'Specifies uniform numeric binary type (float64, int32)', required: false }
      ],
      rules: ['All elements in a NumPy ndarray must share the exact same data type', 'Broadcasting requires trailing dimensions to either match or equal 1']
    },
    code_example_1_title: 'Basic Foundational: Vectorized Arithmetic vs Python Loops',
    code_example_1_code: `import numpy as np

# Create 1D array
arr = np.array([10, 20, 30, 40, 50])

# Vectorized operation: applied instantly to all elements without loops!
doubled = arr * 2
squared = arr ** 2

print("Original Array:", arr)
print("Doubled Array :", doubled)
print("Squared Array :", squared)
print("Data type     :", arr.dtype)
print("Shape         :", arr.shape)`,
    code_example_1_explanation: 'Shows vectorized arithmetic syntax and inspecting array shape and dtype attributes.',
    code_example_1_output: `Original Array: [10 20 30 40 50]
Doubled Array : [ 20  40  60  80 100]
Squared Array : [ 100  400  900 1600 2500]
Data type     : int64
Shape         : (5,)`,

    code_example_2_title: 'Intermediate Logic: 2D Matrices and Axis Reductions',
    code_example_2_code: `import numpy as np

# Create a 2D matrix (3 rows x 4 columns)
matrix = np.array([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12]
])

print("Matrix Shape:", matrix.shape)
print("Total Sum   :", matrix.sum())
print("Column Sums (axis=0):", matrix.sum(axis=0))
print("Row Sums    (axis=1):", matrix.sum(axis=1))
print("Mean Value  :", matrix.mean())`,
    code_example_2_explanation: 'Demonstrates 2D matrix shape handling and axis-based mathematical reductions.',
    code_example_2_output: `Matrix Shape: (3, 4)
Total Sum   : 78
Column Sums (axis=0): [15 18 21 24]
Row Sums    (axis=1): [10 26 42]
Mean Value  : 6.5`,

    code_example_3_title: 'Practical Application: Normalizing Feature Matrix for Machine Learning',
    code_example_3_code: `import numpy as np

# Machine Learning feature matrix: 3 samples x 2 features (e.g. Age, Income)
raw_features = np.array([
    [25.0, 50000.0],
    [35.0, 80000.0],
    [45.0, 110000.0]
])

# Min-Max Normalization: (X - min) / (max - min)
col_min = raw_features.min(axis=0)
col_max = raw_features.max(axis=0)

# Broadcasting automatically normalizes each column!
normalized = (raw_features - col_min) / (col_max - col_min)

print("--- ML Feature Normalization ---")
print("Normalized Features (Scale 0.0 to 1.0):\\n", np.round(normalized, 2))`,
    code_example_3_explanation: 'Demonstrates real-world ML feature scaling leveraging broadcasting across columns.',
    code_example_3_output: `--- ML Feature Normalization ---
Normalized Features (Scale 0.0 to 1.0):
 [[0.  0. ]
 [0.5 0.5]
 [1.  1. ]]`,

    code_walkthrough: {
      code: `a = np.array([1, 2]); b = a * 10; print(b[0])`,
      steps: [
        { line: 1, explanation: 'Allocates C-contiguous memory block with 64-bit integers [1, 2].', state: 'ndarray a allocated' },
        { line: 1, explanation: 'Compiled SIMD vector multiply scales every element by 10.', state: 'ndarray b = [10, 20]' },
        { line: 1, explanation: 'Prints first element: 10.', state: 'Stdout: 10' }
      ],
      output: '10',
      output_reasoning: 'First element 1 multiplied by 10 is 10.'
    },

    rules_and_restrictions: [
      'NumPy arrays cannot contain heterogeneous data types without falling back to slow object dtype',
      'Assigning a slice a[:] = 0 mutates the original array in-place because NumPy slices are views, NOT copies'
    ],
    common_mistakes: [
      {
        title: 'Assuming NumPy slices create independent copies',
        incorrect_code: `b = a[:2]\nb[0] = 99 # MODIFIES ORIGINAL ARRAY a TOO!`,
        explanation: 'Unlike Python lists, NumPy slicing returns a VIEW of the same memory buffer to save RAM. Mutating the slice mutates the parent array.',
        corrected_code: `b = a[:2].copy() # Explicit deep copy`,
        error_message: 'Accidental parent array corruption',
        debug_tip: 'Call .copy() if you need an independent copy of a NumPy slice.'
      }
    ],
    comparison_table: {
      title: 'Python List vs NumPy ndarray',
      concept_a: 'Python List',
      concept_b: 'NumPy ndarray',
      headers: ['Feature', 'Python List', 'NumPy ndarray'],
      rows: [
        ['Memory Layout', 'Scattered pointers to heap PyObjects', 'Single contiguous C-level memory buffer'],
        ['Data Types', 'Heterogeneous (can mix int, str, dict)', 'Strictly homogeneous (all same dtype)'],
        ['Speed', 'Slow interpreted loops', 'Fast vectorized SIMD C execution (50x faster)'],
        ['Math Operations', 'list * 2 duplicates list items', 'arr * 2 multiplies every number by 2']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Image processing where 1080p frames are represented as (1080, 1920, 3) byte arrays',
      'Training neural network weights in PyTorch and TensorFlow'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which axis parameter calculates the sum across columns (reducing rows downwards) in a 2D NumPy array?',
        options: ['axis=0', 'axis=1', 'axis=-1', 'axis=None'],
        correct_index: 0,
        explanation: 'In NumPy 2D arrays, axis=0 operates downwards along columns, producing a sum for each column.'
      }
    ],
    key_takeaways: [
      'NumPy ndarrays store data contiguously in C memory for maximum performance.',
      'Vectorization replaces slow Python loops with compiled C execution.',
      'Slices in NumPy are views; use .copy() to clone data.'
    ],
    quick_revision_notes: 'np.array(data). Vectorized: arr * 2. shape = (rows, cols). axis=0 is columns, axis=1 is rows. Slices are views (.copy() for clone).',
    assignment_prompt: 'Write a Python snippet using NumPy to create an array of numbers from 1 to 5, multiply each by 3, and print the resulting array.',
    assignment_starter_code: `import numpy as np

# Create array 1 to 5 and multiply by 3`,
    assignment_solution: `import numpy as np

arr = np.array([1, 2, 3, 4, 5])
result = arr * 3
print("Resulting Array:", result)`
  },

  // 4. Python Pandas Data Analysis
  {
    id: 'py-pandas-data-analysis',
    course_id: 'python',
    unit_id: 'py-unit-2',
    title: 'Pandas: DataFrames and Data Manipulation',
    description: 'Master tabular data analysis with Pandas: Series, DataFrames, loc/iloc indexing, boolean masking, missing value imputation, and groupby aggregations.',
    order_index: 4,
    learning_objectives: [
      'Understand the core Pandas data structures: 1D Series and 2D DataFrame',
      'Master label-based indexing (.loc) vs integer position-based indexing (.iloc)',
      'Clean datasets (handling nulls with dropna/fillna) and perform groupby aggregations'
    ],
    prerequisites: ['NumPy: Fast Vectorized Numerical Computing'],
    expected_outcomes: ['Able to load, clean, filter, and aggregate real-world CSV tabular datasets for production analytics'],
    formal_definition: 'Pandas is a fast, powerful, and flexible open-source data analysis and manipulation library built on top of NumPy, providing labeled 2D data structures known as DataFrames.',
    content_simple_english: `While NumPy is fantastic for raw numerical matrices, real-world data has column headers, timestamps, customer names, and missing values.
**Pandas** provides tabular data superpowers:
1. Series: A 1-dimensional labeled array (like a single column).
2. DataFrame: A 2-dimensional labeled table with rows and columns (just like an Excel sheet or SQL table!).
3. Indexing:
   - .loc[row_label, col_label]: Label-based selection (e.g. df.loc[0, "Name"]).
   - .iloc[row_idx, col_idx]: Pure integer position-based selection (e.g. df.iloc[0, 1]).
4. Filtering: Use boolean masks: active_users = df[df["status"] == "active"].
5. GroupBy: Group rows by category and compute summary metrics: df.groupby("department")["salary"].mean().`,
    hinglish_explanation: `NumPy sirf numbers ke liye achha tha, lekin real life me data me logo ke naam, emails, dates aur khali (missing) cells hote hain (jaise Excel sheet ya SQL table).
Iske liye hum **Pandas** use karte hain:
1. DataFrame: Poori ek Excel sheet jisme Rows aur Columns hote hain.
2. Indexing:
   - .loc: Naam se dhoondna (jaise df.loc[:, "Salary"]).
   - .iloc: Position number se dhoondna (jaise df.iloc[0, 2] = pehli row, teesra column).
3. Filtering:
   df[df["age"] >= 18] — ek line me saare adults filter ho jate hain!
4. GroupBy:
   Departments ke hisaab se average salary nikalna: df.groupby("dept")["salary"].mean().`,
    why_it_matters: 'Pandas is the industry-standard data analysis library used by data scientists, quantitative financial analysts, and backend engineers worldwide.',
    when_to_use: 'Use Pandas whenever working with tabular data (CSVs, Excel files, SQL query outputs) requiring cleaning, transformation, and aggregation.',
    syntax_guide: {
      template: 'import pandas as pd\n\ndf = pd.DataFrame({"Name": ["Alex", "Sam"], "Age": [25, 30]})\nfiltered = df[df["Age"] > 20]\ngrouped = df.groupby("Name")["Age"].mean()',
      components: [
        { name: 'pd.DataFrame()', role: 'Creates 2D labeled data frame', required: true },
        { name: '.loc', role: 'Label-based row/column selector', required: false },
        { name: '.iloc', role: 'Integer position-based row/column selector', required: false }
      ],
      rules: ['Always check for null values using df.isna().sum() before running aggregations', 'Avoid iterating over rows with for-loops; use vectorized operations or .apply()']
    },
    code_example_1_title: 'Basic Foundational: Creating and Inspecting a DataFrame',
    code_example_1_code: `import pandas as pd

# Creating a DataFrame from a dictionary
data = {
    "StudentID": [101, 102, 103],
    "Name": ["Alex", "Sara", "Bob"],
    "Score": [92, 85, 78]
}

df = pd.DataFrame(data)

print("--- Students DataFrame ---")
print(df)
print("\\nDataFrame Shape:", df.shape)
print("Summary Statistics:\\n", df["Score"].describe())`,
    code_example_1_explanation: 'Demonstrates creating a DataFrame and calculating descriptive statistical metrics on numerical columns.',
    code_example_1_output: `--- Students DataFrame ---
   StudentID  Name  Score
0        101  Alex     92
1        102  Sara     85
2        103   Bob     78

DataFrame Shape: (3, 3)
Summary Statistics:
 count     3.0
mean     85.0
std       7.0
min      78.0
25%      81.5
50%      85.0
75%      88.5
max      92.0
Name: Score, dtype: float64`,

    code_example_2_title: 'Intermediate Logic: Filtering, .loc, and Missing Values',
    code_example_2_code: `import pandas as pd
import numpy as np

records = pd.DataFrame({
    "Product": ["Laptop", "Mouse", "Keyboard", "Monitor"],
    "Price": [1200, 25, np.nan, 300],
    "InStock": [True, True, False, True]
})

print("Missing values count:\\n", records.isna().sum())

# Fill missing Price with median price
median_price = records["Price"].median()
records["Price"] = records["Price"].fillna(median_price)

# Boolean filtering: Available products under $500
affordable = records.loc[(records["InStock"] == True) & (records["Price"] < 500)]
print("\\nAffordable In-Stock Items:\\n", affordable[["Product", "Price"]])`,
    code_example_2_explanation: 'Shows handling missing values with fillna() and compound boolean filtering with .loc.',
    code_example_2_output: `Missing values count:
 Product    0
Price      1
InStock    0
dtype: int64

Affordable In-Stock Items:
    Product  Price
1    Mouse   25.0
3  Monitor  300.0`,

    code_example_3_title: 'Practical Application: Enterprise Department Salary Aggregation with GroupBy',
    code_example_3_code: `import pandas as pd

employees = pd.DataFrame({
    "Dept": ["Engineering", "Sales", "Engineering", "Sales", "HR"],
    "Employee": ["Alice", "Bob", "Charlie", "Diana", "Evan"],
    "Salary": [120000, 85000, 140000, 92000, 75000]
})

# Group by department and compute head count and average salary
analytics = employees.groupby("Dept").agg(
    HeadCount=("Employee", "count"),
    AvgSalary=("Salary", "mean"),
    MaxSalary=("Salary", "max")
).reset_index()

print("--- Department Salary Analytics ---")
print(analytics.to_string(index=False))`,
    code_example_3_explanation: 'Demonstrates enterprise analytics using groupby and named multi-column aggregations.',
    code_example_3_output: `--- Department Salary Analytics ---
       Dept  HeadCount  AvgSalary  MaxSalary
Engineering          2   130000.0     140000
         HR          1    75000.0      75000
      Sales          2    88500.0      92000`,

    code_walkthrough: {
      code: `df = pd.DataFrame({'a':[1,2]}); df['b'] = df['a'] * 2; print(df['b'].iloc[0])`,
      steps: [
        { line: 1, explanation: 'DataFrame created with column \'a\' holding [1, 2].', state: 'df[\'a\'] = [1, 2]' },
        { line: 1, explanation: 'Vectorized column creation assigns [2, 4] to column \'b\'.', state: 'df[\'b\'] = [2, 4]' },
        { line: 1, explanation: 'iloc[0] retrieves integer offset 0 of column \'b\', printing 2.', state: 'Stdout: 2' }
      ],
      output: '2',
      output_reasoning: 'First element of column \'b\' is 1 * 2 = 2.'
    },

    rules_and_restrictions: [
      'In compound boolean filters, wrap conditions in parentheses: (df["x"] > 1) & (df["y"] < 5)',
      'Never iterate over DataFrame rows using standard for-loops; use vectorized methods or .apply()'
    ],
    common_mistakes: [
      {
        title: 'Forgetting parentheses in compound boolean masks',
        incorrect_code: `df[df["A"] > 0 & df["B"] < 10] # SyntaxError due to operator precedence!`,
        explanation: 'Bitwise & has higher precedence than comparison operators (>). Without parentheses, Python evaluates 0 & df["B"] first.',
        corrected_code: `df[(df["A"] > 0) & (df["B"] < 10)]`,
        error_message: 'TypeError: cannot compare a dtyped [float64] array with a scalar of type [bool]',
        debug_tip: 'Always wrap each individual condition in parentheses when filtering DataFrames.'
      }
    ],
    comparison_table: {
      title: '.loc vs .iloc in Pandas',
      concept_a: '.loc (Label-based)',
      concept_b: '.iloc (Integer position-based)',
      headers: ['Aspect', '.loc', '.iloc'],
      rows: [
        ['Indexing Method', 'By row/column labels or boolean series', 'By integer position index (0 to N-1)'],
        ['End Slice Boundary', 'INCLUSIVE of endpoint', 'EXCLUSIVE of endpoint (standard Python slice)'],
        ['Example', 'df.loc[0:2, "Price"] (includes label 2)', 'df.iloc[0:2, 1] (excludes index 2)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Financial risk analytics modeling loan defaults from customer transaction logs',
      'ETL data transformation pipelines cleaning customer database tables before warehousing'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which Pandas indexer selects data by exact integer position rather than label?',
        options: ['.loc', '.iloc', '.at', '.ix'],
        correct_index: 1,
        explanation: '.iloc selects rows and columns by their integer position (0-based indexing).'
      }
    ],
    key_takeaways: [
      'DataFrames are labeled 2D tables with fast columnar operations.',
      'Use .loc for labels and .iloc for integer positions.',
      'Handle missing values using .isna(), .fillna(), or .dropna().'
    ],
    quick_revision_notes: 'DataFrame: pd.DataFrame(data). .loc[labels], .iloc[ints]. Filter: df[(cond1) & (cond2)]. GroupBy: df.groupby("col").mean().',
    assignment_prompt: 'Write a Pandas snippet creating a DataFrame of 3 products and their prices, filter items with Price > 100, and print the resulting DataFrame.',
    assignment_starter_code: `import pandas as pd

# Create DataFrame and filter Price > 100`,
    assignment_solution: `import pandas as pd

df = pd.DataFrame({
    "Product": ["Keyboard", "Mouse", "Monitor"],
    "Price": [120, 25, 300]
})

expensive = df[df["Price"] > 100]
print(expensive)`
  }
];

module.exports = { finalFourTopics };
