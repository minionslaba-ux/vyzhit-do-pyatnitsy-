// Игра без регистрации: бесплатно — 4 недели (в любых режимах). Дальше — бесплатная регистрация
// или платная игра без аккаунта: 0,5 у.е. за каждую новую неделю с игрового счёта карьеры.
// Продолжение уже начатой недели не списывает. На игровых платформах (Яндекс Игры и т. п.) не действует.
const GUEST_FREE = 4, GUEST_PRICE = 0.5;
const guestLocked = () => !window.VDP_PLATFORM && !registered() && (prefs.gamesPlayed || 0) >= GUEST_FREE;
function guestGate(go) {
  if (!guestLocked()) return go();
  const C2 = careerNow(), bank = C2?.bank ?? 0, can = bank >= GUEST_PRICE, m = $('modal');
  track('guest_gate', { detail: String(prefs.gamesPlayed || 0) });
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="ggTitle"><span class="lvl-ico" aria-hidden="true">🔒</span>
    <h2 id="ggTitle">${L(`${GUEST_FREE} бесплатные недели позади`, `Your ${GUEST_FREE} free weeks are up`)}</h2>
    <p>${L(`Без регистрации можно сыграть ${GUEST_FREE} недели. Зарегистрируйтесь — это бесплатно и займёт минуту: прогресс, персонаж и деньги сохранятся на всех устройствах.`, `Without an account you can play ${GUEST_FREE} weeks. Sign up — it’s free and takes a minute: your progress, character and money are kept on every device.`)}</p>
    <button class="btn-main" type="button" id="ggReg">✅ ${L('Зарегистрироваться бесплатно', 'Sign up for free')}</button>
    <p class="field-note">${L(`Или играйте без аккаунта: ${money(GUEST_PRICE)} за каждую неделю с игрового счёта (сейчас на счёте ${money(bank)}).`, `Or keep playing without an account: ${money(GUEST_PRICE)} per week from your in-game balance (you have ${money(bank)}).`)}</p>
    ${can ? `<button class="btn-ghost" type="button" id="ggPay">${L(`Сыграть неделю за ${money(GUEST_PRICE)}`, `Play a week for ${money(GUEST_PRICE)}`)}</button>` : `<p class="join-err">${L('На игровом счёте не хватает у.е.', 'Not enough $ in your balance')}</p>`}
    <button class="btn-link" type="button" id="ggBack">${L('В меню', 'Main menu')}</button></div>`;
  m.hidden = false;
  $('ggReg').onclick = () => { m.hidden = true; renderJoin('register', L('Регистрация бесплатна. После неё игра продолжится без ограничений.', 'Signing up is free. After that you can play with no limits.')); };
  if ($('ggPay')) $('ggPay').onclick = () => {
    const c = careerNow(); c.bank -= GUEST_PRICE; c.spent = (c.spent || 0) + GUEST_PRICE; careerSave(c);
    track('guest_pay', { detail: String(GUEST_PRICE) });
    m.hidden = true; toast(L(`Неделя оплачена: −${money(GUEST_PRICE)} · на счёте ${money(c.bank)}`, `Week paid: −${money(GUEST_PRICE)} · balance ${money(c.bank)}`));
    go();
  };
  $('ggBack').onclick = () => { m.hidden = true; renderMenu(); };
}
// Новая неделя в любом режиме проходит через проверку
for (const name of ['startWeek', 'startDaily', 'startPack', 'startTournament']) {
  const orig = window[name]; if (typeof orig !== 'function') continue;
  window[name] = function (...a) { return guestGate(() => orig.apply(this, a)); };
}
