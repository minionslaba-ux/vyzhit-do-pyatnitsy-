/* сгенерировано tools/make-legacy.js из js/i18n.js — не править */
window.VK_MINI = (() => {
  try {
    const q = location.search, on = /[?&]vk_app_id=\d+/.test(q) && /[?&]sign=/.test(q);
    if (on) sessionStorage.setItem("vdp-vk", "1");
    return on || sessionStorage.getItem("vdp-vk") === "1";
  } catch (e) {
    return /[?&]vk_app_id=\d+/.test(location.search);
  }
})();
if (window.VK_MINI) document.documentElement.classList.add("vk-mini");
window.RUSTORE = (() => {
  try {
    const on = /[?&]src=rustore\b/.test(location.search) || /^android-app:\/\//.test(document.referrer);
    if (on) sessionStorage.setItem("vdp-rustore", "1");
    return on || sessionStorage.getItem("vdp-rustore") === "1";
  } catch (e) {
    return /[?&]src=rustore\b/.test(location.search);
  }
})();
window.ITCH = (() => {
  try {
    const on = /[?&]src=itch\b/.test(location.search);
    if (on) sessionStorage.setItem("vdp-itch", "1");
    return on || sessionStorage.getItem("vdp-itch") === "1";
  } catch (e) {
    return /[?&]src=itch\b/.test(location.search);
  }
})();
window.MAX_INIT = (() => {
  try {
    return new URLSearchParams(location.hash.slice(1)).get("WebAppData") || "";
  } catch (e) {
    return "";
  }
})();
window.MAX_APP = (() => {
  try {
    const on = /[?&]src=max\b/.test(location.search) || !!window.MAX_INIT;
    if (on) sessionStorage.setItem("vdp-max", "1");
    return on || sessionStorage.getItem("vdp-max") === "1";
  } catch (e) {
    return /[?&]src=max\b/.test(location.search);
  }
})();
if (window.MAX_APP) {
  document.documentElement.classList.add("max-app");
  const s = document.createElement("script");
  s.src = "https://st.max.ru/js/max-web-app.js";
  s.async = true;
  s.onload = () => {
    var _a, _b, _c, _d;
    try {
      (_b = (_a = window.WebApp) == null ? void 0 : _a.ready) == null ? void 0 : _b.call(_a);
      (_d = (_c = window.WebApp) == null ? void 0 : _c.expand) == null ? void 0 : _d.call(_c);
    } catch (e) {
    }
  };
  document.head.append(s);
}
window.NO_PAY = !!(window.RUSTORE || window.ITCH);
if (window.ITCH) document.documentElement.classList.add("itch");
if (window.NO_PAY) document.documentElement.classList.add("no-pay");
window.APP_VER = "v200";
window.BROWSER = ((ua) => /YaBrowser|YaSearchBrowser|YandexSearch/i.test(ua) ? "yandex" : /SamsungBrowser/i.test(ua) ? "samsung" : /MiuiBrowser|XiaoMi/i.test(ua) ? "miui" : /OPR\/|Opera/i.test(ua) ? "opera" : /Edg/i.test(ua) ? "edge" : /Firefox|FxiOS/i.test(ua) ? "firefox" : /CriOS|Chrome/i.test(ua) ? "chrome" : /Safari/i.test(ua) ? "safari" : "other")(navigator.userAgent || "");
window.__errs = [];
addEventListener("error", (e) => {
  var _a;
  if (window.__errs.length < 5) window.__errs.push("".concat((e.message || "error").slice(0, 90), " @").concat((e.filename || "").split("/").pop(), ":").concat(e.lineno || 0));
  (_a = window.__errFlush) == null ? void 0 : _a.call(window);
});
addEventListener("unhandledrejection", (e) => {
  var _a, _b;
  const m = String(((_a = e.reason) == null ? void 0 : _a.message) || e.reason || "");
  if (/fetch|network|load|abort/i.test(m)) return;
  if (window.__errs.length < 5) window.__errs.push(("promise: " + m).slice(0, 100));
  (_b = window.__errFlush) == null ? void 0 : _b.call(window);
});
(() => {
  var _a, _b, _c;
  const app = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (app) {
    document.documentElement.classList.add("pwa");
    return;
  }
  const inTg = /tgWebApp/.test(location.hash) || window.TelegramWebviewProxy || /Telegram/i.test(navigator.userAgent) || ((_b = (_a = window.Telegram) == null ? void 0 : _a.WebApp) == null ? void 0 : _b.initData);
  if (!inTg) document.documentElement.classList.add("docscroll");
  const set = () => {
    var _a2;
    const tg = (_a2 = window.Telegram) == null ? void 0 : _a2.WebApp, vv = window.visualViewport;
    const h = (tg == null ? void 0 : tg.initData) && tg.viewportStableHeight || window.innerHeight || (vv == null ? void 0 : vv.height);
    if (h > 200) document.documentElement.style.setProperty("--app-h", Math.round(h) + "px");
  };
  set();
  addEventListener("resize", set);
  (_c = window.visualViewport) == null ? void 0 : _c.addEventListener("resize", set);
  addEventListener("orientationchange", () => setTimeout(set, 350));
  addEventListener("load", () => {
    var _a2, _b2, _c2;
    set();
    (_c2 = (_b2 = (_a2 = window.Telegram) == null ? void 0 : _a2.WebApp) == null ? void 0 : _b2.onEvent) == null ? void 0 : _c2.call(_b2, "viewportChanged", set);
    setTimeout(set, 500);
  });
})();
const LANG = (() => {
  var _a;
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "ru") {
      localStorage.setItem("vdp-lang", q);
      return q;
    }
    const vl = new URLSearchParams(location.search).get("vk_language");
    if (vl && /[?&]vk_app_id=\d+/.test(location.search)) {
      const l2 = vl === "en" ? "en" : "ru";
      localStorage.setItem("vdp-lang", l2);
      return l2;
    }
    const s = localStorage.getItem("vdp-lang");
    if (s === "en" || s === "ru") return s;
    if (localStorage.getItem("vdp-prefs")) return "ru";
  } catch (e) {
  }
  const langs = ((_a = navigator.languages) == null ? void 0 : _a.length) ? navigator.languages : [navigator.language || "ru"];
  const l = langs.some((x) => /^(ru|uk|be|kk)\b/i.test(x)) ? "ru" : "en";
  try {
    localStorage.setItem("vdp-lang", l);
  } catch (e) {
  }
  return l;
})();
const EN = LANG === "en";
const L = (ru, en) => EN ? en : ru;
const LOCALE = EN ? "en-US" : "ru-RU";
const num1 = (n) => Number.isInteger(n) ? String(n) : (Math.round(n * 10) / 10).toLocaleString(EN ? "en-US" : "ru-RU");
const money = (n) => EN ? "".concat(n < 0 ? "−" : "", "$").concat(num1(Math.abs(n))) : "".concat(num1(n), " у.е.");
const pl = (n, one, few, many, enOne, enMany) => {
  if (EN) return "".concat(n, " ").concat(Math.abs(n) === 1 ? enOne : enMany);
  const a = Math.abs(n) % 100, b = a % 10;
  return "".concat(n, " ").concat(a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many);
};
const DAY_NAMES = EN ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] : ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
const PHASE_NAMES = EN ? ["Morning", "Afternoon", "Evening"] : ["Утро", "День", "Вечер"];
const dayName = (i) => DAY_NAMES[i];
const phaseName = (i) => PHASE_NAMES[i];
function setLang(l) {
  try {
    localStorage.setItem("vdp-lang", l);
  } catch (e) {
  }
  const q = new URLSearchParams(location.search);
  q.delete("lang");
  const site = /survivefriday\.com$|^localhost$/.test(location.hostname) && !window.VDP_PLATFORM;
  const path = site ? location.pathname.replace(/(old-en\.html|old\.html|en\.html|index\.html)?$/, l === "en" ? "en.html" : "") : location.pathname;
  location.href = path + (q.toString() ? "?" + q : "") + location.hash;
}
if (EN && /^Выжить/.test(document.title)) document.title = "Survive till Friday — free office survival game";
document.documentElement.lang = LANG;
function applyStaticLang(root = document) {
  if (!EN) return;
  root.querySelectorAll("[data-en]").forEach((el) => {
    el.innerHTML = el.dataset.en;
  });
  for (const a of ["aria-label", "placeholder", "title", "content", "href"])
    root.querySelectorAll("[data-en-".concat(a, "]")).forEach((el) => el.setAttribute(a, el.getAttribute("data-en-".concat(a))));
}
