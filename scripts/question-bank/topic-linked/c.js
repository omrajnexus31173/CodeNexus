'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'c-bitwise-operators', language: 'c', course: 'c-lang',
    title: 'Packed Eligibility Flags',
    statement: 'Three student conditions are stored in one unsigned integer: assignment submitted is bit 0, quiz passed is bit 1, and fee paid is bit 2. Read three 0/1 values in that order, pack them with bitwise OR/shifts, print the packed value, and report eligibility only when all three bits are set.',
    input: 'One line containing three integers, each 0 or 1: submitted passed paid.',
    output: 'Print exactly: flags=<packed value> eligible=<yes|no>.',
    constraints: 'Each input value is 0 or 1.',
    difficulty: 'Easy', time: 'O(1)', space: 'O(1)', tags: ['bitwise', 'flags'],
    starter: `#include <stdio.h>

int main(void) {
    int submitted, passed, paid;
    if (scanf("%d %d %d", &submitted, &passed, &paid) != 3) return 0;
    unsigned int flags = 0;
    /* TODO: set bit 0 for submitted, bit 1 for passed, bit 2 for paid. */
    printf("flags=%u eligible=no\\n", flags);
    return 0;
}`,
    solution: `#include <stdio.h>

int main(void) {
    int submitted, passed, paid;
    if (scanf("%d %d %d", &submitted, &passed, &paid) != 3) return 0;
    unsigned int flags = 0;
    if (submitted) flags |= (1u << 0);
    if (passed)    flags |= (1u << 1);
    if (paid)      flags |= (1u << 2);
    printf("flags=%u eligible=%s\\n", flags, flags == 7u ? "yes" : "no");
    return 0;
}`,
    explanation: 'Shift 1 into each condition position and OR the masks into one packed integer. Eligibility is the exact mask 0b111 (7).',
    hints: ['Use (1u << 0), (1u << 1), and (1u << 2) as the three masks.', 'After packing, compare flags with 7 rather than re-checking the three input variables.'],
    tests: [['1 0 1', 'flags=5 eligible=no'], ['1 1 1', 'flags=7 eligible=yes'], ['0 0 0', 'flags=0 eligible=no'], ['0 1 0', 'flags=2 eligible=no']],
  }),

  question({
    topic: 'c-arrays-1d', language: 'c', course: 'c-lang',
    title: 'Hot Days in a Temperature Array',
    statement: 'Traverse a one-dimensional array of daily temperatures. Count how many values are strictly greater than a threshold and find the index of the first occurrence of the hottest temperature.',
    input: 'First line: n threshold. Second line: n integer temperatures.',
    output: 'Print exactly: hot=<count> hottest=<0-based index>.',
    constraints: '1 <= n <= 1000; temperatures and threshold fit in int.',
    difficulty: 'Easy', time: 'O(N)', space: 'O(N)', tags: ['arrays', 'traversal'],
    starter: `#include <stdio.h>

int main(void) {
    int n, threshold;
    if (scanf("%d %d", &n, &threshold) != 2) return 0;
    int temps[1000];
    for (int i = 0; i < n; i++) scanf("%d", &temps[i]);
    int hot = 0;
    int hottest = 0;
    /* TODO: traverse temps once, updating hot and hottest. */
    printf("hot=%d hottest=%d\\n", hot, hottest);
    return 0;
}`,
    solution: `#include <stdio.h>

int main(void) {
    int n, threshold;
    if (scanf("%d %d", &n, &threshold) != 2) return 0;
    int temps[1000];
    for (int i = 0; i < n; i++) scanf("%d", &temps[i]);
    int hot = 0, hottest = 0;
    for (int i = 0; i < n; i++) {
        if (temps[i] > threshold) hot++;
        if (temps[i] > temps[hottest]) hottest = i;
    }
    printf("hot=%d hottest=%d\\n", hot, hottest);
    return 0;
}`,
    explanation: 'One traversal maintains a threshold count and the index of the maximum seen so far. Using > (not >=) for the maximum keeps the first hottest day on ties.',
    hints: ['Initialise hottest to index 0 before the loop.', 'Update hottest only when temps[i] is strictly greater than temps[hottest].'],
    tests: [['6 34\n31 35 29 40 38 33', 'hot=3 hottest=3'], ['1 10\n10', 'hot=0 hottest=0'], ['5 0\n-2 7 7 3 7', 'hot=4 hottest=1'], ['4 100\n90 80 70 60', 'hot=0 hottest=0']],
  }),

  question({
    topic: 'c-pointer-arithmetic-arrays', language: 'c', course: 'c-lang',
    title: 'Maximum by Pointer Walk',
    statement: 'Find the maximum array value and its first offset from the start. The traversal in your solution should advance a pointer (for example, p++) and dereference it rather than indexing the array inside the search loop.',
    input: 'First line: n. Second line: n integers.',
    output: 'Print exactly: max=<value> offset=<0-based offset>.',
    constraints: '1 <= n <= 1000; values fit in int.',
    difficulty: 'Easy', time: 'O(N)', space: 'O(N)', tags: ['pointers', 'arrays'],
    starter: `#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int *best = a;
    /* TODO: walk a second pointer from a to a+n and move best when needed. */
    printf("max=%d offset=%ld\\n", *best, (long)(best - a));
    return 0;
}`,
    solution: `#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    int a[1000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int *best = a;
    for (int *p = a + 1; p < a + n; p++) {
        if (*p > *best) best = p;
    }
    printf("max=%d offset=%ld\\n", *best, (long)(best - a));
    return 0;
}`,
    explanation: 'Pointer arithmetic moves p one int at a time. Subtracting the base pointer a from best yields the element offset directly.',
    hints: ['Let both best and p be int pointers; compare *p with *best.', 'The expression best - a is already an element count, not a byte count.'],
    tests: [['6\n14 3 27 9 27 5', 'max=27 offset=2'], ['1\n-8', 'max=-8 offset=0'], ['5\n1 2 3 4 5', 'max=5 offset=4'], ['4\n9 9 2 9', 'max=9 offset=0']],
  }),

  question({
    topic: 'c-strings-stringh', language: 'c', course: 'c-lang',
    title: 'Count Vowels in a C String',
    statement: 'Read one lowercase word and count its vowels (a, e, i, o, u) by looping until the terminating null byte.',
    input: 'One lowercase word without spaces.',
    output: 'Print exactly: vowels=<count>.',
    constraints: '1 <= word length <= 200; characters are lowercase a-z.',
    difficulty: 'Easy', time: 'O(N)', space: 'O(N)', tags: ['strings', 'string.h'],
    starter: `#include <stdio.h>

int main(void) {
    char word[201];
    if (scanf("%200s", word) != 1) return 0;
    int count = 0;
    /* TODO: loop while word[i] is not the null terminator. */
    printf("vowels=%d\\n", count);
    return 0;
}`,
    solution: `#include <stdio.h>

int main(void) {
    char word[201];
    if (scanf("%200s", word) != 1) return 0;
    int count = 0;
    for (int i = 0; word[i] != '\\0'; i++) {
        if (word[i] == 'a' || word[i] == 'e' || word[i] == 'i' ||
            word[i] == 'o' || word[i] == 'u') count++;
    }
    printf("vowels=%d\\n", count);
    return 0;
}`,
    explanation: 'A C string ends at the first null byte. Inspect each preceding character and increment a counter for the five lowercase vowels.',
    hints: ['The loop condition is word[i] != 0 (the null terminator).', 'Compare the current character with each of a, e, i, o, and u.'],
    tests: [['education', 'vowels=5'], ['rhythm', 'vowels=0'], ['aeiou', 'vowels=5'], ['programming', 'vowels=3']],
  }),

  question({
    topic: 'c-recursion-basics', language: 'c', course: 'c-lang',
    title: 'Recursive Digit Sum',
    statement: 'Write a recursive function that returns the sum of the decimal digits of a non-negative integer. Use the base case n < 10 and combine n % 10 with the recursive result for n / 10.',
    input: 'One non-negative integer n.',
    output: 'Print the digit sum.',
    constraints: '0 <= n <= 10^12.',
    difficulty: 'Easy', time: 'O(number of digits)', space: 'O(number of digits)', tags: ['recursion'],
    starter: `#include <stdio.h>

long long sum_digits(long long n) {
    /* TODO: base case first, then one recursive call on n / 10. */
    return 0;
}

int main(void) {
    long long n;
    if (scanf("%lld", &n) != 1) return 0;
    printf("%lld\\n", sum_digits(n));
    return 0;
}`,
    solution: `#include <stdio.h>

long long sum_digits(long long n) {
    if (n < 10) return n;
    return (n % 10) + sum_digits(n / 10);
}

int main(void) {
    long long n;
    if (scanf("%lld", &n) != 1) return 0;
    printf("%lld\\n", sum_digits(n));
    return 0;
}`,
    explanation: 'A one-digit number is its own digit sum. Larger values contribute their last digit plus the digit sum of the remaining prefix.',
    hints: ['The base case is n < 10: return n.', 'The recursive step is (n % 10) + sum_digits(n / 10).'],
    tests: [['4725', '18'], ['0', '0'], ['9', '9'], ['1000000000000', '1'], ['99999', '45']],
  }),

  question({
    topic: 'c-enums-typedef', language: 'c', course: 'c-lang',
    title: 'Traffic Signal Enum Actions',
    statement: 'Define enum Signal { RED, YELLOW, GREEN } and a function that maps RED to STOP, YELLOW to WAIT, GREEN to GO, and every other integer code to BROKEN. Read one code and report its action and numeric value.',
    input: 'One integer signal code.',
    output: 'Print exactly: action=<ACTION> value=<code>.',
    constraints: '-100 <= code <= 100. Only 0, 1, and 2 are valid signals.',
    difficulty: 'Easy', time: 'O(1)', space: 'O(1)', tags: ['enum', 'typedef'],
    starter: `#include <stdio.h>

enum Signal { RED, YELLOW, GREEN };

const char *action(enum Signal signal) {
    /* TODO: use a switch over RED, YELLOW, and GREEN. */
    return "BROKEN";
}

int main(void) {
    int code;
    if (scanf("%d", &code) != 1) return 0;
    printf("action=%s value=%d\\n", action((enum Signal)code), code);
    return 0;
}`,
    solution: `#include <stdio.h>

enum Signal { RED, YELLOW, GREEN };

const char *action(enum Signal signal) {
    switch (signal) {
        case RED:    return "STOP";
        case YELLOW: return "WAIT";
        case GREEN:  return "GO";
        default:     return "BROKEN";
    }
}

int main(void) {
    int code;
    if (scanf("%d", &code) != 1) return 0;
    printf("action=%s value=%d\\n", action((enum Signal)code), code);
    return 0;
}`,
    explanation: 'Enum constants default to 0, 1, 2 in declaration order. A switch maps each named value to its action, with default handling invalid codes.',
    hints: ['RED, YELLOW, and GREEN have values 0, 1, and 2 by default.', 'Keep a default branch so codes outside 0..2 report BROKEN.'],
    tests: [['2', 'action=GO value=2'], ['0', 'action=STOP value=0'], ['1', 'action=WAIT value=1'], ['9', 'action=BROKEN value=9']],
  }),

  question({
    topic: 'c-preprocessor-macros', language: 'c', course: 'c-lang',
    title: 'Safe MIN3 Macro',
    statement: 'Define a fully parenthesized MIN2(a,b) function-like macro and build MIN3(a,b,c) from it. Read three integers and print the minimum using MIN3.',
    input: 'One line containing three integers.',
    output: 'Print the smallest integer.',
    constraints: 'Values fit in int. Macro arguments in tests are plain variables (no side-effect expressions).',
    difficulty: 'Easy', time: 'O(1)', space: 'O(1)', tags: ['preprocessor', 'macros'],
    starter: `#include <stdio.h>

/* TODO: define MIN2 first, then define MIN3 in terms of MIN2. */
#define MIN3(a, b, c) (a)

int main(void) {
    int a, b, c;
    if (scanf("%d %d %d", &a, &b, &c) != 3) return 0;
    printf("%d\\n", MIN3(a, b, c));
    return 0;
}`,
    solution: `#include <stdio.h>

#define MIN2(a, b) (((a) < (b)) ? (a) : (b))
#define MIN3(a, b, c) (MIN2(MIN2((a), (b)), (c)))

int main(void) {
    int a, b, c;
    if (scanf("%d %d %d", &a, &b, &c) != 3) return 0;
    printf("%d\\n", MIN3(a, b, c));
    return 0;
}`,
    explanation: 'Parenthesizing the whole macro and every parameter preserves precedence. MIN3 first reduces two values with MIN2, then compares that result with the third.',
    hints: ['Start with #define MIN2(a, b) (((a) < (b)) ? (a) : (b)).', 'MIN3 can be MIN2(MIN2(a, b), c).'],
    tests: [['7 2 9', '2'], ['4 4 1', '1'], ['-3 0 -10', '-10'], ['5 5 5', '5']],
  }),

  question({
    topic: 'c-command-line-args', language: 'c', course: 'c-lang',
    title: 'Simulated argv Name Option',
    statement: 'The input tokens simulate command-line arguments after the program name. Build an argv-style array whose first entry is "prog", then process entries from index 1: an argument of the form --name=X prints "name: X"; every other argument prints "unknown: <argument>".',
    input: 'One line containing zero or more whitespace-separated argument tokens.',
    output: 'One classification line per input token, in order. Print nothing when there are no tokens.',
    constraints: 'At most 20 tokens; each token has at most 63 characters and contains no spaces.',
    difficulty: 'Medium', time: 'O(total input length)', space: 'O(total input length)', tags: ['argc', 'argv', 'strncmp'],
    starter: `#include <stdio.h>
#include <string.h>

void process_args(int argc, char *argv[]) {
    /* TODO: start at index 1. Use strncmp(arg, "--name=", 7). */
    (void)argc; (void)argv;
}

int main(void) {
    static char storage[24][64];
    static char *argv[24];
    int argc = 0;
    argv[argc++] = (char *)"prog";
    while (argc < 24 && scanf("%63s", storage[argc - 1]) == 1) {
        argv[argc] = storage[argc - 1];
        argc++;
    }
    process_args(argc, argv);
    return 0;
}`,
    solution: `#include <stdio.h>
#include <string.h>

void process_args(int argc, char *argv[]) {
    for (int i = 1; i < argc; i++) {
        if (strncmp(argv[i], "--name=", 7) == 0) {
            printf("name: %s\\n", argv[i] + 7);
        } else {
            printf("unknown: %s\\n", argv[i]);
        }
    }
}

int main(void) {
    static char storage[24][64];
    static char *argv[24];
    int argc = 0;
    argv[argc++] = (char *)"prog";
    while (argc < 24 && scanf("%63s", storage[argc - 1]) == 1) {
        argv[argc] = storage[argc - 1];
        argc++;
    }
    process_args(argc, argv);
    return 0;
}`,
    explanation: 'The token reader constructs the same shape as real argv. strncmp checks the seven-character "--name=" prefix, and pointer offset +7 yields the value substring.',
    hints: ['Skip argv[0]; real options begin at argv[1].', 'If strncmp(arg, "--name=", 7) is 0, the value starts at arg + 7.'],
    tests: [['--name=Riya -x', 'name: Riya\nunknown: -x'], ['', ''], ['--name= --verbose --name=Kabir', 'name: \nunknown: --verbose\nname: Kabir'], ['file.txt --name=An', 'unknown: file.txt\nname: An']],
  }),
];
