function getWorkoutHistory(){
  const v=safeJSON(localStorage.getItem('workout-history'));
  return Array.isArray(v)?v:[];
}
function saveWorkoutHistory(items){ localStorage.setItem('workout-history',JSON.stringify(items)); }
function appendWorkoutHistory(summary){
  const items=getWorkoutHistory();
  items.unshift({...summary,id:summary.id||('w-'+Date.now())});
  saveWorkoutHistory(items.slice(0,250));
}
function getProgressLog(){
  const v=safeJSON(localStorage.getItem('progress-log'));
  return Array.isArray(v)?v:[];
}
function saveProgressLog(items){ localStorage.setItem('progress-log',JSON.stringify(items)); }
function cycleById(id){ return CYCLES.find(c=>c.id===id); }
function formatDate(tsOrDate){
  const d=typeof tsOrDate==='string' ? new Date(tsOrDate+'T12:00:00') : new Date(tsOrDate);
  return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function cycleWorkoutCards(cycle){
  return cycle.workoutIds.map(id=>WORKOUTS[id]).filter(Boolean).map(w=>{
    const mins=estimateWorkout(w,{});
    const preview=[];
    if(w.warmup) preview.push(...WARMUP.map(x=>({n:x.name,t:x.target})));
    preview.push(...w.exercises.map(x=>({n:x.name,t:`${x.sets}× ${x.target} · отдых ${x.restLabel}`})));
    return `<article class="card">
      <div class="card-head"><div><h2>${esc(w.title)}</h2><div class="subtitle">${esc(w.subtitle)}</div></div><span class="pill green">≈ ${mins} мин</span></div>
      <div class="card-meta"><span class="pill">${workoutExerciseCount(w)} упражнений</span>${w.equipment.slice(0,3).map(e=>`<span class="pill">${esc(e)}</span>`).join('')}</div>
      <div class="actions"><button class="btn primary" data-start="${w.id}">Начать</button><button class="btn" data-preview="${w.id}">Список</button></div>
      <div class="preview" id="preview-${w.id}" hidden><ul class="preview-list">${preview.map((x,i)=>`<li class="preview-item"><b>${i+1}. ${esc(x.n)}</b><span>${esc(x.t)}</span></li>`).join('')}</ul></div>
    </article>`;
  }).join('');
}
function dashboardSummaryHTML(){
  const h=getWorkoutHistory();
  const p=getProgressLog();
  const last=h[0];
  const latest=p[0];
  return `<div class="dashboard-grid">
    <button class="dashboard-card" id="historyBtn"><span class="dashboard-icon">◷</span><div><b>История</b><small>${h.length ? `${h.length} тренировок · последняя ${formatDate(last.at)}` : 'Пока пусто'}</small></div><span>›</span></button>
    <button class="dashboard-card" id="statsBtn"><span class="dashboard-icon">▥</span><div><b>Статистика</b><small>${h.length ? 'Частота, время и выполнение' : 'Появится после первой тренировки'}</small></div><span>›</span></button>
    <button class="dashboard-card" id="progressBtn"><span class="dashboard-icon">↗</span><div><b>Прогресс</b><small>${latest ? `Последняя запись ${formatDate(latest.date)}` : 'Вес, талия и контрольные тесты'}</small></div><span>›</span></button>
  </div>`;
}
function renderHome(){
  stopTicker();
  const saved=safeJSON(localStorage.getItem('workout-session'));
  const install = !isStandalone() && isIOS() ? `<div class="install-card"><b>На iPhone:</b> открой приложение в Safari → «Поделиться» → «На экран Домой». После установки оно запускается отдельным окном.</div>` : '';
  const active=CYCLES.find(c=>c.status==='active')||CYCLES[0];
  const archived=CYCLES.filter(c=>c.id!==active?.id);
  $app.innerHTML=`<main class="app">
    <div class="topbar"><div><h1 class="title">Тренировки</h1><p class="subtitle">Личный тренировочный плеер</p></div><button class="icon-btn" id="settingsBtn" aria-label="Настройки">⚙︎</button></div>
    <div class="card settings-panel" id="settingsPanel">${settingsHTML()}</div>
    ${saved && saved.status==='active' ? `<div class="resume-card"><strong>Есть незавершённая тренировка</strong><div class="subtitle">${esc(saved.workoutTitle||'Тренировка')} · сохранено автоматически</div><div class="actions"><button class="btn primary" id="resumeBtn">Продолжить</button><button class="btn" id="discardBtn">Сбросить</button></div></div>`:''}
    ${install}
    ${dashboardSummaryHTML()}
    ${active ? `<section class="cycle-head"><div><div class="cycle-kicker">Текущий цикл</div><h2>${esc(active.title)}</h2><p>${esc(active.subtitle)}</p></div><span class="pill green">Активный</span></section><div class="workout-grid">${cycleWorkoutCards(active)}</div>` : ''}
    ${archived.length ? `<div class="section-label">Прошлые циклы</div>${archived.map(c=>`<details class="cycle-archive card"><summary><div><b>${esc(c.title)}</b><span>${esc(c.subtitle)}</span></div><span>⌄</span></summary><div class="workout-grid archive-grid">${cycleWorkoutCards(c)}</div></details>`).join('')}` : ''}
  </main>`;
  bindDashboardHome();
}
function bindDashboardHome(){
  document.getElementById('settingsBtn').onclick=()=>document.getElementById('settingsPanel').classList.toggle('open');
  bindSettings();
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>openStartOptions(b.dataset.start));
  document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{const p=document.getElementById(`preview-${b.dataset.preview}`);const opening=p.hidden;p.hidden=!p.hidden;b.textContent=opening?'Скрыть':'Список';});
  document.getElementById('resumeBtn')?.addEventListener('click',resumeSavedSession);
  document.getElementById('discardBtn')?.addEventListener('click',()=>{localStorage.removeItem('workout-session');renderHome()});
  document.getElementById('historyBtn')?.addEventListener('click',renderHistory);
  document.getElementById('statsBtn')?.addEventListener('click',renderStats);
  document.getElementById('progressBtn')?.addEventListener('click',renderProgress);
}
function renderHistory(){
  const items=getWorkoutHistory();
  const totalSec=items.reduce((s,x)=>s+(x.duration||0),0);
  const cards=items.length?items.map(x=>{
    const cycle=cycleById(x.cycleId);
    return `<div class="history-item"><div><b>${esc(x.workoutTitle||x.workoutId||'Тренировка')}</b><span>${formatDate(x.at)}${cycle?' · '+esc(cycle.title):''}</span></div><div class="history-right"><b>${fmt(x.duration||0)}</b><span>${x.sets||0}/${x.totalSets||0} подходов</span></div></div>`;
  }).join(''):`<div class="empty-state">После первой завершённой тренировки здесь появится история.</div>`;
  $app.innerHTML=`<main class="app"><div class="subpage-head"><button class="icon-btn" id="backHome">←</button><div><div class="kicker">Дневник</div><h1>История тренировок</h1></div></div>
    <div class="summary-grid"><div class="stat"><b>${items.length}</b><span>тренировок</span></div><div class="stat"><b>${Math.round(totalSec/3600*10)/10} ч</b><span>всего времени</span></div></div>
    <div class="card history-list">${cards}</div>
    ${items.length?`<button class="btn danger full" id="clearHistory" style="margin-top:12px">Очистить историю</button>`:''}
  </main>`;
  document.getElementById('backHome').onclick=renderHome;
  document.getElementById('clearHistory')?.addEventListener('click',()=>{if(confirm('Очистить всю историю тренировок на этом устройстве?')){saveWorkoutHistory([]);renderHistory();}});
}
function numberOrNull(v){ if(v===''||v==null)return null; const n=Number(String(v).replace(',','.')); return Number.isFinite(n)?n:null; }
function metricDelta(latest,first,key,unit=''){
  if(latest?.[key]==null||first?.[key]==null)return '—';
  const d=Math.round((latest[key]-first[key])*10)/10;
  return `${d>0?'+':''}${d}${unit}`;
}
function renderProgress(){
  const items=getProgressLog();
  const latest=items[0], first=items[items.length-1];
  const today=new Date().toISOString().slice(0,10);
  const rows=items.length?items.map(x=>`<div class="progress-entry"><div class="progress-date">${formatDate(x.date)}</div><div class="progress-values">${x.weight!=null?`<span>Вес <b>${x.weight} кг</b></span>`:''}${x.waist!=null?`<span>Талия <b>${x.waist} см</b></span>`:''}${x.pullups!=null?`<span>Подтягивания <b>${x.pullups}</b></span>`:''}${x.pushups!=null?`<span>Отжимания <b>${x.pushups}</b></span>`:''}</div>${x.notes?`<p>${esc(x.notes)}</p>`:''}</div>`).join(''):`<div class="empty-state">Добавь первую контрольную точку. Данные хранятся только на этом устройстве.</div>`;
  $app.innerHTML=`<main class="app"><div class="subpage-head"><button class="icon-btn" id="backHome">←</button><div><div class="kicker">Контрольные точки</div><h1>Прогресс</h1></div></div>
    ${latest&&first&&items.length>1?`<div class="metric-grid"><div class="metric-card"><span>Вес</span><b>${latest.weight??'—'}</b><small>${metricDelta(latest,first,'weight',' кг')}</small></div><div class="metric-card"><span>Талия</span><b>${latest.waist??'—'}</b><small>${metricDelta(latest,first,'waist',' см')}</small></div><div class="metric-card"><span>Подтяг.</span><b>${latest.pullups??'—'}</b><small>${metricDelta(latest,first,'pullups')}</small></div><div class="metric-card"><span>Отжим.</span><b>${latest.pushups??'—'}</b><small>${metricDelta(latest,first,'pushups')}</small></div></div>`:''}
    <div class="card progress-form"><h2>Новая запись</h2><div class="form-grid"><label>Дата<input id="pDate" type="date" value="${today}"></label><label>Вес, кг<input id="pWeight" inputmode="decimal" placeholder="например 72.5"></label><label>Талия, см<input id="pWaist" inputmode="decimal" placeholder="например 84"></label><label>Подтягивания<input id="pPullups" inputmode="numeric" placeholder="максимум"></label><label>Отжимания<input id="pPushups" inputmode="numeric" placeholder="максимум"></label></div><label class="notes-label">Комментарий<textarea id="pNotes" rows="3" placeholder="сон, самочувствие, что изменилось"></textarea></label><button class="btn primary full" id="saveProgress" style="margin-top:12px">Сохранить контрольную точку</button></div>
    <div class="section-label">Записи</div><div class="card progress-list">${rows}</div>
  </main>`;
  document.getElementById('backHome').onclick=renderHome;
  document.getElementById('saveProgress').onclick=()=>{
    const entry={id:'p-'+Date.now(),date:document.getElementById('pDate').value||today,weight:numberOrNull(document.getElementById('pWeight').value),waist:numberOrNull(document.getElementById('pWaist').value),pullups:numberOrNull(document.getElementById('pPullups').value),pushups:numberOrNull(document.getElementById('pPushups').value),notes:document.getElementById('pNotes').value.trim()};
    if(entry.weight==null&&entry.waist==null&&entry.pullups==null&&entry.pushups==null&&!entry.notes){alert('Добавь хотя бы один показатель или комментарий.');return;}
    const log=getProgressLog();log.unshift(entry);log.sort((a,b)=>String(b.date).localeCompare(String(a.date)));saveProgressLog(log.slice(0,200));renderProgress();
  };
}
function startOfLocalDay(ts){
  const d=new Date(ts); d.setHours(0,0,0,0); return d.getTime();
}
function renderStats(){
  const items=getWorkoutHistory();
  const now=Date.now();
  const weekAgo=now-7*24*3600*1000;
  const recent=items.filter(x=>x.at>=weekAgo);
  const totalSec=items.reduce((s,x)=>s+(x.duration||0),0);
  const recentSec=recent.reduce((s,x)=>s+(x.duration||0),0);
  const completed=items.reduce((s,x)=>s+(x.sets||0),0);
  const planned=items.reduce((s,x)=>s+(x.totalSets||0),0);
  const completion=planned?Math.round(completed/planned*100):0;
  const avg=items.length?Math.round(totalSec/items.length):0;
  const counts={};
  items.forEach(x=>{ const k=x.workoutTitle||x.workoutId||'Тренировка'; counts[k]=(counts[k]||0)+1; });
  const maxCount=Math.max(1,...Object.values(counts));
  const distribution=Object.entries(counts).length
    ? Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="stat-row"><div class="stat-row-head"><span>${esc(name)}</span><b>${count}</b></div><div class="mini-bar"><i style="width:${Math.round(count/maxCount*100)}%"></i></div></div>`).join('')
    : '<div class="empty-state">Статистика появится после первой завершённой тренировки.</div>';

  const weeks=[];
  for(let i=3;i>=0;i--){
    const end=now-i*7*24*3600*1000;
    const start=end-7*24*3600*1000;
    const n=items.filter(x=>x.at>start&&x.at<=end).length;
    weeks.push({label:i===0?'эта':`−${i} нед.`,n});
  }
  const maxWeek=Math.max(1,...weeks.map(x=>x.n));
  const weekBars=weeks.map(w=>`<div class="week-col"><div class="week-value">${w.n}</div><div class="week-bar-wrap"><i style="height:${Math.max(4,Math.round(w.n/maxWeek*100))}%"></i></div><span>${w.label}</span></div>`).join('');

  const p=getProgressLog();
  const latest=p[0], first=p[p.length-1];
  const body = latest
    ? `<div class="summary-grid"><div class="stat"><b>${latest.weight??'—'} кг</b><span>вес сейчас</span></div><div class="stat"><b>${latest.waist??'—'} см</b><span>талия сейчас</span></div></div>
       ${p.length>1?`<div class="small-note">С первой записи: вес ${metricDelta(latest,first,'weight',' кг')}, талия ${metricDelta(latest,first,'waist',' см')}, подтягивания ${metricDelta(latest,first,'pullups')}, отжимания ${metricDelta(latest,first,'pushups')}.</div>`:''}`
    : '<div class="empty-state">Контрольных замеров пока нет.</div>';

  $app.innerHTML=`<main class="app">
    <div class="subpage-head"><button class="icon-btn" id="backHome">←</button><div><div class="kicker">Автоматический учёт</div><h1>Статистика</h1></div></div>
    <div class="metric-grid stats-metrics">
      <div class="metric-card"><span>7 дней</span><b>${recent.length}</b><small>тренировок</small></div>
      <div class="metric-card"><span>7 дней</span><b>${Math.round(recentSec/60)}</b><small>минут</small></div>
      <div class="metric-card"><span>всего</span><b>${items.length}</b><small>тренировок</small></div>
      <div class="metric-card"><span>выполнение</span><b>${completion}%</b><small>подходов</small></div>
    </div>
    <div class="card stats-card"><h2>Последние 4 недели</h2><div class="week-chart">${weekBars}</div></div>
    <div class="card stats-card" style="margin-top:12px"><h2>По тренировкам</h2>${distribution}</div>
    <div class="card stats-card" style="margin-top:12px"><h2>Средняя длительность</h2><div class="big-stat">${fmt(avg)}</div><div class="small-note">Считается по завершённым тренировкам.</div></div>
    <div class="card stats-card" style="margin-top:12px"><h2>Контрольные показатели</h2>${body}<button class="btn full" id="openProgressFromStats" style="margin-top:12px">Открыть прогресс</button></div>
  </main>`;
  document.getElementById('backHome').onclick=renderHome;
  document.getElementById('openProgressFromStats').onclick=renderProgress;
}
