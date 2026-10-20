/**
 * Code Nexus — Special Curriculum Modules
 * flutter-widgets-lifecycle (app-dev), java-collections-streams (java), sd-scaling-load-balancing (system-design)
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createControlFlowSvg, createMemoryLayoutSvg } = require('./diagrams');

const specialTopics = [
  // 1. Flutter Widgets & Lifecycle (App Dev)
  {
    id: 'flutter-widgets-lifecycle',
    course_id: 'app-dev',
    unit_id: 'app-unit-1',
    title: 'Flutter Widget Architecture (Stateless vs Stateful)',
    description: 'Master cross-platform mobile development with Flutter: declarative UI reactive model, StatelessWidget vs StatefulWidget, and State lifecycle.',
    order_index: 1,
    learning_objectives: [
      'Understand the declarative reactive UI paradigm ("UI = f(state)")',
      'Master the distinction between StatelessWidget and StatefulWidget',
      'Learn the StatefulWidget lifecycle methods: initState, build, didUpdateWidget, and dispose'
    ],
    prerequisites: ['Basic Object-Oriented Programming (Classes & Inheritance)'],
    expected_outcomes: ['Able to architect clean, performant mobile app UIs without memory leaks or unnecessary rebuilds'],
    formal_definition: 'In Flutter, widgets are immutable descriptions of a part of a user interface. StatelessWidget describes UI depending solely on immutable configuration, while StatefulWidget maintains mutable State objects across widget rebuilds throughout their element lifecycle.',
    content_simple_english: `In traditional Android (XML) or iOS (Storyboard/UIKit), you had imperative UI: you searched for a button with findViewById() and told it: button.setText("Click").
Flutter uses a modern **Declarative UI**: "UI is a function of State" (UI = f(state)). When state changes, Flutter redraws the screen!

In Flutter, everything is a Widget:
1. StatelessWidget:
   - Use when the UI NEVER changes based on user interactions (e.g. an icon, text label, company logo).
   - Once drawn, it remains static until recreated.
2. StatefulWidget:
   - Use when the UI CAN change dynamically (e.g. checkbox, counter, text input, form, cart count).
   - Separated into TWO classes: the immutable Widget itself, and the persistent mutable State object.

State Lifecycle:
- initState(): Called ONCE when widget enters the widget tree (great for API calls or setting controllers).
- build(): Called every time setState() is triggered to repaint the UI.
- dispose(): Called when the widget is permanently removed from the screen (crucial for cancelling animation controllers or network subscriptions to prevent memory leaks!).`,
    hinglish_explanation: `Pehle Android me XML file me UI banta tha aur Java/Kotlin me code likhna padta tha.
Flutter me sabkuch **Widget** hota hai aur UI Declarative hota hai: "UI = f(state)" yaani jab data badlega, screen apne aap update ho jayegi!

Flutter me do tarah ke widgets hote hain:
1. StatelessWidget:
   - Aise widgets jinka data kabhi nahi badalta (jaise App ka Logo, Heading, ya Static Button).
2. StatefulWidget:
   - Aise widgets jisme user ke click karne pe screen badalti hai (jaise Like button, Counter, ya Shopping Cart).
   - Isme setState() method hota hai. Jaise hi aap setState() call karte ho, Flutter turant screen ko naye data ke sath redraw kar deta hai!

Lifecycle ke 3 sabse zaroori functions:
- initState(): Widget screen pe aate hi sabse pehle 1 baar chalta hai (API call ya controller setup ke liye).
- build(): Har baar screen draw karte waqt chalta hai.
- dispose(): Jab user screen se bahar chala jaye, tab chalta hai (controllers ko band karne ke liye taaki phone ki battery aur RAM bache).`,
    why_it_matters: 'Failing to call dispose() on text controllers or streams causes mobile app memory leaks and background battery drain.',
    when_to_use: 'Use StatelessWidget by default whenever possible for speed. Use StatefulWidget only when the UI contains internal mutable state.',
    syntax_guide: {
      template: 'class CounterWidget extends StatefulWidget {\n  @override\n  State<CounterWidget> createState() => _CounterState();\n}\nclass _CounterState extends State<CounterWidget> {\n  int count = 0;\n  @override\n  Widget build(BuildContext context) {\n    return ElevatedButton(onPressed: () => setState(() => count++), child: Text("$count"));\n  }\n}',
      components: [
        { name: 'StatelessWidget', role: 'Immutable UI element', required: false },
        { name: 'StatefulWidget', role: 'Element with associated mutable State companion', required: false },
        { name: 'setState()', role: 'Notifies the Flutter framework that internal state changed, scheduling build()', required: true }
      ],
      rules: ['Never perform heavy I/O or API calls directly inside the build() method', 'Always dispose animation controllers and TextEditingControllers in dispose()']
    },
    code_example_1_title: 'Basic Foundational: StatelessWidget Header Card',
    code_example_1_code: `// Dart / Flutter framework code
import 'package:flutter/material.dart';

class CourseHeaderCard extends StatelessWidget {
  final String title;
  final String instructor;

  const CourseHeaderCard({
    Key? key,
    required this.title,
    required this.instructor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text("Instructor: $instructor", style: const TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}`,
    code_example_1_explanation: 'Demonstrates StatelessWidget taking immutable constructor parameters and returning a declarative tree of Card, Padding, Column, and Text.',
    code_example_1_output: 'Renders an immutable course header card widget with title and instructor.',

    code_example_2_title: 'Intermediate Logic: StatefulWidget Interactive Counter with setState',
    code_example_2_code: `import 'package:flutter/material.dart';

class InteractiveCounter extends StatefulWidget {
  const InteractiveCounter({Key? key}) : super(key: key);

  @override
  State<InteractiveCounter> createState() => _InteractiveCounterState();
}

class _InteractiveCounterState extends State<InteractiveCounter> {
  int _counter = 0;

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text("Total Clicks: $_counter"),
        ElevatedButton(
          onPressed: _increment,
          child: const Text("Increment Count"),
        ),
      ],
    );
  }
}`,
    code_example_2_explanation: 'Shows StatefulWidget maintaining _counter state in companion class and scheduling redraw via setState().',
    code_example_2_output: 'Renders counter text that reactively updates on each button press.',

    code_example_3_title: 'Practical Application: Safe Controller Lifecycle Management',
    code_example_3_code: `import 'package:flutter/material.dart';

class SafeSearchScreen extends StatefulWidget {
  const SafeSearchScreen({Key? key}) : super(key: key);

  @override
  State<SafeSearchScreen> createState() => _SafeSearchScreenState();
}

class _SafeSearchScreenState extends State<SafeSearchScreen> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    print("InitState: Search Controller initialized.");
  }

  @override
  void dispose() {
    _searchController.dispose(); // CRITICAL: Frees native platform controller
    print("Dispose: Controller freed to prevent memory leaks.");
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _searchController,
      decoration: const InputDecoration(labelText: "Search Nexus Catalog"),
    );
  }
}`,
    code_example_3_explanation: 'Demonstrates robust production mobile architecture: initializing controllers in initState() and cleanly releasing them in dispose().',
    code_example_3_output: 'Ensures zero memory leaks when navigating between mobile navigation stack screens.',

    code_walkthrough: {
      code: `setState(() { count++; });`,
      steps: [
        { line: 1, explanation: 'State mutator callback executes, incrementing count variable.', state: 'count += 1' },
        { line: 1, explanation: 'setState marks the Element as dirty in the Flutter framework.', state: 'Element Marked Dirty' },
        { line: 1, explanation: 'Next frame scheduler triggers build() to reconcile the render tree.', state: 'build() Scheduled' }
      ],
      output: 'Screen Re-rendered',
      output_reasoning: 'setState flags the widget dirty, prompting Flutter engine to repaint affected UI elements.'
    },

    rules_and_restrictions: [
      'Never call setState() inside the build() method; this triggers an infinite build loop crash',
      'Always invoke super.initState() at the start of initState() and super.dispose() at the end of dispose()'
    ],
    common_mistakes: [
      {
        title: 'Forgetting to dispose Controllers and Streams',
        incorrect_code: `class _MyState extends State<MyWidget> {\n  final ctrl = TextEditingController(); // Never disposed!\n}`,
        explanation: 'Failing to dispose controllers causes persistent memory leaks that slow down mobile devices as users navigate screens.',
        corrected_code: `@override\nvoid dispose() {\n  ctrl.dispose();\n  super.dispose();\n}`,
        error_message: 'Memory leak and leaked platform channel handles',
        debug_tip: 'Pair every resource created in initState() with a disposal in dispose().'
      }
    ],
    comparison_table: {
      title: 'StatelessWidget vs StatefulWidget in Flutter',
      concept_a: 'StatelessWidget',
      concept_b: 'StatefulWidget',
      headers: ['Feature', 'StatelessWidget', 'StatefulWidget'],
      rows: [
        ['Mutability', 'Completely immutable configuration', 'Contains mutable State object that persists across builds'],
        ['Lifecycle', 'Only build()', 'initState(), didUpdateWidget(), setState(), dispose(), build()'],
        ['Performance', 'Extremely lightweight and fast', 'Slightly higher overhead; rebuilds only dirty subtrees'],
        ['Best Use Case', 'Icons, static text, layout containers', 'Forms, animations, interactive buttons, shopping carts']
      ]
    },
    diagram_svg: createControlFlowSvg('Widget Lifecycle', 'initState() called?', 'Run build() to render UI', 'Widget removed from tree', 'dispose() cleanup'),
    practical_applications: [
      'Cross-platform iOS and Android production apps with native 120 FPS animations',
      'Desktop and embedded Flutter apps on Linux, macOS, and Windows'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which method must be called to notify the Flutter framework that widget state has changed?',
        options: ['render()', 'updateUI()', 'setState()', 'notifyListeners()'],
        correct_index: 2,
        explanation: 'setState() notifies the Flutter framework that the internal state of a State object has changed, scheduling a rebuild of the widget subtree.'
      }
    ],
    key_takeaways: [
      'Flutter uses declarative UI ("UI = f(state)").',
      'StatelessWidget is for immutable static UI; StatefulWidget is for mutable interactive UI.',
      'Always clean up controllers and listeners in dispose().'
    ],
    quick_revision_notes: 'Flutter: Stateless (static) vs Stateful (dynamic). setState() triggers build(). Clean up resources in dispose(). UI = f(state).',
    assignment_prompt: 'Write a Dart Flutter widget snippet demonstrating a toggle switch with a boolean _isActive state updated via setState().',
    assignment_starter_code: `// Write Flutter toggle button
class ToggleButton extends StatefulWidget {
  @override
  _ToggleButtonState createState() => _ToggleButtonState();
}`,
    assignment_solution: `class ToggleButton extends StatefulWidget {
  @override
  _ToggleButtonState createState() => _ToggleButtonState();
}

class _ToggleButtonState extends State<ToggleButton> {
  bool _isActive = false;

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _isActive,
      onChanged: (val) {
        setState(() {
          _isActive = val;
        });
      },
    );
  }
}`
  },

  // 2. Java Collections & Streams API (Java)
  {
    id: 'java-collections-streams',
    course_id: 'java',
    unit_id: 'java-unit-1',
    title: 'Java Collections Framework and Streams API',
    description: 'Master the Java Collections Framework (List, Set, Map, ArrayList, HashMap) and modern functional Streams API (filter, map, collect).',
    order_index: 2,
    learning_objectives: [
      'Understand the hierarchy of the Java Collections Framework (Collection, List, Set, Map)',
      'Master the time complexity differences between ArrayList, LinkedList, and HashMap',
      'Write functional data pipelines using the Java 8+ Streams API (filter, map, reduce, Collectors.toList)'
    ],
    prerequisites: ['JVM Architecture, Primitive vs Reference Types'],
    expected_outcomes: ['Able to select optimal data structures and write declarative, parallelizable stream pipelines'],
    formal_definition: 'The Java Collections Framework is a unified architecture for representing and manipulating collections. The Streams API introduces functional-style operations on sequences of elements supporting lazy evaluation and parallel processing.',
    content_simple_english: `In Java, standard arrays int[] have a major drawback: their size is fixed upon creation and cannot grow.
To solve this, Java provides the **Java Collections Framework (JCF)**:
1. List (Ordered, permits duplicates):
   - ArrayList: Backed by a resizable dynamic array. O(1) random index access (get(5)), fast iteration. Best for 95% of use cases!
   - LinkedList: Doubly linked list. Fast O(1) insertion at head/tail, but slow O(N) index access.
2. Set (No duplicates, unordered):
   - HashSet: Backed by a hash table. O(1) average lookup (contains()), eliminates duplicate items automatically.
3. Map (Key-Value pairs, unique keys):
   - HashMap: Key-to-value association with O(1) average get() and put() performance.

The Java Streams API (Java 8+):
Instead of writing nested, imperative for-loops with counters, Streams let you process data declaratively:
- Intermediate Operations (Lazy): .filter(x -> ...), .map(x -> ...), .sorted()
- Terminal Operations (Eager): .collect(Collectors.toList()), .count(), .forEach()`,
    hinglish_explanation: `Java me normal array ka size fix hota hai (jaise int[5] me 6 items nahi daal sakte). Isliye hum **Collections Framework** use karte hain:
1. ArrayList: Dynamic array jo apne aap bada ho jata hai. Isme kisi bhi index ka element nikalna super fast O(1) hota hai.
2. HashSet: Isme koi duplicate item nahi ja sakta! Agar aapne do baar "Apple" dala, toh wo ek hi baar rahega. Dhoondna O(1) fast hota hai.
3. HashMap: Key-Value jodi (jaise RollNumber -> StudentName).

Streams API (Modern Java ka jaadu):
Purane zamane me list ko filter karne ke liye 10 line ka for loop likhna padta tha.
Streams se wahi kaam 2 line me ho jata hai:
list.stream()
    .filter(student -> student.getScore() > 80)
    .map(Student::getName)
    .collect(Collectors.toList());
Ye code bohot saaf dikhta hai aur multithreading (parallelStream) ke sath rocket ki tarah tezi se chalta hai!`,
    why_it_matters: 'Almost all enterprise Java backend services (Spring Boot, Kafka microservices) manipulate domain models using Collections and Streams.',
    when_to_use: 'Use ArrayList by default for lists. Use HashMap for key lookups. Use Streams for filtering, transforming, and aggregating collections.',
    syntax_guide: {
      template: 'List<String> names = new ArrayList<>();\nMap<Integer, String> users = new HashMap<>();\nList<String> filtered = names.stream()\n    .filter(n -> n.startsWith("A"))\n    .collect(Collectors.toList());',
      components: [
        { name: 'ArrayList<T>', role: 'Dynamic resizable list implementation', required: false },
        { name: 'HashMap<K, V>', role: 'Hash table key-value map implementation', required: false },
        { name: 'stream()', role: 'Converts collection into functional pipeline stream', required: true }
      ],
      rules: ['Collections cannot hold raw primitives; use wrapper types (List<Integer>, not List<int>)', 'Streams cannot be reused once consumed by a terminal operation']
    },
    code_example_1_title: 'Basic Foundational: ArrayList and HashMap Fundamentals',
    code_example_1_code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        // Dynamic List
        List<String> languages = new ArrayList<>();
        languages.add("C");
        languages.add("Java");
        languages.add("Python");
        System.out.println("Language at index 1: " + languages.get(1));

        // Key-Value HashMap
        Map<String, Integer> portRegistry = new HashMap<>();
        portRegistry.put("HTTP", 80);
        portRegistry.put("HTTPS", 443);
        portRegistry.put("SSH", 22);
        System.out.println("HTTPS port: " + portRegistry.get("HTTPS"));
    }
}`,
    code_example_1_explanation: 'Demonstrates generic type safety with List<String> and Map<String, Integer> and constant-time lookups.',
    code_example_1_output: `Language at index 1: Java
HTTPS port: 443`,

    code_example_2_title: 'Intermediate Logic: Functional Stream Filtering and Transformation',
    code_example_2_code: `import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> candidates = Arrays.asList("Alice", "Bob", "Alex", "Charlie", "Anna");

        // Pipeline: filter names starting with 'A' -> convert to UPPERCASE -> collect
        List<String> result = candidates.stream()
            .filter(name -> name.startsWith("A"))
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.toList());

        System.out.println("Qualified Candidates: " + result);
    }
}`,
    code_example_2_explanation: 'Demonstrates functional Stream composition chaining filter, map method reference, sorted, and terminal collector.',
    code_example_2_output: `Qualified Candidates: [ALEX, ALICE, ANNA]`,

    code_example_3_title: 'Practical Application: Enterprise Order Analytics Stream Aggregation',
    code_example_3_code: `import java.util.Arrays;
import java.util.List;

public class Main {
    static class Order {
        final String category;
        final double amount;
        Order(String cat, double amt) { this.category = cat; this.amount = amt; }
    }

    public static void main(String[] args) {
        List<Order> orders = Arrays.asList(
            new Order("Tech", 250.0),
            new Order("Books", 45.0),
            new Order("Tech", 750.0),
            new Order("Home", 120.0)
        );

        // Calculate total revenue for Tech category using stream reduction
        double totalTechRevenue = orders.stream()
            .filter(o -> "Tech".equals(o.category))
            .mapToDouble(o -> o.amount)
            .sum();

        System.out.printf("Total Tech Revenue: $%.2f%n", totalTechRevenue);
    }
}`,
    code_example_3_explanation: 'Demonstrates numerical stream reduction (mapToDouble().sum()) executing financial aggregation cleanly.',
    code_example_3_output: `Total Tech Revenue: $1000.00`,

    code_walkthrough: {
      code: `List.of(1,2,3).stream().filter(x -> x > 1).count();`,
      steps: [
        { line: 1, explanation: 'Source stream created from immutable list [1, 2, 3].', state: 'Stream Created' },
        { line: 1, explanation: 'filter checks predicate: 1 is discarded; 2 and 3 pass.', state: 'Filtered: [2, 3]' },
        { line: 1, explanation: 'count terminal operation counts remaining elements and returns 2.', state: 'Terminal Return: 2' }
      ],
      output: '2',
      output_reasoning: 'Only 2 elements (2 and 3) satisfy the predicate x > 1.'
    },

    rules_and_restrictions: [
      'Java collections cannot store primitive types directly; auto-boxing converts int to Integer',
      'A Stream cannot be operated upon once a terminal operation has executed'
    ],
    common_mistakes: [
      {
        title: 'Reusing a consumed Java Stream',
        incorrect_code: `Stream<String> s = list.stream();\ns.forEach(System.out::println);\ns.count(); // CRASHES at runtime!`,
        explanation: 'Java streams are single-use sequences. Calling a terminal operation closes the stream; reusing it throws IllegalStateException.',
        corrected_code: `list.forEach(System.out::println);\nlong count = list.size();`,
        error_message: 'java.lang.IllegalStateException: stream has already been operated upon or closed',
        debug_tip: 'Always create a fresh stream() invocation for each query pipeline.'
      }
    ],
    comparison_table: {
      title: 'ArrayList vs LinkedList in Java',
      concept_a: 'ArrayList',
      concept_b: 'LinkedList',
      headers: ['Operation', 'ArrayList', 'LinkedList'],
      rows: [
        ['Index Access (get/set)', 'O(1) Constant Time (Direct array offset)', 'O(N) Linear Scan (Traversing pointers)'],
        ['Insertion at Head', 'O(N) (Must shift all elements right)', 'O(1) (Just adjusts head pointer)'],
        ['Memory Overhead', 'Low (Contiguous array of references)', 'High (Node wrapper object per element + prev/next pointers)'],
        ['Cache Locality', 'Excellent (High CPU cache hit rate)', 'Poor (Fragmented heap memory locations)']
      ]
    },
    diagram_svg: createMemoryLayoutSvg(),
    practical_applications: [
      'Spring Boot REST controller services processing high-throughput API payloads',
      'Big Data batch analysis with Apache Spark or parallel JVM streams'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What happens if you attempt to invoke a terminal operation on a Java Stream that has already been consumed?',
        options: [
          'It re-evaluates the stream from the source',
          'It throws an IllegalStateException',
          'It returns null',
          'It runs in a background thread'
        ],
        correct_index: 1,
        explanation: 'In Java, a stream is closed after a terminal operation executes. Attempting to consume it again throws java.lang.IllegalStateException.'
      }
    ],
    key_takeaways: [
      'ArrayList provides fast O(1) random access; HashMap provides fast O(1) key lookups.',
      'Java 8+ Streams allow declarative data transformation (filter, map, collect).',
      'Streams are lazy and can be consumed only once.'
    ],
    quick_revision_notes: 'List<T> = ArrayList (fast lookup). Set<T> = HashSet (unique). Map<K,V> = HashMap. stream().filter().map().collect().',
    assignment_prompt: 'Write a Java program that creates a List of integers [5, 12, 8, 20, 3], filters numbers >= 10 using Streams, and prints the count.',
    assignment_starter_code: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        // Filter and count numbers >= 10
    }
}`,
    assignment_solution: `import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(5, 12, 8, 20, 3);
        long count = nums.stream()
            .filter(n -> n >= 10)
            .count();
        System.out.println("Numbers >= 10 count: " + count);
    }
}`
  },

  // 3. System Design: Scaling & Load Balancing
  {
    id: 'sd-scaling-load-balancing',
    course_id: 'system-design',
    unit_id: 'sd-unit-1',
    title: 'Horizontal vs Vertical Scaling & Load Balancers',
    description: 'Master large-scale distributed architectures: Vertical Scaling (Scaling Up) vs Horizontal Scaling (Scaling Out), Layer 4 vs Layer 7 Load Balancing, and routing algorithms.',
    order_index: 1,
    learning_objectives: [
      'Differentiate between Vertical Scaling (Scale Up) and Horizontal Scaling (Scale Out)',
      'Understand the architecture and role of Load Balancers (L4 vs L7)',
      'Master Load Balancing Algorithms (Round Robin, Least Connections, Consistent Hashing, IP Hash)'
    ],
    prerequisites: ['Basic networking concepts (IP, Port, HTTP, TCP)'],
    expected_outcomes: ['Able to design fault-tolerant, high-availability web service architectures handling millions of requests'],
    formal_definition: 'Scalability is the capability of a system to handle growing amounts of work by adding resources. Load balancing is the systematic distribution of network traffic across a pool of backend servers to optimize resource utilization, maximize throughput, and eliminate single points of failure.',
    content_simple_english: `When your application grows from 100 users to 10,000,000 users, a single server will inevitably run out of CPU and memory and crash.
We have two fundamental strategies to scale:
1. Vertical Scaling (Scaling Up):
   - Buying a bigger, more powerful machine (more RAM, 64-core CPU).
   - Pros: Simple, no distributed systems complexity, zero code changes.
   - Cons: Hard hardware limit (a machine can only get so big), extremely expensive, and STILL a Single Point of Failure (SPOF)! If that server dies, your whole business goes down!
2. Horizontal Scaling (Scaling Out):
   - Adding MORE cheap commodity servers to your server pool.
   - Pros: Virtually limitless scaling, High Availability (if server 2 dies, servers 1 and 3 keep working!).
   - Cons: Requires a Load Balancer and stateless application design!

The Load Balancer (Traffic Police):
A Load Balancer sits between the Internet and your backend servers:
- Layer 4 (Transport): Routes purely based on TCP/UDP IP and Port without inspecting packet content (blazing fast).
- Layer 7 (Application): Inspects HTTP headers, URLs, and cookies (e.g. routes /api/video to video servers and /api/checkout to payment servers).

Algorithms:
- Round Robin: Distributes requests sequentially 1 -> 2 -> 3 -> 1.
- Least Connections: Sends traffic to the server with fewest active connections.
- Consistent Hashing: Ensures requests with the same user ID always land on the same cache node.`,
    hinglish_explanation: `Jab aapki website pe 100 log aate hain, toh ek chota computer bhi sambhal leta hai. Lekin jab 10 lakh log aane lagenge, toh server phat jayega (crash)!
Is problem ko solve karne ke 2 tareeqe hain:
1. Vertical Scaling (Scale Up):
   - Ek hi computer me zyada RAM aur bada CPU lagana.
   - Nuksan: Ek limit ke baad duniya me koi bada computer nahi bachta, bohot mehenga hota hai, aur agar wo ek computer band hua, toh poori company band!
2. Horizontal Scaling (Scale Out):
   - Ek bada computer lene ke bajaye 10 chhote computers jod dena!
   - Faayda: Agar ek computer kharab bhi ho gaya, baaki 9 chalte rahenge (High Availability)!

Load Balancer (Traffic Police):
Ab jab 10 servers hain, toh user ka request kis server pe jayega?
Beech me baithta hai **Load Balancer**:
- Ye har aane wali request ko barabar baant ta hai (jaise Round Robin me pehli request Server 1 pe, doosri Server 2 pe).
- Ye servers ki health check karta rehta hai—agar koi server beemar (crash) ho gaya, toh Load Balancer uspe traffic bhejna band kar deta hai!`,
    why_it_matters: 'Modern tech giants (Google, Netflix, Amazon) handle billions of requests per second exclusively by combining horizontal scaling with multi-tier load balancing.',
    when_to_use: 'Use vertical scaling in early-stage startups or monolithic databases. Transition to horizontal scaling with load balancers as soon as high availability and redundancy become business requirements.',
    syntax_guide: {
      template: '# NGINX Layer 7 Load Balancer Upstream Configuration\nupstream backend_pool {\n    least_conn;\n    server backend1.internal:8080 weight=3;\n    server backend2.internal:8080;\n    server backend3.internal:8080 backup;\n}\nserver {\n    listen 80;\n    location / {\n        proxy_pass http://backend_pool;\n    }\n}',
      components: [
        { name: 'upstream', role: 'Defines the pool of backend target application servers', required: true },
        { name: 'least_conn', role: 'Directs new connections to server with least active sessions', required: false },
        { name: 'health_check', role: 'Periodic HTTP ping verifying server liveness', required: true }
      ],
      rules: ['Application servers behind a load balancer must be stateless (sessions stored in Redis/DB, not in local server memory)', 'Always configure health checks to prevent routing to dead nodes']
    },
    code_example_1_title: 'Basic Foundational: Round-Robin Algorithm Implementation',
    code_example_1_code: `// Simulation of Round-Robin balancing in JavaScript / Node.js
class RoundRobinLoadBalancer {
    constructor(servers) {
        this.servers = servers;
        this.currentIndex = 0;
    }

    getNextServer() {
        if (this.servers.length === 0) throw new Error("No healthy servers available!");
        const server = this.servers[this.currentIndex];
        // Advance and wrap circularly
        this.currentIndex = (this.currentIndex + 1) % this.servers.length;
        return server;
    }
}

const lb = new RoundRobinLoadBalancer(["Server-A (10.0.0.1)", "Server-B (10.0.0.2)", "Server-C (10.0.0.3)"]);

for (let req = 1; req <= 5; req++) {
    console.log(\`Request #\${req} routed to -> \${lb.getNextServer()}\`);
}`,
    code_example_1_explanation: 'Demonstrates circular round-robin scheduling distributing five client requests sequentially across three target servers.',
    code_example_1_output: `Request #1 routed to -> Server-A (10.0.0.1)
Request #2 routed to -> Server-B (10.0.0.2)
Request #3 routed to -> Server-C (10.0.0.3)
Request #4 routed to -> Server-A (10.0.0.1)
Request #5 routed to -> Server-B (10.0.0.2)`,

    code_example_2_title: 'Intermediate Logic: Health Checks and Automatic Dead-Node Removal',
    code_example_2_code: `class ResilientLoadBalancer {
    constructor() {
        this.pool = [
            { id: "S1", alive: true },
            { id: "S2", alive: true },
            { id: "S3", alive: false } // Failed health check!
        ];
    }

    route() {
        const healthyServers = this.pool.filter(s => s.alive);
        if (healthyServers.length === 0) return "503 Service Unavailable";
        const selected = healthyServers[Math.floor(Math.random() * healthyServers.length)];
        return \`Routed to healthy \${selected.id}\`;
    }
}

const resilientLb = new ResilientLoadBalancer();
console.log(resilientLb.route());
console.log(resilientLb.route());`,
    code_example_2_explanation: 'Demonstrates active health check filtering: S3 is down, so the load balancer automatically isolates traffic to healthy nodes S1 and S2.',
    code_example_2_output: `Routed to healthy S1  (or S2 — healthy pick is random)
Routed to healthy S2  (never S3, which failed its health check)`,

    code_example_3_title: 'Practical Application: Layer 7 Path-Based Microservice Routing',
    code_example_3_code: `// Layer 7 Application Router inspecting HTTP URI path
function layer7Route(requestUrl) {
    if (requestUrl.startsWith("/api/checkout") || requestUrl.startsWith("/api/pay")) {
        return "Route to High-Security Payment Cluster [Ports 9001-9004]";
    } else if (requestUrl.startsWith("/static/") || requestUrl.endsWith(".png")) {
        return "Route to CDN Edge / Static Asset Cache [Port 8080]";
    } else {
        return "Route to General Web Fleet [Ports 3000-3010]";
    }
}

console.log(layer7Route("/api/pay/confirm"));
console.log(layer7Route("/static/hero.png"));
console.log(layer7Route("/courses/system-design"));`,
    code_example_3_explanation: 'Demonstrates Layer 7 load balancing intelligence: examining HTTP request paths to route sensitive checkouts to secure clusters and static assets to caches.',
    code_example_3_output: `Route to High-Security Payment Cluster [Ports 9001-9004]
Route to CDN Edge / Static Asset Cache [Port 8080]
Route to General Web Fleet [Ports 3000-3010]`,

    code_walkthrough: {
      code: `lb.route(request);`,
      steps: [
        { line: 1, explanation: 'Client DNS resolves domain name to Load Balancer Public Virtual IP (VIP).', state: 'Client -> VIP' },
        { line: 1, explanation: 'Load balancer inspects health table and applies algorithm (e.g. Least Conn).', state: 'Backend Selected' },
        { line: 1, explanation: 'Load balancer proxies request via internal private network to chosen node.', state: 'Reverse Proxied' }
      ],
      output: 'Request Dispatched',
      output_reasoning: 'Load balancer masks backend server cluster topology behind a single resilient endpoint.'
    },

    rules_and_restrictions: [
      'Backend servers behind a load balancer must be STATELESS; never store sessions in local server memory',
      'Load Balancers must themselves be made redundant (active-passive with VRRP / Keepalived) to prevent the LB itself from becoming a SPOF'
    ],
    common_mistakes: [
      {
        title: 'Storing user sessions in local server memory with horizontal scaling',
        incorrect_code: `// In Server 1 memory:\nreq.session.userId = 42;\n// Next request hits Server 2 -> User gets logged out!`,
        explanation: 'In horizontal scaling, consecutive requests from the same user land on different servers. Storing session state in local server memory breaks authentication.',
        corrected_code: `// Store sessions in centralized Redis or database:\nawait redis.set(\`sess:\${sessionId}\`, userId);`,
        error_message: 'Spurious session drops and unauthenticated redirect errors',
        debug_tip: 'Always externalize session and cache state to Redis or a shared database cluster.'
      }
    ],
    comparison_table: {
      title: 'Vertical Scaling vs Horizontal Scaling',
      concept_a: 'Vertical (Scale Up)',
      concept_b: 'Horizontal (Scale Out)',
      headers: ['Dimension', 'Vertical Scaling (Scale Up)', 'Horizontal Scaling (Scale Out)'],
      rows: [
        ['Method', 'Add CPU / RAM to an existing single machine', 'Add more independent servers to the cluster'],
        ['Scalability Ceiling', 'Hard hardware ceiling', 'Virtually unlimited (elastic cloud scaling)'],
        ['Downtime Risk', 'Single Point of Failure (SPOF)', 'High Availability (Fault tolerant)'],
        ['System Complexity', 'Very low (No architectural redesign needed)', 'High (Requires load balancers, stateless servers, distributed locks)'],
        ['Cost Scaling', 'Exponentially expensive at top tier', 'Linear cost using standard commodity cloud instances']
      ]
    },
    diagram_svg: createControlFlowSvg('Load Balancer', 'Server healthy?', 'Forward traffic to backend', 'Remove from active pool', 'Response to client'),
    practical_applications: [
      'AWS Elastic Load Balancing (ALB/NLB) and Cloudflare reverse proxies',
      'Large e-commerce flash sales dynamically auto-scaling from 10 to 500 instances'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Why must application servers behind a load balancer typically be stateless?',
        options: [
          'Because stateless servers consume zero RAM',
          'Because subsequent user requests may be routed to different server instances',
          'Because HTTP is a binary protocol',
          'Because load balancers cannot forward cookies'
        ],
        correct_index: 1,
        explanation: 'In a load-balanced cluster, any subsequent request from a user can be routed to any healthy server. If state was stored in a single machine memory, other servers would not know the user session.'
      }
    ],
    key_takeaways: [
      'Vertical scaling increases machine specs; horizontal scaling adds more machines.',
      'Load Balancers eliminate Single Points of Failure and distribute traffic.',
      'Layer 4 balances on IP/Port; Layer 7 balances on HTTP path, headers, and cookies.'
    ],
    quick_revision_notes: 'Vertical = bigger server (SPOF). Horizontal = more servers (scalable, fault-tolerant). Load Balancers: L4 (fast, TCP) vs L7 (smart, HTTP). Keep servers stateless.',
    assignment_prompt: 'Write a JavaScript or Python function that implements a Least-Connections load balancer given an array of servers with their active connection counts.',
    assignment_starter_code: `// Return the server with the fewest active connections
function selectLeastConn(servers) {
    // servers = [{ id: "s1", conns: 12 }, { id: "s2", conns: 4 }]
}`,
    assignment_solution: `function selectLeastConn(servers) {
    if (!servers || servers.length === 0) return null;
    let best = servers[0];
    for (let i = 1; i < servers.length; i++) {
        if (servers[i].conns < best.conns) {
            best = servers[i];
        }
    }
    return best.id;
}

const pool = [{ id: "server-1", conns: 25 }, { id: "server-2", conns: 7 }, { id: "server-3", conns: 14 }];
console.log("Routed to:", selectLeastConn(pool)); // server-2`
  }
];

module.exports = { specialTopics };
