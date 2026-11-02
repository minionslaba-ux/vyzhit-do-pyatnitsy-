// Напоминания: предложить включить их чаще и там, где они реально работают. Данные 2026-11: 3 подписки на ~45 активных,
// окно при входе показалось 1 раз; половина игроков — iPhone в Safari, где веб-пуши недоступны без установки на экран «Домой».
//  • после любой недели (не только выигранной) — карточка на экране итогов, не чаще раза в 2 дня, пока напоминания не включены;
//  • канал подбирается сам: пуши браузера (Android, компьютер, приложение RuStore) → иначе бот Telegram (iPhone, отказ в пушах);
//  • бонус +5 у.е. за включение — один раз (любой канал, в том числе кнопками в профиле);
//  • ?startapp=remind в Telegram — включить сразу (js/app.js → remindTgOn).
const REMIND_BONUS = 5, REMIND_GAP = 2 * 864e5;
const remindActive = () => (typeof pushOn === 'function' && pushOn()) || !!prefs.tgRemind;
const remindAllowed = () => !window.VDP_PLATFORM && !window.VK_MINI && board.online && !!prefs.name;
function remindGrant() {
  if (prefs.remindBonus || !remindActive()) return;
  prefs.remindBonus = 1; store.set(KEY.prefs, prefs);
  const now = addCash(REMIND_BONUS);
  setTimeout(() => toast(L(`🔔 Напоминания включены — +${money(REMIND_BONUS)}${now ? '' : ' (придут в карьеру)'}`, `🔔 Reminders on — +${money(REMIND_BONUS)}${now ? '' : ' (goes to your career)'}`)), 700);
  track('remind_bonus');
}
async function remindTgOn() {
  if (!TG || typeof tgCall !== 'function') return;
  try { const on = await tgCall(true); prefs.tgRemind = on; store.set(KEY.prefs, prefs); if (on) { toast(L('Готово: бот будет напоминать о неделе дня в 12:30', 'Done: the bot will remind you about the Daily Week at 12:30')); remindGrant(); } }
  catch (e) { toast(e.message); }
}
// Какой канал предложить: 'tg-here' (мы в Telegram), 'push' (браузер умеет), 'tg-open' (iPhone в Safari / пуши запрещены)
function remindChannel() {
  if (TG) return 'tg-here';
  const c = typeof pushCan === 'function' ? pushCan() : '';
  if (c === 'ok' && Notification.permission !== 'denied') return 'push';
  return 'tg-open';
}
function remindCardHtml() {
  const ch = remindChannel(), bonus = prefs.remindBonus ? '' : ` <b>+${money(REMIND_BONUS)}</b>`;
  const main = ch === 'push' ? `<button type="button" class="btn-main" data-remind="push">🔔 ${L('Напоминать мне', 'Remind me')}${bonus}</button>`
    : `<button type="button" class="btn-main btn-tg" data-remind="tg">🔔 ${L('Напоминать в Telegram', 'Remind me in Telegram')}${bonus}</button>`;
  const alt = ch === 'push' ? `<button type="button" class="btn-link" data-remind="tg">${L('или в Telegram', 'or in Telegram')}</button>`
    : (typeof pushIOS !== 'undefined' && pushIOS && typeof pushIosHelp === 'function') ? `<button type="button" class="btn-link" data-remind="ios">${L('или уведомления на iPhone', 'or iPhone notifications')}</button>` : '';
  return `<div class="remind-card"><b>${L('Не пропустите неделю дня', 'Don’t miss the Daily Week')}</b>
    <small>${L('Раз в день — неделя дня, бонусы и сообщения от коллег. Выключить можно в любой момент.', 'Once a day — the Daily Week, bonuses and coworker messages. Turn off anytime.')}</small>
    ${main}<span class="remind-alt">${alt}<button type="button" class="btn-link" data-remind="no">${L('Не сейчас', 'Not now')}</button></span></div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-remind]'); if (!b) return;
  const a = b.dataset.remind, card = b.closest('.remind-card');
  track('remind_click', { detail: a });
  if (a === 'no') { card?.remove(); return; }
  if (a === 'ios') return pushIosHelp();
  if (a === 'push') { await pushEnable(); if (pushOn()) { card?.remove(); remindGrant(); } return; }
  if (a === 'tg') {
    if (TG) { await remindTgOn(); if (prefs.tgRemind) card?.remove(); return; }
    toast(L('Откроем игру в Telegram — напоминание включится само', 'Opening the game in Telegram — the reminder turns on by itself'));
    setTimeout(() => { location.href = 'https://t.me/Survivefridaybot?startapp=remind'; }, 900);
  }
});
// После любой недели: карточка на экране итогов (не чаще раза в 2 дня)
bus.on('weekEnd', () => {
  if (!remindAllowed() || remindActive() || prefs.remindNever) return;
  if (Date.now() - (prefs.remindAskAt || 0) < REMIND_GAP) return;
  setTimeout(() => {
    const st = views.end.querySelector('.end-sheet > .stack'); if (!st || views.end.hidden || views.end.querySelector('.remind-card, [data-push]')) return;
    prefs.remindAskAt = Date.now(); store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML('beforebegin', remindCardHtml()); track('remind_ask', { detail: remindChannel() });
  }, 1600);
});
// Меню: бонус за напоминания, включённые кнопками в профиле; окно «Включить напоминания?» — не только раз при запуске
bus.on('menu', () => {
  remindGrant();
  if (typeof pushAskOnEntry === 'function') setTimeout(pushAskOnEntry, 2500);
});
