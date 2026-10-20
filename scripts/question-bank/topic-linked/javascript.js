'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'js-strings-template-literals', language: 'javascript', course: 'javascript',
    title: 'Format a Filename with a Template Literal',
    statement: 'Read a filename that may have surrounding spaces. Trim it, split at the last dot, uppercase the base name, lowercase the extension, and print with a template literal as "BASE (ext)".',
    input: 'One filename containing a dot, possibly with surrounding spaces.',
    output: 'Print exactly: <BASE> (<ext>).',
    constraints: 'Filename length <= 200 and contains at least one dot with text on both sides.',
    difficulty: 'Easy', tags: ['strings', 'template literals'],
    starter: `const fs = require('fs');

const raw = fs.readFileSync('/dev/stdin', 'utf-8');
// TODO: trim, find the last dot, slice base/ext, and use a template literal.
console.log(raw.trim());`,
    solution: `const fs = require('fs');

const raw = fs.readFileSync('/dev/stdin', 'utf-8').trim();
const dot = raw.lastIndexOf('.');
const base = raw.slice(0, dot).toUpperCase();
const ext = raw.slice(dot + 1).toLowerCase();
console.log(\`\${base} (\${ext})\`);`,
    explanation: 'trim removes outer spaces, lastIndexOf finds the extension boundary, and slice extracts each side without mutating the original string.',
    hints: ['Use lastIndexOf(".") so names like archive.tar.gz split at the final dot.', 'Build the final line with backticks and ${...} interpolation.'],
    tests: [['  rePort.pdf  ', 'REPORT (pdf)'], ['notes.TXT', 'NOTES (txt)'], ['archive.tar.GZ', 'ARCHIVE.TAR (gz)']],
  }),

  question({
    topic: 'js-arrays-methods', language: 'javascript', course: 'javascript',
    title: 'Tax the Expensive Prices with map/filter/reduce',
    statement: 'From a list of prices, keep only prices above 100, add 18% tax to each with Math.round, print the taxed array, and print its total computed with reduce.',
    input: 'One line of zero or more integer prices.',
    output: 'First line: taxed array in JavaScript console.log array format. Second line: total=<sum>.',
    constraints: 'At most 1000 prices; prices are non-negative integers.',
    difficulty: 'Easy', tags: ['map', 'filter', 'reduce'],
    starter: `const fs = require('fs');

const prices = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
// TODO: filter prices > 100, map to Math.round(price * 1.18), reduce to a total.
const taxed = [];
const total = 0;
console.log(taxed);
console.log('total=' + total);`,
    solution: `const fs = require('fs');

const prices = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const taxed = prices
  .filter((price) => price > 100)
  .map((price) => Math.round(price * 1.18));
const total = taxed.reduce((acc, price) => acc + price, 0);
console.log(taxed);
console.log('total=' + total);`,
    explanation: 'filter selects, map transforms, and reduce folds the new array into one total; none of the three mutates the original prices array.',
    hints: ['Chain .filter(...).map(...) on prices.', 'Give reduce an initial value of 0 so an empty result still totals 0.'],
    tests: [['120 45 300 60 500', '[ 142, 354, 590 ]\ntotal=1086'], ['100 99', '[]\ntotal=0'], ['101', '[ 119 ]\ntotal=119'], ['', '[]\ntotal=0']],
  }),

  question({
    topic: 'js-objects-destructuring', language: 'javascript', course: 'javascript',
    title: 'Update a Book with Spread Without Mutation',
    statement: 'Read a book title, its page count, and a new page count. Create book, then create updated with object spread overriding pages. Print the original and updated page counts, then print the title obtained by destructuring.',
    input: 'Three lines: title, pages, newPages.',
    output: 'First line: <originalPages> <newPages>. Second line: title.',
    constraints: 'Title may contain spaces; page counts are positive integers.',
    difficulty: 'Easy', tags: ['objects', 'spread', 'destructuring'],
    starter: `const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trimEnd().split(/\\r?\\n/);
const titleInput = lines[0] || '';
const pages = Number(lines[1]);
const newPages = Number(lines[2]);
const book = { title: titleInput, pages };
// TODO: create updated via { ...book, pages: newPages } and destructure title.
const updated = book;
const title = titleInput;
console.log(book.pages + ' ' + updated.pages);
console.log(title);`,
    solution: `const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trimEnd().split(/\\r?\\n/);
const titleInput = lines[0] || '';
const pages = Number(lines[1]);
const newPages = Number(lines[2]);
const book = { title: titleInput, pages };
const updated = { ...book, pages: newPages };
const { title } = updated;
console.log(book.pages + ' ' + updated.pages);
console.log(title);`,
    explanation: 'Spread copies book\'s own enumerable properties into a new object; the later pages property overrides the copied one while book remains unchanged.',
    hints: ['Write const updated = { ...book, pages: newPages };', 'Destructure with const { title } = updated;.'],
    tests: [['JS Guide\n320\n340', '320 340\nJS Guide'], ['A\n1\n2', '1 2\nA'], ['Clean Code Book\n464\n480', '464 480\nClean Code Book']],
  }),

  question({
    topic: 'js-functions-arrow-scope', language: 'javascript', course: 'javascript',
    title: 'Hoisted Declaration and Rest Arrow',
    statement: 'Call a function declaration isMultiple(a,b) before its declaration line (relying on hoisting) to test a % b === 0. Also write an arrow function maxAll(...nums) using Math.max with spread. Input line 1 gives a and b; line 2 gives the numbers for maxAll.',
    input: 'First line: a b. Second line: at least one integer.',
    output: 'First line: true/false for isMultiple. Second line: maximum.',
    constraints: 'b is non-zero; values fit in safe integers.',
    difficulty: 'Easy', tags: ['functions', 'hoisting', 'rest'],
    starter: `const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\r?\\n/);
const [a, b] = lines[0].trim().split(/\\s+/).map(Number);
const nums = lines[1].trim().split(/\\s+/).map(Number);

console.log(isMultiple(a, b));

function isMultiple(x, y) {
  // TODO: return whether x is exactly divisible by y.
  return false;
}

const maxAll = (...values) => {
  // TODO: return Math.max applied to all values.
  return values[0];
};

console.log(maxAll(...nums));`,
    solution: `const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\r?\\n/);
const [a, b] = lines[0].trim().split(/\\s+/).map(Number);
const nums = lines[1].trim().split(/\\s+/).map(Number);

console.log(isMultiple(a, b));

function isMultiple(x, y) {
  return x % y === 0;
}

const maxAll = (...values) => Math.max(...values);

console.log(maxAll(...nums));`,
    explanation: 'Function declarations are hoisted with their bodies, so the early call works. The arrow uses rest to collect arguments and spread to pass them into Math.max.',
    hints: ['Keep the isMultiple call above its function declaration to demonstrate hoisting.', 'Math.max needs spread: Math.max(...values), not Math.max(values).'],
    tests: [['20 5\n3 9 4', 'true\n9'], ['20 6\n-1 -5 -2', 'false\n-1'], ['7 7\n42', 'true\n42']],
  }),

  question({
    topic: 'js-closures-scope', language: 'javascript', course: 'javascript',
    title: 'Private Balance Closure Account',
    statement: 'Write makeAccount(startBalance) returning an object with deposit(n) and balance() methods that close over a private balance variable (never stored as a data property). Read a starting balance followed by deposit amounts, apply them, print balance(), and prove balance is a method by checking typeof account.balance === "function".',
    input: 'One line: startBalance followed by zero or more deposit amounts.',
    output: 'First line: final balance. Second line exactly: no direct access: balance is a method, not data.',
    constraints: 'Values fit in safe integers.',
    difficulty: 'Medium', tags: ['closures', 'scope'],
    starter: `const fs = require('fs');

function makeAccount(startBalance) {
  // TODO: keep balance in a local variable captured by both methods.
  return {
    deposit(amount) {},
    balance() { return startBalance; },
  };
}

const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const account = makeAccount(nums[0] || 0);
for (const amount of nums.slice(1)) account.deposit(amount);
console.log(account.balance());
console.log(typeof account.balance === 'function'
  ? 'no direct access: balance is a method, not data'
  : 'balance exposed');`,
    solution: `const fs = require('fs');

function makeAccount(startBalance) {
  let balance = startBalance;
  return {
    deposit(amount) {
      balance += amount;
    },
    balance() {
      return balance;
    },
  };
}

const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const account = makeAccount(nums[0] || 0);
for (const amount of nums.slice(1)) account.deposit(amount);
console.log(account.balance());
console.log(typeof account.balance === 'function'
  ? 'no direct access: balance is a method, not data'
  : 'balance exposed');`,
    explanation: 'The returned methods retain access to the local balance variable after makeAccount returns—that retained environment is the closure—while outside code has no data property for the amount.',
    hints: ['Declare balance with let inside makeAccount, before returning the object.', 'deposit must modify the captured variable, not this.balance.'],
    tests: [['100 50 50', '200\nno direct access: balance is a method, not data'], ['0', '0\nno direct access: balance is a method, not data'], ['250 25 -50', '225\nno direct access: balance is a method, not data']],
  }),

  question({
    topic: 'js-classes-prototypes', language: 'javascript', course: 'javascript',
    title: 'Square Extends Rectangle',
    statement: 'Write class Rectangle with constructor(w,h), area(), and describe() returning "rectangle area=<area>". Write Square extends Rectangle whose constructor(side) calls super(side, side) and overrides describe() to return "square area=<area>". Read w h side and print the rectangle description, square description, and whether the square is instanceof Rectangle.',
    input: 'One line: w h side.',
    output: 'Three lines: rectangle area=<...>, square area=<...>, true/false.',
    constraints: 'Dimensions are positive numbers.',
    difficulty: 'Easy', tags: ['classes', 'extends', 'super'],
    starter: `const fs = require('fs');

class Rectangle {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }
  area() {
    // TODO: return width times height.
    return 0;
  }
  describe() {
    return 'rectangle area=' + this.area();
  }
}

class Square extends Rectangle {
  constructor(side) {
    // TODO: call super(side, side).
    super(side, side);
  }
  describe() {
    // TODO: return the square form.
    return 'square area=' + this.area();
  }
}

const [w, h, side] = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).map(Number);
const rectangle = new Rectangle(w, h);
const square = new Square(side);
console.log(rectangle.describe());
console.log(square.describe());
console.log(square instanceof Rectangle);`,
    solution: `const fs = require('fs');

class Rectangle {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }
  area() {
    return this.w * this.h;
  }
  describe() {
    return 'rectangle area=' + this.area();
  }
}

class Square extends Rectangle {
  constructor(side) {
    super(side, side);
  }
  describe() {
    return 'square area=' + this.area();
  }
}

const [w, h, side] = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).map(Number);
const rectangle = new Rectangle(w, h);
const square = new Square(side);
console.log(rectangle.describe());
console.log(square.describe());
console.log(square instanceof Rectangle);`,
    explanation: 'extends links Square.prototype to Rectangle.prototype, so area is inherited and instanceof succeeds; super initializes the inherited width/height state.',
    hints: ['In a derived constructor, call super(...) before using this.', 'Square only needs to override describe(); area can be inherited.'],
    tests: [['4 3 5', 'rectangle area=12\nsquare area=25\ntrue'], ['10 2 1', 'rectangle area=20\nsquare area=1\ntrue'], ['2 8 3', 'rectangle area=16\nsquare area=9\ntrue']],
  }),

  question({
    topic: 'js-error-handling', language: 'javascript', course: 'javascript',
    title: 'Parse Age with RangeError',
    statement: 'Write parseAge(text) that converts with Number(text), but throws RangeError("age out of range") when the result is NaN or outside 0..120. Process three input tokens, printing each valid value or "RangeError: age out of range".',
    input: 'Three lines, one token per line.',
    output: 'One result per token.',
    constraints: 'Tokens contain no spaces.',
    difficulty: 'Easy', tags: ['try/catch', 'RangeError'],
    starter: `const fs = require('fs');

function parseAge(text) {
  const value = Number(text);
  // TODO: throw RangeError when Number.isNaN(value) or outside 0..120.
  return value;
}

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trimEnd().split(/\\r?\\n/);
for (const raw of lines.slice(0, 3)) {
  try {
    console.log(parseAge(raw.trim()));
  } catch (err) {
    console.log(err.name + ': ' + err.message);
  }
}`,
    solution: `const fs = require('fs');

function parseAge(text) {
  const value = Number(text);
  if (Number.isNaN(value) || value < 0 || value > 120) {
    throw new RangeError('age out of range');
  }
  return value;
}

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trimEnd().split(/\\r?\\n/);
for (const raw of lines.slice(0, 3)) {
  try {
    console.log(parseAge(raw.trim()));
  } catch (err) {
    console.log(err.name + ': ' + err.message);
  }
}`,
    explanation: 'Number("abc") produces NaN rather than throwing, so it must be detected explicitly with Number.isNaN before range validation.',
    hints: ['Check Number.isNaN(value) separately from the numeric range.', 'Throw with new RangeError("age out of range").'],
    tests: [['25\nabc\n150', '25\nRangeError: age out of range\nRangeError: age out of range'], ['0\n120\n121', '0\n120\nRangeError: age out of range'], ['-1\n42\nxyz', 'RangeError: age out of range\n42\nRangeError: age out of range']],
  }),

  question({
    topic: 'js-modules-pattern', language: 'javascript', course: 'javascript',
    title: 'StringKit Closure Namespace',
    statement: 'Build a StringKit namespace with an immediately-invoked function expression (IIFE) or closure factory that keeps a private helper internal and exposes shout(s) (uppercase plus "!") and title(s) (first char uppercase, rest lowercase). Read two words and apply shout to the first and title to the second.',
    input: 'One line: word1 word2.',
    output: 'Two lines: shout(word1), then title(word2).',
    constraints: 'Words are non-empty ASCII letters.',
    difficulty: 'Easy', tags: ['modules pattern', 'IIFE', 'namespace'],
    starter: `const fs = require('fs');

const StringKit = (() => {
  function clean(s) {
    return String(s).trim();
  }
  return {
    shout(s) {
      // TODO: use clean(s), uppercase it, and append !.
      return clean(s);
    },
    title(s) {
      // TODO: first char uppercase, remaining chars lowercase.
      return clean(s);
    },
  };
})();

const [first, second] = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
console.log(StringKit.shout(first));
console.log(StringKit.title(second));`,
    solution: `const fs = require('fs');

const StringKit = (() => {
  function clean(s) {
    return String(s).trim();
  }
  return {
    shout(s) {
      return clean(s).toUpperCase() + '!';
    },
    title(s) {
      const text = clean(s).toLowerCase();
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
  };
})();

const [first, second] = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
console.log(StringKit.shout(first));
console.log(StringKit.title(second));`,
    explanation: 'The IIFE creates one namespace object while clean stays private inside the closure; only shout and title form the public API.',
    hints: ['Only return shout and title from the IIFE; do not expose clean.', 'For title, lowercase everything first, then uppercase charAt(0).'],
    tests: [['go tEAM', 'GO!\nTeam'], ['hello WORLD', 'HELLO!\nWorld'], ['a b', 'A!\nB']],
  }),

  question({
    topic: 'js-fetch-async-data', language: 'javascript', course: 'javascript',
    title: 'Fetch Gate with a Fake Response',
    statement: 'The input describes a fake API response: city, temperature, and okFlag (1 for HTTP 200, 0 for HTTP 503). Build fakeFetch returning a Promise of {ok, status, json}. Write async getTemp(fetchFn) that awaits it, throws Error("HTTP " + status) when !ok, otherwise returns parsed JSON. Print "<city>: <temp>C" or "Error: HTTP 503".',
    input: 'One line: city temperature okFlag.',
    output: 'One success or error line.',
    constraints: 'City is one word; temperature is an integer; okFlag is 0 or 1.',
    difficulty: 'Medium', tags: ['fetch', 'async/await', 'JSON'],
    starter: `const fs = require('fs');

const parts = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
const city = parts[0];
const temp = Number(parts[1]);
const ok = parts[2] === '1';

function fakeFetch() {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 503,
    json: async () => ({ city, temp }),
  });
}

async function getTemp(fetchFn) {
  const res = await fetchFn();
  // TODO: throw on !res.ok, otherwise return await res.json().
  return res.json();
}

(async () => {
  try {
    const data = await getTemp(fakeFetch);
    console.log(data.city + ': ' + data.temp + 'C');
  } catch (err) {
    console.log('Error: ' + err.message);
  }
})();`,
    solution: `const fs = require('fs');

const parts = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
const city = parts[0];
const temp = Number(parts[1]);
const ok = parts[2] === '1';

function fakeFetch() {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 503,
    json: async () => ({ city, temp }),
  });
}

async function getTemp(fetchFn) {
  const res = await fetchFn();
  if (!res.ok) {
    throw new Error('HTTP ' + res.status);
  }
  return res.json();
}

(async () => {
  try {
    const data = await getTemp(fakeFetch);
    console.log(data.city + ': ' + data.temp + 'C');
  } catch (err) {
    console.log('Error: ' + err.message);
  }
})();`,
    explanation: 'fetch-style APIs resolve even for HTTP error statuses, so application code must check res.ok itself; the body is then obtained through the second async json() step.',
    hints: ['Throw before calling res.json() when res.ok is false.', 'Returning res.json() from an async function unwraps its promise for the caller.'],
    tests: [['Vadodara 31 1', 'Vadodara: 31C'], ['Pune 28 0', 'Error: HTTP 503'], ['Delhi 40 1', 'Delhi: 40C']],
  }),

  question({
    topic: 'js-browser-storage-json', language: 'javascript', course: 'javascript',
    title: 'Best Score in Storage JSON',
    statement: 'A tiny in-memory storage shim with getItem/setItem/removeItem is provided in the starter (mirroring localStorage). Implement saveScore(storage, name, score) storing JSON {name, score} under key "best", and loadBest(storage) parsing it back or returning {name:"none", score:0} when getItem returns null. Print loadBest before and after saving the input name/score.',
    input: 'One line: name score.',
    output: 'Two object lines in Node console.log object format: default first, saved value second.',
    constraints: 'Name is one word; score is an integer.',
    difficulty: 'Easy', tags: ['localStorage', 'JSON'],
    starter: `const fs = require('fs');

function createStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
  };
}

function saveScore(storage, name, score) {
  // TODO: storage.setItem('best', JSON.stringify({ name, score }))
}

function loadBest(storage) {
  // TODO: parse storage.getItem('best'), defaulting on null.
  return { name: 'none', score: 0 };
}

const parts = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
const name = parts[0];
const score = Number(parts[1]);
const storage = createStorage();
console.log(loadBest(storage));
saveScore(storage, name, score);
console.log(loadBest(storage));`,
    solution: `const fs = require('fs');

function createStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
  };
}

function saveScore(storage, name, score) {
  storage.setItem('best', JSON.stringify({ name, score }));
}

function loadBest(storage) {
  const raw = storage.getItem('best');
  if (raw === null) {
    return { name: 'none', score: 0 };
  }
  return JSON.parse(raw);
}

const parts = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
const name = parts[0];
const score = Number(parts[1]);
const storage = createStorage();
console.log(loadBest(storage));
saveScore(storage, name, score);
console.log(loadBest(storage));`,
    explanation: 'Storage values are strings, so objects must be serialized with JSON.stringify on save and JSON.parse on load; null is the missing-key signal that selects the default.',
    hints: ['Check raw === null before JSON.parse.', 'Store exactly the object shape { name, score }.'],
    tests: [['Diya 92', "{ name: 'none', score: 0 }\n{ name: 'Diya', score: 92 }"], ['Kabir 57', "{ name: 'none', score: 0 }\n{ name: 'Kabir', score: 57 }"]],
    tests: [['Diya 92', "{ name: 'none', score: 0 }\n{ name: 'Diya', score: 92 }"], ['Kabir 57', "{ name: 'none', score: 0 }\n{ name: 'Kabir', score: 57 }"], ['Meera 100', "{ name: 'none', score: 0 }\n{ name: 'Meera', score: 100 }"]],
  }),
];
