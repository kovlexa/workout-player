function startWorkout(workout,opts={}){
  ensureAudio();
  const plan=buildPlan(workout,opts,true);
  session={
    status:'active', workoutId:workout.id, workoutTitle:workout.title, opts, plan, index:0,
    completedIds:[], skippedIds:[], startedAt:Date.now(), pausedTotalMs:0, paused:false, pauseStartedAt:null,
    segmentStartedAt:Date.now(), segmentEndAt:null, pausedRemaining:null, sideSwitchPlayed:false,
    finishedAt:null
  };
  prepareCurrentSegment(true);
  saveSession();
  if(settings.wake) requestWakeLock();
  renderPlayer();
  startTicker();
  beep('next');
}

function resumeSavedSession(){
  const saved=safeJSON(localStorage.getItem('workout-session')); if(!saved||saved.status!=='active')return renderHome();
  session=saved;
  if(session.paused){ /* keep paused */ }
  else {
    const seg=current();
    if(seg && (seg.kind==='rest'||(seg.kind==='work'&&seg.type!=='reps')) && session.segmentEndAt==null){
      session.segmentEndAt=Date.now()+(seg.durationSec||0)*1000;
    }
  }
  ensureAudio(); if(settings.wake) requestWakeLock(); renderPlayer(); startTicker();
}

function current(){ return session?.plan?.[session.index]||null; }
function nextWorkFrom(idx){ return session.plan.slice(idx+1).find(s=>s.kind==='work')||null; }
function prevWorkIndex(idx){ for(let i=idx-1;i>=0;i--) if(session.plan[i].kind==='work') return i; return 0; }

function prepareCurrentSegment(resetTimer=false){
  const seg=current(); if(!seg)return;
  session.sideSwitchPlayed=false; lastCountdownSecond=null;
  if(resetTimer || session.segmentEndAt==null){
    session.segmentStartedAt=Date.now();
    session.segmentEndAt = (seg.kind==='rest'||(seg.kind==='work'&&seg.type!=='reps')) ? Date.now()+(seg.durationSec||0)*1000 : null;
  }
  saveSession();
}

function saveSession(){ if(session) localStorage.setItem('workout-session',JSON.stringify(session)); }
function clearSession(){ localStorage.removeItem('workout-session'); session=null; }

function segmentRemaining(){
  const seg=current(); if(!seg) return 0;
  if(session.paused && session.pausedRemaining!=null) return session.pausedRemaining;
  if(session.segmentEndAt==null) return 0;
  return Math.max(0,Math.ceil((session.segmentEndAt-Date.now())/1000));
}
function elapsedSec(){
  if(!session) return 0;
  let end=session.finishedAt||Date.now();
  let paused=session.pausedTotalMs||0;
  if(session.paused&&session.pauseStartedAt) paused += end-session.pauseStartedAt;
  return Math.max(0,Math.floor((end-session.startedAt-paused)/1000));
}
function remainingEstimate(){
  if(!session)return 0;
  let sum=0;
  session.plan.slice(session.index).forEach((s,i)=>{
    if(i===0){
      if(s.kind==='rest'||(s.kind==='work'&&s.type!=='reps')) sum+=segmentRemaining();
      else { const repSec=session.workoutId==='P'?30:45; sum+=Math.max(0,repSec-Math.floor((Date.now()-session.segmentStartedAt)/1000)); }
    } else { const repSec=session.workoutId==='P'?30:45; sum+= s.kind==='rest' ? s.durationSec : (s.type==='reps'?repSec:s.durationSec); }
  });
  return sum;
}

function renderMedia(mediaKey){
  const m=MEDIA[mediaKey]; if(!m) return `<div class="media"><div class="media-fallback">Демонстрация недоступна</div></div>`;
  const source=`<a class="media-source" href="${m.videoUrl||m.sourceUrl}" target="_blank" rel="noopener">Видео техники ↗</a>`;
  if(m.type==='video') {
    const sources = `${m.mp4?`<source src="${m.mp4}" type="video/mp4">`:''}<source src="${m.src}" type="video/webm">`;
    return `<div class="media"><video autoplay muted loop playsinline poster="${m.poster||''}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">${sources}</video><div class="media-fallback" style="display:none">Видео не загрузилось. <a href="${m.videoUrl}" target="_blank">Открыть демонстрацию</a></div>${source}</div>`;
  }
  return `<div class="media"><img src="${m.src}" alt="${esc(m.source)} — демонстрация упражнения" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="media-fallback" style="display:none">Изображение не загрузилось. <a href="${m.videoUrl}" target="_blank">Открыть видео техники</a></div>${source}</div>`;
}

function phaseText(seg){ if(seg.kind==='rest')return 'Отдых'; if(seg.phase==='warmup')return 'Разминка'; if(seg.phase==='posture')return 'Осанка'; return 'Основная часть'; }
function progressPercent(){
  if(!session)return 0; const work=session.plan.filter(s=>s.kind==='work'); const done=work.filter(w=>session.completedIds.includes(w.id)).length; return Math.round((done/work.length)*100);
}
function completedSets(){ return session?.completedIds?.filter(id=>session.plan.find(s=>s.id===id&&s.kind==='work'&&s.phase!=='warmup')).length||0; }