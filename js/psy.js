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

function psyModal(inner) {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass psy-box" role="dialog" aria-modal="true" aria-labelledby="psyTitle">
    <div class="psy-head"><span class="psy-ava" aria-hidden="true">🛋️</span><div><b id="psyTitle">${L('Кабинет Миры', 'Mira’s office')}</b><small>${L('психолог офиса · персонаж игры', 'office psychologist · game character')}</small></div></div>
    <div class="psy-body">${inner}</div>
    <div class="psy-acts"><button class="btn-ghost" type="button" data-psy="more">💡 ${L('Ещё совет', 'Another tip')}</button><button class="btn-ghost" type="button" data-psy="quiz">📝 ${L('Самопроверка', 'Self-check')}</button><button class="btn-ghost" type="button" data-psy="breath">🫁 ${L('Минута дыхания', 'Breathing minute')}</button></div>
    <p class="psy-note">${PSY_NOTE()}</p>
    <button class="btn-main" type="button" data-psy="close">${L('Спасибо, Мира', 'Thanks, Mira')}</button></div>`;
  m.hidden = false;
  m.querySelectorAll('[data-psy]').forEach(b => b.onclick = () => {
    const a = b.dataset.psy;
    if (a === 'close') { m.hidden = true; m.innerHTML = ''; return; }
    if (a === 'more') { psyModal(psyTipHtml(psyRnd(PSY.tips.filter(x => x.cat !== 'keep')), L('Ещё один совет', 'One more tip'))); track('psy', { detail: 'more' }); }
    if (a === 'quiz') psyQuiz(0, []);
    if (a === 'breath') { m.hidden = true; m.innerHTML = ''; track('psy', { detail: 'breath' }); playBreak(51); }
  });
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
    return psyModal(`<p class="psy-greet">${cats.length ? L('Спасибо за честность. Вот с чего я бы начала:', 'Thanks for being honest. Here’s where I’d start:') : L('Звучит так, будто вы неплохо о себе заботитесь. Так держать!', 'Sounds like you look after yourself pretty well. Keep it up!')}</p>${psyTipHtml(tip, L('Совет для вас', 'A tip for you'))}`);
  }
  psyModal(`<small class="psy-kick">${L(`Вопрос ${i + 1} из ${PSY.quiz.length}`, `Question ${i + 1} of ${PSY.quiz.length}`)}</small><p class="psy-q">${esc(psyT(q))}</p>
    <div class="psy-ans">${q.a.map((a, j) => `<button class="btn-ghost" type="button" data-a="${j}">${esc(psyT(a))}</button>`).join('')}</div>`);
  $('modal').querySelectorAll('[data-a]').forEach(b => b.onclick = () => psyQuiz(i + 1, [...picks, q.a[+b.dataset.a].cat]));
}

// Кнопка в главном меню — под строкой «Разминки дня»
function renderPsyBtn() {
  const after = $('pzRow') || $('brkDay'); if (!after) return;
  let b = $('psyOpen');
  if (!b) { b = Object.assign(document.createElement('button'), { type: 'button', id: 'psyOpen', className: 'psy-open' }); b.onclick = () => openPsy('menu'); }
  if (after.nextElementSibling !== b) after.after(b);
  b.innerHTML = `<span aria-hidden="true">🛋️</span><span><b>${L('Кабинет психолога', 'Psychologist’s office')}</b><small>${L('Мира: совет дня и самопроверка против выгорания', 'Mira: tip of the day and a burnout self-check')}</small></span><i aria-hidden="true">›</i>`;
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
    psyModal(`<p class="psy-greet">${esc(psyT(psyRnd(PSY.after_bad_week)))}</p>${psyTipHtml(psyRnd(PSY.tips.filter(t => ['rest', 'breaks', 'mind', 'sleep'].includes(t.cat))), L('Маленький шаг на сегодня', 'A small step for today'))}`);
  }, 2600);
});
