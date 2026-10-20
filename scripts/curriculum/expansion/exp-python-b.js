'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'py-file-handling', course_id:'python', unit_id:'py-unit-3', order_index:3,
  title:'File Handling & Context Managers (with)', desc:'Read and write text files safely with open modes, line iteration and the with statement.',
  obj:['Open files in r, w, a modes knowing exactly what each does to existing content','Read whole files, stripped lines, and write joined text','Use with to guarantee closing even when errors occur'],
  pre:['Strings in depth','Exception handling'],
  outcomes:['Learner can persist program data to text files and read it back reliably'],
  def:'open(path, mode) returns a file object connected to a disk file; mode "r" reads (file must exist), "w" writes truncating any existing content, and "a" appends. The with statement creates a context that closes the file automatically when the block ends, normally or via exception.',
  simple:'A file is like a notebook outside your program\'s memory: writing lets data survive after the program ends. Opening in "w" mode is like tearing out all old pages and starting fresh (dangerous if you meant to keep them!), "a" adds new pages at the back, and "r" only reads. Every opened notebook must eventually be closed, or pending writing may be lost and the OS runs out of handles. Python\'s with statement is the reliable auto-closing habit: whatever happens inside the block — even an error — the file is closed when you leave the block. Text lines read from files include their trailing newline, so .strip() is your friend.',
  hing:'File matlab program ke bahar ek notebook — band honey ke baad bhi data bacha rehta hai. open(name, "w") purani file ka saara content MITA kar nayi shuruaat karta hai (savdhaan!), "a" (append) end me jodta hai, "r" sirf padhta hai. Sabse achi aadat hai with block: with open(...) as f: — block Khatm hote hi file automatic band ho jati hai, error aaye tab bhi. File se padhi har line ke end me newline (\\n) chipka hota hai, isliye strip() karna mat bhoolna. Aur yaad rakho, "r" mode me file na mile to FileNotFoundError aata hai.',
  why:'Persistence is what separates calculators from applications: settings, records, logs, reports. Resource leaks from unclosed files cause flaky "too many open files" failures in long-running programs, which the with pattern eliminates.',
  when:'Use "w" for generated outputs/reports, "a" for logs/journals, "r" for configuration and input data. Always pair open with the with statement; specify encoding="utf-8" for text reproducibility across platforms.',
  syntax:'with open("data.txt", "w", encoding="utf-8") as f:\n    f.write("line one\\n")\n\nwith open("data.txt", "r", encoding="utf-8") as f:\n    for line in f:\n        print(line.strip())',
  comp:[['Mode "r" / "w" / "a"','Read (must exist) / truncate-write / append-write'],['with ... as f','Context manager: closes f on block exit, even on exception'],['f.write vs print(..., file=f)','write adds no newline; return value is characters written']],
  ex:[
   {t:'Basic: write then read back',code:`with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Revision list\\n")
    f.write("1. Strings\\n")
    f.write("2. Loops\\n")

with open("notes.txt", "r", encoding="utf-8") as f:
    content = f.read()

print(content)
print("chars:", len(content))`,out:`Revision list
1. Strings
2. Loops

chars: 34`,why:'write stores exactly the characters given (newlines included manually). read returns the whole file as one string; printing it reproduces the layout (plus print\'s own newline — hence the blank line) and the length counts every character including \\n.'},
   {t:'Intermediate: append, then read lines cleaned',code:`with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("mon: arrays\\n")

with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("tue: loops\\n")

with open("diary.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f]

print(lines)
print("entries:", len(lines))`,out:`['mon: arrays', 'tue: loops']
entries: 2`,why:'The second open used append mode, so Monday\'s entry survived while Tuesday\'s was added. Iterating a file yields lines with their newlines; strip in the comprehension cleans them into a plain list.'},
   {t:'Advanced: round-tripping structured records (CSV style)',code:`rows = [("Aarav", 85), ("Diya", 92), ("Kabir", 78)]

with open("marks.csv", "w", encoding="utf-8") as f:
    for name, score in rows:
        f.write(f"{name},{score}\\n")

loaded = []
with open("marks.csv", "r", encoding="utf-8") as f:
    for line in f:
        name, score = line.strip().split(",")
        loaded.append((name, int(score)))

print(loaded)
print("avg:", sum(s for _, s in loaded) / len(loaded))`,out:`[('Aarav', 85), ('Diya', 92), ('Kabir', 78)]
avg: 85.0`,why:'Writing joins fields with a delimiter; reading splits each line and converts types back (note int(score) — files store text only). The round-trip rebuilds the original in-memory structure. The csv module productionizes this pattern.'}
  ],
  walk:[[1,'open with "w" creates notes.txt (or truncates an existing one) and binds f inside the with block.','notes.txt empty, f open'],[2,'Each write appends characters to the file sequentially, newlines included as written.','file grows line by line'],[6,'Leaving the block triggers the context manager, which flushes and closes the file.','f closed automatically'],[7,'Reopening in "r" and calling read() returns the entire stored text as one string for printing.','content = 34 chars']],
  walkWhy:'Two separate opens model real usage: data written in one run is read back later. The with statement guarantees closure in both roles, even if an exception interrupts the block.',
  rules:['"w" truncates the target immediately on open — before any write — so never open a precious file in "w" to "just look".','"r" on a missing path raises FileNotFoundError; handle it or check with paths (pathlib/os.path).','write returns the count of characters written and adds no newline; use print(..., file=f) for line-oriented output.','Iterating a file is memory-friendly (line by line); read()/readlines() load everything at once.'],
  mistakes:[
   {t:'Forgetting the with (and losing data on crash)',bad:'f = open("log.txt", "w")\nf.write("starting...\\n")\n# exception or exit here: buffer may never flush',why:'Writes sit in a memory buffer until flushed/closed. An abrupt failure leaves an empty or partial file, and repeated leaks exhaust OS file handles.',fix:'with open("log.txt", "w") as f:\n    f.write("starting...\\n")\n# guaranteed flushed and closed here',tip:'Make "with open" a single muscle-memory phrase — bare open() should look unfinished to you.'},
   {t:'Assuming numbers survive the file round-trip',bad:'with open("n.txt", "w") as f:\n    f.write(42)',err:'TypeError: write() argument must be str, not int',why:'Text files store characters, not Python objects. Numbers must be converted to str on the way out and back with int()/float() on the way in — the classic beginner paper-cut.',fix:'with open("n.txt", "w") as f:\n    f.write(str(42))\n# reading back: value = int(f.read())',tip:'For object-structured data, use json.dump/json.load instead of hand-rolled text formats.'}
  ],
  cmp:['File modes at a glance',['Mode','If file missing','If file exists'],[['"r" read','FileNotFoundError','Reads from start'],['"w" write','Created empty','TRUNCATED to empty'],['"a" append','Created empty','Writes go to the end'],['"x" exclusive','Created','FileExistsError']]],
  diag:{kind:'flow',start:'Need persistent data?',condition:'Writing or reading?',trueAction:'open in w/a inside with-block',falseAction:'open in r inside with-block',end:'Block exit closes the file'},
  apps:['Saving game high scores and user settings between runs.','Append-only application logs with timestamps.','Batch-processing text data: read lines, transform, write a cleaned output file.'],
  quizzes:[{q:'What happens to an existing file opened with mode "w"?',options:['Writes append at end','It is truncated to zero length','Error','It is renamed'],correct:1,why:'"w" starts from an empty file immediately at open time; old content is discarded.'},
            {q:'The main guarantee of `with open(...) as f:` is…',options:['Faster writes','Automatic close even if an exception occurs','Binary encoding','Automatic backup'],correct:1,why:'The context manager protocol closes the file on any block exit, including exceptions and returns.'}],
  take:['Modes: r = read (must exist), w = truncate & write, a = append.','Always use with open(...) — closure/flush becomes automatic.','Files store text; convert numbers with str out and int/float back in.'],
  rev:'with open(path, mode, encoding="utf-8") as f. w truncates! Iterate lines + strip(). write() adds no \\n. Missing file + r = FileNotFoundError.',
  assign:{p:'Write the numbers 1..5, one per line, to nums.txt; then read them back, convert to int, and print the list and its sum like: [1, 2, 3, 4, 5] sum=15.',s:`# TODO: write 1..5 to nums.txt with a with-block,
# then read back as ints and print list + sum`,sol:`with open("nums.txt", "w", encoding="utf-8") as f:
    for n in range(1, 6):
        f.write(f"{n}\\n")

with open("nums.txt", "r", encoding="utf-8") as f:
    values = [int(line) for line in f]

print(values, f"sum={sum(values)}")`}
},
{
  id:'py-modules-imports', course_id:'python', unit_id:'py-unit-3', order_index:4,
  title:'Modules & Imports: Organising and Reusing Code', desc:'Import standard library modules, create your own module file, and understand if __name__ == "__main__".',
  obj:['Use import, from-import and aliasing appropriately','Create a module file and import it from another script','Explain __name__ and the "__main__" guard'],
  pre:['Functions in depth','File handling (for the multi-file examples)'],
  outcomes:['Learner can split a program across files and consume standard-library functionality cleanly'],
  def:'A module is a single .py file whose definitions form a namespace accessible after import. import executes the module top-to-bottom once (then caches it), binds its public names, and gives the running script __name__ == "__main__" while imported modules see their own file name as __name__.',
  simple:'As programs grow, one file becomes a mess — modules let you file related functions into separate .py files and import them where needed, like using recipes from different cookbooks. Python ships with a huge standard library: import math gives you sqrt and pi, import json handles JSON text. When a file is imported, its top-level code runs once and its names live behind the module name (math.sqrt) to avoid collisions. The famous guard if __name__ == "__main__": separates "code to run when THIS file is launched" from "definitions for importers" — so importing your file does not suddenly start your whole program.',
  hing:'Module matlab ek .py file jisme related functions rakhe hon, aur import karke aap unhe kahin bhi use kar sakte ho — library ki kitaab udaar lene jaisa. import math likho to math.sqrt(16) ready hai. import karte hi module ka top-level code ek baar chalta hai (isliye module me seedha print mat likho, function me rakho). from math import sqrt sirf ek naam lata hai, import math as m chhota nickname deta hai. Aur `if __name__ == "__main__":` ka matlab: "ye code sirf tab chalao jab yehi file directly run ho" — import hone par nahi. Ye guard professional code ki pehchan hai.',
  why:'Reuse without copy-paste is the whole point of software engineering. The standard library alone (math, json, datetime, random, pathlib...) covers enormous ground, and your own modules turn week-old scripts into maintainable projects.',
  when:'Create a module when functions form a theme (billing, geometry) or are reused by several scripts. Prefer plain import mod / from mod import name; avoid from mod import * (name pollution). Guard entry-point code with the __main__ check.',
  syntax:'import math\nfrom math import sqrt\nimport json as j\n\n# in your own file:\nif __name__ == "__main__":\n    main()',
  comp:[['import mod','Full namespace access: mod.name — clearest origin'],['from mod import x','Pulls x into your namespace; shorter, can obscure origin'],['__name__','"__main__" for the launched script; module name for imported files']],
  ex:[
   {t:'Basic: standard library imports, three styles',code:`import math
from math import sqrt
import json as j

print(math.pi)
print(sqrt(144))
print(math.factorial(5))
print(j.dumps({"city": "Pune", "pin": 411001}))`,out:`3.141592653589793
12.0
120
{"city": "Pune", "pin": 411001}`,why:'math.pi uses full namespacing, sqrt was imported directly, and j is an alias. json.dumps converts a dict to JSON text — functionality you get for free from the standard library.'},
   {t:'Intermediate: creating and importing your own module',code:`with open("billing.py", "w", encoding="utf-8") as f:
    f.write("def total(price, qty, tax_rate=0.18):\\n")
    f.write("    base = price * qty\\n")
    f.write("    return round(base * (1 + tax_rate), 2)\\n")

import billing

print(billing.total(100, 3))
print(billing.total(50, 2, tax_rate=0.0))
print(billing.__name__)`,out:`354.0
100.0
billing`,why:'A module is just a file: writing billing.py and importing it runs its defs and exposes billing.total. In real projects you author the file directly instead of writing it programmatically; the import mechanics are identical.'},
   {t:'Advanced: the __main__ guard separating import from execution',code:`print("module name here:", __name__)

def compute():
    return 6 * 7

def main():
    print("running as the main script:", compute())

if __name__ == "__main__":
    main()`,out:`module name here: __main__
running as the main script: 42`,why:'When this file is the entry point, __name__ is "__main__" so main() runs. If another file imports it, __name__ becomes the file\'s module name and only the definitions are exposed — main() stays dormant until called.'}
  ],
  walk:[[1,'import math triggers a search (current folder, installed locations), executes math\'s top level once, and caches the module object.','math module loaded'],[2,'The from-import copies the sqrt reference into our namespace for direct calls.','sqrt available unqualified'],[6,'math.sqrt vs our sqrt are the same function reached two ways — namespacing is about clarity, not duplication.','both call one function']],
  walkWhy:'Modules are singletons per process: no matter how many files import math, it initialises once and everyone shares that one module object and its state.',
  rules:['Import executes module top-level code exactly once (cached in sys.modules); heavy work belongs inside functions.','Avoid from module import * in real code — unknown names leak in and shadow yours silently.','Circular imports (a imports b, b imports a) usually fail at import time; restructure shared code into a third module.','Your file names must not shadow standard modules (naming your script math.py breaks import math nearby).'],
  mistakes:[
   {t:'Naming your own file after a library module',bad:'# file saved as random.py in the project folder\nimport random\nprint(random.randint(1, 9))  # imports YOUR file!',err:"AttributeError: module 'random' has no attribute 'randint'",why:'Python searches the script\'s folder before the standard library, so your random.py replaces the real module. The error looks baffling until you check the file name.',fix:'# rename the file to dice_game.py\nimport random\nprint(random.randint(1, 9))',tip:'Never name files math.py, json.py, test.py, string.py etc. If a stdlib import misbehaves, print(module.__file__) to see what actually loaded.'},
   {t:'Doing heavy work at import time',bad:'# tools.py\nDATA = load_10gb_dataset()   # runs on every import!\nconnected = connect_to_server()',why:'Every importer — including tests and tooling that only need one function — pays the cost and side effects, and import order starts mattering. Imports should be fast and side-effect-light.',fix:'# tools.py\ndef get_data():\n    ...  # load lazily when first needed',tip:'Modules define; programs execute. Put execution under functions and the __main__ guard.'}
  ],
  cmp:['import styles compared',['Style','You write','Trade-off'],[['import math','math.sqrt(9)','Clear origin, longer'],['from math import sqrt','sqrt(9)','Short, origin implicit'],['import numpy as np','np.array(...)','Short alias, community convention'],['from math import *','sqrt(9), sin(1)...','Avoid: namespace pollution']]],
  diag:{kind:'flow',start:'import statement',condition:'Already imported once?',trueAction:'Reuse cached module (sys.modules)',falseAction:'Run file top-to-bottom, cache it',end:'Names available to the importer'},
  apps:['Splitting a course project into models.py, billing.py, main.py with a guarded entry point.','Harnessing stdlib: datetime for dates, json for APIs, collections for counting, pathlib for paths.','Third-party ecosystems (requests, pandas) are consumed through the very same import machinery.'],
  quizzes:[{q:'When lib.py is imported by app.py, inside lib.py __name__ equals…',options:['"__main__"','"lib"','"app"','None'],correct:1,why:'Only the launched entry script gets "__main__"; imported modules see their own module name.'},
            {q:'What is the main risk of `from math import *`?',options:['It is slower','Imported names can silently shadow your own variables/functions','It imports nothing','It deletes math'],correct:1,why:'Wildcard imports inject an unknown set of names into your namespace, hiding origins and collisions.'}],
  take:['A module is a .py file; import runs it once and caches it; namespaces prevent collisions.','Guard launch code with if __name__ == "__main__": so imports stay side-effect-free.','Do not shadow standard library names; avoid import *.'],
  rev:'import m → m.x; from m import x; alias with as. __main__ guard separates launch vs import. Modules cached after first import.',
  assign:{p:'Create a module file "geometry.py" defining area_circle(r) using math.pi, import it, and print area_circle(1) rounded to 2 decimals via the returned value (round inside). Expected: 3.14.',s:`# TODO: write geometry.py with area_circle(r), import it, print area_circle(1)`,sol:`with open("geometry.py", "w", encoding="utf-8") as f:
    f.write("import math\\n\\n")
    f.write("def area_circle(r):\\n")
    f.write("    return round(math.pi * r * r, 2)\\n")

import geometry

print(geometry.area_circle(1))`}
},
{
  id:'py-oop-classes', course_id:'python', unit_id:'py-unit-3', order_index:5,
  title:'OOP in Python: Classes, Objects & Inheritance', desc:'Model state+behaviour with classes, use __init__/self, specialize with inheritance and method overriding.',
  obj:['Define a class with __init__, instance attributes and methods','Create objects and explain self binding','Inherit from a base class, override methods, and call super().__init__'],
  pre:['Functions in depth','Dictionaries (objects generalize them)'],
  outcomes:['Learner can model a small domain with classes and reuse behaviour through inheritance'],
  def:'A class is a blueprint defining attributes (data) and methods (functions) shared by its instances. __init__ initialises each new instance, with self referring to that instance. Inheritance lets a subclass reuse and override a base class\'s behaviour, optionally extending it via super().',
  simple:'A class is a cookie cutter; objects are the cookies. The cutter (class BankAccount) defines the shape — every account has an owner and a balance (attributes) and can deposit/withdraw (methods). Each cookie (object) carries its OWN values, so Diya\'s balance never mixes with Kabir\'s. The self parameter is how a method knows which specific cookie it is acting on. Inheritance is a more specific cutter: SavingsAccount is a BankAccount plus interest — it reuses everything and adds/overrides only what differs, instead of rewriting deposit logic.',
  hing:'Class ek blueprint/saancha hai, object usse bani asal cheez. BankAccount class batata hai har account ke paas owner aur balance (attributes) hoga aur deposit/withdraw (methods) honge. Har object ke apne values hote hain — Diya ka balance Kabir se alag. Method ke pehle parameter `self` ka matlab hai "ye wala object jismein kaam karna hai"; Python use automatically pass karta hai. Inheritance me child class parent ke saare features reuse karke sirf naye/farak wale hisse badalti hai — super().__init__() parent ka setup chala deta hai. dhyan rahe, `self.` lagana bhoolna sabse common galti hai!',
  why:'OOP bundles the data with the operations that legitimately change it, mirroring how we think about accounts, students, orders, UI widgets. It scales from small records to frameworks where you inherit behaviour (web views, game entities, GUI components).',
  when:'Reach for a class when data and behaviour belong together with invariants (balance never negative) or when you create many similar entities. Keep plain functions/dicts for one-off transformations and simple data passing.',
  syntax:'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n    def deposit(self, amount):\n        self.balance += amount',
  comp:[['__init__','Constructor: runs on instantiation, sets instance state'],['self','Reference to the current instance, passed automatically on method calls'],['super()','Proxy to the parent class for reusing/overriding behaviour']],
  ex:[
   {t:'Basic: a class with state and behaviour',code:`class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def describe(self):
        return f"{self.owner}: Rs.{self.balance}"

a1 = BankAccount("Diya", 500)
a1.deposit(250)
a2 = BankAccount("Kabir")
print(a1.describe())
print(a2.describe())`,out:`Diya: Rs.750
Kabir: Rs.0`,why:'__init__ stores per-instance data under self. a1.deposit(250) is sugar for BankAccount.deposit(a1, 250): self is Diya\'s account, so only her balance changes. a2 keeps the default 0.'},
   {t:'Intermediate: class attributes vs instance attributes',code:`class Student:
    school = "Sunrise High"   # class attribute: shared

    def __init__(self, name):
        self.name = name      # instance attribute

s1 = Student("Meera")
s2 = Student("Aarav")
print(s1.school, s2.school)
Student.school = "Sunrise International"
print(s1.school)
print(s1.name, s2.name)`,out:`Sunrise High Sunrise High
Sunrise International
Meera Aarav`,why:'school lives on the class itself, so one edit updates every student\'s view. name is per-instance under self, independent for each object. Reading s1.school falls back to the class when the instance has no override.'},
   {t:'Advanced: inheritance with override and super()',code:`class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def fee(self):
        return 0

class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, rate=0.04):
        super().__init__(owner, balance)
        self.rate = rate

    def add_interest(self):
        self.balance += self.balance * self.rate

class CurrentAccount(BankAccount):
    def fee(self):
        return 100

s = SavingsAccount("Meera", 1000)
s.add_interest()
c = CurrentAccount("Shop", 5000)
print(s.owner, s.balance, s.fee())
print(c.owner, c.balance, c.fee())`,out:`Meera 1040.0 0
Shop 5000 100`,why:'SavingsAccount reuses the parent constructor via super() and adds rate/interest. fee() demonstrates polymorphism: the same call returns 0 for savings (inherited) and 100 for current (overridden) based on the object\'s actual class.'}
  ],
  walk:[[12,'BankAccount("Diya", 500) creates a fresh instance and calls __init__ with self bound to it.','a1.owner=Diya, balance=500'],[13,'deposit(250) mutates only a1\'s balance because self points at a1.','a1.balance=750'],[14,'A second, independent instance is created with the default balance.','a2.balance=0'],[15,'describe reads through self, so each object reports its own state.','no cross-talk between objects']],
  walkWhy:'The object before the dot becomes self inside the method — that single mechanism explains all instance behaviour in Python OOP.',
  rules:['self must be the first parameter of instance methods and is never passed explicitly by the caller.','Class attributes are shared; assigning obj.x = ... creates/shadows an instance attribute instead of changing the class one.','A subclass __init__ replaces the parent\'s unless it calls super().__init__().','Python has no enforced private attributes; a leading underscore (self._cache) signals internal use by convention.'],
  mistakes:[
   {t:'Omitting self in a method definition',bad:'class Counter:\n    def tick():\n        print("tick")\n\nc = Counter()\nc.tick()',err:'TypeError: tick() takes 0 positional arguments but 1 was given',why:'Method calls always pass the instance automatically. A zero-parameter signature cannot absorb it, producing this signature error — Python is literally telling you self arrived with nowhere to go.',fix:'class Counter:\n    def tick(self):\n        print("tick")',tip:'If the error says "takes 0 but 1 was given", you forgot self. Every instance method starts with it.'},
   {t:'Mutable class attribute shared by all instances',bad:'class Cart:\n    items = []            # ONE list for everyone!\n    def add(self, x):\n        self.items.append(x)',why:'The list lives on the class; appends from every cart land in the same list. This is the mutable-default trap in class clothing.',fix:'class Cart:\n    def __init__(self):\n        self.items = []   # fresh list per instance\n    def add(self, x):\n        self.items.append(x)',tip:'Per-instance mutable state always gets created inside __init__.'}
  ],
  cmp:['Class attribute vs instance attribute',['Aspect','Class attribute','Instance attribute'],[['Defined','In class body','Inside __init__ as self.x'],['Ownership','Shared by all instances','Unique per object'],['Change effect','Visible to all (via fallback)','Solo object only'],['Example','species, school name','name, balance']]],
  diag:{kind:'flow',start:'Need many similar entities?',condition:'Data + behaviour together?',trueAction:'Define a class with __init__ + methods',falseAction:'Plain dicts/functions suffice',end:'Instantiate and call methods'},
  apps:['Bank accounts, orders, library members — domain entities with rules.','UI/game entities (sprites, buttons) inheriting common draw/update behaviour.','Data models in web frameworks where each table becomes a class.'],
  quizzes:[{q:'In a1.deposit(100), what is passed as self?',options:['100','The class BankAccount','The object a1','Nothing'],correct:2,why:'The instance before the dot is bound to self automatically; 100 goes to amount.'},
            {q:'A subclass defines __init__ but never calls super().__init__(). Consequence?',options:['Syntax error','Parent initialisation never runs, so parent attributes may be missing','Parent __init__ runs twice','Inheritance is disabled'],correct:1,why:'Constructors are not chained automatically; skipping super() leaves base state uninitialised.'}],
  take:['Classes bundle per-instance state (self.x) with shared behaviour (methods).','Class attributes are shared; create mutable state in __init__ per instance.','Inheritance reuses parents via super() and specialises by overriding.'],
  rev:'__init__(self,...) sets state; self auto-passed. Class attr shared, instance attr solo. super().__init__() to reuse parent. Override = same method name in child.',
  assign:{p:'Define class Rectangle with __init__(self, w, h), method area() and method describe() returning "Rectangle 4x3 area=12". Create Rectangle(4, 3) and print describe().',s:`# TODO: define Rectangle and print the describe() of a 4x3 rectangle`,sol:`class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h

    def describe(self):
        return f"Rectangle {self.w}x{self.h} area={self.area()}"

r = Rectangle(4, 3)
print(r.describe())`}
},
{
  id:'py-iterators-generators', course_id:'python', unit_id:'py-unit-3', order_index:6,
  title:'Iterators & Generators: Lazy Sequences with yield', desc:'Iterate lazily with generators and generator expressions to process streams in constant memory.',
  obj:['Explain iterable vs iterator and the next()/StopIteration protocol','Write generator functions with yield and generator expressions','Choose lazy generation over materialised lists for streaming data'],
  pre:['Functions in depth','Loops','Lists'],
  outcomes:['Learner can produce lazy sequences and process large data without building giant lists'],
  def:'An iterable is any object usable in a for loop; an iterator produces subsequent values via __next__ until StopIteration. A generator function contains yield: each call to next resumes it, emits one value, and freezes its local state until resumed again, giving lazy, single-pass sequences.',
  simple:'Normal functions cook the entire meal and serve it at once (return). A generator is a live counter: each time you ask, it prepares ONE plate (yield), pauses exactly where it was, and waits for your next request. This means a generator can represent a million — even infinite — values while storing almost nothing, because items are produced on demand and can be thrown away after use. The for loop drives this automatically. The trade-off: generators are one-way streams; once exhausted they stay empty (you must create a fresh one to go again), and they have no len or indexing.',
  hing:'Generator matlab lazy counter — poora khana ek saath nahi, jab maango tab ek plate (ek value) banti hai. yield return se alag hai: yield value dekar function ko wahi FREEZE kar deta hai, aur next maangne par wahi se aage badhta hai. Isse lakhon values bina memory bhare process hoti hain — badi file line-by-line, infinite series ka sirf pehla hissa — sab possible. Lekin yaad rakho: generator ek baar Khatm to Khatm, dobara iterate nahi hota, aur isme len() ya indexing [0] bhi nahi chalta. List banani hai to list(gen) kar lo, lekin phir memory ka fayda gaya.',
  why:'Logs, sensor feeds and database cursors are streams too big to materialise. Generators let the same for-loop code handle 10 items or 10 GB with constant memory, and generator expressions make lazy pipelines (sum of squares over a file) one-liners.',
  when:'Prefer generators when producing sequences for a single pass (sum/min/loop) or when the data is unbounded. Materialise a list when you need len, indexing, sorting, or multiple passes.',
  syntax:'def squares(n):\n    for i in range(n):\n        yield i * i\n\ngen = squares(5)        # nothing computed yet\nnext(gen)               # 0, state frozen\nevens = (x for x in range(10) if x % 2 == 0)  # gen-exp',
  comp:[['yield','Emits one value and suspends, preserving all local variables'],['Lazy evaluation','Values are computed only when requested by next/for'],['Single-pass','Exhausted generators cannot restart; rebuild to iterate again']],
  ex:[
   {t:'Basic: a countdown generator and the iterator protocol',code:`def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
print(next(gen))
print(next(gen))
print(list(gen))
print(list(gen))`,out:`3
2
[1]
[]`,why:'Calling countdown(3) only creates the generator — nothing runs. Each next resumes to the next yield (3, then 2). list(gen) drains the remainder [1]; afterwards the generator is exhausted, so the second list() is empty.'},
   {t:'Intermediate: generator expressions inside aggregates',code:`total = sum(x * x for x in range(1, 101))
print(total)
big = max(len(w) for w in ["data", "structures", "in", "python"])
print(big)
first_three = []
gen = (pow(2, i) for i in range(1000000))
for _ in range(3):
    first_three.append(next(gen))
print(first_three)`,out:`338350
10
[1, 2, 4]`,why:'Parentheses turn the comprehension lazy: sum consumes squares one at a time without a 100-element list. Even a million-item generator costs almost nothing when only 3 values are pulled.'},
   {t:'Advanced: an infinite Fibonacci stream, consumed safely',code:`def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

result = []
for value in fib():
    if value > 30:
        break
    result.append(value)

print(result)`,out:`[0, 1, 1, 2, 3, 5, 8, 13, 21]`,why:'The generator captures a and b between yields, implementing an unbounded stream. Laziness makes "infinite" safe because the consumer takes only what it needs and breaks.'}
  ],
  walk:[[6,'countdown(3) returns a generator object without executing any body code yet.','gen created, n untouched'],[7,'First next starts the body, reaches yield with n=3, emits 3 and freezes with n still 3.','suspended at yield, n=3'],[8,'Second next resumes after the yield: n becomes 2, loop iterates, yield emits 2.','n=2'],[9,'list drains: resumes, n becomes 1, yields 1, then n becomes 0 and the function returns → StopIteration ends iteration.','exhausted']],
  walkWhy:'The execution interleaves producer and consumer one value at a time; locals live between yields, which is exactly what makes stateful streams trivial to write.',
  rules:['A function containing yield anywhere is a generator function; calling it never runs the body immediately.','Generators are single-pass: exhausted ones iterating again produce nothing (no error) — a frequent silent bug.','Generators lack len()/indexing/slicing; convert with list() when random access is required.','return inside a generator ends iteration (raises StopIteration internally); returned values are not yielded.'],
  mistakes:[
   {t:'Re-consuming an exhausted generator',bad:'g = (x * 2 for x in range(3))\nprint(sum(g))   # 6\nprint(sum(g))   # 0 — silently empty!',why:'The first sum drained g. Since exhaustion raises no error, the second aggregation quietly computes over nothing, corrupting results downstream.',fix:'values = [x * 2 for x in range(3)]  # reusable\nprint(sum(values), sum(values))\n# or rebuild: sum(x * 2 for x in range(3)) each time',tip:'If data is needed twice, materialise it once as a list at the boundary.'},
   {t:'Using return value instead of yield in a producer',bad:'def first_three():\n    for i in range(3):\n        return i   # returns 0 and ENDS — loop never repeats\n\nprint(first_three())',why:'return ends the function on the first pass. Learners expecting "0 then on next call 1" misunderstand that state does not persist without yield.',fix:'def first_three():\n    for i in range(3):\n        yield i\n\nprint(list(first_three()))  # [0, 1, 2]',tip:'yield = "give this value and pause"; return = "give this value and end".'}
  ],
  cmp:['List comprehension vs generator expression',['Aspect','[f(x) for x in it]','(f(x) for x in it)'],[['Evaluation','Immediate, all values','On demand'],['Memory','Full list stored','O(1) extra'],['Re-iteration','Unlimited','Once only'],['len/index','Supported','Not supported']]],
  diag:{kind:'event'},
  apps:['Streaming log analysis: sum/count over files too large for memory.','Pipelines like (parse(line) for line in file if valid(line)) feeding aggregates.','Infinite sequences (ticks, ids, fibonacci) sliced by tools such as itertools.islice.'],
  quizzes:[{q:'g = (x for x in range(3)); print(next(g)); print(list(g)) outputs…',options:['0 then [1, 2]','0 then [0, 1, 2]','Error','3 then []'],correct:0,why:'next consumed the 0; list drains only what remains: [1, 2].'},
            {q:'Why prefer a generator over a list for processing a 10 GB log file?',options:['Generators are always faster','Values are produced lazily, keeping memory constant','Lists cannot hold strings','Generators sort automatically'],correct:1,why:'One-item-at-a-time production avoids materialising the entire dataset in RAM.'}],
  take:['yield pauses a function mid-body, preserving locals between values.','Generators are lazy and single-pass: rebuild or list() them for reuse.','Generator expressions slot directly into sum/max/any without building lists.'],
  rev:'yield emit+pause; return end. Lazy, one-pass, no len/index. (expr for x in it) in sum() = constant memory pipelines.',
  assign:{p:'Write a generator evens_upto(n) yielding even numbers from 0 to n inclusive, and print list(evens_upto(10)). Expected: [0, 2, 4, 6, 8, 10].',s:`def evens_upto(n):
    # TODO: yield even numbers 0..n inclusive
    yield from ()

print(list(evens_upto(10)))`,sol:`def evens_upto(n):
    for value in range(n + 1):
        if value % 2 == 0:
            yield value

print(list(evens_upto(10)))`}
},
{
  id:'py-decorators-closures', course_id:'python', unit_id:'py-unit-3', order_index:7,
  title:'Closures & Decorators: Functions that Wrap Functions', desc:'Capture state with closures and add reusable behaviour (logging, timing, validation) via decorators.',
  obj:['Explain how a closure remembers variables from its defining scope','Write a decorator with *args/**kwargs that preserves the wrapped function','Apply @ syntax and state what it desugars to'],
  pre:['Functions in depth (scope, *args)', 'Modules & imports'],
  outcomes:['Learner can factor cross-cutting behaviour into decorators and reason about closure state'],
  def:'A closure is an inner function that references variables from an enclosing function scope and retains them after that outer function returns. A decorator is a callable that takes a function and returns a (usually wrapped) replacement function; @dec above a def is sugar for func = dec(func).',
  simple:'Functions in Python are objects — they can be passed around and returned like values. A closure happens when an inner function carries a "backpack" containing variables from where it was created; even after the outer function finished, the backpack still works. A decorator builds on this: it takes your plain function, wraps it inside a new function that does something before/after (log the call, check permissions, time it), and swaps in the wrapper. Writing @log_calls above a function is just shorthand for func = log_calls(func). This is how one piece of shared behaviour can dress up dozens of functions without touching their code.',
  hing:'Closure matlab inner function apne creation wali jagah ke variables ko "yaad" rakhta hai, outer function Khatm hone ke baad bhi. Multiplier factory socho: make_multiplier(3) ek aisa function deta hai jo hamesha 3 se guna karta hai — wo 3 uske backpack me save hai. Decorator isi power ka use hai: ek function dusre ko wrap karke extra behaviour jod deta hai (logging, validation, timing). @decorator likhna bas func = decorator(func) ka shortcut hai. Wrapper me *args, **kwargs maanna aur original result return karna kabhi mat bhoolna, warna decorated function kharab ho jayega!',
  why:'Logging, authentication checks, caching, retries and timing are cross-cutting: duplicating them inside every function is error-prone. Decorators (and built-ins like @staticmethod, @functools.lru_cache) give one reusable, testable place for such behaviour.',
  when:'Use closures when a function needs private remembered configuration. Use decorators when identical pre/post behaviour applies to many functions; keep wrappers transparent (pass through arguments, return the result, ideally functools.wraps).',
  syntax:'def my_decorator(func):\n    def wrapper(*args, **kwargs):\n        # before\n        result = func(*args, **kwargs)\n        # after\n        return result\n    return wrapper\n\n@my_decorator\ndef target(): ...',
  comp:[['Closure','Inner function + captured enclosing variables, surviving the outer call'],['Wrapper','Replacement function adding behaviour around the original call'],['@dec syntax','Sugar for func = dec(func), applied at definition time']],
  ex:[
   {t:'Basic: a closure that builds custom multipliers',code:`def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

triple = make_multiplier(3)
double = make_multiplier(2)
print(triple(10))
print(double(10))
print(triple(5))`,out:`30
20
15`,why:'Each call to make_multiplier creates a fresh multiply closed over ITS factor: triple remembers 3, double remembers 2, independently — state without classes or globals.'},
   {t:'Intermediate: a logging decorator',code:`def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"-> {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"<- {func.__name__} = {result}")
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b

add(4, 5)
print(add(10, 20))`,out:`-> add(4, 5)
<- add = 9
-> add(10, 20)
<- add = 30
30`,why:'@log_calls rebinds the name add to wrapper, which logs entry/exit and — crucially — returns the wrapped result (visible when the outer print shows 30). add itself needed no logging code.'},
   {t:'Advanced: decorator factories (arguments for the decorator)',code:`def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def cheer(name):
    print(f"Go {name}!")

cheer("India")`,out:`Go India!
Go India!
Go India!`,why:'@repeat(3) first CALLS repeat(3) to obtain the real decorator closed over times=3, then applies it. Three nested layers: factory → decorator → wrapper. This is the pattern behind @app.route("/path") in web frameworks.'}
  ],
  walk:[[1,'make_multiplier(3) executes; its local factor is 3.','factor=3 (call frame)'],[2,'The inner function multiply is created, referencing factor from the enclosing scope.','multiply closes over factor'],[4,'The outer function returns multiply; normally its frame would vanish, but the closure keeps factor alive.','triple remembers 3'],[7,'Calling triple(10) reads factor from the preserved closure cell, computing 30.','uses remembered 3']],
  walkWhy:'Python detects that multiply needs factor after the outer call and stores it in a closure cell attached to the function object — no global variable involved.',
  rules:['Closures capture variables, not per-call snapshots: late binding means loops creating closures over the loop variable all see its final value (fix with a default-arg trick or factory).','A wrapper must accept *args/**kwargs, call the original, and return its result to stay transparent.','functools.wraps preserves __name__/docstring of the original through decoration.','Decorators run once at definition time (usually import), not on every call — the wrapper runs per call.'],
  mistakes:[
   {t:'Wrapper forgets to return the result',bad:'def loud(func):\n    def wrapper(*args, **kwargs):\n        print("calling!")\n        func(*args, **kwargs)  # result discarded\n    return wrapper',why:'Callers receive None from a function that used to return values. The decorator silently breaks the contract of everything it touches.',fix:'def loud(func):\n    def wrapper(*args, **kwargs):\n        print("calling!")\n        return func(*args, **kwargs)\n    return wrapper',tip:'Write "result = func(...); return result" first; insert before/after behaviour around that skeleton.'},
   {t:'Late-binding closures in a loop all act identical',bad:'funcs = []\nfor i in range(3):\n    funcs.append(lambda: i)\nprint([f() for f in funcs])  # [2, 2, 2] — not [0, 1, 2]',why:'All three closures share the same variable i; by call time the loop has ended with i = 2. Closures look up the name at CALL time.',fix:'funcs = []\nfor i in range(3):\n    funcs.append(lambda i=i: i)  # default binds value now\nprint([f() for f in funcs])  # [0, 1, 2]',tip:'Default arguments evaluate at definition time — the standard antidote to late binding.'}
  ],
  cmp:['Closure state vs class instance',['Aspect','Closure (make_multiplier)','Class instance'],[['Remembered data','Enclosing locals in cells','self attributes'],['Multiple behaviours','One function','Many methods'],['Inspectable','Hard to introspect','Attributes are visible'],['Best when','Tiny config/function factories','Rich domain objects']]],
  diag:{kind:'flow',start:'def with @decorator',condition:'Import/definition time',trueAction:'Name rebound to wrapper',falseAction:'Each later call: wrapper adds behaviour',end:'Original result returned'},
  apps:['Web frameworks route URLs with decorators (@app.get("/users")).','functools.lru_cache memoizes expensive pure functions in one line.','Test/timing/retry wrappers applied without editing business functions.'],
  quizzes:[{q:'@dec above def f() means…',options:['f calls dec internally','f = dec(f)','dec = f(dec)','It only adds a comment'],correct:1,why:'Decoration rebinds the function name to the decorator\'s return value at definition time.'},
            {q:'make_multiplier(2) and make_multiplier(5) produce functions that…',options:['Share one factor variable','Each remember their own factor via separate closures','Multiply by 10','Are the same object'],correct:1,why:'Every outer call creates a new scope and a new closure cell, so captured values are independent.'}],
  take:['Closures bundle a function with remembered enclosing variables.','Decorators wrap functions transparently: *args/**kwargs in, result out.','@dec == assigning func = dec(func); decorator factories add a config layer.'],
  rev:'Closure = inner fn + captured vars. Wrapper must return func(*args, **kwargs). @dec sugar for f = dec(f). Beware loop late-binding.',
  assign:{p:'Write a decorator ensure_positive that wraps a one-argument function: if the argument is negative, print "negative blocked" and return 0; else call through. Apply it to def scale10(x): return x * 10 and print results for 5 and -3. Expected: 50, then "negative blocked", then 0.',s:`# TODO: define ensure_positive decorator and apply it to scale10(x) = x * 10

print(scale10(5))
print(scale10(-3))`,sol:`def ensure_positive(func):
    def wrapper(x):
        if x < 0:
            print("negative blocked")
            return 0
        return func(x)
    return wrapper

@ensure_positive
def scale10(x):
    return x * 10

print(scale10(5))
print(scale10(-3))`}
},
{
  id:'py-testing-basics', course_id:'python', unit_id:'py-unit-3', order_index:8,
  title:'Testing Basics: assert, Test Functions & Edge Cases', desc:'Verify code automatically with assertions, tiny test runners, and deliberate edge-case inputs.',
  obj:['Write assertions that pin down expected behaviour','Structure test functions and a minimal pass/fail runner','Select edge cases (empty, zero, boundary) systematically'],
  pre:['Functions in depth','Exception handling'],
  outcomes:['Learner can create a small self-checking test suite and interpret assertion failures'],
  def:'An assertion is an executable claim: assert condition raises AssertionError if the condition is falsy. Unit tests are small functions that call one unit of code with known inputs and assert exact expected outputs, forming an automated regression safety net re-run after every change.',
  simple:'Testing is simply checking your answers like a teacher with an answer key — except the computer does it in milliseconds, forever. You write down what SHOULD happen for chosen inputs (clamp(15) must be 10, empty list average must be 0.0) and let asserts enforce it. The moment any answer differs, the test shouts instead of letting a wrong result slide into your program. Smart testing targets the edges where bugs hide: empty inputs, zero, negative numbers, boundary values exactly at a limit. Frameworks like pytest polish this idea, but the core is plain functions plus assert — which is all this lesson needs.',
  hing:'Testing matlab apne code ki answer-key pehle se likh dena. assert ek checker hai: assert add(2, 3) == 5 — agar galat hua to wahin AssertionError ke saath rooth jayega, galti chhupi nahi rahegi. Test functions ka naam hamesha test_ se shuru karo taaki tools unhe dhoondh lein. sabse important hota hai edge cases sochna: empty list, zero, negative number, exact boundary value — bugs wahin chhupte hain. Ek badi savdhaani: assert ko user-input validation ke liye mat use karo, kyunki Python -O flag se saare asserts delete ho jate hain! Asserts sirf developer ki khud ki jaanch ke liye hain.',
  why:'Manual "run and eyeball" checking does not scale and is forgotten after the first success. Automated tests encode intended behaviour, catch regressions instantly when code changes, and document edge cases better than comments.',
  when:'Write tests for pure logic first (calculations, parsing, transformations). Add cases at each boundary and for every bug you fix (regression test). Move to pytest/unittest when suites grow — the concepts stay identical.',
  syntax:'def test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n\n# run manually, or let pytest discover test_* functions',
  comp:[['assert expr','Raises AssertionError (with optional message) when falsy'],['Unit test','One behaviour, known input, exact expected output'],['Edge case','Inputs at extremes: empty, 0, negative, boundary, single-item']],
  ex:[
   {t:'Basic: first asserts on a tiny function',code:`def clamp(value, low, high):
    return max(low, min(high, value))

assert clamp(5, 0, 10) == 5
assert clamp(-3, 0, 10) == 0
assert clamp(99, 0, 10) == 10
print("all clamp asserts passed")

try:
    assert clamp(5, 0, 10) == 6, "middle value should stay 5"
except AssertionError as e:
    print("deliberate failure seen:", e)`,out:`all clamp asserts passed
deliberate failure seen: middle value should stay 5`,why:'Passing asserts are silent; the deliberately wrong expectation raises AssertionError carrying the custom message. In real suites that failure printout is exactly what a test report shows (caught here only for demonstration).'},
   {t:'Intermediate: a tiny test runner with named cases',code:`def is_palindrome(text):
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]

def test_simple():
    assert is_palindrome("madam")
    assert is_palindrome("Racecar")

def test_phrase_and_edges():
    assert is_palindrome("nurses run")
    assert is_palindrome("")
    assert not is_palindrome("python")

tests = [test_simple, test_phrase_and_edges]
for test in tests:
    test()
    print(f"PASS {test.__name__}")
print(f"{len(tests)}/{len(tests)} tests passed")`,out:`PASS test_simple
PASS test_phrase_and_edges
2/2 tests passed`,why:'Each test_* function groups related asserts and returns normally on success. The mini-runner reports progress by name — pytest automates this discovery and reporting, but the mechanics are the ones shown here.'},
   {t:'Advanced: testing that errors ARE raised correctly',code:`def divide(a, b):
    if b == 0:
        raise ValueError("b must not be zero")
    return a / b

def test_divide():
    assert divide(10, 2) == 5.0
    try:
        divide(1, 0)
        assert False, "ValueError expected but not raised"
    except ValueError as e:
        assert str(e) == "b must not be zero"

test_divide()
print("divide contract verified")`,out:`divide contract verified`,why:'Error behaviour is part of a function\'s contract and must be tested too. The pattern: call expecting the raise, assert False if the call survives, and verify the message in the handler. pytest.raises compresses this idiom.'}
  ],
  walk:[[4,'clamp(5, 0, 10) returns 5; the equality holds, so the assert does nothing and execution continues silently.','assert passed, no output'],[6,'The above-range case clamps to the high boundary 10, again matching the expectation.','boundary case verified'],[11,'Our planted wrong expectation (== 6) is falsy, so AssertionError is raised with the attached message.','AssertionError raised'],[12,'The except catches it purely to display the failure anatomy — in a real run this exception IS the test failure report.','failure surfaced loudly']],
  walkWhy:'Tests are valuable precisely because failure is loud and immediate. A suite that only prints values for eyeballing silently degrades as code evolves; asserts transform "looks right" into a checkable contract.',
  rules:['Never validate user input with assert: running with python -O strips all asserts, deleting your checks.','One test should verify one behaviour; name tests so failures self-describe (test_empty_cart_totals_zero).','Cover edges deliberately: empty, zero, negative, single element, boundary equality, huge-ish values.','Floating-point results need tolerance checks (math.isclose), not ==, because of binary rounding.'],
  mistakes:[
   {t:'Using assert for runtime input validation',bad:'def withdraw(amount):\n    assert amount > 0, "bad amount"\n    ...  # python -O deletes this guard entirely!',why:'Optimised mode (-O) removes assert statements, so production code relying on them becomes unguarded. Validation that must always run belongs in explicit if/raise logic.',fix:'def withdraw(amount):\n    if amount <= 0:\n        raise ValueError("amount must be positive")',tip:'assert = developer self-check & tests. raise = real, always-on validation.'},
   {t:'Testing nothing but the happy path',bad:'def test_average():\n    assert average([2, 4]) == 3   # only case\n# average([]) divides by zero in production!',why:'Bugs concentrate at boundaries the examples never visited. The single happy-path case passes while empty input crashes real usage.',fix:'def test_average():\n    assert average([2, 4]) == 3\n    assert average([]) == 0.0\n    assert average([7]) == 7.0\n    assert average([-2, 2]) == 0.0',tip:'For every input collection ask: empty? one item? negatives? all same? Mix those into every suite.'}
  ],
  cmp:['Manual print-checking vs automated asserts',['Aspect','print + eyeball','assert-based tests'],[['Re-runnable','Only by a human, each time','One command, milliseconds'],['Failure detection','Human must notice','Automatic, with location/message'],['Regression protection','None after the demo passes','Every run re-verifies everything'],['Documentation value','Session scrollback','Executable specification in code']]],
  diag:{kind:'flow',start:'Choose behaviour to pin',condition:'Edge cases covered?',trueAction:'Run suite after every change',falseAction:'Add empty/zero/boundary cases',end:'Green suite = safe to refactor'},
  apps:['Guarding billing/discount calculators against silent pricing regressions.','Pinning parser behaviour on malformed files (expecting specific exceptions).','Coding-platform style auto-graders are literally assert suites over your functions.'],
  quizzes:[{q:'What happens when assert x == 5 runs with x = 5?',options:['Prints True','Nothing — execution continues','Raises AssertionError','x becomes 5'],correct:1,why:'A satisfied assertion is silent; only failures raise AssertionError.'},
            {q:'Why must real input validation not rely on assert?',options:['asserts are slow','python -O removes all asserts, silently disabling the checks','assert only works on ints','assert raises the wrong exception type'],correct:1,why:'Optimized runs strip asserts entirely; validation must use explicit if + raise.'}],
  take:['assert turns expected behaviour into executable, loud-on-failure checks.','Group asserts in test_* functions; cover happy path AND empty/zero/boundary edges.','Errors are testable behaviour: verify both the raise and its message.'],
  rev:'assert cond, "msg" — silent pass, loud fail. test_* functions group cases. Edges: empty, 0, negative, boundary. Never validate user input with assert (-O strips).',
  assign:{p:'Write test_max3() for max3(a,b,c)=max(a,b,c) covering: distinct values, negatives, all equal; run it and print "max3 tests passed".',s:`def max3(a, b, c):
    return max(a, b, c)

# TODO: write test_max3() with at least 3 meaningful asserts and run it`,sol:`def max3(a, b, c):
    return max(a, b, c)

def test_max3():
    assert max3(1, 9, 4) == 9
    assert max3(-5, -2, -9) == -2
    assert max3(7, 7, 7) == 7
    assert max3(0, 0, 1) == 1

test_max3()
print("max3 tests passed")`}
},
];

module.exports = { topics: makeTopics(specs) };
