// Магазин «🛒 Магазин» в главном меню: всё, за что игрок может заплатить, в одном окне.
// 1) Стартовый набор — один раз, за рубли (Робокасса): 149 ₽ → 30 у.е. + купон на премиум-тему + купон на редкого питомца
//    + 3 бесплатные подсказки. Только тем, кто ещё ничего не покупал, с 2-й недели карьеры; виден и в окне пополнения.
//    Цену и у.е. считает сервер (robokassa-pay, product: 'starter'), подарки выдаёт игра при зачислении (shopGrantProduct).
// 2) «Без рекламы» за у.е.: 30 дней — 40 у.е., навсегда — 150 у.е. Нет обязательной рекламы (между неделями и после
//    разминок) и всплывающих предложений посмотреть рекламу; кнопки «Реклама за награду» остаются — только по нажатию.
// 3) «Редкое»: 6 редких питомцев (✨, корона и искры на 3D-модели) и 6 эксклюзивных вещей персонажа — только здесь.
// 4) Сезонный пропуск «Сезон: <месяц>»: 10 уровней = 10 законченных недель карьеры за календарный месяц.
//    Бесплатные награды — на каждом 2-м уровне, премиум (99 у.е.) — на каждом уровне, на 10-м — вещь сезона и тема.
// 5) Ещё: «x2 у.е. за неделю», набор подсказок, предложение дня со скидкой и таймером, +50% к первому пополнению
//    (сервер), подсказки «Популярное» / «Выгодно» на пакетах пополнения (js/topup.js).
// Данные: prefs (noAdsUntil, noAdsForever, freeHints, x2Weeks, season, dealDay, starterDone, rarePetCoupons, themeCoupons,
// themesOwned) и карьера (C.hero.rare — редкие вещи, питомцы — C.hero.pets с породами из PET_BREEDS).

// ---------- цены ----------
const STARTER = { rub: 149, ue: 30, hints: 3 };
const STARTER_WAS = STARTER.ue * 80;  // те же 30 у.е. по обычной цене (25+ у.е. — 80 ₽ за 1 у.е.)
const NOADS = { d30: { price: 40, days: 30 }, forever: { price: 150 } };
const X2_PRICE = 6;                  // недельный оклад — 10 у.е. и больше: окупается за неделю, если не уволят
const HINTS_PACK = { n: 5, price: 8 };  // подсказка — 2 у.е.: 5 штук за 8 вместо 10
const SEASON_PRICE = 99, SEASON_LEVELS = 10;
const DAY_MS = 864e5;

// ---------- «Без рекламы» ----------
const noAdsOn = () => !!prefs.noAdsForever || (prefs.noAdsUntil || 0) > Date.now();
const noAdsDays = () => Math.ceil(Math.max(0, (prefs.noAdsUntil || 0) - Date.now()) / DAY_MS);
function noAdsAdd(days) {
  prefs.noAdsUntil = Math.max(Date.now(), prefs.noAdsUntil || 0) + days * DAY_MS;
  store.set(KEY.prefs, prefs);
}

// ---------- редкие питомцы: породы с флагом rare не показываются в «Завести питомца» (js/pets.js) ----------
const RARE_PETS = [
  { id: 'cat_golden', kind: 'cat', rare: true, price: 150, t: L('Золотой кот-талисман', 'Golden lucky cat'), color: '#e2b84a', stripes: '#b8862a', face: '#fff0c8', eyes: '#3ad1ff', crown: '#ffd34a', glow: '#ffe680' },
  { id: 'cat_cosmic', kind: 'cat', rare: true, price: 120, t: L('Космический кот', 'Cosmic cat'), color: '#2a2160', stripes: '#7a5cff', face: '#4a3a90', eyes: '#ff3bd4', fluffy: true, glow: '#2de2e6' },
  { id: 'dog_samoyed', kind: 'dog', rare: true, price: 110, t: L('Самоед в короне', 'Crowned Samoyed'), color: '#f7f7f2', mane: true, curl: true, size: 1.15, eyes: '#2a1a10', collar: '#2de2e6', crown: '#e8eef8' },
  { id: 'dog_shiba', kind: 'dog', rare: true, price: 100, t: L('Сиба-ину', 'Shiba Inu'), color: '#d9822b', belly: true, alt: '#fff3e0', face: '#fff3e0', curl: true, collar: '#e0153f', glow: '#ffb02e' },
  { id: 'par_lorikeet', kind: 'parrot', rare: true, price: 80, t: L('Радужный лорикет', 'Rainbow lorikeet'), color: '#2a9d3a', head: '#2a4fd6', alt: '#ff8c1a', tail: '#e0153f', beak: '#ff5c2a', belly: '#ffb02e', longTail: true, glow: '#7cff2e' },
  { id: 'fish_koi', kind: 'fish', rare: true, price: 60, t: L('Карп кои', 'Koi carp'), color: '#f5f5f0', alt: '#ff4a1a', stripe: '#ff4a1a', bigTail: true, glow: '#ffd34a' },
];
if (typeof PET_BREEDS !== 'undefined') for (const b of RARE_PETS) if (!PET_BREEDS.some(x => x.id === b.id)) PET_BREEDS.push(b);

// ---------- эксклюзивные вещи персонажа: настроение сразу и +2 каждую неделю (за все вместе — не больше +8) ----------
const RARE_ITEMS = [
  { id: 'r_neon', ico: '🧥', price: 60, mood: 18, toon: 'wear', t: L('Неоновый бомбер «18:00»', 'Neon “6 PM” bomber'), wear: { jacket: '#ff3bd4', top: '#2de2e6', tie: '', dress: false, short: false } },
  { id: 'r_kicks', ico: '👟', price: 70, mood: 20, toon: 'wear', t: L('Лимитированные кроссовки', 'Limited-edition sneakers'), wear: { shoes: '#ff2e55', heels: false } },
  { id: 'r_watch', ico: '⌚', price: 90, mood: 24, toon: 'delivery', t: L('Швейцарские часы', 'Swiss watch') },
  { id: 'r_gold', ico: '✨', price: 120, mood: 30, toon: 'wear', t: g => g === 'f' ? L('Золотое вечернее платье', 'Golden evening gown') : L('Золотой смокинг', 'Golden tuxedo'),
    wear: g => g === 'f' ? { dress: true, top: '#d4af37', jacket: '', tie: '', heels: true, short: false } : { jacket: '#d4af37', top: '#fff6d6', tie: '#1a1a1a', bottom: '#1a1a1a', short: false } },
  { id: 'r_car', ico: '🏎️', price: 180, mood: 40, toon: 'ride', prop: 'car', t: L('Спорткар', 'Sports car') },
  { id: 'r_yacht', ico: '🛥️', price: 200, mood: 45, toon: 'ride', prop: 'boat', t: L('Яхта', 'Yacht') },
];
const RARE_WEEK_MOOD = 2, RARE_WEEK_CAP = 8;
// Вещь сезона (премиум, 10-й уровень): куртка цвета месяца
const SEASON_COLORS = ['#3d8bff', '#ff5c8a', '#2fe07a', '#ffc53d', '#c48bff', '#ff6a3d', '#2de2e6', '#ffcf3d', '#ff9a2e', '#e8590c', '#8b7bff', '#e0153f'];
const MONTHS = L(['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
const seasonItem = id => {
  const mo = +String(id).slice(-2) - 1 || 0;
  const th = typeof retThemeOf === 'function' ? retThemeOf(mo) : null;  // тема месяца (js/retention.js): своё название вещи сезона
  return { id: 'season_' + id, ico: th?.ico || '🏆', mood: 25, toon: 'wear', t: th ? L(th.item_ru, th.item_en) : L(`Куртка сезона «${MONTHS[mo]}»`, `“${MONTHS[mo]}” season jacket`), wear: { jacket: SEASON_COLORS[mo], tie: '', dress: false, short: false } };
};
const rareItemById = id => RARE_ITEMS.find(x => x.id === id) || (String(id).startsWith('season_') ? seasonItem(String(id).slice(7)) : null);

// ---------- общее ----------
const shpCareer = () => careerNow();
const shpHero = () => shpCareer()?.hero;
const shpInGame = () => typeof S !== 'undefined' && S?.mode === 'career' && !views.game.hidden;
// Списать у.е. со счёта карьеры; не хватает — окно пополнения (потом снова магазин)
function shpSpend(price, id, what, back, C2 = shpCareer()) {  // C2 — тот же объект карьеры, что потом сохраняет вызывающий
  if (!needReg('shop')) return false;
  if (!C2) { toast(L('Покупки за у.е. — в карьере. Начните её кнопкой «Играть».', 'Spend $ in your career — start one with “Play”.')); return false; }
  if ((C2.bank || 0) < price) {
    openTopup({ need: lackOf(price), why: L(`${what} — ${money(price)} · на счёте ${money(C2.bank || 0)}`, `${what} — ${money(price)} · you have ${money(C2.bank || 0)}`), then: back });
    return false;
  }
  C2.bank -= price; C2.spent = (C2.spent || 0) + price; careerSave(C2);
  if (shpInGame()) renderBars?.();
  sfx.coins?.();
  track('shop_buy', { detail: `${id}:${price}` });
  return true;
}
const shpPrice = price => { const C2 = shpCareer(), short = !C2 || (C2.bank || 0) < price; return short && C2 ? `💰 ${money(price)}` : money(price); };
const savePrefs = () => store.set(KEY.prefs, prefs);
const hhmmss = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':'); };
const toMidnight = () => { const d = new Date(); d.setHours(24, 0, 0, 0); return d - Date.now(); };

// ---------- купоны: тема и редкий питомец ----------
// Темы делает «Оформление» (другой модуль): купленные id — в prefs.themesOwned, неиспользованные купоны — prefs.themeCoupons.
// Если модуль оформления объявил список платных тем (PAID_THEMES / PREMIUM_THEMES: [{ id, name }]) или openThemePicker() —
// магазин предложит выбрать тему сразу.
const paidThemes = () => [typeof PAID_THEMES !== 'undefined' && PAID_THEMES, typeof PREMIUM_THEMES !== 'undefined' && PREMIUM_THEMES].find(x => Array.isArray(x) && x.length) || null;
function useThemeCoupon(id) {
  if (/^\d+$/.test(String(id))) id = +id;  // темы в js/game.js — номера
  if (!((prefs.themeCoupons || 0) > 0) || id == null || id === '') return false;
  prefs.themeCoupons--; prefs.themesOwned = [...new Set([...(prefs.themesOwned || []), id])]; savePrefs();
  track('shop_theme', { detail: String(id).slice(0, 40) });
  return true;
}
function grantThemeCoupon() { prefs.themeCoupons = (prefs.themeCoupons || 0) + 1; savePrefs(); }
function themeCouponPick(back) {
  if (typeof openThemePicker === 'function') return openThemePicker();
  const list = paidThemes()?.filter(t => !(prefs.themesOwned || []).includes(t.id));
  if (!list?.length) { toast(L('🎨 Купон на тему сохранён — выберите тему в «Оформлении»', '🎨 Theme coupon saved — pick a theme in “Appearance”')); return back?.(); }
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="shpThT"><span class="lvl-ico" aria-hidden="true">🎨</span>
    <h2 id="shpThT">${L('Тема по купону', 'Theme coupon')}</h2><div class="shp-themes">${list.map(t => `<button type="button" class="btn-chip" data-th="${esc(t.id)}">${esc(t.name || t.id)}</button>`).join('')}</div>
    <button class="btn-ghost" type="button" id="shpThX">${L('Позже', 'Later')}</button></div>`;
  m.hidden = false;
  m.querySelectorAll('[data-th]').forEach(b => b.onclick = () => { if (useThemeCoupon(b.dataset.th)) { toast(L('🎨 Тема ваша! Включите её в «Оформлении»', '🎨 The theme is yours! Turn it on in “Appearance”')); m.hidden = true; back?.(); } });
  $('shpThX').onclick = () => { m.hidden = true; back?.(); };
}

// ---------- Стартовый набор ----------
const starterOn = () => !window.VDP_PLATFORM && !prefs.paidUser && !prefs.starterDone && (shpCareer()?.week || 0) >= 2;
// where: 'tu' — в окне пополнения (там своё согласие с офертой), 'shp' — в магазине
function shopStarterHtml(where = 'shp') {
  if (!starterOn()) return '';
  const off = Math.floor((1 - STARTER.rub / STARTER_WAS) * 10) * 10;
  return `<div class="shp-starter shp-pay">
    <span class="shp-badge">−${off}%</span>
    <b class="shp-st-t">🎁 ${L('Стартовый набор', 'Starter pack')}</b>
    <ul class="shp-st-list"><li>💰 <b>${money(STARTER.ue)}</b> ${L('на счёт', 'to your balance')}</li><li>🎨 ${L('премиум-тема оформления на выбор', 'a premium theme of your choice')}</li>
      <li>✨ ${L('купон на редкого питомца', 'a rare pet coupon')}</li><li>💡 ${L(`${STARTER.hints} бесплатные подсказки`, `${STARTER.hints} free hints`)}</li></ul>
    <p class="shp-st-p"><s>${STARTER_WAS.toLocaleString('ru-RU')} ₽</s> <b>${STARTER.rub} ₽</b> <small>${L('один раз', 'one time only')}</small></p>
    ${where === 'shp' ? `<label class="tu-agree"><input type="checkbox" id="shpAgree"> <span>${L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a> и <a href="politika.html" target="_blank" rel="noopener">политикой обработки персональных данных</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a> and <a href="politika.html" target="_blank" rel="noopener">privacy policy</a> (in Russian)')}</span></label><p class="join-err" id="shpErr" role="alert"></p>` : ''}
    <button class="btn-main" type="button" data-product="starter">${L(`Купить за ${STARTER.rub} ₽`, `Buy for ${STARTER.rub} ₽`)}</button></div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-product]'); if (!b) return;
  e.preventDefault(); productPay(b);
});
// Покупка за рубли товара с фиксированной ценой (цену и у.е. считает сервер, robokassa-pay): starter, coffee
const PRODUCT_RUB = { starter: STARTER.rub, coffee: 100, noads: 99 }, PRODUCT_UE = { starter: STARTER.ue, coffee: 10, noads: 0 };
async function productPay(btn) {
  const product = btn.dataset.product, card = btn.closest('.shp-pay'), box = btn.closest('.modal-box') || document;
  const agree = card?.querySelector('input[type=checkbox]') || box.querySelector('#tuAgree'), err = card?.querySelector('.join-err') || box.querySelector('#tuErr');
  const say = t => { if (err) err.textContent = t; else toast(t); };
  if (agree && !agree.checked) return say(L('Отметьте согласие с офертой.', 'Please accept the public offer.'));
  if (window.VDP_PLATFORM) return toast(L('Покупка доступна на сайте survivefriday.com', 'Purchases are available on survivefriday.com'));
  if (!(typeof registered === 'function' && registered())) {
    $('modal').hidden = true; $('profSheet') && ($('profSheet').hidden = true);
    return renderJoin('login', L('Чтобы купить, войдите в аккаунт — так покупка не потеряется и будет на всех устройствах.', 'Sign in to buy — so your purchase is safe and on every device.'));
  }
  track('buy_intent', { detail: `${product}:${PRODUCT_RUB[product]}` });
  const label = btn.textContent; btn.disabled = true; btn.textContent = L('Переходим к оплате…', 'Opening the payment page…');
  try {
    const r = await fnPost('robokassa-pay', { access_token: await board.accessToken(), product, email: prefs.email || '' });
    if (!r?.url) throw new Error(r?.error || 'no url');
    store.set('vdp-pay-pending', { inv: r.inv_id, ue: PRODUCT_UE[product], product, at: Date.now() });
    location.href = r.url;
  } catch (e) {
    btn.disabled = false; btn.textContent = label;
    const m = e.code || e.message || '';
    if (/starter_taken/.test(m)) { prefs.starterDone = true; savePrefs(); return say(L('Стартовый набор уже куплен на этом аккаунте — спасибо!', 'You already bought the Starter pack — thank you!')); }
    say(/not_configured/.test(m) ? L('Оплата картой появится совсем скоро. А пока у.е. можно заработать в игре.', 'Card payments are coming very soon. Meanwhile, earn $ in the game.')
      : /session/.test(m) ? L('Войдите в аккаунт ещё раз и повторите оплату.', 'Please sign in again and retry.')
      : L('Не удалось открыть оплату — попробуйте ещё раз.', 'Couldn’t open the payment page — please try again.'));
  }
}

// ---------- «☕ Кофе разработчикам»: цифровой товар за 100 ₽ (не пожертвование) — значок «☕ Меценат ×N» в профиле и +10 у.е. ----------
const coffeeBadge = () => (prefs.coffeeN || 0) > 0 ? `<span class="shp-maecenas" title="${L('Купил кофе разработчикам', 'Bought the devs a coffee')}">☕ ${L('Меценат', 'Patron')}${prefs.coffeeN > 1 ? ` ×${prefs.coffeeN}` : ''}</span>` : '';
const coffeeHtml = (id = 'shp') => window.VDP_PLATFORM ? '' : `<div class="shp-coffee shp-pay">
  <b>☕ ${L('Кофе разработчикам', 'A coffee for the devs')} — 100 ₽</b>
  <p>${L('Игру делает один человек по вечерам. Угостите разработчика кофе — и получите значок «☕ Меценат» в профиле (навсегда, со счётчиком) и +10 у.е. на счёт.', 'One person makes this game in the evenings. Treat the developer to a coffee and get a permanent “☕ Patron” profile badge (with a counter) and +$10.')}</p>
  ${coffeeBadge() ? `<p class="shp-ok">${L('Ваш значок:', 'Your badge:')} ${coffeeBadge()} — ${L('спасибо!', 'thank you!')}</p>` : ''}
  <label class="tu-agree"><input type="checkbox" id="${id}CofAgree"> <span>${L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a>')}</span></label>
  <p class="join-err" role="alert"></p>
  <button class="btn-ghost" type="button" data-product="coffee">☕ ${L('Купить кофе — 100 ₽', 'Buy a coffee — 100 ₽')}</button></div>`;
function coffeeThanks() {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="shpCfT"><span class="lvl-ico" aria-hidden="true">☕</span>
    <h2 id="shpCfT">${L('Спасибо огромное!', 'Thank you so much!')}</h2>
    <p>${L('Кофе уже варится, а следующая порция карточек, разминок и шуток про понедельник будет написана с ним. Это правда помогает игре жить.', 'The coffee is brewing, and the next batch of cards, warm-ups and Monday jokes will be written with it. It truly keeps the game alive.')}</p>
    <p>${L('В профиле теперь значок', 'Your profile now has the badge')} ${coffeeBadge()} ${L('и +10 у.е. на счёте.', 'and +$10 in the bank.')}</p>
    <button class="btn-main" type="button" id="shpCfOk">${L('Пожалуйста! ❤️', 'You’re welcome! ❤️')}</button></div>`;
  m.hidden = false; confetti?.();
  $('shpCfOk').onclick = () => { m.hidden = true; if (!views.menu.hidden) renderMenu(); };
}

// Зачисление (js/topup.js, claimPaid): у.е. уже на счёте, здесь — подарки. Повторное зачисление подарки не дублирует
function shopGrantProduct(product) {
  if (product === 'noads') { noAdsAdd(30); track('noads_rub'); toast(L('🚫 30 дней без рекламы — спасибо!', '🚫 30 ad-free days — thank you!')); return; }
  if (product === 'coffee') { prefs.coffeeN = (prefs.coffeeN || 0) + 1; savePrefs(); track('coffee_buy', { detail: String(prefs.coffeeN) }); setTimeout(coffeeThanks, 900); return; }
  if (product !== 'starter' || prefs.starterDone) { prefs.starterDone = prefs.starterDone || product === 'starter'; savePrefs(); return; }
  prefs.starterDone = true;
  prefs.freeHints = (prefs.freeHints || 0) + STARTER.hints;
  prefs.rarePetCoupons = (prefs.rarePetCoupons || 0) + 1;
  savePrefs(); grantThemeCoupon();
  track('shop_starter', { detail: 'granted' });
}

// ---------- x2 у.е. за неделю ----------
// Действует на ближайшую законченную неделю карьеры (и при увольнении — за отработанные дни): зарплата недели ещё раз
bus.on('weekEnd', x => {
  if (x.mode !== 'career' || !((prefs.x2Weeks || 0) > 0) || typeof S === 'undefined' || !S) return;
  const n = Math.round(S.earned || 0); if (!n) return;
  prefs.x2Weeks--; savePrefs(); addCash(n);
  track('shop_x2', { detail: String(n) });
  setTimeout(() => toast(L(`⚡ x2 у.е.: ещё +${money(n)} к зарплате недели`, `⚡ x2 $: another +${money(n)} on top of this week’s pay`)), 2000);
});
// Редкие вещи греют душу каждую неделю
bus.on('weekEnd', x => {
  if (x.mode !== 'career') return;
  const C2 = shpCareer(), h = C2?.hero, n = (h?.rare || []).length; if (!n) return;
  h.mood = Math.min(100, (h.mood ?? 70) + Math.min(RARE_WEEK_CAP, n * RARE_WEEK_MOOD)); careerSave(C2);
});

// ---------- сезонный пропуск ----------
const seasonId = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const seasonName = id => MONTHS[(+String(id).slice(-2) - 1) || 0];
const seasonDaysLeft = () => { const d = new Date(), e = new Date(d.getFullYear(), d.getMonth() + 1, 1); return Math.max(1, Math.ceil((e - d) / DAY_MS)); };
function seasonState() {
  const id = seasonId();
  if (prefs.season?.id !== id) { prefs.season = { id, weeks: 0, prem: false, free: [], paid: [] }; savePrefs(); }
  return prefs.season;
}
const seasonLevel = st => Math.min(SEASON_LEVELS, st.weeks || 0);
// Награды: ue — у.е., hints — бесплатные подсказки, x2 — недели «x2 у.е.», noads — дни без рекламы, item — вещь сезона, theme — купон на тему
const SEASON_FREE = { 2: { ue: 2 }, 4: { ue: 2 }, 6: { hints: 2 }, 8: { ue: 3 }, 10: { ue: 5 } };
const SEASON_PAID = { 1: { ue: 8 }, 2: { hints: 3 }, 3: { ue: 12 }, 4: { x2: 1 }, 5: { ue: 16 }, 6: { hints: 5 }, 7: { ue: 20 }, 8: { noads: 7 }, 9: { ue: 25 }, 10: { item: 1, theme: 1 } };
const rewardText = (r, st) => [
  r.ue && `💰 ${money(r.ue)}`, r.hints && `💡 ${L(`${r.hints} подсказ${r.hints < 5 ? 'ки' : 'ок'}`, `${r.hints} hints`)}`, r.x2 && `⚡ x2 ${L('у.е. на неделю', '$ for a week')}`,
  r.noads && `🚫 ${L(`${r.noads} дней без рекламы`, `${r.noads} days ad-free`)}`, r.item && `🏆 ${esc(goodText(seasonItem(st?.id || seasonId()), shpHero()))}`, r.theme && `🎨 ${L('тема на выбор', 'a theme of your choice')}`,
].filter(Boolean).join(' + ');
const seasonClaimable = st => {
  const lv = seasonLevel(st); let n = 0;
  for (let i = 1; i <= lv; i++) { if (SEASON_FREE[i] && !st.free.includes(i)) n++; if (st.prem && SEASON_PAID[i] && !st.paid.includes(i)) n++; }
  return n;
};
function grantReward(r, st) {
  if (r.item) {
    const C2 = shpCareer(), h = C2?.hero;
    if (!h) { toast(L('Вещь сезона — для персонажа карьеры: начните карьеру и заберите её', 'The season item is for your career character: start a career and claim it')); return false; }
    const x = seasonItem(st.id); giveRareItem(x, C2, h);
  }
  if (r.ue) addCash(r.ue);
  if (r.hints) prefs.freeHints = (prefs.freeHints || 0) + r.hints;
  if (r.x2) prefs.x2Weeks = (prefs.x2Weeks || 0) + r.x2;
  if (r.noads) noAdsAdd(r.noads);
  if (r.theme) grantThemeCoupon();
  savePrefs();
  return true;
}
bus.on('weekEnd', x => {
  if (x.mode !== 'career') return;
  const st = seasonState(), before = seasonLevel(st);
  st.weeks = (st.weeks || 0) + 1; savePrefs();
  const lv = seasonLevel(st);
  if (lv > before && (SEASON_FREE[lv] || st.prem)) setTimeout(() => toast(L(`🏆 Сезон «${seasonName(st.id)}»: уровень ${lv} — награда ждёт в меню`, `🏆 ${seasonName(st.id)} season: level ${lv} — your reward is waiting in the menu`)), 3200);
});
function openSeason(back) {
  const m = $('modal');
  const render = () => {
    const st = seasonState(), lv = seasonLevel(st), C2 = shpCareer();
    const cell = (i, r, track2) => {
      if (!r) return `<span class="shp-sc-cell empty">—</span>`;
      const got = (track2 === 'paid' ? st.paid : st.free).includes(i), lock = track2 === 'paid' && !st.prem, open = i <= lv;
      return `<span class="shp-sc-cell${got ? ' got' : ''}${lock ? ' lock' : ''}"><small>${rewardText(r, st)}</small>${got ? `<em>✓</em>` : lock ? `<em>🔒</em>` : open ? `<button type="button" class="btn-chip" data-claim="${track2}:${i}">${L('Забрать', 'Claim')}</button>` : ''}</span>`;
    };
    m.innerHTML = `<div class="modal-box glass cert-box shp-season-box" role="dialog" aria-modal="true" aria-labelledby="shpSnT">
      <span class="lvl-ico" aria-hidden="true">🏆</span>
      <h2 id="shpSnT">${L(`Сезон: ${seasonName(st.id)}`, `Season: ${seasonName(st.id)}`)}</h2>
      ${typeof retThemeBadge === 'function' ? retThemeBadge(st.id, true) : ''}
      <p>${L(`Каждая законченная неделя карьеры — +1 уровень. Уровень ${lv}/${SEASON_LEVELS} · до конца сезона ${pl(seasonDaysLeft(), 'день', 'дня', 'дней', 'day', 'days')}.`, `Every finished career week is +1 level. Level ${lv}/${SEASON_LEVELS} · ${pl(seasonDaysLeft(), '', '', '', 'day', 'days')} left in the season.`)}</p>
      <div class="shp-sc-bar"><i style="width:${lv / SEASON_LEVELS * 100}%"></i></div>
      <div class="shp-sc-grid"><b>${L('Ур.', 'Lv')}</b><b>${L('Бесплатно', 'Free')}</b><b>⭐ ${L('Премиум', 'Premium')}</b>
        ${Array.from({ length: SEASON_LEVELS }, (_, k) => k + 1).map(i => `<span class="shp-sc-lv${i <= lv ? ' on' : ''}">${i}</span>${cell(i, SEASON_FREE[i], 'free')}${cell(i, SEASON_PAID[i], 'paid')}`).join('')}</div>
      ${st.prem ? `<p class="shp-ok">⭐ ${L('Премиум-дорожка открыта до конца месяца', 'Premium track unlocked until the end of the month')}</p>`
        : `<button class="btn-main" type="button" id="shpSnBuy">⭐ ${L(`Открыть премиум за ${money(SEASON_PRICE)}`, `Unlock premium for ${money(SEASON_PRICE)}`)}</button>
           <p class="field-note">${L(`Премиум окупается: за 10 недель — ${money(81)}, подсказки, x2, неделя без рекламы, вещь сезона и тема. Награды за уже пройденные уровни — тоже ваши.`, `Premium pays for itself: over 10 weeks — ${money(81)}, hints, x2, a week ad-free, the season item and a theme. Rewards for levels you’ve already reached are yours too.`)}${C2 ? '' : ' ' + L('Покупка — со счёта карьеры.', 'Paid from your career balance.')}</p>`}
      <button class="btn-ghost" type="button" id="shpSnX">${L('Закрыть', 'Close')}</button></div>`;
    m.hidden = false;
    m.querySelectorAll('[data-claim]').forEach(b => b.onclick = () => {
      const [tr, i] = b.dataset.claim.split(':'), lvl = +i, r = (tr === 'paid' ? SEASON_PAID : SEASON_FREE)[lvl], list = tr === 'paid' ? st.paid : st.free;
      if (list.includes(lvl) || lvl > seasonLevel(st) || (tr === 'paid' && !st.prem)) return;
      if (!grantReward(r, st)) return;
      list.push(lvl); savePrefs(); sfx.coins?.();
      track('season_claim', { detail: `${tr}:${lvl}` });
      toast(L(`🏆 Получено: ${rewardText(r, st).replace(/<[^>]+>/g, '')}`, `🏆 Received: ${rewardText(r, st).replace(/<[^>]+>/g, '')}`));
      if (r.theme) return themeCouponPick(render);
      render();
    });
    if ($('shpSnBuy')) $('shpSnBuy').onclick = () => {
      if (!shpSpend(SEASON_PRICE, 'season', L('Премиум сезона', 'Season premium'), () => openSeason(back))) return;
      st.prem = true; savePrefs(); confetti?.();
      toast(L('⭐ Премиум сезона открыт — забирайте награды!', '⭐ Season premium unlocked — claim your rewards!'));
      render();
    };
    $('shpSnX').onclick = () => { m.hidden = true; back ? back() : !views.menu.hidden && renderMenu(); };
  };
  render();
}
// Компактная карточка сезона в меню
function seasonCard() {
  const box = $('seasonCard'); if (!box) return;
  if (window.VDP_PLATFORM || !shpCareer()) { box.hidden = true; return; }
  const st = seasonState(), lv = seasonLevel(st), n = seasonClaimable(st);
  box.hidden = false;
  box.innerHTML = `<button type="button" class="shp-sc-card" id="seasonOpen"><span class="shp-sc-ico" aria-hidden="true">🏆</span>
    <span class="shp-sc-txt"><b>${L(`Сезон: ${seasonName(st.id)}`, `Season: ${seasonName(st.id)}`)}${st.prem ? ' ⭐' : ''}</b>${typeof retThemeBadge === 'function' ? retThemeBadge(st.id) : ''}<small>${L(`уровень ${lv}/${SEASON_LEVELS} · ещё ${pl(seasonDaysLeft(), 'день', 'дня', 'дней', 'day', 'days')}`, `level ${lv}/${SEASON_LEVELS} · ${pl(seasonDaysLeft(), '', '', '', 'day', 'days')} left`)}</small>
      <span class="shp-sc-bar"><i style="width:${lv / SEASON_LEVELS * 100}%"></i></span></span>
    ${n ? `<em class="shp-sc-n">${L(`Забрать: ${n}`, `Claim: ${n}`)}</em>` : '<em class="shp-sc-go">›</em>'}</button>`;
  $('seasonOpen').onclick = () => openSeason();
}

// ---------- предложение дня ----------
const DEALS = [
  { id: 'hints5', ico: '💡', base: 10, price: 6, t: () => L('5 подсказок', '5 hints') },
  { id: 'x2', ico: '⚡', base: X2_PRICE, price: 4, t: () => L('x2 у.е. за неделю', 'x2 $ for a week') },
  { id: 'noads7', ico: '🚫', base: 12, price: 8, t: () => L('Неделя без рекламы', 'A week ad-free') },
  { id: 'item', ico: '✨', t: () => '' },
  { id: 'pet', ico: '🐾', t: () => '' },
];
function dealToday() {
  const d = today(), h = [...d].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const x = { ...DEALS[h % DEALS.length] };
  if (x.id === 'item') { const it = RARE_ITEMS[(h >> 3) % RARE_ITEMS.length]; Object.assign(x, { ico: it.ico, base: it.price, price: Math.round(it.price * 0.7), ref: it.id, t: () => goodText(it, shpHero()) }); }
  if (x.id === 'pet') { const p = RARE_PETS[(h >> 3) % RARE_PETS.length]; Object.assign(x, { ico: PET_KINDS[p.kind].ico, base: p.price, price: Math.round(p.price * 0.7), ref: p.id, t: () => p.t }); }
  return x;
}
const dealBought = () => prefs.dealDay === today();

// ---------- редкие вещи и питомцы: выдача ----------
function giveRareItem(x, C2, h, back) {
  h.rare ||= [];
  if (!h.rare.includes(x.id)) h.rare.push(x.id);
  h.mood = Math.min(100, (h.mood ?? 70) + x.mood);
  if (x.wear) { const w = typeof x.wear === 'function' ? x.wear(heroPreset(h).g) : x.wear; h.wear = { ...(h.wear || {}), ...w }; }
  careerSave(C2);
  if (back !== undefined) playToon({ kind: x.toon, prop: x.prop, list: [x], mood: x.mood, h }, back);
}
function buyRareItem(id, price, back) {
  const x = rareItemById(id), C2 = shpCareer(), h = C2?.hero;
  if (!x) return false;
  if (!h) { toast(L('Редкие вещи — для персонажа карьеры. Начните карьеру кнопкой «Играть».', 'Rare items are for your career character. Start a career with “Play”.')); return false; }
  if (h.rare?.includes(x.id)) { toast(L('Уже есть', 'Already yours')); return false; }
  if (!shpSpend(price ?? x.price, x.id, goodText(x, h), back, C2)) return false;
  $('modal').hidden = true;
  giveRareItem(x, C2, h, back);
  return true;
}
// Карточка редкой вещи: персонаж уже с ней (на машине/яхте, в обновке, с часами в руке), описание, цена — и только потом покупка
const RARE_DESC = {
  r_neon: L('Яркий бомбер с надписью «18:00» — персонаж носит его в мультиках и на карточке.', 'A bright bomber with “6 PM” on the back — your character wears it in cartoons and on the card.'),
  r_kicks: L('Красные лимитированные кроссовки: такие есть только у избранных.', 'Red limited-edition sneakers — only a lucky few have them.'),
  r_watch: L('Швейцарские часы — чтобы точно знать, сколько осталось до пятницы.', 'A Swiss watch — so you always know how long until Friday.'),
  r_gold: L('Золотой образ для корпоратива и красной дорожки.', 'A golden look for the office party and the red carpet.'),
  r_car: L('Спорткар: персонаж уезжает на нём в мультике, а коллеги завидуют.', 'A sports car — your character speeds off in it in the cartoon, coworkers envy.'),
  r_yacht: L('Собственная яхта: выходные на воде, никаких писем от босса.', 'Your own yacht — weekends on the water, no emails from the boss.'),
};
function rareItemView(id, back, price) {
  const x = rareItemById(id), C2 = shpCareer(), h = C2?.hero; if (!x) return;
  if (!h) return toast(L('Редкие вещи — для персонажа карьеры. Начните карьеру кнопкой «Играть».', 'Rare items are for your career character. Start a career with “Play”.'));
  const cost = price ?? x.price, has = h.rare?.includes(x.id), g = heroPreset(h).g;
  const w = x.wear ? (typeof x.wear === 'function' ? x.wear(g) : x.wear) : null;
  dropView?.();
  const m = $('modal');
  let view = null;
  const close = () => { view?.dispose(); view = null; m.hidden = true; };
  m.innerHTML = `<div class="modal-box glass hero-box shp-item" role="dialog" aria-modal="true" aria-labelledby="shpItT">
    <h2 id="shpItT"><span class="shp-item-ico" aria-hidden="true">${x.ico}</span> ${esc(goodText(x, h))} ✨</h2>
    <div class="shp-item-stage${x.toon === 'ride' ? ` ride bg-${x.prop}` : ''}"><canvas class="pet-cv shp-item-cv" aria-label="${esc(goodText(x, h))}"></canvas><span class="shp-item-big" aria-hidden="true">${x.ico}</span></div>
    <p class="hero-lead">${RARE_DESC[x.id] || ''} ${L(`Настроение персонажа +${x.mood} сразу и +${RARE_WEEK_MOOD} каждую неделю.`, `Character mood +${x.mood} now and +${RARE_WEEK_MOOD} every week.`)}</p>
    ${has ? `<p class="shp-ok">✓ ${L('Уже ваша', 'Already yours')}</p>` : `<button class="btn-main" type="button" id="shpItBuy">${L(`Купить за ${money(cost)}`, `Buy for ${money(cost)}`)}</button>`}
    <button class="btn-ghost" type="button" id="shpItBack">${L('Назад', 'Back')}</button></div>`;
  m.hidden = false;
  const cv = m.querySelector('.shp-item-cv');
  const look = { ...heroLook(h), ...(w || {}) };
  heroViewer(cv, look, { framing: x.toon === 'ride' ? 'wide' : 'full', emotion: 'happy', interactive: true, yawRest: x.toon === 'ride' ? 1.1 : -0.25, stage: x.toon === 'ride' }).then(v => {
    if (!v || !cv.isConnected || m.hidden) return v?.dispose();
    view = v;
    if (x.toon === 'ride' && x.prop) v.setProp(x.prop);
    else if (!w) { v.hold(x.ico); v.setAction('show'); }
    else v.setAction('spin');
  });
  if ($('shpItBuy')) $('shpItBuy').onclick = () => { close(); if (buyRareItem(id, price, back) && price != null) { prefs.dealDay = today(); savePrefs(); } };
  $('shpItBack').onclick = () => { close(); back?.(); };
}
// Окно редкого питомца: 3D, кличка, покупка (у.е. или купон из Стартового набора)
function rarePetView(id, back, price) {
  const b = RARE_PETS.find(x => x.id === id), C2 = shpCareer(), h = C2?.hero; if (!b) return;
  if (!h) return toast(L('Питомцы — у персонажа карьеры. Начните карьеру кнопкой «Играть».', 'Pets live with your career character. Start a career with “Play”.'));
  const k = PET_KINDS[b.kind], coupon = (prefs.rarePetCoupons || 0) > 0, cost = price ?? b.price, full = (h.pets || []).length >= PET_MAX;
  dropView?.();
  const m = $('modal');
  let view = null;
  const close = () => { view?.dispose(); view = null; m.hidden = true; };
  m.innerHTML = `<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="shpPtT">
    <h2 id="shpPtT">${k.ico} ${esc(b.t)} ✨</h2>
    <canvas class="pet-cv" aria-label="${esc(b.t)}"></canvas>
    <p class="hero-lead">${L('Редкая порода — только в магазине. Ест и играет как обычный питомец, но радует больше: настроение сразу 100.', 'A rare breed — only in the shop. Eats and plays like any pet, but brings more joy: mood starts at 100.')}</p>
    <label class="field"><span>${L('Кличка', 'Name')}</span><input type="text" id="shpPtName" maxlength="14" autocomplete="off" value="${esc(rnd(k.names))}"></label>
    ${full ? `<p class="join-err">${L(`Больше ${PET_MAX} питомцев не поместится в квартиру`, `No room for more than ${PET_MAX} pets`)}</p>`
      : `${coupon ? `<button class="btn-main" type="button" id="shpPtCoupon">🎟️ ${L('Забрать по купону', 'Take it with the coupon')}</button>` : ''}
         <button class="${coupon ? 'btn-ghost' : 'btn-main'}" type="button" id="shpPtBuy">🏡 ${L(`Забрать домой за ${money(cost)}`, `Take home for ${money(cost)}`)}</button>`}
    <button class="btn-ghost" type="button" id="shpPtBack">${L('Назад', 'Back')}</button></div>`;
  m.hidden = false;
  const cv = m.querySelector('.pet-cv');
  petViewer(cv, b, { action: 'happy' }).then(v => { if (v && cv.isConnected && !m.hidden) view = v; else v?.dispose(); });
  const take = how => {
    const nm = ($('shpPtName').value || rnd(k.names)).trim().slice(0, 14) || rnd(k.names);
    if (how === 'coupon') { prefs.rarePetCoupons--; savePrefs(); track('shop_buy', { detail: `${b.id}:coupon` }); }
    else if (!shpSpend(cost, b.id, b.t, () => rarePetView(id, back, price), C2)) return;
    if (price != null) { prefs.dealDay = today(); savePrefs(); }
    h.pets ||= [];
    const p = { id: 'p' + Date.now().toString(36), kind: b.kind, breed: b.id, name: nm, mood: 100, have: [], last: { p_food: C2.week }, rare: true };
    h.pets.push(p); h.mood = Math.min(100, (h.mood ?? 70) + 20); careerSave(C2);
    track('pet_adopt', { detail: b.id });
    close(); petToon('adopt', p, null, back);
  };
  if ($('shpPtCoupon')) $('shpPtCoupon').onclick = () => take('coupon');
  if ($('shpPtBuy')) $('shpPtBuy').onclick = () => take('ue');
  $('shpPtBack').onclick = () => { close(); back?.(); };
}

// ---------- окно магазина ----------
let shpTick = 0;
function openStore(section = '', after) {
  const m = $('modal');
  const back = () => openStore('', after);
  clearInterval(shpTick);
  const render = () => {
    const C2 = shpCareer(), h = C2?.hero, deal = dealToday(), st = seasonState();
    const rows = (list, fn) => `<div class="gp-list">${list.map(fn).join('')}</div>`;
    const buyBtn = (attr, price, label) => `<button type="button" class="btn-chip${!C2 || (C2.bank || 0) < price ? ' tu-btn' : ''}" ${attr}>${label || ''}${shpPrice(price)}</button>`;
    m.innerHTML = `<div class="modal-box glass shp-box" role="dialog" aria-modal="true" aria-labelledby="shpTitle">
      <h2 id="shpTitle">🛒 ${L('Магазин', 'Shop')}</h2>
      <p class="shop-bal">${C2 ? L(`На счёте: <b>${money(C2.bank || 0)}</b>`, `Balance: <b>${money(C2.bank || 0)}</b>`) : L('У.е. тратятся в карьере — начните её кнопкой «Играть».', 'Spend $ in your career — start one with “Play”.')} ${window.VDP_PLATFORM ? '' : topupBtn(0, '')}</p>
      <nav class="shp-nav">${[['shpDeal', L('🔥 Выгодно', '🔥 Deals')], ['shpNoads', L('🚫 Без рекламы', '🚫 Ad-free')], ['shpBoost', L('⚡ Бустеры', '⚡ Boosters')], ['shpRare', L('✨ Редкое', '✨ Rare')], ['shpSeason', L('🏆 Сезон', '🏆 Season')]].map(([id, t]) => `<button type="button" class="btn-chip" data-go="${id}">${t}</button>`).join('')}</nav>
      ${shopStarterHtml('shp')}
      <section id="shpDeal" class="shp-sec"><h3 class="hs-h">🔥 ${L('Предложение дня', 'Deal of the day')} <small class="shp-timer" id="shpTimer">${hhmmss(toMidnight())}</small></h3>
        <div class="shp-deal${dealBought() ? ' done' : ''}"><span class="gp-ico" aria-hidden="true">${deal.ico}</span><span class="gp-txt"><b>${esc(deal.t())}</b><small><s>${money(deal.base)}</s> → <b>${money(deal.price)}</b> · −${Math.round((1 - deal.price / deal.base) * 100)}%</small></span>
          ${dealBought() ? `<em class="gp-own">✓ ${L('куплено', 'bought')}</em>` : buyBtn(`data-deal="1"`, deal.price)}</div>
        ${(prefs.themeCoupons || 0) > 0 ? `<button type="button" class="btn-ghost" id="shpThemePick">🎨 ${L(`Выбрать тему по купону (${prefs.themeCoupons})`, `Pick a theme with your coupon (${prefs.themeCoupons})`)}</button>` : ''}</section>
      <section id="shpNoads" class="shp-sec"><h3 class="hs-h">🚫 ${L('Без рекламы', 'Ad-free')}</h3>
        <p class="field-note">${noAdsOn() ? `<b class="shp-ok">✓ ${prefs.noAdsForever ? L('Реклама отключена навсегда', 'Ads are off forever') : L(`Реклама отключена: ещё ${pl(noAdsDays(), 'день', 'дня', 'дней', 'day', 'days')}`, `Ads are off: ${pl(noAdsDays(), '', '', '', 'more day', 'more days')}`)}</b> · ` : ''}${L('Ни обязательной рекламы между неделями и после разминок, ни всплывающих предложений. «Реклама за награду» остаётся — только если сами нажмёте.', 'No ads between weeks or after warm-ups and no ad pop-ups. Rewarded ads stay — only when you tap them.')}</p>
        ${prefs.noAdsForever ? '' : rows([['d30', '📅', L('30 дней без рекламы', '30 days ad-free'), NOADS.d30.price, L('продлевает текущий срок', 'extends your current period')], ['forever', '♾️', L('Навсегда', 'Forever'), NOADS.forever.price, L('один раз — и больше никакой рекламы', 'pay once — no more ads, ever')]],
          ([id, ico, t, price, sub]) => `<div class="gp-item${id === 'forever' ? ' shp-best' : ''}"><span class="gp-ico" aria-hidden="true">${ico}</span><span class="gp-txt"><b>${t}</b><small>${sub}</small></span>${buyBtn(`data-noads="${id}"`, price)}</div>`)}}
        ${prefs.noAdsForever || window.VDP_PLATFORM ? '' : `<div class="shp-coffee shp-pay"><b>💳 ${L('30 дней без рекламы — 99 ₽', '30 ad-free days — 99 ₽')}</b>
          <p>${L('Оплата картой или СБП, без трат у.е. Срок складывается с текущим.', 'Pay by card, no $ spent. Adds to your current period.')}</p>
          <label class="tu-agree"><input type="checkbox"> <span>${L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a>')}</span></label>
          <p class="join-err" role="alert"></p>
          <button class="btn-main" type="button" data-product="noads">${L('Купить за 99 ₽', 'Buy for 99 ₽')}</button></div>`}</section>
      <section id="shpBoost" class="shp-sec"><h3 class="hs-h">⚡ ${L('Бустеры', 'Boosters')}</h3>
        ${rows([['x2', '⚡', L('x2 у.е. за неделю', 'x2 $ for a week'), X2_PRICE, (prefs.x2Weeks || 0) ? L(`зарплата недели — ещё раз · запас: ${prefs.x2Weeks} нед.`, `this week’s pay again · stocked: ${prefs.x2Weeks} wk`) : L('зарплата ближайшей недели — ещё раз', 'your next week’s pay, once more')],
          ['hints', '💡', L(`${HINTS_PACK.n} подсказок`, `${HINTS_PACK.n} hints`), HINTS_PACK.price, L(`вместо ${money(HINTS_PACK.n * HINT_BASE)}${prefs.freeHints ? ` · есть: ${prefs.freeHints}` : ''}`, `instead of ${money(HINTS_PACK.n * HINT_BASE)}${prefs.freeHints ? ` · you have ${prefs.freeHints}` : ''}`)]],
          ([id, ico, t, price, sub]) => `<div class="gp-item"><span class="gp-ico" aria-hidden="true">${ico}</span><span class="gp-txt"><b>${t}</b><small>${sub}</small></span>${buyBtn(`data-boost="${id}"`, price)}</div>`)}</section>
      <section id="shpRare" class="shp-sec"><h3 class="hs-h">✨ ${L('Редкое — только здесь', 'Rare — only here')}</h3>
        <p class="field-note">${L('Питомцы редких пород и вещи, которых нет в обычных покупках. Вещи радуют персонажа каждую неделю.', 'Rare pet breeds and items you can’t get anywhere else. Items cheer your character up every week.')}${(prefs.rarePetCoupons || 0) > 0 ? ` <b class="shp-ok">🎟️ ${L(`Купон на питомца: ${prefs.rarePetCoupons}`, `Pet coupons: ${prefs.rarePetCoupons}`)}</b>` : ''}</p>
        <div class="shp-grid">${RARE_PETS.map(b => { const has = h?.pets?.some(p => p.breed === b.id); return `<button type="button" class="shp-card" data-rpet="${b.id}"><span class="shp-rare">✨</span><i class="shp-dot2" style="background:${b.color}"></i><span aria-hidden="true">${PET_KINDS[b.kind].ico}</span><b>${esc(b.t)}</b><small>${has ? L('✓ уже дома', '✓ at home') : (prefs.rarePetCoupons || 0) > 0 ? L('по купону', 'with coupon') : money(b.price)}</small></button>`; }).join('')}</div>
        <div class="shp-grid">${RARE_ITEMS.map(x => { const has = h?.rare?.includes(x.id); return `<button type="button" class="shp-card${has ? ' got' : ''}" data-ritem="${x.id}" ${has ? 'disabled' : ''}><span class="shp-rare">✨</span><span aria-hidden="true">${x.ico}</span><b>${esc(goodText(x, h))}</b><small>${has ? L('✓ есть', '✓ owned') : `${money(x.price)} · ${L(`настр. +${x.mood}`, `mood +${x.mood}`)}`}</small></button>`; }).join('')}</div></section>
      <section id="shpSeason" class="shp-sec"><h3 class="hs-h">🏆 ${L(`Сезон: ${seasonName(st.id)}`, `Season: ${seasonName(st.id)}`)}</h3>
        <p class="field-note">${L(`Уровень ${seasonLevel(st)}/${SEASON_LEVELS}. Премиум-дорожка — у.е. на каждом уровне, подсказки, x2, неделя без рекламы, вещь и тема сезона.`, `Level ${seasonLevel(st)}/${SEASON_LEVELS}. Premium track: $ on every level, hints, x2, a week ad-free, the season item and theme.`)}</p>
        <button type="button" class="btn-ghost" id="shpSeasonGo">🏆 ${st.prem ? L('Открыть сезон', 'Open the season') : L(`Сезон · премиум ${money(SEASON_PRICE)}`, `Season · premium ${money(SEASON_PRICE)}`)}</button></section>
      ${coffeeHtml('shp')}
      <button class="btn-ghost" type="button" id="shpClose">${L('Закрыть', 'Close')}</button></div>`;
    m.hidden = false;
    m.querySelectorAll('[data-go]').forEach(b => b.onclick = () => $(b.dataset.go)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    m.querySelector('[data-deal]')?.addEventListener('click', () => {
      if (dealBought()) return;
      if (deal.id === 'pet') return rarePetView(deal.ref, back, deal.price);
      if (deal.id === 'item') { if (shpHero()?.rare?.includes(deal.ref)) return toast(L('Эта вещь уже есть', 'You already have this item')); rareItemView(deal.ref, back, deal.price); return; }
      if (!shpSpend(deal.price, 'deal_' + deal.id, deal.t(), back)) return;
      if (deal.id === 'hints5') prefs.freeHints = (prefs.freeHints || 0) + 5;
      if (deal.id === 'x2') prefs.x2Weeks = (prefs.x2Weeks || 0) + 1;
      if (deal.id === 'noads7') noAdsAdd(7);
      prefs.dealDay = today(); savePrefs();
      toast(L(`🔥 Куплено: ${deal.t()}`, `🔥 Bought: ${deal.t()}`)); render();
    });
    m.querySelectorAll('[data-noads]').forEach(b => b.onclick = () => {
      const id = b.dataset.noads, o = NOADS[id];
      if (!shpSpend(o.price, 'noads_' + id, id === 'forever' ? L('Без рекламы навсегда', 'Ad-free forever') : L('30 дней без рекламы', '30 days ad-free'), () => openStore('shpNoads', after))) return;
      if (id === 'forever') { prefs.noAdsForever = true; savePrefs(); } else noAdsAdd(o.days);
      confetti?.(); toast(id === 'forever' ? L('🚫 Реклама отключена навсегда. Спасибо, что поддерживаете игру!', '🚫 Ads are off forever. Thanks for supporting the game!') : L(`🚫 Без рекламы ещё ${noAdsDays()} дн.`, `🚫 Ad-free for ${noAdsDays()} more days`));
      render();
    });
    m.querySelectorAll('[data-boost]').forEach(b => b.onclick = () => {
      const id = b.dataset.boost;
      if (id === 'x2') { if (!shpSpend(X2_PRICE, 'x2', L('x2 у.е. за неделю', 'x2 $ for a week'), back)) return; prefs.x2Weeks = (prefs.x2Weeks || 0) + 1; toast(L('⚡ x2 у.е.: зарплата следующей законченной недели придёт ещё раз', '⚡ x2 $: the pay for your next finished week comes twice')); }
      if (id === 'hints') { if (!shpSpend(HINTS_PACK.price, 'hints', L(`${HINTS_PACK.n} подсказок`, `${HINTS_PACK.n} hints`), back)) return; prefs.freeHints = (prefs.freeHints || 0) + HINTS_PACK.n; toast(L(`💡 +${HINTS_PACK.n} подсказок — кнопка «Подсказка» в неделе`, `💡 +${HINTS_PACK.n} hints — use the “Hint” button during a week`)); }
      savePrefs(); render();
    });
    m.querySelectorAll('[data-rpet]').forEach(b => b.onclick = () => rarePetView(b.dataset.rpet, back));
    m.querySelectorAll('[data-ritem]').forEach(b => b.onclick = () => rareItemView(b.dataset.ritem, back));
    if ($('shpThemePick')) $('shpThemePick').onclick = () => themeCouponPick(back);
    $('shpSeasonGo').onclick = () => openSeason(back);
    $('shpClose').onclick = () => { clearInterval(shpTick); m.hidden = true; if (after) after(); else if (!views.menu.hidden) renderMenu(); };
  };
  render();
  track('shop_open', { detail: section || 'menu' });
  if (section) setTimeout(() => $(section)?.scrollIntoView({ block: 'start' }), 60);
  shpTick = setInterval(() => { const t = $('shpTimer'); if (!t || m.hidden) return clearInterval(shpTick); t.textContent = hhmmss(toMidnight()); }, 1000);
}
// «Отключить рекламу» из окна обязательной рекламы (js/ads.js)
const openShopNoAds = then => openStore('shpNoads', then);

// ---------- меню: кнопка «🛒 Магазин» и карточка сезона ----------
bus.on('menu', () => {
  const b = $('openStore');
  if (b) {
    b.hidden = !!window.VDP_PLATFORM && !shpCareer();
    const st = seasonState(), hot = starterOn() || seasonClaimable(st) > 0 || (shpCareer() && !dealBought());
    b.innerHTML = `🛒 ${L('Магазин', 'Shop')}${starterOn() ? ` <em class="shp-pill">🎁 ${L('набор −90%', 'pack −90%')}</em>` : seasonClaimable(st) ? ` <em class="shp-pill">🏆 ${seasonClaimable(st)}</em>` : ''}${hot ? '<i class="shp-hot" aria-hidden="true"></i>' : ''}`;
    b.onclick = () => openStore();
  }
  seasonCard();
  const cs = $('coffeeProf'); if (cs) cs.innerHTML = coffeeHtml('ps');
  const who = document.querySelector('.me-who');
  if (who) { who.querySelector('.shp-maecenas')?.remove(); if (coffeeBadge()) $('meId')?.insertAdjacentHTML('beforebegin', coffeeBadge()); }
});
