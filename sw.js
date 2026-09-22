const VERSION='workout-pwa-v1.0.4';
const APP_CACHE=`${VERSION}-app`;
const MEDIA_CACHE=`${VERSION}-media`;
const APP_ASSETS=["./", "./index.html", "./styles.css", "./manifest.webmanifest", "./icon.svg", "./app1.js", "./app2.js", "./app3.js", "./app4.js", "./app5.js", "./app6.js", "./app7.js"];

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

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);

  if(url.origin===self.location.origin){
    event.respondWith((async()=>{
      const cached=await caches.match(req);
      if(cached) return cached;
      try{
        const fresh=await fetch(req);
        const cache=await caches.open(APP_CACHE);
        cache.put(req,fresh.clone());
        return fresh;
      }catch{
        return caches.match('./index.html');
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