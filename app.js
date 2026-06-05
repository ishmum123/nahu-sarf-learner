// app.js — init + view navigation. MUST load LAST (after engines + data).
// Runs at end of <body> so the DOM is ready (no DOMContentLoaded wrapper, matching original).
// Order matters: ismGo/filGo/harfGo are created before the card handlers that use them.

  /* ---------- quiz 1: kalima types ---------- */
  makeQuiz('quiz-home', {
    prompt: 'এই শব্দটি কোন প্রকার?',
    choices: [
      { type:'ism',  ar:'اِسْم', bn:'ইসম' },
      { type:'fil',  ar:'فِعْل', bn:"ফি'ল" },
      { type:'harf', ar:'حَرْف', bn:'হরফ' },
    ],
    words: [
      { ar:'كِتَاب',  type:'ism',  gloss:'বই',      why:'এটি একটি জিনিসের নাম, তাই ইসম। এর আগে <span class="ar">الْ</span> (আল-) লাগানো যায়।' },
      { ar:'كَتَبَ',  type:'fil',  gloss:'সে লিখলো', why:'অতীতকালের কাজ — কাজের সাথে সময় জড়িত, তাই ফি\'ল।' },
      { ar:'فِي',     type:'harf', gloss:'ভিতরে',    why:'একা বললে পূর্ণ অর্থ হয় না — অন্য শব্দের সাথে মিলে অর্থ দেয়, তাই হরফ।' },
      { ar:'مَسْجِد', type:'ism',  gloss:'মসজিদ',    why:'এটি একটি জায়গার নাম, তাই ইসম।' },
      { ar:'يَذْهَبُ', type:'fil', gloss:'সে যায়',   why:'বর্তমান/ভবিষ্যৎ কালের কাজ — সময় জড়িত, তাই ফি\'ল।' },
      { ar:'مِنْ',    type:'harf', gloss:'থেকে',     why:'নিজে অর্থ বহন করে না, সম্পর্ক বোঝায় — তাই হরফ।' },
      { ar:'وَلَد',   type:'ism',  gloss:'ছেলে',     why:'এটি মানুষের নাম, তাই ইসম। তানভীন (وَلَدٌ) আসতে পারে।' },
      { ar:'هَلْ',    type:'harf', gloss:'কি? (প্রশ্ন)', why:'প্রশ্নবোধক অব্যয় — একা অর্থহীন, বাক্যে অর্থ দেয়, তাই হরফ।' },
      { ar:'جَلَسَ',  type:'fil',  gloss:'সে বসলো',  why:'অতীতের কাজ — সময় আছে, তাই ফি\'ল।' },
      { ar:'بَيْت',   type:'ism',  gloss:'ঘর',       why:'একটি জিনিস/জায়গার নাম, তাই ইসম।' },
    ],
  });

  const ismGo  = makeStepper({ prefix:'ism',  steps:ISM_STEPS,  summaryTitle:'ইসমের সব প্রকারভেদ — এক নজরে' });
  const filGo  = makeStepper({ prefix:'fil',  steps:FIL_STEPS,  summaryTitle:"ফি'লের সব প্রকারভেদ — এক নজরে" });
  const harfGo = makeStepper({ prefix:'harf', steps:HARF_STEPS, summaryTitle:'হরফের সব প্রকারভেদ — এক নজরে' });

  /* ---------- view navigation ---------- */
  function show(id){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.body.classList.toggle('ism-active',  id==='view-ism');
    document.body.classList.toggle('fil-active',  id==='view-fil');
    document.body.classList.toggle('harf-active', id==='view-harf');
    document.body.classList.toggle('murab-active', id==='view-ism-murab');
    // close any open drawer when switching views
    ['ism','fil','harf','murab'].forEach(p=>{
      document.getElementById(`${p}-drawer`).classList.remove('open');
      document.getElementById(`${p}-backdrop`).classList.remove('open');
    });
    document.body.classList.remove('drawer-open');
    window.scrollTo({ top:0, behavior:'smooth' });
  }
  function wireCard(cardId, viewId){
    const card = document.getElementById(cardId);
    card.addEventListener('click', ()=>show(viewId));
    card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(viewId); } });
  }
  wireCard('ism-card',  'view-ism');
  wireCard('fil-card',  'view-fil');
  wireCard('harf-card', 'view-harf');
  document.getElementById('ism-card').addEventListener('click', ()=>ismGo(0));
  document.getElementById('fil-card').addEventListener('click', ()=>filGo(0));
  document.getElementById('harf-card').addEventListener('click', ()=>harfGo(0));
  document.getElementById('ism-back').addEventListener('click', ()=>show('view-home'));
  document.getElementById('fil-back').addEventListener('click', ()=>show('view-home'));
  document.getElementById('harf-back').addEventListener('click', ()=>show('view-home'));

  makeStepper({ prefix:'murab', steps:MURAB_STEPS, summaryTitle:'ইসমের ইʿরাব — এক নজরে' });
  document.getElementById('murab-back').addEventListener('click', ()=>show('view-ism'));
