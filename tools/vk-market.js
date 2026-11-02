// Картинки 1000×1000 для товаров группы ВК → promo/vk/market/*.png и архив promo/vk/vk-market-6.zip
// ВК в карточке обрезает квадрат по бокам (~8% с каждой стороны) — всё важное держим в центральных ~70% ширины, по центру.
// Цены — как на странице «Цены» (tseny.html); поменяются там — поменяйте и здесь. Запуск: python3 -m http.server 8765, затем node tools/vk-market.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'promo', 'vk', 'market');
fs.mkdirSync(OUT, { recursive: true });
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Nunito:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap">';
const CSS = `*{box-sizing:border-box;margin:0}body{background:#07070d;color:#f2f0ff;font-family:Nunito,sans-serif;font-weight:800}
.s{position:relative;width:1000px;height:1000px;overflow:hidden;background:radial-gradient(800px 600px at 0% 100%,rgba(var(--a),.32),transparent 60%),radial-gradient(700px 500px at 100% 0%,rgba(var(--b),.24),transparent 60%),#07070d}
.k{position:absolute;left:0;right:0;top:70px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--c);font-size:24px}
.ico{position:absolute;left:0;right:0;top:140px;text-align:center;font-size:250px;filter:drop-shadow(0 0 50px var(--c))}
.t{position:absolute;left:160px;right:160px;top:500px;text-align:center;font-family:Unbounded,sans-serif;font-weight:800;text-transform:uppercase;font-size:56px;line-height:1.05;color:#fff;text-shadow:0 0 18px rgba(255,255,255,.3)}
.d{position:absolute;left:160px;right:160px;top:660px;text-align:center;font-size:30px;line-height:1.3;color:#d6d2ef}
.p{position:absolute;left:0;right:0;bottom:120px;text-align:center;font-family:Unbounded,sans-serif;font-weight:800;font-size:64px;color:var(--c);text-shadow:0 0 24px var(--c)}
.tag{position:absolute;left:0;right:0;bottom:62px;text-align:center}.tag span{padding:8px 22px;border-radius:999px;border:2px solid var(--c);color:var(--c);font-family:Unbounded,sans-serif;font-size:22px}
.u{display:none}`;
const P = [
  ['starter', '255,59,212', '178,107,255', '#ff8be6', '⭐', 'Стартовый набор', '30 у.е. · премиум-тема · редкий питомец · 3 подсказки', '149 ₽', 'разовое предложение'],
  ['coffee', '255,138,59', '255,59,107', '#ffb07a', '☕', 'Кофе разработчикам', 'Значок «Меценат» в профиле и 10 у.е. на счёт', '100 ₽', 'спасибо!'],
  ['ue-10', '45,226,230', '178,107,255', '#7df9ff', '💰', '10 у.е.', 'Игровая валюта. Первое пополнение +50%', '900 ₽', '−10%'],
  ['ue-25', '212,255,58', '45,226,230', '#d4ff3a', '💰', '25 у.е.', 'Игровая валюта. Первое пополнение +50%', '2 000 ₽', 'популярное'],
  ['ue-50', '178,107,255', '255,59,212', '#c99bff', '💰', '50 у.е.', 'Игровая валюта. Первое пополнение +50%', '3 500 ₽', '−30%'],
  ['ue-100', '45,226,138', '45,226,230', '#2de28a', '💎', '100 у.е.', 'Игровая валюта. Первое пополнение +50%', '6 000 ₽', 'выгодно −40%'],
];
(async () => {
  const b = await chromium.launch();
  for (const [id, a, bb, c, ico, t, d, p, tag] of P) {
    const pg = await b.newPage({ viewport: { width: 1000, height: 1000 } });
    await pg.setContent(`<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body><div class="s" style="--a:${a};--b:${bb};--c:${c}">
      <div class="k">Выжить до пятницы · цифровой товар</div><div class="u">цифровой товар</div><div class="ico">${ico}</div><div class="t">${t}</div><div class="d">${d}</div>
      <div class="p">${p}</div><div class="tag"><span>${tag}</span></div></div></body></html>`, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(OUT, `${id}.png`) }); await pg.close();
  }
  await b.close();
  execSync(`cd "${path.join(ROOT, 'promo', 'vk')}" && rm -f vk-market-6.zip && zip -qj vk-market-6.zip market/*.png`);
  console.log('ok');
})();
