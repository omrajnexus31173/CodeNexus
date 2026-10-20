const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const pool = new Pool({
  connectionString: requireDatabaseUrl()
});

const libraryResourcesData = [
  {
    id: 'lib-c-mastery-handbook',
    title: 'The Ultimate C Systems & Pointers Handbook',
    course_id: 'c-lang',
    language: 'c',
    category: 'Book',
    difficulty: 'All Levels',
    author: 'Dennis Ritchie Heritage Society & Code Nexus Staff',
    description: 'A deep, practical guide to low-level C programming, pointer arithmetic, memory alignment, malloc internals, and Linux POSIX syscalls.',
    file_size: '4.8 MB',
    pages_or_read_time: '185 pages',
    unlock_cost: 150,
    content_summary: 'Covers Stack vs Heap architecture, memory padding & structure alignment, double pointers, function pointer jump tables, file descriptors, and multithreaded pthreads.',
    pdf_preview_text: `# THE ULTIMATE C SYSTEMS & POINTERS HANDBOOK
Author: Code Nexus Editorial & Systems Architecture Group

## TABLE OF CONTENTS
1. Memory Architecture: Stack, Heap, Data & BSS Segments
2. Master Pointers: Void, Null, Wild, Dangling & Double Pointers
3. Dynamic Memory Allocation: Malloc internals & Valgrind debugging
4. Structure Padding & 64-bit Cache Alignment
5. File Descriptors, POSIX System Calls & Multithreading

### CHAPTER 1: THE MEMORY LAYOUT OF A C PROGRAM
When a Linux binary is loaded into RAM by the OS kernel, its virtual address space (0x0000000000000000 to 0x7FFFFFFFFFFFFFFF) is structured as follows:

• Text Segment: Contains compiled machine instructions (Read-Only).
• Initialized Data (.data): Global & static variables with explicit values.
• Uninitialized Data (.bss): Global & static variables initialized to zero by kernel.
• Heap: Grows UPWARDS in memory via brk() and mmap() system calls.
• Stack: Grows DOWNWARDS in memory. Stores stack frames, return addresses, and local variables.

### CHAPTER 2: STRUCT ALIGNMENT & CACHE EFFICIENCY
CPUs read RAM in chunks called memory words (usually 8 bytes on 64-bit systems).
If a struct has misaligned fields:
struct Inefficient {
    char a;     // 1 byte
    // 7 bytes wasted padding!
    double b;   // 8 bytes (must align to multiple of 8)
    char c;     // 1 byte
    // 7 bytes wasted padding!
}; // Total size: 24 bytes!

Rearranging fields by descending size:
struct Optimized {
    double b;   // 8 bytes
    char a;     // 1 byte
    char c;     // 1 byte
    // 6 bytes padding at end
}; // Total size: 16 bytes (33% memory saved!)
`,
    is_premium: true
  },
  {
    id: 'lib-cpp-stl-blueprints',
    title: 'Modern C++20 & STL Deep Internals Guide',
    course_id: 'cpp',
    language: 'cpp',
    category: 'Book',
    difficulty: 'Intermediate to Advanced',
    author: 'Code Nexus Performance Engineering Team',
    description: 'Comprehensive manual on move semantics, smart pointers, custom allocators, templates metaprogramming, and Red-Black tree mechanics behind std::map.',
    file_size: '6.2 MB',
    pages_or_read_time: '240 pages',
    unlock_cost: 150,
    content_summary: 'Master C++20 Concepts, Coroutines, RAII, std::unique_ptr vs std::shared_ptr control blocks, and zero-overhead abstractions.',
    pdf_preview_text: `# MODERN C++20 & STL DEEP INTERNALS
Author: Code Nexus C++ Standards Committee

## KEY HIGHLIGHTS
• Rvalue References & Move Semantics (std::move, std::forward)
• Smart Pointers & Reference Counting Internals
• Custom Allocators & High-Frequency Trading Patterns
• STL Iterators & Custom Container Implementation
• C++20 Concepts and Ranges

### SMART POINTER MECHANICS:
1. std::unique_ptr<T>: Zero runtime overhead compared to raw pointer. Non-copyable, movable only.
2. std::shared_ptr<T>: Allocates a heap Control Block containing reference counter and weak counter. Thread-safe increment/decrement.
3. std::weak_ptr<T>: Breaks cyclic reference memory leaks between interconnected nodes.
`,
    is_premium: true
  },
  {
    id: 'lib-python-data-science-handbook',
    title: 'Python for High-Performance Data Science & AI',
    course_id: 'python',
    language: 'python',
    category: 'Book',
    difficulty: 'All Levels',
    author: 'Nexus Data Labs & Machine Learning Engineers',
    description: 'The definitive handbook covering NumPy vectorized linear algebra, Pandas manipulation at scale, PyTorch neural networks, and OpenCV image pipelines.',
    file_size: '8.4 MB',
    pages_or_read_time: '310 pages',
    unlock_cost: 150,
    content_summary: 'Includes complete production recipes for data cleaning, time series analysis, matrix decomposition, neural network training loops, and computer vision filters.',
    pdf_preview_text: `# PYTHON FOR HIGH-PERFORMANCE DATA SCIENCE & AI
Author: Nexus Data Science Institute

## SECTION OVERVIEW
1. NumPy Memory Contiguity and SIMD Vectorization
2. High-Throughput Pandas Data Cleaning and Multi-Index Aggregation
3. Mathematical Foundations: Linear Algebra & Gradient Calculus
4. PyTorch: Tensors, Autograd Graph, and Custom Loss Functions
5. OpenCV: Morphological Transformations and Contour Detection
`,
    is_premium: true
  },
  {
    id: 'lib-sql-postgresql-tuning',
    title: 'PostgreSQL Performance Engineering & Query Optimization',
    course_id: 'sql-databases',
    language: 'sql',
    category: 'Notes',
    difficulty: 'Advanced',
    author: 'Principal Database Architect, Code Nexus',
    description: 'Master EXPLAIN ANALYZE, B-Tree vs Hash vs GIN indexes, CTEs, Window Functions, vacuuming, and ACID transaction isolation levels.',
    file_size: '3.1 MB',
    pages_or_read_time: '110 pages',
    unlock_cost: 150,
    content_summary: 'Step-by-step query optimization, index tuning, avoiding sequential scans on multi-million row tables, and writing recursive CTE queries.',
    pdf_preview_text: `# POSTGRESQL PERFORMANCE ENGINEERING & TUNING
Author: Code Nexus Database Infrastructure Team

## CORE TOPICS
• Understanding EXPLAIN (ANALYZE, BUFFERS, COSTS)
• Index Selection: B-Tree vs GIN (JSONB) vs BRIN (Time Series)
• Window Functions: PARTITION BY, RANK(), DENSE_RANK(), LAG()
• Locking & Isolation Levels: Read Committed, Repeatable Read, Serializable
• Vacuum & Auto-Vacuum tuning for write-heavy tables
`,
    is_premium: true
  },
  {
    id: 'lib-dsa-interview-cheatsheet',
    title: 'DSA Comprehensive Interview Cheat Sheet & Visual Patterns',
    course_id: 'dsa',
    language: 'dsa',
    category: 'Cheat Sheet',
    difficulty: 'All Levels',
    author: 'Code Nexus Competitive Programming Lead',
    description: 'Visual pattern recognition for Top 20 DSA coding patterns: Sliding Window, Two Pointers, Fast & Slow Pointers, Monotonic Stack, Backtracking, and Dynamic Programming.',
    file_size: '2.5 MB',
    pages_or_read_time: '75 pages',
    unlock_cost: 150,
    content_summary: 'Time/space complexity cheat sheet, pattern classification, recurrence relations for DP, and graph traversal templates.',
    pdf_preview_text: `# DSA COMPREHENSIVE INTERVIEW CHEAT SHEET
Author: Code Nexus CP Guild

## TOP 10 ALGORITHMIC PATTERNS
1. Two Pointers: Sorted arrays, palindrome verification, container with most water.
2. Sliding Window: Longest substring without repeats, minimum size subarray sum.
3. Fast & Slow Pointer (Floyd's Cycle Finding): Linked list cycle, finding middle node.
4. Monotonic Stack: Next greater element, daily temperatures, largest rectangle in histogram.
5. Tree BFS / Level Order: Shortest path in unweighted graphs, zigzag traversal.
`,
    is_premium: true
  },
  {
    id: 'lib-system-design-blueprints',
    title: 'Enterprise System Design & Distributed Systems Blueprint',
    course_id: 'system-design',
    language: 'system-design',
    category: 'Diagram Guide',
    difficulty: 'Advanced',
    author: 'Chief Systems Architect, Code Nexus',
    description: 'Real-world architectural diagrams for YouTube, Uber, WhatsApp, and Code Nexus scalable code runner.',
    file_size: '5.5 MB',
    pages_or_read_time: '160 pages',
    unlock_cost: 150,
    content_summary: 'CAP Theorem, Eventual Consistency, Distributed Caching with Redis Cluster, Kafka Event Streaming, and Sharded SQL.',
    pdf_preview_text: `# ENTERPRISE SYSTEM DESIGN BLUEPRINT
Author: Code Nexus Systems Architecture Group

## CASE STUDIES INCLUDED
1. Scalable Online Code Execution Engine (Sandbox Isolation, Worker Queues, cgroups)
2. Global Real-time Chat Architecture (WebSockets, Redis Pub/Sub, Cassandra)
3. Large-Scale Video Streaming Platform (Transcoding Pipelines, CDNs, HLS)
4. Distributed Payment Processing (Idempotency Keys, Saga Pattern, Two-Phase Commit)
`,
    is_premium: true
  }
];

async function seedLibrary() {
  const client = await pool.connect();
  try {
    console.log(`--- Seeding ${libraryResourcesData.length} Library Resources ---`);
    await client.query('BEGIN');

    for (const r of libraryResourcesData) {
      await client.query(`
        INSERT INTO library_resources (
          id, title, course_id, language, category, difficulty, author,
          description, file_size, pages_or_read_time, unlock_cost,
          content_summary, pdf_preview_text, is_premium
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          unlock_cost = EXCLUDED.unlock_cost,
          content_summary = EXCLUDED.content_summary,
          pdf_preview_text = EXCLUDED.pdf_preview_text;
      `, [
        r.id, r.title, r.course_id, r.language, r.category, r.difficulty, r.author,
        r.description, r.file_size, r.pages_or_read_time, r.unlock_cost,
        r.content_summary, r.pdf_preview_text, r.is_premium
      ]);
    }

    await client.query('COMMIT');
    console.log(`✅ ${libraryResourcesData.length} Library resources seeded successfully for 150-point unlocking!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding library:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLibrary();
