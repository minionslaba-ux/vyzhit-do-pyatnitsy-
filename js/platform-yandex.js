// Яндекс Игры: файл и SDK (/sdk.js) добавляет только сборка tools/build-platforms.py.
// Каталог запрещает ссылки на сторонние площадки, поэтому приглашения, установка и кнопки соцсетей скрыты.
window.VDP_PLATFORM = {
  name: 'yandex',
  sdk: null,
  // «Игровой процесс» для статистики Яндекса: идёт, пока открыт экран недели
  view(v) { const g = this.sdk?.features?.GameplayAPI; if (g) v === 'game' ? g.start() : g.stop(); },
};
document.head.insertAdjacentHTML('beforeend', '<style>#openInvite, #installApp, #installCta, #installPop, #viralPop, #remindDaily, .viral, .share-grid a[target="_blank"] { display: none !important; }</style>');
// Язык — тот, что выбран на Яндексе (sdk.environment.i18n.lang): русский для ru/uk/be/kk, иначе английский.
// Если игра открылась не на том языке — один раз перезапускаем с ?lang= (js/i18n.js запоминает выбор).
// «Игра загрузилась» (LoadingAPI.ready) — когда карточки и данные готовы, а не сразу.
// Скрипт стоит в <head> до скриптов игры — SDK запускаем, когда все скрипты загружены (LANG, dataReady, renderMenu уже есть)
const yaStart = () => window.YaGames && YaGames.init().then(sdk => {
  VDP_PLATFORM.sdk = sdk;
  const want = /^(ru|uk|be|kk)$/i.test(sdk.environment?.i18n?.lang || 'ru') ? 'ru' : 'en';
  try {
    if (want !== LANG && !/[?&]lang=/.test(location.search) && !sessionStorage.getItem('vdp-ya-lang')) {
      sessionStorage.setItem('vdp-ya-lang', '1'); localStorage.setItem('vdp-lang', want);
      return location.replace(location.pathname + (location.search ? location.search + '&' : '?') + 'lang=' + want);
    }
  } catch {}
  (typeof dataReady !== 'undefined' ? dataReady : Promise.resolve()).then(() => sdk.features?.LoadingAPI?.ready());
  if (!views.menu.hidden) renderMenu?.();  // реклама стала доступна — обновить кнопки «Реклама за награду»
}).catch(() => {});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', yaStart); else yaStart();
