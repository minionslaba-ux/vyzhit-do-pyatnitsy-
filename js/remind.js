// Напоминания: предложить включить их чаще и там, где они реально работают. Данные 2026-11: 3 подписки на ~45 активных,
// окно при входе показалось 1 раз; половина игроков — iPhone в Safari, где веб-пуши недоступны без установки на экран «Домой».
//  • после любой недели (не только выигранной) — карточка на экране итогов, не чаще раза в 2 дня, пока напоминания не включены;
//  • канал подбирается сам: пуши браузера (Android, компьютер, приложение RuStore) → иначе бот Telegram (iPhone, отказ в пушах);
//  • бонус +5 у.е. за включение — один раз (любой канал, в том числе кнопками в профиле);
//  • ?startapp=remind в Telegram — включить сразу (js/app.js → remindTgOn).
const REMIND_BONUS = 5, REMIND_GAP = 2 * 864e5;
const remindActive = () => (typeof pushOn === 'function' && pushOn()) || !!prefs.tgRemind || (window.VK_MINI && !!prefs.vkRemind) || (window.MAX_APP && !!prefs.maxRemind);
const remindAllowed = () => !window.VDP_PLATFORM && board.online && !!prefs.name && !(window.RUSTORE && remindChannel() === 'tg-open');  // RuStore: в Telegram из приложения не уводим
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
  const a = b.dataset.remind, card0 = b.closest('.remind-card');
  // карточка в окне (после первой выигранной недели) — закрываем окно целиком
  const card = card0 && { remove: () => { if (card0.closest('#modal')) $('modal').hidden = true; card0.remove(); } };
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
// После первой выигранной недели — один раз окно в меню (карточку на экране итогов часто пролистывают: 1 показ на 11 недель за 2–9 ноября)
let remindWinPending = false;
bus.on('weekEnd', x => { if (x.won && !prefs.remindWinAsked && remindAllowed() && !remindActive() && !prefs.remindNever) remindWinPending = true; });
bus.on('menu', () => {
  if (!remindWinPending) return;
  setTimeout(() => {
    const m = $('modal');
    if (!remindWinPending || !m.hidden || views.menu.hidden || remindActive()) return;
    if (window.VK_MINI && Date.now() - (prefs.remindAskAt || 0) < 30 * 864e5) return;  // ВК: не чаще раза в месяц (правила 2.6.3)
    remindWinPending = false; prefs.remindWinAsked = 1; prefs.remindAskAt = Date.now(); store.set(KEY.prefs, prefs);
    m.innerHTML = `<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="rwTitle"><span class="lvl-ico" aria-hidden="true">🎉</span>
      <h2 id="rwTitle">${L('Неделя пройдена!', 'Week survived!')}</h2>
      <p>${L('Чтобы не терять серию, включите напоминание — раз в день, про неделю дня и разминку.', 'To keep your streak going, turn on a reminder — once a day, about the Daily Week and a break.')}</p>
      ${remindCardHtml()}</div>`;
    m.hidden = false;
    track('remind_ask', { detail: 'win-' + remindChannel() });
  }, 1800);
});
// Меню: бонус за напоминания, включённые кнопками в профиле; окно «Включить напоминания?» — не только раз при запуске
bus.on('menu', () => {
  remindGrant();
  if (typeof pushAskOnEntry === 'function') setTimeout(pushAskOnEntry, 2500);
});

// Второй мессенджер для напоминаний: в Telegram — «Напоминать в MAX», в MAX — «Напоминать в Telegram».
// Кнопка открывает игру в другом мессенджере с меткой remind — там напоминание включается само (Telegram: js/app.js → remindTgOn; MAX: ниже)
const REMIND2 = { max: 'https://max.ru/se14877440_bot?startapp=remind', tg: 'https://t.me/Survivefridaybot?startapp=remind' };
bus.on('menu', () => {
  const b = $('remind2'); if (!b) return;
  const to = TG ? 'max' : window.MAX_APP ? 'tg' : '';
  b.hidden = !to || EN || !board.online; if (b.hidden) return;
  b.textContent = to === 'max' ? L('🔔 Напоминать в MAX', '🔔 Remind me in MAX') : L('🔔 Напоминать в Telegram', '🔔 Remind me in Telegram');
  b.onclick = () => {
    track('remind_click', { detail: 'other-' + to });
    toast(to === 'max' ? L('Откроем игру в MAX — напоминание включится само', 'Opening the game in MAX — the reminder turns on by itself') : L('Откроем игру в Telegram — напоминание включится само', 'Opening the game in Telegram — the reminder turns on by itself'));
    setTimeout(() => {
      if (TG?.openLink) TG.openLink(REMIND2[to]);
      else if (window.WebApp?.openLink) window.WebApp.openLink(REMIND2[to]);
      else location.href = REMIND2[to];
    }, 700);
  };
});
// MAX, открытый по ссылке с меткой remind: включить напоминания в MAX, как только игрок вошёл (один раз за запуск)
if (window.MAX_APP) dataReady.then(() => setTimeout(() => {
  let sp = ''; try { sp = window.WebApp?.initDataUnsafe?.start_param || new URLSearchParams(window.WebApp?.initData || window.MAX_INIT || '').get('start_param') || ''; } catch {}
  if (!/(^|_)remind/.test(sp) || prefs.maxRemind || !board.online) return;
  try { if (sessionStorage.getItem('vdp-max-remind')) return; } catch {}
  if (!(typeof registered === 'function' && registered())) return;  // вход ещё идёт — после перезагрузки попробуем снова
  try { sessionStorage.setItem('vdp-max-remind', '1'); } catch {}
  msgRemindSet(true);
}, 3500));
