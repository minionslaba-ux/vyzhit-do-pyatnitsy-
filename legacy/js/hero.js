/* сгенерировано tools/make-legacy.js из js/hero.js — не править */
const HERO_PRESETS = [
  { id: "m1", g: "m", name: L("Алексей", "Alex"), age: 34, married: true, skin: "#eec1a0", hair: "short", hairColor: "#3b2a20", top: "#e9edf5", tie: "#2f4f8f", jacket: "#2d3a52", bottom: "#2b2f3d", eyes: "#4a6b8a" },
  { id: "m2", g: "m", name: L("Дмитрий", "Dmitry"), age: 27, married: false, skin: "#f1c9a8", hair: "quiff", hairColor: "#8a5a32", top: "#3f8f6b", bottom: "#34507a", eyes: "#5a7a3a" },
  { id: "m3", g: "m", name: L("Игорь", "Igor"), age: 41, married: true, skin: "#e6b48f", hair: "buzz", hairColor: "#6e6a66", beard: true, beardColor: "#57504a", glasses: true, top: "#f2f2f6", tie: "#8f2f3f", bottom: "#3a3a44" },
  { id: "m4", g: "m", name: L("Тимур", "Timur"), age: 29, married: false, skin: "#c98e65", hair: "short", hairColor: "#141414", top: "#d9782e", short: true, bottom: "#b9a27a", eyes: "#2e2016" },
  { id: "m5", g: "m", name: L("Сергей", "Sergey"), age: 38, married: false, skin: "#8d5a3b", hair: "bald", hairColor: "#1d1612", beard: true, beardColor: "#1d1612", glasses: true, top: "#5b3d8f", bottom: "#22242c", eyes: "#2a1a10" },
  { id: "f1", g: "f", name: L("Ольга", "Olga"), age: 32, married: true, skin: "#f0c6a6", hair: "bob", hairColor: "#7a2e1c", top: "#c94f7c", bottom: "#2b2d3a", skirt: true, lips: "#b9485a", eyes: "#3d6b4a" },
  { id: "f2", g: "f", name: L("Анна", "Anna"), age: 26, married: false, skin: "#f5d2b8", hair: "long", hairColor: "#d6b26a", top: "#4fb3c9", bottom: "#3b5f8f", short: true, lips: "#c4646a", eyes: "#3d6a9a" },
  { id: "f3", g: "f", name: L("Марина", "Marina"), age: 37, married: true, skin: "#e0ac85", hair: "bun", hairColor: "#3a2418", glasses: true, top: "#f3e9e1", jacket: "#2f3b52", bottom: "#3a3f55", skirt: true, lips: "#a84a50", eyes: "#4a3a2a" },
  { id: "f4", g: "f", name: L("Екатерина", "Kate"), age: 29, married: false, skin: "#c98e65", hair: "ponytail", hairColor: "#151515", top: "#e0b23a", bottom: "#2b2d3a", lips: "#a24a46", eyes: "#2e2016" },
  { id: "f5", g: "f", name: L("Наталья", "Natalia"), age: 44, married: true, skin: "#efc3a2", hair: "bob", hairColor: "#b9a48a", glasses: true, top: "#7a4f9e", bottom: "#3a2f45", skirt: true, lips: "#a8505a", eyes: "#5a6a7a" }
];
const heroPreset = (h) => HERO_PRESETS.find((p) => p.id === (h == null ? void 0 : h.preset)) || HERO_PRESETS[0];
const heroFem = (h) => heroPreset(h).g === "f";
const heroStatus = (h) => h.married ? heroFem(h) ? L("замужем", "married") : L("женат", "married") : heroFem(h) ? L("не замужем", "single") : L("холост", "single");
const NEEDS = [
  { id: "food", from: 2, price: 6, mood: 10, ico: "🛒", t: L("Нормальные продукты", "Proper groceries"), ask: L("Может, купим наконец нормальной еды? Лапша быстрого приготовления мне уже снится.", "Can we finally buy real food? I’m dreaming about instant noodles.") },
  { id: "utilities", from: 3, every: 4, price: 8, mood: 8, ico: "🧾", t: L("Коммуналка", "Utilities"), ask: L("Пришла квитанция за коммуналку. Заплатим, пока не отключили свет?", "The utility bill came. Shall we pay before they cut the power?") },
  { id: "bday", from: 4, every: 6, price: 5, mood: 8, ico: "🎂", t: L("День рождения коллеги", "Coworker’s birthday"), ask: L("У коллеги день рождения, весь отдел скидывается на подарок. Поучаствуем?", "It’s a coworker’s birthday and the team is chipping in for a gift. Shall we?") },
  { id: "aunt", from: 5, every: 8, price: 7, mood: 10, ico: "👵", t: L("Карманные деньги тёте", "Pocket money for auntie"), ask: L("Тётя звонила — просит немного денег до пенсии. Поможем?", "Auntie called — she needs a little cash until her pension. Help her out?") },
  { id: "flat_rent", from: 6, price: 25, mood: 20, ico: "🏠", t: L("Квартира получше", "A better apartment"), ask: L("Соседи за стенкой опять ругаются до ночи. Давай снимем квартиру получше?", "The neighbors are yelling again. Let’s rent a better place?") },
  { id: "phone", from: 8, price: 18, mood: 12, ico: "📱", t: L("Новый телефон", "A new phone"), ask: L("Телефон садится за час и не тянет рабочий чат. Купим новый?", "My phone dies in an hour and can’t handle the work chat. New one?") },
  { id: "car", from: 11, price: 60, mood: 25, ico: "🚗", t: L("Машина", "A car"), ask: L("Час в метро в одну сторону — это слишком. Может, машину? Пусть подержанную.", "An hour on the subway each way is too much. A car? Even a used one.") },
  { id: "trip", from: 15, price: 35, mood: 25, ico: "🏖️", t: L("Отпуск у моря", "A beach vacation"), ask: L("Хочу к морю хотя бы на неделю. Оплатим поездку?", "I want a week by the sea. Shall we pay for the trip?") },
  {
    id: "wedding",
    from: 19,
    price: 80,
    mood: 30,
    ico: "💍",
    single: true,
    t: (h) => heroFem(h) ? L("Выйти замуж", "Getting married") : L("Свадьба", "The wedding"),
    ask: (h) => heroFem(h) ? L("Он сделал предложение! Свадьба — дело недешёвое: платье, ресторан, гости.", "He proposed! A wedding isn’t cheap: the dress, the venue, the guests.") : L("Она сказала «да»! Свадьба — дело недешёвое: кольца, ресторан, гости.", "She said yes! A wedding isn’t cheap: rings, the venue, the guests.")
  },
  { id: "anniversary", from: 19, every: 13, price: 20, mood: 15, married: true, ico: "💐", t: L("Годовщина свадьбы", "Wedding anniversary"), ask: L("Скоро годовщина свадьбы. Ресторан и подарок — без этого никак.", "Our anniversary is coming. Dinner and a gift — no way around it.") },
  { id: "mortgage", from: 25, price: 120, mood: 35, ico: "🔑", t: L("Первый взнос за квартиру", "Down payment on a flat"), ask: L("Хватит снимать! Давай внесём первый взнос за свою квартиру.", "Enough renting! Let’s make a down payment on our own place.") },
  { id: "repair", from: 32, price: 50, mood: 20, ico: "🛠️", t: L("Ремонт", "Renovation"), ask: L("В квартире пора делать ремонт — обои отклеиваются прямо на созвонах.", "Time to renovate — the wallpaper peels off during video calls.") },
  { id: "gym", from: 38, price: 15, mood: 12, ico: "🏋️", t: L("Спортзал", "Gym membership"), ask: L("Спина болит от офисного кресла. Купим абонемент в спортзал?", "My back hurts from the office chair. Gym membership?") }
];
const needText = (n, h, k) => typeof n[k] === "function" ? n[k](h) : n[k];
const needToon = (n) => n.toon || { car: { kind: "ride", prop: "car" }, trip: { kind: "ride", prop: "boat" } }[n.id] || { kind: "need" };
const XP_COURSE = { price: 20, xp: 60 };
const LOAN_CAP = 150;
function nextNeed(h, week) {
  const fits = (n) => week >= n.from && !(n.single && h.married) && !(n.married && !h.married);
  const fresh = NEEDS.find((n) => fits(n) && !n.every && !h.owned.includes(n.id));
  const due = NEEDS.find((n) => {
    var _a;
    return fits(n) && n.every && week - ((_a = h.last[n.id]) != null ? _a : -99) >= n.every;
  });
  return (h.lastKind === "fresh" ? due || fresh : fresh || due) || null;
}
bus.on("weekEnd", (x) => {
  var _a;
  if (x.mode !== "career") return;
  const C2 = careerNow();
  if (!(C2 == null ? void 0 : C2.hero)) return;
  const h = C2.hero;
  if (h.pending && h.seenWeek) h.mood = Math.max(0, ((_a = h.mood) != null ? _a : 70) - 6);
  if (!h.pending) {
    const n = nextNeed(h, C2.week);
    if (n) {
      h.pending = n.id;
      h.postponed = 0;
      h.seenWeek = 0;
      h.lastKind = n.every ? "due" : "fresh";
    }
  }
  careerSave(C2);
});
bus.on("deck", (S2) => {
  var _a;
  if (S2.mode !== "career" || typeof C === "undefined" || !(C == null ? void 0 : C.hero)) return;
  const h = C.hero, nm = h.name;
  h.mood = Math.max(0, ((_a = h.mood) != null ? _a : 70) - 4);
  if (h.mood < 30) {
    S2.res.psyche = Math.max(5, S2.res.psyche - 10);
    setTimeout(() => toast(L("".concat(nm, " грустит — Кукуха −10"), "".concat(nm, " is upset — Sanity −10"))), 900);
  } else if (h.mood >= 80) {
    S2.res.psyche = Math.min(95, S2.res.psyche + 5);
    setTimeout(() => toast(L("".concat(nm, " счастлив").concat(heroFem(h) ? "а" : "", " — Кукуха +5"), "".concat(nm, " is happy — Sanity +5"))), 900);
  }
  if (h.wantBonus) {
    S2.forceDeadline = true;
    h.wantBonus = false;
  }
  setTimeout(() => {
    const t = lineFor("morning", heroFem(h));
    say(t, heroVoice(h));
    toast("".concat(nm, ": «").concat(t, "»"));
  }, 2600);
  saveCareer();
});
let heroView = null;
const dropView = () => {
  heroView == null ? void 0 : heroView.dispose();
  heroView = null;
};
function heroModal(html, preset, emotion) {
  dropView();
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="heroTitle">'.concat(html, "</div>");
  m.hidden = false;
  const cv = m.querySelector("canvas.hero-cv");
  if (cv) heroViewer(cv, preset, { framing: cv.dataset.framing || "full", emotion }).then((v) => {
    if (v && !m.hidden && cv.isConnected) heroView = v;
    else v == null ? void 0 : v.dispose();
    if (!v) cv.replaceWith(Object.assign(document.createElement("div"), { className: "hero-fallback", textContent: preset.g === "f" ? "👩‍💼" : "👨‍💼" }));
  });
  const close = () => {
    m.hidden = true;
    dropView();
  };
  return { m, close };
}
function heroCreate(done, change = false) {
  var _a;
  if (change && !needReg("hero")) return;
  const old = change ? (_a = careerNow()) == null ? void 0 : _a.hero : null;
  let pick = old ? heroPreset(old) : HERO_PRESETS[0], nameTouched = false;
  const profOpts = Object.entries(PROF).map(([k, p]) => '<option value="'.concat(k, '" ').concat(k === (prefs.prof || "marketer") ? "selected" : "", ">").concat(p.icon, " ").concat(esc(p.name), "</option>")).join("");
  const { m, close } = heroModal('\n    <h2 id="heroTitle">'.concat(old ? L("Сменить персонажа", "Change character") : L("Ваш персонаж", "Your character"), '</h2>\n    <p class="hero-lead">').concat(old ? L("Выберите другую внешность и имя. Настроение, покупки, дети и деньги останутся; одежда — по новой.", "Pick a new look and name. Mood, purchases, kids and money stay; the outfit resets.") : L("Он будет жить вашей карьерой: просить еду, жильё, машину, отпуск — всё стоит денег. Покрутите пальцем, чтобы рассмотреть.", "They live off your career: food, a home, a car, vacations — it all costs money. Drag to look around."), '</p>\n    <div class="hero-pick">\n      <canvas class="hero-cv" data-framing="full" aria-label="').concat(L("Персонаж в 3D", "3D character"), '"></canvas>\n      <div class="hero-side">\n        <b class="hero-nm" id="hcName"></b><small id="hcSub"></small>\n        <label class="field"><span>').concat(L("Имя", "Name"), '</span><input type="text" id="hcInput" maxlength="16" autocomplete="off"></label>\n        ').concat(old ? "" : '<label class="field"><span>'.concat(L("Профессия", "Job"), '</span><select id="hcProf">').concat(profOpts, "</select></label>"), '\n      </div>\n    </div>\n    <div class="hero-grid" id="hcGrid">').concat(HERO_PRESETS.map((p, i) => '<button type="button" class="hero-thumb'.concat(p === pick ? " on" : "", '" data-i="').concat(i, '" aria-label="').concat(esc(p.name), '"><img alt=""><span>').concat(esc(p.name), "<small>").concat(p.married ? "💍" : "", "</small></span></button>")).join(""), '</div>\n    <button class="btn-main" type="button" id="hcGo">').concat(old ? L("Сменить", "Change") : L("Начать карьеру", "Start the career"), "</button>").concat(old ? '<button class="btn-ghost" type="button" id="hcCancel">'.concat(L("Отмена", "Cancel"), "</button>") : ""), pick, "happy");
  const show = () => {
    $("hcName").textContent = $("hcInput").value || pick.name;
    $("hcSub").textContent = "".concat(pick.age, " ").concat(L("лет", "y.o."), " · ").concat(pick.married ? pick.g === "f" ? L("замужем", "married") : L("женат", "married") : pick.g === "f" ? L("не замужем", "single") : L("холост", "single"));
  };
  $("hcInput").value = old ? old.name : pick.name;
  show();
  if (old) $("hcCancel").onclick = () => {
    close();
    done == null ? void 0 : done();
  };
  $("hcInput").oninput = () => {
    nameTouched = true;
    show();
  };
  m.querySelectorAll(".hero-thumb").forEach((b) => b.onclick = () => {
    pick = HERO_PRESETS[+b.dataset.i];
    m.querySelectorAll(".hero-thumb").forEach((x) => x.classList.toggle("on", x === b));
    if (!nameTouched) $("hcInput").value = pick.name;
    heroView == null ? void 0 : heroView.setPreset(pick);
    show();
  });
  heroSnapshots(HERO_PRESETS).then((imgs) => m.querySelectorAll(".hero-thumb img").forEach((im, i) => {
    im.src = imgs[i];
  })).catch(() => {
  });
  $("hcGo").onclick = () => {
    var _a2, _b, _c;
    const name = ($("hcInput").value || pick.name).trim().replace(/\s+/g, " ").slice(0, 16) || pick.name;
    const C2 = careerNow();
    if (old) {
      C2.hero = { ...old, preset: pick.id, name, wear: {}, wearPrev: {} };
      if (old.preset !== pick.id) for (const k of C2.hero.kids || []) Object.assign(k.look, { skin: pick.skin, eyes: pick.eyes, hairColor: pick.hairColor });
      careerSave(C2);
      close();
      (_a2 = sfx.item) == null ? void 0 : _a2.call(sfx);
      track("hero_change", { detail: pick.id });
      toast(L("Теперь вы играете за: ".concat(name), "You’re now playing as ".concat(name)));
      return done == null ? void 0 : done();
    }
    C2.prof = prefs.prof = $("hcProf").value;
    store.set(KEY.prefs, prefs);
    C2.hero = { preset: pick.id, name, married: pick.married, mood: 70, owned: [], last: {}, pending: null, xpWeek: 0, breaks: 0 };
    ensureKids(C2.hero);
    C2.res = freshRes((_b = VACANCIES.find((v) => v.name === C2.company)) == null ? void 0 : _b.perk);
    careerSave(C2);
    close();
    (_c = sfx.win) == null ? void 0 : _c.call(sfx);
    toast(L("Знакомьтесь: ".concat(name, ". Берегите настроение — и кошелёк"), "Meet ".concat(name, ". Mind their mood — and your wallet")));
    done == null ? void 0 : done();
  };
}
const loanCost = (n) => Math.round(n.price * 1.2);
function fulfill(C2, h, n, credit) {
  var _a, _b;
  if (credit) {
    if ((C2.loan || 0) + loanCost(n) > LOAN_CAP) return false;
    C2.loan = (C2.loan || 0) + loanCost(n);
  } else {
    if (C2.bank < n.price) return false;
    C2.bank -= n.price;
    C2.spent = (C2.spent || 0) + n.price;
  }
  h.mood = Math.min(100, ((_a = h.mood) != null ? _a : 70) + n.mood);
  if (n.every) h.last[n.id] = C2.week;
  else if (!h.owned.includes(n.id)) h.owned.push(n.id);
  if (n.id === "wedding") h.married = true;
  if (h.pending === n.id) h.pending = null;
  careerSave(C2);
  (_b = sfx.coins) == null ? void 0 : _b.call(sfx);
  track("hero_buy", { detail: "need:".concat(n.id, ":").concat(n.price) });
  toast(credit ? L("".concat(n.ico, " Куплено в кредит. Долг банку: ").concat(money(C2.loan)), "".concat(n.ico, " Bought on credit. You owe the bank ").concat(money(C2.loan))) : L("".concat(n.ico, " Куплено! ").concat(h.name, " доволен").concat(heroFem(h) ? "а" : ""), "".concat(n.ico, " Done! ").concat(h.name, " is happy")));
  return true;
}
function needState(n, h, week) {
  if (n.single && h.married && !h.owned.includes(n.id)) return { hide: true };
  if (n.married && !h.married) return { hide: true };
  if (!n.every && h.owned.includes(n.id)) return { st: "owned" };
  if (week < n.from) return { st: "locked" };
  if (n.every && h.last[n.id] != null && week - h.last[n.id] < n.every) return { st: "paid", left: n.every - (week - h.last[n.id]) };
  return { st: "open" };
}
function heroShop() {
  var _a;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h) return;
  dropView();
  if (!((_a = h.kids) == null ? void 0 : _a.length)) {
    ensureKids(h);
    careerSave(C2);
  }
  const m = $("modal");
  const render = () => {
    const rows = NEEDS.map((n) => ({ n, s: needState(n, h, C2.week) })).filter((x) => !x.s.hide);
    m.innerHTML = '<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="hsTitle">\n      <h2 id="hsTitle">🛍️ '.concat(L("Покупки", "Shopping"), " · ").concat(esc(h.name), '</h2>\n      <p class="hero-lead">').concat(L("На счёте ".concat(money(C2.bank)).concat(C2.loan ? " · кредит ".concat(money(C2.loan)) : "", " — купленное радует, настроение растёт"), "Balance ".concat(money(C2.bank)).concat(C2.loan ? " · loan ".concat(money(C2.loan)) : "", " — purchases lift their mood")), "</p>\n      ").concat(moodScaleHtml(h), '\n      <h3 class="hs-h">').concat(L("Подарки и мелочи", "Treats & little things"), '</h3>\n      <div class="hs-cats">').concat(GOODS.map((g) => '<button type="button" class="hs-cat" data-cat="'.concat(g.id, '"><span aria-hidden="true">').concat(g.ico, "</span><b>").concat(esc(g.t), "</b><small>").concat(L("".concat(g.items.length, " вар. · от ").concat(money(Math.min(...g.items.map((x) => x.price)))), "".concat(g.items.length, " options · from ").concat(money(Math.min(...g.items.map((x) => x.price))))), "</small></button>")).join(""), '</div>\n      <h3 class="hs-h">').concat(L("Дети", "Kids"), "</h3>").concat(kidsHtml(h), '\n      <h3 class="hs-h">').concat(L("Питомцы", "Pets"), "</h3>").concat(petsHtml(h), '\n      <h3 class="hs-h">').concat(L("Большие цели", "Big goals"), '</h3>\n      <div class="hs-list">').concat(rows.map(({ n, s }) => '<div class="hs-row '.concat(s.st, '">\n        <span class="hs-ico" aria-hidden="true">').concat(n.ico, '</span>\n        <span class="hs-txt"><b>').concat(esc(needText(n, h, "t")), "</b><small>").concat(money(n.price), " · ").concat(L("настроение +".concat(n.mood), "mood +".concat(n.mood))).concat(n.every ? L(" · раз в ".concat(n.every, " нед."), " · every ".concat(n.every, " wk")) : "", '</small></span>\n        <span class="hs-act">').concat(s.st === "owned" ? "<em>✓ ".concat(L("есть", "owned"), "</em>") : s.st === "paid" ? "<em>✓ ".concat(L("снова через ".concat(s.left, " нед."), "again in ".concat(s.left, " wk")), "</em>") : s.st === "locked" ? "<em>".concat(L("с ".concat(n.from, "-й недели"), "from week ".concat(n.from)), "</em>") : "".concat(C2.bank < n.price ? '<button class="btn-chip tu-btn" type="button" data-topup="'.concat(lackOf(n.price), '" data-topup-back="heroShop">💰 ').concat(money(n.price), "</button>") : '<button class="btn-chip" type="button" data-buy="'.concat(n.id, '">').concat(money(n.price), "</button>"), '<button class="btn-chip" type="button" data-loan="').concat(n.id, '" ').concat((C2.loan || 0) + loanCost(n) > LOAN_CAP ? "disabled" : "", ">").concat(L("в кредит", "credit"), "</button>"), "</span></div>")).join(""), '</div>\n      <button class="btn-ghost" type="button" id="hsClose">').concat(L("Закрыть", "Close"), "</button></div>");
    m.querySelectorAll("[data-buy],[data-loan]").forEach((b) => b.onclick = () => {
      const n = NEEDS.find((x) => x.id === (b.dataset.buy || b.dataset.loan));
      if (fulfill(C2, h, n, !!b.dataset.loan)) playToon({ ...needToon(n), need: n, mood: n.mood, h }, heroShop);
    });
    m.querySelectorAll("[data-cat]").forEach((b) => b.onclick = () => goodsPicker(b.dataset.cat, heroShop));
    m.querySelectorAll("[data-kid]").forEach((b) => b.onclick = () => kidShop(+b.dataset.kid, heroShop));
    bindPets(m, heroShop);
    $("hsClose").onclick = () => {
      m.hidden = true;
      renderMenu();
    };
  };
  render();
  m.hidden = false;
}
function heroAsk() {
  var _a, _b;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!(h == null ? void 0 : h.pending)) return;
  const n = NEEDS.find((x) => x.id === h.pending);
  if (!n) {
    h.pending = null;
    careerSave(C2);
    return;
  }
  h.seenWeek = C2.week;
  careerSave(C2);
  const plead = ((_b = (_a = n.say) == null ? void 0 : _a.ask) == null ? void 0 : _b.length) ? genderLine(rnd(n.say.ask), heroFem(h)) : lineFor("plead", heroFem(h));
  setTimeout(() => say("".concat(genderLine(needText(n, h, "ask"), heroFem(h)), " ").concat(plead), heroVoice(h)), 350);
  const p = heroLook(h), can = C2.bank >= n.price, loanOk = (C2.loan || 0) + loanCost(n) <= LOAN_CAP;
  const { m, close } = heroModal('\n    <div class="hero-ask">\n      <canvas class="hero-cv" data-framing="full"></canvas>\n      <div class="hero-bubble"><b id="heroTitle">'.concat(n.ico, " ").concat(esc(needText(n, h, "t")), "</b><p>«").concat(esc(genderLine(needText(n, h, "ask"), heroFem(h))), '»</p><p class="say">«').concat(esc(plead), "»</p><span>— ").concat(esc(h.name), '</span></div>\n    </div>\n    <div class="money"><div><b>').concat(money(n.price), "</b><span>").concat(L("стоит", "costs"), "</span></div><div><b>").concat(money(C2.bank), "</b><span>").concat(L("на счёте", "balance"), '</span></div></div>\n    <div class="hero-acts">\n      ').concat(can ? '<button class="btn-main" type="button" id="haPay">'.concat(L("Купить за ".concat(money(n.price)), "Buy for ".concat(money(n.price))), "</button>") : topupBtn(lackOf(n.price), "heroAsk", L("".concat(h.name, " просит: ").concat(needText(n, h, "t"), " за ").concat(money(n.price)), "".concat(h.name, " wants: ").concat(needText(n, h, "t"), " for ").concat(money(n.price))), "btn-main tu-btn") + adChip(), '\n      <button class="btn-ghost" type="button" id="haLoan" ').concat(loanOk ? "" : "disabled", ">").concat(loanOk ? L("В кредит: вернуть ".concat(money(loanCost(n))), "On credit: repay ".concat(money(loanCost(n)))) : L("Банк больше не даёт кредит", "The bank won’t lend more"), '</button>\n      <button class="btn-ghost" type="button" id="haBonus" ').concat(h.wantBonus ? "disabled" : "", ">").concat(h.wantBonus ? L("Задача на премию уже ждёт", "A bonus task is already lined up") : L("📋 Взять задачу на премию", "📋 Take a bonus task"), '</button>\n      <button class="btn-link" type="button" id="haLater">').concat(L("Отложить (".concat(h.name, " расстроится)"), "Later (".concat(h.name, " will be upset)")), "</button>\n    </div>"), p, "ask");
  const back = () => {
    if (!views.menu.hidden) renderMenu();
  };
  const bought = (ok) => {
    if (!ok) return;
    close();
    playToon({ ...needToon(n), need: n, mood: n.mood, h }, back);
  };
  if ($("haPay")) $("haPay").onclick = () => bought(fulfill(C2, h, n, false));
  $("haLoan").onclick = () => bought(fulfill(C2, h, n, true));
  $("haBonus").onclick = () => {
    h.wantBonus = true;
    careerSave(C2);
    close();
    toast(L("📋 В начале следующей недели придёт задача с премией — заработайте и купите", "📋 A bonus task will arrive at the start of next week — earn it and buy"));
    back();
  };
  $("haLater").onclick = () => {
    var _a2;
    h.postponed = (h.postponed || 0) + 1;
    h.mood = Math.max(0, ((_a2 = h.mood) != null ? _a2 : 70) - 12);
    if (h.postponed >= 3) {
      h.pending = null;
      h.mood = Math.max(0, h.mood - 10);
      if (n.every) h.last[n.id] = C2.week;
    }
    careerSave(C2);
    heroView == null ? void 0 : heroView.setEmotion("sad");
    const t = speak("sad", heroVoice(h));
    toast("".concat(h.name, ": «").concat(t, "»"));
    setTimeout(() => {
      close();
      back();
    }, 1100);
  };
}
function heroCourse() {
  var _a;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h) return;
  if (h.xpWeek === C2.week) return toast(L("На этой неделе курсы уже пройдены", "You’ve already taken a course this week"));
  if (C2.bank < XP_COURSE.price) return openTopup({ need: lackOf(XP_COURSE.price), why: L("Курсы стоят ".concat(money(XP_COURSE.price), " · на счёте ").concat(money(C2.bank)), "The course costs ".concat(money(XP_COURSE.price), " · you have ").concat(money(C2.bank))), then: renderMenu });
  C2.bank -= XP_COURSE.price;
  h.xpWeek = C2.week;
  careerSave(C2);
  addXp(XP_COURSE.xp);
  (_a = sfx.item) == null ? void 0 : _a.call(sfx);
  toast(L("📚 Курсы повышения квалификации: +".concat(XP_COURSE.xp, " опыта"), "📚 Training course: +".concat(XP_COURSE.xp, " XP")));
  renderMenu();
}
let cardView = null, cardKey = "";
function heroCard() {
  var _a, _b, _c, _d, _e;
  const box = $("heroCard");
  if (!box) return;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h || views.menu.hidden) {
    box.hidden = true;
    cardView == null ? void 0 : cardView.dispose();
    cardView = null;
    cardKey = "";
    return;
  }
  if (!((_a = h.kids) == null ? void 0 : _a.length)) {
    ensureKids(h);
    careerSave(C2);
  }
  const n = h.pending && NEEDS.find((x) => x.id === h.pending), mood = (_b = h.mood) != null ? _b : 70, p = heroLook(h), key = h.preset + JSON.stringify(h.wear || {});
  box.hidden = false;
  const keepCv = cardView && cardKey === key && box.querySelector("canvas");
  if (keepCv) keepCv.remove();
  box.innerHTML = '<canvas class="hero-cv hero-mini" data-framing="bust" aria-label="'.concat(esc(h.name), '"></canvas>\n    <div class="hero-info"><b>').concat(esc(h.name), "</b><small>").concat(((_c = PROF[C2.prof]) == null ? void 0 : _c.icon) || "", " ").concat(esc(profLabel(C2.prof)), " · ").concat(heroStatus(h), "</small>\n      ").concat(moodScaleHtml(h), "<small>").concat(L("Счёт", "Balance"), " ").concat(money(C2.bank)).concat(C2.loan ? " · ".concat(L("кредит", "loan"), " ").concat(money(C2.loan)) : "", "</small>\n      ").concat(n ? '<button class="btn-main hero-req" type="button" id="hcAsk">'.concat(n.ico, " ").concat(L("Просит", "Wants"), ": ").concat(esc(needText(n, h, "t")), " · ").concat(money(n.price), "</button>") : '<small class="hero-ok">'.concat(L("Сейчас ничего не просит", "Not asking for anything right now"), "</small>"), '\n      <span class="hero-btns"><button class="btn-chip" type="button" id="hcShop">🛍️ ').concat(L("Покупки", "Shopping"), "</button>").concat(topupBtn(0, ""), '\n      <button class="btn-chip" type="button" id="hcCourse" ').concat(h.xpWeek === C2.week ? "disabled" : "", ">📚 ").concat(L("Курсы +".concat(XP_COURSE.xp, " опыта — ").concat(money(XP_COURSE.price)), "Course +".concat(XP_COURSE.xp, " XP — ").concat(money(XP_COURSE.price))), '</button>\n      <button class="btn-chip" type="button" id="hcChange">🔄 ').concat(L("Сменить персонажа", "Change character"), "</button></span>\n      <small>").concat(L("Дети", "Kids"), ":</small>").concat(kidsHtml(h), "\n      <small>").concat(L("Питомцы", "Pets"), ":</small>").concat(petsHtml(h), "\n      ").concat(h.owned.length || ((_d = h.have) == null ? void 0 : _d.length) ? '<span class="hero-owned">'.concat([...h.owned.map((id) => {
    var _a2;
    return ((_a2 = NEEDS.find((x) => x.id === id)) == null ? void 0 : _a2.ico) || "";
  }), ...(h.have || []).map((id) => {
    var _a2;
    return ((_a2 = GOODS.flatMap((g) => g.items).find((x) => x.id === id)) == null ? void 0 : _a2.ico) || "";
  })].join(" "), "</span>") : "", "</div>");
  if (keepCv) box.querySelector("canvas").replaceWith(keepCv);
  (_e = $("hcAsk")) == null ? void 0 : _e.addEventListener("click", heroAsk);
  $("hcCourse").onclick = heroCourse;
  $("hcShop").onclick = heroShop;
  $("hcChange").onclick = () => heroCreate(renderMenu, true);
  box.querySelectorAll("[data-kid]").forEach((b) => b.onclick = () => {
    const k = h.kids[+b.dataset.kid];
    say(lineFor("kid_tap", k.g === "f"), kidVoice(k));
    kidShop(+b.dataset.kid, renderMenu);
  });
  bindPets(box, renderMenu);
  const cvEl = box.querySelector("canvas");
  if (cvEl) cvEl.onclick = () => {
    const t = lineFor(mood < 45 ? "tap_sad" : "tap_happy", heroFem(h));
    say(t, heroVoice(h));
    toast("".concat(h.name, ": «").concat(t, "»"));
    cardView == null ? void 0 : cardView.setEmotion(mood < 45 ? "sad" : "happy");
  };
  const emotion = n ? "ask" : mood < 30 ? "sad" : mood >= 70 ? "happy" : "neutral";
  if (cardView && cardKey === key) cardView.setEmotion(emotion);
  else {
    cardView == null ? void 0 : cardView.dispose();
    cardView = null;
    cardKey = key;
    const cv = box.querySelector("canvas");
    heroViewer(cv, p, { framing: "bust", emotion }).then((v) => {
      if (v && cv.isConnected) cardView = v;
      else v == null ? void 0 : v.dispose();
    });
  }
  if (n && h.seenWeek !== C2.week && $("modal").hidden) setTimeout(() => {
    if (!views.menu.hidden && $("modal").hidden) heroAsk();
  }, 900);
}
bus.on("menu", heroCard);
