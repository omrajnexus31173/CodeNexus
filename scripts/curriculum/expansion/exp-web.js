'use strict';
const { makeTopics } = require('./builder');

const specs = [
{
  id:'html-document-structure-semantic', course_id:'html-css', unit_id:'html-unit-2', order_index:1,
  title:'HTML Document Structure & Semantic Elements', desc:'Anatomy of a valid HTML5 page and meaningful landmarks (header, nav, main, article, footer). Browser-rendered: study examples.',
  obj:['Write the full HTML5 boilerplate with correct head metadata','Nest elements validly and close tags in order','Choose semantic landmarks over anonymous divs'],
  pre:['Basic computer file literacy'],
  outcomes:['Learner authors valid, meaningful documents that assistive tools and search engines understand'],
  def:'An HTML document is a tree of elements beginning with <!DOCTYPE html>, split into head (metadata: charset, viewport, title) and body (rendered content). Semantic elements (header, nav, main, section, article, aside, footer) name the ROLE of content regions instead of presenting anonymous boxes.',
  simple:'Every web page follows the same skeleton: a doctype announcement ("this is modern HTML"), a head carrying invisible instructions (character set, mobile viewport, the tab title), and a body holding everything you see. Inside the body, HTML5 gives you named boxes: header for the masthead, nav for menus, main for the one primary content region, article for self-contained pieces, footer for the closing strip. Using these instead of endless anonymous <div> boxes is like labelling the rooms of a house instead of calling everything "room" — browsers, screen readers and Google all navigate by those labels. Tags must nest like Russian dolls: last opened, first closed.',
  hing:'Har web page ka ek fix dhaancha hota hai: sabse upar <!DOCTYPE html> (browser ko signal), phir <head> jisme dikhai na dene wali settings hoti hain (charset, mobile ke liye viewport, tab me dikhne wala title), aur <body> me asal dikhne wala sab kuch. body ke andar div hi div bharne ke bajaye semantic tag use karo: upar hisse ke liye <header>, menu ke liye <nav>, mukhya content ke liye <main> (page par sirf EK!), lekh/post ke liye <article>, aakhir ke liye <footer>. Isse screen-reader aur search engine ko page samajh aa jata hai. Tag band karne ka niyam ghonsle jaisa hai: jo aakhir me khula, woh pehle band — galat nesting par browser apni marzi se sudhaar deta hai jo kabhi kabhi layout bigaad deta hai.',
  why:'Valid structure is the contract every later CSS selector, JS query and accessibility tool relies on. Semantic landmarks give free navigation to assistive technologies and better document understanding to search engines, at zero extra cost.',
  when:'Start every page from the boilerplate; reserve div/span for purely styling-driven grouping with no inherent meaning. One <main> and one <h1> per page in typical documents; headings descend in order (h1→h2→h3).',
  syntax:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page title</title>\n</head>\n<body>\n  <header>...</header>\n  <main>...</main>\n  <footer>...</footer>\n</body>\n</html>',
  comp:[['<!DOCTYPE html>','Switches browsers to standards mode (no quirks rendering)'],['meta viewport','Makes layout width follow device width — prerequisite for responsive CSS'],['Landmarks','header/nav/main/footer expose regions to assistive tech automatically']],
  ex:[
   {t:'Study: minimum valid page skeleton',code:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diya's Notes</title>
</head>
<body>
  <h1>Welcome to my notes</h1>
  <p>First paragraph of content.</p>
</body>
</html>`,out:`Rendered result: browser tab titled "Diya's Notes";
page shows a large bold heading "Welcome to my notes"
above the paragraph text. Valid in standards mode
on desktop and mobile widths.`,why:'charset must precede any text so decoding is right; lang="en" declares document language for screen readers and hyphenation; the single h1 states the page topic.'},
   {t:'Study: semantic landmarks replacing div-soup',code:`<body>
  <header>
    <p class="logo">CodeNexus Daily</p>
    <nav>
      <a href="/courses">Courses</a>
      <a href="/blog">Blog</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>Understanding Pointers</h1>
      <p>Pointers store addresses...</p>
    </article>
    <aside>
      <h2>Related</h2>
      <p>Memory layout refresher</p>
    </aside>
  </main>
  <footer>
    <p>(c) 2026 CodeNexus</p>
  </footer>
</body>`,out:`Rendered result: masthead with two nav links, the
article as primary content, a "Related" side block,
and a copyright footer. Screen readers announce
banner/navigation/main/contentinfo landmarks.`,why:'Structure communicates before styling: nothing here needs class archaeology to understand. The article could be syndicated standalone — exactly the semantic test for choosing article over section/div.'},
   {t:'Study: heading hierarchy and nesting discipline',code:`<main>
  <h1>Web Development Roadmap</h1>
    <h2>Frontend</h2>
      <h3>HTML</h3>
      <h3>CSS</h3>
    <h2>Backend</h2>
      <h3>APIs</h3>
  <p>Text with <strong>important <em>and emphasised</em></strong> nesting.</p>
</main>`,out:`Rendered result: a descending outline
Roadmap > Frontend > HTML/CSS, Backend > APIs.
The paragraph shows bold text with italic inside it,
closed in reverse order of opening.`,why:'Heading levels act as a document outline — skipping from h1 to h4 for looks breaks screen-reader navigation; use CSS for size, levels for structure. em closes before strong because it opened later.'}
  ],
  walk:[[1,'DOCTYPE first: standards-mode rendering is negotiated before any element is parsed.','standards mode'],[3,'head metadata loads silently: charset decoding, viewport rules and the title — none of it paints.','invisible setup'],[8,'body content parses top-down; the h1 becomes the first painted, dominant element.','page topic announced'],[9,'The paragraph nests inside body after the heading, completing a valid tree ministructure.','tree well-formed']],
  walkWhy:'Everything later — CSS selectors like main > article, JS querySelector("nav a"), validator praise — presumes this skeleton and nesting discipline exactly.',
  rules:['Every non-void element opened must be closed in reverse nesting order; void elements (meta, img, br, hr, input, link) have no closing tag.','Exactly one <main> landmark per page; headers/footers may recur inside articles/sections.','The charset meta should appear within the first bytes of the document (practically: first in head).','Attributes use double quotes by convention; tag/attribute names are lowercase in HTML.'],
  mistakes:[
   {t:'Crossed (mis-nested) tags',bad:'<p>Read <strong>this <em>carefully</strong> now</em>.</p>',why:'em opened inside strong but strong closed first, crossing the boundaries. Browsers\' error recovery will reshuffle the tree into something you did not write, so styles land on different text than intended and validation fails.',fix:'<p>Read <strong>this <em>carefully</em></strong> now.</p>',tip:'Think brackets: innermost opened is innermost closed. Editors with tag-matching highlight this instantly.'},
   {t:'Skipping heading levels for font size',bad:'<h1>Title</h1>\n<h4>Subsection that just needed to look small</h4>',why:'Heading levels encode OUTLINE structure for assistive navigation and SEO. Jumping h1→h4 announces phantom intermediate sections; choosing tags by their default size couples meaning to presentation.',fix:'<h2 class="small-heading">Subsection</h2>\n<!-- size handled in CSS: .small-heading { font-size: 1rem; } -->',tip:'Pick headings by rank in the outline; reach for CSS whenever the motive is purely visual.'}
  ],
  cmp:['Semantic vs generic containers',['Need','Semantic element','Anonymous div'],[['Site masthead','header','div class="header" (works, says nothing)'],['Primary content','main (landmark)','No landmark for AT'],['Self-contained post','article','Indistinguishable blob'],['Pure styling wrapper','(none fits)','div is CORRECT here']]],
  diag:{kind:'box'},
  apps:['Every future page in this track builds on this skeleton.','Blog/CMS templates emit exactly these landmarks for themes to style.','SEO/accessibility audits score landmark presence explicitly (Lighthouse).'],
  quizzes:[{q:'How many <main> elements should a normal page expose?',options:['Unlimited','Exactly one visible main landmark','One per section','Zero — main is deprecated'],correct:1,why:'main marks THE primary content region; multiple/duplicated landmarks confuse assistive navigation.'},
            {q:'Which is a void element (no closing tag)?',options:['<p>','<div>','<img>','<a>'],correct:2,why:'img (like meta/br/hr/input/link) is void: it cannot hold children and is written without an end tag.'}],
  take:['Boilerplate first: doctype, lang, charset, viewport, title.','Name regions semantically (header/nav/main/article/footer); div only for pure styling.','Nesting closes in mirror order; headings form an unbroken outline.'],
  rev:'<!DOCTYPE html><html lang><head> charset+viewport+title </head><body> landmarks </body>. One main, one h1 typically, void tags unclosed.',
  assign:{p:'(Study) Write a full valid page for "City Library" with header (site name + nav of 2 links), main containing an article "New arrivals" with one paragraph, and a footer with a copyright line. Include charset, viewport and title.',s:`<!-- Study task: author the complete HTML document described -->`,sol:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>City Library</title>
</head>
<body>
  <header>
    <p>City Library</p>
    <nav>
      <a href="/catalog">Catalog</a>
      <a href="/events">Events</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>New arrivals</h1>
      <p>This week we added forty new titles across fiction and science.</p>
    </article>
  </main>
  <footer>
    <p>(c) 2026 City Library</p>
  </footer>
</body>
</html>`}
},
{
  id:'html-text-links-media', course_id:'html-css', unit_id:'html-unit-2', order_index:2,
  title:'Text, Links, Images, Lists & Tables', desc:'Everyday content elements with correct attributes and accessible habits. Browser-rendered: study examples.',
  obj:['Format text with headings/paragraphs/emphasis and quotes','Build links (internal, external, in-page) and images with alt text','Choose list types and structure accessible data tables'],
  pre:['Document structure & semantic elements'],
  outcomes:['Learner authors rich content pages that remain usable and accessible'],
  def:'Core content elements include paragraphs and headings for prose, a[href] for hyperlinks (external, internal, fragment), img[src,alt] for images, ul/ol/dl for grouped items, and table with caption/thead/th scope for genuinely tabular data.',
  simple:'These are the elements you will type daily. A link is an anchor tag wrapping clickable text — make the text describe the destination ("Download the syllabus PDF") because "click here" tells screen-reader users nothing when links are listed out of context. Images REQUIRE an alt attribute: a text twin describing the picture for people (and search engines) who cannot see it; purely decorative images get alt="" so they are politely skipped. Lists come in unordered (bullets), ordered (steps/rankings) and description flavours. Tables are only for spreadsheet-like data with row/column headers — never for page layout, a 1998 habit long retired.',
  hing:'Ye wo elements hain jo har page me baar-baar aayenge. Link matlab <a href="...">text</a> — link ke andar ka text aisa likho jo mannaza bata de, "click here" kabhi mat likho kyunki screen reader user ko kuch samajh nahi aayega! Image ke liye alt attribute sabse zaroori hai: ye andhe upyogkarta ko batata hai tasveer me kya hai; sirf sajawati tasveer ho to alt="" khaali chhod do taaki wo skip ho jaye. List teen prakar ki: <ul> goliyan (bina kram ke), <ol> number wali (steps/rank), aur <dl> shabdon ki paribhaasha ke liye. Table sirf asal data (marks-sheet jaisa) ke liye hai — <th scope="col"> header zaroor lagao taaki screen reader har cell ka matlab samjha sake. Page ki design table se banana purani galti hai, wo kaam CSS ka hai!',
  why:'Content correctness precedes styling: meaningful link text and alt attributes decide whether a page is usable at all for many visitors, and table semantics decide whether data is announced intelligibly. These details are graded by accessibility audits directly.',
  when:'Links navigate (use button for actions instead); images inform (alt text) or decorate (alt=""); lists group peer items; tables only when data has row/column relationships. External links opening new tabs need rel="noopener" care with target="_blank".',
  syntax:'<a href="/courses/dsa">Data Structures course</a>\n<a href="#fees">Jump to fees</a>\n<img src="graph.png" alt="Bar chart of marks by subject">\n<ul><li>Pen</li><li>Notebook</li></ul>',
  comp:[['href kinds','Absolute URL, root-relative /path, relative page.html, fragment #id'],['alt text','Text alternative: describe content/function; empty string = decorative'],['th scope','scope="col"/"row" binds header cells to their data for AT']],
  ex:[
   {t:'Study: links that describe their destination',code:`<nav>
  <a href="/courses">All courses</a>
  <a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN reference (opens in new tab)</a>
  <a href="#syllabus">Jump to syllabus</a>
  <a href="mailto:hello@example.com">Email the team</a>
</nav>
<section id="syllabus">
  <h2>Syllabus</h2>
  <p>Units and topics listed here.</p>
</section>`,out:`Rendered result: four working links; "Jump to syllabus"
scrolls to the section with id="syllabus"; the MDN link
opens externally without giving the new page a handle
back to this window (noopener).`,why:'Fragment links need a matching id target. rel="noopener" severs window.opener access from the opened page — a standard security pairing with target="_blank".'},
   {t:'Study: images with meaningful alt and responsive sizing',code:`<figure>
  <img src="binary-tree.png"
       alt="Binary tree with root 8, children 3 and 10, and leaves 1, 6, 14"
       width="640" height="400">
  <figcaption>Figure 1: A small binary search tree.</figcaption>
</figure>
<img src="divider-flourish.png" alt="">`,out:`Rendered result: captioned diagram; screen readers
announce the alt description instead of the filename.
The decorative divider is skipped silently (alt="").
Declared width/height reserve space, preventing layout jump.`,why:'alt describes content and function, not "image of...". Dimension attributes let the browser reserve the aspect box before load, eliminating layout shift — modern performance hygiene.'},
   {t:'Study: lists and a proper data table',code:`<h2>Exam day checklist</h2>
<ol>
  <li>Carry your admit card</li>
  <li>Reach 30 minutes early</li>
</ol>

<table>
  <caption>Midterm marks by subject</caption>
  <thead>
    <tr><th scope="col">Student</th><th scope="col">Maths</th><th scope="col">Science</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Diya</th><td>92</td><td>85</td></tr>
    <tr><th scope="row">Kabir</th><td>57</td><td>49</td></tr>
  </tbody>
</table>`,out:`Rendered result: numbered steps for the checklist;
a grid whose column and row headers are announced
with each cell ("Diya, Maths, 92") by screen readers.`,why:'ol because order matters for steps. caption titles the table; th+scope wire headers to data both visually (bold) and semantically.'}
  ],
  walk:[[3,'The fragment href "#syllabus" needs no server trip: the browser finds id="syllabus" in the same document and scrolls it into view.','in-page jump'],[2,'The external link pairs target="_blank" with rel="noopener" so the new tab cannot script-control this page via window.opener.','safe new tab'],[4,'mailto: delegates to the user\'s mail client — and exposes the address publicly, a conscious trade-off.','protocol link']],
  walkWhy:'An href is a small contract: destination type (page/fragment/protocol), new-window behaviour, and link text meaning are all decisions the author makes explicitly.',
  rules:['Interactive elements cannot nest: never put <a> inside <a> or buttons inside links.','Every img needs an alt attribute present (possibly empty for decoration) — a missing alt is an accessibility error.','Use lists for actual groups; do not fake bullets with <br> lines or hyphen characters.','Tables are for data with header relationships; layout belongs to CSS — table markup for layout scrambles reading order.'],
  mistakes:[
   {t:'"Click here" link text everywhere',bad:'<p>For fees, <a href="/fees">click here</a>. For courses, <a href="/courses">click here</a>.</p>',why:'Screen readers can list all links out of context: a list of "click here, click here" communicates nothing. Sighted skimmers also scan link text as signposts.',fix:'<p>See the <a href="/fees">fee structure</a> and <a href="/courses">course catalogue</a>.</p>',tip:'Read only the link texts aloud — if the journey is incomprehensible, rewrite them.'},
   {t:'Missing or filename alt text',bad:'<img src="chart-final-v2.png">\n<img src="chart-final-v2.png" alt="chart-final-v2.png">',why:'Without alt, many screen readers announce the file path; echoing the filename adds zero information. The chart\'s actual message (trend, values) is locked in pixels for non-visual users.',fix:'<img src="chart-final-v2.png" alt="Line chart: average marks rose from 62 in January to 81 in June">',tip:'Write the sentence you would speak describing the image over a phone call — that is the alt text.'}
  ],
  cmp:['ul vs ol vs table',['Use','Element','Order matters?'],[['Shopping items','ul','No'],['Recipe steps, ranks','ol','Yes'],['Term + definition pairs','dl','Pairing matters'],['Marks grid w/ headers','table + th scope','Row/column relations']]],
  diag:{kind:'box'},
  apps:['Course content pages are built from exactly these primitives.','Documentation sites live on descriptive links + captioned figures.','Report pages present tabular data accessibly for auditors using AT.'],
  quizzes:[{q:'A purely decorative background flourishes as an <img>. Correct alt is…',options:['alt="decorative flourish image"','No alt attribute','alt="" (empty, so AT skips it)','alt="image"'],correct:2,why:'Empty alt marks the image as decorative — presentational, silently skipped by assistive tech.'},
            {q:'Which element makes a set of instructions semantically ordered?',options:['ul','ol','dl','table'],correct:1,why:'ol conveys sequence/ranking semantics (and numbering) that ul explicitly lacks.'}],
  take:['Link text must describe the destination out of context.','alt is mandatory; describe meaning, empty for decoration; set dimensions.','Lists for groups, tables (with th scope + caption) only for data.'],
  rev:'a href types: /path, #id, https, mailto. target=_blank + rel=noopener. img alt always. ol ordered, ul not. th scope binds headers.',
  assign:{p:'(Study) Author markup: an h2 "Topper list", an ordered list of three names, and a table with caption "Subject averages" with column headers Subject/Average and two data rows; all th with scope. Add one descriptive external link under the table.',s:`<!-- Study task: heading + ordered list + accessible table + link -->`,sol:`<h2>Topper list</h2>
<ol>
  <li>Meera Iyer</li>
  <li>Diya Sharma</li>
  <li>Aarav Shah</li>
</ol>

<table>
  <caption>Subject averages</caption>
  <thead>
    <tr><th scope="col">Subject</th><th scope="col">Average</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Maths</th><td>74</td></tr>
    <tr><th scope="row">Science</th><td>76</td></tr>
  </tbody>
</table>

<p>Read the <a href="https://example.com/results-guide">guide to interpreting results</a> for parents.</p>`}
},
{
  id:'html-forms-inputs', course_id:'html-css', unit_id:'html-unit-2', order_index:3,
  title:'Forms & Input Types with Native Validation', desc:'Collect data with labelled controls, the right input types, and browser validation. Browser-rendered: study examples.',
  obj:['Associate labels with controls via for/id (or wrapping)','Choose input types (email, number, date, password...) and constraint attributes','Structure radio/checkbox groups with fieldset/legend and name semantics'],
  pre:['Text, links & media elements'],
  outcomes:['Learner builds usable, self-validating forms before any JavaScript'],
  def:'A form groups labelled controls whose name/value pairs submit to an endpoint. Input types (text, email, password, number, date, checkbox, radio, file...) bring appropriate keyboards/widgets and built-in validation via attributes such as required, min, max, minlength, pattern.',
  simple:'Forms are how websites ask questions. Every field needs a visible label tied to it — clicking the label focuses the box, and screen readers announce the label when the box is focused. Choosing the right input TYPE is free usability: type="email" summons an @-friendly keyboard on phones and makes the browser itself reject "not-an-email" before submission; type="number" with min/max blocks a 9-year-old aged 400. Radio buttons are one-from-many (same name group), checkboxes are independent toggles. required, minlength and pattern give you a first layer of validation with zero JavaScript — though the server must always re-check everything.',
  hing:'Form matlab website ka sawal-nama. Har field ke saath <label> jodna sabse zaroori hai — for="email" ko input ke id="email" se milao, taaki label par click karte hi box focus ho jaye aur screen reader naam padh sake. Sirf placeholder ko label ke badle mat rakho, woh likhte hi gayab ho jata hai! Sahi type chunna free ka fayda hai: type="email" par mobile par @ wala keyboard aata hai aur galat email browser khud rok deta hai; type="number" min=1 max=120 lagakar umar ki hadh bandh sakte ho. Ek hi chunav ho to radio (same name walo ka group), kai chunav to checkbox. required lagate hi khaali form submit nahi hoga — ye builtin validation hai, lekin yaad rahe server par dobara jaanch phir bhi compulsory hai, kyunki browser wali jaanch todi ja sakti hai.',
  why:'Forms decide conversion and data quality for every signup, checkout and survey. Label association and type choice are graded accessibility requirements and the difference between effortless mobile input and abandonment.',
  when:'Always label every control; pick the most specific input type; add autocomplete tokens (name, email, one-time-code); group related radios/checkboxes with fieldset+legend; validate natively first, then JS, then (non-negotiably) on the server.',
  syntax:'<form action="/signup" method="post">\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required autocomplete="email">\n  <button type="submit">Create account</button>\n</form>',
  comp:[['label for ↔ input id','Programmatic association powering click-to-focus and AT announcement'],['name attribute','The key under which the value is submitted; unnamed controls are dropped'],['Constraint attributes','required/min/max/minlength/pattern drive built-in validation bubbles']],
  ex:[
   {t:'Study: a labelled signup fragment with native validation',code:`<form action="/signup" method="post">
  <p>
    <label for="fullname">Full name</label>
    <input id="fullname" name="fullname" type="text" required autocomplete="name">
  </p>
  <p>
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="email">
  </p>
  <p>
    <label for="pwd">Password (min 8 characters)</label>
    <input id="pwd" name="password" type="password" required minlength="8" autocomplete="new-password">
  </p>
  <button type="submit">Create account</button>
</form>`,out:`Rendered result: three labelled fields; submitting
empty or with a malformed email/short password is
blocked by the browser with a message attached to
the offending field — zero JavaScript involved.`,why:'Labels are clickable and announced; type=email/minlength constraints trigger native validation. autocomplete tokens let browsers/password managers fill accurately instead of guessing.'},
   {t:'Study: choice controls grouped accessibly',code:`<form action="/enroll" method="post">
  <fieldset>
    <legend>Preferred batch</legend>
    <label><input type="radio" name="batch" value="morning" checked> Morning</label>
    <label><input type="radio" name="batch" value="evening"> Evening</label>
  </fieldset>
  <fieldset>
    <legend>Interests</legend>
    <label><input type="checkbox" name="interest" value="dsa"> DSA</label>
    <label><input type="checkbox" name="interest" value="web"> Web</label>
    <label><input type="checkbox" name="interest" value="ml"> ML</label>
  </fieldset>
  <p>
    <label for="track">Primary track</label>
    <select id="track" name="track">
      <option value="cs">CS Core</option>
      <option value="it">IT & Web</option>
    </select>
  </p>
</form>`,out:`Rendered result: one batch selectable at a time
(shared name), any mix of interests, and a dropdown.
Screen readers announce each group with its legend.`,why:'Radios in a group share one name so the browser enforces exclusivity; each checkbox submits only when checked. fieldset+legend give the group a spoken name.'},
   {t:'Study: numeric/date constraints and helper text',code:`<form action="/book" method="post">
  <p>
    <label for="age">Age</label>
    <input id="age" name="age" type="number" min="5" max="120" required>
  </p>
  <p>
    <label for="day">Preferred day</label>
    <input id="day" name="day" type="date" required aria-describedby="day-help">
    <small id="day-help">Weekend batches fill quickly.</small>
  </p>
  <p>
    <label for="code">Referral code (optional, format AB12)</label>
    <input id="code" name="code" type="text" pattern="[A-Z]{2}[0-9]{2}" title="Two letters followed by two digits, e.g. AB12">
  </p>
  <button type="submit">Book seat</button>
</form>`,out:`Rendered result: age outside 5-120 and codes not
matching two letters + two digits are rejected by
the browser; date shows a native calendar picker.`,why:'min/max and pattern encode the data contract in markup; aria-describedby wires the hint text to the control it explains so screen readers announce it after the label.'}
  ],
  walk:[[3,'label for="fullname" binds to input id="fullname": clicking "Full name" focuses the box and AT announces the label on focus.','association made'],[7,'type="email" switches mobile keyboards and arms built-in format checking at submit time.','type-driven UX'],[11,'minlength=8 makes the browser itself police password length with a native bubble message.','first-layer validation'],[13,'A real <button type="submit"> submits and is keyboard/screen-reader native — never a styled div.','semantically submittable']],
  walkWhy:'The browser performs association, widgets, keyboards and first-pass validation for free when markup is honest — JavaScript should only add what HTML cannot.',
  rules:['Every control needs a programmatically associated label (for/id or wrapping); placeholder is NOT a label substitute.','Controls without a name are not submitted at all.','Radio exclusivity comes from sharing one name within the form.','Client validation is a UX layer only — the server must re-validate everything (requests can be forged).'],
  mistakes:[
   {t:'Placeholder posing as the only label',bad:'<input type="email" placeholder="Email">',why:'The hint vanishes while typing, fails contrast checks, and gives screen-reader users an unlabelled mystery box. Usability research and audits both flag it; forgotten-purpose fields cause submission errors.',fix:'<label for="email">Email</label>\n<input id="email" type="email" placeholder="name@example.com">',tip:'Placeholders demonstrate FORMAT; labels state PURPOSE. A field needs the label always, the placeholder optionally.'},
   {t:'Div buttons and missing types inside forms',bad:'<form>\n  <div class="btn" onclick="save()">Save</div>\n  <button onclick="reset()">Reset view</button>  <!-- defaults to type=submit! -->\n</form>',why:'The div is invisible to keyboards/AT as a control, and any <button> without type inside a form SUBMITS it — so the innocent reset also fires a submission. Two bugs from ignoring element semantics.',fix:'<button type="submit">Save</button>\n<button type="button">Reset view</button>',tip:'In forms, write the type attribute on EVERY button deliberately; outside forms it is harmless to include.'}
  ],
  cmp:['Input type picker',['Data','type=','Free wins'],[['Email','email','@ keyboard, format check'],['Whole numbers in range','number + min/max','Stepper, range check'],['Calendar dates','date','Native picker'],['Secrets','password','Masking + manager integration'],['One of many','radio group / select','Exclusivity built in']]],
  diag:{kind:'flow',start:'Need user data',condition:'Semantic type exists?',trueAction:'Use it + constraints + label',falseAction:'text + pattern + label',end:'Server re-validates regardless'},
  apps:['Signup/login flows with autocomplete-powered one-tap fill.','Booking and application forms with date/number guards.','Surveys using grouped radios/checkboxes with legends.'],
  quizzes:[{q:'Two radio inputs become mutually exclusive when they share…',options:['The same id','The same name within the form','The same value','A fieldset only'],correct:1,why:'Name groups radios: choosing one clears the others with that name; ids must stay unique per element.'},
            {q:'A control with id but no name inside a submitted form…',options:['Submits under its id','Is excluded from the submitted data','Blocks submission','Uses its label text as key'],correct:1,why:'Submission sends name=value pairs; unnamed controls are skipped entirely.'}],
  take:['Labels are behaviour, not decoration — bind every control.','The specific type you choose buys keyboards, widgets and validation free.','name submits, id labels/links, constraints guard, server decides finally.'],
  rev:'label for=id. name = submitted key. types: email/number/date/password/radio/checkbox. required min max pattern. button type explicit.',
  assign:{p:'(Study) Build a feedback form: labelled email (required), a fieldset "Overall rating" with radios 1..3 named rating (value 3 pre-checked), a textarea labelled "Comments", and a submit button. Point action to /feedback method post.',s:`<!-- Study task: accessible feedback form -->`,sol:`<form action="/feedback" method="post">
  <p>
    <label for="fb-email">Email</label>
    <input id="fb-email" name="email" type="email" required autocomplete="email">
  </p>
  <fieldset>
    <legend>Overall rating</legend>
    <label><input type="radio" name="rating" value="1"> 1</label>
    <label><input type="radio" name="rating" value="2"> 2</label>
    <label><input type="radio" name="rating" value="3" checked> 3</label>
  </fieldset>
  <p>
    <label for="fb-comments">Comments</label>
    <textarea id="fb-comments" name="comments" rows="4" cols="40"></textarea>
  </p>
  <button type="submit">Send feedback</button>
</form>`}
},
{
  id:'html-accessibility-basics', course_id:'html-css', unit_id:'html-unit-2', order_index:4,
  title:'Accessibility Basics: Semantics, Focus & ARIA', desc:'Make pages operable by keyboard and assistive tech with native semantics first. Browser-rendered: study examples.',
  obj:['Explain why native elements beat ARIA re-implementations','Ensure visible focus, logical tab order and skip links','Use aria-label/aria-describedby and alt/roles only where semantics run out'],
  pre:['Forms & semantic structure'],
  outcomes:['Learner audits a page for the most common accessibility failures'],
  def:'Web accessibility means people using keyboards, screen readers, magnification or voice control can perceive and operate content. Native semantic HTML (buttons, links, labels, landmarks) supplies roles/names/states for free; ARIA attributes patch gaps for custom widgets, following the first rule of ARIA: prefer native elements.',
  simple:'Accessibility is not a feature bolted on at the end — it is the same good markup you have been learning, experienced through different senses and tools. A real <button> can be tabbed to, shows a focus ring, activates with Enter/Space, and announces itself as "button" — a styled <div onclick> does none of that until you painstakingly rebuild it all (and usually forget something). Keyboard users need a VISIBLE focus indicator and a sane tab order; a "Skip to content" link saves them tabbing through fifty nav links on every page. ARIA attributes are labels you stick on when HTML has no native element for the job — seasoning, never the main course.',
  hing:'Accessibility matlab page sab ke liye chal sake: sirf mouse wale ke liye nahi, keyboard se chalane wale, screen reader sunne wale, bade akshar padhne wale — sab ke liye. Sabse bada sach: asli <button> use karo to Tab se focus, Enter se click, aur screen reader ki ghoshna — sab muft milta hai. div ko button banaoge to ye sab khud banana padega aur aksar chook jaoge. Keyboard wale ke liye focus dikhna zaroori hai (outline kabhi delete mat karo bina behtar design ke), aur page ki shuruaat me "Skip to content" link unki 50 baar Tab dabane ki museebat bachata hai. ARIA (aria-label jaise) tab use karo jab HTML me us kaam ka tag hi nahi hai. Rangon ka contrast bhi zaroori hai — halka grey text safed par hai to aadhe log padh hi nahi payenge.',
  why:'Roughly 1 in 6 people lives with a significant disability; many jurisdictions legally require accessible digital services (and public exams in this course\'s domain increasingly test it). Accessible structure also improves SEO, mobile usability and code quality simultaneously — the curb-cut effect.',
  when:'Reach for native elements always; add ARIA only to name/state custom widgets (icon buttons, tabs, dialogs) and keep it accurate. Test with keyboard-only navigation and a screen reader pass; automate checks with Lighthouse/axe as a floor, not a ceiling.',
  syntax:'<a class="skip-link" href="#main">Skip to main content</a>\n<button type="button" aria-label="Close dialog">✕</button>\n<input aria-describedby="pwd-hint">\n<p id="pwd-hint">At least 8 characters.</p>',
  comp:[['Name/role/value','What AT announces: accessible name, element role, current state'],['Focus visible','Keyboard users\' cursor: never remove outline without replacement'],['First rule of ARIA','Use native HTML semantics before bolting ARIA onto generic elements']],
  ex:[
   {t:'Study: skip link + landmark structure',code:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Course page</title>
  <style>
    .skip-link { position: absolute; left: -9999px; }
    .skip-link:focus { position: static; }
  </style>
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header>
    <nav aria-label="Primary">
      <a href="/courses">Courses</a>
      <a href="/exams">Exams</a>
    </nav>
  </header>
  <main id="main" tabindex="-1">
    <h1>Data Structures</h1>
    <p>Lesson content begins here.</p>
  </main>
</body>
</html>`,out:`Rendered result: the skip link stays visually hidden
until a keyboard user tabs to it, then appears and
jumps focus past the navigation into the main region.
Screen readers list banner/navigation/main landmarks.`,why:'One link + one id collapses dozens of routine tab stops into one. aria-label differentiates this nav when a page has several (footer/breadcrumb), since all would otherwise announce identically.'},
   {t:'Study: naming icon-only controls and describing inputs',code:`<button type="button" aria-label="Search">
  <svg aria-hidden="true" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5"></circle></svg>
</button>

<label for="otp">One-time code</label>
<input id="otp" name="otp" inputmode="numeric" autocomplete="one-time-code"
       aria-describedby="otp-hint">
<p id="otp-hint">Six digits from your email. It expires in 10 minutes.</p>

<button type="button" aria-expanded="false">Show filters</button>`,out:`Rendered result: the magnifier-only button announces
"Search, button"; the hint is read after the OTP label;
the toggle reports its collapsed state to AT.`,why:'aria-hidden removes the decorative SVG from the accessibility tree so it is not announced as an unnamed image. aria-expanded must be kept truthful by JS as the panel toggles — stale ARIA is worse than none.'},
   {t:'Study: contrast and focus visibility in CSS',code:`<style>
  body { color: #1a1a1a; background: #ffffff; }        /* ~16:1 */
  .muted-fail { color: #9a9a9a; background: #ffffff; } /* ~2.8:1 fails body text */
  a, button { outline: none; }                        /* dangerous reset... */
  a:focus-visible, button:focus-visible {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
  }
</style>
<p>Readable body text with strong contrast.</p>
<p class="muted-fail">This paragraph demonstrates failing contrast - do not ship.</p>
<button type="button">Focusable demo</button>`,out:`Rendered result: the first paragraph passes easily;
the grey demo text visibly washes out (~2.8:1 < 4.5:1
minimum for body text). Keyboard focus draws a clear
blue ring instead of the removed default.`,why:'WCAG AA asks 4.5:1 for normal text (3:1 for large). Removing outlines globally strands keyboard users without a cursor — :focus-visible restyles the indicator for keyboard focus specifically.'}
  ],
  walk:[[13,'The skip link is the first focusable element; off-screen positioning hides it visually until :focus reveals it for keyboard users.','hidden until needed'],[15,'nav is a landmark; aria-label="Primary" distinguishes it in landmark lists when other navs exist.','named landmark'],[20,'main carries the target id; tabindex="-1" lets the browser move focus there programmatically without adding it to the tab order.','jump destination']],
  walkWhy:'Landmarks + skip link + managed focus replicate, for keyboard/AT users, the instant visual scanning sighted mouse users do unconsciously.',
  rules:['Do not use ARIA roles to fake what a native element already is (<div role="button"> needs tabindex, key handlers, focus styles — use <button>).','Interactive elements must be keyboard-reachable in a logical order; positive tabindex values break that order and are an anti-pattern.','Colour must never be the ONLY signal (errors also need text/icons).','aria-* states (expanded, pressed, selected) must be maintained truthfully by your JS.'],
  mistakes:[
   {t:'Removing focus outlines globally for aesthetics',bad:'*:focus { outline: none; }',why:'Designers dislike the "ugly" ring on mouse click, so they nuke it — and keyboard users lose their only position indicator, making the page a maze navigated blind. This single line fails WCAG focus-visible criteria.',fix:':focus-visible {\n  outline: 3px solid #005fcc;\n  outline-offset: 2px;\n}',tip:'Style the ring beautifully instead of deleting it; :focus-visible targets keyboard-driven focus specifically.'},
   {t:'Div-button with click handler only',bad:'<div class="btn" onclick="buy()">Buy now</div>',why:'Not focusable, not Enter/Space operable, announces as plain text. Retrofitting tabindex + keydown + role usually still misses behaviours (disabled states, form participation) the native element includes free.',fix:'<button type="button" onclick="buy()">Buy now</button>',tip:'If it acts like a button it must BE a button; links navigate, buttons act — choose by behaviour.'}
  ],
  cmp:['Native element vs ARIA replica',['Capability','<button>','div role="button"'],[['Focusable by Tab','Automatic','Needs tabindex="0"'],['Enter/Space activation','Automatic','Custom keydown code'],['Announced role/state','Automatic','Manual, error-prone'],['Disabled support','Built-in attribute','Simulate everything']]],
  diag:{kind:'flow',start:'Need an interactive control',condition:'Native element exists?',trueAction:'Use it (button/link/input)',falseAction:'Custom widget + accurate ARIA + keyboard support',end:'Test by keyboard alone'},
  apps:['Government/exam portals legally requiring WCAG conformance.','E-commerce checkouts operable without a mouse.','Design systems where a11y-tested primitives multiply across products.'],
  quizzes:[{q:'The first rule of ARIA says…',options:['Always add roles','Prefer native HTML semantics; use ARIA only when needed','ARIA overrides HTML','Avoid landmarks'],correct:1,why:'Native elements carry correct behaviour free; ARIA patches genuine gaps rather than decorating everything.'},
            {q:'Why is a global *:focus { outline: none } harmful?',options:['It slows rendering','Keyboard users lose sight of their current focus position','Outlines are required by HTML parser','It breaks mobile layout'],correct:1,why:'The focus indicator is the keyboard cursor; removing it without a replacement strands non-mouse users.'}],
  take:['Semantics first, ARIA second, accuracy always (stale ARIA misleads).','Keyboard operability: logical tab order, visible focus, skip links.','Contrast 4.5:1 for body text; never signal by colour alone.'],
  rev:'Native button/link/labels > ARIA replicas. Skip link + landmarks. :focus-visible ring. aria-label names icon buttons; describedby for hints. Test keyboard-only.',
  assign:{p:'(Study) Fix this fragment and explain in an HTML comment what you changed: <div class="btn" onclick="go()">Start</div> <img src="start.png"> <a href="/x">click here</a>. Provide the corrected three elements (button, img with alt, descriptive link).',s:`<!-- Study task: correct the three elements described -->`,sol:`<!-- Fixes: real button (keyboard/AT operable), alt text for the image,
     descriptive link text that survives out-of-context listing. -->
<button type="button" onclick="go()">Start quiz</button>
<img src="start.png" alt="Illustration of a quiz start screen with a play symbol">
<a href="/x">Read the quiz instructions</a>`}
},
{
  id:'css-selectors-cascade', walkEx:2, course_id:'html-css', unit_id:'html-unit-1', order_index:1,
  title:'CSS Selectors, Specificity & the Cascade', desc:'Target elements precisely and understand which rule wins when styles collide. Browser-rendered: study examples.',
  obj:['Write type/class/id/attribute and combinator selectors','Use specificity and source order to predict the cascade winner','Apply inheritance and the universal selector deliberately'],
  pre:['HTML document structure','Text & lists & forms'],
  outcomes:['Learner styles pages without specificity wars and debug-conflicts confidently'],
  def:'CSS rules pair selectors with declaration blocks. The cascade resolves competing declarations by origin/importance, then specificity (a weighted count of IDs, classes/attributes/pseudo-classes, and types in the selector), then source order. Some properties inherit from ancestors when not set directly.',
  simple:'Selectors are CSS\'s way of pointing: p points at every paragraph, .note at anything wearing class "note", #title at one unique element, and combos like article p (paragraphs inside articles) or ul > li (direct children) aim finer. When two rules point at the same element with different colours, a scoring system called specificity decides: IDs outrank classes, classes outrank plain tags — think of it as (1,0,0) beating (0,2,0). If scores tie, the rule written LATER wins. Separately, some properties like text colour and font travel down the family tree (inheritance), while borders and margins do not — knowing which saves hours of "why is this styled?" detective work.',
  hing:'Selector matlab CSS ka nishana: p likha to saare paragraphs, .warning likha to us class wale sab, #header sirf ek khaas element. Space wala selector (article p) matlab article KE ANDAR ke paragraph, > wala (ul > li) matlab seedhe bachche. Asli khel hai SPECIFICITY — jab do rules ek hi element par takrayen to kaun jitega: ID sabse bhaari, phir class, phir tag. Score barabar ho to jo BAAD me likha hai woh jitega (source order). Isliye !important baar-baar lagana buri aadat hai, jung badhti jayegi. Kuch properties virasat me milti hain — color, font-family parent se bacho ko jaati hain — lekin margin/border nahi milte. Jitna specific selector kam se kam rakho ge, baad me changes utne aasan honge. Class par bharosa rakho, ID ko styling ke liye kam hi ghaseeto.',
  why:'Every "my CSS is not applying" mystery is a selectors/cascade issue. Specificity discipline prevents unwinnable override wars in growing codebases and makes overrides intentional rather than accidental.',
  when:'Prefer single-class selectors for components (low, flat specificity); reserve IDs for JS hooks/anchors; reach for combinators to express relationships, not decoration. Use inheritance for typography; component-level resets for the rest.',
  syntax:'.card { padding: 1rem; }\n.card .title { font-weight: 700; }        /* descendant (0,2,0) */\n#hero .title { color: navy; }            /* (1,1,0) wins over above */\na[href^="https"] { ... }                 /* attribute starts-with */\nli:first-child { ... }                   /* pseudo-class counts as class */',
  comp:[['Specificity tuple','(IDs, classes/attrs/pseudo-classes, types) compared lexicographically'],['Source order','Later equal-specificity declarations win'],['Inheritance','Font/colour/text properties flow down unless overridden; layout properties do not']],
  ex:[
   {t:'Study: selector zoo on one fragment',code:`<style>
  p { color: #333; }
  .note { background: #fff8d6; }
  #exam-tip { border-left: 4px solid #e0a800; }
  article p { line-height: 1.6; }
  article > p:first-of-type { font-size: 1.125rem; }
  a[href$=".pdf"]::after { content: " (PDF)"; }
</style>
<article>
  <p class="note" id="exam-tip">Revise daily.</p>
  <p>Read the <a href="guide.pdf">guide</a>.</p>
</article>`,out:`Rendered result: first paragraph gets base color and
line-height, pale-yellow note background, gold left
border, and larger first-paragraph size. The link
visibly gains a " (PDF)" suffix from ::after content.`,why:'Five selector forms cooperate on two elements: type, class, ID, descendant, child+pseudo-class, and attribute-ends-with driving generated content.'},
   {t:'Study: specificity decides collisions',code:`<style>
  p { color: green; }              /* (0,0,1) */
  .msg { color: blue; }            /* (0,1,0) */
  #status { color: red; }          /* (1,0,0) */
  p.msg { color: purple; }         /* (0,1,1) */
  #status { color: darkred; }      /* same score, later -> wins among IDs */
</style>
<p class="msg" id="status">System is live.</p>`,out:`Rendered result: the text is darkred.
(1,0,0) beats (0,1,1); between the two identical
ID rules the later one wins the tie.`,why:'Tuple comparison is lexicographic: a single ID outweighs any pile of classes. Remove both ID rules mentally and purple (0,1,1) would beat blue (0,1,0) before green (0,0,1).'},
   {t:'Study: inheritance vs non-inherited properties',code:`<style>
  .panel {
    color: #123;
    font-family: Georgia, serif;
    border: 2px solid #123;
    padding: 1rem;
  }
  .panel .reset { color: initial; }
</style>
<div class="panel">
  <h2>Inherited ink</h2>
  <p>Children inherit color and font automatically,
     but NOT the border or padding.</p>
  <p class="reset">This one bails out to the default ink.</p>
</div>`,out:`Rendered result: heading and first paragraph appear
in dark blue serif inside one bordered padded box.
The reset paragraph shows the browser default color,
still inside the same border (border belongs to
the panel box itself, not copied to children).`,why:'color/font are inherited properties; border/padding are not — the children never grow their own borders. initial forces the property\'s specification default, cutting the inheritance chain.'}
  ],
  walk:[[2,'Candidate colour declarations for our p: green(0,0,1), blue(0,1,0), purple(0,1,1), red & darkred (1,0,0).','five candidates'],[4,'Compare tuples from the left: ID column decides first — the two (1,0,0) rules eliminate everything class/type-only.','IDs survive'],[6,'Between the surviving pair, specificity ties, so source order applies: darkred is written later and wins.','final: darkred']],
  walkWhy:'The cascade is a deterministic referee: importance/origin first, specificity tuple second, position last. Debugging styles is simply replaying its scoring.',
  rules:['Inline styles outrank selector rules (short of !important); !important inverts normal origins — reserve for utilities/overrides, sparingly.','Universal selector * has zero specificity but still participates; use it for resets consciously.','Pseudo-classes count as classes (:hover, :first-child); pseudo-elements (::before) count as types.','If a selector needs an ID + multiple classes to win, refactor: flatten specificity with single-class components or layers.'],
  mistakes:[
   {t:'Escalating specificity wars with !important',bad:'.btn { color: white !important; }\n.sidebar .btn { color: black !important; }  /* next dev adds #page .sidebar .btn !important ... */',why:'Each !important demands a bigger hammer later; styles become append-only because nobody can predict safe edits. The codebase ends up fossilised around its oldest mistakes.',fix:'/* one flat class per component; variants as additional classes */\n.btn { color: white; }\n.btn--dark { color: black; }',tip:'Treat !important like a code smell alarm: utilities layers and third-party overrides only, reviewed every time.'},
   {t:'Expecting a more specific-looking rule to win despite lower tuple',bad:'/* hopes 11 classes beat the ID */\n.a.b.c.d.e.f.g.h.i.j.k { color: blue; }\n#status { color: red; }',why:'Specificity compares lexicographically, not by total count: (1,0,0) > (0,11,0) forever. No number of classes sums to an ID.',fix:'/* match at equal-or-lower altitude, or restructure the ID usage for styling */\n.status { color: red; }  /* prefer class-based system-wide */',tip:'Count (IDs, classes, types) columns separately; win column by column like odometer digits.'}
  ],
  cmp:['Selector targeting power',['Selector','Matches','Specificity'],[['*','Everything','(0,0,0)'],['p','All p elements','(0,0,1)'],['.note','class="note" any tag','(0,1,0)'],['#hero','The one id="hero"','(1,0,0)'],['article > p.lead','Direct p children of article with class','(0,1,2)']]],
  diag:{kind:'box'},
  apps:['Component-library theming via disciplined single-class selectors.','Print/email overrides layered without touching base rules.','Debugging "why is this blue" in DevTools\' cascade pane (same scoring).'],
  quizzes:[{q:'Which selector wins for the same element: #a .b (1,1,0) vs .x .y .z p (0,3,1)?',options:['.x .y .z p (more parts)','#a .b (ID column dominates)','Whichever is later','The type selector'],correct:1,why:'Lexicographic tuples: compare IDs first — 1 beats 0 regardless of later columns.'},
            {q:'Two rules have IDENTICAL specificity setting color differently. The winner is…',options:['Alphabetically first','The one later in source order','The shorter selector','Both merge'],correct:1,why:'Source order is the final cascade tie-breaker (within same origin/importance layer).'}],
  take:['Count tuples (ID, class, type); later wins ties; inline and !important sit above.','Style with flat single classes to keep overrides sane.','Colour/font inherit; box properties do not.'],
  rev:'Selectors: type .class #id [attr] space > + ~ :pseudo. Specificity tuple then order. Inheritance for text props. Avoid !important wars.',
  assign:{p:'(Study) Style this fragment with ONE style block: all <li> inside .menu get padding .5rem; the li.current additionally bold; links ending in .pdf get a trailing " (PDF)" via ::after; and make #special link purple beating a generic a {color: blue} rule placed BEFORE it. Include the HTML.',s:`<!-- Study task: style block + fragment using layered selectors -->`,sol:`<style>
  a { color: blue; }
  .menu li { padding: 0.5rem; }
  .menu li.current { font-weight: 700; }
  a[href$=".pdf"]::after { content: " (PDF)"; }
  #special { color: purple; }
</style>
<ul class="menu">
  <li class="current"><a href="/home">Home</a></li>
  <li><a href="/syllabus.pdf">Syllabus</a></li>
  <li><a id="special" href="/exams">Exams</a></li>
</ul>`}
},
{
  id:'css-box-model-positioning', course_id:'html-css', unit_id:'html-unit-1', order_index:2,
  title:'Box Model, Display & Positioning', desc:'Content/padding/border/margin math, block vs inline, and relative/absolute/fixed placement. Browser-rendered: study examples.',
  obj:['Compute rendered size under content-box vs border-box','Predict block, inline and inline-block layout behaviour','Place elements with relative/absolute/fixed/sticky and z-index'],
  pre:['Selectors & cascade'],
  outcomes:['Learner controls spacing deliberately instead of nudging blindly'],
  def:'Every element renders as nested boxes: content, padding (inner space), border, and margin (outer space). box-sizing decides whether declared width covers content only (content-box, default) or content+padding+border (border-box). display sets the box type (block stacks full-width; inline flows with text; inline-block mixes), and position schemes (static/relative/absolute/fixed/sticky) control placement relative to flow, ancestors or viewport.',
  simple:'Picture every element as a framed photo. The picture itself is the content; the mat around it inside the frame is padding; the wooden frame is the border; the wall space you leave between frames is margin. The famous beginner confusion: width:200px sets only the PICTURE size by default, so padding and border pile on top making the total wider — box-sizing: border-box changes the contract so 200px means the whole framed thing, which is why professionals set it globally. Display decides social behaviour: block elements are loners taking whole rows (div, p), inline elements flow mid-sentence ignoring width/height (span, a), inline-block socialises with sizing. Positioning then lets you budge (relative), pin to a corner of a parent (absolute), or glue to the screen (fixed/sticky headers).',
  hing:'Har element ko ek dabbe (box) samjho: andar content, uske ichaaron ore padding (andar ki khaali jagah), phir border, sabse bahar margin (dusre dabbon se doori). Sabse badi galti yahi hoti hai: width:200px likha matlab sirf CONTENT 200px, padding+border upar se jud jayenge to kul chaudi zyada hogi! Isiliye har professional shuruaat me * { box-sizing: border-box; } laga deta hai — phir 200px matlab pura dabba 200 ka. Display property ka vyavhaar tay karti hai: block (poori line gherne wala: div, p), inline (line ke beech behne wala: span, a — in par width/height nahi lagta), inline-block (behne ke saath size bhi). Position me: relative apni jagah se thoda hilna, absolute sabse karibi positioned parent ke kone pakadna, fixed screen par chipakna (scroll par bhi wahin), sticky chipakne aur behne ka milajula roop hai. Aur haan, upar-neeche ke margin kabhi kabhi judne ke bajaye bada wala jeet jata hai — ye margin collapsing hai!',
  why:'Layout bugs are overwhelmingly box-model arithmetic and display-type misunderstandings. Mastering border-box, margin collapsing and positioning contexts eliminates the "mystery gap/overlap" class of defects before flex/grid even enter.',
  when:'Set border-box globally; space siblings with gap/margins intentionally; absolute-position badges/overlays within a position:relative parent; fixed for persistent chrome, sticky for in-flow headers. Reach for flex/grid (next) for real layout instead of float/absolute hacks.',
  syntax:'*, *::before, *::after { box-sizing: border-box; }\n.card { width: 240px; padding: 16px; border: 1px solid #ccc; margin: 0 auto; }\n.badge { position: absolute; top: 8px; right: 8px; }',
  comp:[['border-box','width/height include padding+border: arithmetic you can trust'],['margin: 0 auto','Centres a fixed-width block horizontally (auto side margins)'],['Positioning context','Absolutely-positioned boxes anchor to nearest ancestor with non-static position']],
  ex:[
   {t:'Study: content-box vs border-box arithmetic',code:`<style>
  .demo { width: 200px; padding: 20px; border: 5px solid #333; margin-bottom: 12px; }
  .content-box { box-sizing: content-box; background: #ffe1e1; }
  .border-box  { box-sizing: border-box;  background: #e1ffe7; }
</style>
<div class="demo content-box">content-box</div>
<div class="demo border-box">border-box</div>`,out:`Rendered result: the red box measures
200 + 40 padding + 10 border = 250px wide overall.
The green box is exactly 200px overall; its content
area shrinks to 150px to make room.`,why:'Same declared width, different contract. Two 50%-wide padded columns only sit side-by-side under border-box — the practical reason for the global reset idiom.'},
   {t:'Study: display types side by side',code:`<style>
  .b { display: block; background: #dbeafe; padding: 4px; }
  .i { display: inline; background: #fef3c7; width: 300px; height: 80px; padding: 4px; }
  .ib { display: inline-block; background: #dcfce7; width: 120px; height: 40px; padding: 4px; }
</style>
<span class="b">block one</span>
<span class="b">block two</span>
<p>Text <span class="i">inline ignores width/height</span> continues.</p>
<span class="ib">inline-block A</span>
<span class="ib">inline-block B</span>`,out:`Rendered result: the two blocks stack on separate
full-width rows. The inline span flows within its
sentence, its 300x80 size request ignored.
The two inline-blocks sit side by side at 120x40.`,why:'display overrides the element\'s default nature (even for span). Inline boxes only honour horizontal padding/margins for layout, a perennial source of "my height does nothing" reports.'},
   {t:'Study: absolute badge inside a relative card + sticky header',code:`<style>
  .card { position: relative; width: 260px; border: 1px solid #999; padding: 16px; }
  .badge {
    position: absolute; top: 8px; right: 8px;
    background: crimson; color: white; padding: 2px 8px; border-radius: 999px;
  }
  .toolbar { position: sticky; top: 0; background: #111; color: #fff; padding: 8px; }
</style>
<div class="toolbar">Course tools (sticks on scroll)</div>
<div class="card">
  <span class="badge">NEW</span>
  <h3>Graph Algorithms</h3>
  <p>Starts Monday. Seats limited.</p>
</div>`,out:`Rendered result: the NEW pill hugs the card's
top-right corner regardless of flow; the toolbar
scrolls normally until it hits the viewport top,
then sticks while content moves beneath it.`,why:'position:relative on the card creates the containing block the absolute badge anchors to (without it, the badge would pin to some farther ancestor/page). Absolute boxes leave normal flow entirely.'}
  ],
  walk:[[2,'content-box math: total = 200 (content) + 2×20 padding + 2×5 border = 250px consumed horizontally.','overflow by construction'],[3,'border-box flips the budget: 200 total, so content = 200 − 40 − 10 = 150px.','predictable outer size'],[6,'margin sits outside both computations — it separates boxes without belonging to either.','margin external']],
  walkWhy:'Nearly every "two 50% columns will not fit" bug is this subtraction done wrong; border-box aligns the declared number with the space actually consumed.',
  rules:['Vertical margins between siblings (and some parent/child cases) collapse to the larger value instead of adding.','Inline boxes ignore width/height and vertical margin effects on layout.','Absolutely positioned elements are removed from flow and anchor to the nearest positioned ancestor (else the initial containing block).','z-index only works on positioned (or flex/grid-item) elements and within stacking contexts.'],
  mistakes:[
   {t:'Badge pinning to the page instead of the card',bad:'.badge { position: absolute; top: 0; right: 0; }\n/* .card has no positioning: badge flies to the page corner */',why:'Absolute coordinates resolve against the nearest ancestor whose position is not static. With none, that ancestor is effectively the page — so every badge congregates in the same global corner.',fix:'.card { position: relative; }\n.badge { position: absolute; top: 8px; right: 8px; }',tip:'Absolute child? Give its intended parent position: relative. This one-liner is the fix in most "runaway element" reports.'},
   {t:'Doubled spacing confusion from margin collapsing',bad:'/* paragraphs each margin: 24px 0; author expects 48px gaps, sees 24px */',why:'Adjacent vertical margins collapse to max, not sum — deliberate typographic behaviour from print. It is not a browser bug, and padding/flex gap behave differently by design.',fix:'/* pick ONE spacing owner: use margin-bottom only, or parent { display: grid; gap: 24px; } */',tip:'Standardise on single-direction margins (e.g. always margin-block-end) so collapse stops surprising the team.'}
  ],
  cmp:['Display behaviours',['display','New row?','width/height apply?'],[['block','Yes, full width','Yes'],['inline','No, flows in text','No (mostly ignored)'],['inline-block','No, flows','Yes'],['none','Removed from layout & AT','—']]],
  diag:{kind:'box'},
  apps:['Card grids with corner badges and predictable gutters.','Sticky table headers and toolbars in dashboards.','Centred fixed-width containers via margin auto.'],
  quizzes:[{q:'width:100px; padding:10px; border:5px under border-box yields content width…',options:['100px','70px','130px','85px'],correct:1,why:'Total is fixed at 100; padding (20) + border (10) consume 30, leaving 70px for content.'},
            {q:'An absolutely positioned child anchors its top/right to…',options:['Its parent always','Nearest ancestor with position other than static','The body always','Its previous sibling'],correct:1,why:'The containing block for abs-pos is the closest positioned ancestor; static ancestors are skipped.'}],
  take:['border-box everywhere; margins separate, padding pads, borders frame.','Know your display type before fighting size properties.','relative parent + absolute child is the anchoring idiom; sticky glues in-flow.'],
  rev:'Total(content-box)=w+2p+2b; border-box fixes total=w. Block stacks, inline flows, inline-block both. Abs anchors to nearest positioned ancestor. Vertical margins collapse.',
  assign:{p:'(Study) With a global border-box reset, style .ticket (width 300px, padding 16px, 2px dashed border, centred with margin auto) containing a .seat badge absolutely positioned bottom-right. Include the positioning context and comment the resulting content width (264px).',s:`<!-- Study task: border-box ticket with absolute badge -->`,sol:`<style>
  *, *::before, *::after { box-sizing: border-box; }
  .ticket {
    position: relative;          /* anchor for the badge */
    width: 300px;                /* total incl. padding+border */
    padding: 16px;
    border: 2px dashed #555;
    margin: 24px auto;           /* centred horizontally */
  }
  .seat {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-weight: 700;
  }
</style>
<!-- Content width = 300 - 2*16 padding - 2*2 border = 264px -->
<div class="ticket">
  <p>Vadodara → Pune, Seat reserved</p>
  <span class="seat">14A</span>
</div>`}
},
{
  id:'css-colors-units-typography', walkEx:2, course_id:'html-css', unit_id:'html-unit-1', order_index:3,
  title:'Colours, Units & Typography', desc:'Hex/RGB/HSL colour, px vs rem/em/%/vw units, and readable type systems. Browser-rendered: study examples.',
  obj:['Specify colours in hex, rgb/rgba and hsl with alpha','Choose relative units (rem, em, %, vw/vh) for scalable layouts','Set font stacks, sizes, line-height and spacing for readable text'],
  pre:['Box model & positioning'],
  outcomes:['Learner builds a small, scalable visual system instead of pixel-guessing'],
  def:'Colours may be written as hex (#rrggbb), rgb()/rgba() channels, or hsl() hue/saturation/lightness, optionally with alpha transparency. Lengths divide into absolute (px) and relative units: em (element font size), rem (root font size), % (of a reference), and viewport units vw/vh. Typography combines font-family stacks, font-size, weight, line-height and letter-spacing.',
  simple:'Colour in CSS is light mixing: hex codes like #ff5733, or rgb(255, 87, 51), describe red/green/blue amounts, and adding an alpha channel (rgba, or the / 50% syntax) makes translucency. HSL speaks human: pick a hue on the colour wheel, then dial saturation and lightness — far easier for building matching palettes. For sizes, pixels are exact but rigid; relative units flex: rem anchors to the root font size (respecting users who enlarge text), em to the local font, % to a parent dimension, vw/vh to the screen itself. Readable type needs more than size: line-height around 1.5 gives text room to breathe, and sane line lengths (45–75 characters) stop eyes getting lost.',
  hing:'Rang teen tareekon se likhe ja sakte hain: hex (#e74c3c), rgb(231, 76, 60), aur hsl(6, 78%, 57%) — hsl sabse insaani hai kyunki rang ka pahiya (hue), gehraai (saturation) aur halka-gehra (lightness) alag se dial kar sakte ho. Paardarshita ke liye alpha jod do (rgba ya / 0.5). Size ke liye px to fix hai, lekin samjhdaari relative units me hai: rem hamesha root (html) ke font-size se gunna hota hai — 1.5rem matlab dedh guna — aur ye user ki badi-font setting ka samman karta hai; em apne parent ke font par nirbhar hai, isliye nesting me gunna hota chala jata hai (savdhaan!). % parent ke size ka hissa hai, vw/vh screen ka. Achhi typography ke liye line-height 1.5 ke aaspaas rakho, ek line me 45-75 akshar se zyada nahi. Aur font-family hamesha fallback ke saath likho: Georgia, "Times New Roman", serif — pehla na mile to dusra chalega.',
  why:'Relative units and type scales are what separate layouts that survive phones, zooming and user font settings from brittle pixel dioramas. Colour systems in HSL/tokens enable consistent theming (including dark mode) later.',
  when:'Root-size the document in px-on-html only via % (or leave default 16px), size components in rem, use em inside components meant to scale with local font size, %/fr/vw for layout geometry. Establish colour tokens (custom properties) early.',
  syntax:':root { --brand: hsl(210 90% 45%); --ink: #1a1a1a; }\nbody { font: 1rem/1.5 system-ui, Segoe UI, Roboto, sans-serif; color: var(--ink); }\nh1 { font-size: clamp(1.75rem, 4vw, 2.5rem); }',
  comp:[['rem vs em','Root-anchored (predictable) vs parent-anchored (compounding) font-relative units'],['Alpha','Fourth colour channel: rgba()/hex8/slash syntax controls translucency'],['clamp(min, pref, max)','Fluid sizing with guard rails, the modern responsive-type tool']],
  ex:[
   {t:'Study: three colour notations + alpha',code:`<style>
  .chip { padding: 10px; color: white; margin-bottom: 6px; }
  .hex  { background: #2563eb; }
  .rgb  { background: rgb(37, 99, 235); }
  .hsl  { background: hsl(217, 91%, 60%); }
  .veil { background: rgba(37, 99, 235, 0.25); color: #123; }
</style>
<div class="chip hex">Hex #2563eb</div>
<div class="chip rgb">rgb(37, 99, 235)</div>
<div class="chip hsl">hsl(217 91% 60%)</div>
<div class="chip veil">Same blue at 25% alpha over white</div>`,out:`Rendered result: three matching royal-blue bars
(the notations denote subsets of the same colour
space; hsl value is the equivalent rounding), and
a pale translucent wash for the alpha example.`,why:'Notations are interchangeable descriptions of sRGB colour; choose per task — hex from design tools, hsl for systematic lightening/darkening, alpha forms for overlays. (The hsl triple here is rounded for readability.)'},
   {t:'Study: rem scaling and the em compounding trap',code:`<style>
  html { font-size: 16px; }
  .rem-demo { font-size: 1.25rem; }          /* 20px everywhere */
  .em-outer { font-size: 1.25em; }           /* 20px under body */
  .em-inner { font-size: 1.25em; }           /* 25px: compounds! */
  .fluid { font-size: clamp(1rem, 2.5vw, 1.5rem); }
</style>
<p class="rem-demo">rem stays 20px at any depth.</p>
<div class="em-outer">
  Outer 20px
  <p class="em-inner">Inner em compounds to 25px.</p>
</div>
<p class="fluid">Fluid size, clamped between 16 and 24px.</p>`,out:`Rendered result: rem text uniform; nested em grows
multiplicatively (16 x 1.25 x 1.25 = 25px). The fluid
line scales with viewport width inside its clamps.`,why:'em compounds through nesting because each level multiplies its parent — powerful for component-internal scaling, treacherous as a global system. rem resets the reference to the root at every use.'},
   {t:'Study: a readable type block with custom properties',code:`<style>
  :root {
    --ink: #1c2430;
    --muted: #5b6572;
    --brand: hsl(210, 90%, 45%);
  }
  article {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.0625rem;
    line-height: 1.65;
    color: var(--ink);
    max-width: 65ch;
  }
  article h2 { font-family: system-ui, sans-serif; color: var(--brand); letter-spacing: 0.01em; }
  .byline { color: var(--muted); font-size: 0.875rem; }
</style>
<article>
  <h2>Reading comfort</h2>
  <p class="byline">By Diya S · 4 min read</p>
  <p>Generous line-height and a capped measure keep long
     lessons readable without eye strain.</p>
</article>`,out:`Rendered result: serif body text at ~17px with airy
leading in a ~65-character column, a sans brand-blue
heading, and a smaller grey byline — all restyle-able
by editing three variables on :root.`,why:'Custom properties (--tokens) centralise the palette: dark mode later becomes variable swaps under a media query rather than a find-and-replace excavation.'}
  ],
  walk:[[2,'html font-size 16px defines the rem: 1.25rem = 20px regardless of where .rem-demo sits in the tree.','rem root-locked'],[4,'.em-outer computes 16 × 1.25 = 20px, becoming the reference font for its children.','em reference shifts'],[5,'.em-inner multiplies the NEW local size: 20 × 1.25 = 25px — compounding demonstrated numerically.','em compounds']],
  walkWhy:'Unit choice is a reference-frame decision: rem asks "relative to the document", em asks "relative to here" — both legitimate, catastrophically different under nesting.',
  rules:['Do not set html font-size in px below defaults to "fix" designs — it overrides user accessibility settings; use % if scaling the root at all.','Line-height should be unitless (1.5) so it scales with each element\'s own font size rather than computing to a fixed px inherited everywhere.','Colour alone never encodes state (pair with text/icons); verify contrast for every text/background pair (4.5:1 body).','Viewport units on mobile: 100vh includes/excludes browser chrome differently across engines — prefer dvh/svh where appropriate.'],
  mistakes:[
   {t:'Designing the whole layout in px',bad:'/* font sizes, widths, paddings: everything in px */\n.card { width: 320px; padding: 24px; font-size: 14px; }',why:'Pixel-frozen layouts ignore user font scaling (an accessibility setting) and require breakpoint whack-a-mole at every new screen. Text that cannot grow with user settings fails zoom requirements.',fix:'.card { max-width: 22rem; padding: 1.5rem; font-size: 0.95rem; }',tip:'px remains fine for hairlines/borders/shadows; type and component geometry belong in rem/%/fr.'},
   {t:'Setting line-height in px on a container',bad:'article { font-size: 16px; line-height: 24px; }\narticle h2 { font-size: 32px; }  /* inherits computed 24px: lines overlap */',why:'A length line-height is computed once and inherited as that fixed length, so larger child text gets crushed spacing. The bug surfaces only when heading styles arrive.',fix:'article { line-height: 1.5; }  /* unitless multiplier re-derives per element */',tip:'Unitless line-height is the professional default for text containers.'}
  ],
  cmp:['Unit field guide',['Unit','Relative to','Best for'],[['px','Device pixel grid (scaled)','Borders, hairlines, shadows'],['rem','Root (html) font-size','Type scale, spacing system'],['em','Current element font-size','Component-internal padding/badges'],['%','Parent dimension/that property\'s base','Fluid widths (know each property\'s base!)'],['vw/vh','1% of viewport width/height','Hero sections, fluid type via clamp']]],
  diag:{kind:'box'},
  apps:['Design-token palettes via :root variables for theming/dark mode.','Fluid hero type with clamp across phone→desktop.','Long-form lesson pages tuned with measure + leading.'],
  quizzes:[{q:'html{font-size:16px}. An element at font-size:1.5em inside a 20px parent computes to…',options:['24px (root<x>1.5)','30px (parent 20 x 1.5)','16px','1.5px'],correct:1,why:'em multiplies the inherited/local reference — the parent\'s computed 20px — unlike rem which would give 24px.'},
            {q:'Why prefer unitless line-height: 1.5 over line-height: 24px on containers?',options:['Shorter to type','It re-multiplies each element\'s own font-size when inherited, avoiding crushed headings','px is invalid there','Unitless is newer'],correct:1,why:'Unitless values inherit as a factor, so a 32px heading gets 48px leading instead of a fixed 24px.'}],
  take:['Colour notations are one space in three dialects — HSL systems, hex handoffs, alpha overlays.','rem for global scale, em for local component scaling; beware compounding.','Unitless line-height, token variables, contrast-checked pairs: the small professional habits.'],
  rev:'hex/rgb/hsl + alpha. rem=root font, em=local font (compounds), % parent, vw/vh viewport, ch for measure. line-height unitless 1.5ish. Tokens on :root.',
  assign:{p:'(Study) Build a palette card: :root tokens --brand (hsl 150 60% 35%) and --paper #fafafa; body font system-ui 1rem/1.6; .card max-width 40ch padding 1.25rem bg var(--paper); h2 inside uses var(--brand) at clamp(1.25rem, 3vw, 1.75rem).',s:`<!-- Study task: token-driven card with fluid heading -->`,sol:`<style>
  :root {
    --brand: hsl(150, 60%, 35%);
    --paper: #fafafa;
  }
  body { font: 1rem/1.6 system-ui, Segoe UI, Roboto, sans-serif; }
  .card {
    max-width: 40ch;
    padding: 1.25rem;
    background: var(--paper);
    border: 1px solid #ddd;
  }
  .card h2 {
    color: var(--brand);
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    margin-top: 0;
  }
</style>
<div class="card">
  <h2>Monsoon Batch</h2>
  <p>Weekend cohort for working professionals.</p>
</div>`}
},
{
  id:'css-responsive-media-queries', course_id:'html-css', unit_id:'html-unit-3', order_index:1,
  title:'Responsive Design & Media Queries', desc:'Adapt layouts to any screen with fluid widths and breakpoint-driven rules. Browser-rendered: study examples.',
  obj:['Build mobile-first stylesheets with min-width breakpoints','Combine fluid units, max-width containers and flexible media','Query user preferences (prefers-reduced-motion / color-scheme)'],
  pre:['Flexbox & grid (existing topic)','Units & typography'],
  outcomes:['Learner ships layouts that survive phones, tablets and desktops gracefully'],
  def:'Responsive design adapts layout to the viewing environment using fluid geometry and media queries — conditional CSS blocks (@media) applied when features such as viewport width, orientation or user preferences match. Mobile-first authoring writes small-screen styles as the base and layers enhancements via min-width queries.',
  simple:'A responsive page is water, not ice: it takes the shape of whatever screen pours it. Three ingredients make it work. One: fluid sizes (%, rem, max-width) instead of fixed pixel cages, so things stretch and squeeze smoothly. Two: flexible media — images capped at max-width:100% so they never burst their containers. Three: media queries, which are CSS if-statements: "@media (min-width: 768px) { ... }" means "only on screens at least tablet-wide, switch to the two-column arrangement". The professional workflow is mobile-first: design the single-column phone experience as the default, then add complexity as screens afford it. Media queries can even ask about user preferences — dark mode, reduced motion — and honour them.',
  hing:'Responsive design matlab page har screen par theek dikhe — chhota phone ho ya badi monitor. Iska raaz teen cheezon me hai: (1) viewport meta tag head me (bina iske mobile page ko zoom-out karke dikhayega), (2) fluid size — width % me, container par max-width ki seema, images par max-width:100% taaki wo dabbe se bahar na nikle, (3) media queries — CSS ke if-block: @media (min-width: 768px) matlab "jab screen kam se kam itni chaudi ho tab ye style lagao". Kaam hamesha MOBILE-FIRST shuru karo: pehle choti screen ke liye simple ek-column design, phir badi screen par min-width se do-teen column jodo. Breakpoints device ke naam par mat rakho (iPhone X kitna tha?) — jahan tumhara design toot-ta dikhe, wahi breakpoint hai! Bonus: @media (prefers-color-scheme: dark) se user ki dark-mode pasand bhi padh sakte ho.',
  why:'The majority of web traffic is mobile; fixed-width desktop-only pages are functionally broken products for most humans (and deprioritised by search engines). Breakpoint craft plus preference queries is the modern baseline, not an enhancement.',
  when:'Always: viewport meta, fluid containers with max-width caps, and content-driven breakpoints (where the design strains) at something like 40rem/64rem. Prefer min-width (mobile-first) queries; test at 320px upward plus 200% zoom rather than named devices.',
  syntax:'.grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }\n@media (min-width: 48rem) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}\nimg { max-width: 100%; height: auto; }',
  comp:[['Mobile-first','Base styles serve small screens; min-width layers enhance upward'],['Breakpoint','Width at which the layout (not a device) needs reconfiguration'],['Preference queries','prefers-color-scheme, prefers-reduced-motion, pointer/hover capabilities']],
  ex:[
   {t:'Study: mobile-first card grid with two breakpoints',code:`<style>
  .wrap { width: min(100% - 2rem, 72rem); margin-inline: auto; }
  .cards { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  .card { border: 1px solid #ccc; padding: 1rem; }
  @media (min-width: 40rem) {
    .cards { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 64rem) {
    .cards { grid-template-columns: repeat(4, 1fr); }
  }
</style>
<div class="wrap">
  <div class="cards">
    <div class="card">Arrays</div>
    <div class="card">Stacks</div>
    <div class="card">Queues</div>
    <div class="card">Trees</div>
  </div>
</div>`,out:`Rendered result: one stacked column on phones;
two-by-two at >=640px (40rem at 16px root); a single
row of four on desktop >=1024px. The wrap keeps a
1rem gutter and caps total width at 72rem.`,why:'Base rules target the smallest assumption; each min-width block only ADDS columns. min() for the container gives fluid width with both side gutters and a ceiling in one declaration.'},
   {t:'Study: navigation that becomes a row, fluid media',code:`<style>
  nav ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
  nav a { display: block; padding: 0.75rem 1rem; background: #eef2ff; }
  @media (min-width: 48rem) {
    nav ul { display: flex; gap: 0.5rem; }
    nav a { padding: 0.5rem 0.75rem; }
  }
  figure img { max-width: 100%; height: auto; display: block; }
</style>
<nav aria-label="Primary">
  <ul>
    <li><a href="/learn">Learn</a></li>
    <li><a href="/practice">Practice</a></li>
    <li><a href="/exams">Exams</a></li>
  </ul>
</nav>
<figure><img src="campus-wide.jpg" alt="Students crossing the main courtyard at sunrise" width="1600" height="900"></figure>`,out:`Rendered result: fat full-width tap targets stacked
on phones; a compact horizontal menu on wider
screens. The 1600px photo scales down to fit any
column without distortion or horizontal scrolling.`,why:'Display:block links make the whole row tappable (touch ergonomics), then flex condenses them when horizontal room exists. max-width:100% + height:auto is the universal fluid-image pair.'},
   {t:'Study: honouring user preferences (dark scheme + reduced motion)',code:`<style>
  :root { --bg: #ffffff; --ink: #16202e; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #12181f; --ink: #e8eef5; }
  }
  body { background: var(--bg); color: var(--ink); }
  .card { transition: transform 0.35s ease; }
  .card:hover { transform: translateY(-4px); }
  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .card:hover { transform: none; }
  }
</style>
<div class="card">Preference-aware component</div>`,out:`Rendered result: dark-mode users automatically get
the dark palette via variable swap; users who set
"reduce motion" in their OS get the hover lift
disabled entirely — no vestibular triggers.`,why:'Preference queries read OS-level settings — respecting reduced-motion is an accessibility requirement, not a flourish. Tokenised colours (previous topic) make scheme swaps a two-line change.'}
  ],
  walk:[[3,'Between 0 and 40rem only base rules apply: a single grid column — the phone reading experience.','1 column'],[5,'At 40rem the first query matches and redefines the template to 2 columns; gap and card styles inherit upward untouched.','2 columns'],[8,'At 64rem BOTH queries match; the later, equal-specificity 4-column rule wins by source order within the cascade.','4 columns']],
  walkWhy:'Mobile-first layering means breakpoints only ADD capability; nothing must be undone at larger sizes, which keeps cascading predictable as breakpoints accumulate.',
  rules:['No viewport meta = mobile browsers render a shrunken ~980px layout and media queries misfire.','Choose breakpoints where content strains, in rem (they then respect user font zoom) rather than device names.','Test keyboard/zoom (200-400%) alongside widths: zoom effectively narrows CSS-pixel width, exercising your queries.','Avoid both min- and max-width ecosystems mixed randomly — pick a direction (mobile-first) for a codebase.'],
  mistakes:[
   {t:'Designing desktop-first with max-width patches',bad:'/* base = 1200px layout; then @media (max-width: 768px) { undo, squeeze, hide half the UI } */',why:'Small screens inherit every desktop assumption then fight to undo them, producing bloated override blocks and forgotten corners that overflow. The constrained design should be the foundation, not the afterthought.',fix:'/* base = single-column fluid; @media (min-width: ...) adds columns/space as affordance grows */',tip:'Start in a 360px-wide window. If it works there, enhancement is additive; the reverse is archaeology.'},
   {t:'Fixed-width elements rupturing small screens',bad:'.hero img { width: 900px; }\n.sidebar { width: 420px; float: left; }',why:'A 900px image on a 390px phone forces horizontal scrolling (or layout explosion), the canonical non-responsive symptom users punish by leaving.',fix:'img { max-width: 100%; height: auto; }\n.sidebar { width: min(100%, 26rem); }',tip:'Audit for px widths over ~20rem without max-width companions; containers cap, children flow.'}
  ],
  cmp:['Responsive tools',['Need','Technique','Query/unit'],[['Column count by room','Grid template per breakpoint','min-width in rem'],['Type that breathes','Fluid sizes','clamp() with vw'],['Images in fluid columns','max-width:100%; height:auto','Always on'],['Dark theme','Token swap','@media (prefers-color-scheme: dark)'],['Motion safety','Disable animation','@media (prefers-reduced-motion)']]],
  diag:{kind:'flow',start:'Small-screen base styles',condition:'Viewport >= breakpoint?',trueAction:'Add richer layout layer',falseAction:'Stay in simple fluid layout',end:'Every width intentionally designed'},
  apps:['Course marketplaces and news sites serving majority-mobile audiences.','Dashboards collapsing multi-pane grids into prioritised stacks.','Marketing pages with fluid hero type across phones to TVs.'],
  quizzes:[{q:'Mobile-first CSS is characterised by…',options:['max-width queries everywhere','Base styles for small screens, enhanced via min-width queries','Separate m. subdomain','px breakpoints named after devices'],correct:1,why:'Starting from the constrained layout and layering upward keeps the cascade additive and the defaults universal.'},
            {q:'An image overflows its phone-width column. The canonical fix is…',options:['width: 100vw','max-width: 100%; height: auto','Hide it on mobile','position:absolute'],correct:1,why:'Capping at the container width with auto height preserves aspect ratio and prevents horizontal overflow.'}],
  take:['Viewport meta, fluid containers, content-driven breakpoints — the responsive tripod.','Write base styles for phones; enhance with min-width in rem.','Preference queries (scheme/motion) are part of responsive, accessible design.'],
  rev:'@media (min-width: Xrem) layers. wrap = min(100%-2rem, MAX). img max-width 100%. Test 320px + zoom. Honour color-scheme & reduced-motion.',
  assign:{p:'(Study) Make a .features list: base single column with 1rem gap; >=48rem two columns via grid; also a prefers-color-scheme: dark block swapping background #111/color #eee on body. Include 4 feature items in HTML.',s:`<!-- Study task: responsive feature grid + dark-scheme tokens -->`,sol:`<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #fff; color: #111; }
  .features { display: grid; gap: 1rem; grid-template-columns: 1fr; padding: 1rem; }
  .feature { border: 1px solid #bbb; padding: 1rem; }
  @media (min-width: 48rem) {
    .features { grid-template-columns: repeat(2, 1fr); }
  }
  @media (prefers-color-scheme: dark) {
    body { background: #111; color: #eee; }
    .feature { border-color: #444; }
  }
</style>
<div class="features">
  <div class="feature">Structured notes</div>
  <div class="feature">Timed practice</div>
  <div class="feature">Video solutions</div>
  <div class="feature">Progress analytics</div>
</div>`}
},
{
  id:'css-transitions-animations', course_id:'html-css', unit_id:'html-unit-3', order_index:2,
  title:'Transitions, Transforms & Keyframe Animations', desc:'Animate state changes smoothly and build small declarative animations. Browser-rendered: study examples.',
  obj:['Transition properties on hover/focus with sensible timing','Transform elements (translate/scale/rotate) without disturbing flow','Define @keyframes animations and control iteration/direction'],
  pre:['Responsive design','Selectors & cascade'],
  outcomes:['Learner adds tasteful, performant, motion-safe interaction feedback'],
  def:'A transition interpolates a property between two states (e.g. normal → :hover) over a duration with an easing curve. Transforms (translate, scale, rotate) visually move/resize elements without affecting layout of others. Keyframe animations (@keyframes) define multi-step timelines run via the animation properties.',
  simple:'Motion done right is feedback, not fireworks. A transition says: "when this button\'s colour changes on hover, glide there over 200ms instead of snapping" — you declare which properties may glide and how fast; the browser interpolates the in-between values. Transforms are visual sleight of hand: you can nudge, enlarge or spin an element and its neighbours will not budge (unlike changing width, which shoves layout around and costs performance). Keyframes are flip-book instructions: define poses at 0%, 50%, 100% and let the animation loop. The golden rules: animate transform and opacity (cheap for the GPU), keep durations short (150–300ms for UI), and always respect users who ask for reduced motion.',
  hing:'Animation ka usool simple hai: chhota, tez, aur maqsad-wala. Transition do halaton ke beech ka safar asaan banata hai — hover par rang 0.2 second me dheere badlega, jhatke se nahi. Transform (translate, scale, rotate) element ko dikhai dene me hilata hai lekin aas-paas ka layout nahi bigadta — isisiliye width badalne ke muqable transform bohot sasta aur smooth padta hai. @keyframes ek pura naach choreograph karta hai: 0% par ye pose, 50% par woh, 100% par wapas. Dhyan rahe, sab kuch rang-biranga ghumana mat shuru kar dena — 150-300ms ki choti harkat hi professional lagti hai. Aur sabse zaroori: jo user apne system me "reduced motion" rakhta hai (chakkar/sirdard ki wajah se), uske liye animation band kar dena tumhari zimmedari hai — pichle topic wala media query yahan bhi chalega.',
  why:'Micro-interactions (hover lifts, focus glows, loading pulses, toast slides) communicate state continuously and make interfaces feel alive rather than teleported. Performant property choice separates buttery 60fps from janky layout-thrashing.',
  when:'Transitions for state pairs (hover/focus/open), keyframes for looping/ambient or multi-stage motion. Animate transform/opacity; avoid animating width/height/top/left in hot paths. Honour prefers-reduced-motion globally.',
  syntax:'.btn { transition: background-color 0.2s ease, transform 0.2s ease; }\n.btn:hover { transform: translateY(-2px) scale(1.02); }\n@keyframes pulse { 0% { opacity: 1 } 50% { opacity: 0.4 } 100% { opacity: 1 } }',
  comp:[['transition: prop dur easing delay','Which properties glide, how long, which acceleration curve, when to start'],['transform functions','translate/scale/rotate/skew compose in list order, GPU-cheap'],['animation-fill-mode','forwards keeps the end state; backwards pre-applies the start during delay']],
  ex:[
   {t:'Study: buttery button states (hover/focus-visible/active)',code:`<style>
  .btn {
    background: #2563eb; color: #fff; border: 0;
    padding: 0.6rem 1.1rem; border-radius: 0.5rem;
    transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  }
  .btn:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.18); }
  .btn:active { transform: translateY(0) scale(0.98); }
  .btn:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
</style>
<button class="btn" type="button">Enroll now</button>`,out:`Rendered result: hovering glides the button 2px up
with a deepening blue and soft shadow over ~200ms;
pressing dips it back with a slight squash; keyboard
focus shows a clear ring (motion never replaces it).`,why:'Only compositor-friendly properties animate (transform, shadow, colour); layout is untouched so neighbours never reflow during the interaction.'},
   {t:'Study: keyframe loader and entrance',code:`<style>
  @keyframes pulse-dot {
    0%, 100% { transform: scale(1);   opacity: 1; }
    50%      { transform: scale(1.6); opacity: 0.45; }
  }
  .dot {
    width: 14px; height: 14px; border-radius: 50%; background: #2563eb;
    animation: pulse-dot 1s ease-in-out infinite;
  }
  @keyframes rise-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .toast { animation: rise-in 0.3s ease-out both; }
</style>
<div class="dot" role="status" aria-label="Loading"></div>
<div class="toast">Saved successfully</div>`,out:`Rendered result: the dot breathes (scale+fade)
in a 1s infinite loop as a loading affordance; the
toast rises and fades in once, holding its end state
(both = backwards+forwards fill).`,why:'Shared 0%/100% keyframes keep the loop seamless. role="status" gives the purely visual loader an AT announcement; the animation itself is decoration.'},
   {t:'Study: reduced-motion contract and transform composition',code:`<style>
  .card {
    transition: transform 0.25s ease;
  }
  .card:hover { transform: rotate(-1deg) translateY(-4px) scale(1.02); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
</style>
<div class="card">Hover me (gently)</div>`,out:`Rendered result: default users get a subtle combined
tilt-lift-zoom (transform functions compose in the
listed order). Reduced-motion users get effectively
instant state changes everywhere on the page.`,why:'The universal reduced-motion guard is a respected production pattern: near-zero durations preserve state changes while removing travel. This is one of the few sanctioned !important uses.'}
  ],
  walk:[[4,'The base rule declares WHICH properties may animate; no motion happens until a state change supplies new values.','armed, idle'],[7,'On hover, the browser interpolates colour, translateY and shadow from current to hover values along the ease curve over 0.2s.','gliding'],[8,':active retargets transform mid-flight and the transition re-plans smoothly from the present visual state — no jumps.','interruptible']],
  walkWhy:'Transitions are negotiated between two computed styles; the browser, not your code, computes every intermediate frame — which is why only interpolable (numeric/colour) properties participate.',
  rules:['Animate transform and opacity for 60fps; layout properties (width/top) trigger expensive reflow per frame.','UI transitions belong in the 100–300ms band; anything past ~500ms needs a deliberate reason.','Discrete properties (display, visibility mostly) do not interpolate; plan show/hide with opacity/transform plus class toggles.','Every animation set must ship with a prefers-reduced-motion fallback.'],
  mistakes:[
   {t:'Animating width/left for a slide-in panel',bad:'.panel { left: -300px; transition: left 0.3s; }\n.panel.open { left: 0; }  /* reflows the page every frame */',why:'Changing offsets forces layout + paint on each tick, causing jank on low-end phones precisely during an interaction meant to feel premium. The visual result via transform is identical.',fix:'.panel { transform: translateX(-300px); transition: transform 0.3s ease; }\n.panel.open { transform: translateX(0); }',tip:'Rule of thumb: if the property changes geometry of OTHER elements, it does not belong in a transition list.'},
   {t:'Transition declared only on the :hover state',bad:'.chip:hover { background: gold; transition: background 0.3s; }',why:'Mouse-enter animates (hover rule supplies the transition), but mouse-LEAVE removes the rule — including its transition — so the return snaps instantly. The asymmetry reads as a bug.',fix:'.chip { transition: background 0.3s; }\n.chip:hover { background: gold; }',tip:'Transitions belong on the base state so both directions share the same glide.'}
  ],
  cmp:['Transition vs animation',['Aspect','Transition','@keyframes animation'],[['Trigger','State change (hover/class)','Runs on load/assignment, controllable'],['Steps','Start → end only','Arbitrary % keyframes'],['Looping','No','iteration-count incl. infinite'],['Best for','Micro-interaction feedback','Loaders, entrances, ambient loops']]],
  diag:{kind:'flow',start:'State change or loop need?',condition:'Two states enough?',trueAction:'transition on the base rule',falseAction:'@keyframes + animation props',end:'Add reduced-motion guard'},
  apps:['Button/card hover systems and focus feedback.','Skeleton shimmer/pulse loaders while data fetches.','Toast/drawer entrances via translate + fade.'],
  quizzes:[{q:'Why prefer transform: translateX over animating left for a drawer?',options:['translateX is newer','Transforms skip layout, compositing cheaply; left reflows per frame','left cannot transition','No difference'],correct:1,why:'Transforms are composited without disturbing document flow; offset changes re-layout surrounding content continuously.'},
            {q:'A hover effect animates in but snaps back out. Likely cause?',options:['Easing choice','transition declared only inside :hover, so leaving removes it','GPU disabled','Too many keyframes'],correct:1,why:'The return trip needs the transition on the base rule, which remains active in both directions.'}],
  take:['Base-rule transitions, compositor properties, 150–300ms: the micro-interaction recipe.','Transforms compose left-to-right and cost no layout.','Keyframes for loops/entrances — always behind a reduced-motion guard.'],
  rev:'transition: prop .2s ease (on base). transform translate/scale/rotate composes. @keyframes % poses + animation: name dur iter. Honour reduced-motion.',
  assign:{p:'(Study) Style .tag chips that on hover lift via translateY(-3px) and darken background over 0.2s, with the transition on the base rule; add a spin-slow keyframe (rotate 360 over 2s linear infinite) applied to .loader; wrap both in a reduced-motion media block disabling them.',s:`<!-- Study task: chip transition + loader keyframe + motion guard -->`,sol:`<style>
  .tag {
    display: inline-block; padding: 0.35rem 0.8rem; border-radius: 999px;
    background: #e0e7ff; transition: transform 0.2s ease, background-color 0.2s ease;
  }
  .tag:hover { transform: translateY(-3px); background: #c7d2fe; }
  @keyframes spin-slow { to { transform: rotate(360deg); } }
  .loader {
    width: 22px; height: 22px; border-radius: 50%;
    border: 3px solid #c7d2fe; border-top-color: #4338ca;
    animation: spin-slow 2s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .tag { transition: none; }
    .tag:hover { transform: none; }
    .loader { animation: none; }
  }
</style>
<span class="tag">Algorithms</span>
<div class="loader" role="status" aria-label="Loading"></div>`}
},
{
  id:'html-css-landing-project', course_id:'html-css', unit_id:'html-unit-3', order_index:3,
  title:'Capstone Build: A Complete Responsive Landing Page', desc:'Assemble structure, flex/grid, forms and responsive rules into one page. Browser-rendered: study examples.',
  obj:['Compose header/hero/features/pricing/footer with semantic sections','Layer flex and grid appropriately with mobile-first breakpoints','Apply accessibility details (skip link, alt, labels, focus) end-to-end'],
  pre:['All previous HTML/CSS topics'],
  outcomes:['Learner ships a small but production-shaped static page'],
  def:'A landing page is a single-purpose document (one conversion goal) structured as semantic sections — header/navigation, hero with primary call-to-action, feature grid, social proof/pricing, signup form, footer — styled mobile-first with fluid layout primitives and accessible patterns throughout.',
  simple:'This capstone stitches the whole track into one artefact. Structure first, no styling: header with nav, a hero that says what this is and offers ONE obvious action, a features section, simple pricing, an email capture form, footer. Then a style system: tokens on :root, fluid type, a centred max-width shell, flex for one-dimensional arrangements (nav row, button groups), grid for two-dimensional ones (feature cards), and breakpoints where single-column dignity gives way to rows. Accessibility is not a final sprinkle: skip link first, alt text, labelled email field, visible focus, honest contrast. Build it in that order — content-out — and the page works at every width before it looks fancy at any.',
  hing:'Ye capstone poori HTML/CSS shringkhala ko ek asal page me jodta hai. Kaam ka kram professional rakho: PEHLE sirf HTML structure (header+nav, hero jisme ek saaf CTA button, features, pricing, chhota form, footer) — bina style ke page padhne layak hona chahiye. Phir CSS ki paratein: :root par rang/spacing ke tokens, border-box reset, center me max-width wala container, nav ke liye flex (ek line ki sajawat), cards ke liye grid (do dishaon ki sajawat), aur min-width breakpoints jahan ek column se zyada column banein. Accessibility har kadam par: skip link, tasveeron ka alt, form ka label, focus ka ring, contrast ki jaanch. Aakhir me mobile (360px), tablet aur desktop — teeno par resize karke dekho, aur sirf keyboard se poora page ghum kar parakh lo. Yehi asal front-end ka roz ka kaam hai.',
  why:'Integration is where isolated syntax becomes craft: real pages fail at the seams (overflow at one breakpoint, an unlabelled control, contrast in the footer). A disciplined end-to-end build is the portfolio piece demonstrating employable fundamentals.',
  when:'Follow this sequence for any static build: content outline → semantic HTML → tokens/base → layout primitives → breakpoints → polish (states/motion) → a11y + resize QA. Keep CSS organised by layer so future edits land predictably.',
  syntax:'<!-- skeleton outline -->\n<a class="skip" href="#main">Skip to content</a>\n<header>...nav...</header>\n<main id="main">\n  <section class="hero">...</section>\n  <section class="features">...</section>\n  <section class="pricing">...</section>\n</main>\n<footer>...</footer>',
  comp:[['One primary CTA','Landing pages convert through a single obvious action repeated at decision points'],['Layout choice per axis','Flex for rows/columns of items; grid for 2-D card matrices'],['QA passes','Resize 320→1440, keyboard-only tour, contrast + zoom checks']],
  ex:[
   {t:'Study: semantic skeleton (unstyled but complete)',code:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeNexus — Learn DSA by doing</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip" href="#main">Skip to main content</a>
  <header class="site-header">
    <a class="brand" href="/">CodeNexus</a>
    <nav aria-label="Primary">
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#join" class="btn">Join free</a></li>
      </ul>
    </nav>
  </header>
  <main id="main">
    <section class="hero">
      <h1>Master data structures, one problem a day</h1>
      <p>Guided lessons in simple English and Hinglish, with instant practice.</p>
      <a class="btn btn-primary" href="#join">Start learning free</a>
    </section>
    <section id="features" aria-labelledby="features-title">
      <h2 id="features-title">Why learners stick</h2>
      <div class="feature-grid">
        <article><h3>Step-by-step notes</h3><p>Every topic from definition to mastery check.</p></article>
        <article><h3>Run code instantly</h3><p>Practice in the browser with real output.</p></article>
        <article><h3>Track progress</h3><p>Streaks, points and certificates.</p></article>
      </div>
    </section>
    <section id="join" aria-labelledby="join-title">
      <h2 id="join-title">Get the free starter plan</h2>
      <form action="/subscribe" method="post">
        <label for="join-email">Email address</label>
        <input id="join-email" name="email" type="email" required autocomplete="email">
        <button type="submit">Send my invite</button>
      </form>
    </section>
  </main>
  <footer><p>(c) 2026 CodeNexus</p></footer>
</body>
</html>`,out:`Rendered result (before CSS): a clean, readable,
keyboard-navigable document with one h1, labelled
sections, working in-page nav, and a labelled form.
This is the contract the stylesheet must not break.`,why:'Content-out structure: landmarks, single h1, aria-labelledby naming each section from its heading, one labelled conversion form. If CSS died tomorrow, the page still works.'},
   {t:'Study: the style system (tokens, flex header, grid features)',code:`<style>
  :root {
    --ink: #16202e; --paper: #ffffff; --brand: hsl(210, 90%, 45%);
    --brand-dark: hsl(210, 90%, 36%); --wash: #eef4fb; --radius: 0.75rem;
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font: 1rem/1.6 system-ui, Segoe UI, Roboto, sans-serif; color: var(--ink); background: var(--paper); }
  .skip { position: absolute; left: -9999px; }
  .skip:focus { position: static; display: inline-block; padding: 0.5rem 1rem; }
  .site-header, main, footer { width: min(100% - 2rem, 70rem); margin-inline: auto; }
  .site-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-block: 1rem; }
  .site-header ul { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; align-items: center; }
  .hero { padding: 3rem 0 2rem; text-align: center; }
  .hero h1 { font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; margin: 0 0 0.75rem; }
  .btn { display: inline-block; padding: 0.6rem 1.2rem; border-radius: var(--radius); background: var(--brand); color: #fff; text-decoration: none; transition: background-color .2s ease, transform .15s ease; }
  .btn:hover { background: var(--brand-dark); transform: translateY(-2px); }
  a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; }
  .feature-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  .feature-grid article { background: var(--wash); padding: 1.25rem; border-radius: var(--radius); }
  @media (min-width: 48rem) {
    .feature-grid { grid-template-columns: repeat(3, 1fr); }
    .hero { padding-top: 4.5rem; }
  }
  @media (prefers-reduced-motion: reduce) { .btn { transition: none; } .btn:hover { transform: none; } }
</style>`,out:`Rendered result: centred shell with gutters; header
brand left, nav right (wrapping on narrow screens);
fluid hero; feature cards stack on phones and form
a 3-column row from 48rem; consistent focus rings;
reduced-motion users get static hovers.`,why:'One-dimensional header uses flex; two-dimensional cards use grid — tools matched to axes, the core judgement of modern layout. Tokens make every colour decision be made once.'},
   {t:'Study: the QA checklist applied to this build',code:`Pre-ship checklist for the page above:

[ ] 320px wide: no horizontal scroll; tap targets >= ~40px
[ ] 48rem and 80rem: grids reflow intentionally, shell caps centred
[ ] Keyboard only: skip link appears, tab order = visual order,
    every control reachable, focus ring always visible
[ ] Images (when added): alt text or alt="" ; width/height set
[ ] Contrast: --brand on white ~4.6:1 for large/button text;
    body --ink on --paper > 12:1
[ ] Form: submit blocked on empty/bad email by native validation
[ ] 200% zoom: breakpoints respond (rem-based), nothing clips
[ ] prefers-reduced-motion + dark scheme spot checks`,out:`Rendered result: this checklist, actually executed.
Any unchecked box is a scheduled fix, not a hope.
Automate the repeatable parts with Lighthouse/axe;
keyboard and zoom passes stay manual.`,why:'Shipping is a verification activity: the same discipline this whole course applies to code examples applies to pages — claims require observed evidence.'}
  ],
  walk:[[12,'Skip link first in source order: keyboard users meet it before the nav, and :focus reveals it.','a11y entry point'],[21,'main carries the conversion narrative in order: promise (hero) → proof/features → capture (form).','single-goal flow'],[36,'The only form asks one labelled question — friction is the enemy of landing pages and good a11y both.','minimal ask']],
  walkWhy:'The build sequence — semantics, tokens, layout axes, breakpoints, QA — scales from this page to entire design systems without changing its logic.',
  rules:['A landing page earns ONE primary CTA style; competing primaries dilute conversion and clarity.','Do not ship fixed pixel heights on text containers — zoom/localisation will overflow them; use min-height and flow.','Keep the stylesheet layered (tokens → base → layout → components → breakpoints) so cascade order stays intentional.','External CSS/JS files belong linked (not inline) in real projects: caching, CSP and maintainability.'],
  mistakes:[
   {t:'Styling before structure (div-built, retrofitted semantics)',bad:'<div class="header"><div class="nav"><div class="link" onclick="...">...',why:'Visual-first markup produces unlabelled regions, fake controls and heading chaos that must later be unpicked under deadline. Retrofitting semantics costs multiples of writing them first.',fix:'<!-- write landmarks/headings/lists first; classes second; pixels last -->',tip:'Read your HTML with CSS disabled: if the document is confusing naked, no stylesheet will save it.'},
   {t:'One giant desktop screenshot as the only test',bad:'/* verified at 1440px, shipped; phone users get horizontal scroll + microscopic tap targets */',why:'Breakpoints, overflow, tap-size and zoom failures are invisible at the design width. The majority of real traffic meets the broken version.',fix:'/* build mobile-first; test 360 / 768 / 1280 + 200% zoom + keyboard tour */',tip:'Resize continuously while building, not as a final exam.'}
  ],
  cmp:['Flex vs grid quick judgement',['Situation','Reach for','Because'],[['Nav bar, button row, card footer','Flex','One axis, content-sized items'],['Feature/pricing card matrix','Grid','Rows AND columns align'],['Centring one hero block','Flex or grid place-items','Either macro handles it'],['Magazine asymmetric spans','Grid areas','Explicit 2-D placement']]],
  diag:{kind:'flow',start:'Content outline (headings list)',condition:'Semantics valid naked?',trueAction:'Layer tokens + layout + breakpoints',falseAction:'Fix HTML first',end:'Ship after resize/keyboard QA'},
  apps:['Course/product landing pages and waitlists.','Event and campaign microsites.','Portfolio homepages demonstrating the full fundamentals stack.'],
  quizzes:[{q:'For the feature cards (rows and columns must align), the apt layout tool is…',options:['Floats','Grid','Inline-block','Absolute positioning'],correct:1,why:'Two-dimensional alignment is grid\'s defining job; flex would need row wrappers and still misalign cross-row.'},
            {q:'Why does the hero keep exactly one h1 and one primary-button style?',options:['HTML forbids two buttons','Single document topic + single conversion action keep hierarchy and purpose unambiguous','CSS limits','SEO bans buttons'],correct:1,why:'Landing-page clarity (and document outline sanity) comes from one headline promise and one primary action repeated.'}],
  take:['Build content-out: semantic HTML first, style layers after, QA always.','Match layout tools to axes: flex 1-D, grid 2-D, both mobile-first.','Accessibility and responsiveness are acceptance criteria, not polish.'],
  rev:'Outline -> landmarks -> tokens/base -> flex/grid -> min-width layers -> states/motion -> resize+keyboard+contrast QA. One h1, one primary CTA.',
  assign:{p:'(Study) Extend the capstone with a pricing section: h2 "Pricing", a 2-card grid (Free, Pro) that stacks on mobile and sits side-by-side from 48rem, each card with an h3, price line and the SAME primary .btn linking to #join. Provide HTML+CSS snippet only for that section (reuse token names from the lesson).',s:`<!-- Study task: pricing section snippet -->`,sol:`<section id="pricing" aria-labelledby="pricing-title">
  <h2 id="pricing-title">Pricing</h2>
  <div class="price-grid">
    <article class="price-card">
      <h3>Free</h3>
      <p class="price">Rs. 0</p>
      <p>Core lessons and daily practice.</p>
      <a class="btn" href="#join">Start free</a>
    </article>
    <article class="price-card">
      <h3>Pro</h3>
      <p class="price">Rs. 499/mo</p>
      <p>Certificates, mentorship and mock exams.</p>
      <a class="btn" href="#join">Go Pro</a>
    </article>
  </div>
</section>
<style>
  .price-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  .price-card { border: 1px solid #cbd5e1; border-radius: var(--radius); padding: 1.25rem; }
  .price-card .price { font-size: 1.5rem; font-weight: 700; margin: 0.25rem 0; }
  @media (min-width: 48rem) {
    .price-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>`}
},
];

module.exports = { topics: makeTopics(specs) };
