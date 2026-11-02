// Картинки для группы ВКонтакте: обложка, аватар и 7 картинок к постам → promo/vk/*.png
// Запуск: python3 -m http.server 8765 (из корня репозитория), затем node tools/vk-promo.js
// Мира и её кабинет берутся прямо из игры (faceSvg, psySceneSvg), стили — из css/style.css.
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', 'promo', 'vk');
const BASE = 'http://localhost:8765/';

const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Nunito:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap">';
const CSS = `
*{box-sizing:border-box;margin:0}
html,body{background:#07070d;color:#f2f0ff;font-family:Nunito,sans-serif;font-weight:800;overflow:hidden}
.stage{position:relative;overflow:hidden;background:
  radial-gradient(900px 600px at 0% 100%,rgba(178,107,255,.32),transparent 60%),
  radial-gradient(800px 500px at 100% 0%,rgba(45,226,230,.22),transparent 60%),#07070d}
.t1,.t2{font-family:Unbounded,sans-serif;font-weight:800;line-height:.95;text-transform:uppercase;letter-spacing:.01em}
.t1{color:#fff;text-shadow:0 0 18px rgba(255,255,255,.35)}
.t2{color:#ff3bd4;text-shadow:0 0 24px rgba(255,59,212,.75),0 0 60px rgba(255,59,212,.45)}
.kick{font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7df9ff}
.sub{color:#d6d2ef;line-height:1.3}
.url{font-family:'JetBrains Mono',monospace;font-weight:700;color:#2de2e6;text-shadow:0 0 14px rgba(45,226,230,.7)}
.vbars{display:flex;gap:26px;align-items:flex-end}
.vbar{display:flex;flex-direction:column;align-items:center;gap:12px;font-weight:900}
.vbar .vtube{position:relative;width:62px;height:230px;border-radius:31px;border:3px solid var(--c);box-shadow:0 0 22px var(--c),inset 0 0 14px rgba(0,0,0,.6);background:rgba(255,255,255,.03)}
.vbar .vtube i{position:absolute;left:8px;right:8px;bottom:8px;border-radius:24px;background:var(--f);box-shadow:0 0 18px var(--f)}
.vbar span{color:var(--f);font-size:22px}
.card{border-radius:28px;border:2px solid rgba(45,226,230,.7);box-shadow:0 0 30px rgba(45,226,230,.35);background:rgba(18,18,29,.92);padding:30px 34px}
.chip{display:inline-block;padding:6px 18px;border-radius:999px;border:2px solid #ff3bd4;color:#ff8be6;font-family:Unbounded,sans-serif;font-size:18px;margin-bottom:16px}
.mira .face{width:100%;height:100%;display:block;border-radius:50%;overflow:hidden}
.mira .face svg{width:100%;height:100%}
`;
const bars = (vals = [38, 62, 85, 48], h = 230) => `<div class="vbars">${[['Кукуха', '#b26bff', '#c99bff'], ['Энергия', '#d4ff3a', '#d4ff3a'], ['Босс', '#ff3b6b', '#ff7a98'], ['Коллеги', '#2de2e6', '#7df9ff']]
  .map(([n, c, f], i) => `<div class="vbar" style="--c:${c};--f:${f}"><div class="vtube" style="height:${h}px"><i style="height:${vals[i]}%"></i></div><span>${n}</span></div>`).join('')}</div>`;

(async () => {
  const b = await chromium.launch();
  // 1) Достаём Миру из игры
  const g = await b.newPage();
  await g.goto(BASE + 'index.html?lang=ru'); await g.waitForTimeout(2500);
  const art = await g.evaluate(() => {
    const face = document.createElement('span'); face.className = 'face'; face.innerHTML = faceSvg(MIRA_FACE);
    face.querySelector('.expr').innerHTML = exprSvg('happy');
    return { face: face.outerHTML, scene: psySceneSvg() };
  });
  await g.close();

  const shot = async (name, w, h, html) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${BASE}css/style.css">${FONTS}<style>${CSS}</style></head>
      <body><div class="stage" style="width:${w}px;height:${h}px">${html}</div></body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    // кадр без анимаций
    await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    await p.screenshot({ path: path.join(OUT, name) }); await p.close();
    console.log('✓', name);
  };

  // Обложка 1920×768: всё важное — в центре (на телефоне ВК показывает середину), сверху не ближе 140px
  await shot('cover-1920x768.png', 1920, 768, `
    <div style="position:absolute;left:330px;top:140px;width:820px">
      <div class="kick" style="font-size:22px;margin-bottom:22px">офисная игра от выгорания</div>
      <div class="t1" style="font-size:84px">Выжить</div><div class="t2" style="font-size:84px;margin-top:8px;white-space:nowrap">до пятницы</div>
      <p class="sub" style="font-size:29px;margin-top:28px">25 решений с понедельника 9:00 до пятницы 18:00.<br>Держите Кукуху, Энергию, Босса и Коллег в балансе.</p>
      <div class="url" style="font-size:30px;margin-top:28px">survivefriday.com</div>
    </div>
    <div style="position:absolute;left:1210px;top:180px">${bars([38, 62, 85, 48], 330)}</div>`);

  // Аватар 800×800 (ВК обрежет в круг): значок игры с запасом от краёв
  await shot('avatar-800.png', 800, 800, `
    <img src="${BASE}icons/icon-512.png" style="position:absolute;inset:0;width:800px;height:800px">`);

  // Картинки к постам 1080×1080
  const post = (name, html) => shot(name, 1080, 1080, html + `<div class="url" style="position:absolute;left:70px;bottom:56px;font-size:30px">survivefriday.com</div>`);
  await post('post-1-welcome.png', `
    <div style="position:absolute;left:70px;top:90px">
      <div class="kick" style="font-size:24px;margin-bottom:24px">добро пожаловать в офис</div>
      <div class="t1" style="font-size:92px">Выжить</div><div class="t2" style="font-size:92px;margin-top:8px">до пятницы</div>
      <p class="sub" style="font-size:34px;margin-top:34px;width:560px">Пять минут в браузере или в&nbsp;Telegram. Без скачивания.</p></div>
    <div style="position:absolute;right:70px;bottom:150px">${bars([30, 70, 88, 52], 380)}</div>`);
  await post('post-2-how.png', `
    <div style="position:absolute;left:70px;top:80px;right:70px">
      <div class="kick" style="font-size:24px">как играть</div>
      <div class="t1" style="font-size:64px;margin-top:20px">Свайп влево<br>или вправо</div></div>
    <div class="card" style="position:absolute;left:70px;right:70px;top:330px">
      <span class="chip">БОСС</span>
      <p style="font-size:38px;line-height:1.25">Пятница, 17:55. «Там клиент просит ма-а-аленькую правку, это на 5 минут»</p>
      <div style="display:flex;justify-content:space-between;margin-top:30px;font-size:30px;color:#b9b4d6"><span>⬅ Завтра утром</span><span>Сделаю сейчас ➡</span></div></div>
    <p class="sub" style="position:absolute;left:70px;right:70px;top:760px;font-size:34px">Шкала на 0% или 100% — неделя окончена.<br>Дожили до 18:00 пятницы — победа.</p>`);
  await post('post-3-mira.png', `
    <div style="position:absolute;left:70px;right:70px;top:70px;height:420px;border-radius:32px;overflow:hidden;border:2px solid rgba(45,226,138,.5)" class="psy-scene">${art.scene}</div>
    <div style="position:absolute;left:70px;right:70px;top:540px">
      <div class="kick" style="font-size:24px;color:#2de28a">кабинет психолога</div>
      <div class="t1" style="font-size:66px;margin-top:18px">Мира</div>
      <p class="sub" style="font-size:33px;margin-top:22px">3000 бережных советов и 1500 тестов самопроверки. Приходит сама, когда в игре тяжело.</p>
      <p style="font-size:22px;color:#b9b4d6;margin-top:20px">🤖 Мира — персонаж игры, её советы не заменяют специалиста</p></div>`);
  await post('post-4-breaks.png', `
    <div style="position:absolute;left:70px;right:70px;top:80px">
      <div class="kick" style="font-size:24px">перерыв</div>
      <div class="t1" style="font-size:70px;margin-top:20px">51 разминка</div><div class="t2" style="font-size:58px;margin-top:10px">на 1–3 минуты</div>
      <p class="sub" style="font-size:34px;margin-top:30px">Поймать кофе, разобрать почту, минута дыхания. Каждый день — новая «Разминка дня».</p></div>
    <div style="position:absolute;left:70px;right:70px;top:640px;display:grid;grid-template-columns:repeat(6,1fr);gap:18px;font-size:70px;text-align:center">
      ${['☕', '📧', '🫁', '🧩', '🖨️', '🪴', '📎', '🎯', '🧠', '⏰', '🍩', '🎧'].map(e => `<div style="background:rgba(255,255,255,.05);border-radius:24px;padding:12px 0">${e}</div>`).join('')}</div>`);
  await post('post-5-mole.png', `
    <div style="position:absolute;left:70px;right:70px;top:80px">
      <div class="kick" style="font-size:24px">детектив в офисе</div>
      <div class="t1" style="font-size:76px;margin-top:20px">Кто крот?</div>
      <p class="sub" style="font-size:34px;margin-top:28px">Кто-то сливает секреты боссу. 4 улики за неделю, в пятницу — собрание. А в Telegram-группе — «Крот в офисе» на 5–12 человек.</p></div>
    <div style="position:absolute;left:70px;right:70px;top:600px;display:flex;justify-content:space-between">
      ${[['📊', 'Алла'], ['💻', 'Тимур'], ['📣', 'Жанна'], ['📦', 'Олег'], ['🎒', 'Вика']].map(([e, n]) => `<div style="width:170px;text-align:center;padding:22px 0;border-radius:24px;border:2px solid rgba(255,59,212,.5);background:rgba(255,59,212,.07)"><div style="font-size:66px">${e}</div><div style="font-size:28px;margin-top:8px">${n}</div></div>`).join('')}</div>
    <p style="position:absolute;left:70px;top:860px;font-size:22px;color:#b9b4d6">🤖 Все подозреваемые — персонажи игры</p>`);
  await post('post-6-daily.png', `
    <div style="position:absolute;left:70px;right:70px;top:80px">
      <div class="kick" style="font-size:24px">неделя дня</div>
      <div class="t1" style="font-size:66px;margin-top:20px">Одна неделя<br>на всех</div>
      <p class="sub" style="font-size:34px;margin-top:28px">Кто из коллег продержится дольше? Рейтинг дня, рейтинг отделов и вызов другу.</p></div>
    <div style="position:absolute;left:70px;top:610px;font-family:'JetBrains Mono',monospace;font-size:190px;font-weight:700;color:#2de2e6;text-shadow:0 0 30px rgba(45,226,230,.8)">17:55</div>`);
  await post('post-7-career.png', `
    <div style="position:absolute;left:70px;right:70px;top:70px">
      <div class="kick" style="font-size:24px">карьера</div>
      <div class="t1" style="font-size:62px;margin-top:18px">13 уровней</div><div class="t2" style="font-size:44px;margin-top:10px">от планктона до легенды</div></div>
    <div style="position:absolute;left:70px;right:70px;top:330px;display:grid;grid-template-columns:1fr 1fr;gap:12px 30px;font-size:29px">
      ${[['🐟', 'Офисный планктон'], ['📊', 'Средний менеджмент'], ['👑', 'Топ-менеджмент'], ['🚀', 'Свой стартап'], ['🏠', 'Удалённый офис'], ['🌍', 'Офис за границей'], ['🏛️', 'Большая корпорация'], ['🎨', 'Креативное агентство'], ['🤝', 'Слияние компаний'], ['🧯', 'Антикризисный менеджер'], ['🏢', 'Генеральный директор'], ['🏰', 'Свой холдинг'], ['🌟', 'Легенда офиса']]
        .map(([e, n], i) => `<div style="display:flex;gap:14px;align-items:center"><span style="font-family:'JetBrains Mono';color:#7df9ff;width:36px">${i + 1}</span><span>${e}</span><span>${n}</span></div>`).join('')}</div>`);
  await b.close();
})();
