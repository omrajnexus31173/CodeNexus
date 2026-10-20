'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'dsa-arrays-searching', walkEx:2, course_id:'dsa', unit_id:'dsa-unit-1', order_index:2,
  title:'Arrays as a Data Structure: Traversal & Searching', desc:'Cost model of arrays and the two fundamental searches — linear and binary.',
  obj:['State time complexities of access/insert/delete on arrays with reasons','Implement linear search and handle not-found cleanly','Implement iterative binary search and prove its halving argument'],
  pre:['Big-O & complexity (previous topic)','C arrays and functions'],
  outcomes:['Learner chooses and implements a search strategy appropriate to data order'],
  def:'An array stores elements contiguously, giving O(1) index access but O(n) insertion/deletion due to shifting. Linear search scans sequentially (O(n) worst). Binary search repeatedly halves a SORTED array\'s candidate interval, achieving O(log n) comparisons.',
  simple:'An array is a row of house-numbered boxes: knowing the number gets you there instantly (that is O(1) access), but squeezing a new box into the middle means shifting everyone after it (O(n)). Searching picks its strategy based on order. If the boxes are jumbled, you must peek one by one — linear search. If they are sorted, you can play the number-guessing game: check the middle, discard the impossible half, repeat. Each guess halves the haystack — a million items need about 20 guesses, not a million. That halving is why binary search is O(log n) and why sortedness is not a suggestion but a requirement.',
  hing:'Array ek line me saje dabbon jaisa hai: number pata ho to seedha wahan (O(1) access), lekin beech me kuch ghusaana ho to baaki sab ko sarakna padega (O(n) insertion). Searching me do mashhoor tareeke hain. Linear search: ek-ek karke dekho, sabse bura haal me saare n elements. Binary search: agar array SORTED hai to beech wala check karo, aadha hissa ek jhatke me kaat do — 10 lakh me lagbhag 20 kadam! Binary search ki sabse badi shart hai sorted hona; bina sorted ke ye ghup-chaap galat jawab dega, error nahi. Aur dhyan do mid nikaalne ka safe tareeka: low + (high - low) / 2, taaki badi values me overflow na ho.',
  why:'Searching is the most common operation in computing (every lookup, login, product search). The linear-vs-binary contrast is the canonical first lesson in algorithmic leverage: a small precondition (sorted) buys exponential-feeling speedups.',
  when:'Linear search for small or unsorted data and one-off scans. Binary search when data is sorted and searched repeatedly (sort once O(n log n), search forever O(log n)). For dynamic sets with frequent inserts, other structures (hash tables, BSTs) win.',
  syntax:'int linear(const int a[], int n, int key) {\n    for (int i = 0; i < n; i++) if (a[i] == key) return i;\n    return -1;\n}\nwhile (lo <= hi) {                 // binary search skeleton\n    int mid = lo + (hi - lo) / 2;   // overflow-safe midpoint\n    ...compare a[mid] with key, shrink a side...\n}',
  comp:[['O(1) access','Address = base + index*size: constant work'],['Search invariant (binary)','If present, key lies within a[lo..hi]; each step preserves this while halving the range'],['sorted prerequisite','Unsorted input makes binary search answer wrongly, silently']],
  ex:[
   {t:'Basic: linear search with comparison counting',code:`#include <stdio.h>
int linear_search(const int a[], int n, int key, int *comparisons) {
    *comparisons = 0;
    for (int i = 0; i < n; i++) {
        (*comparisons)++;
        if (a[i] == key) return i;
    }
    return -1;
}
int main(void) {
    int a[] = {34, 7, 23, 89, 12, 65};
    int n = sizeof(a) / sizeof(a[0]);
    int comps = 0;
    int at = linear_search(a, n, 89, &comps);
    printf("found at %d after %d comparison(s)\\n", at, comps);
    at = linear_search(a, n, 100, &comps);
    printf("missing -> %d after %d comparison(s)\\n", at, comps);
    return 0;
}`,out:`found at 3 after 4 comparison(s)
missing -> -1 after 6 comparison(s)`,why:'Position 3 means 4 elements were examined. A missing key forces the full n comparisons — the unavoidable worst case that makes linear search O(n). No order assumption was needed.'},
   {t:'Intermediate: binary search traces its halving',code:`#include <stdio.h>
int binary_search(const int a[], int n, int key) {
    int lo = 0, hi = n - 1, steps = 0;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        steps++;
        printf("step %d: lo=%d mid=%d hi=%d a[mid]=%d\\n", steps, lo, mid, hi, a[mid]);
        if (a[mid] == key) return mid;
        if (key < a[mid]) hi = mid - 1;
        else lo = mid + 1;
    }
    return -1;
}
int main(void) {
    int sorted[] = {3, 8, 15, 21, 34, 47, 59, 66, 72, 90};
    int idx = binary_search(sorted, 10, 66);
    printf("index = %d\\n", idx);
    return 0;
}`,out:`step 1: lo=0 mid=4 hi=9 a[mid]=34
step 2: lo=5 mid=7 hi=9 a[mid]=66
index = 7`,why:'One comparison eliminated indices 0..4 wholesale (66 > 34 → right half only). Two probes total for 10 elements — every step provably halves [lo, hi], which is the O(log n) argument in miniature.'},
   {t:'Advanced: insertion cost — why arrays dislike middles',code:`#include <stdio.h>
int insert_at(int a[], int n, int capacity, int pos, int value) {
    if (n >= capacity || pos < 0 || pos > n) return n;
    for (int i = n; i > pos; i--) a[i] = a[i - 1];
    a[pos] = value;
    return n + 1;
}
int main(void) {
    int a[8] = {10, 20, 30, 40};
    int n = 4;
    n = insert_at(a, n, 8, 1, 15);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\\nn=%d, front-access a[0]=%d in O(1), shifted %d elements\\n", n, a[0], 3);
    return 0;
}`,out:`10 15 20 30 40 
n=5, front-access a[0]=10 in O(1), shifted 3 elements`,why:'Inserting at position 1 forced 20, 30, 40 to shift right — the O(n-pos) tax contiguity charges. Appending at the end (pos == n) skips the loop entirely: position determines cost.'}
  ],
  walk:[[3,'Search space is the whole sorted array: lo=0, hi=9, invariant "66, if present, is in a[0..9]".','range size 10'],[5,'mid=4 → a[mid]=34. 66 > 34, so the invariant narrows to a[5..9] and lo jumps to 5 (mid+1, since a[4] itself is ruled out).','range size 5'],[8,'mid = 5 + (9-5)/2 = 7 → a[7]=66, exact match; return 7.','found in 2 probes']],
  walkWhy:'The loop invariant is the correctness engine: initial range certainly contains the key (if anywhere), each branch discards only provably-impossible halves, and range emptiness proves absence.',
  rules:['Binary search requires sorted order in the SAME sense as its comparisons; duplicates return an unspecified matching index.','Use mid = lo + (hi - lo)/2 to avoid int overflow in (lo+hi)/2 for huge ranges.','Array insert/delete cost is O(n) in the middle, O(1) amortised at the end (with spare capacity).','When search frequency is high, paying one O(n log n) sort amortises across many O(log n) searches.'],
  mistakes:[
   {t:'Infinite loop from mid not excluded',bad:'while (lo <= hi) {\n    int mid = (lo + hi) / 2;\n    if (key > a[mid]) lo = mid;      // BUG: range may stop shrinking\n    else if (key < a[mid]) hi = mid; // BUG\n    else return mid;\n}',why:'With lo=0, hi=1, mid=0 and key greater, lo=mid sets lo to 0 again — no progress, forever. Every branch must shrink the interval strictly.',fix:'if (key > a[mid]) lo = mid + 1;\nelse if (key < a[mid]) hi = mid - 1;',tip:'Audit binary loops with the two-element case; if any branch can repeat an identical (lo,hi), it is wrong.'},
   {t:'Running binary search on unsorted data',bad:'int a[] = {34, 7, 23, 89, 12};   // not sorted\nbinary_search(a, 5, 12);          // may report -1 though 12 exists',why:'Halving discards halves based on comparisons that only carry meaning under sortedness. On jumbled data the discarded half may contain the key — wrong answer, no error raised.',fix:'sort_first_or_use_linear_search(a);\n// verify sortedness in debug builds when in doubt',tip:'Binary search has a contract (sorted). Either establish sortedness once or stay linear.'}
  ],
  cmp:['Array operations cost card',['Operation','Cost','Why'],[['Access a[i]','O(1)','Address arithmetic'],['Search unsorted','O(n)','May inspect all'],['Search sorted','O(log n)','Halving argument'],['Insert/delete middle','O(n)','Shifting tail'],['Append (spare capacity)','O(1) amortised','No shifting']]],
  diag:{kind:'flow',start:'Interval [lo, hi] may hold key',condition:'lo <= hi?',trueAction:'Probe mid; discard one half',falseAction:'Key absent -> return -1',end:'Match returns index'},
  apps:['Dictionary/word lookup in sorted vocabularies and autocomplete indexes.','Finding version boundaries (git-bisect is binary search over commits).','Numerical root-finding by bisection mirrors the same halving invariant.'],
  quizzes:[{q:'A sorted array of 1,000,000 elements needs at most about how many binary-search probes?',options:['1,000,000','1,000','20','100'],correct:2,why:'Each probe halves the space; 2^20 = 1,048,576, so roughly 20 probes suffice (log2 n).'},
            {q:'Why is array middle-insertion O(n)?',options:['Allocation','Elements after the position must shift to preserve contiguity','Comparison cost','Cache misses only'],correct:1,why:'Contiguous storage leaves no gaps; making room moves the entire suffix by one slot.'}],
  take:['Sortedness is an investment: it converts O(n) searches into O(log n).','Binary loops must strictly shrink [lo,hi] every iteration (mid±1).','Arrays: instant indexing, expensive middles — pick structures by operation mix.'],
  rev:'Access O(1); insert/delete O(n); linear O(n); binary O(log n) on sorted data. mid = lo+(hi-lo)/2. Loop while lo<=hi.',
  assign:{p:'Write binary_search returning the index or -1, then in main search 401 in {101, 203, 305, 401, 502, 640} and 400 in the same array. Print "401 at 3" and "400 at -1" style lines (key and result).',s:`#include <stdio.h>
// TODO: binary_search + two demo lines
int main(void) { return 0; }`,sol:`#include <stdio.h>
int binary_search(const int a[], int n, int key) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == key) return mid;
        if (key < a[mid]) hi = mid - 1;
        else lo = mid + 1;
    }
    return -1;
}
int main(void) {
    int a[] = {101, 203, 305, 401, 502, 640};
    int n = sizeof(a) / sizeof(a[0]);
    printf("401 at %d\\n", binary_search(a, n, 401));
    printf("400 at %d\\n", binary_search(a, n, 400));
    return 0;
}`}
},
{
  id:'dsa-strings-algorithms', course_id:'dsa', unit_id:'dsa-unit-1', order_index:3,
  title:'String Algorithms: Frequency, Palindromes & Anagrams', desc:'Classic linear-time string techniques with counting arrays and two pointers.',
  obj:['Build character-frequency tables for counting questions','Check palindromes with the two-pointer technique in O(1) extra space','Decide anagrams by frequency signature and argue complexity'],
  pre:['Arrays & searching','C strings'],
  outcomes:['Learner solves standard string interview problems with correct complexity'],
  def:'For a bounded alphabet, a frequency array indexed by character code counts occurrences in one O(n) pass, answering anagram/count-distinct questions. The two-pointer technique places indices at both ends moving inward, giving O(n) time and O(1) extra space palindrome checks.',
  simple:'Most beginner string problems melt under two ideas. First: letters are just 26 (or 256) possible symbols, so "how many of each?" becomes an array of counters you fill in one walk — two words are anagrams exactly when their counter tables match. Second: for palindrome questions, put one finger on each end and walk them toward the middle comparing pairs — no reversed copy needed, no extra memory. These patterns recur endlessly: first non-repeating character, validity checks, deduplication. The trick is always trading a tiny fixed table (or two indices) for what would otherwise be nested-loop quadratic work.',
  hing:'String ke mashhoor sawalon ke peeche do hi technique hain. Pehli: frequency counting — 26 aksharon ke liye ek chhota sa counter array banao, ek baar string ghumo aur ginti badhao. Anagram check isi ka khel hai: dono shabd ki ginti-wali table barabar hui to anagram pakka. Dusri: two pointers — ek ungli shuru par, ek ant par, dono beech ki taraf badho aur jodi milate jao; palindrome bina extra memory ke O(n) me pata chal jayega. Akshar ko index banane ka formula yaad rakho: ch - \'a\' chhote aksharon ko 0..25 me badalta hai. Aur haan, case ka dhyan do — \'A\' aur \'a\' alag dabbo me jayenge, zaroorat ho to pehle tolower kar lo.',
  why:'Frequency signatures and two pointers are core patterns for interviews and real text processing (log tokens, DNA k-mers over a 4-letter alphabet, character-level validation). They typify trading tiny auxiliary space for quadratic-to-linear speedups.',
  when:'Use frequency arrays when the alphabet is small/fixed (ASCII, lowercase, digits); use hash maps for unbounded symbol sets. Use two pointers for symmetric/pairing questions on sequences you can index from both ends.',
  syntax:'int freq[26] = {0};\nfor (const char *p = s; *p; p++) freq[*p - \'a\']++;\n\nint i = 0, j = len - 1;            // two pointers\nwhile (i < j) { if (s[i] != s[j]) return 0; i++; j--; }',
  comp:[['Frequency signature','Count vector completely characterises multiset of characters'],['ch - \'a\'','Maps lowercase letters to indices 0..25 (validate alphabet first)'],['Two pointers','Converging indices compare symmetric positions in O(1) space']],
  ex:[
   {t:'Basic: frequency table and first unique character',code:`#include <stdio.h>
#include <string.h>
int main(void) {
    const char *s = "swiss";
    int freq[256] = {0};
    for (int i = 0; s[i]; i++) freq[(unsigned char)s[i]]++;
    printf("count of s = %d\\n", freq['s']);
    for (int i = 0; s[i]; i++) {
        if (freq[(unsigned char)s[i]] == 1) {
            printf("first unique: %c at %d\\n", s[i], i);
            break;
        }
    }
    return 0;
}`,out:`count of s = 3
first unique: w at 1`,why:'One pass builds the table (s×3, w×1, i×1); a second in-order pass finds the first character whose count is 1 (w). Two linear passes: O(n) time, O(1) bounded table.'},
   {t:'Intermediate: palindrome via two pointers (case/punct tolerant)',code:`#include <ctype.h>
#include <stdio.h>
#include <string.h>
int is_palindrome(const char *s) {
    int i = 0, j = (int)strlen(s) - 1;
    while (i < j) {
        while (i < j && !isalnum((unsigned char)s[i])) i++;
        while (i < j && !isalnum((unsigned char)s[j])) j--;
        if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) return 0;
        i++; j--;
    }
    return 1;
}
int main(void) {
    printf("%d\\n", is_palindrome("A man a plan a canal Panama"));
    printf("%d\\n", is_palindrome("race a car"));
    printf("%d\\n", is_palindrome("Noon"));
    return 0;
}`,out:`1
0
1`,why:'Inner loops skip spaces/punctuation while the outer pairing compares case-folded characters — the whole check never allocates a cleaned copy, using O(1) auxiliary space regardless of input length.'},
   {t:'Advanced: anagram decision by signature',code:`#include <stdio.h>
#include <string.h>
int are_anagrams(const char *a, const char *b) {
    if (strlen(a) != strlen(b)) return 0;
    int diff[26] = {0};
    for (int i = 0; a[i]; i++) {
        diff[a[i] - 'a']++;
        diff[b[i] - 'a']--;
    }
    for (int i = 0; i < 26; i++) if (diff[i] != 0) return 0;
    return 1;
}
int main(void) {
    printf("listen/silent: %d\\n", are_anagrams("listen", "silent"));
    printf("hello/world: %d\\n", are_anagrams("hello", "world"));
    printf("aab/aba: %d\\n", are_anagrams("aab", "aba"));
    return 0;
}`,out:`listen/silent: 1
hello/world: 0
aab/aba: 1`,why:'One shared table incremented by a and decremented by b ends all-zero exactly when the multisets coincide. Lengths are gated first; the alphabet assumption (lowercase) is documented — mixed input would index out of bounds.'}
  ],
  walk:[[4,'For "swiss": s→+1, w→+1, i→+1, s→2, s→3: table ends s=3, w=1, i=1.','freq built in one pass'],[8,'The second pass checks characters IN ORDER: s has count 3 (skip), w has count 1 → answer w at index 1.','order preserved by re-scanning'],[9,'break exits immediately — only first-unique is needed, though worst case remains O(n).','early exit']],
  walkWhy:'The two-phase shape (count globally, then decide locally) recurs across string problems because order-of-appearance information is lost in the table and recovered by walking the string again.',
  rules:['Character tables must be indexed with unsigned char values; plain char may be negative for non-ASCII bytes (undefined indexing).','Anagram/frequency code must state its alphabet contract (lowercase-only here) and validate or normalise inputs.','Two-pointer loops must guarantee progress on every path (skip loops and pair step) or they spin.','These are byte-oriented techniques; Unicode text needs code-point-aware handling in real i18n work.'],
  mistakes:[
   {t:'Indexing freq with unchecked characters',bad:'int diff[26] = {0};\ndiff[ch - \'a\']++;  // ch = \'A\' or \' \' -> negative / out-of-range index',why:'\'A\' - \'a\' is negative and \'z\'-\'a\' is 25 — inputs outside a-z corrupt neighbouring memory. Alphabet assumptions must be enforced or the table widened to 256.',fix:'if (ch >= \'a\' && ch <= \'z\') diff[ch - \'a\']++;\n// or tolower first, or use a 256-entry table',tip:'Write the alphabet contract in a comment AND in code validation; interviewers probe exactly this.'},
   {t:'Reversing a copy to test palindromes (and mutating the original)',bad:'strcpy(buf, s); strrev(buf); return strcmp(s, buf) == 0;',err:'strrev is non-standard (absent on POSIX/gcc default); also allocates and mutates',why:'Beyond non-portability, it spends O(n) extra space and (in sloppy variants) reverses the caller\'s buffer. The two-pointer walk needs none of it and handles skipping/casing rules inline.',fix:'while (i < j) { compare s[i], s[j]; i++; j--; }',tip:'Reach for two pointers whenever a task feels symmetric from both ends.'}
  ],
  cmp:['Approaches to anagram checking',['Method','Time','Extra space'],[['Sort both, compare','O(n log n)','O(n) for sorted copies / mutation'],['Frequency table (26/256)','O(n)','O(1) bounded table'],['Nested search-and-mark','O(n^2)','O(n) flags'],['Product of primes hack','Overflow-prone','Reject: incorrect at scale']]],
  diag:{kind:'flow',start:'String question arrives',condition:'About counts/multisets?',trueAction:'Frequency table in one pass',falseAction:'Symmetric? two pointers converge',end:'Linear time verdict'},
  apps:['Spell-check anagram grouping and word-game validation.','Log/token character-class sanity checks and first-unique-stream problems.','Bioinformatics k-mer counting over the 4-symbol DNA alphabet.'],
  quizzes:[{q:'Two strings are anagrams iff…',options:['Same first/last letter','Their character-frequency tables are identical (incl. equal length)','One is a substring','Sorted order of first occurrences matches'],correct:1,why:'Anagram = same multiset of characters; the frequency signature captures exactly that.'},
            {q:'The two-pointer palindrome check uses how much auxiliary space?',options:['O(n)','O(log n)','O(1)','O(n^2)'],correct:2,why:'Only indices i and j are kept; no copies or stacks are allocated.'}],
  take:['Count with a bounded table, then decide with a second walk — O(n) end to end.','State and enforce your alphabet; unsigned char indexing avoids UB.','Two pointers solve symmetric checks in O(1) extra space.'],
  rev:'freq[ch-\'a\'] counting (validate!). Anagram = equal freq tables. Palindrome: i/j converge comparing pairs, O(n)/O(1).',
  assign:{p:'Write count_vowels_consonants(const char*) for lowercase input printing "vowels=V consonants=C" for "education" (vowels aeiou). Expected: vowels=5 consonants=4.',s:`#include <stdio.h>
// TODO: single pass classification print
int main(void) { return 0; }`,sol:`#include <stdio.h>
int main(void) {
    const char *s = "education";
    int vowels = 0, consonants = 0;
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') vowels++;
        else if (c >= 'a' && c <= 'z') consonants++;
    }
    printf("vowels=%d consonants=%d\\n", vowels, consonants);
    return 0;
}`}
},
{
  id:'dsa-recursion-backtracking', course_id:'dsa', unit_id:'dsa-unit-1', order_index:4,
  title:'Recursion & Backtracking Patterns', desc:'Generate subsets/permutations and solve by choose-explore-unchoose.',
  obj:['Model problems as decision trees (choose/skip branching)','Write backtracking templates with state undo (unchoose)','Estimate the exponential cost of exhaustive generation'],
  pre:['C recursion basics','Arrays as a data structure'],
  outcomes:['Learner enumerates/search spaces systematically without missing/duplicating cases'],
  def:'Backtracking is depth-first search over an implicit decision tree: build a candidate incrementally (choose), recurse to extend it (explore), and revert the last choice (unchoose) to try siblings. Subsets (2^n) and permutations (n!) are canonical outputs whose sizes force exponential time.',
  simple:'Some questions have no shortcut — you must try possibilities in an organised way, like exploring a maze with chalk marks. Backtracking is that discipline: at each junction, pick an option, walk deeper; when you hit a dead end or a full solution, REWIND the last chalk mark and try the next option. For subsets, each element offers two choices (take it / leave it), giving a binary tree with 2^n leaves — every combination appears exactly once. The sacred rhythm is choose → explore → UNCHOOSE; forgetting to undo pollutes the next branch with leftovers from the previous one, the classic backtracking bug.',
  hing:'Backtracking matlab vyavasthit khoj — bhool-bhulaiya me chalk ke nishan lagate hue ghumna. Har mod par ek option CHUNO, aage badho (EXPLORE), aur jab raasta band mile ya jawab mil jaye, to aakhri faislaa PALAT do (UNCHOOSE) aur dusra option try karo. Subsets me har element ke do vikalp hain — lo ya chhodo — isliye kul 2^n jawab. Permutations me n! ho sakte hain, isliye bade n par ye tareeka tez phat jata hai (exponential). Sabse aam galtiyaan: unchoose bhoolna (purani shaakh ki gandagi nayi me reh jaati hai) aur base case galat jagah rakhna. Yaad rakho, ye technique tabahi hai jab jawabon ki sankhya hi vishaal ho — tab DP ya greedy socho.',
  why:'Backtracking systematically solves constraint problems (N-Queens, Sudoku, combinations with rules) where greedy fails and the constraint structure prunes the tree to practical size. It is also the mental model behind many parsers and game-tree searches.',
  when:'Use backtracking when you must enumerate candidates or find any/all constraint satisfactions and n is modest or pruning is strong. If only a count/optimum is needed and subproblems overlap, prefer DP (later topic); if a greedy proof exists, prefer greedy.',
  syntax:'void dfs(int idx) {\n    if (idx == n) { record(current); return; }\n    choose(a[idx]);   dfs(idx + 1);   unchoose();\n    dfs(idx + 1);                    // skip branch (subsets)\n}',
  comp:[['Decision tree','Each level fixes one position\'s choice; leaves are complete candidates'],['Choose/explore/unchoose','Mutate state, recurse, restore state EXACTLY'],['Pruning','Abandon partial candidates that already violate constraints']],
  ex:[
   {t:'Basic: generating all subsets of {1,2,3}',code:`#include <stdio.h>
int items[3] = {1, 2, 3};
int picked[3];
int picked_len = 0;
int total = 0;
void subsets(int idx) {
    if (idx == 3) {
        total++;
        printf("{");
        for (int i = 0; i < picked_len; i++) printf("%d%s", picked[i], i + 1 < picked_len ? "," : "");
        printf("} ");
        return;
    }
    picked[picked_len++] = items[idx];   // choose
    subsets(idx + 1);                      // explore
    picked_len--;                          // unchoose
    subsets(idx + 1);                      // skip branch
}
int main(void) {
    subsets(0);
    printf("\\ntotal = %d\\n", total);
    return 0;
}`,out:`{1,2,3} {1,2} {1,3} {1} {2,3} {2} {3} {} 
total = 8`,why:'The recursion walks a binary tree (take/skip per element) hitting all 2^3 leaves exactly once. Order shown is DFS pre-order of leaves — any specific order is fine, completeness is the contract.'},
   {t:'Intermediate: counting paths in a tiny grid (right/down)',code:`#include <stdio.h>
int paths(int r, int c, int rows, int cols) {
    if (r == rows - 1 && c == cols - 1) return 1;
    int total = 0;
    if (r + 1 < rows) total += paths(r + 1, c, rows, cols);
    if (c + 1 < cols) total += paths(r, c + 1, rows, cols);
    return total;
}
int main(void) {
    printf("2x2 grid: %d\\n", paths(0, 0, 2, 2));
    printf("3x3 grid: %d\\n", paths(0, 0, 3, 3));
    printf("1x5 grid: %d\\n", paths(0, 0, 1, 5));
    return 0;
}`,out:`2x2 grid: 2
3x3 grid: 6
1x5 grid: 1`,why:'Branching right/down enumerates monotonic routes; the counts match the binomial coefficient C(4,2)=6 for 3x3. This exponential recounting is precisely what DP memoisation later collapses — remember this example then.'},
   {t:'Advanced: permutations with a used[] guard',code:`#include <stdio.h>
char letters[3] = {'A', 'B', 'C'};
char current[4] = {0};
int used[3] = {0};
void permute(int pos) {
    if (pos == 3) { printf("%s ", current); return; }
    for (int i = 0; i < 3; i++) {
        if (used[i]) continue;
        used[i] = 1;
        current[pos] = letters[i];
        permute(pos + 1);
        used[i] = 0;   // unchoose: free this letter for sibling branches
    }
}
int main(void) {
    permute(0);
    printf("\\n");
    return 0;
}`,out:`ABC ACB BAC BCA CAB CBA`,why:'used[] prunes repeats within a branch and is reset after recursion so siblings start clean. 3! = 6 leaves appear in lexicographic order because candidates iterate A→C at every level.'}
  ],
  walk:[[8,'idx=0: we CHOOSE 1 (picked=[1]) and recurse — every subset containing 1 is generated in this subtree.','left subtree: contains 1'],[21,'After the whole take-1 subtree returns, picked_len-- UNCHOOSES 1 (picked=[]), restoring the exact entry state.','state restored'],[22,'The skip branch recurses with 1 excluded, producing all subsets without it.','right subtree generated'],[10,'At idx=3 the accumulated picked[] is one complete leaf subset, printed and counted.','8 leaves = 2^3']],
  walkWhy:'State restoration is the invariant: dfs(idx) must leave shared state exactly as it found it, otherwise sibling branches inherit phantom choices.',
  rules:['Always pair choose/unchoose around recursion when sharing mutable state.','Base case records/returns; without it the tree walk never stops (stack overflow).','Output size bounds runtime: 2^n subsets and n! permutations are infeasible beyond small n regardless of code quality.','Prune as early as constraints allow — deciding invalidity at depth d saves the whole subtree.'],
  mistakes:[
   {t:'Forgetting the unchoose step',bad:'picked[len++] = items[idx];\ndfs(idx + 1);\n/* missing len-- */\ndfs(idx + 1);  // skip branch still carries the item!',why:'The second (skip) recursion now wrongly includes the element, producing duplicates and missing true subsets. Outputs look "almost right", which delays detection.',fix:'picked[len++] = items[idx];\ndfs(idx + 1);\nlen--;             // restore\n\ndfs(idx + 1);',tip:'Write the undo line immediately after the recursive call as one ritual group; audit shared mutations pairwise.'},
   {t:'Expecting brute force to scale because small n worked',bad:'// subsets(n=40): 2^40 is about 1.1 trillion leaves',why:'Doubling-time intuition fails: each added element doubles the work (n=30 ≈ a billion). No micro-optimisation outruns output size when enumeration itself is demanded.',fix:'// count -> DP/greedy maths; enumerate -> constrain n or prune hard',tip:'Before coding, write the leaf count (2^n / n!) and the n it renders hopeless.'}
  ],
  cmp:['Backtracking vs greedy vs DP',['Strategy','Explores','Best when'],[['Backtracking','Whole decision tree (pruned)','Must enumerate / constraint satisfaction'],['Greedy','One locally-best path','Optimality provable by exchange argument'],['DP','Overlapping subproblem DAG','Counting/optimising with shared subproblems'],['Brute force','Everything, no pruning','Tiny n / correctness oracle']]],
  diag:{kind:'flow',start:'Partial candidate',condition:'Complete or hopeless?',trueAction:'Record or prune; unchoose; backtrack',falseAction:'Choose next option and recurse',end:'All leaves visited exactly once'},
  apps:['Sudoku/N-Queens solvers and scheduling with constraints.','Generating test combinations and feature-flag matrices.','Word/letter games enumerating legal arrangements.'],
  quizzes:[{q:'How many subsets does a 10-element set have (including empty)?',options:['100','1024','512','3628800'],correct:1,why:'Each element independently chooses in/out: 2^10 = 1024.'},
            {q:'In the permutation template, why reset used[i] = 0 after the recursive call?',options:['To free memory','So sibling branches can use that element at this position — state restored','To sort output','To prevent stack overflow'],correct:1,why:'Unchoosing restores the entry-state invariant; without it, letters vanish from later branches.'}],
  take:['choose → explore → unchoose is the whole discipline; state must be restored exactly.','Count leaves before trusting feasibility (2^n, n!).','Prune invalid partials as high in the tree as possible.'],
  rev:'DFS over decisions; base case records; unchoose restores state. Subsets 2^n, perms n!. Prune early; overlapping counts belong to DP.',
  assign:{p:'Modify the subsets generator to COUNT only subsets whose sum is even, for items {1, 2, 3, 4}, printing even_sum_subsets=8. (Hint: track current sum alongside picked length; an empty subset sums to 0 and is even.)',s:`#include <stdio.h>
// TODO: DFS counting even-sum subsets of {1,2,3,4}
int main(void) { return 0; }`,sol:`#include <stdio.h>
int items[4] = {1, 2, 3, 4};
long count = 0;
void dfs(int idx, int sum) {
    if (idx == 4) {
        if (sum % 2 == 0) count++;
        return;
    }
    dfs(idx + 1, sum + items[idx]);
    dfs(idx + 1, sum);
}
int main(void) {
    dfs(0, 0);
    printf("even_sum_subsets=%ld\\n", count);
    return 0;
}`}
},
{
  id:'dsa-linked-lists', course_id:'dsa', unit_id:'dsa-unit-2', order_index:1,
  title:'Singly Linked Lists: Build, Traverse, Insert, Delete & Reverse', desc:'Chain heap nodes with pointers; trade random access for cheap structural edits.',
  obj:['Create nodes, build lists at head/tail, and traverse safely','Insert/delete at head, middle and tail by rewiring pointers','Reverse a list iteratively with three pointers; mind memory ownership'],
  pre:['Pointers & structures (C)','Dynamic memory allocation'],
  outcomes:['Learner manipulates pointer chains without leaks or lost tails'],
  def:'A singly linked list is a sequence of heap-allocated nodes, each holding data and a next pointer to its successor (NULL ends the list). Only the head pointer is kept; reaching position i costs O(i) pointer hops, while insert/delete at a known node is O(1) pointer rewiring.',
  simple:'A linked list is a treasure hunt: each clue card (node) holds a prize (data) and directions to the next card (pointer). You only know where the FIRST card is (the head), so reaching the fifth means following four sets of directions — no teleporting like array indexing. The compensation: inserting a new card between two others means rewriting ONE set of directions, not shifting a crowd. Reversing the hunt flips every arrow to point backwards, a famous three-pointer dance (prev, curr, next) you will meet in interviews forever. The dangers are losing the head (the whole hunt is gone) and forgetting to free removed cards.',
  hing:'Linked list ek khazana-khoj jaisa hai: har node ek purza hai jisme data aur agle node ka address (next pointer) hota hai. Sirf head (pehla node) pata hota hai, isliye 5th element tak pahuchne ke liye kadam-dar-kadam chalna padega — array ki tarah seedha index nahi! Iska fayda: beech me naya node jodna matlab sirf 1-2 pointer badalna, poora crowd shift nahi karna. Khare hain buffer: head kho diya to poori list gayab; delete karte samay node ko free() karna na bhoolna warna memory leak. Reverse karne ke liye teen pointer chalte hain: prev, curr, next — ye interview ka sabse mashhoor sawal hai. Aur hamesha dhyan rakho: naye node ko jodne se PEHLE uska next set karo, warna aage ki list aksar kho jaati hai!',
  why:'Linked lists teach pointer fluency and dynamic-structure thinking; they underlie textbook stacks/queues, adjacency lists, hash chaining, and OS free-lists. The access-vs-edit trade against arrays is the canonical structure-selection lesson.',
  when:'Choose lists when size is unknown/variable and edits happen at known positions (esp. ends with a tail pointer) and random access is rare. In production, cache-unfriendliness means arrays/vectors often win anyway — know lists conceptually even more than practically.',
  syntax:'typedef struct Node { int data; struct Node *next; } Node;\nNode *head = NULL;\nNode *n = malloc(sizeof *n);   // check for NULL!\nn->data = value; n->next = head; head = n;   // push front O(1)\nfor (Node *cur = head; cur; cur = cur->next) { use(cur->data); }',
  comp:[['Head pointer','Sole entry to the chain; NULL means empty list'],['next = NULL','Terminator of the last node; traversal stops there'],['Rewiring order','Link the new node to its successor BEFORE redirecting the predecessor']],
  ex:[
   {t:'Basic: building at the head and traversing',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct Node { int data; struct Node *next; } Node;
Node *push_front(Node *head, int value) {
    Node *n = malloc(sizeof *n);
    if (!n) return head;
    n->data = value;
    n->next = head;
    return n;
}
void print_list(const Node *head) {
    for (const Node *cur = head; cur; cur = cur->next) {
        printf("%d -> ", cur->data);
    }
    printf("NULL\\n");
}
int main(void) {
    Node *head = NULL;
    head = push_front(head, 30);
    head = push_front(head, 20);
    head = push_front(head, 10);
    print_list(head);
    int len = 0;
    for (Node *c = head; c; c = c->next) len++;
    printf("length=%d\\n", len);
    return 0;
}`,out:`10 -> 20 -> 30 -> NULL
length=3`,why:'Each push links the new node to the old head, so the last pushed value sits first. Length requires a full hop-counting walk — there is no O(1) size unless maintained separately.'},
   {t:'Intermediate: append, search and middle deletion',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct Node { int data; struct Node *next; } Node;
static Node *make_node(int v) {
    Node *n = malloc(sizeof *n);
    if (n) { n->data = v; n->next = NULL; }
    return n;
}
static Node *append(Node *head, int v) {
    Node *n = make_node(v);
    if (!head) return n;
    Node *cur = head;
    while (cur->next) cur = cur->next;
    cur->next = n;
    return head;
}
static Node *delete_value(Node *head, int v) {
    if (head && head->data == v) {
        Node *dead = head;
        head = head->next;
        free(dead);
        return head;
    }
    for (Node *cur = head; cur && cur->next; cur = cur->next) {
        if (cur->next->data == v) {
            Node *dead = cur->next;
            cur->next = dead->next;
            free(dead);
            break;
        }
    }
    return head;
}
static void print_list(const Node *h) {
    for (const Node *c = h; c; c = c->next) printf("%d ", c->data);
    printf("\\n");
}
int main(void) {
    Node *head = NULL;
    head = append(head, 5);
    head = append(head, 15);
    head = append(head, 25);
    head = append(head, 35);
    print_list(head);
    head = delete_value(head, 15);
    head = delete_value(head, 5);
    print_list(head);
    return 0;
}`,out:`5 15 25 35 
25 35`,why:'append walks to the tail (O(n) without a stored tail pointer). Deletion unlinks by bridging predecessor→successor, then frees the orphan; head deletion is the special first branch because no predecessor exists.'},
   {t:'Advanced: in-place reversal (three pointers)',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct Node { int data; struct Node *next; } Node;
static Node *make_node(int v, Node *next) {
    Node *n = malloc(sizeof *n);
    if (n) { n->data = v; n->next = next; }
    return n;
}
static Node *reverse(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur) {
        Node *next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}
int main(void) {
    Node *head = make_node(1, make_node(2, make_node(3, make_node(4, NULL))));
    head = reverse(head);
    for (Node *c = head; c; c = c->next) printf("%d ", c->data);
    printf("\\n");
    head = reverse(head);
    for (Node *c = head; c; c = c->next) printf("%d ", c->data);
    printf("\\n");
    return 0;
}`,out:`4 3 2 1 
1 2 3 4`,why:'Each iteration saves next BEFORE overwriting the arrow — the entire trick. prev becomes the new head. Reversing twice restores order, confirming no nodes were lost or duplicated.'}
  ],
  walk:[[11,'push_front(30) on empty list: n->next = NULL (old head), head becomes the 30 node.','[30]'],[12,'pushing 20: new node\'s next points at the 30 node; head updates to 20.','[20,30]'],[13,'pushing 10 chains in front again: traversal yields 10, 20, 30 then NULL stops the loop.','[10,20,30]'],[17,'Length is computed by hopping all three links — no metadata shortcut exists.','3 hops']],
  walkWhy:'Every operation is pointer bookkeeping around a single entry point; correctness is "never lose the only path to the remaining nodes" during rewiring.',
  rules:['Always check malloc for NULL before writing fields.','Rewire in safe order: new node\'s next first, then predecessor/head — losing a successor pointer orphans the tail.','free every removed node exactly once; never touch a node after freeing (use-after-free).','Maintain a tail pointer if appends are frequent; remember to update it on tail deletions.'],
  mistakes:[
   {t:'Losing the tail during insertion',bad:'// inserting after cur:\ncur->next = new_node;\nnew_node->next = cur->next;   // cur->next is now new_node itself: cycle!',why:'The first line destroys the only reference to the original successor; the second line then reads the just-written value, linking the node to itself and orphaning the rest.',fix:'new_node->next = cur->next;  // link new node onward FIRST\ncur->next = new_node;',tip:'Draw the three boxes and number the arrow changes on paper once — the safe order becomes muscle memory.'},
   {t:'Dereferencing NULL on empty-edge paths',bad:'Node *cur = head;\nwhile (cur->next) cur = cur->next;  // crashes when head == NULL',err:'Segmentation fault',why:'Append/delete helpers commonly assume at least one node. Empty-list calls are the first thing real usage (and graders) try.',fix:'if (!head) return new_node;         // guard edges first\nfor (Node *cur = head; cur->next; cur = cur->next) { }',tip:'Brainstorm the degenerate shapes for every list function: empty, single node, target at head, target at tail, target absent.'}
  ],
  cmp:['Array vs singly linked list',['Operation','Array','Linked list'],[['Access by position','O(1)','O(n) hops'],['Insert at front','O(n) shifts','O(1)'],['Insert after known node','O(n) shifts','O(1)'],['Memory pattern','Contiguous, cache-friendly','Scattered nodes + pointer overhead'],['Size','Fixed/grow-by-copy','Naturally dynamic']]],
  diag:{kind:'pointer',varName:'node.data',val:'20',varAddr:'node N',ptrName:'next',ptrAddr:'node N+1'},
  apps:['Implementing stacks/queues with O(1) end operations (next topics).','Adjacency lists for sparse graphs (later topic).','Undo histories and LRU lists where splicing known nodes dominates.'],
  quizzes:[{q:'In a singly linked list, deleting the LAST node (no tail bookkeeping help) costs…',options:['O(1)','O(n) — must find the second-last node to NULL its next','O(log n)','Impossible'],correct:1,why:'No backward links exist; only the predecessor can terminate the list, and finding it requires a walk.'},
            {q:'Why must reverse() save next before cur->next = prev?',options:['Style','Overwriting next first destroys the only path to the unprocessed remainder','Compiler requirement','prev would leak'],correct:1,why:'The remainder of the list is reachable solely through cur->next; once overwritten, those nodes are lost.'}],
  take:['Head-only entry: traversals cost O(n); rewiring at known nodes costs O(1).','Safe order: link onward first, then redirect; guard empty/head/tail edges.','Reverse = prev/cur/next rotation; free what you unlink, exactly once.'],
  rev:'Node{data,next}; NULL ends. push-front O(1), append O(n) w/o tail ptr. Delete: bridge + free. Reverse with 3 pointers. Check malloc.',
  assign:{p:'Build a list by appending 2, 4, 6, 8; write sum_list and find_middle using slow/fast pointers (fast moves 2, slow moves 1) returning slow at end for even length take the second middle; print "sum=20 middle=6".',s:`#include <stdio.h>
#include <stdlib.h>
typedef struct Node { int data; struct Node *next; } Node;
// TODO: build 2,4,6,8; sum; slow/fast middle; free all
int main(void) { return 0; }`,sol:`#include <stdio.h>
#include <stdlib.h>
typedef struct Node { int data; struct Node *next; } Node;
static Node *append(Node *head, int v) {
    Node *n = malloc(sizeof *n);
    if (!n) return head;
    n->data = v; n->next = NULL;
    if (!head) return n;
    Node *c = head;
    while (c->next) c = c->next;
    c->next = n;
    return head;
}
int main(void) {
    Node *head = NULL;
    head = append(head, 2);
    head = append(head, 4);
    head = append(head, 6);
    head = append(head, 8);
    int sum = 0;
    for (Node *c = head; c; c = c->next) sum += c->data;
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    printf("sum=%d middle=%d\\n", sum, slow->data);
    while (head) { Node *n = head->next; free(head); head = n; }
    return 0;
}`}
},
{
  id:'dsa-stacks', walkEx:2, course_id:'dsa', unit_id:'dsa-unit-2', order_index:2,
  title:'Stacks: LIFO Discipline & Applications', desc:'Implement array stacks and solve bracket-matching and postfix evaluation.',
  obj:['Implement push/pop/peek with overflow/underflow handling','Use a stack to validate balanced brackets','Evaluate Reverse Polish (postfix) expressions with a stack'],
  pre:['Arrays'],
  outcomes:['Learner wields the stack ADT and recognises LIFO-shaped problems'],
  def:'A stack is an abstract data type permitting insertion (push) and removal (pop) at one end only — the top — giving Last-In-First-Out order. peek reads the top without removing it. Array implementations track a top index; all operations are O(1).',
  simple:'A stack is a pile of plates in a cafeteria: you can only add a plate on top and only take the topmost plate off — the last one placed is the first one used (LIFO). peek is glancing at the top plate without lifting it. This humble discipline is everywhere: your browser\'s Back button, Undo in editors, and the function call-stack itself. Two failure modes to respect: pushing onto a full fixed stack (overflow) and popping an empty one (underflow). The classic debut application: checking brackets — push opening brackets, and every closing bracket must match the top of the pile.',
  hing:'Stack matlab thaliyon ka dher — upar se rakho (push), upar se uthao (pop). Jo aakhir me gaya, wahi pehle niklega (LIFO). peek ka matlab bina hataye upar wala dekhna. Browser ka Back button, editor ka Undo, program ka function call-stack — sab yahi hai. Fixed-size wale stack me do khatare: bhar jaane par push (overflow) aur khaali par pop (underflow) — dono ko check karna jaroori hai, warna garbage value milegi. Sabse pyara use: brackets ki jumla-bandagi check karna — khulne wala bracket push karo, band wala aaye to top se milna chahiye; aakhir me stack khaali ho to jodi sahi. Postfix expression (2 3 +) bhi stack se turant nikalta hai.',
  why:'Stacks encode "most recent first" dependencies: undo, navigation, parsing, expression evaluation, recursion simulation, backtracking. Recognising LIFO shape converts messy flag-juggling code into a three-operation clean solution.',
  when:'Reach for a stack when processing must unwind in reverse order of discovery (nested constructs, reversals, tree DFS). Prefer dynamic (linked/vector) stacks over fixed caps outside embedded contexts.',
  syntax:'push(x): a[++top] = x;          // after overflow check\npop():   return a[top--];       // after underflow check\npeek():  return a[top];\nisEmpty: top == -1   |   isFull: top == CAP - 1',
  comp:[['LIFO','Last In, First Out ordering contract'],['Top pointer/index','Tracks the current summit; -1 signals empty in array form'],['Overflow/Underflow','Push-on-full / pop-on-empty — both must be handled explicitly']],
  ex:[
   {t:'Basic: array stack mechanics with guards',code:`#include <stdio.h>
#define CAP 4
typedef struct { int items[CAP]; int top; } Stack;
static void init(Stack *s) { s->top = -1; }
static int push(Stack *s, int v) {
    if (s->top == CAP - 1) return 0;
    s->items[++s->top] = v;
    return 1;
}
static int pop(Stack *s, int *out) {
    if (s->top == -1) return 0;
    *out = s->items[s->top--];
    return 1;
}
int main(void) {
    Stack s; init(&s);
    push(&s, 10); push(&s, 20); push(&s, 30);
    printf("top=%d size=%d\\n", s.items[s.top], s.top + 1);
    int v = 0;
    while (pop(&s, &v)) printf("popped %d\\n", v);
    printf("pop empty ok=%d\\n", pop(&s, &v));
    return 0;
}`,out:`top=30 size=3
popped 30
popped 20
popped 10
pop empty ok=0`,why:'top starts at -1 ("none") and size is top+1. Pops drain in exact reverse insertion order; the last call demonstrates the underflow guard returning failure instead of garbage.'},
   {t:'Intermediate: balanced brackets',code:`#include <stdio.h>
#include <string.h>
static int is_balanced(const char *expr) {
    char st[64]; int top = -1;
    for (int i = 0; expr[i]; i++) {
        char c = expr[i];
        if (c == '(' || c == '[' || c == '{') {
            if (top == 63) return -1;
            st[++top] = c;
        } else if (c == ')' || c == ']' || c == '}') {
            if (top == -1) return 0;
            char open = st[top--];
            if ((c == ')' && open != '(') ||
                (c == ']' && open != '[') ||
                (c == '}' && open != '{')) return 0;
        }
    }
    return top == -1;
}
int main(void) {
    printf("%d\\n", is_balanced("{[(a+b) * (c-d)]}"));
    printf("%d\\n", is_balanced("([)]"));
    printf("%d\\n", is_balanced("((("));
    return 0;
}`,out:`1
0
0`,why:'Only the innermost open bracket can legally close next — precisely stack-top discipline. "([)]" fails because ) meets [ on top; "(((" ends with residue on the stack (top != -1).'},
   {t:'Advanced: postfix (RPN) evaluation',code:`#include <ctype.h>
#include <stdio.h>
static int eval_rpn(const char *expr) {
    int st[32]; int top = -1;
    for (int i = 0; expr[i]; i++) {
        char c = expr[i];
        if (isdigit((unsigned char)c)) {
            st[++top] = c - '0';
        } else if (c == '+' || c == '-' || c == '*' || c == '/') {
            int b = st[top--];
            int a = st[top--];
            int r = (c == '+') ? a + b : (c == '-') ? a - b : (c == '*') ? a * b : a / b;
            st[++top] = r;
        }
    }
    return st[top];
}
int main(void) {
    printf("%d\\n", eval_rpn("23+"));       /* 2 + 3 */
    printf("%d\\n", eval_rpn("53-2*"));     /* (5 - 3) * 2 */
    printf("%d\\n", eval_rpn("82/3+1*"));   /* (8/2 + 3) * 1 with int division */
    return 0;
}`,out:`5
4
7`,why:'Operands wait on the stack; each operator consumes the top two (right operand popped first — critical for - and /) and pushes the result. A valid expression ends with exactly one value on the stack.'}
  ],
  walk:[[9,'In "{[(a+b) * (c-d)]}": { [ ( are pushed in order; letters/operators are ignored.','stack: { [ ('],[12,'The first closer ) pops and must meet (: matches. Next ) (after d) requires another ( — it was pushed before c — matches.','pairs resolve innermost-first'],[13,'Then ] meets [ , and } meets { — each closer finds its exact partner on top.','stack empties'],[18,'Final top == -1 confirms nothing was left unclosed, so the expression is balanced (1).','verdict true']],
  walkWhy:'Correct nesting is literally the LIFO property: the most recently opened construct must be the first to close, which is why no counter per bracket type can substitute for a real stack (try "([)]" with counters).',
  rules:['Guard every pop/peek with an emptiness test; never let top go below -1 or above capacity-1.','Operand order matters on pop for non-commutative operators: first pop is the RIGHT operand.','Balanced means stack empty at end AND no mismatch en route — both conditions needed.','Capacity is a contract: document overflow behaviour (reject, grow, or error) of your stack API.'],
  mistakes:[
   {t:'Popping without the empty check',bad:'int pop(Stack *s) { return s->items[s->top--]; }  // on empty: items[-1]',why:'top becomes -2 and memory before the array is read — undefined behaviour presenting as mysterious values or crashes far from the bug.',fix:'// return-status style, or assert/handle explicitly\nif (s->top < 0) return 0;',tip:'Pair each push/pop implementation with its guard in the same breath; make underflow impossible by API shape (status + out-param).'},
   {t:'Counting bracket types instead of stacking them',bad:'// counts of ( and ) equal, [ and ] equal -> declare balanced\n// "([)]" counters agree 1/1, yet order is illegal',why:'Nesting is order-sensitive; aggregate counts cannot distinguish "()" from ")(". Any counter scheme accepts interleavings that a compiler rejects.',fix:'// push openers; on closer, require exact partner on top',tip:'If a problem mentions matching/nesting, it is a stack problem until proven otherwise.'}
  ],
  cmp:['Stack vs plain array usage',['Aspect','Stack ADT','Unrestricted array'],[['Access points','Top only','Every index'],['Order guarantee','LIFO','None imposed'],['Typical uses','Undo, parsing, DFS','Random-access tables'],['Underflow concept','Yes — guarded','Programmer-managed']]],
  diag:{kind:'flow',start:'push / pop request',condition:'Guard passes (not full/empty)?',trueAction:'Adjust top, move value',falseAction:'Report overflow/underflow, unchanged',end:'Only the top is visible'},
  apps:['Compiler/IDE bracket matching and syntax validation.','Undo/redo systems (two stacks) and browser history.','Postfix calculators and shunting-yard expression conversion.'],
  quizzes:[{q:'Push 1, 2, 3 then pop twice, push 9: what is on top now?',options:['2','9','3','1'],correct:1,why:'Pops removed 3 then 2; pushing 9 makes it the new top (stack = [1, 9]).'},
            {q:'In RPN "82-", after pushing 8 then 2, the minus must compute…',options:['2 - 8','8 - 2: first pop is right operand 2, second is left operand 8','Order irrelevant','Stack underflow'],correct:1,why:'Non-commutative operators need operand order preserved: pop b (=2), pop a (=8), push a - b = 6.'}],
  take:['Stacks expose only the top; LIFO is the entire contract.','Guard overflow/underflow in the API, not by caller hope.','Nesting/matching/recency problems are stack-shaped — recognise them instantly.'],
  rev:'push/pop/peek O(1). top=-1 empty. Bracket check = push openers, match closers at top, end empty. RPN: operands wait, operators fold top two.',
  assign:{p:'Use a char stack to check whether a string is a palindrome by pushing all chars then popping to build the reverse in a buffer, for "level" and "lever", printing "level: yes" and "lever: no".',s:`#include <stdio.h>
#include <string.h>
// TODO: stack-based reversal comparison
int main(void) { return 0; }`,sol:`#include <stdio.h>
#include <string.h>
static int stack_palindrome(const char *s) {
    char st[64];
    int top = -1;
    int n = (int)strlen(s);
    for (int i = 0; i < n; i++) st[++top] = s[i];
    for (int i = 0; i < n; i++) {
        if (st[top--] != s[i]) return 0;
    }
    return 1;
}
int main(void) {
    printf("level: %s\\n", stack_palindrome("level") ? "yes" : "no");
    printf("lever: %s\\n", stack_palindrome("lever") ? "yes" : "no");
    return 0;
}`}
},
{
  id:'dsa-queues', walkEx:2, course_id:'dsa', unit_id:'dsa-unit-2', order_index:3,
  title:'Queues: FIFO Discipline & the Circular Buffer', desc:'Implement ring-buffer queues and recognise fair-order processing problems.',
  obj:['Implement enqueue/dequeue on a circular array with modular indices','Handle full/empty states unambiguously','Contrast queues with stacks and deques for problem fit'],
  pre:['Stacks','Arrays'],
  outcomes:['Learner builds a correct ring buffer and explains wrap-around math'],
  def:'A queue is an ADT inserting at the rear and removing from the front (First-In-First-Out). A circular (ring) buffer implements it on a fixed array with front/rear indices advancing modulo capacity, distinguishing full from empty via a size counter or a wasted slot.',
  simple:'A queue is the fair line at a ticket counter: join at the back, get served from the front — first come, first served (FIFO). A naive array queue wastes the vacated front space and pretends to be full while half the array is empty; the circular buffer fixes this by treating the array as a ring where indices wrap around with modulo arithmetic (after slot 4 of 5 comes slot 0 again). The one subtlety: if front catches up to rear, is the queue EMPTY or FULL? Ambiguity is resolved by tracking an explicit size count. Printers, message systems, and CPU schedulers all run on this exact machinery.',
  hing:'Queue bilkul ticket counter ki line hai — peeche se judte ho, aage se number aata hai (FIFO, pehle aaya pehle paya). Sadharan array me dikkat hai: aage se log nikalte hain to jagah khaali padti hai par peeche wala index end tak pahuchkar "full" bol deta hai. Circular buffer iska ilaaj hai: array ko ghumavdar (ring) mano, aakhri slot ke baad wapas 0 par aao — modulo (%) se index ghumta rehta hai. Ek hi pech hai: front aur rear barabar ho jayein to queue khaali hai ya bhari? Isiliye size ki ginti alag se rakho, ambiguity Khatm. Printer ki line, WhatsApp ke pending messages, CPU scheduling — sab circular queue par bante hain.',
  why:'FIFO fairness drives scheduling, buffering and breadth-first traversal. The circular buffer is one of computing\'s most-deployed structures (audio/video rings, network buffers, log buffers) because it is cache-friendly and allocation-free.',
  when:'Use queues wherever arrival order must be honoured (tasks, events, BFS). Use ring buffers for bounded producer-consumer streams; deques when both ends need service; priority queues (heaps) when order is by urgency, not arrival.',
  syntax:'enqueue(x): buf[rear] = x; rear = (rear + 1) % CAP; size++;\ndequeue():  x = buf[front]; front = (front + 1) % CAP; size--;\nempty: size == 0   full: size == CAP',
  comp:[['FIFO','First In, First Out service order'],['Modular index','(i + 1) % CAP wraps the ring indefinitely'],['size field','Disambiguates the full-vs-empty coincidence of front == rear']],
  ex:[
   {t:'Basic: FIFO behaviour on a ring buffer',code:`#include <stdio.h>
#define CAP 5
typedef struct { int buf[CAP]; int front, rear, size; } Queue;
static void init(Queue *q) { q->front = 0; q->rear = 0; q->size = 0; }
static int enqueue(Queue *q, int v) {
    if (q->size == CAP) return 0;
    q->buf[q->rear] = v;
    q->rear = (q->rear + 1) % CAP;
    q->size++;
    return 1;
}
static int dequeue(Queue *q, int *out) {
    if (q->size == 0) return 0;
    *out = q->buf[q->front];
    q->front = (q->front + 1) % CAP;
    q->size--;
    return 1;
}
int main(void) {
    Queue q; init(&q);
    enqueue(&q, 10); enqueue(&q, 20); enqueue(&q, 30);
    int v = 0;
    dequeue(&q, &v); printf("served %d\\n", v);
    dequeue(&q, &v); printf("served %d\\n", v);
    printf("front now %d, size %d\\n", q.buf[q.front], q.size);
    return 0;
}`,out:`served 10
served 20
front now 30, size 1`,why:'Service order exactly mirrors arrival (10 before 20). Indices merely rotate — no element shifting — and size tracks occupancy independently of positions.'},
   {t:'Intermediate: wrap-around and full/empty discipline',code:`#include <stdio.h>
#define CAP 3
typedef struct { int buf[CAP]; int front, rear, size; } Queue;
static void init(Queue *q) { q->front = 0; q->rear = 0; q->size = 0; }
static int enqueue(Queue *q, int v) {
    if (q->size == CAP) return 0;
    q->buf[q->rear] = v; q->rear = (q->rear + 1) % CAP; q->size++;
    return 1;
}
static int dequeue(Queue *q, int *out) {
    if (q->size == 0) return 0;
    *out = q->buf[q->front]; q->front = (q->front + 1) % CAP; q->size--;
    return 1;
}
int main(void) {
    Queue q; init(&q);
    enqueue(&q, 1); enqueue(&q, 2); enqueue(&q, 3);
    printf("enqueue into full: %d\\n", enqueue(&q, 4));
    int v;
    dequeue(&q, &v); dequeue(&q, &v);
    printf("after 2 dequeues front index=%d rear index=%d\\n", q.front, q.rear);
    enqueue(&q, 4); enqueue(&q, 5);
    printf("wrapped rear index=%d size=%d\\n", q.rear, q.size);
    while (dequeue(&q, &v)) printf("%d ", v);
    printf("\\nempty dequeue ok=%d\\n", dequeue(&q, &v));
    return 0;
}`,out:`enqueue into full: 0
after 2 dequeues front index=2 rear index=0
wrapped rear index=2 size=3
3 4 5 
empty dequeue ok=0`,why:'After two dequeues, rear had already wrapped to 0; enqueuing 4 and 5 refilled slots 0 and 1 behind the front=2, yielding logical order 3,4,5 from physical wrap — the ring in action, with size keeping full (3) distinguishable from empty (0).'},
   {t:'Advanced: round-robin task simulation with a queue',code:`#include <stdio.h>
#define CAP 8
typedef struct { char name; int burst; } Task;
typedef struct { Task buf[CAP]; int front, rear, size; } Queue;
static void init(Queue *q) { q->front = q->rear = q->size = 0; }
static void enqueue(Queue *q, Task t) {
    q->buf[q->rear] = t; q->rear = (q->rear + 1) % CAP; q->size++;
}
static Task dequeue(Queue *q) {
    Task t = q->buf[q->front]; q->front = (q->front + 1) % CAP; q->size--;
    return t;
}
int main(void) {
    Queue q; init(&q);
    enqueue(&q, (Task){'A', 3});
    enqueue(&q, (Task){'B', 1});
    enqueue(&q, (Task){'C', 2});
    const int QUANTUM = 2;
    while (q.size > 0) {
        Task t = dequeue(&q);
        int run = t.burst < QUANTUM ? t.burst : QUANTUM;
        t.burst -= run;
        printf("%c(%d) ", t.name, run);
        if (t.burst > 0) enqueue(&q, t);
    }
    printf("\\n");
    return 0;
}`,out:`A(2) B(1) C(2) A(1)`,why:'Each task gets up to QUANTUM ticks per turn, then re-queues at the rear if unfinished — precisely how preemptive OS schedulers share a CPU fairly. The queue preserves turn order without any sorting or timestamps.'}
  ],
  walk:[[17,'With CAP=3: three enqueues advance rear 0→1→2→(wrap)0 while size reaches 3 (full).','ring full, rear wrapped'],[21,'Two dequeues move front to 2; elements live at physical indices 2 only (value 3).','front=2 rear=0 size=1'],[23,'Enqueue 4 writes index 0, enqueue 5 writes index 1; rear lands on 2 and size returns to 3 (full again).','wrapped fill'],[24,'Draining reads front sequence 2,0,1 producing logical 3,4,5 — wrap is invisible to consumers.','FIFO preserved']],
  walkWhy:'size is the single source of truth for state; indices merely rotate. Any design inferring fullness from index equality alone must sacrifice a slot (the other classical convention).',
  rules:['Keep size authoritative (or deliberately waste one slot) to distinguish full from empty.','Modulo-advance BOTH indices symmetrically; one missed % is an off-ring memory bug.','Bounded queues force a full-policy decision: reject, overwrite-oldest, or block — document it.','A plain (non-ring) array queue drifts and falsely fills; circular layout is the correct fixed-array answer.'],
  mistakes:[
   {t:'Inferring empty from front == rear without size/slot convention',bad:'int is_empty(Queue *q) { return q->front == q->rear; }\n// a completely FULL ring also has front == rear!',why:'After CAP enqueues rear wraps back onto front; the predicate now reports empty while the buffer is stuffed — dequeue logic desynchronises catastrophically.',fix:'// keep an explicit size counter (this lesson), or\n// waste one slot: full means (rear+1)%CAP == front',tip:'Pick one disambiguation scheme at design time and comment it; reviewers should be able to state your full condition in one line.'},
   {t:'Linear array queue that "fills" while half-empty',bad:'// front only advances, rear hits CAP after CAP total enqueues ever',why:'Vacated slots before front are never recycled, so throughput lifetime is CAP operations. It demos fine and dies in any sustained simulation.',fix:'// circular indices: rear = (rear + 1) % CAP on enqueue,\n// front = (front + 1) % CAP on dequeue',tip:'If a queue\'s capacity drains over time without dequeues refilling space, the ring is missing.'}
  ],
  cmp:['Stack vs queue vs deque',['Structure','Remove from','Star use'],[['Stack','Same end as insert (LIFO)','Undo, nesting, DFS'],['Queue','Opposite end (FIFO)','Scheduling, BFS, buffers'],['Deque','Either end','Sliding windows, work stealing'],['Priority queue','Highest priority (heap)','Dijkstra, event sims']]],
  diag:{kind:'flow',start:'Arrivals at rear',condition:'size < CAP?',trueAction:'Store at rear, rear=(rear+1)%CAP',falseAction:'Apply full-policy (reject)',end:'Service strictly from front'},
  apps:['Print spoolers and task schedulers (round-robin, earlier example).','Breadth-first search frontiers (graphs topic).','Streaming ring buffers between producers and consumers (audio, telemetry).'],
  quizzes:[{q:'CAP=5 ring, front=3, size=4. Elements occupy physical indices…',options:['3,4 only','3,4,0,1','0,1,2,3','Impossible state'],correct:1,why:'Four consecutive ring slots from front=3 wrap through 4 back to 0 and 1; rear would be 2.'},
            {q:'Why keep an explicit size in a circular queue?',options:['For printing','front == rear is ambiguous between completely full and completely empty','size speeds modulo','To avoid structs'],correct:1,why:'Both extreme states share the same index coincidence; size (or a sacrificed slot) disambiguates them.'}],
  take:['FIFO fairness: enqueue rear, dequeue front, everything O(1).','Ring indices rotate with % CAP; size resolves full-vs-empty.','Document the bounded-full policy; shifting-array queues are a bug farm.'],
  rev:'enqueue rear=(rear+1)%CAP size++; dequeue front=(front+1)%CAP size--. Empty size=0, full size=CAP. FIFO vs stack LIFO.',
  assign:{p:'With CAP=4 queue, enqueue 5,10,15; dequeue once; enqueue 20,25 (wrapping); then drain printing values separated by spaces. Expected drain: 10 15 20 25. Print "drained:" then values line.',s:`#include <stdio.h>
#define CAP 4
// TODO: ring queue + scripted ops + drain
int main(void) { return 0; }`,sol:`#include <stdio.h>
#define CAP 4
typedef struct { int buf[CAP]; int front, rear, size; } Queue;
static void init(Queue *q) { q->front = q->rear = q->size = 0; }
static int enqueue(Queue *q, int v) {
    if (q->size == CAP) return 0;
    q->buf[q->rear] = v; q->rear = (q->rear + 1) % CAP; q->size++;
    return 1;
}
static int dequeue(Queue *q, int *out) {
    if (q->size == 0) return 0;
    *out = q->buf[q->front]; q->front = (q->front + 1) % CAP; q->size--;
    return 1;
}
int main(void) {
    Queue q; init(&q);
    enqueue(&q, 5); enqueue(&q, 10); enqueue(&q, 15);
    int v;
    dequeue(&q, &v);
    enqueue(&q, 20); enqueue(&q, 25);
    printf("drained: ");
    while (dequeue(&q, &v)) printf("%d ", v);
    printf("\\n");
    return 0;
}`}
},
{
  id:'dsa-hashing-basics', course_id:'dsa', unit_id:'dsa-unit-2', order_index:4,
  title:'Hashing Basics: Hash Functions & Collision Handling', desc:'Map keys to buckets and resolve collisions with linear probing (and chaining concepts).',
  obj:['Explain hash(key) % capacity placement and load factor','Implement insert/search with linear probing including wrap-around','Predict clustering behaviour and name chaining as the alternative'],
  pre:['Arrays & searching','Modular arithmetic'],
  outcomes:['Learner builds a small hash table and argues expected O(1) operations'],
  def:'A hash table stores key–value pairs in an array at bucket index hash(key) mod capacity. Distinct keys mapping to one bucket collide; open addressing (e.g. linear probing) seeks the next free slot, while chaining stores a small list per bucket. With a good hash and bounded load factor, operations average O(1).',
  simple:'A hash table is a coat-check room with a formula: instead of searching every hook for your coat (name), the attendant computes your hook number from your name — same name always gives the same number, so retrieval is instant. The snag: two different names can compute the same hook (a collision). Linear probing resolves it as "try the next hook, then the next" until a free one appears; searching repeats the same walk. Keep the room less than about 70% full (the load factor) and these walks stay tiny on average, giving effectively constant-time insert and lookup — the engine inside every dictionary/map you have ever used.',
  hing:'Hash table ek aisi almari hai jisme cheez rakhne ki jagah ek formula (hash function) se nikalti hai: bucket = hash(key) % size. Wahi key doge to hamesha wahi bucket milegi, isliye dhundna aam taur par turant (O(1)) hota hai. Musibat tab aati hai jab do alag keys ka formula ek hi bucket de de — use collision kehte hain. Linear probing ka ilaaj simple hai: agli khaali jagah dekho, wahan rakho; dhundte waqt bhi waisa hi aage badho. Almari zyada bhar jayegi to ye "agla khaali" wali sair lambi ho jayegi (clustering), isliye load factor (bhara hua hissa) 0.7 se neeche rakho aur zaroorat pade to table bada karke sab dobara rakho (rehashing). Python ka dict aur Java ka HashMap isi siddhant par chalte hain!',
  why:'Hash tables are the default key–value engine of modern computing (dicts, sets, caches, indexes, dedupe). Understanding collisions and load factor demystifies their "magic O(1)" and its failure weather (adversarial keys, clustering).',
  when:'Use hashing for keyed access without ordering needs. Choose chaining for simplicity with unknown loads, open addressing for cache-friendly bounded tables. Grow (rehash into ~2x capacity) before load factor crosses your threshold.',
  syntax:'bucket = hash(key) % CAP;\nwhile (table[bucket].occupied && table[bucket].key != key)\n    bucket = (bucket + 1) % CAP;   // linear probe\nload_factor = entries / CAP        // keep < ~0.7',
  comp:[['Hash function','Deterministic key→integer spreading keys uniformly'],['Collision','Two keys hashing to one bucket; resolved by probe/chaining rules'],['Load factor','entries/capacity; high load = long probes, time to rehash bigger']],
  ex:[
   {t:'Basic: hashing integers with linear probing',code:`#include <stdio.h>
#define CAP 7
#define EMPTY (-1)
int table[CAP];
static int hash_of(int key) { return ((key % CAP) + CAP) % CAP; }
static int insert_key(int key) {
    int idx = hash_of(key);
    for (int probes = 0; probes < CAP; probes++) {
        if (table[idx] == EMPTY) { table[idx] = key; return idx; }
        if (table[idx] == key) return idx;
        idx = (idx + 1) % CAP;
    }
    return -1;
}
static int contains(int key) {
    int idx = hash_of(key);
    for (int probes = 0; probes < CAP; probes++) {
        if (table[idx] == key) return 1;
        if (table[idx] == EMPTY) return 0;
        idx = (idx + 1) % CAP;
    }
    return 0;
}
int main(void) {
    for (int i = 0; i < CAP; i++) table[i] = EMPTY;
    insert_key(10);
    insert_key(17);
    insert_key(3);
    insert_key(24);
    for (int i = 0; i < CAP; i++) printf("[%d]=%d ", i, table[i]);
    printf("\\ncontains 17=%d, 99=%d\\n", contains(17), contains(99));
    return 0;
}`,out:`[0]=-1 [1]=-1 [2]=-1 [3]=10 [4]=17 [5]=3 [6]=24 
contains 17=1, 99=0`,why:'10, 17, 3, 24 all hash to bucket 3 (mod 7) — a collision parade. Probing seats them at 3, 4, 5, 6 in arrival order. contains(99) probes from bucket 1, hits EMPTY immediately, and correctly stops: absence is proven by the first empty slot on the probe path.'},
   {t:'Intermediate: string keys with a polynomial hash',code:`#include <stdio.h>
#include <string.h>
#define CAP 11
typedef struct { char key[16]; int value; int occupied; } Entry;
static unsigned hash_str(const char *s) {
    unsigned h = 0;
    for (int i = 0; s[i]; i++) h = h * 31u + (unsigned char)s[i];
    return h % CAP;
}
static Entry table[CAP];
static void put(const char *key, int value) {
    unsigned idx = hash_str(key);
    while (table[idx].occupied && strcmp(table[idx].key, key) != 0)
        idx = (idx + 1) % CAP;
    strcpy(table[idx].key, key);
    table[idx].value = value;
    table[idx].occupied = 1;
}
static int get(const char *key, int fallback) {
    unsigned idx = hash_str(key);
    while (table[idx].occupied) {
        if (strcmp(table[idx].key, key) == 0) return table[idx].value;
        idx = (idx + 1) % CAP;
    }
    return fallback;
}
int main(void) {
    put("Diya", 92);
    put("Kabir", 57);
    put("Diya", 95);
    printf("Diya=%d Kabir=%d Meera=%d\\n", get("Diya", -1), get("Kabir", -1), get("Meera", -1));
    return 0;
}`,out:`Diya=95 Kabir=57 Meera=-1`,why:'The polynomial rolling hash (h*31 + c) spreads strings across buckets. Re-putting Diya finds her existing slot on the probe path and updates in place (92→95) instead of duplicating — put semantics every map promises.'},
   {t:'Advanced: load factor pressure and probe lengths',code:`#include <stdio.h>
#define CAP 11
static int table[CAP];
static int insert_count_probes(int key) {
    int idx = ((key % CAP) + CAP) % CAP;
    int probes = 1;
    while (table[idx] != -1 && table[idx] != key) {
        idx = (idx + 1) % CAP;
        probes++;
    }
    table[idx] = key;
    return probes;
}
int main(void) {
    for (int i = 0; i < CAP; i++) table[i] = -1;
    int keys[] = {22, 33, 44, 5, 16, 27, 100};
    int total_probes = 0;
    for (int i = 0; i < 7; i++) {
        int p = insert_count_probes(keys[i]);
        total_probes += p;
        printf("insert %d: %d probe(s), load=%.2f\\n", keys[i], p, (i + 1.0) / CAP);
    }
    printf("avg probes = %.1f\\n", total_probes / 7.0);
    return 0;
}`,out:`insert 22: 1 probe(s), load=0.09
insert 33: 2 probe(s), load=0.18
insert 44: 3 probe(s), load=0.27
insert 5: 1 probe(s), load=0.36
insert 16: 2 probe(s), load=0.45
insert 27: 3 probe(s), load=0.55
insert 100: 3 probe(s), load=0.64
avg probes = 2.1`,why:'Multiples of 11 (22, 33, 44) all hash to bucket 0 and form a cluster at slots 0-2, while 5, 16, 27 share home bucket 5 and occupy 5-7. Even 100 (hash 1) must step through the first cluster to slot 3. Two separate clusters at modest load already lift the average to 2.1 probes — primary clustering made visible; a better-spreading hash (multiplicative) reshuffles such patterned keys.'}
  ],
  walk:[[26,'hash(10) = 10 % 7 = 3; bucket 3 is EMPTY → store, 1 probe.','10 @3'],[27,'hash(17) = 3 again (collision): bucket 3 occupied by a different key, probe steps to 4 (EMPTY) → store.','17 @4'],[29,'hash(24) = 3: walks 3 (10), 4 (17), 5 (3) — all strangers — lands at 6. Probe path length grows with cluster size.','24 @6 after 4 probes'],[19,'contains(17): starts at 3, sees 10 (not it), steps to 4, finds 17. contains(99): hash 1 hits EMPTY at once, proving absence.','search mirrors insert path']],
  walkWhy:'Search must replay the exact collision walk insert performed; the first EMPTY on that path certifies absence — which is why naive deletion (clearing a slot) breaks searches and needs tombstones (an advanced follow-up).',
  rules:['Search termination: stop at the key (found), an EMPTY slot (absent), or after CAP probes (full table guard).','Deleting in open addressing needs tombstone markers, never plain EMPTY, or later probe chains snap.','Keep load factor bounded (~0.7 for probing) and rehash to a bigger table, reinserting every key.','Hash must be deterministic within a run and spread realistic key patterns (multiples, sequential ids) — test with adversarial inputs.'],
  mistakes:[
   {t:'Deleting by clearing the slot to EMPTY',bad:'// remove 17 at bucket 4:\ntable[4] = EMPTY;\n// now contains(3), seated later in the cluster, stops at bucket 4 -> not found!',why:'Searchers interpret EMPTY as "nothing beyond here on this probe path". Clearing a mid-cluster slot amputates every key that probed past it, making live data unreachable.',fix:'table[4] = TOMBSTONE;  // searches step over it; inserts may reuse it\n// periodic rehash cleans accumulated tombstones',tip:'Open-addressing deletion is the one operation that is never just "erase" — budget tombstones or choose chaining.'},
   {t:'A hash that ignores key structure',bad:'int hash_of(const char *s) { return s[0] % CAP; }  // every "A..." name collides',why:'Single-character hashing piles all same-initial keys into one cluster, degenerating the table into a linked list (O(n)) while nominally being a hash table.',fix:'unsigned h = 0;\nfor (...) h = h * 31u + (unsigned char)*s++;  // whole-string polynomial',tip:'Fold in every character with multiplication; validate distribution with a quick bucket histogram on sample data.'}
  ],
  cmp:['Collision strategies',['Strategy','Where colliders go','Notes'],[['Linear probing','Next free slots','Cache-friendly; clustering; tombstone deletes'],['Quadratic probing','+1, +4, +9... jumps','Less primary clustering'],['Chaining','Per-bucket linked list','Simple deletes; pointer overhead; unbounded load tolerant'],['Rehashing (growth)','Bigger table, all reinserted','Resets load factor as sets grow']]],
  diag:{kind:'memory',vars:[{name:'bucket 3',addr:'h=3',val:'10',type:'int',size:'key'},{name:'bucket 4',addr:'probe+1',val:'17',type:'int',size:'key'},{name:'bucket 5',addr:'probe+2',val:'3',type:'int',size:'key'}],note:'Colliders occupy consecutive slots under linear probing.'},
  apps:['Language dictionaries/maps/sets and object property stores.','Caches and memoisation tables keyed by inputs.','Deduplication and frequency counting over streams.'],
  quizzes:[{q:'With CAP=7 linear probing, keys 10 then 17 (both hash 3) occupy…',options:['Both bucket 3 (list)','10 at 3, 17 probes to 4','17 rejected','17 replaces 10'],correct:1,why:'Open addressing seats the later collider in the next free slot along the probe sequence.'},
            {q:'Why does deleting to EMPTY break open-addressing search?',options:['It frees memory','Searchers stop at EMPTY believing the probe chain ended, orphaning later colliders','Hash changes','Load factor drops'],correct:1,why:'Absence is proven by the first EMPTY; an artificial gap truncates legitimate probe paths. Tombstones solve it.'}],
  take:['Hash deterministically, place by modulo, resolve collisions by a repeatable probe rule.','Absence = first EMPTY on the probe path; deletes need tombstones (probing) or lists (chaining).','Watch load factor and pattern-spread; rehash before clusters dominate.'],
  rev:'idx = hash(key)%CAP; probe (idx+1)%CAP until key/EMPTY. Load = n/CAP keep <0.7. Deletion -> tombstone. Chaining alternative.',
  assign:{p:'Implement a CAP=10 int hash set (EMPTY=-1) with insert/contains (linear probing), insert {12, 22, 32, 7}, then print contains(22), contains(8), and the slot of 32 by scanning the table. Expected: 1 0 slot 4 (12->2, 22->3, 32->4, 7->7).',s:`#include <stdio.h>
#define CAP 10
// TODO: set implementation + driver prints
int main(void) { return 0; }`,sol:`#include <stdio.h>
#define CAP 10
#define EMPTY (-1)
static int table[CAP];
static int hash_of(int k) { return ((k % CAP) + CAP) % CAP; }
static void insert_key(int k) {
    int idx = hash_of(k);
    while (table[idx] != EMPTY && table[idx] != k) idx = (idx + 1) % CAP;
    table[idx] = k;
}
static int contains(int k) {
    int idx = hash_of(k);
    for (int p = 0; p < CAP; p++) {
        if (table[idx] == k) return 1;
        if (table[idx] == EMPTY) return 0;
        idx = (idx + 1) % CAP;
    }
    return 0;
}
int main(void) {
    for (int i = 0; i < CAP; i++) table[i] = EMPTY;
    insert_key(12); insert_key(22); insert_key(32); insert_key(7);
    int slot = -1;
    for (int i = 0; i < CAP; i++) if (table[i] == 32) slot = i;
    printf("%d %d slot %d\\n", contains(22), contains(8), slot);
    return 0;
}`}
},
{
  id:'dsa-sorting-basics', course_id:'dsa', unit_id:'dsa-unit-2', order_index:5,
  title:'Sorting I: Bubble, Selection & Insertion Sort', desc:'The three quadratic classics, their invariants, and when simple beats fancy.',
  obj:['Implement bubble, selection and insertion sorts correctly','State best/worst/average cases and stability of each','Justify insertion sort for small or nearly-sorted inputs'],
  pre:['Arrays & Big-O'],
  outcomes:['Learner can hand-simulate passes and compare the trio honestly'],
  def:'The elementary sorts run in O(n^2) average time. Bubble sort repeatedly swaps adjacent inversions so large values sink endward; selection sort repeatedly moves the minimum of the unsorted suffix to its boundary; insertion sort grows a sorted prefix by shifting each new element into place — O(n) on nearly-sorted data.',
  simple:'Three beginner sorting ideas mirror everyday habits. Bubble sort is like repeatedly scanning a line of students and swapping any adjacent pair standing in the wrong height order — the tallest "bubble" to the end each pass. Selection sort is picking teams: find the smallest remaining player, move her to the front of the chosen group, repeat. Insertion sort is how you actually sort playing cards in your hand — take the next card and slide it left past bigger cards until it fits. All three are O(n²) on random data, but insertion sort has a superpower: on nearly-sorted input it barely works, approaching O(n).',
  hing:'Teen mashhoor sorting tareeke roz ki aadaton jaise hain. Bubble sort: pair-agar-pair ulta hai to badal do; har chakkar me sabse bada aakhir pahunchta jata hai ("bubble" upar uthta hai). Selection sort: bache hue hisse se sabse chhota dhundo aur seema par rakh do. Insertion sort: haath me taash ke patte jamane jaisa — agla patta uthao, bade patton ko khisakate hue sahi jagah fit karo. Teeno aam taur par O(n²) hain (bade data par dheeme), lekin insertion sort karib-sorted data par bohot tez (lagbhag O(n)) chalti hai aur stable bhi hai (barabar walo ka order nahi bigadta). Bubble apne improved roop me "koi swap nahi hua" check karke jaldi ruk sakta hai. Ye teeno chhoti lists aur padhai ke liye upyogi hain; system sortable in kaam agle topic ke O(n log n) wale karte hain.',
  why:'The trio teaches invariants (sorted prefix/suffix growth), stability concepts, and adaptive behaviour. Insertion sort survives inside real hybrid algorithms (Timsort, introsort leaf cases), and hand-simulation skill underpins analysing fancier sorts next topic.',
  when:'Use insertion sort for tiny (say <= 20) or nearly-sorted arrays; bubble sort mainly pedagogically (or with early-exit on streaming nearly-sorted); selection when writes are expensive but reads are cheap (it performs at most n swaps). Beyond that, use O(n log n) sorts.',
  syntax:'// insertion sort core\nfor (int i = 1; i < n; i++) {\n    int key = a[i], j = i - 1;\n    while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }\n    a[j + 1] = key;\n}',
  comp:[['Invariant','Loop-maintained truth: sorted prefix grows (insertion/selection) or largest suffix settles (bubble)'],['Stability','Equal elements keep original relative order (insertion & bubble: stable; selection: not)'],['Adaptivity','Exploiting existing order: insertion/bubble(Early exit) yes; selection no']],
  ex:[
   {t:'Basic: bubble sort with early exit + pass tracing',code:`#include <stdio.h>
static void bubble_sort(int a[], int n) {
    for (int pass = 0; pass < n - 1; pass++) {
        int swapped = 0;
        for (int j = 0; j < n - 1 - pass; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = 1;
            }
        }
        printf("after pass %d: ", pass + 1);
        for (int k = 0; k < n; k++) printf("%d ", a[k]);
        printf("\\n");
        if (!swapped) break;
    }
}
int main(void) {
    int a[] = {5, 1, 4, 2, 8};
    bubble_sort(a, 5);
    return 0;
}`,out:`after pass 1: 1 4 2 5 8 
after pass 2: 1 2 4 5 8 
after pass 3: 1 2 4 5 8`,why:'Pass 1 bubbles 8 to its final home; the inner range shrinks by one each pass (n-1-pass). Pass 3 made no swaps, so the early exit ends the sort — without it, two more pointless passes would run.'},
   {t:'Intermediate: selection sort and its swap frugality',code:`#include <stdio.h>
int main(void) {
    int a[] = {29, 10, 14, 37, 13};
    int n = 5, swaps = 0, comparisons = 0;
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            comparisons++;
            if (a[j] < a[min_idx]) min_idx = j;
        }
        if (min_idx != i) {
            int t = a[i]; a[i] = a[min_idx]; a[min_idx] = t;
            swaps++;
        }
    }
    for (int k = 0; k < n; k++) printf("%d ", a[k]);
    printf("\\ncomparisons=%d swaps=%d\\n", comparisons, swaps);
    return 0;
}`,out:`10 13 14 29 37 
comparisons=10 swaps=3`,why:'Comparisons are fixed at n(n-1)/2 = 10 regardless of input — selection never shortcuts. But it performs at most n-1 swaps (3 here), the fewest writes of the trio, mattering when writes are expensive (flash memory lore).'},
   {t:'Advanced: insertion sort adaptivity measured',code:`#include <stdio.h>
static long insertion_sort_shifts(int a[], int n) {
    long shifts = 0;
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; shifts++; }
        a[j + 1] = key;
    }
    return shifts;
}
int main(void) {
    int nearly[] = {1, 2, 3, 5, 4, 6, 7, 8};
    int reversed[] = {8, 7, 6, 5, 4, 3, 2, 1};
    printf("nearly-sorted shifts=%ld\\n", insertion_sort_shifts(nearly, 8));
    printf("reversed shifts=%ld\\n", insertion_sort_shifts(reversed, 8));
    for (int k = 0; k < 8; k++) printf("%d ", reversed[k]);
    printf("\\n");
    return 0;
}`,out:`nearly-sorted shifts=1
reversed shifts=28
1 2 3 4 5 6 7 8`,why:'Work equals the inversion count: nearly-sorted data needed a single shift (4 sliding past 5), fully reversed needs 1+2+...+7 = 28. Same algorithm, radically input-dependent cost — the definition of adaptive.'}
  ],
  walk:[[3,'Pass 1 scans adjacent pairs; every inversion swaps, carrying 8 (never smaller than a right neighbour) to the last slot.','8 settled'],[5,'The inner bound n-1-pass skips the settled suffix — comparing it again would waste work and risk nothing gained.','range shrinks'],[14,'Pass 3 performs full comparisons with zero swaps: proof the array is ordered, so we break early.','sorted detected']],
  walkWhy:'The invariant after each pass — the last (pass) elements are final — is both the correctness argument and the reason the inner loop may safely shorten.',
  rules:['Stability: bubble and insertion (with strict >) are stable; classic selection is not (long-range swaps leapfrog equals).','Worst case for all three is reversed input O(n^2); insertion best case O(n) on sorted input.','Swap counts differ wildly: selection <= n-1, bubble/insertion proportional to inversions.','These are in-place O(1) auxiliary-space algorithms — a virtue retained from the classics.'],
  mistakes:[
   {t:'Inner loop running into the settled suffix (bubble)',bad:'for (int j = 0; j < n - 1; j++)  // forgets - pass; and in another variant j < n reads a[n]',err:'(wasted comparisons; with j < n it reads a[j+1] out of bounds -> undefined behaviour)',why:'The bound must stop one before the already-sorted tail and one before the end for the j+1 access. Off-by-one here is the most common sorting crash in coursework.',fix:'for (int j = 0; j < n - 1 - pass; j++)',tip:'Annotate bounds with the invariant: indices [0 .. n-2-pass] are still in play.'},
   {t:'Breaking insertion stability with >=',bad:'while (j >= 0 && a[j] >= key) { a[j+1] = a[j]; j--; }',why:'Shifting equal elements reverses their original relative order; records with equal keys (same marks) shuffle unpredictably between runs of an ordering pipeline.',fix:'while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }  // strict > keeps equals put',tip:'When objects carry payloads beyond the sort key, stability is observable behaviour — guard the strictness of comparisons.'}
  ],
  cmp:['The quadratic trio compared',['Algorithm','Best','Worst','Stable?'],[['Bubble (early exit)','O(n)','O(n^2)','Yes'],['Selection','O(n^2) always','O(n^2)','No (classic)'],['Insertion','O(n)','O(n^2)','Yes'],['Space (all)','O(1)','O(1)','In-place']]],
  diag:{kind:'flow',start:'Unsorted input',condition:'Small or nearly sorted?',trueAction:'Insertion sort delights',falseAction:'Reach for O(n log n) (next topic)',end:'Sorted in place'},
  apps:['Card-hand style small-list ordering in games and embedded menus.','Final polish pass in hybrid production sorts for tiny partitions.','Maintaining a live sorted shortlist via insertion into place (leaderboards).'],
  quizzes:[{q:'Selection sort on already-sorted input performs how many comparisons?',options:['O(n)','Same as any input: n(n-1)/2','Zero','O(log n)'],correct:1,why:'It unconditionally scans the whole suffix for a minimum each round; order of input changes only swap counts.'},
            {q:'Insertion sort on nearly-sorted data (one element slightly out of place) costs about…',options:['O(n^2)','O(n) — work tracks inversion count','O(log n)','O(1)'],correct:1,why:'Each key shifts only past greater predecessors; few inversions means near-linear total shifting.'}],
  take:['All three are O(n^2) territory; invariants (growing sorted region) prove them.','Insertion is adaptive + stable — the one still used in practice (hybrids).','Selection minimises swaps but never comparisons; bubble needs early exit to behave.'],
  rev:'Bubble: adjacent swaps, suffix settles. Selection: min-to-boundary, <=n swaps, unstable. Insertion: shift into sorted prefix, stable, O(n) best. All O(1) space.',
  assign:{p:'Implement insertion_sort(int[], int) and sort {9, 3, 7, 1, 8, 2}; print the sorted array then the number of shifts performed (count while-loop body). Expected: "1 2 3 7 8 9" and shifts=10.',s:`#include <stdio.h>
// TODO: insertion sort with shift counter
int main(void) { return 0; }`,sol:`#include <stdio.h>
int main(void) {
    int a[] = {9, 3, 7, 1, 8, 2};
    int n = 6;
    long shifts = 0;
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; shifts++; }
        a[j + 1] = key;
    }
    for (int k = 0; k < n; k++) printf("%d ", a[k]);
    printf("\\nshifts=%ld\\n", shifts);
    return 0;
}`}
},
{
  id:'dsa-sorting-divide-conquer', course_id:'dsa', unit_id:'dsa-unit-2', order_index:6,
  title:'Sorting II: Merge Sort & Quick Sort thinking', desc:'Divide-and-conquer sorts with O(n log n) performance and their trade-offs.',
  obj:['Implement merge sort and the two-finger merge step','Explain quicksort partitioning and pivot sensitivity','Compare stability, space and worst cases of the two'],
  pre:['Sorting I','Recursion & backtracking (divide patterns)'],
  outcomes:['Learner implements an O(n log n) sort and reasons about its guarantees'],
  def:'Divide-and-conquer sorts split the array, sort the parts recursively, and combine. Merge sort splits by position and merges sorted halves in linear time (O(n log n) always, O(n) auxiliary space, stable). Quick sort partitions around a pivot so smaller elements precede larger ones, recursing on both sides (average O(n log n) in-place, worst O(n^2) with bad pivots).',
  simple:'Sorting one huge pile is slow; sorting two half-piles and interleaving them is fast — that is merge sort: keep cutting the pile in half until single cards remain (trivially sorted), then repeatedly zip two sorted mini-piles together by always taking the smaller front card. Quick sort instead picks a "pivot" card and parts the crowd: smaller values to its left, larger to its right; the pivot lands in its FINAL place, and each side repeats the game. Merge sort promises steady, predictable speed but needs a spare table (extra array); quick sort works in place and is usually fastest in practice, but a badly chosen pivot (like always the first card of an already-sorted pile) degrades it to slow O(n²).',
  hing:'Bade pile ko baar-baar aadha kaato jab tak ek-ek card na bache (sorted!), phir do sorted gin-stacks ko zip ki tarah milao — har baar chhota wala agla card pehle utha lo. Ye hai merge sort: hamesha O(n log n), stable, lekin ek extra array (auxiliary jagah) chahiye. Quick sort ka tareeka alag hai: ek pivot chuno, chhote ko uski bayein, bade ko dayein dhakel do — pivot apni FINAL jagah par baith gaya; phir dono taraf wahi khel. Quick sort aam taur par sabse tez aur in-place hai, par agar pivot hamesha sabse chhota/bada nikla (jaise pehle se sorted data me pehla element pivot), to ghisat kar O(n²) ho jata hai. Isiliye beech wala ya random pivot liya jata hai. Engineering me aksar hybrid banta hai: quicksort ki race, merge jaisi guarantee ke saath jodkar.',
  why:'O(n log n) is the comparison-sort speed limit — these algorithms define industrial sorting. Understanding merge/quick trade-offs (stability, space, adversarial inputs) is core systems literacy and interview canon.',
  when:'Merge sort: linked lists, external (disk) sorting, stability-required pipelines. Quick sort (well-engineered introsort/Timsort hybrids) underlies most library sorts: C qsort family/Java primitives, while object sorts prefer stable merges. Know both shapes cold.',
  syntax:'merge_sort(a, lo, hi):\n  if lo >= hi: return\n  mid = (lo + hi) / 2\n  merge_sort(a, lo, mid); merge_sort(a, mid + 1, hi)\n  merge(a, lo, mid, hi)   // two-finger zip with temp buffer',
  comp:[['Divide & conquer','Recurrence T(n) = 2T(n/2) + O(n) solves to O(n log n)'],['Merge step','Two fingers walk sorted halves; smaller front wins each slot'],['Partition (quick)','Rearrange so pivot lands at its final rank; recurse on both sides']],
  ex:[
   {t:'Basic: the two-finger merge step',code:`#include <stdio.h>
static void merge_two(const int L[], int nL, const int R[], int nR, int out[]) {
    int i = 0, j = 0, k = 0;
    while (i < nL && j < nR) out[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < nL) out[k++] = L[i++];
    while (j < nR) out[k++] = R[j++];
}
int main(void) {
    int L[] = {1, 4, 6, 9};
    int R[] = {2, 3, 8};
    int out[7];
    merge_two(L, 4, R, 3, out);
    for (int k = 0; k < 7; k++) printf("%d ", out[k]);
    printf("\\n");
    return 0;
}`,out:`1 2 3 4 6 8 9`,why:'Both inputs are individually sorted, so the next output is always one of the two front elements. <= (taking left on ties) is exactly what makes merge sort stable. When one side exhausts, the survivor tail copies verbatim.'},
   {t:'Intermediate: full merge sort',code:`#include <stdio.h>
#include <stdlib.h>
static void merge(int a[], int lo, int mid, int hi, int tmp[]) {
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (int t = lo; t <= hi; t++) a[t] = tmp[t];
}
static void merge_sort(int a[], int lo, int hi, int tmp[]) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort(a, lo, mid, tmp);
    merge_sort(a, mid + 1, hi, tmp);
    merge(a, lo, mid, hi, tmp);
}
int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10};
    int n = 7;
    int *tmp = malloc(n * sizeof *tmp);
    merge_sort(a, 0, n - 1, tmp);
    for (int k = 0; k < n; k++) printf("%d ", a[k]);
    printf("\\n");
    free(tmp);
    return 0;
}`,out:`3 9 10 27 38 43 82`,why:'One shared temp buffer serves every merge (allocate once!). Depth is log2(7) ≈ 3 levels, each level processing all 7 elements — the n log n shape in concrete form. Performance is input-order independent.'},
   {t:'Advanced: quick sort partition pass + full sort',code:`#include <stdio.h>
static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }
static int partition(int a[], int lo, int hi) {
    int pivot = a[hi];
    int i = lo;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) { swap(&a[i], &a[j]); i++; }
    }
    swap(&a[i], &a[hi]);
    return i;
}
static void quick_sort(int a[], int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quick_sort(a, lo, p - 1);
    quick_sort(a, p + 1, hi);
}
int main(void) {
    int a[] = {10, 7, 8, 9, 1, 5};
    int p = partition(a, 0, 5);
    printf("pivot 5 landed at %d: ", p);
    for (int k = 0; k < 6; k++) printf("%d ", a[k]);
    printf("\\n");
    int b[] = {38, 27, 43, 3, 9, 82, 10};
    quick_sort(b, 0, 6);
    for (int k = 0; k < 7; k++) printf("%d ", b[k]);
    printf("\\n");
    return 0;
}`,out:`pivot 5 landed at 1: 1 5 8 9 10 7 
3 9 10 27 38 43 82`,why:'Lomuto partition sweeps smaller-than-pivot elements to the growing left block, then seats the pivot at the boundary (index 1: only 1 is smaller). Sides are unsorted internally but every left element < 5 <= every right element — recursion now conquers independently.'}
  ],
  walk:[[4,'i walks L, j walks R: compare 1 vs 2 → take 1. Then 4 vs 2 → take 2; 4 vs 3 → take 3; 4 vs 8 → take 4...','front-wins choices'],[5,'Once R exhausts (after 8 is taken), Ls remainder 9 copies across wholesale.','tail copy'],[4,'Total comparisons <= nL + nR - 1: merging is linear — the O(n) work term in the recurrence.','linear combine step']],
  walkWhy:'Because each level of recursion merges a total of n elements and there are log n levels, the geometry of the recursion tree IS the n log n proof.',
  rules:['Merge takes left on ties (<=) for stability; flipping to < silently breaks it.','Allocate the merge buffer once (outside recursion) — per-call allocation thrashes performance.','Quick sort pivot choice is destiny: median-of-three/randomised pivots keep O(n^2) a freak event; first-element pivot on sorted data guarantees it.','Recurrence depth is log n for merge and balanced quick sorts, but degenerate quick sort depth hits n (stack depth risk).'],
  mistakes:[
   {t:'Wrong base case splitting forever',bad:'void ms(int lo, int hi) {\n    int mid = (lo + hi) / 2;\n    ms(lo, mid); ms(mid, hi);  // [0,1] -> mid 0 -> ms(0,0) & ms(0,1)...\n}',err:'StackOverflow / infinite recursion',why:'With ms(mid, hi), the very range [0,1] reproduces itself endlessly: the subproblems never shrink below the parent on one branch. Divide-and-conquer correctness is "strictly smaller on every branch".',fix:'if (lo >= hi) return;\nint mid = lo + (hi - lo) / 2;\nms(lo, mid); ms(mid + 1, hi);',tip:'Trace the n=2 case by hand for every recursive splitter you ever write.'},
   {t:'First-element pivot on sorted input (self-DoS)',bad:'pivot = a[lo];  // ascending input: pivot is always the minimum',why:'Every partition peels off ONE element, giving n levels of O(n) scans — O(n^2) total with O(n) recursion depth. Adversaries (or innocently sorted exports) trigger it reliably.',fix:'// median-of-three or random pivot swapped to the pivot slot',tip:'Library sorts hybridise (introsort: quick→heap fallback at depth cap) exactly because pivot luck cannot be a security property.'}
  ],
  cmp:['Merge vs quick',['Property','Merge sort','Quick sort'],[['Worst case','O(n log n) guaranteed','O(n^2) (bad pivots)'],['Extra space','O(n) buffer','O(log n) stack (typical)'],['Stable','Yes (with <=)','No (classic in-place)'],['Loves','Lists, external data, stability','In-memory arrays, cache speed']]],
  diag:{kind:'flow',start:'Array segment',condition:'Size <= 1?',trueAction:'Already sorted; return',falseAction:'Split, sort halves, combine (merge/partition)',end:'Segment sorted'},
  apps:['External sorting of files larger than RAM (merge runs from disk).','Inversion counting via a tweaked merge step.','Library sorts: Java Arrays.sort (dual-pivot quick for primitives; Timsort merge-hybrid for objects).'],
  quizzes:[{q:'Why is merge sort stable while classic quick sort is not?',options:['Merge uses extra space','During merge, equal fronts take from the LEFT half first, preserving original order; partitioning swaps leapfrog equals','Quick sort compares fewer elements','Stability is random'],correct:1,why:'The <= choice in the two-finger merge maintains left-before-right for equal keys across every level.'},
            {q:'Merge sort of 8 elements: recursion depth is about…',options:['8','64','3','1'],correct:2,why:'Halving 8 → 4 → 2 → 1 gives log2(8) = 3 levels.'}],
  take:['n log n comes from log levels × linear work per level — learn to see the tree.','Merge: guaranteed, stable, spends O(n) space. Quick: in-place average-fastest, pivot-fragile.','Strictly-shrinking recursion and tie-direction are the two correctness hotspots.'],
  rev:'Merge: split mid, zip fronts with <=, one shared tmp, stable O(n log n). Quick: partition around pivot (median/random), average n log n, worst n^2.',
  assign:{p:'Implement merge_sort with one allocated temp buffer and sort {12, 4, 19, 1, 15, 8}; print the sorted array on one line.',s:`#include <stdio.h>
#include <stdlib.h>
// TODO: merge + merge_sort + driver
int main(void) { return 0; }`,sol:`#include <stdio.h>
#include <stdlib.h>
static void merge(int a[], int lo, int mid, int hi, int tmp[]) {
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (int t = lo; t <= hi; t++) a[t] = tmp[t];
}
static void merge_sort(int a[], int lo, int hi, int tmp[]) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort(a, lo, mid, tmp);
    merge_sort(a, mid + 1, hi, tmp);
    merge(a, lo, mid, hi, tmp);
}
int main(void) {
    int a[] = {12, 4, 19, 1, 15, 8};
    int n = 6;
    int *tmp = malloc(n * sizeof *tmp);
    if (!tmp) return 1;
    merge_sort(a, 0, n - 1, tmp);
    for (int k = 0; k < n; k++) printf("%d ", a[k]);
    printf("\\n");
    free(tmp);
    return 0;
}`}
},
];

module.exports = { topics: makeTopics(specs) };
