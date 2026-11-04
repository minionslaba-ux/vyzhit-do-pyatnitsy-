/* сгенерировано tools/make-legacy.js из js/guest.js — не править */
const GUEST_FREE = 4, GUEST_PRICE = 0.5;
const guestLocked = () => !window.VDP_PLATFORM && !window.VK_MINI && !registered() && (prefs.gamesPlayed || 0) >= GUEST_FREE;
function guestGate(go) {
  var _a;
  if (!guestLocked()) return go();
  const C2 = careerNow(), bank = (_a = C2 == null ? void 0 : C2.bank) != null ? _a : 0, can = bank >= GUEST_PRICE, m = $("modal");
  track("guest_gate", { detail: String(prefs.gamesPlayed || 0) });
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="ggTitle"><span class="lvl-ico" aria-hidden="true">🔒</span>\n    <h2 id="ggTitle">'.concat(L("".concat(GUEST_FREE, " бесплатные недели позади"), "Your ".concat(GUEST_FREE, " free weeks are up")), "</h2>\n    <p>").concat(L("Без регистрации можно сыграть ".concat(GUEST_FREE, " недели. Зарегистрируйтесь — это бесплатно и займёт минуту: прогресс, персонаж и деньги сохранятся на всех устройствах."), "Without an account you can play ".concat(GUEST_FREE, " weeks. Sign up — it’s free and takes a minute: your progress, character and money are kept on every device.")), '</p>\n    <button class="btn-main" type="button" id="ggReg">✅ ').concat(L("Зарегистрироваться бесплатно", "Sign up for free"), '</button>\n    <p class="field-note">').concat(L("Или играйте без аккаунта: ".concat(money(GUEST_PRICE), " за каждую неделю с игрового счёта (сейчас на счёте ").concat(money(bank), ")."), "Or keep playing without an account: ".concat(money(GUEST_PRICE), " per week from your in-game balance (you have ").concat(money(bank), ").")), "</p>\n    ").concat(can ? '<button class="btn-ghost" type="button" id="ggPay">'.concat(L("Сыграть неделю за ".concat(money(GUEST_PRICE)), "Play a week for ".concat(money(GUEST_PRICE))), "</button>") : '<p class="join-err">'.concat(L("На игровом счёте не хватает у.е.", "Not enough $ in your balance"), "</p>"), "\n    ").concat(adReady() ? '<button class="btn-ghost btn-ad" type="button" id="ggAd">🎬 '.concat(L("Сыграть неделю за просмотр рекламы", "Play a week for watching an ad"), "</button>") : "", '\n    <button class="btn-link" type="button" id="ggBack">').concat(L("В меню", "Main menu"), "</button></div>");
  m.hidden = false;
  $("ggReg").onclick = () => {
    m.hidden = true;
    renderJoin("register", L("Регистрация бесплатна. После неё игра продолжится без ограничений.", "Signing up is free. After that you can play with no limits."));
  };
  if ($("ggPay")) $("ggPay").onclick = () => {
    const c = careerNow();
    c.bank -= GUEST_PRICE;
    c.spent = (c.spent || 0) + GUEST_PRICE;
    careerSave(c);
    track("guest_pay", { detail: String(GUEST_PRICE) });
    m.hidden = true;
    toast(L("Неделя оплачена: −".concat(money(GUEST_PRICE), " · на счёте ").concat(money(c.bank)), "Week paid: −".concat(money(GUEST_PRICE), " · balance ").concat(money(c.bank))));
    go();
  };
  if ($("ggAd")) $("ggAd").onclick = () => {
    m.hidden = true;
    adWatch((ok) => {
      if (!ok) guestGate(go);
    }, { why: "guest", give: () => {
      setTimeout(go, 300);
      return L("🎬 Спасибо! Неделя открыта", "🎬 Thanks! The week is unlocked");
    } });
  };
  $("ggBack").onclick = () => {
    m.hidden = true;
    renderMenu();
  };
}
for (const name of ["startWeek", "startDaily", "startPack", "startTournament"]) {
  const orig = window[name];
  if (typeof orig !== "function") continue;
  window[name] = function(...a) {
    return guestGate(() => orig.apply(this, a));
  };
}
const REG_WHAT = {
  hint: L("Подсказки", "Hints"),
  shop: L("Магазин и покупки", "The shop and purchases"),
  hero: L("Смена персонажа", "Changing your character"),
  pet: L("Питомцы", "Pets"),
  gift: L("Подарки коллегам", "Gifts for coworkers"),
  stickers: L("Премиум-стикеры", "Premium stickers"),
  theme: L("Темы оформления", "Colour themes"),
  wish: L("Покупки для персонажа", "Gifts for your character")
};
function needReg(feature) {
  if (window.VDP_PLATFORM || !board.online || registered()) return true;
  if (window.VK_MINI) {
    toast(L("Входим через ВКонтакте…", "Signing in with VK…"));
    if (typeof vkLogin === "function") vkLogin();
    return false;
  }
  track("reg_gate", { detail: feature });
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="rgTitle"><span class="lvl-ico" aria-hidden="true">🔐</span>\n    <h2 id="rgTitle">'.concat(esc(REG_WHAT[feature] || L("Эта функция", "This feature")), " — ").concat(L("для зарегистрированных", "for registered players"), "</h2>\n    <p>").concat(L("Регистрация бесплатная и занимает 10 секунд: через Telegram, VK или почту. Ваши у.е., персонаж и прогресс сохранятся.", "Signing up is free and takes 10 seconds — via Telegram, VK or email. Your $, character and progress stay with you."), '</p>\n    <ul class="lw-list"><li>💡 ').concat(L("подсказки и магазин", "hints and the shop"), "</li><li>🧍 ").concat(L("смена персонажа, питомцы, покупки", "switch characters, pets, purchases"), "</li><li>🎁 ").concat(L("подарки, стикеры, темы", "gifts, stickers, themes"), "</li><li>☁️ ").concat(L("прогресс на телефоне и компьютере", "progress on phone and computer"), '</li></ul>\n    <button class="btn-main" type="button" id="rgGo">✅ ').concat(L("Зарегистрироваться бесплатно", "Sign up for free"), '</button>\n    <button class="btn-link" type="button" id="rgLater">').concat(L("Не сейчас", "Not now"), "</button></div>");
  m.hidden = false;
  $("rgGo").onclick = () => {
    m.hidden = true;
    track("reg_gate_go", { detail: feature });
    if (!views.game.hidden && typeof leaveWeek === "function") leaveWeek();
    renderJoin("register", L("Регистрация бесплатна. После неё откроются подсказки, магазин и всё остальное.", "Signing up is free. Hints, the shop and everything else unlock right after."));
  };
  $("rgLater").onclick = () => {
    m.hidden = true;
  };
  return false;
}
