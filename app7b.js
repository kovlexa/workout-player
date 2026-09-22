function finishWorkout(){
  if(!session)return renderHome();
  session.status='complete'; session.finishedAt=Date.now();
  const duration=elapsedSec();
  const workout=WORKOUTS[session.workoutId];
  const completedMain=session.plan.filter(s=>s.kind==='work'&&s.phase!=='warmup'&&session.completedIds.includes(s.id));
  const byExercise={}; completedMain.forEach(s=>{byExercise[s.name]=(byExercise[s.name]||0)+1});
  const totalMain=session.plan.filter(s=>s.kind==='work'&&s.phase!=='warmup').length;
  const summary={workoutId:workout.id,workoutTitle:workout.title,cycleId:workout.cycleId||null,duration,at:Date.now(),sets:completedMain.length,totalSets:totalMain,byExercise};
  localStorage.setItem('workout-last-summary',JSON.stringify(summary));
  if(typeof appendWorkoutHistory==='function') appendWorkoutHistory(summary);
  localStorage.removeItem('workout-session');
  stopTicker(); releaseWakeLock();
  $app.innerHTML=`<main class="app complete"><div class="card complete-card"><div class="complete-icon">✓</div><h1>Тренировка завершена</h1><p>${esc(workout.title)}</p>
    <div class="summary-grid"><div class="stat"><b>${fmt(duration)}</b><span>продолжительность</span></div><div class="stat"><b>${completedMain.length} / ${totalMain}</b><span>подходов</span></div></div>
    <div class="completed-list">${Object.entries(byExercise).map(([name,count])=>`<div><b>${esc(name)}</b><span>${count} подхода</span></div>`).join('') || '<div><b>Подходы не отмечены</b><span>—</span></div>'}</div>
    <button class="btn primary full" id="homeDone">На главную</button><button class="btn full" style="margin-top:10px" id="repeatDone">Повторить тренировку</button>
  </div></main>`;
  const repeatId=workout.id, repeatOpts=session.opts; session=null;
  document.getElementById('homeDone').onclick=renderHome;
  document.getElementById('repeatDone').onclick=()=>startWorkout(WORKOUTS[repeatId],repeatOpts);
  beep('finish');
}

function ensureAudio(){
  try{ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended')audioCtx.resume(); }catch{}
}
function beep(type='next'){
  if(!settings.sound||settings.volume<=0)return; ensureAudio(); if(!audioCtx)return;
  const cfg={rest:[420,.10],count:[720,.07],next:[900,.15],switch:[610,.12],finish:[980,.22],start:[760,.1]}[type]||[800,.1];
  const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type='sine';o.frequency.value=cfg[0];g.gain.value=Math.max(.0001,settings.volume*.18);o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+cfg[1]);o.stop(audioCtx.currentTime+cfg[1]+.02);
}

async function requestWakeLock(){
  try{ if('wakeLock' in navigator){ wakeLock=await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release',()=>{wakeLock=null}); } }
  catch(e){ console.warn('Wake lock unavailable',e); }
}
async function releaseWakeLock(){ try{await wakeLock?.release()}catch{} wakeLock=null; }
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&settings.wake&&session?.status==='active'&&!session.paused) requestWakeLock(); saveSession(); });
window.addEventListener('pagehide',saveSession);

function showSources(){
  const used=[...new Set(Object.values(WORKOUTS).flatMap(w=>[...(w.warmup?WARMUP:[]),...w.exercises].map(e=>e.media)))];
  const modal=document.createElement('div');modal.className='modal';
  modal.innerHTML=`<div class="modal-card"><h2>Источники медиа</h2><p class="small-note">Приложение не рисует технику самостоятельно. Основные демонстрации загружаются с указанных сайтов; для части упражнений дополнительно есть внешняя ссылка на видео техники.</p>${used.map(k=>{const m=MEDIA[k];return `<div class="source"><b>${esc(m.source)}</b><a href="${m.sourceUrl}" target="_blank" rel="noopener">${esc(m.sourceUrl)}</a></div>`}).join('')}<button class="btn full" style="margin-top:14px" id="closeSources">Закрыть</button></div>`;
  document.body.appendChild(modal);modal.querySelector('#closeSources').onclick=()=>modal.remove();modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
}

if('serviceWorker' in navigator && location.protocol!=='file:'){
  let swRefreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(swRefreshing) return;
    swRefreshing=true;
    location.reload();
  });
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      await reg.update();
      if(reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker) return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            worker.postMessage('SKIP_WAITING');
          }
        });
      });
    }catch(e){ console.warn(e); }
  });
}

renderHome();