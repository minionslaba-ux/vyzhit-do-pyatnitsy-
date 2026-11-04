/* сгенерировано tools/make-legacy.js из js/burnout.js — не править */
const HEAT_LV = [
  [0, "🧊", L("Норма", "All good"), L("Персонаж в форме.", "Your character is in shape.")],
  [30, "🌡️", L("Устали", "Tired"), L("Пока без последствий, но лучше остыть заранее.", "No effects yet, but better to cool down early.")],
  [70, "🔥", L("Перегрев", "Overheating"), L("В понедельник Энергия и Кукуха −5.", "On Monday Energy and Sanity −5.")],
  [85, "🔥", L("На пределе", "At the limit"), L("В понедельник Энергия и Кукуха −10. Мира хочет поговорить.", "On Monday Energy and Sanity −10. Mira wants a word.")],
  [100, "🌋", L("Пора в отпуск", "Time off needed"), L("В понедельник Энергия и Кукуха −15. Отпуск сбросит перегрев сильнее всего.", "On Monday Energy and Sanity −15. A vacation cools you down the most.")]
];
const heatLv = (h) => [...HEAT_LV].reverse().find((x) => h >= x[0]);
const heatPen = (h) => h >= 100 ? 15 : h >= 85 ? 10 : h >= 70 ? 5 : 0;
const HEAT = { win: 3, edge: 3, lose: 6, calm: 5, day: 10, dayMax: 30, grace: 4 };
const heatNow = () => {
  const C2 = careerNow();
  return C2 ? Math.round(C2.heat || 0) : null;
};
function heatAdd(d, why) {
  const C2 = careerNow();
  if (!C2 || !d) return 0;
  const was = C2.heat || 0;
  C2.heat = Math.max(0, Math.min(100, was + d));
  careerSave(C2);
  const real = C2.heat - was;
  if (real < 0 && why) bus.emit("cool", { by: why, d: real });
  if (real < 0 && why) setTimeout(() => toast(L("".concat(why, ": перегрев −").concat(Math.abs(real), "% → ").concat(Math.round(C2.heat), "%"), "".concat(why, ": overheat −").concat(Math.abs(real), "% → ").concat(Math.round(C2.heat), "%"))), 900);
  return real;
}
const heatBar = (h) => '<span class="heat-bar" aria-hidden="true"><i style="width:'.concat(h, '%"></i></span>');
const heatHtml = (h, delta) => {
  const [, ico, name, hint] = heatLv(h);
  return '<button type="button" class="heat-card'.concat(h >= 70 ? " hot" : "", '" data-heat aria-label="').concat(L("Перегрев: подробнее", "Overheat: details"), '">\n    <span class="heat-top"><b>').concat(ico, " ").concat(L("Перегрев", "Overheat"), " ").concat(h, "%</b>").concat(delta ? '<em class="'.concat(delta > 0 ? "up" : "down", '">').concat(delta > 0 ? "+" : "−").concat(Math.abs(delta), "</em>") : "", "<small>").concat(name, "</small></span>\n    ").concat(heatBar(h), '<small class="heat-hint">').concat(hint, "</small></button>");
};
function openHeat() {
  const h = heatNow();
  if (h == null) return;
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass heat-box" role="dialog" aria-modal="true" aria-labelledby="heatTitle">\n    <h2 id="heatTitle">'.concat(heatLv(h)[1], " ").concat(L("Перегрев", "Overheat"), ": ").concat(h, "%</h2>\n    ").concat(heatBar(h), "\n    <p>").concat(L("Игровая шкала выгорания вашего персонажа. Копится от недели к неделе и бьёт по понедельникам.", "Your character’s burnout meter. It builds up week after week and hits on Mondays."), '</p>\n    <ul class="heat-list">\n      <li>📈 ').concat(L("Каждая рабочая неделя +3, неделя на грани (шкала ниже 15% или выше 85%) ещё +3, увольнение +6. Первые 4 недели карьеры перегрев не растёт", "Every work week +3, a week on the edge (a meter under 15% or over 85%) +3 more, getting fired +6. No overheat in your first 4 career weeks"), "</li>\n      <li>📉 ").concat(L("Каждый новый день −10 (до −30), ровная неделя (все шкалы 30–70%) −5, разминка −4 (до трёх в день), «Минута дыхания» −6, разговор с Мирой −8, отпуск −30", "Each new day −10 (up to −30), a balanced week (all meters 30–70%) −5, a break −4 (up to three a day), One-minute breathing −6, a talk with Mira −8, vacation −30"), "</li>\n      <li>⚠️ ").concat(L("От 70% — в понедельник Энергия и Кукуха −5, от 85% — −10, на 100% — −15", "From 70% — Energy and Sanity −5 on Monday, from 85% — −10, at 100% — −15"), '</li>\n    </ul>\n    <div class="row2"><button class="btn-main" type="button" id="heatBrk">☕ ').concat(L("Разминка", "Break"), '</button><button class="btn-ghost" type="button" id="heatPsy">🛋️ ').concat(L("К Мире", "See Mira"), '</button></div>\n    <button class="btn-ghost" type="button" id="heatClose">').concat(L("Закрыть", "Close"), "</button></div>");
  m.hidden = false;
  $("heatBrk").onclick = () => {
    m.hidden = true;
    openBreaks();
  };
  $("heatPsy").onclick = () => {
    m.hidden = true;
    openPsy("heat", h >= 70 ? "tired" : "");
  };
  $("heatClose").onclick = () => {
    m.hidden = true;
  };
  track("heat_open", { detail: String(h) });
}
document.addEventListener("click", (e) => {
  var _a, _b;
  if ((_b = (_a = e.target).closest) == null ? void 0 : _b.call(_a, "[data-heat]")) openHeat();
});
bus.on("weekEnd", (e) => {
  if (e.mode !== "career" || !careerNow()) return;
  const r = Object.values(e.res || {}), edge = r.some((v) => v < 15 || v > 85), calm = r.length && r.every((v) => v >= 30 && v <= 70);
  const C2 = careerNow(), day = Math.floor(Date.now() / 864e5);
  const rest = C2.heatDay && day > C2.heatDay ? Math.min(HEAT.dayMax, (day - C2.heatDay) * HEAT.day) : 0;
  C2.heatDay = day;
  const fresh = (C2.worked || 0) + (C2.firings || 0) <= HEAT.grace;
  const grow = fresh ? 0 : e.won ? calm ? -HEAT.calm : HEAT.win + (edge ? HEAT.edge : 0) : HEAT.lose;
  const delta = heatAdd(grow - rest);
  const h = heatNow();
  if (h >= 85) {
    prefs.psyCall = { d: today(), cat: "tired" };
    store.set(KEY.prefs, prefs);
    if (typeof renderPsyBtn === "function") renderPsyBtn();
  }
  const stack = views.end.querySelector(".end-sheet > .stack");
  if (stack && !views.end.querySelector(".heat-card")) stack.insertAdjacentHTML("beforebegin", heatHtml(h, Math.round(delta)));
});
bus.on("deck", (S2) => {
  if (S2.mode !== "career") return;
  const h = heatNow(), p = heatPen(h || 0);
  if (!p) return;
  S2.res.energy = Math.max(5, S2.res.energy - p);
  S2.res.psyche = Math.max(5, S2.res.psyche - p);
  setTimeout(() => toast(L("".concat(heatLv(h)[1], " Перегрев ").concat(h, "%: Энергия и Кукуха −").concat(p, ". Остыть помогут разминки и Мира"), "".concat(heatLv(h)[1], " Overheat ").concat(h, "%: Energy and Sanity −").concat(p, ". Breaks and Mira help you cool down"))), 2600);
});
bus.on("breakEnd", (e) => {
  var _a;
  if (!careerNow()) return;
  if (e.n === 51) return heatAdd(-6, L("🌬️ Дыхание", "🌬️ Breathing"));
  const t = ((_a = prefs.heatBrk) == null ? void 0 : _a.d) === today() ? prefs.heatBrk : { d: today(), n: 0 };
  if (t.n >= 3) return;
  t.n++;
  prefs.heatBrk = t;
  store.set(KEY.prefs, prefs);
  heatAdd(-4, L("☕ Разминка", "☕ Break"));
});
bus.on("psy", () => {
  if (!careerNow() || prefs.heatPsy === today()) return;
  prefs.heatPsy = today();
  store.set(KEY.prefs, prefs);
  heatAdd(-8, L("🛋️ Разговор с Мирой", "🛋️ Talk with Mira"));
});
if (typeof takeVacation === "function") {
  const tv0 = takeVacation;
  takeVacation = function() {
    const w = C == null ? void 0 : C.week;
    tv0();
    if (C && C.week !== w) {
      heatAdd(-30, L("🏖️ Отпуск", "🏖️ Vacation"));
      const s = views.end.querySelector(".end-sheet > .stack");
      if (s) s.insertAdjacentHTML("beforebegin", heatHtml(heatNow(), -30));
    }
  };
}
bus.on("menu", () => {
  var _a;
  const box = $("careerCard"), h = heatNow();
  if (!box || box.hidden || h == null) return;
  (_a = box.querySelector(".heat-card")) == null ? void 0 : _a.remove();
  box.insertAdjacentHTML("beforeend", heatHtml(h));
});
