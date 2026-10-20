'use strict';
/**
 * Audit-driven diagram overrides.
 *
 * The 2026 quality audit found several lessons reusing an identical generic
 * process-memory, JavaScript event-loop, or CSS box-model SVG even when that
 * image did not explain the lesson. Those topics now receive a topic-specific
 * process diagram generated from the steps below. The override is applied in
 * master-curriculum.js (and therefore by the seeder) so source, database and
 * ZIP all stay in sync.
 */
const { createConceptProcessSvg } = require('./diagrams');

const DIAGRAM_OVERRIDES = {
  'c-history-and-origin': ['How C became a portable systems language', ['1972: C created at Bell Labs', 'Unix is rewritten in C', 'K&R documents the language', 'ANSI / ISO standards evolve'], 'Portability came from a small language plus standard compilers and libraries.'],
  'c-structure-of-a-program': ['Anatomy of a C program', ['#include brings declarations', 'main() is the entry point', 'Statements run in order', 'return reports exit status'], 'The compiler needs declarations before use; execution starts at main.'],
  'c-compilation-process': ['From C source to executable', ['Preprocess directives & macros', 'Compile to object code', 'Assemble machine instructions', 'Link objects & libraries'], 'Each stage can fail independently; read the first diagnostic from the failing stage.'],
  'c-datatypes-modifiers': ['Choosing a C integer type', ['Pick signed or unsigned', 'Check range and sizeof', 'Apply short / long modifiers', 'Convert deliberately'], 'The type fixes representation, range and the result of arithmetic promotion.'],
  'c-standard-io': ['Standard I/O data flow', ['stdin supplies characters', 'scanf parses & converts', 'Program computes a result', 'printf formats to stdout'], 'Always check scanf’s return count before trusting converted values.'],
  'c-escape-sequences': ['What happens to an escape sequence', ['Compiler sees backslash code', 'One control character is stored', 'String carries that byte', 'Terminal renders its effect'], 'For example, \\n is one newline character, not two printable characters.'],
  'c-keywords-identifiers': ['Keywords versus identifiers', ['Scanner reads a token', 'Keyword has fixed grammar meaning', 'Identifier names your entity', 'Compiler rejects collisions'], 'Keywords are reserved by the language; identifiers are names chosen by the programmer.'],
  'c-constants-literals': ['Constants and literals', ['Literal appears in source', 'Compiler assigns its type', 'const makes an object read-only', '#define substitutes text'], 'Prefer typed const objects or enums when a name needs scope and type checking.'],
  'c-structures-unions': ['Struct layout versus union storage', ['Struct fields keep separate slots', 'Alignment may insert padding', 'Union fields share one slot', 'sizeof reveals final footprint'], 'A union is sized for its largest member; a struct must hold every member.'],
  'cpp-cin-cout-namespaces': ['C++ stream I/O and namespaces', ['std::cin extracts typed input', 'Stream state reports failure', 'std::cout inserts output', 'Namespaces prevent name clashes'], 'Stream operators are overloadable functions, not magic syntax.'],
  'cpp-classes-objects': ['Object lifetime and encapsulation', ['Constructor establishes invariants', 'Public methods guard private state', 'Object provides behaviour', 'Destructor releases resources'], 'RAII ties cleanup to scope exit, including during stack unwinding.'],
  'cpp-stl-containers': ['How STL pieces fit together', ['Container owns elements', 'Iterators traverse a range', 'Algorithms transform / query', 'Complexity sets the cost'], 'Choose the container by required operations, not by habit.'],
  'cpp-inheritance-polymorphism': ['Runtime polymorphism in C++', ['Base declares virtual interface', 'Derived class overrides it', 'Call through base reference', 'Vtable dispatches derived code'], 'The object’s dynamic type—not the pointer’s static type—selects the override.'],
  'java-architecture-types': ['From Java source to running JVM', ['.java source code', 'javac emits .class bytecode', 'ClassLoader loads & verifies', 'JVM interprets / JIT-compiles'], 'Objects live on the heap; each thread has its own JVM stack frames.'],
  'java-collections-streams': ['Collections plus a stream pipeline', ['Choose List, Set or Map', 'Store elements once', 'stream: filter → map → sort', 'Terminal: collect / count / sum'], 'Intermediate stream operations are lazy; a terminal operation drives evaluation.'],
  'py-numpy-basics': ['Why NumPy arrays are fast', ['Homogeneous typed values', 'Contiguous ndarray buffer', 'Vectorized operation in C loops', 'Broadcasting aligns shapes'], 'Avoid Python-level element loops when a whole-array operation expresses the job.'],
  'py-pandas-data-analysis': ['A small pandas analysis flow', ['Read table into DataFrame', 'Clean types & missing values', 'Filter, group and aggregate', 'Export or plot the result'], 'Labels and indexes are part of the data model—check them after every reshape.'],
  'js-variables-scope-coercion': ['Scope and coercion in JavaScript', ['Declarations enter a scope', 'let / const stay block-scoped', 'Operators may coerce types', 'Use === to avoid surprises'], 'Scope is lexical: where code is written decides which bindings it can see.'],
  'py-iterators-generators': ['Lazy iteration with generators', ['Calling generator creates iterator', 'next() resumes execution', 'yield emits & suspends state', 'Return ends with StopIteration'], 'Only one value is materialized at a time; the local state survives between yields.'],
  'java-multithreading-basics': ['Safe basic Java threading', ['Runnable describes the task', 'start() creates a real thread', 'synchronized guards shared state', 'join() waits & publishes result'], 'Calling run() directly is just an ordinary method call on the current thread.'],
  'js-functions-arrow-scope': ['Function calls and lexical scope', ['Function value is created', 'Arguments bind to parameters', 'Body reads its lexical scope', 'return produces the result'], 'Arrow functions inherit this from the surrounding scope; normal functions receive their own this.'],
  'js-error-handling': ['Structured error handling', ['Risky work runs in try', 'throw creates / propagates Error', 'catch decides recovery', 'finally always cleans up'], 'Catch only errors you can handle; rethrow the rest with useful context.'],
  'js-fetch-async-data': ['Fetching JSON without guessing', ['fetch() sends the request', 'Promise resolves to Response', 'Check response.ok & status', 'await response.json() parses body'], 'fetch rejects mainly on network failure—HTTP 404/500 still resolve, so inspect ok.'],
  'html-document-structure-semantic': ['How a browser reads an HTML document', ['DOCTYPE selects standards mode', 'head carries metadata', 'Semantic landmarks structure body', 'Parser builds the DOM tree'], 'Good landmarks help browsers, search engines and assistive technology alike.'],
  'html-text-links-media': ['Content elements and their jobs', ['Headings form the outline', 'Paragraphs & lists carry text', 'Links connect resources', 'Media needs text alternatives'], 'Choose elements by meaning first; style them with CSS second.'],
  'css-selectors-cascade': ['How the CSS cascade picks a winner', ['Selectors match elements', 'Origin & importance are ranked', 'Specificity breaks most ties', 'Source order breaks final ties'], 'If two declarations still tie, inheritance and initial values fill the remaining gaps.'],
  'css-colors-units-typography': ['From CSS values to rendered text', ['Color notation becomes computed color', 'Relative units resolve to pixels', 'Font metrics shape line boxes', 'Browser paints final glyphs'], 'rem follows the root font size; em follows the current element and can compound.'],
  'css-flexbox-grid': ['Flexbox for one axis, Grid for two', ['Flex container forms a row / column', 'justify & align distribute space', 'Grid defines rows + columns', 'Tracks, gaps & areas place items'], 'The systems compose: Grid can lay out the page while Flexbox aligns each card’s contents.'],
};

function diagramOverrideFor(topicId) {
  const spec = DIAGRAM_OVERRIDES[topicId];
  if (!spec) return null;
  const [title, steps, note] = spec;
  return createConceptProcessSvg(title, steps, note);
}

module.exports = { DIAGRAM_OVERRIDES, diagramOverrideFor };
