// «Крот в офисе» — одиночный детектив внутри недели карьеры (в духе «Мафии»).
// Примерно в каждой третьей неделе (с 3-й недели карьеры, не в учебную) кто-то из пяти выдуманных коллег сливает информацию боссу.
// По ходу недели — 4 улики (после 5-й, 10-й, 15-й и 20-й карточек): три алиби невиновных и одна примета крота.
// В пятницу на экране итогов — «Собрание»: кого обвинить. Угадали — +8 у.е. и в коллекцию; ошиблись — крот уходит.
// Подозреваемые — вымышленные NPC (пометка «персонаж игры»), реальных игроков никто не обвиняет.

const MOLE_SUSPECTS = [
  { id: 'alla', ico: '📊', f: true, name: L('Алла', 'Alla'), role: L('бухгалтерия', 'accounting'), tell: L('пахнет мятным чаем и считает всё до копейки', 'smells of mint tea and counts every cent') },
  { id: 'timur', ico: '💻', f: false, name: L('Тимур', 'Timur'), role: L('айтишник', 'IT'), tell: L('носит толстовку с капюшоном и печатает вслепую', 'wears a hoodie and touch-types') },
  { id: 'zhanna', ico: '📣', f: true, name: L('Жанна', 'Zhanna'), role: L('маркетинг', 'marketing'), tell: L('рисует сердечки на полях и обожает стикеры', 'doodles hearts in margins and loves stickers') },
  { id: 'oleg', ico: '📦', f: false, name: L('Олег', 'Oleg'), role: L('логистика', 'logistics'), tell: L('ходит с рулеткой и знает все склады наизусть', 'carries a tape measure and knows every warehouse') },
  { id: 'vika', ico: '🎒', f: true, name: L('Вика', 'Vika'), role: L('стажёр', 'intern'), tell: L('всё записывает в блокнот с котиками', 'writes everything down in a kitten notebook') },
];
// Алиби (невиновен) и приметы (указывают на крота): {n} — имя, {а}/{ла} — по полу NPC
const MOLE_ALIBI = [
  L('{n} весь вечер был{а} на созвоне с клиентами — сливать было некогда.', '{n} was on a client call all evening — no time to leak anything.'),
  L('Камера у кулера: {n} в 18:40 спокойно уходил{а} домой с пакетом мандаринов.', 'The cooler cam: at 6:40 PM {n} calmly went home with a bag of tangerines.'),
  L('{n} в обед был{а} у стоматолога — есть талончик с печатью.', '{n} was at the dentist at lunch — there’s a stamped slip.'),
  L('{n}: пропуск ни разу за месяц не открывал этаж босса.', '{n}: their badge hasn’t opened the boss’s floor in a month.'),
  L('{n} весь день просидел{а} в переговорке на тренинге — дверь была заперта.', '{n} spent the whole day in a locked training room.'),
];
const MOLE_HINT = L('В переговорке, где кто-то шептался с людьми босса, нашли улику: тот, кто это был, {t}.', 'In the room where someone whispered with the boss’s people, there was a clue: whoever it was {t}.');

const moleG = (s, f) => s.replace(/\{а\}/g, f ? 'а' : '').replace(/\{ла\}/g, f ? 'ла' : 'л');
const moleSus = id => MOLE_SUSPECTS.find(s => s.id === id);

// начало недели: завести дело
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || S2.training || S2.mole || typeof C === 'undefined' || !C || (C.week || 1) < 3) return;
  if ((C.molesLastWeek || 0) >= C.week - 1 || Math.random() > 0.34) return;  // не две недели подряд; ~каждая третья
  C.molesLastWeek = C.week;
  const sus = [...MOLE_SUSPECTS].sort(() => Math.random() - 0.5).map(s => s.id), culprit = sus[0];
  const innocents = sus.slice(1).sort(() => Math.random() - 0.5);
  // 4 улики: 3 алиби разных невиновных + примета крота (на случайной позиции)
  const alibi = MOLE_ALIBI.map((_, i) => i).sort(() => Math.random() - 0.5);  // у каждого алиби свой текст
  const clues = innocents.slice(0, 3).map((id, i) => ({ k: 'alibi', id, t: alibi[i] }));
  clues.splice(Math.floor(Math.random() * 4), 0, { k: 'hint', id: culprit });
  S2.mole = { culprit, clues, got: 0, at: [5, 10, 15, 20] };
  setTimeout(() => moleModal(`<span class="lvl-ico" aria-hidden="true">🕵️</span><h2>${L('В офисе завёлся крот', 'There’s a mole in the office')}</h2>
    <p>${L('Кто-то из коллег сливает рабочие секреты боссу. За неделю вы найдёте 4 улики, а в пятницу на собрании назовёте крота.', 'Someone is leaking work secrets to the boss. You’ll find 4 clues this week and name the mole at Friday’s meeting.')}</p>
    ${moleSuspectsHtml()}<p class="ml-note">🤖 ${L('Все подозреваемые — персонажи игры', 'All suspects are game characters')}</p>
    <button class="btn-main" type="button" data-ml-ok>${L('Начать расследование', 'Start investigating')}</button>`), 3200);
  track('mole_start');
});

const moleSuspectsHtml = (pick = false) => `<div class="ml-sus">${MOLE_SUSPECTS.map(s => `<${pick ? 'button type="button"' : 'div'} class="ml-s" data-ml-pick="${s.id}"><span class="ml-ico" aria-hidden="true">${s.ico}</span><b>${esc(s.name)}</b><small>${esc(s.role)}</small></${pick ? 'button' : 'div'}>`).join('')}</div>`;
const moleClueText = c => { const s = moleSus(c.id); return c.k === 'alibi' ? moleG(MOLE_ALIBI[c.t], s.f).replace('{n}', s.name) : MOLE_HINT.replace('{t}', s.tell); };
const moleCluesHtml = M => `<ol class="ml-clues">${M.clues.slice(0, M.got).map(c => `<li class="${c.k}">${esc(moleClueText(c))}</li>`).join('')}</ol>`;

function moleModal(html, onOk) {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box ml-box" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  m.querySelector('[data-ml-ok]')?.addEventListener('click', () => { m.hidden = true; m.innerHTML = ''; onOk?.(); });
}

// улика после 5-й, 10-й, 15-й, 20-й карточки — когда экран свободен (как мини-события)
bus.on('answer', () => {
  const M = S?.mole; if (!M || S.mode !== 'career' || M.got >= 4 || S.step + 1 !== M.at[M.got]) return;
  const want = M.got; let tries = 0;
  const wait = () => {
    if (!S?.mole || S.mole.got !== want || views.game.hidden) return;
    const quizOn = $('quiz') && !$('quiz').hidden;
    if (!busy && !splashOn && !quizOn && $('modal').hidden && !window.vdpPaused) {
      M.got++; saveCareerWeek?.();
      sfx.sms?.();
      moleModal(`<span class="lvl-ico" aria-hidden="true">🔎</span><h2>${L(`Улика ${M.got} из 4`, `Clue ${M.got} of 4`)}</h2>
        <p class="ml-new">${esc(moleClueText(M.clues[M.got - 1]))}</p>${M.got > 1 ? `<details class="ml-all"><summary>${L('Все улики', 'All clues')}</summary>${moleCluesHtml(M)}</details>` : ''}
        <button class="btn-main" type="button" data-ml-ok>${L('Записать в блокнот', 'Note it down')}</button>`);
      return;
    }
    if (++tries < 100) setTimeout(wait, 500);
  };
  setTimeout(wait, 900);
});
const saveCareerWeek = () => { try { if (S?.mode === 'career') store.set(KEY.save, S); } catch {} };

// пятница: собрание на экране итогов
bus.on('weekEnd', x => {
  const M = S?.mole; if (!M || x.mode !== 'career') return;
  const sheet = views.end.querySelector('.end-sheet'); if (!sheet) return;
  const at = sheet.querySelector('.place') || sheet.querySelector('.stack');
  if (!x.won) {  // уволили до пятницы — дело закрыто без собрания
    at?.insertAdjacentHTML('beforebegin', `<p class="nm-tease">🕵️ ${L('Крот затаился: до собрания вы не дожили. Может, в следующий раз…', 'The mole lies low: you didn’t make it to the meeting. Next time…')}</p>`);
    return;
  }
  at?.insertAdjacentHTML('beforebegin', `<div class="ml-meet" id="mlMeet"><b>🕵️ ${L('Собрание: кто крот?', 'Meeting: who’s the mole?')}</b>
    ${moleCluesHtml(M)}${moleSuspectsHtml(true)}</div>`);
  const box = $('mlMeet');
  box.querySelectorAll('[data-ml-pick]').forEach(b => b.onclick = () => {
    const ok = b.dataset.mlPick === M.culprit, s = moleSus(M.culprit), you = moleSus(b.dataset.mlPick);
    S.mole = null;
    let note = '';
    if (ok) {
      addCash(8); sfx.win?.();
      prefs.molesCaught = (prefs.molesCaught || 0) + 1; store.set(KEY.prefs, prefs);
      const fresh = typeof unlock === 'function' ? unlock(['mole_caught', ...(prefs.molesCaught >= 5 ? ['mole_hunter'] : [])]) : [];
      note = fresh.length ? `<span class="ml-ach">🏅 ${L('Новая концовка', 'New ending')}: «${esc(fresh[0].title)}»</span>` : '';
    } else sfx.lose?.();
    box.innerHTML = ok
      ? `<b>🎉 ${L(`Это ${s.name}! Крот пойман.`, `It was ${s.name}! Mole caught.`)}</b><p>${L(`Босс жмёт вам руку, а у вас +8 у.е. Разоблачено кротов: ${prefs.molesCaught}.`, `The boss shakes your hand: +$8. Moles caught: ${prefs.molesCaught}.`)}</p>${note}`
      : `<b>😶 ${L(`Это был${s.f ? 'а' : ''} ${s.name}, а не ${you.name}.`, `It was ${s.name}, not ${you.name}.`)}</b><p>${L(`${you.name} обиделся${you.f ? 'ась' : ''}, а крот спокойно пьёт кофе. Улики стоит перечитать.`, `${you.name} is offended, and the mole calmly sips coffee. Worth rereading the clues next time.`)}</p>`;
    track('mole_end', { detail: ok ? 'win' : 'lose' });
  });
});

ENDINGS.push(
  { id: 'mole_caught', title: L('Шерлок из бухгалтерии', 'Sherlock of Accounting'), hint: L('Поймать крота на собрании', 'Catch the mole at the meeting') },
  { id: 'mole_hunter', title: L('Гроза кротов', 'Mole hunter'), hint: L('Поймать пять кротов', 'Catch five moles') },
);
