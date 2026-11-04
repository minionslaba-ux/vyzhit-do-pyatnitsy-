/* сгенерировано tools/make-legacy.js из js/push.js — не править */
const PUSH_FN = () => {
  var _a;
  return (((_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.url) || "").replace(/\/+$/, "") + "/functions/v1/push-subscribe";
};
const pushIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
const pushStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushCan = () => {
  var _a, _b, _c, _d;
  if (window.VDP_PLATFORM || window.VK_MINI || window.MAX_APP || ((_b = (_a = window.Telegram) == null ? void 0 : _a.WebApp) == null ? void 0 : _b.initData) || !((_d = (_c = window.SUPABASE_CONFIG) == null ? void 0 : _c.push) == null ? void 0 : _d.pub)) return "";
  if (pushIOS && !pushStandalone()) return "ios";
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window ? "ok" : "";
};
const pushOn = () => pushCan() === "ok" && Notification.permission === "granted" && !!prefs.push;
const b64key = (s) => {
  const p = "=".repeat((4 - s.length % 4) % 4), raw = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
async function pushSave(sub) {
  await fetch(PUSH_FN(), {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: window.SUPABASE_CONFIG.anonKey },
    body: JSON.stringify({ action: "on", sub: sub.toJSON(), player_id: prefs.playerId || null, lang: EN ? "en" : "ru" })
  });
}
async function pushEnable() {
  var _a;
  if (pushCan() === "ios") return pushIosHelp();
  if (pushCan() !== "ok") return;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      prefs.pushAsked = "denied";
      store.set(KEY.prefs, prefs);
      pushRender();
      return toast(L("Напоминания выключены. Включить можно в настройках браузера.", "Reminders are off. You can turn them on in browser settings."));
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64key(window.SUPABASE_CONFIG.push.pub) });
    await pushSave(sub);
    prefs.push = true;
    prefs.pushAsked = "on";
    store.set(KEY.prefs, prefs);
    track("push_on");
    (_a = sfx.item) == null ? void 0 : _a.call(sfx);
    setTimeout(() => {
      pushStateLast = "";
      pushStateSend();
    }, 500);
    toast(L("🔔 Готово! Будем напоминать 1–3 раза в день", "🔔 Done! We’ll remind you 1–3 times a day"));
  } catch (e) {
    toast(L("Не получилось включить напоминания — попробуйте ещё раз", "Couldn’t turn on reminders — please try again"));
  }
  pushRender();
}
async function pushDisable() {
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (sub) {
      await fetch(PUSH_FN(), { method: "POST", headers: { "Content-Type": "application/json", apikey: window.SUPABASE_CONFIG.anonKey }, body: JSON.stringify({ action: "off", endpoint: sub.endpoint }) }).catch(() => {
      });
      await sub.unsubscribe();
    }
  } catch (e) {
  }
  prefs.push = false;
  store.set(KEY.prefs, prefs);
  track("push_off");
  toast(L("🔕 Напоминания выключены", "🔕 Reminders off"));
  pushRender();
}
function pushIosHelp() {
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="piTitle"><span class="lvl-ico" aria-hidden="true">🔔</span>\n    <h2 id="piTitle">'.concat(L("Напоминания на iPhone", "Reminders on iPhone"), "</h2>\n    <p>").concat(L("На iPhone уведомления работают, когда игра установлена на экран «Домой»:", "On iPhone, notifications work once the game is on your Home Screen:"), '</p>\n    <ol class="lw-list"><li>').concat(L("Нажмите «Поделиться» <b>⬆️</b> внизу Safari", "Tap Share <b>⬆️</b> at the bottom of Safari"), "</li><li>").concat(L("Выберите «На экран „Домой“»", "Choose “Add to Home Screen”"), "</li><li>").concat(L("Откройте игру со значка и нажмите «🔔 Напоминать мне играть»", "Open the game from the icon and tap “🔔 Remind me to play”"), '</li></ol>\n    <button class="btn-main" type="button" id="piOk">').concat(L("Понятно", "Got it"), "</button></div>");
  m.hidden = false;
  $("piOk").onclick = () => {
    m.hidden = true;
  };
}
const pushBtnHtml = (cls = "btn-ghost btn-push") => {
  const c = pushCan();
  if (!c) return "";
  if (c === "ok" && Notification.permission === "denied") return "";
  return pushOn() ? '<button type="button" class="'.concat(cls, '" data-push="off">🔕 ').concat(L("Выключить напоминания", "Turn off reminders"), "</button>") : '<button type="button" class="'.concat(cls, '" data-push="on">🔔 ').concat(L("Напоминать мне играть", "Remind me to play"), "</button>");
};
function pushRender() {
  const s = $("pushSlot");
  if (s) s.innerHTML = pushBtnHtml();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-push]");
  if (!b) return;
  b.dataset.push === "off" ? pushDisable() : pushEnable();
});
bus.on("weekEnd", (x) => {
  if (!x.won || prefs.pushAsked || pushOn() || pushCan() !== "ok") return;
  setTimeout(() => {
    const st = views.end.querySelector(".end-sheet .stack");
    if (!st || views.end.hidden || st.querySelector("[data-push]")) return;
    prefs.pushAsked = "shown";
    store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML("afterbegin", pushBtnHtml("btn-main btn-push"));
  }, 1500);
});
setTimeout(async () => {
  pushRender();
  if (!pushOn()) return;
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (sub) await pushSave(sub);
    else {
      prefs.push = false;
      store.set(KEY.prefs, prefs);
      pushRender();
    }
  } catch (e) {
  }
}, 3e3);
const lc = (s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : "";
function pushStateNow() {
  var _a, _b;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!C2) return null;
  const n = (h == null ? void 0 : h.pending) && typeof NEEDS !== "undefined" && NEEDS.find((x) => x.id === h.pending);
  const pets = (h == null ? void 0 : h.pets) || [], hungry = pets.find((p) => {
    var _a2;
    return ((_a2 = p.last) == null ? void 0 : _a2.p_food) !== C2.week;
  }), pet = hungry || pets[0];
  const kids = (h == null ? void 0 : h.kids) || [], kidW = kids.map((k) => ({ k, w: typeof kidWants === "function" ? kidWants(k)[0] : null })).find((x) => x.w);
  return {
    hero: (h == null ? void 0 : h.name) || "",
    g: h && heroFem(h) ? "f" : "m",
    need: n ? lc(needText(n, h, "t")) : "",
    mood: (_a = h == null ? void 0 : h.mood) != null ? _a : null,
    breaks: (h == null ? void 0 : h.breaks) || 0,
    pet: (pet == null ? void 0 : pet.name) || "",
    petHungry: !!hungry,
    kid: (kidW == null ? void 0 : kidW.k.name) || ((_b = kids[0]) == null ? void 0 : _b.name) || "",
    kidWant: kidW ? lc(kidW.w.t) : "",
    week: Math.min(C2.week, YEAR),
    company: C2.stage === "work" ? C2.company : "",
    bank: C2.bank,
    certReady: typeof certCan === "function" && certCan(C2),
    streak: Math.max(typeof dayStreakNow === "function" ? dayStreakNow() : 0, typeof streakNow === "function" ? streakNow() : 0),
    // серия входов (js/streak.js) или недели дня
    lastPlay: new Date(typeof retSessionAt !== "undefined" ? retSessionAt : Date.now()).toISOString()
    // когда игрок последний раз открыл игру (js/retention.js): push-send чаще пишет «скучает», если его нет сутки и больше
  };
}
let pushStateLast = "";
async function pushStateSend() {
  if (!pushOn()) return;
  const st = pushStateNow();
  if (!st) return;
  const key = JSON.stringify(st);
  if (key === pushStateLast) return;
  pushStateLast = key;
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (!sub) return;
    await fetch(PUSH_FN(), { method: "POST", headers: { "Content-Type": "application/json", apikey: window.SUPABASE_CONFIG.anonKey }, body: JSON.stringify({ action: "state", endpoint: sub.endpoint, state: st }) });
  } catch (e) {
  }
}
bus.on("menu", () => setTimeout(pushStateSend, 1500));
bus.on("weekEnd", () => setTimeout(pushStateSend, 4e3));
(() => {
  const q = new URLSearchParams(location.search), open = q.get("open");
  if (!open) return;
  q.delete("open");
  history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
  if (open === "dm") setTimeout(() => {
    if (typeof showDmInbox === "function" && views.game.hidden) showDmInbox();
  }, 2500);
})();
const PUSH_ASK_GAP = 3 * 864e5;
function pushAskOnEntry() {
  var _a;
  if (pushOn() || prefs.pushNever || !(prefs.gamesPlayed >= 1) || !prefs.name) return;
  if (pushCan() !== "ok" || Notification.permission !== "default") return;
  if (Date.now() - (prefs.pushAskAt || 0) < PUSH_ASK_GAP || views.menu.hidden || !$("modal").hidden) return;
  prefs.pushAskAt = Date.now();
  store.set(KEY.prefs, prefs);
  const h = (_a = careerNow()) == null ? void 0 : _a.hero, m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="paTitle2"><span class="lvl-ico" aria-hidden="true">🔔</span>\n    <h2 id="paTitle2">'.concat(L("Включить напоминания?", "Turn on reminders?"), "</h2>\n    <p>").concat(h ? L("Подскажем, когда ".concat(esc(h.name), " чего-то захочет, питомцы проголодаются, придёт сообщение от коллеги или бонус +15 у.е. — 1–3 раза в день, не чаще."), "We’ll let you know when ".concat(esc(h.name), " wants something, pets get hungry, a coworker messages you or a +$15 bonus arrives — 1–3 times a day, no more.")) : L("Напомним о бонусах +15 у.е., сообщениях от коллег и «Неделе дня» — 1–3 раза в день, не чаще.", "We’ll remind you about +$15 bonuses, messages from coworkers and the Daily Week — 1–3 times a day, no more."), '</p>\n    <button class="btn-main" type="button" id="paYes">🔔 ').concat(L("Включить", "Turn on"), '</button>\n    <button class="btn-ghost" type="button" id="paLater">').concat(L("Позже", "Later"), '</button>\n    <button class="btn-link" type="button" id="paNever">').concat(L("Не спрашивать", "Don’t ask again"), "</button></div>");
  m.hidden = false;
  track("push_ask");
  $("paYes").onclick = () => {
    m.hidden = true;
    pushEnable();
  };
  $("paLater").onclick = () => {
    m.hidden = true;
  };
  $("paNever").onclick = () => {
    m.hidden = true;
    prefs.pushNever = true;
    store.set(KEY.prefs, prefs);
  };
}
setTimeout(pushAskOnEntry, 6e3);
