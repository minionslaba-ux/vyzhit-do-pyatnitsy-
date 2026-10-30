// Офлайн-режим «Выжить до пятницы»: игра и данные кэшируются на телефоне.
// Свои файлы — «быстро из кэша, обновить в фоне»; Supabase, Telegram и прочие внешние запросы — только из сети.
const CACHE = 'vdp-v23';
const SHELL = ['./', 'index.html', 'css/style.css', 'js/i18n.js', 'js/config.js', 'js/cards.js', 'js/content.js', 'js/engine.js', 'js/board.js', 'js/audio.js', 'js/fx.js', 'js/faces.js', 'js/intro.js', 'js/game.js', 'js/ui-menu.js', 'js/app.js',
  'data/pool.json', 'data/pool2.json', 'data/quiz.json', 'data/chains.json', 'data/interview.json', 'data/cast.json', 'manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !fonts) return;  // Supabase, Telegram — в сеть как есть
  if (req.headers.has('range') || url.pathname.endsWith('.mp4')) return;  // видео — напрямую из сети: кэш не умеет частичные ответы
  // страница с ?ref=… или ?join=… — та же index.html
  const key = req.mode === 'navigate' ? new Request(new URL('index.html', location.href)) : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    const fresh = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(key, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || new Response('Нет сети', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
