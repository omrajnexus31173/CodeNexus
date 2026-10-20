'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'py-operators-expressions', course_id:'python', unit_id:'py-unit-1', order_index:2,
  title:'Operators & Expressions: Arithmetic, Comparison and Precedence', desc:'Master /, //, %, **, comparisons, membership and precedence rules that decide how expressions evaluate.',
  obj:['Distinguish /, //, % and ** including negative-number behaviour','Use comparison, logical and membership operators correctly','Predict evaluation order using precedence and parentheses'],
  pre:['Variables & data types','Numbers and booleans'],
  outcomes:['Learner can evaluate mixed expressions by hand and write unambiguous conditions'],
  def:'An operator is a symbol that computes a value from one or more operands. Python groups operators into arithmetic (+ - * / // % **), comparison (== != < <= > >=), logical (and or not), membership (in, not in) and others, each with a defined precedence that determines evaluation order when parentheses are absent.',
  simple:'Python has a few division operators that confuse everyone: / always gives a float (7/2 = 3.5), // gives the whole-number part ("floor" division), and % gives the remainder. The ** operator is power, like 2**10. When several operators appear together, Python follows a priority list similar to school maths (BODMAS): powers first, then multiply/divide, then add/subtract, then comparisons. You can always use brackets to force your own order — good programmers do this whenever the order could confuse a reader. A special Python gift: comparisons chain, so 1 < x < 10 works exactly like maths.',
  hing:'Python me division ke teen roop hain: / hamesha float deta hai (7/2 = 3.5), // floor division matlab neeche wala pura number, aur % remainder (bacha hua hissa). ** power ke liye hai, jaise 2**3 = 8. Jab kai operators ek saath hon, Python BODMAS jaisi priority list follow karta hai — pehle power, phir *, /, phir +, -. Confusion ho to brackets laga do, ye sabse safe hai. Ek khaas baat: Python me 1 < x < 10 jaisi chained comparison chalti hai, bilkul maths ki tarah. Aur dhyan rahe, negative numbers par // hamesha neeche ki taraf round karta hai, zero ki taraf nahi!',
  why:'Expressions are the atoms of every program — totals, conditions, index maths. Misunderstanding // vs / or precedence produces bugs that return wrong answers silently, the hardest kind to catch.',
  when:'Use / for true division, // when you need whole groups (pages, buckets), % for remainders/cycles (every 3rd item, clock arithmetic), and parentheses whenever precedence is not screamingly obvious.',
  syntax:'a / b    # true division -> float\na // b   # floor division\na % b    # remainder (sign follows divisor)\na ** b   # power\n1 < x <= 10   # chained comparison\nx in collection  # membership test',
  comp:[['//','Floor division: rounds toward negative infinity'],['%','Remainder consistent with //: a == (a//b)*b + a%b'],['Precedence','** > (* / // %) > (+ -) > comparisons > not > and > or']],
  ex:[
   {t:'Basic: the three divisions side by side',code:`print(7 / 2)
print(7 // 2)
print(7 % 2)
print(-7 // 2)
print(-7 % 2)
print(2 ** 10)`,out:`3.5
3
1
-4
1
1024`,why:'-7 // 2 is -4 (not -3) because floor division rounds DOWN toward negative infinity, and the remainder adjusts so the identity a == (a//b)*b + a%b always holds: -4*2 + 1 = -7.'},
   {t:'Intermediate: precedence decides the answer',code:`print(2 + 3 * 4)
print((2 + 3) * 4)
print(2 ** 3 ** 2)
print(10 - 4 - 3)
print(not True or True)`,out:`14
20
512
3
True`,why:'* binds tighter than +, giving 14 before parentheses force 20. ** is right-associative: 2**(3**2) = 2**9 = 512. Subtraction is left-associative: (10-4)-3 = 3. not applies before or.'},
   {t:'Advanced: chained comparisons, membership and short-circuit',code:`marks = 72
print(60 <= marks < 90)
print('a' in 'banana')
print(5 in [1, 2, 3])
name = ''
print(name or 'Guest')
print(0 and 99)`,out:`True
True
False
Guest
0`,why:'Chained comparison reads like maths. in works for strings and lists alike. or returns the first truthy operand (empty string is falsy, so Guest wins); and returns the first falsy operand — these return values, not just booleans.'}
  ],
  walk:[[1,'True division always floats: 7/2 = 3.5.','3.5'],[2,'Floor division discards toward negative infinity: 3.','3'],[4,'For negatives, floor means MORE negative: -3.5 floors to -4.','-4'],[5,'The remainder compensates so (a//b)*b + a%b == a: -4*2 + 1 = -7.','1']],
  walkWhy:'Python chose floor semantics so that % with a positive divisor always gives a result in [0, b) — ideal for cycling through indices and buckets.',
  rules:['/ always returns float for ints; // and % floor toward negative infinity (not toward zero like C/Java).','** is right-associative and binds tighter than unary minus on its left: -2**2 == -(2**2) == -4.','and/or return operand values (short-circuiting), not necessarily True/False.','Comparing across unrelated types (1 < "a") raises TypeError; == across types is simply False.'],
  mistakes:[
   {t:'Expecting C-style truncation for negative division',bad:'print(-7 // 2)   # learner expects -3, Python prints -4',why:'C/Java truncate toward zero; Python floors. Code ported without this awareness mis-buckets negative values.',fix:'import math\nprint(math.trunc(-7 / 2))  # -3 when truncation is really wanted',tip:'Decide which semantics the problem needs; for array cycling, Python % flooring is usually the friendly one.'},
   {t:'Writing = in a condition (or == in an assignment)',bad:'if score = 100:  # SyntaxError\n    print("perfect")',err:'SyntaxError: invalid syntax. Maybe you meant == or := instead of =?',why:'= is assignment, == is comparison. Python helps with a targeted hint in modern versions, but the fix is to keep the two symbols conceptually separate.',fix:'if score == 100:\n    print("perfect")',tip:'Read == aloud as "is equal to" and = as "gets" — the habit prevents the typo.'}
  ],
  cmp:['/ vs // vs %',['Operator','/ (true division)','// and % (floor pair)'],[['7 ? 2','3.5','3 and 1'],['Result type (int operands)','Always float','int when both operands int'],['Negative behaviour','Exact value','Floors toward -infinity'],['Use case','Averages, ratios','Grouping, pages, cycles']]],
  diag:{kind:'flow',start:'Write expression',condition:'Precedence obvious?',trueAction:'Leave compact',falseAction:'Add parentheses to force order',end:'Evaluate left-to-right within a level'},
  apps:['Pagination: total_pages = (items + per_page - 1) // per_page uses floor division for ceiling math.','Time conversion: minutes = seconds // 60; rest = seconds % 60.','Even/odd and cycle checks (every nth row shading) are modulo tests.'],
  quizzes:[{q:'What does print(17 % 5 + 17 // 5) display?',options:['5','6','7','3.4'],correct:0,why:'17 % 5 = 2 and 17 // 5 = 3; 2 + 3 = 5 (%, // share precedence with *, evaluated before +).'},
            {q:'Value of -2 ** 2 in Python?',options:['4','-4','Error','0'],correct:1,why:'** binds tighter than the unary minus on its left, so this is -(2**2) = -4. Use (-2) ** 2 for +4.'}],
  take:['/ floats, // floors (down, even for negatives), % is the matching remainder.','Precedence: ** first, then * / // %, then + -, then comparisons, then not/and/or.','and/or return operand values; comparisons can chain like 1 < x < 10.'],
  rev:'7/2=3.5, 7//2=3, 7%2=1, -7//2=-4. ** right-assoc. Parenthesize when unsure. in tests membership.',
  assign:{p:'A bakery packs 6 muffins per box. For 53 muffins print full boxes and leftover muffins as: boxes=8 leftover=5. Use // and % only (no loops).',s:`muffins = 53
per_box = 6
# TODO: compute boxes and leftover and print in the format boxes=8 leftover=5`,sol:`muffins = 53
per_box = 6
boxes = muffins // per_box
leftover = muffins % per_box
print(f"boxes={boxes} leftover={leftover}")`}
},
{
  id:'py-strings-in-depth', course_id:'python', unit_id:'py-unit-1', order_index:4,
  title:'Strings in Depth: Slicing, Methods & f-strings', desc:'Index and slice text, transform with methods like split/join/replace, and format output with f-strings.',
  obj:['Use indexing and slicing including negative indices and steps','Apply split, join, strip, replace, upper/lower and find correctly','Format values with f-strings including alignment and precision'],
  pre:['Variables & data types','Operators & expressions'],
  outcomes:['Learner can clean, extract and format real-world text data'],
  def:'A Python string is an immutable sequence of Unicode characters. Indexing (s[i]) selects one character, slicing (s[start:stop:step]) produces a new string subsequence, and methods such as split/join/replace return new strings rather than modifying the original.',
  simple:'A string behaves like a row of letter tiles glued to a board: you can look at any tile (s[0] is the first, s[-1] is the last), and you can copy a range of tiles with slicing — s[1:4] takes tiles at positions 1, 2, 3 (the end number is excluded, which feels odd until you realise it makes lengths and empty slices behave neatly). You can even slice backwards with s[::-1] to reverse text. Because strings can\'t be changed in place, methods like .upper() or .replace() hand you a NEW string — you must save it. For output, f-strings let you drop variables and expressions straight into text with formatting like rounding to 2 decimals.',
  hing:'String ko letters ki ek fix line samjho. s[0] pehla letter, s[-1] aakhri. Slicing s[1:4] matlab index 1, 2, 3 wale letters (end wala exclude hota hai). s[::-1] likhte hi ulta string mil jata hai — palindrome check ke liye famous trick! Sabse important: strings immutable hain, matlab badal nahi sakte; .upper(), .replace() jaise methods NAYA string dete hain, use variable me save karna padega warna result kho jayega. Printing ke liye f-string sabse best hai: f"Total: {price:.2f}" value ko 2 decimal ke saath dikhata hai.',
  why:'Text cleaning is half of real data work — names with stray spaces, comma-separated values, log lines, user input. Slicing + methods + f-strings cover 95% of everyday string tasks without regular expressions.',
  when:'Use slicing for positional extraction, split/join for delimiter-based data, strip for user input hygiene, and f-strings for every formatted message. Reach for str methods before writing manual character loops.',
  syntax:'s[i]            # one char (negative counts from end)\ns[start:stop:step]  # slice, stop excluded\ns.split(",")    # list of parts\n",".join(parts) # glue list back to a string\nf"{value:.2f}"  # formatted: 2 decimal places',
  comp:[['Slice [a:b:c]','Start inclusive, stop exclusive, step stride/direction'],['Methods','Return NEW strings; original is untouched (immutability)'],['f-string specs',':.2f rounds float, :>10 right-aligns in width 10']],
  ex:[
   {t:'Basic: indexing and slicing',code:`s = "Python"
print(s[0], s[-1])
print(s[1:4])
print(s[:3])
print(s[3:])
print(s[::-1])`,out:`P n
yth
Pyt
hon
nohtyP`,why:'Negative index -1 is the last character. Slices stop BEFORE the end index, omitted bounds mean "to the edge", and step -1 walks backwards producing the reversed string.'},
   {t:'Intermediate: cleaning and restructuring text',code:`raw = "  Aarav, Diya,  Kabir , Meera  "
names = [part.strip() for part in raw.split(",")]
print(names)
print(" | ".join(names))
print("banana".replace("na", "NA"))
print("Report.PDF".lower().endswith(".pdf"))`,out:`['Aarav', 'Diya', 'Kabir', 'Meera']
Aarav | Diya | Kabir | Meera
baNANA
True`,why:'split(\",\") breaks on commas keeping stray spaces, strip removes them per part, and join reassembles with a chosen separator. replace substitutes every occurrence ("na" twice). Chaining lower().endswith() gives a case-insensitive extension check.'},
   {t:'Advanced: f-string formatting and searching',code:`item, price, qty = "Notebook", 49.5, 3
print(f"{item:<10} x{qty} = Rs.{price * qty:.2f}")
score = 0.857
print(f"score: {score:.1%}")
line = "ERROR: disk almost full"
print(line.find("disk"), line.startswith("ERROR"))
print(f"padded: {42:05d}")`,out:`Notebook   x3 = Rs.148.50
score: 85.7%
7 True
padded: 00042`,why:'Inside {} any expression works (price*qty), format specs control width/alignment (<10), decimals (.2f), percentages (.1%), and zero padding (05d). find returns the first index (or -1), startswith answers a yes/no prefix question.'}
  ],
  walk:[[1,'The string "Python" occupies indices 0..5; -1 maps to index 5.','s[0]=P, s[-1]=n'],[3,'Slice 1:4 takes indices 1,2,3 → "yth"; the stop index 4 itself is excluded.','yth'],[4,'Empty start defaults to 0, so [:3] is the first three characters.','Pyt'],[6,'Step -1 starts at the end and walks backwards, copying every character in reverse.','nohtyP']],
  walkWhy:'All slice results are new strings; the original "Python" still exists unchanged, which is the practical consequence of immutability.',
  rules:['Strings are immutable: s[0] = "X" raises TypeError; build a new string instead.','Slice indices never raise IndexError (they clamp), but single indexing out of range does.','split() with no argument splits on runs of whitespace and drops empty pieces; split(",") keeps empties.','Methods return new strings — forgetting to assign the result is a silent no-op.'],
  mistakes:[
   {t:'Calling a method and discarding the result',bad:'name = "  diya  "\nname.strip()\nprint(name)   # still has spaces!',why:'strip() returned a new cleaned string which was thrown away; the original variable still points at the unclean text because strings cannot change in place.',fix:'name = name.strip()\nprint(name)   # diya',tip:'If a string method seems to "do nothing", you almost certainly forgot the assignment.'},
   {t:'Trying to edit one character in place',bad:'s = "cat"\ns[0] = "b"',err:"TypeError: 'str' object does not support item assignment",why:'Immutability means no character slots can be overwritten. The fix is to construct the desired string using slicing concatenation or replace.',fix:'s = "b" + s[1:]   # "bat"\n# or: s = s.replace("c", "b", 1)',tip:'For many edits, convert to a list (list(s)), edit, then "".join(...) back.'}
  ],
  cmp:['Indexing vs slicing',['Operation','s[i] indexing','s[a:b] slicing'],[['Result','Single character','New substring'],['Out of range','IndexError','Clamps safely, may be empty'],['Negative allowed','Yes, from end','Yes, both bounds'],['Assignment','Illegal (immutable)','Illegal (immutable)']]],
  diag:{kind:'flow',start:'Raw text arrives',condition:'Needs cleaning?',trueAction:'strip / lower / replace (save result!)',falseAction:'Use as-is',end:'Format with f-string'},
  apps:['Cleaning CSV and form input: split on delimiters, strip spaces, normalize case.','Building file names, URLs and messages with f-string templates.','Quick text checks: palindromes via [::-1], extensions via endswith, prefixes via startswith.'],
  quizzes:[{q:'What is "abcdef"[2:5]?',options:['cde','bcd','cdef','Error'],correct:0,why:'Indices 2,3,4 are taken (stop excluded): c, d, e.'},
            {q:'s = "Hi"; s.upper(); print(s) shows…',options:['HI','Hi','Error','None'],correct:1,why:'upper() returns a new string that was discarded; s is unchanged because strings are immutable.'}],
  take:['Slice [start:stop:step] excludes stop; [::-1] reverses; single index can be negative.','String methods return new strings — always assign the result.','f-strings embed expressions and format specs like :.2f, :.1%, :05d.'],
  rev:'s[-1] last char; slice stop excluded; [::-1] reverse. Immutable: save method results. split↔join are opposites. f"{x:.2f}" formats.',
  assign:{p:'Given full_name = "  meera sharma ", produce the cleaned title-cased name and print: Name: Meera Sharma (initials: MS). Use strip, title/split and an f-string.',s:`full_name = "  meera sharma "
# TODO: clean the name, build initials from its parts, print with an f-string`,sol:`full_name = "  meera sharma "
clean = full_name.strip().title()
parts = clean.split()
initials = "".join(p[0] for p in parts)
print(f"Name: {clean} (initials: {initials})")`}
},
{
  id:'py-lists-tuples', walkEx:3, course_id:'python', unit_id:'py-unit-1', order_index:5,
  title:'Lists & Tuples: Ordered Collections', desc:'Create, index, slice, grow and sort lists; know when the immutable tuple is the right choice.',
  obj:['Mutate lists with append/insert/remove/pop and index assignment','Slice and comprehend lists to build transformed copies','Choose tuple vs list based on mutability and use unpacking'],
  pre:['Strings (indexing/slicing model)','For loops'],
  outcomes:['Learner can manage ordered data, explain aliasing, and pick the right sequence type'],
  def:'A list is an ordered, mutable sequence of arbitrary objects written with square brackets. A tuple is an ordered, immutable sequence written with parentheses (the comma is what truly makes it). Both support indexing, slicing, len, membership and iteration.',
  simple:'A list is like a shopping list on paper: you can add items at the end (append), insert in the middle, cross items out (remove) — it is built to change. A tuple is the same list laminated: once printed, nothing can be edited, which makes it perfect for fixed records like (x, y) coordinates or (day, month, year). Both keep order and let you pick items by position using the same indexing and slicing you learned for strings. One warning: assignment copies the REFERENCE, not the items — b = a makes two names for one list, so changing b also changes a, unless you copy with a[:] or list(a).',
  hing:'List ek aisi shopping list hai jisme aap items jod (append), beech me daal (insert) aur hata (remove) sakte ho — ye badalti rehti hai. Tuple usi list ka laminated version hai: ek baar bann gaya to change nahi hoga, isliye coordinates ya date jaisi fixed cheezon ke liye perfect. Dono me index aur slicing strings jaisa hi kaam karta hai. Ek bada trap: b = a karne se list copy nahi hoti, dono naam ek hi list ko point karte hain. Asli copy ke liye a[:] ya list(a) use karna hota hai. Aur tuple banata hai comma — (5) sirf number hai, (5,) tuple!',
  why:'Lists are Python\'s default workhorse collection — rows from a file, items in a cart, queued tasks. Tuples appear as dictionary keys, multi-value returns and fixed records. Understanding mutability and aliasing prevents the most common Python bugs.',
  when:'Use a list when items will be added, removed, reordered or updated. Use a tuple for fixed-shape records, function return bundles, and anywhere a dict key/set member must be immutable.',
  syntax:'nums = [3, 1, 4]\nnums.append(1)      # grow at end\nnums[0] = 9         # replace in place\npoint = (12, 5)     # tuple\nx, y = point        # unpacking\nsquares = [n * n for n in nums]  # comprehension',
  comp:[['[] vs ()','Square brackets: mutable list. Parentheses+commas: immutable tuple'],['append/pop','Efficient end operations; pop() returns the removed item'],['Unpacking','Assign sequence items to names positionally in one statement']],
  ex:[
   {t:'Basic: growing and editing a list',code:`cart = ["milk", "bread"]
cart.append("eggs")
cart.insert(1, "butter")
cart[0] = "oat milk"
print(cart)
print(len(cart), cart[-1])
removed = cart.pop()
print(removed, cart)`,out:`['oat milk', 'butter', 'bread', 'eggs']
4 eggs
eggs ['oat milk', 'butter', 'bread']`,why:'append adds at the end, insert shifts later items right, index assignment replaces in place, and pop() both removes and returns the last item. All changes happen on the same list object.'},
   {t:'Intermediate: sorting, slicing and comprehensions',code:`scores = [58, 91, 73, 91, 40]
print(sorted(scores))
print(scores)
top2 = sorted(scores, reverse=True)[:2]
print(top2)
passed = [s for s in scores if s >= 50]
print(passed, scores.count(91))`,out:`[40, 58, 73, 91, 91]
[58, 91, 73, 91, 40]
[91, 91]
[58, 91, 73, 91] 2`,why:'sorted() returns a NEW list leaving scores untouched, while slicing selects the top two after a descending sort. The comprehension filters in one readable line, and count tallies exact matches.'},
   {t:'Advanced: aliasing trap and tuple unpacking',code:`a = [1, 2, 3]
b = a
b.append(4)
print(a)
c = a[:]
c.append(99)
print(a, c)
point = (12, 5)
x, y = point
print(x, y, point[0])`,out:`[1, 2, 3, 4]
[1, 2, 3, 4] [1, 2, 3, 4, 99]
12 5 12`,why:'b = a binds a second name to the SAME list, so b.append changes what a sees as well. a[:] makes a shallow copy, so c can grow independently. Tuples unpack positionally into x and y.'}
  ],
  walk:[[1,'A list object [1,2,3] is created and the name a refers to it.','a → [1,2,3]'],[2,'b = a copies only the reference; both names now point at one shared list.','a, b → same list'],[3,'Appending via b mutates the shared object, so printing a shows the new element too.','list becomes [1,2,3,4]'],[5,'a[:] builds a genuinely separate list with the same items; later edits to c do not touch a.','c is an independent copy']],
  walkWhy:'Assignment in Python never copies containers — names are labels attached to objects. Copies must be requested explicitly (slice, list(), copy module).',
  rules:['b = a aliases a list; copy with a[:], list(a) or a.copy() to edit independently (still shallow for nested lists).','list.sort() sorts in place and returns None; sorted(x) returns a new list and accepts any iterable.','A one-element tuple needs a trailing comma: (5,) — (5) is just the int 5.','Tuples are hashable (if their items are) so they can be dict keys; lists never can.'],
  mistakes:[
   {t:'Assigning the result of sort()',bad:'nums = [3, 1, 2]\nnums = nums.sort()\nprint(nums)   # None!',why:'sort() mutates in place and returns None by design (to prevent exactly this confusion). The variable gets overwritten with None and the data appears lost.',fix:'nums = [3, 1, 2]\nnums.sort()\nprint(nums)   # [1, 2, 3]\n# or: nums = sorted([3, 1, 2])',tip:'In-place mutators (sort, append, extend) return None. If you see None appear, check for this pattern.'},
   {t:'Removing items while iterating the same list',bad:'nums = [1, 2, 3, 4]\nfor n in nums:\n    if n % 2 == 0:\n        nums.remove(n)  # skips items, buggy',why:'Removing shifts remaining items left while the loop index still advances, so the element after a removed one is never examined. Results are silently wrong.',fix:'nums = [n for n in nums if n % 2 != 0]  # build a filtered copy',tip:'Filter with a comprehension, or iterate over a copy: for n in nums[:].'}
  ],
  cmp:['List vs tuple',['Feature','List [ ]','Tuple ( )'],[['Mutable','Yes — append, assign, delete','No — fixed after creation'],['Typical data','Homogeneous items, growing collection','Fixed record (x, y), bundled return'],['Dict key / set member','Never (unhashable)','Yes, if items are hashable'],['Methods','Many (append, sort, pop...)','Only count, index']]],
  diag:{kind:'flow',start:'Ordered data needed',condition:'Will it change later?',trueAction:'Use a list',falseAction:'Use a tuple (fixed record)',end:'Index / slice / iterate'},
  apps:['Task queues and shopping carts are lists that grow and shrink.','Coordinates, RGB colours and date parts are classic fixed tuples.','Functions return multiple values as tuples, unpacked on arrival (q, r = divmod(17, 5)).'],
  quizzes:[{q:'a = [1, 2]; b = a; b.append(3); print(a) →',options:['[1, 2]','[1, 2, 3]','[3]','Error'],correct:1,why:'b aliases the same list object, so the append is visible through a.'},
            {q:'Which creates a tuple containing only 7?',options:['(7)','[7]','(7,)','tuple[7]'],correct:2,why:'The comma creates the tuple; (7) is merely a parenthesized int.'}],
  take:['Lists mutate in place (append/insert/pop/sort); tuples never change.','Assignment aliases containers — copy explicitly with [:]/list() before independent edits.','sorted() returns new; sort() mutates and returns None.'],
  rev:'List [] mutable, tuple ()+(comma!) immutable. b=a aliases. copy: a[:]. sort()→None, sorted()→new. Unpack: x, y = point.',
  assign:{p:'From readings = [22, 31, 19, 31, 28, 31] print: (1) a NEW sorted copy, (2) count of 31s, (3) original unchanged, in the format shown in the solution preview: sorted=[19, 22, 28, 31, 31, 31] count31=3 original=[22, 31, 19, 31, 28, 31].',s:`readings = [22, 31, 19, 31, 28, 31]
# TODO: print sorted copy, count of 31, and the untouched original`,sol:`readings = [22, 31, 19, 31, 28, 31]
ordered = sorted(readings)
print(f"sorted={ordered} count31={readings.count(31)} original={readings}")`}
},
{
  id:'py-dicts-sets', course_id:'python', unit_id:'py-unit-1', order_index:6,
  title:'Dictionaries & Sets: Key–Value and Unique Collections', desc:'Map keys to values with dicts, use get/items safely, and exploit sets for uniqueness and fast membership.',
  obj:['Create, read, update and delete dictionary entries safely','Iterate keys, values and items; use get with defaults','Apply set uniqueness and operations (union, intersection, difference)'],
  pre:['Lists & tuples','Booleans and membership (in)'],
  outcomes:['Learner can model records and lookups with dicts and deduplicate/compare groups with sets'],
  def:'A dictionary is a mutable mapping from hashable keys to values, preserving insertion order (Python 3.7+). A set is an unordered collection of unique hashable items supporting mathematical set operations. Both provide average O(1) membership tests via hashing.',
  simple:'A dictionary works like a real dictionary or a phone contacts list: you look up by a NAME (the key) and instantly get the associated value — you never scan page by page. In Python you write marks["Diya"] = 92 and later marks["Diya"] returns 92. Asking for a name that does not exist raises KeyError, so the .get() method (with a default answer) is your safe lookup tool. Sets are like a bag that refuses duplicates: throw in names with repeats and only unique ones survive — perfect for "which students attended BOTH classes?" style questions using intersection (&) and union (|) operations.',
  hing:'Dictionary bilkul contacts list jaisa hai: naam (key) do, number (value) turant milta hai — pura scan nahi karna padta. marks["Diya"] = 92 set karta hai, marks["Diya"] value deta hai. Agar key exist nahi karti to KeyError aata hai, isliye safe tarika hai .get("Diya", 0) — na mile to default 0 milega. Set duplicates ki dushman hai: ek hi item do baar dalo to bhi ek hi rahega. Set operations maths wale hain: & matlab common (dono me), | matlab saare milakar, - matlab pehle me hai dusre me nahi. Membership test (in) dict/set me list se kahin zyada fast hai.',
  why:'Dictionaries are the backbone of JSON handling, configuration, counting, caching and record modelling in Python. Sets solve deduplication and group-comparison problems in one line where loops would take ten — and both make "is X present?" checks O(1) instead of list-scanning O(n).',
  when:'Use a dict whenever data is naturally found by a name/ID rather than position. Use a set when uniqueness or fast membership matters and order does not. Keep lists when order/duplicates matter.',
  syntax:'d = {"a": 1, "b": 2}\nd["c"] = 3            # insert/update\nv = d.get("x", 0)     # safe lookup with default\nfor k, v in d.items(): ...\ns = {1, 2, 2, 3}      # {1, 2, 3}\ncommon = s1 & s2      # intersection',
  comp:[['Key','Must be hashable (str/int/tuple ok, list not)'],['.get(k, default)','Lookup that never raises KeyError'],['Set operators','| union, & intersection, - difference, ^ symmetric difference']],
  ex:[
   {t:'Basic: build and query a dictionary',code:`marks = {"Aarav": 85, "Diya": 92}
marks["Kabir"] = 78
marks["Aarav"] = 88
print(marks["Diya"])
print(marks.get("Meera", "absent"))
print("Kabir" in marks)
print(list(marks.keys()))`,out:`92
absent
True
['Aarav', 'Diya', 'Kabir']`,why:'Assigning an existing key updates it (85→88), a new key inserts. get returns the default instead of raising KeyError, in tests keys, and keys iterate in insertion order.'},
   {t:'Intermediate: counting with a dict',code:`text = "to be or not to be"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)
for word, n in counts.items():
    print(word, n)`,out:`{'to': 2, 'be': 2, 'or': 1, 'not': 1}
to 2
be 2
or 1
not 1`,why:'The get(word, 0) + 1 idiom handles first sightings gracefully. items() yields (key, value) pairs in insertion order for clean reporting. (collections.Counter automates this later.)'},
   {t:'Advanced: set operations answer group questions',code:`math_club = {"Aarav", "Diya", "Kabir"}
chess_club = {"Diya", "Meera", "Kabir"}
print(sorted(math_club & chess_club))
print(sorted(math_club | chess_club))
print(sorted(math_club - chess_club))
ids = [101, 102, 101, 103, 102]
print(len(set(ids)), "unique ids")`,out:`['Diya', 'Kabir']
['Aarav', 'Diya', 'Kabir', 'Meera']
['Aarav']
3 unique ids`,why:'& gives members of both clubs, | everyone in either, - maths-only members. Converting a list to a set deduplicates instantly; sorted() is used only to display deterministically since sets are unordered.'}
  ],
  walk:[[4,'"Diya" is hashed to find its slot directly, returning 92 without scanning other entries.','lookup O(1) average'],[5,'"Meera" is absent; get returns the supplied default "absent" instead of raising KeyError.','safe lookup'],[6,'in checks the key set only — values are not searched.','Kabir in marks → True'],[7,'keys() preserves the order entries were first inserted (Aarav before Diya before Kabir).','insertion order maintained']],
  walkWhy:'Hashing turns each key into a slot index, which is why dict/set lookups stay fast even with millions of entries, unlike list membership scans.',
  rules:['Keys must be hashable: strings, numbers, tuples of hashables. Lists/dicts as keys raise TypeError.','Direct d[k] raises KeyError when absent; use get when absence is an acceptable case.','Sets remove duplicates and have no index/order — never use s[0].','{} creates an empty DICT; an empty set needs set().'],
  mistakes:[
   {t:'Crashing with KeyError on optional keys',bad:'marks = {"Diya": 92}\nprint(marks["Meera"])',err:"KeyError: 'Meera'",why:'Square-bracket lookup promises the key exists. Optional data (like "student was absent") violates that promise and aborts the program.',fix:'print(marks.get("Meera", "absent"))\n# or check first: if "Meera" in marks: ...',tip:'Default to .get() for external/optional data (JSON, user records); reserve [] for guaranteed keys.'},
   {t:'Using a list as a dictionary key',bad:'grid = {}\ngrid[[1, 2]] = "x"',err:"TypeError: unhashable type: 'list'",why:'Keys must be hashable so their slot stays stable; a mutable list can change, which would corrupt the hash table. The tuple version works because tuples of hashables are immutable.',fix:'grid[(1, 2)] = "x"\nprint(grid[(1, 2)])',tip:'Coordinates/composite keys: always reach for tuples, never lists.'}
  ],
  cmp:['Dict vs list for lookup',['Feature','List of pairs','Dictionary'],[['Find by name','Linear scan O(n)','Hash lookup O(1) average'],['Access syntax','loop + comparisons','d["Diya"]'],['Duplicate keys','Possible, ambiguous','Impossible — update wins'],['Order','Positional','Insertion order preserved']]],
  diag:{kind:'flow',start:'Data to organise',condition:'Look up by name/ID?',trueAction:'Dictionary mapping',falseAction:'Only uniqueness/membership → set',end:'Iterate items() to report'},
  apps:['Word frequency counting, shopping cart quantity by SKU, and per-user settings are natural dicts.','JSON objects load directly into Python dicts (json module).','Sets power tag comparisons, friend-of-friend suggestions and duplicate detection.'],
  quizzes:[{q:'What does {"a": 1, "a": 2} evaluate to?',options:['Error: duplicate key','{"a": 1}', '{"a": 2}','{"a": [1, 2]}'],correct:2,why:'A later identical key simply overwrites the earlier value — dictionaries never hold duplicate keys.'},
            {q:'len({1, 2, 2, 3, 3, 3}) is…',options:['6','3','5','Error'],correct:1,why:'Sets keep unique items only: {1, 2, 3} has length 3.'}],
  take:['Dicts map hashable keys to values with O(1) lookup; keys keep insertion order.','Use .get(key, default) for optional keys; [] raises KeyError.','Sets guarantee uniqueness and offer &, |, - operations; they are unordered.'],
  rev:'d[k]=v insert/update. get(k, default) safe. items() pairs. Keys hashable. Set: unique, & both, | either, - minus.',
  assign:{p:'Build a price dict {"pen": 10, "notebook": 50, "eraser": 5}; then for cart = ["pen", "notebook", "pen"] print the total using get with default 0. Expected: total=70.',s:`prices = {"pen": 10, "notebook": 50, "eraser": 5}
cart = ["pen", "notebook", "pen"]
# TODO: sum the cart safely and print total=<amount>`,sol:`prices = {"pen": 10, "notebook": 50, "eraser": 5}
cart = ["pen", "notebook", "pen"]
total = 0
for item in cart:
    total += prices.get(item, 0)
print(f"total={total}")`}
},
{
  id:'py-functions-scope', walkEx:3, course_id:'python', unit_id:'py-unit-3', order_index:1,
  title:'Functions in Depth: Arguments, Return Values & Scope', desc:'Positional and keyword arguments, defaults, *args/**kwargs, multiple returns, and local vs global scope.',
  obj:['Define functions with default, keyword, *args and **kwargs parameters','Return single and multiple values and unpack them','Explain local/global scope and the effect of mutation vs rebinding'],
  pre:['Conditionals & loops','Lists and dicts'],
  outcomes:['Learner can design small reusable functions with safe defaults and predictable scope behaviour'],
  def:'A function is a named, reusable block defined with def that accepts parameters, executes its body in its own local scope, and yields a result via return (None if omitted). Arguments may be bound positionally, by keyword, gathered as *args (tuple) or **kwargs (dict), with defaults evaluated once at definition time.',
  simple:'Think of a function as a kitchen recipe card: it lists ingredients (parameters), the steps (body), and the finished dish it hands back (return value). When you "call" it, Python sets up a fresh counter space — variables created inside (locals) disappear when the recipe finishes, which is why two functions can both use the name total without clashing. You can give ingredients default values ("salt: 1 tsp if not specified"), pass values by naming them (spice="mild"), or accept however many extras the caller sends with *args/**kwargs. A function with no return quietly hands back None.',
  hing:'Function ek recipe card hai: parameters matlab ingredients, body matlab steps, return matlab bani hui dish jo wapas milti hai. Har call par ek naya "kitchen counter" (local scope) banta hai — andar bane variables bahar nahi dikhle, isliye do functions bina takraye same naam use kar sakte hain. Default value matlab "namak na bole to 1 tsp". Keyword argument matlab naam lekar ingredient dena: greet(name="Diya"). *args kitne bhi extra values ek tuple me pakad leta hai, **kwargs naam-wale extras ko dict me. Ek bada dhokha: def f(x=[]) me default list ek hi baar banti hai aur har call me WAHI list share hoti hai — isse bachne ke liye x=None rakho!',
  why:'Functions are the unit of reuse, testing and readable structure in every program beyond a script. Argument flexibility (defaults, keywords, *args) is how real APIs (like print itself) are designed, and scope misunderstandings cause classic "why did my variable not change?" bugs.',
  when:'Extract a function whenever logic repeats or deserves a name/test. Use defaults for usually-constant options, keyword args for clarity at call sites, and *args/**kwargs when wrapping other functions or accepting variable fields.',
  syntax:'def name(p1, p2=default, *args, **kwargs):\n    """One-line docstring."""\n    ...\n    return value\n\nresult = name(v1, p2=v2)  # positional + keyword',
  comp:[['Parameters','Names in the def line; arguments are the values passed at a call'],['Default value','Evaluated ONCE at def time — never use []/{}; use None instead'],['*args / **kwargs','Collect extra positional args (tuple) / keyword args (dict)']],
  ex:[
   {t:'Basic: defaults and keyword calls',code:`def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Diya"))
print(greet("Kabir", "Namaste"))
print(greet(greeting="Hi", name="Meera"))
print(greet("Aarav", greeting="Welcome"))`,out:`Hello, Diya!
Namaste, Kabir!
Hi, Meera!
Welcome, Aarav!`,why:'The default "Hello" fills in when greeting is omitted. Keyword arguments can be given in any order (third call) or mixed after positionals (last call).'},
   {t:'Intermediate: *args/**kwargs and multiple returns',code:`def total(*numbers):
    return sum(numbers)

def min_max(values):
    return min(values), max(values)

def show_profile(**info):
    return ", ".join(f"{k}={v}" for k, v in info.items())

print(total(1, 2, 3, 4))
lo, hi = min_max([5, 2, 9, 1])
print(lo, hi)
print(show_profile(name="Diya", city="Pune"))`,out:`10
1 9
name=Diya, city=Pune`,why:'*numbers collects all positional values into a tuple for sum(). Returning "two values" is really one tuple, unpacked into lo and hi. **info collects named extras into a dict.'},
   {t:'Advanced: scope — rebinding vs mutating',code:`count = 10
items = ["a"]

def try_change():
    count = 99
    items.append("b")

try_change()
print(count)
print(items)

def reset():
    global count
    count = 0

reset()
print(count)`,out:`10
['a', 'b']
0`,why:'Assigning count inside try_change creates a LOCAL count (reb-binding), so the global stays 10. append mutates the shared list object, so that change IS visible. The global keyword explicitly opts into rebinding the module variable.'}
  ],
  walk:[[1,'Module-level count = 10 and items list are created before any call.','count=10 (global)'],[5,'Assignment to count inside the function makes it local to this call; the global is untouched.','local count=99'],[6,'items.append mutates the one shared list object — no rebinding, so the effect persists after return.','items = ["a","b"]'],[9,'After the call, printing the global count shows 10, proving locals vanished with the call frame.','global count still 10']],
  walkWhy:'Scope is decided by assignment: any name assigned anywhere in a function body is local throughout that function unless declared global/nonlocal. Mutation through a reference is a separate mechanism entirely.',
  rules:['Mutable defaults ([], {}) are shared across calls — use None and create a fresh object inside.','A name assigned anywhere in a function is local everywhere in it; reading before assignment raises UnboundLocalError.','Positional arguments must come before keyword arguments in a call.','No return (or bare return) yields None — printing inside a function is not returning.'],
  mistakes:[
   {t:'The mutable default argument trap',bad:'def add_item(item, bag=[]):\n    bag.append(item)\n    return bag\n\nprint(add_item("pen"))     # [\'pen\']\nprint(add_item("book"))    # [\'pen\', \'book\']  surprise!',why:'The default list is created once at def time and reused by every call that omits it, so items accumulate across calls. It is Python\'s most famous gotcha.',fix:'def add_item(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag',tip:'Lint rule to remember forever: defaults are for immutable values (numbers, strings, None, False).'},
   {t:'Printing instead of returning',bad:'def square(n):\n    print(n * n)\n\nresult = square(4) + 1  # TypeError',err:"TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'",why:'print displays a value but the function still returns None; arithmetic on None fails. Return sends the value back to the caller for further use.',fix:'def square(n):\n    return n * n\n\nresult = square(4) + 1  # 17',tip:'If a caller needs the value, it must be returned — test functions by asserting on return values, not by eyeballing prints.'}
  ],
  cmp:['Rebinding vs mutation in functions',['Action inside function','Example','Visible outside?'],[['Rebind parameter','count = 99','No — local name only'],['Mutate shared object','items.append(x)','Yes — same object'],['Rebind with global','global count; count = 0','Yes — explicit opt-in'],['Return new value','return total','Yes — the clean way']]],
  diag:{kind:'flow',start:'Call with arguments',condition:'Name assigned inside?',trueAction:'Treated as local scope',falseAction:'Look up outer/global scope',end:'return value (or None) to caller'},
  apps:['API wrappers use keyword-only options with defaults (requests.get(url, timeout=5)).','Utility formatters/validators are pure functions reused across a whole project.','print itself demonstrates *args + keyword options (sep=, end=).'],
  quizzes:[{q:'def f(x, bag=[]): bag.append(x); return bag — after f(1) then f(2), the second result is…',options:['[2]','[1, 2]','[]','Error'],correct:1,why:'The default list object is shared between calls, so elements accumulate: [1, 2].'},
            {q:'What does a function without any return statement give back?',options:['0','Empty string','None','Raises an error'],correct:2,why:'Python implicitly returns None when execution falls off the end of the function.'}],
  take:['Defaults are evaluated once — use None for mutable defaults.','Assignment inside a function creates locals; mutation of shared objects is visible outside.','*args collects positionals, **kwargs collects keywords; multiple returns are tuples.'],
  rev:'def name(params): ... return value. Mutable default trap → None. Keyword args by name. Locals vanish after call. No return = None.',
  assign:{p:'Write average(*numbers) returning the mean as a float (0.0 for no numbers), then print average(10, 20, 60) and average(). Expected: 30.0 then 0.0.',s:`# TODO: define average(*numbers) handling the empty case
print(average(10, 20, 60))
print(average())`,sol:`def average(*numbers):
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

print(average(10, 20, 60))
print(average())`}
},
{
  id:'py-exception-handling', course_id:'python', unit_id:'py-unit-3', order_index:2,
  title:'Exception Handling: try / except / else / finally', desc:'Catch specific errors, use else/finally correctly, inspect exception objects, and raise your own errors.',
  obj:['Structure try/except/else/finally blocks with correct execution order','Catch specific exception types and access their messages','Raise meaningful exceptions to signal invalid input'],
  pre:['Functions in depth','Conditionals','Dictionaries (KeyError)'],
  outcomes:['Learner can make programs survive bad input with targeted handling instead of crashing'],
  def:'An exception is an object raised when an error condition occurs at runtime, interrupting normal flow and propagating up the call stack until a matching except clause handles it. try guards risky code, except handles named error types, else runs only on success, and finally always runs for cleanup.',
  simple:'Without seatbelts, one bad moment wrecks the whole journey: a program that divides by zero just dies. Exceptions are Python\'s safety system — when something goes wrong (file missing, wrong type) an "alarm" object is raised and shoots upward through your function calls looking for a handler you wrote. You place risky lines in a try block and write except blocks naming exactly which alarms you know how to handle (ZeroDivisionError, ValueError...). The else part runs only when nothing went wrong, and finally runs no matter what — perfect for closing files or releasing locks. You can also raise your own alarms with raise when input breaks your rules.',
  hing:'Exception matlab runtime par alarm bajna. Jaise 10/0 likha to program crash hone ke bajaye Python ek ZeroDivisionError "raise" karta hai, jo upar ki taraf handler dhundhta hai. Risky code try block me rakho, aur except me batao kaunsi error aaye to kya karna hai. else tab chalega jab koi error NA aaye, aur finally har haal me chalega — file band karne jaisi safai ke liye perfect. Sabse buri aadat hai bare `except:` likhna jo har error ko chup-chaap nigal leta hai (keyboard interrupt tak) — hamesha specific error naam likho. Khud error uthani ho to raise ValueError("message") use karo.',
  why:'Real input is hostile: missing files, malformed numbers, network failures. Programs without handling crash with tracebacks; with targeted handling they can retry, default, log and continue — the difference between a toy script and a dependable tool.',
  when:'Wrap the smallest risky region possible; catch the most specific exceptions you can actually handle. Let unexpected errors propagate (or log and re-raise) so bugs are not hidden. Use finally (or context managers) for guaranteed cleanup.',
  syntax:'try:\n    risky()\nexcept ValueError as e:\n    handle(e)\nelse:\n    on_success()\nfinally:\n    cleanup_always()',
  comp:[['try','Region monitored for exceptions'],['except Type as e','Handler for one type; e carries the message/details'],['else / finally','else: success path. finally: unconditional cleanup']],
  ex:[
   {t:'Basic: surviving division and parse errors',code:`def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "cannot divide by zero"

print(safe_divide(10, 2))
print(safe_divide(5, 0))

try:
    age = int("twenty")
except ValueError as e:
    print("bad number:", e)`,out:`5.0
cannot divide by zero
bad number: invalid literal for int() with base 10: 'twenty'`,why:'The ZeroDivisionError handler converts a crash into a friendly return value. int("twenty") raises ValueError, and `as e` binds the exception object whose text explains the parse failure.'},
   {t:'Intermediate: else/finally ordering and multiple handlers',code:`def fetch(marks, name):
    try:
        value = marks[name]
    except KeyError:
        print(f"{name}: not found")
        return None
    else:
        print(f"{name}: found")
        return value
    finally:
        print("lookup finished")

data = {"Diya": 92}
print(fetch(data, "Diya"))
print(fetch(data, "Kabir"))`,out:`Diya: found
lookup finished
92
Kabir: not found
lookup finished
None`,why:'else runs only on the success path, and finally runs in BOTH paths before the return actually completes — notice "lookup finished" prints before the returned value is shown by the outer print.'},
   {t:'Advanced: raising your own validation errors',code:`def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise ValueError("insufficient funds")
    return balance - amount

for amt in (30, -5, 500):
    try:
        print("new balance:", withdraw(100, amt))
    except ValueError as e:
        print("rejected:", e)`,out:`new balance: 70
rejected: amount must be positive
rejected: insufficient funds`,why:'raise creates and throws an exception object with your message. Business-rule violations are thus reported through the same channel as built-in errors, and the caller decides how to present them.'}
  ],
  walk:[[3,'The division 5/0 raises ZeroDivisionError at the moment of execution; the return on line 3 never completes.','exception raised'],[4,'Python searches for a matching handler; ZeroDivisionError matches exactly and the handler body runs.','flow jumps to except'],[5,'The handler returns its fallback string, so the caller receives a value instead of a crash.','returns "cannot divide by zero"'],[7,'With valid inputs no exception occurs, the except block is skipped entirely, and 5.0 is returned earlier.','handler skipped on success']],
  walkWhy:'Exceptions are a non-local jump: raising unwinds frames until a matching type is found. Precise handler types keep this jump predictable and documented.',
  rules:['Catch specific exceptions; a bare except: swallows everything including KeyboardInterrupt and typo NameErrors, hiding bugs.','Order matters: more specific except clauses must precede broader ones (a subclass after its parent is unreachable).','finally executes even when the block returns, breaks or re-raises — reserve it for cleanup, not business logic.','Do not use exceptions for ordinary expected flow when a simple check (get, in) is clearer — but "ask forgiveness" (EAFP) is idiomatic for races like file opening.'],
  mistakes:[
   {t:'Bare except that hides every failure',bad:'try:\n    result = compute(data)\nexcept:\n    result = 0',why:'Typos (NameError), logic bugs (TypeError) and even Ctrl+C all get silently converted to result = 0. The program continues with corrupt assumptions, making failures undetectable.',fix:'try:\n    result = compute(data)\nexcept (ValueError, KeyError) as e:\n    print("bad input:", e)\n    result = 0',tip:'Name each failure you can genuinely remedy; let the rest crash loudly during development.'},
   {t:'Handling an error by printing and using an undefined variable',bad:'try:\n    n = int(text)\nexcept ValueError:\n    print("oops")\nprint(n * 2)  # NameError if conversion failed',why:'When int() raises, n is never assigned, so the following code crashes with a different, confusing error that masks the original problem.',fix:'try:\n    n = int(text)\nexcept ValueError:\n    n = 0\nprint(n * 2)',tip:'Every except path must leave the program in a valid state: assign defaults or return early.'}
  ],
  cmp:['Check-first (LBYL) vs try-first (EAFP)',['Style','Look Before You Leap','Easier to Ask Forgiveness'],[['Pattern','if key in d: use d[key]','try: use d[key] except KeyError'],['Race-safe','No (things can change between check and use)','Yes'],['Readable when','Failure is common/expected','Success is the normal path'],['Idiomatic Python','Sometimes','Preferred default']]],
  diag:{kind:'flow',start:'Run try block',condition:'Exception raised?',trueAction:'Run matching except handler',falseAction:'Run else block',end:'finally always runs'},
  apps:['Login/data forms convert and validate user text, reporting field errors instead of crashing.','File/network code distinguishes "not found" from "permission denied" via exception types.','Raising ValueError for invalid arguments makes library misuse fail fast with clear messages.'],
  quizzes:[{q:'In try/except/else/finally, the else block runs when…',options:['An exception was handled','No exception occurred in try','Always','Never in functions'],correct:1,why:'else is the success path: it runs only if the try block completed without raising.'},
            {q:'Why is a bare `except:` discouraged?',options:['It is slower','It catches everything (even bugs and interrupts), hiding real problems','It needs a finally','It only catches ValueError'],correct:1,why:'A universal silent handler converts genuine bugs into invisible wrong behaviour.'}],
  take:['try guards, except handles named types, else is success-only, finally always runs.','Catch specific exceptions and leave the program in a valid state on every path.','raise signals your own rule violations with clear messages.'],
  rev:'Order: try → (error: except | clean: else) → finally always. Name exceptions; `as e` gives message. raise ValueError("why") for bad input.',
  assign:{p:'Write parse_positive(text) that returns int(text) but: on ValueError returns -1, and raises ValueError("not positive") if the parsed value <= 0. In main, test with "25", "abc", "-3" catching the raised error, printing: 25 / -1 / not positive.',s:`def parse_positive(text):
    # TODO: convert, -1 on ValueError, raise ValueError("not positive") if <= 0
    return 0

for t in ("25", "abc", "-3"):
    print(parse_positive(t))`,sol:`def parse_positive(text):
    try:
        value = int(text)
    except ValueError:
        return -1
    if value <= 0:
        raise ValueError("not positive")
    return value

for t in ("25", "abc", "-3"):
    try:
        print(parse_positive(t))
    except ValueError as e:
        print(e)`}
},
];

module.exports = { topics: makeTopics(specs) };
