/* сгенерировано tools/make-legacy.js из js/shop.js — не править */
const STARTER = { rub: 149, ue: 30, hints: 3 };
const STARTER_WAS = STARTER.ue * 80;
const NOADS = { d30: { price: 40, days: 30 }, forever: { price: 150 } };
const X2_PRICE = 6;
const HINTS_PACK = { n: 5, price: 8 };
const SEASON_PRICE = 99, SEASON_LEVELS = 10;
const DAY_MS = 864e5;
const noAdsOn = () => !!prefs.noAdsForever || (prefs.noAdsUntil || 0) > Date.now();
const noAdsDays = () => Math.ceil(Math.max(0, (prefs.noAdsUntil || 0) - Date.now()) / DAY_MS);
function noAdsAdd(days) {
  prefs.noAdsUntil = Math.max(Date.now(), prefs.noAdsUntil || 0) + days * DAY_MS;
  store.set(KEY.prefs, prefs);
}
const RARE_PETS = [
  { id: "cat_golden", kind: "cat", rare: true, price: 150, t: L("Золотой кот-талисман", "Golden lucky cat"), color: "#e2b84a", stripes: "#b8862a", face: "#fff0c8", eyes: "#3ad1ff", crown: "#ffd34a", glow: "#ffe680" },
  { id: "cat_cosmic", kind: "cat", rare: true, price: 120, t: L("Космический кот", "Cosmic cat"), color: "#2a2160", stripes: "#7a5cff", face: "#4a3a90", eyes: "#ff3bd4", fluffy: true, glow: "#2de2e6" },
  { id: "dog_samoyed", kind: "dog", rare: true, price: 110, t: L("Самоед в короне", "Crowned Samoyed"), color: "#f7f7f2", mane: true, curl: true, size: 1.15, eyes: "#2a1a10", collar: "#2de2e6", crown: "#e8eef8" },
  { id: "dog_shiba", kind: "dog", rare: true, price: 100, t: L("Сиба-ину", "Shiba Inu"), color: "#d9822b", belly: true, alt: "#fff3e0", face: "#fff3e0", curl: true, collar: "#e0153f", glow: "#ffb02e" },
  { id: "par_lorikeet", kind: "parrot", rare: true, price: 80, t: L("Радужный лорикет", "Rainbow lorikeet"), color: "#2a9d3a", head: "#2a4fd6", alt: "#ff8c1a", tail: "#e0153f", beak: "#ff5c2a", belly: "#ffb02e", longTail: true, glow: "#7cff2e" },
  { id: "fish_koi", kind: "fish", rare: true, price: 60, t: L("Карп кои", "Koi carp"), color: "#f5f5f0", alt: "#ff4a1a", stripe: "#ff4a1a", bigTail: true, glow: "#ffd34a" }
];
if (typeof PET_BREEDS !== "undefined") {
  for (const b of RARE_PETS) if (!PET_BREEDS.some((x) => x.id === b.id)) PET_BREEDS.push(b);
}
const RARE_ITEMS = [
  { id: "r_neon", ico: "🧥", price: 60, mood: 18, toon: "wear", t: L("Неоновый бомбер «18:00»", "Neon “6 PM” bomber"), wear: { jacket: "#ff3bd4", top: "#2de2e6", tie: "", dress: false, short: false } },
  { id: "r_kicks", ico: "👟", price: 70, mood: 20, toon: "wear", t: L("Лимитированные кроссовки", "Limited-edition sneakers"), wear: { shoes: "#ff2e55", heels: false } },
  { id: "r_watch", ico: "⌚", price: 90, mood: 24, toon: "delivery", t: L("Швейцарские часы", "Swiss watch") },
  {
    id: "r_gold",
    ico: "✨",
    price: 120,
    mood: 30,
    toon: "wear",
    t: (g) => g === "f" ? L("Золотое вечернее платье", "Golden evening gown") : L("Золотой смокинг", "Golden tuxedo"),
    wear: (g) => g === "f" ? { dress: true, top: "#d4af37", jacket: "", tie: "", heels: true, short: false } : { jacket: "#d4af37", top: "#fff6d6", tie: "#1a1a1a", bottom: "#1a1a1a", short: false }
  },
  { id: "r_car", ico: "🏎️", price: 180, mood: 40, toon: "ride", prop: "car", t: L("Спорткар", "Sports car") },
  { id: "r_yacht", ico: "🛥️", price: 200, mood: 45, toon: "ride", prop: "boat", t: L("Яхта", "Yacht") }
];
const RARE_WEEK_MOOD = 2, RARE_WEEK_CAP = 8;
const SEASON_COLORS = ["#3d8bff", "#ff5c8a", "#2fe07a", "#ffc53d", "#c48bff", "#ff6a3d", "#2de2e6", "#ffcf3d", "#ff9a2e", "#e8590c", "#8b7bff", "#e0153f"];
const MONTHS = L(
  ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
);
const seasonItem = (id) => {
  const mo = +String(id).slice(-2) - 1 || 0;
  const th = typeof retThemeOf === "function" ? retThemeOf(mo) : null;
  return { id: "season_" + id, ico: (th == null ? void 0 : th.ico) || "🏆", mood: 25, toon: "wear", t: th ? L(th.item_ru, th.item_en) : L("Куртка сезона «".concat(MONTHS[mo], "»"), "“".concat(MONTHS[mo], "” season jacket")), wear: { jacket: SEASON_COLORS[mo], tie: "", dress: false, short: false } };
};
const rareItemById = (id) => RARE_ITEMS.find((x) => x.id === id) || (String(id).startsWith("season_") ? seasonItem(String(id).slice(7)) : null);
const shpCareer = () => careerNow();
const shpHero = () => {
  var _a;
  return (_a = shpCareer()) == null ? void 0 : _a.hero;
};
const shpInGame = () => typeof S !== "undefined" && (S == null ? void 0 : S.mode) === "career" && !views.game.hidden;
function shpSpend(price, id, what, back, C2 = shpCareer()) {
  var _a;
  if (!needReg("shop")) return false;
  if (!C2) {
    toast(L("Покупки за у.е. — в карьере. Начните её кнопкой «Играть».", "Spend $ in your career — start one with “Play”."));
    return false;
  }
  if ((C2.bank || 0) < price) {
    openTopup({ need: lackOf(price), why: L("".concat(what, " — ").concat(money(price), " · на счёте ").concat(money(C2.bank || 0)), "".concat(what, " — ").concat(money(price), " · you have ").concat(money(C2.bank || 0))), then: back });
    return false;
  }
  C2.bank -= price;
  C2.spent = (C2.spent || 0) + price;
  careerSave(C2);
  if (shpInGame()) renderBars == null ? void 0 : renderBars();
  (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
  track("shop_buy", { detail: "".concat(id, ":").concat(price) });
  return true;
}
const shpPrice = (price) => {
  const C2 = shpCareer(), short = !C2 || (C2.bank || 0) < price;
  return short && C2 ? "💰 ".concat(money(price)) : money(price);
};
const savePrefs = () => store.set(KEY.prefs, prefs);
const hhmmss = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1e3));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((v) => String(v).padStart(2, "0")).join(":");
};
const toMidnight = () => {
  const d = /* @__PURE__ */ new Date();
  d.setHours(24, 0, 0, 0);
  return d - Date.now();
};
const paidThemes = () => [typeof PAID_THEMES !== "undefined" && PAID_THEMES, typeof PREMIUM_THEMES !== "undefined" && PREMIUM_THEMES].find((x) => Array.isArray(x) && x.length) || null;
function useThemeCoupon(id) {
  if (/^\d+$/.test(String(id))) id = +id;
  if (!((prefs.themeCoupons || 0) > 0) || id == null || id === "") return false;
  prefs.themeCoupons--;
  prefs.themesOwned = [.../* @__PURE__ */ new Set([...prefs.themesOwned || [], id])];
  savePrefs();
  track("shop_theme", { detail: String(id).slice(0, 40) });
  return true;
}
function grantThemeCoupon() {
  prefs.themeCoupons = (prefs.themeCoupons || 0) + 1;
  savePrefs();
}
function themeCouponPick(back) {
  var _a;
  if (typeof openThemePicker === "function") return openThemePicker();
  const list = (_a = paidThemes()) == null ? void 0 : _a.filter((t) => !(prefs.themesOwned || []).includes(t.id));
  if (!(list == null ? void 0 : list.length)) {
    toast(L("🎨 Купон на тему сохранён — выберите тему в «Оформлении»", "🎨 Theme coupon saved — pick a theme in “Appearance”"));
    return back == null ? void 0 : back();
  }
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="shpThT"><span class="lvl-ico" aria-hidden="true">🎨</span>\n    <h2 id="shpThT">'.concat(L("Тема по купону", "Theme coupon"), '</h2><div class="shp-themes">').concat(list.map((t) => '<button type="button" class="btn-chip" data-th="'.concat(esc(t.id), '">').concat(esc(t.name || t.id), "</button>")).join(""), '</div>\n    <button class="btn-ghost" type="button" id="shpThX">').concat(L("Позже", "Later"), "</button></div>");
  m.hidden = false;
  m.querySelectorAll("[data-th]").forEach((b) => b.onclick = () => {
    if (useThemeCoupon(b.dataset.th)) {
      toast(L("🎨 Тема ваша! Включите её в «Оформлении»", "🎨 The theme is yours! Turn it on in “Appearance”"));
      m.hidden = true;
      back == null ? void 0 : back();
    }
  });
  $("shpThX").onclick = () => {
    m.hidden = true;
    back == null ? void 0 : back();
  };
}
const starterOn = () => {
  var _a;
  return !window.VDP_PLATFORM && !window.NO_PAY && (!window.VK_MINI || vkPrice("starter") > 0) && !prefs.paidUser && !prefs.starterDone && (((_a = shpCareer()) == null ? void 0 : _a.week) || 0) >= 2;
};
function shopStarterHtml(where = "shp") {
  if (!starterOn()) return "";
  if (window.VK_MINI) return '<div class="shp-starter shp-vk">\n    <b class="shp-st-t">🎁 '.concat(L("Стартовый набор", "Starter pack"), '</b>\n    <ul class="shp-st-list"><li>💰 <b>').concat(money(STARTER.ue), "</b> ").concat(L("на счёт", "to your balance"), "</li><li>🎨 ").concat(L("премиум-тема оформления на выбор", "a premium theme of your choice"), "</li>\n      <li>✨ ").concat(L("купон на редкого питомца", "a rare pet coupon"), "</li><li>💡 ").concat(L("".concat(STARTER.hints, " бесплатные подсказки"), "".concat(STARTER.hints, " free hints")), '</li></ul>\n    <p class="shp-st-p"><b>').concat(votesStr(vkPrice("starter")), "</b> <small>").concat(L("один раз", "one time only"), '</small></p>\n    <button class="btn-main" type="button" data-vkitem="starter">').concat(L("Купить за ".concat(votesStr(vkPrice("starter"))), "Buy for ".concat(votesStr(vkPrice("starter")))), "</button></div>");
  const off = Math.floor((1 - STARTER.rub / STARTER_WAS) * 10) * 10;
  return '<div class="shp-starter shp-pay">\n    <span class="shp-badge">−'.concat(off, '%</span>\n    <b class="shp-st-t">🎁 ').concat(L("Стартовый набор", "Starter pack"), '</b>\n    <ul class="shp-st-list"><li>💰 <b>').concat(money(STARTER.ue), "</b> ").concat(L("на счёт", "to your balance"), "</li><li>🎨 ").concat(L("премиум-тема оформления на выбор", "a premium theme of your choice"), "</li>\n      <li>✨ ").concat(L("купон на редкого питомца", "a rare pet coupon"), "</li><li>💡 ").concat(L("".concat(STARTER.hints, " бесплатные подсказки"), "".concat(STARTER.hints, " free hints")), '</li></ul>\n    <p class="shp-st-p"><s>').concat(STARTER_WAS.toLocaleString("ru-RU"), " ₽</s> <b>").concat(STARTER.rub, " ₽</b> <small>").concat(L("один раз", "one time only"), "</small></p>\n    ").concat(where === "shp" ? '<label class="tu-agree"><input type="checkbox" id="shpAgree"> <span>'.concat(L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a> и <a href="politika.html" target="_blank" rel="noopener">политикой обработки персональных данных</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a> and <a href="politika.html" target="_blank" rel="noopener">privacy policy</a> (in Russian)'), '</span></label><p class="join-err" id="shpErr" role="alert"></p>') : "", '\n    <button class="btn-main" type="button" data-product="starter">').concat(L("Купить за ".concat(STARTER.rub, " ₽"), "Buy for ".concat(STARTER.rub, " ₽")), "</button></div>");
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-product]");
  if (!b) return;
  e.preventDefault();
  productPay(b);
});
const PRODUCT_RUB = { starter: STARTER.rub, coffee: 100, noads: 99 }, PRODUCT_UE = { starter: STARTER.ue, coffee: 10, noads: 0 };
async function productPay(btn) {
  const product = btn.dataset.product, card = btn.closest(".shp-pay"), box = btn.closest(".modal-box") || document;
  const agree = (card == null ? void 0 : card.querySelector("input[type=checkbox]")) || box.querySelector("#tuAgree"), err = (card == null ? void 0 : card.querySelector(".join-err")) || box.querySelector("#tuErr");
  const say = (t) => {
    if (err) err.textContent = t;
    else toast(t);
  };
  if (agree && !agree.checked) return say(L("Отметьте согласие с офертой.", "Please accept the public offer."));
  if (window.NO_PAY) return toast(L("В этой версии игры покупок нет. У.е. зарабатываются в игре: зарплата в карьере, задания дня, разминки и серия дней.", "There are no purchases in this version. Earn $ in the game: career salary, daily tasks, breaks and day streaks."));
  if (window.VK_MINI) return toast(L("Покупки в приложении ВКонтакте пока недоступны — играть можно бесплатно", "Purchases aren’t available in the VK app yet — the game is free to play"));
  if (window.VDP_PLATFORM) return window.VDP_PLATFORM.shop ? window.VDP_PLATFORM.shop({ product }) : toast(L("В этой версии игры покупок нет — у.е. зарабатываются в игре", "No purchases in this version — earn $ in the game"));
  if (!(typeof registered === "function" && registered())) {
    $("modal").hidden = true;
    $("profSheet") && ($("profSheet").hidden = true);
    return renderJoin("login", L("Чтобы купить, войдите в аккаунт — так покупка не потеряется и будет на всех устройствах.", "Sign in to buy — so your purchase is safe and on every device."));
  }
  track("buy_intent", { detail: "".concat(product, ":").concat(PRODUCT_RUB[product]) });
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = L("Переходим к оплате…", "Opening the payment page…");
  try {
    const r = await fnPost("robokassa-pay", { access_token: await board.accessToken(), product, email: prefs.email || "" });
    if (!(r == null ? void 0 : r.url)) throw new Error((r == null ? void 0 : r.error) || "no url");
    store.set("vdp-pay-pending", { inv: r.inv_id, ue: PRODUCT_UE[product], product, at: Date.now() });
    location.href = r.url;
  } catch (e) {
    btn.disabled = false;
    btn.textContent = label;
    const m = e.code || e.message || "";
    if (/starter_taken/.test(m)) {
      prefs.starterDone = true;
      savePrefs();
      return say(L("Стартовый набор уже куплен на этом аккаунте — спасибо!", "You already bought the Starter pack — thank you!"));
    }
    say(/not_configured/.test(m) ? L("Оплата картой появится совсем скоро. А пока у.е. можно заработать в игре.", "Card payments are coming very soon. Meanwhile, earn $ in the game.") : /session/.test(m) ? L("Войдите в аккаунт ещё раз и повторите оплату.", "Please sign in again and retry.") : L("Не удалось открыть оплату — попробуйте ещё раз.", "Couldn’t open the payment page — please try again."));
  }
}
const coffeeBadge = () => (prefs.coffeeN || 0) > 0 ? '<span class="shp-maecenas" title="'.concat(L("Купил кофе разработчикам", "Bought the devs a coffee"), '">☕ ').concat(L("Меценат", "Patron")).concat(prefs.coffeeN > 1 ? " ×".concat(prefs.coffeeN) : "", "</span>") : "";
const coffeeHtml = (id = "shp") => window.VDP_PLATFORM || window.NO_PAY ? "" : window.VK_MINI ? coffeeVkHtml() : '<div class="shp-coffee shp-pay">\n  <b>☕ '.concat(L("Кофе разработчикам", "A coffee for the devs"), " — 100 ₽</b>\n  <p>").concat(L("Игру делает один человек по вечерам. Угостите разработчика кофе — и получите значок «☕ Меценат» в профиле (навсегда, со счётчиком) и +10 у.е. на счёт.", "One person makes this game in the evenings. Treat the developer to a coffee and get a permanent “☕ Patron” profile badge (with a counter) and +$10."), "</p>\n  ").concat(coffeeBadge() ? '<p class="shp-ok">'.concat(L("Ваш значок:", "Your badge:"), " ").concat(coffeeBadge(), " — ").concat(L("спасибо!", "thank you!"), "</p>") : "", '\n  <label class="tu-agree"><input type="checkbox" id="').concat(id, 'CofAgree"> <span>').concat(L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a>'), '</span></label>\n  <p class="join-err" role="alert"></p>\n  <button class="btn-ghost" type="button" data-product="coffee">☕ ').concat(L("Купить кофе — 100 ₽", "Buy a coffee — 100 ₽"), "</button></div>");
const coffeeVkHtml = () => !(vkPrice("coffee") > 0) ? "" : '<div class="shp-coffee shp-vk">\n  <b>☕ '.concat(L("Кофе разработчикам", "A coffee for the devs"), " — ").concat(votesStr(vkPrice("coffee")), "</b>\n  <p>").concat(L("Игру делает один человек по вечерам. Угостите разработчика кофе — и получите значок «☕ Меценат» в профиле (навсегда, со счётчиком) и +10 у.е. на счёт.", "One person makes this game in the evenings. Treat the developer to a coffee and get a permanent “☕ Patron” profile badge (with a counter) and +$10."), "</p>\n  ").concat(coffeeBadge() ? '<p class="shp-ok">'.concat(L("Ваш значок:", "Your badge:"), " ").concat(coffeeBadge(), " — ").concat(L("спасибо!", "thank you!"), "</p>") : "", '\n  <button class="btn-ghost" type="button" data-vkitem="coffee">☕ ').concat(L("Купить кофе — ".concat(votesStr(vkPrice("coffee"))), "Buy a coffee — ".concat(votesStr(vkPrice("coffee")))), "</button></div>");
function coffeeThanks() {
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="shpCfT"><span class="lvl-ico" aria-hidden="true">☕</span>\n    <h2 id="shpCfT">'.concat(L("Спасибо огромное!", "Thank you so much!"), "</h2>\n    <p>").concat(L("Кофе уже варится, а следующая порция карточек, разминок и шуток про понедельник будет написана с ним. Это правда помогает игре жить.", "The coffee is brewing, and the next batch of cards, warm-ups and Monday jokes will be written with it. It truly keeps the game alive."), "</p>\n    <p>").concat(L("В профиле теперь значок", "Your profile now has the badge"), " ").concat(coffeeBadge(), " ").concat(L("и +10 у.е. на счёте.", "and +$10 in the bank."), '</p>\n    <button class="btn-main" type="button" id="shpCfOk">').concat(L("Пожалуйста! ❤️", "You’re welcome! ❤️"), "</button></div>");
  m.hidden = false;
  confetti == null ? void 0 : confetti();
  $("shpCfOk").onclick = () => {
    m.hidden = true;
    if (!views.menu.hidden) renderMenu();
  };
}
function shopGrantProduct(product) {
  if (product === "noads") {
    noAdsAdd(30);
    track("noads_rub");
    toast(L("🚫 30 дней без рекламы — спасибо!", "🚫 30 ad-free days — thank you!"));
    return;
  }
  if (product === "coffee") {
    prefs.coffeeN = (prefs.coffeeN || 0) + 1;
    savePrefs();
    track("coffee_buy", { detail: String(prefs.coffeeN) });
    setTimeout(coffeeThanks, 900);
    return;
  }
  if (product !== "starter" || prefs.starterDone) {
    prefs.starterDone = prefs.starterDone || product === "starter";
    savePrefs();
    return;
  }
  prefs.starterDone = true;
  prefs.freeHints = (prefs.freeHints || 0) + STARTER.hints;
  prefs.rarePetCoupons = (prefs.rarePetCoupons || 0) + 1;
  savePrefs();
  grantThemeCoupon();
  track("shop_starter", { detail: "granted" });
}
bus.on("weekEnd", (x) => {
  if (x.mode !== "career" || !((prefs.x2Weeks || 0) > 0) || typeof S === "undefined" || !S) return;
  const n = Math.round(S.earned || 0);
  if (!n) return;
  prefs.x2Weeks--;
  savePrefs();
  addCash(n);
  track("shop_x2", { detail: String(n) });
  setTimeout(() => toast(L("⚡ x2 у.е.: ещё +".concat(money(n), " к зарплате недели"), "⚡ Double pay: another +".concat(money(n), " on top of this week’s pay"))), 2e3);
});
bus.on("weekEnd", (x) => {
  var _a;
  if (x.mode !== "career") return;
  const C2 = shpCareer(), h = C2 == null ? void 0 : C2.hero, n = ((h == null ? void 0 : h.rare) || []).length;
  if (!n) return;
  h.mood = Math.min(100, ((_a = h.mood) != null ? _a : 70) + Math.min(RARE_WEEK_CAP, n * RARE_WEEK_MOOD));
  careerSave(C2);
});
const seasonId = () => {
  const d = /* @__PURE__ */ new Date();
  return "".concat(d.getFullYear(), "-").concat(String(d.getMonth() + 1).padStart(2, "0"));
};
const seasonName = (id) => MONTHS[+String(id).slice(-2) - 1 || 0];
const seasonDaysLeft = () => {
  const d = /* @__PURE__ */ new Date(), e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return Math.max(1, Math.ceil((e - d) / DAY_MS));
};
function seasonState() {
  var _a;
  const id = seasonId();
  if (((_a = prefs.season) == null ? void 0 : _a.id) !== id) {
    prefs.season = { id, weeks: 0, prem: false, free: [], paid: [] };
    savePrefs();
  }
  return prefs.season;
}
const seasonLevel = (st) => Math.min(SEASON_LEVELS, st.weeks || 0);
const SEASON_FREE = { 2: { ue: 2 }, 4: { ue: 2 }, 6: { hints: 2 }, 8: { ue: 3 }, 10: { ue: 5 } };
const SEASON_PAID = { 1: { ue: 8 }, 2: { hints: 3 }, 3: { ue: 12 }, 4: { x2: 1 }, 5: { ue: 16 }, 6: { hints: 5 }, 7: { ue: 20 }, 8: { noads: 7 }, 9: { ue: 25 }, 10: { item: 1, theme: 1 } };
const rewardText = (r, st) => [
  r.ue && "💰 ".concat(money(r.ue)),
  r.hints && "💡 ".concat(L("".concat(r.hints, " подсказ").concat(r.hints < 5 ? "ки" : "ок"), "".concat(r.hints, " hints"))),
  r.x2 && "⚡ ".concat(L("x2 у.е. на неделю", "Double pay for a week")),
  r.noads && "🚫 ".concat(L("".concat(r.noads, " дней без рекламы"), "".concat(r.noads, " days ad-free"))),
  r.item && "🏆 ".concat(esc(goodText(seasonItem((st == null ? void 0 : st.id) || seasonId()), shpHero()))),
  r.theme && "🎨 ".concat(L("тема на выбор", "a theme of your choice"))
].filter(Boolean).join(" + ");
const seasonClaimable = (st) => {
  const lv = seasonLevel(st);
  let n = 0;
  for (let i = 1; i <= lv; i++) {
    if (SEASON_FREE[i] && !st.free.includes(i)) n++;
    if (st.prem && SEASON_PAID[i] && !st.paid.includes(i)) n++;
  }
  return n;
};
function grantReward(r, st) {
  if (r.item) {
    const C2 = shpCareer(), h = C2 == null ? void 0 : C2.hero;
    if (!h) {
      toast(L("Вещь сезона — для персонажа карьеры: начните карьеру и заберите её", "The season item is for your career character: start a career and claim it"));
      return false;
    }
    const x = seasonItem(st.id);
    giveRareItem(x, C2, h);
  }
  if (r.ue) addCash(r.ue);
  if (r.hints) prefs.freeHints = (prefs.freeHints || 0) + r.hints;
  if (r.x2) prefs.x2Weeks = (prefs.x2Weeks || 0) + r.x2;
  if (r.noads) noAdsAdd(r.noads);
  if (r.theme) grantThemeCoupon();
  savePrefs();
  return true;
}
bus.on("weekEnd", (x) => {
  if (x.mode !== "career") return;
  const st = seasonState(), before = seasonLevel(st);
  st.weeks = (st.weeks || 0) + 1;
  savePrefs();
  const lv = seasonLevel(st);
  if (lv > before && (SEASON_FREE[lv] || st.prem)) setTimeout(() => toast(L("🏆 Сезон «".concat(seasonName(st.id), "»: уровень ").concat(lv, " — награда ждёт в меню"), "🏆 ".concat(seasonName(st.id), " season: level ").concat(lv, " — your reward is waiting in the menu"))), 3200);
});
function openSeason(back) {
  const m = $("modal");
  const render = () => {
    const st = seasonState(), lv = seasonLevel(st), C2 = shpCareer();
    const cell = (i, r, track2) => {
      if (!r) return '<span class="shp-sc-cell empty">—</span>';
      const got = (track2 === "paid" ? st.paid : st.free).includes(i), lock = track2 === "paid" && !st.prem, open = i <= lv;
      return '<span class="shp-sc-cell'.concat(got ? " got" : "").concat(lock ? " lock" : "", '"><small>').concat(rewardText(r, st), "</small>").concat(got ? "<em>✓</em>" : lock ? "<em>🔒</em>" : open ? '<button type="button" class="btn-chip" data-claim="'.concat(track2, ":").concat(i, '">').concat(L("Забрать", "Claim"), "</button>") : "", "</span>");
    };
    m.innerHTML = '<div class="modal-box glass cert-box shp-season-box" role="dialog" aria-modal="true" aria-labelledby="shpSnT">\n      <span class="lvl-ico" aria-hidden="true">🏆</span>\n      <h2 id="shpSnT">'.concat(L("Сезон: ".concat(seasonName(st.id)), "Season: ".concat(seasonName(st.id))), "</h2>\n      ").concat(typeof retThemeBadge === "function" ? retThemeBadge(st.id, true) : "", "\n      <p>").concat(L("Каждая законченная неделя карьеры — +1 уровень. Уровень ".concat(lv, "/").concat(SEASON_LEVELS, " · до конца сезона ").concat(pl(seasonDaysLeft(), "день", "дня", "дней", "day", "days"), "."), "Every finished career week is +1 level. Level ".concat(lv, "/").concat(SEASON_LEVELS, " · ").concat(pl(seasonDaysLeft(), "", "", "", "day", "days"), " left in the season.")), '</p>\n      <div class="shp-sc-bar"><i style="width:').concat(lv / SEASON_LEVELS * 100, '%"></i></div>\n      <div class="shp-sc-grid"><b>').concat(L("Ур.", "Lv"), "</b><b>").concat(L("Бесплатно", "Free"), "</b><b>⭐ ").concat(L("Премиум", "Premium"), "</b>\n        ").concat(Array.from({ length: SEASON_LEVELS }, (_, k) => k + 1).map((i) => '<span class="shp-sc-lv'.concat(i <= lv ? " on" : "", '">').concat(i, "</span>").concat(cell(i, SEASON_FREE[i], "free")).concat(cell(i, SEASON_PAID[i], "paid"))).join(""), "</div>\n      ").concat(st.prem ? '<p class="shp-ok">⭐ '.concat(L("Премиум-дорожка открыта до конца месяца", "Premium track unlocked until the end of the month"), "</p>") : '<button class="btn-main" type="button" id="shpSnBuy">⭐ '.concat(L("Открыть премиум за ".concat(money(SEASON_PRICE)), "Unlock premium for ".concat(money(SEASON_PRICE))), '</button>\n           <p class="field-note">').concat(L("Премиум окупается: за 10 недель — ".concat(money(81), ", подсказки, x2, неделя без рекламы, вещь сезона и тема. Награды за уже пройденные уровни — тоже ваши."), "Premium pays for itself: over 10 weeks — ".concat(money(81), ", hints, x2, a week ad-free, the season item and a theme. Rewards for levels you’ve already reached are yours too."))).concat(C2 ? "" : " " + L("Покупка — со счёта карьеры.", "Paid from your career balance."), "</p>"), '\n      <button class="btn-ghost" type="button" id="shpSnX">').concat(L("Закрыть", "Close"), "</button></div>");
    m.hidden = false;
    m.querySelectorAll("[data-claim]").forEach((b) => b.onclick = () => {
      var _a;
      const [tr, i] = b.dataset.claim.split(":"), lvl = +i, r = (tr === "paid" ? SEASON_PAID : SEASON_FREE)[lvl], list = tr === "paid" ? st.paid : st.free;
      if (list.includes(lvl) || lvl > seasonLevel(st) || tr === "paid" && !st.prem) return;
      if (!grantReward(r, st)) return;
      list.push(lvl);
      savePrefs();
      (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
      track("season_claim", { detail: "".concat(tr, ":").concat(lvl) });
      toast(L("🏆 Получено: ".concat(rewardText(r, st).replace(/<[^>]+>/g, "")), "🏆 Received: ".concat(rewardText(r, st).replace(/<[^>]+>/g, ""))));
      if (r.theme) return themeCouponPick(render);
      render();
    });
    if ($("shpSnBuy")) $("shpSnBuy").onclick = () => {
      if (!shpSpend(SEASON_PRICE, "season", L("Премиум сезона", "Season premium"), () => openSeason(back))) return;
      st.prem = true;
      savePrefs();
      confetti == null ? void 0 : confetti();
      toast(L("⭐ Премиум сезона открыт — забирайте награды!", "⭐ Season premium unlocked — claim your rewards!"));
      render();
    };
    $("shpSnX").onclick = () => {
      m.hidden = true;
      back ? back() : !views.menu.hidden && renderMenu();
    };
  };
  render();
}
function seasonCard() {
  const box = $("seasonCard");
  if (!box) return;
  if (window.VDP_PLATFORM || !shpCareer()) {
    box.hidden = true;
    return;
  }
  const st = seasonState(), lv = seasonLevel(st), n = seasonClaimable(st);
  box.hidden = false;
  box.innerHTML = '<button type="button" class="shp-sc-card" id="seasonOpen"><span class="shp-sc-ico" aria-hidden="true">🏆</span>\n    <span class="shp-sc-txt"><b>'.concat(L("Сезон: ".concat(seasonName(st.id)), "Season: ".concat(seasonName(st.id)))).concat(st.prem ? " ⭐" : "", "</b>").concat(typeof retThemeBadge === "function" ? retThemeBadge(st.id) : "", "<small>").concat(L("уровень ".concat(lv, "/").concat(SEASON_LEVELS, " · ещё ").concat(pl(seasonDaysLeft(), "день", "дня", "дней", "day", "days")), "level ".concat(lv, "/").concat(SEASON_LEVELS, " · ").concat(pl(seasonDaysLeft(), "", "", "", "day", "days"), " left")), '</small>\n      <span class="shp-sc-bar"><i style="width:').concat(lv / SEASON_LEVELS * 100, '%"></i></span></span>\n    ').concat(n ? '<em class="shp-sc-n">'.concat(L("Забрать: ".concat(n), "Claim: ".concat(n)), "</em>") : '<em class="shp-sc-go">›</em>', "</button>");
  $("seasonOpen").onclick = () => openSeason();
}
const noAdsSale = () => !window.VK_MINI && !window.NO_PAY;
const DEALS = [
  { id: "hints5", ico: "💡", base: 10, price: 6, t: () => L("5 подсказок", "5 hints") },
  { id: "x2", ico: "⚡", base: X2_PRICE, price: 4, t: () => L("x2 у.е. за неделю", "Double pay for a week") },
  { id: "noads7", ico: "🚫", base: 12, price: 8, t: () => L("Неделя без рекламы", "A week ad-free") },
  { id: "item", ico: "✨", t: () => "" },
  { id: "pet", ico: "🐾", t: () => "" }
];
function dealToday() {
  const d = today(), h = [...d].reduce((a, c) => a * 31 + c.charCodeAt(0) >>> 0, 7);
  const list = noAdsSale() ? DEALS : DEALS.filter((x2) => x2.id !== "noads7");
  const x = { ...list[h % list.length] };
  if (x.id === "item") {
    const it = RARE_ITEMS[(h >> 3) % RARE_ITEMS.length];
    Object.assign(x, { ico: it.ico, base: it.price, price: Math.round(it.price * 0.7), ref: it.id, t: () => goodText(it, shpHero()) });
  }
  if (x.id === "pet") {
    const p = RARE_PETS[(h >> 3) % RARE_PETS.length];
    Object.assign(x, { ico: PET_KINDS[p.kind].ico, base: p.price, price: Math.round(p.price * 0.7), ref: p.id, t: () => p.t });
  }
  return x;
}
const dealBought = () => prefs.dealDay === today();
function giveRareItem(x, C2, h, back) {
  var _a;
  h.rare || (h.rare = []);
  if (!h.rare.includes(x.id)) h.rare.push(x.id);
  h.mood = Math.min(100, ((_a = h.mood) != null ? _a : 70) + x.mood);
  if (x.wear) {
    const w = typeof x.wear === "function" ? x.wear(heroPreset(h).g) : x.wear;
    h.wear = { ...h.wear || {}, ...w };
  }
  careerSave(C2);
  if (back !== void 0) playToon({ kind: x.toon, prop: x.prop, list: [x], mood: x.mood, h }, back);
}
function buyRareItem(id, price, back) {
  var _a;
  const x = rareItemById(id), C2 = shpCareer(), h = C2 == null ? void 0 : C2.hero;
  if (!x) return false;
  if (!h) {
    toast(L("Редкие вещи — для персонажа карьеры. Начните карьеру кнопкой «Играть».", "Rare items are for your career character. Start a career with “Play”."));
    return false;
  }
  if ((_a = h.rare) == null ? void 0 : _a.includes(x.id)) {
    toast(L("Уже есть", "Already yours"));
    return false;
  }
  if (!shpSpend(price != null ? price : x.price, x.id, goodText(x, h), back, C2)) return false;
  $("modal").hidden = true;
  giveRareItem(x, C2, h, back);
  return true;
}
const RARE_DESC = {
  r_neon: L("Яркий бомбер с надписью «18:00» — персонаж носит его в мультиках и на карточке.", "A bright bomber with “6 PM” on the back — your character wears it in cartoons and on the card."),
  r_kicks: L("Красные лимитированные кроссовки: такие есть только у избранных.", "Red limited-edition sneakers — only a lucky few have them."),
  r_watch: L("Швейцарские часы — чтобы точно знать, сколько осталось до пятницы.", "A Swiss watch — so you always know how long until Friday."),
  r_gold: L("Золотой образ для корпоратива и красной дорожки.", "A golden look for the office party and the red carpet."),
  r_car: L("Спорткар: персонаж уезжает на нём в мультике, а коллеги завидуют.", "A sports car — your character speeds off in it in the cartoon, coworkers envy."),
  r_yacht: L("Собственная яхта: выходные на воде, никаких писем от босса.", "Your own yacht — weekends on the water, no emails from the boss.")
};
function rareItemView(id, back, price) {
  var _a;
  const x = rareItemById(id), C2 = shpCareer(), h = C2 == null ? void 0 : C2.hero;
  if (!x) return;
  if (!h) return toast(L("Редкие вещи — для персонажа карьеры. Начните карьеру кнопкой «Играть».", "Rare items are for your career character. Start a career with “Play”."));
  const cost = price != null ? price : x.price, has = (_a = h.rare) == null ? void 0 : _a.includes(x.id), g = heroPreset(h).g;
  const w = x.wear ? typeof x.wear === "function" ? x.wear(g) : x.wear : null;
  dropView == null ? void 0 : dropView();
  const m = $("modal");
  let view = null;
  const close = () => {
    view == null ? void 0 : view.dispose();
    view = null;
    m.hidden = true;
  };
  m.innerHTML = '<div class="modal-box glass hero-box shp-item" role="dialog" aria-modal="true" aria-labelledby="shpItT">\n    <h2 id="shpItT"><span class="shp-item-ico" aria-hidden="true">'.concat(x.ico, "</span> ").concat(esc(goodText(x, h)), ' ✨</h2>\n    <div class="shp-item-stage').concat(x.toon === "ride" ? " ride bg-".concat(x.prop) : "", '"><canvas class="pet-cv shp-item-cv" aria-label="').concat(esc(goodText(x, h)), '"></canvas><span class="shp-item-big" aria-hidden="true">').concat(x.ico, '</span></div>\n    <p class="hero-lead">').concat(RARE_DESC[x.id] || "", " ").concat(L("Настроение персонажа +".concat(x.mood, " сразу и +").concat(RARE_WEEK_MOOD, " каждую неделю."), "Character mood +".concat(x.mood, " now and +").concat(RARE_WEEK_MOOD, " every week.")), "</p>\n    ").concat(has ? '<p class="shp-ok">✓ '.concat(L("Уже ваша", "Already yours"), "</p>") : '<button class="btn-main" type="button" id="shpItBuy">'.concat(L("Купить за ".concat(money(cost)), "Buy for ".concat(money(cost))), "</button>"), '\n    <button class="btn-ghost" type="button" id="shpItBack">').concat(L("Назад", "Back"), "</button></div>");
  m.hidden = false;
  const cv = m.querySelector(".shp-item-cv");
  const look = { ...heroLook(h), ...w || {} };
  heroViewer(cv, look, { framing: x.toon === "ride" ? "wide" : "full", emotion: "happy", interactive: true, yawRest: x.toon === "ride" ? 1.1 : -0.25, stage: x.toon === "ride" }).then((v) => {
    if (!v || !cv.isConnected || m.hidden) return v == null ? void 0 : v.dispose();
    view = v;
    if (x.toon === "ride" && x.prop) v.setProp(x.prop);
    else if (!w) {
      v.hold(x.ico);
      v.setAction("show");
    } else v.setAction("spin");
  });
  if ($("shpItBuy")) $("shpItBuy").onclick = () => {
    close();
    if (buyRareItem(id, price, back) && price != null) {
      prefs.dealDay = today();
      savePrefs();
    }
  };
  $("shpItBack").onclick = () => {
    close();
    back == null ? void 0 : back();
  };
}
function rarePetView(id, back, price) {
  const b = RARE_PETS.find((x) => x.id === id), C2 = shpCareer(), h = C2 == null ? void 0 : C2.hero;
  if (!b) return;
  if (!h) return toast(L("Питомцы — у персонажа карьеры. Начните карьеру кнопкой «Играть».", "Pets live with your career character. Start a career with “Play”."));
  const k = PET_KINDS[b.kind], coupon = (prefs.rarePetCoupons || 0) > 0, cost = price != null ? price : b.price, full = (h.pets || []).length >= PET_MAX;
  dropView == null ? void 0 : dropView();
  const m = $("modal");
  let view = null;
  const close = () => {
    view == null ? void 0 : view.dispose();
    view = null;
    m.hidden = true;
  };
  m.innerHTML = '<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="shpPtT">\n    <h2 id="shpPtT">'.concat(k.ico, " ").concat(esc(b.t), ' ✨</h2>\n    <canvas class="pet-cv" aria-label="').concat(esc(b.t), '"></canvas>\n    <p class="hero-lead">').concat(L("Редкая порода — только в магазине. Ест и играет как обычный питомец, но радует больше: настроение сразу 100.", "A rare breed — only in the shop. Eats and plays like any pet, but brings more joy: mood starts at 100."), '</p>\n    <label class="field"><span>').concat(L("Кличка", "Name"), '</span><input type="text" id="shpPtName" maxlength="14" autocomplete="off" value="').concat(esc(rnd(k.names)), '"></label>\n    ').concat(full ? '<p class="join-err">'.concat(L("Больше ".concat(PET_MAX, " питомцев не поместится в квартиру"), "No room for more than ".concat(PET_MAX, " pets")), "</p>") : "".concat(coupon ? '<button class="btn-main" type="button" id="shpPtCoupon">🎟️ '.concat(L("Забрать по купону", "Take it with the coupon"), "</button>") : "", '\n         <button class="').concat(coupon ? "btn-ghost" : "btn-main", '" type="button" id="shpPtBuy">🏡 ').concat(L("Забрать домой за ".concat(money(cost)), "Take home for ".concat(money(cost))), "</button>"), '\n    <button class="btn-ghost" type="button" id="shpPtBack">').concat(L("Назад", "Back"), "</button></div>");
  m.hidden = false;
  const cv = m.querySelector(".pet-cv");
  petViewer(cv, b, { action: "happy" }).then((v) => {
    if (v && cv.isConnected && !m.hidden) view = v;
    else v == null ? void 0 : v.dispose();
  });
  const take = (how) => {
    var _a;
    const nm = ($("shpPtName").value || rnd(k.names)).trim().slice(0, 14) || rnd(k.names);
    if (how === "coupon") {
      prefs.rarePetCoupons--;
      savePrefs();
      track("shop_buy", { detail: "".concat(b.id, ":coupon") });
    } else if (!shpSpend(cost, b.id, b.t, () => rarePetView(id, back, price), C2)) return;
    if (price != null) {
      prefs.dealDay = today();
      savePrefs();
    }
    h.pets || (h.pets = []);
    const p = { id: "p" + Date.now().toString(36), kind: b.kind, breed: b.id, name: nm, mood: 100, have: [], last: { p_food: C2.week }, rare: true };
    h.pets.push(p);
    h.mood = Math.min(100, ((_a = h.mood) != null ? _a : 70) + 20);
    careerSave(C2);
    track("pet_adopt", { detail: b.id });
    close();
    petToon("adopt", p, null, back);
  };
  if ($("shpPtCoupon")) $("shpPtCoupon").onclick = () => take("coupon");
  if ($("shpPtBuy")) $("shpPtBuy").onclick = () => take("ue");
  $("shpPtBack").onclick = () => {
    close();
    back == null ? void 0 : back();
  };
}
let shpTick = 0;
function openStore(section = "", after) {
  const m = $("modal");
  const back = () => openStore("", after);
  clearInterval(shpTick);
  const render = () => {
    var _a;
    const C2 = shpCareer(), h = C2 == null ? void 0 : C2.hero, deal = dealToday(), st = seasonState();
    const rows = (list, fn) => '<div class="gp-list">'.concat(list.map(fn).join(""), "</div>");
    const buyBtn = (attr, price, label) => '<button type="button" class="btn-chip'.concat(!C2 || (C2.bank || 0) < price ? " tu-btn" : "", '" ').concat(attr, ">").concat(label || "").concat(shpPrice(price), "</button>");
    m.innerHTML = '<div class="modal-box glass shp-box" role="dialog" aria-modal="true" aria-labelledby="shpTitle">\n      <h2 id="shpTitle">🛒 '.concat(L("Магазин", "Shop"), '</h2>\n      <p class="shop-bal">').concat(C2 ? L("На счёте: <b>".concat(money(C2.bank || 0), "</b>"), "Balance: <b>".concat(money(C2.bank || 0), "</b>")) : L("У.е. тратятся в карьере — начните её кнопкой «Играть».", "Spend $ in your career — start one with “Play”."), " ").concat(window.VDP_PLATFORM || window.VK_MINI && !Object.keys(vkPrices || {}).length ? "" : topupBtn(0, ""), '</p>\n      <nav class="shp-nav">').concat([["shpDeal", L("🔥 Выгодно", "🔥 Deals")], ...noAdsSale() ? [["shpNoads", L("🚫 Без рекламы", "🚫 Ad-free")]] : [], ["shpBoost", L("⚡ Бустеры", "⚡ Boosters")], ["shpRare", L("✨ Редкое", "✨ Rare")], ["shpSeason", L("🏆 Сезон", "🏆 Season")]].map(([id, t]) => '<button type="button" class="btn-chip" data-go="'.concat(id, '">').concat(t, "</button>")).join(""), "</nav>\n      ").concat(shopStarterHtml("shp"), '\n      <section id="shpDeal" class="shp-sec"><h3 class="hs-h">🔥 ').concat(L("Предложение дня", "Deal of the day"), ' <small class="shp-timer" id="shpTimer">').concat(hhmmss(toMidnight()), '</small></h3>\n        <div class="shp-deal').concat(dealBought() ? " done" : "", '"><span class="gp-ico" aria-hidden="true">').concat(deal.ico, '</span><span class="gp-txt"><b>').concat(esc(deal.t()), "</b><small><s>").concat(money(deal.base), "</s> → <b>").concat(money(deal.price), "</b> · −").concat(Math.round((1 - deal.price / deal.base) * 100), "%</small></span>\n          ").concat(dealBought() ? '<em class="gp-own">✓ '.concat(L("куплено", "bought"), "</em>") : buyBtn('data-deal="1"', deal.price), "</div>\n        ").concat((prefs.themeCoupons || 0) > 0 ? '<button type="button" class="btn-ghost" id="shpThemePick">🎨 '.concat(L("Выбрать тему по купону (".concat(prefs.themeCoupons, ")"), "Pick a theme with your coupon (".concat(prefs.themeCoupons, ")")), "</button>") : "", '</section>\n      <section id="shpNoads" class="shp-sec"').concat(noAdsSale() ? "" : " hidden", '><h3 class="hs-h">🚫 ').concat(L("Без рекламы", "Ad-free"), '</h3>\n        <p class="field-note">').concat(noAdsOn() ? '<b class="shp-ok">✓ '.concat(prefs.noAdsForever ? L("Реклама отключена навсегда", "Ads are off forever") : L("Реклама отключена: ещё ".concat(pl(noAdsDays(), "день", "дня", "дней", "day", "days")), "Ads are off: ".concat(pl(noAdsDays(), "", "", "", "more day", "more days"))), "</b> · ") : "").concat(L("Ни обязательной рекламы между неделями и после разминок, ни всплывающих предложений. «Реклама за награду» остаётся — только если сами нажмёте.", "No ads between weeks or after warm-ups and no ad pop-ups. Rewarded ads stay — only when you tap them."), "</p>\n        ").concat(prefs.noAdsForever ? "" : rows(
      [["d30", "📅", L("30 дней без рекламы", "30 days ad-free"), NOADS.d30.price, L("продлевает текущий срок", "extends your current period")], ["forever", "♾️", L("Навсегда", "Forever"), NOADS.forever.price, L("один раз — и больше никакой рекламы", "pay once — no more ads, ever")]],
      ([id, ico, t, price, sub]) => '<div class="gp-item'.concat(id === "forever" ? " shp-best" : "", '"><span class="gp-ico" aria-hidden="true">').concat(ico, '</span><span class="gp-txt"><b>').concat(t, "</b><small>").concat(sub, "</small></span>").concat(buyBtn('data-noads="'.concat(id, '"'), price), "</div>")
    ), "\n        ").concat(prefs.noAdsForever || window.VDP_PLATFORM || window.VK_MINI || window.NO_PAY ? "" : '<div class="shp-coffee shp-pay"><b>💳 '.concat(L("30 дней без рекламы — 99 ₽", "30 ad-free days — 99 ₽"), "</b>\n          <p>").concat(L("Оплата картой или СБП, без трат у.е. Срок складывается с текущим.", "Pay by card, no $ spent. Adds to your current period."), '</p>\n          <label class="tu-agree"><input type="checkbox"> <span>').concat(L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a>'), '</span></label>\n          <p class="join-err" role="alert"></p>\n          <button class="btn-main" type="button" data-product="noads">').concat(L("Купить за 99 ₽", "Buy for 99 ₽"), "</button></div>"), '</section>\n      <section id="shpBoost" class="shp-sec"><h3 class="hs-h">⚡ ').concat(L("Бустеры", "Boosters"), "</h3>\n        ").concat(rows(
      [
        ["x2", "⚡", L("x2 у.е. за неделю", "Double pay for a week"), X2_PRICE, prefs.x2Weeks || 0 ? L("зарплата недели — ещё раз · запас: ".concat(prefs.x2Weeks, " нед."), "this week’s pay again · stocked: ".concat(prefs.x2Weeks, " wk")) : L("зарплата ближайшей недели — ещё раз", "your next week’s pay, once more")],
        ["hints", "💡", L("".concat(HINTS_PACK.n, " подсказок"), "".concat(HINTS_PACK.n, " hints")), HINTS_PACK.price, L("вместо ".concat(money(HINTS_PACK.n * HINT_BASE)).concat(prefs.freeHints ? " · есть: ".concat(prefs.freeHints) : ""), "instead of ".concat(money(HINTS_PACK.n * HINT_BASE)).concat(prefs.freeHints ? " · you have ".concat(prefs.freeHints) : ""))]
      ],
      ([id, ico, t, price, sub]) => '<div class="gp-item"><span class="gp-ico" aria-hidden="true">'.concat(ico, '</span><span class="gp-txt"><b>').concat(t, "</b><small>").concat(sub, "</small></span>").concat(buyBtn('data-boost="'.concat(id, '"'), price), "</div>")
    ), '</section>\n      <section id="shpRare" class="shp-sec"><h3 class="hs-h">✨ ').concat(L("Редкое — только здесь", "Rare — only here"), '</h3>\n        <p class="field-note">').concat(L("Питомцы редких пород и вещи, которых нет в обычных покупках. Вещи радуют персонажа каждую неделю.", "Rare pet breeds and items you can’t get anywhere else. Items cheer your character up every week.")).concat((prefs.rarePetCoupons || 0) > 0 ? ' <b class="shp-ok">🎟️ '.concat(L("Купон на питомца: ".concat(prefs.rarePetCoupons), "Pet coupons: ".concat(prefs.rarePetCoupons)), "</b>") : "", '</p>\n        <div class="shp-grid">').concat(RARE_PETS.map((b) => {
      var _a2;
      const has = (_a2 = h == null ? void 0 : h.pets) == null ? void 0 : _a2.some((p) => p.breed === b.id);
      return '<button type="button" class="shp-card" data-rpet="'.concat(b.id, '"><span class="shp-rare">✨</span><i class="shp-dot2" style="background:').concat(b.color, '"></i><span aria-hidden="true">').concat(PET_KINDS[b.kind].ico, "</span><b>").concat(esc(b.t), "</b><small>").concat(has ? L("✓ уже дома", "✓ at home") : (prefs.rarePetCoupons || 0) > 0 ? L("по купону", "with coupon") : money(b.price), "</small></button>");
    }).join(""), '</div>\n        <div class="shp-grid">').concat(RARE_ITEMS.map((x) => {
      var _a2;
      const has = (_a2 = h == null ? void 0 : h.rare) == null ? void 0 : _a2.includes(x.id);
      return '<button type="button" class="shp-card'.concat(has ? " got" : "", '" data-ritem="').concat(x.id, '" ').concat(has ? "disabled" : "", '><span class="shp-rare">✨</span><span aria-hidden="true">').concat(x.ico, "</span><b>").concat(esc(goodText(x, h)), "</b><small>").concat(has ? L("✓ есть", "✓ owned") : "".concat(money(x.price), " · ").concat(L("настр. +".concat(x.mood), "mood +".concat(x.mood))), "</small></button>");
    }).join(""), '</div></section>\n      <section id="shpSeason" class="shp-sec"><h3 class="hs-h">🏆 ').concat(L("Сезон: ".concat(seasonName(st.id)), "Season: ".concat(seasonName(st.id))), '</h3>\n        <p class="field-note">').concat(L("Уровень ".concat(seasonLevel(st), "/").concat(SEASON_LEVELS, ". Премиум-дорожка — у.е. на каждом уровне, подсказки, x2, неделя без рекламы, вещь и тема сезона."), "Level ".concat(seasonLevel(st), "/").concat(SEASON_LEVELS, ". Premium track: $ on every level, hints, x2, a week ad-free, the season item and theme.")), '</p>\n        <button type="button" class="btn-ghost" id="shpSeasonGo">🏆 ').concat(st.prem ? L("Открыть сезон", "Open the season") : L("Сезон · премиум ".concat(money(SEASON_PRICE)), "Season · premium ".concat(money(SEASON_PRICE))), "</button></section>\n      ").concat(coffeeHtml("shp"), '\n      <button class="btn-ghost" type="button" id="shpClose">').concat(L("Закрыть", "Close"), "</button></div>");
    m.hidden = false;
    m.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => {
      var _a2;
      return (_a2 = $(b.dataset.go)) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    (_a = m.querySelector("[data-deal]")) == null ? void 0 : _a.addEventListener("click", () => {
      var _a2, _b;
      if (dealBought()) return;
      if (deal.id === "pet") return rarePetView(deal.ref, back, deal.price);
      if (deal.id === "item") {
        if ((_b = (_a2 = shpHero()) == null ? void 0 : _a2.rare) == null ? void 0 : _b.includes(deal.ref)) return toast(L("Эта вещь уже есть", "You already have this item"));
        rareItemView(deal.ref, back, deal.price);
        return;
      }
      if (!shpSpend(deal.price, "deal_" + deal.id, deal.t(), back)) return;
      if (deal.id === "hints5") prefs.freeHints = (prefs.freeHints || 0) + 5;
      if (deal.id === "x2") prefs.x2Weeks = (prefs.x2Weeks || 0) + 1;
      if (deal.id === "noads7") noAdsAdd(7);
      prefs.dealDay = today();
      savePrefs();
      toast(L("🔥 Куплено: ".concat(deal.t()), "🔥 Bought: ".concat(deal.t())));
      render();
    });
    m.querySelectorAll("[data-noads]").forEach((b) => b.onclick = () => {
      const id = b.dataset.noads, o = NOADS[id];
      if (!shpSpend(o.price, "noads_" + id, id === "forever" ? L("Без рекламы навсегда", "Ad-free forever") : L("30 дней без рекламы", "30 days ad-free"), () => openStore("shpNoads", after))) return;
      if (id === "forever") {
        prefs.noAdsForever = true;
        savePrefs();
      } else noAdsAdd(o.days);
      confetti == null ? void 0 : confetti();
      toast(id === "forever" ? L("🚫 Реклама отключена навсегда. Спасибо, что поддерживаете игру!", "🚫 Ads are off forever. Thanks for supporting the game!") : L("🚫 Без рекламы ещё ".concat(noAdsDays(), " дн."), "🚫 Ad-free for ".concat(noAdsDays(), " more days")));
      render();
    });
    m.querySelectorAll("[data-boost]").forEach((b) => b.onclick = () => {
      const id = b.dataset.boost;
      if (id === "x2") {
        if (!shpSpend(X2_PRICE, "x2", L("x2 у.е. за неделю", "Double pay for a week"), back)) return;
        prefs.x2Weeks = (prefs.x2Weeks || 0) + 1;
        toast(L("⚡ x2 у.е.: зарплата следующей законченной недели придёт ещё раз", "⚡ Double pay: the pay for your next finished week comes twice"));
      }
      if (id === "hints") {
        if (!shpSpend(HINTS_PACK.price, "hints", L("".concat(HINTS_PACK.n, " подсказок"), "".concat(HINTS_PACK.n, " hints")), back)) return;
        prefs.freeHints = (prefs.freeHints || 0) + HINTS_PACK.n;
        toast(L("💡 +".concat(HINTS_PACK.n, " подсказок — кнопка «Подсказка» в неделе"), "💡 +".concat(HINTS_PACK.n, " hints — use the “Hint” button during a week")));
      }
      savePrefs();
      render();
    });
    m.querySelectorAll("[data-rpet]").forEach((b) => b.onclick = () => rarePetView(b.dataset.rpet, back));
    m.querySelectorAll("[data-ritem]").forEach((b) => b.onclick = () => rareItemView(b.dataset.ritem, back));
    if ($("shpThemePick")) $("shpThemePick").onclick = () => themeCouponPick(back);
    $("shpSeasonGo").onclick = () => openSeason(back);
    $("shpClose").onclick = () => {
      clearInterval(shpTick);
      m.hidden = true;
      if (after) after();
      else if (!views.menu.hidden) renderMenu();
    };
  };
  render();
  track("shop_open", { detail: section || "menu" });
  if (section) setTimeout(() => {
    var _a;
    return (_a = $(section)) == null ? void 0 : _a.scrollIntoView({ block: "start" });
  }, 60);
  shpTick = setInterval(() => {
    const t = $("shpTimer");
    if (!t || m.hidden) return clearInterval(shpTick);
    t.textContent = hhmmss(toMidnight());
  }, 1e3);
}
const openShopNoAds = (then) => openStore("shpNoads", then);
bus.on("menu", () => {
  var _a, _b;
  const b = $("openStore");
  if (b) {
    b.hidden = !!window.VDP_PLATFORM && !shpCareer();
    const st = seasonState(), hot = starterOn() || seasonClaimable(st) > 0 || shpCareer() && !dealBought();
    b.innerHTML = "🛒 ".concat(L("Магазин", "Shop")).concat(starterOn() ? ' <em class="shp-pill">🎁 '.concat(window.VK_MINI ? L("набор", "pack") : L("набор −90%", "pack −90%"), "</em>") : seasonClaimable(st) ? ' <em class="shp-pill">🏆 '.concat(seasonClaimable(st), "</em>") : "").concat(hot ? '<i class="shp-hot" aria-hidden="true"></i>' : "");
    b.onclick = () => openStore();
  }
  seasonCard();
  const cs = $("coffeeProf");
  if (cs) cs.innerHTML = coffeeHtml("ps");
  const who = document.querySelector(".me-who");
  if (who) {
    (_a = who.querySelector(".shp-maecenas")) == null ? void 0 : _a.remove();
    if (coffeeBadge()) (_b = $("meId")) == null ? void 0 : _b.insertAdjacentHTML("beforebegin", coffeeBadge());
  }
});
