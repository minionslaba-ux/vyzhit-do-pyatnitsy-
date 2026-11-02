// «☕ Разминка», игры 52–54: «Кофе против завала», «Прятки от коллег», «Умный вид на созвоне».
// (51 — «Минута дыхания» — живёт в js/pause.js.) Контракт: BREAK_IMPL[n] = (root, api) => { … } — см. js/break.js.
(() => {
  'use strict';
  const B = window.BREAK_IMPL = window.BREAK_IMPL || {};
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const RM = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const CSS = `
.bg6-hud{display:flex;justify-content:space-between;align-items:center;gap:6px;width:100%;min-height:36px;padding:0 2px 8px;font-weight:800;font-size:13px;color:var(--text);font-variant-numeric:tabular-nums;box-sizing:border-box;flex-wrap:wrap}
.bg6-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 10px 5px 8px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.13);white-space:nowrap}
.bg6-pill b{color:var(--cyan-l);font-size:15px}.bg6-pill small{color:var(--text-2);font-weight:700;font-size:12px}
.bg6-pill.hot{border-color:rgba(255,176,46,.6);background:linear-gradient(180deg,rgba(255,176,46,.3),rgba(255,176,46,.08))}
.bg6-pill.bad{border-color:rgba(255,59,107,.6);background:linear-gradient(180deg,rgba(255,59,107,.28),rgba(255,59,107,.06))}
.bg6-btn{padding:11px 16px;border-radius:16px;border:1.5px solid rgba(var(--c-rgb),.75);background:linear-gradient(180deg,rgba(var(--c-rgb),.3),rgba(var(--c-rgb),.08));color:#fff;font:inherit;font-weight:800;font-size:15px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.bg6-btn:active:not(:disabled){transform:scale(.96)}.bg6-btn:disabled{opacity:.4;cursor:default}
.bg6-over{position:absolute;inset:0;z-index:5;display:flex;align-items:center;overflow:auto;justify-content:center;padding:14px;background:rgba(7,7,16,.74);border-radius:20px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.bg6-card{width:100%;max-width:320px;padding:18px 16px 16px;border-radius:20px;text-align:center;color:#f2f0ff;background:linear-gradient(170deg,#24264a,#15162b);border:1px solid rgba(255,255,255,.14);box-shadow:0 18px 40px rgba(0,0,0,.6)}
.bg6-card .big{display:block;font-size:40px;line-height:1;margin-bottom:6px}.bg6-card h3{margin:0 0 8px;font-size:18px}
.bg6-card p{margin:6px 0;font-size:13px;line-height:1.35;color:#cfcbe8;text-align:left}.bg6-card .bg6-btn{width:100%;margin-top:10px}
.bg6-shk{animation:bg6-shk .32s ease-out}
@keyframes bg6-shk{15%{transform:translate(-6px,2px)}35%{transform:translate(5px,-2px)}55%{transform:translate(-3px,1px)}75%{transform:translate(2px,0)}}
@keyframes bg6-pop{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}20%{transform:translate(-50%,-50%) scale(1.15);opacity:1}to{transform:translate(-50%,-140%);opacity:0}}
.bg6-float{position:absolute;left:50%;top:50%;z-index:4;pointer-events:none;font-weight:900;font-size:18px;color:#d4ff3a;white-space:nowrap;text-shadow:0 2px 0 rgba(0,0,0,.6),0 0 10px rgba(0,0,0,.6);animation:bg6-pop .9s ease-out forwards}
.bg6-float.bad{color:#ff6b8b}
/* 52 */
.bg52-wrap{position:relative;width:100%}
.bg52-board{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;border-radius:20px;background:linear-gradient(180deg,#171a2c,#0e0f1c);border:1px solid rgba(255,255,255,.1);box-sizing:border-box;position:relative;overflow:hidden}
.bg52-board::before{content:'';position:absolute;left:8px;right:8px;top:8px;height:3px;border-radius:2px;background:repeating-linear-gradient(90deg,#ff3b6b 0 10px,transparent 10px 18px);opacity:.55}
.bg52-col{display:flex;flex-direction:column-reverse;gap:4px;border-radius:12px;background:rgba(255,255,255,.025);box-shadow:inset 0 0 0 1px rgba(255,255,255,.05);padding:3px;min-width:0;transition:box-shadow .2s}
.bg52-col.warn{box-shadow:inset 0 0 0 2px rgba(255,59,107,.65),0 0 16px rgba(255,59,107,.35)}
.bg52-t{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:9px;background:linear-gradient(180deg,#f6f4ff,#d9d5ee);color:#1b1830;font-weight:800;font-size:10.5px;line-height:1.05;text-align:center;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;overflow:hidden;padding:2px;animation:bg52-drop .32s cubic-bezier(.3,1.4,.6,1)}
.bg52-t span{font-size:17px;line-height:1}.bg52-t.boss{background:linear-gradient(180deg,#ffe3a6,#ffb02e)}.bg52-t.boss.hit{background:linear-gradient(180deg,#fff0cc,#ffd27a)}
.bg52-t.done{animation:bg52-done .25s ease-in forwards;pointer-events:none}
@keyframes bg52-drop{from{transform:translateY(-260%);opacity:.3}}
@keyframes bg52-done{to{transform:scale(.3) rotate(-14deg);opacity:0}}
.bg52-row{display:flex;gap:10px;align-items:center;justify-content:center;margin-top:10px}
.bg52-row small{color:var(--text-2);font-size:12px;line-height:1.25;max-width:55%}
.bg52-cup.ready{border-color:#d4ff3a;box-shadow:0 0 18px rgba(212,255,58,.35)}
.bg52-shaky .bg52-board{animation:bg52-jit .12s infinite}
@keyframes bg52-jit{25%{transform:translate(1px,-1px)}50%{transform:translate(-1px,1px)}75%{transform:translate(1px,1px)}}
/* 53 */
.bg53-cv{display:block;margin:0 auto;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:#0b0b16;touch-action:none;box-shadow:0 12px 30px rgba(0,0,0,.5)}
.bg53-wrap{position:relative;width:100%}
.bg53-pad{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px}
.bg53-pad .bg6-btn{padding:10px 0;font-size:18px}.bg53-pad .bg6-btn.wait{font-size:13px}
/* 54 */
.bg54-wrap{position:relative;width:100%}
.bg54-call{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;border-radius:18px;background:#0d0e1a;border:1px solid rgba(255,255,255,.1)}
.bg54-tile{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;aspect-ratio:4/3;border-radius:12px;background:radial-gradient(120% 100% at 50% 20%,#2b2e52,#15162b);overflow:hidden;transition:box-shadow .2s}
.bg54-tile .f{font-size:42px;line-height:1;transition:transform .2s}.bg54-tile .n{position:absolute;left:6px;bottom:5px;font-size:10.5px;font-weight:800;color:#cfcbe8;background:rgba(0,0,0,.45);padding:1px 6px;border-radius:6px}
.bg54-tile.talk{box-shadow:inset 0 0 0 2px #2de28a}.bg54-tile.me{background:radial-gradient(120% 100% at 50% 20%,#3a2d55,#1b1530)}
.bg54-tile.me.look{box-shadow:inset 0 0 0 3px #ffb02e,0 0 18px rgba(255,176,46,.45)}
.bg54-say{position:absolute;left:8px;right:8px;top:8px;z-index:3;padding:9px 12px 12px;border-radius:14px;background:#f6f4ff;color:#1b1830;font-weight:800;font-size:14px;line-height:1.25;text-align:center;box-shadow:0 8px 20px rgba(0,0,0,.5)}
.bg54-say i{position:absolute;left:10px;right:10px;bottom:5px;height:4px;border-radius:2px;background:linear-gradient(90deg,#ff3b6b,#ffb02e 45%,#2de2e6);transform-origin:left}
.bg54-say.trap{background:#fff2d6}.bg54-bub{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:2;max-width:94%;padding:4px 8px;border-radius:10px;background:#2de28a;color:#062015;font-size:10.5px;font-weight:800;line-height:1.2;text-align:center}
.bg54-meter{display:flex;align-items:center;gap:8px;margin:10px 2px 0;font-size:12px;font-weight:800;color:var(--text-2)}
.bg54-meter u{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;text-decoration:none}
.bg54-meter u b{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#ff3b6b,#ffb02e 40%,#2de28a);transition:width .2s}
.bg54-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.bg54-btns .bg6-btn{padding:12px 6px;font-size:14px;line-height:1.15}
@media (prefers-reduced-motion:reduce){.bg52-t,.bg52-t.done,.bg6-shk,.bg52-shaky .bg52-board{animation:none}.bg6-float{animation-duration:.01s}}
`;
  const css = () => { if (document.getElementById('bg-style-6')) return; const s = document.createElement('style'); s.id = 'bg-style-6'; s.textContent = CSS; document.head.append(s); };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const on = (api, t, ty, fn, o) => { t.addEventListener(ty, fn, o); api.onExit(() => t.removeEventListener(ty, fn, o)); };
  const later = (api, ms, fn) => { const id = setTimeout(fn, ms); api.onExit(() => clearTimeout(id)); };
  const pill = (ico, html, cls = '') => `<span class="bg6-pill ${cls}"><i>${ico}</i>${html}</span>`;
  const tap = (api, k = 'tap') => { try { api.buzz?.(k); } catch {} };
  const shake = n => { if (RM()) return; n.classList.remove('bg6-shk'); void n.offsetWidth; n.classList.add('bg6-shk'); };
  const float = (api, host, s, bad) => { const p = el('div', 'bg6-float' + (bad ? ' bad' : ''), s); host.append(p); later(api, 950, () => p.remove()); };
  function loop(api, fn) {
    let raf = 0, last = 0;
    const tick = t => { raf = requestAnimationFrame(tick); if (document.hidden) { last = 0; return; } const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t; fn(dt); };
    raf = requestAnimationFrame(tick);
    api.onExit(() => cancelAnimationFrame(raf));
  }
  // Карточка с правилами и кнопкой «Начать» поверх игры
  const intro = (api, host, ico, title, lines, go) => {
    const o = el('div', 'bg6-over'), c = el('div', 'bg6-card', `<span class="big">${ico}</span><h3>${title}</h3>${lines.map(x => `<p>${x}</p>`).join('')}`);
    const b = el('button', 'bg6-btn', '▶ ' + api.L('Начать', 'Start')); b.type = 'button'; c.append(b); o.append(c); host.append(o);
    b.onclick = () => { o.remove(); go(); };
  };
  const availH = (node, below, min, max) => clamp((window.innerHeight || 700) - node.getBoundingClientRect().top - below, min, max);

  // =====================================================================
  // 52. Кофе против завала — задачи падают в 4 стопки; тап — сделать, ☕ — снести нижние ряды.
  //     Кофе мало, а две чашки подряд — руки трясутся. Цель — продержаться 60 секунд без завала.
  // =====================================================================
  B[52] = (root, api) => {
    const { L } = api; css();
    const DUR = 60, ROWS = 7, CUPS = 3, REFILL = 18, SHAKE = 4;  // баланс: бот с 2 тапами/с выигрывает ~90%, с 1,5 — ~30%
    const TASKS = [['📄', 'Отчёт', 'Report'], ['📊', 'Таблица', 'Sheet'], ['✉️', 'Письмо', 'Email'], ['📞', 'Звонок', 'Call'], ['🗂️', 'Архив', 'Archive'], ['📝', 'Протокол', 'Minutes'], ['🧾', 'Счёт', 'Invoice'], ['📎', 'Справка', 'Memo']];
    const wrap = el('div', 'bg52-wrap'), hud = el('div', 'bg6-hud'), board = el('div', 'bg52-board');
    wrap.append(board); root.append(hud, wrap);
    const row = el('div', 'bg52-row'), cupBtn = el('button', 'bg6-btn bg52-cup'), note = el('small', '', L('☕ сносит два нижних ряда. Две чашки подряд — руки трясутся.', '☕ clears the two bottom rows. Two cups in a row — shaky hands.'));
    cupBtn.type = 'button'; row.append(cupBtn, note); root.append(row);
    const H = availH(board, 96, 320, 560); board.style.height = H + 'px';
    const cellH = Math.floor((H - 16 - 6) / ROWS) - 4;
    const cols = [...Array(4)].map(() => { const c = el('div', 'bg52-col'); board.append(c); return c; });
    let state = 'ready', t = 0, spawn = 0.4, done = 0, cups = CUPS, refill = REFILL, lastCup = -99, shakyT = 0;
    const upd = () => {
      const left = Math.max(0, Math.ceil(DUR - t));
      hud.innerHTML = pill('⏱', `<b>${left}</b><small>${L('с', 's')}</small>`, left <= 10 && state === 'run' ? 'hot' : '') + (shakyT > 0 ? pill('🫨', `<small>${L('руки трясутся', 'shaky hands')}</small>`, 'bad') : '') + pill('✅', `<small>${L('Сделано', 'Done')}</small><b>${done}</b>`);
      cupBtn.innerHTML = `☕ ×${cups}`; cupBtn.disabled = state !== 'run' || !cups; cupBtn.classList.toggle('ready', cups > 0);
      cols.forEach(c => c.classList.toggle('warn', c.querySelectorAll('.bg52-t:not(.done)').length >= ROWS - 2));
    };
    const finish = (won, why) => {
      if (state === 'over') return; state = 'over'; upd();
      api.end({ score: done, won, text: won ? L(`Неделя не утонула в задачах! Сделано: ${done}.`, `You didn’t drown in tasks! Done: ${done}.`) : why });
    };
    const kill = node => { node.classList.add('done'); later(api, 260, () => node.remove()); };
    const add = () => {
      const live = c => c.querySelectorAll('.bg52-t:not(.done)').length;
      const free = cols.filter(c => live(c) < ROWS), pick = free.length ? api.rnd(free) : null;
      if (!pick) { shake(board); tap(api, 'lose'); return finish(false, L(`Завал! Стопка задач упёрлась в потолок. Сделано: ${done}.`, `Swamped! A task pile hit the ceiling. Done: ${done}.`)); }
      const boss = t > 8 && api.rng() < 0.18, d = boss ? ['👔', 'Срочно от босса', 'Urgent: boss'] : api.rnd(TASKS);
      const n = el('div', 'bg52-t' + (boss ? ' boss' : ''), `<span>${d[0]}</span>${api.esc(L(d[1], d[2]))}`);
      n.style.height = cellH + 'px'; n._hp = boss ? 2 : 1; n._v = boss ? 3 : 1;
      pick.append(n);
      on(api, n, 'pointerdown', e => {
        e.preventDefault(); if (state !== 'run' || n.classList.contains('done')) return;
        if (shakyT > 0 && api.rng() < 0.5) { float(api, n, L('мимо!', 'miss!'), true); return; }
        n._hp--; tap(api);
        if (n._hp > 0) { n.classList.add('hit'); api.sfx.click?.(); return; }
        done += n._v; api.sfx.stapler?.(); float(api, n, '+' + n._v); kill(n); upd();
      });
    };
    cupBtn.onclick = () => {
      if (state !== 'run' || !cups) return;
      cups--; if (t - lastCup < 8) { shakyT = SHAKE; tap(api, 'danger'); } lastCup = t;
      let n = 0;
      cols.forEach(c => [...c.querySelectorAll('.bg52-t:not(.done)')].slice(0, 2).forEach(x => { kill(x); n++; }));
      done += n; api.sfx.coins?.(); if (n) float(api, wrap, `☕ +${n}`); upd();
    };
    intro(api, wrap, '☕', L('Кофе против завала', 'Coffee vs the pile-up'), [
      L('Задачи сыплются в четыре стопки. <b>Тапайте</b> по задаче — она сделана. Срочное от босса 👔 — в два тапа, но даёт +3.', 'Tasks drop into four piles. <b>Tap</b> a task to get it done. Urgent ones from the boss 👔 take two taps but give +3.'),
      L('<b>☕ Кофе</b> сносит два нижних ряда во всех стопках. Чашек три, новая — каждые 18 секунд. Две чашки за 8 секунд — руки трясутся, тапы промахиваются.', '<b>☕ Coffee</b> clears the two bottom rows of every pile. You have three cups, one refills every 18 s. Two cups within 8 s — shaky hands, taps miss.'),
      L('Продержитесь <b>60 секунд</b>, чтобы ни одна стопка не упёрлась в потолок.', 'Last <b>60 seconds</b> without any pile hitting the ceiling.'),
    ], () => { state = 'run'; api.sfx.sms?.(); upd(); });
    loop(api, dt => {
      if (state !== 'run') return;
      t += dt; spawn -= dt; if (shakyT > 0) { shakyT -= dt; wrap.classList.add('bg52-shaky'); } else wrap.classList.remove('bg52-shaky');
      if (cups < CUPS) { refill -= dt; if (refill <= 0) { cups++; refill = REFILL; api.sfx.pop?.(); } } else refill = REFILL;
      if (spawn <= 0) { add(); spawn = Math.max(0.28, 0.85 - t * 0.011); }
      if (t >= DUR) return finish(true);
      upd();
    });
    upd();
  };

  // =====================================================================
  // 53. Прятки от коллег — пошаговый «стелс» по опенспейсу: доберитесь до кухни ☕, не попав в поле зрения
  //     коллег с «есть минутка?». 🪴 — укрытие. Три этажа, три попытки.
  // =====================================================================
  // Карты 7×10: # — стол/стена, P — фикус (укрытие), S — старт, E — кухня. Маршруты коллег ходят туда-обратно.
  const LEVELS53 = [
    { map: ['...E...', '.#...#.', '.#.P.#.', '.......', '##.#.##', '.......', '.P.#.P.', '.......', '#.#.#.#', '...S...'],
      npc: [{ path: [[0, 3], [6, 3]], i: 0 }, { path: [[6, 5], [0, 5]], i: 1 }] },
    { map: ['E......', '..#.#..', 'P.#.#.P', '.......', '.##.##.', '.......', '#.#P#.#', '.......', '.#...#.', '...S...'],
      npc: [{ path: [[0, 3], [6, 3]], i: 2 }, { path: [[3, 0], [3, 5]], i: 0 }, { path: [[6, 7], [0, 7]], i: 1 }] },
    { map: ['......E', '.#.#.#.', '.......', 'P#.#.#P', '.......', '.#.P.#.', '.......', '##.#.##', '.......', 'S......'],
      npc: [{ path: [[0, 2], [6, 2]], i: 1 }, { path: [[6, 4], [0, 4]], i: 2 }, { path: [[0, 6], [6, 6]], i: 0 }, { path: [[2, 8], [6, 8]], i: 3 }] },
  ];
  const WHO53 = [['🧑‍💼', 'HR с опросником', 'HR with a survey'], ['👩‍🦰', 'Алла из бухгалтерии', 'Alla from Accounting'], ['🧔', 'Коллега с «быстрым вопросом»', 'Coworker with a “quick question”'], ['👨‍💻', 'Сисадмин', 'Sysadmin']];
  // Маршрут: отрезок по прямой между двумя точками, туда и обратно
  const route53 = ([[x1, y1], [x2, y2]]) => {
    const pts = [], dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1), n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let k = 0; k <= n; k++) pts.push([x1 + dx * k, y1 + dy * k]);
    return pts.concat(pts.slice(1, -1).reverse());
  };
  const VIEW53 = 3;
  // Клетки, которые видит коллега: своя + до 3 вперёд, столы закрывают обзор
  const sees53 = (map, r, step) => {
    const [x, y] = r[step % r.length], [nx, ny] = r[(step + 1) % r.length], dx = nx - x, dy = ny - y, out = [[x, y]];
    for (let k = 1; k <= VIEW53; k++) { const cx = x + dx * k, cy = y + dy * k; if (cy < 0 || cy >= map.length || cx < 0 || cx >= 7 || map[cy][cx] === '#') break; out.push([cx, cy]); }
    return out;
  };
  B[53] = (root, api) => {
    const { L } = api; css();
    const wrap = el('div', 'bg53-wrap'), hud = el('div', 'bg6-hud'), cv = el('canvas', 'bg53-cv');
    wrap.append(cv); root.append(hud, wrap);
    const pad = el('div', 'bg53-pad');
    const btn = (s, dx, dy, cls = '') => { const b = el('button', 'bg6-btn ' + cls, s); b.type = 'button'; b.onclick = () => move(dx, dy); pad.append(b); return b; };
    btn('⬅', -1, 0); btn('⬆', 0, -1); btn(L('✋ ждать', '✋ wait'), 0, 0, 'wait'); btn('⬇', 0, 1); btn('➡', 1, 0);
    root.append(pad);
    const W = Math.round(clamp(root.clientWidth || 340, 280, 460));
    const Hmax = availH(cv, 76, 300, 700), cell = Math.floor(Math.min(W / 7, Hmax / 10)), CW = cell * 7, CH = cell * 10;
    const d = Math.min(2.5, window.devicePixelRatio || 1), g = cv.getContext('2d');
    cv.width = CW * d; cv.height = CH * d; cv.style.width = CW + 'px'; cv.style.height = CH + 'px'; g.setTransform(d, 0, 0, d, 0, 0);
    let lv = 0, lives = 3, moves = 0, step = 0, me = [0, 0], state = 'ready', caughtBy = -1, L0 = null, routes = [];
    const load = () => {
      L0 = LEVELS53[lv]; routes = L0.npc.map(n => route53(n.path)); step = 0; caughtBy = -1;
      L0.map.forEach((row, y) => { const x = row.indexOf('S'); if (x >= 0) me = [x, y]; });
    };
    const npcAt = (k, s = step) => routes[k][(s + L0.npc[k].i) % routes[k].length];
    const visible = () => { const out = []; routes.forEach((r, k) => out.push(...sees53(L0.map, r, step + L0.npc[k].i).map(c => [...c, k]))); return out; };
    const spotted = () => {
      if (L0.map[me[1]][me[0]] === 'P') { for (let k = 0; k < routes.length; k++) { const [x, y] = npcAt(k); if (x === me[0] && y === me[1]) return k; } return -1; }
      const v = visible().find(([x, y]) => x === me[0] && y === me[1]); return v ? v[2] : -1;
    };
    const upd = () => { hud.innerHTML = pill('🏢', `<small>${L('Этаж', 'Floor')}</small><b>${lv + 1}</b><small>/3</small>`) + pill('❤️', `<b>${'❤'.repeat(lives)}</b>`, lives === 1 ? 'bad' : '') + pill('👣', `<b>${moves}</b>`); };
    const emo = (s, x, y, size) => { g.font = `${Math.round(size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); };
    const draw = () => {
      g.clearRect(0, 0, CW, CH);
      L0.map.forEach((row, y) => [...row].forEach((ch, x) => {
        const px = x * cell, py = y * cell;
        g.fillStyle = (x + y) % 2 ? '#141629' : '#181a30'; g.fillRect(px, py, cell, cell);
        if (ch === '#') { g.fillStyle = '#5a3d2b'; g.fillRect(px + 2, py + 2, cell - 4, cell - 4); g.fillStyle = '#6e4c36'; g.fillRect(px + 2, py + 2, cell - 4, cell * .3); emo('🖥️', px + cell / 2, py + cell * .58, cell * .5); }
        if (ch === 'P') emo('🪴', px + cell / 2, py + cell / 2, cell * .7);
        if (ch === 'E') { g.fillStyle = 'rgba(45,226,138,.18)'; g.fillRect(px, py, cell, cell); emo('☕', px + cell / 2, py + cell / 2, cell * .62); }
      }));
      if (state !== 'ready') {
        g.fillStyle = 'rgba(255,59,107,.24)';
        visible().forEach(([x, y]) => { if (L0.map[y][x] !== 'P') g.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2); });
      }
      routes.forEach((_, k) => { const [x, y] = npcAt(k); emo(WHO53[L0.npc[k].i % WHO53.length][0], x * cell + cell / 2, y * cell + cell / 2, cell * .7); });
      const hid = L0.map[me[1]][me[0]] === 'P';
      g.save(); g.globalAlpha = hid ? .55 : 1; emo(caughtBy >= 0 ? '😳' : hid ? '🫣' : '🙂', me[0] * cell + cell / 2, me[1] * cell + cell / 2, cell * .66); g.restore();
      if (caughtBy >= 0) {
        const [x, y] = npcAt(caughtBy), s = L('«Есть минутка?»', '“Got a minute?”');
        g.font = `900 ${Math.round(cell * .32)}px Nunito, sans-serif`; const w = g.measureText(s).width + 14, bx = clamp(x * cell + cell / 2 - w / 2, 2, CW - w - 2), by = Math.max(2, y * cell - cell * .5);
        g.fillStyle = '#f6f4ff'; g.beginPath(); g.roundRect ? g.roundRect(bx, by, w, cell * .48, 8) : g.rect(bx, by, w, cell * .48); g.fill();
        g.fillStyle = '#1b1830'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, bx + w / 2, by + cell * .24);
      }
    };
    const caught = k => {
      caughtBy = k; state = 'caught'; lives--; upd(); draw(); tap(api, 'lose'); api.sfx.buzzer?.(); shake(cv);
      const who = WHO53[L0.npc[k].i % WHO53.length];
      later(api, 1300, () => {
        if (lives <= 0) return api.end({ score: lv * 100, won: false, text: L(`Попались: ${who[1]} — «Есть минутка?». Это надолго. Пройдено этажей: ${lv}.`, `${who[2]} caught you — this will take a while. Floors cleared: ${lv}.`) });
        load(); state = 'run'; draw();
      });
    };
    function move(dx, dy) {
      if (state !== 'run') return;
      const nx = me[0] + dx, ny = me[1] + dy;
      if (nx < 0 || nx > 6 || ny < 0 || ny > 9 || L0.map[ny][nx] === '#') { shake(cv); return; }
      const before = routes.map((_, k) => npcAt(k));
      me = [nx, ny]; moves++; api.sfx.tick?.();
      let k = spotted(); if (k >= 0) { upd(); return caught(k); }
      if (L0.map[ny][nx] === 'E') {
        api.sfx.coins?.(); tap(api, 'item');
        if (lv === 2) { state = 'over'; upd(); draw(); return api.end({ score: Math.max(300, 600 - moves * 3), won: true, text: L(`До кухни незамеченными — три этажа подряд! Шагов: ${moves}.`, `Reached the kitchen unseen — three floors in a row! Steps: ${moves}.`) }); }
        lv++; lives = Math.min(3, lives + 1); load(); upd(); draw(); api.toast(L('Этаж пройден! +1 попытка', 'Floor cleared! +1 try')); return;
      }
      step++;
      k = routes.findIndex((_, j) => { const [x, y] = npcAt(j), [bx, by] = before[j]; return x === me[0] && y === me[1] || (bx === nx && by === ny && x === me[0] - dx && y === me[1] - dy); });
      if (k < 0) k = spotted();
      upd(); draw(); if (k >= 0) caught(k);
    }
    on(api, cv, 'pointerdown', e => {
      e.preventDefault(); const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * 7), y = Math.floor((e.clientY - r.top) / r.height * 10);
      const dx = x - me[0], dy = y - me[1]; if (!dx && !dy) return move(0, 0);
      Math.abs(dx) >= Math.abs(dy) ? move(Math.sign(dx), 0) : move(0, Math.sign(dy));
    });
    on(api, document, 'keydown', e => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], ' ': [0, 0] }[e.key]; if (m && state === 'run') { e.preventDefault(); move(...m); } });
    load(); upd(); draw();
    intro(api, wrap, '🫣', L('Прятки от коллег', 'Hide from coworkers'), [
      L('Доберитесь до кухни <b>☕</b>. По опенспейсу ходят коллеги с «есть минутка?» — <b>красные клетки</b> они видят.', 'Get to the kitchen <b>☕</b>. Coworkers with “got a minute?” roam the open space — they see the <b>red cells</b>.'),
      L('Вы ходите — они шагают. За <b>🪴 фикусом</b> вас не видно, столы закрывают обзор. Можно <b>переждать</b> на месте.', 'You move — they step. Behind a <b>🪴 plant</b> you’re invisible, desks block the view. You can also <b>wait</b>.'),
      L('Ходите кнопками, стрелками или тапом по полю. Три этажа, три попытки, за каждый этаж +1.', 'Move with the buttons, arrow keys or by tapping the floor. Three floors, three tries, +1 per floor.'),
    ], () => { state = 'run'; upd(); draw(); });
  };
  B[53].levels = LEVELS53; B[53].route = route53; B[53].sees = sees53;  // для проверки проходимости (tools)

  // =====================================================================
  // 54. Умный вид на созвоне — реагировать на реплики босса правильной кнопкой, не уснуть и не вызваться добровольцем.
  // =====================================================================
  B[54] = (root, api) => {
    const { L } = api; css();
    const DUR = 60, STRIKES = 3;
    const name = (window.prefs?.name || '').split(' ')[0] || L('коллега', 'colleague');
    const P = [
      ['nod', 'Все согласны?', 'Everyone agree?'], ['nod', 'Логично же?', 'Makes sense, right?'], ['nod', 'Двигаемся дальше?', 'Shall we move on?'], ['nod', 'Все видят мой экран?', 'Can everyone see my screen?'],
      ['talk', `${name}, ваше мнение?`, `${name}, your thoughts?`], ['talk', 'А что скажет наш эксперт?', 'What does our expert think?'], ['talk', `${name}, вы с нами?`, `${name}, are you with us?`],
      ['look', '👀 Босс смотрит в камеру', '👀 The boss is looking at the camera'], ['look', '👀 Босс включил «галерею»', '👀 The boss switched to gallery view'],
      ['trap', 'Вопросы есть?', 'Any questions?'], ['trap', 'Кто возьмёт эту задачу?', 'Who’ll take this task?'], ['trap', 'Есть добровольцы на субботу?', 'Any volunteers for Saturday?'],
    ];
    const SMART = [['Давайте синхронизируемся', 'Let’s sync up'], ['Хороший поинт', 'Good point'], ['Вынесем в отдельную встречу', 'Let’s take it offline'], ['Тут важно не потерять фокус', 'We mustn’t lose focus here'], ['Предлагаю зафиксировать риски', 'I suggest we log the risks'], ['Поддерживаю предыдущего оратора', 'I second the previous speaker']];
    const FAIL = { trap: [L('Отлично, задача ваша!', 'Great, it’s yours!'), L('Тогда задержимся ещё на час', 'Then we’ll stay another hour'), L('Записываю вас на субботу', 'Putting you down for Saturday')] };
    const wrap = el('div', 'bg54-wrap'), hud = el('div', 'bg6-hud'), call = el('div', 'bg54-call');
    const tiles = [['👔', L('Босс', 'Boss')], ['👩‍💼', L('Марина', 'Marina')], ['👨‍💻', L('Олег', 'Oleg')], ['🙂', L('Вы', 'You')]].map(([f, n], i) => { const t = el('div', 'bg54-tile' + (i === 3 ? ' me' : ''), `<span class="f">${f}</span><span class="n">${api.esc(n)}</span>`); call.append(t); return t; });
    const meter = el('div', 'bg54-meter', `<span>😪 ${L('Бодрость', 'Alertness')}</span><u><b></b></u>`), btns = el('div', 'bg54-btns');
    wrap.append(call, meter, btns); root.append(hud, wrap);
    const KEYS = [['nod', '🙂 ' + L('Кивнуть', 'Nod')], ['talk', '💬 ' + L('Сказать умное', 'Say smth smart')], ['look', '🧐 ' + L('Умный вид', 'Look smart')], ['sip', '☕ ' + L('Глоток кофе', 'Sip coffee')]];
    const B2 = {}; KEYS.forEach(([k, s]) => { const b = el('button', 'bg6-btn', s); b.type = 'button'; b.onclick = () => press(k); btns.append(b); B2[k] = b; });
    let state = 'ready', t = 0, ok = 0, bad = 0, awake = 100, cur = null, gap = 1.2, say = null, bub = null;
    const upd = () => {
      const left = Math.max(0, Math.ceil(DUR - t));
      hud.innerHTML = pill('⏱', `<b>${left}</b><small>${L('с', 's')}</small>`, left <= 10 && state === 'run' ? 'hot' : '') + pill('✅', `<b>${ok}</b>`) + pill('⚠️', `<b>${bad}</b><small>/${STRIKES}</small>`, bad === STRIKES - 1 ? 'bad' : '');
      meter.querySelector('b').style.width = awake + '%';
      tiles[3].querySelector('.f').textContent = awake > 60 ? '🙂' : awake > 35 ? '😐' : awake > 15 ? '😪' : '😴';
      Object.values(B2).forEach(b => { b.disabled = state !== 'run'; });
    };
    const finish = (won, text) => { if (state === 'over') return; state = 'over'; clear(); upd(); api.end({ score: ok, won, text }); };
    const clear = () => { say?.remove(); say = null; tiles[0].classList.remove('talk'); tiles[3].classList.remove('look'); cur = null; };
    const bubble = s => { bub?.remove(); bub = el('div', 'bg54-bub', api.esc(s)); tiles[3].append(bub); const b = bub; later(api, 1400, () => b.remove()); };
    const strike = s => { bad++; tap(api, 'danger'); api.sfx.buzzer?.(); shake(call); float(api, call, s, true); upd(); if (bad >= STRIKES) finish(false, L(`Босс попросил остаться после созвона. Удачных реакций: ${ok}.`, `The boss asked you to stay after the call. Good reactions: ${ok}.`)); };
    const good = s => { ok++; tap(api); api.sfx.item?.(); float(api, call, s || '+1'); upd(); };
    const next = () => {
      const p = api.rnd(P.filter(x => x !== cur?.p)), life = Math.max(1.7, 3.3 - t * 0.026);
      cur = { p, k: p[0], life, max: life };
      say = el('div', 'bg54-say' + (p[0] === 'trap' ? ' trap' : ''), `${api.esc(L(p[1], p[2]))}<i></i>`); call.append(say);
      if (p[0] === 'look') tiles[3].classList.add('look'); else tiles[0].classList.add('talk');
    };
    function press(k) {
      if (state !== 'run') return;
      if (k === 'sip') { awake = Math.min(100, awake + 30); api.sfx.pop?.(); upd(); return; }
      if (!cur) { strike(L('Невпопад!', 'Out of place!')); return; }
      if (cur.k === 'trap') { const f = FAIL.trap[P.filter(x => x[0] === 'trap').indexOf(cur.p) % 3]; clear(); gap = 1; return strike(f); }
      if (k !== cur.k) { clear(); gap = 1; return strike(L('Невпопад!', 'Out of place!')); }
      if (k === 'talk') bubble(L(...api.rnd(SMART)));
      clear(); gap = 0.6 + api.rng() * 0.8; good();
    }
    intro(api, wrap, '🧐', L('Умный вид на созвоне', 'Look smart on the call'), [
      L('«Все согласны?» — <b>кивнуть</b>, «ваше мнение?» — <b>сказать умное</b>, 👀 босс смотрит — <b>умный вид</b>.', '“Everyone agree?” — <b>nod</b>, “your thoughts?” — <b>say smth smart</b>, 👀 boss looking — <b>look smart</b>.'),
      L('<b>Ловушка:</b> «Вопросы есть?», «Кто возьмёт задачу?» — молчите.', '<b>Trap:</b> “Any questions?”, “Who’ll take this task?” — stay quiet.'),
      L('<b>☕ Глоток</b> — чтобы не уснуть. Три промаха — проигрыш. Продержитесь 60 секунд.', '<b>☕ Sip</b> to stay awake. Three slips and you lose. Last 60 seconds.'),
    ], () => { state = 'run'; api.sfx.sms?.(); upd(); });
    loop(api, dt => {
      if (state !== 'run') return;
      t += dt; awake = Math.max(0, awake - dt * (4.2 + t * 0.03));
      if (awake <= 0) { awake = 40; strike(L('Задремали 😴', 'Dozed off 😴')); if (state !== 'run') return; }
      if (cur) {
        cur.life -= dt; say.querySelector('i').style.transform = `scaleX(${Math.max(0, cur.life / cur.max)})`;
        if (cur.life <= 0) { const trap = cur.k === 'trap'; clear(); gap = 0.7 + api.rng() * 0.7; if (trap) good(L('Промолчали — умно', 'Silence — smart move')); else strike(L('Не успели!', 'Too slow!')); }
      } else if ((gap -= dt) <= 0) next();
      if (t >= DUR) return finish(true, L(`Созвон пережит, все уверены, что вы в теме. Удачных реакций: ${ok}.`, `Call survived — everyone’s sure you’re on top of it. Good reactions: ${ok}.`));
      upd();
    });
    upd();
  };
})();
