'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'dsa-arrays-searching', language: 'c', course: 'dsa',
    title: 'Sorted Shelf Binary Search',
    statement: 'Implement binary search over an ascending array. Report the index where the target occurs, or -1 when absent.',
    input: 'First line: n target. Second line: n distinct integers sorted ascending.',
    output: 'Print exactly: <target> at <index>.',
    constraints: '1 <= n <= 10000; values fit in int.',
    difficulty: 'Easy', time: 'O(log N)', space: 'O(N)', tags: ['binary search'],
    starter: `#include <stdio.h>

int binary_search(const int a[], int n, int target) {
    /* TODO: maintain lo/hi and halve the interval each step. */
    (void)a; (void)n; (void)target;
    return -1;
}

int main(void) {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int a[10000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    printf("%d at %d\\n", target, binary_search(a, n, target));
    return 0;
}`,
    solution: `#include <stdio.h>

int binary_search(const int a[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main(void) {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int a[10000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    printf("%d at %d\\n", target, binary_search(a, n, target));
    return 0;
}`,
    explanation: 'The invariant is that the target, if present, lies inside a[lo..hi]. Each comparison discards half of that interval.',
    hints: ['Compute mid as lo + (hi - lo) / 2 to avoid overflow.', 'When a[mid] is too small, discard mid itself with lo = mid + 1.'],
    tests: [['6 401\n101 203 305 401 502 640', '401 at 3'], ['6 400\n101 203 305 401 502 640', '400 at -1'], ['1 5\n5', '5 at 0'], ['5 1\n2 4 6 8 10', '1 at -1']],
  }),

  question({
    topic: 'dsa-strings-algorithms', language: 'c', course: 'dsa',
    title: 'Vowel and Consonant Frequency Split',
    statement: 'Read one lowercase word and count vowels (aeiou) and consonants (all other lowercase letters) in one traversal.',
    input: 'One word containing only lowercase letters a-z.',
    output: 'Print exactly: vowels=<V> consonants=<C>.',
    constraints: '1 <= length <= 500.',
    difficulty: 'Easy', tags: ['strings', 'frequency'],
    starter: `#include <stdio.h>

int main(void) {
    char s[501];
    if (scanf("%500s", s) != 1) return 0;
    int vowels = 0, consonants = 0;
    /* TODO: classify each character until the null terminator. */
    printf("vowels=%d consonants=%d\\n", vowels, consonants);
    return 0;
}`,
    solution: `#include <stdio.h>

int is_vowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int main(void) {
    char s[501];
    if (scanf("%500s", s) != 1) return 0;
    int vowels = 0, consonants = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (is_vowel(s[i])) vowels++;
        else consonants++;
    }
    printf("vowels=%d consonants=%d\\n", vowels, consonants);
    return 0;
}`,
    explanation: 'Every character is classified once: membership in the five-vowel set increments vowels; all remaining lowercase letters are consonants.',
    hints: ['Write a tiny is_vowel helper to keep the loop readable.', 'Because input is letters only, the else branch can safely count a consonant.'],
    tests: [['education', 'vowels=5 consonants=4'], ['rhythm', 'vowels=0 consonants=6'], ['aeiou', 'vowels=5 consonants=0'], ['algorithm', 'vowels=3 consonants=6']],
  }),

  question({
    topic: 'dsa-recursion-backtracking', language: 'c', course: 'dsa',
    title: 'Count Even-Sum Subsets',
    statement: 'Use recursion/backtracking over include/exclude choices to count all subsets whose sum is even. The empty subset sums to 0 and therefore counts.',
    input: 'First line: n. Second line: n integers.',
    output: 'Print exactly: even_sum_subsets=<count>.',
    constraints: '0 <= n <= 20; values fit in int.',
    difficulty: 'Medium', time: 'O(2^N)', space: 'O(N)', tags: ['backtracking', 'subsets'],
    starter: `#include <stdio.h>

int items[20];
int n;
long long count_even = 0;

void explore(int index, long long current_sum) {
    /* TODO: at index == n, count even sums; else branch exclude/include. */
    (void)index; (void)current_sum;
}

int main(void) {
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) scanf("%d", &items[i]);
    explore(0, 0);
    printf("even_sum_subsets=%lld\\n", count_even);
    return 0;
}`,
    solution: `#include <stdio.h>

int items[20];
int n;
long long count_even = 0;

void explore(int index, long long current_sum) {
    if (index == n) {
        if (current_sum % 2 == 0) count_even++;
        return;
    }
    explore(index + 1, current_sum);
    explore(index + 1, current_sum + items[index]);
}

int main(void) {
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) scanf("%d", &items[i]);
    explore(0, 0);
    printf("even_sum_subsets=%lld\\n", count_even);
    return 0;
}`,
    explanation: 'Each item creates two branches (exclude/include), enumerating all 2^n subsets. At a leaf, only the accumulated parity matters.',
    hints: ['Pass both the next index and the running sum into the recursive call.', 'Do not forget the empty subset: the initial leaf path has sum 0.'],
    tests: [['4\n1 2 3 4', 'even_sum_subsets=8'], ['0\n', 'even_sum_subsets=1'], ['3\n2 4 6', 'even_sum_subsets=8'], ['3\n1 3 5', 'even_sum_subsets=4'], ['2\n-1 2', 'even_sum_subsets=2']],
  }),

  question({
    topic: 'dsa-linked-lists', language: 'c', course: 'dsa',
    title: 'Linked List Sum and Second Middle',
    statement: 'Build a singly linked list by appending input values in order. Print the sum of all nodes and the middle value found with slow/fast pointers; for even length, return the second middle (for 2,4,6,8 the middle is 6). Free of arrays for the list storage itself.',
    input: 'First line: n. Second line: n integers.',
    output: 'Print exactly: sum=<sum> middle=<value>.',
    constraints: '1 <= n <= 1000; the sum fits in a 64-bit integer.',
    difficulty: 'Medium', tags: ['linked list', 'two pointers'],
    starter: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

struct Node *append(struct Node *tail, int value) {
    struct Node *node = (struct Node *)malloc(sizeof *node);
    node->data = value;
    node->next = NULL;
    if (tail) tail->next = node;
    return node;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    struct Node *head = NULL, *tail = NULL;
    for (int i = 0; i < n; i++) {
        int x; scanf("%d", &x);
        tail = append(tail, x);
        if (!head) head = tail;
    }
    long long sum = 0;
    int middle = head->data;
    /* TODO: traverse once for sum; then slow/fast pointers for middle. */
    printf("sum=%lld middle=%d\\n", sum, middle);
    return 0;
}`,
    solution: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

struct Node *append(struct Node *tail, int value) {
    struct Node *node = (struct Node *)malloc(sizeof *node);
    if (!node) exit(1);
    node->data = value;
    node->next = NULL;
    if (tail) tail->next = node;
    return node;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    struct Node *head = NULL, *tail = NULL;
    for (int i = 0; i < n; i++) {
        int x; scanf("%d", &x);
        tail = append(tail, x);
        if (!head) head = tail;
    }
    long long sum = 0;
    for (struct Node *p = head; p; p = p->next) sum += p->data;

    struct Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    printf("sum=%lld middle=%d\\n", sum, slow->data);

    while (head) {
        struct Node *next = head->next;
        free(head);
        head = next;
    }
    return 0;
}`,
    explanation: 'Appending with a tail pointer preserves input order in O(1) per node. When fast advances two nodes for each slow step, slow stops at the middle (second middle for even lengths).',
    hints: ['Keep a tail pointer so append does not rescan the list.', 'Advance fast only while fast and fast->next are both non-null.'],
    tests: [['4\n2 4 6 8', 'sum=20 middle=6'], ['1\n99', 'sum=99 middle=99'], ['5\n1 2 3 4 5', 'sum=15 middle=3'], ['3\n-5 5 10', 'sum=10 middle=5']],
  }),

  question({
    topic: 'dsa-stacks', language: 'c', course: 'dsa',
    title: 'Palindrome by Character Stack',
    statement: 'Use an explicit character stack: push every character of the input word, then pop characters to compare the reversed sequence with the original. Report whether the word is a palindrome.',
    input: 'One word without spaces.',
    output: 'Print exactly: <word>: yes or <word>: no.',
    constraints: '1 <= length <= 500.',
    difficulty: 'Easy', tags: ['stack', 'palindrome'],
    starter: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[501];
    if (scanf("%500s", s) != 1) return 0;
    char stack[500];
    int top = -1;
    /* TODO: push all chars, then pop and compare from the start. */
    (void)stack; (void)top;
    printf("%s: no\\n", s);
    return 0;
}`,
    solution: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[501];
    if (scanf("%500s", s) != 1) return 0;
    int len = (int)strlen(s);
    char stack[500];
    int top = -1;
    for (int i = 0; i < len; i++) stack[++top] = s[i];
    int ok = 1;
    for (int i = 0; i < len; i++) {
        if (stack[top--] != s[i]) { ok = 0; break; }
    }
    printf("%s: %s\\n", s, ok ? "yes" : "no");
    return 0;
}`,
    explanation: 'A stack reverses order: popping yields the word backwards. The word is a palindrome exactly when that reversed stream matches the original.',
    hints: ['Push with stack[++top] and pop with stack[top--].', 'Compare the i-th popped character against s[i].'],
    tests: [['level', 'level: yes'], ['lever', 'lever: no'], ['a', 'a: yes'], ['abca', 'abca: no']],
  }),

  question({
    topic: 'dsa-queues', language: 'c', course: 'dsa',
    title: 'Circular Queue Wrap-Around Drain',
    statement: 'Implement a circular queue with the given capacity. Enqueue the first three values, dequeue once, enqueue the last two values (reusing wrapped slots), then drain and print the remaining values in FIFO order.',
    input: 'One line: capacity a b c d e. Capacity is at least 4, so the described operations fit.',
    output: 'Print "drained:" on line 1 and the four remaining values separated by spaces on line 2.',
    constraints: '4 <= capacity <= 100; values fit in int.',
    difficulty: 'Medium', tags: ['queue', 'circular buffer'],
    starter: `#include <stdio.h>

typedef struct {
    int data[100];
    int cap;
    int front;
    int rear;
    int size;
} Queue;

void enqueue(Queue *q, int value) {
    /* TODO: store at rear, advance rear modulo cap, increment size. */
    (void)q; (void)value;
}
int dequeue(Queue *q) {
    /* TODO: read at front, advance front modulo cap, decrement size. */
    (void)q;
    return 0;
}

int main(void) {
    Queue q;
    int a, b, c, d, e;
    if (scanf("%d %d %d %d %d %d", &q.cap, &a, &b, &c, &d, &e) != 6) return 0;
    q.front = q.rear = q.size = 0;
    enqueue(&q, a); enqueue(&q, b); enqueue(&q, c);
    (void)dequeue(&q);
    enqueue(&q, d); enqueue(&q, e);
    printf("drained:\\n");
    int first = 1;
    while (q.size > 0) {
        if (!first) printf(" ");
        first = 0;
        printf("%d", dequeue(&q));
    }
    printf("\\n");
    return 0;
}`,
    solution: `#include <stdio.h>

typedef struct {
    int data[100];
    int cap;
    int front;
    int rear;
    int size;
} Queue;

void enqueue(Queue *q, int value) {
    q->data[q->rear] = value;
    q->rear = (q->rear + 1) % q->cap;
    q->size++;
}
int dequeue(Queue *q) {
    int value = q->data[q->front];
    q->front = (q->front + 1) % q->cap;
    q->size--;
    return value;
}

int main(void) {
    Queue q;
    int a, b, c, d, e;
    if (scanf("%d %d %d %d %d %d", &q.cap, &a, &b, &c, &d, &e) != 6) return 0;
    q.front = q.rear = q.size = 0;
    enqueue(&q, a); enqueue(&q, b); enqueue(&q, c);
    (void)dequeue(&q);
    enqueue(&q, d); enqueue(&q, e);
    printf("drained:\\n");
    int first = 1;
    while (q.size > 0) {
        if (!first) printf(" ");
        first = 0;
        printf("%d", dequeue(&q));
    }
    printf("\\n");
    return 0;
}`,
    explanation: 'Both indices advance modulo capacity, so slots freed at the front become reusable at the rear while FIFO order is preserved.',
    hints: ['After using an index, update it as (index + 1) % cap.', 'Track size separately so full and empty states are unambiguous.'],
    tests: [['4 5 10 15 20 25', 'drained:\n10 15 20 25'], ['5 1 2 3 4 5', 'drained:\n2 3 4 5'], ['4 -1 -2 -3 -4 -5', 'drained:\n-2 -3 -4 -5']],
  }),

  question({
    topic: 'dsa-hashing-basics', language: 'c', course: 'dsa',
    title: 'Linear-Probing Hash Set Lookup',
    statement: 'Implement an integer hash set with table size cap, hash value % cap, and linear probing on collision. Values are distinct and non-negative; use -1 for empty slots. Insert all values, then report contains(x), contains(y), and the slot where x is stored (-1 if x is absent).',
    input: 'First line: cap n x y. Second line: n distinct non-negative integers.',
    output: 'Print exactly: containsX=<0|1> containsY=<0|1> slotX=<slot|-1>.',
    constraints: '1 <= cap <= 1000; 0 <= n < cap; inserted values and x,y are non-negative.',
    difficulty: 'Medium', tags: ['hashing', 'linear probing'],
    starter: `#include <stdio.h>

int table[1000];
int cap;

void insert_value(int value) {
    /* TODO: start at value % cap and probe forward to an empty slot. */
    (void)value;
}
int find_slot(int value) {
    /* TODO: probe until value found or an empty slot is reached. */
    (void)value;
    return -1;
}

int main(void) {
    int n, x, y;
    if (scanf("%d %d %d %d", &cap, &n, &x, &y) != 4) return 0;
    for (int i = 0; i < cap; i++) table[i] = -1;
    for (int i = 0; i < n; i++) { int v; scanf("%d", &v); insert_value(v); }
    int sx = find_slot(x);
    int sy = find_slot(y);
    printf("containsX=%d containsY=%d slotX=%d\\n", sx >= 0, sy >= 0, sx);
    return 0;
}`,
    solution: `#include <stdio.h>

int table[1000];
int cap;

void insert_value(int value) {
    int slot = value % cap;
    while (table[slot] != -1) slot = (slot + 1) % cap;
    table[slot] = value;
}
int find_slot(int value) {
    int slot = value % cap;
    for (int checked = 0; checked < cap; checked++) {
        if (table[slot] == value) return slot;
        if (table[slot] == -1) return -1;
        slot = (slot + 1) % cap;
    }
    return -1;
}

int main(void) {
    int n, x, y;
    if (scanf("%d %d %d %d", &cap, &n, &x, &y) != 4) return 0;
    for (int i = 0; i < cap; i++) table[i] = -1;
    for (int i = 0; i < n; i++) { int v; scanf("%d", &v); insert_value(v); }
    int sx = find_slot(x);
    int sy = find_slot(y);
    printf("containsX=%d containsY=%d slotX=%d\\n", sx >= 0, sy >= 0, sx);
    return 0;
}`,
    explanation: 'Collisions probe the next slots cyclically. Lookup follows the same probe sequence and can stop at the first empty slot because an inserted key would have occupied it.',
    hints: ['The home slot is value % cap; probe with (slot + 1) % cap.', 'During lookup, an empty slot proves absence for this probe chain.'],
    tests: [['10 4 22 8\n12 22 32 7', 'containsX=1 containsY=0 slotX=3'], ['5 3 9 6\n6 11 16', 'containsX=0 containsY=1 slotX=-1'], ['7 0 3 3\n', 'containsX=0 containsY=0 slotX=-1'], ['4 3 8 4\n4 8 12', 'containsX=1 containsY=1 slotX=1']],
  }),

  question({
    topic: 'dsa-sorting-basics', language: 'c', course: 'dsa',
    title: 'Insertion Sort Shift Counter',
    statement: 'Implement insertion sort in ascending order. Count each execution of the inner shifting step (moving one larger element one position right), then print the sorted array and the shift count.',
    input: 'First line: n. Second line: n integers.',
    output: 'First line: sorted values separated by spaces. Second line: shifts=<count>.',
    constraints: '1 <= n <= 5000.',
    difficulty: 'Easy', time: 'O(N^2)', tags: ['insertion sort'],
    starter: `#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[5000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    long long shifts = 0;
    /* TODO: for each key, shift larger sorted-prefix values right. */
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\nshifts=%lld\\n", shifts);
    return 0;
}`,
    solution: `#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[5000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    long long shifts = 0;
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            shifts++;
            j--;
        }
        a[j + 1] = key;
    }
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\nshifts=%lld\\n", shifts);
    return 0;
}`,
    explanation: 'Each shift moves one already-sorted element past the current key, so the shift count equals the number of inversions removed during sorting.',
    hints: ['Save a[i] as key before shifting so it is not overwritten.', 'Increment the counter only inside the while loop body.'],
    tests: [['6\n9 3 7 1 8 2', '1 2 3 7 8 9\nshifts=10'], ['4\n1 2 3 4', '1 2 3 4\nshifts=0'], ['4\n4 3 2 1', '1 2 3 4\nshifts=6'], ['1\n42', '42\nshifts=0']],
  }),

  question({
    topic: 'dsa-sorting-divide-conquer', language: 'c', course: 'dsa',
    title: 'Merge Sort the Scoreboard',
    statement: 'Implement merge sort (divide, recursively sort, then merge with a temporary buffer) to sort integers in ascending order.',
    input: 'First line: n. Second line: n integers.',
    output: 'Sorted values separated by single spaces.',
    constraints: '1 <= n <= 5000.',
    difficulty: 'Medium', time: 'O(N log N)', space: 'O(N)', tags: ['merge sort', 'divide and conquer'],
    starter: `#include <stdio.h>

int a[5000];
int tmp[5000];

void merge_sort(int lo, int hi) {
    /* TODO: base case, sort halves, merge through tmp. */
    (void)lo; (void)hi;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    merge_sort(0, n - 1);
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\n");
    return 0;
}`,
    solution: `#include <stdio.h>

int a[5000];
int tmp[5000];

void merge_sort(int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort(lo, mid);
    merge_sort(mid + 1, hi);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (int t = lo; t <= hi; t++) a[t] = tmp[t];
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    merge_sort(0, n - 1);
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\n");
    return 0;
}`,
    explanation: 'After recursively sorting both halves, merging two sorted runs is linear because the smaller front element is always next. The recurrence gives O(N log N).',
    hints: ['Merge only after both recursive calls return sorted halves.', 'Copy the merged tmp segment back into a before returning.'],
    tests: [['6\n12 4 19 1 15 8', '1 4 8 12 15 19'], ['5\n5 4 3 2 1', '1 2 3 4 5'], ['4\n2 2 1 2', '1 2 2 2'], ['1\n-9', '-9']],
  }),

  question({
    topic: 'dsa-binary-trees-traversals', language: 'c', course: 'dsa',
    title: 'Level-Order Tree Inorder and Height',
    statement: 'A binary tree is given in level-order array form: node at index i has children at 2i+1 and 2i+2, and -1 means no node. Build linked nodes, print the inorder traversal, and print the height measured in nodes on the longest root-to-leaf path.',
    input: 'First line: n. Second line: n integers, with -1 for missing nodes. The representation is valid and the root is present.',
    output: 'First line: inorder values separated by spaces. Second line: height=<nodes>.',
    constraints: '1 <= n <= 1023; non-null values are non-negative.',
    difficulty: 'Medium', tags: ['binary tree', 'inorder', 'height'],
    starter: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *left, *right;
};

struct Node *new_node(int value) {
    struct Node *node = (struct Node *)malloc(sizeof *node);
    node->data = value;
    node->left = node->right = NULL;
    return node;
}
void inorder(struct Node *root, int *first) {
    /* TODO: left subtree, root, right subtree. */
    (void)root; (void)first;
}
int height(struct Node *root) {
    /* TODO: 0 for NULL, otherwise 1 + max child height. */
    (void)root;
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int values[1023];
    struct Node *nodes[1023] = {0};
    for (int i = 0; i < n; i++) {
        scanf("%d", &values[i]);
        if (values[i] != -1) nodes[i] = new_node(values[i]);
    }
    for (int i = 0; i < n; i++) if (nodes[i]) {
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < n) nodes[i]->left = nodes[l];
        if (r < n) nodes[i]->right = nodes[r];
    }
    int first = 1;
    inorder(nodes[0], &first);
    printf("\\nheight=%d\\n", height(nodes[0]));
    return 0;
}`,
    solution: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *left, *right;
};

struct Node *new_node(int value) {
    struct Node *node = (struct Node *)malloc(sizeof *node);
    if (!node) exit(1);
    node->data = value;
    node->left = node->right = NULL;
    return node;
}
void inorder(struct Node *root, int *first) {
    if (!root) return;
    inorder(root->left, first);
    if (!*first) printf(" ");
    *first = 0;
    printf("%d", root->data);
    inorder(root->right, first);
}
int height(struct Node *root) {
    if (!root) return 0;
    int lh = height(root->left);
    int rh = height(root->right);
    return 1 + (lh > rh ? lh : rh);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int values[1023];
    struct Node *nodes[1023] = {0};
    for (int i = 0; i < n; i++) {
        scanf("%d", &values[i]);
        if (values[i] != -1) nodes[i] = new_node(values[i]);
    }
    for (int i = 0; i < n; i++) if (nodes[i]) {
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < n) nodes[i]->left = nodes[l];
        if (r < n) nodes[i]->right = nodes[r];
    }
    int first = 1;
    inorder(nodes[0], &first);
    printf("\\nheight=%d\\n", height(nodes[0]));
    for (int i = 0; i < n; i++) free(nodes[i]);
    return 0;
}`,
    explanation: 'Heap-style indices link parents to children. Inorder follows left-root-right; height adds one for the current node above the taller subtree.',
    hints: ['Children of index i are exactly 2i+1 and 2i+2.', 'Height of NULL is 0 under the node-count definition.'],
    tests: [['7\n8 3 10 1 6 -1 14', '1 3 6 8 10 14\nheight=3'], ['1\n5', '5\nheight=1'], ['3\n2 1 -1', '1 2\nheight=2'], ['7\n1 2 3 4 5 6 7', '4 2 5 1 6 3 7\nheight=3']],
  }),

  question({
    topic: 'dsa-binary-search-tree', language: 'c', course: 'dsa',
    title: 'BST Insert Search and Delete',
    statement: 'Insert distinct keys into a binary search tree in input order. Print the inorder traversal, report searches for x and y, delete key d (using the inorder successor when it has two children), and print the inorder traversal again.',
    input: 'First line: n x y d. Second line: n distinct integer keys. Key d is present.',
    output: 'Line 1: inorder before deletion. Line 2: found<x>=<0|1> found<y>=<0|1>. Line 3: inorder after deletion.',
    constraints: '1 <= n <= 1000; keys are distinct.',
    difficulty: 'Hard', time: 'O(N) average per operation set', space: 'O(N)', tags: ['BST', 'delete'],
    starter: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int key;
    struct Node *left, *right;
};

struct Node *insert_node(struct Node *root, int key) {
    /* TODO: create at NULL; recurse left/right by comparison. */
    (void)key;
    return root;
}
int search_node(struct Node *root, int key) {
    /* TODO: follow BST ordering; do not scan both sides. */
    (void)root; (void)key;
    return 0;
}
struct Node *delete_node(struct Node *root, int key) {
    /* TODO: handle leaf, one-child, and two-child successor cases. */
    (void)key;
    return root;
}
void inorder(struct Node *root, int *first) {
    if (!root) return;
    inorder(root->left, first);
    if (!*first) printf(" ");
    *first = 0;
    printf("%d", root->key);
    inorder(root->right, first);
}

int main(void) {
    int n, x, y, d;
    if (scanf("%d %d %d %d", &n, &x, &y, &d) != 4) return 0;
    struct Node *root = NULL;
    for (int i = 0; i < n; i++) { int v; scanf("%d", &v); root = insert_node(root, v); }
    int first = 1;
    inorder(root, &first);
    printf("\\nfound%d=%d found%d=%d\\n", x, search_node(root, x), y, search_node(root, y));
    root = delete_node(root, d);
    first = 1;
    inorder(root, &first);
    printf("\\n");
    return 0;
}`,
    solution: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int key;
    struct Node *left, *right;
};

struct Node *new_node(int key) {
    struct Node *node = (struct Node *)malloc(sizeof *node);
    if (!node) exit(1);
    node->key = key;
    node->left = node->right = NULL;
    return node;
}
struct Node *insert_node(struct Node *root, int key) {
    if (!root) return new_node(key);
    if (key < root->key) root->left = insert_node(root->left, key);
    else if (key > root->key) root->right = insert_node(root->right, key);
    return root;
}
int search_node(struct Node *root, int key) {
    while (root) {
        if (key == root->key) return 1;
        root = (key < root->key) ? root->left : root->right;
    }
    return 0;
}
struct Node *min_node(struct Node *root) {
    while (root && root->left) root = root->left;
    return root;
}
struct Node *delete_node(struct Node *root, int key) {
    if (!root) return NULL;
    if (key < root->key) {
        root->left = delete_node(root->left, key);
    } else if (key > root->key) {
        root->right = delete_node(root->right, key);
    } else {
        if (!root->left) {
            struct Node *r = root->right;
            free(root);
            return r;
        }
        if (!root->right) {
            struct Node *l = root->left;
            free(root);
            return l;
        }
        struct Node *successor = min_node(root->right);
        root->key = successor->key;
        root->right = delete_node(root->right, successor->key);
    }
    return root;
}
void inorder(struct Node *root, int *first) {
    if (!root) return;
    inorder(root->left, first);
    if (!*first) printf(" ");
    *first = 0;
    printf("%d", root->key);
    inorder(root->right, first);
}
void free_tree(struct Node *root) {
    if (!root) return;
    free_tree(root->left);
    free_tree(root->right);
    free(root);
}

int main(void) {
    int n, x, y, d;
    if (scanf("%d %d %d %d", &n, &x, &y, &d) != 4) return 0;
    struct Node *root = NULL;
    for (int i = 0; i < n; i++) { int v; scanf("%d", &v); root = insert_node(root, v); }
    int first = 1;
    inorder(root, &first);
    printf("\\nfound%d=%d found%d=%d\\n", x, search_node(root, x), y, search_node(root, y));
    root = delete_node(root, d);
    first = 1;
    inorder(root, &first);
    printf("\\n");
    free_tree(root);
    return 0;
}`,
    explanation: 'BST insertion/search follow one comparison path. For a two-child deletion, copy the smallest key from the right subtree (inorder successor), then delete that successor node.',
    hints: ['Inorder traversal of a valid BST is sorted ascending—use it to sanity-check inserts.', 'The inorder successor is the leftmost node in the right subtree.'],
    tests: [
      ['9 7 9 3\n8 3 10 1 6 14 4 7 13', '1 3 4 6 7 8 10 13 14\nfound7=1 found9=0\n1 4 6 7 8 10 13 14'],
      ['5 4 9 5\n5 3 8 4 9', '3 4 5 8 9\nfound4=1 found9=1\n3 4 8 9'],
      ['3 2 99 1\n2 1 3', '1 2 3\nfound2=1 found99=0\n2 3'],
      ['1 7 8 7\n7', '7\nfound7=1 found8=0\n'],
    ],
  }),

  question({
    topic: 'dsa-graphs-bfs-dfs', language: 'c', course: 'dsa',
    title: 'DFS Order from an Adjacency Matrix',
    statement: 'Given an undirected graph as an adjacency matrix, run recursive DFS from vertex 0, scanning neighbours in increasing vertex order. Print the visit order and how many vertices are reachable from 0.',
    input: 'First line: n. Next n lines: n integers (0/1) forming the adjacency matrix.',
    output: 'First line: DFS visit order separated by spaces. Second line: reachable=<count>.',
    constraints: '1 <= n <= 100; matrix is symmetric with zero diagonal.',
    difficulty: 'Medium', time: 'O(N^2)', space: 'O(N^2)', tags: ['graphs', 'DFS'],
    starter: `#include <stdio.h>

int adj[100][100];
int visited[100];
int n;
int reached = 0;
int first = 1;

void dfs(int v) {
    /* TODO: mark/print v, then recurse to unvisited neighbours in order. */
    (void)v;
}

int main(void) {
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) scanf("%d", &adj[i][j]);
    dfs(0);
    printf("\\nreachable=%d\\n", reached);
    return 0;
}`,
    solution: `#include <stdio.h>

int adj[100][100];
int visited[100];
int n;
int reached = 0;
int first = 1;

void dfs(int v) {
    visited[v] = 1;
    reached++;
    if (!first) printf(" ");
    first = 0;
    printf("%d", v);
    for (int u = 0; u < n; u++) {
        if (adj[v][u] && !visited[u]) dfs(u);
    }
}

int main(void) {
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) scanf("%d", &adj[i][j]);
    dfs(0);
    printf("\\nreachable=%d\\n", reached);
    return 0;
}`,
    explanation: 'Marking a vertex on entry prevents cycles from causing repeats. Scanning matrix columns left-to-right gives the required increasing-neighbour DFS order.',
    hints: ['Mark visited before exploring neighbours.', 'The neighbour loop must run from 0 to n-1 for deterministic order.'],
    tests: [
      ['6\n0 1 1 0 0 0\n1 0 0 1 0 0\n1 0 0 0 1 0\n0 1 0 0 0 1\n0 0 1 0 0 0\n0 0 0 1 0 0', '0 1 3 5 2 4\nreachable=6'],
      ['3\n0 0 0\n0 0 1\n0 1 0', '0\nreachable=1'],
      ['4\n0 1 0 0\n1 0 1 0\n0 1 0 1\n0 0 1 0', '0 1 2 3\nreachable=4'],
      ['1\n0', '0\nreachable=1'],
    ],
  }),

  question({
    topic: 'dsa-dynamic-programming-intro', language: 'c', course: 'dsa',
    title: 'Staircase Ways with Tabulation',
    statement: 'A climber can take 1 or 2 steps at a time. Using bottom-up tabulation with ways(0)=1 and ways(1)=1, answer two staircase sizes read from input.',
    input: 'One line containing two integers n and m.',
    output: 'Print ways(n) and ways(m), each on its own line.',
    constraints: '0 <= n,m <= 60; results fit in signed 64-bit.',
    difficulty: 'Easy', time: 'O(max(N,M))', space: 'O(max(N,M))', tags: ['DP', 'tabulation'],
    starter: `#include <stdio.h>

long long ways(int n) {
    long long dp[61];
    dp[0] = 1;
    if (n >= 1) dp[1] = 1;
    /* TODO: fill dp[i] from the previous two entries. */
    return dp[n];
}

int main(void) {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    printf("%lld\\n%lld\\n", ways(n), ways(m));
    return 0;
}`,
    solution: `#include <stdio.h>

long long ways(int n) {
    long long dp[61];
    dp[0] = 1;
    if (n >= 1) dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

int main(void) {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    printf("%lld\\n%lld\\n", ways(n), ways(m));
    return 0;
}`,
    explanation: 'The last move is either a single step from i-1 or a double step from i-2, so ways(i)=ways(i-1)+ways(i-2). Filling the table once avoids repeated subproblems.',
    hints: ['Seed both base cases before the loop: ways(0)=ways(1)=1.', 'Each table entry combines exactly the previous two entries.'],
    tests: [['10 20', '89\n10946'], ['0 1', '1\n1'], ['5 6', '8\n13'], ['60 30', '2504730781961\n1346269']],
  }),
];
