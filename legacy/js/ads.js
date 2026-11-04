/* сгенерировано tools/make-legacy.js из js/ads.js — не править */
const AD_REWARD = 1, AD_COOLDOWN = 20 * 60 * 1e3, AD_MIN_SHOW = 3e3, AD_TOUCH_SEC = 10;
const adCfg = () => {
  var _a;
  return ((_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.ads) || {};
};
const adPlatform = () => matchMedia("(pointer: coarse)").matches || "ontouchstart" in window ? "touch" : "desktop";
const adBlock = () => {
  var _a;
  const b = ((_a = adCfg().blocks) == null ? void 0 : _a[adPlatform()]) || adCfg().blockId;
  return typeof b === "string" ? { id: b, type: adCfg().type || "fullscreen" } : b || {};
};
let adOff = "";
const adSdk = () => {
  var _a, _b;
  return ((_b = (_a = window.VDP_PLATFORM) == null ? void 0 : _a.sdk) == null ? void 0 : _b.adv) || null;
};
const adOn = () => !adOff && (window.VK_MINI ? !!window.vkBridge : window.VDP_PLATFORM ? !!adSdk() : !!adBlock().id);
async function adWatchVk(done, opts) {
  var _a, _b;
  const kind = opts.forced ? "vk_full" : "vk_rew";
  track("ad_open", { detail: kind });
  vdpPause(true);
  const r = await vkBridge("VKWebAppShowNativeAds", { ad_format: opts.forced ? "interstitial" : "reward" }, opts.forced ? 6e4 : 18e4);
  vdpPause(false);
  const ok = (r == null ? void 0 : r.result) === true;
  const why = ok ? "shown" : ((_a = r == null ? void 0 : r.error_data) == null ? void 0 : _a.error_reason) || ((_b = r == null ? void 0 : r.error_data) == null ? void 0 : _b.error_code) || (r ? "no_ad" : "timeout");
  if (opts.forced) {
    prefs.adForcedAt = Date.now();
    prefs.adWeeks = 0;
    store.set(KEY.prefs, prefs);
    track(ok ? "ad_forced" : "ad_fail", { detail: "".concat(kind, ":").concat(why).slice(0, 60) });
    return done == null ? void 0 : done(ok);
  }
  if (ok) adGive(opts, kind);
  else {
    if (/not ?supported|unsupported/i.test(String(why))) adOff = String(why);
    track("ad_fail", { detail: "".concat(kind, ":").concat(why).slice(0, 60) });
    toast(L("Сейчас нет рекламы для показа — попробуйте чуть позже", "No ad to show right now — try again a bit later"));
  }
  done == null ? void 0 : done(ok);
}
const adLeft = () => Math.max(0, (prefs.adAt || 0) + AD_COOLDOWN - Date.now());
const adMins = () => Math.ceil(adLeft() / 6e4);
let adLoad = null;
const adScript = () => {
  var _a;
  return ((_a = window.Ya) == null ? void 0 : _a.Context) ? Promise.resolve() : adLoad || (adLoad = new Promise((ok, fail) => {
    window.yaContextCb = window.yaContextCb || [];
    const s = Object.assign(document.createElement("script"), { src: "https://yandex.ru/ads/system/context.js", async: true });
    s.onload = ok;
    s.onerror = () => {
      adLoad = null;
      fail(new Error("ads blocked"));
    };
    document.head.append(s);
  }));
};
function vdpPause(on) {
  window.vdpPaused = on;
  document.body.classList.toggle("ad-pause", on);
  try {
    on ? actx == null ? void 0 : actx.suspend() : actx == null ? void 0 : actx.resume();
  } catch (e) {
  }
  try {
    if (on) speechSynthesis.cancel();
  } catch (e) {
  }
  document.querySelectorAll("video, audio").forEach((v) => {
    try {
      on ? v.pause() : null;
    } catch (e) {
    }
  });
}
function adGive(opts, kind) {
  var _a;
  prefs.adAt = Date.now();
  store.set(KEY.prefs, prefs);
  (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
  toast(opts.give ? opts.give() : (addCash(AD_REWARD), L("🎬 Спасибо за просмотр! +".concat(money(AD_REWARD), " на счёт"), "🎬 Thanks for watching! +".concat(money(AD_REWARD)))));
  track("ad_reward", { detail: "".concat(kind, ":").concat(opts.why || "cash") });
  if (!views.menu.hidden) renderMenu();
  if (typeof S !== "undefined" && S && !views.game.hidden) renderBars == null ? void 0 : renderBars();
}
function adWatchSdk(adv, done, opts) {
  let settled = false, rewarded = false;
  const kind = opts.forced ? "ya_full" : "ya_rew";
  const end = (ok, why = "") => {
    if (settled) return;
    settled = true;
    vdpPause(false);
    if (opts.forced) {
      prefs.adForcedAt = Date.now();
      prefs.adWeeks = 0;
      store.set(KEY.prefs, prefs);
      track(ok ? "ad_forced" : "ad_fail", { detail: "".concat(kind, ":").concat(why).slice(0, 60) });
      return done == null ? void 0 : done(ok);
    }
    if (ok) adGive(opts, kind);
    else {
      track("ad_fail", { detail: "".concat(kind, ":").concat(why).slice(0, 60) });
      toast(why === "close" ? L("Реклама закрыта раньше времени — награда только за полный просмотр", "The ad was closed early — the reward is for watching to the end") : L("Сейчас нет рекламы для показа — попробуйте чуть позже", "No ad to show right now — try again a bit later"));
    }
    done == null ? void 0 : done(ok);
  };
  track("ad_open", { detail: kind });
  vdpPause(true);
  try {
    if (opts.forced) adv.showFullscreenAdv({ callbacks: { onClose: (shown) => end(!!shown, shown ? "shown" : "noshow"), onError: (e) => end(false, "err:".concat((e == null ? void 0 : e.message) || "")) } });
    else adv.showRewardedVideo({ callbacks: { onRewarded: () => {
      rewarded = true;
    }, onClose: () => end(rewarded, rewarded ? "" : "close"), onError: (e) => end(false, "err:".concat((e == null ? void 0 : e.message) || "")) } });
  } catch (e) {
    end(false, "ex:".concat((e == null ? void 0 : e.message) || ""));
  }
}
function adWatch(done, opts = {}) {
  if (!adOn()) return done == null ? void 0 : done(false);
  if (!opts.forced && adLeft()) {
    toast(L("Следующий ролик за награду — через ".concat(adMins(), " мин."), "Next rewarded video in ".concat(adMins(), " min")));
    return done == null ? void 0 : done(false);
  }
  if (window.VK_MINI) return adWatchVk(done, opts);
  if (adSdk()) return adWatchSdk(adSdk(), done, opts);
  const c = adBlock(), t0 = Date.now();
  let settled = false;
  const finish = (ok, why = "") => {
    if (settled) return;
    settled = true;
    clearTimeout(guard);
    clearTimeout(noShow);
    clearInterval(pillT);
    pill == null ? void 0 : pill.remove();
    loading == null ? void 0 : loading.remove();
    obs == null ? void 0 : obs.disconnect();
    vdpPause(false);
    if (/PAGE_DISABLED|BLOCK_DISABLED|PAGE_NOT_FOUND/i.test(why)) adOff = why;
    if (opts.forced) {
      prefs.adForcedAt = Date.now();
      prefs.adWeeks = 0;
      store.set(KEY.prefs, prefs);
      track(ok ? "ad_forced" : "ad_fail", { detail: "forced:".concat(c.type, ":").concat(why).slice(0, 60) });
      return done == null ? void 0 : done(ok);
    }
    if (ok) adGive(opts, c.type);
    else {
      track("ad_fail", { detail: "".concat(c.type, ":").concat(why).slice(0, 60) });
      toast(adOff ? L("Реклама пока недоступна: сайт ещё на проверке у Яндекса", "Ads aren’t available yet: the site is still under review") : why === "cancel" ? L("Показ рекламы отменён", "Ad cancelled") : why === "script" ? L("Реклама не загрузилась — возможно, включён блокировщик рекламы", "The ad didn’t load — an ad blocker may be on") : why.startsWith("close") || why.startsWith("back") ? L("Реклама закрыта раньше времени — награда после ".concat(AD_TOUCH_SEC, " секунд просмотра"), "The ad was closed too early — the reward comes after ".concat(AD_TOUCH_SEC, " seconds")) : L("Сейчас нет рекламы для показа — попробуйте чуть позже", "No ad to show right now — try again a bit later"));
    }
    done == null ? void 0 : done(ok);
  };
  const guard = setTimeout(() => finish(false, "timeout"), 9e4);
  track("ad_open", { detail: c.type });
  vdpPause(true);
  let loading = null, noShow = 0, obs = null, pill = null, pillT = 0, shownAt = 0;
  if (c.type === "banner") return adBanner(c, finish, guard, opts.forced);
  loading = Object.assign(document.createElement("div"), { className: "ad-over ad-loading", role: "dialog" });
  loading.innerHTML = '<div class="ad-box glass"><b>🎬 '.concat(L("Загружаем рекламу…", "Loading the ad…"), '</b><button type="button" class="btn-ghost" id="adCancel">').concat(L("Отмена", "Cancel"), "</button></div>");
  document.body.append(loading);
  $("adCancel").onclick = () => finish(false, "cancel");
  let shown = false;
  const watchedOk = () => opts.forced ? Date.now() - t0 > AD_MIN_SHOW : shown && Date.now() - shownAt >= AD_TOUCH_SEC * 1e3 - 300;
  const opened = () => {
    if (shown) return;
    shown = true;
    shownAt = Date.now();
    clearTimeout(noShow);
    obs == null ? void 0 : obs.disconnect();
    track("ad_render", { detail: c.type });
    loading.innerHTML = '<button type="button" class="btn-ghost ad-back" id="adBack">'.concat(L("Вернуться в игру", "Back to the game"), "</button>");
    loading.classList.add("ad-under");
    if (!opts.forced) {
      let left = AD_TOUCH_SEC;
      pill = Object.assign(document.createElement("div"), { className: "ad-count", role: "status" });
      pill.setAttribute("aria-live", "polite");
      const draw = () => {
        pill.textContent = left > 0 ? L("🎁 Награда через ".concat(left, " с"), "🎁 Reward in ".concat(left, "s")) : L("✅ Можно забирать — закройте рекламу", "✅ Reward ready — close the ad");
        pill.classList.toggle("ready", left <= 0);
      };
      draw();
      document.documentElement.append(pill);
      pillT = setInterval(() => {
        left--;
        draw();
        if (left <= 0) {
          clearInterval(pillT);
          buzz == null ? void 0 : buzz("tap");
        }
      }, 1e3);
    }
    $("adBack").onclick = () => {
      const ms = Date.now() - t0;
      finish(c.type !== "rewarded" && watchedOk(), "back".concat(Math.round(ms / 1e3), "s"));
    };
  };
  noShow = setTimeout(() => {
    if (!shown) finish(false, "nofill");
  }, 8e3);
  obs = typeof MutationObserver !== "undefined" ? new MutationObserver((ms) => {
    var _a, _b, _c;
    for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n !== loading && n.parentElement === document.body && !((_a = n.matches) == null ? void 0 : _a.call(n, ".ad-over, .ad-pill, .ad-count, script, style, link")) && (((_b = n.matches) == null ? void 0 : _b.call(n, "iframe")) || ((_c = n.querySelector) == null ? void 0 : _c.call(n, "iframe"))) && n.getBoundingClientRect().height > innerHeight * 0.5) opened();
  }) : null;
  obs == null ? void 0 : obs.observe(document.body, { childList: true });
  adScript().then(() => {
    window.yaContextCb.push(() => {
      try {
        Ya.Context.AdvManager.render({
          blockId: c.id,
          type: c.type || "fullscreen",
          platform: adPlatform(),
          onRender: opened,
          onRewarded: (ok) => finish(!!ok, "norew"),
          // блок «с вознаграждением»: досмотрел
          onClose: () => {
            const ms = Date.now() - t0;
            if (c.type !== "rewarded") finish(watchedOk(), "close".concat(Math.round(ms / 1e3), "s"));
            else if (!settled) finish(false, "close");
          },
          onError: (e) => finish(false, "err:".concat((e == null ? void 0 : e.type) || "", ":").concat((e == null ? void 0 : e.code) || (e == null ? void 0 : e.message) || ""))
        });
      } catch (e) {
        finish(false, "ex:".concat((e == null ? void 0 : e.message) || ""));
      }
    });
  }).catch(() => finish(false, "script"));
}
const AD_BANNER_SEC = 10;
function adBanner(c, finish, guard, forced) {
  const box = Object.assign(document.createElement("div"), { className: "ad-over", role: "dialog" });
  const slot = "yandex_rtb_".concat(c.id);
  box.innerHTML = '<div class="ad-box glass"><div class="ad-head"><b>🎬 '.concat(L("Реклама", "Advertisement"), '</b><span id="adLeft">').concat(L("загружается…", "loading…"), '</span><button type="button" class="ad-x" id="adX" aria-label="').concat(L("Закрыть без награды", "Close without reward"), '">✕</button></div>\n    <div class="ad-slot" id="').concat(slot, '"></div>\n    <button type="button" class="btn-main" id="adGet" disabled>').concat(forced ? L("Продолжить игру", "Continue") : L("Получить награду", "Get the reward"), "</button></div>");
  document.body.append(box);
  let shown = false, left = forced ? 5 : AD_BANNER_SEC, tick = 0;
  const end = (ok, why) => {
    clearInterval(tick);
    clearTimeout(noFill);
    box.remove();
    finish(ok, why);
  };
  const start = () => {
    if (shown) return;
    shown = true;
    clearTimeout(guard);
    track("ad_render", { detail: "banner" });
    tick = setInterval(() => {
      left--;
      $("adLeft").textContent = left > 0 ? forced ? L("ещё ".concat(left, " с"), "".concat(left, "s")) : L("награда через ".concat(left, " с"), "reward in ".concat(left, "s")) : forced ? "" : L("можно забирать!", "ready!");
      if (left <= 0) {
        clearInterval(tick);
        $("adGet").disabled = false;
      }
    }, 1e3);
  };
  const noFill = setTimeout(() => {
    if (!shown) end(false, "nofill");
  }, 9e3);
  $("adX").hidden = !!forced;
  $("adX").onclick = () => end(false, shown ? "close".concat(AD_BANNER_SEC - left, "s") : "close0s");
  $("adGet").onclick = () => end(true);
  adScript().then(() => window.yaContextCb.push(() => {
    try {
      Ya.Context.AdvManager.render({ blockId: c.id, renderTo: slot, onRender: start, onError: (e) => end(false, "err:".concat((e == null ? void 0 : e.type) || "", ":").concat((e == null ? void 0 : e.code) || (e == null ? void 0 : e.message) || "")) });
      const seen = setInterval(() => {
        var _a;
        if (!box.isConnected) return clearInterval(seen);
        if ((_a = $(slot)) == null ? void 0 : _a.querySelector("iframe, img, a")) {
          clearInterval(seen);
          start();
        }
      }, 500);
    } catch (e) {
      end(false, "ex:".concat((e == null ? void 0 : e.message) || ""));
    }
  })).catch(() => end(false, "script"));
}
const adBtnHtml = (cls = "btn-ghost btn-ad") => !adOn() ? "" : adLeft() ? '<button type="button" class="'.concat(cls, '" disabled>🎬 ').concat(L("Реклама за награду — через ".concat(adMins(), " мин."), "Rewarded video in ".concat(adMins(), " min")), "</button>") : '<button type="button" class="'.concat(cls, '" data-ad="1">🎬 ').concat(L("Посмотреть рекламу: +".concat(money(AD_REWARD)), "Watch an ad: +".concat(money(AD_REWARD))), "</button>");
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-ad]");
  if (!b) return;
  e.preventDefault();
  b.disabled = true;
  adWatch(() => {
    b.disabled = false;
    b.outerHTML = adBtnHtml(b.className);
  });
});
const adQuiet = () => typeof noAdsOn === "function" && noAdsOn();
bus.on("weekEnd", () => {
  if (!adOn() || adQuiet() || adLeft() || Date.now() - (prefs.adOffer || 0) < AD_COOLDOWN) return;
  setTimeout(() => {
    const st = views.end.querySelector(".end-sheet .stack");
    if (!st || views.end.hidden || st.querySelector("[data-ad]")) return;
    prefs.adOffer = Date.now();
    store.set(KEY.prefs, prefs);
    st.insertAdjacentHTML("afterbegin", adBtnHtml("btn-ghost btn-ad"));
  }, 1200);
});
const adReady = () => adOn() && !adLeft();
const adChip = () => adReady() ? '<button type="button" class="btn-chip ad-chip" data-ad="1" title="'.concat(L("Посмотреть рекламу: +".concat(money(AD_REWARD)), "Watch an ad: +".concat(money(AD_REWARD))), '">🎬 +').concat(money(AD_REWARD), "</button>") : "";
function adOffer({ ico = "🎬", title, text, yes, no, give, why }) {
  if (!adReady() || adQuiet()) return false;
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="aoTitle"><span class="lvl-ico" aria-hidden="true">'.concat(ico, '</span>\n    <h2 id="aoTitle">').concat(title, "</h2><p>").concat(text, '</p>\n    <button class="btn-main" type="button" id="aoYes">🎬 ').concat(yes, '</button>\n    <button class="btn-ghost" type="button" id="aoNo">').concat(no || L("Нет, спасибо", "No, thanks"), "</button></div>");
  m.hidden = false;
  track("ad_offer", { detail: why });
  $("aoYes").onclick = () => {
    m.hidden = true;
    adWatch((ok) => {
      var _a;
      if (!ok) (_a = give.fail) == null ? void 0 : _a.call(give);
    }, { give: give.ok, why });
  };
  $("aoNo").onclick = () => {
    var _a;
    m.hidden = true;
    (_a = give.fail) == null ? void 0 : _a.call(give);
  };
  return true;
}
function adRescue(k, high, fallback) {
  if (!((S == null ? void 0 : S.mode) === "career" && C) || !adOffer({
    ico: "🆘",
    why: "rescue",
    title: L("Последний шанс!", "One last chance!"),
    text: L("Шкала «".concat(resName(k), "» на ").concat(high ? "100" : "0", " %. Посмотрите короткую рекламу — и она вернётся к 50 %, неделя продолжится."), "Your ".concat(resName(k), " meter hit ").concat(high ? "100" : "0", "%. Watch a short ad and it goes back to 50% — the week goes on.")),
    yes: L("Смотреть и остаться на работе", "Watch and keep my job"),
    no: L("Нет, увольняйте", "No, fire me"),
    give: { ok: () => {
      S.res[k] = 50;
      S.flags.adSaved = true;
      renderBars();
      advance();
      return L("🆘 Спасено! «".concat(resName(k), "» снова 50 %"), "🆘 Saved! ".concat(resName(k), " is back to 50%"));
    }, fail: fallback }
  })) fallback();
}
function adDouble(n, label) {
  var _a;
  if (!adReady() || adQuiet() || !careerNow() || !n) return;
  (_a = document.querySelector(".ad-pill")) == null ? void 0 : _a.remove();
  const el = Object.assign(document.createElement("button"), { type: "button", className: "ad-pill", innerHTML: "🎬 ".concat(L("".concat(label, ": удвоить ещё на +").concat(money(n), " за рекламу"), "".concat(label, ": double it, +").concat(money(n), " for an ad"))) });
  document.body.append(el);
  const t = setTimeout(() => el.remove(), 9e3);
  el.onclick = () => {
    clearTimeout(t);
    el.remove();
    adWatch(null, { why: "double", give: () => {
      addCash(n);
      if (S && !views.game.hidden) renderBars();
      return L("🎬 Премия удвоена: ещё +".concat(money(n)), "🎬 Bonus doubled: +".concat(money(n)));
    } });
  };
}
const adBreakBtn = (back) => back > 0 && adReady() ? '<button class="btn-ghost btn-ad" type="button" id="brAd">🎬 '.concat(L("Реклама: откатить на 1 неделю меньше", "Watch an ad: roll back 1 week less"), "</button>") : "";
function adBreakBind(after) {
  if (!$("brAd")) return;
  $("brAd").onclick = () => adWatch((ok) => {
    var _a;
    if (ok) (_a = $("brAd")) == null ? void 0 : _a.remove();
  }, { why: "break", give: () => {
    const c = careerNow();
    c.week += 1;
    c.worked = (c.worked || 0) + 1;
    careerSave(c);
    const nx = $("next");
    if (nx && /\d/.test(nx.textContent)) nx.textContent = L("Неделя ".concat(c.week, " →"), "Week ".concat(c.week, " →"));
    after == null ? void 0 : after(c);
    return L("⏪ Откат уменьшен: вы на неделе ".concat(c.week), "⏪ Rollback reduced: you’re on week ".concat(c.week));
  } });
}
const certAdHtml = (C2) => C2 && !certCan(C2) && C2.week <= YEAR && C2.certAd !== today() && adReady() ? '<button class="btn-ghost btn-ad" type="button" id="certAdBtn" style="grid-column:1/-1">🎬 '.concat(L("Ещё попытка аттестации сегодня — за рекламу", "One more exam attempt today — for an ad"), "</button>") : "";
document.addEventListener("click", (e) => {
  if (!e.target.closest("#certAdBtn")) return;
  adWatch(null, { why: "cert", give: () => {
    const c = careerNow();
    c.certDay = null;
    c.certAd = today();
    careerSave(c);
    setTimeout(() => certStart(), 400);
    return L("📜 Попытка открыта — удачи!", "📜 Attempt unlocked — good luck!");
  } });
});
const AD_FORCED_WEEKS = 3, AD_FORCED_GAP = 30 * 60 * 1e3;
bus.on("weekEnd", (x) => {
  if (x.mode === "career") {
    prefs.adWeeks = (prefs.adWeeks || 0) + 1;
    store.set(KEY.prefs, prefs);
  }
});
const adForcedDue = () => adOn() && !prefs.paidUser && !adQuiet() && !(typeof guestLocked === "function" && guestLocked()) && (prefs.gamesPlayed || 0) >= 4 && (prefs.adWeeks || 0) >= AD_FORCED_WEEKS && Date.now() - (prefs.adForcedAt || 0) > AD_FORCED_GAP && Date.now() - (prefs.adAt || 0) > AD_FORCED_GAP;
const AD_EACH_GAP = 2 * 60 * 1e3;
const adEachDue = () => adOn() && !prefs.paidUser && !adQuiet() && !(typeof guestLocked === "function" && guestLocked()) && (prefs.gamesPlayed || 0) >= 4 && Date.now() - (prefs.adForcedAt || 0) > AD_EACH_GAP && Date.now() - (prefs.adAt || 0) > AD_EACH_GAP;
function adForced(go, each = false) {
  if (views.end.hidden || !(each ? adEachDue() : adForcedDue())) return go();
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="afTitle"><span class="lvl-ico" aria-hidden="true">📺</span>\n    <h2 id="afTitle">'.concat(L("Короткая реклама", "A short ad"), "</h2>\n    <p>").concat(L("Она помогает игре оставаться бесплатной. Сразу после неё — следующая неделя.", "It keeps the game free. The next week starts right after it."), '</p>\n    <button class="btn-main" type="button" id="afGo">').concat(L("Смотреть", "Watch"), ' <small id="afT">3</small></button>\n    <button class="btn-link" type="button" id="afOff">').concat(typeof openShopNoAds === "function" ? L("🚫 Отключить рекламу", "🚫 Turn off ads") : L("Отключить обязательную рекламу — купить у.е.", "Turn off ads — buy $"), "</button></div>");
  m.hidden = false;
  let n = 3, fired = false;
  const run = () => {
    if (fired) return;
    fired = true;
    clearInterval(t);
    m.hidden = true;
    adWatch(() => go(), { forced: true });
  };
  const t = setInterval(() => {
    n--;
    if ($("afT")) $("afT").textContent = n;
    if (n <= 0) run();
  }, 1e3);
  $("afGo").onclick = run;
  if ((window.NO_PAY || window.VK_MINI) && $("afOff")) $("afOff").hidden = true;
  $("afOff").onclick = () => {
    fired = true;
    clearInterval(t);
    if (typeof openShopNoAds === "function") return openShopNoAds(() => adForced(go, each));
    openTopup({ need: 10, why: L("Купите у.е. картой — и обязательной рекламы между неделями больше не будет.", "Buy $ by card — and there will be no more ads between weeks."), then: () => adForced(go, each) });
  };
}
if (typeof window.startWeek === "function") {
  const sw0 = window.startWeek;
  window.startWeek = function(...a) {
    return adForced(() => sw0.apply(this, a));
  };
}
document.addEventListener("DOMContentLoaded", () => {
  for (const fn of ["startPack", "startQuick", "startDaily"]) {
    const f0 = window[fn];
    if (typeof f0 !== "function") continue;
    window[fn] = function(...a) {
      return (S == null ? void 0 : S.mode) && S.mode !== "career" && S.mode !== "tour" ? adForced(() => f0.apply(this, a), true) : f0.apply(this, a);
    };
  }
});
