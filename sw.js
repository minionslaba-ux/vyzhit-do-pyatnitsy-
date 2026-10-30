// Офлайн-режим «Выжить до пятницы»: игра и данные кэшируются на телефоне.
// Свои файлы — «сначала сеть»: есть интернет — всегда свежая версия (браузер сам переспрашивает сервер по ETag, это дёшево);
// нет сети или сервер не ответил за 4 секунды — из кэша. Шрифты Google — из кэша, обновляются в фоне.
// Supabase, Telegram и прочие внешние запросы — только из сети.
const CACHE = 'vdp-v45';
const SHELL = ['./', 'index.html', 'en.html', 'css/style.css', 'js/i18n.js', 'js/config.js', 'js/cards.js', 'js/content.js', 'js/engine.js', 'js/board.js', 'js/audio.js', 'js/fx.js', 'js/faces.js', 'js/intro.js', 'js/game.js', 'js/ui-menu.js', 'js/npc.js', 'js/meta.js', 'js/login.js', 'js/app.js',
  'data/pool.json', 'data/pool2.json', 'data/pool3.json', 'data/events.json', 'data/quiz.json', 'data/chains.json', 'data/interview.json', 'data/cast.json', 'manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const offline = () => new Response('Нет сети · No connection', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !fonts) return;  // Supabase, Telegram — в сеть как есть
  if (req.headers.has('range') || url.pathname.endsWith('.mp4')) return;  // видео — напрямую из сети: кэш не умеет частичные ответы
  if (fonts) {  // шрифты не меняются: из кэша, в фоне обновить
    e.respondWith(caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req);
      const fresh = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(fresh); return hit; }
      return (await fresh) || offline();
    }));
    return;
  }
  // своя страница: ключ кэша — путь без ?ref=… / ?join=… («/» — это index.html)
  const key = req.mode === 'navigate' ? new URL(url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname, location.href).href : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const net = fetch(req).then(res => { if (res.ok) cache.put(key, res.clone()); return res; });
    const timeout = new Promise(r => setTimeout(r, 4000, null));
    try {
      const res = await Promise.race([net, timeout]);
      if (res) return res;
    } catch {}
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(offline);
  }));
});
