// 30 картинок 1080×1080 для автопостинга в ВК → promo/vk/pack/*.png и архив promo/vk/vk-posts-30.zip
//   mira-01…10  — к советам Миры, brk-<номер разминки> (13) — к «Разминке дня», ask-01…07 — к «Что бы вы выбрали?»
// Запуск: python3 -m http.server 8765 (в корне репозитория), затем node tools/vk-pack.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'promo', 'vk', 'pack');
const BASE = 'http://localhost:8765/';
fs.mkdirSync(OUT, { recursive: true });

const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Nunito:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap">';
const CSS = `*{box-sizing:border-box;margin:0}html,body{background:#07070d;color:#f2f0ff;font-family:Nunito,sans-serif;font-weight:800;overflow:hidden}
.stage{position:relative;width:1080px;height:1080px;overflow:hidden;background:radial-gradient(900px 600px at 0% 100%,rgba(var(--a),.30),transparent 60%),radial-gradient(800px 500px at 100% 0%,rgba(var(--b),.22),transparent 60%),#07070d}
.t1{font-family:Unbounded,sans-serif;font-weight:800;line-height:1;text-transform:uppercase;color:#fff;text-shadow:0 0 18px rgba(255,255,255,.3)}
.t2{font-family:Unbounded,sans-serif;font-weight:800;line-height:1.05;text-transform:uppercase;color:var(--c);text-shadow:0 0 24px var(--c)}
.kick{font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--c);font-size:26px}
.sub{color:#d6d2ef;line-height:1.32;font-size:38px}
.url{position:absolute;left:70px;bottom:56px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:30px;color:#2de2e6;text-shadow:0 0 14px rgba(45,226,230,.7)}
.note{position:absolute;right:70px;bottom:60px;font-size:22px;color:#b9b4d6}
.big{position:absolute;right:70px;top:70px;font-size:150px;filter:drop-shadow(0 0 30px rgba(var(--a),.6))}
.card{position:absolute;left:70px;right:70px;border-radius:30px;border:2px solid var(--c);box-shadow:0 0 34px rgba(var(--b),.35);background:rgba(18,18,29,.92);padding:36px 40px}
.chip{display:inline-block;padding:8px 22px;border-radius:999px;border:2px solid var(--c);color:var(--c);font-family:Unbounded,sans-serif;font-size:22px}
.face{display:block;width:100%;height:100%;border-radius:50%;overflow:hidden}.face svg{width:100%;height:100%}`;
const PAL = { green: ['45,226,138', '45,226,230', '#2de28a'], pink: ['255,59,212', '178,107,255', '#ff8be6'], cyan: ['45,226,230', '178,107,255', '#7df9ff'], lime: ['212,255,58', '45,226,230', '#d4ff3a'], violet: ['178,107,255', '255,59,212', '#c99bff'], orange: ['255,138,59', '255,59,107', '#ffb07a'] };

const MIRA = [
  ['Совет Миры', 'Маленький шаг сегодня лучше большого плана на понедельник', 'happy', 'green'],
  ['Минута для себя', 'Встаньте, потянитесь, выпейте воды. Почта подождёт', 'joy', 'cyan'],
  ['Перерыв — тоже работа', 'Над тем, чтобы дожить до вечера с ясной головой', 'happy', 'lime'],
  ['Сон важнее дедлайна', 'Дедлайн сдвинется, а невыспавшийся мозг — нет', 'neutral', 'violet'],
  ['«Нет» — полное предложение', 'Границы помогают работать дольше и спокойнее', 'happy', 'pink'],
  ['Выдох', 'Вдох на 4 счёта, выдох на 6. Три раза — и чуть легче', 'joy', 'green'],
  ['Самопроверка', 'Три вопроса — и понятно, где сейчас тяжелее всего', 'neutral', 'cyan'],
  ['Вы справляетесь', 'Даже если неделя пошла не по плану', 'joy', 'orange'],
  ['Пятница близко', 'Запланируйте на выходные одно приятное дело', 'happy', 'lime'],
  ['Понедельник бережно', 'Начните с одной понятной задачи, без подвигов с утра', 'happy', 'violet'],
];
// Совпадает с BRK_QUICK в supabase/functions/tg-daily/index.ts
const BRK = [[5, '🗂️', 'Пятнашки «Разобрать стол»', 'Соберите стол по порядку'], [6, '🍪', 'Последняя печенька', 'Кто возьмёт последнюю?'], [22, '☕', 'Поймай кофе', 'Ловите падающие чашки подносом'],
  [24, '📧', 'Отбей спам', 'Письма летят — отбивайте лишние'], [28, '🗑️', 'Баскетбол в мусорку', 'Бросок бумажкой через весь офис'], [30, '⏱️', 'Ровно в 18:00', 'Остановите таймер точно вовремя'],
  [34, '🔀', 'Анаграммы профессий', 'Соберите профессию из букв'], [39, '🪪', 'Мемори «Визитки»', 'Найдите пары визиток'], [41, '🖥️', 'Запомни стол', 'Что изменилось на столе?'],
  [43, '🎨', 'Цветная путаница', 'Цвет или слово — не перепутайте'], [44, '🧮', 'Бухгалтерия в уме', 'Считайте быстрее калькулятора'], [45, '🙃', 'Кто лишний', 'Найдите лишнего в ряду'], [49, '🫧', 'Пупырка', 'Лопайте пупырку. Просто лопайте']];
const ASK = [
  ['БОСС', '👔', 'Пятница, 17:55. «Есть минутка?»', 'pink'], ['КОЛЛЕГА', '🙋', '«Можешь посмотреть? Это быстро»', 'cyan'], ['КЛИЕНТ', '📞', '«Маленькая правка» на весь проект', 'orange'],
  ['HR', '🤝', 'Тимбилдинг в субботу. Явка «по желанию»', 'violet'], ['БУХГАЛТЕРИЯ', '🧾', 'Чек не тот. Опять', 'lime'], ['СИСАДМИН', '🔌', '«Перезагрузите и попробуйте снова»', 'green'], ['ЧАТ ОТДЕЛА', '💬', '214 непрочитанных и все срочные', 'pink']];

(async () => {
  const b = await chromium.launch();
  const g = await b.newPage(); await g.goto(BASE + 'index.html?lang=ru'); await g.waitForTimeout(2500);
  const art = await g.evaluate(moods => ({ scene: psySceneSvg(), faces: Object.fromEntries(moods.map(m => { const s = document.createElement('span'); s.className = 'face'; s.innerHTML = faceSvg(MIRA_FACE); s.querySelector('.expr').innerHTML = exprSvg(m); return [m, s.outerHTML]; })) }), ['happy', 'joy', 'neutral']);
  await g.close();
  const shot = async (name, pal, html) => {
    const [a, bb, c] = PAL[pal];
    const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${BASE}css/style.css">${FONTS}<style>${CSS}</style></head><body><div class="stage" style="--a:${a};--b:${bb};--c:${c}">${html}<div class="url">survivefriday.com</div></div></body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready); await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}' }); await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(OUT, name) }); await p.close();
  };
  for (const [i, [t, s, mood, pal]] of MIRA.entries()) {
    const n = String(i + 1).padStart(2, '0');
    const top = i % 2 === 0
      ? `<div class="psy-scene" style="position:absolute;left:70px;right:70px;top:70px;height:400px;border-radius:32px;overflow:hidden;border:2px solid rgba(45,226,138,.5)">${art.scene}</div>`
      : `<div style="position:absolute;left:70px;top:80px;width:300px;height:300px;box-shadow:0 0 0 6px rgba(45,226,138,.5),0 0 60px rgba(45,226,138,.35);border-radius:50%">${art.faces[mood]}</div>`;
    const y = i % 2 === 0 ? 530 : 440;
    await shot(`mira-${n}.png`, pal, `${top}<div style="position:absolute;left:70px;right:70px;top:${y}px"><div class="kick">🛋️ Мира, психолог офиса</div>
      <div class="t2" style="font-size:${t.length > 18 ? 58 : 70}px;margin-top:22px">${t}</div><p class="sub" style="margin-top:26px">${s}</p></div>
      <div class="note">🤖 персонаж игры</div>`);
  }
  const pals = Object.keys(PAL);
  for (const [i, [id, ico, name, s]] of BRK.entries())
    await shot(`brk-${String(id).padStart(2, '0')}.png`, pals[i % pals.length], `<div style="position:absolute;left:70px;right:70px;top:90px"><div class="kick">☕ Разминка дня</div>
      <div class="t1" style="font-size:${name.length > 20 ? 56 : 68}px;margin-top:26px;line-height:1.08">${name}</div><p class="sub" style="margin-top:30px">${s}</p></div>
      <div style="position:absolute;left:0;right:0;top:560px;text-align:center;font-size:260px;filter:drop-shadow(0 0 40px var(--c))">${ico}</div>
      <div class="note">1–3 минуты · без регистрации</div>`);
  for (const [i, [who, ico, text, pal]] of ASK.entries())
    await shot(`ask-${String(i + 1).padStart(2, '0')}.png`, pal, `<div style="position:absolute;left:70px;right:70px;top:80px"><div class="kick">🤔 Что бы вы выбрали?</div>
      <div class="t1" style="font-size:64px;margin-top:22px;line-height:1.05">Влево<br>или вправо?</div></div><div class="big">${ico}</div>
      <div class="card" style="top:420px"><span class="chip">${who}</span><p style="font-size:46px;line-height:1.25;margin-top:26px">${text}</p>
      <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:34px;color:#b9b4d6"><span>⬅</span><span>Пишите в комментариях</span><span>➡</span></div></div>`);
  await b.close();
  execSync(`cd "${path.join(ROOT, 'promo', 'vk')}" && rm -f vk-posts-30.zip && zip -qj vk-posts-30.zip pack/*.png`);
  console.log(fs.readdirSync(OUT).length, 'картинок, архив promo/vk/vk-posts-30.zip');
})();
