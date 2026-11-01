// Кабинет психолога Миры — персонаж игры с практическими советами против выгорания (data/tips.json).
// Что есть: совет дня (одинаковый у всех в этот день), «ещё совет», самопроверка из трёх вопросов → совет по ответам,
// минута дыхания (мини-игра № 51), после недели, проваленной из-за Кукухи или Энергии, — Мира приходит сама (раз в день).
// Без медицинских обещаний: внизу всегда «советы игры не заменяют специалиста». Бесплатно — забота о себе не за деньги.
let PSY = null;
const psyLoad = () => PSY ? Promise.resolve(PSY) : fetch('data/tips.json').then(r => r.ok ? r.json() : null).then(d => (PSY = d)).catch(() => null);
const psyT = x => (EN ? x.en : x.ru) || x.ru || '';
const psyDayTip = () => { const t = PSY.tips.filter(x => x.cat !== 'keep'); return t[Math.floor(seeded(`psy-${today()}`)() * t.length)]; };
const psyRnd = list => list[Math.floor(Math.random() * list.length)];
const PSY_NOTE = () => L('🤖 Мира — персонаж игры. Её советы — про бережные привычки и не заменяют специалиста. Если плохо долго — поговорите с врачом или психологом.', '🤖 Mira is a game character. Her tips are about kinder habits and don’t replace a professional. If you feel bad for a long time, talk to a doctor or a psychologist.');

// ---------- Мира: портрет и анимированный кабинет ----------
const MIRA_FACE = { skin: 1, hair: 'long', hairC: '#5a2e1a', glasses: true, earrings: true, shirt: '#2de28a', bg: '#12382a' };
// Голова Миры в той же системе координат, что и портреты faces.js (64×64), — мимика через exprSvg/setMood
const miraHead = () => `<svg class="mira-head" x="136" y="14" width="56" height="56" viewBox="0 0 64 64" overflow="visible">
  ${HAIR.long(MIRA_FACE.hairC)}<rect x="28" y="44" width="8" height="8" fill="${SKIN[1]}"/>
  <ellipse cx="32" cy="32" rx="14" ry="16" fill="${SKIN[1]}"/>
  <path d="M18 26 q4 -10 14 -10 q10 0 14 10 q-6 -4 -14 -4 q-8 0 -14 4z" fill="${MIRA_FACE.hairC}"/>
  <circle cx="18" cy="38" r="2" fill="#ffd23a"/><circle cx="46" cy="38" r="2" fill="#ffd23a"/>
  <circle class="blush" cx="22" cy="38" r="2.6"/><circle class="blush" cx="42" cy="38" r="2.6"/>
  <g class="expr">${exprSvg('happy')}</g><ellipse class="mtalk" cx="32" cy="43" rx="3.4" ry="2.6"/>
  <g class="glasses"><circle cx="25" cy="31" r="5.5"/><circle cx="39" cy="31" r="5.5"/><path d="M30.5 31 h3"/></g></svg>`;
const psySceneSvg = () => `<svg class="psy-scene-svg" viewBox="0 0 320 132" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <rect class="ps-wall" width="320" height="132"/><rect class="ps-floor" y="104" width="320" height="28"/>
  <g class="ps-window"><rect x="18" y="14" width="74" height="58" rx="5" class="ps-frame"/><rect x="22" y="18" width="66" height="50" rx="3" class="ps-sky"/>
    <circle cx="74" cy="32" r="7" class="ps-sun"/><g class="ps-cloud"><ellipse cx="40" cy="40" rx="11" ry="5"/><ellipse cx="48" cy="37" rx="8" ry="5"/></g>
    <path d="M55 18 v50 M22 43 h66" class="ps-bar"/></g>
  <g class="ps-shelf"><rect x="226" y="30" width="48" height="3" rx="1"/><rect x="230" y="14" width="6" height="16" fill="#ff8a3b"/><rect x="237" y="17" width="5" height="13" fill="#3a7bd5"/><rect x="243" y="12" width="7" height="18" fill="#b26bff"/><rect x="252" y="19" width="5" height="11" transform="rotate(14 254 30)" fill="#ffd23a"/><circle cx="266" cy="25" r="5" fill="#2de28a"/></g>
  <ellipse class="ps-rug" cx="160" cy="118" rx="96" ry="10"/>
  <g class="ps-plant"><path d="M104 104 l4 -14 h16 l4 14z" class="ps-pot"/><g class="ps-leaves"><path d="M116 90 q-16 -10 -14 -30 q12 8 14 30z"/><path d="M116 90 q2 -26 16 -34 q2 20 -16 34z"/><path d="M116 90 q-6 -18 2 -40 q8 16 -2 40z"/></g></g>
  <g class="ps-lamp"><circle cx="292" cy="34" r="26" class="ps-glow"/><path d="M292 40 v64 M282 104 h20" class="ps-pole"/><path d="M280 40 l6 -16 h12 l6 16z" class="ps-shade"/></g>
  <g class="ps-sit"><g class="ps-chair"><rect x="128" y="50" width="72" height="56" rx="18"/><rect x="118" y="74" width="20" height="32" rx="9"/><rect x="190" y="74" width="20" height="32" rx="9"/></g>
  <g class="mira"><g class="mira-body"><path d="M140 104 q0 -38 24 -40 q24 2 24 40z" class="ps-cardigan"/><path d="M158 66 l6 14 l6 -14" class="ps-collar"/>
    <rect x="148" y="84" width="22" height="16" rx="2" transform="rotate(-8 159 92)" class="ps-note"/><path d="M152 89 h13 M152 93 h10" transform="rotate(-8 159 92)" class="ps-lines"/>
    <circle cx="172" cy="92" r="4.5" fill="${SKIN[1]}"/></g>${miraHead()}</g></g>
  <g class="ps-table"><rect x="222" y="86" width="36" height="4" rx="2"/><path d="M240 90 v14"/><rect x="232" y="74" width="12" height="12" rx="3" class="ps-mug"/>
    <path d="M244 77 q5 2 0 6" class="ps-handle"/><g class="ps-steam"><path d="M235 70 q-3 -5 0 -10 q3 -5 0 -10"/><path d="M241 70 q-3 -5 0 -10 q3 -5 0 -10"/></g></g>
</svg>`;

// Мира «говорит» пару секунд, когда появляется новый текст; mood — мимика (happy/joy/sad/neutral), think — смотрит вверх
function psyMira(mood = 'happy', { talk = true, think = false } = {}) {
  const sc = $('modal').querySelector('.psy-scene'); if (!sc) return;
  setMood(sc, mood);
  sc.classList.toggle('think', think);
  clearTimeout(sc._t); sc.classList.remove('talk');
  if (talk && !FX.off) { void sc.offsetWidth; sc.classList.add('talk'); sc._t = setTimeout(() => sc.classList.remove('talk'), 2200); }
}

function psyModal(inner, mood = 'happy', opts) {
  const m = $('modal');
  let box = m.hidden ? null : m.querySelector('.psy-box');
  if (!box) {  // кабинет строится один раз — дальше меняется только текст, сцена и анимация не перезапускаются
    m.innerHTML = `<div class="modal-box glass psy-box" role="dialog" aria-modal="true" aria-labelledby="psyTitle">
      <div class="psy-scene" data-mood="happy">${psySceneSvg()}</div><div class="psy-name"><b id="psyTitle">${L('Кабинет Миры', 'Mira’s office')}</b><small>${L('психолог офиса · 🤖 персонаж игры', 'office psychologist · 🤖 game character')}</small></div>
      <div class="psy-body" aria-live="polite"></div>
      <div class="psy-acts"><button class="btn-ghost" type="button" data-psy="more">💡 ${L('Ещё совет', 'Another tip')}</button><button class="btn-ghost" type="button" data-psy="quiz">📝 ${L('Самопроверка', 'Self-check')}</button><button class="btn-ghost" type="button" data-psy="breath">🫁 ${L('Минута дыхания', 'Breathing minute')}</button></div>
      <p class="psy-note">${PSY_NOTE()}</p>
      <button class="btn-main" type="button" data-psy="close">${L('Спасибо, Мира', 'Thanks, Mira')}</button></div>`;
    m.hidden = false;
    box = m.querySelector('.psy-box');
    box.querySelectorAll('[data-psy]').forEach(b => b.onclick = () => {
      const a = b.dataset.psy;
      if (a === 'close') { psyBye(); return; }
      if (a === 'more') { psyModal(psyTipHtml(psyRnd(PSY.tips.filter(x => x.cat !== 'keep')), L('Ещё один совет', 'One more tip'))); track('psy', { detail: 'more' }); }
      if (a === 'quiz') psyQuiz(0, []);
      if (a === 'breath') { m.hidden = true; m.innerHTML = ''; track('psy', { detail: 'breath' }); playBreak(51); }
    });
  }
  const body = box.querySelector('.psy-body');
  body.innerHTML = inner;
  body.classList.remove('psy-in'); void body.offsetWidth; body.classList.add('psy-in');
  psyMira(mood, opts);
}
// На прощание Мира улыбается и чуть кивает
function psyBye() {
  const m = $('modal'), sc = m.querySelector('.psy-scene');
  const done = () => { m.hidden = true; m.innerHTML = ''; };
  if (!sc || FX.off) return done();
  setMood(sc, 'joy'); sc.classList.add('bye');
  setTimeout(done, 650);
}
const psyTipHtml = (t, head) => `<small class="psy-kick">${head}</small><p class="psy-tip">${esc(psyT(t))}</p>`;

async function openPsy(source = 'menu') {
  if (!(await psyLoad())) { toast(L('Кабинет Миры сейчас не открывается — проверьте интернет', 'Mira’s office won’t open — check your connection')); return; }
  track('psy', { detail: source });
  psyModal(`<p class="psy-greet">${esc(psyT(psyRnd(PSY.greet)))}</p>${psyTipHtml(psyDayTip(), L('Совет дня', 'Tip of the day'))}`);
}

// Самопроверка: три вопроса → совет по самому «проблемному» ответу (или похвала, если всё хорошо)
function psyQuiz(i, picks) {
  const q = PSY.quiz[i];
  if (!q) {
    const cats = picks.filter(c => c !== 'keep'), cat = cats.length ? cats[Math.floor(Math.random() * cats.length)] : 'keep';
    const pool = PSY.tips.filter(x => x.cat === cat), tip = pool.length ? psyRnd(pool) : psyDayTip();
    track('psy', { detail: `quiz:${picks.join(',')}`.slice(0, 60) });
    return psyModal(`<p class="psy-greet">${cats.length ? L('Спасибо за честность. Вот с чего я бы начала:', 'Thanks for being honest. Here’s where I’d start:') : L('Звучит так, будто вы неплохо о себе заботитесь. Так держать!', 'Sounds like you look after yourself pretty well. Keep it up!')}</p>${psyTipHtml(tip, L('Совет для вас', 'A tip for you'))}`, cats.length ? 'happy' : 'joy');
  }
  psyModal(`<small class="psy-kick">${L(`Вопрос ${i + 1} из ${PSY.quiz.length}`, `Question ${i + 1} of ${PSY.quiz.length}`)}</small><p class="psy-q">${esc(psyT(q))}</p>
    <div class="psy-ans">${q.a.map((a, j) => `<button class="btn-ghost" type="button" data-a="${j}">${esc(psyT(a))}</button>`).join('')}</div>`, 'neutral', { think: true });
  $('modal').querySelectorAll('[data-a]').forEach(b => b.onclick = () => psyQuiz(i + 1, [...picks, q.a[+b.dataset.a].cat]));
}

// Кнопка в главном меню — под строкой «Разминки дня»
function renderPsyBtn() {
  const after = $('pzRow') || $('brkDay'); if (!after) return;
  let b = $('psyOpen');
  if (!b) { b = Object.assign(document.createElement('button'), { type: 'button', id: 'psyOpen', className: 'psy-open' }); b.onclick = () => openPsy('menu'); }
  if (after.nextElementSibling !== b) after.after(b);
  b.innerHTML = `<span class="face psy-mini" aria-hidden="true">${faceSvg(MIRA_FACE)}</span><span><b>${L('Кабинет психолога', 'Psychologist’s office')}</b><small>${L('Мира: совет дня и самопроверка против выгорания', 'Mira: tip of the day and a burnout self-check')}</small></span><i aria-hidden="true">›</i>`;
  b.querySelector('.expr').innerHTML = exprSvg('happy');
}
bus.on('menu', () => setTimeout(renderPsyBtn, 0));
setTimeout(renderPsyBtn, 0);

// После недели, проваленной из-за Кукухи или Энергии на нуле, — Мира приходит сама (не чаще раза в день)
bus.on('weekEnd', x => {
  if (x.won || x.high || !['psyche', 'energy'].includes(x.stat) || store.get('vdp-psy-day', '') === today()) return;
  setTimeout(async () => {
    if (!(await psyLoad()) || views.end.hidden || !$('modal').hidden) return;
    store.set('vdp-psy-day', today());
    track('psy', { detail: `after:${x.stat}` });
    psyModal(`<p class="psy-greet">${esc(psyT(psyRnd(PSY.after_bad_week)))}</p>${psyTipHtml(psyRnd(PSY.tips.filter(t => ['rest', 'breaks', 'mind', 'sleep'].includes(t.cat))), L('Маленький шаг на сегодня', 'A small step for today'))}`, 'sad');
  }, 2600);
});
