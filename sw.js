// Офлайн-режим «Выжить до пятницы»: игра и данные кэшируются на телефоне.
// Свои файлы — «сначала сеть»: есть интернет — всегда свежая версия (браузер сам переспрашивает сервер по ETag, это дёшево);
// нет сети или сервер не ответил за 4 секунды — из кэша. Шрифты Google — из кэша, обновляются в фоне.
// Supabase, Telegram и прочие внешние запросы — только из сети.
const CACHE = 'vdp-v105';
const SHELL = ['./', 'index.html', 'en.html', 'css/style.css', 'js/i18n.js', 'js/config.js', 'js/cards.js', 'js/content.js', 'js/engine.js', 'js/board.js', 'js/audio.js', 'js/fx.js', 'js/faces.js', 'js/intro.js', 'js/game.js', 'js/ui-menu.js', 'js/npc.js', 'js/social.js', 'js/meta.js', 'js/hero3d.js', 'js/pets3d.js', 'js/hero.js', 'js/anketa.js', 'js/wish.js', 'js/timer.js', 'js/voice.js', 'js/cert.js', 'js/guest.js', 'js/pets.js', 'js/ads.js', 'js/push.js', 'js/streak.js', 'js/break.js', 'js/quotes.js', 'data/quotes.json', 'js/break/b1.js', 'js/break/b2.js', 'js/break/b3.js', 'js/break/b4.js', 'js/break/b5.js', 'js/shop.js', 'js/topup.js', 'js/login.js', 'js/app.js',
  'data/pool.json', 'data/pool2.json', 'data/pool3.json', 'data/events.json', 'data/quiz.json', 'data/chains.json', 'data/interview.json', 'data/cast.json', 'manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png', 'icons/badge-96.png'];

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

// Пуш-уведомления (js/push.js): показать и по нажатию открыть игру (уже открытую вкладку — переключить на неё)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { b: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.t || 'Выжить до пятницы', {
    body: d.b || '', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png',  // badge — белый силуэт: Android рисует его в строке состояния
    tag: 'vdp-remind', data: { url: d.url || '/' },
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    const w = ws.find(c => c.url.startsWith(self.location.origin));
    if (w) { w.navigate?.(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
