// quiz.js — reusable quiz engines (classic global script, shared scope).
// Provides: makeQuiz, makeMultiQuiz, makeSentenceQuiz. Load before app.js.

  /* ---------- reusable quiz engine ---------- */
  function makeQuiz(rootId, config){
    const root = document.getElementById(rootId);
    const colClass = config.choices.length === 2 ? 'c2' : config.choices.length === 4 ? 'c4' : 'c3';
    root.innerHTML = `
      <div class="quiz-top">
        <span class="counter"></span>
        <span class="score"></span>
      </div>
      <div class="bar"><i></i></div>
      <div class="play">
        <p class="prompt">${config.prompt}</p>
        <div class="word">—</div>
        <div class="gloss"></div>
        <div class="choices ${colClass}">
          ${config.choices.map(c=>`<button class="choice" data-type="${c.type}"><span class="ar">${c.ar}</span>${c.bn}</button>`).join('')}
        </div>
        <div class="feedback"></div>
        <button class="next">পরের শব্দ →</button>
      </div>
      <div class="result">
        <div class="label">তোমার ফলাফল</div>
        <div class="big"></div>
        <p class="msg"></p>
        <button class="retry">আবার চেষ্টা করো ↺</button>
      </div>`;

    const NAME = {}; config.choices.forEach(c => NAME[c.type] = c.bn);
    const words = config.words;
    const q = s => root.querySelector(s);
    const choiceEls = [...root.querySelectorAll('.choice')];
    const wordEl = q('.word'), glossEl = q('.gloss'), fb = q('.feedback');
    const nextBtn = q('.next'), counter = q('.counter'), score = q('.score');
    const barFill = q('.bar > i'), play = q('.play'), result = q('.result');

    let i = 0, correct = 0, answered = false;

    function render(){
      answered = false;
      const w = words[i];
      wordEl.classList.add('swap');
      setTimeout(()=>{ wordEl.textContent = w.ar; glossEl.textContent=''; wordEl.classList.remove('swap'); }, 180);
      counter.textContent = `শব্দ ${i+1} / ${words.length}`;
      score.textContent = `সঠিক ${correct}`;
      barFill.style.width = (i/words.length*100) + '%';
      choiceEls.forEach(c=>{ c.disabled=false; c.className='choice'; });
      fb.className='feedback'; fb.innerHTML='';
      nextBtn.classList.remove('show');
    }
    function answer(btn){
      if(answered) return; answered = true;
      const w = words[i], picked = btn.dataset.type, right = w.type;
      choiceEls.forEach(c=>{
        c.disabled = true;
        if(c.dataset.type === right) c.classList.add('correct');
        else if(c === btn) c.classList.add('wrong');
        else c.classList.add('dim');
      });
      glossEl.textContent = '“' + w.gloss + '”';
      if(picked === right){ correct++; fb.innerHTML = `<b>সঠিক!</b> ${w.why}`; }
      else fb.innerHTML = `<b>আবার দেখো —</b> এটি <b>${NAME[right]}</b>। ${w.why}`;
      fb.classList.add('show');
      score.textContent = `সঠিক ${correct}`;
      nextBtn.classList.add('show');
    }
    function next(){ i++; if(i >= words.length){ finish(); return; } render(); }
    function finish(){
      barFill.style.width = '100%';
      play.style.display = 'none';
      result.classList.add('show');
      result.querySelector('.big').textContent = `${correct}/${words.length}`;
      let m;
      if(correct === words.length) m = 'মাশাআল্লাহ! পুরোপুরি সঠিক।';
      else if(correct >= 8) m = 'খুব ভালো! প্রায় সবই ঠিক।';
      else if(correct >= 5) m = 'ভালো শুরু। কার্ডগুলো আরেকবার দেখে নাও।';
      else m = 'চিন্তা নেই — উপরের কার্ডগুলো আবার পড়ে আবার চেষ্টা করো।';
      result.querySelector('.msg').textContent = m;
    }
    function restart(){ i=0; correct=0; result.classList.remove('show'); play.style.display='block'; render(); }

    choiceEls.forEach(c => c.addEventListener('click', ()=>answer(c)));
    nextBtn.addEventListener('click', next);
    result.querySelector('.retry').addEventListener('click', restart);
    render();
    return { restart };
  }

  /* ---------- multi-axis quiz engine ---------- */
  function makeMultiQuiz(rootId, config){
    const root = document.getElementById(rootId);
    root.innerHTML = `
      <div class="quiz-top">
        <span class="counter"></span>
        <span class="score"></span>
      </div>
      <div class="bar"><i></i></div>
      <div class="play">
        <p class="prompt">${config.prompt}</p>
        <div class="word">—</div>
        <div class="gloss"></div>
        <div class="axes">
          ${config.axes.map((ax,ai)=>`
            <div class="axis" data-axis="${ai}">
              <div class="axis-label"><span class="ar">${ax.ar}</span> ${ax.label}<span class="mark"></span></div>
              <div class="choices ${ax.choices.length===3?'c3':'c2'}">
                ${ax.choices.map(c=>`<button class="choice" data-type="${c.type}">${c.bn}</button>`).join('')}
              </div>
            </div>`).join('')}
        </div>
        <div class="feedback"></div>
        <button class="next check">মিলিয়ে দেখো ✓</button>
      </div>
      <div class="result">
        <div class="label">তোমার ফলাফল</div>
        <div class="big"></div>
        <p class="msg"></p>
        <button class="retry">আবার চেষ্টা করো ↺</button>
      </div>`;

    const axes = config.axes, words = config.words;
    const q = s => root.querySelector(s);
    const wordEl=q('.word'), glossEl=q('.gloss'), fb=q('.feedback');
    const actBtn=q('.next'), counter=q('.counter'), score=q('.score');
    const barFill=q('.bar > i'), play=q('.play'), result=q('.result');
    const axisEls=[...root.querySelectorAll('.axis')];

    // total points = words * number of axes
    const TOTAL = words.length * axes.length;
    let i=0, points=0, picks={}, checked=false;

    function render(){
      checked=false; picks={};
      const w=words[i];
      wordEl.classList.add('swap');
      setTimeout(()=>{ wordEl.textContent=w.ar; glossEl.textContent=''; wordEl.classList.remove('swap'); },180);
      counter.textContent=`শব্দ ${i+1} / ${words.length}`;
      score.textContent=`স্কোর ${points} / ${TOTAL}`;
      barFill.style.width=(i/words.length*100)+'%';
      axisEls.forEach(ax=>{
        ax.querySelector('.mark').className='mark';
        ax.querySelector('.mark').textContent='';
        ax.querySelectorAll('.choice').forEach(c=>{ c.disabled=false; c.className='choice'; });
      });
      fb.className='feedback'; fb.innerHTML='';
      actBtn.textContent='মিলিয়ে দেখো ✓';
      actBtn.classList.add('check');
      actBtn.classList.remove('show'); actBtn.style.display='none';
    }

    function pick(axIdx, btn){
      if(checked) return;
      const ax=axisEls[axIdx];
      ax.querySelectorAll('.choice').forEach(c=>c.classList.remove('picked'));
      btn.classList.add('picked');
      picks[axIdx]=btn.dataset.type;
      // reveal check button once all axes picked
      if(Object.keys(picks).length===axes.length){ actBtn.style.display='inline-block'; }
    }

    function check(){
      if(checked) return; checked=true;
      const w=words[i];
      let lines=[];
      axes.forEach((ax,ai)=>{
        const right=w.ans[ai], picked=picks[ai];
        const axEl=axisEls[ai], mark=axEl.querySelector('.mark');
        axEl.querySelectorAll('.choice').forEach(c=>{
          c.disabled=true;
          if(c.dataset.type===right) c.classList.add('correct');
          else if(c.dataset.type===picked) c.classList.add('wrong');
          else c.classList.add('dim');
        });
        const ok = picked===right;
        if(ok) points++;
        mark.textContent = ok?'✓':'✗';
        mark.classList.add(ok?'ok':'no');
        const rightBn = ax.choices.find(c=>c.type===right).bn;
        lines.push(`<div style="margin:6px 0"><b style="color:${ok?'var(--green-ok)':'var(--rust)'}">${ax.label}: ${ok?'✓ '+rightBn:'✗ সঠিক — '+rightBn}</b><br><span style="font-size:.92em">${w.why[ai]}</span></div>`);
      });
      glossEl.textContent='“'+w.gloss+'”';
      fb.innerHTML=lines.join('');
      fb.classList.add('show');
      score.textContent=`স্কোর ${points} / ${TOTAL}`;
      actBtn.textContent = (i+1>=words.length)?'ফলাফল দেখো →':'পরের শব্দ →';
      actBtn.classList.remove('check');
    }

    function nextWord(){ i++; if(i>=words.length){ finish(); return; } render(); }

    function finish(){
      barFill.style.width='100%'; play.style.display='none';
      result.classList.add('show');
      result.querySelector('.big').textContent=`${points}/${TOTAL}`;
      const pct=points/TOTAL;
      let m;
      if(pct===1) m='মাশাআল্লাহ! তিন প্রকারই পুরোপুরি চিনে ফেলেছো।';
      else if(pct>=0.8) m='খুব ভালো! প্রায় সবই ঠিক।';
      else if(pct>=0.5) m='ভালো শুরু। উপরের কার্ডগুলো আরেকবার দেখে নাও।';
      else m='চিন্তা নেই — তিনটি ভাগ আবার পড়ে আবার চেষ্টা করো।';
      result.querySelector('.msg').textContent=m;
    }

    function restart(){ i=0; points=0; result.classList.remove('show'); play.style.display='block'; render(); }

    axisEls.forEach((ax,ai)=>{
      ax.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>pick(ai,btn)));
    });
    actBtn.addEventListener('click',()=>{ checked?nextWord():check(); });
    result.querySelector('.retry').addEventListener('click',restart);
    render();
  }

  /* ---------- sentence quiz engine (i'rab in context) ---------- */
  function makeSentenceQuiz(rootId, config){
    const root = document.getElementById(rootId);
    const unit = config.unit || 'বাক্য';
    const colClass = config.choices.length === 2 ? 'c2' : config.choices.length === 4 ? 'c4' : 'c3';
    root.innerHTML = `
      <div class="quiz-top">
        <span class="counter"></span>
        <span class="score"></span>
      </div>
      <div class="bar"><i></i></div>
      <div class="play">
        <p class="prompt">${config.prompt}</p>
        <div class="sentence">—</div>
        <div class="gloss"></div>
        <div class="choices ${colClass}">
          ${config.choices.map(c=>`<button class="choice" data-type="${c.type}"><span class="ar">${c.ar}</span>${c.bn}</button>`).join('')}
        </div>
        <div class="feedback"></div>
        <button class="next">পরের ${unit} →</button>
      </div>
      <div class="result">
        <div class="label">তোমার ফলাফল</div>
        <div class="big"></div>
        <p class="msg"></p>
        <button class="retry">আবার চেষ্টা করো ↺</button>
      </div>`;

    const NAME = {}; config.choices.forEach(c => NAME[c.type] = c.bn);
    const items = config.items;
    const q = s => root.querySelector(s);
    const choiceEls = [...root.querySelectorAll('.choice')];
    const sentEl = q('.sentence'), glossEl = q('.gloss'), fb = q('.feedback');
    const nextBtn = q('.next'), counter = q('.counter'), score = q('.score');
    const barFill = q('.bar > i'), play = q('.play'), result = q('.result');

    let i = 0, correct = 0, answered = false;

    function paint(it){
      const before = it.before ? `<span>${it.before}</span> ` : '';
      const after  = it.after  ? ` <span>${it.after}</span>` : '';
      return `${before}<mark class="tgt">${it.target}</mark>${after}`;
    }
    function render(){
      answered = false;
      const it = items[i];
      sentEl.classList.add('swap');
      setTimeout(()=>{ sentEl.innerHTML = paint(it); glossEl.textContent=''; sentEl.classList.remove('swap'); }, 180);
      counter.textContent = `${unit} ${i+1} / ${items.length}`;
      score.textContent = `সঠিক ${correct}`;
      barFill.style.width = (i/items.length*100) + '%';
      choiceEls.forEach(c=>{ c.disabled=false; c.className='choice'; });
      fb.className='feedback'; fb.innerHTML='';
      nextBtn.classList.remove('show');
    }
    function answer(btn){
      if(answered) return; answered = true;
      const it = items[i], picked = btn.dataset.type, right = it.type;
      choiceEls.forEach(c=>{
        c.disabled = true;
        if(c.dataset.type === right) c.classList.add('correct');
        else if(c === btn) c.classList.add('wrong');
        else c.classList.add('dim');
      });
      glossEl.textContent = '“' + it.gloss + '”';
      if(picked === right){ correct++; fb.innerHTML = `<b>সঠিক!</b> ${it.why}`; }
      else fb.innerHTML = `<b>আবার দেখো —</b> এটি <b>${NAME[right]}</b>। ${it.why}`;
      fb.classList.add('show');
      score.textContent = `সঠিক ${correct}`;
      nextBtn.classList.add('show');
    }
    function next(){ i++; if(i >= items.length){ finish(); return; } render(); }
    function finish(){
      barFill.style.width = '100%';
      play.style.display = 'none';
      result.classList.add('show');
      result.querySelector('.big').textContent = `${correct}/${items.length}`;
      const pct = correct/items.length;
      let m;
      if(pct === 1) m = 'মাশাআল্লাহ! ইʿরাব পুরোপুরি ধরে ফেলেছ।';
      else if(pct >= 0.7) m = 'খুব ভালো! প্রায় সবই ঠিক।';
      else if(pct >= 0.4) m = 'ভালো শুরু। উপরের অবস্থাগুলো আরেকবার দেখে নাও।';
      else m = 'চিন্তা নেই — উপরের কার্ডগুলো আবার পড়ে আবার চেষ্টা করো।';
      result.querySelector('.msg').textContent = m;
    }
    function restart(){ i=0; correct=0; result.classList.remove('show'); play.style.display='block'; render(); }

    choiceEls.forEach(c => c.addEventListener('click', ()=>answer(c)));
    nextBtn.addEventListener('click', next);
    result.querySelector('.retry').addEventListener('click', restart);
    render();
    return { restart };
  }
