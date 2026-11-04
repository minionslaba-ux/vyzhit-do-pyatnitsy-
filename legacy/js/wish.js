/* сгенерировано tools/make-legacy.js из js/wish.js — не править */
const GOODS = [
  { id: "flowers", ico: "💐", toon: "delivery", kind: "pick", t: L("Цветы", "Flowers"), items: [
    { id: "daisy", ico: "🌼", price: 3, mood: 8, t: L("Букет ромашек", "Daisies") },
    { id: "tulips", ico: "🌷", price: 5, mood: 12, t: L("Тюльпаны", "Tulips") },
    { id: "roses", ico: "🌹", price: 9, mood: 18, t: L("Розы", "Roses") },
    { id: "peonies", ico: "💐", price: 12, mood: 22, t: L("Пионы в шляпной коробке", "Peonies in a hatbox") }
  ] },
  { id: "sweets", ico: "🍬", toon: "delivery", kind: "pick", t: L("Сладкое", "Sweets"), items: [
    { id: "bar", ico: "🍫", price: 2, mood: 5, t: L("Шоколадка", "Chocolate bar") },
    { id: "macarons", ico: "🧁", price: 4, mood: 8, t: L("Макаруны", "Macarons") },
    { id: "candybox", ico: "🎁", price: 5, mood: 10, t: L("Коробка конфет", "Box of chocolates") },
    { id: "cake", ico: "🎂", price: 8, mood: 14, t: L("Торт", "A cake") }
  ] },
  { id: "phone", ico: "📱", toon: "phone", kind: "pick", t: L("Баланс телефона", "Phone credit"), items: [
    { id: "ph3", ico: "📶", price: 3, mood: 5, t: L("Пополнить на 3 у.е.", "Top up $3") },
    { id: "ph5", ico: "📶", price: 5, mood: 8, t: L("Пополнить на 5 у.е.", "Top up $5") },
    { id: "ph10", ico: "🚀", price: 10, mood: 12, t: L("Безлимит на месяц", "Unlimited for a month") }
  ] },
  { id: "groceries", ico: "🛒", toon: "market", kind: "cart", t: L("Продукты", "Groceries"), cap: 25, items: [
    { id: "bread", ico: "🍞", price: 1, mood: 1, t: L("Хлеб", "Bread") },
    { id: "milk", ico: "🥛", price: 1, mood: 1, t: L("Молоко", "Milk") },
    { id: "eggs", ico: "🥚", price: 1, mood: 1, t: L("Яйца", "Eggs") },
    { id: "pasta", ico: "🍝", price: 1, mood: 2, t: L("Паста", "Pasta") },
    { id: "veg", ico: "🥦", price: 2, mood: 2, t: L("Овощи", "Vegetables") },
    { id: "fruit", ico: "🍎", price: 2, mood: 2, t: L("Фрукты", "Fruit") },
    { id: "cheese", ico: "🧀", price: 2, mood: 3, t: L("Сыр", "Cheese") },
    { id: "coffee", ico: "☕", price: 2, mood: 3, t: L("Кофе в зёрнах", "Coffee beans") },
    { id: "icecream", ico: "🍦", price: 2, mood: 3, t: L("Мороженое", "Ice cream") },
    { id: "avocado", ico: "🥑", price: 2, mood: 3, t: L("Авокадо", "Avocados") },
    { id: "chicken", ico: "🍗", price: 3, mood: 3, t: L("Курица", "Chicken") },
    { id: "fish", ico: "🐟", price: 4, mood: 4, t: L("Красная рыба", "Salmon") }
  ] },
  { id: "clothes", ico: "👗", toon: "wear", kind: "wear", t: L("Одежда", "Clothes"), items: [
    { id: "tee", ico: "👕", price: 4, mood: 6, t: L("Белая футболка", "White T-shirt"), wear: { top: "#f2f2f4", short: true, jacket: "", tie: "", dress: false } },
    { id: "hoodie", ico: "🧶", price: 7, mood: 9, t: L("Худи «Пятница»", "“Friday” hoodie"), wear: { top: "#ff5c8a", short: false, jacket: "", tie: "", dress: false } },
    {
      id: "shirt",
      ico: "👔",
      price: 9,
      mood: 10,
      t: (g) => g === "f" ? L("Шёлковая блузка", "Silk blouse") : L("Рубашка с галстуком", "Shirt and tie"),
      wear: (g) => g === "f" ? { top: "#f6dfe8", short: false, jacket: "", tie: "", dress: false } : { top: "#dfe8f7", short: false, jacket: "", tie: "#7a2a3a", dress: false }
    },
    { id: "blazer", ico: "🧥", price: 12, mood: 12, t: L("Приталенный пиджак", "Tailored blazer"), wear: { jacket: "#1f2a44", dress: false, short: false } },
    {
      id: "gala",
      ico: "✨",
      price: 17,
      mood: 20,
      t: (g) => g === "f" ? L("Вечернее платье", "Evening dress") : L("Костюм-тройка", "Three-piece suit"),
      wear: (g) => g === "f" ? { dress: true, top: "#9b1d40", jacket: "", tie: "", heels: true, short: false } : { jacket: "#1d1d22", bottom: "#1d1d22", top: "#ffffff", tie: "#141418", short: false }
    },
    {
      id: "jeans",
      ico: "👖",
      price: 6,
      mood: 7,
      t: (g) => g === "f" ? L("Юбка-карандаш", "Pencil skirt") : L("Джинсы", "Jeans"),
      wear: (g) => g === "f" ? { skirt: true, dress: false, bottom: "#1e1e26" } : { bottom: "#3a5a8a" }
    },
    { id: "sneakers", ico: "👟", price: 8, mood: 8, t: L("Белые кроссовки", "White sneakers"), wear: { shoes: "#f5f5f5", heels: false } }
  ] },
  { id: "fun", ico: "🎟️", toon: "outing", kind: "pick", t: L("Досуг", "Going out"), items: [
    { id: "latte", ico: "☕", price: 1, mood: 3, t: L("Кофе с собой", "Coffee to go") },
    { id: "book", ico: "📖", price: 3, mood: 6, t: L("Новая книга", "A new book") },
    { id: "cinema", ico: "🎬", price: 4, mood: 9, t: L("Кино с попкорном", "Movie and popcorn") },
    { id: "dinner", ico: "🍷", price: 10, mood: 16, t: L("Ужин в ресторане", "Dinner out") },
    { id: "spa", ico: "💆", price: 12, mood: 18, t: L("День в спа", "Spa day") },
    { id: "concert", ico: "🎸", price: 15, mood: 20, t: L("Концерт любимой группы", "Favorite band’s concert") }
  ] },
  { id: "beauty", ico: "💅", toon: "salon", kind: "pick", t: L("Красота и уход", "Beauty & care"), items: [
    { id: "manicure", ico: "💅", price: 4, mood: 9, g: "f", t: L("Маникюр", "Manicure") },
    { id: "pedicure", ico: "🦶", price: 5, mood: 9, g: "f", t: L("Педикюр", "Pedicure") },
    { id: "cosmetologist", ico: "🧖", price: 9, mood: 14, t: L("Косметолог: уход за лицом", "Facial at the beautician") },
    { id: "hair", ico: "💇", price: 5, mood: 9, g: "f", t: L("Стрижка и укладка", "Haircut and styling") },
    { id: "barber", ico: "💈", price: 4, mood: 9, g: "m", t: L("Барбершоп: стрижка и борода", "Barbershop: cut and beard trim") },
    { id: "makeup", ico: "💄", price: 6, mood: 10, g: "f", t: L("Набор косметики", "Makeup set") },
    { id: "perfume", ico: "🌸", price: 8, mood: 12, t: L("Парфюм", "Perfume") },
    { id: "massage", ico: "💆", price: 7, mood: 12, t: L("Массаж спины", "Back massage") }
  ] },
  { id: "hobby", ico: "🎣", kind: "pick", t: L("Хобби и транспорт", "Hobbies & rides"), items: [
    { id: "rod", ico: "🎣", price: 6, mood: 10, own: true, toon: "fish", t: L("Удочка", "Fishing rod") },
    { id: "bike", ico: "🚲", price: 15, mood: 14, own: true, toon: "ride", prop: "bike", t: L("Велосипед", "Bicycle") },
    { id: "escooter", ico: "🛴", price: 18, mood: 14, own: true, toon: "ride", prop: "scooter", t: L("Электросамокат", "E-scooter") },
    { id: "console", ico: "🎮", price: 25, mood: 16, own: true, toon: "game", t: L("Игровая приставка", "Game console") },
    { id: "tent", ico: "⛺", price: 12, mood: 14, toon: "outing", t: L("Поход с палаткой", "Camping trip") },
    { id: "workshop", ico: "🎨", price: 7, mood: 10, toon: "outing", t: L("Мастер-класс по живописи", "Painting workshop") },
    { id: "boat", ico: "🚤", price: 45, mood: 28, own: true, toon: "ride", prop: "boat", t: L("Моторная лодка", "Motorboat") },
    { id: "moto", ico: "🏍️", price: 70, mood: 32, own: true, toon: "ride", prop: "moto", t: L("Мотоцикл", "Motorcycle") }
  ] }
];
const KID_GOODS = [
  { id: "k_ball", ico: "⚽", price: 2, mood: 8, own: true, toon: "outing", t: L("Футбольный мяч", "Football"), ask: L("Во дворе играют в футбол, а мяча нет только у меня!", "Everyone plays football outside, and I’m the only one without a ball!") },
  { id: "k_bag", ico: "🎒", price: 4, mood: 8, toon: "delivery", t: L("Рюкзак к школе", "School backpack"), ask: L("У рюкзака оторвалась лямка. Купим новый?", "My backpack strap tore off. Can we get a new one?") },
  { id: "k_lego", ico: "🧱", price: 5, mood: 10, toon: "delivery", t: L("Конструктор", "Building set"), ask: L("Там такой конструктор — с космической станцией! Пожалуйста!", "There’s this building set — with a space station! Please!") },
  { id: "k_shoes", ico: "👟", price: 6, mood: 9, toon: "delivery", t: L("Кроссовки", "Sneakers"), ask: L("Кроссовки малы, пальцы упираются. Купим новые?", "My sneakers are too small. New ones?") },
  { id: "k_skate", ico: "🛹", price: 6, mood: 12, own: true, toon: "ride", prop: "skate", t: L("Скейтборд", "Skateboard"), ask: L("Хочу научиться кататься на скейте, как старшие ребята!", "I want to learn to skateboard like the big kids!") },
  { id: "k_scooter", ico: "🛴", price: 7, mood: 12, own: true, toon: "ride", prop: "scooter", t: L("Самокат", "Kick scooter"), ask: L("Все в школу на самокатах, а я пешком…", "Everyone rides scooters to school, and I walk…") },
  { id: "k_music", ico: "🎹", price: 8, mood: 10, toon: "outing", t: L("Уроки музыки", "Music lessons"), ask: L("Можно мне на пианино? Учительница сказала, у меня слух!", "Can I take piano lessons? The teacher says I have an ear!") },
  { id: "k_party", ico: "🎂", price: 8, mood: 16, toon: "need", t: L("День рождения с друзьями", "Birthday party with friends"), ask: L("Скоро мой день рождения! Можно позвать весь класс?", "My birthday is coming! Can I invite the whole class?") },
  { id: "k_bike", ico: "🚲", price: 10, mood: 16, own: true, toon: "ride", prop: "bike", t: L("Велосипед", "Bicycle"), ask: L("У всех во дворе велики, а я бегаю за ними пешком!", "All the kids have bikes, and I have to run after them!") },
  { id: "k_phone", ico: "📱", price: 12, mood: 16, own: true, toon: "phone", t: L("Новый телефон", "A new phone"), ask: L("Мой телефон с трещиной и не тянет игры. У всех уже новые!", "My phone is cracked and can’t run games. Everyone has a new one!") },
  { id: "k_camp", ico: "⛺", price: 15, mood: 18, toon: "outing", t: L("Летний лагерь", "Summer camp"), ask: L("Друзья едут в лагерь на море. Отпустишь?", "My friends are going to a seaside camp. Can I go?") },
  { id: "k_console", ico: "🎮", price: 20, mood: 20, own: true, toon: "game", t: L("Игровая приставка", "Game console"), ask: L("Ну пожа-а-алуйста, приставку! Я буду делать уроки, честно!", "Plee-ease, a game console! I’ll do my homework, I promise!") }
];
const goodsCat = (id) => GOODS.find((g) => g.id === id);
const goodText = (x, h, k = "t") => typeof x[k] === "function" ? x[k](heroPreset(h).g) : x[k];
const heroLook = (h) => ({ ...heroPreset(h), ...(h == null ? void 0 : h.wear) || {} });
const MOOD_ZONES = [
  { from: 80, ico: "😍", t: L("счастье", "happy") },
  { from: 50, ico: "🙂", t: L("в порядке", "fine") },
  { from: 20, ico: "😟", t: L("грустит", "down") },
  { from: 0, ico: "😭", t: L("на грани срыва", "about to snap") }
];
const moodZone = (m) => MOOD_ZONES.find((z) => m >= z.from);
const BREAKS_MAX = 3;
const ROLLBACK = { 2: 1, 3: 2 };
const moodScaleHtml = (h) => {
  var _a;
  const m = (_a = h.mood) != null ? _a : 70, z = moodZone(m), b = h.breaks || 0;
  return '<div class="mood-scale" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'.concat(m, '" aria-label="').concat(L("Настроение", "Mood"), '">\n      <div class="hero-mood"><i style="--v:').concat(m, '"></i><s style="left:20%"></s><s style="left:50%"></s><s style="left:80%"></s></div>\n      <small>').concat(z.ico, " ").concat(L("Настроение", "Mood"), " ").concat(m, "/100 · ").concat(z.t, '</small>\n      <small class="breaks" title="').concat(L("Срывы: 2-й — откат на 1 неделю, 3-й — на 2 недели", "Breakdowns: 2nd — back 1 week, 3rd — back 2 weeks"), '">').concat(L("Срывы", "Breakdowns"), " ").concat("💔".repeat(b)).concat("🤍".repeat(BREAKS_MAX - b), " <span>").concat(L("2 — откат на неделю, 3 — на две", "2 — back 1 week, 3 — back 2"), "</span></small></div>");
};
bus.on("weekEnd", (x) => {
  var _a;
  if (x.mode !== "career") return;
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h) return;
  const m = (_a = h.mood) != null ? _a : 70, nm = h.name, fem = heroFem(h);
  let why = "";
  if (m < 20) why = L("".concat(nm, " неделю был").concat(fem ? "а" : "", " на грани — и сорвал").concat(fem ? "ась" : "ся", "."), "".concat(nm, " spent the week on the edge — and snapped."));
  else if (!x.won && m < 40) why = L("Увольнение при плохом настроении — дома скандал.", "Getting fired while ".concat(nm, " was already down — a huge fight at home."));
  else if (m >= 80 && h.breaks) {
    h.breaks--;
    careerSave(C2);
    setTimeout(() => toast(L("".concat(nm, " счастлив").concat(fem ? "а" : "", " — один срыв забыт 💞"), "".concat(nm, " is happy — one breakdown forgiven 💞"))), 1600);
  }
  if (why) {
    h.breaks = (h.breaks || 0) + 1;
    const back = ROLLBACK[h.breaks] || 0, from = C2.week;
    if (back) {
      C2.week = Math.max(1, C2.week - back);
      C2.worked = Math.max(0, (C2.worked || 0) - back);
      if (h.breaks >= BREAKS_MAX) h.breaks = 0;
      h.mood = 45;
      const nx = $("next");
      if (nx && /\d/.test(nx.textContent) && x.won) nx.textContent = L("Неделя ".concat(C2.week, " →"), "Week ".concat(C2.week, " →"));
    }
    careerSave(C2);
    track("hero_break", { detail: "".concat(h.breaks || BREAKS_MAX, ":").concat(back) });
    setTimeout(() => breakModal(why, back, from, C2.week, h), 1200);
    return;
  }
  setTimeout(() => {
    var _a2, _b;
    const t = lineFor(x.won ? "week_win" : "week_fired", fem), sheet = views.end.querySelector(".end-sheet");
    if (sheet && !views.end.hidden) {
      (_a2 = sheet.querySelector(".hero-says")) == null ? void 0 : _a2.remove();
      (_b = sheet.querySelector("h1")) == null ? void 0 : _b.insertAdjacentHTML("afterend", '<p class="hero-says">💬 '.concat(esc(nm), ": «").concat(esc(t), "»</p>"));
      say(t, heroVoice(h));
    }
  }, 900);
  setTimeout(() => {
    if (h.pending && h.seenWeek !== C2.week && $("modal").hidden && !views.end.hidden) heroAsk();
  }, 3400);
});
function breakModal(why, back, from, to, h) {
  var _a;
  const cry = lineFor("break", heroFem(h));
  const { m, close } = heroModal('\n    <div class="hero-ask"><canvas class="hero-cv" data-framing="full"></canvas>\n      <div class="hero-bubble break"><b id="heroTitle">💔 '.concat(L("Срыв!", "Breakdown!"), '</b><p class="say">«').concat(esc(cry), "»</p><p>").concat(why, "</p>\n        ").concat(back ? '<p class="rollback">⏪ '.concat(L("Откат на ".concat(back, " ").concat(back === 1 ? "неделю" : "недели", ": неделя ").concat(from, " → ").concat(to), "Back ".concat(back, " week").concat(back > 1 ? "s" : "", ": week ").concat(from, " → ").concat(to)), "</p>") : "<p>".concat(L("Это первый срыв — предупреждение. Второй откатит карьеру на неделю назад, третий — на две.", "First breakdown — a warning. The second sets your career back a week, the third — two weeks."), "</p>"), "</div></div>\n    ").concat(moodScaleHtml(h), '\n    <p class="hero-lead">').concat(L("Поднимайте настроение: исполняйте желания, дарите цветы, покупайте продукты и одежду.", "Keep their mood up: grant wishes, buy flowers, groceries and clothes."), '</p>\n    <div class="hero-acts">').concat(adBreakBtn(back), '<button class="btn-main" type="button" id="brShop">🛍️ ').concat(L("Порадовать", "Cheer them up"), '</button><button class="btn-ghost" type="button" id="brOk">').concat(L("Понятно", "Got it"), "</button></div>"), heroLook(h), "sad");
  (_a = sfx.lose) == null ? void 0 : _a.call(sfx);
  setTimeout(() => say(cry, heroVoice(h)), 500);
  $("brOk").onclick = close;
  adBreakBind((c) => {
    const r = m.querySelector(".rollback");
    if (r) r.textContent = L("⏪ Откат уменьшен рекламой: неделя ".concat(c.week), "⏪ Rollback reduced by an ad: week ".concat(c.week));
  });
  $("brShop").onclick = () => {
    close();
    heroShop();
  };
  return m;
}
const WISHES = [
  { cat: "flowers", sad: true, ask: L("Что-то совсем тоскливо… Может, цветы? Хоть немного весны.", "I’m feeling so low… Maybe some flowers? A bit of spring.") },
  { cat: "sweets", sad: true, ask: L("Плохой день. Мне срочно нужно что-нибудь сладкое.", "Bad day. I urgently need something sweet.") },
  { cat: "phone", ask: L("На телефоне минус — даже такси не вызвать. Пополнишь?", "My phone’s out of credit — I can’t even call a cab. Top it up?") },
  { cat: "groceries", ask: L("Холодильник пустой, одна горчица. Сходим в супермаркет?", "The fridge is empty except for mustard. Supermarket run?") },
  { cat: "clothes", ask: L("Мне совершенно нечего надеть! В пятницу корпоратив.", "I have absolutely nothing to wear! The office party is on Friday.") },
  { cat: "fun", ask: L("Давай вечером куда-нибудь выберемся? Я устал(а) от четырёх стен.", "Let’s go out tonight? I’m tired of these four walls.") },
  { cat: "sweets", ask: L("Видел(а) в витрине такие макаруны… Купим?", "I saw the cutest macarons in a shop window… Shall we?") },
  { cat: "flowers", ask: L("Просто так. Без повода. Цветы?", "Just because. No reason. Flowers?") }
];
const wishFor = (h) => {
  var _a;
  const sad = ((_a = h.mood) != null ? _a : 70) < 55, pool = WISHES.filter((w) => !sad || w.sad || Math.random() < 0.3);
  const fresh = pool.filter((w) => w.cat !== h.lastWish);
  return rnd(fresh.length ? fresh : pool);
};
const genderize = (s, h) => s.replace(/\(а\)/g, heroFem(h) ? "а" : "").replace(/устал\(а\)/g, heroFem(h) ? "устала" : "устал");
bus.on("deck", (S2) => {
  var _a;
  if (S2.mode !== "career" || !(C == null ? void 0 : C.hero)) return;
  const n = ((_a = C.hero.mood) != null ? _a : 70) < 55 || Math.random() < 0.5 ? 2 : 1, at = /* @__PURE__ */ new Set();
  while (at.size < n) at.add(3 + Math.floor(Math.random() * (WEEK_LEN - 7)));
  S2.wishAt = [...at];
});
bus.on("answer", () => {
  var _a, _b;
  if ((S == null ? void 0 : S.mode) === "career" && (C == null ? void 0 : C.hero) && S.step === PER_DAY * 2 && !((_a = S.wishAt) == null ? void 0 : _a.includes(S.step))) setTimeout(() => {
    const t = lineFor("cheer", heroFem(C.hero));
    say(t, heroVoice(C.hero));
    toast("".concat(C.hero.name, ": «").concat(t, "»"));
  }, 700);
  if ((S == null ? void 0 : S.mode) !== "career" || !(C == null ? void 0 : C.hero) || !((_b = S.wishAt) == null ? void 0 : _b.includes(S.step))) return;
  const step = S.step;
  setTimeout(() => {
    var _a2;
    const ok = !views.game.hidden && !splashOn && !busy && $("modal").hidden && S && RES.every((r) => S.res[r.k] > 0 && S.res[r.k] < 100);
    if (!ok) {
      if (step + 1 < WEEK_LEN - 1) S.wishAt.push(step + 1);
      return;
    }
    S.wishAt = S.wishAt.filter((x) => x !== step);
    const kids = ((_a2 = C.hero.kids) == null ? void 0 : _a2.length) ? C.hero.kids : (ensureKids(C.hero), saveCareer(), C.hero.kids), k = Math.random() < 0.4 && rnd(kids.filter((k2) => kidWants(k2).length)), want = k && kidWants(k).filter((x) => x.id !== k.last);
    if (want == null ? void 0 : want.length) return kidWishPop(k, rnd(want));
    const pets = C.hero.pets || [], hungry = pets.find((p) => p.last.p_food !== C.week);
    if (pets.length && (hungry || Math.random() < 0.35)) return petWishPop(hungry || rnd(pets));
    wishPop();
  }, 900);
});
function wishPop(w = wishFor(C.hero)) {
  var _a, _b;
  const h = C.hero, cat = goodsCat(w.cat);
  h.lastWish = w.cat;
  saveCareer();
  const plead = lineFor("plead", heroFem(h));
  setTimeout(() => say("".concat(genderize(w.ask, h), " ").concat(plead), heroVoice(h)), 350);
  busy = true;
  (_a = sfx.sms) == null ? void 0 : _a.call(sfx);
  const done = () => {
    busy = false;
    renderBars == null ? void 0 : renderBars();
  };
  const { m, close } = heroModal('\n    <div class="hero-ask"><canvas class="hero-cv" data-framing="bust"></canvas>\n      <div class="hero-bubble"><b id="heroTitle">'.concat(cat.ico, " ").concat(esc(h.name), " ").concat(L("пишет", "texts"), "</b><p>«").concat(esc(genderize(w.ask, h)), '»</p><p class="say">«').concat(esc(plead), "»</p><span>").concat(L("Сейчас на счёте", "Balance"), " ").concat(money(C.bank), "</span></div></div>\n    ").concat(moodScaleHtml(h), '\n    <div class="hero-acts"><button class="btn-main" type="button" id="wpGo">').concat(cat.ico, " ").concat(L("Выбрать", "Pick something"), '</button>\n      <button class="btn-link" type="button" id="wpNo">').concat(L("Не сейчас (настроение −8)", "Not now (mood −8)"), "</button></div>"), heroLook(h), ((_b = h.mood) != null ? _b : 70) < 50 ? "sad" : "ask");
  $("wpGo").onclick = () => {
    close();
    goodsPicker(cat.id, done);
  };
  $("wpNo").onclick = () => {
    var _a2;
    h.mood = Math.max(0, ((_a2 = h.mood) != null ? _a2 : 70) - 8);
    saveCareer();
    heroView == null ? void 0 : heroView.setEmotion("sad");
    const t = speak("sad", heroVoice(h));
    toast("".concat(h.name, ": «").concat(t, "» · ").concat(L("настроение −8", "mood −8")));
    setTimeout(() => {
      close();
      done();
    }, 900);
  };
}
let goodsReopen = null;
function goodsPicker(catId, after) {
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h) return after == null ? void 0 : after();
  const cat = goodsCat(catId), m = $("modal"), cart = {};
  goodsReopen = () => goodsPicker(catId, after);
  dropView();
  const back = () => {
    m.hidden = true;
    goodsReopen = null;
    after == null ? void 0 : after();
  };
  const total = () => cat.items.reduce((s, x) => s + (cart[x.id] || 0) * x.price, 0);
  const render = () => {
    const isCart = cat.kind === "cart", t = total();
    const worn = (id) => {
      var _a;
      return (_a = h.worn) == null ? void 0 : _a.includes(id);
    };
    m.innerHTML = '<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="gpTitle">\n      <h2 id="gpTitle">'.concat(cat.ico, " ").concat(esc(cat.t), " · ").concat(esc(h.name), '</h2>\n      <p class="hero-lead">').concat(L("На счёте ".concat(money(C2.bank)), "Balance ".concat(money(C2.bank))), " · ").concat(isCart ? L("наберите корзину — чем разнообразнее, тем лучше настроение", "fill the cart — the more variety, the better the mood") : L("выберите вариант — дороже, значит радостнее", "pick one — pricier means happier"), " ").concat(adChip(), '</p>\n      <div class="gp-list').concat(isCart ? " cart" : "", '">').concat(cat.items.filter((x) => !x.g || x.g === heroPreset(h).g).map((x) => {
      var _a;
      const short = C2.bank < x.price && !isCart, has = x.own && ((_a = h.have) == null ? void 0 : _a.includes(x.id));
      if (has) return '<div class="gp-item worn"><span class="gp-ico" aria-hidden="true">'.concat(x.ico, '</span><span class="gp-txt"><b>').concat(esc(goodText(x, h)), "</b><small>").concat(L("уже есть", "owned"), '</small></span><em class="gp-own">✓ ').concat(L("есть", "owned"), "</em></div>");
      return '<div class="gp-item'.concat(short ? " short" : "").concat(worn(x.id) ? " worn" : "", '"><span class="gp-ico" aria-hidden="true">').concat(x.ico, '</span>\n          <span class="gp-txt"><b>').concat(esc(goodText(x, h)), "</b><small>").concat(money(x.price), " · ").concat(L("настроение +".concat(x.mood), "mood +".concat(x.mood))).concat(worn(x.id) ? L(" · уже есть", " · owned") : "", "</small></span>\n          ").concat(isCart ? '<span class="gp-qty"><button type="button" class="btn-chip" data-dec="'.concat(x.id, '" aria-label="').concat(L("Убрать", "Remove"), '">−</button><b>').concat(cart[x.id] || 0, '</b><button type="button" class="btn-chip" data-inc="').concat(x.id, '" aria-label="').concat(L("Добавить", "Add"), '">+</button></span>') : short ? '<button type="button" class="btn-chip tu-btn" data-topup="'.concat(lackOf(x.price), '" data-topup-back="goods" data-topup-why="').concat(esc(L("".concat(goodText(x, h), " — ").concat(money(x.price), " · на счёте ").concat(money(C2.bank)), "".concat(goodText(x, h), " — ").concat(money(x.price), " · you have ").concat(money(C2.bank)))), '">💰 ').concat(L("не хватает ".concat(lackOf(x.price)), "".concat(money(lackOf(x.price)), " short")), "</button>") : '<button type="button" class="btn-chip" data-buy="'.concat(x.id, '">').concat(L("Купить", "Buy"), " · ").concat(money(x.price), "</button>"), "</div>");
    }).join(""), "</div>\n      ").concat(isCart ? '<div class="gp-total"><span>'.concat(L("В корзине", "Cart"), ": <b>").concat(money(t), "</b></span>").concat(t > C2.bank ? topupBtn(t - C2.bank, "goods", L("Корзина на ".concat(money(t), " · на счёте ").concat(money(C2.bank)), "Cart ".concat(money(t), " · you have ").concat(money(C2.bank))), "btn-main tu-btn") : '<button class="btn-main" type="button" id="gpPay" '.concat(t ? "" : "disabled", ">🧾 ").concat(L("На кассу", "Checkout"), "</button>"), "</div>") : "", '\n      <button class="btn-ghost" type="button" id="gpClose">').concat(L("Назад", "Back"), "</button></div>");
    m.hidden = false;
    m.querySelectorAll("[data-inc]").forEach((b) => b.onclick = () => {
      var _a;
      cart[b.dataset.inc] = Math.min(5, (cart[b.dataset.inc] || 0) + 1);
      (_a = sfx.item) == null ? void 0 : _a.call(sfx);
      render();
    });
    m.querySelectorAll("[data-dec]").forEach((b) => b.onclick = () => {
      cart[b.dataset.dec] = Math.max(0, (cart[b.dataset.dec] || 0) - 1);
      render();
    });
    m.querySelectorAll("[data-buy]").forEach((b) => b.onclick = () => {
      const x = cat.items.find((i) => i.id === b.dataset.buy);
      buyGoods(cat, [x], x.price, x.mood, after);
    });
    if ($("gpPay")) $("gpPay").onclick = () => {
      const list = cat.items.flatMap((x) => Array(cart[x.id] || 0).fill(x)), kinds = new Set(list.map((x) => x.id)).size;
      const mood = Math.min(cat.cap, list.reduce((s, x) => s + x.mood, 0) + kinds);
      buyGoods(cat, list, total(), mood, after);
    };
    $("gpClose").onclick = back;
  };
  render();
}
function buyGoods(cat, list, price, mood, after) {
  var _a, _b, _c, _d, _e;
  if (!needReg("wish")) return;
  voiceUnlock();
  const C2 = careerNow(), h = C2.hero;
  if (C2.bank < price) return;
  C2.bank -= price;
  C2.spent = (C2.spent || 0) + price;
  h.mood = Math.min(100, ((_a = h.mood) != null ? _a : 70) + mood);
  h.gifts = (h.gifts || 0) + 1;
  if ((_b = list[0]) == null ? void 0 : _b.own) (h.have || (h.have = [])).includes(list[0].id) || h.have.push(list[0].id);
  if (cat.kind === "wear") {
    const x = list[0], w = typeof x.wear === "function" ? x.wear(heroPreset(h).g) : x.wear;
    h.wear = { ...h.wear || {}, ...w };
    (h.worn || (h.worn = [])).includes(x.id) || h.worn.push(x.id);
  }
  careerSave(C2);
  (_c = sfx.coins) == null ? void 0 : _c.call(sfx);
  track("hero_buy", { detail: "".concat(cat.id, ":").concat(list.map((x) => x.id).join("+"), ":").concat(price) });
  if (typeof S !== "undefined" && (S == null ? void 0 : S.mode) === "career" && !views.game.hidden) renderBars == null ? void 0 : renderBars();
  goodsReopen = null;
  playToon({ kind: ((_d = list[0]) == null ? void 0 : _d.toon) || cat.toon, prop: (_e = list[0]) == null ? void 0 : _e.prop, cat, list, mood, h }, after);
}
const TOON_LEN = {
  market: (n) => Math.min(15e3, 6500 + n * 750),
  delivery: () => 7500,
  phone: () => 6500,
  wear: () => 8500,
  outing: () => 7500,
  need: () => 8e3,
  ride: () => 11e3,
  fish: () => 9500,
  salon: () => 8500,
  game: () => 8e3
};
const OUTING_FX = { latte: "☕", book: "📖", cinema: "🍿", dinner: "🕯️", spa: "🧼", concert: "🎶", tent: "⛺", workshop: "🎨", camp: "🌲", music: "🎵", party: "🎈", ball: "⚽" };
const RIDE_BG = { boat: "water", car: "city", moto: "city", bike: "park", scooter: "park", skate: "park" };
function playToon({ kind, prop, cat, list = [], mood = 0, h, need, kid }, after) {
  var _a, _b, _c;
  voiceUnlock();
  const m = $("modal"), C2 = careerNow();
  dropView();
  if (need && !list.length) list = [{ id: need.id, ico: need.ico, price: need.price }];
  const x = list[0], who = kid || h, fem = kid ? kid.g === "f" : heroFem(h), nm = esc(who.name);
  const dur = RM.matches ? 3500 : TOON_LEN[kind](list.length);
  const title = need ? needText(need, h, "t") : x ? goodText(x, h) : "";
  const rain = (n, e) => Array.from({ length: n }, (_, i) => '<span class="tn-rain" style="--i:'.concat(i, '">').concat(Array.isArray(e) ? e[i % e.length] : e, "</span>")).join("");
  const props = {
    market: '<div class="tn-shelves">'.concat(["🥫🧃🍪🥫🧃🍪🥫🧃", "🍎🥦🍞🥛🧀🍌🥕🍇", "🧴🧻🍫🍬🧴🧻🍫🍬"].map((r, i) => '<div class="tn-shelf" style="--d:'.concat(i, '">').concat((r + r).replace(/(.)/gu, "<span>$1</span>"), "</div>")).join(""), '</div>\n      <div class="tn-cart">🛒<div class="tn-in"></div></div>').concat(list.map((it, i) => '<span class="tn-fly" style="--i:'.concat(i, '">').concat(it.ico, "</span>")).join(""), '\n      <div class="tn-receipt"><b>').concat(L("Касса", "Checkout"), "</b>").concat(list.length, " ").concat(L("шт.", "items"), " · ").concat(money(list.reduce((s, it) => s + it.price, 0)), "</div>"),
    delivery: '<div class="tn-door">🚪</div><span class="tn-bell">🔔 '.concat(L("Дзинь-дзинь!", "Ding-dong!"), '</span><div class="tn-box">📦</div>'),
    phone: kid ? "" : '<div class="tn-phone"><div class="tn-scr"><b>'.concat(kid ? "📱 ".concat(L("Новый телефон!", "New phone!")) : "📶 ".concat(L("Баланс пополнен", "Top-up done")), "</b><i></i><span>").concat(kid ? "🤳" : "+".concat((x == null ? void 0 : x.price) || 0, " ").concat(L("у.е.", "$")), "</span></div></div>").concat(["💬", "❤️", "😂", "📸"].map((e, i) => '<span class="tn-ping" style="--i:'.concat(i, '">').concat(e, "</span>")).join("")),
    wear: '<div class="tn-curtain l"></div><div class="tn-curtain r"></div><div class="tn-mirror">🖼️</div>'.concat(Array.from({ length: 6 }, (_, i) => '<span class="tn-spark" style="--i:'.concat(i, '">✨</span>')).join(""), '<span class="tn-tag">').concat((x == null ? void 0 : x.ico) || "👗", " ").concat(esc(title), "</span>"),
    outing: "".concat(rain(10, OUTING_FX[x == null ? void 0 : x.id] || "✨"), '<span class="tn-big">').concat((x == null ? void 0 : x.ico) || "🎟️", "</span>"),
    need: '<span class="tn-big need">'.concat((need == null ? void 0 : need.ico) || (x == null ? void 0 : x.ico) || "🎉", "</span>").concat(rain(12, ["🎉", "✨", "💖"])),
    ride: '<div class="tn-ground"></div><div class="tn-lane"></div><span class="tn-tag">'.concat((x == null ? void 0 : x.ico) || (need == null ? void 0 : need.ico) || "🚗", " ").concat(esc(title), "</span>"),
    fish: '<div class="tn-lake"></div><span class="tn-fish">🐟</span><span class="tn-catch">🐟</span><span class="tn-reed l">🌾</span><span class="tn-reed r">🌾</span>',
    salon: '<div class="tn-mirror big">🖼️</div>'.concat(Array.from({ length: 6 }, (_, i) => '<span class="tn-spark" style="--i:'.concat(i, '">✨</span>')).join(""), '<span class="tn-tag">').concat((x == null ? void 0 : x.ico) || "💅", " ").concat(esc(title), "</span>"),
    game: '<div class="tn-tv"><div class="tn-px">'.concat(Array.from({ length: 6 }, (_, i) => '<i style="--i:'.concat(i, '"></i>')).join(""), '</div></div><span class="tn-tag">🎮 ').concat(esc(title), "</span>")
  }[kind];
  const word = {
    moto: L("мотоцикле", "the motorbike"),
    bike: L("велосипеде", "the bike"),
    car: L("машине", "the car"),
    boat: L("лодке", "the boat"),
    scooter: L("самокате", "the scooter"),
    skate: L("скейте", "the skateboard")
  }[prop] || "";
  const caps = {
    market: [L("".concat(nm, " идёт в супермаркет…"), "".concat(nm, " heads to the supermarket…")), L("Тележка наполняется", "Filling up the cart"), L("Касса — и домой!", "Checkout — and home!")],
    delivery: [L("Звонок в дверь…", "Doorbell…"), L("Курьер: «Это для ".concat(nm, "!»"), "Courier: “This is for ".concat(nm, "!”")), L("".concat(nm, " сияет"), "".concat(nm, " is glowing"))],
    phone: [L("".concat(nm, " проверяет телефон…"), "".concat(nm, " checks the phone…")), L("Связь есть! Чаты оживают", "Back online! The chats come alive")],
    wear: [L("Примерочная…", "Fitting room…"), L("Вжух — новый образ!", "Ta-da — a new look!"), L("".concat(nm, " не может налюбоваться"), "".concat(nm, " can’t stop looking in the mirror"))],
    outing: [kid ? L("".concat(nm, " в предвкушении"), "".concat(nm, " can’t wait")) : L("Вечер только для двоих", "An evening just for the two of you"), kid ? L("Лучший день!", "Best day ever!") : L("".concat(nm, " забыл").concat(fem ? "а" : "", " про работу"), "".concat(nm, " forgot all about work"))],
    need: [L("Мечта сбывается…", "A dream comes true…"), L("".concat(nm, " на седьмом небе"), "".concat(nm, " is over the moon"))],
    ride: [L("".concat(nm, ": «Это всё мне?!»"), "".concat(nm, ": “Is this all mine?!”")), L("Поехали! ".concat(nm, " уносится на ").concat(word), "Off we go! ".concat(nm, " speeds away on ").concat(word)), L("Круг почёта!", "A victory lap!"), L("".concat(nm, " счастлив").concat(fem ? "а" : ""), "".concat(nm, " is thrilled"))],
    fish: [L("".concat(nm, " закидывает удочку…"), "".concat(nm, " casts the line…")), L("Тишина. Поплавок. Ни одного письма от босса…", "Silence. The float. Not a single email from the boss…"), L("Клюёт!!!", "A bite!!!"), L("Вот это улов!", "What a catch!")],
    salon: [L("".concat(nm, " в салоне красоты"), "".concat(nm, " at the beauty salon")), L("Мастер творит чудеса…", "The stylist works their magic…"), L("Неотразимо!", "Stunning!")],
    game: [L("".concat(nm, " включает приставку"), "".concat(nm, " turns on the console")), L("Финальный босс…", "The final boss…"), L("ПОБЕДА!", "VICTORY!")]
  }[kind];
  m.innerHTML = '<div class="modal-box glass toon-box" role="dialog" aria-modal="true" aria-label="'.concat(L("Мультик", "Cartoon"), '">\n    <div class="toon toon-').concat(kind).concat(kind === "ride" ? " bg-".concat(RIDE_BG[prop] || "city") : "", '" style="--dur:').concat(dur, "ms;--n:").concat(Math.max(1, list.length), '">').concat(props, '<canvas class="toon-cv"></canvas><div class="tn-hearts"></div>\n      <p class="tn-cap" aria-live="polite">').concat(caps[0], '</p><p class="tn-say" hidden></p><div class="tn-bar"><i></i></div></div>\n    <p class="tn-sum">').concat(need ? "".concat(need.ico, " ").concat(esc(title)) : list.length > 1 ? "".concat(cat.ico, " ").concat(L("Корзина: ".concat(list.length, " шт."), "Cart: ".concat(list.length, " items"))) : "".concat((x == null ? void 0 : x.ico) || "", " ").concat(esc(title))).concat(kid ? " · ".concat(esc(kid.name)) : "", " · ").concat(L("настроение +".concat(mood), "mood +".concat(mood)), " · ").concat(L("на счёте", "balance"), " ").concat(money(C2.bank), '</p>\n    <button class="btn-ghost" type="button" id="tnSkip">').concat(L("Пропустить ⏭", "Skip ⏭"), "</button></div>");
  m.hidden = false;
  const stage = m.querySelector(".toon"), cv = m.querySelector(".toon-cv");
  let view = null, timers = [], over = false, raf = 0;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const cap = (i) => {
    const p = stage.querySelector(".tn-cap");
    if (p && caps[i]) {
      p.textContent = caps[i];
      p.classList.remove("on");
      void p.offsetWidth;
      p.classList.add("on");
    }
  };
  const voice = kid ? kidVoice(kid) : heroVoice(h);
  const gift = (cat == null ? void 0 : cat.id) === "flowers" || (x == null ? void 0 : x.id) === "flowers" ? "flowers" : (cat == null ? void 0 : cat.id) === "sweets" || kind === "delivery" ? "gift" : null;
  const peak = ((_b = (_a = need == null ? void 0 : need.say) == null ? void 0 : _a.done) == null ? void 0 : _b.length) && !kid ? genderLine(rnd(need.say.done), fem) : lineFor(kid ? "kid_thanks" : gift || { ride: "ride", fish: "ride", salon: "beauty", need: "big" }[kind] || rnd(["thanks", "love", "joy"]), fem);
  const bye = lineFor(kid ? "kid_thanks" : rnd(["thanks", "love"]), fem);
  let spoke = false;
  const sayPeak = () => {
    if (spoke) return;
    spoke = true;
    const b = stage.querySelector(".tn-say");
    b.textContent = "«".concat(peak, "»");
    b.hidden = false;
    say(peak, voice);
  };
  const hearts = () => {
    sayPeak();
    const box = stage.querySelector(".tn-hearts");
    box.innerHTML = Array.from({ length: 9 }, (_, i) => '<span style="--i:'.concat(i, '">').concat(["💖", "💗", "✨"][i % 3], "</span>")).join("");
  };
  const look = kid ? kid.look : heroLook(h), before = kind === "wear" && !kid ? { ...heroPreset(h), ...h.wearPrev || {} } : look;
  const vProp = kind === "ride" ? prop : kind === "fish" ? "rod" : null;
  const yaw0 = (_c = { market: -0.9, ride: 1.1, fish: 1.25 }[kind]) != null ? _c : -0.15;
  heroViewer(cv, before, { framing: kid ? "kid" : kind === "ride" ? "wide" : "full", emotion: kind === "wear" ? "neutral" : "happy", interactive: false, yawRest: yaw0, stage: true }).then((v) => {
    if (!v || over) return v == null ? void 0 : v.dispose();
    view = v;
    if (vProp) v.setProp(vProp);
    if (kind === "fish") v.place(kid ? -0.35 : -0.5);
    v.setAction({ market: "walk", phone: "phone", game: "hold" }[kind] || null);
  });
  stage.classList.add("go");
  const D = dur;
  const item = (x == null ? void 0 : x.ico) || (need == null ? void 0 : need.ico) || "🎁", show = (e = item) => {
    view == null ? void 0 : view.hold(e);
    view == null ? void 0 : view.setAction("show");
  };
  if (kind === "market") {
    at(D * 0.25, () => cap(1));
    at(D * 0.72, () => {
      cap(2);
      view == null ? void 0 : view.hold("🛍️");
      view == null ? void 0 : view.setAction("show");
    });
    at(D * 0.85, () => {
      var _a2;
      view == null ? void 0 : view.setAction("cheer");
      hearts();
      (_a2 = sfx.coins) == null ? void 0 : _a2.call(sfx);
    });
  }
  if (kind === "delivery") {
    at(900, () => {
      var _a2;
      return (_a2 = sfx.bell) == null ? void 0 : _a2.call(sfx);
    });
    at(D * 0.3, () => cap(1));
    at(D * 0.55, () => {
      show();
      view == null ? void 0 : view.setEmotion("happy");
    });
    at(D * 0.72, () => {
      cap(2);
      hearts();
    });
    at(D * 0.86, () => view == null ? void 0 : view.setAction("cheer"));
  }
  if (kind === "phone") {
    at(300, () => view == null ? void 0 : view.hold("📱", 0.3));
    at(D * 0.45, () => {
      var _a2;
      cap(1);
      (_a2 = sfx.sms) == null ? void 0 : _a2.call(sfx);
    });
    at(D * 0.62, () => {
      show("📱");
      hearts();
    });
  }
  if (kind === "wear") {
    at(D * 0.15, () => view == null ? void 0 : view.setAction("spin"));
    at(D * 0.32, () => {
      var _a2;
      view == null ? void 0 : view.setPreset(look);
      cap(1);
      (_a2 = sfx.item) == null ? void 0 : _a2.call(sfx);
    });
    at(D * 0.5, () => {
      view == null ? void 0 : view.setAction(null);
      view == null ? void 0 : view.setEmotion("happy");
    });
    at(D * 0.7, () => {
      cap(2);
      view == null ? void 0 : view.setAction("cheer");
      hearts();
    });
  }
  if (kind === "outing") {
    at(D * 0.15, () => show());
    at(D * 0.5, () => {
      cap(1);
      hearts();
    });
    at(D * 0.75, () => view == null ? void 0 : view.setAction("cheer"));
  }
  if (kind === "need") {
    at(D * 0.2, () => show());
    at(D * 0.45, () => {
      var _a2;
      cap(1);
      hearts();
      (_a2 = sfx.win) == null ? void 0 : _a2.call(sfx);
    });
    at(D * 0.7, () => view == null ? void 0 : view.setAction("cheer"));
  }
  if (kind === "salon") {
    at(D * 0.15, () => show());
    at(D * 0.3, () => cap(1));
    at(D * 0.55, () => {
      var _a2;
      view == null ? void 0 : view.hold(null);
      view == null ? void 0 : view.setAction("spin");
      (_a2 = sfx.item) == null ? void 0 : _a2.call(sfx);
    });
    at(D * 0.68, () => {
      view == null ? void 0 : view.setAction("cheer");
      cap(2);
      hearts();
    });
  }
  if (kind === "game") {
    at(300, () => view == null ? void 0 : view.hold("🎮", 0.26));
    at(D * 0.35, () => cap(1));
    at(D * 0.7, () => {
      var _a2;
      cap(2);
      view == null ? void 0 : view.setAction("cheer");
      hearts();
      (_a2 = sfx.win) == null ? void 0 : _a2.call(sfx);
    });
  }
  if (kind === "fish") {
    at(D * 0.25, () => cap(1));
    at(D * 0.55, () => {
      var _a2;
      cap(2);
      (_a2 = sfx.sms) == null ? void 0 : _a2.call(sfx);
    });
    at(D * 0.66, () => {
      cap(3);
      view == null ? void 0 : view.setProp(null);
      view == null ? void 0 : view.setAction("cheer");
      hearts();
    });
  }
  if (kind === "ride") {
    const far = kid ? 2.6 : 4.2, t0 = performance.now();
    const step = () => {
      if (over) return;
      raf = requestAnimationFrame(step);
      const k = (performance.now() - t0) / D, xx = k < 0.28 ? 0 : k < 0.6 ? far * ((k - 0.28) / 0.32) ** 2 : k < 0.88 ? -far + far * (1 - (1 - (k - 0.6) / 0.28) ** 2) : 0;
      view == null ? void 0 : view.place(xx);
      stage.classList.toggle("moving", k > 0.28 && k < 0.88);
    };
    raf = requestAnimationFrame(step);
    at(D * 0.28, () => {
      var _a2;
      cap(1);
      view == null ? void 0 : view.setYaw(Math.PI / 2);
      (_a2 = sfx.item) == null ? void 0 : _a2.call(sfx);
      sayPeak();
    });
    at(D * 0.6, () => cap(2));
    at(D * 0.88, () => {
      var _a2;
      cap(3);
      view == null ? void 0 : view.setYaw(0.9);
      view == null ? void 0 : view.setAction("cheer");
      hearts();
      (_a2 = sfx.coins) == null ? void 0 : _a2.call(sfx);
    });
  }
  const finish = () => {
    var _a2;
    if (over) return;
    over = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    view == null ? void 0 : view.dispose();
    m.hidden = true;
    if (kind === "wear" && !kid) {
      h.wearPrev = h.wear;
      careerSave(C2);
    }
    toast("".concat(who.name, ": «").concat(spoke ? bye : peak, "» · ").concat(L("настроение", "mood"), " ").concat((_a2 = who.mood) != null ? _a2 : h.mood, "/100"));
    if (!RM.matches) say(spoke ? bye : peak, voice);
    if (!views.menu.hidden) renderMenu();
    after == null ? void 0 : after();
  };
  at(D, finish);
  $("tnSkip").onclick = finish;
}
const KID_NAMES = { f: L(["Маша", "Соня", "Алиса", "Вера", "Полина", "Ева"], ["Mia", "Sophie", "Alice", "Vera", "Polly", "Eva"]), m: L(["Петя", "Миша", "Ваня", "Тёма", "Лёва", "Гоша"], ["Pete", "Mike", "Johnny", "Tom", "Leo", "George"]) };
const KID_COLORS = ["#ffb02e", "#2de28a", "#4fb3c9", "#ff5c8a", "#8f6bff", "#ff7a3d"];
function ensureKids(h) {
  var _a;
  if ((_a = h.kids) == null ? void 0 : _a.length) return h.kids;
  const p = heroPreset(h), ages = [];
  while (ages.length < 3) {
    const a = 4 + Math.floor(Math.random() * 12);
    if (!ages.some((x) => Math.abs(x - a) < 2)) ages.push(a);
  }
  ages.sort((a, b) => b - a);
  const used = /* @__PURE__ */ new Set();
  h.kids = ages.map((age, i) => {
    const g = Math.random() < 0.5 ? "f" : "m", names = KID_NAMES[g].filter((n) => !used.has(n)), name = rnd(names);
    used.add(name);
    return {
      id: "k" + i,
      name,
      g,
      age,
      mood: 70,
      have: [],
      last: null,
      look: {
        g,
        kid: true,
        skin: p.skin,
        eyes: p.eyes,
        hairColor: p.hairColor,
        hair: g === "f" ? rnd(["ponytail", "long", "bob"]) : rnd(["short", "quiff", "buzz"]),
        top: KID_COLORS[(i * 2 + (g === "f" ? 3 : 0)) % KID_COLORS.length],
        bottom: g === "f" && Math.random() < 0.5 ? "#3a3f6a" : "#34507a",
        skirt: g === "f" && Math.random() < 0.5,
        short: true,
        heels: false,
        shoes: "#f2f2f2"
      }
    };
  });
  return h.kids;
}
const kidEmoji = (k) => k.g === "f" ? k.age < 8 ? "👧" : "👩‍🦰" : k.age < 8 ? "👦" : "🧒";
const kidYears = (n) => L(plural(n, "год", "года", "лет"), "".concat(n));
const parentWord = (h) => heroFem(h) ? L("Мам", "Mom") : L("Пап", "Dad");
const kidWants = (k) => KID_GOODS.filter((x) => !(x.own && k.have.includes(x.id)));
function buyKid(k, x, after) {
  var _a, _b, _c;
  const C2 = careerNow(), h = C2.hero;
  if (C2.bank < x.price) return;
  C2.bank -= x.price;
  C2.spent = (C2.spent || 0) + x.price;
  k.mood = Math.min(100, ((_a = k.mood) != null ? _a : 70) + x.mood);
  h.mood = Math.min(100, ((_b = h.mood) != null ? _b : 70) + Math.ceil(x.mood / 2));
  if (x.own) k.have.push(x.id);
  careerSave(C2);
  (_c = sfx.coins) == null ? void 0 : _c.call(sfx);
  track("hero_buy", { detail: "kid:".concat(x.id, ":").concat(x.price) });
  if (typeof S !== "undefined" && (S == null ? void 0 : S.mode) === "career" && !views.game.hidden) renderBars == null ? void 0 : renderBars();
  playToon({ kind: x.toon, prop: x.prop, list: [x], mood: x.mood, h, kid: k }, after);
}
let kidReopen = null;
function kidShop(i, after) {
  const C2 = careerNow(), h = C2 == null ? void 0 : C2.hero;
  if (!h) return after == null ? void 0 : after();
  const k = ensureKids(h)[i], m = $("modal");
  kidReopen = () => kidShop(i, after);
  dropView();
  m.innerHTML = '<div class="modal-box glass hero-box" role="dialog" aria-modal="true" aria-labelledby="ksTitle">\n    <h2 id="ksTitle">'.concat(kidEmoji(k), " ").concat(esc(k.name), ", ").concat(kidYears(k.age), '</h2>\n    <p class="hero-lead">').concat(L("На счёте ".concat(money(C2.bank), " · настроение ").concat(esc(k.name), ": ").concat(k.mood, "/100. Подарок ребёнку радует и ").concat(esc(h.name), "."), "Balance ".concat(money(C2.bank), " · ").concat(esc(k.name), "’s mood: ").concat(k.mood, "/100. A gift for the kid cheers ").concat(esc(h.name), " up too.")), " ").concat(adChip(), '</p>\n    <div class="gp-list">').concat(KID_GOODS.map((x) => {
    const has = x.own && k.have.includes(x.id), short = C2.bank < x.price;
    return '<div class="gp-item'.concat(has ? " worn" : short ? " short" : "", '"><span class="gp-ico" aria-hidden="true">').concat(x.ico, '</span>\n        <span class="gp-txt"><b>').concat(esc(x.t), "</b><small>").concat(has ? L("уже есть", "owned") : "".concat(money(x.price), " · ").concat(L("радость +".concat(x.mood), "joy +".concat(x.mood))), "</small></span>\n        ").concat(has ? '<em class="gp-own">✓ '.concat(L("есть", "owned"), "</em>") : short ? '<button type="button" class="btn-chip tu-btn" data-topup="'.concat(lackOf(x.price), '" data-topup-back="kid" data-topup-why="').concat(esc(L("".concat(k.name, " просит: ").concat(x.t, " — ").concat(money(x.price)), "".concat(k.name, " wants: ").concat(x.t, " — ").concat(money(x.price)))), '">💰 ').concat(L("не хватает ".concat(lackOf(x.price)), "".concat(money(lackOf(x.price)), " short")), "</button>") : '<button type="button" class="btn-chip" data-kbuy="'.concat(x.id, '">').concat(L("Купить", "Buy"), " · ").concat(money(x.price), "</button>"), "</div>");
  }).join(""), '</div>\n    <button class="btn-ghost" type="button" id="ksClose">').concat(L("Назад", "Back"), "</button></div>");
  m.hidden = false;
  m.querySelectorAll("[data-kbuy]").forEach((b) => b.onclick = () => {
    kidReopen = null;
    buyKid(k, KID_GOODS.find((x) => x.id === b.dataset.kbuy), after);
  });
  $("ksClose").onclick = () => {
    m.hidden = true;
    kidReopen = null;
    after == null ? void 0 : after();
  };
}
function kidWishPop(k, x) {
  var _a;
  const h = C.hero;
  k.last = x.id;
  saveCareer();
  const plead = lineFor("kid_plead", k.g === "f");
  setTimeout(() => say("".concat(parentWord(h), ", ").concat(x.ask.charAt(0).toLowerCase() + x.ask.slice(1), " ").concat(plead), kidVoice(k)), 350);
  busy = true;
  (_a = sfx.sms) == null ? void 0 : _a.call(sfx);
  const done = () => {
    busy = false;
    renderBars == null ? void 0 : renderBars();
  };
  const can = C.bank >= x.price;
  const { m, close } = heroModal('\n    <div class="hero-ask"><canvas class="hero-cv" data-framing="kid"></canvas>\n      <div class="hero-bubble"><b id="heroTitle">'.concat(x.ico, " ").concat(esc(k.name), ", ").concat(kidYears(k.age), "</b><p>«").concat(esc(parentWord(h)), ", ").concat(esc(x.ask.charAt(0).toLowerCase() + x.ask.slice(1)), '»</p><p class="say">«').concat(esc(plead), "»</p><span>").concat(esc(x.t), " · ").concat(money(x.price), " · ").concat(L("на счёте", "balance"), " ").concat(money(C.bank), '</span></div></div>\n    <div class="hero-acts">').concat(can ? '<button class="btn-main" type="button" id="kwBuy">'.concat(x.ico, " ").concat(L("Купить за ".concat(money(x.price)), "Buy for ".concat(money(x.price))), "</button>") : topupBtn(lackOf(x.price), "kidWish", L("".concat(k.name, " просит: ").concat(x.t, " за ").concat(money(x.price)), "".concat(k.name, " wants: ").concat(x.t, " for ").concat(money(x.price))), "btn-main tu-btn") + adChip(), '\n      <button class="btn-link" type="button" id="kwNo">').concat(L("Не сейчас (".concat(k.name, " обидится)"), "Not now (".concat(k.name, " will sulk)")), "</button></div>"), k.look, "ask");
  kidWishBack = () => kidWishPop(k, x);
  if ($("kwBuy")) $("kwBuy").onclick = () => {
    close();
    buyKid(k, x, done);
  };
  $("kwNo").onclick = () => {
    var _a2, _b;
    k.mood = Math.max(0, ((_a2 = k.mood) != null ? _a2 : 70) - 10);
    h.mood = Math.max(0, ((_b = h.mood) != null ? _b : 70) - 4);
    saveCareer();
    heroView == null ? void 0 : heroView.setEmotion("sad");
    const t = speak("kid_sulk", kidVoice(k));
    toast("".concat(k.name, ": «").concat(t, "»"));
    setTimeout(() => {
      close();
      done();
    }, 900);
  };
}
let kidWishBack = null;
const kidsHtml = (h) => '<span class="hero-kids">'.concat(ensureKids(h).map((k, i) => '<button type="button" class="btn-chip" data-kid="'.concat(i, '" title="').concat(L("Настроение", "Mood"), " ").concat(k.mood, '/100">').concat(kidEmoji(k), " ").concat(esc(k.name), ", ").concat(k.age, "</button>")).join(""), "</span>");
