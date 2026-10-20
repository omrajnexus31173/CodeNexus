/**
 * Code Nexus — Comprehensive JavaScript Curriculum
 * Master topic definitions for JavaScript Track
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createEventLoopSvg, createControlFlowSvg } = require('./diagrams');

const javascriptTopics = [
  {
    id: 'js-variables-scope-coercion',
    course_id: 'javascript',
    unit_id: 'js-unit-1',
    title: 'var, let, const, Scope & Type Coercion',
    description: 'Master modern JS declarations, lexical block scope, hoisting, temporal dead zone (TDZ), implicit coercion, and == vs ===.',
    order_index: 1,
    learning_objectives: [
      'Understand the critical differences between var, let, and const',
      'Master function scope vs block scope and the Temporal Dead Zone (TDZ)',
      'Learn how implicit type coercion works and why strict equality (===) is mandatory'
    ],
    prerequisites: ['Basic programming logic'],
    expected_outcomes: ['Able to write clean, predictable JavaScript without hoisting bugs or unintended type coercion traps'],
    formal_definition: 'JavaScript employs lexical scoping where let and const introduce block-scoped bindings subject to the Temporal Dead Zone, while legacy var introduces function-scoped hoisted bindings. Equality comparison distinguishes between abstract equality (== with coercion) and strict equality (=== without coercion).',
    content_simple_english: `In early JavaScript (ES5 and earlier), developers had only one keyword: var.
var had dangerous design flaws:
1. It is function-scoped, NOT block-scoped (it leaks out of if blocks and for loops).
2. It is hoisted and initialized to undefined, causing silent bugs.

Modern JavaScript (ES6 / 2015+) introduced let and const:
- let: Block-scoped. Lives only inside the curly braces { } where it was declared. Cannot be re-declared.
- const: Block-scoped and immutable binding. The variable cannot be reassigned (though objects declared with const can still have their internal properties mutated!).

Equality:
- == (Loose Equality): Performs IMPLICIT TYPE COERCION before comparing! For example, "5" == 5 is TRUE, and [] == false is TRUE!
- === (Strict Equality): Checks BOTH value AND type without coercion! "5" === 5 is FALSE. In modern JavaScript, ALWAYS use ===!`,
    hinglish_explanation: `Pehle JavaScript me sirf var hota tha, jisme bohot saari galtiyan hoti thi (jaise loop ke bahar bhi variable zinda rehta tha).
ES6 me do naye keywords aaye:
1. let: Ye block-scoped hota hai { }. Yaani curly braces ke bahar mar jata hai. Isko re-declare nahi kar sakte.
2. const: Iski value ko aap dobara assign nahi kar sakte (jaise const pi = 3.14).

Sabse bada trap: == vs ===
- == (Loose): Ye chalaaki dikhata hai aur types ko zabardasti convert karta hai (jaise "0" == 0 ko true bol dega).
- === (Strict): Ye bina kisi conversion ke check karta hai ki Value aur Type dono same hain ya nahi ("0" === 0 false hoga). Production me hamesha === use karein!`,
    why_it_matters: 'Avoids subtle bugs that plague fullstack Node.js and browser applications, including variable leakage, race conditions in asynchronous loops, and security auth bypasses caused by loose equality coercion.',
    when_to_use: 'Use const by default for all variables. Use let only when you know the variable will be reassigned (like loop counters). Never use var in modern code.',
    syntax_guide: {
      template: 'const MAX_RETRIES = 3;\nlet currentAttempt = 0;\nif (x === y) { ... }',
      components: [
        { name: 'const', role: 'Block-scoped immutable variable binding', required: true },
        { name: 'let', role: 'Block-scoped reassignable variable', required: false },
        { name: '===', role: 'Strict equality operator without type coercion', required: true }
      ],
      rules: ['const must be initialized upon declaration', 'Accessing let/const before declaration throws ReferenceError (TDZ)', 'Always use strict equality ===']
    },
    code_example_1_title: 'Basic Foundational: Block Scope vs Function Scope',
    code_example_1_code: `function testScope() {
    if (true) {
        var functionScoped = "I leak outside this block!";
        let blockScoped = "I am safely contained inside this block!";
        const constantVal = 42;
        console.log("Inside block:", blockScoped);
    }
    console.log("Outside block (var):", functionScoped);
    // blockScoped is not accessible here!
}

testScope();`,
    code_example_1_explanation: 'Demonstrates that var leaks outside the if block, while let and const are strictly confined to the block scope {}.',
    code_example_1_output: `Inside block: I am safely contained inside this block!
Outside block (var): I leak outside this block!`,

    code_example_2_title: 'Intermediate Logic: The Loose Equality (==) Coercion Trap',
    code_example_2_code: `console.log('--- Type Coercion Comparison ---');
console.log('5 == "5"   :', 5 == "5");   // true (string coerced to number)
console.log('5 === "5"  :', 5 === "5");  // false (strict type mismatch)
console.log('0 == false :', 0 == false); // true
console.log('0 === false:', 0 === false);// false
console.log('null == undefined :', null == undefined);   // true
console.log('null === undefined:', null === undefined);  // false`,
    code_example_2_explanation: 'Proves why == causes confusing implicit conversions, whereas === strictly checks types and values.',
    code_example_2_output: `--- Type Coercion Comparison ---
5 == "5"   : true
5 === "5"  : false
0 == false : true
0 === false: false
null == undefined : true
null === undefined: false`,

    code_example_3_title: 'Practical Application: Safe Configuration Object Management',
    code_example_3_code: `// const guarantees reference cannot be rebound
const SERVER_CONFIG = Object.freeze({
    port: 3000,
    environment: "production",
    maxConnections: 1000
});

function connect(options) {
    const port = options.port ?? 8080; // Nullish coalescing
    const env = options.environment ?? "development";
    console.log(\`Connecting to server on port \${port} in \${env} mode.\`);
}

connect(SERVER_CONFIG);`,
    code_example_3_explanation: 'Combines const, Object.freeze() for deep immutability, and nullish coalescing (??) for default fallback parameters.',
    code_example_3_output: `Connecting to server on port 3000 in production mode.`,

    code_walkthrough: {
      code: `let x = 10;\n{\n    let x = 20;\n    console.log(x);\n}\nconsole.log(x);`,
      steps: [
        { line: 1, explanation: 'Outer variable x initialized to 10 in outer scope.', state: 'Outer x = 10' },
        { line: 2, explanation: 'New block entered; inner shadow variable x initialized to 20.', state: 'Inner x = 20' },
        { line: 4, explanation: 'Prints inner x: 20.', state: 'Stdout: 20' },
        { line: 5, explanation: 'Block ends; inner x destroyed.', state: 'Scope Popped' },
        { line: 6, explanation: 'Prints outer x: 10.', state: 'Stdout: 10' }
      ],
      output: '20\n10',
      output_reasoning: 'Block scoping creates a separate lexical environment where the inner x shadows outer x.'
    },

    rules_and_restrictions: [
      'Accessing let or const before their declaration triggers a ReferenceError (Temporal Dead Zone)',
      'const prevents reassignment of the variable binding, but does not deeply freeze object properties without Object.freeze()',
      'Always avoid == except in the rare idiomatic check for nullish (x == null)'
    ],
    common_mistakes: [
      {
        title: 'Asynchronous Loop Closure Trap with var',
        incorrect_code: `for (var i = 0; i < 3; i++) {\n    setTimeout(() => console.log(i), 10);\n} // Prints 3, 3, 3!`,
        explanation: 'Because var is function-scoped, all 3 timeout callbacks share the EXACT same single variable i, which is 3 by the time the timers fire.',
        corrected_code: `for (let i = 0; i < 3; i++) {\n    setTimeout(() => console.log(i), 10);\n} // Prints 0, 1, 2!`,
        error_message: 'Asynchronous state capture defect',
        debug_tip: 'Always use let in for loops; let creates a fresh binding for each iteration.'
      }
    ],
    comparison_table: {
      title: 'var vs let vs const in JavaScript',
      concept_a: 'var (Legacy)',
      concept_b: 'let / const (Modern ES6)',
      headers: ['Feature', 'var', 'let / const'],
      rows: [
        ['Scope', 'Function-scoped', 'Block-scoped { }'],
        ['Hoisting', 'Hoisted & initialized to undefined', 'Hoisted into Temporal Dead Zone (TDZ)'],
        ['Re-declaration', 'Permitted in same scope (Error prone)', 'Forbidden (SyntaxError)'],
        ['Re-assignment', 'Permitted', 'let: Yes; const: No']
      ]
    },
    diagram_svg: createEventLoopSvg(),
    practical_applications: [
      'Developing production Node.js REST APIs and web services',
      'Writing bug-free asynchronous React and Next.js frontend components'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the result of evaluating 0 == "0" vs 0 === "0" in JavaScript?',
        options: [
          'true and true',
          'true and false',
          'false and false',
          'false and true'
        ],
        correct_index: 1,
        explanation: '0 == "0" is true because loose equality coerces the string "0" into the number 0. 0 === "0" is false because number and string are different types.'
      }
    ],
    key_takeaways: [
      'Prefer const by default; use let when reassignment is needed; avoid var.',
      'let and const are block-scoped to curly braces { }.',
      'Always use === (strict equality) to prevent unintended type coercion bugs.'
    ],
    quick_revision_notes: 'var = function-scoped (hoisted); let/const = block-scoped (TDZ). === checks value and type without coercion.',
    assignment_prompt: 'Write a JavaScript program demonstrating const and let: declare a const array [10, 20], push 30 into it (proving internal mutability), and calculate sum using a let total accumulator.',
    assignment_starter_code: `// Demonstrate const array and let accumulator
const items = [10, 20];
// Add 30, compute sum, and log`,
    assignment_solution: `const items = [10, 20];
items.push(30);

let total = 0;
for (const val of items) {
    total += val;
}

console.log("Array items:", items);
console.log("Total sum  :", total);`
  },

  {
    id: 'js-async-promises',
    course_id: 'javascript',
    unit_id: 'js-unit-1',
    title: 'Asynchronous JavaScript, Promises & async/await',
    description: 'Master the non-blocking JavaScript execution model: callbacks, Promise lifecycle (.then/.catch), async/await, and error handling.',
    order_index: 2,
    learning_objectives: [
      'Understand why JavaScript is single-threaded and non-blocking',
      'Master Promise lifecycle states (pending, fulfilled, rejected)',
      'Write clean, readable asynchronous code using async/await and try/catch'
    ],
    prerequisites: ['var, let, const, Scope & Type Coercion'],
    expected_outcomes: ['Able to handle asynchronous APIs, network requests, and database calls without callback hell'],
    formal_definition: 'A Promise in JavaScript is an object representing the eventual completion or failure of an asynchronous operation and its resulting value. async/await is syntactic sugar built atop Promises and generators.',
    content_simple_english: `JavaScript runs on a single main thread. If JavaScript waited synchronously for a 2-second database query or API call, the entire browser or server would freeze completely!

To solve this, JavaScript uses non-blocking asynchronous programming:
1. Callbacks (Legacy): Passing a function to run when the task finishes. This quickly led to "Callback Hell" (deeply nested, unreadable code).
2. Promises (ES6): An object representing a future value.
   - States: Pending -> Fulfilled (resolved) OR Rejected (error).
   - Consumed with .then(result => ...) and .catch(err => ...).
3. async/await (ES8 / Modern): Allows you to write asynchronous code that LOOKS like clean synchronous code!
   - Mark function with async.
   - Use await in front of any Promise to pause until it resolves.
   - Wrap in try/catch for rock-solid error handling.`,
    hinglish_explanation: `JavaScript me ek hi thread (Single Thread) hota hai. Agar aapne 5 second ka file download chalu kiya aur JavaScript wahi ruk gayi, toh poori website freeze ho jayegi!

Isliye JS "Non-Blocking" kaam karti hai:
1. Promises: Ek vaada (promise) hota hai ki "Main abhi background me kaam kar raha hu, jab ho jayega toh result dunga ya error".
   - Fulfilled: Kaam safal ho gaya (.then).
   - Rejected: Koi error aa gayi (.catch).
2. async / await: Ye Promises ko use karne ka sabse sundar tarika hai!
   Aap function ke aage async likhte hain, aur jaha wait karna ho waha await likhte hain. Code bilkul normal synchronous code jaisa dikhta hai aur try/catch se errors handle ho jaate hain!`,
    why_it_matters: 'Almost all modern real-world JavaScript (fetching APIs, querying databases in Node.js, reading files) is asynchronous.',
    when_to_use: 'Use async/await for all network requests, database operations, and timers. Use Promise.all() when running multiple independent async tasks concurrently.',
    syntax_guide: {
      template: 'async function fetchData() {\n    try {\n        const res = await fetch(url);\n        const data = await res.json();\n        return data;\n    } catch (err) {\n        console.error(err);\n    }\n}',
      components: [
        { name: 'async', role: 'Keyword ensuring function returns a Promise', required: true },
        { name: 'await', role: 'Pauses async function execution until Promise settles', required: true },
        { name: 'try/catch', role: 'Standard error handling block for rejected promises', required: true }
      ],
      rules: ['await can only be used inside async functions (or top-level modules)', 'Uncaught promise rejections crash Node.js processes']
    },
    code_example_1_title: 'Basic Foundational: Creating and Resolving a Promise',
    code_example_1_code: `function fetchUser(userId) {
    return new Promise((resolve, reject) => {
        if (userId > 0) {
            resolve({ id: userId, username: "alex_morgan" });
        } else {
            reject(new Error("Invalid user ID"));
        }
    });
}

fetchUser(42)
    .then(user => console.log("User retrieved:", user.username))
    .catch(err => console.error("Fetch failed:", err.message));`,
    code_example_1_explanation: 'Demonstrates creating a Promise with resolve and reject branches, and consuming the settled result with .then() and .catch().',
    code_example_1_output: 'User retrieved: alex_morgan',

    code_example_2_title: 'Intermediate Logic: async/await with try/catch Error Handling',
    code_example_2_code: `function simulateApiCall(success) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (success) resolve({ status: 200, data: "Payload Ready" });
            else reject(new Error("Service Unavailable 503"));
        }, 10);
    });
}

async function executeTask() {
    try {
        console.log("Initiating request...");
        const response = await simulateApiCall(true);
        console.log("API Response:", response.data);
    } catch (err) {
        console.error("Caught Exception:", err.message);
    }
}

executeTask();`,
    code_example_2_explanation: 'Shows async/await syntax simplifying promise consumption with standard try/catch error boundaries.',
    code_example_2_output: `Initiating request...
API Response: Payload Ready`,

    code_example_3_title: 'Practical Application: Parallel Execution with Promise.all',
    code_example_3_code: `async function fetchOrders() {
    return ["Order #101", "Order #102"];
}
async function fetchUser() {
    return { name: "Alice", role: "Developer" };
}

async function loadDashboard() {
    console.log("Loading dashboard components in parallel...");
    // Concurrent execution: both queries run simultaneously!
    const [orders, user] = await Promise.all([fetchOrders(), fetchUser()]);

    console.log(\`Dashboard Ready for \${user.name} (\${user.role})\`);
    console.log(\`Active orders count: \${orders.length}\`);
}

loadDashboard();`,
    code_example_3_explanation: 'Demonstrates Promise.all() for concurrent operations. Reduces total response latency from T1+T2 down to max(T1, T2).',
    code_example_3_output: `Loading dashboard components in parallel...
Dashboard Ready for Alice (Developer)
Active orders count: 2`,

    code_walkthrough: {
      code: `async function test() {\n    const val = await Promise.resolve(42);\n    console.log(val);\n}\ntest();`,
      steps: [
        { line: 1, explanation: 'test() called; async function context created.', state: 'Context Created' },
        { line: 2, explanation: 'await yields control to event loop; microtask scheduled with value 42.', state: 'Microtask Queued' },
        { line: 3, explanation: 'Promise resolves; function resumes and prints 42.', state: 'Stdout: 42' }
      ],
      output: '42',
      output_reasoning: 'await pauses execution until Promise.resolve(42) settles, returning the value 42.'
    },

    rules_and_restrictions: [
      'Uncaught Promise rejections crash modern Node.js versions with non-zero exit code',
      'Never forget await when calling an async function; omitting await returns the Promise object, not the resolved value'
    ],
    common_mistakes: [
      {
        title: 'Missing await keyword',
        incorrect_code: `const user = getUser(); // Forgot await!\nconsole.log(user.name); // Prints undefined!`,
        explanation: 'Calling an async function without await returns an unresolved Promise object, so user.name is undefined.',
        corrected_code: `const user = await getUser();\nconsole.log(user.name);`,
        error_message: 'user is [object Promise], property name undefined',
        debug_tip: 'If an object prints as [object Promise] or {<pending>}, you forgot to await it.'
      }
    ],
    comparison_table: {
      title: 'Promises (.then) vs async/await',
      concept_a: 'Promises (.then/.catch)',
      concept_b: 'async/await',
      headers: ['Feature', 'Promises (.then)', 'async/await'],
      rows: [
        ['Readability', 'Chained callbacks, prone to nesting', 'Synchronous-looking flat code'],
        ['Error Handling', '.catch(err => ...)', 'Standard try { ... } catch (err) { ... }'],
        ['Debugging', 'Harder to set linear breakpoints', 'Step-by-step debugger steps smoothly through lines']
      ]
    },
    diagram_svg: createEventLoopSvg(),
    practical_applications: [
      'Fetching data from backend REST and GraphQL APIs in frontend apps',
      'Executing database transactions and third-party webhook dispatches in Node.js'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which method runs multiple promises concurrently and resolves only when ALL promises complete successfully?',
        options: ['Promise.race()', 'Promise.all()', 'Promise.any()', 'Promise.settle()'],
        correct_index: 1,
        explanation: 'Promise.all([p1, p2, ...]) executes all promises concurrently and returns a promise that resolves with an array of all results when all complete.'
      }
    ],
    key_takeaways: [
      'JavaScript uses an event loop to achieve non-blocking asynchronous execution.',
      'Promises represent future values in pending, fulfilled, or rejected states.',
      'async/await provides clean, readable syntax with standard try/catch error handling.'
    ],
    quick_revision_notes: 'Async: async function returns Promise. await pauses until resolved. Use try/catch. Promise.all() runs tasks in parallel.',
    assignment_prompt: 'Write an async function getStatus() that simulates an async operation returning "SYSTEM_OK" and await it in main logic.',
    assignment_starter_code: `// Write async function getStatus and call it with await
async function getStatus() {
    // Return "SYSTEM_OK"
}

async function run() {
    // await and log status
}
run();`,
    assignment_solution: `async function getStatus() {
    return "SYSTEM_OK";
}

async function run() {
    const status = await getStatus();
    console.log("Service Status:", status);
}
run();`
  }
];

module.exports = { javascriptTopics };
