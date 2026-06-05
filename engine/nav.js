// nav.js — data-driven page tree + nested navigation (classic global script).
// Provides global: PAGES (registry, filled by data/*.js), show(id), buildPages().
// A "page" is a stepper lesson registered as PAGES['dotted.id'] = { parent, crumb, eyebrow, title, sub, summaryTitle, drawerHead, steps }.
//   - parent: dotted id of the page one level up (omit/null for top-level ism/fil/harf — their parent is home).
//   - a card inside any step may carry link:'<page id>' to drill into a child page.
// Load order: quiz.js → stepper.js → nav.js → data/*.js → app.js (app calls buildPages()).

  const PAGES = {};                 // id -> page config (populated by data files)
  const PAGE_API = {};              // id -> { go, current } returned by makeStepper
  let WRAP, DRAWER, DRAWER_LIST, DRAWER_HEAD, DRAWER_SUB, BACKDROP, BURGER;
  let activeId = null;              // null === home

  const domId = id => id.replace(/\./g, '-');           // 'ism.murab.marfu' -> 'ism-murab-marfu'
  const viewId = id => id === null ? 'view-home' : `view-${domId(id)}`;

  // ----- breadcrumb (built from the parent chain; kalima/home is always the root crumb) -----
  function crumbHTML(id){
    const chain = [];
    for(let c = id; c; c = PAGES[c].parent) chain.unshift(c);
    const parts = [`<button class="crumb" data-go="">কালিমা</button>`];
    chain.forEach((cid, idx) => {
      parts.push('<span class="crumb-sep">›</span>');
      if(idx === chain.length - 1) parts.push(`<span class="crumb cur">${PAGES[cid].crumb}</span>`);
      else parts.push(`<button class="crumb" data-go="${cid}">${PAGES[cid].crumb}</button>`);
    });
    return parts.join('');
  }

  // ----- shared drawer (step jump-list for the active page) -----
  function buildDrawer(id){
    const p = PAGES[id], N = p.steps.length;
    DRAWER_HEAD.textContent = p.drawerHead || p.title;
    DRAWER_SUB.textContent  = p.drawerSub  || 'যেকোনো ধাপে যেতে নাম বেছে নাও';
    DRAWER_LIST.innerHTML =
      p.steps.map((s,i)=>`<button class="drawer-item" data-go="${i}"><span class="di-kicker">${s.kicker}</span><span class="di-title">${s.title}</span></button>`).join('')
      + `<button class="drawer-item" data-go="${N}"><span class="di-kicker">✦ শেষ</span><span class="di-title">${p.summaryTitle || 'সব প্রকার — এক নজরে'}</span></button>`;
    highlightDrawer(PAGE_API[id].current());
  }
  function highlightDrawer(i){
    [...DRAWER_LIST.children].forEach((el,idx)=>el.classList.toggle('active', idx===i));
  }
  function openDrawer(){ DRAWER.classList.add('open'); BACKDROP.classList.add('open'); document.body.classList.add('drawer-open'); }
  function closeDrawer(){ DRAWER.classList.remove('open'); BACKDROP.classList.remove('open'); document.body.classList.remove('drawer-open'); }

  // ----- view switching. reset=true restarts the page at step 1 (forward nav); false keeps its place (breadcrumb / back) -----
  function show(id, reset=true){
    activeId = id;
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById(viewId(id)).classList.add('active');
    document.body.classList.toggle('page-view', id !== null);
    closeDrawer();
    if(id !== null){
      if(reset && PAGE_API[id]) PAGE_API[id].go(0);
      buildDrawer(id);
    }
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  // ----- one-time build: generate a <section> per registered page, then init each stepper -----
  function buildPages(){
    WRAP = document.querySelector('.wrap');
    const footer = WRAP.querySelector('footer');
    const ids = Object.keys(PAGES);

    ids.forEach(id => {
      const p = PAGES[id], dom = domId(id);
      const sec = document.createElement('section');
      sec.className = 'view';
      sec.id = viewId(id);
      sec.innerHTML = `
        <div class="fil-topbar"><nav class="crumbs">${crumbHTML(id)}</nav></div>
        <header style="margin-bottom:8px">
          <div class="eyebrow">${p.eyebrow || ''}</div>
          <div class="ornament"><span>✦</span></div>
          <h1>${p.title}</h1>
          ${p.sub ? `<p class="sub">${p.sub}</p>` : ''}
        </header>
        <div class="step-head">
          <div class="step-count" id="${dom}-stepcount"></div>
          <div class="step-bar"><i id="${dom}-stepfill"></i></div>
          <div class="step-dots" id="${dom}-stepdots"></div>
        </div>
        <div id="${dom}-steps"></div>
        <div id="${dom}-summary" class="fil-summary"></div>`;
      WRAP.insertBefore(sec, footer);
    });

    // init steppers after every section exists (so cross-page links resolve)
    ids.forEach(id => {
      const p = PAGES[id];
      PAGE_API[id] = makeStepper({
        prefix: domId(id), steps: p.steps, summaryTitle: p.summaryTitle,
        onStep: i => { if(activeId === id) highlightDrawer(i); },
      });
    });

    // shared chrome
    DRAWER      = document.getElementById('nav-drawer');
    DRAWER_LIST = document.getElementById('nav-drawer-list');
    DRAWER_HEAD = document.getElementById('nav-drawer-head');
    DRAWER_SUB  = document.getElementById('nav-drawer-sub');
    BACKDROP    = document.getElementById('nav-backdrop');
    BURGER      = document.getElementById('nav-burger');
    BURGER.addEventListener('click', openDrawer);
    BACKDROP.addEventListener('click', closeDrawer);
    DRAWER_LIST.addEventListener('click', e => {
      const b = e.target.closest('.drawer-item');
      if(b && activeId !== null){ PAGE_API[activeId].go(+b.dataset.go); closeDrawer(); }
    });
    // breadcrumb clicks (delegated across all page sections)
    WRAP.addEventListener('click', e => {
      const c = e.target.closest('.crumb[data-go]');
      if(c){ const t = c.dataset.go; show(t === '' ? null : t, false); }
    });
  }
