// Обучение «Как играть»: 6 слайдов — цель, шкалы, как отвечать, помощники, деньги, карьера и люди.
// Показывается при первом входе, потом — из меню («Профиль» → «Как играть») и с экрана приветствия.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → fx → faces → intro → game → ui-menu → app.

const INTRO = [
  { title: 'Доживите до пятницы', art: () => `<div class="in-clock"><span>09:00</span><i>→</i><span class="hot">18:00</span></div>
      <div class="in-segs">${'<i></i>'.repeat(15)}</div>`,
    text: 'Вы — офисный сотрудник. Неделя — это 15 решений: утро, день и вечер с понедельника по пятницу. Продержитесь до пятницы, 18:00. Карьера — целый год из 52 недель.' },
  { title: 'Держите четыре шкалы', art: () => `<div class="in-tubes">${[['psyche', 'Кукуха', 50, ''], ['energy', 'Энергия', 15, 'на грани'], ['boss', 'Босс', 88, 'перегрев'], ['colleagues', 'Коллеги', 60, '']]
      .map(([k, n, v, z]) => `<div class="tube-wrap${v >= 80 ? ' hot danger' : v <= 20 ? ' low danger' : ''}" data-k="${k}"><div class="tube"><div class="fill" style="--v:${v}"></div></div><span class="lbl">${n}</span><span class="pct">${v}%</span><span class="zone">${z}</span></div>`).join('')}</div>`,
    text: '<b>Кукуха</b> — нервы, <b>Энергия</b> — силы, <b>Босс</b> — отношение начальства, <b>Коллеги</b> — команда. Ноль — конец недели. Но и <b>100% — тоже конец</b>: перегрев. Лучше всего — между 20% и 80%.' },
  { title: 'Свайпайте решения', art: () => `<div class="in-card"><div class="in-arrows"><span class="d">▼</span><span class="u">▲▲</span></div>
      <div class="in-card-box"><b>БОСС</b><span>Пятница, 17:55. «Есть минутка?»</span></div>
      <div class="in-ans"><span>← Я уже дома</span><span>Сделаю →</span></div><i class="in-hand">👆</i></div>`,
    text: 'Тяните карточку влево или вправо — или жмите кнопки и стрелки ← →. Пока тянете, над шкалами загораются <b>▲</b> и <b>▼</b>: что вырастет и что упадёт. Две стрелки — сильный сдвиг.' },
  { title: 'Помощники', art: () => `<div class="in-chips"><span class="item">Кофе</span><span class="item">Наушники</span><span class="item">Справка от врача</span><span class="item">Печеньки</span></div>
      <div class="in-shield">◆</div>`,
    text: 'Предмет в сумке сам отменит <b>один удар −10 и сильнее</b> по своей шкале: значок ◆ над шкалой — удар погасится. Шкала дошла до края? Будет <b>второй шанс</b>: вопрос на эрудицию за 20 секунд.' },
  { title: 'Деньги и магазин', art: () => `<div class="in-money"><span class="fly-coin in-coin">+3</span><span class="bank-chip">12 у.е. · магазин</span></div>
      <ul class="in-shop"><li><b>Предмет</b><span>6–9 у.е.</span></li><li><b>Мощь: шкала −20 от края</b><span>12 у.е.</span></li><li><b>💡 Подсказка: какой ответ безопаснее</b><span>3 у.е.</span></li><li><b>Кредит +20 у.е.</b><span>вернуть 24</span></li></ul>`,
    text: 'За каждый рабочий день — <b>зарплата</b> в у.е. В конце недели списываются жильё и еда — два дневных оклада. Тратьте деньги кнопкой <b>«у.е. · магазин»</b> под часами во время недели. <b>💡 Подсказка</b> за 3 у.е. покажет, какой ответ лучше держит баланс. Ещё есть <b>отпуск</b>: 28 дней в году, неделя отдыха с оплатой.' },
  { title: 'Карьера и люди', art: () => `<div class="in-faces">${Object.values(CAST).slice(0, 4).map(p => portraitHtml(p.name)).join('')}</div>`,
    text: 'Уволили? Ищите работу: собеседование из 7 вопросов. <b>Коллеги помнят</b> ваши решения: друг выручит, обиженный отомстит. <b>Неделя дня</b> — одна на всех: сравните результат и бросьте вызов коллеге.' },
];

function showIntro(done) {
  const el = document.getElementById('intro');
  let i = 0;
  const finish = () => {
    el.hidden = true; document.removeEventListener('keydown', key);
    prefs.introSeen = 1; store.set(KEY.prefs, prefs);
    if (done) done();
  };
  const render = () => {
    const s = INTRO[i], last = i === INTRO.length - 1;
    el.innerHTML = `<div class="intro-box glass" role="dialog" aria-modal="true" aria-labelledby="inTitle">
      <button class="intro-skip" type="button" id="inSkip">${last ? '' : 'Пропустить'}</button>
      <div class="intro-art" aria-hidden="true">${s.art()}</div>
      <span class="intro-step">${i + 1} из ${INTRO.length}</span>
      <h2 id="inTitle">${s.title}</h2>
      <p aria-live="polite">${s.text}</p>
      <div class="intro-dots" aria-hidden="true">${INTRO.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="intro-nav"><button class="btn-ghost" type="button" id="inBack" ${i ? '' : 'disabled'}>Назад</button>
        <button class="btn-main" type="button" id="inNext">${last ? 'Начать' : 'Далее'}</button></div></div>`;
    $('inBack').onclick = () => go(-1);
    $('inNext').onclick = () => last ? finish() : go(1);
    $('inSkip').onclick = finish;
    $('inNext').focus({ preventScroll: true });
  };
  const go = d => { const j = Math.max(0, Math.min(INTRO.length - 1, i + d)); if (j !== i) { i = j; render(); } };
  const key = e => {
    if (el.hidden) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); i === INTRO.length - 1 ? finish() : go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'Escape') finish();
  };
  // свайп по слайду
  let x0 = null;
  el.onpointerdown = e => { x0 = e.clientX; };
  el.onpointerup = e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); };
  document.addEventListener('keydown', key);
  el.hidden = false; render();
}

// Видеозаставка: открывается по нажатию (не грузится вместе с игрой). На узком экране — вертикальная, иначе — горизонтальная
const VIDEO_BASE = /^https?:/.test(location.href) && !window.POOL_JSON ? '' : 'https://survivefriday.com/';
function showVideo() {
  const tall = innerHeight > innerWidth, f = tall ? '9x16' : '16x9', m = $('modal');
  m.innerHTML = `<div class="modal-box glass video-box${tall ? ' tall' : ''}" role="dialog" aria-modal="true" aria-label="Видео об игре">
    <video src="${VIDEO_BASE}promo/video/zastavka-${f}.mp4" poster="${VIDEO_BASE}promo/video/poster-${f}.jpg" controls autoplay playsinline preload="auto"></video>
    <div class="video-nav"><button class="btn-ghost" type="button" id="vidHow">Как играть</button><button class="btn-main" type="button" id="vidClose">Понятно, играть</button></div></div>`;
  m.hidden = false;
  const v = m.querySelector('video'), close = () => { v.pause(); m.hidden = true; m.innerHTML = ''; };
  v.play?.().catch(() => {});  // если браузер запретил автозапуск со звуком — останется кнопка ▶
  $('vidClose').onclick = close;
  $('vidHow').onclick = () => { close(); showIntro(); };
  m.onclick = e => { if (e.target === m) close(); };
  track('share', { detail: 'video' });
}
