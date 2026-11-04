/* сгенерировано tools/make-legacy.js из js/meta.js — не править */
const RANKS = [
  { xp: 0, name: L("Вечный стажёр", "Eternal Intern"), perk: L("старт карьеры", "career start") },
  { xp: 120, name: L("Младший специалист", "Junior Associate"), perk: L("подсказка дешевле на 1 у.е.", "hints $1 cheaper") },
  { xp: 300, name: L("Специалист", "Associate"), perk: L("+1 предмет в сумке каждую неделю", "+1 item in your bag every week") },
  { xp: 600, name: L("Старший специалист", "Senior Associate"), perk: L("+1 у.е. к зарплате в день", "+$1 daily pay") },
  { xp: 1e3, name: L("Ведущий специалист", "Lead Specialist"), perk: L("подсказка дешевле ещё на 1 у.е.", "hints another $1 cheaper") },
  { xp: 1500, name: L("Тимлид", "Team Lead"), perk: L("премии за дедлайны +25%", "deadline bonuses +25%") },
  { xp: 2200, name: L("Руководитель отдела", "Head of Department"), perk: L("+2 у.е. к зарплате в день", "+$2 daily pay") },
  { xp: 3100, name: L("Директор", "Director"), perk: L("премии за дедлайны +50%", "deadline bonuses +50%") },
  { xp: 4300, name: L("Генеральный директор", "CEO"), perk: L("👑 корона в ленте и +2 предмета в сумке", "👑 a crown in the live strip and +2 bag items") }
];
const rankIdx = (xp = prefs.xp || 0) => RANKS.reduce((r, x, i) => xp >= x.xp ? i : r, 0);
function rankPerk(kind) {
  const r = rankIdx();
  if (kind === "items") return (r >= 2 ? 1 : 0) + (r >= 8 ? 1 : 0);
  if (kind === "salary") return r >= 6 ? 2 : r >= 3 ? 1 : 0;
  if (kind === "hint") return (r >= 1 ? 1 : 0) + (r >= 4 ? 1 : 0);
  if (kind === "deadline") return r >= 7 ? 0.5 : r >= 5 ? 0.25 : 0;
  return 0;
}
let xpGained = 0;
function addXp(n, why) {
  const before = rankIdx();
  prefs.xp = (prefs.xp || 0) + n;
  xpGained += n;
  store.set(KEY.prefs, prefs);
  const after = rankIdx();
  if (after > before) setTimeout(() => levelUp(after), why === "week" ? 1800 : 400);
}
function levelUp(r) {
  var _a;
  const m = $("modal"), x = RANKS[r];
  m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="lvlTitle">\n    <span class="lvl-ico" aria-hidden="true">'.concat(r === RANKS.length - 1 ? "👑" : "🎖️", '</span><span class="dl-kicker">').concat(L("Повышение!", "Promotion!"), '</span>\n    <h2 id="lvlTitle">').concat(x.name, "</h2><p>").concat(L("Новый бонус", "New perk"), ": <b>").concat(x.perk, '</b></p>\n    <button class="btn-main" type="button" id="lvlOk">').concat(L("Ура!", "Woohoo!"), "</button></div>");
  m.hidden = false;
  (_a = sfx.win) == null ? void 0 : _a.call(sfx);
  confetti();
  track("rank_up", { detail: String(r) });
  $("lvlOk").onclick = () => {
    m.hidden = true;
  };
  syncDesk();
}
const rankLine = () => {
  const r = rankIdx(), x = prefs.xp || 0, next = RANKS[r + 1];
  return { r, name: RANKS[r].name, x, next, pct: next ? Math.round((x - RANKS[r].xp) / (next.xp - RANKS[r].xp) * 100) : 100 };
};
const careerNow = () => typeof C !== "undefined" && C || store.get(KEY.career, null);
const careerSave = (c) => {
  if (typeof C !== "undefined" && c === C) saveCareer();
  else store.set(KEY.career, c);
};
const QUESTS = [
  { id: "boss_no", need: 2, text: L("Скажите «нет» Боссу", "Say “no” to the Boss"), on: { answer: (x) => /босс|boss|директор|director|ceo/i.test(x.card.who || "") && (x.eff.boss || 0) < 0 } },
  { id: "work", need: 6, text: L("Выберите рабочих ответов (радуют Босса или стоят Энергии)", "Pick work answers (please the Boss or cost Energy)"), on: { answer: (x) => workAnswer(x.card, x.side) } },
  { id: "team", need: 6, text: L("Порадуйте коллег", "Make your team happy"), on: { answer: (x) => (x.eff.colleagues || 0) > 0 } },
  { id: "self", need: 5, text: L("Позаботьтесь о себе (ответы с плюсом к Кукухе)", "Take care of yourself (answers that raise Sanity)"), on: { answer: (x) => (x.eff.psyche || 0) > 0 } },
  { id: "cards", need: 20, text: L("Ответьте на карточки", "Answer cards"), on: { answer: () => true } },
  { id: "win", need: 1, text: L("Закройте любую неделю", "Survive any week"), on: { weekEnd: (x) => x.won } },
  { id: "calm", need: 1, text: L("Закройте неделю с Кукухой выше 50%", "Survive a week with Sanity above 50%"), on: { weekEnd: (x) => x.won && x.res.psyche > 50 } },
  { id: "energy", need: 1, text: L("Закройте неделю с Энергией выше 50%", "Survive a week with Energy above 50%"), on: { weekEnd: (x) => x.won && x.res.energy > 50 } },
  { id: "balance", need: 1, text: L("Закройте неделю, когда все шкалы между 30% и 70%", "Survive a week with every meter between 30% and 70%"), on: { weekEnd: (x) => x.won && Object.values(x.res).every((v) => v >= 30 && v <= 70) } },
  { id: "daily", need: 1, text: L("Сыграйте неделю дня", "Play the Daily Week"), on: { weekEnd: (x) => x.mode === "daily" } },
  { id: "deadline", need: 1, text: L("Выполните дедлайн", "Complete a deadline"), on: { deadlineDone: () => true } },
  { id: "hint", need: 1, text: L("Купите подсказку", "Buy a hint"), on: { hint: () => true } },
  { id: "shop", need: 1, text: L("Купите предмет в магазине", "Buy an item in the shop"), on: { buy: () => true } },
  { id: "dm", need: 1, text: L("Напишите кому-нибудь из ленты «в игре»", "Message someone from the live strip"), on: { dm: () => true } },
  // «Остынь»: снизить перегрев персонажа (js/burnout.js шлёт 'cool' при разминке, дыхании, разговоре с Мирой, отпуске).
  // Только когда перегрев есть (от 10%); от 30% — задание дня обязательно среди трёх
  {
    id: "cool",
    need: 1,
    text: L("Остынь: снизьте перегрев — разминка, «Минута дыхания» или Мира", "Cool down: lower your overheat — a break, One-minute breathing or Mira"),
    on: { cool: () => true },
    when: () => (typeof heatNow === "function" ? heatNow() || 0 : 0) >= 10,
    must: () => (typeof heatNow === "function" ? heatNow() || 0 : 0) >= 30
  }
];
function todayQuests() {
  const day = today(), q = prefs.quests;
  if ((q == null ? void 0 : q.day) === day) return q;
  const rnd = seeded("quests-" + day + prefs.playerId), ids = shuffle(QUESTS.filter((x) => !x.when || x.when()).map((x) => x.id), rnd);
  const must = QUESTS.filter((x) => {
    var _a;
    return ((_a = x.must) == null ? void 0 : _a.call(x)) && ids.includes(x.id);
  }).map((x) => x.id);
  const weekQ = ids.find((id) => QUESTS.find((x) => x.id === id).on.weekEnd), rest = [...must, ...ids.filter((id) => !must.includes(id) && !QUESTS.find((x) => x.id === id).on.weekEnd)].slice(0, 2);
  prefs.quests = { day, list: [weekQ, ...rest].map((id) => ({ id, got: 0 })), bonus: false };
  store.set(KEY.prefs, prefs);
  return prefs.quests;
}
function questEvent(kind, x) {
  var _a;
  const q = todayQuests();
  let changed = false;
  for (const it of q.list) {
    const def = QUESTS.find((d) => d.id === it.id);
    if (!def || it.done || !def.on[kind] || !def.on[kind](x)) continue;
    it.got++;
    changed = true;
    if (it.got >= def.need) {
      it.done = true;
      addXp(30);
      const C2 = careerNow(), cash = 4;
      if (C2) {
        C2.bank = (C2.bank || 0) + cash;
        careerSave(C2);
      }
      toast(L("🎯 Задание выполнено: ".concat(def.text.toLowerCase(), " · +30 опыта").concat(C2 ? ", +".concat(money(cash)) : ""), "🎯 Quest done: ".concat(def.text.toLowerCase(), " · +30 XP").concat(C2 ? ", +".concat(money(cash)) : "")));
      (_a = sfx.item) == null ? void 0 : _a.call(sfx);
      if (C2) setTimeout(() => adDouble(cash, L("Задание дня", "Daily quest")), 3e3);
    }
  }
  if (q.list.every((it) => it.done) && !q.bonus) {
    q.bonus = true;
    addXp(50);
    prefs.bonusItems = (prefs.bonusItems || 0) + 1;
    setTimeout(() => toast(L("🎁 Все задания дня выполнены: +50 опыта и +1 предмет на следующую неделю", "🎁 All daily quests done: +50 XP and +1 item next week")), 2800);
  }
  if (changed) store.set(KEY.prefs, prefs);
}
for (const k of ["answer", "weekEnd", "deadlineDone", "hint", "buy", "dm", "cool"]) bus.on(k, (x) => questEvent(k, x));
bus.on("answer", () => addXp(1));
bus.on("deadlineDone", () => addXp(15));
bus.on("weekEnd", (x) => addXp(x.won ? 20 : 5, "week"));
const DESK = [
  { id: "cactus", icon: "🌵", price: 5, name: L("Кактус", "Cactus") },
  { id: "mug", icon: "☕", price: 6, name: L("Кружка «Лучший сотрудник»", "“Best Employee” mug") },
  { id: "lamp", icon: "💡", price: 8, name: L("Неоновая лампа", "Neon lamp") },
  { id: "fish", icon: "🐠", price: 10, name: L("Аквариум с рыбкой", "Fish tank") },
  { id: "plant", icon: "🌿", price: 10, name: L("Фикус", "Ficus") },
  { id: "cat", icon: "🐈", price: 14, name: L("Фигурка офисного кота", "Office cat figurine") },
  { id: "coffee", icon: "🍵", price: 16, name: L("Своя кофемашина", "Personal coffee maker") },
  { id: "poster", icon: "🖼️", price: 18, name: L("Постер «Скоро пятница»", "“Friday Soon” poster") },
  { id: "golf", icon: "⛳", price: 22, name: L("Мини-гольф для созвонов", "Mini golf for calls") },
  { id: "chair", icon: "🪑", price: 30, name: L("Кресло-трон", "Throne chair") },
  { id: "trophy", icon: "🏆", price: 40, name: L("Кубок «Пережил понедельник»", "“Survived Monday” trophy") }
];
const deskIcons = (ids = prefs.desk || []) => DESK.filter((d) => ids.includes(d.id)).map((d) => d.icon).join("");
function syncDesk() {
  if (!board.online || !prefs.name) return;
  board.rpc("set_desk", { p_id: prefs.playerId, p_desk: (rankIdx() === RANKS.length - 1 ? "👑" : "") + deskIcons(), p_rank: rankIdx() }).catch(() => {
  });
}
function openDesk() {
  const m = $("modal"), Cm = careerNow();
  const render = () => {
    const bank = (Cm == null ? void 0 : Cm.bank) || 0, own = prefs.desk || [];
    m.innerHTML = '<div class="modal-box glass desk-box" role="dialog" aria-modal="true" aria-labelledby="deskTitle">\n      <h2 id="deskTitle">🗄️ '.concat(L("Мой рабочий стол", "My desk"), '</h2>\n      <div class="desk-view" aria-label="').concat(L("Стол", "Desk"), '">').concat(deskIcons() || '<span class="desk-empty">'.concat(L("Пока пусто. Обставьте стол — его увидят коллеги.", "Empty for now. Decorate it — your coworkers will see it."), "</span>"), '</div>\n      <p class="shop-bal">').concat(Cm ? L("На счёте: <b>".concat(money(bank), "</b> "), "Balance: <b>".concat(money(bank), "</b> ")) + topupBtn(0, "desk") : L("Украшения покупаются на деньги карьеры — начните карьеру.", "Decorations cost career money — start a career first."), '</p>\n      <div class="shop-list">').concat(DESK.map((d) => {
      const short = Cm && !own.includes(d.id) && bank < d.price;
      return '<button class="shop-item'.concat(short ? " short" : "", '" data-desk="').concat(d.id, '" ').concat(own.includes(d.id) || !Cm ? "disabled" : "", " ").concat(short ? 'data-topup="'.concat(lackOf(d.price), '" data-topup-back="desk"') : "", ">\n        <b>").concat(d.icon, " ").concat(d.name, '</b><span class="price">').concat(own.includes(d.id) ? L("есть", "owned") : short ? "💰 ".concat(L("не хватает", "short"), " ").concat(lackOf(d.price)) : money(d.price), "</span></button>");
    }).join(""), '</div>\n      <button class="btn-ghost" type="button" id="deskClose">').concat(L("Закрыть", "Close"), "</button></div>");
    m.querySelectorAll("[data-desk]").forEach((b) => b.onclick = () => {
      var _a;
      const d = DESK.find((x) => x.id === b.dataset.desk);
      if (!Cm || Cm.bank < d.price) return;
      Cm.bank -= d.price;
      careerSave(Cm);
      (prefs.desk || (prefs.desk = [])).push(d.id);
      store.set(KEY.prefs, prefs);
      (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
      toast(L("На столе: ".concat(d.icon, " ").concat(d.name), "On your desk: ".concat(d.icon, " ").concat(d.name)));
      syncDesk();
      render();
      renderMeta();
    });
    $("deskClose").onclick = () => {
      m.hidden = true;
    };
  };
  render();
  m.hidden = false;
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
}
function renderMeta() {
  const box = $("metaBox");
  if (!box || !prefs.name) return;
  const r = rankLine(), q = todayQuests();
  box.hidden = false;
  box.innerHTML = '<div class="rank-row"><span class="rank-ico" aria-hidden="true">'.concat(r.r === RANKS.length - 1 ? "👑" : "🎖️", '</span>\n      <span class="rank-txt"><b>').concat(r.name, "</b><small>").concat(r.next ? L("".concat(r.x, " / ").concat(r.next.xp, " опыта · дальше: ").concat(r.next.name), "".concat(r.x, " / ").concat(r.next.xp, " XP · next: ").concat(r.next.name)) : L("".concat(r.x, " опыта · вершина карьеры"), "".concat(r.x, " XP · top of the ladder")), '</small>\n      <span class="dl-prog"><i style="width:').concat(r.pct, '%"></i></span></span>\n      <button class="btn-chip" type="button" id="deskBtn">').concat(deskIcons() || "🗄️", " ").concat(L("Мой стол", "My desk"), '</button></div>\n    <div class="quests"><b class="q-title">🎯 ').concat(L("Задания дня", "Daily quests"), " · ").concat(q.list.filter((x) => x.done).length, "/3</b>\n      ").concat(q.list.map((it) => {
    const d = QUESTS.find((x) => x.id === it.id);
    return d ? '<div class="q-row'.concat(it.done ? " done" : "", '"><span>').concat(it.done ? "✅" : "▫️", " ").concat(d.text, '</span><span class="q-n">').concat(Math.min(it.got, d.need), "/").concat(d.need, "</span></div>") : "";
  }).join(""), '\n      <small class="q-note">').concat(q.bonus ? L("Все выполнены — завтра будут новые", "All done — new ones tomorrow") : L("Каждое: +30 опыта и +4 у.е. в карьеру · все три: +1 предмет на неделю", "Each: +30 XP and +$4 to your career · all three: +1 bag item"), '</small></div>\n    <div class="dept-nudge" id="deptNudge" hidden></div>');
  $("deskBtn").onclick = openDesk;
  deptNudge();
}
bus.on("menu", renderMeta);
async function deptNudge() {
  const el = $("deptNudge");
  if (!el || !prefs.dept) return;
  try {
    const rows = await board.depts(), i = rows.findIndex((d) => d.dept === prefs.dept);
    if (i < 0) {
      el.hidden = false;
      el.textContent = L("🏢 Ваш отдел «".concat(prefs.dept, "» ещё не в рейтинге недели — закройте неделю, чтобы его открыть"), "🏢 Your department “".concat(prefs.dept, "” isn’t on this week’s board yet — survive a week to put it there"));
      return;
    }
    el.hidden = false;
    el.textContent = i === 0 ? L("🏆 Ваш отдел «".concat(prefs.dept, "» — первый на этой неделе! Удержите место"), "🏆 Your department “".concat(prefs.dept, "” is #1 this week! Hold the lead")) : L("🏢 «".concat(prefs.dept, "» — ").concat(i + 1, "-е место. До «").concat(rows[i - 1].dept, "» не хватает ").concat(rows[i - 1].avg_score - rows[i].avg_score, " очков"), "🏢 “".concat(prefs.dept, "” is #").concat(i + 1, ". ").concat(rows[i - 1].avg_score - rows[i].avg_score, " points behind “").concat(rows[i - 1].dept, "”"));
  } catch (e) {
  }
}
let EVENTS = null;
const tr = (o) => o && typeof o === "object" ? o[LANG] || o.ru : o;
const evCard = (c, extra = {}) => norm({
  id: c.id,
  who: tr(c.who),
  text: tr(c.text),
  phase: c.phase || "Утро",
  answers: { left: { label: tr(c.left), effects: c.left_effects }, right: { label: tr(c.right), effects: c.right_effects } },
  ...extra
});
const eventsReady = (async () => {
  try {
    EVENTS = window.EVENTS_JSON || await (await fetch("data/events.json")).json();
  } catch (e) {
    EVENTS = null;
  }
  if (!EVENTS) return;
  for (const t of EVENTS.teasers || []) byId[t.card.id] = evCard(t.card, { teaser: t.id });
  for (const c of EVENTS.rare || []) byId[c.id] = evCard(c, { rare: true });
  const slots = [["Понедельник", "Утро"], ["Вторник", "День"], ["Среда", "Вечер"], ["Четверг", "Утро"], ["Четверг", "Вечер"], ["Пятница", "День"]];
  for (const z of EVENTS.seasons || []) {
    if (SEASONS.some((x) => x.id === z.id)) continue;
    const title = tr(z.title);
    const cards = z.cards.map((c, i) => ({ ...evCard(c), day: slots[i % slots.length][0], phase: slots[i % slots.length][1], season: title }));
    SEASONS.push({ id: z.id, title, from: z.from, to: z.to, rule: tr(z.rule), cards });
    for (const c of cards) {
      SEASON_CARDS.push(c);
      byId[c.id] = c;
    }
  }
})();
bus.on("weekEnd", (x) => {
  var _a;
  if (x.mode !== "career" || !((_a = EVENTS == null ? void 0 : EVENTS.teasers) == null ? void 0 : _a.length)) return;
  if (!prefs.teaser) {
    const done = prefs.teasersDone || [], left = EVENTS.teasers.filter((t2) => !done.includes(t2.id));
    const t = (left.length ? left : EVENTS.teasers)[Math.floor(Math.random() * (left.length || EVENTS.teasers.length))];
    prefs.teaser = t.id;
    store.set(KEY.prefs, prefs);
  }
});
bus.on("deck", (S2) => {
  var _a;
  if (S2.mode !== "career") return;
  if (prefs.teaser) {
    const t = (_a = EVENTS == null ? void 0 : EVENTS.teasers) == null ? void 0 : _a.find((x) => x.id === prefs.teaser);
    const at = [1, 2, 3, 0].find((i) => {
      var _a2, _b;
      return !((_a2 = S2.deck[i]) == null ? void 0 : _a2.fixed) && !((_b = S2.deck[i]) == null ? void 0 : _b.origin);
    });
    if (t && byId[t.card.id] && at != null) {
      S2.deck[at] = { id: t.card.id, time: slotTime(at), fixed: true, origin: L("История с продолжением", "To be continued") };
      (prefs.teasersDone || (prefs.teasersDone = [])).push(prefs.teaser);
      prefs.teaser = null;
      store.set(KEY.prefs, prefs);
    }
  }
  const rares = ((EVENTS == null ? void 0 : EVENTS.rare) || []).filter((c) => !(prefs.rareGot || []).includes(c.id));
  if (rares.length && Math.random() < 0.12) {
    const free = S2.deck.map((s, i2) => s.fixed || i2 === 0 || i2 === S2.deck.length - 1 ? -1 : i2).filter((i2) => i2 >= 0);
    const i = free[Math.floor(Math.random() * free.length)], c = rares[Math.floor(Math.random() * rares.length)];
    if (i != null) S2.deck[i] = { id: c.id, time: slotTime(i), fixed: true };
  }
});
bus.on("answer", (x) => {
  if (!x.card.rare || (prefs.rareGot || []).includes(x.card.id)) return;
  (prefs.rareGot || (prefs.rareGot = [])).push(x.card.id);
  store.set(KEY.prefs, prefs);
  addXp(25);
  setTimeout(() => toast(L("✨ Редкое событие в коллекции: ".concat(prefs.rareGot.length, " из ").concat(EVENTS.rare.length, " · +25 опыта"), "✨ Rare event collected: ".concat(prefs.rareGot.length, " of ").concat(EVENTS.rare.length, " · +25 XP"))), 1200);
});
bus.on("weekEnd", (x) => {
  var _a;
  const sheet = document.querySelector("#end .end-sheet"), stack = sheet == null ? void 0 : sheet.querySelector(".stack");
  if (!stack) return;
  const q = todayQuests(), left = WEEK_LEN - x.step, t = prefs.teaser && ((_a = EVENTS == null ? void 0 : EVENTS.teasers) == null ? void 0 : _a.find((z) => z.id === prefs.teaser));
  const r = rankLine();
  stack.insertAdjacentHTML("beforebegin", '<div class="meta-end">\n    '.concat(!x.won && left > 0 && left <= 8 ? '<p class="near-miss">😬 '.concat(L("До пятницы, 18:00, оставалось всего ".concat(pl(left, "карточка", "карточки", "карточек", "", ""), "!"), "Only ".concat(left, " ").concat(left === 1 ? "card" : "cards", " away from Friday, 6 PM!")), "</p>") : "", '\n    <p class="xp-line">🎖️ +').concat(xpGained, " ").concat(L("опыта", "XP"), " · ").concat(r.name).concat(r.next ? " · ".concat(r.x, "/").concat(r.next.xp) : "", '</p>\n    <p class="q-mini">🎯 ').concat(L("Задания дня", "Daily quests"), ": ").concat(q.list.filter((z) => z.done).length, "/3</p>\n    ").concat(t ? '<div class="teaser"><b>📌 '.concat(L("В следующей серии", "Next time"), "</b><span>").concat(esc(tr(t.teaser)), "</span></div>") : "", "</div>"));
  xpGained = 0;
  const next = $("next");
  if (!x.won && next && x.mode !== "career" && x.mode !== "tour") next.textContent = L("↻ Реванш", "↻ Rematch");
});
const MISS = EN ? ["Where’d you go? The Boss was asking about the report 👀", "Coffee isn’t the same without you ☕", "You missed it — someone microwaved fish again. Come back!", "The Daily Week is fresh. Bet you can’t beat my score 😏", "Galya has news. Big news. Log in."] : ["Ты куда пропал? Босс спрашивал про отчёт 👀", "Без тебя кофе не тот ☕", "Ты пропустил: кто-то опять грел рыбу в микроволновке. Возвращайся!", "Неделя дня свежая. Спорим, мой результат не побьёшь? 😏", "У Гали новости. Большие. Заходи."];
function missYou() {
  const last = prefs.lastSeen || 0, now = Date.now();
  prefs.lastSeen = now;
  store.set(KEY.prefs, prefs);
  if (!last || now - last < 3 * 36e5 || !prefs.name || typeof NPCS === "undefined") return;
  const all = store.get("vdp-npc-dm", {}), n = now - last > 24 * 36e5 ? 2 : 1;
  const who = shuffle([...NPCS]).slice(0, n);
  who.forEach((c, i) => {
    var _a;
    (all[_a = c.id] || (all[_a] = [])).push({ mine: false, msg: MISS[(Math.floor(now / 36e5) + i) % MISS.length], at: now - i * 6e4 });
  });
  store.set("vdp-npc-dm", all);
  setTimeout(() => who.forEach((c) => ring(L("".concat(c.name, " пишет вам"), "".concat(c.name, " sent you a message")), () => openDm(c.id, c.name))), 2500);
}
setInterval(() => {
  if (!document.hidden) {
    prefs.lastSeen = Date.now();
    store.set(KEY.prefs, prefs);
  }
}, 6e4);
async function rivals() {
  var _a;
  if (!board.online || !prefs.name) return;
  const day = today(), mine = store.get(KEY.daily, {})[day];
  if (!mine) return;
  try {
    const me = await myTag, rows = await board.daily(day), seen = ((_a = prefs.rivalSeen) == null ? void 0 : _a.day) === day ? prefs.rivalSeen.tags : [];
    const myScore = mine.won ? 1e3 + mine.total : 0;
    for (const r of rows) {
      if (r.tag === me || seen.includes(r.tag) || !(prefs.dept && r.dept === prefs.dept)) continue;
      if ((r.won ? 1e3 + r.total : r.step) > myScore) {
        seen.push(r.tag);
        ring(L("".concat(r.name, " (").concat(r.dept, ") обошёл(ла) вас в неделе дня. Реванш?"), "".concat(r.name, " (").concat(r.dept, ") beat you in the Daily Week. Rematch?")), () => startDaily(), false);
      }
    }
    prefs.rivalSeen = { day, tags: seen };
    store.set(KEY.prefs, prefs);
  } catch (e) {
  }
}
setInterval(rivals, 5 * 6e4);
const WHATS_NEW = { v: "2026-11-10", items: EN ? ["🏆 Three career levels, 52 weeks each — Office plankton, Middle management, Top management — every level has its own cards", "🛒 Shop, 🎁 gifts for coworkers, 📰 news feed, 💬 quotes of great people, 📋 a fun job application form", "☕ Break time: 54 mini-games — checkers, puzzles, arcades, word games, memory and relaxing ones. Up to 3 times a day: +$1 and +5 Energy and Sanity for next week. Every third week starts with a warm-up", "🆘 Watch an ad to get a last chance before getting fired, double a bonus, shrink a rollback or retake the exam", "🎬 Watch a short ad — get $1 (once every 20 minutes)", "⏱ Certification: 20 seconds per question; used lifelines can be bought again for $3", "🐾 Pets: cats, dogs, parrots and aquarium fish — 22 breeds in 3D. They need food every week, toys, the vet and vaccinations", "🎁 What you buy is now in your character’s hands in the cartoon", "🗣️ 300 more voice lines: Monday send-offs, cheering after a week, comfort after getting fired, the kids and pets talk too", "📜 Certification exam: 25 questions with 50:50, phone a friend and ask the audience — pass it and your pay goes up by $0.5 a day (once a day)", "💵 New pay scale: $2 a day for everyone, hints now cost $2, rent and food $4 a week", "⏱ 30 seconds per card: a nasty buzzer 5 seconds before the end, and a $1 fine if you’re late", "🗣️ Your character and the kids now talk: “please”, “thank you”, “I love you”, “I’m upset”…", "🏍️ New purchases with 3D cartoons: a motorbike, a boat, a fishing rod, a bike, an e-scooter, a console, a manicure, a beautician, a barbershop… — your character rides off on what you bought", "👧👦 Three kids with their own wishes: a bike, a phone, a console, summer camp", "🔄 You can now switch your character at any time — progress stays", "💌 Your character now texts you mid-week: flowers, sweets, phone credit, groceries, clothes, nights out — 36 things to choose from, each with its own short cartoon", "💔 Breakdown meter: let their mood crash and your career rolls back 1–2 weeks", "🧍 Your 3D character: pick one of 10, name them — they’ll ask for food, a home, a car, a wedding… and it all costs money", "🎯 Daily quests — three goals every day", "🎖️ Ranks from Intern to CEO, with perks", "🗄️ Decorate your desk — coworkers can see it", "📌 Stories that continue next week", "✨ Rare events to collect", "🎃 Office Halloween week", "📅 A week is now 25 cards — 5 a day"] : ["🏆 Три уровня карьеры по 52 недели — «Офисный планктон», «Средний менеджмент», «Топ-менеджмент», на каждом свои карточки", "🛒 Магазин, 🎁 подарки коллегам, 📰 лента новостей, 💬 цитаты великих людей, 📋 весёлая анкета соискателя", "☕ Разминка: 54 мини-игры — шашки, пазлы, аркады, слова, память и расслабление. До 3 раз в день: +1 у.е. и +5 к Энергии и Кукухе на следующую неделю. Каждая третья неделя начинается с разминки", "🆘 Реклама за награду: последний шанс перед увольнением, удвоение премии, откат меньше, ещё попытка аттестации", "🎬 Посмотрите короткую рекламу — получите 1 у.е. (раз в 20 минут)", "⏱ Аттестация: 20 секунд на вопрос; использованную подсказку можно купить ещё раз за 3 у.е.", "🐾 Питомцы: кошки, собаки, попугаи и рыбки — 22 породы в 3D. Им нужен корм каждую неделю, игрушки, ветеринар и прививки", "🎁 Покупка теперь в руках у персонажа в мультике", "🗣️ Ещё 300 реплик: провожает на работу, поздравляет с неделей, утешает после увольнения, говорят дети и питомцы", "🔒 Без регистрации — 4 недели бесплатно, дальше регистрация (бесплатно) или 0,5 у.е. за неделю", "📜 Аттестация: 25 вопросов с подсказками «50 на 50», «Звонок другу» и «Помощь зала» — сдали, и оклад растёт на 0,5 у.е. в день (раз в день)", "💵 Новая сетка окладов: 2 у.е. в день для всех, подсказка — 2 у.е., жильё и еда — 4 у.е. в неделю", "⏱ 30 секунд на карточку: за 5 секунд — мерзкий зуммер, не успели — штраф 1 у.е.", "🗣️ Персонаж и дети заговорили: «ну пожалуйста», «спасибо», «я люблю тебя», «я обиделся»… — 300 реплик", "🏍️ Новые покупки с 3D-мультиками: мотоцикл, лодка, удочка, велосипед, электросамокат, приставка, маникюр, косметолог, барбершоп… — персонаж уезжает на купленном", "👧👦 Трое детей со своими желаниями: велосипед, телефон, приставка, летний лагерь", "🔄 Персонажа можно сменить в любой момент — прогресс сохранится", "💌 Персонаж пишет прямо посреди недели: цветы, сладкое, баланс телефона, продукты, одежда, вечер вне дома — 36 вещей на выбор, и у каждой покупки свой мультик", "💔 Шкала срывов: если настроение персонажа рухнет, карьера откатится на 1–2 недели назад", "🧍 Ваш 3D-персонаж: выберите одного из 10 и дайте имя — он будет просить еду, жильё, машину, свадьбу… и всё это стоит денег", "🎯 Задания дня — три цели каждый день", "🎖️ Должности от стажёра до генерального, с бонусами", "🗄️ Обставьте свой рабочий стол — его видят коллеги", "📌 Истории с продолжением на следующей неделе", "✨ Редкие события для коллекции", "🎃 Неделя «Хэллоуин в офисе»", "📅 Неделя теперь — 25 карточек, по 5 в день"] };
function whatsNew() {
  if (!prefs.name || !(prefs.gamesPlayed > 0) || prefs.whatsNew === WHATS_NEW.v) return;
  prefs.whatsNew = WHATS_NEW.v;
  store.set(KEY.prefs, prefs);
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="wnTitle"><span class="lvl-ico" aria-hidden="true">🆕</span>\n    <h2 id="wnTitle">'.concat(L("Что нового", "What’s new"), '</h2><ul class="lw-list">').concat(WHATS_NEW.items.filter((x) => !(window.VK_MINI && /^🔒/.test(x))).map((x) => "<li>".concat(x, "</li>")).join(""), '</ul>\n    <button class="btn-main" type="button" id="wnOk">').concat(L("Играть", "Play"), "</button></div>");
  m.hidden = false;
  $("wnOk").onclick = () => {
    m.hidden = true;
  };
}
const tgFn = () => {
  var _a;
  return (((_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.url) || "").replace(/\/+$/, "") + "/functions/v1/tg-subscribe";
};
const tgWho = async () => TG ? { initData: TG.initData } : { access_token: await board.accessToken() };
const tgOnSite = () => !TG && typeof registered === "function" && registered() && hasTg();
async function tgCall(enable) {
  var _a;
  const r = await fetch(tgFn(), {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ((_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.anonKey) || "" },
    body: JSON.stringify({ ...await tgWho(), player_id: prefs.playerId, lang: LANG, enable })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error === "not_configured" ? L("Напоминания ещё настраиваются — загляните завтра", "Reminders are still being set up — check back tomorrow") : L("Не получилось, попробуйте позже", "Didn’t work — try again later"));
  return j.enabled;
}
async function tgButton() {
  const b = $("tgRemind");
  if (!b) return;
  if (window.VDP_PLATFORM || !board.online) {
    b.hidden = true;
    return;
  }
  if (window.VK_MINI || window.MAX_APP) {
    const k = window.VK_MINI ? "vkRemind" : "maxRemind", where = window.VK_MINI ? L("во ВКонтакте", "on VK") : L("в MAX", "in MAX");
    const label2 = (on2) => on2 ? L("🔕 Выключить напоминания ".concat(where), "🔕 Turn off reminders ".concat(where)) : L("🔔 Напоминать ".concat(where, " о неделе дня"), "🔔 Daily reminder ".concat(where));
    b.hidden = false;
    b.textContent = label2(!!prefs[k]);
    if (typeof msgRemindCall === "function") msgRemindCall(void 0).then((v) => {
      prefs[k] = v;
      store.set(KEY.prefs, prefs);
      b.textContent = label2(v);
    }).catch(() => {
    });
    b.onclick = async () => {
      await msgRemindSet(!prefs[k]);
      b.textContent = label2(!!prefs[k]);
    };
    return;
  }
  const label = (on2) => on2 ? L("🔕 Выключить напоминания в Telegram", "🔕 Turn off Telegram reminders") : L("🔔 Напоминать в Telegram о неделе дня", "🔔 Daily reminder in Telegram");
  if (!TG && !tgOnSite()) {
    b.textContent = label(false);
    b.onclick = () => {
      toast(L("Откроем игру в Telegram — там нажмите эту же кнопку", "We’ll open the game in Telegram — tap this same button there"));
      setTimeout(() => location.href = "https://t.me/Survivefridaybot?startapp=remind", 900);
    };
    return;
  }
  let on = prefs.tgRemind || false;
  b.textContent = label(on);
  tgCall(void 0).then((v) => {
    on = v;
    prefs.tgRemind = v;
    store.set(KEY.prefs, prefs);
    b.textContent = label(on);
  }).catch(() => {
  });
  b.onclick = async () => {
    try {
      on = await tgCall(!on);
      prefs.tgRemind = on;
      store.set(KEY.prefs, prefs);
      b.textContent = label(on);
      toast(on ? L("Готово: раз в день в 12:30 бот напомнит о неделе дня", "Done: the bot will remind you about the Daily Week once a day at 12:30") : L("Напоминания выключены", "Reminders off"));
    } catch (err) {
      toast(err.message);
    }
  };
}
const GROUP_REWARD = 10;
function addCash(n) {
  const C2 = careerNow();
  if (C2) {
    C2.bank = (C2.bank || 0) + n;
    careerSave(C2);
  } else prefs.pendingCash = (prefs.pendingCash || 0) + n;
  store.set(KEY.prefs, prefs);
  return !!C2;
}
document.addEventListener("click", (e) => {
  var _a, _b, _c, _d;
  if ((_b = (_a = e.target).closest) == null ? void 0 : _b.call(_a, "#maxChannel")) track("max_channel");
  if ((_d = (_c = e.target).closest) == null ? void 0 : _d.call(_c, "#maxPlay")) track("max_play");
});
bus.on("menu", () => {
  const b = $("maxPlay");
  if (b) b.hidden = !!(TG || window.VK_MINI || window.MAX_APP || window.VDP_PLATFORM);
});
function vkGroup() {
  var _a, _b;
  const b = $("vkGroup"), g = (_b = (_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.vk) == null ? void 0 : _b.group;
  if (!b || !g) return;
  b.href = "https://vk.ru/".concat(g);
  b.hidden = false;
  b.innerHTML = '<span class="vk-mark" aria-hidden="true">VK</span> '.concat(L("Мы во ВКонтакте", "We’re on VK"));
  b.onclick = () => track("vk_group");
}
bus.on("weekEnd", (x) => {
  var _a, _b;
  const g = (_b = (_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.vk) == null ? void 0 : _b.group, wk = Math.floor(Date.now() / 6048e5);
  if (!x.won || EN || !g || prefs.vkJoined || store.get("vdp-vk-ask", 0) === wk) return;
  const at = views.end.querySelector(".end-sheet .stack");
  if (!at) return;
  store.set("vdp-vk-ask", wk);
  at.insertAdjacentHTML("beforebegin", '<a class="vk-invite" id="vkInvite" href="https://vk.ru/'.concat(g, '?utm_source=game_win" target="_blank" rel="noopener">\n    <span class="vk-mark" aria-hidden="true">VK</span><span><b>Мы во ВКонтакте</b><small>Разминка дня, советы Миры и «Что бы вы выбрали?»</small></span></a>'));
  $("vkInvite").onclick = () => {
    prefs.vkJoined = 1;
    store.set(KEY.prefs, prefs);
    track("vk_group", { detail: "win" });
  };
});
async function tgGroup() {
  var _a, _b;
  const b = $("tgGroup");
  if (!b) return;
  if (prefs.pendingCash && careerNow()) {
    const n = prefs.pendingCash;
    prefs.pendingCash = 0;
    addCash(n);
  }
  if (window.VDP_PLATFORM || window.VK_MINI || window.MAX_APP || !board.online) return;
  const r = await fetch(tgFn(), {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ((_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.anonKey) || "" },
    body: JSON.stringify({ action: "group_link" })
  }).then((r2) => r2.json()).catch(() => ({}));
  const link = r.link;
  if (!link) return;
  const label = () => b.innerHTML = prefs.groupClaimed ? L("👥 Группа игры в Telegram", "👥 Game group on Telegram") : L("👥 Вступить в группу игры в Telegram <b>+".concat(money(GROUP_REWARD), "</b>"), "👥 Join the game’s Telegram group <b>+".concat(money(GROUP_REWARD), "</b>"));
  label();
  b.hidden = false;
  const mirror = () => {
    const c = $("psGroup");
    if (c) {
      c.hidden = b.hidden;
      c.innerHTML = b.innerHTML;
    }
  };
  mirror();
  const go = () => TG ? TG.openTelegramLink(link) : window.open(link, "_blank", "noopener");
  const claim = async (done) => {
    var _a2, _b2;
    const res = await fetch(tgFn(), {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ((_a2 = window.SUPABASE_CONFIG) == null ? void 0 : _a2.anonKey) || "" },
      body: JSON.stringify({ action: "group_claim", ...await tgWho(), player_id: prefs.playerId })
    });
    const j = await res.json().catch(() => ({}));
    if (j.ok) {
      prefs.groupClaimed = true;
      const now = addCash(GROUP_REWARD);
      label();
      mirror();
      $("modal").hidden = true;
      (_b2 = sfx.coins) == null ? void 0 : _b2.call(sfx);
      toast(L("🎉 Спасибо, что с нами! +".concat(money(GROUP_REWARD)).concat(now ? "" : " — придут, когда устроитесь на работу"), "🎉 Thanks for joining! +".concat(money(GROUP_REWARD)).concat(now ? "" : " — paid once you get a job")));
      if (done) setTimeout(done, 900);
    } else if (j.error === "claimed") {
      prefs.groupClaimed = true;
      store.set(KEY.prefs, prefs);
      label();
      $("modal").hidden = true;
      toast(L("Награда за группу уже получена", "You’ve already got the group reward"));
      done == null ? void 0 : done();
    } else if (j.error === "no_telegram" || j.error === "bad_session") {
      if (done) toast(L("Награду можно забрать в «Моём профиле» после входа через Telegram", "Claim it in “My profile” after signing in with Telegram"));
      else tgLogin("group");
    } else if (j.error === "not_member") toast(L("Пока не видим вас в группе. Вступите и нажмите ещё раз", "We don’t see you in the group yet. Join and tap again"));
    else toast(L("Не получилось, попробуйте позже", "Didn’t work — try again later"));
  };
  const open = (o = {}) => {
    if (prefs.groupClaimed) return go();
    const fired = !!o.done, can = TG || tgOnSite(), site = !TG && board.online && !window.VDP_PLATFORM && !fired;
    const m = $("modal");
    m.innerHTML = '<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="tgGrTitle"><span class="lvl-ico" aria-hidden="true">'.concat(fired ? "📦" : "👥", '</span>\n      <h2 id="tgGrTitle">').concat(fired ? L("Кажется, вас увольняют…", "Looks like you’re getting fired…") : L("Группа игры в Telegram", "The game’s Telegram group"), "</h2>\n      <p>").concat(fired ? L(
      "Пока собираете коробку с вещами — вступите в группу игры в Telegram: там напоминания о неделе дня и итоги дня. За вступление — <b>+".concat(money(GROUP_REWARD), "</b> на счёт, один раз."),
      "While you pack your box — join the game’s Telegram group for Daily Week reminders and results. Joining gets you <b>+".concat(money(GROUP_REWARD), "</b>, once.")
    ) : L(
      "Каждый день — напоминание о неделе дня и кто вчера продержался лучше всех. За вступление — <b>+".concat(money(GROUP_REWARD), "</b>, один раз."),
      "A daily Daily Week reminder and who lasted longest yesterday. Join and get <b>+".concat(money(GROUP_REWARD), "</b>, once.")
    ), '</p>\n      <button class="btn-main" type="button" id="tgGrGo">').concat(L("1. Вступить в группу", "1. Join the group"), '</button>\n      <button class="').concat(can || site ? "btn-main btn-tg" : "btn-ghost", '" type="button" id="tgGrClaim">').concat(can ? L("2. Готово, я в группе — получить ".concat(money(GROUP_REWARD)), "2. I’ve joined — get ".concat(money(GROUP_REWARD))) : site ? L("2. Войти через Telegram и получить ".concat(money(GROUP_REWARD)), "2. Sign in with Telegram and get ".concat(money(GROUP_REWARD))) : L("2. Получить награду в Telegram", "2. Get the reward in Telegram"), "</button>\n      ").concat(can ? "" : '<p style="opacity:.7;font-size:13px">'.concat(fired ? L("Награду выдаёт бот после проверки, что вы в группе: заберите её потом в «Моём профиле».", "The bot pays out after checking you’re in the group: claim it later in “My profile”.") : L("Награду выдаёт бот: он проверяет, что вы в группе, — для этого нужен вход через Telegram.", "The bot checks that you’re in the group — that needs a Telegram sign-in."), "</p>"), '\n      <button class="btn-ghost" type="button" id="tgGrClose">').concat(fired ? L("Продолжить", "Continue") : L("Закрыть", "Close"), "</button></div>");
    m.hidden = false;
    $("tgGrGo").onclick = go;
    if (fired && !can) $("tgGrClaim").hidden = true;
    $("tgGrClaim").onclick = () => can ? claim(o.done) : site ? tgLogin("group") : location.href = "https://t.me/Survivefridaybot?startapp=group";
    $("tgGrClose").onclick = () => {
      var _a2;
      m.hidden = true;
      (_a2 = o.done) == null ? void 0 : _a2.call(o);
    };
  };
  window.groupOffer = (done) => {
    const day = (/* @__PURE__ */ new Date()).toDateString();
    if (prefs.groupClaimed || prefs.groupOfferDay === day) return false;
    prefs.groupOfferDay = day;
    store.set(KEY.prefs, prefs);
    open({ done });
    return true;
  };
  b.onclick = open;
  let after = "";
  try {
    after = sessionStorage.getItem("vdp-after") || "";
    sessionStorage.removeItem("vdp-after");
  } catch (e) {
  }
  if ((after === "group" || TG && /(^|_)group\b/.test(((_b = TG.initDataUnsafe) == null ? void 0 : _b.start_param) || "")) && !prefs.groupClaimed) setTimeout(open, 1200);
}
const LINK_BONUS = 15;
(() => {
  const q = new URLSearchParams(location.search), b = q.get("bonus");
  if (!b) return;
  if (/^\d{8}$/.test(b)) {
    prefs.pendingBonus = b;
    store.set(KEY.prefs, prefs);
  }
  q.delete("bonus");
  history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
})();
function linkBonus() {
  var _a;
  const code = prefs.pendingBonus;
  if (!code) return;
  delete prefs.pendingBonus;
  store.set(KEY.prefs, prefs);
  const mskDay = (d) => new Date(Date.now() + 3 * 36e5 - d * 864e5).toISOString().slice(0, 10).replace(/-/g, "");
  if (code !== mskDay(0) && code !== mskDay(1)) return toast(L("Срок этой ссылки с бонусом уже прошёл — ждите следующую рассылку", "This bonus link has expired — watch for the next one"));
  if ((prefs.bonusGot || []).includes(code)) return toast(L("Бонус по этой ссылке уже получен", "You’ve already claimed this bonus"));
  prefs.bonusGot = [...(prefs.bonusGot || []).slice(-9), code];
  const now = addCash(LINK_BONUS);
  (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
  toast(L("🎁 +".concat(money(LINK_BONUS), " за игру по ссылке-напоминанию").concat(now ? "" : " — придут, когда устроитесь на работу"), "🎁 +".concat(money(LINK_BONUS), " for playing from the reminder link").concat(now ? "" : " — paid once you get a job")));
}
dataReady.then(() => eventsReady).then(() => {
  todayQuests();
  missYou();
  syncDesk();
  tgButton();
  tgGroup();
  vkGroup();
  setTimeout(linkBonus, 1500);
  if (!views.menu.hidden) {
    renderMeta();
    setTimeout(whatsNew, 800);
  }
  setTimeout(rivals, 4e3);
});
