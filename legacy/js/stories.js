/* сгенерировано tools/make-legacy.js из js/stories.js — не править */
const STO_FIRST_WEEK = 2;
const STO_SLOTS = [12, 13, 11, 14, 10, 16, 8, 17, 7, 18, 6];
const stoT = (x) => Array.isArray(x) ? EN ? x[1] : x[0] : x || "";
const stoById = (id) => STORIES.find((s) => s.id === id) || null;
const stoQ = (t) => L("«".concat(t, "»"), "“".concat(t, "”"));
const stoCardId = (sid, ep, v) => "sto_".concat(sid, "_").concat(ep, "_").concat(v);
function stoRegister() {
  for (const s of STORIES) s.eps.forEach((ep, e) => ep.forEach((v, i) => {
    const ans = (side) => ({
      label: stoT(v[side].label),
      flag: v[side].flag,
      effects: Object.fromEntries(["psyche", "energy", "boss", "colleagues"].map((k, j) => [k, v[side].fx[j] || 0]))
    });
    byId[stoCardId(s.id, e + 1, i)] = {
      id: stoCardId(s.id, e + 1, i),
      who: stoT(v.who),
      text: stoT(v.text),
      story: s.id,
      ep: e + 1,
      eps: s.eps.length,
      answers: { left: ans("left"), right: ans("right") }
    };
  }));
}
window.stoRegister = stoRegister;
if (STORIES.length) stoRegister();
const stoVariant = (s, e, flags) => {
  const ep = s.eps[e];
  if (!ep) return -1;
  const i = ep.findIndex((v) => v.if && v.if === flags[e - 1]);
  return i >= 0 ? i : Math.max(0, ep.findIndex((v) => !v.if));
};
const stoEnding = (s, flags) => s.endings.find((x) => !x.if || flags.filter((f) => f === x.if).length >= (x.min || 1)) || s.endings[s.endings.length - 1];
const stoNext = (st) => STORIES.find((s) => !st.done.includes(s.id)) || STORIES[st.done.length % STORIES.length] || null;
function stoState(c = C, startNow = false) {
  if (!c || !STORIES.length) return null;
  const st = c.story || (c.story = { id: null, ep: 0, flags: [], done: [], after: 0 });
  st.done || (st.done = []);
  st.flags || (st.flags = []);
  if (st.id && !stoById(st.id)) st.id = null;
  if (!st.id && startNow && c.week >= STO_FIRST_WEEK && c.week > (st.after || 0)) {
    const s = stoNext(st);
    if (s) Object.assign(st, { id: s.id, ep: 0, flags: [] });
  }
  return st;
}
bus.on("deck", (S2) => {
  if (S2.mode !== "career" || !C) return;
  const st = stoState(C, true);
  if (!(st == null ? void 0 : st.id)) return;
  const s = stoById(st.id), v = stoVariant(s, st.ep, st.flags);
  if (v < 0) return;
  const at = STO_SLOTS.find((i) => S2.deck[i] && !S2.deck[i].fixed && !S2.deck[i].origin);
  if (at == null) return;
  S2.deck[at] = { id: stoCardId(s.id, st.ep + 1, v), time: slotTime(at), fixed: true, story: true };
  saveCareer();
});
bus.on("answer", ({ card, side }) => {
  if (!(card == null ? void 0 : card.story) || (S == null ? void 0 : S.mode) !== "career" || !C) return;
  const st = stoState(C), s = stoById(card.story);
  if (!st || !s || st.id !== s.id || st.ep !== card.ep - 1) return;
  const flag = card.answers[side].flag;
  st.flags.push(flag);
  st.ep = card.ep;
  S.storyNow = { id: s.id, ep: card.ep };
  track("story_ep", { mode: "career", card: card.id, step: S.step, detail: "".concat(s.id, ":").concat(card.ep, ":").concat(flag) });
  if (st.ep >= s.eps.length) {
    const end = stoEnding(s, st.flags);
    stoReward(end.reward || {});
    st.done.push(s.id);
    st.last = { id: s.id, ending: end.id };
    st.id = null;
    st.ep = 0;
    st.flags = [];
    st.after = C.week;
    S.storyEnd = { id: s.id, ending: end.id };
    track("story_end", { mode: "career", detail: "".concat(s.id, ":").concat(end.id) });
    setTimeout(() => toast(L("📖 Финал истории! Чем всё кончилось — в конце недели", "📖 Story finale! See how it ends at the end of the week")), 700);
  } else setTimeout(() => toast(L("📖 Продолжение следует — на следующей неделе", "📖 To be continued — next week")), 700);
  saveCareer();
});
function stoReward(r) {
  var _a;
  if (r.bank) pay(r.bank);
  if (r.mood && C.hero) C.hero.mood = Math.min(100, ((_a = C.hero.mood) != null ? _a : 70) + r.mood);
  if (r.hint) prefs.freeHints = (prefs.freeHints || 0) + r.hint;
  if (r.badge && !(prefs.storyBadges || (prefs.storyBadges = [])).some((b) => b.ico === r.badge.ico)) prefs.storyBadges.push({ ico: r.badge.ico, name: r.badge.name });
  store.set(KEY.prefs, prefs);
  saveCareer();
}
const stoRewardHtml = (r) => [
  r.bank ? "<span>💰 +".concat(money(r.bank), "</span>") : "",
  r.mood ? "<span>😊 ".concat(L("настроение героя", "hero mood"), " +").concat(r.mood, "</span>") : "",
  r.hint ? "<span>💡 ".concat(L("+".concat(r.hint, " ").concat(r.hint > 1 ? "подсказки" : "подсказка"), "+".concat(r.hint, " free ").concat(r.hint > 1 ? "hints" : "hint")), "</span>") : "",
  r.badge ? '<span class="sto-badge">'.concat(r.badge.ico, " ").concat(L("значок", "badge"), " ").concat(stoQ(esc(stoT(r.badge.name))), "</span>") : ""
].join("");
function stoTeaser(c) {
  const st = stoState(c);
  if (!st) return null;
  if (st.id) {
    const s2 = stoById(st.id), v = stoVariant(s2, st.ep, st.flags);
    return { s: s2, ep: st.ep + 1, hook: stoT(s2.eps[st.ep][v].hook) };
  }
  const s = stoNext(st);
  return s ? { s, ep: 0, hook: stoT(s.teaser), fresh: true } : null;
}
const stoTag = (c) => {
  var _a;
  return '<span class="rnd-tag sto-tag" title="'.concat(esc(stoT((_a = stoById(c.story)) == null ? void 0 : _a.title)), '">📖 ').concat(L("Сюжет", "Story"), " · ").concat(L("эпизод", "episode"), " ").concat(c.ep, "/").concat(c.eps, "</span>");
};
bus.on("weekEnd", (x) => {
  if (x.mode !== "career" || !C || !S) return;
  const sheet = views.end.querySelector(".end-sheet"), stack = sheet == null ? void 0 : sheet.querySelector(".stack");
  if (!stack) return;
  const end = S.storyEnd, t = stoTeaser(C);
  let html = "";
  if (end) {
    const s = stoById(end.id), e = s == null ? void 0 : s.endings.find((z) => z.id === end.ending);
    if (s && e) html = '<button type="button" class="sto-teaser sto-done" id="stoFinBtn"><i class="sto-ico">'.concat(s.icon, "</i><span><b>").concat(L("Финал истории", "Story finale"), " ").concat(stoQ(esc(stoT(s.title))), "</b>").concat(esc(stoT(e.title)), " · ").concat(L("награда", "reward"), " →</span></button>");
    if (s && e) setTimeout(() => {
      if ($("modal").hidden && !views.end.hidden) stoFinale(s, e);
    }, 1300);
  } else if (t && !t.fresh) html = '<div class="sto-teaser"><i class="sto-ico">'.concat(t.s.icon, "</i><span><b>📖 ").concat(S.storyNow ? L("Продолжение следует", "To be continued") : L("Сюжет ждёт вас", "Your story awaits"), ":</b> ").concat(esc(t.hook), "…<small>").concat(stoQ(esc(stoT(t.s.title))), " · ").concat(L("эпизод", "episode"), " ").concat(t.ep, "/").concat(t.s.eps.length, " — ").concat(L("на следующей неделе", "next week"), "</small></span></div>");
  if ((t == null ? void 0 : t.fresh) && (end || C.week >= STO_FIRST_WEEK)) html += '<div class="sto-teaser sto-new"><i class="sto-ico">'.concat(t.s.icon, "</i><span><b>📖 ").concat(L("На следующей неделе — новая история", "Next week — a new story"), ":</b> ").concat(stoQ(esc(stoT(t.s.title))), ". ").concat(esc(t.hook), "…</span></div>");
  if (!html) return;
  stack.insertAdjacentHTML("beforebegin", html);
  if ($("stoFinBtn")) $("stoFinBtn").onclick = () => {
    const s = stoById(end.id);
    stoFinale(s, s.endings.find((z) => z.id === end.ending));
  };
});
function stoFinale(s, e) {
  var _a;
  const m = $("modal"), nx = stoTeaser(C);
  m.innerHTML = '<div class="modal-box glass sto-fin" role="dialog" aria-modal="true" aria-labelledby="stoFinT"><span class="lvl-ico" aria-hidden="true">'.concat(s.icon, '</span>\n    <span class="sto-kicker">📖 ').concat(L("Финал истории", "Story finale"), " ").concat(stoQ(esc(stoT(s.title))), '</span>\n    <h2 id="stoFinT">').concat(esc(stoT(e.title)), "</h2><p>").concat(esc(stoT(e.text)), '</p>\n    <div class="sto-rew">').concat(stoRewardHtml(e.reward || {}), '</div>\n    <p class="sto-soon">').concat(L("Следующая история скоро", "Next story coming soon")).concat((nx == null ? void 0 : nx.fresh) ? ": ".concat(nx.s.icon, " ").concat(stoQ(esc(stoT(nx.s.title)))) : "", '</p>\n    <button class="btn-main" type="button" id="stoFinOk">').concat(L("Здорово!", "Awesome!"), "</button></div>");
  m.hidden = false;
  (_a = sfx.item) == null ? void 0 : _a.call(sfx);
  $("stoFinOk").onclick = () => {
    m.hidden = true;
  };
}
bus.on("menu", () => {
  var _a;
  const cc = $("careerCard"), Cm = store.get(KEY.career, null);
  if (!cc || cc.hidden || !Cm || !STORIES.length) return;
  const st = stoState(Cm), t = stoTeaser(Cm), badges = prefs.storyBadges || [];
  let html = "";
  if (t && st.id) html = '<div class="sto-chip"><i class="sto-ico">'.concat(t.s.icon, "</i><span><b>📖 ").concat(L("Сюжет", "Story"), ": ").concat(stoQ(esc(stoT(t.s.title))), ", ").concat(L("эпизод", "episode"), " ").concat(t.ep, "/").concat(t.s.eps.length, "</b><small>").concat(esc(t.hook), "…</small></span></div>");
  else if (t) html = '<div class="sto-chip sto-wait"><i class="sto-ico">'.concat(t.s.icon, "</i><span><b>📖 ").concat(L("Скоро новая история", "New story coming"), ": ").concat(stoQ(esc(stoT(t.s.title))), "</b><small>").concat(Cm.week < STO_FIRST_WEEK ? L("начнётся на ".concat(STO_FIRST_WEEK, "-й неделе"), "starts in week ".concat(STO_FIRST_WEEK)) : Cm.week > (st.after || 0) ? L("начнётся на этой неделе", "starts this week") : L("начнётся на следующей неделе", "starts next week"), "</small></span></div>");
  if (badges.length) html += '<div class="sto-badges" title="'.concat(L("Значки из финалов историй", "Badges from story finales"), '">').concat(badges.map((b) => '<span title="'.concat(esc(stoT(b.name)), '">').concat(b.ico, "</span>")).join(""), "<small>").concat(L("историй пройдено", "stories finished"), ": ").concat(((_a = st == null ? void 0 : st.done) == null ? void 0 : _a.length) || 0, "/").concat(STORIES.length, "</small></div>");
  const bar = cc.querySelector(".cc-bar");
  if (html) bar ? bar.insertAdjacentHTML("afterend", html) : cc.insertAdjacentHTML("beforeend", html);
});
