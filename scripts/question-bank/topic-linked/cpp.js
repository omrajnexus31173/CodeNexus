'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'cpp-variables-auto-const', language: 'cpp', course: 'cpp',
    title: 'Const-Correct Basket Tax Total',
    statement: 'Store whole-rupee prices in a std::vector, total them using a range-for loop with const auto&, then apply a constexpr 18% tax rate. Print the taxed total truncated to whole rupees.',
    input: 'First line: n. Second line: n non-negative integer prices.',
    output: 'Print exactly: total with tax=<integer>.',
    constraints: '0 <= n <= 1000; each price <= 10^6.',
    difficulty: 'Easy', tags: ['auto', 'const', 'constexpr'],
    starter: `#include <iostream>
#include <vector>

int main() {
    constexpr double TAX = 0.18;
    int n;
    if (!(std::cin >> n)) return 0;
    std::vector<long long> prices(n);
    for (int i = 0; i < n; ++i) std::cin >> prices[i];
    long long total = 0;
    /* TODO: total the prices with for (const auto& price : prices). */
    std::cout << "total with tax=" << (long long)(total * (1 + TAX)) << "\\n";
    return 0;
}`,
    solution: `#include <iostream>
#include <vector>

int main() {
    constexpr double TAX = 0.18;
    int n;
    if (!(std::cin >> n)) return 0;
    std::vector<long long> prices(n);
    for (int i = 0; i < n; ++i) std::cin >> prices[i];
    long long total = 0;
    for (const auto& price : prices) total += price;
    long long taxed = (long long)(total * (1 + TAX));
    std::cout << "total with tax=" << taxed << "\\n";
    return 0;
}`,
    explanation: 'const auto& observes each vector element without copying or modifying it. The constexpr rate is applied once to the integer subtotal.',
    hints: ['Use for (const auto& price : prices) total += price;', 'Cast the taxed double expression to long long to truncate toward zero.'],
    tests: [['3\n100 250 50', 'total with tax=472'], ['0\n', 'total with tax=0'], ['1\n99', 'total with tax=116'], ['4\n10 20 30 40', 'total with tax=118']],
  }),

  question({
    topic: 'cpp-functions-overloading', language: 'cpp', course: 'cpp',
    title: 'Three Describe Overloads',
    statement: 'Write three overloads named describe: one taking an int roll, one taking a const std::string& name, and one taking both. Read a roll and a one-word name, then call all three overloads in that order.',
    input: 'One line: integer roll followed by a one-word name.',
    output: 'Print three lines: roll <n>, name <s>, and roll <n> name <s>.',
    constraints: 'Roll fits in int; name contains no spaces.',
    difficulty: 'Easy', tags: ['overloading', 'functions'],
    starter: `#include <iostream>
#include <string>

void describe(int roll) {
    /* TODO: print the roll form. */
}
void describe(const std::string& name) {
    /* TODO: print the name form. */
}
void describe(int roll, const std::string& name) {
    /* TODO: print the combined form. */
}

int main() {
    int roll;
    std::string name;
    if (!(std::cin >> roll >> name)) return 0;
    describe(roll);
    describe(name);
    describe(roll, name);
    return 0;
}`,
    solution: `#include <iostream>
#include <string>

void describe(int roll) {
    std::cout << "roll " << roll << "\\n";
}
void describe(const std::string& name) {
    std::cout << "name " << name << "\\n";
}
void describe(int roll, const std::string& name) {
    std::cout << "roll " << roll << " name " << name << "\\n";
}

int main() {
    int roll;
    std::string name;
    if (!(std::cin >> roll >> name)) return 0;
    describe(roll);
    describe(name);
    describe(roll, name);
    return 0;
}`,
    explanation: 'The compiler selects an overload from the argument types and count at each call site; return type alone cannot distinguish overloads.',
    hints: ['The three signatures differ by parameter list: (int), (const std::string&), and (int, const std::string&).', 'Call them in the same order as the required output.'],
    tests: [['12 Diya', 'roll 12\nname Diya\nroll 12 name Diya'], ['7 Kabir', 'roll 7\nname Kabir\nroll 7 name Kabir'], ['0 A', 'roll 0\nname A\nroll 0 name A']],
  }),

  question({
    topic: 'cpp-std-string-deep', language: 'cpp', course: 'cpp',
    title: 'Split an Email with find and substr',
    statement: 'Read one email-like token. Use std::string::find with an npos check to locate @. If present, print the user part and domain on separate lines; otherwise print invalid.',
    input: 'One token without spaces.',
    output: 'User and domain on separate lines, or invalid.',
    constraints: 'Token length <= 200.',
    difficulty: 'Easy', tags: ['std::string', 'find', 'substr'],
    starter: `#include <iostream>
#include <string>

int main() {
    std::string email;
    if (!(std::cin >> email)) return 0;
    std::size_t at = email.find('@');
    /* TODO: if at is std::string::npos print invalid; else use substr twice. */
    (void)at;
    std::cout << email << "\\n";
    return 0;
}`,
    solution: `#include <iostream>
#include <string>

int main() {
    std::string email;
    if (!(std::cin >> email)) return 0;
    std::size_t at = email.find('@');
    if (at == std::string::npos) {
        std::cout << "invalid\\n";
        return 0;
    }
    std::cout << email.substr(0, at) << "\\n"
              << email.substr(at + 1) << "\\n";
    return 0;
}`,
    explanation: 'find returns the index of @ or std::string::npos when absent. substr(0, at) takes the left part, while substr(at+1) takes the remainder.',
    hints: ['Always compare the find result with std::string::npos before slicing.', 'The second substr argument for the user part is a length, not an end index.'],
    tests: [['diya.sharma@example.com', 'diya.sharma\nexample.com'], ['plainword', 'invalid'], ['a@b', 'a\nb'], ['first@second@third', 'first\nsecond@third']],
  }),

  question({
    topic: 'cpp-operator-overloading', language: 'cpp', course: 'cpp',
    title: 'Fraction Equality and Stream Output',
    statement: 'Create a Fraction class with operator== implemented by cross-multiplication and a friend operator<< that prints num/den. Read three fractions; print whether the first two are equal (1 or 0), then print the third fraction.',
    input: 'Six integers: n1 d1 n2 d2 n3 d3. Denominators are non-zero.',
    output: 'First line: 1 if fraction1 equals fraction2, else 0. Second line: n3/d3 exactly as read.',
    constraints: 'Absolute values <= 10^6; use 64-bit cross-products.',
    difficulty: 'Medium', tags: ['operator overloading', 'classes'],
    starter: `#include <iostream>

class Fraction {
public:
    long long num;
    long long den;
    Fraction(long long n, long long d) : num(n), den(d) {}
    bool operator==(const Fraction& rhs) const {
        /* TODO: compare by cross-multiplication. */
        return false;
    }
    friend std::ostream& operator<<(std::ostream& out, const Fraction& f) {
        /* TODO: write num/den to out and return out. */
        return out;
    }
};

int main() {
    long long n1, d1, n2, d2, n3, d3;
    if (!(std::cin >> n1 >> d1 >> n2 >> d2 >> n3 >> d3)) return 0;
    Fraction a(n1, d1), b(n2, d2), c(n3, d3);
    std::cout << (a == b ? 1 : 0) << "\\n" << c << "\\n";
    return 0;
}`,
    solution: `#include <iostream>

class Fraction {
public:
    long long num;
    long long den;
    Fraction(long long n, long long d) : num(n), den(d) {}
    bool operator==(const Fraction& rhs) const {
        return num * rhs.den == rhs.num * den;
    }
    friend std::ostream& operator<<(std::ostream& out, const Fraction& f) {
        out << f.num << '/' << f.den;
        return out;
    }
};

int main() {
    long long n1, d1, n2, d2, n3, d3;
    if (!(std::cin >> n1 >> d1 >> n2 >> d2 >> n3 >> d3)) return 0;
    Fraction a(n1, d1), b(n2, d2), c(n3, d3);
    std::cout << (a == b ? 1 : 0) << "\\n" << c << "\\n";
    return 0;
}`,
    explanation: 'Cross-multiplication avoids floating-point division: a/b equals c/d exactly when a*d equals c*b. Returning the stream from operator<< enables chaining.',
    hints: ['Inside operator==, compare num * rhs.den with rhs.num * den.', 'A friend stream operator receives the stream as its left operand.'],
    tests: [['1 2 2 4 3 5', '1\n3/5'], ['2 3 3 4 7 8', '0\n7/8'], ['-1 2 1 -2 0 9', '1\n0/9'], ['5 5 10 10 6 3', '1\n6/3']],
  }),

  question({
    topic: 'cpp-copy-move-semantics', language: 'cpp', course: 'cpp',
    title: 'Rule-of-Zero Independent Copy',
    statement: 'Define NamedList holding only a std::vector<std::string>, with add() and count(), and write no destructor or copy/move special members. Build list a from n names, copy it to b, add one extra name only to b, and print both counts plus b\'s last name.',
    input: 'First line: n. Second line: n one-word names followed by one extra one-word name.',
    output: 'Print exactly: a=<n> b=<n+1> copy_last=<extra>.',
    constraints: '0 <= n <= 100; names contain no spaces.',
    difficulty: 'Medium', tags: ['Rule of Zero', 'copy semantics', 'vector'],
    starter: `#include <iostream>
#include <string>
#include <vector>

class NamedList {
    std::vector<std::string> names;
public:
    void add(const std::string& name) { names.push_back(name); }
    std::size_t count() const { return names.size(); }
    std::string last() const { return names.empty() ? "" : names.back(); }
    /* Rule of Zero: do not add special member functions. */
};

int main() {
    int n;
    if (!(std::cin >> n)) return 0;
    NamedList a;
    for (int i = 0; i < n; ++i) {
        std::string name; std::cin >> name; a.add(name);
    }
    std::string extra; std::cin >> extra;
    /* TODO: copy a into b, then add extra only to b. */
    std::cout << "a=" << a.count() << " b=" << a.count() << " copy_last=" << extra << "\\n";
    return 0;
}`,
    solution: `#include <iostream>
#include <string>
#include <vector>

class NamedList {
    std::vector<std::string> names;
public:
    void add(const std::string& name) { names.push_back(name); }
    std::size_t count() const { return names.size(); }
    std::string last() const { return names.empty() ? "" : names.back(); }
};

int main() {
    int n;
    if (!(std::cin >> n)) return 0;
    NamedList a;
    for (int i = 0; i < n; ++i) {
        std::string name; std::cin >> name; a.add(name);
    }
    std::string extra; std::cin >> extra;
    NamedList b = a;
    b.add(extra);
    std::cout << "a=" << a.count() << " b=" << b.count()
              << " copy_last=" << b.last() << "\\n";
    return 0;
}`,
    explanation: 'std::vector already implements correct copy and cleanup. With no raw owning pointers, the compiler-generated special members make NamedList safely copyable (Rule of Zero).',
    hints: ['Simply write NamedList b = a; the vector member is deep-copied.', 'Add the extra name to b only and compare a.count() with b.count().'],
    tests: [['2\nDiya Kabir Meera', 'a=2 b=3 copy_last=Meera'], ['0\nSolo', 'a=0 b=1 copy_last=Solo'], ['3\nA B C D', 'a=3 b=4 copy_last=D']],
  }),

  question({
    topic: 'cpp-lambdas-algorithms', language: 'cpp', course: 'cpp',
    title: 'Count and Sort with Lambdas',
    statement: 'Use std::count_if with a lambda to count values strictly greater than a threshold, then use std::sort with a lambda comparator to print all values in descending order.',
    input: 'First line: n threshold. Second line: n integers.',
    output: 'First line: count. Second line: all values sorted descending, separated by single spaces.',
    constraints: '1 <= n <= 1000; values fit in int.',
    difficulty: 'Easy', tags: ['lambda', 'algorithm', 'sort'],
    starter: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    int n, threshold;
    if (!(std::cin >> n >> threshold)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];
    long long count = 0;
    /* TODO: use std::count_if with a lambda capturing threshold. */
    /* TODO: use std::sort with a lambda for descending order. */
    std::cout << count << "\\n";
    for (int i = 0; i < n; ++i) {
        if (i) std::cout << ' ';
        std::cout << nums[i];
    }
    std::cout << "\\n";
    return 0;
}`,
    solution: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    int n, threshold;
    if (!(std::cin >> n >> threshold)) return 0;
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) std::cin >> nums[i];
    long long count = std::count_if(nums.begin(), nums.end(),
        [threshold](int x) { return x > threshold; });
    std::sort(nums.begin(), nums.end(),
        [](int a, int b) { return a > b; });
    std::cout << count << "\\n";
    for (int i = 0; i < n; ++i) {
        if (i) std::cout << ' ';
        std::cout << nums[i];
    }
    std::cout << "\\n";
    return 0;
}`,
    explanation: 'The count lambda captures threshold by value and is applied to every element. A comparator returning a > b orders larger values first.',
    hints: ['Capture threshold in the count lambda as [threshold](int x) { ... }.', 'For descending sort, the comparator should return a > b.'],
    tests: [['6 10\n5 12 7 20 3 12', '3\n20 12 12 7 5 3'], ['3 0\n-1 0 1', '1\n1 0 -1'], ['1 5\n5', '0\n5']],
  }),

  question({
    topic: 'cpp-templates-basics', language: 'cpp', course: 'cpp',
    title: 'One Triple Function Template',
    statement: 'Write a function template triple(T value) returning value * 3. Read an int, a double, and another int, and print triple of each on its own line using the same template.',
    input: 'One line: int double int.',
    output: 'Three lines, using default std::cout formatting for the double result.',
    constraints: 'Values are small enough that triple does not overflow int.',
    difficulty: 'Easy', tags: ['templates'],
    starter: `#include <iostream>

template <typename T>
T triple(T value) {
    /* TODO: return value multiplied by 3. */
    return value;
}

int main() {
    int a, b;
    double d;
    if (!(std::cin >> a >> d >> b)) return 0;
    std::cout << triple(a) << "\\n" << triple(d) << "\\n" << triple(b) << "\\n";
    return 0;
}`,
    solution: `#include <iostream>

template <typename T>
T triple(T value) {
    return value * 3;
}

int main() {
    int a, b;
    double d;
    if (!(std::cin >> a >> d >> b)) return 0;
    std::cout << triple(a) << "\\n" << triple(d) << "\\n" << triple(b) << "\\n";
    return 0;
}`,
    explanation: 'The compiler instantiates triple separately for int and double from one definition, preserving each type\'s multiplication and output formatting.',
    hints: ['The template parameter is written as template <typename T>.', 'Return value * 3; do not write separate int and double functions.'],
    tests: [['4 1.5 -2', '12\n4.5\n-6'], ['0 2.25 10', '0\n6.75\n30'], ['-7 0.5 3', '-21\n1.5\n9']],
  }),

  question({
    topic: 'cpp-smart-pointers', language: 'cpp', course: 'cpp',
    title: 'Move a unique_ptr Meter',
    statement: 'Create a Meter object with std::make_unique using an input reading. Print the reading, move the unique_ptr into a second variable named moved, then print whether the original is nullptr and the moved reading.',
    input: 'One integer reading.',
    output: 'Three lines: reading, 1, reading.',
    constraints: 'Reading fits in int.',
    difficulty: 'Easy', tags: ['unique_ptr', 'move semantics'],
    starter: `#include <iostream>
#include <memory>
#include <utility>

struct Meter {
    int reading;
    explicit Meter(int r) : reading(r) {}
};

int main() {
    int reading;
    if (!(std::cin >> reading)) return 0;
    auto original = std::make_unique<Meter>(reading);
    std::cout << original->reading << "\\n";
    /* TODO: move original into a variable named moved. */
    std::cout << (original == nullptr ? 1 : 0) << "\\n";
    std::cout << reading << "\\n";
    return 0;
}`,
    solution: `#include <iostream>
#include <memory>
#include <utility>

struct Meter {
    int reading;
    explicit Meter(int r) : reading(r) {}
};

int main() {
    int reading;
    if (!(std::cin >> reading)) return 0;
    auto original = std::make_unique<Meter>(reading);
    std::cout << original->reading << "\\n";
    auto moved = std::move(original);
    std::cout << (original == nullptr ? 1 : 0) << "\\n";
    std::cout << moved->reading << "\\n";
    return 0;
}`,
    explanation: 'unique_ptr cannot be copied because ownership is singular. std::move transfers ownership and leaves the source null.',
    hints: ['Write auto moved = std::move(original);', 'After the move, only moved may be dereferenced.'],
    tests: [['42', '42\n1\n42'], ['0', '0\n1\n0'], ['-7', '-7\n1\n-7']],
  }),

  question({
    topic: 'cpp-exception-handling', language: 'cpp', course: 'cpp',
    title: 'Validate Age with out_of_range',
    statement: 'Write get_age(int) that returns the age when 0 <= age <= 120 and otherwise throws std::out_of_range("age out of range"). In main, catch that exception and print a rejected line containing e.what().',
    input: 'One integer age.',
    output: 'The age itself when valid, otherwise exactly: rejected: age out of range.',
    constraints: 'Input fits in int.',
    difficulty: 'Easy', tags: ['exceptions', 'stdexcept'],
    starter: `#include <iostream>
#include <stdexcept>

int get_age(int age) {
    /* TODO: throw std::out_of_range outside 0..120. */
    return age;
}

int main() {
    int age;
    if (!(std::cin >> age)) return 0;
    try {
        std::cout << get_age(age) << "\\n";
    } catch (const std::out_of_range& e) {
        std::cout << "rejected: " << e.what() << "\\n";
    }
    return 0;
}`,
    solution: `#include <iostream>
#include <stdexcept>

int get_age(int age) {
    if (age < 0 || age > 120) {
        throw std::out_of_range("age out of range");
    }
    return age;
}

int main() {
    int age;
    if (!(std::cin >> age)) return 0;
    try {
        std::cout << get_age(age) << "\\n";
    } catch (const std::out_of_range& e) {
        std::cout << "rejected: " << e.what() << "\\n";
    }
    return 0;
}`,
    explanation: 'Validation failures are reported by throwing a standard exception; the caller catches it by const reference and reads its message with what().',
    hints: ['Throw before returning when age < 0 || age > 120.', 'Catch const std::out_of_range& to avoid copying/slicing.'],
    tests: [['30', '30'], ['200', 'rejected: age out of range'], ['-1', 'rejected: age out of range'], ['120', '120']],
  }),

  question({
    topic: 'cpp-file-streams', language: 'cpp', course: 'cpp',
    title: 'Round-Trip Numbers Through a File',
    statement: 'Read n, write the integers 1 through n to nums.txt (one per line) with std::ofstream after checking that it opened, then read them back with std::ifstream and std::getline/std::stoi, and print their sum.',
    input: 'One integer n.',
    output: 'Print exactly: sum=<1+...+n>.',
    constraints: '0 <= n <= 10000.',
    difficulty: 'Easy', tags: ['fstream', 'RAII'],
    starter: `#include <fstream>
#include <iostream>
#include <string>

int main() {
    int n;
    if (!(std::cin >> n)) return 0;
    long long sum = 0;
    {
        std::ofstream out("nums.txt");
        if (!out) return 1;
        /* TODO: write 1..n, one value per line. */
    }
    std::ifstream in("nums.txt");
    std::string line;
    /* TODO: getline loop, std::stoi each line, accumulate sum. */
    (void)in; (void)line;
    std::cout << "sum=" << sum << "\\n";
    return 0;
}`,
    solution: `#include <fstream>
#include <iostream>
#include <string>

int main() {
    int n;
    if (!(std::cin >> n)) return 0;
    {
        std::ofstream out("nums.txt");
        if (!out) return 1;
        for (int i = 1; i <= n; ++i) out << i << "\\n";
    }
    std::ifstream in("nums.txt");
    if (!in) return 1;
    long long sum = 0;
    std::string line;
    while (std::getline(in, line)) {
        if (!line.empty()) sum += std::stoi(line);
    }
    std::cout << "sum=" << sum << "\\n";
    return 0;
}`,
    explanation: 'The writer is scoped so its destructor flushes/closes the file before reopening for reading (RAII). getline returns the stream, ending the loop at EOF.',
    hints: ['Close the ofstream (end its scope) before opening the ifstream.', 'Convert each non-empty line with std::stoi.'],
    tests: [['5', 'sum=15'], ['0', 'sum=0'], ['10', 'sum=55'], ['100', 'sum=5050']],
  }),
];
