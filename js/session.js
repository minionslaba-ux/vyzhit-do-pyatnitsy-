// ---------- одна сессия — подольше ----------
// 1) «Темп»: на экране конца недели карьеры кнопка «дальше» с кольцом обратного отсчёта (5 с) и бонусом
//    +1 у.е., если нажать её в первые 10 секунд. Не больше 5 бонусов в день. Неделю сами не запускаем.
// 2) «Цель сессии»: строка в шапке недели — пройдите 3 недели подряд (сессия — пока нет 30 минут бездействия),
//    за цель — сундук (+5 у.е. и приятная мелочь), дальше — 5 недель и сундук побольше (+10 у.е.).
// 3) Мини-событие посреди недели: раз в неделю на случайном шаге 6–19 — окно на 20 секунд с 2–3 вариантами.
//    Пока окно открыто, таймер ответа стоит (js/timer.js ставит паузу, когда #modal открыт).
// Всё бесплатно — без needReg (js/guest.js).
const SES_KEY = 'vdp-session', SES_TEMPO_KEY = 'vdp-ses-tempo';
const SES_IDLE = 30 * 60 * 1000, SES_TEMPO_WIN = 10, SES_TEMPO_RING = 5, SES_TEMPO_MAX = 5, SES_MINI_TIME = 20;
const SES_GOALS = [{ n: 3, cash: 5 }, { n: 5, cash: 10 }];  // после второй — снова «5 недель»
const sesCareer = () => S?.mode === 'career' && typeof C !== 'undefined' && C;

// ---------- сессия ----------
function sesGet() {
  const now = Date.now();
  let s = store.get(SES_KEY, null);
  if (!s || !(now - (s.last || 0) < SES_IDLE)) { s = { start: now, last: now, weeks: 0, goal: 0 }; store.set(SES_KEY, s); }
  return s;
}
let sesTouchAt = 0;
function sesTouch() {
  const now = Date.now(); if (now - sesTouchAt < 10000) return;
  sesTouchAt = now; const s = sesGet(); s.last = now; store.set(SES_KEY, s);
}
['pointerdown', 'keydown'].forEach(e => addEventListener(e, sesTouch, { passive: true, capture: true }));
const sesGoal = s => SES_GOALS[Math.min(s.goal, SES_GOALS.length - 1)];

// Строка в шапке недели: в правой колонке под «утро · 01/25» — левая колонка (название + «Неделя N/52») и так выше, высота шапки не меняется
function sesStrip() {
  let el = $('sesGoal');
  if (!el && $('gType')) { el = Object.assign(document.createElement('small'), { id: 'sesGoal', className: 'ses-goal' }); $('gType').after(el); }
  if (!el) return;
  if (!sesCareer()) { el.hidden = true; return; }
  const s = sesGet(), g = sesGoal(s), n = Math.min(s.weeks, g.n);
  const full = s.goal === 0 ? L(`Цель сессии: пройдите 3 недели подряд — ${n}/${g.n}`, `Session goal: finish 3 weeks in a row — ${n}/${g.n}`)
    : L(`Цель сессии: ${g.n} недель — сундук побольше · ${n}/${g.n}`, `Session goal: ${g.n} weeks for a bigger chest · ${n}/${g.n}`);
  const short = s.goal === 0 ? L(`🎯 3 недели подряд: ${n}/${g.n}`, `🎯 3 weeks in a row: ${n}/${g.n}`) : L(`🎯 ${g.n} недель → 💎 ${n}/${g.n}`, `🎯 ${g.n} weeks → 💎 ${n}/${g.n}`);
  el.hidden = false; el.title = full; el.setAttribute('aria-label', full);
  el.innerHTML = `<span class="ses-goal-t">${short}</span><i class="ses-goal-bar" aria-hidden="true"><i style="width:${Math.round(n / g.n * 100)}%"></i></i>`;
}
// renderCard() каждый раз переписывает #gCareer — обновляем строку следом
if ($('gCareer') && typeof MutationObserver !== 'undefined') new MutationObserver(sesStrip).observe($('gCareer'), { childList: true, characterData: true, subtree: true });

// Сундук ждёт в хранилище (vdp-ses-chest), пока игрок его не заберёт: другое окно (повышение, аттестация) может
// перехватить модалку — тогда покажем сундук снова, когда она освободится. Награда — по нажатию «Забрать».
const SES_CHEST_KEY = 'vdp-ses-chest';
let sesChestQ = 0;
function sesChestQueue(delay = 1400) {
  clearTimeout(sesChestQ);
  let tries = 0, free = 0;
  const tick = () => {
    if (!store.get(SES_CHEST_KEY, null) || document.querySelector('#modal:not([hidden]) .ses-chest')) return;
    free = $('modal').hidden && !document.hidden && !window.vdpPaused && !splashOn && !busyEnd() ? free + 1 : 0;
    if (free >= 2) return sesChest();  // окно свободно две проверки подряд — другие окна уже показались
    if (++tries < 600) sesChestQ = setTimeout(tick, 700);
  };
  sesChestQ = setTimeout(tick, delay);
}
const busyEnd = () => views.game.hidden && views.end.hidden && views.menu.hidden;  // мини-игра, реклама и т. п.
function sesChest() {
  const ch = store.get(SES_CHEST_KEY, null); if (!ch) return;
  const big = ch.cash >= 10, next = SES_GOALS[Math.min(ch.goal + 1, SES_GOALS.length - 1)];
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass lvl-box ses-chest" role="dialog" aria-modal="true" aria-labelledby="sesChestT">
    <span class="lvl-ico ses-chest-ico" aria-hidden="true">${big ? '💎' : '🎁'}</span>
    <h2 id="sesChestT">${L(`Цель сессии выполнена: ${ch.n} ${ch.n < 5 ? 'недели' : 'недель'} подряд!`, `Session goal done: ${ch.n} weeks in a row!`)}</h2>
    <p>${big ? L('Это уже марафон. Сундук побольше — ваш.', 'That’s a marathon. The bigger chest is yours.') : L('Вы в ритме — офис даже немного напуган. Держите сундук.', 'You’re on a roll — the office is a little scared. Here’s a chest.')}</p>
    <div class="ses-loot"><div><b>+${money(ch.cash)}</b><span>${L('на счёт карьеры', 'to your career bank')}</span></div>
      <div><b>${ch.hint ? '💡 +1' : `+${money(2)}`}</b><span>${ch.hint ? L('бесплатная подсказка', 'free hint') : L('бонус из сундука', 'chest bonus')}</span></div></div>
    <p class="ses-next">${L(`Следующая цель: ${next.n} недель — сундук побольше (+${money(next.cash)})`, `Next goal: ${next.n} weeks for a bigger chest (+${money(next.cash)})`)}</p>
    <button class="btn-main" type="button" id="sesChestOk">${L('Забрать', 'Claim')}</button></div>`;
  m.hidden = false; m.onclick = null;
  try { confetti(); } catch {}
  $('sesChestOk').onclick = () => {
    if (!store.get(SES_CHEST_KEY, null)) { m.hidden = true; return; }
    store.del(SES_CHEST_KEY);
    addCash(ch.cash);
    if (ch.hint) { prefs.freeHints = (prefs.freeHints || 0) + 1; store.set(KEY.prefs, prefs); } else addCash(2);
    track('session_goal', { mode: 'career', detail: `${ch.n}:${ch.cash}${ch.hint ? ':hint' : ':cash2'}` });
    try { sfx.coins(); } catch {}
    m.hidden = true;
    toast(L(`🎁 Сундук открыт: +${money(ch.cash + (ch.hint ? 0 : 2))}${ch.hint ? ' и подсказка' : ''}`, `🎁 Chest opened: +${money(ch.cash + (ch.hint ? 0 : 2))}${ch.hint ? ' and a hint' : ''}`));
    if (S && !views.game.hidden && typeof renderBars === 'function') renderBars();
    if (S && !views.game.hidden && typeof cardTools === 'function' && S.mode === 'career') try { cardTools(); } catch {}
  };
  $('sesChestOk').focus({ preventScroll: true });
  // окно перехватили до нажатия — вернёмся позже
  const watch = setInterval(() => {
    if (!store.get(SES_CHEST_KEY, null)) return clearInterval(watch);
    if (!document.querySelector('#modal .ses-chest')) { clearInterval(watch); sesChestQueue(700); }
  }, 1000);
}
function sesWeekDone() {
  const s = sesGet(); s.weeks++; s.last = Date.now();
  const g = sesGoal(s);
  if (s.weeks >= g.n) {
    const old = store.get(SES_CHEST_KEY, null);  // прошлый сундук ещё не забрали — складываем
    store.set(SES_CHEST_KEY, { n: g.n, cash: g.cash + (old?.cash || 0) + (old && !old.hint ? 2 : 0), goal: s.goal, hint: Math.random() < .5 });
    s.weeks = 0; s.goal++; sesChestQueue();
  }
  store.set(SES_KEY, s);
  sesStrip();
}
// Сундук не забрали (закрыли вкладку) — предложим при следующем запуске
dataReady.then(() => { if (store.get(SES_CHEST_KEY, null)) sesChestQueue(4000); }).catch(() => {});

// ---------- «Темп»: кнопка следующей недели ----------
function sesTempoLeft() {
  const t = store.get(SES_TEMPO_KEY, null), n = t?.day === today() ? t.n : 0;
  return SES_TEMPO_MAX - n;
}
let sesTempo = null;  // { btn, lab, fab, left, t, io }
function sesTempoStop() {
  const st = sesTempo; if (!st) return;
  clearInterval(st.t); st.io?.disconnect(); st.fab?.remove(); sesTempo = null;
}
const sesRingHtml = () => `<span class="ses-ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="ses-ring-bg" cx="18" cy="18" r="15.5"/><circle class="ses-ring-fg" cx="18" cy="18" r="15.5" pathLength="100"/></svg><b>${SES_TEMPO_RING}</b></span>`;
function sesTempoArm() {
  sesTempoStop();
  const btn = $('next'); if (!btn || views.end.hidden || !sesCareer() || C.week > YEAR || sesTempoLeft() <= 0) return;
  const bonus = L(`⚡ +${money(1)}, если начать сейчас`, `⚡ +${money(1)} if you start now`), label = btn.textContent.trim();
  btn.classList.add('ses-hot'); btn.insertAdjacentHTML('afterbegin', sesRingHtml());
  const lab = Object.assign(document.createElement('div'), { className: 'ses-tempo', textContent: bonus });
  lab.setAttribute('role', 'status');
  btn.after(lab);
  // Экран итогов длинный и кнопка часто ниже края — пока она не видна, дублируем её плашкой внизу экрана
  const fab = Object.assign(document.createElement('div'), { className: 'ses-fab', hidden: true });
  fab.innerHTML = `<button class="btn-main ses-hot" type="button">${sesRingHtml()}<span>${esc(label)}</span></button><small>${bonus}</small>`;
  fab.querySelector('button').onclick = () => { if (btn.isConnected) btn.click(); else sesTempoStop(); };
  document.body.append(fab);
  const st = sesTempo = { btn, lab, fab, left: SES_TEMPO_WIN, last: performance.now() };
  if (typeof IntersectionObserver !== 'undefined') { st.io = new IntersectionObserver(es => { for (const e of es) fab.hidden = e.isIntersecting; }); st.io.observe(btn); }
  const draw = () => {
    const ringLeft = Math.max(0, st.left - (SES_TEMPO_WIN - SES_TEMPO_RING));
    for (const r of [btn, fab].map(x => x.querySelector('.ses-ring'))) {
      if (!r) continue;
      r.querySelector('b').textContent = ringLeft > 0 ? Math.ceil(ringLeft) : '⚡';
      r.style.setProperty('--p', ringLeft / SES_TEMPO_RING);
    }
  };
  draw();
  st.t = setInterval(() => {
    const now = performance.now(), dt = (now - st.last) / 1000; st.last = now;
    if (!btn.isConnected || views.end.hidden) return sesTempoStop();
    if (document.hidden || !$('modal').hidden || window.vdpPaused) { fab.classList.add('ses-off'); return; }  // окно сундука/рекламы — время бонуса не тратится
    fab.classList.remove('ses-off');
    st.left -= dt; draw();
    if (st.left <= 0) {
      sesTempoStop(); btn.classList.remove('ses-hot'); btn.classList.add('ses-cool'); btn.querySelector('.ses-ring')?.remove();
      lab.classList.add('off'); lab.textContent = L('Бонус за темп сгорел — в следующий раз быстрее', 'Tempo bonus expired — be quicker next time');
    }
  }, 200);
}
// Ловим нажатие на фазе захвата — до onclick кнопки (её обёртки startWeek: реклама, перерыв — не трогаем)
views.end.addEventListener('click', e => {
  const st = sesTempo; if (!st || e.target.closest?.('#next') !== st.btn) return;
  sesTempoStop(); st.btn.classList.remove('ses-hot'); st.btn.querySelector('.ses-ring')?.remove(); st.lab.remove();
  if (sesTempoLeft() <= 0) return;
  const t = store.get(SES_TEMPO_KEY, null), n = t?.day === today() ? t.n : 0;
  store.set(SES_TEMPO_KEY, { day: today(), n: n + 1 });
  addCash(1);
  toast(L(`⚡ Бонус за темп: +${money(1)}`, `⚡ Tempo bonus: +${money(1)}`));
  try { sfx.coins(); } catch {}
  track('tempo_bonus', { mode: 'career', detail: String(n + 1) });
}, true);

bus.on('weekEnd', x => {
  if (x?.mode !== 'career' || typeof C === 'undefined' || !C) return;
  if (x.won) sesWeekDone();
  setTimeout(sesTempoArm, 0);  // кнопка #next уже на экране (win/lose → поиск работы)
});

// ---------- мини-события посреди недели ----------
// eff — сдвиги шкал, cash — у.е.; def — исход, если время вышло
const sesR = (ru, en) => ({ ru, en });
const MINI_EVENTS = [
  { id: 'wrong_mail', ico: '📩', t: sesR('Босс случайно переслал вам письмо не тому адресату. В теме: «Премии Q4 — ЧЕРНОВИК».', 'The boss accidentally forwarded you an email meant for someone else. Subject: “Q4 bonuses — DRAFT”.'),
    o: [{ t: sesR('Удалить, не читая', 'Delete it unread'), eff: { boss: 5, psyche: -2 }, r: sesR('Честность — ваш тихий суперсил. Босс оценил.', 'Honesty is your quiet superpower. The boss noticed.') },
        { t: sesR('Одним глазком…', 'Just a peek…'), eff: { psyche: 4, boss: -4 }, r: sesR('Теперь вы знаете слишком много. И это приятно.', 'Now you know too much. It feels great.') },
        { t: sesR('Ответить «Спасибо, учту!»', 'Reply “Thanks, noted!”'), eff: { boss: -6, colleagues: 4 }, r: sesR('Босс бледнеет. Коллеги в восторге от вашей дерзости.', 'The boss went pale. Your coworkers love the audacity.') }],
    def: { eff: { psyche: -2 }, r: sesR('Письмо само отозвалось. Осадочек остался.', 'The email got recalled. The awkwardness stayed.') } },
  { id: 'cake', ico: '☕', t: sesR('В переговорке бесплатный торт. Осталось три куска и восемь голодных глаз. Успеете?', 'Free cake in the meeting room. Three slices left, eight hungry eyes. Will you make it?'),
    o: [{ t: sesR('Бежать!', 'Run!'), eff: { energy: 6, colleagues: -3 }, r: sesR('Кусок с розочкой — ваш. Кто-то запомнил.', 'The slice with the rose is yours. Someone will remember this.') },
        { t: sesR('Принести всем по кусочку', 'Bring slices for everyone'), eff: { colleagues: 6, energy: -3 }, r: sesR('Вам не досталось, зато вы легенда отдела.', 'None left for you, but you’re now a team legend.') },
        { t: sesR('Я на диете (нет)', 'I’m on a diet (not really)'), eff: { psyche: -3 }, r: sesR('Сила воли +100. Настроение −3.', 'Willpower +100. Mood −3.') }],
    def: { eff: { psyche: -2 }, r: sesR('Остались только крошки и тарелка с надписью «С ДР, Олег».', 'Only crumbs left, and a plate that says “Happy B-day, Oleg”.') } },
  { id: 'client', ico: '🔥', t: sesR('Срочно: клиент на линии! Говорит, что «всё сломалось», но не говорит, что именно.', 'Urgent: a client is on the line! Says “everything’s broken”, won’t say what.'),
    o: [{ t: sesR('Взять трубку', 'Pick up'), eff: { boss: 5, energy: -5 }, r: sesR('40 минут спустя: забыли пароль. Клиент спасён, вы — нет.', '40 minutes later: forgotten password. Client saved, you not so much.') },
        { t: sesR('Перевести на коллегу', 'Transfer to a coworker'), eff: { colleagues: -5, energy: 3 }, r: sesR('На обеде коллега теперь «не слышит» ваше имя.', 'Your coworker now pretends not to hear your name at lunch.') },
        { t: sesR('«Алло? Вас не слышно…»', '“Hello? You’re breaking up…”'), eff: { psyche: 3, boss: -4 }, r: sesR('Классика. Сработало. Почти.', 'A classic. It worked. Mostly.') }],
    def: { eff: { boss: -3 }, r: sesR('Клиент перезвонил боссу. Босс — вам. Взглядом.', 'The client called the boss. The boss called you. With a look.') } },
  { id: 'printer', ico: '🖨️', t: sesR('Принтер зажевал чужой договор и мигает красным. Рядом никого.', 'The printer jammed someone’s contract and is blinking red. Nobody around.'),
    o: [{ t: sesR('Починить героически', 'Heroically fix it'), eff: { colleagues: 5, energy: -4 }, r: sesR('Руки в тонере, зато вы — местный инженер.', 'Toner on your hands, but you’re now the office engineer.') },
        { t: sesR('Тихо уйти', 'Quietly walk away'), eff: { psyche: 2 }, r: sesR('Не видели, не знаете, не были.', 'Didn’t see, don’t know, wasn’t there.') }],
    def: { eff: { colleagues: -2 }, r: sesR('Вас заметили у принтера. Теперь это ваш принтер.', 'Someone saw you by the printer. It’s your printer now.') } },
  { id: 'fire_drill', ico: '🚨', t: sesR('Учебная пожарная тревога! Все выходят на улицу. На улице дождь.', 'Fire drill! Everyone outside. It’s raining outside.'),
    o: [{ t: sesR('Выйти первым и построить всех', 'Go first and organise everyone'), eff: { boss: 4, energy: -3 }, r: sesR('Теперь следующая тревога — под вашу ответственность.', 'You’ve been put in charge of the next drill.') },
        { t: sesR('Спрятаться в туалете', 'Hide in the restroom'), eff: { psyche: 4, boss: -3 }, r: sesR('Пятнадцать минут тишины. Бесценно.', 'Fifteen minutes of silence. Priceless.') }],
    def: { eff: { energy: -3 }, r: sesR('Из здания вы выбрались в числе последних — и промокли до нитки.', 'You were last out and got soaked.') } },
  { id: 'birthday', ico: '🎂', t: sesR('Скидываемся на день рождения коллеге, которого вы ни разу не видели.', 'Collecting money for the birthday of a coworker you’ve never seen.'),
    o: [{ t: sesR(`Скинуться 1 у.е.`, 'Chip in $1'), cash: -1, eff: { colleagues: 5 }, r: sesR('Ваше имя — в открытке. Мелким шрифтом.', 'Your name is on the card. In small print.') },
        { t: sesR('Подписать открытку без денег', 'Sign the card, no money'), eff: { colleagues: -2, psyche: 2 }, r: sesR('«С ДР! Тепла и добра!» — и ни копейки.', '“Happy B-day! All the best!” — and not a cent.') }],
    def: { eff: { colleagues: -3 }, r: sesR('Собрали без вас. Открытку тоже подписали без вас.', 'They collected without you. Signed the card without you, too.') } },
  { id: 'reply_all', ico: '📧', t: sesR('Кто-то жмёт «Ответить всем» на рассылку на 3000 человек. Началось.', 'Someone hit “Reply all” on a 3,000-person mailing list. It has begun.'),
    o: [{ t: sesR('Написать «Уберите меня из рассылки»', 'Reply “Remove me from this list”'), eff: { psyche: -3, colleagues: -2 }, r: sesR('Вы стали частью проблемы. 3000 человек это видели.', 'You became part of the problem. 3,000 people saw it.') },
        { t: sesR('Сделать попкорн и читать', 'Make popcorn and watch'), eff: { psyche: 5, energy: -2 }, r: sesR('Лучший сериал недели. Сезон 2 — после обеда.', 'Best show of the week. Season 2 after lunch.') }],
    def: { eff: { energy: -2 }, r: sesR('Почта легла. Работать нельзя. Подозрительно приятно.', 'The mail server died. No work possible. Suspiciously nice.') } },
  { id: 'elevator', ico: '🛗', t: sesR('Вы в лифте с гендиректором. Взгляд — прямо на вас. Двадцать этажей.', 'You’re in the elevator with the CEO. They’re looking at you. Twenty floors.'),
    o: [{ t: sesR('Питч на 30 секунд', '30-second pitch'), eff: { boss: 6, psyche: -4 }, r: sesR('Кивок. Вы не помните, что сказали.', 'They nodded. You don’t remember what you said.') },
        { t: sesR('Обсудить погоду', 'Talk about the weather'), eff: { psyche: 2 }, r: sesR('Дождь. Да. Дождь. Девятнадцатый этаж…', 'Rain. Yes. Rain. Floor nineteen…') },
        { t: sesR('Сделать вид, что звонят', 'Fake a phone call'), eff: { psyche: 3, boss: -2 }, r: sesR('«Да, мама, я на совещании». Убедительно.', '“Yes, Mom, I’m in a meeting.” Convincing.') }],
    def: { eff: { psyche: -3 }, r: sesR('Двадцать этажей неловкого молчания. Рекорд.', 'Twenty floors of awkward silence. A record.') } },
  { id: 'coffee_machine', ico: '☕', t: sesR('Кофемашина выдаёт последний стакан. В очереди пять человек, перед вами — двое.', 'The coffee machine has one cup left. Five people in line, you’re third.'),
    o: [{ t: sesR('Уступить', 'Let others go first'), eff: { colleagues: 5, energy: -4 }, r: sesR('Святой человек. Сонный, но святой.', 'A saint. A sleepy saint.') },
        { t: sesR('«У меня созвон через минуту!»', '“I have a call in one minute!”'), eff: { energy: 6, colleagues: -4 }, r: sesR('Кофе ваш. Созвона, конечно, не было.', 'Coffee secured. There was, of course, no call.') }],
    def: { eff: { energy: -3 }, r: sesR('Пока думали — кофе кончился. Остался чай «Принцесса».', 'While you hesitated, the coffee ran out. Only sad tea left.') } },
  { id: 'intern', ico: '🐣', t: sesR('Стажёр спрашивает, где тут «кнопка, чтобы всё работало».', 'The intern asks where the “make everything work” button is.'),
    o: [{ t: sesR('Терпеливо объяснить', 'Explain patiently'), eff: { colleagues: 5, energy: -4 }, r: sesR('Стажёр смотрит на вас как на гуру.', 'The intern looks at you like a guru.') },
        { t: sesR('«Это Ctrl+Alt+Delete»', '“It’s Ctrl+Alt+Delete”'), eff: { psyche: 4, boss: -3 }, r: sesR('Компьютер стажёра перезагрузился. Вместе с отчётом.', 'The intern’s PC rebooted. Along with the report.') }],
    def: { eff: { colleagues: -2 }, r: sesR('Стажёр всё-таки нашёл кнопку. Пожарной тревоги.', 'The intern found a button on their own. The fire alarm.') } },
  { id: 'teambuilding', ico: '🧗', t: sesR('HR зовёт на тимбилдинг: скалодром в субботу, 9:00 утра.', 'HR invites you to team building: climbing wall, Saturday, 9 AM.'),
    o: [{ t: sesR('Записаться с энтузиазмом', 'Sign up enthusiastically'), eff: { colleagues: 5, boss: 3, energy: -6 }, r: sesR('Вы уже чувствуете, как болят руки.', 'You can already feel your arms aching.') },
        { t: sesR('«У меня кот болеет»', '“My cat is sick”'), eff: { psyche: 4, colleagues: -3 }, r: sesR('Коту, кстати, ещё ни разу не было так плохо.', 'Fun fact: the cat has never been this sick.') }],
    def: { eff: { colleagues: -2 }, r: sesR('Вас записали автоматически. С пометкой «участие пассивное».', 'You were signed up automatically. Tagged “passive”.') } },
  { id: 'zoom_cam', ico: '📹', t: sesR('Вы на созвоне и вдруг понимаете: камера включена уже 10 минут. Вы ели суп.', 'You’re on a call and realise: the camera’s been on for 10 minutes. You were eating soup.'),
    o: [{ t: sesR('Невозмутимо доесть', 'Calmly finish the soup'), eff: { psyche: 4, boss: -3 }, r: sesR('Уверенность — 100. Суп — тоже.', 'Confidence: 100. Soup: also 100.') },
        { t: sesR('«Тут связь пропала»', '“My connection dropped”'), eff: { psyche: -2, boss: 2 }, r: sesR('Изображение замерло на лучшем моменте. С ложкой.', 'The frame froze at the best moment. Mid-spoonful.') }],
    def: { eff: { psyche: -3 }, r: sesR('Скриншот уже в чате отдела. С подписью.', 'A screenshot is already in the team chat. With a caption.') } },
  { id: 'plant', ico: '🪴', t: sesR('Офисный фикус выглядит так, будто тоже хочет дожить до пятницы.', 'The office ficus looks like it also wants to survive till Friday.'),
    o: [{ t: sesR('Полить и поговорить с ним', 'Water it and have a chat'), eff: { psyche: 5 }, r: sesR('Фикус молчит, но вы чувствуете поддержку.', 'The ficus says nothing, but you feel supported.') },
        { t: sesR('Это не мой фикус', 'Not my ficus'), eff: { energy: 2, colleagues: -1 }, r: sesR('Фикус запомнит.', 'The ficus will remember.') }],
    def: { eff: { psyche: -1 }, r: sesR('Фикус потерял ещё один лист. Вы — немного веры в людей.', 'The ficus lost another leaf. You lost a bit of faith.') } },
  { id: 'lost_badge', ico: '🪪', t: sesR('Вы нашли чужой пропуск. На фото человек явно не выспался с 2019 года.', 'You found someone’s badge. The photo says they haven’t slept since 2019.'),
    o: [{ t: sesR('Отнести на ресепшен', 'Take it to reception'), eff: { colleagues: 4, energy: -2 }, r: sesR('Владелец пропуска угощает вас печенькой.', 'The owner turned up and gave you a cookie.') },
        { t: sesR('Написать в общий чат', 'Post it in the group chat'), eff: { colleagues: 2, psyche: 2 }, r: sesR('Двадцать реакций «😂» на фото. Владелец пропуска не в восторге.', 'Twenty 😂 reactions to the photo. The owner isn’t amused.') }],
    def: { eff: { colleagues: -1 }, r: sesR('Пропуск забрали на ресепшен. Детектив завершён.', 'The cleaner took it. Case closed.') } },
  { id: 'kpi_survey', ico: '📊', t: sesR('Опрос вовлечённости «анонимный». В ссылке — ваш табельный номер.', '“Anonymous” engagement survey. The link contains your employee ID.'),
    o: [{ t: sesR('Всё отлично, 10/10', 'Everything’s great, 10/10'), eff: { boss: 4, psyche: -3 }, r: sesR('Галочка поставлена. Совесть — нет.', 'Box ticked. Conscience not so much.') },
        { t: sesR('Честно про кофемашину', 'Be honest about the coffee machine'), eff: { colleagues: 4, boss: -2 }, r: sesR('Через месяц поставили новую. Совпадение?', 'A new one arrived a month later. Coincidence?') }],
    def: { eff: { boss: -2 }, r: sesR('Вы попали в список «не прошли опрос». Анонимно.', 'You’re on the “didn’t complete the survey” list. Anonymously.') } },
  { id: 'microwave', ico: '🐟', t: sesR('Кто-то греет рыбу в общей микроволновке. Офис в панике.', 'Someone is microwaving fish in the shared kitchen. The office is in chaos.'),
    o: [{ t: sesR('Открыть все окна', 'Open every window'), eff: { colleagues: 5, energy: -2 }, r: sesR('Ноябрь. Сквозняк. Но вы — герой.', 'November. A draft. But you’re a hero.') },
        { t: sesR('Уйти работать в кафе', 'Go work from a café'), eff: { psyche: 4, boss: -2 }, r: sesR('Латте и тишина. Отчёт подождёт.', 'A latte and silence. The report can wait.') }],
    def: { eff: { psyche: -3 }, r: sesR('Запах теперь в вашем свитере. Навсегда.', 'The smell is in your sweater now. Forever.') } },
  { id: 'meeting_overrun', ico: '⏰', t: sesR('Совещание «на 15 минут» идёт уже второй час. Кто-то предлагает «ещё один кружок».', 'The “15-minute” meeting is entering hour two. Someone suggests “one more round”.'),
    o: [{ t: sesR('«Предлагаю продолжить письменно»', '“Let’s take this offline”'), eff: { colleagues: 5, boss: -2 }, r: sesR('Шёпот благодарности по всему залу.', 'Grateful whispers all around the room.') },
        { t: sesR('Терпеть до конца', 'Endure to the end'), eff: { boss: 3, energy: -5 }, r: sesR('Вы выжили. Решения не приняли.', 'You survived. No decisions were made.') }],
    def: { eff: { energy: -3 }, r: sesR('Совещание назначило следующее совещание.', 'The meeting scheduled another meeting.') } },
  { id: 'courier', ico: '📦', t: sesR('Курьер принёс посылку «для отдела». Внутри — 200 одинаковых ручек.', 'A courier delivered a package “for the team”. Inside: 200 identical pens.'),
    o: [{ t: sesR('Раздать всем', 'Hand them out'), eff: { colleagues: 4, energy: -2 }, r: sesR('Ручки разошлись за минуту. Колпачки — за две.', 'Pens gone in a minute. Caps gone in two.') },
        { t: sesR('Продать на маркетплейсе', 'Sell them online'), cash: 2, eff: { boss: -4 }, r: sesR('+2 у.е. Бухгалтерия уже что-то подозревает.', 'Bookkeeping is starting to suspect something.') }],
    def: { eff: { psyche: -1 }, r: sesR('Коробку унесли в склад «до лучших времён».', 'The box went to storage “for better times”.') } },
  { id: 'wifi', ico: '📶', t: sesR('Wi-Fi упал. Единственная сеть рядом — «Кафе_Пончик_FREE».', 'The Wi-Fi is down. The only network nearby: “Donut_Cafe_FREE”.'),
    o: [{ t: sesR('Пойти в «Пончик»', 'Head to the donut café'), cash: -1, eff: { energy: 5, psyche: 3 }, r: sesR('Пончик за 1 у.е. Интернет — бесплатно.', 'A donut cost you. The internet was free.') },
        { t: sesR('Раздать интернет с телефона', 'Use your phone hotspot'), eff: { colleagues: 5, energy: -3 }, r: sesR('Полотдела на вашем хотспоте. Тариф плачет.', 'Half the team on your hotspot. Your data plan weeps.') }],
    def: { eff: { energy: -2 }, r: sesR('Сеть вернулась сама. Вы так и не узнали, почему.', 'It came back on its own. Nobody knows why.') } },
  { id: 'compliment', ico: '💐', t: sesR('Босс похвалил вашу презентацию при всех. А рядом стоит соавтор этой презентации.', 'The boss praised your presentation in front of everyone. The coworker who made it with you is standing right there.'),
    o: [{ t: sesR('«Это наша общая работа!»', '“It was a team effort!”'), eff: { colleagues: 6, boss: 2 }, r: sesR('Слёзы умиления у коллеги. И у босса.', 'Your coworker is touched. So is the boss.') },
        { t: sesR('Скромно принять', 'Accept modestly'), eff: { boss: 4, colleagues: -5 }, r: sesR('Коллега молча что-то записывает в блокнот.', 'Your coworker silently wrote something down.') }],
    def: { eff: { colleagues: -2 }, r: sesR('Неловкая пауза затянулась. Все разошлись.', 'The awkward pause dragged on. Everyone left.') } },
  { id: 'chair', ico: '🪑', t: sesR('Освободилось эргономичное кресло уволившегося коллеги. Его видят трое.', 'An ergonomic chair just freed up. Three people have spotted it.'),
    o: [{ t: sesR('Рывок!', 'Dash for it!'), eff: { energy: 4, psyche: 3, colleagues: -3 }, r: sesR('Спина говорит спасибо. Остальные — нет.', 'Your back says thanks. Everyone else doesn’t.') },
        { t: sesR('Устроить жеребьёвку', 'Hold a lottery'), eff: { colleagues: 5 }, r: sesR('Не выиграли, но процедура была безупречна.', 'You didn’t win, but the process was flawless.') }],
    def: { eff: { psyche: -2 }, r: sesR('Кресло уехало в бухгалтерию. Навсегда.', 'The chair rolled off to Accounting. Forever.') } },
  { id: 'deadline_move', ico: '📆', t: sesR('Босс: «Дедлайн переносится!» Вы радуетесь секунду. «…на вчера».', 'Boss: “The deadline is moving!” You celebrate for a second. “…to yesterday.”'),
    o: [{ t: sesR('Взять кофе и сделать', 'Grab coffee and do it'), eff: { boss: 6, energy: -6 }, r: sesR('Сделано. Глаз дёргается только слегка.', 'Done. Your eye twitches only slightly.') },
        { t: sesR('Позвать коллег на помощь', 'Ask the team for help'), eff: { colleagues: -3, boss: 3, energy: -2 }, r: sesR('Вместе успели. Теперь вы им должны.', 'Done together. Now you owe them one.') }],
    def: { eff: { boss: -3 }, r: sesR('Дедлайн прошёл мимо. Помахал рукой.', 'The deadline walked right past. It waved.') } },
  { id: 'it_update', ico: '💻', t: sesR('Компьютер: «Обновление. Не выключайте. Осталось 2 часа».', 'Your PC: “Updating. Don’t turn off. 2 hours left.”'),
    o: [{ t: sesR('Пойти пообщаться с коллегами', 'Go chat with coworkers'), eff: { colleagues: 5, boss: -2 }, r: sesR('Узнали все сплетни за месяц.', 'You caught up on a month of gossip.') },
        { t: sesR('Работать с телефона', 'Work from your phone'), eff: { boss: 3, energy: -4 }, r: sesR('Таблица на 5-дюймовом экране. Вы — воин.', 'A spreadsheet on a tiny screen. You’re a warrior.') }],
    def: { eff: { energy: 2, boss: -2 }, r: sesR('Вы просто смотрели на полоску загрузки. Медитативно.', 'You just watched the progress bar. Very zen.') } },
  { id: 'gossip', ico: '🤫', t: sesR('В курилке говорят, что скоро «оптимизация». Все смотрят на вас.', 'Rumour by the coffee point: “restructuring” is coming. Everyone looks at you.'),
    o: [{ t: sesR('«Я ничего не знаю»', '“I know nothing”'), eff: { psyche: -2, colleagues: 2 }, r: sesR('Это прозвучало слишком уверенно.', 'That came out way too confidently.') },
        { t: sesR('Пустить встречный слух про бесплатную пиццу', 'Start a counter-rumour about free pizza'), eff: { colleagues: 5, boss: -3 }, r: sesR('Паника сменилась надеждой. Пиццы не будет.', 'Panic turned to hope. There will be no pizza.') }],
    def: { eff: { psyche: -3 }, r: sesR('Слух дорос до «закрывают весь этаж».', 'The rumour grew into “they’re closing the whole floor”.') } },
  { id: 'free_lunch', ico: '🍕', t: sesR('Поставщик привёз пиццу «на презентацию». Презентация — через час. Пицца — сейчас.', 'A vendor brought pizza “for the presentation”. The presentation is in an hour. The pizza is now.'),
    o: [{ t: sesR('Взять кусочек «на пробу»', 'Take a slice “to taste”'), eff: { energy: 6, boss: -2 }, r: sesR('Проба прошла успешно. Трижды.', 'The tasting went well. Three times.') },
        { t: sesR('Охранять пиццу', 'Guard the pizza'), eff: { boss: 4, energy: -2 }, r: sesR('Вы — страж пиццы. Пахнет искушением.', 'You are the Pizza Guardian. It smells like temptation.') }],
    def: { eff: { energy: -2 }, r: sesR('Пиццу съели до презентации. Без вас.', 'The pizza was gone before the presentation. Without you.') } },
  { id: 'parking', ico: '🚗', t: sesR('Кто-то перегородил выезд вашей машине. Записка: «Я на 5 минут». Записка от вчера.', 'Someone blocked your car in. Note: “Back in 5 min.” The note is from yesterday.'),
    o: [{ t: sesR('Позвонить по номеру', 'Call the number'), eff: { psyche: 3, energy: -2 }, r: sesR('Это был… номер вашего босса. Извинения почти прозвучали.', 'It was… your boss. They apologised. Sort of.') },
        { t: sesR('Уехать на такси', 'Take a taxi'), cash: -1, eff: { energy: 4 }, r: sesR('Мимо проезжает тот самый «на 5 минут».', 'The “5 minutes” person drove past you.') }],
    def: { eff: { psyche: -3 }, r: sesR('Вы опоздали на планёрку. Объяснение не приняли.', 'You were late for stand-up. Excuse rejected.') } },
  { id: 'secret_santa', ico: '🎅', t: sesR('Тайный Санта: вам выпал человек, про которого вы знаете только имя. И то не уверены.', 'Secret Santa: you drew someone you only know by name. And you’re not sure of that.'),
    o: [{ t: sesR('Купить носки с котиками', 'Buy socks with cats'), cash: -1, eff: { colleagues: 5 }, r: sesR('Попадание! Оказывается, дома у адресата три кота.', 'Bullseye! Turns out they have three cats.') },
        { t: sesR('Подарить блокнот из запасов', 'Regift a notebook from the stash'), eff: { colleagues: -2, psyche: 2 }, r: sesR('На блокноте логотип конференции 2017 года.', 'It has a logo from a 2017 conference on it.') }],
    def: { eff: { colleagues: -2 }, r: sesR('Ваш подарок — открытка «С 8 Марта». Ноябрь.', 'Your gift: a card saying “Happy Spring!”. It’s November.') } },
  { id: 'excel_crash', ico: '💥', t: sesR('Таблица, над которой вы работали 3 часа, «не отвечает». Последнее сохранение — утром.', 'The spreadsheet you’ve worked on for 3 hours is “not responding”. Last save: this morning.'),
    o: [{ t: sesR('Ждать и молиться', 'Wait and pray'), eff: { psyche: -3, energy: 2 }, r: sesR('Ожила! Чудеса случаются.', 'It came back! Miracles happen.') },
        { t: sesR('Позвать айтишника', 'Call IT'), eff: { colleagues: 4, energy: -2 }, r: sesR('Одна кнопка от айтишника — и всё спасено. Вы теперь друзья.', 'IT pressed one key and saved everything. You’re friends now.') }],
    def: { eff: { psyche: -4 }, r: sesR('Компьютер закрыл всё сам. Без вопросов.', 'The PC closed everything on its own. No questions asked.') } },
  { id: 'pet_day', ico: '🐕', t: sesR('Сегодня в офисе собака коллеги. Собака выбрала ваш стол.', 'A coworker brought a dog to work. The dog chose your desk.'),
    o: [{ t: sesR('Гладить, пока можно', 'Pet it while you can'), eff: { psyche: 7, boss: -3 }, r: sesR('Лучшие 10 минут недели. Без вариантов.', 'Best 10 minutes of the week. No contest.') },
        { t: sesR('Вежливо продолжить работу', 'Politely keep working'), eff: { boss: 3, psyche: -2 }, r: sesR('Собака обиделась и ушла в бухгалтерию.', 'The dog got offended and went to Accounting.') }],
    def: { eff: { psyche: 3 }, r: sesR('Собака уснула у вас на ногах. Вы не двигаетесь уже полчаса.', 'The dog fell asleep on your feet. You haven’t moved in half an hour.') } },
  { id: 'friday_drinks', ico: '🥤', t: sesR('В чате: «Кто вечером в бар?» Сегодня, кстати, не пятница.', 'In the chat: “Who’s up for drinks tonight?” It is, notably, not Friday.'),
    o: [{ t: sesR('Я в деле!', 'I’m in!'), eff: { colleagues: 6, energy: -5 }, r: sesR('Завтра будет тяжело. Но сегодня — весело.', 'Tomorrow will hurt. Tonight will be fun.') },
        { t: sesR('Только чай и домой', 'Tea and home'), eff: { energy: 4, colleagues: -2 }, r: sesR('Режим соблюдён. Мемы из бара вы увидите утром.', 'Routine kept. You’ll see the memes in the morning.') }],
    def: { eff: { colleagues: -1 }, r: sesR('Пока вы думали, все уже ушли.', 'By the time you decided, everyone had left.') } },
  { id: 'mentor', ico: '🧓', t: sesR('Старейший сотрудник офиса предлагает «пару советов». Это займёт час.', 'The office veteran offers “a couple of tips”. It’ll take an hour.'),
    o: [{ t: sesR('Слушать и записывать', 'Listen and take notes'), eff: { boss: 3, psyche: 3, energy: -4 }, r: sesR('Один совет был гениальным. Остальные — про 1998 год.', 'One tip was genius. The rest were about 1998.') },
        { t: sesR('«Давайте за обедом»', '“Let’s do it over lunch”'), eff: { energy: 2, colleagues: 2 }, r: sesR('Обед затянулся, но был вкусным.', 'Lunch ran long, but it was tasty.') }],
    def: { eff: { colleagues: -1 }, r: sesR('Теперь советы достаются стажёру. Стажёр в ужасе.', 'The veteran went to advise the intern. The intern is terrified.') } },
  { id: 'lottery', ico: '🎟️', t: sesR('Корпоративная лотерея: билет — 1 у.е., главный приз — выходной!', 'Office raffle: a ticket costs $1, the grand prize is a day off!'),
    o: [{ t: sesR('Купить билет', 'Buy a ticket'), cash: -1, lucky: true, eff: { psyche: 2 }, r: sesR('Не выиграли, но было волнительно.', 'No win, but it was thrilling.') },
        { t: sesR('Не азартный человек', 'Not a gambler'), eff: { psyche: 1 }, r: sesR('Мудро. Скучно, но мудро.', 'Wise. Boring, but wise.') }],
    def: { eff: {}, r: sesR('Розыгрыш прошёл без вас. Выиграла бухгалтерия. Опять.', 'The draw went ahead without you. Accounting won. Again.') } },
  { id: 'air_con', ico: '🥶', t: sesR('Война за кондиционер: половина офиса мёрзнет, половина плавится.', 'The A/C war: half the office is freezing, half is melting.'),
    o: [{ t: sesR('Поставить +22 и спрятать пульт', 'Set it to 22 and hide the remote'), eff: { colleagues: 3, psyche: 3, boss: -2 }, r: sesR('Мир восстановлен. Пульт — в вашем ящике.', 'Peace restored. The remote lives in your drawer now.') },
        { t: sesR('Достать плед и не вмешиваться', 'Grab a blanket and stay out of it'), eff: { energy: 3 }, r: sesR('Уютно. Нейтралитет — ваше всё.', 'Cosy. Neutrality suits you.') }],
    def: { eff: { energy: -2 }, r: sesR('Кондиционер сломался. Теперь все одинаково страдают.', 'The A/C broke. Now everyone suffers equally.') } },
  { id: 'voice_msg', ico: '🎙️', t: sesR('Босс прислал голосовое на 7 минут. Слышно, что из машины.', 'The boss sent a 7-minute voice message. Recorded while driving.'),
    o: [{ t: sesR('Прослушать на 2×', 'Listen at 2×'), eff: { boss: 4, energy: -3 }, r: sesR('Суть: «Перезвони». Шесть минут из семи — пробки.', 'Gist: “Call me.” Six of seven minutes: traffic.') },
        { t: sesR('Ответить «Принято 👍»', 'Reply “Got it 👍”'), eff: { psyche: 3, boss: -3 }, r: sesR('Что принято — непонятно никому.', 'Nobody knows what was “got”.') }],
    def: { eff: { boss: -2 }, r: sesR('Пришло второе голосовое. На 9 минут.', 'A second voice message arrived. 9 minutes.') } },
];
const sesTx = o => L(o.ru, o.en);

// Шаг мини-события выбирается в начале недели (S.miniAt): 6–19, не первый шаг дня (там заставка и дедлайны)
function sesMiniPlan(st) {
  if (st?.mode !== 'career' || typeof C === 'undefined' || !C) return;
  if (C.week <= 2 && (C.level || 1) === 1 && !C.levelsDone) { st.miniAt = -1; return; }  // новая карьера — сначала освоиться
  const steps = []; for (let i = 6; i <= 19; i++) if (i % PER_DAY) steps.push(i);
  st.miniAt = rnd(steps); st.miniDone = false;
}
bus.on('deck', sesMiniPlan);
bus.on('deck', () => setTimeout(sesStrip, 0));
// Ответили на карточку перед нужным шагом — ждём, пока появится следующая, и показываем окно
bus.on('answer', () => {
  if (!sesCareer() || !(S.miniAt > 0) || S.miniDone || S.step + 1 !== S.miniAt) return;
  const at = S.miniAt; let tries = 0;
  const wait = () => {
    if (!S || S.miniDone || S.step > at || views.game.hidden) return;
    if (S.step === at && !busy && !splashOn && $('modal').hidden && !window.vdpPaused && !document.hidden) return sesMiniShow();
    if (++tries < 120) setTimeout(wait, 400);
  };
  setTimeout(wait, 700);
});
let sesMiniT = 0;
function sesMiniApply(o, how) {
  const eff = o.eff || {}, parts = [];
  for (const [k, v] of Object.entries(eff)) { S.res[k] = Math.max(3, Math.min(97, clamp(S.res[k] + v))); parts.push(`${resName(k)} ${v > 0 ? '+' : '−'}${Math.abs(v)}`); }
  let cash = o.cash || 0, jackpot = false;
  if (o.lucky && Math.random() < .25) { cash += 4; jackpot = true; }
  if (cash && C) { addCash(cash); parts.push(`${cash > 0 ? '+' : '−'}${money(Math.abs(cash))}`); }
  renderBars(); if (S.mode === 'career' && C) store.set(KEY.save, S);
  try { FX.stats?.(eff); } catch {}
  return { parts, jackpot };
}
function sesMiniShow(forceId) {
  if (!S) return false;
  const seen = store.get('vdp-ses-mini', []);
  let ev = forceId && MINI_EVENTS.find(e => e.id === forceId);
  if (!ev) { const fresh = MINI_EVENTS.filter(e => !seen.includes(e.id)); ev = rnd(fresh.length ? fresh : MINI_EVENTS); }
  store.set('vdp-ses-mini', (fresh => fresh.length >= MINI_EVENTS.length ? [ev.id] : fresh)([...seen.filter(x => x !== ev.id), ev.id]));
  S.miniDone = true; if (S.mode === 'career' && C) store.set(KEY.save, S);
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass ses-mini" role="dialog" aria-modal="true" aria-labelledby="sesMiniT">
    <div class="ses-mini-head"><span class="ses-mini-ico" aria-hidden="true">${ev.ico}</span><span class="ses-mini-kick">${L('Пока вы работали…', 'Meanwhile…')}</span>
      <span class="ses-mini-time" id="sesMiniTime" role="timer" aria-label="${L('Осталось секунд', 'Seconds left')}">${SES_MINI_TIME}</span></div>
    <i class="ses-mini-bar" aria-hidden="true"><i id="sesMiniBar"></i></i>
    <h2 id="sesMiniT" class="ses-mini-text">${esc(sesTx(ev.t))}</h2>
    <div class="ses-mini-opts" id="sesMiniOpts">${ev.o.map((o, i) => `<button class="btn-ghost ses-mini-opt" type="button" data-i="${i}">${esc(sesTx(o.t))}</button>`).join('')}</div>
    <div class="ses-mini-res" id="sesMiniRes" aria-live="polite" hidden></div></div>`;
  m.hidden = false; m.onclick = null;
  try { sfx.sms?.(); } catch {}
  let left = SES_MINI_TIME, last = performance.now(), done = false;
  const finish = (o, how) => {
    if (done) return; done = true; clearInterval(sesMiniT);
    const { parts, jackpot } = sesMiniApply(o, how);
    track('mini_event', { mode: S.mode, step: S.step, detail: `${ev.id}:${how}` });
    $('sesMiniOpts').hidden = true; $('sesMiniTime').hidden = true; m.querySelector('.ses-mini-bar').hidden = true;
    const r = $('sesMiniRes'); r.hidden = false;
    r.innerHTML = `<p>${how === 'timeout' ? `⏱ ${L('Время вышло.', 'Time’s up.')} ` : ''}${esc(sesTx(o.r))}${jackpot ? ` <b>${L(`🎉 Джекпот: +${money(4)}!`, `🎉 Jackpot: +${money(4)}!`)}</b>` : ''}</p>
      ${parts.length ? `<div class="ses-mini-eff">${parts.map(p => `<span class="${/[−]/.test(p) ? 'dn' : 'up'}">${p}</span>`).join('')}</div>` : ''}
      <button class="btn-main" type="button" id="sesMiniOk">${L('Вернуться к работе', 'Back to work')}</button>`;
    $('sesMiniOk').onclick = () => { m.hidden = true; if (typeof fitGame === 'function') fitGame(); };
    $('sesMiniOk').focus({ preventScroll: true });
  };
  m.querySelectorAll('.ses-mini-opt').forEach(b => b.onclick = () => finish(ev.o[+b.dataset.i], String(b.dataset.i)));
  m.querySelector('.ses-mini-opt').focus({ preventScroll: true });
  clearInterval(sesMiniT);
  sesMiniT = setInterval(() => {
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (done || m.hidden) { clearInterval(sesMiniT); return; }
    if (document.hidden || window.vdpPaused) return;
    left -= dt;
    const s = Math.max(0, Math.ceil(left)), t = $('sesMiniTime');
    if (t) { t.textContent = s; t.classList.toggle('warn', s <= 5); }
    const bar = $('sesMiniBar'); if (bar) bar.style.width = `${Math.max(0, left / SES_MINI_TIME * 100)}%`;
    if (left <= 0) finish(ev.def, 'timeout');
  }, 200);
  return true;
}
// Отладка/тесты: window.sesMiniEvent('cake') — показать событие сейчас
window.sesMiniEvent = id => sesMiniShow(id);
window.SES_MINI_EVENTS = MINI_EVENTS;
