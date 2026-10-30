// Язык игры: русский (ru) или английский (en). Подключается первым — до cards.js.
// Выбор: ?lang=en / ?lang=ru в адресе, переключатель в профиле; кто уже играл — русский; иначе — по языкам браузера.
// В коде текст пишется парой: L('по-русски', 'in English'). Данные (карточки, вопросы) — в data/en/*.json поверх русских по id.
const LANG = (() => {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'ru') { localStorage.setItem('vdp-lang', q); return q; }
    const s = localStorage.getItem('vdp-lang');
    if (s === 'en' || s === 'ru') return s;
    if (localStorage.getItem('vdp-prefs')) return 'ru';  // кто уже играл до английской версии — остаётся на русском
  } catch {}
  // английский — только если среди языков браузера нет русского (и украинского, белорусского, казахского)
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || 'ru'];
  const l = langs.some(x => /^(ru|uk|be|kk)\b/i.test(x)) ? 'ru' : 'en';
  try { localStorage.setItem('vdp-lang', l); } catch {}  // запомнить: на следующем входе уже есть vdp-prefs, но язык тот же
  return l;
})();
const EN = LANG === 'en';
const L = (ru, en) => EN ? en : ru;
const LOCALE = EN ? 'en-US' : 'ru-RU';
// Деньги: «12 у.е.» / «$12»
const money = n => EN ? `${n < 0 ? '−' : ''}$${Math.abs(n)}` : `${n} у.е.`;
// Число со словом: pl(3, 'предмет', 'предмета', 'предметов', 'item', 'items') → «3 предмета» / «3 items»
const pl = (n, one, few, many, enOne, enMany) => {
  if (EN) return `${n} ${Math.abs(n) === 1 ? enOne : enMany}`;
  const a = Math.abs(n) % 100, b = a % 10;
  return `${n} ${a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many}`;
};
// Дни и время суток для показа. В логике (c.day, c.phase) остаются русские 'Понедельник', 'Утро' — их не переводить
const DAY_NAMES = EN ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const PHASE_NAMES = EN ? ['Morning', 'Afternoon', 'Evening'] : ['Утро', 'День', 'Вечер'];
const dayName = i => DAY_NAMES[i];
const phaseName = i => PHASE_NAMES[i];
// Сменить язык и перезапустить игру
// На сайте у английской версии своя страница en.html (для поисковиков), в сборках для каталогов — та же страница
function setLang(l) {
  try { localStorage.setItem('vdp-lang', l); } catch {}
  const q = new URLSearchParams(location.search); q.delete('lang');
  const site = /survivefriday\.com$|^localhost$/.test(location.hostname) && !window.VDP_PLATFORM;
  const path = site ? location.pathname.replace(/(en\.html|index\.html)?$/, l === 'en' ? 'en.html' : '') : location.pathname;
  location.href = path + (q.toString() ? '?' + q : '') + location.hash;
}
if (EN && /^Выжить/.test(document.title)) document.title = 'Survive till Friday — free office survival game';
document.documentElement.lang = LANG;
// Статичный текст в index.html: <b data-en="Play">Играть</b>; атрибуты — data-en-aria-label, data-en-placeholder, data-en-title
function applyStaticLang(root = document) {
  if (!EN) return;
  root.querySelectorAll('[data-en]').forEach(el => { el.innerHTML = el.dataset.en; });
  for (const a of ['aria-label', 'placeholder', 'title', 'content'])
    root.querySelectorAll(`[data-en-${a}]`).forEach(el => el.setAttribute(a, el.getAttribute(`data-en-${a}`)));
}
