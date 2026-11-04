/* сгенерировано tools/make-legacy.js из js/retention.js — не править */
const RET_DAY = 864e5, RET_MSK = 3 * 36e5;
const retSave = () => store.set(KEY.prefs, prefs);
const retMenuFree = () => !views.menu.hidden && $("modal").hidden && !document.querySelector(".prof-sheet:not([hidden])");
const RET_LAST = "vdp-ret-last";
let retSessionAt = Date.now();
let retMissPending = null;
const retTouch = () => {
  if (!document.hidden) store.set(RET_LAST, Date.now());
};
function retAway(prev) {
  var _a;
  const now = Date.now();
  store.set(RET_LAST, now);
  if (!prev || now - prev < RET_DAY) return;
  retSessionAt = now;
  const days = Math.floor((now - prev) / RET_DAY);
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h || !prefs.name) return;
  const before = (_a = h.mood) != null ? _a : 70, drop = Math.min(30, days * 10);
  const after = before <= 10 ? before : Math.max(10, before - drop);
  h.mood = after;
  careerSave(C2);
  retMissPending = { days, before, after };
  track("hero_miss", { detail: String(days) });
  retMissTry(0);
}
function retMissTry(n) {
  if (!retMissPending) return;
  if (!retMenuFree()) {
    if (n < 20) setTimeout(() => retMissTry(n + 1), 1500);
    return;
  }
  retMissShow();
}
function retMissShow() {
  const x = retMissPending;
  retMissPending = null;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!x || !h) return;
  const fem = typeof heroFem === "function" && heroFem(h), nm = esc(h.name || L("Персонаж", "Your character"));
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box ret-miss" role="dialog" aria-modal="true" aria-labelledby="retMissT">\n    <span class="ret-miss-ico" aria-hidden="true">🥺</span>\n    <h2 id="retMissT">'.concat(L("".concat(nm, " ").concat(fem ? "скучала" : "скучал", " без вас… 🥺"), "".concat(nm, " missed you… 🥺")), "</h2>\n    <p>").concat(L("Вас не было ".concat(pl(x.days, "день", "дня", "дней"), ". Дома всё ждали и смотрели на дверь."), "You were away for ".concat(pl(x.days, "", "", "", "day", "days"), ". Everyone at home kept looking at the door.")), '</p>\n    <div class="ret-mood"><span>').concat(L("Настроение", "Mood"), "</span><b>").concat(x.before, "% → <em>").concat(x.after, '%</em></b></div>\n    <p class="ret-say" id="retSay" hidden></p>\n    <button class="btn-main" type="button" id="retHug">🤗 ').concat(L("Обнять / Поиграть", "Hug / Play"), " <small>+10 ").concat(L("настроения", "mood"), '</small></button>\n    <button class="btn-ghost" type="button" id="retLater">').concat(L("Позже", "Later"), "</button></div>");
  m.hidden = false;
  $("retHug").onclick = () => {
    var _a, _b;
    const C3 = careerNow(), h3 = C3 == null ? void 0 : C3.hero;
    if (!h3) {
      m.hidden = true;
      return;
    }
    h3.mood = Math.min(100, ((_a = h3.mood) != null ? _a : 70) + 10);
    careerSave(C3);
    if (typeof voiceUnlock === "function") voiceUnlock();
    const line = typeof speak === "function" ? speak("love", heroVoice(h3)) : L("Я так рад{а}, что ты вернул{ся}!", "I’m so glad you’re back!").replace(/\{а\}/g, fem ? "а" : "").replace(/\{ся\}/g, fem ? "ась" : "ся");
    (_b = sfx.item) == null ? void 0 : _b.call(sfx);
    track("hero_hug");
    const say = $("retSay");
    say.hidden = false;
    say.textContent = "«".concat(line, "» — ").concat(h3.name || "");
    m.querySelector(".ret-mood em").textContent = "".concat(h3.mood, "%");
    const b = $("retHug");
    b.textContent = L("В игру", "Let’s play");
    b.onclick = () => {
      m.hidden = true;
      if (!views.menu.hidden) renderMenu();
    };
    $("retLater").hidden = true;
  };
  $("retLater").onclick = () => {
    m.hidden = true;
    if (!views.menu.hidden) renderMenu();
  };
}
const retPrev = store.get(RET_LAST, 0);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    store.set(RET_LAST, Date.now());
    return;
  }
  const prev = store.get(RET_LAST, 0);
  if (prev && Date.now() - prev >= RET_DAY) retAway(prev);
  else retTouch();
});
setInterval(retTouch, 6e4);
dataReady.then(() => setTimeout(() => retAway(retPrev), 2500));
const RET_PRIZE = [15, 10, 5];
const retWeekStart = (w = 0, t = Date.now()) => {
  const d = new Date(t + RET_MSK), dow = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow - 7 * w) - RET_MSK;
};
const retWeekKey = (w = 0) => new Date(retWeekStart(w) + RET_MSK).toISOString().slice(0, 10);
const retTourEnd = () => retWeekStart() + 7 * RET_DAY - 6e4;
function retLeft(ms) {
  const m = Math.max(0, Math.floor(ms / 6e4)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
  return d ? L("".concat(d, " д ").concat(h, " ч"), "".concat(d, "d ").concat(h, "h")) : h ? L("".concat(h, " ч ").concat(mm, " мин"), "".concat(h, "h ").concat(mm, "m")) : L("".concat(mm, " мин"), "".concat(mm, "m"));
}
const retPlace = (n) => L("".concat(n, "-е место"), "".concat(n).concat(n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th", " place"));
const retMedal = (n) => ["🥇", "🥈", "🥉"][n - 1] || "".concat(n, ".");
const retTourOn = () => board.online && !window.VDP_PLATFORM;
let retTourCache = { at: 0, rows: null };
async function retTourRows(offset = 0, force = false) {
  if (!retTourOn()) return null;
  if (!offset && !force && retTourCache.rows && Date.now() - retTourCache.at < 6e4) return retTourCache.rows;
  try {
    const rows = (await board.rpc("dept_tour", { p_offset: offset }) || []).sort((a, b) => a.place - b.place);
    if (!offset) retTourCache = { at: Date.now(), rows };
    return rows;
  } catch (e) {
    return offset ? null : retTourCache.rows;
  }
}
const retMine = (rows) => prefs.dept && (rows || []).find((r) => r.dept === prefs.dept);
const retRowHtml = (r, me) => '<li class="ret-row'.concat(me ? " me" : "").concat(r.qualified ? "" : " nq", '"><span class="ret-pl">').concat(r.qualified ? retMedal(r.place) : "·", "</span><b>").concat(esc(r.dept), "</b><small>").concat(pl(r.players, "игрок", "игрока", "игроков", "player", "players"), "</small><em>").concat(r.score, "</em></li>");
function retTourSlot() {
  let box = $("retTour");
  if (!box) {
    const at = $("seasonCard");
    if (!at) return null;
    box = Object.assign(document.createElement("div"), { id: "retTour", className: "ret-tour", hidden: true });
    at.after(box);
  }
  return box;
}
async function retTourCard() {
  const box = retTourSlot();
  if (!box) return;
  if (!retTourOn()) {
    box.hidden = true;
    return;
  }
  const rows = await retTourRows();
  if (!rows) {
    box.hidden = true;
    return;
  }
  const mine = retMine(rows), top = rows.filter((r) => r.qualified).slice(0, 5);
  const line = !prefs.dept ? L("Укажите отдел в профиле — и играйте за него", "Set your department in your profile to play for it") : mine ? mine.qualified ? L(
    "«".concat(esc(prefs.dept), "»: <b>").concat(retPlace(mine.place), "</b> из ").concat(rows.filter((r) => r.qualified).length).concat(mine.place <= 3 ? " · ".concat(L("приз", "prize"), " +").concat(money(RET_PRIZE[mine.place - 1])) : ""),
    "“".concat(esc(prefs.dept), "”: <b>").concat(retPlace(mine.place), "</b> of ").concat(rows.filter((r) => r.qualified).length).concat(mine.place <= 3 ? " · prize +".concat(money(RET_PRIZE[mine.place - 1])) : "")
  ) : L("«".concat(esc(prefs.dept), "»: нужен ещё 1 игрок, чтобы попасть в зачёт"), "“".concat(esc(prefs.dept), "”: one more player needed to rank")) : L("«".concat(esc(prefs.dept), "» ещё не играл на этой неделе — сыграйте неделю!"), "“".concat(esc(prefs.dept), "” hasn’t played this week — play a week!"));
  box.hidden = false;
  box.innerHTML = '<button type="button" class="ret-tour-card" id="retTourOpen">\n    <span class="ret-tour-h"><b>🏆 '.concat(L("Турнир отделов", "Department tournament"), '</b><small class="ret-left">⏳ ').concat(retLeft(retTourEnd() - Date.now()), '</small></span>\n    <span class="ret-tour-me">').concat(line, "</span>\n    ").concat(top.length ? '<ol class="ret-top">'.concat(top.map((r) => retRowHtml(r, mine && r.dept === mine.dept)).join(""), "</ol>") : '<span class="ret-tour-empty">'.concat(L("На этой неделе пока никто не играл — ваш отдел может стать первым", "Nobody has played this week yet — your department can be first"), "</span>"), '\n    <span class="ret-tour-more">').concat(L("Правила и вся таблица ›", "Rules and full table ›"), "</span></button>");
  $("retTourOpen").onclick = () => retTourModal();
}
async function retTourModal() {
  const m = $("modal"), rows = await retTourRows(0, true) || [], mine = retMine(rows);
  const list = rows.slice(0, 10);
  if (mine && !list.includes(mine)) list.push(mine);
  m.innerHTML = '<div class="modal-box glass cert-box ret-tour-box" role="dialog" aria-modal="true" aria-labelledby="retTourT">\n    <span class="lvl-ico" aria-hidden="true">🏆</span><h2 id="retTourT">'.concat(L("Турнир отделов", "Department tournament"), '</h2>\n    <p class="ret-left-big">⏳ ').concat(L("До конца недели", "Ends in"), ': <b class="ret-left">').concat(retLeft(retTourEnd() - Date.now()), "</b> <small>").concat(L("(вс 23:59 МСК)", "(Sun 23:59 Moscow)"), "</small></p>\n    ").concat(list.length ? '<ol class="ret-top ret-top-full">'.concat(list.map((r) => retRowHtml(r, mine && r.dept === mine.dept)).join(""), "</ol>") : "<p>".concat(L("Пока пусто. Сыграйте неделю — и ваш отдел появится в таблице.", "Empty so far. Play a week and your department will show up."), "</p>"), '\n    <ul class="lw-list ret-rules">\n      <li>').concat(L("Очки отдела — среднее лучших результатов его игроков за неделю (карьера и неделя дня).", "Department score is the average of its players’ best results this week (career and Daily Week)."), "</li>\n      <li>").concat(L("В зачёте отделы, где сыграли хотя бы 2 человека.", "Departments need at least 2 players to rank."), "</li>\n      <li>").concat(L("Итоги — в понедельник: 1-е место — +".concat(money(15), ", 2-е — +").concat(money(10), ", 3-е — +").concat(money(5), " каждому игроку отдела."), "Results on Monday: 1st — +".concat(money(15), ", 2nd — +").concat(money(10), ", 3rd — +").concat(money(5), " for every player in the department.")), "</li>\n      ").concat(prefs.dept ? "" : "<li>".concat(L("Отдел указывается в профиле («Изменить»).", "Set your department in your profile (“Edit”)."), "</li>"), "\n    </ul>\n    ").concat(prefs.dept ? "" : '<button class="btn-main" type="button" id="retDept">'.concat(L("Указать отдел", "Set department"), "</button>"), '\n    <button class="btn-ghost" type="button" id="retTourX">').concat(L("Закрыть", "Close"), "</button></div>");
  m.hidden = false;
  if ($("retDept")) $("retDept").onclick = () => {
    var _a;
    m.hidden = true;
    (_a = $("meEdit")) == null ? void 0 : _a.click();
  };
  $("retTourX").onclick = () => {
    m.hidden = true;
  };
}
let retResBusy = false;
async function retTourResults() {
  const key = retWeekKey();
  if (!retTourOn() || prefs.retTourSeen === key || !prefs.name || retResBusy) return;
  retResBusy = true;
  try {
    await retTourResults0(key);
  } finally {
    retResBusy = false;
  }
}
async function retTourResults0(key) {
  const rows = await retTourRows(1);
  if (!rows) return;
  const ranked = rows.filter((r) => r.qualified);
  let rw = null;
  if (registered()) {
    try {
      rw = (await board.rpc("my_dept_reward", { p_id: prefs.playerId }) || [])[0] || null;
    } catch (e) {
    }
  }
  if (!ranked.length && !rw) {
    prefs.retTourSeen = key;
    retSave();
    return;
  }
  if (!retMenuFree()) {
    setTimeout(retTourResults, 4e3);
    return;
  }
  prefs.retTourSeen = key;
  retSave();
  const myDept = (rw == null ? void 0 : rw.dept) || prefs.dept, mine = rows.find((r) => r.dept === myDept);
  const guestPrize = !registered() && (mine == null ? void 0 : mine.qualified) && mine.place <= 3;
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box ret-tour-box" role="dialog" aria-modal="true" aria-labelledby="retResT">\n    <span class="lvl-ico" aria-hidden="true">🏁</span><h2 id="retResT">'.concat(L("Итоги турнира отделов", "Department tournament results"), "</h2>\n    <p>").concat(L("Прошлая неделя", "Last week"), " · ").concat(new Date(retWeekStart(1) + RET_MSK).toLocaleDateString(LOCALE, { day: "numeric", month: "long", timeZone: "UTC" }), " — ").concat(new Date(retWeekStart(1) + RET_MSK + 6 * RET_DAY).toLocaleDateString(LOCALE, { day: "numeric", month: "long", timeZone: "UTC" }), "</p>\n    ").concat(ranked.length ? '<ol class="ret-top ret-top-full">'.concat(ranked.slice(0, 5).map((r) => retRowHtml(r, mine && r.dept === mine.dept)).join(""), "</ol>") : "", "\n    ").concat(mine ? '<p class="ret-tour-me">'.concat(mine.qualified ? L("Ваш отдел «".concat(esc(mine.dept), "» — ").concat(retPlace(mine.place)), "Your department “".concat(esc(mine.dept), "” — ").concat(retPlace(mine.place))) : L("Ваш отдел «".concat(esc(mine.dept), "» не попал в зачёт: нужно хотя бы 2 игрока"), "Your department “".concat(esc(mine.dept), "” didn’t rank: at least 2 players needed")), "</p>") : "", "\n    ").concat((rw == null ? void 0 : rw.amount) > 0 && !rw.claimed ? '<button class="btn-main" type="button" id="retClaim">🎁 '.concat(L("Забрать +".concat(money(rw.amount)), "Claim +".concat(money(rw.amount))), "</button>") : (rw == null ? void 0 : rw.amount) > 0 ? '<p class="shp-ok">✓ '.concat(L("Награда уже получена", "Reward already claimed"), "</p>") : guestPrize ? '<button class="btn-main" type="button" id="retClaimReg">🎁 '.concat(L("Зарегистрироваться и забрать +".concat(money(RET_PRIZE[mine.place - 1])), "Sign up to claim +".concat(money(RET_PRIZE[mine.place - 1]))), "</button>") : "", '\n    <p class="field-note">').concat(L("Новая неделя уже идёт — поднимите свой отдел выше!", "A new week has started — lift your department higher!"), '</p>\n    <button class="btn-ghost" type="button" id="retResX">').concat(L("Закрыть", "Close"), "</button></div>");
  m.hidden = false;
  track("tour_results", { detail: mine ? String(mine.place) : "" });
  if ($("retClaim")) $("retClaim").onclick = async () => {
    var _a;
    const b = $("retClaim");
    b.disabled = true;
    try {
      const n = Number(await board.rpc("claim_dept_reward", { p_id: prefs.playerId })) || 0;
      if (n > 0) {
        const now = addCash(n);
        (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
        confetti == null ? void 0 : confetti();
        track("tour_reward", { detail: String(n) });
        toast(L("🏆 +".concat(money(n), " за место отдела").concat(now ? "" : " — придут, когда начнёте карьеру"), "🏆 +".concat(money(n), " for your department’s place").concat(now ? "" : " — paid once you start a career")));
      } else toast(L("Награда уже получена", "Reward already claimed"));
      m.hidden = true;
      if (!views.menu.hidden) renderMenu();
    } catch (err) {
      b.disabled = false;
      toast(err.message);
    }
  };
  if ($("retClaimReg")) $("retClaimReg").onclick = () => {
    prefs.retTourSeen = "";
    retSave();
    if (typeof REG_WHAT !== "undefined") REG_WHAT.tour = L("Награды турнира отделов", "Department tournament rewards");
    m.hidden = true;
    needReg("tour");
  };
  $("retResX").onclick = () => {
    m.hidden = true;
  };
}
setInterval(() => {
  if (views.menu.hidden) return;
  const t = retLeft(retTourEnd() - Date.now());
  document.querySelectorAll(".ret-left").forEach((e) => {
    e.textContent = e.closest(".ret-tour-card") ? "⏳ ".concat(t) : t;
  });
}, 3e4);
const retOpenTour = new URLSearchParams(location.search).get("open") === "tour";
const RET_THEMES = [
  { ico: "😴", ru: "После праздников", en: "Post-holiday blues", item_ru: "Пижама «После праздников»", item_en: "“Post-holiday” pajamas" },
  { ico: "🎁", ru: "Месяц подарков", en: "Month of gifts", item_ru: "Свитер «Валентинки и носки»", item_en: "“Valentines & socks” sweater" },
  { ico: "🌷", ru: "Весеннее обострение", en: "Spring fever", item_ru: "Плащ «Весеннее обострение»", item_en: "“Spring fever” trench coat" },
  { ico: "📊", ru: "Квартальный отчёт", en: "Quarterly report", item_ru: "Пиджак «Квартальный отчёт»", item_en: "“Quarterly report” blazer" },
  { ico: "🌱", ru: "Майские и дача", en: "May holidays", item_ru: "Ветровка «Дачный сезон»", item_en: "“Cottage season” windbreaker" },
  { ico: "🏖️", ru: "Отпуска начинаются", en: "Vacation season", item_ru: "Рубашка «Отпуск близко»", item_en: "“Vacation’s coming” shirt" },
  { ico: "☀️", ru: "Летняя жара", en: "Summer heat", item_ru: "Лёгкий пиджак «Жара»", item_en: "“Heat wave” linen jacket" },
  { ico: "🏝️", ru: "Пустой офис", en: "Empty office", item_ru: "Худи «Пустой офис»", item_en: "“Empty office” hoodie" },
  { ico: "🍂", ru: "Снова в строю", en: "Back to work", item_ru: "Куртка «Снова в строю»", item_en: "“Back to work” jacket" },
  { ico: "💼", ru: "Бюджет на следующий год", en: "Next year’s budget", item_ru: "Жилет «Бюджет утверждён»", item_en: "“Budget approved” vest" },
  { ico: "⏳", ru: "Конец года близко", en: "Year-end is near", item_ru: "Куртка «Конец года близко»", item_en: "“Year-end is near” jacket" },
  { ico: "🎄", ru: "Новогодний корпоратив", en: "Holiday office party", item_ru: "Свитер «Новогодний корпоратив»", item_en: "“Office party” holiday sweater" }
];
const retThemeOf = (mo) => RET_THEMES[(mo % 12 + 12) % 12];
const retThemeNow = () => retThemeOf((/* @__PURE__ */ new Date()).getMonth());
function retThemeBadge(id, big = false) {
  const t = id ? retThemeOf((+String(id).slice(-2) || (/* @__PURE__ */ new Date()).getMonth() + 1) - 1) : retThemeNow();
  return '<span class="ret-mbadge'.concat(big ? " big" : "", '" title="').concat(L("Тема месяца", "Theme of the month"), '">').concat(t.ico, " ").concat(esc(L(t.ru, t.en)), "</span>");
}
const retCardTag = (c) => {
  const t = retThemeOf(c.month - 1);
  return '<span class="rnd-tag ret-mtag">'.concat(t.ico, " ").concat(esc(L(t.ru, t.en)).toUpperCase(), "</span>");
};
bus.on("deck", (S2) => {
  if (S2.mode !== "career" || S2.type && S2.type !== "normal" || typeof MONTH_CARDS === "undefined" || !MONTH_CARDS.length) return;
  const mo = (/* @__PURE__ */ new Date()).getMonth() + 1, seen = new Set(store.get(KEY.seen, []));
  let pool = MONTH_CARDS.filter((c) => c.month === mo && !seen.has(c.id));
  if (!pool.length) return;
  pool = shuffle([...pool]);
  let put = 0;
  for (const c of pool) {
    if (put >= 2) break;
    const free = S2.deck.map((s, i2) => !s.fixed && !s.origin && i2 > 0 && i2 < S2.deck.length - 1 && PHASES[slotPh(i2)].name === c.phase ? i2 : -1).filter((i2) => i2 >= 0);
    if (!free.length) continue;
    const i = free[Math.floor(Math.random() * free.length)];
    S2.deck[i] = { id: c.id, time: slotTime(i), fixed: true };
    put++;
  }
});
function retGameBadge() {
  const head = $("gCareer");
  if (!head) return;
  let b = $("retGBadge");
  if (!b) {
    b = Object.assign(document.createElement("small"), { id: "retGBadge", className: "ret-gbadge" });
    head.after(b);
  }
  const on = typeof S !== "undefined" && (S == null ? void 0 : S.mode) === "career";
  b.hidden = !on;
  if (on) {
    const t = retThemeNow();
    b.textContent = "".concat(t.ico, " ").concat(L(t.ru, t.en));
  }
}
if ($("gCareer")) new MutationObserver(retGameBadge).observe($("gCareer"), { childList: true, characterData: true, subtree: true });
const RET_STEPS = [25, 50, 75, 100];
const RET_REWARD = { 25: { ue: 3 }, 50: { hints: 2 }, 75: { ue: 6 }, 100: { ue: 12, hints: 3 } };
const retRewardText = (r) => [r.ue && "💰 +".concat(money(r.ue)), r.hints && "💡 ".concat(pl(r.hints, "подсказка", "подсказки", "подсказок", "hint", "hints"))].filter(Boolean).join(" · ");
const retTrack0 = track;
track = function(kind, o = {}) {
  if (kind === "sticker_send" && o.detail) {
    const n = +o.detail;
    const a = prefs.retSt || (prefs.retSt = []);
    if (n >= 1 && n <= 99 && !a.includes(n)) {
      a.push(n);
      retSave();
    }
  }
  return retTrack0(kind, o);
};
function retQuoteSeen() {
  if (typeof qtCur === "undefined" || typeof qtList === "undefined" || !qtList || qtCur < 0) return;
  const a = prefs.retQt || (prefs.retQt = []);
  if (!a.includes(qtCur)) {
    a.push(qtCur);
    retSave();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderQuoteDay === "function") {
    const orig = renderQuoteDay;
    renderQuoteDay = async function(...a) {
      const r = await orig.apply(this, a);
      retQuoteSeen();
      return r;
    };
  }
  setTimeout(retQuoteSeen, 3e3);
});
function retPetsSync() {
  var _a, _b;
  const pets = ((_b = (_a = careerNow()) == null ? void 0 : _a.hero) == null ? void 0 : _b.pets) || [], a = prefs.retPets || (prefs.retPets = []);
  let ch = false;
  for (const p of pets) if (p.breed && !a.includes(p.breed)) {
    a.push(p.breed);
    ch = true;
  }
  if (ch) retSave();
}
function retCollections() {
  retPetsSync();
  const st = new Set(prefs.retSt || []), rare = new Set(prefs.rareGot || []), pets = new Set(prefs.retPets || []);
  const best = store.get("vdp-break-best", {});
  const cols = [];
  if (typeof ST_N !== "undefined") cols.push({
    id: "st",
    ico: "🖼️",
    t: L("Стикеры: отправлено", "Stickers sent"),
    how: L("Отправляйте стикеры в чатах игры", "Send stickers in game chats"),
    items: Array.from({ length: ST_N }, (_, i) => ({ got: st.has(i + 1), img: stUrl(i + 1), name: "#".concat(i + 1) }))
  });
  const rr = typeof EVENTS !== "undefined" && (EVENTS == null ? void 0 : EVENTS.rare) || [];
  if (rr.length) cols.push({
    id: "rare",
    ico: "✨",
    t: L("Редкие события", "Rare events"),
    how: L("Попадаются в неделях карьеры — примерно одно на 8 недель", "They show up in career weeks — about one in 8 weeks"),
    items: rr.map((c) => ({ got: rare.has(c.id), ico: "✨", name: tr(c.who), hint: String(tr(c.text) || "").slice(0, 60) + "…" }))
  });
  if (typeof PET_BREEDS !== "undefined") cols.push({
    id: "pets",
    ico: "🐾",
    t: L("Породы питомцев", "Pet breeds"),
    how: L("Заводите питомцев в карьере; редкие — в магазине", "Adopt pets in your career; rare ones are in the shop"),
    items: PET_BREEDS.map((b) => {
      var _a;
      return { got: pets.has(b.id), ico: ((_a = PET_KINDS[b.kind]) == null ? void 0 : _a.ico) || "🐾", name: b.t + (b.rare ? " ✨" : ""), color: b.color };
    })
  });
  if (typeof BREAKS !== "undefined") cols.push({
    id: "brk",
    ico: "☕",
    t: L("Рекорды разминок", "Break-game records"),
    how: L("Поставьте рекорд в мини-игре «Разминки»", "Set a record in a Break mini-game"),
    items: BREAKS.map(([n, , ico, title]) => ({ got: best[n] != null, ico, name: title, hint: best[n] != null ? "🏆 ".concat(best[n]) : "" }))
  });
  if (typeof qtList !== "undefined" && (qtList == null ? void 0 : qtList.length)) cols.push({
    id: "qt",
    ico: "💬",
    t: L("Прочитанные цитаты", "Quotes read"),
    how: L("Листайте «Цитату дня» в меню (↻)", "Flip through the Quote of the day in the menu (↻)"),
    big: true,
    total: qtList.length,
    got: (prefs.retQt || []).filter((i) => i < qtList.length).length
  });
  if (typeof THEMES !== "undefined") cols.push({
    id: "th",
    ico: "🎨",
    t: L("Темы оформления", "Colour themes"),
    how: L("Покупаются в «Оформлении» и выдаются в сезонном пропуске", "Bought in “Appearance” or earned in the season pass"),
    items: THEMES.map((t, i) => ({ got: themeOwned(i), ico: "🎨", name: t.name, color: t.m }))
  });
  for (const c of cols) {
    if (!c.big) {
      c.total = c.items.length;
      c.got = c.items.filter((x) => x.got).length;
    }
    c.pct = c.total ? Math.floor(c.got / c.total * 100) : 0;
    const done = (prefs.retCol || (prefs.retCol = {}))[c.id] || [];
    c.claim = RET_STEPS.filter((s) => c.pct >= s && !done.includes(s));
    c.done = done;
  }
  return cols;
}
const retClaimable = () => retCollections().reduce((n, c) => n + c.claim.length, 0);
function retColItem(x) {
  if (!x.got) return '<li class="ret-it ret-sil" title="???">'.concat(x.img ? '<img src="'.concat(x.img, '" alt="" loading="lazy">') : '<span class="ret-it-ico">'.concat(x.ico, "</span>"), "<small>???</small></li>");
  return '<li class="ret-it"'.concat(x.hint ? ' title="'.concat(esc(x.hint), '"') : "", ">").concat(x.img ? '<img src="'.concat(x.img, '" alt="" loading="lazy">') : x.color ? '<span class="ret-it-ico" style="--c:'.concat(esc(x.color), '">').concat(x.ico, "</span>") : '<span class="ret-it-ico">'.concat(x.ico, "</span>"), "<small>").concat(esc(x.name), "</small>").concat(x.hint && x.hint.startsWith("🏆") ? "<em>".concat(esc(x.hint), "</em>") : "", "</li>");
}
async function retOpenCollections() {
  if (typeof qtGet === "function") await qtGet().catch(() => {
  });
  const m = $("modal"), open = /* @__PURE__ */ new Set();
  const render = () => {
    const cols = retCollections(), all = cols.reduce((a, c) => a + c.got, 0), tot = cols.reduce((a, c) => a + c.total, 0);
    m.innerHTML = '<div class="modal-box glass cert-box ret-col-box" role="dialog" aria-modal="true" aria-labelledby="retColT">\n      <span class="lvl-ico" aria-hidden="true">📚</span><h2 id="retColT">'.concat(L("Коллекции", "Collections"), '</h2>\n      <p class="field-note">').concat(L("Собрано ".concat(all, " из ").concat(tot, ". За 25, 50, 75 и 100% каждой коллекции — у.е. и подсказки."), "Collected ".concat(all, " of ").concat(tot, ". Each collection pays out at 25, 50, 75 and 100% — cash and hints.")), "</p>\n      ").concat(cols.map((c) => '<section class="ret-col">\n        <div class="ret-col-h"><span class="ret-col-ico" aria-hidden="true">'.concat(c.ico, "</span><b>").concat(c.t, "</b><small>").concat(c.got, "/").concat(c.total, " · ").concat(c.pct, '%</small></div>\n        <div class="ret-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="').concat(c.pct, '"><i style="width:').concat(c.pct, '%"></i>').concat(RET_STEPS.slice(0, 3).map((s) => '<u style="left:'.concat(s, '%"></u>')).join(""), '</div>\n        <div class="ret-rw">').concat(RET_STEPS.map((s) => {
      const got = c.done.includes(s), can = c.claim.includes(s);
      return '<span class="ret-rw-i'.concat(got ? " got" : can ? " can" : "", '"><small>').concat(s, "%</small>").concat(got ? "✓" : can ? '<button type="button" class="btn-chip" data-rclaim="'.concat(c.id, ":").concat(s, '">').concat(L("Забрать", "Claim"), "</button>") : "🔒", "<em>").concat(retRewardText(RET_REWARD[s]), "</em></span>");
    }).join(""), "</div>\n        ").concat(c.big ? '<p class="ret-how">'.concat(c.how, "</p>") : '<details class="ret-items"'.concat(open.has(c.id) ? " open" : "", ' data-col="').concat(c.id, '"><summary>').concat(L("Показать", "Show"), " · ").concat(c.how, '</summary><ul class="ret-grid">').concat(c.items.map(retColItem).join(""), "</ul></details>"), "\n      </section>")).join(""), '\n      <button class="btn-ghost" type="button" id="retColX">').concat(L("Закрыть", "Close"), "</button></div>");
    m.hidden = false;
    m.querySelectorAll("details[data-col]").forEach((d) => d.ontoggle = () => {
      d.open ? open.add(d.dataset.col) : open.delete(d.dataset.col);
    });
    m.querySelectorAll("[data-rclaim]").forEach((b) => b.onclick = () => {
      var _a, _b;
      const [id, s] = b.dataset.rclaim.split(":"), step = +s, c = retCollections().find((x) => x.id === id);
      if (!c || !c.claim.includes(step)) return;
      const r = RET_REWARD[step];
      ((_a = prefs.retCol)[id] || (_a[id] = [])).push(step);
      if (r.hints) prefs.freeHints = (prefs.freeHints || 0) + r.hints;
      retSave();
      const now = r.ue ? addCash(r.ue) : true;
      (_b = sfx.coins) == null ? void 0 : _b.call(sfx);
      track("col_claim", { detail: "".concat(id, ":").concat(step) });
      toast(L("📚 ".concat(c.t, " ").concat(step, "%: ").concat(retRewardText(r)).concat(now ? "" : " — у.е. придут, когда начнёте карьеру"), "📚 ".concat(c.t, " ").concat(step, "%: ").concat(retRewardText(r)).concat(now ? "" : " — paid once you start a career")));
      if (step === 100) confetti == null ? void 0 : confetti();
      render();
    });
    $("retColX").onclick = () => {
      m.hidden = true;
      if (!views.menu.hidden) renderMenu();
    };
  };
  render();
  track("col_open");
}
function retColBtn() {
  let b = $("retColBtn");
  if (!b) {
    const at = retTourSlot() || $("seasonCard");
    if (!at) return;
    b = Object.assign(document.createElement("button"), { id: "retColBtn", type: "button", className: "btn-ghost ret-col-btn" });
    at.after(b);
    b.onclick = () => retOpenCollections();
  }
  const cols = retCollections(), n = cols.reduce((a, c) => a + c.claim.length, 0);
  const pct = cols.length ? Math.round(cols.reduce((a, c) => a + c.pct, 0) / cols.length) : 0;
  b.innerHTML = "📚 ".concat(L("Коллекции", "Collections"), " <small>").concat(pct, "%</small>").concat(n ? ' <em class="shp-pill">🎁 '.concat(n, "</em>") : "");
}
bus.on("menu", () => setTimeout(() => {
  retTourSlot();
  retColBtn();
  retTourCard();
  setTimeout(retTourResults, 5e3);
  if (retOpenTour && !retTourModal.done) {
    retTourModal.done = true;
    setTimeout(() => {
      if (retMenuFree()) retTourModal();
    }, 1500);
  }
}, 0));
