function pauseWorkout(){
  if(session.paused)return;
  const seg=current();
  if(seg && (seg.kind==='rest'||(seg.kind==='work'&&seg.type!=='reps'))) session.pausedRemaining=segmentRemaining();
  session.paused=true; session.pauseStartedAt=Date.now(); saveSession(); showPauseOverlay();
}
function resumeWorkout(){
  if(!session.paused)return;
  const now=Date.now();
  const pauseDuration=Math.max(0,now-(session.pauseStartedAt||now));
  session.pausedTotalMs += pauseDuration; session.pauseStartedAt=null; session.paused=false;
  const seg=current();
  if(seg && (seg.kind==='rest'||(seg.kind==='work'&&seg.type!=='reps'))) session.segmentEndAt=now+(session.pausedRemaining||0)*1000;
  if(seg?.kind==='work' && seg.type==='reps' && session.segmentStartedAt) session.segmentStartedAt += pauseDuration;
  session.pausedRemaining=null; saveSession(); document.querySelector('.pause-overlay')?.remove(); renderPlayer();
}
function showPauseOverlay(){
  if(document.querySelector('.pause-overlay'))return;
  const d=document.createElement('div');d.className='pause-overlay';d.innerHTML=`<div class="pause-card"><h2>Пауза</h2><p>Таймеры остановлены, прогресс сохранён.</p><button class="btn primary full" id="resumeOverlay">Продолжить</button><button class="btn full" style="margin-top:10px" id="homeOverlay">На главную</button></div>`;document.body.appendChild(d);
  d.querySelector('#resumeOverlay').onclick=resumeWorkout;
  d.querySelector('#homeOverlay').onclick=()=>{saveSession();releaseWakeLock();renderHome()};
}

function tick(){
  if(!session||session.paused)return;
  const seg=current(); if(!seg)return;
  if(seg.kind==='rest'||(seg.kind==='work'&&seg.type!=='reps')){
    const rem=segmentRemaining();
    if(seg.kind==='work'&&seg.type==='timedSides'&&seg.sideSwitchAt && !session.sideSwitchPlayed){
      const elapsed=(seg.durationSec-rem);
      if(elapsed>=seg.sideSwitchAt){ session.sideSwitchPlayed=true; beep('switch'); navigator.vibrate?.(80); const c=document.getElementById('cueText'); if(c)c.textContent='Смени сторону'; saveSession(); }
    }
    if(rem<=3 && rem>0 && lastCountdownSecond!==rem){ lastCountdownSecond=rem; beep('count'); }
    if(rem<=0){
      if(seg.kind==='work') completeCurrentWork(); else advance(false);
      return;
    }
  }
  updateLive();
  const now=Date.now();
  if(!session.lastSavedAt || now-session.lastSavedAt>=5000){ session.lastSavedAt=now; saveSession(); }
}
function updateLive(){
  if(!session)return; const seg=current(); const t=document.getElementById('bigTimer');
  if(t){
    if(seg.kind==='rest'||(seg.kind==='work'&&seg.type!=='reps')) t.textContent=fmt(segmentRemaining());
    else t.textContent=fmt(Math.floor((Date.now()-session.segmentStartedAt)/1000));
  }
  const e=document.getElementById('elapsedStat'); if(e)e.textContent=fmt(elapsedSec());
  const r=document.getElementById('remainStat'); if(r)r.textContent=`≈ ${fmt(remainingEstimate())}`;
}
function startTicker(){ stopTicker(); ticker=setInterval(tick,250); }
function stopTicker(){ if(ticker)clearInterval(ticker); ticker=null; }