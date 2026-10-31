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
    track('push_on'); sfx.item?.(); setTimeout(() => { pushStateLast = ''; pushStateSend(); }, 500);  // сразу — для личных напоминаний
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

// ---------- личные напоминания: что сейчас у игрока (персонаж, питомцы, дети, карьера) ----------
// Отправляем на сервер, только если напоминания включены; сервер подставит имена в 500 личных шаблонов
const lc = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : '';
function pushStateNow() {
  const C2 = careerNow(), h = C2?.hero; if (!C2) return null;
  const n = h?.pending && typeof NEEDS !== 'undefined' && NEEDS.find(x => x.id === h.pending);
  const pets = h?.pets || [], hungry = pets.find(p => p.last?.p_food !== C2.week), pet = hungry || pets[0];
  const kids = h?.kids || [], kidW = kids.map(k => ({ k, w: typeof kidWants === 'function' ? kidWants(k)[0] : null })).find(x => x.w);
  return {
    hero: h?.name || '', g: h && heroFem(h) ? 'f' : 'm', need: n ? lc(needText(n, h, 't')) : '', mood: h?.mood ?? null, breaks: h?.breaks || 0,
    pet: pet?.name || '', petHungry: !!hungry, kid: kidW?.k.name || kids[0]?.name || '', kidWant: kidW ? lc(kidW.w.t) : '',
    week: Math.min(C2.week, YEAR), company: C2.stage === 'work' ? C2.company : '', bank: C2.bank, certReady: typeof certCan === 'function' && certCan(C2),
    streak: Math.max(typeof dayStreakNow === 'function' ? dayStreakNow() : 0, typeof streakNow === 'function' ? streakNow() : 0),  // серия входов (js/streak.js) или недели дня
  };
}
let pushStateLast = '';
async function pushStateSend() {
  if (!pushOn()) return;
  const st = pushStateNow(); if (!st) return;
  const key = JSON.stringify(st); if (key === pushStateLast) return; pushStateLast = key;
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription(); if (!sub) return;
    await fetch(PUSH_FN(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG.anonKey }, body: JSON.stringify({ action: 'state', endpoint: sub.endpoint, state: st }) });
  } catch {}
}
bus.on('menu', () => setTimeout(pushStateSend, 1500));
bus.on('weekEnd', () => setTimeout(pushStateSend, 4000));

// Открыли игру из пуша о сообщении или приглашении — сразу туда
(() => {
  const q = new URLSearchParams(location.search), open = q.get('open'); if (!open) return;
  q.delete('open'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  if (open === 'dm') setTimeout(() => { if (typeof showDmInbox === 'function' && views.game.hidden) showDmInbox(); }, 2500);
})();

// ---------- предложение при входе ----------
// Системный запрос разрешения браузеры показывают только по нажатию — поэтому при входе наше окно с кнопкой «Включить».
// Не новичкам (после первой недели), «Позже» — снова не раньше чем через 3 дня, «Не спрашивать» — никогда; не поверх других окон
const PUSH_ASK_GAP = 3 * 864e5;
function pushAskOnEntry() {
  if (pushOn() || prefs.pushNever || !(prefs.gamesPlayed >= 1) || !prefs.name) return;
  if (pushCan() !== 'ok' || Notification.permission !== 'default') return;
  if (Date.now() - (prefs.pushAskAt || 0) < PUSH_ASK_GAP || views.menu.hidden || !$('modal').hidden) return;
  prefs.pushAskAt = Date.now(); store.set(KEY.prefs, prefs);
  const h = careerNow()?.hero, m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="paTitle2"><span class="lvl-ico" aria-hidden="true">🔔</span>
    <h2 id="paTitle2">${L('Включить напоминания?', 'Turn on reminders?')}</h2>
    <p>${h ? L(`Подскажем, когда ${esc(h.name)} чего-то захочет, питомцы проголодаются, придёт сообщение от коллеги или бонус +15 у.е. — 1–3 раза в день, не чаще.`, `We’ll let you know when ${esc(h.name)} wants something, pets get hungry, a coworker messages you or a +$15 bonus arrives — 1–3 times a day, no more.`)
      : L('Напомним о бонусах +15 у.е., сообщениях от коллег и «Неделе дня» — 1–3 раза в день, не чаще.', 'We’ll remind you about +$15 bonuses, messages from coworkers and the Daily Week — 1–3 times a day, no more.')}</p>
    <button class="btn-main" type="button" id="paYes">🔔 ${L('Включить', 'Turn on')}</button>
    <button class="btn-ghost" type="button" id="paLater">${L('Позже', 'Later')}</button>
    <button class="btn-link" type="button" id="paNever">${L('Не спрашивать', 'Don’t ask again')}</button></div>`;
  m.hidden = false; track('push_ask');
  $('paYes').onclick = () => { m.hidden = true; pushEnable(); };
  $('paLater').onclick = () => { m.hidden = true; };
  $('paNever').onclick = () => { m.hidden = true; prefs.pushNever = true; store.set(KEY.prefs, prefs); };
}
setTimeout(pushAskOnEntry, 6000);  // после загрузки и «Что нового», когда меню спокойно
