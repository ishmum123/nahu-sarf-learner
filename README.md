# كالِمة — Kalimah · Arabic Grammar Primer (Bengali medium)

An interactive, Bengali-medium primer for the foundations of Arabic grammar
(**nahw** / **sarf**). Every Arabic word is one of three kinds — **ism** (noun),
**fiʿl** (verb), or **harf** (particle) — and from there branches a whole tree of
sub-classifications. This app teaches that tree the way it is actually learned:
*recognise first, then test yourself.*

Each topic is a short **stepper lesson** — a few illustrated cards followed by an
embedded quiz — and any classification that has real sub-divisions drills down
into its **own nested stepper page**, as deep as the grammar goes.

```
Home (kalimah quiz)
  └─ ism ──▶ stepper page
        └─ iʿrab: muʿrab ──▶ stepper page
              └─ marfuʿ ──▶ stepper page
                    └─ faʿil, naʾib, mubtada, khabar, …
```

---

## Intentions

- **Learn by recognition.** Show the form, name it, give an example, then quiz —
  immediately, in context. Quizzes mark a word inside a real sentence and ask its role.
- **One idea per step.** A stepper keeps cognitive load low; a progress bar, dots,
  and a side drawer let the learner jump around freely.
- **Nesting mirrors the grammar.** The classification tree is genuinely hierarchical,
  so the navigation is too — breadcrumbs (`kalimah › ism › muʿrab › marfuʿ`) keep you
  oriented however deep you go.
- **Zero build, fully static, offline-friendly.** Plain HTML/CSS/JS, classic `<script>`
  tags (no ES modules, no bundler). Runs by double-clicking `index.html` and deploys to
  GitHub Pages unchanged.
- **Bengali first.** All teaching text is in Bangla; Arabic is set in *Amiri*, Bangla in
  *Hind Siliguri*, display in *Fraunces*.

---

## Run it

```bash
# simplest — just open the file
open index.html

# or serve it (any static server works)
python3 -m http.server 8000
# → http://localhost:8000
```

No dependencies, no install step.

---

## Architecture

Content (the grammar) is fully separated from the engine (how it renders).

```
index.html        home view + shared chrome (one burger/drawer) + script tags
styles.css        parchment/gold/teal theme, stepper + quiz + breadcrumb styles
engine/
  quiz.js         makeQuiz · makeMultiQuiz · makeSentenceQuiz   (3 quiz engines)
  stepper.js      makeStepper(cfg)  — builds ONE page's steps/dots/recap, returns { go, current }
  nav.js          PAGES registry · buildPages() · show() · breadcrumbs · shared drawer
data/
  ism.js fil.js harf.js     top-level pages  (ISM_STEPS / FIL_STEPS / HARF_STEPS + PAGES[...] )
  murab.js                  ism → muʿrab drill-down
  murab-states.js           muʿrab → marfuʿ / mansub / majrur drill-downs
app.js            home quiz + boot: buildPages(), wire home cards, show(null)
```

### The page tree (data model)

A "page" is one stepper lesson, registered in a flat global registry keyed by a
**dotted id**:

```js
PAGES['ism.murab.marfu'] = {
  parent: 'ism.murab',          // one level up (breadcrumb + back); omit for top-level
  crumb:  'মারফূʿ',             // short breadcrumb label
  eyebrow:'اَلْمَرْفُوعَات',     // arabic header
  title:  'মারফূʿ-এর প্রকার',
  sub:    '…', summaryTitle:'…', drawerHead:'…',
  steps:  [ /* {kicker,title,sub,hint,cards,quiz} … */ ],
};
```

A card inside any step opts into a drill-down just by carrying a `link`:

```js
{ tag:'مَرْفُوع', h3:'মারফূʿ …', p:'…', ex:'…', link:'ism.murab.marfu', more:'মারফূʿর প্রকার' }
```

At load, `buildPages()` generates one lightweight `<section>` shell per registry entry
and wires the shared breadcrumb + drawer. **Adding a new nested page anywhere in the tree
is therefore one data entry + one `link:` on a parent card — no HTML, no CSS, no routing
code.**

**Lazy by default.** A page's steps and quizzes are built by `makeStepper` only on first
visit (`show` → `ensureBuilt`), and within a page each step's quiz is built only when that
step is first shown. So booting the app costs just the home quiz; unopened pages and
unseen steps cost nothing.

### Quiz types

| engine | step flag | use |
|---|---|---|
| `makeQuiz` | *(default)* | classify a single word |
| `makeMultiQuiz` | `multi:true` | one word, several axes at once (capstone) |
| `makeSentenceQuiz` | `sentence:true` | mark a word in a sentence, name its role (iʿrab) |

---

## Grammar map

Legend:  **✓** own nested stepper page (built) · **☐** planned drill-down ·
*(unmarked)* taught as cards on its parent page.

```
الكلمة  Kalimah — every Arabic word is one of:
│
├─ ISM ( noun) ✓
│   ├─ number ............... mufrad · muthanna · jamʿ
│   ├─ gender ............... mudhakkar · muʾannath
│   ├─ definiteness ........ nakirah · maʿrifah
│   │     └─ 7 maʿrifah ..... damir ☐ · ʿalam · ism-isharah · mawsul ☐ · bi-al · mudaf · munada
│   ├─ iʿrab ............... muʿrab ✓ · mabni
│   │     └─ MUʿRAB ✓
│   │           ├─ marfuʿ ✓ ── faʿil · naʾib al-faʿil · mubtada · khabar · ism kana · khabar inna
│   │           ├─ mansub ✓ ── mafʿul bihi/mutlaq/li-ajlih/fih/maʿah · hal · tamyiz · mustathna
│   │           │                · khabar kana · ism inna · munada
│   │           ├─ majrur ✓ ── bi-harf al-jarr · mudaf ilayh · tabiʿ (naʿt/maʿtuf)
│   │           ├─ by letters ☐ ── muthanna · jamʿ mudhakkar salim · asmaʾ khamsah
│   │           └─ estimated ☐ ── maqsur · manqus  (muqaddar)
│   ├─ derivation .......... jamid · mushtaqq ☐ (ism faʿil/mafʿul, sifah mushabbahah, …)
│   ├─ tanwin .............. munsarif · ghayr munsarif ☐ (asbab al-manʿ)
│   └─ ending ............. sahih · maqsur · manqus · mamdud
│
├─ FIʿL (verb) ✓
│   ├─ tense ............... madi · mudariʿ · amr
│   ├─ transitivity ....... lazim · mutaʿaddi
│   ├─ voice .............. maʿlum · majhul
│   ├─ root letters ....... mujarrad · mazid ☐ (abwab / awzan)
│   ├─ soundness ......... sahih · muʿtall
│   ├─ conjugability ..... mutasarrif · jamid
│   └─ special classes ... nakisah ☐ · muqarabah · qulub · madh-wa-dhamm
│
└─ HARF (particle) ✓ — grouped by function
    ├─ jar · ʿatf · nasb · jazm
    ├─ mushabbahah (inna & sisters) · istifham
    └─ nida · jawab
```

**Built so far:** ism · fiʿl · harf top-level pages; ism → muʿrab; and muʿrab →
marfuʿ / mansub / majrur. The remaining **☐** nodes follow the same nested-page
pattern and can be added incrementally.

---

## Adding a drill-down (recipe)

1. Add a page to a `data/*.js` file: `PAGES['parent.child'] = { parent:'parent', crumb, …, steps:[…] }`.
2. On the parent card that should open it, add `link:'parent.child'` (and a `more` label).
3. If it's a new file, add its `<script src>` in `index.html` before `app.js`.

That's it — the breadcrumb, drawer, progress bar, and recap come for free.
