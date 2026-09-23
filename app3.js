const DEFAULT_SETTINGS = { sound:true, volume:0.65, wake:false };
let settings = {...DEFAULT_SETTINGS, ...safeJSON(localStorage.getItem('workout-settings'))};
let session = null;
let ticker = null;
let audioCtx = null;
let wakeLock = null;
let lastCountdownSecond = null;

function safeJSON(v){ try{return v?JSON.parse(v):null}catch{return null} }
function saveSettings(){ localStorage.setItem('workout-settings', JSON.stringify(settings)); }
function fmt(sec){ sec=Math.max(0,Math.round(sec)); const m=Math.floor(sec/60), s=sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
function esc(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }

function estimateWorkout(workout, opts={}){
  const plan=buildPlan(workout,opts,false);
  const repSec=workout.id==='P'?30:45;
  return Math.round(plan.reduce((sum,s)=>sum+(s.kind==='work'?(s.type==='reps'?repSec:s.durationSec):s.durationSec),0)/60);
}
function workoutExerciseCount(workout){ return (workout.warmup?WARMUP.length:0)+workout.exercises.length; }

function buildPlan(workout, opts={}, withMeta=true){
  const plan=[];
  let exOrder=0;
  const addWork=(ex,phase,set,totalSets,exerciseNo,totalExercises)=>{
    const info=(typeof EXERCISE_INFO!=='undefined' && EXERCISE_INFO[ex.media]) ? EXERCISE_INFO[ex.media] : {};
    plan.push({
      kind:'work', phase, id:`${ex.id}-s${set}`, exerciseId:ex.id, name:ex.name, set, totalSets,
      target:ex.target, type:ex.type, durationSec:ex.durationSec||null, sideSwitchAt:ex.sideSwitchAt||null,
      media:ex.media, cue:ex.cue||'', muscles:ex.muscles||info.muscles||'', purpose:ex.purpose||info.purpose||'',
      tempo:ex.tempo||info.tempo||'', restSec:ex.restSec||0, restLabel:ex.restLabel||'', exerciseNo,totalExercises
    });
  };
  const totalExercises=workoutExerciseCount(workout);
  if(workout.warmup){
    WARMUP.forEach((raw,i)=>{
      const ex={...raw};
      if(ex.id==='wu-rope' && opts.walkInstead){
        ex.name='Быстрая ходьба на месте'; ex.target='2–3 минуты'; ex.durationSec=150;
        ex.media='bodySquat'; ex.cue='Лёгкая ходьба на месте вместо скакалки, если ноги забиты после футбола.';
      }
      exOrder++;
      addWork(ex,'warmup',1,1,exOrder,totalExercises);
    });
    plan.push({kind:'rest',phase:'transition',id:'warmup-transition',name:'Переход к основной части',durationSec:60,restLabel:'1 мин'});
  }
  workout.exercises.forEach((raw,idx)=>{
    const ex={...raw};
    if(workout.id==='C' && ex.id==='c-bulgarian' && opts.footballTomorrow) ex.sets=2;
    exOrder++;
    const exNo=exOrder;
    for(let set=1;set<=ex.sets;set++){
      addWork(ex, workout.id==='P'?'posture':'main', set, ex.sets, exNo, totalExercises);
      const lastSet=set===ex.sets;
      const lastExercise=idx===workout.exercises.length-1;
      if(!lastSet){
        plan.push({kind:'rest',phase:'set',id:`${ex.id}-rest-${set}`,name:'Отдых',durationSec:ex.restSec,nextExerciseId:ex.id,nextName:ex.name,nextSet:set+1,nextTotalSets:ex.sets,restLabel:ex.restLabel});
      } else if(!lastExercise){
        const t = workout.id==='P' ? ex.restSec : workout.transitionSec;
        const next=workout.exercises[idx+1];
        plan.push({kind:'rest',phase:'transition',id:`${ex.id}-transition`,name:'Отдых',durationSec:t,nextExerciseId:next.id,nextName:next.name,nextSet:1,nextTotalSets:(workout.id==='C'&&next.id==='c-bulgarian'&&opts.footballTomorrow)?2:next.sets,restLabel:workout.id==='P'?ex.restLabel:'1:30–2:00 между упражнениями'});
      }
    }
  });
  if(withMeta){
    const works=plan.filter(s=>s.kind==='work');
    plan.forEach((s,i)=>{
      s.planIndex=i;
      s.workIndex = s.kind==='work' ? works.findIndex(w=>w.id===s.id) : works.filter(w=>plan.indexOf(w)<i).length;
      s.totalWork=works.length;
    });
  }
  return plan;
}