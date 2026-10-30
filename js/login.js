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
    if (TG) return await socialDone(await fnPost('tg-login', { initData: TG.initData, access_token: await linkToken() }), 'tg');
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
      return await socialDone(await fnPost('tg-login', { tgAuth, access_token: await linkToken() }), 'tg');
    }
    if (vk.get('state') !== st.state) { toast(L('Вход через VK не удался — попробуйте ещё раз.', 'VK sign-in failed — please try again.')); return false; }
    return await socialDone(await fnPost('tg-login', { vk: { code: vk.get('code'), code_verifier: st.verifier, device_id: vk.get('device_id') || '',
      state: st.state, redirect_uri: location.origin + location.pathname, client_id: VK_APP }, access_token: await linkToken() }), 'vk');
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
