// Мини-приложение MAX (window.MAX_APP — js/i18n.js): вход без регистрации по данным запуска MAX.
// initData подписан токеном бота; сервер (tg-login, max_init) проверяет подпись и выдаёт сессию аккаунта max<id>@max.survivefriday.com.
// Один раз за запуск; не вышло — играем гостем. Мост MAX (window.WebApp) грузится в js/i18n.js.
(() => {
  if (!window.MAX_APP) return;
  const initData = () => window.WebApp?.initData || window.MAX_INIT || '';
  const user = () => { try { return window.WebApp?.initDataUnsafe?.user || JSON.parse(new URLSearchParams(initData()).get('user') || 'null'); } catch { return null; } };
  const autoLogin = async () => {
    const d = initData();
    if (!d || typeof registered !== 'function' || registered() || !board.online) return;
    const mark = d.slice(-24);
    try { if (sessionStorage.getItem('vdp-max-login') === mark) return; sessionStorage.setItem('vdp-max-login', mark); } catch {}
    try { const j = await fnPost('tg-login', { max_init: d }); if (j?.access_token) await socialDone(j, 'max'); }
    catch (e) { track('max_app', { detail: `login_fail:${e?.message || ''}`.slice(0, 60) }); }
  };
  // имя для анкеты — из профиля MAX (игрок может поменять)
  dataReady.then(() => {
    const u = user(); if (u && !prefs.name && $('joinName') && !$('joinName').value) $('joinName').value = [u.first_name, u.last_name].filter(Boolean).join(' ').slice(0, 24);
    setTimeout(autoLogin, 1500);  // мост MAX к этому времени загружен
  });
  bus.on('menu', () => { if (!window.__maxOpened) { window.__maxOpened = 1; track('max_app', { detail: window.WebApp?.platform || (initData() ? 'init' : 'noinit') }); } });
})();
