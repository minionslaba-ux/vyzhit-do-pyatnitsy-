/* сгенерировано tools/make-legacy.js из js/app.js — не править */
var _a, _b, _c, _d, _e, _f, _g;
applyStaticLang();
(async () => {
  const pack = new URLSearchParams(location.search).get("pack");
  if (pack && /^[a-z0-9_-]+$/i.test(pack)) {
    try {
      const r = await fetch("packs/".concat(pack, ".json"));
      if (r.ok) {
        PACK = await r.json();
        PACK_CARDS = (PACK.cards || []).filter((c) => DAYS.includes(c.day) && PHASES.some((p) => p.name === c.phase)).map((c) => ({ ...norm(c), id: "pack_" + c.id }));
        for (const c of PACK_CARDS) byId[c.id] = c;
        if (/^#[0-9a-f]{6}$/i.test(PACK.accent || "")) document.documentElement.style.setProperty("--magenta", PACK.accent);
        if (!views.menu.hidden) renderMenu();
      }
    } catch (e) {
    }
  }
  try {
    for (const s of await board.approved()) {
      const c = {
        id: "sug_" + s.id,
        who: s.who || L("Коллега", "Coworker"),
        text: s.text,
        author: s.author,
        random: true,
        answers: { left: { label: s.left_label, effects: s.left_effects || {} }, right: { label: s.right_label, effects: s.right_effects || {} } }
      };
      byId[c.id] = c;
      SUGGESTED.push(c);
    }
  } catch (e) {
  }
})();
async function finishLogin() {
  if (await finishSocial()) return true;
  const h = new URLSearchParams(location.hash.slice(1));
  const clean = () => history.replaceState(null, "", location.pathname + location.search);
  if (h.get("error")) {
    clean();
    toast(L("Вход не удался: ".concat(h.get("error_description") || h.get("error"), ". Отправьте ссылку ещё раз."), "Sign-in failed: ".concat(h.get("error_description") || h.get("error"), ". Please send the link again.")));
    return false;
  }
  const token = h.get("access_token");
  if (!token || !board.online) return false;
  clean();
  try {
    const user = await board.user(token);
    const exp = +h.get("expires_at") ? +h.get("expires_at") * 1e3 : Date.now() + (+h.get("expires_in") || 3600) * 1e3;
    await applySession({ access: token, refresh: h.get("refresh_token"), exp }, user, { via: "email" });
    return true;
  } catch (err) {
    toast(L("Вход не удался: ".concat(err.message), "Sign-in failed: ".concat(err.message)));
    return false;
  }
}
function loginWelcome() {
  var _a2;
  const fresh = prefs.loginWelcome === "new", via = prefs.loginVia && prefs.loginVia !== "email" ? viaName(prefs.loginVia) : "";
  delete prefs.loginWelcome;
  delete prefs.loginVia;
  store.set(KEY.prefs, prefs);
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass welcome-box" role="dialog" aria-modal="true" aria-labelledby="lwTitle">\n    <span class="lw-ico" aria-hidden="true">'.concat(fresh ? "🎉" : "👋", '</span>\n    <h2 id="lwTitle">').concat(fresh ? via ? L("Добро пожаловать в офис!", "Welcome to the office!") : L("Регистрация подтверждена!", "You’re all signed up!") : L("С возвращением, ".concat(esc(prefs.name), "!"), "Welcome back, ".concat(esc(prefs.name), "!")), "</h2>\n    <p>").concat(fresh && via ? L("Вы вошли через ".concat(via, ". Гостевой прогресс перенесён в аккаунт — входите через ").concat(via, " на любом устройстве."), "You signed in with ".concat(via, ". Your guest progress has moved to your account — sign in with ").concat(via, " on any device.")) : fresh ? L("Почта ".concat(esc(prefs.email), " подтверждена. Гостевой прогресс перенесён в аккаунт — теперь он с вами на любом устройстве."), "".concat(esc(prefs.email), " is confirmed. Your guest progress has moved to your account — now it follows you to any device.")) : L("Вход выполнен. Карьера, офис и коллеги на месте.", "You’re signed in. Your career, office and coworkers are right where you left them."), "</p>\n    ").concat(fresh ? '<ul class="lw-list"><li>'.concat(L("🏢 Создайте офис и позовите коллег", "🏢 Start an Office and invite your coworkers"), "</li><li>").concat(L("💬 Пишите в чат офиса", "💬 Chat with your Office"), "</li><li>").concat(L("🏆 Ваш отдел — в рейтинге", "🏆 Get your department on the leaderboard"), "</li></ul>") : "", '\n    <button class="btn-main" type="button" id="lwGo">').concat(fresh ? L("Начать игру", "Start playing") : L("Продолжить", "Continue"), "</button></div>");
  m.hidden = false;
  if (fresh) {
    (_a2 = sfx.win) == null ? void 0 : _a2.call(sfx);
    confetti();
  }
  $("lwGo").onclick = () => {
    m.hidden = true;
  };
}
async function joinFromLink() {
  const q = new URLSearchParams(location.search), code = q.get("join") || prefs.pendingJoin;
  if (q.get("join")) {
    prefs.pendingJoin = q.get("join");
    store.set(KEY.prefs, prefs);
    q.delete("join");
    history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
  }
  if (!code || !prefs.name || !board.online) return;
  if (!registered()) {
    toast(L("Чтобы вступить в офис по приглашению, зарегистрируйтесь — после входа вы окажетесь в нём сами", "To join an Office by invite, sign up — once you’re in, you’ll land there automatically"));
    return;
  }
  try {
    await board.touch("menu");
    const n = await board.rpc("join_team", { p_id: prefs.playerId, p_code: code });
    toast(L("Вы в офисе «".concat(n, "». Загляните в чат офиса!"), "You’re in the “".concat(n, "” Office. Say hi in the Office chat!")));
  } catch (err) {
    toast(err.message);
  }
  delete prefs.pendingJoin;
  store.set(KEY.prefs, prefs);
}
const origSubmit = $("joinForm").onsubmit;
$("joinForm").onsubmit = async (e) => {
  await origSubmit(e);
  if (prefs.name && !views.menu.hidden) joinFromLink();
};
if ("serviceWorker" in navigator && /^https?:/.test(location.protocol) && !window.POOL_JSON && !window.VDP_PLATFORM) {
  const hadSw = !!navigator.serviceWorker.controller;
  let swReloaded = false;
  let swPending = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadSw || swReloaded) return;
    if (!views.game.hidden) {
      swPending = true;
      return;
    }
    swReloaded = true;
    location.reload();
  });
  bus.on("menu", () => {
    if (swPending && !swReloaded) {
      swReloaded = true;
      location.reload();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) navigator.serviceWorker.getRegistration().then((r) => r == null ? void 0 : r.update()).catch(() => {
    });
  });
  navigator.serviceWorker.register("sw.js").then((r) => {
    var _a2;
    return (_a2 = r.update) == null ? void 0 : _a2.call(r);
  }).catch(() => {
  });
}
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent), isMobile = isIOS || isAndroid;
const goQ = location.search + "&" + location.hash.replace(/^#/, "&").replace(/brk-(\d)/, "brk=$1").replace(/(^|[&_])psy($|[&_])/, "$1psy=1$2");
let installEvt = null, tgGo = (goQ.match(/[?&_]brk=(\d{1,2})/) || [, ""])[1] ? "brk" + goQ.match(/[?&_]brk=(\d{1,2})/)[1] : /[?&_]psy=1/.test(goQ) ? "psy" : "";
{
  const b = location.search.match(/[?&]buy=(\d{1,3}|starter|coffee|shop)\b/);
  if (b) tgGo = "buy:" + b[1];
}
const canInstall = () => !standalone && !TG && !window.VDP_PLATFORM && !window.VK_MINI && !window.MAX_APP && !window.POOL_JSON && (installEvt || isMobile);
function installUi() {
  $("installApp").hidden = !canInstall();
  $("installCta").hidden = !canInstall() || Date.now() < (prefs.installSnooze || 0);
}
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvt = e;
  installUi();
  if (window.VDP_PLATFORM) document.querySelectorAll('a[href$="pravila.html"], a[href$="rules.html"]').forEach((a) => {
    a.hidden = true;
  });
});
addEventListener("appinstalled", () => {
  installEvt = null;
  prefs.installed = 1;
  store.set(KEY.prefs, prefs);
  $("installPop").hidden = true;
  installUi();
  toast(L("Игра установлена — ищите её на главном экране", "Game installed — find it on your home screen"));
});
async function doInstall() {
  $("installPop").hidden = true;
  track("install", { detail: installEvt ? "prompt" : isIOS ? "ios" : "manual" });
  if (installEvt) {
    installEvt.prompt();
    const r = await installEvt.userChoice.catch(() => null);
    if ((r == null ? void 0 : r.outcome) === "accepted") {
      prefs.installed = 1;
      store.set(KEY.prefs, prefs);
    }
    installEvt = null;
    installUi();
    return;
  }
  const m = $("modal");
  const steps = isIOS ? L(
    "1. Нажмите кнопку «Поделиться» внизу Safari (квадрат со стрелкой).<br>2. Выберите «На экран „Домой“».<br>3. Нажмите «Добавить».",
    "1. Tap the Share button at the bottom of Safari (the square with an arrow).<br>2. Choose “Add to Home Screen”.<br>3. Tap “Add”."
  ) : L(
    "1. Откройте меню браузера — три точки ⋮ справа вверху.<br>2. Выберите «Установить приложение» или «Добавить на главный экран».<br>3. Подтвердите — значок игры появится рядом с другими приложениями.",
    "1. Open the browser menu — the three dots ⋮ in the top right.<br>2. Choose “Install app” or “Add to Home screen”.<br>3. Confirm — the game icon will show up next to your other apps."
  );
  m.innerHTML = '<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="insTitle"><h2 id="insTitle">'.concat(L("На главный экран", "Add to home screen"), '</h2>\n    <p class="share-text">').concat(steps, "<br><br>").concat(L("Игра будет открываться как приложение: на весь экран и даже без интернета.", "The game will open like an app: full screen, even offline."), '</p>\n    <button class="btn-ghost" id="insClose">').concat(L("Понятно", "Got it"), "</button></div>");
  m.hidden = false;
  $("insClose").onclick = () => {
    m.hidden = true;
  };
}
$("installApp").onclick = doInstall;
$("installCtaGo").onclick = doInstall;
$("installCtaX").onclick = () => {
  prefs.installSnooze = Date.now() + 3 * 864e5;
  store.set(KEY.prefs, prefs);
  installUi();
};
function installNudge() {
  const n = prefs.gamesPlayed || 0;
  if (!canInstall() || prefs.installed || (prefs.installNo || 0) >= 3 || n < 2 || (n - 2) % 3 || Date.now() < (prefs.installNudgeAt || 0)) return;
  prefs.installNudgeAt = Date.now() + 2 * 864e5;
  store.set(KEY.prefs, prefs);
  setTimeout(() => {
    const el = $("installPop");
    if (!$("invitePop").hidden) return;
    el.hidden = false;
    FX.pulse(el, "on", 600);
  }, 2500);
}
$("installPopGo").onclick = doInstall;
$("installPopNo").onclick = () => {
  $("installPop").hidden = true;
  prefs.installNo = (prefs.installNo || 0) + 1;
  store.set(KEY.prefs, prefs);
};
installUi();
if (TG) {
  try {
    TG.ready();
    TG.expand();
    (_a = TG.setHeaderColor) == null ? void 0 : _a.call(TG, "#07070d");
    (_b = TG.setBackgroundColor) == null ? void 0 : _b.call(TG, "#07070d");
    if (/^(tdesktop|macos|weba|webk|unigram)$/.test(TG.platform) && ((_c = TG.isVersionAtLeast) == null ? void 0 : _c.call(TG, "8.0"))) {
      document.documentElement.classList.add("tgfs");
      (_d = TG.requestFullscreen) == null ? void 0 : _d.call(TG);
    }
    const sp = ((_e = TG.initDataUnsafe) == null ? void 0 : _e.start_param) || "";
    const ref = sp.match(/ref-([A-Z0-9]{6})/i), join = sp.match(/join-([A-Z0-9]{6})/i);
    if (ref && !prefs.refClaimed) prefs.refBy = ref[1].toUpperCase();
    if (join) prefs.pendingJoin = join[1].toUpperCase();
    const bonus = sp.match(/bonus-(\d{8})/);
    if (bonus) prefs.pendingBonus = bonus[1];
    const go = sp.match(/go-(daily|breaks|shop|feed|top|psy)/);
    if (go) tgGo = go[1];
    if (/(^|_)remind/.test(sp)) tgGo = "remind";
    const brk = sp.match(/brk-(\d{1,2})/);
    if (brk) tgGo = "brk" + brk[1];
    const ch = sp.match(/ch-(\d{8}[wl]\d{3}[pebc]\d{1,3})/);
    if (ch) rememberChallenge(ch[1], "", ref == null ? void 0 : ref[1]);
    store.set(KEY.prefs, prefs);
    const u = (_f = TG.initDataUnsafe) == null ? void 0 : _f.user;
    if (u && !prefs.name) $("joinName").value = [u.first_name, u.last_name].filter(Boolean).join(" ").slice(0, 24);
    (_g = TG.BackButton) == null ? void 0 : _g.onClick(() => {
      $("modal").hidden = true;
      renderMenu();
    });
    new MutationObserver(() => {
      var _a2, _b2;
      views.menu.hidden ? (_a2 = TG.BackButton) == null ? void 0 : _a2.show() : (_b2 = TG.BackButton) == null ? void 0 : _b2.hide();
    }).observe(views.menu, { attributes: true, attributeFilter: ["hidden"] });
  } catch (e) {
  }
}
dataReady.then(() => {
  if (!views.menu.hidden) renderMenu();
});
bus.on("menu", () => {
  if (!tgGo || !prefs.name) return;
  const g = tgGo;
  tgGo = "";
  track("tg_go", { detail: g });
  setTimeout(() => {
    try {
      if (g === "remind" && typeof remindTgOn === "function") remindTgOn();
      else if (g.startsWith("brk") && +g.slice(3)) playBreak(+g.slice(3));
      else if (g === "daily") startDaily();
      else if (g === "breaks") openBreaks();
      else if (g === "shop") openStore();
      else if (g === "feed") showFeed();
      else if (g === "psy") openPsy("link");
      else if (g.startsWith("buy:")) {
        const v = g.slice(4);
        +v ? openTopup({ need: Math.min(500, +v) }) : openStore();
      } else if (g === "top") openBoard("menu", "rating");
    } catch (e) {
    }
  }, 600);
});
finishLogin().then((reloading) => {
  var _a2, _b2, _c2;
  if (reloading) return;
  if (new URLSearchParams(location.search).has("stats") && board.online) return showStats();
  const tgUtm = (_b2 = (((_a2 = TG == null ? void 0 : TG.initDataUnsafe) == null ? void 0 : _a2.start_param) || "").match(/utm_([\w-]+)/)) == null ? void 0 : _b2[1];
  const utm = (new URLSearchParams(location.search).get("utm_source") || tgUtm || ((_c2 = window.VDP_PLATFORM) == null ? void 0 : _c2.name) || "").replace(/[^\w-]/g, "").slice(0, 20);
  track("open", { detail: (TG ? "telegram" : standalone ? "app" : "web") + (utm ? ":" + utm : "") });
  if (!sessionStorage.vdpBr) {
    try {
      sessionStorage.vdpBr = 1;
    } catch (e) {
    }
    track("browser", { detail: "".concat(window.BROWSER, ":").concat(isIOS ? "ios" : isAndroid ? "android" : "desktop", ":").concat(window.APP_VER) });
  }
  const scr = new URLSearchParams(location.search).get("screen");
  if (scr && board.online) return openScreen(scr);
  if (prefs.loggedOut) renderWelcome();
  else if (prefs.email && !prefs.name) renderJoin("profile", L("Вход выполнен. Осталось представиться коллегам.", "You’re signed in. Now just introduce yourself to your coworkers."));
  else if (prefs.name) renderMenu();
  else renderWelcome();
  if (prefs.loginWelcome && prefs.name) loginWelcome();
  setTimeout(checkDelete, prefs.loginWelcome ? 1500 : 300);
  if (!prefs.introSeen && !prefs.gamesPlayed) showIntro();
  joinFromLink();
  flushOutbox();
  pollSocial();
});
window.__errFlush = () => {
  var _a2;
  const list = (window.__errs || []).splice(0);
  for (const m of list) {
    const d = "".concat(window.BROWSER, ":").concat(window.APP_VER, " ").concat(m).slice(0, 200);
    try {
      (_a2 = window.ym) == null ? void 0 : _a2.call(window, 113961628, "reachGoal", "js_error", { detail: d });
    } catch (e) {
    }
    try {
      if (board.online && prefs.playerId) board.rpc("log_event", { p_id: prefs.playerId, p_kind: "js_error", p_mode: window.BROWSER, p_card: window.APP_VER, p_won: null, p_step: null, p_detail: m.slice(0, 60) }).catch(() => {
      });
    } catch (e) {
    }
  }
};
window.__errFlush();
(() => {
  var _a2, _b2;
  if ((_b2 = (_a2 = window.CSS) == null ? void 0 : _a2.supports) == null ? void 0 : _b2.call(_a2, "selector(:has(a))")) return;
  const H = document.documentElement;
  H.classList.add("nohas");
  const vis = (el) => !!el && !el.hidden;
  let raf = 0;
  const sync = () => {
    raf = 0;
    for (const [k, el] of Object.entries(views)) H.classList.toggle("v-" + k, vis(el));
    H.classList.toggle("m-modal", vis($("modal")));
    H.classList.toggle("m-prof", vis($("profSheet")));
    const g = $("game");
    if (g) {
      g.classList.toggle("live-on", vis(g.querySelector(".live-strip")));
      g.classList.toggle("dl-on", vis($("dlBar")));
    }
    document.querySelectorAll(".card").forEach((c) => c.classList.toggle("has-tools", !!c.querySelector(".card-tools")));
    document.querySelectorAll(".prof, .ava").forEach((l) => l.classList.toggle("sel", !!l.querySelector("input:checked")));
  };
  const later = () => {
    if (!raf) raf = requestAnimationFrame(sync);
  };
  new MutationObserver(later).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "class"] });
  document.addEventListener("change", later, true);
  sync();
})();
(() => {
  try {
    if (prefs.dept && MOD.bad(prefs.dept)) {
      prefs.dept = "";
      store.set(KEY.prefs, prefs);
    }
    if (prefs.profCustom && MOD.bad(prefs.profCustom)) {
      prefs.profCustom = "";
      store.set(KEY.prefs, prefs);
    }
    if (prefs.name && MOD.bad(prefs.name)) {
      prefs.name = "";
      store.set(KEY.prefs, prefs);
      setTimeout(() => {
        if (typeof renderJoin === "function" && views.game.hidden) renderJoin(prefs.email ? "profile" : "guest", L("Придумайте другое имя — прежнее не прошло модерацию. Его видят все игроки.", "Please pick another name — the previous one didn’t pass moderation. Everyone can see it."));
      }, 1500);
    }
  } catch (e) {
  }
})();
