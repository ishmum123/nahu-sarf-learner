# Page Data Spec — how a stepper page's data must look

Reference contract for authoring a `data/*.js` page module. Every nested page in the
app is one object in the global `PAGES` registry; the engine (`engine/stepper.js`,
`engine/quiz.js`, `engine/nav.js`) renders it. Match this exactly — a missing field
or a step with no quiz will crash the page.

## File shape

A plain classic `<script>` file. **No** ES modules, **no** IIFE, **no** `export`.
Declare one uniquely-named `const <NAME>_STEPS = [...]`, then register the page on the
global `PAGES` object (declared in `nav.js`, available because data files load after
it). Keep the leading 2-space indentation and the header comment, mirroring existing
files like `data/ism.js`.

```js
// data/mushtaqq.js — MUSHTAQQ_STEPS: ism → mushtaqq drill-down content + quizzes.

  const MUSHTAQQ_STEPS = [ /* steps … */ ];

  PAGES['ism.mushtaqq'] = {
    parent: 'ism',                 // dotted id one level up; OMIT for top-level pages
    crumb:  'মুশতাক্ক',            // short breadcrumb label (Bengali)
    eyebrow:'اَلْمُشْتَقّ',         // Arabic page header, WITH harakat
    title:  'মুশতাক্ক-এর প্রকার',   // Bengali H1
    sub:    'এক লাইনের পরিচয়…',     // Bengali one-liner under the title
    summaryTitle:'মুশতাক্ক — এক নজরে', // recap screen heading (Bengali)
    drawerHead:  'মুশতাক্কের প্রকার',  // side-drawer heading (Bengali, short)
    steps:  MUSHTAQQ_STEPS,
  };
```

`const` names must be globally unique across all data files (e.g. `FIL_MURAB_STEPS`,
`MAZID_STEPS`). The `id` (the `PAGES['…']` key) is dotted; its DOM id is derived by
replacing dots with dashes, so ids must be `[a-z.]` only.

## Step shape

Each step is one card-deck + one quiz. **Every step MUST have a `quiz`** — the engine
calls a quiz builder per step unconditionally.

```js
{
  kicker:'১ · সংখ্যা অনুসারে',     // "N · <topic>" — N in BENGALI numerals (১২৩৪…)
  title: 'মুফরাদ · মুসান্না · জমʿ',  // step title (Bengali, may carry Arabic + ·)
  sub:   'এক লাইনের সারাংশ।',        // sits centered under the title
  hint:  'শেষ চিহ্ন দেখে বলো…',      // shown as "↓ <hint>" just above the quiz
  cards: [ /* 2–5 cards, see below */ ],
  // exactly ONE quiz; pick the engine with an optional flag:
  // (default)        → classify-one-word quiz
  // multi:true       → multi-axis quiz (one word, several axes)
  // sentence:true    → mark-a-word-in-a-sentence quiz (i'rab in context)
  quiz: { /* shape depends on the flag, see below */ },
}
```

Card count drives layout (`stepper.js`): 1→solo, 2→pair, 3→trio, 4→2×2 grid, 5–6 still
render. Prefer **2–4** cards per step.

### Card

```js
{
  tag:'مُفْرَد',                       // Arabic chip (short, with harakat)
  h3:'মুফরাদ · একবচন',                // Bengali heading (· + transliteration ok)
  p:'এক বস্তু/ব্যক্তি। কোনো লেজ নেই।', // Bengali body; inline Arabic via
                                        //   <span class="ar">…</span> or <b style="font-family:Amiri">…</b>
  ex:'<b>مُسْلِم</b> — একজন মুসলিম',   // example line; Arabic in <b>
  // OPTIONAL — turns the card into a drill-down link to a child page:
  link:'ism.mushtaqq',                  // child page id (must exist in PAGES)
  more:'মুশতাক্কের প্রকার',            // Bengali label for the "<more> →" affordance
}
```

## Quiz shapes

### 1. Classify (default — no flag)

```js
quiz:{
  prompt:'এই ইসমটি সংখ্যায় কোনটি?',
  choices:[                              // 2–4 ideal (2→c2, 3→c3, 4→c4 grid; 5+ → c3)
    { type:'mufrad',   ar:'مُفْرَد', bn:'একবচন' },
    { type:'muthanna', ar:'مُثَنَّى', bn:'দ্বিবচন' },
    { type:'jam',      ar:'جَمْع',   bn:'বহুবচন' },
  ],
  words:[                                // 6–8 items
    { ar:'مُسْلِم', type:'mufrad', gloss:'একজন মুসলিম',
      why:'কোনো লেজ নেই — একবচন।' },     // why: Bengali; inline Arabic via <span class="ar">
    // …
  ],
}
```
`type` on every word MUST be one of the `choices[].type`. Example: `data/ism.js` steps 1–8.

### 2. Multi-axis (`multi:true`)

```js
multi:true,
quiz:{
  prompt:'পাঁচটি বৈশিষ্ট্যই বেছে নাও:',
  axes:[
    { label:'সংখ্যা', ar:'العدد', choices:[ {type:'mufrad',bn:'একবচন'}, {type:'jam',bn:'বহুবচন'} ] },
    { label:'লিঙ্গ',  ar:'الجنس', choices:[ {type:'muz',bn:'পুংলিঙ্গ'}, {type:'mua',bn:'স্ত্রীলিঙ্গ'} ] },
    // …
  ],
  words:[
    { ar:'الْمُسْلِمَانِ', gloss:'সেই দুই মুসলিম',
      ans:['muthanna','muz'],            // one type per axis, SAME order/length as axes
      why:['…দ্বিবচন।','…পুংলিঙ্গ।'] },  // one Bengali line per axis, same length
    // …
  ],
}
```
`ans.length === why.length === axes.length`. Axis choices: 2–3. Example: `data/ism.js` step 9.

### 3. Sentence / i'rab-in-context (`sentence:true`)

```js
sentence:true,
quiz:{
  prompt:'চিহ্নিত শব্দটি কোন অবস্থায়?',
  unit:'বাক্য',                          // counter noun (optional, default 'বাক্য')
  choices:[ { type:'marfu', ar:'مَرْفُوع', bn:'মারফূʿ' }, /* … */ ],
  items:[
    { before:'جَاءَ', target:'مُحَمَّدٌ', after:'',   // before/after = Arabic context (may be '')
      gloss:'মুহাম্মদ এলো', type:'marfu',             // target is rendered <mark>…</mark>
      why:'কর্তা (ফাইল) — মারফূʿ, শেষে পেশ।' },       // Bengali; inline Arabic via <span class="ar">
    // … 6–8 items
  ],
}
```
`type` on every item MUST be one of the `choices[].type`. Example: `data/murab-states.js`.

## Style rules

- **Arabic** always carries full harakat (Amiri renders it). Inline Arabic inside
  Bengali prose uses `<span class="ar">…</span>`; example lines use `<b>…</b>`.
- **Bengali** is terse and warm, matching the existing files. Bengali numerals (১২৩…)
  in `kicker`. Every `why` explains the *recognition cue*, ends with the verdict.
- Keep each step to one idea; 6–8 quiz items; choices that actually appear as answers.
- Do not invent grammar. Use the exact types and seed examples given in your task.
