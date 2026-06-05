// stepper.js — reusable stepper engine + bangla numerals (classic global script).
// Provides: BN_NUM, bn, makeStepper. Calls makeQuiz/makeMultiQuiz/makeSentenceQuiz at runtime (load quiz.js first).

  const BN_NUM=['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const bn = n => String(n).split('').map(d=>BN_NUM[+d]).join('');

  function makeStepper(cfg){
    const { prefix, steps, summaryTitle } = cfg;
    const host  = document.getElementById(`${prefix}-steps`);
    const dots  = document.getElementById(`${prefix}-stepdots`);
    const fill  = document.getElementById(`${prefix}-stepfill`);
    const count = document.getElementById(`${prefix}-stepcount`);
    const N = steps.length;

    steps.forEach((s,i)=>{
      const cardCls = s.cards.length===1 ? 'one' : (s.cards.length>=3 ? (s.cards.length===4?'two':'three') : 'two');
      const step = document.createElement('div');
      step.className = 'step';
      step.innerHTML = `
        <div class="section-label">${s.kicker}</div>
        <h2 class="step-title">${s.title}</h2>
        <p class="sub" style="text-align:center;margin-top:6px">${s.sub}</p>
        <div class="cards ${cardCls}" style="margin-top:20px">
          ${s.cards.map(c=>{
            const cls = c.link ? 'card clickable' : 'card static';
            const dl  = c.link ? ` data-link="${c.link}"` : '';
            const more = c.link ? `<span class="more">${c.more || 'বিস্তারিত'} →</span>` : '';
            return `<div class="${cls}"${dl}><div class="tag">${c.tag}</div><h3>${c.h3}</h3><p>${c.p}</p><div class="ex">${c.ex}</div>${more}</div>`;
          }).join('')}
        </div>
        <p class="sub" style="text-align:center;margin:22px 0 -6px">↓ ${s.hint}</p>
        <div class="quiz" id="quiz-${prefix}-${i}"></div>
        <div class="step-nav">
          <button class="step-prev"${i===0?' disabled':''}>← আগের ধাপ</button>
          <button class="step-next">${i===N-1?'সম্পন্ন ✓':'পরের ধাপ →'}</button>
        </div>`;
      host.appendChild(step);
      if(s.sentence) makeSentenceQuiz(`quiz-${prefix}-${i}`, s.quiz);
      else if(s.multi) makeMultiQuiz(`quiz-${prefix}-${i}`, s.quiz);
      else makeQuiz(`quiz-${prefix}-${i}`, s.quiz);
      const d = document.createElement('button');
      d.className='step-dot'; d.dataset.go=i; d.title=`ধাপ ${bn(i+1)}`;
      dots.appendChild(d);
    });

    // build recap summary
    const summary = document.getElementById(`${prefix}-summary`);
    summary.innerHTML = `
      <div class="section-label" style="margin-top:6px">✦ সম্পন্ন ✦</div>
      <h2 class="step-title">${summaryTitle}</h2>
      <p class="sub" style="text-align:center;margin:6px 0 26px">মাশাআল্লাহ! তুমি ${bn(N)}টি ধাপই শেষ করেছ।</p>
      ${steps.map((s,i)=>`
        <div class="recap-row clickable" data-go="${i}">
          <div class="recap-kicker">${s.kicker} &nbsp;→</div>
          <div class="recap-types">
            ${s.cards.map(c=>`<span class="recap-type"><span class="ar">${c.tag}</span> ${c.h3}</span>`).join('')}
          </div>
        </div>`).join('')}
      <div class="step-nav" style="margin-top:26px">
        <button class="step-prev" id="${prefix}-sum-restart">↺ আবার শুরু</button>
        <button class="step-next" id="${prefix}-sum-home">🏠 কালিমায় ফিরে যাও</button>
      </div>`;

    // build drawer (burger menu) list — sections + summary
    const drawerList = document.getElementById(`${prefix}-drawer-list`);
    drawerList.innerHTML = steps.map((s,i)=>
      `<button class="drawer-item" data-go="${i}"><span class="di-kicker">${s.kicker}</span><span class="di-title">${s.title}</span></button>`
    ).join('') + `<button class="drawer-item" data-go="${N}"><span class="di-kicker">✦ শেষ</span><span class="di-title">সব প্রকার — এক নজরে</span></button>`;
    const drawerItems=[...drawerList.querySelectorAll('.drawer-item')];

    const drawer=document.getElementById(`${prefix}-drawer`);
    const backdrop=document.getElementById(`${prefix}-backdrop`);
    function closeDrawer(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); document.body.classList.remove('drawer-open'); }
    document.getElementById(`${prefix}-burger`).addEventListener('click', ()=>{ drawer.classList.add('open'); backdrop.classList.add('open'); document.body.classList.add('drawer-open'); });
    backdrop.addEventListener('click', closeDrawer);

    const stepEls=[...host.querySelectorAll('.step')];
    const dotEls=[...dots.querySelectorAll('.step-dot')];
    let cur=-1;

    function go(i){
      drawerItems.forEach((el,idx)=>el.classList.toggle('active', idx===i));
      if(i>=N){
        stepEls.forEach(el=>el.classList.remove('active'));
        dotEls.forEach(el=>{ el.classList.remove('active'); el.classList.add('done'); });
        summary.classList.add('show');
        fill.style.width='100%';
        count.textContent='সম্পন্ন ✓';
        cur=N;
        window.scrollTo({ top:0, behavior:'smooth' });
        return;
      }
      if(i<0) return;
      summary.classList.remove('show');
      cur=i;
      stepEls.forEach((el,idx)=>el.classList.toggle('active', idx===i));
      dotEls.forEach((el,idx)=>{ el.classList.toggle('active', idx===i); el.classList.toggle('done', idx<i); });
      fill.style.width=(i/(N-1)*100)+'%';
      count.textContent=`ধাপ ${bn(i+1)} / ${bn(N)}`;
      window.scrollTo({ top:0, behavior:'smooth' });
    }

    host.addEventListener('click', e=>{
      const link = e.target.closest('.card[data-link]');
      if(link){ show(link.dataset.link); return; }
      if(e.target.classList.contains('step-next')) go(cur+1);
      else if(e.target.classList.contains('step-prev')) go(cur-1);
    });
    dots.addEventListener('click', e=>{ const b=e.target.closest('.step-dot'); if(b) go(+b.dataset.go); });
    drawerList.addEventListener('click', e=>{ const b=e.target.closest('.drawer-item'); if(b){ go(+b.dataset.go); closeDrawer(); } });
    summary.addEventListener('click', e=>{ const r=e.target.closest('.recap-row'); if(r){ go(+r.dataset.go); } });
    summary.querySelector(`#${prefix}-sum-restart`).addEventListener('click', ()=>go(0));
    summary.querySelector(`#${prefix}-sum-home`).addEventListener('click', ()=>show('view-home'));
    go(0);
    return go;
  }
