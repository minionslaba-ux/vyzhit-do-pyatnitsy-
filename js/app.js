// Старт приложения: брендированная неделя, карточки от коллег, PWA, Telegram Mini App, вход по ссылке.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

applyStaticLang();  // английский текст из data-en в index.html

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
      const c = { id: 'sug_' + s.id, who: s.who || L('Коллега', 'Coworker'), text: s.text, author: s.author, random: true,
        answers: { left: { label: s.left_label, effects: s.left_effects || {} }, right: { label: s.right_label, effects: s.right_effects || {} } } };
      byId[c.id] = c; SUGGESTED.push(c);
    }
  } catch {}
})();

// Вход по ссылке из письма: в адресе #access_token=… — игрок становится аккаунтом, гостевой прогресс переносится
async function finishLogin() {
  if (await finishSocial()) return true;  // вернулись после входа через Telegram или VK
  const h = new URLSearchParams(location.hash.slice(1));
  const clean = () => history.replaceState(null, '', location.pathname + location.search);
  if (h.get('error')) { clean(); toast(L(`Вход не удался: ${h.get('error_description') || h.get('error')}. Отправьте ссылку ещё раз.`, `Sign-in failed: ${h.get('error_description') || h.get('error')}. Please send the link again.`)); return false; }
  const token = h.get('access_token');
  if (!token || !board.online) return false;
  clean();
  try {
    const user = await board.user(token);
    const exp = +h.get('expires_at') ? +h.get('expires_at') * 1000 : Date.now() + (+h.get('expires_in') || 3600) * 1000;
    await applySession({ access: token, refresh: h.get('refresh_token'), exp }, user, { via: 'email' });  // ID игрока сменился — игра перезапустится
    return true;
  } catch (err) { toast(L(`Вход не удался: ${err.message}`, `Sign-in failed: ${err.message}`)); return false; }
}
// После перехода по ссылке из письма: регистрация подтверждена — короткое приветствие и кнопка в игру
function loginWelcome() {
  const fresh = prefs.loginWelcome === 'new', via = prefs.loginVia && prefs.loginVia !== 'email' ? viaName(prefs.loginVia) : '';
  delete prefs.loginWelcome; delete prefs.loginVia; store.set(KEY.prefs, prefs);
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass welcome-box" role="dialog" aria-modal="true" aria-labelledby="lwTitle">
    <span class="lw-ico" aria-hidden="true">${fresh ? '🎉' : '👋'}</span>
    <h2 id="lwTitle">${fresh ? (via ? L('Добро пожаловать в офис!', 'Welcome to the office!') : L('Регистрация подтверждена!', 'You’re all signed up!')) : L(`С возвращением, ${esc(prefs.name)}!`, `Welcome back, ${esc(prefs.name)}!`)}</h2>
    <p>${fresh && via ? L(`Вы вошли через ${via}. Гостевой прогресс перенесён в аккаунт — входите через ${via} на любом устройстве.`, `You signed in with ${via}. Your guest progress has moved to your account — sign in with ${via} on any device.`) : fresh ? L(`Почта ${esc(prefs.email)} подтверждена. Гостевой прогресс перенесён в аккаунт — теперь он с вами на любом устройстве.`, `${esc(prefs.email)} is confirmed. Your guest progress has moved to your account — now it follows you to any device.`) : L('Вход выполнен. Карьера, офис и коллеги на месте.', 'You’re signed in. Your career, office and coworkers are right where you left them.')}</p>
    ${fresh ? `<ul class="lw-list"><li>${L('🏢 Создайте офис и позовите коллег', '🏢 Start an Office and invite your coworkers')}</li><li>${L('💬 Пишите в чат офиса', '💬 Chat with your Office')}</li><li>${L('🏆 Ваш отдел — в рейтинге', '🏆 Get your department on the leaderboard')}</li></ul>` : ''}
    <button class="btn-main" type="button" id="lwGo">${fresh ? L('Начать игру', 'Start playing') : L('Продолжить', 'Continue')}</button></div>`;
  m.hidden = false;
  if (fresh) { sfx.win?.(); confetti(); }
  $('lwGo').onclick = () => { m.hidden = true; };
}
// Приглашение по ссылке ?join=КОД
async function joinFromLink() {
  const q = new URLSearchParams(location.search), code = q.get('join') || prefs.pendingJoin;
  if (q.get('join')) { prefs.pendingJoin = q.get('join'); store.set(KEY.prefs, prefs); q.delete('join'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); }
  if (!code || !prefs.name || !board.online) return;
  if (!registered()) { toast(L('Чтобы вступить в офис по приглашению, зарегистрируйтесь — после входа вы окажетесь в нём сами', 'To join an Office by invite, sign up — once you’re in, you’ll land there automatically')); return; }
  try { await board.touch('menu'); const n = await board.rpc('join_team', { p_id: prefs.playerId, p_code: code }); toast(L(`Вы в офисе «${n}». Загляните в чат офиса!`, `You’re in the “${n}” Office. Say hi in the Office chat!`)); }
  catch (err) { toast(err.message); }
  delete prefs.pendingJoin; store.set(KEY.prefs, prefs);
}
const origSubmit = $('joinForm').onsubmit;
$('joinForm').onsubmit = async e => { await origSubmit(e); if (prefs.name && !views.menu.hidden) joinFromLink(); };

// ---------- приложение на телефоне: офлайн, установка, Telegram Mini App ----------
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !window.POOL_JSON && !window.VDP_PLATFORM) {
  // Вышла новая версия игры (новый sw.js взял управление) — перезагрузить, если игрок в меню; посреди недели — тихо, при следующем входе
  const hadSw = !!navigator.serviceWorker.controller;
  let swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadSw || swReloaded || !views.game.hidden) return; swReloaded = true; location.reload(); });
  navigator.serviceWorker.register('sw.js').then(r => r.update?.()).catch(() => {});
}
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent), isMobile = isIOS || isAndroid;
let installEvt = null;
// Установить можно: браузер дал событие установки, или это телефон (покажем, как добавить вручную); не в Telegram, не в каталогах
const canInstall = () => !standalone && !TG && !window.VDP_PLATFORM && !window.POOL_JSON && (installEvt || isMobile);
function installUi() {
  $('installApp').hidden = !canInstall();
  $('installCta').hidden = !canInstall() || Date.now() < (prefs.installSnooze || 0);
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; installUi();
// В сборках для каталогов игр (Яндекс Игры и др.) страницы правил нет — ссылки прячем
if (window.VDP_PLATFORM) document.querySelectorAll('a[href$="pravila.html"], a[href$="rules.html"]').forEach(a => { a.hidden = true; }); });
addEventListener('appinstalled', () => { installEvt = null; prefs.installed = 1; store.set(KEY.prefs, prefs); $('installPop').hidden = true; installUi(); toast(L('Игра установлена — ищите её на главном экране', 'Game installed — find it on your home screen')); });
async function doInstall() {
  $('installPop').hidden = true;
  track('install', { detail: installEvt ? 'prompt' : isIOS ? 'ios' : 'manual' });
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); if (r?.outcome === 'accepted') { prefs.installed = 1; store.set(KEY.prefs, prefs); } installEvt = null; installUi(); return; }
  const m = $('modal');
  const steps = isIOS
    ? L('1. Нажмите кнопку «Поделиться» внизу Safari (квадрат со стрелкой).<br>2. Выберите «На экран „Домой“».<br>3. Нажмите «Добавить».',
      '1. Tap the Share button at the bottom of Safari (the square with an arrow).<br>2. Choose “Add to Home Screen”.<br>3. Tap “Add”.')
    : L('1. Откройте меню браузера — три точки ⋮ справа вверху.<br>2. Выберите «Установить приложение» или «Добавить на главный экран».<br>3. Подтвердите — значок игры появится рядом с другими приложениями.',
      '1. Open the browser menu — the three dots ⋮ in the top right.<br>2. Choose “Install app” or “Add to Home screen”.<br>3. Confirm — the game icon will show up next to your other apps.');
  m.innerHTML = `<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="insTitle"><h2 id="insTitle">${L('На главный экран', 'Add to home screen')}</h2>
    <p class="share-text">${steps}<br><br>${L('Игра будет открываться как приложение: на весь экран и даже без интернета.', 'The game will open like an app: full screen, even offline.')}</p>
    <button class="btn-ghost" id="insClose">${L('Понятно', 'Got it')}</button></div>`;
  m.hidden = false; $('insClose').onclick = () => { m.hidden = true; };
}
$('installApp').onclick = doInstall;
$('installCtaGo').onclick = doInstall;
$('installCtaX').onclick = () => { prefs.installSnooze = Date.now() + 3 * 864e5; store.set(KEY.prefs, prefs); installUi(); };
// Иногда предлагаем в игре: после 2-й, 5-й, 8-й… недели, не чаще раза в двое суток, после трёх «Не сейчас» — больше не всплывает
function installNudge() {
  const n = prefs.gamesPlayed || 0;
  if (!canInstall() || prefs.installed || (prefs.installNo || 0) >= 3 || n < 2 || (n - 2) % 3 || Date.now() < (prefs.installNudgeAt || 0)) return;
  prefs.installNudgeAt = Date.now() + 2 * 864e5; store.set(KEY.prefs, prefs);
  setTimeout(() => { const el = $('installPop'); if (!$('invitePop').hidden) return; el.hidden = false; FX.pulse(el, 'on', 600); }, 2500);
}
$('installPopGo').onclick = doInstall;
$('installPopNo').onclick = () => { $('installPop').hidden = true; prefs.installNo = (prefs.installNo || 0) + 1; store.set(KEY.prefs, prefs); };
installUi();
// Telegram Mini App: тёмная шапка, имя из Telegram, приглашения через startapp=ref-ID_join-КОД, кнопка «Назад»
if (TG) {
  try {
    TG.ready(); TG.expand(); TG.setHeaderColor?.('#07070d'); TG.setBackgroundColor?.('#07070d');
    // на компьютере Telegram открывает игру маленьким окошком — разворачиваем на весь экран (Bot API 8.0+)
    if (/^(tdesktop|macos|weba|webk|unigram)$/.test(TG.platform) && TG.isVersionAtLeast?.('8.0')) {
      document.documentElement.classList.add('tgfs'); TG.requestFullscreen?.();
    }
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
  if (prefs.loggedOut) renderWelcome();  // вышли из аккаунта — сначала вход
  else if (prefs.email && !prefs.name) renderJoin('profile', L('Вход выполнен. Осталось представиться коллегам.', 'You’re signed in. Now just introduce yourself to your coworkers.'));
  else if (prefs.name) renderMenu();
  else renderWelcome();
  if (prefs.loginWelcome && prefs.name) loginWelcome();
  if (!prefs.introSeen && !prefs.gamesPlayed) showIntro();  // первый вход: сначала коротко, в чём смысл игры
  joinFromLink();
  flushOutbox();
  pollSocial();
});
