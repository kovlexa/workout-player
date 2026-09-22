const CYCLES = [
  {
    id:'cycle1',
    title:'Цикл 1 — Вход в форму',
    subtitle:'4 недели · похудение, сила, общая форма и осанка',
    status:'active',
    workoutIds:['A','B','C','P']
  }
];

const WARMUP = [
  { id:'wu-rope', name:'Лёгкая скакалка', target:'2 минуты', type:'timed', durationSec:120, sets:1, media:'jumpRope', cue:'Спокойный темп, низкие мягкие прыжки. Если ноги забиты после футбола — можно выбрать ходьбу на месте перед стартом.' },
  { id:'wu-shoulders', name:'Круговые движения плечами', target:'10 назад + 10 вперёд', type:'timed', durationSec:60, sets:1, media:'shoulderRolls', cue:'Медленно и свободно. Шея расслаблена, без растяжения через дискомфорт.' },
  { id:'wu-squat', name:'Приседания без веса', target:'10 повторений', type:'timed', durationSec:60, sets:1, media:'bodySquat', cue:'Спокойный темп. Проверь ощущения в коленях, тазу и пояснице.' },
  { id:'wu-bridge', name:'Ягодичный мост без веса', target:'10 повторений', type:'timed', durationSec:60, sets:1, media:'gluteBridge', cue:'Поднимай таз ягодицами, не добирай высоту прогибом поясницы.' },
  { id:'wu-hinge', name:'Наклоны с отведением таза назад', target:'8 повторений', type:'timed', durationSec:60, sets:1, media:'hipHinge', cue:'Таз назад, колени слегка согнуты. Особенно следи за ощущениями справа в пояснице/ягодице.' },
  { id:'wu-band', name:'Разведение рук с резинкой', target:'10 повторений', type:'timed', durationSec:60, sets:1, media:'bandPullApart', cue:'Слабая резинка. Плечи подальше от ушей, движение подконтрольное.' }
];

const WORKOUTS = {
  A: {
    id:'A', cycleId:'cycle1', title:'Тренировка A', subtitle:'Базовая сила', transitionSec:90, equipment:['гантель','турник','резинка','скакалка'], warmup:true,
    exercises:[
      {id:'a-goblet',name:'Присед с гантелью у груди',sets:3,target:'8–12 повторений',type:'reps',restSec:90,restLabel:'90 сек',media:'gobletSquat',cue:'Гантель у груди. Колени идут по направлению носков, вся стопа на полу.'},
      {id:'a-pull',name:'Подтягивания',sets:3,target:'3–6 повторений',type:'reps',restSec:120,restLabel:'2 мин',media:'pullUp',cue:'Без раскачки. Плечи не зажимай к ушам, голову не запрокидывай.'},
      {id:'a-push',name:'Отжимания',sets:3,target:'8–15 повторений',type:'reps',restSec:90,restLabel:'90 сек',media:'pushUp',cue:'Корпус одной линией. Пресс и ягодицы напряжены.'},
      {id:'a-bridge',name:'Ягодичный мост',sets:3,target:'10–15 повторений',type:'reps',restSec:90,restLabel:'60–90 сек',media:'gluteBridge',cue:'Поднимай таз ягодицами, а не прогибом поясницы.'},
      {id:'a-row',name:'Тяга гантели одной рукой',sets:3,target:'8–12 на каждую руку',type:'reps',restSec:90,restLabel:'90 сек',media:'row',cue:'Свободной рукой опирайся на шведскую стенку. Локоть тяни назад к тазу.'},
      {id:'a-deadbug',name:'Мёртвый жук',sets:3,target:'6–10 на сторону',type:'reps',restSec:60,restLabel:'45–60 сек',media:'deadBug',cue:'Противоположные рука и нога опускаются медленно. Поясница остаётся под контролем.'}
    ]
  },
  B: {
    id:'B', cycleId:'cycle1', title:'Тренировка B', subtitle:'Задняя цепь + верх', transitionSec:90, equipment:['гантели','турник','резинка','скакалка'], warmup:true,
    exercises:[
      {id:'b-lunge',name:'Выпады назад',sets:3,target:'8 на каждую ногу',type:'reps',restSec:90,restLabel:'90 сек',media:'reverseLunge',cue:'Шаг назад → колено вниз → возвращайся передней ногой. Начинай без веса.'},
      {id:'b-rdl',name:'Румынская тяга с гантелями',sets:2,target:'8–10 повторений',type:'reps',restSec:120,restLabel:'90–120 сек',media:'rdl',cue:'Таз назад, а не вниз. Если неприятно нагружается правая поясница/ягодица — прекращай.'},
      {id:'b-pull',name:'Подтягивания',sets:3,target:'3–6 повторений',type:'reps',restSec:120,restLabel:'2 мин',media:'pullUp',cue:'Без раскачки, контролируй опускание.'},
      {id:'b-floorpress',name:'Жим гантелей лёжа на полу',sets:3,target:'8–12 повторений',type:'reps',restSec:90,restLabel:'90 сек',media:'floorPress',cue:'Опускай до мягкого касания пола, не отбивай локти.'},
      {id:'b-band',name:'Разведение рук с резинкой',sets:3,target:'12–20 повторений',type:'reps',restSec:60,restLabel:'45–60 сек',media:'bandPullApart',cue:'Своди лопатки, не поднимай плечи к ушам и не прогибай поясницу.'},
      {id:'b-sideplank',name:'Боковая планка',sets:3,target:'30 сек на сторону',type:'timedSides',durationSec:60,sideSwitchAt:30,restSec:60,restLabel:'45–60 сек',media:'sidePlank',cue:'Локоть под плечом. Через 30 секунд прозвучит сигнал — смени сторону.'}
    ]
  },
  C: {
    id:'C', cycleId:'cycle1', title:'Тренировка C', subtitle:'Облегчённая тренировка всего тела', transitionSec:90, equipment:['гантели','турник','скакалка','устойчивая опора'], warmup:true,
    exercises:[
      {id:'c-bulgarian',name:'Болгарские выпады',sets:3,target:'8 на каждую ногу',type:'reps',restSec:90,restLabel:'90 сек',media:'bulgarian',cue:'Первые тренировки без гантелей. Если завтра футбол — в приложении можно включить режим 2×8.'},
      {id:'c-pull',name:'Подтягивания',sets:3,target:'3–5 повторений',type:'reps',restSec:120,restLabel:'2 мин',media:'pullUp',cue:'Чистые повторы, без отказа.'},
      {id:'c-push',name:'Отжимания',sets:3,target:'10–15 повторений',type:'reps',restSec:90,restLabel:'90 сек',media:'pushUp',cue:'Корпус одной линией, шея нейтрально.'},
      {id:'c-row',name:'Тяга гантели одной рукой',sets:3,target:'10–12 на каждую руку',type:'reps',restSec:90,restLabel:'90 сек',media:'row',cue:'Опора свободной рукой, корпус не вращается.'},
      {id:'c-bridge',name:'Ягодичный мост',sets:3,target:'12–15 повторений',type:'reps',restSec:90,restLabel:'60–90 сек',media:'gluteBridge',cue:'Вверху не переразгибай поясницу.'},
      {id:'c-deadbug',name:'Мёртвый жук',sets:2,target:'8 на сторону',type:'reps',restSec:60,restLabel:'45–60 сек',media:'deadBug',cue:'Медленно, поясница под контролем.'},
      {id:'c-plank',name:'Планка',sets:2,target:'45 секунд',type:'timed',durationSec:45,restSec:60,restLabel:'60 сек',media:'plank',cue:'Локти под плечами, тело в одну линию, шея нейтрально.'}
    ]
  },
  P: {
    id:'P', cycleId:'cycle1', title:'Осанка', subtitle:'8–10 минут · 4–6 раз в неделю', transitionSec:30, equipment:['слабая резинка','стена','коврик'], warmup:false,
    exercises:[
      {id:'p-wall',name:'Скольжения руками по стене',sets:2,target:'8–10 повторений',type:'reps',restSec:45,restLabel:'30–45 сек',media:'wallSlide',cue:'Плавное движение вверх-вниз. Не пытайся силой прижать всё тело к стене.'},
      {id:'p-band',name:'Разведение рук с резинкой',sets:2,target:'15 повторений',type:'reps',restSec:45,restLabel:'30–45 сек',media:'bandPullApart',cue:'Слабая резинка, контролируй лопатки.'},
      {id:'p-deadbug',name:'Мёртвый жук',sets:2,target:'6 на сторону',type:'reps',restSec:45,restLabel:'30–45 сек',media:'deadBug',cue:'Медленно, без отрыва контроля поясницы.'},
      {id:'p-chin',name:'Втягивание подбородка',sets:2,target:'8 повторений',type:'reps',restSec:30,restLabel:'30 сек',media:'chinTuck',cue:'Голова движется назад, а не вниз. Только комфортная амплитуда, без продавливания боли.'}
    ]
  }
};