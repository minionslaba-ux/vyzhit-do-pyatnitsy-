// Реклама за награду: игрок сам решает посмотреть ролик Рекламной сети Яндекса — и получает 1 у.е. на счёт карьеры.
// Не чаще раза в 20 минут (и само предложение — тоже). Ролик — только по нажатию игрока, никогда посреди решения карточки;
// на время ролика игра на паузе. Полноэкранный формат сам подстраивается под телефон (touch) и компьютер (desktop). На игровых платформах (Яндекс Игры и т. п.) — их собственная реклама, здесь выключено.
// Блок и тип — SUPABASE_CONFIG.ads в js/config.js.
const AD_REWARD = 1, AD_COOLDOWN = 20 * 60 * 1000, AD_MIN_SHOW = 3000, AD_TOUCH_SEC = 10;  // телефон: награда — если реклама открыта 10 секунд (отсчёт поверх рекламы)  // крестик у полноэкранной рекламы Яндекса — около 5-й секунды: закрыл сразу — награда есть
const adCfg = () => window.SUPABASE_CONFIG?.ads || {};
const adPlatform = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window ? 'touch' : 'desktop';
// блок под устройство (кабинет РСЯ: Mobile / Desktop): { id, type }
const adBlock = () => { const b = adCfg().blocks?.[adPlatform()] || adCfg().blockId; return typeof b === 'string' ? { id: b, type: adCfg().type || 'fullscreen' } : b || {}; };
// adOff — Яндекс ответил, что площадка не включена (PAGE_DISABLED: сайт ещё не прошёл модерацию РСЯ) — до перезагрузки не пробуем
let adOff = '';
const adOn = () => !!adBlock().id && !window.VDP_PLATFORM && !adOff;  // нет блока для этого устройства — нет и кнопки
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

// Показать ролик. done(true) — награда начислена.
// opts.give — своя награда вместо +1 у.е. (возвращает текст для всплывашки); opts.why — для статистики (где предложили);
// opts.forced — обязательная реклама между неделями: без награды, без 20-минутного ограничения, при отказе — просто дальше
function adWatch(done, opts = {}) {
  if (!adOn()) return done?.(false);
  if (!opts.forced && adLeft()) { toast(L(`Следующий ролик за награду — через ${adMins()} мин.`, `Next rewarded video in ${adMins()} min`)); return done?.(false); }
  const c = adBlock(), t0 = Date.now(); let settled = false;
  // why — причина отказа (пишем в статистику: по ней видно, нет ли показов, не заблокирован ли скрипт, не закрыт ли ролик сразу)
  const finish = (ok, why = '') => {
    if (settled) return; settled = true; clearTimeout(guard); clearTimeout(noShow); clearInterval(pillT); pill?.remove(); loading?.remove(); obs?.disconnect(); vdpPause(false);
    if (/PAGE_DISABLED|BLOCK_DISABLED|PAGE_NOT_FOUND/i.test(why)) adOff = why;
    if (opts.forced) { prefs.adForcedAt = Date.now(); prefs.adWeeks = 0; store.set(KEY.prefs, prefs); track(ok ? 'ad_forced' : 'ad_fail', { detail: `forced:${c.type}:${why}`.slice(0, 60) }); return done?.(ok); }
    if (ok) {
      prefs.adAt = Date.now(); store.set(KEY.prefs, prefs);
      sfx.coins?.();
      toast(opts.give ? opts.give() : (addCash(AD_REWARD), L(`🎬 Спасибо за просмотр! +${money(AD_REWARD)} на счёт`, `🎬 Thanks for watching! +${money(AD_REWARD)}`)));
      track('ad_reward', { detail: `${c.type}:${opts.why || 'cash'}` });
      if (!views.menu.hidden) renderMenu();
      if (typeof S !== 'undefined' && S && !views.game.hidden) renderBars?.();
    } else {
      track('ad_fail', { detail: `${c.type}:${why}`.slice(0, 60) });
      toast(adOff ? L('Реклама пока недоступна: сайт ещё на проверке у Яндекса', 'Ads aren’t available yet: the site is still under review')
        : why === 'cancel' ? L('Показ рекламы отменён', 'Ad cancelled')
        : why === 'script' ? L('Реклама не загрузилась — возможно, включён блокировщик рекламы', 'The ad didn’t load — an ad blocker may be on')
        : why.startsWith('close') || why.startsWith('back') ? L(`Реклама закрыта раньше времени — награда после ${AD_TOUCH_SEC} секунд просмотра`, `The ad was closed too early — the reward comes after ${AD_TOUCH_SEC} seconds`)
        : L('Сейчас нет рекламы для показа — попробуйте чуть позже', 'No ad to show right now — try again a bit later'));
    }
    done?.(ok);
  };
  const guard = setTimeout(() => finish(false, 'timeout'), 90000);  // ролик открылся, но не закрылся — страховка
  track('ad_open', { detail: c.type });
  vdpPause(true);
  let loading = null, noShow = 0, obs = null, pill = null, pillT = 0, shownAt = 0;
  if (c.type === 'banner') return adBanner(c, finish, guard, opts.forced);
  // Пока реклама грузится — наше окно «Загружаем…» с «Отменой»; не открылась за 8 с — игра продолжается сама
  loading = Object.assign(document.createElement('div'), { className: 'ad-over ad-loading', role: 'dialog' });
  loading.innerHTML = `<div class="ad-box glass"><b>🎬 ${L('Загружаем рекламу…', 'Loading the ad…')}</b><button type="button" class="btn-ghost" id="adCancel">${L('Отмена', 'Cancel')}</button></div>`;
  document.body.append(loading);
  $('adCancel').onclick = () => finish(false, 'cancel');
  let shown = false;
  // засчитать просмотр: обязательная — после 3 с; за награду — когда отсчёт дошёл до «можно забирать»
  const watchedOk = () => opts.forced ? Date.now() - t0 > AD_MIN_SHOW : shown && Date.now() - shownAt >= AD_TOUCH_SEC * 1000 - 300;
  // реклама открылась: наше окно убираем; под рекламой остаётся «Вернуться в игру» — если слой Яндекса не появился, игрок не застрянет
  const opened = () => {
    if (shown) return; shown = true; shownAt = Date.now(); clearTimeout(noShow); obs?.disconnect(); track('ad_render', { detail: c.type });
    loading.innerHTML = `<button type="button" class="btn-ghost ad-back" id="adBack">${L('Вернуться в игру', 'Back to the game')}</button>`;
    loading.classList.add('ad-under');
    // Отсчёт поверх полноэкранной рекламы Яндекса: «Награда через N с» → «Можно забирать» (кроме обязательной рекламы)
    if (!opts.forced) {
      let left = AD_TOUCH_SEC;
      pill = Object.assign(document.createElement('div'), { className: 'ad-count', role: 'status' });
      pill.setAttribute('aria-live', 'polite');
      const draw = () => { pill.textContent = left > 0 ? L(`🎁 Награда через ${left} с`, `🎁 Reward in ${left}s`) : L('✅ Можно забирать — закройте рекламу', '✅ Reward ready — close the ad'); pill.classList.toggle('ready', left <= 0); };
      draw(); document.documentElement.append(pill);
      pillT = setInterval(() => { left--; draw(); if (left <= 0) { clearInterval(pillT); buzz?.('tap'); } }, 1000);
    }
    $('adBack').onclick = () => { const ms = Date.now() - t0; finish(c.type !== 'rewarded' && watchedOk(), `back${Math.round(ms / 1000)}s`); };
  };
  noShow = setTimeout(() => { if (!shown) finish(false, 'nofill'); }, 8000);
  // показ замечаем и по onRender, и по появлению рекламного слоя Яндекса на странице
  obs = typeof MutationObserver !== 'undefined' ? new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n !== loading && n.parentElement === document.body && !n.matches?.('.ad-over, .ad-pill, .ad-count, script, style, link') && (n.matches?.('iframe') || n.querySelector?.('iframe')) && n.getBoundingClientRect().height > innerHeight * 0.5) opened(); }) : null;
  obs?.observe(document.body, { childList: true });
  adScript().then(() => {
    window.yaContextCb.push(() => {
      try {
        Ya.Context.AdvManager.render({
          blockId: c.id, type: c.type || 'fullscreen', platform: adPlatform(),
          onRender: opened,
          onRewarded: ok => finish(!!ok, 'norew'),                                  // блок «с вознаграждением»: досмотрел
          onClose: () => { const ms = Date.now() - t0; if (c.type !== 'rewarded') finish(watchedOk(), `close${Math.round(ms / 1000)}s`); else if (!settled) finish(false, 'close'); },
          onError: e => finish(false, `err:${e?.type || ''}:${e?.code || e?.message || ''}`),
        });
      } catch (e) { finish(false, `ex:${e?.message || ''}`); }
    });
  }).catch(() => finish(false, 'script'));
}

// Баннер (компьютеры): наше окно на весь экран, внутри — баннер Яндекса и отсчёт 10 секунд; награда — только если баннер показался
const AD_BANNER_SEC = 10;
function adBanner(c, finish, guard, forced) {
  const box = Object.assign(document.createElement('div'), { className: 'ad-over', role: 'dialog' });
  const slot = `yandex_rtb_${c.id}`;
  box.innerHTML = `<div class="ad-box glass"><div class="ad-head"><b>🎬 ${L('Реклама', 'Advertisement')}</b><span id="adLeft">${L('загружается…', 'loading…')}</span><button type="button" class="ad-x" id="adX" aria-label="${L('Закрыть без награды', 'Close without reward')}">✕</button></div>
    <div class="ad-slot" id="${slot}"></div>
    <button type="button" class="btn-main" id="adGet" disabled>${forced ? L('Продолжить игру', 'Continue') : L('Получить награду', 'Get the reward')}</button></div>`;
  document.body.append(box);
  let shown = false, left = forced ? 5 : AD_BANNER_SEC, tick = 0;
  const end = (ok, why) => { clearInterval(tick); clearTimeout(noFill); box.remove(); finish(ok, why); };
  const start = () => {
    if (shown) return; shown = true; clearTimeout(guard); track('ad_render', { detail: 'banner' });
    tick = setInterval(() => {
      left--; $('adLeft').textContent = left > 0 ? (forced ? L(`ещё ${left} с`, `${left}s`) : L(`награда через ${left} с`, `reward in ${left}s`)) : forced ? '' : L('можно забирать!', 'ready!');
      if (left <= 0) { clearInterval(tick); $('adGet').disabled = false; }
    }, 1000);
  };
  const noFill = setTimeout(() => { if (!shown) end(false, 'nofill'); }, 9000);  // за 9 с баннер не пришёл — показов нет
  $('adX').hidden = !!forced;  // обязательную — до конца отсчёта
  $('adX').onclick = () => end(false, shown ? `close${AD_BANNER_SEC - left}s` : 'close0s');
  $('adGet').onclick = () => end(true);
  adScript().then(() => window.yaContextCb.push(() => {
    try {
      Ya.Context.AdvManager.render({ blockId: c.id, renderTo: slot, onRender: start, onError: e => end(false, `err:${e?.type || ''}:${e?.code || e?.message || ''}`) });
      // на случай, если onRender не вызвался: баннер уже в слоте
      const seen = setInterval(() => { if (!box.isConnected) return clearInterval(seen); if ($(slot)?.querySelector('iframe, img, a')) { clearInterval(seen); start(); } }, 500);
    } catch (e) { end(false, `ex:${e?.message || ''}`); }
  })).catch(() => end(false, 'script'));
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

// «Без рекламы» (js/shop.js): ни обязательной рекламы, ни всплывающих предложений; кнопки «Реклама за награду» остаются
const adQuiet = () => typeof noAdsOn === 'function' && noAdsOn();
// Предложение после недели — кнопкой на экране итогов, не чаще раза в 20 минут
bus.on('weekEnd', () => {
  if (!adOn() || adQuiet() || adLeft() || Date.now() - (prefs.adOffer || 0) < AD_COOLDOWN) return;
  setTimeout(() => {
    const st = views.end.querySelector('.end-sheet .stack'); if (!st || views.end.hidden || st.querySelector('[data-ad]')) return;
    prefs.adOffer = Date.now(); store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML('afterbegin', adBtnHtml('btn-ghost btn-ad'));
  }, 1200);
});

// ---------- где ещё предлагать рекламу ----------
const adReady = () => adOn() && !adLeft();
// Маленькая кнопка «🎬 +1 у.е.» рядом с «Пополнить», когда не хватает денег
const adChip = () => adReady() ? `<button type="button" class="btn-chip ad-chip" data-ad="1" title="${L(`Посмотреть рекламу: +${money(AD_REWARD)}`, `Watch an ad: +${money(AD_REWARD)}`)}">🎬 +${money(AD_REWARD)}</button>` : '';

// Окно-предложение: text — что даст реклама; give — награда; no — отказ
function adOffer({ ico = '🎬', title, text, yes, no, give, why }) {
  if (!adReady() || adQuiet()) return false;
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="aoTitle"><span class="lvl-ico" aria-hidden="true">${ico}</span>
    <h2 id="aoTitle">${title}</h2><p>${text}</p>
    <button class="btn-main" type="button" id="aoYes">🎬 ${yes}</button>
    <button class="btn-ghost" type="button" id="aoNo">${no || L('Нет, спасибо', 'No, thanks')}</button></div>`;
  m.hidden = false;
  track('ad_offer', { detail: why });
  $('aoYes').onclick = () => { m.hidden = true; adWatch(ok => { if (!ok) give.fail?.(); }, { give: give.ok, why }); };
  $('aoNo').onclick = () => { m.hidden = true; give.fail?.(); };
  return true;
}

// 2. Последний шанс при увольнении: шкала возвращается к 50 %, неделя продолжается (только в карьере)
function adRescue(k, high, fallback) {
  if (!(S?.mode === 'career' && C) || !adOffer({
    ico: '🆘', why: 'rescue',
    title: L('Последний шанс!', 'One last chance!'),
    text: L(`Шкала «${resName(k)}» на ${high ? '100' : '0'} %. Посмотрите короткую рекламу — и она вернётся к 50 %, неделя продолжится.`, `Your ${resName(k)} meter hit ${high ? '100' : '0'}%. Watch a short ad and it goes back to 50% — the week goes on.`),
    yes: L('Смотреть и остаться на работе', 'Watch and keep my job'), no: L('Нет, увольняйте', 'No, fire me'),
    give: { ok: () => { S.res[k] = 50; S.flags.adSaved = true; renderBars(); advance(); return L(`🆘 Спасено! «${resName(k)}» снова 50 %`, `🆘 Saved! ${resName(k)} is back to 50%`); }, fail: fallback },
  })) fallback();
}

// 4. Удвоить премию (дедлайн, задание дня) — плашкой сверху, игру не прерывает
function adDouble(n, label) {
  if (!adReady() || adQuiet() || !careerNow() || !n) return;
  document.querySelector('.ad-pill')?.remove();
  const el = Object.assign(document.createElement('button'), { type: 'button', className: 'ad-pill', innerHTML: `🎬 ${L(`${label}: удвоить ещё на +${money(n)} за рекламу`, `${label}: double it, +${money(n)} for an ad`)}` });
  document.body.append(el);
  const t = setTimeout(() => el.remove(), 9000);
  el.onclick = () => { clearTimeout(t); el.remove(); adWatch(null, { why: 'double', give: () => { addCash(n); if (S && !views.game.hidden) renderBars(); return L(`🎬 Премия удвоена: ещё +${money(n)}`, `🎬 Bonus doubled: +${money(n)}`); } }); };
}

// 3. Срыв: откат на неделю меньше (вызывается из окна срыва, js/wish.js)
const adBreakBtn = back => back > 0 && adReady() ? `<button class="btn-ghost btn-ad" type="button" id="brAd">🎬 ${L('Реклама: откатить на 1 неделю меньше', 'Watch an ad: roll back 1 week less')}</button>` : '';
function adBreakBind(after) {
  if (!$('brAd')) return;
  $('brAd').onclick = () => adWatch(ok => { if (ok) $('brAd')?.remove(); }, { why: 'break', give: () => {
    const c = careerNow(); c.week += 1; c.worked = (c.worked || 0) + 1; careerSave(c);
    const nx = $('next'); if (nx && /\d/.test(nx.textContent)) nx.textContent = L(`Неделя ${c.week} →`, `Week ${c.week} →`);
    after?.(c); return L(`⏪ Откат уменьшен: вы на неделе ${c.week}`, `⏪ Rollback reduced: you’re on week ${c.week}`);
  } });
}

// 5. Ещё одна попытка аттестации сегодня — раз в день, за рекламу
const certAdHtml = C2 => C2 && !certCan(C2) && C2.week <= YEAR && C2.certAd !== today() && adReady()
  ? `<button class="btn-ghost btn-ad" type="button" id="certAdBtn" style="grid-column:1/-1">🎬 ${L('Ещё попытка аттестации сегодня — за рекламу', 'One more exam attempt today — for an ad')}</button>` : '';
document.addEventListener('click', e => {
  if (!e.target.closest('#certAdBtn')) return;
  adWatch(null, { why: 'cert', give: () => { const c = careerNow(); c.certDay = null; c.certAd = today(); careerSave(c); setTimeout(() => certStart(), 400); return L('📜 Попытка открыта — удачи!', '📜 Attempt unlocked — good luck!'); } });
});

// ---------- обязательная реклама между неделями (без награды, редко) ----------
// Только при переходе «Неделя N →» с экрана итогов; не чаще раза в 3 недели и в 30 минут; не новичкам (первые 4 недели),
// не тем, кто покупал у.е. картой (prefs.paidUser), и не тем, кто сам смотрел рекламу за награду в последние 30 минут
const AD_FORCED_WEEKS = 3, AD_FORCED_GAP = 30 * 60 * 1000;
bus.on('weekEnd', x => { if (x.mode === 'career') { prefs.adWeeks = (prefs.adWeeks || 0) + 1; store.set(KEY.prefs, prefs); } });
const adForcedDue = () => adOn() && !prefs.paidUser && !adQuiet() && !(typeof guestLocked === 'function' && guestLocked()) && (prefs.gamesPlayed || 0) >= 4 && (prefs.adWeeks || 0) >= AD_FORCED_WEEKS
  && Date.now() - (prefs.adForcedAt || 0) > AD_FORCED_GAP && Date.now() - (prefs.adAt || 0) > AD_FORCED_GAP;
function adForced(go) {
  if (views.end.hidden || !adForcedDue()) return go();
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="afTitle"><span class="lvl-ico" aria-hidden="true">📺</span>
    <h2 id="afTitle">${L('Короткая реклама', 'A short ad')}</h2>
    <p>${L('Она помогает игре оставаться бесплатной. Сразу после неё — следующая неделя.', 'It keeps the game free. The next week starts right after it.')}</p>
    <button class="btn-main" type="button" id="afGo">${L('Смотреть', 'Watch')} <small id="afT">3</small></button>
    <button class="btn-link" type="button" id="afOff">${typeof openShopNoAds === 'function' ? L('🚫 Отключить рекламу', '🚫 Turn off ads') : L('Отключить обязательную рекламу — купить у.е.', 'Turn off ads — buy $')}</button></div>`;
  m.hidden = false;
  let n = 3, fired = false;
  const run = () => { if (fired) return; fired = true; clearInterval(t); m.hidden = true; adWatch(() => go(), { forced: true }); };
  const t = setInterval(() => { n--; if ($('afT')) $('afT').textContent = n; if (n <= 0) run(); }, 1000);
  $('afGo').onclick = run;
  $('afOff').onclick = () => { fired = true; clearInterval(t); if (typeof openShopNoAds === 'function') return openShopNoAds(() => adForced(go)); openTopup({ need: 10, why: L('Купите у.е. картой — и обязательной рекламы между неделями больше не будет.', 'Buy $ by card — and there will be no more ads between weeks.'), then: () => adForced(go) }); };
}
if (typeof window.startWeek === 'function') { const sw0 = window.startWeek; window.startWeek = function (...a) { return adForced(() => sw0.apply(this, a)); }; }
