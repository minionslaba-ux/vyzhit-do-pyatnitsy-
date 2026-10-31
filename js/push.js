// Пуш-уведомления: 1–3 напоминания в день (утро, день, вечер) из 500 текстов — рассылает сервер (push-send по расписанию).
// Включает сам игрок одной кнопкой: телефон спросит разрешение (без этого браузеры пуши не пропускают). Отказ — больше не спрашиваем.
// Где работает: Android и компьютеры — в браузере; iPhone (iOS 16.4+) — только если игра добавлена на экран «Домой».
// В Telegram Mini App и на игровых платформах выключено: там свои напоминания (бот).
const PUSH_FN = () => (window.SUPABASE_CONFIG?.url || '').replace(/\/+$/, '') + '/functions/v1/push-subscribe';
const pushIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const pushStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
// 'ok' — можно включить; 'ios' — iPhone в обычной вкладке (нужно добавить на экран «Домой»); '' — недоступно
const pushCan = () => {
  if (window.VDP_PLATFORM || window.Telegram?.WebApp?.initData || !window.SUPABASE_CONFIG?.push?.pub) return '';
  if (pushIOS && !pushStandalone()) return 'ios';
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window ? 'ok' : '';
};
const pushOn = () => pushCan() === 'ok' && Notification.permission === 'granted' && !!prefs.push;
const b64key = s => { const p = '='.repeat((4 - s.length % 4) % 4), raw = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, c => c.charCodeAt(0)); };

async function pushSave(sub) {
  await fetch(PUSH_FN(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG.anonKey },
    body: JSON.stringify({ action: 'on', sub: sub.toJSON(), player_id: prefs.playerId || null, lang: EN ? 'en' : 'ru' }) });
}
async function pushEnable() {
  if (pushCan() === 'ios') return pushIosHelp();
  if (pushCan() !== 'ok') return;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { prefs.pushAsked = 'denied'; store.set(KEY.prefs, prefs); pushRender(); return toast(L('Напоминания выключены. Включить можно в настройках браузера.', 'Reminders are off. You can turn them on in browser settings.')); }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64key(window.SUPABASE_CONFIG.push.pub) });
    await pushSave(sub);
    prefs.push = true; prefs.pushAsked = 'on'; store.set(KEY.prefs, prefs);
    track('push_on'); sfx.item?.();
    toast(L('🔔 Готово! Будем напоминать 1–3 раза в день', '🔔 Done! We’ll remind you 1–3 times a day'));
  } catch { toast(L('Не получилось включить напоминания — попробуйте ещё раз', 'Couldn’t turn on reminders — please try again')); }
  pushRender();
}
async function pushDisable() {
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (sub) { await fetch(PUSH_FN(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG.anonKey }, body: JSON.stringify({ action: 'off', endpoint: sub.endpoint }) }).catch(() => {}); await sub.unsubscribe(); }
  } catch {}
  prefs.push = false; store.set(KEY.prefs, prefs); track('push_off');
  toast(L('🔕 Напоминания выключены', '🔕 Reminders off')); pushRender();
}
function pushIosHelp() {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="piTitle"><span class="lvl-ico" aria-hidden="true">🔔</span>
    <h2 id="piTitle">${L('Напоминания на iPhone', 'Reminders on iPhone')}</h2>
    <p>${L('На iPhone уведомления работают, когда игра установлена на экран «Домой»:', 'On iPhone, notifications work once the game is on your Home Screen:')}</p>
    <ol class="lw-list"><li>${L('Нажмите «Поделиться» <b>⬆️</b> внизу Safari', 'Tap Share <b>⬆️</b> at the bottom of Safari')}</li><li>${L('Выберите «На экран „Домой“»', 'Choose “Add to Home Screen”')}</li><li>${L('Откройте игру со значка и нажмите «🔔 Напоминать мне играть»', 'Open the game from the icon and tap “🔔 Remind me to play”')}</li></ol>
    <button class="btn-main" type="button" id="piOk">${L('Понятно', 'Got it')}</button></div>`;
  m.hidden = false; $('piOk').onclick = () => { m.hidden = true; };
}

// Кнопка: в «Моём профиле» всегда, на экране итогов недели — один раз
const pushBtnHtml = (cls = 'btn-ghost btn-push') => {
  const c = pushCan(); if (!c) return '';
  if (c === 'ok' && Notification.permission === 'denied') return '';
  return pushOn() ? `<button type="button" class="${cls}" data-push="off">🔕 ${L('Выключить напоминания', 'Turn off reminders')}</button>`
    : `<button type="button" class="${cls}" data-push="on">🔔 ${L('Напоминать мне играть', 'Remind me to play')}</button>`;
};
function pushRender() { const s = $('pushSlot'); if (s) s.innerHTML = pushBtnHtml(); }
document.addEventListener('click', e => { const b = e.target.closest('[data-push]'); if (!b) return; b.dataset.push === 'off' ? pushDisable() : pushEnable(); });
bus.on('weekEnd', x => {
  if (!x.won || prefs.pushAsked || pushOn() || !pushCan()) return;
  setTimeout(() => {
    const st = views.end.querySelector('.end-sheet .stack'); if (!st || views.end.hidden || st.querySelector('[data-push]')) return;
    prefs.pushAsked = 'shown'; store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML('afterbegin', pushBtnHtml('btn-main btn-push'));
  }, 1500);
});
// при запуске: кнопка в профиле; включённую подписку обновляем на сервере (браузер мог её сменить; привязка к игроку)
setTimeout(async () => {
  pushRender();
  if (!pushOn()) return;
  try { const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription(); if (sub) await pushSave(sub); else { prefs.push = false; store.set(KEY.prefs, prefs); pushRender(); } } catch {}
}, 3000);
