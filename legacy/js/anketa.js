/* сгенерировано tools/make-legacy.js из js/anketa.js — не править */
"use strict";
const ANK_CASH = 5, ANK_REC = 2, ANK_ABOUT = "vdp-anketa-about";
const ANK_QS = [
  { q: ["Ваша суперсила в офисе", "Your office superpower"], a: [
    ["Нахожу свободную переговорку за 30 секунд", "I find a free meeting room in 30 seconds", "Редкий дар. Запишу в «ключевые компетенции».", "A rare gift. Filing under “core competencies”."],
    ["Говорю «давайте вернёмся к этому позже» — и не возвращаюсь", "I say “let’s circle back” and never do", "Узнаю почерк будущего руководителя.", "I see future-manager handwriting."],
    ["Чиню принтер одним взглядом", "I fix the printer with a single glare", "Принтер пока об этом не знает. Не говорите ему.", "The printer doesn’t know yet. Don’t tell it."],
    ["Помню все дни рождения и уже скинулся", "I remember every birthday and already chipped in", "Бухгалтерия вас уже любит.", "Accounting already loves you."]
  ] },
  { q: ["Сколько кружек кофе до обеда?", "How many coffees before lunch?"], a: [
    ["Ноль. Я на чае и самообладании", "Zero. I run on tea and self-control", "Подозрительно спокойны. Проверим на первом созвоне.", "Suspiciously calm. The first call will tell."],
    ["Одна-две, как приличный человек", "One or two, like a decent person", "Сбалансированно. Почти по регламенту.", "Balanced. Almost policy-compliant."],
    ["Я не считаю, я подключён к кофемашине", "I don’t count, I’m plugged into the machine", "Кофемашина уже нервничает.", "The coffee machine is already nervous."],
    ["Пока не начну слышать цвета", "Until I start hearing colours", "Отметила: «высокая мотивация».", "Noted: “highly motivated”."]
  ] },
  { q: ["Ваше отношение к созвонам без повестки", "Your take on meetings with no agenda"], a: [
    ["Это письмо, которое научилось говорить", "It’s an email that learned to talk", "Повесим эту цитату в переговорке.", "We’re framing that in the meeting room."],
    ["Камера выключена, совесть тоже", "Camera off, conscience off", "Честно. Мы ценим честность. Немного.", "Honest. We value honesty. Somewhat."],
    ["Обожаю! Хоть с кем-то поговорить", "Love them! Finally someone to talk to", "Вы приняты в отдел «Можно на минутку?».", "Welcome to the “Got a minute?” department."],
    ["Назначаю встречный созвон про этот созвон", "I book a meeting about that meeting", "Мыслите масштабно, как топ-менеджмент.", "Thinking big — like upper management."]
  ] },
  { q: ["Почему ушли с прошлой работы?", "Why did you leave your last job?"], a: [
    ["Не сошлись характерами с принтером", "Creative differences with the printer", "Он у всех такой. Мы с ним тоже не разговариваем.", "It’s like that with everyone. We don’t talk to it either."],
    ["Выгорел. Ярко, красиво, с искрами", "Burned out. Brightly, with sparks", "Огнетушитель — на втором этаже. На всякий случай.", "Fire extinguisher is on the second floor. Just in case."],
    ["На кухне кончились печеньки", "The office ran out of cookies", "У нас печеньки по средам. Ну, иногда.", "We have cookies on Wednesdays. Well, sometimes."],
    ["Меня позвали сюда (вы просто ещё не знаете)", "You invited me here (you just don’t know it yet)", "…Смело. Запишу как «нетворкинг».", "…Bold. Filing under “networking”."]
  ] },
  { q: ["Где вы видите себя через 5 лет?", "Where do you see yourself in 5 years?"], a: [
    ["На вашем месте", "In your chair", "Я тоже себя на нём не вижу. Договорились.", "I don’t see myself in it either. Deal."],
    ["На этом же собеседовании", "At this very interview", "Самый реалистичный ответ за неделю.", "The most realistic answer this week."],
    ["В отпуске, который наконец согласовали", "On the vacation that finally got approved", "Смелые планы. Согласуем через 5 лет.", "Ambitious. We’ll approve it in 5 years."],
    ["Там, где нет слова «срочно»", "Somewhere the word “ASAP” doesn’t exist", "Такого места нет, но мечтать не запрещено.", "No such place, but dreaming is allowed."]
  ] },
  { q: ["Любимый смайлик в рабочем чате", "Favourite emoji in the work chat"], a: [
    ["👍 — ответ на всё", "👍 — the answer to everything", "И «да», и «нет», и «отстаньте». Профессионал.", "“Yes”, “no” and “leave me alone”. A pro."],
    ["🔥 — даже если горит дедлайн", "🔥 — even when the deadline’s on fire", "Особенно если горит дедлайн.", "Especially when the deadline’s on fire."],
    ["🙏 — и «спасибо», и «пожалуйста» сразу", "🙏 — “thanks” and “please” in one", "Экономите слова — экономите время. Плюс.", "Saving words saves time. Plus one."],
    [")))) — я из старой школы", ":-))) — I’m old school", "Четыре скобки — уровень «старший специалист».", "Triple brackets — senior specialist level."]
  ] },
  { q: ["Как вы отвечаете на письмо в 23:00?", "How do you answer an email at 11 PM?"], a: [
    ["Утром. С кофе. С достоинством", "In the morning. With coffee. With dignity", "Здоровые границы! Так и запишу. Карандашом.", "Healthy boundaries! Writing that down. In pencil."],
    ["Сразу, с телефона, из-под одеяла", "Instantly, from my phone, under the blanket", "Руководство прослезилось.", "Management is in tears."],
    ["Ставлю «прочитано» и не сплю до утра", "I mark it “read” and lie awake till dawn", "Классика. У нас так полофиса.", "Classic. Half the office does that."],
    ["Пишу «Добрый вечер!» и исчезаю", "I write “Good evening!” and vanish", "Мастер вежливого исчезновения.", "A master of the polite disappearance."]
  ] }
];
const ankT = (pair) => L(pair[0], pair[1]);
const anketaNeeded = () => !prefs.anketaDone;
function anketaRecUse(short) {
  if (!prefs.anketaRec || short > ANK_REC) return false;
  prefs.anketaRec = 0;
  store.set(KEY.prefs, prefs);
  return true;
}
function anketaNote() {
  var _a;
  const a = (_a = prefs.anketa) == null ? void 0 : _a.a;
  if (!a && !prefs.anketaRec) return "";
  const pw = a && ANK_QS[0].a[a[0]];
  return '<p class="ank-note">📋 '.concat(pw ? L("HR листает вашу анкету: «Суперсила — ".concat(esc(pw[0].toLowerCase()), "». Хм."), "HR flips through your application: “Superpower — ".concat(esc(pw[1].toLowerCase()), "”. Hmm.")) : "").concat(prefs.anketaRec ? " <b>".concat(L("📎 Рекомендация HR в кармане: +".concat(ANK_REC, " балла, если не хватит."), "📎 HR referral in your pocket: +".concat(ANK_REC, " points if you fall short.")), "</b>") : "", "</p>");
}
function anketaOpen(done) {
  if (!document.getElementById("ankFont")) {
    const l = document.createElement("link");
    l.id = "ankFont";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap";
    document.head.append(l);
  }
  const finish = () => {
    done == null ? void 0 : done();
  };
  const sheet = (inner) => {
    var _a;
    views.end.innerHTML = '<div class="end-sheet ank-wrap"><div class="ank-board"><span class="ank-clip" aria-hidden="true"></span><div class="ank-paper">'.concat(inner, "</div></div></div>");
    show("end");
    (_a = window.scrollTo) == null ? void 0 : _a.call(window, 0, 0);
  };
  const head = (sub = "", sm = false) => '<div class="ank-head'.concat(sm ? " ank-sm" : "", '"><span class="ank-stamp" aria-hidden="true">').concat(L("ОТДЕЛ КАДРОВ", "HR DEPT."), '</span>\n    <small class="ank-form">').concat(L("Форма № 52-П · заполняется соискателем", "Form No. 52-B · to be filled in by the applicant"), '</small>\n    <h1 class="ank-title">').concat(L("Анкета соискателя", "Job application form"), "</h1>").concat(sub, "</div>");
  const skip = () => {
    prefs.anketaDone = "skip";
    store.set(KEY.prefs, prefs);
    track("anketa_skip");
    finish();
  };
  sheet("".concat(head(), '\n    <p class="ank-lead">').concat(L("Перед собеседованием HR просит заполнить анкету. 7 вопросов, ответы — галочкой, минута времени. В конце — бонус на выбор:", "Before the interview HR asks you to fill in a form. 7 questions, just tick a box, one minute. A bonus of your choice at the end:"), '</p>\n    <ul class="ank-perks"><li>💰 ').concat(L("+".concat(ANK_CASH, " у.е. на счёт"), "+$".concat(ANK_CASH, " to your bank")), "</li><li>📎 ").concat(L("или рекомендация HR: +".concat(ANK_REC, " балла на собеседовании, когда не хватит"), "or an HR referral: +".concat(ANK_REC, " points at an interview when you fall short")), '</li></ul>\n    <div class="ank-btns"><button class="btn-main" type="button" id="ankGo">✍️ ').concat(L("Заполнить", "Fill it in"), '</button><button class="btn-ghost" type="button" id="ankSkip">').concat(L("Пропустить", "Skip"), "</button></div>"));
  $("ankSkip").onclick = skip;
  $("ankGo").onclick = () => {
    var _a;
    (_a = sfx.stapler) == null ? void 0 : _a.call(sfx);
    ask(0);
  };
  $("ankGo").focus({ preventScroll: true });
  const answers = [];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ask = (i) => {
    const q = ANK_QS[i];
    sheet("".concat(head('<div class="ank-prog" aria-label="'.concat(L("Вопрос ".concat(i + 1, " из ").concat(ANK_QS.length), "Question ".concat(i + 1, " of ").concat(ANK_QS.length)), '">').concat(ANK_QS.map((_, j) => '<i class="'.concat(j < i ? "done" : j === i ? "now" : "", '"></i>')).join(""), "</div>"), true), '\n      <fieldset class="ank-q"><legend><span class="ank-n">').concat(i + 1, ".</span> ").concat(ankT(q.q), "</legend>\n        ").concat(q.a.map((a, k) => '<button type="button" class="ank-opt" data-k="'.concat(k, '"><span class="ank-box" aria-hidden="true"></span><span class="ank-txt">').concat(esc(L(a[0], a[1])), "</span></button>")).join(""), '\n      </fieldset>\n      <p class="ank-hr" id="ankHr" aria-live="polite"></p>\n      <button class="ank-quit" type="button" id="ankQuit">').concat(L("Бросить анкету и идти на собеседование", "Ditch the form and go to the interview"), "</button>"));
    const opts = [...views.end.querySelectorAll(".ank-opt")];
    opts.forEach((b) => b.onclick = () => {
      var _a;
      const k = +b.dataset.k;
      answers[i] = k;
      opts.forEach((x) => {
        x.disabled = true;
        x.classList.toggle("on", x === b);
      });
      b.setAttribute("aria-pressed", "true");
      $("ankHr").innerHTML = "<b>HR:</b> ".concat(esc(L(q.a[k][2], q.a[k][3])));
      (_a = sfx.stapler) == null ? void 0 : _a.call(sfx);
      setTimeout(() => i + 1 < ANK_QS.length ? ask(i + 1) : reward(), reduce ? 1700 : 1400);
    });
    $("ankQuit").onclick = skip;
    opts[0].focus({ preventScroll: true });
  };
  const reward = () => {
    sheet("".concat(head(), '\n      <label class="ank-about"><span>').concat(L("О себе (необязательно)", "About me (optional)"), '</span>\n        <textarea id="ankAbout" maxlength="200" rows="2" placeholder="').concat(L("Например: «Не ем чужие йогурты из холодильника»", "E.g. “I never eat other people’s yoghurts from the fridge”"), '"></textarea>\n        <small>').concat(L("Остаётся только на вашем устройстве", "Stays on your device only"), '</small></label>\n      <p class="ank-lead">').concat(L("Подпись соискателя: ✓. Выберите бонус:", "Applicant’s signature: ✓. Pick your bonus:"), '</p>\n      <div class="ank-btns"><button class="btn-main" type="button" data-r="cash">💰 ').concat(L("+".concat(ANK_CASH, " у.е. на счёт"), "+$".concat(ANK_CASH, " to your bank")), '</button>\n        <button class="btn-main ank-rec" type="button" data-r="rec">📎 ').concat(L("Рекомендация HR: +".concat(ANK_REC, " балла на собеседовании"), "HR referral: +".concat(ANK_REC, " interview points")), '</button></div>\n      <small class="ank-fine">').concat(L("Рекомендация сработает, когда до проходного балла не хватит 1–2 баллов, и сгорит только тогда.", "The referral kicks in when you’re 1–2 points short of the pass mark — and is only used up then."), "</small>"));
    views.end.querySelectorAll("[data-r]").forEach((b) => b.onclick = () => {
      const r = b.dataset.r, about = $("ankAbout").value.trim().slice(0, 200);
      try {
        if (about) localStorage.setItem(ANK_ABOUT, about);
        else localStorage.removeItem(ANK_ABOUT);
      } catch (e) {
      }
      prefs.anketaDone = "done";
      prefs.anketa = { a: answers.slice() };
      if (r === "rec") prefs.anketaRec = 1;
      store.set(KEY.prefs, prefs);
      if (r === "cash") addCash(ANK_CASH);
      track("anketa_done", { detail: r });
      done2(r);
    });
    $("ankAbout").focus({ preventScroll: true });
  };
  const done2 = (r) => {
    var _a, _b, _c, _d, _e, _f;
    sheet("".concat(head(), '<div class="ank-ok"><span class="ank-stamp2" aria-hidden="true">').concat(L("ПРИНЯТО", "APPROVED"), '</span>\n      <p class="ank-lead">').concat(r === "cash" ? L("На счёт зачислено +".concat(ANK_CASH, " у.е. Теперь у вас ").concat(money((_b = (_a = careerNow()) == null ? void 0 : _a.bank) != null ? _b : 0), "."), "+$".concat(ANK_CASH, " added. Your balance: ").concat(money((_d = (_c = careerNow()) == null ? void 0 : _c.bank) != null ? _d : 0), ".")) : L("Рекомендация HR подшита к делу: +".concat(ANK_REC, " балла, когда не хватит до проходного."), "HR referral attached to your file: +".concat(ANK_REC, " points when you fall short of the pass mark.")), '</p>\n      <p class="ank-hr"><b>HR:</b> ').concat(L("Анкету подшила. Вас ждут на собеседовании, удачи!", "Filed. They’re ready for your interview — good luck!"), '</p></div>\n      <div class="ank-btns"><button class="btn-main" type="button" id="ankNext">').concat(L("На собеседование →", "To the interview →"), "</button></div>"));
    (_e = sfx.stamp) == null ? void 0 : _e.call(sfx);
    if (r === "cash") (_f = sfx.coins) == null ? void 0 : _f.call(sfx);
    $("ankNext").onclick = finish;
    $("ankNext").focus({ preventScroll: true });
  };
}
{
  const ivOrig = interview;
  interview = (v) => anketaNeeded() && typeof C !== "undefined" && C ? anketaOpen(() => ivOrig(v)) : ivOrig(v);
}
