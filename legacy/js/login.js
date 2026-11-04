/* сгенерировано tools/make-legacy.js из js/login.js — не править */
var _a, _b, _c, _d;
const SOC_FN = () => {
  var _a2;
  return (((_a2 = window.SUPABASE_CONFIG) == null ? void 0 : _a2.url) || "").replace(/\/+$/, "") + "/functions/v1/";
};
const VK_APP = window.VK_MINI ? "" : String(((_b = (_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.vk) == null ? void 0 : _b.app) || "");
const TG_BOT_ID = ((_d = (_c = window.SUPABASE_CONFIG) == null ? void 0 : _c.telegram) == null ? void 0 : _d.botId) || 0;
async function fnPost(name, body) {
  var _a2;
  const r = await fetch(SOC_FN() + name, { method: "POST", headers: { "Content-Type": "application/json", apikey: ((_a2 = window.SUPABASE_CONFIG) == null ? void 0 : _a2.anonKey) || "" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || String(r.status)), { code: j.error, why: j.why });
  return j;
}
const socialVia = () => {
  var _a2;
  return ((_a2 = (prefs.email || "").match(/@(tg|vk|max)\.survivefriday\.com$/)) == null ? void 0 : _a2[1]) || "";
};
const viaName = (v) => v === "vk" ? "VK" : v === "max" ? "MAX" : "Telegram";
const acctLabel = () => socialVia() ? viaName(socialVia()) + (prefs.acctName ? " · " + prefs.acctName : "") : prefs.email || "";
const hasTg = () => socialVia() === "tg" || !!prefs.tgLinked;
async function applySession(s, user, extra = {}) {
  if (prefs.playerId !== user.id) {
    if (prefs.name) await board.rpc("merge_player", { p_from: prefs.playerId, p_to: user.id }, s.access).catch(() => {
    });
    prefs.playerId = user.id;
  }
  prefs.email = user.email;
  delete prefs.pendingEmail;
  delete prefs.loggedOut;
  if (extra.name) prefs.acctName = extra.name;
  if (extra.via === "tg") prefs.tgLinked = true;
  if (extra.via === "vk") prefs.vkLinked = true;
  prefs.loginVia = extra.via || "email";
  prefs.loginWelcome = Date.now() - new Date(user.created_at) < 30 * 6e4 ? "new" : "back";
  prefs.session = s;
  const prof = (await board.rpc("get_profile", { p_id: user.id }).catch(() => []))[0];
  if (prof && !prefs.name) Object.assign(prefs, { name: prof.name, dept: prof.dept, avatar: prof.avatar || prefs.avatar });
  if (!prefs.name && extra.name) prefs.suggestName = extra.name;
  store.set(KEY.prefs, prefs);
  location.reload();
}
const sessOf = (j) => ({ access: j.access_token, refresh: j.refresh_token, exp: j.expires_at ? j.expires_at * 1e3 : Date.now() + 36e5 });
function socialError(err, via) {
  const n = viaName(via);
  return {
    linked_elsewhere: L("Этот ".concat(n, " уже привязан к другому аккаунту игры. Выйдите и войдите через ").concat(n, "."), "This ".concat(n, " account is linked to another game account. Log out and sign in with ").concat(n, ".")),
    already_linked: L("К этому аккаунту уже привязан другой профиль ".concat(n, "."), "That account already has a different ".concat(n, " profile linked.")),
    bad_signature: L("Telegram не подтвердил вход — попробуйте ещё раз.", "Telegram didn’t confirm the sign-in — please try again."),
    vk_failed: L("VK не подтвердил вход — попробуйте ещё раз.", "VK didn’t confirm the sign-in — please try again."),
    not_configured: L("Вход через Telegram ещё настраивается.", "Telegram sign-in isn’t set up yet."),
    bad_code: L("Код не подошёл: он неверный, уже использован или прошло больше 10 минут. Получите новый.", "That code didn’t work: it’s wrong, already used or older than 10 minutes. Get a new one."),
    too_often: L("Слишком много кодов за час — попробуйте позже.", "Too many codes this hour — try again later.")
  }[err.code] || L("Вход не удался: ".concat(err.message), "Sign-in failed: ".concat(err.message));
}
async function socialDone(j, via) {
  if (j.linked) {
    if (via === "tg") prefs.tgLinked = true;
    else if (via === "max") prefs.maxLinked = true;
    else prefs.vkLinked = true;
    store.set(KEY.prefs, prefs);
    toast(L("✅ ".concat(viaName(via), " привязан: теперь можно входить и через него"), "✅ ".concat(viaName(via), " linked: you can now sign in with it too")));
    if (typeof renderMenu === "function" && prefs.name) renderMenu();
    return false;
  }
  await applySession(sessOf(j), j.user, { name: j.name, via });
  return true;
}
const linkToken = async () => typeof registered === "function" && registered() ? await board.accessToken() : void 0;
async function tgLogin(after) {
  try {
    if (TG) return await socialDone(await fnPost("tg-login", { initData: TG.initData, access_token: after === "delete" ? void 0 : await linkToken() }), "tg");
    if (!TG_BOT_ID) return toast(L("Вход через Telegram ещё настраивается.", "Telegram sign-in isn’t set up yet."));
    sessionStorage.setItem("vdp-social", JSON.stringify({ via: "tg", after }));
    const back = location.origin + location.pathname;
    location.href = "https://oauth.telegram.org/auth?bot_id=".concat(TG_BOT_ID, "&origin=").concat(encodeURIComponent(location.origin), "&request_access=write&return_to=").concat(encodeURIComponent(back));
  } catch (err) {
    toast(socialError(err, "tg"));
  }
}
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const randStr = (n) => b64url(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);
async function vkLogin(after) {
  if (window.VK_MINI) {
    try {
      const info = await vkBridge("VKWebAppGetUserInfo"), name = [info == null ? void 0 : info.first_name, info == null ? void 0 : info.last_name].filter(Boolean).join(" ");
      return await socialDone(await fnPost("tg-login", { vk_launch: { params: location.search, name }, access_token: after === "delete" ? void 0 : await linkToken() }), "vk");
    } catch (err) {
      return toast(socialError(err, "vk"));
    }
  }
  if (!VK_APP) return;
  const verifier = randStr(64), state = randStr(24);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  sessionStorage.setItem("vdp-social", JSON.stringify({ via: "vk", verifier, state, after }));
  location.href = "https://id.vk.com/authorize?" + new URLSearchParams({
    response_type: "code",
    client_id: VK_APP,
    redirect_uri: location.origin + location.pathname,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    scope: "vkid.personal_info"
  });
}
async function finishSocial() {
  let st = null;
  try {
    st = JSON.parse(sessionStorage.getItem("vdp-social") || "null");
  } catch (e) {
  }
  const h = location.hash, q = new URLSearchParams(location.search), vk = new URLSearchParams(location.search);
  const tgRes = h.match(/tgAuthResult=([^&]*)/), vkCode = vk.get("code") && vk.get("state") && (st == null ? void 0 : st.via) === "vk";
  if (!tgRes && !vkCode) return false;
  sessionStorage.removeItem("vdp-social");
  if (vkCode) {
    for (const k of ["code", "state", "device_id", "expires_in", "type", "ext_id", "payload"]) q.delete(k);
  }
  history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
  if (st == null ? void 0 : st.after) sessionStorage.setItem("vdp-after", st.after);
  try {
    if (tgRes) {
      if (!tgRes[1] || tgRes[1] === "false") return false;
      const raw = tgRes[1].replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(raw + "=".repeat((4 - raw.length % 4) % 4)), (c) => c.charCodeAt(0));
      const tgAuth = JSON.parse(new TextDecoder().decode(bytes));
      return await socialDone(await fnPost("tg-login", { tgAuth, access_token: (st == null ? void 0 : st.after) === "delete" ? void 0 : await linkToken() }), "tg");
    }
    if (vk.get("state") !== st.state) {
      toast(L("Вход через VK не удался — попробуйте ещё раз.", "VK sign-in failed — please try again."));
      return false;
    }
    return await socialDone(await fnPost("tg-login", { vk: {
      code: vk.get("code"),
      code_verifier: st.verifier,
      device_id: vk.get("device_id") || "",
      state: st.state,
      redirect_uri: location.origin + location.pathname,
      client_id: VK_APP
    }, access_token: st.after === "delete" ? void 0 : await linkToken() }), "vk");
  } catch (err) {
    toast(socialError(err, tgRes ? "tg" : "vk"));
    return false;
  }
}
function socialButtons(box) {
  var _a2, _b2;
  if (!box) return;
  const on = board.online && !window.VDP_PLATFORM && !window.VK_MINI;
  box.hidden = !on;
  if (!on) return;
  box.innerHTML = '<button class="btn-main btn-tg" type="button">✈️ '.concat(L("Войти через Telegram", "Sign in with Telegram"), "</button>") + (VK_APP ? '<button class="btn-main btn-vk" type="button">VK '.concat(L("Войти через VK ID", "Sign in with VK ID"), "</button>") : "") + (!EN && !TG && !window.MAX_APP ? '<a class="btn-main btn-max btn-maxlogin" href="https://max.ru/se14877440_bot?startapp=login" target="_blank" rel="noopener"><img src="icons/max.png" alt="" width="22" height="22"> '.concat(L("Войти через MAX", "Sign in with MAX"), "</a>") + '<span class="maxlogin-note">'.concat(L("Игра откроется в MAX, вход — автоматически", "The game opens in MAX and signs you in"), "</span>") : "") + '<button class="btn-link btn-codein" type="button" data-codein>🔑 '.concat(L("У меня уже есть аккаунт — войти по коду", "I already have an account — sign in with a code"), "</button>") + '<span class="or-line">'.concat(L("или по почте", "or with email"), "</span>");
  (_a2 = box.querySelector(".btn-maxlogin")) == null ? void 0 : _a2.addEventListener("click", () => track("max_login_site"));
  box.querySelector(".btn-tg").onclick = () => tgLogin();
  (_b2 = box.querySelector(".btn-vk")) == null ? void 0 : _b2.addEventListener("click", () => vkLogin());
}
function renderAcctBox() {
  const box = $("acctBox");
  if (!box) return;
  const reg = typeof registered === "function" && registered();
  box.hidden = !reg || !!window.VDP_PLATFORM;
  if (box.hidden) return;
  const btns = [];
  if (!socialVia()) btns.push('<button class="btn-ghost" type="button" data-a="pass">🔑 '.concat(prefs.hasPass ? L("Сменить пароль", "Change password") : L("Задать пароль для входа", "Set a sign-in password"), "</button>"));
  if (EN && !hasTg()) btns.push('<button class="btn-ghost" type="button" data-a="tg">✈️ '.concat(L("Привязать Telegram", "Link Telegram"), "</button>"));
  if (EN && VK_APP && !(socialVia() === "vk" || prefs.vkLinked)) btns.push('<button class="btn-ghost" type="button" data-a="vk">VK '.concat(L("Привязать VK", "Link VK"), "</button>"));
  if (!window.VK_MINI && !EN) {
    const go = [];
    if (!TG) go.push(["tg", "✈️", "Telegram"]);
    if (!window.MAX_APP) go.push(["max", "💬", "MAX"]);
    go.push(["vk", "🟦", L("ВКонтакте", "VK")]);
    for (const [k, ico, n] of go) btns.push('<button class="btn-ghost" type="button" data-a="go-'.concat(k, '">').concat(ico, " ").concat(L("Продолжить в ".concat(n), "Continue in ".concat(n)), "</button>"));
  }
  btns.push('<span class="acct-links">'.concat(window.VK_MINI ? "" : '<button class="btn-link" type="button" data-a="codeout">'.concat(L("Код для другого устройства", "Code for another device"), "</button>"), '<button class="btn-link" type="button" data-codein>').concat(L("Уже играли в другом месте? Войти по коду", "Played somewhere else? Sign in with a code"), "</button></span>"));
  box.innerHTML = btns.join("");
  box.hidden = !btns.length;
  box.onclick = (e) => {
    var _a2;
    const a = (_a2 = e.target.closest("[data-a]")) == null ? void 0 : _a2.dataset.a;
    if (a === "pass") passModal();
    if (a === "tg") tgLogin();
    if (a === "vk") vkLogin();
    if (a === "codeout") codeOut();
    if (a == null ? void 0 : a.startsWith("go-")) continueIn(a.slice(3));
  };
}
async function codeOut() {
  try {
    const j = await fnPost("tg-login", { action: "link_code", access_token: await board.accessToken() });
    const c = String(j.code || ""), m = $("modal");
    m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="coTitle"><span class="lvl-ico" aria-hidden="true">📲</span>\n      <h2 id="coTitle">'.concat(L("Код для входа", "Sign-in code"), '</h2>\n      <p class="code-big" aria-label="').concat(esc(c), '">').concat(esc(c.slice(0, 4)), "-").concat(esc(c.slice(4)), "</p>\n      <p>").concat(L("Откройте игру на другом устройстве или в другом приложении → профиль → «У меня есть другой аккаунт — войти по коду» и введите код. Действует 10 минут, один раз. Карьера и покупки подтянутся из этого аккаунта.", "Open the game on another device or app → profile → “I have another account — sign in with a code” and enter it. Valid for 10 minutes, once. Your career and purchases will come from this account."), '</p>\n      <button class="btn-ghost" type="button" id="coOk">').concat(L("Готово", "Done"), "</button></div>");
    m.hidden = false;
    $("coOk").onclick = () => {
      m.hidden = true;
    };
    track("code_out");
  } catch (err) {
    toast(socialError(err, "tg"));
  }
}
function codeIn() {
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="ciTitle"><span class="lvl-ico" aria-hidden="true">🔑</span>\n    <h2 id="ciTitle">'.concat(L("Войти по коду", "Sign in with a code"), "</h2>\n    <p>").concat(L("Возьмите код в игре там, где у вас основной аккаунт: профиль → «Войти в этот аккаунт на другом устройстве». После входа здесь будет та же карьера, у.е. и покупки, а дальше вход — автоматически.", "Get the code where your main account is: profile → “Sign in to this account on another device”. After that you’ll have the same career, $ and purchases here, and future sign-ins are automatic."), '</p>\n    <form id="ciForm"><input id="ciCode" class="code-in" maxlength="9" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX" aria-label="').concat(L("Код", "Code"), '">\n    <p class="join-err" id="ciErr" role="alert"></p>\n    <button class="btn-main" type="submit" id="ciGo">').concat(L("Войти", "Sign in"), '</button></form>\n    <button class="btn-ghost" type="button" id="ciNo">').concat(L("Отмена", "Cancel"), "</button></div>");
  m.hidden = false;
  $("ciCode").focus();
  $("ciNo").onclick = () => {
    m.hidden = true;
  };
  $("ciForm").onsubmit = async (e) => {
    e.preventDefault();
    const code = $("ciCode").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 8) {
      $("ciErr").textContent = L("В коде 8 символов", "The code has 8 characters");
      return;
    }
    $("ciGo").disabled = true;
    try {
      await codeLogin(code, "typed");
    } catch (err) {
      $("ciGo").disabled = false;
      $("ciErr").textContent = socialError(err, "tg");
    }
  };
}
async function codeLogin(code, how) {
  var _a2, _b2;
  let proof = {}, via = "";
  if (TG == null ? void 0 : TG.initData) {
    proof = { initData: TG.initData };
    via = "tg";
  } else if (window.VK_MINI) {
    const info = await vkBridge("VKWebAppGetUserInfo");
    proof = { vk_launch: { params: location.search, name: [info == null ? void 0 : info.first_name, info == null ? void 0 : info.last_name].filter(Boolean).join(" ") } };
    via = "vk";
  } else if (window.MAX_APP && (((_a2 = window.WebApp) == null ? void 0 : _a2.initData) || window.MAX_INIT)) {
    proof = { max_init: ((_b2 = window.WebApp) == null ? void 0 : _b2.initData) || window.MAX_INIT };
    via = "max";
  }
  const j = await fnPost("tg-login", { ...proof, code });
  track("code_in", { detail: "".concat(via || "site", ":").concat(how) });
  delete prefs.cloudAt;
  await applySession(sessOf(j), j.user, { name: j.name, via: via || void 0 });
}
const GO_LINK = { tg: (c) => "https://t.me/Survivefridaybot?startapp=code-".concat(c), max: (c) => "https://max.ru/se14877440_bot?startapp=code-".concat(c), vk: (c) => "https://vk.com/app54871699#code-".concat(c) };
async function continueIn(where) {
  try {
    const j = await fnPost("tg-login", { action: "link_code", access_token: await board.accessToken() });
    const url = GO_LINK[where](j.code);
    track("code_go", { detail: where });
    toast(L("Открываем игру — вход в ваш аккаунт произойдёт сам", "Opening the game — you’ll be signed in automatically"));
    setTimeout(() => {
      var _a2;
      if ((TG == null ? void 0 : TG.openTelegramLink) && where === "tg") TG.openTelegramLink(url);
      else if (TG == null ? void 0 : TG.openLink) TG.openLink(url);
      else if (window.MAX_APP && ((_a2 = window.WebApp) == null ? void 0 : _a2.openLink)) window.WebApp.openLink(url);
      else window.open(url, "_blank", "noopener") || (location.href = url);
    }, 600);
  } catch (err) {
    toast(socialError(err, "tg"));
  }
}
function startCode() {
  var _a2, _b2, _c2, _d2;
  try {
    const sp = ((_a2 = TG == null ? void 0 : TG.initDataUnsafe) == null ? void 0 : _a2.start_param) || ((_c2 = (_b2 = window.WebApp) == null ? void 0 : _b2.initDataUnsafe) == null ? void 0 : _c2.start_param) || new URLSearchParams(((_d2 = window.WebApp) == null ? void 0 : _d2.initData) || window.MAX_INIT || "").get("start_param") || "";
    const m = (sp + " " + location.hash + " " + location.search).match(/code[-=]([A-Z0-9]{8})/i);
    return m ? m[1].toUpperCase() : "";
  } catch (e) {
    return "";
  }
}
window.vdpStartCode = startCode;
dataReady.then(() => setTimeout(async () => {
  const c = startCode();
  if (!c || !board.online) return;
  try {
    if (sessionStorage.getItem("vdp-code-used") === c) return;
    sessionStorage.setItem("vdp-code-used", c);
  } catch (e) {
  }
  toast(L("🔑 Входим в ваш аккаунт…", "🔑 Signing you in…"));
  try {
    await codeLogin(c, "link");
  } catch (err) {
    toast(socialError(err, "tg"));
  }
}, 1300));
bus.on("menu", () => {
  const p = document.querySelector("#menu .play2");
  if (!p || document.getElementById("codeHint")) return;
  if (!(TG || window.VK_MINI || window.MAX_APP) || (prefs.gamesPlayed || 0) >= 3 || EN || !board.online) return;
  p.insertAdjacentHTML("afterend", '<button class="btn-link btn-codein" id="codeHint" type="button" data-codein>🔑 '.concat(L("Уже играли в другом месте? Войти по коду", "Played somewhere else? Sign in with a code"), "</button>"));
});
document.addEventListener("click", (e) => {
  var _a2, _b2;
  if ((_b2 = (_a2 = e.target).closest) == null ? void 0 : _b2.call(_a2, "[data-codein]")) codeIn();
});
async function pwLeaked(pw) {
  try {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw));
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 4e3);
    const r = await fetch("https://api.pwnedpasswords.com/range/".concat(hex.slice(0, 5)), { headers: { "Add-Padding": "true" }, signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return false;
    const tail = hex.slice(5);
    return (await r.text()).split("\n").some((l) => {
      const [h, n] = l.trim().split(":");
      return h === tail && +n > 0;
    });
  } catch (e) {
    return false;
  }
}
function passModal() {
  const m = $("modal");
  m.innerHTML = '<form class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="pwTitle" id="pwForm"><span class="lvl-ico" aria-hidden="true">🔑</span>\n    <h2 id="pwTitle">'.concat(L("Пароль для входа", "Sign-in password"), "</h2>\n    <p>").concat(L("Входите почтой <b>".concat(esc(prefs.email), "</b> и паролем — без письма. Ссылка из письма тоже продолжит работать."), "Sign in with <b>".concat(esc(prefs.email), "</b> and a password — no email needed. Email links keep working too.")), '</p>\n    <div class="field"><input id="pwNew" type="password" minlength="6" maxlength="72" autocomplete="new-password" placeholder="').concat(L("Новый пароль, от 6 символов", "New password, 6+ characters"), '"></div>\n    <p class="join-err" id="pwErr" role="alert"></p>\n    <button class="btn-main" type="submit">').concat(L("Сохранить пароль", "Save password"), '</button>\n    <button class="btn-ghost" type="button" id="pwClose">').concat(L("Отмена", "Cancel"), "</button></form>");
  m.hidden = false;
  $("pwNew").focus();
  $("pwClose").onclick = () => {
    m.hidden = true;
  };
  $("pwForm").onsubmit = async (e) => {
    e.preventDefault();
    const pw = $("pwNew").value;
    if (pw.length < 6) {
      $("pwErr").textContent = L("Нужно хотя бы 6 символов.", "Use at least 6 characters.");
      return;
    }
    if (await pwLeaked(pw)) {
      $("pwErr").textContent = L("Этот пароль уже встречался в утечках данных в интернете — придумайте другой.", "This password has appeared in data breaches — please choose another one.");
      return;
    }
    try {
      await board.setPassword(pw);
      prefs.hasPass = true;
      store.set(KEY.prefs, prefs);
      m.hidden = true;
      toast(L("🔑 Пароль сохранён", "🔑 Password saved"));
      renderAcctBox();
    } catch (err) {
      $("pwErr").textContent = L("Не получилось: ".concat(err.message), "Didn’t work: ".concat(err.message));
    }
  };
}
async function delCall(action) {
  return fnPost("account-delete", { action, access_token: await board.accessToken(), redirect: location.origin + location.pathname });
}
function delModal(html) {
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="delTitle"><span class="lvl-ico" aria-hidden="true">🗑️</span>'.concat(html, "</div>");
  m.hidden = false;
  return m;
}
function askDelete() {
  const via = socialVia(), n = via ? viaName(via) : "";
  const m = delModal('<h2 id="delTitle">'.concat(L("Удалить аккаунт?", "Delete your account?"), "</h2>\n    <p>").concat(L(
    "Удалятся аккаунт, профиль и рабочий стол, результаты в рейтингах, сообщения, участие в офисах (свой офис перейдёт самому давнему коллеге), привязки Telegram и VK, напоминания. Прогресс на этом устройстве тоже сотрётся. <b>Восстановить будет нельзя.</b>",
    "This deletes your account, profile and desk, leaderboard results, messages, Office memberships (your own Office goes to its longest-serving member), Telegram and VK links and reminders. Progress on this device is wiped too. <b>This can’t be undone.</b>"
  ), "</p>\n    <p>").concat(via ? L("Для подтверждения войдите ещё раз через ".concat(n, "."), "To confirm, sign in with ".concat(n, " once more.")) : L("Для подтверждения пришлём письмо на <b>".concat(esc(prefs.email), "</b>. Откройте ссылку из письма на этом устройстве — игра попросит окончательно подтвердить удаление."), "To confirm, we’ll email <b>".concat(esc(prefs.email), "</b>. Open the link from that email on this device and the game will ask you to confirm the deletion.")), '</p>\n    <p class="join-err" id="delErr" role="alert"></p>\n    <button class="btn-main btn-del" type="button" id="delGo">').concat(via ? L("Подтвердить через ".concat(n), "Confirm with ".concat(n)) : L("Отправить письмо", "Send the email"), '</button>\n    <button class="btn-ghost" type="button" id="delNo">').concat(L("Отмена", "Cancel"), "</button>"));
  $("delNo").onclick = () => {
    m.hidden = true;
  };
  $("delGo").onclick = async () => {
    var _a2;
    $("delGo").disabled = true;
    try {
      await delCall("request");
      if (via === "tg") return tgLogin("delete");
      if (via === "vk") return vkLogin("delete");
      if (via === "max") {
        const d = ((_a2 = window.WebApp) == null ? void 0 : _a2.initData) || window.MAX_INIT || "";
        if (!d) {
          $("modal").hidden = true;
          return toast(L("Откройте игру в MAX, чтобы подтвердить удаление", "Open the game in MAX to confirm the deletion"));
        }
        return await socialDone(await fnPost("tg-login", { max_init: d }), "max");
      }
      delModal('<h2 id="delTitle">'.concat(L("Проверьте почту", "Check your email"), "</h2>\n        <p>").concat(L("Письмо отправлено на <b>".concat(esc(prefs.email), "</b>. Это письмо со ссылкой для входа: откройте её — и игра попросит окончательно подтвердить удаление. Запрос действует сутки."), "We emailed <b>".concat(esc(prefs.email), "</b>. It’s a sign-in link: open it and the game will ask you to confirm the deletion. The request is valid for 24 hours.")), '</p>\n        <button class="btn-ghost" type="button" id="delOk">').concat(L("Понятно", "Got it"), "</button>"));
      $("delOk").onclick = () => {
        $("modal").hidden = true;
      };
    } catch (err) {
      $("delErr").textContent = err.code === "too_often" ? L("Письмо уже отправлено — подождите минуту и попробуйте снова.", "An email was just sent — wait a minute and try again.") : L("Не получилось: ".concat(err.message), "Didn’t work: ".concat(err.message));
      $("delGo").disabled = false;
    }
  };
}
function wipeDevice() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("vdp-") && k !== "vdp-lang") localStorage.removeItem(k);
    localStorage.setItem(KEY.prefs, JSON.stringify({ introSeen: 1, accountDeleted: 1 }));
  } catch (e) {
  }
  location.reload();
}
async function checkDelete() {
  if (prefs.accountDeleted) {
    delete prefs.accountDeleted;
    store.set(KEY.prefs, prefs);
    toast(L("Аккаунт удалён. Спасибо, что играли!", "Account deleted. Thanks for playing!"));
    return;
  }
  if (!(typeof registered === "function" && registered()) || !board.online || window.VDP_PLATFORM) return;
  let st;
  try {
    st = await delCall("status");
  } catch (e) {
    return;
  }
  if (!st.pending || !st.fresh) return;
  const m = delModal('<h2 id="delTitle">'.concat(L("Удалить аккаунт навсегда?", "Delete your account for good?"), "</h2>\n    <p>").concat(L("Вход подтверждён. Аккаунт <b>".concat(esc(acctLabel()), "</b> и все его данные будут удалены без возможности восстановления."), "Sign-in confirmed. The account <b>".concat(esc(acctLabel()), "</b> and all its data will be deleted permanently.")), '</p>\n    <p class="join-err" id="delErr" role="alert"></p>\n    <button class="btn-main btn-del" type="button" id="delYes">').concat(L("Удалить навсегда", "Delete for good"), '</button>\n    <button class="btn-ghost" type="button" id="delNo">').concat(L("Не удалять", "Keep my account"), "</button>"));
  $("delNo").onclick = async () => {
    m.hidden = true;
    await delCall("cancel").catch(() => {
    });
    toast(L("Удаление отменено", "Deletion cancelled"));
  };
  $("delYes").onclick = async () => {
    $("delYes").disabled = true;
    try {
      await delCall("delete");
      wipeDevice();
    } catch (err) {
      $("delErr").textContent = err.code === "not_confirmed" ? L("Подтверждение устарело — запросите удаление ещё раз.", "The confirmation expired — request deletion again.") : L("Не получилось: ".concat(err.message), "Didn’t work: ".concat(err.message));
      $("delYes").disabled = false;
    }
  };
}
$("delAcct").onclick = askDelete;
