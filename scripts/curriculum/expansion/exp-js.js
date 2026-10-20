'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'js-strings-template-literals', walkEx:2, course_id:'javascript', unit_id:'js-unit-1', order_index:2,
  title:'Strings & Template Literals', desc:'Search, slice, split and build strings; embed expressions with backtick templates.',
  obj:['Use includes/indexOf/slice/split/trim/replace correctly','Build messages with template literals and expressions','Contrast immutable string methods with in-place expectations'],
  pre:['Variables, scope & coercion','console output'],
  outcomes:['Learner processes text fluently and formats output the modern way'],
  def:'A JavaScript string is an immutable sequence of UTF-16 code units with methods for searching (includes, indexOf), extracting (slice, substring), transforming (toUpperCase, replace, trim) and splitting (split). Template literals (backticks) embed expressions via ${...} and may span lines.',
  simple:'JavaScript strings behave like sealed, read-only text: every method hands back a NEW string, never edits the old one. You can hunt inside them (includes answers yes/no, indexOf gives a position or -1), cut pieces out with slice (end position excluded, negatives count from the back), clean edges with trim, and break them into parts with split. The star feature is the template literal: wrap text in backticks and drop live expressions inside ${} — goodbye to plus-sign spaghetti like "Hello " + name + ", you are " + age. As a bonus, backtick strings may span multiple lines as written.',
  hing:'JavaScript me string immutable hai — matlab badli nahi ja sakti, har method NAYA string banakar deta hai. Isliye let s = s.trim() karna jaroori hai, sirf s.trim() call karna bekaar. includes("x") haan/na batata hai, indexOf position deta hai (na mile to -1), slice(start, end) tukda kaat-ti hai (end wala exclude), split(",") array bana deta hai. Sabse best feature hai template literal: backtick ` ` me likho aur beech me ${expression} ghused do — "Hello " + name wali purani jhanjhat Khatm. Backtick wala string kai lines par bhi fail sakta hai, jaise likho waise hi dikhega!',
  why:'Text manipulation fills front-end work: formatting prices, parsing URLs, validating inputs, rendering lists. Template literals are how all modern JS builds strings and (in frameworks) HTML, so fluency here pays daily.',
  when:'Use template literals for any interpolated string; plain quotes for fixed labels. Choose includes for yes/no, indexOf when the position matters, split/join for delimiter work, and padStart for codes/receipts.',
  syntax:'const msg = `Hello ${name}, total: ${(price * qty).toFixed(2)}`;\ns.slice(2, 5);        // end excluded\ns.includes("x");      // boolean\ns.split(",");         // to array\n"  a ".trim();        // new string!',
  comp:[['${expr}','Any expression gets stringified into the template'],['slice(start,end)','End exclusive; negatives from the end; never mutates'],['split/join','String ↔ array conversion pair around a separator']],
  ex:[
   {t:'Basic: template literals replace concatenation',code:`const name = "Diya";
const marks = 92;
console.log(\`Student: \${name}, Marks: \${marks}, Grade: \${marks >= 90 ? "A" : "B"}\`);
const price = 49.5;
const qty = 3;
console.log(\`Total = Rs.\${(price * qty).toFixed(2)}\`);
console.log(\`line one
line two\`);`,out:`Student: Diya, Marks: 92, Grade: A
Total = Rs.148.50
line one
line two`,why:'${} evaluates full expressions (a ternary, arithmetic toFixed) inline. The multi-line literal preserves the line break exactly as typed, impossible with single/double quotes.'},
   {t:'Intermediate: searching and slicing text',code:`const email = "diya.sharma@example.com";
const at = email.indexOf("@");
console.log(email.slice(0, at));
console.log(email.slice(at + 1));
console.log(email.includes("example"));
console.log(email.replace("example", "workmail"));
console.log(email);`,out:`diya.sharma
example.com
true
diya.sharma@workmail.com
diya.sharma@example.com`,why:'Read carefully: replace printed its NEW result on line 4 (workmail), but line 5 proves the original email string is untouched (example.com). Immutability means transformations must be assigned to be kept.'},
   {t:'Advanced: split-process-join and padding',code:`const csv = "Aarav, Diya ,Kabir,  Meera";
const names = csv.split(",").map((s) => s.trim());
console.log(names);
console.log(names.join(" | "));
console.log("Roll " + String(7).padStart(3, "0"));
const word = "javascript";
console.log(word[0].toUpperCase() + word.slice(1));`,out:`[ 'Aarav', 'Diya', 'Kabir', 'Meera' ]
Aarav | Diya | Kabir | Meera
Roll 007
Javascript`,why:'split preserves stray spaces, so a trim pass cleans each part; join reassembles with any separator. padStart pads to width for codes, and capitalising is just first-char + the remaining slice.'}
  ],
  walk:[[2,'email starts as one immutable string; indexOf("@") reports position 10 (diya.sharma is 10 characters).','at = 10'],[3,'slice(0, at) copies characters before @ into a new string.','user part'],[4,'slice(at+1) copies from after @ to the end (omitted end).','domain part'],[6,'replace CONSTRUCTS a modified copy for printing; email itself remains the example.com version on the next line.','original intact']],
  walkWhy:'Every operation produced new strings while the original persisted — exactly why repeated "edits" must be chained or reassigned, and why the same string can be shared safely anywhere.',
  rules:['Strings are immutable: replace/trim/toUpperCase return new strings — assign or chain the result.','indexOf returns -1 when absent; guard before slicing at its result.','replace with a string pattern replaces only the FIRST match; use a regex with /g or replaceAll for all occurrences.','Template literals evaluate expressions eagerly with current values; they are strings, not deferred templates.'],
  mistakes:[
   {t:'Replacing only the first occurrence unintentionally',bad:'"na-na-na".replace("-", ":")  // "na:na-na" — only first dash!',why:'A string pattern in replace is single-shot, unlike Python. Code normalising dates or paths silently half-converts them.',fix:'"na-na-na".replaceAll("-", ":")   // "na:na:na"\n"na-na-na".replace(/-/g, ":")     // regex global form',tip:'Reach for replaceAll by default unless only the first match is truly intended.'},
   {t:'Forgetting strings cannot be edited in place',bad:'let tag = "  Sale  ";\ntag.trim();\ntag.toUpperCase();\nconsole.log(tag);  // still "  Sale  "',why:'Both methods returned new strings that were discarded. The variable still references the original immutable value.',fix:'tag = tag.trim().toUpperCase();\nconsole.log(tag);  // SALE',tip:'Chain and assign: s = s.trim().toLowerCase(). If a transformation "did nothing", this is the reason.'}
  ],
  cmp:['Quote styles compared',['Form','\'...\' / "..."','`...` template literal'],[['Interpolation','No — concatenate with +','${expr} embedded'],['Multi-line','Needs \\n escapes','Literal newlines allowed'],['Escape needs','Quote escaping','Backtick/${ escaping rarely'],['Use for','Fixed strings','Any built/dynamic text']]],
  diag:{kind:'flow',start:'Text to process',condition:'Need the position?',trueAction:'indexOf (guard -1) then slice',falseAction:'includes for yes/no checks',end:'Assign every transformation result'},
  apps:['Formatting invoices/receipts with template literals and padStart alignment.','Parsing emails/URLs into parts with indexOf + slice.','Normalising user input: trim + toLowerCase before comparisons.'],
  quizzes:[{q:'"banana".slice(2, 4) returns…',options:['"na"','"nan"','"ba"','"nana"'],correct:0,why:'Indices 2 and 3 (end exclusive): n, a → "na".'},
            {q:'let s = "hi"; s.toUpperCase(); console.log(s) prints…',options:['HI','hi','Error','undefined'],correct:1,why:'toUpperCase returned a new string that was discarded; s is unchanged.'}],
  take:['Template literals embed ${expressions} and multiline text cleanly.','String methods return new strings — always assign/chain them.','includes for presence, indexOf (-1 absent) for position; replace only swaps the first match.'],
  rev:'`text ${expr}` interpolates. slice end-exclusive. Immutable: reassign results. replace=first only; replaceAll/regex /g for all.',
  assign:{p:'Given const raw = "  rePort.pdf  ", produce and print "REPORT (pdf)" using trim, indexOf/slice and toUpperCase, in one console.log with a template literal.',s:`const raw = "  rePort.pdf  ";
// TODO: clean, split at '.', print "REPORT (pdf)" via a template literal`,sol:`const raw = "  rePort.pdf  ";
const clean = raw.trim();
const dot = clean.indexOf(".");
const base = clean.slice(0, dot).toUpperCase();
const ext = clean.slice(dot + 1).toLowerCase();
console.log(\`\${base} (\${ext})\`);`}
},
{
  id:'js-arrays-methods', walkEx:2, course_id:'javascript', unit_id:'js-unit-1', order_index:3,
  title:'Arrays & Essential Methods (map, filter, reduce)', desc:'Transform collections declaratively and know which methods mutate versus copy.',
  obj:['Use push/pop/shift/unshift/splice with their mutation semantics','Transform with map, select with filter, aggregate with reduce','Query with find/includes/some/every and sort with comparators'],
  pre:['Strings & template literals','Functions (callbacks preview)'],
  outcomes:['Learner processes list data in the idiomatic functional style without mutation surprises'],
  def:'A JavaScript array is an ordered, dynamically-sized object with numeric indices and a length property. Methods split into mutating (push, pop, splice, sort) that modify the array in place, and non-mutating (map, filter, slice, concat) that return new arrays; reduce folds elements into a single accumulated value.',
  simple:'A JS array is a stretchy shopping bag: push adds at the end, pop removes from the end, and its size never needs declaring. The real power is the trio of transformation methods. map is a photocopier that edits each page ("double every number"), filter is a sieve keeping only items passing a test, and reduce is a snowball rolling through the list accumulating one final result (a total, an average, a grouping). Half the battle is knowing which methods CHANGE your original bag (sort, splice, push) and which return a fresh bag (map, filter, slice) — mixing that up causes data to vanish or double.',
  hing:'JavaScript array ek khinchne wala thaila hai — size pehle se nahi batana padta, push/pop se badhta-ghatta rehta hai. Teen super-methods yaad kar lo: map har item ko badalkar NAYA array deta hai ("sab double kar do"); filter chhalni hai, sirf test pass karne wale rakho; reduce pure array ko ek value me samod deta hai, jaise total. Sabse zaroori fark: kaunsi methods ORIGINAL ko badalti hain (sort, splice, push — mutating) aur kaunsi nayi copy deti hain (map, filter, slice). Aur ek classic dhokha: numbers sort karne par JavaScript pehle string bana leta hai — [10, 9, 80] galat order dega, isliye comparator (a, b) => a - b dena padta hai!',
  why:'Collections are the currency of UI code: lists of products, users, messages. map/filter/reduce express the standard transforms in one readable chain each, replacing index-juggling loops and making rendering pipelines (data → JSX/HTML) natural.',
  when:'Prefer non-mutating chains for derived views of data; reserve push/splice for the owning list itself. Use find for one item, some/every for boolean questions, includes for primitives, and ALWAYS pass a numeric comparator to sort numbers.',
  syntax:'const doubled = nums.map(n => n * 2);\nconst adults = users.filter(u => u.age >= 18);\nconst total = nums.reduce((acc, n) => acc + n, 0);\nnums.sort((a, b) => a - b);   // numeric, mutates!',
  comp:[['Callback (value, index, array)','Function each element is passed through'],['Mutating vs copying','sort/splice/push mutate; map/filter/slice/concat copy'],['reduce(acc, cur), init','Accumulator folds left-to-right starting from the initial value']],
  ex:[
   {t:'Basic: growing, shrinking and reading arrays',code:`const cart = ["pen", "notebook"];
cart.push("eraser");
console.log(cart.length);
console.log(cart[0], cart[cart.length - 1]);
const removed = cart.pop();
console.log(removed);
console.log(cart.includes("pen"));
console.log(cart.indexOf("ruler"));`,out:`3
pen eraser
eraser
true
-1`,why:'push returns the new length but we read .length directly; pop returns the removed item; includes answers presence, indexOf gives -1 for absent. All of push/pop mutate the same array.'},
   {t:'Intermediate: map / filter / reduce pipelines',code:`const marks = [58, 92, 71, 45, 88];
const grades = marks.map((m) => (m >= 90 ? "A" : m >= 60 ? "B" : "C"));
console.log(grades);
const passed = marks.filter((m) => m >= 60);
console.log(passed);
const total = marks.reduce((acc, m) => acc + m, 0);
console.log("avg=" + (total / marks.length).toFixed(1));
console.log(marks);`,out:`[ 'C', 'A', 'B', 'C', 'B' ]
[ 92, 71, 88 ]
avg=70.8
[ 58, 92, 71, 45, 88 ]`,why:'Each method specialised: map kept the shape (5 in, 5 out) with transformed values, filter shrank to passing marks, reduce folded to one sum. The original array prints untouched at the end — none of the three mutates.'},
   {t:'Advanced: sorting trap and chained query',code:`const nums = [10, 9, 80, 100, 5];
console.log([...nums].sort());
console.log([...nums].sort((a, b) => a - b));
const students = [
  { name: "Diya", marks: 92 },
  { name: "Aarav", marks: 58 },
  { name: "Kabir", marks: 77 },
];
const toppers = students
  .filter((s) => s.marks >= 60)
  .sort((a, b) => b.marks - a.marks)
  .map((s) => s.name);
console.log(toppers);
console.log(students.some((s) => s.marks < 60));`,out:`[ 10, 100, 5, 80, 9 ]
[ 5, 9, 10, 80, 100 ]
[ 'Diya', 'Kabir' ]
true`,why:'Bare sort() stringifies: "10" < "100" < "5" gives lexicographic nonsense; the comparator fixes numeric order. Sort mutates, so spread copies ([...nums]) protect sources in pipelines; filter→sort→map composes a complete query.'}
  ],
  walk:[[2,'map allocates a new array and fills it with the callback\'s return value per element, preserving count and order.','grades length 5'],[4,'filter allocates a new array containing only elements whose callback returned truthy (92, 71, 88).','passed length 3'],[6,'reduce starts acc at 0, then acc becomes 58, 150, 221, 266, 354 across elements, finally returning 354.','total = 354'],[8,'marks prints in its original state, proving the trio are copy-returning operations.','source intact']],
  walkWhy:'The three verbs answer the three collection questions — transform each (map), keep some (filter), combine all (reduce) — without a single manual index or mutation of the source data.',
  rules:['sort() converts to strings by default: numbers REQUIRE (a, b) => a - b (ascending). It also mutates the array it is called on.','splice mutates (delete/insert in place); slice copies a range: do not confuse the similar names.','reduce without an initial value throws on an empty array and uses the first element as seed otherwise — pass the seed explicitly.','find returns the element (or undefined); filter returns an ARRAY (possibly empty) — wrong expectations here are rampant.'],
  mistakes:[
   {t:'Sorting numbers lexicographically',bad:'[10, 9, 80].sort()  // [10, 80, 9] — string order!',why:'The default comparator stringifies elements: "10" < "80" < "9" in code-point order, producing plausible-looking garbage that slips past eyeball tests with small digits.',fix:'[10, 9, 80].sort((a, b) => a - b)  // [9, 10, 80]',tip:'Comparator contract: negative → a first, positive → b first, 0 → keep. a-b gives ascending, b-a descending.'},
   {t:'Using map for side effects (and expecting mutation)',bad:'nums.map((n) => n * 2);  // wasted: result discarded, nums unchanged',why:'map\'s purpose is its returned array. Throwing it away burns a full allocation for nothing; and believing it edited nums leaves stale data flowing downstream.',fix:'const doubled = nums.map((n) => n * 2);\n// pure side effects only? use forEach or a for..of loop',tip:'map = transform & collect; forEach = act only. Pick by whether you need the resulting array.'}
  ],
  cmp:['Mutating vs non-mutating methods',['Method','Mutates original?','Returns'],[['push/pop/shift/unshift','Yes','Length / removed element'],['splice','Yes','Array of removed items'],['sort / reverse','Yes','The same array'],['map/filter/slice/concat','No','Brand-new array']]],
  diag:{kind:'flow',start:'Have an array',condition:'Need one combined value?',trueAction:'reduce with an explicit seed',falseAction:'map (transform) or filter (select)',end:'Original preserved unless intentionally mutated'},
  apps:['Rendering product cards: products.map(toCard) in every front-end framework.','Dashboard stats: totals/averages via reduce over transaction arrays.','Search-as-you-type: filter on includes() of the query text.'],
  quizzes:[{q:'[3, 20, 100].sort() (no comparator) yields…',options:['[3, 20, 100]','[100, 20, 3]','[20, 3, 100]','Error'],correct:1,why:'String comparison: "100" < "20" < "3", so the order becomes 100, 20, 3. Numeric order requires (a,b)=>a-b.'},
            {q:'Which expression returns the count of even numbers in nums?',options:['nums.map(n => n % 2 === 0).length','nums.filter(n => n % 2 === 0).length','nums.find(n => n % 2 === 0)','nums.pop()'],correct:1,why:'filter keeps matching elements; its length is the count. map would return booleans of the same length as the input.'}],
  take:['map transforms, filter selects, reduce folds — all return new results, none mutate.','sort/splice/push DO mutate; sort numbers only with (a,b)=>a-b.','Copy before chaining mutable steps: [...arr].sort(...) guards the source.'],
  rev:'push/pop ends. map→new transformed, filter→new subset, reduce(acc,cur,seed)→one value. sort() stringifies + mutates: pass comparator, copy first.',
  assign:{p:'From const prices = [120, 45, 300, 60, 500]: print (1) prices above 100 with 18% tax added (rounded via Math.round) as an array, (2) their total with reduce. Expected:\n[ 142, 354, 590 ]\ntotal=1086',s:`const prices = [120, 45, 300, 60, 500];
// TODO: filter >100, map with 18% tax rounded, reduce total`,sol:`const prices = [120, 45, 300, 60, 500];
const taxed = prices
  .filter((p) => p > 100)
  .map((p) => Math.round(p * 1.18));
console.log(taxed);
const total = taxed.reduce((acc, p) => acc + p, 0);
console.log("total=" + total);`}
},
{
  id:'js-objects-destructuring', walkEx:2, course_id:'javascript', unit_id:'js-unit-1', order_index:4,
  title:'Objects, Destructuring, Spread & Rest', desc:'Model records with objects, unpack them safely, and copy/merge immutably with spread.',
  obj:['Access and update object properties with dot/bracket notation','Destructure objects/arrays with renaming and defaults','Copy and merge with spread; gather with rest; recognise shallow copies'],
  pre:['Arrays & methods'],
  outcomes:['Learner manipulates record-shaped data (the JSON shape) idiomatically'],
  def:'A JavaScript object is a mutable collection of key–value properties. Destructuring binds variables from object/array shapes in one statement (with renaming and defaults). The spread syntax (...) expands iterables/object properties into new arrays/objects (shallow copies), while rest (...) gathers the remainder into one binding.',
  simple:'Objects are labelled boxes for records: a user has name, age and city, and you read them with user.name. Destructuring is unpacking a suitcase onto named hooks in one motion: const {name, age} = user creates both variables immediately, with options to rename ({name: fullName}) or supply defaults for missing items. Spread is the photocopier for objects/arrays: {...user, city: "Pune"} means "copy everything from user, then override city" — producing a NEW object while the original stays pristine, which is exactly the copy-on-write style modern UI frameworks demand. Rest is spread\'s twin: gather "everything else" into one bag.',
  hing:'Object matlab naam-wale khane (key-value pairs) — student.name, student.marks aise access hota hai. Destructuring matlab ek hi line me unpack karna: const {name, marks} = student; chaaho to naam bhi badlo {name: puraNaam} aur missing value ke liye default bhi do = 0. Spread {...obj} photocopy hai: {...users, city: "Pune"} naya object banata hai bina purane ko badle — React wagera me yahi style chalta hai. dhyan rakhna, ye SHALLOW copy hai: andar ke nested objects ab bhi share hote hain! Aur ek trap: const user = {...} me const sirf binding ko rokta hai, user.age = 31 bilkul chalega — object ke andar badlav allowed hai.',
  why:'Almost all data arriving from APIs is arrays of objects. Destructuring trims parameter and access boilerplate; spread enables the immutable-update pattern that state management (React/Redux) is built upon; understanding shallow copies prevents the classic "I copied it but both changed" mystery.',
  when:'Destructure function parameters and API responses; spread for copies/merges/updates; rest for the remaining fields. Reach for structuredClone or manual deep handling when nested objects must truly detach.',
  syntax:'const { name, age = 18, city: home } = user;\nconst updated = { ...user, age: 31 };\nconst [first, ...rest] = scores;\nconst keys = Object.keys(user);',
  comp:[['Destructuring','Pattern-matched unpacking; missing keys give undefined or the default'],['Spread ...','Copies own enumerable properties/elements — SHALLOWLY'],['Rest ...','Collects leftovers (object rest omits taken keys; array rest tails)']],
  ex:[
   {t:'Basic: reading and updating a record',code:`const student = { name: "Diya", roll: 12, marks: 92 };
console.log(student.name);
student.marks = 95;
student.city = "Pune";
console.log(student["marks"]);
console.log(Object.keys(student));
console.log("city" in student);`,out:`Diya
95
[ 'name', 'roll', 'marks', 'city' ]
true`,why:'const froze only the binding: properties mutate freely (marks updated, city added) while reassigning student itself would throw. Bracket notation accesses via string/ variable keys; `in` tests presence.'},
   {t:'Intermediate: destructuring with rename, defaults and arrays',code:`const user = { name: "Kabir", age: 17 };
const { name: fullName, age, city = "Unknown" } = user;
console.log(fullName, age, city);
const scores = [88, 92, 75, 60];
const [top, second, ...others] = scores;
console.log(top, second);
console.log(others);
const { name, ...restData } = { name: "Meera", marks: 88, city: "Goa" };
console.log(restData);`,out:`Kabir 17 Unknown
88 92
[ 75, 60 ]
{ marks: 88, city: 'Goa' }`,why:'name: fullName renames on extraction; city falls back to its default because the key was absent (undefined). Array destructuring is positional, object rest gathers the untaken keys into a fresh object.'},
   {t:'Advanced: immutable updates and the shallow-copy reality',code:`const profile = { name: "Aarav", settings: { theme: "dark" }, visits: 1 };
const next = { ...profile, visits: profile.visits + 1 };
console.log(profile.visits, next.visits);
next.settings.theme = "light";
console.log(profile.settings.theme);
const merged = { ...{ a: 1, b: 2 }, ...{ b: 99, c: 3 } };
console.log(merged);`,out:`1 2
light
{ a: 1, b: 99, c: 3 }`,why:'Spread made next a new top-level object (visits diverge) but settings is the SAME nested reference in both, so its edit shows through profile too — shallow copy made visible. In merges, later spreads win key collisions (b=99).'}
  ],
  walk:[[2,'Pattern {name: fullName,...} reads user.name into a new binding fullName; user is untouched.','fullName = Kabir'],[2,'city is missing on user, destructuring sees undefined and substitutes the default "Unknown".','city = Unknown'],[5,'Array positions bind top/second; rest collects the remaining values into a NEW array [75, 60].','others is independent'],[8,'Object rest assembles every key except name into restData — a shallow copy of the remainder.','restData separated']],
  walkWhy:'Destructuring/rest are assignment-time patterns: they read once and create ordinary variables/copies, after which no live link to the source remains (except nested references).',
  rules:['Destructuring defaults apply ONLY when the value is undefined (null does not trigger them).','Spread copies are shallow: nested objects/arrays remain shared references.','Later properties win in object spread merges, making order the override mechanism.','Optional chaining (?.) and destructuring defaults guard absent intermediate objects; destructuring null/undefined itself throws.'],
  mistakes:[
   {t:'Expecting const to freeze object contents',bad:'const cfg = { debug: false };\ncfg.debug = true;        // works! surprise for many\ncfg = {};                // TypeError',err:'TypeError: Assignment to constant variable (only on the rebind)',why:'const guards the variable binding, not the object\'s interior. Teams routinely believe config is immutable because it was declared with const.',fix:'const cfg = Object.freeze({ debug: false });\n// cfg.debug = true; // silently ignored (or throws in strict modules)',tip:'Freeze deliberately (Object.freeze, itself shallow) or adopt copy-on-write spread updates so sharing is explicit.'},
   {t:'Mutating a "copy" made by spread',bad:'const copy = { ...user };\ncopy.address.city = "Goa";\nconsole.log(user.address.city);  // also Goa!',why:'Spread detached the outer shell only; the nested address object is shared, so the "copy edit" rewrites the original too — a top-three JS state bug.',fix:'const copy = { ...user, address: { ...user.address, city: "Goa" } };\n// deep needs: structuredClone(user) where available',tip:'Update immutably level-by-level along the changed path; untouched branches may safely stay shared.'}
  ],
  cmp:['Spread copy vs assignment',['Statement','const b = a;','const b = { ...a };'],[['New object?','No — same reference','Yes — new outer object'],['b.x = 1 affects a?','Yes (same object)','No for top-level keys'],['Nested objects','Shared','Still shared (shallow)'],['Typical use','Intentional aliasing','Immutable-style updates']]],
  diag:{kind:'flow',start:'Record-shaped data',condition:'Updating nested fields?',trueAction:'Spread each level on the changed path',falseAction:'Spread once at the top level',end:'Original remains untouched'},
  apps:['React state updates: setUser(prev => ({ ...prev, name })) — the exact idiom taught here.','API parameter objects with defaults merged via spread order.','Function signatures: function draw({x, y, color = "black"}) — destructured options.'],
  quizzes:[{q:'const { a = 5 } = { a: null }; — what is a?',options:['5','null','undefined','Error'],correct:1,why:'Defaults trigger only on undefined; null is a real value and wins.'},
            {q:'b = { ...a }; b.nested.x = 9 — what happens to a.nested.x?',options:['Unchanged','Also becomes 9 (shallow copy shares nested)','Error','Becomes undefined'],correct:1,why:'Spread copied only top-level properties; the nested object reference is shared between a and b.'}],
  take:['Destructure with renames/defaults; defaults cover undefined only, not null.','Spread gives shallow copies/merges — edit nested levels explicitly along the changed path.','const protects the binding, not object contents.'],
  rev:'{a, b: ren, c = def} unpack. {...src, key: new} immutable update. ...rest gathers. Shallow! Object.keys/values/entries iterate.',
  assign:{p:'Given const book = { title: "JS Guide", pages: 320, meta: { lang: "en" } }; create updated with pages 340 via spread (book unchanged), then print: book.pages, updated.pages, and a destructured title. Expected:\n320 340\nJS Guide',s:`const book = { title: "JS Guide", pages: 320, meta: { lang: "en" } };
// TODO: spread-update pages to 340, destructure title, print as specified`,sol:`const book = { title: "JS Guide", pages: 320, meta: { lang: "en" } };
const updated = { ...book, pages: 340 };
console.log(book.pages, updated.pages);
const { title } = updated;
console.log(title);`}
},
{
  id:'js-functions-arrow-scope', course_id:'javascript', unit_id:'js-unit-1', order_index:5,
  title:'Functions & Arrow Functions, Defaults and Rest Parameters', desc:'Compare declarations, expressions and arrows; master this-binding differences.',
  obj:['Distinguish function declarations, function expressions and arrows (hoisting)','Use default parameters and rest parameters','Explain arrow functions\' lexical this vs classic dynamic this'],
  pre:['Objects & destructuring','Variables & scope basics'],
  outcomes:['Learner picks the right function form for methods, callbacks and utilities'],
  def:'JavaScript offers function declarations (hoisted, named), function expressions (values assigned to variables), and arrow functions (concise, no own this/arguments, implicit return for expression bodies). Parameters may carry defaults (used when undefined) and a final rest parameter gathering extra arguments into an array.',
  simple:'JavaScript treats functions as values you can pass around, and gives you three spellings. A declaration (function add(){}) is hoisted — defined everywhere in its scope before the code runs. A function expression (const add = function(){}) exists only from its line onward. Arrow functions (const add = (a,b) => a+b) are the compact modern spelling for short callbacks, with one big difference: they do not get their own `this`. Classic functions receive `this` from HOW they are called (obj.method() → this is obj), while arrows inherit `this` from where they were written — perfect for callbacks inside methods, wrong for defining methods themselves.',
  hing:'JavaScript me function likhne ke teen tareeke hain. Declaration (function add(){}) hoist ho jata hai — line se pehle bhi call kar sakte ho. Expression (const add = function(){}) line ke baad hi usable hai. Arrow function (const add = (a,b) => a+b) chaahta smart, short form hai, khaaskar callbacks ke liye. Sabse bada farak `this` ka hai: normal function ka this call karne wale par nirbhar hai (obj.method() me this=obj), lekin arrow function apna this banata hi nahi — bahar wala this borrow karta hai. Isliye object ke METHOD arrow se mat banao, warna this galt jagah point karega! Default parameter (name = "Guest") aur rest (...nums) bhi aksar kaam aate hain.',
  why:'Callbacks saturate JS (array methods, events, promises). Arrow functions removed the historical this-binding pain inside them, while misuse as methods creates silent this=undefined bugs. Hoisting rules decide whether helper order matters in a module.',
  when:'Use arrows for short callbacks and functional transforms; declarations for named top-level functions (hoisting + stack traces); classic function expressions/method shorthand whenever a dynamic this is required. Defaults beat `x = x || fallback` (which misfires on 0/"").',
  syntax:'function add(a, b) { return a + b; }        // hoisted\nconst sub = (a, b) => a - b;                  // arrow, implicit return\nconst greet = (name = "Guest") => `Hi ${name}`;\nconst total = (...nums) => nums.reduce((s, n) => s + n, 0);',
  comp:[['Implicit return','Arrow with expression body returns it without return/braces'],['this binding','Classic: from call site. Arrow: captured lexically from surrounding scope'],['Rest parameter','(...args) collects remaining arguments into a true array']],
  ex:[
   {t:'Basic: three spellings and hoisting',code:`console.log(squareDecl(4));
function squareDecl(n) { return n * n; }
const cubeExpr = function (n) { return n * n * n; };
const doubleArrow = (n) => n * 2;
console.log(cubeExpr(3));
console.log(doubleArrow(8));`,out:`16
27
16`,why:'The declaration worked BEFORE its textual line (hoisting registered the name during scope setup). The expression/arrow are const bindings usable only after initialisation — calling them earlier would throw a TDZ ReferenceError.'},
   {t:'Intermediate: defaults and rest parameters',code:`const greet = (name = "Guest", punct = "!") => \`Hello, \${name}\${punct}\`;
console.log(greet("Diya"));
console.log(greet());
console.log(greet("Kabir", "."));
const average = (...nums) => {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
};
console.log(average(10, 20, 60));
console.log(average());`,out:`Hello, Diya!
Hello, Guest!
Hello, Kabir.
30
0`,why:'Defaults fill only for undefined gaps (calling with no arguments, or skipping via undefined). Rest turns any call arity into a real array for reduce/length — including zero arguments.'},
   {t:'Advanced: this — arrow capture vs method binding',code:`const timer = {
  label: "Kitchen",
  goodMethod() {
    const describe = () => this.label + " timer";
    return describe();
  },
  badArrow: () => "arrow this is not timer: " + (typeof this === "object"),
};
console.log(timer.goodMethod());
const detached = timer.goodMethod;
console.log(typeof detached);
const obj = {
  value: 42,
  read() { return this.value; },
};
console.log(obj.read());
console.log(obj.read.call({ value: 7 }));`,out:`Kitchen timer
function
42
7`,why:'Inside goodMethod, the arrow captured this=timer lexically, so describe() reads the label. A classic method\'s this is set by the call: obj.read() → 42, and .call redirects it to another object → 7. Defining object methods AS arrows would capture the outer (module/global) this instead.'}
  ],
  walk:[[1,'Before executing line 1, the engine scanned and HOISTED the squareDecl declaration into the scope, so the early call resolves.', 'hoisted'],[3,'cubeExpr is a const whose value (a function) is created only when this line evaluates.', 'bound now'],[4,'The arrow also becomes callable from here on; both follow normal const temporal-dead-zone rules.', 'TDZ applies to const functions'],[6,'doubleArrow uses the expression-body form: no braces, the expression value IS the return value.', 'implicit return']],
  walkWhy:'Function CREATION mechanisms differ (hoisted registration vs runtime assignment), while function CALLING is uniform afterwards. The other divergence, this, is lexical for arrows and dynamic for classic functions.',
  rules:['Arrow functions cannot be constructors (new arrow() throws) and have no arguments object.','An arrow with a {} body needs an explicit return; expression body returns implicitly — object literals need wrapping: () => ({a: 1}).','Default parameters trigger only for undefined (not null/0/"") and are evaluated per call.','Detaching a method (const f = obj.m) loses its dynamic this unless bound (obj.m.bind(obj)) or wrapped.'],
  mistakes:[
   {t:'Arrow function as an object method loses this',bad:'const user = {\n  name: "Diya",\n  greet: () => "Hi " + this.name   // this is NOT user\n};\nconsole.log(user.greet());  // Hi undefined',why:'The arrow captured this from the surrounding scope where it was DEFINED (module top level), which has no name. Method intent needs dynamic this, which arrows deliberately do not provide.',fix:'const user = {\n  name: "Diya",\n  greet() { return "Hi " + this.name; }   // method shorthand\n};',tip:'Arrows for callbacks, shorthand/classic for methods. When this comes back undefined, audit the function form first.'},
   {t:'Expecting an implicit return from a braced arrow',bad:'const double = (n) => { n * 2 };\nconsole.log(double(5));  // undefined',why:'Braces switch to statement-body mode: n * 2 is computed and discarded. Only the concise (braceless) form returns implicitly — a silence-prone typo when converting one form to the other.',fix:'const double = (n) => n * 2;\n// or keep braces AND return:\n// const double = (n) => { return n * 2; };',tip:'Symptom undefined from a one-line "calculation" arrow means missing return almost every time.'}
  ],
  cmp:['Arrow vs classic function',['Aspect','Arrow =>','function'],[['Own this','None — inherits lexically','Dynamic from call site'],['As constructor (new)','Throws','Allowed'],['arguments object','Absent (use rest)','Present'],['Best role','Callbacks, transforms','Methods, constructors, declarations']]],
  diag:{kind:'event'},
  apps:['Array callbacks: items.filter(i => i.price > 0) — arrows everywhere.','React components/handlers as arrow consts preserving lexical context.','Utility libraries expose hoisted declarations for order-independent modules.'],
  quizzes:[{q:'const f = (x) => { x + 1 }; f(4) evaluates to…',options:['5','undefined','Error','{x: 5}'],correct:1,why:'Braces form a statement body with no return; the addition result is discarded.'},
            {q:'Why should object methods usually NOT be arrow functions?',options:['Arrows are slower','Arrows lack their own this, so obj.method() cannot target obj','Syntax error','They cannot take parameters'],correct:1,why:'Lexical this capture means the arrow sees the enclosing scope\'s this, not the receiver object.'}],
  take:['Declarations hoist; const-held functions obey TDZ like any const.','Arrows: implicit return for expression bodies, lexical this, no constructor use.','Use defaults and rest instead of arguments/|| hacks.'],
  rev:'function f(){} hoisted. const f = () => expr returns expr; {} needs return. Arrow this = outer scope. Defaults on undefined only; ...rest collects.',
  assign:{p:'Write (a) a hoisted declaration isMultiple(a, b) returning a % b === 0, (b) an arrow maxAll(...nums) using Math.max with spread. Print isMultiple(20, 5) called BEFORE its declaration line and maxAll(3, 9, 4). Expected:\ntrue\n9',s:`// TODO: call isMultiple before declaring it (hoisting demo), then define maxAll arrow`,sol:`console.log(isMultiple(20, 5));
function isMultiple(a, b) {
  return a % b === 0;
}
const maxAll = (...nums) => Math.max(...nums);
console.log(maxAll(3, 9, 4));`}
},
{
  id:'js-closures-scope', course_id:'javascript', unit_id:'js-unit-1', order_index:6,
  title:'Closures & Lexical Scope', desc:'Functions that remember their birth scope — counters, factories and private state.',
  obj:['Explain lexical scope and how closures capture variables','Build stateful function factories (counters, once-only wrappers)','Diagnose the loop-capture bug and fix it with let/per-iteration bindings'],
  pre:['Functions & arrows','Variables & scope basics'],
  outcomes:['Learner creates encapsulated state without classes and reasons about captured values'],
  def:'A closure is a function bundled with references to variables from the lexical scope where it was created. Those variables stay alive (per outer invocation) as long as the closure exists, invisible to everyone except the closures sharing that scope.',
  simple:'A closure is a backpack a function carries from its birthplace. When an inner function uses a variable from the enclosing function, JavaScript keeps that variable alive inside the backpack even after the outer function has returned and left. That is how a counter factory works: makeCounter() starts count at 0 in its private room, returns the increment function which carries the key, and every call bumps the remembered count — nobody else can touch it. Each factory call builds a FRESH room, so two counters never share state. This pattern — private state without classes — is deeply JavaScript.',
  hing:'Closure matlab function apne janm wali jagah (lexical scope) ke variables ko yaad rakhta hai — jaise ek backpack leke ghumta hai. Outer function Khatm hone ke baad bhi wo variables zinda rehte hain, sirf isi function ke liye. Counter sochho: makeCounter() ek private count rakhta hai aur ek function deta hai jo use badhata rahega — bahar se count ko koi chhoo bhi nahi sakta, total private state bina class ke! Aur har makeCounter() call ek NAYA private kamra banata hai, do counters ek dusre se takrate nahi. Ek mashoor trap: var ke saath loop me closures banao to sab ek hi variable share karte hain — let use karo, har round naya variable.',
  why:'Closures power module patterns, memoization, once-only guards, event handlers remembering context, and currying/partial application. Most JS frameworks are lattices of closures; misunderstanding capture semantics produces the infamous loop-handler bug.',
  when:'Use closures for small private state machines and factories; classes for stateful entities with multiple public operations. In loops, use let (block-scoped per iteration) whenever callbacks capture the counter.',
  syntax:'function makeCounter() {\n  let count = 0;            // private to the closure\n  return () => ++count;     // remembers count\n}\nconst next = makeCounter();\nnext(); // 1, next(); // 2',
  comp:[['Lexical scope','Visibility decided by where code is WRITTEN, not where called'],['Captured variable','Kept alive per outer call while any referencing closure survives'],['Factory function','Outer function manufacturing closures with independent state']],
  ex:[
   {t:'Basic: the counter factory',code:`function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}
const counterA = makeCounter();
console.log(counterA());
console.log(counterA());
const counterB = makeCounter();
console.log(counterB());
console.log(counterA());`,out:`1
2
1
3`,why:'counterA and counterB each closed over their OWN count cell (one per makeCounter call): A progresses 1, 2, 3 while B independently starts at 1. No property exposure means outside code cannot forge or reset the counts.'},
   {t:'Intermediate: closure-based configuration (greeters & tax multipliers)',code:`const makeGreeter = (greeting) => (name) => greeting + ", " + name + "!";
const sayHello = makeGreeter("Hello");
const sayNamaste = makeGreeter("Namaste");
console.log(sayHello("Diya"));
console.log(sayNamaste("Diya"));
const withTax = (rate) => (price) => Math.round(price * (1 + rate));
const addGST = withTax(0.18);
const addVAT = withTax(0.05);
console.log(addGST(1000), addVAT(1000));`,out:`Hello, Diya!
Namaste, Diya!
1180 1050`,why:'Parameters are captured just like local variables: each manufactured function remembers the greeting/rate from its founding call — partial application with zero class machinery.'},
   {t:'Advanced: the loop capture bug — var vs let',code:`const fnsVar = [];
for (var i = 0; i < 3; i++) {
  fnsVar.push(() => i);
}
console.log(fnsVar.map((f) => f()));
const fnsLet = [];
for (let j = 0; j < 3; j++) {
  fnsLet.push(() => j);
}
console.log(fnsLet.map((f) => f()));`,out:`[ 3, 3, 3 ]
[ 0, 1, 2 ]`,why:'Closures capture the VARIABLE, not its momentary value. var declares ONE i for the whole loop, so all three read its final 3. let mints a fresh binding per iteration, freezing the intended sequence 0, 1, 2.'}
  ],
  walk:[[2,'makeCounter() runs: a fresh count binding (0) is created in this call\'s environment.','count=0 (cell A)'],[3,'The returned function references count, so the environment survives makeCounter\'s return.','closure holds cell A'],[8,'First call increments the SAME cell to 1 and returns it; the cell persists between calls.','count=1'],[10,'A second makeCounter() call mints cell B at 0 — counterB starts at 1 independently while A continues to 3.','cells never mix']],
  walkWhy:'Persistence is reference-driven: as long as a returned closure is reachable, its captured environment is kept by the garbage collector — private, exact, and per-factory-call.',
  rules:['Closures capture bindings, not snapshots: later writes to the variable are visible to the closure (and vice versa).','Each outer invocation creates an independent environment; sibling closures from the SAME call share those variables.','var in loops shares one binding (function scope) — prefer let for per-iteration capture.','Long-lived closures keep their entire captured environment alive; avoid capturing huge objects unnecessarily.'],
  mistakes:[
   {t:'var loop closures printing the final value',bad:'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);  // 3 3 3\n}',why:'Only one i exists; the callbacks run after the loop ends with i = 3. This puzzled a generation of JS developers when handlers all reported the last index.',fix:'for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);  // 0 1 2\n}',tip:'let in a for-head creates a fresh binding each iteration specifically to support this pattern.'},
   {t:'Believing closure state is a per-call snapshot',bad:'function make() {\n  let total = 0;\n  return { add: (n) => (total += n), peek: () => total };\n}\nconst m = make();\nm.add(5);\n// learner expects peek()() === 0 (fresh total) — actually 5',why:'add and peek were born in the SAME make() call, so they share one total cell by design — that sharing is the feature, giving cooperating methods private shared state.',fix:'// no fix needed once understood: call make() again for an independent total',tip:'Ask "which outer call created this function?" to predict exactly which variables it shares.'}
  ],
  cmp:['Closure state vs class instance',['Aspect','Closure factory','Class instance'],[['State storage','Captured locals','this fields'],['True privacy','Yes — unreachable from outside','Naming convention (# fields aside)'],['Multiple operations','Return object of closures','Prototype methods'],['Memory per instance','Methods duplicated per closure set','Methods shared via prototype']]],
  diag:{kind:'flow',start:'Outer function runs',condition:'Inner fn references locals?',trueAction:'Environment kept alive for the closure',falseAction:'Locals garbage-collected normally',end:'Each outer call → independent state'},
  apps:['Memoizers caching expensive computations in captured Maps.','Once-only initialisation guards and debounce/throttle wrappers.','Event handlers remembering the item/index they were created for.'],
  quizzes:[{q:'const c = makeCounter(); c(); c(); makeCounter()(); c(); — the last c() returns…',options:['1','2','3','4'],correct:2,why:'c\'s private cell was incremented to 2 by the first two calls; the unrelated new counter does not touch it, so the final call returns 3.'},
            {q:'Why did all var-loop closures print 3?',options:['map runs late','They share the single function-scoped i, read after the loop ended','Closures copy values at creation — wrong values came from map','setTimeout bug'],correct:1,why:'Capture is by binding: one shared i whose final value is 3 when the callbacks eventually execute.'}],
  take:['Closures carry their birth scope; outer-call identity decides sharing.','Factory functions give truly private, per-instance state.','Use let for loop captures — var shares one binding across iterations.'],
  rev:'Closure = fn + captured bindings (live, not snapshots). makeCounter per-call fresh state. let per-iteration binding fixes loop capture; var shares.',
  assign:{p:'Write makeAccount(startBalance) returning an object with deposit(n) and balance() methods closing over a private balance variable (never stored as a property). Create an account with 100, deposit 50 twice, and print balance() (expected first line: 200). On the second line print exactly: no direct access: balance is a method, not data — produced by checking typeof account.balance === "function" to prove the amount itself is not exposed as readable data.',s:`// TODO: makeAccount with private balance via closure`,sol:`function makeAccount(startBalance) {
  let balance = startBalance;
  return {
    deposit(n) { balance += n; },
    balance() { return balance; },
  };
}
const account = makeAccount(100);
account.deposit(50);
account.deposit(50);
console.log(account.balance());
console.log("no direct access: " + (typeof account.balance === "function" ? "balance is a method, not data" : ""));`}
},
{
  id:'js-classes-prototypes', course_id:'javascript', unit_id:'js-unit-1', order_index:7,
  title:'Classes & Prototypes: constructor, extends, super', desc:'Use class sugar over prototypes, inherit behaviour, and add static members.',
  obj:['Write classes with constructors, fields and methods','Extend classes with super calls and method overriding','Explain prototype-based method sharing and instanceof'],
  pre:['Objects & functions','Closures'],
  outcomes:['Learner models entities with classes and understands their prototype mechanics'],
  def:'A JavaScript class is syntactic sugar over constructor functions and prototypes: methods live on ClassName.prototype shared by all instances, while fields assigned in the constructor are per-instance. extends wires the prototype chain and requires super(...) in derived constructors before using this; static members belong to the class itself.',
  simple:'A JS class looks like Java/C++ but underneath is the older prototype machine: the constructor stamps out objects, and methods are stored ONCE on a shared prototype recipe card that every instance looks up when called — memory efficient and dynamically updatable. extends links the child\'s prototype chain to the parent\'s, and the child constructor must run super(...) first so the parent part of the object exists before this is touched. static methods belong to the class as a utility drawer (Math.max style), not to instances. Remember: classes are not hoisted — define before use.',
  hing:'JavaScript class asal me prototype system ke upar ki mithi chaadar (syntax sugar) hai. Methods har object me alag nahi bante — wo ClassName.prototype par ek jagah rehte hain aur sare instances wahi se use karte hain. extends prototype chain ko parent se jod deta hai. Ek golden rule: child constructor me `this` use karne se PEHLE super(...) bulana hi padega, warna ReferenceError! static method class ka apna hota hai (Math.max jaise) — instance se call nahi hota. Aur class hoist nahi hoti, pehle define karo phir new chalao. instanceof check karta hai ki object ki prototype chain me wo class hai ya nahi.',
  why:'Classes structure most modern JS (components, models, errors). Knowing methods live on prototypes explains instanceof, why detached methods lose this, and how libraries monkey-patch. extends/super encode standard OOP reuse expected by every codebase.',
  when:'Use classes for stateful entities with multiple behaviours and clear identity (User, Cart). Use plain objects/factory closures for data-only records. Keep hierarchies shallow; prefer composition for mix-and-match behaviour.',
  syntax:'class Account {\n  constructor(owner) { this.owner = owner; this.balance = 0; }\n  deposit(n) { this.balance += n; }\n  static bankName() { return "CodeBank"; }\n}\nclass Savings extends Account {\n  constructor(owner) { super(owner); }\n}',
  comp:[['prototype','Shared object holding methods; instance lookup walks the chain'],['super(...)','Runs the parent constructor; mandatory before this in derived classes'],['static','Member on the class itself, called as ClassName.method()']],
  ex:[
   {t:'Basic: defining and using a class',code:`class Student {
  constructor(name, marks) {
    this.name = name;
    this.marks = marks;
  }
  grade() {
    return this.marks >= 90 ? "A" : this.marks >= 60 ? "B" : "C";
  }
  describe() {
    return this.name + " (" + this.grade() + ")";
  }
}
const s1 = new Student("Diya", 92);
const s2 = new Student("Kabir", 74);
console.log(s1.describe());
console.log(s2.describe());
console.log(s1 instanceof Student);
console.log(s1.grade === s2.grade);`,out:`Diya (A)
Kabir (B)
true
true`,why:'Fields (name/marks) differ per instance, yet grade is literally the same function object on Student.prototype for both — prototype sharing in action. instanceof walks s1\'s prototype chain and finds Student.prototype.'},
   {t:'Intermediate: inheritance, super and overriding',code:`class Account {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }
  deposit(n) { this.balance += n; }
  fee() { return 100; }
  summary() { return this.owner + ": " + this.balance + " fee=" + this.fee(); }
}
class Savings extends Account {
  constructor(owner) {
    super(owner);
    this.rate = 0.04;
  }
  fee() { return 0; }
  addInterest() { this.balance += this.balance * this.rate; }
}
const a = new Account("Asha");
a.deposit(1000);
const s = new Savings("Diya");
s.deposit(1000);
s.addInterest();
console.log(a.summary());
console.log(s.summary());`,out:`Asha: 1000 fee=100
Diya: 1040 fee=0`,why:'super(owner) builds the Account part before rate is set. summary() is inherited untouched, yet its internal this.fee() dispatches to Savings\' override — polymorphism via the prototype chain.'},
   {t:'Advanced: statics, getters and method borrowing limits',code:`class Temp {
  constructor(celsius) {
    this.celsius = celsius;
  }
  get fahrenheit() {
    return this.celsius * 9 / 5 + 32;
  }
  static fromFahrenheit(f) {
    return new Temp((f - 32) * 5 / 9);
  }
}
const t = new Temp(100);
console.log(t.fahrenheit);
console.log(Temp.fromFahrenheit(32).celsius);
console.log(typeof Temp);
const detachedCode = "methods shared: " + (Object.getPrototypeOf(t) === Temp.prototype);
console.log(detachedCode);`,out:`212
0
function
methods shared: true`,why:'The getter computes fahrenheit on access (t.fahrenheit, no parentheses). fromFahrenheit is a static factory on the class itself. typeof confirms classes are functions underneath, and the instance\'s prototype IS Temp.prototype.'}
  ],
  walk:[[13,'new Student(...) allocates a fresh object linked to Student.prototype, then runs the constructor with this bound to it.','instance linked to prototype'],[15,'s1.describe: not found as an own property, so lookup walks to Student.prototype and calls it with this=s1.','prototype lookup'],[18,'s1.grade === s2.grade is true because both resolve to the single prototype function object.','one shared method'],[17,'instanceof repeats the walk checking for Student.prototype anywhere in the chain.','chain verified']],
  walkWhy:'Understanding the lookup chain — own properties first, then prototypes — predicts method sharing, overriding behaviour, and why adding a method to a prototype instantly teaches all existing instances.',
  rules:['Classes are in the temporal dead zone: using one before its declaration throws ReferenceError (unlike function declarations).','Derived constructors MUST call super(...) before touching this, and exactly once.','Class methods are non-enumerable and always strict-mode; calling a detached method loses this (undefined in strict class bodies when extracted).','Private fields use #name syntax (truly private); underscore naming is merely convention.'],
  mistakes:[
   {t:'Using this before super() in a derived constructor',bad:'class Savings extends Account {\n  constructor(owner) {\n    this.rate = 0.04;   // ReferenceError!\n    super(owner);\n  }\n}',err:'ReferenceError: Must call super constructor in derived class before accessing \'this\'',why:'The child part of the object does not exist until the parent constructor completes. JavaScript enforces the build order at runtime with this exact error.',fix:'constructor(owner) {\n    super(owner);\n    this.rate = 0.04;\n  }',tip:'super(...) is always the first statement of a derived constructor — before logs, before fields, before anything this-shaped.'},
   {t:'Passing a bare method reference as a callback',bad:'const acc = new Account("Diya");\nconst doDeposit = acc.deposit;\ndoDeposit(100);   // TypeError: cannot read balance of undefined',err:"TypeError: Cannot read properties of undefined (reading 'balance')",why:'deposit lives on the prototype and relies on dynamic this. Detached into a variable and called standalone, this is undefined (strict class semantics).',fix:'const doDeposit = acc.deposit.bind(acc);\n// or wrap: const doDeposit = (n) => acc.deposit(n);',tip:'bind once, use arrow class fields for handlers, or invoke as acc.deposit(n) at call time.'}
  ],
  cmp:['Class fields vs prototype methods',['Aspect','Fields (this.x)','Methods (prototype)'],[['Per instance','Own copy per object','One shared function'],['Memory','Scales with instances','Constant'],['Lookup','Own property hits first','Chain walk on miss'],['Late addition','Only affects that object','ClassName.prototype.m = ... teaches all']]],
  diag:{kind:'flow',start:'obj.method() called',condition:'Own property?',falseAction:'Walk prototype chain until found',trueAction:'Use the own property directly',end:'Call with this = obj'},
  apps:['Domain models in Node backends (User, Order) with validation in constructors.','Custom Error subclasses extending Error for typed failures.','UI component classes historically (pre-hooks React) — same extends mechanics.'],
  quizzes:[{q:'Why is s1.grade === s2.grade true for two Student objects?',options:['grade is static','Both instances share the one function on Student.prototype','== coerces functions','It is actually false'],correct:1,why:'Methods are stored once per class on the prototype; instances resolve to the identical function object.'},
            {q:'A derived constructor references this before super(). Actual behaviour?',options:['undefined silently','ReferenceError at runtime','super auto-called first','Only a warning'],correct:1,why:'Derived classes have no usable this until super() completes; touching it throws ReferenceError.'}],
  take:['Classes = prototype sugar: fields per instance, methods shared on the prototype.','super(...) first in derived constructors; statics live on the class.','Detach methods carefully (bind), and declare classes before use (TDZ).'],
  rev:'class X { constructor(){} method(){} static util(){} } extends+super() hierarchy. instanceof walks the prototype chain. Methods shared, fields own.',
  assign:{p:'Write class Rectangle {constructor(w,h); area()} and subclass Square extends Rectangle (constructor(side) calling super(side, side)) overriding a describe() that returns "square area=<area>". Print new Square(5).describe() and (square instanceof Rectangle).',s:`// TODO: Rectangle, Square extends with super, describe override`,sol:`class Rectangle {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }
  area() { return this.w * this.h; }
  describe() { return "rectangle area=" + this.area(); }
}
class Square extends Rectangle {
  constructor(side) {
    super(side, side);
  }
  describe() { return "square area=" + this.area(); }
}
const sq = new Square(5);
console.log(sq.describe());
console.log(sq instanceof Rectangle);`}
},
{
  id:'js-error-handling', course_id:'javascript', unit_id:'js-unit-1', order_index:8,
  title:'Error Handling: try/catch, throw & Custom Errors', desc:'Guard risky code, throw meaningful errors, and structure finally cleanup.',
  obj:['Use try/catch/finally with correct flow','Throw Error objects (not strings) and read name/message/stack','Create and distinguish custom error subclasses with instanceof'],
  pre:['Functions','Classes (for custom errors)'],
  outcomes:['Learner converts crashes into handled outcomes with diagnosable errors'],
  def:'JavaScript errors are objects (Error and subclasses like TypeError, RangeError, ReferenceError). throw raises any value (conventionally an Error), unwinding to the nearest catch; finally runs unconditionally after try/catch. Optional catch binding and error.cause support modern diagnostics.',
  simple:'Errors in JS are objects carrying a name, a message, and a stack trace of where things went south. When risky code throws, the runtime drops everything and hunts for the nearest catch — like a fire alarm evacuating floor by floor. Your job: put try around the risky room only, catch to decide what recovery means (retry, fallback, friendly message), and finally for the mop-up that must happen regardless (close the spinner, release the lock). Throw your own errors with real Error objects so whoever catches them gets a stack, and subclass Error when callers must tell failure types apart (OutOfStock vs PaymentFailed).',
  hing:'JavaScript me error ek object hai — name, message aur stack trace ke saath. Jab kuch throw hota hai, execution wahi rukti hai aur sabse paas wale catch ko dhundha jata hai. try risky code ke chaaron taraf rakho, catch me recovery decide karo, aur finally me wo safai rakho jo har haal me honi hai. Apni galti fekni ho to hamesha new Error("...") throw karo — string fekne se stack trace gayab ho jata hai aur debugging mushkil. Alag-alag failures ko pehchan na ho to custom error class banao extends Error karke, phir instanceof se caller faisla lega. Sabse buri aadat: khaali catch {} chhodna — error anjaan me mar jata hai aur bug chhup jata hai!',
  why:'Parsing user JSON, indexing possibly-absent data, calling fallible APIs — production JS is failure-rich. Precise try/catch placement and typed errors turn crashes into UX (form hints, retries) and give observability (stacks in logs) when recovery is impossible.',
  when:'Catch where you can act meaningfully; let unexpected errors propagate to a top-level handler/logger. Wrap the smallest risky statement; include finally for state restoration. Validate inputs early and throw TypeError/RangeError to signal programming errors distinctly.',
  syntax:'try {\n  const data = JSON.parse(text);\n} catch (err) {\n  console.log(err.name, err.message);\n} finally {\n  cleanup();\n}\nthrow new RangeError("marks cannot exceed 100");',
  comp:[['err.name / err.message','Error category and human explanation; err.stack gives the call path'],['finally','Runs after try AND after catch, even on return/throw'],['Custom class extends Error','Typed failures distinguishable via instanceof']],
  ex:[
   {t:'Basic: catching JSON parse failures',code:`function parseMarks(text) {
  try {
    const value = JSON.parse(text);
    return value;
  } catch (err) {
    return "invalid: " + err.name;
  }
}
console.log(parseMarks('{"diya": 92}'));
console.log(parseMarks('{oops}'));
console.log(parseMarks('[1, 2, 3]'));`,out:`{ diya: 92 }
invalid: SyntaxError
[ 1, 2, 3 ]`,why:'JSON.parse throws SyntaxError with parser detail on malformed input. Catching converts a crash into a returnable outcome while valid JSON flows through as objects/arrays.'},
   {t:'Intermediate: throwing typed errors for rule violations',code:`function withdraw(balance, amount) {
  if (typeof amount !== "number") {
    throw new TypeError("amount must be a number");
  }
  if (amount <= 0) {
    throw new RangeError("amount must be positive");
  }
  if (amount > balance) {
    throw new Error("insufficient funds");
  }
  return balance - amount;
}
const attempts = [[100, 30], [100, -5], [100, "50"], [100, 900]];
for (const [bal, amt] of attempts) {
  try {
    console.log("new balance:", withdraw(bal, amt));
  } catch (err) {
    console.log(err.name + ":", err.message);
  }
}`,out:`new balance: 70
RangeError: amount must be positive
TypeError: amount must be a number
Error: insufficient funds`,why:'Distinct builtin types let callers branch on failure KIND via instanceof/name while message carries the specifics. The loop presents each uniformly, and successful calls never touch the catch.'},
   {t:'Advanced: custom error class with finally discipline',code:`class OutOfStockError extends Error {
  constructor(item) {
    super(item + " is out of stock");
    this.name = "OutOfStockError";
    this.item = item;
  }
}
const stock = { pen: 3, ink: 0 };
function order(item, qty) {
  let reserved = false;
  try {
    if (!stock[item] || stock[item] < qty) throw new OutOfStockError(item);
    stock[item] -= qty;
    reserved = true;
    return "ordered " + qty + " x " + item;
  } finally {
    console.log("cart session closed, reserved=" + reserved);
  }
}
try {
  console.log(order("pen", 2));
  console.log(order("ink", 1));
} catch (err) {
  if (err instanceof OutOfStockError) {
    console.log("please reorder:", err.item);
  } else {
    throw err;
  }
}`,out:`cart session closed, reserved=true
ordered 2 x pen
cart session closed, reserved=false
please reorder: ink`,why:'finally runs even mid-return (its log precedes "ordered..." reaching the outer print) and on the throw path. The custom class carries structured data (err.item) so the handler can react precisely instead of parsing messages.'}
  ],
  walk:[[2,'JSON.parse receives malformed text and throws a SyntaxError object built by the parser.','throw from library'],[4,'The rest of try is abandoned mid-statement; control jumps to the catch with err bound.','caught'],[6,'The catch RETURNS a substitute string, so parseMarks fulfils its contract for bad input differently.','recovery value'],[9,'Valid inputs never enter catch; they return from inside try in one clean path.','happy path']],
  walkWhy:'try/catch converts an exceptional control transfer into ordinary branchable values at exactly one point — the narrow waist is what makes failures manageably local.',
  rules:['Always throw Error objects (or subclasses), never raw strings/numbers — stack traces are irreplaceable for debugging.','finally executes on every path including return/throw inside try or catch; avoid returning from finally (it swallows exceptions).','Catch blocks should not be empty; recover, annotate+log, or rethrow.','JSON.parse, decodeURIComponent, and property access on possibly-undefined values are everyday throw sources — guard them deliberately.'],
  mistakes:[
   {t:'Throwing a string instead of an Error',bad:'if (!user) throw "user missing";',why:'A string carries no name/stack; downstream catch code and logging tools get no origin information, and instanceof checks become impossible. The line that threw becomes archaeology.',fix:'if (!user) throw new Error("user missing");\n// or a custom class for typed handling',tip:'throw new Error/type is the only acceptable shape; linters flag literal throws for good reason.'},
   {t:'Over-wide try hiding which statement failed',bad:'try {\n  const a = step1();\n  const b = step2(a);   // which one threw?\n  return step3(b);\n} catch (e) { return "something failed"; }',why:'A catch spanning three operations cannot know the state at failure, often "recovers" wrongly, and masks bugs in steps that were supposed to be infallible.',fix:'const a = step1();\nlet b;\ntry { b = step2(a); } catch (e) { b = fallback(a, e); }\nreturn step3(b);',tip:'Wrap only the statement(s) whose failure you specifically know how to handle.'}
  ],
  cmp:['Built-in error types',['Error','Means','Typical trigger'],[['TypeError','Wrong type/operation','null.x, calling non-function'],['ReferenceError','Unknown binding','Typo variable, TDZ access'],['RangeError','Value out of allowed range','Invalid array length, bad precision'],['SyntaxError','Malformed text/code','JSON.parse, eval garbage']]],
  diag:{kind:'event'},
  apps:['Form validation aggregating field errors instead of crashing on the first bad value.','Storage/API layers raising typed errors (NetworkError, AuthError) for UI-specific recovery.','Finally-driven UI cleanup: hide spinners, re-enable buttons after async attempts.'],
  quizzes:[{q:'In try { return 1; } finally { console.log("F"); } — when does F print?',options:['Never','After the caller receives 1','Before the return completes, on the way out','Only on exception'],correct:2,why:'finally interposes on every exit path: the return value is computed, finally runs, then the function actually returns.'},
            {q:'Why throw new Error("x") instead of throw "x"?',options:['Strings cannot be caught','Error objects carry name, message and stack for diagnosis','throw requires new','Identical behaviour'],correct:1,why:'The stack/name make failures locatable and classifiable; a bare string discards that intelligence.'}],
  take:['Wrap narrowly, catch to recover, finally to clean up — always.','Throw Error subclass objects; distinguish failure kinds with types, not message parsing.','Empty catch blocks are where bugs go to hide.'],
  rev:'try risky, catch(err) recover via err.name/message, finally always. throw new TypeError/RangeError/custom extends Error. Rethrow what you cannot handle.',
  assign:{p:'Write parseAge(text) that returns Number(text) but throws RangeError("age out of range") when result is NaN or outside 0..120 (hint: Number.isNaN). Try "25", "abc", "150" printing value or "RangeError: age out of range".',s:`// TODO: parseAge + attempts loop`,sol:`function parseAge(text) {
  const age = Number(text);
  if (Number.isNaN(age) || age < 0 || age > 120) {
    throw new RangeError("age out of range");
  }
  return age;
}
for (const t of ["25", "abc", "150"]) {
  try {
    console.log(parseAge(t));
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}`}
},
{
  id:'js-modules-pattern', course_id:'javascript', unit_id:'js-unit-1', order_index:9,
  title:'Modules in JavaScript: export/import & Namespacing', desc:'Split code across files with ES modules, named/default exports, and privacy by file scope.',
  obj:['Distinguish named vs default exports/imports and renaming','Explain module scope privacy and single-evaluation caching','Apply the namespace pattern in single-file programs'],
  pre:['Functions & closures','Objects'],
  outcomes:['Learner structures multi-file JS and can simulate modules in one file'],
  def:'An ES module is a file with its own top-level scope; only exported bindings (named exports, or one default export) are visible to importers. Imports are live, read-only views of the exporting module\'s bindings, and each module evaluates exactly once per program. In this course sandbox, single-file programs demonstrate the same ideas with closure-based namespaces.',
  simple:'Modules are apartments with a front desk: everything inside a file is private by default, and only what the file explicitly exports can be collected by neighbours via import. This replaces the bad old days of every script dumping globals into one shared room. A module can offer many named exports (export function add(){}) picked by name at import, plus optionally one headline default export. Each module runs just once — everyone importing it shares the same evaluated instance. Since this lesson\'s sandbox runs single files, the executable examples build tiny closure namespaces that behave exactly like mini-modules (private internals, public returned API).',
  hing:'Module matlab ek file = apna private kamra. File ke andar ke variables bahar wale ko dikhte hi nahi, sirf jo export kiya wahi import ho sakta hai. Do export ke roop: named (export function add(){}) jitne chaaho, aur default sirf ek — file ki mukhya cheez ke liye. import karte waqt naam se uthao: import { add } from "./math.js". Ek module pure program me sirf EK baar chalta hai, sab importers wahi instance share karte hain. Is lesson ke sandbox me single-file chalti hai, isliye examples me closure-based chhota namespace banakar wahi pattern dikhaya gaya hain — asal projects me yahi kaam export/import lines karti hain.',
  why:'Modules are the unit of organisation in every real JS codebase and library (npm). Encapsulation by file, explicit dependencies, and tree-shaking all descend from this model, and interviewers probe named-vs-default semantics constantly.',
  when:'One concept per module; named exports for utilities (import { clamp }), default for the file\'s single main class/component in many conventions. Avoid mixing styles inconsistently within a project; never mutate imported bindings (they are read-only).',
  syntax:'// math.js\nexport const PI = 3.14159;\nexport function add(a, b) { return a + b; }\nexport default class Calc {}\n\n// app.js\nimport Calc, { add, PI as pi } from "./math.js";',
  comp:[['Named export','export name; imported by exact name in braces (renamable with as)'],['Default export','Single main value; imported without braces under any local name'],['Module scope','Top-level names are file-private; modules are strict-mode and evaluated once']],
  ex:[
   {t:'Basic: a closure namespace behaving like a module',code:`const MathKit = (() => {
  const PI = 3.14159;
  function add(a, b) { return a + b; }
  function circleArea(r) { return PI * r * r; }
  return { add, circleArea };
})();
console.log(MathKit.add(2, 3));
console.log(MathKit.circleArea(1).toFixed(2));
console.log(typeof MathKit.PI);`,out:`5
3.14
undefined`,why:'PI stayed private inside the factory closure (its final typeof is undefined from outside) while add/circleArea formed the "exported" API. Real modules achieve this with file scope: export const/function in math.js, import { add } in app.js.'},
   {t:'Intermediate: a tiny module registry (named + default ideas)',code:`const registry = {};
function define(name, factory) {
  registry[name] = factory();
}
define("billing", () => {
  const TAX = 0.18;
  const total = (price, qty) => Math.round(price * qty * (1 + TAX));
  return { total };
});
define("greeter", () => {
  const hello = (name) => "Hello, " + name;
  return { defaultName: "Guest", hello };
});
const billing = registry.billing;
const { hello, defaultName } = registry.greeter;
console.log(billing.total(100, 3));
console.log(hello(defaultName));`,out:`354
Hello, Guest`,why:'define() plays the loader: each factory evaluated once and cached — mirroring how import returns the same module instance to everyone. Destructuring the greeter namespace mimics named imports; TAX remains private inside billing.'},
   {t:'Advanced: shared module state across "importers"',code:`const LoggerModule = (() => {
  const entries = [];
  return {
    log(msg) { entries.push(msg); },
    count() { return entries.length; },
    latest() { return entries[entries.length - 1]; },
  };
})();
const importerA = LoggerModule;
const importerB = LoggerModule;
importerA.log("boot");
importerB.log("login");
console.log(importerA.count(), importerB.latest());
console.log(importerA === importerB);`,out:`2 login
true`,why:'Both aliases reference THE SAME module instance, so A\'s and B\'s logs accumulate in one private array — exactly how two files importing one ES module share its top-level state. This single-instance rule is intentional and powerful (and occasionally surprising).'}
  ],
  walk:[[1,'The IIFE factory runs immediately: PI and helpers are created inside its private scope.','private scope born'],[3,'Only the returned object\'s properties escape — this is the export list of our simulated module.','public API = add, circleArea'],[7,'Consumers call through the namespace object, MathKit.add — parallel to import * as MathKit.','qualified access'],[9,'MathKit.PI is undefined from outside because nothing exported it; privacy is structural, not a naming plea.','encapsulation proven']],
  walkWhy:'File-scoped modules generalise this closure pattern: unexported names are unreachable, period — which is why module refactors are safe while global-variable spaghetti is not.',
  rules:['Imports must be top-level static declarations in ES modules; import bindings are read-only live views (assigning to them throws).','A module may have many named exports and at most one default export.','Modules evaluate once and are cached process-wide; top-level side effects run a single time.','Circular imports can observe partially-initialised bindings — structure dependencies as a DAG.'],
  mistakes:[
   {t:'Braces around a default import (or missing braces for named)',bad:'// math.js: export default Calc; export const PI = 3.14;\nimport { Calc } from "./math.js";   // looks for NAMED Calc -> undefined/error\nimport PI from "./math.js";        // binds DEFAULT (Calc) mislabeled PI!',why:'Braces select named exports; no braces binds the default. The second line imports something real but entirely wrong — the class, renamed PI by you — yielding bewildering runtime types.',fix:'import Calc, { PI } from "./math.js";  // default + named, correctly routed',tip:'Read imports aloud: no-braces = the headline export; braces = pick named items off the shelf.'},
   {t:'Expecting each import to create fresh module state',bad:'// store.js: export const cart = [];\n// fileA imports cart and pushes items;\n// fileB imports cart "fresh" — sees A\'s items!',why:'Modules are singletons: the SAME cart array serves both importers. This is correct for shared stores/caches, disastrous when a file expected isolation.',fix:'// export a factory for fresh instances:\nexport function makeCart() { return []; }',tip:'Exported mutable objects are global-ish singletons; export factories/classes when callers need independent instances.'}
  ],
  cmp:['Named vs default exports',['Aspect','Named export','Default export'],[['Count per module','Many','At most one'],['Import syntax','import { add, PI as pi }','import Calc (any name)'],['Rename freedom','Explicit as','Free at import'],['Refactor safety','Exact-name tooling/renames','Name varies by importer']]],
  diag:{kind:'flow',start:'File defines code',condition:'Exported?',trueAction:'Importers can bind it by name/default',falseAction:'File-private forever',end:'Module evaluated once, shared by all'},
  apps:['Splitting apps into api.js, auth.js, ui.js with explicit imports.','Libraries surface a curated public API from internal modules.','Configuration singletons (db pool, logger) via module caching.'],
  quizzes:[{q:'import { X } from "./m.js" succeeds only if m.js has…',options:['A default export','A named export called X','A global X','Any export at all'],correct:1,why:'Braced imports match named exports by name (renamed via as if needed).'},
            {q:'Two files import the same module. Its top-level code runs…',options:['Twice (once per importer)','Once; both share the instance','Never until called','Once per function use'],correct:1,why:'Module evaluation is cached — single instance, shared state, run once.'}],
  take:['Un-exported names are unreachable: files are private by default.','Named exports come in braces; the default export comes bare (any local name).','Modules are singletons — export factories for per-caller freshness.'],
  rev:'export named (many) / default (one). import Name, { a, b as c }. Single evaluation, read-only bindings, file-private scope.',
  assign:{p:'Build a StringKit closure namespace exposing shout(s) (uppercase + "!") and title(s) (first char uppercase + rest lowercase), keeping a private helper. Print shout("go") and title("tEAM"). Expected:\nGO!\nTeam',s:`// TODO: StringKit closure namespace with private helper`,sol:`const StringKit = (() => {
  const first = (s) => s.charAt(0);
  const rest = (s) => s.slice(1);
  return {
    shout(s) { return s.toUpperCase() + "!"; },
    title(s) { return first(s).toUpperCase() + rest(s).toLowerCase(); },
  };
})();
console.log(StringKit.shout("go"));
console.log(StringKit.title("tEAM"));`}
},
{
  id:'js-fetch-async-data', course_id:'javascript', unit_id:'js-unit-1', order_index:11,
  title:'Working with API Data: fetch, Response & JSON', desc:'Model the real fetch lifecycle — promises, ok checks, JSON parsing, error paths.',
  obj:['Trace fetch -> Response -> await res.json() flow','Handle HTTP errors (note: fetch does NOT reject on 404/500)','Sequence and parallelise requests with async/await and Promise.all'],
  pre:['Async & promises','Error handling','Objects/JSON'],
  outcomes:['Learner consumes JSON APIs with correct success/error handling'],
  def:'fetch(url) returns a Promise of a Response once headers arrive; the body is then read via response.json()/text() (also Promises). fetch rejects only on network failure — HTTP error statuses (404, 500) resolve normally and must be detected via response.ok/status before parsing data.',
  simple:'Fetching data is a two-envelope process. fetch(url) promises you the sealed envelope (the Response) as soon as headers land; opening it with await response.json() downloads and parses the actual letter inside. The famous trap: a 404 or 500 still delivers an envelope happily — fetch only "fails" (rejects) when the network itself breaks, so YOU must check response.ok and throw for bad statuses, or your code will happily parse an error page. This sandbox has no network, so the examples run a faithful fake fetch returning the same Response-shaped promises — the handling code you write is byte-for-byte what production code looks like with real fetch swapped in.',
  hing:'fetch(url) seedha data nahi deta! Pehle milta hai Response (band lifafa), phir await res.json() se asal data khulta hai — do kadam, dono async. Sabse bada trap: 404 ya 500 par bhi fetch reject NAHI hota, promise normally resolve hota hai! Sirf network tootne par reject hota hai. Isliye res.ok check karna khud ki zimmedari hai, warna error page ko data samajh kar parse kar doge. Kai requests ek saath chalani hain to Promise.all se parallel karo — ek-ek karke await karna dheema padta hai. Is sandbox me net nahi hai, isliye yahan ek nakli (mock) fetch chalaya gaya jo bilkul waisa hi Response deta hai — handling code asal jaisa hi hai.',
  why:'Nearly all modern apps are API clients. The res.ok discipline and two-stage await model are where silent data bugs (rendering an error body as content) breed; Promise.all parallelism is the difference between snappy and sluggish screens.',
  when:'Standard pattern: const res = await fetch(url); if (!res.ok) throw ...; const data = await res.json(). Use Promise.all for independent requests, sequential await when later calls need earlier results, and AbortController for cancellable/timeout-able production calls.',
  syntax:'async function loadUser(id) {\n  const res = await fetch("/api/users/" + id);\n  if (!res.ok) throw new Error("HTTP " + res.status);\n  return res.json();          // promise of parsed body\n}',
  comp:[['Response','Headers/status wrapper; body consumed once via .json()/.text()'],['res.ok','True for status 200-299 — your manual HTTP success gate'],['Promise.all','Runs requests concurrently; rejects fast on first failure']],
  ex:[
   {t:'Basic: the two-step fetch with an ok check (mock network)',code:`function fakeFetch(url) {
  const table = {
    "/api/users/1": { status: 200, body: { id: 1, name: "Diya" } },
  };
  const hit = table[url];
  return Promise.resolve({
    ok: Boolean(hit),
    status: hit ? hit.status : 404,
    json: async () => (hit ? hit.body : { error: "not found" }),
  });
}
async function loadUser(fetchFn, id) {
  const res = await fetchFn("/api/users/" + id);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
(async () => {
  const user = await loadUser(fakeFetch, 1);
  console.log("loaded:", user.name);
  try {
    await loadUser(fakeFetch, 99);
  } catch (err) {
    console.log("failed:", err.message);
  }
})();`,out:`loaded: Diya
failed: HTTP 404`,why:'Only the transport is faked; loadUser is exactly production shape. The 404 RESOLVED (no rejection), and our explicit ok check converted it into a catchable error — omit that check and {error:"not found"} would masquerade as a user.'},
   {t:'Intermediate: transforming arrays of API records',code:`function fakeFetchProducts() {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ([
      { id: 1, name: "Pen", price: 20, stock: 5 },
      { id: 2, name: "Notebook", price: 80, stock: 0 },
      { id: 3, name: "Bag", price: 499, stock: 2 },
    ]),
  });
}
async function availableNames(fetchFn) {
  const res = await fetchFn("/api/products");
  if (!res.ok) throw new Error("HTTP " + res.status);
  const items = await res.json();
  return items.filter((p) => p.stock > 0).map((p) => p.name);
}
(async () => {
  console.log(await availableNames(fakeFetchProducts));
})();`,out:`[ 'Pen', 'Bag' ]`,why:'After the await unwrap, API JSON is ordinary arrays/objects: the filter/map toolkit from earlier lessons applies directly. Real code would call fetch("/api/products") in place of the mock.'},
   {t:'Advanced: parallel requests with Promise.all',code:`function fakeFetch(url) {
  const data = {
    "/api/a": { value: 10 },
    "/api/b": { value: 32 },
    "/api/c": { value: 100 },
  };
  const body = data[url];
  return Promise.resolve({
    ok: Boolean(body),
    status: body ? 200 : 404,
    json: async () => body,
  });
}
async function getValue(fetchFn, url) {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
  const body = await res.json();
  return body.value;
}
(async () => {
  const values = await Promise.all([
    getValue(fakeFetch, "/api/a"),
    getValue(fakeFetch, "/api/b"),
    getValue(fakeFetch, "/api/c"),
  ]);
  console.log("sum=" + values.reduce((s, v) => s + v, 0));
})();`,out:`sum=142`,why:'All three getValue calls start immediately (fetch promises created up front), so total time approximates the slowest single request rather than the sum. Result order matches the input array order regardless of completion order.'}
  ],
  walk:[[6,'fakeFetch mirrors the browser contract by returning a promise of a Response-shaped object with ok/status/json.', 'transport simulated'],[14,'await unwraps the Response; the manual !res.ok gate converts HTTP-level failure into a thrown Error.','status checked'],[15,'res.json() returns a second promise; returning it lets async machinery unwrap the parsed body for the caller.','body parsed'],[19,'Caller-side success reads plain properties (user.name) — all async ceremony cost paid inside loadUser.','clean call sites']],
  walkWhy:'Separating transport from handling (“inject the fetch function”) is a genuine professional technique: identical logic runs against real APIs in production and deterministic mocks in tests/offline sandboxes.',
  rules:['fetch rejects ONLY on network failure/abort; HTTP 4xx/5xx resolve — res.ok checks are mandatory.','A Response body can be consumed once; a second .json()/.text() on it throws TypeError.','Sequential awaits of independent calls waste wall-clock; batch with Promise.all (fail-fast) or allSettled (collect all outcomes).','POST requests need method, headers (Content-Type: application/json) and JSON.stringify(body) — fetch does not serialize for you.'],
  mistakes:[
   {t:'Treating a 404 body as data (missing ok check)',bad:'const res = await fetch("/api/user/99");\nconst user = await res.json();\nshow(user.name);  // user is {error: ...} -> shows undefined',why:'Because fetch resolved, no exception interrupted flow; error payloads slide into rendering code and surface as undefined fields far away from the cause.',fix:'if (!res.ok) throw new Error("HTTP " + res.status);\nconst user = await res.json();',tip:'Write the ok-guard as the line immediately after every await fetch — muscle memory prevents the whole class of bug.'},
   {t:'Serialising independent requests by habit',bad:'const a = await getValue("/api/a");  // 300ms\nconst b = await getValue("/api/b");  // +300ms = 600ms total',why:'Each await parks until its request fully completes, even though b needed nothing from a. Dashboards with 6 widgets become 6x slower for no reason.',fix:'const [a, b] = await Promise.all([getValue("/api/a"), getValue("/api/b")]);  // ~300ms',tip:'Rule: await in sequence only when the next URL/input DEPENDS on the previous result.'}
  ],
  cmp:['fetch failure modes',['Situation','fetch promise','Your detection'],[['200 OK + JSON','Resolves with Response ok=true','Parse body normally'],['404/500','Resolves with Response ok=false','if (!res.ok) throw — Manual!'],['Network down/DNS','Rejects (TypeError)','try/catch around await'],['Invalid JSON body','res.json() rejects (SyntaxError)','Catch around body parsing']]],
  diag:{kind:'event'},
  apps:['Loading product/user lists from REST APIs into UI state.','Submitting forms via POST + JSON.stringify bodies.','Dashboards fanning out parallel widget requests with Promise.all.'],
  quizzes:[{q:'A GET returns status 500. What does await fetch(url) do?',options:['Rejects with HTTP 500','Resolves with a Response where ok === false','Throws SyntaxError','Retries automatically'],correct:1,why:'HTTP error statuses are successful transports to fetch; ok/status inspection is the caller\'s duty.'},
            {q:'Why does code do const data = await (await fetch(url)).json() effectively twice-awaited?',options:['Style only','First await gets the Response (headers); second reads/parses the streamed body','JSON needs two passes','fetch is broken'],correct:1,why:'Headers and body are separate stages; the body arrives as a stream consumed by .json().'}],
  take:['Two stages: await fetch -> check res.ok -> await res.json().','HTTP errors do not reject; network failures do.','Promise.all parallelises independent loads and preserves order.'],
  rev:'res = await fetch(u); if(!res.ok) throw; data = await res.json(). Body readable once. Parallel: Promise.all([...]). POST needs stringify+headers.',
  assign:{p:'Using a fakeFetch that returns {ok:true,status:200,json:async()=>({city:"Vadodara", temp:31})} write getTemp(fetchFn) with the ok-check and print "Vadodara: 31C".',s:`function fakeFetch(url) {
  // TODO inside getTemp: await, ok-check, json, format
}
async function getTemp(fetchFn) {}
(async () => { console.log(await getTemp(fakeFetch)); })();`,sol:`function fakeFetch(url) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ city: "Vadodara", temp: 31 }),
  });
}
async function getTemp(fetchFn) {
  const res = await fetchFn("/api/weather");
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  return data.city + ": " + data.temp + "C";
}
(async () => {
  console.log(await getTemp(fakeFetch));
})();`}
},
{
  id:'js-dom-basics', course_id:'javascript', unit_id:'js-unit-2', order_index:1,
  title:'DOM Basics: Selecting & Manipulating Elements', desc:'Find elements with querySelector, change text/styles/classes, and create new nodes. Browser-only: study examples (not sandbox-runnable).',
  obj:['Select elements with querySelector/querySelectorAll and CSS selectors','Read/change textContent, attributes, classes and inline styles','Create, append and remove elements programmatically'],
  pre:['Objects & arrays','Functions'],
  outcomes:['Learner can script simple page updates without a framework'],
  def:'The Document Object Model (DOM) is the browser\'s live tree representation of the page; document.querySelector(All) finds nodes by CSS selector, and properties like textContent, classList and style mutate the rendered page. DOM APIs exist BROWSERSIDE only — they do not run in Node/sandboxes without a DOM implementation.',
  simple:'When a browser loads HTML it builds a family tree of objects — the DOM — and hands JavaScript the keys via `document`. querySelector("#title") grabs the first matching element using the same selector language as CSS; from there you can rewrite its text (textContent), flip classes on/off (classList.add/remove/toggle), adjust inline styles, or even manufacture brand-new elements and plug them into the tree. Every change repaints instantly with no page reload — this is the foundation under every interactive page and every framework. These APIs live only in browsers: study the examples here and try them in devtools, since this course sandbox (Node) has no document.',
  hing:'Browser HTML ko ek live tree (DOM) bana deta hai, aur JavaScript `document` se use badal sakta hai. document.querySelector("#title") CSS wale selector se element pakadta hai; phir textContent se text badlo, classList.add("active") se class lagao, style se rang badlo — sab bina page reload ke turant dikhta hai! Naye elements banane ke liye document.createElement aur appendChild hai. Sabse zaroori suchna: DOM sirf browser me hota hai — is sandbox (Node) me ye code nahi chalega, isliye ye lesson `reviewed` hai, `tested` nahi. In examples ko browser console me khud chala kar zaroor dekho. Ek suraksha note: user ke text ko textContent se daalo, innerHTML se nahi, warna XSS hamla ho sakta hai.',
  why:'The DOM is the original and still-fundamental browser programming interface: form validation, dynamic lists, theme toggles, and every framework ultimately compiles down to these operations. Console-level DOM fluency is also the fastest debugging skill for front-end work.',
  when:'Vanilla DOM fits small enhancements and learning fundamentals; frameworks (React/Vue) take over when UI state grows complex. Prefer textContent for user text (XSS-safe) and classList/style thoughtfully over rewriting whole innerHTML blobs.',
  syntax:'const el = document.querySelector("#title");\nel.textContent = "New heading";\nel.classList.add("active");\nconst li = document.createElement("li");\nli.textContent = "Item";\ndocument.querySelector("ul").appendChild(li);',
  comp:[['querySelector / All','First match / static NodeList of all matches for a CSS selector'],['textContent vs innerHTML','Plain text (safe) vs parsed HTML (power + XSS risk)'],['classList','add/remove/toggle/contains for class-driven styling']],
  ex:[
   {t:'Study (browser): selecting and rewriting content',code:`<!-- Given: <h1 id="title">Old news</h1> -->
<script>
  const title = document.querySelector("#title");
  console.log(title.textContent);
  title.textContent = "Fresh headline";
  title.style.color = "teal";
  title.classList.add("breaking");
  console.log(title.className);
</script>`,out:`Console: Old news
The h1 now reads "Fresh headline", shown teal and carrying class "breaking".
Console: breaking`,why:'Selection, text replacement, inline style and class addition happen immediately in the live tree. Browser-only example: paste the script into any page (or devtools on a demo page with that h1) to observe it.'},
   {t:'Study (browser): building a list from data',code:`<!-- Given: <ul id="scores"></ul> -->
<script>
  const scores = [["Diya", 92], ["Kabir", 78]];
  const list = document.querySelector("#scores");
  for (const [name, marks] of scores) {
    const li = document.createElement("li");
    li.textContent = name + ": " + marks;
    if (marks >= 90) li.classList.add("top");
    list.appendChild(li);
  }
  console.log(list.children.length);
</script>`,out:`Console: 2
Page list shows:
• Diya: 92   (styled via .top)
• Kabir: 78`,why:'createElement + textContent + appendChild renders data without string-built HTML, so names containing characters like < are displayed literally and safely. This is the manual pattern frameworks later automate.'},
   {t:'Study (browser): querySelectorAll and batch updates',code:`<!-- Given: three <p class="note"> items -->
<script>
  const notes = document.querySelectorAll(".note");
  console.log(notes.length);
  notes.forEach((el, i) => {
    el.textContent = "Note " + (i + 1) + ": " + el.textContent;
    el.dataset.index = i;
  });
  document.querySelector(".note").remove();
  console.log(document.querySelectorAll(".note").length);
</script>`,out:`Console: 3
Notes are renumbered in place; after removing the first .note element,
Console: 2`,why:'querySelectorAll returns a static NodeList supporting forEach; dataset writes data-* attributes. remove() detaches a node. NodeLists are array-LIKE: convert with [...notes] for map/filter.'}
  ],
  walk:[[3,'querySelector walks the parsed tree and returns the single h1#title element object (or null if absent — guard for that in real code).','element handle obtained'],[5,'Assigning textContent replaces ALL child text in one safe operation; the browser repaints immediately.','visible text changed'],[6,'style.color writes an inline style property (camelCase for CSS names).','teal applied'],[7,'classList.add appends the class token, letting stylesheet rules (.breaking) take effect without string surgery.','class attached']],
  walkWhy:'Every step is a live tree mutation visible on screen at once — no reload, no compilation — which is why interactive pages feel instantaneous, and why runaway mutations (layout thrash) are a performance topic.',
  rules:['querySelector returns null when nothing matches; touching properties on null throws — verify presence.','textContent is XSS-safe; innerHTML parses markup — never feed untrusted strings to innerHTML.','classList mutations are preferred over overwriting className wholesale (which nukes other classes).','Scripts should run after the DOM exists (end of body, defer, or DOMContentLoaded) or selections come back empty.'],
  mistakes:[
   {t:'Selecting before the element exists',bad:'<head><script>\n  document.querySelector("#btn").textContent = "Go";  // null!\n</script></head>\n<body><button id="btn">..</button>',err:"TypeError: Cannot set properties of null (setting 'textContent')",why:'The parser executes the head script before it has built the body, so #btn is unmatched and querySelector dutifully returns null. The failure looks like a code bug when it is pure timing.',fix:'<script defer src="app.js"></script>\n<!-- or place scripts at the end of body /\n     wrap in document.addEventListener("DOMContentLoaded", ...) -->',tip:'defer on external scripts is the modern default answer; verify with a console.log of the selection when in doubt.'},
   {t:'Using innerHTML with user text (XSS)',bad:'commentEl.innerHTML = userComment;\n// userComment = "<img src=x onerror=alert(1)>" -> script executes!',why:'innerHTML parses what it is given as real markup, so attacker-supplied tags/handlers become live page code running with the victim\'s session — cross-site scripting.',fix:'commentEl.textContent = userComment;  // rendered as inert text',tip:'innerHTML only for trusted, developer-authored markup; user data goes through textContent or sanitised templates.'}
  ],
  cmp:['textContent vs innerHTML',['Aspect','textContent','innerHTML'],[['Interprets tags','No — prints literally','Yes — builds elements'],['XSS safety with user data','Safe','Dangerous'],['Reading','All descendant text concatenated','Serialized markup'],['Typical use','Labels, values, user text','Trusted static templates (sparingly)']]],
  diag:{kind:'flow',start:'HTML parsed into DOM tree',condition:'Selector matches?',trueAction:'Mutate text/classes/styles live',falseAction:'null — check timing (defer) & selector',end:'Browser repaints the change'},
  apps:['Live form validation messages under fields as users type.','Theme toggles flipping a .dark class on <html>.','Rendering API JSON into lists/tables without a framework.'],
  quizzes:[{q:'querySelector("#missing") when no such element exists returns…',options:['Empty element','null','Throws immediately','undefined array'],correct:1,why:'No match yields null (querySelectorAll yields an empty NodeList); property access on the null is what throws.'},
            {q:'Why prefer textContent for displaying a username?',options:['It is faster to type','It renders the value as inert text, preventing injected markup from executing','innerHTML cannot show names','textContent styles automatically'],correct:1,why:'textContent never parses markup, neutralising XSS payloads hiding in user-controlled strings.'}],
  take:['document is browser-only: this topic is reviewed, practised via devtools, not sandbox-run.','Select with CSS selectors; null-check; defer scripts so the DOM exists first.','textContent for data, classList for styling state, createElement for new nodes.'],
  rev:'querySelector(#id/.class/tag); null when absent. textContent safe, innerHTML parses (XSS!). classList.add/toggle. createElement + appendChild. Run scripts after DOM (defer).',
  assign:{p:'(Study) On a page containing <p id="msg">draft</p>, write browser code: select #msg, set text to "published", add class "live", create a <span> with text " (v2)" and append it inside #msg.',s:`<!-- Write browser JS for a page that has <p id="msg">draft</p> -->`,sol:`const msg = document.querySelector("#msg");
if (msg) {
  msg.textContent = "published";
  msg.classList.add("live");
  const badge = document.createElement("span");
  badge.textContent = " (v2)";
  msg.appendChild(badge);
}`}
},
{
  id:'js-events-delegation', course_id:'javascript', unit_id:'js-unit-2', order_index:2,
  title:'Events & Event Delegation', desc:'React to clicks/keys/submits with addEventListener, the event object, bubbling and delegation. Browser-only: study examples.',
  obj:['Register handlers with addEventListener and inspect the event object','Explain bubbling, preventDefault and stopPropagation','Use one delegated parent listener for dynamic child elements'],
  pre:['DOM basics','Functions & closures'],
  outcomes:['Learner wires interactive behaviour to pages efficiently'],
  def:'Events are browser-generated objects describing user/system actions (click, keydown, submit, input). addEventListener(type, handler) registers callbacks; events propagate (capture → target → bubble up ancestors), enabling delegation: a single ancestor listener handling events for current and future descendants via event.target.',
  simple:'Events are the page\'s doorbells: the browser rings one object describing what happened (a click at these coordinates on that button) and delivers it to any listeners you registered. addEventListener("click", fn) is the subscription. The clever physics: after reaching the deepest clicked element, the event BUBBLES back up through its ancestors — so a whole list needs just one listener on the <ul> that inspects event.target to learn which <li> was clicked. That delegation trick also future-proofs lists whose items are added later. preventDefault() stops native behaviour (form reloads, link navigation) when your code wants to take over. All browser-side: practise in devtools.',
  hing:'Event matlab browser ka signal — click hua, key dabayi, form bhara. addEventListener("click", handler) se aap hukum dete ho ki jab ye ho to mera ye function chalao. event object me poori jaankari hoti hai: event.target (kis par hua), key (kaunsi key) wagera. Sabse kaam ki cheez hai bubbling: event sabse andar wale element se shuru hokar upar parents tak yatra karta hai. Isiliye pure <ul> par EK listener lagakar har <li> ke click sambhal sakte ho — ise event delegation kehte hain, aur baad me jude naye items par bhi ye apne aap chalta hai! Form submit par page reload rokne ke liye event.preventDefault() mat bhoolna. Aur yaad rahe, ye sab sirf browser me chalta hai.',
  why:'Interactivity IS events: buttons, forms, keyboards, drag-and-drop, infinite scroll. Delegation keeps listener counts O(1) for large/dynamic lists and underpins framework event systems (React attaches at the root). preventDefault misuse causes the classic "my form keeps reloading" bug.',
  when:'Use addEventListener over inline onclick attributes (separation, multiple handlers). Delegate when children are many/dynamic; direct listeners for singular static controls. Remove listeners (removeEventListener) for one-shot/teardown in component-like code.',
  syntax:'btn.addEventListener("click", (event) => {\n  console.log(event.type, event.target.id);\n});\nform.addEventListener("submit", (e) => { e.preventDefault(); });\nlist.addEventListener("click", (e) => {\n  const item = e.target.closest("li");\n});',
  comp:[['event.target vs currentTarget','Deepest originating node vs the node whose listener runs'],['Bubbling','Target→ancestors propagation enabling delegation'],['preventDefault()','Cancels the browser\'s default action for the event']],
  ex:[
   {t:'Study (browser): click handling and the event object',code:`<!-- Given: <button id="save">Save</button> <span id="count">0</span> -->
<script>
  let saves = 0;
  const btn = document.querySelector("#save");
  const out = document.querySelector("#count");
  btn.addEventListener("click", (event) => {
    saves += 1;
    out.textContent = saves;
    console.log(event.type + " on #" + event.target.id);
  });
</script>`,out:`First click -> span shows 1, Console: click on #save
Each further click increments the displayed count.
(Requires a user clicking in a real browser.)`,why:'The handler closure remembers `saves` and the output span, updating the DOM per click. event.target is the clicked button, event.type the string "click".'},
   {t:'Study (browser): form submit without reload',code:`<!-- Given: <form id="login"><input id="user"><button>Go</button></form>
     and <p id="msg"></p> -->
<script>
  const form = document.querySelector("#login");
  const msg = document.querySelector("#msg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.querySelector("#user").value.trim();
    msg.textContent = name ? "Welcome, " + name : "Name required";
  });
</script>`,out:`Submitting with "Diya" shows "Welcome, Diya" WITHOUT reloading the page.
Empty input shows "Name required".`,why:'preventDefault() suppresses the browser\'s native form submission (navigation/reload) so JS validation owns the flow. Reading .value at submit time gets the current field text.'},
   {t:'Study (browser): delegation for a dynamic list',code:`<!-- Given: <ul id="tasks"><li>Read notes</li><li>Revise</li></ul>
     plus a button #add that appends <li>New task</li> -->
<script>
  const list = document.querySelector("#tasks");
  list.addEventListener("click", (e) => {
    const item = e.target.closest("li");
    if (!item) return;
    item.classList.toggle("done");
    console.log("toggled:", item.textContent);
  });
  document.querySelector("#add").addEventListener("click", () => {
    const li = document.createElement("li");
    li.textContent = "New task";
    list.appendChild(li);
  });
</script>`,out:`Clicking any listed item toggles its .done class and logs it.
Items added AFTER setup also toggle — no extra wiring needed.`,why:'One parent listener serves all present and future children because clicks bubble to the <ul>; closest("li") maps clicks on inner text/nested nodes back to the row. Per-item listeners would miss dynamically-added items entirely.'}
  ],
  walk:[[6,'User clicks the button: the browser constructs a click event and dispatches it to the button (target phase).','event created'],[7,'The handler runs with its closure state: saves increments from its remembered value.','state updated'],[8,'Writing textContent repaints the counter; event.target.id identifies the source in the log.','UI synced'],[10,'With no stopPropagation, the event keeps bubbling to ancestors after this handler (harmless here, useful for delegation).','bubbles onward']],
  walkWhy:'Registration, dispatch, bubbling and DOM write-back form one loop; frameworks synthetically replicate this with a root listener, which is literally industrialised delegation.',
  rules:['Handlers added with addEventListener for the same type/target/phase all run in registration order; inline onclick allows only one and mixes concerns.','preventDefault stops the default ACTION, not propagation; stopPropagation stops travel, not the default — know which you need.','Event delegation via closest() requires guarding for clicks outside matching children (if (!item) return).','removeEventListener needs the SAME function reference — anonymous inline handlers cannot be removed later.'],
  mistakes:[
   {t:'Registering the RESULT of calling the handler',bad:'btn.addEventListener("click", handleClick());  // runs NOW, registers undefined',why:'handleClick() executes during setup and its return value (probably undefined) becomes the listener; clicks afterwards do nothing while the side effect already fired once mysteriously.',fix:'btn.addEventListener("click", handleClick);\n// need arguments? wrap: btn.addEventListener("click", () => handleClick(id));',tip:'Listeners are function VALUES. Parentheses at registration time are the red flag to grep for.'},
   {t:'Forgetting preventDefault on a JS-handled form',bad:'form.addEventListener("submit", (e) => {\n  showMessage("Saved!");   // flash... then page reloads, message gone\n});',why:'Without prevention the browser navigates/submits natively right after your handler, discarding DOM updates and in-memory state.',fix:'form.addEventListener("submit", (e) => {\n  e.preventDefault();\n  showMessage("Saved!");\n});',tip:'Any submit/anchor logic owned by JS starts its handler with preventDefault() — first line, every time.'}
  ],
  cmp:['Direct listeners vs delegation',['Aspect','Listener per element','One delegated parent listener'],[['Dynamic children','Missed unless re-wired','Handled automatically'],['Listener count','Grows with items','Constant'],['Event inspection','Direct this/target','e.target + closest() mapping'],['Best for','Static singleton controls','Lists, tables, dynamic UIs']]],
  diag:{kind:'flow',start:'User acts (click/submit)',condition:'Default action desired?',falseAction:'e.preventDefault() in handler',trueAction:'Let browser proceed after handlers',end:'Event bubbles to delegated ancestors'},
  apps:['Todo/cart lists toggling and removing rows via one container listener.','Live search inputs reacting to input/keydown events.','Modal and menu systems: backdrop clicks, Escape-key handling.'],
  quizzes:[{q:'Why does delegation work for elements added after the listener was registered?',options:['New elements inherit listeners','Events bubble from the child to the pre-existing parent listener','Browsers rescan hourly','cloneNode copies handlers'],correct:1,why:'Propagation depends only on the ancestor chain at event time; the parent was already listening when the child appeared.'},
            {q:'addEventListener("click", save()) is wrong because…',options:['save is undefined','It CALLS save immediately and registers its return value instead of the function','click needs capture','Only arrows are allowed'],correct:1,why:'Registration expects a function reference; accidental invocation passes its (likely undefined) result.'}],
  take:['Browser-only topic (reviewed): practise handlers in devtools.','Register function references, never call results; preventDefault first for owned submits.','Bubbling + closest() = delegation: one resilient listener for dynamic lists.'],
  rev:'el.addEventListener(type, fn). e.target origin, e.currentTarget listener owner. preventDefault≠stopPropagation. Delegate on parent with closest().',
  assign:{p:'(Study) For a page with <ul id="menu"> containing <li data-page="home">Home</li> and <li data-page="about">About</li>, add ONE delegated click listener on #menu that logs "go to " + the clicked li\'s data-page, ignoring clicks outside li elements.',s:`<!-- Write browser JS: one delegated listener on #menu -->`,sol:`const menu = document.querySelector("#menu");
if (menu) {
  menu.addEventListener("click", (event) => {
    const item = event.target.closest("li");
    if (!item) return;
    console.log("go to " + item.dataset.page);
  });
}`}
},
{
  id:'js-browser-storage-json', course_id:'javascript', unit_id:'js-unit-2', order_index:3,
  title:'Browser Storage & JSON: localStorage Patterns', desc:'Persist small state as JSON strings with get/set/remove and safe parse fallbacks.',
  obj:['Serialise values with JSON.stringify/parse for storage','Save, load and remove localStorage keys with fallbacks','Contrast storage limits/types (strings only) and security cautions'],
  pre:['Error handling (JSON.parse)','Objects'],
  outcomes:['Learner persists UI preferences/records across page reloads safely'],
  def:'Web Storage (localStorage/sessionStorage) is a synchronous, per-origin key–value store holding STRINGS only (about 5 MB). Objects persist by JSON.stringify on save and JSON.parse on load, which must be guarded for absence (null) and corruption (SyntaxError).',
  simple:'localStorage is the browser\'s long-term sticky note for your site: small strings saved today survive reloads and browser restarts, unlike ordinary variables that vanish. The catch: it stores STRINGS ONLY. Feeding it an object raw saves the useless text "[object Object]" — you must convert with JSON.stringify on the way in and JSON.parse on the way out. Loading needs a safety net because the key may be absent on first visit (getItem returns null) or the stored text may be damaged (parse throws) — always supply a fallback value. This lesson runs a spec-faithful in-memory shim so the exact same call sequence executes here; in a browser the genuine localStorage object swaps in unchanged.',
  hing:'localStorage browser ki ek chhoti si permanent diary hai — jo likha wah hai page reload ke baad bhi milta hai. Lakin ek badi shart: sirf STRINGS save hoti hain! Object ko waise ka waisa de diya to badsurat "[object Object]" save hoga. Isiliye jaate waqt JSON.stringify aur lauta waqt JSON.parse — ye jodi kabhi mat bhoolna. Pehli baar me key milegi hi nahi (null aayega) aur data corrupt ho to parse error throw karega, isliye try/catch ke saath default value hamesha rakho. dhyaan rahe: password/token jaisi secret cheezein yahan kabhi mat rakho — koi bhi script is origin par unhe padh sakta hai. Is lesson me hum ek chhota shim (naqli localStorage) chala rahe hain taaki code yahi run ho sake; browser me asli wala hota hai.',
  why:'Theme preferences, draft text, cart snapshots and offline caches all lean on Web Storage. The stringify-then-parse contract and null/corrupt fallbacks separate code that survives first visits and bad data from code that crashes on them.',
  when:'Use localStorage for small, non-sensitive, JSON-shaped state; sessionStorage for per-tab lifetime; IndexedDB for large/structured offline data; cookies only when the SERVER must read the value. Never store credentials or auth tokens meant to be secret from scripts.',
  syntax:'localStorage.setItem("prefs", JSON.stringify({ theme: "dark" }));\nconst raw = localStorage.getItem("prefs");        // string | null\nconst prefs = raw ? JSON.parse(raw) : { theme: "light" };\nlocalStorage.removeItem("prefs");',
  comp:[['getItem → string|null','Absence returns null, distinguishable from stored "null"'],['JSON round-trip','stringify on write, parse on read; functions/undefined do not survive'],['removeItem/clear','Delete one key / wipe the origin\'s whole store']],
  ex:[
   {t:'Basic: the shimmed store — same API shape as the browser',code:`// In-memory stand-in so this runs in Node: identical call signatures to window.localStorage
const localStorage = {
  _data: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._data, k) ? this._data[k] : null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
};
localStorage.setItem("theme", "dark");
console.log(localStorage.getItem("theme"));
console.log(localStorage.getItem("missing"));
localStorage.removeItem("theme");
console.log(localStorage.getItem("theme"));`,out:`dark
null
null`,why:'The shim preserves the two essential behaviours: values are coerced to strings on set, and absent keys return null (not undefined). In a browser the same three calls hit durable per-origin storage instead of a Map-like object.'},
   {t:'Intermediate: object persistence with JSON + fallback loading',code:`const store = {
  _data: {},
  getItem(k) { return k in this._data ? this._data[k] : null; },
  setItem(k, v) { this._data[k] = String(v); },
};
function savePrefs(storage, prefs) {
  storage.setItem("prefs", JSON.stringify(prefs));
}
function loadPrefs(storage) {
  const fallback = { theme: "light", fontSize: 14 };
  const raw = storage.getItem("prefs");
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
console.log(loadPrefs(store));
savePrefs(store, { theme: "dark", fontSize: 16 });
console.log(loadPrefs(store));
store.setItem("prefs", "{corrupt");
console.log(loadPrefs(store));`,out:`{ theme: 'light', fontSize: 14 }
{ theme: 'dark', fontSize: 16 }
{ theme: 'light', fontSize: 14 }`,why:'First visit (null) and corrupted data (SyntaxError swallowed to fallback) are handled identically by returning defaults, while a valid save round-trips through JSON exactly. This loadPrefs shape is what resilient browser code looks like.'},
   {t:'Advanced: string-only storage traps made visible',code:`const store = {
  _data: {},
  getItem(k) { return k in this._data ? this._data[k] : null; },
  setItem(k, v) { this._data[k] = String(v); },
};
store.setItem("cart", { items: 3 });
console.log(store.getItem("cart"));
store.setItem("cart", JSON.stringify({ items: 3 }));
const loaded = JSON.parse(store.getItem("cart"));
console.log(loaded.items + 1);
const original = { when: new Date(0), greet() { return "hi"; }, missing: undefined };
console.log(JSON.stringify(original));`,out:`[object Object]
4
{"when":"1970-01-01T00:00:00.000Z"}`,why:'Storing a raw object coerces it to "[object Object]" — irrecoverable. JSON round-trips data but DROPS functions and undefined properties and turns Dates into strings: storage format limits must shape what you choose to persist.'}
  ],
  walk:[[8,'setItem coerces "dark" (already a string) into the store under key "theme".','stored string'],[9,'getItem returns the saved string exactly.', 'dark'],[10,'A never-saved key returns null — the signal first-visit code must handle before JSON.parse.','null (absent)'],[11,'removeItem deletes the key entirely; a subsequent read again yields null, indistinguishable from never-saved.','back to first-visit state']],
  walkWhy:'The browser implementation differs only in durability (disk, per origin, ~5MB quota with QuotaExceededError) — call semantics, null-absence and string coercion are identical to the shim you just traced.',
  rules:['Storage values are strings: always JSON.stringify non-string data on the way in.','Guard loads: key absent => null; malformed JSON => JSON.parse throws — supply defaults on both paths.','JSON persistence loses functions, undefined, symbols, and revives Dates as strings — rehydrate deliberately if needed.','Treat stored data as untrusted input (users/devtools/other scripts can edit it) and never persist secrets/tokens there.'],
  mistakes:[
   {t:'Saving objects without stringify',bad:'localStorage.setItem("user", { name: "Diya" });\n// later: localStorage.getItem("user") -> "[object Object]"',why:'setItem stringifies via String(value), whose object rendering discards all fields. The save "worked" with no error, so the bug manifests only at load time as unrecoverable junk.',fix:'localStorage.setItem("user", JSON.stringify({ name: "Diya" }));\nconst user = JSON.parse(localStorage.getItem("user"));',tip:'Pair rule: every setItem of data pairs with stringify, every later getItem with parse + fallback.'},
   {t:'Parsing without the null check on first visit',bad:'const prefs = JSON.parse(localStorage.getItem("prefs"));  // first visit: parses null -> null\napplyTheme(prefs.theme);   // TypeError on null',err:"TypeError: Cannot read properties of null (reading 'theme')",why:'JSON.parse(null) dutifully returns null (it coerces input to "null"), moving the crash one line later. New users — precisely the audience you most want working — hit it first.',fix:'const raw = localStorage.getItem("prefs");\nconst prefs = raw ? safeParse(raw) : { theme: "light" };',tip:'Defaults-first loading: fallback constant, then upgrade only when stored data parses cleanly.'}
  ],
  cmp:['Web storage choices',['Store','Lifetime','Server sees it?'],[['localStorage','Until cleared (per origin)','No'],['sessionStorage','Tab session only','No'],['Cookie','Set expiry, tiny (~4KB)','Yes (sent per request)'],['Variables/State','Page lifetime','No']]],
  diag:{kind:'flow',start:'Persist small state',condition:'Sensitive or large?',trueAction:'Not localStorage (server/IndexedDB)',falseAction:'JSON.stringify -> setItem; guarded parse on load',end:'Survives reloads per origin'},
  apps:['Dark-mode and language preferences remembered across visits.','Draft form text restored after accidental refreshes.','Mini-cart snapshots synced to the server later (server remains source of truth).'],
  quizzes:[{q:'localStorage.setItem("n", 42) followed by getItem("n") returns…',options:['42 (number)','"42" (string)','null','Error'],correct:1,why:'Storage coerces everything to strings on write; numeric use requires Number()/JSON on read.'},
            {q:'On a first-ever visit, getItem("prefs") returns…',options:['""','undefined','null','"{}"'],correct:2,why:'Absence is signalled by null — the branch your fallback logic must handle.'}],
  take:['Strings only: stringify in, parse out, never raw objects.','Load defensively: null or corrupt => defaults.','Small non-sensitive state only; storage is script-readable on the origin.'],
  rev:'setItem(k, JSON.stringify(v)); raw=getItem(k) (null if absent); guarded JSON.parse(raw) with fallback. removeItem deletes. No secrets, ~5MB, per-origin.',
  assign:{p:'Using the same tiny shim style, write saveScore(storage, name, score) storing JSON {name, score} under key "best", and loadBest(storage) returning the object or {name:"none", score:0}. Print loadBest on empty storage, then after saveScore(..., "Diya", 92).',s:`const store = {
  _data: {},
  getItem(k) { return k in this._data ? this._data[k] : null; },
  setItem(k, v) { this._data[k] = String(v); },
};
// TODO: saveScore/loadBest + two prints`,sol:`const store = {
  _data: {},
  getItem(k) { return k in this._data ? this._data[k] : null; },
  setItem(k, v) { this._data[k] = String(v); },
};
function saveScore(storage, name, score) {
  storage.setItem("best", JSON.stringify({ name, score }));
}
function loadBest(storage) {
  const raw = storage.getItem("best");
  if (raw === null) return { name: "none", score: 0 };
  try {
    return JSON.parse(raw);
  } catch {
    return { name: "none", score: 0 };
  }
}
console.log(loadBest(store));
saveScore(store, "Diya", 92);
console.log(loadBest(store));`}
},
];

module.exports = { topics: makeTopics(specs) };
