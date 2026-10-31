// Реклама за награду: игрок сам решает посмотреть ролик Рекламной сети Яндекса — и получает 1 у.е. на счёт карьеры.
// Не чаще раза в 20 минут (и само предложение — тоже). Ролик — только по нажатию игрока, никогда посреди решения карточки;
// на время ролика игра на паузе. Полноэкранный формат сам подстраивается под телефон (touch) и компьютер (desktop). На игровых платформах (Яндекс Игры и т. п.) — их собственная реклама, здесь выключено.
// Блок и тип — SUPABASE_CONFIG.ads в js/config.js.
const AD_REWARD = 1, AD_COOLDOWN = 20 * 60 * 1000, AD_MIN_SHOW = 5000;
const adCfg = () => window.SUPABASE_CONFIG?.ads || {};
const adOn = () => !!adCfg().blockId && !window.VDP_PLATFORM;
const adLeft = () => Math.max(0, (prefs.adAt || 0) + AD_COOLDOWN - Date.now());  // сколько ждать до следующего ролика
const adMins = () => Math.ceil(adLeft() / 60000);
// Загрузчик РСЯ стоит в <head> (async, как требует Яндекс); если его не было или он не загрузился — подгружаем здесь
let adLoad = null;
const adScript = () => window.Ya?.Context ? Promise.resolve() : adLoad || (adLoad = new Promise((ok, fail) => {
  window.yaContextCb = window.yaContextCb || [];
  const s = Object.assign(document.createElement('script'), { src: 'https://yandex.ru/ads/system/context.js', async: true });
  s.onload = ok; s.onerror = () => { adLoad = null; fail(new Error('ads blocked')); };
  document.head.append(s);
}));

// Пауза игры на время ролика (требование модерации): стоят таймер ответа и аттестации, звук и голоса выключены,
// 3D не рисуется, нажатия по игре не проходят
function vdpPause(on) {
  window.vdpPaused = on;
  document.body.classList.toggle('ad-pause', on);
  try { on ? actx?.suspend() : actx?.resume(); } catch {}
  try { if (on) speechSynthesis.cancel(); } catch {}
  document.querySelectorAll('video, audio').forEach(v => { try { on ? v.pause() : null; } catch {} });
}

// Показать ролик. done(true) — награда начислена
function adWatch(done) {
  if (!adOn()) return done?.(false);
  if (adLeft()) { toast(L(`Следующий ролик за награду — через ${adMins()} мин.`, `Next rewarded video in ${adMins()} min`)); return done?.(false); }
  const c = adCfg(), t0 = Date.now(); let settled = false;
  const finish = ok => {
    if (settled) return; settled = true; clearTimeout(guard); vdpPause(false);
    if (ok) {
      prefs.adAt = Date.now(); store.set(KEY.prefs, prefs);
      addCash(AD_REWARD); sfx.coins?.();
      toast(L(`🎬 Спасибо за просмотр! +${money(AD_REWARD)} на счёт`, `🎬 Thanks for watching! +${money(AD_REWARD)}`));
      track('ad_reward', { detail: c.type });
      if (!views.menu.hidden) renderMenu();
      if (typeof S !== 'undefined' && S && !views.game.hidden) renderBars?.();
    } else toast(L('Реклама сейчас недоступна — попробуйте позже', 'No ad available right now — try again later'));
    done?.(ok);
  };
  const guard = setTimeout(() => finish(false), 90000);  // ответа нет совсем (нет показов, блокировщик) — кнопка снова доступна
  track('ad_open', { detail: c.type });
  vdpPause(true);
  adScript().then(() => {
    window.yaContextCb.push(() => {
      try {
        Ya.Context.AdvManager.render({
          blockId: c.blockId, type: c.type || 'fullscreen', platform: matchMedia('(pointer: coarse)').matches ? 'touch' : 'desktop',
          onRewarded: ok => finish(!!ok),                                           // блок «с вознаграждением»: досмотрел
          onClose: () => { if (c.type !== 'rewarded') finish(Date.now() - t0 > AD_MIN_SHOW); else if (!settled) finish(false); },
          onError: () => finish(false),
        });
      } catch { finish(false); }
    });
  }).catch(() => finish(false));
}

// Кнопка «Реклама за награду» (или когда снова можно)
const adBtnHtml = (cls = 'btn-ghost btn-ad') => !adOn() ? '' : adLeft()
  ? `<button type="button" class="${cls}" disabled>🎬 ${L(`Реклама за награду — через ${adMins()} мин.`, `Rewarded video in ${adMins()} min`)}</button>`
  : `<button type="button" class="${cls}" data-ad="1">🎬 ${L(`Посмотреть рекламу: +${money(AD_REWARD)}`, `Watch an ad: +${money(AD_REWARD)}`)}</button>`;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ad]'); if (!b) return;
  e.preventDefault(); b.disabled = true;
  adWatch(() => { b.disabled = false; b.outerHTML = adBtnHtml(b.className); });
});

// Предложение после недели — кнопкой на экране итогов, не чаще раза в 20 минут
bus.on('weekEnd', () => {
  if (!adOn() || adLeft() || Date.now() - (prefs.adOffer || 0) < AD_COOLDOWN) return;
  setTimeout(() => {
    const st = views.end.querySelector('.end-sheet .stack'); if (!st || views.end.hidden || st.querySelector('[data-ad]')) return;
    prefs.adOffer = Date.now(); store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML('afterbegin', adBtnHtml('btn-ghost btn-ad'));
  }, 1200);
});
