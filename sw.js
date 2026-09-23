const VERSION='workout-pwa-v2.1.1';
const APP_CACHE=`${VERSION}-app`;
const MEDIA_CACHE=`${VERSION}-media`;
const APP_ASSETS=["./","./index.html","./styles.css","./manifest.webmanifest","./icon.svg","./app1.js","./programs.js","./app3.js","./app4.js","./dashboard.js","./app5.js","./app6.js","./app7a.js","./app7b.js","./app8.js"];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(APP_CACHE);
    await cache.addAll(APP_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>!k.startsWith(VERSION)).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);

  if(url.origin===self.location.origin){
    event.respondWith((async()=>{
      const cache=await caches.open(APP_CACHE);
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        if(fresh && fresh.ok) cache.put(req,fresh.clone());
        return fresh;
      }catch{
        const cached=await cache.match(req);
        if(cached) return cached;
        if(req.mode==='navigate') return cache.match('./index.html');
        throw new Error('Offline resource unavailable');
      }
    })());
    return;
  }

  if(req.destination==='image'||req.destination==='video'){
    event.respondWith((async()=>{
      const cache=await caches.open(MEDIA_CACHE);
      const cached=await cache.match(req.url);
      if(cached) return cached;
      try{
        const fresh=await fetch(req);
        await cache.put(req.url,fresh.clone());
        return fresh;
      }catch{
        return new Response('',{status:504,statusText:'Offline media unavailable'});
      }
    })());
  }
});