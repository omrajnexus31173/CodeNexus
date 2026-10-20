/**
 * Code Nexus — Comprehensive Curriculum: DSA, Web & Distributed Systems
 * Covers DSA, HTML/CSS, App Dev, and System Design tracks
 * Strictly adheres to 14-Section Educational Standard.
 */

const { createBoxModelSvg, createControlFlowSvg } = require('./diagrams');

const dsaTopics = [
  {
    id: 'dsa-big-o-notation',
    course_id: 'dsa',
    unit_id: 'dsa-unit-1',
    title: 'Asymptotic Analysis & Big-O Notation',
    description: 'Master time and space complexity: Big-O, Big-Omega, Big-Theta, common complexity classes (O(1) to O(2^N)), and algorithm scaling.',
    order_index: 1,
    learning_objectives: [
      'Understand how algorithms scale with input size N',
      'Master Big-O upper bounds, Big-Omega lower bounds, and Big-Theta tight bounds',
      'Analyze time and auxiliary space complexity of iterative and recursive algorithms'
    ],
    prerequisites: ['Basic loops and functions'],
    expected_outcomes: ['Able to analyze any algorithm time and space complexity and eliminate quadratic bottlenecks'],
    formal_definition: 'Big-O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards infinity, characterizing algorithm execution time or memory requirements as an upper bound.',
    content_simple_english: `When comparing algorithms, we do not measure time in seconds or milliseconds, because a supercomputer will always run faster than an old smartphone.
Instead, computer scientists measure **how the number of operations grows as the input size (N) grows towards infinity**! This is called Big-O Notation.

Common Time Complexity Classes (from Fastest to Slowest):
1. O(1) - Constant Time: Hash table lookup, accessing array index arr[5]. Takes the exact same time whether N is 10 or 10,000,000!
2. O(log N) - Logarithmic Time: Binary search. Cuts the search space in half each step (N=1,000,000 takes only ~20 steps)!
3. O(N) - Linear Time: Single loop iterating through an array of N items.
4. O(N log N) - Linearithmic Time: Optimal comparison sorting (Merge Sort, Quick Sort, Timsort).
5. O(N^2) - Quadratic Time: Nested loops (Bubble Sort). Becomes painfully slow on large datasets (N=100,000 means 10,000,000,000 operations!).
6. O(2^N) - Exponential Time: Recursive Fibonacci without memoization. Doubles with every single additional item!`,
    hinglish_explanation: `Agar do programmers same problem solve karte hain, toh kaise pata chale kiska code behtar hai? Hum clock se seconds nahi naapte, balki ye dekhte hain ki jab Data (N) 10 se badhkar 10 lakh ho jayega, toh kaunsa code crash hoga aur kaunsa rocket ki tarah chalega!

Isi ko **Big-O Notation** kehte hain:
- O(1) [Superfast]: Array index check karna arr[0]. Data chahe kitna bhi bada ho, 1 step lagega.
- O(log N) [Bohot Fast]: Binary Search. Har step pe data aadha ho jata hai. 10 lakh items me se dhoondne me sirf 20 steps lagenge!
- O(N) [Normal]: Ek single loop jo poori list pe chalta hai.
- O(N^2) [Slow]: Nested loops (loop ke andar doosra loop). N bada hote hi system hang ho jayega!
- O(2^N) [Khatarnak]: Har step pe kaam double ho jata hai.`,
    why_it_matters: 'A program with O(N^2) complexity handling 1,000,000 records takes days to run. The same program rewritten with O(N log N) complexity completes in less than a second.',
    when_to_use: 'Analyze Big-O before writing production code. Aim for O(1) or O(log N) for lookups, O(N) or O(N log N) for data processing. Avoid O(N^2) on datasets larger than 10,000 items.',
    syntax_guide: {
      template: '// O(1): constant lookup\nint val = arr[index];\n\n// O(N): linear scan\nfor (int i = 0; i < n; i++) { ... }\n\n// O(N^2): nested loop\nfor (int i=0; i<n; i++) for (int j=0; j<n; j++) { ... }',
      components: [
        { name: 'O(1)', role: 'Independent of input size N', required: true },
        { name: 'O(N)', role: 'Scales linearly with input size N', required: true },
        { name: 'O(N^2)', role: 'Scales quadratically; dangerous for large datasets', required: true }
      ],
      rules: ['Drop non-dominant terms: O(N^2 + 5N + 100) simplifies to O(N^2)', 'Drop constant coefficients: O(3N) simplifies to O(N)']
    },
    code_example_1_title: 'Basic Foundational: O(1) vs O(N) Search Demo',
    code_example_1_code: `#include <stdio.h>

// O(1): Constant time element access
int getFirst(const int arr[], int size) {
    return arr[0];
}

// O(N): Linear search scanning up to N items
int linearSearch(const int arr[], int size, int target) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main(void) {
    int data[] = {10, 20, 30, 40, 50};
    printf("O(1) First Element: %d\\n", getFirst(data, 5));
    printf("O(N) Search Index : %d\\n", linearSearch(data, 5, 30));
    return 0;
}`,
    code_example_1_explanation: 'getFirst() takes 1 step regardless of array size. linearSearch() takes up to N steps in the worst case.',
    code_example_1_output: `O(1) First Element: 10
O(N) Search Index : 2`,

    code_example_2_title: 'Intermediate Logic: Nested Loops Quadratic Complexity O(N^2)',
    code_example_2_code: `#include <stdio.h>

// O(N^2): Compares every pair
void printAllPairs(const int arr[], int n) {
    int comparisons = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            comparisons++;
        }
    }
    printf("Array size N = %d -> Total Operations = %d (N^2)\\n", n, comparisons);
}

int main(void) {
    int a4[] = {1, 2, 3, 4};
    int a8[] = {1, 2, 3, 4, 5, 6, 7, 8};
    printAllPairs(a4, 4);
    printAllPairs(a8, 8);
    return 0;
}`,
    code_example_2_explanation: 'Doubling N from 4 to 8 quadruples operations from 16 to 64, demonstrating the quadratic explosion of O(N^2).',
    code_example_2_output: `Array size N = 4 -> Total Operations = 16 (N^2)
Array size N = 8 -> Total Operations = 64 (N^2)`,

    code_example_3_title: 'Practical Application: Two-Sum Optimization from O(N^2) to O(N)',
    code_example_3_code: `#include <stdio.h>

// Optimized two-pointer approach on sorted array in O(N) time and O(1) space
int twoSumSorted(const int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) {
            printf("Pair found: %d + %d = %d\\n", arr[left], arr[right], target);
            return 1;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return 0;
}

int main(void) {
    int sortedNums[] = {2, 7, 11, 15, 20};
    int target = 22;
    twoSumSorted(sortedNums, 5, target);
    return 0;
}`,
    code_example_3_explanation: 'Optimizes a naive O(N^2) nested loop into a sleek O(N) two-pointer algorithm on sorted input.',
    code_example_3_output: `Pair found: 2 + 20 = 22`,

    code_walkthrough: {
      code: `for (int i=0; i<N; i++) {\n    for (int j=0; j<N; j++) { ... }\n}`,
      steps: [
        { line: 1, explanation: 'Outer loop iterates N times from 0 to N-1.', state: 'Outer Loop: N cycles' },
        { line: 2, explanation: 'For EACH outer iteration, inner loop executes N times.', state: 'Inner Loop: N cycles per outer' },
        { line: 2, explanation: 'Total computational work = N * N = N^2 operations.', state: 'Complexity: O(N^2)' }
      ],
      output: 'Quadratic Growth',
      output_reasoning: 'Nested loops over the same input size multiply to produce O(N^2) time complexity.'
    },

    rules_and_restrictions: [
      'Big-O considers the worst-case scenario unless specified otherwise',
      'Constant coefficients are dropped: O(500N) is simply O(N)',
      'Memory allocated on Stack and Heap for data structures counts towards Space Complexity'
    ],
    common_mistakes: [
      {
        title: 'Ignoring String Concatenation Inside Loops',
        incorrect_code: `String s = "";\nfor (int i=0; i<N; i++) s += i; // In Java/JS creates O(N^2) copies!`,
        explanation: 'Because strings are immutable in Java and Python, += re-copies the entire string each iteration, turning an apparent O(N) loop into an O(N^2) performance disaster.',
        corrected_code: `StringBuilder sb = new StringBuilder();\nfor (int i=0; i<N; i++) sb.append(i); // O(N)`,
        error_message: 'Catastrophic quadratic performance degradation on large strings',
        debug_tip: 'Use StringBuilder (Java) or array join (JS/Python) for repeated concatenation.'
      }
    ],
    comparison_table: {
      title: 'Common Time Complexity Classes Comparison',
      concept_a: 'O(log N)',
      concept_b: 'O(N^2)',
      headers: ['N Items', 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)'],
      rows: [
        ['N = 10', '1 op', '3 ops', '10 ops', '33 ops', '100 ops'],
        ['N = 1,000', '1 op', '10 ops', '1,000 ops', '10,000 ops', '1,000,000 ops'],
        ['N = 1,000,000', '1 op', '20 ops', '1,000,000 ops', '20,000,000 ops', '1,000,000,000,000 ops (Freeze!)']
      ]
    },
    diagram_svg: createControlFlowSvg('Algorithm Choice', 'Data size > 100,000?', 'Require O(N log N) or O(N)', 'O(N^2) acceptable for tiny N', 'Optimal'),
    practical_applications: [
      'Database query optimization and index design (B-Trees allow O(log N) searches over millions of rows)',
      'High-throughput real-time game physics engines'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST) of size N?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correct_index: 1,
        explanation: 'In a balanced Binary Search Tree, each comparison cuts the search space in half, resulting in logarithmic time complexity O(log N).'
      }
    ],
    key_takeaways: [
      'Big-O measures how algorithm operations scale as input size N grows towards infinity.',
      'O(1) and O(log N) are lightning fast; O(N) is standard; O(N^2) slows down rapidly.',
      'Drop constants and lower-order terms when simplifying Big-O expressions.'
    ],
    quick_revision_notes: 'Complexity hierarchy: O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N). Binary search is O(log N). Nested loops are O(N^2).',
    assignment_prompt: 'Write a C function that checks whether an UNSORTED array contains any duplicate. Use either (a) sort a copy, then scan adjacent values — O(N log N) time and O(N) auxiliary space for the copy — or (b) a hash-set approach. The input array must not be modified. Test with {5, 1, 9, 5, 3}.',
    assignment_starter_code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// TODO: return 1 if any value repeats in arr[0..n-1], else 0.
// Do not modify arr. Handle n < 2 and allocation failure safely.
int hasDuplicate(const int arr[], int n) {
    return 0;
}

int main(void) {
    int nums[] = {5, 1, 9, 5, 3};
    printf(hasDuplicate(nums, 5) ? "Duplicate found\\n" : "No duplicate\\n");
    return 0;
}`,
    assignment_solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int compareInts(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

// Sort-a-copy approach: O(N log N) time, O(N) auxiliary space.
int hasDuplicate(const int arr[], int n) {
    if (n < 2) return 0;

    int *copy = malloc((size_t)n * sizeof *copy);
    if (copy == NULL) return 0; // cannot prove a duplicate exists

    memcpy(copy, arr, (size_t)n * sizeof *copy);
    qsort(copy, (size_t)n, sizeof *copy, compareInts);

    int found = 0;
    for (int i = 1; i < n; i++) {
        if (copy[i] == copy[i - 1]) {
            found = 1;
            break;
        }
    }
    free(copy);
    return found;
}

int main(void) {
    int nums[] = {5, 1, 9, 5, 3}; // deliberately unsorted
    if (hasDuplicate(nums, 5)) {
        printf("Duplicate found after sorting a copy: O(N log N)\\n");
    } else {
        printf("No duplicate\\n");
    }
    return 0;
}`
  }
];

const webTopics = [
  {
    id: 'css-flexbox-grid',
    course_id: 'html-css',
    unit_id: 'html-unit-1',
    title: 'Modern CSS Layouts: Flexbox vs CSS Grid',
    description: 'Master modern responsive layout systems: Flexbox (1-dimensional alignment) and CSS Grid (2-dimensional row/column layouts).',
    order_index: 1,
    learning_objectives: [
      'Understand the Box Model (Margin, Border, Padding, Content)',
      'Master Flexbox 1-dimensional axes (main axis vs cross axis)',
      'Master CSS Grid 2-dimensional track sizing with grid-template-columns and fr units'
    ],
    prerequisites: ['Basic HTML tags'],
    expected_outcomes: ['Able to construct responsive modern web layouts without fragile float or positioning hacks'],
    formal_definition: 'CSS Flexible Box Layout (Flexbox) provides a 1-dimensional layout model for distributing space and aligning items along a main axis and cross axis. CSS Grid Layout provides a 2-dimensional system managing both columns and rows simultaneously.',
    content_simple_english: `In the early days of the web, developers had to use HTML <table> tags or CSS float hacks to build layouts, which broke easily on mobile phones.
Modern CSS revolutionized layout with two complementary systems:
1. The CSS Box Model:
   Every element is a box containing Content -> surrounded by Padding -> surrounded by Border -> surrounded by external Margin.
   Always use * { box-sizing: border-box; } so padding does not unintentionally increase the width of elements!

2. Flexbox (display: flex) - 1D Layout:
   Best for a single row OR a single column (e.g. navbars, button groups, centering an item).
   - justify-content: aligns along the main axis (horizontal by default).
   - align-items: aligns along the cross axis (vertical by default).
   - Centering a div is as simple as: display: flex; justify-content: center; align-items: center;!

3. CSS Grid (display: grid) - 2D Layout:
   Best when you have BOTH rows and columns (e.g. photo galleries, dashboard cards, full-page layouts).
   - grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); creates a fully responsive grid without writing any media queries!`,
    hinglish_explanation: `Purane zamane me website banana bohot mushkil hota tha (float use karte the jo mobile me toot jata tha).
CSS ne do super-tools diye:
1. Flexbox (display: flex):
   Ye 1-Dimensional (ek line) ke liye hota hai—jaise Navbar ke buttons ko line me lagana ya kisi element ko screen ke theek beech me (Center) lana:
   display: flex; justify-content: center; align-items: center; (Ye 3 lines likhte hi element perfect center me aa jata hai!)
2. CSS Grid (display: grid):
   Ye 2-Dimensional (Rows aur Columns dono) ke liye hota hai—jaise Dashboard ke cards ya product gallery.
   Grid me aap bol sakte ho: "Mujhe 3 columns chahiye jo mobile me apne aap 1 column ban jayein"!`,
    why_it_matters: 'Every modern web application (React, Next.js, Tailwind, Vue) is built entirely with Flexbox and CSS Grid.',
    when_to_use: 'Use Flexbox for component-level items (navbars, card headers, centering). Use Grid for page-level layouts (sidebar + content + header, multi-card dashboards).',
    syntax_guide: {
      template: '/* Flexbox */\n.navbar {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n/* Grid */\n.card-grid {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 1.5rem;\n}',
      components: [
        { name: 'display: flex', role: 'Converts element into flex container', required: true },
        { name: 'justify-content', role: 'Aligns items along main axis (flex-start, center, space-between)', required: false },
        { name: 'display: grid', role: 'Converts element into 2D grid container', required: true }
      ],
      rules: ['Always set box-sizing: border-box on universal selector *', 'Flexbox is 1D; Grid is 2D']
    },
    code_example_1_title: 'Basic Foundational: Perfect Centering with Flexbox',
    code_example_1_code: `/* Perfect horizontal and vertical centering */
.hero-banner {
    display: flex;
    justify-content: center; /* Main axis center */
    align-items: center;     /* Cross axis center */
    min-height: 200px;
    background-color: #0f172a;
    border-radius: 12px;
}

.hero-content {
    color: #38bdf8;
    font-size: 1.5rem;
    font-weight: bold;
}`,
    code_example_1_explanation: 'Setting display: flex, justify-content: center, and align-items: center centers any child element in both dimensions with zero calculation.',
    code_example_1_output: 'Renders element perfectly centered in both horizontal and vertical axes.',

    code_example_2_title: 'Intermediate Logic: Responsive Navbar with Flexbox space-between',
    code_example_2_code: `.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #0b1120;
    border-bottom: 1px solid #1e293b;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
    list-style: none;
}`,
    code_example_2_explanation: 'Uses space-between to push the logo to the far left and the navigation links to the far right, with gap: 1.5rem creating clean gutters.',
    code_example_2_output: 'Renders sleek navigation bar with logo on left and evenly spaced links on right.',

    code_example_3_title: 'Practical Application: Self-Responsive Card Grid with 1fr',
    code_example_3_code: `.dashboard-grid {
    display: grid;
    /* Auto-responsive: wraps automatically from 3 cols on desktop to 1 col on mobile */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
}

.card {
    background: #1e293b;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #334155;
}`,
    code_example_3_explanation: 'The repeat(auto-fit, minmax(280px, 1fr)) pattern creates a fully fluid responsive grid without writing a single media query.',
    code_example_3_output: 'Renders responsive card layout automatically adapting column count to viewport width.',

    code_walkthrough: {
      code: `.container { display: flex; justify-content: space-between; }`,
      steps: [
        { line: 1, explanation: 'Container becomes flex formatting context.', state: 'Flex Formatting Context' },
        { line: 1, explanation: 'Children elements positioned along main axis.', state: 'Main Axis Aligned' },
        { line: 1, explanation: 'Remaining free space distributed evenly between children.', state: 'Space Distributed' }
      ],
      output: 'Space-between layout applied',
      output_reasoning: 'First item is pinned to left edge, last item to right edge, remaining distributed in between.'
    },

    rules_and_restrictions: [
      'float and clear properties have no effect on flex and grid items',
      'The margin: 0 auto trick only works on block elements with a declared width'
    ],
    common_mistakes: [
      {
        title: 'Forgetting box-sizing: border-box',
        incorrect_code: `div { width: 100%; padding: 20px; } /* Causes horizontal scrollbar! */`,
        explanation: 'In the default box-sizing: content-box model, padding is ADDED to width, making the element 100% + 40px wide, causing horizontal page overflow.',
        corrected_code: `* { box-sizing: border-box; }\ndiv { width: 100%; padding: 20px; }`,
        error_message: 'Unintended page horizontal scrollbar defect',
        debug_tip: 'Always declare * { box-sizing: border-box; } at the top of your global CSS.'
      }
    ],
    comparison_table: {
      title: 'Flexbox vs CSS Grid',
      concept_a: 'Flexbox',
      concept_b: 'CSS Grid',
      headers: ['Feature', 'Flexbox (1D)', 'CSS Grid (2D)'],
      rows: [
        ['Dimensions', '1-Dimensional (Row OR Column)', '2-Dimensional (Rows AND Columns simultaneously)'],
        ['Content vs Layout', 'Content-first (Items dictate their sizes)', 'Layout-first (Grid tracks dictate item sizes)'],
        ['Best Use Case', 'Navbars, buttons, toolbars, centering', 'Page layouts, card dashboards, photo galleries']
      ]
    },
    diagram_svg: createBoxModelSvg(),
    practical_applications: [
      'Responsive web applications adapting smoothly across mobile, tablet, and 4K desktop screens',
      'Modern SaaS dashboards with sticky sidebars and fluid card grids'
    ],
    quiz_questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which CSS property centers items along the Cross Axis in a Flexbox container?',
        options: ['justify-content', 'align-items', 'align-content', 'text-align'],
        correct_index: 1,
        explanation: 'align-items controls alignment along the cross axis (vertical in row direction). justify-content controls the main axis.'
      }
    ],
    key_takeaways: [
      'The CSS Box Model consists of Content, Padding, Border, and Margin.',
      'Flexbox is ideal for 1-dimensional alignment (navbars, centering).',
      'CSS Grid is ideal for 2-dimensional layouts (dashboards, multi-column pages).'
    ],
    quick_revision_notes: 'Box Model: Content -> Padding -> Border -> Margin. Flexbox = 1D (justify-content, align-items). Grid = 2D (grid-template-columns, fr units).',
    assignment_prompt: 'Write CSS for a responsive card grid with a 1rem gap: three equal columns on wide screens, fewer columns as width shrinks, and one column on narrow/mobile widths. Use CSS Grid (auto-fit/minmax or breakpoints).',
    assignment_starter_code: `/* Define .card-grid using CSS Grid.
   Requirement: max 3 columns on desktop, 1 column on narrow screens. */
.card-grid {

}`,
    assignment_solution: `.card-grid {
    display: grid;
    gap: 1rem;
    /* One column by default (mobile-first). */
    grid-template-columns: 1fr;
}

@media (min-width: 600px) {
    .card-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 900px) {
    .card-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}`
  }
];

module.exports = {
  dsaTopics,
  webTopics
};
