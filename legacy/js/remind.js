/* сгенерировано tools/make-legacy.js из js/remind.js — не править */
const REMIND_BONUS = 5, REMIND_GAP = 2 * 864e5;
const remindActive = () => typeof pushOn === "function" && pushOn() || !!prefs.tgRemind || window.VK_MINI && !!prefs.vkRemind || window.MAX_APP && !!prefs.maxRemind;
const remindAllowed = () => !window.VDP_PLATFORM && board.online && !!prefs.name;
function remindGrant() {
  if (prefs.remindBonus || !remindActive() || window.VK_MINI) return;
  prefs.remindBonus = 1;
  store.set(KEY.prefs, prefs);
  const now = addCash(REMIND_BONUS);
  setTimeout(() => toast(L("🔔 Напоминания включены — +".concat(money(REMIND_BONUS)).concat(now ? "" : " (придут в карьеру)"), "🔔 Reminders on — +".concat(money(REMIND_BONUS)).concat(now ? "" : " (goes to your career)"))), 700);
  track("remind_bonus");
}
async function remindTgOn() {
  if (!TG || typeof tgCall !== "function") return;
  try {
    const on = await tgCall(true);
    prefs.tgRemind = on;
    store.set(KEY.prefs, prefs);
    if (on) {
      toast(L("Готово: бот будет напоминать о неделе дня в 12:30", "Done: the bot will remind you about the Daily Week at 12:30"));
      remindGrant();
    }
  } catch (e) {
    toast(e.message);
  }
}
function remindChannel() {
  if (window.VK_MINI) return "vk";
  if (window.MAX_APP) return "max";
  if (TG) return "tg-here";
  const c = typeof pushCan === "function" ? pushCan() : "";
  if (c === "ok" && Notification.permission !== "denied") return "push";
  return "tg-open";
}
async function msgRemindCall(enable) {
  var _a;
  const body = window.VK_MINI ? { via: "vk", params: location.search } : { via: "max", init: ((_a = window.WebApp) == null ? void 0 : _a.initData) || window.MAX_INIT || "" };
  const j = await fnPost("msg-remind", { ...body, enable, lang: LANG, player_id: prefs.playerId });
  return !!j.enabled;
}
async function msgRemindSet(on) {
  try {
    if (window.VK_MINI) {
      const r = await vkBridge(on ? "VKWebAppAllowNotifications" : "VKWebAppDenyNotifications", {}, 6e4);
      if (on && !(r == null ? void 0 : r.result)) {
        toast(L("Уведомления не разрешены — включить можно позже в профиле", "Notifications not allowed — you can turn them on later in your profile"));
        return false;
      }
    }
    const v = await msgRemindCall(on);
    prefs[window.VK_MINI ? "vkRemind" : "maxRemind"] = v;
    store.set(KEY.prefs, prefs);
    toast(v ? L("🔔 Готово: раз в день напомним о неделе дня и разминке", "🔔 Done: we’ll remind you once a day about the Daily Week and a break") : L("Напоминания выключены", "Reminders off"));
    if (v) remindGrant();
    track("remind_msg", { detail: "".concat(window.VK_MINI ? "vk" : "max", ":").concat(v ? "on" : "off") });
    return v;
  } catch (e) {
    toast(L("Не получилось — попробуйте позже", "Didn’t work — try again later"));
    return false;
  }
}
function remindCardHtml() {
  const ch = remindChannel(), bonus = prefs.remindBonus || ch === "vk" ? "" : " <b>+".concat(money(REMIND_BONUS), "</b>");
  if (ch === "vk" || ch === "max") return '<div class="remind-card"><b>'.concat(L("Не пропустите неделю дня", "Don’t miss the Daily Week"), "</b>\n    <small>").concat(ch === "vk" ? L("Раз в день — уведомление ВКонтакте о неделе дня и разминке. Выключить можно в профиле игры.", "Once a day — a VK notification about the Daily Week and a break. Turn off anytime in your profile.") : L("Раз в день бот игры напишет в MAX о неделе дня и разминке. Выключить можно в профиле игры.", "Once a day the game bot messages you in MAX about the Daily Week and a break. Turn off anytime in your profile."), '</small>\n    <button type="button" class="btn-main" data-remind="').concat(ch, '">🔔 ').concat(ch === "vk" ? L("Напоминать во ВКонтакте", "Remind me on VK") : L("Напоминать в MAX", "Remind me in MAX")).concat(bonus, '</button>\n    <span class="remind-alt"><button type="button" class="btn-link" data-remind="no">').concat(L("Не сейчас", "Not now"), "</button></span></div>");
  const main = ch === "push" ? '<button type="button" class="btn-main" data-remind="push">🔔 '.concat(L("Напоминать мне", "Remind me")).concat(bonus, "</button>") : '<button type="button" class="btn-main btn-tg" data-remind="tg">🔔 '.concat(L("Напоминать в Telegram", "Remind me in Telegram")).concat(bonus, "</button>");
  const alt = ch === "push" ? '<button type="button" class="btn-link" data-remind="tg">'.concat(L("или в Telegram", "or in Telegram"), "</button>") : typeof pushIOS !== "undefined" && pushIOS && typeof pushIosHelp === "function" ? '<button type="button" class="btn-link" data-remind="ios">'.concat(L("или уведомления на iPhone", "or iPhone notifications"), "</button>") : "";
  return '<div class="remind-card"><b>'.concat(L("Не пропустите неделю дня", "Don’t miss the Daily Week"), "</b>\n    <small>").concat(L("Раз в день — неделя дня, бонусы и сообщения от коллег. Выключить можно в любой момент.", "Once a day — the Daily Week, bonuses and coworker messages. Turn off anytime."), "</small>\n    ").concat(main, '<span class="remind-alt">').concat(alt, '<button type="button" class="btn-link" data-remind="no">').concat(L("Не сейчас", "Not now"), "</button></span></div>");
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-remind]");
  if (!b) return;
  const a = b.dataset.remind, card0 = b.closest(".remind-card");
  const card = card0 && { remove: () => {
    if (card0.closest("#modal")) $("modal").hidden = true;
    card0.remove();
  } };
  track("remind_click", { detail: a });
  if (a === "no") {
    card == null ? void 0 : card.remove();
    return;
  }
  if (a === "ios") return pushIosHelp();
  if (a === "vk" || a === "max") {
    if (await msgRemindSet(true)) card == null ? void 0 : card.remove();
    return;
  }
  if (a === "push") {
    await pushEnable();
    if (pushOn()) {
      card == null ? void 0 : card.remove();
      remindGrant();
    }
    return;
  }
  if (a === "tg") {
    if (TG) {
      await remindTgOn();
      if (prefs.tgRemind) card == null ? void 0 : card.remove();
      return;
    }
    toast(L("Откроем игру в Telegram — напоминание включится само", "Opening the game in Telegram — the reminder turns on by itself"));
    setTimeout(() => {
      location.href = "https://t.me/Survivefridaybot?startapp=remind";
    }, 900);
  }
});
bus.on("weekEnd", () => {
  if (!remindAllowed() || remindActive() || prefs.remindNever) return;
  if (Date.now() - (prefs.remindAskAt || 0) < (window.VK_MINI ? 30 * 864e5 : REMIND_GAP)) return;
  setTimeout(() => {
    const st = views.end.querySelector(".end-sheet > .stack");
    if (!st || views.end.hidden || views.end.querySelector(".remind-card, [data-push]")) return;
    prefs.remindAskAt = Date.now();
    store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML("beforebegin", remindCardHtml());
    track("remind_ask", { detail: remindChannel() });
  }, 1600);
});
let remindWinPending = false;
bus.on("weekEnd", (x) => {
  if (x.won && !prefs.remindWinAsked && remindAllowed() && !remindActive() && !prefs.remindNever) remindWinPending = true;
});
bus.on("menu", () => {
  if (!remindWinPending) return;
  setTimeout(() => {
    const m = $("modal");
    if (!remindWinPending || !m.hidden || views.menu.hidden || remindActive()) return;
    if (window.VK_MINI && Date.now() - (prefs.remindAskAt || 0) < 30 * 864e5) return;
    remindWinPending = false;
    prefs.remindWinAsked = 1;
    prefs.remindAskAt = Date.now();
    store.set(KEY.prefs, prefs);
    m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="rwTitle"><span class="lvl-ico" aria-hidden="true">🎉</span>\n      <h2 id="rwTitle">'.concat(L("Неделя пройдена!", "Week survived!"), "</h2>\n      <p>").concat(L("Чтобы не терять серию, включите напоминание — раз в день, про неделю дня и разминку.", "To keep your streak going, turn on a reminder — once a day, about the Daily Week and a break."), "</p>\n      ").concat(remindCardHtml(), "</div>");
    m.hidden = false;
    track("remind_ask", { detail: "win-" + remindChannel() });
  }, 1800);
});
bus.on("menu", () => {
  remindGrant();
  if (typeof pushAskOnEntry === "function") setTimeout(pushAskOnEntry, 2500);
});
const REMIND2 = { max: "https://max.ru/se14877440_bot?startapp=remind", tg: "https://t.me/Survivefridaybot?startapp=remind" };
bus.on("menu", () => {
  const b = $("remind2");
  if (!b) return;
  const to = TG ? "max" : window.MAX_APP ? "tg" : "";
  b.hidden = !to || EN || !board.online;
  if (b.hidden) return;
  b.textContent = to === "max" ? L("🔔 Напоминать в MAX", "🔔 Remind me in MAX") : L("🔔 Напоминать в Telegram", "🔔 Remind me in Telegram");
  b.onclick = () => {
    track("remind_click", { detail: "other-" + to });
    toast(to === "max" ? L("Откроем игру в MAX — напоминание включится само", "Opening the game in MAX — the reminder turns on by itself") : L("Откроем игру в Telegram — напоминание включится само", "Opening the game in Telegram — the reminder turns on by itself"));
    setTimeout(() => {
      var _a;
      if (TG == null ? void 0 : TG.openLink) TG.openLink(REMIND2[to]);
      else if ((_a = window.WebApp) == null ? void 0 : _a.openLink) window.WebApp.openLink(REMIND2[to]);
      else location.href = REMIND2[to];
    }, 700);
  };
});
if (window.MAX_APP) dataReady.then(() => setTimeout(() => {
  var _a, _b, _c;
  let sp = "";
  try {
    sp = ((_b = (_a = window.WebApp) == null ? void 0 : _a.initDataUnsafe) == null ? void 0 : _b.start_param) || new URLSearchParams(((_c = window.WebApp) == null ? void 0 : _c.initData) || window.MAX_INIT || "").get("start_param") || "";
  } catch (e) {
  }
  if (!/(^|_)remind/.test(sp) || prefs.maxRemind || !board.online) return;
  try {
    if (sessionStorage.getItem("vdp-max-remind")) return;
  } catch (e) {
  }
  if (!(typeof registered === "function" && registered())) return;
  try {
    sessionStorage.setItem("vdp-max-remind", "1");
  } catch (e) {
  }
  msgRemindSet(true);
}, 3500));
