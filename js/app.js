// Старт приложения: брендированная неделя, карточки от коллег, PWA, Telegram Mini App, вход по ссылке.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- старт: брендированная неделя (?pack=имя) и карточки от коллег ----------
(async () => {
  const pack = new URLSearchParams(location.search).get('pack');
  if (pack && /^[a-z0-9_-]+$/i.test(pack)) {
    try {
      const r = await fetch(`packs/${pack}.json`);
      if (r.ok) {
        PACK = await r.json();
        PACK_CARDS = (PACK.cards || []).filter(c => DAYS.includes(c.day) && PHASES.some(p => p.name === c.phase)).map(c => ({ ...norm(c), id: 'pack_' + c.id }));
        for (const c of PACK_CARDS) byId[c.id] = c;
        if (/^#[0-9a-f]{6}$/i.test(PACK.accent || '')) document.documentElement.style.setProperty('--magenta', PACK.accent);
        if (!views.menu.hidden) renderMenu();
      }
    } catch {}
  }
  try {
    for (const s of await board.approved()) {
      const c = { id: 'sug_' + s.id, who: s.who || 'Коллега', text: s.text, author: s.author, random: true,
        answers: { left: { label: s.left_label, effects: s.left_effects || {} }, right: { label: s.right_label, effects: s.right_effects || {} } } };
      byId[c.id] = c; SUGGESTED.push(c);
    }
  } catch {}
})();

// Вход по ссылке из письма: в адресе #access_token=… — игрок становится аккаунтом, гостевой прогресс переносится
async function finishLogin() {
  const h = new URLSearchParams(location.hash.slice(1));
  const clean = () => history.replaceState(null, '', location.pathname + location.search);
  if (h.get('error')) { clean(); toast(`Вход не удался: ${h.get('error_description') || h.get('error')}. Отправьте ссылку ещё раз.`); return false; }
  const token = h.get('access_token');
  if (!token || !board.online) return false;
  clean();
  try {
    const user = await board.user(token);
    if (prefs.playerId !== user.id) {
      if (prefs.name) await board.rpc('merge_player', { p_from: prefs.playerId, p_to: user.id }, token).catch(() => {});
      prefs.playerId = user.id;
    }
    prefs.email = user.email; delete prefs.pendingEmail;
    const exp = +h.get('expires_at') ? +h.get('expires_at') * 1000 : Date.now() + (+h.get('expires_in') || 3600) * 1000;
    prefs.session = { access: token, refresh: h.get('refresh_token'), exp };
    const prof = (await board.rpc('get_profile', { p_id: user.id }).catch(() => []))[0];
    if (prof && !prefs.name) Object.assign(prefs, { name: prof.name, dept: prof.dept, avatar: prof.avatar || prefs.avatar });
    store.set(KEY.prefs, prefs);
    location.reload();  // ID игрока сменился — перезапускаем игру с ним
    return true;
  } catch (err) { toast(`Вход не удался: ${err.message}`); return false; }
}
// Приглашение по ссылке ?join=КОД
async function joinFromLink() {
  const q = new URLSearchParams(location.search), code = q.get('join') || prefs.pendingJoin;
  if (q.get('join')) { prefs.pendingJoin = q.get('join'); store.set(KEY.prefs, prefs); q.delete('join'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); }
  if (!code || !prefs.name || !board.online) return;
  if (!registered()) { toast('Чтобы вступить в офис по приглашению, зарегистрируйтесь — после входа вы окажетесь в нём сами'); return; }
  try { await board.touch('menu'); const n = await board.rpc('join_team', { p_id: prefs.playerId, p_code: code }); toast(`Вы в офисе «${n}». Загляните в чат офиса!`); }
  catch (err) { toast(err.message); }
  delete prefs.pendingJoin; store.set(KEY.prefs, prefs);
}
const origSubmit = $('joinForm').onsubmit;
$('joinForm').onsubmit = async e => { await origSubmit(e); if (prefs.name && !views.menu.hidden) joinFromLink(); };

// ---------- приложение на телефоне: офлайн, установка, Telegram Mini App ----------
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !window.POOL_JSON && !window.VDP_PLATFORM) navigator.serviceWorker.register('sw.js').catch(() => {});
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('installApp').hidden = false; });
$('installApp').hidden = standalone || TG || !(isIOS);  // на iOS кнопка с подсказкой, на Android — после события браузера
$('installApp').onclick = async () => {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); if (r?.outcome === 'accepted') $('installApp').hidden = true; installEvt = null; return; }
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="insTitle"><h2 id="insTitle">На экран «Домой»</h2>
    <p class="share-text">1. Нажмите кнопку «Поделиться» внизу Safari (квадрат со стрелкой).<br>2. Выберите «На экран „Домой“».<br>3. Нажмите «Добавить» — игра откроется как приложение, на весь экран и даже без интернета.</p>
    <button class="btn-ghost" id="insClose">Понятно</button></div>`;
  m.hidden = false; $('insClose').onclick = () => { m.hidden = true; };
};
addEventListener('appinstalled', () => { track('install'); $('installApp').hidden = true; toast('Игра установлена — ищите иконку на экране телефона'); });
// Telegram Mini App: тёмная шапка, имя из Telegram, приглашения через startapp=ref-ID_join-КОД, кнопка «Назад»
if (TG) {
  try {
    TG.ready(); TG.expand(); TG.setHeaderColor?.('#07070d'); TG.setBackgroundColor?.('#07070d');
    const sp = TG.initDataUnsafe?.start_param || '';
    const ref = sp.match(/ref-([A-Z0-9]{6})/i), join = sp.match(/join-([A-Z0-9]{6})/i);
    if (ref && !prefs.refClaimed) prefs.refBy = ref[1].toUpperCase();
    if (join) prefs.pendingJoin = join[1].toUpperCase();
    const ch = sp.match(/ch-(\d{8}[wl]\d{3}[pebc]\d{1,3})/);
    if (ch) rememberChallenge(ch[1], '', ref?.[1]);
    store.set(KEY.prefs, prefs);
    const u = TG.initDataUnsafe?.user;
    if (u && !prefs.name) $('joinName').value = [u.first_name, u.last_name].filter(Boolean).join(' ').slice(0, 24);
    TG.BackButton?.onClick(() => { $('modal').hidden = true; renderMenu(); });
    new MutationObserver(() => { views.menu.hidden ? TG.BackButton?.show() : TG.BackButton?.hide(); }).observe(views.menu, { attributes: true, attributeFilter: ['hidden'] });
  } catch {}
}
dataReady.then(() => { if (!views.menu.hidden) renderMenu(); });

finishLogin().then(reloading => {
  if (reloading) return;
  if (new URLSearchParams(location.search).has('stats') && board.online) return showStats();
  // utm_source из постеров, статей и каталогов — в статистику открытий: видно, какой канал приводит игроков
  const utm = (new URLSearchParams(location.search).get('utm_source') || window.VDP_PLATFORM?.name || '').replace(/[^\w-]/g, '').slice(0, 20);
  track('open', { detail: (TG ? 'telegram' : standalone ? 'app' : 'web') + (utm ? ':' + utm : '') });
  const scr = new URLSearchParams(location.search).get('screen');
  if (scr && board.online) return openScreen(scr);
  if (prefs.email && !prefs.name) renderJoin('profile', 'Вход выполнен. Осталось представиться коллегам.');
  else if (prefs.name) renderMenu();
  else renderWelcome();
  if (!prefs.introSeen && !prefs.gamesPlayed) showIntro();  // первый вход: сначала коротко, в чём смысл игры
  joinFromLink();
  flushOutbox();
});
