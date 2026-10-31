// Соцслой: «Лента» офиса (события живых игроков), реакции и подарки за у.е., блок «Офис сейчас» в меню,
// строка «Пока вы работали» на экране итогов, быстрые ответы в чате, полка «Подарки» и «Не показывать меня в ленте» в профиле.
// Сервер: supabase/update-2026-11-01-social.sql (feed_latest, react, reactions_for, send_gift, claim_gifts, gifts_received, set_feed_off).
// Персонажи игры (js/npc.js) иногда появляются в ленте со своими событиями — только в браузере, всегда с пометкой
// «🤖 персонаж игры», не больше 30% показанного и ни одного, если живых записей 10 и больше.
// Подключается после npc.js; RANKS, careerNow и др. из следующих файлов используются только при вызове.

const SOC_GIFTS = [
  { id: 'coffee', ico: '☕', price: 1, t: L('Кофе', 'Coffee') },
  { id: 'donut', ico: '🍩', price: 2, t: L('Пончик', 'Donut') },
  { id: 'rose', ico: '🌹', price: 3, t: L('Роза', 'Rose') },
  { id: 'champagne', ico: '🍾', price: 5, t: L('Шампанское', 'Champagne') },
  { id: 'trophy', ico: '🏆', price: 10, t: L('Кубок', 'Trophy') },
  { id: 'diamond', ico: '💎', price: 25, t: L('Бриллиант', 'Diamond') },
];
const SOC_RX = ['👍', '😂', '😢', '🔥'];
const SOC_MOOD = 5;  // настроение героя получателя за подарок
const socGift = id => SOC_GIFTS.find(g => g.id === id);
const socOn = () => board.online && !!prefs.name;

// ---------- тексты ленты ----------
const SOC_DAY_IN = EN ? ['on Monday', 'on Tuesday', 'on Wednesday', 'on Thursday', 'on Friday'] : ['в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу'];
const SOC_PET_ICO = { cat: '🐱', dog: '🐶', parrot: '🦜', fish: '🐠' };
const socT = (x, arg) => typeof x === 'function' ? x(arg) : x;
const socCompany = id => { const v = typeof VACANCIES !== 'undefined' && VACANCIES.find(v => v.id === id); return v ? v.name.replace(/[«»"“”]/g, '') : ''; };
// Что купили: «hobby:moto:70», «need:car:60», «pet:p_house:45», «kid:k_bike:10»
function socItemOf(detail) {
  const parts = String(detail || '').split(':'), cat = parts[0], id = (parts[1] || '').split('+')[0];
  let x = null;
  try {
    if (cat === 'need') x = NEEDS.find(n => n.id === id);
    else if (cat === 'pet') x = PET_GOODS.find(n => n.id === id);
    else if (cat === 'kid') x = KID_GOODS.find(n => n.id === id);
    else x = goodsCat(cat)?.items.find(n => n.id === id);
  } catch {}
  return x ? { ico: x.ico, t: socT(x.t, null) } : null;
}
// Текст записи без имени: имя ставится в начало жирным. Формулировки без рода: «Вика — увольнение в среду»
function socText(it) {
  const d = String(it.detail || ''), day = SOC_DAY_IN[Math.min(4, Math.floor((it.step || 0) / 5))] || '';
  switch (it.kind) {
    case 'fired': {
      const co = socCompany(d);
      return { ico: '📦', t: L(`— увольнение${co ? ` из «${co}»` : ''} ${day}`, `got fired${co ? ` from ${co}` : ''} ${day}`) };
    }
    case 'week_end':
      if (!it.won) return { ico: '📦', t: L(`— увольнение ${day}`, `got fired ${day}`) };
      return it.mode === 'daily' ? { ico: '📅', t: L('— неделя дня пройдена до пятницы', 'beat the Daily Week') }
        : { ico: '🎉', t: L('— неделя закрыта: пятница, 18:00', 'survived the week — Friday, 6 PM') };
    case 'rank_up': {
      const i = +d, r = typeof RANKS !== 'undefined' && RANKS[i];
      return { ico: r && i === RANKS.length - 1 ? '👑' : '🎖️', t: r ? L(`— повышение: теперь «${r.name}»`, `got promoted to ${r.name}`) : L('— повышение', 'got promoted') };
    }
    case 'new_record': return { ico: '🏅', t: L(`— новый личный рекорд: ${+d}/400`, `set a personal best: ${+d}/400`) };
    case 'hero_buy': { const x = socItemOf(d); return { ico: x?.ico || '🛍️', t: x ? L(`— крупная покупка: ${x.t}`, `made a big purchase: ${x.t}`) : L('— крупная покупка', 'made a big purchase') }; }
    case 'pet_adopt': {
      const b = typeof PET_BREEDS !== 'undefined' && PET_BREEDS.find(b => b.id === d);
      return { ico: (b && SOC_PET_ICO[b.kind]) || '🐾', t: b ? L(`— пополнение в семье: ${b.t}`, `adopted a pet: ${b.t}`) : L('— пополнение в семье', 'adopted a pet') };
    }
    case 'cert_end': return { ico: '🎓', t: L('— аттестация сдана, оклад вырос', 'passed the exam and got a raise') };
    case 'streak_claim': { const n = +d.split(':')[0] || 7; return { ico: '🔥', t: L(`— серия ${pl(n, 'день', 'дня', 'дней')} подряд`, `is on a ${n}-day streak`) }; }
    case 'break_record': {
      const [n, score] = d.split(':'), b = typeof BREAKS !== 'undefined' && BREAKS.find(b => b[0] === +n);
      return { ico: b ? b[2] : '🕹️', t: b ? L(`— рекорд в мини-игре «${b[3]}»: ${score}`, `set a record in “${b[3]}”: ${score}`) : L(`— рекорд в мини-игре: ${score}`, `set a mini-game record: ${score}`) };
    }
  }
  return { ico: '📰', t: '' };
}

// ---------- персонажи игры в ленте ----------
const SOC_NPC_EVENTS = {
  'NPC-VIKA': [['😂', L('— мем про планёрку разошёлся по всем отделам', 'made a meme about the stand-up that went viral')], ['🎉', L('— неделя закрыта, не открыв ни одного письма', 'survived the week without opening a single email')]],
  'NPC-ARTEM': [['🚀', L('— задеплоил в пятницу. Прод пока жив', 'deployed on a Friday. Prod is still alive')], ['🐛', L('— починил один баг, появилось два новых', 'fixed one bug, two new ones appeared')]],
  'NPC-NINA': [['📋', L('— опрос вовлечённости: вовлечённость 3 из 10', 'ran an engagement survey: engagement 3 out of 10')], ['🎖️', L('— повышение: теперь «Главная по тимбилдингам»', 'got promoted to Chief Team-Building Officer')]],
  'NPC-GOSHA': [['💧', L('— сменил бутыль в кулере, не пролив ни капли', 'changed the cooler jug without spilling a drop')], ['🏅', L('— новый рекорд: 14 сплетен за один обед', 'set a record: 14 rumors in one lunch break')]],
  'NPC-LEVA': [['🤝', L('— закрыл сделку века. Клиент сказал «подумаем»', 'closed the deal of the century. The client said “we’ll think about it”')], ['🚗', L('— крупная покупка: машина в кредит на семь лет', 'made a big purchase: a car on a seven-year loan')]],
  'NPC-SONYA': [['🎨', L('— сделала логотип побольше. Все довольны', 'made the logo bigger. Everyone’s happy')], ['🐱', L('— пополнение в семье: кот из приюта', 'adopted a shelter cat')]],
  'NPC-STAS': [['🎒', L('— стажировку продлили в пятый раз', 'got the internship extended for the fifth time')], ['🖨️', L('— нашёл принтер. Искал с понедельника', 'found the printer. Been looking since Monday')]],
  'NPC-ZINA': [['🧾', L('— квартал сошёлся до копейки', 'closed the quarter to the cent')], ['🖊️', L('— вернула свою ручку. Счастье', 'got her pen back. Pure joy')]],
};
// 0–3 события персонажей за последние часы; состав меняется раз в 2 часа
function socNpcItems(n) {
  if (n <= 0 || typeof NPCS === 'undefined') return [];
  const slot = Math.floor(Date.now() / 72e5), rnd = seeded('soc-npc-' + slot);
  return shuffle(NPCS, rnd).slice(0, n).map((c, i) => {
    const evs = SOC_NPC_EVENTS[c.id] || [['☕', L('— на кофе-брейке', 'is on a coffee break')]], [ico, t] = evs[Math.floor(rnd() * evs.length)];
    return { npc: true, item_id: `npc-${slot}-${i}`, npc_id: c.id, name: c.name, avatar: c.avatar, ico, t, created_at: new Date(slot * 72e5 - (i * 37 + 11) * 60e3 * rnd() - 5 * 60e3).toISOString() };
  });
}
// Живые записи + персонажи: не больше 30% показанного, ни одного при 10+ живых
function socMix(real) {
  const n = real.length >= 10 ? 0 : Math.min(3, Math.floor(real.length * 3 / 7));
  return [...real, ...socNpcItems(n)].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ---------- данные ----------
let socFeedCache = { at: 0, rows: [] };
async function socFeed(force) {
  if (!socOn()) return [];
  if (!force && Date.now() - socFeedCache.at < 25000) return socFeedCache.rows;
  const rows = (await board.rpc('feed_latest', { p_id: prefs.playerId, p_limit: 30, p_before: null })) || [];
  socFeedCache = { at: Date.now(), rows };
  return rows;
}
const socNpcRx = () => store.get('vdp-soc-npc-rx', {});

// ---------- реакции и подарки на записи ----------
// Плашка под записью: 👍 😂 😢 🔥 и 🎁. own — своя запись (подарить себе нельзя), npc — персонаж (только реакции, в браузере)
function socBar(kind, id, o = {}) {
  const counts = o.counts || {}, mine = o.mine || '';
  return `<div class="soc-bar" data-k="${kind}" data-id="${esc(String(id))}" data-to="${esc(o.to || '')}" data-name="${esc(o.name || '')}"${o.npc ? ' data-npc="1"' : ''}>`
    + SOC_RX.map(e => `<button type="button" class="soc-rx${mine === e ? ' on' : ''}" data-rx="${e}" aria-pressed="${mine === e}" aria-label="${L('Реакция', 'React')} ${e}">${e}<b>${counts[e] || ''}</b></button>`).join('')
    + (o.own || o.npc ? (counts['🎁'] ? `<span class="soc-gifts-n">🎁<b>${counts['🎁']}</b></span>` : '')
      : `<button type="button" class="soc-gift-btn" data-gift="1" aria-label="${L('Подарить', 'Send a gift')}">🎁<span>${L('Подарить', 'Gift')}</span><b>${counts['🎁'] || ''}</b></button>`)
    + '</div>';
}
// Пустая плашка в чате и личке: заполняется socDecorate одним запросом на весь список
const socSlot = (kind, id, to, name, own) => `<div class="soc-bar soc-slot" data-k="${kind}" data-id="${id}" data-to="${esc(to || '')}" data-name="${esc(name || '')}"${own ? ' data-own="1"' : ''}></div>`;
const socSeenMax = {};
async function socDecorate(list, kind) {
  if (!list) return;
  const slots = [...list.querySelectorAll('.soc-slot')], ids = slots.map(s => +s.dataset.id).filter(Boolean);
  // новые сообщения появляются с анимацией (кроме первой загрузки)
  const key = kind + (kind === 'msg' ? chatChannel : dmOpen), top = Math.max(0, ...ids);
  if (socSeenMax[key] != null) slots.forEach(s => { if (+s.dataset.id > socSeenMax[key]) s.closest('.msg')?.classList.add('soc-new'); });
  socSeenMax[key] = Math.max(socSeenMax[key] || 0, top);
  const fill = rows => slots.forEach(s => {
    const id = +s.dataset.id, my = rows.filter(r => +r.item_id === id), counts = {};
    for (const r of my) counts[r.emoji] = r.n;
    s.outerHTML = socBar(kind, id, { counts, mine: my.find(r => r.mine && r.emoji !== '🎁')?.emoji, to: s.dataset.to, name: s.dataset.name, own: !!s.dataset.own });
  });
  if (!ids.length) return;
  let rows = [];
  try { rows = (await board.rpc('reactions_for', { p_id: prefs.playerId, p_kind: kind, p_ids: ids })) || []; } catch {}
  if (list.isConnected) fill(rows);
}
const socNeedAcct = () => {
  if (!board.online) return toast(L('Нужна связь с сервером', 'Needs a connection to the server')), true;
  if (registered()) return false;
  toast(L('Реакции и подарки — для зарегистрированных игроков', 'Reactions and gifts are for registered players'));
  if (views.game.hidden) { $('modal').hidden = true; renderJoin('register', L('Зарегистрируйтесь — и сможете ставить реакции и дарить подарки коллегам.', 'Sign up to react and send gifts to your coworkers.')); }
  return true;
};
async function socReact(bar, btn) {
  const e = btn.dataset.rx, kind = bar.dataset.k, id = bar.dataset.id, was = bar.querySelector('.soc-rx.on')?.dataset.rx || '';
  const setUi = now => bar.querySelectorAll('.soc-rx').forEach(b => {
    const on = b.dataset.rx === now, n = +(b.querySelector('b').textContent || 0) + (on && b.dataset.rx !== was ? 1 : 0) - (!on && b.dataset.rx === was ? 1 : 0);
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.querySelector('b').textContent = n > 0 ? n : '';
  });
  const now = was === e ? '' : e;
  if (bar.dataset.npc) {  // персонаж игры: реакция хранится только здесь
    const all = socNpcRx(); if (now) all[id] = now; else delete all[id]; store.set('vdp-soc-npc-rx', Object.fromEntries(Object.entries(all).slice(-60)));
    setUi(now); if (now) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    return;
  }
  if (socNeedAcct()) return;
  setUi(now); if (now) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); sfx.item?.(); }
  try {
    await board.rpc('react', { p_id: prefs.playerId, p_kind: kind, p_item: +id, p_emoji: e });
    track('react', { detail: `${kind}:${now || '-'}` });
    if (kind === 'feed') socFeedCache.at = 0;
  } catch (err) { setUi(was); toast(err.message); }
}
document.addEventListener('click', e => {
  const bar = e.target.closest('.soc-bar'); if (!bar || bar.classList.contains('soc-slot')) return;
  const rx = e.target.closest('[data-rx]'), gift = e.target.closest('[data-gift]');
  if (rx) { e.preventDefault(); socReact(bar, rx); }
  else if (gift) {
    e.preventDefault();
    if (socNeedAcct()) return;
    const kind = bar.dataset.k, back = kind === 'dm' && dmOpen ? (s => () => openDm(s, bar.dataset.name))(dmOpen) : null;
    socGiftPicker({ kind, id: +bar.dataset.id, to: bar.dataset.to, name: bar.dataset.name, bar, back });
  }
});

// ---------- окно подарка ----------
function socGiftPicker(o) {
  const m = $('modal'); let pick = o.pick || 'rose';
  const close = () => { m.hidden = true; o.back?.(); };
  const render = () => {
    const C2 = careerNow(), g = socGift(pick), bank = C2 ? Math.max(0, C2.bank || 0) : 0, short = C2 ? Math.max(0, g.price - bank) : 0;
    m.innerHTML = `<div class="modal-box glass soc-gift-box" role="dialog" aria-modal="true" aria-labelledby="sgTitle">
      <h2 id="sgTitle">🎁 ${L('Подарок', 'Gift')} <small>${L('кому', 'to')}: ${esc(o.name || L('игроку', 'a player'))}</small></h2>
      <p class="field-note">${L(`Подарок появится на полке в профиле получателя и поднимет настроение героя (+${SOC_MOOD}). У.е. списываются с вашего счёта карьеры.`, `The gift lands on their profile shelf and cheers up their character (+${SOC_MOOD} mood). Paid from your career bank.`)}</p>
      <div class="soc-gift-grid">${SOC_GIFTS.map(x => `<button type="button" class="soc-gift-opt${x.id === pick ? ' on' : ''}" data-g="${x.id}" aria-pressed="${x.id === pick}"><span class="soc-gi" aria-hidden="true">${x.ico}</span><b>${x.t}</b><small>${money(x.price)}</small></button>`).join('')}</div>
      <p class="shop-bal">${C2 ? L(`На счёте: <b>${money(C2.bank || 0)}</b>`, `Balance: <b>${money(C2.bank || 0)}</b>`) : L('Подарки покупаются за у.е. карьеры — начните карьеру, чтобы дарить.', 'Gifts are paid from your career bank — start a career to send them.')}</p>
      <button class="btn-main" type="button" id="sgGo"${C2 ? '' : ' disabled'}>${short ? `💰 ${L(`Не хватает ${money(short)} — пополнить`, `${money(short)} short — top up`)}` : `${L('Подарить', 'Send')} ${g.ico} ${L('за', 'for')} ${money(g.price)}`}</button>
      <button class="btn-ghost" type="button" id="sgClose">${L('Отмена', 'Cancel')}</button></div>`;
    m.hidden = false; m.onclick = e => { if (e.target === m) close(); };
    m.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { pick = b.dataset.g; render(); });
    $('sgClose').onclick = close;
    $('sgGo').onclick = async () => {
      const C3 = careerNow(); if (!C3) return;
      if ((C3.bank || 0) < g.price) {
        return openTopup({ need: g.price - Math.max(0, C3.bank || 0), why: L(`Подарок ${g.ico} (кому: ${esc(o.name || 'игроку')}) — ${money(g.price)}`, `Gift ${g.ico} for ${esc(o.name || 'a player')} — ${money(g.price)}`), then: () => socGiftPicker({ ...o, pick }) });
      }
      const btn = $('sgGo'); btn.disabled = true; btn.textContent = L('Дарю…', 'Sending…');
      try {
        await board.rpc('send_gift', { p_id: prefs.playerId, p_to: o.to || '', p_gift: g.id, p_ref_kind: o.kind || 'profile', p_ref_id: o.id || null });
        const C4 = careerNow(); C4.bank -= g.price; C4.spent = (C4.spent || 0) + g.price; careerSave(C4);
        if (typeof S !== 'undefined' && S?.mode === 'career' && !views.game.hidden) renderBars?.();
        sfx.coins?.(); socBurst(g.ico);
        track('gift_send', { detail: `${g.id}:${o.kind || 'profile'}` });
        toast(L(`${g.ico} Подарок отправлен: ${o.name || 'игроку'}`, `${g.ico} Gift sent to ${o.name || 'the player'}`));
        if (o.bar?.isConnected) { const b = o.bar.querySelector('[data-gift] b'); if (b) b.textContent = (+b.textContent || 0) + 1; }
        socFeedCache.at = 0;
        m.hidden = true;
        if (o.kind === 'msg' && typeof chatLast !== 'undefined') chatLast = '';  // подарок появится пузырём в чате
        o.back?.();
      } catch (err) { btn.disabled = false; render(); toast(err.message); }
    };
  };
  render();
}
// Большой эмодзи на весь экран — подарок отправлен или получен
function socBurst(ico) {
  const d = document.createElement('div'); d.className = 'soc-burst'; d.setAttribute('aria-hidden', 'true'); d.textContent = ico;
  document.body.appendChild(d); setTimeout(() => d.remove(), 1700);
}
const socGiftBubble = (from, to, gift) => { const g = socGift(gift) || { ico: '🎁' };
  return `<span class="bubble soc-gift-bubble"><span class="soc-gi" aria-hidden="true">${g.ico}</span><span>🎁 ${esc(from || '')} → ${esc(to || '')}: ${g.ico}</span></span>`; };

// ---------- полученные подарки ----------
// При запуске и раз в минуту: новые подарки → звонок «Лёва дарит вам 🌹», герою +5 к настроению
let socClaimAt = 0;
async function socClaimGifts() {
  if (!socOn() || (prefs.email && !prefs.session) || Date.now() - socClaimAt < 50000 || document.hidden) return;
  socClaimAt = Date.now();
  let rows = [];
  try { rows = (await board.rpc('claim_gifts', { p_id: prefs.playerId })) || []; } catch { return; }
  if (!rows.length) return;
  const C2 = careerNow(), h = C2?.hero;
  if (h) { h.mood = Math.min(100, (h.mood ?? 70) + SOC_MOOD * rows.length); careerSave(C2); }
  const sum = rows.map(r => socGift(r.gift_code)?.ico || '🎁').join(''), r0 = rows[0], g0 = socGift(r0.gift_code)?.ico || '🎁';
  socShelfCache = null;
  const text = rows.length === 1 ? L(`${r0.from_name} дарит вам ${g0}`, `${r0.from_name} sent you ${g0}`) : L(`Вам подарки: ${sum}`, `You got gifts: ${sum}`);
  ring(text + (h ? L(` · ${h.name}: настроение +${SOC_MOOD * rows.length}`, ` · ${h.name}: mood +${SOC_MOOD * rows.length}`) : ''), () => openProfile(), true);
  if (views.game.hidden) setTimeout(() => socBurst(g0), 300);
}
let socShelfCache = null;
async function socRenderProfile() {
  const box = $('socProfile'); if (!box) return;
  box.hidden = !prefs.name;
  box.innerHTML = `<b class="ps-cap">🎁 ${L('Подарки', 'Gifts')}</b>
    <div class="soc-shelf" id="socShelf">${socShelfHtml(socShelfCache)}</div>
    <label class="soc-toggle"><input type="checkbox" id="socFeedOff"${prefs.feedOff ? ' checked' : ''}> <span>${L('Не показывать меня в ленте', 'Hide me from the feed')}</span></label>`;
  $('socFeedOff').onchange = async e => {
    const off = e.target.checked; prefs.feedOff = off; store.set(KEY.prefs, prefs);
    try { if (board.online) await board.rpc('set_feed_off', { p_id: prefs.playerId, p_off: off }); toast(off ? L('Ваши события больше не попадут в ленту', 'Your events won’t show in the feed') : L('Вы снова в ленте офиса', 'You’re back in the office feed')); socFeedCache.at = 0; }
    catch (err) { toast(err.message); }
  };
  if (socOn() && !(prefs.email && !prefs.session)) {
    try { socShelfCache = (await board.rpc('gifts_received', { p_id: prefs.playerId })) || []; } catch {}
    const s = $('socShelf'); if (s) s.innerHTML = socShelfHtml(socShelfCache);
  }
}
function socShelfHtml(rows) {
  if (!rows) return `<small class="field-note">${board.online ? L('Загружаю…', 'Loading…') : L('Подарки видны, когда есть связь с сервером', 'Gifts show up when you’re online')}</small>`;
  if (!rows.length) return `<small class="field-note">${L('Пока пусто. Коллеги могут подарить вам ☕ или 🌹 из ленты, чата или переписки.', 'Empty for now. Coworkers can send you ☕ or 🌹 from the feed, chat or DMs.')}</small>`;
  const by = Object.fromEntries(rows.map(r => [r.gift_code, r]));
  return SOC_GIFTS.filter(g => by[g.id]).map(g => `<span class="soc-shelf-item" title="${esc(L(`последний — от ${by[g.id].last_from}`, `last from ${by[g.id].last_from}`))}"><span aria-hidden="true">${g.ico}</span><b>×${by[g.id].n}</b></span>`).join('');
}

// ---------- экран «Лента» ----------
let socFeedRows = [];
function socItemHtml(it, i = 0) {
  if (it.npc) {
    const mine = socNpcRx()[it.item_id] || '';
    return `<div class="soc-item soc-npc" style="--d:${i * 40}ms"><span class="soc-ava" aria-hidden="true">${esc(it.avatar)}</span>
      <div class="soc-body"><p><span class="soc-ico" aria-hidden="true">${it.ico}</span><b>${esc(it.name)}</b> ${esc(it.t)}</p>
      <small><span class="npc-tag">🤖 ${L('персонаж игры', 'game character')}</span> · ${ago(it.created_at)}</small>${socBar('feed', it.item_id, { npc: true, mine, counts: mine ? { [mine]: 1 } : {} })}</div></div>`;
  }
  const tx = socText(it), counts = { ...(it.reactions || {}) }; if (it.gifts) counts['🎁'] = it.gifts;
  return `<div class="soc-item${it.is_me ? ' me' : ''}" style="--d:${i * 40}ms"><span class="soc-ava" aria-hidden="true">${esc(it.avatar || '🙂')}</span>
    <div class="soc-body"><p><span class="soc-ico" aria-hidden="true">${tx.ico}</span><b>${esc(it.name)}</b> ${esc(tx.t)}</p>
    <small>${it.is_me ? L('это вы', 'that’s you') + ' · ' : ''}${ago(it.created_at)}</small>${socBar('feed', it.item_id, { counts, mine: it.my_react, to: it.short_id, name: it.name, own: it.is_me })}</div></div>`;
}
async function showFeed() {
  setPhase('evening'); clearInterval(chatTimer); chatChannel = 'feed';
  views.end.innerHTML = `<div class="chat soc-feed">
    <div class="board-head"><button class="back-btn" id="chBack" type="button">${L('← Назад', '← Back')}</button><h2>📰 ${L('Лента офиса', 'Office feed')}</h2><span class="back-sp"></span></div>
    <div class="tabs tabs4" role="tablist"><button class="tab" role="tab" aria-selected="true">${L('Лента', 'Feed')}</button><button class="tab" role="tab" id="chTeam" aria-selected="false">${L('Офис', 'Office')}</button><button class="tab" role="tab" id="chAll" aria-selected="false">${L('Все игроки', 'Everyone')}</button><button class="tab" role="tab" id="chDm" aria-selected="false">${L('Личные', 'Direct')}</button></div>
    <div class="chat-list panel soc-list" id="socList" aria-live="polite"><div class="lb-empty">${L('Загружаю…', 'Loading…')}</div></div>
    <p class="field-note soc-foot">${L('В ленте — увольнения, повышения, рекорды и покупки игроков за 7 дней. Скрыть себя: профиль → «Не показывать меня в ленте».', 'The feed shows firings, promotions, records and purchases from the last 7 days. To hide yourself: profile → “Hide me from the feed”.')}</p>
  </div>`;
  views.end.classList.add('chat-view'); show('end');
  const leave = () => { chatChannel = ''; views.end.classList.remove('chat-view'); };
  const chatOr = fn => needAccount(() => { leave(); fn(); }, L('Чаты доступны после регистрации — так коллеги будут знать, кто пишет.', 'Chats unlock after you sign up — so your coworkers know who’s talking.'));
  $('chBack').onclick = () => { leave(); renderMenu(); };
  $('chTeam').onclick = chatOr(() => showChat('team'));
  $('chAll').onclick = chatOr(() => showChat('global'));
  $('chDm').onclick = chatOr(() => showDmInbox());
  track('feed_open');
  const list = $('socList');
  if (!board.online) { list.innerHTML = `<div class="lb-empty"><span class="big">${L('Нет связи', 'Offline')}</span>${L('Лента работает, когда есть связь с сервером.', 'The feed needs a connection to the server.')}</div>`; return; }
  let more = true;
  const draw = () => {
    const shown = socMix(socFeedRows);
    list.innerHTML = shown.length ? shown.map(socItemHtml).join('') + (more && socFeedRows.length >= 30 ? `<button class="btn-ghost soc-more" type="button" id="socMore">${L('Показать ещё', 'Show more')}</button>` : '')
      : `<div class="lb-empty"><span class="big">${L('Пока тихо', 'All quiet')}</span>${L('Сыграйте неделю — и ваша пятница (или увольнение) появится здесь первой.', 'Play a week — your Friday (or your firing) will be the first thing here.')}</div>`;
    if ($('socMore')) $('socMore').onclick = async () => {
      $('socMore').disabled = true;
      try {
        const older = (await board.rpc('feed_latest', { p_id: prefs.playerId, p_limit: 30, p_before: Math.min(...socFeedRows.map(r => r.item_id)) })) || [];
        more = older.length >= 30; socFeedRows = [...socFeedRows, ...older]; draw();
      } catch (err) { toast(err.message); }
    };
  };
  try {
    socFeedRows = await socFeed(true);
    const top = Math.max(0, ...socFeedRows.map(r => r.item_id));
    if (top > (prefs.feedSeen || 0)) { prefs.feedSeen = top; store.set(KEY.prefs, prefs); }
    draw();
  } catch (err) { list.innerHTML = `<div class="lb-empty"><span class="big">${L('Нет связи', 'No connection')}</span>${esc(err.message)}</div>`; }
}

// ---------- меню: «Офис сейчас» ----------
// Последние события ленты и сообщения общего чата, обновление раз в 30 секунд, пока меню на экране
let socLiveIds = null, socLiveBusy = false;
async function socRenderLive() {
  const box = $('socLive'); if (!box) return;
  if (!socOn()) { box.hidden = true; return; }
  if (socLiveBusy) return; socLiveBusy = true;
  try {
    const feed = await socFeed().catch(() => []);
    const reg = registered();
    const msgs = reg ? ((await board.rpc('get_messages', { p_id: prefs.playerId, p_channel: 'global' }).catch(() => [])) || []) : [];
    const cs = prefs.chatSeen ||= {};
    const unreadChat = msgs.filter(m => !m.mine && m.msg_id > (cs.global || 0)).length;
    const unreadFeed = feed.filter(r => !r.is_me && r.item_id > (prefs.feedSeen || 0)).length;
    const items = [
      ...socMix(feed.filter(r => !r.is_me).slice(0, 6)).slice(0, 4).map(it => ({ key: it.npc ? it.item_id : 'f' + it.item_id, at: it.created_at, html: (() => {
        const tx = it.npc ? { ico: it.ico, t: it.t } : socText(it);
        return `<span class="soc-ico" aria-hidden="true">${tx.ico}</span><span class="soc-lt"><b>${esc(it.name)}</b> ${esc(tx.t)}${it.npc ? ` <span class="npc-tag">🤖 ${L('персонаж игры', 'game character')}</span>` : ''}</span>`; })(), go: 'feed' })),
      ...msgs.slice(0, 3).map(m => ({ key: 'm' + m.msg_id, at: m.sent_at, go: 'chat',
        html: `<span class="soc-ico" aria-hidden="true">${m.gift ? socGift(m.gift)?.ico || '🎁' : '💬'}</span><span class="soc-lt"><b>${esc(m.name)}</b>${m.gift ? ` → ${esc(m.gift_to || '')}:` : ':'} ${m.gift ? esc(socGift(m.gift)?.t || '') : socMsgHtml(m.msg, true)}</span>` })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    const prev = socLiveIds; socLiveIds = new Set(items.map(x => x.key));
    box.hidden = false;
    box.innerHTML = `<div class="ob-head"><b><i class="live-dot"></i>${L('Офис сейчас', 'Office right now')}</b>${unreadFeed + unreadChat ? `<span class="soc-badge" aria-label="${L('новых', 'new')}">${unreadFeed + unreadChat}</span>` : ''}</div>
      ${items.length ? `<div class="soc-live-list">${items.map(x => `<button type="button" class="soc-live-row${prev && !prev.has(x.key) ? ' soc-new' : ''}" data-go="${x.go}">${x.html}<small>${ago(x.at)}</small></button>`).join('')}</div>`
        : `<p class="field-note">${L('Пока тихо. Сыграйте неделю или напишите в общий чат — оживите офис!', 'All quiet. Play a week or post in the chat — wake the office up!')}</p>`}
      <div class="row2"><button class="btn-ghost" type="button" id="socToChat">💬 ${L('Чат', 'Chat')}${unreadChat ? ` <b class="soc-badge">${unreadChat}</b>` : ''}</button><button class="btn-ghost" type="button" id="socToFeed">📰 ${L('Лента', 'Feed')}${unreadFeed ? ` <b class="soc-badge">${unreadFeed}</b>` : ''}</button></div>`;
    const toChat = needAccount(() => showChat('global'), L('Чаты доступны после регистрации — так коллеги будут знать, кто пишет.', 'Chats unlock after you sign up — so your coworkers know who’s talking.'));
    $('socToChat').onclick = toChat; $('socToFeed').onclick = showFeed;
    box.querySelectorAll('[data-go]').forEach(b => b.onclick = b.dataset.go === 'chat' ? toChat : showFeed);
    // значок непрочитанного на кнопке «Чат» в меню
    const oc = $('openChat');
    if (oc) { oc.querySelector('.soc-badge')?.remove(); if (unreadChat) oc.insertAdjacentHTML('beforeend', ` <b class="soc-badge">${unreadChat}</b>`); }
  } catch { box.hidden = true; } finally { socLiveBusy = false; }
}
setInterval(() => { if (!views.menu.hidden && !document.hidden) socRenderLive(); }, 30000);
setInterval(socClaimGifts, 60000);
bus.on('menu', () => { socRenderLive(); socRenderProfile(); setTimeout(socClaimGifts, 1500); });

// ---------- экран итогов недели: «Пока вы работали» ----------
bus.on('weekEnd', ({ won, mode, res } = {}) => {
  // новый личный рекорд недели — в ленту (первый результат только запоминаем)
  if (won && (mode === 'career' || mode === 'daily') && res) {
    const total = Object.values(res).reduce((a, b) => a + b, 0), best = prefs.bestTotal || 0;
    if (best && total > best) track('new_record', { mode, detail: String(total) });
    if (total > best) { prefs.bestTotal = total; store.set(KEY.prefs, prefs); }
  }
  if (!socOn()) return;
  const sheet = views.end.querySelector('.end-sheet'), place = sheet?.querySelector('.place'); if (!sheet) return;
  const box = document.createElement('div'); box.className = 'soc-ticker'; box.hidden = true;
  (place || sheet.querySelector('.stack'))?.insertAdjacentElement(place ? 'afterend' : 'beforebegin', box);
  socFeed().then(rows => {
    const fresh = rows.filter(r => !r.is_me).slice(0, 3);
    if (!fresh.length || !box.isConnected) return;
    box.innerHTML = `<b class="soc-tk-h">☕ ${L('Пока вы работали', 'While you were working')}</b>${fresh.map((it, i) => { const tx = socText(it);
      return `<button type="button" class="soc-tk-row" style="--d:${200 + i * 350}ms"><span aria-hidden="true">${tx.ico}</span><span><b>${esc(it.name)}</b> ${esc(tx.t)}</span><small>${ago(it.created_at)}</small></button>`; }).join('')}`;
    box.hidden = false;
    box.querySelectorAll('.soc-tk-row').forEach(b => b.onclick = showFeed);
  }).catch(() => {});
});

// ---------- чат: быстрые ответы ----------
const SOC_QUICK = [L('Всем привет! 👋', 'Hi all! 👋'), L('Кто сейчас играет?', 'Who’s playing?'), L('Держимся до пятницы 💪', 'Hang in there till Friday 💪'), L('Кто на неделю дня?', 'Daily Week, anyone?')];
const SOC_EMO = ['👍', '😂', '🔥', '☕', '🎉', '😭'];
function socChatExtras() {
  const form = $('chForm'); if (!form || $('socQuick')) return;
  form.insertAdjacentHTML('beforebegin', `<div class="soc-quick" id="socQuick">${SOC_EMO.map(e => `<button type="button" class="soc-q soc-qe" data-e="${e}">${e}</button>`).join('')}${SOC_QUICK.map(t => `<button type="button" class="soc-q" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>`);
  $('socQuick').onclick = e => {
    const b = e.target.closest('.soc-q'); if (!b) return;
    const inp = $('chText');
    if (b.dataset.e) { inp.value = (inp.value + ' ' + b.dataset.e).trim(); inp.focus({ preventScroll: true }); return; }
    inp.value = b.dataset.t; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
  };
}

// ---------- открыли из пуша о подарке ----------
(() => {
  const open = new URLSearchParams(location.search).get('open');
  if (open === 'gifts') setTimeout(() => { if (views.game.hidden && prefs.name) { socClaimAt = 0; socClaimGifts(); openProfile(); } }, 2600);
  if (open === 'feed') setTimeout(() => { if (views.game.hidden && prefs.name) showFeed(); }, 2600);
})();

// ---------- своя профессия: видна другим (prof_custom), с модерацией на сервере ----------
// Название пишется в поле #profOwn (prefs.profCustom); на сервер — через секунду после ввода и при открытии меню.
// Сервер вернул null на непустое название — оно не прошло модерацию: стираем поле и говорим об этом.
const profOf = p => (p?.prof_custom ? String(p.prof_custom) : (PROF[p?.prof]?.name || ''));
let profSyncT = null;
async function socSyncProf() {
  clearTimeout(profSyncT);
  const want = (prefs.profCustom || '').trim();
  if (!socOn() || (prefs.email && !prefs.session) || want === (prefs.profCustomSynced ?? '')) return;
  try {
    const got = await board.rpc('set_prof_custom', { p_id: prefs.playerId, p_title: want || null });
    if (want && !got) {
      prefs.profCustom = ''; prefs.profCustomSynced = ''; store.set(KEY.prefs, prefs);
      if ($('profOwn')) $('profOwn').value = '';
      toast(L('Название не прошло модерацию', 'That job title didn’t pass moderation'));
      return;
    }
    prefs.profCustomSynced = want; store.set(KEY.prefs, prefs);
  } catch {}
}
if ($('profOwn')) $('profOwn').addEventListener('input', () => { clearTimeout(profSyncT); profSyncT = setTimeout(socSyncProf, 1200); });
bus.on('menu', () => setTimeout(socSyncProf, 800));
// «Пожаловаться на название» в карточке игрока: три жалобы — название стирается
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-rep-title]'); if (!b) return;
  if (socNeedAcct()) return;
  try { await board.rpc('report_title', { p_id: prefs.playerId, p_short: b.dataset.repTitle }); b.textContent = L('Жалоба отправлена', 'Reported'); b.disabled = true; }
  catch (err) { toast(err.message); }
});

// ---------- стикеры в чатах игры (те же картинки, что в наборе Telegram: data/stickers/NN.png) ----------
// Сообщение-стикер — текст «[st:NN]». Бесплатные — первые 12, остальные — набор «Премиум-стикеры» за у.е. (prefs.stickersPro)
const ST_N = 28, ST_FREE = 12, ST_PRICE = 25;
const stOk = n => n <= ST_FREE || !!prefs.stickersPro;
const stUrl = n => `data/stickers/${String(n).padStart(2, '0')}.png`;
function socMsgHtml(t, short = false) {
  const m = /^\[st:(\d{2})\]$/.exec(String(t || '').trim()), n = m ? +m[1] : 0;
  if (n >= 1 && n <= ST_N) return short ? `🖼 ${L('стикер', 'sticker')}` : `<img class="soc-st" src="${stUrl(n)}" alt="${L('стикер', 'sticker')}" loading="lazy" width="150" height="150">`;
  return short ? esc(String(t || '').slice(0, 80)) : `<span class="bubble">${esc(t)}</span>`;
}
// Панель стикеров под полем ввода: send(text) — отправить сообщение-стикер
function stPicker(anchor, send) {
  const old = document.querySelector('.soc-stp'); if (old) { old.remove(); return; }
  const box = Object.assign(document.createElement('div'), { className: 'soc-stp' });
  const render = () => {
    box.innerHTML = `<div class="soc-stp-grid">${Array.from({ length: ST_N }, (_, i) => i + 1).map(n => `<button type="button" class="soc-stp-i${stOk(n) ? '' : ' lock'}" data-st="${n}"><img src="${stUrl(n)}" alt="" loading="lazy">${stOk(n) ? '' : '<i>🔒</i>'}</button>`).join('')}</div>
      ${prefs.stickersPro ? '' : `<button type="button" class="btn-main soc-stp-buy">✨ ${L(`Премиум-стикеры (${ST_N - ST_FREE} шт.) — ${ST_PRICE} у.е.`, `Premium stickers (${ST_N - ST_FREE}) — ${money(ST_PRICE)}`)}</button>`}`;
  };
  render(); anchor.insertAdjacentElement('beforebegin', box);
  box.onclick = e => {
    if (e.target.closest('.soc-stp-buy')) return stBuy(() => render());
    const b = e.target.closest('[data-st]'); if (!b) return;
    const n = +b.dataset.st;
    if (!stOk(n)) return stBuy(() => render());
    box.remove(); track('sticker_send', { detail: String(n) }); send(`[st:${String(n).padStart(2, '0')}]`);
  };
}
function stBuy(then) {
  const C3 = careerNow();
  if (!C3 || (C3.bank || 0) < ST_PRICE) return openTopup({ need: ST_PRICE - Math.max(0, C3?.bank || 0), why: L(`Премиум-стикеры — ${ST_PRICE} у.е.`, `Premium stickers — ${money(ST_PRICE)}`), then });
  C3.bank -= ST_PRICE; C3.spent = (C3.spent || 0) + ST_PRICE; careerSave(C3);
  prefs.stickersPro = true; store.set(KEY.prefs, prefs); track('stickers_buy');
  sfx.coins?.(); toast(L('✨ Премиум-стикеры ваши — отправляйте в чатах!', '✨ Premium stickers unlocked — send them in chats!')); then?.();
}
// кнопка 🖼 в общем чате, чате офиса и личке
function stAttach(formId, inputId) {
  const form = $(formId); if (!form || form.querySelector('.soc-stb')) return;
  const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'soc-stb', title: L('Стикеры', 'Stickers'), textContent: '😺' });
  btn.setAttribute('aria-label', L('Стикеры', 'Stickers'));
  form.prepend(btn);
  btn.onclick = () => stPicker(form, t => { const inp = $(inputId); const keep = inp.value; inp.value = t; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); setTimeout(() => { if (!inp.value) inp.value = keep; }, 50); });
}
new MutationObserver(() => { stAttach('chForm', 'chText'); stAttach('dmForm', 'dmText'); }).observe(document.body, { childList: true, subtree: true });
