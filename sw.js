// Online-first shell; external weather and ChatGPT requests are never cached.
const CACHE='personal-workbench-20261012-v1';
const SHELL=['./','./index.html','./style.css','./app.js','./vendor/lunar.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('personal-workbench-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||new Response('当前无法联网，请稍后重试。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}}))))});
