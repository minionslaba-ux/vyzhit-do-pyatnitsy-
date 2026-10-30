// Желания аватара и покупки для него: каталог из 36 вещей с выбором (цветы, сладкое, телефон, продукты, одежда, досуг),
// желания прямо во время рабочей недели (1–2 за неделю, между карточками), мультик на 6–15 секунд после каждой покупки
// (супермаркет с тележкой, курьер с коробкой, примерочная, телефон, вечер вне дома) и шкала срывов:
// настроение ниже 20 в конце недели или увольнение при настроении ниже 40 — срыв; 2-й срыв — откат на 1 неделю,
// 3-й — откат на 2 недели (шкала обнуляется); неделя в отличном настроении (80+) снимает один срыв.
// Данные — в C.hero (mood, breaks, wear); 3D — js/hero3d.js, просьбы о больших покупках — js/hero.js.

// ---------- каталог ----------
// kind: pick — выбрать один вариант; cart — набрать корзину; wear — одежда (меняется на аватаре)
// toon — какой мультик показать после покупки
const GOODS = [
  { id: 'flowers', ico: '💐', toon: 'delivery', kind: 'pick', t: L('Цветы', 'Flowers'), items: [
    { id: 'daisy', ico: '🌼', price: 3, mood: 8, t: L('Букет ромашек', 'Daisies') },
    { id: 'tulips', ico: '🌷', price: 5, mood: 12, t: L('Тюльпаны', 'Tulips') },
    { id: 'roses', ico: '🌹', price: 9, mood: 18, t: L('Розы', 'Roses') },
    { id: 'peonies', ico: '💐', price: 12, mood: 22, t: L('Пионы в шляпной коробке', 'Peonies in a hatbox') }] },
  { id: 'sweets', ico: '🍬', toon: 'delivery', kind: 'pick', t: L('Сладкое', 'Sweets'), items: [
    { id: 'bar', ico: '🍫', price: 2, mood: 5, t: L('Шоколадка', 'Chocolate bar') },
    { id: 'macarons', ico: '🧁', price: 4, mood: 8, t: L('Макаруны', 'Macarons') },
    { id: 'candybox', ico: '🎁', price: 5, mood: 10, t: L('Коробка конфет', 'Box of chocolates') },
    { id: 'cake', ico: '🎂', price: 8, mood: 14, t: L('Торт', 'A cake') }] },
  { id: 'phone', ico: '📱', toon: 'phone', kind: 'pick', t: L('Баланс телефона', 'Phone credit'), items: [
    { id: 'ph3', ico: '📶', price: 3, mood: 5, t: L('Пополнить на 3 у.е.', 'Top up $3') },
    { id: 'ph5', ico: '📶', price: 5, mood: 8, t: L('Пополнить на 5 у.е.', 'Top up $5') },
    { id: 'ph10', ico: '🚀', price: 10, mood: 12, t: L('Безлимит на месяц', 'Unlimited for a month') }] },
  { id: 'groceries', ico: '🛒', toon: 'market', kind: 'cart', t: L('Продукты', 'Groceries'), cap: 25, items: [
    { id: 'bread', ico: '🍞', price: 1, mood: 1, t: L('Хлеб', 'Bread') },
    { id: 'milk', ico: '🥛', price: 1, mood: 1, t: L('Молоко', 'Milk') },
    { id: 'eggs', ico: '🥚', price: 1, mood: 1, t: L('Яйца', 'Eggs') },
    { id: 'pasta', ico: '🍝', price: 1, mood: 2, t: L('Паста', 'Pasta') },
    { id: 'veg', ico: '🥦', price: 2, mood: 2, t: L('Овощи', 'Vegetables') },
    { id: 'fruit', ico: '🍎', price: 2, mood: 2, t: L('Фрукты', 'Fruit') },
    { id: 'cheese', ico: '🧀', price: 2, mood: 3, t: L('Сыр', 'Cheese') },
    { id: 'coffee', ico: '☕', price: 2, mood: 3, t: L('Кофе в зёрнах', 'Coffee beans') },
    { id: 'icecream', ico: '🍦', price: 2, mood: 3, t: L('Мороженое', 'Ice cream') },
    { id: 'avocado', ico: '🥑', price: 2, mood: 3, t: L('Авокадо', 'Avocados') },
    { id: 'chicken', ico: '🍗', price: 3, mood: 3, t: L('Курица', 'Chicken') },
    { id: 'fish', ico: '🐟', price: 4, mood: 4, t: L('Красная рыба', 'Salmon') }] },
  { id: 'clothes', ico: '👗', toon: 'wear', kind: 'wear', t: L('Одежда', 'Clothes'), items: [
    { id: 'tee', ico: '👕', price: 4, mood: 6, t: L('Белая футболка', 'White T-shirt'), wear: { top: '#f2f2f4', short: true, jacket: '', tie: '', dress: false } },
    { id: 'hoodie', ico: '🧶', price: 7, mood: 9, t: L('Худи «Пятница»', '“Friday” hoodie'), wear: { top: '#ff5c8a', short: false, jacket: '', tie: '', dress: false } },
    { id: 'shirt', ico: '👔', price: 9, mood: 10, t: g => g === 'f' ? L('Шёлковая блузка', 'Silk blouse') : L('Рубашка с галстуком', 'Shirt and tie'),
      wear: g => g === 'f' ? { top: '#f6dfe8', short: false, jacket: '', tie: '', dress: false } : { top: '#dfe8f7', short: false, jacket: '', tie: '#7a2a3a', dress: false } },
    { id: 'blazer', ico: '🧥', price: 12, mood: 12, t: L('Приталенный пиджак', 'Tailored blazer'), wear: { jacket: '#1f2a44', dress: false, short: false } },
    { id: 'gala', ico: '✨', price: 17, mood: 20, t: g => g === 'f' ? L('Вечернее платье', 'Evening dress') : L('Костюм-тройка', 'Three-piece suit'),
      wear: g => g === 'f' ? { dress: true, top: '#9b1d40', jacket: '', tie: '', heels: true, short: false } : { jacket: '#1d1d22', bottom: '#1d1d22', top: '#ffffff', tie: '#141418', short: false } },
    { id: 'jeans', ico: '👖', price: 6, mood: 7, t: g => g === 'f' ? L('Юбка-карандаш', 'Pencil skirt') : L('Джинсы', 'Jeans'),
      wear: g => g === 'f' ? { skirt: true, dress: false, bottom: '#1e1e26' } : { bottom: '#3a5a8a' } },
    { id: 'sneakers', ico: '👟', price: 8, mood: 8, t: L('Белые кроссовки', 'White sneakers'), wear: { shoes: '#f5f5f5', heels: false } }] },
  { id: 'fun', ico: '🎟️', toon: 'outing', kind: 'pick', t: L('Досуг', 'Going out'), items: [
    { id: 'latte', ico: '☕', price: 1, mood: 3, t: L('Кофе с собой', 'Coffee to go') },
    { id: 'book', ico: '📖', price: 3, mood: 6, t: L('Новая книга', 'A new book') },
    { id: 'cinema', ico: '🎬', price: 4, mood: 9, t: L('Кино с попкорном', 'Movie and popcorn') },
    { id: 'dinner', ico: '🍷', price: 10, mood: 16, t: L('Ужин в ресторане', 'Dinner out') },
    { id: 'spa', ico: '💆', price: 12, mood: 18, t: L('День в спа', 'Spa day') },
    { id: 'concert', ico: '🎸', price: 15, mood: 20, t: L('Концерт любимой группы', 'Favorite band’s concert') }] },
];
const goodsCat = id => GOODS.find(g => g.id === id);
const goodText = (x, h, k = 't') => typeof x[k] === 'function' ? x[k](heroPreset(h).g) : x[k];
// Внешность с учётом купленной одежды
const heroLook = h => ({ ...heroPreset(h), ...(h?.wear || {}) });

// ---------- шкала настроения и срывов ----------
const MOOD_ZONES = [
  { from: 80, ico: '😍', t: L('счастье', 'happy') },
  { from: 50, ico: '🙂', t: L('в порядке', 'fine') },
  { from: 20, ico: '😟', t: L('грустит', 'down') },
  { from: 0, ico: '😭', t: L('на грани срыва', 'about to snap') },
];
const moodZone = m => MOOD_ZONES.find(z => m >= z.from);
const BREAKS_MAX = 3;
const ROLLBACK = { 2: 1, 3: 2 };  // срыв № → на сколько недель откат
const moodScaleHtml = h => {
  const m = h.mood ?? 70, z = moodZone(m), b = h.breaks || 0;
  return `<div class="mood-scale" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m}" aria-label="${L('Настроение', 'Mood')}">
      <div class="hero-mood"><i style="--v:${m}"></i><s style="left:20%"></s><s style="left:50%"></s><s style="left:80%"></s></div>
      <small>${z.ico} ${L('Настроение', 'Mood')} ${m}/100 · ${z.t}</small>
      <small class="breaks" title="${L('Срывы: 2-й — откат на 1 неделю, 3-й — на 2 недели', 'Breakdowns: 2nd — back 1 week, 3rd — back 2 weeks')}">${L('Срывы', 'Breakdowns')} ${'💔'.repeat(b)}${'🤍'.repeat(BREAKS_MAX - b)} <span>${L('2 — откат на неделю, 3 — на две', '2 — back 1 week, 3 — back 2')}</span></small></div>`;
};

// Конец недели: срывы, откат, «помирились»; затем — просьба о большой покупке прямо на экране итогов
bus.on('weekEnd', x => {
  if (x.mode !== 'career') return;
  const C2 = careerNow(), h = C2?.hero; if (!h) return;
  const m = h.mood ?? 70, nm = h.name, fem = heroFem(h);
  let why = '';
  if (m < 20) why = L(`${nm} неделю был${fem ? 'а' : ''} на грани — и сорвал${fem ? 'ась' : 'ся'}.`, `${nm} spent the week on the edge — and snapped.`);
  else if (!x.won && m < 40) why = L(`Увольнение при плохом настроении — дома скандал.`, `Getting fired while ${nm} was already down — a huge fight at home.`);
  else if (m >= 80 && h.breaks) { h.breaks--; careerSave(C2); setTimeout(() => toast(L(`${nm} счастлив${fem ? 'а' : ''} — один срыв забыт 💞`, `${nm} is happy — one breakdown forgiven 💞`)), 1600); }
  if (why) {
    h.breaks = (h.breaks || 0) + 1;
    const back = ROLLBACK[h.breaks] || 0, from = C2.week;
    if (back) {
      C2.week = Math.max(1, C2.week - back); C2.worked = Math.max(0, (C2.worked || 0) - back);
      if (h.breaks >= BREAKS_MAX) h.breaks = 0;
      h.mood = 45;
      const nx = $('next'); if (nx && /\d/.test(nx.textContent) && x.won) nx.textContent = L(`Неделя ${C2.week} →`, `Week ${C2.week} →`);
    }
    careerSave(C2);
    track('hero_break', { detail: `${h.breaks || BREAKS_MAX}:${back}` });
    setTimeout(() => breakModal(why, back, from, C2.week, h), 1200);
    return;
  }
  setTimeout(() => { if (h.pending && h.seenWeek !== C2.week && $('modal').hidden && !views.end.hidden) heroAsk(); }, 1800);
});

function breakModal(why, back, from, to, h) {
  const { m, close } = heroModal(`
    <div class="hero-ask"><canvas class="hero-cv" data-framing="full"></canvas>
      <div class="hero-bubble break"><b id="heroTitle">💔 ${L('Срыв!', 'Breakdown!')}</b><p>${why}</p>
        ${back ? `<p class="rollback">⏪ ${L(`Откат на ${back} ${back === 1 ? 'неделю' : 'недели'}: неделя ${from} → ${to}`, `Back ${back} week${back > 1 ? 's' : ''}: week ${from} → ${to}`)}</p>` : `<p>${L('Это первый срыв — предупреждение. Второй откатит карьеру на неделю назад, третий — на две.', 'First breakdown — a warning. The second sets your career back a week, the third — two weeks.')}</p>`}</div></div>
    ${moodScaleHtml(h)}
    <p class="hero-lead">${L('Поднимайте настроение: исполняйте желания, дарите цветы, покупайте продукты и одежду.', 'Keep their mood up: grant wishes, buy flowers, groceries and clothes.')}</p>
    <div class="hero-acts"><button class="btn-main" type="button" id="brShop">🛍️ ${L('Порадовать', 'Cheer them up')}</button><button class="btn-ghost" type="button" id="brOk">${L('Понятно', 'Got it')}</button></div>`, heroLook(h), 'sad');
  sfx.lose?.();
  $('brOk').onclick = close;
  $('brShop').onclick = () => { close(); heroShop(); };
  return m;
}

// ---------- желания во время недели ----------
const WISHES = [
  { cat: 'flowers', sad: true, ask: L('Что-то совсем тоскливо… Может, цветы? Хоть немного весны.', 'I’m feeling so low… Maybe some flowers? A bit of spring.') },
  { cat: 'sweets', sad: true, ask: L('Плохой день. Мне срочно нужно что-нибудь сладкое.', 'Bad day. I urgently need something sweet.') },
  { cat: 'phone', ask: L('На телефоне минус — даже такси не вызвать. Пополнишь?', 'My phone’s out of credit — I can’t even call a cab. Top it up?') },
  { cat: 'groceries', ask: L('Холодильник пустой, одна горчица. Сходим в супермаркет?', 'The fridge is empty except for mustard. Supermarket run?') },
  { cat: 'clothes', ask: L('Мне совершенно нечего надеть! В пятницу корпоратив.', 'I have absolutely nothing to wear! The office party is on Friday.') },
  { cat: 'fun', ask: L('Давай вечером куда-нибудь выберемся? Я устал(а) от четырёх стен.', 'Let’s go out tonight? I’m tired of these four walls.') },
  { cat: 'sweets', ask: L('Видел(а) в витрине такие макаруны… Купим?', 'I saw the cutest macarons in a shop window… Shall we?') },
  { cat: 'flowers', ask: L('Просто так. Без повода. Цветы?', 'Just because. No reason. Flowers?') },
];
const wishFor = h => {
  const sad = (h.mood ?? 70) < 55, pool = WISHES.filter(w => !sad || w.sad || Math.random() < 0.3);
  const fresh = pool.filter(w => w.cat !== h.lastWish);
  return rnd(fresh.length ? fresh : pool);
};
const genderize = (s, h) => s.replace(/\(а\)/g, heroFem(h) ? 'а' : '').replace(/устал\(а\)/g, heroFem(h) ? 'устала' : 'устал');

// В начале недели — в какие моменты аватар напишет (1–2 раза, середина дня)
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || !C?.hero) return;
  const n = (C.hero.mood ?? 70) < 55 || Math.random() < 0.5 ? 2 : 1, at = new Set();
  while (at.size < n) at.add(3 + Math.floor(Math.random() * (WEEK_LEN - 7)));
  S2.wishAt = [...at];
});
bus.on('answer', () => {
  if (S?.mode !== 'career' || !C?.hero || !S.wishAt?.includes(S.step)) return;
  const step = S.step;
  setTimeout(() => {
    const ok = !views.game.hidden && !splashOn && !busy && $('modal').hidden && S && RES.every(r => S.res[r.k] > 0 && S.res[r.k] < 100);
    if (!ok) { if (step + 1 < WEEK_LEN - 1) S.wishAt.push(step + 1); return; }  // не вовремя — на следующей карточке
    S.wishAt = S.wishAt.filter(x => x !== step);
    wishPop();
  }, 900);
});

// Желание: аватар пишет посреди дня. «Выбрать» — каталог этой категории; «Не сейчас» — настроение −8
function wishPop(w = wishFor(C.hero)) {
  const h = C.hero, cat = goodsCat(w.cat);
  h.lastWish = w.cat; saveCareer();
  busy = true; sfx.sms?.();
  const done = () => { busy = false; renderBars?.(); };
  const { m, close } = heroModal(`
    <div class="hero-ask"><canvas class="hero-cv" data-framing="bust"></canvas>
      <div class="hero-bubble"><b id="heroTitle">${cat.ico} ${esc(h.name)} ${L('пишет', 'texts')}</b><p>«${esc(genderize(w.ask, h))}»</p><span>${L('Сейчас на счёте', 'Balance')} ${money(C.bank)}</span></div></div>
    ${moodScaleHtml(h)}
    <div class="hero-acts"><button class="btn-main" type="button" id="wpGo">${cat.ico} ${L('Выбрать', 'Pick something')}</button>
      <button class="btn-link" type="button" id="wpNo">${L(`Не сейчас (настроение −8)`, `Not now (mood −8)`)}</button></div>`, heroLook(h), (h.mood ?? 70) < 50 ? 'sad' : 'ask');
  $('wpGo').onclick = () => { close(); goodsPicker(cat.id, done); };
  $('wpNo').onclick = () => {
    h.mood = Math.max(0, (h.mood ?? 70) - 8); saveCareer(); heroView?.setEmotion('sad');
    toast(L(`${h.name} вздыхает…`, `${h.name} sighs…`));
    setTimeout(() => { close(); done(); }, 900);
  };
}

// ---------- выбор покупки ----------
let goodsReopen = null;  // вернуться в выбор после пополнения баланса
function goodsPicker(catId, after) {
  const C2 = careerNow(), h = C2?.hero; if (!h) return after?.();
  const cat = goodsCat(catId), m = $('modal'), cart = {};
  goodsReopen = () => goodsPicker(catId, after);
  dropView();
  const back = () => { m.hidden = true; goodsReopen = null; after?.(); };
  const total = () => cat.items.reduce((s, x) => s + (cart[x.id] || 0) * x.price, 0);
  const render = () => {
    const isCart = cat.kind === 'cart', t = total();
    const worn = id => h.worn?.includes(id);
    m.innerHTML = `<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="gpTitle">
      <h2 id="gpTitle">${cat.ico} ${esc(cat.t)} · ${esc(h.name)}</h2>
      <p class="hero-lead">${L(`На счёте ${money(C2.bank)}`, `Balance ${money(C2.bank)}`)} · ${isCart ? L('наберите корзину — чем разнообразнее, тем лучше настроение', 'fill the cart — the more variety, the better the mood') : L('выберите вариант — дороже, значит радостнее', 'pick one — pricier means happier')}</p>
      <div class="gp-list${isCart ? ' cart' : ''}">${cat.items.map(x => {
        const short = C2.bank < x.price && !isCart;
        return `<div class="gp-item${short ? ' short' : ''}${worn(x.id) ? ' worn' : ''}"><span class="gp-ico" aria-hidden="true">${x.ico}</span>
          <span class="gp-txt"><b>${esc(goodText(x, h))}</b><small>${money(x.price)} · ${L(`настроение +${x.mood}`, `mood +${x.mood}`)}${worn(x.id) ? L(' · уже есть', ' · owned') : ''}</small></span>
          ${isCart ? `<span class="gp-qty"><button type="button" class="btn-chip" data-dec="${x.id}" aria-label="${L('Убрать', 'Remove')}">−</button><b>${cart[x.id] || 0}</b><button type="button" class="btn-chip" data-inc="${x.id}" aria-label="${L('Добавить', 'Add')}">+</button></span>`
            : short ? `<button type="button" class="btn-chip tu-btn" data-topup="${lackOf(x.price)}" data-topup-back="goods" data-topup-why="${esc(L(`${goodText(x, h)} — ${money(x.price)} · на счёте ${money(C2.bank)}`, `${goodText(x, h)} — ${money(x.price)} · you have ${money(C2.bank)}`))}">💰 ${L(`не хватает ${lackOf(x.price)}`, `${money(lackOf(x.price))} short`)}</button>`
            : `<button type="button" class="btn-chip" data-buy="${x.id}">${L('Купить', 'Buy')} · ${money(x.price)}</button>`}</div>`;
      }).join('')}</div>
      ${isCart ? `<div class="gp-total"><span>${L('В корзине', 'Cart')}: <b>${money(t)}</b></span>${t > C2.bank ? topupBtn(t - C2.bank, 'goods', L(`Корзина на ${money(t)} · на счёте ${money(C2.bank)}`, `Cart ${money(t)} · you have ${money(C2.bank)}`), 'btn-main tu-btn') : `<button class="btn-main" type="button" id="gpPay" ${t ? '' : 'disabled'}>🧾 ${L('На кассу', 'Checkout')}</button>`}</div>` : ''}
      <button class="btn-ghost" type="button" id="gpClose">${L('Назад', 'Back')}</button></div>`;
    m.hidden = false;
    m.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { cart[b.dataset.inc] = Math.min(5, (cart[b.dataset.inc] || 0) + 1); sfx.item?.(); render(); });
    m.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { cart[b.dataset.dec] = Math.max(0, (cart[b.dataset.dec] || 0) - 1); render(); });
    m.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const x = cat.items.find(i => i.id === b.dataset.buy); buyGoods(cat, [x], x.price, x.mood, after); });
    if ($('gpPay')) $('gpPay').onclick = () => {
      const list = cat.items.flatMap(x => Array(cart[x.id] || 0).fill(x)), kinds = new Set(list.map(x => x.id)).size;
      const mood = Math.min(cat.cap, list.reduce((s, x) => s + x.mood, 0) + kinds);  // разнообразие — бонус
      buyGoods(cat, list, total(), mood, after);
    };
    $('gpClose').onclick = back;
  };
  render();
}

function buyGoods(cat, list, price, mood, after) {
  const C2 = careerNow(), h = C2.hero;
  if (C2.bank < price) return;
  C2.bank -= price; C2.spent = (C2.spent || 0) + price;
  h.mood = Math.min(100, (h.mood ?? 70) + mood);
  h.gifts = (h.gifts || 0) + 1;
  if (cat.kind === 'wear') { const x = list[0], w = typeof x.wear === 'function' ? x.wear(heroPreset(h).g) : x.wear; h.wear = { ...(h.wear || {}), ...w }; (h.worn ||= []).includes(x.id) || h.worn.push(x.id); }
  careerSave(C2); sfx.coins?.();
  track('hero_buy', { detail: `${cat.id}:${list.map(x => x.id).join('+')}:${price}` });
  if (typeof S !== 'undefined' && S?.mode === 'career' && !views.game.hidden) renderBars?.();
  goodsReopen = null;
  playToon({ kind: cat.toon, cat, list, mood, h }, after);
}

// ---------- мультики ----------
// Сцена: CSS-фон и реквизит + живой 3D-аватар поверх. Длительность 6–15 с, «Пропустить» — сразу к концу
const TOON_LEN = { market: n => Math.min(15000, 6500 + n * 750), delivery: () => 7500, phone: () => 6500, wear: () => 8500, outing: () => 7500, need: () => 8000 };
const OUTING_FX = { latte: '☕', book: '📖', cinema: '🍿', dinner: '🕯️', spa: '🫧', concert: '🎶' };
function playToon({ kind, cat, list = [], mood = 0, h, need }, after) {
  const m = $('modal'), C2 = careerNow();
  dropView();
  const x = list[0], fem = heroFem(h), nm = esc(h.name);
  const dur = RM.matches ? 3500 : TOON_LEN[kind](list.length);
  const props = {
    market: `<div class="tn-shelves">${['🥫🧃🍪🥫🧃🍪🥫🧃', '🍎🥦🍞🥛🧀🍌🥕🍇', '🧴🧻🍫🍬🧴🧻🍫🍬'].map((r, i) => `<div class="tn-shelf" style="--d:${i}">${(r + r).replace(/(.)/gu, '<span>$1</span>')}</div>`).join('')}</div>
      <div class="tn-cart">🛒<div class="tn-in"></div></div>${list.map((it, i) => `<span class="tn-fly" style="--i:${i}">${it.ico}</span>`).join('')}
      <div class="tn-receipt"><b>${L('Касса', 'Checkout')}</b>${list.length} ${L('шт.', 'items')} · ${money(list.reduce((s, it) => s + it.price, 0))}</div>`,
    delivery: `<div class="tn-door">🚪</div><span class="tn-bell">🔔 ${L('Дзинь-дзинь!', 'Ding-dong!')}</span><div class="tn-box">📦</div><span class="tn-gift">${x?.ico || '🎁'}</span>`,
    phone: `<div class="tn-phone"><div class="tn-scr"><b>📶 ${L('Баланс пополнен', 'Top-up done')}</b><i></i><span>+${x?.price || 0} ${L('у.е.', '$')}</span></div></div>${['💬', '❤️', '😂', '📸'].map((e, i) => `<span class="tn-ping" style="--i:${i}">${e}</span>`).join('')}`,
    wear: `<div class="tn-curtain l"></div><div class="tn-curtain r"></div><div class="tn-mirror">🪞</div>${Array.from({ length: 6 }, (_, i) => `<span class="tn-spark" style="--i:${i}">✨</span>`).join('')}<span class="tn-tag">${x?.ico || '👗'} ${esc(x ? goodText(x, h) : '')}</span>`,
    outing: `<div class="tn-night"></div>${Array.from({ length: 10 }, (_, i) => `<span class="tn-rain" style="--i:${i}">${OUTING_FX[x?.id] || '✨'}</span>`).join('')}<span class="tn-big">${x?.ico || '🎟️'}</span>`,
    need: `<span class="tn-big need">${need?.ico || '🎉'}</span>${Array.from({ length: 12 }, (_, i) => `<span class="tn-rain" style="--i:${i}">${['🎉', '✨', '💖'][i % 3]}</span>`).join('')}`,
  }[kind];
  const caps = {
    market: [L(`${nm} идёт в супермаркет…`, `${nm} heads to the supermarket…`), L('Тележка наполняется', 'Filling up the cart'), L('Касса — и домой!', 'Checkout — and home!')],
    delivery: [L('Звонок в дверь…', 'Doorbell…'), L(`Курьер: «Это для ${nm}!»`, `Courier: “This is for ${nm}!”`), L(`${nm} сияет`, `${nm} is glowing`)],
    phone: [L(`${nm} проверяет телефон…`, `${nm} checks the phone…`), L('Связь есть! Чаты оживают', 'Back online! The chats come alive')],
    wear: [L('Примерочная…', 'Fitting room…'), L('Вжух — новый образ!', 'Ta-da — a new look!'), L(`${nm} не может налюбоваться`, `${nm} can’t stop looking in the mirror`)],
    outing: [L('Вечер только для двоих', 'An evening just for the two of you'), L(`${nm} забыл${fem ? 'а' : ''} про работу`, `${nm} forgot all about work`)],
    need: [L('Мечта сбывается…', 'A dream comes true…'), L(`${nm} на седьмом небе`, `${nm} is over the moon`)],
  }[kind];
  m.innerHTML = `<div class="modal-box glass toon-box" role="dialog" aria-modal="true" aria-label="${L('Мультик', 'Cartoon')}">
    <div class="toon toon-${kind}" style="--dur:${dur}ms;--n:${Math.max(1, list.length)}">${props}<canvas class="toon-cv"></canvas><div class="tn-hearts"></div>
      <p class="tn-cap" aria-live="polite">${caps[0]}</p><div class="tn-bar"><i></i></div></div>
    <p class="tn-sum">${need ? `${need.ico} ${esc(needText(need, h, 't'))}` : `${cat.ico} ${esc(list.length > 1 ? L(`Корзина: ${list.length} шт.`, `Cart: ${list.length} items`) : goodText(x, h))}`} · ${L(`настроение +${mood}`, `mood +${mood}`)} · ${L('на счёте', 'balance')} ${money(C2.bank)}</p>
    <button class="btn-ghost" type="button" id="tnSkip">${L('Пропустить ⏭', 'Skip ⏭')}</button></div>`;
  m.hidden = false;
  const stage = m.querySelector('.toon'), cv = m.querySelector('.toon-cv');
  let view = null, timers = [], over = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const cap = i => { const p = stage.querySelector('.tn-cap'); if (p && caps[i]) { p.textContent = caps[i]; p.classList.remove('on'); void p.offsetWidth; p.classList.add('on'); } };
  const hearts = () => { const box = stage.querySelector('.tn-hearts'); box.innerHTML = Array.from({ length: 9 }, (_, i) => `<span style="--i:${i}">${['💖', '💗', '✨'][i % 3]}</span>`).join(''); };
  const look = heroLook(h), before = kind === 'wear' ? { ...heroPreset(h), ...(h.wearPrev || {}) } : look;
  heroViewer(cv, before, { framing: 'full', emotion: kind === 'wear' ? 'neutral' : 'happy', interactive: false, yawRest: kind === 'market' ? -0.9 : -0.15 }).then(v => {
    if (!v || over) return v?.dispose();
    view = v;
    const A = { market: 'walk', delivery: null, phone: 'phone', wear: null, outing: 'hug', need: 'jump' }[kind];
    v.setAction(A);
  });
  stage.classList.add('go');
  // сценарий по времени
  const D = dur;
  if (kind === 'market') { at(D * 0.25, () => cap(1)); at(D * 0.72, () => { cap(2); view?.setAction('hold'); }); at(D * 0.85, () => { view?.setAction('cheer'); hearts(); sfx.coins?.(); }); }
  if (kind === 'delivery') { at(900, () => sfx.bell?.()); at(D * 0.3, () => { cap(1); view?.setAction('give'); }); at(D * 0.55, () => { view?.setAction('hug'); view?.setEmotion('happy'); }); at(D * 0.72, () => { cap(2); view?.setAction('cheer'); hearts(); }); }
  if (kind === 'phone') { at(D * 0.45, () => { cap(1); sfx.sms?.(); }); at(D * 0.7, () => { view?.setAction('cheer'); hearts(); }); }
  if (kind === 'wear') { at(D * 0.15, () => view?.setAction('spin')); at(D * 0.32, () => { view?.setPreset(look); cap(1); sfx.item?.(); }); at(D * 0.5, () => { view?.setAction(null); view?.setEmotion('happy'); }); at(D * 0.7, () => { cap(2); view?.setAction('cheer'); hearts(); }); }
  if (kind === 'outing') { at(D * 0.5, () => { cap(1); view?.setAction('cheer'); hearts(); }); }
  if (kind === 'need') { at(D * 0.45, () => { cap(1); hearts(); sfx.win?.(); }); at(D * 0.6, () => view?.setAction('cheer')); }
  const finish = () => {
    if (over) return; over = true;
    timers.forEach(clearTimeout); view?.dispose(); m.hidden = true;
    if (kind === 'wear') { h.wearPrev = h.wear; careerSave(C2); }
    toast(L(`${h.name}: «Спасибо!» · настроение ${h.mood}/100`, `${h.name}: “Thank you!” · mood ${h.mood}/100`));
    if (!views.menu.hidden) renderMenu();
    after?.();
  };
  at(D, finish);
  $('tnSkip').onclick = finish;
}
