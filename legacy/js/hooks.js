/* сгенерировано tools/make-legacy.js из js/hooks.js — не править */
ENDINGS.push(
  { id: "first_card", title: L("Рекорд скорости", "Speed record"), hint: L("Проиграть на первых двух карточках", "Lose on the first two cards") },
  { id: "hump_day", title: L("Среда — маленькая пятница? Нет", "Hump day, literally"), hint: L("Проиграть в среду", "Lose on a Wednesday") },
  { id: "golden", title: L("Золотая лихорадка", "Gold rush"), hint: L("Ответить на золотую карточку", "Answer a golden card") },
  { id: "quick_win", title: L("Спринтер", "Sprinter"), hint: L("Пережить быструю смену", "Survive a quick shift") },
  { id: "trained", title: L("Испытательный срок пройден", "Probation passed"), hint: L("Пережить учебную неделю", "Survive the training week") },
  { id: "rematch", title: L("Реванш", "The comeback"), hint: L("Дожить до пятницы сразу после проигрыша", "Make it to Friday right after a loss") }
);
const hkUnlockShow = (ids) => {
  const fresh = unlock(ids);
  if (!fresh.length) return;
  const sheet = views.end.querySelector(".end-sheet"), at = (sheet == null ? void 0 : sheet.querySelector(".place")) || (sheet == null ? void 0 : sheet.querySelector(".stack"));
  at == null ? void 0 : at.insertAdjacentHTML("beforebegin", endingsHtml(fresh));
};
bus.on("deck", (S2) => {
  if (S2.mode !== "career" || typeof C === "undefined" || !C || C.week !== 1 || C.firings || prefs.trainDone) return;
  S2.training = true;
  setTimeout(() => toast(L("🎓 Учебная неделя: шкалы не уйдут за край — освойтесь спокойно. С понедельника — по-настоящему!", "🎓 Training week: your meters won’t hit the edge — take your time. Next week it’s for real!")), 2200);
});
bus.on("deck", (S2) => {
  if (S2.mode !== "career" || S2.training || S2.goldAt != null) return;
  if (Math.random() < 0.4) S2.goldAt = 4 + Math.floor(Math.random() * 18);
});
const GOLD = [
  { w: 4, give: () => {
    const n = 5 + Math.floor(Math.random() * 8);
    addCash(n);
    return L("+".concat(n, " у.е. на счёт"), "+$".concat(n, " to your balance"));
  } },
  { w: 2, give: () => {
    prefs.freeHints = (prefs.freeHints || 0) + 1;
    store.set(KEY.prefs, prefs);
    return L("бесплатная подсказка 💡", "a free hint 💡");
  } },
  { w: 2, give: () => {
    prefs.bonusItems = (prefs.bonusItems || 0) + 1;
    store.set(KEY.prefs, prefs);
    return L("лишний предмет в сумку на следующую неделю 🎒", "an extra item for next week 🎒");
  } },
  { w: 2, give: () => {
    var _a;
    const h = C == null ? void 0 : C.hero;
    if (!h) return null;
    h.mood = Math.min(100, ((_a = h.mood) != null ? _a : 70) + 15);
    saveCareer();
    return L("".concat(h.name, " в восторге: настроение +15 💖"), "".concat(h.name, " is thrilled: mood +15 💖"));
  } }
];
bus.on("answer", () => {
  var _a;
  if (!S || S.goldAt !== S.step || S.goldDone) return;
  S.goldDone = true;
  let got = null;
  for (let tries = 0; tries < 4 && !got; tries++) {
    let r = Math.random() * GOLD.reduce((a, g2) => a + g2.w, 0);
    const g = GOLD.find((x) => (r -= x.w) < 0) || GOLD[0];
    got = g.give();
  }
  (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
  buzz == null ? void 0 : buzz("tap");
  setTimeout(() => toast(L("✨ Золотая карточка! Сюрприз: ".concat(got), "✨ Golden card! Surprise: ".concat(got))), 500);
  if (typeof unlock === "function" && unlock(["golden"]).length) setTimeout(() => toast(L("🏅 Новая концовка в коллекции: «Золотая лихорадка»", "🏅 New ending: “Gold rush”")), 3800);
  track("gold_card", { detail: got == null ? void 0 : got.slice(0, 40) });
});
const QUICK_LEN = 10;
function startQuick() {
  C = null;
  S = newWeekState({ mode: "quick", res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: "normal" });
  S.deck = buildDeck({ type: "normal", profCard: false, classic: !POOL.length });
  S.step = WEEK_LEN - QUICK_LEN;
  enterGame();
  track("quick_start");
}
(() => {
  const b = $("startQuick");
  if (!b) return;
  b.onclick = async () => {
    await whenReady(b);
    startQuick();
  };
})();
bus.on("weekEnd", (x) => {
  var _a, _b, _c;
  const sheet = views.end.querySelector(".end-sheet");
  if (!sheet) return;
  const key = "vdp-best-step", best = store.get(key, {}), mode = x.mode || "career";
  const start = mode === "quick" ? WEEK_LEN - QUICK_LEN : 0, len = WEEK_LEN - start;
  const done = Math.max(0, (x.won ? WEEK_LEN : x.step) - start), left = len - done;
  const ids = [];
  if (!x.won) {
    const rec = done > (best[mode] || 0);
    if (rec) {
      best[mode] = done;
      store.set(key, best);
    }
    const d = dayOf(x.step);
    if (x.step <= 1 && mode !== "quick") ids.push("first_card");
    if (d === 2) ids.push("hump_day");
    const head = left <= 3 ? L("😱 Пятница была в ".concat(left, " ").concat(left === 1 ? "карточке" : "карточках", "!"), "😱 Friday was ".concat(left, " card").concat(left === 1 ? "" : "s", " away!")) : L("Вы продержались ".concat(done, " из ").concat(len, " — до пятницы оставалось ").concat(left), "You lasted ".concat(done, " of ").concat(len, " — ").concat(left, " to go till Friday"));
    (_a = sheet.querySelector("h1")) == null ? void 0 : _a.insertAdjacentHTML("afterend", '<div class="nm-box'.concat(left <= 3 ? " hot" : "", '">\n      <b>').concat(head, "</b>").concat(rec && (best[mode] || 0) > 1 ? "<small>".concat(L("Это ваш рекорд в этом режиме — дальше будет легче", "That’s your best in this mode — it gets easier"), "</small>") : "", '\n      <div class="nm-bar" aria-hidden="true"><i style="width:').concat(Math.round(100 * done / len), '%"></i><span>🏁</span></div></div>'));
    const nb = $("next");
    if (nb) {
      nb.classList.add("nm-pulse");
      if (mode !== "career") nb.textContent = mode === "quick" ? L("⚡ Ещё одна смена", "⚡ Another shift") : /^[↻🔁]/u.test(nb.textContent.trim()) ? nb.textContent : "🔁 ".concat(nb.textContent);
    }
    prefs.lastLoss = Date.now();
    store.set(KEY.prefs, prefs);
  } else {
    if (mode === "quick") {
      ids.push("quick_win");
      const nb = $("next");
      if (nb) {
        nb.textContent = L("⚡ Ещё одна смена", "⚡ Another shift");
        nb.onclick = () => startQuick();
      }
    }
    if (S == null ? void 0 : S.training) {
      ids.push("trained");
      prefs.trainDone = 1;
      store.set(KEY.prefs, prefs);
      (_b = sheet.querySelector("h1")) == null ? void 0 : _b.insertAdjacentHTML("afterend", '<div class="nm-box win"><b>'.concat(L("🎓 Вы пережили первую неделю!", "🎓 You survived your first week!"), "</b><small>").concat(L("Учебная неделя позади. Дальше шкалы могут дойти до края — следите за ⚠ на ответах.", "Training’s over. From now on meters can hit the edge — watch for ⚠ on answers."), "</small></div>"));
    }
    if (prefs.lastLoss && Date.now() - prefs.lastLoss < 30 * 6e4) {
      ids.push("rematch");
      prefs.lastLoss = 0;
      store.set(KEY.prefs, prefs);
    }
  }
  hkUnlockShow(ids);
  if (!sheet.querySelector(".unlocked")) {
    const got = endingsGot(), locked = ENDINGS.filter((e) => !got[e.id]);
    if (locked.length) {
      const e = locked[Math.floor(Math.random() * locked.length)];
      (_c = sheet.querySelector(".place") || sheet.querySelector(".stack")) == null ? void 0 : _c.insertAdjacentHTML(
        "beforebegin",
        '<p class="nm-tease">🔒 '.concat(L("Коллекция ".concat(ENDINGS.length - locked.length, "/").concat(ENDINGS.length, ". Ещё не открыто: «").concat(esc(e.title), "» — ").concat(esc(e.hint)), "Collection ".concat(ENDINGS.length - locked.length, "/").concat(ENDINGS.length, ". Still locked: “").concat(esc(e.title), "” — ").concat(esc(e.hint))), "</p>")
      );
    }
  }
});
