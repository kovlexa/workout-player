function renderHome(){
  stopTicker();
  const saved=safeJSON(localStorage.getItem('workout-session'));
  const install = !isStandalone() && isIOS() ? `<div class="install-card"><b>На iPhone:</b> открой приложение в Safari → «Поделиться» → «На экран Домой». После установки оно запускается отдельным окном.</div>` : '';
  const cards=Object.values(WORKOUTS).map(w=>{
    const mins=estimateWorkout(w,{});
    const preview=[];
    if(w.warmup) preview.push(...WARMUP.map(x=>({n:x.name,t:x.target})));
    preview.push(...w.exercises.map(x=>({n:x.name,t:`${x.sets}× ${x.target} · отдых ${x.restLabel}`})));
    return `<article class="card">
      <div class="card-head"><div><h2>${esc(w.title)}</h2><div class="subtitle">${esc(w.subtitle)}</div></div><span class="pill green">≈ ${mins} мин</span></div>
      <div class="card-meta"><span class="pill">${workoutExerciseCount(w)} упражнений</span>${w.equipment.slice(0,3).map(e=>`<span class="pill">${esc(e)}</span>`).join('')}</div>
      <div class="actions"><button class="btn primary" data-start="${w.id}">Начать</button><button class="btn" data-preview="${w.id}">Список</button></div>
      <details class="preview" id="preview-${w.id}"><summary>Посмотреть программу <span>⌄</span></summary><ul class="preview-list">${preview.map((x,i)=>`<li class="preview-item"><b>${i+1}. ${esc(x.n)}</b><span>${esc(x.t)}</span></li>`).join('')}</ul></details>
    </article>`;
  }).join('');
  $app.innerHTML=`<main class="app">
    <div class="topbar"><div><h1 class="title">Тренировки</h1><p class="subtitle">Домашний цикл · 4 недели</p></div><button class="icon-btn" id="settingsBtn" aria-label="Настройки">⚙︎</button></div>
    <div class="card settings-panel" id="settingsPanel">${settingsHTML()}</div>
    ${saved && saved.status==='active' ? `<div class="resume-card"><strong>Есть незавершённая тренировка</strong><div class="subtitle">${esc(saved.workoutTitle||'Тренировка')} · сохранено автоматически</div><div class="actions"><button class="btn primary" id="resumeBtn">Продолжить</button><button class="btn" id="discardBtn">Сбросить</button></div></div>`:''}
    ${install}
    <div class="workout-grid">${cards}</div>
    <div class="section-label">Медиа</div>
    <div class="card"><div class="card-head"><div><h2 style="font-size:18px">Демонстрации упражнений</h2><div class="subtitle">Изображения и видео загружаются из открытых веб-источников; после первой загрузки приложение пытается сохранить их в офлайн-кэш.</div></div></div><div class="actions"><button class="btn" id="sourcesBtn">Источники</button></div></div>
  </main>`;
  bindHome();
}

function settingsHTML(){
  return `<div class="setting-row"><div><b>Звуковые сигналы</b><div class="small-note">Старт отдыха, последние 3 секунды, начало упражнения</div></div><button class="switch ${settings.sound?'on':''}" id="soundToggle" aria-label="Звук"></button></div>
  <div class="setting-row"><div><b>Громкость сигналов</b></div><input class="range" id="volumeRange" type="range" min="0" max="1" step="0.05" value="${settings.volume}"></div>
  <div class="setting-row"><div><b>Экран не гаснет</b><div class="small-note">Работает, если браузер поддерживает Screen Wake Lock</div></div><button class="switch ${settings.wake?'on':''}" id="wakeToggle" aria-label="Экран не гаснет"></button></div>`;
}

function bindSettings(){
  const st=document.getElementById('soundToggle'); if(st) st.onclick=()=>{settings.sound=!settings.sound;saveSettings();beep('start');rerenderSettings()};
  const vr=document.getElementById('volumeRange'); if(vr) vr.oninput=e=>{settings.volume=+e.target.value;saveSettings()};
  const wt=document.getElementById('wakeToggle'); if(wt) wt.onclick=async()=>{settings.wake=!settings.wake;saveSettings(); if(settings.wake) await requestWakeLock(); else await releaseWakeLock(); rerenderSettings();};
}
function rerenderSettings(){ const p=document.getElementById('settingsPanel'); if(p){p.innerHTML=settingsHTML(); bindSettings();} }

function bindHome(){
  document.getElementById('settingsBtn').onclick=()=>{document.getElementById('settingsPanel').classList.toggle('open');};
  bindSettings();
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>openStartOptions(b.dataset.start));
  document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{const d=document.getElementById(`preview-${b.dataset.preview}`); d.open=!d.open;});
  document.getElementById('resumeBtn')?.addEventListener('click',resumeSavedSession);
  document.getElementById('discardBtn')?.addEventListener('click',()=>{localStorage.removeItem('workout-session');renderHome()});
  document.getElementById('sourcesBtn').onclick=showSources;
}

function openStartOptions(id){
  const w=WORKOUTS[id];
  const isC=id==='C';
  const hasWarmup=w.warmup;
  const modal=document.createElement('div'); modal.className='modal';
  modal.innerHTML=`<div class="modal-card"><h2>${esc(w.title)}</h2>
    <div class="card-meta" style="margin-bottom:12px"><span class="pill green">≈ ${estimateWorkout(w)} мин</span>${w.equipment.map(e=>`<span class="pill">${esc(e)}</span>`).join('')}</div>
    ${isC?`<label class="setting-row"><div><b>Завтра футбол</b><div class="small-note">Болгарский сплит-присед будет 2×8 вместо 3×8.</div></div><input type="checkbox" id="footballTomorrow"></label>`:''}
    ${hasWarmup?`<label class="setting-row"><div><b>Ноги забиты после футбола</b><div class="small-note">В разминке ходьба 2–3 мин вместо скакалки.</div></div><input type="checkbox" id="walkInstead"></label>`:''}
    <div class="small-note" style="margin:14px 0">Автоматический отдых использует верхнюю границу диапазона (например, 60–90 сек → 90 сек). Во время отдыха можно добавить или убрать 15 секунд.</div>
    <div class="actions"><button class="btn primary full" id="confirmStart">Начать тренировку</button></div><div class="actions"><button class="btn full" id="cancelStart">Отмена</button></div>
  </div>`;
  document.body.appendChild(modal);
  modal.querySelector('#cancelStart').onclick=()=>modal.remove();
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
  modal.querySelector('#confirmStart').onclick=()=>{
    const opts={footballTomorrow:!!modal.querySelector('#footballTomorrow')?.checked,walkInstead:!!modal.querySelector('#walkInstead')?.checked};
    modal.remove(); startWorkout(w,opts);
  };
}