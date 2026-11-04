/* сгенерировано tools/make-legacy.js из js/topup.js — не править */
const TOPUP_TIERS = [[1, 100], [10, 90], [25, 80], [50, 70], [100, 60]];
const TOPUP_PACKS = [10, 25, 50, 100];
const rubPer = (n) => TOPUP_TIERS.reduce((p, [from, price]) => n >= from ? price : p, 100);
const rub = (n) => (n * rubPer(n)).toLocaleString("ru-RU") + " ₽";
const TOPUP_TAG = { 25: () => L("Популярное", "Popular"), 100: () => L("Выгодно", "Best value") };
const firstBonusOn = () => !prefs.paidUser;
const lackOf = (price) => {
  const C2 = careerNow();
  return C2 ? Math.max(0, price - Math.max(0, C2.bank)) : price;
};
function openTopup({ need = 0, why = "", then } = {}) {
  if (window.NO_PAY) {
    toast(L("В этой версии игры покупок нет. У.е. зарабатываются в игре: зарплата в карьере, задания дня, разминки и серия дней.", "There are no purchases in this version. Earn $ in the game: career salary, daily tasks, breaks and day streaks."));
    return then == null ? void 0 : then();
  }
  if (window.VK_MINI) return openVkTopup({ need, why, then });
  if (window.VDP_PLATFORM) return toast(L("Покупка у.е. доступна на сайте survivefriday.com", "Buying $ is available on survivefriday.com"));
  const m = $("modal"), C2 = careerNow();
  let n = Math.max(need, need ? need : 10);
  const close = () => {
    m.hidden = true;
    then == null ? void 0 : then();
  };
  const render = () => {
    const opts = [...new Set([need, ...TOPUP_PACKS].filter((x) => x > 0))].sort((a, b) => a - b);
    m.innerHTML = '<div class="modal-box glass topup-box" role="dialog" aria-modal="true" aria-labelledby="tuTitle">\n      <h2 id="tuTitle">💰 '.concat(L("Пополнить баланс", "Top up your balance"), "</h2>\n      ").concat(why ? '<p class="tu-why">'.concat(why, "</p>") : "", "\n      ").concat(typeof shopStarterHtml === "function" ? shopStarterHtml("tu") : "", '\n      <p class="shop-bal">').concat(C2 ? L("На счёте: <b>".concat(money(C2.bank), "</b>"), "Balance: <b>".concat(money(C2.bank), "</b>")) : L("У.е. зачислятся в карьеру — начните её, чтобы тратить.", "The $ go to your career — start one to spend them."), '</p>\n      <div class="tu-packs">').concat(opts.map((x) => '<button type="button" class="tu-pack'.concat(x === n ? " on" : "", '" data-n="').concat(x, '">\n        ').concat(TOPUP_TAG[x] ? '<em class="shp-tag">'.concat(TOPUP_TAG[x](), "</em>") : "", "<b>").concat(L("".concat(x, " у.е."), "$".concat(x)), "</b><span>").concat(rub(x), "</span><small>").concat(x === need ? L("сколько не хватает", "exactly what you lack") : rubPer(x) < 100 ? L("−".concat(100 - rubPer(x), "% · ").concat(rubPer(x), " ₽/у.е."), "−".concat(100 - rubPer(x), "% · ").concat(rubPer(x), " ₽ each")) : L("100 ₽/у.е.", "100 ₽ each"), "</small></button>")).join(""), '</div>\n      <div class="tu-custom"><button type="button" class="btn-chip" id="tuMinus" aria-label="').concat(L("Меньше", "Less"), '">−</button><span>').concat(EN ? "$" : "", '<b id="tuN">').concat(n, "</b>").concat(L(" у.е.", ""), ' = <b id="tuSum">').concat(rub(n), '</b></span><button type="button" class="btn-chip" id="tuPlus" aria-label="').concat(L("Больше", "More"), '">+</button></div>\n      ').concat(firstBonusOn() ? '<p class="shp-first">🎁 '.concat(L("Первое пополнение: <b>+50% у.е. в подарок</b> — зачислим вместе с покупкой", "First top-up: <b>+50% bonus $</b> — credited with your purchase"), "</p>") : "", '\n      <p class="tu-tiers">').concat(L("Чем больше пополнение, тем дешевле: 10+ у.е. — 90 ₽, 25+ — 80 ₽, 50+ — 70 ₽, 100+ — 60 ₽ за 1 у.е.", "The more you buy, the cheaper: 10+ — 90 ₽, 25+ — 80 ₽, 50+ — 70 ₽, 100+ — 60 ₽ per $1."), '</p>\n      <label class="tu-agree"><input type="checkbox" id="tuAgree"> <span>').concat(L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a> и <a href="politika.html" target="_blank" rel="noopener">политикой обработки персональных данных</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a> and <a href="politika.html" target="_blank" rel="noopener">privacy policy</a> (in Russian)'), '</span></label>\n      <p class="join-err" id="tuErr" role="alert"></p>\n      <button class="btn-main" type="button" id="tuPay">').concat(L("Оплатить", "Pay"), " ").concat(rub(n), '</button>\n      <p class="tu-alt">').concat(L("Или заработайте в игре: зарплата, премии за дедлайны, задания дня, награды за друзей.", "Or earn it in the game: salary, deadline bonuses, daily quests, referral rewards."), "</p>\n      ").concat(adBtnHtml(), '\n      <button class="btn-ghost" type="button" id="tuClose">').concat(L("Не сейчас", "Not now"), "</button></div>");
    m.hidden = false;
    const set = (x) => {
      n = Math.max(1, Math.min(500, x));
      $("tuN").textContent = n;
      $("tuSum").textContent = rub(n);
      $("tuPay").textContent = "".concat(L("Оплатить", "Pay"), " ").concat(rub(n));
      m.querySelectorAll(".tu-pack").forEach((b) => b.classList.toggle("on", +b.dataset.n === n));
    };
    m.querySelectorAll(".tu-pack").forEach((b) => b.onclick = () => set(+b.dataset.n));
    $("tuMinus").onclick = () => set(n - 1);
    $("tuPlus").onclick = () => set(n + 1);
    $("tuClose").onclick = close;
    $("tuPay").onclick = () => {
      if (!$("tuAgree").checked) {
        $("tuErr").textContent = L("Отметьте согласие с офертой.", "Please accept the public offer.");
        return;
      }
      if (!(typeof registered === "function" && registered())) {
        m.hidden = true;
        renderJoin("login", L("Чтобы купить у.е., войдите в аккаунт — так они не потеряются и будут на всех устройствах.", "Sign in to buy $ — so they’re safe and on every device."));
        return;
      }
      track("buy_intent", { detail: "".concat(n, ":").concat(n * rubPer(n)) });
      const btn = $("tuPay");
      btn.disabled = true;
      btn.textContent = L("Переходим к оплате…", "Opening the payment page…");
      (async () => {
        try {
          const r = await fnPost("robokassa-pay", { access_token: await board.accessToken(), ue: n, email: prefs.email || "" });
          if (!(r == null ? void 0 : r.url)) throw new Error((r == null ? void 0 : r.error) || "no url");
          store.set("vdp-pay-pending", { inv: r.inv_id, ue: n, at: Date.now() });
          location.href = r.url;
        } catch (e) {
          btn.disabled = false;
          btn.textContent = "".concat(L("Оплатить", "Pay"), " ").concat(rub(n));
          $("tuErr").textContent = /not_configured/.test(e.message) ? L("Оплата картой появится совсем скоро. А пока у.е. можно заработать в игре.", "Card payments are coming very soon. Meanwhile, earn $ in the game.") : /session/.test(e.message) ? L("Войдите в аккаунт ещё раз и повторите оплату.", "Please sign in again and retry.") : L("Не удалось открыть оплату — попробуйте ещё раз.", "Couldn’t open the payment page — please try again.");
        }
      })();
    };
  };
  render();
}
const VK_NO_PAY = () => L("Покупки в приложении ВКонтакте пока недоступны — играть можно бесплатно", "Purchases aren’t available in the VK app yet — the game is free to play");
const vkPayOn = () => {
  var _a, _b;
  return !!(window.VK_MINI && ((_b = (_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.vk) == null ? void 0 : _b.pay) && typeof vkBridge === "function" && board.online);
};
let vkPrices = null;
async function vkPriceList() {
  if (!vkPayOn()) return {};
  if (vkPrices) return vkPrices;
  try {
    const r = await fetch(SOC_FN() + "vk-pay?prices=1");
    const j = r.ok ? await r.json() : null;
    if (j && typeof j.items === "object") vkPrices = j.items || {};
  } catch (e) {
  }
  return vkPrices || {};
}
const vkPrice = (item) => {
  var _a;
  return ((_a = vkPrices == null ? void 0 : vkPrices[item]) == null ? void 0 : _a.votes) || 0;
};
const votesStr = (n) => pl(n, "голос", "голоса", "голосов", "vote", "votes");
if (window.VK_MINI) dataReady.then(() => setTimeout(() => vkPriceList(), 1500));
async function vkBuy(item, btn) {
  var _a;
  if (!vkPayOn() || !vkPrice(item)) return toast(VK_NO_PAY());
  if (!(typeof registered === "function" && registered())) {
    $("modal").hidden = true;
    return renderJoin("login", L("Чтобы купить, войдите в аккаунт — так покупка не потеряется и будет на всех устройствах.", "Sign in to buy — so your purchase is safe and on every device."));
  }
  track("buy_intent", { detail: "vk:".concat(item, ":").concat(vkPrice(item)) });
  const label = btn == null ? void 0 : btn.textContent;
  if (btn) btn.disabled = true;
  const it = vkPrices[item];
  store.set("vdp-pay-pending", { inv: 0, ue: it.ue, product: it.product, at: Date.now() });
  const r = await vkBridge("VKWebAppShowOrderBox", { type: "item", item }, 6e5);
  if (btn) {
    btn.disabled = false;
    btn.textContent = label;
  }
  if ((r == null ? void 0 : r.success) || (r == null ? void 0 : r.status) === "success" || (r == null ? void 0 : r.order_id)) {
    $("modal").hidden = true;
    toast(L("💰 Оплата прошла — зачисляем…", "💰 Payment received — crediting…"));
    setTimeout(() => claimPaid(5), 1500);
    return;
  }
  const code = (_a = r == null ? void 0 : r.error_data) == null ? void 0 : _a.error_code;
  if (code === 4 || (r == null ? void 0 : r.error_type) === "client_error" && /cancel/i.test(JSON.stringify((r == null ? void 0 : r.error_data) || ""))) return;
  if (r === null) {
    setTimeout(() => claimPaid(3), 1500);
    return;
  }
  track("vk_pay_fail", { detail: String(code || (r == null ? void 0 : r.error_type) || "").slice(0, 40) });
  toast(L("Не удалось открыть оплату ВКонтакте — попробуйте ещё раз.", "Couldn’t open VK payment — please try again."));
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-vkitem]");
  if (!b) return;
  e.preventDefault();
  vkBuy(b.dataset.vkitem, b);
});
async function openVkTopup({ need = 0, why = "", then } = {}) {
  const items = await vkPriceList();
  const packs = TOPUP_PACKS.filter((n) => {
    var _a;
    return ((_a = items["ue" + n]) == null ? void 0 : _a.votes) > 0;
  });
  if (!packs.length && !starterOn()) return toast(VK_NO_PAY());
  const m = $("modal"), C2 = careerNow(), close = () => {
    m.hidden = true;
    then == null ? void 0 : then();
  };
  const best = packs.find((n) => n >= need) || packs[packs.length - 1];
  const per = (x) => items["ue" + x].votes / x, vkTag = (x) => x === 25 && packs.length > 1 ? TOPUP_TAG[25]() : x === 100 && packs.length > 1 && per(100) < per(packs[0]) ? TOPUP_TAG[100]() : "";
  m.innerHTML = '<div class="modal-box glass topup-box" role="dialog" aria-modal="true" aria-labelledby="tuTitle">\n    <h2 id="tuTitle">💰 '.concat(L("Пополнить баланс", "Top up your balance"), "</h2>\n    ").concat(why ? '<p class="tu-why">'.concat(why, "</p>") : "", "\n    ").concat(typeof shopStarterHtml === "function" ? shopStarterHtml("tu") : "", '\n    <p class="shop-bal">').concat(C2 ? L("На счёте: <b>".concat(money(C2.bank), "</b>"), "Balance: <b>".concat(money(C2.bank), "</b>")) : L("У.е. зачислятся в карьеру — начните её, чтобы тратить.", "The $ go to your career — start one to spend them."), "</p>\n    ").concat(packs.length ? '<div class="tu-packs">'.concat(packs.map((x) => '<button type="button" class="tu-pack'.concat(x === best ? " on" : "", '" data-vkitem="ue').concat(x, '">\n      ').concat(vkTag(x) ? '<em class="shp-tag">'.concat(vkTag(x), "</em>") : "", "<b>").concat(L("".concat(x, " у.е."), "$".concat(x)), "</b><span>").concat(votesStr(items["ue" + x].votes), "</span>").concat(need && x >= need && x === best ? "<small>".concat(L("хватит на покупку", "covers what you lack"), "</small>") : "", "</button>")).join(""), "</div>") : "", "\n    ").concat(packs.length && firstBonusOn() ? '<p class="shp-first">🎁 '.concat(L("Первое пополнение: <b>+50% у.е. в подарок</b> — зачислим вместе с покупкой", "First top-up: <b>+50% bonus $</b> — credited with your purchase"), "</p>") : "", '\n    <p class="tu-alt">').concat(L("Оплата голосами ВКонтакте. Или заработайте в игре: зарплата, премии за дедлайны, задания дня, награды за друзей.", "Paid with VK votes. Or earn it in the game: salary, deadline bonuses, daily quests, referral rewards."), '</p>\n    <button class="btn-ghost" type="button" id="tuClose">').concat(L("Не сейчас", "Not now"), "</button></div>");
  m.hidden = false;
  $("tuClose").onclick = close;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-topup]");
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  const back = { shop: () => openShop(), heroShop: () => heroShop(), heroAsk: () => heroAsk(), desk: () => openDesk(), tools: () => cardTools(), goods: () => goodsReopen == null ? void 0 : goodsReopen(), kid: () => kidReopen == null ? void 0 : kidReopen(), kidWish: () => kidWishBack == null ? void 0 : kidWishBack(), pet: () => petReopen == null ? void 0 : petReopen(), petWish: () => petWishBack == null ? void 0 : petWishBack() }[b.dataset.topupBack];
  openTopup({ need: +b.dataset.topup || 0, why: b.dataset.topupWhy || "", then: back });
}, true);
const topupBtn = (need, back, why = "", cls = "btn-chip tu-btn") => window.NO_PAY ? "" : '<button type="button" class="'.concat(cls, '" data-topup="').concat(need, '" data-topup-back="').concat(back || "", '" data-topup-why="').concat(esc(why), '">💰 ').concat(need ? L("Не хватает ".concat(need, " — пополнить"), "$".concat(need, " short — top up")) : L("Пополнить", "Top up"), "</button>");
async function claimPaid(again = 0) {
  var _a;
  if (!(typeof registered === "function" && registered()) || !board.online) return;
  try {
    let rows = await board.rpc("claim_purchases2", {}).catch(() => null);
    if (!Array.isArray(rows)) {
      const n0 = Number(await board.rpc("claim_purchases", {})) || 0;
      rows = n0 > 0 ? [{ ue: n0, bonus: 0, product: null }] : [];
    }
    const n = rows.reduce((s2, r) => s2 + (Number(r.ue) || 0) + (Number(r.bonus) || 0), 0), bonus = rows.reduce((s2, r) => s2 + (Number(r.bonus) || 0), 0);
    if (rows.length) {
      if (n > 0) addCash(n);
      prefs.paidUser = true;
      store.set(KEY.prefs, prefs);
      for (const r of rows) if (r.product && typeof shopGrantProduct === "function") shopGrantProduct(r.product);
      const pend = store.get("vdp-pay-pending", null);
      store.del("vdp-pay-pending");
      if (!window.VK_MINI) try {
        (window.dataLayer = window.dataLayer || []).push({ ecommerce: { currencyCode: "RUB", purchase: { actionField: { id: String((pend == null ? void 0 : pend.inv) || Date.now()) }, products: rows.map((r) => r.product ? { id: r.product, name: r.product, price: r.product === "coffee" ? 100 : 149, quantity: 1 } : { id: "ue", name: L("Игровая валюта, у.е.", "In-game currency"), price: rubPer(r.ue), quantity: r.ue }) } } });
      } catch (e) {
      }
      (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
      confetti == null ? void 0 : confetti();
      if (rows.every((r) => r.product === "coffee")) toast(L("☕ Спасибо за кофе! +".concat(money(n), " на счёт"), "☕ Thanks for the coffee! +".concat(money(n))));
      else toast(rows.some((r) => r.product === "starter") ? L("🎁 Стартовый набор получен: +".concat(money(n), " на счёт и подарки. Спасибо!"), "🎁 Starter pack received: +".concat(money(n), " and gifts. Thank you!")) : bonus ? L("💰 Оплата прошла: +".concat(money(n), " на счёт (из них ").concat(money(bonus), " — подарок за первое пополнение). Спасибо!"), "💰 Payment received: +".concat(money(n), " (incl. ").concat(money(bonus), " first top-up bonus). Thank you!")) : L("💰 Оплата прошла: +".concat(money(n), " на счёт. Спасибо!"), "💰 Payment received: +".concat(money(n), ". Thank you!")));
      track("purchase", { detail: rows.map((r) => r.product || "".concat(r.ue).concat(r.bonus ? "+" + r.bonus : "")).join(",").slice(0, 60) });
      if (!views.menu.hidden) renderMenu();
    } else if (again > 0) setTimeout(() => claimPaid(again - 1), 4e3);
  } catch (e) {
  }
}
(() => {
  const q = new URLSearchParams(location.search), pay = q.get("pay");
  if (pay) history.replaceState(null, "", location.pathname + location.hash);
  if (pay === "fail") setTimeout(() => toast(L("Оплата не завершена — деньги не списаны. Можно попробовать ещё раз.", "Payment not completed — you weren’t charged. You can try again.")), 1500);
  const pend = store.get("vdp-pay-pending", null);
  setTimeout(() => claimPaid(pay === "ok" || pend && Date.now() - pend.at < 36e5 ? 5 : 0), 2500);
})();
bus.on("menu", () => {
  const b = $("meTopup");
  if (!b) return;
  b.hidden = !!(window.NO_PAY || window.VDP_PLATFORM || window.VK_MINI && !vkPayOn() || !board.online);
  b.onclick = () => {
    track("topup_open", { detail: "top" });
    openTopup({});
  };
});
