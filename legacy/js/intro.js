/* сгенерировано tools/make-legacy.js из js/intro.js — не править */
const INTRO = [
  {
    title: L("Доживите до пятницы", "Survive till Friday"),
    art: () => '<div class="in-clock"><span>09:00</span><i>→</i><span class="hot">18:00</span></div>\n      <div class="in-segs">'.concat("<i></i>".repeat(WEEK_LEN), "</div>"),
    text: L(
      "Вы — офисный сотрудник. Неделя — это 25 решений: по пять в день, с утра до вечера, с понедельника по пятницу. Продержитесь до пятницы, 18:00. Карьера — целый год из 52 недель.",
      "You’re an office worker. A week is 25 decisions: five a day, morning to evening, Monday through Friday. Hold out till Friday, 6 PM. Career mode is a whole year — 52 weeks."
    )
  },
  {
    title: L("Держите четыре шкалы", "Keep four meters in check"),
    art: () => '<div class="in-tubes">'.concat([["psyche", L("Кукуха", "Sanity"), 50, ""], ["energy", L("Энергия", "Energy"), 15, L("на грани", "on the edge")], ["boss", L("Босс", "Boss"), 88, L("перегрев", "overheat")], ["colleagues", L("Коллеги", "Team"), 60, ""]].map(([k, n, v, z]) => '<div class="tube-wrap'.concat(v >= 80 ? " hot danger" : v <= 20 ? " low danger" : "", '" data-k="').concat(k, '"><div class="tube"><div class="fill" style="--v:').concat(v, '"></div></div><span class="lbl">').concat(n, '</span><span class="pct">').concat(v, '%</span><span class="zone">').concat(z, "</span></div>")).join(""), "</div>"),
    text: L(
      "<b>Кукуха</b> — нервы, <b>Энергия</b> — силы, <b>Босс</b> — отношение начальства, <b>Коллеги</b> — команда. Ноль — конец недели. Но и <b>100% — тоже конец</b>: перегрев. Лучше всего — между 20% и 80%.",
      "<b>Sanity</b> is your nerves, <b>Energy</b> is your stamina, <b>Boss</b> is how management sees you, <b>Team</b> is your coworkers. Hit zero and the week is over. But <b>100% ends it too</b>: overheat. The sweet spot is between 20% and 80%."
    )
  },
  {
    title: L("Свайпайте решения", "Swipe your decisions"),
    art: () => '<div class="in-card"><div class="in-arrows"><span class="d">▼</span><span class="u">▲▲</span></div>\n      <div class="in-card-box"><b>'.concat(L("БОСС", "BOSS"), "</b><span>").concat(L("Пятница, 17:55. «Есть минутка?»", "Friday, 5:55 PM. “Got a minute?”"), '</span></div>\n      <div class="in-ans"><span>').concat(L("← Я уже дома", "← I’m already home"), "</span><span>").concat(L("Сделаю →", "On it →"), '</span></div><i class="in-hand">👆</i></div>'),
    text: L(
      "Тяните карточку влево или вправо — или жмите кнопки и стрелки ← →. Пока тянете, над шкалами загораются <b>▲</b> и <b>▼</b>: что вырастет и что упадёт. Две стрелки — сильный сдвиг.",
      "Drag the card left or right — or tap the buttons and the ← → keys. While you drag, <b>▲</b> and <b>▼</b> light up over the meters: what goes up and what goes down. Two arrows means a big swing."
    )
  },
  {
    title: L("Помощники", "Lifesavers"),
    art: () => '<div class="in-chips"><span class="item">'.concat(L("Кофе", "Coffee"), '</span><span class="item">').concat(L("Наушники", "Headphones"), '</span><span class="item">').concat(L("Справка от врача", "Doctor’s note"), '</span><span class="item">').concat(L("Печеньки", "Cookies"), '</span></div>\n      <div class="in-shield">◆</div>'),
    text: L(
      "Предмет в сумке сам отменит <b>один удар −10 и сильнее</b> по своей шкале: значок ◆ над шкалой — удар погасится. Шкала дошла до края? Будет <b>второй шанс</b>: вопрос на эрудицию за 20 секунд.",
      "An item in your bag automatically blocks <b>one hit of −10 or worse</b> to its meter: a ◆ over the meter means the hit gets absorbed. Meter maxed out or drained? You get a <b>second chance</b>: a trivia question, 20 seconds on the clock."
    )
  },
  {
    title: L("Деньги и магазин", "Money and the shop"),
    art: () => '<div class="in-money"><span class="fly-coin in-coin">+3</span><span class="bank-chip">'.concat(L("12 у.е. · магазин", "$12 · shop"), '</span></div>\n      <ul class="in-shop"><li><b>').concat(L("Предмет", "Item"), "</b><span>").concat(L("6–9 у.е.", "$6–9"), "</span></li><li><b>").concat(L("Мощь: шкала −20 от края", "Power-up: meter −20 from the edge"), "</b><span>").concat(money(12), "</span></li><li><b>").concat(L("💡 Подсказка: какой ответ безопаснее", "💡 Hint: which answer is safer"), "</b><span>").concat(money(2), "</span></li><li><b>").concat(L("Кредит +20 у.е.", "Loan +$20"), "</b><span>").concat(L("вернуть 24", "pay back $24"), "</span></li></ul>"),
    text: L(
      "За каждый рабочий день — <b>зарплата</b> в у.е. В конце недели списываются жильё и еда — 4 у.е. Тратьте деньги кнопкой <b>«у.е. · магазин»</b> под часами во время недели. <b>💡 Подсказка</b> за 2 у.е. покажет, какой ответ лучше держит баланс. Утром могут прийти <b>📋 дедлайны</b>: успеете — премия, сорвёте — штраф со счёта. Ещё есть <b>отпуск</b>: 28 дней в году, неделя отдыха с оплатой.",
      "Every workday earns you a <b>paycheck</b> in dollars. At the end of the week, rent and food cost $4. Spend your cash with the <b>“$ · shop”</b> button under the clock during the week. A <b>💡 Hint</b> for $2 shows which answer keeps you more balanced. Mornings may bring <b>📋 deadlines</b>: make it and get a bonus, miss it and pay a penalty. There’s also <b>vacation</b>: 28 days a year, a paid week off."
    )
  },
  {
    title: L("Карьера и люди", "Career and people"),
    art: () => '<div class="in-faces">'.concat(Object.values(CAST).slice(0, 4).map((p) => portraitHtml(p.name)).join(""), "</div>"),
    text: L(
      "Уволили? Ищите работу: собеседование из 7 вопросов. <b>Коллеги помнят</b> ваши решения: друг выручит, обиженный отомстит. <b>Неделя дня</b> — одна на всех: сравните результат и бросьте вызов коллеге.",
      "Fired? Go job hunting: a 7-question interview. <b>Coworkers remember</b> your choices: a friend will bail you out, someone you burned will get even. The <b>Daily Week</b> is the same for everyone: compare scores and challenge a coworker."
    )
  }
];
function showIntro(done) {
  const el = document.getElementById("intro");
  let i = 0;
  const finish = () => {
    el.hidden = true;
    document.removeEventListener("keydown", key);
    prefs.introSeen = 1;
    store.set(KEY.prefs, prefs);
    if (done) done();
  };
  const render = () => {
    const s = INTRO[i], last = i === INTRO.length - 1;
    el.innerHTML = '<div class="intro-box glass" role="dialog" aria-modal="true" aria-labelledby="inTitle">\n      <span class="age-badge" title="'.concat(L("Возрастное ограничение", "Age rating"), '" aria-label="').concat(L("Возрастное ограничение 12+", "Age rating 12+"), '">12+</span>\n      <button class="intro-skip" type="button" id="inSkip">').concat(last ? "" : L("Пропустить", "Skip"), '</button>\n      <div class="intro-art" aria-hidden="true">').concat(s.art(), '</div>\n      <span class="intro-step">').concat(i + 1, " ").concat(L("из", "of"), " ").concat(INTRO.length, '</span>\n      <h2 id="inTitle">').concat(s.title, '</h2>\n      <p aria-live="polite">').concat(s.text, '</p>\n      <div class="intro-dots" aria-hidden="true">').concat(INTRO.map((_, j) => '<i class="'.concat(j === i ? "on" : "", '"></i>')).join(""), '</div>\n      <div class="intro-nav"><button class="btn-ghost" type="button" id="inBack" ').concat(i ? "" : "disabled", ">").concat(L("Назад", "Back"), '</button>\n        <button class="btn-main" type="button" id="inNext">').concat(last ? L("Начать", "Let’s go") : L("Далее", "Next"), "</button></div></div>");
    $("inBack").onclick = () => go(-1);
    $("inNext").onclick = () => last ? finish() : go(1);
    $("inSkip").onclick = finish;
    $("inNext").focus({ preventScroll: true });
  };
  const go = (d) => {
    const j = Math.max(0, Math.min(INTRO.length - 1, i + d));
    if (j !== i) {
      i = j;
      render();
    }
  };
  const key = (e) => {
    if (el.hidden) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      i === INTRO.length - 1 ? finish() : go(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "Escape") finish();
  };
  let x0 = null;
  el.onpointerdown = (e) => {
    x0 = e.clientX;
  };
  el.onpointerup = (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };
  document.addEventListener("keydown", key);
  el.hidden = false;
  render();
}
const VIDEO_BASE = /^https?:/.test(location.href) && !window.POOL_JSON ? "" : "https://survivefriday.com/";
function showVideo() {
  var _a;
  const ya = window.BROWSER === "yandex";
  const tall = innerHeight > innerWidth, f = tall ? "9x16" : "16x9", m = $("modal");
  m.innerHTML = '<div class="modal-box glass video-box'.concat(tall ? " tall" : "", '" role="dialog" aria-modal="true" aria-label="').concat(L("Видео об игре", "Game video"), '">\n    <video src="').concat(VIDEO_BASE, "promo/video/zastavka-").concat(f, '.mp4" poster="').concat(VIDEO_BASE, "promo/video/poster-").concat(f, '.jpg" controls ').concat(ya ? "" : "autoplay", ' playsinline webkit-playsinline x5-playsinline disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback noplaybackrate" preload="').concat(ya ? "metadata" : "auto", '"></video>\n    <div class="video-nav"><button class="btn-ghost" type="button" id="vidHow">').concat(L("Как играть", "How to play"), '</button><button class="btn-main" type="button" id="vidClose">').concat(L("Понятно, играть", "Got it, let’s play"), "</button></div></div>");
  m.hidden = false;
  const v = m.querySelector("video"), close = () => {
    var _a2, _b;
    try {
      v.pause();
    } catch (e) {
    }
    try {
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {
      });
    } catch (e) {
    }
    try {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      if (fs) (_a2 = document.exitFullscreen || document.webkitExitFullscreen) == null ? void 0 : _a2.call(document);
    } catch (e) {
    }
    try {
      (_b = v.webkitExitFullscreen) == null ? void 0 : _b.call(v);
    } catch (e) {
    }
    try {
      v.removeAttribute("src");
      v.load();
    } catch (e) {
    }
    m.hidden = true;
    m.innerHTML = "";
  };
  try {
    v.disablePictureInPicture = true;
    v.disableRemotePlayback = true;
  } catch (e) {
  }
  if (!ya) (_a = v.play) == null ? void 0 : _a.call(v).catch(() => {
  });
  v.addEventListener("ended", () => {
    var _a2, _b, _c;
    try {
      (_a2 = v.webkitExitFullscreen) == null ? void 0 : _a2.call(v);
      if (document.fullscreenElement) (_b = document.exitFullscreen) == null ? void 0 : _b.call(document);
    } catch (e) {
    }
    (_c = $("vidClose")) == null ? void 0 : _c.focus();
  });
  $("vidClose").onclick = close;
  $("vidHow").onclick = () => {
    close();
    showIntro();
  };
  m.onclick = (e) => {
    if (e.target === m) close();
  };
  track("share", { detail: "video" });
}
