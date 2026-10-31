// «☕ Разминка», игры 11–20: пазлы и картинки.
// Пазл «Корпоратив», пазл с персонажем, 10 отличий, «Где степлер?», кабель, трубы кулера, танграм, раскраска, стикеры, «Разбей таблицу».
// Всё рисуется процедурно (canvas / DOM), без внешних картинок. Глобальных имён не заводим — только BREAK_IMPL[n].
(() => {
  const B = window.BREAK_IMPL = window.BREAK_IMPL || {};
  let L = (ru) => ru, api0 = null;

  // ---------- Общие стили ----------
  const CSS = `
.bgb2-hud{display:flex;flex-wrap:wrap;gap:6px 8px;justify-content:center;align-items:center;width:100%;margin:2px 0 8px;font-weight:800;font-size:13px;color:var(--text-2)}
.bgb2-hud b{color:var(--text)}
.bgb2-chip{padding:4px 10px;border-radius:999px;border:1.5px solid var(--line);background:rgba(var(--w-rgb),.04);white-space:nowrap}
.bgb2-chip.warn{border-color:rgba(255,59,107,.7);color:var(--down)}
.bgb2-btn{border:1.5px solid rgba(var(--c-rgb),.6);border-radius:999px;background:transparent;color:var(--cyan-l);padding:7px 14px;font:inherit;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 0 12px rgba(var(--c-rgb),.25);touch-action:manipulation}
.bgb2-btn:active{transform:scale(.96)}
.bgb2-btn[disabled]{opacity:.4}
.bgb2-cv{display:block;touch-action:none;border-radius:14px;max-width:100%;-webkit-tap-highlight-color:transparent}
.bgb2-menu{display:flex;flex-direction:column;gap:10px;width:min(100%,340px);margin-top:12px;text-align:center}
.bgb2-menu p{margin:0 0 4px;color:var(--text-2);line-height:1.35}
.bgb2-opt{padding:13px 14px;border-radius:16px;border:1.5px solid rgba(var(--m-rgb),.55);background:linear-gradient(160deg,rgba(var(--m-rgb),.14),rgba(var(--c-rgb),.06));color:var(--text);font:inherit;font-weight:800;font-size:16px;cursor:pointer;box-shadow:0 0 16px rgba(var(--m-rgb),.18)}
.bgb2-opt small{display:block;font-weight:600;font-size:12px;color:var(--text-2);margin-top:2px}
.bgb2-opt:active{transform:scale(.98)}
.bgb2-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0;width:100%}
.bgb2-tip{margin:6px 0 0;font-size:12px;color:var(--text-2);text-align:center}
.bgb2-shake{animation:bgb2-shake .28s}
@keyframes bgb2-shake{0%,100%{translate:0}25%{translate:-6px}75%{translate:6px}}
.bg13-wrap{display:flex;flex-direction:column;gap:8px;align-items:center}
.bg14-field{position:relative;overflow:hidden;border-radius:16px;border:1.5px solid var(--line);touch-action:manipulation;cursor:pointer;
  background:radial-gradient(circle at 20% 15%,rgba(var(--c-rgb),.13),transparent 45%),radial-gradient(circle at 85% 80%,rgba(var(--m-rgb),.13),transparent 45%),
  repeating-linear-gradient(45deg,rgba(var(--w-rgb),.035) 0 12px,transparent 12px 24px),var(--panel)}
.bg14-it{position:absolute;left:0;top:0;line-height:1;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.bg14-it svg{display:block;width:100%;height:100%}
.bg14-want{display:inline-grid;place-items:center;width:30px;height:30px;font-size:24px;line-height:1;vertical-align:middle}
.bg14-want svg{width:30px;height:20px}
.bg14-ring{position:absolute;border-radius:50%;border:3px solid var(--up);box-shadow:0 0 16px var(--up);pointer-events:none;translate:-50% -50%;animation:bg14-pop .5s ease-out}
.bg14-miss{position:absolute;width:30px;height:30px;border-radius:50%;border:3px solid var(--down);pointer-events:none;translate:-50% -50%;animation:bg14-pop .45s ease-out forwards}
@keyframes bg14-pop{from{scale:.3;opacity:1}to{scale:1.2;opacity:.2}}
.bg18-pal{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px;max-width:100%}
.bg18-sw{position:relative;width:40px;height:40px;border-radius:12px;border:2px solid rgba(var(--w-rgb),.25);font:inherit;font-weight:900;font-size:15px;cursor:pointer;touch-action:manipulation;transition:transform .1s}
.bg18-sw.on{border-color:var(--magenta);box-shadow:0 0 14px rgba(var(--m-rgb),.8);transform:scale(1.1)}
.bg18-sw.done::after{content:'✓';position:absolute;right:-5px;top:-7px;font-size:12px;color:var(--up);text-shadow:0 0 4px #000}
`;
  const css = () => {
    if (document.getElementById('bg-style-2')) return;
    const s = document.createElement('style'); s.id = 'bg-style-2'; s.textContent = CSS; document.head.append(s);
  };
  const reg = (n, fn) => { B[n] = (root, api) => { L = api.L; api0 = api; css(); fn(root, api); }; };

  // ---------- Помощники ----------
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const dprOf = () => Math.min(3, window.devicePixelRatio || 1);
  const widthOf = root => Math.max(280, Math.min(560, root.clientWidth || 360));
  const fmt = s => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function canvas(parent, w, h) {
    const cv = el('canvas', 'bgb2-cv'), dpr = dprOf();
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    parent.append(cv);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv, ctx, w, h };
  }
  const xy = (cv, e) => { const r = cv.getBoundingClientRect(), k = (parseFloat(cv.style.width) || r.width) / (r.width || 1); return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
  const hud = root => { const h = el('div', 'bgb2-hud'); root.append(h); return h; };
  const chip = (html, cls = '') => `<span class="bgb2-chip ${cls}">${html}</span>`;
  function stopwatch(api, tick, ms = 500) {
    const t0 = performance.now(); let extra = 0, stopped = null;
    const id = setInterval(() => tick?.(), ms); api.onExit(() => clearInterval(id));
    return { get: () => ((stopped ?? performance.now()) - t0) / 1000 + extra, add: s => { extra += s; }, stop() { stopped = performance.now(); clearInterval(id); } };
  }
  const later = (api, ms, fn) => { const id = setTimeout(fn, ms); api.onExit(() => clearTimeout(id)); };
  function rafLoop(api) { let id = 0, dead = false; api.onExit(() => { dead = true; cancelAnimationFrame(id); }); return fn => { if (dead) return; cancelAnimationFrame(id); id = requestAnimationFrame(fn); }; }
  function menu(root, api, title, opts, pick) {
    const box = el('div', 'bgb2-menu', `<p>${title}</p>`);
    for (const [label, val, sub] of opts) {
      const b = el('button', 'bgb2-opt', `${label}${sub ? `<small>${sub}</small>` : ''}`); b.type = 'button';
      b.onclick = () => { api.sfx.click?.(); box.remove(); pick(val); };
      box.append(b);
    }
    root.append(box);
  }
  function rr(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2); };
  const poly = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const NEON = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ff8a3b', '#b26bff', '#ffd23a', '#ff8be6', '#3ab4ff'];

  // =====================================================================
  // 11 / 12. Пазл-обменник: тап по двум кусочкам — меняются местами; можно тащить
  // =====================================================================
  function swapPuzzle(root, api, intro, paint) {
    let gone = false; api.onExit(() => { gone = true; });
    menu(root, api, intro, [
      ['3 × 3', 3, L('9 кусочков — для разгона', '9 pieces — a warm-up')],
      ['4 × 4', 4, L('16 кусочков', '16 pieces')],
      ['5 × 5', 5, L('25 кусочков — для упорных', '25 pieces — for the stubborn')],
    ], n => start(n));
    async function start(n) {
      const S = Math.min(widthOf(root), 460), dpr = dprOf();
      const img = document.createElement('canvas'); img.width = img.height = Math.round(S * dpr);
      const ic = img.getContext('2d'); ic.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wait = el('p', 'bgb2-tip', L('Рисую картинку…', 'Drawing the picture…')); root.append(wait);
      try { await paint(ic, S); } catch (e) { console.error(e); }
      if (gone) return;
      wait.remove();
      const h = hud(root);
      const { cv, ctx } = canvas(root, S, S);
      const bar = el('div', 'bgb2-row'); root.append(bar);
      const peekB = el('button', 'bgb2-btn', '👁 ' + L('Подсмотреть (держите)', 'Peek (hold)')); peekB.type = 'button'; bar.append(peekB);
      root.append(el('p', 'bgb2-tip', L('Нажмите на два кусочка, чтобы поменять их местами, или перетащите кусочек', 'Tap two pieces to swap them, or drag a piece')));
      const N = n * n, cs = S / n; let perm, sel = -1, drag = null, moves = 0, peek = false, done = false;
      do perm = api.shuffle([...Array(N).keys()]); while (perm.filter((p, i) => p === i).length > Math.floor(N / 5));
      const sw = stopwatch(api, () => upd());
      const upd = () => { h.innerHTML = chip(`⏱ <b>${fmt(sw.get())}</b>`) + chip(`${L('Ходы', 'Moves')}: <b>${moves}</b>`) + chip(`${L('На месте', 'In place')}: <b>${perm.filter((p, i) => p === i).length}/${N}</b>`); };
      const piece = (p, dx, dy, s = cs) => ctx.drawImage(img, (p % n) * cs * dpr, Math.floor(p / n) * cs * dpr, cs * dpr, cs * dpr, dx, dy, s, s);
      function draw() {
        ctx.clearRect(0, 0, S, S);
        if (peek || done) { ctx.drawImage(img, 0, 0, S, S); if (done) { ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 4; ctx.shadowColor = '#d4ff3a'; ctx.shadowBlur = 16; ctx.strokeRect(2, 2, S - 4, S - 4); ctx.shadowBlur = 0; } return; }
        for (let i = 0; i < N; i++) {
          const x = (i % n) * cs, y = Math.floor(i / n) * cs;
          if (drag?.moved && drag.i === i) { ctx.fillStyle = '#0c0b16'; ctx.fillRect(x, y, cs, cs); continue; }
          piece(perm[i], x, y);
          if (perm[i] !== i) { ctx.strokeStyle = 'rgba(10,8,20,.75)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + .75, y + .75, cs - 1.5, cs - 1.5); }
        }
        if (drag?.moved) {
          const j = cellAt(drag.x, drag.y);
          if (j >= 0 && j !== drag.i) { ctx.strokeStyle = '#2de2e6'; ctx.lineWidth = 3; ctx.strokeRect((j % n) * cs + 1.5, Math.floor(j / n) * cs + 1.5, cs - 3, cs - 3); }
          const s = cs * 1.08;
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 18; piece(perm[drag.i], drag.x - drag.ox * 1.08, drag.y - drag.oy * 1.08, s); ctx.restore();
          ctx.strokeStyle = '#ff3bd4'; ctx.lineWidth = 2; ctx.strokeRect(drag.x - drag.ox * 1.08, drag.y - drag.oy * 1.08, s, s);
        }
        if (sel >= 0) { ctx.strokeStyle = '#ff3bd4'; ctx.lineWidth = 3.5; ctx.shadowColor = '#ff3bd4'; ctx.shadowBlur = 12; ctx.strokeRect((sel % n) * cs + 2, Math.floor(sel / n) * cs + 2, cs - 4, cs - 4); ctx.shadowBlur = 0; }
      }
      const cellAt = (x, y) => (x < 0 || y < 0 || x >= S || y >= S) ? -1 : Math.floor(y / cs) * n + Math.floor(x / cs);
      function swap(a, b) {
        [perm[a], perm[b]] = [perm[b], perm[a]]; moves++;
        if (perm[a] === a || perm[b] === b) api.sfx.item?.(); else api.sfx.click?.();
        if (perm.every((p, i) => p === i)) {
          done = true; sw.stop(); draw(); upd();
          const t = Math.round(sw.get());
          later(api, 700, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Картинка ${n}×${n} собрана за ${fmt(t)}, ходов: ${moves}`, `${n}×${n} picture done in ${fmt(t)}, ${moves} moves`) }));
        }
      }
      cv.onpointerdown = e => {
        if (done) return; const [x, y] = xy(cv, e), i = cellAt(x, y); if (i < 0) return;
        cv.setPointerCapture?.(e.pointerId);
        drag = { i, x, y, sx: x, sy: y, ox: x - (i % n) * cs, oy: y - Math.floor(i / n) * cs, moved: false };
      };
      cv.onpointermove = e => {
        if (!drag) return; const [x, y] = xy(cv, e); drag.x = x; drag.y = y;
        if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 8) { drag.moved = true; sel = -1; }
        if (drag.moved) draw();
      };
      cv.onpointerup = cv.onpointercancel = e => {
        if (!drag) return; const d = drag; drag = null;
        if (d.moved) { const j = cellAt(d.x, d.y); if (j >= 0 && j !== d.i && e.type === 'pointerup') swap(d.i, j); }
        else if (sel < 0) { sel = d.i; api.sfx.click?.(); }
        else if (sel === d.i) sel = -1;
        else { swap(sel, d.i); sel = -1; }
        draw(); upd();
      };
      const setPeek = v => { if (done) return; peek = v; draw(); };
      peekB.onpointerdown = e => { e.preventDefault(); setPeek(true); sw.add(1); };
      peekB.onpointerup = peekB.onpointerleave = peekB.onpointercancel = () => setPeek(false);
      draw(); upd();
    }
  }

  // Картинка «Корпоратив»: стена, окно с ночным городом, гирлянда, диско-шар, шарики, люди в колпаках, стол с тортом
  function paintParty(c, S, R) {
    const r = (a, b) => a + R() * (b - a), pick = a => a[Math.floor(R() * a.length)];
    let g = c.createLinearGradient(0, 0, 0, S * .75); g.addColorStop(0, '#2d1656'); g.addColorStop(1, '#1b1240');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    c.fillStyle = 'rgba(255,255,255,.035)'; for (let x = 0; x < S; x += S / 10) c.fillRect(x, 0, S / 20, S * .74);
    // окно с ночным городом
    const wx = S * .05, wy = S * .15, ww = S * .32, wh = S * .3;
    g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#08163c'); g.addColorStop(1, '#3d2a72'); c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
    c.fillStyle = '#fff3c4'; circ(c, wx + ww * .8, wy + wh * .2, S * .028); c.fill();
    c.fillStyle = '#fff'; for (let i = 0; i < 9; i++) c.fillRect(wx + r(0, ww), wy + r(0, wh * .4), 1.5, 1.5);
    for (let i = 0; i < 7; i++) {
      const bw = ww / 7, bh = r(.3, .78) * wh, bx = wx + i * bw;
      c.fillStyle = ['#141432', '#1f1b48', '#261a40'][i % 3]; c.fillRect(bx, wy + wh - bh, bw + .5, bh);
      for (let k = 0; k < 8; k++) if (R() < .55) { c.fillStyle = pick(['#ffd23a', '#7df9ff', '#ffb35c']); c.fillRect(bx + bw * (.18 + (k % 2) * .42), wy + wh - bh + bh * (.08 + Math.floor(k / 2) * .22), bw * .22, bh * .07); }
    }
    c.strokeStyle = '#e6e2f6'; c.lineWidth = S * .014; c.strokeRect(wx, wy, ww, wh);
    c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.stroke();
    // растяжка
    const bx = S * .46, by = S * .17, bw = S * .5, bh = S * .12;
    c.save(); c.shadowColor = '#ff3bd4'; c.shadowBlur = S * .04; c.fillStyle = '#ff3bd4'; rr(c, bx, by, bw, bh, S * .02); c.fill(); c.restore();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${S * .05}px "Arial Black", Arial, sans-serif`;
    c.fillText(L('УРА, ПЯТНИЦА!', 'HAPPY FRIDAY!'), bx + bw / 2, by + bh / 2 + 1, bw * .9);
    // часы 18:00
    const cx0 = S * .86, cy0 = S * .4, cr = S * .05;
    c.fillStyle = '#f6f4ff'; circ(c, cx0, cy0, cr); c.fill(); c.strokeStyle = '#2de2e6'; c.lineWidth = S * .01; c.stroke();
    c.strokeStyle = '#1b1240'; c.lineWidth = S * .008; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0, cy0 + cr * .7); c.moveTo(cx0, cy0); c.lineTo(cx0, cy0 - cr * .8); c.stroke();
    // гирлянды с флажками
    for (let row = 0; row < 2; row++) {
      const y0 = S * (.025 + row * .07), sag = S * (.06 + row * .02), cols = row ? ['#d4ff3a', '#ff8a3b', '#2de2e6', '#ff3bd4'] : ['#ffd23a', '#ff3b6b', '#b26bff', '#2de2e6', '#d4ff3a'];
      const at = t => [t * S, y0 + 4 * sag * t * (1 - t)];
      c.strokeStyle = '#ddd'; c.lineWidth = 1.5; c.beginPath(); for (let t = 0; t <= 1.001; t += .02) { const [x, y] = at(t); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      const k = 13 - row * 2;
      for (let i = 0; i < k; i++) { const t = (i + .5) / k, [x, y] = at(t), fw = S / k * .38; c.fillStyle = cols[i % cols.length]; poly(c, [[x - fw, y], [x + fw, y], [x, y + fw * 2.1]]); c.fill(); }
    }
    // диско-шар
    const dx = S * .4, dy = S * .1, dr = S * .055;
    c.strokeStyle = '#bbb'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(dx, 0); c.lineTo(dx, dy - dr); c.stroke();
    g = c.createRadialGradient(dx - dr * .3, dy - dr * .3, dr * .1, dx, dy, dr); g.addColorStop(0, '#fff'); g.addColorStop(1, '#7a86a8'); c.fillStyle = g; circ(c, dx, dy, dr); c.fill();
    c.save(); circ(c, dx, dy, dr); c.clip(); c.strokeStyle = 'rgba(30,30,60,.5)'; c.lineWidth = 1;
    for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(dx - dr, dy + i * dr / 4); c.lineTo(dx + dr, dy + i * dr / 4); c.moveTo(dx + i * dr / 4, dy - dr); c.lineTo(dx + i * dr / 4, dy + dr); c.stroke(); }
    c.restore();
    c.globalAlpha = .18; for (let i = 0; i < 6; i++) { c.fillStyle = NEON[i]; const a = -0.2 + i * .55; poly(c, [[dx, dy], [dx + Math.cos(a) * S * .5, dy + Math.sin(a) * S * .5 + S * .2], [dx + Math.cos(a + .08) * S * .5, dy + Math.sin(a + .08) * S * .5 + S * .2]]); c.fill(); }
    c.globalAlpha = 1;
    // пол
    g = c.createLinearGradient(0, S * .74, 0, S); g.addColorStop(0, '#3a2350'); g.addColorStop(1, '#1d1230'); c.fillStyle = g; c.fillRect(0, S * .74, S, S * .26);
    c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1;
    for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(S / 2 + i * S * .08, S * .74); c.lineTo(S / 2 + i * S * .22, S); c.stroke(); }
    for (const y of [.8, .87, .95]) { c.beginPath(); c.moveTo(0, S * y); c.lineTo(S, S * y); c.stroke(); }
    // шарики
    const balloon = (x, y, rad, col, sx, sy) => {
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + rad * 1.2); c.quadraticCurveTo(x + rad, (y + sy) / 2, sx, sy); c.stroke();
      c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rad * .85, rad * 1.1, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x - rad * .3, y - rad * .4, rad * .18, rad * .3, -.4, 0, Math.PI * 2); c.fill();
    };
    for (let i = 0; i < 4; i++) balloon(S * (.05 + i * .045 + r(-.01, .01)), S * (.55 + (i % 2) * .07), S * .045, ['#ff3b6b', '#ffd23a', '#2de2e6', '#b26bff'][i], S * .1, S * .78);
    for (let i = 0; i < 3; i++) balloon(S * (.86 + i * .045), S * (.53 + (i % 2) * .06), S * .043, ['#d4ff3a', '#ff8be6', '#ff8a3b'][i], S * .92, S * .78);
    // люди за столом
    const ppl = [[.24, '#3a7bd5', 1], [.42, '#ff8a3b', 0], [.6, '#2de2e6', 1], [.77, '#d4ff3a', 0]];
    const skins = ['#f3d2b8', '#e7b896', '#c98e66', '#8d5a3b'];
    ppl.forEach(([px, shirt, armsUp], i) => {
      const x = S * px, hy = S * (.47 + (i % 2) * .02), hr = S * .045, sk = pick(skins);
      c.fillStyle = shirt; rr(c, x - S * .07, hy + hr * .9, S * .14, S * .3, S * .05); c.fill();
      c.strokeStyle = shirt; c.lineWidth = S * .03; c.lineCap = 'round'; c.beginPath();
      if (armsUp) { c.moveTo(x - S * .05, hy + hr * 1.6); c.lineTo(x - S * .1, hy - hr * .6); c.moveTo(x + S * .05, hy + hr * 1.6); c.lineTo(x + S * .1, hy - hr * .6); }
      else { c.moveTo(x + S * .05, hy + hr * 1.6); c.lineTo(x + S * .09, hy + hr * 2.6); }
      c.stroke();
      c.fillStyle = sk; if (armsUp) { circ(c, x - S * .1, hy - hr * .7, S * .016); c.fill(); circ(c, x + S * .1, hy - hr * .7, S * .016); c.fill(); }
      circ(c, x, hy, hr); c.fill();
      c.fillStyle = pick(['#2b2b33', '#6b4a2b', '#c98e3a', '#7a3b1e']); c.beginPath(); c.arc(x, hy - hr * .1, hr, Math.PI * 1.05, Math.PI * 1.95); c.fill();
      c.fillStyle = '#1b1424'; circ(c, x - hr * .35, hy + hr * .05, hr * .1); c.fill(); circ(c, x + hr * .35, hy + hr * .05, hr * .1); c.fill();
      c.strokeStyle = '#1b1424'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, hy + hr * .3, hr * .35, .2, Math.PI - .2); c.stroke();
      const hc = NEON[(i * 3 + 1) % NEON.length];
      c.fillStyle = hc; poly(c, [[x - hr * .55, hy - hr * .75], [x + hr * .55, hy - hr * .75], [x + hr * .1, hy - hr * 2.2]]); c.fill();
      c.fillStyle = '#fff'; circ(c, x + hr * .1, hy - hr * 2.2, hr * .2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - hr * .35, hy - hr * 1.1); c.lineTo(x + hr * .4, hy - hr * 1.3); c.stroke();
    });
    // стол со скатертью
    const ty = S * .66;
    c.fillStyle = '#f6f2ff'; c.fillRect(S * .08, ty, S * .84, S * .1);
    c.fillStyle = '#ff8be6'; for (let x = S * .08; x < S * .92; x += S * .04) { c.beginPath(); c.arc(x + S * .02, ty + S * .1, S * .02, 0, Math.PI); c.fill(); }
    c.fillStyle = '#d9d2f0'; c.fillRect(S * .08, ty, S * .84, S * .012);
    // торт со свечками
    const kx = S * .5;
    c.fillStyle = '#ffb35c'; rr(c, kx - S * .09, ty - S * .07, S * .18, S * .07, S * .01); c.fill();
    c.fillStyle = '#ff3b6b'; rr(c, kx - S * .065, ty - S * .115, S * .13, S * .05, S * .01); c.fill();
    c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(kx - S * .075 + i * S * .03, ty - S * .07, S * .012, 0, Math.PI); c.fill(); }
    for (let i = 0; i < 3; i++) { const x = kx - S * .04 + i * S * .04; c.fillStyle = NEON[i + 1]; c.fillRect(x - 2, ty - S * .155, 4, S * .04); c.fillStyle = '#ffd23a'; c.beginPath(); c.ellipse(x, ty - S * .165, 3, 6, 0, 0, Math.PI * 2); c.fill(); }
    // стаканчики, бутылка, пицца
    for (const [x, col] of [[.2, '#2de2e6'], [.3, '#ff3bd4'], [.68, '#d4ff3a'], [.78, '#ffd23a']]) { c.fillStyle = col; poly(c, [[S * x - S * .018, ty - S * .05], [S * x + S * .018, ty - S * .05], [S * x + S * .013, ty], [S * x - S * .013, ty]]); c.fill(); }
    c.fillStyle = '#2f8f5b'; rr(c, S * .355, ty - S * .1, S * .035, S * .1, S * .008); c.fill(); c.fillRect(S * .364, ty - S * .13, S * .017, S * .035);
    c.fillStyle = '#ffd23a'; c.fillRect(S * .357, ty - S * .07, S * .031, S * .025);
    c.fillStyle = '#e8a33a'; c.beginPath(); c.moveTo(S * .62, ty - S * .005); c.arc(S * .62, ty - S * .005, S * .055, Math.PI * 1.1, Math.PI * 1.55); c.closePath(); c.fill();
    c.fillStyle = '#d93a2a'; circ(c, S * .6, ty - S * .025, S * .007); c.fill(); circ(c, S * .615, ty - S * .045, S * .007); c.fill();
    // фикус
    c.fillStyle = '#7a4a2a'; poly(c, [[S * .84, S * .86], [S * .96, S * .86], [S * .94, S * .98], [S * .86, S * .98]]); c.fill();
    c.fillStyle = '#3fbf6a'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(S * .9 + Math.cos(i) * S * .03, S * .8 - (i % 3) * S * .03, S * .022, S * .05, i * .9 - 2, 0, Math.PI * 2); c.fill(); }
    // подарки
    for (const [x, w, col, rb] of [[.05, .09, '#b26bff', '#ffd23a'], [.15, .07, '#2de2e6', '#ff3b6b']]) {
      const y = S * .88, hh = S * .09; c.fillStyle = col; c.fillRect(S * x, y, S * w, hh); c.fillStyle = rb; c.fillRect(S * (x + w / 2) - 3, y, 6, hh); c.fillRect(S * x, y + hh * .4, S * w, 6);
    }
    // конфетти
    for (let i = 0; i < 70; i++) { c.save(); c.translate(r(0, S), r(0, S)); c.rotate(r(0, 3)); c.fillStyle = pick(NEON); c.fillRect(-3, -1.5, 6, 3); c.restore(); }
  }

  reg(11, (root, api) => {
    swapPuzzle(root, api, L('Офисный корпоратив рассыпался на кусочки. Выберите размер пазла:', 'The office party fell to pieces. Pick the puzzle size:'),
      (c, S) => paintParty(c, S, api.daySeed('party')));
  });

  // ---------- 12. Портрет персонажа ----------
  function heroFace(hero) {
    const pr = hero && typeof heroPreset === 'function' ? heroPreset(hero) : null;
    const rgb = h => [1, 3, 5].map(i => parseInt(String(h || '#e7b896').slice(i, i + 2), 16) || 0);
    const skins = typeof SKIN !== 'undefined' ? SKIN : ['#f3d2b8', '#e7b896', '#c98e66', '#8d5a3b'];
    const sk = rgb(pr?.skin), skin = pr ? skins.map((s, i) => [i, rgb(s).reduce((a, v, k) => a + (v - sk[k]) ** 2, 0)]).sort((a, b) => a[1] - b[1])[0][0] : 1;
    const hairMap = { short: 'short', quiff: 'side', buzz: 'short', bald: 'bald', bob: 'bob', long: 'long', bun: 'bun', ponytail: 'long' };
    return {
      skin, hair: pr ? hairMap[pr.hair] || 'short' : 'short', hairC: pr?.hairColor || '#3b2a20', glasses: !!pr?.glasses, beard: !!pr?.beard,
      shirt: pr?.jacket || pr?.top || '#3a7bd5', tie: pr?.tie || null, earrings: pr?.g === 'f', bg: '#24184a',
    };
  }
  function faceImage(hero) {
    return new Promise(ok => {
      if (typeof faceSvg !== 'function') return ok(null);
      try {
        let svg = faceSvg(heroFace(hero));
        if (typeof exprSvg === 'function') svg = svg.replace(exprSvg('neutral'), exprSvg('happy'));
        svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" ')
          .replace(/(<svg[^>]*>)/, '$1<style>.brow,.ln{fill:none;stroke:#1b1424;stroke-width:2.4;stroke-linecap:round}.fl{fill:#3a1424}.eyes{fill:#1b1424}.glasses{fill:rgba(255,255,255,.15);stroke:#1b1424;stroke-width:1.8}</style>');
        const img = new Image(); const t = setTimeout(() => ok(null), 3000);
        img.onload = () => { clearTimeout(t); ok(img); }; img.onerror = () => { clearTimeout(t); ok(null); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      } catch (e) { console.error(e); ok(null); }
    });
  }
  async function paintHero(c, S, hero, name) {
    let g = c.createRadialGradient(S / 2, S * .45, S * .1, S / 2, S / 2, S * .75); g.addColorStop(0, '#4a2a8a'); g.addColorStop(1, '#120a2a');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    c.globalAlpha = .22; for (let i = -4; i < 10; i++) { c.fillStyle = i % 2 ? '#2de2e6' : '#ff3bd4'; poly(c, [[i * S * .14, 0], [i * S * .14 + S * .05, 0], [i * S * .14 - S * .45, S], [i * S * .14 - S * .5, S]]); c.fill(); }
    c.globalAlpha = 1;
    // золотая рама
    c.lineWidth = S * .035; g = c.createLinearGradient(0, 0, S, S); g.addColorStop(0, '#ffe58a'); g.addColorStop(.5, '#c9932a'); g.addColorStop(1, '#ffd23a');
    c.strokeStyle = g; c.strokeRect(S * .035, S * .035, S * .93, S * .93);
    // лучи и лавры
    const cx = S / 2, cy = S * .5, R0 = S * .29;
    c.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { const a = i * 2.4, d = S * (.33 + (i % 5) * .03); circ(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.4 + (i % 3)); c.fill(); }
    c.fillStyle = 'rgba(255,210,58,.16)'; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; poly(c, [[cx, cy], [cx + Math.cos(a) * S * .6, cy + Math.sin(a) * S * .6], [cx + Math.cos(a + .17) * S * .6, cy + Math.sin(a + .17) * S * .6]]); c.fill(); }
    for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + side * (.35 + i * .26), x = cx + Math.cos(a) * (R0 + S * .05), y = cy + Math.sin(a) * (R0 + S * .05);
      c.fillStyle = i % 2 ? '#3fbf6a' : '#5fe08a'; c.beginPath(); c.ellipse(x, y, S * .018, S * .04, a + side * .6, 0, Math.PI * 2); c.fill();
    }
    // лицо
    const img = await faceImage(hero);
    c.save(); circ(c, cx, cy, R0); c.clip();
    if (img) c.drawImage(img, cx - R0, cy - R0, R0 * 2, R0 * 2);
    else {
      c.fillStyle = '#24184a'; c.fillRect(cx - R0, cy - R0, R0 * 2, R0 * 2);
      c.fillStyle = '#3a7bd5'; c.beginPath(); c.ellipse(cx, cy + R0 * 1.05, R0 * .8, R0 * .5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e7b896'; c.beginPath(); c.ellipse(cx, cy - R0 * .05, R0 * .45, R0 * .52, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3b2a20'; c.beginPath(); c.arc(cx, cy - R0 * .15, R0 * .47, Math.PI * 1.05, Math.PI * 1.95); c.fill();
      c.fillStyle = '#1b1424'; circ(c, cx - R0 * .16, cy - R0 * .05, R0 * .05); c.fill(); circ(c, cx + R0 * .16, cy - R0 * .05, R0 * .05); c.fill();
      c.strokeStyle = '#1b1424'; c.lineWidth = R0 * .04; c.beginPath(); c.arc(cx, cy + R0 * .12, R0 * .17, .3, Math.PI - .3); c.stroke();
    }
    c.restore();
    c.lineWidth = S * .018; c.strokeStyle = '#ffd23a'; c.shadowColor = '#ffd23a'; c.shadowBlur = S * .03; circ(c, cx, cy, R0); c.stroke(); c.shadowBlur = 0;
    // табличка сверху
    c.fillStyle = '#ffd23a'; rr(c, S * .17, S * .075, S * .66, S * .085, S * .03); c.fill();
    c.fillStyle = '#2a1640'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${S * .042}px "Arial Black", Arial, sans-serif`;
    c.fillText(L('СОТРУДНИК МЕСЯЦА', 'EMPLOYEE OF THE MONTH'), S / 2, S * .12, S * .6);
    // табличка с именем
    g = c.createLinearGradient(0, S * .82, 0, S * .92); g.addColorStop(0, '#ff3bd4'); g.addColorStop(1, '#a01f8a');
    c.fillStyle = g; rr(c, S * .18, S * .815, S * .64, S * .1, S * .035); c.fill();
    c.fillStyle = '#fff'; c.font = `900 ${S * .055}px "Arial Black", Arial, sans-serif`; c.fillText(name, S / 2, S * .868, S * .58);
    // значки по углам
    c.font = `${S * .08}px serif`;
    [['🏆', .14, .26], ['☕', .86, .26], ['📈', .14, .72], ['⭐', .86, .72]].forEach(([e, x, y]) => c.fillText(e, S * x, S * y));
  }
  reg(12, (root, api) => {
    const name = String(api.hero?.name || L('Вы', 'You')).slice(0, 16);
    swapPuzzle(root, api, L(`Портрет с доски почёта рассыпался, а на нём — ${api.esc(name)}! Выберите размер пазла:`, `The honour-board portrait of “${api.esc(name)}” fell apart. Pick the puzzle size:`),
      (c, S) => paintHero(c, S, api.hero, name));
  });

  // =====================================================================
  // 13. Найди 10 отличий
  // =====================================================================
  const S13 = [ // вид, x, y, w, h, можно двигать
    ['window', .03, .05, .27, .42], ['sun', .18, .09, .075, .12, 1], ['cloud', .06, .23, .11, .08, 1], ['ceil', .47, 0, .07, .11],
    ['frame', .35, .07, .14, .2], ['clock', .57, .05, .085, .14], ['cal', .57, .26, .08, .14], ['sticky', .33, .33, .045, .07, 1],
    ['shelf', .7, .3, .28, .025], ['book', .72, .15, .035, .15], ['book', .76, .17, .03, .13], ['book', .795, .14, .035, .16], ['book', .835, .16, .03, .14],
    ['trophy', .9, .17, .06, .13], ['umbrella', .01, .58, .05, .34], ['plant', .86, .5, .12, .42], ['desk', .2, .62, .6, .05], ['bin', .23, .8, .07, .15],
    ['lamp', .22, .39, .1, .23], ['monitor', .38, .37, .19, .23], ['sticky', .555, .41, .035, .055, 1], ['kbd', .41, .585, .13, .03],
    ['phone', .3, .565, .055, .05, 1], ['mug', .6, .52, .045, .1, 1], ['papers', .67, .55, .09, .07, 1], ['chair', .43, .67, .15, .31], ['cat', .63, .87, .13, .1, 1],
  ];
  const STATIC13 = new Set(['window', 'shelf', 'desk', 'kbd']);
  function draw13(c, o, W, H) {
    if (o.hidden) return;
    const x = o.x * W, y = o.y * H, w = o.w * W, h = o.h * H, col = o.c;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    switch (o.k) {
      case 'window': { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#6fc2ff'); g.addColorStop(1, '#cdeeff'); c.fillStyle = g; c.fillRect(x, y, w, h);
        c.fillStyle = '#8bc48a'; c.fillRect(x, y + h * .82, w, h * .18); c.strokeStyle = '#fff'; c.lineWidth = 4; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke(); break; }
      case 'sun': c.fillStyle = col; circ(c, x + w / 2, y + h / 2, Math.min(w, h) * .42); c.fill(); break;
      case 'cloud': c.fillStyle = col; [[.3, .6, .3], [.55, .45, .35], [.75, .62, .28]].forEach(([a, b, r]) => { circ(c, x + w * a, y + h * b, h * r * 1.3); c.fill(); }); break;
      case 'ceil': c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h * .5); c.stroke(); c.fillStyle = col; poly(c, [[x + w * .25, y + h * .5], [x + w * .75, y + h * .5], [x + w, y + h], [x, y + h]]); c.fill(); break;
      case 'frame': c.fillStyle = '#8a5a2b'; c.fillRect(x, y, w, h); c.fillStyle = '#fdf8e8'; c.fillRect(x + 4, y + 4, w - 8, h - 8);
        c.fillStyle = col; poly(c, [[x + 6, y + h - 6], [x + w * .45, y + h * .3], [x + w - 6, y + h - 6]]); c.fill(); c.fillStyle = '#ffb000'; circ(c, x + w * .75, y + h * .3, h * .09); c.fill(); break;
      case 'clock': { const r = Math.min(w, h) / 2 - 1; c.fillStyle = '#fff'; circ(c, x + w / 2, y + h / 2, r); c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
        c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, y + h / 2); c.lineTo(x + w / 2, y + h / 2 - r * .7); c.moveTo(x + w / 2, y + h / 2); c.lineTo(x + w / 2 + r * .5, y + h / 2 + r * .2); c.stroke(); break; }
      case 'cal': c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.fillStyle = col; c.fillRect(x, y, w, h * .28); c.fillStyle = '#999';
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c.fillRect(x + w * (.15 + j * .27), y + h * (.4 + i * .19), w * .14, h * .09); break;
      case 'sticky': c.translate(x + w / 2, y + h / 2); c.rotate(-.12); c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-w * .3, -h * .1); c.lineTo(w * .3, -h * .1); c.moveTo(-w * .3, h * .15); c.lineTo(w * .15, h * .15); c.stroke(); break;
      case 'shelf': c.fillStyle = '#8a5a2b'; c.fillRect(x, y, w, h); break;
      case 'book': c.fillStyle = col; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x, y + h * .15, w, h * .07); c.fillRect(x, y + h * .75, w, h * .07); break;
      case 'trophy': c.fillStyle = col; c.beginPath(); c.moveTo(x + w * .15, y); c.lineTo(x + w * .85, y); c.quadraticCurveTo(x + w * .85, y + h * .55, x + w / 2, y + h * .6); c.quadraticCurveTo(x + w * .15, y + h * .55, x + w * .15, y); c.fill();
        c.fillRect(x + w * .42, y + h * .6, w * .16, h * .2); c.fillRect(x + w * .2, y + h * .8, w * .6, h * .2); break;
      case 'umbrella': c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h * .92); c.arc(x + w * .3, y + h * .92, w * .2, 0, Math.PI); c.stroke();
        c.fillStyle = col; poly(c, [[x + w / 2, y + h * .05], [x + w, y + h * .7], [x, y + h * .7]]); c.fill(); break;
      case 'plant': c.fillStyle = '#3fae5a'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + w / 2 + Math.cos(i * 1.3) * w * .22, y + h * (.15 + (i % 3) * .14), w * .13, h * .14, i, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = col; poly(c, [[x + w * .15, y + h * .6], [x + w * .85, y + h * .6], [x + w * .72, y + h], [x + w * .28, y + h]]); c.fill(); break;
      case 'desk': c.fillStyle = '#a0703f'; c.fillRect(x, y, w, h); c.fillStyle = '#7a5530'; c.fillRect(x + w * .02, y + h, w * .03, H * .33); c.fillRect(x + w * .95, y + h, w * .03, H * .33); break;
      case 'bin': c.fillStyle = col; poly(c, [[x, y], [x + w, y], [x + w * .85, y + h], [x + w * .15, y + h]]); c.fill(); c.fillStyle = '#fff'; circ(c, x + w * .45, y, w * .22); c.fill(); break;
      case 'lamp': c.fillStyle = '#333'; c.fillRect(x + w * .1, y + h * .9, w * .5, h * .1); c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * .35, y + h * .9); c.lineTo(x + w * .2, y + h * .4); c.lineTo(x + w * .6, y + h * .15); c.stroke();
        c.fillStyle = col; poly(c, [[x + w * .45, y], [x + w * .8, y + h * .05], [x + w, y + h * .4], [x + w * .45, y + h * .25]]); c.fill(); break;
      case 'monitor': c.fillStyle = '#222'; c.fillRect(x, y, w, h * .8); c.fillStyle = col; c.fillRect(x + 3, y + 3, w - 6, h * .8 - 6); c.fillStyle = '#333'; c.fillRect(x + w * .45, y + h * .8, w * .1, h * .12); c.fillRect(x + w * .3, y + h * .92, w * .4, h * .08);
        c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * .12, y + h * .6); c.lineTo(x + w * .35, y + h * .45); c.lineTo(x + w * .55, y + h * .52); c.lineTo(x + w * .85, y + h * .2); c.stroke(); break;
      case 'kbd': c.fillStyle = '#ddd'; c.fillRect(x, y, w, h); break;
      case 'phone': c.fillStyle = '#222'; rr(c, x, y, w, h, 3); c.fill(); c.fillStyle = col; c.fillRect(x + w * .15, y + h * .15, w * .7, h * .5); break;
      case 'mug': c.fillStyle = col; c.fillRect(x, y + h * .2, w * .75, h * .8); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(x + w * .75, y + h * .55, w * .2, -Math.PI / 2, Math.PI / 2); c.stroke();
        c.strokeStyle = 'rgba(120,120,120,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w * .3, y + h * .15); c.quadraticCurveTo(x + w * .5, y, x + w * .35, y - h * .1); c.stroke(); break;
      case 'papers': for (let i = 0; i < 3; i++) { c.fillStyle = i === 2 ? col : '#fff'; c.fillRect(x + i * 2, y + h * (.6 - i * .3), w - 4, h * .35); } c.fillStyle = '#fff'; c.fillRect(x + 4, y, w - 4, h * .35); break;
      case 'chair': c.fillStyle = col; rr(c, x + w * .1, y, w * .8, h * .45, 6); c.fill(); c.fillRect(x, y + h * .5, w, h * .12); c.fillStyle = '#333'; c.fillRect(x + w * .46, y + h * .62, w * .08, h * .25);
        c.fillRect(x + w * .1, y + h * .87, w * .8, h * .05); c.fillStyle = '#111'; [.12, .5, .88].forEach(a => { circ(c, x + w * a, y + h * .95, h * .045); c.fill(); }); break;
      case 'cat': c.fillStyle = col; c.beginPath(); c.ellipse(x + w * .45, y + h * .65, w * .38, h * .35, 0, 0, Math.PI * 2); c.fill(); circ(c, x + w * .82, y + h * .45, h * .3); c.fill();
        poly(c, [[x + w * .7, y + h * .3], [x + w * .74, y], [x + w * .82, y + h * .2]]); c.fill(); poly(c, [[x + w * .84, y + h * .2], [x + w * .93, y], [x + w * .97, y + h * .3]]); c.fill();
        c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(x + w * .1, y + h * .7); c.quadraticCurveTo(x - w * .05, y + h * .2, x + w * .1, y + h * .15); c.stroke();
        c.strokeStyle = '#222'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w * .76, y + h * .45); c.lineTo(x + w * .8, y + h * .47); c.moveTo(x + w * .86, y + h * .47); c.lineTo(x + w * .9, y + h * .45); c.stroke(); break;
    }
    c.restore();
  }
  reg(13, (root, api) => {
    const R = api.daySeed('diff-' + Math.random()), pick = a => a[Math.floor(R() * a.length)];
    const W = Math.min(widthOf(root), 520), H = Math.round(W * .6);
    const PAL = ['#ff3b6b', '#2de2e6', '#3a7bd5', '#ff8a3b', '#b26bff', '#3fbf6a', '#ffd23a', '#ff8be6', '#8d5a3b', '#555a70'];
    const first = { sun: '#ffd23a', cloud: '#ffffff', mug: pick(PAL), cat: pick(['#ff8a3b', '#888', '#333']) };
    const A = S13.map(([k, x, y, w, h, mv]) => ({ k, x, y, w, h, mv: !!mv, c: first[k] || pick(PAL) }));
    const Bo = A.map(o => ({ ...o }));
    const box = o => [o.x * W, o.y * H, (o.x + o.w) * W, (o.y + o.h) * H];
    const grow = ([a, b, c2, d], p) => { const cx = (a + c2) / 2, cy = (b + d) / 2, hw = Math.max((c2 - a) / 2 + p, 17), hh = Math.max((d - b) / 2 + p, 17); return [cx - hw, cy - hh, cx + hw, cy + hh]; };
    const hit = (b, x, y) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
    const over = (p, q) => p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3];
    const diffs = [];
    for (const i of api.shuffle(A.map((_, i) => i), R)) {
      if (diffs.length >= 10) break;
      const o = A[i]; if (STATIC13.has(o.k)) continue;
      const modes = ['hide', 'color', 'color']; if (o.mv) modes.push('move', 'move');
      const mode = pick(modes), m = Bo[i];
      if (mode === 'hide') m.hidden = true;
      else if (mode === 'color') m.c = pick(PAL.filter(c => c !== o.c && c !== '#ffffff'));
      else m.x += (R() < .5 ? -1 : 1) * (.03 + R() * .015);
      const b0 = box(o), b1 = box(m), bb = grow([Math.min(b0[0], b1[0]), Math.min(b0[1], b1[1]), Math.max(b0[2], b1[2]), Math.max(b0[3], b1[3])], 6);
      if (diffs.some(d => over(d.b, bb))) { Bo[i] = { ...o }; continue; }
      diffs.push({ b: bb, found: false });
    }
    const TOTAL = diffs.length, LIMIT = 90, MISS = 3;
    const h = hud(root), wrap = el('div', 'bg13-wrap'); root.append(wrap);
    const left = canvas(wrap, W, H), right = canvas(wrap, W, H);
    root.append(el('p', 'bgb2-tip', L('Нажимайте на отличия на любой из картинок. Промахов можно три.', 'Tap the differences on either picture. Three misses allowed.')));
    let found = 0, miss = 0, done = false;
    const sw = stopwatch(api, () => { upd(); if (!done && sw.get() >= LIMIT) finish(); });
    const upd = () => { h.innerHTML = chip(`🔍 <b>${found}/${TOTAL}</b>`) + chip(`${L('Промахи', 'Misses')}: <b>${Math.min(miss, MISS)}/${MISS}</b>`, miss >= MISS ? 'warn' : '') + chip(`⏱ <b>${fmt(Math.max(0, LIMIT - sw.get()))}</b>`, LIMIT - sw.get() < 15 ? 'warn' : ''); };
    function paint(cv, objs, showMissed) {
      const c = cv.ctx; c.clearRect(0, 0, W, H);
      c.fillStyle = '#efe6d4'; c.fillRect(0, 0, W, H); c.fillStyle = '#d9cbb0'; c.fillRect(0, H * .78, W, H * .22);
      c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 1; for (let x = 0; x < W; x += W / 14) { c.beginPath(); c.moveTo(x, H * .78); c.lineTo(x - W * .05, H); c.stroke(); }
      objs.forEach(o => draw13(c, o, W, H));
      for (const d of diffs) if (d.found || showMissed) {
        const cx = (d.b[0] + d.b[2]) / 2, cy = (d.b[1] + d.b[3]) / 2, r = Math.max(d.b[2] - d.b[0], d.b[3] - d.b[1]) / 2 + 2;
        c.save(); c.lineWidth = 3; c.strokeStyle = d.found ? '#3ad13a' : '#ff3b6b'; if (!d.found) c.setLineDash([6, 5]);
        c.shadowColor = '#fff'; c.shadowBlur = 4; circ(c, cx, cy, r); c.stroke(); c.restore();
      }
    }
    const paintAll = (m) => { paint(left, A, m); paint(right, Bo, m); };
    function finish() {
      if (done) return; done = true; sw.stop(); paintAll(true); upd();
      const won = found >= Math.min(TOTAL, 7);
      later(api, found === TOTAL ? 500 : 1400, () => api.end({ score: found, won, text: found === TOTAL ? L(`Все отличия найдены за ${fmt(sw.get())}`, `All differences found in ${fmt(sw.get())}`) : L(`Найдено ${found} из ${TOTAL}. Пропущенные обведены красным`, `Found ${found} of ${TOTAL}. Missed ones are circled in red`) }));
    }
    for (const cv of [left, right]) cv.cv.onpointerdown = e => {
      if (done) return; const [x, y] = xy(cv.cv, e);
      let best = null; for (const d of diffs) if (!d.found && hit(d.b, x, y)) { const dd = Math.hypot(x - (d.b[0] + d.b[2]) / 2, y - (d.b[1] + d.b[3]) / 2); if (!best || dd < best[1]) best = [d, dd]; }
      if (best) { best[0].found = true; found++; api.sfx.item?.(); paintAll(false); upd(); if (found === TOTAL) finish(); return; }
      if (diffs.some(d => d.found && hit(d.b, x, y))) return;
      miss++; api.buzz?.('danger'); cv.cv.classList.remove('bgb2-shake'); void cv.cv.offsetWidth; cv.cv.classList.add('bgb2-shake'); upd();
      if (miss > MISS) finish();
    };
    paintAll(false); upd();
  });

  // =====================================================================
  // 14. Где степлер? — найдите предмет в завалах опенспейса
  // =====================================================================
  const STAPLER = '<svg viewBox="0 0 44 28" aria-hidden="true"><rect x="2" y="20" width="40" height="6" rx="2" fill="#9aa3b8"/><rect x="2" y="20" width="40" height="2" fill="#c9d0e0"/><path d="M5 18 L33 9 Q41 7 42 12 L42 17 L6 21 Z" fill="#e0263f"/><path d="M8 15 L33 9 Q38 8 40 10" stroke="#ff7a8a" stroke-width="1.6" fill="none"/><circle cx="6" cy="19" r="3" fill="#555c70"/></svg>';
  const ITEMS14 = [
    ['📎', 'скрепку', 'paper clip'], ['✂️', 'ножницы', 'scissors'], ['🖊️', 'ручку', 'pen'], ['📌', 'кнопку', 'push pin'], ['🔑', 'ключ', 'key'], ['☕', 'кофе', 'coffee'],
    ['📱', 'телефон', 'phone'], ['🧮', 'счёты', 'abacus'], ['📏', 'линейку', 'ruler'], ['📐', 'угольник', 'set square'], ['🔋', 'батарейку', 'battery'], ['💾', 'дискету', 'floppy disk'],
    ['🎧', 'наушники', 'headphones'], ['🕶️', 'очки', 'sunglasses'], ['🍪', 'печеньку', 'cookie'], ['🍩', 'пончик', 'donut'], ['💡', 'лампочку', 'light bulb'], ['🔌', 'вилку', 'plug'],
    ['🖱️', 'мышку', 'mouse'], ['📒', 'блокнот', 'notebook'], ['✏️', 'карандаш', 'pencil'], ['🗂️', 'картотеку', 'card index'], ['🍌', 'банан', 'banana'], ['⏰', 'будильник', 'alarm clock'],
    ['📦', 'коробку', 'box'], ['🧲', 'магнит', 'magnet'], ['🍎', 'яблоко', 'apple'], ['💼', 'портфель', 'briefcase'], ['🧾', 'чек', 'receipt'], ['🏷️', 'ценник', 'price tag'],
    ['🖇️', 'сцепку скрепок', 'linked clips'], ['🪴', 'фикус', 'potted plant'], ['🧸', 'мишку', 'teddy bear'], ['🔦', 'фонарик', 'flashlight'], ['🗝️', 'старый ключ', 'old key'], ['🥤', 'газировку', 'soda'],
  ];
  reg(14, (root, api) => {
    const W = widthOf(root), Hf = Math.round(Math.min(W * 1.15, Math.max(330, (window.innerHeight || 800) - 210)));
    const ROUNDS = 5, LIMIT = 180, PEN = 3;
    const h = hud(root), field = el('div', 'bg14-field'); field.style.width = W + 'px'; field.style.height = Hf + 'px'; root.append(field);
    root.append(el('p', 'bgb2-tip', L(`Промах — штраф +${PEN} с. Предмет может быть частично прикрыт.`, `A miss costs +${PEN} s. The item may be partly covered.`)));
    const targets = [{ svg: STAPLER, ru: 'степлер', en: 'stapler' }, ...api.shuffle(ITEMS14).slice(0, ROUNDS - 1).map(([e, ru, en]) => ({ e, ru, en }))];
    let round = 0, tgt = null, done = false, busy = false, misses = 0;
    const sw = stopwatch(api, () => { upd(); if (!done && sw.get() >= LIMIT) { done = true; sw.stop(); reveal(); later(api, 1200, () => api.end({ score: null, won: false, text: L(`Время вышло — найдено ${round} из ${ROUNDS}`, `Time’s up — found ${round} of ${ROUNDS}`) })); } }, 200);
    const icon = t => t.svg || t.e;
    const upd = () => {
      const T = targets[Math.min(round, ROUNDS - 1)];
      h.innerHTML = chip(`${L('Найдите', 'Find')}: <span class="bg14-want">${icon(T)}</span> <b>${L(T.ru, T.en)}</b>`) + chip(`${Math.min(round + 1, ROUNDS)}/${ROUNDS}`) + chip(`⏱ <b>${sw.get().toFixed(1)}</b>`, sw.get() > LIMIT - 20 ? 'warn' : '');
    };
    function deal() {
      field.innerHTML = '';
      const T = targets[round], R = Math.random, ts = 34 + R() * 6;
      const tx = ts / 2 + 6 + R() * (W - ts - 12), ty = ts / 2 + 6 + R() * (Hf - ts - 12);
      tgt = { x: tx, y: ty, s: ts };
      const pool = ITEMS14.filter(([e]) => e !== T.e);
      const kinds = api.shuffle(pool).slice(0, 14);
      if (round > 0 && R() < .7) kinds.push(['STAPLER']);   // степлер — частый «шум» в следующих раундах
      const n = 42 + round * 7, items = [];
      for (let i = 0; i < n; i++) {
        const s = 24 + R() * 16; let x, y, k = 0;
        do { x = s / 2 + R() * (W - s); y = s / 2 + R() * (Hf - s); } while (Math.hypot(x - tx, y - ty) < (s + ts) * .38 && ++k < 20);
        items.push({ g: kinds[Math.floor(R() * kinds.length)][0], x, y, s, rot: R() * 80 - 40, z: Math.floor(R() * 100) });
      }
      items.push({ g: T.svg ? 'STAPLER' : T.e, x: tx, y: ty, s: ts, rot: R() * 50 - 25, z: 30 + Math.floor(R() * 40), me: true });
      for (const it of items) {
        const d = el('span', 'bg14-it', it.g === 'STAPLER' ? STAPLER : it.g);
        const w = it.g === 'STAPLER' ? it.s * 1.3 : it.s;
        Object.assign(d.style, { fontSize: it.s + 'px', width: it.g === 'STAPLER' ? w + 'px' : '', height: it.g === 'STAPLER' ? w * .64 + 'px' : '', zIndex: it.z, transform: `translate(${it.x}px, ${it.y}px) translate(-50%, -50%) rotate(${it.rot}deg)` });
        field.append(d);
      }
      upd();
    }
    function ring(x, y, s, cls) { const r = el('div', cls); Object.assign(r.style, { left: x + 'px', top: y + 'px', zIndex: 200 }); if (s) Object.assign(r.style, { width: s + 'px', height: s + 'px' }); field.append(r); return r; }
    const reveal = () => ring(tgt.x, tgt.y, tgt.s * 1.6, 'bg14-ring');
    field.onpointerdown = e => {
      if (done || busy) return;
      const r = field.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (Math.hypot(x - tgt.x, y - tgt.y) <= Math.max(22, tgt.s * .62)) {
        api.sfx.item?.(); reveal(); round++; busy = true;
        if (round >= ROUNDS) {
          done = true; sw.stop(); upd(); const t = Math.round(sw.get() * 10) / 10;
          later(api, 600, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Все ${ROUNDS} предметов найдены за ${t} с${misses ? ` (промахов: ${misses})` : ''}`, `All ${ROUNDS} items found in ${t} s${misses ? ` (${misses} misses)` : ''}`) }));
        } else later(api, 450, () => { busy = false; deal(); });
      } else {
        misses++; sw.add(PEN); api.buzz?.('danger');
        const m = ring(x, y, 0, 'bg14-miss'); setTimeout(() => m.remove(), 500); upd();
      }
    };
    deal();
  });

  // =====================================================================
  // 15 / 16. Поворот плиток: общий движок
  // =====================================================================
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];      // бит k: 0 — север, 1 — восток, 2 — юг, 3 — запад
  const rotM = m => ((m << 1) | (m >> 3)) & 15;
  const bits = m => (m & 1) + (m >> 1 & 1) + (m >> 2 & 1) + (m >> 3 & 1);
  function flood(cols, rows, M, start, enter) {
    const d = new Array(cols * rows).fill(-1); if (!(M[start] & enter)) return d;
    d[start] = 0; const q = [start];
    while (q.length) {
      const i = q.shift(), x = i % cols, y = (i / cols) | 0;
      for (let k = 0; k < 4; k++) if (M[i] & (1 << k)) {
        const nx = x + DX[k], ny = y + DY[k]; if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const j = ny * cols + nx; if (d[j] < 0 && (M[j] & (1 << ((k + 2) % 4)))) { d[j] = d[i] + 1; q.push(j); }
      }
    }
    return d;
  }
  function rotGame(root, api, o) {
    const st = { ...o, ang: new Float32Array(o.cols * o.rows), moves: 0, done: false, live: false, t: 0 };
    st.W = o.pad[3] + o.cols * o.cell + o.pad[1]; st.H = o.pad[0] + o.rows * o.cell + o.pad[2];
    const { cv, ctx } = canvas(root, st.W, st.H); st.ctx = ctx;
    const loop = rafLoop(api);
    const frame = t => {
      st.t = t; let any = false;
      for (let i = 0; i < st.ang.length; i++) if (st.ang[i]) { st.ang[i] *= .72; if (Math.abs(st.ang[i]) < .02) st.ang[i] = 0; else any = true; }
      ctx.clearRect(0, 0, st.W, st.H); o.draw(ctx, st);
      if (any || st.live) loop(frame);
    };
    st.redraw = () => loop(frame);
    cv.onpointerdown = e => {
      if (st.done) return; const [x, y] = xy(cv, e);
      const cx = Math.floor((x - o.pad[3]) / o.cell), cy = Math.floor((y - o.pad[0]) / o.cell);
      if (cx < 0 || cy < 0 || cx >= o.cols || cy >= o.rows) return;
      const i = cy * o.cols + cx; if (!st.M[i] || st.M[i] === 15) return;
      st.M[i] = rotM(st.M[i]); st.ang[i] -= Math.PI / 2; st.moves++; api.sfx.click?.(); api.buzz?.('tap');
      o.onMove?.(st);
      if (o.check(st)) { st.done = true; o.win(st); }
      st.redraw();
    };
    st.redraw();
    return st;
  }
  const scramble = (M, R) => M.map(m => { let k = Math.floor(R() * 4); while (k--) m = rotM(m); return m; });

  // ---------- 15. Собери кабель ----------
  reg(15, (root, api) => {
    menu(root, api, L('Поверните плитки так, чтобы ток от розетки дошёл до принтера. Размер поля:', 'Rotate tiles so power flows from the socket to the printer. Grid size:'),
      [['5 × 5', 5, L('Быстрый ремонт', 'Quick fix')], ['6 × 6', 6, L('Серверная', 'Server room')], ['7 × 7', 7, L('Опенспейс после переезда', 'Open space after the move')]], N => start(N));
    function start(N) {
      const R = Math.random, W0 = widthOf(root), cell = Math.floor(Math.min(64, (W0 - 8) / (N + 1.4))), side = Math.round(cell * .7);
      const r0 = Math.floor(R() * N), r1 = Math.floor(R() * N);
      // путь от розетки до принтера — DFS со случайным порядком соседей
      const seen = new Set(), path = [];
      const go = (x, y) => { const k = y * N + x; seen.add(k); path.push(k); if (x === N - 1 && y === r1) return true;
        for (const d of api.shuffle([0, 1, 2, 3])) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= N || ny >= N || seen.has(ny * N + nx)) continue; if (go(nx, ny)) return true; }
        path.pop(); return false; };
      go(0, r0);
      const sol = new Array(N * N).fill(0);
      const dirTo = (a, b) => { const ax = a % N, ay = (a / N) | 0, bx = b % N, by = (b / N) | 0; return bx > ax ? 1 : bx < ax ? 3 : by > ay ? 2 : 0; };
      path.forEach((k, i) => {
        if (i === 0) sol[k] |= 8; else sol[k] |= 1 << ((dirTo(path[i - 1], k) + 2) % 4);
        if (i === path.length - 1) sol[k] |= 2; else sol[k] |= 1 << dirTo(k, path[i + 1]);
        if (R() < .18 && bits(sol[k]) === 2) { const b = 1 << Math.floor(R() * 4); sol[k] |= b; }
      });
      const onPath = new Set(path);
      for (let k = 0; k < N * N; k++) if (!onPath.has(k)) sol[k] = [5, 3, 3, 7, 7, 5, 1][Math.floor(R() * 7)];
      let M; do M = scramble(sol, R); while (flood(N, N, M, r0 * N, 8)[r1 * N + N - 1] >= 0 && (M[r1 * N + N - 1] & 2));
      const h = hud(root);
      const sw = stopwatch(api, () => upd());
      const upd = () => { h.innerHTML = chip(`🔄 ${L('Повороты', 'Turns')}: <b>${st.moves}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
      let pw = [];
      const st = rotGame(root, api, {
        cols: N, rows: N, cell, pad: [6, side + 4, 6, side + 4], M,
        check: s => { pw = flood(N, N, s.M, r0 * N, 8); return pw[r1 * N + N - 1] >= 0 && !!(s.M[r1 * N + N - 1] & 2); },
        onMove: () => upd(),
        win: s => {
          sw.stop(); upd(); api.sfx.item?.(); s.live = true; s.winAt = performance.now();
          later(api, 1300, () => { s.live = false; api.end({ score: s.moves, won: true, lowerBetter: true, text: L(`Принтер заработал! Поворотов: ${s.moves}, время ${fmt(sw.get())}`, `The printer is alive! ${s.moves} turns, time ${fmt(sw.get())}`) }); });
        },
        draw(c, s) {
          const ox = s.pad[3], oy = s.pad[0], lit = '#d4ff3a', dim = '#5c5878';
          if (!pw.length) pw = flood(N, N, s.M, r0 * N, 8);
          c.fillStyle = '#100e1e'; rr(c, ox - 3, oy - 3, N * cell + 6, N * cell + 6, 12); c.fill();
          for (let i = 0; i < N * N; i++) {
            const x = ox + (i % N) * cell, y = oy + ((i / N) | 0) * cell, on = pw[i] >= 0;
            c.fillStyle = on ? '#1f2a14' : '#1a1830'; rr(c, x + 2, y + 2, cell - 4, cell - 4, 8); c.fill();
            c.save(); c.translate(x + cell / 2, y + cell / 2); c.rotate(s.ang[i]);
            c.lineCap = 'round'; c.strokeStyle = on ? lit : dim; c.lineWidth = cell * .16;
            if (on) { c.shadowColor = lit; c.shadowBlur = 10; }
            c.beginPath(); for (let k = 0; k < 4; k++) if (s.M[i] & (1 << k)) { c.moveTo(0, 0); c.lineTo(DX[k] * cell / 2, DY[k] * cell / 2); } c.stroke();
            c.shadowBlur = 0; c.fillStyle = on ? lit : '#8a86a8'; circ(c, 0, 0, cell * .12); c.fill();
            if (bits(s.M[i]) === 1) { c.fillStyle = '#1a1830'; circ(c, 0, 0, cell * .06); c.fill(); }
            c.restore();
          }
          // розетка слева и принтер справа
          const sy = oy + r0 * cell + cell / 2, py = oy + r1 * cell + cell / 2, done = s.done;
          c.strokeStyle = lit; c.lineWidth = cell * .16; c.lineCap = 'round'; c.shadowColor = lit; c.shadowBlur = 10; c.beginPath(); c.moveTo(side * .6, sy); c.lineTo(ox, sy); c.stroke(); c.shadowBlur = 0;
          c.strokeStyle = done ? lit : dim; c.beginPath(); c.moveTo(ox + N * cell, py); c.lineTo(s.W - side * .55, py); c.stroke();
          c.fillStyle = '#f2f0ff'; rr(c, 2, sy - side * .55, side * .8, side * 1.1, 6); c.fill();
          c.font = `${side * .7}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⚡', side * .42, sy + 1);
          c.font = `${side * .85}px serif`; c.fillText('🖨️', s.W - side * .48, py);
          if (done) { const k = Math.min(1, (performance.now() - (s.winAt || 0)) / 900); c.fillStyle = '#fff'; c.fillRect(s.W - side * .78, py - side * .4 - k * side * .7, side * .6, k * side * .7); }
        },
      });
      upd();
    }
  });

  // ---------- 16. Трубы кулера ----------
  reg(16, (root, api) => {
    const R = Math.random, cols = 6, rows = 6, W0 = widthOf(root), cell = Math.floor(Math.min(60, (W0 - 12) / cols)), topH = Math.round(cell * 1.5), botH = Math.round(cell * 1.15);
    const bc = 2 + Math.floor(R() * 2), nCups = R() < .5 ? 2 : 3;
    const cupCols = api.shuffle([0, 1, 2, 3, 4, 5]).reduce((a, c) => (a.length < nCups && a.every(x => Math.abs(x - c) > 1) ? [...a, c] : a), []).sort((a, b) => a - b);
    const N = cols * rows, root0 = bc, cupsI = cupCols.map(c => (rows - 1) * cols + c);
    // случайное остовное дерево (Прим), потом обрезаем лишние листья — остаётся дерево от бутыли к стаканам
    const T = new Array(N).fill(0), inT = new Set([root0]), fr = [];
    const addFr = i => { for (let k = 0; k < 4; k++) { const x = i % cols + DX[k], y = ((i / cols) | 0) + DY[k]; if (x >= 0 && y >= 0 && x < cols && y < rows) fr.push([i, y * cols + x, k]); } };
    addFr(root0);
    while (inT.size < N) { const [a, b, k] = fr.splice(Math.floor(R() * fr.length), 1)[0]; if (inT.has(b)) continue; inT.add(b); T[a] |= 1 << k; T[b] |= 1 << ((k + 2) % 4); addFr(b); }
    const need = new Set([root0, ...cupsI]); let ch = true;
    while (ch) { ch = false; for (let i = 0; i < N; i++) if (T[i] && !need.has(i) && bits(T[i]) === 1) { const k = Math.log2(T[i]), j = i + DX[k] + DY[k] * cols; T[j] &= ~(1 << ((k + 2) % 4)); T[i] = 0; ch = true; } }
    const sol = T.map((m, i) => m ? m | (i === root0 ? 1 : 0) | (cupsI.includes(i) ? 4 : 0) : (R() < .75 ? [5, 3, 3, 7][Math.floor(R() * 4)] : 0));
    const ok = M => { const d = flood(cols, rows, M, root0, 1); return cupsI.every(i => d[i] >= 0 && (M[i] & 4)); };
    let M; do M = scramble(sol, R); while (ok(M));
    const h = hud(root);
    const sw = stopwatch(api, () => upd());
    const upd = () => { h.innerHTML = chip(`🥤 ${L('Стаканы', 'Cups')}: <b>${wet.filter(Boolean).length}/${cupsI.length}</b>`) + chip(`🔄 <b>${st ? st.moves : 0}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
    let dist = [], wet = [], st = null;
    const recalc = s => { dist = flood(cols, rows, s.M, root0, 1); wet = cupsI.map(i => dist[i] >= 0 && !!(s.M[i] & 4)); };
    st = rotGame(root, api, {
      cols, rows, cell, pad: [topH, 6, botH, 6], M,
      check: s => { recalc(s); return wet.every(Boolean); },
      onMove: () => upd(),
      win: s => {
        sw.stop(); api.sfx.item?.(); s.live = true; s.winAt = performance.now(); upd();
        later(api, 2300, () => { s.live = false; api.end({ score: Math.round(sw.get()), won: true, lowerBetter: true, text: L(`Вода пошла! Время ${fmt(sw.get())}, поворотов: ${s.moves}`, `Water’s flowing! Time ${fmt(sw.get())}, ${s.moves} turns`) }); });
      },
      draw(c, s) {
        if (!dist.length) recalc(s);
        const ox = s.pad[3], oy = s.pad[0], el2 = s.done ? (performance.now() - s.winAt) / 1000 : 0, maxD = Math.max(1, ...dist);
        const g = c.createLinearGradient(0, 0, 0, s.H); g.addColorStop(0, '#0c2238'); g.addColorStop(1, '#091526'); c.fillStyle = g; rr(c, 0, 0, s.W, s.H, 14); c.fill();
        for (let i = 0; i < N; i++) {
          const x = ox + (i % cols) * cell, y = oy + ((i / cols) | 0) * cell;
          c.fillStyle = (i + ((i / cols) | 0)) % 2 ? '#12304a' : '#102a42'; c.fillRect(x, y, cell, cell);
          if (!s.M[i]) continue;
          const isWet = dist[i] >= 0 && (!s.done || dist[i] <= el2 * maxD * 1.4);
          c.save(); c.translate(x + cell / 2, y + cell / 2); c.rotate(s.ang[i]); c.lineCap = 'butt';
          const seg = () => { c.beginPath(); for (let k = 0; k < 4; k++) if (s.M[i] & (1 << k)) { c.moveTo(0, 0); c.lineTo(DX[k] * cell / 2, DY[k] * cell / 2); } };
          seg(); c.strokeStyle = '#4b5d73'; c.lineWidth = cell * .36; c.stroke();
          seg(); c.strokeStyle = '#a9bdd2'; c.lineWidth = cell * .3; c.stroke();
          seg(); c.strokeStyle = isWet ? '#3ab4ff' : '#26384c'; c.lineWidth = cell * .15; if (isWet) { c.shadowColor = '#3ab4ff'; c.shadowBlur = 8; } c.stroke(); c.shadowBlur = 0;
          if (isWet && s.live) { seg(); c.setLineDash([cell * .08, cell * .14]); c.lineDashOffset = -performance.now() / 25; c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = cell * .05; c.stroke(); c.setLineDash([]); }
          c.fillStyle = '#c4d4e4'; for (let k = 0; k < 4; k++) if (s.M[i] & (1 << k)) { c.save(); c.rotate(k * Math.PI / 2); c.fillRect(-cell * .21, -cell / 2, cell * .42, cell * .07); c.restore(); }
          c.fillStyle = '#8fa4ba'; circ(c, 0, 0, cell * .19); c.fill(); c.fillStyle = isWet ? '#3ab4ff' : '#26384c'; circ(c, 0, 0, cell * .085); c.fill();
          c.restore();
        }
        // бутыль кулера
        const bx = ox + bc * cell + cell / 2, by = oy;
        c.fillStyle = '#a9bdd2'; c.fillRect(bx - cell * .15, by - cell * .3, cell * .3, cell * .3);
        c.fillStyle = 'rgba(125,220,255,.35)'; rr(c, bx - cell * .55, 6, cell * 1.1, topH - cell * .4, cell * .3); c.fill();
        c.strokeStyle = '#7df9ff'; c.lineWidth = 2; c.stroke();
        c.fillStyle = 'rgba(58,180,255,.75)'; rr(c, bx - cell * .48, 6 + (topH - cell * .4) * .25, cell * .96, (topH - cell * .4) * .7, cell * .25); c.fill();
        c.fillStyle = '#2de2e6'; c.fillRect(bx - cell * .22, 2, cell * .44, cell * .14);
        // стаканы
        cupCols.forEach((cc, j) => {
          const x = ox + cc * cell + cell / 2, y = oy + rows * cell + 4, w = cell * .7, hh = botH - 10;
          c.fillStyle = '#a9bdd2'; c.fillRect(x - cell * .15, y - 4, cell * .3, 6);
          const fill = wet[j] ? (s.done ? Math.min(1, Math.max(0, el2 - .4) / 1.2) : .15) : 0;
          poly(c, [[x - w / 2, y + 2], [x + w / 2, y + 2], [x + w * .38, y + hh], [x - w * .38, y + hh]]); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); c.strokeStyle = '#f2f0ff'; c.lineWidth = 2; c.stroke();
          if (fill > 0) { const fy = y + hh - (hh - 4) * fill; c.save(); poly(c, [[x - w / 2, y + 2], [x + w / 2, y + 2], [x + w * .38, y + hh], [x - w * .38, y + hh]]); c.clip(); c.fillStyle = '#3ab4ff'; c.fillRect(x - w, fy, w * 2, hh); c.restore(); }
        });
      },
    });
    root.append(el('p', 'bgb2-tip', L('Нажимайте на трубы, чтобы повернуть. Вода должна дойти до каждого стакана.', 'Tap pipes to rotate them. Water must reach every cup.')));
    recalc(st); upd();
  });

  // =====================================================================
  // 17. Танграм «Логотип»: 7 фигур, тап — поворот на 45°, перетаскивание с примагничиванием к сетке
  // =====================================================================
  const TAN = { LT: [[0, 0], [4, 0], [2, 2]], MT: [[0, 0], [2, 0], [0, 2]], ST: [[0, 0], [2, 0], [1, 1]], SQ: [[1, 0], [2, 1], [1, 2], [0, 1]], PG: [[0, 0], [2, 0], [3, 1], [1, 1]] };
  // силуэты и найденные перебором решения (на целочисленной решётке)
  const SIL17 = [
    { ru: 'Стикер', en: 'Sticky note', p: [[0, 0], [4, 0], [4, 4], [0, 4]],
      sol: [[[0, 0], [4, 0], [2, 2]], [[0, 4], [0, 0], [2, 2]], [[4, 0], [4, 2], [3, 3], [3, 1]], [[3, 1], [3, 3], [2, 2]], [[2, 2], [3, 3], [2, 4], [1, 3]], [[4, 4], [2, 4], [4, 2]], [[2, 4], [0, 4], [1, 3]]] },
    { ru: 'Пирамида продаж', en: 'Sales pyramid', p: [[0, 4], [4, 0], [8, 4]],
      sol: [[[4, 0], [4, 4], [2, 2]], [[4, 2], [4, 0], [5, 1]], [[5, 1], [6, 2], [5, 3], [4, 2]], [[4, 4], [0, 4], [2, 2]], [[4, 4], [4, 2], [6, 4]], [[7, 3], [5, 3], [6, 2]], [[5, 3], [7, 3], [8, 4], [6, 4]]] },
    { ru: 'Стрелка роста', en: 'Growth arrow', p: [[0, 2], [4, 2], [4, 0], [7, 3], [4, 6], [4, 4], [0, 4], [1, 3]],
      sol: [[[4, 4], [4, 0], [6, 2]], [[0, 2], [4, 2], [2, 4]], [[4, 4], [2, 4], [4, 2]], [[6, 2], [7, 3], [6, 4], [5, 3]], [[2, 4], [0, 4], [1, 3]], [[5, 3], [5, 5], [4, 6], [4, 4]], [[5, 5], [5, 3], [6, 4]]] },
    { ru: 'Шеврон', en: 'Chevron', p: [[0, 0], [4, 0], [6, 2], [4, 4], [0, 4], [2, 2]],
      sol: [[[0, 0], [4, 0], [2, 2]], [[4, 2], [2, 2], [4, 0]], [[4, 2], [4, 0], [5, 1]], [[5, 1], [6, 2], [5, 3], [4, 2]], [[4, 4], [0, 4], [2, 2]], [[2, 2], [4, 2], [5, 3], [3, 3]], [[3, 3], [5, 3], [4, 4]]] },
    { ru: 'Кристалл', en: 'Crystal', p: [[2, 0], [4, 2], [4, 4], [2, 6], [0, 4], [0, 2]],
      sol: [[[2, 0], [2, 4], [0, 2]], [[2, 4], [2, 0], [4, 2]], [[0, 4], [0, 2], [2, 4]], [[4, 2], [4, 4], [3, 3]], [[3, 3], [4, 4], [3, 5], [2, 4]], [[0, 4], [2, 4], [3, 5], [1, 5]], [[1, 5], [3, 5], [2, 6]]] },
  ];
  reg(17, (root, api) => {
    menu(root, api, L('Сложите логотип из семи фигур. Тап — поворот на 45°, тащите — двигать. Выберите силуэт:', 'Build the logo from seven pieces. Tap to rotate 45°, drag to move. Pick a silhouette:'),
      SIL17.map((s, i) => [L(s.ru, s.en), i, ['◼️', '🔺', '➡️', '▶️', '💎'][i]]), i => start(SIL17[i]));
    function start(sil) {
      const W = widthOf(root), u = Math.floor(Math.min(46, W / 9.2));
      const xs = sil.p.map(p => p[0]), ys = sil.p.map(p => p[1]), sw0 = Math.max(...xs), sh0 = Math.max(...ys);
      const topH = Math.max(5, sh0 + 1) * u, H = topH + Math.round(u * 5.6);
      const SX = Math.round((W - sw0 * u) / 2), SY = Math.round((topH - sh0 * u) / 2);
      const h = hud(root), { cv, ctx } = canvas(root, W, H);
      const bar = el('div', 'bgb2-row'); root.append(bar);
      const hintB = el('button', 'bgb2-btn', '💡 ' + L('Подсказка (+10 с)', 'Hint (+10 s)')); hintB.type = 'button'; bar.append(hintB);
      const cols = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ff8a3b', '#b26bff', '#ffd23a', '#3ab4ff'];
      const names = ['LT', 'LT', 'MT', 'ST', 'ST', 'SQ', 'PG'];
      const slots = [[.2, .3], [.52, .3], [.83, .3], [.12, .75], [.36, .75], [.62, .75], [.87, .75]];
      const pieces = names.map((nm, i) => {
        const b = TAN[nm], mx = b.reduce((a, p) => a + p[0], 0) / b.length, my = b.reduce((a, p) => a + p[1], 0) / b.length;
        return { nm, base: b.map(([x, y]) => [x - mx, y - my]), k: Math.floor(Math.random() * 8), x: W * slots[i][0], y: topH + u * 5.4 * slots[i][1], c: cols[i] };
      });
      const verts = p => { const a = p.k * Math.PI / 4, co = Math.cos(a), si = Math.sin(a); return p.base.map(([x, y]) => [p.x + (x * co - y * si) * u, p.y + (x * si + y * co) * u]); };
      const silPx = sil.p.map(([x, y]) => [SX + x * u, SY + y * u]);
      let drag = null, done = false, hintUntil = 0;
      const sw = stopwatch(api, () => upd());
      const upd = () => { h.innerHTML = chip(`🔷 <b>${L(sil.ru, sil.en)}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
      const loop = rafLoop(api);
      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,.035)'; rr(ctx, 0, 0, W, topH, 14); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.07)';
        for (let x = 0; x <= sw0; x++) for (let y = 0; y <= sh0; y++) ctx.fillRect(SX + x * u - 1, SY + y * u - 1, 2, 2);
        poly(ctx, silPx); ctx.fillStyle = '#241c44'; ctx.fill(); ctx.strokeStyle = done ? '#d4ff3a' : '#2de2e6'; ctx.lineWidth = 2; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(L('лоток с фигурами', 'piece tray'), W / 2, topH + 14);
        for (const p of pieces) {
          poly(ctx, verts(p)); ctx.fillStyle = p.c; ctx.globalAlpha = p === drag?.p ? .85 : .92; ctx.fill(); ctx.globalAlpha = 1;
          ctx.strokeStyle = 'rgba(10,6,24,.85)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
        }
        if (performance.now() < hintUntil) {
          ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
          for (const s of sil.sol) { poly(ctx, s.map(([x, y]) => [SX + x * u, SY + y * u])); ctx.stroke(); }
          ctx.restore(); loop(draw);
        }
      }
      // примагничивание: ближайшая к узлу решётки вершина
      function snap(p) {
        let best = null;
        for (const [vx, vy] of verts(p)) { const gx = Math.round((vx - SX) / u), gy = Math.round((vy - SY) / u), d = Math.hypot(SX + gx * u - vx, SY + gy * u - vy); if (!best || d < best[0]) best = [d, SX + gx * u - vx, SY + gy * u - vy]; }
        if (best && best[0] < u * .42) { p.x += best[1]; p.y += best[2]; }
        p.x = Math.max(0, Math.min(W, p.x)); p.y = Math.max(0, Math.min(H, p.y));
      }
      function check() {
        const st = 6, cnt = new Map(); let inT = 0, inC = 0, outC = 0, ovl = 0;
        const inS = (i, j) => inPoly(SX + (i + .5) * u / st, SY + (j + .5) * u / st, silPx);
        for (const p of pieces) {
          const v = verts(p), x0 = Math.floor((Math.min(...v.map(q => q[0])) - SX) / u * st), x1 = Math.ceil((Math.max(...v.map(q => q[0])) - SX) / u * st);
          const y0 = Math.floor((Math.min(...v.map(q => q[1])) - SY) / u * st), y1 = Math.ceil((Math.max(...v.map(q => q[1])) - SY) / u * st);
          for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) if (inPoly(SX + (i + .5) * u / st, SY + (j + .5) * u / st, v)) { const key = i * 10007 + j; cnt.set(key, (cnt.get(key) || 0) + 1); }
        }
        for (let i = 0; i < sw0 * st; i++) for (let j = 0; j < sh0 * st; j++) if (inS(i, j)) { inT++; if (cnt.get(i * 10007 + j)) inC++; }
        for (const [key, v] of cnt) { const i = Math.round(key / 10007), j = key - i * 10007; if (v > 1) ovl += v - 1; if (!inS(i, j)) outC++; }
        return inT > 0 && inC >= inT * .97 && outC <= inT * .03 && ovl <= inT * .03;
      }
      function after() {
        draw();
        if (!done && check()) {
          done = true; sw.stop(); upd(); draw(); api.sfx.item?.();
          const t = Math.round(sw.get());
          later(api, 700, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`«${sil.ru}» сложен за ${fmt(t)}`, `“${sil.en}” built in ${fmt(t)}`) }));
        }
      }
      const pieceAt = (x, y) => { for (let i = pieces.length - 1; i >= 0; i--) if (inPoly(x, y, verts(pieces[i]))) return i; return -1; };
      cv.onpointerdown = e => {
        if (done) return; const [x, y] = xy(cv, e), i = pieceAt(x, y); if (i < 0) return;
        const p = pieces.splice(i, 1)[0]; pieces.push(p); cv.setPointerCapture?.(e.pointerId);
        drag = { p, dx: x - p.x, dy: y - p.y, sx: x, sy: y, moved: false, t: performance.now() }; draw();
      };
      cv.onpointermove = e => {
        if (!drag) return; const [x, y] = xy(cv, e);
        if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 7) drag.moved = true;
        if (drag.moved) { drag.p.x = x - drag.dx; drag.p.y = y - drag.dy; draw(); }
      };
      cv.onpointerup = cv.onpointercancel = () => {
        if (!drag) return; const d = drag; drag = null;
        if (!d.moved) { d.p.k = (d.p.k + 1) % 8; api.sfx.click?.(); }
        snap(d.p); after();
      };
      hintB.onclick = () => { if (done) return; sw.add(10); hintUntil = performance.now() + 2500; upd(); draw(); };
      draw(); upd();
    }
  });

  // =====================================================================
  // 18. Раскраска по номерам: пиксельный портрет начальника 16×16
  // =====================================================================
  const BOSS18 = [
    '1111111111111111',
    '1111122222211111',
    '1111222222221111',
    '1113222222223111',
    '1133222222223311',
    '1132333223332311',
    '1132353223532311',
    '1132333223332311',
    '1113222772223111',
    '1112233333322111',
    '1112222772222111',
    '1111222222221111',
    '1144455665544411',
    '1444445665444441',
    '4444445665444444',
    '4444444664444444',
  ];
  reg(18, (root, api) => {
    const R = api.daySeed('boss'), pk = a => a[Math.floor(R() * a.length)];
    const PAL = [null, pk(['#2d6f8f', '#5a3d8f', '#2f7a5a', '#8f4a3a']), '#f1c7a5', '#2a2230', pk(['#2f3f6e', '#3a3a44', '#4a2f5e']), '#f4f4fa', pk(['#ff3b6b', '#ffd23a', '#2de2e6', '#d4ff3a']), '#c0505a'];
    const NAMES = [null, L('стена', 'wall'), L('лицо', 'face'), L('волосы', 'hair'), L('пиджак', 'suit'), L('рубашка', 'shirt'), L('галстук', 'tie'), L('губы', 'lips')];
    const G = BOSS18.join('').split('').map(Number), N = 16, painted = new Array(N * N).fill(0);
    const W = widthOf(root), cs = Math.floor(Math.min(30, (W - 4) / N)), S = cs * N;
    const h = hud(root), { cv, ctx } = canvas(root, S, S), pal = el('div', 'bg18-pal'); root.append(pal);
    let sel = 1, errors = 0, done = false, drag = false, last = -1;
    const swatches = PAL.map((c, i) => { if (!c) return null; const b = el('button', 'bg18-sw', String(i)); b.type = 'button'; b.title = NAMES[i]; b.style.background = c; b.style.color = i === 3 || i === 4 ? '#fff' : '#1b1424'; b.onclick = () => { sel = i; api.sfx.click?.(); refresh(); }; pal.append(b); return b; });
    root.append(el('p', 'bgb2-tip', L('Выберите цвет внизу и закрашивайте клетки с этим номером — можно вести пальцем', 'Pick a colour below and paint the cells with that number — you can drag')));
    const sw = stopwatch(api, () => upd());
    const left = c => G.filter((g, i) => g === c && painted[i] !== g).length;
    const upd = () => { const rest = G.filter((g, i) => painted[i] !== g).length; h.innerHTML = chip(`🎨 ${L('Осталось', 'Left')}: <b>${rest}</b>`) + chip(`${L('Ошибки', 'Mistakes')}: <b>${errors}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
    const lum = hex => { const v = parseInt(hex.slice(1), 16); return ((v >> 16) * 299 + (v >> 8 & 255) * 587 + (v & 255) * 114) / 1000; };
    function cellDraw(i) {
      const x = (i % N) * cs, y = Math.floor(i / N) * cs, p = painted[i], g = G[i];
      if (p) { ctx.fillStyle = PAL[p]; ctx.fillRect(x, y, cs, cs); }
      else { ctx.fillStyle = g === sel ? '#d8f8ff' : ((i + Math.floor(i / N)) % 2 ? '#f4f2fb' : '#eae7f5'); ctx.fillRect(x, y, cs, cs); }
      if (!done) {
        if (p !== g) {
          ctx.fillStyle = p ? (lum(PAL[p]) > 140 ? '#1b1424' : '#fff') : (g === sel ? '#0a6b80' : '#7a7590');
          ctx.font = `800 ${Math.round(cs * .5)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g, x + cs / 2, y + cs / 2 + 1);
          if (p) { ctx.strokeStyle = '#ff3b6b'; ctx.lineWidth = 2; ctx.strokeRect(x + 1.5, y + 1.5, cs - 3, cs - 3); }
        }
        ctx.strokeStyle = 'rgba(40,30,70,.18)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, cs - 1, cs - 1);
      }
    }
    const drawAll = () => { ctx.clearRect(0, 0, S, S); for (let i = 0; i < N * N; i++) cellDraw(i); };
    const refresh = () => { swatches.forEach((b, i) => { if (!b) return; b.classList.toggle('on', i === sel); b.classList.toggle('done', !left(i)); }); drawAll(); upd(); };
    function paint(i) {
      if (i < 0 || done || painted[i] === sel || painted[i] === G[i]) return;
      painted[i] = sel; if (sel !== G[i]) { errors++; api.buzz?.('tap'); }
      cellDraw(i);
      if (!left(sel)) { swatches[sel].classList.add('done'); api.sfx.item?.(); }
      if (painted.every((p, k) => p === G[k])) {
        done = true; sw.stop(); drawAll(); refresh();
        ctx.save(); ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 4; ctx.shadowColor = '#d4ff3a'; ctx.shadowBlur = 14; ctx.strokeRect(2, 2, S - 4, S - 4); ctx.restore();
        const t = Math.round(sw.get());
        later(api, 700, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Портрет начальника готов за ${fmt(t)}. Ошибок: ${errors}`, `The boss’s portrait is done in ${fmt(t)}. Mistakes: ${errors}`) }));
      }
    }
    const cellAt = (x, y) => (x < 0 || y < 0 || x >= S || y >= S) ? -1 : Math.floor(y / cs) * N + Math.floor(x / cs);
    cv.onpointerdown = e => { if (done) return; cv.setPointerCapture?.(e.pointerId); drag = true; const [x, y] = xy(cv, e); last = cellAt(x, y); paint(last); upd(); };
    cv.onpointermove = e => {
      if (!drag) return; const [x, y] = xy(cv, e), i = cellAt(x, y); if (i < 0 || i === last) return;
      if (last >= 0) { const ax = last % N, ay = Math.floor(last / N), bx = i % N, by = Math.floor(i / N), n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)); for (let s = 1; s < n; s++) paint(Math.round(ay + (by - ay) * s / n) * N + Math.round(ax + (bx - ax) * s / n)); }
      paint(i); last = i; upd();
    };
    cv.onpointerup = cv.onpointercancel = () => { drag = false; last = -1; refresh(); };
    refresh();
  });

  // =====================================================================
  // 19. Сложи стикеры: упаковка полимино
  // =====================================================================
  const STICK = ['#ffe45c', '#ff8be6', '#7df9ff', '#d4ff3a', '#ffb35c', '#b9a0ff', '#9dffb0', '#ff9a9a', '#8ec5ff', '#ffd1f4'];
  const normCells = cs => { const mx = Math.min(...cs.map(c => c[0])), my = Math.min(...cs.map(c => c[1])); return cs.map(([x, y]) => [x - mx, y - my]); };
  const rotCells = cs => normCells(cs.map(([x, y]) => [-y, x]));
  reg(19, (root, api) => {
    menu(root, api, L('Заполните доску стикерами без зазоров. Тащите стикер, тап — поворот. Размер доски:', 'Fill the board with sticky notes, no gaps. Drag a note, tap to rotate. Board size:'),
      [['5 × 4', [5, 4], L('Планёрка', 'Stand-up')], ['6 × 5', [6, 5], L('Спринт', 'Sprint')], ['7 × 6', [7, 6], L('Квартальный план', 'Quarterly plan')]], ([C, Rr]) => start(C, Rr));
    function start(C, Rw) {
      const Rn = Math.random, N = C * Rw, own = new Array(N).fill(-1); const regs = [];
      const nb = i => { const x = i % C, y = (i / C) | 0, o = []; for (let k = 0; k < 4; k++) { const nx = x + DX[k], ny = y + DY[k]; if (nx >= 0 && ny >= 0 && nx < C && ny < Rw) o.push(ny * C + nx); } return o; };
      for (const s of api.shuffle([...Array(N).keys()])) {
        if (own[s] >= 0) continue;
        const id = regs.length, reg0 = [s], target = 3 + Math.floor(Rn() * 3); own[s] = id;
        while (reg0.length < target) { const fr = [...new Set(reg0.flatMap(nb))].filter(j => own[j] < 0); if (!fr.length) break; const j = fr[Math.floor(Rn() * fr.length)]; own[j] = id; reg0.push(j); }
        regs.push(reg0);
      }
      // слишком маленькие кусочки приклеиваем к соседу
      for (let id = 0; id < regs.length; id++) {
        if (!regs[id] || regs[id].length > 2) continue;
        const nbIds = [...new Set(regs[id].flatMap(nb).map(j => own[j]))].filter(o => o !== id && regs[o]).sort((a, b) => regs[a].length - regs[b].length);
        const to = nbIds.find(o => regs[o].length + regs[id].length <= 6) ?? (regs[id].length === 1 ? nbIds[0] : undefined);
        if (to == null) continue;
        regs[id].forEach(j => { own[j] = to; }); regs[to].push(...regs[id]); regs[id] = null;
      }
      const pieces = regs.filter(Boolean).map((r, i) => { let cells = normCells(r.map(j => [j % C, (j / C) | 0])); for (let k = Math.floor(Rn() * 4); k--;) cells = rotCells(cells); return { cells, c: STICK[i % STICK.length], at: null, sol: [normCells(r.map(j => [j % C, (j / C) | 0])), Math.min(...r.map(j => j % C)), Math.min(...r.map(j => (j / C) | 0))] }; });
      api.shuffle(pieces).forEach((p, i) => { p.order = i; });
      pieces.sort((a, b) => a.order - b.order);
      const W = widthOf(root), cell = Math.floor(Math.min(52, (W - 16) / C)), tc = Math.max(14, Math.round(cell * .5));
      const BW = C * cell, BH = Rw * cell, BX = Math.round((W - BW) / 2), BY = 6;
      // фиксированные гнёзда в лотке (квадрат под самый длинный размер — поворот не ломает раскладку)
      let tx = 6, ty = BY + BH + 18, rowH = 0;
      for (const p of pieces) {
        const m = Math.max(...p.cells.flat()) + 1, s = m * tc + 10;
        if (tx + s > W - 4) { tx = 6; ty += rowH + 4; rowH = 0; }
        p.slot = { x: tx, y: ty, s }; tx += s + 4; rowH = Math.max(rowH, s);
      }
      const H = ty + rowH + 6;
      const h = hud(root), { cv, ctx } = canvas(root, W, H);
      root.append(el('p', 'bgb2-tip', L('Стикер, который не влез, вернётся в лоток', 'A note that doesn’t fit goes back to the tray')));
      let drag = null, done = false, moves = 0;
      const sw = stopwatch(api, () => upd());
      const filled = () => pieces.reduce((a, p) => a + (p.at ? p.cells.length : 0), 0);
      const upd = () => { h.innerHTML = chip(`🟨 <b>${filled()}/${N}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
      const dims = cs => [Math.max(...cs.map(c => c[0])) + 1, Math.max(...cs.map(c => c[1])) + 1];
      const trayOrigin = p => { const [w, hh] = dims(p.cells); return [p.slot.x + (p.slot.s - w * tc) / 2, p.slot.y + (p.slot.s - hh * tc) / 2]; };
      function drawPiece(p, ox, oy, s, lift) {
        const set = new Set(p.cells.map(([x, y]) => x + ',' + y));
        ctx.save(); if (lift) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; }
        ctx.fillStyle = p.c; for (const [x, y] of p.cells) ctx.fillRect(ox + x * s, oy + y * s, s + .5, s + .5);
        ctx.restore();
        ctx.strokeStyle = 'rgba(20,10,30,.75)'; ctx.lineWidth = 2; ctx.beginPath();
        for (const [x, y] of p.cells) for (let k = 0; k < 4; k++) if (!set.has((x + DX[k]) + ',' + (y + DY[k]))) {
          const ax = ox + (x + (k === 1 ? 1 : 0)) * s, ay = oy + (y + (k === 2 ? 1 : 0)) * s;
          if (k % 2 === 0) { ctx.moveTo(ax, ay); ctx.lineTo(ax + s, ay); } else { ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + s); }
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(20,10,30,.18)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const [x, y] of p.cells) { ctx.moveTo(ox + x * s + s * .2, oy + y * s + s * .4); ctx.lineTo(ox + x * s + s * .8, oy + y * s + s * .4); ctx.moveTo(ox + x * s + s * .2, oy + y * s + s * .62); ctx.lineTo(ox + x * s + s * .6, oy + y * s + s * .62); }
        ctx.stroke();
        const [fx, fy] = p.cells[0]; ctx.fillStyle = 'rgba(0,0,0,.18)'; poly(ctx, [[ox + (fx + 1) * s - s * .28, oy + fy * s], [ox + (fx + 1) * s, oy + fy * s], [ox + (fx + 1) * s, oy + fy * s + s * .28]]); ctx.fill();
      }
      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#1d1a33'; rr(ctx, BX - 5, BY - 5 + 5, BW + 10, BH + 10 - 5, 10); ctx.fill();
        ctx.fillStyle = '#2a2548'; ctx.fillRect(BX, BY + 5, BW, BH - 5); ctx.fillRect(BX, BY, BW, BH);
        ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
        for (let x = 0; x <= C; x++) { ctx.beginPath(); ctx.moveTo(BX + x * cell + .5, BY); ctx.lineTo(BX + x * cell + .5, BY + BH); ctx.stroke(); }
        for (let y = 0; y <= Rw; y++) { ctx.beginPath(); ctx.moveTo(BX, BY + y * cell + .5); ctx.lineTo(BX + BW, BY + y * cell + .5); ctx.stroke(); }
        ctx.strokeStyle = done ? '#d4ff3a' : 'rgba(45,226,230,.55)'; ctx.lineWidth = 2; ctx.strokeRect(BX - 1, BY - 1, BW + 2, BH + 2);
        ctx.fillStyle = 'rgba(255,255,255,.04)'; rr(ctx, 2, BY + BH + 12, W - 4, H - BY - BH - 14, 12); ctx.fill();
        for (const p of pieces) {
          if (p === drag?.p && drag.moved) continue;
          if (p.at) drawPiece(p, BX + p.at[0] * cell, BY + p.at[1] * cell, cell);
          else { const [ox, oy] = trayOrigin(p); drawPiece(p, ox, oy, tc); }
        }
        if (drag?.moved) {
          const [gx, gy] = cellPos(drag); if (fits(drag.p, gx, gy)) { ctx.fillStyle = 'rgba(212,255,58,.25)'; for (const [x, y] of drag.p.cells) ctx.fillRect(BX + (gx + x) * cell, BY + (gy + y) * cell, cell, cell); }
          drawPiece(drag.p, drag.x - drag.ox, drag.y - drag.oy, cell, true);
        }
      }
      const cellPos = d => [Math.round((d.x - d.ox - BX) / cell), Math.round((d.y - d.oy - BY) / cell)];
      const occ = skip => { const o = new Array(N).fill(false); for (const p of pieces) if (p.at && p !== skip) for (const [x, y] of p.cells) o[(p.at[1] + y) * C + p.at[0] + x] = true; return o; };
      const fits = (p, gx, gy, cells = p.cells) => { const o = occ(p); return cells.every(([x, y]) => { const X = gx + x, Y = gy + y; return X >= 0 && Y >= 0 && X < C && Y < Rw && !o[Y * C + X]; }); };
      function pieceAt(x, y) {
        for (let i = pieces.length - 1; i >= 0; i--) {
          const p = pieces[i];
          if (p.at) { const cx = Math.floor((x - BX) / cell) - p.at[0], cy = Math.floor((y - BY) / cell) - p.at[1]; if (p.cells.some(c => c[0] === cx && c[1] === cy)) return [p, BX + p.at[0] * cell, BY + p.at[1] * cell, cell]; }
          else { const [ox, oy] = trayOrigin(p), cx = Math.floor((x - ox) / tc), cy = Math.floor((y - oy) / tc); if (p.cells.some(c => c[0] === cx && c[1] === cy)) return [p, ox, oy, tc]; }
        }
        return null;
      }
      function checkWin() {
        upd();
        if (filled() === N && !done) {
          done = true; sw.stop(); draw(); api.sfx.item?.();
          const t = Math.round(sw.get());
          later(api, 700, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Доска ${C}×${Rw} заклеена за ${fmt(t)}`, `The ${C}×${Rw} board is covered in ${fmt(t)}`) }));
        }
      }
      cv.onpointerdown = e => {
        if (done) return; const [x, y] = xy(cv, e), hit = pieceAt(x, y); if (!hit) return;
        const [p, ox, oy, s] = hit; cv.setPointerCapture?.(e.pointerId);
        pieces.splice(pieces.indexOf(p), 1); pieces.push(p);
        drag = { p, x, y, sx: x, sy: y, ox: (x - ox) * cell / s, oy: (y - oy) * cell / s, moved: false };
      };
      cv.onpointermove = e => {
        if (!drag) return; const [x, y] = xy(cv, e); drag.x = x; drag.y = y;
        if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 7) drag.moved = true;
        if (drag.moved) draw();
      };
      cv.onpointerup = cv.onpointercancel = () => {
        if (!drag) return; const d = drag; drag = null; const p = d.p;
        if (!d.moved) {
          const nc = rotCells(p.cells); api.sfx.click?.();
          if (p.at && !fits(p, p.at[0], p.at[1], nc)) p.at = null;
          p.cells = nc;
        } else {
          const [gx, gy] = cellPos(d);
          if (fits(p, gx, gy)) { p.at = [gx, gy]; moves++; api.buzz?.('tap'); } else p.at = null;
        }
        draw(); checkWin();
      };
      draw(); upd();
    }
  });

  // =====================================================================
  // 20. Разбей таблицу (шикаку): прямоугольники с одним числом, равным площади
  // =====================================================================
  reg(20, (root, api) => {
    menu(root, api, L('Разбейте таблицу на прямоугольники: в каждом ровно одно число, и оно равно площади. Проведите пальцем от угла до угла.', 'Split the table into rectangles: each holds exactly one number equal to its area. Drag from corner to corner.'),
      [['6 × 6', 6, L('Табличка', 'A small sheet')], ['8 × 8', 8, L('Отчёт', 'A report')], ['10 × 10', 10, L('Годовой баланс', 'Annual balance')]], n => start(n));
    function start(n) {
      const Rn = Math.random, maxA = n <= 6 ? 8 : n <= 8 ? 10 : 12, own = new Array(n * n).fill(-1), nums = new Array(n * n).fill(0);
      let id = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        if (own[y * n + x] >= 0) continue;
        const cand = [];
        let maxW = 0; while (x + maxW < n && own[y * n + x + maxW] < 0) maxW++;
        for (let w = 1; w <= maxW; w++) for (let hh = 1; y + hh <= n; hh++) {
          let free = true; for (let i = 0; i < w && free; i++) if (own[(y + hh - 1) * n + x + i] >= 0) free = false;
          if (!free) break; const a = w * hh; if (a > maxA) break;
          if (a >= 2) cand.push([w, hh, a === 2 ? 1 : a <= 4 ? 3 : 2]);
        }
        let w = 1, hh = 1;
        if (cand.length && Rn() > .04) { let tot = cand.reduce((s, c) => s + c[2], 0), r = Rn() * tot; for (const c of cand) { r -= c[2]; if (r <= 0) { [w, hh] = c; break; } } }
        for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) own[(y + j) * n + x + i] = id;
        nums[(y + Math.floor(Rn() * hh)) * n + x + Math.floor(Rn() * w)] = w * hh; id++;
      }
      const W = widthOf(root), cs = Math.floor(Math.min(56, (W - 4) / n)), S = cs * n;
      const h = hud(root), { cv, ctx } = canvas(root, S, S);
      const bar = el('div', 'bgb2-row'); root.append(bar);
      const clr = el('button', 'bgb2-btn', '🧹 ' + L('Очистить', 'Clear')); clr.type = 'button'; bar.append(clr);
      root.append(el('p', 'bgb2-tip', L('Тап по прямоугольнику — удалить его', 'Tap a rectangle to remove it')));
      let rects = [], drag = null, done = false;
      const sw = stopwatch(api, () => upd());
      const covered = () => rects.reduce((a, r) => a + (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1), 0);
      const upd = () => { h.innerHTML = chip(`▦ <b>${covered()}/${n * n}</b>`) + chip(`${L('Прямоугольники', 'Rectangles')}: <b>${rects.length}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
      const valid = r => { let cnt = 0, v = 0; for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) if (nums[y * n + x]) { cnt++; v = nums[y * n + x]; } return cnt === 1 && v === (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1); };
      const mk = (a, b) => ({ x0: Math.min(a % n, b % n), x1: Math.max(a % n, b % n), y0: Math.min((a / n) | 0, (b / n) | 0), y1: Math.max((a / n) | 0, (b / n) | 0) });
      const ovl = (p, q) => p.x0 <= q.x1 && q.x0 <= p.x1 && p.y0 <= q.y1 && q.y0 <= p.y1;
      const COLS = ['#2de2e6', '#ff3bd4', '#d4ff3a', '#ff8a3b', '#b26bff', '#ffd23a', '#3ab4ff', '#ff8be6'];
      function draw() {
        ctx.clearRect(0, 0, S, S);
        ctx.fillStyle = '#15132a'; ctx.fillRect(0, 0, S, S);
        ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1;
        for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(i * cs + .5, 0); ctx.lineTo(i * cs + .5, S); ctx.moveTo(0, i * cs + .5); ctx.lineTo(S, i * cs + .5); ctx.stroke(); }
        rects.forEach((r, i) => {
          const ok = valid(r), col = ok ? COLS[i % COLS.length] : '#ff3b6b', x = r.x0 * cs + 3, y = r.y0 * cs + 3, w = (r.x1 - r.x0 + 1) * cs - 6, hh = (r.y1 - r.y0 + 1) * cs - 6;
          ctx.globalAlpha = ok ? .28 : .16; ctx.fillStyle = col; rr(ctx, x, y, w, hh, 7); ctx.fill(); ctx.globalAlpha = 1;
          ctx.strokeStyle = col; ctx.lineWidth = 2.5; if (!ok) ctx.setLineDash([6, 4]); rr(ctx, x, y, w, hh, 7); ctx.stroke(); ctx.setLineDash([]);
        });
        if (drag) { const r = mk(drag.a, drag.b), a = (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.strokeRect(r.x0 * cs + 2, r.y0 * cs + 2, (r.x1 - r.x0 + 1) * cs - 4, (r.y1 - r.y0 + 1) * cs - 4); ctx.setLineDash([]);
          ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(cs * .32)}px sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(a, (r.x1 + 1) * cs - 5, (r.y1 + 1) * cs - 4); }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.round(cs * .48)}px sans-serif`;
        for (let i = 0; i < n * n; i++) if (nums[i]) {
          const x = (i % n) * cs + cs / 2, y = ((i / n) | 0) * cs + cs / 2;
          ctx.fillStyle = '#f2f0ff'; circ(ctx, x, y, cs * .34); ctx.fill(); ctx.fillStyle = '#1b1424'; ctx.fillText(nums[i], x, y + 1);
        }
        if (done) { ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, S - 4, S - 4); }
      }
      const cellAt = (x, y) => { const cx = Math.max(0, Math.min(n - 1, Math.floor(x / cs))), cy = Math.max(0, Math.min(n - 1, Math.floor(y / cs))); return cy * n + cx; };
      cv.onpointerdown = e => { if (done) return; cv.setPointerCapture?.(e.pointerId); const [x, y] = xy(cv, e), c = cellAt(x, y); drag = { a: c, b: c }; draw(); };
      cv.onpointermove = e => { if (!drag) return; const [x, y] = xy(cv, e), c = cellAt(x, y); if (c !== drag.b) { drag.b = c; draw(); } };
      cv.onpointerup = cv.onpointercancel = e => {
        if (!drag) return; const d = drag; drag = null;
        if (e.type === 'pointerup') {
          const r = mk(d.a, d.b), inside = rects.findIndex(q => ovl(q, r));
          if (d.a === d.b && inside >= 0) { rects.splice(inside, 1); api.sfx.click?.(); }
          else { rects = rects.filter(q => !ovl(q, r)); rects.push(r); valid(r) ? api.buzz?.('tap') : null; api.sfx.click?.(); }
        }
        draw(); upd();
        if (!done && covered() === n * n && rects.every(valid)) {
          done = true; sw.stop(); draw(); api.sfx.item?.(); const t = Math.round(sw.get());
          later(api, 700, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Таблица ${n}×${n} разбита за ${fmt(t)}`, `The ${n}×${n} table is split in ${fmt(t)}`) }));
        }
      };
      clr.onclick = () => { if (done) return; rects = []; draw(); upd(); };
      draw(); upd();
    }
  });
})();
