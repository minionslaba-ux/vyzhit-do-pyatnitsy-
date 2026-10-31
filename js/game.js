// Игра: экран недели, карьера, магазин, второй шанс, финалы, запись результата.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- DOM ----------
const $ = id => document.getElementById(id);
const views = { join: $('join'), menu: $('menu'), game: $('game'), end: $('end'), board: $('board') };
const show = v => { Object.entries(views).forEach(([k, el]) => el.hidden = k !== v); if (v !== 'menu') $('viralPop').hidden = true; window.VDP_PLATFORM?.view?.(v); };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const rnd = (a, r = Math.random) => a[Math.floor(r() * a.length)];
const shuffle = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = v => Math.max(0, Math.min(100, v));
const EASE = 'cubic-bezier(.2,.7,.2,1)';

// Неоновые трубки: слева Кукуха и Энергия, справа Босс и Коллеги
const tube = r => `<div class="tube-wrap" id="st-${r.k}" data-k="${r.k}" role="meter" aria-label="${r.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
    <span class="arrows" id="mk-${r.k}" aria-hidden="true"></span>
    <div class="tube" aria-hidden="true"><div class="fill" id="fl-${r.k}"></div><i class="bub"></i><i class="bub"></i><i class="bub"></i></div><span class="steam" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="lbl" aria-hidden="true">${r.name}</span><span class="pct" id="pc-${r.k}" aria-hidden="true">50%</span><span class="zone" id="zn-${r.k}" aria-hidden="true"></span></div>`;
// Опасные зоны: у 0 — «на грани», у 100 — «перегрев»; оба края заканчивают неделю
const zoneOf = v => v >= 80 ? L('перегрев', 'overheat') : v <= 20 ? L('на грани', 'on the edge') : '';
$('tubesL').innerHTML = RES.slice(0, 2).map(tube).join('');
$('tubesR').innerHTML = RES.slice(2).map(tube).join('');
const setPhase = p => { document.body.dataset.phase = p; };

// ---------- 31 цветовая тема (23 тёмные и 8 светлых): каждую неделю — своя, или та, что выбрана в профиле ----------
// m — главный акцент (кнопки, заголовки), c — второй (рамки, часы), p — свечение фона. Цвета шкал и ▲▼ не меняются: у них свой смысл
// light — светлая тема: тёмный текст, светлые панели (html.light в css/style.css)
const THEMES = [
  { name: L('Ночной неон', 'Neon Night'),  m: '#ff3bd4', c: '#2de2e6', p: '#b26bff', bg: '#07070d' },
  { name: L('Закат', 'Sunset'),        m: '#ff6a3d', c: '#ffc53d', p: '#ff3d7f', bg: '#0d0707' },
  { name: L('Утро в офисе', 'Office Morning'), m: '#d6189c', c: '#0a8fa8', p: '#b26bff', bg: '#f6f3ff', light: true },
  { name: L('Океан', 'Ocean'),        m: '#3d8bff', c: '#3dffd0', p: '#2b5cff', bg: '#050a12' },
  { name: L('Лес', 'Forest'),          m: '#2fe07a', c: '#e8d36a', p: '#1f8a4c', bg: '#050d08' },
  { name: L('Бумага', 'Paper'),       m: '#c2410c', c: '#1d4ed8', p: '#f59e0b', bg: '#f7f2e8', light: true },
  { name: L('Лаванда', 'Lavender'),      m: '#c48bff', c: '#ff9de2', p: '#7a5cff', bg: '#0a0712' },
  { name: L('Мандарин', 'Tangerine'),     m: '#ff9a2e', c: '#2ec4ff', p: '#ff5e2e', bg: '#0d0905' },
  { name: L('Мятный день', 'Mint Day'),  m: '#0c8461', c: '#7c3aed', p: '#34d399', bg: '#eefaf5', light: true },
  { name: L('Мята', 'Mint'),         m: '#3de8c0', c: '#ff7aa8', p: '#2fb38f', bg: '#060d0c' },
  { name: L('Рубин', 'Ruby'),        m: '#ff2e55', c: '#ffb02e', p: '#b3122f', bg: '#0e0508' },
  { name: L('Небо', 'Sky'),         m: '#2563eb', c: '#db2777', p: '#60a5fa', bg: '#eef5ff', light: true },
  { name: L('Электрик', 'Electric'),     m: '#5c6bff', c: '#00e5ff', p: '#3a2bff', bg: '#06061a' },
  { name: L('Золото', 'Gold'),       m: '#ffcf3d', c: '#ff8a3d', p: '#b38a1f', bg: '#0d0b05' },
  { name: L('Персик', 'Peach'),       m: '#c84b0a', c: '#0d9488', p: '#fb923c', bg: '#fff3ec', light: true },
  { name: L('Фуксия', 'Fuchsia'),       m: '#ff2ea6', c: '#ffe14d', p: '#a3125f', bg: '#0e050b' },
  { name: L('Аврора', 'Aurora'),       m: '#4dffb5', c: '#9b6bff', p: '#2bb3ff', bg: '#050c10' },
  { name: L('Сирень', 'Lilac'),       m: '#7c3aed', c: '#e11d48', p: '#a78bfa', bg: '#f5f0ff', light: true },
  { name: L('Коралл', 'Coral'),       m: '#ff7b6b', c: '#6be4ff', p: '#ff4d6d', bg: '#0e0708' },
  { name: L('Сакура', 'Sakura'),       m: '#ffa3cf', c: '#fff0a3', p: '#ff6bab', bg: '#0f080c' },
  { name: L('Индиго', 'Indigo'),       m: '#8b7bff', c: '#ff6be1', p: '#4b2bff', bg: '#07061a' },
  { name: L('Токсик', 'Toxic'),       m: '#7cff2e', c: '#2ee8ff', p: '#2e8b1f', bg: '#060d05' },
  { name: L('Лёд', 'Ice'),          m: '#e6f0ff', c: '#8fd3ff', p: '#5c7cff', bg: '#08090d' },
  // Новые темы — только в конец списка: номер темы хранится в prefs.theme.
  // tx / tx2 / tx3 — свои оттенки текста (основной, вторичный, третичный), если общие не подходят к фону
  { name: L('Утренний кофе', 'Morning Latte'), m: '#8f4a1f', c: '#2f6b6f', p: '#d9a066', bg: '#f5ece1', light: true, tx: '#2a1c13', tx2: '#6a5444', tx3: '#45342a' },
  { name: L('Северное сияние', 'Northern Lights'), m: '#38f2c8', c: '#ff7ad9', p: '#3b5bff', bg: '#030b16' },
  { name: L('Закат в опенспейсе', 'Open-Space Sunset'), m: '#ff9466', c: '#b3a4ff', p: '#ff4f8b', bg: '#170b19', tx: '#fff1ea', tx2: '#cdb6c4', tx3: '#ead8df' },
  { name: L('Мятный понедельник', 'Mint Monday'), m: '#0b7660', c: '#2949c9', p: '#8fe3c8', bg: '#ebf8f2', light: true, tx: '#10241f', tx2: '#4a5f59', tx3: '#2b3f3a' },
  { name: L('Неоновая пятница', 'Neon Friday'), m: '#c6ff1a', c: '#ff4fae', p: '#7a2bff', bg: '#08050f' },
  { name: L('Графит и золото', 'Graphite & Gold'), m: '#e8b64c', c: '#c5cad6', p: '#7a6430', bg: '#121316', tx: '#f4f1ea', tx2: '#b9b4a8', tx3: '#dcd7cc' },
  { name: L('Чертёж', 'Blueprint'), m: '#ffb347', c: '#6fd3ff', p: '#1e5eff', bg: '#071630', tx: '#eef5ff', tx2: '#a9bcd9', tx3: '#d3e0f2' },
  { name: L('Высокий контраст', 'High Contrast'), m: '#ffe600', c: '#00e5ff', p: '#3a3a3a', bg: '#000000', hc: true, tx: '#ffffff', tx2: '#e6e6e6', tx3: '#ffffff' },
];
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixW = (h, k) => '#' + rgbOf(h).map(v => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0')).join('');
const mixB = (h, k) => '#' + rgbOf(h).map(v => Math.round(v * (1 - k)).toString(16).padStart(2, '0')).join('');
// Неделя карьеры → своя тема по кругу; вне карьеры — по календарной неделе. Игрок может закрепить тему в профиле (prefs.theme)
// Насовсем бесплатно — классика, «Утренний кофе» и «Высокий контраст»; остальные — 15 у.е. (старые) и 25 у.е. (новые)
const THEME_FREE = [0, 23, 30];
const themePrice = i => THEME_FREE.includes(i) ? 0 : i >= 23 ? 25 : 15;
const PAID_THEMES = THEMES.map((t, i) => ({ id: i, name: t.name })).filter(t => themePrice(t.id));  // для купона из магазина (js/shop.js)
const themeOwned = i => !themePrice(i) || (prefs.themesOwned || []).includes(i);
const themeFixed = () => Number.isInteger(prefs.theme) && THEMES[prefs.theme] && themeOwned(prefs.theme) ? prefs.theme : null;
function themeIndex() {
  if (themeFixed() != null) return themeFixed();
  const w = C?.week || Math.floor((Date.now() / 864e5 + 3) / 7);
  return (w - 1 + THEMES.length * 100) % THEMES.length;
}
let themeNow = -1;
function applyTheme(i = themeIndex()) {
  if (i === themeNow) return THEMES[i];
  themeNow = i;
  const t = THEMES[i], st = document.documentElement.style;
  // на тёмном фоне светлые оттенки акцента светлее, на светлом — темнее, чтобы текст читался
  const tone = t.light ? (h, k) => mixB(h, k * .6) : mixW;
  st.setProperty('--magenta', t.m); st.setProperty('--magenta-l', tone(t.m, .45)); st.setProperty('--magenta-xl', tone(t.m, .78));
  st.setProperty('--cyan', t.c); st.setProperty('--cyan-l', tone(t.c, .45)); st.setProperty('--cyan-xl', tone(t.c, .78));
  st.setProperty('--bg-rgb', rgbOf(t.bg).join(',')); st.setProperty('--hi', t.light ? '#14121f' : '#fff'); st.setProperty('--w-rgb', t.light ? '20,18,40' : '255,255,255');
  document.documentElement.classList.toggle('light', !!t.light);
  document.documentElement.classList.toggle('hc', !!t.hc);
  // свои цвета текста темы; иначе — общие из css (тёмные или html.light)
  for (const [k, v] of [['--text', t.tx], ['--text-2', t.tx2], ['--text-3', t.tx3]]) v ? st.setProperty(k, v) : st.removeProperty(k);
  st.setProperty('--m-rgb', rgbOf(t.m).join(',')); st.setProperty('--c-rgb', rgbOf(t.c).join(',')); st.setProperty('--p-rgb', rgbOf(t.p).join(','));
  st.setProperty('--bg', t.bg);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.bg);
  return t;
}
// «Оформление» в профиле: «Авто» (тема меняется каждую неделю — бесплатно, по кругу идут все темы) или любая тема насовсем.
// Насовсем бесплатно — классика, «Утренний кофе» и «Высокий контраст» (доступность); остальные покупаются один раз за у.е.
// из карьеры: старые темы — 15 у.е., новые — 25. Купленные — prefs.themesOwned. Покупавшим у.е. картой бесплатно не даём.
let themePreview = null;  // тема, которую примеряют перед покупкой
function themePreviewEnd() { if (themePreview == null) return; themePreview = null; applyTheme(); }
function renderThemePicker() {
  const box = $('themePick'); if (!box) return;
  const cur = themeFixed(), pv = themePreview, name = THEMES[pv ?? themeIndex()].name;
  let foot = `<small class="tp-name">${cur == null ? L(`Сейчас: «${name}»`, `Now: “${name}”`) : L(`Выбрано: «${name}»`, `Selected: “${name}”`)}</small>`;
  if (pv != null) {
    const price = themePrice(pv), C2 = careerNow(), enough = C2 && C2.bank >= price;
    foot = `<div class="tp-buy"><span>👀 ${L(`Примерка: «${name}»`, `Preview: “${name}”`)}<small>${L(`навсегда за ${price} у.е.`, `yours forever for ${money(price)}`)}${C2 ? L(` · на счёте ${money(C2.bank)}`, ` · balance ${money(C2.bank)}`) : ''}</small></span>
      ${prefs.themeCoupons > 0 ? `<button type="button" class="btn-main tp-go" data-theme-buy="${pv}">🎟 ${L('Взять по купону', 'Use coupon')}</button>`
        : enough ? `<button type="button" class="btn-main tp-go" data-theme-buy="${pv}">${L(`Купить за ${price} у.е.`, `Buy for ${money(price)}`)}</button>`
        : `<button type="button" class="btn-main tp-go" data-theme-topup="${pv}">💰 ${L('Пополнить', 'Top up')}</button>`}
      <button type="button" class="btn-link" data-theme-cancel>${L('Отмена', 'Cancel')}</button></div>`;
  }
  box.innerHTML = `<button type="button" class="tp-auto${cur == null && pv == null ? ' on' : ''}" data-theme="auto" aria-pressed="${cur == null}"><span aria-hidden="true">🔄</span><span>${L('Авто', 'Auto')}<small>${L('меняется каждую неделю · бесплатно', 'changes every week · free')}</small></span></button>`
    + THEMES.map((t, i) => {
      const own = themeOwned(i), lbl = own ? t.name : L(`${t.name} — ${themePrice(i)} у.е.`, `${t.name} — ${money(themePrice(i))}`);
      return `<button type="button" class="tp-sw${cur === i ? ' on' : ''}${pv === i ? ' pv' : ''}${own ? '' : ' lock'}" data-theme="${i}" title="${esc(lbl)}" aria-label="${esc(lbl)}" aria-pressed="${cur === i}"><i style="--sw-bg:${t.bg};--sw-m:${t.m};--sw-c:${t.c}"></i>${own ? '' : `<small>🔒${themePrice(i)}</small>`}</button>`;
    }).join('') + foot;
}
function themeBuy(i) {
  if ((prefs.themeCoupons || 0) > 0 && typeof useThemeCoupon === 'function' && useThemeCoupon(i)) {  // купон из стартового набора / сезона
    prefs.theme = i; store.set(KEY.prefs, prefs); themePreview = null; applyTheme();
    try { renderMenu(); } catch { renderThemePicker(); }
    return toast(L(`🎨 Тема «${THEMES[i].name}» ваша — по купону`, `🎨 The “${THEMES[i].name}” theme is yours — coupon used`));
  }
  const price = themePrice(i), C2 = careerNow();
  if (!C2 || C2.bank < price) return openTopup({ need: lackOf(price), why: L(`Тема «${THEMES[i].name}» — ${price} у.е.`, `“${THEMES[i].name}” theme — ${money(price)}`), then: renderThemePicker });
  C2.bank -= price; C2.spent = (C2.spent || 0) + price; careerSave(C2);
  prefs.themesOwned = [...new Set([...(prefs.themesOwned || []), i])]; prefs.theme = i; store.set(KEY.prefs, prefs);
  track('theme_buy', { detail: `${i}:${price}` });
  themePreview = null; applyTheme();
  try { renderMenu(); } catch { renderThemePicker(); }  // баланс в карточке карьеры тоже обновится
  toast(L(`🎨 Тема «${THEMES[i].name}» ваша — навсегда`, `🎨 The “${THEMES[i].name}” theme is yours to keep`));
}
$('themePick')?.addEventListener('click', e => {
  const t = e.target;
  if (!t.closest('[data-theme-topup]')) e.stopPropagation();  // профиль не закрывается: тема меняется на глазах; «Пополнить» — новое окно
  if (t.closest('[data-theme-buy]')) return themeBuy(+t.closest('[data-theme-buy]').dataset.themeBuy);
  if (t.closest('[data-theme-topup]')) return themeBuy(+t.closest('[data-theme-topup]').dataset.themeTopup);
  if (t.closest('[data-theme-cancel]')) { themePreviewEnd(); return renderThemePicker(); }
  const b = t.closest('[data-theme]'); if (!b) return;
  const i = b.dataset.theme === 'auto' ? null : +b.dataset.theme;
  if (i != null && !themeOwned(i)) {  // чужая тема — примерка: видно сразу на всём экране
    themePreview = i; applyTheme(i); renderThemePicker(); track('theme_try', { detail: String(i) });
    return $('themePick').querySelector('.tp-go')?.focus({ preventScroll: true });
  }
  themePreview = null;
  if (i == null) delete prefs.theme; else prefs.theme = i;
  store.set(KEY.prefs, prefs); applyTheme(); renderThemePicker();
  $('themePick').querySelector(`[data-theme="${b.dataset.theme}"]`)?.focus({ preventScroll: true });
});
// renderMenu возвращает свою тему; если профиль открыт посреди примерки — примерка остаётся
bus.on('menu', () => { if (themePreview != null && !$('profSheet')?.hidden) applyTheme(themePreview); else themePreview = null; renderThemePicker(); });
// закрыли профиль посреди примерки — вернуть свою тему
if ($('profSheet')) new MutationObserver(() => { if ($('profSheet').hidden && themePreview != null) { themePreviewEnd(); renderThemePicker(); } }).observe($('profSheet'), { attributes: true, attributeFilter: ['hidden'] });

// Офис за окном: утром пусто, днём все на местах, вечером горит одна лампа
(() => {
  let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let city = '', x = 104;
  while (x < 1096) {
    const w = 30 + Math.floor(r() * 50), h = 60 + Math.floor(r() * 140);
    city += `<rect class="bld" x="${x}" y="${250 - h}" width="${w}" height="${h}"/>`;
    for (let wy = 256 - h; wy < 240; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12)
      if (r() > .35) city += `<rect class="cw${r() > .55 ? ' lit' : ''}" style="--d:${(r() * 2.4).toFixed(2)}s" x="${wx}" y="${wy}" width="5" height="7"/>`;
    x += w + 4;
  }
  const desk = (dx, i) => `<g class="desk${i === 3 ? ' last' : ''}">
    <rect class="mon" x="${dx + 60}" y="228" width="86" height="54" rx="4"/><rect class="stand" x="${dx + 98}" y="282" width="10" height="10"/>
    <g class="person"><circle cx="${dx + 103}" cy="262" r="15"/><path d="M${dx + 72} 300 q31 -34 62 0z"/></g>
    <rect class="top" x="${dx}" y="292" width="210" height="8" rx="2"/><rect class="leg" x="${dx + 10}" y="300" width="6" height="56"/><rect class="leg" x="${dx + 194}" y="300" width="6" height="56"/>
    ${i === 3 ? `<polygon class="lamp-glow" points="${dx + 176},214 ${dx + 120},292 ${dx + 220},292"/><path class="lamp" d="M${dx + 196} 292 v-62 l-24 -14"/><path class="lamp" d="M${dx + 160} 214 h28 l-6 -10 h-16z"/>` : ''}
  </g>`;
  $('office').innerHTML = `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">
    <rect class="sky" x="100" y="20" width="1000" height="232"/>${city}
    <rect class="frame" x="100" y="20" width="1000" height="232"/><path class="frame" d="M350 20v232M600 20v232M850 20v232"/>
    <rect class="floor" x="0" y="356" width="1200" height="44"/>${[110, 380, 650, 920].map(desk).join('')}
    <g class="cooler"><rect class="bottle" x="1138" y="246" width="34" height="48" rx="10"/><circle class="cb" cx="1150" cy="288" r="3"/><circle class="cb" cx="1160" cy="290" r="2.4"/><circle class="cb" cx="1146" cy="292" r="2"/>
      <rect class="body" x="1132" y="294" width="46" height="62" rx="4"/><rect class="tap" x="1150" y="306" width="10" height="5" rx="2"/></g>
    <g class="walker"><circle cx="0" cy="300" r="13"/><path d="M-14 356 v-30 q14 -20 28 0 v30z"/><rect class="mug" x="14" y="318" width="9" height="11" rx="2"/></g></svg>`;
})();

function renderSound() {
  const vol = Math.round(sfxVol() * 100), sl = $('sndVol'), sv = $('sndVolVal'), st = $('sndToggle');
  if (sl) { sl.value = vol; sl.style.setProperty('--p', vol + '%'); sl.setAttribute('aria-valuetext', vol + '%'); }
  if (sv) sv.textContent = prefs.sound ? vol + '%' : L('выкл.', 'off');
  if (st) { st.textContent = prefs.sound ? '♪' : '×'; st.setAttribute('aria-pressed', prefs.sound); st.title = prefs.sound ? L('Звук включён', 'Sound on') : L('Звук выключен', 'Sound off'); }
  for (const b of [$('soundMenu'), $('soundGame')]) { b.textContent = prefs.sound ? '♪' : '×'; b.setAttribute('aria-pressed', prefs.sound); b.title = prefs.sound ? L('Звук включён', 'Sound on') : L('Звук выключен', 'Sound off'); }
}
function toggleSound() { prefs.sound = !prefs.sound; store.set(KEY.prefs, prefs); renderSound(); if (prefs.sound) sfx.click?.(); }
$('soundMenu').onclick = toggleSound; $('soundGame').onclick = toggleSound;
if ($('sndToggle')) $('sndToggle').onclick = toggleSound;
// ползунок «Звуки» в профиле: 0–100 %, хранится в prefs.vol; во время перетаскивания — тихий щелчок для примерки
$('sndVol')?.addEventListener('input', e => {
  prefs.vol = Math.max(0, Math.min(100, Math.round(+e.target.value) || 0));
  if (prefs.vol > 0 && !prefs.sound) prefs.sound = true;
  sfxSetVol(); renderSound(); sfx.tick?.();
});
$('sndVol')?.addEventListener('change', () => { store.set(KEY.prefs, prefs); sfx.click?.(); });

let toastT;
function toast(text) { const t = $('toastBar'); t.textContent = text; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

// ---------- концовки-ачивки ----------
const endingsGot = () => store.get(KEY.endings, {});
function unlock(ids) {
  const got = endingsGot(), fresh = ids.filter(id => id && !got[id]);
  for (const id of fresh) got[id] = new Date().toISOString();
  if (fresh.length) store.set(KEY.endings, got);
  return fresh.map(id => ENDINGS.find(e => e.id === id)).filter(Boolean);
}
const endingsHtml = list => list.length ? `<div class="unlocked">${list.map(e => `<span>${L(`Новая концовка: «${esc(e.title)}»`, `New ending: “${esc(e.title)}”`)}</span>`).join('')}</div>` : '';

// ---------- сборка недели ----------
let S = null, busy = false, splashOn = false, splashFor = -1;
const slotOf = (day, phase) => slotOfPhase(DAYS.indexOf(day), PHASES.findIndex(p => p.name === phase));

// Неделя: карточки по расписанию → карточки вида недели (или пакета) → одна карточка профессии → случайные события
// classic — классическая неделя из cards.js; иначе карточки берутся из большого пула.
// seen — уже показанные карточки: из них ничего не берётся, так карточки не повторяются
function buildDeck({ prof, type = 'normal', rng = Math.random, extraRandom = [], profCard = true, packCards = [], classic = true, seen = null, lvl = 0 }) {
  const LP = levelPool(lvl);  // карьера: карточки своего уровня
  const unseen = c => !seen || !seen.has(c.id);
  const used = new Set(), deck = [], randomPack = [...RANDOM_CARDS, ...extraRandom].filter(unseen); // свежая копия на каждую неделю
  const rules = WEEK_TYPES[type].rules, fixed = new Map();
  for (const c of [...(WEEK_TYPES[type].cards || []).filter(unseen), ...packCards]) fixed.set(slotOf(c.day, c.phase), c.id);
  for (let i = 0; i < WEEK_LEN; i++) {
    const d = dayOf(i), ph = PHASES[slotPh(i)];
    if (fixed.has(i)) { const c = byId[fixed.get(i)]; deck.push({ id: c.id, time: c.time || slotTime(i), fixed: true }); continue; }
    const ok = c => c.phase === ph.name && !used.has(c.id);
    const fresh = classic ? [] : LP.filter(c => ok(c) && unseen(c));
    const special = CARDS.filter(c => ok(c) && c.day === DAYS[d]);
    // классических карточек 15 на 25 слотов — недостающие берём из большого пула
    let pool = fresh.length ? fresh : special.length ? special : CARDS.filter(c => ok(c) && !c.day);
    if (!pool.length) pool = LP.filter(c => ok(c) && unseen(c));
    if (!pool.length) pool = [...CARDS, ...LP].filter(c => c.phase === ph.name && !used.has(c.id));
    const standard = rnd(pool, rng); used.add(standard.id);
    deck.push({ id: standard.id, time: standard.time || slotTime(i) });
  }
  const profLeft = profCard && prof && PROF_CARDS[prof] ? PROF_CARDS[prof].filter(unseen) : [];
  if (profLeft.length) {
    const free = deck.map((s, i) => s.fixed ? -1 : i).filter(i => i > 0 && i !== WEEK_LEN - 1 && i >= 0);
    const i = rnd(free, rng), c = byId[rnd(profLeft, rng).id];
    deck[i] = { id: c.id, time: slotTime(i), fixed: true };
  }
  deck.forEach((s, i) => {
    if (s.fixed) return;
    const card = getRandomCard(byId[s.id], randomPack, rules.randomChance ?? 15, rng);
    if (card.id !== s.id) deck[i] = { id: card.id, time: card.time || slotTime(i) };
  });
  return deck;
}
const giveItems = (n, rng = Math.random) => shuffle(Object.keys(ITEMS), rng).slice(0, n);

function weekTypeFor(week, newJob) {
  if (newJob) return 'newboss';
  if (week % 13 === 0) return 'reports';
  if (week === 25 || week === 51) return 'vacation';
  return 'normal';
}
function newWeekState({ mode, res, type, rng = Math.random, extra = {} }) {
  const rules = WEEK_TYPES[type].rules;
  res = { ...res };
  for (const [k, v] of Object.entries(rules.start || {})) res[k] = clamp(res[k] + v);
  if (rules.bossStart) res.boss = rules.bossStart;
  for (const k in res) res[k] = Math.max(5, Math.min(95, res[k]));
  let n = rules.items || (rng() < .5 ? 1 : 2);
  if (mode === 'career' && typeof rankPerk === 'function') n = Math.min(4, n + rankPerk('items'));
  if (mode === 'career' && prefs.bonusItems > 0) { const add = Math.min(prefs.bonusItems, 4 - n); n += add; prefs.bonusItems -= add; store.set(KEY.prefs, prefs); }
  return { mode, name: prefs.name, dept: prefs.dept, prof: extra.prof || prefs.prof, trait: extra.trait || prefs.trait, res, step: 0, type,
    items: giveItems(n, rng), used: [], flags: {}, ...extra };
}

// ---------- карьера: 52 недели ----------
let C = null;
const saveCareer = () => store.set(KEY.career, C);
const vacancy = id => VACANCIES.find(v => v.id === id);
// ---------- зарплата и отпуск ----------
// Оклад за рабочий день: 2 у.е. в любой компании, +0,5 за каждую сданную аттестацию (js/cert.js)
const PAY_BASE = 2, PAY_CERT = 0.5, LIFE_COST = 4;
const salaryFor = () => PAY_BASE + PAY_CERT * (C?.cert || 0);
// Карьеры со старой сеткой окладов (3–5 у.е.) переводим на новую: 2 у.е. + аттестации
const payFix = c => { if (c && c.payV !== 2) { c.payV = 2; c.salary = PAY_BASE + PAY_CERT * (c.cert || 0); } return c; };
const VAC_YEAR = 28, VAC_PER_WEEK = VAC_YEAR / YEAR;  // 28 календарных дней в году → ≈0,54 дня за неделю
const fmtDays = d => (Math.floor(d * 10) / 10).toLocaleString(LOCALE);
function pay(amount) { C.bank += amount; C.earned += amount; saveCareer(); }
// Расходы недели: жильё и еда — 4 у.е. (не растут вместе с окладом), плюс платёж по кредиту. Счёт ниже нуля — долг, он давит на Кукуху
function weekExpenses(share = 1) {  // share — доля недели: при увольнении расходы только за отработанные дни
  const life = Math.round(LIFE_COST * share), loanPay = Math.min(C.loan || 0, Math.max(6, Math.ceil((C.loan || 0) / 8)));  // большой кредит — платёж больше
  C.bank -= life + loanPay; C.loan = (C.loan || 0) - loanPay; C.spent = (C.spent || 0) + life + loanPay; saveCareer();
  return { life, loanPay };
}
const expHtml = x => `<div class="money expense"><div><b>−${money(x.life)}</b><span>${L('жильё и еда', 'rent & food')}</span></div><div><b>${x.loanPay ? `−${money(x.loanPay)}` : '—'}</b><span>${C.loan ? L(`кредит, осталось ${C.loan}`, `loan, $${C.loan} left`) : x.loanPay ? L('кредит погашен', 'loan paid off') : L('кредита нет', 'no loan')}</span></div></div>
  ${C.bank < 0 ? `<p class="debt">${L(`На счёте ${C.bank} у.е. — долг. В понедельник Кукуха −10, пока не выйдете в плюс.`, `Balance: ${money(C.bank)}. You’re in debt — Sanity −10 every Monday until you’re back in the black.`)} ${topupBtn(-C.bank, '', L('Закройте долг, чтобы он не давил на Кукуху.', 'Clear the debt so it stops hurting your Sanity.'))}</p>` : ''}`;
function takeVacation() {
  if (!C || C.vacation < 7 || C.week > YEAR) return;
  const holidayPay = C.salary * 5;
  C.vacation = +(C.vacation - 7).toFixed(2); C.vacUsed += 7; C.week++;
  C.res = { psyche: 60, energy: 60, boss: 50, colleagues: 50 };
  pay(holidayPay); weekExpenses(); store.del(KEY.save);
  const over = C.week > YEAR;
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${L(`Неделя ${C.week - 1} из ${YEAR} · отпуск 7 дней`, `Week ${C.week - 1} of ${YEAR} · 7 days off`)}</span>
    <h1>${L('Вы в отпуске!', 'You’re on vacation!')}</h1>
    <p>${L('Неделя без писем, созвонов и «срочно». В понедельник все шкалы вернутся к 50%, а Кукуха и Энергия — ещё и с запасом +10.', 'A week with no emails, no calls and no “URGENT!!!”. On Monday every meter resets to 50%, and Sanity and Energy get a +10 cushion on top.')}</p>
    <div class="money"><div><b>+${money(holidayPay)}</b><span>${L('отпускные', 'vacation pay')}</span></div><div><b>${fmtDays(C.vacation)} ${L('дн.', 'days')}</b><span>${L('отпуска осталось', 'vacation left')}</span></div></div>
    <div class="stack"><button class="btn-main" id="next">${over ? L('Итоги года', 'Year in review') : L(`Вернуться к работе · неделя ${C.week}`, `Back to work · week ${C.week}`)}</button><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div></div>`;
  setPhase('day'); show('end'); $('toMenu').onclick = renderMenu;
  $('next').onclick = () => over ? yearEnd() : startWeek(); confetti();
}
const freshRes = perk => {
  const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
  for (const b of [PROF[C.prof].bonus, perk || {}]) for (const [k, v] of Object.entries(b)) res[k] = clamp(res[k] + v);
  return res;
};
function newCareer() {
  prefs.prof = getProf(); prefs.trait = getTrait(); store.set(KEY.prefs, prefs);
  const first = rnd(VACANCIES.filter(v => v.level === 1));
  C = { prof: prefs.prof, trait: prefs.trait, week: 1, stage: 'work', company: first.name, companies: [first.name], res: null,
    worked: 0, firings: 0, passed: 0, failed: 0, newJob: false, bank: 0, earned: 0, salary: salaryFor(first), vacation: 0, vacUsed: 0 };
  C.res = freshRes(first.perk);
  saveCareer(); heroCreate(startWeek);  // сначала — выбрать персонажа (js/hero.js)
}
// Новый год карьеры на уровне lvl: персонаж, питомцы, деньги и аттестация остаются; недели, компании и счётчики — с нуля
function startLevel(lvl) {
  const keep = C, first = rnd(VACANCIES.filter(v => v.level === Math.min(lvl, 3)));
  C = { prof: keep.prof, trait: keep.trait, week: 1, stage: 'work', company: first.name, companies: [first.name], res: null, level: lvl,
    worked: 0, firings: 0, passed: 0, failed: 0, newJob: false, bank: keep.bank || 0, earned: 0, cert: keep.cert, payV: keep.payV, vacation: 0, vacUsed: 0,
    hero: keep.hero, levelsDone: Math.max(keep.levelsDone || 0, levelOf(keep)) };
  C.salary = salaryFor(first); C.res = freshRes(first.perk);
  store.del(KEY.save); saveCareer();
  track('level_start', { detail: String(lvl) });
  toast(L(`${LEVELS[lvl].ico} Уровень ${lvl}: «${LEVELS[lvl].name}» — новые карточки!`, `${LEVELS[lvl].ico} Level ${lvl}: “${LEVELS[lvl].name}” — new cards!`));
  startWeek();
}
function continueCareer() {
  C = store.get(KEY.career, null);
  if (!C) return newCareer();
  C.trait = C.trait || prefs.trait;
  C.bank ??= 0; C.earned ??= 0; C.vacation ??= 0; C.vacUsed ??= 0;  // карьеры до появления зарплаты и отпуска
  if (C.payV !== 2) { payFix(C); saveCareer(); }
  const save = store.get(KEY.save, null);
  if (save && (save.mode || 'career') === 'career' && save.deck?.every(x => byId[x.id])) { S = { items: [], used: [], flags: {}, type: 'normal', mode: 'career', ...save }; return enterGame(true); }
  if (C.week > YEAR) return yearEnd();
  if (!C.hero) return heroCreate(continueCareer);  // карьеры до появления аватара — создать его один раз
  if (C.stage === 'search') return jobSearch();
  startWeek();
}
// Показанные карточки копятся между карьерами; когда в фазе дня почти не остаётся новых, круг начинается заново
// Карточки уровня; если у уровня мало карточек (английская версия: перевод ещё не готов) — весь пул
const levelPool = lvl => { if (!lvl) return POOL; const a = POOL.filter(c => c.lvl === lvl); return a.length >= 150 ? a : POOL; };
function seenSet(lvl = 0) {
  const seen = new Set(store.get(KEY.seen, [])), LP = levelPool(lvl);
  for (const ph of PHASES) {
    const left = LP.filter(c => c.phase === ph.name && !seen.has(c.id)).length;
    if (LP.length && left < 5) LP.filter(c => c.phase === ph.name).forEach(c => seen.delete(c.id));
  }
  return seen;
}
function startWeek() {
  const type = weekTypeFor(C.week, C.newJob);
  C.newJob = false; saveCareer();
  S = newWeekState({ mode: 'career', res: C.res, type, extra: { prof: C.prof, trait: C.trait } });
  S.diff = diffStage(C);  // сложность стадии карьеры (DIFF в js/engine.js) — на всю неделю
  if (C.bank < 0) { S.res.psyche = Math.max(5, S.res.psyche - 10); setTimeout(() => toast(L(`Долг ${C.bank} у.е. давит: Кукуха −10`, `${money(-C.bank)} of debt weighs on you: Sanity −10`)), 400); }
  const lvl = levelOf(C); S.lvl = lvl;
  const seen = seenSet(lvl), classic = lvl === 1 && (!seen.has('__classic') || !POOL.length);  // классическая неделя — только в самый первый раз
  const season = type === 'normal' && !classic ? activeSeason() : null;
  if (season) S.season = season.id;
  S.deck = buildDeck({ prof: C.prof, type, extraRandom: SUGGESTED, classic, seen, lvl, packCards: season ? SEASON_CARDS.filter(c => c.season === season.title && !seen.has(c.id)) : [] });
  if (!classic) placeCastCard(S.deck);
  bus.emit('deck', S);
  for (const s of S.deck) seen.add(s.id);
  if (classic) seen.add('__classic');
  store.set(KEY.seen, [...seen]);
  store.set(KEY.save, S);
  enterGame();
}

// ---------- постоянные коллеги ----------
// Отношения хранятся в карьере (C.cast), в остальных режимах — только на неделю
const relStore = () => S?.mode === 'career' && C ? (C.cast ||= {}) : (S.castRel ||= {});
// Раз в неделю — карточка одного коллеги: сначала «расплата» (друг выручит, обиженный отомстит), иначе следующая глава истории
function placeCastCard(deck) {
  if (!CAST_CARDS.length) return;
  const rel = C.cast ||= {}, stage = C.castStage ||= {}, done = new Set(C.castSeen ||= []);
  const payoff = CAST_CARDS.find(c => !done.has(c.id) && (c.payoff === 'friend' && (rel[c.cast] || 0) >= 2 || c.payoff === 'enemy' && (rel[c.cast] || 0) <= -2));
  const next = Object.keys(CAST).map(k => CAST_CARDS.find(c => c.cast === k && c.stage === (stage[k] || 0) + 1)).filter(Boolean);
  const card = payoff || next.sort((a, b) => a.stage - b.stage)[Math.floor(Math.random() * Math.min(2, next.length))];
  if (!card) return;
  const free = deck.map((s, i) => s.fixed || i === 0 || i === WEEK_LEN - 1 ? -1 : i).filter(i => i >= 0);
  if (!free.length) return;
  const i = rnd(free); deck[i] = { id: card.id, time: slotTime(i), fixed: true };
}
// Ответ меняет отношение: у карточек истории — явно (rel), у остальных с именем коллеги — по знаку шкалы «Коллеги»
function castAfter(c, side, eff) {
  const k = c.cast || castOf(`${c.who} ${c.text}`);
  if (!k) return;
  const d = c.cast ? c.answers[side].rel || 0 : Math.sign(eff.colleagues || 0);
  if (c.cast && S.mode === 'career' && C) {
    if (c.stage) (C.castStage ||= {})[k] = Math.max(C.castStage[k] || 0, c.stage);
    else (C.castSeen ||= []).push(c.id);
  }
  if (!d) return;
  const rel = relStore(); rel[k] = Math.max(-3, Math.min(3, (rel[k] || 0) + d));
  if (S.mode === 'career' && C) saveCareer();
  FX.relNote(CAST[k].name, d);
}
const hearts = v => v > 0 ? '♥'.repeat(v) : v < 0 ? '💢'.repeat(-v) : '·';

// ---------- живые игроки ----------
// Неделя дня: после ответа — сколько игроков ответили так же (только сводные числа)
function livePick(c, side) {
  const el = $('pickStat'); el.hidden = true;
  if (S.mode !== 'daily' || !board.online) return;
  const step = S.step;
  board.rpc('pick_daily', { p_id: prefs.playerId, p_day: S.day, p_step: step, p_card: c.id, p_side: side }).then(r => {
    const x = Array.isArray(r) ? r[0] : r;
    if (!x?.total || S?.mode !== 'daily') return;
    el.textContent = x.total === 1 ? L('Вы первые ответили на эту карточку сегодня', 'You’re the first to answer this card today') : `${L('Так же ответили', 'Same answer as you:')} ${Math.round(100 * x.same / x.total)}% · ${pl(x.total, 'ответ', 'ответа', 'ответов', 'answer', 'answers')} ${L('за сегодня', 'today')}`;
    el.hidden = false; FX.pulse(el, 'on', 4000);
  }).catch(() => {});  // старая база без pick_daily — просто без подсказки
}
// Кто сейчас играет: аватары тех, у кого статус «играет» последние 3 минуты
let liveT = 0;
// Лента «сейчас в игре» над карточкой: аватар и имя; нажатие — написать или позвать в офис
async function liveTick() {
  clearTimeout(liveT);
  const el = $('liveStrip'); $('live').hidden = true;
  if (views.game.hidden) { el.hidden = true; return; }
  try {
    const rows = (await onlineNow()).filter(p => p.short_id).sort((a, b) => (b.status === 'playing') - (a.status === 'playing'));
    el.hidden = !rows.length;
    el.innerHTML = rows.length ? `<span class="ls-head"><i class="live-dot"></i>${rows.filter(r => !r.npc).length ? `${rows.filter(r => !r.npc).length}<small>${L('в игре', 'online')}</small>` : `<small>${L('офис', 'office')}</small>`}</span>`
      + rows.slice(0, 15).map((p, i) => `<button class="ls-p${p.status === 'playing' ? ' play' : ''}${p.npc ? ' npc' : ''}" type="button" data-i="${i}" title="${esc(p.name)}${p.dept ? ' · ' + esc(p.dept) : ''}${p.npc ? ' · ' + L('персонаж игры', 'game character') : ''}"><span class="ls-ava">${esc(p.avatar || '🙂')}</span><span class="ls-name">${esc(p.name)}</span></button>`).join('') : '';
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => personPop(rows[+b.dataset.i]));
  } catch { el.hidden = true; }
  liveT = setTimeout(liveTick, 30000);
}

// ---------- неделя дня и брендированная неделя ----------
// day — дата недели дня; прошлые даты (по ссылке-вызову) играются вне зачёта
function startDaily(day = today()) {
  const rng = seeded('vdp-daily-' + day);
  C = null;
  S = newWeekState({ mode: 'daily', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal', rng, extra: { day } });
  const season = activeSeason(new Date(day + 'T12:00')); if (season) S.season = season.id;
  S.deck = buildDeck({ type: 'normal', rng, profCard: false, classic: !POOL.length, packCards: season ? SEASON_CARDS.filter(c => c.season === season.title) : [] });
  S.ranked = day === today() && !store.get(KEY.daily, {})[day];
  enterGame();
}
function startPack() {
  if (!PACK) return;
  C = null;
  S = newWeekState({ mode: 'pack', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal' });
  S.deck = buildDeck({ type: 'normal', profCard: false, packCards: PACK_CARDS, classic: !POOL.length });
  enterGame();
}

// ---------- игровой экран ----------
// resumed — продолжение сохранённой недели: отдельное событие, чтобы не считать её начатой дважды
function enterGame(resumed) { busy = false; applyTheme(); show('game'); splashFor = -1; liveTick(); $('pickStat').hidden = true; if (resumed) track('week_resume', { mode: S.mode, step: S.step }); else if (S.step === 0) track('week_start', { mode: S.mode }); renderBars(); renderCard(); requestAnimationFrame(fitGame); }
// Статистика: анонимные события игры (без текста ответов); без Supabase не отправляются
// Цели Яндекс Метрики (счётчик 113961628 в <head>): ключевые шаги воронки
const YM_GOALS = new Set(['open', 'week_start', 'week_end', 'buy_intent', 'purchase', 'ad_reward', 'ad_forced', 'cert_end', 'share', 'invite', 'install', 'pet_adopt', 'hero_buy', 'guest_gate']);
function track(kind, o = {}) {
  if (YM_GOALS.has(kind)) try { window.ym?.(113961628, 'reachGoal', kind, { mode: o.mode, detail: o.detail }); } catch {}
  if (!board.online || !prefs.name) return;
  board.rpc('log_event', { p_id: prefs.playerId, p_kind: kind, p_mode: o.mode || null, p_card: o.card || null, p_won: o.won ?? null, p_step: o.step ?? null, p_detail: o.detail || null }).catch(() => {});
}

function renderBars() {
  for (const r of RES) {
    const v = S.res[r.k];
    $('fl-' + r.k).style.setProperty('--v', v);
    $('pc-' + r.k).textContent = v + '%';
    const z = zoneOf(v), w = $('st-' + r.k);
    w.classList.toggle('danger', !!z); w.classList.toggle('hot', v >= 80); w.classList.toggle('low', v <= 20); $('zn-' + r.k).textContent = z;
    w.setAttribute('aria-valuenow', v); w.setAttribute('aria-valuetext', `${r.name}: ${v}%${z ? ', ' + z : ''}`);
  }
  const bc = $('bankChip'); bc.hidden = !(S.mode === 'career' && C); if (!bc.hidden) bc.textContent = `${money(C.bank)} · ${L('магазин', 'shop')}`;
  if ($('ctBank') && C) $('ctBank').textContent = money(C.bank);
  if (!busy && !views.game.hidden) answerWarn();  // шкала вошла в опасную зону или вышла из неё (магазин) — обновить метки ответов
  $('inv').innerHTML = S.items.map(id => `<span class="item${S.used.includes(id) ? ' used' : ''}" title="${ITEMS[id].text}">${ITEMS[id].name}</span>`).join('');
}
const headerLine = () => S.mode === 'career' && C ? (levelOf(C) > 1 ? L(`Ур. ${levelOf(C)} · `, `Lv ${levelOf(C)} · `) : '') + L(`Неделя ${C.week}/${YEAR} · ${C.company}`, `Week ${C.week}/${YEAR} · ${C.company}`) : S.mode === 'daily' ? `${L('Неделя дня', 'Daily Week')} ${dayLabel(S.day)}${S.ranked ? '' : L(' · не в зачёт', ' · unranked')}`
  : S.mode === 'tour' ? `${L('Турнир', 'Tournament')} · ${S.tourTeam}${S.ranked ? '' : L(' · не в зачёт', ' · unranked')}` : PACK?.company || '';

function renderCard() {
  const slot = S.deck[S.step], c = byId[slot.id], d = dayOf(S.step), ph = PHASES[slotPh(S.step)];
  const card = $('card');
  const tag = c.rare ? `<span class="rnd-tag rare">✨ ${L('РЕДКОЕ СОБЫТИЕ', 'RARE EVENT')}</span>` : slot.origin ? `<span class="rnd-tag chain">← ${esc(slot.origin)}</span>` : c.author ? `<span class="rnd-tag">${L('ОТ КОЛЛЕГИ', 'FROM A COLLEAGUE')} · ${esc(c.author)}</span>`
    : c.random ? `<span class="rnd-tag">${L('! СЛУЧАЙНОЕ СОБЫТИЕ', '! RANDOM EVENT')}</span>` : c.profCard ? `<span class="rnd-tag prof">${PROF[S.prof].name.toUpperCase()}</span>` : '';
  const ck = c.cast || castOf(c.who), relTag = ck ? `<span class="rel-tag" title="${L('Отношение', 'Relationship')}: ${relStore()[ck] || 0}">${hearts(relStore()[ck] || 0)}</span>` : '';
  // в карьере внизу карточки — кнопки «Подсказка» и «Магазин»; там же появляется предложение подсказки
  const tools = S.mode === 'career' && C ? '<div class="card-tools" id="ctools"></div>' : '';
  card.innerHTML = `<div class="card-head">${portraitHtml(c.who)}<span class="who">${esc(c.who)}</span>${relTag}${tag}</div><div class="text" aria-live="polite"><span class="sr">${esc(c.who)}: </span>${esc(c.text)}</div>${tools}<div class="stamp" aria-hidden="true"></div>`;
  if (tools) cardTools();
  sfx.flick?.();
  views.game.classList.toggle('pro', (prefs.gamesPlayed || 0) >= 2);  // опытным не нужна строка «тяните карточку…» — больше места карточке
  // вход новой карточки: последствие — перемотка, случайное событие — помехи, новый день — лист календаря, иначе — снизу
  const kind = slot.origin ? 'rewind' : c.random ? 'glitch' : S.step % PER_DAY === 0 && S.step > 0 ? 'page' : null;
  card.style.transition = 'none'; card.style.transform = RM.matches || kind ? '' : 'translateY(28px) scale(.95)'; card.style.opacity = RM.matches || kind ? '' : '0';
  void card.offsetWidth;
  card.style.transition = RM.matches ? 'none' : `transform .38s ${EASE}, opacity .38s, border-color .2s, box-shadow .2s`; card.style.transform = ''; card.style.opacity = '';
  FX.enter(card, kind);
  setPhase(PHASE_KEY[slotPh(S.step)]);
  $('btnL').innerHTML = `<span class="ar">←</span><span>${esc(c.answers.left.label)}</span>`;
  $('btnR').innerHTML = `<span>${esc(c.answers.right.label)}</span><span class="ar">→</span>`;
  FX.clock(slot.time);
  $('gCareer').textContent = headerLine();
  const zs = S.season && SEASONS.find(z => z.id === S.season);
  $('gType').textContent = S.type !== 'normal' ? WEEK_TYPES[S.type].title : zs ? zs.title : '';
  $('gDay').textContent = dayName(d); $('gPhase').textContent = phaseName(slotPh(S.step)).toLowerCase(); $('gNum').textContent = String(S.step + 1).padStart(2, '0');
  $('dots').innerHTML = S.deck.map((s, i) => `<i class="${i < S.step ? 'done' : i === S.step ? 'now' : ''}${s.origin && i > S.step ? ' chain' : ''}"></i>`).join('');
  clearPreview(); $('btnL').classList.remove('tip'); $('btnR').classList.remove('tip'); hintOffer(); deadlineBadges(c); answerWarn(); deadlineOffer();
  if (S.step % PER_DAY === 0 && splashFor !== S.step) { splashFor = S.step; showSplash(d); }
  touchPlaying(d);
  coachFor(slot);
  answerTimerReset();
  fitGame();
}
// Экран недели всегда целиком в видимой части экрана (без панелей браузера и полоски «домой» на iPhone):
// если кнопки ответов не помещаются — ужимаем верх в два шага (без ленты «в игре», ниже шкалы и часы), текст карточки подгоняется
function fitGame() {
  const g = views.game; if (g.hidden) return;
  g.classList.remove('tight', 'tighter', 'squeeze');
  fitCardText();
  // видимая высота минус «полоска домой» iPhone (safe-area снизу), которую эмуляторы не учитывают
  const vh = () => (document.documentElement.classList.contains('pwa') ? document.body.getBoundingClientRect().bottom : (window.visualViewport?.height || innerHeight)) - safeBottom();
  const small = () => parseFloat($('card').querySelector('.text')?.style.fontSize || 99) < 16;  // текст пришлось сильно уменьшить
  const over = () => $('btnL').getBoundingClientRect().bottom > vh() - 2 || small();
  if (over()) { g.classList.add('tight'); fitCardText(); }
  if (over()) { g.classList.add('tighter'); fitCardText(); }
  const tx = $('card').querySelector('.text'); if (tx && tx.scrollHeight > tx.clientHeight + 1) g.classList.add('squeeze');  // текст длинный даже мелким шрифтом — прокрутка, а не обрезка
}
let safeB = null;
function safeBottom() {
  if (safeB == null) { const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;bottom:0;height:0;padding-bottom:env(safe-area-inset-bottom);visibility:hidden';
    document.body.append(pr); safeB = parseFloat(getComputedStyle(pr).paddingBottom) || 0; pr.remove(); }
  return safeB;
}
// iOS: панели Safari и клавиатура появляются с задержкой — подогнать ещё раз
addEventListener('orientationchange', () => { safeB = null; setTimeout(fitGame, 350); });
window.visualViewport?.addEventListener('scroll', () => requestAnimationFrame(fitGame));
window.visualViewport?.addEventListener('resize', () => requestAnimationFrame(fitGame));
// Текст карточки целиком помещается в карточку: если не влезает — шрифт плавно уменьшается (до 14 px), без прокрутки
function fitCardText() {
  const t = $('card')?.querySelector('.text'); if (!t) return;
  t.style.fontSize = '';
  let fs = parseFloat(getComputedStyle(t).fontSize);
  for (let i = 0; i < 24 && t.scrollHeight > t.clientHeight + 1 && fs > 14; i++) { fs -= 1; t.style.fontSize = fs + 'px'; }
}
addEventListener('resize', () => requestAnimationFrame(fitGame));
// панель подсказки под текстом меняет высоту — подогнать ещё раз
// (и лента «в игре», дедлайн, подсказка появляются позже — подгоняем весь экран; не чаще раза за кадр)
let fitQ = 0;
if (typeof MutationObserver !== 'undefined') new MutationObserver(() => { if (!fitQ) fitQ = requestAnimationFrame(() => { fitQ = 0; fitGame(); }); }).observe(views.game, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
// Статус «играет» — раз в игровой день или раз в 30 секунд, а не на каждой карточке
let touchAt = 0, touchDay = -1;
function touchPlaying(d) {
  if (d === touchDay && Date.now() - touchAt < 30000) return;
  touchDay = d; touchAt = Date.now();
  board.touch('playing', S.step).catch(() => {});
}

// Обучение в первых неделях: по одной подсказке на карточку, каждая — один раз
const COACH = [
  ['swipe',  () => S.step === 0, L('Тяните карточку или наведите на ответ: ▲ и ▼ над шкалами покажут, что изменится. ▲▲ — сильный сдвиг.', 'Drag the card or hover over an answer: ▲ and ▼ above the meters show what will change. ▲▲ means a big swing.')],
  ['zones',  () => S.step >= 1, L('Держите шкалы между 20% и 80%. Ниже 20% — «на грани», выше 80% — «перегрев»: и 0%, и 100% заканчивают неделю.', 'Keep the meters between 20% and 80%. Below 20% you’re “on the edge”, above 80% it’s “overheat” — hit 0% or 100% and your week is over.')],
  ['items',  () => S.step >= 2 && S.items.length, () => L(`В сумке ${S.items.map(i => ITEMS[i].name).join(', ')}: предмет сам отменит один удар −10 и сильнее по своей шкале. Значок ◆ — удар погасит предмет.`, `In your bag: ${S.items.map(i => ITEMS[i].name).join(', ')}. Each item automatically blocks one hit of −10 or worse to its meter. A ◆ means an item will absorb the hit.`)],
  ['chain',  slot => slot.origin, L('Карточка со стрелкой ← — последствие вашего прошлого решения. Решения возвращаются.', 'A card with a ← arrow is the fallout of an earlier decision. Choices come back to bite.')],
  ['hide',   () => WEEK_TYPES[S.type].rules.hideBoss, L('На этой неделе настроение Босса скрыто: вместо стрелок — «?».', 'This week the Boss’s mood is hidden: you get a “?” instead of arrows.')],
];
function coachFor(slot) {
  const el = $('coach'), seen = prefs.coach || (prefs.coach = []);
  el.hidden = true;
  if (seen.length >= COACH.length || (prefs.gamesPlayed || 0) >= 3) return;
  const h = COACH.find(([k, when]) => !seen.includes(k) && when(slot));
  if (!h) return;
  seen.push(h[0]); store.set(KEY.prefs, prefs);
  el.innerHTML = `<b>${L('Подсказка', 'Tip')}</b> ${esc(typeof h[2] === 'function' ? h[2]() : h[2])}<button type="button" aria-label="${L('Скрыть подсказку', 'Hide tip')}">×</button>`;
  el.hidden = false; el.querySelector('button').onclick = () => { el.hidden = true; };
}

// Заставка перед началом каждого дня; в понедельник — вид недели и выданные предметы
function showSplash(d) {
  const el = $('splash'), T = WEEK_TYPES[S.type];
  const top = S.mode === 'career' && C ? L(`Неделя ${C.week} из ${YEAR} · `, `Week ${C.week} of ${YEAR} · `) : S.mode === 'daily' ? `${L('Неделя дня', 'Daily Week')} ${dayLabel(S.day)} · ` : S.mode === 'tour' ? L('Турнир офиса · ', 'Office Tournament · ') : '';
  const zs = S.season && SEASONS.find(z => z.id === S.season);
  const extra = d === 0 ? `<div class="splash-week">${S.mode === 'pack' ? esc(PACK.intro) : S.mode === 'tour' ? `<b>${L(`Турнир офиса «${esc(S.tourTeam)}»`, `Office Tournament “${esc(S.tourTeam)}”`)}</b><span>${L('Одна неделя для всех участников. В зачёт — первая попытка.', 'Same week for everyone. Only your first attempt counts.')}</span>`
    : zs && S.type === 'normal' ? `<b>${zs.title}</b><span>${zs.rule}</span>` : `<b>${T.title}</b>${S.type !== 'normal' ? `<span>${T.rule}</span>` : ''}`}
    <span class="splash-items">${L(`В сумке: ${S.items.map(i => ITEMS[i].name).join(', ')} — ${S.items.length > 1 ? 'каждый отменит' : 'отменит'} один сильный удар по своей шкале.`, `In your bag: ${S.items.map(i => ITEMS[i].name).join(', ')} — ${S.items.length > 1 ? 'each one blocks' : 'blocks'} one big hit to its meter.`)}</span></div>` : '';
  el.innerHTML = `<div class="splash-in"><small>${top}${L(`День ${d + 1} из 5`, `Day ${d + 1} of 5`)}</small><h2>${dayName(d)}</h2><p>${DAY_QUIP[d]}</p>${d ? '' : `<span class="splash-theme">🎨 ${L(`Цвета недели: «${applyTheme().name}»`, `This week’s colors: “${applyTheme().name}”`)}</span>`}${extra}<span class="tap">${d ? '' : L('нажмите или смахните, чтобы начать', 'tap or swipe to start')}</span></div>`;
  // со второго дня заставка — баннер поверх игры: играть можно сразу
  el.classList.toggle('mini', d > 0); el.hidden = false; splashOn = d === 0;
  clearTimeout(splashT);
  const close = () => { splashOn = false; el.hidden = true; clearTimeout(splashT); };
  splashT = setTimeout(close, d === 0 ? 4200 : 1800);
  el.onclick = el.onpointerdown = close;
}
let splashT = 0;

const current = () => byId[S.deck[S.step].id];
// Эффекты ответа с правилами недели; предметы гасят удары −10 и сильнее
function effectsOf(side) {
  const rules = WEEK_TYPES[S.type].rules, raw = current().answers[side].effects, eff = {}, blocked = [];
  const free = S.items.filter(i => !S.used.includes(i)), D = S.mode === 'career' && DIFF[S.diff];
  for (const r of RES) {
    let v = raw[r.k] || 0;
    if (r.k === 'boss' && rules.bossMul) v = Math.round(v * rules.bossMul / 5) * 5;
    if (r.k === 'psyche' && v < 0 && rules.psycheNegMul) v = Math.round(v * rules.psycheNegMul / 5) * 5;
    if (D && v < 0) v = Math.max(D.cap, Math.round(v * D.neg * (LEVELS[S.lvl || 1]?.neg || 1)));  // стадия карьеры: новичкам мягче, руководителям жёстче
    const item = v <= -10 && free.find(i => ITEMS[i].stat === r.k && !blocked.some(b => b.item === i));
    if (item) blocked.push({ item, stat: r.k, v });
    eff[r.k] = item ? 0 : v;
  }
  return { eff, blocked };
}

function preview(side) {
  const { eff, blocked } = effectsOf(side), hide = WEEK_TYPES[S.type].rules.hideBoss;
  for (const r of RES) {
    const v = eff[r.k], m = $('mk-' + r.k);
    if (blocked.some(b => b.stat === r.k)) m.innerHTML = `<span class="s" title="${L('Удар погасит предмет', 'An item will block this hit')}">◆</span>`;
    else if (hide && r.k === 'boss' && (current().answers[side].effects.boss || 0)) m.innerHTML = '<span class="q">?</span>';
    else m.innerHTML = v > 0 ? `<span class="u">${v >= 20 ? '▲▲' : '▲'}</span>` : v < 0 ? `<span class="d">${v <= -20 ? '▼▼' : '▼'}</span>` : '';
  }
  $('card').dataset.hot = side;
  $('btnL').classList.toggle('hot', side === 'left'); $('btnR').classList.toggle('hot', side === 'right');
  FX.stamp(side, .4);
  setMood(document.querySelector('#card .face'), speakerMood(current(), eff, side));
}
function clearPreview() {
  for (const r of RES) $('mk-' + r.k).innerHTML = '';
  delete $('card').dataset.hot; $('btnL').classList.remove('hot'); $('btnR').classList.remove('hot');
  FX.stamp(null);
  setMood(document.querySelector('#card .face'), 'neutral');
}
// Как отреагирует тот, кто говорит: коллега из истории — по отношению, остальные — по своей шкале
function speakerMood(c, eff, side) {
  if (c.cast) { const d = c.answers[side].rel || 0; return d > 0 ? 'happy' : d < 0 ? 'angry' : 'neutral'; }
  const [g, stat] = reactionGroup(c.who), v = eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0);
  return moodFor(v, g === 'boss' || g === 'client' || g === 'hr');
}

// Реплика персонажа на ваш ответ — своим цветом
function reactionGroup(who) {
  if (castOf(who)) return ['colleagues', 'colleagues'];
  if (/босс|директор|boss|director|ceo|cfo|cto|chief|(?<!office )manager|management|executive|supervisor/i.test(who)) return ['boss', 'boss'];
  if (/\bhr\b|кадр|офис-менеджер|recruit|human resources|personnel|office manager|people ops|talent/i.test(who)) return ['hr', 'boss'];
  if (/клиент|налогов|client|customer|tax|\birs\b|partner|investor/i.test(who)) return ['client', 'boss'];
  if (/коллег|чат|созвон|курьер|джун|отдел|бухгалтер|именин|colleague|coworker|co-worker|team|chat|call|zoom|courier|delivery|intern|junior|department|dept|accountant|accounting|birthday/i.test(who)) return ['colleagues', 'colleagues'];
  return ['self', 'psyche'];
}
function react(card, eff, side) {
  const note = card.answers?.[side]?.note;
  if (note) {  // онбординг: вместо реплики — подсказка, как принято
    const ok = card.correct ? card.correct === side : null, el = $('react');
    if (card.correct) { S.flags.obTotal = (S.flags.obTotal || 0) + 1; if (ok) S.flags.obOk = (S.flags.obOk || 0) + 1; }
    el.style.setProperty('--rc', ok === false ? '#ff3b6b' : '#d4ff3a');
    el.innerHTML = `<b>${ok === false ? L('Не совсем.', 'Not quite.') : L('Как у нас принято.', 'That’s how we do it here.')}</b> ${esc(note.replace(/^(Верно|Так не надо|Это фишинг|Correct|Right|Not like this|Don't do this|Don’t do this|That's phishing|That’s phishing|This is phishing)[:.]\s*/, ''))}`;
    el.classList.remove('on', 'long'); void el.offsetWidth; el.classList.add('on', 'long');
    return;
  }
  const [g, stat] = reactionGroup(card.who), R = REACTIONS[g];
  const v = eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0);
  const mood = (v >= 0 ? 'pos' : 'neg') + (Math.abs(v) >= 20 && R[(v >= 0 ? 'pos' : 'neg') + 'Big'] ? 'Big' : '');
  const el = $('react');
  el.style.setProperty('--rc', R.color);
  el.innerHTML = `${portraitHtml(card.who, 'mini')}<span><b>${g === 'self' ? R.name : esc(card.who)}</b> ${esc(rnd(R[mood]))}</span>`;
  setMood(el.querySelector('.face'), speakerMood(card, eff, side));
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
}

function choose(side) {
  if (busy || splashOn || !S) return;
  busy = true; sfx.swipe?.(); sfx.stapler(); buzz('tap');
  const card = $('card'), dir = side === 'left' ? -1 : 1, c = current();
  card.style.transition = RM.matches ? 'opacity .12s' : `transform .38s ${EASE}, opacity .38s`;
  if (!RM.matches) card.style.transform = `translateX(${dir * 1100}px) rotate(${dir * 26}deg)`;
  card.style.opacity = '0';
  $('coach').hidden = true;
  setTimeout(() => {
    const { eff, blocked } = effectsOf(side);
    for (const b of blocked) { S.used.push(b.item); toast(L(`${ITEMS[b.item].name}: удар по шкале «${resName(b.stat)}» отменён`, `${ITEMS[b.item].name}: hit to ${resName(b.stat)} blocked`)); sfx.item(); FX.shield(ITEMS[b.item].name, b.stat); }
    for (const [k, v] of Object.entries(eff)) S.res[k] = clamp(S.res[k] + v);
    if (Object.values(eff).some(v => v <= -15)) sfx.sigh();
    if (RES.some(r => S.res[r.k] <= 15 || S.res[r.k] >= 85)) buzz('danger');
    if (c.id === 'rnd_cake' && side === 'right') S.flags.cake = true;
    // цепочка: решение вернётся в другой день недели
    const ch = CHAINS.find(x => x.from === c.id && x.side === side), at = ch && slotOf(ch.at.day, ch.at.phase);
    if (ch && at > S.step) S.deck[at] = { id: ch.card.id, time: slotTime(at), fixed: true, origin: ch.origin };
    const pc = POOL_CHAINS.find(x => x.from === c.id && x.side === side), pat = pc && Math.min(WEEK_LEN - 1, S.step + Math.round(pc.after * PER_DAY / 3));
    if (pc && pat > S.step && !S.deck[pat].origin) S.deck[pat] = { id: pc.card.id, time: slotTime(pat), fixed: true, origin: pc.origin };
    clearPreview(); renderBars(); react(c, eff, side); FX.stats(eff); castAfter(c, side, eff); livePick(c, side); deadlineWork(c, side); bus.emit('answer', { card: c, side, eff });
    let deadLow = RES.find(r => S.res[r.k] <= 0), deadHigh = RES.find(r => S.res[r.k] >= 100), dead = deadLow || deadHigh;
    // первые недели карьеры: раз в неделю бесплатный «кофе» — шкала останавливается на 5% (95%), вопрос и реклама остаются на потом
    if (dead && S.mode === 'career' && DIFF[S.diff]?.save && !S.coffeeUsed) {
      S.coffeeUsed = true; S.res[dead.k] = deadLow ? 5 : 95; renderBars(); sfx.item();
      toast(L(`☕ Вас спас кофе — ещё шанс. «${dead.name}» держится на ${S.res[dead.k]}%`, `☕ Coffee saved you — one more chance. ${dead.name} holds at ${S.res[dead.k]}%`));
      deadLow = deadHigh = dead = null;
    }
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    if (dead) FX.finale(dead.k, !deadLow);
    const pause = FX.off ? 650 : 1150;  // успеть показать взрыв шкалы или её угасание
    if (dead && !S.chanceUsed && QUIZ.length) { setTimeout(() => secondChance(dead.k, !deadLow), pause); return; }  // второй шанс — раз в неделю
    if (dead) {  // busy остаётся до следующей недели
      best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save);
      const fire = () => lose(dead.k, !deadLow);
      setTimeout(() => adRescue(dead.k, !deadLow, () => { if (!window.groupOffer?.(fire)) fire(); }), pause);  // сначала — реклама «последний шанс»  // не в группе Telegram — сначала предложить вступить
      return;
    }
    advance();
  }, RM.matches ? 120 : 380);
}
// ---------- дедлайны: задача с наградой и штрафом ----------
// Утром иногда приходит задача: «сделать N рабочих решений до вечера такого-то дня». Рабочее решение — ответ, который
// радует Босса или стоит Энергии (на ответах значок 📋+1). Успели — премия на счёт, не успели к вечеру срока — штраф со счёта.
// Отказаться можно; задача одна за раз, предложений — не больше двух в неделю. Только в карьере.
// День — 5 карточек: до срока 5/10/15/20 карточек; нужно ~85–90% из них (с запасом в одну-две карточки)
const DEADLINE_TIERS = [
  { days: 0, need: 4,  reward: 6,  fine: 4,  name: L('срочный', 'urgent') },
  { days: 1, need: 9,  reward: 10, fine: 5,  name: L('короткий', 'short') },
  { days: 2, need: 13, reward: 15, fine: 8,  name: L('средний', 'medium') },
  { days: 3, need: 18, reward: 24, fine: 12, name: L('крупный', 'big') },
];
const DEADLINE_TASKS = EN ? [
  ['Boss', 'Quarterly report'], ['Client', 'Landing page for the launch'], ['CEO', 'Investor pitch deck'], ['Accounting', 'Close out the expense reports'],
  ['HR', 'Onboarding plan for the new hires'], ['Sales', 'Proposal for a big client'], ['Marketing', 'Newsletter for the big sale'], ['IT', 'Migrate the old spreadsheets'],
  ['Partner', 'Contract with all the redlines'], ['Boss', 'Summary for the board'], ['Client', 'One more “tiny” change'], ['Project manager', 'Plan for next quarter'],
] : [
  ['Босс', 'Квартальный отчёт'], ['Клиент', 'Лендинг к запуску'], ['Генеральный', 'Презентация для инвесторов'], ['Бухгалтерия', 'Закрыть авансовые отчёты'],
  ['HR', 'План онбординга для новичков'], ['Отдел продаж', 'КП для крупного клиента'], ['Маркетинг', 'Рассылка к распродаже'], ['IT', 'Переезд старых таблиц'],
  ['Партнёр', 'Договор со всеми правками'], ['Босс', 'Сводка для совета директоров'], ['Клиент', 'Ещё одна «маленькая» правка'], ['Менеджер проекта', 'План на следующий квартал'],
];
const workAnswer = (c, side) => { const e = c?.answers?.[side]?.effects || {}; return (e.boss || 0) > 0 || (e.energy || 0) < 0; };
const dueText = d => L(`до ${['понедельника', 'вторника', 'среды', 'четверга', 'пятницы'][d]}, 18:00`, `by ${dayName(d)}, 6 PM`);
function deadlineBadges(c) {
  for (const [side, id] of [['left', 'btnL'], ['right', 'btnR']]) {
    $(id).querySelector('.dl-badge')?.remove();
    if (S?.deadline && workAnswer(c, side)) $(id).insertAdjacentHTML('beforeend', `<span class="dl-badge" title="${L('Этот ответ засчитается в задачу', 'This answer counts toward your task')}">📋 ${L('в задачу', 'counts')}</span>`);
  }
  renderDeadlineChip();
}
// Шкала в опасной зоне (≤20% или ≥80%), а ответ толкает её дальше к краю — на ответе метка «⚠ Кукуха».
// Только то, что уже видно по стрелкам ▲/▼: без чисел; удар, который погасит предмет (◆), и скрытый Босс не помечаются
function answerWarn() {
  if (!S?.deck?.[S.step]) return;
  const hide = WEEK_TYPES[S.type].rules.hideBoss;
  for (const [side, id] of [['left', 'btnL'], ['right', 'btnR']]) {
    const b = $(id), { eff } = effectsOf(side);
    b.querySelector('.dz-badge')?.remove();
    const bad = RES.filter(r => !(hide && r.k === 'boss') && (S.res[r.k] <= 20 && eff[r.k] < 0 || S.res[r.k] >= 80 && eff[r.k] > 0));
    b.classList.toggle('dz', bad.length > 0);
    if (!bad.length) continue;
    const why = bad.map(r => `${r.name} ${S.res[r.k] <= 20 ? L('ближе к 0%', 'closer to 0%') : L('ближе к 100%', 'closer to 100%')}`).join(', ');
    b.insertAdjacentHTML('beforeend', `<span class="dz-badge" title="${esc(why)}"><span aria-hidden="true">⚠ </span>${bad.length > 1 ? L(`${bad.length} шкалы`, `${bad.length} meters`) : bad[0].name}<span class="sr">: ${esc(why)}</span></span>`);
  }
}
// Полоска задачи над карточкой: что сделать, сколько осталось, до когда и какой ответ на этой карточке засчитается
function renderDeadlineChip() {
  const el = $('dlBar'), d = S?.mode === 'career' && S.deadline;
  $('dlChip').hidden = true;
  el.hidden = !d; if (!d) return;
  const c = current(), l = workAnswer(c, 'left'), r = workAnswer(c, 'right');
  const here = l && r ? L('тут засчитаются оба ответа', 'both answers count here') : l ? L('← в задачу засчитается левый ответ', '← the left answer counts') : r ? L('в задачу засчитается правый ответ →', 'the right answer counts →') : L('на этой карточке рабочего ответа нет', 'no work answer on this card');
  el.innerHTML = `<span class="dl-top"><b>📋 ${esc(d.title)}</b><span class="dl-n">${d.got}/${d.need}</span><span class="dl-due">${dueText(d.due)}</span></span>
    <span class="dl-prog"><i style="width:${Math.round(d.got / d.need * 100)}%"></i></span>`;
  el.title = here;
  el.onclick = () => toast(L(`${here}. «${d.title}» (${d.who}): ещё ${d.need - d.got} отв. со значком 📋 ${dueText(d.due)}. Успеете — +${money(d.reward)}, нет — −${money(d.fine)}`,
    `${here}. “${d.title}” (${d.who}): ${d.need - d.got} more 📋 answers ${dueText(d.due)}. Make it — +${money(d.reward)}, miss it — −${money(d.fine)}`));
}
function deadlineOffer() {
  if (!(S?.mode === 'career' && C) || S.deadline || S.step % PER_DAY || S.dlAsked === S.step || (S.dlOffers || 0) >= 2) return;
  S.dlAsked = S.step;
  const day = S.step / PER_DAY, rnd = Math.random;
  if (!S.forceDeadline && rnd() > (S.step ? .4 : .25)) return;  // forceDeadline — аватар попросил «задачу на премию»
  S.forceDeadline = false;
  const tiers = DEADLINE_TIERS.filter(t => day + t.days <= 4), t = tiers[Math.floor(rnd() * tiers.length)];
  const [who, title] = t.days ? DEADLINE_TASKS[Math.floor(rnd() * (DEADLINE_TASKS.length - 1))] : DEADLINE_TASKS[10];
  S.dlOffers = (S.dlOffers || 0) + 1;
  setTimeout(() => { if (S && !busy && !views.game.hidden && S.step === day * PER_DAY) showDeadlineOffer({ who, title, need: t.need, got: 0, due: day + t.days, reward: t.reward, fine: t.fine, tier: t.name }); }, splashOn ? 4600 : 2100);
}
function showDeadlineOffer(d) {
  const m = $('modal');
  if (!m.hidden) return;
  m.innerHTML = `<div class="modal-box glass dl-box" role="dialog" aria-modal="true" aria-labelledby="dlTitle">
    <span class="dl-kicker">📋 ${L('Дедлайн', 'Deadline')} · ${d.tier} · ${L('от', 'from')}: ${esc(d.who)}</span>
    <h2 id="dlTitle">${esc(d.title)}</h2>
    <ol class="dl-how">${L(`<li>Отвечайте на карточки как обычно.</li><li>На «рабочих» ответах — взяться, задержаться, помочь Боссу — будет значок <span class="nowrap">📋 в задачу</span>.</li><li>Выберите <b>${d.need} таких ответов ${dueText(d.due)}</b> — счётчик над карточкой.</li>`,
      `<li>Answer cards as usual.</li><li>“Work” answers — take it on, stay late, help the Boss — carry a <span class="nowrap">📋 counts</span> badge.</li><li>Pick <b>${d.need} of those ${dueText(d.due)}</b> — the counter is above the card.</li>`)}</ol>
    <p class="dl-warn">${L('Рабочие ответы стоят сил и нервов — следите за шкалами.', 'Work answers cost energy and nerves — watch your meters.')}</p>
    <div class="money"><div><b>+${money(d.reward)}</b><span>${L('премия, если успеете', 'bonus if you make it')}</span></div><div><b>−${money(d.fine)}</b><span>${L('штраф, если сорвёте', 'penalty if you miss it')}</span></div></div>
    <div class="row2"><button class="btn-main" type="button" id="dlYes">${L('Взять задачу', 'Take it on')}</button><button class="btn-ghost" type="button" id="dlNo">${L('Отказаться', 'Decline')}</button></div></div>`;
  m.hidden = false; sfx.item?.();
  $('dlYes').onclick = () => {
    m.hidden = true; S.deadline = d; S.dlTaken = (S.dlTaken || 0) + 1; store.set(KEY.save, S);
    deadlineBadges(current()); toast(L(`Задача взята: «${d.title}» — ${d.need} раб. решений ${dueText(d.due)}`, `Task accepted: “${d.title}” — ${d.need} work decisions ${dueText(d.due)}`));
  };
  $('dlNo').onclick = () => { m.hidden = true; toast(L(`Вы отказались. «${d.title}» отдали Олегу`, `You passed. “${d.title}” went to Oleg`)); };
}
// После ответа: рабочее решение — +1; набрали нужное — премия сразу
function deadlineWork(c, side) {
  const d = S?.deadline;
  if (!d || !workAnswer(c, side)) return;
  d.got++;
  if (d.got < d.need) { toast(L(`📋 +1 к задаче «${d.title}»: ${d.got} из ${d.need}`, `📋 +1 to “${d.title}”: ${d.got} of ${d.need}`)); renderDeadlineChip(); return; }
  S.deadline = null; S.dlWon = (S.dlWon || 0) + 1; bus.emit('deadlineDone', d);
  d.reward = Math.round(d.reward * (1 + (typeof rankPerk === 'function' ? rankPerk('deadline') : 0)));
  pay(d.reward); S.earned = (S.earned || 0) + d.reward; renderBars(); renderDeadlineChip(); FX.coin(d.reward); sfx.coins();
  setTimeout(() => adDouble(d.reward, L('Премия за задачу', 'Task bonus')), 3600);
  smsPop(L('Банк', 'Bank'), L(`Премия за «${d.title}»: +${money(d.reward)} · баланс ${money(C.bank)}`, `Bonus for “${d.title}”: +${money(d.reward)} · balance ${money(C.bank)}`));
}
// Вечер дня сдачи прошёл, а задача не сделана — штраф
function deadlineDue(day) {
  const d = S?.deadline;
  if (!d || day < d.due) return;
  S.deadline = null; S.dlLost = (S.dlLost || 0) + 1;
  C.bank -= d.fine; C.spent = (C.spent || 0) + d.fine; saveCareer(); renderBars(); renderDeadlineChip();
  setTimeout(() => { sfx.sigh?.(); buzz('danger');
    smsPop(L('Банк', 'Bank'), L(`Штраф за сорванный дедлайн «${d.title}» (${d.got}/${d.need}): −${money(d.fine)} · баланс ${money(C.bank)}`,
      `Penalty for missing “${d.title}” (${d.got}/${d.need}): −${money(d.fine)} · balance ${money(C.bank)}`)); }, 3600);
}

// Уведомление как SMS на телефоне: сверху, само исчезает
let smsT = 0;
function smsPop(from, text) {
  const el = $('smsPop');
  el.innerHTML = `<span class="sms-ico" aria-hidden="true">🏦</span><span class="sms-body"><b>${esc(from)}</b><small>${L('сейчас', 'now')}</small><span>${esc(text)}</span></span>`;
  el.hidden = false; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  setTimeout(() => sfx.sms(), 350);
  clearTimeout(smsT); smsT = setTimeout(() => { el.hidden = true; }, 3400);
  el.onclick = () => { el.hidden = true; };
}
// Переход к следующей карточке (или к финалу недели)
function advance() {
  const best = store.get(KEY.best, { step: 0, wins: 0 });
  S.step++;
  if (S.mode === 'career' && C && S.step % PER_DAY === 0) {  // вечер прошёл — рабочий день оплачен
    const sal = C.salary + (typeof rankPerk === 'function' ? rankPerk('salary') : 0);
    pay(sal); S.earned = (S.earned || 0) + sal; renderBars(); FX.coin(sal); sfx.coins();
    smsPop(L('Банк', 'Bank'), L(`Зачислена зарплата за ${['понедельник', 'вторник', 'среду', 'четверг', 'пятницу'][S.step / PER_DAY - 1]}: +${money(sal)} · баланс ${money(C.bank)}`,
      `${dayName(S.step / PER_DAY - 1)} salary deposited: +${money(sal)} · balance ${money(C.bank)}`));
    deadlineDue(S.step / PER_DAY - 1);
  }
  best.step = Math.max(best.step, S.step);
  if (S.step >= WEEK_LEN) { best.wins++; store.set(KEY.best, best); store.del(KEY.save); setTimeout(win, 550); return; }
  store.set(KEY.best, best); if (S.mode === 'career') store.set(KEY.save, S);
  renderCard(); busy = false;
}

// ---------- магазин мощей: деньги со счёта → предметы и подкрутка шкал ----------
const SHOP = { coffee: 6, headphones: 6, cookies: 6, sicknote: 9 };
const powerPrice = () => 12 * 2 ** (S.powerBuys || 0);
function openShop() {
  if (!(S?.mode === 'career' && C) || busy || splashOn) return;
  const m = $('modal');
  const render = () => {
    m.innerHTML = `<div class="modal-box glass shop-box" role="dialog" aria-modal="true" aria-labelledby="shopTitle">
      <h2 id="shopTitle">${L('Магазин мощей', 'Power Shop')}</h2>
      <p class="shop-bal">${L('На счёте', 'Balance')}: <b>${money(C.bank)}</b> · ${L(`оклад ${money(C.salary)}/день`, `pay ${money(C.salary)}/day`)} ${topupBtn(0, 'shop')} ${adChip()}</p>
      <span class="shop-sec">${L('Предметы — гасят один удар −10 и сильнее', 'Items — each blocks one hit of −10 or worse')}</span>
      <div class="shop-list">${Object.entries(SHOP).map(([id, price]) => `<button class="shop-item${C.bank < price ? ' short' : ''}" data-item="${id}" ${S.items.length >= 6 ? 'disabled' : ''} ${C.bank < price ? `data-topup="${lackOf(price)}" data-topup-back="shop"` : ''}>
        <b>${ITEMS[id].name}</b><small>${ITEMS[id].text}</small><span class="price">${C.bank < price ? `💰 ${L('не хватает', 'short')} ${lackOf(price)}` : money(price)}</span></button>`).join('')}</div>
      <span class="shop-sec">${L('Мощь +20% — шкала отходит от края на 20 пунктов', 'Power +20% — pulls a meter 20 points back from the edge')}</span>
      <div class="shop-list">${RES.map(r => `<button class="shop-item${C.bank < powerPrice() ? ' short' : ''}" data-power="${r.k}" ${Math.abs(S.res[r.k] - 50) < 5 ? 'disabled' : ''} ${C.bank < powerPrice() ? `data-topup="${lackOf(powerPrice())}" data-topup-back="shop"` : ''}>
        <b>${r.name} ${S.res[r.k]}% → ${S.res[r.k] > 50 ? Math.max(50, S.res[r.k] - 20) : Math.min(50, S.res[r.k] + 20)}%</b><span class="price">${C.bank < powerPrice() ? `💰 ${L('не хватает', 'short')} ${lackOf(powerPrice())}` : money(powerPrice())}</span></button>`).join('')}</div>
      <span class="shop-sec">${L('Банк', 'Bank')}</span>
      <div class="shop-list"><button class="shop-item" id="loanBtn" ${C.loan ? 'disabled' : ''}><b>${L('Кредит +20 у.е.', 'Loan +$20')}</b><small>${C.loan ? L(`осталось вернуть ${C.loan} у.е.`, `$${C.loan} left to repay`) : L('вернуть 24 у.е. — по 6 в неделю', 'repay $24 — $6 a week')}</small><span class="price">${L('сразу на счёт', 'cash right now')}</span></button></div>
      <p class="field-note">${L('Каждая следующая «мощь» на этой неделе вдвое дороже. Каждую неделю списываются расходы на жильё и еду — 4 у.е. Хотите оклад выше — сдайте 📜 аттестацию.', 'Each extra “power” this week costs twice as much. Every week, rent and food cost $4. Want a raise? Pass the 📜 certification.')}</p>
      <button class="btn-ghost" id="shopClose">${L('Закрыть', 'Close')}</button></div>`;
    m.querySelectorAll('[data-item]').forEach(b => b.onclick = () => {
      const id = b.dataset.item; if (C.bank < SHOP[id]) return; C.bank -= SHOP[id]; S.items.push(id); saveCareer(); store.set(KEY.save, S); sfx.item(); bus.emit('buy', id);
      toast(L(`Куплено: ${ITEMS[id].name}`, `Bought: ${ITEMS[id].name}`)); renderBars(); render();
    });
    m.querySelectorAll('[data-power]').forEach(b => b.onclick = () => {
      const k = b.dataset.power, v = S.res[k];
      if (C.bank < powerPrice()) return;
      C.bank -= powerPrice(); S.powerBuys = (S.powerBuys || 0) + 1;
      S.res[k] = v > 50 ? Math.max(50, v - 20) : Math.min(50, v + 20);
      saveCareer(); store.set(KEY.save, S); sfx.item(); toast(L(`«${resName(k)}»: ${v}% → ${S.res[k]}%`, `${resName(k)}: ${v}% → ${S.res[k]}%`)); renderBars(); render();
    });
    $('shopClose').onclick = () => { m.hidden = true; };
    $('loanBtn').onclick = () => { if (C.loan) return; C.bank += 20; C.loan = 24; saveCareer(); sfx.item(); toast(L('Кредит выдан: +20 у.е.', 'Loan approved: +$20')); renderBars(); render(); };
  };
  render(); m.hidden = false;
  m.onclick = e => { if (e.target === m) m.hidden = true; };
}
$('bankChip').onclick = openShop;

// ---------- выйти из недели в меню ----------
// Карьера сохраняется на текущей карточке — «Играть» продолжит; неделя дня, турнир и брендированная неделя не сохраняются
// Закрыли вкладку или свернули приложение посреди недели — сохранить карьеру на текущей карточке.
// Пока карточка улетает или идёт увольнение (busy), не сохраняем: там шкалы уже сдвинуты, а шаг ещё нет
function saveWeekNow() { if (S?.mode === 'career' && C && !busy && !views.game.hidden && store.get(KEY.save, null)) store.set(KEY.save, S); }
addEventListener('pagehide', saveWeekNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveWeekNow(); });
function leaveWeek() {
  clearTimeout(splashT); splashOn = false; $('splash').hidden = true; $('modal').hidden = true;
  busy = false; renderMenu();
}
$('gExit').onclick = () => {
  if (!S || busy) return;  // пока карточка улетает — дождаться следующей
  if (S.mode === 'career') { store.set(KEY.save, S); leaveWeek(); toast(L('Неделя сохранена — «Играть» продолжит с этой карточки', 'Week saved — hit “Play” to pick up from this card')); return; }
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass" role="dialog" aria-modal="true" aria-labelledby="exTitle"><h2 id="exTitle">${L('Выйти из недели?', 'Leave this week?')}</h2>
    <p>${S.mode === 'daily' ? L('Неделя дня не сохраняется: если выйти, начать её можно будет заново, но в зачёт идёт только первая законченная попытка.', 'The Daily Week isn’t saved: you can start it over, but only your first finished attempt counts.') : L('Эта неделя не сохраняется — придётся начать её заново.', 'This week isn’t saved — you’ll have to start over.')}</p>
    <div class="row2"><button class="btn-main" type="button" id="exStay">${L('Остаться', 'Stay')}</button><button class="btn-ghost" type="button" id="exGo">${L('Выйти в меню', 'Quit to menu')}</button></div></div>`;
  m.hidden = false;
  $('exStay').onclick = () => { m.hidden = true; };
  $('exGo').onclick = leaveWeek;
  m.onclick = e => { if (e.target === m) m.hidden = true; };
};

// ---------- подсказка за 2 у.е.: какой ответ лучше держит баланс ----------
// Предлагается сама, когда шкала у края (не чаще раза в игровой день), и всегда — по кнопке «Подсказка» у счёта
const HINT_BASE = 2;
const hintPriceNow = () => Math.max(1, HINT_BASE - (typeof rankPerk === 'function' ? rankPerk('hint') : 0));
const hintFree = () => (prefs.freeHints || 0) > 0;  // бесплатные подсказки из магазина (js/shop.js): Стартовый набор, сезон, наборы
// Чем дальше самая слабая шкала от 0 и 100 после ответа, тем ответ безопаснее; конец недели — хуже всего
function hintScore(side) {
  const { eff } = effectsOf(side), after = RES.map(r => ({ k: r.k, v: clamp(S.res[r.k] + (eff[r.k] || 0)) }));
  const weak = after.reduce((a, b) => Math.min(b.v, 100 - b.v) < Math.min(a.v, 100 - a.v) ? b : a);
  const edge = Math.min(weak.v, 100 - weak.v);
  return { side, weak, edge: edge <= 0 ? -1 : edge, spread: after.reduce((n, x) => n + Math.abs(x.v - 50), 0) };
}
function hintAdvice() {
  const [a, b] = ['left', 'right'].map(hintScore);
  const best = a.edge !== b.edge ? (a.edge > b.edge ? a : b) : a.spread !== b.spread ? (a.spread < b.spread ? a : b) : null;
  return best;
}
function cardTools() {
  const el = $('ctools'); if (!el) return;
  const got = S.hintStep === S.step;
  el.className = 'card-tools';
  el.innerHTML = `<button class="ct-btn ct-hint${got ? ' done' : ''}" type="button" id="ctHint" ${got ? 'disabled' : ''}>💡 ${L('Подсказка', 'Hint')} <b>${got ? '✓' : hintFree() ? `🎟️×${prefs.freeHints}` : money(hintPriceNow())}</b></button>
    <button class="ct-btn ct-shop" type="button" id="ctShop">🛒 ${L('Магазин', 'Shop')} <b id="ctBank">${money(C.bank)}</b></button>`;
  $('ctHint').onclick = () => hintBar();
  $('ctShop').onclick = openShop;
}
function hintBar() {
  const el = $('ctools');
  if (!el || !(S?.mode === 'career' && C) || busy || splashOn || S.hintStep === S.step) return;
  // то же место, что у кнопок: «Получить» и «Отказаться», без сдвига карточки; почему — видно по шкале «на грани»
  const can = hintFree() || C.bank >= hintPriceNow();
  el.className = 'card-tools ask';
  el.innerHTML = (can ? `<button class="ct-btn ct-hint" type="button" id="hbYes">💡 ${L('Получить', 'Get it')} <b>${hintFree() ? L(`🎟️ бесплатно · ${prefs.freeHints}`, `🎟️ free · ${prefs.freeHints}`) : money(hintPriceNow())}</b></button>`
    : `<button class="ct-btn ct-hint" type="button" id="hbYes" data-topup="${lackOf(hintPriceNow())}" data-topup-back="tools" data-topup-why="${esc(L(`Подсказка стоит ${money(hintPriceNow())} · на счёте ${money(C.bank)}`, `A hint costs ${money(hintPriceNow())} · you have ${money(C.bank)}`))}">💰 ${L('Пополнить', 'Top up')} <b>${L(`не хватает ${lackOf(hintPriceNow())}`, `$${lackOf(hintPriceNow())} short`)}</b></button>`) + `
    <button class="ct-btn ct-no" type="button" id="hbNo">${L('Отказаться', 'No thanks')}</button>`;
  FX.pulse(el, 'on', 500);
  $('hbNo').onclick = cardTools;
  $('hbYes').onclick = () => {
    if ((!hintFree() && C.bank < hintPriceNow()) || busy) return;
    if (hintFree()) { prefs.freeHints--; store.set(KEY.prefs, prefs); } else { C.bank -= hintPriceNow(); C.spent = (C.spent || 0) + hintPriceNow(); saveCareer(); }
    renderBars(); sfx.item(); bus.emit('hint');
    const best = hintAdvice();
    S.hintStep = S.step;
    el.className = 'card-tools said';
    if (!best) { el.innerHTML = `<span class="ct-q">💡 ${L('Оба ответа примерно одинаково влияют на баланс — выбирайте по душе.', 'Both answers hit the balance about the same — go with your gut.')}</span>`; return; }
    const w = RES.find(r => r.k === best.weak.k);
    $(best.side === 'left' ? 'btnL' : 'btnR').classList.add('tip');
    el.innerHTML = `<span class="ct-q">💡 ${L('Лучше', 'Better go')} <b>${best.side === 'left' ? L('← влево', '← left') : L('вправо →', 'right →')}</b> · ${best.edge < 0 ? L('но и он заканчивает неделю', 'but it still ends your week') : L(`${w.name} станет ${best.weak.v}%`, `${w.name} ends up at ${best.weak.v}%`)}</span>`;
  };
}
// Сама предлагает подсказку, когда шкала у края: раз в игровой день; не хватает денег — с кнопкой «Пополнить»
function hintOffer() {
  if (!(S?.mode === 'career' && C) || prefs.hintOff) return;  // без денег — предложит пополнить
  const day = dayOf(S.step);
  if (S.hintDay === day || !RES.some(r => S.res[r.k] <= 20 || S.res[r.k] >= 80)) return;
  S.hintDay = day;
  setTimeout(() => { if (S && !busy) hintBar(); }, 700);
}

// ---------- второй шанс: вопрос на эрудицию ----------
// Шкала дошла до 0 или 100 → вопрос с 4 вариантами и 20 секундами. Верно — шкала отступает от края на 20%, неделя продолжается
const QUIZ_TIME = 20;
function pickQuestion() {
  let seen = new Set(store.get(KEY.qseen, []));
  let left = QUIZ.filter(q => !seen.has(q.id));
  if (!left.length) { seen = new Set(); left = QUIZ; }  // все вопросы заданы — круг начинается заново
  const q = rnd(left); seen.add(q.id); store.set(KEY.qseen, [...seen]);
  return q;
}
function secondChance(k, high) {
  S.chanceUsed = true; if (S.mode === 'career') store.set(KEY.save, S);
  const q = pickQuestion(), el = $('quiz');
  el.innerHTML = `<div class="quiz-box">
    <span class="kicker">${L('Второй шанс', 'Second chance')} · ${resName(k)} ${high ? '100' : '0'}%</span>
    <h2 id="quizTitle">${L('Вопрос на эрудицию', 'Trivia time')}</h2>
    <p class="q-lead">${L(`Ответьте верно — и шкала «${resName(k)}» отступит от края на 20%. Ошибка — увольнение.`, `Get it right and ${resName(k)} pulls back 20% from the edge. Get it wrong and you’re out.`)}</p>
    <span class="q-topic">${esc(q.topic)}</span>
    <div class="q-text">${esc(q.q)}</div>
    <div class="q-timer" aria-hidden="true"><i id="qBar"></i></div>
    <div class="q-opts">${q.options.map((o, i) => `<button class="q-opt" data-i="${i}"><span class="n">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div id="qAfter" hidden><p class="q-result" id="qRes"></p><p class="q-fact">${esc(q.fact)}</p><div class="stack" style="margin-top:12px"><button class="btn-main" id="qNext"></button></div></div>
  </div>`;
  el.hidden = false; sfx.sigh();
  const bar = $('qBar'); bar.style.setProperty('--qt', QUIZ_TIME + 's'); void bar.offsetWidth; bar.classList.add('run');
  const btns = [...el.querySelectorAll('.q-opt')];
  let done = false;
  const finish = picked => {
    if (done) return; done = true; clearTimeout(timer); document.removeEventListener('keydown', keys); document.removeEventListener('visibilitychange', onVis);
    const ok = picked === q.answer;
    btns.forEach((b, i) => { b.disabled = true; if (i === q.answer) b.classList.add('right'); else if (i === picked) b.classList.add('wrong'); });
    bar.style.animationPlayState = 'paused';
    $('qRes').className = 'q-result ' + (ok ? 'ok' : 'bad');
    $('qRes').textContent = ok ? L(`Верно! «${resName(k)}» отступает от края на 20%.`, `Correct! ${resName(k)} pulls back 20% from the edge.`) : picked === -1 ? L(`Время вышло. Правильный ответ: «${q.options[q.answer]}».`, `Time’s up. The answer was “${q.options[q.answer]}”.`) : L(`Неверно. Правильный ответ: «${q.options[q.answer]}».`, `Wrong. The answer was “${q.options[q.answer]}”.`);
    $('qNext').textContent = ok ? L('Продолжить неделю', 'Back to the week') : L('Принять судьбу', 'Accept your fate');
    $('qAfter').hidden = false; $('qNext').focus({ preventScroll: true });
    ok ? sfx.item() : sfx.stamp();
    track('quiz', { won: ok, card: q.id, mode: S.mode });
    $('qNext').onclick = () => {
      el.hidden = true;
      if (ok) {
        S.res[k] = high ? 80 : 20; S.flags.saved = true;
        const got = unlock(['quiz_saved']); if (got.length) toast(L(`Новая концовка: «${got[0].title}»`, `New ending: “${got[0].title}”`));
        renderBars(); advance();
      } else {
        unlock(['quiz_fail']);
        const best = store.get(KEY.best, { step: 0, wins: 0 });
        best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save);
        const fire = () => lose(k, high);
        adRescue(k, high, () => { if (!window.groupOffer?.(fire)) fire(); });
      }
    };
  };
  // таймер с паузой: если свернуть приложение, время не идёт
  let left = QUIZ_TIME * 1000, startedAt = Date.now(), timer = setTimeout(() => finish(-1), left);
  const onVis = () => {
    if (done) return document.removeEventListener('visibilitychange', onVis);
    if (document.hidden) { clearTimeout(timer); left -= Date.now() - startedAt; bar.style.animationPlayState = 'paused'; }
    else { startedAt = Date.now(); timer = setTimeout(() => finish(-1), Math.max(0, left)); bar.style.animationPlayState = 'running'; }
  };
  document.addEventListener('visibilitychange', onVis);
  const keys = e => { const n = +e.key; if (n >= 1 && n <= 4) { e.preventDefault(); finish(n - 1); } };
  document.addEventListener('keydown', keys);
  btns.forEach(b => b.onclick = () => finish(+b.dataset.i));
  btns[0].focus({ preventScroll: true });
}

// свайп: превью после 40 px, выбор после 140 px (на узком экране — после 30 % ширины)
(() => {
  const card = $('card'); let x0 = 0, dx = 0, t0 = 0, drag = false, pid = null;
  card.addEventListener('pointerdown', e => {
    if (busy || splashOn || e.target.closest('.card-tools')) return; drag = true; pid = e.pointerId; x0 = e.clientX; dx = 0; t0 = performance.now();
    card.setPointerCapture(pid); card.style.transition = 'border-color .2s, box-shadow .2s'; card.classList.remove('idle');
  });
  card.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== pid) return;
    dx = e.clientX - x0;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    if (Math.abs(dx) > 40) preview(dx < 0 ? 'left' : 'right'); else clearPreview();
    if (Math.abs(dx) > 20) FX.stamp(dx < 0 ? 'left' : 'right', (Math.abs(dx) - 20) / Math.min(140, innerWidth * .3));
  });
  const end = e => {
    if (!drag || e.pointerId !== pid) return; drag = false;
    const limit = Math.min(140, innerWidth * .3), v = Math.abs(dx) / Math.max(1, performance.now() - t0);
    if (Math.abs(dx) > limit || (Math.abs(dx) > 50 && v > .7)) { choose(dx < 0 ? 'left' : 'right'); return; }
    card.style.transition = `transform .3s ${EASE}, border-color .2s, box-shadow .2s`; card.style.transform = ''; clearPreview(); card.classList.add('idle');
  };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
})();

for (const [id, side] of [['btnL', 'left'], ['btnR', 'right']]) {
  const b = $(id);
  b.addEventListener('mouseenter', () => !busy && !splashOn && preview(side));
  b.addEventListener('focus', () => !busy && !splashOn && preview(side));
  b.addEventListener('mouseleave', clearPreview);
  b.addEventListener('blur', clearPreview);
  b.addEventListener('click', () => choose(side));
}
document.addEventListener('keydown', e => {
  if (views.game.hidden || !$('modal').hidden) return;
  if (splashOn && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== 'Tab') { e.preventDefault(); $('splash').click(); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); choose('left'); }
  if (e.key === 'ArrowRight') { e.preventDefault(); choose('right'); }
});

// ---------- финалы недели ----------
function finalGrid(zeroKey) {
  return `<div class="final">${RES.map(r => `<div class="${r.k === zeroKey ? 'zero' : ''}"><b>${S.res[r.k]}%</b><span>${r.name}</span></div>`).join('')}</div>`;
}
const viralHtml = () => `<div class="viral"><b>${L('Позовите коллег — проверим, кто дольше продержится до пятницы', 'Invite your coworkers — let’s see who makes it closer to Friday')}</b>
  <div class="row2"><button class="btn-main" data-share="team">${L('Позвать коллег', 'Invite coworkers')}</button><button class="btn-ghost" data-share="friends">${L('Рассказать друзьям', 'Tell friends')}</button></div></div>`;
function bindCommon() { bindShare(views.end); $('toMenu').onclick = renderMenu; if ($('toBoard')) $('toBoard').onclick = () => openBoard('end', S?.mode === 'daily' ? 'daily' : 'rating'); }
const traitText = (kind, trait) => TRAITS[trait || 'workaholic'][kind];
const onboardingLine = () => S.flags.obTotal ? `<div class="place"><b>${S.flags.obOk || 0}/${S.flags.obTotal}</b><span>${L('правильных решений в учебной неделе', 'right calls in the training week')}</span></div>` : '';
function rank(total) { return total >= 280 ? L('Легенда опенспейса', 'Open-Space Legend') : total >= 220 ? L('Сеньор по выживанию', 'Senior Survival Engineer') : total >= 160 ? L('Крепкий мидл', 'Solid Mid-Level') : L('Чудом уцелевший стажёр', 'Intern Who Somehow Survived'); }

function weekEndings(won, k, high) {
  const ids = [], d = dayOf(S.step);
  if (S.used.length >= 2) ids.push('items2');
  if (won) {
    const v = Object.values(S.res);
    if (v.every(x => x >= 40 && x <= 60)) ids.push('zen_week');
    if (v.some(x => x < 10 || x > 90)) ids.push('edge');
  } else {
    ids.push(high ? { boss: d === 4 ? 'boss_fri' : null, colleagues: 'party', psyche: 'zen', energy: 'battery' }[k]
      : { psyche: 'cooler', energy: 'zoom', boss: 'two_words', colleagues: 'wifi' }[k]);
    if (d === 0) ids.push('monday');
    if (S.step === WEEK_LEN - 1) ids.push('almost');
    if (S.flags.cake) ids.push('cake');
  }
  return unlock(ids);
}

function lose(k, high) {
  sfx.lose();
  const D = (high ? DEATH_HIGH : DEATH)[k], d = dayOf(S.step), ph = PHASES[slotPh(S.step)];
  const got = weekEndings(false, k, high), career = S.mode === 'career' && C;
  let next = '';
  if (career) {
    var company = C.company, comp = Math.floor(C.vacation) * C.salary, paidDays = Math.floor(S.step / PER_DAY);
    C.firings++; C.week++; C.stage = 'search'; C.res = null; C.vacation = 0;
    if (comp) pay(comp); else saveCareer();
    var exp = weekExpenses(paidDays / 5);
    next = C.week > YEAR ? L('Итоги года', 'Year in review') : L('Искать работу', 'Look for a job');
  }
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${career ? L(`Вас уволили · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()} · ${esc(company)}`, `Fired · ${dayName(d)} ${phaseName(slotPh(S.step)).toLowerCase()} · ${esc(company)}`) : L(`Неделя закончилась досрочно · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()}`, `Week ended early · ${dayName(d)} ${phaseName(slotPh(S.step)).toLowerCase()}`)}</span>
    <h1 class="lose">${high ? L('ПЕРЕГРЕВ', 'OVERHEAT') : L('НЕДЕЛЯ ЗАВАЛЕНА', 'WEEK WRECKED')}</h1>
    <p class="cause">${D.title} · ${esc(S.name)}, ${esc(prefs.profCustom && S.prof === prefs.prof ? prefs.profCustom : PROF[S.prof].name.toLowerCase())}</p>
    <p>${D.text}</p>
    <p class="trait-line">${TRAITS[S.trait || 'workaholic'].name}: ${traitText('lose', S.trait)}</p>
    ${finalGrid(k)}
    ${career ? `<div class="money"><div><b>+${money(S.earned || 0)}</b><span>${L(`за ${paidDays} отраб. дн.`, `for ${pl(paidDays, '', '', '', 'day', 'days')} worked`)}</span></div><div><b>+${money(comp)}</b><span>${L('компенсация отпуска', 'unused vacation payout')}</span></div></div>${expHtml(exp)}` : ''}
    ${endingsHtml(got)}
    ${challengeLine(false, k)}
    <div class="place" id="place" aria-live="polite">${L('Записываю результат в рейтинг…', 'Saving your score to the leaderboard…')}</div>
    ${viralHtml()}
    ${onboardingLine()}
    <div class="stack">${career ? `<button class="btn-main" id="next">${next}</button>` : `<button class="btn-main" id="next">${S.mode === 'daily' ? L('Сыграть неделю дня ещё раз', 'Replay the Daily Week') : S.mode === 'tour' ? L('Экран итогов турнира', 'Tournament results') : L('Сыграть ещё раз', 'Play again')}</button>`}
      <button class="btn-ghost btn-share" id="share">${S.mode === 'daily' ? L('Поделиться и вызвать коллег', 'Share & challenge coworkers') : L('Поделиться результатом', 'Share result')}</button>
      <button class="btn-ghost" id="toBoard">${S.mode === 'daily' ? L('Рейтинг дня', 'Daily leaderboard') : L('Рейтинг офиса', 'Office leaderboard')}</button><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
  </div>`;
  show('end'); bindCommon();
  $('share').onclick = () => share(false, k);
  $('next').onclick = () => career ? (C.week > YEAR ? yearEnd() : jobSearch()) : S.mode === 'daily' ? startDaily() : S.mode === 'tour' ? openScreen(S.tourCode) : startPack();
  record(false, k, high);
  bus.emit('weekEnd', { won: false, mode: S.mode, step: S.step, res: { ...S.res }, stat: k, high });
  track('week_end', { mode: S.mode, won: false, step: S.step, card: S.deck[S.step]?.id, detail: `${k}${high ? ':100' : ':0'}` });
  if (career) track('fired', { mode: 'career', step: S.step, detail: VACANCIES.find(v => v.name === company)?.id || '' });  // в «Ленту»: откуда (id компании) и в какой день
  $('next').focus({ preventScroll: true });
}

function win() {
  sfx.win(); FX.doors();
  const total = RES.reduce((a, r) => a + S.res[r.k], 0), got = weekEndings(true), career = S.mode === 'career' && C;
  let week, last = false;
  if (career) {
    week = C.week;
    // выходные: каждая шкала сдвигается к 50 наполовину
    C.worked++; C.week++; C.res = Object.fromEntries(RES.map(r => [r.k, Math.round((S.res[r.k] + 50) / 2)]));
    C.vacation = +(C.vacation + VAC_PER_WEEK).toFixed(2); saveCareer();
    var exp = weekExpenses();
    last = C.week > YEAR;
  }
  if (last || !career) confetti();
  const kicker = career ? L(`Неделя ${week} из ${YEAR} · ${esc(C.company)} · пятница, 18:00`, `Week ${week} of ${YEAR} · ${esc(C.company)} · Friday, 6:00 PM`) : S.mode === 'daily' ? L(`Неделя дня ${dayLabel(S.day)} · пятница, 18:00`, `Daily Week ${dayLabel(S.day)} · Friday, 6:00 PM`)
    : S.mode === 'tour' ? L(`Турнир офиса «${esc(S.tourTeam)}» · пятница, 18:00`, `Office Tournament “${esc(S.tourTeam)}” · Friday, 6:00 PM`) : `${esc(PACK.title)} · ${L('пятница, 18:00', 'Friday, 6:00 PM')}`;
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${kicker}</span>
    <h1>${last ? L('Год позади!', 'Year’s done!') : L('Неделя закрыта!', 'Week survived!')}</h1>
    <p>${traitText('win', S.trait)}</p>
    ${career && !last ? `<p class="trait-line">${L('Выходные сгладят всё наполовину: в понедельник каждая шкала сдвинется к 50%.', 'The weekend smooths things out halfway: by Monday every meter drifts back toward 50%.')}</p>` : ''}
    <span class="rank">${rank(total)}</span>
    ${finalGrid()}
    <div class="total"><span>${L('Счёт недели', 'Week score')}</span><b>${total} / 400</b></div>
    ${career ? `<div class="money"><div><b>${money(C.bank)}</b><span>${L(`на счёте (+${S.earned || 0} за неделю)`, `in the bank (+$${S.earned || 0} this week)`)}</span></div><div><b>${fmtDays(C.vacation)} ${L('дн.', 'days')}</b><span>${L('отпуска накоплено', 'vacation banked')}</span></div></div>${expHtml(exp)}` : ''}
    ${endingsHtml(got)}
    ${challengeLine(true)}
    <div class="place" id="place" aria-live="polite">${L('Записываю результат в рейтинг…', 'Saving your score to the leaderboard…')}</div>
    ${viralHtml()}
    ${onboardingLine()}
    <div class="stack"><button class="btn-main" id="next">${career ? (last ? L('Итоги года', 'Year in review') : L(`Неделя ${C.week} →`, `Week ${C.week} →`)) : S.mode === 'tour' ? L('Экран итогов турнира', 'Tournament results') : L('В главное меню', 'Main menu')}</button>
      ${career && !last && certCan(C) ? `<button class="btn-ghost btn-cert" id="certEnd">📜 ${L(`Хочу зарабатывать больше: аттестация (${money(C.salary)} → ${money(certNextPay(C))})`, `Earn more: take the exam (${money(C.salary)} → ${money(certNextPay(C))})`)}</button>` : ''}
      ${career && !last && C.vacation >= 7 ? `<button class="btn-ghost btn-vac" id="vac">${L('Уйти в отпуск на неделю (7 дн.)', 'Take a week off (7 days)')}</button>` : ''}
      <button class="btn-ghost btn-share" id="share">${S.mode === 'daily' ? L('Поделиться и вызвать коллег', 'Share & challenge coworkers') : L('Поделиться результатом', 'Share result')}</button>
      <button class="btn-ghost" id="toBoard">${S.mode === 'daily' ? L('Рейтинг дня', 'Daily leaderboard') : L('Рейтинг офиса', 'Office leaderboard')}</button><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
  </div>`;
  show('end'); bindCommon();
  $('share').onclick = () => share(true);
  if ($('vac')) $('vac').onclick = takeVacation;
  if ($('certEnd')) $('certEnd').onclick = () => certStart(() => { const b = $('certEnd'); if (b) b.remove(); });
  $('next').onclick = () => career ? (last ? yearEnd() : startWeek()) : S.mode === 'tour' ? openScreen(S.tourCode) : renderMenu();
  record(true, null, false);
  bus.emit('weekEnd', { won: true, mode: S.mode, step: WEEK_LEN, res: { ...S.res } });
  track('week_end', { mode: S.mode, won: true, step: WEEK_LEN });
  $('next').focus({ preventScroll: true });
}

// Поиск работы: три вакансии, кроме места, откуда только что уволили
function jobSearch() {
  if (C.week > YEAR) return yearEnd();
  if (!C.offers?.length) { C.offers = shuffle(VACANCIES.filter(v => v.name !== C.company)).slice(0, 3).map(v => v.id); saveCareer(); }
  const perkText = p => Object.entries(p).map(([k, v]) => `${resName(k)} ${v > 0 ? '+' : '−'}${Math.abs(v)}`).join(' · ');
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${L(`Неделя ${C.week} из ${YEAR} · поиск работы`, `Week ${C.week} of ${YEAR} · job hunt`)}</span>
    <h1>${L('Вакансии', 'Openings')}</h1>
    <p>${L('Выберите, куда откликнуться. Собеседование займёт неделю: 4 вопроса от HR. Первая неделя на новом месте — с новым боссом.', 'Pick where to apply. The interview takes a week: 4 questions from HR. Your first week at the new place comes with a brand-new boss.')}</p>
    <div class="vacancies">${C.offers.map(id => { const v = vacancy(id);
      return `<button class="vac" data-id="${v.id}"><b>${esc(v.name)}</b><span class="lvl">${'●'.repeat(v.level)}${'○'.repeat(3 - v.level)}</span>
        <small>${esc(v.vibe)}</small><span class="perk">${L('старт', 'start')}: ${perkText(v.perk)} · ${L(`оклад ${money(salaryFor(v))}/день`, `pay ${money(salaryFor(v))}/day`)}</span></button>`; }).join('')}</div>
    <div class="stack"><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
  </div>`;
  show('end');
  $('toMenu').onclick = renderMenu;
  views.end.querySelectorAll('.vac').forEach(b => b.onclick = () => interview(vacancy(b.dataset.id)));
  board.touch('menu').catch(() => {});
}

// Собеседование: 6 вопросов (один — по профессии) + финальный. Заданные вопросы запоминаются,
// повторы — только когда незаданных не осталось
const IV_COUNT = 6;
function pickInterview(prof) {
  const seen = new Set(store.get(KEY.ivseen, []));
  const take = (list, n) => {
    let left = shuffle(list.filter(x => !seen.has(x.id)));
    if (left.length < n) { const old = shuffle(list.filter(x => seen.has(x.id))); for (const x of list) seen.delete(x.id); left = left.concat(old); }
    const out = left.slice(0, n); for (const x of out) seen.add(x.id); return out;
  };
  const own = IV.filter(x => !x.last && x.prof === prof), main = IV.filter(x => !x.last && !x.prof), last = IV.filter(x => x.last);
  const mine = take(own, Math.min(1, own.length));
  const qs = shuffle(mine.concat(take(main, IV_COUNT - mine.length))).concat(take(last, 1));
  store.set(KEY.ivseen, [...seen]);
  return qs;
}
// Проходной балл зависит от уровня вакансии: из 14 возможных нужно 7, 9 или 11
function interview(v) {
  const qs = pickInterview(C.prof);
  const need = Math.round(qs.length * 2 * { 1: .5, 2: .64, 3: .79 }[v.level]);
  let i = 0, score = 0, recUsed = false;
  const step = () => {
    const q = qs[i];
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">${L(`Неделя ${C.week} из ${YEAR} · собеседование · ${esc(v.name)}`, `Week ${C.week} of ${YEAR} · interview · ${esc(v.name)}`)}</span>
      <div class="iv-dots">${qs.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('')}</div>
      <div class="iv-q"><span class="who">${L(`HR · вопрос ${i + 1} из ${qs.length}`, `HR · question ${i + 1} of ${qs.length}`)}</span><div class="text">${esc(q.q)}</div><div class="iv-reply" id="ivReply" aria-live="polite"></div></div>
      ${i === 0 && typeof anketaNote === 'function' ? anketaNote() : ''}
      <div class="iv-answers">${shuffle(q.a).map(a => `<button class="ans" data-s="${a.score}" data-r="${esc(a.reply)}">${esc(a.label)}</button>`).join('')}</div>
    </div>`;
    show('end');
    const btns = [...views.end.querySelectorAll('.iv-answers .ans')];
    btns.forEach(b => b.onclick = () => {
      btns.forEach(x => x.disabled = true); b.classList.add('picked');
      score += +b.dataset.s; $('ivReply').textContent = `HR: ${b.dataset.r}`; sfx.stapler();
      setTimeout(() => { i++; i < qs.length ? step() : verdict(); }, 1500);
    });
    btns[0].focus({ preventScroll: true });
  };
  const verdict = () => {
    // рекомендация HR из анкеты (js/anketa.js): +2 балла, только когда их не хватает до проходного
    if (score < need && typeof anketaRecUse === 'function' && anketaRecUse(need - score)) { score += ANK_REC; recUsed = true; }
    const ok = score >= need, got = unlock([score === qs.length * 2 ? 'perfect_iv' : null]);
    C.week++; C.offers = [];
    if (ok) { C.passed++; C.stage = 'work'; C.newJob = true; C.company = v.name; C.salary = salaryFor(v); if (!C.companies.includes(v.name)) C.companies.push(v.name); C.res = freshRes(v.perk); sfx.win(); }
    else { C.failed++; sfx.lose(); }
    saveCareer();
    const over = C.week > YEAR;
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">${L(`Собеседование · ${esc(v.name)} · ${score} из ${qs.length * 2} баллов, нужно ${need}`, `Interview · ${esc(v.name)} · ${score} of ${qs.length * 2} points, needed ${need}`)}</span>
      <h1 class="${ok ? '' : 'lose'}">${ok ? L('Оффер!', 'You got the offer!') : L('Мы вам перезвоним', 'We’ll be in touch')}</h1>
      <p>${ok ? L(`${esc(v.name)} ждёт вас в понедельник. Новое место — свежий старт: шкалы снова около 50%. Оклад — ${money(C.salary)} в день.`, `${esc(v.name)} expects you on Monday. New job, fresh start: meters are back around 50%. Pay: ${money(C.salary)} a day.`) : L('…но не перезвонили. Поиск продолжается, впереди новые вакансии.', '…they were not in touch. The hunt goes on — more openings ahead.')}</p>
      ${recUsed ? `<p class="ank-used">📎 ${L(`Сработала рекомендация HR из анкеты: +${ANK_REC} балла.`, `Your HR referral from the application kicked in: +${ANK_REC} points.`)}</p>` : ''}
      ${endingsHtml(got)}
      <div class="stack"><button class="btn-main" id="next">${over ? L('Итоги года', 'Year in review') : ok ? L(`Выйти на работу · неделя ${C.week}`, `Start the job · week ${C.week}`) : L(`Искать дальше · неделя ${C.week}`, `Keep looking · week ${C.week}`)}</button>
        <button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
    </div>`;
    show('end');
    $('toMenu').onclick = renderMenu;
    $('next').onclick = () => over ? yearEnd() : ok ? startWeek() : jobSearch();
    $('next').focus({ preventScroll: true });
    if (ok) confetti();
  };
  step();
}

function yearRank(w) { return w >= 52 ? L('Железный сотрудник года', 'Iron Employee of the Year') : w >= 40 ? L('Опора офиса', 'Pillar of the Office') : w >= 26 ? L('Опытный выживальщик', 'Seasoned Survivor') : w >= 10 ? L('Вечный соискатель', 'Eternal Job Seeker') : L('Свободный художник', 'Free Spirit'); }
function yearEnd() {
  store.del(KEY.save);
  const all = C.passed + C.failed;
  if (C.vacation >= 1 && !C.paidOut) { pay(Math.floor(C.vacation) * C.salary); C.paidOut = true; saveCareer(); }  // компенсация неиспользованного отпуска
  const got = unlock([C.companies.length >= 5 ? 'nomad' : null, C.worked >= YEAR && !C.firings ? 'iron' : null]);
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${L(`Год позади · ${YEAR} недель`, `Year done · ${YEAR} weeks`)} · ${esc(prefs.name)}, ${PROF[C.prof].name.toLowerCase()}</span>
    <h1>${L('Итоги года', 'Year in review')}</h1>
    <span class="rank">${yearRank(C.worked)}</span>
    <p>${traitText('year', C.trait)}</p>
    <div class="career-card" style="width:100%">
      <div class="stat-box"><b>${C.worked}</b><span>${L('недель отработано', 'weeks worked')}</span></div>
      <div class="stat-box"><b>${C.firings}</b><span>${L('увольнений', 'times fired')}</span></div>
      <div class="stat-box"><b>${C.passed}/${all}</b><span>${L('собеседований пройдено', 'interviews passed')}</span></div>
    </div>
    <div class="money"><div><b>${money(C.earned)}</b><span>${L('заработано за год', 'earned this year')}</span></div><div><b>${L(`${C.vacUsed} из ${VAC_YEAR} дн.`, `${C.vacUsed} of ${VAC_YEAR} days`)}</b><span>${L('отпуска использовано', 'vacation used')}</span></div></div>
    <p>${L('Где вы успели поработать:', 'Where you clocked in this year:')}</p>
    <ul class="companies">${C.companies.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    ${endingsHtml(got)}
    ${levelOf(C) < LEVEL_MAX ? `<div class="lvl-next"><span class="lvl-next-ico" aria-hidden="true">${LEVELS[levelOf(C) + 1].ico}</span><div><b>${L(`Открыт уровень ${levelOf(C) + 1} из ${LEVEL_MAX}: «${LEVELS[levelOf(C) + 1].name}»`, `Level ${levelOf(C) + 1} of ${LEVEL_MAX} unlocked: “${LEVELS[levelOf(C) + 1].name}”`)}</b><small>${LEVELS[levelOf(C) + 1].desc}. ${L('Новые 52 недели и новые карточки. Персонаж, питомцы и деньги остаются с вами.', 'A new 52 weeks with brand-new cards. Your character, pets and money stay with you.')}</small></div></div>`
      : `<div class="lvl-next"><span class="lvl-next-ico" aria-hidden="true">🏆</span><div><b>${L('Все три уровня пройдены — вы легенда офиса!', 'All three levels done — you’re an office legend!')}</b><small>${L('Можно сыграть третий уровень ещё раз или начать путь заново.', 'Replay level three or start the journey over.')}</small></div></div>`}
    <div class="stack">${levelOf(C) < LEVEL_MAX ? `<button class="btn-main" id="nextLevel">${L(`Уровень ${levelOf(C) + 1} →`, `Level ${levelOf(C) + 1} →`)}</button>` : ''}<button class="${levelOf(C) < LEVEL_MAX ? 'btn-ghost' : 'btn-main'}" id="again">${levelOf(C) < LEVEL_MAX ? L('Начать карьеру заново', 'Start over') : L('Ещё год на 3-м уровне', 'Another year on level 3')}</button>
      <button class="btn-ghost" id="toBoard">${L('Рейтинг офиса', 'Office leaderboard')}</button><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
  </div>`;
  show('end'); bindCommon();
  $('again').onclick = () => levelOf(C) >= LEVEL_MAX ? startLevel(LEVEL_MAX) : (store.del(KEY.career), newCareer());
  if ($('nextLevel')) $('nextLevel').onclick = () => startLevel(levelOf(C) + 1);
  if (C.worked >= 40) confetti();
}

// ---------- коллекция концовок ----------
function showCollection() {
  const got = endingsGot();
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${L(`Открыто ${Object.keys(got).length} из ${ENDINGS.length}`, `Unlocked ${Object.keys(got).length} of ${ENDINGS.length}`)}</span>
    <h1>${L('Коллекция концовок', 'Endings Collection')}</h1>
    <div class="collection">${ENDINGS.map(e => got[e.id]
      ? `<div class="ach on"><b>${esc(e.title)}</b><small>${esc(e.hint)}</small></div>`
      : `<div class="ach"><b>???</b><small>${esc(e.hint)}</small></div>`).join('')}</div>
    <div class="stack"><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
  </div>`;
  setPhase('evening'); show('end'); $('toMenu').onclick = renderMenu;
}

// ---------- «Предложи ситуацию» ----------
function showSuggest() {
  const sel = (side, k) => `<label class="eff"><span>${resName(k)}</span><select id="ef-${side}-${k}">
    <option value="-20">▼▼</option><option value="-10">▼</option><option value="0" selected>—</option><option value="10">▲</option><option value="20">▲▲</option></select></label>`;
  views.end.innerHTML = `<form class="end-sheet glass suggest" id="sgForm" novalidate>
    <span class="kicker">${L(`Карточка от коллеги · после модерации появится в игре с подписью «${esc(prefs.name)}»`, `A card from a colleague · once approved, it shows up in the game signed “${esc(prefs.name)}”`)}</span>
    <h1>${L('Предложить ситуацию', 'Suggest a situation')}</h1>
    <div class="field"><label for="sgWho">${L('Кто говорит', 'Who’s talking')}</label><input id="sgWho" type="text" maxlength="24" value="${L('Коллега', 'Colleague')}"></div>
    <div class="field"><label for="sgText">${L('Ситуация *', 'Situation *')}</label><textarea id="sgText" maxlength="240" rows="3" placeholder="${L('Например: «Коллега третий раз за день просит „быстро глянуть“ его отчёт»', 'E.g. “A coworker asks you to ‘take a quick look’ at their report for the third time today”')}"></textarea></div>
    <div class="sg-side"><div class="field"><label for="sgLeft">${L('Ответ влево *', 'Left answer *')}</label><input id="sgLeft" type="text" maxlength="60" placeholder="${L('Отказать', 'Say no')}"></div>
      <div class="effs">${RES.map(r => sel('l', r.k)).join('')}</div></div>
    <div class="sg-side"><div class="field"><label for="sgRight">${L('Ответ вправо *', 'Right answer *')}</label><input id="sgRight" type="text" maxlength="60" placeholder="${L('Согласиться', 'Say yes')}"></div>
      <div class="effs">${RES.map(r => sel('r', r.k)).join('')}</div></div>
    <p class="join-err" id="sgErr" role="alert"></p>
    <div class="stack"><button class="btn-main" type="submit" id="sgGo">${L('Отправить на модерацию', 'Submit for review')}</button><button class="btn-ghost" type="button" id="toMenu">${L('В главное меню', 'Main menu')}</button></div>
  </form>`;
  setPhase('evening'); show('end'); $('toMenu').onclick = renderMenu;
  $('sgForm').onsubmit = async e => {
    e.preventDefault();
    const text = $('sgText').value.trim(), l = $('sgLeft').value.trim(), r = $('sgRight').value.trim();
    if (text.length < 10 || !l || !r) { $('sgErr').textContent = L('Опишите ситуацию (хотя бы 10 символов) и оба ответа.', 'Describe the situation (at least 10 characters) and both answers.'); return; }
    const effs = side => Object.fromEntries(RES.map(x => [x.k, +$(`ef-${side}-${x.k}`).value]));
    $('sgGo').disabled = true; $('sgGo').textContent = L('Отправляю…', 'Sending…');
    try {
      await board.suggest({ author: prefs.name, who: $('sgWho').value.trim() || L('Коллега', 'Colleague'), text, left_label: l, right_label: r, left_effects: effs('l'), right_effects: effs('r') });
      views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">${L('Отправлено', 'Sent')}</span><h1>${L('Спасибо!', 'Thanks!')}</h1>
        <p>${L(`Карточка ушла на модерацию. Когда её одобрят, она начнёт выпадать как случайное событие с подписью «${esc(prefs.name)}».`, `Your card is in the review queue. Once approved, it’ll pop up as a random event signed “${esc(prefs.name)}”.`)}</p>
        <div class="stack"><button class="btn-main" id="again">${L('Предложить ещё', 'Suggest another')}</button><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div></div>`;
      $('again').onclick = showSuggest; $('toMenu').onclick = renderMenu;
    } catch (err) { $('sgErr').textContent = L(`Не получилось отправить: ${err.message}`, `Couldn’t send: ${err.message}`); $('sgGo').disabled = false; $('sgGo').textContent = L('Отправить на модерацию', 'Submit for review'); }
  };
}

// ---------- серия дней: неделя дня несколько дней подряд ----------
// Каждый день серии даёт в карьеру по 2 у.е. за день серии (максимум 14), семь дней подряд — концовка
function updateStreak(day) {
  const st = prefs.streak || { last: '', count: 0 };
  const y = new Date(day); y.setDate(y.getDate() - 1);
  const yest = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  st.count = st.last === yest ? st.count + 1 : st.last === day ? st.count : 1; st.last = day;
  prefs.streak = st; store.set(KEY.prefs, prefs);
  const bonus = Math.min(14, 2 * st.count), Cc = store.get(KEY.career, null);
  if (Cc && st.count > 1) { Cc.bank = (Cc.bank || 0) + bonus; Cc.earned = (Cc.earned || 0) + bonus; store.set(KEY.career, Cc); }
  if (st.count >= 7) unlock(['streak7']);
  setTimeout(() => toast(st.count > 1 ? L(`Серия: ${st.count} дн. подряд${Cc ? ` · +${bonus} у.е. на счёт карьеры` : ''}`, `Streak: ${st.count} days in a row${Cc ? ` · +$${bonus} to your career bank` : ''}`) : L('Серия началась: приходите завтра за бонусом', 'Streak started: come back tomorrow for a bonus')), 1200);
}
const streakNow = () => { const st = prefs.streak; if (!st) return 0; const d = (new Date(today()) - new Date(st.last)) / 864e5; return d <= 1 ? st.count : 0; };

// Напоминание о неделе дня: событие в календаре телефона по будням
function remindIcs() {
  const time = '12:30';
  const d = new Date(); const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const url = gameUrl();
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//vyzhit-do-pyatnitsy//RU', 'BEGIN:VEVENT', `UID:vdp-daily-${ymd}@vyzhit`, `DTSTAMP:${ymd}T000000`,
    `DTSTART:${ymd}T${time.replace(':', '')}00`, 'DURATION:PT10M', 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', L('SUMMARY:Неделя дня — «Выжить до пятницы»', 'SUMMARY:Daily Week — Survive till Friday'),
    L(`DESCRIPTION:Новая неделя дня уже ждёт. Коллеги играют! ${url}`, `DESCRIPTION:A new Daily Week is waiting. Your coworkers are already playing! ${url}`), `URL:${url}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', L('DESCRIPTION:Неделя дня ждёт', 'DESCRIPTION:The Daily Week is waiting'), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  try {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'vyzhit-do-pyatnitsy.ics';
    document.body.appendChild(a); a.click(); a.remove();
    toast(L('Откройте скачанный файл — напоминание появится в календаре по будням в 12:30', 'Open the downloaded file — a reminder will pop up in your calendar on weekdays at 12:30 PM'));
  } catch { toast(L('Не получилось сохранить файл напоминания', 'Couldn’t save the reminder file')); }
}
$('remindDaily').onclick = remindIcs;

// ---------- запись результата и место в рейтинге ----------
async function record(won, death, high) {
  const total = RES.reduce((a, r) => a + S.res[r.k], 0);
  prefs.gamesPlayed = (prefs.gamesPlayed || 0) + 1; store.set(KEY.prefs, prefs);
  if (typeof installNudge === 'function') installNudge();
  if (S.mode === 'daily') {
    const all = store.get(KEY.daily, {});
    if (!all[S.day]) { all[S.day] = { won, total }; store.set(KEY.daily, all); updateStreak(S.day); }
  }
  const el = () => $('place');
  if (S.mode === 'tour') { const t = store.get('vdp-tours', {}); if (!t[S.tourId]) { t[S.tourId] = { won, total }; store.set('vdp-tours', t); } }
  if (S.mode === 'pack' || (S.mode === 'daily' && !S.ranked) || (S.mode === 'tour' && !S.ranked)) {
    if (el()) el().textContent = S.mode === 'pack' ? L('Брендированная неделя в общий рейтинг не идёт.', 'Branded weeks don’t count toward the main leaderboard.') : L('Повторная попытка: в зачёт идёт только первая.', 'Replay: only your first attempt counts.'); return; }
  const entry = { player_id: prefs.playerId, name: (S.name || prefs.name || '').trim().slice(0, 24) || L('Сотрудник', 'Employee'),  // пустое имя база не примет — результат не попал бы в рейтинг dept: (S.dept || '').slice(0, 24), prof: S.prof, won,
    step: won ? WEEK_LEN : S.step, total, psyche: S.res.psyche, energy: S.res.energy, boss: S.res.boss, colleagues: S.res.colleagues, death,
    mode: S.mode, day: S.mode === 'daily' ? S.day : null, overheat: !!high, ...(S.mode === 'tour' ? { tour_id: S.tourId } : {}) };
  try {
    try { await board.submit(entry); }
    catch (err) { if (!offlineErr(err)) throw err; outboxAdd(entry); if (el()) el().textContent = L('Нет связи, результат сохранён локально и уйдёт в рейтинг, когда сеть вернётся.', 'You’re offline — your score is saved on this device and will be submitted once you’re back online.'); return; }
    board.touch('finished', entry.step).catch(() => {});
    if (S.mode === 'tour') {
      const rows = (await board.rpc('tournament_board', { p_code: S.tourCode })).filter(r => r.name);
      const pos = rows.findIndex(r => r.name === prefs.name && r.played_at) + 1;
      if (el()) el().innerHTML = pos ? `<b>#${pos}</b><span>${L(`место в турнире офиса из ${rows.length}`, `place in the office tournament out of ${rows.length}`)}</span>` : `<span>${L('Результат записан в турнир', 'Score saved to the tournament')}</span>`;
      return;
    }
    const list = S.mode === 'daily' ? await board.daily(S.day) : await board.top(), tag = await myTag;
    const pos = list.findIndex(e => e.tag === tag) + 1;
    if (!el()) return;
    el().innerHTML = pos ? `<b>#${pos}</b><span>${S.mode === 'daily' ? L(`место в рейтинге дня из ${list.length}`, `place on today’s leaderboard out of ${list.length}`) : L(`ваше место в рейтинге${board.online ? ' офиса' : ' на этом устройстве'} (лучшая неделя)`, `your rank${board.online ? ' in the office' : ' on this device'} (best week)`)}</span>` : `<span>${L('Результат записан в рейтинг', 'Score saved to the leaderboard')}</span>`;
  } catch (err) {
    if (el()) el().textContent = L(`Не удалось записать результат: ${err.message}.`, `Couldn’t save your score: ${err.message}.`);
  }
}

// ---------- очередь результатов без сети ----------
// Ошибка сети (fetch не дошёл) — не ответ сервера: такие результаты копим и отправляем позже по одному
const OUTBOX = 'vdp-outbox';
const offlineErr = err => err instanceof TypeError || !navigator.onLine;
function outboxAdd(entry) { const q = store.get(OUTBOX, []); q.push(entry); store.set(OUTBOX, q.slice(-20)); }
let flushing = false;
async function flushOutbox() {
  if (flushing || !board.online) return;
  flushing = true;
  try {
    let sent = 0;
    for (let q = store.get(OUTBOX, []); q.length; q = store.get(OUTBOX, [])) {
      if (sent) await new Promise(r => setTimeout(r, 11000));  // сервер принимает не чаще раза в 10 секунд
      try { await board.submit(q[0]); sent++; }
      catch (err) {
        if (offlineErr(err)) break;
        if (/Слишком часто/.test(err.message)) { await new Promise(r => setTimeout(r, 11000)); continue; }
      }  // иначе сервер отказал — такой результат уже не примут, выбрасываем
      store.set(OUTBOX, store.get(OUTBOX, []).slice(1));
    }
    if (sent) toast(sent > 1 ? L(`Связь есть: отправлено результатов — ${sent}`, `Back online: ${sent} scores sent`) : L('Связь есть: результат отправлен в рейтинг', 'Back online: score sent to the leaderboard'));
  } finally { flushing = false; }
}
addEventListener('online', flushOutbox);

// ---------- конфетти ----------
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('confetti'), ctx = cv.getContext('2d'), dpr = devicePixelRatio || 1;
  cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--magenta', '--cyan', '--up', '--down', '--cyan-l'].map(v => cs.getPropertyValue(v).trim()).concat('#b26bff');
  const P = Array.from({ length: 170 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4,
    w: 6 + Math.random() * 6, h: 4 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: rnd(cols) }));
  const t0 = performance.now();
  (function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
    if (now - t0 < 4200) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
  })(t0);
}

// ---------- вызов коллеге: ссылка с результатом открывает ту же неделю дня ----------
const CH_STAT = { psyche: 'p', energy: 'e', boss: 'b', colleagues: 'c' };
const CH_KEY = Object.fromEntries(Object.entries(CH_STAT).map(([k, v]) => [v, k]));
// 20261029w312p12: дата, w/l, счёт (победа) или номер карточки (проигрыш), шкала и её значение
function challengeCode(won, k) {
  const key = won ? [...RES].sort((a, b) => S.res[a.k] - S.res[b.k])[0].k : k;
  const num = won ? RES.reduce((a, r) => a + S.res[r.k], 0) : S.step;
  return `${S.day.replace(/-/g, '')}${won ? 'w' : 'l'}${String(num).padStart(3, '0')}${CH_STAT[key]}${S.res[key]}`;
}
function parseChallenge(code) {
  const m = /^(\d{4})(\d{2})(\d{2})([wl])(\d{3})([pebc])(\d{1,3})$/.exec(code || '');
  if (!m || (m[4] === 'l' && +m[5] > WEEK_LEN - 1) || (m[4] === 'w' && +m[5] > 400)) return null;
  return { day: `${m[1]}-${m[2]}-${m[3]}`, won: m[4] === 'w', num: +m[5], stat: CH_KEY[m[6]], val: Math.min(100, +m[7]) };
}
// победа всегда выше проигрыша; дальше — счёт недели или сколько карточек продержались
const chScore = c => c.won ? 1000 + c.num : c.num;
const chResult = c => c.won ? L(`неделя закрыта, счёт ${c.num}/400, ${resName(c.stat)} ${c.val}%`, `week survived, score ${c.num}/400, ${resName(c.stat)} ${c.val}%`) : L(`неделя завалена: ${DAYS[dayOf(c.num)].toLowerCase()}, ${PHASES[slotPh(c.num)].name.toLowerCase()}, ${resName(c.stat)} ${c.val}%`, `week wrecked: ${dayName(dayOf(c.num))} ${phaseName(slotPh(c.num)).toLowerCase()}, ${resName(c.stat)} ${c.val}%`);
const chName = c => c.by || L('Коллега', 'Colleague');
// Строка на финале недели дня, если игрок принял вызов на этот день
function challengeLine(won, k) {
  const c = prefs.challenge;
  if (S.mode !== 'daily' || !c || c.day !== S.day || c.done) return '';
  const mine = parseChallenge(challengeCode(won, k)), d = chScore(mine) - chScore(c);
  c.done = true; c.beat = d > 0; store.set(KEY.prefs, prefs);
  return `<div class="place challenge"><b>${d > 0 ? L('Вызов выигран!', 'Challenge won!') : d === 0 ? L('Ничья', 'It’s a tie') : L('Вызов проигран', 'Challenge lost')}</b>
    <span>${esc(chName(c))}: ${chResult(c)}<br>${L('Вы', 'You')}: ${chResult(mine)}</span></div>`;
}

// ---------- мем-карточка для чата ----------
function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; }
  ctx.fillText(line, x, y); return y + lh;
}
// «Неделя пережита: Кукуха 12%, Босс 88%» — самая низкая и самая высокая шкала
function memeLine(won) {
  const sorted = [...RES].sort((a, b) => S.res[a.k] - S.res[b.k]), lo = sorted[0], hi = sorted[3];
  const d = dayOf(S.step);
  return `${won ? L('Я пережил(а) неделю', 'I survived the week') : L(`Неделя завалена в ${['понедельник', 'вторник', 'среду', 'четверг', 'пятницу'][d]}`, `My week got wrecked on ${dayName(d)}`)}: ${lo.name} ${S.res[lo.k]}%, ${hi.name} ${S.res[hi.k]}%`;
}
async function share(won, k) {
  try { await document.fonts.ready; } catch {}
  const total = RES.reduce((a, r) => a + S.res[r.k], 0);
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const glow = (c, b) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
  ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W * .15, H * 1.1, 0, W * .15, H * 1.1, 900);
  bg.addColorStop(0, 'rgba(178,107,255,.35)'); bg.addColorStop(1, 'rgba(178,107,255,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const bg2 = ctx.createRadialGradient(W * .9, -100, 0, W * .9, -100, 800);
  bg2.addColorStop(0, 'rgba(45,226,230,.3)'); bg2.addColorStop(1, 'rgba(45,226,230,0)'); ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
  const kick = S.mode === 'daily' ? L(`НЕДЕЛЯ ДНЯ ${dayLabel(S.day)}`, `DAILY WEEK ${dayLabel(S.day)}`) : S.mode === 'career' && C ? L(`НЕДЕЛЯ ${Math.max(1, C.week - 1)} ИЗ ${YEAR}`, `WEEK ${Math.max(1, C.week - 1)} OF ${YEAR}`) : L('ВЫЖИТЬ ДО ПЯТНИЦЫ', 'SURVIVE TILL FRIDAY');
  ctx.fillStyle = '#7df9ff'; glow('rgba(45,226,230,.9)', 20); ctx.font = '700 30px "JetBrains Mono", monospace'; ctx.fillText(kick, 80, 130);
  ctx.fillStyle = '#ffffff'; glow(won ? 'rgba(255,59,212,.9)' : 'rgba(255,59,107,.9)', 40); ctx.font = '800 118px Unbounded, "Arial Black", sans-serif'; ctx.fillText(L('НЕДЕЛЯ', 'WEEK'), 80, 290);
  ctx.fillStyle = won ? '#ff3bd4' : '#ff3b6b'; ctx.fillText(won ? L('ПЕРЕЖИТА', 'SURVIVED') : L('ЗАВАЛЕНА', 'WRECKED'), 80, 420);
  glow('transparent', 0); ctx.fillStyle = '#d6d2ef'; ctx.font = '800 42px Nunito, sans-serif';
  let y = wrap(ctx, `${memeLine(won)}.`, 80, 540, W - 160, 58);
  y += 30;
  RES.forEach((r, i) => {
    const bx = 80, by = y + i * 100, bw = W - 160 - 220;
    const col = { psyche: '#b26bff', energy: '#c6f01a', boss: '#ff3b6b', colleagues: '#2de2e6' }[r.k];
    ctx.font = '800 38px Nunito, sans-serif'; ctx.fillStyle = '#f2f0ff'; ctx.fillText(r.name, bx, by + 38);
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = .6; ctx.beginPath(); ctx.roundRect(bx, by + 54, bw, 32, 16); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = col; glow(col, 24); ctx.beginPath(); ctx.roundRect(bx + 5, by + 59, Math.max(22, (bw - 10) * S.res[r.k] / 100), 22, 11); ctx.fill(); glow('transparent', 0);
    ctx.fillStyle = r.k === k ? '#ff3b6b' : '#7df9ff'; ctx.font = '700 48px "JetBrains Mono", monospace'; ctx.textAlign = 'right'; ctx.fillText(`${S.res[r.k]}%`, W - 80, by + 84); ctx.textAlign = 'left';
  });
  y += 4 * 100 + 30;
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(80, y, W - 160, 2);
  ctx.fillStyle = '#ffffff'; glow('rgba(255,59,212,.8)', 24); ctx.font = '700 40px "JetBrains Mono", monospace'; ctx.fillText(won ? L(`СЧЁТ ${total}/400`, `SCORE ${total}/400`) : S.name.toUpperCase(), 80, y + 70);
  glow('rgba(212,255,58,.7)', 16); ctx.fillStyle = '#d4ff3a'; ctx.textAlign = 'right'; ctx.font = '900 36px Nunito, sans-serif'; ctx.fillText(won ? rank(total) : TRAITS[S.trait || 'workaholic'].name, W - 80, y + 70); ctx.textAlign = 'left';
  glow('transparent', 0); ctx.font = '800 32px Nunito, sans-serif'; ctx.fillStyle = '#b9b4d6'; ctx.fillText(S.mode === 'daily' ? L('Сможешь лучше? Та же неделя — по ссылке', 'Think you can beat it? Same week at the link') : L('А ты доживёшь до пятницы?', 'Can you make it to Friday?'), 80, H - 90);
  const url = cv.toDataURL('image/png');
  // неделя дня — ссылка-вызов на ту же неделю, остальное — приглашение с ID игрока
  const daily = S.mode === 'daily', link = daily ? await challengeLink(challengeCode(won, k)) : (await referralLink('friends')).url;
  const c = prefs.challenge, reply = daily && c?.day === S.day && c.done ? `${chName(c)}, ${c.beat ? L('вызов принят и выигран', 'challenge accepted and won') : L('вызов принят', 'challenge accepted')}! ` : '';
  const text = daily ? L(`${reply}${memeLine(won)}. Неделя дня ${dayLabel(S.day)} в «Выжить до пятницы» — сможешь лучше? Та же неделя по ссылке:`, `${reply}${memeLine(won)}. Daily Week ${dayLabel(S.day)} in Survive till Friday — think you can do better? Same week here:`)
    : L(`${memeLine(won)}. «Выжить до пятницы» — а ты доживёшь до пятницы?`, `${memeLine(won)}. Survive till Friday — can you make it to Friday?`);
  const full = `${text} ${link}`, enc = encodeURIComponent;
  track('share', { detail: daily ? 'challenge' : 'meme' });
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass" role="dialog" aria-modal="true" aria-label="${L('Поделиться результатом', 'Share result')}">
    <img src="${url}" alt="${L('Мем-карточка', 'Meme card')}: ${esc(memeLine(won))}">
    <p class="share-text">${esc(full)}</p>
    ${navigator.canShare ? `<button class="btn-main" id="shareImg">${L('Отправить картинку и ссылку', 'Send image & link')}</button>` : ''}
    <div class="share-grid">
      <a href="https://t.me/share/url?url=${enc(link)}&text=${enc(text)}" target="_blank" rel="noopener" id="shTgLink">Telegram</a>
      <a href="https://wa.me/?text=${enc(full)}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="${url}" download="vyzhit-do-pyatnitsy.png" id="dlImg">${L('Скачать картинку', 'Download image')}</a>
      <button id="copyTxt">${L('Скопировать текст', 'Copy text')}</button>
    </div>
    <p class="field-note">${L('Для Slack и рабочей почты: скачайте картинку и вставьте вместе с текстом.', 'For Slack or work email: download the image and paste it in with the text.')}</p>
    <div class="toast" id="toast" aria-live="polite"></div>
    <button class="btn-ghost" id="closeM">${L('Закрыть', 'Close')}</button></div>`;
  m.hidden = false;
  if (TG) $('shTgLink').onclick = e => { e.preventDefault(); TG.openTelegramLink(`https://t.me/share/url?url=${enc(link)}&text=${enc(text)}`); };
  $('closeM').onclick = () => { m.hidden = true; $('share')?.focus(); };
  m.onclick = e => { if (e.target === m) m.hidden = true; };
  if ($('shareImg')) $('shareImg').onclick = async () => {
    try {
      const blob = await (await fetch(url)).blob(), file = new File([blob], 'vyzhit-do-pyatnitsy.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: full });
      else await navigator.share({ text, url: link });
    } catch {}
  };
  $('copyTxt').onclick = () => {
    navigator.clipboard.writeText(full).then(() => $('toast').textContent = L('Текст со ссылкой скопирован — вставьте в чат', 'Text and link copied — paste it into the chat'),
      () => { $('toast').textContent = full; });
  };
  $('copyTxt').focus();
}
