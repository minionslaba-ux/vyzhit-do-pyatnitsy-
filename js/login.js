// Вход в игру: почта (ссылка из письма или пароль), Telegram, VK ID.
// Telegram и VK проверяет функция tg-login на сервере и выдаёт обычную сессию Supabase — как вход по ссылке из письма.
// Если игрок уже вошёл, Telegram или VK привязывается к его аккаунту (потом можно входить любым способом).
const SOC_FN = () => (window.SUPABASE_CONFIG?.url || '').replace(/\/+$/, '') + '/functions/v1/';
const VK_APP = String(window.SUPABASE_CONFIG?.vk?.app || '');
const TG_BOT_ID = window.SUPABASE_CONFIG?.telegram?.botId || 0;
async function fnPost(name, body) {
  const r = await fetch(SOC_FN() + name, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_CONFIG?.anonKey || '' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || String(r.status)), { code: j.error });
  return j;
}
// Аккаунт без почты (вошли через Telegram или VK) — служебный адрес, показываем название сервиса
const socialVia = () => (prefs.email || '').match(/@(tg|vk)\.survivefriday\.com$/)?.[1] || '';
const viaName = v => v === 'vk' ? 'VK' : 'Telegram';
const acctLabel = () => socialVia() ? viaName(socialVia()) + (prefs.acctName ? ' · ' + prefs.acctName : '') : prefs.email || '';
const hasTg = () => socialVia() === 'tg' || !!prefs.tgLinked;

// Сессия получена любым способом: гостевой прогресс переходит в аккаунт, игра перезапускается под ним
async function applySession(s, user, extra = {}) {
  if (prefs.playerId !== user.id) {
    if (prefs.name) await board.rpc('merge_player', { p_from: prefs.playerId, p_to: user.id }, s.access).catch(() => {});
    prefs.playerId = user.id;
  }
  prefs.email = user.email; delete prefs.pendingEmail; delete prefs.loggedOut;
  if (extra.name) prefs.acctName = extra.name;
  if (extra.via === 'tg') prefs.tgLinked = true;
  if (extra.via === 'vk') prefs.vkLinked = true;
  prefs.loginVia = extra.via || 'email';
  prefs.loginWelcome = Date.now() - new Date(user.created_at) < 30 * 60000 ? 'new' : 'back';  // после перезагрузки — экран «Добро пожаловать»
  prefs.session = s;
  const prof = (await board.rpc('get_profile', { p_id: user.id }).catch(() => []))[0];
  if (prof && !prefs.name) Object.assign(prefs, { name: prof.name, dept: prof.dept, avatar: prof.avatar || prefs.avatar });
  if (!prefs.name && extra.name) prefs.suggestName = extra.name;
  store.set(KEY.prefs, prefs);
  location.reload();
}
const sessOf = j => ({ access: j.access_token, refresh: j.refresh_token, exp: j.expires_at ? j.expires_at * 1000 : Date.now() + 3600e3 });

function socialError(err, via) {
  const n = viaName(via);
  return ({
    linked_elsewhere: L(`Этот ${n} уже привязан к другому аккаунту игры. Выйдите и войдите через ${n}.`, `This ${n} account is linked to another game account. Log out and sign in with ${n}.`),
    already_linked: L(`К вашему аккаунту уже привязан другой ${n}.`, `Your account already has a different ${n} linked.`),
    bad_signature: L('Telegram не подтвердил вход — попробуйте ещё раз.', 'Telegram didn’t confirm the sign-in — please try again.'),
    vk_failed: L('VK не подтвердил вход — попробуйте ещё раз.', 'VK didn’t confirm the sign-in — please try again.'),
    not_configured: L('Вход через Telegram ещё настраивается.', 'Telegram sign-in isn’t set up yet.'),
  })[err.code] || L(`Вход не удался: ${err.message}`, `Sign-in failed: ${err.message}`);
}
async function socialDone(j, via) {
  if (j.linked) {
    if (via === 'tg') prefs.tgLinked = true; else prefs.vkLinked = true;
    store.set(KEY.prefs, prefs);
    toast(L(`✅ ${viaName(via)} привязан: теперь можно входить и через него`, `✅ ${viaName(via)} linked: you can now sign in with it too`));
    if (typeof renderMenu === 'function' && prefs.name) renderMenu();
    return false;
  }
  await applySession(sessOf(j), j.user, { name: j.name, via });
  return true;
}
// Уже вошли — передаём сессию, чтобы привязать; иначе — обычный вход
const linkToken = async () => (typeof registered === 'function' && registered()) ? await board.accessToken() : undefined;

async function tgLogin(after) {
  try {
    // для подтверждения удаления нужен именно новый вход, а не привязка к текущему аккаунту
    if (TG) return await socialDone(await fnPost('tg-login', { initData: TG.initData, access_token: after === 'delete' ? undefined : await linkToken() }), 'tg');
    if (!TG_BOT_ID) return toast(L('Вход через Telegram ещё настраивается.', 'Telegram sign-in isn’t set up yet.'));
    sessionStorage.setItem('vdp-social', JSON.stringify({ via: 'tg', after }));
    const back = location.origin + location.pathname;
    location.href = `https://oauth.telegram.org/auth?bot_id=${TG_BOT_ID}&origin=${encodeURIComponent(location.origin)}&request_access=write&return_to=${encodeURIComponent(back)}`;
  } catch (err) { toast(socialError(err, 'tg')); }
}
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const randStr = n => b64url(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);
async function vkLogin(after) {
  if (!VK_APP) return;
  const verifier = randStr(64), state = randStr(24);
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  sessionStorage.setItem('vdp-social', JSON.stringify({ via: 'vk', verifier, state, after }));
  location.href = 'https://id.vk.com/authorize?' + new URLSearchParams({ response_type: 'code', client_id: VK_APP, redirect_uri: location.origin + location.pathname,
    state, code_challenge: challenge, code_challenge_method: 'S256', scope: 'vkid.personal_info' });
}
// Возврат со страницы Telegram (#tgAuthResult=…) или VK ID (?code=…&state=…). true — игра перезагружается
async function finishSocial() {
  let st = null; try { st = JSON.parse(sessionStorage.getItem('vdp-social') || 'null'); } catch {}
  const h = location.hash, q = new URLSearchParams(location.search), vk = new URLSearchParams(location.search);
  const tgRes = h.match(/tgAuthResult=([^&]*)/), vkCode = vk.get('code') && vk.get('state') && st?.via === 'vk';
  if (!tgRes && !vkCode) return false;
  sessionStorage.removeItem('vdp-social');
  if (vkCode) { for (const k of ['code', 'state', 'device_id', 'expires_in', 'type', 'ext_id', 'payload']) q.delete(k); }
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
  if (st?.after) sessionStorage.setItem('vdp-after', st.after);
  try {
    if (tgRes) {
      if (!tgRes[1] || tgRes[1] === 'false') return false;  // нажали «Отмена»
      const raw = tgRes[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(raw + '='.repeat((4 - raw.length % 4) % 4)), c => c.charCodeAt(0));
      const tgAuth = JSON.parse(new TextDecoder().decode(bytes));
      return await socialDone(await fnPost('tg-login', { tgAuth, access_token: st?.after === 'delete' ? undefined : await linkToken() }), 'tg');
    }
    if (vk.get('state') !== st.state) { toast(L('Вход через VK не удался — попробуйте ещё раз.', 'VK sign-in failed — please try again.')); return false; }
    return await socialDone(await fnPost('tg-login', { vk: { code: vk.get('code'), code_verifier: st.verifier, device_id: vk.get('device_id') || '',
      state: st.state, redirect_uri: location.origin + location.pathname, client_id: VK_APP }, access_token: st.after === 'delete' ? undefined : await linkToken() }), 'vk');
  } catch (err) { toast(socialError(err, tgRes ? 'tg' : 'vk')); return false; }
}

// Кнопки «Войти через Telegram / VK» — на стартовом экране и в форме входа
function socialButtons(box) {
  if (!box) return;
  const on = board.online && !window.VDP_PLATFORM;
  box.hidden = !on; if (!on) return;
  box.innerHTML = `<button class="btn-main btn-tg" type="button">✈️ ${L('Войти через Telegram', 'Sign in with Telegram')}</button>`
    + (VK_APP ? `<button class="btn-main btn-vk" type="button">VK ${L('Войти через VK ID', 'Sign in with VK ID')}</button>` : '')
    + `<span class="or-line">${L('или по почте', 'or with email')}</span>`;
  box.querySelector('.btn-tg').onclick = () => tgLogin();
  box.querySelector('.btn-vk')?.addEventListener('click', () => vkLogin());
}

// Профиль: пароль и привязка Telegram / VK
function renderAcctBox() {
  const box = $('acctBox'); if (!box) return;
  const reg = typeof registered === 'function' && registered();
  box.hidden = !reg || !!window.VDP_PLATFORM; if (box.hidden) return;
  const btns = [];
  if (!socialVia()) btns.push(`<button class="btn-ghost" type="button" data-a="pass">🔑 ${prefs.hasPass ? L('Сменить пароль', 'Change password') : L('Задать пароль для входа', 'Set a sign-in password')}</button>`);
  if (!hasTg()) btns.push(`<button class="btn-ghost" type="button" data-a="tg">✈️ ${L('Привязать Telegram', 'Link Telegram')}</button>`);
  if (VK_APP && !(socialVia() === 'vk' || prefs.vkLinked)) btns.push(`<button class="btn-ghost" type="button" data-a="vk">VK ${L('Привязать VK', 'Link VK')}</button>`);
  box.innerHTML = btns.join(''); box.hidden = !btns.length;
  box.onclick = e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a === 'pass') passModal(); if (a === 'tg') tgLogin(); if (a === 'vk') vkLogin(); };
}
function passModal() {
  const m = $('modal');
  m.innerHTML = `<form class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="pwTitle" id="pwForm"><span class="lvl-ico" aria-hidden="true">🔑</span>
    <h2 id="pwTitle">${L('Пароль для входа', 'Sign-in password')}</h2>
    <p>${L(`Входите почтой <b>${esc(prefs.email)}</b> и паролем — без письма. Ссылка из письма тоже продолжит работать.`, `Sign in with <b>${esc(prefs.email)}</b> and a password — no email needed. Email links keep working too.`)}</p>
    <div class="field"><input id="pwNew" type="password" minlength="6" maxlength="72" autocomplete="new-password" placeholder="${L('Новый пароль, от 6 символов', 'New password, 6+ characters')}"></div>
    <p class="join-err" id="pwErr" role="alert"></p>
    <button class="btn-main" type="submit">${L('Сохранить пароль', 'Save password')}</button>
    <button class="btn-ghost" type="button" id="pwClose">${L('Отмена', 'Cancel')}</button></form>`;
  m.hidden = false; $('pwNew').focus();
  $('pwClose').onclick = () => { m.hidden = true; };
  $('pwForm').onsubmit = async e => {
    e.preventDefault();
    const pw = $('pwNew').value;
    if (pw.length < 6) { $('pwErr').textContent = L('Нужно хотя бы 6 символов.', 'Use at least 6 characters.'); return; }
    try { await board.setPassword(pw); prefs.hasPass = true; store.set(KEY.prefs, prefs); m.hidden = true; toast(L('🔑 Пароль сохранён', '🔑 Password saved')); renderAcctBox(); }
    catch (err) { $('pwErr').textContent = L(`Не получилось: ${err.message}`, `Didn’t work: ${err.message}`); }
  };
}

// ---------- удаление аккаунта: с подтверждением по почте (или повторным входом через Telegram/VK) ----------
// Сервер (account-delete) удаляет только если после запроса игрок заново вошёл по ссылке из письма — не старше 15 минут
async function delCall(action) {
  return fnPost('account-delete', { action, access_token: await board.accessToken(), redirect: location.origin + location.pathname });
}
function delModal(html) {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass lvl-box" role="dialog" aria-modal="true" aria-labelledby="delTitle"><span class="lvl-ico" aria-hidden="true">🗑️</span>${html}</div>`;
  m.hidden = false;
  return m;
}
function askDelete() {
  const via = socialVia(), n = via ? viaName(via) : '';
  const m = delModal(`<h2 id="delTitle">${L('Удалить аккаунт?', 'Delete your account?')}</h2>
    <p>${L('Удалятся аккаунт, профиль и рабочий стол, результаты в рейтингах, сообщения, участие в офисах (свой офис перейдёт самому давнему коллеге), привязки Telegram и VK, напоминания. Прогресс на этом устройстве тоже сотрётся. <b>Восстановить будет нельзя.</b>',
      'This deletes your account, profile and desk, leaderboard results, messages, Office memberships (your own Office goes to its longest-serving member), Telegram and VK links and reminders. Progress on this device is wiped too. <b>This can’t be undone.</b>')}</p>
    <p>${via ? L(`Для подтверждения войдите ещё раз через ${n}.`, `To confirm, sign in with ${n} once more.`)
      : L(`Для подтверждения пришлём письмо на <b>${esc(prefs.email)}</b>. Откройте ссылку из письма на этом устройстве — игра попросит окончательно подтвердить удаление.`, `To confirm, we’ll email <b>${esc(prefs.email)}</b>. Open the link from that email on this device and the game will ask you to confirm the deletion.`)}</p>
    <p class="join-err" id="delErr" role="alert"></p>
    <button class="btn-main btn-del" type="button" id="delGo">${via ? L(`Подтвердить через ${n}`, `Confirm with ${n}`) : L('Отправить письмо', 'Send the email')}</button>
    <button class="btn-ghost" type="button" id="delNo">${L('Отмена', 'Cancel')}</button>`);
  $('delNo').onclick = () => { m.hidden = true; };
  $('delGo').onclick = async () => {
    $('delGo').disabled = true;
    try {
      await delCall('request');
      if (via === 'tg') return tgLogin('delete');
      if (via === 'vk') return vkLogin('delete');
      delModal(`<h2 id="delTitle">${L('Проверьте почту', 'Check your email')}</h2>
        <p>${L(`Письмо отправлено на <b>${esc(prefs.email)}</b>. Это письмо со ссылкой для входа: откройте её — и игра попросит окончательно подтвердить удаление. Запрос действует сутки.`, `We emailed <b>${esc(prefs.email)}</b>. It’s a sign-in link: open it and the game will ask you to confirm the deletion. The request is valid for 24 hours.`)}</p>
        <button class="btn-ghost" type="button" id="delOk">${L('Понятно', 'Got it')}</button>`);
      $('delOk').onclick = () => { $('modal').hidden = true; };
    } catch (err) {
      $('delErr').textContent = err.code === 'too_often' ? L('Письмо уже отправлено — подождите минуту и попробуйте снова.', 'An email was just sent — wait a minute and try again.') : L(`Не получилось: ${err.message}`, `Didn’t work: ${err.message}`);
      $('delGo').disabled = false;
    }
  };
}
// Стереть всё игровое на этом устройстве (язык оставить) и начать с экрана входа
function wipeDevice() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('vdp-') && k !== 'vdp-lang') localStorage.removeItem(k);
    localStorage.setItem(KEY.prefs, JSON.stringify({ introSeen: 1, accountDeleted: 1 }));
  } catch {}
  location.reload();
}
// После входа по ссылке из письма (или через Telegram/VK): есть подтверждённый запрос — спросить окончательно
async function checkDelete() {
  if (prefs.accountDeleted) { delete prefs.accountDeleted; store.set(KEY.prefs, prefs); toast(L('Аккаунт удалён. Спасибо, что играли!', 'Account deleted. Thanks for playing!')); return; }
  if (!(typeof registered === 'function' && registered()) || !board.online || window.VDP_PLATFORM) return;
  let st; try { st = await delCall('status'); } catch { return; }
  if (!st.pending || !st.fresh) return;
  const m = delModal(`<h2 id="delTitle">${L('Удалить аккаунт навсегда?', 'Delete your account for good?')}</h2>
    <p>${L(`Вход подтверждён. Аккаунт <b>${esc(acctLabel())}</b> и все его данные будут удалены без возможности восстановления.`, `Sign-in confirmed. The account <b>${esc(acctLabel())}</b> and all its data will be deleted permanently.`)}</p>
    <p class="join-err" id="delErr" role="alert"></p>
    <button class="btn-main btn-del" type="button" id="delYes">${L('Удалить навсегда', 'Delete for good')}</button>
    <button class="btn-ghost" type="button" id="delNo">${L('Не удалять', 'Keep my account')}</button>`);
  $('delNo').onclick = async () => { m.hidden = true; await delCall('cancel').catch(() => {}); toast(L('Удаление отменено', 'Deletion cancelled')); };
  $('delYes').onclick = async () => {
    $('delYes').disabled = true;
    try { await delCall('delete'); wipeDevice(); }
    catch (err) {
      $('delErr').textContent = err.code === 'not_confirmed' ? L('Подтверждение устарело — запросите удаление ещё раз.', 'The confirmation expired — request deletion again.') : L(`Не получилось: ${err.message}`, `Didn’t work: ${err.message}`);
      $('delYes').disabled = false;
    }
  };
}
$('delAcct').onclick = askDelete;
