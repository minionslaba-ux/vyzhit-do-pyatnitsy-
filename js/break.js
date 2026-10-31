// «☕ Разминка»: 50 мини-игр в перерыве между рабочими неделями — логика, пазлы, аркады, слова, память, расслабление.
// Витрина и рекорды — здесь; сами игры — js/break/b1.js … b5.js (по 10), грузятся только при первом открытии.
// Награда — до 3 раз в день: +1 у.е. в карьеру и «бодрость» на следующую неделю (+5 к Энергии и Кукухе, копится до +15).
// Контракт игры: BREAK_IMPL[id] = (root, api) => { … }; api.end({ score, won, text }) — конец партии; api.onExit(fn) — уборка.
const BREAK_CATS = [
  ['logic', '♟️', L('Логика и настольные', 'Logic & board')], ['puzzle', '🧩', L('Пазлы и картинки', 'Puzzles')], ['arcade', '🕹️', L('Аркады и реакция', 'Arcade')],
  ['words', '🔤', L('Слова и знания', 'Words & trivia')], ['memory', '🧠', L('Память и внимание', 'Memory & focus')], ['relax', '🌿', L('Расслабление', 'Relax')],
];
// [номер, категория, значок, название, описание]
const BREAKS = [
  [1, 'logic', '⛀', L('Шашки против Босса', 'Checkers vs the Boss'), L('Русские шашки с ИИ: стажёр, мидл, директор', 'Checkers with an AI: intern, mid, director')],
  [2, 'logic', '🔺', L('Уголки с коллегой', 'Corners'), L('Переставьте фишки в противоположный угол быстрее соперника', 'Move your pieces to the opposite corner first')],
  [3, 'logic', '❌', L('5 в ряд с Бухгалтером', 'Five in a row'), L('Крестики-нолики на большом поле до пяти в ряд', 'Tic-tac-toe on a big board, five in a row')],
  [4, 'logic', '📎', L('Офисное судоку', 'Office sudoku'), L('Судоку 4×4 и 6×6 с офисными значками', '4×4 and 6×6 sudoku with office icons')],
  [5, 'logic', '🗂️', L('Пятнашки «Разобрать стол»', 'Sliding desk'), L('Расставьте документы по порядку', 'Put the documents in order')],
  [6, 'logic', '🍪', L('Последняя печенька', 'The last cookie'), L('Берите печенье по очереди — последнее забирает проигравший', 'Take turns — whoever takes the last cookie loses')],
  [7, 'logic', '🪑', L('Захват переговорки', 'Meeting room takeover'), L('Перекрашивайте стулья в свой цвет, окружая чужие', 'Flip chairs to your colour by flanking them')],
  [8, 'logic', '✍️', L('Согласование', 'Approval chain'), L('Проведите документ через цепочку подписей', 'Route the document through the signatures')],
  [9, 'logic', '🚰', L('Путь к кулеру', 'Path to the cooler'), L('Лабиринт — новый каждый день', 'A new maze every day')],
  [10, 'logic', '📚', L('Стопки отчётов', 'Report stacks'), L('Переложите стопку: большая папка не ложится на маленькую', 'Move the stack: never a big folder on a small one')],
  [11, 'puzzle', '🧩', L('Пазл «Корпоратив»', 'Office party puzzle'), L('Соберите офисную сцену из 9, 16 или 25 кусочков', 'Assemble an office scene from 9, 16 or 25 pieces')],
  [12, 'puzzle', '🧍', L('Пазл с вашим персонажем', 'Your character puzzle'), L('Портрет вашего персонажа рассыпался на кусочки', 'Your character’s portrait is in pieces')],
  [13, 'puzzle', '🔍', L('Найди 10 отличий', 'Spot the difference'), L('Два снимка одного кабинета — найдите отличия', 'Two pictures of an office — find the differences')],
  [14, 'puzzle', '📎', L('Где степлер?', 'Where’s the stapler?'), L('Найдите предмет в захламлённом опенспейсе', 'Find the item in a cluttered open space')],
  [15, 'puzzle', '🔌', L('Собери кабель', 'Wire it up'), L('Поверните плитки, чтобы ток дошёл до принтера', 'Rotate tiles so power reaches the printer')],
  [16, 'puzzle', '🚿', L('Трубы кулера', 'Cooler pipes'), L('Соедините трубы от бутыли к стаканам', 'Connect the pipes from the bottle to the cups')],
  [17, 'puzzle', '🔷', L('Танграм «Логотип»', 'Logo tangram'), L('Сложите силуэт из семи фигур', 'Make the silhouette from seven pieces')],
  [18, 'puzzle', '🎨', L('Раскраска по номерам', 'Paint by numbers'), L('Раскрасьте пиксельный портрет начальника', 'Colour the pixel portrait of the boss')],
  [19, 'puzzle', '🟨', L('Сложи стикеры', 'Sticky notes fit'), L('Заполните доску стикерами разной формы без зазоров', 'Fill the board with sticky notes, no gaps')],
  [20, 'puzzle', '▦', L('Разбей таблицу', 'Split the table'), L('Разделите поле на прямоугольники по числам', 'Split the grid into rectangles by the numbers')],
  [21, 'arcade', '📦', L('Склад: уложи коробки', 'Warehouse packing'), L('Коробки с конвейера — в кузов; полный ряд — фура уезжает', 'Pack boxes into the truck; a full row ships')],
  [22, 'arcade', '☕', L('Поймай кофе', 'Catch the coffee'), L('Ловите падающие чашки подносом', 'Catch falling cups with a tray')],
  [23, 'arcade', '🏃', L('Увернись от дедлайнов', 'Dodge the deadlines'), L('Бегите по коридору, перепрыгивая папки', 'Run the corridor, jump over folders')],
  [24, 'arcade', '📧', L('Отбей спам', 'Spam swatter'), L('Тапайте только по спаму', 'Tap only the spam')],
  [25, 'arcade', '🪰', L('Муха на совещании', 'Meeting fly'), L('Прихлопните муху, не задев коллег', 'Swat the fly, not your coworkers')],
  [26, 'arcade', '💺', L('Прыжки по креслам', 'Chair jump'), L('Бесконечный подъём по офисным креслам', 'An endless climb up office chairs')],
  [27, 'arcade', '✈️', L('Бумажный самолётик', 'Paper plane'), L('Пролетите между лампами опенспейса', 'Fly between the open-space lamps')],
  [28, 'arcade', '🗑️', L('Баскетбол в мусорку', 'Bin basketball'), L('Закиньте бумажку с поправкой на кондиционер', 'Throw paper balls, mind the air conditioner')],
  [29, 'arcade', '🎳', L('Офисный боулинг', 'Office bowling'), L('Бутылкой — по кеглям из стаканчиков', 'Knock down cup pins with a bottle')],
  [30, 'arcade', '⏱️', L('Ровно в 18:00', 'Exactly 6 PM'), L('Остановите полоску ровно на 18:00', 'Stop the bar exactly at 6 PM')],
  [31, 'words', '⌨️', L('Офисные слова', 'Office words'), L('Составьте слова из данных букв', 'Make words from the given letters')],
  [32, 'words', '🟩', L('Слово дня', 'Word of the day'), L('Угадайте слово за 6 попыток — одно для всех', 'Guess the word in 6 tries — same for everyone')],
  [33, 'words', '✏️', L('Кроссворд «Жаргон»', 'Jargon crossword'), L('Мини-кроссворд из офисного сленга', 'A mini crossword of office slang')],
  [34, 'words', '🔀', L('Анаграммы профессий', 'Job anagrams'), L('ЕЛЕТКРИ → электрик', 'Unscramble the profession')],
  [35, 'words', '📝', L('Письмо босса', 'Boss’s email'), L('Восстановите фразу по пропущенным буквам', 'Restore the phrase from missing letters')],
  [36, 'words', '🔠', L('Найди слова', 'Word search'), L('Офисные слова в сетке букв', 'Office words hidden in a letter grid')],
  [37, 'words', '💬', L('Собери пословицу', 'Proverb builder'), L('Соберите офисную пословицу из перемешанных слов', 'Rebuild an office proverb')],
  [38, 'words', '❓', L('Блиц-викторина', 'Blitz quiz'), L('10 вопросов за 60 секунд', '10 questions in 60 seconds')],
  [39, 'memory', '🪪', L('Мемори «Визитки»', 'Business card memory'), L('Найдите пары одинаковых визиток', 'Find matching business cards')],
  [40, 'memory', '🔁', L('Повтори за боссом', 'Simon says Boss'), L('Повторите растущую последовательность', 'Repeat the growing sequence')],
  [41, 'memory', '🖥️', L('Запомни стол', 'Remember the desk'), L('Что исчезло со стола?', 'What vanished from the desk?')],
  [42, 'memory', '📮', L('Сортировка почты', 'Mail sorting'), L('Раскладывайте письма по папкам на время', 'Sort the mail into folders against the clock')],
  [43, 'memory', '🎨', L('Цветная путаница', 'Colour clash'), L('Нажмите цвет надписи, а не слово', 'Tap the ink colour, not the word')],
  [44, 'memory', '🧮', L('Бухгалтерия в уме', 'Mental accounting'), L('Примеры на время, сложность растёт', 'Quick sums, growing harder')],
  [45, 'memory', '🙃', L('Кто лишний', 'Odd one out'), L('Из четырёх предметов найдите неподходящий', 'Find the one that doesn’t belong')],
  [46, 'relax', '🫁', L('Дыхание перед планёркой', 'Breathing break'), L('Минута спокойного дыхания', 'A minute of calm breathing')],
  [47, 'relax', '🪴', L('Цветок на подоконнике', 'Window plant'), L('Поливайте — растёт с каждым днём', 'Water it — it grows every day')],
  [48, 'relax', '🐈', L('Погладь кота', 'Pet the cat'), L('Ваш питомец мурчит и радуется', 'Your pet purrs with joy')],
  [49, 'relax', '🫧', L('Пупырка', 'Bubble wrap'), L('Лопайте пузырики — просто так', 'Pop the bubbles — just because')],
  [50, 'relax', '🏯', L('Дзен-сад', 'Zen garden'), L('Рисуйте граблями узоры на песке', 'Rake patterns in the sand')],
];
window.BREAK_IMPL = window.BREAK_IMPL || {};
const BREAK_FILE = n => `js/break/b${Math.ceil(n / 10)}.js`;
const BREAK_DAY_REWARDS = 3, BREAK_BUFF = 5, BREAK_BUFF_MAX = 15;
const brkBest = () => store.get('vdp-break-best', {});
const brkToday = () => { const t = store.get('vdp-break-day', {}); return t.day === today() ? t : { day: today(), n: 0 }; };
const brkLoaded = {};
const brkLoad = n => {
  const f = BREAK_FILE(n);
  return brkLoaded[f] ||= new Promise((ok, fail) => { const s = Object.assign(document.createElement('script'), { src: f }); s.onload = ok; s.onerror = () => { delete brkLoaded[f]; fail(new Error('load')); }; document.head.append(s); });
};

// Витрина
function openBreaks() {
  const m = $('modal'), best = brkBest(), t = brkToday();
  m.innerHTML = `<div class="modal-box glass brk-box" role="dialog" aria-modal="true" aria-labelledby="brkTitle">
    <h2 id="brkTitle">☕ ${L('Разминка', 'Break time')}</h2>
    <p class="hero-lead">${L(`Мини-игры для перерыва. Награда — ещё ${Math.max(0, BREAK_DAY_REWARDS - t.n)} из ${BREAK_DAY_REWARDS} сегодня: +1 у.е. и бодрость на следующую неделю (+${BREAK_BUFF} к Энергии и Кукухе).`, `Mini-games for your break. Rewards left today: ${Math.max(0, BREAK_DAY_REWARDS - t.n)} of ${BREAK_DAY_REWARDS} — +$1 and a boost for next week (+${BREAK_BUFF} Energy and Sanity).`)}${prefs.breakBuff ? ` <b>${L(`Бодрость: +${prefs.breakBuff}`, `Boost: +${prefs.breakBuff}`)}</b>` : ''}</p>
    ${BREAK_CATS.map(([c, ico, name]) => `<h3 class="hs-h">${ico} ${esc(name)}</h3><div class="brk-grid">${BREAKS.filter(b => b[1] === c).map(([n, , i, title]) => `<button type="button" class="brk-card brk-c-${c}" data-brk="${n}" style="animation-delay:${(n % 10) * 25}ms"><span class="brk-ico" aria-hidden="true">${i}</span><b>${esc(title)}</b>${best[n] != null ? `<small>🏆 ${esc(String(best[n]))}</small>` : ''}</button>`).join('')}</div>`).join('')}
    <button class="btn-ghost" type="button" id="brkClose">${L('Закрыть', 'Close')}</button></div>`;
  m.hidden = false;
  m.querySelectorAll('[data-brk]').forEach(b => b.onclick = () => { m.hidden = true; playBreak(+b.dataset.brk); });
  $('brkClose').onclick = () => { m.hidden = true; };
  track('break_open');
}

// Партия: полноэкранное окно, игра рисуется в root
async function playBreak(n, opts = {}) {
  const meta = BREAKS.find(b => b[0] === n); if (!meta) return;
  const over = Object.assign(document.createElement('div'), { className: 'brk-over', role: 'dialog' });
  over.innerHTML = `<div class="brk-head"><button type="button" class="btn-chip" id="brkBack">← ${L('Разминка', 'Breaks')}</button><b>${meta[2]} ${esc(meta[3])}</b><span class="brk-best" id="brkBest"></span></div>
    <p class="brk-desc">${esc(meta[4])}</p><div class="brk-root" id="brkRoot"><p class="brk-load">${L('Загружаю…', 'Loading…')}</p></div><div class="brk-result" id="brkResult" hidden></div>`;
  document.body.append(over);
  const cleanups = []; let ended = false;
  const close = () => { cleanups.splice(0).forEach(f => { try { f(); } catch {} }); over.remove(); };
  const then = opts.then;  // разминка перед неделей: выход и кнопка итога ведут дальше, в неделю
  if (then) over.querySelector('#brkBack').innerHTML = L('Пропустить →', 'Skip →');
  over.querySelector('#brkBack').onclick = () => { close(); then ? then() : openBreaks(); };
  const best = brkBest()[n];
  over.querySelector('#brkBest').textContent = best != null ? `🏆 ${best}` : '';
  try { if (!window.BREAK_IMPL[n]) await brkLoad(n); } catch { over.querySelector('#brkRoot').innerHTML = `<p class="brk-load">${L('Не удалось загрузить — проверьте интернет', 'Couldn’t load — check your connection')}</p>`; return; }
  const impl = window.BREAK_IMPL[n];
  if (!impl) { over.querySelector('#brkRoot').innerHTML = `<p class="brk-load">${L('Скоро будет!', 'Coming soon!')}</p>`; return; }
  const root = over.querySelector('#brkRoot'); root.innerHTML = '';
  track('break_play', { detail: String(n) });
  const api = {
    L, esc, sfx, buzz, rnd, shuffle, EN, toast,
    rng: Math.random,
    daySeed: (salt = '') => seeded(`brk-${n}-${today()}-${salt}`),   // одинаковая задача дня для всех
    best,                                                         // прежний рекорд (или undefined)
    hero: careerNow()?.hero || null,                              // персонаж, его питомцы и дети — для игр 12, 48
    onExit: fn => cleanups.push(fn),
    // Конец партии. score — число очков (больше — лучше) или null; lowerBetter — рекорд по минимуму (время, ходы)
    end({ score = null, won = true, text = '', lowerBetter = false } = {}) {
      if (ended) return; ended = true;
      cleanups.splice(0).forEach(f => { try { f(); } catch {} });
      const b = brkBest(); let rec = false;
      if (score != null && won && (b[n] == null || (lowerBetter ? score < b[n] : score > b[n]))) { b[n] = score; store.set('vdp-break-best', b); rec = true; }
      const t = brkToday(); let reward = '';
      if (won && t.n < BREAK_DAY_REWARDS) {
        t.n++; store.set('vdp-break-day', t);
        prefs.breakBuff = Math.min(BREAK_BUFF_MAX, (prefs.breakBuff || 0) + BREAK_BUFF); store.set(KEY.prefs, prefs);
        const now = addCash(1);
        reward = L(`+1 у.е.${now ? '' : ' (придут в карьеру)'} · бодрость +${BREAK_BUFF} на следующую неделю`, `+$1${now ? '' : ' (goes to your career)'} · +${BREAK_BUFF} boost for next week`);
      }
      track('break_end', { detail: `${n}:${won ? 1 : 0}:${score ?? ''}` });
      // После каждой партии — обязательный рекламный ролик (без награды), потом итог. Кроме покупавших у.е. картой.
      const show = () => {
      won ? sfx.win?.() : sfx.lose?.();
      const r = over.querySelector('#brkResult');
      r.innerHTML = `<b>${won ? (rec ? L('🏆 Новый рекорд!', '🏆 New record!') : L('✅ Готово!', '✅ Done!')) : L('Не получилось', 'Not this time')}</b>
        ${text ? `<p>${text}</p>` : ''}${score != null ? `<p>${L('Результат', 'Score')}: <b>${esc(String(score))}</b></p>` : ''}${reward ? `<p class="brk-reward">🎁 ${reward}</p>` : won ? `<p class="brk-note">${L('Награды на сегодня собраны — играйте для рекордов', 'Today’s rewards are collected — play for records')}</p>` : ''}
        ${then ? `<button class="btn-main" type="button" id="brkGo">${L('За работу →', 'Back to work →')}</button>`
          : `<div class="row2"><button class="btn-main" type="button" id="brkAgain">${L('Ещё раз', 'Again')}</button><button class="btn-ghost" type="button" id="brkList">${L('Другие разминки', 'Other games')}</button></div>`}`;
      r.hidden = false; r.classList.toggle('brk-win', !!won);
      if (won && !matchMedia('(prefers-reduced-motion: reduce)').matches) {  // конфетти
        const cf = Object.assign(document.createElement('div'), { className: 'brk-conf' }), cols = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ffaa28', '#b26bff'];
        for (let i = 0; i < 40; i++) { const e = document.createElement('i'); e.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 5]};animation-duration:${1.4 + Math.random() * 1.4}s;animation-delay:${Math.random() * .4}s`; cf.append(e); }
        over.append(cf); setTimeout(() => cf.remove(), 3400);
      }
      if (then) { r.querySelector('#brkGo').onclick = () => { close(); then(); }; return; }
      r.querySelector('#brkAgain').onclick = () => { close(); playBreak(n); };
      r.querySelector('#brkList').onclick = () => { close(); openBreaks(); };
      };
      if (typeof adWatch === 'function' && adOn() && !prefs.paidUser && !(typeof noAdsOn === 'function' && noAdsOn())) setTimeout(() => adWatch(() => show(), { forced: true, why: 'break' }), 700);
      else show();
    },
  };
  try { impl(root, api); } catch (e) { root.innerHTML = `<p class="brk-load">${L('Ошибка игры', 'Game error')}</p>`; console.error(e); }
}

// Бодрость от разминок — в начале следующей рабочей недели карьеры
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || !prefs.breakBuff) return;
  const b = prefs.breakBuff; prefs.breakBuff = 0; store.set(KEY.prefs, prefs);
  S2.res.energy = Math.min(95, S2.res.energy + b); S2.res.psyche = Math.min(95, S2.res.psyche + b);
  setTimeout(() => toast(L(`☕ Бодрость после разминок: Энергия и Кукуха +${b}`, `☕ Break boost: Energy and Sanity +${b}`)), 1600);
});

document.addEventListener('DOMContentLoaded', () => { const b = $('openBreaks'); if (b) b.onclick = openBreaks; });
if (document.readyState !== 'loading') { const b = $('openBreaks'); if (b) b.onclick = openBreaks; }

// ---------- разминка сама приходит в игру ----------
// Короткие игры — для разминки перед неделей и для предложений
const BREAK_QUICK = [5, 6, 22, 24, 28, 30, 34, 39, 41, 43, 44, 45, 49];
const brkPick = () => { const left = BREAK_QUICK.filter(n => n !== prefs.brkLast); const n = left[Math.floor(Math.random() * left.length)]; prefs.brkLast = n; store.set(KEY.prefs, prefs); return n; };
const brkTitle = n => { const b = BREAKS.find(x => x[0] === n); return `${b[2]} ${b[3]}`; };

// 1) Каждая третья рабочая неделя начинается с разминки (переход «Неделя N →» с экрана итогов)
function breakBeforeWeek(go) {
  if (views.end.hidden || (prefs.gamesPlayed || 0) < 2 || (typeof guestLocked === 'function' && guestLocked())) return go();
  prefs.brkWeeks = (prefs.brkWeeks || 0) + 1; store.set(KEY.prefs, prefs);
  if (prefs.brkWeeks % 3) return go();
  const n = brkPick(), m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="bwTitle"><span class="lvl-ico" aria-hidden="true">☕</span>
    <h2 id="bwTitle">${L('Разминка перед неделей', 'Warm-up before the week')}</h2>
    <p>${L('Минутка на перерыв — и за работу. Сегодня:', 'A quick break, then back to work. Today:')} <b>${esc(brkTitle(n))}</b></p>
    <button class="btn-main" type="button" id="bwGo">${L('Начать', 'Start')} <small id="bwT">3</small></button>
    <button class="btn-link" type="button" id="bwSkip">${L('Пропустить', 'Skip')}</button></div>`;
  m.hidden = false;
  let k = 3, fired = false;
  const run = () => { if (fired) return; fired = true; clearInterval(t); m.hidden = true; track('break_week', { detail: String(n) }); playBreak(n, { then: go }); };
  const t = setInterval(() => { k--; if ($('bwT')) $('bwT').textContent = k; if (k <= 0) run(); }, 1000);
  $('bwGo').onclick = run;
  $('bwSkip').onclick = () => { fired = true; clearInterval(t); m.hidden = true; track('break_week_skip'); go(); };
}
if (typeof window.startWeek === 'function') { const sw1 = window.startWeek; window.startWeek = function (...a) { return breakBeforeWeek(() => sw1.apply(this, a)); }; }

// 2) Предложение на экране итогов недели: пока сегодня есть награды, не чаще раза в 20 минут и 3 раз в день;
// если персонаж выдохся (Энергия или Кукуха ниже 30) — про бодрость. «×» — больше не предлагать.
bus.on('weekEnd', x => {
  if (x.mode !== 'career' || prefs.brkNoAsk || brkToday().n >= BREAK_DAY_REWARDS) return;
  const d = store.get('vdp-break-ask', {}), td = today();
  if (Date.now() - (d.at || 0) < 20 * 60 * 1000 || (d.day === td && d.n >= 3)) return;
  setTimeout(() => {
    const st = views.end.querySelector('.end-sheet .stack'); if (!st || views.end.hidden || st.querySelector('.brk-offer')) return;
    store.set('vdp-break-ask', { at: Date.now(), day: td, n: d.day === td ? (d.n || 0) + 1 : 1 });
    const n = brkPick(), tired = x.res && (x.res.energy < 30 || x.res.psyche < 30);
    st.insertAdjacentHTML('afterbegin', `<div class="brk-offer"><button class="btn-ghost btn-break" type="button" data-brk-go="${n}">${tired
      ? L(`😮‍💨 Вы на нуле — разомнитесь: ${esc(brkTitle(n))} (+${BREAK_BUFF} бодрости)`, `😮‍💨 Running on empty — take a break: ${esc(brkTitle(n))} (+${BREAK_BUFF} boost)`)
      : L(`☕ Перерыв? ${esc(brkTitle(n))} — +1 у.е.`, `☕ Break? ${esc(brkTitle(n))} — +$1`)}</button><button class="brk-x" type="button" aria-label="${L('Не предлагать', 'Don’t offer')}" title="${L('Больше не предлагать', 'Don’t offer again')}">×</button></div>`);
    const o = st.querySelector('.brk-offer');
    o.querySelector('[data-brk-go]').onclick = () => { o.remove(); track('break_offer_go', { detail: String(n) }); playBreak(n); };
    o.querySelector('.brk-x').onclick = () => { o.remove(); prefs.brkNoAsk = true; store.set(KEY.prefs, prefs); toast(L('Хорошо, не будем предлагать. Разминка — в меню.', 'Okay, no more offers. Breaks are in the menu.')); };
  }, 1800);
});
