import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, mode = 'learning', context = {} } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase().trim();

    let reply = '';
    let suggestions: string[] = [];

    // --- MODE 1: BUILT-IN LEARNING GUIDE ---
    if (mode === 'learning') {
      if (lowerMsg.includes('pointer') || lowerMsg.includes('memory') || lowerMsg.includes('address')) {
        reply = `**Understanding Pointers & Memory in Simple English:**

A Pointer is simply a variable that stores a **memory address** (where another variable lives in RAM).

1. **Address-of Operator (\`&\`)**: Finds the address.
   \`int x = 42;\` -> \`&x\` is the address (like House #104).
2. **Dereference Operator (\`*\`)**: Visits the address to read or write the actual value!
   \`int *ptr = &x;\` -> \`*ptr = 100;\` changes \`x\` to 100!

💡 **Key Tip**: Always initialize pointers (e.g. to \`NULL\`) so you don't create "Wild Pointers" that point to random RAM and cause segmentation faults!`;
        suggestions = ['Explain malloc vs calloc', 'Show pointer arithmetic example', 'Difference between pointer and reference in C++'];
      } else if (lowerMsg.includes('malloc') || lowerMsg.includes('free') || lowerMsg.includes('memory leak')) {
        reply = `**Dynamic Memory Allocation in Simple Terms:**

• **Stack Memory**: Automatically managed for function variables. Fast, but fixed size.
• **Heap Memory**: Manual RAM you request dynamically at runtime via \`malloc(size)\`.
• **malloc vs calloc**: \`malloc(bytes)\` leaves the new bytes uninitialized; \`calloc(count, elementSize)\` allocates an array and zeroes its bytes.

⚠️ **Golden Rule**: For every \`malloc()\` or \`calloc()\`, there MUST be an equal \`free()\`! If you discard a pointer without calling \`free(ptr)\`, that memory stays reserved until the OS terminates your app (called a **Memory Leak**).

In C++, prefer Modern Smart Pointers (\`std::unique_ptr\`) which automatically free themselves!`;
        suggestions = ['How does realloc work?', 'What is double free error?'];
      } else if (lowerMsg.includes('recursion') || lowerMsg.includes('recursive')) {
        reply = `**Recursion Demystified:**

Recursion is when a function calls itself to solve smaller sub-pieces of the same problem.

Every recursive function MUST have two parts:
1. **Base Case**: The stop condition that returns immediately without calling itself (e.g., \`if (n <= 1) return 1;\`).
2. **Recursive Step**: Calling itself with a smaller input approaching the base case (e.g., \`return n * factorial(n - 1);\`).

Without a base case, your stack memory fills up and crashes with a **Stack Overflow** error!`;
        suggestions = ['Show Fibonacci recursion with memoization', 'Compare recursion vs iteration'];
      } else if (lowerMsg.includes('error') || lowerMsg.includes('segmentation fault') || lowerMsg.includes('segfault')) {
        reply = `**Debugging a Segmentation Fault (Core Dumped):**

A segmentation fault happens when your program tries to access memory it does not own. Common causes:
1. Dereferencing a \`NULL\` or uninitialized pointer (\`int *p; *p = 5;\`).
2. Array index out-of-bounds (accessing index 10 in an array of size 5).
3. Stack overflow from an infinite recursive call loop.
4. Using a pointer after calling \`free()\` on it (Dangling pointer).

💡 **Fix**: Run your code with \`gdb\` or insert \`printf\` checkpoints before and after pointer operations to isolate the exact line!`;
        suggestions = ['How to use Valgrind?', 'How to avoid array bounds errors'];
      } else if (lowerMsg.includes('big o') || lowerMsg.includes('complexity') || lowerMsg.includes('time complexity')) {
        reply = `**Big O Notation Made Simple:**

Big O measures how long your algorithm takes as your data size (N) grows:

• **O(1) Constant**: Instant. Doesn't matter if N is 10 or 10,000,000 (e.g., array index lookup \`arr[0]\`).
• **O(log N) Logarithmic**: Super fast. Halves the problem each step (e.g., Binary Search).
• **O(N) Linear**: One single loop through the data.
• **O(N log N)**: Fastest comparison sorting (Merge Sort, Quick Sort).
• **O(N²)**: Nested loops (e.g., Bubble sort). Gets slow quickly on large data!`;
        suggestions = ['Difference between time and space complexity', 'How to analyze two nested loops'];
      } else if (lowerMsg.includes('encapsulation') || lowerMsg.includes('oop') || lowerMsg.includes('object oriented') || lowerMsg.includes('object-oriented')) {
        reply = `**OOP Encapsulation in Simple Terms:**

Encapsulation means keeping an object's internal data private and exposing only safe operations.

Example:
• A \`BankAccount\` keeps \`balance\` private.
• Other code cannot set the balance to a negative value directly.
• It must call checked operations such as \`deposit(amount)\` or \`withdraw(amount)\`.

This protects the object's rules in one place. In C++ use \`private\` fields with public member functions; in Java use private fields with validated methods. Getters/setters alone are not automatically good encapsulation—the public operations should preserve valid state.`;
        suggestions = ['Explain C pointers with an example', 'Explain Big O time complexity', 'How does SQL INNER JOIN work?'];
      } else if (lowerMsg.includes('inner join') || lowerMsg.includes('sql join') || lowerMsg.includes(' join')) {
        reply = `**How SQL INNER JOIN Works:**

An \`INNER JOIN\` returns only rows that have a matching row in both tables.

Example:
\`SELECT s.name, c.title FROM students s INNER JOIN courses c ON c.id = s.course_id;\`

• A student whose \`course_id\` matches a course appears in the result.
• A student with no matching course is excluded.
• A course with no matching student is also excluded.

Use \`LEFT JOIN\` instead when every row from the left table must appear even if there is no match. Always write the join condition in \`ON\`; forgetting it can create an unintended cross-product of rows.`;
        suggestions = ['Explain Big O time complexity', 'Explain C pointers with an example', 'What is OOP encapsulation?'];
      } else {
        reply = `I am the built-in **Code Nexus Learning Guide**.

I provide short explanations for selected foundations:
• C pointers and memory addresses
• \`malloc\`, \`free\`, and memory leaks
• Recursion and segmentation faults
• Big O complexity
• OOP encapsulation
• SQL \`INNER JOIN\` and \`LEFT JOIN\`

For complete lessons, examples, quizzes, and practice, open the relevant topic from **Courses**. I am a keyword-based guide, so please include one of the concepts above for a focused explanation.`;
        suggestions = ['Explain C pointers with an example', 'What is OOP Encapsulation?', 'How does SQL INNER JOIN work?'];
      }
    }

    // --- MODE 2: WEBSITE SUPPORT GUIDE ---
    else {
      if (lowerMsg.includes('point') || lowerMsg.includes('score') || lowerMsg.includes('how to earn')) {
        reply = `**Code Nexus Points & Scoring Rules:**

Here is the exact points breakdown:
• **+4 Points**: For each practice question solved correctly!
• **-1 Point**: For each hint used (up to 2 hints per question).
• **0 Points**: If you reveal the answer using "Reveal Solution" without solving it.
• **+50 Points**: Awarded upon completing all topics in any Course!
• **+10 Points**: Awarded upon passing a Certification Exam (> 85% score).
• **0 Points**: If an exam is failed.
• **-150 Points**: Unlocks any premium book, notes, or cheatsheet permanently in your **Library**!`;
        suggestions = ['How do I unlock a library book?', 'How do I earn a certificate?'];
      } else if (lowerMsg.includes('exam') || lowerMsg.includes('certificate') || lowerMsg.includes('pass')) {
        reply = `**Code Nexus Examination & Certificate Guidelines:**

• **Duration**: 2 Hours (7200 seconds).
• **Questions**: Each supported exam contains **25 questions** drawn only from that exact course's tested, eligible strict pool.
• **Availability**: Exams are supported for C, C++, Python, Java, JavaScript, SQL & Databases, DSA, and System Design. HTML/CSS and App Development exams remain unavailable until a deterministic grader/runtime is integrated.
• **Fullscreen Mode**: Monitored examination. If you exit fullscreen or switch browser tabs, the system issues warning alerts. Repeated violations will end the examination.
• **Passing Score**: You must score **strictly more than 85%** to pass!
• **Certificate**: If you score > 85%, you receive a Code Nexus certificate record with a unique ID (for example \`CN-CERT-2026-XXXX\`) that can be checked on the public verification page, plus **+10 points**!`;
        suggestions = ['Where can I verify a certificate?', 'Can I retake an exam if I fail?'];
      } else if (lowerMsg.includes('library') || lowerMsg.includes('unlock') || lowerMsg.includes('book')) {
        reply = `**Code Nexus Resource Library:**

The Library houses high-grade textbooks, architecture blueprints, interview cheat sheets, and deep-dive notes.

• **Unlocking Rule**: Once you accumulate **150 points**, you can unlock any premium book or notes forever!
• **Permanent Access**: Once unlocked, it is added to your personal "Unlocked Library" and you can read the rich preview or download it at any time.`;
        suggestions = ['How do I earn 150 points fast?', 'What books are available in library?'];
      } else if (lowerMsg.includes('resume') || lowerMsg.includes('cv') || lowerMsg.includes('pdf')) {
        reply = `**Automated Career Profile & Resume Builder:**

• **Career Profile**: Automatically updates as you complete courses and earn verified certificates! You can also add your bio, education, work experience (with **up to 2 photos** per experience), and projects.
• **Resume Builder**: Choose between ATS-friendly professional templates (Modern Tech, Classic Executive, Minimalist).
• **Download**: Download your customized, print-ready resume as a clean PDF with selectable text!`;
        suggestions = ['Where is the resume builder?', 'How to add job experience photos?'];
      } else if (lowerMsg.includes('theme') || lowerMsg.includes('dark') || lowerMsg.includes('color') || lowerMsg.includes('background')) {
        reply = `**Customizing Themes and Background Colors:**

Code Nexus provides 3 appearance modes:
1. **Dark Mode** (Default)
2. **Light Mode**
3. **System Mode** (Matches your OS setting)

🎨 **Custom Background Color**: Go to **Settings** ('/settings') to choose your preferred custom background color using the interactive color palette or hex color picker!`;
        suggestions = ['Take me to Settings', 'How to change editor font size'];
      } else {
        reply = `Welcome to **Code Nexus Support**! 

I am here to guide you through all features of the Code Nexus platform:
• **Dashboard & Learning Paths**: 10 comprehensive courses from C to System Design.
• **Practice Arena**: Code editor with real compilation in Python, C, C++, Java, JS, and SQL.
• **Points & Scoring**: +4 for questions, -1 per hint, +50 for courses, +10 for exams.
• **Exams & Certificates**: Fullscreen exams, > 85% passing score, verifiable certificates.
• **Resource Library**: Unlock premium books with 150 points.
• **Career Profile & Resume**: ATS-ready PDF generator with verified skills.
• **Themes**: Dark, Light, System, and custom background color picker!

How can I help you today?`;
        suggestions = ['How does the points system work?', 'Tell me about exams and certificates', 'How does the resume builder work?'];
      }
    }

    return NextResponse.json({
      reply,
      mode,
      suggestions,
    });
  } catch (err: any) {
    console.error('Chatbot API error:', err);
    return NextResponse.json({ error: 'Chatbot service error' }, { status: 500 });
  }
}
