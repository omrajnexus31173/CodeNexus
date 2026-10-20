'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'java-variables-operators', walkEx:2, course_id:'java', unit_id:'java-unit-1', order_index:2,
  title:'Variables, Primitive Types & Operators in Java', desc:'Declare the eight primitive types, convert between them safely, and evaluate Java operators.',
  obj:['Use Java primitive types with correct ranges and literal suffixes','Distinguish widening conversions from narrowing casts','Evaluate arithmetic, logical and ternary expressions (including integer division)'],
  pre:['Java architecture & JVM (previous topic)','Basic program structure (class, main)'],
  outcomes:['Learner writes type-safe Java expressions and predicts conversion outcomes'],
  def:'Java is statically typed: every variable has a declared type checked at compile time. The eight primitive types (byte, short, int, long, float, double, char, boolean) store values directly; all other types are references. Widening conversions (int → long → double) are implicit; narrowing requires an explicit cast and may lose data.',
  simple:'Think of Java types like labelled jars of fixed sizes. An int jar holds whole numbers up to about 2.1 billion; a long jar is bigger; double holds decimals; boolean holds only true/false. Java is strict about which jar you use: the label is written at declaration and checked forever. Pouring a small jar into a bigger one (widening) is automatic and safe; squeezing a big jar into a small one needs your explicit permission called a cast, because some contents may spill (3.9 becomes 3). Integer division also drops the fraction: 7/2 is 3 in int-land, which surprises everyone exactly once.',
  hing:'Java me har variable ka type pehle se tay hota hai — int pura number, double decimal wala, boolean sirf true/false. Type ek label-wala dibba hai: int dibbe me lagbhag 2.1 billion tak ki value aayegi, long usse bada dibba. Chhote type ko bade me daalna (widening) automatic hai, lekin bade ko chhote me daalna (narrowing) ke liye cast likhna padega, jaise (int) 3.9 = 3 — fraction gir jata hai! Sabse common surprise: 7/2 int me 3 hota hai, 3.5 nahi. Decimal chahiye to 7.0/2 ya cast use karo. long literal ke peeche L aur float ke peeche f lagana mat bhoolna, warna compiler error dega.',
  why:'Choosing correct primitive types and conversions underpins all numeric code (money, counts, timestamps). The widening/narrowing rules and integer division behaviour account for a large share of beginner Java calculation bugs.',
  when:'Use int for ordinary integers, long for values beyond ±2.1 billion or epoch millis, double for decimals, and NEVER float/double for currency precision (use BigDecimal or integer minor units). Cast only when you have proven the value fits.',
  syntax:'int count = 42;\nlong population = 8_000_000_000L;\ndouble ratio = 7.0 / 2;      // 3.5\nint truncated = (int) 3.9;    // 3 (narrowing cast)\nboolean passed = marks >= 40;',
  comp:[['Primitive types','byte/short/int/long, float/double, char, boolean — values, not objects'],['Widening','Automatic safe conversion toward bigger types'],['Cast (type)','Explicit narrowing; truncation/overflow is your responsibility']],
  ex:[
   {t:'Basic: declarations, sizes and literals',code:`public class Main {
    public static void main(String[] args) {
        int students = 45;
        long worldPopulation = 8_000_000_000L;
        double pi = 3.14159;
        char grade = 'A';
        boolean passed = true;
        System.out.println(students);
        System.out.println(worldPopulation);
        System.out.println(pi);
        System.out.println(grade + " " + passed);
    }
}`,out:`45
8000000000
3.14159
A true`,why:'Underscores in numeric literals are reader aids only. The L suffix makes the population a long (it overflows int). char uses single quotes; values print via string concatenation where needed.'},
   {t:'Intermediate: integer division, widening and narrowing',code:`public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2);
        System.out.println(7.0 / 2);
        System.out.println(7 % 2);
        int small = 100;
        long big = small;
        double widened = big;
        System.out.println(widened);
        double precise = 3.99;
        int cut = (int) precise;
        System.out.println(cut);
        byte wrapped = (byte) 130;
        System.out.println(wrapped);
    }
}`,out:`3
3.5
1
100.0
3
-126`,why:'int/int truncates toward zero (3) while 7.0 promotes the operation to double (3.5). Widening is silent and safe; narrowing to byte wraps 130 to -126 because bytes span only -128..127 — overflow, not an error.'},
   {t:'Advanced: operators, short-circuit and ternary',code:`public class Main {
    public static void main(String[] args) {
        int marks = 82;
        String result = marks >= 40 ? "pass" : "fail";
        System.out.println(result);
        int a = 5;
        System.out.println(a++);
        System.out.println(++a);
        boolean eligible = marks >= 40 && marks <= 100;
        System.out.println(eligible);
        System.out.println(10 > 5 || (1 / 0 == 0));
    }
}`,out:`pass
5
7
true
true`,why:'a++ prints then increments (5, a becomes 6), ++a increments then prints (7). The last line cannot throw: || short-circuits once the left side is true, so the 1/0 branch is never evaluated.'}
  ],
  walk:[[3,'7 / 2 uses int division because both operands are int literals, yielding 3 with the fraction discarded toward zero.','3'],[4,'Making one operand 7.0 widens the other to double before dividing, producing 3.5.','3.5'],[11,'Casting 3.99 to int discards the fractional part — narrowing by definition.','3'],[13,'130 cannot fit in a byte (-128..127); the low 8 bits are kept, wrapping to -126 without any exception.','silent wraparound = bug risk']],
  walkWhy:'Java conversions never guess from the destination alone: the operand types fix the operation, and narrowing is always an explicit, lossy act the compiler forces you to write.',
  rules:['Integer division truncates toward zero; division or remainder by zero for integers throws ArithmeticException (doubles yield Infinity/NaN).','A long literal needs the L suffix beyond int range; float literals need f (2.5 is double by default).','char is a 16-bit unsigned Unicode unit; \'A\' is a char, "A" is a String — unrelated types.','&& and || short-circuit; & and | on booleans evaluate both sides (also used bitwise on integers).'],
  mistakes:[
   {t:'Losing the fraction in an average',bad:'int total = 255;\nint students = 3;\nSystem.out.println(total / students);  // intended 85.0 style, classic in percentages',why:'With slightly different numbers (256/3) the silent truncation gives 85 instead of 85.33. Money/percentage pipelines go subtly wrong without any error message.',fix:'double average = (double) total / students;\nSystem.out.println(average);',tip:'If the true answer can have a fraction, make at least one operand double BEFORE the division, not by assigning to a double afterwards.'},
   {t:'Declaring a big number as int',bad:'long pop = 8000000000;  // literal itself overflows int',err:'error: integer number too large',why:'Literals have types too: 8000000000 is parsed as an int literal first and is out of range before assignment ever happens.',fix:'long pop = 8000000000L;',tip:'Suffix discipline: L for long, f for float, underscores for readability: 8_000_000_000L.'}
  ],
  cmp:['Primitive vs reference types',['Aspect','Primitive (int, double...)','Reference (String, arrays, classes)'],[['Stored','The value itself','A reference to an object'],['Default field value','0 / 0.0 / false / \\u0000','null'],['== compares','Values','References (identity), not content'],['Methods allowed','None','Yes, from the class']]],
  diag:{kind:'flow',start:'Write an expression',condition:'Any decimal operand?',trueAction:'Promote to double arithmetic',falseAction:'Integer math: truncates division',end:'Cast explicitly when narrowing'},
  apps:['Marks/statistics calculations need the (double) cast discipline for honest averages.','Epoch timestamps (milliseconds) require long — int overflows in under a month of millis.','Loop counters and indexes are int by convention across the standard library.'],
  quizzes:[{q:'System.out.println(9 / 2 * 2.0); prints…',options:['9.0','8.0','9','Error'],correct:1,why:'9/2 is evaluated FIRST in int (→4), then 4 * 2.0 promotes to 8.0. Promotion happens per-operation, left to right.'},
            {q:'What is stored by byte b = (byte) 200;?',options:['200','Error','-56','0'],correct:2,why:'Only the low 8 bits survive: 200 wraps within -128..127 to -56.'}],
  take:['Operand types decide arithmetic: int/int truncates; add a double operand for real division.','Widening is automatic; narrowing needs an explicit, loss-aware cast.','Suffixes matter: L for long literals, f for float; underscores aid reading.'],
  rev:'8 primitives; int division truncates; (double) widens before divide; casts narrow (3.99→3, byte wrap). && short-circuits.',
  assign:{p:'Given int maths=88, science=91, english=79; print the average as a double with exactly the value 86.0 and on the next line print whether average >= 85 is true/false. Beware integer division!',s:`public class Main {
    public static void main(String[] args) {
        int maths = 88, science = 91, english = 79;
        // TODO: compute double average correctly and print it + the >= 85 check
    }
}`,sol:`public class Main {
    public static void main(String[] args) {
        int maths = 88, science = 91, english = 79;
        double average = (maths + science + english) / 3.0;
        System.out.println(average);
        System.out.println(average >= 85);
    }
}`}
},
{
  id:'java-control-flow', walkEx:3, course_id:'java', unit_id:'java-unit-1', order_index:3,
  title:'Control Flow: if, switch & Loops', desc:'Branch with if-else chains and switch statements; repeat with for, while, do-while and enhanced for.',
  obj:['Structure if/else-if ladders without dead branches','Use switch statements with grouped cases and correct breaks (and know the Java 14+ arrow form)','Choose for/while/do-while/enhanced-for appropriately with break/continue'],
  pre:['Variables & operators','Boolean expressions'],
  outcomes:['Learner writes precise branching and loop logic for grading, menus and iteration'],
  def:'Control flow statements alter sequential execution: if/else select by boolean conditions, switch selects by value, executing from the matching case label until a break, and loops (for, while, do-while, enhanced for-each) repeat a body zero or more times (do-while at least once), with break exiting and continue skipping to the next iteration.',
  simple:'Programs are roads with junctions. An if-else chain asks questions in order until one is true ("90+? A grade... else 80+? B grade..."). A switch is a cleaner junction when matching ONE value against many options like menu numbers; the Java 14+ arrow form returns answers directly with no fall-through when a break is forgotten (this platform runs JDK 11, so examples use classic switch). Loops are roundabouts you circle: for when you know the count, while when you circle until some condition changes, do-while when you must go around at least once (like always showing a menu once), and the enhanced for-each to simply visit every element of a collection.',
  hing:'Control flow matlab program ke mod (junctions). if-else ladder upar se neeche tak sawal puchti hai — jo pehla true, wahi chalega, isliye order sabse specific se general rakho. Ek hi value ko kai options se milana ho to switch saaf padta hai; naya switch expression (arrow ->) fall-through ka purana khatra bhi Khatm kar deta hai aur seedha value return karta hai. Loops me choice simple hai: ginti pata ho to for, condition par nirbhar ho to while, kam se kam ek baar chalana hi ho (menu dikhana) to do-while, aur array/collection ke har element par ghumna ho to enhanced for (for-each). break matlab loop se bahar, continue matlab is round ko chhodo agla round lo.',
  why:'Every non-trivial program is mostly branches and loops: validation, grading, retries, processing records. Choosing the right structure (and avoiding classic traps like fall-through and off-by-one bounds) decides readability and correctness more than any syntax sugar.',
  when:'Use if-chains for ranges/conditions, switch for single-value dispatch (enums, menu codes, status), for for counted iteration, while for condition-driven repetition, and for-each whenever you do not need the index or mutation of the sequence itself.',
  syntax:'switch (day) {\n    case 6:\n    case 7:  kind = "weekend"; break;\n    default: kind = "weekday";\n}\n// Java 14+ arrow form (no fall-through): case 6, 7 -> "weekend"\nfor (int item : items) { ... }   // enhanced for',
  comp:[['switch statement','case labels + break; arrow-form expressions exist from Java 14'],['Enhanced for','Visits each element; no index, cannot remove during iteration'],['do-while','Body guaranteed to run at least once before the test']],
  ex:[
   {t:'Basic: grading with an ordered if-ladder',code:`public class Main {
    static String grade(int marks) {
        if (marks >= 90) return "A";
        else if (marks >= 75) return "B";
        else if (marks >= 60) return "C";
        else if (marks >= 40) return "D";
        else return "Fail";
    }
    public static void main(String[] args) {
        System.out.println(grade(95));
        System.out.println(grade(75));
        System.out.println(grade(41));
        System.out.println(grade(12));
    }
}`,out:`A
B
D
Fail`,why:'Conditions are checked top-down and the first true one wins, so thresholds must be ordered highest-first. 75 lands in the second band exactly (boundary belongs to B because >= is used).'},
   {t:'Intermediate: switch with grouped cases',code:`public class Main {
    static String dayKind(int day) {
        switch (day) {
            case 1: case 2: case 3: case 4: case 5:
                return "weekday";
            case 6: case 7:
                return "weekend";
            default:
                return "invalid";
        }
    }
    static int monthDays(String month) {
        switch (month) {
            case "Jan": case "Mar": case "May":
                return 31;
            case "Feb":
                return 28;
            default:
                return 30;
        }
    }
    public static void main(String[] args) {
        System.out.println(dayKind(6));
        System.out.println("Feb has " + monthDays("Feb") + " days");
    }
}`,out:`weekend
Feb has 28 days`,why:'Adjacent case labels share one body because execution falls from the matched label to the code following the group (here an immediate return, so no break is needed). switch dispatches on int, String and enums. From Java 14 the arrow form removes fall-through entirely; this platform runs JDK 11 so examples stay classic.'},
   {t:'Advanced: loop selection in one program',code:`public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) sum += i;
        System.out.println("sum 1..5 = " + sum);
        int balance = 100;
        int withdrawals = 0;
        while (balance >= 30) {
            balance -= 30;
            withdrawals++;
        }
        System.out.println("withdrawals=" + withdrawals + " left=" + balance);
        int menuShown = 0;
        do {
            menuShown++;
        } while (menuShown < 0);
        System.out.println("menu shown " + menuShown + " time");
        for (String name : new String[]{"Asha", "Ravi"}) {
            System.out.println("hello " + name);
        }
    }
}`,out:`sum 1..5 = 15
withdrawals=3 left=10
menu shown 1 time
hello Asha
hello Ravi`,why:'for counts a known range; while repeats while an amount condition holds (3 withdrawals of 30 from 100); do-while runs once even though its condition starts false; for-each visits array elements without index bookkeeping.'}
  ],
  walk:[[4,'for loop: i runs 1..5 adding to sum; i <= 5 fails at 6, leaving 15.','sum=15'],[8,'Each withdrawal subtracts 30 and the guard re-checks: 100→70→40→10, then 10 >= 30 is false.','3 iterations'],[14,'do-while executes its body BEFORE testing menuShown < 0, so exactly one iteration happens.','menuShown=1'],[18,'for-each binds name to each array element in order, requiring no index variable at all.','visits Asha, Ravi']],
  walkWhy:'Each loop form encodes a different iteration contract; matching the form to the situation removes guard-variable boilerplate and off-by-one risk.',
  rules:['An if-ladder with early broad conditions starves later specific ones — order tests from most to least restrictive for thresholds.','Legacy switch statements fall through without break; prefer arrow-form switch expressions.','Enhanced for cannot modify the collection structure during iteration (ConcurrentModificationException on collections).','while(true) loops need an internal break path; an unreachable break condition is an infinite loop bug.'],
  mistakes:[
   {t:'Missing break in a classic switch (fall-through)',bad:'switch (code) {\n    case 1: System.out.println("one");\n    case 2: System.out.println("two");  // also runs for code==1!\n            break;\n}',why:'Classic switch cases are labels, not blocks: execution pours into the following case until a break. The output for code 1 is "one" then "two", baffling anyone expecting one branch.',fix:'switch (code) {\n    case 1: System.out.println("one"); break;\n    case 2: System.out.println("two"); break;\n    default: System.out.println("?");\n}',tip:'Give every classic case its break (or return); group labels only deliberately, with a comment. On Java 14+, arrow form removes this trap.'},
   {t:'Assignment = inside a boolean condition typo... becomes legal with boolean',bad:'boolean active = false;\nif (active = true) {  // assigns AND tests true\n    System.out.println("always runs");\n}',why:'For boolean variables, = inside if compiles (assignment yields the value), flipping logic silently. Java catches this for int conditions but not boolean.',fix:'if (active) { ... }\nif (!active) { ... }  // compare booleans directly, never == true',tip:'Never write == true/false; use the boolean itself. Many IDEs/linters flag assignment-in-condition — heed them.'}
  ],
  cmp:['Loop forms compared',['Form','Tests before/after','Pick when'],[['for','Before each pass (init;cond;step)','Known counts and ranges'],['while','Before','Condition-driven, unknown trips'],['do-while','After (min 1 run)','Input/menu shown at least once'],['for-each','Internal','Visit every element, no index needed']]],
  diag:{kind:'flow',start:'Need branching/repetition',condition:'Single value, many options?',trueAction:'switch expression',falseAction:'if-ladder for ranges; loops for repetition',end:'Verify boundary values by hand'},
  apps:['Exam grading bands and tax slabs are ordered if-ladders.','Menu/state dispatch in console tools is switch territory.','Retry-until-success and read-until-EOF drivers are while loops with careful break paths.'],
  quizzes:[{q:'With marks=75 and bands >=90 A, >=75 B, >=60 C (in that order), the grade is…',options:['A','B','C','Error'],correct:1,why:'The first true condition is >= 75, so B wins; the >= 60 branch is never reached for this value.'},
            {q:'How many times does do { x++; } while (x < 0); run its body when x starts at 5?',options:['0','1','Infinite','5'],correct:1,why:'do-while tests AFTER the body, guaranteeing exactly one execution before the false check stops it.'}],
  take:['Order if-ladder conditions best-first; boundaries belong to the first true condition.','Classic switch needs explicit breaks; the Java 14+ arrow form removes fall-through.','Loop choice follows the contract: counted=for, conditional=while, at-least-once=do-while, visit-all=for-each.'],
  rev:'Classic switch: stacked labels share code, break/return ends a case; falls through without them. do-while runs at least once. (Arrow switch expressions need Java 14+.)',
  assign:{p:'Write classify(int temp) returning "cold" (<15), "pleasant" (15..29), "hot" (>=30). Loop over temps {10, 15, 29, 30, 44} printing each classification on its own line. Expected: cold, pleasant, pleasant, hot, hot.',s:`public class Main {
    // TODO: classify + for-each demo
    public static void main(String[] args) {
    }
}`,sol:`public class Main {
    static String classify(int temp) {
        if (temp < 15) return "cold";
        else if (temp <= 29) return "pleasant";
        else return "hot";
    }
    public static void main(String[] args) {
        for (int t : new int[]{10, 15, 29, 30, 44}) {
            System.out.println(classify(t));
        }
    }
}`}
},
{
  id:'java-methods-overloading-recursion', walkEx:3, course_id:'java', unit_id:'java-unit-1', order_index:4,
  title:'Methods, Overloading & Recursion in Java', desc:'Declare static methods, overload by parameters, pass by value, and write recursive solutions.',
  obj:['Write methods with parameters, return types and static context','Overload methods by parameter list and use varargs','Explain pass-by-value (including what happens with references) and recursion base cases'],
  pre:['Control flow','Variables & operators'],
  outcomes:['Learner factors logic into reusable methods and reasons about argument passing'],
  def:'A method is a named block declared inside a class with a signature (name + parameter types) and a return type. Java is strictly pass-by-value: the called method receives a copy of the argument value (for objects, a copy of the reference). Overloading reuses a name for different parameter lists; varargs (Type...) accepts a variable number of trailing arguments as an array.',
  simple:'A method is a reusable machine inside your class: feed values in through its slots (parameters), it works in its own workspace, and hands back at most one finished product (the return value). Java copy-rules matter: what you pass in is photocopied. For a number, the copy is the number itself, so the caller\'s original can never be changed by the method. For an object, the reference (address) is photocopied — both copies point at the same object, so the method can modify that object\'s contents, but pointing the copy elsewhere does not move the caller\'s reference. Overloading lets max(int,int) and max(double,double) share one friendly name.',
  hing:'Method ek machine hai: parameter se input lo, andar kaam karo, return se ek result wapas do. main se bahar chhote-chhote methods banate hi code saaf aur reusable ban jata hai. Java me arguments hamesha pass-by-value hote hain — matlab copy jaati hai. int bhejoge to copy badalne se asli nahi badlega. Array/object bhejoge to reference ki copy jaayegi — dono ek hi object ko point karte hain, isliye uske ANDAR ke values badal sakte ho, lekin reference ko naye object par lagane se caller ka reference nahi badalta. Overloading me naam ek, parameters alag: max(int,int) aur max(double,double). Recursion me base case bhoolna = StackOverflowError pakka!',
  why:'Methods are Java\'s unit of reuse and testing; nearly every design concept afterwards (constructors, overrides, library APIs) builds on signatures, overloading and pass-by-value. Misunderstanding pass-by-value causes immortal swap(int,int) and String reassign bugs.',
  when:'Extract methods for repeated logic and single clear purposes. Overload for natural type variants of one operation; use varargs for genuinely open-ended trailing inputs (String.format style). Prefer return values over out-parameter hacks.',
  syntax:'static int add(int a, int b) { return a + b; }\nstatic double add(double a, double b) { return a + b; }\nstatic int total(int... values) { /* values is int[] */ }',
  comp:[['Signature','Method name + ordered parameter types (return type excluded)'],['Pass-by-value','Arguments are copied; references are copied addresses of shared objects'],['Varargs Type...','Last parameter collects any count of arguments into an array']],
  ex:[
   {t:'Basic: static utility methods with returns',code:`public class Main {
    static int square(int n) {
        return n * n;
    }
    static boolean isEven(int n) {
        return n % 2 == 0;
    }
    static void banner(String text) {
        System.out.println("== " + text + " ==");
    }
    public static void main(String[] args) {
        banner("Methods");
        System.out.println(square(9));
        System.out.println(isEven(14) + " " + isEven(15));
    }
}`,out:`== Methods ==
81
true false`,why:'static methods are called directly from main without an object. square/isEven return values usable in expressions; banner returns void (nothing) because its job is only to print.'},
   {t:'Intermediate: overloading and varargs',code:`public class Main {
    static int max(int a, int b) { return a > b ? a : b; }
    static double max(double a, double b) { return a > b ? a : b; }
    static int max(int a, int b, int c) { return max(max(a, b), c); }
    static int total(int... values) {
        int sum = 0;
        for (int v : values) sum += v;
        return sum;
    }
    public static void main(String[] args) {
        System.out.println(max(3, 7));
        System.out.println(max(2.5, 1.25));
        System.out.println(max(4, 9, 2));
        System.out.println(total(1, 2, 3, 4));
        System.out.println(total());
    }
}`,out:`7
2.5
9
10
0`,why:'Resolution picks by argument types/count at compile time (int pair, double pair, triple). The triple-max reuses the pair overload. total() receives an empty array from varargs, summing to 0 — varargs allows zero trailing arguments.'},
   {t:'Advanced: pass-by-value with primitives and arrays',code:`public class Main {
    static void bump(int x) {
        x = x + 10;
    }
    static void bumpFirst(int[] arr) {
        arr[0] = arr[0] + 10;
    }
    static void reassign(int[] arr) {
        arr = new int[]{99};
    }
    public static void main(String[] args) {
        int n = 5;
        bump(n);
        System.out.println(n);
        int[] data = {1, 2, 3};
        bumpFirst(data);
        System.out.println(data[0]);
        reassign(data);
        System.out.println(data[0] + " len=" + data.length);
    }
}`,out:`5
11
11 len=3`,why:'bump got a copy of 5 — n is untouched. bumpFirst got a copy of the REFERENCE, so both copies reach the same array and the element change sticks (11). reassign pointed its OWN copy at a new array; the caller still owns the original (length 3).'}
  ],
  walk:[[13,'bump(n): parameter x is an independent copy of 5; x becomes 15 inside and is discarded.','n stays 5'],[16,'bumpFirst receives a copied address of the same array object.','arr → same heap array'],[6,'arr[0] mutation goes through the shared address, visible to the caller.','data[0] = 11'],[9,'reassign overwrites only its local copy of the address; caller\'s data variable is unaffected.','caller array unchanged']],
  walkWhy:'Every behaviour follows one rule: the VALUE passed is copied — an int\'s value is the number, an array variable\'s value is the address. There is no pass-by-reference in Java.',
  rules:['Overloads must differ in parameter types/count/order — return type alone is illegal overloading.','A varargs parameter must be last; inside, it behaves exactly like an array.','Methods must return a value on every path (non-void) or the compiler errors with "missing return statement".','Recursion needs a base case that every input path reaches; excessive depth throws StackOverflowError.'],
  mistakes:[
   {t:'Writing swap(int, int) and expecting it to work',bad:'static void swap(int a, int b) { int t = a; a = b; b = t; }\n// caller values unchanged afterwards',why:'The swap diligently exchanges its private copies. Without access to containers of the values, no method can swap two caller primitives in Java.',fix:'// swap elements inside an array/object instead:\nstatic void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }',tip:'To modify caller state, mutate a shared object or RETURN new values and assign them at the call site.'},
   {t:'Recursive method without a reachable base case',bad:'static int down(int n) { return down(n - 1); }  // never stops',err:'java.lang.StackOverflowError',why:'Each call keeps a stack frame waiting for the deeper call. With no floor, frames accumulate until the fixed-size call stack is exhausted and the JVM aborts that thread\'s computation.',fix:'static int down(int n) {\n    if (n <= 0) return 0;\n    return down(n - 1);\n}',tip:'Design recursion contract-first: identify the base value, then ensure every step strictly approaches it.'}
  ],
  cmp:['What a method can and cannot change',['Kind of argument','Callee can change caller-visible state?','Why'],[['int/double/boolean','No','Received a copy of the number itself'],['Array/object contents','Yes (arr[0] = …)','Reference copy reaches the shared object'],['Caller\'s reference variable','No','Reassigning the copy never rewires the caller'],['Return value','Yes, if caller assigns it','The sanctioned channel for new values']]],
  diag:{kind:'flow',start:'Call method(arg)',condition:'Primitive or reference?',falseAction:'Callee mutates shared object via copied address',trueAction:'Callee gets independent number copy',end:'Return values to propagate changes'},
  apps:['Math/validation helpers as small static methods reused across classes.','Overloaded builders/converters (valueOf family) throughout the Java API.','Recursive traversals over trees/directories mirror the same base-case discipline.'],
  quizzes:[{q:'void f(int x){ x = 0; } — after f(n), caller\'s n is…',options:['0','Unchanged','null','Compilation error'],correct:1,why:'Primitives are passed by value; x is a copy living only inside f.'},
            {q:'Which is a valid overload of int calc(int a, int b)?',options:['double calc(int a, int b)','int calc(int b, int a)','double calc(double a, double b)','int calc(int a) with same name in another class only'],correct:2,why:'Overloading requires a different parameter list in the same class; double,double differs in types. Return-only and name-swapped variants are invalid duplicates.'}],
  take:['Java passes everything by value — object arguments copy the address, not the object.','Overloading differentiates by parameters only; varargs collects trailing args into an array.','Every recursion needs a reachable base case (else StackOverflowError).'],
  rev:'Signature = name+params. Pass-by-value always. Array contents mutable through copies. Varargs last. Recursion: base case first.',
  assign:{p:'Write static int sumTo(int n) recursively (base n<=0 -> 0). Print sumTo(5)=15 formatted exactly as sumTo(5)=15, then overload count(int... values) returning values.length and print count(8,9,10) on the next line.',s:`public class Main {
    // TODO: recursive sumTo + varargs count
    public static void main(String[] args) {
    }
}`,sol:`public class Main {
    static int sumTo(int n) {
        if (n <= 0) return 0;
        return n + sumTo(n - 1);
    }
    static int count(int... values) {
        return values.length;
    }
    public static void main(String[] args) {
        System.out.println("sumTo(5)=" + sumTo(5));
        System.out.println(count(8, 9, 10));
    }
}`}
},
{
  id:'java-strings-stringbuilder', course_id:'java', unit_id:'java-unit-1', order_index:5,
  title:'Strings, StringBuilder & Text Processing', desc:'Compare with equals, mine substrings, split text, and build strings efficiently in loops.',
  obj:['Use equals/equalsIgnoreCase instead of == for content comparison','Extract and transform text with substring, indexOf, split, replace, trim','Explain String immutability and when StringBuilder is required'],
  pre:['Methods & overloading','Arrays (chars), control flow'],
  outcomes:['Learner processes Java text correctly and avoids the == trap'],
  def:'A String is an immutable object holding a character sequence; methods such as substring/toUpperCase return NEW strings. Content equality must be tested with equals(). StringBuilder is a mutable character buffer designed for efficient repeated appends (for example inside loops), convertible to String via toString().',
  simple:'Java strings are sealed letters: once created, the text inside a String object can never change. Every "edit" (toUpperCase, replace) actually writes a brand-new letter and hands it to you — forget to take it (assign it) and your change floats away, the classic immutability mistake. The second classic trap is ==, which asks "are these the same physical letter?" instead of "do they say the same thing?" — content comparison must use s1.equals(s2). When you build text piece by piece in a loop, creating a new sealed letter per append wastes time; StringBuilder is the editable draft you keep appending to, finally sealing it with toString().',
  hing:'Java me String immutable hai — ek baar bana to uske andar ka text badal hi nahi sakta. toUpperCase() ya replace() har baar NAYA string deta hai; use variable me save nahi kiya to change hawa me gaya! Dusra sabse bada trap hai ==: ye objects ka ADDRESS (same physical object hai kya) check karta hai, andar ka text nahi. Text compare karna ho to hamesha .equals() use karo. Aur yaad rakho "Riya" literals pool me share hote hain, isliye == kabhi-kabhi glati se true deta de deta hai — bharosa kabhi mat karo. Loop me baar-baar string jodna ho to StringBuilder use karo, phir akhir me toString() — + har baar nayi copy banata hai.',
  why:'Text processing (input, CSV, logs, UI labels) saturates real Java programs. The equals-vs-== trap and quadratic loop concatenation are two of the most re-reported Java beginner defects — both covered directly here.',
  when:'Use String for values and parameters; StringBuilder when assembling in loops or many pieces; StringBuffer only for legacy thread-shared buffers. Compare with equals (constant-first "x".equals(s) when s may be null), and split/parse structured lines carefully (split takes a regex).',
  syntax:'boolean same = a.equals(b);\nString part = s.substring(1, 4);   // end exclusive\nString[] fields = line.split(",");\nStringBuilder sb = new StringBuilder();\nsb.append(x).append(\'-\');\nString result = sb.toString();',
  comp:[['equals vs ==','Content equality vs reference identity'],['substring(begin, end)','Begin inclusive, end EXCLUSIVE — like Python slices'],['StringBuilder','Mutable buffer; append returns this for chaining']],
  ex:[
   {t:'Basic: equality the right way',code:`public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(c));
        System.out.println(a.equalsIgnoreCase("JAVA"));
        System.out.println(a.length() + " " + a.charAt(0) + a.charAt(3));
    }
}`,out:`true
false
true
true
4 ja`,why:'Literal strings are interned in a pool, so a and b are literally the same object (== true). new String forces a distinct object: == false, but equals compares content → true. == on pool literals accidentally working is exactly why this bug hides so well.'},
   {t:'Intermediate: searching, slicing and splitting text',code:`public class Main {
    public static void main(String[] args) {
        String line = " Diya,92,Pune ";
        String cleaned = line.trim();
        System.out.println("[" + cleaned + "]");
        String[] parts = cleaned.split(",");
        System.out.println(parts[0] + " scored " + parts[1] + " from " + parts[2]);
        String email = "diya@example.com";
        int at = email.indexOf('@');
        System.out.println(email.substring(0, at));
        System.out.println(email.substring(at + 1));
        System.out.println(email.contains("example") + " " + email.startsWith("diya"));
    }
}`,out:`[Diya,92,Pune]
Diya scored 92 from Pune
diya
example.com
true true`,why:'trim returns a new trimmed string that must be assigned. split breaks on the comma regex; substring end index is exclusive, so substring(0, 4) on the email gives exactly "diya".'},
   {t:'Advanced: building text with StringBuilder (and immutability proof)',code:`public class Main {
    public static void main(String[] args) {
        String original = "report";
        String upper = original.toUpperCase();
        System.out.println(original);
        System.out.println(upper);
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            if (i > 1) sb.append('-');
            sb.append(i * i);
        }
        System.out.println(sb.toString());
        sb.reverse();
        System.out.println(sb);
    }
}`,out:`report
REPORT
1-4-9-16-25
52-61-9-4-1`,why:'toUpperCase left original untouched — immutability made visible. The builder appends squares with separators in place (one buffer, no per-step copies), and even supports in-place reverse; printing the builder implies toString.'}
  ],
  walk:[[3,'Both literals resolve to the pooled String instance "java"; a and b hold identical references.','a == b is true'],[5,'new String deliberately allocates a fresh object with the same characters at a different address.','a == c is false'],[7,'equals walks characters and finds them identical — content equality is a value question.','equals → true'],[8,'equalsIgnoreCase folds case per character, matching "JAVA" against "java".','case-insensitive match']],
  walkWhy:'Java gives == one job — identity — and delegates all value semantics to equals(). Code that conflates them passes unit tests with literals and fails in production with parsed/user strings.',
  rules:['Compare strings with equals/equalsIgnoreCase/compareTo, never == (except deliberate identity/null checks).','Every String "mutation" returns a new object — assign the result or it is lost.','split takes a REGEX: splitting on a dot needs "\\\\." and on a pipe "\\\\|" — bare meta-characters misbehave silently.','Loop concatenation with + is quadratic; use StringBuilder beyond a handful of pieces.'],
  mistakes:[
   {t:'== comparison passing tests then failing on real input',bad:'String cmd = readFromUser();\nif (cmd == "start") { run(); }  // user text is a different object',why:'Literals in tests share the pool so == appears to work. Runtime-constructed strings (input, parsing, concatenation) are fresh objects, the branch never fires, and no error is raised — pure silent logic death.',fix:'if ("start".equals(cmd)) { run(); }  // constant-first is null-safe too',tip:'Adopt "literal".equals(variable) as the house style; IDE inspections can flag == on strings.'},
   {t:'Discarding the result of a String method',bad:'String name = "  diya  ";\nname.trim();\nSystem.out.println("[" + name + "]");  // spaces still there',why:'trim() built and returned a cleaned NEW string which the code threw away. Immutability means the original can never be repaired in place.',fix:'name = name.trim();',tip:'When a String method "does nothing", look for the missing assignment — same lesson as Python, same root cause.'}
  ],
  cmp:['String vs StringBuilder',['Aspect','String','StringBuilder'],[['Mutable','No — every change allocates','Yes — edits in place'],['Equality','equals compares content','equals is identity (Object default)'],['Loop building','O(n²) copies with +','Amortised O(n) appends'],['Convert','—','toString() seals it to String']]],
  diag:{kind:'flow',start:'Working with text',condition:'Building in a loop?',trueAction:'StringBuilder, then seal with toString()',falseAction:'String + equals + assigned transforms',end:'Compare content with equals, identity with =='},
  apps:['Parsing CSV-ish input lines via split + typed conversion.','Constructing reports/SQL fragments (carefully) with StringBuilder.','Validating emails/log levels with contains/startsWith/endsWith before deeper parsing.'],
  quizzes:[{q:'String x = new String("hi"); String y = "hi"; — x == y and x.equals(y) are…',options:['true / true','false / true','false / false','true / false'],correct:1,why:'new forces a distinct heap object (== false) while equals compares character content (true).'},
            {q:'"abcdef".substring(2, 5) returns…',options:['"bcd"','"cde"','"cdef"','"abcde"'],correct:1,why:'Begin 2 inclusive, end 5 exclusive → characters at 2,3,4 → "cde".'}],
  take:['== = identity; equals = content. Use "x".equals(var) for null-safety.','String edits return new objects — always assign; substring end is exclusive.','Build with StringBuilder in loops; split uses regex (escape . and |).'],
  rev:'Never == for text. trim/replace results must be assigned. substring(a,b) excludes b. StringBuilder.append chains; toString seals.',
  assign:{p:'From String csv = " pen,10,ink "; split after trim, and use a StringBuilder to build "ITEM: pen PRICE: 10 TYPE: ink" (labels uppercase words, values as-is), then print it.',s:`public class Main {
    public static void main(String[] args) {
        String csv = " pen,10,ink ";
        // TODO: trim, split, build with StringBuilder, print
    }
}`,sol:`public class Main {
    public static void main(String[] args) {
        String csv = " pen,10,ink ";
        String[] parts = csv.trim().split(",");
        StringBuilder sb = new StringBuilder();
        sb.append("ITEM: ").append(parts[0]);
        sb.append(" PRICE: ").append(parts[1]);
        sb.append(" TYPE: ").append(parts[2]);
        System.out.println(sb.toString());
    }
}`}
},
{
  id:'java-arrays-varargs', course_id:'java', unit_id:'java-unit-1', order_index:6,
  title:'Arrays in Java: 1-D, 2-D & the Arrays Utility', desc:'Create and traverse fixed-size arrays, handle bounds, work with 2-D grids and java.util.Arrays helpers.',
  obj:['Declare, initialise and traverse 1-D arrays using length','Build and iterate 2-D (including jagged) arrays','Use Arrays.sort/binarySearch/toString/copyOf correctly'],
  pre:['Control flow & loops','Methods'],
  outcomes:['Learner manages fixed-size data and knows Java\'s bounds-checking guarantees'],
  def:'A Java array is a fixed-length object holding elements of one declared type, indexed 0..length-1 with bounds checked at runtime (violations throw ArrayIndexOutOfBoundsException). Multidimensional arrays are arrays of arrays, whose rows may have different lengths (jagged).',
  simple:'A Java array is a fixed row of same-type boxes created in one go — new int[5] gives five zero-filled boxes you cannot later stretch or shrink. You ask its size with .length (a field, no brackets!). Java watchfully checks every index: touching box 5 of a 5-box row throws ArrayIndexOutOfBoundsException immediately instead of corrupting memory like C. A 2-D array is honestly "an array whose boxes each hold another array" — perfect for grids like seating charts, and rows can even have different lengths. The Arrays helper class brings quality-of-life tools: sort them, print them readably with toString, and grow-by-copying via copyOf.',
  hing:'Java ka array ek fix-size ek-type ke dabbon ki line hai. new int[5] matlab 5 dabbe, sab me pehle 0 hoga. Size jaan ne ke liye .length (bracket nahi lagta, ye field hai!). Galat index chhune par Java mafi nahi deta — ArrayIndexOutOfBoundsException turant aata hai (C ki tarah chhup-chaap memory bigadti nahi). 2-D array matlab arrays ke andar arrays: rows alag lambai ki bhi ho sakti hain (jagged). Chhoti par zaroori baatein: Arrays.toString(a) print karne ke liye hai — seedha array print karoge to [I@15db9742 jaisa address milega! Aur badhana ho to Arrays.copyOf naya bada array bana kar deta hai.',
  why:'Arrays are the fastest, simplest fixed collections and the substrate under ArrayList. Their guarantees (bounds checks, default initialisation) model Java\'s safety stance. Knowing the utility methods prevents pages of hand loops and the infamous [I@hash print.',
  when:'Pick arrays when the size is fixed and the type is primitive or performance matters; pick ArrayList (next units) when elements are added/removed dynamically. Use 2-D arrays for grids/boards/matrices.',
  syntax:'int[] marks = {85, 92, 78};\nint[] zeros = new int[4];       // all 0\nint[][] grid = new int[3][4];  // 3 rows of 4\nArrays.sort(marks);\nSystem.out.println(Arrays.toString(marks));',
  comp:[['length (field)','Element count; arrays have length (no ()) vs String length()'],['Default values','Numerics 0, boolean false, references null on creation'],['Arrays utility','sort, binarySearch (needs sorted input), toString, copyOf, equals']],
  ex:[
   {t:'Basic: creating, defaults and traversal',code:`import java.util.Arrays;
public class Main {
    public static void main(String[] args) {
        int[] marks = {85, 92, 78, 92};
        System.out.println("length=" + marks.length);
        System.out.println(marks[0] + " " + marks[marks.length - 1]);
        int sum = 0;
        for (int m : marks) sum += m;
        System.out.println("avg=" + (sum / (double) marks.length));
        boolean[] flags = new boolean[3];
        System.out.println(Arrays.toString(flags));
        System.out.println(Arrays.toString(marks));
    }
}`,out:`length=4
85 92
avg=86.75
[false, false, false]
[85, 92, 78, 92]`,why:'The initialiser infers length 4; new boolean[3] demonstrates default initialisation (false). for-each totals without index bookkeeping, and Arrays.toString renders contents instead of the object identity string.'},
   {t:'Intermediate: sorting, searching and copying',code:`import java.util.Arrays;
public class Main {
    public static void main(String[] args) {
        int[] data = {40, 10, 30, 10, 20};
        Arrays.sort(data);
        System.out.println(Arrays.toString(data));
        System.out.println("30 at " + Arrays.binarySearch(data, 30));
        int missing = Arrays.binarySearch(data, 25);
        System.out.println("25 result " + missing + " (negative=absent)");
        int[] bigger = Arrays.copyOf(data, 7);
        System.out.println(Arrays.toString(bigger));
        int[] clone = data.clone();
        System.out.println(Arrays.equals(data, clone));
    }
}`,out:`[10, 10, 20, 30, 40]
30 at 3
25 result -4 (negative=absent)
[10, 10, 20, 30, 40, 0, 0]
true`,why:'binarySearch requires sorted input and reports a negative insertion encoding (-4 means "would insert at index 3") when absent. copyOf pads new slots with 0 — the idiomatic way to "grow" a fixed array by replacement. clone gives a shallow copy.'},
   {t:'Advanced: 2-D and jagged arrays',code:`public class Main {
    public static void main(String[] args) {
        int[][] table = new int[3][3];
        for (int r = 0; r < table.length; r++) {
            for (int c = 0; c < table[r].length; c++) {
                table[r][c] = (r + 1) * (c + 1);
            }
        }
        for (int[] row : table) {
            for (int v : row) System.out.print(v + " ");
            System.out.println();
        }
        int[][] jagged = {{1, 2}, {3, 4, 5}, {6}};
        System.out.println("rows=" + jagged.length + " row2len=" + jagged[1].length);
    }
}`,out:`1 2 3 
2 4 6 
3 6 9 
rows=3 row2len=3`,why:'Nested loops index [row][column] producing the multiplication table; each row is an independent int[], which is exactly why jagged rows of lengths 2/3/1 are legal. jagged[1].length queries that row alone.'}
  ],
  walk:[[3,'An array object with four slots is created; the reference variable marks points at it.','marks → [85,92,78,92]'],[4,'marks.length is the array object\'s fixed field, 4 — no method call parentheses.','length=4'],[8,'for-each visits each element value (copies) without exposing an index — right for read-only accumulation.','sum accumulates'],[11,'Arrays.toString consults contents; printing a bare array would have shown a type+hash identity like [I@1b6d3586.','readable output']],
  walkWhy:'Arrays are genuine objects with identity, fixed size and runtime index guards — every behaviour (length, defaults, exception on overflow) descends from those three facts.',
  rules:['Indices 0..length-1; violations throw ArrayIndexOutOfBoundsException (Java checks every access).','Arrays are created default-filled (0/false/null) — no garbage values unlike C locals.','== on arrays compares identity; use Arrays.equals (and deepEquals for nested) for contents.','An array reference can be null; touching null.length or null[i] throws NullPointerException.'],
  mistakes:[
   {t:'Printing the array object instead of its contents',bad:'int[] a = {1, 2, 3};\nSystem.out.println(a);  // [I@15db9742',why:'Arrays inherit Object.toString: type code + identity hash. Learners assume corruption, but the data is fine — only the rendering was never overridden for arrays.',fix:'System.out.println(java.util.Arrays.toString(a));\n// nested arrays: Arrays.deepToString(grid)',tip:'Imports at the ready: Arrays.toString for 1-D, deepToString for 2-D.'},
   {t:'Off-by-one loop blow-up',bad:'for (int i = 0; i <= a.length; i++) {\n    System.out.println(a[i]);  // i == length on final pass\n}',err:'java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3',why:'With <=, the last iteration uses i == length, one past the final valid index. Java converts C\'s silent corruption into a loud crash — helpful, yet still a bug to fix.',fix:'for (int i = 0; i < a.length; i++) { ... }\n// or for-each when the index itself is unneeded',tip:'Say it aloud: count N → last index N-1 → loop while i < N.'}
  ],
  cmp:['Java array vs C array',['Aspect','Java array','C array'],[['Size access','.length built in','sizeof trick or track separately'],['Bounds violation','ArrayIndexOutOfBoundsException','Undefined behaviour'],['Fresh contents','Zero/false/null defaults','Indeterminate (locals)'],['Assignment','Copies reference (aliases)','Arrays not assignable']]],
  diag:{kind:'flow',start:'Need fixed-size storage',condition:'Size fixed upfront?',trueAction:'Array + Arrays utilities',falseAction:'Consider ArrayList (collections unit)',end:'Respect 0..length-1 always'},
  apps:['Seating grids and game boards (2-D arrays).','Fixed lookup tables like month lengths for date logic.','High-throughput numeric buffers where primitives avoid object overhead.'],
  quizzes:[{q:'int[] a = new int[3]; System.out.println(a[2]); prints…',options:['Garbage','0','null','Exception'],correct:1,why:'Java default-initialises array elements: numeric arrays start zeroed.'},
            {q:'After Arrays.sort(data), binarySearch for an absent key returns…',options:['-1 always','0','A negative value encoding the insertion point','Throws'],correct:2,why:'It returns -(insertion point) - 1, which is negative but not always -1; decode if you need the position.'}],
  take:['Arrays are fixed-length objects with .length and checked indices 0..length-1.','Elements start default-filled; contents print via Arrays.toString, compare via Arrays.equals.','2-D arrays are arrays of independent rows — jagged shapes are legal.'],
  rev:'Length is a field; violations throw AIOOBE. Defaults 0/false/null. sort before binarySearch. copyOf to grow. deepToString for 2-D prints.',
  assign:{p:'Build int[] scores = {58, 92, 71, 92, 40}; print max via a loop, sorted via Arrays.toString after Arrays.sort on a clone, and count of 92s. Expected lines: max=92 / [40, 58, 71, 92, 92] / count92=2.',s:`import java.util.Arrays;
public class Main {
    public static void main(String[] args) {
        int[] scores = {58, 92, 71, 92, 40};
        // TODO: max, sorted clone, count of 92
    }
}`,sol:`import java.util.Arrays;
public class Main {
    public static void main(String[] args) {
        int[] scores = {58, 92, 71, 92, 40};
        int max = scores[0];
        int count92 = 0;
        for (int s : scores) {
            if (s > max) max = s;
            if (s == 92) count92++;
        }
        System.out.println("max=" + max);
        int[] sorted = scores.clone();
        Arrays.sort(sorted);
        System.out.println(Arrays.toString(sorted));
        System.out.println("count92=" + count92);
    }
}`}
},
{
  id:'java-classes-objects', walkEx:2, course_id:'java', unit_id:'java-unit-3', order_index:1,
  title:'Classes & Objects: Fields, Constructors & Encapsulation', desc:'Model entities with private fields, constructors, getters/setters and this; create objects with new.',
  obj:['Define classes with fields, multiple constructors and methods','Enforce invariants through private fields + validated setters','Use this for disambiguation and constructor chaining'],
  pre:['Arrays & methods','Control flow'],
  outcomes:['Learner models a domain entity whose state can never become invalid'],
  def:'A class is a reference-type blueprint combining fields (state) and methods (behaviour). Objects are instantiated on the heap with new, initialised by constructors (no return type, class-named). Encapsulation hides fields as private and mediates access through public methods, letting the class protect its invariants.',
  simple:'A class is a form design; each object is a filled copy of that form stored in memory, reached through a reference (like a file\'s location slip). The constructor is the admission desk: every new object must pass through it, so required details (a student must have a name) get filled in properly from birth, never half-made. Encapsulation means the form\'s boxes (fields) are locked as private and the outside world only uses official counters — getter windows to view, setter windows to change — where the class can refuse nonsense (negative marks, blank names) forever. this simply means "this very object" when a parameter shadows a field name.',
  hing:'Class ek form ka design hai; object us form ki bhari hui copy jo heap me banti hai, new likhte hi. Constructor admission desk hai — naya object wahin se hokar banta hai, isliye zaroori fields (naam, roll) paida hote hi sahi set ho jate hain. Encapsulation ka matlab fields ko private rakhna: bahar wala seedha haath nahi daal sakta, sirf getter (dekhna) aur setter (badalna, validation ke saath) di hui khidkiyon se kaam hoga. Isse marks kabhi 150 se zyada ja hi nahi sakte — rule class ke andar band hai. this.name likhne ka matlab "is object ki name field", jab parameter ka naam bhi name hi ho. Aur dhyan do: ek bhi constructor likha to default wala apne aap gayab!',
  why:'Every substantial Java program models its world as objects (Student, Order, Account). Encapsulation is the difference between state that can be corrupted from anywhere and state guarded by rules in exactly one place — the kernel of maintainable design you will use in frameworks everywhere.',
  when:'Create a class when data and its rules belong together and you will instantiate several such entities. Provide constructors that establish validity immediately; expose getters broadly and setters only where change is legitimate (immutable designs often have none).',
  syntax:'class Student {\n    private String name;\n    private int marks;\n    Student(String name, int marks) {\n        this.name = name;\n        setMarks(marks);\n    }\n    public int getMarks() { return marks; }\n    public void setMarks(int marks) { /* validate */ }\n}',
  comp:[['Constructor','Initialises a new object; name = class name; no return type'],['private fields','Accessible only inside the class — invariant enforcement lives here'],['this','Reference to the current object; this(...) chains to another constructor']],
  ex:[
   {t:'Basic: a first class with constructor and method',code:`class Student {
    String name;
    int roll;

    Student(String name, int roll) {
        this.name = name;
        this.roll = roll;
    }

    void introduce() {
        System.out.println("I am " + name + ", roll " + roll);
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Diya", 12);
        Student s2 = new Student("Kabir", 7);
        s1.introduce();
        s2.introduce();
        System.out.println(s1 == s2);
    }
}`,out:`I am Diya, roll 12
I am Kabir, roll 7
false`,why:'Each new invokes the constructor to initialise a distinct heap object; this.name separates the field from the like-named parameter. s1 and s2 reference different objects, so identity comparison is false.'},
   {t:'Intermediate: encapsulation with validated setters',code:`class BankAccount {
    private String owner;
    private int balance;

    BankAccount(String owner, int opening) {
        this.owner = owner;
        this.balance = Math.max(0, opening);
    }

    public void deposit(int amount) {
        if (amount > 0) balance += amount;
    }

    public boolean withdraw(int amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount;
        return true;
    }

    public int getBalance() { return balance; }
    public String getOwner() { return owner; }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount("Meera", 500);
        acc.deposit(250);
        System.out.println(acc.withdraw(1000));
        System.out.println(acc.withdraw(200));
        System.out.println(acc.getOwner() + " balance=" + acc.getBalance());
    }
}`,out:`false
true
Meera balance=550`,why:'balance is unreachable from outside, so the only paths to change it pass the guards: the 1000 withdrawal is refused (false) while 200 succeeds, leaving 500+250-200 = 550. The class can promise balance >= 0 forever.'},
   {t:'Advanced: constructor overloading and chaining via this()',code:`class Rectangle {
    private final int w;
    private final int h;

    Rectangle(int w, int h) {
        this.w = w;
        this.h = h;
    }

    Rectangle(int side) {
        this(side, side);
    }

    Rectangle() {
        this(1, 1);
    }

    int area() { return w * h; }
    public String toString() { return w + "x" + h; }
}

public class Main {
    public static void main(String[] args) {
        Rectangle r1 = new Rectangle(4, 3);
        Rectangle r2 = new Rectangle(5);
        Rectangle r3 = new Rectangle();
        System.out.println(r1 + " area=" + r1.area());
        System.out.println(r2 + " area=" + r2.area());
        System.out.println(r3 + " area=" + r3.area());
    }
}`,out:`4x3 area=12
5x5 area=25
1x1 area=1`,why:'this(side, side) delegates to the two-argument constructor so initialisation logic exists once. final fields make instances immutable after construction, and the overridden toString powers readable printing.'}
  ],
  walk:[[26,'new BankAccount(...) allocates the object and invokes the constructor before the reference reaches acc.','construction enforced'],[27,'deposit adds 250 to the (private) balance through the class\'s own code path.','balance 750'],[28,'withdraw(1000) fails the guard (1000 > 750) and returns false WITHOUT mutating state.','invariant preserved'],[29,'The legal 200 withdrawal debits; getBalance provides read-only viewing of the private field.','balance 550']],
  walkWhy:'Guarantees hold because state has exactly one gatekeeper. Encapsulated classes let you audit correctness by reading one file instead of hunting every user of a public field.',
  rules:['If ANY constructor is declared, Java stops providing the default no-arg constructor — add it explicitly if needed.','Constructors have no return type; adding one silently converts it into a same-named method (a nasty trap).','this(...) chaining must be the FIRST statement of a constructor.','Reference variables default to null; calling a method on null throws NullPointerException.'],
  mistakes:[
   {t:'Losing the default constructor unknowingly',bad:'class Student {\n    Student(String n) { }\n}\n// elsewhere: new Student();',err:'error: constructor Student in class Student cannot be applied to given types; required: String',why:'Java only synthesises a no-arg constructor when the class declares NO constructors. Adding a convenient parameterised one breaks every no-arg caller and many frameworks.',fix:'class Student {\n    Student() { }               // add explicitly when needed\n    Student(String n) { }\n}',tip:'Decide constructor sets deliberately; add the no-arg form back if frameworks/reflection expect it.'},
   {t:'Shadowing fields without this (silent no-op assignment)',bad:'Student(String name, int roll) {\n    name = name;   // assigns parameter to itself\n    roll = roll;\n}',why:'Without this., both sides refer to the parameters; the fields keep default values (null/0) and every object comes out blank with no error whatsoever — one of Java\'s quietest bugs.',fix:'Student(String name, int roll) {\n    this.name = name;\n    this.roll = roll;\n}',tip:'Let the IDE generate constructors; if hand-writing, this.field on every line.'}
  ],
  cmp:['Public fields vs encapsulation',['Aspect','public int balance;','private + methods'],[['Invariant enforcement','Impossible — anyone writes','All changes pass class guards'],['Future redesign','Breaking change everywhere','Internals free to evolve'],['Read-only capability','None','Getter-only exposure'],['Typical verdict','Avoid in domain classes','Professional default']]],
  diag:{kind:'flow',start:'new ClassName(args)',condition:'Matching constructor?',trueAction:'Object initialised in a valid state',falseAction:'Compile error — signatures are checked',end:'Only methods may touch private state'},
  apps:['Account/Student/Order models in every business application.','DTO/entity classes in web backends mirror database rows behind accessors.','Immutable value objects (final fields, no setters) for coordinates/money.'],
  quizzes:[{q:'class A { A(int x) {} } — is new A() legal?',options:['Yes, default exists','No — declaring a constructor removes the implicit default','Yes, with null','Only in same package'],correct:1,why:'The implicit no-arg constructor is generated only when no constructor is declared at all.'},
            {q:'Inside Student(String name), the statement name = name; does what?',options:['Sets the field','Assigns the parameter to itself; the field stays null','Compile error','Creates a local variable'],correct:1,why:'Parameters shadow fields; without this. the field is never touched.'}],
  take:['Constructors guarantee objects are born valid; this() chains initialisation logic.','private fields + validating methods = invariants nobody can bypass.','Watch the two silent traps: vanished default constructor, and name=name shadowing.'],
  rev:'new → constructor (same name, no return). private fields + getters/setters. this.field disambiguates; this() chains (first line). Any ctor kills implicit default.',
  assign:{p:'Create class Book with private title (String) and pages (int), constructor, getTitle/getPages, and setPages that ignores values <= 0. In main create Book("Clean Code", 464), attempt setPages(-5) then setPages(480), printing "Clean Code: 480 pages".',s:`// TODO: class Book with encapsulation
public class Main {
    public static void main(String[] args) {
    }
}`,sol:`class Book {
    private String title;
    private int pages;

    Book(String title, int pages) {
        this.title = title;
        setPages(pages);
    }

    public String getTitle() { return title; }
    public int getPages() { return pages; }

    public void setPages(int pages) {
        if (pages > 0) this.pages = pages;
    }
}

public class Main {
    public static void main(String[] args) {
        Book b = new Book("Clean Code", 464);
        b.setPages(-5);
        b.setPages(480);
        System.out.println(b.getTitle() + ": " + b.getPages() + " pages");
    }
}`}
},
{
  id:'java-inheritance-polymorphism', walkEx:2, course_id:'java', unit_id:'java-unit-3', order_index:2,
  title:'Inheritance & Polymorphism: extends, super and Overriding', desc:'Reuse and specialise classes with single inheritance, dynamic dispatch and instanceof.',
  obj:['Build a subclass with extends and chain constructors with super()','Override methods (@Override) and predict dynamic dispatch','Use parent-type references with safe instanceof-tested downcasts'],
  pre:['Classes & objects','Methods'],
  outcomes:['Learner designs is-a hierarchies and writes polymorphic client code'],
  def:'Inheritance lets a subclass extend one superclass, inheriting accessible fields/methods while adding or overriding behaviour. super(...) invokes the superclass constructor (mandatory as a constructor\'s first statement when used). Polymorphism means a superclass-typed reference invokes the actual object\'s overridden method at runtime (dynamic dispatch).',
  simple:'Inheritance is the family-resemblance tool: a SavingsAccount IS-A BankAccount with extras, so it inherits deposit/withdraw for free and only writes what is new (interest). When the child needs the parent\'s setup, its constructor must first call super(...) — the parent gets built before the child adds its layer, like foundations before walls. Polymorphism is the payoff: code written against the parent type (BankAccount acc) happily drives any child object, and when both define fee(), the CHILD\'s version runs (Java looks at the real object, not the variable\'s declared type). That single rule powers most framework extensibility.',
  hing:'Inheritance matlab child class parent ke features muft me paati hai aur sirf apne naye hisse likhti hai. "IS-A" test lagaye rakho: SavingsAccount IS-A BankAccount — sahi. Child ke constructor ki pehli line me super(...) se parent wala hissa banta hai; na likho to Java chup-chaap super() lagata hai, aur agar parent ke paas no-arg constructor hi nahi hai to compile error pakka. Polymorphism ka matlab: BankAccount type ke variable me SavingsAccount object rakho, fee() call karne par CHILD wala version chalega — Java hamesha asli object dekh kar decide karta hai (dynamic dispatch). @Override annotation lagana mat bhoolna: spelling galti par compiler tumhe bacha lega, warna nayi method banegi aur purani hi chalegi!',
  why:'Inheritance + overriding are how Java libraries offer extension points (your servlet overrides doGet; your test overrides setUp). Polymorphic collections and methods written against base types let systems accept future subclasses without modification — the open/closed idea in action.',
  when:'Use inheritance strictly for true is-a relationships with substitutability; prefer composition (has-a) for reuse of capabilities. Keep hierarchies shallow; make methods final when overriding would break invariants.',
  syntax:'class Savings extends Account {\n    Savings(String owner) {\n        super(owner);            // must be first\n    }\n    @Override\n    int fee() { return 0; }      // replaces parent fee\n}',
  comp:[['extends (single)','A class has at most one direct superclass; interfaces supply multiple behaviours'],['super()','Calls the parent constructor; inserted implicitly when omitted and available'],['Dynamic dispatch','Overridden method chosen by the object\'s runtime class']],
  ex:[
   {t:'Basic: inheriting and extending behaviour',code:`class Animal {
    protected String name;

    Animal(String name) {
        this.name = name;
    }

    void breathe() {
        System.out.println(name + " breathes");
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    void bark() {
        System.out.println(name + " says woof");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog d = new Dog("Bruno");
        d.breathe();
        d.bark();
    }
}`,out:`Bruno breathes
Bruno says woof`,why:'Dog inherits name and breathe without re-declaring them; super(name) runs Animal\'s constructor first to establish the base state. protected grants subclass access while keeping the field hidden from the world.'},
   {t:'Intermediate: overriding with dynamic dispatch',code:`class Account {
    String owner;
    Account(String owner) { this.owner = owner; }
    int monthlyFee() { return 100; }
    String describe() { return owner + " fee=" + monthlyFee(); }
}

class Savings extends Account {
    Savings(String owner) { super(owner); }
    @Override
    int monthlyFee() { return 0; }
}

class Premium extends Account {
    Premium(String owner) { super(owner); }
    @Override
    int monthlyFee() { return 500; }
}

public class Main {
    public static void main(String[] args) {
        Account[] accounts = {
            new Account("Asha"),
            new Savings("Diya"),
            new Premium("Raj")
        };
        for (Account a : accounts) {
            System.out.println(a.describe());
        }
    }
}`,out:`Asha fee=100
Diya fee=0
Raj fee=500`,why:'One loop over the BASE type calls each subclass\'s monthlyFee because overrides dispatch by actual object type — including the call inside the inherited describe(). Adding a new account kind requires zero edits to the loop.'},
   {t:'Advanced: instanceof checks and safe downcasting',code:`class Shape {
    String name() { return "shape"; }
}

class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    @Override
    String name() { return "circle r=" + radius; }
    double area() { return 3.14159 * radius * radius; }
}

public class Main {
    public static void main(String[] args) {
        Shape s = new Circle(2.0);
        System.out.println(s.name());
        System.out.println(s instanceof Circle);
        if (s instanceof Circle) {
            Circle c = (Circle) s;
            System.out.println("area=" + c.area());
        }
        Shape plain = new Shape();
        System.out.println(plain instanceof Circle);
    }
}`,out:`circle r=2.0
true
area=12.56636
false`,why:'s.name() dispatches to Circle even through a Shape reference. Accessing Circle-only behaviour needs a guarded downcast: test with instanceof, then cast. Skipping the test risks ClassCastException (Java 16+ pattern-matching fuses both steps into a one-liner).'}
  ],
  walk:[[22,'The array is typed as Account[] yet stores three DIFFERENT concrete classes — legal because every subclass is-a Account.','static type Account'],[28,'a.describe() is inherited once, but its inner call monthlyFee() is virtual.', 'describe shared'],[5,'At runtime, fee resolves on the object\'s actual class: Account→100, Savings→0, Premium→500.','dispatch by object, not reference'],[27,'The loop body needs no type tests or edits as new account types appear.', 'open for extension']],
  walkWhy:'Dynamic dispatch rebinds overridden methods per object while fields and overloaded (non-override) choices bind statically — distinguishing these two is the key interview-grade insight.',
  rules:['Java classes have exactly one direct superclass; multiple type inheritance needs interfaces.','super(...) must be the first constructor statement; if the parent lacks a no-arg constructor, explicit super(args) is compulsory.','Overridden methods cannot reduce visibility or change return type incompatibly; annotate @Override to catch typos.','Fields are hidden, not overridden: access binds by the REFERENCE type, unlike methods.'],
  mistakes:[
   {t:'Typo creates a new method instead of overriding',bad:'class Savings extends Account {\n    int monthlyfee() { return 0; }   // lowercase f: no override!\n}',why:'The compiler sees an unrelated fresh method, so polymorphic calls keep running the parent version. Everything compiles and behaves "mostly right" — the worst failure shape.',fix:'@Override\nint monthlyFee() { return 0; }',tip:'@Override is free compile-time verification. Use it on every intended override, always.'},
   {t:'Blind downcast without a real subtype',bad:'Account a = new Account("x");\nSavings s = (Savings) a;  // ClassCastException at runtime',err:'java.lang.ClassCastException: class Account cannot be cast to class Savings',why:'A cast promises the object truly is the subtype; a base instance lacks subclass parts, so the JVM refuses the lie at runtime, crashing the operation.',fix:'if (a instanceof Savings) {\n    Savings s = (Savings) a;  // guarded cast\n    // use s safely here\n}',tip:'Prefer polymorphic design so casts are rare; when needed, instanceof first, cast second (Java 16+ merges these into a pattern).'}
  ],
  cmp:['Overloading vs overriding',['Aspect','Overloading','Overriding'],[['Where','Same class (or inherited set)','Subclass replaces parent method'],['Signature','Must differ in parameters','Must match (same params)'],['Chosen','Compile time from argument types','Runtime from object class'],['Annotation','None','@Override recommended']]],
  diag:{kind:'flow',start:'Base-typed reference, call method',condition:'Method overridden in object?',trueAction:'Runs the subclass version',falseAction:'Runs the inherited version',end:'Fields, by contrast, bind by reference type'},
  apps:['Framework callbacks: HttpServlet subclasses override doGet/doPost.','Game entities sharing position/update via a GameObject base.','Payment methods (Card/UPI/Wallet) behind one Payment supertype for checkout code.'],
  quizzes:[{q:'Account a = new Savings("Zed"); a.monthlyFee() invokes…',options:['Account version (variable type rules)','Savings version (object type rules)','Compile error','Both sequentially'],correct:1,why:'Overridden methods dispatch dynamically by the runtime class of the object.'},
            {q:'A subclass constructor omits super(...). What happens when the parent has ONLY Account(String)?',options:['Java invents a default','Compile error: implicit super() has no matching constructor','Runs with null','Parent constructor skipped entirely'],correct:1,why:'The compiler inserts super() which does not exist; you must call super("...") explicitly as the first statement.'}],
  take:['extends = is-a reuse; super() builds the parent part first, always.','Overrides dispatch by the object\'s class at runtime; mark them @Override.','Test with instanceof before any downcast; fields bind statically, unlike methods.'],
  rev:'Single inheritance. super() first line. @Override typo-guard. Method calls: runtime type. Downcast = instanceof test, then cast.',
  assign:{p:'Build class Vehicle {String brand; Vehicle(String); String horn(){return "beep";}} and subclass Truck overriding horn() to "HONK" with constructor chaining. Store both in Vehicle[] and print each as "<brand>: <horn>". Expected:\nMaruti: beep\nTata: HONK',s:`// TODO: Vehicle + Truck override + polymorphic loop
public class Main {
    public static void main(String[] args) {
    }
}`,sol:`class Vehicle {
    String brand;
    Vehicle(String brand) { this.brand = brand; }
    String horn() { return "beep"; }
}

class Truck extends Vehicle {
    Truck(String brand) { super(brand); }
    @Override
    String horn() { return "HONK"; }
}

public class Main {
    public static void main(String[] args) {
        Vehicle[] fleet = { new Vehicle("Maruti"), new Truck("Tata") };
        for (Vehicle v : fleet) {
            System.out.println(v.brand + ": " + v.horn());
        }
    }
}`}
},
{
  id:'java-abstract-interfaces', walkEx:2, course_id:'java', unit_id:'java-unit-3', order_index:3,
  title:'Abstract Classes & Interfaces: Contracts and Capabilities', desc:'Define what without how — abstract methods, interface contracts, default methods and multiple interfaces.',
  obj:['Create abstract classes with shared state + abstract methods','Implement interfaces (multiple) and use default methods','Choose abstract class vs interface for a given design need'],
  pre:['Inheritance & polymorphism'],
  outcomes:['Learner designs capabilities decoupled from concrete classes'],
  def:'An abstract class cannot be instantiated; it may hold state, constructors and a mix of implemented and abstract methods that subclasses must implement. An interface is a pure contract of method signatures (plus constants and default method bodies since Java 8); a class may implement many interfaces but extend only one class.',
  simple:'Think of an interface as a job advertisement: "must be able to draw()" — it says WHAT is required, never HOW. Any class signing the contract (implements Drawable) must supply the actual skill, and client code can work with "anything drawable" without caring what it is. An abstract class is a half-built template employee: shared state (name, id) and some finished methods come built-in, but a few abstract duties stay blank for each concrete subclass to complete; you can never hire the template directly (no instantiation). Default methods let an interface ship a standard implementation that classes may keep or override.',
  hing:'Interface matlab ek contract: "jo bhi mujhe implement kare, uske paas ye methods hone hi chahiye" — par kaam kaise hoga, ye class ki marzi. Ek class kai interfaces ek saath implement kar sakti hai (yehi Java ka multiple inheritance ka badla hai). Abstract class aadha-bana template hai: kuch methods ready, kuch abstract (bina body wale) jo child ko pure karne hi paden ga, aur uska khud ka object bann hi nahi sakta. Java 8 se interface me default method (body ke saath) bhi de sakte ho — class chahe to use rakhe ya override kare. Rule yaad rakho: shared STATE chahiye to abstract class; sirf capability/contract chahiye (aur kai jagah chahiye) to interface.',
  why:'Interfaces decouple code from concrete classes — the entire Java Collections design (List, Set, Map interfaces), Comparable, Runnable and modern APIs hinge on coding to contracts. Abstract classes share implementation scaffolding where state genuinely belongs to the family.',
  when:'Prefer interfaces for capabilities that unrelated classes might share (Comparable, Drawable) and whenever a type needs several contracts. Use an abstract class when subclasses truly share fields/constructors/implemented helpers (template-method patterns).',
  syntax:'interface Payable {\n    double amount();\n    default String currency() { return "INR"; }\n}\nabstract class Employee {\n    String name;\n    abstract double salary();\n}\nclass Invoice implements Payable { ... }',
  comp:[['abstract method','Signature without body; subclasses must implement it'],['implements','Class promises every interface method (or is itself abstract)'],['default method','Interface-provided body, inherited unless overridden']],
  ex:[
   {t:'Basic: an interface contract with two implementations',code:`interface Drawable {
    String draw();
}

class Circle implements Drawable {
    public String draw() { return "O"; }
}

class Square implements Drawable {
    public String draw() { return "[]"; }
}

public class Main {
    static void render(Drawable d) {
        System.out.println("rendering: " + d.draw());
    }
    public static void main(String[] args) {
        render(new Circle());
        render(new Square());
        Drawable thing = new Circle();
        System.out.println(thing instanceof Drawable);
    }
}`,out:`rendering: O
rendering: []
true`,why:'render depends only on the contract, not on Circle/Square details. Interface implementations must be public — an interface method is implicitly public abstract, and an implementation cannot reduce visibility.'},
   {t:'Intermediate: abstract class sharing state and helpers',code:`abstract class Employee {
    protected String name;

    Employee(String name) { this.name = name; }

    abstract int monthlyPay();

    String payslip() {
        return name + " earns " + monthlyPay() + " this month";
    }
}

class Salaried extends Employee {
    Salaried(String name) { super(name); }
    int monthlyPay() { return 60000; }
}

class Hourly extends Employee {
    private int hours;
    private int rate;
    Hourly(String name, int hours, int rate) {
        super(name);
        this.hours = hours;
        this.rate = rate;
    }
    int monthlyPay() { return hours * rate; }
}

public class Main {
    public static void main(String[] args) {
        Employee e1 = new Salaried("Diya");
        Employee e2 = new Hourly("Kabir", 80, 500);
        System.out.println(e1.payslip());
        System.out.println(e2.payslip());
    }
}`,out:`Diya earns 60000 this month
Kabir earns 40000 this month`,why:'The template method payslip() is implemented once in the base and calls the abstract monthlyPay() dynamically. Employee itself can never be instantiated — only complete subclasses are created.'},
   {t:'Advanced: default methods and multiple interfaces',code:`interface Loggable {
    default String tag() { return "APP"; }
}

interface Payable {
    int amount();
    default String currency() { return "INR"; }
}

class Invoice implements Payable, Loggable {
    private int total;
    Invoice(int total) { this.total = total; }
    public int amount() { return total; }
}

class ForeignInvoice implements Payable {
    public int amount() { return 50; }
    @Override
    public String currency() { return "USD"; }
}

public class Main {
    public static void main(String[] args) {
        Invoice inv = new Invoice(1500);
        System.out.println(inv.tag() + " " + inv.currency() + " " + inv.amount());
        ForeignInvoice f = new ForeignInvoice();
        System.out.println(f.currency() + " " + f.amount());
    }
}`,out:`APP INR 1500
USD 50`,why:'Invoice implements two contracts at once and inherits both defaults untouched. ForeignInvoice overrides just the currency default — interface evolution without breaking existing implementers is exactly why default methods exist.'}
  ],
  walk:[[6,'Employee declares monthlyPay() abstract: every concrete subclass must supply its own pay formula before it can be instantiated.','contract without implementation'],[9,'The concrete payslip() helper is shared scaffolding: it formats the name and dynamically dispatches monthlyPay() to the actual subclass.','template method pattern'],[26,'Hourly implements the missing formula as hours × rate, so Kabir earns 80 × 500.','subclass supplies formula'],[34,'Calling payslip() on the Hourly object reuses Employee formatting while the pay amount comes from Hourly.','state + helper reuse']],
  walkWhy:'Interfaces promise capability without inheritance entanglement; abstract classes factor shared family implementation. Modern Java designs lean interface-first, using abstract classes only for genuine shared state/scaffolding.',
  rules:['A class may implement unlimited interfaces but extend only one class (abstract or concrete).','Interface fields are implicitly public static final constants; interface methods are public abstract unless default/static.','Implementations must be public — reducing visibility is a compile error.','If two inherited defaults clash, the class MUST override to resolve the diamond explicitly.'],
  mistakes:[
   {t:'Implementing an interface method with weaker visibility',bad:'interface Drawable { String draw(); }\nclass Circle implements Drawable {\n    String draw() { return "O"; }  // package-private',err:'error: draw() in Circle cannot implement draw() in Drawable; attempting to assign weaker access privileges',why:'Interface methods are public by contract. A non-public implementation would break callers who hold a Drawable reference and legally expect access.',fix:'class Circle implements Drawable {\n    public String draw() { return "O"; }\n}',tip:'When the IDE generates implementations it adds public automatically — that modifier is compulsory, not decorative.'},
   {t:'Trying to instantiate an abstract class/interface',bad:'Employee e = new Employee("x");\nDrawable d = new Drawable();',err:'error: Employee is abstract; cannot be instantiated',why:'The template deliberately lacks pieces (abstract methods have no body); only concrete subclasses/implementations are complete enough to exist as objects.',fix:'Employee e = new Salaried("x");\nDrawable d = new Circle();',tip:'Declare variables with the abstract/interface TYPE, but always new a concrete class.'}
  ],
  cmp:['Abstract class vs interface',['Dimension','abstract class','interface'],[['State/instance fields','Yes (protected fields, constructors)','Only public static final constants'],['How many per class','One (extends)','Many (implements)'],['Implemented methods','Any mix','default/static since Java 8'],['Best for','Family template with shared scaffolding','Capability contract across families']]],
  diag:{kind:'flow',start:'Need shared abstraction',condition:'Shared state/constructors?',trueAction:'Abstract class template',falseAction:'Interface contract (multi-implementable)',end:'Client code depends on the abstraction'},
  apps:['List/Set/Map interfaces let code swap ArrayList↔LinkedList without edits.','Comparable contract powers generic sorting of your own classes.','Payment/webhook handler interfaces decouple processors from provider specifics.'],
  quizzes:[{q:'A class needs both a Logger capability and a Payable contract. How?',options:['Impossible in Java','extends both','implements Payable, Logger — multiple interfaces are fine','Only via abstract class chain'],correct:2,why:'Multiple interface implementation is Java\'s supported route to multiple type contracts.'},
            {q:'What must be true of a class implementing an interface (non-abstract class)?',options:['It may skip methods','It must implement every abstract interface method as public','It inherits all methods always','Default methods must be overridden'],correct:1,why:'The contract is binding: all abstract methods get public implementations (defaults are optional to override).'}],
  take:['Interfaces = capabilities/contracts, many per class, minimal coupling.','Abstract classes = one family template with shared state + forced abstract parts.','Default methods evolve interfaces safely; implementations must stay public.'],
  rev:'interface: public abstract methods + defaults; implement many. abstract class: fields/ctors/mix, no new. Program to the interface type.',
  assign:{p:'Define interface Scorable { int score(); } and classes Exam (returns marks field via constructor) and BonusExam wrapping a base marks+5 (simple: fields marks, bonus; score returns marks+bonus). Print score() of Exam(78) and BonusExam(78, 5) as: 78 then 83.',s:`// TODO: Scorable interface + two implementations
public class Main {
    public static void main(String[] args) {
    }
}`,sol:`interface Scorable {
    int score();
}

class Exam implements Scorable {
    private int marks;
    Exam(int marks) { this.marks = marks; }
    public int score() { return marks; }
}

class BonusExam implements Scorable {
    private int marks;
    private int bonus;
    BonusExam(int marks, int bonus) {
        this.marks = marks;
        this.bonus = bonus;
    }
    public int score() { return marks + bonus; }
}

public class Main {
    public static void main(String[] args) {
        Scorable e = new Exam(78);
        Scorable b = new BonusExam(78, 5);
        System.out.println(e.score());
        System.out.println(b.score());
    }
}`}
},
{
  id:'java-exception-handling', course_id:'java', unit_id:'java-unit-3', order_index:4,
  title:'Exception Handling in Java: try, catch, finally & throws', desc:'Handle failures with checked/unchecked exceptions, multi-catch, finally and try-with-resources.',
  obj:['Catch specific exceptions and use getMessage for diagnostics','Distinguish checked vs unchecked exceptions and declare throws','Apply finally guarantees and try-with-resources for cleanup'],
  pre:['Classes & interfaces','Strings (parse errors)'],
  outcomes:['Learner builds Java code that survives invalid data and resource leaks'],
  def:'An exception is an object (subclass of Throwable) thrown when an operation fails. Checked exceptions (e.g. IOException) must be caught or declared with throws; unchecked (RuntimeException family) need not be. try/catch handles, finally always executes, and try-with-resources auto-closes AutoCloseable resources.',
  simple:'Java errors travel as objects thrown up the call chain until someone catches them — like a hot potato no function can pretend not to see. Java\'s special twist: CHECKED exceptions are part of a method\'s visible contract ("I may throw IOException") and the compiler forces every caller to either catch it or paste the warning forward with throws. UNCHECKED ones (NumberFormatException, NullPointerException) signal programming/data slips and need no declaration. finally is the guaranteed mop-up that runs whether all went well or not, and try-with-resources automates the most common mop-up of all: closing what you opened.',
  hing:'Java me exception ek object hai jo error par throw hota hai aur catch dhundhte hue upar jata hai. Do prakar marhoom rakho: CHECKED (like IOException) — compiler majboor karega ya to catch karo ya method par throws laga do; UNCHECKED (NumberFormatException, ArithmeticException) — declaration ki zaroorat nahi. catch me specific type pehle likho, generic Exception sabse aakhir me, kyunki upar wala hi pehle match hota hai. finally block har haal me chalega — return ho ya exception. File/stream band karne ke liye try-with-resources sabse saaf hai: try (Scanner sc = ...) likhte hi band hona pakka. Aur khaali catch {} kabhi mat chhodo — error ko chup-chaap marna sabse bura bug chhipata hai!',
  why:'Files go missing, numbers arrive malformed, networks drop. Java\'s checked-exception discipline forces these realities into the open at compile time; finally/try-with-resources stop the resource leaks that silently kill long-running services.',
  when:'Catch exceptions where you can genuinely recover (ask again, use default, skip record); declare throws where callers should decide. Never swallow with an empty catch; log or rethrow with context. Use unchecked exceptions for programming errors and invalid arguments in your own code.',
  syntax:'try {\n    int n = Integer.parseInt(text);\n} catch (NumberFormatException e) {\n    System.out.println("bad: " + e.getMessage());\n} finally {\n    // always runs\n}\nstatic String read() throws IOException { ... }',
  comp:[['Checked exception','Compile-time enforced: catch or declare (IOException, SQLException)'],['Unchecked exception','RuntimeException family: bugs/bad data; declaration optional'],['try-with-resources','try (Resource r = ...) auto-closes AutoCloseable in reverse order']],
  ex:[
   {t:'Basic: catching parse and math failures',code:`public class Main {
    public static void main(String[] args) {
        try {
            int age = Integer.parseInt("twenty");
            System.out.println(age);
        } catch (NumberFormatException e) {
            System.out.println("bad number input");
        }
        try {
            System.out.println(10 / 0);
        } catch (ArithmeticException e) {
            System.out.println("math error: " + e.getMessage());
        }
        int ok = Integer.parseInt("42");
        System.out.println("parsed " + ok);
    }
}`,out:`bad number input
math error: / by zero
parsed 42`,why:'parseInt on letters throws NumberFormatException; integer division by zero throws ArithmeticException carrying the message "/ by zero". Both are unchecked, and handling them locally lets the program continue to the successful parse.'},
   {t:'Intermediate: multi-catch, finally ordering and custom throws',code:`public class Main {
    static int withdraw(int balance, int amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        if (amount > balance) throw new IllegalStateException("insufficient funds");
        return balance - amount;
    }

    public static void main(String[] args) {
        int[] tries = {30, -5, 500};
        for (int amt : tries) {
            try {
                System.out.println("new balance: " + withdraw(100, amt));
            } catch (IllegalArgumentException | IllegalStateException e) {
                System.out.println("rejected: " + e.getMessage());
            } finally {
                System.out.println("(attempt logged)");
            }
        }
    }
}`,out:`new balance: 70
(attempt logged)
rejected: amount must be positive
(attempt logged)
rejected: insufficient funds
(attempt logged)`,why:'Multi-catch (|) applies one handler to both business-rule breaches, while finally runs after each outcome — success, then each rejection — proving its unconditional nature per iteration.'},
   {t:'Advanced: try-with-resources and checked exceptions',code:`import java.io.*;
import java.nio.file.*;

public class Main {
    static void writeLines(Path file) throws IOException {
        try (BufferedWriter w = Files.newBufferedWriter(file)) {
            w.write("line one");
            w.newLine();
            w.write("line two");
            w.newLine();
        }
    }

    static long countLines(Path file) throws IOException {
        try (BufferedReader r = Files.newBufferedReader(file)) {
            long count = 0;
            while (r.readLine() != null) count++;
            return count;
        }
    }

    public static void main(String[] args) {
        Path file = Path.of("notes.txt");
        try {
            writeLines(file);
            System.out.println("lines=" + countLines(file));
        } catch (IOException e) {
            System.out.println("io problem: " + e.getMessage());
        }
        try {
            countLines(Path.of("missing.txt"));
        } catch (IOException e) {
            System.out.println("missing handled: " + e.getClass().getSimpleName());
        }
    }
}`,out:`lines=2
missing handled: NoSuchFileException`,why:'IOException is checked: the helper methods declare throws, and main must handle it. Try-with-resources closes readers/writers even if a read fails midway. The absent file surfaces as the precise subclass NoSuchFileException.'}
  ],
  walk:[[4,'parseInt scans "twenty", finds no leading digits, and throws NumberFormatException — the assignment never completes.','throw point'],[6,'The remainder of the try block is skipped; the matching handler runs and prints the friendly message.','caught locally'],[10,'A fresh try evaluates 10/0; integer arithmetic throws ArithmeticException instead of producing Infinity.','second exception type'],[14,'Normal flow resumes after the handlers, parsing "42" successfully — failures were localised, not fatal.','program survived']],
  walkWhy:'Each try defines the blast radius of a failure; precise catch types convert crashes into branchable outcomes, and code after the construct proceeds only through paths that handled or avoided the fault.',
  rules:['Catch specific types before generic ones; a preceding catch (Exception) makes specific later handlers unreachable (compile error for checked).','Never write an empty catch block; at minimum log the exception (e.printStackTrace in coursework, a logger in services).','finally executes even with return/throw inside try; a return inside finally silently overrides everything — avoid it.','Methods throwing checked exceptions must declare them with throws; callers must catch or further declare.'],
  mistakes:[
   {t:'Swallowing exceptions silently',bad:'try { save(record); } catch (Exception e) { }',why:'Every failure — disk full, permission denied, bug — vanishes. Users believe data saved; debugging later becomes archaeology with no evidence.',fix:'try { save(record); }\ncatch (IOException e) {\n    System.out.println("save failed: " + e.getMessage());\n    // retry, queue, or inform the caller\n}',tip:'If you cannot recover, rethrow (possibly wrapped) — silence is the only indefensible option.'},
   {t:'Catching Exception too broadly and in the wrong order',bad:'catch (Exception e) { generic(); }\ncatch (IOException e) { specific(); }  // unreachable',err:'error: exception IOException has already been caught',why:'Handlers are tested top-down; Exception is the superclass of IOException, so it captures everything first. The compiler rejects the dead handler for checked cases — a helpful nudge toward specificity.',fix:'catch (IOException e) { specific(); }\ncatch (Exception e) { generic(); }',tip:'Order catches like an inverted funnel: most specific at the top, broadest at the bottom.'}
  ],
  cmp:['Checked vs unchecked exceptions',['Aspect','Checked (IOException)','Unchecked (IllegalArgumentException)'],[['Compiler enforcement','Must catch or declare throws','No declaration required'],['Typical cause','External realities (file, network)','Programming errors, bad arguments'],['In own APIs','Sparingly; forces caller burden','Preferred for contract violations'],['Hierarchy root','Exception (excluding RuntimeException)','RuntimeException subtree']]],
  diag:{kind:'flow',start:'Failure detected',condition:'Checked type?',trueAction:'Must catch or declare throws',falseAction:'Propagates unless caught (unchecked)',end:'finally/try-resources cleans up'},
  apps:['Form/input parsing converts NumberFormatException into user-facing corrections.','File/report generation wraps IOException with retry or failure reporting.','Business rule guards throw IllegalState/Argument exceptions handled at API boundaries.'],
  quizzes:[{q:'Which statement about finally is correct?',options:['Runs only on success','Runs only on exception','Runs in both cases (even with return)','Replaces catch entirely'],correct:2,why:'finally is the unconditional path: success, exception, return and break all pass through it.'},
            {q:'A method body can throw IOException but neither catches it nor declares throws. Result?',options:['Runtime warning','Compile error (checked exception discipline)','Auto-converted to RuntimeException','Program skips the line'],correct:1,why:'Checked exceptions are part of the compile-time contract and must be handled or declared.'}],
  take:['Specific catches first; never swallow; finally is unconditional.','Checked = declare or handle (compiler enforces); unchecked = for bugs/bad args.','try-with-resources is the default pattern for anything AutoCloseable.'],
  rev:'try{...}catch(Specific e){...}finally{always}. Checked needs throws. Multi-catch with |. getMessage() explains. Resources in try(...) auto-close.',
  assign:{p:'Write static int parseMarks(String text) that uses Integer.parseInt, throws IllegalArgumentException("marks must be 0..100") when out of range. In main print results for "85", "abc", "150" catching each failure with a friendly line. Expected:\n85\nbad format\nmarks must be 0..100',s:`public class Main {
    // TODO: parseMarks + demo over {"85","abc","150"}
    public static void main(String[] args) {
    }
}`,sol:`public class Main {
    static int parseMarks(String text) {
        int marks = Integer.parseInt(text);
        if (marks < 0 || marks > 100) {
            throw new IllegalArgumentException("marks must be 0..100");
        }
        return marks;
    }

    public static void main(String[] args) {
        for (String t : new String[]{"85", "abc", "150"}) {
            try {
                System.out.println(parseMarks(t));
            } catch (NumberFormatException e) {
                System.out.println("bad format");
            } catch (IllegalArgumentException e) {
                System.out.println(e.getMessage());
            }
        }
    }
}`}
},
{
  id:'java-generics-basics', course_id:'java', unit_id:'java-unit-2', order_index:2,
  title:'Generics Basics: Type Parameters, Bounded Types & Wildcards', desc:'Write type-safe generic classes/methods and understand <T>, bounds and ? wildcards.',
  obj:['Declare generic classes and methods with type parameter <T>','Use bounded type parameters (<T extends Comparable<T>>)','Read wildcard signatures (? extands/? super) at a basic level'],
  pre:['Collections (List/Map usage)','Interfaces'],
  outcomes:['Learner builds reusable type-safe containers without casts'],
  def:'Generics parameterise classes, interfaces and methods over types: class Box<T> works for any reference type while the compiler enforces that a Box<String> only ever yields Strings. Bounds restrict T (T extends Number). Wildcards (?) express "some unknown type" in API signatures. Type information is erased at runtime (type erasure).',
  simple:'Before generics, a reusable container had to store Object — the "{}" of Java — and every retrieval needed a hopeful cast that could explode at runtime if the wrong thing went in. Generics are labels you fill in when you USE the class: Box<String> is a box certified to hold only strings, so Box.get() hands back a String with no cast and putting an Integer in is a compile error you see immediately. You have already lived on generics: ArrayList<String>, HashMap<String,Integer> — the angle brackets are the compiler\'s promise-keeping system. Bounds like <T extends Number> say "any T, as long as it is a number family type", unlocking number methods on T.',
  hing:'Generic matlab class/method likhte waqt type ki jagah khaali label <T> chhod do, aur use karte waqt bharo: Box<String>, Box<Integer> — compiler waa da nibhayega ki String wali box me galti se Integer nahi jayega, aur bahar nikaalte samay cast ki zaroorat bhi nahi. ArrayList<String> jo aap pehle se use kar rahe ho, ye wahi system hai! Kuch sarhaden (bounds) bhi laga sakte ho: <T extends Number> matlab T sirf number family ka ho sakta hai. Ek ajeeb sach: primitives (int) Generics me nahi chalte — wrapper (Integer) lagta hai. Aur runtime par ye type info mit jati hai (type erasure) isliye new T() jaise kaam allowed nahi.',
  why:'Generics convert runtime ClassCastException crashes into compile-time errors and remove cast clutter from every collection use. They are the vocabulary of all modern Java APIs — streams, Optional, futures — making this topic unavoidable.',
  when:'Write generic code when logic is truly type-independent (containers, pairs, result wrappers, algorithms). Use bounds when operations on T are needed (compareTo, doubleValue). Prefer List<T>-style parameters over raw types always; raw types (List without <>) exist only for legacy compatibility.',
  syntax:'class Box<T> {\n    private T value;\n    void set(T value) { this.value = value; }\n    T get() { return value; }\n}\nstatic <T extends Comparable<T>> T maxOf(T a, T b) { ... }',
  comp:[['Type parameter <T>','Placeholder replaced by a concrete reference type at use sites'],['Bound extends','Upper bound: T must be that type or a subtype, enabling its methods'],['Wildcard ?','Unknown type: List<? extends Number> reads Numbers; List<? super Integer> accepts Integers']],
  ex:[
   {t:'Basic: a generic Box with compile-time type safety',code:`class Box<T> {
    private T value;

    void set(T value) { this.value = value; }
    T get() { return value; }
    boolean isEmpty() { return value == null; }
}

public class Main {
    public static void main(String[] args) {
        Box<String> nameBox = new Box<>();
        nameBox.set("Diya");
        String name = nameBox.get();
        System.out.println(name.toUpperCase());

        Box<Integer> rollBox = new Box<>();
        rollBox.set(42);
        int roll = rollBox.get();
        System.out.println(roll + 1);
        System.out.println(new Box<Double>().isEmpty());
    }
}`,out:`DIYA
43
true`,why:'The diamond <> infers T from the declaration. get() returns exactly String/Integer, so toUpperCase and arithmetic need no casts; writing nameBox.set(42) would be a compile-time error, not a runtime explosion.'},
   {t:'Intermediate: generic method with a Comparable bound',code:`public class Main {
    static <T extends Comparable<T>> T maxOf(T a, T b, T c) {
        T best = a;
        if (b.compareTo(best) > 0) best = b;
        if (c.compareTo(best) > 0) best = c;
        return best;
    }

    static <T> String describe(T value) {
        return value + " (" + value.getClass().getSimpleName() + ")";
    }

    public static void main(String[] args) {
        System.out.println(maxOf(3, 9, 4));
        System.out.println(maxOf("apple", "mango", "kiwi"));
        System.out.println(maxOf(2.5, 2.25, 3.75));
        System.out.println(describe(100));
        System.out.println(describe("text"));
    }
}`,out:`9
mango
3.75
100 (Integer)
text (String)`,why:'The bound guarantees compareTo exists on T, so one method serves Integer, String and Double. Lexicographically mango > apple and mango > kiwi, so mango wins. describe is unbounded, so it may only use Object/Class methods available to every T.'},
   {t:'Advanced: wildcards for flexible read APIs',code:`import java.util.List;

public class Main {
    static double sumAll(List<? extends Number> values) {
        double sum = 0;
        for (Number n : values) sum += n.doubleValue();
        return sum;
    }

    static void addRolls(List<? super Integer> sink) {
        sink.add(101);
        sink.add(102);
    }

    public static void main(String[] args) {
        System.out.println(sumAll(List.of(1, 2, 3)));
        System.out.println(sumAll(List.of(1.5, 2.5)));
        java.util.ArrayList<Number> nums = new java.util.ArrayList<>();
        addRolls(nums);
        System.out.println(nums);
    }
}`,out:`6.0
4.0
[101, 102]`,why:'? extends Number accepts List<Integer> and List<Double> for READ access as Number (PECS: producer-extends). ? super Integer accepts a List<Number> sink because adding Integers is safe there (consumer-super).'}
  ],
  walk:[[11,'Box<String> binds T=String for this variable\'s entire life; every method signature specialises accordingly.','T := String'],[12,'set("Diya") type-checks because the argument is a String; set(42) here would fail compilation.','checked at compile time'],[13,'get() statically returns String, so .toUpperCase() resolves directly with zero casts in source.','no cast needed'],[16,'A separate Box<Integer> coexists; autoboxing quietly wraps 42 to Integer on set and unwraps on arithmetic.','independent specialisation']],
  walkWhy:'Generics shift verification from runtime (casts failing mid-program) to compile time (errors in your editor), the central safety upgrade of Java 5-era design.',
  rules:['Primitives cannot be type arguments: List<int> is illegal — use List<Integer> (autoboxing bridges values).','Generics are invariant: List<String> is NOT a List<Object>; wildcards reintroduce controlled flexibility.','Type erasure removes T at runtime: no new T(), no T[] arrays, and instanceof cannot test List<String>.','Never use raw types (Box without <>) in new code — they disable all the checking generics exist to provide.'],
  mistakes:[
   {t:'Using a primitive as a type argument',bad:'Box<int> b = new Box<>();',err:'error: unexpected type: int (reference type required)',why:'Type parameters substitute reference types only; the compiler rejects primitives outright. Wrapper classes exist precisely to bridge this gap via autoboxing.',fix:'Box<Integer> b = new Box<>();\nb.set(5);            // autoboxed\nint v = b.get();     // unboxed (watch null!)',tip:'Learn the wrapper pairs (int↔Integer, double↔Double, boolean↔Boolean) — collections depend on them.'},
   {t:'Assuming List<String> can be passed where List<Object> is expected',bad:'static void printAll(java.util.List<Object> items) { }\nprintAll(java.util.List.of("a"));  // List<String> not accepted',err:'incompatible types: List<String> cannot be converted to List<Object>',why:'If it were allowed, printAll could add an Integer into your strings list through the Object view, restoring the very corruption generics banned. Invariance is protective, not pedantic.',fix:'static void printAll(java.util.List<?> items) { for (Object o : items) System.out.println(o); }',tip:'APIs that only read use ? extends T; APIs that only write use ? super T (PECS mnemonic).'}
  ],
  cmp:['Pre-generics Object style vs generics',['Aspect','Object + casts','Generics <T>'],[['Wrong-type insertion','Compiles, explodes later at a cast','Compile error immediately'],['Retrieval','String s = (String) box.get();','String s = box.get();'],['Documentation','Comments hope for the best','Signature states the type contract'],['Performance','Cast checks at runtime','Same runtime code, checks at compile time']]],
  diag:{kind:'flow',start:'Logic independent of type?',condition:'T needs specific methods?',trueAction:'Bound it: <T extends X>',falseAction:'Plain <T> + Object methods only',end:'Compiler enforces every use site'},
  apps:['Pair<K,V>/Result<T> wrappers for key-value and error-carrying returns.','Repository<T> style data layers in enterprise code.','Utility algorithms (max, swap of array elements, dedupe) written once for all types.'],
  quizzes:[{q:'Why is new Box<int>() rejected?',options:['Box is abstract','Type arguments must be reference types; use Integer','Diamond cannot be used','int is reserved'],correct:1,why:'Generics substitute reference types only; wrappers plus autoboxing cover primitives.'},
            {q:'List<? extends Number> parameter mainly allows the method to…',options:['Add any Number safely','Read elements as Number from List<Integer>/List<Double> etc.','Sort in place with mixed types','Store nulls only'],correct:1,why:'Producer-extends: the list produces Numbers for reading; adding is restricted because the exact element type is unknown.'}],
  take:['Generics move type errors from runtime casts to compile time; no raw types in new code.','Bounds (<T extends Comparable<T>>) unlock operations on T.','Wildcards follow PECS: produces→extends, consumes→super; primitives need wrappers.'],
  rev:'<T> placeholder, diamond <> infers. Invariant lists (List<String> != List<Object>). Bounded T extends X. Erasure: no new T(). Wrappers for primitives.',
  assign:{p:'Create class Pair<A, B> with final first/second fields, a constructor, and String show() returning "first=second" using string conversion. Print Pair<>("roll", 12).show() and Pair<>(3.5, true).show(). Expected:\nroll=12\n3.5=true',s:`// TODO: generic Pair<A,B>
public class Main {
    public static void main(String[] args) {
    }
}`,sol:`class Pair<A, B> {
    final A first;
    final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    String show() {
        return first + "=" + second;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Pair<>("roll", 12).show());
        System.out.println(new Pair<>(3.5, true).show());
    }
}`}
},
{
  id:'java-multithreading-basics', course_id:'java', unit_id:'java-unit-4', order_index:1,
  title:'Multithreading Basics: Threads, join & Synchronization', desc:'Start threads via Runnable, wait with join, and protect shared counters with synchronized.',
  obj:['Create and start threads with Runnable (and say why start() not run())','Use join() to wait for completion deterministically','Explain race conditions and guard shared state with synchronized'],
  pre:['Interfaces (Runnable)','Exception handling (InterruptedException)'],
  outcomes:['Learner writes small thread programs with predictable, race-free results'],
  def:'A thread is an independent path of execution sharing the process\'s heap with other threads. Work is supplied as a Runnable; Thread.start() schedules it concurrently, join() blocks until it finishes. When threads share mutable data, unsynchronised read-modify-write sequences race; synchronized serialises critical sections on a lock object.',
  simple:'By default Java runs your code like a single chef doing tasks one by one. Threads hire extra chefs who cook simultaneously and share the same kitchen (heap memory): downloads proceed while the screen stays responsive. You hand a chef a recipe card (a Runnable) and say start() — calling run() instead is just you cooking it yourself, no new chef. Sharing has a dark side: two chefs incrementing the same counter ("read value, add 1, store back") can overwrite each other\'s step and lose updates — a race condition. synchronized is the one-person-at-the-counter rule, and join() is waiting at the pass until a chef\'s dish is done before serving results.',
  hing:'Thread matlab ek hi program ke andar ek saath chal rahe kai kaam — jaise ek kitchen me kai chef. Recipe card = Runnable, chef ko kaam par lagana = thread.start(). Dhyan rahe: run() ko seedha bulana matlab khud hi banana — naya thread nahi banta! join() ka matlab hai intezaar karo jab tak wo thread kaam Khatm na kare — isse result deterministic banta hai. Sabse bada khatra hai race condition: do thread ek hi counter ko ++ kar rahe hain; "padho, jodo, likho" ke beech me dusra ghus gaya to update GAYAB. Iska ilaaj synchronized hai — ek time par sirf ek thread us hisse me jayega. Expert rule: shared data kam rakho, jo hai use lock se bachao.',
  why:'Parallelism keeps UIs responsive, servers concurrent and CPUs busy. But threads trade determinism for speed: race conditions produce intermittent wrong answers — the hardest bugs in computing. The basics here (start/join/synchronized) are the survival kit before executors/locks appear.',
  when:'Use threads (or higher-level executors) for independent blocking work (I/O) and CPU parallelism across cores. Guard every shared mutable field, keep critical sections tiny, and prefer immutable data or concurrent collections when possible. For coursework, Runnable + join gives reproducible results.',
  syntax:'Thread t = new Thread(() -> doWork());\nt.start();          // concurrent\n// ... other work ...\nt.join();           // wait for completion\nsynchronized (lock) { counter++; }  // guarded section',
  comp:[['Runnable','Single-method task card (void run()) — lambda-friendly'],['start() vs run()','start() spawns a real thread; run() is a plain method call on your thread'],['synchronized','One thread at a time per lock object: mutual exclusion for read-modify-write']],
  ex:[
   {t:'Basic: two threads, deterministic finish via join',code:`public class Main {
    public static void main(String[] args) throws InterruptedException {
        String[] outMsg = new String[2];
        Thread t1 = new Thread(() -> {
            int sum = 0;
            for (int i = 1; i <= 100; i++) sum += i;
            outMsg[0] = "A sum=" + sum;
        });
        Thread t2 = new Thread(() -> outMsg[1] = "B done");
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(outMsg[0]);
        System.out.println(outMsg[1]);
        System.out.println("main ends last");
    }
}`,out:`A sum=5050
B done
main ends last`,why:'Threads store their results in dedicated slots instead of printing directly, because the scheduler \u2014 not your code \u2014 decides which thread prints first. join() then guarantees both have finished before main prints in a fixed order, ending provably last.'},
   {t:'Intermediate: the race, then the synchronized fix',code:`public class Main {
    static int counter = 0;
    static final Object LOCK = new Object();

    public static void main(String[] args) throws InterruptedException {
        Runnable unsafe = () -> {
            for (int i = 0; i < 100000; i++) counter++;
        };
        Thread a = new Thread(unsafe);
        Thread b = new Thread(unsafe);
        a.start(); b.start(); a.join(); b.join();
        System.out.println("unsafe counter <= 200000? " + (counter <= 200000));

        counter = 0;
        Runnable safe = () -> {
            for (int i = 0; i < 100000; i++) {
                synchronized (LOCK) { counter++; }
            }
        };
        Thread c = new Thread(safe);
        Thread d = new Thread(safe);
        c.start(); d.start(); c.join(); d.join();
        System.out.println("safe counter=" + counter);
    }
}`,out:`unsafe counter <= 200000? true
safe counter=200000`,why:'counter++ is read-add-write, so interleavings lose updates: the unsafe total is unpredictable and may fall below 200000 (repeat runs can lose different numbers of updates — the hallmark of a race). Guarding the increment with one shared lock serialises it, guaranteeing the exact 200000 every run.'},
   {t:'Advanced: independent tasks without shared state (best pattern)',code:`public class Main {
    public static void main(String[] args) throws InterruptedException {
        long[] results = new long[4];
        Thread[] threads = new Thread[4];
        for (int t = 0; t < 4; t++) {
            final int id = t;
            threads[t] = new Thread(() -> {
                long sum = 0;
                for (int i = id * 1000 + 1; i <= (id + 1) * 1000; i++) sum += i;
                results[id] = sum;
            });
        }
        for (Thread th : threads) th.start();
        for (Thread th : threads) th.join();
        long total = 0;
        for (long r : results) total += r;
        System.out.println("total 1..4000 = " + total);
    }
}`,out:`total 1..4000 = 8002000`,why:'Each thread owns a private range and writes a distinct results slot — zero shared mutable access, so no locks are needed and the result is exact (4000*4001/2). Sharing-nothing beats locking whenever the problem decomposes.'}
  ],
  walk:[[10,'start() registers two new threads with the JVM scheduler; main continues without waiting.', '3 threads alive'],[12,'t1.join() parks main until t1\'s run() returns, whether that happened already or takes time.','main waits'],[13,'t2.join() repeats the wait for the second thread.','both complete'],[14,'Only now does main print, so its line is provably last — join created a happens-after edge.','ordering guaranteed BY JOIN only']],
  walkWhy:'Thread scheduling order is the JVM/OS\'s business; joins and locks are the ONLY tools a program may use to impose its own order. Output interleave is timing, never a contract.',
  rules:['Call start(), never run(), to execute concurrently; run() executes on the calling thread.','Any shared mutable field accessed by multiple threads needs synchronisation (or atomic/concurrent types) — visibility AND atomicity.','join() throws InterruptedException (checked-ish discipline: declare or catch and restore interrupt status).','Locking on different objects for the same data protects nothing — all competitors must use the SAME lock.'],
  mistakes:[
   {t:'Invoking run() instead of start()',bad:'Thread t = new Thread(task);\nt.run();   // synchronous plain call!\n// program still works... serially, defeating the purpose',why:'run() is an ordinary method; the thread object never transitions to life. Code stays correct-but-serial, and only timing/profiling betrays it, so the mistake survives review unless you look for it.',fix:'t.start();  // new call stack + concurrent execution',tip:'Tests: print Thread.currentThread().getName() inside tasks during development to prove they are off the main thread.'},
   {t:'Believing counter++ is one atomic step',bad:'// two threads:\nfor (int i = 0; i < 100000; i++) counter++;\n// expected 200000, observed e.g. 137204',why:'++ decomposes into read, add, write; another thread can read the stale value between your read and write, erasing an increment. The shorter and rarer the window, the more intermittent — and undebuggable — the symptom.',fix:'synchronized (LOCK) { counter++; }\n// or java.util.concurrent.atomic.AtomicInteger',tip:'Every check-then-act / read-modify-write on shared state is a race until proven atomic or locked.'}
  ],
  cmp:['Ways to share results safely',['Strategy','Shared mutable state?','Notes'],[['Independent slots (example 3)','None contended','Fastest: no locks, join publishes results'],['synchronized block/method','Yes, serialised','Simple; over-locking serialises everything'],['AtomicInteger','One atomic variable','Lock-free increments, purpose-built'],['Concurrent collections','Internally managed','ConcurrentHashMap etc. for shared structures']]],
  diag:{kind:'event'},
  apps:['Background downloads/exports while the UI thread stays interactive.','Web servers handling requests on separate threads.','Splitting big numeric/ETL computations across CPU cores with disjoint ranges.'],
  quizzes:[{q:'Why is t.run() wrong when concurrency was intended?',options:['run() is private','It executes the task on the CURRENT thread like a normal call','It starts two threads','join() then throws'],correct:1,why:'start() is what allocates a new thread of execution; run() alone gives serial execution on the caller.'},
            {q:'Two unsynchronised threads each do counter++ 100k times. The final value…',options:['Exactly 200000 always','Can only be 100000','Can be less than 200000 due to lost updates','Throws an exception'],correct:2,why:'The read-add-write sequence interleaves across threads, overwriting increments — the textbook race condition.'}],
  take:['start() spawns, run() merely calls; join() waits and orders results.','Shared read-modify-write is a race until locked on ONE common lock (or made atomic).','Sharing-nothing designs (private ranges/slots) beat locking whenever possible.'],
  rev:'new Thread(runnable).start(); join() waits. counter++ not atomic → synchronized(LOCK) or AtomicInteger. Same lock for all competitors.',
  assign:{p:'Use one thread to compute sum 1..100 (=5050) storing into a long[1] slot, join it, and print worker sum=5050. Then increment a shared counter 50000 times each from two threads guarded by one lock object and print counter=100000.',s:`public class Main {
    static int counter = 0;
    static final Object LOCK = new Object();
    public static void main(String[] args) throws InterruptedException {
        // TODO: (1) worker sum slot, (2) synchronized counter
    }
}`,sol:`public class Main {
    static int counter = 0;
    static final Object LOCK = new Object();

    public static void main(String[] args) throws InterruptedException {
        long[] slot = new long[1];
        Thread worker = new Thread(() -> {
            long s = 0;
            for (int i = 1; i <= 100; i++) s += i;
            slot[0] = s;
        });
        worker.start();
        worker.join();
        System.out.println("worker sum=" + slot[0]);

        Runnable bump = () -> {
            for (int i = 0; i < 50000; i++) {
                synchronized (LOCK) { counter++; }
            }
        };
        Thread a = new Thread(bump);
        Thread b = new Thread(bump);
        a.start(); b.start(); a.join(); b.join();
        System.out.println("counter=" + counter);
    }
}`}
},
];

module.exports = { topics: makeTopics(specs) };
