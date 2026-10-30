// Зачем возвращаться: задания дня, должности и опыт, свой рабочий стол, истории с продолжением, письма коллег между сессиями,
// соперники в неделе дня, «Что нового», сезонные недели и редкие карточки.
// Слушает события игры (bus в js/engine.js). Подключается после npc.js и до app.js.

// ---------- опыт и должности ----------
// Опыт: ответ +1, закрытая неделя +20 (проваленная +5), дедлайн +15, задание дня +30, все три задания +50
const RANKS = [
  { xp: 0,    name: L('Вечный стажёр', 'Eternal Intern'),            perk: L('старт карьеры', 'career start') },
  { xp: 120,  name: L('Младший специалист', 'Junior Associate'),      perk: L('подсказка дешевле на 1 у.е.', 'hints $1 cheaper') },
  { xp: 300,  name: L('Специалист', 'Associate'),                     perk: L('+1 предмет в сумке каждую неделю', '+1 item in your bag every week') },
  { xp: 600,  name: L('Старший специалист', 'Senior Associate'),      perk: L('+1 у.е. к зарплате в день', '+$1 daily pay') },
  { xp: 1000, name: L('Ведущий специалист', 'Lead Specialist'),       perk: L('подсказка дешевле ещё на 1 у.е.', 'hints another $1 cheaper') },
  { xp: 1500, name: L('Тимлид', 'Team Lead'),                         perk: L('премии за дедлайны +25%', 'deadline bonuses +25%') },
  { xp: 2200, name: L('Руководитель отдела', 'Head of Department'),   perk: L('+2 у.е. к зарплате в день', '+$2 daily pay') },
  { xp: 3100, name: L('Директор', 'Director'),                        perk: L('премии за дедлайны +50%', 'deadline bonuses +50%') },
  { xp: 4300, name: L('Генеральный директор', 'CEO'),                 perk: L('👑 корона в ленте и +2 предмета в сумке', '👑 a crown in the live strip and +2 bag items') },
];
const rankIdx = (xp = prefs.xp || 0) => RANKS.reduce((r, x, i) => xp >= x.xp ? i : r, 0);
// Бонусы должности: сколько добавить к предметам, зарплате, скидке на подсказку, премии за дедлайн
function rankPerk(kind) {
  const r = rankIdx();
  if (kind === 'items') return (r >= 2 ? 1 : 0) + (r >= 8 ? 1 : 0);
  if (kind === 'salary') return r >= 6 ? 2 : r >= 3 ? 1 : 0;
  if (kind === 'hint') return (r >= 1 ? 1 : 0) + (r >= 4 ? 1 : 0);
  if (kind === 'deadline') return r >= 7 ? .5 : r >= 5 ? .25 : 0;
  return 0;
}
let xpGained = 0;  // за текущую неделю — показать на экране итогов
function addXp(n, why) {
  const before = rankIdx();
  prefs.xp = (prefs.xp || 0) + n; xpGained += n; store.set(KEY.prefs, prefs);
  const after = rankIdx();
  if (after > before) setTimeout(() => levelUp(after), why === 'week' ? 1800 : 400);
}
function levelUp(r) {
  const m = $('modal'), x = RANKS[r];
  m.innerHTML = `<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="lvlTitle">
    <span class="lvl-ico" aria-hidden="true">${r === RANKS.length - 1 ? '👑' : '🎖️'}</span><span class="dl-kicker">${L('Повышение!', 'Promotion!')}</span>
    <h2 id="lvlTitle">${x.name}</h2><p>${L('Новый бонус', 'New perk')}: <b>${x.perk}</b></p>
    <button class="btn-main" type="button" id="lvlOk">${L('Ура!', 'Woohoo!')}</button></div>`;
  m.hidden = false; sfx.win?.(); confetti();
  $('lvlOk').onclick = () => { m.hidden = true; };
  syncDesk();
}
const rankLine = () => {
  const r = rankIdx(), x = prefs.xp || 0, next = RANKS[r + 1];
  return { r, name: RANKS[r].name, x, next, pct: next ? Math.round((x - RANKS[r].xp) / (next.xp - RANKS[r].xp) * 100) : 100 };
};

// Деньги карьеры: живая карьера в игре (C) или сохранённая
const careerNow = () => (typeof C !== 'undefined' && C) || store.get(KEY.career, null);
const careerSave = c => { if (typeof C !== 'undefined' && c === C) saveCareer(); else store.set(KEY.career, c); };

// ---------- задания дня ----------
// Каждый день — три задания (одинаковые на день для игрока). Выполнили — опыт и деньги в карьеру; все три — +1 предмет на неделю
const QUESTS = [
  { id: 'boss_no', need: 2, text: L('Скажите «нет» Боссу', 'Say “no” to the Boss'), on: { answer: x => /босс|boss|директор|director|ceo/i.test(x.card.who || '') && (x.eff.boss || 0) < 0 } },
  { id: 'work', need: 6, text: L('Выберите рабочих ответов (радуют Босса или стоят Энергии)', 'Pick work answers (please the Boss or cost Energy)'), on: { answer: x => workAnswer(x.card, x.side) } },
  { id: 'team', need: 6, text: L('Порадуйте коллег', 'Make your team happy'), on: { answer: x => (x.eff.colleagues || 0) > 0 } },
  { id: 'self', need: 5, text: L('Позаботьтесь о себе (ответы с плюсом к Кукухе)', 'Take care of yourself (answers that raise Sanity)'), on: { answer: x => (x.eff.psyche || 0) > 0 } },
  { id: 'cards', need: 20, text: L('Ответьте на карточки', 'Answer cards'), on: { answer: () => true } },
  { id: 'win', need: 1, text: L('Закройте любую неделю', 'Survive any week'), on: { weekEnd: x => x.won } },
  { id: 'calm', need: 1, text: L('Закройте неделю с Кукухой выше 50%', 'Survive a week with Sanity above 50%'), on: { weekEnd: x => x.won && x.res.psyche > 50 } },
  { id: 'energy', need: 1, text: L('Закройте неделю с Энергией выше 50%', 'Survive a week with Energy above 50%'), on: { weekEnd: x => x.won && x.res.energy > 50 } },
  { id: 'balance', need: 1, text: L('Закройте неделю, когда все шкалы между 30% и 70%', 'Survive a week with every meter between 30% and 70%'), on: { weekEnd: x => x.won && Object.values(x.res).every(v => v >= 30 && v <= 70) } },
  { id: 'daily', need: 1, text: L('Сыграйте неделю дня', 'Play the Daily Week'), on: { weekEnd: x => x.mode === 'daily' } },
  { id: 'deadline', need: 1, text: L('Выполните дедлайн', 'Complete a deadline'), on: { deadlineDone: () => true } },
  { id: 'hint', need: 1, text: L('Купите подсказку', 'Buy a hint'), on: { hint: () => true } },
  { id: 'shop', need: 1, text: L('Купите предмет в магазине', 'Buy an item in the shop'), on: { buy: () => true } },
  { id: 'dm', need: 1, text: L('Напишите кому-нибудь из ленты «в игре»', 'Message someone from the live strip'), on: { dm: () => true } },
];
function todayQuests() {
  const day = today(), q = prefs.quests;
  if (q?.day === day) return q;
  const rnd = seeded('quests-' + day + prefs.playerId), ids = shuffle(QUESTS.map(x => x.id), rnd);
  // одно задание «на неделю», два — на ответы или действия
  const weekQ = ids.find(id => QUESTS.find(x => x.id === id).on.weekEnd), rest = ids.filter(id => !QUESTS.find(x => x.id === id).on.weekEnd).slice(0, 2);
  prefs.quests = { day, list: [weekQ, ...rest].map(id => ({ id, got: 0 })), bonus: false };
  store.set(KEY.prefs, prefs);
  return prefs.quests;
}
function questEvent(kind, x) {
  const q = todayQuests();
  let changed = false;
  for (const it of q.list) {
    const def = QUESTS.find(d => d.id === it.id);
    if (!def || it.done || !def.on[kind] || !def.on[kind](x)) continue;
    it.got++; changed = true;
    if (it.got >= def.need) {
      it.done = true; addXp(30);
      const C2 = careerNow(), cash = 4;
      if (C2) { C2.bank = (C2.bank || 0) + cash; careerSave(C2); }
      toast(L(`🎯 Задание выполнено: ${def.text.toLowerCase()} · +30 опыта${C2 ? `, +${money(cash)}` : ''}`, `🎯 Quest done: ${def.text.toLowerCase()} · +30 XP${C2 ? `, +${money(cash)}` : ''}`));
      sfx.item?.();
    }
  }
  if (q.list.every(it => it.done) && !q.bonus) {
    q.bonus = true; addXp(50); prefs.bonusItems = (prefs.bonusItems || 0) + 1;
    setTimeout(() => toast(L('🎁 Все задания дня выполнены: +50 опыта и +1 предмет на следующую неделю', '🎁 All daily quests done: +50 XP and +1 item next week')), 2800);
  }
  if (changed) store.set(KEY.prefs, prefs);
}
for (const k of ['answer', 'weekEnd', 'deadlineDone', 'hint', 'buy', 'dm']) bus.on(k, x => questEvent(k, x));
bus.on('answer', () => addXp(1));
bus.on('deadlineDone', () => addXp(15));
bus.on('weekEnd', x => addXp(x.won ? 20 : 5, 'week'));

// ---------- свой рабочий стол ----------
// Украшения за деньги карьеры; стол видят коллеги (в ленте «в игре» и карточке игрока)
const DESK = [
  { id: 'cactus', icon: '🌵', price: 5,  name: L('Кактус', 'Cactus') },
  { id: 'mug',    icon: '☕', price: 6,  name: L('Кружка «Лучший сотрудник»', '“Best Employee” mug') },
  { id: 'lamp',   icon: '💡', price: 8,  name: L('Неоновая лампа', 'Neon lamp') },
  { id: 'fish',   icon: '🐠', price: 10, name: L('Аквариум с рыбкой', 'Fish tank') },
  { id: 'plant',  icon: '🪴', price: 10, name: L('Фикус', 'Ficus') },
  { id: 'cat',    icon: '🐈', price: 14, name: L('Фигурка офисного кота', 'Office cat figurine') },
  { id: 'coffee', icon: '🫖', price: 16, name: L('Своя кофемашина', 'Personal coffee maker') },
  { id: 'poster', icon: '🖼️', price: 18, name: L('Постер «Скоро пятница»', '“Friday Soon” poster') },
  { id: 'golf',   icon: '⛳', price: 22, name: L('Мини-гольф для созвонов', 'Mini golf for calls') },
  { id: 'chair',  icon: '🪑', price: 30, name: L('Кресло-трон', 'Throne chair') },
  { id: 'trophy', icon: '🏆', price: 40, name: L('Кубок «Пережил понедельник»', '“Survived Monday” trophy') },
];
const deskIcons = (ids = prefs.desk || []) => DESK.filter(d => ids.includes(d.id)).map(d => d.icon).join('');
function syncDesk() {
  if (!board.online || !prefs.name) return;
  board.rpc('set_desk', { p_id: prefs.playerId, p_desk: (rankIdx() === RANKS.length - 1 ? '👑' : '') + deskIcons(), p_rank: rankIdx() }).catch(() => {});
}
function openDesk() {
  const m = $('modal'), Cm = careerNow();
  const render = () => {
    const bank = Cm?.bank || 0, own = prefs.desk || [];
    m.innerHTML = `<div class="modal-box glass desk-box" role="dialog" aria-modal="true" aria-labelledby="deskTitle">
      <h2 id="deskTitle">🗄️ ${L('Мой рабочий стол', 'My desk')}</h2>
      <div class="desk-view" aria-label="${L('Стол', 'Desk')}">${deskIcons() || `<span class="desk-empty">${L('Пока пусто. Обставьте стол — его увидят коллеги.', 'Empty for now. Decorate it — your coworkers will see it.')}</span>`}</div>
      <p class="shop-bal">${Cm ? L(`На счёте: <b>${money(bank)}</b> `, `Balance: <b>${money(bank)}</b> `) + topupBtn(0, 'desk') : L('Украшения покупаются на деньги карьеры — начните карьеру.', 'Decorations cost career money — start a career first.')}</p>
      <div class="shop-list">${DESK.map(d => { const short = Cm && !own.includes(d.id) && bank < d.price; return `<button class="shop-item${short ? ' short' : ''}" data-desk="${d.id}" ${own.includes(d.id) || !Cm ? 'disabled' : ''} ${short ? `data-topup="${lackOf(d.price)}" data-topup-back="desk"` : ''}>
        <b>${d.icon} ${d.name}</b><span class="price">${own.includes(d.id) ? L('есть', 'owned') : short ? `💰 ${L('не хватает', 'short')} ${lackOf(d.price)}` : money(d.price)}</span></button>`; }).join('')}</div>
      <button class="btn-ghost" type="button" id="deskClose">${L('Закрыть', 'Close')}</button></div>`;
    m.querySelectorAll('[data-desk]').forEach(b => b.onclick = () => {
      const d = DESK.find(x => x.id === b.dataset.desk);
      if (!Cm || Cm.bank < d.price) return;
      Cm.bank -= d.price; careerSave(Cm); (prefs.desk ||= []).push(d.id); store.set(KEY.prefs, prefs);
      sfx.coins?.(); toast(L(`На столе: ${d.icon} ${d.name}`, `On your desk: ${d.icon} ${d.name}`)); syncDesk(); render(); renderMeta();
    });
    $('deskClose').onclick = () => { m.hidden = true; };
  };
  render(); m.hidden = false; m.onclick = e => { if (e.target === m) m.hidden = true; };
}

// ---------- меню: должность, стол, задания дня, отдел ----------
function renderMeta() {
  const box = $('metaBox'); if (!box || !prefs.name) return;
  const r = rankLine(), q = todayQuests();
  box.hidden = false;
  box.innerHTML = `<div class="rank-row"><span class="rank-ico" aria-hidden="true">${r.r === RANKS.length - 1 ? '👑' : '🎖️'}</span>
      <span class="rank-txt"><b>${r.name}</b><small>${r.next ? L(`${r.x} / ${r.next.xp} опыта · дальше: ${r.next.name}`, `${r.x} / ${r.next.xp} XP · next: ${r.next.name}`) : L(`${r.x} опыта · вершина карьеры`, `${r.x} XP · top of the ladder`)}</small>
      <span class="dl-prog"><i style="width:${r.pct}%"></i></span></span>
      <button class="btn-chip" type="button" id="deskBtn">${deskIcons() || '🗄️'} ${L('Мой стол', 'My desk')}</button></div>
    <div class="quests"><b class="q-title">🎯 ${L('Задания дня', 'Daily quests')} · ${q.list.filter(x => x.done).length}/3</b>
      ${q.list.map(it => { const d = QUESTS.find(x => x.id === it.id); return d ? `<div class="q-row${it.done ? ' done' : ''}"><span>${it.done ? '✅' : '▫️'} ${d.text}</span><span class="q-n">${Math.min(it.got, d.need)}/${d.need}</span></div>` : ''; }).join('')}
      <small class="q-note">${q.bonus ? L('Все выполнены — завтра будут новые', 'All done — new ones tomorrow') : L('Каждое: +30 опыта и +4 у.е. в карьеру · все три: +1 предмет на неделю', 'Each: +30 XP and +$4 to your career · all three: +1 bag item')}</small></div>
    <div class="dept-nudge" id="deptNudge" hidden></div>`;
  $('deskBtn').onclick = openDesk;
  deptNudge();
}
bus.on('menu', renderMeta);
// Отдел: на каком месте и сколько до первого
async function deptNudge() {
  const el = $('deptNudge'); if (!el || !prefs.dept) return;
  try {
    const rows = await board.depts(), i = rows.findIndex(d => d.dept === prefs.dept);
    if (i < 0) { el.hidden = false; el.textContent = L(`🏢 Ваш отдел «${prefs.dept}» ещё не в рейтинге недели — закройте неделю, чтобы его открыть`, `🏢 Your department “${prefs.dept}” isn’t on this week’s board yet — survive a week to put it there`); return; }
    el.hidden = false;
    el.textContent = i === 0 ? L(`🏆 Ваш отдел «${prefs.dept}» — первый на этой неделе! Удержите место`, `🏆 Your department “${prefs.dept}” is #1 this week! Hold the lead`)
      : L(`🏢 «${prefs.dept}» — ${i + 1}-е место. До «${rows[i - 1].dept}» не хватает ${rows[i - 1].avg_score - rows[i].avg_score} очков`, `🏢 “${prefs.dept}” is #${i + 1}. ${rows[i - 1].avg_score - rows[i].avg_score} points behind “${rows[i - 1].dept}”`);
  } catch {}
}

// ---------- истории с продолжением, сезоны, редкие карточки (data/events.json) ----------
let EVENTS = null;
const tr = o => o && typeof o === 'object' ? (o[LANG] || o.ru) : o;
const evCard = (c, extra = {}) => norm({ id: c.id, who: tr(c.who), text: tr(c.text), phase: c.phase || 'Утро',
  answers: { left: { label: tr(c.left), effects: c.left_effects }, right: { label: tr(c.right), effects: c.right_effects } }, ...extra });
const eventsReady = (async () => {
  try { EVENTS = window.EVENTS_JSON || await (await fetch('data/events.json')).json(); } catch { EVENTS = null; }
  if (!EVENTS) return;
  for (const t of EVENTS.teasers || []) byId[t.card.id] = evCard(t.card, { teaser: t.id });
  for (const c of EVENTS.rare || []) byId[c.id] = evCard(c, { rare: true });
  const slots = [['Понедельник', 'Утро'], ['Вторник', 'День'], ['Среда', 'Вечер'], ['Четверг', 'Утро'], ['Четверг', 'Вечер'], ['Пятница', 'День']];
  for (const z of EVENTS.seasons || []) {
    if (SEASONS.some(x => x.id === z.id)) continue;
    const title = tr(z.title);
    const cards = z.cards.map((c, i) => ({ ...evCard(c), day: slots[i % slots.length][0], phase: slots[i % slots.length][1], season: title }));
    SEASONS.push({ id: z.id, title, from: z.from, to: z.to, rule: tr(z.rule), cards });
    for (const c of cards) { SEASON_CARDS.push(c); byId[c.id] = c; }
  }
})();
// Конец недели: интрига на следующую. Начало следующей недели: карточка, которая её разрешает (11:00 понедельника)
bus.on('weekEnd', x => {
  if (x.mode !== 'career' || !EVENTS?.teasers?.length) return;
  if (!prefs.teaser) {
    const done = prefs.teasersDone || [], left = EVENTS.teasers.filter(t => !done.includes(t.id));
    const t = (left.length ? left : EVENTS.teasers)[Math.floor(Math.random() * (left.length || EVENTS.teasers.length))];
    prefs.teaser = t.id; store.set(KEY.prefs, prefs);
  }
});
bus.on('deck', S2 => {
  if (S2.mode !== 'career') return;
  if (prefs.teaser) {
    const t = EVENTS?.teasers?.find(x => x.id === prefs.teaser);
    const at = [1, 2, 3, 0].find(i => !S2.deck[i]?.fixed && !S2.deck[i]?.origin);  // первый свободный слот понедельника
    if (t && byId[t.card.id] && at != null) {
      S2.deck[at] = { id: t.card.id, time: slotTime(at), fixed: true, origin: L('История с продолжением', 'To be continued') };
      (prefs.teasersDone ||= []).push(prefs.teaser); prefs.teaser = null; store.set(KEY.prefs, prefs);
    }
  }
  // редкая карточка: примерно одна на 8 недель — в случайный свободный слот
  const rares = (EVENTS?.rare || []).filter(c => !(prefs.rareGot || []).includes(c.id));
  if (rares.length && Math.random() < .12) {
    const free = S2.deck.map((s, i) => s.fixed || i === 0 || i === S2.deck.length - 1 ? -1 : i).filter(i => i >= 0);
    const i = free[Math.floor(Math.random() * free.length)], c = rares[Math.floor(Math.random() * rares.length)];
    if (i != null) S2.deck[i] = { id: c.id, time: slotTime(i), fixed: true };
  }
});
bus.on('answer', x => {
  if (!x.card.rare || (prefs.rareGot || []).includes(x.card.id)) return;
  (prefs.rareGot ||= []).push(x.card.id); store.set(KEY.prefs, prefs); addXp(25);
  setTimeout(() => toast(L(`✨ Редкое событие в коллекции: ${prefs.rareGot.length} из ${EVENTS.rare.length} · +25 опыта`, `✨ Rare event collected: ${prefs.rareGot.length} of ${EVENTS.rare.length} · +25 XP`)), 1200);
});

// ---------- экран итогов: опыт, «было близко», интрига, задания ----------
bus.on('weekEnd', x => {
  const sheet = document.querySelector('#end .end-sheet'), stack = sheet?.querySelector('.stack');
  if (!stack) return;
  const q = todayQuests(), left = WEEK_LEN - x.step, t = prefs.teaser && EVENTS?.teasers?.find(z => z.id === prefs.teaser);
  const r = rankLine();
  stack.insertAdjacentHTML('beforebegin', `<div class="meta-end">
    ${!x.won && left > 0 && left <= 8 ? `<p class="near-miss">😬 ${L(`До пятницы, 18:00, оставалось всего ${pl(left, 'карточка', 'карточки', 'карточек', '', '')}!`, `Only ${left} ${left === 1 ? 'card' : 'cards'} away from Friday, 6 PM!`)}</p>` : ''}
    <p class="xp-line">🎖️ +${xpGained} ${L('опыта', 'XP')} · ${r.name}${r.next ? ` · ${r.x}/${r.next.xp}` : ''}</p>
    <p class="q-mini">🎯 ${L('Задания дня', 'Daily quests')}: ${q.list.filter(z => z.done).length}/3</p>
    ${t ? `<div class="teaser"><b>📌 ${L('В следующей серии', 'Next time')}</b><span>${esc(tr(t.teaser))}</span></div>` : ''}</div>`);
  xpGained = 0;
  // реванш вместо скромного «ещё раз»
  const next = $('next');
  if (!x.won && next && x.mode !== 'career' && x.mode !== 'tour') next.textContent = L('↻ Реванш', '↻ Rematch');
});

// ---------- коллеги пишут, пока вас нет ----------
// Не заходили 3+ часа — 1–2 непрочитанных от персонажей; колокольчик зовёт прочитать
const MISS = EN ? ['Where’d you go? The Boss was asking about the report 👀', 'Coffee isn’t the same without you ☕', 'You missed it — someone microwaved fish again. Come back!', 'The Daily Week is fresh. Bet you can’t beat my score 😏', 'Galya has news. Big news. Log in.']
  : ['Ты куда пропал? Босс спрашивал про отчёт 👀', 'Без тебя кофе не тот ☕', 'Ты пропустил: кто-то опять грел рыбу в микроволновке. Возвращайся!', 'Неделя дня свежая. Спорим, мой результат не побьёшь? 😏', 'У Гали новости. Большие. Заходи.'];
function missYou() {
  const last = prefs.lastSeen || 0, now = Date.now();
  prefs.lastSeen = now; store.set(KEY.prefs, prefs);
  if (!last || now - last < 3 * 3600e3 || !prefs.name || typeof NPCS === 'undefined') return;
  const all = store.get('vdp-npc-dm', {}), n = now - last > 24 * 3600e3 ? 2 : 1;
  const who = shuffle([...NPCS]).slice(0, n);
  who.forEach((c, i) => { (all[c.id] ||= []).push({ mine: false, msg: MISS[(Math.floor(now / 3600e3) + i) % MISS.length], at: now - i * 60000 }); });
  store.set('vdp-npc-dm', all);
  setTimeout(() => who.forEach(c => ring(L(`${c.name} пишет вам`, `${c.name} sent you a message`), () => openDm(c.id, c.name))), 2500);
}
setInterval(() => { if (!document.hidden) { prefs.lastSeen = Date.now(); store.set(KEY.prefs, prefs); } }, 60000);

// ---------- соперники в неделе дня ----------
// Кто из вашего отдела или офиса обошёл ваш результат недели дня — колокольчик и приглашение на реванш
async function rivals() {
  if (!board.online || !prefs.name) return;
  const day = today(), mine = store.get(KEY.daily, {})[day];
  if (!mine) return;
  try {
    const me = await myTag, rows = await board.daily(day), seen = prefs.rivalSeen?.day === day ? prefs.rivalSeen.tags : [];
    const myScore = mine.won ? 1000 + mine.total : 0;
    for (const r of rows) {
      if (r.tag === me || seen.includes(r.tag) || !(prefs.dept && r.dept === prefs.dept)) continue;
      if ((r.won ? 1000 + r.total : r.step) > myScore) {
        seen.push(r.tag);
        ring(L(`${r.name} (${r.dept}) обошёл(ла) вас в неделе дня. Реванш?`, `${r.name} (${r.dept}) beat you in the Daily Week. Rematch?`), () => startDaily(), false);
      }
    }
    prefs.rivalSeen = { day, tags: seen }; store.set(KEY.prefs, prefs);
  } catch {}
}
setInterval(rivals, 5 * 60000);

// ---------- что нового ----------
const WHATS_NEW = { v: '2026-11-06', items: EN
  ? ['⏱ Certification: 20 seconds per question; used lifelines can be bought again for $3', '🐾 Pets: cats, dogs, parrots and aquarium fish — 22 breeds in 3D. They need food every week, toys, the vet and vaccinations', '🎁 What you buy is now in your character’s hands in the cartoon', '🗣️ 300 more voice lines: Monday send-offs, cheering after a week, comfort after getting fired, the kids and pets talk too', '📜 Certification exam: 25 questions with 50:50, phone a friend and ask the audience — pass it and your pay goes up by $0.5 a day (once a day)', '💵 New pay scale: $2 a day for everyone, hints now cost $2, rent and food $4 a week', '⏱ 30 seconds per card: a nasty buzzer 5 seconds before the end, and a $1 fine if you’re late', '🗣️ Your character and the kids now talk: “please”, “thank you”, “I love you”, “I’m upset”…', '🏍️ New purchases with 3D cartoons: a motorbike, a boat, a fishing rod, a bike, an e-scooter, a console, a manicure, a beautician, a barbershop… — your character rides off on what you bought', '👧👦 Three kids with their own wishes: a bike, a phone, a console, summer camp', '🔄 You can now switch your character at any time — progress stays', '💌 Your character now texts you mid-week: flowers, sweets, phone credit, groceries, clothes, nights out — 36 things to choose from, each with its own short cartoon', '💔 Breakdown meter: let their mood crash and your career rolls back 1–2 weeks', '🧍 Your 3D character: pick one of 10, name them — they’ll ask for food, a home, a car, a wedding… and it all costs money', '🎯 Daily quests — three goals every day', '🎖️ Ranks from Intern to CEO, with perks', '🗄️ Decorate your desk — coworkers can see it', '📌 Stories that continue next week', '✨ Rare events to collect', '🎃 Office Halloween week', '📅 A week is now 25 cards — 5 a day']
  : ['⏱ Аттестация: 20 секунд на вопрос; использованную подсказку можно купить ещё раз за 3 у.е.', '🐾 Питомцы: кошки, собаки, попугаи и рыбки — 22 породы в 3D. Им нужен корм каждую неделю, игрушки, ветеринар и прививки', '🎁 Покупка теперь в руках у персонажа в мультике', '🗣️ Ещё 300 реплик: провожает на работу, поздравляет с неделей, утешает после увольнения, говорят дети и питомцы', '🔒 Без регистрации — 4 недели бесплатно, дальше регистрация (бесплатно) или 0,5 у.е. за неделю', '📜 Аттестация: 25 вопросов с подсказками «50 на 50», «Звонок другу» и «Помощь зала» — сдали, и оклад растёт на 0,5 у.е. в день (раз в день)', '💵 Новая сетка окладов: 2 у.е. в день для всех, подсказка — 2 у.е., жильё и еда — 4 у.е. в неделю', '⏱ 30 секунд на карточку: за 5 секунд — мерзкий зуммер, не успели — штраф 1 у.е.', '🗣️ Персонаж и дети заговорили: «ну пожалуйста», «спасибо», «я люблю тебя», «я обиделся»… — 300 реплик', '🏍️ Новые покупки с 3D-мультиками: мотоцикл, лодка, удочка, велосипед, электросамокат, приставка, маникюр, косметолог, барбершоп… — персонаж уезжает на купленном', '👧👦 Трое детей со своими желаниями: велосипед, телефон, приставка, летний лагерь', '🔄 Персонажа можно сменить в любой момент — прогресс сохранится', '💌 Персонаж пишет прямо посреди недели: цветы, сладкое, баланс телефона, продукты, одежда, вечер вне дома — 36 вещей на выбор, и у каждой покупки свой мультик', '💔 Шкала срывов: если настроение персонажа рухнет, карьера откатится на 1–2 недели назад', '🧍 Ваш 3D-персонаж: выберите одного из 10 и дайте имя — он будет просить еду, жильё, машину, свадьбу… и всё это стоит денег', '🎯 Задания дня — три цели каждый день', '🎖️ Должности от стажёра до генерального, с бонусами', '🗄️ Обставьте свой рабочий стол — его видят коллеги', '📌 Истории с продолжением на следующей неделе', '✨ Редкие события для коллекции', '🎃 Неделя «Хэллоуин в офисе»', '📅 Неделя теперь — 25 карточек, по 5 в день'] };
function whatsNew() {
  if (!prefs.name || !(prefs.gamesPlayed > 0) || prefs.whatsNew === WHATS_NEW.v) return;
  prefs.whatsNew = WHATS_NEW.v; store.set(KEY.prefs, prefs);
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="wnTitle"><span class="lvl-ico" aria-hidden="true">🆕</span>
    <h2 id="wnTitle">${L('Что нового', 'What’s new')}</h2><ul class="lw-list">${WHATS_NEW.items.map(x => `<li>${x}</li>`).join('')}</ul>
    <button class="btn-main" type="button" id="wnOk">${L('Играть', 'Play')}</button></div>`;
  m.hidden = false; $('wnOk').onclick = () => { m.hidden = true; };
}

// ---------- напоминание в Telegram (только по желанию игрока) ----------
// В Mini App — включить/выключить одной кнопкой; в браузере — открыть игру в боте, там включить
const tgFn = () => (window.SUPABASE_CONFIG?.url || '').replace(/\/+$/, '') + '/functions/v1/tg-subscribe';
// Кто в Telegram: в Mini App — подпись initData; на сайте — сессия аккаунта, к которому привязан Telegram
const tgWho = async () => TG ? { initData: TG.initData } : { access_token: await board.accessToken() };
const tgOnSite = () => !TG && typeof registered === 'function' && registered() && hasTg();
async function tgCall(enable) {
  const r = await fetch(tgFn(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG?.anonKey || '' },
    body: JSON.stringify({ ...(await tgWho()), player_id: prefs.playerId, lang: LANG, enable }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error === 'not_configured' ? L('Напоминания ещё настраиваются — загляните завтра', 'Reminders are still being set up — check back tomorrow') : L('Не получилось, попробуйте позже', 'Didn’t work — try again later'));
  return j.enabled;
}
async function tgButton() {
  const b = $('tgRemind'); if (!b) return;
  if (window.VDP_PLATFORM || !board.online) { b.hidden = true; return; }
  const label = on => on ? L('🔕 Выключить напоминания в Telegram', '🔕 Turn off Telegram reminders') : L('🔔 Напоминать в Telegram о неделе дня', '🔔 Daily reminder in Telegram');
  if (!TG && !tgOnSite()) {
    b.textContent = label(false);
    b.onclick = () => { toast(L('Откроем игру в Telegram — там нажмите эту же кнопку', 'We’ll open the game in Telegram — tap this same button there')); setTimeout(() => location.href = 'https://t.me/Survivefridaybot?startapp=remind', 900); };
    return;
  }
  let on = prefs.tgRemind || false;
  b.textContent = label(on);
  tgCall(undefined).then(v => { on = v; prefs.tgRemind = v; store.set(KEY.prefs, prefs); b.textContent = label(on); }).catch(() => {});
  b.onclick = async () => {
    try { on = await tgCall(!on); prefs.tgRemind = on; store.set(KEY.prefs, prefs); b.textContent = label(on);
      toast(on ? L('Готово: раз в день в 12:30 бот напомнит о неделе дня', 'Done: the bot will remind you about the Daily Week once a day at 12:30') : L('Напоминания выключены', 'Reminders off')); }
    catch (err) { toast(err.message); }
  };
}

// ---------- группа игры в Telegram: +10 у.е. за вступление (один раз) ----------
// Бот проверяет, что игрок действительно в группе (getChatMember), — поэтому награда выдаётся только в игре внутри Telegram
const GROUP_REWARD = 10;
function addCash(n) {  // на счёт карьеры; нет карьеры — деньги дождутся её
  const C2 = careerNow();
  if (C2) { C2.bank = (C2.bank || 0) + n; careerSave(C2); }
  else prefs.pendingCash = (prefs.pendingCash || 0) + n;
  store.set(KEY.prefs, prefs);
  return !!C2;
}
async function tgGroup() {
  const b = $('tgGroup'); if (!b) return;
  if (prefs.pendingCash && careerNow()) { const n = prefs.pendingCash; prefs.pendingCash = 0; addCash(n); }
  if (window.VDP_PLATFORM || !board.online) return;
  const r = await fetch(tgFn(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG?.anonKey || '' },
    body: JSON.stringify({ action: 'group_link' }) }).then(r => r.json()).catch(() => ({}));
  const link = r.link; if (!link) return;
  const label = () => b.innerHTML = prefs.groupClaimed ? L('👥 Группа игры в Telegram', '👥 Game group on Telegram')
    : L(`👥 Вступить в группу игры в Telegram <b>+${money(GROUP_REWARD)}</b>`, `👥 Join the game’s Telegram group <b>+${money(GROUP_REWARD)}</b>`);
  label(); b.hidden = false;
  const mirror = () => { const c = $('psGroup'); if (c) { c.hidden = b.hidden; c.innerHTML = b.innerHTML; } };  // копия в «Моём профиле»
  mirror();
  const go = () => TG ? TG.openTelegramLink(link) : window.open(link, '_blank', 'noopener');
  const claim = async (done) => {
    const res = await fetch(tgFn(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG?.anonKey || '' },
      body: JSON.stringify({ action: 'group_claim', ...(await tgWho()), player_id: prefs.playerId }) });
    const j = await res.json().catch(() => ({}));
    if (j.ok) {
      prefs.groupClaimed = true; const now = addCash(GROUP_REWARD); label(); mirror(); $('modal').hidden = true;
      sfx.coins?.(); toast(L(`🎉 Спасибо, что с нами! +${money(GROUP_REWARD)}${now ? '' : ' — придут, когда устроитесь на работу'}`, `🎉 Thanks for joining! +${money(GROUP_REWARD)}${now ? '' : ' — paid once you get a job'}`));
      if (done) setTimeout(done, 900);
    } else if (j.error === 'claimed') { prefs.groupClaimed = true; store.set(KEY.prefs, prefs); label(); $('modal').hidden = true; toast(L('Награда за группу уже получена', 'You’ve already got the group reward')); done?.(); }
    else if (j.error === 'no_telegram' || j.error === 'bad_session') { if (done) toast(L('Награду можно забрать в «Моём профиле» после входа через Telegram', 'Claim it in “My profile” after signing in with Telegram')); else tgLogin('group'); }
    else if (j.error === 'not_member') toast(L('Пока не видим вас в группе. Вступите и нажмите ещё раз', 'We don’t see you in the group yet. Join and tap again'));
    else toast(L('Не получилось, попробуйте позже', 'Didn’t work — try again later'));
  };
  // fired — то же окно перед экраном увольнения (done — показать увольнение дальше)
  const open = (o = {}) => {
    if (prefs.groupClaimed) return go();
    const fired = !!o.done, can = TG || tgOnSite(), site = !TG && board.online && !window.VDP_PLATFORM && !fired;  // перед увольнением — без перехода на вход: неделя не дорисована
    const m = $('modal');
    m.innerHTML = `<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="tgGrTitle"><span class="lvl-ico" aria-hidden="true">${fired ? '📦' : '👥'}</span>
      <h2 id="tgGrTitle">${fired ? L('Кажется, вас увольняют…', 'Looks like you’re getting fired…') : L('Группа игры в Telegram', 'The game’s Telegram group')}</h2>
      <p>${fired ? L(`Пока собираете коробку с вещами — вступите в группу игры в Telegram: там напоминания о неделе дня и итоги дня. За вступление — <b>+${money(GROUP_REWARD)}</b> на счёт, один раз.`,
          `While you pack your box — join the game’s Telegram group for Daily Week reminders and results. Joining gets you <b>+${money(GROUP_REWARD)}</b>, once.`)
        : L(`Каждый день — напоминание о неделе дня и кто вчера продержался лучше всех. За вступление — <b>+${money(GROUP_REWARD)}</b>, один раз.`,
        `A daily Daily Week reminder and who lasted longest yesterday. Join and get <b>+${money(GROUP_REWARD)}</b>, once.`)}</p>
      <button class="btn-main" type="button" id="tgGrGo">${L('1. Вступить в группу', '1. Join the group')}</button>
      <button class="${can || site ? 'btn-main btn-tg' : 'btn-ghost'}" type="button" id="tgGrClaim">${can ? L(`2. Я вступил — получить ${money(GROUP_REWARD)}`, `2. I’ve joined — get ${money(GROUP_REWARD)}`) : site ? L(`2. Войти через Telegram и получить ${money(GROUP_REWARD)}`, `2. Sign in with Telegram and get ${money(GROUP_REWARD)}`) : L('2. Получить награду в Telegram', '2. Get the reward in Telegram')}</button>
      ${can ? '' : `<p style="opacity:.7;font-size:13px">${fired ? L('Награду выдаёт бот после проверки, что вы в группе: заберите её потом в «Моём профиле».', 'The bot pays out after checking you’re in the group: claim it later in “My profile”.') : L('Награду выдаёт бот: он проверяет, что вы в группе, — для этого нужен вход через Telegram.', 'The bot checks that you’re in the group — that needs a Telegram sign-in.')}</p>`}
      <button class="btn-ghost" type="button" id="tgGrClose">${fired ? L('Продолжить', 'Continue') : L('Закрыть', 'Close')}</button></div>`;
    m.hidden = false;
    $('tgGrGo').onclick = go;
    if (fired && !can) $('tgGrClaim').hidden = true;
    $('tgGrClaim').onclick = () => can ? claim(o.done) : site ? tgLogin('group') : (location.href = 'https://t.me/Survivefridaybot?startapp=group');
    $('tgGrClose').onclick = () => { m.hidden = true; o.done?.(); };
  };
  // Перед экраном увольнения: кто ещё не в группе — предложить вступить (не чаще раза в день). false — окна не будет
  window.groupOffer = done => {
    const day = new Date().toDateString();
    if (prefs.groupClaimed || prefs.groupOfferDay === day) return false;
    prefs.groupOfferDay = day; store.set(KEY.prefs, prefs);
    open({ done }); return true;
  };
  b.onclick = open;
  let after = ''; try { after = sessionStorage.getItem('vdp-after') || ''; sessionStorage.removeItem('vdp-after'); } catch {}
  if ((after === 'group' || TG && /(^|_)group\b/.test(TG.initDataUnsafe?.start_param || '')) && !prefs.groupClaimed) setTimeout(open, 1200);
}

// ---------- бонус за игру по ссылке из рассылки бота (пн, ср, пт): +15 у.е. ----------
// Ссылка t.me/Survivefridaybot?startapp=bonus-ГГГГММДД или survivefriday.com/?bonus=ГГГГММДД — действует в день рассылки и на следующий, один раз
const LINK_BONUS = 15;
(() => {
  const q = new URLSearchParams(location.search), b = q.get('bonus');
  if (!b) return;
  if (/^\d{8}$/.test(b)) { prefs.pendingBonus = b; store.set(KEY.prefs, prefs); }
  q.delete('bonus'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
})();
function linkBonus() {
  const code = prefs.pendingBonus; if (!code) return;
  delete prefs.pendingBonus; store.set(KEY.prefs, prefs);
  const mskDay = d => new Date(Date.now() + 3 * 3600e3 - d * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
  if (code !== mskDay(0) && code !== mskDay(1)) return toast(L('Срок этой ссылки с бонусом уже прошёл — ждите следующую рассылку', 'This bonus link has expired — watch for the next one'));
  if ((prefs.bonusGot || []).includes(code)) return toast(L('Бонус по этой ссылке уже получен', 'You’ve already claimed this bonus'));
  prefs.bonusGot = [...(prefs.bonusGot || []).slice(-9), code];
  const now = addCash(LINK_BONUS); sfx.coins?.();
  toast(L(`🎁 +${money(LINK_BONUS)} за игру по ссылке из Telegram${now ? '' : ' — придут, когда устроитесь на работу'}`, `🎁 +${money(LINK_BONUS)} for playing from the Telegram link${now ? '' : ' — paid once you get a job'}`));
}

// старт: после загрузки данных
dataReady.then(() => eventsReady).then(() => {
  todayQuests(); missYou(); syncDesk(); tgButton(); tgGroup(); setTimeout(linkBonus, 1500);
  if (!views.menu.hidden) { renderMeta(); setTimeout(whatsNew, 800); }
  setTimeout(rivals, 4000);
});
