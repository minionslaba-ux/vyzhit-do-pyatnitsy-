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
  #share, #shareImg, .btn-share, .brk-share, .oc-share, .qt-share, .qt-vk, #welcome .perks, #welcome .welcome-lead, #wNote, #wVideo, #joinNote,
  #paneOffice .row2, #officeCta, #socLive, #onlineBox, #socProfile, #toBoard, #place, #meId, .lang-row { display: none !important; }</style>`);

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
    pkStoreInit();  // цены и недовыданные покупки
    pk.on?.('userAuthorized', () => pkLoad(pk).then(r => { if (!r) pkSave(true); }));
    if (!views.menu.hidden) renderMenu?.();  // реклама стала доступна — обновить кнопки «Реклама за награду»
  } catch {}
};
// файл стоит до скриптов игры: подписки — когда они загружены (bus, prefs, cloudSnapshot уже есть)
document.addEventListener('DOMContentLoaded', () => {
  const g = document.getElementById('wGuest'); if (g) g.textContent = 'Играть';
  // своих аккаунтов на Пикабу нет: раздел профиля «Аккаунт» → «Настройки» (там «Начать карьеру заново»)
  document.querySelectorAll('.ps-cap[data-en="Account"]').forEach(x => { x.textContent = 'Настройки'; });  // своих аккаунтов на Пикабу нет — просто «Играть»
  bus.on('weekEnd', () => pkSave());
  bus.on('menu', () => pkSave());
  bus.on('breakEnd', () => pkSave());
  document.addEventListener('visibilitychange', () => { if (document.hidden) pkSave(true); });
});
// SDK грузится после первого кадра — старт игры не ждёт сеть Пикабу
const pkSdk = () => { const s = document.createElement('script'); s.src = 'https://games.pikabu.ru/sdk/sdk.js'; s.onload = pkStart; document.head.append(s); };
if (document.readyState === 'complete') setTimeout(pkSdk, 0); else addEventListener('load', () => setTimeout(pkSdk, 0));

// ---------- покупки за рубли через Пикабу (каталог — promo/pikabu/tovary-pikabu.csv в Студии) ----------
// Окно оплаты Пикабу → наш сервер проверяет подпись (функция pikabu-verify, ключ PIKABU_SECRET) → товар зачисляется.
// Расходуемые товары затем подтверждаются (consumePurchase); недовыданные — при запуске (getPurchases).
// Номера зачисленных покупок хранятся в prefs.pkGot (уходят в облако Пикабу вместе с прогрессом) — дважды не начислится.
const PK_GOODS = {
  starter: { ico: '🎁', t: 'Стартовый набор', d: '30 у.е., редкий питомец, премиум-тема и 3 подсказки', once: true, grant() { addCash(30); shopGrantProduct('starter'); } },
  noads: { ico: '🚫', t: '30 дней без рекламы', d: 'Без рекламы между неделями; «реклама за награду» — по желанию', grant() { shopGrantProduct('noads'); } },
  ue10: { ico: '💰', t: '10 у.е.', d: 'На счёт в игре', grant() { addCash(10); } },
  ue25: { ico: '💰', t: '25 у.е.', d: 'На счёт в игре', grant() { addCash(25); } },
  ue50: { ico: '💰', t: '50 у.е.', d: 'На счёт в игре', grant() { addCash(50); } },
  ue100: { ico: '💰', t: '100 у.е.', d: 'На счёт в игре · выгоднее всего', grant() { addCash(100); } },
};
const pkPrices = {};
let pkBusy = 0, pkMsg = '';
async function pkStoreInit() {
  const st = VDP_PLATFORM.pk?.store; if (!st) return;
  try { for (const x of (await st.getProducts()) || []) if (PK_GOODS[x.id]) pkPrices[x.id] = x.formattedPrice || (x.price / 100) + ' ₽'; } catch {}
  // магазин — только когда Пикабу отдал товары из каталога Студии: без каталога кнопки «Купить» не работали бы (модерация)
  if (Object.keys(pkPrices).length && !VDP_PLATFORM.shop) { VDP_PLATFORM.shop = pkShop; if (!views.menu.hidden) renderMenu?.(); }
  try { for (const x of (await st.getPurchases()) || []) await pkHandle(x, false); } catch {}
}
async function pkHandle(purchase, loud) {
  const id = purchase?.productId, pid = purchase?.purchaseId, g = PK_GOODS[id];
  if (!g || !pid) return false;
  prefs.pkGot = prefs.pkGot || [];
  let j = null;
  try {
    const signedData = await purchase.getSignedData();
    const r = await fetch(window.PK_SB.url.replace(/\/+$/, '') + '/functions/v1/pikabu-verify', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.PK_SB.key }, body: JSON.stringify({ signedData }) });
    j = await r.json().catch(() => null);
  } catch { j = null; }
  if (!j?.ok) { if (loud) toast('Оплата прошла, но проверить покупку сейчас не вышло — она придёт при следующем запуске'); return false; }
  const credited = prefs.pkGot.includes(pid) || (g.once && prefs.starterDone);
  if (!credited) {
    g.grant(); prefs.pkGot.push(pid); if (prefs.pkGot.length > 80) prefs.pkGot.splice(0, prefs.pkGot.length - 80);
    prefs.paidUser = true; store.set(KEY.prefs, prefs);
    sfx.coins?.(); confetti?.(); toast(`${g.ico} «${g.t}» — получено. Спасибо!`);
    track('purchase', { detail: 'pikabu:' + id });
    if (!views.menu.hidden) renderMenu();
    pkSave(true);
  }
  if (purchase.isConsumable) { try { await VDP_PLATFORM.pk.store.consumePurchase(pid); } catch {} }  // не вышло — останется в списке и не начислится второй раз
  return true;
}
async function pkBuy(id, rerender) {
  const pk = VDP_PLATFORM.pk, st = pk?.store;
  if (!st) { pkMsg = 'Магазин Пикабу ещё загружается — попробуйте через пару секунд.'; return rerender(); }
  if (pkBusy && Date.now() - pkBusy < 20000) return;
  pkBusy = Date.now(); pkMsg = 'Открываю оплату…'; rerender();
  try {
    // гость не может платить: сначала вход в аккаунт Пикабу, потом оплата
    if (pk.player && pk.player.isAuthorized === false && pk.auth?.openAuthDialog) {
      pkMsg = 'Войдите в аккаунт Пикабу — после входа откроется оплата.'; rerender();
      try { await pk.auth.openAuthDialog(); } catch {}
      if (pk.player?.isAuthorized === false) { pkMsg = 'Для покупки нужно войти в аккаунт Пикабу (кнопка «Войти» вверху страницы).'; pkBusy = 0; return rerender(); }
    }
    const r = await st.purchase({ productId: id, developerPayload: JSON.stringify({ from: 'shop' }) });
    if (!r?.success) {
      const why = r?.reason;
      if (why === 'NON_CONSUMABLE_ALREADY_OWNED') { pkMsg = 'Этот набор уже куплен — возвращаю его.'; await pkStoreInit(); }
      else pkMsg = why === 'USER_CANCELLED' ? 'Покупка отменена.' : why === 'USER_UNAUTHORIZED' ? 'Для покупки нужно войти в аккаунт Пикабу.' : 'Покупка не прошла. Попробуйте ещё раз.';
    } else { pkMsg = ''; await pkHandle(r.purchase, true); }
  } catch { pkMsg = 'Покупка не прошла. Попробуйте ещё раз.'; }
  pkBusy = 0; rerender();
}
// Окно «Магазин Пикабу»: кнопка «💰 Пополнить» и все места игры, где предлагается купить (js/topup.js, js/shop.js)
const pkShop = ({ then } = {}) => {
  const m = $('modal');
  const render = () => {
    if (m.hidden) return;
    const rows = Object.entries(PK_GOODS).filter(([id, g]) => pkPrices[id] && !(g.once && prefs.starterDone)).map(([id, g]) =>
      `<div class="shp-coffee shp-pay"><b>${g.ico} ${esc(g.t)}</b><small>${esc(g.d)}</small>
        <button class="btn-main" type="button" data-pkbuy="${id}"${pkBusy ? ' disabled' : ''}>Купить${pkPrices[id] ? ' за ' + esc(pkPrices[id]) : ''}</button></div>`).join('');
    m.innerHTML = `<div class="modal-box glass" role="dialog" aria-modal="true" aria-labelledby="pkShopT"><h2 id="pkShopT">🛒 Покупки</h2>
      <p>Оплата — через Пикабу. Покупки сохраняются в вашем аккаунте Пикабу.</p>${rows}
      ${pkMsg ? `<p class="join-note" role="status">${esc(pkMsg)}</p>` : ''}
      <button class="btn-ghost" type="button" id="pkShopX">Закрыть</button></div>`;
    m.querySelectorAll('[data-pkbuy]').forEach(b => b.onclick = () => pkBuy(b.dataset.pkbuy, render));
    $('pkShopX').onclick = () => { m.hidden = true; pkMsg = ''; then?.(); };
  };
  m.hidden = false; render();
};
