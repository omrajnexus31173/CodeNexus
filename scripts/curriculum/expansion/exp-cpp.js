'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'cpp-variables-auto-const', course_id:'cpp', unit_id:'cpp-unit-1', order_index:2,
  title:'Variables, auto Type Deduction & const Correctness', desc:'Declare with brace initialisation, let auto deduce types, and protect data with const and constexpr.',
  obj:['Initialise variables safely with brace initialisation','Know what type auto deduces (and what it strips)','Apply const/constexpr to communicate and enforce immutability'],
  pre:['cin/cout streams','Compiled-language types from C'],
  outcomes:['Learner writes modern, type-safe declarations and avoids narrowing/const mistakes'],
  def:'A C++ variable is a typed object with a scope and lifetime. auto asks the compiler to deduce the type from the initialiser (dropping top-level const/references). const declares an object read-only after initialisation; constexpr additionally requires a compile-time-evaluable value.',
  simple:'In C++ a variable is a labelled box with a strict type: an int box will never willingly hold text. Modern C++ prefers brace initialisation like int x{5} because it refuses sneaky narrowing (stuffing 3.9 into an int warns/errors instead of silently dropping .9). When the type is obvious from the right-hand side, auto lets the compiler fill it in — great for long iterator types — but remember auto copies values unless you write auto&. const is a promise: "this will not change", which lets the compiler catch accidental edits and lets readers relax. constexpr goes further: the value exists at compile time, like a folded constant.',
  hing:'C++ me variable ek type-wala box hai. int x{5} wali brace initialization sabse safe hai kyunki ye 3.9 ko chup-chaap int me kaatne (narrowing) se rokti hai. auto matlab compiler khud initialiizer dekh kar type tay kare — auto n = 5 me n int banega. Lekin dhyan do, auto by default COPY banata hai; reference chahiye to auto& likhna padega. const ek waada hai: value badlegi nahi, galti se badalne jao to compiler wahin rokeyga. constexpr aur aage hai — value compile time par hi tay ho jati hai, jaise const int DAYS = 7 garam garam constant.',
  why:'Declaration discipline prevents whole bug classes: narrowing data loss, accidental mutation of shared state, and uninitialised reads. auto and const also document intent, making code review dramatically easier.',
  when:'Use auto when the type is long/obvious (iterators, lambdas, casts); spell small scalar types fully when precision matters (double vs float). Default to const for values and parameters you do not intend to change.',
  syntax:'int count{0};                    // brace init, no narrowing\nauto rate = 0.18;                // deduced double\nconst int MAX_USERS{100};        // read-only\nauto& ref = obj;                 // deduced reference (no copy)\nconstexpr int DAYS_IN_WEEK = 7;  // compile-time constant',
  comp:[['Brace init {}','Initialises everywhere, rejects narrowing conversions'],['auto','Deduces decayed value type; add & / const& for reference semantics'],['const / constexpr','Read-only after init / guaranteed compile-time constant']],
  ex:[
   {t:'Basic: deduction and the types it picks',code:`#include <iostream>
#include <string>
int main() {
    auto count = 42;
    auto price = 19.99;
    auto label = std::string{"pen"};
    int whole{7};
    std::cout << count << " " << price << " " << label << " " << whole << "\\n";
    auto sum = count + whole;
    std::cout << "sum=" << sum << "\\n";
    return 0;
}`,out:`42 19.99 pen 7
sum=49`,why:'auto deduces int, double and std::string from the initialisers; once fixed at compile time, those types behave exactly like spelled-out declarations (count + whole is int arithmetic → 49).'},
   {t:'Intermediate: auto copies, auto& refers',code:`#include <iostream>
#include <vector>
int main() {
    std::vector<int> v{10, 20, 30};
    for (auto x : v) { x += 1; }
    std::cout << v[0] << v[1] << v[2] << "\\n";
    for (auto& x : v) { x += 1; }
    std::cout << v[0] << v[1] << v[2] << "\\n";
    for (const auto& x : v) { std::cout << x << " "; }
    std::cout << "\\n";
    return 0;
}`,out:`102030
112131
11 21 31`,why:'Plain auto in a range-for copies each element, so +1 vanished with the copies. auto& binds to the real elements, making the increments stick. const auto& is the efficient read-only default for non-trivial types.'},
   {t:'Advanced: const parameters and constexpr evaluation',code:`#include <iostream>
#include <string>
constexpr int square(int x) { return x * x; }
void print_label(const std::string& label, const int value) {
    std::cout << label << "=" << value << "\\n";
}
int main() {
    constexpr int AREA = square(12);
    const int days{7};
    print_label("area", AREA);
    print_label("days", days);
    std::cout << "runtime square=" << square(5) << "\\n";
    return 0;
}`,out:`area=144
days=7
runtime square=25`,why:'square is constexpr, so AREA is computed by the compiler (constant-folded to 144), yet the same function serves runtime calls (square(5)). The const& label parameter avoids copying the string while guaranteeing print_label cannot modify it.'}
  ],
  walk:[[5,'auto count deduces int from 42. The deduction finishes at compile time — no runtime "dynamic type" exists.','count: int'],[8,'Brace-initialised whole{7} is an int built without any narrowing risk.','whole = 7'],[10,'sum deduces from count + whole, an int expression, so sum is int 49.','sum: int = 49']],
  walkWhy:'auto is purely compile-time deduction; the generated program is identical to writing the types out — there is zero runtime cost or dynamism.',
  rules:['auto drops top-level const and references; write const auto& when you need a read-only alias without copying.','Brace init rejects narrowing (int x{3.9} is an error) but watch out: auto x{5} is fine, while auto v{1,2,3} deduces initializer_list.','const objects must be initialised at declaration and can never be assigned afterwards.','Uninitialised local scalars hold indeterminate values; always initialise ({0} or a real value).'],
  mistakes:[
   {t:'Expecting auto to keep the reference',bad:'int total = 100;\nauto alias = total;\nalias = 0;            // total unchanged — alias is a copy!',why:'auto deduces the plain value type, so alias is an independent int. Code written believing alias refers to total mutates a throwaway copy.',fix:'auto& alias = total;\nalias = 0;            // total really becomes 0',tip:'Decide "copy or alias?" explicitly every time you write auto; in range-for the default should be const auto& for reads, auto& for writes.'},
   {t:'Silently narrowing a double into an int',bad:'int litres = 3.9;    // compiles, stores 3, data lost',why:'Copy initialisation allows implicit narrowing conversions. The fractional cargo disappears without any diagnostic, corrupting calculations.',fix:'int litres{3.9};     // error: narrowing — forced to be deliberate\ndouble exact{3.9};   // or keep the double',tip:'Brace-init scalars project-wide; let the compiler be the narrowing police.'}
  ],
  cmp:['Copy init vs brace init',['Aspect','int x = 3.9;','int x{3.9};'],[['Narrowing','Silent (stores 3)','Compile error'],['Works for containers','Limited','Uniform syntax everywhere'],['Function-style ambiguity','Possible vexing parse','Never parsed as function'],['Recommendation','Legacy style','Default for new code']]],
  diag:{kind:'flow',start:'Declare a variable',condition:'Should it ever change?',falseAction:'Mark const / constexpr',trueAction:'auto or explicit type + brace init',end:'Compiler enforces the contract'},
  apps:['Financial code freezes rates and limits as const/constexpr to rule out accidental edits.','Range-for over containers uses const auto& to avoid per-element copies (measured speedups on strings/objects).','constexpr tables (month lengths, conversion factors) are folded into the binary with zero startup cost.'],
  quizzes:[{q:'std::vector<int> v{1,2}; for (auto x : v) x = 9; afterwards v is…',options:['{9, 9}','{1, 2}','Empty','Error'],correct:1,why:'auto copies elements; the assignment modified copies only. auto& is required to mutate elements.'},
            {q:'Which declaration is rejected because of narrowing?',options:['int a = 3.9;','double b{3};','int c{3.9};','auto d = 3.9;'],correct:2,why:'Brace initialisation makes double→int narrowing ill-formed; copy-init (a) silently allows it.'}],
  take:['auto deduces value types — add & or const& deliberately for aliasing.','Brace init is the safe default: it forbids narrowing conversions.','Default to const; use constexpr for values known at compile time.'],
  rev:'auto = deduced value type (const/ref dropped). {} blocks narrowing. const = frozen after init; constexpr = compile-time. Range-for reads: const auto&.',
  assign:{p:'Declare constexpr double TAX = 0.18; read prices into a std::vector<double>{100, 250, 50} using const auto& in a range-for to total them, then print "total with tax=" followed by total*(1+TAX) as an integer value (472). Output exactly: total with tax=472.',s:`#include <iostream>
#include <vector>
int main() {
    // TODO: constexpr tax, vector of prices, sum with const auto&, print result
    return 0;
}`,sol:`#include <iostream>
#include <vector>
int main() {
    constexpr double TAX = 0.18;
    std::vector<double> prices{100, 250, 50};
    double total = 0;
    for (const auto& p : prices) { total += p; }
    std::cout << "total with tax=" << total * (1 + TAX) << "\\n";
    return 0;
}`}
},
{
  id:'cpp-functions-overloading', course_id:'cpp', unit_id:'cpp-unit-1', order_index:4,
  title:'Functions: Overloading, Default Arguments & inline', desc:'Give one name to several type-specific implementations and make parameters optional with defaults.',
  obj:['Overload functions by parameter type/count and predict overload resolution','Declare default arguments respecting the trailing rule','Contrast inline functions with macro-style duplication'],
  pre:['Variables, auto & const','C functions'],
  outcomes:['Learner can design a small overloaded API without ambiguity traps'],
  def:'Function overloading allows multiple functions to share a name when their parameter lists differ in number or type; the compiler selects the best match at each call site (return type alone cannot distinguish overloads). Default arguments supply values for trailing parameters that the caller may omit. inline requests that calls be substituted with the body while keeping full type checking and single evaluation.',
  simple:'In everyday language, "print" means slightly different actions for a photo, a document or a receipt — your brain picks the meaning from what follows the word. C++ overloading is the same: print(int), print(string), print(int,int) are separate functions sharing one name; the compiler inspects your arguments and routes the call to the best-fitting version. Default arguments are the "usual order, please" of functions: greet(name) can silently use "Hello" unless you specify another greeting. And an inline function is the safe replacement for old C macros: the compiler may paste its body at call sites for speed, but arguments are still evaluated exactly once with type checking.',
  hing:'Overloading matlab ek hi naam ke kai functions, farak sirf parameters me. print(int), print(string) — compiler arguments dekh kar sahi wala chun leta hai, bilkul jaise hum "charge" shabd ka matlab context se samajhte hain. Dhyan rahe: sirf return type alag karke overload nahi hota! Default argument matlab parameter ki standby value — caller na de to wahi lagegi, aur defaults hamesha aakhri (trailing) parameters ko hi de sakte ho. inline function macro ka safe badla hai: body call ki jagah chipak sakti hai, lekin arguments ek hi baar evaluate hote hain aur type checking bhi hoti hai.',
  why:'String/int/double versions of area, print, parse are everywhere; overloading gives them one discoverable name instead of areaCircle/areaRect soup. Defaults evolve APIs gracefully: adding an optional parameter does not break existing callers.',
  when:'Overload when the OPERATION is identical but inputs differ naturally in type. Do not overload when a renamed function would be clearer, or when implicit conversions could make two overloads ambiguous — prefer templates for truly generic code.',
  syntax:'int area(int side);                 // square\ndouble area(double radius);         // circle\nint area(int w, int h);             // rectangle\nvoid greet(std::string name, std::string greeting = "Hello");\ninline int twice(int x) { return x + x; }',
  comp:[['Parameter list','The signature the compiler matches on (types + count + const/ref qualifiers)'],['Default argument','Declared once (header); must be trailing; substituted at call sites'],['inline','Suggestion + linkage rule; body may be substituted with full checking']],
  ex:[
   {t:'Basic: overloading by type and arity',code:`#include <iostream>
#include <string>
void show(int v) { std::cout << "int: " << v << "\\n"; }
void show(double v) { std::cout << "double: " << v << "\\n"; }
void show(const std::string& v) { std::cout << "string: " << v << "\\n"; }
void show(int a, int b) { std::cout << "pair: " << a << "," << b << "\\n"; }
int main() {
    show(7);
    show(2.5);
    show(std::string{"exam"});
    show(3, 4);
    return 0;
}`,out:`int: 7
double: 2.5
string: exam
pair: 3,4`,why:'Each call is resolved independently from the argument types: 7 is int, 2.5 is double, the string object matches the const string& overload, and two ints select the pair overload. No runtime branching is involved — resolution is compile-time.'},
   {t:'Intermediate: default arguments build a flexible API',code:`#include <iostream>
#include <string>
void banner(const std::string& title, char fill = '*', int width = 10) {
    std::cout << std::string(width, fill) << " " << title << " "
              << std::string(width, fill) << "\\n";
}
int main() {
    banner("Hi");
    banner("Hi", '-');
    banner("Hi", '=', 3);
    return 0;
}`,out:`********** Hi **********
---------- Hi ----------
=== Hi ===`,why:'Defaults fill from the right: banner("Hi") uses fill=\'*\' width=10; the second call overrides only fill; the third overrides both. Existing callers never break when new defaulted parameters are appended.'},
   {t:'Advanced: ambiguity — when two overloads fit equally',code:`#include <iostream>
void process(long v) { std::cout << "long " << v << "\\n"; }
void process(double v) { std::cout << "double " << v << "\\n"; }
int main() {
    process(10L);
    process(2.5);
    process(static_cast<long>(7));
    int x = 5;
    process(static_cast<double>(x));
    return 0;
}`,out:`long 10
double 2.5
long 7
double 5`,why:'process(7) with a plain int would be ambiguous (int converts equally to long and double, so it is a compile error — by design). Explicit casts make each call unambiguous. Good API design avoids sibling overloads that create such ties.'}
  ],
  walk:[[9,'show(7) argues with an int literal; among the candidates, show(int) is an exact match and wins.','→ show(int)'],[10,'2.5 is a double literal, exactly matching show(double).','→ show(double)'],[11,'The argument is a std::string object; binding to const std::string& is exact and avoids a copy.','→ show(const string&)'],[12,'Two arguments eliminate all one-parameter overloads immediately.','→ show(int,int)']],
  walkWhy:'Overload resolution ranks exact matches above promotions above conversions; a tie among the best is a compile-time ambiguity error rather than a silent guess.',
  rules:['Return type alone does not overload: int f() and double f() cannot coexist.','Once a parameter has a default, every parameter after it needs one too.','Defaults are specified once, normally in the declaration (header), not repeated in the definition.','Overload sets with convertible sibling types (int/long/double) invite ambiguity errors at innocent call sites.'],
  mistakes:[
   {t:'Trying to overload by return type',bad:'int read();\ndouble read();   // error: redefinition with different return type',err:"error: 'double read()' cannot be overloaded",why:'At a call like read(); the compiler has no argument clues, and the destination type is not part of resolution. C++ decides solely from the parameter list.',fix:'int read_int();\ndouble read_double();\n// or: template + explicit choice, or an output parameter',tip:'When only the output differs, rename, template, or return a richer type.'},
   {t:'A default that silently changes program-wide behaviour',bad:'// retries default quietly becomes huge after an edit\nbool send(Packet p, int retries = 100);',why:'Defaults are baked at each call site at COMPILE time; stale-compiled files keep old values until rebuilt, and overgenerous defaults hide retries/perf issues.',fix:'bool send(Packet p, int retries = 3);\n// document the default; rebuild all callers after changes',tip:'Treat default values as public API: stable, documented, conservative.'}
  ],
  cmp:['Overloading vs default arguments',['Need','Overload set','Defaulted parameter'],[['Different input TYPES','Yes — its purpose','No help'],['Optional trailing inputs','Needs one overload per arity','Single function covers all'],['Resolution','Compile-time match on args','Missing args filled in'],['Risk','Ambiguity among siblings','Call-site baked values']]],
  diag:{kind:'flow',start:'Call name(args)',condition:'Exactly one best overload?',trueAction:'Compiler binds that function',falseAction:'Ambiguity error — cast or redesign',end:'Defaults fill omitted trailing args'},
  apps:['std::to_string has overloads for every numeric type behind one name.','Geometry libraries overload area/volume across shapes described by different measures.','Output operator (<<) itself is an overloaded function per type in the iostream design.'],
  quizzes:[{q:'Which pair can legally coexist?',options:['int f(int) and double f(int)','void f(int) and void f(double)','void f() and int f()','void f(int a) and void f(int b)'],correct:1,why:'Parameter types differ, so they are distinct overloads. Differing only by return type or parameter name is illegal.'},
            {q:'void go(int a, int b = 1, int c); — status?',options:['Fine','Error: parameters after a defaulted one must also have defaults','c defaults to 0','Only legal in main'],correct:1,why:'Defaults must form a trailing suffix; c following a defaulted b without its own default is ill-formed.'}],
  take:['Overloads differ by parameter list only; best-match resolution happens at compile time.','Defaults are trailing, declared once, and baked into call sites.','Prefer inline functions over macros: typed, single-evaluation, debuggable.'],
  rev:'Overload = same name, different params (never return-type only). Defaults trail and live in the declaration. Ambiguous conversions = compile error.',
  assign:{p:'Overload describe(): describe(int) prints "roll <n>", describe(const std::string&) prints "name <s>", and describe(int, const std::string&) prints "roll <n> name <s>". Call all three with 12, "Diya", (12, "Diya").',s:`#include <iostream>
#include <string>
// TODO: three describe overloads + calls in main
int main() { return 0; }`,sol:`#include <iostream>
#include <string>
void describe(int roll) { std::cout << "roll " << roll << "\\n"; }
void describe(const std::string& name) { std::cout << "name " << name << "\\n"; }
void describe(int roll, const std::string& name) {
    std::cout << "roll " << roll << " name " << name << "\\n";
}
int main() {
    describe(12);
    describe(std::string{"Diya"});
    describe(12, std::string{"Diya"});
    return 0;
}`}
},
{
  id:'cpp-std-string-deep', walkEx:2, course_id:'cpp', unit_id:'cpp-unit-1', order_index:5,
  title:'std::string in Depth: Search, Substrings & Conversion', desc:'Find, slice, replace and convert numbers with std::string, std::to_string and std::stoi.',
  obj:['Search with find and interpret std::string::npos','Build text with substr, append, insert and replace','Convert between strings and numbers safely (stoi/stod validation)'],
  pre:['C strings & <string.h> (contrast)','Variables & const references'],
  outcomes:['Learner manipulates text the C++ way without manual buffer bookkeeping'],
  def:'std::string is a class managing a dynamically sized sequence of characters with value semantics: it owns its buffer, grows automatically, and provides operations such as find (returning an index or std::string::npos), substr, replace and concatenation via + or append.',
  simple:'Where C made you count buffer bytes and stow away the \\0, std::string is a self-managing text object: assign it, copy it, glue pieces with +, compare with == (real letter comparison!), and ask its size() — memory bookkeeping disappears. Searching returns either the position found or the special "not found" sentinel std::string::npos, which you must check before using the position. Numbers convert with std::to_string one way and std::stoi/std::stod the other; stoi throws on garbage input instead of lying with a zero, which is exactly what safe parsing needs.',
  hing:'std::string C ke char array ka upgraded, khud-manage karta version hai. Buffer size, \\0, overflow — in sab ki chinta Khatm: string khud grow hoti hai, == se asal text compare hota hai, + se jud jati hai. find() agar text dhoondhe to position deta hai, na mile to std::string::npos (ek special "not found" value) — ise check kiye bina substr mat lagana, warna galat result aayega. Number se string banane ke liye std::to_string, aur string se number ke liye std::stoi — dhyan rahe stoi galat input par exception throw karta hai, 0 nahi deta, isliye try-catch ya manual check jaroori hai.',
  why:'Text handling is unavoidable (names, paths, protocols, logs). std::string removes the overflow and lifetime hazards of C arrays while keeping performance, and its algorithms (find/replace/substr) replace hand-written loops that often harbour off-by-one bugs.',
  when:'Default to std::string for owned text; take const std::string& (or std::string_view in newer code) for read-only parameters to avoid copies. Use std::to_string/stoi family for conversions, validating with try/catch on untrusted input.',
  syntax:'std::string s = "hello";\nsize_t pos = s.find("ll");          // or std::string::npos\nstd::string part = s.substr(1, 3);  // start, length\ns.replace(pos, 2, "LL");\nint n = std::stoi("42");  std::string t = std::to_string(42);',
  comp:[['find → size_t/npos','Check != std::string::npos before using an index'],['substr(pos, len)','Second argument is LENGTH, not end index'],['stoi/stod','Throw std::invalid_argument / std::out_of_range on bad input']],
  ex:[
   {t:'Basic: building, comparing and measuring',code:`#include <iostream>
#include <string>
int main() {
    std::string first{"Ada"}, last{"Lovelace"};
    std::string full = first + " " + last;
    std::cout << full << " len=" << full.size() << "\\n";
    std::cout << (first == "Ada") << " " << (first < last) << "\\n";
    full.append(" (1815-1852)");
    std::cout << full << "\\n";
    return 0;
}`,out:`Ada Lovelace len=12
1 1
Ada Lovelace (1815-1852)`,why:'operator+ concatenates into a NEW string (operands unchanged), size() counts characters, and comparisons are lexicographic content comparisons — true prints as 1. append mutates in place, growing storage automatically.'},
   {t:'Intermediate: find, npos discipline and replace',code:`#include <iostream>
#include <string>
int main() {
    std::string line{"ERROR: disk almost full"};
    size_t colon = line.find(':');
    std::cout << "level=" << line.substr(0, colon) << "\\n";
    size_t disk = line.find("disk");
    if (disk != std::string::npos) {
        std::cout << "disk at " << disk << "\\n";
    }
    std::cout << (line.find("cpu") == std::string::npos) << "\\n";
    line.replace(0, 5, "WARN");
    std::cout << line << "\\n";
    return 0;
}`,out:`level=ERROR
disk at 7
1
WARN: disk almost full`,why:'substr(0, colon) takes colon characters (length form), extracting ERROR. The npos check guards index use; replace(0, 5, "WARN") swaps the 5 letters of ERROR, adjusting length automatically.'},
   {t:'Advanced: string↔number conversion with validation',code:`#include <iostream>
#include <string>
bool parse_port(const std::string& text, int& out) {
    try {
        size_t used = 0;
        int value = std::stoi(text, &used);
        if (used != text.size()) return false;
        out = value;
        return true;
    } catch (const std::exception&) {
        return false;
    }
}
int main() {
    int port = 0;
    std::cout << parse_port("8080", port) << " " << port << "\\n";
    std::cout << parse_port("80x0", port) << "\\n";
    std::cout << std::to_string(2024) + "-report" << "\\n";
    return 0;
}`,out:`1 8080
0
2024-report`,why:'stoi reports how many characters it consumed (used); demanding used == size rejects trailing junk like "80x0" that a plain stoi would quietly truncate to 80. Exceptions convert total garbage into a clean false.'}
  ],
  walk:[[5,'find scans for \':\' and returns its index 5 (E-R-R-O-R occupies 0..4).','colon = 5'],[6,'substr(0, 5) copies a length-5 piece from index 0 → ERROR.','level extracted'],[7,'find("disk") returns 7, which is compared against npos before being printed/used.','disk=7, valid'],[12,'replace grows/shrinks the buffer as needed: 5 chars out, 4 in, the rest shifts automatically.','length handled by class']],
  walkWhy:'All index arithmetic is explicit in return values (positions, lengths) while capacity/reallocation is the class\'s private problem — the key design split std::string offers over C arrays.',
  rules:['find failures must be checked against std::string::npos; using npos as an index in substr throws std::out_of_range.','substr(pos, length) takes a LENGTH — substr(2, 5) is indices 2..6, not "up to 5".','operator[] does no bounds checking; .at(i) throws std::out_of_range — choose per safety needs.','Pass strings by const& to read them; by value only when you need your own mutating copy.'],
  mistakes:[
   {t:'Using a find result without the npos check',bad:'size_t p = s.find("admin");\nstd::string rest = s.substr(p);  // p == npos when absent',err:'std::out_of_range thrown at runtime (npos is a huge value)',why:'npos is the largest size_t value; feeding it to substr as a position is nonsense and crashes the robust-looking program exactly on inputs missing the needle.',fix:'size_t p = s.find("admin");\nif (p != std::string::npos) { use(s.substr(p)); }\nelse { handle_missing(); }',tip:'find and the npos check are one idiom — never write the first without the second.'},
   {t:'Expecting substr\'s second argument to be an end index',bad:'std::string s{"abcdef"};\nauto mid = s.substr(1, 3);  // learner expects "bc" (1..3)',why:'The second parameter is a count of characters, so the result is "bcd" (3 chars from index 1). Ports from Python/JavaScript slicing habits bite here.',fix:'auto mid = s.substr(1, 2);  // start 1, length 2 → "bc"',tip:'Read substr aloud as "from POS, take LEN characters"; Python\'s [a:b] must be converted to length b-a.'}
  ],
  cmp:['C char array vs std::string',['Aspect','char buf[N]','std::string'],[['Capacity','Fixed; you manage overflow','Grows automatically'],['Compare','strcmp function call','==, < operators'],['Copy','strcpy with manual sizing','= copies safely'],['Find absence sentinel','NULL pointer','std::string::npos']]],
  diag:{kind:'flow',start:'Search with find',condition:'Result != npos?',trueAction:'substr/replace at that index',falseAction:'Handle the missing case',end:'String storage auto-managed'},
  apps:['Splitting log lines into level/message by delimiters.','Building file names and URLs from parts with +/append.','Server code converting query parameters ("8080") into validated numeric config.'],
  quizzes:[{q:'std::string s{"programming"}; s.substr(3, 4) is…',options:['gram','prog','ming','ramm'],correct:0,why:'Start at index 3 (g), take 4 characters: g, r, a, m — the second argument is a length.'},
            {q:'If "x" is absent, s.find("x") returns…',options:['-1','0','std::string::npos','Throws immediately'],correct:2,why:'find signals absence with the npos sentinel (largest size_t); it throws nothing by itself.'}],
  take:['Check find against npos before touching any index it returned.','substr takes (start, LENGTH); replace/insert adjust size automatically.','stoi + used-count (or try/catch) gives honest numeric parsing.'],
  rev:'== compares content. find→npos check. substr(pos,len). stoi validates (throws); to_string formats. Pass const string& to read.',
  assign:{p:'From std::string email{"diya.sharma@example.com"}; print the user part (before @) and the domain (after @) on separate lines, using find with an npos check. Expected:\ndiya.sharma\nexample.com',s:`#include <iostream>
#include <string>
int main() {
    std::string email{"diya.sharma@example.com"};
    // TODO: find '@', guard with npos, print both parts
    return 0;
}`,sol:`#include <iostream>
#include <string>
int main() {
    std::string email{"diya.sharma@example.com"};
    size_t at = email.find('@');
    if (at != std::string::npos) {
        std::cout << email.substr(0, at) << "\\n";
        std::cout << email.substr(at + 1) << "\\n";
    }
    return 0;
}`}
},
{
  id:'cpp-operator-overloading', course_id:'cpp', unit_id:'cpp-unit-2', order_index:2,
  title:'Operator Overloading: +, ==, << and Friends', desc:'Teach your classes arithmetic, comparison and stream output so they feel like built-in types.',
  obj:['Overload binary operators as member functions with correct const-ness','Implement << as a non-member friend for stream output','Follow expected semantics (no surprising operator behaviour)'],
  pre:['Classes & objects','References vs pointers','Function overloading'],
  outcomes:['Learner can give a value class natural +, == and << syntax'],
  def:'Operator overloading defines functions named operator@ that the compiler invokes for expressions like a + b or cout << obj when operands have user-defined types. Member binary operators take the right operand as a parameter with *this as the left; stream operators are non-members because the stream is the left operand.',
  simple:'Built-in types get nice syntax: you write a + b, not add(a, b). Operator overloading extends that courtesy to your own types: define what + means for two Money values, what == compares, and how cout should print your object. Under the hood these are ordinary functions with special names — a + b calls a.operator+(b). The stream operator << is the odd one: since the left side is cout (not your object), it cannot be your member function, so it is written as a friend non-member that returns the stream to allow chained printing like cout << a << b.',
  hing:'Operator overloading matlab apni class ko +, ==, << jaisi natural syntax sikhana. Jab aap p1 + p2 likhte ho to asal me function call hota hai: p1.operator+(p2) — left wala object `this` banta hai, right wala parameter. Isliye parameters ko const& rakho taaki temporary values bhi chal sakein. Ek khaas case hai cout << obj: yahan left side cout hai (aapki class nahi!), isliye ye member nahi ho sakta — ise friend non-member function banate hain jo ostream& return karta hai taaki chaining ho sake. Aur golden rule: operator ka matlab waisa hi rakho jaisa sab expect karte hain — + se subtraction mat karwana!',
  why:'Value types (points, fractions, money, matrices) should behave like numbers. Good operator overloads make domain code read like maths, let your types work with streams/containers/algorithms that expect ==/< semantics, and eliminate error-prone manual component handling.',
  when:'Overload operators when the meaning is unambiguous to every reader (coordinates add, durations subtract, fractions compare). Prefer named functions when meaning needs explanation — if a reader must check the header, the operator is the wrong tool.',
  syntax:'class Point {\n    int x, y;\npublic:\n    Point operator+(const Point& rhs) const { return {x + rhs.x, y + rhs.y}; }\n    bool operator==(const Point& rhs) const { return x == rhs.x && y == rhs.y; }\n    friend std::ostream& operator<<(std::ostream& os, const Point& p);\n};',
  comp:[['Member binary op','Left operand is *this; parameter is the right operand (const&)'],['friend <<','Non-member with stream on the left; returns the stream for chaining'],['const device','Read-only operators are const so they work on const objects/temporaries']],
  ex:[
   {t:'Basic: Point addition and equality',code:`#include <iostream>
class Point {
    int x, y;
public:
    Point(int x_, int y_) : x(x_), y(y_) {}
    Point operator+(const Point& rhs) const {
        return Point(x + rhs.x, y + rhs.y);
    }
    bool operator==(const Point& rhs) const {
        return x == rhs.x && y == rhs.y;
    }
    void print() const { std::cout << "(" << x << "," << y << ")"; }
};
int main() {
    Point a{1, 2}, b{3, 4};
    Point c = a + b;
    c.print();
    std::cout << " equal=" << ((a + b) == Point{4, 6}) << "\\n";
    return 0;
}`,out:`(4,6) equal=1`,why:'a + b invokes a.operator+(b), producing a fresh Point without touching either operand (const method). Equality composes field pairs; temporaries like (a+b) work because parameters are const& and methods are const.'},
   {t:'Intermediate: stream output via friend operator<<',code:`#include <iostream>
class Money {
    int rupees, paise;
public:
    Money(int r, int p) : rupees(r), paise(p) {}
    Money operator+(const Money& rhs) const {
        int total = (rupees * 100 + paise) + (rhs.rupees * 100 + rhs.paise);
        return Money(total / 100, total % 100);
    }
    friend std::ostream& operator<<(std::ostream& os, const Money& m) {
        return os << "Rs." << m.rupees << "." << (m.paise < 10 ? "0" : "") << m.paise;
    }
};
int main() {
    Money a{10, 75}, b{5, 50};
    std::cout << a << " + " << b << " = " << (a + b) << "\\n";
    return 0;
}`,out:`Rs.10.75 + Rs.5.50 = Rs.16.25`,why:'The friend can read private fields to format output, and returning the stream enables the whole chained expression on one line. Addition normalises through total paise, so 75 + 50 paise correctly carries into rupees.'},
   {t:'Advanced: ++ (prefix vs postfix) and += guiding +',code:`#include <iostream>
class Counter {
    int value;
public:
    explicit Counter(int v = 0) : value(v) {}
    Counter& operator+=(int n) { value += n; return *this; }
    Counter& operator++() { ++value; return *this; }           // prefix
    Counter operator++(int) { Counter old = *this; ++value; return old; } // postfix
    int get() const { return value; }
};
Counter operator+(Counter lhs, int n) { lhs += n; return lhs; }
int main() {
    Counter c{10};
    Counter old = c++;
    std::cout << "old=" << old.get() << " c=" << c.get() << "\\n";
    ++c;
    Counter d = c + 5;
    std::cout << "c=" << c.get() << " d=" << d.get() << "\\n";
    return 0;
}`,out:`old=10 c=11
c=12 d=17`,why:'Postfix (dummy int parameter) must return the OLD value by copy while prefix returns the updated object by reference — mirroring int semantics exactly. operator+ is implemented through += so the addition logic lives in one place.'}
  ],
  walk:[[7,'a + b: a is *this (1,2), b is rhs (3,4); the body constructs Point(4,6) from summed components.','creates (4,6)'],[16,'Assignment copies the returned temporary into c (or elides the copy entirely in modern C++).','c = (4,6)'],[18,'The temporary (a+b) can bind to ==\'s const& because everything is const — non-const signatures would reject temporaries.','temporaries work via const&']],
  walkWhy:'Every operator expression is just a function call decided at compile time; const-correct signatures determine where the operators may legally appear (temporaries, const objects, chains).',
  rules:['Preserve expected algebra: if you define == also define != consistently (C++20 can autogenerate != from ==).','operator+ should not modify its operands (implement via copy + += on the copy); operator+= mutates and returns *this by reference.','operator<< for streams must be a non-member (friend if it needs private access) and return std::ostream&.','Do not overload &&, || or comma — you lose short-circuit/sequencing and bewilder readers.'],
  mistakes:[
   {t:'Making operator<< a member function',bad:'class Point {\n    std::ostream& operator<<(std::ostream& os) { ... }\n};\n// usage becomes p << std::cout  (backwards!)',err:'no match for operator<< (operand types are std::ostream and Point)',why:'A member puts YOUR object on the left, but in cout << p the stream is on the left. Stream insertion therefore must be a free function (friend for private access).',fix:'friend std::ostream& operator<<(std::ostream& os, const Point& p) {\n    return os << "(" << p.x << "," << p.y << ")";\n}',tip:'Left operand decides placement: stream-left operators (<<, >>) are never members of your class.'},
   {t:'Forgetting const on parameters/methods breaks chains',bad:'Point operator+(Point& rhs) { ... }  // non-const everywhere\n// (a + b) + c fails: temporary cannot bind to Point&',why:'Results of expressions are temporaries (rvalues); non-const references cannot bind to them, so perfectly natural chained arithmetic stops compiling and users curse your API.',fix:'Point operator+(const Point& rhs) const { ... }',tip:'Symmetric binary operators: const method + const& parameter. Repeat for ==, <, etc.'}
  ],
  cmp:['Member vs non-member operator',['Form','Best for','Reason'],[['Member (this on left)','+=, -=, [], (), ->, =','Must-or-should be members by language rules/style'],['Non-member friend','<<, >>, symmetric +/==','Keeps conversions symmetric: 2 + obj works like obj + 2'],['Rule of thumb','Mutating compound ops as members','Binary arithmetic built on top as non-members']]],
  diag:{kind:'flow',start:'Expression a + b',condition:'Operator defined for types?',trueAction:'Compiles to that operator+ call',falseAction:'Compile error lists candidates',end:'Result behaves like built-in math'},
  apps:['std::string\'s +, ==, << are operator overloads you have already used throughout this course.', 'Graphics/game vectors overload + - * so physics code reads like formulas.','std::complex and money/date libraries rely on full operator sets to feel native.'],
  quizzes:[{q:'Why is operator<< for cout << obj written as a non-member?',options:['Members cannot use iostream','The left operand is the stream, not your object, so it cannot be your member','Streams are templates','It must be static'],correct:1,why:'Member operators put the class object on the left; stream insertion has ostream on the left, forcing a free function.'},
            {q:'Postfix operator++(int) differs from prefix because it must…',options:['Return void','Return the OLD value (by copy) after incrementing','Not increment','Take a real integer argument'],correct:1,why:'x++ yields the previous value in C++ semantics; the dummy int parameter exists solely to distinguish the signature.'}],
  take:['a + b is function-call sugar: const-correct signatures make chains/temporaries work.','Stream << / >> are friend non-members returning the stream.','Implement + in terms of +=; never surprise readers with exotic operator meanings.'],
  rev:'Member op: left = *this. << = friend free fn returning ostream&. += mutates & returns *this; + copies then +=. Prefix ++ returns ref, postfix returns old copy.',
  assign:{p:'Write class Fraction {int num, den;} with operator== comparing cross-multiplied values (num*rhs.den == rhs.num*den) and friend operator<< printing num/den. Print (Fraction{1,2} == Fraction{2,4}) and the fraction 3/5. Expected lines: 1 then 3/5.',s:`#include <iostream>
// TODO: Fraction with operator== (cross-multiplication) and friend <<
int main() { return 0; }`,sol:`#include <iostream>
class Fraction {
    int num, den;
public:
    Fraction(int n, int d) : num(n), den(d) {}
    bool operator==(const Fraction& rhs) const {
        return num * rhs.den == rhs.num * den;
    }
    friend std::ostream& operator<<(std::ostream& os, const Fraction& f) {
        return os << f.num << "/" << f.den;
    }
};
int main() {
    std::cout << (Fraction{1, 2} == Fraction{2, 4}) << "\\n";
    std::cout << Fraction{3, 5} << "\\n";
    return 0;
}`}
},
{
  id:'cpp-copy-move-semantics', course_id:'cpp', unit_id:'cpp-unit-2', order_index:4,
  title:'Copy & Move Semantics: Rule of Three/Five/Zero', desc:'Control how objects owning resources are copied, moved and destroyed without leaks or double-free.',
  obj:['Explain when copy/move constructors and assignments run','Implement a resource-owning class under the Rule of Three/Five','Apply the Rule of Zero with standard containers/smart members'],
  pre:['Classes & objects','Dynamic memory (new/delete)','Operator overloading (assignment)'],
  outcomes:['Learner can prevent double-free/leak bugs in resource-owning classes'],
  def:'Copy semantics define how an object duplicates state (copy constructor, copy assignment); move semantics transfer ownership from a temporary (move constructor, move assignment, taking T&&). The Rule of Three/Five says a class needing any of destructor/copy/move operations likely needs them all; the Rule of Zero avoids them entirely via RAII members.',
  simple:'Some objects are just numbers in a box — copying them duplicates the number and all is well. Trouble starts when an object OWNS something external, like a heap buffer it must delete[] in its destructor. A naive copy duplicates only the pointer, so two objects believe they own one buffer: the first destructor frees it, the second frees it again (crash), and both see each other\'s edits. You must program copying to allocate a fresh buffer and clone the data (deep copy), and moving to steal the buffer from a dying temporary and leave it empty. Or best of all: store a std::vector/unique_ptr inside and write NONE of the five special functions — the members already know the right behaviour (Rule of Zero).',
  hing:'Jab class heap memory (new[]) own karti hai aur destructor me delete[] karti hai, tab default copy khatra hai: pointer copy hoga, data nahi — do objects ek hi buffer ke malik ban jayenge, aur double-delete se crash! Isko rokne ko deep copy (copy constructor/assignment) khud likhna padta hai. Move semantics temporary object ka resource chura leta hai (steal) aur use khaali chhod deta hai — copy se kahin tez. Rule yaad rakho: destructor/copy/move teeno me se ek bhi khud likhna pade to aam taur par paanchon (destructor, copy ctor, copy assign, move ctor, move assign) par dhyan dena hoga. Sabse best hai Rule of Zero: member ke roop me std::vector ya unique_ptr rakho, aur koi special function likho hi mat!',
  why:'Double-free and leak bugs are the signature failures of manual resource classes and a historic source of security holes. Copy/move literacy is also needed to read why vectors reallocate efficiently (moves) and why some types are intentionally non-copyable.',
  when:'Default to Rule of Zero: compose members that manage themselves (vector, string, unique_ptr). Hand-write the five only for low-level resource wrappers, then make moves noexcept and leave moved-from objects valid-but-empty.',
  syntax:'class Buffer {\n    int* data; size_t n;\npublic:\n    ~Buffer() { delete[] data; }\n    Buffer(const Buffer& o);             // deep copy\n    Buffer& operator=(const Buffer& o);  // deep assign\n    Buffer(Buffer&& o) noexcept;          // steal\n    Buffer& operator=(Buffer&& o) noexcept;\n};',
  comp:[['Deep vs shallow copy','Allocate+clone owned data, vs duplicate only the pointer'],['Move (T&&)','Steals resources from temporaries; source left valid but unspecified/empty'],['Rule of Zero','Prefer RAII members so compiler-generated specials are correct']],
  ex:[
   {t:'Basic: deep copy prevents shared-buffer aliasing',code:`#include <iostream>
#include <algorithm>
class IntArray {
    int* data;
    size_t n;
public:
    IntArray(size_t size, int fill) : data(new int[size]), n(size) {
        std::fill(data, data + n, fill);
    }
    ~IntArray() { delete[] data; }
    IntArray(const IntArray& o) : data(new int[o.n]), n(o.n) {
        std::copy(o.data, o.data + n, data);
    }
    IntArray& operator=(const IntArray& o) {
        if (this == &o) return *this;
        delete[] data;
        n = o.n;
        data = new int[n];
        std::copy(o.data, o.data + n, data);
        return *this;
    }
    void set(size_t i, int v) { data[i] = v; }
    int get(size_t i) const { return data[i]; }
};
int main() {
    IntArray a(3, 7);
    IntArray b = a;
    b.set(0, 99);
    std::cout << "a[0]=" << a.get(0) << " b[0]=" << b.get(0) << "\\n";
    return 0;
}`,out:`a[0]=7 b[0]=99`,why:'The copy constructor allocated a separate buffer and cloned the values, so mutating b left a at 7. With the compiler-default shallow copy, both would print 99 — and both destructors would delete[] the same buffer.'},
   {t:'Intermediate: moves steal instead of cloning',code:`#include <iostream>
#include <string>
#include <utility>
#include <vector>
int main() {
    std::vector<int> src{1, 2, 3, 4};
    std::vector<int> dst = std::move(src);
    std::cout << "dst size=" << dst.size() << " front=" << dst.front() << "\\n";
    std::cout << "src size after move=" << src.size() << "\\n";
    std::string s1{"portable"};
    std::string s2 = std::move(s1);
    std::cout << "s2=" << s2 << " s1 empty=" << s1.empty() << "\\n";
    return 0;
}`,out:`dst size=4 front=1
src size after move=0
s2=portable s1 empty=1`,why:'std::move only CASTS src to an rvalue, enabling the move constructor to steal its buffer pointer. No elements were copied; the sources remain valid (here size 0 / empty) but their old contents are gone by design — guaranteed for std::vector/string in practice by quality implementations.'},
   {t:'Advanced: Rule of Zero vs hand-rolled ownership',code:`#include <iostream>
#include <string>
#include <vector>
struct StudentRecord {
    std::string name;            // manages itself
    std::vector<int> marks;      // manages itself
    // no destructor/copy/move written: defaults are correct
};
int main() {
    StudentRecord a{"Diya", {90, 95}};
    StudentRecord b = a;
    b.marks[0] = 0;
    b.name = "Kabir";
    std::cout << a.name << " " << a.marks[0] << "\\n";
    std::cout << b.name << " " << b.marks[0] << "\\n";
    return 0;
}`,out:`Diya 90
Kabir 0`,why:'Every member deep-copies and cleans itself up, so the compiler-generated operations compose into correct whole-object behaviour. Zero special functions written, zero leaks, zero double-frees — the strong default for application code.'}
  ],
  walk:[[26,'IntArray b = a invokes the COPY CONSTRUCTOR (declaration initialisation, not assignment).','copy-ctor runs'],[11,'Inside, a fresh allocation mirrors a\'s size; std::copy clones each element into b\'s own buffer.','b has independent memory'],[27,'b.set therefore touches only b\'s cells; a keeps its original 7.','no aliasing'],[29,'At scope exit both destructors delete[] DIFFERENT buffers — safe by construction.','two buffers, two frees']],
  walkWhy:'Ownership correctness is decided in these special members. Where the earlier lessons\' classes held plain ints, the compiler defaults were fine; raw owning pointers change the rules.',
  rules:['If you declare any copy operation or destructor, review all five special members (Rule of Five); declaring a move operation deletes implicit copies unless you declare them.','Move operations must leave the source in a valid, destructible state (typically null the pointer, zero the size) and should be noexcept.','Self-assignment (a = a) must be handled — guard explicitly or use copy-and-swap.','Prefer Rule of Zero: raw owning new/delete inside application classes is a design smell.'],
  mistakes:[
   {t:'Relying on default copy for an owning pointer (double free)',bad:'struct Bad { int* p; ~Bad() { delete[] p; } };\n// compiler copy duplicates p: two owners, one buffer',err:'free(): double free detected / segmentation fault',why:'The destructor announces ownership, but the default copy/assign still duplicate the raw pointer. Both objects free the same allocation and corrupt the heap — a classic exploitable bug.',fix:'// deep-copy in copy ctor/assignment, or better:\nstruct Good { std::vector<int> data; };  // Rule of Zero',tip:'Grep your classes for delete/delete[]: each owning destructor demands the copy/move question be answered explicitly.'},
   {t:'Using an object after std::move as if untouched',bad:'std::string s{"hello"};\nconsume(std::move(s));\nstd::cout << s;   // valid, but content is unspecified (often empty)',why:'std::move does not itself move anything — it permits the receiving operation to pilfer. Afterwards s is only guaranteed destructible/assignable, so business logic depending on its old text is broken.',fix:'std::string s{"hello"};\nconsume(s);          // copy when you still need s\n// or reassign after a deliberate move: s = "fresh";',tip:'After a move, treat the source as an empty shell: reuse only by assigning a new value.'}
  ],
  cmp:['Copy vs move',['Aspect','Copy (const T&)','Move (T&&)'],[['Source afterwards','Unchanged','Valid but emptied/unspecified'],['Cost','Clones all owned data','Transfers pointers/handles — O(1) for buffers'],['Typical trigger','Named objects (lvalues)','Temporaries, std::move, returns'],['Fallback','—','If no move exists, copies are used instead']]],
  diag:{kind:'flow',start:'Class owns a raw resource?',condition:'Can members self-manage?',trueAction:'vector/string/unique_ptr (Rule of Zero)',falseAction:'Write all five specials carefully',end:'No leaks, no double-free'},
  apps:['Container growth in std::vector uses moves to relocate elements without deep-copying each buffer.','Factory functions return heavyweight objects by value safely thanks to moves/elision.','File/socket handle wrappers are move-only (unique ownership) — copies are deleted on purpose.'],
  quizzes:[{q:'A class has a destructor that delete[]s a new[] member but defaulted copy. Danger?',options:['None','Double free: copies share one buffer freed twice','Only slower','Compile error guaranteed'],correct:1,why:'Shallow copies duplicate the owning pointer; both destructors free the same allocation.'},
            {q:'What does std::move(x) itself do?',options:['Copies x','Physically relocates bytes','Casts x to an rvalue so move operations become eligible','Deletes x'],correct:2,why:'It is a cast only — the actual pilfering happens inside the move constructor/assignment it enables.'}],
  take:['Owning raw resources ⇒ the five special members become your responsibility (or delete copies).','Moves transfer ownership and must empty the source safely; mark them noexcept.','Rule of Zero wins: let vector/string/unique_ptr members do the right thing by default.'],
  rev:'Copy = deep clone, move = steal + empty source. Destructor written ⇒ check all 5. std::move is just a cast. Prefer Rule of Zero.',
  assign:{p:'Make a copyable NamedList holding a std::vector<std::string> names with add(const std::string&) and count(). Copy it, add an item to the copy only, and print both counts like a=2 b=3. You should write ZERO special member functions.',s:`#include <iostream>
#include <string>
#include <vector>
// TODO: NamedList with vector member; demonstrate safe default copy
int main() { return 0; }`,sol:`#include <iostream>
#include <string>
#include <vector>
struct NamedList {
    std::vector<std::string> names;
    void add(const std::string& n) { names.push_back(n); }
    size_t count() const { return names.size(); }
};
int main() {
    NamedList a;
    a.add("Diya");
    a.add("Kabir");
    NamedList b = a;
    b.add("Meera");
    std::cout << "a=" << a.count() << " b=" << b.count() << "\\n";
    return 0;
}`}
},
{
  id:'cpp-lambdas-algorithms', course_id:'cpp', unit_id:'cpp-unit-3', order_index:2,
  title:'Lambda Expressions & <algorithm> Essentials', desc:'Write inline anonymous functions with captures and drive sort, find_if, count_if and transform.',
  obj:['Write lambdas with value/reference captures and explicit return types','Sort with custom comparators and query with count_if/find_if','Transform ranges with std::transform and accumulate results'],
  pre:['STL containers','Functions & references'],
  outcomes:['Learner replaces hand-written loops with readable algorithm calls'],
  def:'A lambda is an unnamed function object defined inline: [captures](parameters) -> return_type { body }. Captures copy ([x], [=]) or reference ([&x], [&]) surrounding variables. Header <algorithm> provides generic operations (sort, count_if, find_if, transform) that accept callables such as lambdas.',
  simple:'Often you need a tiny one-off function exactly where an algorithm asks for one — "sort by marks, descending", "count the passing scores". Writing a separate named function across the file is ceremony. A lambda is that function written inline at the call site. The square brackets are its backpack: list variables from around you that the lambda may peek into — captured by value (a snapshot copy) or by reference (a live link). Paired with <algorithm> workhorses — sort, find_if, count_if, transform — whole loops collapse into one honest line that states WHAT rather than HOW.',
  hing:'Lambda matlab bina naam ka chhota function, wahin likha jahan uski zaroorat hai. Sort ko apna rule dena ho — "marks ke hisaab se descending" — to lambda perfect hai. [] wale hisse ko capture kehte hain: bahar ke kaun se variables andar use honge. [=] matlab sabki copy (snapshot), [&] matlab sab reference se (live link). Zyada tar read-only kaam ke liye copy safe hai; jab bahar ka counter badalna ho to reference capture lagega. sort, count_if, find_if, transform jaise algorithms lambdas ke saath milkar pure loops ko ek line me badal dete hain.',
  why:'Algorithms + lambdas are the core modern C++ style: less loop bookkeeping to get wrong, intent stated at the call site, and implementations already optimised/debugged. Custom ordering and predicate queries become one-liners instead of comparator-class boilerplate (the pre-C++11 way).',
  when:'Use lambdas for short, local, once-used logic (comparators, predicates, callbacks). Promote to a named function when the logic grows, repeats, or deserves unit tests. Captures: prefer explicit lists over blanket [=]/[&] in large scopes.',
  syntax:'auto is_even = [](int n) { return n % 2 == 0; };\nint factor = 3;\nauto scaled = [factor](int n) { return n * factor; };  // by value\nauto bump = [&total](int n) { total += n; };           // by reference\nstd::sort(v.begin(), v.end(), [](int a, int b){ return a > b; });',
  comp:[['[] captures','Which outside variables are visible, and by copy or by reference'],['Comparator lambda','Returns true when first argument should precede second (strict weak ordering)'],['Predicate','Callable returning bool, consumed by _if algorithms']],
  ex:[
   {t:'Basic: lambdas as named mini-functions and captures',code:`#include <iostream>
int main() {
    auto square = [](int n) { return n * n; };
    std::cout << square(6) << "\\n";
    int factor = 10;
    auto scale = [factor](int n) { return n * factor; };
    factor = 100;
    std::cout << scale(5) << "\\n";
    int total = 0;
    auto add_to = [&total](int n) { total += n; };
    add_to(7);
    add_to(8);
    std::cout << total << "\\n";
    return 0;
}`,out:`36
50
15`,why:'scale captured factor BY VALUE, so it uses the snapshot 10 even though factor later became 100 (5*10=50). add_to captured total BY REFERENCE, so its += mutations accumulate in the outer variable (15).'},
   {t:'Intermediate: sorting and querying with algorithms',code:`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
struct Student { std::string name; int marks; };
int main() {
    std::vector<Student> cls{{"Aarav", 72}, {"Diya", 95}, {"Kabir", 58}, {"Meera", 95}};
    std::sort(cls.begin(), cls.end(), [](const Student& a, const Student& b) {
        if (a.marks != b.marks) return a.marks > b.marks;
        return a.name < b.name;
    });
    for (const auto& s : cls) std::cout << s.name << ":" << s.marks << " ";
    std::cout << "\\n";
    auto passed = std::count_if(cls.begin(), cls.end(),
                                [](const Student& s) { return s.marks >= 60; });
    std::cout << "passed=" << passed << "\\n";
    auto it = std::find_if(cls.begin(), cls.end(),
                           [](const Student& s) { return s.marks < 60; });
    std::cout << "first below 60: " << (it != cls.end() ? it->name : "none") << "\\n";
    return 0;
}`,out:`Diya:95 Meera:95 Aarav:72 Kabir:58 
passed=3
first below 60: Kabir`,why:'The comparator orders by marks descending with a name tie-break (making output deterministic). count_if and find_if take predicates; find_if returns an iterator that must be checked against end() before dereferencing — the same discipline as npos for strings.'},
   {t:'Advanced: transform + accumulate pipeline',code:`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
int main() {
    std::vector<int> prices{100, 250, 50, 400};
    std::vector<int> with_tax(prices.size());
    std::transform(prices.begin(), prices.end(), with_tax.begin(),
                   [](int p) { return p + p * 18 / 100; });
    for (int v : with_tax) std::cout << v << " ";
    std::cout << "\\n";
    int total = std::accumulate(with_tax.begin(), with_tax.end(), 0);
    std::cout << "total=" << total << "\\n";
    bool any_big = std::any_of(prices.begin(), prices.end(),
                               [](int p) { return p > 300; });
    std::cout << "any_big=" << any_big << "\\n";
    return 0;
}`,out:`118 295 59 472 
total=944
any_big=1`,why:'transform writes each mapped value into a pre-sized destination (note it does not grow the target — sizes must match or use a back_inserter). accumulate folds the range to one value; any_of short-circuits at the first price above 300.'}
  ],
  walk:[[3,'The lambda object square is created; it captures nothing, so it behaves like a plain function value.','square ready'],[6,'[factor] copies the CURRENT value 10 into the lambda\'s storage at creation time.','captures snapshot 10'],[7,'Reassigning factor to 100 later does not touch the stored copy, hence scale(5) still prints 50.','by-value isolation'],[10,'[&total] stores a reference, so add_to writes straight into the outer total.','by-reference aliasing']],
  walkWhy:'A lambda is a compiler-generated class with capture fields and an operator(). By-value fields are copies made at the definition point; by-reference fields remain live aliases — lifetimes must outlive the lambda.',
  rules:['Comparators for sort must define a strict weak ordering: return a < b style, never a <= b (undefined behaviour/crashes).','Dangling reference captures: a [&] lambda outliving its scope (e.g. stored/returned) is undefined behaviour.','std::transform needs the output range pre-sized (or std::back_inserter) — it never push_backs by itself.','Generic lambdas (auto parameters) are C++14+; mutable lambdas allow modifying by-value captures internally.'],
  mistakes:[
   {t:'Comparator using <= (or >=) breaks sort',bad:'std::sort(v.begin(), v.end(),\n          [](int a, int b) { return a <= b; });  // UB!',err:'Possible: segmentation fault / invalid comparator assertion in debug STL',why:'Sorting requires irreflexivity: comp(x, x) must be false. <= reports equal elements as "x before x", violating the algorithm\'s contract and potentially walking off internal ranges.',fix:'std::sort(v.begin(), v.end(),\n          [](int a, int b) { return a < b; });',tip:'Always phrase comparators as "a strictly precedes b" — use < or > on the key, then add explicit tie-breakers.'},
   {t:'Returning a lambda that captured locals by reference',bad:'auto make() {\n    int base = 5;\n    return [&base](int n) { return n + base; };  // base dies here\n}',why:'The capture is a reference to make()\'s stack frame; after return that frame is gone, so the lambda dereferences dead memory. It may even appear to work briefly.',fix:'auto make() {\n    int base = 5;\n    return [base](int n) { return n + base; };  // value capture',tip:'Long-lived/escaping lambdas: capture by value. Reference captures are for immediate, same-scope use.'}
  ],
  cmp:['Capture modes',['Capture','Stored as','Sees later changes?'],[['[x] by value','Copy made at definition','No (snapshot)'],['[&x] by reference','Alias to the variable','Yes (live)'],['[=] / [&] defaults','All used locals, per mode','Matches chosen mode'],['Risk profile','Stale snapshot confusion','Dangling if scope ends']]],
  diag:{kind:'flow',start:'Algorithm needs a rule',condition:'Rule used once & small?',trueAction:'Inline lambda with explicit captures',falseAction:'Name a real function/to test it',end:'Algorithm applies the callable'},
  apps:['Leaderboards sorted by score then name.','Counting/filtering records by business predicates (overdue, high-value, failing).','Event callbacks and GUI handlers registered as lambdas with captured context.'],
  quizzes:[{q:'int f = 2; auto g = [f](int n){ return n * f; }; f = 9; g(3) →',options:['27','6','Error','Undefined'],correct:1,why:'By-value capture froze the 2 at definition time, so 3 * 2 = 6.'},
            {q:'Which comparator is valid for std::sort descending ints?',options:['a >= b','a > b','a != b','return true'],correct:1,why:'Strict weak ordering demands comp(x,x)==false; > gives descending order legally.'}],
  take:['Capture snapshot ([x]) vs live alias ([&x]) is a deliberate, consequential choice.','sort comparators must be strict (< / >), with tie-breakers for stable, deterministic order.','Algorithm + lambda pairs (count_if, find_if, transform) replace most hand loops.'],
  rev:'[captures](params){body}. [=] copy all used, [&] reference all. sort needs strict <. find_if → check != end(). transform needs sized output.',
  assign:{p:'Given std::vector<int> nums{5, 12, 7, 20, 3, 12}; print count of values > 10 (3) and then the values sorted descending separated by spaces. Use count_if and sort with lambdas.',s:`#include <algorithm>
#include <iostream>
#include <vector>
int main() {
    std::vector<int> nums{5, 12, 7, 20, 3, 12};
    // TODO: count_if > 10, then sort descending and print
    return 0;
}`,sol:`#include <algorithm>
#include <iostream>
#include <vector>
int main() {
    std::vector<int> nums{5, 12, 7, 20, 3, 12};
    auto big = std::count_if(nums.begin(), nums.end(),
                             [](int n) { return n > 10; });
    std::cout << "big=" << big << "\\n";
    std::sort(nums.begin(), nums.end(),
              [](int a, int b) { return a > b; });
    for (int n : nums) std::cout << n << " ";
    std::cout << "\\n";
    return 0;
}`}
},
{
  id:'cpp-templates-basics', course_id:'cpp', unit_id:'cpp-unit-3', order_index:3,
  title:'Templates Basics: Generic Functions & Classes', desc:'Write code once against a type parameter T and let the compiler stamp out concrete versions.',
  obj:['Write function templates with deduced and explicit type arguments','Write a simple class template and instantiate it','Recognise template error realities and constraints by convention'],
  pre:['Functions & overloading','Classes','STL containers (they are templates)'],
  outcomes:['Learner creates type-parameterised utilities and understands compile-time instantiation'],
  def:'A template is a compile-time blueprint parameterised by types (or constants). When used, the compiler instantiates — generates — a concrete function or class by substituting the arguments, giving type-safe generic code with no runtime overhead. Function template arguments are usually deduced from call arguments.',
  simple:'Overloading made you hand-write max for int, then double, then string... A template is the photocopier master: write the logic ONCE with a placeholder type T, and the compiler prints a fresh, fully type-checked copy for every type you actually use. It is like a rubber stamp design — the design is written once, stamps appear on demand. You have used templates constantly: std::vector<int> and std::vector<string> are two stamps from one master. Because generation happens at compile time, errors for an unsupported type surface when you try that type, and the messages can be long (the famous template error wall) — read the first "required from here" line.',
  hing:'Template matlab ek master design jisme type ki jagah T placeholder hai. max(T a, T b) ek baar likho, compiler int, double, string — jiske liye call karoge uski alag type-safe copy (instantiation) bana dega. std::vector<int> aur vector<string> isi ek master ke stamps hain jo aap roz use karte ho! Function template ka T aam taur par arguments se khud pakad me aa jata hai (deduction). Ek catch: agar koi type required operation support nahi karta (jaise bina < wala type), error pakad me aata hai instantiation ke time, aur error messages lambe ho sakte hain — pehli 1-2 lines hi asli wajah batati hain.',
  why:'Generics eliminate copy-pasted duplicates while keeping full static type safety — the foundation of the STL (containers, algorithms), smart pointers and modern libraries. Understanding instantiation explains compile times, header-only libraries and the shape of library error messages.',
  when:'Templatize algorithms whose logic is genuinely type-independent (max, swap, containers, smart pointers). Avoid templates when only one or two types exist (an overload reads better) or when runtime polymorphism (virtual) fits heterogeneous collections.',
  syntax:'template <typename T>\nT maximum_value(T a, T b) { return (a > b) ? a : b; }\n\ntemplate <typename T>\nclass Box { T value; public: void set(T v) { value = v; } T get() const { return value; } };',
  comp:[['typename T','Type parameter placeholder substituted at instantiation'],['Deduction','Compiler infers T from function call arguments'],['Instantiation','A concrete copy compiled per distinct type actually used']],
  ex:[
   {t:'Basic: one maximum for many types',code:`#include <iostream>
#include <string>
template <typename T>
T maximum_value(T a, T b) {
    return (a > b) ? a : b;
}
int main() {
    std::cout << maximum_value(7, 12) << "\\n";
    std::cout << maximum_value(2.5, 1.25) << "\\n";
    std::cout << maximum_value(std::string{"apple"}, std::string{"mango"}) << "\\n";
    std::cout << maximum_value<char>('p', 'z') << "\\n";
    return 0;
}`,out:`12
2.5
mango
z`,why:'T is deduced per call: int, double, then std::string. String comparison is lexicographic: "apple" > "mango" is false, so the function returns the second argument, mango. The final call pins T explicitly with <char>, suppressing deduction.'},
   {t:'Intermediate: a class template',code:`#include <iostream>
#include <string>
template <typename T>
class Box {
    T value;
public:
    explicit Box(T v) : value(v) {}
    void set(T v) { value = v; }
    T get() const { return value; }
    bool equals(const Box& other) const { return value == other.value; }
};
int main() {
    Box<int> bi{42};
    Box<std::string> bs{std::string{"notes"}};
    bi.set(43);
    std::cout << bi.get() << " " << bs.get() << "\\n";
    std::cout << bi.equals(Box<int>{43}) << "\\n";
    return 0;
}`,out:`43 notes
1`,why:'Box<int> and Box<std::string> are two different concrete classes stamped from one master. equals demands T supports ==; the requirement is only checked for instantiations actually used.'},
   {t:'Advanced: non-type parameter + template swap',code:`#include <iostream>
template <typename T>
void swap_values(T& a, T& b) {
    T tmp = a;
    a = b;
    b = tmp;
}
template <typename T, int N>
int fixed_size(const T (&arr)[N]) {
    return N;
}
int main() {
    int x = 1, y = 2;
    swap_values(x, y);
    std::cout << x << "," << y << "\\n";
    double d[] = {1.5, 2.5, 3.5, 4.5};
    std::cout << "size=" << fixed_size(d) << "\\n";
    return 0;
}`,out:`2,1
size=4`,why:'Besides types, templates accept constant values: N is deduced as the array length 4 from the reference-to-array parameter, giving a compile-time size without sizeof tricks. std::swap in the library is essentially swap_values with move optimisation.'}
  ],
  walk:[[7,'maximum_value(7, 12) — both int literals, so T deduces to int and maximum_value<int> is instantiated once.','T = int'],[8,'The double call instantiates a second, independent function with T = double.','T = double'],[9,'Strings instantiate T = std::string; the > inside now means std::string\'s lexicographic operator>.','operator resolves per type'],[10,'Writing maximum_value<char> suppresses deduction and pins T explicitly.','explicit T = char']],
  walkWhy:'There is no single "generic" function at runtime — the compiler generated separate machine code per instantiated type, each as fast and type-checked as a hand-written overload.',
  rules:['Templates are normally defined in headers: the compiler needs the full definition visible at every instantiation site.','Function argument deduction ignores implicit conversions across parameters: maximum_value(2, 2.5) fails (int vs double) — pin T explicitly or cast.','Errors for a type appear only when THAT type instantiates the offending line (duck-typing at compile time).','Each distinct instantiation adds code size/compile time — stamp responsibly.'],
  mistakes:[
   {t:'Defining template functions in a .cpp like normal functions',bad:'// max.cpp (not included anywhere)\ntemplate <typename T> T maximum_value(T a, T b) { ... }',err:'undefined reference to maximum_value<int> at link time',why:'Instantiation needs the definition visible where the call occurs. A separate .cpp never sees the call sites, so no concrete function is ever generated for the linker to find.',fix:'// max.h — full definition in the header\ntemplate <typename T> T maximum_value(T a, T b) { return (a > b) ? a : b; }',tip:'Header-only is the default shape for templates; explicit instantiation in .cpp is an advanced exception.'},
   {t:'Mixed-type call expecting silent conversion',bad:'maximum_value(3, 4.5);  // T = int AND double?',err:"error: deduced conflicting types for parameter 'T' ('int' and 'double')",why:'Deduction must agree on ONE T from all parameters of that type. The compiler will not quietly convert 3 to double the way a plain double parameter would.',fix:'maximum_value<double>(3, 4.5);\n// or maximum_value(3.0, 4.5);',tip:'Pin T explicitly (maximum_value<double>) whenever argument types slightly differ.'}
  ],
  cmp:['Templates vs overloading',['Aspect','Overload per type','Template'],[['Code written','Once per type, by hand','Once, parameterised by T'],['Type safety','Full','Full (per instantiation)'],['New type support','Write another function','Automatic if operations exist'],['Errors for bad type','At that function\'s definition','At instantiation of that type']]],
  diag:{kind:'flow',start:'Call with concrete types',condition:'T deduced/agreed?',trueAction:'Compiler stamps concrete function/class',falseAction:'Deduction error — pin T explicitly',end:'Type-safe code, zero runtime overhead'},
  apps:['std::vector, std::map, std::sort — the whole STL is templates.','Type-safe containers/optional/expected wrappers in modern libraries.','Numeric kernels instantiated for float/double/int from one verified implementation.'],
  quizzes:[{q:'Why do template definitions normally live in headers?',options:['Style only','Instantiation needs the definition visible at each call site','Linkers dislike templates','Headers compile faster'],correct:1,why:'The compiler generates code where the template is used, so the body must be visible there.'},
            {q:'maximum_value(3, 4.5) with template <typename T> T maximum_value(T, T)…',options:['Returns 4.5','Returns 4','Fails: T deduced as both int and double','Returns 3'],correct:2,why:'Both parameters must deduce the same T; pinning maximum_value<double>(3, 4.5) fixes it.'}],
  take:['Templates are compile-time stamps: one blueprint, concrete code per used type.','Keep definitions in headers; expect deduction to require consistent types.','You already depend on templates daily via vector/map/algorithms.'],
  rev:'template<typename T>: T deduced or pinned <...>. Code generated per type at compile time, definitions in headers, no runtime cost.',
  assign:{p:'Write a function template triple(T) returning value*3 only if T supports *, use it for int 4 and double 1.5 printing 12 and 4.5 (each on its own line). Then also print triple for -2 → -6.',s:`#include <iostream>
// TODO: template triple + three calls
int main() { return 0; }`,sol:`#include <iostream>
template <typename T>
T triple(T value) {
    return value * 3;
}
int main() {
    std::cout << triple(4) << "\\n";
    std::cout << triple(1.5) << "\\n";
    std::cout << triple(-2) << "\\n";
    return 0;
}`}
},
{
  id:'cpp-smart-pointers', course_id:'cpp', unit_id:'cpp-unit-4', order_index:1,
  title:'Smart Pointers: unique_ptr & shared_ptr Ownership', desc:'Automate heap lifetimes with unique ownership by default and shared ownership only when needed.',
  obj:['Create and use std::unique_ptr with make_unique; move ownership explicitly','Share ownership with shared_ptr and read use_count','Choose between unique/shared/raw observer pointers'],
  pre:['Dynamic memory','Copy & move semantics','Classes/constructors-destructors'],
  outcomes:['Learner manages heap objects without manual delete, and can justify pointer choice'],
  def:'Smart pointers are RAII class templates that own a heap object and delete it automatically at scope exit. std::unique_ptr enforces a sole owner (move-only), while std::shared_ptr permits shared ownership tracked by a reference count, deleting the object when the count reaches zero.',
  simple:'A raw new hands you a puppy with no instructions: forget delete and it leaks; delete twice and you crash. Smart pointers attach the instruction to the leash itself. unique_ptr says "exactly one owner" — like a single house key that can be handed over (moved) but never photocopied; when the owner goes out of scope, the object is deleted, guaranteed. shared_ptr is joint ownership with a counter on the door: every new co-owner bumps the count, each departure lowers it, and the last one out deletes. Most code needs unique ownership; sharing is for graphs/caches where lifetime is genuinely communal. Create them with make_unique/make_shared, not raw new.',
  hing:'Raw new/delete me ek bhool = leak ya double-free crash. Smart pointer ownership ko type me likh deta hai. unique_ptr matlab ek hi malik: copy banana hi mana hai (compiler rokeyga), ownership sirf std::move se dusre ko SAUNP sakte ho, aur scope Khatm hote hi delete pakka. shared_ptr joint ownership hai: andar ek counter (use_count) chal rahi hai, jitne malik utna count, aur aakhri malik ke jaate hi object delete. Rule simple hai: default unique_ptr chalao, shared tabhi jab sach me communal lifetime hai. Banane ke liye make_unique/make_shared hi use karna — new haath se nahi.',
  why:'Manual delete pairing is unmaintainable in the presence of exceptions, early returns and multiple exit paths. RAII ownership makes leaks structurally impossible and documents lifetime policies in function signatures (taking unique_ptr by value = "I consume this").',
  when:'Default: values/stack objects. Heap with single owner: unique_ptr. Genuinely shared lifetime (observers inventories, caches): shared_ptr + weak_ptr for non-owning views. Raw pointers only as non-owning, short-lived observers.',
  syntax:'auto p = std::make_unique<Wallet>(500);   // sole owner\nuse(*p);               // observe, do not delete\ntake(std::move(p));    // hand over ownership (p now null)\nauto s = std::make_shared<Node>(7);\nauto s2 = s;           // count = 2',
  comp:[['make_unique/make_shared','Preferred factories: exception-safe and concise'],['Move-only unique_ptr','Copying is a compile error; transfer with std::move'],['use_count','Shared owners currently alive; useful diagnostically']],
  ex:[
   {t:'Basic: unique_ptr lifetime without delete',code:`#include <iostream>
#include <memory>
struct Wallet {
    int rupees;
    explicit Wallet(int r) : rupees(r) { std::cout << "wallet created\\n"; }
    ~Wallet() { std::cout << "wallet destroyed\\n"; }
};
int main() {
    {
        auto w = std::make_unique<Wallet>(500);
        std::cout << "balance=" << w->rupees << "\\n";
        w->rupees += 250;
        std::cout << "balance=" << w->rupees << "\\n";
    }
    std::cout << "scope over\\n";
    return 0;
}`,out:`wallet created
balance=500
balance=750
wallet destroyed
scope over`,why:'No delete anywhere: when w leaves its block, unique_ptr\'s destructor deletes the Wallet automatically, printing destroyed BEFORE "scope over". Arrow access works exactly like a raw pointer.'},
   {t:'Intermediate: transferring unique ownership',code:`#include <iostream>
#include <memory>
struct Doc {
    int pages;
    explicit Doc(int p) : pages(p) {}
};
void archive(std::unique_ptr<Doc> owned) {
    std::cout << "archived pages=" << owned->pages << "\\n";
}
int main() {
    auto d = std::make_unique<Doc>(12);
    std::cout << "before move: " << (d != nullptr) << "\\n";
    archive(std::move(d));
    std::cout << "after move empty: " << (d == nullptr) << "\\n";
    return 0;
}`,out:`before move: 1
archived pages=12
after move empty: 1`,why:'archive takes unique_ptr BY VALUE, advertising that it consumes ownership. std::move is required (a plain archive(d) would try to copy and fail to compile); afterwards d is null and the parameter\'s destruction at function end deletes the Doc.'},
   {t:'Advanced: shared ownership count lifecycle',code:`#include <iostream>
#include <memory>
struct Node {
    int id;
    explicit Node(int i) : id(i) { std::cout << "node " << id << " born\\n"; }
    ~Node() { std::cout << "node " << id << " freed\\n"; }
};
int main() {
    auto a = std::make_shared<Node>(7);
    std::cout << "count=" << a.use_count() << "\\n";
    {
        auto b = a;
        auto c = a;
        std::cout << "count=" << a.use_count() << " id=" << c->id << "\\n";
    }
    std::cout << "count=" << a.use_count() << "\\n";
    return 0;
}`,out:`node 7 born
count=1
count=3 id=7
count=1
node 7 freed`,why:'Copying shared_ptr splits ownership without copying the Node: count peaks at 3, drops as inner copies die, and the object is freed only when the last owner (a) goes out of scope at main end.'}
  ],
  walk:[[10,'make_unique allocates the Wallet on the heap and arms the unique_ptr destructor as its lifetime guard.','1 owner, object alive'],[11,'Member access through -> behaves exactly like a raw pointer, but ownership stays singular.','balance=500'],[14,'Block exit destroys w (RAII), which deletes the Wallet before the next statement runs.','destroyed printed'],[15,'"scope over" appears after destruction — cleanup is scope-driven, not manual bookkeeping.','deterministic teardown']],
  walkWhy:'Ownership tied to scope gives deterministic cleanup on ALL paths (return, break, exception) — the property manual delete can never guarantee.',
  rules:['unique_ptr cannot be copied; attempt = compile error by design. Move it or re-architect the ownership.','Never delete the raw pointer from .get() — ownership stays with the smart pointer; .get() is an observing borrow.','Never create two smart pointers from the same raw new (double ownership → double delete).','shared_ptr cycles (A owns B owns A) never reach zero and leak; break cycles with weak_ptr.'],
  mistakes:[
   {t:'Trying to copy a unique_ptr',bad:'auto a = std::make_unique<int>(5);\nauto b = a;   // compile error',err:'error: use of deleted function (unique_ptr copy constructor)',why:'Exclusive ownership is enforced by deleting the copy operations. If a copy compiled, two pointers would delete the same object — the type makes that bug unrepresentable.',fix:'auto b = std::move(a);  // transfer (a becomes null)\n// if two owners are truly required, use std::shared_ptr',tip:'Treat the error as a design question: who should own this, and who merely observes (raw pointer/reference observer)?'},
   {t:'Shared reference cycle leaking memory',bad:'struct Node { std::shared_ptr<Node> next; };\n// a->next = b; b->next = a;  counts never reach 0',why:'Each object keeps the other\'s count at 1 forever even after all external handles die. Reference counting cannot collect cycles.',fix:'struct Node { std::weak_ptr<Node> parent; std::shared_ptr<Node> child; };\n// weak links observe without owning',tip:'Parent owns children via shared_ptr; children point back with weak_ptr (lock() to use safely).'}
  ],
  cmp:['unique_ptr vs shared_ptr',['Aspect','unique_ptr','shared_ptr'],[['Owners','Exactly one (move-only)','Many (reference counted)'],['Cost','Zero overhead vs raw pointer','Control block + atomic count'],['Default choice','Yes — start here','Only for genuinely shared lifetime'],['Copy syntax','auto b = std::move(a)','auto b = a (count++)']]],
  diag:{kind:'flow',start:'Heap object needed',condition:'Shared lifetime truly required?',falseAction:'unique_ptr (default)',trueAction:'shared_ptr (+ weak observers)',end:'Scope exit deletes deterministically'},
  apps:['Factory functions returning std::make_unique<Shape> for polymorphic objects.','Scene graphs/caches sharing textures via shared_ptr while weak_ptr observers watch.','Replacing every owning raw new/delete pair in legacy cleanup-heavy code.'],
  quizzes:[{q:'After archive(std::move(d)); what is true of d?',options:['Still owns the Doc','Is nullptr; ownership moved into the parameter','Compiles only in debug','Doc already deleted before the call'],correct:1,why:'Move construction of the by-value parameter pilfers the pointer, leaving the source null.'},
            {q:'a is the sole shared_ptr (count 1). Inside a block: auto b = a; — inside count is…',options:['1','2','3','0'],correct:1,why:'Copying a shared_ptr adds an owner: a and b make the count 2 until b is destroyed.'}],
  take:['unique_ptr by default: single owner, move-only, zero overhead.','make_unique/make_shared — avoid raw new in application code.','shared_ptr counts owners; cycles leak unless weak_ptr breaks them.'],
  rev:'unique = one owner, std::move transfer, source null. shared = counted owners, last out deletes. get() observe only. Break cycles with weak_ptr.',
  assign:{p:'Create struct Meter {int reading;} with ctor/destructor printing nothing. In main: make_unique<Meter>(42), print its reading, std::move it to another unique_ptr variable named moved, print (original == nullptr) then moved->reading. Expected:\n42\n1\n42',s:`#include <iostream>
#include <memory>
struct Meter { int reading; explicit Meter(int r) : reading(r) {} };
// TODO: create, print, move, print null check + moved value
int main() { return 0; }`,sol:`#include <iostream>
#include <memory>
struct Meter { int reading; explicit Meter(int r) : reading(r) {} };
int main() {
    auto m = std::make_unique<Meter>(42);
    std::cout << m->reading << "\\n";
    auto moved = std::move(m);
    std::cout << (m == nullptr) << "\\n";
    std::cout << moved->reading << "\\n";
    return 0;
}`}
},
{
  id:'cpp-exception-handling', course_id:'cpp', unit_id:'cpp-unit-4', order_index:2,
  title:'Exception Handling in C++: throw, try & catch', desc:'Signal failures with exceptions, catch them by const reference, and lean on RAII during stack unwinding.',
  obj:['Throw standard exceptions with meaningful messages','Catch by const reference and order handlers correctly','Explain stack unwinding and why RAII (not manual cleanup) pairs with exceptions'],
  pre:['Classes & destructors','Functions','std::string (stoi throws)'],
  outcomes:['Learner can design error reporting that cannot be silently ignored like error codes'],
  def:'An exception is an object thrown (throw) when a function cannot fulfil its contract, unwinding the call stack — running destructors of fully-constructed local objects — until a matching catch handler is found. Handlers should catch by const reference to avoid copies and slicing.',
  simple:'Error codes are easy to forget: call a function, ignore its return, and everything downstream is poisoned quietly. Exceptions cannot be silently ignored — throwing an error object acts like a fire alarm that keeps rising through your function calls until someone who wrote a catch block handles it (or the program stops and reports it, still loudly). As the alarm rises, C++ politely cleans each floor: local objects\' destructors run, files close, memory frees — that cleanup contract is called stack unwinding, and it is why RAII (objects owning resources) and exceptions are inseparable partners in C++.',
  hing:'Exception matlab "ye kaam main nahi kar sakta" ki ghoshna jo aap nazar-andaaz nahi kar sakte. throw karte hi execution wahi rukta hai aur call stack upar ki taraf khulta hai (stack unwinding) — raaste me har local object ka destructor chalta hai, matlab files/memory auto saaf (yahi RAII ka kamaal hai). Jahan matching catch mile wahan rukta hai. Catch hamesha const& se karo — value se pakadne par copy banti hai aur derived type ki details kat jati hain (slicing). Specific exception pehle catch karo, base class (std::exception) ko aakhri me. Aur destructor ke andar se kabhi throw mat karna!',
  why:'Constructors cannot return error codes, operators have fixed signatures, and deep library calls cannot thread status through every layer. Exceptions separate the success path from error handling while guaranteeing RAII cleanup — the backbone of std::stoi, vector::at, file streams with exceptions enabled, and allocation failure (bad_alloc).',
  when:'Throw for contract violations and unrecoverable local conditions (invalid argument, parse failure, missing resource). Use std::out_of_range/invalid_argument/runtime_error from <stdexcept>. Expected, frequent alternatives (key not found in a hot loop) often suit return values/optional better.',
  syntax:'double divide(double a, double b) {\n    if (b == 0) throw std::invalid_argument("divisor is zero");\n    return a / b;\n}\ntry { divide(1, 0); }\ncatch (const std::invalid_argument& e) { std::cerr << e.what(); }\ncatch (const std::exception& e) { /* fallback */ }',
  comp:[['throw expr','Creates/copies the exception object and starts unwinding'],['catch (const T& e)','Reference catch: no copy, no slicing, polymorphic what()'],['Unwinding + RAII','Local destructors run on the way up — resources release themselves']],
  ex:[
   {t:'Basic: throwing and catching invalid input',code:`#include <iostream>
#include <stdexcept>
double divide(double a, double b) {
    if (b == 0) throw std::invalid_argument("divisor is zero");
    return a / b;
}
int main() {
    std::cout << divide(10, 4) << "\\n";
    try {
        std::cout << divide(5, 0) << "\\n";
        std::cout << "unreached\\n";
    } catch (const std::invalid_argument& e) {
        std::cout << "caught: " << e.what() << "\\n";
    }
    std::cout << "program continues\\n";
    return 0;
}`,out:`2.5
caught: divisor is zero
program continues`,why:'The throw jumps straight out of divide and out of the try block (hence "unreached" never prints), lands in the matching catch, and execution resumes after the handler — the process survives with a precise reason via what().'},
   {t:'Intermediate: library exceptions and handler ordering',code:`#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
int main() {
    std::vector<int> v{10, 20};
    try {
        std::cout << v.at(5) << "\\n";
    } catch (const std::out_of_range& e) {
        std::cout << "range problem caught\\n";
    } catch (const std::exception& e) {
        std::cout << "generic: " << e.what() << "\\n";
    }
    try {
        int n = std::stoi("abc");
        std::cout << n << "\\n";
    } catch (const std::invalid_argument& e) {
        std::cout << "parse failed\\n";
    }
    return 0;
}`,out:`range problem caught
parse failed`,why:'vector::at throws out_of_range (unlike unchecked []), and stoi throws invalid_argument on non-numeric text. The derived-type handler is listed first because handlers match top-down — a base std::exception placed first would swallow everything and mark the specific handler unreachable.'},
   {t:'Advanced: unwinding runs destructors (RAII in action)',code:`#include <iostream>
#include <stdexcept>
struct Guard {
    const char* name;
    explicit Guard(const char* n) : name(n) { std::cout << "open " << name << "\\n"; }
    ~Guard() { std::cout << "close " << name << "\\n"; }
};
void risky() {
    Guard g{"db-conn"};
    throw std::runtime_error("network down");
}
int main() {
    try {
        risky();
    } catch (const std::exception& e) {
        std::cout << "caught: " << e.what() << "\\n";
    }
    return 0;
}`,out:`open db-conn
close db-conn
caught: network down`,why:'The throw unwinds out of risky(), but not before Guard\'s destructor runs — resources tied to object lifetimes (connections, locks, files, smart pointers) release themselves on every failing path automatically.'}
  ],
  walk:[[10,'divide(5, 0) detects the violation and throws an invalid_argument object carrying the message.','throw!'],[11,'The rest of the try block is skipped; unwinding begins, looking for a handler.','"unreached" skipped'],[13,'The first handler whose type matches (exactly or by base) wins: invalid_argument binds to the const&.','caught: divisor is zero'],[15,'After the catch completes, normal flow resumes with the statement after the try/catch construct.','program continues']],
  walkWhy:'Exceptions are a second, typed return channel that cannot be ignored; destructors during unwinding keep the program\'s invariants intact along that channel.',
  rules:['Catch exceptions by const reference; catching by value slices derived objects and copies needlessly.','Order handlers most-derived first; a preceding base-class catch hides them (compilers warn).','Destructors must never emit exceptions (implicitly noexcept) — throwing during unwinding calls std::terminate.','throw; (bare) rethrows the current exception without slicing; do not throw e; from a handler parameter copy.'],
  mistakes:[
   {t:'Catching by value and slicing the exception',bad:'catch (std::exception e) { std::cout << e.what(); }',why:'The caught object is copied into a std::exception slice: derived overrides/state are lost, what() may return a generic message, and polymorphic behaviour disappears — debugging loses precisely the useful parts.',fix:'catch (const std::exception& e) { std::cout << e.what(); }',tip:'The idiom is fixed: catch (const TYPE& e). Zero exceptions to this rule in normal code.'},
   {t:'Manual cleanup that exceptions bypass',bad:'int* buf = new int[100];\nmay_throw();          // throws → delete never runs → leak\ndelete[] buf;',why:'Any throw between acquisition and manual release leaps over the release line. The code looks paired but is only paired on the success path.',fix:'std::vector<int> buf(100);   // or unique_ptr<int[]>\nmay_throw();                 // destructor frees during unwind',tip:'If you type new and delete yourself, ask what a throw between them does — then let RAII answer it.'}
  ],
  cmp:['Exceptions vs error-code returns',['Aspect','Exceptions','Error codes'],[['Can be ignored','No — must catch or terminate','Yes — unchecked returns are common'],['Constructor failure','Natural (throw)','Impossible to signal via return'],['Success-path clutter','Minimal','Every call site checks'],['Cleanup guarantee','RAII destructors during unwind','Programmer must free on each path']]],
  diag:{kind:'flow',start:'throw error object',condition:'Matching catch upstream?',trueAction:'Handler runs; resume after block',falseAction:'std::terminate after full unwind',end:'Destructors cleaned every frame'},
  apps:['std::stoi throwing on bad user numbers instead of returning 0 lies.','vector::at bounds failures reported as out_of_range (vs silent UB with []).','Scope guards/unique_ptr ensure partial work rolls back safely when later steps throw.'],
  quizzes:[{q:'Why catch by const std::exception& instead of by value?',options:['Value catch is illegal','Avoids copying and object slicing; keeps derived what()','References are faster to type','what() needs const'],correct:1,why:'By-value catching slices the exception to the base type, losing derived detail; const& preserves the real object polymorphically.'},
            {q:'Handlers listed: catch (const std::exception&) BEFORE catch (const std::out_of_range&). Effect?',options:['Both run','out_of_range handler is unreachable for out_of_range throws','Compile error always','Second overrides first'],correct:1,why:'Handlers are tried in order and the base matches derived types, so the generic handler swallows them first (compilers warn about this).'}],
  take:['throw for contract violations; catch by const&, derived handlers first.','Unwinding + RAII is the cleanup model — pair every resource with an object.','Library types (stdexcept) give precise, standardised failure vocabulary.'],
  rev:'throw std::runtime_error("why"). catch (const T& e) specific→generic. Unwind runs destructors. Never throw in destructors.',
  assign:{p:'Write int get_age(int age) that returns age when 0<=age<=120 else throws std::out_of_range("age out of range"). In main, print get_age(30), then in try/catch print "rejected: age out of range" for get_age(200). Expected:\n30\nrejected: age out of range',s:`#include <iostream>
#include <stdexcept>
// TODO: get_age + try/catch demo
int main() { return 0; }`,sol:`#include <iostream>
#include <stdexcept>
int get_age(int age) {
    if (age < 0 || age > 120) throw std::out_of_range("age out of range");
    return age;
}
int main() {
    std::cout << get_age(30) << "\\n";
    try {
        std::cout << get_age(200) << "\\n";
    } catch (const std::out_of_range& e) {
        std::cout << "rejected: " << e.what() << "\\n";
    }
    return 0;
}`}
},
{
  id:'cpp-file-streams', course_id:'cpp', unit_id:'cpp-unit-4', order_index:3,
  title:'File Streams: Reading & Writing with fstream', desc:'Persist data with ofstream/ifstream, check stream state, and parse line-based records.',
  obj:['Write formatted text with std::ofstream and read it back with ifstream','Check stream success (is_open/bool state) before trusting data','Use getline loops and stringstream parsing for records'],
  pre:['cin/cout streams','std::string in depth','Classes/RAII'],
  outcomes:['Learner can store and reload simple record files robustly'],
  def:'std::ofstream/std::ifstream are RAII stream classes bound to files: construction opens, destruction closes. Insertion/extraction operators format values; explicit state checks (is_open, operator bool, fail) detect errors. std::getline(stream, string) reads whole lines, and std::stringstream parses fields in memory.',
  simple:'File streams are cin/cout\'s cousins: an ofstream is a tap INTO a file instead of the screen, an ifstream a tap out of a file instead of the keyboard — the << and >> operators you know keep working. Open a file by constructing the stream (ofstream out{"data.txt"}) and RAII closes it when the stream object dies. The doorway trap: opening can fail (wrong path, permissions), and a failed stream silently swallows output or yields nothing — always verify with if (!out) before celebrating. For reading, prefer line-by-line getline and split fields with stringstream rather than juggling >> whitespace surprises.',
  hing:'fstream cin/cout ka file-version hai: ofstream me << lagate hi data file me jata hai, ifstream me >> lagate hi file se data aata hai. Stream bante hi file khulti hai, object khatm hote hi band (RAII). Par kholna fail bhi ho sakta hai — galat path, permission — aur fail stream chup-chaap kuch nahi karegi! Isliye is_open() ya if(!out) check karna kabhi mat bhoolna. Padhte samay while (std::getline(in, line)) sabse safe pattern hai: line uthao, phir stringstream se uske tukde (naam, number) nikaalo. EOF par loop khud rukta hai — while(!in.eof()) wala purana pattern galti ka ghar hai.',
  why:'Persistence with files guards settings, scores, logs and data interchange (CSV-ish text). Stream state discipline is the difference between "saved!" and a phantom success message over an empty file that never opened.',
  when:'Use ofstream (default truncates; std::ios::app to append) for generated reports/logs, ifstream+getline for line records, and stringstream for field parsing. For binary data use binary mode + read/write; for rich formats, use real parsers/libraries.',
  syntax:'std::ofstream out{"report.txt"};\nif (!out) { /* open failed */ }\nout << "name," << score << "\\n";\n\nstd::ifstream in{"report.txt"};\nstd::string line;\nwhile (std::getline(in, line)) { /* process */ }',
  comp:[['ofstream / ifstream','Output (create/truncate) and input file streams'],['Stream state','Tested with if (!s) / is_open(); failed reads set failbit/eofbit'],['stringstream','In-memory stream for splitting a line into typed fields']],
  ex:[
   {t:'Basic: write, verify, read back a whole file',code:`#include <fstream>
#include <iostream>
#include <string>
int main() {
    {
        std::ofstream out{"greeting.txt"};
        if (!out) { std::cout << "open failed\\n"; return 1; }
        out << "Hello, file world!\\n";
        out << "Line two\\n";
    }
    std::ifstream in{"greeting.txt"};
    std::string line;
    while (std::getline(in, line)) {
        std::cout << "read: " << line << "\\n";
    }
    return 0;
}`,out:`read: Hello, file world!
read: Line two`,why:'The inner block scope-closes/flushes the ofstream before reading begins — a clean hand-off. The state check converts a failed open into an explicit branch instead of silently writing nowhere.'},
   {t:'Intermediate: appending log entries',code:`#include <fstream>
#include <iostream>
#include <string>
int main() {
    {
        std::ofstream out{"log.txt"};
        out << "boot\\n";
    }
    {
        std::ofstream out{"log.txt", std::ios::app};
        out << "login diya\\n";
        out << "logout diya\\n";
    }
    std::ifstream in{"log.txt"};
    std::string line;
    int count = 0;
    while (std::getline(in, line)) { ++count; }
    std::cout << "entries=" << count << "\\n";
    return 0;
}`,out:`entries=3`,why:'Default ofstream would have truncated at the second open leaving 2 entries; std::ios::app preserves earlier content, so all 3 lines survive — the mode flag is the entire difference.'},
   {t:'Advanced: parsing CSV-ish records with stringstream',code:`#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
int main() {
    {
        std::ofstream out{"marks.txt"};
        out << "Aarav 85\\n";
        out << "Diya 92\\n";
        out << "Kabir 78\\n";
    }
    std::ifstream in{"marks.txt"};
    std::string line;
    int total = 0, students = 0;
    while (std::getline(in, line)) {
        std::stringstream ss(line);
        std::string name;
        int score = 0;
        if (ss >> name >> score) {
            total += score;
            ++students;
        }
    }
    std::cout << "students=" << students << " average=" << (total / students) << "\\n";
    return 0;
}`,out:`students=3 average=85`,why:'Each line is parsed independently with its own stringstream; the if (ss >> ...) guard skips blank/malformed lines instead of corrupting totals. 255/3 prints 85 as integer division — cast to double if fractions matter.'}
  ],
  walk:[[6,'ofstream construction opens greeting.txt, truncating any previous content.','file open for writing'],[7,'The !out check confirms the stream is usable before a single byte is trusted to it.','state verified'],[10,'Block exit destroys out: buffered text flushes and the OS file handle closes (RAII).','written + closed'],[13,'getline returns the stream each round; its boolean conversion stays true until EOF/failure, ending the loop exactly after the last line.','clean EOF handling']],
  walkWhy:'Every stage pairs action with state verification — open check, getline-as-condition, field-parse check — which is the reusable skeleton for all file code.',
  rules:['Default ofstream truncates at open (even before any write); pass std::ios::app when history must survive.','Never use while (!stream.eof()): eofbit sets only AFTER a failed read, yielding a duplicated/garbage final iteration — loop on the read itself.','ifstream >> skips whitespace and stops at spaces; use getline for spaces-embedded text.','Flush/close (scope exit or .close()) a writer before opening the same path for reading.'],
  mistakes:[
   {t:'The while(!eof()) ghost iteration',bad:'while (!in.eof()) {\n    std::getline(in, line);\n    process(line);  // last line processed twice/garbled\n}',why:'eof() reports whether the PREVIOUS read hit the end. After the final genuine line, eof is still false, so the loop runs once more; getline fails, leaving line unchanged/empty, and process acts on phantom data.',fix:'while (std::getline(in, line)) {\n    process(line);\n}',tip:'Put the read in the condition — for >> too: while (in >> x). One idiom, zero ghosts.'},
   {t:'Assuming the file opened successfully',bad:'std::ofstream out{"/no/such/dir/report.txt"};\nout << "totals...\\n";\nstd::cout << "saved!\\n";  // lies: nothing was written',why:'A failed open puts the stream in a failed state where << becomes a no-op, yet the program cheerfully reports success. The data loss remains invisible until someone looks for the file.',fix:'if (!out) { std::cout << "cannot open report\\n"; return 1; }\nout << "totals...\\n";',tip:'Check every open immediately; consider enabling exceptions(out.exceptions(std::ios::failbit)) in code that prefers throw-based errors.'}
  ],
  cmp:['>> extraction vs getline',['Aspect','in >> token','std::getline(in, line)'],[['Reads','One whitespace-delimited token','Entire line incl. spaces'],['Leading whitespace','Skipped automatically','Preserved'],['Leftover newline','Left in stream (trips next getline)','Consumed as the delimiter'],['Best for','Numbers, simple fields','Names, sentences, records']]],
  diag:{kind:'flow',start:'Construct stream on path',condition:'Open succeeded (!s check)?',trueAction:'Write/loop reads on state',falseAction:'Report failure, bail out',end:'Scope exit closes the file'},
  apps:['Exporting marks/attendance reports that other tools (spreadsheets) consume.','Append-only application logs surviving across runs.','Loading configuration records at startup with robust skip-on-error parsing.'],
  quizzes:[{q:'What does opening an existing file with plain std::ofstream out{"f.txt"}; do to its contents?',options:['Appends','Truncates to empty at open','Fails if exists','Opens read-only'],correct:1,why:'The default mode is truncate; std::ios::app is required to append.'},
            {q:'Why is while (std::getline(in, line)) preferred over while (!in.eof())?',options:['getline is faster','eof is only set after a failed read, causing one bogus final iteration','eof() throws','No difference'],correct:1,why:'The eof flag lags one read behind, so eof-checked loops mis-process the last chunk.'}],
  take:['Always state-check streams right after opening.','Loop on the read operation itself (getline / >>), never on eof().','ofstream truncates by default; appending needs std::ios::app; RAII closes for you.'],
  rev:'ofstream << writes (truncate default, app appends); ifstream + getline reads. Check if(!s) after open. Loop on the read, not eof.',
  assign:{p:'Write numbers 1..5 each on its own line to nums.txt, read them back with a getline/stoi loop accumulating a sum, and print sum=15. Check the writer opened successfully.',s:`#include <fstream>
#include <iostream>
#include <string>
// TODO: write 1..5 lines, read back, sum, print sum=15
int main() { return 0; }`,sol:`#include <fstream>
#include <iostream>
#include <string>
int main() {
    {
        std::ofstream out{"nums.txt"};
        if (!out) { std::cout << "open failed\\n"; return 1; }
        for (int i = 1; i <= 5; ++i) out << i << "\\n";
    }
    std::ifstream in{"nums.txt"};
    std::string line;
    int sum = 0;
    while (std::getline(in, line)) {
        sum += std::stoi(line);
    }
    std::cout << "sum=" << sum << "\\n";
    return 0;
}`}
},
];

module.exports = { topics: makeTopics(specs) };
