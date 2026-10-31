// «☕ Разминка», игры 21–30: аркады и реакция.
// Контракт: BREAK_IMPL[n] = (root, api) => { … } — см. js/break.js. Всё внутри IIFE, наружу ничего не утекает.
(() => {
  'use strict';
  const B = window.BREAK_IMPL = window.BREAK_IMPL || {};
  const FONT = 'Nunito, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const EMO_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;

  // ---------- общие стили ----------
  const CSS = `
.bgb3-hud{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;min-height:30px;padding:0 4px 6px;font-weight:800;font-size:14px;color:var(--text);font-variant-numeric:tabular-nums;box-sizing:border-box}
.bgb3-hud span{white-space:nowrap}
.bgb3-hud b{color:var(--cyan-l)}
.bgb3-hud .bgb3-hp{color:var(--down);letter-spacing:1px}
.bgb3-hud .bgb3-ok{color:var(--up)}
.bgb3-cv{display:block;flex:none;border-radius:16px;border:1.5px solid var(--line);background:#0b0b16;touch-action:none;box-shadow:0 0 24px rgba(var(--c-rgb),.12);cursor:pointer;-webkit-tap-highlight-color:transparent}
.bgb3-btn{margin-top:10px;padding:12px 18px;border-radius:14px;border:1.5px solid rgba(var(--c-rgb),.7);background:rgba(var(--c-rgb),.12);color:var(--text);font:inherit;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 0 16px rgba(var(--c-rgb),.25);touch-action:manipulation}
.bgb3-btn:disabled{opacity:.4;cursor:default;box-shadow:none}
.bgb3-btn.bgb3-hot{border-color:var(--up);background:rgba(212,255,58,.16);animation:bgb3-pulse 1s infinite}
@keyframes bgb3-pulse{50%{box-shadow:0 0 26px rgba(212,255,58,.6)}}
.bg21-row{display:flex;gap:10px;align-items:center;justify-content:center;width:100%}
.bg21-row .bgb3-btn{flex:none;white-space:nowrap;padding:11px 14px;font-size:14px}
.bg21-row small{color:var(--text-2);font-size:12px;max-width:52%;line-height:1.25}
.bg24-grid{position:relative;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:8px;width:100%;box-sizing:border-box}
.bg24-cell{position:relative;border-radius:14px;border:1.5px dashed var(--line);background:rgba(var(--w-rgb),.025);overflow:hidden;touch-action:none;-webkit-tap-highlight-color:transparent}
.bg24-mail{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 5px 10px;text-align:center;border-radius:13px;background:var(--panel);border:1.5px solid rgba(var(--c-rgb),.55);cursor:pointer;animation:bg24-in .16s ease-out;box-sizing:border-box}
.bg24-mail .bg24-ico{font-size:28px;line-height:1.1}
.bg24-mail b{font-size:12px;line-height:1.15;color:var(--text)}
.bg24-mail small{font-size:11px;line-height:1.15;color:var(--text-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bg24-mail i{position:absolute;left:8px;right:8px;bottom:5px;height:3px;border-radius:2px;background:rgba(var(--c-rgb),.8);transform-origin:left}
.bg24-mail.bg24-gone{animation:bg24-out .25s ease-in forwards}
.bg24-mail.bg24-bad{border-color:var(--down);background:rgba(255,59,107,.2);animation:bg24-shake .3s}
.bg24-mail.bg24-hit{border-color:var(--up);background:rgba(212,255,58,.15);animation:bg24-out .3s ease-in forwards}
@keyframes bg24-in{from{transform:scale(.6);opacity:0}}
@keyframes bg24-out{to{transform:scale(.4) rotate(-12deg);opacity:0}}
@keyframes bg24-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.bg24-start{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;text-align:center;background:rgba(7,7,13,.78);border-radius:14px;z-index:2;color:#f2f0ff;font-size:14px;line-height:1.35}
.bg24-start p{margin:0;max-width:300px}
.bg30-log{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;font-size:12px;color:var(--text-2);font-variant-numeric:tabular-nums}
.bg30-log span{padding:3px 8px;border-radius:999px;border:1px solid var(--line)}
.bg30-log .bgb3-ok{color:var(--up);border-color:rgba(212,255,58,.4)}
`;
  const css = () => {
    if (document.getElementById('bg-style-3')) return;
    const s = document.createElement('style'); s.id = 'bg-style-3'; s.textContent = CSS; document.head.append(s);
  };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const on = (api, t, ty, fn, o) => { t.addEventListener(ty, fn, o); api.onExit(() => t.removeEventListener(ty, fn, o)); };
  const later = (api, ms, fn) => { const id = setTimeout(fn, ms); api.onExit(() => clearTimeout(id)); };

  // Холст под ширину root и высоту экрана (с запасом below под элементы снизу)
  function stage(root, api, o = {}) {
    css();
    const { ratio = 1.4, minH = 300, maxH = 760, below = 0 } = o;
    const hud = el('div', 'bgb3-hud');
    const cv = el('canvas', 'bgb3-cv');
    root.append(hud, cv);
    const W = Math.round(clamp(root.clientWidth || 360, 280, 600));
    const top = cv.getBoundingClientRect().top;
    const avail = (window.innerHeight || 700) - top - 14 - below;
    const g = cv.getContext('2d');
    const d = Math.min(2.5, window.devicePixelRatio || 1);
    const S = { cv, g, W, H: 0, u: W / 360, hud, d };
    S.setH = h => {
      S.H = Math.round(h);
      cv.width = Math.round(W * d); cv.height = Math.round(S.H * d);
      cv.style.width = W + 'px'; cv.style.height = S.H + 'px';
      g.setTransform(d, 0, 0, d, 0, 0);
    };
    S.setH(clamp(Math.min(W * ratio, avail), minH, Math.max(minH, Math.min(maxH, W * ratio))));
    S.pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * S.H / r.height }; };
    S.hudSet = html => { if (S._h !== html) { S._h = html; hud.innerHTML = html; } };
    return S;
  }

  // Игровой цикл: dt в секундах (не больше 0.05), пауза при скрытой вкладке
  function loop(api, fn) {
    let raf = 0, last = 0;
    const tick = t => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) { last = 0; return; }
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      fn(dt);
    };
    raf = requestAnimationFrame(tick);
    const vis = () => { last = 0; };
    document.addEventListener('visibilitychange', vis);
    api.onExit(() => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis); });
  }

  // Рисование
  const txt = (g, s, x, y, size, color = '#f2f0ff', align = 'center', w = 800) => {
    g.font = `${w} ${Math.round(size)}px ${FONT}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = color; g.fillText(s, x, y);
  };
  const rr = (g, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  };
  const sprites = {};
  const emoSprite = (ch, px) => {
    const k = ch + '|' + Math.round(px); if (sprites[k]) return sprites[k];
    const d = Math.min(2.5, window.devicePixelRatio || 1), s = Math.ceil(px * 1.35 * d);
    const c = document.createElement('canvas'); c.width = c.height = s;
    const x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `${Math.round(px * d)}px ${EMO_FONT}`; x.fillText(ch, s / 2, s / 2 + px * d * 0.06);
    return sprites[k] = { c, s: s / d };
  };
  const emo = (g, ch, px, x, y, rot = 0, alpha = 1) => {
    const { c, s } = emoSprite(ch, px);
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); if (rot) g.rotate(rot); g.drawImage(c, -s / 2, -s / 2, s, s); g.restore();
  };
  const veil = (g, W, H, l1, l2) => {
    g.fillStyle = 'rgba(7,7,13,.62)'; g.fillRect(0, 0, W, H);
    txt(g, l1, W / 2, H / 2 - 12, Math.min(26, W / 14), '#7df9ff');
    if (l2) txt(g, l2, W / 2, H / 2 + 20, Math.min(15, W / 24), '#c9c6e0', 'center', 700);
  };
  // Всплывающие надписи «+1»
  const popsAdd = (arr, x, y, s, c = '#d4ff3a') => arr.push({ x, y, s, c, t: 0 });
  const popsDraw = (g, arr, dt, size = 18) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]; p.t += dt; if (p.t > 0.9) { arr.splice(i, 1); continue; }
      g.save(); g.globalAlpha = 1 - p.t / 0.9; txt(g, p.s, p.x, p.y - p.t * 40, size, p.c); g.restore();
    }
  };
  const hearts = (n, max = 3) => '❤'.repeat(Math.max(0, n)) + '<span style="opacity:.25">' + '❤'.repeat(Math.max(0, max - n)) + '</span>';
  const tap = api => { try { api.buzz?.('tap'); } catch {} };

  // =====================================================================
  // 21. Склад: уложи коробки — кузов сверху, конвейер из 3 коробок, фура уезжает по кнопке
  // =====================================================================
  B[21] = (root, api) => {
    const { L } = api;
    const COLS = 6, ROWS = 7, TRUCKS = 5, WIN = 350;
    const S = stage(root, api, { ratio: 1.9, minH: 400, below: 62 });
    const { g, W } = S;
    const cell = Math.floor(Math.min((W - 28) / COLS, (S.H - 14) / (ROWS + 3.55)));
    S.setH(cell * (ROWS + 3.55) + 14);
    const H = S.H, gw = cell * COLS, gx = Math.round((W - gw) / 2), gy = Math.round(cell * 0.95) + 4;
    const gb = gy + ROWS * cell, cy = gb + cell * 0.4, ch = cell * 2.2, sc = cell * 0.6, slotW = W / 3;
    const row = el('div', 'bg21-row');
    const ship = el('button', 'bgb3-btn'); ship.type = 'button';
    const hint = el('small', '', L('Тап по коробке — повернуть. Перетащите её в кузов или тапните по кузову.', 'Tap a box to rotate. Drag it into the truck or tap the truck.'));
    row.append(ship, hint); root.append(row);

    const SIZES = [[1, 1], [1, 1], [1, 2], [1, 2], [1, 2], [1, 3], [1, 3], [2, 2], [2, 2], [2, 2], [2, 3], [2, 3]];
    const BOX = ['#c98d4e', '#b97c40', '#d9a468', '#a9713a', '#c4935c'];
    const TAPE = ['#2de2e6', '#ff3bd4', '#d4ff3a', '#ffb02e'];
    const LABEL = ['📎', '🖨️', '📚', '☕', '🧻', '💾', '🖊️', '📁'];
    let uid = 0;
    const mk = () => { const s = api.rnd(SIZES), f = api.rng() < 0.5; return { w: f ? s[1] : s[0], h: f ? s[0] : s[1], col: api.rnd(BOX), t: api.rnd(TAPE), l: api.rnd(LABEL), id: ++uid }; };
    let grid, placed, offer = [mk(), mk(), mk()], sel = -1, drag = null, score = 0, truck = 1, shipped = 0;
    let phase = 'play', pt = 0, ty = 0, over = false, belt = 0, msg = '';
    const pops = [];
    const reset = () => { grid = [...Array(ROWS)].map(() => Array(COLS).fill(0)); placed = []; };
    reset();
    const filled = () => grid.reduce((s, r) => s + r.filter(Boolean).length, 0);
    const fill = () => filled() / (COLS * ROWS);
    const fits = (w, h, r, c) => { if (r < 0 || c < 0 || r + h > ROWS || c + w > COLS) return false; for (let i = r; i < r + h; i++) for (let j = c; j < c + w; j++) if (grid[i][j]) return false; return true; };
    const fitsAny = b => { for (const [w, h] of [[b.w, b.h], [b.h, b.w]]) for (let r = 0; r <= ROWS - h; r++) for (let c = 0; c <= COLS - w; c++) if (fits(w, h, r, c)) return true; return false; };

    const updUI = () => {
      const f = Math.round(fill() * 100);
      S.hudSet(`<span>🚚 ${L('Фура', 'Truck')} <b>${Math.min(truck, TRUCKS)}/${TRUCKS}</b></span><span>${L('Загрузка', 'Load')} <b>${f}%</b></span><span>${L('Очки', 'Score')} <b>${score}</b></span>`);
      ship.textContent = `🚚 ${L('Отправить', 'Ship it')} · ${f}%`;
      ship.disabled = phase !== 'play' || f < 50 || over;
      ship.classList.toggle('bgb3-hot', !ship.disabled && (f >= 85 || !!msg));
    };
    const finish = why => {
      if (over) return; over = true; phase = 'over'; updUI();
      later(api, 500, () => api.end({ score, won: score >= WIN, text: `${why} ${L(`Отправлено фур: ${shipped}.`, `Trucks shipped: ${shipped}.`)}` }));
    };
    const check = () => {
      msg = '';
      if (filled() === COLS * ROWS) return depart();
      if (!offer.some(fitsAny)) {
        if (fill() >= 0.5) msg = L('Ничего не влезает — отправляйте фуру!', 'Nothing fits — ship the truck!');
        else finish(L('Ни одна коробка не помещается.', 'No box fits anymore.'));
      }
      updUI();
    };
    const place = (i, r, c) => {
      const b = offer[i];
      placed.push({ ...b, r, c });
      for (let a = r; a < r + b.h; a++) for (let j = c; j < c + b.w; j++) grid[a][j] = b.id;
      score += b.w * b.h; popsAdd(pops, gx + (c + b.w / 2) * cell, gy + (r + b.h / 2) * cell, '+' + b.w * b.h);
      api.sfx.stapler?.(); tap(api);
      offer[i] = mk(); sel = -1; check();
    };
    const depart = () => {
      const f = fill(); if (phase !== 'play' || f < 0.5 || over) return;
      const rows = grid.filter(r => r.every(Boolean)).length;
      const bonus = Math.round(f * f * 100) + rows * 10;
      score += bonus; shipped++; msg = '';
      popsAdd(pops, W / 2, gy + ROWS * cell / 2, `🚚 +${bonus}`, '#7df9ff');
      api.sfx.coins?.();
      phase = 'out'; pt = 0; updUI();
    };
    ship.onclick = depart;
    const tryTapPlace = (i, r, c) => {
      const b = offer[i]; let best = null, bd = 1e9;
      for (let dr = 0; dr < b.h; dr++) for (let dc = 0; dc < b.w; dc++) {
        if (!fits(b.w, b.h, r - dr, c - dc)) continue;
        const d = (dr - (b.h - 1) / 2) ** 2 + (dc - (b.w - 1) / 2) ** 2;
        if (d < bd) { bd = d; best = [r - dr, c - dc]; }
      }
      if (best) place(i, best[0], best[1]); else { popsAdd(pops, gx + (c + .5) * cell, gy + (r + .5) * cell, L('не влезает', 'no room'), '#ff3b6b'); api.buzz?.('danger'); }
    };
    const snap = d => {
      const b = offer[d.i];
      const left = d.x - b.w * cell / 2, top = d.y - b.h * cell / 2 - d.lift;
      const c = Math.round((left - gx) / cell), r = Math.round((top - gy) / cell);
      if (left + b.w * cell < gx - cell * .5 || left > gx + gw + cell * .5 || top > gb + cell * .3 || top + b.h * cell < gy - cell) return null;
      return { r, c, ok: fits(b.w, b.h, r, c) };
    };
    on(api, S.cv, 'pointerdown', e => {
      if (phase !== 'play' || over) return;
      const p = S.pos(e);
      if (p.y > cy - cell * 0.2) {
        const i = clamp(Math.floor(p.x / slotW), 0, 2);
        drag = { i, sx: p.x, sy: p.y, x: p.x, y: p.y, moved: false, lift: e.pointerType === 'touch' ? cell * 0.9 : 0, id: e.pointerId };
        try { S.cv.setPointerCapture(e.pointerId); } catch {}
      } else if (sel >= 0 && p.x >= gx && p.x < gx + gw && p.y >= gy && p.y < gb) {
        tryTapPlace(sel, Math.floor((p.y - gy) / cell), Math.floor((p.x - gx) / cell));
      }
    });
    on(api, S.cv, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = S.pos(e); drag.x = p.x; drag.y = p.y;
      if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 10) drag.moved = true;
    });
    const up = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.moved) {
        if (sel === d.i) { const b = offer[d.i]; [b.w, b.h] = [b.h, b.w]; tap(api); } else sel = d.i;
        check(); return;
      }
      const s = snap(d);
      if (s && s.ok) place(d.i, s.r, s.c);
    };
    on(api, S.cv, 'pointerup', up); on(api, S.cv, 'pointercancel', () => { drag = null; });

    const drawBox = (b, x, y, w, h, alpha = 1) => {
      g.save(); g.globalAlpha = alpha;
      const p = Math.max(1.5, w * 0.03);
      rr(g, x + p, y + p, w - 2 * p, h - 2 * p, 5); g.fillStyle = b.col; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,.35)'; g.stroke();
      g.fillStyle = b.t; g.globalAlpha = alpha * 0.85;
      if (w >= h) g.fillRect(x + p, y + h / 2 - h * 0.07, w - 2 * p, h * 0.14); else g.fillRect(x + w / 2 - w * 0.07, y + p, w * 0.14, h - 2 * p);
      g.globalAlpha = alpha;
      const m = Math.min(w, h);
      if (m > 26) emo(g, b.l, m * 0.32, x + (w >= h ? w * 0.25 : w / 2), y + (w >= h ? h / 2 : h * 0.25), 0, 0.9);
      g.restore();
    };
    const drawTruck = oy => {
      g.save(); g.translate(0, oy);
      // кабина
      rr(g, gx + cell * 0.8, gy - cell * 0.92, gw - cell * 1.6, cell * 0.95, 10); g.fillStyle = '#2a2a44'; g.fill();
      g.strokeStyle = 'rgba(125,249,255,.7)'; g.lineWidth = 2; g.stroke();
      rr(g, gx + cell * 1.1, gy - cell * 0.78, gw - cell * 2.2, cell * 0.36, 6); g.fillStyle = 'rgba(45,226,230,.35)'; g.fill();
      g.fillStyle = '#ffd34d'; g.fillRect(gx + cell * 0.95, gy - cell * 0.3, cell * 0.25, cell * 0.14); g.fillRect(gx + gw - cell * 1.2, gy - cell * 0.3, cell * 0.25, cell * 0.14);
      // кузов
      rr(g, gx - 5, gy - 3, gw + 10, ROWS * cell + 8, 8); g.fillStyle = '#3b3b52'; g.fill();
      g.fillStyle = '#2b2219'; g.fillRect(gx, gy, gw, ROWS * cell);
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
      for (let i = 1; i < COLS; i++) { g.beginPath(); g.moveTo(gx + i * cell, gy); g.lineTo(gx + i * cell, gb); g.stroke(); }
      for (let i = 1; i < ROWS; i++) { g.beginPath(); g.moveTo(gx, gy + i * cell); g.lineTo(gx + gw, gy + i * cell); g.stroke(); }
      // заполненные ряды подсвечены
      grid.forEach((r, i) => { if (r.every(Boolean)) { g.fillStyle = 'rgba(212,255,58,.12)'; g.fillRect(gx - 5, gy + i * cell, 5, cell); g.fillRect(gx + gw, gy + i * cell, 5, cell); } });
      placed.forEach(b => drawBox(b, gx + b.c * cell, gy + b.r * cell, b.w * cell, b.h * cell));
      g.restore();
    };
    loop(api, dt => {
      belt += dt;
      if (phase === 'out') { pt += dt; ty = -((pt / 0.7) ** 2) * (gb + cell * 2); if (pt >= 0.7) { truck++; if (truck > TRUCKS) { ty = 0; reset(); finish(L('Смена окончена!', 'Shift over!')); } else { reset(); phase = 'in'; pt = 0; check(); } } }
      else if (phase === 'in') { pt += dt; const k = Math.min(1, pt / 0.5); ty = (1 - k) * (1 - k) * (H * 0.9); if (k >= 1) { phase = 'play'; ty = 0; updUI(); } }
      g.clearRect(0, 0, W, H);
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#11111e'); bg.addColorStop(1, '#0a0a14'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,211,77,.12)'; g.lineWidth = 6; g.setLineDash([14, 14]);
      g.beginPath(); g.moveTo(gx - 16, 0); g.lineTo(gx - 16, gb + 4); g.moveTo(gx + gw + 16, 0); g.lineTo(gx + gw + 16, gb + 4); g.stroke(); g.setLineDash([]);
      drawTruck(ty);
      // призрак при перетаскивании
      if (drag && drag.moved) {
        const b = offer[drag.i], s = snap(drag);
        if (s) {
          g.save(); g.globalAlpha = 0.5; g.fillStyle = s.ok ? 'rgba(212,255,58,.5)' : 'rgba(255,59,107,.5)';
          const r0 = clamp(s.r, 0, ROWS - b.h), c0 = clamp(s.c, 0, COLS - b.w);
          g.fillRect(gx + c0 * cell, gy + r0 * cell, b.w * cell, b.h * cell); g.restore();
        }
        drawBox(b, drag.x - b.w * cell / 2, drag.y - b.h * cell / 2 - drag.lift, b.w * cell, b.h * cell, 0.75);
      }
      // конвейер
      rr(g, 4, cy, W - 8, ch, 12); g.fillStyle = '#1b1b2c'; g.fill(); g.strokeStyle = 'rgba(45,226,230,.3)'; g.lineWidth = 1.5; g.stroke();
      g.save(); rr(g, 4, cy, W - 8, ch, 12); g.clip();
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2;
      const off = (belt * 30) % 22; for (let x = -22 + off; x < W; x += 22) { g.beginPath(); g.moveTo(x, cy); g.lineTo(x + 10, cy + ch); g.stroke(); }
      g.restore();
      offer.forEach((b, i) => {
        if (drag && drag.moved && drag.i === i) return;
        const cxs = slotW * i + slotW / 2, cys = cy + ch / 2, bw = b.w * sc, bh = b.h * sc;
        const ok = phase !== 'play' || fitsAny(b);
        if (sel === i) { rr(g, slotW * i + 8, cy + 5, slotW - 16, ch - 10, 10); g.strokeStyle = '#7df9ff'; g.lineWidth = 2.5; g.stroke(); }
        drawBox(b, cxs - bw / 2, cys - bh / 2, bw, bh, ok ? 1 : 0.35);
        if (!ok) txt(g, '✕', cxs, cys, sc * 0.9, '#ff3b6b');
      });
      popsDraw(g, pops, dt, Math.max(16, cell * 0.36));
      if (msg) { g.fillStyle = 'rgba(7,7,13,.75)'; g.fillRect(0, gb - cell * 0.7, W, cell * 0.6); txt(g, msg, W / 2, gb - cell * 0.4, Math.min(16, W / 24), '#d4ff3a'); }
    });
    updUI();
  };

  // =====================================================================
  // 22. Поймай кофе — поднос внизу, ловим чашки, уворачиваемся от жуков и бумажек
  // =====================================================================
  B[22] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.45 });
    const { g, W, H, u } = S;
    const k = H / 600, trayW = 88 * u, trayY = H - 44 * k, WIN = 20;
    let state = 'ready', score = 0, lives = 3, t = 0, spawn = 0.4, items = [], pops = [], trayX = W / 2, target = W / 2, flash = 0, keys = 0;
    const upd = () => S.hudSet(`<span>☕ ${L('Поймано', 'Caught')} <b>${score}</b></span><span class="bgb3-hp">${hearts(lives)}</span>`);
    const start = () => { if (state === 'ready') { state = 'run'; api.sfx.sms?.(); } };
    on(api, S.cv, 'pointerdown', e => { target = S.pos(e).x; start(); try { S.cv.setPointerCapture(e.pointerId); } catch {} });
    on(api, S.cv, 'pointermove', e => { target = S.pos(e).x; });
    const kd = e => { if (e.key === 'ArrowLeft') keys = -1; else if (e.key === 'ArrowRight') keys = 1; else return; start(); e.preventDefault(); };
    const ku = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keys = 0; };
    on(api, window, 'keydown', kd); on(api, window, 'keyup', ku);
    const spawnOne = () => {
      const bad = Math.min(0.38, 0.16 + t * 0.005), r = api.rng();
      const kind = r < 0.07 ? 'donut' : r < 0.07 + bad ? (api.rng() < 0.5 ? 'bug' : 'paper') : 'cup';
      const sp = (170 + Math.min(300, t * 6)) * k * (0.85 + api.rng() * 0.35);
      items.push({ kind, x: 24 * u + api.rng() * (W - 48 * u), y: -20, vy: sp, sw: api.rng() * TAU, rot: 0 });
    };
    const ICON = { cup: '☕', donut: '🍩', bug: '🐛', paper: '📄' };
    const lose = () => { lives--; flash = 0.35; api.sfx.buzzer?.(); upd(); if (lives <= 0 && state === 'run') { state = 'over'; later(api, 700, () => api.end({ score, won: score >= WIN, text: L(`Поймано чашек: ${score}. Цель — ${WIN}.`, `Cups caught: ${score}. Goal: ${WIN}.`) })); } };
    loop(api, dt => {
      if (state === 'run') {
        t += dt; spawn -= dt;
        if (spawn <= 0) { spawnOne(); spawn = Math.max(0.33, 0.95 - t * 0.012) * (0.75 + api.rng() * 0.5); }
      }
      if (keys) target = clamp(trayX + keys * 60 * u, 0, W);
      trayX += (clamp(target, trayW / 2, W - trayW / 2) - trayX) * Math.min(1, dt * 18);
      if (state !== 'ready') for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i]; it.y += it.vy * dt; it.sw += dt * 3;
        if (it.kind === 'paper') { it.x += Math.sin(it.sw) * 60 * u * dt; it.rot = Math.sin(it.sw) * 0.5; }
        if (it.kind === 'bug') it.rot = Math.sin(it.sw * 2) * 0.3;
        if (state === 'run' && it.y > trayY - 22 * k && it.y < trayY + 6 * k && Math.abs(it.x - trayX) < trayW / 2 + 6 * u) {
          items.splice(i, 1);
          if (it.kind === 'cup' || it.kind === 'donut') { const v = it.kind === 'donut' ? 3 : 1; score += v; popsAdd(pops, it.x, trayY - 30 * k, '+' + v); api.sfx.item?.(); upd(); }
          else { popsAdd(pops, it.x, trayY - 30 * k, it.kind === 'bug' ? L('баг!', 'bug!') : L('ещё отчёт!', 'more reports!'), '#ff3b6b'); lose(); }
          continue;
        }
        if (it.y > H + 30) { items.splice(i, 1); if (state === 'run' && it.kind === 'cup') { popsAdd(pops, it.x, H - 20, L('мимо', 'miss'), '#ff3b6b'); lose(); } }
      }
      // фон: кухня офиса
      g.fillStyle = '#0d0d19'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 1;
      for (let y = 0; y < H; y += 36 * u) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (let x = 0; x < W; x += 36 * u) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      g.fillStyle = '#1e1e33'; g.fillRect(0, 0, W, 18 * k); g.fillStyle = 'rgba(255,59,212,.5)'; g.fillRect(0, 18 * k, W, 2);
      for (let i = 0; i < 5; i++) { g.fillStyle = '#2a2a44'; g.fillRect(W * (0.1 + i * 0.2) - 10 * u, 18 * k, 20 * u, 8 * k); }
      items.forEach(it => emo(g, ICON[it.kind], 34 * u, it.x, it.y, it.rot));
      // поднос
      g.save(); g.shadowColor = 'rgba(255,59,212,.7)'; g.shadowBlur = 14;
      rr(g, trayX - trayW / 2, trayY, trayW, 10 * k, 5 * k); g.fillStyle = '#cfd3e6'; g.fill(); g.restore();
      rr(g, trayX - trayW / 2 - 7 * u, trayY - 3 * k, 10 * u, 7 * k, 3); g.fillStyle = '#9aa0b8'; g.fill();
      rr(g, trayX + trayW / 2 - 3 * u, trayY - 3 * k, 10 * u, 7 * k, 3); g.fill();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(trayX - trayW / 2 + 8 * u, trayY + 2 * k, trayW - 16 * u, 2);
      popsDraw(g, pops, dt, 18 * u);
      if (flash > 0) { flash -= dt; g.fillStyle = `rgba(255,59,107,${flash})`; g.fillRect(0, 0, W, H); }
      if (state === 'ready') veil(g, W, H, L('Коснитесь, чтобы начать', 'Tap to start'), L('Ловите ☕ и 🍩, избегайте 🐛 и 📄', 'Catch ☕ and 🍩, avoid 🐛 and 📄'));
    });
    upd();
  };

  // =====================================================================
  // 23. Увернись от дедлайнов — бег по коридору, прыжок тапом (удержание — выше)
  // =====================================================================
  B[23] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 0.95, minH: 260, maxH: 460 });
    const { g, W, H } = S;
    const k = H / 320, ground = H * 0.8, WIN = 200, M = 40 * k;
    const P = { x: W * 0.2, y: ground, vy: 0, w: 24 * k, h: 50 * k, on: true, hold: false, ht: 0 };
    let state = 'ready', speed = 240 * k, dist = 0, t = 0, obs = [], next = W * 0.9, phase = 0, buf = 0, scroll = 0;
    const meters = () => Math.floor(dist / M);
    const upd = () => S.hudSet(`<span>🏃 <b>${meters()}</b> ${L('м', 'm')}</span><span>${L('Цель', 'Goal')} ${WIN} ${L('м', 'm')}</span>`);
    const press = () => { if (state === 'ready') { state = 'run'; } if (state !== 'run') return; buf = 0.14; P.hold = true; };
    const release = () => { P.hold = false; };
    on(api, S.cv, 'pointerdown', e => { e.preventDefault(); press(); });
    on(api, window, 'pointerup', release); on(api, window, 'pointercancel', release);
    on(api, window, 'keydown', e => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); if (!e.repeat) press(); } });
    on(api, window, 'keyup', e => { if (e.code === 'Space' || e.key === 'ArrowUp') release(); });
    const KINDS = [
      { id: 'folders', w: 30, h: 30 }, { id: 'folders2', w: 58, h: 26 }, { id: 'chair', w: 38, h: 46 },
      { id: 'cabinet', w: 32, h: 62, after: 12 }, { id: 'deadline', w: 34, h: 26, fly: 58, after: 8 },
    ];
    const spawn = () => {
      const pool = KINDS.filter(q => !q.after || t > q.after), q = api.rnd(pool);
      obs.push({ id: q.id, x: W + 20, w: q.w * k, h: q.h * k, b: q.fly ? ground - q.fly * k : ground, ph: api.rng() * TAU });
      next = speed * (0.8 + api.rng() * 0.75) + 70 * k + (q.w - 30) * k;
    };
    const crash = () => { state = 'over'; api.sfx.stamp?.(); api.buzz?.('danger'); later(api, 800, () => api.end({ score: meters(), won: meters() >= WIN, text: L(`Пробежали ${meters()} м по коридору.`, `You ran ${meters()} m down the corridor.`) })); };
    const drawObs = o => {
      const x = o.x, top = o.b - o.h;
      if (o.id === 'folders' || o.id === 'folders2') {
        const n = 3, hh = o.h / n, cols = ['#ff3bd4', '#2de2e6', '#ffd34d', '#d4ff3a'];
        for (let i = 0; i < n; i++) { rr(g, x + (i % 2) * 2 * k, o.b - (i + 1) * hh, o.w - 2 * k, hh - 1.5 * k, 3 * k); g.fillStyle = cols[(i + Math.round(o.ph)) % 4]; g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + o.w * 0.4, o.b - (i + 1) * hh + hh * 0.3, o.w * 0.2, hh * 0.3); }
      } else if (o.id === 'chair') {
        g.fillStyle = '#3a3a5c'; rr(g, x + o.w * 0.65, top, o.w * 0.3, o.h * 0.6, 4 * k); g.fill();
        rr(g, x, top + o.h * 0.5, o.w, o.h * 0.14, 4 * k); g.fill();
        g.fillStyle = '#8a8aa8'; g.fillRect(x + o.w * 0.45, top + o.h * 0.64, 4 * k, o.h * 0.25);
        g.fillRect(x + o.w * 0.1, o.b - 5 * k, o.w * 0.8, 3 * k);
        g.fillStyle = '#111'; [0.12, 0.88].forEach(f => { g.beginPath(); g.arc(x + o.w * f, o.b - 2.5 * k, 3 * k, 0, TAU); g.fill(); });
      } else if (o.id === 'cabinet') {
        rr(g, x, top, o.w, o.h, 3 * k); g.fillStyle = '#56607a'; g.fill();
        for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.5; g.strokeRect(x + 3 * k, top + 3 * k + i * (o.h - 6 * k) / 3, o.w - 6 * k, (o.h - 6 * k) / 3 - 2 * k); g.fillStyle = '#c9cede'; g.fillRect(x + o.w / 2 - 4 * k, top + 8 * k + i * (o.h - 6 * k) / 3, 8 * k, 2.5 * k); }
      } else {
        rr(g, x, top, o.w, o.h, 4 * k); g.fillStyle = '#fff'; g.fill();
        g.fillStyle = '#ff3b6b'; g.fillRect(x, top, o.w, o.h * 0.32);
        txt(g, '!', x + o.w / 2, top + o.h * 0.66, o.h * 0.6, '#ff3b6b', 'center', 900);
        g.strokeStyle = 'rgba(255,59,107,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + o.w + 4 * k, top + o.h * 0.3); g.lineTo(x + o.w + 16 * k, top + o.h * 0.3); g.moveTo(x + o.w + 4 * k, top + o.h * 0.7); g.lineTo(x + o.w + 12 * k, top + o.h * 0.7); g.stroke();
      }
    };
    const drawP = () => {
      const x = P.x, y = P.y, sw = P.on ? Math.sin(phase) : 0.6;
      g.lineCap = 'round'; g.strokeStyle = '#2b2b45'; g.lineWidth = 6 * k;
      g.beginPath(); g.moveTo(x, y - 20 * k); g.lineTo(x + sw * 9 * k, y); g.moveTo(x, y - 20 * k); g.lineTo(x - sw * 9 * k, y - (P.on ? 0 : 6 * k)); g.stroke();
      rr(g, x - 9 * k, y - 40 * k, 18 * k, 22 * k, 5 * k); g.fillStyle = '#2de2e6'; g.fill();
      g.fillStyle = '#ff3bd4'; g.beginPath(); g.moveTo(x - 2 * k, y - 39 * k); g.lineTo(x + 2 * k, y - 39 * k); g.lineTo(x + 3 * k, y - 26 * k); g.lineTo(x, y - 23 * k); g.lineTo(x - 3 * k, y - 26 * k); g.fill();
      g.strokeStyle = '#f0c9a0'; g.lineWidth = 4.5 * k; g.beginPath(); g.moveTo(x, y - 35 * k); g.lineTo(x - sw * 10 * k, y - 24 * k - (P.on ? 0 : 10 * k)); g.moveTo(x, y - 35 * k); g.lineTo(x + sw * 10 * k, y - 26 * k - (P.on ? 0 : 10 * k)); g.stroke();
      g.fillStyle = '#f0c9a0'; g.beginPath(); g.arc(x + 1 * k, y - 47 * k, 7.5 * k, 0, TAU); g.fill();
      g.fillStyle = '#3a2516'; g.beginPath(); g.arc(x, y - 49 * k, 7.5 * k, Math.PI * 1.05, TAU * 0.98); g.fill();
      g.fillStyle = '#111'; g.fillRect(x + 4 * k, y - 48 * k, 2 * k, 2 * k);
      g.lineCap = 'butt';
    };
    loop(api, dt => {
      if (state === 'run') {
        t += dt; speed = Math.min(640 * k, 240 * k + t * 9 * k); dist += speed * dt; scroll += speed * dt; phase += dt * speed / (22 * k);
        buf -= dt;
        if (buf > 0 && P.on) { P.vy = -720 * k; P.on = false; P.ht = 0; buf = 0; }
        if (!P.on) {
          P.ht += dt; const low = P.hold && P.vy < 0 && P.ht < 0.28;
          P.vy += 2300 * k * (low ? 0.45 : 1) * dt; P.y += P.vy * dt;
          if (P.y >= ground) { P.y = ground; P.vy = 0; P.on = true; }
        }
        next -= speed * dt; if (next <= 0) spawn();
        for (let i = obs.length - 1; i >= 0; i--) {
          const o = obs[i]; o.x -= speed * dt; if (o.x + o.w < -30) { obs.splice(i, 1); continue; }
          if (o.id === 'deadline') o.b = ground - 58 * k + Math.sin((o.ph += dt * 4)) * 4 * k;
          const m = 4 * k;
          if (P.x + P.w / 2 - m > o.x && P.x - P.w / 2 + m < o.x + o.w && P.y - m > o.b - o.h && P.y - P.h + m < o.b) { crash(); break; }
        }
        upd();
      } else if (state === 'over') { /* застыли */ } else { phase += dt * 6; }
      // фон: коридор
      g.fillStyle = '#121223'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#17172b'; g.fillRect(0, 0, W, H * 0.08);
      const s1 = (scroll * 0.5) % (220 * k);
      for (let x = -s1; x < W + 220 * k; x += 220 * k) {
        rr(g, x + 30 * k, ground - 96 * k, 52 * k, 96 * k, 3 * k); g.fillStyle = '#2a2240'; g.fill();
        g.fillStyle = '#d4ff3a'; g.beginPath(); g.arc(x + 74 * k, ground - 48 * k, 2.5 * k, 0, TAU); g.fill();
        g.fillStyle = 'rgba(45,226,230,.12)'; g.fillRect(x + 120 * k, ground - 120 * k, 70 * k, 50 * k);
        g.strokeStyle = 'rgba(45,226,230,.35)'; g.lineWidth = 1.5; g.strokeRect(x + 120 * k, ground - 120 * k, 70 * k, 50 * k);
        g.fillStyle = 'rgba(255,255,220,.5)'; g.fillRect(x + 140 * k, H * 0.08, 50 * k, 4 * k);
      }
      g.fillStyle = '#1d1d33'; g.fillRect(0, ground, W, H - ground);
      g.fillStyle = 'rgba(255,59,212,.6)'; g.fillRect(0, ground, W, 2);
      g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2;
      const s2 = scroll % (48 * k);
      for (let x = -s2; x < W + 48 * k; x += 48 * k) { g.beginPath(); g.moveTo(x, ground + 2); g.lineTo(x - 30 * k, H); g.stroke(); }
      obs.forEach(drawObs);
      drawP();
      if (state === 'ready') veil(g, W, H, L('Коснитесь — прыжок', 'Tap to jump'), L('Держите дольше — прыжок выше', 'Hold longer to jump higher'));
    });
    upd();
  };

  // =====================================================================
  // 24. Отбей спам — письма всплывают в сетке, тапаем только спам, 45 секунд
  // =====================================================================
  B[24] = (root, api) => {
    const { L } = api; css();
    const DUR = 45, WIN = 20;
    const hud = el('div', 'bgb3-hud'), grid = el('div', 'bg24-grid');
    root.append(hud, grid);
    const top = grid.getBoundingClientRect().top;
    const gh = clamp((window.innerHeight || 700) - top - 16, 360, Math.min(620, (root.clientWidth || 360) * 1.45));
    grid.style.height = gh + 'px';
    const cells = [...Array(12)].map(() => { const c = el('div', 'bg24-cell'); grid.append(c); return c; });
    const SPAM = [
      ['🤑', 'Вы выиграли!', 'You won!', 'Заберите приз прямо сейчас', 'Claim your prize right now'],
      ['💰', 'Наследство', 'Inheritance', 'Дальний дядя оставил вам миллион', 'A distant uncle left you a million'],
      ['🎰', 'Казино «Фортуна»', 'Fortune Casino', '100 бесплатных вращений', '100 free spins'],
      ['🔥', 'Скидка 99%', '99% off', 'Только сегодня! Жмите!', 'Today only! Click!'],
      ['👑', 'Заморский принц', 'Overseas prince', 'Помогите вывести золото', 'Help me move my gold'],
      ['🎁', 'Подарок ждёт', 'A gift awaits', 'Подтвердите номер карты', 'Confirm your card number'],
      ['📈', 'Крипта ×1000', 'Crypto ×1000', 'Секретная монета, успейте', 'A secret coin, hurry'],
      ['💊', 'Чудо-витамины', 'Miracle pills', 'Работайте 25 часов в сутки', 'Work 25 hours a day'],
    ];
    const LEGIT = [
      ['👔', 'Босс', 'Boss', 'Отчёт к 18:00', 'Report by 6 PM'],
      ['👔', 'Босс', 'Boss', 'Зайди ко мне', 'Come see me'],
      ['📊', 'Бухгалтерия', 'Accounting', 'Сверка счетов', 'Invoice check'],
      ['🧑‍💼', 'HR', 'HR', 'Опрос о вовлечённости', 'Engagement survey'],
      ['👩‍💻', 'Коллега', 'Coworker', 'Обедаем в 13:00?', 'Lunch at 1 PM?'],
      ['📅', 'Календарь', 'Calendar', 'Планёрка через 5 минут', 'Stand-up in 5 minutes'],
      ['🛠️', 'IT-отдел', 'IT desk', 'Ваша заявка выполнена', 'Your ticket is resolved'],
    ];
    let state = 'ready', t = 0, score = 0, streak = 0, spawn = 0.3, mails = new Map();
    const upd = () => {
      const left = Math.max(0, Math.ceil(DUR - t));
      hud.innerHTML = `<span>⏱ <b>${left}</b> ${L('с', 's')}</span><span>🗑️ ${L('Спам', 'Spam')} <b>${score}</b></span><span>${streak >= 3 ? `🔥 ×${streak}` : ''}</span>`;
    };
    const overlay = el('div', 'bg24-start', `<p>${L('Тапайте только по спаму: 🤑 «Вы выиграли!», скидки, принцы и казино.', 'Tap only the spam: 🤑 “You won!”, discounts, princes and casinos.')}</p><p>${L('Письма от босса и коллег не трогать — штраф −2.', 'Leave mail from the boss and coworkers alone — −2 penalty.')}</p>`);
    const go = el('button', 'bgb3-btn', L('Начать', 'Start')); go.type = 'button'; overlay.append(go); grid.append(overlay);
    go.onclick = () => { overlay.remove(); state = 'run'; api.sfx.sms?.(); };
    const remove = (i, cls) => { const m = mails.get(i); if (!m) return; mails.delete(i); m.node.classList.add(cls); later(api, 320, () => m.node.remove()); };
    cells.forEach((c, i) => {
      on(api, c, 'pointerdown', e => {
        e.preventDefault(); const m = mails.get(i); if (!m || state !== 'run') return;
        if (m.spam) {
          streak++; const v = 1 + (streak % 5 === 0 ? 2 : 0); score += v; api.sfx.stapler?.(); tap(api); remove(i, 'bg24-hit');
        } else {
          streak = 0; score = Math.max(0, score - 2); api.sfx.buzzer?.(); mails.delete(i); m.node.classList.add('bg24-bad'); later(api, 320, () => m.node.remove());
        }
        upd();
      });
    });
    const add = () => {
      const free = cells.map((_, i) => i).filter(i => !mails.has(i) && !cells[i].firstChild); if (!free.length) return;
      const i = api.rnd(free), spam = api.rng() < 0.58, d = api.rnd(spam ? SPAM : LEGIT);
      const life = Math.max(1.15, 2.5 - t * 0.03);
      const node = el('div', 'bg24-mail', `<span class="bg24-ico">${d[0]}</span><b>${api.esc(L(d[1], d[2]))}</b><small>${api.esc(L(d[3], d[4]))}</small><i></i>`);
      cells[i].append(node);
      mails.set(i, { spam, life, max: life, node, bar: node.querySelector('i') });
    };
    loop(api, dt => {
      if (state !== 'run') return;
      t += dt; spawn -= dt;
      if (spawn <= 0) { add(); if (t > 25 && api.rng() < 0.35) add(); spawn = Math.max(0.38, 0.85 - t * 0.011); }
      mails.forEach((m, i) => {
        m.life -= dt; m.bar.style.transform = `scaleX(${Math.max(0, m.life / m.max)})`;
        if (m.life <= 0) { if (m.spam) streak = 0; remove(i, 'bg24-gone'); }
      });
      if (t >= DUR) {
        state = 'over'; mails.forEach((m, i) => remove(i, 'bg24-gone'));
        api.end({ score, won: score >= WIN, text: L(`Отправлено в корзину: ${score}. Цель — ${WIN}.`, `Spam binned: ${score}. Goal: ${WIN}.`) });
      }
      upd();
    });
    upd();
  };

  // =====================================================================
  // 25. Муха на совещании — прихлопнуть 5 мух, не задев коллег
  // =====================================================================
  B[25] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.3 });
    const { g, W, H, u } = S;
    const TOTAL = 5, TMAX = 120;
    const tx = W * 0.2, tyy = H * 0.24, tw = W * 0.6, th = H * 0.52, hr = 23 * u;
    const SKIN = ['#f0c9a0', '#d9a273', '#a86f48', '#f5d6b8', '#c48a5c', '#e8b48a'];
    const HAIR = ['#3a2516', '#111', '#d9b25b', '#7a3b1e', '#9a9aa8', '#ff3bd4'];
    const SHIRT = ['#2de2e6', '#5b5bd6', '#d4ff3a', '#ff8be6', '#ffb02e', '#56607a'];
    const heads = [
      [tx + tw * 0.28, tyy - hr * 0.6], [tx + tw * 0.72, tyy - hr * 0.6], [tx + tw * 0.28, tyy + th + hr * 0.6],
      [tx + tw * 0.72, tyy + th + hr * 0.6], [tx - hr * 0.6, tyy + th / 2], [tx + tw + hr * 0.6, tyy + th / 2],
    ].map(([x, y], i) => ({ x, y, i, angry: 0, face: Math.atan2(H / 2 - y, W / 2 - x) }));
    let state = 'ready', t = 0, lives = 3, killed = 0, fly = null, respawn = 0, swats = [], splats = [], pops = [];
    const upd = () => S.hudSet(`<span>🪰 <b>${killed}/${TOTAL}</b></span><span>⏱ <b>${t.toFixed(1)}</b> ${L('с', 's')}</span><span class="bgb3-hp">${hearts(lives)}</span>`);
    const newFly = () => {
      const side = Math.floor(api.rng() * 4), m = 10;
      const x = side === 0 ? m : side === 1 ? W - m : api.rng() * W, y = side === 2 ? m : side === 3 ? H - m : api.rng() * H;
      fly = { x, y, a: Math.atan2(H / 2 - y, W / 2 - x), turn: 0, sp: (130 + killed * 28) * u, st: 'fly', ft: 1.2 + api.rng() * 1.5, lt: 0, head: null, tgt: null, scare: 0, wing: 0 };
    };
    newFly();
    const finish = won => {
      state = 'over';
      later(api, 700, () => api.end(won
        ? { score: +t.toFixed(1), won: true, lowerBetter: true, text: L(`Все ${TOTAL} мух за ${t.toFixed(1)} с. Совещание спасено!`, `All ${TOTAL} flies in ${t.toFixed(1)} s. Meeting saved!`) }
        : { score: killed, won: false, text: lives <= 0 ? L(`Коллеги обиделись. Мух прихлопнуто: ${killed} из ${TOTAL}.`, `Your coworkers are upset. Flies swatted: ${killed} of ${TOTAL}.`) : L(`Совещание закончилось. Мух: ${killed} из ${TOTAL}.`, `The meeting is over. Flies: ${killed} of ${TOTAL}.`) }));
    };
    on(api, S.cv, 'pointerdown', e => {
      if (state === 'ready') { state = 'run'; return; }
      if (state !== 'run') return;
      const p = S.pos(e); swats.push({ x: p.x, y: p.y, t: 0, r: (api.rng() - 0.5) * 0.6 });
      api.sfx.stapler?.();
      const hitHead = heads.find(h => Math.hypot(p.x - h.x, p.y - h.y) < hr * 0.95);
      const hitFly = fly && Math.hypot(p.x - fly.x, p.y - fly.y) < (fly.st === 'land' ? 34 : 28) * u;
      if (hitHead) { lives--; hitHead.angry = 1.4; api.sfx.buzzer?.(); popsAdd(pops, hitHead.x, hitHead.y - hr, L('Ай!', 'Ouch!'), '#ff3b6b'); }
      if (hitFly) {
        killed++; splats.push({ x: fly.x, y: fly.y }); popsAdd(pops, fly.x, fly.y - 16 * u, L('Хлоп!', 'Splat!')); api.sfx.stamp?.(); fly = null; respawn = 0.7;
        if (killed >= TOTAL) { upd(); return finish(true); }
      } else if (fly) { fly.scare = 0.9; if (fly.st === 'land') { fly.st = 'fly'; fly.ft = 1 + api.rng(); fly.head = null; } fly.a += Math.PI * (0.5 + api.rng()); }
      upd();
      if (lives <= 0) finish(false);
    });
    const drawHead = h => {
      const ang = h.face;
      g.save(); g.translate(h.x, h.y); g.rotate(ang);
      g.fillStyle = SHIRT[h.i]; g.beginPath(); g.ellipse(-hr * 0.7, 0, hr * 0.7, hr * 1.35, 0, 0, TAU); g.fill();
      g.fillStyle = h.angry > 0 ? '#ff6b6b' : SKIN[h.i]; g.beginPath(); g.arc(0, 0, hr * 0.78, 0, TAU); g.fill();
      g.fillStyle = HAIR[h.i]; g.beginPath(); g.arc(-hr * 0.12, 0, hr * 0.8, Math.PI * 0.58, Math.PI * 1.42); g.fill();
      g.fillStyle = '#111'; g.beginPath(); g.arc(hr * 0.36, -hr * 0.25, hr * 0.08, 0, TAU); g.arc(hr * 0.36, hr * 0.25, hr * 0.08, 0, TAU); g.fill();
      g.restore();
      if (h.angry > 0) emo(g, '💢', 18 * u, h.x + hr * 0.6, h.y - hr * 0.6);
    };
    loop(api, dt => {
      if (state === 'run') {
        t += dt; if (t >= TMAX) finish(false);
        if (!fly) { respawn -= dt; if (respawn <= 0) newFly(); }
        else {
          const f = fly; f.wing += dt * 60; f.scare = Math.max(0, f.scare - dt);
          if (f.st === 'fly') {
            f.ft -= dt;
            if (f.ft <= 0 && !f.tgt) {
              if (api.rng() < 0.4) { const h = api.rnd(heads); f.tgt = { x: h.x + (api.rng() - 0.5) * hr * 0.6, y: h.y + (api.rng() - 0.5) * hr * 0.6, h }; }
              else f.tgt = { x: tx + tw * (0.1 + api.rng() * 0.8), y: tyy + th * (0.1 + api.rng() * 0.8), h: null };
            }
            if (f.tgt) {
              const want = Math.atan2(f.tgt.y - f.y, f.tgt.x - f.x); let d = want - f.a; d = Math.atan2(Math.sin(d), Math.cos(d)); f.a += clamp(d, -6 * dt, 6 * dt);
              if (Math.hypot(f.tgt.x - f.x, f.tgt.y - f.y) < 8 * u) { f.st = 'land'; f.x = f.tgt.x; f.y = f.tgt.y; f.head = f.tgt.h; f.tgt = null; f.lt = Math.max(0.45, 1.5 - killed * 0.2) * (0.7 + api.rng() * 0.6); }
            } else { f.turn += (api.rng() - 0.5) * 22 * dt; f.turn = clamp(f.turn, -5, 5); f.a += f.turn * dt; }
            const sp = f.sp * (1 + f.scare * 1.2);
            if (f.st === 'fly') { f.x += Math.cos(f.a) * sp * dt; f.y += Math.sin(f.a) * sp * dt; }
            const m = 14 * u;
            if (f.x < m) { f.x = m; f.a = Math.PI - f.a; } if (f.x > W - m) { f.x = W - m; f.a = Math.PI - f.a; }
            if (f.y < m) { f.y = m; f.a = -f.a; } if (f.y > H - m) { f.y = H - m; f.a = -f.a; }
          } else { f.lt -= dt; if (f.lt <= 0) { f.st = 'fly'; f.ft = 0.8 + api.rng() * 1.8; f.head = null; f.a = api.rng() * TAU; } }
        }
        upd();
      }
      heads.forEach(h => { h.angry = Math.max(0, h.angry - dt); });
      // сцена сверху
      g.fillStyle = '#16162a'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.025)'; for (let y = 0; y < H; y += 12 * u) g.fillRect(0, y, W, 6 * u);
      g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 18; rr(g, tx, tyy, tw, th, 26 * u); g.fillStyle = '#6b4a2e'; g.fill(); g.restore();
      rr(g, tx + 6 * u, tyy + 6 * u, tw - 12 * u, th - 12 * u, 22 * u); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.stroke();
      // ноутбуки, кофе, бумаги
      [[0.28, 0.16], [0.72, 0.16], [0.28, 0.84], [0.72, 0.84]].forEach(([fx, fy], i) => {
        const x = tx + tw * fx, y = tyy + th * fy;
        g.fillStyle = '#9aa0b8'; rr(g, x - 16 * u, y - 10 * u, 32 * u, 20 * u, 3 * u); g.fill();
        g.fillStyle = i % 2 ? '#2de2e6' : '#ff8be6'; g.fillRect(x - 12 * u, y - 7 * u, 24 * u, 14 * u);
      });
      [[0.5, 0.3], [0.15, 0.62], [0.85, 0.4]].forEach(([fx, fy]) => { const x = tx + tw * fx, y = tyy + th * fy; g.fillStyle = '#eee'; g.beginPath(); g.arc(x, y, 7 * u, 0, TAU); g.fill(); g.fillStyle = '#5a3418'; g.beginPath(); g.arc(x, y, 5 * u, 0, TAU); g.fill(); });
      g.save(); g.translate(tx + tw * 0.5, tyy + th * 0.62); g.rotate(0.2); g.fillStyle = '#f4f2ea'; g.fillRect(-20 * u, -14 * u, 40 * u, 28 * u); g.fillStyle = '#bbb'; for (let i = 0; i < 4; i++) g.fillRect(-15 * u, -9 * u + i * 6 * u, 30 * u, 2 * u); g.restore();
      splats.forEach(s => { g.fillStyle = 'rgba(30,20,10,.55)'; g.beginPath(); g.arc(s.x, s.y, 5 * u, 0, TAU); g.fill(); });
      heads.forEach(drawHead);
      if (fly) {
        const f = fly;
        if (f.st === 'fly') { g.strokeStyle = 'rgba(125,249,255,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x - Math.cos(f.a) * 16 * u, f.y - Math.sin(f.a) * 16 * u); g.stroke(); }
        g.save(); g.translate(f.x, f.y); g.rotate(f.a);
        const wo = f.st === 'fly' ? Math.sin(f.wing) * 0.5 : 0.15;
        g.fillStyle = 'rgba(220,240,255,.7)';
        g.beginPath(); g.ellipse(-2 * u, -5 * u, 7 * u, 3.5 * u, -0.7 - wo, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(-2 * u, 5 * u, 7 * u, 3.5 * u, 0.7 + wo, 0, TAU); g.fill();
        g.fillStyle = '#0b0b0b'; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(0, 0, 7 * u, 4.5 * u, 0, 0, TAU); g.fill(); g.stroke();
        g.fillStyle = '#c0182c'; g.beginPath(); g.arc(5 * u, -2 * u, 1.6 * u, 0, TAU); g.arc(5 * u, 2 * u, 1.6 * u, 0, TAU); g.fill();
        g.restore();
      }
      for (let i = swats.length - 1; i >= 0; i--) {
        const s = swats[i]; s.t += dt; if (s.t > 0.22) { swats.splice(i, 1); continue; }
        g.save(); g.globalAlpha = 1 - s.t / 0.22; g.translate(s.x, s.y); g.rotate(s.r);
        g.fillStyle = 'rgba(212,255,58,.35)'; g.strokeStyle = '#d4ff3a'; g.lineWidth = 2; rr(g, -18 * u, -18 * u, 36 * u, 36 * u, 6 * u); g.fill(); g.stroke();
        g.lineWidth = 1; for (let j = -12; j <= 12; j += 8) { g.beginPath(); g.moveTo(j * u, -18 * u); g.lineTo(j * u, 18 * u); g.moveTo(-18 * u, j * u); g.lineTo(18 * u, j * u); g.stroke(); }
        g.lineWidth = 4; g.beginPath(); g.moveTo(0, 18 * u); g.lineTo(0, 60 * u); g.stroke(); g.restore();
      }
      popsDraw(g, pops, dt, 18 * u);
      if (state === 'ready') veil(g, W, H, L('Коснитесь, чтобы начать', 'Tap to start'), L(`Прихлопните ${TOTAL} мух. Коллеги — не мухи!`, `Swat ${TOTAL} flies. Coworkers aren’t flies!`));
    });
    upd();
  };

  // =====================================================================
  // 26. Прыжки по креслам — бесконечный подъём, ведите пальцем влево-вправо
  // =====================================================================
  B[26] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.55 });
    const { g, W, H, u } = S;
    const GR = 1700 * u, JV = 820 * u, CW = 70 * u, WIN = 80, MPX = 20 * u;
    const P = { x: W / 2, y: H * 0.8, vx: 0, vy: -JV, w: 24 * u, face: 1 };
    let state = 'ready', camY = 0, best = 0, chairs = [], topY = H * 0.8, keys = 0, drag = null, pops = [];
    const startY = P.y;
    const meters = () => Math.floor(best);
    const upd = () => S.hudSet(`<span>💺 <b>${meters()}</b> ${L('м', 'm')}</span><span>${L('Цель', 'Goal')} ${WIN} ${L('м', 'm')}</span>`);
    chairs.push({ x: W / 2, y: H * 0.8 + 2, kind: 'n', vx: 0 });
    const gen = () => {
      while (topY > camY - H * 0.6) {
        const diff = Math.min(1, best / 160);
        topY -= clamp(70 * u + diff * 75 * u + api.rng() * 40 * u, 60 * u, 175 * u);
        const r = api.rng();
        const kind = best > 8 && r < 0.07 ? 'boost' : best > 20 && r < 0.07 + 0.3 * diff ? 'roll' : 'n';
        chairs.push({ x: CW / 2 + 6 + api.rng() * (W - CW - 12), y: topY, kind, vx: kind === 'roll' ? (api.rng() < 0.5 ? -1 : 1) * (50 + 80 * diff) * u : 0 });
        if (best > 15 && api.rng() < 0.15 + 0.25 * diff) chairs.push({ x: CW / 2 + 6 + api.rng() * (W - CW - 12), y: topY + 30 * u + api.rng() * 30 * u, kind: 'broken', vx: 0 });
      }
    };
    gen();
    const press = e => { if (state === 'ready') state = 'run'; drag = { x: S.pos(e).x, id: e.pointerId }; try { S.cv.setPointerCapture(e.pointerId); } catch {} };
    on(api, S.cv, 'pointerdown', press);
    on(api, S.cv, 'pointermove', e => { if (!drag || e.pointerId !== drag.id || state !== 'run') return; const x = S.pos(e).x; const dx = x - drag.x; drag.x = x; P.x += dx * 1.25; if (dx) P.face = dx > 0 ? 1 : -1; });
    const upP = () => { drag = null; };
    on(api, S.cv, 'pointerup', upP); on(api, S.cv, 'pointercancel', upP);
    on(api, window, 'keydown', e => { if (e.key === 'ArrowLeft') keys = -1; else if (e.key === 'ArrowRight') keys = 1; else return; e.preventDefault(); if (state === 'ready') state = 'run'; });
    on(api, window, 'keyup', e => { if ((e.key === 'ArrowLeft' && keys < 0) || (e.key === 'ArrowRight' && keys > 0)) keys = 0; });
    const drawChair = (c, sy) => {
      const x = c.x, w = CW;
      const seat = c.kind === 'boost' ? '#d4ff3a' : c.kind === 'broken' ? '#6b5a50' : c.kind === 'roll' ? '#ff3bd4' : '#2de2e6';
      g.save();
      if (c.kind === 'broken') { g.translate(x, sy); g.rotate(c.fall ? c.fall * 2 : 0.08); g.translate(-x, -sy); }
      g.fillStyle = '#333350'; rr(g, x + w * 0.3, sy - 34 * u, w * 0.2, 36 * u, 5 * u); g.fill();
      g.fillStyle = seat; rr(g, x - w / 2, sy, w, 9 * u, 4 * u); g.fill();
      if (c.kind === 'broken') { g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4 * u, sy); g.lineTo(x + 2 * u, sy + 5 * u); g.lineTo(x - 2 * u, sy + 9 * u); g.stroke(); }
      g.fillStyle = '#8a8aa8'; g.fillRect(x - 2.5 * u, sy + 9 * u, 5 * u, 16 * u);
      g.fillRect(x - w * 0.36, sy + 25 * u, w * 0.72, 3.5 * u);
      g.fillStyle = '#111'; [-0.36, 0, 0.36].forEach(f => { g.beginPath(); g.arc(x + w * f, sy + 30 * u, 3.2 * u, 0, TAU); g.fill(); });
      if (c.kind === 'boost') { g.strokeStyle = '#d4ff3a'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 4; i++) { g.lineTo(x + (i % 2 ? 6 : -6) * u, sy - 3 * u - i * 3 * u); } g.stroke(); }
      g.restore();
    };
    const drawP = sy => {
      const x = P.x, y = sy, up = P.vy < 0;
      g.save(); g.translate(x, y); g.scale(P.face, 1);
      g.lineCap = 'round'; g.strokeStyle = '#2b2b45'; g.lineWidth = 5.5 * u;
      g.beginPath(); g.moveTo(-3 * u, -16 * u); g.lineTo(-5 * u, 0); g.moveTo(3 * u, -16 * u); g.lineTo(up ? 7 * u : 5 * u, up ? -3 * u : 0); g.stroke();
      g.fillStyle = '#ffb02e'; rr(g, -9 * u, -36 * u, 18 * u, 21 * u, 5 * u); g.fill();
      g.strokeStyle = '#f0c9a0'; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(-7 * u, -32 * u); g.lineTo(-13 * u, up ? -46 * u : -24 * u); g.moveTo(7 * u, -32 * u); g.lineTo(13 * u, up ? -46 * u : -24 * u); g.stroke();
      g.fillStyle = '#f0c9a0'; g.beginPath(); g.arc(0, -43 * u, 7.5 * u, 0, TAU); g.fill();
      g.fillStyle = '#7a3b1e'; g.beginPath(); g.arc(-1 * u, -45 * u, 7.6 * u, Math.PI * 1.02, TAU * 0.99); g.fill();
      g.fillStyle = '#111'; g.fillRect(3 * u, -44 * u, 2 * u, 2 * u);
      g.restore(); g.lineCap = 'butt';
    };
    loop(api, dt => {
      if (state === 'run') {
        if (keys) { P.x += keys * 330 * u * dt; P.face = keys; }
        if (P.x < -P.w) P.x += W + P.w * 2; if (P.x > W + P.w) P.x -= W + P.w * 2;
        const prev = P.y; P.vy += GR * dt; P.y += P.vy * dt;
        if (P.vy > 0) for (const c of chairs) {
          if (c.gone || prev > c.y + 2 || P.y < c.y || Math.abs(P.x - c.x) > CW / 2 + 8 * u) continue;
          if (c.kind === 'broken') { c.gone = true; c.fall = 0; api.buzz?.('danger'); popsAdd(pops, c.x, c.y - camY - 20 * u, L('хрусь!', 'crack!'), '#ff3b6b'); continue; }
          P.y = c.y; P.vy = c.kind === 'boost' ? -JV * 1.6 : -JV; tap(api);
          if (c.kind === 'boost') { api.sfx.item?.(); popsAdd(pops, c.x, c.y - camY - 20 * u, '🚀'); }
          break;
        }
        chairs.forEach(c => {
          if (c.vx) { c.x += c.vx * dt; if (c.x < CW / 2 || c.x > W - CW / 2) { c.vx = -c.vx; c.x = clamp(c.x, CW / 2, W - CW / 2); } }
          if (c.gone) { c.fall += dt; c.y += 420 * u * dt * c.fall * 3; }
        });
        if (P.y - camY < H * 0.42) camY = P.y - H * 0.42;
        best = Math.max(best, (startY - P.y) / MPX);
        chairs = chairs.filter(c => c.y - camY < H + 80 * u);
        gen();
        if (P.y - camY > H + 60 * u) {
          state = 'over'; api.sfx.stamp?.();
          later(api, 500, () => api.end({ score: meters(), won: meters() >= WIN, text: L(`Подъём: ${meters()} м. Цель — ${WIN} м.`, `Climbed ${meters()} m. Goal: ${WIN} m.`) }));
        }
        upd();
      } else if (state === 'ready') {
        const prev = P.y; P.vy += GR * dt; P.y += P.vy * dt; if (P.vy > 0 && prev <= startY && P.y >= startY) { P.y = startY; P.vy = -JV * 0.5; }
      }
      // фон: стена бизнес-центра со скроллом
      g.fillStyle = '#0f0f1e'; g.fillRect(0, 0, W, H);
      const par = camY * 0.35, wh = 120 * u;
      for (let y = -((-par) % wh) - wh; y < H + wh; y += wh) {
        for (let x = 20 * u; x < W; x += 110 * u) { g.fillStyle = 'rgba(45,226,230,.06)'; g.fillRect(x, y + 20 * u, 70 * u, 60 * u); g.strokeStyle = 'rgba(45,226,230,.12)'; g.lineWidth = 1; g.strokeRect(x, y + 20 * u, 70 * u, 60 * u); }
      }
      // отметки этажей каждые 25 м
      const fm = 25 * MPX;
      for (let n = Math.max(1, Math.floor((startY - camY - H) / fm)); n <= Math.ceil((startY - camY) / fm) + 1; n++) {
        const y = startY - n * fm - camY; if (y < -20 || y > H + 20) continue;
        g.strokeStyle = 'rgba(255,59,212,.25)'; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.setLineDash([]);
        txt(g, `${L('этаж', 'floor')} ${n + 1} · ${n * 25} ${L('м', 'm')}`, W - 8, y - 9, 11 * u, 'rgba(255,139,230,.7)', 'right', 700);
      }
      chairs.forEach(c => { const sy = c.y - camY; if (sy > -60 && sy < H + 60) drawChair(c, sy); });
      drawP(P.y - camY);
      popsDraw(g, pops, dt, 16 * u);
      if (state === 'ready') veil(g, W, H, L('Коснитесь и ведите пальцем', 'Touch and drag'), L('Влево-вправо — прыгайте по креслам выше', 'Left-right — bounce up the chairs'));
    });
    upd();
  };

  // =====================================================================
  // 27. Бумажный самолётик — тап даёт плавную подъёмную силу, летим между лампами и шкафами
  // =====================================================================
  B[27] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.3, maxH: 640 });
    const { g, W, H, u } = S;
    const k = H / 500, OW = 54 * u, WIN = 6;
    const P = { x: W * 0.27, y: H * 0.45, vy: 0, rot: 0, lift: 0 };
    let state = 'ready', cols = [], score = 0, t = 0, scroll = 0, nextX = W * 0.85, lastGap = H * 0.5, pops = [];
    const upd = () => S.hudSet(`<span>✈️ ${L('Пролётов', 'Gaps')} <b>${score}</b></span><span>${L('Цель', 'Goal')} ${WIN}</span>`);
    const flap = () => { if (state === 'over') return; if (state === 'ready') state = 'run'; P.lift = 0.15; };
    on(api, S.cv, 'pointerdown', e => { e.preventDefault(); flap(); });
    on(api, window, 'keydown', e => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); if (!e.repeat) flap(); } });
    const addCol = x => {
      const gap = Math.max(150 * k, 215 * k - score * 4 * k);
      const lo = H * 0.1 + gap / 2, hi = H * 0.92 - gap / 2;
      const y = clamp(lastGap + (api.rng() - 0.5) * H * 0.62, lo, hi); lastGap = y;
      cols.push({ x, y, gap, bot: api.rnd(['cab', 'shelf', 'boxes']), passed: false, hue: api.rng() });
    };
    const speed = () => Math.min(235 * u, 145 * u + score * 4 * u);
    const crash = () => { if (state !== 'run') return; state = 'over'; api.sfx.stamp?.(); api.buzz?.('danger'); later(api, 800, () => api.end({ score, won: score >= WIN, text: L(`Самолётик пролетел ${score} пролётов.`, `The plane cleared ${score} gaps.`) })); };
    const drawCol = c => {
      const x0 = c.x - OW / 2, top = c.y - c.gap / 2, bot = c.y + c.gap / 2;
      // световой конус
      const lg = g.createLinearGradient(0, top, 0, bot); lg.addColorStop(0, 'rgba(255,230,150,.22)'); lg.addColorStop(1, 'rgba(255,230,150,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(x0 + 4 * u, top); g.lineTo(x0 + OW - 4 * u, top); g.lineTo(x0 + OW + 18 * u, bot); g.lineTo(x0 - 18 * u, bot); g.closePath(); g.fill();
      // короб вентиляции и плафон
      g.fillStyle = '#3a3f58'; g.fillRect(x0 + OW * 0.2, 0, OW * 0.6, top - 24 * k);
      g.fillStyle = 'rgba(255,255,255,.07)'; for (let y = 10; y < top - 30 * k; y += 22 * k) g.fillRect(x0 + OW * 0.2, y, OW * 0.6, 3);
      g.fillStyle = '#2de2e6'; g.beginPath(); g.moveTo(x0 + OW * 0.2, top - 24 * k); g.lineTo(x0 + OW * 0.8, top - 24 * k); g.lineTo(x0 + OW, top); g.lineTo(x0, top); g.closePath(); g.fill();
      g.fillStyle = '#fff6c8'; g.beginPath(); g.ellipse(c.x, top, OW * 0.32, 4 * k, 0, 0, TAU); g.fill();
      // снизу: шкаф / стеллаж / коробки
      const hgt = H - bot;
      if (c.bot === 'cab') {
        g.fillStyle = '#56607a'; rr(g, x0, bot, OW, hgt + 10, 4 * u); g.fill();
        for (let y = bot + 6 * k; y < H; y += 38 * k) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.strokeRect(x0 + 4 * u, y, OW - 8 * u, 32 * k); g.fillStyle = '#c9cede'; g.fillRect(c.x - 6 * u, y + 6 * k, 12 * u, 3 * k); }
      } else if (c.bot === 'shelf') {
        g.fillStyle = '#4a3423'; g.fillRect(x0, bot, OW, hgt + 10);
        const cl = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ffb02e', '#5b5bd6'];
        for (let y = bot + 4 * k, r = 0; y < H; y += 34 * k, r++) for (let i = 0; i < 5; i++) { g.fillStyle = cl[(i + r + Math.floor(c.hue * 5)) % 5]; g.fillRect(x0 + 4 * u + i * (OW - 8 * u) / 5, y, (OW - 8 * u) / 5 - 2, 28 * k); }
      } else {
        for (let y = bot, i = 0; y < H; y += 30 * k, i++) { g.fillStyle = i % 2 ? '#b97c40' : '#c98d4e'; g.fillRect(x0 + (i % 2) * 3 * u, y, OW - 3 * u, 29 * k); g.fillStyle = 'rgba(45,226,230,.7)'; g.fillRect(x0 + OW / 2 - 3 * u, y, 6 * u, 29 * k); }
      }
    };
    const hits = c => {
      const x0 = c.x - OW / 2, top = c.y - c.gap / 2, bot = c.y + c.gap / 2;
      const pts = [[14, 0], [-12, -6], [-12, 5], [0, 0]].map(([a, b]) => [P.x + (a * Math.cos(P.rot) - b * Math.sin(P.rot)) * u, P.y + (a * Math.sin(P.rot) + b * Math.cos(P.rot)) * u]);
      return pts.some(([x, y]) => x > x0 + 2 && x < x0 + OW - 2 && (y < top - 2 || y > bot + 2));
    };
    loop(api, dt => {
      if (state === 'run') {
        t += dt; const sp = speed(); scroll += sp * dt;
        if (P.lift > 0) { P.vy -= 2300 * k * dt; P.lift -= dt; }
        P.vy += 820 * k * dt; P.vy -= P.vy * 1.1 * dt; P.vy = clamp(P.vy, -320 * k, 480 * k);
        P.y += P.vy * dt;
        cols.forEach(c => { c.x -= sp * dt; });
        nextX -= sp * dt; if (nextX <= W + OW) { addCol(nextX + OW); nextX += Math.max(W * 0.58, 205 * u); }
        cols = cols.filter(c => c.x > -OW);
        for (const c of cols) {
          if (!c.passed && c.x + OW / 2 < P.x - 12 * u) { c.passed = true; score++; api.sfx.sms?.(); popsAdd(pops, P.x, P.y - 24 * u, '+1'); upd(); }
          if (Math.abs(c.x - P.x) < OW && hits(c)) crash();
        }
        if (P.y < 8 * u || P.y > H - 8 * u) crash();
      } else if (state === 'ready') { t += dt; P.y = H * 0.45 + Math.sin(t * 3) * 8 * k; }
      else if (state === 'over' && P.y < H - 10 * u) { P.vy += 900 * k * dt; P.y = Math.min(H - 10 * u, P.y + P.vy * dt); }
      P.rot = lerp(P.rot, clamp(P.vy / (700 * k), -0.45, 0.7), Math.min(1, dt * 10));
      // фон: ночной опенспейс с окнами
      g.fillStyle = '#0c0c1a'; g.fillRect(0, 0, W, H);
      const sx = (scroll * 0.25) % (140 * u);
      for (let x = -sx; x < W + 140 * u; x += 140 * u) {
        g.fillStyle = 'rgba(91,91,214,.12)'; g.fillRect(x + 20 * u, H * 0.25, 100 * u, H * 0.45);
        g.fillStyle = 'rgba(255,211,77,.18)'; for (let i = 0; i < 6; i++) g.fillRect(x + 28 * u + (i % 3) * 30 * u, H * 0.5 + Math.floor(i / 3) * 20 * k - ((i * 37) % 50) * k, 10 * u, 60 * k);
      }
      g.fillStyle = '#16162a'; g.fillRect(0, H - 6 * u, W, 6 * u); g.fillRect(0, 0, W, 4 * u);
      cols.forEach(drawCol);
      // самолётик
      g.save(); g.translate(P.x, P.y); g.rotate(P.rot); g.scale(u, u);
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(16, 0); g.lineTo(-13, -8); g.lineTo(-7, 0); g.closePath(); g.fill();
      g.fillStyle = '#c9d4ff'; g.beginPath(); g.moveTo(16, 0); g.lineTo(-7, 0); g.lineTo(-13, 7); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(45,226,230,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, 2.5); g.stroke();
      g.restore();
      popsDraw(g, pops, dt, 18 * u);
      if (state === 'ready') veil(g, W, H, L('Тап — подъём', 'Tap to lift'), L('Пролетайте между лампами и шкафами', 'Fly between the lamps and cabinets'));
    });
    upd();
  };

  // =====================================================================
  // 28. Баскетбол в мусорку — смахните бумажку к корзине, кондиционер сносит
  // =====================================================================
  B[28] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.15, minH: 320, maxH: 560 });
    const { g, W, H } = S;
    const s = Math.min(W / 360, H / 420), THROWS = 10, WIN = 4;
    const floor = H - 30 * s, R = 10 * s, BW = 52 * s, BH = 66 * s, G = 1100 * s;
    const home = { x: W * 0.13, y: floor - 104 * s };
    let state = 'aim', n = 0, hits = 0, wind = 0, binX = W * 0.7, ball = { x: home.x, y: home.y, vx: 0, vy: 0, rot: 0 }, fly = 0, aim = null, res = [], pops = [], flow = [];
    const newRound = () => {
      wind = Math.round((api.rng() * 2 - 1) * Math.min(3, 1 + n * 0.4));
      binX = W * (0.52 + api.rng() * 0.34);
      ball = { x: home.x, y: home.y, vx: 0, vy: 0, rot: 0 }; state = 'aim'; fly = 0;
    };
    newRound();
    for (let i = 0; i < 14; i++) flow.push({ x: api.rng() * W, y: 70 * s + api.rng() * (floor - 120 * s), l: 20 + api.rng() * 30 });
    const upd = () => S.hudSet(`<span>🗑️ ${L('Попаданий', 'Hits')} <b>${hits}</b></span><span style="font-size:15px;letter-spacing:1px">${res.map(r => r ? '<span class="bgb3-ok">●</span>' : '<span style="color:var(--down)">○</span>').join('')}<span style="opacity:.3">${'○'.repeat(THROWS - res.length)}</span></span>`);
    const walls = () => {
      const l = binX - BW / 2, r = binX + BW / 2, tp = floor - BH, inset = 6 * s;
      return [[l, tp, l + inset, floor], [r, tp, r - inset, floor]];
    };
    on(api, S.cv, 'pointerdown', e => { if (state !== 'aim') return; const p = S.pos(e); aim = { x0: p.x, y0: p.y, x: p.x, y: p.y, id: e.pointerId }; try { S.cv.setPointerCapture(e.pointerId); } catch {} });
    on(api, S.cv, 'pointermove', e => { if (!aim || e.pointerId !== aim.id) return; const p = S.pos(e); aim.x = p.x; aim.y = p.y; });
    const vel = a => { let vx = (a.x - a.x0) * 5.2, vy = (a.y - a.y0) * 5.2; const m = Math.hypot(vx, vy), mx = 980 * s; if (m > mx) { vx *= mx / m; vy *= mx / m; } return [vx, vy]; };
    on(api, S.cv, 'pointerup', e => {
      if (!aim || e.pointerId !== aim.id) return; const a = aim; aim = null;
      if (state !== 'aim' || Math.hypot(a.x - a.x0, a.y - a.y0) < 18 || a.y > a.y0 + 10) return;
      const [vx, vy] = vel(a); ball.vx = vx; ball.vy = vy; state = 'fly'; fly = 0; tap(api);
    });
    on(api, S.cv, 'pointercancel', () => { aim = null; });
    const done = hit => {
      if (state !== 'fly') return; state = 'wait'; res.push(hit); n++;
      if (hit) { hits++; api.sfx.item?.(); popsAdd(pops, binX, floor - BH - 20 * s, L('Есть!', 'Score!')); } else popsAdd(pops, ball.x, ball.y - 20 * s, L('мимо', 'miss'), '#ff3b6b');
      upd();
      later(api, 750, () => {
        if (n >= THROWS) { state = 'over'; api.end({ score: hits, won: hits >= WIN, text: L(`Попаданий: ${hits} из ${THROWS}. Цель — ${WIN}.`, `Hits: ${hits} of ${THROWS}. Goal: ${WIN}.`) }); }
        else newRound();
      });
    };
    loop(api, dt => {
      if (state === 'fly') {
        fly += dt;
        const steps = 3, h = dt / steps;
        for (let i = 0; i < steps && state === 'fly'; i++) {
          ball.vy += G * h; if (ball.y < floor - R - 1) ball.vx += wind * 95 * s * h;
          ball.x += ball.vx * h; ball.y += ball.vy * h; ball.rot += ball.vx * h * 0.05;
          for (const [x1, y1, x2, y2] of walls()) {
            const dx = x2 - x1, dy = y2 - y1, tt = clamp(((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy), 0, 1);
            const cx = x1 + dx * tt, cy = y1 + dy * tt, ox = ball.x - cx, oy = ball.y - cy, d = Math.hypot(ox, oy);
            if (d < R && d > 0) { const nx = ox / d, ny = oy / d; ball.x = cx + nx * R; ball.y = cy + ny * R; const vn = ball.vx * nx + ball.vy * ny; if (vn < 0) { ball.vx -= 1.5 * vn * nx; ball.vy -= 1.5 * vn * ny; ball.vx *= 0.8; ball.vy *= 0.8; } }
          }
          const l = binX - BW / 2 + 6 * s, r = binX + BW / 2 - 6 * s;
          if (ball.x > l && ball.x < r && ball.y > floor - BH + R * 1.2 && ball.vy > 0) { done(true); break; }
          if (ball.y > floor - R) { ball.y = floor - R; ball.vy = -ball.vy * 0.35; ball.vx *= 0.7; if (Math.abs(ball.vy) < 60 * s) ball.vy = 0; }
          if (ball.x < R) { ball.x = R; ball.vx = -ball.vx * 0.5; }
          if (ball.x > W - R) { ball.x = W - R; ball.vx = -ball.vx * 0.5; }
          if (ball.y < -200 * s) ball.vy = Math.max(ball.vy, 0);
        }
        if (state === 'fly' && (fly > 4 || (ball.vy === 0 && Math.abs(ball.vx) < 20 * s && ball.y >= floor - R - 1))) done(false);
      }
      // комната
      g.fillStyle = '#121224'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#1b1b30'; g.fillRect(0, floor, W, H - floor); g.fillStyle = 'rgba(45,226,230,.5)'; g.fillRect(0, floor, W, 2);
      // кондиционер
      const ax = W * 0.5 - 52 * s, ay = 12 * s;
      rr(g, ax, ay, 104 * s, 34 * s, 8 * s); g.fillStyle = '#e8ebf4'; g.fill();
      g.fillStyle = '#9aa0b8'; for (let i = 0; i < 3; i++) g.fillRect(ax + 10 * s, ay + 20 * s + i * 4 * s, 84 * s, 1.5 * s);
      g.fillStyle = wind ? '#2de2e6' : '#d4ff3a'; g.beginPath(); g.arc(ax + 94 * s, ay + 9 * s, 2.5 * s, 0, TAU); g.fill();
      const wy = ay + 52 * s;
      if (wind) {
        const dir = Math.sign(wind), len = (26 + Math.abs(wind) * 14) * s;
        g.strokeStyle = '#7df9ff'; g.fillStyle = '#7df9ff'; g.lineWidth = 4 * s;
        g.beginPath(); g.moveTo(W / 2 - dir * len / 2, wy); g.lineTo(W / 2 + dir * len / 2, wy); g.stroke();
        g.beginPath(); g.moveTo(W / 2 + dir * (len / 2 + 9 * s), wy); g.lineTo(W / 2 + dir * len / 2 - dir * 2 * s, wy - 7 * s); g.lineTo(W / 2 + dir * len / 2 - dir * 2 * s, wy + 7 * s); g.closePath(); g.fill();
        txt(g, `${L('ветер', 'wind')} ${Math.abs(wind)}`, W / 2, wy + 16 * s, 12 * s, '#7df9ff', 'center', 800);
        g.strokeStyle = 'rgba(125,249,255,.13)'; g.lineWidth = 2;
        flow.forEach(f => { f.x += wind * 60 * s * dt; if (f.x > W + 40) f.x = -40; if (f.x < -40) f.x = W + 40; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x - Math.sign(wind) * f.l * s, f.y); g.stroke(); });
      } else txt(g, L('штиль', 'calm'), W / 2, wy, 12 * s, '#d4ff3a', 'center', 800);
      // стол игрока
      g.fillStyle = '#4a3423'; g.fillRect(0, home.y + R, home.x + 40 * s, 8 * s); g.fillStyle = '#3a2a1c'; g.fillRect(8 * s, home.y + R + 8 * s, 6 * s, floor - home.y - R - 8 * s); g.fillRect(home.x + 26 * s, home.y + R + 8 * s, 6 * s, floor - home.y - R - 8 * s);
      // корзина
      const l = binX - BW / 2, r = binX + BW / 2, tp = floor - BH;
      g.fillStyle = '#2a2a44'; g.beginPath(); g.moveTo(l, tp); g.lineTo(r, tp); g.lineTo(r - 6 * s, floor); g.lineTo(l + 6 * s, floor); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,59,212,.55)'; g.lineWidth = 1.2; for (let i = 1; i < 6; i++) { const f = i / 6; g.beginPath(); g.moveTo(l + BW * f, tp); g.lineTo(l + 6 * s + (BW - 12 * s) * f, floor); g.stroke(); }
      g.strokeStyle = '#ff3bd4'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(l - 1, tp); g.lineTo(r + 1, tp); g.stroke();
      // бумажный шарик
      if (state !== 'wait' || !res[res.length - 1]) {
        g.save(); g.translate(ball.x, ball.y); g.rotate(ball.rot);
        g.fillStyle = '#f4f2ea'; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, rr2 = R * (i % 2 ? 0.82 : 1.05); g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fill();
        g.strokeStyle = '#a9a9b8'; g.lineWidth = 1; g.beginPath(); g.moveTo(-R * 0.5, -R * 0.2); g.lineTo(R * 0.3, R * 0.1); g.lineTo(R * 0.1, R * 0.6); g.stroke();
        g.restore();
      }
      if (aim && state === 'aim') {
        const [vx, vy] = vel(aim), pw = Math.hypot(vx, vy) / (980 * s);
        g.strokeStyle = `rgba(212,255,58,${0.4 + pw * 0.5})`; g.setLineDash([5, 6]); g.lineWidth = 3;
        g.beginPath(); g.moveTo(ball.x, ball.y); g.lineTo(ball.x + vx * 0.09, ball.y + vy * 0.09); g.stroke(); g.setLineDash([]);
      }
      popsDraw(g, pops, dt, 18 * s);
      if (state === 'aim' && n === 0 && !aim) txt(g, L('Смахните вверх-вправо, чтобы бросить', 'Swipe up and right to throw'), W / 2, H * 0.42, 14 * s, '#c9c6e0', 'center', 700);
    });
    upd();
  };

  // =====================================================================
  // 29. Офисный боулинг — бутылка катится по дорожке на 10 стаканчиков, 3 фрейма
  // =====================================================================
  B[29] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.6, minH: 420 });
    const { g, W, H } = S;
    const lx0 = W * 0.16, lx1 = W * 0.84, LW = lx1 - lx0, cx = W / 2, s = LW / 240;
    const RP = 9 * s, RB = 14 * s, laneTop = H * 0.05, startY = H - 46 * s, foul = H * 0.7, FRAMES = 3, WIN = 18;
    const headY = H * 0.3, DX = 27 * s, DY = 24 * s;
    let pins = [], ball, state = 'aim', frame = 1, roll = 1, total = 0, frameDown = 0, rollT = 0, settle = 0, aim = null, pops = [], log = [];
    const rack = () => { pins = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) pins.push({ x: cx + (i - r / 2) * DX, y: headY - r * DY, vx: 0, vy: 0, ox: 0, oy: 0, down: false, gone: false, a: 0 }); pins.forEach(p => { p.ox = p.x; p.oy = p.y; }); };
    const newBall = () => { ball = { x: cx, y: startY, vx: 0, vy: 0, gutter: false, gone: false, a: 0 }; };
    rack(); newBall();
    const standing = () => pins.filter(p => !p.down).length;
    const upd = () => S.hudSet(`<span>🎳 ${L('Фрейм', 'Frame')} <b>${Math.min(frame, FRAMES)}/${FRAMES}</b> · ${L('бросок', 'roll')} <b>${roll}</b></span><span>${L('Сбито', 'Pins')} <b>${total}</b></span>`);
    on(api, S.cv, 'pointerdown', e => {
      if (state !== 'aim') return; const p = S.pos(e);
      aim = { id: e.pointerId, pts: [{ x: p.x, y: p.y, t: performance.now() }] };
      ball.x = clamp(p.x, lx0 + RB, lx1 - RB);
      try { S.cv.setPointerCapture(e.pointerId); } catch {}
    });
    on(api, S.cv, 'pointermove', e => {
      if (!aim || e.pointerId !== aim.id) return; const p = S.pos(e);
      aim.pts.push({ x: p.x, y: p.y, t: performance.now() }); if (aim.pts.length > 30) aim.pts.shift();
      if (p.y > foul) ball.x = clamp(p.x, lx0 + RB, lx1 - RB);
    });
    on(api, S.cv, 'pointerup', e => {
      if (!aim || e.pointerId !== aim.id) return; const a = aim; aim = null;
      const now = performance.now(), last = a.pts[a.pts.length - 1];
      let first = a.pts[0]; for (const q of a.pts) if (now - q.t < 140) { first = q; break; }
      const dt = Math.max(0.03, (last.t - first.t) / 1000), dx = last.x - first.x, dy = last.y - first.y;
      if (dy > -25 * s) return;
      let vx = dx / dt, vy = dy / dt; const m = Math.hypot(vx, vy), lo = 380 * s, hi = 1250 * s, k2 = clamp(m, lo, hi) / m; vx *= k2; vy *= k2;
      ball.vx = vx; ball.vy = vy; state = 'roll'; rollT = 0; settle = 0; tap(api);
    });
    on(api, S.cv, 'pointercancel', () => { aim = null; });
    const collide = (a, b, ra, rb, ma, mb) => {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), md = ra + rb;
      if (d >= md || d === 0) return false;
      const nx = dx / d, ny = dy / d, ov = md - d, tm = ma + mb;
      a.x -= nx * ov * mb / tm; a.y -= ny * ov * mb / tm; b.x += nx * ov * ma / tm; b.y += ny * ov * ma / tm;
      const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rel > 0) return true;
      const j = -(1 + 0.85) * rel / (1 / ma + 1 / mb);
      a.vx -= j / ma * nx; a.vy -= j / ma * ny; b.vx += j / mb * nx; b.vy += j / mb * ny;
      return true;
    };
    const endRoll = () => {
      state = 'count';
      const down = pins.filter(p => p.down && !p.counted); down.forEach(p => { p.counted = true; });
      const cnt = down.length; total += cnt; frameDown += cnt;
      const strike = roll === 1 && frameDown === 10, spare = roll === 2 && frameDown === 10;
      popsAdd(pops, cx, H * 0.45, strike ? L('СТРАЙК!', 'STRIKE!') : spare ? L('Спэр!', 'Spare!') : cnt ? `−${cnt} 🥤` : L('мимо', 'miss'), strike || spare ? '#d4ff3a' : cnt ? '#7df9ff' : '#ff3b6b');
      if (strike || spare) api.sfx.coins?.(); else if (cnt) api.sfx.item?.();
      upd();
      later(api, 1000, () => {
        if (roll === 1 && !strike) { roll = 2; pins = pins.filter(p => !p.down); pins.forEach(p => { p.vx = p.vy = 0; }); newBall(); state = 'aim'; }
        else {
          log.push(frameDown); frame++; roll = 1; frameDown = 0;
          if (frame > FRAMES) { state = 'over'; api.end({ score: total, won: total >= WIN, text: L(`Сбито стаканчиков: ${total} из ${FRAMES * 10} (${log.join(' · ')}).`, `Cups knocked: ${total} of ${FRAMES * 10} (${log.join(' · ')}).`) }); return; }
          rack(); newBall(); state = 'aim';
        }
        upd();
      });
    };
    loop(api, dt => {
      if (state === 'roll') {
        rollT += dt; const N = 5, h = dt / N;
        for (let st = 0; st < N; st++) {
          if (!ball.gone) {
            ball.x += ball.vx * h; ball.y += ball.vy * h; ball.a += Math.hypot(ball.vx, ball.vy) * h * 0.04;
            const f = Math.exp(-0.12 * h); ball.vx *= f; ball.vy *= f;
            if (!ball.gutter && (ball.x < lx0 + RB * 0.3 || ball.x > lx1 - RB * 0.3)) { ball.gutter = true; ball.x = ball.x < cx ? lx0 - 9 * s : lx1 + 9 * s; ball.vx = 0; ball.vy = Math.min(ball.vy, -300 * s); api.buzz?.('danger'); }
            if (ball.y < laneTop - RB) ball.gone = true;
          }
          pins.forEach(p => {
            if (p.gone) return;
            p.x += p.vx * h; p.y += p.vy * h;
            const f = Math.exp(-2.2 * h); p.vx *= f; p.vy *= f;
            if (!p.down && (Math.hypot(p.vx, p.vy) > 40 * s || Math.hypot(p.x - p.ox, p.y - p.oy) > RP * 0.5)) { p.down = true; p.a = Math.atan2(p.vy, p.vx); }
            if (p.x < lx0 || p.x > lx1 || p.y < laneTop) { p.down = true; p.gone = true; }
          });
          if (!ball.gone && !ball.gutter) pins.forEach(p => { if (!p.gone && collide(ball, p, RB, RP, 4, 1)) { if (!p.down) { p.down = true; p.a = Math.atan2(p.vy, p.vx); } } });
          for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) if (!pins[i].gone && !pins[j].gone) collide(pins[i], pins[j], RP, RP, 1, 1);
        }
        const moving = pins.some(p => !p.gone && Math.hypot(p.vx, p.vy) > 6 * s);
        const ballDone = ball.gone || Math.hypot(ball.vx, ball.vy) < 15 * s;
        if (ballDone && !moving) settle += dt; else settle = 0;
        if (settle > 0.35 || rollT > 7) endRoll();
      }
      // дорожка
      g.fillStyle = '#0d0d1a'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#1f1a2c'; g.fillRect(lx0 - 20 * s, 0, LW + 40 * s, H);
      g.fillStyle = '#121220'; g.fillRect(lx0 - 18 * s, 0, 16 * s, H); g.fillRect(lx1 + 2 * s, 0, 16 * s, H);
      const lg = g.createLinearGradient(lx0, 0, lx1, 0); lg.addColorStop(0, '#9a6a3c'); lg.addColorStop(0.5, '#c08850'); lg.addColorStop(1, '#9a6a3c');
      g.fillStyle = lg; g.fillRect(lx0, laneTop, LW, H - laneTop);
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; for (let x = lx0 + LW / 12; x < lx1; x += LW / 12) { g.beginPath(); g.moveTo(x, laneTop); g.lineTo(x, H); g.stroke(); }
      g.fillStyle = '#05050b'; g.fillRect(lx0 - 20 * s, 0, LW + 40 * s, laneTop);
      g.fillStyle = 'rgba(255,59,212,.8)'; g.fillRect(lx0, foul, LW, 2);
      g.fillStyle = 'rgba(45,226,230,.8)'; [-2, -1, 0, 1, 2].forEach(i => { g.beginPath(); g.moveTo(cx + i * LW / 7, H * 0.55); g.lineTo(cx + i * LW / 7 - 5 * s, H * 0.55 + 10 * s); g.lineTo(cx + i * LW / 7 + 5 * s, H * 0.55 + 10 * s); g.closePath(); g.fill(); });
      // стаканчики
      pins.forEach(p => {
        if (p.gone && state !== 'roll') return;
        g.save(); g.translate(p.x, p.y);
        if (p.down) { g.rotate(p.a); g.fillStyle = 'rgba(240,240,250,.85)'; g.beginPath(); g.moveTo(-RP * 1.1, -RP * 0.7); g.lineTo(RP * 1.1, -RP * 0.45); g.lineTo(RP * 1.1, RP * 0.45); g.lineTo(-RP * 1.1, RP * 0.7); g.closePath(); g.fill(); g.fillStyle = '#ff3bd4'; g.fillRect(-RP * 0.2, -RP * 0.6, RP * 0.4, RP * 1.2); }
        else { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(2 * s, 2 * s, RP, 0, TAU); g.fill(); g.fillStyle = '#f4f4fb'; g.beginPath(); g.arc(0, 0, RP, 0, TAU); g.fill(); g.fillStyle = '#cfd0dd'; g.beginPath(); g.arc(0, 0, RP * 0.72, 0, TAU); g.fill(); g.strokeStyle = '#ff3bd4'; g.lineWidth = 1.5 * s; g.beginPath(); g.arc(0, 0, RP * 0.86, 0, TAU); g.stroke(); }
        g.restore();
      });
      // бутылка (лежит поперёк хода и катится)
      if (!ball.gone) {
        const dir = Math.hypot(ball.vx, ball.vy) > 1 ? Math.atan2(ball.vy, ball.vx) + Math.PI / 2 : 0;
        g.save(); g.translate(ball.x, ball.y); g.rotate(dir);
        g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, -RB + 2 * s, -RB * 0.55 + 3 * s, RB * 2, RB * 1.1, RB * 0.5); g.fill();
        rr(g, -RB, -RB * 0.55, RB * 1.75, RB * 1.1, RB * 0.5); g.fillStyle = 'rgba(125,249,255,.75)'; g.fill();
        g.fillStyle = '#2de2e6'; g.fillRect(-RB * 0.35, -RB * 0.55, RB * 0.55, RB * 1.1);
        g.fillStyle = '#5b5bd6'; rr(g, RB * 0.72, -RB * 0.28, RB * 0.32, RB * 0.56, 2 * s); g.fill();
        const sh = (ball.a % 1) * RB * 1.1 - RB * 0.55; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-RB * 0.9, sh, RB * 1.5, 1.5 * s);
        g.restore();
      }
      if (aim && aim.pts.length > 1) {
        const a0 = aim.pts[0], a1 = aim.pts[aim.pts.length - 1];
        g.strokeStyle = 'rgba(212,255,58,.6)'; g.lineWidth = 3; g.setLineDash([5, 6]); g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke(); g.setLineDash([]);
      }
      popsDraw(g, pops, dt, 24 * s);
      if (state === 'aim' && !aim && frame === 1 && roll === 1) txt(g, L('Смахните бутылку вверх', 'Swipe the bottle up'), cx, H * 0.62, 14 * s, '#f2f0ff', 'center', 800);
    });
    upd();
  };

  // =====================================================================
  // 30. Ровно в 18:00 — время летит, остановите как можно ближе к 18:00; 5 раундов
  // =====================================================================
  B[30] = (root, api) => {
    const { L } = api;
    const S = stage(root, api, { ratio: 1.05, minH: 320, maxH: 540, below: 110 });
    const { g, W, H } = S;
    const ROUNDS = 5, WIN = 200, SPEEDS = [45, 62, 82, 106, 135], T0 = 16 * 60, SPAN = 240, TARGET = 18 * 60;
    const btn = el('button', 'bgb3-btn', '⏹ ' + L('Стоп!', 'Stop!')); btn.type = 'button'; btn.style.minWidth = '60%'; btn.style.fontSize = '18px';
    const logEl = el('div', 'bg30-log'); root.append(btn, logEl);
    let state = 'ready', round = 0, tm = T0, dir = 1, total = 0, show = 0, lastErr = 0, lastPts = 0;
    const upd = () => S.hudSet(`<span>⏱ ${L('Раунд', 'Round')} <b>${Math.min(round + 1, ROUNDS)}/${ROUNDS}</b></span><span>${L('Очки', 'Score')} <b>${total}</b></span>`);
    const fmt = m => { const mm = ((Math.floor(m) % 1440) + 1440) % 1440; return `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`; };
    const startRound = () => { tm = T0 + api.rng() * SPAN * 0.35 + (api.rng() < 0.5 ? 0 : SPAN * 0.6); dir = 1; state = 'run'; btn.disabled = false; btn.textContent = '⏹ ' + L('Стоп!', 'Stop!'); upd(); };
    const stop = () => {
      if (state === 'ready') { startRound(); return; }
      if (state !== 'run') return;
      state = 'shown'; show = 0; btn.disabled = true;
      const err = Math.abs(tm - TARGET); lastErr = err;
      lastPts = err < 0.5 ? 120 : Math.max(0, Math.round(100 - err * 4));
      total += lastPts; round++;
      const sp = el('span', lastPts >= 80 ? 'bgb3-ok' : '', `${fmt(tm)} · +${lastPts}`); logEl.append(sp);
      if (lastPts >= 100) api.sfx.coins?.(); else if (lastPts >= 60) api.sfx.item?.(); else api.sfx.stamp?.();
      upd();
      later(api, 1400, () => {
        if (round >= ROUNDS) { state = 'over'; api.end({ score: total, won: total >= WIN, text: L(`Сумма за ${ROUNDS} раундов: ${total}. Цель — ${WIN}.`, `Total over ${ROUNDS} rounds: ${total}. Goal: ${WIN}.`) }); }
        else startRound();
      });
    };
    btn.textContent = '▶ ' + L('Старт', 'Start');
    btn.onclick = stop;
    on(api, S.cv, 'pointerdown', e => { e.preventDefault(); stop(); });
    on(api, window, 'keydown', e => { if (e.code === 'Space' || e.key === 'Enter') { if (e.target === btn) return; e.preventDefault(); if (!e.repeat) stop(); } });
    loop(api, dt => {
      if (state === 'run') { tm += dir * SPEEDS[round] * dt; if (tm > T0 + SPAN) tm -= SPAN; }
      if (state === 'shown') show += dt;
      g.fillStyle = '#0d0d1a'; g.fillRect(0, 0, W, H);
      // часы
      const R = Math.max(40, Math.min(W * 0.3, (H - 148) / 2)), ccx = W / 2, ccy = R + 16;
      g.save(); g.shadowColor = 'rgba(45,226,230,.5)'; g.shadowBlur = 20; g.fillStyle = '#f2f0ff'; g.beginPath(); g.arc(ccx, ccy, R, 0, TAU); g.fill(); g.restore();
      g.strokeStyle = '#2a2a44'; g.lineWidth = R * 0.06; g.beginPath(); g.arc(ccx, ccy, R, 0, TAU); g.stroke();
      for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, l = i % 5 ? 0.06 : 0.13; g.strokeStyle = '#2a2a44'; g.lineWidth = i % 5 ? 1 : 3; g.beginPath(); g.moveTo(ccx + Math.sin(a) * R * 0.92, ccy - Math.cos(a) * R * 0.92); g.lineTo(ccx + Math.sin(a) * R * (0.92 - l), ccy - Math.cos(a) * R * (0.92 - l)); g.stroke(); }
      txt(g, '6', ccx, ccy + R * 0.64, R * 0.2, '#ff3bd4', 'center', 900); txt(g, '12', ccx, ccy - R * 0.64, R * 0.17, '#2a2a44', 'center', 900);
      const hm = tm % 720, ha = hm / 720 * TAU, ma = (tm % 60) / 60 * TAU;
      g.lineCap = 'round';
      g.strokeStyle = '#1d1a2e'; g.lineWidth = R * 0.07; g.beginPath(); g.moveTo(ccx, ccy); g.lineTo(ccx + Math.sin(ha) * R * 0.5, ccy - Math.cos(ha) * R * 0.5); g.stroke();
      g.strokeStyle = '#ff3bd4'; g.lineWidth = R * 0.04; g.beginPath(); g.moveTo(ccx, ccy); g.lineTo(ccx + Math.sin(ma) * R * 0.8, ccy - Math.cos(ma) * R * 0.8); g.stroke();
      g.lineCap = 'butt'; g.fillStyle = '#1d1a2e'; g.beginPath(); g.arc(ccx, ccy, R * 0.06, 0, TAU); g.fill();
      // цифры
      const dy = ccy + R + 30;
      txt(g, fmt(tm), W / 2, dy, Math.min(40, W / 9), state === 'shown' ? (lastPts >= 80 ? '#d4ff3a' : lastPts >= 40 ? '#7df9ff' : '#ff3b6b') : '#f2f0ff', 'center', 900);
      // полоса 16:00–20:00
      const bx = 20, bw = W - 40, by = Math.min(H - 30, dy + 64), bxOf = m => bx + (m - T0) / SPAN * bw;
      rr(g, bx, by - 8, bw, 16, 8); g.fillStyle = '#1f1f36'; g.fill();
      const tx = bxOf(TARGET); g.fillStyle = 'rgba(212,255,58,.25)'; g.fillRect(tx - bw * 25 / SPAN / 2 * 2, by - 8, bw * 50 / SPAN, 16);
      g.fillStyle = '#d4ff3a'; g.fillRect(tx - 1.5, by - 14, 3, 28);
      for (let hh = 16; hh <= 20; hh++) { const x = bxOf(hh * 60); txt(g, `${hh}:00`, x, by + 22, 11, hh === 18 ? '#d4ff3a' : '#9b98b8', 'center', 700); }
      const mx = bxOf(tm); g.fillStyle = '#ff3bd4'; g.beginPath(); g.moveTo(mx, by + 6); g.lineTo(mx - 7, by - 12); g.lineTo(mx + 7, by - 12); g.closePath(); g.fill();
      if (state === 'shown') {
        const m = Math.floor(lastErr), sec = Math.round((lastErr - m) * 60);
        const msg = lastPts === 120 ? L('Ровно! Домой!', 'Spot on! Home time!') : `${L('промах', 'off by')} ${m} ${L('мин', 'min')} ${sec} ${L('с', 's')} · +${lastPts}`;
        txt(g, msg, W / 2, dy + 32, 14, '#c9c6e0', 'center', 800);
      }
      if (state === 'ready') veil(g, W, H, L('Коснитесь, чтобы начать', 'Tap to start'), L('Остановите время ровно на 18:00', 'Stop the time exactly at 18:00'));
    });
    upd();
  };
})();
