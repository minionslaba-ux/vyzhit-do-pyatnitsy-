/* сгенерировано tools/make-legacy.js из js/psy.js — не править */
const PSY_TIP_CHUNKS = 6, PSY_TEST_CHUNKS = 10;
let PSY = null, PSY_TESTS = null, psyCtx = "";
const psyChunk = (kind, n) => fetch("data/psy/".concat(kind, "_").concat(1 + Math.floor(Math.random() * n), ".json")).then((r) => r.ok ? r.json() : []).catch(() => []);
const psyLoad = () => PSY ? Promise.resolve(PSY) : Promise.all([fetch("data/tips.json").then((r) => r.ok ? r.json() : null).catch(() => null), psyChunk("tips", PSY_TIP_CHUNKS)]).then(([d, more]) => {
  if (!d) return null;
  if (Array.isArray(more)) d.tips = d.tips.concat(more);
  return PSY = d;
});
const psyT = (x) => (EN ? x.en : x.ru) || x.ru || "";
const psyDayTip = () => {
  const t = PSY.tips.filter((x) => x.cat !== "keep");
  return t[Math.floor(seeded("psy-".concat(today()))() * t.length)];
};
const psyRnd = (list) => list[Math.floor(Math.random() * list.length)];
const PSY_NEAR = {
  fired: ["fired", "selfkind", "mind"],
  tired: ["tired", "rest", "breaks", "sleep"],
  stress: ["stress", "mind", "breaks"],
  streak: ["streak", "selfkind", "mind"],
  boss: ["boss", "boundaries", "workload"],
  team: ["team", "social"],
  late: ["late", "sleep"],
  session: ["session", "breaks", "digital"],
  win: ["win", "keep", "rest"],
  monday: ["monday", "workload", "focus"],
  friday: ["friday", "rest"],
  high: ["boundaries", "workload", "stress"]
};
function psyTip(cat) {
  for (const c of PSY_NEAR[cat] || [cat]) {
    const l = PSY.tips.filter((t) => t.cat === c);
    if (l.length) return psyRnd(l);
  }
  return psyRnd(PSY.tips.filter((t) => t.cat !== "keep"));
}
const PSY_SAY = {
  fired: [L("Уволили — это про одну работу, а не про вашу ценность. Давайте сначала выдохнем.", "Getting fired is about one job, not about your worth. Let’s breathe out first."), "sad"],
  stress: [L("Кукуха на нуле — знакомо. Давайте вернём её на место маленькими шагами.", "Sanity at zero — I know the feeling. Let’s bring it back in small steps."), "sad"],
  tired: [L("Энергия кончилась — значит, вы много отдали. Пора немного вернуть себе.", "Out of energy means you gave a lot. Time to take a little back."), "sad"],
  boss: [L("С начальством не сложилось. Бывает. Поговорим про границы?", "Things went wrong with the boss. It happens. Shall we talk about boundaries?"), "neutral"],
  team: [L("С коллегами разладилось. Отношения можно чинить — по одному разговору.", "Things broke down with coworkers. Relationships can be mended, one talk at a time."), "neutral"],
  high: [L("Перестарались: когда всё на максимуме, тоже перегреваешься. Поговорим о мере?", "You overdid it: maxing everything out overheats you too. Shall we talk about balance?"), "neutral"],
  streak: [L("Несколько недель подряд не везёт. Это не приговор — давайте сделаем паузу и разберёмся.", "A few bad weeks in a row. It’s not a verdict — let’s pause and sort it out."), "sad"],
  late: [L("Уже поздно. Неделя подождёт до утра, а сон — нет.", "It’s late. The week can wait till morning; sleep can’t."), "neutral"],
  session: [L("Вы давно в игре. Отличный момент встать и размяться.", "You’ve been playing a while. A great moment to stand up and stretch."), "happy"],
  win: [L("Вы дожили до пятницы! Давайте закрепим то, что помогло.", "You made it to Friday! Let’s keep what helped."), "joy"],
  edge: [L("Пятница ваша, но шкалы почти на нуле. Выжили — теперь восстановимся.", "Friday is yours, but the meters are nearly empty. You survived — now let’s recover."), "sad"],
  monday: [L("Понедельник. Начнём неделю бережно — без подвигов с утра.", "Monday. Let’s start the week gently — no heroics first thing."), "happy"]
};
const PSY_NOTE = () => L("🤖 Мира — персонаж игры. Её советы — про бережные привычки и не заменяют специалиста. Если плохо долго — поговорите с врачом или психологом.", "🤖 Mira is a game character. Her tips are about kinder habits and don’t replace a professional. If you feel bad for a long time, talk to a doctor or a psychologist.");
const MIRA_FACE = { skin: 1, hair: "long", hairC: "#5a2e1a", glasses: true, earrings: true, shirt: "#2de28a", bg: "#12382a" };
const miraHead = () => '<svg class="mira-head" x="136" y="14" width="56" height="56" viewBox="0 0 64 64" overflow="visible">\n  '.concat(HAIR.long(MIRA_FACE.hairC), '<rect x="28" y="44" width="8" height="8" fill="').concat(SKIN[1], '"/>\n  <ellipse cx="32" cy="32" rx="14" ry="16" fill="').concat(SKIN[1], '"/>\n  <path d="M18 26 q4 -10 14 -10 q10 0 14 10 q-6 -4 -14 -4 q-8 0 -14 4z" fill="').concat(MIRA_FACE.hairC, '"/>\n  <circle cx="18" cy="38" r="2" fill="#ffd23a"/><circle cx="46" cy="38" r="2" fill="#ffd23a"/>\n  <circle class="blush" cx="22" cy="38" r="2.6"/><circle class="blush" cx="42" cy="38" r="2.6"/>\n  <g class="expr">').concat(exprSvg("happy"), '</g><ellipse class="mtalk" cx="32" cy="43" rx="3.4" ry="2.6"/>\n  <g class="glasses"><circle cx="25" cy="31" r="5.5"/><circle cx="39" cy="31" r="5.5"/><path d="M30.5 31 h3"/></g></svg>');
const psySceneSvg = () => '<svg class="psy-scene-svg" viewBox="0 0 320 132" preserveAspectRatio="xMidYMax slice" aria-hidden="true">\n  <rect class="ps-wall" width="320" height="132"/><rect class="ps-floor" y="104" width="320" height="28"/>\n  <g class="ps-window"><rect x="18" y="14" width="74" height="58" rx="5" class="ps-frame"/><rect x="22" y="18" width="66" height="50" rx="3" class="ps-sky"/>\n    <circle cx="74" cy="32" r="7" class="ps-sun"/><g class="ps-cloud"><ellipse cx="40" cy="40" rx="11" ry="5"/><ellipse cx="48" cy="37" rx="8" ry="5"/></g>\n    <path d="M55 18 v50 M22 43 h66" class="ps-bar"/></g>\n  <g class="ps-shelf"><rect x="226" y="30" width="48" height="3" rx="1"/><rect x="230" y="14" width="6" height="16" fill="#ff8a3b"/><rect x="237" y="17" width="5" height="13" fill="#3a7bd5"/><rect x="243" y="12" width="7" height="18" fill="#b26bff"/><rect x="252" y="19" width="5" height="11" transform="rotate(14 254 30)" fill="#ffd23a"/><circle cx="266" cy="25" r="5" fill="#2de28a"/></g>\n  <ellipse class="ps-rug" cx="160" cy="118" rx="96" ry="10"/>\n  <g class="ps-plant"><path d="M104 104 l4 -14 h16 l4 14z" class="ps-pot"/><g class="ps-leaves"><path d="M116 90 q-16 -10 -14 -30 q12 8 14 30z"/><path d="M116 90 q2 -26 16 -34 q2 20 -16 34z"/><path d="M116 90 q-6 -18 2 -40 q8 16 -2 40z"/></g></g>\n  <g class="ps-lamp"><circle cx="292" cy="34" r="26" class="ps-glow"/><path d="M292 40 v64 M282 104 h20" class="ps-pole"/><path d="M280 40 l6 -16 h12 l6 16z" class="ps-shade"/></g>\n  <g class="ps-sit"><g class="ps-chair"><rect x="128" y="50" width="72" height="56" rx="18"/><rect x="118" y="74" width="20" height="32" rx="9"/><rect x="190" y="74" width="20" height="32" rx="9"/></g>\n  <g class="mira"><g class="mira-body"><path d="M140 104 q0 -38 24 -40 q24 2 24 40z" class="ps-cardigan"/><path d="M158 66 l6 14 l6 -14" class="ps-collar"/>\n    <rect x="148" y="84" width="22" height="16" rx="2" transform="rotate(-8 159 92)" class="ps-note"/><path d="M152 89 h13 M152 93 h10" transform="rotate(-8 159 92)" class="ps-lines"/>\n    <circle cx="172" cy="92" r="4.5" fill="'.concat(SKIN[1], '"/></g>').concat(miraHead(), '</g></g>\n  <g class="ps-table"><rect x="222" y="86" width="36" height="4" rx="2"/><path d="M240 90 v14"/><rect x="232" y="74" width="12" height="12" rx="3" class="ps-mug"/>\n    <path d="M244 77 q5 2 0 6" class="ps-handle"/><g class="ps-steam"><path d="M235 70 q-3 -5 0 -10 q3 -5 0 -10"/><path d="M241 70 q-3 -5 0 -10 q3 -5 0 -10"/></g></g>\n</svg>');
function psyMira(mood = "happy", { talk = true, think = false } = {}) {
  const sc = $("modal").querySelector(".psy-scene");
  if (!sc) return;
  setMood(sc, mood);
  sc.classList.toggle("think", think);
  clearTimeout(sc._t);
  sc.classList.remove("talk");
  if (talk && !FX.off) {
    void sc.offsetWidth;
    sc.classList.add("talk");
    sc._t = setTimeout(() => sc.classList.remove("talk"), 2200);
  }
}
function psyModal(inner, mood = "happy", opts) {
  const m = $("modal");
  let box = m.hidden ? null : m.querySelector(".psy-box");
  if (!box) {
    m.innerHTML = '<div class="modal-box glass psy-box" role="dialog" aria-modal="true" aria-labelledby="psyTitle">\n      <div class="psy-scene" data-mood="happy">'.concat(psySceneSvg(), '</div><div class="psy-name"><b id="psyTitle">').concat(L("Кабинет Миры", "Mira’s office"), "</b><small>").concat(L("психолог офиса · 🤖 персонаж игры", "office psychologist · 🤖 game character"), '</small></div>\n      <div class="psy-body" aria-live="polite"></div>\n      <div class="psy-acts"><button class="btn-ghost" type="button" data-psy="more">💡 ').concat(L("Ещё совет", "Another tip"), '</button><button class="btn-ghost" type="button" data-psy="quiz">📝 ').concat(L("Самопроверка", "Self-check"), '</button><button class="btn-ghost" type="button" data-psy="breath">🌬️ ').concat(L("Минута дыхания", "Breathing minute"), '</button></div>\n      <p class="psy-note">').concat(PSY_NOTE(), '</p>\n      <button class="btn-main" type="button" data-psy="close">').concat(L("Спасибо, Мира", "Thanks, Mira"), "</button></div>");
    m.hidden = false;
    box = m.querySelector(".psy-box");
    box.querySelectorAll("[data-psy]").forEach((b) => b.onclick = () => {
      const a = b.dataset.psy;
      if (a === "close") {
        psyBye();
        return;
      }
      if (a === "more") {
        psyModal(psyTipHtml(psyRnd(PSY.tips.filter((x) => x.cat !== "keep")), L("Ещё один совет", "One more tip")));
        track("psy", { detail: "more" });
      }
      if (a === "quiz") psyCheck(psyCtx);
      if (a === "breath") {
        m.hidden = true;
        m.innerHTML = "";
        track("psy", { detail: "breath" });
        playBreak(51);
      }
    });
  }
  const body = box.querySelector(".psy-body");
  body.innerHTML = inner;
  body.classList.remove("psy-in");
  void body.offsetWidth;
  body.classList.add("psy-in");
  psyMira(mood, opts);
}
function psyBye() {
  const m = $("modal"), sc = m.querySelector(".psy-scene");
  const done = () => {
    m.hidden = true;
    m.innerHTML = "";
  };
  if (!sc || FX.off) return done();
  setMood(sc, "joy");
  sc.classList.add("bye");
  setTimeout(done, 650);
}
const psyTipHtml = (t, head) => '<small class="psy-kick">'.concat(head, '</small><p class="psy-tip">').concat(esc(psyT(t)), "</p>");
async function openPsy(source = "menu", cat = "") {
  var _a;
  if (!await psyLoad()) {
    toast(L("Кабинет Миры сейчас не открывается — проверьте интернет", "Mira’s office won’t open — check your connection"));
    return;
  }
  track("psy", { detail: cat ? "".concat(source, ":").concat(cat) : source });
  bus.emit("psy", { source, cat });
  if (!cat && ((_a = prefs.psyCall) == null ? void 0 : _a.d) === today()) cat = prefs.psyCall.cat;
  if (prefs.psyCall) {
    delete prefs.psyCall;
    store.set(KEY.prefs, prefs);
    renderPsyBtn();
  }
  psyCtx = cat;
  const say = PSY_SAY[cat];
  if (say) psyModal('<p class="psy-greet">'.concat(esc(say[0]), "</p>").concat(psyTipHtml(psyTip(cat), L("Совет для этой ситуации", "A tip for this moment"))), say[1]);
  else psyModal('<p class="psy-greet">'.concat(esc(psyT(psyRnd(PSY.greet))), "</p>").concat(psyTipHtml(psyDayTip(), L("Совет дня", "Tip of the day"))));
}
const PSY_SITUATION_TEST = { high: "boundaries", edge: "tired" };
const psyDone = () => store.get("vdp-psy-tests", []);
async function psyCheck(cat = "") {
  if (!PSY_TESTS) {
    const t = await psyChunk("tests", PSY_TEST_CHUNKS);
    PSY_TESTS = Array.isArray(t) ? t : [];
  }
  if (!PSY_TESTS.length) return psyQuiz(0, []);
  const done = new Set(psyDone()), fresh = PSY_TESTS.filter((t) => !done.has(t.id));
  const pool = fresh.length ? fresh : PSY_TESTS, c = PSY_SITUATION_TEST[cat] || cat;
  let list = [];
  for (const k of PSY_NEAR[c] || [c]) {
    list = pool.filter((t) => t.cat === k);
    if (list.length) break;
  }
  const test = psyRnd(list.length ? list : pool);
  psyTest(test, 0, 0);
}
function psyTest(test, i, sum) {
  const q = test.q[i];
  if (!q) {
    const band = sum <= 2 ? 0 : sum <= 4 ? 1 : 2, r = test.r[band];
    const done = psyDone();
    if (!done.includes(test.id)) {
      done.push(test.id);
      store.set("vdp-psy-tests", done.slice(-2e3));
    }
    prefs.psyTests = (prefs.psyTests || 0) + 1;
    store.set(KEY.prefs, prefs);
    track("psy", { detail: "test:".concat(test.id, ":").concat(sum) });
    const head = [L("Похоже, у вас всё неплохо", "Looks like you’re doing fine"), L("Есть звоночки", "Some warning signs"), L("Похоже, вы на пределе", "Looks like you’re at your limit")][band];
    psyModal(
      '<small class="psy-kick">'.concat(esc(psyT(test)), " · ").concat(L("итог", "result"), '</small>\n      <div class="psy-meter b').concat(band, '" aria-hidden="true"><i style="width:').concat(Math.round(100 * sum / 6), '%"></i></div>\n      <p class="psy-q">').concat(head, '</p><p class="psy-tip">').concat(esc(psyT(r)), '</p>\n      <p class="psy-count">').concat(L("Пройдено тестов: ".concat(prefs.psyTests), "Self-checks done: ".concat(prefs.psyTests)), ' · <button class="psy-link" type="button" data-psy-next>').concat(L("Другой тест →", "Another test →"), "</button></p>"),
      ["joy", "happy", "sad"][band]
    );
    $("modal").querySelector("[data-psy-next]").onclick = () => psyCheck("");
    return;
  }
  const order = shuffle([0, 1, 2]);
  psyModal('<small class="psy-kick">'.concat(esc(psyT(test)), " · ").concat(L("вопрос ".concat(i + 1, " из 3"), "question ".concat(i + 1, " of 3")), '</small><p class="psy-q">').concat(esc(psyT(q)), '</p>\n    <div class="psy-ans">').concat(order.map((j) => '<button class="btn-ghost" type="button" data-a="'.concat(j, '">').concat(esc(psyT(q.a[j])), "</button>")).join(""), "</div>\n    ").concat(i === 0 ? '<p class="psy-count">'.concat(L("Самопроверка, а не диагноз: отвечайте про последние дни.", "A self-check, not a diagnosis: answer about the last few days."), "</p>") : ""), "neutral", { think: true });
  $("modal").querySelectorAll("[data-a]").forEach((b) => b.onclick = () => psyTest(test, i + 1, sum + (+q.a[+b.dataset.a].s || 0)));
}
function psyQuiz(i, picks) {
  const q = PSY.quiz[i];
  if (!q) {
    const cats = picks.filter((c) => c !== "keep"), cat = cats.length ? cats[Math.floor(Math.random() * cats.length)] : "keep";
    const pool = PSY.tips.filter((x) => x.cat === cat), tip = pool.length ? psyRnd(pool) : psyDayTip();
    track("psy", { detail: "quiz:".concat(picks.join(",")).slice(0, 60) });
    return psyModal('<p class="psy-greet">'.concat(cats.length ? L("Спасибо за честность. Вот с чего я бы начала:", "Thanks for being honest. Here’s where I’d start:") : L("Звучит так, будто вы неплохо о себе заботитесь. Так держать!", "Sounds like you look after yourself pretty well. Keep it up!"), "</p>").concat(psyTipHtml(tip, L("Совет для вас", "A tip for you"))), cats.length ? "happy" : "joy");
  }
  psyModal('<small class="psy-kick">'.concat(L("Вопрос ".concat(i + 1, " из ").concat(PSY.quiz.length), "Question ".concat(i + 1, " of ").concat(PSY.quiz.length)), '</small><p class="psy-q">').concat(esc(psyT(q)), '</p>\n    <div class="psy-ans">').concat(q.a.map((a, j) => '<button class="btn-ghost" type="button" data-a="'.concat(j, '">').concat(esc(psyT(a)), "</button>")).join(""), "</div>"), "neutral", { think: true });
  $("modal").querySelectorAll("[data-a]").forEach((b) => b.onclick = () => psyQuiz(i + 1, [...picks, q.a[+b.dataset.a].cat]));
}
function renderPsyBtn() {
  var _a;
  const after = $("pzRow") || $("brkDay");
  if (!after) return;
  let b = $("psyOpen");
  if (!b) {
    b = Object.assign(document.createElement("button"), { type: "button", id: "psyOpen", className: "psy-open" });
    b.onclick = () => openPsy("menu");
  }
  if (after.nextElementSibling !== b) after.after(b);
  const call = ((_a = prefs.psyCall) == null ? void 0 : _a.d) === today() ? PSY_SAY[prefs.psyCall.cat] : null;
  b.classList.toggle("calls", !!call);
  b.innerHTML = '<span class="face psy-mini" aria-hidden="true">'.concat(faceSvg(MIRA_FACE), "</span><span><b>").concat(L("Кабинет психолога", "Psychologist’s office")).concat(call ? ' <em class="psy-dot">1</em>' : "", "</b><small>").concat(call ? "".concat(L("Мира зовёт", "Mira asks"), ": ").concat(esc(call[0])) : L("Мира: совет дня и самопроверка против выгорания", "Mira: tip of the day and a burnout self-check"), '</small></span><i aria-hidden="true">›</i>');
  b.querySelector(".expr").innerHTML = exprSvg(call ? "neutral" : "happy");
}
bus.on("menu", () => setTimeout(renderPsyBtn, 0));
setTimeout(renderPsyBtn, 0);
const psySessionStart = Date.now();
let psySessionNudged = false;
const psyCall = (cat) => {
  prefs.psyCall = { cat, d: today() };
  store.set(KEY.prefs, prefs);
};
const psyFreeScreen = () => !busy && !splashOn && $("modal").hidden && !window.vdpPaused && !($("quiz") && !$("quiz").hidden);
function psyWhisper(cat, delay = 900) {
  setTimeout(async () => {
    if (!await psyLoad() || views.game.hidden) return;
    let tries = 0;
    const go = () => {
      if (psyFreeScreen()) toast("🛋️ ".concat(L("Мира", "Mira"), ": ").concat(psyT(psyTip(cat))));
      else if (++tries < 20) setTimeout(go, 700);
    };
    go();
  }, delay);
}
const PSY_LOW = { psyche: "stress", energy: "tired", boss: "boss", colleagues: "team" };
bus.on("answer", () => {
  if (!(S == null ? void 0 : S.res) || S.psyNudged || S.mode === "quick" || prefs.psyQuiet) return;
  const k = Object.keys(PSY_LOW).find((k2) => S.res[k2] > 0 && S.res[k2] <= (k2 === "psyche" || k2 === "energy" ? 20 : 15));
  if (!k) return;
  S.psyNudged = true;
  track("psy", { detail: "low:".concat(k) });
  psyWhisper(PSY_LOW[k]);
});
bus.on("deck", (S2) => {
  if (prefs.psyQuiet || S2.mode === "quick") return;
  const h = (/* @__PURE__ */ new Date()).getHours(), day = (/* @__PURE__ */ new Date()).getDay(), last = store.get("vdp-psy-deck", "");
  const cat = h >= 23 || h < 5 ? "late" : day === 1 && h >= 5 && h < 13 ? "monday" : "";
  if (!cat || last === today() + cat) return;
  store.set("vdp-psy-deck", today() + cat);
  track("psy", { detail: "deck:".concat(cat) });
  psyWhisper(cat, 5200);
});
bus.on("weekEnd", (x) => {
  prefs.psyLoss = x.won ? 0 : (prefs.psyLoss || 0) + 1;
  store.set(KEY.prefs, prefs);
  const fired = !x.won && x.mode === "career";
  const edge = x.won && x.res && Math.min(x.res.psyche, x.res.energy) <= 20;
  const long = !psySessionNudged && Date.now() - psySessionStart > 45 * 6e4;
  let cat = "";
  if (!x.won) cat = prefs.psyLoss >= 3 ? "streak" : x.high ? "high" : x.stat === "psyche" ? "stress" : x.stat === "energy" ? "tired" : fired ? "fired" : PSY_LOW[x.stat] || "stress";
  else if (edge) cat = "edge";
  else if (Math.random() < 0.35) cat = "win";
  if (long) {
    cat = "session";
    psySessionNudged = true;
  }
  if (!cat) return;
  if (fired && !["streak", "session"].includes(cat) && Math.random() < 0.5) cat = "fired";
  const say = PSY_SAY[cat] || PSY_SAY.stress;
  if (!x.won) psyCall(cat);
  const sheet = views.end.querySelector(".end-sheet"), at = sheet == null ? void 0 : sheet.querySelector(".stack");
  at == null ? void 0 : at.insertAdjacentHTML("beforebegin", '<button class="psy-invite" type="button" id="psyInvite"><span class="face psy-mini" aria-hidden="true">'.concat(faceSvg(MIRA_FACE), "</span>\n    <span><b>🛋️ ").concat(L("Мира, психолог офиса", "Mira, office psychologist"), "</b><small>").concat(esc(say[0]), "</small><em>").concat(L("Зайти в кабинет →", "Visit her office →"), "</em></span></button>"));
  const inv = $("psyInvite");
  if (inv) {
    inv.querySelector(".expr").innerHTML = exprSvg(say[1]);
    inv.onclick = () => openPsy("end", cat);
  }
  const heavy = ["stress", "tired", "fired", "streak"].includes(cat);
  if (!heavy || prefs.psyQuiet || store.get("vdp-psy-day", "") === today()) return;
  setTimeout(async () => {
    if (!await psyLoad() || views.end.hidden || !$("modal").hidden) return;
    store.set("vdp-psy-day", today());
    track("psy", { detail: "after:".concat(cat) });
    psyCtx = cat;
    const line = cat === "fired" || cat === "streak" ? PSY_SAY[cat][0] : psyT(psyRnd(PSY.after_bad_week));
    psyModal('<p class="psy-greet">'.concat(esc(line), "</p>").concat(psyTipHtml(psyTip(cat), L("Маленький шаг на сегодня", "A small step for today"))), "sad");
  }, 2600);
});
(() => {
  const cb = $("psyHints");
  if (!cb) return;
  const sync = () => {
    cb.checked = !prefs.psyQuiet;
  };
  sync();
  bus.on("menu", sync);
  cb.onchange = () => {
    prefs.psyQuiet = !cb.checked;
    store.set(KEY.prefs, prefs);
    toast(cb.checked ? L("Мира снова будет подсказывать во время игры", "Mira will give tips during the game again") : L("Хорошо, Мира не будет отвлекать. Кабинет — в главном меню", "Okay, Mira won’t interrupt. Her office is in the main menu"));
  };
})();
