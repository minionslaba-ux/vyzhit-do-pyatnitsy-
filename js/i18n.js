window.APP_VER = 'v131';  // версия игры — та же, что CACHE в sw.js (видна в профиле)
// Браузер — для статистики и обходов: Яндекс Браузер, Samsung Internet, MIUI и т. д.
window.BROWSER = (ua => /YaBrowser|YaSearchBrowser|YandexSearch/i.test(ua) ? 'yandex' : /SamsungBrowser/i.test(ua) ? 'samsung' : /MiuiBrowser|XiaoMi/i.test(ua) ? 'miui'
  : /OPR\/|Opera/i.test(ua) ? 'opera' : /Edg/i.test(ua) ? 'edge' : /Firefox|FxiOS/i.test(ua) ? 'firefox' : /CriOS|Chrome/i.test(ua) ? 'chrome' : /Safari/i.test(ua) ? 'safari' : 'other')(navigator.userAgent || '');
// Ошибки скриптов — копим с самого начала и отправляем в статистику (js/app.js), чтобы видеть поломки в конкретных браузерах
window.__errs = [];
addEventListener('error', e => { if (window.__errs.length < 5) window.__errs.push(`${(e.message || 'error').slice(0, 90)} @${(e.filename || '').split('/').pop()}:${e.lineno || 0}`); window.__errFlush?.(); });
addEventListener('unhandledrejection', e => { const m = String(e.reason?.message || e.reason || ''); if (/fetch|network|load|abort/i.test(m)) return; if (window.__errs.length < 5) window.__errs.push(('promise: ' + m).slice(0, 100)); window.__errFlush?.(); });
// Высота экрана для вёрстки (--app-h): реально видимая область. 100dvh в Telegram на iPhone и в части браузеров бывает
// больше видимого — тогда низ экрана (кнопки ответов) уезжал за край, а прокрутки нет. Берём высоту из Telegram или visualViewport.
(() => {
  // приложение на экране «Домой» (iOS/Android): высоту задаёт CSS (body fixed на весь экран) — в нём visualViewport на iPhone врёт
  const app = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (app) { document.documentElement.classList.add('pwa'); return; }
  // Обычный браузер (не Telegram, не приложение с главного экрана): экраны, кроме самой игры, прокручиваются всей страницей.
  // Вложенная прокрутка внутри неподвижной страницы не работает в части мобильных браузеров (Яндекс Браузер)
  const inTg = /tgWebApp/.test(location.hash) || window.TelegramWebviewProxy || /Telegram/i.test(navigator.userAgent) || window.Telegram?.WebApp?.initData;
  if (!inTg) document.documentElement.classList.add('docscroll');
  const set = () => {
    const tg = window.Telegram?.WebApp, vv = window.visualViewport;
    const h = (tg?.initData && tg.viewportStableHeight) || window.innerHeight || vv?.height;
    if (h > 200) document.documentElement.style.setProperty('--app-h', Math.round(h) + 'px');
  };
  set(); addEventListener('resize', set); window.visualViewport?.addEventListener('resize', set);
  addEventListener('orientationchange', () => setTimeout(set, 350)); addEventListener('load', () => { set(); window.Telegram?.WebApp?.onEvent?.('viewportChanged', set); setTimeout(set, 500); });
})();
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
const num1 = n => Number.isInteger(n) ? String(n) : (Math.round(n * 10) / 10).toLocaleString(EN ? 'en-US' : 'ru-RU');  // 2,5 — оклад растёт на 0,5 после аттестации
const money = n => EN ? `${n < 0 ? '−' : ''}$${num1(Math.abs(n))}` : `${num1(n)} у.е.`;
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
  for (const a of ['aria-label', 'placeholder', 'title', 'content', 'href'])
    root.querySelectorAll(`[data-en-${a}]`).forEach(el => el.setAttribute(a, el.getAttribute(`data-en-${a}`)));
}
