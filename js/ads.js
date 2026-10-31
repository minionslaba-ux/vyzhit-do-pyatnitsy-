// Реклама за награду: игрок сам решает посмотреть ролик Рекламной сети Яндекса — и получает 1 у.е. на счёт карьеры.
// Не чаще раза в 20 минут (и само предложение — тоже). Ролик — только по нажатию игрока, никогда посреди решения карточки;
// на время ролика игра на паузе. Полноэкранный формат сам подстраивается под телефон (touch) и компьютер (desktop). На игровых платформах (Яндекс Игры и т. п.) — их собственная реклама, здесь выключено.
// Блок и тип — SUPABASE_CONFIG.ads в js/config.js.
const AD_REWARD = 1, AD_COOLDOWN = 20 * 60 * 1000, AD_MIN_SHOW = 5000;
const adCfg = () => window.SUPABASE_CONFIG?.ads || {};
const adPlatform = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window ? 'touch' : 'desktop';
const adBlock = () => adCfg().blocks?.[adPlatform()] || adCfg().blockId || '';  // блок под устройство (кабинет РСЯ: Mobile / Desktop)
const adOn = () => !!adBlock() && !window.VDP_PLATFORM;  // нет блока для этого устройства — нет и кнопки
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
  // why — причина отказа (пишем в статистику: по ней видно, нет ли показов, не заблокирован ли скрипт, не закрыт ли ролик сразу)
  const finish = (ok, why = '') => {
    if (settled) return; settled = true; clearTimeout(guard); vdpPause(false);
    if (ok) {
      prefs.adAt = Date.now(); store.set(KEY.prefs, prefs);
      addCash(AD_REWARD); sfx.coins?.();
      toast(L(`🎬 Спасибо за просмотр! +${money(AD_REWARD)} на счёт`, `🎬 Thanks for watching! +${money(AD_REWARD)}`));
      track('ad_reward', { detail: c.type });
      if (!views.menu.hidden) renderMenu();
      if (typeof S !== 'undefined' && S && !views.game.hidden) renderBars?.();
    } else {
      track('ad_fail', { detail: `${c.type}:${why}`.slice(0, 60) });
      toast(why === 'script' ? L('Реклама не загрузилась — возможно, включён блокировщик рекламы', 'The ad didn’t load — an ad blocker may be on')
        : why.startsWith('close') ? L('Реклама закрыта раньше времени — награда только за просмотр', 'The ad was closed too early — the reward is for watching')
        : L('Сейчас нет рекламы для показа — попробуйте чуть позже', 'No ad to show right now — try again a bit later'));
    }
    done?.(ok);
  };
  const guard = setTimeout(() => finish(false, 'timeout'), 90000);  // ответа нет совсем (нет показов, блокировщик) — кнопка снова доступна
  track('ad_open', { detail: c.type });
  vdpPause(true);
  adScript().then(() => {
    window.yaContextCb.push(() => {
      try {
        Ya.Context.AdvManager.render({
          blockId: adBlock(), type: c.type || 'fullscreen', platform: adPlatform(),
          onRender: () => track('ad_render', { detail: c.type }),
          onRewarded: ok => finish(!!ok, 'norew'),                                  // блок «с вознаграждением»: досмотрел
          onClose: () => { const ms = Date.now() - t0; if (c.type !== 'rewarded') finish(ms > AD_MIN_SHOW, `close${Math.round(ms / 1000)}s`); else if (!settled) finish(false, 'close'); },
          onError: e => finish(false, `err:${e?.type || ''}:${e?.code || e?.message || ''}`),
        });
      } catch (e) { finish(false, `ex:${e?.message || ''}`); }
    });
  }).catch(() => finish(false, 'script'));
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
