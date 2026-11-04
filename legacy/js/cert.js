/* сгенерировано tools/make-legacy.js из js/cert.js — не править */
const CERT_N = 25, CERT_PASS = 18, CERT_MIX = [8, 9, 8], CERT_TIME = 20, CERT_LIFE_PRICE = 3;
const CERT_TOPICS = {
  labor: ["⚖️", L("Трудовое право", "Employment")],
  law: ["🏛️", L("Юриспруденция", "Law")],
  contract: ["📝", L("Договорное право", "Contracts")],
  tax: ["🧾", L("Налоги", "Taxes")],
  ved: ["🚢", L("ВЭД", "Foreign trade")],
  math: ["➗", L("Математика", "Math")],
  bio: ["🧬", L("Биология", "Biology")],
  chem: ["⚗️", L("Химия", "Chemistry")],
  med: ["🩺", L("Медицина", "Medicine")],
  history: ["📜", L("История", "History")],
  geo: ["🌍", L("География", "Geography")],
  music: ["🎵", L("Музыка", "Music")],
  fashion: ["👗", L("Мода", "Fashion")],
  jobs: ["👷", L("Профессии", "Professions")]
};
const FRIENDS = L(
  [["Серёга из IT", 0], ["Тётя Люба", 1], ["Однокурсник Витя", 0], ["Соседка Ира", 1], ["Бывший начальник", 0], ["Мама", 1], ["Друг детства Костя", 0], ["Бухгалтер Нина Петровна", 1]],
  [["Steve from IT", 0], ["Aunt Lucy", 1], ["Old classmate Vic", 0], ["Neighbor Irene", 1], ["Your ex-boss", 0], ["Mom", 1], ["Childhood friend Kevin", 0], ["Nina from Accounting", 1]]
);
let certBank = null;
const certLoad = () => certBank ? Promise.resolve(certBank) : fetch("data/cert/".concat(EN ? "en" : "ru", ".json")).then((r) => r.json()).then((b) => certBank = b);
const certCan = (C2) => C2 && C2.week <= YEAR && C2.certDay !== today();
const certNextPay = (C2) => PAY_BASE + PAY_CERT * ((C2.cert || 0) + 1);
function certPick(bank) {
  const seen = new Set(store.get("vdp-cert-seen", []));
  const out = [], per = {};
  CERT_MIX.forEach((n, i) => {
    let pool = shuffle(bank.map((q, id) => ({ ...q, id })).filter((q) => q.d === i + 1 && !seen.has(q.id)));
    if (pool.length < n * 2) pool = shuffle(bank.map((q, id) => ({ ...q, id })).filter((q) => q.d === i + 1));
    for (const q of pool) {
      if (out.filter((x) => x.d === i + 1).length >= n) break;
      if ((per[q.t] || 0) >= 3) continue;
      per[q.t] = (per[q.t] || 0) + 1;
      out.push(q);
    }
    for (const q of pool) {
      if (out.filter((x) => x.d === i + 1).length >= n) break;
      if (!out.includes(q)) out.push(q);
    }
  });
  const keep = [...seen, ...out.map((q) => q.id)].slice(-Math.floor(bank.length * 0.7));
  store.set("vdp-cert-seen", keep);
  return out.map((q) => {
    const order = shuffle([0, 1, 2, 3]);
    return { ...q, opts: order.map((k) => q.a[k]), ok: order.indexOf(0) };
  });
}
function certOffer() {
  const C2 = careerNow();
  if (!certCan(C2)) return;
  if (prefs.certOffer === today()) return;
  prefs.certOffer = today();
  store.set(KEY.prefs, prefs);
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="coTitle"><span class="lvl-ico" aria-hidden="true">📜</span>\n    <h2 id="coTitle">'.concat(L("Хотите зарабатывать больше?", "Want to earn more?"), "</h2>\n    <p>").concat(L("Сдайте аттестацию — 25 вопросов из разных областей. Ответите верно на ".concat(CERT_PASS, "+ — оклад вырастет с ").concat(money(C2.salary), " до ").concat(money(certNextPay(C2)), " в день. Есть три подсказки: 50 на 50, звонок другу и помощь зала."), "Pass the certification — 25 questions on all sorts of topics. Get ".concat(CERT_PASS, "+ right and your pay goes up from ").concat(money(C2.salary), " to ").concat(money(certNextPay(C2)), " a day. Three lifelines: 50:50, phone a friend and ask the audience.")), '</p>\n    <button class="btn-main" type="button" id="coGo">📜 ').concat(L("Пройти аттестацию", "Take the exam"), '</button>\n    <button class="btn-ghost" type="button" id="coLater">').concat(L("Не сейчас", "Not now"), "</button></div>");
  m.hidden = false;
  $("coGo").onclick = () => {
    m.hidden = true;
    certStart();
  };
  $("coLater").onclick = () => {
    m.hidden = true;
  };
}
bus.on("weekEnd", (x) => {
  if (x.mode === "career" && x.won) setTimeout(() => {
    if ($("modal").hidden && !views.end.hidden) certOffer();
  }, 5200);
});
async function certStart(after) {
  const C2 = payFix(careerNow());
  if (!C2) return toast(L("Аттестация — для карьеры: начните её кнопкой «Играть»", "Certification is part of Career mode — press Play to start one"));
  if (!certCan(C2)) return toast(L("Аттестацию можно проходить раз в день. Возвращайтесь завтра!", "You can take the exam once a day. Come back tomorrow!"));
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass cert-box"><p>'.concat(L("Готовим вопросы…", "Preparing the questions…"), "</p></div>");
  m.hidden = false;
  let bank;
  try {
    bank = await certLoad();
  } catch (e) {
    m.hidden = true;
    return toast(L("Не удалось загрузить вопросы — проверьте интернет", "Couldn’t load the questions — check your connection"));
  }
  C2.certDay = today();
  careerSave(C2);
  track("cert_start", { detail: String(C2.cert || 0) });
  const qs = certPick(bank), life = { half: true, call: true, hall: true };
  let i = 0, score = 0, lock = false, left = CERT_TIME, away = false, warned = false, last = performance.now();
  const stop = () => clearInterval(tick);
  const done = () => {
    stop();
    certResult(C2, score, after);
  };
  const answer = (k) => {
    var _a, _b, _c;
    if (lock) return;
    lock = true;
    const q = qs[i], btns = [...m.querySelectorAll(".cq-opt")], right = k === q.ok;
    q.right = right;
    if (right) score++;
    if (k >= 0) btns[k].classList.add(right ? "ok" : "no");
    (_a = btns[q.ok]) == null ? void 0 : _a.classList.add("ok");
    if (k < 0) $("cqHelp").innerHTML = '<div class="cq-call">⏱ '.concat(L("Время вышло — ответ не засчитан", "Time’s up — no answer counted"), "</div>");
    right ? (_b = sfx.coins) == null ? void 0 : _b.call(sfx) : (_c = sfx.sigh) == null ? void 0 : _c.call(sfx);
    buzz(right ? "item" : "danger");
    setTimeout(() => {
      lock = false;
      i++;
      left = CERT_TIME;
      warned = false;
      if (i >= CERT_N) done();
      else render();
    }, right ? 850 : 1500);
  };
  const tick = setInterval(() => {
    var _a;
    const now = performance.now(), dt = (now - last) / 1e3;
    last = now;
    if (!$("cqTime")) return;
    if (lock || away || document.hidden || window.vdpPaused) return;
    left = Math.max(0, left - dt);
    const el = $("cqTime"), bar = $("cqBar");
    el.textContent = "⏱ ".concat(Math.ceil(left));
    el.classList.toggle("warn", left <= 5);
    bar.style.width = "".concat(left / CERT_TIME * 100, "%");
    if (left <= 5 && !warned) {
      warned = true;
      (_a = sfx.buzzer) == null ? void 0 : _a.call(sfx);
    }
    if (left <= 0) answer(-1);
  }, 200);
  const buyLife = (key, use) => {
    if (C2.bank >= CERT_LIFE_PRICE) {
      C2.bank -= CERT_LIFE_PRICE;
      C2.spent = (C2.spent || 0) + CERT_LIFE_PRICE;
      careerSave(C2);
      track("cert_life_buy", { detail: key });
      toast(L("Подсказка куплена: −".concat(money(CERT_LIFE_PRICE), " · на счёте ").concat(money(C2.bank)), "Lifeline bought: −".concat(money(CERT_LIFE_PRICE), " · balance ").concat(money(C2.bank))));
      use();
    } else if (window.VDP_PLATFORM || window.NO_PAY) toast(L("Подсказка стоит ".concat(money(CERT_LIFE_PRICE), " — на счёте не хватает"), "A lifeline costs ".concat(money(CERT_LIFE_PRICE), " — not enough balance")));
    else {
      away = true;
      openTopup({
        need: lackOf(CERT_LIFE_PRICE),
        why: L("Подсказка в аттестации — ".concat(money(CERT_LIFE_PRICE), " · на счёте ").concat(money(C2.bank), " · таймер на паузе"), "An exam lifeline costs ".concat(money(CERT_LIFE_PRICE), " · you have ").concat(money(C2.bank), " · the timer is paused")),
        then: () => {
          away = false;
          last = performance.now();
          Object.assign(C2, payFix(careerNow()) || {});
          render();
        }
      });
    }
  };
  const lifeBtn = (key, id, ico, label) => {
    const q = qs[i], usedHere = key === "half" ? !!q.gone : false;
    return '<button type="button" class="cq-l'.concat(life[key] ? "" : " buy", '" id="').concat(id, '" ').concat(usedHere ? "disabled" : "", "><b>").concat(ico, "</b><small>").concat(life[key] ? label : L("ещё раз · ".concat(money(CERT_LIFE_PRICE)), "again · ".concat(money(CERT_LIFE_PRICE))), "</small></button>");
  };
  const render = () => {
    const q = qs[i], [ico, topic] = CERT_TOPICS[q.t] || ["❓", ""];
    m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="cqText">\n      <div class="cq-head"><b>📜 '.concat(L("Вопрос ".concat(i + 1, " из ").concat(CERT_N), "Question ".concat(i + 1, " of ").concat(CERT_N)), '</b><span class="cq-time" id="cqTime" role="timer">⏱ ').concat(Math.ceil(left), "</span><span>✓ ").concat(score, " · ").concat(L("нужно ".concat(CERT_PASS), "need ".concat(CERT_PASS)), '</span></div>\n      <div class="cq-timer"><i id="cqBar" style="width:').concat(left / CERT_TIME * 100, '%"></i></div>\n      <div class="cq-dots" aria-hidden="true">').concat(qs.map((x, k) => '<i class="'.concat(k < i ? x.right ? "ok" : "no" : k === i ? "now" : "", " d").concat(x.d, '"></i>')).join(""), '</div>\n      <span class="cq-topic">').concat(ico, " ").concat(esc(topic), " · ").concat(["", L("лёгкий", "easy"), L("средний", "medium"), L("трудный", "hard")][q.d], '</span>\n      <p class="cq-text" id="cqText">').concat(esc(q.q), '</p>\n      <div class="cq-opts">').concat(q.opts.map((o, k) => {
      var _a, _b;
      return '<button type="button" class="cq-opt'.concat(((_a = q.gone) == null ? void 0 : _a.includes(k)) ? " gone" : "", '" data-k="').concat(k, '" ').concat(((_b = q.gone) == null ? void 0 : _b.includes(k)) ? "disabled" : "", "><b>").concat("ABCD"[k], "</b><span>").concat(esc(o), "</span></button>");
    }).join(""), '</div>\n      <div class="cq-help" id="cqHelp" aria-live="polite">').concat(q.help || "", '</div>\n      <div class="cq-life">').concat(lifeBtn("half", "clHalf", "50:50", L("убрать два", "remove two"))).concat(lifeBtn("call", "clCall", "📞", L("звонок другу", "phone a friend"))).concat(lifeBtn("hall", "clHall", "👥", L("помощь зала", "ask the audience")), '</div>\n      <p class="field-note cq-note">').concat(L("".concat(CERT_TIME, " секунд на вопрос. Подсказки — по одной бесплатно, потом по ").concat(money(CERT_LIFE_PRICE), " (на счёте ").concat(money(C2.bank), ")."), "".concat(CERT_TIME, " seconds per question. One free use of each lifeline, then ").concat(money(CERT_LIFE_PRICE), " each (balance ").concat(money(C2.bank), ").")), '</p>\n      <button class="btn-link" type="button" id="cqQuit">').concat(L("Сдаться (попытка сгорит)", "Give up (attempt is lost)"), "</button></div>");
    m.hidden = false;
    const btns = [...m.querySelectorAll(".cq-opt")];
    btns.forEach((b) => b.onclick = () => answer(+b.dataset.k));
    const half = () => {
      var _a;
      life.half = false;
      (_a = sfx.item) == null ? void 0 : _a.call(sfx);
      q.gone = shuffle([0, 1, 2, 3].filter((k) => k !== q.ok)).slice(0, 2);
      render();
    };
    const call = () => {
      var _a;
      life.call = false;
      (_a = sfx.sms) == null ? void 0 : _a.call(sfx);
      const live = [0, 1, 2, 3].filter((k) => {
        var _a2;
        return !((_a2 = q.gone) == null ? void 0 : _a2.includes(k));
      }), sure = [0, 0.92, 0.75, 0.58][q.d];
      const pick = Math.random() < sure ? q.ok : rnd(live.filter((k) => k !== q.ok)), conf = Math.round((sure - 0.1 + Math.random() * 0.2) * 100);
      const [who, wf] = rnd(FRIENDS);
      q.help = '<div class="cq-call">📞 <b>'.concat(esc(who), ":</b> ").concat(L("«Хм… думаю, это <b>".concat("ABCD"[pick], ": ").concat(esc(q.opts[pick]), "</b>. Уверен").concat(wf ? "а" : "", " процентов на ").concat(conf, ".»"), "“Hmm… I think it’s <b>".concat("ABCD"[pick], ": ").concat(esc(q.opts[pick]), "</b>. I’m about ").concat(conf, "% sure.”")), "</div>");
      say(L("Думаю, это ".concat(q.opts[pick]), "I think it's ".concat(q.opts[pick])), { fem: !!wf });
      render();
    };
    const hall = () => {
      var _a;
      life.hall = false;
      (_a = sfx.item) == null ? void 0 : _a.call(sfx);
      const w = [0, 1, 2, 3].map((k) => {
        var _a2;
        return ((_a2 = q.gone) == null ? void 0 : _a2.includes(k)) ? 0 : k === q.ok ? [0, 60, 42, 30][q.d] + Math.random() * 20 : 5 + Math.random() * 22;
      }), sum = w.reduce((a, b) => a + b, 0);
      q.help = '<div class="cq-hall">'.concat(w.map((x, k) => '<div><i style="--h:'.concat(Math.round(x / sum * 100), '%"></i><b>').concat(Math.round(x / sum * 100), "%</b><span>").concat("ABCD"[k], "</span></div>")).join(""), "</div>");
      render();
    };
    for (const [id, key, use] of [["clHalf", "half", half], ["clCall", "call", call], ["clHall", "hall", hall]])
      $(id).onclick = () => {
        if (lock) return;
        life[key] ? use() : buyLife(key, use);
      };
    $("cqQuit").onclick = () => {
      score = Math.min(score, CERT_PASS - 1);
      done();
    };
  };
  render();
}
function certResult(C2, score, after) {
  var _a, _b;
  const m = $("modal"), ok = score >= CERT_PASS, before = C2.salary;
  if (ok) {
    C2.cert = (C2.cert || 0) + 1;
    C2.salary = PAY_BASE + PAY_CERT * C2.cert;
  }
  careerSave(C2);
  track("cert_end", { detail: "".concat(score, ":").concat(ok ? 1 : 0) });
  m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="crTitle"><span class="lvl-ico" aria-hidden="true">'.concat(ok ? "🎓" : "📕", '</span>\n    <h2 id="crTitle">').concat(ok ? L("Аттестация сдана!", "Exam passed!") : L("Не сдано", "Not passed"), '</h2>\n    <p class="cr-score"><b>').concat(score, "</b> / ").concat(CERT_N, "</p>\n    <p>").concat(ok ? L("Оклад вырос: ".concat(money(before), " → <b>").concat(money(C2.salary), "</b> в день. Сданных аттестаций: ").concat(C2.cert, "."), "Pay raise: ".concat(money(before), " → <b>").concat(money(C2.salary), "</b> a day. Exams passed: ").concat(C2.cert, ".")) : L("Нужно минимум ".concat(CERT_PASS, " верных ответов. Новая попытка — завтра, вопросы будут другие."), "You need at least ".concat(CERT_PASS, " right answers. Try again tomorrow — with new questions.")), '</p>\n    <button class="btn-main" type="button" id="crOk">').concat(L("Готово", "Done"), "</button></div>");
  m.hidden = false;
  if (ok) {
    (_a = sfx.win) == null ? void 0 : _a.call(sfx);
    confetti();
  } else (_b = sfx.lose) == null ? void 0 : _b.call(sfx);
  if (C2.hero) {
    const t = lineFor(ok ? "cert_pass" : "cert_fail", heroFem(C2.hero));
    m.querySelector("#crOk").insertAdjacentHTML("beforebegin", '<p class="hero-says">💬 '.concat(esc(C2.hero.name), ": «").concat(esc(t), "»</p>"));
    setTimeout(() => say(t, heroVoice(C2.hero)), 700);
  }
  $("crOk").onclick = () => {
    m.hidden = true;
    if (!views.menu.hidden) renderMenu();
    after == null ? void 0 : after();
  };
}
const certBtnHtml = (C2) => !C2 || C2.week > YEAR ? "" : certCan(C2) ? '<button class="btn-ghost btn-cert" type="button" id="certBtn" style="grid-column:1/-1">📜 '.concat(L("Аттестация: оклад ".concat(money(C2.salary || PAY_BASE), " → ").concat(money(certNextPay(C2))), "Certification: pay ".concat(money(C2.salary || PAY_BASE), " → ").concat(money(certNextPay(C2)))), "</button>") : '<button class="btn-ghost btn-cert" type="button" disabled style="grid-column:1/-1">📜 '.concat(L("Аттестация — снова завтра", "Certification — again tomorrow")).concat(C2.cert ? L(" · сдано: ".concat(C2.cert), " · passed: ".concat(C2.cert)) : "", "</button>");
