/* сгенерировано tools/make-legacy.js из js/max-app.js — не править */
(() => {
  if (!window.MAX_APP) return;
  const initData = () => {
    var _a;
    return ((_a = window.WebApp) == null ? void 0 : _a.initData) || window.MAX_INIT || "";
  };
  const user = () => {
    var _a, _b;
    try {
      return ((_b = (_a = window.WebApp) == null ? void 0 : _a.initDataUnsafe) == null ? void 0 : _b.user) || JSON.parse(new URLSearchParams(initData()).get("user") || "null");
    } catch (e) {
      return null;
    }
  };
  const autoLogin = async () => {
    var _a;
    const d = initData();
    if (!d || typeof registered !== "function" || registered() || !board.online || ((_a = window.vdpStartCode) == null ? void 0 : _a.call(window))) return;
    const mark = d.slice(-24);
    try {
      if (sessionStorage.getItem("vdp-max-login") === mark) return;
      sessionStorage.setItem("vdp-max-login", mark);
    } catch (e) {
    }
    try {
      const j = await fnPost("tg-login", { max_init: d });
      if (j == null ? void 0 : j.access_token) await socialDone(j, "max");
    } catch (e) {
      track("max_app", { detail: "login_fail:".concat((e == null ? void 0 : e.message) || "").slice(0, 60) });
    }
  };
  dataReady.then(() => {
    const u = user();
    if (u && !prefs.name && $("joinName") && !$("joinName").value) $("joinName").value = [u.first_name, u.last_name].filter(Boolean).join(" ").slice(0, 24);
    setTimeout(autoLogin, 1500);
  });
  bus.on("menu", () => {
    var _a;
    if (!window.__maxOpened) {
      window.__maxOpened = 1;
      track("max_app", { detail: ((_a = window.WebApp) == null ? void 0 : _a.platform) || (initData() ? "init" : "noinit") });
    }
  });
})();
