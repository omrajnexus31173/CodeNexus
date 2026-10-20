'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'c-bitwise-operators', course_id:'c-lang', unit_id:'c-unit-2', order_index:5,
  title:'Bitwise Operators & Bit Masks', desc:'Work at the level of individual bits with &, |, ^, ~, << and >> — and use masks to set, clear, toggle and test flags.',
  obj:['Evaluate &, |, ^, ~, << and >> on small binary values by hand','Build a bit mask and use it to set, clear, toggle and test individual bits','Explain why shifting multiplies/divides by powers of two and when shifts are unsafe'],
  pre:['Arithmetic operators','Logical operators','Integer data types and ranges'],
  outcomes:['Learner can implement flag packing with masks and predict shift results, including edge cases near type limits'],
  def:'Bitwise operators act on the binary representation of integer operands bit by bit: AND (&) keeps bits set in both operands, OR (|) keeps bits set in either, XOR (^) keeps bits set in exactly one, NOT (~) flips every bit, and the shift operators (<<, >>) move all bits left or right by a given number of positions.',
  simple:'Imagine a row of light switches, one per bit. AND says "both rows must have this switch ON". OR says "at least one ON is enough". XOR says "exactly one ON". NOT flips every switch. Shifting left slides the whole row one place, which doubles the number; shifting right halves it. Programmers pack many yes/no flags into a single integer using these operations — for example, file permissions like read/write/execute are really three bits in one number. A mask is a number with only the bit you care about switched on, used like a stencil to touch just that one bit.',
  hing:'Bits ko on/off switches ki ek line samjho. & matlab dono jagah switch ON ho to hi result ON. | matlab koi ek ON ho to kaafi hai. ^ matlab sirf ek ON ho, dono nahi. ~ saare switches ulta kar deta hai. Left shift (<<) number ko 2 se multiply karta hai aur right shift (>>) 2 se divide. Asli use hai flags pack karna — ek hi integer me kai yes/no settings rakhna, jaise file permissions. Mask matlab sirf ek bit wala number, jisse aap exactly usi bit ko set, clear ya check kar sakte ho bina baaki bits ko chhede.',
  why:'Bit operations are the foundation of flags, permissions, protocols, graphics colour packing, checksums, embedded register control and many interview questions. They are also the fastest way to multiply/divide by powers of two and to store 32 boolean flags in 4 bytes.',
  when:'Use masks when several independent on/off options belong together (permissions, feature flags, hardware registers) and shifts when packing/unpacking fields (for example extracting the red channel from a packed RGB value). Avoid clever bit tricks in ordinary business logic where a plain bool or arithmetic is clearer.',
  syntax:'a & b   a | b   a ^ b   ~a   a << n   a >> n\nmask = 1u << bit;  flags |= mask;   /* set   */\nflags &= ~mask;                     /* clear */\nflags ^= mask;                      /* toggle */\nif (flags & mask) { /* bit is set */ }',
  comp:[['& | ^ ~','Bit-by-bit AND, OR, XOR and complement'],['<< >>','Shift all bits left/right by n positions'],['1u << bit','Creates a mask with a single 1 bit at position bit']],
  ex:[
   {t:'Basic: AND, OR, XOR and shifts on small numbers',code:`#include <stdio.h>
int main(void) {
    unsigned int a = 12; /* 1100 */
    unsigned int b = 10; /* 1010 */
    printf("a & b = %u\\n", a & b);
    printf("a | b = %u\\n", a | b);
    printf("a ^ b = %u\\n", a ^ b);
    printf("a << 1 = %u\\n", a << 1);
    printf("a >> 2 = %u\\n", a >> 2);
    return 0;
}`,out:`a & b = 8
a | b = 14
a ^ b = 6
a << 1 = 24
a >> 2 = 3`,why:'1100 AND 1010 keeps only the shared 1 bit (1000 = 8); OR combines (1110 = 14); XOR keeps differing bits (0110 = 6); left shift by 1 doubles 12 to 24; right shift by 2 divides by 4 giving 3.'},
   {t:'Intermediate: permission flags with masks',code:`#include <stdio.h>
#define READ_PERM  (1u << 0)
#define WRITE_PERM (1u << 1)
#define EXEC_PERM  (1u << 2)
int main(void) {
    unsigned int perms = 0;
    perms |= READ_PERM;
    perms |= WRITE_PERM;
    printf("perms = %u\\n", perms);
    printf("can read: %s\\n", (perms & READ_PERM) ? "yes" : "no");
    printf("can exec: %s\\n", (perms & EXEC_PERM) ? "yes" : "no");
    perms &= ~WRITE_PERM;
    printf("after revoke write = %u\\n", perms);
    return 0;
}`,out:`perms = 3
can read: yes
can exec: no
after revoke write = 1`,why:'Setting bits 0 and 1 gives binary 011 = 3. Testing with & answers each permission independently. Clearing uses &= ~mask, which removes only the WRITE bit and leaves READ untouched (001 = 1).'},
   {t:'Advanced: packing and unpacking an RGB colour',code:`#include <stdio.h>
int main(void) {
    unsigned int r = 200, g = 30, b = 90;
    unsigned int rgb = (r << 16) | (g << 8) | b;
    printf("packed = %u\\n", rgb);
    printf("r=%u g=%u b=%u\\n",
           (rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
    unsigned char v = 0x0F;
    printf("~0x0F in 8 bits = %u\\n", (~v) & 0xFF);
    return 0;
}`,out:`packed = 13114970
r=200 g=30 b=90
~0x0F in 8 bits = 240`,why:'Each channel occupies one byte of a 32-bit integer: red is shifted into bits 16-23, green into 8-15. Masking with 0xFF after shifting right extracts exactly one byte. ~0x0F flips 00001111 to 11110000 = 240 within 8 bits.'}
  ],
  walk:[[3,'a is 12, stored in binary as ...1100.','a = 1100'],[4,'b is 10, binary ...1010.','b = 1010'],[5,'AND compares each column: only the 8s column has 1 in both rows, so the result is 1000 = 8.','a & b = 1000'],[6,'OR keeps a 1 wherever either row has one: 1110 = 14.','a | b = 1110'],[8,'Left shift moves every bit one place left and fills with 0: 1100 becomes 11000 = 24.','a << 1 = 11000']],
  walkWhy:'Each operator works column by column on the bits, completely independently of neighbouring columns — this is why predicting binary columns by hand always gives the exact program output.',
  rules:['Bitwise operators only apply to integer types; using them on float/double is a compile error.','Shifting by a negative amount, or by >= the width of the type (e.g. 32 for a 32-bit int), is undefined behaviour.','Right-shifting a negative signed value is implementation-defined; prefer unsigned types for bit work.','~ on a small type promotes to int first, so mask the result (e.g. & 0xFF) when you need byte-sized results.','Do not confuse logical && / || (whole-value true/false) with bitwise & / | (per-bit).'],
  mistakes:[
   {t:'Using && instead of & to test a flag',bad:'if (perms && WRITE_PERM) { /* true whenever perms is non-zero! */ }',why:'&& only checks that both whole values are non-zero. With perms = READ only (1), 1 && 2 is still true, so the program wrongly grants write access.',fix:'if (perms & WRITE_PERM) { /* tests exactly the WRITE bit */ }',tip:'Whenever you test flags, grep your code for && and || near masks — they are almost always bugs.'},
   {t:'Shifting 1 into the sign bit or beyond the type width',bad:'int mask = 1 << 31;  /* signed overflow territory on 32-bit int */',why:'1 is a signed int; shifting it into (or past) the sign bit is undefined behaviour, and shifting by 32 or more is also undefined — results differ between compilers and CPUs.',fix:'unsigned int mask = 1u << 31;  /* unsigned wrap is well defined */',tip:'Make the literal unsigned (1u, 1ULL) and always keep the shift count below the type width.'}
  ],
  cmp:['Logical vs bitwise operators',['Feature','Logical (&&, ||, !)','Bitwise (&, |, ^, ~)'],[['Works on','Whole value as true/false','Each bit independently'],['Result','Always 0 or 1','A full integer bit pattern'],['Short-circuit','Yes — may skip right side','No — both sides always evaluated'],['Typical use','Conditions in if/while','Flags, masks, packing']]],
  diag:{kind:'flow',start:'Take integer bits',condition:'Need per-bit result?',trueAction:'Apply &, |, ^, ~, <<, >>',falseAction:'Use &&, ||, ! instead',end:'Use the resulting value'},
  apps:['Unix file permissions (rwx) are three bit-fields manipulated with exactly these mask operations.','Network protocols pack header flags into single bytes; TCP flags (SYN, ACK, FIN) are individual bits.','Embedded firmware sets/clears single bits in hardware control registers to switch pins and peripherals.'],
  quizzes:[{q:'What is the value of 5 ^ 3?',options:['2','6','7','8'],correct:1,why:'5 is 101 and 3 is 011; XOR keeps bits set in exactly one operand: 110 = 6.'},
            {q:'Which expression correctly tests whether bit 4 of flags is set?',options:['flags && (1u << 4)','flags & (1u << 4)','flags | (1u << 4)','flags == (1u << 4)'],correct:1,why:'& with a single-bit mask is non-zero exactly when that bit is set; && would be true for any non-zero flags.'}],
  take:['& keeps shared 1 bits, | keeps any 1 bit, ^ keeps differing bits, ~ flips all bits.','A mask (1u << n) lets you set with |=, clear with &= ~, toggle with ^= and test with &.','Shifts multiply/divide by powers of two; keep shift counts below the type width and prefer unsigned.'],
  rev:'AND shared, OR any, XOR different, NOT flip. Mask = 1u<<n. Set |=, clear &=~, toggle ^=, test &. <<1 doubles, >>1 halves. Never shift >= width; prefer unsigned.',
  assign:{p:'Write a program that stores three student features (submitted assignment = bit 0, passed quiz = bit 1, fee paid = bit 2) in one unsigned int. Set bits 0 and 2, print the packed value, then print "eligible" only if all three bits are set.',s:`#include <stdio.h>
int main(void) {
    unsigned int status = 0;
    /* TODO: set bit 0 and bit 2, print status,
       then check all three bits and print the verdict */
    return 0;
}`,sol:`#include <stdio.h>
int main(void) {
    unsigned int status = 0;
    status |= (1u << 0);
    status |= (1u << 2);
    printf("status = %u\\n", status);
    unsigned int all = (1u << 0) | (1u << 1) | (1u << 2);
    printf("%s\\n", ((status & all) == all) ? "eligible" : "not eligible");
    return 0;
}`}
},
{
  id:'c-arrays-1d', course_id:'c-lang', unit_id:'c-unit-3', order_index:3,
  title:'One-Dimensional Arrays: Declaration, Traversal & Bounds', desc:'Store many values of one type in contiguous memory, iterate safely, and compute sums, extremes and searches.',
  obj:['Declare and initialise 1-D arrays in several legal ways','Traverse an array with index-based loops without going out of bounds','Implement sum, maximum and linear search over an array'],
  pre:['For loops','Data types and variables','Functions basics'],
  outcomes:['Learner can process a fixed-size collection safely and explain why C performs no bounds checking'],
  def:'An array is a contiguous block of elements of the same type, accessed by a zero-based index. Given int a[5], the elements are a[0] through a[4], stored back-to-back in memory so that a[i] is located at base_address + i * sizeof(int).',
  simple:'An array is like a row of numbered lockers, all holding the same kind of item. The first locker is number 0, not 1 — this trips every beginner. If there are 5 lockers, the valid numbers are 0 to 4; asking for locker 5 means reaching into someone else\'s space, and C will not stop you — it trusts you completely, which is fast but dangerous. Loops and arrays are partners: the loop counter becomes the locker number, letting one block of code visit every element to add them, find the biggest, or search for a value.',
  hing:'Array matlab ek line me lage hue same type ke dabbe (jaise numbered lockers). Pehla dabba number 0 hota hai, 1 nahi. Agar 5 dabbe hain to valid index 0 se 4 tak hi hai; a[5] likhna matlab dusre ki jagah me haath daalna — C rokta nahi, ye undefined behaviour hai. Loop ka counter hi dabbe ka number banta hai, isliye for loop se aap saare elements ka sum, maximum ya search aasani se kar sakte ho. Size hamesha ek variable/constant me rakho, taaki loop ki limit galat na ho.',
  why:'Almost every real program processes collections — marks of students, sensor readings, pixels, prices. Arrays are the simplest collection and the memory model behind strings, buffers and most data structures.',
  when:'Use a fixed array when the maximum number of elements is known at compile time or program start. When the count is unknown or must grow, allocate dynamically with malloc (covered in dynamic memory) or use a linked structure.',
  syntax:'type name[size];                  /* uninitialised */\ntype name[size] = {v0, v1, ...};  /* initialised list */\ntype name[] = {v0, v1, v2};       /* size inferred = 3 */\nname[i] = value;                  /* write element i */\nfor (int i = 0; i < n; i++) { /* use name[i] */ }',
  comp:[['size','Number of elements; must be a positive integer'],['[i]','Subscript: selects element i, counting from 0'],['{...}','Initialiser list: missing trailing values become 0']],
  ex:[
   {t:'Basic: declare, fill and print an array',code:`#include <stdio.h>
int main(void) {
    int marks[5] = {78, 92, 64, 88, 71};
    for (int i = 0; i < 5; i++) {
        printf("marks[%d] = %d\\n", i, marks[i]);
    }
    printf("first = %d, last = %d\\n", marks[0], marks[4]);
    return 0;
}`,out:`marks[0] = 78
marks[1] = 92
marks[2] = 64
marks[3] = 88
marks[4] = 71
first = 78, last = 71`,why:'The loop counter i runs 0..4, exactly the valid indices. marks[0] is the first element and marks[4] the last — there is no marks[5].'},
   {t:'Intermediate: sum, average and maximum in one pass',code:`#include <stdio.h>
int main(void) {
    int data[] = {12, 45, 7, 89, 23, 56};
    int n = sizeof(data) / sizeof(data[0]);
    int sum = 0, max = data[0];
    for (int i = 0; i < n; i++) {
        sum += data[i];
        if (data[i] > max) max = data[i];
    }
    printf("n=%d sum=%d avg=%.1f max=%d\\n", n, sum, (double)sum / n, max);
    return 0;
}`,out:`n=6 sum=232 avg=38.7 max=89`,why:'sizeof(data)/sizeof(data[0]) computes the element count (24 bytes / 4 bytes = 6) so the code keeps working if values are added. One pass accumulates the sum and tracks the largest element seen so far.'},
   {t:'Advanced: passing an array to a function and linear search',code:`#include <stdio.h>
int find_first(const int a[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (a[i] == target) return i;
    }
    return -1;
}
int main(void) {
    int ids[] = {101, 205, 150, 205, 310};
    int n = sizeof(ids) / sizeof(ids[0]);
    printf("205 at index %d\\n", find_first(ids, n, 205));
    printf("999 at index %d\\n", find_first(ids, n, 999));
    return 0;
}`,out:`205 at index 1
999 at index -1`,why:'When an array is passed to a function only its starting address travels, so the length n must be passed separately. The search returns the FIRST matching index (205 appears at 1 and 3), and -1 signals "not found".'}
  ],
  walk:[[3,'The compiler allocates 5 consecutive ints and copies the initialiser values in order.','marks = [78,92,64,88,71]'],[4,'i starts at 0; the condition i < 5 is true.','i = 0'],[5,'marks[0] reads base + 0*4 bytes → 78 is printed.','prints marks[0] = 78'],[4,'i increments to 1, 2, 3, 4; each iteration prints the next element.','i = 1..4'],[4,'At i = 5 the condition fails before any access, so the loop ends safely.','loop ends, no out-of-bounds read']],
  walkWhy:'The guard is checked before the body runs, which is exactly why i < 5 is safe while i <= 5 would read one element past the end.',
  rules:['Valid indices are 0 .. size-1. Anything outside is undefined behaviour — C performs no runtime bounds check.','An array cannot be assigned with = after declaration; copy element by element or use memcpy.','The sizeof trick for length only works in the scope where the array is declared, not after it is passed to a function.','Partial initialisers zero-fill the remaining elements; with no initialiser, local array contents are indeterminate.'],
  mistakes:[
   {t:'Off-by-one: looping with <= instead of <',bad:'int a[5];\nfor (int i = 0; i <= 5; i++) a[i] = 0; /* writes a[5]! */',why:'The loop runs for i = 0..5, but a[5] is outside the array. This corrupts neighbouring memory and may crash or silently damage other variables.',fix:'for (int i = 0; i < 5; i++) a[i] = 0;',tip:'Read the condition aloud as "i stays below the count" — count 5 means last index 4.'},
   {t:'Trying to copy an array with =',bad:'int src[3] = {1,2,3};\nint dst[3];\ndst = src; /* compile error: assignment to array */',err:'error: assignment to expression with array type',why:'An array name is not a modifiable variable; C has no built-in array assignment. Each element must be copied explicitly.',fix:'for (int i = 0; i < 3; i++) dst[i] = src[i];\n/* or: memcpy(dst, src, sizeof src); */',tip:'If you need assignable arrays, wrap them in a struct — structs CAN be assigned.'}
  ],
  cmp:['Array vs separate variables',['Feature','Five separate variables','int a[5]'],[['Access by number','Impossible — names are fixed','a[i] with computed i'],['Loop processing','No','Yes — one loop does all'],['Memory layout','Compiler chooses, scattered','Guaranteed contiguous'],['Pass to function','Five parameters','One pointer + length']]],
  diag:{kind:'memory',vars:[{name:'a[0]',addr:'0x2000',val:'78',type:'int',size:'4 bytes'},{name:'a[1]',addr:'0x2004',val:'92',type:'int',size:'4 bytes'},{name:'a[2]',addr:'0x2008',val:'64',type:'int',size:'4 bytes'}],note:'Elements sit back-to-back: each address grows by sizeof(int) = 4.'},
  apps:['Storing a class\'s marks to compute averages, toppers and grade distributions.','Audio samples, image pixel rows and sensor reading buffers are all plain arrays.','Lookup tables (e.g. days per month) replace long if-else chains with one index operation.'],
  quizzes:[{q:'For int a[10], which index accesses the last element?',options:['a[10]','a[9]','a[1]','a[-1]'],correct:1,why:'Indices run 0..9 for 10 elements, so a[9] is last; a[10] is out of bounds.'},
            {q:'What does sizeof(a)/sizeof(a[0]) compute for int a[] = {4, 8, 15, 16}?',options:['16','8','4','43'],correct:2,why:'Total bytes (16) divided by one element (4 bytes) gives the element count, 4.'}],
  take:['Arrays are zero-based and contiguous: valid indices are 0 .. size-1.','Loop with i < n; C never checks bounds for you.','Pass the length along with the array to functions — the size is lost on passing.'],
  rev:'int a[5] → indices 0..4. Loop i<n. Length = sizeof a/sizeof a[0] (declaring scope only). No array assignment; copy elements or memcpy.',
  assign:{p:'Given int temps[] = {31, 35, 29, 40, 38, 33}; print the count of days hotter than 34 and the index of the hottest day. Expected: hot=3 and hottest index 3.',s:`#include <stdio.h>
int main(void) {
    int temps[] = {31, 35, 29, 40, 38, 33};
    int n = sizeof(temps) / sizeof(temps[0]);
    /* TODO: count values > 34 and track hottest index */
    return 0;
}`,sol:`#include <stdio.h>
int main(void) {
    int temps[] = {31, 35, 29, 40, 38, 33};
    int n = sizeof(temps) / sizeof(temps[0]);
    int hot = 0, hottest = 0;
    for (int i = 0; i < n; i++) {
        if (temps[i] > 34) hot++;
        if (temps[i] > temps[hottest]) hottest = i;
    }
    printf("hot=%d hottest_index=%d\\n", hot, hottest);
    return 0;
}`}
},
{
  id:'c-pointer-arithmetic-arrays', course_id:'c-lang', unit_id:'c-unit-3', order_index:4,
  title:'Pointer Arithmetic & the Array–Pointer Relationship', desc:'See how p+1 really moves by sizeof(*p), walk arrays with pointers, and subtract pointers to measure distance.',
  obj:['Predict the address change caused by p+1 for different pointed-to types','Traverse an array with a pointer instead of an index','Use pointer subtraction and comparison correctly within one array'],
  pre:['Pointer basics (address-of and dereference)','One-dimensional arrays'],
  outcomes:['Learner can read and write idiomatic pointer-walking code and explain a[i] as *(a+i)'],
  def:'Pointer arithmetic scales by the size of the pointed-to type: if p is an int* holding address A, then p+1 is A + sizeof(int). Array indexing is defined in terms of it — a[i] is exactly *(a + i). Subtracting two pointers into the same array yields the number of elements between them as a ptrdiff_t.',
  simple:'A pointer is like a finger pointing at one house in a row. Saying "next house" (p+1) does not move you one centimetre — it moves you by exactly one whole house. For int houses each is 4 bytes wide, so p+1 adds 4 to the address; for char houses it adds 1. This is why arrays and pointers feel interchangeable: a[2] literally means "start at the first house, step 2 houses, look inside". Subtracting two fingers (p2 - p1) tells you how many houses apart they are, which is how functions like strlen measure lengths.',
  hing:'Pointer ko ek ungli samjho jo ek ghar (memory location) ki taraf ishara kar rahi hai. p+1 ka matlab 1 byte aage nahi, agla pura element aage hai — int pointer me +4 bytes, char pointer me +1 byte. Isi liye a[i] aur *(a+i) bilkul same hain; bracket wala notation sirf padhne me aasan hai. Do pointers ka subtraction (p2 - p1) batata hai beech me kitne elements hain — bytes nahi, elements! Pointer arithmetic sirf ek hi array ke andar (ya ek past-the-end tak) valid hai; uske bahar jaana undefined behaviour hai.',
  why:'Pointer walking is how the standard library implements string and memory functions, how iterators in other languages work under the hood, and how you process buffers efficiently. Understanding the scaling rule removes the biggest mystery in C.',
  when:'Use indexing when random access or clarity matters; use pointer walking for sequential scans, in-place algorithms (two-pointer technique) and when a function receives only a pointer (where no array name exists anyway).',
  syntax:'int *p = a;          /* points at a[0] */\n*(p + 2)             /* same as a[2] */\np++;                 /* advance one ELEMENT */\nwhile (p < a + n) { use(*p); p++; }\nlong d = p2 - p1;    /* element distance, same array only */',
  comp:[['p + i','Address advanced by i * sizeof(*p) bytes'],['p2 - p1','Number of elements between two pointers into one array'],['a + n','Legal one-past-the-end pointer: comparable, never dereferenceable']],
  ex:[
   {t:'Basic: the same elements via index and via pointer',code:`#include <stdio.h>
int main(void) {
    int a[4] = {10, 20, 30, 40};
    int *p = a;
    printf("a[2] = %d\\n", a[2]);
    printf("*(p+2) = %d\\n", *(p + 2));
    printf("p[1] = %d\\n", p[1]);
    printf("step bytes = %ld\\n", (long)((char *)(p + 1) - (char *)p));
    return 0;
}`,out:`a[2] = 30
*(p+2) = 30
p[1] = 20
step bytes = 4`,why:'All three notations reach the same memory. Converting to char* before subtracting exposes the raw byte distance: one int step = 4 bytes, proving the scaling rule.'},
   {t:'Intermediate: summing by walking a pointer to the end marker',code:`#include <stdio.h>
int main(void) {
    int a[] = {5, 10, 15, 20, 25};
    int n = sizeof(a) / sizeof(a[0]);
    int sum = 0;
    for (int *p = a; p < a + n; p++) {
        sum += *p;
    }
    printf("sum = %d\\n", sum);
    int *mid = a + n / 2;
    printf("middle = %d, offset = %ld\\n", *mid, (long)(mid - a));
    return 0;
}`,out:`sum = 75
middle = 15, offset = 2`,why:'The loop stops at a+n, the legal one-past-the-end pointer, which is compared but never dereferenced. mid-a yields the element offset 2, and *mid reads a[2] = 15.'},
   {t:'Advanced: reversing in place with two pointers',code:`#include <stdio.h>
void reverse(int *a, int n) {
    int *left = a, *right = a + n - 1;
    while (left < right) {
        int tmp = *left;
        *left = *right;
        *right = tmp;
        left++;
        right--;
    }
}
int main(void) {
    int a[] = {1, 2, 3, 4, 5};
    reverse(a, 5);
    for (int i = 0; i < 5; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`,out:`5 4 3 2 1`,why:'Two pointers start at opposite ends, swap the values they point at, and step toward each other. When they meet, every pair has been swapped exactly once — O(n) time, O(1) extra memory.'}
  ],
  walk:[[3,'a is created with 4 elements; its name decays to the address of a[0].','a → &a[0]'],[4,'p copies that starting address.','p = &a[0]'],[6,'p+2 adds 2*sizeof(int) = 8 bytes, landing on a[2]; dereferencing reads 30.','*(p+2) = 30'],[8,'Casting both to char* makes subtraction count bytes instead of ints, revealing the 4-byte step.','step = 4 bytes']],
  walkWhy:'The address arithmetic is type-driven: the compiler inserts the multiplication by sizeof(int) automatically for int*, which the char* subtraction makes visible.',
  rules:['Pointer arithmetic is only defined within a single array object and one element past its end.','You may compare or subtract pointers only when they point into the same array (or one past it).','Adding two pointers together is illegal; only pointer ± integer and pointer − pointer exist.','Dereferencing the one-past-the-end pointer (a+n) is undefined behaviour even though forming it is legal.'],
  mistakes:[
   {t:'Assuming p+1 always adds 1 byte',bad:'int *p = a;\n/* expecting second byte of a[0] */\nuse(p + 1);',why:'p+1 skips a whole int (4 bytes). Code that assumes byte steps reads completely different data than intended.',fix:'unsigned char *bytes = (unsigned char *)a;\nuse(bytes + 1); /* char* really steps 1 byte */',tip:'Decide your unit first: element-level work uses the real type pointer; raw byte work uses unsigned char*.'},
   {t:'Dereferencing the one-past-the-end pointer',bad:'int *end = a + n;\nprintf("%d", *end); /* UB: reads past the array */',why:'a+n exists only as a boundary marker for comparisons. The memory there belongs to something else (or nothing).',fix:'printf("%d", *(end - 1)); /* last real element */\nfor (int *p = a; p < end; p++) { /* safe scan */ }',tip:'Use end in conditions (p < end), never as *end.'}
  ],
  cmp:['Indexing vs pointer walking',['Feature','a[i] indexing','*p pointer walking'],[['Meaning','*(a + i) computed fresh','Remembers a moving position'],['Random access','Natural fit','Awkward'],['Sequential scan','Fine','Idiomatic, stateful'],['Works after decay','Yes — p[i] also legal','Yes']]],
  diag:{kind:'pointer',varName:'(element)',val:'30',varAddr:'0x2008',ptrName:'p+2',ptrAddr:'0x2008'},
  apps:['strlen/strcpy style library functions are pure pointer walks until the null terminator.','The two-pointer technique solves palindrome checks, in-place reversal and partition (quicksort) with O(1) extra space.','Ring/circular buffers advance read/write pointers with wrap-around instead of shifting data.'],
  quizzes:[{q:'int a[5]; int *p = a; If a starts at address 2000, what is the numeric address of p+2 (assuming 4-byte int)?',options:['2002','2004','2008','2010'],correct:2,why:'Each step adds sizeof(int) = 4 bytes: 2000 + 2*4 = 2008.'},
            {q:'What is the value of (a+4) - (a+1) for an int array a?',options:['3','12','4','Undefined'],correct:0,why:'Pointer subtraction counts elements, not bytes: the pointers are 3 elements apart.'}],
  take:['p+i moves i elements = i * sizeof(*p) bytes — the type controls the step.','a[i] and *(a+i) (and even p[i]) are the same operation.','Stay inside one array; a+n may be formed and compared but never dereferenced.'],
  rev:'p+1 = next element (scaled by sizeof). a[i] == *(a+i). p2-p1 = element distance. One-past-end: compare yes, dereference never.',
  assign:{p:'Using only pointers (no [ ] indexing inside the loop body), find the maximum in int a[] = {14, 3, 27, 9, 27, 5}; and print both the maximum value and its element offset from the start. Expected: max=27 offset=2.',s:`#include <stdio.h>
int main(void) {
    int a[] = {14, 3, 27, 9, 27, 5};
    int n = sizeof(a) / sizeof(a[0]);
    /* TODO: walk with pointers, track int *best */
    return 0;
}`,sol:`#include <stdio.h>
int main(void) {
    int a[] = {14, 3, 27, 9, 27, 5};
    int n = sizeof(a) / sizeof(a[0]);
    int *best = a;
    for (int *p = a + 1; p < a + n; p++) {
        if (*p > *best) best = p;
    }
    printf("max=%ld offset=%d\\n", (long)(best - a), *best);
    return 0;
}`}
},
{
  id:'c-strings-stringh', course_id:'c-lang', unit_id:'c-unit-3', order_index:5,
  title:'Strings & the <string.h> Library', desc:'Understand null-terminated char arrays and use strlen, strcpy/strncpy, strcmp, strcat and strchr safely.',
  obj:['Explain the role of the null terminator and required buffer size','Use strlen, strcmp, strcpy and strchr with correct semantics','Avoid buffer overflow by sizing destinations and bounding copies'],
  pre:['One-dimensional arrays','Character type and ASCII','Loops'],
  outcomes:['Learner can manipulate C strings safely and predict strcmp results'],
  def:'A C string is a sequence of characters stored in a char array and terminated by a null character (\\0, value 0). Library functions in <string.h> such as strlen, strcmp and strcpy operate by scanning characters until that terminator, so every valid string needs one extra byte beyond its visible length.',
  simple:'C has no separate string type — a string is just letters in a char array with a special invisible stop sign, the null character, at the end. The word "CAT" occupies 4 boxes: C, A, T and the terminator. Every library function works by walking until it finds that stop sign, so if you forget it, functions keep reading into unrelated memory. Comparing strings with == is a classic trap: == compares addresses (where the boxes are), while strcmp compares the letters themselves, returning negative, zero or positive like a dictionary ordering.',
  hing:'C me string koi alag type nahi hai — char array me letters rakhe jate hain aur end me ek invisible stop sign \\0 (null character) hota hai. "CAT" ke liye 4 dabbe chahiye: C, A, T, \\0. Saare string functions is stop sign ko dhundhte hue chalte hain, isliye buffer ka size hamesha length + 1 rakho. Sabse bada trap: == se compare karna. == addresses compare karta hai, letters nahi. Sahi tarika strcmp hai — 0 matlab equal, negative matlab pehla dictionary me pehle, positive matlab baad me. Aur strcpy use karte time destination buffer bada hona hi chahiye, warna overflow pakka hai.',
  why:'Text is unavoidable — names, file paths, commands, JSON. Most historic C security bugs (buffer overflows) come from careless string copying, so the safe habits taught here are directly security-critical.',
  when:'Use stack char arrays for short fixed text and the <string.h> functions for measuring/copying/comparing. Prefer bounded variants (strncpy with manual termination, snprintf) whenever the source length is not fully under your control.',
  syntax:'char buf[20] = "hello";     /* 6 bytes used incl. \\0 */\nsize_t len = strlen(buf);   /* visible length, excl. \\0 */\nint cmp = strcmp(a, b);     /* <0, 0, >0 */\nstrcpy(dst, src);           /* dst MUST be large enough */\nchar *p = strchr(buf, \'l\'); /* pointer to first l or NULL */',
  comp:[['\\0 terminator','Marks the logical end; every string function stops here'],['strlen','Counts characters before \\0 — O(n) scan every call'],['strcmp result','Sign only is meaningful: negative / zero / positive']],
  ex:[
   {t:'Basic: length, indexing and the hidden terminator',code:`#include <stdio.h>
#include <string.h>
int main(void) {
    char word[10] = "CAT";
    printf("strlen = %zu\\n", strlen(word));
    printf("sizeof buffer = %zu\\n", sizeof(word));
    printf("word[3] as int = %d\\n", word[3]);
    word[0] = 'B';
    printf("now = %s\\n", word);
    return 0;
}`,out:`strlen = 3
sizeof buffer = 10
word[3] as int = 0
now = BAT`,why:'strlen counts visible letters (3) while sizeof reports the whole 10-byte buffer. word[3] holds the terminator with numeric value 0, and because word is an array (not a literal), changing word[0] to B is legal, giving BAT.'},
   {t:'Intermediate: comparing and searching strings',code:`#include <stdio.h>
#include <string.h>
int main(void) {
    char a[] = "apple";
    char b[] = "banana";
    char c[] = "apple";
    printf("cmp(a,b) negative? %s\\n", strcmp(a, b) < 0 ? "yes" : "no");
    printf("cmp(a,c) = %d\\n", strcmp(a, c));
    printf("a == c (addresses) ? %s\\n", (a == c) ? "yes" : "no");
    char *hit = strchr(b, 'n');
    printf("first n at offset %ld\\n", (long)(hit - b));
    return 0;
}`,out:`cmp(a,b) negative? yes
cmp(a,c) = 0
a == c (addresses) ? no
first n at offset 2`,why:'strcmp orders lexicographically: "apple" < "banana" so the result is negative (exact value is implementation-specific, only the sign is guaranteed). a and c hold equal text at different addresses, so == is false while strcmp is 0. strchr returns a pointer; subtracting the start gives the index 2.'},
   {t:'Advanced: safe copy and join with capacity checks',code:`#include <stdio.h>
#include <string.h>
int main(void) {
    char full[24];
    const char *first = "Ada";
    const char *last = "Lovelace";
    size_t need = strlen(first) + 1 + strlen(last) + 1;
    printf("need = %zu, capacity = %zu\\n", need, sizeof(full));
    if (need <= sizeof(full)) {
        strcpy(full, first);
        strcat(full, " ");
        strcat(full, last);
        printf("full = %s (len %zu)\\n", full, strlen(full));
    }
    return 0;
}`,out:`need = 13, capacity = 24
full = Ada Lovelace (len 12)`,why:'The safe pattern is: compute the exact requirement (letters + space + terminator = 13), verify capacity, and only then copy. strcat appends at the existing terminator and writes a new one. Skipping the capacity check is how buffer overflows happen.'}
  ],
  walk:[[4,'The array is filled with C, A, T and the compiler appends \\0 at index 3 automatically for string literals.','word = C A T \\0 + 6 spare'],[5,'strlen scans from index 0 until \\0 and counts 3 characters.','len = 3'],[7,'Reading word[3] as an integer exposes the terminator value 0 — it is a real stored byte, not an abstraction.','word[3] = 0'],[8,'Arrays are writable, so word[0] becomes B while the terminator stays in place.','word = B A T \\0']],
  walkWhy:'Everything — length, printing with %s, comparisons — is driven by that single terminator byte; the spare capacity beyond it is ignored by string functions.',
  rules:['Buffer size must be visible_length + 1 to hold the \\0; "CAT" needs char[4] minimum.','String literals are read-only; writing through a char* that points at a literal is undefined behaviour.','strcmp returns only a meaningful sign — never rely on an exact value like -1 or -4.','strcpy/strcat never check destination size; the caller guarantees capacity, or should use bounded alternatives.'],
  mistakes:[
   {t:'Comparing strings with ==',bad:'char entered[20] = "open";\nif (entered == "open") { unlock(); }',why:'== compares the array address with the literal address; they are different locations, so the condition is always false even when the text matches.',fix:'if (strcmp(entered, "open") == 0) { unlock(); }',tip:'In C, text equality is always strcmp(...) == 0. Turn on compiler warnings; some warn about this.'},
   {t:'Forgetting room for the terminator',bad:'char code[4] = "PASS";   /* no room for \\0 — not a valid string */\nprintf("%s", code);      /* reads past the array: UB */',why:'With exactly 4 slots the initialiser drops the terminator (this is legal C but the result is not a string). %s then keeps reading neighbouring memory until it happens to find a zero byte.',fix:'char code[5] = "PASS";   /* 4 letters + \\0 */\nprintf("%s", code);',tip:'Rule of thumb: declare length + 1, or let the compiler count with char code[] = "PASS";'}
  ],
  cmp:['Array string vs string literal pointer',['Feature','char s[] = "hi"','char *s = "hi"'],[['Storage','Writable copy in your array','Points to read-only literal'],['s[0] = \'H\'','Legal','Undefined behaviour'],['sizeof s','3 (h, i, \\0)','Pointer size (8 on 64-bit)'],['Can grow with strcat','If spare capacity exists','Never']]],
  diag:{kind:'memory',vars:[{name:'[0]',addr:'0x3000',val:"'C'",type:'char',size:'1 byte'},{name:'[1]',addr:'0x3001',val:"'A'",type:'char',size:'1 byte'},{name:'[2]',addr:'0x3002',val:"'T'",type:'char',size:'1 byte'},{name:'[3]',addr:'0x3003',val:'\\0 (0)',type:'char',size:'1 byte'}],note:'The terminator occupies a real byte; string functions stop there.'},
  apps:['Command parsers compare user input against keywords with strcmp to dispatch actions.','File path building joins directory and file names, and must respect buffer limits to stay secure.','Searching logs for a substring (strstr) or a delimiter (strchr) is everyday systems programming.'],
  quizzes:[{q:'What is strlen("hello\\0world")?',options:['11','5','10','Error'],correct:1,why:'strlen stops at the first null terminator, counting only "hello" = 5.'},
            {q:'strcmp("zebra", "apple") returns…',options:['0','A negative value','A positive value','Always exactly 1'],correct:2,why:'"zebra" sorts after "apple" lexicographically, so the result is positive; the magnitude is not specified.'}],
  take:['A C string is characters plus a \\0 terminator — always reserve length + 1 bytes.','Compare text with strcmp == 0, never with ==.','Check destination capacity before strcpy/strcat, or use bounded copies.'],
  rev:'String = char[] + \\0. strlen excludes \\0. strcmp sign: <0 before, 0 equal, >0 after. == compares addresses. Literals are read-only.',
  assign:{p:'Write a program that counts vowels (a, e, i, o, u lowercase) in the string "education" with an explicit loop, and prints the count. Expected output: vowels=5.',s:`#include <stdio.h>
#include <string.h>
int main(void) {
    char word[] = "education";
    /* TODO: loop over characters until \\0 and count vowels */
    return 0;
}`,sol:`#include <stdio.h>
#include <string.h>
int main(void) {
    char word[] = "education";
    int count = 0;
    for (size_t i = 0; word[i] != '\\0'; i++) {
        if (strchr("aeiou", word[i]) != NULL) count++;
    }
    printf("vowels=%d\\n", count);
    return 0;
}`}
},
{
  id:'c-recursion-basics', course_id:'c-lang', unit_id:'c-unit-3', order_index:6,
  title:'Recursion: Base Cases & the Call Stack', desc:'Write functions that call themselves with a shrinking problem, and trace frames stacking and unwinding.',
  obj:['Identify the base case and recursive step in a recursive function','Trace factorial/Fibonacci calls on the call stack','State when recursion is preferable to a loop and its cost'],
  pre:['Functions and return values','If-else conditions'],
  outcomes:['Learner can write terminating recursive functions and predict their output order'],
  def:'Recursion is a technique where a function calls itself on a smaller sub-problem until reaching a base case that can be answered directly without further calls. Every call creates a separate activation record (frame) on the call stack containing its own parameters and local variables.',
  simple:'Imagine standing in a queue and wanting to know your position. You ask the person in front, who asks the person in front of them, until the first person says "I am number 1". Then answers flow backward: 2, 3, 4... until you learn yours. That is recursion: a big question is answered by asking a slightly smaller identical question, plus one person (the base case) who answers directly. The computer remembers everyone who is still waiting on a stack of frames — which is also why a missing base case fills the stack until the program crashes (stack overflow).',
  hing:'Recursion matlab function khud ko hi chhote problem ke saath call karta hai. Queue wala example socho: apna number jaanna hai to aage wale se puchho, wo apne aage wale se — jab tak pehle bande tak na pauho (yeh hai base case). Phir jawab reverse me wapas aate hain. Har call ke liye stack par ek alag frame banta hai jisme us call ke apne variables hote hain. Agar base case bhool gaye, calls rukengi hi nahi — stack bhar jayega aur program crash (stack overflow). Hamesha pehle base case likho, phir recursive step jo problem ko chhota kare.',
  why:'Many structures are naturally self-similar — folders inside folders, trees, fractals, divide-and-conquer algorithms like merge sort and quicksort. Recursion expresses these in a few lines that would need messy manual stack code iteratively.',
  when:'Choose recursion when the problem shrinks toward a trivial case (tree walks, backtracking, divide and conquer). Prefer a loop for simple linear repetition in C, because each recursive call costs stack space and C does not guarantee tail-call optimisation.',
  syntax:'type f(args) {\n    if (base_condition) return base_value;  /* stop */\n    return combine( f(smaller_args) );      /* shrink */\n}',
  comp:[['Base case','Input answered directly; guarantees termination'],['Recursive step','Call with strictly smaller/simpler input'],['Combine','Build current answer from the sub-answer']],
  ex:[
   {t:'Basic: factorial',code:`#include <stdio.h>
long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
int main(void) {
    printf("5! = %ld\\n", factorial(5));
    printf("0! = %ld\\n", factorial(0));
    printf("10! = %ld\\n", factorial(10));
    return 0;
}`,out:`5! = 120
0! = 1
10! = 3628800`,why:'factorial(5) waits for factorial(4), which waits for factorial(3), down to the base case 1. The multiplications happen on the way back up: 1*2*3*4*5 = 120. 0! hits the base case immediately.'},
   {t:'Intermediate: countdown shows stack wind/unwind order',code:`#include <stdio.h>
void trace(int n) {
    if (n == 0) { printf("base reached\\n"); return; }
    printf("enter %d\\n", n);
    trace(n - 1);
    printf("exit %d\\n", n);
}
int main(void) {
    trace(3);
    return 0;
}`,out:`enter 3
enter 2
enter 1
base reached
exit 1
exit 2
exit 3`,why:'Statements before the recursive call run on the way down (3, 2, 1); statements after it run on the way back up, in reverse order (1, 2, 3). This single experiment explains almost all recursive output-order questions.'},
   {t:'Advanced: recursive binary search on a sorted array',code:`#include <stdio.h>
int bsearch_r(const int a[], int lo, int hi, int target) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) return mid;
    if (target < a[mid]) return bsearch_r(a, lo, mid - 1, target);
    return bsearch_r(a, mid + 1, hi, target);
}
int main(void) {
    int a[] = {3, 8, 15, 21, 34, 47, 59};
    printf("34 at %d\\n", bsearch_r(a, 0, 6, 34));
    printf("20 at %d\\n", bsearch_r(a, 0, 6, 20));
    return 0;
}`,out:`34 at 4
20 at -1`,why:'Each call discards half the remaining range, so the problem strictly shrinks (lo..hi narrows). Two base cases exist: found (return mid) and empty range lo > hi (return -1). Depth is only O(log n) frames.'}
  ],
  walk:[[3,'factorial(5) is called; 5 <= 1 is false, so it needs factorial(4) first and pauses.','stack: f(5)'],[4,'f(4), f(3), f(2) pause the same way; f(1) finally satisfies the base case and returns 1.','stack: f(5) f(4) f(3) f(2) f(1)'],[4,'Unwinding: f(2) computes 2*1=2, f(3) computes 3*2=6, f(4) computes 4*6=24.','partial: 2, 6, 24'],[4,'f(5) computes 5*24 = 120 and returns to main.','result = 120']],
  walkWhy:'No multiplication happens on the way down — each frame parks its n and only multiplies after its child call returns. Five live frames exist at the deepest point.',
  rules:['Every recursive path must reach a base case; arguments must strictly move toward it on each call.','Each call has its own copy of parameters and locals — changing them does not affect other frames.','Recursion depth is limited by stack size; deep linear recursion (millions of frames) crashes with stack overflow.','Naive Fibonacci re-computes sub-problems exponentially; recursion is not automatically efficient.'],
  mistakes:[
   {t:'Missing or unreachable base case',bad:'int f(int n) {\n    return n * f(n - 1);  /* never stops */\n}',err:'Segmentation fault (stack overflow)',why:'Without a base case the calls descend forever (n goes negative and keeps going), each adding a frame until the stack memory is exhausted and the OS kills the program.',fix:'int f(int n) {\n    if (n <= 1) return 1;\n    return n * f(n - 1);\n}',tip:'Write the base case first, then ask: does every input eventually reach it? Test n=0 and n=1 explicitly.'},
   {t:'Recursive step that does not shrink',bad:'int sum(int n) {\n    if (n == 0) return 0;\n    return n + sum(n);  /* same n forever */\n}',why:'The base case exists but is never approached because the argument never changes. Termination needs both a base case AND progress toward it.',fix:'return n + sum(n - 1);',tip:'Check the recursive call argument character by character against the parameter — a missing -1 is the classic bug.'}
  ],
  cmp:['Recursion vs iteration',['Feature','Recursion','Loop (iteration)'],[['Memory','One stack frame per level','Constant extra space'],['Termination','Base case + shrinking input','Loop condition + update'],['Best for','Trees, divide & conquer, backtracking','Simple flat repetition'],['Failure mode','Stack overflow','Infinite loop']]],
  diag:{kind:'flow',start:'Call f(n)',condition:'Base case reached?',trueAction:'Return base value',falseAction:'Call f(smaller) and combine',end:'Return answer to caller'},
  apps:['Traversing folder trees to compute total disk usage mirrors the recursive structure of directories.','Merge sort and quicksort are expressed naturally as "sort the two smaller halves".','Parsers for nested expressions/JSON use recursive descent, one function per grammar rule.'],
  quizzes:[{q:'In trace() from the lesson, why do the "exit" lines print 1, 2, 3 instead of 3, 2, 1?',options:['printf buffers output','Statements after the recursive call run while the stack unwinds, innermost frame first','The compiler reverses the loop','Base case prints them'],correct:1,why:'Each exit print waits until its child call returns; the deepest frame (n=1) is the first to resume and print.'},
            {q:'What happens if a recursive function has no reachable base case?',options:['Returns 0','Compiles to a loop','Stack overflow crash','Runs once and stops'],correct:2,why:'Every call adds a stack frame that is never removed, so stack memory is exhausted and the program crashes.'}],
  take:['Two ingredients, always: a reachable base case and a step that shrinks the problem.','Code before the call runs top-down; code after it runs bottom-up as frames return.','Depth costs stack memory — prefer loops for very deep linear repetition.'],
  rev:'Base case stops, recursive step shrinks. Frames pile on the stack (wind) and resolve in reverse (unwind). Missing progress/base = stack overflow.',
  assign:{p:'Write a recursive function sum_digits(int n) returning the sum of decimal digits, and print sum_digits(4725). Expected output: 18. Hint: base case n < 10; step uses n % 10 and n / 10.',s:`#include <stdio.h>
int sum_digits(int n) {
    /* TODO: base case + recursive step */
    return 0;
}
int main(void) {
    printf("%d\\n", sum_digits(4725));
    return 0;
}`,sol:`#include <stdio.h>
int sum_digits(int n) {
    if (n < 10) return n;
    return (n % 10) + sum_digits(n / 10);
}
int main(void) {
    printf("%d\\n", sum_digits(4725));
    return 0;
}`}
},
{
  id:'c-enums-typedef', course_id:'c-lang', unit_id:'c-unit-4', order_index:3,
  title:'Enumerations (enum) & typedef Aliases', desc:'Replace magic numbers with named constants and shorten clumsy type names with typedef.',
  obj:['Declare an enum with default and explicit values','Use enum constants in switch statements for readable state handling','Create typedef aliases for struct and pointer-heavy types'],
  pre:['Structures and unions','Switch statements','Integer constants'],
  outcomes:['Learner can model a fixed set of states with an enum and simplify declarations with typedef'],
  def:'An enumeration is a user-defined type whose values are a fixed list of named integer constants (enumerators), numbered from 0 by default unless explicit values are given. typedef introduces a synonym (alias) for an existing type; it does not create a new distinct type.',
  simple:'Programs are full of states that are really just small numbers: order status 0, 1, 2... but nobody remembers what 2 means. An enum attaches names — PENDING, SHIPPED, DELIVERED — while the computer still stores plain integers, so you get readability for free. typedef is the naming tool for TYPES: instead of writing "struct Student" or a frightening function-pointer declaration everywhere, you give the type a short friendly alias once, like "Student" or "SignalHandler", and use that everywhere.',
  hing:'enum matlab fixed states ko number ki jagah naam dena. Status 0, 1, 2 yaad rakhna mushkil hai, lekin PENDING, SHIPPED, DELIVERED padhte hi samajh aa jata hai — andar se ye integer hi hote hain (0 se shuru, chaaho to apni values de do). typedef types ko chhota naam (alias) deta hai: har baar `struct Student` likhne ke bajaye sirf `Student`. dhyan do, typedef naya type nahi banata, sirf purane type ka dusra naam hai — isliye alias aur original bilkul interchangeable hain.',
  why:'Named constants eliminate an entire class of magic-number bugs: `status = 2` can be typo-ed or misread, `status = DELIVERED` cannot denote the wrong state and the compiler can warn when a switch misses an enumerator. typedef keeps struct/pointer code readable.',
  when:'Use enum whenever a variable can hold one of a small fixed set of meanings (states, days, menu choices, error categories). Use typedef for struct types you reference often and for callback/function-pointer signatures used in APIs.',
  syntax:'enum Day { MON, TUE, WED, THU, FRI, SAT, SUN };  /* 0..6 */\nenum Http { OK = 200, NOT_FOUND = 404 };\ntypedef struct { int id; } Student;   /* alias */\ntypedef unsigned long ulong;',
  comp:[['Enumerator','A named integer constant in the value list'],['Explicit value','NAME = value overrides the auto sequence for that and following items'],['typedef alias','New name for an existing type — fully interchangeable']],
  ex:[
   {t:'Basic: enum values default from zero',code:`#include <stdio.h>
enum Day { MON, TUE, WED, THU, FRI, SAT, SUN };
int main(void) {
    enum Day today = WED;
    printf("WED = %d\\n", today);
    printf("SUN = %d\\n", SUN);
    printf("is weekend? %s\\n", (today >= SAT) ? "yes" : "no");
    return 0;
}`,out:`WED = 2
SUN = 6
is weekend? no`,why:'Enumerators are numbered 0,1,2,... in declaration order, so WED is 2 and SUN is 6. Because they are true integers, ordering comparisons like today >= SAT work when the declaration order is meaningful.'},
   {t:'Intermediate: explicit values + switch on state',code:`#include <stdio.h>
enum OrderState { PLACED = 1, PACKED = 2, SHIPPED = 4, DELIVERED = 8 };
const char *describe(enum OrderState s) {
    switch (s) {
        case PLACED:    return "order received";
        case PACKED:    return "in the box";
        case SHIPPED:   return "on the truck";
        case DELIVERED: return "handed over";
    }
    return "unknown";
}
int main(void) {
    printf("SHIPPED=%d -> %s\\n", SHIPPED, describe(SHIPPED));
    printf("next after PACKED code = %d\\n", SHIPPED);
    return 0;
}`,out:`SHIPPED=4 -> on the truck
next after PACKED code = 4`,why:'Explicit values (here powers of two, handy if states are ever combined as flags) override the 0-based sequence. The switch reads like documentation because case labels are the state names, and compilers can warn if a new state is added but not handled.'},
   {t:'Advanced: typedef with struct and a function-pointer alias',code:`#include <stdio.h>
typedef struct {
    int id;
    int marks;
} Student;
typedef int (*IntOp)(int, int);
static int add(int a, int b) { return a + b; }
int main(void) {
    Student s = {101, 88};
    IntOp op = add;
    printf("student %d marks %d\\n", s.id, s.marks);
    printf("op(4,5) = %d\\n", op(4, 5));
    return 0;
}`,out:`student 101 marks 88
op(4,5) = 9`,why:'The typedef lets us write Student instead of struct <tag> everywhere, and turns the otherwise unreadable declaration int (*op)(int,int) into the clear IntOp op. Both aliases refer to the exact same underlying types.'}
  ],
  walk:[[2,'The enum defines seven integer constants MON=0 through SUN=6 in order — no variables are created yet.','MON=0 ... SUN=6'],[4,'today is initialised with the enumerator WED, storing the integer 2.','today = 2'],[7,'The comparison uses the underlying integers: 2 >= 5 (SAT) is false, so "no" is chosen.','weekend = no']],
  walkWhy:'enum constants are compile-time integers with human names; at runtime only the numbers exist, which is why arithmetic and comparison work exactly like int.',
  rules:['After an explicit value, following enumerators continue from value+1 unless overridden again.','enum types in C are compatible with int and convert freely — C enums are NOT type-safe like C++ scoped enums.','typedef creates an alias, not a new type: Student and its underlying struct type are interchangeable.','Enumerator names share the ordinary identifier namespace, so two enums cannot reuse the same constant name in one scope.'],
  mistakes:[
   {t:'Assuming C enums stop invalid assignments',bad:'enum Day d = 99;  /* compiles in C! */',why:'C treats enums as integer-like, so any int can be stored. Switch statements then fall through to default/nothing and logic silently breaks.',fix:'enum Day d = FRI;  /* assign enumerators, validate external ints */\nif (input >= MON && input <= SUN) d = input;',tip:'Validate integers coming from files/users before treating them as enum values; always include a default case.'},
   {t:'Confusing typedef with #define for types',bad:'#define PTR int*\nPTR a, b;  /* b is an int, not int*! */',why:'#define is blind text substitution: int* a, b declares only a as a pointer. The code compiles and b is silently a plain int.',fix:'typedef int *IntPtr;\nIntPtr a, b;  /* both are int* */',tip:'Always typedef pointer types; never #define them.'}
  ],
  cmp:['enum vs #define constants',['Feature','enum',' #define'],[['Debugger visibility','Names understood as a group','Gone after preprocessing'],['Scope','Follows normal scoping rules','Global from the #define line onward'],['Auto numbering','Yes, sequential','No, manual values'],['Switch warnings','Compiler can warn on missing cases','No grouping known']]],
  diag:{kind:'flow',start:'Fixed set of states?',condition:'Values form one concept?',trueAction:'Model with enum names',falseAction:'Plain int or named const',end:'Switch on the state'},
  apps:['Order/workflow status, traffic light colour and menu selection are textbook enum states.','Library error codes (like errno categories) are published as enum-like named constants for readable handling.','typedef is how the standard library gives you size_t, FILE-like handles and callback types such as qsort comparators.'],
  quizzes:[{q:'Given enum E { A, B = 5, C }; what is C?',options:['2','5','6','0'],correct:2,why:'Numbering resumes after the explicit value: B is 5, so C becomes 6.'},
            {q:'typedef int Metres; — which statement is true?',options:['Metres is a brand-new type incompatible with int','Metres is exactly an alias for int','Metres variables cannot be added','Metres reserves extra memory'],correct:1,why:'typedef only adds a synonym; Metres and int are the same type and mix freely.'}],
  take:['enum gives a fixed set of states readable names over plain integers (from 0, or your explicit values).','C enums convert freely to/from int — validate external values and keep a default case.','typedef is an alias for an existing type; prefer it over #define for pointer/struct types.'],
  rev:'enum: names from 0, explicit value resets sequence. Not type-safe in C. typedef = alias, same type. #define pointer trap avoided by typedef.',
  assign:{p:'Define enum Signal { RED, YELLOW, GREEN }; and a function const char *action(enum Signal) returning "STOP" for RED, "WAIT" for YELLOW, "GO" for GREEN (default "BROKEN"). Print the action for GREEN and the numeric value of YELLOW. Expected: GO and 1.',s:`#include <stdio.h>
/* TODO: enum Signal and action() using switch */
int main(void) {
    return 0;
}`,sol:`#include <stdio.h>
enum Signal { RED, YELLOW, GREEN };
const char *action(enum Signal s) {
    switch (s) {
        case RED:    return "STOP";
        case YELLOW: return "WAIT";
        case GREEN:  return "GO";
    }
    return "BROKEN";
}
int main(void) {
    printf("%s\\n", action(GREEN));
    printf("YELLOW = %d\\n", YELLOW);
    return 0;
}`}
},
{
  id:'c-preprocessor-macros', course_id:'c-lang', unit_id:'c-unit-5', order_index:2,
  title:'Preprocessor Deep Dive: Macros, Guards & Conditional Compilation', desc:'Object-like and function-like macros, safe parenthesization, include guards and #if feature switches.',
  obj:['Expand object-like and function-like macros by hand','Write function-like macros with full parentheses and identify multiple-evaluation hazards','Use include guards and #ifdef/#if to control what gets compiled'],
  pre:['Compilation process (preprocessing stage shown earlier)','Constants and #define basics','Header files'],
  outcomes:['Learner can read macro-heavy C, write safe macros, and guard headers correctly'],
  def:'The preprocessor is a text-substitution phase that runs before compilation proper. It processes directives (#include, #define, #if, #ifdef, #pragma...) by copying, replacing or deleting source text, producing the translation unit that the compiler actually sees.',
  simple:'Before the compiler reads your code, a simpler tool — the preprocessor — does find-and-replace on the raw text. #define PI 3.14 means "wherever the word PI appears, paste 3.14". A function-like macro like SQUARE(x) pastes its argument into a formula. Because it is dumb text pasting, two dangers appear: missing parentheses change the arithmetic, and an argument like i++ can get pasted twice and run twice. The same tool gives us superpowers: #ifdef lets one file compile differently for debug/release, and include guards stop a header being pasted twice.',
  hing:'Compiler se pehle preprocessor source text par find-and-replace chalata hai. #define PI 3.14 matlab jahan PI dikhe, 3.14 chipka do. Function-like macro SQUARE(x) argument ko formula me paste karta hai — ye asal function call nahi hai! Isi liye do khatre hain: parentheses na lagaye to calculation badal jayegi (x+1 ka square galat aayega), aur agar argument me i++ hai to wo do jagah paste hokar do baar chalega. Isi tool se include guards (#ifndef/#define/#endif) header ko double include honey se rok sakte hain aur #ifdef DEBUG se debug-only code rakh sakte ho.',
  why:'Macros configure libraries, create portable code paths, generate repetitive declarations and switch debug logging on/off with zero runtime cost. Reading real-world C (kernels, embedded SDKs) is impossible without understanding expansion.',
  when:'Use macros for compile-time constants, build switches and tiny token tricks; prefer const variables, enums and static inline functions for values and computations, because those are type-checked, scoped and debugger-friendly.',
  syntax:'#define NAME replacement\n#define MAX(a, b) ((a) > (b) ? (a) : (b))\n#ifndef HEADER_GUARD_H\n#define HEADER_GUARD_H\n/* header body */\n#endif',
  comp:[['Object-like macro','Plain name replaced by text (#define PI 3.14)'],['Function-like macro','Name(args) replaced with args substituted into the body'],['Conditional directives','#if/#ifdef selectively keep or remove source regions']],
  ex:[
   {t:'Basic: constants and a fully-parenthesized macro',code:`#include <stdio.h>
#define PI 3.14159
#define CIRCLE_AREA(r) (PI * (r) * (r))
int main(void) {
    printf("PI = %f\\n", PI);
    printf("area r=2: %.2f\\n", CIRCLE_AREA(2));
    printf("area r=1+1: %.2f\\n", CIRCLE_AREA(1 + 1));
    return 0;
}`,out:`PI = 3.141590
area r=2: 12.57
area r=1+1: 12.57`,why:'Every parameter occurrence is wrapped in parentheses, so CIRCLE_AREA(1+1) expands to (PI * (1+1) * (1+1)) = 12.57. Without them it would compute 3.14159*1+1*1+1 — silently wrong.'},
   {t:'Intermediate: conditional compilation picks one code path',code:`#include <stdio.h>
#define FEATURE_CACHE 1
int main(void) {
#if FEATURE_CACHE
    printf("cache path: fast lookup\\n");
#else
    printf("cache path: direct lookup\\n");
#endif
#ifdef __STDC__
    printf("compiled as standard C\\n");
#endif
    printf("source line of this print: beyond check\\n");
    return 0;
}`,out:`cache path: fast lookup
compiled as standard C
source line of this print: beyond check`,why:'The preprocessor deletes the untaken branch before compilation, so only one printf exists in the compiled program. __STDC__ is a predefined macro every conforming compiler provides, so that block is always kept.'},
   {t:'Advanced: the multiple-evaluation hazard, shown and avoided',code:`#include <stdio.h>
#define MAX_MACRO(a, b) ((a) > (b) ? (a) : (b))
static int max_fn(int a, int b) { return a > b ? a : b; }
int main(void) {
    int i = 5, j = 3;
    int m1 = MAX_MACRO(i++, j);
    printf("macro: m=%d i=%d\\n", m1, i);
    i = 5;
    int m2 = max_fn(i++, j);
    printf("func : m=%d i=%d\\n", m2, i);
    return 0;
}`,out:`macro: m=6 i=7
func : m=5 i=6`,why:'The macro pastes i++ twice: the winning branch evaluates it again, so i is incremented twice and m becomes 6. The real function receives one evaluated value, giving m=5 and a single increment. This is the strongest argument for static inline functions over macros.'}
  ],
  walk:[[3,'Reading the #define, the preprocessor registers CIRCLE_AREA as a one-argument text pattern; nothing is compiled yet.','macro table: CIRCLE_AREA(r)'],[6,'CIRCLE_AREA(2) is replaced by (PI * (2) * (2)), then PI is replaced by 3.14159.','text: (3.14159 * (2) * (2))'],[7,'For argument 1+1, pasting gives (3.14159 * (1+1) * (1+1)) — parentheses force each argument to be evaluated as a unit.','value 12.57 both times']],
  walkWhy:'Expansion is purely textual and finishes before the compiler\'s parser runs; the final expression is what the compiler evaluates — parentheses you write in the macro are the only protection.',
  rules:['Function-like macro parameters must be parenthesized at every use, and the whole body should be wrapped in parentheses.','A macro argument may be evaluated zero, one or several times — never pass expressions with side effects (i++, function calls that change state).','Macro names are conventionally ALL_CAPS to warn readers that substitution, not a call, will happen.','Include guards rely on a unique macro name per header; #pragma once is a widely-supported alternative but non-standard.'],
  mistakes:[
   {t:'Unparenthesized macro body',bad:'#define DOUBLE(x) x + x\nint r = DOUBLE(2) * 10;  /* expands to 2 + 2 * 10 = 22, not 40 */',why:'Text pasting ignores your intended grouping, so operator precedence in the surrounding code hijacks the expansion.',fix:'#define DOUBLE(x) ((x) + (x))\nint r = DOUBLE(2) * 10;  /* ((2)+(2)) * 10 = 40 */',tip:'Parenthesize every parameter AND the entire body — both layers are required.'},
   {t:'Semicolon inside a constant macro',bad:'#define LIMIT 100;\nif (count > LIMIT) { stop(); }  /* becomes: if (count > 100;) */',err:'error: expected expression before ) token',why:'The macro text includes the semicolon, terminating the if condition early and leaving a syntax error that points at your code, not the macro.',fix:'#define LIMIT 100\nif (count > LIMIT) { stop(); }',tip:'Never end an object-like #define with a semicolon; the punctuation belongs at the use site.'}
  ],
  cmp:['Macro vs static inline function',['Feature','Function-like macro','static inline function'],[['Type checking','None — raw text','Full parameter/return types'],['Argument evaluation','Possibly multiple times','Exactly once'],['Debugging','Invisible to debugger','Steppable, named'],['Generic over types','Yes (accidentally)','One fixed signature']]],
  diag:{kind:'flow',start:'Source with # directives',condition:'Preprocessor runs first?',trueAction:'Substitute macros, apply #if',falseAction:'(never — it always runs)',end:'Compiler sees expanded text'},
  apps:['Build variants: one codebase compiles for different boards/OSes using #ifdef around platform code.','Debug logging macros print file/line in debug builds and expand to nothing in release builds.','Header include guards are present in virtually every multi-file C project you will ever open.'],
  quizzes:[{q:'With #define SQR(x) ((x) * (x)), what is SQR(1 + 2)?',options:['5','9','7','Compile error'],correct:1,why:'Parentheses make it ((1+2) * (1+2)) = 9. Without them the expansion would wrongly compute 1 + 2*1 + 2 = 5.'},
            {q:'Why is MAX_MACRO(i++, j) dangerous?',options:['Macros cannot take variables','i++ is pasted more than once and may run twice','++ is illegal in arguments','Macros run after compilation'],correct:1,why:'Text substitution duplicates the argument text; the selected branch re-evaluates i++, changing i an extra time.'}],
  take:['Macros are pre-compile text pasting, not function calls.','Parenthesize parameters and the body; never pass side-effecting arguments.','Use #ifdef/include guards for build switches, and prefer const/enum/inline where they fit.'],
  rev:'Preprocessor = text substitution before compile. Safe macro: ((a) op (b)). Args may evaluate multiple times. Guards: #ifndef/#define/#endif.',
  assign:{p:'Write a fully-parenthesized macro MIN3(a,b,c) built from a MIN2 macro, then print MIN3(7, 2, 9) and MIN3(4, 4, 1). Expected output: 2 then 1.',s:`#include <stdio.h>
/* TODO: #define MIN2(a,b) and MIN3(a,b,c) with full parentheses */
int main(void) {
    return 0;
}`,sol:`#include <stdio.h>
#define MIN2(a, b) ((a) < (b) ? (a) : (b))
#define MIN3(a, b, c) (MIN2(MIN2((a), (b)), (c)))
int main(void) {
    printf("%d\\n", MIN3(7, 2, 9));
    printf("%d\\n", MIN3(4, 4, 1));
    return 0;
}`}
},
{
  id:'c-command-line-args', course_id:'c-lang', unit_id:'c-unit-5', order_index:3,
  title:'Command-Line Arguments: argc, argv & Parsing', desc:'Receive program inputs from the shell, iterate argv safely, and convert numeric arguments with validation.',
  obj:['Explain what argc counts and why argv[argc] is NULL','Iterate arguments and distinguish flags from values','Convert text arguments to numbers with strtol validation'],
  pre:['main function structure','Strings & <string.h>','Pointers (argv is char**)'],
  outcomes:['Learner can write a small CLI tool that validates its arguments and reports usage errors'],
  def:'A program may declare main as int main(int argc, char *argv[]), where argc is the number of command-line tokens including the program name, and argv is an array of pointers to null-terminated argument strings, with argv[argc] guaranteed to be NULL.',
  simple:'Every time you type a command like "copy file1 file2", the shell slices your line into words and hands them to the program as an array of strings. argv[0] is the program\'s own name, argv[1] is the first real argument, and argc tells you how many words there were in total. All arguments arrive as TEXT — even "42" is the characters 4 and 2 — so converting numbers safely (and complaining when the user types nonsense) is your job. Well-behaved tools print a usage message and return a non-zero exit code when arguments are missing.',
  hing:'Jab aap terminal par `./app hello 42` chalate ho, shell words ko kaat kar program ko deta hai. argv[0] program ka apna naam hota hai, argv[1] pehla asli argument, aur argc total words ki ginti. Dhyan do: sab kuch TEXT aata hai — 42 bhi characters "4" aur "2" hain, number banane ke liye strtol jaisi safe conversion lagegi. Agar arguments kam hon to program ko usage message print karke non-zero return karna chahiye, crash nahi. argv ek char* ka array hai, aur argv[argc] hamesha NULL hota hai — ye guaranteed hai.',
  why:'Command-line arguments are how scripts, build systems and administrators drive tools (gcc itself is controlled entirely by them). Any serious CLI utility needs robust argument validation instead of assuming the user typed everything perfectly.',
  when:'Use argc/argv for file names, numeric options and flags supplied at launch. For complex option sets use a parsing convention or library approach (flags like -v, --output=...), and still validate counts before indexing argv.',
  syntax:'int main(int argc, char *argv[]) {\n    /* argv[0] = program name, argv[1..argc-1] = user args */\n    if (argc < 2) { fprintf(stderr, "usage: ...\\n"); return 1; }\n}',
  comp:[['argc','Argument count INCLUDING the program name'],['argv[i]','Pointer to the i-th argument string (modifiable copies)'],['argv[argc]','Always NULL — a built-in terminator for iteration']],
  ex:[
   {t:'Basic: inspect argc and argv (environment-safe)',code:`#include <stdio.h>
int main(int argc, char *argv[]) {
    printf("argc = %d\\n", argc);
    for (int i = 0; i < argc; i++) {
        printf("argv[%d] present: %s\\n", i, argv[i] && argv[i][0] ? "yes" : "no");
    }
    printf("argv[argc] is NULL: %s\\n", argv[argc] == NULL ? "yes" : "no");
    return 0;
}`,out:`argc = 1
argv[0] present: yes
argv[argc] is NULL: yes`,why:'Run with no arguments (as the sandbox does), argc is 1 because the program name itself always counts. argv[0] holds the invocation path exactly as launched (e.g. ./solution in your terminal) — its text depends on the environment, so this example prints only that it is present and non-empty. The NULL terminator after the last argument is guaranteed by the standard. Run ./solution hello 42 in a terminal and argc becomes 3.'},
   {t:'Intermediate: simulating arguments in-process for testable logic',code:`#include <stdio.h>
#include <string.h>
static void process(int argc, char *argv[]) {
    int verbose = 0;
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-v") == 0) verbose = 1;
        else printf("file: %s\\n", argv[i]);
    }
    printf("verbose = %s\\n", verbose ? "on" : "off");
}
int main(void) {
    char *fake[] = {"prog", "-v", "data.txt", "notes.md", NULL};
    process(4, fake);
    return 0;
}`,out:`file: data.txt
file: notes.md
verbose = on`,why:'Argument-handling logic is easier to test when separated from main: the same process() that will receive real argv can be fed a fabricated array. Flags start with conventionally, everything else is treated as a file operand, and iteration starts at 1 to skip the program name.'},
   {t:'Advanced: validating a numeric argument with strtol',code:`#include <stdio.h>
#include <stdlib.h>
static int parse_int(const char *text, long *out) {
    char *end = NULL;
    long value = strtol(text, &end, 10);
    if (end == text || *end != '\\0') return 0;
    *out = value;
    return 1;
}
int main(void) {
    long v;
    printf("42   -> %s", parse_int("42", &v) ? "ok\\n" : "bad\\n");
    printf("value = %ld\\n", v);
    printf("4x2  -> %s", parse_int("4x2", &v) ? "ok\\n" : "bad\\n");
    printf("abc  -> %s", parse_int("abc", &v) ? "ok\\n" : "bad\\n");
    return 0;
}`,out:`42   -> ok
value = 42
4x2  -> bad
abc  -> bad`,why:'strtol reports where parsing stopped via end. If nothing was consumed (end == text) or junk remains (*end != 0), the input is rejected — unlike atoi, which silently returns 0 for garbage and hides user errors.'}
  ],
  walk:[[2,'The program is launched with no extra words, so the runtime fills argc = 1.','argc = 1'],[3,'The count printed first is 1, confirming the program name is included.','prints argc = 1'],[4,'The single loop iteration inspects argv[0] (the invocation path) and reports it is present rather than printing the environment-specific path itself.','argv[0] present'],[7,'Indexing argv[argc] is legal and yields NULL, the guaranteed terminator.','argv[1] == NULL here']],
  walkWhy:'The pattern is identical for real invocations — only argc and the strings change. Code written against these guarantees works the same when the user types ./solution hello 42 (argc = 3).',
  rules:['Never read argv[i] for i >= argc other than the guaranteed NULL at argv[argc]; check argc first.','argv strings are modifiable, but they are not resizable — do not append to them.','atoi/atof cannot report errors; use strtol/strtod with end-pointer validation for user numbers.','Return a non-zero exit status and print usage to stderr when arguments are invalid.'],
  mistakes:[
   {t:'Reading argv[1] without checking argc',bad:'int main(int argc, char *argv[]) {\n    printf("%s", argv[1]);  /* NULL when no args */\n}',err:'Segmentation fault (printing NULL with %s is UB)',why:'With no arguments argv[1] is the NULL terminator. Passing NULL to printf %s is undefined behaviour — many systems crash outright.',fix:'if (argc < 2) { fprintf(stderr, "usage: prog NAME\\n"); return 1; }\nprintf("%s", argv[1]);',tip:'The argc check is always the first thing in a main that expects arguments — make it a reflex.'},
   {t:'Using atoi and treating garbage as 0',bad:'int port = atoi(argv[1]);  /* "abc" becomes 0 silently */',why:'atoi has no error channel: totally invalid input and the genuine value 0 both produce 0, so typos become mysterious runtime behaviour instead of a clear message.',fix:'char *end; long port = strtol(argv[1], &end, 10);\nif (end == argv[1] || *end != \'\\0\') { /* reject */ }',tip:'Validate with strtol and range-check the result (a port must be 1..65535, a count must be >= 0).'}
  ],
  cmp:['Command-line args vs scanf input',['Feature','argc / argv','scanf during run'],[['When supplied','Before program starts','Interactively while running'],['Scriptable','Yes — automate in shell scripts','Hard to automate'],['Error surface','Count + parse validation','Stream/format handling'],['Typical use','Tools, compilers, utilities','Teaching programs, dialogs']]],
  diag:{kind:'flow',start:'Shell splits words',condition:'argc enough?',trueAction:'Parse and validate argv values',falseAction:'Print usage, exit non-zero',end:'Run the actual task'},
  apps:['Compilers and build tools (gcc -O2 -o app main.c) are driven entirely by argv parsing.','File utilities take source/destination paths as operands and behaviour switches as flags.','Automation scripts pass environment-specific values as arguments instead of hard-coding them.'],
  quizzes:[{q:'The user runs: ./tool -v report.txt — what are argc and argv[1]?',options:['argc=2, argv[1]="-v"','argc=3, argv[1]="-v"','argc=3, argv[1]="report.txt (filename)"','argc=2, argv[1]="./tool"'],correct:1,why:'argc counts the program name too: ./tool, -v, report.txt = 3. argv[0] is ./tool, so argv[1] is -v.'},
            {q:'Why prefer strtol over atoi for argv numbers?',options:['strtol is faster','atoi only works on argv[0]','strtol can report exactly where parsing failed; atoi silently yields 0','No difference'],correct:2,why:'The end pointer distinguishes valid input from trailing junk or total garbage; atoi cannot signal any error.'}],
  take:['argc includes the program name; real arguments start at argv[1]; argv[argc] is NULL.','Always check argc before touching argv, and print usage + non-zero exit on misuse.','Arguments are text — convert with validated strtol/strtod, never trusting atoi.'],
  rev:'argc counts program name. argv[0]=program, argv[1..]=args, argv[argc]=NULL. Check argc first; parse numbers with strtol end-pointer checks.',
  assign:{p:'Write process_args(int argc, char *argv[]) that prints "name: X" when an argument looks like --name=X (hint: strncmp + pointer offset 7) and "unknown: ..." otherwise (skipping argv[0]). Test it from main with a fabricated array {"prog","--name=Riya","-x",NULL}. Expected lines: "name: Riya" and "unknown: -x".',s:`#include <stdio.h>
#include <string.h>
/* TODO: implement process_args and call it on a fake argv */
int main(void) {
    return 0;
}`,sol:`#include <stdio.h>
#include <string.h>
static void process_args(int argc, char *argv[]) {
    for (int i = 1; i < argc; i++) {
        if (strncmp(argv[i], "--name=", 7) == 0) {
            printf("name: %s\\n", argv[i] + 7);
        } else {
            printf("unknown: %s\\n", argv[i]);
        }
    }
}
int main(void) {
    char *fake[] = {"prog", "--name=Riya", "-x", NULL};
    process_args(3, fake);
    return 0;
}`}
},
];

module.exports = { topics: makeTopics(specs) };
