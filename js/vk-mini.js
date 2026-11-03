// Мини-приложение ВКонтакте: мост с ВК без сторонних библиотек (тот же протокол, что у @vkontakte/vk-bridge):
// в приложениях ВК для Android/iOS — нативные обработчики, в вебе — postMessage родительскому окну.
// window.VK_MINI выставляет js/i18n.js по параметрам запуска (vk_app_id, sign). Что меняется внутри ВК:
// нет рекламы РСЯ; оплата Робокассой скрыта, вместо неё — голоса ВК, если включено vk.pay в js/config.js (js/topup.js, vkBuy), «Поделиться» — родное окно ВК (vkShare в js/ui-menu.js).
(() => {
  if (!window.VK_MINI) return;
  const q = new URLSearchParams(location.search);
  window.VK_APP_ID = q.get('vk_app_id') || (() => { try { return sessionStorage.getItem('vdp-vk-app') || ''; } catch { return ''; } })();
  try { if (q.get('vk_app_id')) sessionStorage.setItem('vdp-vk-app', q.get('vk_app_id')); } catch {}
  let seq = 0, webFrameId; const wait = {};  // webFrameId — номер окна игры у ВК (сообщение VKWebAppSettings); без него браузерный ВК не отвечает
  window.vkBridge = (method, params = {}, ms = 8000) => new Promise(ok => {  // ms — сколько ждать ответа (окно оплаты — дольше)
    const request_id = `vdp${++seq}`, data = { ...params, request_id };
    wait[request_id] = ok; setTimeout(() => { if (wait[request_id]) { delete wait[request_id]; ok(null); } }, ms);
    try {
      if (window.AndroidBridge?.[method]) window.AndroidBridge[method](JSON.stringify(data));
      else if (window.webkit?.messageHandlers?.[method]) window.webkit.messageHandlers[method].postMessage(data);
      else window.parent.postMessage({ handler: method, params: data, type: 'vk-connect', webFrameId, connectVersion: '2.15.0' }, '*');  // как в @vkontakte/vk-bridge 2.15
    } catch { ok(null); }
  });
  // Приложение свернули/закрыли в мобильном ВК — звук и голоса выключаем, вернулись — включаем (правила VK Mini Apps 2.2.5)
  let hidPaused = false;
  const viewHide = hide => {
    if (typeof vdpPause !== 'function') return;
    if (hide && !window.vdpPaused) { hidPaused = true; vdpPause(true); }
    else if (!hide && hidPaused) { hidPaused = false; vdpPause(false); }
  };
  const onEvent = e => {
    const t = e?.detail?.type;
    if (t === 'VKWebAppViewHide') viewHide(true); else if (t === 'VKWebAppViewRestore') viewHide(false);
    const d = e?.detail?.data, rid = d?.request_id;
    if (rid && wait[rid]) { wait[rid](d); delete wait[rid]; }
  };
  window.addEventListener('VKWebAppEvent', onEvent);  // нативные приложения ВК присылают ответы событием
  // в браузерной версии ВК ответы приходят сообщением от родительского окна; форматы бывают разные:
  // { type: 'vk-connect', detail: { type, data } }, { type: 'VKWebAppEvent', data: { type, data } } или сразу { type: 'VKWebApp…Result', data }
  window.addEventListener('message', e => {
    let d = e.data; if (typeof d === 'string') try { d = JSON.parse(d); } catch { return; }
    if (!d || typeof d !== 'object') return;
    if (d.type === 'vk-connect' || d.type === 'VKWebAppEvent') d = d.detail || d.data || d;
    if (d?.type === 'VKWebAppSettings') { webFrameId = d.frameId; return; }
    if (d && typeof d.type === 'string' && /^VKWebApp/.test(d.type)) onEvent({ detail: d });
  });
  // Приглашения внутри ВК: vk.com/app<ID>#ref-XXXXXX_join-КОД_ch-… — ВК отдаёт часть после # игре (как start_param в Telegram, js/app.js)
  try {
    const h = decodeURIComponent(location.hash.slice(1)), ref = h.match(/ref-([A-Z0-9]{6})/i), join = h.match(/join-([A-Z0-9]{6})/i), ch = h.match(/ch-(\d{8}[wl]\d{3}[pebc]\d{1,3})/);
    if (ref && !prefs.refClaimed) prefs.refBy = ref[1].toUpperCase();
    if (join) prefs.pendingJoin = join[1].toUpperCase();
    if (ref || join) store.set(KEY.prefs, prefs);
    if (ch && typeof rememberChallenge === 'function') rememberChallenge(ch[1], '', ref?.[1]);
  } catch {}
  // Плашка «Вместе веселее» на сайте зовёт рассказать «в Telegram или VK» — в приложении ВК только про ВК
  const vs = document.querySelector('#viralPop span');
  if (vs) vs.textContent = L('Позовите коллег в игру: за каждого, кто придёт по вашей ссылке, — +15 у.е. и +1 предмет на неделю.', 'Invite coworkers: every newcomer via your link — +$15 and +1 item for the week.');
  vkBridge('VKWebAppInit');
  vkBridge('VKWebAppSetViewSettings', { status_bar_style: 'light', action_bar_color: '#07070d', navigation_bar_color: '#07070d' });
  // Вход без окна авторизации: параметры запуска подписаны ВК, сервер (tg-login, vk_launch) проверяет подпись и выдаёт сессию
  // того же аккаунта, что «Войти через VK ID» на сайте. Один раз за запуск; не вышло — играем гостем, как раньше.
  const autoLogin = async () => {
    if (!q.get('sign') || typeof registered !== 'function' || registered() || !board.online) return;
    try { if (sessionStorage.getItem('vdp-vk-login') === q.get('sign')) return; sessionStorage.setItem('vdp-vk-login', q.get('sign')); } catch {}  // раз на каждый запуск
    const info = await vkBridge('VKWebAppGetUserInfo');
    const name = [info?.first_name, info?.last_name].filter(Boolean).join(' ');
    try { const j = await fnPost('tg-login', { vk_launch: { params: location.search, name } }); if (j?.access_token) await socialDone(j, 'vk'); }
    catch (e) { track('vk_app', { detail: `login_fail:${e?.message || ''}:${e?.why || ''}`.slice(0, 60) }); }
  };
  dataReady.then(() => setTimeout(autoLogin, 800));
  bus.on('menu', () => { if (!window.__vkOpened) { window.__vkOpened = 1; track('vk_app', { detail: q.get('vk_platform') || '' }); } });
})();
