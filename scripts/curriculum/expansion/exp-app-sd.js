'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'app-state-navigation', course_id:'app-dev', unit_id:'app-unit-1', order_index:2,
  title:'App State Management & Navigation', desc:'setState vs lifted state, Navigator stack push/pop and passing data between screens. Flutter/Dart cannot run here — study the reviewed reference code.',
  obj:['Distinguish ephemeral (local) state from app-wide state','Lift state up and pass callbacks down correctly','Navigate with a route stack (push/pop) carrying arguments'],
  pre:['Flutter widgets (previous topic)','JavaScript closures (callback intuition)'],
  outcomes:['Learner structures multi-screen apps without global-variable chaos'],
  def:'In declarative UI frameworks the interface is a function of state: rebuild follows state changes (setState in Flutter). Ephemeral state belongs to one widget; shared/app state should live above the widgets that read it ("lift state up") and flow down as parameters, with events flowing up via callbacks. Navigation manages a stack of routes via push/pop.',
  simple:'Think of your app as a screen-refreshing drawing: whenever the underlying DATA changes, the framework redraws the affected parts. Your only job is to keep the data in the right place and announce changes (setState). If just one widget cares about a value (say, whether a password field shows dots), keep it inside that widget — that is ephemeral state. If three screens care (the shopping cart), the data must live ABOVE all of them and be handed down, and children ask for changes via callbacks instead of reaching around. Navigation is a stack of pages: pushing opens a detail screen, popping returns. Master these two pictures and every framework (Flutter, React Native, SwiftUI) feels familiar.',
  hing:'App development ka dil hai STATE — matlab wo data jisse screen banti hai. Jaldi samjho: UI = f(state). Tum data badlo (setState bulao), framework screen dobara bana deta hai. Data kahan rakho ye sabse bada faisla hai: agar value sirf ek widget ki hai (jaise password dikhana hai ya chhupana), use wahi rakho. Lekin agar kai screens use karti hain (jaise cart), to data un sab ke upar wale common parent me rakho — ise "state upar uthana" (lift state up) kehte hain — aur neeche data bhijwao, badlav ke liye callback upar bhijwao. Navigation matlab screens ka stack: push karke nayi screen, pop karke wapas. Navigator.push ke saath data aage bhej sakte ho (jaise product id). setState ko build() ke andar kabhi mat bulao — loop phans jayega!',
  why:'State disorganisation is the #1 cause of unmaintainable app codebases: duplicated sources of truth, screens out of sync, mysterious rebuilds. The local-vs-lifted mental model and stack navigation are the transferable core of every modern app framework.',
  when:'Keep state as local as possible, as shared as necessary. Lift to the nearest common ancestor of readers/writers; beyond a screen or two, adopt a state library (Provider/Riverpod/Bloc or their equivalents). Use named routes/deep links as apps grow.',
  syntax:'// Flutter sketch\nclass CounterPage extends StatefulWidget { ... }\nclass _CounterPageState extends State<CounterPage> {\n  int count = 0;\n  void inc() => setState(() => count++);   // announce -> rebuild\n  // Navigator.of(context).push(MaterialPageRoute(builder: (_) => DetailsPage(id: 7)));\n}',
  comp:[['Ephemeral state','One widget\'s private concern (text-field focus, local toggle)'],['Lift state up','Move shared state to the nearest common ancestor; pass values down, callbacks up'],['Route stack','push opens, pop returns; arguments travel with the route']],
  ex:[
   {t:'Study: a setState counter (the canonical local state)',code:`import 'package:flutter/material.dart';

class CounterPage extends StatefulWidget {
  const CounterPage({super.key});
  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  void _increment() {
    setState(() => _count++);   // mutating inside setState announces the change
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(child: Text('Count: $_count',
          style: Theme.of(context).textTheme.headlineMedium)),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}`,out:`Reviewed reference (Flutter cannot run in this demo environment - no device/emulator toolchain here):
Each tap runs setState, the framework rebuilds the
page subtree, and the label shows the new count.
Mutating _count without setState changes memory but
not the screen.`,why:'build() is a pure description of UI from current state. setState both mutates and schedules the rebuild; splitting those two jobs (mutating silently) desynchronises memory and pixels — the classic first bug.'},
   {t:'Study: lifting state up with callbacks flowing down',code:`import 'package:flutter/material.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});
  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final List<String> _items = [];

  void _add(String item) => setState(() => _items.add(item));

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      ProductButtons(onAdd: _add),          // event flows UP
      CartSummary(items: _items),            // data flows DOWN
    ]);
  }
}

class ProductButtons extends StatelessWidget {
  final void Function(String) onAdd;
  const ProductButtons({super.key, required this.onAdd});
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => onAdd('Notebook'),
      child: const Text('Add Notebook'),
    );
  }
}

class CartSummary extends StatelessWidget {
  final List<String> items;
  const CartSummary({super.key, required this.items});
  @override
  Widget build(BuildContext context) =>
      Text('Items in cart: \${items.length}');
}`,out:`Reviewed reference:
Tapping the button fires the parent's _add, the single
source of truth mutates under setState, and both
children rebuild consistently from the same data.`,why:'One owner, two readers: the buttons never touch the list directly, the summary never caches its own copy. This pattern scales from setState to full state libraries without conceptual change.'},
   {t:'Study: navigation stack with arguments and results',code:`// From a list screen: open details for product 7
Future<void> openDetails(BuildContext context) async {
  final bool? bought = await Navigator.of(context).push<bool>(
    MaterialPageRoute(
      builder: (context) => DetailsPage(productId: 7),
    ),
  );
  if (bought == true) {
    // refresh list / show a snackbar back on the list screen
  }
}

class DetailsPage extends StatelessWidget {
  final int productId;
  const DetailsPage({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Product $productId')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.of(context).pop(true), // return a result
          child: const Text('Buy and go back'),
        ),
      ),
    );
  }
}`,out:`Reviewed reference:
push stacks DetailsPage over the list, carrying the
id as a constructor argument. pop(true) returns to
the awaiting caller with a typed result - screens
communicate without globals.`,why:'Constructor arguments make required data explicit and type-safe. Awaiting push turns navigation into a function call with a return value — the disciplined alternative to shared mutable statics.'}
  ],
  walk:[[13,'setState(() => _count++): the mutation happens inside the callback and the framework marks this widget dirty.','change announced'],[18,'Framework calls build() again; the Text interpolates the CURRENT _count, so pixels follow data automatically.','rebuild from state'],[21,'Note what is absent: no manual "find the label and set text" code. Declarative UI deletes that whole bug class.','UI as function of state']],
  walkWhy:'One rule explains the loop: mutate only through the framework\'s announcement API, and let build be a pure function of state — everything else is organisation.',
  rules:['Never call setState during build (or after dispose) — guard async completions with mounted checks.','Do not mutate widget constructor parameters; widgets are immutable descriptions.','Keep a single source of truth per datum; derive display values rather than copying them into multiple states.','Large apps graduate from setState to scoped state solutions (Provider/Riverpod/Bloc, Redux equivalents) — the data-down/events-up model persists.'],
  mistakes:[
   {t:'Mutating state without setState',bad:'void _increment() {\n  _count++;           // screen never updates\n}',why:'The framework redraws only when told. Direct mutation changes memory silently, so UI and data disagree until some unrelated rebuild exposes the stale-then-sudden jump.',fix:'void _increment() => setState(() => _count++);',tip:'Every state write that should show must ride inside setState (or your state library\'s equivalent announcer).'},
   {t:'Storing shared data in parallel per-screen copies',bad:'// CartScreen has its own _items; SummaryScreen has another; they drift',why:'Two sources of truth synchronise only by luck. Adds on one screen vanish on the other; debugging becomes archaeology across screens.',fix:'// lift _items above both screens; pass down + callbacks up, or use a cart store/provider',tip:'If two places must agree about a value, exactly one place may OWN it.'}
  ],
  cmp:['State placement guide',['Situation','Own it in','Why'],[['Password visibility toggle','The field widget itself','Nobody else reads it'],['Form draft across its own fields','The form (parent of fields)','Shared within one screen'],['Cart/user session across screens','App-level store/provider','Many readers, one truth'],['Server data cache','Repository/query layer','Refresh/invalidate centrally']]],
  diag:{kind:'flow',start:'New piece of data',condition:'Only one widget reads/writes?',trueAction:'Keep it local (ephemeral)',falseAction:'Lift to nearest common ancestor / store',end:'One owner; data down, events up'},
  apps:['Multi-tab apps sharing cart/session/profile state.','Master-detail flows (list → details with results).','Forms whose sections enable/disable from shared validity state.'],
  quizzes:[{q:'A value changed but the screen did not update. The most likely cause?',options:['build() is slow','State was mutated outside setState','Too many widgets','Hot reload needed'],correct:1,why:'Rebuilds are scheduled by the announcement API; silent mutation leaves pixels stale.'},
            {q:'Two sibling widgets must display the same cart total. Correct ownership?',options:['A copy in each sibling','Their nearest common ancestor (or a shared store)','A global mutable static','The build method'],correct:1,why:'Single source of truth above both readers, passed down — the lift-state-up rule.'}],
  take:['UI = f(state): mutate via setState, build stays pure.','Local if private, lifted if shared; one owner per datum.','Navigation is a stack: constructor arguments in, pop results out.'],
  rev:'setState announces rebuilds. Lift state to common ancestor; data down, callbacks up. Navigator push(args)/pop(result). Never setState in build/disposed.',
  assign:{p:'(Study) Sketch (Dart) a two-screen flow: a stateful NotesPage holding List<String> _notes and an _addNote(String) method, passing the list to a stateless NoteList child; a button pushes an AddNotePage and awaits a String result, adding it if non-null. No UI polish needed.',s:`// Study task: lifted list state + awaited navigation result`,sol:`import 'package:flutter/material.dart';

class NotesPage extends StatefulWidget {
  const NotesPage({super.key});
  @override
  State<NotesPage> createState() => _NotesPageState();
}

class _NotesPageState extends State<NotesPage> {
  final List<String> _notes = ['Buy milk'];

  Future<void> _openAdd() async {
    final String? note = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const AddNotePage()),
    );
    if (!mounted) return;              // guard async gap
    if (note != null && note.trim().isNotEmpty) {
      setState(() => _notes.add(note.trim()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notes')),
      body: NoteList(notes: _notes),
      floatingActionButton: FloatingActionButton(
        onPressed: _openAdd,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class NoteList extends StatelessWidget {
  final List<String> notes;
  const NoteList({super.key, required this.notes});
  @override
  Widget build(BuildContext context) => ListView.builder(
        itemCount: notes.length,
        itemBuilder: (context, i) => ListTile(title: Text(notes[i])),
      );
}

// AddNotePage: a TextField + Save button that calls
// Navigator.of(context).pop(controller.text);`}
},
{
  id:'app-data-networking-storage', course_id:'app-dev', unit_id:'app-unit-1', order_index:3,
  title:'Working with Data: REST APIs, JSON & Local Storage', desc:'Fetch and parse JSON safely, show loading/error states, and persist small data on-device. Flutter/Dart cannot run here — reviewed reference patterns.',
  obj:['Model JSON with typed fromJson factories instead of dynamic maps everywhere','Render loading/data/error explicitly with FutureBuilder discipline','Persist preferences with key-value storage and structured local DB appropriately'],
  pre:['State & navigation','JavaScript fetch/async (conceptual twin)'],
  outcomes:['Learner connects apps to real backends without crash-prone parsing'],
  def:'Apps typically fetch JSON over HTTPS REST APIs, decode it into typed model objects, and render one of three states (loading, data, error). Durable on-device data splits into lightweight key-value preferences (settings/tokens) and structured local databases (SQLite via packages) for queryable records.',
  simple:'Your app talking to a server is a three-act play, and most crashes come from rehearsing only the happy act. Act 1: request in flight — show a spinner, not a frozen page. Act 2: data arrived — but JSON is just text in a trench coat; parse it STRICTLY into typed objects at the border, because a missing field discovered three screens deep is a crash with a confusing address. Act 3: something failed (plane mode, 500 error) — show a human message and a retry. For saving data on the phone itself: small things (theme choice, last-opened tab) go in key-value preferences; real records (offline notes, cached orders) belong in a local database. And tokens more sensitive than settings deserve the platform keychain, not plain preferences.',
  hing:'App sarvar se data laata hai to teen halatein hamesha dikhani hain: (1) loading — ghumta hua pahiya, taki user ko lage nahi ki app atak gaya, (2) data mil gaya, (3) error — saaf shabdon me batao aur retry ka button do. Sabse badi chaal: server se aane wala JSON sirf text hai, use app ke darwaze par hi ek typed model (fromJson) me pakka bandh lo. Agar server ne ek field bhejha hi nahi aur tum teesri screen par use padhoo ge to app wahin gir jayega — isliye jaanch sarhad par karo. Phone par bachane ke liye: choti settings (dark mode on/off) SharedPreferences me, bada vyavasthit data (offline notes) SQLite jaise local database me. Login token jaise raaz plain preferences me kabhi mat rakho — uske liye secure storage (keychain) hota hai. Future ko build() me har baar mat banao, warna har rebuild par nayi network call hogi!',
  why:'Networking is where tutorials end and production begins: timeouts, malformed payloads, offline behaviour and secure persistence decide store ratings. These patterns (typed borders, tri-state UI, layered storage) are identical in native Android/iOS and React Native.',
  when:'Create the Future once (initState/repository), never inline in build. Parse centrally into models; treat all server fields as untrusted/nullable until validated. Cache thoughtfully (stale-while-revalidate) and encrypt or keychain anything credential-like.',
  syntax:'// model border\nfactory Course.fromJson(Map<String, dynamic> j) => Course(\n  id: j[\'id\'] as String,\n  title: j[\'title\'] as String? ?? \'Untitled\',\n);\n// tri-state handling is mandatory, not decorative',
  comp:[['Model boundary','fromJson factories convert untyped JSON to typed objects once, at the edge'],['Tri-state UI','Every async surface renders loading | data | error explicitly'],['Storage tiers','Preferences (small k/v), SQLite (records), secure storage (secrets)']],
  ex:[
   {t:'Study: typed model + repository fetch',code:`import 'dart:convert';
import 'package:http/http.dart' as http;

class Course {
  final String id;
  final String title;
  final int lessons;
  const Course({required this.id, required this.title, required this.lessons});

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? 'Untitled',
      lessons: (json['lessons'] as num?)?.toInt() ?? 0,
    );
  }
}

class CourseRepository {
  Future<List<Course>> fetchCourses() async {
    final uri = Uri.parse('https://api.example.com/courses');
    final res = await http.get(uri).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) {
      throw Exception('Server responded \${res.statusCode}');
    }
    final List<dynamic> raw = jsonDecode(res.body) as List<dynamic>;
    return raw
        .map((e) => Course.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}`,out:`Reviewed reference:
Network, status-check, decode and typing live in one
repository method. The rest of the app only ever sees
Course objects - never raw maps - so a server-side
field change breaks in exactly one file.`,why:'Null-tolerant field mapping with defaults keeps a slightly-drifted API from crashing the app, while the status check converts HTTP failures into catchable errors instead of parsing an error page as courses.'},
   {t:'Study: tri-state UI with a stored Future',code:`class CourseListPage extends StatefulWidget {
  const CourseListPage({super.key});
  @override
  State<CourseListPage> createState() => _CourseListPageState();
}

class _CourseListPageState extends State<CourseListPage> {
  late Future<List<Course>> _future;
  final _repo = CourseRepository();

  @override
  void initState() {
    super.initState();
    _future = _repo.fetchCourses();   // created ONCE, not in build
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Course>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Column(children: [
            const Text('Could not load courses. Check your connection.'),
            ElevatedButton(
              onPressed: () => setState(() => _future = _repo.fetchCourses()),
              child: const Text('Retry'),
            ),
          ]));
        }
        final courses = snapshot.data ?? const <Course>[];
        if (courses.isEmpty) return const Center(child: Text('No courses yet'));
        return ListView.builder(
          itemCount: courses.length,
          itemBuilder: (c, i) => ListTile(
            title: Text(courses[i].title),
            subtitle: Text('\${courses[i].lessons} lessons'),
          ),
        );
      },
    );
  }
}`,out:`Reviewed reference:
Spinner while waiting, friendly error with retry,
explicit empty state, then the list. Because the
future is stored in initState, rebuilds never
re-trigger the network call.`,why:'Four branches, zero blank-screen mysteries. Creating the future inside build() is a notorious bug: every rebuild fires a fresh request, flickering the spinner forever and hammering the API.'},
   {t:'Study: persisting preferences and knowing the tiers',code:`import 'package:shared_preferences/shared_preferences.dart';

class Prefs {
  static const _darkKey = 'dark_mode';
  static const _lastTabKey = 'last_tab';

  static Future<void> setDark(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkKey, value);
  }

  static Future<bool> isDark() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_darkKey) ?? false;   // default when unset
  }

  static Future<void> setLastTab(int index) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_lastTabKey, index);
  }
}

// Tier guide:
// - SharedPreferences: theme, last tab, onboarding seen (small primitives).
// - SQLite (drift/sqflite): notes, orders, offline cache - queryable rows.
// - Secure storage (Keychain/Keystore): auth tokens, refresh secrets.`,out:`Reviewed reference:
Settings survive app restarts via tiny key-value
writes. The same file documents what must NOT go
here - records needing queries (use SQLite) and
tokens (use platform secure storage, never prefs).`,why:'Right data in the right tier is both a performance and a security decision: preferences are plaintext XML/plist on disk; anything an attacker with device access should not read belongs in Keychain/Keystore-backed storage.'}
  ],
  walk:[[11,'fromJson reads each field defensively: missing title becomes "Untitled", numeric lessons coerced — the app makes ONE decision about bad data, at the border.','typed border'],[23,'Non-200 becomes an exception BEFORE decoding: parsers fed error HTML produce misleading crashes otherwise.','status checked first'],[26,'Only now does jsonDecode run, and maps immediately become Course objects — dynamic maps never leak into UI code.','maps contained']],
  walkWhy:'The repository is a customs checkpoint: verify status, decode cargo, stamp types — afterwards the whole app travels on safe objects.',
  rules:['Never create futures/fetches in build(): every rebuild refetches. Store in initState or a state/repository layer.','Guard `setState` after awaits with mounted checks; users navigate away mid-request.','Timeouts and status checks are mandatory; do not parse error bodies as success payloads.','Secrets never in SharedPreferences/UserDefaults plain storage — use platform secure storage.'],
  mistakes:[
   {t:'Fetching inside build()',bad:'Widget build(context) {\n  return FutureBuilder(future: repo.fetchCourses(), ...);  // new call per rebuild\n}',why:'build runs on every parent rebuild, theme change, keyboard pop — each spawns a fresh future, resetting FutureBuilder to waiting. Users see endless spinner flicker; the server sees a self-inflicted DDoS of one.',fix:'late Future<List<Course>> _future;\ninitState() { _future = repo.fetchCourses(); }  // once',tip:'If a FutureBuilder flickers, hunt for its future being born inside build first.'},
   {t:'Force-unwrapping server fields deep in the UI',bad:'Text(courseJson[\'title\']!)   // null title -> crash on someone\'s phone at midnight',why:'APIs evolve independently of shipped app versions. A field renamed or nulled server-side becomes a production crash distributed to every installed build simultaneously.',fix:'title: json[\'title\'] as String? ?? \'Untitled\'   // absorbed at the model boundary',tip:'Crashes should be impossible-by-construction at the border: default, drop or error-state — never trust.'}
  ],
  cmp:['Storage tiers',['Data','Store in','Never in'],[['Theme/onboarding flags','Key-value preferences','—'],['Offline notes/orders (queryable)','SQLite (drift/sqflite)','Preferences as giant JSON blobs'],['Images/files','App documents/cache dirs','Databases (store paths instead)'],['Auth/refresh tokens','Keychain/Keystore secure storage','Plain preferences/logs']]],
  diag:{kind:'flow',start:'Need server data',condition:'Future stored once?',trueAction:'Render loading -> data / error / empty',falseAction:'Move creation to initState/repository',end:'Typed models only beyond border'},
  apps:['Course/news feeds with offline-tolerant tri-state lists.','E-commerce catalogues cached in local DB.','Settings screens persisting theme/language instantly.'],
  quizzes:[{q:'Why must the Future be created in initState rather than build?',options:['initState is faster','build re-runs on rebuilds, re-firing the request and resetting the UI','Lint preference only','Threads'],correct:1,why:'Each rebuild constructing a new future restarts loading forever — the canonical FutureBuilder flicker bug.'},
            {q:'An auth refresh token belongs in…',options:['SharedPreferences','A String constant','Platform secure storage (Keychain/Keystore)','SQLite notes table'],correct:2,why:'Preferences are plaintext on disk; credential material needs OS-backed encrypted storage.'}],
  take:['Tri-state (plus empty) UI is the whole contract of async screens.','Models at the border; dynamic JSON never reaches widgets.','Match storage tier to data: prefs, SQLite, secure enclave.'],
  rev:'repo.fetch -> status check -> jsonDecode -> fromJson models. Future in initState, mounted guards. Prefs=small, SQLite=records, secure storage=tokens.',
  assign:{p:'(Study) Write a UserProfile model (id String, name String default "Student", points int default 0) with fromJson, plus a repository method future that GETs https://api.example.com/me with a 10s timeout, throws on non-200, and returns the model. Show the FutureBuilder branch order you would use (waiting/error/data) in a short comment.',s:`// Study task: model + repository + tri-state branch order`,sol:`import 'dart:convert';
import 'package:http/http.dart' as http;

class UserProfile {
  final String id;
  final String name;
  final int points;
  const UserProfile({required this.id, required this.name, required this.points});

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id']?.toString() ?? '',
        name: json['name'] as String? ?? 'Student',
        points: (json['points'] as num?)?.toInt() ?? 0,
      );
}

class ProfileRepository {
  Future<UserProfile> fetchMe() async {
    final uri = Uri.parse('https://api.example.com/me');
    final res = await http.get(uri).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) {
      throw Exception('Profile request failed: \${res.statusCode}');
    }
    final map = jsonDecode(res.body) as Map<String, dynamic>;
    return UserProfile.fromJson(map);
  }
}

// FutureBuilder branch order in the page:
// 1) connectionState == waiting  -> progress indicator
// 2) snapshot.hasError           -> message + retry button (recreate future under setState)
// 3) else                        -> render snapshot.data! fields (typed UserProfile)
`}
},
{
  id:'sd-caching-strategies', course_id:'system-design', unit_id:'sd-unit-1', order_index:2,
  title:'Caching: Strategies, Eviction & Invalidation', desc:'Speed reads with caches while surviving staleness and thundering herds (JS simulations you can run).',
  obj:['Compare cache-aside, write-through and TTL-based freshness','Simulate LRU eviction with a Map\'s insertion order','Reason about invalidation, stampedes and when NOT to cache'],
  pre:['Scaling & load balancing fundamentals','Hashing basics (DSA): map behaviour'],
  outcomes:['Learner places caches deliberately and can predict their failure modes'],
  def:'A cache stores copies of expensive-to-get data in faster storage near consumers (browser, CDN, in-process, Redis). Reads consult the cache first (hit) or fall through to the source (miss). Bounded size forces eviction policies such as LRU; correctness demands an invalidation story (TTL expiry, explicit purge, write-through updates).',
  simple:'A cache is your desk drawer versus the warehouse across town: keep the few sheets you grab all day within arm\'s reach, fetch the rest when needed. The maths is seductive — if 95% of requests hit the drawer, the warehouse (database) suddenly handles 20x less traffic. But two gremlins live here. Gremlin one: the drawer copy can go stale when the warehouse original changes — hence TTL expiry ("trust copies for 60 seconds") or writing updates into both places. Gremlin two: when a popular sheet expires, a hundred people sprint to the warehouse at once (a stampede) unless one fetcher restocks for everyone. And the drawer is finite: eviction policies like LRU toss the least-recently-touched sheet first. The runnable simulations below let you measure all of this instead of just believing it.',
  hing:'Cache matlab tez jagah par data ki copy rakhna — jaise daftar ki mez par rakhi copy, taaki baar baar godam (database) na jaana pade. Faaayda seedha hai: 95% request cache se milein to database par bhoj 20 guna kam! Lekin do dikkat hain. Pehli, BAASI data (stale): asli data badal jayega to copy purani pad jayegi. Ilaaj: TTL lagao (60 second me copy expire) ya likhte samay cache bhi update karo (write-through). Dusri dikkat bheed (stampede): lokpriy data expire hote hi sau log ek saath database par toot padte hain — ek ko bhejo, baaki intezaar karen, aisi vyavastha chahiye. Aur cache ki jagah seemit hai, isliye LRU niti: jo sabse purani baar istemal hua, wo pehle bahar. Neeche ke chalne wale examples me tum khud hit-rate gin sakte ho!',
  why:'"Should we cache this?" is asked in every design review (and interview). Getting hit rates, staleness windows and stampede behaviour right separates systems that absorb viral spikes from those that melt their own database at peak fame.',
  when:'Cache read-heavy, slowly-changing, recomputation-expensive data with an explicit freshness budget (TTL or event purge). Avoid caching strongly-consistent money paths, per-user volatile data without thought, and never treat a cache as the system of record.',
  syntax:'// cache-aside read path\nv = cache.get(key)\nif (v === undefined) { v = db.get(key); cache.set(key, v, ttl); }\nreturn v',
  comp:[['Hit rate','Fraction served from cache; benefit scales nonlinearly near 1'],['TTL','Time-to-live expiry bounding worst-case staleness'],['LRU eviction','Evict least recently used when capacity binds']],
  ex:[
   {t:'Basic: cache-aside measured (hits absorb 90% of load)',code:`const db = new Map();
for (let i = 1; i <= 5; i++) db.set('user:' + i, { name: 'user' + i });
let dbReads = 0;
function dbRead(key) { dbReads++; return db.get(key); }

const cache = new Map();
function readUser(id) {
  const key = 'user:' + id;
  if (cache.has(key)) return cache.get(key);
  const value = dbRead(key);
  cache.set(key, value);
  return value;
}

const requests = [1, 2, 3, 1, 2, 1, 3, 4, 1, 2, 5, 1, 4, 2, 3, 1, 5, 2, 4, 1];
for (const id of requests) readUser(id);
const total = requests.length;
console.log('requests=' + total + ' dbReads=' + dbReads +
            ' hits=' + (total - dbReads) +
            ' hitRate=' + ((total - dbReads) / total * 100).toFixed(0) + '%');`,out:`requests=20 dbReads=5 hits=15 hitRate=75%`,why:'Five distinct keys across twenty requests: the cache converges to one DB read per key. Real traffic skews even harder (a few hot keys dominate), which is why measured hit rates in production reach the nineties.'},
   {t:'Intermediate: LRU eviction with Map ordering',code:`class LruCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);            // reinsert => most recently used
    return v;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;  // least recently used
      this.map.delete(oldest);
    }
  }
  keys() { return [...this.map.keys()].join(','); }
}

const c = new LruCache(3);
c.set('a', 1); c.set('b', 2); c.set('c', 3);
console.log('after abc:', c.keys());
c.get('a');
console.log('after get a:', c.keys());
c.set('d', 4);
console.log('after set d (b evicted):', c.keys());`,out:`after abc: a,b,c
after get a: b,c,a
after set d (b evicted): c,a,d`,why:'JavaScript Maps preserve insertion order, so delete+set implements recency refresh in O(1) — the textbook hashmap+doubly-linked-list design reduced to three lines. b is evicted because touching a made b the least recent.'},
   {t:'Advanced: TTL staleness and stampede intuition (simulated clock)',code:`let nowMs = 0;
const source = { price: 100 };
let upstreamLoads = 0;

const entry = { value: null, expiresAt: 0 };
function readPrice(ttlMs) {
  if (entry.value === null || nowMs >= entry.expiresAt) {
    upstreamLoads++;
    entry.value = source.price;
    entry.expiresAt = nowMs + ttlMs;
    return { value: entry.value, fresh: true };
  }
  return { value: entry.value, fresh: false };
}

console.log('t=0 read:', JSON.stringify(readPrice(1000)));
source.price = 120;                       // source of truth changes
nowMs = 500;
console.log('t=500 read (stale window):', JSON.stringify(readPrice(1000)));
nowMs = 1500;
console.log('t=1500 read (expired):', JSON.stringify(readPrice(1000)));
console.log('upstreamLoads=' + upstreamLoads);`,out:`t=0 read: {"value":100,"fresh":true}
t=500 read (stale window): {"value":100,"fresh":false}
t=1500 read (expired): {"value":120,"fresh":true}
upstreamLoads=2`,why:'TTL makes staleness a KNOWN, bounded quantity (worst case 1000ms here) rather than a mystery. At expiry in real systems, thousands of readers may miss simultaneously — request coalescing (single-flight) lets one reload serve all waiters.'}
  ],
  walk:[[9,'First encounter of user:1 — cache.has is false, so the DB pays and the cache stores (the only expensive read this key will ever need absent expiry/eviction).','cold miss'],[9,'Every later user:1 request exits at the has() branch; dbReads never moves again for warm keys.','warm hits'],[16,'Accounting at the end: hits are simply requests minus DB reads — measurable, not asserted.','evidence printed']],
  walkWhy:'Cache value is an arithmetic claim (work avoided per unit memory + staleness tolerated). Counting both sides turns hand-waving into engineering.',
  rules:['Never let cached data be the only copy: caches are disposable by definition.','Every cached read needs a freshness contract: TTL, explicit invalidation, or write-through — one of them, written down.','Key design includes every input that changes the value (tenant, locale, version) — collisions leak data across users.','Size for hit-rate knee, not infinity: measure misses by key before buying RAM.'],
  mistakes:[
   {t:'Caching without an invalidation plan',bad:'cache.setForever("product:" + id, row)   // price updates never appear',why:'"There are only two hard things..." — stale-forever entries guarantee user-visible wrongness precisely on the hot items you cached. TTL or purge-on-write must exist before the first set().',fix:'cache.set("product:" + id, row, { ttlSeconds: 60 })  // plus delete on update',tip:'Decide the maximum tolerable staleness in the product meeting; encode it as TTL/purge in the same PR as the cache itself.'},
   {t:'Cache stampede at hot-key expiry',bad:'// TTL expires on a viral key; 10,000 concurrent misses all query the DB',why:'The cache that protected the DB becomes the mechanism of its synchronised overload — a spike shaped exactly like your peak traffic, arriving at the worst moment.',fix:'// single-flight: one requester reloads, others await its promise / serve just-stale briefly',tip:'Request coalescing, probabilistic early refresh, or serve-stale-while-revalidate — pick one before the key goes viral.'}
  ],
  cmp:['Cache write strategies',['Strategy','Write path','Freshness'],[['Cache-aside','App writes DB, deletes/expires cache','Stale up to TTL; simple & fault-tolerant'],['Write-through','Write cache + DB together','Fresh reads; write latency cost'],['Write-behind','Cache now, DB asynchronously','Fast writes; durability risk on crash'],['TTL-only','Expire and refetch lazily','Bounded stale; stampede-prone']]],
  diag:{kind:'flow',start:'Read request arrives',condition:'Cache hit & fresh?',trueAction:'Return cached value (fast path)',falseAction:'Load source once (coalesced), populate, return',end:'Track hit rate & staleness'},
  apps:['Session/product/catalogue reads behind Redis in the stack you already run.','CDN edge caching of static assets and public pages.','API response caching for expensive aggregations with short TTLs.'],
  quizzes:[{q:'A price is cached with TTL 30s and the DB price changes now. Worst-case staleness for readers is…',options:['Forever','About 30 seconds (until expiry)','Zero','One hour'],correct:1,why:'TTL bounds the stale window by construction; entries refresh after expiry on next read.'},
            {q:'LRU evicts which entry when full?',options:['Least recently USED','Least frequently large','Random','Newest'],correct:0,why:'Least Recently Used: recency is refreshed on every get/set, as the Map simulation showed.'}],
  take:['Hit rate is measurable arithmetic; staleness must be a chosen bound, not a surprise.','LRU bounds memory by recency; keys must encode every varying dimension.','Plan stampede defences before the hot key exists.'],
  rev:'Cache-aside: get, miss->load+set. TTL bounds staleness. LRU via recency ordering. Single-flight vs stampedes. Cache is never the record.',
  assign:{p:'Extend the LRU simulation: capacity 2; set x, set y, get x, set z; print keys after each step as "x,y", then "y,x", then "x,z" (y evicted). Reuse the class pattern from the lesson.',s:`// Reuse an LRU cache class (Map-backed) and drive the sequence above.`,sol:`class LruCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
  keys() { return [...this.map.keys()].join(','); }
}
const c = new LruCache(2);
c.set('x', 1); c.set('y', 2);
console.log(c.keys());
c.get('x');
console.log(c.keys());
c.set('z', 3);
console.log(c.keys());`}
},
{
  id:'sd-load-balancing-scaling', course_id:'system-design', unit_id:'sd-unit-1', order_index:3,
  title:'Load-Balancing Algorithms & Consistent Hashing', desc:'Spread work across servers and keys across shards with runnable simulations.',
  obj:['Simulate round-robin and least-connections distribution','Explain statelessness as the enabler of horizontal scaling','Show why consistent hashing limits key movement when nodes change'],
  pre:['Caching strategies','Hashing basics (DSA)'],
  outcomes:['Learner reasons quantitatively about spreading load and rebalancing'],
  def:'Load balancers distribute requests across a pool of servers (round-robin, least connections, weighted, hash-based). Horizontal scaling adds more (stateless) servers; vertical scaling enlarges one. Consistent hashing maps keys and servers onto a hash ring so adding/removing a server remaps only ~1/n of keys instead of nearly all.',
  simple:'One waiter serving a packed restaurant queue melts down; ten waiters with a host assigning tables scales. The host is the load balancer, and its assignment strategy matters: deal tables in rotation (round-robin) or send each party to the currently least-busy waiter (least connections) when some dinners linger. The trick that makes adding waiters easy: any waiter can serve any table because the ORDER PAD lives centrally — stateless servers, shared state elsewhere (DB/cache). A trickier puzzle appears when DATA itself must be spread across machines (sharding/caches): naive hash(key) mod n reshuffles almost everything when n changes — catastrophic. Consistent hashing places servers on a ring and assigns each key to the next server clockwise, so one new server only steals its new arc\'s keys. The simulations below make the difference countable.',
  hing:'Ek akela server bheed me phans jata hai, isliye kai server lagakar beech me Load Balancer bithate hain — jaise restaurant ka host jo guests ko khaali waiter ke paas bhejta hai. Do tareeke mashhoor hain: round-robin (baari baari sabko bhejo) aur least-connections (jo server abhi khaali hai, waha bhejo) — jab kuch request dheere chalte hain, dusra tarika behtar hai. Server badhana (horizontal scaling) tab aasan hai jab server apne paas data yaad na rakhe (stateless); data database/cache me rahe. Data ko bhi kai machineon me baantna padhe to hash(key) % n wala purana tareeka jaise hi n badla, takreeban saari keys idhar udhar kar deta hai — badi museebat! Consistent hashing me server ek gole (ring) par baithe hote hain, har key ghadi ki disha me pehle server ko milti hai; naya server juda to sirf uske hisse ki keys hilti hain. Neeche simulation gin bhi raha hai!',
  why:'Every system in this course (course platform included) meets the moment one box is not enough. Balancer algorithms, statelessness and sharding math are the core vocabulary of that meeting — and consistent hashing is a perennial interview favourite precisely because the naive answer fails so visibly.',
  when:'Default to stateless app tiers behind a balancer: round-robin for uniform requests, least-connections for long/variable ones, health checks always. Shard hot data only when one node truly binds; use consistent hashing (often with virtual nodes) for caches/config-driven routing.',
  syntax:'// routing sketches\nroundRobin:  server = pool[i++ % pool.length]\nleastConn:   server = argmin(activeConnections)\nring:        server = first ring point clockwise from hash(key)',
  comp:[['Stateless tier','App servers hold no per-user memory; any instance serves any request'],['Health checks','Balancer probes servers and drains the sick automatically'],['Virtual nodes','Many ring points per server smoothing arc-size randomness']],
  ex:[
   {t:'Basic: round-robin vs least-connections on uneven jobs',code:`function simulate(strategy, jobs, servers) {
  const ends = servers.map(() => 0);     // when each server becomes free
  let rr = 0;
  let maxEnd = 0;
  for (const dur of jobs) {
    let idx;
    if (strategy === 'rr') {
      idx = rr % servers.length;
      rr++;
    } else {
      idx = 0;
      for (let i = 1; i < ends.length; i++) if (ends[i] < ends[idx]) idx = i;
    }
    ends[idx] += dur;                    // queue behind its current work
    if (ends[idx] > maxEnd) maxEnd = ends[idx];
  }
  return { ends, makespan: maxEnd };
}

const jobs = [10, 1, 1, 1, 1, 1, 1, 1, 1, 1];
console.log('round-robin:', JSON.stringify(simulate('rr', jobs, ['A', 'B', 'C'])));
console.log('least-conn :', JSON.stringify(simulate('lc', jobs, ['A', 'B', 'C'])));`,out:`round-robin: {"ends":[13,3,3],"makespan":13}
least-conn : {"ends":[10,5,4],"makespan":10}`,why:'One long job (10) exposes round-robin\'s blindness: it keeps assigning by rotation, stacking three more jobs behind the busy server. Least-connections routes around the swamp and finishes the whole batch sooner (13 vs 10) on identical hardware.'},
   {t:'Intermediate: naive modulo sharding collapses on resize',code:`function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const keys = [];
for (let i = 1; i <= 20; i++) keys.push('key' + i);

function movedCount(fromN, toN) {
  let moved = 0;
  for (const k of keys) {
    if (hash(k) % fromN !== hash(k) % toN) moved++;
  }
  return moved;
}
console.log('4 -> 5 servers, keys moved:', movedCount(4, 5), '/ 20');
console.log('5 -> 6 servers, keys moved:', movedCount(5, 6), '/ 20');`,out:`4 -> 5 servers, keys moved: 16 / 20
5 -> 6 servers, keys moved: 20 / 20`,why:'The disaster in numbers: adding ONE server relocates 80-100% of keys — cache hits vanish globally, DB shards rebalance wholesale. Modulus ties every key to the exact pool size.'},
   {t:'Advanced: consistent-hash ring moves only the new arc',code:`function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function ownerOf(key, serverPoints) {
  const p = hash(key);
  const sorted = [...serverPoints].sort((a, b) => a.point - b.point);
  for (const s of sorted) if (s.point >= p) return s.name;
  return sorted[0].name;   // wrap around the ring
}
const ring4 = ['A', 'B', 'C', 'D'].map(n => ({ name: n, point: hash('node' + n) }));
const ring5 = [...ring4, { name: 'E', point: hash('nodeE') }];
const keys = [];
for (let i = 1; i <= 20; i++) keys.push('key' + i);
let moved = 0;
for (const k of keys) {
  if (ownerOf(k, ring4) !== ownerOf(k, ring5)) moved++;
}
console.log('ring 4 -> 5 servers, keys moved:', moved, '/ 20');
console.log('ring points A..E:', ring5.map(s => s.name + '@' + s.point).join(' '));`,out:`ring 4 -> 5 servers, keys moved: 1 / 20
ring points A..E: A@127 B@128 C@129 D@130 E@131`,why:'E claims only the arc between D (130) and itself (131): 1 of 20 keys changes owner versus 16-20 under modulo. Notice these toy points also cluster together — precisely why production rings add 100-200 virtual points per server to smooth arc sizes (try hashing node names with suffixes and watch them scatter).'}
  ],
  walk:[[8,'The 10-unit job lands on server A first; under round-robin, rotation later deals jobs 4, 7, 10 back to A anyway — queueing behind the big job.','A swamps to 13'],[12,'Least-connections checks current backlog (ends) each time: A is skipped until others catch up, so the nine 1-unit jobs spread over B and C.','makespan 10'],[17,'Makespan (when the last server finishes) prices the policy difference: smarter routing, same hardware, 23% faster drain.','same iron, better brain']],
  walkWhy:'Balancing is queuing theory with production consequences: assignment policy is a latency decision even before any server is bought.',
  rules:['Balancers must health-check and drain: a dead server in rotation is failed requests by design.','Sticky sessions fight statelessness — externalise session state (cache/DB) and keep any-instance-serves-any-request true.','Prefer not sharding until a measured bottleneck binds; replicas and indexes postpone it cheaply.','Virtual nodes in consistent hashing are essentially required for balanced arcs with few physical nodes.'],
  mistakes:[
   {t:'Stateful app servers behind a balancer',bad:'// login keeps the user session in server memory; next request lands on a sibling -> randomly logged out',why:'The pool only scales when requests are fungible. In-memory sessions weld users to instances, so deploys and autoscaling evictions log people out and sticky hacks follow.',fix:'// sessions in Redis/DB or signed tokens; servers stay interchangeable',tip:'Test by killing any instance mid-traffic: user impact should be "nothing noticed".'},
   {t:'Modulo sharding into a growable cache tier',bad:'server = caches[hash(key) % caches.length]',why:'Every pool resize invalidates the cache almost entirely (90% in the simulation), thundering the database precisely when you scaled to relieve it.',fix:'// consistent hashing ring with virtual nodes per cache server',tip:'Any h(key) % N addressing scheme is a time bomb with N in its blast radius.'}
  ],
  cmp:['Balancer policies',['Policy','Chooses','Shines when'],[['Round-robin','Next in rotation','Uniform, short requests'],['Least connections','Fewest in-flight','Variable/long requests'],['Weighted','Rotation by capacity weights','Mixed hardware'],['IP/hash sticky','Same client → same server','Legacy stateful apps (escape hatch)']]],
  diag:{kind:'flow',start:'Request at balancer',condition:'Requests uniform & stateless?',trueAction:'Round-robin across healthy pool',falseAction:'Least-connections; fix statefulness',end:'Scale pool out, watch tail latency'},
  apps:['API gateways/front proxies (NGINX/ALB class) fronting app fleets.','Memcached/Redis cluster client-side consistent hashing.','Database sharding keys for multi-tenant SaaS.'],
  quizzes:[{q:'Consistent hashing\'s headline property when a node joins is…',options:['All keys move','Only ~1/n of keys (the new node\'s arc) move','No keys ever move','Keys double'],correct:1,why:'The newcomer claims only the ring arc preceding its point; other assignments are untouched.'},
            {q:'Users randomly lose sessions after you add a second app server. Root cause?',options:['Load balancer brand','Sessions stored in per-server memory (stateful tier)','Round-robin itself','Too much RAM'],correct:1,why:'Requests landing on a sibling instance lack the session; externalise state so any instance can serve.'}],
  take:['Policies are measurable: simulate before you swear by one.','Stateless tiers + health checks make horizontal scaling boring (good).','Mod-N addressing self-destructs on resize; rings move ~1/n keys.'],
  rev:'Round-robin rotates; least-conn avoids swamps. Stateless app tier. Consistent hashing: keys -> next ring point; vnodes smooth arcs; resize moves ~K/n.',
  assign:{p:'Simulate round-robin vs least-connections for jobs [5,2,2,2] on 2 servers and print both makespans (expected rr=9, lc=7). Implement a small function computing final per-server end times for a strategy flag.',s:`// Compute makespans for rr vs lc on jobs [5,2,2,2], 2 servers`,sol:`function makespan(strategy, jobs, n) {
  const ends = new Array(n).fill(0);
  let rr = 0;
  for (const dur of jobs) {
    let idx;
    if (strategy === 'rr') {
      idx = rr % n;
      rr++;
    } else {
      idx = 0;
      for (let i = 1; i < n; i++) if (ends[i] < ends[idx]) idx = i;
    }
    ends[idx] += dur;
  }
  return Math.max(...ends);
}
console.log('rr makespan=' + makespan('rr', [5, 2, 2, 2], 2));
console.log('lc makespan=' + makespan('lc', [5, 2, 2, 2], 2));`}
},
{
  id:'sd-queues-rate-limiting', walkEx:2, course_id:'system-design', unit_id:'sd-unit-1', order_index:4,
  title:'Queues, Backpressure & Rate Limiting', desc:'Decouple bursts from workers and protect services with token budgets (runnable simulations).',
  obj:['Model producer/queue/consumer smoothing of bursty arrivals','Implement token-bucket rate limiting with a simulated clock','Explain backpressure, dead-letter queues and at-least-once delivery'],
  pre:['Load balancing & scaling','Queues (DSA)'],
  outcomes:['Learner designs graceful overload behaviour instead of cliff-edge failures'],
  def:'Message queues buffer work between producers and consumers, decoupling arrival spikes from processing capacity. Backpressure signals producers to slow when queues saturate. Rate limiting caps accepted requests per client/time — commonly a token bucket refilling at a steady rate, admitting bursts up to bucket capacity.',
  simple:'Imagine a famous food stall at lunch. Without a queue, a sudden crowd of 100 shouting customers overwhelms the cook — orders get lost, everyone leaves angry. With a token line, customers take numbers and the cook keeps cooking at full steady speed; the queue absorbs the burst, and if the line is too long, honest backpressure says "40 minutes" upfront instead of pretending. Rate limiting is the bouncer with tokens refilling steadily: you may burst a few requests quickly, but your long-run average is capped — that is how APIs stay fair when one client\'s script goes rogue. The runnable models below show queue smoothing and a token bucket deciding accept/reject over a scripted timeline.',
  hing:'Queue ka kaam hai producer (kaam bhejne wala) aur consumer (kaam karne wala) ke beech ek line laga dena, taaki achanak bheed aaye to system gire nahi. Jaise dophar me mashhoor thele par bheed — tokri (queue) hogi to cook apni raftaar se banata rahega, graahak line me ruke rahenge. Line bahut lambi ho jaye to producer ko pehle se rokna/slow karna backpressure hai — girne se accha hai imaandaari se mana ya intezaar! Rate limiting ek token wali tokri hai: tokens dheere dheere bharte rehte hain, her request ek token khaati hai. Token khatm to 429 wala saaf inkaar. Isse ek musibati client poore server ko nahi gherta. Aur jo message baar baar fail ho use alag "dead letter" queue me rakho, taaki line na ruke. Neeche wala token bucket code samay (clock) ghuma kar gin bhi raha hai!',
  why:'Bursts, retries and one misbehaving client are normal weather in production. Queues + backpressure + rate limits convert them from outages into maths: bounded memory, predictable latency, fair shares — the difference between degrading and dying.',
  when:'Queue anything slow/optional (email, reports, video), size workers by measured drain rate, expose queue depth as the scaling signal. Rate-limit public APIs per key with token buckets; return 429 + retry hints. Dead-letter poison messages after N attempts with idempotent handlers.',
  syntax:'// token bucket (per client)\ntokens = min(capacity, tokens + refillPerSec * elapsed)\nallow = tokens >= 1 ? (tokens--, true) : false   // else HTTP 429',
  comp:[['Backpressure','Upstream slows/stops producers when buffers saturate instead of OOM-crashing'],['At-least-once','Queues may redeliver; consumers must be idempotent'],['Dead-letter queue','Parking lot for repeatedly failing messages awaiting human/tool inspection']],
  ex:[
   {t:'Basic: a queue smoothing a burst (discrete-time model)',code:`// Each tick: arrivals join the queue, workers complete up to 3 jobs.
const arrivalsPerTick = [0, 12, 0, 0, 0, 0, 2, 0];
const capacityPerTick = 3;
let queue = 0;
let done = 0;
arrivalsPerTick.forEach((arrivals, tick) => {
  queue += arrivals;
  const processed = Math.min(queue, capacityPerTick);
  queue -= processed;
  done += processed;
  console.log('tick ' + tick + ': arrived=' + arrivals +
              ' processed=' + processed + ' queued=' + queue);
});
console.log('total processed=' + done);`,out:`tick 0: arrived=0 processed=0 queued=0
tick 1: arrived=12 processed=3 queued=9
tick 2: arrived=0 processed=3 queued=6
tick 3: arrived=0 processed=3 queued=3
tick 4: arrived=0 processed=3 queued=0
tick 5: arrived=0 processed=0 queued=0
tick 6: arrived=2 processed=2 queued=0
tick 7: arrived=0 processed=0 queued=0
total processed=14`,why:'A 12-job spike became four calm ticks of steady work — nobody was rejected, nobody OOMed; the price was latency for late jobs, an explicit trade. Persistent excess of arrivals over capacity would grow the queue forever: that is the backpressure signal.'},
   {t:'Intermediate: token-bucket rate limiter over a timeline',code:`class TokenBucket {
  constructor(capacity, refillPerSecond) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillPerSecond = refillPerSecond;
    this.lastMs = 0;
  }
  allow(nowMs) {
    const elapsedSec = (nowMs - this.lastMs) / 1000;
    this.tokens = Math.min(this.capacity,
      this.tokens + elapsedSec * this.refillPerSecond);
    this.lastMs = nowMs;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
}
const bucket = new TokenBucket(5, 2);    // burst 5, sustain 2/s
const timeline = [0, 0, 0, 0, 0, 0, 0, 500, 1000, 1000, 3000];
const verdicts = timeline.map(t => (bucket.allow(t) ? 'OK ' : '429'));
console.log(verdicts.join(' '));`,out:`OK  OK  OK  OK  OK  429 429 OK  OK  429 OK`,why:'Five instant bursts drain the bucket; requests 6-7 are rejected until refills accrue (0.5s buys one token at 2/s). Burst capacity and sustained rate are tuned independently — the algorithm\'s whole charm.'},
   {t:'Advanced: retries, dead-letter, and idempotency in miniature',code:`const outcomes = { jobA: [false, false, true], jobB: [false, false, false, false] };
const processed = new Set();
const deadLetter = [];
const MAX_ATTEMPTS = 3;

function handle(jobId, attempt) {
  if (processed.has(jobId)) return 'duplicate-ignored';
  const ok = outcomes[jobId][attempt - 1];
  if (ok) { processed.add(jobId); return 'done@' + attempt; }
  if (attempt >= MAX_ATTEMPTS) { deadLetter.push(jobId); return 'dead-lettered'; }
  return 'retry';
}

for (const job of ['jobA', 'jobB']) {
  let result = '';
  for (let a = 1; a <= MAX_ATTEMPTS; a++) {
    result = handle(job, a);
    if (result !== 'retry') break;
  }
  console.log(job + ' -> ' + result);
}
console.log('redelivery of jobA -> ' + handle('jobA', 1));
console.log('deadLetter=', JSON.stringify(deadLetter));`,out:`jobA -> done@3
jobB -> dead-lettered
redelivery of jobA -> duplicate-ignored
deadLetter= ["jobB"]`,why:'Transient failures heal via bounded retries; poison jobs exit to the DLQ for inspection instead of blocking the line; the idempotency set makes at-least-once redelivery harmless — the standard production trio in 25 lines.'}
  ],
  walk:[[9,'Tokens refill proportionally to elapsed time and cap at capacity — idle clients bank at most one burst, never infinite credit.','bounded burst credit'],[13,'allow() spends a token only when the (refilled) balance covers it; fractional tokens accrue silently between calls.','pay or reject'],[19,'Timeline moments at 500/1000ms gain exactly 1 and 1 tokens (2/s rate), matching the printed OK/429 pattern step for step.','arithmetic matches output']],
  walkWhy:'Token buckets turn "fairness policy" into two numbers (capacity, refill) whose behaviour teams can simulate on a whiteboard — policy you can compute.',
  rules:['Unbounded queues are delayed OOMs — bound them and decide overflow behaviour (block, drop-oldest, reject) explicitly.','Consumers must be idempotent: redelivery is a guarantee of at-least-once systems, not an anomaly.','Rate-limit rejections are a feature (429 + Retry-After), better than global collapse at 100% pain.','Alert on queue AGE (oldest message wait), not only depth: latency is what users feel.'],
  mistakes:[
   {t:'Synchronous everything (email/report inside the request)',bad:'app.post("/signup", async (req, res) => {\n  await sendVerificationEmail(); await buildWelcomePdf(); res.send("ok");\n})',why:'Slow side-effects stretch request latency and convert email-provider hiccups into failed signups. Bursts of signups serialise behind the slowest dependency.',fix:'await queue.publish("signup.followups", { userId }); res.send("ok");  // workers handle the rest',tip:'Requests should validate + record intent fast; queues do the heavy, retryable lifting.'},
   {t:'Retry storms without backoff/limits',bad:'while (!(ok = trySend(msg))) { /* immediate retry forever */ }',why:'Aggressive retries multiply load on a struggling dependency (a self-DDoS), and poison messages loop eternally, burning workers while real jobs wait.',fix:'// exponential backoff + jitter, cap attempts, then dead-letter with context',tip:'Every retry policy reads: max attempts, backoff curve, DLQ destination — or it is not a policy.'}
  ],
  cmp:['Overload tools',['Problem','Tool','Effect'],[['Arrival burst > capacity','Queue buffer','Latency up, nothing lost'],['Persistent overload','Backpressure / load shed','Early honest rejection'],['Abusive/runaway client','Token-bucket limiter','Per-client fairness (429)'],['Poison message','Bounded retries → DLQ','Line keeps moving, evidence kept']]],
  diag:{kind:'flow',start:'Job arrives',condition:'Queue within bounds?',trueAction:'Enqueue; workers drain at capacity',falseAction:'Backpressure: 429/shed with signal',end:'Monitor age + DLQ depth'},
  apps:['Email/notification fan-out and media processing pipelines.','Public API tiers (100/min free, 5000/min pro) via buckets.','Order/webhook processing with redelivery-safe handlers.'],
  quizzes:[{q:'A queue consumers keep redelivering a message after worker crashes. Handlers must therefore be…',options:['Faster','Idempotent (safe to run twice)','Synchronous','Stateless only'],correct:1,why:'At-least-once delivery promises duplicates; idempotent processing (dedupe keys/natural upserts) makes them harmless.'},
            {q:'Token bucket capacity 10, refill 1/s. A client idle for a minute can instantly burst…',options:['60 requests','10 requests','1 request','Unlimited'],correct:1,why:'Tokens cap at capacity no matter how long the idle period — burst size is capacity, sustained rate is refill.'}],
  take:['Queues trade latency for survival; unbounded queues lie about the trade.','Bounded retries + DLQ + idempotency = trustworthy async pipelines.','Token buckets make fairness two computable numbers per client.'],
  rev:'Producer->bounded queue->workers; scale on queue age. Backpressure over OOM. At-least-once => idempotent. Token bucket: cap burst, refill sustains.',
  assign:{p:'Build a token bucket of capacity 3, refill 1/sec; call allow at t = 0,0,0,0,1000,1000,2500 and print OK/429 joined by spaces. Expected: OK OK OK 429 OK 429 OK.',s:`// Bucket(capacity=3, refill=1) driven over the given timeline`,sol:`class TokenBucket {
  constructor(capacity, refillPerSecond) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillPerSecond = refillPerSecond;
    this.lastMs = 0;
  }
  allow(nowMs) {
    const elapsedSec = (nowMs - this.lastMs) / 1000;
    this.tokens = Math.min(this.capacity,
      this.tokens + elapsedSec * this.refillPerSecond);
    this.lastMs = nowMs;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
}
const bucket = new TokenBucket(3, 1);
const out = [0, 0, 0, 0, 1000, 1000, 2500].map(t => (bucket.allow(t) ? 'OK' : '429'));
console.log(out.join(' '));`}
},
{
  id:'sd-databases-sharding-replication', course_id:'system-design', unit_id:'sd-unit-1', order_index:5,
  title:'Database Scaling: Replication, Sharding & SQL vs NoSQL', desc:'Read replicas, write sharding and choosing the store by data shape (runnable exhibits).',
  obj:['Explain primary/replica replication and its lag trade-off','Plan shard keys by access pattern and hotspot avoidance','Choose SQL vs NoSQL from data shape, relations and consistency needs'],
  pre:['SQL track (relational model, transactions)','Consistent hashing (load-balancing algorithms topic)'],
  outcomes:['Learner proposes a defensible database topology for a growing product'],
  def:'Replication copies data from a primary to replicas (scale reads, add redundancy) with some lag. Sharding partitions rows across databases by a shard key (scale writes/storage). SQL stores optimise relations and strong consistency; NoSQL families (document, key-value, wide-column, graph) optimise specific shapes and scale-out at relaxed-consistency price points.',
  simple:'One librarian is fine until two things break: the reading crowd gets huge, and the card catalogue gets enormous. Fix the crowd first with replicas — faithful copies of the catalogue that answer questions while the head librarian (primary) records new books; copies trail slightly behind, which most readers never notice (but the writer reading their own fresh entry might!). When even one catalogue cannot hold or absorb all the WRITES, shard: split the collection across buildings by a rule (say, author surname ranges or user-id hash), each building fully in charge of its slice. The shard-key choice is destiny — pick by your most common question and avoid celebrity hotspots everyone hammers. As for SQL vs NoSQL: it is not fashion, it is geometry — highly relational, join-heavy, consistency-critical data loves SQL; self-contained document blobs or planet-scale key lookups suit NoSQL shapes.',
  hing:'Database ko badhana do dishaon me hota hai. Padhne wale zyada ho jayein to REPLICATION: ek main (primary) par likhte hain, kai copies (replica) se padhte hain. Copy tak data pahunchne me thoda samay lagta hai (lag), isliye apna likha turant padna ho to primary se padho — is dikkat ka naam hai "read your own writes". Likhne ka bhoj ya data ka aakaar bada ho jaye to SHARDING: data ko shard-key ke aadhar par kai database me baant do — jaise user_id par. Shard key soch kar chuno: jis filter se zyada sawaal aate hain wahi; agar ek mashhoor user par saara traffic padhe to hotspot ban jayega. SQL vs NoSQL ka jhagda aakaar ka hai: rishton-joins aur pakki consistency (banking) ke liye SQL raja hai; alag thalag document ya bhaari scale par sirf key-lookup hai to NoSQL. "Sabse naya" ke peeche mat bhago, data ki banawat dekho.',
  why:'The database is usually the last, hardest tier to scale — stateful, consistency-sensitive, and unforgiving of early sharding mistakes. Replication-before-sharding discipline and shape-driven store choice keep options open; premature sharding is a famous own-goal.',
  when:'Scale reads with replicas + caching long before sharding. Shard by the dominant access key (tenant/user) when write throughput/storage on one primary truly binds; co-locate data queried together. Keep cross-shard joins and transactions out of the design, or pick a different partition.',
  syntax:'writes -> PRIMARY --(WAL/binlog stream)--> REPLICA 1..N (reads)\nroute(user) = shards[ hash(user.tenantId) % shards.length ]  // or ring',
  comp:[['Replication lag','Replicas trail the primary; reads may be slightly stale'],['Shard key','Column deciding row placement — dictates which queries stay single-shard'],['Read-your-writes','Route a user\'s immediate post-write reads to the primary (or wait-for-replica)']],
  ex:[
   {t:'Basic: read/write split arithmetic (why replicas)',code:`const replicas = 3;
const readQps = 900;
const writeQps = 100;
const primaryLoadAfterSplit = writeQps + 0;          // writes only
const perReplicaReads = readQps / replicas;
console.log('before split: one node carries', readQps + writeQps, 'qps');
console.log('after split: primary carries', primaryLoadAfterSplit,
            'qps; each replica carries', perReplicaReads, 'read qps');`,out:`before split: one node carries 1000 qps
after split: primary carries 100 qps; each replica carries 300 read qps`,why:'Read-heavy (9:1) workloads are the norm; replication divides the 900 read qps across cheap copies while the single writer stays consistent. Writes themselves do not divide — that is what sharding is for.'},
   {t:'Intermediate: shard-key routing + hotspot warning',code:`function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const SHARDS = 3;
const counts = [0, 0, 0];
const users = ['diya','kabir','meera','aarav','isha','rohan','zoya','vihaan','anika','dev','sara','Kabir'];
for (const u of users) counts[hash(u) % SHARDS]++;
console.log('user distribution across shards:', counts.join(' / '));

// hotspot demo: everyone reads ONE celebrity profile
const traffic = { diya: 5, kabir: 7, celeb: 5000 };
const celebShard = hash('celeb') % SHARDS;
console.log('celebrity lands on shard', celebShard,
            '- that shard absorbs ~99% of traffic while siblings idle');`,out:`user distribution across shards: 5 / 5 / 2
celebrity lands on shard 0 - that shard absorbs ~99% of traffic while siblings idle`,why:'Hashing spreads KEYS, not traffic: uniform counts can still hide catastrophic skew when one key goes viral. Hot partitions need caching/replication of the hot item itself, regardless of how even the key spread looks.'},
   {t:'Advanced: replication lag and the read-your-own-write trap (timeline)',code:`// primary log with replication arriving 5 ticks late
const primary = [];
const replica = [];
function tick(t) {
  // apply writes whose lag has elapsed
  while (replica.length < primary.length &&
         primary[replica.length].t <= t - 5) {
    replica.push(primary[replica.length]);
  }
}
primary.push({ t: 0, op: 'set balance=500' });
tick(3);
console.log('t=3 replica sees ops:', replica.length, '(user refreshing balance sees stale 0)');
tick(5);
console.log('t=5 replica sees ops:', replica.length, '(balance=500 now visible from replica)');
console.log('fix: post-write reads from PRIMARY for that user, accept, or wait for lag < threshold');`,out:`t=3 replica sees ops: 0 (user refreshing balance sees stale 0)
t=5 replica sees ops: 1 (balance=500 now visible from replica)
fix: post-write reads from PRIMARY for that user, accept, or wait for lag < threshold`,why:'Eventual consistency is a user-visible behaviour, not a footnote: the classic bug report "my update disappeared" is usually lag read back too fast. Systems budget for it explicitly (sticky-to-primary windows, version checks).'}
  ],
  walk:[[3,'Splitting reads is division, not magic: 900 read qps over 3 replicas is 300 each, while writes remain on one primary by design.','reads divide, writes do not'],[5,'The "before" number (1000 qps on one node) is what a single saturated instance faced; topology change, not faster hardware, relieved it.','topology over horsepower']],
  walkWhy:'Database scaling is workload algebra: identify which axis (read qps, write qps, bytes, connections) binds, then choose the mechanism that divides THAT axis.',
  rules:['Replicate and cache before sharding; sharding is a one-way door of complexity (resharding is surgery).','Pick shard keys from observed queries: every hot query should carry the shard key, or it fans out to all shards.','Replication is not backup: a DROP TABLE replicates faithfully and instantly. Backups are separate, tested restores.','Multi-primary writes buy availability with conflict-resolution complexity — earn the need before paying it.'],
  mistakes:[
   {t:'Sharding first because "we will be huge"',bad:'// Week 1: 16 shards, cross-shard joins reimplemented in app code, one user',why:'Sharding deletes joins/transactions/global indexes and multiplies operational load. Premature distribution also invalidates the SQL tools you need while the product is still learning its access patterns.',fix:'// one well-indexed primary -> +cache -> +read replicas -> shard only on measured write/storage limits',tip:'Scale on evidence: maxed CPU/IO/connections on the strengthened primary is the shard signal, not ambition.'},
   {t:'A shard key nobody queries by',bad:'// shard by row UUID hash; main query is "all orders of tenant T" -> fans out to every shard',why:'Hash-spread keys balance storage but scatter the working set of real queries; latency becomes the slowest shard on every request, and aggregates move into app code.',fix:'// shard by tenant_id: the hot query becomes single-shard; co-locate tenant data',tip:'The shard key is a bet on the dominant access pattern — make it with production query logs open.'}
  ],
  cmp:['SQL vs NoSQL by shape',['Data/situation','Natural fit','Why'],[['Orders/users/payments with joins + constraints','Relational SQL','Relations & integrity are the point'],['Product catalogue with varying attributes','Document store','Self-contained blobs, flexible fields'],['Session/feature flags by key','Key-value store','Blazing point lookups at scale'],['Friend-of-friend traversals','Graph DB','Edges are first-class']]],
  diag:{kind:'flow',start:'Database bottleneck?',condition:'Reads bind first?',trueAction:'Cache + read replicas (watch lag)',falseAction:'If writes/storage bind: shard by access key',end:'Re-measure; iterate topology'},
  apps:['Course platform: replica reads for catalogues/progress, primary for attempts/payments.','Multi-tenant SaaS sharded by tenant with per-tenant isolation options.','Feeds/timelines mixing document stores with relational identity cores.'],
  quizzes:[{q:'Adding read replicas does NOT help which bottleneck?',options:['Read latency','Write throughput on the primary','Read availability','Geo read locality'],correct:1,why:'All writes still serialise through the single primary; dividing writes needs sharding (or multi-primary designs).'},
            {q:'The best shard key is primarily determined by…',options:['Alphabetical convenience','The dominant query access pattern (+ even distribution)','Smallest column','Primary key always'],correct:1,why:'Queries carrying the shard key stay single-shard; others fan out. Distribution evenness guards hotspots.'}],
  take:['Divide the binding axis: replicas for read qps, sharding for write/storage.','Lag is a product behaviour; design read-your-writes explicitly.','Choose stores by data geometry, and shard keys by real queries.'],
  rev:'Primary writes, replicas read (lag!). Shard rows by access key; mind hotspots vs key spread. SQL=relations/consistency; NoSQL=specialised shapes. Replicas != backups.',
  assign:{p:'Compute: with 4 replicas and workload 1600 read qps / 200 write qps, print "primary=200", "per-replica=400" using variables (compute, do not hardcode). Then print "lag-window-ms=250 means a read 100ms after write may be stale: true" as a computed boolean (100 < 250).',s:`// Compute split load and a staleness boolean`,sol:`const replicas = 4;
const readQps = 1600;
const writeQps = 200;
console.log('primary=' + writeQps);
console.log('per-replica=' + (readQps / replicas));
const lagMs = 250;
const readDelayMs = 100;
console.log('lag-window-ms=' + lagMs +
            ' means a read 100ms after write may be stale: ' +
            (readDelayMs < lagMs));`}
},
];

module.exports = { topics: makeTopics(specs) };
