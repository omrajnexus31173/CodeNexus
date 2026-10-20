'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'java-variables-operators', language: 'java', course: 'java',
    title: 'Average Without Integer Division',
    statement: 'Read three subject marks as ints. Print their average as a double (avoid integer division) and then print whether the average is at least 85.',
    input: 'One line: three integer marks.',
    output: 'First line: the double average using Java default printing. Second line: true or false.',
    constraints: 'Marks fit in int.',
    difficulty: 'Easy', tags: ['primitive types', 'operators'],
    starter: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int maths = sc.nextInt();
        int science = sc.nextInt();
        int english = sc.nextInt();
        double average = (maths + science + english) / 3;
        // TODO: avoid integer division when computing average.
        System.out.println(average);
        System.out.println(average >= 85);
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int maths = sc.nextInt();
        int science = sc.nextInt();
        int english = sc.nextInt();
        double average = (maths + science + english) / 3.0;
        System.out.println(average);
        System.out.println(average >= 85);
    }
}`,
    explanation: 'Dividing by the double literal 3.0 widens the int sum before division, preserving the fractional part.',
    hints: ['Use / 3.0, not / 3.', 'The comparison average >= 85 already produces a boolean.'],
    tests: [['88 91 79', '86.0\ntrue'], ['80 80 80', '80.0\nfalse'], ['85 85 85', '85.0\ntrue'], ['1 2 4', '2.3333333333333335\nfalse']],
  }),

  question({
    topic: 'java-control-flow', language: 'java', course: 'java',
    title: 'Classify Temperatures with Branches',
    statement: 'Write classify(int temp) returning "cold" below 15, "pleasant" for 15..29, and "hot" at 30 or above. Classify every input temperature using a loop.',
    input: 'First line: n. Second line: n integer temperatures.',
    output: 'One classification per line.',
    constraints: '1 <= n <= 1000.',
    difficulty: 'Easy', tags: ['if-else', 'loops'],
    starter: `import java.util.Scanner;

public class Main {
    static String classify(int temp) {
        // TODO: return cold / pleasant / hot using the exact boundaries.
        return "pleasant";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            System.out.println(classify(sc.nextInt()));
        }
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    static String classify(int temp) {
        if (temp < 15) return "cold";
        if (temp <= 29) return "pleasant";
        return "hot";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            System.out.println(classify(sc.nextInt()));
        }
    }
}`,
    explanation: 'Ordered branch checks make the boundaries unambiguous: 15 enters pleasant and 30 enters hot.',
    hints: ['Test temp < 15 first.', 'After that, temp <= 29 is pleasant and everything else is hot.'],
    tests: [['5\n10 15 29 30 44', 'cold\npleasant\npleasant\nhot\nhot'], ['1\n-4', 'cold'], ['3\n14 15 30', 'cold\npleasant\nhot']],
  }),

  question({
    topic: 'java-methods-overloading-recursion', language: 'java', course: 'java',
    title: 'Recursive sumTo and Varargs Count',
    statement: 'Write recursive sumTo(int n) with base case n <= 0 returning 0. Also write count(int... values) returning values.length. The first input integer is n for sumTo; every remaining integer is passed to count.',
    input: 'One line: n followed by zero or more extra integers.',
    output: 'First line: sumTo(<n>)=<sum>. Second line: count of extra integers.',
    constraints: '0 <= n <= 10000; at most 1000 extra integers. Use long for the sum.',
    difficulty: 'Easy', tags: ['methods', 'recursion', 'varargs'],
    starter: `import java.util.Scanner;

public class Main {
    static long sumTo(int n) {
        // TODO: base case n <= 0, otherwise n + sumTo(n - 1).
        return 0;
    }

    static int count(int... values) {
        return values.length;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        java.util.ArrayList<Integer> rest = new java.util.ArrayList<>();
        while (sc.hasNextInt()) rest.add(sc.nextInt());
        int[] values = new int[rest.size()];
        for (int i = 0; i < rest.size(); i++) values[i] = rest.get(i);
        System.out.println("sumTo(" + n + ")=" + sumTo(n));
        System.out.println(count(values));
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    static long sumTo(int n) {
        if (n <= 0) return 0;
        return n + sumTo(n - 1);
    }

    static int count(int... values) {
        return values.length;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        java.util.ArrayList<Integer> rest = new java.util.ArrayList<>();
        while (sc.hasNextInt()) rest.add(sc.nextInt());
        int[] values = new int[rest.size()];
        for (int i = 0; i < rest.size(); i++) values[i] = rest.get(i);
        System.out.println("sumTo(" + n + ")=" + sumTo(n));
        System.out.println(count(values));
    }
}`,
    explanation: 'sumTo reduces n by one each call until the base case. A varargs parameter behaves as an array, so its length is the argument count.',
    hints: ['The recursive call must use n - 1 so it reaches the base case.', 'values.length works because varargs arrive as an array.'],
    tests: [['5 8 9 10', 'sumTo(5)=15\n3'], ['0', 'sumTo(0)=0\n0'], ['100 1', 'sumTo(100)=5050\n1']],
  }),

  question({
    topic: 'java-strings-stringbuilder', language: 'java', course: 'java',
    title: 'Build a Label from CSV Fields',
    statement: 'Read one comma-separated line containing exactly three fields (item, price, type), trimming spaces around fields. Use StringBuilder to build "ITEM: <item> PRICE: <price> TYPE: <type>" and print it.',
    input: 'One line with three comma-separated one-word fields, possibly surrounded by spaces.',
    output: 'The formatted label on one line.',
    constraints: 'Exactly three fields; fields contain no commas.',
    difficulty: 'Easy', tags: ['String', 'StringBuilder', 'split'],
    starter: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String csv = sc.nextLine();
        String[] parts = csv.trim().split(",");
        StringBuilder sb = new StringBuilder();
        // TODO: trim parts[0..2] and append them with ITEM/PRICE/TYPE labels.
        sb.append(csv.trim());
        System.out.println(sb.toString());
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String csv = sc.nextLine();
        String[] parts = csv.trim().split(",");
        StringBuilder sb = new StringBuilder();
        sb.append("ITEM: ").append(parts[0].trim())
          .append(" PRICE: ").append(parts[1].trim())
          .append(" TYPE: ").append(parts[2].trim());
        System.out.println(sb.toString());
    }
}`,
    explanation: 'split(",") separates fields, trim removes padding, and StringBuilder assembles the label efficiently with chained append calls.',
    hints: ['Trim each part, not only the whole line.', 'Append labels and values in the exact required order.'],
    tests: [[' pen,10,ink ', 'ITEM: pen PRICE: 10 TYPE: ink'], ['book, 250 , paper', 'ITEM: book PRICE: 250 TYPE: paper'], ['a,1,z', 'ITEM: a PRICE: 1 TYPE: z']],
  }),

  question({
    topic: 'java-arrays-varargs', language: 'java', course: 'java',
    title: 'Array Max Sorted Clone and Count',
    statement: 'Read an array and a target. Print the maximum, a sorted clone rendered with Arrays.toString (sorting a clone so the original remains available), and how many times the target occurs.',
    input: 'First line: n target. Second line: n integers.',
    output: 'Three lines: max=<value>, Arrays.toString of the sorted clone, and count<target>=<count>.',
    constraints: '1 <= n <= 10000.',
    difficulty: 'Easy', tags: ['arrays', 'Arrays utility'],
    starter: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] scores = new int[n];
        for (int i = 0; i < n; i++) scores[i] = sc.nextInt();
        int max = scores[0];
        int count = 0;
        // TODO: loop for max/count; sort scores.clone() with Arrays.sort.
        System.out.println("max=" + max);
        System.out.println(Arrays.toString(scores));
        System.out.println("count" + target + "=" + count);
    }
}`,
    solution: `import java.util.Arrays;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] scores = new int[n];
        for (int i = 0; i < n; i++) scores[i] = sc.nextInt();

        int max = scores[0];
        int count = 0;
        for (int value : scores) {
            if (value > max) max = value;
            if (value == target) count++;
        }
        int[] sorted = scores.clone();
        Arrays.sort(sorted);

        System.out.println("max=" + max);
        System.out.println(Arrays.toString(sorted));
        System.out.println("count" + target + "=" + count);
    }
}`,
    explanation: 'A single loop computes max and frequency. Cloning before Arrays.sort preserves the original array while producing the sorted view.',
    hints: ['Call scores.clone() before Arrays.sort.', 'Arrays.toString produces the [a, b, c] format directly.'],
    tests: [['5 92\n58 92 71 92 40', 'max=92\n[40, 58, 71, 92, 92]\ncount92=2'], ['1 7\n7', 'max=7\n[7]\ncount7=1'], ['4 9\n3 1 4 1', 'max=4\n[1, 1, 3, 4]\ncount9=0']],
  }),

  question({
    topic: 'java-classes-objects', language: 'java', course: 'java',
    title: 'Encapsulated Book Page Setter',
    statement: 'Create class Book with private title and pages, a constructor, getters, and setPages that ignores values <= 0. Input gives a title line, initial pages, a first attempted setPages value, and a second value. Apply both attempts in order and print the final book.',
    input: 'Four lines: title, initial pages, first setPages attempt, second setPages attempt.',
    output: 'Print exactly: <title>: <final pages> pages.',
    constraints: 'Title may contain spaces; page values fit in int.',
    difficulty: 'Easy', tags: ['classes', 'encapsulation'],
    starter: `import java.util.Scanner;

class Book {
    private final String title;
    private int pages;

    Book(String title, int pages) {
        this.title = title;
        this.pages = pages;
    }
    String getTitle() { return title; }
    int getPages() { return pages; }
    void setPages(int pages) {
        // TODO: ignore values <= 0 instead of assigning blindly.
        this.pages = pages;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String title = sc.nextLine();
        int initial = Integer.parseInt(sc.nextLine().trim());
        int first = Integer.parseInt(sc.nextLine().trim());
        int second = Integer.parseInt(sc.nextLine().trim());
        Book book = new Book(title, initial);
        book.setPages(first);
        book.setPages(second);
        System.out.println(book.getTitle() + ": " + book.getPages() + " pages");
    }
}`,
    solution: `import java.util.Scanner;

class Book {
    private final String title;
    private int pages;

    Book(String title, int pages) {
        this.title = title;
        this.pages = pages;
    }
    String getTitle() { return title; }
    int getPages() { return pages; }
    void setPages(int pages) {
        if (pages > 0) {
            this.pages = pages;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String title = sc.nextLine();
        int initial = Integer.parseInt(sc.nextLine().trim());
        int first = Integer.parseInt(sc.nextLine().trim());
        int second = Integer.parseInt(sc.nextLine().trim());
        Book book = new Book(title, initial);
        book.setPages(first);
        book.setPages(second);
        System.out.println(book.getTitle() + ": " + book.getPages() + " pages");
    }
}`,
    explanation: 'Private state can change only through the setter, so the > 0 guard protects the page-count invariant for every caller.',
    hints: ['Assign this.pages only inside an if (pages > 0) block.', 'Use this.title/this.pages in the constructor to avoid parameter shadowing.'],
    tests: [['Clean Code\n464\n-5\n480', 'Clean Code: 480 pages'], ['Notes\n120\n0\n-2', 'Notes: 120 pages'], ['A B\n10\n20\n30', 'A B: 30 pages']],
  }),

  question({
    topic: 'java-inheritance-polymorphism', language: 'java', course: 'java',
    title: 'Polymorphic Vehicle Horns',
    statement: 'Build class Vehicle with a brand field, constructor, and horn() returning "beep". Build subclass Truck that chains to the Vehicle constructor and overrides horn() to return "HONK". Store one Vehicle and one Truck in a Vehicle[] and print each brand and horn.',
    input: 'One line: vehicleBrand truckBrand (one word each).',
    output: 'Two lines: <vehicleBrand>: beep and <truckBrand>: HONK.',
    constraints: 'Brands contain no spaces.',
    difficulty: 'Easy', tags: ['inheritance', 'polymorphism', 'Override'],
    starter: `import java.util.Scanner;

class Vehicle {
    final String brand;
    Vehicle(String brand) { this.brand = brand; }
    String horn() { return "beep"; }
}

class Truck extends Vehicle {
    Truck(String brand) { super(brand); }
    // TODO: override horn() to return "HONK" and annotate it @Override.
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String vehicleBrand = sc.next();
        String truckBrand = sc.next();
        Vehicle[] vehicles = { new Vehicle(vehicleBrand), new Truck(truckBrand) };
        for (Vehicle v : vehicles) {
            System.out.println(v.brand + ": " + v.horn());
        }
    }
}`,
    solution: `import java.util.Scanner;

class Vehicle {
    final String brand;
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
        Scanner sc = new Scanner(System.in);
        String vehicleBrand = sc.next();
        String truckBrand = sc.next();
        Vehicle[] vehicles = { new Vehicle(vehicleBrand), new Truck(truckBrand) };
        for (Vehicle v : vehicles) {
            System.out.println(v.brand + ": " + v.horn());
        }
    }
}`,
    explanation: 'The array element type is Vehicle, but horn() dispatch uses each object\'s runtime class, so Truck produces HONK without type tests.',
    hints: ['Truck\'s constructor must call super(brand) first.', 'Put @Override on Truck.horn() so signature mistakes fail compilation.'],
    tests: [['Maruti Tata', 'Maruti: beep\nTata: HONK'], ['Ford Volvo', 'Ford: beep\nVolvo: HONK'], ['Mini Mack', 'Mini: beep\nMack: HONK']],
  }),

  question({
    topic: 'java-abstract-interfaces', language: 'java', course: 'java',
    title: 'Scorable Interface Implementations',
    statement: 'Define interface Scorable with int score(). Implement Exam (score returns its marks) and BonusExam (score returns marks + bonus), both through constructors. Read marks and bonus and print both scores through Scorable references.',
    input: 'One line: marks bonus.',
    output: 'Two lines: Exam score, then BonusExam score.',
    constraints: 'Values fit in int.',
    difficulty: 'Easy', tags: ['interfaces', 'contracts'],
    starter: `import java.util.Scanner;

interface Scorable {
    int score();
}

class Exam implements Scorable {
    private final int marks;
    Exam(int marks) { this.marks = marks; }
    public int score() {
        // TODO: return the stored marks.
        return 0;
    }
}

class BonusExam implements Scorable {
    private final int marks;
    private final int bonus;
    BonusExam(int marks, int bonus) {
        this.marks = marks;
        this.bonus = bonus;
    }
    public int score() {
        // TODO: return marks plus bonus.
        return marks;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int marks = sc.nextInt();
        int bonus = sc.nextInt();
        Scorable exam = new Exam(marks);
        Scorable bonusExam = new BonusExam(marks, bonus);
        System.out.println(exam.score());
        System.out.println(bonusExam.score());
    }
}`,
    solution: `import java.util.Scanner;

interface Scorable {
    int score();
}

class Exam implements Scorable {
    private final int marks;
    Exam(int marks) { this.marks = marks; }

    @Override
    public int score() { return marks; }
}

class BonusExam implements Scorable {
    private final int marks;
    private final int bonus;
    BonusExam(int marks, int bonus) {
        this.marks = marks;
        this.bonus = bonus;
    }

    @Override
    public int score() { return marks + bonus; }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int marks = sc.nextInt();
        int bonus = sc.nextInt();
        Scorable exam = new Exam(marks);
        Scorable bonusExam = new BonusExam(marks, bonus);
        System.out.println(exam.score());
        System.out.println(bonusExam.score());
    }
}`,
    explanation: 'Both classes satisfy the same Scorable contract with different formulas, so callers depend on the interface rather than concrete types.',
    hints: ['Interface implementations must be public.', 'BonusExam.score adds its two stored fields.'],
    tests: [['78 5', '78\n83'], ['100 0', '100\n100'], ['40 12', '40\n52']],
  }),

  question({
    topic: 'java-exception-handling', language: 'java', course: 'java',
    title: 'Parse Marks with Friendly Failures',
    statement: 'Write parseMarks(String) using Integer.parseInt; when the parsed value is outside 0..100, throw IllegalArgumentException("marks must be 0..100"). For three input tokens, print the parsed mark, "bad format" for NumberFormatException, or the range message.',
    input: 'Three lines, one token per line.',
    output: 'One result per token.',
    constraints: 'Tokens contain no spaces.',
    difficulty: 'Easy', tags: ['exceptions', 'parseInt'],
    starter: `import java.util.Scanner;

public class Main {
    static int parseMarks(String text) {
        int value = Integer.parseInt(text);
        // TODO: throw IllegalArgumentException outside 0..100.
        return value;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        for (int i = 0; i < 3 && sc.hasNextLine(); i++) {
            String token = sc.nextLine().trim();
            try {
                System.out.println(parseMarks(token));
            } catch (NumberFormatException e) {
                System.out.println("bad format");
            } catch (IllegalArgumentException e) {
                System.out.println(e.getMessage());
            }
        }
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    static int parseMarks(String text) {
        int value = Integer.parseInt(text);
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException("marks must be 0..100");
        }
        return value;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        for (int i = 0; i < 3 && sc.hasNextLine(); i++) {
            String token = sc.nextLine().trim();
            try {
                System.out.println(parseMarks(token));
            } catch (NumberFormatException e) {
                System.out.println("bad format");
            } catch (IllegalArgumentException e) {
                System.out.println(e.getMessage());
            }
        }
    }
}`,
    explanation: 'NumberFormatException is a subclass of IllegalArgumentException, so it must be caught first to distinguish malformed text from an out-of-range number.',
    hints: ['Validate range after parseInt succeeds.', 'Catch NumberFormatException before its superclass IllegalArgumentException.'],
    tests: [['85\nabc\n150', '85\nbad format\nmarks must be 0..100'], ['0\n100\n-1', '0\n100\nmarks must be 0..100'], ['12x\n42\n99', 'bad format\n42\n99']],
  }),

  question({
    topic: 'java-generics-basics', language: 'java', course: 'java',
    title: 'Generic Pair Show Method',
    statement: 'Create class Pair<A, B> with final first/second fields, a constructor, and show() returning "first=second" using string conversion. Build Pair<String,Integer> from the first two input tokens and Pair<Double,Boolean> from the last two.',
    input: 'One line: word integer decimal boolean.',
    output: 'Two lines: <word>=<integer> and <decimal>=<boolean> as Java prints the parsed values.',
    constraints: 'Word contains no spaces; boolean is true or false.',
    difficulty: 'Easy', tags: ['generics'],
    starter: `import java.util.Scanner;

class Pair<A, B> {
    private final A first;
    private final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    String show() {
        // TODO: return first + "=" + second using string conversion.
        return "";
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String word = sc.next();
        int number = sc.nextInt();
        double decimal = sc.nextDouble();
        boolean flag = sc.nextBoolean();
        System.out.println(new Pair<String, Integer>(word, number).show());
        System.out.println(new Pair<Double, Boolean>(decimal, flag).show());
    }
}`,
    solution: `import java.util.Scanner;

class Pair<A, B> {
    private final A first;
    private final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    String show() {
        return String.valueOf(first) + "=" + String.valueOf(second);
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String word = sc.next();
        int number = sc.nextInt();
        double decimal = sc.nextDouble();
        boolean flag = sc.nextBoolean();
        System.out.println(new Pair<String, Integer>(word, number).show());
        System.out.println(new Pair<Double, Boolean>(decimal, flag).show());
    }
}`,
    explanation: 'Type parameters A and B are bound independently at each construction site, giving compile-time type safety without duplicating the Pair class.',
    hints: ['Store constructor arguments in fields typed A and B.', 'String.valueOf works for every reference type in show().'],
    tests: [['roll 12 3.5 true', 'roll=12\n3.5=true'], ['id 0 2.0 false', 'id=0\n2.0=false'], ['x -4 0.25 true', 'x=-4\n0.25=true']],
  }),

  question({
    topic: 'java-multithreading-basics', language: 'java', course: 'java',
    title: 'Joined Worker and Synchronized Counter',
    statement: 'Start one worker thread that computes the sum 1..n into a shared long slot, join it, and print the sum. Then run two threads that each increment one shared counter m times, guarding every increment with the same lock (synchronized), join both, and print the exact final counter.',
    input: 'One line: n m.',
    output: 'First line: worker sum=<1+...+n>. Second line: counter=<2*m>.',
    constraints: '0 <= n <= 1000000; 0 <= m <= 100000.',
    difficulty: 'Medium', tags: ['threads', 'join', 'synchronized'],
    starter: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int m = sc.nextInt();

        long[] sumSlot = new long[1];
        Thread worker = new Thread(() -> {
            long sum = 0;
            for (int i = 1; i <= n; i++) sum += i;
            sumSlot[0] = sum;
        });
        worker.start();
        worker.join();
        System.out.println("worker sum=" + sumSlot[0]);

        int[] counter = new int[1];
        Object lock = new Object();
        Runnable incrementer = () -> {
            for (int i = 0; i < m; i++) {
                // TODO: guard counter[0]++ with synchronized (lock).
                counter[0]++;
            }
        };
        Thread t1 = new Thread(incrementer);
        Thread t2 = new Thread(incrementer);
        t1.start();
        // TODO: also start t2 and join BOTH threads before reading the counter.
        t1.join();
        System.out.println("counter=" + counter[0]);
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int m = sc.nextInt();

        long[] sumSlot = new long[1];
        Thread worker = new Thread(() -> {
            long sum = 0;
            for (int i = 1; i <= n; i++) sum += i;
            sumSlot[0] = sum;
        });
        worker.start();
        worker.join();
        System.out.println("worker sum=" + sumSlot[0]);

        int[] counter = new int[1];
        Object lock = new Object();
        Runnable incrementer = () -> {
            for (int i = 0; i < m; i++) {
                synchronized (lock) {
                    counter[0]++;
                }
            }
        };
        Thread t1 = new Thread(incrementer);
        Thread t2 = new Thread(incrementer);
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("counter=" + counter[0]);
    }
}`,
    explanation: 'join creates a happens-before edge so main reads completed results. Synchronizing on one shared lock makes each read-modify-write increment atomic, preventing lost updates.',
    hints: ['start() runs concurrently; join() waits for completion.', 'Both threads must synchronize on the same lock object.'],
    tests: [['100 50000', 'worker sum=5050\ncounter=100000'], ['0 0', 'worker sum=0\ncounter=0'], ['10 7', 'worker sum=55\ncounter=14'], ['1000 1000', 'worker sum=500500\ncounter=2000']],
  }),
];
