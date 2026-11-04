/* сгенерировано tools/make-legacy.js из js/vk-mini.js — не править */
(() => {
  if (!window.VK_MINI) return;
  const q = new URLSearchParams(location.search);
  window.VK_APP_ID = q.get("vk_app_id") || (() => {
    try {
      return sessionStorage.getItem("vdp-vk-app") || "";
    } catch (e) {
      return "";
    }
  })();
  try {
    if (q.get("vk_app_id")) sessionStorage.setItem("vdp-vk-app", q.get("vk_app_id"));
  } catch (e) {
  }
  let seq = 0, webFrameId;
  const wait = {};
  window.vkBridge = (method, params = {}, ms = 8e3) => new Promise((ok) => {
    var _a, _b, _c;
    const request_id = "vdp".concat(++seq), data = { ...params, request_id };
    wait[request_id] = ok;
    setTimeout(() => {
      if (wait[request_id]) {
        delete wait[request_id];
        ok(null);
      }
    }, ms);
    try {
      if ((_a = window.AndroidBridge) == null ? void 0 : _a[method]) window.AndroidBridge[method](JSON.stringify(data));
      else if ((_c = (_b = window.webkit) == null ? void 0 : _b.messageHandlers) == null ? void 0 : _c[method]) window.webkit.messageHandlers[method].postMessage(data);
      else window.parent.postMessage({ handler: method, params: data, type: "vk-connect", webFrameId, connectVersion: "2.15.0" }, "*");
    } catch (e) {
      ok(null);
    }
  });
  let hidPaused = false;
  const viewHide = (hide) => {
    if (typeof vdpPause !== "function") return;
    if (hide && !window.vdpPaused) {
      hidPaused = true;
      vdpPause(true);
    } else if (!hide && hidPaused) {
      hidPaused = false;
      vdpPause(false);
    }
  };
  const onEvent = (e) => {
    var _a, _b;
    const t = (_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.type;
    if (t === "VKWebAppViewHide") viewHide(true);
    else if (t === "VKWebAppViewRestore") viewHide(false);
    const d = (_b = e == null ? void 0 : e.detail) == null ? void 0 : _b.data, rid = d == null ? void 0 : d.request_id;
    if (rid && wait[rid]) {
      wait[rid](d);
      delete wait[rid];
    }
  };
  window.addEventListener("VKWebAppEvent", onEvent);
  window.addEventListener("message", (e) => {
    let d = e.data;
    if (typeof d === "string") try {
      d = JSON.parse(d);
    } catch (e2) {
      return;
    }
    if (!d || typeof d !== "object") return;
    if (d.type === "vk-connect" || d.type === "VKWebAppEvent") d = d.detail || d.data || d;
    if ((d == null ? void 0 : d.type) === "VKWebAppSettings") {
      webFrameId = d.frameId;
      return;
    }
    if (d && typeof d.type === "string" && /^VKWebApp/.test(d.type)) onEvent({ detail: d });
  });
  try {
    const h = decodeURIComponent(location.hash.slice(1)), ref = h.match(/ref-([A-Z0-9]{6})/i), join = h.match(/join-([A-Z0-9]{6})/i), ch = h.match(/ch-(\d{8}[wl]\d{3}[pebc]\d{1,3})/);
    if (ref && !prefs.refClaimed) prefs.refBy = ref[1].toUpperCase();
    if (join) prefs.pendingJoin = join[1].toUpperCase();
    if (ref || join) store.set(KEY.prefs, prefs);
    if (ch && typeof rememberChallenge === "function") rememberChallenge(ch[1], "", ref == null ? void 0 : ref[1]);
  } catch (e) {
  }
  const vs = document.querySelector("#viralPop span");
  if (vs) vs.textContent = L("Позовите коллег в игру: за каждого, кто придёт по вашей ссылке, — +15 у.е. и +1 предмет на неделю.", "Invite coworkers: every newcomer via your link — +$15 and +1 item for the week.");
  try {
    const hero = document.getElementById("heroCard"), play = document.querySelector("#menu .play2"), quick = document.getElementById("startQuick");
    if (hero && play) {
      hero.before(play);
      if (quick) play.after(quick);
      document.documentElement.classList.add("vk-play-top");
    }
  } catch (e) {
  }
  vkBridge("VKWebAppInit");
  vkBridge("VKWebAppSetViewSettings", { status_bar_style: "light", action_bar_color: "#07070d", navigation_bar_color: "#07070d" });
  const autoLogin = async () => {
    var _a;
    if (!q.get("sign") || typeof registered !== "function" || registered() || !board.online || ((_a = window.vdpStartCode) == null ? void 0 : _a.call(window))) return;
    try {
      if (sessionStorage.getItem("vdp-vk-login") === q.get("sign")) return;
      sessionStorage.setItem("vdp-vk-login", q.get("sign"));
    } catch (e) {
    }
    const info = await vkBridge("VKWebAppGetUserInfo");
    const name = [info == null ? void 0 : info.first_name, info == null ? void 0 : info.last_name].filter(Boolean).join(" ");
    try {
      const j = await fnPost("tg-login", { vk_launch: { params: location.search, name } });
      if (j == null ? void 0 : j.access_token) await socialDone(j, "vk");
    } catch (e) {
      track("vk_app", { detail: "login_fail:".concat((e == null ? void 0 : e.message) || "", ":").concat((e == null ? void 0 : e.why) || "").slice(0, 60) });
    }
  };
  dataReady.then(() => setTimeout(autoLogin, 800));
  bus.on("menu", () => {
    if (!window.__vkOpened) {
      window.__vkOpened = 1;
      track("vk_app", { detail: q.get("vk_platform") || "" });
    }
  });
})();
