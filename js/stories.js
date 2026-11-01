// Сюжеты с продолжением: одна история за раз, по эпизоду в неделю карьеры («📖 Продолжение следует»).
// «Выжить до пятницы». Данные — data/stories.json (грузит dataReady в js/engine.js в STORIES), строки — пары [ru, en].
// Эпизод — особая карточка в среду днём; ответ ставит флаг (flag), флаг прошлого эпизода выбирает вариант следующего (if),
// а число одинаковых флагов к финалу — концовку (if + min; последняя концовка — без условия). Награда: у.е., настроение героя,
// значок (prefs.storyBadges — навсегда) и бесплатные подсказки (prefs.freeHints).
// Состояние — в карьере: C.story = { id, ep, flags, done, after }; ep — сколько эпизодов пройдено; after — неделя финала прошлой истории.
// Только карьера: в неделе дня, турнире и пакетах сюжетов нет. Подключается после js/game.js (нужны C, S, bus, byId, pay).

const STO_FIRST_WEEK = 2;  // первая история — со 2-й недели карьеры, чтобы новички сразу получили крючок
const STO_SLOTS = [12, 13, 11, 14, 10, 16, 8, 17, 7, 18, 6];  // среда днём, рядом — если слот занят карточкой по расписанию
const stoT = x => Array.isArray(x) ? (EN ? x[1] : x[0]) : x || '';
const stoById = id => STORIES.find(s => s.id === id) || null;
const stoQ = t => L(`«${t}»`, `“${t}”`);
const stoCardId = (sid, ep, v) => `sto_${sid}_${ep}_${v}`;

// Карточки всех вариантов эпизодов — в byId (так сохранённая неделя с эпизодом продолжается после перезагрузки)
function stoRegister() {
  for (const s of STORIES) s.eps.forEach((ep, e) => ep.forEach((v, i) => {
    const ans = side => ({ label: stoT(v[side].label), flag: v[side].flag,
      effects: Object.fromEntries(['psyche', 'energy', 'boss', 'colleagues'].map((k, j) => [k, v[side].fx[j] || 0])) });
    byId[stoCardId(s.id, e + 1, i)] = { id: stoCardId(s.id, e + 1, i), who: stoT(v.who), text: stoT(v.text), story: s.id, ep: e + 1, eps: s.eps.length,
      answers: { left: ans('left'), right: ans('right') } };
  }));
}
window.stoRegister = stoRegister;
if (STORIES.length) stoRegister();

// Вариант эпизода e (0…) по флагу прошлого эпизода
const stoVariant = (s, e, flags) => { const ep = s.eps[e]; if (!ep) return -1; const i = ep.findIndex(v => v.if && v.if === flags[e - 1]); return i >= 0 ? i : Math.max(0, ep.findIndex(v => !v.if)); };
const stoEnding = (s, flags) => s.endings.find(x => !x.if || flags.filter(f => f === x.if).length >= (x.min || 1)) || s.endings[s.endings.length - 1];
// Следующая история: первая не пройденная; когда пройдены все — по кругу
const stoNext = st => STORIES.find(s => !st.done.includes(s.id)) || STORIES[st.done.length % STORIES.length] || null;

// Состояние сюжета в карьере; startNow — начать следующую историю, если пора
function stoState(c = C, startNow = false) {
  if (!c || !STORIES.length) return null;
  const st = c.story ||= { id: null, ep: 0, flags: [], done: [], after: 0 };
  st.done ||= []; st.flags ||= [];
  if (st.id && !stoById(st.id)) st.id = null;  // история пропала из данных — начнём следующую
  if (!st.id && startNow && c.week >= STO_FIRST_WEEK && c.week > (st.after || 0)) {
    const s = stoNext(st); if (s) Object.assign(st, { id: s.id, ep: 0, flags: [] });
  }
  return st;
}

// Неделя собрана — эпизод в среду днём (поверх обычной карточки; карточки по расписанию не трогаем)
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || !C) return;
  const st = stoState(C, true); if (!st?.id) return;
  const s = stoById(st.id), v = stoVariant(s, st.ep, st.flags); if (v < 0) return;
  const at = STO_SLOTS.find(i => S2.deck[i] && !S2.deck[i].fixed && !S2.deck[i].origin); if (at == null) return;
  S2.deck[at] = { id: stoCardId(s.id, st.ep + 1, v), time: slotTime(at), fixed: true, story: true };
  saveCareer();
});

// Ответ на эпизод: флаг, следующий эпизод; после последнего — концовка и награда (сразу, чтобы не потерялась при увольнении)
bus.on('answer', ({ card, side }) => {
  if (!card?.story || S?.mode !== 'career' || !C) return;
  const st = stoState(C), s = stoById(card.story);
  if (!st || !s || st.id !== s.id || st.ep !== card.ep - 1) return;  // уже засчитан (повтор) или чужая история
  const flag = card.answers[side].flag;
  st.flags.push(flag); st.ep = card.ep;
  S.storyNow = { id: s.id, ep: card.ep };
  track('story_ep', { mode: 'career', card: card.id, step: S.step, detail: `${s.id}:${card.ep}:${flag}` });
  if (st.ep >= s.eps.length) {
    const end = stoEnding(s, st.flags);
    stoReward(end.reward || {});
    st.done.push(s.id); st.last = { id: s.id, ending: end.id }; st.id = null; st.ep = 0; st.flags = []; st.after = C.week;
    S.storyEnd = { id: s.id, ending: end.id };
    track('story_end', { mode: 'career', detail: `${s.id}:${end.id}` });
    setTimeout(() => toast(L('📖 Финал истории! Чем всё кончилось — в конце недели', '📖 Story finale! See how it ends at the end of the week')), 700);
  } else setTimeout(() => toast(L('📖 Продолжение следует — на следующей неделе', '📖 To be continued — next week')), 700);
  saveCareer();
});

function stoReward(r) {
  if (r.bank) pay(r.bank);
  if (r.mood && C.hero) C.hero.mood = Math.min(100, (C.hero.mood ?? 70) + r.mood);
  if (r.hint) prefs.freeHints = (prefs.freeHints || 0) + r.hint;
  if (r.badge && !(prefs.storyBadges ||= []).some(b => b.ico === r.badge.ico)) prefs.storyBadges.push({ ico: r.badge.ico, name: r.badge.name });
  store.set(KEY.prefs, prefs); saveCareer();
}
const stoRewardHtml = r => [
  r.bank ? `<span>💰 +${money(r.bank)}</span>` : '',
  r.mood ? `<span>😊 ${L('настроение героя', 'hero mood')} +${r.mood}</span>` : '',
  r.hint ? `<span>💡 ${L(`+${r.hint} ${r.hint > 1 ? 'подсказки' : 'подсказка'}`, `+${r.hint} free ${r.hint > 1 ? 'hints' : 'hint'}`)}</span>` : '',
  r.badge ? `<span class="sto-badge">${r.badge.ico} ${L('значок', 'badge')} ${stoQ(esc(stoT(r.badge.name)))}</span>` : ''].join('');

// Строка про сюжет: что будет дальше (для экрана итогов и меню)
function stoTeaser(c) {
  const st = stoState(c); if (!st) return null;
  if (st.id) { const s = stoById(st.id), v = stoVariant(s, st.ep, st.flags); return { s, ep: st.ep + 1, hook: stoT(s.eps[st.ep][v].hook) }; }
  const s = stoNext(st); return s ? { s, ep: 0, hook: stoT(s.teaser), fresh: true } : null;
}

// Бейдж на карточке эпизода (renderCard в js/game.js)
const stoTag = c => `<span class="rnd-tag sto-tag" title="${esc(stoT(stoById(c.story)?.title))}">📖 ${L('Сюжет', 'Story')} · ${L('эпизод', 'episode')} ${c.ep}/${c.eps}</span>`;

// Конец недели: «Продолжение следует» и финал истории
bus.on('weekEnd', x => {
  if (x.mode !== 'career' || !C || !S) return;
  const sheet = views.end.querySelector('.end-sheet'), stack = sheet?.querySelector('.stack'); if (!stack) return;
  const end = S.storyEnd, t = stoTeaser(C); let html = '';
  if (end) {
    const s = stoById(end.id), e = s?.endings.find(z => z.id === end.ending);
    if (s && e) html = `<button type="button" class="sto-teaser sto-done" id="stoFinBtn"><i class="sto-ico">${s.icon}</i><span><b>${L('Финал истории', 'Story finale')} ${stoQ(esc(stoT(s.title)))}</b>${esc(stoT(e.title))} · ${L('награда', 'reward')} →</span></button>`;
    if (s && e) setTimeout(() => { if ($('modal').hidden && !views.end.hidden) stoFinale(s, e); }, 1300);
  } else if (t && !t.fresh) html = `<div class="sto-teaser"><i class="sto-ico">${t.s.icon}</i><span><b>📖 ${S.storyNow ? L('Продолжение следует', 'To be continued') : L('Сюжет ждёт вас', 'Your story awaits')}:</b> ${esc(t.hook)}…<small>${stoQ(esc(stoT(t.s.title)))} · ${L('эпизод', 'episode')} ${t.ep}/${t.s.eps.length} — ${L('на следующей неделе', 'next week')}</small></span></div>`;
  if (t?.fresh && (end || C.week >= STO_FIRST_WEEK)) html += `<div class="sto-teaser sto-new"><i class="sto-ico">${t.s.icon}</i><span><b>📖 ${L('На следующей неделе — новая история', 'Next week — a new story')}:</b> ${stoQ(esc(stoT(t.s.title)))}. ${esc(t.hook)}…</span></div>`;
  if (!html) return;
  stack.insertAdjacentHTML('beforebegin', html);
  if ($('stoFinBtn')) $('stoFinBtn').onclick = () => { const s = stoById(end.id); stoFinale(s, s.endings.find(z => z.id === end.ending)); };
});

function stoFinale(s, e) {
  const m = $('modal'), nx = stoTeaser(C);
  m.innerHTML = `<div class="modal-box glass sto-fin" role="dialog" aria-modal="true" aria-labelledby="stoFinT"><span class="lvl-ico" aria-hidden="true">${s.icon}</span>
    <span class="sto-kicker">📖 ${L('Финал истории', 'Story finale')} ${stoQ(esc(stoT(s.title)))}</span>
    <h2 id="stoFinT">${esc(stoT(e.title))}</h2><p>${esc(stoT(e.text))}</p>
    <div class="sto-rew">${stoRewardHtml(e.reward || {})}</div>
    <p class="sto-soon">${L('Следующая история скоро', 'Next story coming soon')}${nx?.fresh ? `: ${nx.s.icon} ${stoQ(esc(stoT(nx.s.title)))}` : ''}</p>
    <button class="btn-main" type="button" id="stoFinOk">${L('Здорово!', 'Awesome!')}</button></div>`;
  m.hidden = false; sfx.item?.();
  $('stoFinOk').onclick = () => { m.hidden = true; };
}

// Меню: «📖 Сюжет: <название>, эпизод 2/5» на карточке карьеры и значки из финалов
bus.on('menu', () => {
  const cc = $('careerCard'), Cm = store.get(KEY.career, null);
  if (!cc || cc.hidden || !Cm || !STORIES.length) return;
  const st = stoState(Cm), t = stoTeaser(Cm), badges = prefs.storyBadges || [];
  let html = '';
  if (t && st.id) html = `<div class="sto-chip"><i class="sto-ico">${t.s.icon}</i><span><b>📖 ${L('Сюжет', 'Story')}: ${stoQ(esc(stoT(t.s.title)))}, ${L('эпизод', 'episode')} ${t.ep}/${t.s.eps.length}</b><small>${esc(t.hook)}…</small></span></div>`;
  else if (t) html = `<div class="sto-chip sto-wait"><i class="sto-ico">${t.s.icon}</i><span><b>📖 ${L('Скоро новая история', 'New story coming')}: ${stoQ(esc(stoT(t.s.title)))}</b><small>${Cm.week < STO_FIRST_WEEK ? L(`начнётся на ${STO_FIRST_WEEK}-й неделе`, `starts in week ${STO_FIRST_WEEK}`) : Cm.week > (st.after || 0) ? L('начнётся на этой неделе', 'starts this week') : L('начнётся на следующей неделе', 'starts next week')}</small></span></div>`;
  if (badges.length) html += `<div class="sto-badges" title="${L('Значки из финалов историй', 'Badges from story finales')}">${badges.map(b => `<span title="${esc(stoT(b.name))}">${b.ico}</span>`).join('')}<small>${L('историй пройдено', 'stories finished')}: ${st?.done?.length || 0}/${STORIES.length}</small></div>`;
  const bar = cc.querySelector('.cc-bar');  // сразу под полосой недель — на виду
  if (html) bar ? bar.insertAdjacentHTML('afterend', html) : cc.insertAdjacentHTML('beforeend', html);
});
