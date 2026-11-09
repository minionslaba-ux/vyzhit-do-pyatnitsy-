/* сгенерировано tools/make-legacy.js из js/game.js — не править */
var _a, _b, _c, _d, _e;
const $ = (id) => document.getElementById(id);
const views = { join: $("join"), menu: $("menu"), game: $("game"), end: $("end"), board: $("board") };
const show = (v) => {
  var _a2, _b2, _c2;
  if (!window.__booted) {
    window.__booted = 1;
    (_a2 = $("boot")) == null ? void 0 : _a2.remove();
  }
  Object.entries(views).forEach(([k, el]) => el.hidden = k !== v);
  if (v !== "menu") $("viralPop").hidden = true;
  (_c2 = (_b2 = window.VDP_PLATFORM) == null ? void 0 : _b2.view) == null ? void 0 : _c2.call(_b2, v);
};
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
const rnd = (a, r = Math.random) => a[Math.floor(r() * a.length)];
const shuffle = (a, r = Math.random) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const clamp = (v) => Math.max(0, Math.min(100, v));
const EASE = "cubic-bezier(.2,.7,.2,1)";
const tube = (r) => '<div class="tube-wrap" id="st-'.concat(r.k, '" data-k="').concat(r.k, '" role="meter" aria-label="').concat(r.name, '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">\n    <span class="arrows" id="mk-').concat(r.k, '" aria-hidden="true"></span>\n    <div class="tube" aria-hidden="true"><div class="fill" id="fl-').concat(r.k, '"></div><i class="bub"></i><i class="bub"></i><i class="bub"></i></div><span class="steam" aria-hidden="true"><i></i><i></i><i></i></span>\n    <span class="lbl" aria-hidden="true">').concat(r.name, '</span><span class="pct" id="pc-').concat(r.k, '" aria-hidden="true">50%</span><span class="zone" id="zn-').concat(r.k, '" aria-hidden="true"></span></div>');
const zoneOf = (v) => v >= 80 ? L("перегрев", "overheat") : v <= 20 ? L("на грани", "on the edge") : "";
$("tubesL").innerHTML = RES.slice(0, 2).map(tube).join("");
$("tubesR").innerHTML = RES.slice(2).map(tube).join("");
const setPhase = (p) => {
  document.body.dataset.phase = p;
};
const THEMES = [
  { name: L("Ночной неон", "Neon Night"), m: "#ff3bd4", c: "#2de2e6", p: "#b26bff", bg: "#07070d" },
  { name: L("Закат", "Sunset"), m: "#ff6a3d", c: "#ffc53d", p: "#ff3d7f", bg: "#0d0707" },
  { name: L("Утро в офисе", "Office Morning"), m: "#d6189c", c: "#0a8fa8", p: "#b26bff", bg: "#f6f3ff", light: true },
  { name: L("Океан", "Ocean"), m: "#3d8bff", c: "#3dffd0", p: "#2b5cff", bg: "#050a12" },
  { name: L("Лес", "Forest"), m: "#2fe07a", c: "#e8d36a", p: "#1f8a4c", bg: "#050d08" },
  { name: L("Бумага", "Paper"), m: "#c2410c", c: "#1d4ed8", p: "#f59e0b", bg: "#f7f2e8", light: true },
  { name: L("Лаванда", "Lavender"), m: "#c48bff", c: "#ff9de2", p: "#7a5cff", bg: "#0a0712" },
  { name: L("Мандарин", "Tangerine"), m: "#ff9a2e", c: "#2ec4ff", p: "#ff5e2e", bg: "#0d0905" },
  { name: L("Мятный день", "Mint Day"), m: "#0c8461", c: "#7c3aed", p: "#34d399", bg: "#eefaf5", light: true },
  { name: L("Мята", "Mint"), m: "#3de8c0", c: "#ff7aa8", p: "#2fb38f", bg: "#060d0c" },
  { name: L("Рубин", "Ruby"), m: "#ff2e55", c: "#ffb02e", p: "#b3122f", bg: "#0e0508" },
  { name: L("Небо", "Sky"), m: "#2563eb", c: "#db2777", p: "#60a5fa", bg: "#eef5ff", light: true },
  { name: L("Электрик", "Electric"), m: "#5c6bff", c: "#00e5ff", p: "#3a2bff", bg: "#06061a" },
  { name: L("Золото", "Gold"), m: "#ffcf3d", c: "#ff8a3d", p: "#b38a1f", bg: "#0d0b05" },
  { name: L("Персик", "Peach"), m: "#c84b0a", c: "#0d9488", p: "#fb923c", bg: "#fff3ec", light: true },
  { name: L("Фуксия", "Fuchsia"), m: "#ff2ea6", c: "#ffe14d", p: "#a3125f", bg: "#0e050b" },
  { name: L("Аврора", "Aurora"), m: "#4dffb5", c: "#9b6bff", p: "#2bb3ff", bg: "#050c10" },
  { name: L("Сирень", "Lilac"), m: "#7c3aed", c: "#e11d48", p: "#a78bfa", bg: "#f5f0ff", light: true },
  { name: L("Коралл", "Coral"), m: "#ff7b6b", c: "#6be4ff", p: "#ff4d6d", bg: "#0e0708" },
  { name: L("Сакура", "Sakura"), m: "#ffa3cf", c: "#fff0a3", p: "#ff6bab", bg: "#0f080c" },
  { name: L("Индиго", "Indigo"), m: "#8b7bff", c: "#ff6be1", p: "#4b2bff", bg: "#07061a" },
  { name: L("Токсик", "Toxic"), m: "#7cff2e", c: "#2ee8ff", p: "#2e8b1f", bg: "#060d05" },
  { name: L("Лёд", "Ice"), m: "#e6f0ff", c: "#8fd3ff", p: "#5c7cff", bg: "#08090d" },
  // Новые темы — только в конец списка: номер темы хранится в prefs.theme.
  // tx / tx2 / tx3 — свои оттенки текста (основной, вторичный, третичный), если общие не подходят к фону
  { name: L("Утренний кофе", "Morning Latte"), m: "#8f4a1f", c: "#2f6b6f", p: "#d9a066", bg: "#f5ece1", light: true, tx: "#2a1c13", tx2: "#6a5444", tx3: "#45342a" },
  { name: L("Северное сияние", "Northern Lights"), m: "#38f2c8", c: "#ff7ad9", p: "#3b5bff", bg: "#030b16" },
  { name: L("Закат в опенспейсе", "Open-Space Sunset"), m: "#ff9466", c: "#b3a4ff", p: "#ff4f8b", bg: "#170b19", tx: "#fff1ea", tx2: "#cdb6c4", tx3: "#ead8df" },
  { name: L("Мятный понедельник", "Mint Monday"), m: "#0b7660", c: "#2949c9", p: "#8fe3c8", bg: "#ebf8f2", light: true, tx: "#10241f", tx2: "#4a5f59", tx3: "#2b3f3a" },
  { name: L("Неоновая пятница", "Neon Friday"), m: "#c6ff1a", c: "#ff4fae", p: "#7a2bff", bg: "#08050f" },
  { name: L("Графит и золото", "Graphite & Gold"), m: "#e8b64c", c: "#c5cad6", p: "#7a6430", bg: "#121316", tx: "#f4f1ea", tx2: "#b9b4a8", tx3: "#dcd7cc" },
  { name: L("Чертёж", "Blueprint"), m: "#ffb347", c: "#6fd3ff", p: "#1e5eff", bg: "#071630", tx: "#eef5ff", tx2: "#a9bcd9", tx3: "#d3e0f2" },
  { name: L("Высокий контраст", "High Contrast"), m: "#ffe600", c: "#00e5ff", p: "#3a3a3a", bg: "#000000", hc: true, tx: "#ffffff", tx2: "#e6e6e6", tx3: "#ffffff" }
];
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixW = (h, k) => "#" + rgbOf(h).map((v) => Math.round(v + (255 - v) * k).toString(16).padStart(2, "0")).join("");
const mixB = (h, k) => "#" + rgbOf(h).map((v) => Math.round(v * (1 - k)).toString(16).padStart(2, "0")).join("");
const THEME_FREE = [0, 23, 30];
const themePrice = (i) => THEME_FREE.includes(i) ? 0 : i >= 23 ? 25 : 15;
const PAID_THEMES = THEMES.map((t, i) => ({ id: i, name: t.name })).filter((t) => themePrice(t.id));
const themeOwned = (i) => !themePrice(i) || (prefs.themesOwned || []).includes(i);
const themeFixed = () => Number.isInteger(prefs.theme) && THEMES[prefs.theme] && themeOwned(prefs.theme) ? prefs.theme : null;
function themeIndex() {
  if (themeFixed() != null) return themeFixed();
  const w = (C == null ? void 0 : C.week) || Math.floor((Date.now() / 864e5 + 3) / 7);
  return (w - 1 + THEMES.length * 100) % THEMES.length;
}
let themeNow = -1;
function applyTheme(i = themeIndex()) {
  var _a2;
  if (i === themeNow) return THEMES[i];
  themeNow = i;
  const t = THEMES[i], st = document.documentElement.style;
  const tone = t.light ? (h, k) => mixB(h, k * 0.6) : mixW;
  st.setProperty("--magenta", t.m);
  st.setProperty("--magenta-l", tone(t.m, 0.45));
  st.setProperty("--magenta-xl", tone(t.m, 0.78));
  st.setProperty("--cyan", t.c);
  st.setProperty("--cyan-l", tone(t.c, 0.45));
  st.setProperty("--cyan-xl", tone(t.c, 0.78));
  st.setProperty("--bg-rgb", rgbOf(t.bg).join(","));
  st.setProperty("--hi", t.light ? "#14121f" : "#fff");
  st.setProperty("--w-rgb", t.light ? "20,18,40" : "255,255,255");
  document.documentElement.classList.toggle("light", !!t.light);
  document.documentElement.classList.toggle("hc", !!t.hc);
  for (const [k, v] of [["--text", t.tx], ["--text-2", t.tx2], ["--text-3", t.tx3]]) v ? st.setProperty(k, v) : st.removeProperty(k);
  st.setProperty("--m-rgb", rgbOf(t.m).join(","));
  st.setProperty("--c-rgb", rgbOf(t.c).join(","));
  st.setProperty("--p-rgb", rgbOf(t.p).join(","));
  st.setProperty("--bg", t.bg);
  (_a2 = document.querySelector("meta[name=theme-color]")) == null ? void 0 : _a2.setAttribute("content", t.bg);
  return t;
}
let themePreview = null;
function themePreviewEnd() {
  if (themePreview == null) return;
  themePreview = null;
  applyTheme();
}
function renderThemePicker() {
  const box = $("themePick");
  if (!box) return;
  const cur = themeFixed(), pv = themePreview, name = THEMES[pv != null ? pv : themeIndex()].name;
  let foot = '<small class="tp-name">'.concat(cur == null ? L("Сейчас: «".concat(name, "»"), "Now: “".concat(name, "”")) : L("Выбрано: «".concat(name, "»"), "Selected: “".concat(name, "”")), "</small>");
  if (pv != null) {
    const price = themePrice(pv), C2 = careerNow(), enough = C2 && C2.bank >= price;
    foot = '<div class="tp-buy"><span>👀 '.concat(L("Примерка: «".concat(name, "»"), "Preview: “".concat(name, "”")), "<small>").concat(L("навсегда за ".concat(price, " у.е."), "yours forever for ".concat(money(price)))).concat(C2 ? L(" · на счёте ".concat(money(C2.bank)), " · balance ".concat(money(C2.bank))) : "", "</small></span>\n      ").concat(prefs.themeCoupons > 0 ? '<button type="button" class="btn-main tp-go" data-theme-buy="'.concat(pv, '">🎟 ').concat(L("Взять по купону", "Use coupon"), "</button>") : enough ? '<button type="button" class="btn-main tp-go" data-theme-buy="'.concat(pv, '">').concat(L("Купить за ".concat(price, " у.е."), "Buy for ".concat(money(price))), "</button>") : '<button type="button" class="btn-main tp-go" data-theme-topup="'.concat(pv, '">💰 ').concat(L("Пополнить", "Top up"), "</button>"), '\n      <button type="button" class="btn-link" data-theme-cancel>').concat(L("Отмена", "Cancel"), "</button></div>");
  }
  box.innerHTML = '<button type="button" class="tp-auto'.concat(cur == null && pv == null ? " on" : "", '" data-theme="auto" aria-pressed="').concat(cur == null, '"><span aria-hidden="true">🔄</span><span>').concat(L("Авто", "Auto"), "<small>").concat(L("меняется каждую неделю · бесплатно", "changes every week · free"), "</small></span></button>") + THEMES.map((t, i) => {
    const own = themeOwned(i), lbl = own ? t.name : L("".concat(t.name, " — ").concat(themePrice(i), " у.е."), "".concat(t.name, " — ").concat(money(themePrice(i))));
    return '<button type="button" class="tp-sw'.concat(cur === i ? " on" : "").concat(pv === i ? " pv" : "").concat(own ? "" : " lock", '" data-theme="').concat(i, '" title="').concat(esc(lbl), '" aria-label="').concat(esc(lbl), '" aria-pressed="').concat(cur === i, '"><i style="--sw-bg:').concat(t.bg, ";--sw-m:").concat(t.m, ";--sw-c:").concat(t.c, '"></i>').concat(own ? "" : "<small>🔒".concat(themePrice(i), "</small>"), "</button>");
  }).join("") + foot;
}
function themeBuy(i) {
  if (!needReg("theme")) return;
  if ((prefs.themeCoupons || 0) > 0 && typeof useThemeCoupon === "function" && useThemeCoupon(i)) {
    prefs.theme = i;
    store.set(KEY.prefs, prefs);
    themePreview = null;
    applyTheme();
    try {
      renderMenu();
    } catch (e) {
      renderThemePicker();
    }
    return toast(L("🎨 Тема «".concat(THEMES[i].name, "» ваша — по купону"), "🎨 The “".concat(THEMES[i].name, "” theme is yours — coupon used")));
  }
  const price = themePrice(i), C2 = careerNow();
  if (!C2 || C2.bank < price) return openTopup({ need: lackOf(price), why: L("Тема «".concat(THEMES[i].name, "» — ").concat(price, " у.е."), "“".concat(THEMES[i].name, "” theme — ").concat(money(price))), then: renderThemePicker });
  C2.bank -= price;
  C2.spent = (C2.spent || 0) + price;
  careerSave(C2);
  prefs.themesOwned = [.../* @__PURE__ */ new Set([...prefs.themesOwned || [], i])];
  prefs.theme = i;
  store.set(KEY.prefs, prefs);
  track("theme_buy", { detail: "".concat(i, ":").concat(price) });
  themePreview = null;
  applyTheme();
  try {
    renderMenu();
  } catch (e) {
    renderThemePicker();
  }
  toast(L("🎨 Тема «".concat(THEMES[i].name, "» ваша — навсегда"), "🎨 The “".concat(THEMES[i].name, "” theme is yours to keep")));
}
(_a = $("themePick")) == null ? void 0 : _a.addEventListener("click", (e) => {
  var _a2, _b2;
  const t = e.target;
  if (!t.closest("[data-theme-topup]")) e.stopPropagation();
  if (t.closest("[data-theme-buy]")) return themeBuy(+t.closest("[data-theme-buy]").dataset.themeBuy);
  if (t.closest("[data-theme-topup]")) return themeBuy(+t.closest("[data-theme-topup]").dataset.themeTopup);
  if (t.closest("[data-theme-cancel]")) {
    themePreviewEnd();
    return renderThemePicker();
  }
  const b = t.closest("[data-theme]");
  if (!b) return;
  const i = b.dataset.theme === "auto" ? null : +b.dataset.theme;
  if (i != null && !themeOwned(i)) {
    themePreview = i;
    applyTheme(i);
    renderThemePicker();
    track("theme_try", { detail: String(i) });
    return (_a2 = $("themePick").querySelector(".tp-go")) == null ? void 0 : _a2.focus({ preventScroll: true });
  }
  themePreview = null;
  if (i == null) delete prefs.theme;
  else prefs.theme = i;
  store.set(KEY.prefs, prefs);
  applyTheme();
  renderThemePicker();
  (_b2 = $("themePick").querySelector('[data-theme="'.concat(b.dataset.theme, '"]'))) == null ? void 0 : _b2.focus({ preventScroll: true });
});
bus.on("menu", () => {
  var _a2;
  if (themePreview != null && !((_a2 = $("profSheet")) == null ? void 0 : _a2.hidden)) applyTheme(themePreview);
  else themePreview = null;
  renderThemePicker();
});
if ($("profSheet")) new MutationObserver(() => {
  if ($("profSheet").hidden && themePreview != null) {
    themePreviewEnd();
    renderThemePicker();
  }
}).observe($("profSheet"), { attributes: true, attributeFilter: ["hidden"] });
(() => {
  let seed = 11;
  const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  let city = "", x = 104;
  while (x < 1096) {
    const w = 30 + Math.floor(r() * 50), h = 60 + Math.floor(r() * 140);
    city += '<rect class="bld" x="'.concat(x, '" y="').concat(250 - h, '" width="').concat(w, '" height="').concat(h, '"/>');
    for (let wy = 256 - h; wy < 240; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12)
      if (r() > 0.35) city += '<rect class="cw'.concat(r() > 0.55 ? " lit" : "", '" style="--d:').concat((r() * 2.4).toFixed(2), 's" x="').concat(wx, '" y="').concat(wy, '" width="5" height="7"/>');
    x += w + 4;
  }
  const desk = (dx, i) => '<g class="desk'.concat(i === 3 ? " last" : "", '">\n    <rect class="mon" x="').concat(dx + 60, '" y="228" width="86" height="54" rx="4"/><rect class="stand" x="').concat(dx + 98, '" y="282" width="10" height="10"/>\n    <g class="person"><circle cx="').concat(dx + 103, '" cy="262" r="15"/><path d="M').concat(dx + 72, ' 300 q31 -34 62 0z"/></g>\n    <rect class="top" x="').concat(dx, '" y="292" width="210" height="8" rx="2"/><rect class="leg" x="').concat(dx + 10, '" y="300" width="6" height="56"/><rect class="leg" x="').concat(dx + 194, '" y="300" width="6" height="56"/>\n    ').concat(i === 3 ? '<polygon class="lamp-glow" points="'.concat(dx + 176, ",214 ").concat(dx + 120, ",292 ").concat(dx + 220, ',292"/><path class="lamp" d="M').concat(dx + 196, ' 292 v-62 l-24 -14"/><path class="lamp" d="M').concat(dx + 160, ' 214 h28 l-6 -10 h-16z"/>') : "", "\n  </g>");
  $("office").innerHTML = '<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">\n    <rect class="sky" x="100" y="20" width="1000" height="232"/>'.concat(city, '\n    <rect class="frame" x="100" y="20" width="1000" height="232"/><path class="frame" d="M350 20v232M600 20v232M850 20v232"/>\n    <rect class="floor" x="0" y="356" width="1200" height="44"/>').concat([110, 380, 650, 920].map(desk).join(""), '\n    <g class="cooler"><rect class="bottle" x="1138" y="246" width="34" height="48" rx="10"/><circle class="cb" cx="1150" cy="288" r="3"/><circle class="cb" cx="1160" cy="290" r="2.4"/><circle class="cb" cx="1146" cy="292" r="2"/>\n      <rect class="body" x="1132" y="294" width="46" height="62" rx="4"/><rect class="tap" x="1150" y="306" width="10" height="5" rx="2"/></g>\n    <g class="walker"><circle cx="0" cy="300" r="13"/><path d="M-14 356 v-30 q14 -20 28 0 v30z"/><rect class="mug" x="14" y="318" width="9" height="11" rx="2"/></g></svg>');
})();
function renderSound() {
  const vol = Math.round(sfxVol() * 100), sl = $("sndVol"), sv = $("sndVolVal"), st = $("sndToggle");
  if (sl) {
    sl.value = vol;
    sl.style.setProperty("--p", vol + "%");
    sl.setAttribute("aria-valuetext", vol + "%");
  }
  if (sv) sv.textContent = prefs.sound ? vol + "%" : L("выкл.", "off");
  if (st) {
    st.textContent = prefs.sound ? "♪" : "×";
    st.setAttribute("aria-pressed", prefs.sound);
    st.title = prefs.sound ? L("Звук включён", "Sound on") : L("Звук выключен", "Sound off");
  }
  for (const b of [$("soundMenu"), $("soundGame")]) {
    b.textContent = prefs.sound ? "♪" : "×";
    b.setAttribute("aria-pressed", prefs.sound);
    b.title = prefs.sound ? L("Звук включён", "Sound on") : L("Звук выключен", "Sound off");
  }
}
function toggleSound() {
  var _a2;
  prefs.sound = !prefs.sound;
  store.set(KEY.prefs, prefs);
  renderSound();
  if (prefs.sound) (_a2 = sfx.click) == null ? void 0 : _a2.call(sfx);
}
$("soundMenu").onclick = toggleSound;
$("soundGame").onclick = toggleSound;
if ($("sndToggle")) $("sndToggle").onclick = toggleSound;
(_b = $("sndVol")) == null ? void 0 : _b.addEventListener("input", (e) => {
  var _a2;
  prefs.vol = Math.max(0, Math.min(100, Math.round(+e.target.value) || 0));
  if (prefs.vol > 0 && !prefs.sound) prefs.sound = true;
  sfxSetVol();
  renderSound();
  (_a2 = sfx.tick) == null ? void 0 : _a2.call(sfx);
});
(_c = $("sndVol")) == null ? void 0 : _c.addEventListener("change", () => {
  var _a2;
  store.set(KEY.prefs, prefs);
  (_a2 = sfx.click) == null ? void 0 : _a2.call(sfx);
});
let toastT;
function toast(text) {
  const t = $("toastBar");
  t.textContent = text;
  t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("on"), Math.min(7e3, Math.max(2600, String(text).length * 55)));
}
const endingsGot = () => store.get(KEY.endings, {});
function unlock(ids) {
  const got = endingsGot(), fresh = ids.filter((id) => id && !got[id]);
  for (const id of fresh) got[id] = (/* @__PURE__ */ new Date()).toISOString();
  if (fresh.length) store.set(KEY.endings, got);
  return fresh.map((id) => ENDINGS.find((e) => e.id === id)).filter(Boolean);
}
const endingsHtml = (list) => list.length ? '<div class="unlocked">'.concat(list.map((e) => "<span>".concat(L("Новая концовка: «".concat(esc(e.title), "»"), "New ending: “".concat(esc(e.title), "”")), "</span>")).join(""), "</div>") : "";
let S = null, busy = false, splashOn = false, splashFor = -1;
const slotOf = (day, phase) => slotOfPhase(DAYS.indexOf(day), PHASES.findIndex((p) => p.name === phase));
function buildDeck({ prof, type = "normal", rng = Math.random, extraRandom = [], profCard = true, packCards = [], classic = true, seen = null, lvl = 0 }) {
  const LP = levelPool(lvl);
  const unseen = (c) => !seen || !seen.has(c.id);
  const used = /* @__PURE__ */ new Set(), deck = [], randomPack = [...RANDOM_CARDS, ...extraRandom].filter(unseen);
  const rules = WEEK_TYPES[type].rules, fixed = /* @__PURE__ */ new Map();
  for (const c of [...(WEEK_TYPES[type].cards || []).filter(unseen), ...packCards]) fixed.set(slotOf(c.day, c.phase), c.id);
  for (let i = 0; i < WEEK_LEN; i++) {
    const d = dayOf(i), ph = PHASES[slotPh(i)];
    if (fixed.has(i)) {
      const c = byId[fixed.get(i)];
      deck.push({ id: c.id, time: c.time || slotTime(i), fixed: true });
      continue;
    }
    const ok = (c) => c.phase === ph.name && !used.has(c.id);
    const fresh = classic ? [] : LP.filter((c) => ok(c) && unseen(c));
    const special = CARDS.filter((c) => ok(c) && c.day === DAYS[d]);
    let pool = fresh.length ? fresh : special.length ? special : CARDS.filter((c) => ok(c) && !c.day);
    if (!pool.length) pool = LP.filter((c) => ok(c) && unseen(c));
    if (!pool.length) pool = [...CARDS, ...LP].filter((c) => c.phase === ph.name && !used.has(c.id));
    const standard = rnd(pool, rng);
    used.add(standard.id);
    deck.push({ id: standard.id, time: standard.time || slotTime(i) });
  }
  const profLeft = profCard && prof && PROF_CARDS[prof] ? PROF_CARDS[prof].filter(unseen) : [];
  if (profLeft.length) {
    const free = deck.map((s, i2) => s.fixed ? -1 : i2).filter((i2) => i2 > 0 && i2 !== WEEK_LEN - 1 && i2 >= 0);
    const i = rnd(free, rng), c = byId[rnd(profLeft, rng).id];
    deck[i] = { id: c.id, time: slotTime(i), fixed: true };
  }
  deck.forEach((s, i) => {
    var _a2;
    if (s.fixed) return;
    const card = getRandomCard(byId[s.id], randomPack, (_a2 = rules.randomChance) != null ? _a2 : 15, rng);
    if (card.id !== s.id) deck[i] = { id: card.id, time: card.time || slotTime(i) };
  });
  return deck;
}
const giveItems = (n, rng = Math.random) => shuffle(Object.keys(ITEMS), rng).slice(0, n);
function weekTypeFor(week, newJob) {
  if (newJob) return "newboss";
  if (week % 13 === 0) return "reports";
  if (week === 25 || week === 51) return "vacation";
  return "normal";
}
function newWeekState({ mode, res, type, rng = Math.random, extra = {} }) {
  const rules = WEEK_TYPES[type].rules;
  res = { ...res };
  for (const [k, v] of Object.entries(rules.start || {})) res[k] = clamp(res[k] + v);
  if (rules.bossStart) res.boss = rules.bossStart;
  for (const k in res) res[k] = Math.max(5, Math.min(95, res[k]));
  let n = rules.items || (rng() < 0.5 ? 1 : 2);
  if (mode === "career" && typeof rankPerk === "function") n = Math.min(4, n + rankPerk("items"));
  if (mode === "career" && prefs.bonusItems > 0) {
    const add = Math.min(prefs.bonusItems, 4 - n);
    n += add;
    prefs.bonusItems -= add;
    store.set(KEY.prefs, prefs);
  }
  return {
    mode,
    name: prefs.name,
    dept: prefs.dept,
    prof: extra.prof || prefs.prof,
    trait: extra.trait || prefs.trait,
    res,
    step: 0,
    type,
    items: giveItems(n, rng),
    used: [],
    flags: {},
    ...extra
  };
}
let C = null;
const saveCareer = () => store.set(KEY.career, C);
const vacancy = (id) => VACANCIES.find((v) => v.id === id);
const PAY_BASE = 2, PAY_CERT = 0.5, LIFE_COST = 4;
const salaryFor = () => PAY_BASE + PAY_CERT * ((C == null ? void 0 : C.cert) || 0);
const payFix = (c) => {
  if (c && c.payV !== 2) {
    c.payV = 2;
    c.salary = PAY_BASE + PAY_CERT * (c.cert || 0);
  }
  return c;
};
const VAC_YEAR = 28, VAC_PER_WEEK = VAC_YEAR / YEAR;
const fmtDays = (d) => (Math.floor(d * 10) / 10).toLocaleString(LOCALE);
function pay(amount) {
  C.bank += amount;
  C.earned += amount;
  saveCareer();
}
function weekExpenses(share2 = 1) {
  const life = Math.round(LIFE_COST * share2), loanPay = Math.min(C.loan || 0, Math.max(6, Math.ceil((C.loan || 0) / 8)));
  C.bank -= life + loanPay;
  C.loan = (C.loan || 0) - loanPay;
  C.spent = (C.spent || 0) + life + loanPay;
  saveCareer();
  return { life, loanPay };
}
const expHtml = (x) => '<div class="money expense"><div><b>−'.concat(money(x.life), "</b><span>").concat(L("жильё и еда", "rent & food"), "</span></div><div><b>").concat(x.loanPay ? "−".concat(money(x.loanPay)) : "—", "</b><span>").concat(C.loan ? L("кредит, осталось ".concat(C.loan), "loan, $".concat(C.loan, " left")) : x.loanPay ? L("кредит погашен", "loan paid off") : L("кредита нет", "no loan"), "</span></div></div>\n  ").concat(C.bank < 0 ? '<p class="debt">'.concat(L("На счёте ".concat(C.bank, " у.е. — долг. В понедельник Кукуха −10, пока не выйдете в плюс."), "Balance: ".concat(money(C.bank), ". You’re in debt — Sanity −10 every Monday until you’re back in the black.")), " ").concat(topupBtn(-C.bank, "", L("Закройте долг, чтобы он не давил на Кукуху.", "Clear the debt so it stops hurting your Sanity.")), "</p>") : "");
function takeVacation() {
  if (!C || C.vacation < 7 || C.week > YEAR) return;
  const holidayPay = C.salary * 5;
  C.vacation = +(C.vacation - 7).toFixed(2);
  C.vacUsed += 7;
  C.week++;
  C.res = { psyche: 60, energy: 60, boss: 50, colleagues: 50 };
  pay(holidayPay);
  weekExpenses();
  store.del(KEY.save);
  const over = C.week > YEAR;
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(L("Неделя ".concat(C.week - 1, " из ").concat(YEAR, " · отпуск 7 дней"), "Week ".concat(C.week - 1, " of ").concat(YEAR, " · 7 days off")), "</span>\n    <h1>").concat(L("Вы в отпуске!", "You’re on vacation!"), "</h1>\n    <p>").concat(L("Неделя без писем, созвонов и «срочно». В понедельник все шкалы вернутся к 50%, а Кукуха и Энергия — ещё и с запасом +10.", "A week with no emails, no calls and no “URGENT!!!”. On Monday every meter resets to 50%, and Sanity and Energy get a +10 cushion on top."), '</p>\n    <div class="money"><div><b>+').concat(money(holidayPay), "</b><span>").concat(L("отпускные", "vacation pay"), "</span></div><div><b>").concat(fmtDays(C.vacation), " ").concat(L("дн.", "days"), "</b><span>").concat(L("отпуска осталось", "vacation left"), '</span></div></div>\n    <div class="stack"><button class="btn-main" id="next">').concat(over ? L("Итоги года", "Year in review") : L("Вернуться к работе · неделя ".concat(C.week), "Back to work · week ".concat(C.week)), '</button><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div></div>");
  setPhase("day");
  show("end");
  $("toMenu").onclick = renderMenu;
  $("next").onclick = () => over ? yearEnd() : startWeek();
  confetti();
}
const freshRes = (perk) => {
  const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
  for (const b of [PROF[C.prof].bonus, perk || {}]) for (const [k, v] of Object.entries(b)) res[k] = clamp(res[k] + v);
  return res;
};
function newCareer() {
  prefs.prof = getProf();
  prefs.trait = getTrait();
  store.set(KEY.prefs, prefs);
  const first = rnd(VACANCIES.filter((v) => v.level === 1));
  C = {
    prof: prefs.prof,
    trait: prefs.trait,
    week: 1,
    stage: "work",
    company: first.name,
    companies: [first.name],
    res: null,
    worked: 0,
    firings: 0,
    passed: 0,
    failed: 0,
    newJob: false,
    bank: 0,
    earned: 0,
    salary: salaryFor(first),
    vacation: 0,
    vacUsed: 0
  };
  C.res = freshRes(first.perk);
  saveCareer();
  heroCreate(startWeek);
}
function startLevel(lvl) {
  const keep = C, first = rnd(VACANCIES.filter((v) => v.level === Math.min(lvl, 3)));
  C = {
    prof: keep.prof,
    trait: keep.trait,
    week: 1,
    stage: "work",
    company: first.name,
    companies: [first.name],
    res: null,
    level: lvl,
    worked: 0,
    firings: 0,
    passed: 0,
    failed: 0,
    newJob: false,
    bank: keep.bank || 0,
    earned: 0,
    cert: keep.cert,
    payV: keep.payV,
    vacation: 0,
    vacUsed: 0,
    hero: keep.hero,
    story: keep.story,
    levelsDone: Math.max(keep.levelsDone || 0, levelOf(keep))
  };
  C.salary = salaryFor(first);
  C.res = freshRes(first.perk);
  store.del(KEY.save);
  saveCareer();
  track("level_start", { detail: String(lvl) });
  toast(L("".concat(LEVELS[lvl].ico, " Уровень ").concat(lvl, ": «").concat(LEVELS[lvl].name, "» — новые карточки!"), "".concat(LEVELS[lvl].ico, " Level ").concat(lvl, ": “").concat(LEVELS[lvl].name, "” — new cards!")));
  loadLevel(lvl).then(() => startWeek());
}
function continueCareer() {
  var _a2, _b2, _c2, _d2, _e2;
  C = store.get(KEY.career, null);
  if (!C) return newCareer();
  C.trait = C.trait || prefs.trait;
  (_a2 = C.bank) != null ? _a2 : C.bank = 0;
  (_b2 = C.earned) != null ? _b2 : C.earned = 0;
  (_c2 = C.vacation) != null ? _c2 : C.vacation = 0;
  (_d2 = C.vacUsed) != null ? _d2 : C.vacUsed = 0;
  if (C.payV !== 2) {
    payFix(C);
    saveCareer();
  }
  const save = store.get(KEY.save, null);
  if (save && (save.mode || "career") === "career" && ((_e2 = save.deck) == null ? void 0 : _e2.every((x) => byId[x.id]))) {
    S = { items: [], used: [], flags: {}, type: "normal", mode: "career", ...save };
    return enterGame(true);
  }
  if (C.week > YEAR) return yearEnd();
  if (!C.hero) return heroCreate(continueCareer);
  if (C.stage === "search") return jobSearch();
  startWeek();
}
const lvlHash = (id) => {
  let h = 0;
  for (const ch of String(id)) h = h * 31 + ch.charCodeAt(0) | 0;
  return Math.abs(h);
};
const levelPool = (lvl) => {
  if (!lvl) return POOL;
  const a = POOL.filter((c) => c.lvl === lvl);
  if (a.length < 150) return POOL;
  if (lvl < LEVEL_LAZY) return a;
  const prev = POOL.filter((c) => c.lvl === lvl - 1), k = Math.max(1, Math.round(prev.length / 400));
  return a.concat(prev.filter((c) => lvlHash(c.id) % k === 0));
};
function seenSet(lvl = 0) {
  const seen = new Set(store.get(KEY.seen, [])), LP = levelPool(lvl);
  for (const ph of PHASES) {
    const left = LP.filter((c) => c.phase === ph.name && !seen.has(c.id)).length;
    if (LP.length && left < 5) LP.filter((c) => c.phase === ph.name).forEach((c) => seen.delete(c.id));
  }
  return seen;
}
function startWeek() {
  const type = weekTypeFor(C.week, C.newJob);
  C.newJob = false;
  saveCareer();
  S = newWeekState({ mode: "career", res: C.res, type, extra: { prof: C.prof, trait: C.trait } });
  S.diff = diffStage(C);
  if (C.bank < 0) {
    S.res.psyche = Math.max(5, S.res.psyche - 10);
    setTimeout(() => toast(L("Долг ".concat(C.bank, " у.е. давит: Кукуха −10"), "".concat(money(-C.bank), " of debt weighs on you: Sanity −10"))), 400);
  }
  const lvl = levelOf(C);
  S.lvl = lvl;
  const seen = seenSet(lvl), classic = lvl === 1 && (!seen.has("__classic") || !POOL.length);
  const season = type === "normal" && !classic ? activeSeason() : null;
  if (season) S.season = season.id;
  S.deck = buildDeck({ prof: C.prof, type, extraRandom: SUGGESTED, classic, seen, lvl, packCards: season ? SEASON_CARDS.filter((c) => c.season === season.title && !seen.has(c.id)) : [] });
  if (!classic) placeCastCard(S.deck);
  bus.emit("deck", S);
  for (const s of S.deck) seen.add(s.id);
  if (classic) seen.add("__classic");
  store.set(KEY.seen, [...seen]);
  store.set(KEY.save, S);
  enterGame();
}
const relStore = () => (S == null ? void 0 : S.mode) === "career" && C ? C.cast || (C.cast = {}) : S.castRel || (S.castRel = {});
function placeCastCard(deck) {
  if (!CAST_CARDS.length) return;
  const rel = C.cast || (C.cast = {}), stage = C.castStage || (C.castStage = {}), done = new Set(C.castSeen || (C.castSeen = []));
  const payoff = CAST_CARDS.find((c) => !done.has(c.id) && (c.payoff === "friend" && (rel[c.cast] || 0) >= 2 || c.payoff === "enemy" && (rel[c.cast] || 0) <= -2));
  const next = Object.keys(CAST).map((k) => CAST_CARDS.find((c) => c.cast === k && c.stage === (stage[k] || 0) + 1)).filter(Boolean);
  const card = payoff || next.sort((a, b) => a.stage - b.stage)[Math.floor(Math.random() * Math.min(2, next.length))];
  if (!card) return;
  const free = deck.map((s, i2) => s.fixed || i2 === 0 || i2 === WEEK_LEN - 1 ? -1 : i2).filter((i2) => i2 >= 0);
  if (!free.length) return;
  const i = rnd(free);
  deck[i] = { id: card.id, time: slotTime(i), fixed: true };
}
function castAfter(c, side, eff) {
  const k = c.cast || castOf("".concat(c.who, " ").concat(c.text));
  if (!k) return;
  const d = c.cast ? c.answers[side].rel || 0 : Math.sign(eff.colleagues || 0);
  if (c.cast && S.mode === "career" && C) {
    if (c.stage) (C.castStage || (C.castStage = {}))[k] = Math.max(C.castStage[k] || 0, c.stage);
    else (C.castSeen || (C.castSeen = [])).push(c.id);
  }
  if (!d) return;
  const rel = relStore();
  rel[k] = Math.max(-3, Math.min(3, (rel[k] || 0) + d));
  if (S.mode === "career" && C) saveCareer();
  FX.relNote(CAST[k].name, d);
}
const hearts = (v) => v > 0 ? "♥".repeat(v) : v < 0 ? "💢".repeat(-v) : "·";
function livePick(c, side) {
  const el = $("pickStat");
  el.hidden = true;
  if (!board.online) return;
  if (S.mode !== "daily") {
    const id = c.id;
    board.rpc("card_vote", { p_id: prefs.playerId, p_card: String(id).slice(0, 40), p_side: side }).then((r) => {
      const x = Array.isArray(r) ? r[0] : r, n = ((x == null ? void 0 : x.l) || 0) + ((x == null ? void 0 : x.r) || 0);
      if (!x || n < 5 || !S || S.mode === "daily") return;
      const pct = Math.round(100 * (side === "left" ? x.l : x.r) / n);
      el.textContent = L("Так же ответили ".concat(pct, "% игроков"), "".concat(pct, "% of players chose the same"));
      el.hidden = false;
      FX.pulse(el, "on", 4e3);
    }).catch(() => {
    });
    return;
  }
  const step = S.step;
  board.rpc("pick_daily", { p_id: prefs.playerId, p_day: S.day, p_step: step, p_card: c.id, p_side: side }).then((r) => {
    const x = Array.isArray(r) ? r[0] : r;
    if (!(x == null ? void 0 : x.total) || (S == null ? void 0 : S.mode) !== "daily") return;
    el.textContent = x.total === 1 ? L("Вы первые ответили на эту карточку сегодня", "You’re the first to answer this card today") : "".concat(L("Так же ответили", "Same answer as you:"), " ").concat(Math.round(100 * x.same / x.total), "% · ").concat(pl(x.total, "ответ", "ответа", "ответов", "answer", "answers"), " ").concat(L("за сегодня", "today"));
    el.hidden = false;
    FX.pulse(el, "on", 4e3);
  }).catch(() => {
  });
}
let liveT = 0;
async function liveTick() {
  clearTimeout(liveT);
  const el = $("liveStrip");
  $("live").hidden = true;
  if (views.game.hidden) {
    el.hidden = true;
    return;
  }
  try {
    const rows = (await onlineNow()).filter((p) => p.short_id).sort((a, b) => (b.status === "playing") - (a.status === "playing"));
    el.hidden = !rows.length;
    el.innerHTML = rows.length ? '<span class="ls-head"><i class="live-dot"></i>'.concat(rows.filter((r) => !r.npc).length ? "".concat(rows.filter((r) => !r.npc).length, "<small>").concat(L("в игре", "online"), "</small>") : "<small>".concat(L("офис", "office"), "</small>"), "</span>") + rows.slice(0, 15).map((p, i) => '<button class="ls-p'.concat(p.status === "playing" ? " play" : "").concat(p.npc ? " npc" : "", '" type="button" data-i="').concat(i, '" title="').concat(esc(p.name)).concat(p.dept ? " · " + esc(p.dept) : "").concat(p.npc ? " · " + L("персонаж игры", "game character") : "", '"><span class="ls-ava">').concat(esc(p.avatar || "🙂"), '</span><span class="ls-name">').concat(esc(p.name), "</span></button>")).join("") : "";
    el.querySelectorAll("[data-i]").forEach((b) => b.onclick = () => personPop(rows[+b.dataset.i]));
  } catch (e) {
    el.hidden = true;
  }
  liveT = setTimeout(liveTick, 3e4);
}
function startDaily(day = today()) {
  if (!poolDone) return void poolFull().then(() => startDaily(day));
  const rng = seeded("vdp-daily-" + day);
  C = null;
  S = newWeekState({ mode: "daily", res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: "normal", rng, extra: { day } });
  const season = activeSeason(/* @__PURE__ */ new Date(day + "T12:00"));
  if (season) S.season = season.id;
  S.deck = buildDeck({ type: "normal", rng, profCard: false, classic: !POOL.length, packCards: season ? SEASON_CARDS.filter((c) => c.season === season.title) : [] });
  S.ranked = day === today() && !store.get(KEY.daily, {})[day];
  enterGame();
}
function startPack() {
  if (!PACK) return;
  C = null;
  S = newWeekState({ mode: "pack", res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: "normal" });
  S.deck = buildDeck({ type: "normal", profCard: false, packCards: PACK_CARDS, classic: !POOL.length });
  enterGame();
}
function enterGame(resumed) {
  busy = false;
  applyTheme();
  show("game");
  splashFor = -1;
  liveTick();
  $("pickStat").hidden = true;
  if (resumed) track("week_resume", { mode: S.mode, step: S.step });
  else if (S.step === 0) track("week_start", { mode: S.mode });
  renderBars();
  renderCard();
  requestAnimationFrame(fitGame);
}
const YM_GOALS = /* @__PURE__ */ new Set(["open", "week_start", "week_end", "buy_intent", "purchase", "ad_reward", "ad_forced", "cert_end", "share", "invite", "install", "pet_adopt", "hero_buy", "guest_gate"]);
function track(kind, o = {}) {
  var _a2, _b2, _c2;
  if (YM_GOALS.has(kind)) try {
    (_a2 = window.ym) == null ? void 0 : _a2.call(window, 113961628, "reachGoal", kind, { mode: o.mode, detail: o.detail });
  } catch (e) {
  }
  if (!board.online || !prefs.name) return;
  board.rpc("log_event", { p_id: prefs.playerId, p_kind: kind, p_mode: o.mode || null, p_card: o.card || null, p_won: (_b2 = o.won) != null ? _b2 : null, p_step: (_c2 = o.step) != null ? _c2 : null, p_detail: o.detail || null }).catch(() => {
  });
}
function renderBars() {
  for (const r of RES) {
    const v = S.res[r.k];
    $("fl-" + r.k).style.setProperty("--v", v);
    $("pc-" + r.k).textContent = v + "%";
    const z = zoneOf(v), w = $("st-" + r.k);
    w.classList.toggle("danger", !!z);
    w.classList.toggle("hot", v >= 80);
    w.classList.toggle("low", v <= 20);
    $("zn-" + r.k).textContent = z;
    w.setAttribute("aria-valuenow", v);
    w.setAttribute("aria-valuetext", "".concat(r.name, ": ").concat(v, "%").concat(z ? ", " + z : ""));
  }
  const bc = $("bankChip");
  bc.hidden = !(S.mode === "career" && C);
  if (!bc.hidden) bc.textContent = "".concat(money(C.bank), " · ").concat(L("магазин", "shop"));
  if ($("ctBank") && C) $("ctBank").textContent = money(C.bank);
  if (!busy && !views.game.hidden) answerWarn();
  $("inv").innerHTML = S.items.map((id) => '<span class="item'.concat(S.used.includes(id) ? " used" : "", '" title="').concat(ITEMS[id].text, '">').concat(ITEMS[id].name, "</span>")).join("");
}
const headerLine = () => S.mode === "career" && C ? (levelOf(C) > 1 ? L("Ур. ".concat(levelOf(C), " · "), "Lv ".concat(levelOf(C), " · ")) : "") + L("Неделя ".concat(C.week, "/").concat(YEAR, " · ").concat(C.company), "Week ".concat(C.week, "/").concat(YEAR, " · ").concat(C.company)) : S.mode === "daily" ? "".concat(L("Неделя дня", "Daily Week"), " ").concat(dayLabel(S.day)).concat(S.ranked ? "" : L(" · не в зачёт", " · unranked")) : S.mode === "tour" ? "".concat(L("Турнир", "Tournament"), " · ").concat(S.tourTeam).concat(S.ranked ? "" : L(" · не в зачёт", " · unranked")) : S.mode === "quick" ? L("⚡ Быстрая смена · четверг и пятница", "⚡ Quick shift · Thursday & Friday") : (PACK == null ? void 0 : PACK.company) || "";
function renderCard() {
  var _a2;
  const slot = S.deck[S.step], c = byId[slot.id], d = dayOf(S.step), ph = PHASES[slotPh(S.step)];
  const card = $("card");
  const gold = S.goldAt === S.step && !S.goldDone;
  const tag = gold ? '<span class="rnd-tag gold">✨ '.concat(L("ЗОЛОТАЯ КАРТОЧКА · сюрприз за любой ответ", "GOLDEN CARD · a surprise for any answer"), "</span>") : c.story ? stoTag(c) : c.rare ? '<span class="rnd-tag rare">✨ '.concat(L("РЕДКОЕ СОБЫТИЕ", "RARE EVENT"), "</span>") : slot.origin ? '<span class="rnd-tag chain">← '.concat(esc(slot.origin), "</span>") : c.author ? '<span class="rnd-tag">'.concat(L("ОТ КОЛЛЕГИ", "FROM A COLLEAGUE"), " · ").concat(esc(c.author), "</span>") : c.month && typeof retCardTag === "function" ? retCardTag(c) : c.random ? '<span class="rnd-tag">'.concat(L("! СЛУЧАЙНОЕ СОБЫТИЕ", "! RANDOM EVENT"), "</span>") : c.profCard ? '<span class="rnd-tag prof">'.concat(PROF[S.prof].name.toUpperCase(), "</span>") : "";
  const ck = c.cast || castOf(c.who), relTag = ck ? '<span class="rel-tag" title="'.concat(L("Отношение", "Relationship"), ": ").concat(relStore()[ck] || 0, '">').concat(hearts(relStore()[ck] || 0), "</span>") : "";
  const tools = S.mode === "career" && C ? '<div class="card-tools" id="ctools"></div>' : "";
  card.classList.toggle("sto-card", !!c.story);
  card.classList.toggle("gold-card", gold);
  card.innerHTML = '<div class="card-head">'.concat(portraitHtml(c.who), '<span class="who">').concat(esc(c.who), "</span>").concat(relTag).concat(tag, '</div><div class="text" aria-live="polite"><span class="sr">').concat(esc(c.who), ": </span>").concat(esc(c.text), "</div>").concat(tools, '<div class="stamp" aria-hidden="true"></div>');
  if (tools) cardTools();
  (_a2 = sfx.flick) == null ? void 0 : _a2.call(sfx);
  views.game.classList.toggle("pro", (prefs.gamesPlayed || 0) >= 2);
  const kind = slot.origin ? "rewind" : c.random ? "glitch" : S.step % PER_DAY === 0 && S.step > 0 ? "page" : null;
  card.style.transition = "none";
  card.style.transform = RM.matches || kind ? "" : "translateY(28px) scale(.95)";
  card.style.opacity = RM.matches || kind ? "" : "0";
  void card.offsetWidth;
  card.style.transition = RM.matches ? "none" : "transform .38s ".concat(EASE, ", opacity .38s, border-color .2s, box-shadow .2s");
  card.style.transform = "";
  card.style.opacity = "";
  FX.enter(card, kind);
  setPhase(PHASE_KEY[slotPh(S.step)]);
  $("btnL").innerHTML = '<span class="ar">←</span><span>'.concat(esc(c.answers.left.label), "</span>");
  $("btnR").innerHTML = "<span>".concat(esc(c.answers.right.label), '</span><span class="ar">→</span>');
  FX.clock(slot.time);
  $("gCareer").textContent = headerLine();
  const zs = S.season && SEASONS.find((z) => z.id === S.season);
  $("gType").textContent = S.type !== "normal" ? WEEK_TYPES[S.type].title : zs ? zs.title : "";
  $("gDay").textContent = dayName(d);
  $("gPhase").textContent = phaseName(slotPh(S.step)).toLowerCase();
  $("gNum").textContent = String(S.step + 1).padStart(2, "0");
  $("dots").innerHTML = S.deck.map((s, i) => '<i class="'.concat(i < S.step ? "done" : i === S.step ? "now" : "").concat(s.origin && i > S.step ? " chain" : "", '"></i>')).join("");
  clearPreview();
  $("btnL").classList.remove("tip");
  $("btnR").classList.remove("tip");
  hintOffer();
  deadlineBadges(c);
  answerWarn();
  deadlineOffer();
  if (S.step % PER_DAY === 0 && splashFor !== S.step) {
    splashFor = S.step;
    showSplash(d);
  }
  touchPlaying(d);
  coachFor(slot);
  answerTimerReset();
  fitGame();
}
function fitGame() {
  const g = views.game;
  if (g.hidden) return;
  g.classList.remove("tight", "tighter", "squeeze");
  fitCardText();
  const vh = () => {
    var _a2;
    return (document.documentElement.classList.contains("pwa") ? document.body.getBoundingClientRect().bottom : ((_a2 = window.visualViewport) == null ? void 0 : _a2.height) || innerHeight) - safeBottom();
  };
  const small = () => {
    var _a2;
    return parseFloat(((_a2 = $("card").querySelector(".text")) == null ? void 0 : _a2.style.fontSize) || 99) < 16;
  };
  const over = () => $("btnL").getBoundingClientRect().bottom > vh() - 2 || small();
  if (over()) {
    g.classList.add("tight");
    fitCardText();
  }
  if (over()) {
    g.classList.add("tighter");
    fitCardText();
  }
  const tx = $("card").querySelector(".text");
  if (tx && tx.scrollHeight > tx.clientHeight + 1) g.classList.add("squeeze");
}
let safeB = null;
function safeBottom() {
  if (safeB == null) {
    const pr = document.createElement("div");
    pr.style.cssText = "position:fixed;bottom:0;height:0;padding-bottom:env(safe-area-inset-bottom);visibility:hidden";
    document.body.append(pr);
    safeB = parseFloat(getComputedStyle(pr).paddingBottom) || 0;
    pr.remove();
  }
  return safeB;
}
addEventListener("orientationchange", () => {
  safeB = null;
  setTimeout(fitGame, 350);
});
addEventListener("pageshow", () => setTimeout(fitGame, 300));
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) setTimeout(fitGame, 300);
});
(_d = window.visualViewport) == null ? void 0 : _d.addEventListener("scroll", () => requestAnimationFrame(fitGame));
(_e = window.visualViewport) == null ? void 0 : _e.addEventListener("resize", () => requestAnimationFrame(fitGame));
function fitCardText() {
  var _a2;
  const t = (_a2 = $("card")) == null ? void 0 : _a2.querySelector(".text");
  if (!t) return;
  t.style.fontSize = "";
  let fs = parseFloat(getComputedStyle(t).fontSize);
  for (let i = 0; i < 24 && t.scrollHeight > t.clientHeight + 1 && fs > 14; i++) {
    fs -= 1;
    t.style.fontSize = fs + "px";
  }
}
addEventListener("resize", () => requestAnimationFrame(fitGame));
let fitQ = 0;
if (typeof MutationObserver !== "undefined") new MutationObserver(() => {
  if (!fitQ) fitQ = requestAnimationFrame(() => {
    fitQ = 0;
    fitGame();
  });
}).observe(views.game, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
let touchAt = 0, touchDay = -1;
function touchPlaying(d) {
  if (d === touchDay && Date.now() - touchAt < 3e4) return;
  touchDay = d;
  touchAt = Date.now();
  board.touch("playing", S.step).catch(() => {
  });
}
const COACH = [
  ["swipe", () => S.step === 0, L("Тяните карточку или наведите на ответ: ▲ и ▼ над шкалами покажут, что изменится. ▲▲ — сильный сдвиг.", "Drag the card or hover over an answer: ▲ and ▼ above the meters show what will change. ▲▲ means a big swing.")],
  ["zones", () => S.step >= 1, L("Держите шкалы между 20% и 80%. Ниже 20% — «на грани», выше 80% — «перегрев»: и 0%, и 100% заканчивают неделю.", "Keep the meters between 20% and 80%. Below 20% you’re “on the edge”, above 80% it’s “overheat” — hit 0% or 100% and your week is over.")],
  ["items", () => S.step >= 2 && S.items.length, () => L("В сумке ".concat(S.items.map((i) => ITEMS[i].name).join(", "), ": предмет сам отменит один удар −10 и сильнее по своей шкале. Значок ◆ — удар погасит предмет."), "In your bag: ".concat(S.items.map((i) => ITEMS[i].name).join(", "), ". Each item automatically blocks one hit of −10 or worse to its meter. A ◆ means an item will absorb the hit."))],
  ["chain", (slot) => slot.origin, L("Карточка со стрелкой ← — последствие вашего прошлого решения. Решения возвращаются.", "A card with a ← arrow is the fallout of an earlier decision. Choices come back to bite.")],
  ["hide", () => WEEK_TYPES[S.type].rules.hideBoss, L("На этой неделе настроение Босса скрыто: вместо стрелок — «?».", "This week the Boss’s mood is hidden: you get a “?” instead of arrows.")]
];
function coachFor(slot) {
  const el = $("coach"), seen = prefs.coach || (prefs.coach = []);
  el.hidden = true;
  if (seen.length >= COACH.length || (prefs.gamesPlayed || 0) >= 3) return;
  const h = COACH.find(([k, when]) => !seen.includes(k) && when(slot));
  if (!h) return;
  seen.push(h[0]);
  store.set(KEY.prefs, prefs);
  el.innerHTML = "<b>".concat(L("Подсказка", "Tip"), "</b> ").concat(esc(typeof h[2] === "function" ? h[2]() : h[2]), '<button type="button" aria-label="').concat(L("Скрыть подсказку", "Hide tip"), '">×</button>');
  el.hidden = false;
  el.querySelector("button").onclick = () => {
    el.hidden = true;
  };
}
function showSplash(d) {
  const el = $("splash"), T = WEEK_TYPES[S.type];
  const top = S.mode === "career" && C ? L("Неделя ".concat(C.week, " из ").concat(YEAR, " · "), "Week ".concat(C.week, " of ").concat(YEAR, " · ")) : S.mode === "daily" ? "".concat(L("Неделя дня", "Daily Week"), " ").concat(dayLabel(S.day), " · ") : S.mode === "tour" ? L("Турнир офиса · ", "Office Tournament · ") : "";
  const zs = S.season && SEASONS.find((z) => z.id === S.season);
  const extra = d === 0 ? '<div class="splash-week">'.concat(S.mode === "pack" ? esc(PACK.intro) : S.mode === "tour" ? "<b>".concat(L("Турнир офиса «".concat(esc(S.tourTeam), "»"), "Office Tournament “".concat(esc(S.tourTeam), "”")), "</b><span>").concat(L("Одна неделя для всех участников. В зачёт — первая попытка.", "Same week for everyone. Only your first attempt counts."), "</span>") : zs && S.type === "normal" ? "<b>".concat(zs.title, "</b><span>").concat(zs.rule, "</span>") : "<b>".concat(T.title, "</b>").concat(S.type !== "normal" ? "<span>".concat(T.rule, "</span>") : ""), '\n    <span class="splash-items">').concat(L("В сумке: ".concat(S.items.map((i) => ITEMS[i].name).join(", "), " — ").concat(S.items.length > 1 ? "каждый отменит" : "отменит", " один сильный удар по своей шкале."), "In your bag: ".concat(S.items.map((i) => ITEMS[i].name).join(", "), " — ").concat(S.items.length > 1 ? "each one blocks" : "blocks", " one big hit to its meter.")), "</span></div>") : "";
  el.innerHTML = '<div class="splash-in"><small>'.concat(top).concat(L("День ".concat(d + 1, " из 5"), "Day ".concat(d + 1, " of 5")), "</small><h2>").concat(dayName(d), "</h2><p>").concat(DAY_QUIP[d], "</p>").concat(d ? "" : '<span class="splash-theme">🎨 '.concat(L("Цвета недели: «".concat(applyTheme().name, "»"), "This week’s colors: “".concat(applyTheme().name, "”")), "</span>")).concat(extra, '<span class="tap">').concat(d ? "" : L("нажмите или смахните, чтобы начать", "tap or swipe to start"), "</span></div>");
  el.classList.toggle("mini", d > 0);
  el.hidden = false;
  splashOn = d === 0;
  clearTimeout(splashT);
  const close = () => {
    splashOn = false;
    el.hidden = true;
    clearTimeout(splashT);
  };
  splashT = setTimeout(close, d === 0 ? 4200 : 1800);
  el.onclick = el.onpointerdown = close;
}
let splashT = 0;
const current = () => byId[S.deck[S.step].id];
function effectsOf(side) {
  var _a2;
  const rules = WEEK_TYPES[S.type].rules, raw = current().answers[side].effects, eff = {}, blocked = [];
  const free = S.items.filter((i) => !S.used.includes(i)), D = S.mode === "career" && DIFF[S.diff];
  for (const r of RES) {
    let v = raw[r.k] || 0;
    if (r.k === "boss" && rules.bossMul) v = Math.round(v * rules.bossMul / 5) * 5;
    if (r.k === "psyche" && v < 0 && rules.psycheNegMul) v = Math.round(v * rules.psycheNegMul / 5) * 5;
    if (D && v < 0) {
      const LV = LEVELS[S.lvl || 1] || {};
      v = Math.max(Math.max(D.cap, (_a2 = LV.cap) != null ? _a2 : -30), Math.round(v * D.neg * (LV.neg || 1)));
    }
    if (D && v > 0) {
      const LV = LEVELS[S.lvl || 1] || {};
      if (LV.posCap) v = Math.min(LV.posCap, Math.round(v * (LV.pos || 1)));
    }
    if ((D == null ? void 0 : D.edge) && v && (S.res[r.k] + v >= 85 || S.res[r.k] + v <= 15)) v = Math.round(v / 2);
    const item = v <= -10 && free.find((i) => ITEMS[i].stat === r.k && !blocked.some((b) => b.item === i));
    if (item) blocked.push({ item, stat: r.k, v });
    eff[r.k] = item ? 0 : v;
  }
  return { eff, blocked };
}
function preview(side) {
  const { eff, blocked } = effectsOf(side), hide = WEEK_TYPES[S.type].rules.hideBoss;
  for (const r of RES) {
    const v = eff[r.k], m = $("mk-" + r.k);
    if (blocked.some((b) => b.stat === r.k)) m.innerHTML = '<span class="s" title="'.concat(L("Удар погасит предмет", "An item will block this hit"), '">◆</span>');
    else if (hide && r.k === "boss" && (current().answers[side].effects.boss || 0)) m.innerHTML = '<span class="q">?</span>';
    else m.innerHTML = v > 0 ? '<span class="u">'.concat(v >= 20 ? "▲▲" : "▲", "</span>") : v < 0 ? '<span class="d">'.concat(v <= -20 ? "▼▼" : "▼", "</span>") : "";
  }
  $("card").dataset.hot = side;
  $("btnL").classList.toggle("hot", side === "left");
  $("btnR").classList.toggle("hot", side === "right");
  FX.stamp(side, 0.4);
  setMood(document.querySelector("#card .face"), speakerMood(current(), eff, side));
}
function clearPreview() {
  for (const r of RES) $("mk-" + r.k).innerHTML = "";
  delete $("card").dataset.hot;
  $("btnL").classList.remove("hot");
  $("btnR").classList.remove("hot");
  FX.stamp(null);
  setMood(document.querySelector("#card .face"), "neutral");
}
function speakerMood(c, eff, side) {
  if (c.cast) {
    const d = c.answers[side].rel || 0;
    return d > 0 ? "happy" : d < 0 ? "angry" : "neutral";
  }
  const [g, stat] = reactionGroup(c.who), v = eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0);
  return moodFor(v, g === "boss" || g === "client" || g === "hr");
}
function reactionGroup(who) {
  if (castOf(who)) return ["colleagues", "colleagues"];
  if (new RegExp("босс|директор|boss|director|ceo|cfo|cto|chief|(?<!office )manager|management|executive|supervisor", "i").test(who)) return ["boss", "boss"];
  if (/\bhr\b|кадр|офис-менеджер|recruit|human resources|personnel|office manager|people ops|talent/i.test(who)) return ["hr", "boss"];
  if (/клиент|налогов|client|customer|tax|\birs\b|partner|investor/i.test(who)) return ["client", "boss"];
  if (/коллег|чат|созвон|курьер|джун|отдел|бухгалтер|именин|colleague|coworker|co-worker|team|chat|call|zoom|courier|delivery|intern|junior|department|dept|accountant|accounting|birthday/i.test(who)) return ["colleagues", "colleagues"];
  return ["self", "psyche"];
}
function react(card, eff, side) {
  var _a2, _b2;
  const note = (_b2 = (_a2 = card.answers) == null ? void 0 : _a2[side]) == null ? void 0 : _b2.note;
  if (note) {
    const ok = card.correct ? card.correct === side : null, el2 = $("react");
    if (card.correct) {
      S.flags.obTotal = (S.flags.obTotal || 0) + 1;
      if (ok) S.flags.obOk = (S.flags.obOk || 0) + 1;
    }
    el2.style.setProperty("--rc", ok === false ? "#ff3b6b" : "#d4ff3a");
    el2.innerHTML = "<b>".concat(ok === false ? L("Не совсем.", "Not quite.") : L("Как у нас принято.", "That’s how we do it here."), "</b> ").concat(esc(note.replace(/^(Верно|Так не надо|Это фишинг|Correct|Right|Not like this|Don't do this|Don’t do this|That's phishing|That’s phishing|This is phishing)[:.]\s*/, "")));
    el2.classList.remove("on", "long");
    void el2.offsetWidth;
    el2.classList.add("on", "long");
    return;
  }
  const [g, stat] = reactionGroup(card.who), R = REACTIONS[g];
  const v = eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0);
  const mood = (v >= 0 ? "pos" : "neg") + (Math.abs(v) >= 20 && R[(v >= 0 ? "pos" : "neg") + "Big"] ? "Big" : "");
  const el = $("react");
  el.style.setProperty("--rc", R.color);
  el.innerHTML = "".concat(portraitHtml(card.who, "mini"), "<span><b>").concat(g === "self" ? R.name : esc(card.who), "</b> ").concat(esc(rnd(R[mood])), "</span>");
  setMood(el.querySelector(".face"), speakerMood(card, eff, side));
  el.classList.remove("on");
  void el.offsetWidth;
  el.classList.add("on");
}
function choose(side, sure) {
  var _a2;
  if (busy || splashOn || !S) return;
  if (!sure && !prefs.dzNoAsk && dzRisk(side).length && $("modal").hidden) return dzConfirm(side);
  busy = true;
  (_a2 = sfx.swipe) == null ? void 0 : _a2.call(sfx);
  sfx.stapler();
  buzz("tap");
  const card = $("card"), dir = side === "left" ? -1 : 1, c = current();
  card.style.transition = RM.matches ? "opacity .12s" : "transform .38s ".concat(EASE, ", opacity .38s");
  if (!RM.matches) card.style.transform = "translateX(".concat(dir * 1100, "px) rotate(").concat(dir * 26, "deg)");
  card.style.opacity = "0";
  $("coach").hidden = true;
  setTimeout(() => {
    var _a3, _b2;
    const { eff, blocked } = effectsOf(side);
    for (const b of blocked) {
      S.used.push(b.item);
      toast(L("".concat(ITEMS[b.item].name, ": удар по шкале «").concat(resName(b.stat), "» отменён"), "".concat(ITEMS[b.item].name, ": hit to ").concat(resName(b.stat), " blocked")));
      sfx.item();
      FX.shield(ITEMS[b.item].name, b.stat);
    }
    for (const [k, v] of Object.entries(eff)) S.res[k] = clamp(S.res[k] + v);
    if (S.training) for (const r of RES) S.res[r.k] = Math.max(10, Math.min(90, S.res[r.k]));
    if (Object.values(eff).some((v) => v <= -15)) sfx.sigh();
    if (RES.some((r) => S.res[r.k] <= 15 || S.res[r.k] >= 85)) buzz("danger");
    if (c.id === "rnd_cake" && side === "right") S.flags.cake = true;
    const ch = CHAINS.find((x) => x.from === c.id && x.side === side), at = ch && slotOf(ch.at.day, ch.at.phase);
    if (ch && at > S.step && !S.deck[at].story) S.deck[at] = { id: ch.card.id, time: slotTime(at), fixed: true, origin: ch.origin };
    const pc = POOL_CHAINS.find((x) => x.from === c.id && x.side === side), pat = pc && Math.min(WEEK_LEN - 1, S.step + Math.round(pc.after * PER_DAY / 3));
    if (pc && pat > S.step && !S.deck[pat].origin && !S.deck[pat].story) S.deck[pat] = { id: pc.card.id, time: slotTime(pat), fixed: true, origin: pc.origin };
    clearPreview();
    renderBars();
    react(c, eff, side);
    FX.stats(eff);
    castAfter(c, side, eff);
    livePick(c, side);
    deadlineWork(c, side);
    bus.emit("answer", { card: c, side, eff });
    let deadLow = RES.find((r) => S.res[r.k] <= 0), deadHigh = RES.find((r) => S.res[r.k] >= 100), dead = deadLow || deadHigh;
    if (dead && S.mode === "career" && (((_a3 = DIFF[S.diff]) == null ? void 0 : _a3.save) || ((_b2 = LEVELS[S.lvl || 1]) == null ? void 0 : _b2.save)) && !S.coffeeUsed) {
      S.coffeeUsed = true;
      S.res[dead.k] = deadLow ? 5 : 95;
      renderBars();
      sfx.item();
      toast(L("☕ Вас спас кофе — ещё шанс. «".concat(dead.name, "» держится на ").concat(S.res[dead.k], "%"), "☕ Coffee saved you — one more chance. ".concat(dead.name, " holds at ").concat(S.res[dead.k], "%")));
      deadLow = deadHigh = dead = null;
    }
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    if (dead) FX.finale(dead.k, !deadLow);
    const pause = FX.off ? 650 : 1150;
    if (dead && !S.chanceUsed && QUIZ.length) {
      setTimeout(() => secondChance(dead.k, !deadLow), pause);
      return;
    }
    if (dead) {
      best.step = Math.max(best.step, S.step);
      store.set(KEY.best, best);
      store.del(KEY.save);
      const fire = () => lose(dead.k, !deadLow);
      setTimeout(() => adRescue(dead.k, !deadLow, () => {
        var _a4;
        if (!((_a4 = window.groupOffer) == null ? void 0 : _a4.call(window, fire))) fire();
      }), pause);
      return;
    }
    advance();
  }, RM.matches ? 120 : 380);
}
const DEADLINE_TIERS = [
  { days: 0, need: 4, reward: 6, fine: 4, name: L("срочный", "urgent") },
  { days: 1, need: 9, reward: 10, fine: 5, name: L("короткий", "short") },
  { days: 2, need: 13, reward: 15, fine: 8, name: L("средний", "medium") },
  { days: 3, need: 18, reward: 24, fine: 12, name: L("крупный", "big") }
];
const DEADLINE_TASKS = EN ? [
  ["Boss", "Quarterly report"],
  ["Client", "Landing page for the launch"],
  ["CEO", "Investor pitch deck"],
  ["Accounting", "Close out the expense reports"],
  ["HR", "Onboarding plan for the new hires"],
  ["Sales", "Proposal for a big client"],
  ["Marketing", "Newsletter for the big sale"],
  ["IT", "Migrate the old spreadsheets"],
  ["Partner", "Contract with all the redlines"],
  ["Boss", "Summary for the board"],
  ["Client", "One more “tiny” change"],
  ["Project manager", "Plan for next quarter"]
] : [
  ["Босс", "Квартальный отчёт"],
  ["Клиент", "Лендинг к запуску"],
  ["Генеральный", "Презентация для инвесторов"],
  ["Бухгалтерия", "Закрыть авансовые отчёты"],
  ["HR", "План онбординга для новичков"],
  ["Отдел продаж", "КП для крупного клиента"],
  ["Маркетинг", "Рассылка к распродаже"],
  ["IT", "Переезд старых таблиц"],
  ["Партнёр", "Договор со всеми правками"],
  ["Босс", "Сводка для совета директоров"],
  ["Клиент", "Ещё одна «маленькая» правка"],
  ["Менеджер проекта", "План на следующий квартал"]
];
const workAnswer = (c, side) => {
  var _a2, _b2;
  const e = ((_b2 = (_a2 = c == null ? void 0 : c.answers) == null ? void 0 : _a2[side]) == null ? void 0 : _b2.effects) || {};
  return (e.boss || 0) > 0 || (e.energy || 0) < 0;
};
const dueText = (d) => L("до ".concat(["понедельника", "вторника", "среды", "четверга", "пятницы"][d], ", 18:00"), "by ".concat(dayName(d), ", 6 PM"));
function deadlineBadges(c) {
  var _a2;
  for (const [side, id] of [["left", "btnL"], ["right", "btnR"]]) {
    (_a2 = $(id).querySelector(".dl-badge")) == null ? void 0 : _a2.remove();
    if ((S == null ? void 0 : S.deadline) && workAnswer(c, side)) $(id).insertAdjacentHTML("beforeend", '<span class="dl-badge" title="'.concat(L("Этот ответ засчитается в задачу", "This answer counts toward your task"), '">📋 ').concat(L("в задачу", "counts"), "</span>"));
  }
  renderDeadlineChip();
}
function answerWarn() {
  var _a2, _b2;
  if (!((_a2 = S == null ? void 0 : S.deck) == null ? void 0 : _a2[S.step])) return;
  const hide = WEEK_TYPES[S.type].rules.hideBoss;
  for (const [side, id] of [["left", "btnL"], ["right", "btnR"]]) {
    const b = $(id), { eff } = effectsOf(side);
    (_b2 = b.querySelector(".dz-badge")) == null ? void 0 : _b2.remove();
    const bad = RES.filter((r) => !(hide && r.k === "boss") && (S.res[r.k] <= 20 && eff[r.k] < 0 || S.res[r.k] >= 80 && eff[r.k] > 0));
    b.classList.toggle("dz", bad.length > 0);
    if (!bad.length) continue;
    const why = bad.map((r) => "".concat(r.name, " ").concat(S.res[r.k] <= 20 ? L("ближе к 0%", "closer to 0%") : L("ближе к 100%", "closer to 100%"))).join(", ");
    const one = bad[0], low = S.res[one.k] <= 20;
    const label = bad.length > 1 ? L("".concat(bad.length, " шкалы к краю"), "".concat(bad.length, " meters near the edge")) : "".concat(one.name, " ").concat(low ? L("▼ к 0%", "▼ to 0%") : L("▲ к 100%", "▲ to 100%"));
    b.insertAdjacentHTML("beforeend", '<span class="dz-badge" role="button" tabindex="-1" title="'.concat(esc(why), '"><span aria-hidden="true">⚠ </span>').concat(label, '<span class="sr">: ').concat(esc(why), "</span></span>"));
    const badge = b.querySelector(".dz-badge");
    const stop = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };
    badge.addEventListener("pointerdown", (e) => e.stopPropagation());
    badge.addEventListener("click", (e) => {
      stop(e);
      dzExplain(why);
    });
    dzFirstTip();
  }
}
const dzText = () => L("⚠ на ответе: эта шкала уже у края, а ответ толкает её ещё ближе. 0% или 100% — конец недели.", "⚠ on an answer: this meter is already near the edge and the answer pushes it further. 0% or 100% ends the week.");
function dzExplain(why) {
  toast("".concat(dzText()).concat(why ? " (".concat(why, ")") : ""));
}
function dzRisk(side) {
  var _a2;
  if (!((_a2 = S == null ? void 0 : S.deck) == null ? void 0 : _a2[S.step])) return [];
  const hide = WEEK_TYPES[S.type].rules.hideBoss, { eff } = effectsOf(side);
  return RES.filter((r) => !(hide && r.k === "boss") && (S.res[r.k] <= 20 && eff[r.k] < 0 || S.res[r.k] >= 80 && eff[r.k] > 0));
}
function dzConfirm(side) {
  const bad = dzRisk(side), m = $("modal"), card = $("card");
  const back = () => {
    if (card) {
      card.style.transition = "transform .3s ".concat(EASE, ", opacity .2s");
      card.style.transform = "";
      card.style.opacity = "";
      card.classList.add("idle");
    }
    clearPreview();
  };
  const lines = bad.map((r) => {
    const low = S.res[r.k] <= 20;
    return "<li><b>".concat(esc(r.name), "</b> — ").concat(L("сейчас", "now"), " ").concat(S.res[r.k], "%, ").concat(low ? L("ответ опустит ещё ниже ▼", "this answer pushes it lower ▼") : L("ответ поднимет ещё выше ▲", "this answer pushes it higher ▲"), "</li>");
  }).join("");
  m.innerHTML = '<div class="modal-box glass cert-box dz-box" role="alertdialog" aria-modal="true" aria-labelledby="dzTitle"><span class="lvl-ico" aria-hidden="true">⚠️</span>\n    <h2 id="dzTitle">'.concat(L(bad.length > 1 ? "Опасный ответ для шкал" : "Опасный ответ для шкалы «".concat(esc(bad[0].name), "»"), bad.length > 1 ? "Risky answer for your meters" : "Risky answer for ".concat(esc(bad[0].name))), '</h2>\n    <ul class="dz-list">').concat(lines, '</ul>\n    <p class="dz-note">').concat(L("0% или 100% — конец недели. Вы уверены?", "0% or 100% ends the week. Are you sure?"), '</p>\n    <div class="row2"><button class="btn-ghost" type="button" id="dzNo">').concat(L("Нет, подумаю", "No, let me think"), '</button><button class="btn-main" type="button" id="dzYes">').concat(L("Да, отвечаю", "Yes, go"), '</button></div>\n    <label class="dz-skip"><input type="checkbox" id="dzSkip"> ').concat(L("Больше не спрашивать", "Don’t ask again"), "</label></div>");
  m.hidden = false;
  $("dzNo").focus();
  const close = () => {
    var _a2;
    if ((_a2 = $("dzSkip")) == null ? void 0 : _a2.checked) {
      prefs.dzNoAsk = true;
      store.set(KEY.prefs, prefs);
      toast(L("Хорошо, больше не спрашиваем. Вернуть — в профиле: «Спрашивать перед опасным ответом».", "Okay, no more questions. Turn it back on in your profile."));
      if ($("dzAsk")) $("dzAsk").checked = false;
    }
    m.hidden = true;
    m.innerHTML = "";
  };
  $("dzYes").onclick = () => {
    close();
    track("dz_confirm", { detail: bad.map((r) => r.k).join(",") });
    choose(side, true);
  };
  $("dzNo").onclick = () => {
    close();
    back();
    track("dz_cancel", { detail: bad.map((r) => r.k).join(",") });
  };
  m.onclick = (e) => {
    if (e.target === m) {
      close();
      back();
    }
  };
}
(() => {
  const cb = $("dzAsk");
  if (!cb) return;
  const sync = () => {
    cb.checked = !prefs.dzNoAsk;
  };
  sync();
  bus.on("menu", sync);
  cb.onchange = () => {
    prefs.dzNoAsk = !cb.checked;
    store.set(KEY.prefs, prefs);
    toast(cb.checked ? L("Будем спрашивать перед опасным ответом", "We’ll ask before a risky answer") : L("Больше не спрашиваем — метка ⚠ на ответах останется", "No more questions — the ⚠ badge stays on answers"));
  };
})();
function dzFirstTip() {
  if (prefs.dzTip) return;
  prefs.dzTip = 1;
  store.set(KEY.prefs, prefs);
  setTimeout(() => toast(dzText()), 700);
}
function renderDeadlineChip() {
  const el = $("dlBar"), d = (S == null ? void 0 : S.mode) === "career" && S.deadline;
  $("dlChip").hidden = true;
  el.hidden = !d;
  if (!d) return;
  const c = current(), l = workAnswer(c, "left"), r = workAnswer(c, "right");
  const here = l && r ? L("тут засчитаются оба ответа", "both answers count here") : l ? L("← в задачу засчитается левый ответ", "← the left answer counts") : r ? L("в задачу засчитается правый ответ →", "the right answer counts →") : L("на этой карточке рабочего ответа нет", "no work answer on this card");
  el.innerHTML = '<span class="dl-top"><b>📋 '.concat(esc(d.title), '</b><span class="dl-n">').concat(d.got, "/").concat(d.need, '</span><span class="dl-due">').concat(dueText(d.due), '</span></span>\n    <span class="dl-prog"><i style="width:').concat(Math.round(d.got / d.need * 100), '%"></i></span>');
  el.title = here;
  el.onclick = () => toast(L(
    "".concat(here, ". «").concat(d.title, "» (").concat(d.who, "): ещё ").concat(d.need - d.got, " отв. со значком 📋 ").concat(dueText(d.due), ". Успеете — +").concat(money(d.reward), ", нет — −").concat(money(d.fine)),
    "".concat(here, ". “").concat(d.title, "” (").concat(d.who, "): ").concat(d.need - d.got, " more 📋 answers ").concat(dueText(d.due), ". Make it — +").concat(money(d.reward), ", miss it — −").concat(money(d.fine))
  ));
}
function deadlineOffer() {
  if (!((S == null ? void 0 : S.mode) === "career" && C) || S.deadline || S.step % PER_DAY || S.dlAsked === S.step || (S.dlOffers || 0) >= 2) return;
  S.dlAsked = S.step;
  const day = S.step / PER_DAY, rnd2 = Math.random;
  if (!S.forceDeadline && rnd2() > (S.step ? 0.4 : 0.25)) return;
  S.forceDeadline = false;
  const tiers = DEADLINE_TIERS.filter((t2) => day + t2.days <= 4), t = tiers[Math.floor(rnd2() * tiers.length)];
  const [who, title] = t.days ? DEADLINE_TASKS[Math.floor(rnd2() * (DEADLINE_TASKS.length - 1))] : DEADLINE_TASKS[10];
  S.dlOffers = (S.dlOffers || 0) + 1;
  setTimeout(() => {
    if (S && !busy && !views.game.hidden && S.step === day * PER_DAY) showDeadlineOffer({ who, title, need: t.need, got: 0, due: day + t.days, reward: t.reward, fine: t.fine, tier: t.name });
  }, splashOn ? 4600 : 2100);
}
function showDeadlineOffer(d) {
  var _a2;
  const m = $("modal");
  if (!m.hidden) return;
  m.innerHTML = '<div class="modal-box glass dl-box" role="dialog" aria-modal="true" aria-labelledby="dlTitle">\n    <span class="dl-kicker">📋 '.concat(L("Дедлайн", "Deadline"), " · ").concat(d.tier, " · ").concat(L("от", "from"), ": ").concat(esc(d.who), '</span>\n    <h2 id="dlTitle">').concat(esc(d.title), '</h2>\n    <ol class="dl-how">').concat(L(
    '<li>Отвечайте на карточки как обычно.</li><li>На «рабочих» ответах — взяться, задержаться, помочь Боссу — будет значок <span class="nowrap">📋 в задачу</span>.</li><li>Выберите <b>'.concat(d.need, " таких ответов ").concat(dueText(d.due), "</b> — счётчик над карточкой.</li>"),
    '<li>Answer cards as usual.</li><li>“Work” answers — take it on, stay late, help the Boss — carry a <span class="nowrap">📋 counts</span> badge.</li><li>Pick <b>'.concat(d.need, " of those ").concat(dueText(d.due), "</b> — the counter is above the card.</li>")
  ), '</ol>\n    <p class="dl-warn">').concat(L("Рабочие ответы стоят сил и нервов — следите за шкалами.", "Work answers cost energy and nerves — watch your meters."), '</p>\n    <div class="money"><div><b>+').concat(money(d.reward), "</b><span>").concat(L("премия, если успеете", "bonus if you make it"), "</span></div><div><b>−").concat(money(d.fine), "</b><span>").concat(L("штраф, если сорвёте", "penalty if you miss it"), '</span></div></div>\n    <div class="row2"><button class="btn-main" type="button" id="dlYes">').concat(L("Взять задачу", "Take it on"), '</button><button class="btn-ghost" type="button" id="dlNo">').concat(L("Отказаться", "Decline"), "</button></div></div>");
  m.hidden = false;
  (_a2 = sfx.item) == null ? void 0 : _a2.call(sfx);
  $("dlYes").onclick = () => {
    m.hidden = true;
    S.deadline = d;
    S.dlTaken = (S.dlTaken || 0) + 1;
    store.set(KEY.save, S);
    deadlineBadges(current());
    toast(L("Задача взята: «".concat(d.title, "» — ").concat(d.need, " раб. решений ").concat(dueText(d.due)), "Task accepted: “".concat(d.title, "” — ").concat(d.need, " work decisions ").concat(dueText(d.due))));
  };
  $("dlNo").onclick = () => {
    m.hidden = true;
    toast(L("Вы отказались. «".concat(d.title, "» отдали Олегу"), "You passed. “".concat(d.title, "” went to Oleg")));
  };
}
function deadlineWork(c, side) {
  const d = S == null ? void 0 : S.deadline;
  if (!d || !workAnswer(c, side)) return;
  d.got++;
  if (d.got < d.need) {
    toast(L("📋 +1 к задаче «".concat(d.title, "»: ").concat(d.got, " из ").concat(d.need), "📋 +1 to “".concat(d.title, "”: ").concat(d.got, " of ").concat(d.need)));
    renderDeadlineChip();
    return;
  }
  S.deadline = null;
  S.dlWon = (S.dlWon || 0) + 1;
  bus.emit("deadlineDone", d);
  d.reward = Math.round(d.reward * (1 + (typeof rankPerk === "function" ? rankPerk("deadline") : 0)));
  pay(d.reward);
  S.earned = (S.earned || 0) + d.reward;
  renderBars();
  renderDeadlineChip();
  FX.coin(d.reward);
  sfx.coins();
  setTimeout(() => adDouble(d.reward, L("Премия за задачу", "Task bonus")), 3600);
  smsPop(L("Банк", "Bank"), L("Премия за «".concat(d.title, "»: +").concat(money(d.reward), " · баланс ").concat(money(C.bank)), "Bonus for “".concat(d.title, "”: +").concat(money(d.reward), " · balance ").concat(money(C.bank))));
}
function deadlineDue(day) {
  const d = S == null ? void 0 : S.deadline;
  if (!d || day < d.due) return;
  S.deadline = null;
  S.dlLost = (S.dlLost || 0) + 1;
  C.bank -= d.fine;
  C.spent = (C.spent || 0) + d.fine;
  saveCareer();
  renderBars();
  renderDeadlineChip();
  setTimeout(() => {
    var _a2;
    (_a2 = sfx.sigh) == null ? void 0 : _a2.call(sfx);
    buzz("danger");
    smsPop(L("Банк", "Bank"), L(
      "Штраф за сорванный дедлайн «".concat(d.title, "» (").concat(d.got, "/").concat(d.need, "): −").concat(money(d.fine), " · баланс ").concat(money(C.bank)),
      "Penalty for missing “".concat(d.title, "” (").concat(d.got, "/").concat(d.need, "): −").concat(money(d.fine), " · balance ").concat(money(C.bank))
    ));
  }, 3600);
}
let smsT = 0;
function smsPop(from, text) {
  const el = $("smsPop");
  el.innerHTML = '<span class="sms-ico" aria-hidden="true">🏦</span><span class="sms-body"><b>'.concat(esc(from), "</b><small>").concat(L("сейчас", "now"), "</small><span>").concat(esc(text), "</span></span>");
  el.hidden = false;
  el.classList.remove("on");
  void el.offsetWidth;
  el.classList.add("on");
  setTimeout(() => sfx.sms(), 350);
  clearTimeout(smsT);
  smsT = setTimeout(() => {
    el.hidden = true;
  }, 3400);
  el.onclick = () => {
    el.hidden = true;
  };
}
function advance() {
  const best = store.get(KEY.best, { step: 0, wins: 0 });
  S.step++;
  if (S.mode === "career" && C && S.step % PER_DAY === 0) {
    const sal = C.salary + (typeof rankPerk === "function" ? rankPerk("salary") : 0);
    pay(sal);
    S.earned = (S.earned || 0) + sal;
    renderBars();
    FX.coin(sal);
    sfx.coins();
    smsPop(L("Банк", "Bank"), L(
      "Зачислена зарплата за ".concat(["понедельник", "вторник", "среду", "четверг", "пятницу"][S.step / PER_DAY - 1], ": +").concat(money(sal), " · баланс ").concat(money(C.bank)),
      "".concat(dayName(S.step / PER_DAY - 1), " salary deposited: +").concat(money(sal), " · balance ").concat(money(C.bank))
    ));
    deadlineDue(S.step / PER_DAY - 1);
  }
  best.step = Math.max(best.step, S.step);
  if (S.step >= WEEK_LEN) {
    best.wins++;
    store.set(KEY.best, best);
    store.del(KEY.save);
    setTimeout(win, 550);
    return;
  }
  store.set(KEY.best, best);
  if (S.mode === "career") store.set(KEY.save, S);
  renderCard();
  busy = false;
}
const SHOP = { coffee: 6, headphones: 6, cookies: 6, sicknote: 9 };
const powerPrice = () => 12 * 2 ** (S.powerBuys || 0);
function openShop() {
  if (!needReg("shop")) return;
  if (!((S == null ? void 0 : S.mode) === "career" && C) || busy || splashOn) return;
  const m = $("modal");
  const render = () => {
    m.innerHTML = '<div class="modal-box glass shop-box" role="dialog" aria-modal="true" aria-labelledby="shopTitle">\n      <h2 id="shopTitle">'.concat(L("Магазин мощей", "Power Shop"), '</h2>\n      <p class="shop-bal">').concat(L("На счёте", "Balance"), ": <b>").concat(money(C.bank), "</b> · ").concat(L("оклад ".concat(money(C.salary), "/день"), "pay ".concat(money(C.salary), "/day")), " ").concat(topupBtn(0, "shop"), " ").concat(adChip(), '</p>\n      <span class="shop-sec">').concat(L("Предметы — гасят один удар −10 и сильнее", "Items — each blocks one hit of −10 or worse"), '</span>\n      <div class="shop-list">').concat(Object.entries(SHOP).map(([id, price]) => '<button class="shop-item'.concat(C.bank < price ? " short" : "", '" data-item="').concat(id, '" ').concat(S.items.length >= 6 ? "disabled" : "", " ").concat(C.bank < price ? 'data-topup="'.concat(lackOf(price), '" data-topup-back="shop"') : "", ">\n        <b>").concat(ITEMS[id].name, "</b><small>").concat(ITEMS[id].text, '</small><span class="price">').concat(C.bank < price ? "💰 ".concat(L("не хватает", "short"), " ").concat(lackOf(price)) : money(price), "</span></button>")).join(""), '</div>\n      <span class="shop-sec">').concat(L("Мощь +20% — шкала отходит от края на 20 пунктов", "Power +20% — pulls a meter 20 points back from the edge"), '</span>\n      <div class="shop-list">').concat(RES.map((r) => '<button class="shop-item'.concat(C.bank < powerPrice() ? " short" : "", '" data-power="').concat(r.k, '" ').concat(Math.abs(S.res[r.k] - 50) < 5 ? "disabled" : "", " ").concat(C.bank < powerPrice() ? 'data-topup="'.concat(lackOf(powerPrice()), '" data-topup-back="shop"') : "", ">\n        <b>").concat(r.name, " ").concat(S.res[r.k], "% → ").concat(S.res[r.k] > 50 ? Math.max(50, S.res[r.k] - 20) : Math.min(50, S.res[r.k] + 20), '%</b><span class="price">').concat(C.bank < powerPrice() ? "💰 ".concat(L("не хватает", "short"), " ").concat(lackOf(powerPrice())) : money(powerPrice()), "</span></button>")).join(""), '</div>\n      <span class="shop-sec">').concat(L("Банк", "Bank"), '</span>\n      <div class="shop-list"><button class="shop-item" id="loanBtn" ').concat(C.loan ? "disabled" : "", "><b>").concat(L("Кредит +20 у.е.", "Loan +$20"), "</b><small>").concat(C.loan ? L("осталось вернуть ".concat(C.loan, " у.е."), "$".concat(C.loan, " left to repay")) : L("вернуть 24 у.е. — по 6 в неделю", "repay $24 — $6 a week"), '</small><span class="price">').concat(L("сразу на счёт", "cash right now"), '</span></button></div>\n      <p class="field-note">').concat(L("Каждая следующая «мощь» на этой неделе вдвое дороже. Каждую неделю списываются расходы на жильё и еду — 4 у.е. Хотите оклад выше — сдайте 📜 аттестацию.", "Each extra “power” this week costs twice as much. Every week, rent and food cost $4. Want a raise? Pass the 📜 certification."), '</p>\n      <button class="btn-ghost" id="shopClose">').concat(L("Закрыть", "Close"), "</button></div>");
    m.querySelectorAll("[data-item]").forEach((b) => b.onclick = () => {
      const id = b.dataset.item;
      if (C.bank < SHOP[id]) return;
      C.bank -= SHOP[id];
      S.items.push(id);
      saveCareer();
      store.set(KEY.save, S);
      sfx.item();
      bus.emit("buy", id);
      toast(L("Куплено: ".concat(ITEMS[id].name), "Bought: ".concat(ITEMS[id].name)));
      renderBars();
      render();
    });
    m.querySelectorAll("[data-power]").forEach((b) => b.onclick = () => {
      const k = b.dataset.power, v = S.res[k];
      if (C.bank < powerPrice()) return;
      C.bank -= powerPrice();
      S.powerBuys = (S.powerBuys || 0) + 1;
      S.res[k] = v > 50 ? Math.max(50, v - 20) : Math.min(50, v + 20);
      saveCareer();
      store.set(KEY.save, S);
      sfx.item();
      toast(L("«".concat(resName(k), "»: ").concat(v, "% → ").concat(S.res[k], "%"), "".concat(resName(k), ": ").concat(v, "% → ").concat(S.res[k], "%")));
      renderBars();
      render();
    });
    $("shopClose").onclick = () => {
      m.hidden = true;
    };
    $("loanBtn").onclick = () => {
      if (C.loan) return;
      C.bank += 20;
      C.loan = 24;
      saveCareer();
      sfx.item();
      toast(L("Кредит выдан: +20 у.е.", "Loan approved: +$20"));
      renderBars();
      render();
    };
  };
  render();
  m.hidden = false;
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
}
$("bankChip").onclick = openShop;
function saveWeekNow() {
  if ((S == null ? void 0 : S.mode) === "career" && C && !busy && !views.game.hidden && store.get(KEY.save, null)) store.set(KEY.save, S);
}
addEventListener("pagehide", saveWeekNow);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) saveWeekNow();
});
function leaveWeek() {
  clearTimeout(splashT);
  splashOn = false;
  $("splash").hidden = true;
  $("modal").hidden = true;
  busy = false;
  renderMenu();
}
$("gExit").onclick = () => {
  if (!S || busy) return;
  if (S.mode === "career") {
    store.set(KEY.save, S);
    leaveWeek();
    toast(L("Неделя сохранена — «Играть» продолжит с этой карточки", "Week saved — hit “Play” to pick up from this card"));
    return;
  }
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass" role="dialog" aria-modal="true" aria-labelledby="exTitle"><h2 id="exTitle">'.concat(L("Выйти из недели?", "Leave this week?"), "</h2>\n    <p>").concat(S.mode === "daily" ? L("Неделя дня не сохраняется: если выйти, начать её можно будет заново, но в зачёт идёт только первая законченная попытка.", "The Daily Week isn’t saved: you can start it over, but only your first finished attempt counts.") : L("Эта неделя не сохраняется — придётся начать её заново.", "This week isn’t saved — you’ll have to start over."), '</p>\n    <div class="row2"><button class="btn-main" type="button" id="exStay">').concat(L("Остаться", "Stay"), '</button><button class="btn-ghost" type="button" id="exGo">').concat(L("Выйти в меню", "Quit to menu"), "</button></div></div>");
  m.hidden = false;
  $("exStay").onclick = () => {
    m.hidden = true;
  };
  $("exGo").onclick = leaveWeek;
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
};
const HINT_BASE = 2;
const hintPriceNow = () => Math.max(1, HINT_BASE - (typeof rankPerk === "function" ? rankPerk("hint") : 0));
const hintFree = () => (prefs.freeHints || 0) > 0;
function hintScore(side) {
  const { eff } = effectsOf(side), after = RES.map((r) => ({ k: r.k, v: clamp(S.res[r.k] + (eff[r.k] || 0)) }));
  const weak = after.reduce((a, b) => Math.min(b.v, 100 - b.v) < Math.min(a.v, 100 - a.v) ? b : a);
  const edge = Math.min(weak.v, 100 - weak.v);
  return { side, weak, edge: edge <= 0 ? -1 : edge, spread: after.reduce((n, x) => n + Math.abs(x.v - 50), 0) };
}
function hintAdvice() {
  const [a, b] = ["left", "right"].map(hintScore);
  const best = a.edge !== b.edge ? a.edge > b.edge ? a : b : a.spread !== b.spread ? a.spread < b.spread ? a : b : null;
  return best;
}
function cardTools() {
  const el = $("ctools");
  if (!el) return;
  const got = S.hintStep === S.step;
  el.className = "card-tools";
  el.innerHTML = '<button class="ct-btn ct-hint'.concat(got ? " done" : "", '" type="button" id="ctHint" ').concat(got ? "disabled" : "", ">💡 ").concat(L("Подсказка", "Hint"), " <b>").concat(got ? "✓" : hintFree() ? "🎟️×".concat(prefs.freeHints) : money(hintPriceNow()), '</b></button>\n    <button class="ct-btn ct-shop" type="button" id="ctShop">🛒 ').concat(L("Магазин", "Shop"), ' <b id="ctBank">').concat(money(C.bank), "</b></button>");
  $("ctHint").onclick = () => hintBar();
  $("ctShop").onclick = openShop;
}
function hintBar(auto) {
  const el = $("ctools");
  if (!el || !((S == null ? void 0 : S.mode) === "career" && C) || busy || splashOn || S.hintStep === S.step) return;
  if (auto && !(window.VDP_PLATFORM || !board.online || registered())) return;
  if (!needReg("hint")) return;
  const can = hintFree() || C.bank >= hintPriceNow();
  el.className = "card-tools ask";
  el.innerHTML = (can ? '<button class="ct-btn ct-hint" type="button" id="hbYes">💡 '.concat(L("Получить", "Get it"), " <b>").concat(hintFree() ? L("🎟️ бесплатно · ".concat(prefs.freeHints), "🎟️ free · ".concat(prefs.freeHints)) : money(hintPriceNow()), "</b></button>") : '<button class="ct-btn ct-hint" type="button" id="hbYes" data-topup="'.concat(lackOf(hintPriceNow()), '" data-topup-back="tools" data-topup-why="').concat(esc(L("Подсказка стоит ".concat(money(hintPriceNow()), " · на счёте ").concat(money(C.bank)), "A hint costs ".concat(money(hintPriceNow()), " · you have ").concat(money(C.bank)))), '">💰 ').concat(L("Пополнить", "Top up"), " <b>").concat(L("не хватает ".concat(lackOf(hintPriceNow())), "$".concat(lackOf(hintPriceNow()), " short")), "</b></button>")) + '\n    <button class="ct-btn ct-no" type="button" id="hbNo">'.concat(L("Отказаться", "No thanks"), "</button>");
  FX.pulse(el, "on", 500);
  $("hbNo").onclick = cardTools;
  $("hbYes").onclick = () => {
    if (!hintFree() && C.bank < hintPriceNow() || busy) return;
    if (hintFree()) {
      prefs.freeHints--;
      store.set(KEY.prefs, prefs);
    } else {
      C.bank -= hintPriceNow();
      C.spent = (C.spent || 0) + hintPriceNow();
      saveCareer();
    }
    renderBars();
    sfx.item();
    bus.emit("hint");
    const best = hintAdvice();
    S.hintStep = S.step;
    el.className = "card-tools said";
    if (!best) {
      el.innerHTML = '<span class="ct-q">💡 '.concat(L("Оба ответа примерно одинаково влияют на баланс — выбирайте по душе.", "Both answers hit the balance about the same — go with your gut."), "</span>");
      return;
    }
    const w = RES.find((r) => r.k === best.weak.k);
    $(best.side === "left" ? "btnL" : "btnR").classList.add("tip");
    el.innerHTML = '<span class="ct-q">💡 '.concat(L("Лучше", "Better go"), " <b>").concat(best.side === "left" ? L("← влево", "← left") : L("вправо →", "right →"), "</b> · ").concat(best.edge < 0 ? L("но и он заканчивает неделю", "but it still ends your week") : L("".concat(w.name, " станет ").concat(best.weak.v, "%"), "".concat(w.name, " ends up at ").concat(best.weak.v, "%")), "</span>");
  };
}
function hintOffer() {
  if (!((S == null ? void 0 : S.mode) === "career" && C) || prefs.hintOff) return;
  const day = dayOf(S.step);
  if (S.hintDay === day || !RES.some((r) => S.res[r.k] <= 20 || S.res[r.k] >= 80)) return;
  S.hintDay = day;
  setTimeout(() => {
    if (S && !busy) hintBar(true);
  }, 700);
}
const QUIZ_TIME = 20;
function pickQuestion() {
  let seen = new Set(store.get(KEY.qseen, []));
  let left = QUIZ.filter((q2) => !seen.has(q2.id));
  if (!left.length) {
    seen = /* @__PURE__ */ new Set();
    left = QUIZ;
  }
  const q = rnd(left);
  seen.add(q.id);
  store.set(KEY.qseen, [...seen]);
  return q;
}
function secondChance(k, high) {
  S.chanceUsed = true;
  if (S.mode === "career") store.set(KEY.save, S);
  const q = pickQuestion(), el = $("quiz");
  el.innerHTML = '<div class="quiz-box">\n    <span class="kicker">'.concat(L("Второй шанс", "Second chance"), " · ").concat(resName(k), " ").concat(high ? "100" : "0", '%</span>\n    <h2 id="quizTitle">').concat(L("Вопрос на эрудицию", "Trivia time"), '</h2>\n    <p class="q-lead">').concat(L("Ответьте верно — и шкала «".concat(resName(k), "» отступит от края на 20%. Ошибка — увольнение."), "Get it right and ".concat(resName(k), " pulls back 20% from the edge. Get it wrong and you’re out.")), '</p>\n    <span class="q-topic">').concat(esc(q.topic), '</span>\n    <div class="q-text">').concat(esc(q.q), '</div>\n    <div class="q-timer" aria-hidden="true"><i id="qBar"></i></div>\n    <div class="q-opts">').concat(q.options.map((o, i) => '<button class="q-opt" data-i="'.concat(i, '"><span class="n">').concat(i + 1, "</span><span>").concat(esc(o), "</span></button>")).join(""), '</div>\n    <div id="qAfter" hidden><p class="q-result" id="qRes"></p><p class="q-fact">').concat(esc(q.fact), '</p><div class="stack" style="margin-top:12px"><button class="btn-main" id="qNext"></button></div></div>\n  </div>');
  el.hidden = false;
  sfx.sigh();
  const bar = $("qBar");
  bar.style.setProperty("--qt", QUIZ_TIME + "s");
  void bar.offsetWidth;
  bar.classList.add("run");
  const btns = [...el.querySelectorAll(".q-opt")];
  let done = false;
  const finish = (picked) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    document.removeEventListener("keydown", keys);
    document.removeEventListener("visibilitychange", onVis);
    const ok = picked === q.answer;
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add("right");
      else if (i === picked) b.classList.add("wrong");
    });
    bar.style.animationPlayState = "paused";
    $("qRes").className = "q-result " + (ok ? "ok" : "bad");
    $("qRes").textContent = ok ? L("Верно! «".concat(resName(k), "» отступает от края на 20%."), "Correct! ".concat(resName(k), " pulls back 20% from the edge.")) : picked === -1 ? L("Время вышло. Правильный ответ: «".concat(q.options[q.answer], "»."), "Time’s up. The answer was “".concat(q.options[q.answer], "”.")) : L("Неверно. Правильный ответ: «".concat(q.options[q.answer], "»."), "Wrong. The answer was “".concat(q.options[q.answer], "”."));
    $("qNext").textContent = ok ? L("Продолжить неделю", "Back to the week") : L("Принять судьбу", "Accept your fate");
    $("qAfter").hidden = false;
    $("qNext").focus({ preventScroll: true });
    setTimeout(() => {
      var _a2;
      return (_a2 = $("qNext")) == null ? void 0 : _a2.scrollIntoView({ block: "end", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }, 250);
    ok ? sfx.item() : sfx.stamp();
    track("quiz", { won: ok, card: q.id, mode: S.mode });
    $("qNext").onclick = () => {
      el.hidden = true;
      if (ok) {
        S.res[k] = high ? 80 : 20;
        S.flags.saved = true;
        const got = unlock(["quiz_saved"]);
        if (got.length) toast(L("Новая концовка: «".concat(got[0].title, "»"), "New ending: “".concat(got[0].title, "”")));
        renderBars();
        advance();
      } else {
        unlock(["quiz_fail"]);
        const best = store.get(KEY.best, { step: 0, wins: 0 });
        best.step = Math.max(best.step, S.step);
        store.set(KEY.best, best);
        store.del(KEY.save);
        const fire = () => lose(k, high);
        adRescue(k, high, () => {
          var _a2;
          if (!((_a2 = window.groupOffer) == null ? void 0 : _a2.call(window, fire))) fire();
        });
      }
    };
  };
  let left = QUIZ_TIME * 1e3, startedAt = Date.now(), timer = setTimeout(() => finish(-1), left);
  const onVis = () => {
    if (done) return document.removeEventListener("visibilitychange", onVis);
    if (document.hidden) {
      clearTimeout(timer);
      left -= Date.now() - startedAt;
      bar.style.animationPlayState = "paused";
    } else {
      startedAt = Date.now();
      timer = setTimeout(() => finish(-1), Math.max(0, left));
      bar.style.animationPlayState = "running";
    }
  };
  document.addEventListener("visibilitychange", onVis);
  const keys = (e) => {
    const n = +e.key;
    if (n >= 1 && n <= 4) {
      e.preventDefault();
      finish(n - 1);
    }
  };
  document.addEventListener("keydown", keys);
  btns.forEach((b) => b.onclick = () => finish(+b.dataset.i));
  btns[0].focus({ preventScroll: true });
}
(() => {
  const card = $("card");
  let x0 = 0, dx = 0, t0 = 0, drag = false, pid = null;
  card.addEventListener("pointerdown", (e) => {
    if (busy || splashOn || e.target.closest(".card-tools")) return;
    drag = true;
    pid = e.pointerId;
    x0 = e.clientX;
    dx = 0;
    t0 = performance.now();
    card.setPointerCapture(pid);
    card.style.transition = "border-color .2s, box-shadow .2s";
    card.classList.remove("idle");
  });
  card.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== pid) return;
    dx = e.clientX - x0;
    card.style.transform = "translateX(".concat(dx, "px) rotate(").concat(dx / 18, "deg)");
    if (Math.abs(dx) > 40) preview(dx < 0 ? "left" : "right");
    else clearPreview();
    if (Math.abs(dx) > 20) FX.stamp(dx < 0 ? "left" : "right", (Math.abs(dx) - 20) / Math.min(140, innerWidth * 0.3));
  });
  const end = (e) => {
    if (!drag || e.pointerId !== pid) return;
    drag = false;
    const limit = Math.min(140, innerWidth * 0.3), v = Math.abs(dx) / Math.max(1, performance.now() - t0);
    if (Math.abs(dx) > limit || Math.abs(dx) > 50 && v > 0.7) {
      choose(dx < 0 ? "left" : "right");
      return;
    }
    card.style.transition = "transform .3s ".concat(EASE, ", border-color .2s, box-shadow .2s");
    card.style.transform = "";
    clearPreview();
    card.classList.add("idle");
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
})();
for (const [id, side] of [["btnL", "left"], ["btnR", "right"]]) {
  const b = $(id);
  b.addEventListener("mouseenter", () => !busy && !splashOn && preview(side));
  b.addEventListener("focus", () => !busy && !splashOn && preview(side));
  b.addEventListener("mouseleave", clearPreview);
  b.addEventListener("blur", clearPreview);
  b.addEventListener("click", () => choose(side));
}
document.addEventListener("keydown", (e) => {
  if (views.game.hidden || !$("modal").hidden) return;
  if (splashOn && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== "Tab") {
    e.preventDefault();
    $("splash").click();
    return;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    choose("left");
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    choose("right");
  }
});
function finalGrid(zeroKey) {
  return '<div class="final">'.concat(RES.map((r) => '<div class="'.concat(r.k === zeroKey ? "zero" : "", '"><b>').concat(S.res[r.k], "%</b><span>").concat(r.name, "</span></div>")).join(""), "</div>");
}
const viralHtml = () => '<div class="viral"><b>'.concat(L("Позовите коллег — проверим, кто дольше продержится до пятницы", "Invite your coworkers — let’s see who makes it closer to Friday"), '</b>\n  <div class="row2"><button class="btn-main" data-share="team">').concat(L("Позвать коллег", "Invite coworkers"), '</button><button class="btn-ghost" data-share="friends">').concat(L("Рассказать друзьям", "Tell friends"), "</button></div></div>");
function bindCommon() {
  bindShare(views.end);
  $("toMenu").onclick = renderMenu;
  if ($("toBoard")) $("toBoard").onclick = () => openBoard("end", (S == null ? void 0 : S.mode) === "daily" ? "daily" : "rating");
}
const traitText = (kind, trait) => TRAITS[trait || "workaholic"][kind];
const onboardingLine = () => S.flags.obTotal ? '<div class="place"><b>'.concat(S.flags.obOk || 0, "/").concat(S.flags.obTotal, "</b><span>").concat(L("правильных решений в учебной неделе", "right calls in the training week"), "</span></div>") : "";
function rank(total) {
  return total >= 280 ? L("Легенда опенспейса", "Open-Space Legend") : total >= 220 ? L("Сеньор по выживанию", "Senior Survival Engineer") : total >= 160 ? L("Крепкий мидл", "Solid Mid-Level") : L("Чудом уцелевший стажёр", "Intern Who Somehow Survived");
}
function weekEndings(won, k, high) {
  const ids = [], d = dayOf(S.step);
  if (S.used.length >= 2) ids.push("items2");
  if (won) {
    const v = Object.values(S.res);
    if (v.every((x) => x >= 40 && x <= 60)) ids.push("zen_week");
    if (v.some((x) => x < 10 || x > 90)) ids.push("edge");
  } else {
    ids.push(high ? { boss: d === 4 ? "boss_fri" : null, colleagues: "party", psyche: "zen", energy: "battery" }[k] : { psyche: "cooler", energy: "zoom", boss: "two_words", colleagues: "wifi" }[k]);
    if (d === 0) ids.push("monday");
    if (S.step === WEEK_LEN - 1) ids.push("almost");
    if (S.flags.cake) ids.push("cake");
  }
  return unlock(ids);
}
function lose(k, high) {
  var _a2, _b2;
  sfx.lose();
  const D = (high ? DEATH_HIGH : DEATH)[k], d = dayOf(S.step), ph = PHASES[slotPh(S.step)];
  const got = weekEndings(false, k, high), career = S.mode === "career" && C;
  let next = "";
  if (career) {
    var company = C.company, comp = Math.floor(C.vacation) * C.salary, paidDays = Math.floor(S.step / PER_DAY);
    C.firings++;
    C.week++;
    C.stage = "search";
    C.res = null;
    C.vacation = 0;
    if (comp) pay(comp);
    else saveCareer();
    var exp = weekExpenses(paidDays / 5);
    next = C.week > YEAR ? L("Итоги года", "Year in review") : L("Искать работу", "Look for a job");
  }
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(career ? L("Вас уволили · ".concat(DAYS[d].toLowerCase(), ", ").concat(ph.name.toLowerCase(), " · ").concat(esc(company)), "Fired · ".concat(dayName(d), " ").concat(phaseName(slotPh(S.step)).toLowerCase(), " · ").concat(esc(company))) : L("Неделя закончилась досрочно · ".concat(DAYS[d].toLowerCase(), ", ").concat(ph.name.toLowerCase()), "Week ended early · ".concat(dayName(d), " ").concat(phaseName(slotPh(S.step)).toLowerCase())), '</span>\n    <h1 class="lose">').concat(high ? L("ПЕРЕГРЕВ", "OVERHEAT") : L("НЕДЕЛЯ ЗАВАЛЕНА", "WEEK WRECKED"), '</h1>\n    <p class="cause">').concat(D.title, " · ").concat(esc(S.name), ", ").concat(esc(prefs.profCustom && S.prof === prefs.prof ? prefs.profCustom : PROF[S.prof].name.toLowerCase()), "</p>\n    <p>").concat(D.text, '</p>\n    <p class="trait-line">').concat(TRAITS[S.trait || "workaholic"].name, ": ").concat(traitText("lose", S.trait), "</p>\n    ").concat(finalGrid(k), "\n    ").concat(career ? '<div class="money"><div><b>+'.concat(money(S.earned || 0), "</b><span>").concat(L("за ".concat(paidDays, " отраб. дн."), "for ".concat(pl(paidDays, "", "", "", "day", "days"), " worked")), "</span></div><div><b>+").concat(money(comp), "</b><span>").concat(L("компенсация отпуска", "unused vacation payout"), "</span></div></div>").concat(expHtml(exp)) : "", "\n    ").concat(endingsHtml(got), "\n    ").concat(challengeLine(false, k), '\n    <div class="place" id="place" aria-live="polite">').concat(L("Записываю результат в рейтинг…", "Saving your score to the leaderboard…"), "</div>\n    ").concat(viralHtml(), "\n    ").concat(onboardingLine(), '\n    <div class="stack">').concat(career ? '<button class="btn-main" id="next">'.concat(next, "</button>") : '<button class="btn-main" id="next">'.concat(S.mode === "daily" ? L("Сыграть неделю дня ещё раз", "Replay the Daily Week") : S.mode === "tour" ? L("Экран итогов турнира", "Tournament results") : L("Сыграть ещё раз", "Play again"), "</button>"), '\n      <button class="btn-ghost btn-share" id="share">').concat(S.mode === "daily" ? L("Поделиться и вызвать коллег", "Share & challenge coworkers") : L("Поделиться результатом", "Share result"), '</button>\n      <button class="btn-ghost" id="toBoard">').concat(S.mode === "daily" ? L("Рейтинг дня", "Daily leaderboard") : L("Рейтинг офиса", "Office leaderboard"), '</button><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n  </div>");
  show("end");
  bindCommon();
  $("share").onclick = () => share(false, k);
  $("next").onclick = () => career ? C.week > YEAR ? yearEnd() : jobSearch() : S.mode === "daily" ? startDaily() : S.mode === "tour" ? openScreen(S.tourCode) : S.mode === "quick" ? startQuick() : startPack();
  record(false, k, high);
  bus.emit("weekEnd", { won: false, mode: S.mode, step: S.step, res: { ...S.res }, stat: k, high });
  track("week_end", { mode: S.mode, won: false, step: S.step, card: (_a2 = S.deck[S.step]) == null ? void 0 : _a2.id, detail: "".concat(k).concat(high ? ":100" : ":0") });
  if (career) track("fired", { mode: "career", step: S.step, detail: ((_b2 = VACANCIES.find((v) => v.name === company)) == null ? void 0 : _b2.id) || "" });
  $("next").focus({ preventScroll: true });
}
function win() {
  sfx.win();
  FX.doors();
  const total = RES.reduce((a, r) => a + S.res[r.k], 0), got = weekEndings(true), career = S.mode === "career" && C;
  let week, last = false;
  if (career) {
    week = C.week;
    C.worked++;
    C.week++;
    C.res = Object.fromEntries(RES.map((r) => [r.k, Math.round((S.res[r.k] + 50) / 2)]));
    C.vacation = +(C.vacation + VAC_PER_WEEK).toFixed(2);
    saveCareer();
    var exp = weekExpenses();
    last = C.week > YEAR;
  }
  if (last || !career) confetti();
  const kicker = career ? L("Неделя ".concat(week, " из ").concat(YEAR, " · ").concat(esc(C.company), " · пятница, 18:00"), "Week ".concat(week, " of ").concat(YEAR, " · ").concat(esc(C.company), " · Friday, 6:00 PM")) : S.mode === "daily" ? L("Неделя дня ".concat(dayLabel(S.day), " · пятница, 18:00"), "Daily Week ".concat(dayLabel(S.day), " · Friday, 6:00 PM")) : S.mode === "tour" ? L("Турнир офиса «".concat(esc(S.tourTeam), "» · пятница, 18:00"), "Office Tournament “".concat(esc(S.tourTeam), "” · Friday, 6:00 PM")) : S.mode === "quick" ? L("⚡ Быстрая смена · пятница, 18:00", "⚡ Quick shift · Friday, 6:00 PM") : "".concat(esc((PACK == null ? void 0 : PACK.title) || ""), " · ").concat(L("пятница, 18:00", "Friday, 6:00 PM"));
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(kicker, "</span>\n    <h1>").concat(last ? L("Год позади!", "Year’s done!") : L("Неделя закрыта!", "Week survived!"), "</h1>\n    <p>").concat(traitText("win", S.trait), "</p>\n    ").concat(career && !last ? '<p class="trait-line">'.concat(L("Выходные сгладят всё наполовину: в понедельник каждая шкала сдвинется к 50%.", "The weekend smooths things out halfway: by Monday every meter drifts back toward 50%."), "</p>") : "", '\n    <span class="rank">').concat(rank(total), "</span>\n    ").concat(finalGrid(), '\n    <div class="total"><span>').concat(L("Счёт недели", "Week score"), "</span><b>").concat(total, " / 400</b></div>\n    ").concat(career ? '<div class="money"><div><b>'.concat(money(C.bank), "</b><span>").concat(L("на счёте (+".concat(S.earned || 0, " за неделю)"), "in the bank (+$".concat(S.earned || 0, " this week)")), "</span></div><div><b>").concat(fmtDays(C.vacation), " ").concat(L("дн.", "days"), "</b><span>").concat(L("отпуска накоплено", "vacation banked"), "</span></div></div>").concat(expHtml(exp)) : "", "\n    ").concat(endingsHtml(got), "\n    ").concat(challengeLine(true), '\n    <div class="place" id="place" aria-live="polite">').concat(L("Записываю результат в рейтинг…", "Saving your score to the leaderboard…"), "</div>\n    ").concat(viralHtml(), "\n    ").concat(onboardingLine(), '\n    <div class="stack"><button class="btn-main" id="next">').concat(career ? last ? L("Итоги года", "Year in review") : L("Неделя ".concat(C.week, " →"), "Week ".concat(C.week, " →")) : S.mode === "tour" ? L("Экран итогов турнира", "Tournament results") : L("В главное меню", "Main menu"), "</button>\n      ").concat(career && !last && certCan(C) ? '<button class="btn-ghost btn-cert" id="certEnd">📜 '.concat(L("Хочу зарабатывать больше: аттестация (".concat(money(C.salary), " → ").concat(money(certNextPay(C)), ")"), "Earn more: take the exam (".concat(money(C.salary), " → ").concat(money(certNextPay(C)), ")")), "</button>") : "", "\n      ").concat(career && !last && C.vacation >= 7 ? '<button class="btn-ghost btn-vac" id="vac">'.concat(L("Уйти в отпуск на неделю (7 дн.)", "Take a week off (7 days)"), "</button>") : "", '\n      <button class="btn-ghost btn-share" id="share">').concat(S.mode === "daily" ? L("Поделиться и вызвать коллег", "Share & challenge coworkers") : L("Поделиться результатом", "Share result"), '</button>\n      <button class="btn-ghost" id="toBoard">').concat(S.mode === "daily" ? L("Рейтинг дня", "Daily leaderboard") : L("Рейтинг офиса", "Office leaderboard"), '</button><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n  </div>");
  show("end");
  bindCommon();
  $("share").onclick = () => share(true);
  if ($("vac")) $("vac").onclick = takeVacation;
  if ($("certEnd")) $("certEnd").onclick = () => certStart(() => {
    const b = $("certEnd");
    if (b) b.remove();
  });
  $("next").onclick = () => career ? last ? yearEnd() : startWeek() : S.mode === "tour" ? openScreen(S.tourCode) : renderMenu();
  record(true, null, false);
  bus.emit("weekEnd", { won: true, mode: S.mode, step: WEEK_LEN, res: { ...S.res } });
  track("week_end", { mode: S.mode, won: true, step: WEEK_LEN });
  $("next").focus({ preventScroll: true });
}
function jobSearch() {
  var _a2;
  if (C.week > YEAR) return yearEnd();
  if (!((_a2 = C.offers) == null ? void 0 : _a2.length)) {
    C.offers = shuffle(VACANCIES.filter((v) => v.name !== C.company)).slice(0, 3).map((v) => v.id);
    saveCareer();
  }
  const perkText = (p) => Object.entries(p).map(([k, v]) => "".concat(resName(k), " ").concat(v > 0 ? "+" : "−").concat(Math.abs(v))).join(" · ");
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(L("Неделя ".concat(C.week, " из ").concat(YEAR, " · поиск работы"), "Week ".concat(C.week, " of ").concat(YEAR, " · job hunt")), "</span>\n    <h1>").concat(L("Вакансии", "Openings"), "</h1>\n    <p>").concat(L("Выберите, куда откликнуться. Собеседование займёт неделю: 4 вопроса от HR. Первая неделя на новом месте — с новым боссом.", "Pick where to apply. The interview takes a week: 4 questions from HR. Your first week at the new place comes with a brand-new boss."), '</p>\n    <div class="vacancies">').concat(C.offers.map((id) => {
    const v = vacancy(id);
    return '<button class="vac" data-id="'.concat(v.id, '"><b>').concat(esc(v.name), '</b><span class="lvl">').concat("●".repeat(v.level)).concat("○".repeat(3 - v.level), "</span>\n        <small>").concat(esc(v.vibe), '</small><span class="perk">').concat(L("старт", "start"), ": ").concat(perkText(v.perk), " · ").concat(L("оклад ".concat(money(salaryFor(v)), "/день"), "pay ".concat(money(salaryFor(v)), "/day")), "</span></button>");
  }).join(""), '</div>\n    <div class="stack"><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n  </div>");
  show("end");
  $("toMenu").onclick = renderMenu;
  views.end.querySelectorAll(".vac").forEach((b) => b.onclick = () => interview(vacancy(b.dataset.id)));
  board.touch("menu").catch(() => {
  });
}
const IV_COUNT = 6;
function pickInterview(prof) {
  const seen = new Set(store.get(KEY.ivseen, []));
  const take = (list, n) => {
    let left = shuffle(list.filter((x) => !seen.has(x.id)));
    if (left.length < n) {
      const old = shuffle(list.filter((x) => seen.has(x.id)));
      for (const x of list) seen.delete(x.id);
      left = left.concat(old);
    }
    const out = left.slice(0, n);
    for (const x of out) seen.add(x.id);
    return out;
  };
  const own = IV.filter((x) => !x.last && x.prof === prof), main = IV.filter((x) => !x.last && !x.prof), last = IV.filter((x) => x.last);
  const mine = take(own, Math.min(1, own.length));
  const qs = shuffle(mine.concat(take(main, IV_COUNT - mine.length))).concat(take(last, 1));
  store.set(KEY.ivseen, [...seen]);
  return qs;
}
function interview(v) {
  const qs = pickInterview(C.prof);
  const need = Math.round(qs.length * 2 * { 1: 0.5, 2: 0.64, 3: 0.79 }[v.level]);
  let i = 0, score = 0, recUsed = false;
  const step = () => {
    const q = qs[i];
    views.end.innerHTML = '<div class="end-sheet glass">\n      <span class="kicker">'.concat(L("Неделя ".concat(C.week, " из ").concat(YEAR, " · собеседование · ").concat(esc(v.name)), "Week ".concat(C.week, " of ").concat(YEAR, " · interview · ").concat(esc(v.name))), '</span>\n      <div class="iv-dots">').concat(qs.map((_, j) => '<i class="'.concat(j < i ? "done" : j === i ? "now" : "", '"></i>')).join(""), '</div>\n      <div class="iv-q"><span class="who">').concat(L("HR · вопрос ".concat(i + 1, " из ").concat(qs.length), "HR · question ".concat(i + 1, " of ").concat(qs.length)), '</span><div class="text">').concat(esc(q.q), '</div><div class="iv-reply" id="ivReply" aria-live="polite"></div></div>\n      ').concat(i === 0 && typeof anketaNote === "function" ? anketaNote() : "", '\n      <div class="iv-answers">').concat(shuffle(q.a).map((a) => '<button class="ans" data-s="'.concat(a.score, '" data-r="').concat(esc(a.reply), '">').concat(esc(a.label), "</button>")).join(""), "</div>\n    </div>");
    show("end");
    const btns = [...views.end.querySelectorAll(".iv-answers .ans")];
    btns.forEach((b) => b.onclick = () => {
      btns.forEach((x) => x.disabled = true);
      b.classList.add("picked");
      score += +b.dataset.s;
      $("ivReply").textContent = "HR: ".concat(b.dataset.r);
      sfx.stapler();
      setTimeout(() => {
        i++;
        i < qs.length ? step() : verdict();
      }, 1500);
    });
    btns[0].focus({ preventScroll: true });
  };
  const verdict = () => {
    if (score < need && typeof anketaRecUse === "function" && anketaRecUse(need - score)) {
      score += ANK_REC;
      recUsed = true;
    }
    const ok = score >= need, got = unlock([score === qs.length * 2 ? "perfect_iv" : null]);
    C.week++;
    C.offers = [];
    if (ok) {
      C.passed++;
      C.stage = "work";
      C.newJob = true;
      C.company = v.name;
      C.salary = salaryFor(v);
      if (!C.companies.includes(v.name)) C.companies.push(v.name);
      C.res = freshRes(v.perk);
      sfx.win();
    } else {
      C.failed++;
      sfx.lose();
    }
    saveCareer();
    const over = C.week > YEAR;
    views.end.innerHTML = '<div class="end-sheet glass">\n      <span class="kicker">'.concat(L("Собеседование · ".concat(esc(v.name), " · ").concat(score, " из ").concat(qs.length * 2, " баллов, нужно ").concat(need), "Interview · ".concat(esc(v.name), " · ").concat(score, " of ").concat(qs.length * 2, " points, needed ").concat(need)), '</span>\n      <h1 class="').concat(ok ? "" : "lose", '">').concat(ok ? L("Оффер!", "You got the offer!") : L("Мы вам перезвоним", "We’ll be in touch"), "</h1>\n      <p>").concat(ok ? L("".concat(esc(v.name), " ждёт вас в понедельник. Новое место — свежий старт: шкалы снова около 50%. Оклад — ").concat(money(C.salary), " в день."), "".concat(esc(v.name), " expects you on Monday. New job, fresh start: meters are back around 50%. Pay: ").concat(money(C.salary), " a day.")) : L("…но не перезвонили. Поиск продолжается, впереди новые вакансии.", "…they were not in touch. The hunt goes on — more openings ahead."), "</p>\n      ").concat(recUsed ? '<p class="ank-used">📎 '.concat(L("Сработала рекомендация HR из анкеты: +".concat(ANK_REC, " балла."), "Your HR referral from the application kicked in: +".concat(ANK_REC, " points.")), "</p>") : "", "\n      ").concat(endingsHtml(got), '\n      <div class="stack"><button class="btn-main" id="next">').concat(over ? L("Итоги года", "Year in review") : ok ? L("Выйти на работу · неделя ".concat(C.week), "Start the job · week ".concat(C.week)) : L("Искать дальше · неделя ".concat(C.week), "Keep looking · week ".concat(C.week)), '</button>\n        <button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n    </div>");
    show("end");
    $("toMenu").onclick = renderMenu;
    $("next").onclick = () => over ? yearEnd() : ok ? startWeek() : jobSearch();
    $("next").focus({ preventScroll: true });
    if (ok) confetti();
  };
  step();
}
function yearRank(w) {
  return w >= 52 ? L("Железный сотрудник года", "Iron Employee of the Year") : w >= 40 ? L("Опора офиса", "Pillar of the Office") : w >= 26 ? L("Опытный выживальщик", "Seasoned Survivor") : w >= 10 ? L("Вечный соискатель", "Eternal Job Seeker") : L("Свободный художник", "Free Spirit");
}
function yearEnd() {
  store.del(KEY.save);
  const all = C.passed + C.failed;
  if (C.vacation >= 1 && !C.paidOut) {
    pay(Math.floor(C.vacation) * C.salary);
    C.paidOut = true;
    saveCareer();
  }
  const got = unlock([C.companies.length >= 5 ? "nomad" : null, C.worked >= YEAR && !C.firings ? "iron" : null]);
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(L("Год позади · ".concat(YEAR, " недель"), "Year done · ".concat(YEAR, " weeks")), " · ").concat(esc(prefs.name), ", ").concat(PROF[C.prof].name.toLowerCase(), "</span>\n    <h1>").concat(L("Итоги года", "Year in review"), '</h1>\n    <span class="rank">').concat(yearRank(C.worked), "</span>\n    <p>").concat(traitText("year", C.trait), '</p>\n    <div class="career-card" style="width:100%">\n      <div class="stat-box"><b>').concat(C.worked, "</b><span>").concat(L("недель отработано", "weeks worked"), '</span></div>\n      <div class="stat-box"><b>').concat(C.firings, "</b><span>").concat(L("увольнений", "times fired"), '</span></div>\n      <div class="stat-box"><b>').concat(C.passed, "/").concat(all, "</b><span>").concat(L("собеседований пройдено", "interviews passed"), '</span></div>\n    </div>\n    <div class="money"><div><b>').concat(money(C.earned), "</b><span>").concat(L("заработано за год", "earned this year"), "</span></div><div><b>").concat(L("".concat(C.vacUsed, " из ").concat(VAC_YEAR, " дн."), "".concat(C.vacUsed, " of ").concat(VAC_YEAR, " days")), "</b><span>").concat(L("отпуска использовано", "vacation used"), "</span></div></div>\n    <p>").concat(L("Где вы успели поработать:", "Where you clocked in this year:"), '</p>\n    <ul class="companies">').concat(C.companies.map((n) => "<li>".concat(esc(n), "</li>")).join(""), "</ul>\n    ").concat(endingsHtml(got), "\n    ").concat(levelOf(C) < LEVEL_MAX ? '<div class="lvl-next"><span class="lvl-next-ico" aria-hidden="true">'.concat(LEVELS[levelOf(C) + 1].ico, "</span><div><b>").concat(L("Открыт уровень ".concat(levelOf(C) + 1, " из ").concat(LEVEL_MAX, ": «").concat(LEVELS[levelOf(C) + 1].name, "»"), "Level ".concat(levelOf(C) + 1, " of ").concat(LEVEL_MAX, " unlocked: “").concat(LEVELS[levelOf(C) + 1].name, "”")), "</b><small>").concat(LEVELS[levelOf(C) + 1].desc, ". ").concat(L("Новые 52 недели и новые карточки. Персонаж, питомцы и деньги остаются с вами.", "A new 52 weeks with brand-new cards. Your character, pets and money stay with you."), "</small></div></div>") : '<div class="lvl-next"><span class="lvl-next-ico" aria-hidden="true">🏆</span><div><b>'.concat(L("Все три уровня пройдены — вы легенда офиса!", "All three levels done — you’re an office legend!"), "</b><small>").concat(L("Можно сыграть третий уровень ещё раз или начать путь заново.", "Replay level three or start the journey over."), "</small></div></div>"), '\n    <div class="stack">').concat(levelOf(C) < LEVEL_MAX ? '<button class="btn-main" id="nextLevel">'.concat(L("Уровень ".concat(levelOf(C) + 1, " →"), "Level ".concat(levelOf(C) + 1, " →")), "</button>") : "", '<button class="').concat(levelOf(C) < LEVEL_MAX ? "btn-ghost" : "btn-main", '" id="again">').concat(levelOf(C) < LEVEL_MAX ? L("Начать карьеру заново", "Start over") : L("Ещё год на 3-м уровне", "Another year on level 3"), '</button>\n      <button class="btn-ghost" id="toBoard">').concat(L("Рейтинг офиса", "Office leaderboard"), '</button><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n  </div>");
  show("end");
  bindCommon();
  $("again").onclick = () => levelOf(C) >= LEVEL_MAX ? startLevel(LEVEL_MAX) : (store.del(KEY.career), newCareer());
  if ($("nextLevel")) $("nextLevel").onclick = () => startLevel(levelOf(C) + 1);
  if (C.worked >= 40) confetti();
}
function showCollection() {
  const got = endingsGot();
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(L("Открыто ".concat(Object.keys(got).length, " из ").concat(ENDINGS.length), "Unlocked ".concat(Object.keys(got).length, " of ").concat(ENDINGS.length)), "</span>\n    <h1>").concat(L("Коллекция концовок", "Endings Collection"), '</h1>\n    <div class="collection">').concat(ENDINGS.map((e) => got[e.id] ? '<div class="ach on"><b>'.concat(esc(e.title), "</b><small>").concat(esc(e.hint), "</small></div>") : '<div class="ach"><b>???</b><small>'.concat(esc(e.hint), "</small></div>")).join(""), '</div>\n    <div class="stack"><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n  </div>");
  setPhase("evening");
  show("end");
  $("toMenu").onclick = renderMenu;
}
function showSuggest() {
  const sel = (side, k) => '<label class="eff"><span>'.concat(resName(k), '</span><select id="ef-').concat(side, "-").concat(k, '">\n    <option value="-20">▼▼</option><option value="-10">▼</option><option value="0" selected>—</option><option value="10">▲</option><option value="20">▲▲</option></select></label>');
  views.end.innerHTML = '<form class="end-sheet glass suggest" id="sgForm" novalidate>\n    <span class="kicker">'.concat(L("Карточка от коллеги · после модерации появится в игре с подписью «".concat(esc(prefs.name), "»"), "A card from a colleague · once approved, it shows up in the game signed “".concat(esc(prefs.name), "”")), "</span>\n    <h1>").concat(L("Предложить ситуацию", "Suggest a situation"), '</h1>\n    <div class="field"><label for="sgWho">').concat(L("Кто говорит", "Who’s talking"), '</label><input id="sgWho" type="text" maxlength="24" value="').concat(L("Коллега", "Colleague"), '"></div>\n    <div class="field"><label for="sgText">').concat(L("Ситуация *", "Situation *"), '</label><textarea id="sgText" maxlength="240" rows="3" placeholder="').concat(L("Например: «Коллега третий раз за день просит „быстро глянуть“ его отчёт»", "E.g. “A coworker asks you to ‘take a quick look’ at their report for the third time today”"), '"></textarea></div>\n    <div class="sg-side"><div class="field"><label for="sgLeft">').concat(L("Ответ влево *", "Left answer *"), '</label><input id="sgLeft" type="text" maxlength="60" placeholder="').concat(L("Отказать", "Say no"), '"></div>\n      <div class="effs">').concat(RES.map((r) => sel("l", r.k)).join(""), '</div></div>\n    <div class="sg-side"><div class="field"><label for="sgRight">').concat(L("Ответ вправо *", "Right answer *"), '</label><input id="sgRight" type="text" maxlength="60" placeholder="').concat(L("Согласиться", "Say yes"), '"></div>\n      <div class="effs">').concat(RES.map((r) => sel("r", r.k)).join(""), '</div></div>\n    <p class="join-err" id="sgErr" role="alert"></p>\n    <div class="stack"><button class="btn-main" type="submit" id="sgGo">').concat(L("Отправить на модерацию", "Submit for review"), '</button><button class="btn-ghost" type="button" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div>\n  </form>");
  setPhase("evening");
  show("end");
  $("toMenu").onclick = renderMenu;
  $("sgForm").onsubmit = async (e) => {
    e.preventDefault();
    const text = $("sgText").value.trim(), l = $("sgLeft").value.trim(), r = $("sgRight").value.trim();
    if (text.length < 10 || !l || !r) {
      $("sgErr").textContent = L("Опишите ситуацию (хотя бы 10 символов) и оба ответа.", "Describe the situation (at least 10 characters) and both answers.");
      return;
    }
    const effs = (side) => Object.fromEntries(RES.map((x) => [x.k, +$("ef-".concat(side, "-").concat(x.k)).value]));
    $("sgGo").disabled = true;
    $("sgGo").textContent = L("Отправляю…", "Sending…");
    try {
      await board.suggest({ author: prefs.name, who: $("sgWho").value.trim() || L("Коллега", "Colleague"), text, left_label: l, right_label: r, left_effects: effs("l"), right_effects: effs("r") });
      views.end.innerHTML = '<div class="end-sheet glass"><span class="kicker">'.concat(L("Отправлено", "Sent"), "</span><h1>").concat(L("Спасибо!", "Thanks!"), "</h1>\n        <p>").concat(L("Карточка ушла на модерацию. Когда её одобрят, она начнёт выпадать как случайное событие с подписью «".concat(esc(prefs.name), "»."), "Your card is in the review queue. Once approved, it’ll pop up as a random event signed “".concat(esc(prefs.name), "”.")), '</p>\n        <div class="stack"><button class="btn-main" id="again">').concat(L("Предложить ещё", "Suggest another"), '</button><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div></div>");
      $("again").onclick = showSuggest;
      $("toMenu").onclick = renderMenu;
    } catch (err) {
      $("sgErr").textContent = L("Не получилось отправить: ".concat(err.message), "Couldn’t send: ".concat(err.message));
      $("sgGo").disabled = false;
      $("sgGo").textContent = L("Отправить на модерацию", "Submit for review");
    }
  };
}
function updateStreak(day) {
  const st = prefs.streak || { last: "", count: 0 };
  const y = new Date(day);
  y.setDate(y.getDate() - 1);
  const yest = "".concat(y.getFullYear(), "-").concat(String(y.getMonth() + 1).padStart(2, "0"), "-").concat(String(y.getDate()).padStart(2, "0"));
  st.count = st.last === yest ? st.count + 1 : st.last === day ? st.count : 1;
  st.last = day;
  prefs.streak = st;
  store.set(KEY.prefs, prefs);
  const bonus = Math.min(14, 2 * st.count), Cc = store.get(KEY.career, null);
  if (Cc && st.count > 1) {
    Cc.bank = (Cc.bank || 0) + bonus;
    Cc.earned = (Cc.earned || 0) + bonus;
    store.set(KEY.career, Cc);
  }
  if (st.count >= 7) unlock(["streak7"]);
  setTimeout(() => toast(st.count > 1 ? L("Серия: ".concat(st.count, " дн. подряд").concat(Cc ? " · +".concat(bonus, " у.е. на счёт карьеры") : ""), "Streak: ".concat(st.count, " days in a row").concat(Cc ? " · +$".concat(bonus, " to your career bank") : "")) : L("Серия началась: приходите завтра за бонусом", "Streak started: come back tomorrow for a bonus")), 1200);
}
const streakNow = () => {
  const st = prefs.streak;
  if (!st) return 0;
  const d = (new Date(today()) - new Date(st.last)) / 864e5;
  return d <= 1 ? st.count : 0;
};
function remindIcs() {
  const time = "12:30";
  const d = /* @__PURE__ */ new Date();
  const ymd = "".concat(d.getFullYear()).concat(String(d.getMonth() + 1).padStart(2, "0")).concat(String(d.getDate()).padStart(2, "0"));
  const url = gameUrl();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//vyzhit-do-pyatnitsy//RU",
    "BEGIN:VEVENT",
    "UID:vdp-daily-".concat(ymd, "@vyzhit"),
    "DTSTAMP:".concat(ymd, "T000000"),
    "DTSTART:".concat(ymd, "T").concat(time.replace(":", ""), "00"),
    "DURATION:PT10M",
    "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    L("SUMMARY:Неделя дня — «Выжить до пятницы»", "SUMMARY:Daily Week — Survive till Friday"),
    L("DESCRIPTION:Новая неделя дня уже ждёт. Коллеги играют! ".concat(url), "DESCRIPTION:A new Daily Week is waiting. Your coworkers are already playing! ".concat(url)),
    "URL:".concat(url),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    L("DESCRIPTION:Неделя дня ждёт", "DESCRIPTION:The Daily Week is waiting"),
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "vyzhit-do-pyatnitsy.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast(L("Откройте скачанный файл — напоминание появится в календаре по будням в 12:30", "Open the downloaded file — a reminder will pop up in your calendar on weekdays at 12:30 PM"));
  } catch (e) {
    toast(L("Не получилось сохранить файл напоминания", "Couldn’t save the reminder file"));
  }
}
$("remindDaily").onclick = remindIcs;
async function record(won, death, high) {
  const total = RES.reduce((a, r) => a + S.res[r.k], 0);
  prefs.gamesPlayed = (prefs.gamesPlayed || 0) + 1;
  store.set(KEY.prefs, prefs);
  if (typeof installNudge === "function") installNudge();
  if (S.mode === "daily") {
    const all = store.get(KEY.daily, {});
    if (!all[S.day]) {
      all[S.day] = { won, total };
      store.set(KEY.daily, all);
      updateStreak(S.day);
    }
  }
  const el = () => $("place");
  if (S.mode === "tour") {
    const t = store.get("vdp-tours", {});
    if (!t[S.tourId]) {
      t[S.tourId] = { won, total };
      store.set("vdp-tours", t);
    }
  }
  if (S.mode === "quick") {
    if (el()) el().textContent = L("Быстрая смена в рейтинг не идёт — это разминка перед настоящей неделей.", "Quick shifts don’t count toward the leaderboard.");
    return;
  }
  if (S.mode === "pack" || S.mode === "daily" && !S.ranked || S.mode === "tour" && !S.ranked) {
    if (el()) el().textContent = S.mode === "pack" ? L("Брендированная неделя в общий рейтинг не идёт.", "Branded weeks don’t count toward the main leaderboard.") : L("Повторная попытка: в зачёт идёт только первая.", "Replay: only your first attempt counts.");
    return;
  }
  const entry = {
    player_id: prefs.playerId,
    name: (S.name || prefs.name || "").trim().slice(0, 24) || L("Сотрудник", "Employee"),
    // пустое имя база не примет — результат не попал бы в рейтинг dept: (S.dept || '').slice(0, 24), prof: S.prof, won,
    step: won ? WEEK_LEN : S.step,
    total,
    psyche: S.res.psyche,
    energy: S.res.energy,
    boss: S.res.boss,
    colleagues: S.res.colleagues,
    death,
    mode: S.mode,
    day: S.mode === "daily" ? S.day : null,
    overheat: !!high,
    ...S.mode === "tour" ? { tour_id: S.tourId } : {}
  };
  try {
    try {
      await board.submit(entry);
    } catch (err) {
      if (!offlineErr(err)) throw err;
      outboxAdd(entry);
      if (el()) el().textContent = L("Нет связи, результат сохранён локально и уйдёт в рейтинг, когда сеть вернётся.", "You’re offline — your score is saved on this device and will be submitted once you’re back online.");
      return;
    }
    board.touch("finished", entry.step).catch(() => {
    });
    if (S.mode === "tour") {
      const rows = (await board.rpc("tournament_board", { p_code: S.tourCode })).filter((r) => r.name);
      const pos2 = rows.findIndex((r) => r.name === prefs.name && r.played_at) + 1;
      if (el()) el().innerHTML = pos2 ? "<b>#".concat(pos2, "</b><span>").concat(L("место в турнире офиса из ".concat(rows.length), "place in the office tournament out of ".concat(rows.length)), "</span>") : "<span>".concat(L("Результат записан в турнир", "Score saved to the tournament"), "</span>");
      return;
    }
    const list = S.mode === "daily" ? await board.daily(S.day) : await board.top(), tag = await myTag;
    const pos = list.findIndex((e) => e.tag === tag) + 1;
    if (!el()) return;
    el().innerHTML = pos ? "<b>#".concat(pos, "</b><span>").concat(S.mode === "daily" ? L("место в рейтинге дня из ".concat(list.length), "place on today’s leaderboard out of ".concat(list.length)) : L("ваше место в рейтинге".concat(board.online ? " офиса" : " на этом устройстве", " (лучшая неделя)"), "your rank".concat(board.online ? " in the office" : " on this device", " (best week)")), "</span>") : "<span>".concat(L("Результат записан в рейтинг", "Score saved to the leaderboard"), "</span>");
  } catch (err) {
    if (el()) el().textContent = L("Не удалось записать результат: ".concat(err.message, "."), "Couldn’t save your score: ".concat(err.message, "."));
  }
}
const OUTBOX = "vdp-outbox";
const offlineErr = (err) => err instanceof TypeError || !navigator.onLine;
function outboxAdd(entry) {
  const q = store.get(OUTBOX, []);
  q.push(entry);
  store.set(OUTBOX, q.slice(-20));
}
let flushing = false;
async function flushOutbox() {
  if (flushing || !board.online) return;
  flushing = true;
  try {
    let sent = 0;
    for (let q = store.get(OUTBOX, []); q.length; q = store.get(OUTBOX, [])) {
      if (sent) await new Promise((r) => setTimeout(r, 11e3));
      try {
        await board.submit(q[0]);
        sent++;
      } catch (err) {
        if (offlineErr(err)) break;
        if (/Слишком часто/.test(err.message)) {
          await new Promise((r) => setTimeout(r, 11e3));
          continue;
        }
      }
      store.set(OUTBOX, store.get(OUTBOX, []).slice(1));
    }
    if (sent) toast(sent > 1 ? L("Связь есть: отправлено результатов — ".concat(sent), "Back online: ".concat(sent, " scores sent")) : L("Связь есть: результат отправлен в рейтинг", "Back online: score sent to the leaderboard"));
  } finally {
    flushing = false;
  }
}
addEventListener("online", flushOutbox);
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = $("confetti"), ctx = cv.getContext("2d"), dpr = devicePixelRatio || 1;
  cv.hidden = false;
  cv.width = innerWidth * dpr;
  cv.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ["--magenta", "--cyan", "--up", "--down", "--cyan-l"].map((v) => cs.getPropertyValue(v).trim()).concat("#b26bff");
  const P = Array.from({ length: 170 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 13,
    vy: -Math.random() * 13 - 4,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 8,
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.3,
    c: rnd(cols)
  }));
  const t0 = performance.now();
  (function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) {
      p.vy += 0.32;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (now - t0 < 4200) requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      cv.hidden = true;
    }
  })(t0);
}
const CH_STAT = { psyche: "p", energy: "e", boss: "b", colleagues: "c" };
const CH_KEY = Object.fromEntries(Object.entries(CH_STAT).map(([k, v]) => [v, k]));
function challengeCode(won, k) {
  const key = won ? [...RES].sort((a, b) => S.res[a.k] - S.res[b.k])[0].k : k;
  const num = won ? RES.reduce((a, r) => a + S.res[r.k], 0) : S.step;
  return "".concat(S.day.replace(/-/g, "")).concat(won ? "w" : "l").concat(String(num).padStart(3, "0")).concat(CH_STAT[key]).concat(S.res[key]);
}
function parseChallenge(code) {
  const m = /^(\d{4})(\d{2})(\d{2})([wl])(\d{3})([pebc])(\d{1,3})$/.exec(code || "");
  if (!m || m[4] === "l" && +m[5] > WEEK_LEN - 1 || m[4] === "w" && +m[5] > 400) return null;
  return { day: "".concat(m[1], "-").concat(m[2], "-").concat(m[3]), won: m[4] === "w", num: +m[5], stat: CH_KEY[m[6]], val: Math.min(100, +m[7]) };
}
const chScore = (c) => c.won ? 1e3 + c.num : c.num;
const chResult = (c) => c.won ? L("неделя закрыта, счёт ".concat(c.num, "/400, ").concat(resName(c.stat), " ").concat(c.val, "%"), "week survived, score ".concat(c.num, "/400, ").concat(resName(c.stat), " ").concat(c.val, "%")) : L("неделя завалена: ".concat(DAYS[dayOf(c.num)].toLowerCase(), ", ").concat(PHASES[slotPh(c.num)].name.toLowerCase(), ", ").concat(resName(c.stat), " ").concat(c.val, "%"), "week wrecked: ".concat(dayName(dayOf(c.num)), " ").concat(phaseName(slotPh(c.num)).toLowerCase(), ", ").concat(resName(c.stat), " ").concat(c.val, "%"));
const chName = (c) => c.by || L("Коллега", "Colleague");
function challengeLine(won, k) {
  const c = prefs.challenge;
  if (S.mode !== "daily" || !c || c.day !== S.day || c.done) return "";
  const mine = parseChallenge(challengeCode(won, k)), d = chScore(mine) - chScore(c);
  c.done = true;
  c.beat = d > 0;
  store.set(KEY.prefs, prefs);
  return '<div class="place challenge"><b>'.concat(d > 0 ? L("Вызов выигран!", "Challenge won!") : d === 0 ? L("Ничья", "It’s a tie") : L("Вызов проигран", "Challenge lost"), "</b>\n    <span>").concat(esc(chName(c)), ": ").concat(chResult(c), "<br>").concat(L("Вы", "You"), ": ").concat(chResult(mine), "</span></div>");
}
function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = t;
  }
  ctx.fillText(line, x, y);
  return y + lh;
}
function memeLine(won) {
  const sorted = [...RES].sort((a, b) => S.res[a.k] - S.res[b.k]), lo = sorted[0], hi = sorted[3];
  const d = dayOf(S.step);
  return "".concat(won ? L("Я пережил(а) неделю", "I survived the week") : L("Неделя завалена в ".concat(["понедельник", "вторник", "среду", "четверг", "пятницу"][d]), "My week got wrecked on ".concat(dayName(d))), ": ").concat(lo.name, " ").concat(S.res[lo.k], "%, ").concat(hi.name, " ").concat(S.res[hi.k], "%");
}
async function share(won, k) {
  try {
    await document.fonts.ready;
  } catch (e) {
  }
  const total = RES.reduce((a, r) => a + S.res[r.k], 0);
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  const glow = (c2, b) => {
    ctx.shadowColor = c2;
    ctx.shadowBlur = b;
  };
  ctx.fillStyle = "#07070d";
  ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W * 0.15, H * 1.1, 0, W * 0.15, H * 1.1, 900);
  bg.addColorStop(0, "rgba(178,107,255,.35)");
  bg.addColorStop(1, "rgba(178,107,255,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const bg2 = ctx.createRadialGradient(W * 0.9, -100, 0, W * 0.9, -100, 800);
  bg2.addColorStop(0, "rgba(45,226,230,.3)");
  bg2.addColorStop(1, "rgba(45,226,230,0)");
  ctx.fillStyle = bg2;
  ctx.fillRect(0, 0, W, H);
  const kick = S.mode === "daily" ? L("НЕДЕЛЯ ДНЯ ".concat(dayLabel(S.day)), "DAILY WEEK ".concat(dayLabel(S.day))) : S.mode === "career" && C ? L("НЕДЕЛЯ ".concat(Math.max(1, C.week - 1), " ИЗ ").concat(YEAR), "WEEK ".concat(Math.max(1, C.week - 1), " OF ").concat(YEAR)) : L("ВЫЖИТЬ ДО ПЯТНИЦЫ", "SURVIVE TILL FRIDAY");
  ctx.fillStyle = "#7df9ff";
  glow("rgba(45,226,230,.9)", 20);
  ctx.font = '700 30px "JetBrains Mono", monospace';
  ctx.fillText(kick, 80, 130);
  ctx.fillStyle = "#ffffff";
  glow(won ? "rgba(255,59,212,.9)" : "rgba(255,59,107,.9)", 40);
  ctx.font = '800 118px Unbounded, "Arial Black", sans-serif';
  ctx.fillText(L("НЕДЕЛЯ", "WEEK"), 80, 290);
  ctx.fillStyle = won ? "#ff3bd4" : "#ff3b6b";
  ctx.fillText(won ? L("ПЕРЕЖИТА", "SURVIVED") : L("ЗАВАЛЕНА", "WRECKED"), 80, 420);
  glow("transparent", 0);
  ctx.fillStyle = "#d6d2ef";
  ctx.font = "800 42px Nunito, sans-serif";
  let y = wrap(ctx, "".concat(memeLine(won), "."), 80, 540, W - 160, 58);
  y += 30;
  RES.forEach((r, i) => {
    const bx = 80, by = y + i * 100, bw = W - 160 - 220;
    const col = { psyche: "#b26bff", energy: "#c6f01a", boss: "#ff3b6b", colleagues: "#2de2e6" }[r.k];
    ctx.font = "800 38px Nunito, sans-serif";
    ctx.fillStyle = "#f2f0ff";
    ctx.fillText(r.name, bx, by + 38);
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.roundRect(bx, by + 54, bw, 32, 16);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = col;
    glow(col, 24);
    ctx.beginPath();
    ctx.roundRect(bx + 5, by + 59, Math.max(22, (bw - 10) * S.res[r.k] / 100), 22, 11);
    ctx.fill();
    glow("transparent", 0);
    ctx.fillStyle = r.k === k ? "#ff3b6b" : "#7df9ff";
    ctx.font = '700 48px "JetBrains Mono", monospace';
    ctx.textAlign = "right";
    ctx.fillText("".concat(S.res[r.k], "%"), W - 80, by + 84);
    ctx.textAlign = "left";
  });
  y += 4 * 100 + 30;
  ctx.fillStyle = "rgba(255,255,255,.14)";
  ctx.fillRect(80, y, W - 160, 2);
  ctx.fillStyle = "#ffffff";
  glow("rgba(255,59,212,.8)", 24);
  ctx.font = '700 40px "JetBrains Mono", monospace';
  ctx.fillText(won ? L("СЧЁТ ".concat(total, "/400"), "SCORE ".concat(total, "/400")) : S.name.toUpperCase(), 80, y + 70);
  glow("rgba(212,255,58,.7)", 16);
  ctx.fillStyle = "#d4ff3a";
  ctx.textAlign = "right";
  ctx.font = "900 36px Nunito, sans-serif";
  ctx.fillText(won ? rank(total) : TRAITS[S.trait || "workaholic"].name, W - 80, y + 70);
  ctx.textAlign = "left";
  glow("transparent", 0);
  ctx.font = "800 32px Nunito, sans-serif";
  ctx.fillStyle = "#b9b4d6";
  ctx.fillText(S.mode === "daily" ? L("Сможешь лучше? Та же неделя — по ссылке", "Think you can beat it? Same week at the link") : L("А ты доживёшь до пятницы?", "Can you make it to Friday?"), 80, H - 90);
  const url = cv.toDataURL("image/png");
  const daily = S.mode === "daily", link = daily ? await challengeLink(challengeCode(won, k)) : (await referralLink("friends")).url;
  const c = prefs.challenge, reply = daily && (c == null ? void 0 : c.day) === S.day && c.done ? "".concat(chName(c), ", ").concat(c.beat ? L("вызов принят и выигран", "challenge accepted and won") : L("вызов принят", "challenge accepted"), "! ") : "";
  const text = daily ? L("".concat(reply).concat(memeLine(won), ". Неделя дня ").concat(dayLabel(S.day), " в «Выжить до пятницы» — сможешь лучше? Та же неделя по ссылке:"), "".concat(reply).concat(memeLine(won), ". Daily Week ").concat(dayLabel(S.day), " in Survive till Friday — think you can do better? Same week here:")) : L("".concat(memeLine(won), ". «Выжить до пятницы» — а ты доживёшь до пятницы?"), "".concat(memeLine(won), ". Survive till Friday — can you make it to Friday?"));
  const full = "".concat(text, " ").concat(link), enc = encodeURIComponent;
  track("share", { detail: daily ? "challenge" : "meme" });
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass" role="dialog" aria-modal="true" aria-label="'.concat(L("Поделиться результатом", "Share result"), '">\n    <img src="').concat(url, '" alt="').concat(L("Мем-карточка", "Meme card"), ": ").concat(esc(memeLine(won)), '">\n    <p class="share-text">').concat(esc(full), "</p>\n    ").concat(navigator.canShare ? '<button class="btn-main" id="shareImg">'.concat(L("Отправить картинку и ссылку", "Send image & link"), "</button>") : "", '\n    <div class="share-grid">\n      <a href="https://t.me/share/url?url=').concat(enc(link), "&text=").concat(enc(text), '" target="_blank" rel="noopener" id="shTgLink">Telegram</a>\n      <button type="button" id="shVk" class="sh-vk">').concat(L("ВКонтакте", "VK"), '</button>\n      <a href="https://wa.me/?text=').concat(enc(full), '" target="_blank" rel="noopener">WhatsApp</a>\n      <a href="').concat(url, '" download="vyzhit-do-pyatnitsy.png" id="dlImg">').concat(L("Скачать картинку", "Download image"), '</a>\n      <button id="copyTxt">').concat(L("Скопировать текст", "Copy text"), '</button>\n    </div>\n    <p class="field-note">').concat(L("Для Slack и рабочей почты: скачайте картинку и вставьте вместе с текстом.", "For Slack or work email: download the image and paste it in with the text."), '</p>\n    <div class="toast" id="toast" aria-live="polite"></div>\n    <button class="btn-ghost" id="closeM">').concat(L("Закрыть", "Close"), "</button></div>");
  m.hidden = false;
  if (TG) $("shTgLink").onclick = (e) => {
    e.preventDefault();
    TG.openTelegramLink("https://t.me/share/url?url=".concat(enc(link), "&text=").concat(enc(text)));
  };
  $("shVk").onclick = () => vkShare(link, text, daily ? "challenge" : "result");
  $("closeM").onclick = () => {
    var _a2;
    m.hidden = true;
    (_a2 = $("share")) == null ? void 0 : _a2.focus();
  };
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
  if ($("shareImg")) $("shareImg").onclick = async () => {
    try {
      const blob = await (await fetch(url)).blob(), file = new File([blob], "vyzhit-do-pyatnitsy.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: full });
      else await navigator.share({ text, url: link });
    } catch (e) {
    }
  };
  $("copyTxt").onclick = () => {
    navigator.clipboard.writeText(full).then(
      () => $("toast").textContent = L("Текст со ссылкой скопирован — вставьте в чат", "Text and link copied — paste it into the chat"),
      () => {
        $("toast").textContent = full;
      }
    );
  };
  $("copyTxt").focus();
}
