// Облачное сохранение: прогресс (карьера, персонаж, питомцы, рекорды, магазин) — в аккаунт на сервере, чтобы он был одинаковым
// на сайте, в Telegram, ВК, MAX и на любом устройстве (правила VK Mini Apps 2.3.8). Сервер: supabase/update-2026-11-03-cloud-save.sql
// (save_progress / load_progress). Только для вошедших в аккаунт.
//  • При запуске — сравниваем с облаком: в облаке новее и карьера не короче — загружаем; на устройстве своя заметная карьера,
//    а в облаке другая — спрашиваем, какую оставить. Пока сравнение не закончено, в облако ничего не пишем.
//  • Сохраняем после каждой недели, при открытии меню (не чаще раза в 2 минуты) и когда игру сворачивают.
// Служебное (вход, сессия, настройки звука и напоминаний устройства) в облако не уходит.
const CLOUD_KEYS = ['vdp-career', 'vdp-best', 'vdp-endings', 'vdp-seen', 'vdp-quiz-seen', 'vdp-iv-seen', 'vdp-break-best', 'vdp-psy-tests',
  'vdp-cert-seen', 'vdp-brk-tried', 'vdp-anketa-about', 'vdp-best-step'];
const CLOUD_DEVICE = new Set(['session', 'email', 'playerId', 'pendingEmail', 'loggedOut', 'loginVia', 'loginWelcome', 'acctName', 'tgLinked', 'vkLinked',
  'maxLinked', 'hasPass', 'suggestName', 'tgRemind', 'vkRemind', 'maxRemind', 'sound', 'vol', 'cloudAt', 'accountDeleted', 'push', 'pushAskAt', 'pushAsked',
  'pushNever', 'remindAskAt', 'installNo', 'installNudgeAt', 'installSnooze', 'installed', 'viralSnooze', 'pendingJoin', 'refBy', 'adAt', 'adForcedAt', 'adOffer']);
let cloudReady = false, cloudLast = '', cloudPushAt = 0, cloudBusy = false;
const cloudOn = () => !window.VDP_PLATFORM && board.online && typeof registered === 'function' && registered() && !!prefs.playerId;
const careerScore = c => c ? ((c.level || 1) * 100 + Math.min(99, c.week || 0)) : 0;
// насколько далеко прогресс: уровень и неделя карьеры, потом — сколько недель сыграно всего
const cloudScore = (data = null) => {
  const c = data ? data['vdp-career'] : store.get(KEY.career, null), p = data ? data['vdp-prefs'] || {} : prefs;
  return careerScore(c) * 1e5 + Math.min(99999, p.gamesPlayed || 0);
};
function cloudSnapshot() {
  const d = {};
  for (const k of CLOUD_KEYS) { const v = store.get(k, null); if (v != null) d[k] = v; }
  const p = {}; for (const [k, v] of Object.entries(prefs)) if (!CLOUD_DEVICE.has(k)) p[k] = v;
  d['vdp-prefs'] = p;
  return d;
}
function cloudApply(data, at) {
  for (const k of CLOUD_KEYS) { if (k in data) store.set(k, data[k]); else store.del(k); }
  store.del(KEY.save);  // неделя, начатая на этом устройстве, к загруженной карьере не относится
  const keep = {}; for (const k of CLOUD_DEVICE) if (k in prefs) keep[k] = prefs[k];
  for (const k of Object.keys(prefs)) delete prefs[k];
  Object.assign(prefs, data['vdp-prefs'] || {}, keep, { cloudAt: { uid: keep.playerId, at } });
  store.set(KEY.prefs, prefs);
  if (typeof C !== 'undefined') try { C = data['vdp-career'] || null; } catch {}  // чтобы старая карьера не записалась поверх
  track('cloud', { detail: 'load' });
  location.reload();
}
async function cloudPush(force = false) {
  if (!cloudReady || !cloudOn() || cloudBusy) return;
  const d = cloudSnapshot(), s = JSON.stringify(d);
  if (!force && s === cloudLast) return;
  cloudBusy = true;
  try {
    const at = await board.rpc('save_progress', { p_data: d, p_score: cloudScore() });
    cloudLast = s; cloudPushAt = Date.now();
    prefs.cloudAt = { uid: prefs.playerId, at }; store.set(KEY.prefs, prefs);
  } catch {} finally { cloudBusy = false; }
}
const cloudDesc = data => {
  const c = data ? data['vdp-career'] : store.get(KEY.career, null);
  return c ? L(`уровень ${c.level || 1}, неделя ${Math.min(52, c.week || 1)}, на счёте ${Math.floor(c.bank || 0)} у.е.`, `level ${c.level || 1}, week ${Math.min(52, c.week || 1)}, $${Math.floor(c.bank || 0)} in the bank`)
    : L('карьера не начата', 'no career yet');
};
function cloudAsk(srv) {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="clTitle"><span class="lvl-ico" aria-hidden="true">☁️</span>
    <h2 id="clTitle">${L('Какую карьеру оставить?', 'Which career to keep?')}</h2>
    <p>${L('В вашем аккаунте сохранена одна карьера, а на этом устройстве — другая. Оставить можно одну, вторая заменится.', 'Your account has one career saved and this device has another. You can keep one; the other will be replaced.')}</p>
    <p>☁️ <b>${L('В аккаунте', 'In your account')}:</b> ${esc(cloudDesc(srv.data))}<br>📱 <b>${L('На этом устройстве', 'On this device')}:</b> ${esc(cloudDesc(null))}</p>
    <button class="btn-main" type="button" id="clLoad">☁️ ${L('Загрузить из аккаунта', 'Load from my account')}</button>
    <button class="btn-ghost" type="button" id="clKeep">📱 ${L('Оставить с этого устройства', 'Keep this device’s')}</button></div>`;
  m.hidden = false;
  $('clLoad').onclick = () => { m.hidden = true; cloudApply(srv.data, srv.updated_at); };
  $('clKeep').onclick = () => { m.hidden = true; cloudReady = true; track('cloud', { detail: 'keep_local' }); cloudPush(true); };
  track('cloud', { detail: 'ask' });
}
async function cloudSync() {
  if (!cloudOn()) return;
  let srv = null;
  try { srv = (await board.rpc('load_progress', {}))?.[0] || null; } catch { return; }  // нет связи — попробуем при следующем запуске, писать не будем
  const loc = cloudScore();
  if (!srv) { cloudReady = true; return cloudPush(true); }
  const mine = prefs.cloudAt?.uid === prefs.playerId ? Date.parse(prefs.cloudAt.at) : 0;
  const newer = Date.parse(srv.updated_at) > mine + 1000;  // после нашего последнего сохранения кто-то сохранял с другого устройства
  if (!newer) { cloudReady = true; return cloudPush(); }
  const sc = Number(srv.score) || 0;
  if (sc >= loc || careerScore(store.get(KEY.career, null)) === 0) return cloudApply(srv.data, srv.updated_at);
  if (careerScore(srv.data?.['vdp-career']) === 0) { cloudReady = true; return cloudPush(true); }  // в облаке карьеры нет — наша дальше
  cloudAsk(srv);
}
dataReady.then(() => setTimeout(cloudSync, 1800));
bus.on('weekEnd', () => setTimeout(() => cloudPush(), 2500));
bus.on('menu', () => { if (Date.now() - cloudPushAt > 120000) setTimeout(() => cloudPush(), 1500); });
document.addEventListener('visibilitychange', () => { if (document.hidden) cloudPush(); });
