// «🔥 Перегрев» — медленная шкала выгорания персонажа в карьере (C.heat, 0–100). Копится между неделями, а не внутри одной.
// Растёт: каждая рабочая неделя +4, неделя «на грани» (шкала ниже 15 или выше 85) ещё +6, увольнение +12.
// Падает: ровная неделя (все шкалы 30–70) −3, разминка −4 (до 3 в день), «Минута дыхания» −6, визит к Мире −8 (раз в день), отпуск −30.
// Последствия — в понедельник: от 60% Энергия и Кукуха −5, от 80% −10 и Мира зовёт сама, на 100% −15 и совет взять отпуск.
// Это игровая механика про персонажа, а не оценка состояния игрока.
const HEAT_LV = [
  [0, '🧊', L('Норма', 'All good'), L('Персонаж в форме.', 'Your character is in shape.')],
  [30, '🌡️', L('Устали', 'Tired'), L('Пока без последствий, но лучше остыть заранее.', 'No effects yet, but better to cool down early.')],
  [60, '🔥', L('Перегрев', 'Overheating'), L('В понедельник Энергия и Кукуха −5.', 'On Monday Energy and Sanity −5.')],
  [80, '🔥', L('На пределе', 'At the limit'), L('В понедельник Энергия и Кукуха −10. Мира хочет поговорить.', 'On Monday Energy and Sanity −10. Mira wants a word.')],
  [100, '🌋', L('Пора в отпуск', 'Time off needed'), L('В понедельник Энергия и Кукуха −15. Отпуск сбросит перегрев сильнее всего.', 'On Monday Energy and Sanity −15. A vacation cools you down the most.')],
];
const heatLv = h => [...HEAT_LV].reverse().find(x => h >= x[0]);
const heatPen = h => h >= 100 ? 15 : h >= 80 ? 10 : h >= 60 ? 5 : 0;
const heatNow = () => { const C2 = careerNow(); return C2 ? Math.round(C2.heat || 0) : null; };
function heatAdd(d, why) {
  const C2 = careerNow(); if (!C2 || !d) return 0;
  const was = C2.heat || 0; C2.heat = Math.max(0, Math.min(100, was + d)); careerSave(C2);
  const real = C2.heat - was;
  if (real < 0 && why) setTimeout(() => toast(L(`${why}: перегрев −${Math.abs(real)}% → ${Math.round(C2.heat)}%`, `${why}: overheat −${Math.abs(real)}% → ${Math.round(C2.heat)}%`)), 900);
  return real;
}
const heatBar = h => `<span class="heat-bar" aria-hidden="true"><i style="width:${h}%"></i></span>`;
const heatHtml = (h, delta) => {
  const [, ico, name, hint] = heatLv(h);
  return `<button type="button" class="heat-card${h >= 60 ? ' hot' : ''}" data-heat aria-label="${L('Перегрев: подробнее', 'Overheat: details')}">
    <span class="heat-top"><b>${ico} ${L('Перегрев', 'Overheat')} ${h}%</b>${delta ? `<em class="${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '+' : '−'}${Math.abs(delta)}</em>` : ''}<small>${name}</small></span>
    ${heatBar(h)}<small class="heat-hint">${hint}</small></button>`;
};
function openHeat() {
  const h = heatNow(); if (h == null) return;
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass heat-box" role="dialog" aria-modal="true" aria-labelledby="heatTitle">
    <h2 id="heatTitle">${heatLv(h)[1]} ${L('Перегрев', 'Overheat')}: ${h}%</h2>
    ${heatBar(h)}
    <p>${L('Игровая шкала выгорания вашего персонажа. Копится от недели к неделе и бьёт по понедельникам.', 'Your character’s burnout meter. It builds up week after week and hits on Mondays.')}</p>
    <ul class="heat-list">
      <li>📈 ${L('Каждая рабочая неделя +4, неделя на грани (шкала ниже 15% или выше 85%) ещё +6, увольнение +12', 'Every work week +4, a week on the edge (a meter under 15% or over 85%) +6 more, getting fired +12')}</li>
      <li>📉 ${L('Ровная неделя (все шкалы 30–70%) −3, разминка −4 (до трёх в день), «Минута дыхания» −6, разговор с Мирой −8, отпуск −30', 'A balanced week (all meters 30–70%) −3, a break −4 (up to three a day), One-minute breathing −6, a talk with Mira −8, vacation −30')}</li>
      <li>⚠️ ${L('От 60% — в понедельник Энергия и Кукуха −5, от 80% — −10, на 100% — −15', 'From 60% — Energy and Sanity −5 on Monday, from 80% — −10, at 100% — −15')}</li>
    </ul>
    <div class="row2"><button class="btn-main" type="button" id="heatBrk">☕ ${L('Разминка', 'Break')}</button><button class="btn-ghost" type="button" id="heatPsy">🛋️ ${L('К Мире', 'See Mira')}</button></div>
    <button class="btn-ghost" type="button" id="heatClose">${L('Закрыть', 'Close')}</button></div>`;
  m.hidden = false;
  $('heatBrk').onclick = () => { m.hidden = true; openBreaks(); };
  $('heatPsy').onclick = () => { m.hidden = true; openPsy('heat', h >= 60 ? 'tired' : ''); };
  $('heatClose').onclick = () => { m.hidden = true; };
  track('heat_open', { detail: String(h) });
}
document.addEventListener('click', e => { if (e.target.closest?.('[data-heat]')) openHeat(); });

// Конец недели карьеры: считаем перегрев и показываем его на экране итогов
bus.on('weekEnd', e => {
  if (e.mode !== 'career' || !careerNow()) return;
  const r = Object.values(e.res || {}), edge = r.some(v => v < 15 || v > 85), calm = r.length && r.every(v => v >= 30 && v <= 70);
  const delta = heatAdd(e.won ? (calm ? -3 : 4 + (edge ? 6 : 0)) : 12);
  const h = heatNow();
  if (h >= 80) { prefs.psyCall = { d: today(), cat: 'tired' }; store.set(KEY.prefs, prefs); if (typeof renderPsyBtn === 'function') renderPsyBtn(); }
  const stack = views.end.querySelector('.end-sheet > .stack');
  if (stack && !views.end.querySelector('.heat-card')) stack.insertAdjacentHTML('beforebegin', heatHtml(h, Math.round(delta)));
});
// Понедельник: последствия перегрева
bus.on('deck', S2 => {
  if (S2.mode !== 'career') return;
  const h = heatNow(), p = heatPen(h || 0); if (!p) return;
  S2.res.energy = Math.max(5, S2.res.energy - p); S2.res.psyche = Math.max(5, S2.res.psyche - p);
  setTimeout(() => toast(L(`${heatLv(h)[1]} Перегрев ${h}%: Энергия и Кукуха −${p}. Остыть помогут разминки и Мира`, `${heatLv(h)[1]} Overheat ${h}%: Energy and Sanity −${p}. Breaks and Mira help you cool down`)), 2600);
});
// Остываем: разминки, дыхание, Мира, отпуск
bus.on('breakEnd', e => {
  if (!careerNow()) return;
  if (e.n === 51) return heatAdd(-6, L('🫁 Дыхание', '🫁 Breathing'));
  const t = prefs.heatBrk?.d === today() ? prefs.heatBrk : { d: today(), n: 0 };
  if (t.n >= 3) return;
  t.n++; prefs.heatBrk = t; store.set(KEY.prefs, prefs);
  heatAdd(-4, L('☕ Разминка', '☕ Break'));
});
bus.on('psy', () => {
  if (!careerNow() || prefs.heatPsy === today()) return;
  prefs.heatPsy = today(); store.set(KEY.prefs, prefs);
  heatAdd(-8, L('🛋️ Разговор с Мирой', '🛋️ Talk with Mira'));
});
if (typeof takeVacation === 'function') {
  const tv0 = takeVacation;
  takeVacation = function () { const w = C?.week; tv0(); if (C && C.week !== w) { heatAdd(-30); const s = views.end.querySelector('.end-sheet > .stack'); if (s) s.insertAdjacentHTML('beforebegin', heatHtml(heatNow(), -30)); } };
}
// Меню: перегрев в карточке карьеры
bus.on('menu', () => {
  const box = $('careerCard'), h = heatNow(); if (!box || box.hidden || h == null) return;
  box.querySelector('.heat-card')?.remove();
  box.insertAdjacentHTML('beforeend', heatHtml(h));
});
