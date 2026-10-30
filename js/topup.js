// Пополнение баланса у.е. за рубли (Prodamus). Цена 1 у.е. зависит от размера пополнения — как в оферте и на странице «Цены».
// Окно открывается: кнопкой «Пополнить» (магазин, карточка карьеры, персонаж, профиль) и там, где у.е. не хватает —
// подсказка, магазин, просьбы и покупки персонажа, курсы, рабочий стол, долг. Любой элемент с data-topup="N" открывает окно
// с предложением докупить N у.е. (N — сколько не хватает; 0 — просто пополнить).
// Оплата: пока платёжная форма не настроена (SUPABASE_CONFIG.payments.url), кнопка «Оплатить» сообщает, что оплата скоро
// появится, и записывает намерение в статистику (событие buy_intent) — так видно спрос до запуска.
const TOPUP_TIERS = [[1, 100], [10, 90], [25, 80], [50, 70], [100, 60]];  // [от скольких у.е., цена 1 у.е. в рублях]
const TOPUP_PACKS = [10, 25, 50, 100];
const rubPer = n => TOPUP_TIERS.reduce((p, [from, price]) => n >= from ? price : p, 100);
const rub = n => (n * rubPer(n)).toLocaleString('ru-RU') + ' ₽';
const payUrl = () => window.SUPABASE_CONFIG?.payments?.url || '';

// Сколько не хватает до цены (0 — хватает)
const lackOf = price => { const C2 = careerNow(); return C2 ? Math.max(0, price - Math.max(0, C2.bank)) : price; };

function openTopup({ need = 0, why = '', then } = {}) {
  if (window.VDP_PLATFORM) return toast(L('Покупка у.е. доступна на сайте survivefriday.com', 'Buying $ is available on survivefriday.com'));
  const m = $('modal'), C2 = careerNow();
  let n = Math.max(need, need ? need : 10);
  const close = () => { m.hidden = true; then?.(); };
  const render = () => {
    const opts = [...new Set([need, ...TOPUP_PACKS].filter(x => x > 0))].sort((a, b) => a - b);
    m.innerHTML = `<div class="modal-box glass topup-box" role="dialog" aria-modal="true" aria-labelledby="tuTitle">
      <h2 id="tuTitle">💰 ${L('Пополнить баланс', 'Top up your balance')}</h2>
      ${why ? `<p class="tu-why">${why}</p>` : ''}
      <p class="shop-bal">${C2 ? L(`На счёте: <b>${money(C2.bank)}</b>`, `Balance: <b>${money(C2.bank)}</b>`) : L('У.е. зачислятся в карьеру — начните её, чтобы тратить.', 'The $ go to your career — start one to spend them.')}</p>
      <div class="tu-packs">${opts.map(x => `<button type="button" class="tu-pack${x === n ? ' on' : ''}" data-n="${x}">
        <b>${x} ${L('у.е.', '$')}</b><span>${rub(x)}</span><small>${x === need ? L('сколько не хватает', 'exactly what you lack') : rubPer(x) < 100 ? L(`−${100 - rubPer(x)}% · ${rubPer(x)} ₽/у.е.`, `−${100 - rubPer(x)}% · ${rubPer(x)} ₽ each`) : L('100 ₽/у.е.', '100 ₽ each')}</small></button>`).join('')}</div>
      <div class="tu-custom"><button type="button" class="btn-chip" id="tuMinus" aria-label="${L('Меньше', 'Less')}">−</button><span><b id="tuN">${n}</b> ${L('у.е.', '$')} = <b id="tuSum">${rub(n)}</b></span><button type="button" class="btn-chip" id="tuPlus" aria-label="${L('Больше', 'More')}">+</button></div>
      <p class="tu-tiers">${L('Чем больше пополнение, тем дешевле: 10+ у.е. — 90 ₽, 25+ — 80 ₽, 50+ — 70 ₽, 100+ — 60 ₽ за 1 у.е.', 'The more you buy, the cheaper: 10+ — 90 ₽, 25+ — 80 ₽, 50+ — 70 ₽, 100+ — 60 ₽ per $1.')}</p>
      <label class="tu-agree"><input type="checkbox" id="tuAgree"> <span>${L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a> и <a href="politika.html" target="_blank" rel="noopener">политикой обработки персональных данных</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a> and <a href="politika.html" target="_blank" rel="noopener">privacy policy</a> (in Russian)')}</span></label>
      <p class="join-err" id="tuErr" role="alert"></p>
      <button class="btn-main" type="button" id="tuPay">${L('Оплатить', 'Pay')} ${rub(n)}</button>
      <p class="tu-alt">${L('Или заработайте в игре: зарплата, премии за дедлайны, задания дня, награды за друзей.', 'Or earn it in the game: salary, deadline bonuses, daily quests, referral rewards.')}</p>
      <button class="btn-ghost" type="button" id="tuClose">${L('Не сейчас', 'Not now')}</button></div>`;
    m.hidden = false;
    const set = x => { n = Math.max(1, Math.min(500, x)); $('tuN').textContent = n; $('tuSum').textContent = rub(n); $('tuPay').textContent = `${L('Оплатить', 'Pay')} ${rub(n)}`; m.querySelectorAll('.tu-pack').forEach(b => b.classList.toggle('on', +b.dataset.n === n)); };
    m.querySelectorAll('.tu-pack').forEach(b => b.onclick = () => set(+b.dataset.n));
    $('tuMinus').onclick = () => set(n - 1); $('tuPlus').onclick = () => set(n + 1);
    $('tuClose').onclick = close;
    $('tuPay').onclick = () => {
      if (!$('tuAgree').checked) { $('tuErr').textContent = L('Отметьте согласие с офертой.', 'Please accept the public offer.'); return; }
      if (!(typeof registered === 'function' && registered())) {  // по оферте у.е. зачисляются на аккаунт
        m.hidden = true; renderJoin('login', L('Чтобы купить у.е., войдите в аккаунт — так они не потеряются и будут на всех устройствах.', 'Sign in to buy $ — so they’re safe and on every device.'));
        return;
      }
      track('buy_intent', { detail: `${n}:${n * rubPer(n)}` });
      if (!payUrl()) { $('tuErr').textContent = ''; m.querySelector('.tu-alt').innerHTML = `<b>${L('Оплата картой появится совсем скоро.', 'Card payments are coming very soon.')}</b> ${L('А пока у.е. можно заработать в игре.', 'Meanwhile, you can earn $ in the game.')}`; return; }
      location.href = payUrl();  // подключение Prodamus: адрес платёжной формы с параметрами заказа — следующим шагом
    };
  };
  render();
}

// Любая кнопка с data-topup="N" (сколько не хватает) открывает пополнение; data-topup-why — пояснение, data-topup-back — что открыть после
document.addEventListener('click', e => {
  const b = e.target.closest('[data-topup]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const back = { shop: () => openShop(), heroShop: () => heroShop(), heroAsk: () => heroAsk(), desk: () => openDesk(), tools: () => cardTools() }[b.dataset.topupBack];
  openTopup({ need: +b.dataset.topup || 0, why: b.dataset.topupWhy || '', then: back });
}, true);
// Кнопка «нет денег» → «пополнить»: html-кусок для вставки рядом с ценой
const topupBtn = (need, back, why = '', cls = 'btn-chip tu-btn') => `<button type="button" class="${cls}" data-topup="${need}" data-topup-back="${back || ''}" data-topup-why="${esc(why)}">💰 ${need ? L(`Не хватает ${need} — пополнить`, `$${need} short — top up`) : L('Пополнить', 'Top up')}</button>`;
