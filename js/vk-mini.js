// Мини-приложение ВКонтакте: мост с ВК без сторонних библиотек (тот же протокол, что у @vkontakte/vk-bridge):
// в приложениях ВК для Android/iOS — нативные обработчики, в вебе — postMessage родительскому окну.
// window.VK_MINI выставляет js/i18n.js по параметрам запуска (vk_app_id, sign). Что меняется внутри ВК:
// нет рекламы РСЯ и оплаты (js/ads.js, js/shop.js, js/topup.js), «Поделиться» — родное окно ВК (vkShare в js/ui-menu.js).
(() => {
  if (!window.VK_MINI) return;
  const q = new URLSearchParams(location.search);
  window.VK_APP_ID = q.get('vk_app_id') || (() => { try { return sessionStorage.getItem('vdp-vk-app') || ''; } catch { return ''; } })();
  try { if (q.get('vk_app_id')) sessionStorage.setItem('vdp-vk-app', q.get('vk_app_id')); } catch {}
  let seq = 0; const wait = {};
  window.vkBridge = (method, params = {}) => new Promise(ok => {
    const request_id = `vdp${++seq}`, data = { ...params, request_id };
    wait[request_id] = ok; setTimeout(() => { if (wait[request_id]) { delete wait[request_id]; ok(null); } }, 8000);
    try {
      if (window.AndroidBridge?.[method]) window.AndroidBridge[method](JSON.stringify(data));
      else if (window.webkit?.messageHandlers?.[method]) window.webkit.messageHandlers[method].postMessage(data);
      else window.parent.postMessage({ handler: method, params: data, type: 'vk-connect' }, '*');
    } catch { ok(null); }
  });
  const onEvent = e => {
    const d = e?.detail?.data, rid = d?.request_id;
    if (rid && wait[rid]) { wait[rid](d); delete wait[rid]; }
  };
  window.addEventListener('VKWebAppEvent', onEvent);  // нативные приложения ВК присылают ответы событием
  window.addEventListener('message', e => { const d = e.data; if (d && d.type === 'vk-connect') onEvent({ detail: d.detail || { data: d.data } }); });
  vkBridge('VKWebAppInit');
  vkBridge('VKWebAppSetViewSettings', { status_bar_style: 'light', action_bar_color: '#07070d', navigation_bar_color: '#07070d' });
  bus.on('menu', () => { if (!window.__vkOpened) { window.__vkOpened = 1; track('vk_app', { detail: q.get('vk_platform') || '' }); } });
})();
