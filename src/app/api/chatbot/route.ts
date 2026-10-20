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

    // --- MODE 1: LEARNING ASSISTANT ---
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
      } else {
        reply = `I am your **Code Nexus Learning Assistant**! 

I can explain any coding topic in simple, friendly English with diagrams, flowcharts, and clear examples across:
• **C & C++**: Pointers, Memory, Structs, OOP, Templates, STL, RAII.
• **Python**: Data structures, NumPy, Pandas, PyTorch, OpenCV.
• **Java**: JVM, Classes, Collections, Multithreading, Streams.
• **SQL & Databases**: Normalization, JOINs, CTEs, Window Functions, Indexing.
• **DSA & System Design**: Big O, Trees, Graphs, DP, Scaling, Caching.

Ask me about any concept or paste a compiler error you want help diagnosing!`;
        suggestions = ['Explain C pointers with an example', 'What is OOP Encapsulation?', 'How does SQL INNER JOIN work?'];
      }
    }

    // --- MODE 2: WEBSITE SUPPORT ASSISTANT ---
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
• **Question Bank**: 50–100 questions randomized dynamically from the question pool.
• **Fullscreen Mode**: Monitored examination. If you exit fullscreen or switch browser tabs, the system issues warning alerts. Repeated violations will end the examination.
• **Passing Score**: You must score **strictly more than 85%** to pass!
• **Certificate**: If you score > 85%, you receive an official, cryptographically verifiable Code Nexus Certificate with a unique ID (e.g. \`CN-CERT-2026-XXXX\`) and public verification link, plus **+10 points**!`;
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
