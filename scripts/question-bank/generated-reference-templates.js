'use strict';

/**
 * Real reference implementations for the five actual task families produced
 * by the legacy generated-question pipeline.
 *
 * These templates do NOT make the generated bank "tested": topic mapping,
 * title-domain alignment, difficulty labels and duplicates are audited
 * separately. They only replace the pipeline's former English-prose
 * pseudo-code with executable references for the stated stdin/stdout task.
 */

function pythonReference(family, params) {
  if (family === 'arithmetic-transform') {
    return `import sys

MOD = 1000000007
MULTIPLIER = ${params.multiplier}
OFFSET = ${params.offset}

def main() -> None:
    values = list(map(int, sys.stdin.read().strip().split()))
    if not values:
        return
    n = values[0]
    total = 0
    for x in values[1:1 + n]:
        total = (total + x * MULTIPLIER + OFFSET) % MOD
    print(total)

if __name__ == "__main__":
    main()
`;
  }
  if (family === 'string-token-transform') {
    return `import sys

COUNT_VOWELS = ${params.countVowels ? 'True' : 'False'}
THRESHOLD = ${params.threshold}
VOWELS = set("aeiouAEIOU")

def main() -> None:
    words = sys.stdin.read().strip().split()
    count = 0
    for word in words:
        for ch in word:
            if not ch.isalpha():
                continue
            if (COUNT_VOWELS and ch in VOWELS) or ((not COUNT_VOWELS) and ch not in VOWELS):
                count += 1
    transformed = [word[::-1] if len(word) > THRESHOLD else word for word in words]
    print(count)
    print(" ".join(transformed))

if __name__ == "__main__":
    main()
`;
  }
  if (family === 'matrix-border-interior-max') {
    return `import sys

def main() -> None:
    values = list(map(int, sys.stdin.read().strip().split()))
    if len(values) < 2:
        return
    rows, cols = values[0], values[1]
    cells = values[2:]
    border = 0
    interior_max = None
    for r in range(rows):
        for c in range(cols):
            value = cells[r * cols + c]
            if r == 0 or c == 0 or r == rows - 1 or c == cols - 1:
                border += value
            elif interior_max is None or value > interior_max:
                interior_max = value
    print(f"{border} {interior_max}")

if __name__ == "__main__":
    main()
`;
  }
  if (family === 'sliding-window-minmax') {
    return `import sys
from collections import deque

K = ${params.limit}

def main() -> None:
    values = list(map(int, sys.stdin.read().strip().split()))
    if not values:
        print(0)
        return
    a = values[1:1 + values[0]]
    min_q = deque()
    max_q = deque()
    left = 0
    best = 0
    for right, value in enumerate(a):
        while min_q and a[min_q[-1]] >= value:
            min_q.pop()
        while max_q and a[max_q[-1]] <= value:
            max_q.pop()
        min_q.append(right)
        max_q.append(right)
        while a[max_q[0]] - a[min_q[0]] > K:
            if min_q[0] == left:
                min_q.popleft()
            if max_q[0] == left:
                max_q.popleft()
            left += 1
        best = max(best, right - left + 1)
    print(best)

if __name__ == "__main__":
    main()
`;
  }
  return null;
}

function cReference(family, params) {
  if (family === 'arithmetic-transform') {
    return `#include <stdio.h>

int main(void) {
    const long long MOD = 1000000007LL;
    const long long MULTIPLIER = ${params.multiplier}LL;
    const long long OFFSET = ${params.offset}LL;
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long total = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        if (scanf("%lld", &x) != 1) break;
        total = (total + (x * MULTIPLIER + OFFSET) % MOD + MOD) % MOD;
    }
    printf("%lld\\n", total);
    return 0;
}
`;
  }
  if (family === 'string-token-transform') {
    return `#include <ctype.h>
#include <stdio.h>
#include <string.h>

static char words[1000][1024];

static int is_vowel(char ch) {
    return ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' ||
           ch == 'A' || ch == 'E' || ch == 'I' || ch == 'O' || ch == 'U';
}

int main(void) {
    const int COUNT_VOWELS = ${params.countVowels ? 1 : 0};
    const int THRESHOLD = ${params.threshold};
    int count_words = 0;
    long long count = 0;
    while (count_words < 1000 && scanf("%1023s", words[count_words]) == 1) {
        char *word = words[count_words];
        for (int i = 0; word[i]; i++) {
            if (!isalpha((unsigned char)word[i])) continue;
            int vowel = is_vowel(word[i]);
            if ((COUNT_VOWELS && vowel) || (!COUNT_VOWELS && !vowel)) count++;
        }
        int len = (int)strlen(word);
        if (len > THRESHOLD) {
            for (int l = 0, r = len - 1; l < r; l++, r--) {
                char tmp = word[l]; word[l] = word[r]; word[r] = tmp;
            }
        }
        count_words++;
    }
    printf("%lld\\n", count);
    for (int i = 0; i < count_words; i++) {
        if (i) printf(" ");
        printf("%s", words[i]);
    }
    if (count_words) printf("\\n");
    return 0;
}
`;
  }
  if (family === 'matrix-border-interior-max') {
    return `#include <stdio.h>

int main(void) {
    int rows, cols;
    if (scanf("%d %d", &rows, &cols) != 2) return 0;
    long long border = 0;
    long long interior_max = 0;
    int have_interior = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            long long value;
            if (scanf("%lld", &value) != 1) return 0;
            if (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) border += value;
            else if (!have_interior || value > interior_max) {
                interior_max = value;
                have_interior = 1;
            }
        }
    }
    printf("%lld %lld\\n", border, interior_max);
    return 0;
}
`;
  }
  if (family === 'sliding-window-minmax') {
    return `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    const long long K = ${params.limit}LL;
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long *a = malloc(sizeof(long long) * (n > 0 ? n : 1));
    int *min_q = malloc(sizeof(int) * (n > 0 ? n : 1));
    int *max_q = malloc(sizeof(int) * (n > 0 ? n : 1));
    for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
    int min_head = 0, min_tail = 0, max_head = 0, max_tail = 0;
    int left = 0, best = 0;
    for (int right = 0; right < n; right++) {
        while (min_tail > min_head && a[min_q[min_tail - 1]] >= a[right]) min_tail--;
        while (max_tail > max_head && a[max_q[max_tail - 1]] <= a[right]) max_tail--;
        min_q[min_tail++] = right;
        max_q[max_tail++] = right;
        while (a[max_q[max_head]] - a[min_q[min_head]] > K) {
            if (min_q[min_head] == left) min_head++;
            if (max_q[max_head] == left) max_head++;
            left++;
        }
        int len = right - left + 1;
        if (len > best) best = len;
    }
    printf("%d\\n", best);
    free(a); free(min_q); free(max_q);
    return 0;
}
`;
  }
  return null;
}

function cppReference(family, params) {
  if (family === 'arithmetic-transform') {
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    const long long MULTIPLIER = ${params.multiplier}LL;
    const long long OFFSET = ${params.offset}LL;
    int n;
    if (!(cin >> n)) return 0;
    long long total = 0;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x;
        total = (total + (x * MULTIPLIER + OFFSET) % MOD + MOD) % MOD;
    }
    cout << total << '\\n';
    return 0;
}
`;
  }
  if (family === 'string-token-transform') {
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const bool COUNT_VOWELS = ${params.countVowels ? 'true' : 'false'};
    const int THRESHOLD = ${params.threshold};
    const string VOWELS = "aeiouAEIOU";
    vector<string> words;
    string word;
    long long count = 0;
    while (cin >> word) {
        for (char ch : word) {
            if (!isalpha((unsigned char)ch)) continue;
            bool vowel = VOWELS.find(ch) != string::npos;
            if ((COUNT_VOWELS && vowel) || (!COUNT_VOWELS && !vowel)) count++;
        }
        if ((int)word.size() > THRESHOLD) reverse(word.begin(), word.end());
        words.push_back(word);
    }
    cout << count << '\\n';
    for (size_t i = 0; i < words.size(); i++) {
        if (i) cout << ' ';
        cout << words[i];
    }
    if (!words.empty()) cout << '\\n';
    return 0;
}
`;
  }
  if (family === 'matrix-border-interior-max') {
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int rows, cols;
    if (!(cin >> rows >> cols)) return 0;
    long long border = 0;
    long long interior_max = 0;
    bool have_interior = false;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            long long value; cin >> value;
            if (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) border += value;
            else if (!have_interior || value > interior_max) {
                interior_max = value;
                have_interior = true;
            }
        }
    }
    cout << border << ' ' << interior_max << '\\n';
    return 0;
}
`;
  }
  if (family === 'sliding-window-minmax') {
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long K = ${params.limit}LL;
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    deque<int> min_q, max_q;
    int left = 0, best = 0;
    for (int right = 0; right < n; right++) {
        while (!min_q.empty() && a[min_q.back()] >= a[right]) min_q.pop_back();
        while (!max_q.empty() && a[max_q.back()] <= a[right]) max_q.pop_back();
        min_q.push_back(right);
        max_q.push_back(right);
        while (a[max_q.front()] - a[min_q.front()] > K) {
            if (min_q.front() == left) min_q.pop_front();
            if (max_q.front() == left) max_q.pop_front();
            left++;
        }
        best = max(best, right - left + 1);
    }
    cout << best << '\\n';
    return 0;
}
`;
  }
  return null;
}

function javaReference(family, params) {
  if (family === 'arithmetic-transform') {
    return `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        final long MOD = 1000000007L;
        final long MULTIPLIER = ${params.multiplier}L;
        final long OFFSET = ${params.offset}L;
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        long total = 0;
        for (int i = 0; i < n && scanner.hasNextLong(); i++) {
            long x = scanner.nextLong();
            total = (total + (x * MULTIPLIER + OFFSET) % MOD + MOD) % MOD;
        }
        System.out.println(total);
    }
}
`;
  }
  if (family === 'string-token-transform') {
    return `import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Solution {
    private static boolean isVowel(char ch) {
        return "aeiouAEIOU".indexOf(ch) >= 0;
    }

    public static void main(String[] args) {
        final boolean COUNT_VOWELS = ${params.countVowels ? 'true' : 'false'};
        final int THRESHOLD = ${params.threshold};
        Scanner scanner = new Scanner(System.in);
        List<String> words = new ArrayList<>();
        long count = 0;
        while (scanner.hasNext()) {
            String word = scanner.next();
            for (char ch : word.toCharArray()) {
                if (!Character.isLetter(ch)) continue;
                boolean vowel = isVowel(ch);
                if ((COUNT_VOWELS && vowel) || (!COUNT_VOWELS && !vowel)) count++;
            }
            if (word.length() > THRESHOLD) word = new StringBuilder(word).reverse().toString();
            words.add(word);
        }
        System.out.println(count);
        System.out.println(String.join(" ", words));
    }
}
`;
  }
  if (family === 'matrix-border-interior-max') {
    return `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int rows = scanner.nextInt();
        int cols = scanner.nextInt();
        long border = 0;
        long interiorMax = 0;
        boolean haveInterior = false;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                long value = scanner.nextLong();
                if (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) border += value;
                else if (!haveInterior || value > interiorMax) {
                    interiorMax = value;
                    haveInterior = true;
                }
            }
        }
        System.out.println(border + " " + interiorMax);
    }
}
`;
  }
  if (family === 'sliding-window-minmax') {
    return `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        final long K = ${params.limit}L;
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = scanner.nextLong();
        Deque<Integer> minQ = new ArrayDeque<>();
        Deque<Integer> maxQ = new ArrayDeque<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < n; right++) {
            while (!minQ.isEmpty() && a[minQ.peekLast()] >= a[right]) minQ.pollLast();
            while (!maxQ.isEmpty() && a[maxQ.peekLast()] <= a[right]) maxQ.pollLast();
            minQ.offerLast(right);
            maxQ.offerLast(right);
            while (a[maxQ.peekFirst()] - a[minQ.peekFirst()] > K) {
                if (minQ.peekFirst() == left) minQ.pollFirst();
                if (maxQ.peekFirst() == left) maxQ.pollFirst();
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        System.out.println(best);
    }
}
`;
  }
  return null;
}

function javascriptReference(family, params) {
  if (family === 'arithmetic-transform') {
    return `const input = require('fs').readFileSync(0, 'utf8').trim();
const values = input ? input.split(/\\s+/).map(Number) : [];
const MOD = 1000000007;
const MULTIPLIER = ${params.multiplier};
const OFFSET = ${params.offset};
const n = values[0] || 0;
let total = 0;
for (const x of values.slice(1, 1 + n)) {
  total = ((total + x * MULTIPLIER + OFFSET) % MOD + MOD) % MOD;
}
console.log(total);
`;
  }
  if (family === 'string-token-transform') {
    return `const input = require('fs').readFileSync(0, 'utf8').trim();
const words = input ? input.split(/\\s+/) : [];
const COUNT_VOWELS = ${params.countVowels ? 'true' : 'false'};
const THRESHOLD = ${params.threshold};
const vowels = new Set('aeiouAEIOU');
let count = 0;
for (const word of words) {
  for (const ch of word) {
    if (!/[A-Za-z]/.test(ch)) continue;
    const vowel = vowels.has(ch);
    if ((COUNT_VOWELS && vowel) || (!COUNT_VOWELS && !vowel)) count++;
  }
}
console.log(count);
console.log(words.map((word) => word.length > THRESHOLD ? word.split('').reverse().join('') : word).join(' '));
`;
  }
  if (family === 'matrix-border-interior-max') {
    return `const input = require('fs').readFileSync(0, 'utf8').trim();
const values = input ? input.split(/\\s+/).map(Number) : [];
const rows = values[0] || 0;
const cols = values[1] || 0;
let border = 0;
let interiorMax = null;
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const value = values[2 + r * cols + c];
    if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) border += value;
    else if (interiorMax === null || value > interiorMax) interiorMax = value;
  }
}
console.log(border + ' ' + interiorMax);
`;
  }
  if (family === 'sliding-window-minmax') {
    return `const input = require('fs').readFileSync(0, 'utf8').trim();
const values = input ? input.split(/\\s+/).map(Number) : [];
const K = ${params.limit};
const a = values.slice(1, 1 + (values[0] || 0));
const minQ = [];
const maxQ = [];
let minHead = 0;
let maxHead = 0;
let left = 0;
let best = 0;
for (let right = 0; right < a.length; right++) {
  while (minQ.length > minHead && a[minQ[minQ.length - 1]] >= a[right]) minQ.pop();
  while (maxQ.length > maxHead && a[maxQ[maxQ.length - 1]] <= a[right]) maxQ.pop();
  minQ.push(right);
  maxQ.push(right);
  while (a[maxQ[maxHead]] - a[minQ[minHead]] > K) {
    if (minQ[minHead] === left) minHead++;
    if (maxQ[maxHead] === left) maxHead++;
    left++;
  }
  best = Math.max(best, right - left + 1);
}
console.log(best);
`;
  }
  return null;
}

function buildGeneratedReference(language, family, params) {
  switch (language) {
    case 'python': return pythonReference(family, params);
    case 'c': return cReference(family, params);
    case 'cpp': return cppReference(family, params);
    case 'java': return javaReference(family, params);
    case 'javascript': return javascriptReference(family, params);
    default: return null;
  }
}

module.exports = { buildGeneratedReference };
