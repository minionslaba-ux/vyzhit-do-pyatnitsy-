// «☕ Разминка», игры 11–20: пазлы и картинки.
// Пазл «Корпоратив», пазл с персонажем, 10 отличий, «Где степлер?», кабель, трубы кулера, танграм, раскраска, стикеры, «Разбей таблицу».
// Всё рисуется процедурно (canvas / DOM), без внешних картинок. Глобальных имён не заводим — только BREAK_IMPL[n].
(() => {
  const B = window.BREAK_IMPL = window.BREAK_IMPL || {};
  let L = (ru) => ru, api0 = null;

  // ---------- Общие стили ----------
  const CSS = `
.bgb2-hud{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;width:100%;margin:2px 0 10px;font-weight:800;font-size:13px;color:var(--text-2);font-variant-numeric:tabular-nums}
.bgb2-hud b{color:#fff;font-variant-numeric:tabular-nums}
.bgb2-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.13);white-space:nowrap;
  background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.03));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 3px 10px rgba(0,0,0,.35);transition:border-color .2s,color .2s}
.bgb2-chip.warn{border-color:rgba(255,59,107,.75);color:#ff9ab0;background:linear-gradient(180deg,rgba(255,59,107,.22),rgba(255,59,107,.06))}
.bgb2-chip.good{border-color:rgba(212,255,58,.6);background:linear-gradient(180deg,rgba(212,255,58,.18),rgba(212,255,58,.04))}
.bgb2-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(var(--c-rgb),.55);border-radius:999px;color:#fff;padding:8px 16px;font:inherit;font-weight:800;font-size:13px;cursor:pointer;touch-action:manipulation;
  background:linear-gradient(180deg,rgba(var(--c-rgb),.28),rgba(var(--c-rgb),.08));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 4px 14px rgba(0,0,0,.4),0 0 14px rgba(var(--c-rgb),.2);transition:transform .12s ease-out,box-shadow .2s}
.bgb2-btn:hover{box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 4px 14px rgba(0,0,0,.4),0 0 22px rgba(var(--c-rgb),.45)}
.bgb2-btn:active{transform:scale(.96)}
.bgb2-btn[disabled]{opacity:.4}
.bgb2-frame{position:relative;flex:none;border-radius:16px;background:#0d0b1a;line-height:0;
  box-shadow:0 0 0 1.5px rgba(255,255,255,.12),0 0 0 4px #1b1733,0 0 0 5.5px rgba(255,255,255,.07),0 16px 34px rgba(0,0,0,.6)}
.bgb2-cv{display:block;touch-action:none;border-radius:16px;max-width:100%;-webkit-tap-highlight-color:transparent}
.bgb2-fx{position:absolute;z-index:250;left:0;top:0;width:100%;height:100%;pointer-events:none;border-radius:16px}
.bgb2-pop{position:absolute;z-index:300;pointer-events:none;translate:-50% -50%;font:900 18px/1 system-ui,sans-serif;color:#d4ff3a;white-space:nowrap;
  text-shadow:0 2px 0 rgba(0,0,0,.55),0 0 12px rgba(212,255,58,.7);animation:bgb2-pop .9s cubic-bezier(.2,.8,.3,1) forwards}
.bgb2-pop.bad{color:#ff6b8b;text-shadow:0 2px 0 rgba(0,0,0,.55),0 0 12px rgba(255,59,107,.7)}
@keyframes bgb2-pop{0%{opacity:0;transform:translateY(6px) scale(.6)}18%{opacity:1;transform:translateY(-4px) scale(1.15)}100%{opacity:0;transform:translateY(-34px) scale(1)}}
.bgb2-menu{display:flex;flex-direction:column;gap:10px;width:min(100%,360px);margin-top:10px}
.bgb2-menu>p{margin:0 0 4px;color:var(--text-2);line-height:1.4;text-align:center;font-size:14px}
.bgb2-opt{display:grid;grid-template-columns:52px 1fr 16px;align-items:center;gap:12px;padding:10px 14px 10px 10px;border-radius:18px;text-align:left;cursor:pointer;touch-action:manipulation;
  border:1px solid rgba(255,255,255,.12);color:var(--text);font:inherit;
  background:linear-gradient(135deg,rgba(255,59,212,.16),rgba(45,226,230,.07) 60%,rgba(255,255,255,.02));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 8px 22px rgba(0,0,0,.45);transition:transform .12s ease-out,box-shadow .2s,border-color .2s}
.bgb2-opt:hover{border-color:rgba(255,59,212,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 8px 22px rgba(0,0,0,.45),0 0 20px rgba(255,59,212,.25)}
.bgb2-opt:active{transform:scale(.96)}
.bgb2-opt::after{content:'›';font-size:24px;font-weight:700;color:rgba(255,255,255,.4);line-height:1}
.bgb2-ico{display:grid;place-items:center;width:52px;height:52px;border-radius:14px;font-size:26px;line-height:1;
  background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.22),transparent 60%),linear-gradient(160deg,#3a2a6e,#1a1236);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 -3px 6px rgba(0,0,0,.35),0 4px 10px rgba(0,0,0,.4)}
.bgb2-ico svg{width:34px;height:34px;display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.bgb2-opt b{display:block;font-weight:900;font-size:16px;font-variant-numeric:tabular-nums}
.bgb2-opt small{display:block;font-weight:600;font-size:12px;color:var(--text-2);margin-top:2px}
.bgb2-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0 6px;width:100%}
.bgb2-tip{margin:8px 0 0;font-size:12px;color:var(--text-2);text-align:center;opacity:.85}
.bgb2-shake{animation:bgb2-shake .3s}
@keyframes bgb2-shake{0%,100%{translate:0}20%{translate:-6px}40%{translate:5px}60%{translate:-3px}80%{translate:2px}}
.bg13-wrap{display:flex;flex-direction:column;gap:12px;align-items:center}
.bg13-wrap .bgb2-frame::before{content:attr(data-tag);position:absolute;left:8px;top:8px;z-index:2;padding:3px 8px;border-radius:999px;font:900 11px/1 system-ui,sans-serif;letter-spacing:.06em;color:#fff;background:rgba(20,14,40,.72);box-shadow:0 2px 6px rgba(0,0,0,.4)}
.bg14-field{position:relative;overflow:hidden;border-radius:16px;touch-action:manipulation;cursor:pointer;flex:none;
  box-shadow:0 0 0 1.5px rgba(255,255,255,.12),0 0 0 4px #2a1a12,0 0 0 5.5px rgba(255,255,255,.07),0 16px 34px rgba(0,0,0,.6),inset 0 0 60px rgba(0,0,0,.55);
  background:radial-gradient(ellipse at 50% 40%,transparent 40%,rgba(0,0,0,.45)),
  repeating-linear-gradient(90deg,rgba(0,0,0,.10) 0 2px,transparent 2px 7px,rgba(255,255,255,.035) 7px 9px,transparent 9px 15px),
  repeating-linear-gradient(0deg,transparent 0 58px,rgba(0,0,0,.28) 58px 60px),
  linear-gradient(170deg,#7a4a2c,#5d3720 55%,#4a2b19)}
.bg14-it{position:absolute;left:0;top:0;line-height:1;pointer-events:none;filter:drop-shadow(0 3px 2px rgba(0,0,0,.5))}
.bg14-it svg{display:block;width:100%;height:100%}
.bg14-want{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;font-size:20px;line-height:1;vertical-align:middle;
  background:radial-gradient(circle at 35% 30%,#fff,#d9d4ee);box-shadow:inset 0 -2px 3px rgba(0,0,0,.25),0 2px 6px rgba(0,0,0,.4)}
.bg14-want svg{width:24px;height:16px}
.bg14-ring{position:absolute;border-radius:50%;border:3px solid #d4ff3a;box-shadow:0 0 18px #d4ff3a,inset 0 0 12px rgba(212,255,58,.6);pointer-events:none;translate:-50% -50%;animation:bg14-pop .5s cubic-bezier(.2,.8,.3,1)}
.bg14-miss{position:absolute;width:34px;height:34px;border-radius:50%;border:3px solid #ff3b6b;pointer-events:none;translate:-50% -50%;animation:bg14-pop .45s ease-out forwards}
@keyframes bg14-pop{from{scale:.3;opacity:1}to{scale:1.2;opacity:.25}}
.bg18-pal{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-top:14px;max-width:100%}
.bg18-sw{position:relative;width:40px;height:40px;border-radius:50%;border:0;font:inherit;font-weight:900;font-size:15px;cursor:pointer;touch-action:manipulation;transition:transform .15s ease-out,box-shadow .15s;
  box-shadow:inset 0 -4px 6px rgba(0,0,0,.35),inset 0 3px 4px rgba(255,255,255,.45),0 0 0 2px rgba(255,255,255,.18),0 4px 10px rgba(0,0,0,.5);font-variant-numeric:tabular-nums}
.bg18-sw:active{transform:scale(.92)}
.bg18-sw.on{transform:scale(1.14) translateY(-3px);box-shadow:inset 0 -4px 6px rgba(0,0,0,.35),inset 0 3px 4px rgba(255,255,255,.45),0 0 0 2.5px #fff,0 0 16px rgba(255,59,212,.9),0 6px 12px rgba(0,0,0,.5)}
.bg18-sw.done::after{content:'✓';position:absolute;right:-5px;top:-6px;width:17px;height:17px;border-radius:50%;display:grid;place-items:center;font-size:11px;color:#14260a;background:#d4ff3a;box-shadow:0 1px 4px rgba(0,0,0,.5)}
@media (prefers-reduced-motion: reduce){.bgb2-shake{animation:none}.bgb2-pop{animation-duration:.6s}}
`;
  const css = () => {
    if (document.getElementById('bg-style-2')) return;
    const s = document.createElement('style'); s.id = 'bg-style-2'; s.textContent = CSS; document.head.append(s);
  };
  const reg = (n, fn) => { B[n] = (root, api) => { L = api.L; api0 = api; css(); fn(root, api); }; };

  // ---------- Помощники ----------
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const dprOf = () => Math.min(3, window.devicePixelRatio || 1);
  const widthOf = root => Math.max(280, Math.min(560, root.clientWidth || 360) - 12);
  const RM = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  const fmt = s => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function canvas(parent, w, h) {
    const frame = el('div', 'bgb2-frame'), cv = el('canvas', 'bgb2-cv'), dpr = dprOf();
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    frame.append(cv); parent.append(frame);
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv, ctx, w, h, frame };
  }
  // Спрайт: заранее отрисованный offscreen-холст (тени, блики — один раз, а не каждый кадр)
  function sprite(w, h, fn) {
    const d = dprOf(), c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(h * d));
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); fn(x, w, h); c.w = w; c.h = h; return c;
  }
  // Частицы поверх холста: искры и конфетти
  function fxOf(frame) {
    if (frame._fx) return frame._fx;
    const cv = el('canvas', 'bgb2-fx'); frame.append(cv);
    const fx = { parts: [], id: 0, last: 0 };
    fx.run = () => {
      if (fx.id) return;
      const step = t => {
        const w = frame.clientWidth, h = frame.clientHeight, d = dprOf(), dt = Math.min(2.5, fx.last ? (t - fx.last) / 16.7 : 1); fx.last = t;
        if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
        const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
        fx.parts = fx.parts.filter(p => (p.life -= dt / 60) > 0);
        for (const p of fx.parts) {
          p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
          c.globalAlpha = Math.min(1, p.life / .35); c.fillStyle = p.c;
          if (p.round) { c.beginPath(); c.arc(p.x, p.y, p.w, 0, Math.PI * 2); c.fill(); }
          else { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.cos(p.rot * 1.7)) + .2); c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore(); }
        }
        c.globalAlpha = 1;
        if (fx.parts.length && frame.isConnected) fx.id = requestAnimationFrame(step); else { fx.id = 0; fx.last = 0; c.clearRect(0, 0, w, h); }
      };
      fx.id = requestAnimationFrame(step);
    };
    frame._fx = fx; return fx;
  }
  const CONF = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ffd23a', '#ff8a3b', '#b26bff', '#ffffff'];
  function sparkle(frame, x, y, n = 12, cols = ['#d4ff3a', '#ffffff', '#ffd23a']) {
    if (!frame) return; const fx = fxOf(frame); n = RM() ? Math.min(4, n) : n;
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 3; fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .05, drag: .93, w: 1.4 + Math.random() * 1.8, h: 0, round: true, rot: 0, vr: 0, c: cols[i % cols.length], life: .45 + Math.random() * .35 }); }
    fx.run();
  }
  function confetti(frame, n = 80) {
    if (!frame) return; const fx = fxOf(frame), w = frame.clientWidth; n = RM() ? 12 : n;
    for (let i = 0; i < n; i++) fx.parts.push({ x: Math.random() * w, y: -10 - Math.random() * 60, vx: (Math.random() - .5) * 2.4, vy: 1 + Math.random() * 2.5, g: .07, drag: .99, w: 5 + Math.random() * 4, h: 3 + Math.random() * 3, rot: Math.random() * 6, vr: (Math.random() - .5) * .3, c: CONF[i % CONF.length], life: 1.4 + Math.random() * .9 });
    fx.run();
  }
  function pop(frame, x, y, text, bad) {
    if (!frame) return; const p = el('span', 'bgb2-pop' + (bad ? ' bad' : ''), text); p.style.left = x + 'px'; p.style.top = y + 'px';
    frame.append(p); setTimeout(() => p.remove(), 950);
  }
  const shake = e => { if (!e || RM()) return; e.classList.remove('bgb2-shake'); void e.offsetWidth; e.classList.add('bgb2-shake'); };
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
  // Значки для карточек меню
  const gridIco = (c, r, col = '#2de2e6') => { const s = 30 / Math.max(c, r), ox = 2 + (30 - c * s) / 2, oy = 2 + (30 - r * s) / 2; let o = ''; for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) o += `<rect x="${(ox + x * s + .7).toFixed(2)}" y="${(oy + y * s + .7).toFixed(2)}" width="${(s - 1.4).toFixed(2)}" height="${(s - 1.4).toFixed(2)}" rx="${(s * .22).toFixed(2)}" fill="${col}" opacity="${(.55 + ((x * 7 + y * 3) % 5) * .1).toFixed(2)}"/>`; return `<svg viewBox="0 0 34 34">${o}</svg>`; };
  const polyIco = (pts, col = '#2de2e6') => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), mx = Math.min(...xs), my = Math.min(...ys), k = 28 / Math.max(Math.max(...xs) - mx, Math.max(...ys) - my), ox = 3 + (28 - (Math.max(...xs) - mx) * k) / 2, oy = 3 + (28 - (Math.max(...ys) - my) * k) / 2;
    return `<svg viewBox="0 0 34 34"><defs><linearGradient id="pg${col.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".7"/></linearGradient></defs><polygon points="${pts.map(([x, y]) => `${(ox + (x - mx) * k).toFixed(1)},${(oy + (y - my) * k).toFixed(1)}`).join(' ')}" fill="url(#pg${col.slice(1)})" stroke="#fff" stroke-opacity=".5" stroke-width="1"/></svg>`; };
  function menu(root, api, title, opts, pick) {
    const box = el('div', 'bgb2-menu', `<p>${title}</p>`);
    for (const [label, val, sub, ico] of opts) {
      const b = el('button', 'bgb2-opt', `<span class="bgb2-ico" aria-hidden="true">${ico || '🎯'}</span><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>`); b.type = 'button';
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
      ['3 × 3', 3, L('9 кусочков — для разгона', '9 pieces — a warm-up'), gridIco(3, 3, '#2de2e6')],
      ['4 × 4', 4, L('16 кусочков', '16 pieces'), gridIco(4, 4, '#ffd23a')],
      ['5 × 5', 5, L('25 кусочков — для упорных', '25 pieces — for the stubborn'), gridIco(5, 5, '#ff3bd4')],
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
      const { cv, ctx, frame } = canvas(root, S, S);
      const bar = el('div', 'bgb2-row'); root.append(bar);
      const peekB = el('button', 'bgb2-btn', '👁 ' + L('Подсмотреть (держите)', 'Peek (hold)')); peekB.type = 'button'; bar.append(peekB);
      root.append(el('p', 'bgb2-tip', L('Нажмите на два кусочка, чтобы поменять их местами, или перетащите кусочек', 'Tap two pieces to swap them, or drag a piece')));
      const N = n * n, cs = S / n; let perm, sel = -1, drag = null, moves = 0, peek = false, done = false, winAt = 0;
      do perm = api.shuffle([...Array(N).keys()]); while (perm.filter((p, i) => p === i).length > Math.floor(N / 5));
      const sw = stopwatch(api, () => upd());
      const upd = () => { const ok = perm.filter((p, i) => p === i).length; h.innerHTML = chip(`⏱ <b>${fmt(sw.get())}</b>`) + chip(`🔁 ${L('Ходы', 'Moves')}: <b>${moves}</b>`) + chip(`🧩 <b>${ok}/${N}</b>`, ok === N ? 'good' : ''); };
      const G = 2, RD = Math.max(4, cs * .08);
      // блик и тень кромки кусочка — один спрайт на все
      const bevel = sprite(cs, cs, (c, w) => {
        rr(c, G + .5, G + .5, w - 2 * G - 1, w - 2 * G - 1, RD); c.lineWidth = 1.5;
        const g = c.createLinearGradient(0, 0, w, w); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.45, 'rgba(255,255,255,.08)'); g.addColorStop(.55, 'rgba(0,0,0,.1)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
        c.strokeStyle = g; c.stroke();
        const s = c.createLinearGradient(0, 0, 0, w); s.addColorStop(0, 'rgba(255,255,255,.12)'); s.addColorStop(.3, 'rgba(255,255,255,0)'); c.fillStyle = s; rr(c, G, G, w - 2 * G, w - 2 * G, RD); c.fill();
      });
      const well = sprite(S, S, c => {
        const g = c.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#120f24'); g.addColorStop(1, '#0a0816'); c.fillStyle = g; c.fillRect(0, 0, S, S);
        for (let i = 0; i < N; i++) { const x = (i % n) * cs, y = Math.floor(i / n) * cs; rr(c, x + G + 1, y + G + 1, cs - 2 * G - 2, cs - 2 * G - 2, RD); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; c.stroke(); }
      });
      const anim = new Map(); const loop = rafLoop(api);
      const src = p => [(p % n) * cs * dpr, Math.floor(p / n) * cs * dpr, cs * dpr, cs * dpr];
      function piece(p, dx, dy, s = cs, inPlace = false) {
        if (inPlace) { ctx.drawImage(img, ...src(p), dx, dy, s, s); return; }
        const k = s / cs; ctx.save(); rr(ctx, dx + G * k, dy + G * k, s - 2 * G * k, s - 2 * G * k, RD * k); ctx.clip(); ctx.drawImage(img, ...src(p), dx, dy, s, s); ctx.restore();
        ctx.drawImage(bevel, dx, dy, s, s);
      }
      function draw() {
        const now = performance.now(); let busy = false;
        ctx.clearRect(0, 0, S, S);
        if (peek || done) {
          ctx.drawImage(img, 0, 0, S, S);
          if (done) { const k = ease((now - winAt) / 600); ctx.save(); ctx.globalAlpha = .35 * (1 - k); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, S, S); ctx.restore();
            ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, S - 4, S - 4); if (k < 1) busy = true; }
          else { ctx.fillStyle = 'rgba(10,8,22,.55)'; rr(ctx, S / 2 - 46, S - 34, 92, 24, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👁 ' + L('образец', 'preview'), S / 2, S - 22); }
          if (busy) loop(draw); return;
        }
        ctx.drawImage(well, 0, 0, S, S);
        const late = [];
        for (let i = 0; i < N; i++) {
          if (drag?.moved && drag.i === i) continue;
          let x = (i % n) * cs, y = Math.floor(i / n) * cs;
          const a = anim.get(i);
          if (a) { const k = ease((now - a.t0) / 200); if (k >= 1) anim.delete(i); else { busy = true; x = a.fx + (x - a.fx) * k; y = a.fy + (y - a.fy) * k; late.push([i, x, y]); continue; } }
          if (i === sel) continue;
          piece(perm[i], x, y, cs, perm[i] === i);
        }
        for (const [i, x, y] of late) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, x + 4, y + 6, cs, cs, RD); ctx.fill(); ctx.restore(); piece(perm[i], x, y); }
        if (sel >= 0) {
          const k = ease((now - (draw.selAt || 0)) / 160), s = cs * (1 + .07 * k), x = (sel % n) * cs - (s - cs) / 2, y = Math.floor(sel / n) * cs - (s - cs) / 2;
          if (k < 1) busy = true;
          ctx.save(); ctx.shadowColor = 'rgba(255,59,212,.9)'; ctx.shadowBlur = 16; ctx.fillStyle = '#ff3bd4'; rr(ctx, x + 1, y + 1, s - 2, s - 2, RD + 2); ctx.fill(); ctx.restore();
          piece(perm[sel], x, y, s);
          ctx.strokeStyle = '#ff3bd4'; ctx.lineWidth = 3; rr(ctx, x + 1.5, y + 1.5, s - 3, s - 3, RD + 1); ctx.stroke();
        }
        if (drag?.moved) {
          const j = cellAt(drag.x, drag.y);
          if (j >= 0 && j !== drag.i) { ctx.strokeStyle = '#2de2e6'; ctx.lineWidth = 3; rr(ctx, (j % n) * cs + 2.5, Math.floor(j / n) * cs + 2.5, cs - 5, cs - 5, RD); ctx.stroke(); ctx.fillStyle = 'rgba(45,226,230,.15)'; ctx.fill(); }
          const s = cs * 1.1, x = drag.x - drag.ox * 1.1, y = drag.y - drag.oy * 1.1;
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10; ctx.fillStyle = '#000'; rr(ctx, x + G, y + G, s - 2 * G, s - 2 * G, RD); ctx.fill(); ctx.restore();
          piece(perm[drag.i], x, y, s);
          ctx.strokeStyle = '#ff3bd4'; ctx.lineWidth = 2; rr(ctx, x + 1, y + 1, s - 2, s - 2, RD + 1); ctx.stroke();
        }
        if (busy) loop(draw);
      }
      const cellAt = (x, y) => (x < 0 || y < 0 || x >= S || y >= S) ? -1 : Math.floor(y / cs) * n + Math.floor(x / cs);
      const cxy = i => [(i % n) * cs, Math.floor(i / n) * cs];
      function swap(a, b, fromA = cxy(a), fromB = cxy(b)) {
        [perm[a], perm[b]] = [perm[b], perm[a]]; moves++;
        const t0 = performance.now(); anim.set(a, { fx: fromB[0], fy: fromB[1], t0 }); anim.set(b, { fx: fromA[0], fy: fromA[1], t0 });
        const good = [a, b].filter(i => perm[i] === i);
        if (good.length) { api.sfx.item?.(); later(api, 180, () => good.forEach(i => { const [x, y] = cxy(i); sparkle(frame, x + cs / 2, y + cs / 2, 10); })); } else api.sfx.click?.();
        if (perm.every((p, i) => p === i)) {
          done = true; sw.stop(); upd(); winAt = performance.now() + 200; later(api, 200, () => { winAt = performance.now(); draw(); confetti(frame); });
          const t = Math.round(sw.get());
          later(api, 900, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Картинка ${n}×${n} собрана за ${fmt(t)}, ходов: ${moves}`, `${n}×${n} picture done in ${fmt(t)}, ${moves} moves`) }));
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
        if (d.moved) { const j = cellAt(d.x, d.y); if (j >= 0 && j !== d.i && e.type === 'pointerup') swap(d.i, j, [d.x - d.ox * 1.1, d.y - d.oy * 1.1]); }
        else if (sel < 0) { sel = d.i; draw.selAt = performance.now(); api.sfx.click?.(); }
        else if (sel === d.i) sel = -1;
        else { const s0 = sel; sel = -1; swap(s0, d.i); }
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
      case 'window': { c.fillStyle = 'rgba(80,60,30,.18)'; c.fillRect(x + 3, y + 4, w, h); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#5fb4f5'); g.addColorStop(1, '#d4f1ff'); c.fillStyle = g; c.fillRect(x, y, w, h);
        c.fillStyle = '#7fbd7e'; c.fillRect(x, y + h * .82, w, h * .18); c.fillStyle = '#9fd49a'; c.fillRect(x, y + h * .82, w, h * .03); c.strokeStyle = '#fbfaf6'; c.lineWidth = 4; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke();
        c.fillStyle = '#e9e4d8'; c.fillRect(x - 4, y + h, w + 8, 4); break; }
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
      case 'plant': c.fillStyle = '#2f9a4c'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + w / 2 + Math.cos(i * 1.3) * w * .22 + 1.5, y + h * (.15 + (i % 3) * .14) + 1.5, w * .13, h * .14, i, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#4cc46a'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + w / 2 + Math.cos(i * 1.3) * w * .22, y + h * (.15 + (i % 3) * .14), w * .13, h * .14, i, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = col; poly(c, [[x + w * .15, y + h * .6], [x + w * .85, y + h * .6], [x + w * .72, y + h], [x + w * .28, y + h]]); c.fill(); break;
      case 'desk': { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + w * .03, y + h, w * .94, h * .6);
        const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#c48a52'); g.addColorStop(1, '#8f5f33'); c.fillStyle = g; c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, 1.5);
        const gl = c.createLinearGradient(x, 0, x + w * .05, 0); gl.addColorStop(0, '#6e4826'); gl.addColorStop(1, '#8a5d34'); c.fillStyle = gl; c.fillRect(x + w * .02, y + h, w * .03, H * .33); c.fillRect(x + w * .95, y + h, w * .03, H * .33); break; }
      case 'bin': c.fillStyle = col; poly(c, [[x, y], [x + w, y], [x + w * .85, y + h], [x + w * .15, y + h]]); c.fill(); c.fillStyle = '#fff'; circ(c, x + w * .45, y, w * .22); c.fill(); break;
      case 'lamp': c.fillStyle = '#333'; c.fillRect(x + w * .1, y + h * .9, w * .5, h * .1); c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * .35, y + h * .9); c.lineTo(x + w * .2, y + h * .4); c.lineTo(x + w * .6, y + h * .15); c.stroke();
        c.fillStyle = col; poly(c, [[x + w * .45, y], [x + w * .8, y + h * .05], [x + w, y + h * .4], [x + w * .45, y + h * .25]]); c.fill(); break;
      case 'monitor': c.fillStyle = '#1d1d26'; rr(c, x, y, w, h * .8, 3); c.fill(); c.fillStyle = col; c.fillRect(x + 3, y + 3, w - 6, h * .8 - 6);
        { const g = c.createLinearGradient(x, y, x + w, y + h * .8); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.4, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x + 3, y + 3, w - 6, h * .8 - 6); } c.fillStyle = '#333'; c.fillRect(x + w * .45, y + h * .8, w * .1, h * .12); c.fillRect(x + w * .3, y + h * .92, w * .4, h * .08);
        c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * .12, y + h * .6); c.lineTo(x + w * .35, y + h * .45); c.lineTo(x + w * .55, y + h * .52); c.lineTo(x + w * .85, y + h * .2); c.stroke(); break;
      case 'kbd': c.fillStyle = '#ddd'; c.fillRect(x, y, w, h); break;
      case 'phone': c.fillStyle = '#222'; rr(c, x, y, w, h, 3); c.fill(); c.fillStyle = col; c.fillRect(x + w * .15, y + h * .15, w * .7, h * .5); break;
      case 'mug': c.fillStyle = col; rr(c, x, y + h * .2, w * .75, h * .8, 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + w * .1, y + h * .28, w * .12, h * .6); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(x + w * .75, y + h * .55, w * .2, -Math.PI / 2, Math.PI / 2); c.stroke();
        c.strokeStyle = 'rgba(120,120,120,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w * .3, y + h * .15); c.quadraticCurveTo(x + w * .5, y, x + w * .35, y - h * .1); c.stroke(); break;
      case 'papers': for (let i = 0; i < 3; i++) { c.fillStyle = i === 2 ? col : '#fff'; c.fillRect(x + i * 2, y + h * (.6 - i * .3), w - 4, h * .35); } c.fillStyle = '#fff'; c.fillRect(x + 4, y, w - 4, h * .35); break;
      case 'chair': c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x + w / 2, y + h * .97, w * .5, h * .05, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = col; rr(c, x + w * .1, y, w * .8, h * .45, 6); c.fill(); rr(c, x, y + h * .5, w, h * .12, 4); c.fill();
        c.fillStyle = 'rgba(255,255,255,.25)'; rr(c, x + w * .16, y + h * .04, w * .25, h * .36, 4); c.fill(); c.fillStyle = col; c.fillStyle = '#333'; c.fillRect(x + w * .46, y + h * .62, w * .08, h * .25);
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
    const W = Math.round(Math.min(widthOf(root), 520, Math.max(280, ((window.innerHeight || 740) - 290) / 1.2))), H = Math.round(W * .6);
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
    const left = canvas(wrap, W, H), right = canvas(wrap, W, H); left.frame.dataset.tag = 'A'; right.frame.dataset.tag = 'B';
    root.append(el('p', 'bgb2-tip', L('Нажимайте на отличия на любой из картинок. Промахов можно три.', 'Tap the differences on either picture. Three misses allowed.')));
    let found = 0, miss = 0, done = false;
    const sw = stopwatch(api, () => { upd(); if (!done && sw.get() >= LIMIT) finish(); });
    const upd = () => { h.innerHTML = chip(`🔍 <b>${found}/${TOTAL}</b>`, found === TOTAL ? 'good' : '') + chip(`<span style="color:#ff4f86;letter-spacing:1px" aria-label="${L('Промахи', 'Misses')}">${'♥'.repeat(Math.max(0, MISS - miss))}<span style="opacity:.25">${'♥'.repeat(Math.min(MISS, miss))}</span></span>`, miss >= MISS ? 'warn' : '') + chip(`⏱ <b>${fmt(Math.max(0, LIMIT - sw.get()))}</b>`, LIMIT - sw.get() < 15 ? 'warn' : ''); };
    // стена, плинтус, паркет и свет из окна — один раз в спрайт
    const room = sprite(W, H, c => {
      let g = c.createLinearGradient(0, 0, 0, H * .78); g.addColorStop(0, '#f6eedd'); g.addColorStop(1, '#e8dcc3'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(160,130,90,.06)'; for (let x = 0; x < W; x += 14) c.fillRect(x, 0, 6, H * .78);
      g = c.createRadialGradient(W * .17, H * .3, 4, W * .17, H * .35, W * .45); g.addColorStop(0, 'rgba(255,240,190,.55)'); g.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H * .78);
      g = c.createLinearGradient(0, H * .78, 0, H); g.addColorStop(0, '#c9a273'); g.addColorStop(1, '#a87e52'); c.fillStyle = g; c.fillRect(0, H * .78, W, H * .22);
      c.strokeStyle = 'rgba(70,40,15,.18)'; c.lineWidth = 1;
      for (let k = 0; k < 4; k++) { const y = H * (.78 + k * .055); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = (k % 2) * W / 10; x < W; x += W / 5) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + H * .055); c.stroke(); } }
      c.fillStyle = '#fbf7ee'; c.fillRect(0, H * .765, W, H * .022); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, H * .787, W, 2);
      g = c.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, W * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,0,.18)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    });
    const marks = new Map(), loop = rafLoop(api);
    function paint(cv, objs, showMissed) {
      const c = cv.ctx, now = performance.now(); let busy = false; c.clearRect(0, 0, W, H);
      c.drawImage(room, 0, 0, W, H);
      objs.forEach(o => draw13(c, o, W, H));
      for (const d of diffs) if (d.found || showMissed) {
        const cx = (d.b[0] + d.b[2]) / 2, cy = (d.b[1] + d.b[3]) / 2, r0 = Math.max(d.b[2] - d.b[0], d.b[3] - d.b[1]) / 2 + 2;
        const k = d.found ? ease((now - (marks.get(d) || 0)) / 260) : 1; if (k < 1) busy = true;
        const r = r0 * (1.5 - .5 * k);
        c.save(); c.globalAlpha = k;
        if (d.found) { c.lineWidth = 7; c.strokeStyle = 'rgba(58,209,58,.3)'; circ(c, cx, cy, r); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#2fc93a'; circ(c, cx, cy, r); c.stroke();
          c.fillStyle = '#2fc93a'; circ(c, cx + r * .7, cy - r * .7, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + r * .7 - 3.5, cy - r * .7); c.lineTo(cx + r * .7 - 1, cy - r * .7 + 2.5); c.lineTo(cx + r * .7 + 3.5, cy - r * .7 - 2.5); c.stroke(); }
        else { c.lineWidth = 3; c.strokeStyle = '#ff3b6b'; c.setLineDash([6, 5]); circ(c, cx, cy, r); c.stroke(); }
        c.restore();
      }
      return busy;
    }
    const paintAll = (m) => { const b1 = paint(left, A, m), b2 = paint(right, Bo, m); if (b1 || b2) loop(() => paintAll(m)); };
    function finish() {
      if (done) return; done = true; sw.stop(); paintAll(true); upd();
      const won = found >= Math.min(TOTAL, 7);
      later(api, found === TOTAL ? 500 : 1400, () => api.end({ score: found, won, text: found === TOTAL ? L(`Все отличия найдены за ${fmt(sw.get())}`, `All differences found in ${fmt(sw.get())}`) : L(`Найдено ${found} из ${TOTAL}. Пропущенные обведены красным`, `Found ${found} of ${TOTAL}. Missed ones are circled in red`) }));
    }
    for (const cv of [left, right]) cv.cv.onpointerdown = e => {
      if (done) return; const [x, y] = xy(cv.cv, e);
      let best = null; for (const d of diffs) if (!d.found && hit(d.b, x, y)) { const dd = Math.hypot(x - (d.b[0] + d.b[2]) / 2, y - (d.b[1] + d.b[3]) / 2); if (!best || dd < best[1]) best = [d, dd]; }
      if (best) { const d = best[0]; d.found = true; found++; marks.set(d, performance.now()); api.sfx.item?.(); paintAll(false); upd();
        const cx = (d.b[0] + d.b[2]) / 2, cy = (d.b[1] + d.b[3]) / 2; for (const f of [left, right]) sparkle(f.frame, cx, cy, 10); pop(cv.frame, cx, cy - 18, `${found}/${TOTAL}`);
        if (found === TOTAL) { confetti(left.frame, 50); confetti(right.frame, 50); finish(); } return; }
      if (diffs.some(d => d.found && hit(d.b, x, y))) return;
      miss++; api.buzz?.('danger'); shake(cv.frame); pop(cv.frame, x, y, '✗', true); upd();
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
      field.innerHTML = ''; field._fx = null;
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
        sparkle(field, tgt.x, tgt.y, 16); pop(field, tgt.x, tgt.y - 30, round >= ROUNDS ? '🎉' : `${round}/${ROUNDS}`);
        if (round >= ROUNDS) {
          done = true; sw.stop(); upd(); const t = Math.round(sw.get() * 10) / 10;
          later(api, 600, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Все ${ROUNDS} предметов найдены за ${t} с${misses ? ` (промахов: ${misses})` : ''}`, `All ${ROUNDS} items found in ${t} s${misses ? ` (${misses} misses)` : ''}`) }));
        } else later(api, 450, () => { busy = false; deal(); });
      } else {
        misses++; sw.add(PEN); api.buzz?.('danger'); shake(field); pop(field, x, y - 22, `+${PEN} ${L('с', 's')}`, true);
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
    const { cv, ctx, frame: fr } = canvas(root, st.W, st.H); st.ctx = ctx; st.frame = fr;
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
      [['5 × 5', 5, L('Быстрый ремонт', 'Quick fix'), '🔌'], ['6 × 6', 6, L('Серверная', 'Server room'), '🖥️'], ['7 × 7', 7, L('Опенспейс после переезда', 'Open space after the move'), '📦']], N => start(N));
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
          sw.stop(); upd(); api.sfx.item?.(); s.live = true; s.winAt = performance.now(); later(api, 500, () => confetti(st.frame));
          later(api, 1500, () => { s.live = false; api.end({ score: s.moves, won: true, lowerBetter: true, text: L(`Принтер заработал! Поворотов: ${s.moves}, время ${fmt(sw.get())}`, `The printer is alive! ${s.moves} turns, time ${fmt(sw.get())}`) }); });
        },
        draw(c, s) {
          const ox = s.pad[3], oy = s.pad[0], lit = '#d4ff3a';
          if (!pw.length) pw = flood(N, N, s.M, r0 * N, 8);
          if (!s.spr) {
            const tile = on => sprite(cell, cell, (t, w) => {
              const g = t.createLinearGradient(0, 0, 0, w); g.addColorStop(0, on ? '#2f4220' : '#2a2648'); g.addColorStop(1, on ? '#1b2812' : '#1a1730');
              rr(t, 2, 2, w - 4, w - 4, 9); t.fillStyle = g; t.fill();
              t.strokeStyle = on ? 'rgba(212,255,58,.35)' : 'rgba(255,255,255,.10)'; t.lineWidth = 1; rr(t, 2.5, 2.5, w - 5, w - 5, 8.5); t.stroke();
              t.fillStyle = 'rgba(0,0,0,.35)'; rr(t, 3, w - 7, w - 6, 4, 3); t.fill();
              t.fillStyle = 'rgba(255,255,255,.18)'; for (const [a, b] of [[7, 7], [w - 7, 7], [7, w - 7], [w - 7, w - 7]]) { circ(t, a, b, 1.3); t.fill(); }
            });
            const bg = sprite(s.W, s.H, t => {
              const g = t.createLinearGradient(0, 0, 0, s.H); g.addColorStop(0, '#15122a'); g.addColorStop(1, '#0c0a18'); t.fillStyle = g; t.fillRect(0, 0, s.W, s.H);
              t.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < s.W; x += 8) for (let y = (x / 8) % 2 * 4; y < s.H; y += 8) t.fillRect(x, y, 1, 1);
              rr(t, ox - 4, oy - 4, N * cell + 8, N * cell + 8, 13); t.fillStyle = '#08070f'; t.fill(); t.strokeStyle = 'rgba(255,255,255,.08)'; t.lineWidth = 1; t.stroke();
            });
            s.spr = { off: tile(false), on: tile(true), bg };
          }
          c.drawImage(s.spr.bg, 0, 0, s.W, s.H);
          const cable = (on, segs) => {
            const lw = cell * .17;
            if (on) { segs(); c.strokeStyle = 'rgba(212,255,58,.22)'; c.lineWidth = lw * 2.4; c.stroke(); }
            segs(); c.strokeStyle = on ? '#6f8f12' : '#121020'; c.lineWidth = lw + 3; c.stroke();
            segs(); c.strokeStyle = on ? lit : '#4a4666'; c.lineWidth = lw; c.stroke();
            c.save(); c.translate(-lw * .18, -lw * .18); segs(); c.strokeStyle = on ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.16)'; c.lineWidth = lw * .28; c.stroke(); c.restore();
          };
          for (let i = 0; i < N * N; i++) {
            const x = ox + (i % N) * cell, y = oy + ((i / N) | 0) * cell, on = pw[i] >= 0;
            c.drawImage(on ? s.spr.on : s.spr.off, x, y, cell, cell);
            c.save(); c.translate(x + cell / 2, y + cell / 2); c.rotate(s.ang[i]); c.lineCap = 'round';
            cable(on, () => { c.beginPath(); for (let k = 0; k < 4; k++) if (s.M[i] & (1 << k)) { c.moveTo(0, 0); c.lineTo(DX[k] * cell / 2, DY[k] * cell / 2); } });
            const g = c.createRadialGradient(-cell * .04, -cell * .04, 1, 0, 0, cell * .15); g.addColorStop(0, on ? '#fbffd8' : '#a9a4c8'); g.addColorStop(1, on ? '#86a81a' : '#3a3654');
            c.fillStyle = g; circ(c, 0, 0, cell * .14); c.fill();
            if (bits(s.M[i]) === 1) { c.fillStyle = on ? '#2a3a0a' : '#0c0a18'; circ(c, 0, 0, cell * .06); c.fill(); }
            c.restore();
          }
          // розетка слева и принтер справа
          const sy = oy + r0 * cell + cell / 2, py = oy + r1 * cell + cell / 2, done = s.done;
          c.lineCap = 'round';
          cable(true, () => { c.beginPath(); c.moveTo(side * .7, sy); c.lineTo(ox, sy); });
          cable(done, () => { c.beginPath(); c.moveTo(ox + N * cell, py); c.lineTo(s.W - side * .7, py); });
          // розетка
          const pw2 = side * .82, ph = side * 1.15, px = 2, pyy = sy - ph / 2;
          let g = c.createLinearGradient(0, pyy, 0, pyy + ph); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfcbe0');
          c.fillStyle = 'rgba(0,0,0,.4)'; rr(c, px + 1, pyy + 3, pw2, ph, 6); c.fill(); c.fillStyle = g; rr(c, px, pyy, pw2, ph, 6); c.fill();
          c.fillStyle = '#e8e5f3'; circ(c, px + pw2 / 2, sy, pw2 * .36); c.fill(); c.strokeStyle = '#b8b3cf'; c.lineWidth = 1; c.stroke();
          c.fillStyle = '#3a3654'; circ(c, px + pw2 / 2 - pw2 * .13, sy, pw2 * .06); c.fill(); circ(c, px + pw2 / 2 + pw2 * .13, sy, pw2 * .06); c.fill();
          c.fillStyle = '#ffd23a'; c.font = `900 ${Math.round(side * .32)}px system-ui,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⚡', px + pw2 / 2, pyy + ph * .14);
          // принтер
          const bw = side * .95, bh = side * .62, bx = s.W - bw - 2, by = py - bh / 2 + side * .08;
          if (done) { const k = Math.min(1, (performance.now() - (s.winAt || 0)) / 900); c.fillStyle = '#fff'; c.fillRect(bx + bw * .2, by - side * .1 - k * side * .55, bw * .6, side * .12 + k * side * .55); c.fillStyle = '#9aa'; for (let j = 1; j < 4; j++) c.fillRect(bx + bw * .27, by - k * side * .55 + j * side * .1, bw * .46 * k, 1.5); }
          c.fillStyle = '#2a2640'; rr(c, bx + bw * .15, by - side * .14, bw * .7, side * .18, 3); c.fill();
          g = c.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, '#f2f0fb'); g.addColorStop(1, '#a9a4c4');
          c.fillStyle = 'rgba(0,0,0,.4)'; rr(c, bx + 1, by + 3, bw, bh, 6); c.fill(); c.fillStyle = g; rr(c, bx, by, bw, bh, 6); c.fill();
          c.fillStyle = '#4a4666'; rr(c, bx + bw * .15, by + bh * .55, bw * .7, bh * .14, 2); c.fill();
          c.fillStyle = done ? '#d4ff3a' : '#ff3b6b'; circ(c, bx + bw * .82, by + bh * .25, 2.6); c.fill();
          if (done) { c.fillStyle = 'rgba(212,255,58,.3)'; circ(c, bx + bw * .82, by + bh * .25, 6); c.fill(); }
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
        sw.stop(); api.sfx.item?.(); s.live = true; s.winAt = performance.now(); upd(); later(api, 1500, () => confetti(s.frame));
        later(api, 2300, () => { s.live = false; api.end({ score: Math.round(sw.get()), won: true, lowerBetter: true, text: L(`Вода пошла! Время ${fmt(sw.get())}, поворотов: ${s.moves}`, `Water’s flowing! Time ${fmt(sw.get())}, ${s.moves} turns`) }); });
      },
      draw(c, s) {
        if (!dist.length) recalc(s);
        const ox = s.pad[3], oy = s.pad[0], el2 = s.done ? (performance.now() - s.winAt) / 1000 : 0, maxD = Math.max(1, ...dist);
        if (!s.bg) s.bg = sprite(s.W, s.H, t => {
          const g = t.createLinearGradient(0, 0, 0, s.H); g.addColorStop(0, '#10304d'); g.addColorStop(1, '#081626'); t.fillStyle = g; rr(t, 0, 0, s.W, s.H, 14); t.fill();
          // кафельная стена
          for (let i = 0; i < N; i++) {
            const x = ox + (i % cols) * cell, y = oy + ((i / cols) | 0) * cell, gg = t.createLinearGradient(x, y, x + cell, y + cell);
            gg.addColorStop(0, '#1a4266'); gg.addColorStop(1, '#123352'); t.fillStyle = gg; rr(t, x + 1, y + 1, cell - 2, cell - 2, 5); t.fill();
            t.strokeStyle = 'rgba(255,255,255,.07)'; t.lineWidth = 1; t.beginPath(); t.moveTo(x + 4, y + 1.5); t.lineTo(x + cell - 4, y + 1.5); t.stroke();
          }
          t.fillStyle = 'rgba(255,255,255,.05)'; rr(t, 3, oy + rows * cell + 6, s.W - 6, botH - 9, 10); t.fill();
        });
        c.drawImage(s.bg, 0, 0, s.W, s.H);
        for (let i = 0; i < N; i++) {
          const x = ox + (i % cols) * cell, y = oy + ((i / cols) | 0) * cell;
          if (!s.M[i]) continue;
          const isWet = dist[i] >= 0 && (!s.done || dist[i] <= el2 * maxD * 1.4);
          c.save(); c.translate(x + cell / 2, y + cell / 2); c.rotate(s.ang[i]); c.lineCap = 'butt';
          const seg = () => { c.beginPath(); for (let k = 0; k < 4; k++) if (s.M[i] & (1 << k)) { c.moveTo(0, 0); c.lineTo(DX[k] * cell / 2, DY[k] * cell / 2); } };
          seg(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = cell * .4; c.save(); c.translate(1.5, 2.5); c.stroke(); c.restore();
          seg(); c.strokeStyle = '#3d5068'; c.lineWidth = cell * .38; c.stroke();
          seg(); c.strokeStyle = '#b9cbe0'; c.lineWidth = cell * .3; c.stroke();
          c.save(); c.translate(-cell * .05, -cell * .05); seg(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = cell * .06; c.stroke(); c.restore();
          if (isWet) { seg(); c.strokeStyle = 'rgba(58,180,255,.35)'; c.lineWidth = cell * .24; c.stroke(); }
          seg(); c.strokeStyle = isWet ? '#3ab4ff' : '#22344a'; c.lineWidth = cell * .15; c.stroke();
          if (isWet && s.live) { seg(); c.setLineDash([cell * .08, cell * .14]); c.lineDashOffset = -performance.now() / 25; c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = cell * .05; c.stroke(); c.setLineDash([]); }
          for (let k = 0; k < 4; k++) if (s.M[i] & (1 << k)) {
            c.save(); c.rotate(k * Math.PI / 2); const g = c.createLinearGradient(-cell * .22, 0, cell * .22, 0); g.addColorStop(0, '#7f93aa'); g.addColorStop(.35, '#e6eef8'); g.addColorStop(1, '#6a7e95');
            c.fillStyle = g; rr(c, -cell * .22, -cell / 2, cell * .44, cell * .08, 2); c.fill(); c.restore();
          }
          const g = c.createRadialGradient(-cell * .06, -cell * .06, 1, 0, 0, cell * .2); g.addColorStop(0, '#f2f7fc'); g.addColorStop(1, '#6f849b');
          c.fillStyle = g; circ(c, 0, 0, cell * .19); c.fill(); c.fillStyle = isWet ? '#3ab4ff' : '#22344a'; circ(c, 0, 0, cell * .085); c.fill();
          c.restore();
        }
        // бутыль кулера
        const bx = ox + bc * cell + cell / 2, top = 4, bh = topH - cell * .36, bw = cell * 1.16;
        let g = c.createLinearGradient(bx - cell * .2, 0, bx + cell * .2, 0); g.addColorStop(0, '#7f93aa'); g.addColorStop(.4, '#e6eef8'); g.addColorStop(1, '#6a7e95');
        c.fillStyle = g; c.fillRect(bx - cell * .14, top + bh - 2, cell * .28, oy - top - bh + 4);
        g = c.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0); g.addColorStop(0, 'rgba(120,210,255,.35)'); g.addColorStop(.3, 'rgba(200,240,255,.55)'); g.addColorStop(1, 'rgba(60,150,230,.35)');
        c.fillStyle = g; rr(c, bx - bw / 2, top + 6, bw, bh - 6, cell * .3); c.fill();
        const lvl = s.done ? Math.max(.3, .78 - el2 * .2) : .78;
        c.save(); rr(c, bx - bw / 2, top + 6, bw, bh - 6, cell * .3); c.clip();
        g = c.createLinearGradient(0, top + bh * (1 - lvl), 0, top + bh); g.addColorStop(0, '#5cc8ff'); g.addColorStop(1, '#1f7fd6'); c.fillStyle = g; c.fillRect(bx - bw, top + bh * (1 - lvl) + 6, bw * 2, bh);
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(bx - bw, top + bh * (1 - lvl) + 6, bw * 2, 1.5);
        c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 2; for (const f of [.45, .7]) { c.beginPath(); c.moveTo(bx - bw / 2, top + bh * f); c.lineTo(bx + bw / 2, top + bh * f); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, bx - bw * .36, top + 12, bw * .1, bh * .55, 3); c.fill();
        c.restore();
        c.strokeStyle = 'rgba(200,245,255,.8)'; c.lineWidth = 1.5; rr(c, bx - bw / 2, top + 6, bw, bh - 6, cell * .3); c.stroke();
        c.fillStyle = '#2de2e6'; rr(c, bx - cell * .24, top, cell * .48, cell * .13, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(bx - cell * .2, top + 1.5, cell * .4, 1.5);
        // стаканы
        cupCols.forEach((cc, j) => {
          const x = ox + cc * cell + cell / 2, y = oy + rows * cell + 6, w = cell * .66, hh = botH - 12;
          g = c.createLinearGradient(x - cell * .15, 0, x + cell * .15, 0); g.addColorStop(0, '#7f93aa'); g.addColorStop(.4, '#e6eef8'); g.addColorStop(1, '#6a7e95');
          c.fillStyle = g; c.fillRect(x - cell * .14, y - 7, cell * .28, 7);
          const fill = wet[j] ? (s.done ? Math.min(1, Math.max(0, el2 - .4) / 1.2) : .15) : 0;
          const cup = () => poly(c, [[x - w / 2, y + 2], [x + w / 2, y + 2], [x + w * .36, y + hh], [x - w * .36, y + hh]]);
          c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, y + hh + 1, w * .42, 3, 0, 0, Math.PI * 2); c.fill();
          cup(); g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.3, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,.06)'); c.fillStyle = g; c.fill();
          if (fill > 0) { const fy = y + hh - (hh - 4) * fill; c.save(); cup(); c.clip(); g = c.createLinearGradient(0, fy, 0, y + hh); g.addColorStop(0, '#6fd3ff'); g.addColorStop(1, '#1f7fd6'); c.fillStyle = g; c.fillRect(x - w, fy, w * 2, hh); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - w, fy, w * 2, 1.5); c.restore(); }
          cup(); c.strokeStyle = wet[j] ? '#9fe4ff' : 'rgba(242,240,255,.85)'; c.lineWidth = 2; c.stroke();
          c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(x - w / 2 - 1, y + 1, w + 2, 2.5);
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
      SIL17.map((s, i) => [L(s.ru, s.en), i, [L('Самый простой — для разминки', 'The easiest — a warm-up'), L('Широкое основание', 'A wide base'), L('Только вверх!', 'Up only!'), L('Логотип-галочка', 'A chevron logo'), L('Шесть граней', 'Six facets')][i], polyIco(s.p, ['#ffd23a', '#ff3bd4', '#d4ff3a', '#2de2e6', '#b26bff'][i])]), i => start(SIL17[i]));
    function start(sil) {
      const W = widthOf(root), u0 = Math.max(...sil.p.map(p => p[1])), u = Math.floor(Math.max(26, Math.min(46, W / 9.2, ((window.innerHeight || 740) - 340) / (Math.max(5, u0 + 1) + 5.6))));
      const xs = sil.p.map(p => p[0]), ys = sil.p.map(p => p[1]), sw0 = Math.max(...xs), sh0 = Math.max(...ys);
      const topH = Math.max(5, sh0 + 1) * u, H = topH + Math.round(u * 5.6);
      const SX = Math.round((W - sw0 * u) / 2), SY = Math.round((topH - sh0 * u) / 2);
      const h = hud(root), { cv, ctx, frame } = canvas(root, W, H);
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
      const bg = sprite(W, H, c => {
        let g = c.createLinearGradient(0, 0, 0, topH); g.addColorStop(0, '#1a1534'); g.addColorStop(1, '#100c22'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgba(255,255,255,.09)';
        for (let x = 0; x <= sw0 + 2; x++) for (let y = 0; y <= sh0; y++) { circ(c, SX + (x - 1) * u, SY + y * u, 1.2); c.fill(); }
        poly(c, silPx); g = c.createLinearGradient(0, SY, 0, SY + sh0 * u); g.addColorStop(0, '#2c2358'); g.addColorStop(1, '#1d1740'); c.fillStyle = g; c.fill();
        c.save(); poly(c, silPx); c.clip(); c.strokeStyle = 'rgba(45,226,230,.10)'; c.lineWidth = 2; for (let k = -H; k < W + H; k += 9) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k - topH, topH); c.stroke(); } c.restore();
        poly(c, silPx); c.lineJoin = 'round'; c.strokeStyle = 'rgba(45,226,230,.25)'; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#2de2e6'; c.lineWidth = 2; c.stroke();
        g = c.createLinearGradient(0, topH, 0, H); g.addColorStop(0, '#0c0a1a'); g.addColorStop(1, '#08070f'); c.fillStyle = g; c.fillRect(0, topH, W, H - topH);
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, topH, W, 1); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, topH + 1, W, 3);
        c.fillStyle = 'rgba(255,255,255,.28)'; c.font = '800 10px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(L('ЛОТОК С ФИГУРАМИ', 'PIECE TRAY'), W / 2, topH + 12);
      });
      const lighten = (hex, k) => { const v = parseInt(hex.slice(1), 16), f = x => Math.round(x + (255 - x) * k); return `rgb(${f(v >> 16)},${f(v >> 8 & 255)},${f(v & 255)})`; };
      function drawPiece(p, lift) {
        const v = verts(p), ys = v.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
        if (lift) { ctx.save(); ctx.translate(4, 8); poly(ctx, v); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill(); ctx.restore(); }
        else { ctx.save(); ctx.translate(1.5, 3); poly(ctx, v); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(); ctx.restore(); }
        const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, lighten(p.c, .35)); g.addColorStop(1, p.c);
        poly(ctx, v); ctx.fillStyle = g; ctx.fill();
        ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(10,6,24,.75)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); poly(ctx, v); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.translate(1, 1); poly(ctx, v); ctx.stroke(); ctx.restore();
        if (lift) { poly(ctx, v); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      }
      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bg, 0, 0, W, H);
        if (done) { poly(ctx, silPx); ctx.strokeStyle = 'rgba(212,255,58,.35)'; ctx.lineWidth = 9; ctx.stroke(); }
        for (const p of pieces) drawPiece(p, p === drag?.p && drag.moved);
        if (done) { poly(ctx, silPx); ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 3; ctx.stroke(); }
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
          done = true; sw.stop(); upd(); draw(); api.sfx.item?.(); confetti(frame); sparkle(frame, SX + sw0 * u / 2, SY + sh0 * u / 2, 24);
          const t = Math.round(sw.get());
          later(api, 900, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`«${sil.ru}» сложен за ${fmt(t)}`, `“${sil.en}” built in ${fmt(t)}`) }));
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
    const h = hud(root), { cv, ctx, frame } = canvas(root, S, S), pal = el('div', 'bg18-pal'); root.append(pal);
    let sel = 1, errors = 0, done = false, drag = false, last = -1;
    const swatches = PAL.map((c, i) => { if (!c) return null; const b = el('button', 'bg18-sw', String(i)); b.type = 'button'; b.title = NAMES[i]; b.style.background = `radial-gradient(circle at 35% 28%, rgba(255,255,255,.45), rgba(255,255,255,0) 45%), ${c}`; b.style.color = i === 3 || i === 4 || i === 1 ? '#fff' : '#1b1424'; b.style.textShadow = i === 3 || i === 4 || i === 1 ? '0 1px 2px rgba(0,0,0,.6)' : 'none'; b.onclick = () => { sel = i; api.sfx.click?.(); refresh(); }; pal.append(b); return b; });
    root.append(el('p', 'bgb2-tip', L('Выберите цвет внизу и закрашивайте клетки с этим номером — можно вести пальцем', 'Pick a colour below and paint the cells with that number — you can drag')));
    const sw = stopwatch(api, () => upd());
    const left = c => G.filter((g, i) => g === c && painted[i] !== g).length;
    const upd = () => { const rest = G.filter((g, i) => painted[i] !== g).length; h.innerHTML = chip(`🎨 ${L('Осталось', 'Left')}: <b>${rest}</b>`) + chip(`${L('Ошибки', 'Mistakes')}: <b>${errors}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
    const lum = hex => { const v = parseInt(hex.slice(1), 16); return ((v >> 16) * 299 + (v >> 8 & 255) * 587 + (v & 255) * 114) / 1000; };
    function cellDraw(i) {
      const x = (i % N) * cs, y = Math.floor(i / N) * cs, p = painted[i], g = G[i];
      if (p) { ctx.fillStyle = PAL[p]; ctx.fillRect(x, y, cs, cs); if (!done) { ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(x, y, cs, 1.5); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x, y + cs - 1.5, cs, 1.5); } }
      else { ctx.fillStyle = g === sel ? ((i + Math.floor(i / N)) % 2 ? '#c9f6ff' : '#bdf0fb') : ((i + Math.floor(i / N)) % 2 ? '#f7f5fc' : '#eeebf6'); ctx.fillRect(x, y, cs, cs); }
      if (!done) {
        if (p !== g) {
          ctx.fillStyle = p ? (lum(PAL[p]) > 140 ? '#1b1424' : '#fff') : (g === sel ? '#0a6b80' : '#7a7590');
          ctx.font = `800 ${Math.round(cs * .46)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g, x + cs / 2, y + cs / 2 + 1);
          if (p) { ctx.strokeStyle = '#ff3b6b'; ctx.lineWidth = 2; ctx.strokeRect(x + 1.5, y + 1.5, cs - 3, cs - 3); }
        }
        ctx.strokeStyle = p ? 'rgba(0,0,0,.10)' : 'rgba(60,50,100,.16)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, cs - 1, cs - 1);
      }
    }
    const drawAll = () => { ctx.clearRect(0, 0, S, S); for (let i = 0; i < N * N; i++) cellDraw(i);
      if (done) { ctx.save(); ctx.strokeStyle = 'rgba(212,255,58,.35)'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, S - 8, S - 8); ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 3; ctx.strokeRect(2, 2, S - 4, S - 4); ctx.restore(); } };
    const refresh = () => { swatches.forEach((b, i) => { if (!b) return; b.classList.toggle('on', i === sel); b.classList.toggle('done', !left(i)); }); drawAll(); upd(); };
    function paint(i) {
      if (i < 0 || done || painted[i] === sel || painted[i] === G[i]) return;
      painted[i] = sel; if (sel !== G[i]) { errors++; api.buzz?.('tap'); shake(frame); }
      cellDraw(i);
      if (!left(sel)) { swatches[sel].classList.add('done'); api.sfx.item?.(); const cx = (i % N + .5) * cs, cy = (Math.floor(i / N) + .5) * cs; sparkle(frame, cx, cy, 14); pop(frame, cx, cy - 16, '✓'); }
      if (painted.every((p, k) => p === G[k])) {
        done = true; sw.stop(); drawAll(); refresh();
        confetti(frame);
        const t = Math.round(sw.get());
        later(api, 900, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Портрет начальника готов за ${fmt(t)}. Ошибок: ${errors}`, `The boss’s portrait is done in ${fmt(t)}. Mistakes: ${errors}`) }));
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
      [['5 × 4', [5, 4], L('Планёрка', 'Stand-up'), gridIco(5, 4, '#ffe45c')], ['6 × 5', [6, 5], L('Спринт', 'Sprint'), gridIco(6, 5, '#ff8be6')], ['7 × 6', [7, 6], L('Квартальный план', 'Quarterly plan'), gridIco(7, 6, '#7df9ff')]], ([C, Rr]) => start(C, Rr));
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
      const W = widthOf(root), cell = Math.floor(Math.min(52, (W - 16) / C, ((window.innerHeight || 740) - 380) / Rw)), tc = Math.max(14, Math.round(cell * .5));
      const BW = C * cell, BH = Rw * cell, BX = Math.round((W - BW) / 2), BY = 8;
      // фиксированные гнёзда в лотке (квадрат под самый длинный размер — поворот не ломает раскладку)
      let tx = 8, ty = BY + BH + 18, rowH = 0;
      for (const p of pieces) {
        const m = Math.max(...p.cells.flat()) + 1, s = m * tc + 10;
        if (tx + s > W - 4) { tx = 6; ty += rowH + 4; rowH = 0; }
        p.slot = { x: tx, y: ty, s }; tx += s + 4; rowH = Math.max(rowH, s);
      }
      const H = ty + rowH + 6;
      const h = hud(root), { cv, ctx, frame } = canvas(root, W, H);
      root.append(el('p', 'bgb2-tip', L('Стикер, который не влез, вернётся в лоток', 'A note that doesn’t fit goes back to the tray')));
      let drag = null, done = false, moves = 0;
      const sw = stopwatch(api, () => upd());
      const filled = () => pieces.reduce((a, p) => a + (p.at ? p.cells.length : 0), 0);
      const upd = () => { h.innerHTML = chip(`🟨 <b>${filled()}/${N}</b>`) + chip(`⏱ <b>${fmt(sw.get())}</b>`); };
      const dims = cs => [Math.max(...cs.map(c => c[0])) + 1, Math.max(...cs.map(c => c[1])) + 1];
      const trayOrigin = p => { const [w, hh] = dims(p.cells); return [p.slot.x + (p.slot.s - w * tc) / 2, p.slot.y + (p.slot.s - hh * tc) / 2]; };
      const shade = (hex, k) => { const v = parseInt(hex.slice(1), 16), f = x => Math.max(0, Math.min(255, Math.round(k > 0 ? x + (255 - x) * k : x * (1 + k)))); return `rgb(${f(v >> 16)},${f(v >> 8 & 255)},${f(v & 255)})`; };
      function drawPiece(p, ox, oy, s, lift, pinned) {
        const set = new Set(p.cells.map(([x, y]) => x + ',' + y));
        const sh = lift ? [5, 9, .4] : [1.5, 2.5, .3];
        ctx.fillStyle = `rgba(0,0,0,${sh[2]})`; for (const [x, y] of p.cells) ctx.fillRect(ox + x * s + sh[0], oy + y * s + sh[1], s + .5, s + .5);
        const ys = p.cells.map(c => c[1]), y0 = oy + Math.min(...ys) * s, y1 = oy + (Math.max(...ys) + 1) * s;
        const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, shade(p.c, .35)); g.addColorStop(1, p.c);
        ctx.fillStyle = g; for (const [x, y] of p.cells) ctx.fillRect(ox + x * s, oy + y * s, s + .5, s + .5);
        ctx.strokeStyle = shade(p.c, -.45); ctx.lineWidth = lift ? 2 : 1.5; ctx.beginPath();
        for (const [x, y] of p.cells) for (let k = 0; k < 4; k++) if (!set.has((x + DX[k]) + ',' + (y + DY[k]))) {
          const ax = ox + (x + (k === 1 ? 1 : 0)) * s, ay = oy + (y + (k === 2 ? 1 : 0)) * s;
          if (k % 2 === 0) { ctx.moveTo(ax, ay); ctx.lineTo(ax + s, ay); } else { ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + s); }
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const [x, y] of p.cells) if (!set.has(x + ',' + (y - 1))) { ctx.moveTo(ox + x * s + 1, oy + y * s + 1.5); ctx.lineTo(ox + (x + 1) * s - 1, oy + y * s + 1.5); }
        ctx.stroke();
        ctx.strokeStyle = shade(p.c, -.3); ctx.globalAlpha = .45; ctx.lineWidth = Math.max(1, s * .05); ctx.lineCap = 'round'; ctx.beginPath();
        for (const [x, y] of p.cells) { ctx.moveTo(ox + x * s + s * .22, oy + y * s + s * .42); ctx.lineTo(ox + x * s + s * .78, oy + y * s + s * .42); ctx.moveTo(ox + x * s + s * .22, oy + y * s + s * .64); ctx.lineTo(ox + x * s + s * .58, oy + y * s + s * .64); }
        ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
        // загнутый уголок
        const last = p.cells.reduce((a, c) => (c[1] > a[1] || (c[1] === a[1] && c[0] > a[0]) ? c : a)), cx = ox + (last[0] + 1) * s, cy = oy + (last[1] + 1) * s, f = s * .26;
        ctx.fillStyle = 'rgba(0,0,0,.22)'; poly(ctx, [[cx - f, cy], [cx, cy - f], [cx, cy]]); ctx.fill();
        ctx.fillStyle = shade(p.c, .55); poly(ctx, [[cx - f, cy], [cx, cy - f], [cx - f, cy - f]]); ctx.fill();
        if (pinned) { const [fx, fy] = p.cells[0], px = ox + (fx + .5) * s, py = oy + fy * s + s * .16, r = Math.max(2.5, s * .09);
          ctx.fillStyle = 'rgba(0,0,0,.35)'; circ(ctx, px + 1.5, py + 2, r); ctx.fill();
          const pg = ctx.createRadialGradient(px - r * .35, py - r * .35, .5, px, py, r); pg.addColorStop(0, '#ffb3c4'); pg.addColorStop(1, '#d1203f'); ctx.fillStyle = pg; circ(ctx, px, py, r); ctx.fill(); }
      }
      const board = sprite(W, H, c => {
        // пробковая доска в деревянной раме
        let g = c.createLinearGradient(0, BY - 6, 0, BY + BH + 6); g.addColorStop(0, '#9a6a3e'); g.addColorStop(1, '#6b4426'); c.fillStyle = g; rr(c, BX - 6, BY - 6, BW + 12, BH + 12, 9); c.fill();
        c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(BX - 4, BY - 5, BW + 8, 1);
        g = c.createLinearGradient(0, BY, 0, BY + BH); g.addColorStop(0, '#c99a62'); g.addColorStop(1, '#b3824c'); c.fillStyle = g; c.fillRect(BX, BY, BW, BH);
        for (let i = 0; i < BW * BH / 18; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(90,50,20,.22)' : 'rgba(255,230,190,.18)'; c.fillRect(BX + Math.random() * BW, BY + Math.random() * BH, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5); }
        c.strokeStyle = 'rgba(70,40,15,.18)'; c.lineWidth = 1; c.setLineDash([3, 4]);
        for (let x = 1; x < C; x++) { c.beginPath(); c.moveTo(BX + x * cell + .5, BY); c.lineTo(BX + x * cell + .5, BY + BH); c.stroke(); }
        for (let y = 1; y < Rw; y++) { c.beginPath(); c.moveTo(BX, BY + y * cell + .5); c.lineTo(BX + BW, BY + y * cell + .5); c.stroke(); }
        c.setLineDash([]); g = c.createLinearGradient(0, BY, 0, BY + 10); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(BX, BY, BW, 10);
        // лоток
        const ty0 = BY + BH + 12; g = c.createLinearGradient(0, ty0, 0, H); g.addColorStop(0, 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(255,255,255,.02)');
        c.fillStyle = g; rr(c, 2, ty0, W - 4, H - ty0 - 2, 12); c.fill(); c.strokeStyle = 'rgba(255,255,255,.08)'; c.stroke();
        for (const p of pieces) { c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, p.slot.x + 2, p.slot.y + 2, p.slot.s - 4, p.slot.s - 4, 8); c.fill(); }
      });
      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(board, 0, 0, W, H);
        if (done) { ctx.strokeStyle = 'rgba(212,255,58,.4)'; ctx.lineWidth = 6; ctx.strokeRect(BX - 3, BY - 3, BW + 6, BH + 6); ctx.strokeStyle = '#d4ff3a'; ctx.lineWidth = 2; ctx.strokeRect(BX - 1, BY - 1, BW + 2, BH + 2); }
        for (const p of pieces) {
          if (p === drag?.p && drag.moved) continue;
          if (p.at) drawPiece(p, BX + p.at[0] * cell, BY + p.at[1] * cell, cell, false, true);
          else { const [ox, oy] = trayOrigin(p); drawPiece(p, ox, oy, tc); }
        }
        if (drag?.moved) {
          const [gx, gy] = cellPos(drag); if (fits(drag.p, gx, gy)) { ctx.fillStyle = 'rgba(212,255,58,.3)'; ctx.strokeStyle = 'rgba(212,255,58,.8)'; ctx.lineWidth = 1.5; for (const [x, y] of drag.p.cells) { ctx.fillRect(BX + (gx + x) * cell, BY + (gy + y) * cell, cell, cell); ctx.strokeRect(BX + (gx + x) * cell + 1, BY + (gy + y) * cell + 1, cell - 2, cell - 2); } }
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
          done = true; sw.stop(); draw(); api.sfx.item?.(); confetti(frame);
          const t = Math.round(sw.get());
          later(api, 900, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Доска ${C}×${Rw} заклеена за ${fmt(t)}`, `The ${C}×${Rw} board is covered in ${fmt(t)}`) }));
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
          if (fits(p, gx, gy)) { p.at = [gx, gy]; moves++; api.buzz?.('tap'); const n0 = p.cells.length; sparkle(frame, BX + (gx + p.cells.reduce((a, c) => a + c[0], 0) / n0 + .5) * cell, BY + (gy + p.cells.reduce((a, c) => a + c[1], 0) / n0 + .5) * cell, 10); } else p.at = null;
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
      [['6 × 6', 6, L('Табличка', 'A small sheet'), gridIco(6, 6, '#d4ff3a')], ['8 × 8', 8, L('Отчёт', 'A report'), gridIco(8, 8, '#2de2e6')], ['10 × 10', 10, L('Годовой баланс', 'Annual balance'), gridIco(10, 10, '#ff3bd4')]], n => start(n));
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
      const W = widthOf(root), cs = Math.floor(Math.max(26, Math.min(56, (W - 4) / n, ((window.innerHeight || 740) - 300) / n))), S = cs * n;
      const h = hud(root), { cv, ctx, frame } = canvas(root, S, S);
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
      const COLS = ['#13a8b0', '#e0249f', '#6a9a00', '#e06a12', '#8a4ee0', '#c99700', '#1f7fd6', '#d43a7a'];
      const sheet = sprite(S, S, c => {
        c.fillStyle = '#fbfbfe'; c.fillRect(0, 0, S, S);
        for (let y = 0; y < n; y++) if (y % 2) { c.fillStyle = '#f2f3fa'; c.fillRect(0, y * cs, S, cs); }
        c.strokeStyle = '#d9dcea'; c.lineWidth = 1;
        for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(i * cs + .5, 0); c.lineTo(i * cs + .5, S); c.moveTo(0, i * cs + .5); c.lineTo(S, i * cs + .5); c.stroke(); }
      });
      const badge = sprite(cs, cs, c => {
        const r = cs * .33, x = cs / 2, y = cs / 2;
        c.fillStyle = 'rgba(30,20,60,.25)'; circ(c, x, y + 1.5, r); c.fill();
        const g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#3b3466'); g.addColorStop(1, '#1f1a3d'); c.fillStyle = g; circ(c, x, y, r); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; circ(c, x, y - .5, r - 1); c.stroke();
      });
      const born = new Map(), loop = rafLoop(api);
      function draw() {
        const now = performance.now(); let busy = false;
        ctx.clearRect(0, 0, S, S);
        ctx.drawImage(sheet, 0, 0, S, S);
        rects.forEach((r, i) => {
          const ok = valid(r), col = ok ? COLS[i % COLS.length] : '#e8264f';
          const k = ease((now - (born.get(r) || 0)) / 180); if (k < 1) busy = true;
          const w0 = (r.x1 - r.x0 + 1) * cs, h0 = (r.y1 - r.y0 + 1) * cs, sc = .9 + .1 * k, w = (w0 - 6) * sc, hh = (h0 - 6) * sc, x = r.x0 * cs + (w0 - w) / 2, y = r.y0 * cs + (h0 - hh) / 2;
          ctx.globalAlpha = (ok ? .2 : .12) * k + (ok ? 0 : 0); ctx.fillStyle = col; rr(ctx, x, y, w, hh, 7); ctx.fill(); ctx.globalAlpha = 1;
          if (!ok) { ctx.save(); rr(ctx, x, y, w, hh, 7); ctx.clip(); ctx.strokeStyle = 'rgba(232,38,79,.18)'; ctx.lineWidth = 3; for (let q = -hh; q < w; q += 9) { ctx.beginPath(); ctx.moveTo(x + q, y + hh); ctx.lineTo(x + q + hh, y); ctx.stroke(); } ctx.restore(); }
          ctx.strokeStyle = col; ctx.lineWidth = 2.5; if (!ok) ctx.setLineDash([6, 4]); rr(ctx, x, y, w, hh, 7); ctx.stroke(); ctx.setLineDash([]);
          if (ok) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; rr(ctx, x + 2.5, y + 2.5, w - 5, hh - 5, 5); ctx.stroke(); }
        });
        if (drag) { const r = mk(drag.a, drag.b), a = (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1), x = r.x0 * cs + 1.5, y = r.y0 * cs + 1.5, w = (r.x1 - r.x0 + 1) * cs - 3, hh = (r.y1 - r.y0 + 1) * cs - 3;
          ctx.fillStyle = 'rgba(31,127,214,.14)'; ctx.fillRect(x, y, w, hh); ctx.strokeStyle = '#1f7fd6'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, hh);
          ctx.fillStyle = '#1f7fd6'; ctx.fillRect(x + w - 4, y + hh - 4, 7, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x + w - 4, y + hh - 4, 7, 7);
          const t = String(a), fs = Math.max(11, Math.round(cs * .3)); ctx.font = `800 ${fs}px system-ui,sans-serif`; const tw = ctx.measureText(t).width + 12, bx = Math.min(S - tw - 2, x + w + 2 - tw), by = Math.max(2, y - fs - 8);
          ctx.fillStyle = '#1f7fd6'; rr(ctx, bx, by, tw, fs + 6, (fs + 6) / 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, bx + tw / 2, by + (fs + 6) / 2 + .5); }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.round(cs * .42)}px system-ui,sans-serif`;
        for (let i = 0; i < n * n; i++) if (nums[i]) {
          const x = (i % n) * cs, y = ((i / n) | 0) * cs; ctx.drawImage(badge, x, y, cs, cs);
          ctx.fillStyle = '#fff'; ctx.fillText(nums[i], x + cs / 2, y + cs / 2 + 1);
        }
        if (done) { ctx.strokeStyle = 'rgba(106,154,0,.35)'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, S - 8, S - 8); ctx.strokeStyle = '#6a9a00'; ctx.lineWidth = 3; ctx.strokeRect(2, 2, S - 4, S - 4); }
        if (busy) loop(draw);
      }
      const cellAt = (x, y) => { const cx = Math.max(0, Math.min(n - 1, Math.floor(x / cs))), cy = Math.max(0, Math.min(n - 1, Math.floor(y / cs))); return cy * n + cx; };
      cv.onpointerdown = e => { if (done) return; cv.setPointerCapture?.(e.pointerId); const [x, y] = xy(cv, e), c = cellAt(x, y); drag = { a: c, b: c }; draw(); };
      cv.onpointermove = e => { if (!drag) return; const [x, y] = xy(cv, e), c = cellAt(x, y); if (c !== drag.b) { drag.b = c; draw(); } };
      cv.onpointerup = cv.onpointercancel = e => {
        if (!drag) return; const d = drag; drag = null;
        if (e.type === 'pointerup') {
          const r = mk(d.a, d.b), inside = rects.findIndex(q => ovl(q, r));
          if (d.a === d.b && inside >= 0) { rects.splice(inside, 1); api.sfx.click?.(); }
          else { rects = rects.filter(q => !ovl(q, r)); rects.push(r); born.set(r, performance.now()); api.sfx.click?.();
            const cx = (r.x0 + r.x1 + 1) / 2 * cs, cy = (r.y0 + r.y1 + 1) / 2 * cs;
            if (valid(r)) { api.buzz?.('tap'); sparkle(frame, cx, cy, 8, ['#d4ff3a', '#2de2e6', '#fff']); } else if (d.a !== d.b) { pop(frame, cx, cy, '✗', true); } }
        }
        draw(); upd();
        if (!done && covered() === n * n && rects.every(valid)) {
          done = true; sw.stop(); draw(); api.sfx.item?.(); confetti(frame); const t = Math.round(sw.get());
          later(api, 900, () => api.end({ score: t, won: true, lowerBetter: true, text: L(`Таблица ${n}×${n} разбита за ${fmt(t)}`, `The ${n}×${n} table is split in ${fmt(t)}`) }));
        }
      };
      clr.onclick = () => { if (done) return; rects = []; draw(); upd(); };
      draw(); upd();
    }
  });
})();
