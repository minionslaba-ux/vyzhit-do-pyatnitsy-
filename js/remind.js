// Напоминания: предложить включить их чаще и там, где они реально работают. Данные 2026-11: 3 подписки на ~45 активных,
// окно при входе показалось 1 раз; половина игроков — iPhone в Safari, где веб-пуши недоступны без установки на экран «Домой».
//  • после любой недели (не только выигранной) — карточка на экране итогов, не чаще раза в 2 дня, пока напоминания не включены;
//  • канал подбирается сам: пуши браузера (Android, компьютер, приложение RuStore) → иначе бот Telegram (iPhone, отказ в пушах);
//  • бонус +5 у.е. за включение — один раз (любой канал, в том числе кнопками в профиле);
//  • ?startapp=remind в Telegram — включить сразу (js/app.js → remindTgOn).
const REMIND_BONUS = 5, REMIND_GAP = 2 * 864e5;
const remindActive = () => (typeof pushOn === 'function' && pushOn()) || !!prefs.tgRemind || (window.VK_MINI && !!prefs.vkRemind) || (window.MAX_APP && !!prefs.maxRemind);
const remindAllowed = () => !window.VDP_PLATFORM && board.online && !!prefs.name;
function remindGrant() {
  if (prefs.remindBonus || !remindActive() || window.VK_MINI) return;  // ВК: без бонуса за согласие на уведомления (правила VK Mini Apps 2.6)
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
  if (window.VK_MINI) return 'vk';
  if (window.MAX_APP) return 'max';
  if (TG) return 'tg-here';
  const c = typeof pushCan === 'function' ? pushCan() : '';
  if (c === 'ok' && Notification.permission !== 'denied') return 'push';
  return 'tg-open';
}
// ВК и MAX: напоминание приходит от самой площадки (уведомление мини-приложения / сообщение бота) — сервер msg-remind, отправка tg-daily
async function msgRemindCall(enable) {
  const body = window.VK_MINI ? { via: 'vk', params: location.search } : { via: 'max', init: window.WebApp?.initData || window.MAX_INIT || '' };
  const j = await fnPost('msg-remind', { ...body, enable, lang: LANG, player_id: prefs.playerId });
  return !!j.enabled;
}
async function msgRemindSet(on) {
  try {
    if (window.VK_MINI) {
      const r = await vkBridge(on ? 'VKWebAppAllowNotifications' : 'VKWebAppDenyNotifications', {}, 60000);
      if (on && !r?.result) { toast(L('Уведомления не разрешены — включить можно позже в профиле', 'Notifications not allowed — you can turn them on later in your profile')); return false; }
    }
    const v = await msgRemindCall(on);
    prefs[window.VK_MINI ? 'vkRemind' : 'maxRemind'] = v; store.set(KEY.prefs, prefs);
    toast(v ? L('🔔 Готово: раз в день напомним о неделе дня и разминке', '🔔 Done: we’ll remind you once a day about the Daily Week and a break') : L('Напоминания выключены', 'Reminders off'));
    if (v) remindGrant();
    track('remind_msg', { detail: `${window.VK_MINI ? 'vk' : 'max'}:${v ? 'on' : 'off'}` });
    return v;
  } catch (e) { toast(L('Не получилось — попробуйте позже', 'Didn’t work — try again later')); return false; }
}
function remindCardHtml() {
  const ch = remindChannel(), bonus = prefs.remindBonus || ch === 'vk' ? '' : ` <b>+${money(REMIND_BONUS)}</b>`;
  if (ch === 'vk' || ch === 'max') return `<div class="remind-card"><b>${L('Не пропустите неделю дня', 'Don’t miss the Daily Week')}</b>
    <small>${ch === 'vk' ? L('Раз в день — уведомление ВКонтакте о неделе дня и разминке. Выключить можно в профиле игры.', 'Once a day — a VK notification about the Daily Week and a break. Turn off anytime in your profile.')
      : L('Раз в день бот игры напишет в MAX о неделе дня и разминке. Выключить можно в профиле игры.', 'Once a day the game bot messages you in MAX about the Daily Week and a break. Turn off anytime in your profile.')}</small>
    <button type="button" class="btn-main" data-remind="${ch}">🔔 ${ch === 'vk' ? L('Напоминать во ВКонтакте', 'Remind me on VK') : L('Напоминать в MAX', 'Remind me in MAX')}${bonus}</button>
    <span class="remind-alt"><button type="button" class="btn-link" data-remind="no">${L('Не сейчас', 'Not now')}</button></span></div>`;
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
  if (a === 'vk' || a === 'max') { if (await msgRemindSet(true)) card?.remove(); return; }
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
  if (Date.now() - (prefs.remindAskAt || 0) < (window.VK_MINI ? 30 * 864e5 : REMIND_GAP)) return;  // ВК: повторное предложение — не чаще раза в месяц (правила 2.6.3)
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
