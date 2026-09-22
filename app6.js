function renderPlayer(){
  const seg=current(); if(!seg) return finishWorkout();
  const next=nextWorkFrom(session.index);
  const isRest=seg.kind==='rest';
  let displayWork=seg;
  if(isRest && next) displayWork=next;
  const timerValue = isRest || (seg.kind==='work'&&seg.type!=='reps') ? fmt(segmentRemaining()) : fmt(Math.floor((Date.now()-session.segmentStartedAt)/1000));
  const target = isRest ? (next?`${next.name} · подход ${next.set} из ${next.totalSets}`:'Финиш') : seg.target;
  const mainAction = isRest ? `<button class="btn main-action" id="skipRest">Пропустить отдых</button>` : (seg.type==='reps' ? `<button class="btn primary main-action" id="doneSet">Подход выполнен</button>` : `<button class="btn main-action" id="skipTimed">Далее сейчас</button>`);
  $app.innerHTML=`<main class="app player ${isRest?'rest-screen':''}">
    <div class="player-head"><div class="head-left"><div class="kicker">${esc(session.workoutTitle)}</div><div class="player-title">${isRest?'Отдых':esc(seg.name)}</div></div><button class="icon-btn" id="quickSound">${settings.sound?'🔊':'🔇'}</button></div>
    <div class="progress-wrap"><div class="progress-bar" style="width:${progressPercent()}%"></div></div>
    ${isRest?'':renderMedia(seg.media)}
    <section class="exercise-box">
      <div class="phase-badge ${isRest?'rest':''}">${phaseText(seg)}</div>
      <h1 class="exercise-name">${isRest?'ОТДЫХ':esc(seg.name)}</h1>
      <div class="setline">${isRest ? esc(seg.restLabel||'') : `${seg.phase==='warmup'?'':`Подход ${seg.set} из ${seg.totalSets}`}`}</div>
      <div class="target">${esc(target||'')}</div>
      <div class="timer ${(!isRest&&seg.type==='reps')?'countup':''}" id="bigTimer">${timerValue}</div>
      <div class="cue" id="cueText">${isRest ? (next?`Следующее: ${esc(next.name)}`:'Последний этап') : esc(seg.cue||'')}</div>
    </section>
    <div class="next-card"><span>${isRest?'После отдыха':'Далее'}</span><b>${next?`${esc(next.name)}${next.phase==='warmup'?'':` · ${next.set}/${next.totalSets}`}`:'Финиш'}</b></div>
    <div class="stats"><div class="stat"><b>${displayWork.exerciseNo||'–'} / ${displayWork.totalExercises||workoutExerciseCount(WORKOUTS[session.workoutId])}</b><span>упражнение</span></div><div class="stat"><b id="elapsedStat">${fmt(elapsedSec())}</b><span>прошло</span></div><div class="stat"><b id="remainStat">≈ ${fmt(remainingEstimate())}</b><span>осталось</span></div></div>
    ${mainAction}
    <div class="control-row"><button class="btn" id="backBtn">← Назад</button><button class="btn" id="pauseBtn">Пауза</button><button class="btn" id="nextBtn">Далее →</button></div>
    <div class="secondary-row"><button class="btn" id="repeatBtn">Повторить упражнение</button><button class="btn danger" id="finishBtn">Завершить</button></div>
    ${isRest?`<div class="control-row" style="grid-template-columns:1fr 1fr;margin-top:8px"><button class="btn" id="minus15">−15 сек</button><button class="btn" id="plus15">+15 сек</button></div>`:''}
    <div class="secondary-row" style="margin-top:8px"><button class="btn" id="wakeBtn">${settings.wake?'☀︎ Экран не гаснет':'☾ Экран может гаснуть'}</button><button class="btn" id="sourcesInline">Медиа / источники</button></div>
    <div class="volume-inline"><span>${settings.sound?'Громкость сигналов':'Звук выключен'}</span><input class="range" id="playerVolume" type="range" min="0" max="1" step="0.05" value="${settings.volume}" ${settings.sound?'':'disabled'} aria-label="Громкость сигналов"></div>
  </main>`;
  bindPlayer();
  if(session.paused) showPauseOverlay();
}

function bindPlayer(){
  document.getElementById('doneSet')?.addEventListener('click',completeCurrentWork);
  document.getElementById('skipRest')?.addEventListener('click',()=>advance(false));
  document.getElementById('skipTimed')?.addEventListener('click',()=>completeCurrentWork());
  document.getElementById('backBtn').onclick=goBack;
  document.getElementById('pauseBtn').onclick=pauseWorkout;
  document.getElementById('nextBtn').onclick=()=>{ if(confirm('Пропустить текущий этап и перейти дальше?')) advance(true); };
  document.getElementById('repeatBtn').onclick=repeatExercise;
  document.getElementById('finishBtn').onclick=()=>{ if(confirm('Завершить тренировку сейчас? Прогресс сохранится в итогах.')) finishWorkout(); };
  document.getElementById('quickSound').onclick=()=>{settings.sound=!settings.sound;saveSettings();renderPlayer(); if(settings.sound)beep('start');};
  document.getElementById('minus15')?.addEventListener('click',()=>adjustRest(-15));
  document.getElementById('plus15')?.addEventListener('click',()=>adjustRest(15));
  document.getElementById('wakeBtn').onclick=async()=>{settings.wake=!settings.wake;saveSettings();if(settings.wake)await requestWakeLock();else await releaseWakeLock();renderPlayer();};
  document.getElementById('sourcesInline').onclick=showSources;
  document.getElementById('playerVolume')?.addEventListener('input',e=>{ settings.volume=Number(e.target.value); saveSettings(); });
}

function completeCurrentWork(){
  const seg=current(); if(!seg||seg.kind!=='work')return;
  if(!session.completedIds.includes(seg.id)) session.completedIds.push(seg.id);
  saveSession(); advance(false);
}
function advance(skipped=false){
  const seg=current();
  if(skipped && seg?.kind==='work' && !session.skippedIds.includes(seg.id)) session.skippedIds.push(seg.id);
  session.index++;
  if(session.index>=session.plan.length) return finishWorkout();
  prepareCurrentSegment(true);
  const n=current();
  if(n.kind==='rest') beep('rest'); else beep('next');
  renderPlayer();
}
function goBack(){
  if(!session||session.index<=0)return;
  const seg=current();
  const target = seg?.kind==='rest' ? prevWorkIndex(session.index+1) : prevWorkIndex(session.index);
  session.index=Math.max(0,target);
  prepareCurrentSegment(true); saveSession(); renderPlayer();
}
function repeatExercise(){
  const seg=current();
  const previousWork=seg?.kind==='rest'?session.plan[prevWorkIndex(session.index+1)]:null;
  const targetId=seg?.kind==='work'?seg.exerciseId:(previousWork?.exerciseId||null); if(!targetId)return;
  const first=session.plan.findIndex(s=>s.kind==='work'&&s.exerciseId===targetId); if(first<0)return;
  session.completedIds=session.completedIds.filter(id=>!id.startsWith(targetId+'-s'));
  session.skippedIds=session.skippedIds.filter(id=>!id.startsWith(targetId+'-s'));
  session.index=first; prepareCurrentSegment(true); saveSession(); renderPlayer(); beep('next');
}
function adjustRest(delta){
  const seg=current(); if(!seg||seg.kind!=='rest')return;
  const rem=Math.max(0,segmentRemaining()+delta); session.segmentEndAt=Date.now()+rem*1000; saveSession(); updateLive();
}