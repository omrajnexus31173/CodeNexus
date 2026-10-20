'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'py-operators-expressions', language: 'python', course: 'python',
    title: 'Muffin Boxes with Floor Division',
    statement: 'A bakery packs a fixed number of muffins per box. Use // and % (no loop) to determine full boxes and leftovers.',
    input: 'One line: total_muffins per_box.',
    output: 'Print exactly: boxes=<full> leftover=<remainder>.',
    constraints: '0 <= total_muffins <= 10^9; 1 <= per_box <= 10^9.',
    difficulty: 'Easy', tags: ['operators', 'modulo'],
    starter: `import sys

def solve() -> None:
    data = sys.stdin.read().split()
    if len(data) < 2:
        return
    muffins = int(data[0])
    per_box = int(data[1])
    boxes = 0
    leftover = muffins
    # TODO: compute boxes with // and leftover with %.
    print(f"boxes={boxes} leftover={leftover}")

solve()`,
    solution: `import sys

def solve() -> None:
    data = sys.stdin.read().split()
    if len(data) < 2:
        return
    muffins = int(data[0])
    per_box = int(data[1])
    boxes = muffins // per_box
    leftover = muffins % per_box
    print(f"boxes={boxes} leftover={leftover}")

solve()`,
    explanation: 'Floor division discards the incomplete box, while modulo returns exactly what remains after those full boxes.',
    hints: ['Full boxes come from muffins // per_box.', 'Leftovers come from muffins % per_box.'],
    tests: [['53 6', 'boxes=8 leftover=5'], ['12 6', 'boxes=2 leftover=0'], ['0 6', 'boxes=0 leftover=0'], ['5 10', 'boxes=0 leftover=5']],
  }),

  question({
    topic: 'py-strings-in-depth', language: 'python', course: 'python',
    title: 'Clean a Name and Build Initials',
    statement: 'Read a full name that may contain leading/trailing and repeated spaces. Clean it to title case with single spaces, build initials from the first letter of each word, and format the result with an f-string.',
    input: 'One line containing at least two name words.',
    output: 'Print exactly: Name: <Cleaned Name> (initials: <INITIALS>).',
    constraints: 'Name contains letters and spaces only.',
    difficulty: 'Easy', tags: ['strings', 'f-strings', 'split'],
    starter: `import sys

def solve() -> None:
    full_name = sys.stdin.read()
    words = full_name.strip().split()
    cleaned = " ".join(words)
    initials = ""
    # TODO: title-case the words and collect each first letter in uppercase.
    print(f"Name: {cleaned} (initials: {initials})")

solve()`,
    solution: `import sys

def solve() -> None:
    words = sys.stdin.read().strip().split()
    titled = [word.title() for word in words]
    cleaned = " ".join(titled)
    initials = "".join(word[0].upper() for word in titled)
    print(f"Name: {cleaned} (initials: {initials})")

solve()`,
    explanation: 'split() with no argument collapses whitespace runs. Title-casing each word normalizes display, and the initials are the uppercase first characters.',
    hints: ['Use .strip().split() rather than split(" ") to handle repeated spaces.', 'Each word contributes word[0].upper() to the initials.'],
    tests: [['  meera sharma ', 'Name: Meera Sharma (initials: MS)'], ['ARJUN   kumar PATEL', 'Name: Arjun Kumar Patel (initials: AKP)'], ['a b', 'Name: A B (initials: AB)']],
  }),

  question({
    topic: 'py-lists-tuples', language: 'python', course: 'python',
    title: 'Sorted Copy Without Mutating Readings',
    statement: 'The first input integer is a target and the remaining integers are readings. Print a new sorted copy, how many times the target occurs, and the original list unchanged. Use sorted(), not list.sort(), so the original order survives.',
    input: 'One line: target followed by at least one reading.',
    output: 'Print exactly: sorted=<list repr> count<target>=<count> original=<list repr>.',
    constraints: 'At most 1000 readings; integers fit in Python int.',
    difficulty: 'Easy', tags: ['lists', 'sorted', 'count'],
    starter: `import sys

def solve() -> None:
    nums = [int(x) for x in sys.stdin.read().split()]
    if len(nums) < 2:
        return
    target, readings = nums[0], nums[1:]
    sorted_copy = readings
    count = 0
    # TODO: make a new sorted copy and count target occurrences.
    print(f"sorted={sorted_copy} count{target}={count} original={readings}")

solve()`,
    solution: `import sys

def solve() -> None:
    nums = [int(x) for x in sys.stdin.read().split()]
    if len(nums) < 2:
        return
    target, readings = nums[0], nums[1:]
    sorted_copy = sorted(readings)
    count = readings.count(target)
    print(f"sorted={sorted_copy} count{target}={count} original={readings}")

solve()`,
    explanation: 'sorted() returns a new list, leaving readings untouched; list.count performs the occurrence scan.',
    hints: ['Use sorted(readings), not readings.sort().', 'The count is readings.count(target).'],
    tests: [['31 22 31 19 31 28 31', 'sorted=[19, 22, 28, 31, 31, 31] count31=3 original=[22, 31, 19, 31, 28, 31]'], ['9 3 1 2', 'sorted=[1, 2, 3] count9=0 original=[3, 1, 2]'], ['-1 -1 -5 -1', 'sorted=[-5, -1, -1] count-1=2 original=[-1, -5, -1]']],
  }),

  question({
    topic: 'py-dicts-sets', language: 'python', course: 'python',
    title: 'Cart Total from a Price Dictionary',
    statement: 'Use this price dictionary: pen=10, notebook=50, eraser=5, pencil=7. Read cart item names and total them with dict.get(item, 0), so unknown items add zero instead of crashing.',
    input: 'One line of zero or more whitespace-separated item names.',
    output: 'Print exactly: total=<sum>.',
    constraints: 'At most 1000 item names; names are lowercase words.',
    difficulty: 'Easy', tags: ['dict', 'get'],
    starter: `import sys

PRICES = {"pen": 10, "notebook": 50, "eraser": 5, "pencil": 7}

def solve() -> None:
    cart = sys.stdin.read().split()
    total = 0
    # TODO: add PRICES.get(item, 0) for every cart item.
    print(f"total={total}")

solve()`,
    solution: `import sys

PRICES = {"pen": 10, "notebook": 50, "eraser": 5, "pencil": 7}

def solve() -> None:
    cart = sys.stdin.read().split()
    total = sum(PRICES.get(item, 0) for item in cart)
    print(f"total={total}")

solve()`,
    explanation: 'dict.get supplies a default for missing keys, making unknown cart items contribute 0 rather than raising KeyError.',
    hints: ['Use PRICES.get(item, 0), not PRICES[item].', 'A generator inside sum() can total the whole cart.'],
    tests: [['pen notebook pen', 'total=70'], ['eraser pencil mystery', 'total=12'], ['', 'total=0'], ['notebook notebook', 'total=100']],
  }),

  question({
    topic: 'py-functions-scope', language: 'python', course: 'python',
    title: 'Variadic Average Function',
    statement: 'Define average(*numbers) returning the arithmetic mean as a float, or 0.0 when called with no numbers. Read all integers from input, call average(*nums), and print the returned float.',
    input: 'Zero or more integers separated by whitespace.',
    output: 'Print the float mean using Python\'s default str(float) formatting.',
    constraints: 'At most 1000 integers.',
    difficulty: 'Easy', tags: ['functions', '*args'],
    starter: `import sys

def average(*numbers):
    # TODO: return 0.0 for an empty tuple; otherwise sum/len.
    return 0.0

def solve() -> None:
    nums = [int(x) for x in sys.stdin.read().split()]
    print(average(*nums))

solve()`,
    solution: `import sys

def average(*numbers):
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

def solve() -> None:
    nums = [int(x) for x in sys.stdin.read().split()]
    print(average(*nums))

solve()`,
    explanation: '*numbers collects positional arguments into a tuple. Guarding the empty tuple avoids division by zero and matches the specified 0.0 result.',
    hints: ['Inside the function, numbers is a tuple.', 'Check if not numbers before dividing by len(numbers).'],
    tests: [['10 20 60', '30.0'], ['', '0.0'], ['5', '5.0'], ['1 2', '1.5'], ['-10 10', '0.0']],
  }),

  question({
    topic: 'py-exception-handling', language: 'python', course: 'python',
    title: 'Parse Positive with Two Failure Paths',
    statement: 'Write parse_positive(text): return int(text) for valid positive integers; return -1 when int conversion raises ValueError; raise ValueError("not positive") when the parsed value is <= 0. Process three input lines, catching the raised error and printing its message.',
    input: 'Exactly three lines, each one token to parse.',
    output: 'One result per line: the positive integer, -1 for bad format, or not positive.',
    constraints: 'Tokens contain no spaces.',
    difficulty: 'Easy', tags: ['try', 'except', 'raise'],
    starter: `import sys

def parse_positive(text: str) -> int:
    # TODO: try int(text), return -1 on ValueError,
    # then raise ValueError("not positive") for values <= 0.
    return int(text)

def solve() -> None:
    lines = sys.stdin.read().splitlines()[:3]
    for raw in lines:
        try:
            print(parse_positive(raw.strip()))
        except ValueError as exc:
            print(exc)

solve()`,
    solution: `import sys

def parse_positive(text: str) -> int:
    try:
        value = int(text)
    except ValueError:
        return -1
    if value <= 0:
        raise ValueError("not positive")
    return value

def solve() -> None:
    lines = sys.stdin.read().splitlines()[:3]
    for raw in lines:
        try:
            print(parse_positive(raw.strip()))
        except ValueError as exc:
            print(exc)

solve()`,
    explanation: 'Conversion failure is recoverable inside the function (-1), while a successfully parsed non-positive value is a domain error deliberately raised to the caller.',
    hints: ['Catch ValueError only around int(text), then validate the parsed value separately.', 'Raise a new ValueError after conversion succeeds but the value is <= 0.'],
    tests: [['25\nabc\n-3', '25\n-1\nnot positive'], ['0\n7\n3.5', 'not positive\n7\n-1'], ['101\n001\nxyz', '101\n1\n-1']],
  }),

  question({
    topic: 'py-file-handling', language: 'python', course: 'python',
    title: 'Write Then Read nums.txt',
    statement: 'Read n, use a with block to write integers 1..n to nums.txt (one per line), then use another with block to read them back as integers and print the list and sum.',
    input: 'One integer n.',
    output: 'Print exactly: [<list>] sum=<sum> using Python list repr.',
    constraints: '0 <= n <= 10000.',
    difficulty: 'Easy', tags: ['files', 'with'],
    starter: `import sys

def solve() -> None:
    data = sys.stdin.read().split()
    n = int(data[0]) if data else 0
    # TODO: write 1..n to nums.txt inside a with block.
    values = []
    # TODO: reopen nums.txt in a with block and convert lines to int.
    print(f"{values} sum={sum(values)}")

solve()`,
    solution: `import sys

def solve() -> None:
    data = sys.stdin.read().split()
    n = int(data[0]) if data else 0
    with open("nums.txt", "w", encoding="utf-8") as f:
        for value in range(1, n + 1):
            f.write(f"{value}\\n")
    with open("nums.txt", "r", encoding="utf-8") as f:
        values = [int(line) for line in f if line.strip()]
    print(f"{values} sum={sum(values)}")

solve()`,
    explanation: 'Each with block guarantees closing/flush at block exit. Writing first and then reopening proves the data really round-tripped through the file.',
    hints: ['Remember the newline after each written number.', 'Convert each read line with int(line) before summing.'],
    tests: [['5', '[1, 2, 3, 4, 5] sum=15'], ['0', '[] sum=0'], ['3', '[1, 2, 3] sum=6'], ['8', '[1, 2, 3, 4, 5, 6, 7, 8] sum=36']],
  }),

  question({
    topic: 'py-modules-imports', language: 'python', course: 'python',
    title: 'Import math and statistics by Name',
    statement: 'Use import math as m for pi and from statistics import mean for the average. The first input number is a circle radius; the remaining numbers are samples. Print the circle area and sample mean rounded to two decimals.',
    input: 'One line: radius followed by at least one sample number. Numbers may be integers or decimals.',
    output: 'Print exactly: area=<two decimals> mean=<two decimals>.',
    constraints: 'Radius >= 0; at most 1000 samples.',
    difficulty: 'Easy', tags: ['imports', 'math', 'statistics'],
    starter: `import sys
import math as m
from statistics import mean

def solve() -> None:
    nums = [float(x) for x in sys.stdin.read().split()]
    if len(nums) < 2:
        return
    radius, samples = nums[0], nums[1:]
    area = 0.0
    avg = 0.0
    # TODO: use m.pi for area and mean(samples) for avg.
    print(f"area={area:.2f} mean={avg:.2f}")

solve()`,
    solution: `import sys
import math as m
from statistics import mean

def solve() -> None:
    nums = [float(x) for x in sys.stdin.read().split()]
    if len(nums) < 2:
        return
    radius, samples = nums[0], nums[1:]
    area = m.pi * radius * radius
    avg = mean(samples)
    print(f"area={area:.2f} mean={avg:.2f}")

solve()`,
    explanation: 'The alias m keeps math names short (m.pi), while the from-import binds mean directly. Both styles reuse tested standard-library code.',
    hints: ['After import math as m, pi is accessed as m.pi.', 'The samples are all numbers after the radius: nums[1:].'],
    tests: [['1 10 20 30', 'area=3.14 mean=20.00'], ['0 5', 'area=0.00 mean=5.00'], ['2 1 2', 'area=12.57 mean=1.50']],
  }),

  question({
    topic: 'py-oop-classes', language: 'python', course: 'python',
    title: 'Rectangle Class Describe Method',
    statement: 'Define class Rectangle with __init__(self, w, h), area(), and describe() returning "Rectangle <w>x<h> area=<area>". Read width and height, create the object, and print describe().',
    input: 'One line: width height (positive integers).',
    output: 'Print exactly: Rectangle <w>x<h> area=<area>.',
    constraints: '1 <= width,height <= 10^6.',
    difficulty: 'Easy', tags: ['OOP', 'classes'],
    starter: `import sys

class Rectangle:
    def __init__(self, w, h):
        # TODO: store w and h on self.
        self.w = w
        self.h = h

    def area(self):
        # TODO: return width times height.
        return 0

    def describe(self):
        return f"Rectangle {self.w}x{self.h} area={self.area()}"

def solve() -> None:
    data = [int(x) for x in sys.stdin.read().split()]
    if len(data) < 2:
        return
    print(Rectangle(data[0], data[1]).describe())

solve()`,
    solution: `import sys

class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h

    def describe(self):
        return f"Rectangle {self.w}x{self.h} area={self.area()}"

def solve() -> None:
    data = [int(x) for x in sys.stdin.read().split()]
    if len(data) < 2:
        return
    print(Rectangle(data[0], data[1]).describe())

solve()`,
    explanation: '__init__ stores per-instance dimensions on self; methods read that state through self, so each Rectangle describes its own data.',
    hints: ['Assign self.w = w and self.h = h in __init__.', 'area() multiplies self.w by self.h.'],
    tests: [['4 3', 'Rectangle 4x3 area=12'], ['7 7', 'Rectangle 7x7 area=49'], ['12 5', 'Rectangle 12x5 area=60']],
  }),

  question({
    topic: 'py-iterators-generators', language: 'python', course: 'python',
    title: 'Generate Evens Lazily',
    statement: 'Write generator evens_upto(n) using yield to produce even numbers from 0 through n inclusive. Read n and print list(evens_upto(n)).',
    input: 'One integer n.',
    output: 'Python list repr of the even numbers.',
    constraints: '0 <= n <= 100000.',
    difficulty: 'Easy', tags: ['generators', 'yield'],
    starter: `import sys

def evens_upto(n):
    # TODO: yield each even value from 0 to n inclusive.
    if False:
        yield 0

def solve() -> None:
    data = sys.stdin.read().split()
    n = int(data[0]) if data else 0
    print(list(evens_upto(n)))

solve()`,
    solution: `import sys

def evens_upto(n):
    value = 0
    while value <= n:
        yield value
        value += 2

def solve() -> None:
    data = sys.stdin.read().split()
    n = int(data[0]) if data else 0
    print(list(evens_upto(n)))

solve()`,
    explanation: 'Calling a generator function only creates the generator; each next() resumes it until the next yield. list() drains the lazy sequence for printing.',
    hints: ['Start at 0 and increase by 2 after each yield.', 'Do not build/return a list inside evens_upto; yield values one at a time.'],
    tests: [['10', '[0, 2, 4, 6, 8, 10]'], ['0', '[0]'], ['7', '[0, 2, 4, 6]'], ['1', '[0]']],
  }),

  question({
    topic: 'py-decorators-closures', language: 'python', course: 'python',
    title: 'Ensure-Positive Decorator Gate',
    statement: 'Write decorator ensure_positive for a one-argument function: negative input prints "negative blocked" and returns 0 without calling the wrapped function; otherwise it calls through. Apply it to scale10(x)=x*10, read x, and print the result.',
    input: 'One integer x.',
    output: 'For x >= 0 print 10*x. For x < 0 print "negative blocked" then 0.',
    constraints: 'x fits in Python int.',
    difficulty: 'Medium', tags: ['decorators', 'closures'],
    starter: `import sys

def ensure_positive(func):
    def wrapper(x):
        # TODO: block negative x; otherwise return func(x).
        return func(x)
    return wrapper

@ensure_positive
def scale10(x):
    return x * 10

def solve() -> None:
    data = sys.stdin.read().split()
    x = int(data[0]) if data else 0
    print(scale10(x))

solve()`,
    solution: `import sys

def ensure_positive(func):
    def wrapper(x):
        if x < 0:
            print("negative blocked")
            return 0
        return func(x)
    return wrapper

@ensure_positive
def scale10(x):
    return x * 10

def solve() -> None:
    data = sys.stdin.read().split()
    x = int(data[0]) if data else 0
    print(scale10(x))

solve()`,
    explanation: 'The decorator returns a closure over func. The wrapper decides whether calling func is allowed, adding behaviour without editing scale10 itself.',
    hints: ['The wrapper must return func(x) for allowed input.', 'Return 0 immediately after printing the blocked message for negatives.'],
    tests: [['5', '50'], ['-3', 'negative blocked\n0'], ['0', '0'], ['12', '120']],
  }),

  question({
    topic: 'py-testing-basics', language: 'python', course: 'python',
    title: 'Self-Tested max3',
    statement: 'Define max3(a,b,c) returning the largest of three values and test_max3() containing asserts for distinct values, all-negative values, and all-equal values. Run the tests, then read three integers and print their maximum and the passing message.',
    input: 'One line: three integers.',
    output: 'First line: max=<value>. Second line: max3 tests passed.',
    constraints: 'Values fit in Python int.',
    difficulty: 'Easy', tags: ['assert', 'testing'],
    starter: `import sys

def max3(a, b, c):
    # TODO: return the largest of the three values.
    return a

def test_max3():
    # TODO: assert distinct, negative, and all-equal cases.
    pass

def solve() -> None:
    test_max3()
    nums = [int(x) for x in sys.stdin.read().split()]
    if len(nums) < 3:
        return
    print(f"max={max3(nums[0], nums[1], nums[2])}")
    print("max3 tests passed")

solve()`,
    solution: `import sys

def max3(a, b, c):
    return max(a, b, c)

def test_max3():
    assert max3(1, 9, 4) == 9
    assert max3(-5, -2, -9) == -2
    assert max3(7, 7, 7) == 7

def solve() -> None:
    test_max3()
    nums = [int(x) for x in sys.stdin.read().split()]
    if len(nums) < 3:
        return
    print(f"max={max3(nums[0], nums[1], nums[2])}")
    print("max3 tests passed")

solve()`,
    explanation: 'The asserts pin down representative and edge behaviours before input is processed; if any expectation breaks, the program fails loudly instead of printing a wrong answer.',
    hints: ['Include at least one all-equal assert such as max3(7,7,7)==7.', 'Call test_max3() before printing the success message.'],
    tests: [['3 11 6', 'max=11\nmax3 tests passed'], ['-8 -3 -10', 'max=-3\nmax3 tests passed'], ['5 5 5', 'max=5\nmax3 tests passed']],
  }),
];
