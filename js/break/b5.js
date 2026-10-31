// «☕ Разминка», игры 41–50: память и внимание (41–45) и расслабление (46–50).
// Контракт — js/break.js: BREAK_IMPL[n] = (root, api) => { … }. Всё внутри IIFE, наружу ничего не утекает.
(() => {
  const IMPL = window.BREAK_IMPL = window.BREAK_IMPL || {};

  // ---------- общие помощники ----------
  const CSS = `
.bgs5-hud { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 2px 2px 6px; font-weight: 800; font-size: 14px; font-variant-numeric: tabular-nums; }
.bgs5-hud .t { color: var(--cyan-l); } .bgs5-hud .t.low { color: var(--down); }
.bgs5-msg { margin: 2px 0 8px; min-height: 22px; text-align: center; color: var(--text-2); font-size: 14px; }
.bgs5-bar { width: 100%; height: 6px; border-radius: 3px; background: rgba(var(--w-rgb),.1); overflow: hidden; margin: 8px 0; }
.bgs5-bar i { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, var(--cyan), var(--magenta)); }
.bgs5-btn { padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--line); background: rgba(var(--w-rgb),.06); color: var(--text); font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; touch-action: manipulation; }
.bgs5-btn.on { border-color: var(--cyan); box-shadow: 0 0 14px rgba(var(--c-rgb),.45); color: var(--cyan-l); }
.bgs5-btn:disabled { opacity: .4; cursor: default; }
.bgs5-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: 100%; margin: 8px 0; }
.bgs5-done { width: auto; min-width: 180px; padding: 13px 26px; background: linear-gradient(90deg, var(--magenta) var(--p, 100%), rgba(var(--m-rgb),.25) var(--p, 100%)); }
.bgs5-done:disabled { box-shadow: none; color: rgba(var(--w-rgb),.75); cursor: default; }
.bgs5-calm .bgs5-done { background: linear-gradient(90deg, #6fc7a8 var(--p, 100%), rgba(111,199,168,.22) var(--p, 100%)); box-shadow: 0 0 22px rgba(111,199,168,.45); color: #0b1a16; }
.bgs5-calm .bgs5-done:disabled { box-shadow: none; color: rgba(var(--w-rgb),.8); }
.bgs5-shake { animation: bgs5shake .3s; }
@keyframes bgs5shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.bgs5-cv { display: block; touch-action: none; border-radius: 16px; }
/* 41 */
.bg41-desk { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; width: 100%; padding: 12px; border-radius: 18px;
  background: linear-gradient(160deg, #3a2a20, #24180f); border: 2px solid #5a4030; box-shadow: inset 0 0 30px rgba(0,0,0,.5), 0 0 18px rgba(var(--c-rgb),.15); transition: filter .25s; }
.bg41-c { aspect-ratio: 1; display: grid; place-items: center; font-size: clamp(26px, 8.5vw, 44px); border-radius: 12px; background: rgba(255,255,255,.04); }
.bg41-off { filter: blur(10px) brightness(.4); }
.bg41-opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; margin-top: 4px; }
.bg41-opts .bgs5-btn { grid-column: 1 / -1; }
.bg41-o { aspect-ratio: 1.6; font-size: 32px; border-radius: 14px; border: 2px solid var(--line); background: var(--panel); cursor: pointer; }
.bg41-o.ok { border-color: var(--up); box-shadow: 0 0 16px rgba(212,255,58,.5); }
.bg41-o.bad { border-color: var(--down); opacity: .6; }
/* 42 */
.bg42-chute { position: relative; width: 100%; height: 240px; overflow: hidden; border-radius: 16px; border: 1.5px dashed var(--line); background: repeating-linear-gradient(0deg, rgba(var(--w-rgb),.02) 0 22px, transparent 22px 44px); }
.bg42-l { position: absolute; left: 50%; top: 0; width: min(78%, 300px); padding: 10px 12px 12px; border-radius: 10px; background: #f4f0e6; color: #2a2433; box-shadow: 0 6px 18px rgba(0,0,0,.5); cursor: grab; touch-action: none; }
.bg42-l small { display: block; font-size: 11px; color: #7a7088; }
.bg42-l b { display: block; font-size: 16px; line-height: 1.2; margin: 3px 0 4px; }
.bg42-st { position: absolute; right: 8px; bottom: -8px; padding: 2px 8px; border: 2px solid var(--sc); color: var(--sc); background: #2a2433; border-radius: 6px; font-size: 11px; font-weight: 900; transform: rotate(-6deg); text-transform: uppercase; }
.bg42-l.fly { transition: transform .22s ease-in, opacity .22s; opacity: 0; }
.bg42-f { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; width: 100%; margin-top: 10px; }
.bg42-f button { padding: 10px 2px 8px; border-radius: 12px; border: 2px solid var(--fc); background: color-mix(in srgb, var(--fc) 14%, var(--panel)); color: var(--text); font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; touch-action: manipulation; }
.bg42-f button span { display: block; font-size: 26px; }
.bg42-f button.ok { box-shadow: 0 0 20px var(--fc); } .bg42-f button.bad { border-color: var(--down); background: rgba(255,59,107,.25); }
/* 43 */
.bg43-word { margin: 20px 0 6px; min-height: 80px; display: grid; place-items: center; font-size: clamp(34px, 11vw, 58px); font-weight: 900; letter-spacing: .03em; font-family: var(--f-display); }
.bg43-pad { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; margin-top: 14px; }
.bg43-pad button { padding: 18px 6px; border-radius: 14px; border: 0; background: var(--bc); color: #0c0c14; font: inherit; font-size: 15px; font-weight: 900; cursor: pointer; touch-action: manipulation; box-shadow: 0 0 14px color-mix(in srgb, var(--bc) 45%, transparent); }
.bg43-pad button:last-child:nth-child(odd) { grid-column: 1 / -1; }
.bg43-fb { height: 22px; font-weight: 800; text-align: center; }
/* 44 */
.bg44-q { margin: 14px 0 6px; font-size: clamp(28px, 9vw, 42px); font-weight: 900; font-family: var(--f-mono); text-align: center; }
.bg44-a { min-width: 140px; min-height: 52px; padding: 6px 16px; border-radius: 14px; border: 2px solid var(--cyan); text-align: center; font: 900 32px var(--f-mono); color: var(--cyan-l); box-shadow: 0 0 14px rgba(var(--c-rgb),.3); }
.bg44-a.ok { border-color: var(--up); color: var(--up); } .bg44-a.bad { border-color: var(--down); color: var(--down); }
.bg44-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; max-width: 360px; margin-top: 14px; }
.bg44-pad button { padding: 14px 0; border-radius: 14px; border: 1.5px solid var(--line); background: var(--panel); color: var(--text); font: 800 24px var(--f-mono); cursor: pointer; touch-action: manipulation; }
.bg44-pad button:active { background: rgba(var(--c-rgb),.2); }
.bg44-pad .go { background: var(--magenta); color: var(--bg); border: 0; }
/* 45 */
.bg45-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; margin-top: 8px; }
.bg45-grid button { aspect-ratio: 1.35; font-size: clamp(40px, 13vw, 60px); border-radius: 18px; border: 2px solid var(--line); background: var(--panel); cursor: pointer; touch-action: manipulation; }
.bg45-grid button.ok { border-color: var(--up); box-shadow: 0 0 18px rgba(212,255,58,.5); }
.bg45-grid button.bad { border-color: var(--down); }
.bg45-grid button.dim { opacity: .45; }
.bg45-why { min-height: 44px; margin: 10px 4px 0; text-align: center; font-size: 15px; }
/* 46 */
.bg46-stage { position: relative; width: min(100%, 330px); aspect-ratio: 1; display: grid; place-items: center; margin: 6px 0; }
.bg46-ring { position: absolute; inset: 4%; border-radius: 50%; border: 2px dashed rgba(140,200,220,.25); }
.bg46-c { position: absolute; width: 92%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 35%, rgba(170,230,240,.85), rgba(90,170,200,.55) 55%, rgba(60,110,160,.25)); box-shadow: 0 0 50px rgba(120,200,220,.35); transform: scale(.45); }
.bg46-txt { position: relative; text-align: center; color: #eaf7fb; text-shadow: 0 1px 8px rgba(0,0,0,.5); }
.bg46-txt b { display: block; font-size: 24px; } .bg46-txt span { font: 900 40px var(--f-mono); }
/* 47 */
.bg47-info { width: 100%; display: flex; justify-content: space-around; gap: 6px; font-size: 13px; color: var(--text-2); text-align: center; }
.bg47-info b { display: block; color: var(--text); font-size: 16px; }
/* 48 */
.bg48-meter { width: 100%; height: 14px; border-radius: 7px; background: rgba(var(--w-rgb),.08); overflow: hidden; border: 1px solid var(--line); }
.bg48-meter i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #f7a6c8, #ff8be6); transition: width .15s; }
/* 49 */
.bg49-sheet { display: grid; gap: var(--g); padding: 12px 10px; width: 100%; border-radius: 14px; touch-action: none;
  background: linear-gradient(135deg, rgba(200,230,255,.10), rgba(200,230,255,.04)); border: 1px solid rgba(200,230,255,.18); }
.bg49-r { display: flex; justify-content: center; gap: var(--g); }
.bg49-b { width: var(--s); height: var(--s); flex: none; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.75), rgba(200,230,255,.25) 35%, rgba(160,200,240,.12) 70%); box-shadow: inset 0 -2px 4px rgba(120,160,210,.35), 0 1px 3px rgba(0,0,0,.35); }
.bg49-b.p { background: radial-gradient(circle at 50% 50%, rgba(200,230,255,.05), rgba(200,230,255,.12) 60%, transparent 70%); box-shadow: inset 0 1px 3px rgba(0,0,0,.4); animation: bg49pop .18s ease-out; }
@keyframes bg49pop { 0% { transform: scale(1.18); } 100% { transform: scale(.92); } }
.bg49-cnt { font: 900 30px var(--f-mono); color: #bfe3ff; }
/* 50 */
.bgs5-row.bg50-tools { gap: 6px; } .bg50-tools .bgs5-btn { padding: 7px 8px; font-size: 12px; }
.bg50-wrap { position: relative; width: 100%; border-radius: 16px; overflow: hidden; border: 6px solid #3a2e24; box-shadow: 0 0 0 1px #5a4636, 0 10px 30px rgba(0,0,0,.5); }
.bg50-wrap canvas { position: absolute; left: 0; top: 0; }
.bg50-wrap canvas + canvas { pointer-events: none; }
`;
  const style = () => { if (document.getElementById('bg-style-5')) return; const s = document.createElement('style'); s.id = 'bg-style-5'; s.textContent = CSS; document.head.append(s); };
  // Таймеры, цикл анимации и слушатели — всё снимается при выходе. dt ограничен, а при скрытой вкладке цикл стоит: игра на паузе.
  const kit = api => {
    const tos = new Set(), offs = []; let alive = true;
    api.onExit(() => { alive = false; tos.forEach(clearTimeout); offs.forEach(f => f()); });
    return {
      after(ms, fn) { const id = setTimeout(() => { tos.delete(id); if (alive) fn(); }, ms); tos.add(id); return id; },
      loop(fn) {
        let last = performance.now(), id = 0;
        const step = t => { if (!alive) return; const dt = Math.min(.1, Math.max(0, (t - last) / 1000)); last = t; if (!document.hidden) fn(dt, t / 1000); id = requestAnimationFrame(step); };
        id = requestAnimationFrame(step); offs.push(() => cancelAnimationFrame(id));
      },
      on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); },
      get alive() { return alive; },
    };
  };
  // Свой маленький звук (учитывает настройку звука игры)
  let AC = null;
  const soundOn = () => { try { return prefs.sound !== false; } catch { return true; } };
  const ac = (force) => {
    if (!force && !soundOn()) return null;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch { return null; }
  };
  const beep = (f, dur = .12, type = 'sine', vol = .05, delay = 0, to, force, attack = .005) => {
    const a = ac(force); if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .05);
  };
  const hiss = (dur, vol, ftype, freq, q = 1, delay = 0) => {
    const a = ac(); if (!a) return;
    const t = a.currentTime + delay, len = Math.ceil(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; f.type = ftype; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(a.destination); s.start(t); s.stop(t + dur);
  };
  const W = root => Math.max(280, Math.min(600, root.clientWidth || 360));
  const DPR = () => Math.min(3, window.devicePixelRatio || 1);
  const sizeCanvas = (cv, w, h) => { const d = DPR(); cv.width = Math.round(w * d); cv.height = Math.round(h * d); cv.style.width = w + 'px'; cv.style.height = h + 'px'; const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return c; };
  const fmtT = s => `⏱ ${Math.max(0, Math.ceil(s))}`;
  // Кнопка «Готово» для спокойных игр: включается через sec секунд, заливка показывает прогресс
  const doneButton = (K, api, btn, sec, result) => {
    let t = 0; btn.disabled = true; btn.style.setProperty('--p', '0%');
    K.loop(dt => { if (!btn.disabled) return; t += dt; btn.style.setProperty('--p', Math.min(100, t / sec * 100) + '%'); if (t >= sec) { btn.disabled = false; btn.style.setProperty('--p', '100%'); } });
    btn.onclick = () => { if (!btn.disabled) api.end(result()); };
    return { unlock() { t = sec; } };
  };
  const shake = el => { el.classList.remove('bgs5-shake'); void el.offsetWidth; el.classList.add('bgs5-shake'); };

  // ================= 41. Запомни стол =================
  const DESK = ['📎', '✏️', '🖊️', '📏', '📐', '📌', '🗂️', '📁', '📒', '🧮', '☕', '🍪', '🖥️', '⌨️', '🖱️', '📱', '🎧', '💡', '🪴', '🔑', '✂️', '🗓️', '📦', '🍎', '🧾', '🖨️', '⏰', '🏆', '🧸', '🕶️', '🍩', '🧃', '📷', '🔦', '🧲', '🍌'];
  IMPL[41] = (root, api) => {
    style(); const K = kit(api), L = api.L;
    const PLAN = [[8, 1], [9, 1], [10, 's'], [11, 2], [12, 2]];
    let round = -1, score = 0, good = 0, phase = 'idle', tLeft = 0, tMax = 1, tAsk = 0, cur = null, gone = [], found = 0;
    root.innerHTML = `<div class="bgs5-hud"><span class="r"></span><span class="s"></span></div><p class="bgs5-msg"></p>
      <div class="bg41-desk"></div><div class="bgs5-bar"><i></i></div><div class="bg41-opts"></div>`;
    const q = s => root.querySelector(s), desk = q('.bg41-desk'), opts = q('.bg41-opts'), msg = q('.bgs5-msg'), bar = q('.bgs5-bar i');
    const hud = () => { q('.r').textContent = L(`Раунд ${round + 1} из 5`, `Round ${round + 1} of 5`); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); };
    const draw = cells => { desk.innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="bg41-c">${cells[i] || ''}</span>`).join(''); };
    K.loop(dt => {
      if (phase === 'show') { tLeft -= dt; bar.style.width = Math.max(0, tLeft / tMax * 100) + '%'; if (tLeft <= 0) ask(); }
      else if (phase === 'ask') tAsk += dt;
    });
    const next = () => {
      round++; if (round >= 5) return api.end({ score, won: good >= 3, text: L(`Угадано раундов: ${good} из 5`, `Rounds solved: ${good} of 5`) });
      hud();
      const [n, mode] = PLAN[round], pool = api.shuffle(DESK, api.rng), items = pool.slice(0, n), spare = pool.slice(n);
      const slots = api.shuffle([...Array(16).keys()], api.rng), cells = [];
      items.forEach((e, i) => { cells[slots[i]] = e; });
      cur = { mode, items, spare, cells };
      draw(cells); desk.classList.remove('bg41-off');
      msg.textContent = L('Запомните, что лежит на столе', 'Memorise what is on the desk');
      opts.innerHTML = `<button class="bgs5-btn" type="button">${L('Запомнил!', 'Got it!')}</button>`;
      opts.querySelector('button').onclick = ask;
      tMax = tLeft = n <= 9 ? 5 : 6; phase = 'show';
    };
    const ask = () => {
      if (phase !== 'show') return;
      phase = 'blink'; bar.style.width = '0%'; desk.classList.add('bg41-off'); opts.innerHTML = '';
      msg.textContent = L('Кто-то подошёл к вашему столу…', 'Someone came by your desk…');
      api.sfx.stapler?.();
      K.after(900, () => {
        const { mode, items, spare, cells } = cur, k = mode === 2 ? 2 : 1;
        gone = items.slice(0, k); let left = items.slice(k), nc = [];
        if (mode === 's') left.push(spare.shift());
        if (round >= 2) { const sl = api.shuffle([...Array(16).keys()], api.rng); api.shuffle(left, api.rng).forEach((e, i) => { nc[sl[i]] = e; }); }
        else { nc = cells.slice(); gone.forEach(g => { nc[cells.indexOf(g)] = ''; }); }
        draw(nc); desk.classList.remove('bg41-off');
        found = 0; tAsk = 0; phase = 'ask';
        msg.textContent = k === 2 ? L('Пропали два предмета — какие?', 'Two items vanished — which ones?')
          : mode === 's' ? L('Один предмет подменили. Что пропало?', 'One item was swapped. What vanished?') : L('Что исчезло со стола?', 'What vanished from the desk?');
        const ch = api.shuffle([...gone, ...spare.slice(0, 6 - k)], api.rng);
        opts.innerHTML = ch.map(e => `<button class="bg41-o" type="button" data-e="${e}">${e}</button>`).join('');
        opts.querySelectorAll('button').forEach(b => { b.onclick = () => pick(b); });
      });
    };
    const pick = b => {
      if (phase !== 'ask' || b.disabled) return;
      b.disabled = true;
      if (gone.includes(b.dataset.e)) {
        b.classList.add('ok'); found++; score += 10 + Math.max(0, 5 - Math.floor(tAsk)); hud(); api.sfx.item?.();
        if (found < gone.length) return;
        good++; msg.textContent = L('Точно! Глаз — алмаз.', 'Spot on! Eagle eye.');
      } else {
        b.classList.add('bad'); api.sfx.stamp?.(); api.buzz('danger'); shake(desk);
        opts.querySelectorAll('button').forEach(x => { if (gone.includes(x.dataset.e)) x.classList.add('ok'); x.disabled = true; });
        msg.textContent = L(`Нет — пропало: ${gone.join(' ')}`, `No — it was: ${gone.join(' ')}`);
      }
      phase = 'wait'; K.after(1400, next);
    };
    next();
  };

  // ================= 42. Сортировка почты =================
  const DEPTS = [
    { c: '#d4ff3a', i: '💰', n: ['Бухгалтерия', 'Accounting'], s: [['Счёт на оплату', 'Invoice to pay'], ['Авансовый отчёт', 'Expense report'], ['Акт сверки', 'Reconciliation'], ['Расчётный листок', 'Payslip'], ['Чеки из командировки', 'Trip receipts'], ['Квартальный баланс', 'Quarterly balance'], ['НДС за квартал', 'Quarterly VAT']] },
    { c: '#2de2e6', i: '💻', n: ['IT', 'IT'], s: [['Не работает принтер', 'Printer is broken'], ['Забыл пароль', 'Forgot my password'], ['Монитор мигает', 'Monitor flickers'], ['Нужен доступ к VPN', 'Need VPN access'], ['Мышка не кликает', 'Mouse won’t click'], ['Пропал интернет', 'Internet is down'], ['Почта не грузится', 'Email won’t load']] },
    { c: '#ff3bd4', i: '🤝', n: ['HR', 'HR'], s: [['Заявление на отпуск', 'Leave request'], ['Резюме кандидата', 'Candidate CV'], ['Больничный лист', 'Sick note'], ['Анкета новичка', 'New hire form'], ['Тимбилдинг в пятницу', 'Friday teambuilding'], ['Оценка стажёра', 'Intern review'], ['Поздравить именинника', 'Birthday card']] },
    { c: '#ffa53a', i: '📈', n: ['Продажи', 'Sales'], s: [['Коммерческое предложение', 'Sales proposal'], ['Заявка от клиента', 'Client request'], ['Договор поставки', 'Supply contract'], ['План продаж', 'Sales plan'], ['Скидка для партнёра', 'Partner discount'], ['Прайс-лист', 'Price list'], ['Перезвонить клиенту', 'Call the client back']] },
  ];
  const SENDERS = [['Иванов', 'Ivanov'], ['Петрова', 'Petrova'], ['Шеф', 'The Boss'], ['Клиент', 'A client'], ['Стажёр', 'The intern'], ['Ресепшен', 'Reception'], ['Сидоров', 'Sidorov'], ['Склад', 'Warehouse']];
  IMPL[42] = (root, api) => {
    style(); const K = kit(api), L = api.L, R = api.rng;
    let time = 60, score = 0, ok = 0, streak = 0, el = 0, cur = null, y = 0, drag = null, over = false;
    root.innerHTML = `<div class="bgs5-hud"><span class="t"></span><span class="s"></span><span class="k"></span></div>
      <p class="bgs5-msg">${L('Перетащите письмо в папку или нажмите на папку', 'Drag the letter to a folder or tap the folder')}</p>
      <div class="bg42-chute"></div><div class="bg42-f">${DEPTS.map((d, i) => `<button type="button" data-d="${i}" style="--fc:${d.c}"><span>${d.i}</span>${L(...d.n)}</button>`).join('')}</div>`;
    const q = s => root.querySelector(s), chute = q('.bg42-chute'), folders = [...root.querySelectorAll('[data-d]')];
    const hud = () => { const t = q('.t'); t.textContent = fmtT(time); t.classList.toggle('low', time < 10); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); q('.k').textContent = streak >= 3 ? `🔥×${streak}` : ''; };
    const spawn = () => {
      const di = Math.floor(R() * 4), d = DEPTS[di], sub = api.rnd(d.s, R), stamp = el < 20 || R() < .5;
      const n = Object.assign(document.createElement('div'), { className: 'bg42-l' });
      n.innerHTML = `<small>✉️ ${L('От', 'From')}: ${L(...api.rnd(SENDERS, R))}</small><b>${L(...sub)}</b>` + (stamp ? `<span class="bg42-st" style="--sc:${d.c}">${L(...d.n)}</span>` : `<span class="bg42-st" style="--sc:#9a90aa">?</span>`);
      chute.append(n); cur = { el: n, d: di, x: 0 }; y = -10; place();
      K.on(n, 'pointerdown', e => { if (cur?.el !== n) return; e.preventDefault(); n.setPointerCapture?.(e.pointerId); drag = { sx: e.clientX, sy: e.clientY, x0: cur.x, y0: y, moved: false }; });
      K.on(n, 'pointermove', e => { if (!drag || cur?.el !== n) return; const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (Math.hypot(dx, dy) > 6) drag.moved = true; cur.x = drag.x0 + dx; y = drag.y0 + dy; place(); hoverF(e); });
      const up = e => { if (!drag || cur?.el !== n) return; const f = folderAt(e.clientX, e.clientY); drag = null; folders.forEach(b => b.style.transform = ''); if (f != null) sort(f); else { cur.x = 0; y = Math.min(y, chute.clientHeight - n.offsetHeight - 2); place(); } };
      K.on(n, 'pointerup', up); K.on(n, 'pointercancel', up);
    };
    const place = () => { if (cur) cur.el.style.transform = `translate(calc(-50% + ${cur.x}px), ${y}px)`; };
    const folderAt = (x, yy) => { const i = folders.findIndex(b => { const r = b.getBoundingClientRect(); return x >= r.left - 6 && x <= r.right + 6 && yy >= r.top - 20 && yy <= r.bottom + 6; }); return i < 0 ? null : i; };
    const hoverF = e => { const f = folderAt(e.clientX, e.clientY); folders.forEach((b, i) => { b.style.transform = i === f ? 'scale(1.08)' : ''; }); };
    const flash = (i, cls) => { const b = folders[i]; b.classList.add(cls); K.after(260, () => b.classList.remove(cls)); };
    const penalty = () => { streak = 0; score = Math.max(0, score - 5); time -= 3; api.sfx.stamp?.(); api.buzz('danger'); shake(chute); };
    const sort = i => {
      if (!cur || over) return;
      const c = cur; cur = null; drag = null;
      if (i === c.d) { ok++; streak++; score += 10 + 2 * Math.min(streak, 5); flash(i, 'ok'); api.sfx.stapler?.(); api.buzz('tap'); }
      else { flash(i, 'bad'); flash(c.d, 'ok'); penalty(); }
      const r = folders[i].getBoundingClientRect(), cr = chute.getBoundingClientRect();
      c.el.classList.add('fly'); c.el.style.transform = `translate(calc(-50% + ${r.left + r.width / 2 - cr.left - cr.width / 2}px), ${cr.height + 30}px) scale(.3)`;
      K.after(230, () => c.el.remove()); hud(); K.after(120, () => { if (!over) spawn(); });
    };
    folders.forEach((b, i) => { b.onclick = () => sort(i); });
    K.loop(dt => {
      if (over) return;
      time -= dt; el += dt;
      if (cur && !drag) {
        const fall = Math.max(2.4, 6 - el * .07), h = chute.clientHeight - cur.el.offsetHeight;
        y += (h + 10) / fall * dt; place();
        if (y >= h) { const c = cur; cur = null; c.el.remove(); flash(c.d, 'ok'); penalty(); api.toast?.(L('Письмо потерялось! −3 с', 'Letter lost! −3 s')); K.after(200, () => { if (!over) spawn(); }); }
      }
      if (time <= 0) { over = true; time = 0; api.end({ score, won: ok >= 12, text: L(`Разложено писем: ${ok}`, `Letters sorted: ${ok}`) }); }
      hud();
    });
    hud(); spawn();
  };

  // ================= 43. Цветная путаница =================
  const INKS = [['КРАСНЫЙ', 'RED', '#ff3b5c'], ['СИНИЙ', 'BLUE', '#4d86ff'], ['ЗЕЛЁНЫЙ', 'GREEN', '#2fd36b'], ['ЖЁЛТЫЙ', 'YELLOW', '#ffd23a'], ['ФИОЛЕТОВЫЙ', 'PURPLE', '#b46bff']];
  IMPL[43] = (root, api) => {
    style(); const K = kit(api), L = api.L, R = api.rng;
    let time = 45, el = 0, score = 0, right = 0, wrong = 0, streak = 0, ink = 0, nC = 4, over = false, order = [0, 1, 2, 3];
    root.innerHTML = `<div class="bgs5-hud"><span class="t"></span><span class="s"></span><span class="k"></span></div>
      <p class="bgs5-msg">${L('Жмите цвет, которым написано слово', 'Tap the colour the word is written in')}</p>
      <div class="bg43-word"></div><div class="bg43-fb"></div><div class="bg43-pad"></div>`;
    const q = s => root.querySelector(s), word = q('.bg43-word'), pad = q('.bg43-pad'), fb = q('.bg43-fb');
    const hud = () => { const t = q('.t'); t.textContent = fmtT(time); t.classList.toggle('low', time < 10); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); q('.k').textContent = streak >= 3 ? `🔥×${streak}` : ''; };
    const drawPad = () => { pad.innerHTML = order.map(i => `<button type="button" data-i="${i}" style="--bc:${INKS[i][2]}">${L(INKS[i][0], INKS[i][1])}</button>`).join(''); pad.querySelectorAll('button').forEach(b => { b.onclick = () => answer(+b.dataset.i); }); };
    const next = () => {
      if (el > 15 && nC < 5) { nC = 5; order = [...order, 4]; }
      if (el > 22) order = api.shuffle(order, R);
      ink = Math.floor(R() * nC); let w = Math.floor(R() * nC); if (R() < .85) while (w === ink) w = Math.floor(R() * nC);
      word.innerHTML = `<span style="color:${INKS[ink][2]}">${L(INKS[w][0], INKS[w][1])}</span>`;
      if (el > 30 && R() < .3) word.firstChild.style.transform = `rotate(${R() < .5 ? -8 : 8}deg)`;
      drawPad();
    };
    const answer = i => {
      if (over) return;
      if (i === ink) { right++; streak++; score += 10 + Math.min(streak, 10); fb.textContent = '✓'; fb.style.color = 'var(--up)'; api.buzz('tap'); beep(880 + Math.min(streak, 8) * 40, .08, 'triangle', .04); }
      else { wrong++; streak = 0; score = Math.max(0, score - 5); fb.textContent = L(`✗ Это был ${INKS[ink][0].toLowerCase()}`, `✗ It was ${INKS[ink][1].toLowerCase()}`); fb.style.color = 'var(--down)'; api.sfx.stamp?.(); api.buzz('danger'); shake(word); }
      hud(); next();
    };
    K.loop(dt => { if (over) return; time -= dt; el += dt; if (time <= 0) { over = true; time = 0; api.end({ score, won: right >= 15, text: L(`Верно: ${right} · ошибок: ${wrong}`, `Correct: ${right} · mistakes: ${wrong}`) }); } hud(); });
    hud(); next();
  };

  // ================= 44. Бухгалтерия в уме =================
  IMPL[44] = (root, api) => {
    style(); const K = kit(api), L = api.L, R = api.rng;
    const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
    const gen = lv => {
      if (lv === 0) { const a = ri(2, 20), b = ri(2, 20); return R() < .5 ? [`${a} + ${b}`, a + b] : [`${Math.max(a, b)} − ${Math.min(a, b)}`, Math.abs(a - b)]; }
      if (lv === 1) { const a = ri(12, 75), b = ri(8, 49); return R() < .5 ? [`${a} + ${b}`, a + b] : [`${Math.max(a, b)} − ${Math.min(a, b)}`, Math.abs(a - b)]; }
      if (lv === 2) { const a = ri(2, 9), b = ri(3, 9); return [`${a} × ${b}`, a * b]; }
      if (lv === 3) { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 19); return R() < .5 || a * b <= c ? [`${a} × ${b} + ${c}`, a * b + c] : [`${a} × ${b} − ${c}`, a * b - c]; }
      const k = Math.floor(R() * 3);
      if (k === 0) { const a = ri(2, 12), b = ri(2, 9), c = ri(2, 6); return [`(${a} + ${b}) × ${c}`, (a + b) * c]; }
      if (k === 1) { const c = ri(2, 9), qq = ri(3, 12); return [`${c * qq} : ${c}`, qq]; }
      const p = api.rnd([10, 20, 25, 50], R), base = p === 25 ? ri(2, 20) * 4 : p === 50 ? ri(2, 40) * 2 : ri(2, 40) * 10;
      return [L(`${p}% от ${base}`, `${p}% of ${base}`), base * p / 100];
    };
    const PTS = [10, 20, 20, 30, 40];
    let time = 60, score = 0, solved = 0, wrong = 0, inp = '', task = null, lv = 0, over = false, lock = false;
    root.innerHTML = `<div class="bgs5-hud"><span class="t"></span><span class="s"></span><span class="lv"></span></div>
      <div class="bg44-q"></div><div class="bg44-a"></div>
      <div class="bg44-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" data-k="${d}">${d}</button>`).join('')}<button type="button" data-k="b">⌫</button><button type="button" data-k="0">0</button><button type="button" class="go" data-k="ok">✓</button></div>`;
    const q = s => root.querySelector(s), qEl = q('.bg44-q'), aEl = q('.bg44-a');
    const hud = () => { const t = q('.t'); t.textContent = fmtT(time); t.classList.toggle('low', time < 10); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); q('.lv').textContent = L(`Уровень ${lv + 1}`, `Level ${lv + 1}`); };
    const next = () => { lv = Math.min(4, Math.floor(solved / 3)); task = gen(lv); qEl.textContent = `${task[0]} = ?`; inp = ''; aEl.textContent = ''; aEl.className = 'bg44-a'; lock = false; hud(); };
    const fail = () => {
      wrong++; time -= 3; lock = true; aEl.className = 'bg44-a bad'; aEl.textContent = `${task[1]}`; api.sfx.stamp?.(); api.buzz('danger'); shake(aEl);
      K.after(700, () => { if (!over) next(); });
    };
    const key = k => {
      if (over || lock) return;
      if (k === 'b') inp = inp.slice(0, -1);
      else if (k === 'ok') { if (inp) { if (+inp === task[1]) return win(); return fail(); } return; }
      else if (inp.length < 5) inp += k;
      aEl.textContent = inp;
      if (inp && +inp === task[1]) win();
      else if (inp.length > String(task[1]).length) fail();
    };
    const win = () => { solved++; score += PTS[lv]; lock = true; aEl.className = 'bg44-a ok'; api.buzz('tap'); beep(1046, .09, 'triangle', .05); beep(1568, .1, 'triangle', .04, .06); K.after(250, () => { if (!over) next(); }); };
    root.querySelectorAll('[data-k]').forEach(b => { b.onclick = () => key(b.dataset.k); });
    K.on(document, 'keydown', e => { if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('b'); else if (e.key === 'Enter') key('ok'); else return; e.preventDefault(); });
    K.loop(dt => { if (over) return; time -= dt; if (time <= 0) { over = true; time = 0; api.end({ score, won: solved >= 8, text: L(`Решено примеров: ${solved} · ошибок: ${wrong}`, `Solved: ${solved} · mistakes: ${wrong}`) }); } hud(); });
    next();
  };

  // ================= 45. Кто лишний =================
  // «три своих | лишний», пояснение рус/англ
  const ODD = [
    ['📎 ✏️ 🖊️ | 🍕', 'Канцелярия — а пицца просто проходила мимо', 'Stationery — the pizza just wandered in'],
    ['🍎 🍌 🍇 | 🖨️', 'Фрукты. Принтер, к сожалению, несъедобен', 'Fruit. The printer is sadly inedible'],
    ['☕ 🍵 🧃 | 📁', 'Напитки — папку не выпьешь', 'Drinks — you can’t drink a folder'],
    ['🖥️ ⌨️ 🖱️ | 🥐', 'Компьютерная техника, а круассан — к кофе', 'Computer gear; the croissant goes with coffee'],
    ['🐱 🐶 🐹 | 📠', 'Домашние питомцы. Факс не мурчит', 'Pets. The fax machine doesn’t purr'],
    ['🚗 🚌 🚲 | 🗄️', 'Транспорт — шкаф с документами никуда не едет', 'Transport — the filing cabinet goes nowhere'],
    ['☀️ 🌧️ ❄️ | 📌', 'Погода за окном, а кнопка — на доске', 'Weather outside; the pin is on the board'],
    ['⚽ 🏀 🎾 | 📒', 'Мячи. Блокнотом в футбол не сыграешь', 'Balls. You can’t play football with a notebook'],
    ['🎸 🎹 🎺 | 🧮', 'Музыкальные инструменты, а счёты — бухгалтерские', 'Musical instruments; the abacus is for accounting'],
    ['🍕 🍔 🌭 | 🥗', 'Фастфуд, а салат — это уже ЗОЖ', 'Fast food; the salad is the healthy one'],
    ['📅 🗓️ ⏰ | 🍩', 'Всё про время и планы. Пончик вне графика', 'All about time and plans. The donut is off-schedule'],
    ['🔑 🔒 🔐 | 🌻', 'Ключи и замки — подсолнух ничего не запирает', 'Keys and locks — a sunflower locks nothing'],
    ['✂️ 📏 📐 | 🎂', 'Чертёжные и режущие инструменты, а торт — на день рождения', 'Cutting and drawing tools; the cake is for a birthday'],
    ['🐟 🐙 🦀 | 🐫', 'Морские жители — верблюду там нечего делать', 'Sea creatures — a camel has no business there'],
    ['🥕 🥦 🌽 | 🍓', 'Овощи, а клубника — ягода', 'Vegetables; the strawberry is a berry'],
    ['🧦 👕 👖 | 🍳', 'Одежда — яичницу не наденешь', 'Clothes — you can’t wear fried eggs'],
    ['👟 👞 👠 | 🎩', 'Обувь, а цилиндр — на голову', 'Shoes; the top hat goes on your head'],
    ['📧 📨 ✉️ | 📞', 'Письма. Телефон — это звонок, не почта', 'Letters. A phone is a call, not mail'],
    ['📱 ☎️ 📟 | 📬', 'Связь голосом и сигналом; почтовый ящик — для бумажных писем', 'Phones and pagers; the mailbox is for paper letters'],
    ['🔴 🟢 🔵 | 🟦', 'Круги, а это — квадрат', 'Circles — and one square'],
    ['1️⃣ 3️⃣ 5️⃣ | 4️⃣', 'Нечётные числа, а 4 — чётное', 'Odd numbers; 4 is even'],
    ['2️⃣ 4️⃣ 8️⃣ | 6️⃣', 'Степени двойки: 2, 4, 8. А 6 — нет', 'Powers of two: 2, 4, 8. Six is not'],
    ['🐝 🦋 🐞 | 🐦', 'Насекомые, а воробей — птица', 'Insects; the bird is a bird'],
    ['🦅 🦉 🦜 | 🦇', 'Птицы. Летучая мышь летает, но она зверь', 'Birds. The bat flies but is a mammal'],
    ['🐬 🐳 🦭 | 🦈', 'Морские млекопитающие, а акула — рыба', 'Marine mammals; the shark is a fish'],
    ['💵 💶 💷 | 💳', 'Наличные, а карта — безнал', 'Cash; the card is cashless'],
    ['🏆 🥇 🎖️ | 🧯', 'Награды. Огнетушитель — за безопасность, а не за KPI', 'Awards. The extinguisher is for safety, not KPIs'],
    ['🖨️ 📠 🖥️ | 🪑', 'Офисная техника, а стул — мебель', 'Office machines; the chair is furniture'],
    ['🪑 🛋️ 🛏️ | 🚪', 'Мебель, а дверь — часть помещения', 'Furniture; the door is part of the room'],
    ['🎄 🎅 ❄️ | 🏖️', 'Зима и Новый год, а пляж — это отпуск летом', 'Winter holidays; the beach is a summer vacation'],
    ['🌞 🏖️ 🍉 | ⛄', 'Лето, а снеговик лепится зимой', 'Summer; snowmen are a winter thing'],
    ['🥐 🥖 🍞 | 🧀', 'Выпечка, а сыр — молочный продукт', 'Baked goods; cheese is dairy'],
    ['🍰 🍩 🍪 | 🥩', 'Сладкое к чаю, а стейк — серьёзная еда', 'Sweets for tea; the steak is serious food'],
    ['🍋 🌻 🌕 | 🍆', 'Всё жёлтое, а баклажан — фиолетовый', 'All yellow; the eggplant is purple'],
    ['🍅 🍓 🍒 | 🍇', 'Всё красное, а виноград — нет', 'All red; the grapes are not'],
    ['🚀 ✈️ 🚁 | 🚢', 'Летают, а корабль плавает', 'They fly; the ship sails'],
    ['🚢 ⛵ 🚤 | 🚂', 'Ходят по воде, а поезд — по рельсам', 'They travel on water; the train runs on rails'],
    ['🔨 🔧 🪚 | 🎻', 'Слесарные инструменты. Скрипка — тоже инструмент, но музыкальный', 'Workshop tools. The violin is an instrument too — a musical one'],
    ['📕 📗 📘 | 📰', 'Книги, а это газета', 'Books; that one is a newspaper'],
    ['♠️ ♥️ ♦️ | ⭐', 'Карточные масти, а звезда — нет', 'Card suits; the star is not'],
    ['♟️ 🎲 🃏 | 🏓', 'Настольные игры, а пинг-понг — спорт', 'Tabletop games; ping-pong is a sport'],
    ['😀 😂 😊 | 😭', 'Все радуются — кроме того, кому дали отчёт на выходные', 'All happy — except the one with a weekend report'],
    ['🥶 ❄️ 🧊 | 🔥', 'Холод, а огонь — горячий', 'Cold; fire is hot'],
    ['🌹 🌷 🌻 | 🍄', 'Цветы, а гриб — не растение вовсе', 'Flowers; a mushroom isn’t even a plant'],
    ['🐄 🐖 🐑 | 🦁', 'Живут на ферме, а лев — дикий', 'Farm animals; the lion is wild'],
    ['🦁 🐯 🐆 | 🐺', 'Кошачьи, а волк — из собачьих', 'Big cats; the wolf is a canine'],
    ['🎧 🎤 📻 | 📷', 'Всё про звук, а фотоаппарат — про картинку', 'All about sound; the camera is about pictures'],
    ['💊 🩺 🩹 | 🎉', 'Медицина и больничный, а это — вечеринка', 'Medicine and sick leave; that one is a party'],
    ['🎂 🎁 🎉 | 📑', 'Праздник, а это — квартальный отчёт', 'Celebration; that one is a quarterly report'],
    ['🧹 🧽 🪣 | 📚', 'Уборка, а книги — для чтения', 'Cleaning; books are for reading'],
    ['👑 💍 💎 | 🧻', 'Драгоценности, а рулон бумаги — нет (хотя в офисе бывает дефицит)', 'Jewels; the paper roll isn’t (though it can be scarce at work)'],
    ['🌧️ ☂️ 💧 | 🕶️', 'Всё про дождь, а очки — от солнца', 'All about rain; sunglasses are for sun'],
    ['🐌 🐢 🦥 | 🐆', 'Медленные, как согласование бюджета. Гепард — быстрый', 'Slow as budget approval. The cheetah is fast'],
    ['🐇 🐆 🏎️ | 🐌', 'Быстрые, а улитка — как пятничный вечер в пробке', 'Fast; the snail is like Friday traffic'],
    ['🗻 🏔️ ⛰️ | 🏝️', 'Горы, а это остров', 'Mountains; that’s an island'],
    ['🥄 🍴 🔪 | 🖊️', 'Столовые приборы. Ручкой есть йогурт — плохая идея', 'Cutlery. Eating yogurt with a pen is a bad idea'],
    ['📊 📈 📉 | 🎨', 'Графики для отчёта, а палитра — для художника', 'Report charts; the palette is for an artist'],
    ['🍝 🍜 🍲 | 🍦', 'Горячие блюда, а мороженое — холодное', 'Hot dishes; ice cream is cold'],
    ['🔋 🔌 💡 | 🕯️', 'Всё на электричестве, а свеча — нет', 'All electric; the candle isn’t'],
    ['🎃 👻 🦇 | 🐣', 'Хеллоуин, а цыплёнок — это весна', 'Halloween; the chick is spring'],
    ['🚒 🚑 🚓 | 🚕', 'Экстренные службы, а такси — просто такси', 'Emergency services; a taxi is just a taxi'],
  ];
  IMPL[45] = (root, api) => {
    style(); const K = kit(api), L = api.L, R = api.rng;
    const sets = api.shuffle(ODD, R).slice(0, 10);
    let round = -1, right = 0, score = 0, t = 0, busy = false;
    root.innerHTML = `<div class="bgs5-hud"><span class="r"></span><span class="s"></span></div>
      <p class="bgs5-msg">${L('Какой предмет здесь лишний?', 'Which one doesn’t belong?')}</p><div class="bg45-grid"></div><p class="bg45-why"></p><div class="bgs5-row"></div>`;
    const q = s => root.querySelector(s), grid = q('.bg45-grid'), why = q('.bg45-why'), row = q('.bgs5-row');
    const hud = () => { q('.r').textContent = L(`Вопрос ${round + 1} из 10`, `Question ${round + 1} of 10`); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); };
    K.loop(dt => { if (!busy) t += dt; });
    const next = () => {
      round++; if (round >= 10) return api.end({ score, won: right >= 6, text: L(`Верных ответов: ${right} из 10`, `Correct answers: ${right} of 10`) });
      const [s] = sets[round], [a, b] = s.split('|'), odd = b.trim(), items = api.shuffle([...a.trim().split(/\s+/), odd], R);
      grid.innerHTML = items.map(e => `<button type="button" data-e="${e}">${e}</button>`).join('');
      why.textContent = ''; row.innerHTML = ''; busy = false; t = 0; hud();
      grid.querySelectorAll('button').forEach(btn => { btn.onclick = () => pick(btn, odd); });
    };
    const pick = (btn, odd) => {
      if (busy) return; busy = true;
      const set = sets[round], good = btn.dataset.e === odd;
      grid.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.dataset.e === odd) x.classList.add('ok'); else if (x !== btn) x.classList.add('dim'); });
      if (good) { right++; score += 10 + (t <= 3 ? 5 : t <= 6 ? 2 : 0); api.sfx.item?.(); }
      else { btn.classList.add('bad'); api.sfx.stamp?.(); api.buzz('danger'); }
      why.innerHTML = `${good ? '✅' : '❌'} ${api.esc(L(set[1], set[2]))}`; hud();
      row.innerHTML = `<button class="bgs5-btn on" type="button">${round < 9 ? L('Дальше →', 'Next →') : L('Итог', 'Finish')}</button>`;
      row.querySelector('button').onclick = next;
    };
    next();
  };

  // ================= 46. Дыхание перед планёркой =================
  IMPL[46] = (root, api) => {
    style(); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const PAT = {
      box: { n: L('Квадрат 4-4-4-4', 'Box 4-4-4-4'), ph: [['in', 4], ['hold', 4], ['out', 4], ['hold2', 4]] },
      r478: { n: L('4-7-8', '4-7-8'), ph: [['in', 4], ['hold', 7], ['out', 8]] },
    };
    const CUE = { in: L('Вдох', 'Breathe in'), hold: L('Задержка', 'Hold'), out: L('Выдох', 'Breathe out'), hold2: L('Пауза', 'Pause') };
    let pat = 'box', run = false, done = false, el = 0, pi = 0, pt = 0, cycles = 0, snd = soundOn(), lastSec = -1;
    root.innerHTML = `<div class="bgs5-row bg46-pats">${Object.entries(PAT).map(([k, p]) => `<button type="button" class="bgs5-btn${k === pat ? ' on' : ''}" data-p="${k}">${p.n}</button>`).join('')}
      <button type="button" class="bgs5-btn snd">${snd ? '🔔' : '🔕'} ${L('Звук', 'Sound')}</button></div>
      <div class="bg46-stage"><div class="bg46-ring"></div><div class="bg46-c"></div><div class="bg46-txt"><b>${L('Сядьте удобно', 'Get comfortable')}</b><span></span></div></div>
      <p class="bgs5-msg">${L('Плечи вниз, телефон на беззвучный. Минута — только для вас.', 'Shoulders down, phone on silent. One minute just for you.')}</p>
      <div class="bgs5-bar"><i style="width:0%"></i></div>
      <div class="bgs5-row"><button type="button" class="bgs5-btn on go">${L('Начать', 'Start')}</button><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), circ = q('.bg46-c'), cue = q('.bg46-txt b'), num = q('.bg46-txt span'), bar = q('.bgs5-bar i'), msg = q('.bgs5-msg'), go = q('.go');
    const dBtn = q('.bgs5-done'); let unlockT = 0;
    dBtn.disabled = true; dBtn.style.setProperty('--p', '0%');
    dBtn.onclick = () => { if (!dBtn.disabled) api.end({ won: true, score: null, text: L(`Дыхательных циклов: ${cycles}. Теперь можно и на планёрку.`, `Breathing cycles: ${cycles}. Ready for the stand-up.`) }); };
    root.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { if (run) return; pat = b.dataset.p; root.querySelectorAll('[data-p]').forEach(x => x.classList.toggle('on', x === b)); }; });
    q('.snd').onclick = e => { snd = !snd; e.currentTarget.innerHTML = `${snd ? '🔔' : '🔕'} ${L('Звук', 'Sound')}`; };
    const chime = kind => {
      if (!snd) return; const dur = PAT[pat].ph[pi][1];
      if (kind === 'in') beep(196, dur, 'sine', .035, 0, 294, true, .8);
      else if (kind === 'out') beep(294, dur, 'sine', .03, 0, 174, true, .8);
      else beep(523, 1.2, 'sine', .015, 0, null, true, .02);
    };
    go.onclick = () => { if (run) return; run = true; done = false; go.disabled = true; root.querySelectorAll('[data-p]').forEach(b => { b.disabled = true; }); pi = 0; pt = 0; lastSec = -1; chime('in'); };
    const ease = x => .5 - Math.cos(Math.PI * x) / 2;
    K.loop(dt => {
      if (!run) return;
      el += dt; pt += dt; unlockT += dt;
      if (dBtn.disabled) { dBtn.style.setProperty('--p', Math.min(100, unlockT / 25 * 100) + '%'); if (unlockT >= 25) { dBtn.disabled = false; dBtn.style.setProperty('--p', '100%'); } }
      const ph = PAT[pat].ph; let [kind, dur] = ph[pi];
      if (pt >= dur) {
        pt -= dur; pi++;
        if (pi >= ph.length) {
          pi = 0; cycles++;
          if (el >= 56) { run = false; done = true; circ.style.transform = 'scale(.6)'; cue.textContent = L('Отлично', 'Well done'); num.textContent = '🌿'; msg.textContent = L('Спокойствие сохранено. Можно возвращаться к делам.', 'Calm restored. Back to work when you’re ready.'); bar.style.width = '100%'; dBtn.disabled = false; dBtn.style.setProperty('--p', '100%'); go.disabled = false; go.textContent = L('Ещё минуту', 'One more minute'); el = 0; root.querySelectorAll('[data-p]').forEach(b => { b.disabled = false; }); return; }
        }
        [kind, dur] = ph[pi]; lastSec = -1; chime(kind);
      }
      const x = Math.min(1, pt / dur), sc = kind === 'in' ? .45 + .55 * ease(x) : kind === 'out' ? 1 - .55 * ease(x) : kind === 'hold' ? 1 : .45;
      circ.style.transform = `scale(${sc.toFixed(4)})`;
      const sec = Math.ceil(dur - pt); if (sec !== lastSec) { lastSec = sec; cue.textContent = CUE[kind]; num.textContent = sec; }
      bar.style.width = Math.min(100, el / 60 * 100) + '%';
      msg.textContent = kind === 'in' ? L('Медленно через нос…', 'Slowly through the nose…') : kind === 'out' ? L('Мягко через рот, плечи опускаются…', 'Gently through the mouth, shoulders drop…') : L('Тишина. Никаких дедлайнов.', 'Stillness. No deadlines.');
    });
  };

  // ================= 47. Цветок на подоконнике =================
  const PLANT_KEY = 'vdp-break-plant';
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  const STAGE_AT = [0, 2, 4, 7, 11, 16];
  IMPL[47] = (root, api) => {
    style(); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    let st; try { st = JSON.parse(localStorage.getItem(PLANT_KEY)) || null; } catch { st = null; }
    const td = dayKey();
    st = Object.assign({ g: 0, last: null, cnt: 0, streak: 0, best: 0, born: td }, st || {});
    const save = () => { try { localStorage.setItem(PLANT_KEY, JSON.stringify(st)); } catch {} };
    const since = st.last ? dayDiff(st.last, td) : null;
    if (since != null && since > 1) st.streak = 0;
    const stageOf = g => STAGE_AT.reduce((s, v, i) => g >= v ? i : s, 0);
    const NAMES = [L('Росток', 'Sprout'), L('Побег', 'Shoot'), L('Кустик', 'Little bush'), L('Бутоны', 'Buds'), L('Цветёт', 'Blooming'), L('Деревце', 'Little tree')];
    const watered = () => st.last === td;
    let droop = since != null && since >= 3 ? 1 : (watered() && st.cnt > 1 ? .5 : 0), droopT = droop, wet = watered() ? .6 : 0, drops = [], can = 0, wig = 0;
    const w = W(root), h = Math.round(Math.min(w * 1.05, Math.max(300, innerHeight - 330), 460));
    root.innerHTML = `<div class="bg47-info"><div><b class="st"></b>${L('стадия', 'stage')}</div><div><b class="sk"></b>${L('дней подряд', 'day streak')}</div><div><b class="nx"></b>${L('до роста', 'to grow')}</div></div>
      <canvas class="bgs5-cv"></canvas><p class="bgs5-msg"></p>
      <div class="bgs5-row"><button type="button" class="bgs5-btn on wat">💧 ${L('Полить', 'Water')}</button><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), cv = q('canvas'), c = sizeCanvas(cv, w, h), msg = q('.bgs5-msg'), dBtn = q('.bgs5-done');
    let unlocked = watered(), unlockIn = unlocked ? 0 : Infinity;
    dBtn.disabled = !unlocked; dBtn.style.setProperty('--p', unlocked ? '100%' : '0%');
    dBtn.onclick = () => { if (!dBtn.disabled) api.end({ won: true, score: null, text: L(`${NAMES[stageOf(st.g)]} · полит${st.streak ? ` · серия ${st.streak} дн.` : ''}`, `${NAMES[stageOf(st.g)]} · watered${st.streak ? ` · ${st.streak}-day streak` : ''}`) }); };
    const info = () => {
      const s = stageOf(st.g); q('.st').textContent = `${s + 1}/6`; q('.sk').textContent = st.streak;
      q('.nx').textContent = s >= 5 ? '∞' : `${STAGE_AT[s + 1] - st.g} 💧`;
    };
    const greet = () => {
      if (watered()) msg.textContent = st.cnt > 1 ? L('Цветок уже напоен — даже слишком. Отдохните вместе.', 'Already watered — a bit too much. Just rest together.') : L('Сегодня уже полит. Приходите завтра — подрастёт!', 'Already watered today. Come back tomorrow — it will grow!');
      else if (st.last == null) msg.textContent = L('Коллега оставил вам росток. Поливайте раз в день — и он вырастет.', 'A coworker left you a sprout. Water it once a day and it will grow.');
      else if (since >= 3) msg.textContent = L(`Вас не было ${since} дн. — цветок загрустил. Полейте его!`, `You were away ${since} days — the plant is sad. Water it!`);
      else msg.textContent = L('Земля подсохла. Самое время полить.', 'The soil is dry. Time to water.');
    };
    q('.wat').onclick = () => {
      if (can > 0) return;
      can = 1.6; beep(660, .5, 'sine', .02, .2, 520);
      for (let i = 0; i < 26; i++) drops.push({ x: w / 2 + 28 + Math.random() * 12, y: h * .2 + Math.random() * 10, v: 80 + Math.random() * 60, d: Math.random() * .9 });
      if (!watered()) {
        const before = stageOf(st.g);
        st.streak = since === 1 ? st.streak + 1 : 1;
        st.g++; st.last = td; st.cnt = 1; st.best = Math.max(st.best, st.streak); save();
        droop = 0; wet = 1;
        const up = stageOf(st.g) > before;
        K.after(1500, () => { msg.textContent = up ? L(`Ура! Новая стадия: ${NAMES[stageOf(st.g)]}.`, `Hooray! New stage: ${NAMES[stageOf(st.g)]}.`) : L('Цветок благодарно расправил листья.', 'The plant spreads its leaves gratefully.'); if (up) api.sfx.item?.(); info(); });
        unlockIn = 2.5;
      } else {
        st.cnt++; save(); droop = Math.min(1, .3 + .2 * (st.cnt - 1)); wet = 1;
        K.after(1500, () => { msg.textContent = L('Хватит! Земля и так мокрая — цветок слегка поник.', 'Enough! The soil is soaked — the plant droops a little.'); });
        unlockIn = Math.min(unlockIn, 1);
      }
    };
    cv.addEventListener('pointerdown', () => { wig = 1; beep(1200 + Math.random() * 300, .15, 'sine', .012); });
    const leaf = (x, y, len, ang, col) => {
      c.save(); c.translate(x, y); c.rotate(ang);
      c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .38, len, 0); c.quadraticCurveTo(len * .5, len * .38, 0, 0); c.fill();
      c.strokeStyle = 'rgba(20,60,20,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .9, 0); c.stroke(); c.restore();
    };
    const flower = (x, y, r, open) => {
      c.save(); c.translate(x, y);
      if (!open) { c.fillStyle = '#e88fb0'; c.beginPath(); c.ellipse(0, 0, r * .5, r * .75, 0, 0, 7); c.fill(); c.fillStyle = '#5a9a4a'; c.beginPath(); c.ellipse(0, r * .5, r * .45, r * .25, 0, 0, 7); c.fill(); c.restore(); return; }
      c.fillStyle = '#f5a3c4'; for (let i = 0; i < 5; i++) { c.rotate(Math.PI * 2 / 5); c.beginPath(); c.ellipse(0, -r * .6, r * .42, r * .6, 0, 0, 7); c.fill(); }
      c.fillStyle = '#ffd86a'; c.beginPath(); c.arc(0, 0, r * .32, 0, 7); c.fill(); c.restore();
    };
    const draw = t => {
      // стена, окно, подоконник
      c.fillStyle = '#16172a'; c.fillRect(0, 0, w, h);
      const wx = w * .1, wy = 12, ww = w * .8, wh = h * .62;
      const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#2f4f6e'); sky.addColorStop(1, '#8fb4c8');
      c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
      c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 3; i++) { const cx0 = (wx + ((t * 6 + i * ww / 3) % (ww + 80))) - 40; c.beginPath(); c.ellipse(cx0, wy + 30 + i * 22, 30, 9, 0, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(30,40,60,.55)'; for (let i = 0; i < 6; i++) c.fillRect(wx + i * ww / 6 + 4, wy + wh - 26 - (i * 37 % 40), ww / 6 - 8, 26 + (i * 37 % 40)); c.restore();
      c.strokeStyle = '#3a3d58'; c.lineWidth = 8; c.strokeRect(wx, wy, ww, wh); c.lineWidth = 5; c.beginPath(); c.moveTo(w / 2, wy); c.lineTo(w / 2, wy + wh); c.stroke();
      const sill = h - 28; c.fillStyle = '#d8d2c4'; c.fillRect(0, sill, w, 10); c.fillStyle = '#9e978a'; c.fillRect(0, sill + 10, w, 18);
      // горшок
      const cx = w / 2, pw = Math.min(120, w * .3), ph = Math.min(86, h * .2), py = sill - ph;
      c.fillStyle = '#c8673f'; c.beginPath(); c.moveTo(cx - pw / 2, py + 10); c.lineTo(cx + pw / 2, py + 10); c.lineTo(cx + pw * .36, sill); c.lineTo(cx - pw * .36, sill); c.fill();
      c.fillStyle = '#d97a50'; c.fillRect(cx - pw / 2 - 5, py, pw + 10, 16);
      c.fillStyle = wet > .05 ? `rgb(${70 - wet * 30},${48 - wet * 20},${34 - wet * 14})` : '#5d4130'; c.beginPath(); c.ellipse(cx, py + 3, pw / 2 - 2, 6, 0, 0, 7); c.fill();
      // растение
      const s = stageOf(st.g), k = h / 380, sway = Math.sin(t * 1.3) * 3 + Math.sin(t * 7) * wig * 6, dr = droopT;
      const green = dr > .6 ? '#9fb05a' : '#5fbf5a', dark = dr > .6 ? '#7d8a45' : '#3f8f3c';
      if (s < 5) {
        const hs = [34, 70, 108, 140, 165][s] * k, tipX = cx + sway + dr * 26, tipY = py + 2 - hs + dr * hs * .25;
        const ctrlX = cx + dr * 4, ctrlY = py - hs * .5;
        const pt = u => [(1 - u) * (1 - u) * cx + 2 * (1 - u) * u * ctrlX + u * u * tipX, (1 - u) * (1 - u) * (py + 2) + 2 * (1 - u) * u * ctrlY + u * u * tipY];
        c.strokeStyle = dark; c.lineWidth = 3 + s; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, py + 2); c.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY); c.stroke();
        const nL = Math.min(12, 2 + Math.floor(st.g * 1.3));
        for (let i = 0; i < nL; i++) {
          const u = .25 + .7 * (i + 1) / (nL + 1), [x, y] = pt(u), side = i % 2 ? 1 : -1, len = (14 + s * 6) * k * (1.1 - u * .35);
          leaf(x, y, len, side > 0 ? -.5 + dr * 1.1 + Math.sin(t * 2 + i) * .05 : Math.PI + .5 - dr * 1.1 + Math.sin(t * 2 + i) * .05, i % 3 ? green : dark);
        }
        leaf(tipX, tipY, 14 * k + s * 3, -Math.PI / 2 + .6 + dr, green); leaf(tipX, tipY, 14 * k + s * 3, -Math.PI / 2 - .6 + dr, green);
        if (s >= 3) { flower(tipX, tipY - 6 * k, 10 * k + (s - 3) * 5, s >= 4); const [bx, by] = pt(.7); flower(bx + 18 * k, by - 4, 7 * k + (s - 3) * 4, s >= 4); const [b2x, b2y] = pt(.55); flower(b2x - 18 * k, b2y - 2, 6 * k + (s - 3) * 3, s >= 4); }
      } else {
        const extra = Math.min(1, (st.g - 16) / 20), th = (120 + 40 * extra) * k, tx = cx + sway * .4 + dr * 6;
        c.strokeStyle = '#6b4a30'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, py + 2); c.quadraticCurveTo(cx - 6, py - th * .5, tx, py - th); c.stroke();
        c.lineWidth = 4; c.beginPath(); c.moveTo(cx - 2, py - th * .55); c.lineTo(cx - 28 * k, py - th * .8); c.moveTo(cx + 1, py - th * .7); c.lineTo(cx + 30 * k, py - th * .92); c.stroke();
        const R0 = (52 + 18 * extra) * k, blobs = [[0, -1, 1], [-.75, -.55, .75], [.75, -.6, .78], [-.4, -1.25, .7], [.45, -1.3, .72], [0, -.4, .7]];
        blobs.forEach(([bx, by, br], i) => { c.fillStyle = i % 2 ? dark : green; c.beginPath(); c.arc(tx + bx * R0 + Math.sin(t * 1.2 + i) * 2, py - th + 16 * k + by * R0 * .55 + dr * 10, br * R0 * .62, 0, 7); c.fill(); });
        for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = R0 * (.25 + (i % 4) * .17); flower(tx + Math.cos(a) * rr, py - th - 10 * k + Math.sin(a) * rr * .5 + dr * 10, 6 * k, true); }
      }
      // лейка и капли
      if (can > 0) {
        const lx = cx + 64, ly = h * .2 - 18, a = -.5;
        c.save(); c.translate(lx, ly); c.rotate(a); c.fillStyle = '#7fb8d8'; c.fillRect(0, -16, 46, 32); c.strokeStyle = '#7fb8d8'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 6); c.lineTo(-30, -6); c.stroke(); c.lineWidth = 4; c.beginPath(); c.arc(30, -16, 12, Math.PI, 0); c.stroke(); c.restore();
      }
      c.fillStyle = 'rgba(140,200,255,.85)';
      drops.forEach(d => { if (d.d <= 0) { c.beginPath(); c.ellipse(d.x, d.y, 2, 4, 0, 0, 7); c.fill(); } });
    };
    K.loop((dt, t) => {
      can = Math.max(0, can - dt); wig = Math.max(0, wig - dt * 1.5); wet = Math.max(watered() ? .4 : 0, wet - dt * .05);
      droopT += (droop - droopT) * Math.min(1, dt * 1.5);
      const sillY = h - 28 - Math.min(86, h * .2);
      drops.forEach(d => { if (d.d > 0) d.d -= dt; else { d.y += d.v * dt; d.v += 300 * dt; } });
      drops = drops.filter(d => d.y < sillY);
      if (unlockIn < Infinity) { unlockIn -= dt; if (unlockIn <= 0) { unlockIn = Infinity; dBtn.disabled = false; dBtn.style.setProperty('--p', '100%'); } }
      draw(t);
    });
    info(); greet();
  };

  // ================= 48. Погладь кота =================
  IMPL[48] = (root, api) => {
    style(); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const pets = api.hero?.pets || [];
    const pick = pets.find(p => p.kind === 'cat') || pets.find(p => p.kind === 'dog') || pets[0];
    let pet, spec;
    if (pick) { pet = { kind: pick.kind || 'cat', name: String(pick.name || L('Питомец', 'Pet')) }; try { spec = typeof petBreed === 'function' ? petBreed(pick.breed) : null; } catch { spec = null; } }
    else { pet = { kind: 'cat', name: L('Степлер', 'Stapler'), office: true }; }
    if (!spec || spec.kind !== pet.kind) spec = pet.kind === 'dog' ? { color: '#e2b866', ears: 'floppy' } : pet.kind === 'cat' ? { color: '#9a9aa5', stripes: '#6b6b75', eyes: '#f2c84a', face: '#d8d8de' } : {};
    const nm = api.esc(pet.name);
    const INTRO = pet.office ? L(`Своего питомца пока нет — зато в офисе живёт кот <b>${nm}</b>. Погладьте его!`, `No pet of your own yet — but the office cat <b>${nm}</b> is here. Pet him!`)
      : pet.kind === 'dog' ? L(`<b>${nm}</b> подставляет голову: погладьте!`, `<b>${nm}</b> nudges your hand: pet me!`)
      : pet.kind === 'cat' ? L(`<b>${nm}</b> уже рядом. Проведите пальцем по шёрстке.`, `<b>${nm}</b> is right here. Stroke the fur.`)
      : pet.kind === 'parrot' ? L(`<b>${nm}</b> топчется по плечу — почешите пёрышки.`, `<b>${nm}</b> hops on your shoulder — scratch the feathers.`)
      : L(`<b>${nm}</b> смотрит из аквариума. Погладьте стекло — рыбки это любят.`, `<b>${nm}</b> watches from the tank. Stroke the glass — fish like it.`);
    const HAPPY = pet.kind === 'cat' ? L(`${nm} мурчит, как старый сервер`, `${nm} purrs like an old server`) : pet.kind === 'dog' ? L(`${nm} виляет хвостом изо всех сил`, `${nm} wags the tail like crazy`)
      : pet.kind === 'parrot' ? L(`${nm} радостно чирикает`, `${nm} chirps happily`) : L(`${nm} пускает радостные пузыри`, `${nm} blows happy bubbles`);
    const w = W(root), h = Math.round(Math.min(w * .9, Math.max(280, innerHeight - 340), 420));
    root.innerHTML = `<p class="bgs5-msg">${INTRO}</p><canvas class="bgs5-cv"></canvas>
      <div class="bgs5-hud"><span>${pet.kind === 'cat' ? L('Мурчание', 'Purr') : L('Радость', 'Joy')}</span><span class="pc">0%</span></div><div class="bg48-meter"><i></i></div>
      <div class="bgs5-row"><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), cv = q('canvas'), c = sizeCanvas(cv, w, h), meter = q('.bg48-meter i'), pc = q('.pc'), msg = q('.bgs5-msg');
    let joy = 0, total = 0, full = false, stroking = 0, last = null, hearts = [], blink = 0, purrT = 0, buzzT = 0;
    doneButton(K, api, q('.bgs5-done'), 20, () => ({ won: true, score: null, text: full ? HAPPY + ' 💗' : L(`Минутка нежности: ${nm} 💗`, `A moment of tenderness: ${nm} 💗`) }));
    const S = Math.min(w, h * 1.1) / 400, cx = w / 2, cy = h * .52;
    const inside = (x, y) => ((x - cx) / (175 * S)) ** 2 + ((y - cy) / (170 * S)) ** 2 < 1;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    K.on(cv, 'pointerdown', e => { cv.setPointerCapture?.(e.pointerId); last = pos(e); ac(); });
    K.on(cv, 'pointermove', e => {
      if (!last) return; const p = pos(e), d = Math.hypot(p[0] - last[0], p[1] - last[1]);
      if (inside(...p) && d > 1) {
        stroking = .35; joy = Math.min(100, joy + d / S * .06); total += d;
        if (Math.random() < d / 40) hearts.push({ x: p[0], y: p[1], vy: -40 - Math.random() * 40, vx: (Math.random() - .5) * 30, life: 1.4, s: 14 + Math.random() * 12 });
      }
      last = p;
    });
    const up = () => { last = null; }; K.on(cv, 'pointerup', up); K.on(cv, 'pointercancel', up);
    const col = spec.color || '#9a9aa5', alt = spec.face || spec.alt || '#e8e2d8', eyeC = spec.eyes || '#7ac943';
    const ell = (x, y, rx, ry, f, rot = 0) => { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
    const eyes = (x, y, happy, round) => {
      [-1, 1].forEach(sd => {
        const ex = x + sd * 30 * S;
        if (happy || blink > 0) { c.strokeStyle = '#2a2026'; c.lineWidth = 4 * S; c.lineCap = 'round'; c.beginPath(); c.arc(ex, y + 4 * S, 11 * S, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
        else if (round) { ell(ex, y, 10 * S, 11 * S, '#1c1418'); ell(ex + 3 * S, y - 4 * S, 3 * S, 3 * S, '#fff'); }
        else { ell(ex, y, 12 * S, 13 * S, eyeC); ell(ex, y, 3.5 * S, 11 * S, '#151015'); ell(ex + 4 * S, y - 5 * S, 3 * S, 3 * S, 'rgba(255,255,255,.9)'); }
      });
    };
    const drawCat = t => {
      const br = 1 + Math.sin(t * (stroking > 0 ? 6 : 2)) * .012, hx = cx, hy = cy - 45 * S, happy = joy > 35 && stroking > 0 || full && stroking > 0;
      // хвост
      const tw = Math.sin(t * 1.4) * 22 * S;
      c.strokeStyle = col; c.lineWidth = 20 * S; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + 95 * S, cy + 80 * S); c.bezierCurveTo(cx + 175 * S, cy + 70 * S, cx + 150 * S + tw, cy - 10 * S, cx + 165 * S + tw, cy - 40 * S); c.stroke();
      // тело
      c.save(); c.translate(cx, cy + 50 * S); c.scale(br, br); ell(0, 0, 125 * S, 72 * S, col); if (spec.belly || spec.face) ell(0, 22 * S, 70 * S, 40 * S, alt);
      if (spec.stripes) { c.strokeStyle = spec.stripes; c.lineWidth = 7 * S; c.lineCap = 'round'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 34 * S, -64 * S, 26 * S, Math.PI * .35, Math.PI * .65); c.stroke(); } }
      c.restore();
      ell(cx - 45 * S, cy + 112 * S, 26 * S, 14 * S, alt); ell(cx + 45 * S, cy + 112 * S, 26 * S, 14 * S, alt);
      // уши
      const earC = spec.points || col;
      [-1, 1].forEach(sd => { c.fillStyle = earC; c.beginPath(); c.moveTo(hx + sd * 68 * S, hy - 20 * S); c.lineTo(hx + sd * 58 * S, hy - (spec.ears === 'big' ? 115 : 98) * S); c.lineTo(hx + sd * 16 * S, hy - 62 * S); c.fill();
        c.fillStyle = '#f2a8b8'; c.beginPath(); c.moveTo(hx + sd * 58 * S, hy - 28 * S); c.lineTo(hx + sd * 54 * S, hy - (spec.ears === 'big' ? 98 : 82) * S); c.lineTo(hx + sd * 28 * S, hy - 58 * S); c.fill(); });
      // голова
      ell(hx, hy, 78 * S, 66 * S, col);
      if (spec.face) ell(hx, hy + 22 * S, 52 * S, 38 * S, spec.mask ? (spec.points || '#4a3428') : spec.face);
      if (spec.stripes) { c.strokeStyle = spec.stripes; c.lineWidth = 6 * S; [-18, 0, 18].forEach(o => { c.beginPath(); c.moveTo(hx + o * S, hy - 62 * S); c.lineTo(hx + o * .7 * S, hy - 38 * S); c.stroke(); }); }
      eyes(hx, hy - 6 * S, happy, false);
      c.fillStyle = '#e88aa0'; c.beginPath(); c.moveTo(hx - 8 * S, hy + 14 * S); c.lineTo(hx + 8 * S, hy + 14 * S); c.lineTo(hx, hy + 23 * S); c.fill();
      c.strokeStyle = '#3a2a30'; c.lineWidth = 2.5 * S; c.beginPath(); c.arc(hx - 7 * S, hy + 24 * S, 7 * S, 0, Math.PI); c.arc(hx + 7 * S, hy + 24 * S, 7 * S, 0, Math.PI); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5 * S; [-1, 1].forEach(sd => [-6, 2, 10].forEach(o => { c.beginPath(); c.moveTo(hx + sd * 30 * S, hy + 20 * S + o * .3 * S); c.lineTo(hx + sd * 92 * S, hy + 12 * S + o * 1.6 * S); c.stroke(); }));
      if (spec.collar) { c.strokeStyle = spec.collar; c.lineWidth = 8 * S; c.beginPath(); c.arc(hx, hy + 10 * S, 62 * S, Math.PI * .25, Math.PI * .75); c.stroke(); ell(hx, hy + 72 * S, 7 * S, 7 * S, '#f2c84a'); }
    };
    const drawDog = t => {
      const hx = cx, hy = cy - 45 * S, happy = joy > 35 && stroking > 0 || full && stroking > 0, wag = Math.sin(t * (stroking > 0 ? 18 : 4)) * (stroking > 0 ? .5 : .2);
      c.save(); c.translate(cx + 110 * S, cy + 60 * S); c.rotate(-.9 + wag); c.strokeStyle = col; c.lineWidth = 16 * S; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -(spec.stub ? 25 : 70) * S); c.stroke(); c.restore();
      ell(cx, cy + 50 * S, 125 * S, 72 * S, col); if (spec.belly) ell(cx, cy + 72 * S, 70 * S, 40 * S, spec.alt || '#f6efe4');
      ell(cx - 45 * S, cy + 112 * S, 26 * S, 14 * S, spec.alt || col); ell(cx + 45 * S, cy + 112 * S, 26 * S, 14 * S, spec.alt || col);
      const earC = spec.earColor || col;
      if (spec.ears === 'floppy' || !spec.ears) [-1, 1].forEach(sd => ell(hx + sd * 70 * S, hy + 5 * S, 22 * S, 48 * S, earC, sd * (.35 + Math.sin(t * 3) * .04)));
      else [-1, 1].forEach(sd => { c.fillStyle = earC; c.beginPath(); c.moveTo(hx + sd * 62 * S, hy - 30 * S); c.lineTo(hx + sd * 62 * S, hy - 110 * S); c.lineTo(hx + sd * 18 * S, hy - 60 * S); c.fill(); });
      ell(hx, hy, 72 * S, 64 * S, col);
      if (spec.face) ell(hx, hy + 10 * S, 40 * S, 50 * S, spec.face);
      ell(hx, hy + 26 * S, 36 * S, 26 * S, spec.muzzle || (spec.face || '#f2e6d4'));
      eyes(hx, hy - 12 * S, happy, true);
      ell(hx, hy + 14 * S, 13 * S, 9 * S, '#1c1418');
      if (happy) { c.fillStyle = '#ff7a9a'; c.beginPath(); c.ellipse(hx, hy + 44 * S, 10 * S, 14 * S, 0, 0, Math.PI); c.fill(); }
      c.strokeStyle = '#3a2a30'; c.lineWidth = 2.5 * S; c.beginPath(); c.arc(hx - 8 * S, hy + 30 * S, 8 * S, 0, Math.PI); c.arc(hx + 8 * S, hy + 30 * S, 8 * S, 0, Math.PI); c.stroke();
      if (spec.collar) { c.strokeStyle = spec.collar; c.lineWidth = 8 * S; c.beginPath(); c.arc(hx, hy + 8 * S, 64 * S, Math.PI * .28, Math.PI * .72); c.stroke(); }
    };
    const drawEmoji = t => {
      if (pet.kind === 'fish') { c.fillStyle = 'rgba(80,160,200,.18)'; c.strokeStyle = 'rgba(140,210,240,.5)'; c.lineWidth = 3; c.beginPath(); c.roundRect?.(cx - 160 * S, cy - 130 * S, 320 * S, 260 * S, 30 * S); c.fill(); c.stroke(); }
      c.save(); c.translate(cx + (pet.kind === 'fish' ? Math.sin(t * .8) * 50 * S : 0), cy + Math.sin(t * 2) * 6 * S); if (pet.kind === 'fish' && Math.cos(t * .8) < 0) c.scale(-1, 1);
      c.rotate(stroking > 0 ? Math.sin(t * 10) * .06 : 0); c.fillStyle = '#fff'; c.font = `${170 * S}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(pet.kind === 'parrot' ? '🦜' : pet.kind === 'fish' ? '🐠' : '🐾', 0, 0); c.restore();
    };
    K.loop((dt, t) => {
      stroking = Math.max(0, stroking - dt); blink = blink > 0 ? blink - dt : (Math.random() < dt * .25 ? .15 : 0);
      if (stroking <= 0) joy = Math.max(0, joy - dt * 2);
      if (joy >= 100 && !full) { full = true; msg.innerHTML = HAPPY + ' 💗'; api.sfx.item?.(); for (let i = 0; i < 14; i++) hearts.push({ x: cx + (Math.random() - .5) * 200 * S, y: cy, vy: -60 - Math.random() * 60, vx: (Math.random() - .5) * 60, life: 1.8, s: 16 + Math.random() * 14 }); }
      if (stroking > 0) {
        purrT -= dt; buzzT -= dt;
        if (purrT <= 0) { purrT = pet.kind === 'cat' ? .34 : .9; if (pet.kind === 'cat') { hiss(.3, .05 + joy / 2500, 'lowpass', 140, 1); beep(48, .28, 'sine', .04, 0, 40); } else if (pet.kind === 'parrot') beep(2200 + Math.random() * 800, .07, 'sine', .02, 0, 3000); else if (pet.kind === 'fish') beep(500 + Math.random() * 300, .08, 'sine', .015, 0, 900); }
        if (buzzT <= 0 && joy > 25) { buzzT = 1.1; api.buzz('tap'); }
      }
      c.clearRect(0, 0, w, h);
      const bg = c.createRadialGradient(cx, cy, 20, cx, cy, w * .7); bg.addColorStop(0, '#2a2438'); bg.addColorStop(1, '#14121e'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
      ell(cx, cy + 125 * S, 160 * S, 22 * S, 'rgba(0,0,0,.35)');
      if (pet.kind === 'cat') drawCat(t); else if (pet.kind === 'dog') drawDog(t); else drawEmoji(t);
      c.fillStyle = '#fff'; hearts.forEach(p => { p.life -= dt; p.y += p.vy * dt; p.x += p.vx * dt; c.globalAlpha = Math.max(0, Math.min(1, p.life)); c.font = `${p.s}px system-ui, sans-serif`; c.textAlign = 'center'; c.fillText('💗', p.x, p.y); });
      c.globalAlpha = 1; hearts = hearts.filter(p => p.life > 0);
      meter.style.width = joy.toFixed(1) + '%'; pc.textContent = Math.round(joy) + '%';
    });
  };

  // ================= 49. Пупырка =================
  IMPL[49] = (root, api) => {
    style(); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const w = W(root), cols = Math.max(6, Math.min(10, Math.floor((w - 20) / 44))), gap = 6, sz = Math.floor((w - 20 - gap * cols - (gap + 1) / 2) / (cols + .5));
    const rows = Math.max(6, Math.min(10, Math.floor((Math.max(380, innerHeight - 330)) / (sz + gap))));
    let popped = 0, sheets = 0, left = 0, down = false;
    root.innerHTML = `<div class="bgs5-hud"><span>${L('Лопнуто', 'Popped')}: <span class="bg49-cnt">0</span></span><button type="button" class="bgs5-btn nw">🔄 ${L('Новый лист', 'New sheet')}</button></div>
      <div class="bg49-sheet" style="--s:${sz}px;--g:${gap}px"></div><p class="bgs5-msg">${L('Тапайте или ведите пальцем по пузырькам', 'Tap or swipe across the bubbles')}</p>
      <div class="bgs5-row"><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), sheet = q('.bg49-sheet'), cnt = q('.bg49-cnt'), msg = q('.bgs5-msg'), nw = q('.nw');
    doneButton(K, api, q('.bgs5-done'), 20, () => ({ won: true, score: null, text: L(`Лопнуто пузырьков: ${popped}. Нервы — как новенькие.`, `Bubbles popped: ${popped}. Nerves good as new.`) }));
    const fresh = () => {
      sheets++; left = rows * cols;
      sheet.innerHTML = Array.from({ length: rows }, (_, r) => `<div class="bg49-r${r % 2 ? ' odd' : ''}">${'<span class="bg49-b"></span>'.repeat(r % 2 ? cols - 1 : cols)}</div>`).join('');
      left = sheet.querySelectorAll('.bg49-b').length; nw.classList.remove('on');
      if (sheets > 1) beep(300, .25, 'sine', .02, 0, 500);
    };
    const pop = b => {
      if (!b || !b.classList.contains('bg49-b') || b.classList.contains('p')) return;
      b.classList.add('p'); popped++; left--; cnt.textContent = popped;
      hiss(.045 + Math.random() * .03, .35 + Math.random() * .2, 'bandpass', 900 + Math.random() * 1800, 1.4);
      beep(180 + Math.random() * 140, .05, 'triangle', .05, 0, 90);
      api.buzz('tap');
      if (left === 0) { nw.classList.add('on'); msg.textContent = api.rnd([L('Лист закончился. Ещё один?', 'Sheet done. Another one?'), L('Идеально. Начальник ничего не слышал.', 'Perfect. The boss heard nothing.'), L('Все пузырьки побеждены!', 'Every bubble defeated!')], api.rng); }
      if (popped % 100 === 0) api.toast?.(L(`${popped} пузырьков! Отличный антистресс.`, `${popped} bubbles! Great stress relief.`));
    };
    const at = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && sheet.contains(el) ? el : null; };
    K.on(sheet, 'pointerdown', e => { down = true; sheet.setPointerCapture?.(e.pointerId); pop(at(e)); });
    K.on(sheet, 'pointermove', e => { if (down) pop(at(e)); });
    const up = () => { down = false; }; K.on(sheet, 'pointerup', up); K.on(sheet, 'pointercancel', up);
    nw.onclick = fresh;
    fresh();
  };

  // ================= 50. Дзен-сад =================
  IMPL[50] = (root, api) => {
    style(); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const w = W(root) - 12, h = Math.round(Math.min(w * 1.15, Math.max(280, innerHeight - 340), 560));
    let tool = 'rake', tines = 4, stones = [], strokes = 0, last = null, dir = null;
    root.innerHTML = `<div class="bgs5-row bg50-tools"><button type="button" class="bgs5-btn on" data-t="rake">🪮 ${L('Грабли', 'Rake')}</button><button type="button" class="bgs5-btn" data-t="stone">🪨 ${L('Камень', 'Stone')}</button>
      <button type="button" class="bgs5-btn tn"></button><button type="button" class="bgs5-btn clr">〰️ ${L('Разровнять', 'Smooth')}</button></div>
      <div class="bg50-wrap" style="width:${w + 12}px;height:${h + 12}px"><canvas></canvas><canvas></canvas></div>
      <p class="bgs5-msg">${L('Ведите пальцем — грабли оставляют борозды. Камни кладутся касанием.', 'Drag to rake grooves. Tap to place stones.')}</p>
      <div class="bgs5-row"><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), [cvS, cvT] = root.querySelectorAll('canvas'), sand = sizeCanvas(cvS, w, h), top = sizeCanvas(cvT, w, h), msg = q('.bgs5-msg'), tn = q('.tn');
    doneButton(K, api, q('.bgs5-done'), 20, () => ({ won: true, score: null, text: L(`Сад готов: камней — ${stones.length}. Мысли улеглись, как песок.`, `Garden done: ${stones.length} stones. Thoughts settled like sand.`) }));
    const smooth = () => {
      const g = sand.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d9ccae'); g.addColorStop(1, '#cbbd9c'); sand.fillStyle = g; sand.fillRect(0, 0, w, h);
      for (let i = 0; i < w * h / 40; i++) { sand.fillStyle = Math.random() < .5 ? 'rgba(120,100,70,.10)' : 'rgba(255,250,235,.18)'; sand.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2); }
      stones.forEach(ringStone);
    };
    const groove = (pts) => {
      // тень борозды и светлый край
      [['#b8a785', 3.4, 0], ['#a3926f', 1.6, -1], ['#ece3cb', 1.4, 1.7]].forEach(([col, lw, off]) => {
        sand.strokeStyle = col; sand.lineWidth = lw; sand.lineCap = 'round'; sand.lineJoin = 'round'; sand.beginPath();
        pts.forEach(([x, y, nx, ny], i) => { const X = x + nx * off, Y = y + ny * off; i ? sand.lineTo(X, Y) : sand.moveTo(X, Y); }); sand.stroke();
      });
    };
    const ringStone = s => { for (let k = 1; k <= 3; k++) { const r = s.r + 6 + k * 9, pts = []; for (let a = 0; a <= 64; a++) { const t = a / 64 * Math.PI * 2, nx = Math.cos(t), ny = Math.sin(t); pts.push([s.x + nx * r * 1.05, s.y + ny * r * .92, nx, ny]); } groove(pts); } };
    const drawStones = () => {
      top.clearRect(0, 0, w, h);
      stones.forEach(s => {
        top.fillStyle = 'rgba(40,30,20,.35)'; top.beginPath(); top.ellipse(s.x + 4, s.y + 6, s.r * 1.05, s.r * .8, s.a, 0, 7); top.fill();
        const g = top.createRadialGradient(s.x - s.r * .35, s.y - s.r * .4, s.r * .1, s.x, s.y, s.r * 1.1); g.addColorStop(0, s.c[0]); g.addColorStop(1, s.c[1]);
        top.fillStyle = g; top.beginPath(); top.ellipse(s.x, s.y, s.r * 1.05, s.r * .85, s.a, 0, 7); top.fill();
      });
    };
    const setTn = () => { tn.textContent = `⋮ ${tines} ${L(tines < 5 ? 'зубца' : 'зубцов', 'tines')}`; };
    tn.onclick = () => { tines = tines >= 5 ? 3 : tines + 1; setTn(); };
    root.querySelectorAll('[data-t]').forEach(b => { b.onclick = () => { tool = b.dataset.t; root.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x === b)); msg.textContent = tool === 'stone' ? L('Коснитесь песка — положить камень, коснитесь камня — убрать.', 'Tap sand to place a stone, tap a stone to remove it.') : L('Ведите пальцем — грабли оставляют борозды.', 'Drag to rake grooves.'); }; });
    q('.clr').onclick = () => { smooth(); hiss(.9, .05, 'lowpass', 900, .7); };
    const pos = e => { const r = cvS.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const sp = () => Math.max(9, Math.min(14, w / 34));
    let rakeT = 0;
    K.on(cvS, 'pointerdown', e => {
      cvS.setPointerCapture?.(e.pointerId); const p = pos(e);
      if (tool === 'stone') {
        const i = stones.findIndex(s => Math.hypot(s.x - p[0], s.y - p[1]) < s.r + 6);
        if (i >= 0) { stones.splice(i, 1); drawStones(); beep(160, .12, 'sine', .04); return; }
        if (stones.length >= 7) { msg.textContent = L('Камней достаточно — в саду нужна пустота.', 'Enough stones — a garden needs emptiness.'); return; }
        const r = 14 + Math.random() * 14, gs = [['#9a968e', '#4e4a46'], ['#8a8f94', '#3e4248'], ['#a39a8a', '#5a5246']][Math.floor(Math.random() * 3)];
        const s = { x: p[0], y: p[1], r, a: Math.random() * 3, c: gs }; stones.push(s); ringStone(s); drawStones(); beep(110, .18, 'sine', .07, 0, 80); api.buzz('tap');
        return;
      }
      last = p; dir = null;
    });
    K.on(cvS, 'pointermove', e => {
      if (!last || tool !== 'rake') return;
      const p = pos(e), dx = p[0] - last[0], dy = p[1] - last[1], d = Math.hypot(dx, dy);
      if (d < 4) return;
      let ux = dx / d, uy = dy / d;
      if (dir) { ux = dir[0] * .7 + ux * .3; uy = dir[1] * .7 + uy * .3; const m = Math.hypot(ux, uy) || 1; ux /= m; uy /= m; }
      const prev = dir || [ux, uy]; dir = [ux, uy];
      const nx = -uy, ny = ux, pnx = -prev[1], pny = prev[0], s = sp();
      for (let i = 0; i < tines; i++) { const o = (i - (tines - 1) / 2) * s; groove([[last[0] + pnx * o, last[1] + pny * o, pnx, pny], [p[0] + nx * o, p[1] + ny * o, nx, ny]]); }
      last = p; strokes++;
      rakeT -= d; if (rakeT <= 0) { rakeT = 60; hiss(.25, .02, 'bandpass', 2400, .8); }
    });
    const up = () => { last = null; }; K.on(cvS, 'pointerup', up); K.on(cvS, 'pointercancel', up);
    smooth(); setTn();
    // три камня для начала — чтобы сад не был пустым
    [[.3, .32], [.68, .62]].forEach(([fx, fy], i) => { const s = { x: w * fx, y: h * fy, r: 18 + i * 6, a: i, c: ['#9a968e', '#4e4a46'] }; stones.push(s); ringStone(s); });
    drawStones();
  };
})();
