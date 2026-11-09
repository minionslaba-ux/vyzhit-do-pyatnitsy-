// Пикабу Игры: страница pikabu/index.html (собирает tools/make-pikabu.py) — файл и SDK (games.pikabu.ru/sdk/sdk.js) только там.
// Правила каталога: без ссылок и упоминаний сторонних ресурсов, без своего входа, чата, рейтинга и внешней оплаты.
// Игра работает без нашего сервера (SUPABASE_CONFIG пустой — board.online = false): чат, турниры, рейтинг, вход сами скрыты.
// Реклама — через SDK Пикабу, обёрнутая в интерфейс Яндекс Игр (js/ads.js → adWatchSdk). Прогресс — в облаке Пикабу (sdk.storage).
window.VDP_PLATFORM = {
  name: 'pikabu',
  sdk: null,
  pk: null,
};
document.head.insertAdjacentHTML('beforeend', `<style>#openInvite, #installApp, #installCta, #installPop, #viralPop, #remindDaily, .viral, .share-grid,
  .legal-top, .site-legal, .join-consent, #maxPlay, #maxChannel, #remind2, #bootOld, a[target="_blank"], a[href^="http"],
  #share, #shareImg, .btn-share, .brk-share, .oc-share, .qt-share, .qt-vk, #welcome .perks, #welcome .welcome-lead, #wNote, #wVideo, #joinNote { display: none !important; }</style>`);

// Реклама Пикабу в виде adv Яндекс Игр: showRewardedVideo / showFullscreenAdv с callbacks
const pkAdv = pk => ({
  showRewardedVideo({ callbacks: c = {} } = {}) {
    (async () => {
      const r = pk.ads?.rewarded;
      if (!r?.isSupported || !(await r.canShow())) return c.onError?.(new Error('no_ad'));
      const x = await r.show();
      if (x?.reward) c.onRewarded?.();
      c.onClose?.(!!x?.rendered);
    })().catch(e => c.onError?.(e));
  },
  showFullscreenAdv({ callbacks: c = {} } = {}) {
    (async () => {
      const f = pk.ads?.fullscreen;
      if (!f?.isSupported || !(await f.canShow())) return c.onClose?.(false);
      const x = await f.show();
      c.onClose?.(!!x?.rendered);
    })().catch(e => c.onError?.(e));
  },
});

// Облачное сохранение: тот же набор, что и на сайте (js/cloud.js: cloudSnapshot / cloudScore / cloudApply), ключ 'vdp'.
// Лимит хранилища Пикабу — 200 КБ: если не влезает, без списка показанных карточек (vdp-seen) — он не обязателен.
const PK_KEY = 'vdp', PK_MAX = 190000;
let pkTimer = 0, pkLast = '';
function pkSnap() {
  const d = cloudSnapshot(); d['vdp-prefs'] = { ...d['vdp-prefs'] }; delete d['vdp-prefs'].cloudAt;
  let s = JSON.stringify(d);
  if (s.length > PK_MAX) { delete d['vdp-seen']; s = JSON.stringify(d); }
  return s.length > PK_MAX ? null : { d, s };
}
function pkSave(now = false) {
  const pk = VDP_PLATFORM.pk; if (!pk?.storage) return;
  clearTimeout(pkTimer);
  pkTimer = setTimeout(async () => {
    const x = pkSnap(); if (!x || x.s === pkLast) return;
    try { await pk.storage.set(PK_KEY, { v: 1, t: Date.now(), score: cloudScore(), d: x.d }); pkLast = x.s; } catch {}
  }, now ? 0 : 3000);
}
async function pkLoad(pk) {
  let c = null; try { c = await pk.storage?.get(PK_KEY); } catch {}
  if (typeof c === 'string') try { c = JSON.parse(c); } catch { c = null; }
  if (!c?.d || typeof c.d !== 'object') return false;
  // в облаке прогресс дальше, чем на этом устройстве (другое устройство или очищенный браузер) — берём его
  if ((Number(c.score) || 0) > cloudScore()) { cloudApply(c.d, new Date(c.t || Date.now()).toISOString()); return true; }
  return false;
}

const pkStart = async () => {
  if (!window.PkbSDK) return;
  try {
    const pk = await PkbSDK.init();
    VDP_PLATFORM.pk = pk;
    if (pk.ads?.rewarded?.isSupported || pk.ads?.fullscreen?.isSupported) VDP_PLATFORM.sdk = { adv: pkAdv(pk) };
    // имя игрока с Пикабу — если своё ещё не задано
    if (!prefs.name && pk.player?.isAuthorized && pk.player?.name) { prefs.name = String(pk.player.name).slice(0, 24); store.set(KEY.prefs, prefs); }
    await (typeof dataReady !== 'undefined' ? dataReady : Promise.resolve());
    if (await pkLoad(pk)) return;  // загрузили облако — страница перезагрузится
    pk.gameStarted?.();
    pk.on?.('userAuthorized', () => pkLoad(pk).then(r => { if (!r) pkSave(true); }));
    if (!views.menu.hidden) renderMenu?.();  // реклама стала доступна — обновить кнопки «Реклама за награду»
  } catch {}
};
// файл стоит до скриптов игры: подписки — когда они загружены (bus, prefs, cloudSnapshot уже есть)
document.addEventListener('DOMContentLoaded', () => {
  const g = document.getElementById('wGuest'); if (g) g.textContent = 'Играть';  // своих аккаунтов на Пикабу нет — просто «Играть»
  bus.on('weekEnd', () => pkSave());
  bus.on('menu', () => pkSave());
  bus.on('breakEnd', () => pkSave());
  document.addEventListener('visibilitychange', () => { if (document.hidden) pkSave(true); });
});
// SDK грузится после первого кадра — старт игры не ждёт сеть Пикабу
const pkSdk = () => { const s = document.createElement('script'); s.src = 'https://games.pikabu.ru/sdk/sdk.js'; s.onload = pkStart; document.head.append(s); };
if (document.readyState === 'complete') setTimeout(pkSdk, 0); else addEventListener('load', () => setTimeout(pkSdk, 0));
