'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'dsa-binary-trees-traversals', course_id:'dsa', unit_id:'dsa-unit-3', order_index:1,
  title:'Binary Trees & Traversals', desc:'Build tree nodes and walk them in preorder, inorder, postorder and level order.',
  obj:['Model binary tree nodes with left/right pointers','Produce preorder/inorder/postorder sequences recursively','Compute height and node counts by structural recursion'],
  pre:['Linked lists','Recursion'],
  outcomes:['Learner navigates tree-shaped data in all standard orders'],
  def:'A binary tree is a recursive structure: each node holds data and pointers to left and right subtrees (either possibly empty/NULL). Depth-first traversals differ by when the node is visited relative to its subtrees: preorder (node, L, R), inorder (L, node, R), postorder (L, R, node); breadth-first level-order visits by depth using a queue.',
  simple:'A binary tree is a family tree where each person has at most two children, a left and a right. "Traversing" means visiting every person exactly once, and the only question is the visiting protocol. Preorder: greet the person, then tour their left family, then right. Inorder: tour left family, greet, tour right. Postorder: tour both families, greet last — perfect for cleanup (children before parent). The beautiful part: each traversal is a three-line recursive recipe, because every subtree is itself a little tree obeying the same rule. Height and counting work the same way — ask both children, combine answers.',
  hing:'Binary tree me har node ke do hisse hote hain — left child aur right child (khaali bhi ho sakte hain). Traversal matlab har node ko ek baar milna, bas, order teen mashhoor hain: Preorder (pehle NODE, phir Left, phir Right), Inorder (Left, NODE, Right), Postorder (Left, Right, NODE aakhir me). Yaad karne ki trick: "pre/in/post" batata hai NODE kab aayega — shuru me, beech me, ya aakhir me. Har traversal recursion se 3 line me banta hai kyunki har subtree khud ek chhota tree hai. Level-order (BFS) queue se level-dar-level chalta hai. Postorder khaas taur par delete karne ke kaam aata hai — bachche pehle free, parent baad me, warna bache anath ho jayenge!',
  why:'Trees model hierarchies and expressions everywhere: file systems, parse trees, DOM, decision trees. Traversal fluency gates BSTs, heaps and every tree interview problem; inorder-on-BST-yields-sorted is a landmark fact ahead.',
  when:'Preorder for copying/serialising with structure, inorder for BST-sorted output and expression infix, postorder for deletion/evaluation (children first), level order for shortest-path-in-tree and pretty printing.',
  syntax:'typedef struct TNode {\n    int data;\n    struct TNode *left, *right;\n} TNode;\nvoid inorder(TNode *r) {\n    if (!r) return;\n    inorder(r->left);  visit(r);  inorder(r->right);\n}',
  comp:[['Visit position','When the node prints relative to left/right recursion defines the order'],['Base case NULL','Empty subtree contributes nothing and stops recursion'],['Height','1 + max(height(L), height(R)), with empty = 0']],
  ex:[
   {t:'Basic: one tree, three DFS orders',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int data; struct TNode *left, *right; } TNode;
static TNode *node(int v, TNode *l, TNode *r) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->data = v; n->left = l; n->right = r; }
    return n;
}
static void preorder(TNode *r) {
    if (!r) return;
    printf("%d ", r->data);
    preorder(r->left);
    preorder(r->right);
}
static void inorder(TNode *r) {
    if (!r) return;
    inorder(r->left);
    printf("%d ", r->data);
    inorder(r->right);
}
static void postorder(TNode *r) {
    if (!r) return;
    postorder(r->left);
    postorder(r->right);
    printf("%d ", r->data);
}
int main(void) {
    TNode *root = node(1,
                        node(2, node(4, NULL, NULL), node(5, NULL, NULL)),
                        node(3, NULL, node(6, NULL, NULL)));
    printf("pre : "); preorder(root); printf("\\n");
    printf("in  : "); inorder(root); printf("\\n");
    printf("post: "); postorder(root); printf("\\n");
    return 0;
}`,out:`pre : 1 2 4 5 3 6 
in  : 4 2 5 1 3 6 
post: 4 5 2 6 3 1`,why:'Same tree, one-line differences in where printf sits. Preorder leads with each subtree root (1, then 2...); postorder ends with the overall root — the tell-tale fingerprints to read traversals by.'},
   {t:'Intermediate: structural measures by recursion',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int data; struct TNode *left, *right; } TNode;
static TNode *node(int v, TNode *l, TNode *r) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->data = v; n->left = l; n->right = r; }
    return n;
}
static int height(TNode *r) {
    if (!r) return 0;
    int lh = height(r->left), rh = height(r->right);
    return 1 + (lh > rh ? lh : rh);
}
static int count_nodes(TNode *r) {
    if (!r) return 0;
    return 1 + count_nodes(r->left) + count_nodes(r->right);
}
static int count_leaves(TNode *r) {
    if (!r) return 0;
    if (!r->left && !r->right) return 1;
    return count_leaves(r->left) + count_leaves(r->right);
}
static int sum_values(TNode *r) {
    if (!r) return 0;
    return r->data + sum_values(r->left) + sum_values(r->right);
}
int main(void) {
    TNode *root = node(10,
                        node(5, node(2, NULL, NULL), NULL),
                        node(20, node(15, NULL, NULL), node(30, NULL, NULL)));
    printf("height=%d nodes=%d leaves=%d sum=%d\\n",
           height(root), count_nodes(root), count_leaves(root), sum_values(root));
    printf("empty height=%d nodes=%d\\n", height(NULL), count_nodes(NULL));
    return 0;
}`,out:`height=3 nodes=6 leaves=3 sum=82
empty height=0 nodes=0`,why:'Every measure follows the structural template: base value for NULL, combine children recursively. Leaves (2, 15, 30) count 3; height takes the longer side plus one — the same pattern family used by nearly all tree algorithms.'},
   {t:'Advanced: level-order (BFS) with an explicit queue',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int data; struct TNode *left, *right; } TNode;
static TNode *node(int v, TNode *l, TNode *r) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->data = v; n->left = l; n->right = r; }
    return n;
}
static void level_order(TNode *root) {
    if (!root) return;
    TNode *queue[64];
    int front = 0, rear = 0;
    queue[rear++] = root;
    while (front < rear) {
        TNode *cur = queue[front++];
        printf("%d ", cur->data);
        if (cur->left) queue[rear++] = cur->left;
        if (cur->right) queue[rear++] = cur->right;
    }
}
static void free_tree(TNode *r) {
    if (!r) return;
    free_tree(r->left);
    free_tree(r->right);
    free(r);
}
int main(void) {
    TNode *root = node(1,
                        node(2, node(4, NULL, NULL), node(5, NULL, NULL)),
                        node(3, NULL, node(6, NULL, NULL)));
    level_order(root);
    printf("\\n");
    free_tree(root);
    return 0;
}`,out:`1 2 3 4 5 6`,why:'The queue discharges parents before children in FIFO order, printing level by level — the BFS of graph fame applied to trees. free_tree demonstrates postorder\'s killer app: children freed before their parent pointer vanishes.'}
  ],
  walk:[[11,'preorder(1): print 1 immediately, then dive left.','out: 1'],[12,'preorder(2): print 2, dive left to 4: print 4; its children are NULL (immediate returns). Back up, right child 5 prints.','out: 1 2 4 5'],[13,'Left subtree exhausted; root\'s right subtree: print 3, left NULL, right 6 prints.','out: ... 3 6'],[18,'inorder re-runs with printf between recursions: 4 (leftmost) prints first, the root 1 lands exactly mid-sequence.','order is printf placement']],
  walkWhy:'Recursion mirrors the tree\'s own definition; where the visit statement sits among the two recursive calls is the SOLE difference between the three classic orders.',
  rules:['NULL subtree is the universal base case: every traversal/measure begins with if (!r).','Height convention: empty=0, single node=1 (edge-counting variants exist — state yours).','Recursive depth equals tree height; degenerate (skewed) trees make depth O(n) risking stack overflow.','Freeing must be postorder — freeing a parent first strands its children\'s addresses.'],
  mistakes:[
   {t:'Skipping the NULL base case',bad:'void inorder(TNode *r) {\n    inorder(r->left);   // r may be NULL\n    ...\n}',err:'Segmentation fault',why:'Every leaf spawns two NULL children calls; without the guard the first leaf dereferences NULL immediately. Trees without base cases are not programs.',fix:'void inorder(TNode *r) {\n    if (!r) return;\n    inorder(r->left);\n    printf("%d ", r->data);\n    inorder(r->right);\n}',tip:'if (!r) return; is the reflexive first line of tree code — type it before thinking.'},
   {t:'Freeing parent before children during teardown',bad:'void clear(TNode *r) { free(r); clear(r->left); /* use-after-free */ }',why:'After free(r), r->left reads released memory: undefined behaviour, and the subtrees leak anyway when the read "works".',fix:'void clear(TNode *r) {\n    if (!r) return;\n    clear(r->left);\n    clear(r->right);\n    free(r);   // postorder: children first\n}',tip:'Destruction order = postorder, always: it is one of the traversal\'s defining applications.'}
  ],
  cmp:['Traversal decoder',['Order','Recipe','Signature tell'],[['Preorder','Node L R','Root first overall'],['Inorder','L Node R','BST yields sorted sequence'],['Postorder','L R Node','Root last; safe deletion'],['Level order','BFS by depth','Reads like the drawn tree']]],
  diag:{kind:'flow',start:'At node r',condition:'r is NULL?',trueAction:'Return (nothing to do)',falseAction:'Visit/recuse in chosen order',end:'Whole subtree processed'},
  apps:['Expression trees: inorder prints infix, postorder evaluates.','File-system walks summing sizes (postorder aggregation).','Serialising trees with preorder + null markers for exact rebuilds.'],
  quizzes:[{q:'A postorder traversal ends with which node?',options:['Leftmost leaf','The root','Rightmost leaf','Unpredictable'],correct:1,why:'Postorder visits node after both subtrees, so the overall root prints last.'},
            {q:'height(NULL)=0 and leaf=1 convention: a root with only a left child chain of 3 more nodes has height…',options:['3','4','2','7'],correct:1,why:'Four nodes on the longest root-to-leaf path: height counts nodes in this convention.'}],
  take:['One visit-line position distinguishes pre/in/post orders.','NULL base case first, always; measures combine children answers.','Level-order = queue-driven BFS; teardown = postorder.'],
  rev:'Node{L,R}. Pre NLR, In LNR, Post LRN. height=1+max(children), empty=0. BFS uses queue. Free in postorder.',
  assign:{p:'Build the tree 8(3(1,6),10(_,14)) and print its inorder sequence and height. Expected: 1 3 6 8 10 14 and height 3 (this tree is a BST — notice the sorted inorder, next topic explains).',s:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int data; struct TNode *left, *right; } TNode;
// TODO: build tree, inorder print, height, free
int main(void) { return 0; }`,sol:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int data; struct TNode *left, *right; } TNode;
static TNode *node(int v, TNode *l, TNode *r) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->data = v; n->left = l; n->right = r; }
    return n;
}
static void inorder(TNode *r) {
    if (!r) return;
    inorder(r->left);
    printf("%d ", r->data);
    inorder(r->right);
}
static int height(TNode *r) {
    if (!r) return 0;
    int lh = height(r->left), rh = height(r->right);
    return 1 + (lh > rh ? lh : rh);
}
static void free_tree(TNode *r) {
    if (!r) return;
    free_tree(r->left);
    free_tree(r->right);
    free(r);
}
int main(void) {
    TNode *root = node(8,
                        node(3, node(1, NULL, NULL), node(6, NULL, NULL)),
                        node(10, NULL, node(14, NULL, NULL)));
    inorder(root);
    printf("\\nheight=%d\\n", height(root));
    free_tree(root);
    return 0;
}`}
},
{
  id:'dsa-binary-search-tree', course_id:'dsa', unit_id:'dsa-unit-3', order_index:2,
  title:'Binary Search Trees: Insert, Search, Delete', desc:'Maintain the BST invariant for logarithmic search on balanced shapes.',
  obj:['Insert and search by BST invariant navigation','Delete across leaf/one-child/two-child cases via inorder successor','Explain degeneration to a list and the need for self-balancing (AVL/red-black)'],
  pre:['Binary trees & traversals','Binary search thinking'],
  outcomes:['Learner maintains a searchable ordered set with a BST'],
  def:'A binary search tree maintains, for every node, the invariant: all keys in its left subtree are smaller and all keys in its right subtree are larger. Search/insert descend one level per comparison — O(height). Inorder traversal yields sorted order. Without balancing, sorted inserts degenerate height to O(n).',
  simple:'A BST is a librarian\'s rule made into a tree: at every shelf (node), smaller books live to the left, bigger to the right — recursively. Searching becomes binary-search-with-pointers: compare with the current book, go left or right, never look back. Insert a newcomer by walking down as if searching and parking it at the empty slot where the search fails. Deletion has three celebrity cases: a leaf just falls off; a node with one child promotes that child; a node with two children is replaced by its next-biggest neighbour (inorder successor). The fragility: feed it already-sorted inserts and the "tree" becomes a sad straight line — a linked list wearing a tree costume — which is why real libraries use self-balancing cousins.',
  hing:'BST ka ek sunehra niyam hai: har node ke LEFT me chhoti values, RIGHT me badi values — aur ye niyam har subtree me laagu hota hai. Dhundna bilkul binary search jaisa hai: compare karo, ek taraf jao, dusri taraf bhool jao. Nayi value lagani ho to search ki tarah neeche jao, jahan khali jagah (NULL) mile wahi chipka do. Delete ke teen case sabse mashhoor hain: patta (leaf) hai to bas hata do; ek bachcha hai to use upar bandh do; do bachche hain to daayein hisse ke sabse chhote (inorder successor) ko utha kar bhar do. Ek khatra yaad rakho: agar values pehle se sorted kram me dalti jayen to ped ek seedhi lakdi (list) bann jata hai aur saari khoj O(n) ho jati hai — iska PSL ilaaj khud-balance hone wale AVL/Red-Black ped hain. Aur jaadu: BST ka inorder traversal hamesha sorted sequence deta hai!',
  why:'BSTs are the conceptual core of ordered maps/sets (std::map, TreeMap are balanced BSTs) and teach invariant-driven design. The successor-deletion and degeneration lessons generalise to every tree structure afterward.',
  when:'Use (balanced) BSTs when you need sorted order + dynamic insert/delete + predecessor/successor queries. Hash tables beat them for pure membership; sorted arrays beat them for static sets.',
  syntax:'// invariant: left < node < right (recursively)\nsearch(k): cur ? (k == cur ? found : k < cur ? go left : go right) : absent\ninsert(k): descend like search; attach at the NULL slot found',
  comp:[['BST invariant','Ordering constraint on EVERY subtree, not just the root\'s children'],['Inorder successor','Minimum of the right subtree — replacement preserving order on two-child delete'],['Height sensitivity','All operations O(h); balanced h=O(log n), degenerate h=O(n)']],
  ex:[
   {t:'Basic: building a BST by insertion order',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int key; struct TNode *left, *right; } TNode;
static TNode *new_node(int k) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->key = k; n->left = n->right = NULL; }
    return n;
}
static TNode *insert(TNode *r, int k) {
    if (!r) return new_node(k);
    if (k < r->key) r->left = insert(r->left, k);
    else if (k > r->key) r->right = insert(r->right, k);
    return r;
}
static void inorder(TNode *r) {
    if (!r) return;
    inorder(r->left);
    printf("%d ", r->key);
    inorder(r->right);
}
static int search(TNode *r, int k) {
    while (r) {
        if (k == r->key) return 1;
        r = (k < r->key) ? r->left : r->right;
    }
    return 0;
}
int main(void) {
    TNode *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) root = insert(root, keys[i]);
    inorder(root);
    printf("\\nsearch 40=%d 90=%d\\n", search(root, 40), search(root, 90));
    return 0;
}`,out:`20 30 40 50 60 70 80 
search 40=1 90=0`,why:'Insertion order sculpted a perfectly balanced tree here (50 rooted). Inorder emerges sorted — a theorem of the invariant, not a coincidence. Search discards half the remaining tree per step.'},
   {t:'Intermediate: deletion across the three cases',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int key; struct TNode *left, *right; } TNode;
static TNode *new_node(int k) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->key = k; n->left = n->right = NULL; }
    return n;
}
static TNode *insert(TNode *r, int k) {
    if (!r) return new_node(k);
    if (k < r->key) r->left = insert(r->left, k);
    else if (k > r->key) r->right = insert(r->right, k);
    return r;
}
static TNode *min_node(TNode *r) {
    while (r && r->left) r = r->left;
    return r;
}
static TNode *delete_key(TNode *r, int k) {
    if (!r) return NULL;
    if (k < r->key) r->left = delete_key(r->left, k);
    else if (k > r->key) r->right = delete_key(r->right, k);
    else {
        if (!r->left) { TNode *t = r->right; free(r); return t; }
        if (!r->right) { TNode *t = r->left; free(r); return t; }
        TNode *succ = min_node(r->right);
        r->key = succ->key;
        r->right = delete_key(r->right, succ->key);
    }
    return r;
}
static void inorder(TNode *r) {
    if (!r) return;
    inorder(r->left); printf("%d ", r->key); inorder(r->right);
}
int main(void) {
    TNode *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) root = insert(root, keys[i]);
    root = delete_key(root, 20);
    printf("after del 20 (leaf): "); inorder(root); printf("\\n");
    root = delete_key(root, 30);
    printf("after del 30 (one child): "); inorder(root); printf("\\n");
    root = delete_key(root, 50);
    printf("after del 50 (two children): "); inorder(root); printf("\\n");
    return 0;
}`,out:`after del 20 (leaf): 30 40 50 60 70 80 
after del 30 (one child): 40 50 60 70 80 
after del 50 (two children): 40 60 70 80`,why:'Deleting root 50 copied successor 60 (minimum of the right subtree) into the root, then deleted the now-duplicate 60 leaf below. Invariant and sortedness survive every case, verified by each inorder pass.'},
   {t:'Advanced: degeneration from sorted inserts',code:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int key; struct TNode *left, *right; } TNode;
static TNode *insert(TNode *r, int k) {
    if (!r) {
        TNode *n = malloc(sizeof *n);
        if (n) { n->key = k; n->left = n->right = NULL; }
        return n;
    }
    if (k < r->key) r->left = insert(r->left, k);
    else if (k > r->key) r->right = insert(r->right, k);
    return r;
}
static int height(TNode *r) {
    if (!r) return 0;
    int lh = height(r->left), rh = height(r->right);
    return 1 + (lh > rh ? lh : rh);
}
int main(void) {
    TNode *balanced = NULL, *skewed = NULL;
    int good[] = {50, 30, 70, 20, 40, 60, 80};
    int bad[] = {20, 30, 40, 50, 60, 70, 80};
    for (int i = 0; i < 7; i++) {
        balanced = insert(balanced, good[i]);
        skewed = insert(skewed, bad[i]);
    }
    printf("same keys: balanced height=%d, sorted-inserts height=%d\\n",
           height(balanced), height(skewed));
    return 0;
}`,out:`same keys: balanced height=3, sorted-inserts height=7`,why:'Identical key SET, different arrival order: increasing inserts always extend the right spine, manufacturing a 7-deep list. Search there is O(n) — the motivation for AVL/red-black rotations that restore balance after each update.'}
  ],
  walk:[[11,'Insert 40: 40 < 50 go left; 40 > 30 go right; NULL slot found — attach. Each comparison discarded an entire subtree.','path 50→30→right'],[32,'Left subtree of 50 inorders to 20 30 40 (all < 50), then 50, then the right side 60 70 80.','sorted by invariant'],[24,'search(90) descends right at 50 and 70, right at 80 → NULL, proving absence without visiting the left half at all.','3 comparisons']],
  walkWhy:'Every BST algorithm is "navigate by invariant, act at the destination"; correctness arguments always appeal to the invariant being restored before return.',
  rules:['The invariant binds SUBTREES: a node\'s key must exceed the MAXIMUM of its left subtree, not merely its left child.','Duplicate policy must be decided (reject, count field, or consistent side) — silently going one side is a policy too.','Deletion of a two-child node uses successor (or predecessor) value copy + delete of the donor node.','Unbalanced BST height is input-dependent; production ordered maps self-balance (AVL/red-black/B-tree families).'],
  mistakes:[
   {t:'Validating BST with only parent-child checks',bad:'// "check": left child < node < right child at every node\n// tree: 10 with left child 5, whose right child is 12 -> passes locally, yet 12 > 10 violates the invariant',why:'The invariant constrains each node against ALL descendants. Local checks certify impostor trees whose inorder is unsorted and searches lose keys.',fix:'// validate with (min, max) bounds passed down the recursion:\n// valid(r, lo, hi): lo < r->key < hi and recurse with tightened bounds',tip:'Equivalent check: inorder output strictly increasing. Bounds-recursion is the standard validator interview answer.'},
   {t:'Forgetting that insertion order shapes the tree',bad:'// bulk-loading a sorted export with plain BST insert',why:'Monotonic sequences build a spine of height n; the application pays linked-list costs while believing it bought a tree. The bug is in the load pattern, not any single insert.',fix:'// shuffle/median-first build, or use a self-balancing tree',tip:'Bulk builds: insert the median first recursively (or sort then build balanced directly).'}
  ],
  cmp:['BST vs sorted array vs hash set',['Need','BST (balanced)','Sorted array','Hash set'],[['Search','O(log n)','O(log n) binary search','O(1) average'],['Insert/delete','O(log n)','O(n) shifting','O(1) average'],['Sorted iteration','Native (inorder)','Native','Impossible (unordered)'],['Predecessor/successor','Yes','Yes (index)','No']]],
  diag:{kind:'flow',start:'At node with key',condition:'Target smaller?',trueAction:'Descend left subtree only',falseAction:'Descend right (or match found)',end:'NULL slot proves absence'},
  apps:['Ordered maps/sets in standard libraries (balanced variants).','Symbol tables needing sorted dumps and range scans.','Interval/priority hybrid structures layered on BST skeletons.'],
  quizzes:[{q:'Deleting a BST node with two children: the standard replacement is…',options:['Its parent','The minimum key of its right subtree (inorder successor)','Any leaf','The tree root'],correct:1,why:'The successor is the smallest key greater than the deleted one, preserving the invariant after copying it up and deleting the donor.'},
            {q:'Inorder traversal of ANY valid BST produces…',options:['Insertion order','Keys in ascending sorted order','Level order','Depends on balance'],correct:1,why:'Inorder visits left subtree (all smaller), node, right subtree (all larger) recursively — sortedness falls out structurally.'}],
  take:['Invariant first: every algorithm navigates/restores left < node < right.','Deletion: leaf/one-child promote, two-children successor transplant.','Unbalanced BSTs degenerate on sorted input — balance is a feature, not a nicety.'],
  rev:'Insert at failed-search NULL. Search discards half per level (O(h)). Delete two-child via successor (min of right). Inorder = sorted. Sorted inserts -> spine.',
  assign:{p:'Insert {8, 3, 10, 1, 6, 14, 4, 7, 13} into a BST; print inorder, then search results for 7 and 9 as "found7=1 found9=0", then delete 3 (two children) and print inorder again.',s:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int key; struct TNode *left, *right; } TNode;
// TODO: insert/search/delete/inorder driver
int main(void) { return 0; }`,sol:`#include <stdio.h>
#include <stdlib.h>
typedef struct TNode { int key; struct TNode *left, *right; } TNode;
static TNode *new_node(int k) {
    TNode *n = malloc(sizeof *n);
    if (n) { n->key = k; n->left = n->right = NULL; }
    return n;
}
static TNode *insert(TNode *r, int k) {
    if (!r) return new_node(k);
    if (k < r->key) r->left = insert(r->left, k);
    else if (k > r->key) r->right = insert(r->right, k);
    return r;
}
static int search(TNode *r, int k) {
    while (r) {
        if (k == r->key) return 1;
        r = (k < r->key) ? r->left : r->right;
    }
    return 0;
}
static TNode *min_node(TNode *r) { while (r && r->left) r = r->left; return r; }
static TNode *delete_key(TNode *r, int k) {
    if (!r) return NULL;
    if (k < r->key) r->left = delete_key(r->left, k);
    else if (k > r->key) r->right = delete_key(r->right, k);
    else {
        if (!r->left) { TNode *t = r->right; free(r); return t; }
        if (!r->right) { TNode *t = r->left; free(r); return t; }
        r->key = min_node(r->right)->key;
        r->right = delete_key(r->right, r->key);
    }
    return r;
}
static void inorder(TNode *r) {
    if (!r) return;
    inorder(r->left); printf("%d ", r->key); inorder(r->right);
}
int main(void) {
    TNode *root = NULL;
    int keys[] = {8, 3, 10, 1, 6, 14, 4, 7, 13};
    for (int i = 0; i < 9; i++) root = insert(root, keys[i]);
    inorder(root);
    printf("\\nfound7=%d found9=%d\\n", search(root, 7), search(root, 9));
    root = delete_key(root, 3);
    inorder(root);
    printf("\\n");
    return 0;
}`}
},
{
  id:'dsa-graphs-bfs-dfs', walkEx:2, course_id:'dsa', unit_id:'dsa-unit-3', order_index:3,
  title:'Graphs: Representation, BFS & DFS', desc:'Model networks with adjacency matrices/lists and traverse by breadth and depth.',
  obj:['Represent graphs as adjacency matrix and adjacency list with trade-offs','Run BFS with a queue for unweighted shortest hops','Run DFS recursively and use visited marking correctly'],
  pre:['Queues','Linked lists (adjacency)','Trees (traversal mindset)'],
  outcomes:['Learner explores connectivity problems with the two canonical traversals'],
  def:'A graph consists of vertices connected by edges (directed or undirected, weighted or not). It is stored as an adjacency matrix (O(V^2) space, O(1) edge lookup) or adjacency lists (O(V+E) space). BFS explores layer by layer with a queue yielding fewest-edge distances; DFS plunges along paths with recursion/stack.',
  simple:'A graph is a map of cities and roads: dots (vertices) joined by lines (edges). To store it, you either keep a big grid marking which pairs connect (adjacency matrix — instant "is there a road A-B?" but wasteful for sparse maps) or, for each city, a list of its direct neighbours (adjacency list — lean for real maps). Exploring has two personalities: BFS is a ripple spreading ring by ring from the start — first time it reaches a city is via the fewest roads, perfect for shortest hops. DFS is a determined hiker who follows one trail to its end before backtracking. Both must mark visited cities, or cycles will send them wandering forever.',
  hing:'Graph matlab binduon (vertices) aur unhe jodne wali lakeeron (edges) ka jaal — jaise shehron aur sadkon ka naksha. Store karne ke do tareeke hain: adjacency MATRIX (badi grid, har jodi ke liye 1/0 — turant pata chalta hai sadak hai ya nahi, lekin jagah zyada) aur adjacency LIST (har shehar ke padosiyon ki chhoti si list — aam taur par yahi sahi hai). Ghumne ke do andaz: BFS paani ki lehar jaisa — level by level phailta hai, isliye pehli baar jahan pahuche wahi sabse kam sadkon wala raasta hai (unweighted shortest path!). DFS us pagal yatri jaisa hai jo ek raaste par aakhir tak jaata hai, phir peeche hatkar dusra try karta hai. Dono me visited mark karna bhoolna matlab gol-gol ghumna pakka, kyunki graph me cycle hota hai, ped me nahi. BFS me node ko queue me daalte hi visited mark karo, nikalte waqt nahi — warna duplicate ghus jayenge!',
  why:'Graphs underlie maps, networks, dependencies, social webs and compilers. BFS/DFS are the two primitive moves from which shortest paths, connectivity, cycle detection and topological order all derive.',
  when:'Adjacency list by default (sparse reality); matrix for dense graphs or constant-time edge probes. BFS for fewest-hops and level structure; DFS for exhaustive exploration, components, cycle/toposort scaffolding.',
  syntax:'// BFS skeleton\nqueue.push(start); visited[start] = 1;\nwhile (!queue.empty()) {\n    v = queue.pop_front();\n    for (w in adj[v]) if (!visited[w]) { visited[w] = 1; dist[w] = dist[v] + 1; queue.push(w); }\n}',
  comp:[['Adjacency list','Per-vertex neighbour collections: O(V+E) space, iterate real edges'],['Mark-on-enqueue (BFS)','Prevents duplicate queue entries and preserves first-found distances'],['DFS recursion','Implicit stack dives depth-first; visited guards cycles']],
  ex:[
   {t:'Basic: adjacency matrix and degree reading',code:`#include <stdio.h>
#define V 5
int main(void) {
    int adj[V][V] = {
        {0, 1, 1, 0, 0},
        {1, 0, 0, 1, 1},
        {1, 0, 0, 1, 0},
        {0, 1, 1, 0, 1},
        {0, 1, 0, 1, 0}
    };
    printf("edge 0-1: %d, edge 0-4: %d\\n", adj[0][1], adj[0][4]);
    for (int v = 0; v < V; v++) {
        int deg = 0;
        for (int u = 0; u < V; u++) deg += adj[v][u];
        printf("vertex %d degree %d\\n", v, deg);
    }
    return 0;
}`,out:`edge 0-1: 1, edge 0-4: 0
vertex 0 degree 2
vertex 1 degree 3
vertex 2 degree 2
vertex 3 degree 3
vertex 4 degree 2`,why:'Undirected edges make the matrix symmetric (adj[a][b] == adj[b][a]); row sums give degrees. Edge existence is O(1), but visiting one vertex\'s neighbours costs a full O(V) row scan — the list trade-off in embryo.'},
   {t:'Intermediate: BFS layers and hop distances',code:`#include <stdio.h>
#define V 6
static int adj[V][V] = {
    {0, 1, 1, 0, 0, 0},
    {1, 0, 0, 1, 0, 0},
    {1, 0, 0, 1, 1, 0},
    {0, 1, 1, 0, 0, 1},
    {0, 0, 1, 0, 0, 1},
    {0, 0, 0, 1, 1, 0}
};
int main(void) {
    int visited[V] = {0};
    int dist[V];
    for (int i = 0; i < V; i++) dist[i] = -1;
    int queue[V]; int front = 0, rear = 0;
    int start = 0;
    visited[start] = 1; dist[start] = 0; queue[rear++] = start;
    printf("BFS order: ");
    while (front < rear) {
        int v = queue[front++];
        printf("%d ", v);
        for (int u = 0; u < V; u++) {
            if (adj[v][u] && !visited[u]) {
                visited[u] = 1;
                dist[u] = dist[v] + 1;
                queue[rear++] = u;
            }
        }
    }
    printf("\\ndistances from 0: ");
    for (int i = 0; i < V; i++) printf("%d:%d ", i, dist[i]);
    printf("\\n");
    return 0;
}`,out:`BFS order: 0 1 2 3 4 5 
distances from 0: 0:0 1:1 2:1 3:2 4:2 5:3`,why:'Marking visited at ENQUEUE time stamps each vertex with the distance of its first discovery — provably the fewest edges because the frontier expands uniformly. Vertex 5 needs 3 hops (0-2-4-5 or 0-1-3-5).'},
   {t:'Advanced: DFS order and connected components',code:`#include <stdio.h>
#define V 7
static int adj[V][V] = {
    {0, 1, 1, 0, 0, 0, 0},
    {1, 0, 0, 1, 0, 0, 0},
    {1, 0, 0, 0, 0, 0, 0},
    {0, 1, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 1, 0},
    {0, 0, 0, 0, 1, 0, 1},
    {0, 0, 0, 0, 0, 1, 0}
};
static int visited[V];
static void dfs(int v) {
    visited[v] = 1;
    printf("%d ", v);
    for (int u = 0; u < V; u++) {
        if (adj[v][u] && !visited[u]) dfs(u);
    }
}
int main(void) {
    int components = 0;
    for (int v = 0; v < V; v++) {
        if (!visited[v]) {
            components++;
            printf("component %d: ", components);
            dfs(v);
            printf("\\n");
        }
    }
    printf("total components = %d\\n", components);
    return 0;
}`,out:`component 1: 0 1 3 2 
component 2: 4 5 6 
total components = 2`,why:'DFS from 0 burrows 0→1→3 before backtracking to reach 2 — depth-first signature. The outer loop restarting on unvisited vertices counts islands: two disconnected groups exist, a question BFS could answer identically.'}
  ],
  walk:[[17,'Start 0 is marked and queued with dist 0. The frontier discipline now governs everything.','queue [0]'],[23,'Processing 0 discovers 1 and 2 (dist 1) — both claimed ON ENQUEUE so neither can be re-added by the other path.','queue [1, 2]'],[23,'Processing 1 finds 3 new (dist 2); processing 2 finds 4 new (3 already claimed). Vertex 5 is discovered from 3 at dist 3.','layers settle'],[30,'Queue empty = all reachable vertices visited at their minimal hop counts.','BFS complete']],
  walkWhy:'The queue orders discoveries by nondrecreasing distance — a FIFO invariant that converts plain traversal into a shortest-path algorithm for unweighted edges.',
  rules:['Mark visited when DISCOVERING (enqueue/entry), not when processing, or duplicates flood the frontier.','BFS guarantees fewest EDGES paths in unweighted graphs only; weighted needs Dijkstra.','Restart traversal from every unvisited vertex to cover disconnected graphs (component counting).','Adjacency list iteration is O(degree); matrix neighbour scan is O(V) — representation choice changes real costs.'],
  mistakes:[
   {t:'Marking visited at dequeue time in BFS',bad:'while (front < rear) {\n    v = dequeue();\n    visited[v] = 1;   // too late: v may already sit in queue twice',why:'A vertex reachable from two frontier parents gets enqueued twice before either copy is processed — wasted work and, worse, the second (possibly longer) path can overwrite distances if code reassigns them.',fix:'// mark when enqueueing neighbours, not when serving them',tip:'Distance correctness rides on claim-at-discovery; mirror the same rule in Dijkstra variants.'},
   {t:'Forgetting cycles need visited in DFS too',bad:'void dfs(int v) { for (u) if (adj[v][u]) dfs(u); }  // 0-1-0-1-0...',err:'Stack overflow (infinite mutual recursion on any cycle)',why:'Trees cannot cycle; graphs can. Every recursive step must refuse to re-enter visited vertices, or the call stack becomes the visited set — briefly.',fix:'void dfs(int v) {\n    visited[v] = 1;\n    for (u) if (adj[v][u] && !visited[u]) dfs(u);\n}',tip:'Visited-marking at function entry is the DFS mirror of BFS mark-on-enqueue.'}
  ],
  cmp:['Matrix vs list representation',['Question','Adjacency matrix','Adjacency list'],[['Space','O(V^2)','O(V + E)'],['Edge exists? (a,b)','O(1)','O(degree) scan'],['Iterate neighbours','O(V) row scan','O(degree)'],['Sweet spot','Dense, small, edge-probe heavy','Sparse, large, traversal heavy']]],
  diag:{kind:'flow',start:'Mark & queue start',condition:'Frontier empty?',trueAction:'All reachable visited at min hops',falseAction:'Dequeue, claim fresh neighbours at dist+1',end:'Repeat per component'},
  apps:['Shortest metro hops and "degrees of separation" in social graphs (BFS).','Connected components in networks/images (either traversal).','Web crawling frontiers and dependency exploration (BFS/DFS).'],
  quizzes:[{q:'BFS first discovers vertex X at distance 4. A longer route to X exists. What does BFS report?',options:['The longer one','4 — first discovery in BFS is a fewest-edges path','Depends on tie-breaks','Both'],correct:1,why:'Uniform frontier expansion guarantees vertices are claimed in nondreasing hop order.'},
            {q:'For a sparse graph with 100000 vertices and 200000 edges, the sane representation is…',options:['Adjacency matrix (10^10 cells)','Adjacency lists O(V+E)','Edge table only 2 columns, no index','Complete graph assumption'],correct:1,why:'Matrix space is quadratic in vertices; lists track only existing edges.'}],
  take:['Represent sparsely (lists) by default; matrices buy O(1) edge probes with quadratic space.','BFS + mark-on-enqueue = fewest hops; DFS + visited = exhaustive depth exploration.','Always restart traversals across components for full coverage.'],
  rev:'List O(V+E) vs matrix O(V^2). BFS queue layers + dist (unweighted shortest). DFS recursion depth. Mark visited at discovery. Loop all components.',
  assign:{p:'Using the 6-vertex matrix from the BFS example, write DFS from vertex 0 printing the visit order. Expected (with neighbours scanned in increasing order): 0 1 3 2 4 5. Then print "reachable=6".',s:`#include <stdio.h>
#define V 6
// copy the lesson matrix, recursive dfs, count reached
int main(void) { return 0; }`,sol:`#include <stdio.h>
#define V 6
static int adj[V][V] = {
    {0, 1, 1, 0, 0, 0},
    {1, 0, 0, 1, 0, 0},
    {1, 0, 0, 1, 1, 0},
    {0, 1, 1, 0, 0, 1},
    {0, 0, 1, 0, 0, 1},
    {0, 0, 0, 1, 1, 0}
};
static int visited[V];
static int reached = 0;
static void dfs(int v) {
    visited[v] = 1;
    reached++;
    printf("%d ", v);
    for (int u = 0; u < V; u++) {
        if (adj[v][u] && !visited[u]) dfs(u);
    }
}
int main(void) {
    dfs(0);
    printf("\\nreachable=%d\\n", reached);
    return 0;
}`}
},
{
  id:'dsa-dynamic-programming-intro', course_id:'dsa', unit_id:'dsa-unit-3', order_index:4,
  title:'Dynamic Programming Introduction: Memoisation & Tabulation', desc:'Turn exponential recursion into polynomial time by remembering subproblem answers.',
  obj:['Identify overlapping subproblems and optimal substructure','Convert recursion to top-down memoisation and bottom-up tables','Solve climbing-stairs/grid-paths and 0/1 knapsack in DP form'],
  pre:['Recursion & backtracking','Arrays'],
  outcomes:['Learner recognises DP-shaped problems and implements both styles'],
  def:'Dynamic programming solves problems whose optimal solutions compose from optimal subproblem solutions (optimal substructure) where subproblems repeat (overlap). Top-down memoisation caches recursive results; bottom-up tabulation fills a table in dependency order, each distinct subproblem solved once.',
  simple:'Naive Fibonacci recursion is a forgetful student re-deriving fib(3) hundreds of times inside fib(20). Dynamic programming simply says: write each answer down the first time and look it up thereafter. Top-down (memoisation) keeps the recursive shape and adds a notebook; bottom-up (tabulation) throws recursion away and fills a table from the smallest cases upward, assembly-line style. The magic is only available when (a) big answers genuinely build from smaller answers and (b) those smaller questions repeat a lot — then exponential time collapses to a single pass per distinct question. Drawing the overlapping call tree once makes the waste, and the fix, obvious forever.',
  hing:'Dynamic programming ka matlab hai — ek hi chhota sawal baar-baar hal mat karo, jawab likh kar rakh lo! Fibonacci ka purana recursion fib(3) ko sau baar dobara nikaalta hai, isiliye exponential dheema padta hai. Do tareeke: upar-se-neeche (memoisation) — recursion waisa hi, bas ek copy (cache array) me jawab save hota rahe; neeche-se-upar (tabulation) — chhote case se table bharke bade ki taraf badho. DP tab hi chalti hai jab do shartein hon: bade ka jawab chhoton se bane (optimal substructure) aur chhote sawal baar-baar dohraayein (overlapping subproblems). Pehle hamesha recursion aur chhote case (base) socho, phir "state" kya hai (kaunsi values badalti hain) — yahi table ke size ko tay karta hai. Knapsack me state hai (item index, bachi hui capacity).',
  why:'DP is the single highest-yield algorithmic idea for optimisation/counting problems — shortest paths, sequence alignment, resource allocation, text diffing. It converts "impossible in the age of the universe" recursions into milliseconds.',
  when:'Reach for DP when you can state a recurrence over a modest state space with reused subproblems. Choose memoisation when the state graph is sparse/recursion is natural; tabulation for speed, iteration order control, and space optimisations (rolling rows).',
  syntax:'// recurrence first!  ways(n) = ways(n-1) + ways(n-2), ways(0)=1\nlong solve(int n) {\n    if (n == 0) return 1;\n    if (memo[n] != -1) return memo[n];        // remembered\n    return memo[n] = solve(n-1) + solve(n-2); // compute once\n}',
  comp:[['State','Tuple of arguments that fully describes a subproblem (the memo key)'],['Recurrence','How a state\'s answer combines smaller states\' answers'],['Memoisation vs tabulation','Lazy recursive caching vs eager bottom-up table filling']],
  ex:[
   {t:'Basic: Fibonacci three ways, work measured',code:`#include <stdio.h>
static long calls_naive = 0, calls_memo = 0;
static long fib_naive(int n) {
    calls_naive++;
    if (n < 2) return n;
    return fib_naive(n - 1) + fib_naive(n - 2);
}
static long memo[64];
static long fib_memo(int n) {
    calls_memo++;
    if (n < 2) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib_memo(n - 1) + fib_memo(n - 2);
}
int main(void) {
    long rn = fib_naive(20);
    printf("naive fib(20)=%ld calls=%ld\\n", rn, calls_naive);
    for (int i = 0; i < 64; i++) memo[i] = -1;
    long rm = fib_memo(20);
    printf("memo  fib(20)=%ld calls=%ld\\n", rm, calls_memo);
    long a = 0, b = 1;
    for (int i = 2; i <= 50; i++) { long t = a + b; a = b; b = t; }
    printf("iterative fib(50)=%ld\\n", b);
    return 0;
}`,out:`naive fib(20)=6765 calls=21891
memo  fib(20)=6765 calls=39
iterative fib(50)=12586269025`,why:'(Results are stored before printing because C leaves argument evaluation order unspecified.) Identical answers, absurdly different work: 21891 naive calls re-derive the same 21 distinct values thousands of times, while memoisation visits each state a constant number of times. The two-variable iteration shows space can collapse to O(1) when only neighbours matter.'},
   {t:'Intermediate: grid paths — backtracking revisited, DP fix',code:`#include <stdio.h>
static long memo[8][8];
static int seen[8][8];
static long paths(int r, int c, int rows, int cols) {
    if (r == rows - 1 && c == cols - 1) return 1;
    if (seen[r][c]) return memo[r][c];
    long total = 0;
    if (r + 1 < rows) total += paths(r + 1, c, rows, cols);
    if (c + 1 < cols) total += paths(r, c + 1, rows, cols);
    seen[r][c] = 1;
    return memo[r][c] = total;
}
static long paths_table(int rows, int cols) {
    long dp[8][8] = {0};
    for (int r = 0; r < rows; r++) dp[r][0] = 1;
    for (int c = 0; c < cols; c++) dp[0][c] = 1;
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    return dp[rows - 1][cols - 1];
}
int main(void) {
    printf("recursion+memo 4x4 = %ld\\n", paths(0, 0, 4, 4));
    printf("tabulation    4x4 = %ld\\n", paths_table(4, 4));
    printf("tabulation    6x6 = %ld\\n", paths_table(6, 6));
    return 0;
}`,out:`recursion+memo 4x4 = 20
tabulation    4x4 = 20
tabulation    6x6 = 252`,why:'The backtracking topic counted these by exhaustive branching; here each cell\'s answer (from-top + from-left) is computed once — 16 cells, not exponential retries. Counts match binomial coefficients C(6,3)=20 and C(10,5)=252.'},
   {t:'Advanced: 0/1 knapsack by tabulation',code:`#include <stdio.h>
int main(void) {
    int weights[] = {1, 3, 4, 5};
    int values[]  = {10, 40, 50, 70};
    int n = 4, capacity = 7;
    static int dp[5][8];
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            dp[i][w] = dp[i - 1][w];
            if (weights[i - 1] <= w) {
                int take = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                if (take > dp[i][w]) dp[i][w] = take;
            }
        }
    }
    printf("best value within %d kg = %d\\n", capacity, dp[n][capacity]);
    printf("with 5 kg = %d, with 3 kg = %d\\n", dp[n][5], dp[n][3]);
    return 0;
}`,out:`best value within 7 kg = 90
with 5 kg = 70, with 3 kg = 40`,why:'State (i, w) = best using first i items within w capacity; transition = skip vs take. The optimum (items 3kg/40 + 4kg/50 = 90) emerges from optimal sub-decisions — greedy by value-density would miss it in other instances, which is why DP exists.'}
  ],
  walk:[[13,'fib_memo(20) recurses down to base cases, filling memo[2..20] on the way back up exactly once each.','each state computed once'],[12,'Any repeat request (fib(18) asked from multiple parents) short-circuits at the memo check in O(1).','39 calls total vs 21891'],[22,'The iterative form is tabulation realising only the last two table entries matter — the rolling-state optimisation.','O(1) space equivalent']],
  walkWhy:'DP\'s budget is (number of distinct states) × (work per state) — counting states, not call-tree leaves, is how you predict feasibility before writing code.',
  rules:['Define the state precisely: the arguments that make subproblems independent — everything the recurrence needs, nothing more.','Base cases must anchor the recurrence (and the memo sentinel must be unambiguously "uncomputed", e.g. -1 only when answers are >= 0, else use a seen flag).','Tabulation order must respect dependencies (smaller states before those reading them).','Not every recursion is DP-able: greedy/backtracking problems without optimal substructure stay exponential (e.g. exact TSP needs bigger machinery).'],
  mistakes:[
   {t:'Memo array colliding with a legitimate answer',bad:'// answers can be -1 (e.g. penalties), memo initialised to -1:\nif (memo[n] != -1) return memo[n];  // recomputes forever at n whose answer IS -1',why:'The "unknown" sentinel must not overlap the answer range; otherwise those states never cache and complexity quietly returns — while looking correct on small tests.',fix:'static int seen[64];\nif (seen[n]) return memo[n];\nseen[n] = 1; memo[n] = compute();',tip:'Track computation separately with a boolean grid whenever answers can be any integer.'},
   {t:'Recurrence that skips the optimal substructure check (greedy in DP clothes)',bad:'// "DP" for coin change that always takes the largest coin first',why:'Largest-first is greedy, not DP: denominations {1,3,4} for amount 6 greedily give 4+1+1 (3 coins) while 3+3 (2) is optimal. DP must try all candidate last-steps and combine optimal remainders.',fix:'dp[a] = 1 + min over coins c<=a of dp[a - c];   // every last-step considered',tip:'Write the recurrence over ALL choices for the final move; shortcuts need proofs, not hope.'}
  ],
  cmp:['Memoisation vs tabulation',['Aspect','Top-down memo','Bottom-up table'],[['Shape','Recursion + cache','Nested loops over states'],['States computed','Only reachable ones','Typically all in range'],['Order worries','Handled by recursion','You sequence dependencies'],['Space tricks','Harder (cache + stack)','Rolling rows often easy']]],
  diag:{kind:'flow',start:'Write the recurrence',condition:'Subproblems overlap?',trueAction:'Cache/tabulate each distinct state once',falseAction:'Plain recursion/backtracking suffices',end:'Cost = states × transition work'},
  apps:['Edit distance powering spell-check and diff tools.','Knapsack-style budget/resource allocation optimisations.','Route/grid counting and sequence alignment in bioinformatics.'],
  quizzes:[{q:'Naive fib(20) made 21891 calls while memoised made 39. The distinct subproblems number…',options:['21891','21 (n = 0..20)','6765','About 1000'],correct:1,why:'States are just the argument values 0..20; the exponential call tree revisited them wastefully.'},
            {q:'Knapsack state must include capacity remaining because…',options:['Tables look better square','The best choice among remaining items depends on how much room is left','Items are heavy','Recursion needs two args'],correct:1,why:'Same item suffix with different remaining capacity has different optima — capacity is part of what defines the subproblem.'}],
  take:['Recurrence first, memo/table second: state count × transition = true cost.','Sentinels must not collide with valid answers; prefer seen flags.','DP demands overlapping subproblems + optimal substructure; verify both before applying.'],
  rev:'State + recurrence + base cases. Memoise (top-down cache) or tabulate (bottom-up fill). fib calls 21891 -> 39. Knapsack state (i, w): max(skip, take).',
  assign:{p:'Climbing stairs: 1 or 2 steps at a time. Write tabulated ways(n) with ways(0)=1, ways(1)=1 and print ways(10) (= 89). Then print ways(20) (= 10946). One function, array of long.',s:`#include <stdio.h>
// TODO: bottom-up stairs DP
int main(void) { return 0; }`,sol:`#include <stdio.h>
static long ways(int n) {
    long dp[64];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}
int main(void) {
    printf("ways(10)=%ld\\n", ways(10));
    printf("ways(20)=%ld\\n", ways(20));
    return 0;
}`}
},
];

module.exports = { topics: makeTopics(specs) };
