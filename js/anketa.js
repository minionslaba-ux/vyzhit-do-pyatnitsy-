'use strict';
// «Анкета соискателя»: короткая шуточная анкета перед первым собеседованием (один раз, можно пропустить).
// Награда на выбор: +5 у.е. на счёт или рекомендация HR (+2 балла на собеседовании, когда их не хватает до проходного).
// Ответы хранятся только локально: prefs.anketa = { a: [индексы ответов] }; поле «О себе» — в отдельном ключе, никуда не отправляется.
const ANK_CASH = 5, ANK_REC = 2, ANK_ABOUT = 'vdp-anketa-about';
const ANK_QS = [
  { q: ['Ваша суперсила в офисе', 'Your office superpower'], a: [
    ['Нахожу свободную переговорку за 30 секунд', 'I find a free meeting room in 30 seconds', 'Редкий дар. Запишу в «ключевые компетенции».', 'A rare gift. Filing under “core competencies”.'],
    ['Говорю «давайте вернёмся к этому позже» — и не возвращаюсь', 'I say “let’s circle back” and never do', 'Узнаю почерк будущего руководителя.', 'I see future-manager handwriting.'],
    ['Чиню принтер одним взглядом', 'I fix the printer with a single glare', 'Принтер пока об этом не знает. Не говорите ему.', 'The printer doesn’t know yet. Don’t tell it.'],
    ['Помню все дни рождения и уже скинулся', 'I remember every birthday and already chipped in', 'Бухгалтерия вас уже любит.', 'Accounting already loves you.']] },
  { q: ['Сколько кружек кофе до обеда?', 'How many coffees before lunch?'], a: [
    ['Ноль. Я на чае и самообладании', 'Zero. I run on tea and self-control', 'Подозрительно спокойны. Проверим на первом созвоне.', 'Suspiciously calm. The first call will tell.'],
    ['Одна-две, как приличный человек', 'One or two, like a decent person', 'Сбалансированно. Почти по регламенту.', 'Balanced. Almost policy-compliant.'],
    ['Я не считаю, я подключён к кофемашине', 'I don’t count, I’m plugged into the machine', 'Кофемашина уже нервничает.', 'The coffee machine is already nervous.'],
    ['Пока не начну слышать цвета', 'Until I start hearing colours', 'Отметила: «высокая мотивация».', 'Noted: “highly motivated”.']] },
  { q: ['Ваше отношение к созвонам без повестки', 'Your take on meetings with no agenda'], a: [
    ['Это письмо, которое научилось говорить', 'It’s an email that learned to talk', 'Повесим эту цитату в переговорке.', 'We’re framing that in the meeting room.'],
    ['Камера выключена, совесть тоже', 'Camera off, conscience off', 'Честно. Мы ценим честность. Немного.', 'Honest. We value honesty. Somewhat.'],
    ['Обожаю! Хоть с кем-то поговорить', 'Love them! Finally someone to talk to', 'Вы приняты в отдел «Можно на минутку?».', 'Welcome to the “Got a minute?” department.'],
    ['Назначаю встречный созвон про этот созвон', 'I book a meeting about that meeting', 'Мыслите масштабно, как топ-менеджмент.', 'Thinking big — like upper management.']] },
  { q: ['Почему ушли с прошлой работы?', 'Why did you leave your last job?'], a: [
    ['Не сошлись характерами с принтером', 'Creative differences with the printer', 'Он у всех такой. Мы с ним тоже не разговариваем.', 'It’s like that with everyone. We don’t talk to it either.'],
    ['Выгорел. Ярко, красиво, с искрами', 'Burned out. Brightly, with sparks', 'Огнетушитель — на втором этаже. На всякий случай.', 'Fire extinguisher is on the second floor. Just in case.'],
    ['На кухне кончились печеньки', 'The office ran out of cookies', 'У нас печеньки по средам. Ну, иногда.', 'We have cookies on Wednesdays. Well, sometimes.'],
    ['Меня позвали сюда (вы просто ещё не знаете)', 'You invited me here (you just don’t know it yet)', '…Смело. Запишу как «нетворкинг».', '…Bold. Filing under “networking”.']] },
  { q: ['Где вы видите себя через 5 лет?', 'Where do you see yourself in 5 years?'], a: [
    ['На вашем месте', 'In your chair', 'Я тоже себя на нём не вижу. Договорились.', 'I don’t see myself in it either. Deal.'],
    ['На этом же собеседовании', 'At this very interview', 'Самый реалистичный ответ за неделю.', 'The most realistic answer this week.'],
    ['В отпуске, который наконец согласовали', 'On the vacation that finally got approved', 'Смелые планы. Согласуем через 5 лет.', 'Ambitious. We’ll approve it in 5 years.'],
    ['Там, где нет слова «срочно»', 'Somewhere the word “ASAP” doesn’t exist', 'Такого места нет, но мечтать не запрещено.', 'No such place, but dreaming is allowed.']] },
  { q: ['Любимый смайлик в рабочем чате', 'Favourite emoji in the work chat'], a: [
    ['👍 — ответ на всё', '👍 — the answer to everything', 'И «да», и «нет», и «отстаньте». Профессионал.', '“Yes”, “no” and “leave me alone”. A pro.'],
    ['🔥 — даже если горит дедлайн', '🔥 — even when the deadline’s on fire', 'Особенно если горит дедлайн.', 'Especially when the deadline’s on fire.'],
    ['🙏 — и «спасибо», и «пожалуйста» сразу', '🙏 — “thanks” and “please” in one', 'Экономите слова — экономите время. Плюс.', 'Saving words saves time. Plus one.'],
    [')))) — я из старой школы', ':-))) — I’m old school', 'Четыре скобки — уровень «старший специалист».', 'Triple brackets — senior specialist level.']] },
  { q: ['Как вы отвечаете на письмо в 23:00?', 'How do you answer an email at 11 PM?'], a: [
    ['Утром. С кофе. С достоинством', 'In the morning. With coffee. With dignity', 'Здоровые границы! Так и запишу. Карандашом.', 'Healthy boundaries! Writing that down. In pencil.'],
    ['Сразу, с телефона, из-под одеяла', 'Instantly, from my phone, under the blanket', 'Руководство прослезилось.', 'Management is in tears.'],
    ['Ставлю «прочитано» и не сплю до утра', 'I mark it “read” and lie awake till dawn', 'Классика. У нас так полофиса.', 'Classic. Half the office does that.'],
    ['Пишу «Добрый вечер!» и исчезаю', 'I write “Good evening!” and vanish', 'Мастер вежливого исчезновения.', 'A master of the polite disappearance.']] }
];
const ankT = pair => L(pair[0], pair[1]);
// Показать один раз — перед первым собеседованием (и старым игрокам — перед ближайшим)
const anketaNeeded = () => !prefs.anketaDone;
// Рекомендация HR: тратится, только если именно её баллов хватает до проходного
function anketaRecUse(short) {
  if (!prefs.anketaRec || short > ANK_REC) return false;
  prefs.anketaRec = 0; store.set(KEY.prefs, prefs); return true;
}
// Строчка в начале собеседования: HR листает анкету
function anketaNote() {
  const a = prefs.anketa?.a; if (!a && !prefs.anketaRec) return '';
  const pw = a && ANK_QS[0].a[a[0]];
  return `<p class="ank-note">📋 ${pw ? L(`HR листает вашу анкету: «Суперсила — ${esc(pw[0].toLowerCase())}». Хм.`, `HR flips through your application: “Superpower — ${esc(pw[1].toLowerCase())}”. Hmm.`) : ''}${prefs.anketaRec ? ` <b>${L(`📎 Рекомендация HR в кармане: +${ANK_REC} балла, если не хватит.`, `📎 HR referral in your pocket: +${ANK_REC} points if you fall short.`)}</b>` : ''}</p>`;
}

function anketaOpen(done) {
  // рукописный шрифт для ответов (кириллица есть); не загрузился — остаётся основной шрифт игры
  if (!document.getElementById('ankFont')) { const l = document.createElement('link'); l.id = 'ankFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap'; document.head.append(l); }
  const finish = () => { done?.(); };
  const sheet = inner => {
    views.end.innerHTML = `<div class="end-sheet ank-wrap"><div class="ank-board"><span class="ank-clip" aria-hidden="true"></span><div class="ank-paper">${inner}</div></div></div>`;
    show('end'); window.scrollTo?.(0, 0);
  };
  const head = (sub = '', sm = false) => `<div class="ank-head${sm ? ' ank-sm' : ''}"><span class="ank-stamp" aria-hidden="true">${L('ОТДЕЛ КАДРОВ', 'HR DEPT.')}</span>
    <small class="ank-form">${L('Форма № 52-П · заполняется соискателем', 'Form No. 52-B · to be filled in by the applicant')}</small>
    <h1 class="ank-title">${L('Анкета соискателя', 'Job application form')}</h1>${sub}</div>`;
  const skip = () => {
    prefs.anketaDone = 'skip'; store.set(KEY.prefs, prefs);
    track('anketa_skip');
    finish();
  };
  // Вступление: «Заполнить» / «Пропустить» — пропуск в одно касание и навсегда
  sheet(`${head()}
    <p class="ank-lead">${L('Перед собеседованием HR просит заполнить анкету. 7 вопросов, ответы — галочкой, минута времени. В конце — бонус на выбор:', 'Before the interview HR asks you to fill in a form. 7 questions, just tick a box, one minute. A bonus of your choice at the end:')}</p>
    <ul class="ank-perks"><li>💰 ${L(`+${ANK_CASH} у.е. на счёт`, `+$${ANK_CASH} to your bank`)}</li><li>📎 ${L(`или рекомендация HR: +${ANK_REC} балла на собеседовании, когда не хватит`, `or an HR referral: +${ANK_REC} points at an interview when you fall short`)}</li></ul>
    <div class="ank-btns"><button class="btn-main" type="button" id="ankGo">✍️ ${L('Заполнить', 'Fill it in')}</button><button class="btn-ghost" type="button" id="ankSkip">${L('Пропустить', 'Skip')}</button></div>`);
  $('ankSkip').onclick = skip;
  $('ankGo').onclick = () => { sfx.stapler?.(); ask(0); };
  $('ankGo').focus({ preventScroll: true });
  const answers = [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Вопрос: тап по варианту ставит галочку, HR подписывает реакцию на полях, затем следующий
  const ask = i => {
    const q = ANK_QS[i];
    sheet(`${head(`<div class="ank-prog" aria-label="${L(`Вопрос ${i + 1} из ${ANK_QS.length}`, `Question ${i + 1} of ${ANK_QS.length}`)}">${ANK_QS.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('')}</div>`, true)}
      <fieldset class="ank-q"><legend><span class="ank-n">${i + 1}.</span> ${ankT(q.q)}</legend>
        ${q.a.map((a, k) => `<button type="button" class="ank-opt" data-k="${k}"><span class="ank-box" aria-hidden="true"></span><span class="ank-txt">${esc(L(a[0], a[1]))}</span></button>`).join('')}
      </fieldset>
      <p class="ank-hr" id="ankHr" aria-live="polite"></p>
      <button class="ank-quit" type="button" id="ankQuit">${L('Бросить анкету и идти на собеседование', 'Ditch the form and go to the interview')}</button>`);
    const opts = [...views.end.querySelectorAll('.ank-opt')];
    opts.forEach(b => b.onclick = () => {
      const k = +b.dataset.k; answers[i] = k;
      opts.forEach(x => { x.disabled = true; x.classList.toggle('on', x === b); });
      b.setAttribute('aria-pressed', 'true');
      $('ankHr').innerHTML = `<b>HR:</b> ${esc(L(q.a[k][2], q.a[k][3]))}`;
      sfx.stapler?.();
      setTimeout(() => i + 1 < ANK_QS.length ? ask(i + 1) : reward(), reduce ? 1700 : 1400);
    });
    $('ankQuit').onclick = skip;
    opts[0].focus({ preventScroll: true });
  };
  // Финал: «О себе» (необязательно, только локально) и выбор бонуса
  const reward = () => {
    sheet(`${head()}
      <label class="ank-about"><span>${L('О себе (необязательно)', 'About me (optional)')}</span>
        <textarea id="ankAbout" maxlength="200" rows="2" placeholder="${L('Например: «Не ем чужие йогурты из холодильника»', 'E.g. “I never eat other people’s yoghurts from the fridge”')}"></textarea>
        <small>${L('Остаётся только на вашем устройстве', 'Stays on your device only')}</small></label>
      <p class="ank-lead">${L('Подпись соискателя: ✓. Выберите бонус:', 'Applicant’s signature: ✓. Pick your bonus:')}</p>
      <div class="ank-btns"><button class="btn-main" type="button" data-r="cash">💰 ${L(`+${ANK_CASH} у.е. на счёт`, `+$${ANK_CASH} to your bank`)}</button>
        <button class="btn-main ank-rec" type="button" data-r="rec">📎 ${L(`Рекомендация HR: +${ANK_REC} балла на собеседовании`, `HR referral: +${ANK_REC} interview points`)}</button></div>
      <small class="ank-fine">${L('Рекомендация сработает, когда до проходного балла не хватит 1–2 баллов, и сгорит только тогда.', 'The referral kicks in when you’re 1–2 points short of the pass mark — and is only used up then.')}</small>`);
    views.end.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
      const r = b.dataset.r, about = $('ankAbout').value.trim().slice(0, 200);
      try { if (about) localStorage.setItem(ANK_ABOUT, about); else localStorage.removeItem(ANK_ABOUT); } catch {}
      prefs.anketaDone = 'done'; prefs.anketa = { a: answers.slice() };
      if (r === 'rec') prefs.anketaRec = 1;
      store.set(KEY.prefs, prefs);
      if (r === 'cash') addCash(ANK_CASH);
      track('anketa_done', { detail: r });
      done2(r);
    });
    $('ankAbout').focus({ preventScroll: true });
  };
  const done2 = r => {
    sheet(`${head()}<div class="ank-ok"><span class="ank-stamp2" aria-hidden="true">${L('ПРИНЯТО', 'APPROVED')}</span>
      <p class="ank-lead">${r === 'cash' ? L(`На счёт зачислено +${ANK_CASH} у.е. Теперь у вас ${money(careerNow()?.bank ?? 0)}.`, `+$${ANK_CASH} added. Your balance: ${money(careerNow()?.bank ?? 0)}.`) : L(`Рекомендация HR подшита к делу: +${ANK_REC} балла, когда не хватит до проходного.`, `HR referral attached to your file: +${ANK_REC} points when you fall short of the pass mark.`)}</p>
      <p class="ank-hr"><b>HR:</b> ${L('Анкету подшила. Вас ждут на собеседовании, удачи!', 'Filed. They’re ready for your interview — good luck!')}</p></div>
      <div class="ank-btns"><button class="btn-main" type="button" id="ankNext">${L('На собеседование →', 'To the interview →')}</button></div>`);
    sfx.stamp?.(); if (r === 'cash') sfx.coins?.();
    $('ankNext').onclick = finish;
    $('ankNext').focus({ preventScroll: true });
  };
}

// Встраиваемся перед собеседованием (js/game.js): первый раз — сначала анкета
{
  const ivOrig = interview;
  interview = v => anketaNeeded() && typeof C !== 'undefined' && C ? anketaOpen(() => ivOrig(v)) : ivOrig(v);
}
