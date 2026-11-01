// «Привычка паузы»: всё, чтобы в разминки заглядывали чаще.
// 1) Серия пауз — дни подряд хотя бы с одной разминкой; на 3, 7, 14 и 30 дней — у.е. Пропуск сбрасывает серию (раз в неделю спасает «отгул»).
// 2) Коллекция — сколько разных разминок открыто; на 10, 25 и все — у.е. В витрине новые помечены точкой.
// 3) Пауза посреди тяжёлой недели — если Энергия или Кукуха проседают ниже 25, разминка даёт +5 сразу, а не на следующую неделю.
// 4) «Минута дыхания» (№ 51) — спокойная дыхательная пауза 4–2–6, без очков и проигрыша.
// 5) Строка под «Разминкой дня»: серия, сегодняшние паузы ☕☕☕, коллекция и кнопка дыхания.
// Тексты — про перерыв и переключение, без медицинских обещаний.
const PAUSE_STREAK = [[3, 3], [7, 7], [14, 15], [30, 30]];   // [дней подряд, у.е.]
const PAUSE_COLL = [[10, 5], [25, 10], [51, 25]];             // [разных разминок, у.е.]
const PAUSE_MID = 25, PAUSE_MID_BOOST = 5;
const dayNum = d => Math.round(new Date(d + 'T12:00:00').getTime() / 864e5);
const pzStreak = () => store.get('vdp-pause-streak', { last: '', n: 0, best: 0, got: [], freeze: '' });
const pzTried = () => store.get('vdp-brk-tried', []);
// Серия жива, если последняя пауза была сегодня или вчера; один пропущенный день в неделю прощается
const pzAlive = s => { if (!s.last) return 0; const gap = dayNum(today()) - dayNum(s.last); return gap <= 1 || (gap === 2 && !pzFrozeRecently(s)) ? s.n : 0; };
const pzFrozeRecently = s => s.freeze && dayNum(today()) - dayNum(s.freeze) < 7;

function pzReward(n, why) {
  const now = addCash(n); sfx.win?.(); buzz('tap');
  toast(L(`${why}: +${n} у.е.${now ? '' : ' (придут в карьеру)'}`, `${why}: +$${n}${now ? '' : ' (goes to your career)'}`));
  if (now && typeof adDouble === 'function') setTimeout(() => adDouble(n, why), 2600);
}

bus.on('breakEnd', e => {
  // коллекция: любая доигранная партия открывает разминку
  const tried = pzTried();
  if (!tried.includes(e.n)) {
    tried.push(e.n); store.set('vdp-brk-tried', tried);
    const m = PAUSE_COLL.find(([k]) => k === tried.length || (k === 51 && tried.length >= BREAKS.length));
    if (m && !(prefs.pzColl || []).includes(m[0])) {
      prefs.pzColl = [...(prefs.pzColl || []), m[0]]; store.set(KEY.prefs, prefs);
      setTimeout(() => pzReward(m[1], L(`🧩 Открыто ${tried.length} разминок`, `🧩 ${tried.length} breaks discovered`)), 3200);
    }
  }
  // серия: засчитывается одна пауза в день
  const s = pzStreak(), td = today();
  if (s.last !== td) {
    const gap = s.last ? dayNum(td) - dayNum(s.last) : 99;
    if (gap === 2 && !pzFrozeRecently(s)) { s.freeze = td; s.n++; }  // «отгул»: один пропуск в неделю не сбрасывает серию
    else s.n = gap === 1 ? s.n + 1 : 1;
    s.last = td; s.best = Math.max(s.best || 0, s.n);
    if (s.n === 1) s.got = [];
    const m = PAUSE_STREAK.find(([k]) => k === s.n);
    if (m && !s.got.includes(m[0])) { s.got.push(m[0]); setTimeout(() => pzReward(m[1], L(`🔥 Серия пауз: ${s.n} дн. подряд`, `🔥 Break streak: ${s.n} days`)), 2400); }
    store.set('vdp-pause-streak', s);
    track('pause_streak', { detail: String(s.n) });
  }
  renderPauseRow();
});

// ---------- строка под «Разминкой дня» ----------
function renderPauseRow() {
  const day = $('brkDay'); if (!day) return;
  let row = $('pzRow');
  if (!row) row = Object.assign(document.createElement('div'), { id: 'pzRow', className: 'pz-row' });
  if (day.nextElementSibling !== row) day.after(row);  // сразу под «Разминкой дня», выше цитаты
  const s = pzStreak(), n = pzAlive(s), done = brkToday().n, tried = pzTried().length;
  const next = PAUSE_STREAK.find(([k]) => k > n);
  const cups = Array.from({ length: BREAK_DAY_REWARDS }, (_, i) => `<i class="${i < done ? 'on' : ''}">☕</i>`).join('');
  const playedToday = s.last === today();
  row.innerHTML = `<div class="pz-stats">
      <span class="pz-chip ${n ? 'pz-fire' : ''}" title="${L('Дней подряд с паузой', 'Days in a row with a break')}">🔥 <b>${n}</b> ${L('дн.', 'd')}${next ? `<small>${L(`ещё ${next[0] - n} до 🎁`, `${next[0] - n} to 🎁`)}</small>` : ''}</span>
      <span class="pz-chip pz-cups" title="${L('Паузы с наградой сегодня', 'Rewarded breaks today')}">${cups}</span>
      <span class="pz-chip" title="${L('Открыто разминок', 'Breaks discovered')}">🧩 <b>${tried}/${BREAKS.length}</b></span>
    </div>
    ${n && !playedToday ? `<p class="pz-warn">${L('Сегодня ещё без паузы — серия ждёт одной разминки', 'No break yet today — your streak needs just one')}</p>` : ''}
    <button type="button" class="btn-ghost pz-breath" id="pzBreath">🫁 ${L('Минута дыхания', 'One-minute breathing')}</button>`;
  $('pzBreath').onclick = () => { track('pause_breath'); playBreak(51); };
}
bus.on('menu', renderPauseRow);
renderPauseRow();

// ---------- витрина: «новые» и прогресс коллекции ----------
if (typeof openBreaks === 'function') {
  const ob = openBreaks;
  openBreaks = function () {
    ob();
    const box = document.querySelector('.brk-box'); if (!box) return;
    const tried = pzTried();
    box.querySelectorAll('[data-brk]').forEach(b => { if (!tried.includes(+b.dataset.brk)) b.classList.add('brk-new'); });
    const next = PAUSE_COLL.find(([k]) => k > tried.length);
    box.querySelector('.hero-lead')?.insertAdjacentHTML('afterend', `<div class="pz-coll"><span>🧩 ${L(`Открыто ${tried.length} из ${BREAKS.length}`, `${tried.length} of ${BREAKS.length} discovered`)}${next ? ` · ${L(`ещё ${Math.min(next[0], BREAKS.length) - tried.length} — и +${next[1]} у.е.`, `${Math.min(next[0], BREAKS.length) - tried.length} more for +$${next[1]}`)}` : ''}</span><i style="width:${Math.round(tried.length / BREAKS.length * 100)}%"></i></div>`);
  };
}

// ---------- пауза посреди тяжёлой недели ----------
let pzMidActive = false;
bus.on('answer', () => {
  if (!S || S.mode !== 'career' || prefs.brkNoAsk || pzMidActive) return;
  if ((prefs.gamesPlayed || 0) < 2 || (typeof guestLocked === 'function' && guestLocked())) return;
  if (S.pzAsked) return;  // раз в неделю
  const low = RES.find(r => (r.k === 'energy' || r.k === 'psyche') && S.res[r.k] > 0 && S.res[r.k] < PAUSE_MID);
  if (!low || S.step < 3) return;
  setTimeout(() => {
    const quizOn = $('quiz') && !$('quiz').hidden;  // «Второй шанс», аттестация — не перебиваем
    if (!S || S.pzAsked || busy || splashOn || quizOn || views.game.hidden || !views.end.hidden || !$('modal').hidden || RES.some(r => S.res[r.k] <= 0 || S.res[r.k] >= 100)) return;  // окно занято — спросим на следующей карточке
    S.pzAsked = true;
    const n = brkPick(), m = $('modal');
    m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="pzTitle"><span class="lvl-ico" aria-hidden="true">😮‍💨</span>
      <h2 id="pzTitle">${L('Тяжёлый день. Пауза?', 'Rough day. Take a break?')}</h2>
      <p>${L(`«${esc(low.name)}» на ${S.res[low.k]}%. Минутка на разминку — и сразу +${PAUSE_MID_BOOST} к Энергии и Кукухе в этой неделе.`, `${esc(low.name)} is at ${S.res[low.k]}%. A one-minute break gives +${PAUSE_MID_BOOST} Energy and Sanity right now.`)}</p>
      <p class="pz-sub">${L('Сегодня:', 'Today:')} <b>${esc(brkTitle(n))}</b> ${L('или', 'or')} <button type="button" class="btn-link" id="pzMidBreath">🫁 ${L('минута дыхания', 'one-minute breathing')}</button></p>
      <button class="btn-main" type="button" id="pzMidGo">☕ ${L('Сделать паузу', 'Take a break')}</button>
      <button class="btn-link" type="button" id="pzMidNo">${L('Работать дальше', 'Keep working')}</button></div>`;
    m.hidden = false; track('pause_mid_offer', { detail: low.k });
    const go = id => { m.hidden = true; pzMidActive = true; window.vdpPaused = true; track('pause_mid_go', { detail: String(id) });
      playBreak(id, { mid: true, then: () => { pzMidActive = false; window.vdpPaused = false; } }); };
    $('pzMidGo').onclick = () => go(n);
    $('pzMidBreath').onclick = () => go(51);
    $('pzMidNo').onclick = () => { m.hidden = true; track('pause_mid_skip'); };
  }, FX?.off ? 500 : 1300);
});
bus.on('breakEnd', e => {
  if (!e.mid || !S) return;
  if (e.rewarded) { prefs.breakBuff = Math.max(0, (prefs.breakBuff || 0) - BREAK_BUFF); store.set(KEY.prefs, prefs); }  // бодрость — сейчас, а не на следующей неделе
  S.res.energy = Math.min(95, S.res.energy + PAUSE_MID_BOOST); S.res.psyche = Math.min(95, S.res.psyche + PAUSE_MID_BOOST);
  renderBars();
  setTimeout(() => toast(L(`☕ После паузы: Энергия и Кукуха +${PAUSE_MID_BOOST}`, `☕ After the break: Energy and Sanity +${PAUSE_MID_BOOST}`)), 400);
});

// ---------- № 51 «Минута дыхания» ----------
BREAKS.push([51, 'relax', '🫁', L('Минута дыхания', 'One-minute breathing'), L('Вдох 4 секунды, пауза 2, выдох 6 — пять кругов. Просто следуйте за кругом', 'Breathe in 4 s, hold 2, out 6 — five rounds. Just follow the circle')]);
window.BREAK_IMPL[51] = (root, api) => {
  const { L } = api, ROUNDS = 5, PH = [['in', 4, L('Вдох', 'Breathe in')], ['hold', 2, L('Пауза', 'Hold')], ['out', 6, L('Выдох', 'Breathe out')]];
  root.innerHTML = `<div class="br-wrap"><div class="br-ring"><div class="br-ball" id="brBall"></div><b class="br-word" id="brWord">${L('Готовы?', 'Ready?')}</b><small class="br-sec" id="brSec"></small></div>
    <p class="br-round" id="brRound">${L('Сядьте удобно и опустите плечи', 'Sit comfortably and drop your shoulders')}</p>
    <button class="btn-main" type="button" id="brStart">${L('Начать', 'Start')}</button></div>`;
  const ball = root.querySelector('#brBall'), word = root.querySelector('#brWord'), sec = root.querySelector('#brSec'), round = root.querySelector('#brRound');
  const timers = []; let alive = true;
  api.onExit(() => { alive = false; timers.forEach(clearTimeout); });
  const wait = ms => new Promise(ok => timers.push(setTimeout(ok, ms)));
  root.querySelector('#brStart').onclick = async e => {
    e.target.remove();
    for (let r = 1; r <= ROUNDS && alive; r++) {
      round.textContent = L(`Круг ${r} из ${ROUNDS}`, `Round ${r} of ${ROUNDS}`);
      for (const [k, s, w] of PH) {
        if (!alive) return;
        word.textContent = w; ball.className = `br-ball br-${k}`; ball.style.transitionDuration = `${s}s`;
        if (k === 'in') api.buzz?.('tap');
        for (let i = s; i > 0 && alive; i--) { sec.textContent = i; await wait(1000); }
      }
    }
    if (alive) api.end({ score: null, won: true, text: L('Минута ваша. Можно возвращаться — спокойнее и с ясной головой.', 'That minute was yours. Back to it — a bit calmer.') });
  };
};
