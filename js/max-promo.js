// Приглашение подписаться на канал игры в MAX: всплывающее окно в меню.
// Только русская версия, не в самом MAX и не в Telegram. Не чаще раза в 5 дней, не больше 3 раз;
// после «Подписаться» или «Больше не показывать» — никогда. Окно — только если другое не открыто.
const MAX_CH = 'https://max.ru/se14877440_biz';
const MAXP_GAP = 5 * 864e5, MAXP_MAX = 3;
function maxPromoDue() {
  if (EN || window.MAX_APP || TG || window.VDP_PLATFORM || window.VK_MINI) return false;  // ВК: правила VK Mini Apps 4.1.8 / 4.2.6 — без других платформ
  if ((prefs.gamesPlayed || 0) < 3 || (typeof guestLocked === 'function' && guestLocked())) return false;
  const p = prefs.maxPromo || {};
  return !p.done && (p.n || 0) < MAXP_MAX && Date.now() - (p.last || 0) > MAXP_GAP;
}
function openMaxPromo(src = 'auto') {
  const m = $('modal'); if (!m) return;
  const p = prefs.maxPromo = prefs.maxPromo || {};
  if (src === 'auto') { p.n = (p.n || 0) + 1; p.last = Date.now(); savePrefs(); }
  m.innerHTML = `<div class="modal-box glass maxp-box" role="dialog" aria-modal="true" aria-labelledby="maxpTitle">
    <img class="maxp-logo" src="icons/max.png" width="64" height="64" alt="MAX">
    <h2 id="maxpTitle">${L('Канал игры в MAX', 'Our MAX channel')}</h2>
    <p>${L('Новые разминки, «Неделя дня» и офисные ситуации — каждый день. А по кнопке «Играть» игра открывается прямо в MAX, без регистрации.', 'New breaks, the Daily Week and office situations every day. The Play button opens the game right in MAX, no sign-up.')}</p>
    <a class="btn-main btn-max" id="maxpGo" href="${MAX_CH}" target="_blank" rel="noopener"><img src="icons/max.png" alt="" width="22" height="22"> ${L('Подписаться в MAX', 'Join on MAX')}</a>
    <button class="btn-ghost" type="button" id="maxpLater">${L('Позже', 'Later')}</button>
    <button class="maxp-never" type="button" id="maxpNever">${L('Больше не показывать', 'Don’t show again')}</button></div>`;
  m.hidden = false;
  $('maxpGo').onclick = () => { p.done = 1; savePrefs(); track('max_promo_go', { detail: src }); setTimeout(() => { m.hidden = true; }, 300); };
  $('maxpLater').onclick = () => { m.hidden = true; };
  $('maxpNever').onclick = () => { p.done = 1; savePrefs(); track('max_promo_never'); m.hidden = true; };
  track('max_promo_show', { detail: src });
}
bus.on('menu', () => {
  if (!maxPromoDue()) return;
  setTimeout(() => {  // меню успело отрисоваться; другое окно открыто — в другой раз
    const m = $('modal');
    if (!maxPromoDue() || !m || !m.hidden || views?.menu?.hidden) return;
    openMaxPromo();
  }, 1500);
});
