// «Ещё разок»: то, что удерживает в первые минуты и зовёт сыграть снова.
// 1) «Почти получилось» — после проигрыша: сколько оставалось до пятницы, рекорд, кнопка повтора выделена.
// 2) Учебная неделя — первая неделя карьеры: шкалы не доходят до края (10–90%), в пятницу — праздник.
// 3) «Как ответили другие» — в js/game.js (livePick): во всех режимах, сводно по карточке.
// 4) Коллекция концовок — новые концовки и подсказка «ещё не открыто: …» на экране итогов.
// 5) Золотая карточка — примерно раз в 2–3 недели карьеры: за любой ответ сюрприз (у.е., подсказка, предмет, настроение героя).
// 6) Быстрая смена — 10 карточек (четверг и пятница) за 3 минуты, вне рейтинга.

// ---------- 4) новые концовки ----------
ENDINGS.push(
  { id: 'first_card', title: L('Рекорд скорости', 'Speed record'), hint: L('Проиграть на первых двух карточках', 'Lose on the first two cards') },
  { id: 'hump_day', title: L('Среда — маленькая пятница? Нет', 'Hump day, literally'), hint: L('Проиграть в среду', 'Lose on a Wednesday') },
  { id: 'golden', title: L('Золотая лихорадка', 'Gold rush'), hint: L('Ответить на золотую карточку', 'Answer a golden card') },
  { id: 'quick_win', title: L('Спринтер', 'Sprinter'), hint: L('Пережить быструю смену', 'Survive a quick shift') },
  { id: 'trained', title: L('Испытательный срок пройден', 'Probation passed'), hint: L('Пережить учебную неделю', 'Survive the training week') },
  { id: 'rematch', title: L('Реванш', 'The comeback'), hint: L('Дожить до пятницы сразу после проигрыша', 'Make it to Friday right after a loss') },
);
const hkUnlockShow = ids => {
  const fresh = unlock(ids); if (!fresh.length) return;
  const sheet = views.end.querySelector('.end-sheet'), at = sheet?.querySelector('.place') || sheet?.querySelector('.stack');
  at?.insertAdjacentHTML('beforebegin', endingsHtml(fresh));
};

// ---------- 2) учебная неделя ----------
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || typeof C === 'undefined' || !C || C.week !== 1 || C.firings || prefs.trainDone) return;
  S2.training = true;
  setTimeout(() => toast(L('🎓 Учебная неделя: шкалы не уйдут за край — освойтесь спокойно. С понедельника — по-настоящему!', '🎓 Training week: your meters won’t hit the edge — take your time. Next week it’s for real!')), 2200);
});

// ---------- 5) золотая карточка ----------
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || S2.training || S2.goldAt != null) return;
  if (Math.random() < 0.4) S2.goldAt = 4 + Math.floor(Math.random() * 18);  // карточка с 5-й по 22-ю
});
const GOLD = [
  { w: 4, give: () => { const n = 5 + Math.floor(Math.random() * 8); addCash(n); return L(`+${n} у.е. на счёт`, `+$${n} to your balance`); } },
  { w: 2, give: () => { prefs.freeHints = (prefs.freeHints || 0) + 1; store.set(KEY.prefs, prefs); return L('бесплатная подсказка 💡', 'a free hint 💡'); } },
  { w: 2, give: () => { prefs.bonusItems = (prefs.bonusItems || 0) + 1; store.set(KEY.prefs, prefs); return L('лишний предмет в сумку на следующую неделю 🎒', 'an extra item for next week 🎒'); } },
  { w: 2, give: () => { const h = C?.hero; if (!h) return null; h.mood = Math.min(100, (h.mood ?? 70) + 15); saveCareer(); return L(`${h.name} в восторге: настроение +15 💖`, `${h.name} is thrilled: mood +15 💖`); } },
];
bus.on('answer', () => {
  if (!S || S.goldAt !== S.step || S.goldDone) return;
  S.goldDone = true;
  let got = null;
  for (let tries = 0; tries < 4 && !got; tries++) {
    let r = Math.random() * GOLD.reduce((a, g) => a + g.w, 0);
    const g = GOLD.find(x => (r -= x.w) < 0) || GOLD[0];
    got = g.give();
  }
  sfx.coins?.(); buzz?.('tap');
  setTimeout(() => toast(L(`✨ Золотая карточка! Сюрприз: ${got}`, `✨ Golden card! Surprise: ${got}`)), 500);
  if (typeof unlock === 'function' && unlock(['golden']).length) setTimeout(() => toast(L('🏅 Новая концовка в коллекции: «Золотая лихорадка»', '🏅 New ending: “Gold rush”')), 3800);
  track('gold_card', { detail: got?.slice(0, 40) });
});

// ---------- 6) быстрая смена ----------
const QUICK_LEN = 10;
function startQuick() {
  C = null;
  S = newWeekState({ mode: 'quick', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal' });
  S.deck = buildDeck({ type: 'normal', profCard: false, classic: !POOL.length });
  S.step = WEEK_LEN - QUICK_LEN;  // четверг, утро — до пятницы 18:00 десять решений
  enterGame();
  track('quick_start');
}
(() => {
  const b = $('startQuick'); if (!b) return;
  b.onclick = async () => { await whenReady(b); startQuick(); };
})();

// ---------- 1) «почти получилось» + реванш; итоги учебной недели и быстрой смены ----------
bus.on('weekEnd', x => {
  const sheet = views.end.querySelector('.end-sheet'); if (!sheet) return;
  const key = 'vdp-best-step', best = store.get(key, {}), mode = x.mode || 'career';
  const start = mode === 'quick' ? WEEK_LEN - QUICK_LEN : 0, len = WEEK_LEN - start;
  const done = Math.max(0, (x.won ? WEEK_LEN : x.step) - start), left = len - done;
  const ids = [];
  if (!x.won) {
    const rec = done > (best[mode] || 0);
    if (rec) { best[mode] = done; store.set(key, best); }
    const d = dayOf(x.step);
    if (x.step <= 1 && mode !== 'quick') ids.push('first_card');
    if (d === 2) ids.push('hump_day');
    const head = left <= 3 ? L(`😱 Пятница была в ${left} ${left === 1 ? 'карточке' : 'карточках'}!`, `😱 Friday was ${left} card${left === 1 ? '' : 's'} away!`)
      : L(`Вы продержались ${done} из ${len} — до пятницы оставалось ${left}`, `You lasted ${done} of ${len} — ${left} to go till Friday`);
    sheet.querySelector('h1')?.insertAdjacentHTML('afterend', `<div class="nm-box${left <= 3 ? ' hot' : ''}">
      <b>${head}</b>${rec && (best[mode] || 0) > 1 ? `<small>${L('Это ваш рекорд в этом режиме — дальше будет легче', 'That’s your best in this mode — it gets easier')}</small>` : ''}
      <div class="nm-bar" aria-hidden="true"><i style="width:${Math.round(100 * done / len)}%"></i><span>🏁</span></div></div>`);
    const nb = $('next'); if (nb) { nb.classList.add('nm-pulse'); if (mode !== 'career') nb.textContent = mode === 'quick' ? L('⚡ Ещё одна смена', '⚡ Another shift') : /^[↻🔁]/u.test(nb.textContent.trim()) ? nb.textContent : `🔁 ${nb.textContent}`; }
    prefs.lastLoss = Date.now(); store.set(KEY.prefs, prefs);
  } else {
    if (mode === 'quick') { ids.push('quick_win'); const nb = $('next'); if (nb) { nb.textContent = L('⚡ Ещё одна смена', '⚡ Another shift'); nb.onclick = () => startQuick(); } }
    if (S?.training) {
      ids.push('trained'); prefs.trainDone = 1; store.set(KEY.prefs, prefs);
      sheet.querySelector('h1')?.insertAdjacentHTML('afterend', `<div class="nm-box win"><b>${L('🎓 Вы пережили первую неделю!', '🎓 You survived your first week!')}</b><small>${L('Учебная неделя позади. Дальше шкалы могут дойти до края — следите за ⚠ на ответах.', 'Training’s over. From now on meters can hit the edge — watch for ⚠ on answers.')}</small></div>`);
    }
    if (prefs.lastLoss && Date.now() - prefs.lastLoss < 30 * 60e3) { ids.push('rematch'); prefs.lastLoss = 0; store.set(KEY.prefs, prefs); }
  }
  hkUnlockShow(ids);
  // ---------- 4) подсказка: какая концовка ещё не открыта ----------
  if (!sheet.querySelector('.unlocked')) {
    const got = endingsGot(), locked = ENDINGS.filter(e => !got[e.id]);
    if (locked.length) {
      const e = locked[Math.floor(Math.random() * locked.length)];
      (sheet.querySelector('.place') || sheet.querySelector('.stack'))?.insertAdjacentHTML('beforebegin',
        `<p class="nm-tease">🔒 ${L(`Коллекция ${ENDINGS.length - locked.length}/${ENDINGS.length}. Ещё не открыто: «${esc(e.title)}» — ${esc(e.hint)}`, `Collection ${ENDINGS.length - locked.length}/${ENDINGS.length}. Still locked: “${esc(e.title)}” — ${esc(e.hint)}`)}</p>`);
    }
  }
});
