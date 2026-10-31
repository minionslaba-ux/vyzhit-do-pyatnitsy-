// «☕ Разминка», игры 1–10: логика и настольные.
(() => {
  const CSS = `
.bg1-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 4px 8px 16px; box-sizing: border-box; }
.bg1-h { margin: 14px 0 2px; font-size: 18px; text-align: center; }
.bg1-note { margin: 0 0 6px; color: var(--text-2); font-size: 13px; text-align: center; max-width: 380px; line-height: 1.4; }
.bg1-opt { width: min(340px, 100%); padding: 12px 16px; border-radius: 14px; border: 1.5px solid var(--line); background: var(--panel); color: var(--text); font: inherit; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 3px; }
.bg1-opt:hover, .bg1-opt:focus-visible { border-color: var(--cyan); box-shadow: 0 0 16px rgba(var(--c-rgb),.3); }
.bg1-opt small { color: var(--text-2); font-size: 12px; }
.bg1-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 440px; font-size: 14px; gap: 8px; min-height: 24px; }
.bg1-st { color: var(--cyan-l); font-weight: 700; }
.bg1-dim { color: var(--text-2); font-size: 13px; font-variant-numeric: tabular-nums; }
.bg1-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.bg1-btn { border: 1.5px solid rgba(var(--m-rgb),.6); border-radius: 999px; background: transparent; color: var(--magenta-l); padding: 8px 14px; font: inherit; font-weight: 800; font-size: 13px; cursor: pointer; }
.bg1-btn:hover { background: rgba(var(--m-rgb),.16); }
.bg1-btn:disabled { opacity: .4; cursor: default; }
.bg1-btn.bg1-go { background: var(--magenta); color: var(--bg); box-shadow: 0 0 18px rgba(var(--m-rgb),.5); }
.bg1-board { position: relative; display: grid; aspect-ratio: 1; border: 1.5px solid rgba(var(--c-rgb),.5); border-radius: 10px; overflow: hidden; box-shadow: 0 0 22px rgba(var(--c-rgb),.18); background: var(--panel); touch-action: manipulation; }
.bg1-cell { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; cursor: pointer; font-size: calc(var(--cs) * .55); line-height: 1; }
/* шашки, уголки, переговорка */
.bg1-dk { background: #1b1b2c; } .bg1-lt { background: #2a2a40; }
.bg1-ck .bg1-lt { background: #34324a; cursor: default; }
.bg1-pc { width: 78%; height: 78%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; font-size: calc(var(--cs) * .4); box-sizing: border-box; transition: transform .15s; }
.bg1-me { background: radial-gradient(circle at 35% 30%, #ff9be9, #ff3bd4 60%, #a01f86); box-shadow: 0 0 10px rgba(255,59,212,.7), inset 0 -3px 0 rgba(0,0,0,.25); }
.bg1-ai { background: radial-gradient(circle at 35% 30%, #a6fbff, #2de2e6 60%, #13868a); box-shadow: 0 0 10px rgba(45,226,230,.6), inset 0 -3px 0 rgba(0,0,0,.25); }
.bg1-mv .bg1-me { outline: 2px dashed rgba(var(--w-rgb),.45); outline-offset: 2px; }
.bg1-sel { background: rgba(var(--m-rgb),.35) !important; }
.bg1-sel .bg1-pc { transform: scale(1.1); }
.bg1-last { box-shadow: inset 0 0 0 2px rgba(var(--c-rgb),.65); }
.bg1-tg::after { content: ''; position: absolute; width: 30%; height: 30%; border-radius: 50%; background: var(--up); box-shadow: 0 0 10px var(--up); opacity: .85; }
.bg1-zone { background: rgba(var(--c-rgb),.12); } .bg1-zone2 { background: rgba(var(--m-rgb),.12); }
/* гомоку */
.bg1-gm .bg1-cell { background: #171726; box-shadow: inset 0 0 0 .5px rgba(var(--w-rgb),.12); font-weight: 900; font-size: calc(var(--cs) * .78); }
.bg1-x { color: var(--magenta); text-shadow: 0 0 8px rgba(var(--m-rgb),.9); }
.bg1-o { color: var(--cyan); text-shadow: 0 0 8px rgba(var(--c-rgb),.9); }
.bg1-win { background: rgba(212,255,58,.25) !important; }
/* судоку */
.bg1-su .bg1-cell { background: #171726; box-shadow: inset 0 0 0 .5px rgba(var(--w-rgb),.14); }
.bg1-su .bg1-giv { background: #232338; cursor: default; }
.bg1-su .bg1-bad { background: rgba(255,59,107,.35); }
.bg1-su .bg1-on { background: rgba(var(--m-rgb),.35); box-shadow: inset 0 0 0 2px var(--magenta); }
.bg1-su .bg1-hl { background: #1f1f33; }
.bg1-br { border-right: 2px solid rgba(var(--c-rgb),.7); } .bg1-bb { border-bottom: 2px solid rgba(var(--c-rgb),.7); }
.bg1-pal { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.bg1-pal button { width: 46px; height: 46px; border-radius: 12px; border: 1.5px solid var(--line); background: var(--panel); font-size: 24px; cursor: pointer; padding: 0; color: var(--text); }
.bg1-pal button:hover { border-color: var(--cyan); }
/* пятнашки */
.bg1-sl { display: block; }
.bg1-tile { position: absolute; box-sizing: border-box; padding: 3px; transition: left .12s, top .12s; cursor: pointer; }
.bg1-tile b { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 10px; background: linear-gradient(160deg, #2c2a48, #1d1c30); border: 1.5px solid rgba(var(--c-rgb),.45); color: var(--text); font-size: calc(var(--cs) * .3); gap: 2px; }
.bg1-tile b i { font-style: normal; font-size: calc(var(--cs) * .26); }
.bg1-tile.bg1-ok b { border-color: var(--up); box-shadow: 0 0 10px rgba(212,255,58,.35); }
/* печеньки */
.bg1-plate { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; width: min(100%, 420px); min-height: 52px; padding: 8px 10px; border-radius: 999px; background: radial-gradient(ellipse at center, #2b2a40, #191927); border: 1.5px solid var(--line); box-sizing: border-box; justify-content: center; }
.bg1-plate.bg1-psel { border-color: var(--magenta); }
.bg1-ck2 { font-size: 28px; line-height: 1; background: none; border: 0; padding: 2px; cursor: pointer; border-radius: 50%; transition: transform .15s, opacity .2s; }
.bg1-ck2.bg1-pick { transform: translateY(-5px) scale(1.12); filter: drop-shadow(0 0 6px var(--magenta)); }
.bg1-empty { color: var(--text-2); font-size: 13px; }
.bg1-log { color: var(--text-2); font-size: 13px; min-height: 18px; text-align: center; }
/* согласование */
.bg1-ap { touch-action: none; }
.bg1-ap .bg1-cell { background: #1b1b2c; box-shadow: inset 0 0 0 .5px rgba(var(--w-rgb),.1); }
.bg1-ap .bg1-wall { background: #0d0d16; opacity: .7; cursor: default; }
.bg1-ap .bg1-vis { background: rgba(var(--m-rgb),.22); }
.bg1-ap .bg1-head { background: rgba(var(--m-rgb),.45); }
.bg1-ap svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
/* лабиринт */
.bg1-mz { display: block; touch-action: none; border-radius: 10px; border: 1.5px solid rgba(var(--c-rgb),.5); box-shadow: 0 0 22px rgba(var(--c-rgb),.18); }
.bg1-pad { display: grid; grid-template-columns: repeat(3, 48px); gap: 4px; }
.bg1-pad button { height: 40px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--panel); color: var(--cyan-l); font-size: 18px; cursor: pointer; }
/* ханойская стопка */
.bg1-hn { display: flex; width: min(100%, 440px); gap: 6px; }
.bg1-peg { flex: 1; position: relative; display: flex; flex-direction: column-reverse; align-items: center; gap: 3px; padding: 8px 2px 30px; min-height: 220px; border-radius: 14px; border: 1.5px solid var(--line); background: var(--panel); cursor: pointer; }
.bg1-peg::before { content: ''; position: absolute; bottom: 30px; top: 18px; left: 50%; width: 4px; translate: -50% 0; background: rgba(var(--w-rgb),.12); border-radius: 2px; }
.bg1-peg.bg1-on { border-color: var(--magenta); box-shadow: 0 0 16px rgba(var(--m-rgb),.35); }
.bg1-peg small { position: absolute; bottom: 7px; left: 0; right: 0; text-align: center; color: var(--text-2); font-size: 11.5px; }
.bg1-fd { position: relative; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #12121d; transition: transform .15s; }
.bg1-fd.bg1-up { transform: translateY(-12px); box-shadow: 0 0 14px rgba(var(--w-rgb),.6); }
`;

  const mk = (root, api) => {
    if (!document.getElementById('bg-style-1')) { const s = document.createElement('style'); s.id = 'bg-style-1'; s.textContent = CSS; document.head.append(s); }
    const T = [], I = [], F = [];
    api.onExit(() => { T.forEach(clearTimeout); I.forEach(clearInterval); F.forEach(f => { try { f(); } catch {} }); });
    const el = (tag, cls, html, par) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (par) par.append(e); if (tag === 'button') e.type = 'button'; return e; };
    const fmt = s => { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    const U = {
      el, fmt,
      later: (f, ms) => { const id = setTimeout(f, ms); T.push(id); return id; },
      every: (f, ms) => { const id = setInterval(f, ms); I.push(id); return id; },
      on: (t, ev, f, o) => { t.addEventListener(ev, f, o); F.push(() => t.removeEventListener(ev, f, o)); },
      // перетаскивание по клеткам: нажали на одной, отпустили на другой — как два нажатия (клик тогда не срабатывает)
      drag: (bd, cells, tap) => {
        let from = -1;
        const at = e => { const t = document.elementFromPoint(e.clientX, e.clientY); return cells.findIndex(c => c === t || c.contains(t)); };
        bd.style.touchAction = 'none';
        bd.addEventListener('pointerdown', e => { from = at(e); });
        bd.addEventListener('pointerup', e => { const to = at(e); if (from >= 0 && to >= 0 && to !== from) { tap(from); tap(to); } from = -1; });
        bd.addEventListener('pointercancel', () => { from = -1; });
      },
      W: (max = 440) => Math.floor(Math.max(260, Math.min((root.clientWidth || 360) - 16, max))),
      clear: () => { root.innerHTML = ''; return el('div', 'bg1-wrap', null, root); },
      menu(title, opts, cb, note) {
        const w = U.clear(); el('h3', 'bg1-h', title, w); if (note) el('p', 'bg1-note', note, w);
        opts.forEach(o => { const b = el('button', 'bg1-opt', `<b>${o.t}</b>${o.s ? `<small>${o.s}</small>` : ''}`, w); b.onclick = () => { api.sfx.click?.(); cb(o.v); }; });
      },
      board(w, n, cls, max) {
        const W = U.W(max), bd = el('div', 'bg1-board ' + (cls || ''), null, w);
        bd.style.width = W + 'px'; bd.style.gridTemplateColumns = bd.style.gridTemplateRows = `repeat(${n},minmax(0,1fr))`; bd.style.setProperty('--cs', W / n + 'px');
        return bd;
      },
      clock(out) {
        let t0 = 0, stopped = null;
        const secs = () => stopped != null ? stopped : t0 ? (performance.now() - t0) / 1000 : 0;
        const show = () => { if (out) out.textContent = '⏱ ' + fmt(secs()); };
        show();
        return { start() { if (!t0) { t0 = performance.now(); U.every(show, 250); } }, stop() { if (stopped == null) stopped = secs(); show(); return Math.round(stopped * 10) / 10; }, secs, get started() { return !!t0; } };
      },
    };
    return U;
  };
  const inb = (r, c, n = 8) => r >= 0 && c >= 0 && r < n && c < n;
  const D4 = [[-1, 0], [1, 0], [0, -1], [0, 1]], DX = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const B = window.BREAK_IMPL;

  // ───────── 1. Шашки против Босса (русские шашки) ─────────
  const ckMoves = (b, side) => {
    const caps = [];
    for (let s = 0; s < 64; s++) if (b[s] * side > 0) {
      const rec = (pos, king, path, capd, out) => {
        const r = pos >> 3, c = pos & 7; let found = false;
        for (const [dr, dc] of DX) {
          if (!king) {
            const r2 = r + 2 * dr, c2 = c + 2 * dc; if (!inb(r2, c2)) continue;
            const m = (r + dr) * 8 + c + dc, t = r2 * 8 + c2;
            if (b[m] * side < 0 && !capd.includes(m) && (b[t] === 0 || t === s)) {
              found = true; rec(t, side === 1 ? r2 === 0 : r2 === 7, [...path, t], [...capd, m], out);
            }
          } else {
            let rr = r + dr, cc = c + dc;
            while (inb(rr, cc) && (b[rr * 8 + cc] === 0 || rr * 8 + cc === s)) { rr += dr; cc += dc; }
            if (!inb(rr, cc)) continue;
            const m = rr * 8 + cc; if (!(b[m] * side < 0) || capd.includes(m)) continue;
            const lands = []; rr += dr; cc += dc;
            while (inb(rr, cc) && (b[rr * 8 + cc] === 0 || rr * 8 + cc === s)) { lands.push(rr * 8 + cc); rr += dr; cc += dc; }
            if (!lands.length) continue;
            found = true;
            const groups = lands.map(t => { const o = []; rec(t, true, [...path, t], [...capd, m], o); return o; });
            const cont = groups.filter(g => g.some(x => x.caps.length > capd.length + 1));
            (cont.length ? cont : groups).forEach(g => out.push(...g));
          }
        }
        if (!found && capd.length) out.push({ path, caps: capd, king });
      };
      rec(s, Math.abs(b[s]) === 2, [s], [], caps);
    }
    if (caps.length) return caps;
    const res = [];
    for (let s = 0; s < 64; s++) if (b[s] * side > 0) {
      const king = Math.abs(b[s]) === 2, r = s >> 3, c = s & 7;
      for (const [dr, dc] of DX) {
        if (!king && dr !== -side) continue;
        let rr = r + dr, cc = c + dc;
        while (inb(rr, cc) && b[rr * 8 + cc] === 0) { res.push({ path: [s, rr * 8 + cc], caps: [] }); if (!king) break; rr += dr; cc += dc; }
      }
    }
    return res;
  };
  const ckApply = (b, m) => {
    const nb = b.slice(), p = nb[m.path[0]], side = Math.sign(p), t = m.path[m.path.length - 1];
    nb[m.path[0]] = 0; m.caps.forEach(x => { nb[x] = 0; });
    let q = p; if (Math.abs(p) === 1 && (m.king || (side === 1 ? t >> 3 === 0 : t >> 3 === 7))) q = 2 * side;
    nb[t] = q; return nb;
  };
  const ckEval = (b, side) => {
    let v = 0;
    for (let s = 0; s < 64; s++) { const p = b[s]; if (!p) continue; const r = s >> 3, c = s & 7;
      const val = Math.abs(p) === 2 ? 3 : 1 + .05 * (p > 0 ? 7 - r : r) + (c > 1 && c < 6 ? .03 : 0);
      v += Math.sign(p) * val; }
    return side * v;
  };
  const ckNega = (b, side, d, a, beta) => {
    const ms = ckMoves(b, side); if (!ms.length) return -1000 - d; if (d <= 0) return ckEval(b, side);
    let best = -Infinity;
    for (const m of ms) { const v = -ckNega(ckApply(b, m), -side, d - 1, -beta, -a); if (v > best) best = v; if (best > a) a = best; if (a >= beta) break; }
    return best;
  };

  B[1] = (root, api) => {
    const { L } = api, U = mk(root, api);
    const LV = [null, [L('Стажёр', 'Intern'), '🧑‍🎓'], [L('Мидл', 'Mid-level'), '🧑‍💼'], [L('Директор', 'Director'), '👔']];
    U.menu(L('Кто сядет за доску?', 'Who takes the board?'), [1, 2, 3].map(v => ({ v, t: `${LV[v][1]} ${LV[v][0]}`,
      s: [, L('Ходит как попало', 'Moves at random'), L('Смотрит на ход вперёд', 'Looks one move ahead'), L('Просчитывает варианты', 'Calculates deep lines')][v] })), play,
      L('Русские шашки: бить обязательно (и назад тоже), дамка ходит далеко. Ваши шашки — розовые, внизу; ходите первыми. Нажмите шашку, потом клетку (или перетащите пальцем).', 'Russian checkers: captures are mandatory (backwards too), kings fly. Yours are pink, at the bottom; you move first. Tap a piece, then a square (or drag it).'));
    function play(level) {
      let b = Array(64).fill(0);
      for (let s = 0; s < 64; s++) { const r = s >> 3, c = s & 7; if ((r + c) % 2) { if (r < 3) b[s] = -1; else if (r > 4) b[s] = 1; } }
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w);
      const st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
      const bd = U.board(w, 8, 'bg1-ck');
      const cells = []; for (let s = 0; s < 64; s++) { const c = U.el('div', 'bg1-cell ' + (((s >> 3) + (s & 7)) % 2 ? 'bg1-dk' : 'bg1-lt'), null, bd); c.onclick = () => tap(s); cells.push(c); }
      U.drag(bd, cells, tap);
      const row = U.el('div', 'bg1-row', null, w), give = U.el('button', 'bg1-btn', L('🏳️ Сдаться', '🏳️ Resign'), row);
      give.onclick = () => !done && finish(false, L('Вы сдались. Босс доволен собой.', 'You resigned. The Boss is pleased.'));
      let turn = 1, sel = null, legal = ckMoves(b, 1), last = [], myMoves = 0, quiet = 0, done = false;
      const pre = (p, q) => q.every((x, i) => p[i] === x);
      function render() {
        const tg = new Set(), path = new Set(sel ? sel.path : []), mov = new Set();
        if (turn === 1 && !done) { if (sel) legal.filter(m => pre(m.path, sel.path)).forEach(m => tg.add(m.path[sel.path.length])); legal.forEach(m => mov.add(m.path[0])); }
        cells.forEach((c, s) => {
          const p = b[s];
          c.innerHTML = p ? `<i class="bg1-pc ${p > 0 ? 'bg1-me' : 'bg1-ai'}">${Math.abs(p) === 2 ? '👑' : ''}</i>` : '';
          c.classList.toggle('bg1-tg', tg.has(s)); c.classList.toggle('bg1-sel', path.has(s));
          c.classList.toggle('bg1-mv', !sel && mov.has(s)); c.classList.toggle('bg1-last', last.includes(s));
        });
        cnt.textContent = `${L('Вы', 'You')} ${b.filter(x => x > 0).length} : ${b.filter(x => x < 0).length} ${LV[level][1]}`;
        st.textContent = done ? '' : turn === 1 ? (legal[0]?.caps.length ? L('Ваш ход — бейте!', 'Your move — capture!') : L('Ваш ход', 'Your move')) : L(`${LV[level][0]} думает…`, `${LV[level][0]} is thinking…`);
      }
      function tap(s) {
        if (done || turn !== 1) return;
        if (b[s] > 0 && (!sel || sel.path.length === 1) && legal.some(m => m.path[0] === s)) { sel = { path: [s] }; api.sfx.click?.(); render(); return; }
        if (!sel) { if (b[s] > 0 && legal[0]?.caps.length) api.toast(L('Бить обязательно — другой шашкой', 'Capturing is mandatory — use another piece')); return; }
        const next = legal.filter(m => pre(m.path, sel.path) && m.path[sel.path.length] === s);
        if (!next.length) { if (sel.path.length === 1) { sel = null; render(); } return; }
        const np = [...sel.path, s], full = next.find(m => m.path.length === np.length);
        if (full) return doMove(full, 1);
        sel = { path: np }; render();
      }
      function doMove(m, side) {
        const moved = b[m.path[0]]; b = ckApply(b, m); last = m.path.slice(); sel = null;
        if (m.caps.length || Math.abs(moved) === 1) quiet = 0; else quiet++;
        if (side === 1) myMoves++;
        if (m.caps.length) api.sfx.stapler?.(); else api.sfx.click?.();
        turn = -side; legal = ckMoves(b, turn); render();
        if (!legal.length) return finish(turn === -1, turn === -1
          ? L(`Победа над соперником «${LV[level][0]}» за ${myMoves} ход(ов)!`, `You beat the ${LV[level][0]} in ${myMoves} moves!`)
          : L('Босс запер все ваши шашки. Партия проиграна.', 'The Boss has blocked or taken all your pieces.'));
        if (quiet >= 30) return finish(false, L('Ничья: 15 ходов дамками без взятий.', 'Draw: 15 king moves without captures.'));
        if (turn === -1) U.later(ai, 450);
      }
      function ai() {
        if (done) return;
        let m;
        if (level === 1) m = api.rnd(legal);
        else { const d = level === 2 ? 2 : (legal.length <= 3 ? 6 : 5); let best = -Infinity; m = legal[0];
          for (const x of api.shuffle(legal)) { const v = -ckNega(ckApply(b, x), 1, d - 1, -Infinity, -best) + (level === 2 ? Math.random() * .3 : 0); if (v > best) { best = v; m = x; } } }
        doMove(m, -1);
      }
      function finish(won, text) { done = true; render(); api.end({ won, score: won ? level : null, text }); }
      render();
    }
  };

  // ───────── 2. Уголки ─────────
  B[2] = (root, api) => {
    const { L } = api, U = mk(root, api), CAP = 80;
    const inP = s => (s >> 3) >= 5 && (s & 7) <= 2, inA = s => (s >> 3) <= 2 && (s & 7) >= 5;
    const b = Array(64).fill(0); for (let s = 0; s < 64; s++) { if (inP(s)) b[s] = 1; if (inA(s)) b[s] = -1; }
    const cost = (s, p) => { const r = s >> 3, c = s & 7; return p > 0 ? Math.max(0, r - 2) + Math.max(0, 5 - c) : Math.max(0, 5 - r) + Math.max(0, c - 2); };
    const man = (s, p) => { const r = s >> 3, c = s & 7; return p > 0 ? r + (7 - c) : (7 - r) + c; };
    const tgt = p => p > 0 ? inA : inP;
    const inGoal = p => b.reduce((n, x, s) => n + (x === p && tgt(p)(s) ? 1 : 0), 0);
    const total = p => b.reduce((n, x, s) => n + (x === p ? cost(s, p) : 0), 0);
    const dests = s => {
      const out = new Set(), r = s >> 3, c = s & 7;
      for (const [dr, dc] of D4) { const rr = r + dr, cc = c + dc; if (inb(rr, cc) && b[rr * 8 + cc] === 0) out.add(rr * 8 + cc); }
      const seen = new Set([s]), q = [s];
      while (q.length) { const x = q.pop(), xr = x >> 3, xc = x & 7;
        for (const [dr, dc] of D4) { const r2 = xr + 2 * dr, c2 = xc + 2 * dc; if (!inb(r2, c2)) continue;
          const m = (xr + dr) * 8 + xc + dc, t = r2 * 8 + c2;
          if (b[m] !== 0 && m !== s && b[t] === 0 && !seen.has(t)) { seen.add(t); out.add(t); q.push(t); } } }
      return [...out];
    };
    const w = U.clear();
    U.el('p', 'bg1-note', L('Переведите свои 9 фишек в дальний угол раньше коллеги. Ход — на соседнюю клетку или прыжками через любые фишки.', 'Move your 9 pieces to the far corner before your colleague. Step to a neighbour or jump over any pieces.'), w);
    const bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
    const bd = U.board(w, 8);
    const cells = []; for (let s = 0; s < 64; s++) { const c = U.el('div', 'bg1-cell ' + (((s >> 3) + (s & 7)) % 2 ? 'bg1-dk' : 'bg1-lt') + (inA(s) ? ' bg1-zone2' : inP(s) ? ' bg1-zone' : ''), null, bd); c.onclick = () => tap(s); cells.push(c); }
    U.drag(bd, cells, tap);
    let sel = null, ds = [], my = 0, their = 0, turn = 1, done = false, last = [];
    function render() {
      cells.forEach((c, s) => {
        c.innerHTML = b[s] ? `<i class="bg1-pc ${b[s] > 0 ? 'bg1-me' : 'bg1-ai'}">${b[s] > 0 ? '📁' : '🗂️'}</i>` : '';
        c.classList.toggle('bg1-sel', s === sel); c.classList.toggle('bg1-tg', ds.includes(s)); c.classList.toggle('bg1-last', last.includes(s));
      });
      cnt.textContent = L(`${inGoal(1)}/9 : ${inGoal(-1)}/9 · ход ${my}/${CAP}`, `${inGoal(1)}/9 : ${inGoal(-1)}/9 · move ${my}/${CAP}`);
      st.textContent = done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Коллега думает…', 'Colleague is thinking…');
    }
    function tap(s) {
      if (done || turn !== 1) return;
      if (b[s] === 1) { sel = s; ds = dests(s); api.sfx.click?.(); render(); return; }
      if (sel != null && ds.includes(s)) { b[s] = 1; b[sel] = 0; last = [sel, s]; sel = null; ds = []; my++; api.sfx.click?.(); after(1); }
    }
    function after(p) {
      turn = -p; render();
      if (inGoal(1) === 9) return finish(true, L(`Все папки на месте за ${my} ходов!`, `All folders home in ${my} moves!`), my);
      if (inGoal(-1) === 9) return finish(false, L('Коллега успел первым.', 'Your colleague got there first.'));
      if (my >= CAP && their >= CAP) {
        const a = inGoal(1), c = inGoal(-1), ta = total(1), tc = total(-1);
        const won = a > c || (a === c && ta < tc);
        return finish(won, L(`Время вышло: у вас ${a}/9 в углу, у коллеги ${c}/9.`, `Time’s up: you ${a}/9 home, colleague ${c}/9.`) + ' ' + (won ? L('По очкам — ваша победа.', 'You win on points.') : L('По очкам победил коллега.', 'Colleague wins on points.')), null);
      }
      if (turn === -1) U.later(ai, 380);
      else if (!b.some((x, s) => x === 1 && dests(s).length)) { turn = -1; U.later(ai, 380); }
    }
    function ai() {
      if (done) return;
      let best = -Infinity, mv = null;
      for (let s = 0; s < 64; s++) if (b[s] === -1) for (const t of dests(s)) {
        const v = (cost(s, -1) - cost(t, -1)) * 10 + (man(s, -1) - man(t, -1)) + Math.random() * .8;
        if (v > best) { best = v; mv = [s, t]; }
      }
      their++;
      if (mv) { b[mv[1]] = -1; b[mv[0]] = 0; last = mv; }
      after(-1);
    }
    function finish(won, text, score) { done = true; render(); api.end({ won, text, score: won ? score : null, lowerBetter: true }); }
    render();
  };

  // ───────── 3. 5 в ряд с Бухгалтером ─────────
  B[3] = (root, api) => {
    const { L } = api, U = mk(root, api), N = 13;
    const b = Array(N * N).fill(0);
    const at = (r, c) => inb(r, c, N) ? b[r * N + c] : -1;
    const DIR = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const pat = (n, open) => n >= 5 ? 1e6 : !open ? 0 : n === 4 ? (open === 2 ? 1e5 : 1.2e4) : n === 3 ? (open === 2 ? 5e3 : 400) : n === 2 ? (open === 2 ? 250 : 40) : (open === 2 ? 10 : 2);
    const lineAt = (r, c, dr, dc, p) => {
      let n = 1, open = 0, i = 1;
      while (at(r + dr * i, c + dc * i) === p) { n++; i++; } if (at(r + dr * i, c + dc * i) === 0) open++;
      i = 1; while (at(r - dr * i, c - dc * i) === p) { n++; i++; } if (at(r - dr * i, c - dc * i) === 0) open++;
      return [n, open];
    };
    const cellScore = (r, c, p) => DIR.reduce((s, [dr, dc]) => s + pat(...lineAt(r, c, dr, dc, p)), 0);
    const winLine = (s, p) => { const r = Math.floor(s / N), c = s % N;
      for (const [dr, dc] of DIR) { const line = [s]; for (const k of [1, -1]) { let i = 1; while (at(r + dr * i * k, c + dc * i * k) === p) { line.push((r + dr * i * k) * N + c + dc * i * k); i++; } } if (line.length >= 5) return line; }
      return null; };
    const w = U.clear();
    const bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
    const bd = U.board(w, N, 'bg1-gm', 460);
    const cells = []; for (let s = 0; s < N * N; s++) { const c = U.el('div', 'bg1-cell', null, bd); c.onclick = () => tap(s); cells.push(c); }
    U.el('p', 'bg1-note', L('Вы — ✕, Бухгалтер — ◯. Пять в ряд по горизонтали, вертикали или диагонали.', 'You are ✕, the Accountant is ◯. Five in a row in any direction.'), w);
    let turn = 1, done = false, my = 0, last = -1;
    const render = (win = []) => {
      cells.forEach((c, s) => { c.innerHTML = b[s] === 1 ? '<span class="bg1-x">✕</span>' : b[s] === 2 ? '<span class="bg1-o">◯</span>' : ''; c.classList.toggle('bg1-last', s === last); c.classList.toggle('bg1-win', win.includes(s)); });
      st.textContent = done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Бухгалтер считает…', 'The Accountant is counting…');
      cnt.textContent = L(`Ходов: ${my}`, `Moves: ${my}`);
    };
    function place(s, p) {
      b[s] = p; last = s; api.sfx.click?.();
      const wl = winLine(s, p);
      if (wl) { done = true; render(wl); return api.end(p === 1 ? { won: true, score: my, lowerBetter: true, text: L(`Пять в ряд за ${my} ходов — Бухгалтер пересчитывает и не верит.`, `Five in a row in ${my} moves!`) } : { won: false, text: L('Бухгалтер свёл баланс: пять в ряд.', 'The Accountant balanced the books: five in a row.') }); }
      if (!b.includes(0)) { done = true; render(); return api.end({ won: false, text: L('Ничья: поле заполнено.', 'Draw: the board is full.') }); }
      turn = 3 - p; render();
      if (turn === 2) U.later(ai, 350);
    }
    function tap(s) { if (done || turn !== 1 || b[s]) return; my++; place(s, 1); }
    function ai() {
      if (done) return;
      let best = -1, mv = Math.floor(N * N / 2);
      for (let s = 0; s < N * N; s++) {
        if (b[s]) continue; const r = Math.floor(s / N), c = s % N; let near = false;
        for (let dr = -2; dr <= 2 && !near; dr++) for (let dc = -2; dc <= 2; dc++) if (at(r + dr, c + dc) > 0) { near = true; break; }
        if (!near) continue;
        const v = cellScore(r, c, 2) * 1.1 + cellScore(r, c, 1) + Math.random() * 3;
        if (v > best) { best = v; mv = s; }
      }
      if (b[mv]) mv = b.indexOf(0);
      place(mv, 2);
    }
    render();
  };

  // ───────── 4. Офисное судоку ─────────
  B[4] = (root, api) => {
    const { L } = api, U = mk(root, api);
    const ICONS = ['📎', '✏️', '📁', '☕', '📌', '🖇️'];
    U.menu(L('Офисное судоку', 'Office sudoku'), [
      { v: 4, t: L('4×4 · разминка', '4×4 · warm-up'), s: L('Четыре значка, квадраты 2×2', 'Four icons, 2×2 boxes') },
      { v: 6, t: L('6×6 · 🏆 на время', '6×6 · 🏆 timed'), s: L('Шесть значков, блоки 2×3 — рекорд считается здесь', 'Six icons, 2×3 boxes — records count here') },
    ], play, L('В каждой строке, столбце и блоке каждый значок — ровно один раз.', 'Each icon appears exactly once in every row, column and box.'));
    const count = (g, N, br, bc, lim) => {
      const i = g.indexOf(-1); if (i < 0) return 1;
      const r = Math.floor(i / N), c = i % N; let n = 0;
      for (let v = 0; v < N && n < lim; v++) {
        let ok = true;
        for (let k = 0; k < N && ok; k++) if (g[r * N + k] === v || g[k * N + c] === v) ok = false;
        const R = r - r % br, C = c - c % bc;
        for (let y = R; y < R + br && ok; y++) for (let x = C; x < C + bc; x++) if (g[y * N + x] === v) { ok = false; break; }
        if (ok) { g[i] = v; n += count(g, N, br, bc, lim - n); g[i] = -1; }
      }
      return n;
    };
    function play(N) {
      const br = 2, bc = N / 2, sh = api.shuffle, rng = Math.random;
      const bands = sh([...Array(N / br).keys()]), stacks = sh([...Array(N / bc).keys()]);
      const rows = bands.flatMap(g => sh([...Array(br).keys()].map(k => g * br + k)));
      const cols = stacks.flatMap(g => sh([...Array(bc).keys()].map(k => g * bc + k)));
      const perm = sh([...Array(N).keys()]);
      const sol = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const R = rows[r], C = cols[c]; sol.push(perm[(bc * (R % br) + Math.floor(R / br) + C) % N]); }
      const g = sol.slice(), target = N === 4 ? 6 : 13;
      for (const i of sh([...Array(N * N).keys()])) {
        if (g.filter(x => x >= 0).length <= target) break;
        const v = g[i]; g[i] = -1; if (count(g.slice(), N, br, bc, 2) !== 1) g[i] = v;
      }
      const giv = g.map(x => x >= 0), cur = g.slice();
      const icons = sh(ICONS).slice(0, N);
      void rng;
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), tm = U.el('span', 'bg1-dim', '', bar);
      const clk = U.clock(tm); clk.start();
      const bd = U.board(w, N, 'bg1-su', 360);
      const cells = []; let sel = -1, done = false;
      for (let i = 0; i < N * N; i++) { const r = Math.floor(i / N), c = i % N;
        const e = U.el('div', 'bg1-cell' + (giv[i] ? ' bg1-giv' : '') + ((c + 1) % bc === 0 && c < N - 1 ? ' bg1-br' : '') + ((r + 1) % br === 0 && r < N - 1 ? ' bg1-bb' : ''), null, bd);
        e.onclick = () => { if (done || giv[i]) return; sel = i; api.sfx.click?.(); render(); }; cells.push(e); }
      const pal = U.el('div', 'bg1-pal', null, w);
      icons.forEach((ic, v) => { const p = U.el('button', '', ic, pal); p.onclick = () => put(v); });
      U.el('button', '', '⌫', pal).onclick = () => put(-1);
      const bad = () => { const s = new Set();
        for (let i = 0; i < N * N; i++) { if (cur[i] < 0) continue; const r = Math.floor(i / N), c = i % N;
          for (let j = 0; j < N * N; j++) { if (j === i || cur[j] !== cur[i]) continue; const r2 = Math.floor(j / N), c2 = j % N;
            if (r === r2 || c === c2 || (Math.floor(r / br) === Math.floor(r2 / br) && Math.floor(c / bc) === Math.floor(c2 / bc))) s.add(i); } }
        return s; };
      function render() {
        const bs = bad(), sr = Math.floor(sel / N), sc = sel % N;
        cells.forEach((e, i) => { e.textContent = cur[i] >= 0 ? icons[cur[i]] : ''; e.classList.toggle('bg1-on', i === sel); e.classList.toggle('bg1-bad', bs.has(i) && !giv[i]);
          e.classList.toggle('bg1-hl', sel >= 0 && i !== sel && (Math.floor(i / N) === sr || i % N === sc)); });
        st.textContent = sel < 0 ? L('Выберите клетку', 'Pick a cell') : L('Выберите значок', 'Pick an icon');
        return bs;
      }
      function put(v) {
        if (done || sel < 0) return; cur[sel] = v; api.sfx.click?.();
        const bs = render();
        if (!cur.includes(-1) && !bs.size) { done = true; sel = -1; render(); const t = clk.stop();
          api.end({ won: true, score: N === 6 ? t : null, lowerBetter: true, text: L(`Судоку ${N}×${N} решено за ${U.fmt(t)}.`, `${N}×${N} sudoku solved in ${U.fmt(t)}.`) }); }
      }
      render();
    }
  };

  // ───────── 5. Пятнашки «Разобрать стол» ─────────
  B[5] = (root, api) => {
    const { L } = api, U = mk(root, api);
    U.menu(L('Разобрать стол', 'Sliding desk'), [
      { v: 3, t: L('3×3 · 8 документов', '3×3 · 8 documents'), s: L('Быстрая разминка', 'Quick warm-up') },
      { v: 4, t: L('4×4 · 15 документов · 🏆', '4×4 · 15 documents · 🏆'), s: L('Рекорд — по наименьшему числу ходов', 'Record — fewest moves') },
    ], play, L('Нажмите на документ в одном ряду или столбце с пустым местом — он сдвинется.', 'Tap a document in line with the empty spot to slide it.'));
    function play(N) {
      const a = [...Array(N * N - 1).keys()].map(x => x + 1).concat(0);
      let e = N * N - 1, prev = -1;
      const nb = i => D4.map(([dr, dc]) => [Math.floor(i / N) + dr, i % N + dc]).filter(([r, c]) => inb(r, c, N)).map(([r, c]) => r * N + c);
      const solved = () => a.every((x, i) => x === (i === N * N - 1 ? 0 : i + 1));
      do { for (let k = 0; k < N * N * 30; k++) { const o = nb(e).filter(x => x !== prev), t = api.rnd(o); a[e] = a[t]; a[t] = 0; prev = e; e = t; } } while (solved());
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w), mv = U.el('span', 'bg1-st', '', bar), tm = U.el('span', 'bg1-dim', '', bar);
      const clk = U.clock(tm);
      const bd = U.board(w, N, 'bg1-sl', 380), W = parseFloat(bd.style.width), cs = W / N;
      const tiles = {}; let moves = 0, done = false;
      const DOCS = ['📄', '📑', '📃', '🧾', '📋'];
      for (let v = 1; v < N * N; v++) { const t = U.el('div', 'bg1-tile', `<b><i>${DOCS[v % DOCS.length]}</i>${v}</b>`, bd); t.style.width = t.style.height = cs + 'px'; t.onclick = () => tap(a.indexOf(v)); tiles[v] = t; }
      function render() {
        a.forEach((v, i) => { if (!v) return; const t = tiles[v]; t.style.left = (i % N) * cs + 'px'; t.style.top = Math.floor(i / N) * cs + 'px'; t.classList.toggle('bg1-ok', v === i + 1); });
        mv.textContent = L(`Ходов: ${moves}`, `Moves: ${moves}`);
      }
      function tap(i) {
        if (done) return; e = a.indexOf(0);
        const r = Math.floor(i / N), c = i % N, er = Math.floor(e / N), ec = e % N;
        if (r !== er && c !== ec) return;
        clk.start();
        const step = r === er ? (c > ec ? 1 : -1) : (r > er ? N : -N);
        while (e !== i) { a[e] = a[e + step]; a[e + step] = 0; e += step; moves++; }
        api.sfx.click?.(); render();
        if (solved()) { done = true; const t = clk.stop();
          api.end({ won: true, score: N === 4 ? moves : null, lowerBetter: true, text: L(`Стол разобран: ${moves} ходов за ${U.fmt(t)}.`, `Desk sorted: ${moves} moves in ${U.fmt(t)}.`) }); }
      }
      render();
    }
  };

  // ───────── 6. Последняя печенька ─────────
  B[6] = (root, api) => {
    const { L } = api, U = mk(root, api);
    U.menu(L('Последняя печенька', 'The last cookie'), [
      { v: [1, 0], t: L('🍪 Одна тарелка · лёгкий', '🍪 One plate · easy'), s: L('Берите 1–3 печеньки, коллега иногда ошибается', 'Take 1–3 cookies, your colleague sometimes slips') },
      { v: [1, 1], t: L('🍪 Одна тарелка · сложный', '🍪 One plate · hard'), s: L('Коллега считает безошибочно', 'Your colleague counts perfectly') },
      { v: [0, 0], t: L('🍽️ Несколько тарелок · лёгкий', '🍽️ Several plates · easy'), s: L('Берите сколько угодно, но с одной тарелки', 'Take any number, but from one plate') },
      { v: [0, 1], t: L('🍽️ Несколько тарелок · сложный', '🍽️ Several plates · hard'), s: L('Против бухгалтера-математика', 'Against a math-savvy accountant') },
    ], play, L('Берите печенье по очереди. Кто возьмёт последнее — тот и моет чашки (проигрывает).', 'Take turns. Whoever takes the last cookie washes the mugs (loses).'));
    function play([single, hard]) {
      const max = single ? 3 : Infinity;
      const isP = h => single ? h[0] % 4 === 1 : h.every(x => x <= 1) ? h.filter(x => x === 1).length % 2 === 1 : h.reduce((a, x) => a ^ x, 0) === 0;
      let h;
      if (single) { do h = [13 + Math.floor(Math.random() * 9)]; while (h[0] % 4 === 1); }
      else do h = Array.from({ length: 3 + (Math.random() < .4 ? 1 : 0) }, () => 2 + Math.floor(Math.random() * 5)); while (isP(h));
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
      const plates = U.el('div', 'bg1-wrap', null, w); plates.style.padding = '0';
      const log = U.el('p', 'bg1-log', '', w);
      const go = U.el('button', 'bg1-btn bg1-go', '', U.el('div', 'bg1-row', null, w));
      let pick = null, turn = 1, done = false;
      function render() {
        plates.innerHTML = '';
        h.forEach((n, p) => {
          const pl = U.el('div', 'bg1-plate' + (pick && pick.p === p ? ' bg1-psel' : ''), null, plates);
          if (!n) U.el('span', 'bg1-empty', L('пусто', 'empty'), pl);
          for (let i = 0; i < n; i++) { const c = U.el('button', 'bg1-ck2' + (pick && pick.p === p && i >= n - pick.k ? ' bg1-pick' : ''), '🍪', pl);
            c.setAttribute('aria-label', L('печенька', 'cookie'));
            c.onclick = () => { if (done || turn !== 1) return; const k = Math.min(n - i, max); pick = pick && pick.p === p && pick.k === k ? null : { p, k }; api.sfx.click?.(); render(); }; }
        });
        const tot = h.reduce((a, x) => a + x, 0);
        cnt.textContent = L(`Осталось: ${tot} 🍪`, `Left: ${tot} 🍪`);
        st.textContent = done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Коллега выбирает…', 'Colleague is choosing…');
        go.disabled = !pick || turn !== 1 || done;
        go.textContent = pick ? L(`Взять ${pick.k} 🍪`, `Take ${pick.k} 🍪`) : single ? L('Нажмите на печеньку (1–3)', 'Tap a cookie (1–3)') : L('Нажмите на печеньку', 'Tap a cookie');
      }
      const empty = () => h.every(x => !x);
      go.onclick = () => {
        if (!pick || done || turn !== 1) return;
        h[pick.p] -= pick.k; log.textContent = L(`Вы взяли ${pick.k} 🍪`, `You took ${pick.k} 🍪`); pick = null; api.sfx.item?.();
        if (empty()) { done = true; render(); return api.end({ won: false, text: L('Последняя печенька — ваша. Чашки моете вы ☕', 'The last cookie is yours — you wash the mugs ☕') }); }
        turn = 2; render(); U.later(ai, 800);
      };
      function ai() {
        if (done) return;
        const opts = []; h.forEach((n, p) => { for (let k = 1; k <= Math.min(n, max); k++) opts.push([p, k]); });
        const good = opts.filter(([p, k]) => { const t = h.slice(); t[p] -= k; return isP(t); });
        let m = good.length && (hard || Math.random() < .45) ? api.rnd(good) : api.rnd(opts);
        if (hard && !good.length) m = opts.find(([, k]) => k === 1) || m;
        h[m[0]] -= m[1];
        log.textContent = L(`Коллега взял ${m[1]} 🍪` + (single ? '' : ` с тарелки №${m[0] + 1}`), `Colleague took ${m[1]} 🍪` + (single ? '' : ` from plate #${m[0] + 1}`));
        api.sfx.click?.();
        if (empty()) { done = true; render(); return api.end({ won: true, text: L('Коллеге досталась последняя печенька — чашки моет он!', 'Your colleague took the last cookie — they wash the mugs!') }); }
        turn = 1; render();
      }
      render();
    }
  };

  // ───────── 7. Захват переговорки (реверси) ─────────
  B[7] = (root, api) => {
    const { L } = api, U = mk(root, api);
    const WT = [100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, 1, 1, 1, 1, -2, 10, 5, -2, 1, 0, 0, 1, -2, 5];
    const W8 = [...WT, ...WT.slice(24, 32), ...WT.slice(16, 24), ...WT.slice(8, 16), ...WT.slice(0, 8)];
    const b = Array(64).fill(0); b[27] = b[36] = -1; b[28] = b[35] = 1;
    const flips = (s, p, bb = b) => {
      if (bb[s]) return [];
      const r = s >> 3, c = s & 7, out = [];
      for (const [dr, dc] of [...D4, ...DX]) { const line = []; let rr = r + dr, cc = c + dc;
        while (inb(rr, cc) && bb[rr * 8 + cc] === -p) { line.push(rr * 8 + cc); rr += dr; cc += dc; }
        if (line.length && inb(rr, cc) && bb[rr * 8 + cc] === p) out.push(...line); }
      return out;
    };
    const legal = (p, bb = b) => { const m = []; for (let s = 0; s < 64; s++) if (!bb[s] && flips(s, p, bb).length) m.push(s); return m; };
    const w = U.clear();
    U.el('p', 'bg1-note', L('Ставьте свой стул так, чтобы зажать чужие с двух сторон — они перейдут к вам. Ваши — розовые.', 'Place a chair to flank your rival’s chairs — they flip to you. Yours are pink.'), w);
    const bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
    const bd = U.board(w, 8);
    const cells = []; for (let s = 0; s < 64; s++) { const c = U.el('div', 'bg1-cell ' + (((s >> 3) + (s & 7)) % 2 ? 'bg1-dk' : 'bg1-lt'), null, bd); c.onclick = () => tap(s); cells.push(c); }
    let turn = 1, done = false, last = -1, mine = legal(1);
    function render() {
      cells.forEach((c, s) => { c.innerHTML = b[s] ? `<i class="bg1-pc ${b[s] > 0 ? 'bg1-me' : 'bg1-ai'}">🪑</i>` : ''; c.classList.toggle('bg1-tg', turn === 1 && !done && mine.includes(s)); c.classList.toggle('bg1-last', s === last); });
      cnt.textContent = L(`Вы ${b.filter(x => x > 0).length} : ${b.filter(x => x < 0).length} отдел продаж`, `You ${b.filter(x => x > 0).length} : ${b.filter(x => x < 0).length} Sales`);
      st.textContent = done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Отдел продаж ходит…', 'Sales is moving…');
    }
    function put(s, p) { flips(s, p).forEach(x => { b[x] = p; }); b[s] = p; last = s; api.sfx.click?.(); }
    function next(p) {
      // p — кто только что ходил
      const op = legal(-p), me = legal(p);
      if (!op.length && !me.length) return finish();
      if (op.length) { turn = -p; } else { turn = p; api.toast(p === 1 ? L('Продажам некуда ходить — снова вы', 'Sales has no move — your turn again') : L('Вам некуда ходить — пропуск', 'You have no move — pass')); }
      mine = turn === 1 ? legal(1) : []; render();
      if (turn === -1) U.later(ai, 520);
    }
    function tap(s) { if (done || turn !== 1 || !mine.includes(s)) return; put(s, 1); next(1); }
    function ai() {
      if (done) return;
      let best = -Infinity, mv = -1;
      for (const s of legal(-1)) {
        const f = flips(s, -1), nb = b.slice(); f.forEach(x => { nb[x] = -1; }); nb[s] = -1;
        const rep = legal(1, nb), corner = rep.some(x => W8[x] === 100);
        const v = W8[s] * 2 + f.length - rep.length * 1.5 - (corner ? 80 : 0) + Math.random();
        if (v > best) { best = v; mv = s; }
      }
      put(mv, -1); next(-1);
    }
    function finish() {
      done = true; render();
      const a = b.filter(x => x > 0).length, c = b.filter(x => x < 0).length;
      api.end({ won: a > c, score: a > c ? a : null, text: a > c ? L(`Переговорка ваша: ${a} стульев против ${c}.`, `The room is yours: ${a} chairs to ${c}.`) : a === c ? L(`Ничья ${a}:${c} — переговорку делят пополам.`, `Draw ${a}:${c}.`) : L(`Отдел продаж занял переговорку: ${c} против ${a}.`, `Sales took the room: ${c} to ${a}.`) });
    }
    render();
  };

  // ───────── 8. Согласование ─────────
  B[8] = (root, api) => {
    const { L } = api, U = mk(root, api);
    const SIGN = ['👩‍💼', '👨‍💼', '🧑‍💻', '👩‍🔬', '🧑‍🏫', '👨‍🔧', '👩‍⚖️', '🧑‍🎨', '👷', '🕵️'], WALL = ['🪴', '🗄️', '🖨️', '📦'];
    const SIZES = [5, 6, 7];
    const genPath = N => {
      for (let tries = 0; tries < 400; tries++) {
        const want = Math.round(N * N * (.8 + Math.random() * .12)), seen = new Set();
        let cur = Math.floor(Math.random() * N * N); const path = [cur]; seen.add(cur);
        const nbs = i => D4.map(([dr, dc]) => [Math.floor(i / N) + dr, i % N + dc]).filter(([r, c]) => inb(r, c, N)).map(([r, c]) => r * N + c).filter(x => !seen.has(x));
        while (path.length < want) {
          const o = nbs(cur); if (!o.length) break;
          const sc = o.map(x => nbs(x).length + Math.random() * 1.2), m = Math.min(...sc);
          cur = o[sc.indexOf(m)]; seen.add(cur); path.push(cur);
        }
        if (path.length >= want) return path;
      }
      return [...Array(N * N).keys()].map(i => { const r = Math.floor(i / N), c = i % N; return r * N + (r % 2 ? N - 1 - c : c); });
    };
    const w = U.clear();
    U.el('p', 'bg1-note', L('Проведите документ 📄 по всем столам ровно по одному разу и закончите у директора 👔. Ведите пальцем или нажимайте на соседние столы; нажатие на пройденный стол — откат.', 'Drag the document 📄 through every desk exactly once and finish at the director 👔. Tap a visited desk to step back.'), w);
    const bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), tm = U.el('span', 'bg1-dim', '', bar);
    const clk = U.clock(tm); clk.start();
    const host = U.el('div', '', null, w);
    const row = U.el('div', 'bg1-row', null, w), reset = U.el('button', 'bg1-btn', L('↺ Сначала', '↺ Restart'), row);
    let round = 0, done = false, N, sol, desk, path, cells, bd, svg, start, end;
    function setup() {
      N = SIZES[round]; sol = genPath(N); start = sol[0]; end = sol[sol.length - 1];
      desk = new Set(sol); path = [];
      host.innerHTML = ''; bd = U.board(host, N, 'bg1-ap', 400);
      cells = [];
      for (let i = 0; i < N * N; i++) {
        const c = U.el('div', 'bg1-cell' + (desk.has(i) ? '' : ' bg1-wall'), i === start ? '📄' : i === end ? '👔' : desk.has(i) ? api.rnd(SIGN) : api.rnd(WALL), bd);
        c.dataset.i = i; cells.push(c);
      }
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `0 0 ${N} ${N}`); bd.append(svg);
      let down = false;
      bd.onpointerdown = e => { down = true; try { bd.setPointerCapture(e.pointerId); } catch {} hit(e, true); };
      bd.onpointermove = e => { if (down) hit(e, false); };
      bd.onpointerup = bd.onpointercancel = () => { down = false; };
      render();
    }
    function hit(e, tapEv) {
      const r = bd.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N);
      if (!inb(y, x, N)) return; handle(y * N + x, tapEv);
    }
    function handle(i, tapEv) {
      if (done || !desk.has(i)) return;
      if (!path.length) { if (i === start) { path.push(i); api.sfx.click?.(); render(); } else if (tapEv) api.toast(L('Начните с документа 📄', 'Start from the document 📄')); return; }
      const last = path[path.length - 1]; if (i === last) return;
      const k = path.indexOf(i);
      if (k >= 0) { if (tapEv || k === path.length - 2) { path.length = k + 1; render(); } return; }
      const adj = Math.abs(Math.floor(i / N) - Math.floor(last / N)) + Math.abs(i % N - last % N) === 1;
      if (!adj || last === end) return;
      path.push(i); api.sfx.click?.(); render();
      if (path.length === desk.size && i === end) {
        api.sfx.stamp?.();
        if (round < SIZES.length - 1) { round++; st.textContent = L('✅ Подписано!', '✅ Signed!'); done = true; U.later(() => { done = false; setup(); }, 700); }
        else { done = true; const t = clk.stop(); api.end({ won: true, score: t, lowerBetter: true, text: L(`Три документа согласованы за ${U.fmt(t)}.`, `Three documents approved in ${U.fmt(t)}.`) }); }
      } else if (i === end) api.toast(L('Директор подпишет последним — обойдите все столы', 'The director signs last — visit every desk first'));
    }
    function render() {
      const set = new Set(path);
      cells.forEach((c, i) => { c.classList.toggle('bg1-vis', set.has(i)); c.classList.toggle('bg1-head', i === path[path.length - 1]); });
      const pts = path.map(i => `${i % N + .5},${Math.floor(i / N) + .5}`).join(' ');
      svg.innerHTML = path.length > 1 ? `<polyline points="${pts}" fill="none" stroke="var(--magenta)" stroke-width=".14" stroke-linecap="round" stroke-linejoin="round" opacity=".6" style="filter:drop-shadow(0 0 .1px var(--magenta))"/>` : '';
      if (!done) st.textContent = L(`Документ ${round + 1}/3 · подписей ${path.length}/${desk.size}`, `Doc ${round + 1}/3 · signatures ${path.length}/${desk.size}`);
    }
    reset.onclick = () => { if (!done) { path = []; render(); } };
    setup();
  };

  // ───────── 9. Путь к кулеру (лабиринт дня) ─────────
  B[9] = (root, api) => {
    const { L } = api, U = mk(root, api), C = 11, R = 13;
    const rng = api.daySeed('maze');
    const wall = Array(C * R).fill(15), seen = new Uint8Array(C * R);   // 1 N, 2 E, 4 S, 8 W
    const DIR = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    const stack = [0]; seen[0] = 1;
    while (stack.length) {
      const i = stack[stack.length - 1], x = i % C, y = Math.floor(i / C);
      const o = DIR.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < C && ny < R && !seen[ny * C + nx]; });
      if (!o.length) { stack.pop(); continue; }
      const [dx, dy, bit, back] = o[Math.floor(rng() * o.length)], j = (y + dy) * C + x + dx;
      wall[i] &= ~bit; wall[j] &= ~back; seen[j] = 1; stack.push(j);
    }
    const w = U.clear();
    const bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', L('Лабиринт дня — одинаковый у всех', 'Maze of the day — same for everyone'), bar), tm = U.el('span', 'bg1-dim', '', bar);
    const clk = U.clock(tm);
    const Wd = U.W(420), cs = Math.floor(Wd / C), dpr = window.devicePixelRatio || 1;
    const cv = U.el('canvas', 'bg1-mz', null, w); cv.width = cs * C * dpr; cv.height = cs * R * dpr; cv.style.width = cs * C + 'px'; cv.style.height = cs * R + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const pad = U.el('div', 'bg1-pad', null, w);
    [['', -1], ['↑', 0], ['', -1], ['←', 3], ['↓', 2], ['→', 1]].forEach(([t, d]) => { const bt = U.el('button', '', t, pad); if (d < 0) bt.style.visibility = 'hidden'; else bt.onclick = () => run(d, false); });
    U.el('p', 'bg1-note', L('Свайп — бежать до развилки, стрелки — шаг, тап по коридору — дойти туда.', 'Swipe to run to the next fork, arrows to step, tap a corridor to walk there.'), w);
    let pos = 0, done = false, steps = 0; const trail = new Set([0]), goal = C * R - 1;
    function draw() {
      ctx.clearRect(0, 0, cs * C, cs * R);
      ctx.fillStyle = '#12121d'; ctx.fillRect(0, 0, cs * C, cs * R);
      ctx.fillStyle = 'rgba(255,59,212,.16)'; trail.forEach(i => ctx.fillRect(i % C * cs + 2, Math.floor(i / C) * cs + 2, cs - 4, cs - 4));
      ctx.strokeStyle = '#2de2e6'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.shadowColor = '#2de2e6'; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < C * R; i++) { const x = i % C * cs, y = Math.floor(i / C) * cs, m = wall[i];
        if (m & 1) { ctx.moveTo(x, y); ctx.lineTo(x + cs, y); } if (m & 8) { ctx.moveTo(x, y); ctx.lineTo(x, y + cs); }
        if (m & 2 && i % C === C - 1) { ctx.moveTo(x + cs, y); ctx.lineTo(x + cs, y + cs); } if (m & 4 && Math.floor(i / C) === R - 1) { ctx.moveTo(x, y + cs); ctx.lineTo(x + cs, y + cs); } }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.font = `${Math.floor(cs * .7)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🚰', goal % C * cs + cs / 2, Math.floor(goal / C) * cs + cs / 2 + 1);
      ctx.fillText('🧑‍💼', pos % C * cs + cs / 2, Math.floor(pos / C) * cs + cs / 2 + 1);
    }
    const canGo = (i, d) => !(wall[i] & DIR[d][2]);
    const stepTo = (i, d) => i + DIR[d][0] + DIR[d][1] * C;
    function move(d) { if (!canGo(pos, d)) return false; pos = stepTo(pos, d); trail.add(pos); steps++; return true; }
    function run(d, far) {
      if (done) return; clk.start();
      if (!move(d)) { api.buzz?.('tap'); return; }
      if (far) { let back = (d + 2) % 4, guard = 0;
        while (pos !== goal && guard++ < 200) { const o = [0, 1, 2, 3].filter(k => k !== back && canGo(pos, k)); if (o.length !== 1) break; move(o[0]); back = (o[0] + 2) % 4; } }
      api.sfx.click?.(); draw(); check();
    }
    function check() {
      if (pos !== goal) return; done = true; const t = clk.stop(); api.sfx.item?.();
      api.end({ won: true, score: t, lowerBetter: true, text: L(`Вы дошли до кулера за ${t.toFixed(1)} с (${steps} шагов). Завтра — новый лабиринт.`, `You reached the cooler in ${t.toFixed(1)} s (${steps} steps). New maze tomorrow.`) });
    }
    let sx = 0, sy = 0, down = false;
    cv.onpointerdown = e => { down = true; sx = e.clientX; sy = e.clientY; };
    cv.onpointerup = e => {
      if (!down || done) return; down = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.hypot(dx, dy) > 24) return run(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0), true);
      const r = cv.getBoundingClientRect(), tx = Math.floor((e.clientX - r.left) / cs), ty = Math.floor((e.clientY - r.top) / cs), px = pos % C, py = Math.floor(pos / C);
      if (tx !== px && ty !== py) return;
      const d = tx > px ? 1 : tx < px ? 3 : ty > py ? 2 : ty < py ? 0 : -1; if (d < 0) return;
      const n = Math.abs(tx - px) + Math.abs(ty - py); let p = pos;
      for (let k = 0; k < n; k++) { if (!canGo(p, d)) return api.buzz?.('tap'); p = stepTo(p, d); }
      clk.start(); for (let k = 0; k < n; k++) move(d); api.sfx.click?.(); draw(); check();
    };
    cv.onpointercancel = () => { down = false; };
    U.on(window, 'keydown', e => { const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, ц: 0, в: 1, ы: 2, ф: 3 }[e.key]; if (d != null) { e.preventDefault(); run(d, false); } });
    draw();
  };

  // ───────── 10. Стопки отчётов (ханойская башня) ─────────
  B[10] = (root, api) => {
    const { L } = api, U = mk(root, api);
    U.menu(L('Сколько папок в стопке?', 'How many folders?'), [3, 4, 5, 6].map(v => ({ v, t: `${'📁'.repeat(Math.min(v, 6))} ${v}${v === 5 ? ' · 🏆' : ''}`, s: L(`Минимум ${2 ** v - 1} ходов`, `At least ${2 ** v - 1} moves`) + (v === 5 ? L(' · рекорд считается здесь', ' · records count here') : '') })), play,
      L('Переложите всю стопку из «Входящих» в «Архив». За раз — одна папка, большую нельзя класть на меньшую.', 'Move the whole stack from Inbox to Archive. One folder at a time, never a bigger one on a smaller one.'));
    const COL = ['#ff8be6', '#ff3bd4', '#b26bff', '#7df9ff', '#2de2e6', '#d4ff3a'];
    function play(n) {
      const pegs = [[...Array(n).keys()].map(i => n - i), [], []], min = 2 ** n - 1;
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w), mv = U.el('span', 'bg1-st', '', bar), tm = U.el('span', 'bg1-dim', '', bar);
      const clk = U.clock(tm);
      const box = U.el('div', 'bg1-hn', null, w);
      const names = [L('Входящие', 'Inbox'), L('В работе', 'In progress'), L('Архив', 'Archive')];
      let sel = -1, moves = 0, done = false;
      const els = pegs.map((_, p) => { const e = U.el('div', 'bg1-peg', null, box); e.onclick = () => tap(p); return e; });
      function render() {
        els.forEach((e, p) => {
          e.innerHTML = `<small>${names[p]}</small>`; e.classList.toggle('bg1-on', p === sel);
          pegs[p].forEach((sz, k) => { const f = U.el('div', 'bg1-fd' + (p === sel && k === pegs[p].length - 1 ? ' bg1-up' : ''), `📁${sz}`, e); f.style.width = `${30 + 70 * sz / n}%`; f.style.background = COL[(sz - 1) % COL.length]; });
        });
        mv.textContent = L(`Ходов: ${moves} · минимум ${min}`, `Moves: ${moves} · minimum ${min}`);
      }
      function tap(p) {
        if (done) return;
        if (sel < 0) { if (pegs[p].length) { sel = p; api.sfx.click?.(); } render(); return; }
        if (p === sel) { sel = -1; render(); return; }
        const a = pegs[sel], t = pegs[p], f = a[a.length - 1];
        if (t.length && t[t.length - 1] < f) { api.toast(L('Большую папку нельзя класть на меньшую', 'A bigger folder can’t go on a smaller one')); api.buzz?.('danger'); sel = -1; render(); return; }
        clk.start(); t.push(a.pop()); sel = -1; moves++; api.sfx.click?.(); render();
        if (pegs[2].length === n) { done = true; const s = clk.stop();
          api.end({ won: true, score: n === 5 ? moves : null, lowerBetter: true, text: (moves === min ? L('Идеально! ', 'Perfect! ') : '') + L(`${n} папок в архиве: ${moves} ходов (минимум ${min}) за ${U.fmt(s)}.`, `${n} folders archived: ${moves} moves (min ${min}) in ${U.fmt(s)}.`) }); }
      }
      render();
    }
  };
})();
