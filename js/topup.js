// Пополнение баланса у.е. за рубли (Робокасса). Цена 1 у.е. зависит от размера пополнения — как в оферте и на странице «Цены».
// Окно открывается: кнопкой «Пополнить» (магазин, карточка карьеры, персонаж, профиль) и там, где у.е. не хватает —
// подсказка, магазин, просьбы и покупки персонажа, курсы, рабочий стол, долг. Любой элемент с data-topup="N" открывает окно
// с предложением докупить N у.е. (N — сколько не хватает; 0 — просто пополнить).
// Оплата: «Оплатить» → сервер (robokassa-pay) создаёт счёт и подписанную ссылку → страница Робокассы → возврат на сайт.
// Пока в Supabase нет паролей магазина, сервер отвечает not_configured — игрок видит «оплата появится совсем скоро».
// Каждое нажатие «Оплатить» пишется в статистику (buy_intent), зачисление — событие purchase.
const TOPUP_TIERS = [[1, 100], [10, 90], [25, 80], [50, 70], [100, 60]];  // [от скольких у.е., цена 1 у.е. в рублях]
const TOPUP_PACKS = [10, 25, 50, 100];
const rubPer = n => TOPUP_TIERS.reduce((p, [from, price]) => n >= from ? price : p, 100);
const rub = n => (n * rubPer(n)).toLocaleString('ru-RU') + ' ₽';
// Подсказки выбора на пакетах (якорь цены): 25 — самый частый выбор, 100 — самая низкая цена за 1 у.е.
const TOPUP_TAG = { 25: () => L('Популярное', 'Popular'), 100: () => L('Выгодно', 'Best value') };
// +50% к первому пополнению (сервер, robokassa-pay, даёт бонус, если у игрока ещё нет оплаченных покупок)
const firstBonusOn = () => !prefs.paidUser;

// Сколько не хватает до цены (0 — хватает)
const lackOf = price => { const C2 = careerNow(); return C2 ? Math.max(0, price - Math.max(0, C2.bank)) : price; };

function openTopup({ need = 0, why = '', then } = {}) {
  if (window.VK_MINI) return openVkTopup({ need, why, then });  // внутри ВК — голоса ВК (или «пока недоступно»)
  if (window.VDP_PLATFORM) return toast(L('Покупка у.е. доступна на сайте survivefriday.com', 'Buying $ is available on survivefriday.com'));
  const m = $('modal'), C2 = careerNow();
  let n = Math.max(need, need ? need : 10);
  const close = () => { m.hidden = true; then?.(); };
  const render = () => {
    const opts = [...new Set([need, ...TOPUP_PACKS].filter(x => x > 0))].sort((a, b) => a - b);
    m.innerHTML = `<div class="modal-box glass topup-box" role="dialog" aria-modal="true" aria-labelledby="tuTitle">
      <h2 id="tuTitle">💰 ${L('Пополнить баланс', 'Top up your balance')}</h2>
      ${why ? `<p class="tu-why">${why}</p>` : ''}
      ${typeof shopStarterHtml === 'function' ? shopStarterHtml('tu') : ''}
      <p class="shop-bal">${C2 ? L(`На счёте: <b>${money(C2.bank)}</b>`, `Balance: <b>${money(C2.bank)}</b>`) : L('У.е. зачислятся в карьеру — начните её, чтобы тратить.', 'The $ go to your career — start one to spend them.')}</p>
      <div class="tu-packs">${opts.map(x => `<button type="button" class="tu-pack${x === n ? ' on' : ''}" data-n="${x}">
        ${TOPUP_TAG[x] ? `<em class="shp-tag">${TOPUP_TAG[x]()}</em>` : ''}<b>${x} ${L('у.е.', '$')}</b><span>${rub(x)}</span><small>${x === need ? L('сколько не хватает', 'exactly what you lack') : rubPer(x) < 100 ? L(`−${100 - rubPer(x)}% · ${rubPer(x)} ₽/у.е.`, `−${100 - rubPer(x)}% · ${rubPer(x)} ₽ each`) : L('100 ₽/у.е.', '100 ₽ each')}</small></button>`).join('')}</div>
      <div class="tu-custom"><button type="button" class="btn-chip" id="tuMinus" aria-label="${L('Меньше', 'Less')}">−</button><span><b id="tuN">${n}</b> ${L('у.е.', '$')} = <b id="tuSum">${rub(n)}</b></span><button type="button" class="btn-chip" id="tuPlus" aria-label="${L('Больше', 'More')}">+</button></div>
      ${firstBonusOn() ? `<p class="shp-first">🎁 ${L('Первое пополнение: <b>+50% у.е. в подарок</b> — зачислим вместе с покупкой', 'First top-up: <b>+50% bonus $</b> — credited with your purchase')}</p>` : ''}
      <p class="tu-tiers">${L('Чем больше пополнение, тем дешевле: 10+ у.е. — 90 ₽, 25+ — 80 ₽, 50+ — 70 ₽, 100+ — 60 ₽ за 1 у.е.', 'The more you buy, the cheaper: 10+ — 90 ₽, 25+ — 80 ₽, 50+ — 70 ₽, 100+ — 60 ₽ per $1.')}</p>
      <label class="tu-agree"><input type="checkbox" id="tuAgree"> <span>${L('Согласен с <a href="oferta.html" target="_blank" rel="noopener">офертой</a> и <a href="politika.html" target="_blank" rel="noopener">политикой обработки персональных данных</a>', 'I accept the <a href="oferta.html" target="_blank" rel="noopener">public offer</a> and <a href="politika.html" target="_blank" rel="noopener">privacy policy</a> (in Russian)')}</span></label>
      <p class="join-err" id="tuErr" role="alert"></p>
      <button class="btn-main" type="button" id="tuPay">${L('Оплатить', 'Pay')} ${rub(n)}</button>
      <p class="tu-alt">${L('Или заработайте в игре: зарплата, премии за дедлайны, задания дня, награды за друзей.', 'Or earn it in the game: salary, deadline bonuses, daily quests, referral rewards.')}</p>
      ${adBtnHtml()}
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
      // Робокасса: счёт и подписанную ссылку на оплату выдаёт сервер (robokassa-pay); пароли магазина в браузер не попадают
      const btn = $('tuPay'); btn.disabled = true; btn.textContent = L('Переходим к оплате…', 'Opening the payment page…');
      (async () => {
        try {
          const r = await fnPost('robokassa-pay', { access_token: await board.accessToken(), ue: n, email: prefs.email || '' });
          if (!r?.url) throw new Error(r?.error || 'no url');
          store.set('vdp-pay-pending', { inv: r.inv_id, ue: n, at: Date.now() });
          location.href = r.url;
        } catch (e) {
          btn.disabled = false; btn.textContent = `${L('Оплатить', 'Pay')} ${rub(n)}`;
          $('tuErr').textContent = /not_configured/.test(e.message) ? L('Оплата картой появится совсем скоро. А пока у.е. можно заработать в игре.', 'Card payments are coming very soon. Meanwhile, earn $ in the game.')
            : /session/.test(e.message) ? L('Войдите в аккаунт ещё раз и повторите оплату.', 'Please sign in again and retry.')
            : L('Не удалось открыть оплату — попробуйте ещё раз.', 'Couldn’t open the payment page — please try again.');
        }
      })();
    };
  };
  render();
}

// ---------- Оплата голосами ВКонтакте (мини-приложение ВК) ----------
// Включается флагом vk.pay в js/config.js. Цены в голосах — на сервере (supabase/functions/vk-pay, VK_PRICES): игра берёт их
// GET-запросом; товара без цены нет в списке, пустой список — покупки в ВК нет (как раньше, «пока недоступны»).
// Покупка: VKWebAppShowOrderBox → ВК спрашивает у vk-pay товар и цену (get_item), после оплаты присылает order_status_change —
// сервер записывает оплаченную покупку, игра забирает её через claimPaid() (у.е. + подарки — как после Робокассы).
const VK_NO_PAY = () => L('Покупки в приложении ВКонтакте пока недоступны — играть можно бесплатно', 'Purchases aren’t available in the VK app yet — the game is free to play');
const vkPayOn = () => !!(window.VK_MINI && window.SUPABASE_CONFIG?.vk?.pay && typeof vkBridge === 'function' && board.online);
let vkPrices = null;  // { ue25: { votes, ue, product }, … } — только товары с ценой
async function vkPriceList() {
  if (!vkPayOn()) return {};
  if (vkPrices) return vkPrices;
  try {
    const r = await fetch(SOC_FN() + 'vk-pay?prices=1');
    const j = r.ok ? await r.json() : null;
    if (j && typeof j.items === 'object') vkPrices = j.items || {};
  } catch {}
  return vkPrices || {};  // не загрузилось — спросим ещё раз в следующий раз
}
const vkPrice = item => vkPrices?.[item]?.votes || 0;  // синхронно, для разметки магазина (0 — товара нет)
const votesStr = n => pl(n, 'голос', 'голоса', 'голосов', 'vote', 'votes');
if (window.VK_MINI) dataReady.then(() => setTimeout(() => vkPriceList(), 1500));  // заранее — чтобы магазин сразу показал товары ВК

async function vkBuy(item, btn) {
  if (!vkPayOn() || !vkPrice(item)) return toast(VK_NO_PAY());
  if (!(typeof registered === 'function' && registered())) {
    $('modal').hidden = true;
    return renderJoin('login', L('Чтобы купить, войдите в аккаунт — так покупка не потеряется и будет на всех устройствах.', 'Sign in to buy — so your purchase is safe and on every device.'));
  }
  track('buy_intent', { detail: `vk:${item}:${vkPrice(item)}` });
  const label = btn?.textContent; if (btn) btn.disabled = true;
  const it = vkPrices[item];
  store.set('vdp-pay-pending', { inv: 0, ue: it.ue, product: it.product, at: Date.now() });
  // окно оплаты ВК может быть открыто долго — ждём ответа до 10 минут
  const r = await vkBridge('VKWebAppShowOrderBox', { type: 'item', item }, 600e3);
  if (btn) { btn.disabled = false; btn.textContent = label; }
  if (r?.success || r?.status === 'success' || r?.order_id) {
    $('modal').hidden = true;
    toast(L('💰 Оплата прошла — зачисляем…', '💰 Payment received — crediting…'));
    setTimeout(() => claimPaid(5), 1500);  // уведомление ВК серверу может прийти на пару секунд позже
    return;
  }
  const code = r?.error_data?.error_code;
  if (code === 4 || r?.error_type === 'client_error' && /cancel/i.test(JSON.stringify(r?.error_data || ''))) return;  // игрок закрыл окно
  if (r === null) { setTimeout(() => claimPaid(3), 1500); return; }  // ответа нет — вдруг оплата всё же прошла
  track('vk_pay_fail', { detail: String(code || r?.error_type || '').slice(0, 40) });
  toast(L('Не удалось открыть оплату ВКонтакте — попробуйте ещё раз.', 'Couldn’t open VK payment — please try again.'));
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-vkitem]'); if (!b) return;
  e.preventDefault(); vkBuy(b.dataset.vkitem, b);
});

// Окно пополнения внутри ВК: пакеты у.е. с ценой в голосах
async function openVkTopup({ need = 0, why = '', then } = {}) {
  const items = await vkPriceList();
  const packs = TOPUP_PACKS.filter(n => items['ue' + n]?.votes > 0);
  if (!packs.length && !starterOn()) return toast(VK_NO_PAY());
  const m = $('modal'), C2 = careerNow(), close = () => { m.hidden = true; then?.(); };
  const best = packs.find(n => n >= need) || packs[packs.length - 1];
  // «Выгодно» — только если за 1 у.е. в этом пакете правда меньше голосов, чем в самом маленьком (цены задаёт владелец)
  const per = x => items['ue' + x].votes / x, vkTag = x => x === 25 && packs.length > 1 ? TOPUP_TAG[25]() : x === 100 && packs.length > 1 && per(100) < per(packs[0]) ? TOPUP_TAG[100]() : '';
  m.innerHTML = `<div class="modal-box glass topup-box" role="dialog" aria-modal="true" aria-labelledby="tuTitle">
    <h2 id="tuTitle">💰 ${L('Пополнить баланс', 'Top up your balance')}</h2>
    ${why ? `<p class="tu-why">${why}</p>` : ''}
    ${typeof shopStarterHtml === 'function' ? shopStarterHtml('tu') : ''}
    <p class="shop-bal">${C2 ? L(`На счёте: <b>${money(C2.bank)}</b>`, `Balance: <b>${money(C2.bank)}</b>`) : L('У.е. зачислятся в карьеру — начните её, чтобы тратить.', 'The $ go to your career — start one to spend them.')}</p>
    ${packs.length ? `<div class="tu-packs">${packs.map(x => `<button type="button" class="tu-pack${x === best ? ' on' : ''}" data-vkitem="ue${x}">
      ${vkTag(x) ? `<em class="shp-tag">${vkTag(x)}</em>` : ''}<b>${x} ${L('у.е.', '$')}</b><span>${votesStr(items['ue' + x].votes)}</span>${need && x >= need && x === best ? `<small>${L('хватит на покупку', 'covers what you lack')}</small>` : ''}</button>`).join('')}</div>` : ''}
    ${packs.length && firstBonusOn() ? `<p class="shp-first">🎁 ${L('Первое пополнение: <b>+50% у.е. в подарок</b> — зачислим вместе с покупкой', 'First top-up: <b>+50% bonus $</b> — credited with your purchase')}</p>` : ''}
    <p class="tu-alt">${L('Оплата голосами ВКонтакте. Или заработайте в игре: зарплата, премии за дедлайны, задания дня, награды за друзей.', 'Paid with VK votes. Or earn it in the game: salary, deadline bonuses, daily quests, referral rewards.')}</p>
    <button class="btn-ghost" type="button" id="tuClose">${L('Не сейчас', 'Not now')}</button></div>`;
  m.hidden = false;
  $('tuClose').onclick = close;
}

// Любая кнопка с data-topup="N" (сколько не хватает) открывает пополнение; data-topup-why — пояснение, data-topup-back — что открыть после
document.addEventListener('click', e => {
  const b = e.target.closest('[data-topup]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const back = { shop: () => openShop(), heroShop: () => heroShop(), heroAsk: () => heroAsk(), desk: () => openDesk(), tools: () => cardTools(), goods: () => goodsReopen?.(), kid: () => kidReopen?.(), kidWish: () => kidWishBack?.(), pet: () => petReopen?.(), petWish: () => petWishBack?.() }[b.dataset.topupBack];
  openTopup({ need: +b.dataset.topup || 0, why: b.dataset.topupWhy || '', then: back });
}, true);
// Кнопка «нет денег» → «пополнить»: html-кусок для вставки рядом с ценой
const topupBtn = (need, back, why = '', cls = 'btn-chip tu-btn') => `<button type="button" class="${cls}" data-topup="${need}" data-topup-back="${back || ''}" data-topup-why="${esc(why)}">💰 ${need ? L(`Не хватает ${need} — пополнить`, `$${need} short — top up`) : L('Пополнить', 'Top up')}</button>`;

// ---------- зачисление оплаченных у.е. ----------
// Робокасса подтверждает оплату серверу (robokassa-result), а игра забирает у.е. на счёт карьеры (claim_purchases):
// сразу после возврата со страницы оплаты (?pay=ok) и при каждом запуске — если игрок закрыл вкладку до возврата
async function claimPaid(again = 0) {
  if (!(typeof registered === 'function' && registered()) || !board.online) return;
  try {
    // claim_purchases2 — список [{inv, ue, bonus, product}] (supabase/update-2026-11-01-shop.sql); пока миграции нет — старая функция
    let rows = await board.rpc('claim_purchases2', {}).catch(() => null);
    if (!Array.isArray(rows)) { const n0 = Number(await board.rpc('claim_purchases', {})) || 0; rows = n0 > 0 ? [{ ue: n0, bonus: 0, product: null }] : []; }
    const n = rows.reduce((s2, r) => s2 + (Number(r.ue) || 0) + (Number(r.bonus) || 0), 0), bonus = rows.reduce((s2, r) => s2 + (Number(r.bonus) || 0), 0);
    if (rows.length) {
      if (n > 0) addCash(n);
      prefs.paidUser = true; store.set(KEY.prefs, prefs);
      for (const r of rows) if (r.product && typeof shopGrantProduct === 'function') shopGrantProduct(r.product);
      const pend = store.get('vdp-pay-pending', null); store.del('vdp-pay-pending');
      // электронная коммерция Метрики считает в рублях — покупки за голоса ВК туда не пишем
      if (!window.VK_MINI) try { (window.dataLayer = window.dataLayer || []).push({ ecommerce: { currencyCode: 'RUB', purchase: { actionField: { id: String(pend?.inv || Date.now()) }, products: rows.map(r => r.product ? { id: r.product, name: r.product, price: r.product === 'coffee' ? 100 : 149, quantity: 1 } : { id: 'ue', name: L('Игровая валюта, у.е.', 'In-game currency'), price: rubPer(r.ue), quantity: r.ue }) } } }); } catch {}
      sfx.coins?.(); confetti?.();
      if (rows.every(r => r.product === 'coffee')) toast(L(`☕ Спасибо за кофе! +${money(n)} на счёт`, `☕ Thanks for the coffee! +${money(n)}`));
      else toast(rows.some(r => r.product === 'starter') ? L(`🎁 Стартовый набор получен: +${money(n)} на счёт и подарки. Спасибо!`, `🎁 Starter pack received: +${money(n)} and gifts. Thank you!`)
        : bonus ? L(`💰 Оплата прошла: +${money(n)} на счёт (из них ${money(bonus)} — подарок за первое пополнение). Спасибо!`, `💰 Payment received: +${money(n)} (incl. ${money(bonus)} first top-up bonus). Thank you!`)
        : L(`💰 Оплата прошла: +${money(n)} на счёт. Спасибо!`, `💰 Payment received: +${money(n)}. Thank you!`));
      track('purchase', { detail: rows.map(r => r.product || `${r.ue}${r.bonus ? '+' + r.bonus : ''}`).join(',').slice(0, 60) });
      if (!views.menu.hidden) renderMenu();
    } else if (again > 0) setTimeout(() => claimPaid(again - 1), 4000);  // уведомление Робокассы может прийти на несколько секунд позже
  } catch {}
}
(() => {
  const q = new URLSearchParams(location.search), pay = q.get('pay');
  if (pay) history.replaceState(null, '', location.pathname + location.hash);
  if (pay === 'fail') setTimeout(() => toast(L('Оплата не завершена — деньги не списаны. Можно попробовать ещё раз.', 'Payment not completed — you weren’t charged. You can try again.')), 1500);
  const pend = store.get('vdp-pay-pending', null);
  setTimeout(() => claimPaid(pay === 'ok' || (pend && Date.now() - pend.at < 3600e3) ? 5 : 0), 2500);
})();
