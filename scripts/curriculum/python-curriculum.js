/**
 * Code Nexus — Comprehensive Python Curriculum
 * Master topic definitions for Python Track
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createControlFlowSvg } = require('./diagrams');

const pythonTopics = [
  {
    id: 'py-variables-datatypes',
    course_id: 'python',
    unit_id: 'py-unit-1',
    title: 'Variables, Dynamic Typing & Mutability',
    description: 'Master Python object references, dynamic typing, primitive types, and mutable vs immutable data models.',
    order_index: 1,
    learning_objectives: [
      'Understand how Python variables are name tags bound to objects in memory',
      'Master the distinction between Mutable and Immutable objects',
      'Understand id(), type(), and the difference between is and =='
    ],
    prerequisites: ['Basic computer literacy'],
    expected_outcomes: ['Able to explain Python memory model and avoid unintentional mutable object modification bugs'],
    formal_definition: 'In Python, variables are named references bound to objects in heap memory. Python is dynamically and strongly typed: object types are known at runtime, and incompatible operations (such as str + int) raise TypeError instead of guessing a conversion. Python still performs defined numeric promotions in suitable operations (for example, 10 + 22.0 produces the float 32.0), so strong typing does not mean “no implicit conversion anywhere.”',
    content_simple_english: `In languages like C or Java, a variable is a physical "box" in memory that holds a specific type of number or string. 
In Python, variables do not hold values directly. Instead, variables are **labels (name tags)** attached to objects floating in heap memory!

When you write x = 10, Python allocates an integer object with value 10 in memory, and attaches the label x to it. If you then write y = x, y is simply another label pointing to the EXACT same object 10!

Mutability:
1. Immutable Objects (Cannot be changed in-place): int, float, str, tuple, bool, frozenset. If you try to modify a string or number, Python creates a brand-new object in memory.
2. Mutable Objects (Can be modified in-place): list, dict, set, bytearray. When you append to a list, the original object in memory changes without changing its memory address (id)!`,
    hinglish_explanation: `C ya Java me variable ek dabba (box) hota hai jisme value rakhi hoti hai. Lekin Python me variable dabba nahi, balki ek **TAG (chits/label)** hota hai!

Jab aap x = [1, 2, 3] likhte hain, toh memory me ek list banti hai aur x us par chipak jata hai.
Agar aap y = x likhte hain, toh koi nayi list copy nahi hoti! Balki y bhi usi purani list par chipak jata hai.
Ab agar aap y.append(4) karenge, toh x ke andar bhi 4 dikhayi dega! Kyunki dono ek hi list ko point kar rahe the.

- Immutable (Jo badal na sake): int, float, str, tuple (Jaise string me kisi character ko direct change nahi kar sakte).
- Mutable (Jo badal sake): list, dict, set (Inme items add/remove ho sakte hain).`,
    why_it_matters: 'Failing to understand Python object references and mutability is the #1 cause of bugs when passing default arguments (e.g. def func(arr=[])) or making shallow copies of nested lists.',
    when_to_use: 'Use immutable tuples when data must remain constant throughout the program. Use mutable lists when building collections that grow and shrink dynamically.',
    syntax_guide: {
      template: 'x = 42              # int object bound to x\ns = "Code Nexus"    # str object (immutable)\nlst = [1, 2, 3]     # list object (mutable)\nis_same = (a is b)  # checks memory identity (id)',
      components: [
        { name: 'id(obj)', role: 'Returns the objects identity value, unique and constant during its lifetime (CPython uses its memory address as an implementation detail)', required: true },
        { name: 'is', role: 'Identity operator: checks if two variables point to exact same memory object', required: true },
        { name: '==', role: 'Equality operator: checks if values are equal, regardless of memory address', required: true }
      ],
      rules: ['Variable names cannot start with numbers', 'Python is strictly case-sensitive', 'Default function arguments are evaluated only once at definition time']
    },
    code_example_1_title: 'Basic Foundational: Dynamic Typing & id() Identity',
    code_example_1_code: `# Python variables dynamically bind to objects
data = 42
print(f"data is {type(data).__name__}, value = {data}, id = {id(data)}")

# Rebind data to a string
data = "Nexus Core"
print(f"data is {type(data).__name__}, value = {data}, id = {id(data)}")`,
    code_example_1_explanation: 'Shows dynamic rebinding: data initially refers to an integer object, and then is rebound to a different string object; the printed id() values are identities, not a portable promise about raw addresses.',
    code_example_1_output: `data is int, value = 42, id = <memory id — varies every run>
data is str, value = Nexus Core, id = <different memory id — varies every run>`,

    code_example_2_title: 'Intermediate Logic: The Mutable Aliasing Trap',
    code_example_2_code: `# Aliasing with mutable lists
list_a = [10, 20, 30]
list_b = list_a # list_b shares the exact same memory object!

print(f"Are list_a and list_b identical? {list_a is list_b}")

# Mutating list_b alters list_a!
list_b.append(40)
print(f"list_a after list_b.append: {list_a}")

# Safe shallow copy: creates a separate new list object
list_c = list_a.copy()
list_c.append(50)
print(f"list_a unchanged by list_c: {list_a}")
print(f"list_c independent list  : {list_c}")`,
    code_example_2_explanation: 'Demonstrates mutable list aliasing (list_b = list_a) vs creating an independent clone using .copy().',
    code_example_2_output: `Are list_a and list_b identical? True
list_a after list_b.append: [10, 20, 30, 40]
list_a unchanged by list_c: [10, 20, 30, 40]
list_c independent list  : [10, 20, 30, 40, 50]`,

    code_example_3_title: 'Practical Application: Telemetry Metric State Cache',
    code_example_3_code: `class TelemetryStore:
    def __init__(self):
        self._metrics = {}

    def record(self, key: str, value: float):
        if key not in self._metrics:
            self._metrics[key] = []
        self._metrics[key].append(value)

    def summary(self, key: str) -> dict:
        vals = self._metrics.get(key, [])
        if not vals:
            return {"count": 0, "avg": 0.0}
        return {"count": len(vals), "avg": sum(vals) / len(vals)}

store = TelemetryStore()
store.record("latency_ms", 12.4)
store.record("latency_ms", 14.8)
store.record("latency_ms", 11.2)
stats = store.summary("latency_ms")
print(f"Telemetry Summary: Count={stats['count']}, Avg={stats['avg']:.2f}ms")`,
    code_example_3_explanation: 'Demonstrates professional Python dictionary and list mutation inside an encapsulated telemetry state store.',
    code_example_3_output: 'Telemetry Summary: Count=3, Avg=12.80ms',

    code_walkthrough: {
      code: `a = [1, 2]\nb = a\nb.append(3)\nprint(len(a))`,
      steps: [
        { line: 1, explanation: 'Creates list object [1, 2] in heap; attaches label a.', state: 'a -> [1, 2]' },
        { line: 2, explanation: 'Attaches label b to the same list object.', state: 'a, b -> [1, 2]' },
        { line: 3, explanation: 'In-place append modifies the list object to [1, 2, 3].', state: 'a, b -> [1, 2, 3]' },
        { line: 4, explanation: 'len(a) evaluates to 3.', state: 'Stdout: 3' }
      ],
      output: '3',
      output_reasoning: 'Because a and b reference the exact same mutable list, modifying through b updates the shared object.'
    },

    rules_and_restrictions: [
      'Strings and tuples are immutable; assigning to an index (e.g. s[0] = "X") raises TypeError',
      'Never use mutable default arguments (def func(lst=[])) because the list is shared across calls',
      'Use is to check identity (especially for None: x is None); use == to check value equality'
    ],
    common_mistakes: [
      {
        title: 'Mutable Default Argument Gotcha',
        incorrect_code: `def add_item(val, items=[]):\n    items.append(val)\n    return items\n\nprint(add_item(1))\nprint(add_item(2)) # Prints [1, 2], NOT [2]!`,
        explanation: 'Default arguments in Python are evaluated once when the function is defined. The list persists across multiple function invocations.',
        corrected_code: `def add_item(val, items=None):\n    if items is None:\n        items = []\n    items.append(val)\n    return items`,
        error_message: 'Persistent state bug across distinct function calls',
        debug_tip: 'Always use None as default for optional collections: items=None, then initialize inside.'
      }
    ],
    comparison_table: {
      title: 'is vs == in Python',
      concept_a: 'is (Identity)',
      concept_b: '== (Equality)',
      headers: ['Feature', 'is Operator', '== Operator'],
      rows: [
        ['Check Type', 'Memory Identity (id(a) == id(b))', 'Value Equality (a.__eq__(b))'],
        ['Object Addresses', 'Must be exact same memory object', 'Can be different objects with equal contents'],
        ['Standard Usage', 'Checking singletons (x is None, x is True)', 'Checking data contents ([1, 2] == [1, 2])']
      ]
    },
    diagram_svg: createControlFlowSvg('Input', 'Mutable Type?', 'In-Place Mutate', 'New Object Rebind', 'Complete'),
    practical_applications: [
      'Data engineering pipelines handling streaming collections in memory',
      'High-throughput API request parsing and dictionary payload transformations'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which of the following data types in Python is MUTABLE?',
        options: ['tuple', 'string', 'list', 'frozenset'],
        correct_index: 2,
        explanation: 'Lists, dictionaries, and sets are mutable in Python. Tuples, strings, and integers are immutable.'
      }
    ],
    key_takeaways: [
      'Variables in Python are object references, not direct storage boxes.',
      'Immutable types (int, str, tuple) cannot be modified in place.',
      'Use .copy() or copy.deepcopy() when duplicating mutable structures.'
    ],
    quick_revision_notes: 'Python types: mutable (list, dict, set); immutable (int, float, str, tuple). is checks id(); == checks values. Use items=None for default arguments.',
    assignment_prompt: 'Write a Python function sanitize_list(items) that takes a list, creates a shallow copy, removes negative numbers, and returns the cleaned list without altering the original list.',
    assignment_starter_code: `def sanitize_list(items):
    # Return a new list containing only positive numbers and zero
    pass

numbers = [-5, 10, -2, 30, 0]
result = sanitize_list(numbers)
print("Cleaned:", result)
print("Original:", numbers)`,
    assignment_solution: `def sanitize_list(items):
    return [x for x in items if x >= 0]

numbers = [-5, 10, -2, 30, 0]
result = sanitize_list(numbers)
print("Cleaned:", result)
print("Original:", numbers)`
  },

  {
    id: 'py-conditionals-loops',
    course_id: 'python',
    unit_id: 'py-unit-1',
    title: 'Control Flow, Comprehensions & Iteration',
    description: 'Master if-elif-else, for loops, while loops, enumerate, zip, and high-performance list and dictionary comprehensions.',
    order_index: 2,
    learning_objectives: [
      'Master conditional branching and Python truthiness rules',
      'Learn idiomatic iteration with for, enumerate(), and zip()',
      'Write concise, expressive list and dictionary comprehensions'
    ],
    prerequisites: ['Variables, Dynamic Typing & Mutability'],
    expected_outcomes: ['Able to write clean, Pythonic loops and comprehensions instead of slow indexing loops'],
    formal_definition: 'Python control flow comprises conditional branching (if-elif-else) and iteration protocols (for, while, generators) evaluated sequentially based on boolean predicates and iterable object protocols.',
    content_simple_english: `Python eliminates boilerplates like semicolons and curly braces in favor of clean indentation:
1. if-elif-else: Conditional decisions. Python considers empty containers ([], {}, ""), 0, and None as False (Falsy). Everything else is True (Truthy)!
2. for loop: In Python, for is a "for-each" loop. It iterates over elements directly: for item in collection.
   - Use enumerate(collection) when you need both the index and the item!
   - Use zip(list_a, list_b) to loop through two lists in parallel.
3. Comprehensions: The signature feature of Python! Instead of writing 5 lines to filter and map a list, you can do it in one expressive line:
   squares = [x**2 for x in numbers if x % 2 == 0]`,
    hinglish_explanation: `Python me curly braces {} nahi hote, balki INDENTATION (spaces) se pata chalta hai ki kaunsa code kiske andar hai.

1. if-elif-else:
Python me khali cheezein jaise [], "", 0, aur None ko automatically False mana jata hai! Baaki sab True hote hain.
2. for loops:
Python me C jaisa i = 0; i < n; i++ likhne ki zaroorat nahi hoti. Direct likhte hain: for item in fruits.
Agar index bhi chahiye, toh enumerate() use karte hain: for i, val in enumerate(fruits).
3. List Comprehensions:
Ye Python ka sabse powerful feature hai! Ek hi line me loop aur filter lagake nayi list banana:
evens = [x for x in nums if x % 2 == 0]`,
    why_it_matters: 'Comprehensions execute in optimized C bytecode inside CPython, running significantly faster than manual list.append() loops in standard Python.',
    when_to_use: 'Use list/dict comprehensions for simple transformations and filtering. If logic spans multiple nested loops with complex error handling, write a regular for loop for readability.',
    syntax_guide: {
      template: 'if condition:\n    pass\nelif other:\n    pass\nelse:\n    pass\n\n[expr for item in iterable if condition]',
      components: [
        { name: 'enumerate(iterable)', role: 'Yields tuples of (index, item)', required: false },
        { name: 'zip(a, b)', role: 'Aggregates elements from multiple iterables in lockstep', required: false },
        { name: '[x for x in ...]', role: 'List comprehension mapping and filtering syntax', required: true }
      ],
      rules: ['Indentation must be consistent (standard 4 spaces)', 'Do not nest comprehensions deeper than 2 levels']
    },
    code_example_1_title: 'Basic Foundational: Iterating with enumerate and zip',
    code_example_1_code: `languages = ["Python", "C++", "SQL"]
ranks = [1, 2, 3]

print("--- Track Rankings ---")
for idx, (lang, rank) in enumerate(zip(languages, ranks)):
    print(f"Index {idx}: {lang} holds Rank #{rank}")`,
    code_example_1_explanation: 'Demonstrates combining enumerate() and zip() to iterate through multiple collections with index tracking in a single loop.',
    code_example_1_output: `--- Track Rankings ---
Index 0: Python holds Rank #1
Index 1: C++ holds Rank #2
Index 2: SQL holds Rank #3`,

    code_example_2_title: 'Intermediate Logic: List & Dictionary Comprehensions',
    code_example_2_code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Filter even numbers and square them
even_squares = [x**2 for x in numbers if x % 2 == 0]
print("Even squares:", even_squares)

# Dictionary comprehension: mapping number to its parity label
parity_map = {x: ("Even" if x % 2 == 0 else "Odd") for x in range(1, 5)}
print("Parity dictionary:", parity_map)`,
    code_example_2_explanation: 'Demonstrates concise list comprehension with conditional filtering, and dictionary comprehension with inline ternary expressions.',
    code_example_2_output: `Even squares: [4, 16, 36, 64, 100]
Parity dictionary: {1: 'Odd', 2: 'Even', 3: 'Odd', 4: 'Even'}`,

    code_example_3_title: 'Practical Application: Server Telemetry Log Anomaly Filter',
    code_example_3_code: `logs = [
    {"service": "auth", "status": 200, "duration_ms": 45},
    {"service": "payment", "status": 500, "duration_ms": 320},
    {"service": "catalog", "status": 200, "duration_ms": 80},
    {"service": "orders", "status": 504, "duration_ms": 5100},
]

# Extract slow or failing requests in one readable comprehension
anomalies = [
    f"{log['service'].upper()}: Code {log['status']} ({log['duration_ms']}ms)"
    for log in logs
    if log["status"] >= 500 or log["duration_ms"] > 1000
]

print("Detected Server Anomalies:")
for alert in anomalies:
    print(f"🚨 {alert}")`,
    code_example_3_explanation: 'Demonstrates real-world data filtering on list of dictionaries using a readable comprehension pattern.',
    code_example_3_output: `Detected Server Anomalies:
🚨 PAYMENT: Code 500 (320ms)
🚨 ORDERS: Code 504 (5100ms)`,

    code_walkthrough: {
      code: `nums = [1, 2, 3]\nsquares = [x*x for x in nums]\nprint(squares)`,
      steps: [
        { line: 1, explanation: 'Create source list [1, 2, 3].', state: 'nums = [1, 2, 3]' },
        { line: 2, explanation: 'Loop over x: 1*1=1, 2*2=4, 3*3=9. Construct new list.', state: 'squares = [1, 4, 9]' },
        { line: 3, explanation: 'Print squares.', state: 'Stdout: [1, 4, 9]' }
      ],
      output: '[1, 4, 9]',
      output_reasoning: 'Each element in nums is squared and placed into a new list.'
    },

    rules_and_restrictions: [
      'Mixing tabs and spaces causes IndentationError in Python 3',
      'for-else construct: else executes ONLY if the loop finishes normally without hitting a break',
      'Avoid overly complicated comprehensions spanning more than 2 lines'
    ],
    common_mistakes: [
      {
        title: 'Modifying a List While Iterating Over It',
        incorrect_code: `items = [1, 2, 3, 4]\nfor x in items:\n    if x == 2: items.remove(x) # Skips element 3!`,
        explanation: 'Removing an element shifts internal indices, causing the iterator to skip the immediate subsequent element.',
        corrected_code: `items = [x for x in items if x != 2] # Clean comprehension`,
        error_message: 'Silent iteration skipping bug',
        debug_tip: 'Never mutate a collection directly while looping over it; filter it into a new list.'
      }
    ],
    comparison_table: {
      title: 'Manual for loop vs List Comprehension',
      concept_a: 'Manual for Loop',
      concept_b: 'List Comprehension',
      headers: ['Aspect', 'Manual for Loop', 'List Comprehension'],
      rows: [
        ['Verbosity', '3-5 lines of code with empty list setup', '1 concise, readable line'],
        ['Performance', 'Slower (repeated method lookup for append)', 'Faster (optimized in CPython bytecode)'],
        ['Debugging', 'Easy to insert print statements inside loop', 'Cannot put print statements directly inside expression']
      ]
    },
    diagram_svg: createControlFlowSvg('Start', 'x in collection?', 'Process x', 'Exit loop', 'Finished'),
    practical_applications: [
      'Extracting and transforming columns in data analysis and ETL jobs',
      'Validating API input dictionaries against schema rules'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which built-in Python function returns both the index and value when looping over a sequence?',
        options: ['range()', 'enumerate()', 'zip()', 'indices()'],
        correct_index: 1,
        explanation: 'enumerate(iterable) yields (index, item) pairs on each iteration.'
      }
    ],
    key_takeaways: [
      'Python uses indentation to define code blocks.',
      'Use enumerate() for index tracking and zip() for parallel lists.',
      'Comprehensions provide fast, expressive list and dict transformations.'
    ],
    quick_revision_notes: 'for x in iterable. enumerate(seq) -> (idx, val). zip(a, b). [x for x in seq if cond]. Empty containers are Falsy.',
    assignment_prompt: 'Write a Python program that takes a list of temperatures in Celsius [0, 20, 35, 100] and creates a list of Fahrenheit temperatures using a list comprehension (F = C * 9/5 + 32).',
    assignment_starter_code: `celsius_temps = [0, 20, 35, 100]
# Use a list comprehension to compute fahrenheit_temps
print(fahrenheit_temps)`,
    assignment_solution: `celsius_temps = [0, 20, 35, 100]
fahrenheit_temps = [c * 9/5 + 32 for c in celsius_temps]
print("Fahrenheit:", fahrenheit_temps)`
  }
];

module.exports = { pythonTopics };
