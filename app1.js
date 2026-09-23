const $app = document.getElementById('app');

const MEDIA = {
  jumpRope: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Jumpingrope.gif',
    source: 'Wensceslao · Wikimedia Commons · CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jumpingrope.gif',
    videoUrl: 'https://www.youtube.com/results?search_query=jump+rope+basic+technique'
  },
  shoulderRolls: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Diagram_showing_how_to_do_shoulder_rolls_after_breast_reconstruction_surgery_CRUK_151.svg',
    source: 'Cancer Research UK · Wikimedia Commons · CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Diagram_showing_how_to_do_shoulder_rolls_after_breast_reconstruction_surgery_CRUK_151.svg',
    videoUrl: 'https://www.youtube.com/results?search_query=shoulder+rolls+warm+up+exercise'
  },
  bodySquat: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Squats.svg',
    source: 'Everkinetic · Wikimedia Commons · CC BY-SA',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Squats.svg',
    videoUrl: 'https://www.youtube.com/results?search_query=bodyweight+squat+proper+form'
  },
  gluteBridge: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Glute-bridge.png',
    source: 'Marianne Gilbak · Wikimedia Commons · CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Glute-bridge.png',
    videoUrl: 'https://www.youtube.com/results?search_query=glute+bridge+proper+form'
  },
  hipHinge: {
    type: 'image',
    src: 'https://prokinetixrehab.com/wp-content/uploads/2021/07/22bcbf_19b3ac314417470e83326d36415f0b58_mv2.jpg',
    source: 'ProKinetix Rehab',
    sourceUrl: 'https://prokinetixrehab.com/post/how-to-properly-hip-hinge/',
    videoUrl: 'https://www.youtube.com/results?search_query=hip+hinge+proper+form+drill'
  },
  bandPullApart: {
    type: 'image',
    src: 'https://cdn.shopify.com/s/files/1/0688/3062/6045/files/e46dca3c5bf641ab7c4b4a525b9fac71_1775121326_mu3ntnob.png?v=1775121372',
    source: 'JLL Fitness',
    sourceUrl: 'https://jllfitness.co.uk/blogs/blog/10-minute-resistance-band-home-exercises-you-can-do-today',
    videoUrl: 'https://www.youtube.com/results?search_query=band+pull+apart+proper+form'
  },
  gobletSquat: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/U.S._Army_Capt._Nathaniel_Sebren%2C_the_commander_of_the_189th_Support_Battalion%27s_249th_Quartermaster_Company%2C_squats_with_a_kettlebell_during_a_CrossFit_workout_at_Fort_Bragg%2C_N.C.%2C_April_11%2C_2013_130411-A-QD996-004.jpg',
    source: 'U.S. Army / Sgt. Amanda Tucker · Wikimedia Commons · public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:U.S._Army_Capt._Nathaniel_Sebren,_the_commander_of_the_189th_Support_Battalion%27s_249th_Quartermaster_Company,_squats_with_a_kettlebell_during_a_CrossFit_workout_at_Fort_Bragg,_N.C.,_April_11,_2013_130411-A-QD996-004.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=JxhPHvR88rw'
  },
  pullUp: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/TEB_Pull-ups.png',
    source: 'DiMer16 · Wikimedia Commons · CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:TEB_Pull-ups.png',
    videoUrl: 'https://www.youtube.com/watch?v=9yVGh3XbJ34'
  },
  pushUp: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Push-ups-1.png',
    source: 'Everkinetic · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Push-ups-1.png',
    videoUrl: 'https://www.youtube.com/results?search_query=push+up+proper+form+tutorial'
  },
  row: {
    type: 'image',
    src: 'https://daman.co.id/_next/image?q=75&url=https%3A%2F%2Fbackend.daman.co.id%2Fwp-content%2Fuploads%2F2023%2F02%2FDominicDiSaia-56a8f3803df78cf772a22c14.jpg&w=1200',
    source: 'DA MAN Magazine',
    sourceUrl: 'https://daman.co.id/how-to-do-a-single-arm-dumbbell-row-correctly-and-safely',
    videoUrl: 'https://www.youtube.com/results?search_query=single+arm+dumbbell+row+proper+form'
  },
  deadBug: {
    type: 'image',
    src: 'https://static.wixstatic.com/media/ed5104_ee317bad126a423e90381eb24b6fec06~mv2.png/v1/fill/w_940,h_788,al_c,q_90,enc_avif,quality_auto/ed5104_ee317bad126a423e90381eb24b6fec06~mv2.png',
    source: 'Stronger Performance Physical Therapy',
    sourceUrl: 'https://www.strongerperformancept.com/post/the-dead-bug-exercise-how-to-variations',
    videoUrl: 'https://www.youtube.com/watch?v=ocCurcR5leY'
  },
  reverseLunge: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Rear-lunges-2-1-611x1024.png',
    source: 'Everkinetic · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rear-lunges-2-1-611x1024.png',
    videoUrl: 'https://www.youtube.com/results?search_query=reverse+lunge+proper+form+tutorial'
  },
  rdl: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Romanian_dead_lift_2.svg',
    source: 'Everkinetic · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Romanian_dead_lift_2.svg',
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+romanian+deadlift+proper+form'
  },
  floorPress: {
    type: 'image',
    src: 'https://eunicakes.files.wordpress.com/2015/04/untitled.jpg',
    source: 'Exercise demonstration image',
    sourceUrl: 'https://www.zsddmklasterec.cz/?d=60852388021450',
    videoUrl: 'https://www.youtube.com/watch?v=qHCI9rK7HqM'
  },
  sidePlank: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Side_Plank.jpg',
    source: 'Jaykayfit · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Side_Plank.jpg',
    videoUrl: 'https://www.youtube.com/results?search_query=side+plank+proper+form'
  },
  bulgarian: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/SETAF-AF_conducts_sergeant%E2%80%99s_time_circuit_training_%289082703%29.jpg',
    source: 'U.S. Army / Sgt. Kylejian Francia · public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:SETAF-AF_conducts_sergeant%E2%80%99s_time_circuit_training_%289082703%29.jpg',
    videoUrl: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+proper+form+tutorial'
  },
  plank: {
    type: 'image',
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Plank_exercise.svg',
    source: 'Pk0001 · Wikimedia Commons · CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Plank_exercise.svg',
    videoUrl: 'https://www.youtube.com/results?search_query=forearm+plank+proper+form'
  },
  wallSlide: {
    type: 'image',
    src: 'https://images.squarespace-cdn.com/content/v1/5639781ee4b07eafb4ac4e02/1560541527414-3KS5X34LUY15L99T1R1Z/wall%2Bslide.jpg',
    source: 'New England LMSC',
    sourceUrl: 'https://www.nelmsc.org/news-blog/2019/6/17/swim-strong-phase-2',
    videoUrl: 'https://www.youtube.com/results?search_query=wall+slide+posture+exercise+proper+form'
  },
  chinTuck: {
    type: 'image',
    src: 'https://b2284556.smushcdn.com/2284556/wp-content/uploads/2024/11/chin-tuck-exercise-for-neck-pain-illustration_02.jpg?lossy=2&strip=1&webp=1',
    source: 'Dr. Alex Jimenez',
    sourceUrl: 'https://dralexjimenez.com/cervical-retraction-an-effective-exercise-for-neck-pain-relief/amp/',
    videoUrl: 'https://www.youtube.com/results?search_query=chin+tuck+exercise+proper+form'
  }
};