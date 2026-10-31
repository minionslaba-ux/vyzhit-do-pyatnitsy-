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
.bgb3-hud{display:flex;justify-content:space-between;align-items:center;gap:6px;width:100%;min-height:39px;padding:0 2px 8px;font-weight:800;font-size:13px;color:var(--text);font-variant-numeric:tabular-nums;box-sizing:border-box}
.bgb3-hud>span{white-space:nowrap}
.bgb3-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 11px 5px 8px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 4px 12px rgba(0,0,0,.3);line-height:1.1}
.bgb3-pill i{font-style:normal;font-size:14px;line-height:1}
.bgb3-pill b{color:var(--cyan-l);font-size:15px}
.bgb3-pill small{color:var(--text-2);font-weight:700;font-size:12px}
.bgb3-pill.bgb3-hp{color:#ff3b6b;letter-spacing:1px;font-size:15px;padding:5px 10px}
.bgb3-pill.bgb3-hp s{text-decoration:none;color:rgba(255,255,255,.18)}
.bgb3-pill.bgb3-hot{border-color:rgba(255,176,46,.6);background:linear-gradient(180deg,rgba(255,176,46,.3),rgba(255,176,46,.08))}
.bgb3-bar{display:inline-block;width:42px;height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;vertical-align:middle}
.bgb3-bar u{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#2de2e6,#d4ff3a);transition:width .25s ease-out}
.bgb3-hud .bgb3-ok{color:var(--up)}
.bgb3-cv{display:block;flex:none;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:#0b0b16;touch-action:none;box-shadow:0 0 0 3px #0f0f1d,0 0 0 4px rgba(255,255,255,.06),0 16px 34px rgba(0,0,0,.55),0 0 34px rgba(var(--c-rgb),.12);cursor:pointer;-webkit-tap-highlight-color:transparent}
.bgb3-shk{animation:bgb3-shk .32s ease-out}
@keyframes bgb3-shk{15%{transform:translate(-6px,2px)}35%{transform:translate(5px,-2px)}55%{transform:translate(-3px,1px)}75%{transform:translate(2px,0)}}
.bgb3-btn{margin-top:12px;padding:12px 20px;border-radius:16px;border:1.5px solid rgba(var(--c-rgb),.75);background:linear-gradient(180deg,rgba(var(--c-rgb),.3),rgba(var(--c-rgb),.08));color:#fff;font:inherit;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 16px rgba(var(--c-rgb),.25),inset 0 1px 0 rgba(255,255,255,.18);touch-action:manipulation;transition:transform .12s ease-out,box-shadow .2s,opacity .2s;-webkit-tap-highlight-color:transparent}
.bgb3-btn:hover:not(:disabled){box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 26px rgba(var(--c-rgb),.5),inset 0 1px 0 rgba(255,255,255,.18)}
.bgb3-btn:active:not(:disabled){transform:scale(.96)}
.bgb3-btn:disabled{opacity:.4;cursor:default;box-shadow:none}
.bgb3-btn.bgb3-hot{border-color:#d4ff3a;background:linear-gradient(180deg,rgba(212,255,58,.32),rgba(212,255,58,.08));animation:bgb3-pulse 1s infinite}
@keyframes bgb3-pulse{50%{box-shadow:0 0 28px rgba(212,255,58,.6),inset 0 1px 0 rgba(255,255,255,.2)}}
.bg21-row{display:flex;gap:10px;align-items:center;justify-content:center;width:100%}
.bg21-row .bgb3-btn{flex:none;white-space:nowrap;padding:11px 14px;font-size:14px}
.bg21-row small{color:var(--text-2);font-size:12px;max-width:52%;line-height:1.25}
.bg24-grid{position:relative;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:8px;width:100%;box-sizing:border-box;padding:8px;border-radius:20px;background:linear-gradient(180deg,#171a2c,#0e0f1c);border:1px solid rgba(255,255,255,.1);box-shadow:0 0 0 3px #0f0f1d,0 0 0 4px rgba(255,255,255,.06),0 16px 34px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.06)}
.bg24-cell{position:relative;border-radius:14px;background:radial-gradient(120% 90% at 50% 0%,rgba(255,255,255,.05),rgba(255,255,255,.012));box-shadow:inset 0 2px 6px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.05);overflow:visible;touch-action:none;-webkit-tap-highlight-color:transparent}
.bg24-cell::before{content:'';position:absolute;left:50%;top:50%;width:34%;height:24%;translate:-50% -50%;border:1.5px solid rgba(255,255,255,.07);border-radius:4px;background:linear-gradient(155deg,transparent 46%,rgba(255,255,255,.07) 48%,transparent 52%),linear-gradient(25deg,transparent 46%,rgba(255,255,255,.07) 48%,transparent 52%)}
.bg24-mail{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 5px 12px;text-align:center;border-radius:14px;background:linear-gradient(180deg,#f6f4ff,#dcd9ee);border:1px solid #fff;color:#1b1830;cursor:pointer;animation:bg24-in .2s cubic-bezier(.2,1.4,.4,1);box-sizing:border-box;box-shadow:0 6px 14px rgba(0,0,0,.45),inset 0 -3px 0 rgba(0,0,0,.08);overflow:hidden;transition:transform .12s ease-out}
.bg24-mail::before{content:'';position:absolute;left:0;right:0;top:0;height:5px;background:repeating-linear-gradient(135deg,#ff3b6b 0 8px,#fff 8px 12px,#2d7bff 12px 20px,#fff 20px 24px);opacity:.75}
.bg24-mail:active{transform:scale(.95)}
.bg24-mail .bg24-ico{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;font-size:24px;line-height:1;background:radial-gradient(circle at 35% 30%,#fff,#e4e0f5 60%,#c9c4e4);box-shadow:0 3px 8px rgba(40,20,90,.3),inset 0 -2px 3px rgba(0,0,0,.08)}
.bg24-mail b{font-size:12px;line-height:1.15;color:#1b1830}
.bg24-mail small{font-size:11px;line-height:1.15;color:#5d5878;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bg24-mail i{position:absolute;left:8px;right:8px;bottom:5px;height:4px;border-radius:2px;background:linear-gradient(90deg,#ff3b6b,#ffb02e 45%,#2de2e6);background-size:300% 100%;background-position:100% 0;transform-origin:left}
.bg24-mail.bg24-gone{animation:bg24-out .25s ease-in forwards}
.bg24-mail.bg24-bad{background:linear-gradient(180deg,#ffd6de,#ff9db2);animation:bg24-shake .3s}
.bg24-mail.bg24-hit{background:linear-gradient(180deg,#f2ffd0,#d4ff3a);animation:bg24-bin .32s ease-in forwards}
.bg24-pop{position:absolute;left:50%;top:40%;z-index:3;translate:-50% -50%;pointer-events:none;font-weight:900;font-size:22px;color:#d4ff3a;text-shadow:0 2px 0 rgba(0,0,0,.5),0 0 12px rgba(0,0,0,.6);animation:bg24-pop .8s ease-out forwards}
.bg24-pop.bad{color:#ff3b6b}
@keyframes bg24-in{from{transform:scale(.5) translateY(10px);opacity:0}}
@keyframes bg24-out{to{transform:scale(.4) rotate(-12deg);opacity:0}}
@keyframes bg24-bin{40%{transform:scale(1.08) rotate(4deg)}to{transform:scale(.2) rotate(-25deg) translateY(30px);opacity:0}}
@keyframes bg24-shake{25%{transform:translateX(-6px) rotate(-2deg)}75%{transform:translateX(6px) rotate(2deg)}}
@keyframes bg24-pop{0%{transform:scale(.5);opacity:0}20%{transform:scale(1.2);opacity:1}to{transform:translateY(-34px);opacity:0}}
.bg24-start{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(7,7,16,.72);border-radius:20px;z-index:2;color:#f2f0ff;font-size:13px;line-height:1.35;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.bg24-card{width:100%;max-width:310px;padding:18px 16px 16px;border-radius:20px;text-align:center;background:linear-gradient(170deg,#24264a,#15162b);border:1px solid rgba(255,255,255,.14);box-shadow:0 18px 40px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.12);animation:bg24-in .3s cubic-bezier(.2,1.3,.4,1)}
.bg24-card .bg24-big{display:grid;place-items:center;width:62px;height:62px;margin:0 auto 8px;border-radius:50%;font-size:32px;background:radial-gradient(circle at 35% 30%,#3a3d70,#1c1d38);box-shadow:0 0 0 3px rgba(255,59,107,.35),0 8px 20px rgba(0,0,0,.5)}
.bg24-card h3{margin:0 0 10px;font-size:18px}
.bg24-rule{display:flex;align-items:center;gap:10px;margin:6px 0;padding:8px 10px;border-radius:14px;text-align:left;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.bg24-rule>span{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:18px;background:rgba(212,255,58,.15);box-shadow:inset 0 0 0 1.5px rgba(212,255,58,.5)}
.bg24-rule.no>span{background:rgba(255,59,107,.15);box-shadow:inset 0 0 0 1.5px rgba(255,59,107,.55)}
.bg24-rule small{display:block;color:var(--text-2);font-size:11.5px}
.bg24-card .bgb3-btn{width:100%}
.bg30-log{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px;font-size:12px;color:var(--text-2);font-variant-numeric:tabular-nums}
.bg30-log span{padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));animation:bg24-in .25s ease-out}
.bg30-log .bgb3-ok{color:#d4ff3a;border-color:rgba(212,255,58,.45)}
.bg30-log .bg30-bad{color:#ff8ba3;border-color:rgba(255,59,107,.4)}
@media (prefers-reduced-motion:reduce){.bgb3-shk,.bg24-mail,.bg24-mail.bg24-bad,.bgb3-btn.bgb3-hot,.bg24-card,.bg30-log span{animation:none}.bg24-pop{animation-duration:.01s}}
`;
  const css = () => {
    if (document.getElementById('bg-style-3')) return;
    const s = document.createElement('style'); s.id = 'bg-style-3'; s.textContent = CSS; document.head.append(s);
  };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const on = (api, t, ty, fn, o) => { t.addEventListener(ty, fn, o); api.onExit(() => t.removeEventListener(ty, fn, o)); };
  const later = (api, ms, fn) => { const id = setTimeout(fn, ms); api.onExit(() => clearTimeout(id)); };
  const DPR = () => Math.min(2.5, window.devicePixelRatio || 1);
  const RM = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const easeOut = t => 1 - (1 - clamp(t, 0, 1)) ** 3;
  const easeBack = t => { t = clamp(t, 0, 1); const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
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
    const d = DPR();
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
    S.shake = () => shake(cv);
    return S;
  }
  const shake = node => { if (RM()) return; node.classList.remove('bgb3-shk'); void node.offsetWidth; node.classList.add('bgb3-shk'); };

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
  // Текст с тёмной обводкой — читается на любом фоне
  const otxt = (g, s, x, y, size, color = '#f2f0ff', align = 'center', w = 900) => {
    g.font = `${w} ${Math.round(size)}px ${FONT}`; g.textAlign = align; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = Math.max(2, size * 0.2); g.strokeStyle = 'rgba(8,6,20,.8)'; g.strokeText(s, x, y);
    g.fillStyle = color; g.fillText(s, x, y);
  };
  const rr = (g, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  };
  // Цвет: осветлить (f>0) или затемнить (f<0)
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    if (f > 0) { r += (255 - r) * f; gg += (255 - gg) * f; b += (255 - b) * f; } else { r *= 1 + f; gg *= 1 + f; b *= 1 + f; }
    return `rgb(${r | 0},${gg | 0},${b | 0})`;
  };
  const lin = (g, x0, y0, x1, y1, stops) => { const l = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => l.addColorStop(o, c)); return l; };
  const rad = (g, x, y, r0, r1, stops, x1 = x, y1 = y) => { const l = g.createRadialGradient(x, y, r0, x1, y1, r1); stops.forEach(([o, c]) => l.addColorStop(o, c)); return l; };
  // Офскрин-спрайты: рисуются один раз (с тенями и градиентами), потом только drawImage
  const off = (w, h) => {
    const d = DPR(), c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(h * d));
    const x = c.getContext('2d'); x.scale(d, d); return { c, x, w, h };
  };
  const SPR = new Map();
  const spr = (key, w, h, fn) => {
    let s = SPR.get(key);
    if (!s) { s = off(w, h); fn(s.x, w, h); SPR.set(key, s); if (SPR.size > 500) SPR.delete(SPR.keys().next().value); }
    return s;
  };
  const blit = (g, s, x, y, w = s.w, h = s.h) => g.drawImage(s.c, x, y, w, h);
  const blitC = (g, s, x, y, rot = 0, sc = 1, alpha = 1) => {
    if (!rot && sc === 1 && alpha === 1) { g.drawImage(s.c, x - s.w / 2, y - s.h / 2, s.w, s.h); return; }
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); if (rot) g.rotate(rot); if (sc !== 1) g.scale(sc, sc); g.drawImage(s.c, -s.w / 2, -s.h / 2, s.w, s.h); g.restore();
  };
  // Мелкий шум/зерно для текстур (только при пререндере)
  const grain = (x, w, h, n, col, sz = 1.2) => { x.fillStyle = col; for (let i = 0; i < n; i++) x.fillRect(Math.random() * w, Math.random() * h, sz, sz); };
  const emoSprite = (ch, px) => {
    const d = DPR(), s = Math.ceil(px * 1.35);
    return spr('emo|' + ch + '|' + Math.round(px), s, s, x => { x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `${Math.round(px)}px ${EMO_FONT}`; x.fillText(ch, s / 2, s / 2 + px * 0.06); });
  };
  const emo = (g, ch, px, x, y, rot = 0, alpha = 1) => blitC(g, emoSprite(ch, px), x, y, rot, 1, alpha);
  // Стартовая карточка поверх холста: значок, заголовок, подсказка; мягко «дышит»
  const veil = (g, W, H, l1, l2, icon = '👆') => {
    g.fillStyle = 'rgba(6,6,16,.58)'; g.fillRect(0, 0, W, H);
    const cw = Math.min(W - 36, 310);
    const s = spr(`card|${icon}|${l1}|${l2}|${cw}`, cw + 30, 200, (x, w, h) => {
      const px = 15, py = 15, ch = h - 30;
      x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 18; x.shadowOffsetY = 8;
      rr(x, px, py, cw, ch, 22); x.fillStyle = lin(x, 0, py, 0, py + ch, [[0, '#26284d'], [1, '#14152b']]); x.fill(); x.restore();
      rr(x, px + 0.5, py + 0.5, cw - 1, ch - 1, 22); x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 1; x.stroke();
      x.fillStyle = lin(x, 0, py, 0, py + 40, [[0, 'rgba(255,255,255,.08)'], [1, 'rgba(255,255,255,0)']]); rr(x, px + 1, py + 1, cw - 2, 40, 21); x.fill();
      const cx = w / 2, iy = py + 40;
      x.fillStyle = rad(x, cx - 8, iy - 10, 2, 30, [[0, '#4a4e8c'], [1, '#1b1c38']]); x.beginPath(); x.arc(cx, iy, 27, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(45,226,230,.55)'; x.lineWidth = 2; x.stroke();
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `28px ${EMO_FONT}`; x.fillStyle = '#fff'; x.fillText(icon, cx, iy + 2);
      let fs = 20; x.font = `900 ${fs}px ${FONT}`; while (x.measureText(l1).width > cw - 24 && fs > 12) { fs--; x.font = `900 ${fs}px ${FONT}`; }
      x.fillStyle = '#7df9ff'; x.fillText(l1, cx, iy + 46);
      if (l2) {
        x.font = `700 13px ${FONT}`; x.fillStyle = '#c9c6e0';
        const words = l2.split(' '), lines = []; let cur = '';
        words.forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (x.measureText(t).width > cw - 30 && cur) { lines.push(cur); cur = wd; } else cur = t; });
        lines.push(cur); lines.slice(0, 2).forEach((ln, i) => x.fillText(ln, cx, iy + 74 + i * 17 - (lines.length > 1 ? 4 : 0)));
      }
    });
    const k = RM() ? 1 : 1 + Math.sin(performance.now() / 320) * 0.012;
    blitC(g, s, W / 2, H / 2, 0, k);
  };
  // Всплывающие надписи «+1»: выскакивают с пружинкой, всплывают и тают
  const popsAdd = (arr, x, y, s, c = '#d4ff3a') => arr.push({ x, y, s, c, t: 0 });
  const popsDraw = (g, arr, dt, size = 18) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]; p.t += dt; if (p.t > 0.9) { arr.splice(i, 1); continue; }
      const sc = 0.5 + 0.5 * easeBack(p.t / 0.18);
      g.save(); g.globalAlpha = p.t < 0.55 ? 1 : 1 - (p.t - 0.55) / 0.35; g.translate(p.x, p.y - easeOut(p.t / 0.9) * 42); g.scale(sc, sc);
      otxt(g, p.s, 0, 0, size, p.c); g.restore();
    }
  };
  // Частицы: конфетти, искры, пыль. При prefers-reduced-motion — вчетверо меньше
  const parts = () => {
    const a = [], rm = RM();
    return {
      a,
      burst(x, y, o = {}) {
        const { n = 14, cols = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ffd34d'], sp = 170, grav = 420, life = 0.8, size = 4, kind = 'conf', up = 0, spread = TAU, dir = 0 } = o;
        const m = rm ? Math.ceil(n / 4) : n;
        for (let i = 0; i < m; i++) {
          const ang = dir + (Math.random() - 0.5) * spread, v = sp * (0.35 + Math.random() * 0.65);
          a.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - up, g: grav, t: 0, life: life * (0.6 + Math.random() * 0.5), c: cols[i % cols.length], s: size * (0.6 + Math.random() * 0.7), r: Math.random() * TAU, vr: (Math.random() - 0.5) * 14, kind });
        }
        if (a.length > 240) a.splice(0, a.length - 240);
      },
      draw(g, dt) {
        for (let i = a.length - 1; i >= 0; i--) {
          const p = a[i]; p.t += dt; if (p.t >= p.life) { a.splice(i, 1); continue; }
          p.vy += p.g * dt; const fr = 1 - Math.min(0.9, 1.6 * dt); p.vx *= fr; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
          const k = 1 - p.t / p.life; g.globalAlpha = Math.min(1, k * 1.8); g.fillStyle = p.c;
          if (p.kind === 'conf') { g.translate(p.x, p.y); g.rotate(p.r); g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.rotate(-p.r); g.translate(-p.x, -p.y); }
          else { g.beginPath(); g.arc(p.x, p.y, Math.max(0.3, p.s * (p.kind === 'spark' ? k : p.kind === 'puff' ? 1 + (1 - k) * 1.5 : 1)), 0, TAU); g.fill(); }
        }
        g.globalAlpha = 1;
      },
    };
  };
  const pill = (ico, html, cls = '') => `<span class="bgb3-pill ${cls}"><i>${ico}</i>${html}</span>`;
  const hearts = (n, max = 3) => `<span class="bgb3-pill bgb3-hp">${'♥'.repeat(Math.max(0, n))}<s>${'♥'.repeat(Math.max(0, max - n))}</s></span>`;
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
    let phase = 'play', pt = 0, ty = 0, over = false, belt = 0, msg = '', clock = 0;
    const pops = [], fx = parts(), slotAt = [0, 0, 0];
    const reset = () => { grid = [...Array(ROWS)].map(() => Array(COLS).fill(0)); placed = []; };
    reset();
    const filled = () => grid.reduce((s, r) => s + r.filter(Boolean).length, 0);
    const fill = () => filled() / (COLS * ROWS);
    const fits = (w, h, r, c) => { if (r < 0 || c < 0 || r + h > ROWS || c + w > COLS) return false; for (let i = r; i < r + h; i++) for (let j = c; j < c + w; j++) if (grid[i][j]) return false; return true; };
    const fitsAny = b => { for (const [w, h] of [[b.w, b.h], [b.h, b.w]]) for (let r = 0; r <= ROWS - h; r++) for (let c = 0; c <= COLS - w; c++) if (fits(w, h, r, c)) return true; return false; };

    const updUI = () => {
      const f = Math.round(fill() * 100);
      S.hudSet(pill('🚚', `<b>${Math.min(truck, TRUCKS)}</b><small>/${TRUCKS}</small>`) + pill('📦', `<span class="bgb3-bar"><u style="width:${f}%"></u></span><b>${f}%</b>`) + pill('⭐', `<b>${score}</b>`));
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
      placed.push({ ...b, r, c, at: clock });
      for (let a = r; a < r + b.h; a++) for (let j = c; j < c + b.w; j++) grid[a][j] = b.id;
      score += b.w * b.h; popsAdd(pops, gx + (c + b.w / 2) * cell, gy + (r + b.h / 2) * cell, '+' + b.w * b.h);
      fx.burst(gx + (c + b.w / 2) * cell, gy + (r + b.h / 2) * cell, { n: 10, cols: ['#e8c48e', '#c98d4e', '#fff3d6'], kind: 'puff', sp: 90, grav: 0, life: 0.45, size: 3 });
      const rowsDone = [];
      for (let a = r; a < r + b.h; a++) if (grid[a].every(Boolean)) rowsDone.push(a);
      rowsDone.forEach(a => fx.burst(gx + gw / 2, gy + (a + 0.5) * cell, { n: 16, kind: 'spark', cols: ['#d4ff3a', '#fff'], sp: 220, grav: 0, life: 0.5, size: 2.5, spread: 0.5, dir: api.rng() < 0.5 ? 0 : Math.PI }));
      api.sfx.stapler?.(); tap(api);
      offer[i] = mk(); slotAt[i] = clock; sel = -1; check();
    };
    const depart = () => {
      const f = fill(); if (phase !== 'play' || f < 0.5 || over) return;
      const rows = grid.filter(r => r.every(Boolean)).length;
      const bonus = Math.round(f * f * 100) + rows * 10;
      score += bonus; shipped++; msg = '';
      popsAdd(pops, W / 2, gy + ROWS * cell / 2, `🚚 +${bonus}`, '#7df9ff');
      fx.burst(W / 2, gy + ROWS * cell / 2, { n: 46, sp: 340, up: 120, life: 1.1, size: 6 });
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
      if (best) place(i, best[0], best[1]); else { popsAdd(pops, gx + (c + .5) * cell, gy + (r + .5) * cell, L('не влезает', 'no room'), '#ff3b6b'); api.buzz?.('danger'); S.shake(); }
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
        if (sel === d.i) { const b = offer[d.i]; [b.w, b.h] = [b.h, b.w]; slotAt[d.i] = clock; tap(api); } else sel = d.i;
        check(); return;
      }
      const s = snap(d);
      if (s && s.ok) place(d.i, s.r, s.c);
    };
    on(api, S.cv, 'pointerup', up); on(api, S.cv, 'pointercancel', () => { drag = null; });

    // --- спрайты ---
    const P = 6; // поле под тень
    const boxSpr = (b, w, h) => spr(`b21|${b.w}x${b.h}|${b.col}|${b.t}|${b.l}|${Math.round(w)}x${Math.round(h)}`, w + P * 2, h + P * 2, x => {
      const p = Math.max(1.2, Math.min(w, h) * 0.035), X = P + p, Y = P + p, bw = w - 2 * p, bh = h - 2 * p, m = Math.min(bw, bh), r = Math.min(6, m * 0.14);
      x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = Math.min(8, m * 0.25); x.shadowOffsetY = Math.min(3, m * 0.08);
      rr(x, X, Y, bw, bh, r); x.fillStyle = b.col; x.fill(); x.restore();
      x.save(); rr(x, X, Y, bw, bh, r); x.clip();
      x.fillStyle = lin(x, X, Y, X + bw, Y + bh, [[0, shade(b.col, 0.22)], [0.55, b.col], [1, shade(b.col, -0.25)]]); x.fillRect(X, Y, bw, bh);
      x.strokeStyle = 'rgba(90,50,15,.18)'; x.lineWidth = 0.8;
      for (let i = 0; i < (bw * bh) / 90; i++) { const fx0 = X + Math.random() * bw, fy0 = Y + Math.random() * bh; x.beginPath(); x.moveTo(fx0, fy0); x.lineTo(fx0 + 3 + Math.random() * 5, fy0 + (Math.random() - 0.5)); x.stroke(); }
      const horiz = bw >= bh;
      x.strokeStyle = 'rgba(70,35,10,.35)'; x.lineWidth = 1; x.beginPath();
      if (horiz) { x.moveTo(X, Y + bh / 2); x.lineTo(X + bw, Y + bh / 2); } else { x.moveTo(X + bw / 2, Y); x.lineTo(X + bw / 2, Y + bh); } x.stroke();
      const tw = Math.max(3, m * 0.2);
      x.globalAlpha = 0.85; x.fillStyle = b.t;
      if (horiz) x.fillRect(X, Y + bh / 2 - tw / 2, bw, tw); else x.fillRect(X + bw / 2 - tw / 2, Y, tw, bh);
      x.globalAlpha = 0.45; x.fillStyle = '#fff';
      if (horiz) x.fillRect(X, Y + bh / 2 - tw / 2 + 0.8, bw, Math.max(0.8, tw * 0.18)); else x.fillRect(X + bw / 2 - tw / 2 + 0.8, Y, Math.max(0.8, tw * 0.18), bh);
      x.globalAlpha = 1;
      if (m > 22) {
        const ls = m * 0.36, lx = horiz ? X + bw * 0.08 : X + bw / 2 - ls / 2, ly = horiz ? Y + bh * 0.08 : Y + bh * 0.07;
        const lw = horiz ? ls : ls, lh = ls * (horiz ? 0.78 : 0.78);
        rr(x, lx, ly, lw, lh, 3); x.fillStyle = '#fbf6ea'; x.fill(); x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 0.8; x.stroke();
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `${Math.round(lh * 0.7)}px ${EMO_FONT}`; x.fillText(b.l, lx + lw / 2, ly + lh / 2 + 1);
        if (m > 40 && (bw > m * 1.4 || bh > m * 1.4)) {
          const bx0 = horiz ? X + bw - m * 0.42 : X + bw / 2 - m * 0.17, by0 = horiz ? Y + bh * 0.62 : Y + bh - m * 0.32;
          x.fillStyle = 'rgba(30,20,10,.55)'; for (let i = 0; i < 9; i++) x.fillRect(bx0 + i * m * 0.037, by0, i % 3 ? 0.9 : 1.6, m * 0.18);
        }
      }
      x.restore();
      rr(x, X + 0.5, Y + 0.5, bw - 1, bh - 1, r); x.strokeStyle = 'rgba(255,240,210,.35)'; x.lineWidth = 1; x.stroke();
      rr(x, X, Y, bw, bh, r); x.strokeStyle = 'rgba(60,30,8,.6)'; x.lineWidth = 1; x.stroke();
    });
    const drawBox = (b, x, y, w, h, alpha = 1, k = 1) => {
      const s = boxSpr(b, w, h);
      if (k === 1 && alpha === 1) blit(g, s, x - P, y - P); else blitC(g, s, x + w / 2, y + h / 2, 0, k, alpha);
    };
    const bg = spr(`b21bg|${W}x${H}`, W, H, x => {
      x.fillStyle = lin(x, 0, 0, 0, H, [[0, '#1d1f2e'], [1, '#121320']]); x.fillRect(0, 0, W, H);
      grain(x, W, H, W * H / 30, 'rgba(255,255,255,.035)'); grain(x, W, H, W * H / 40, 'rgba(0,0,0,.25)');
      x.strokeStyle = 'rgba(255,255,255,.04)'; x.lineWidth = 1;
      for (let yy = 60; yy < H; yy += 120) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); }
      // жёлто-чёрная разметка погрузочной зоны
      [gx - 22, gx + gw + 12].forEach(lx => {
        x.save(); x.beginPath(); x.rect(lx, 0, 10, gb + 6); x.clip();
        x.fillStyle = '#e8b923'; x.fillRect(lx, 0, 10, gb + 6); x.fillStyle = '#1a1a22';
        for (let yy = -20; yy < gb + 20; yy += 16) { x.beginPath(); x.moveTo(lx, yy); x.lineTo(lx + 10, yy - 10); x.lineTo(lx + 10, yy - 2); x.lineTo(lx, yy + 8); x.fill(); }
        x.restore(); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(lx, 0, 10, gb + 6);
      });
      const vg = rad(x, W / 2, H * 0.4, H * 0.2, H * 0.8, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.45)']]); x.fillStyle = vg; x.fillRect(0, 0, W, H);
    });
    const truckSpr = spr(`b21tr|${W}x${cell}`, gw + 40, ROWS * cell + cell + 40, x => {
      const ox = 20, oy = cell + 10; // (gx,gy) → (ox,oy)
      // тень
      x.save(); x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 16; x.shadowOffsetY = 6;
      rr(x, ox - 6, oy - 4, gw + 12, ROWS * cell + 10, 10); x.fillStyle = '#2b2f42'; x.fill(); x.restore();
      // кабина
      const kx = ox + cell * 0.7, kw = gw - cell * 1.4, ky = oy - cell * 0.95;
      x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 10; x.shadowOffsetY = 3;
      rr(x, kx, ky, kw, cell * 1.05, 12); x.fillStyle = '#5b3fd6'; x.fill(); x.restore();
      rr(x, kx, ky, kw, cell * 1.05, 12); x.fillStyle = lin(x, kx, 0, kx + kw, 0, [[0, '#3b2a99'], [0.25, '#6d52f0'], [0.6, '#5a40d8'], [1, '#2f2280']]); x.fill();
      x.fillStyle = '#ff3bd4'; x.fillRect(kx + 4, ky + cell * 0.66, kw - 8, 2.5);
      rr(x, kx + cell * 0.3, ky + cell * 0.14, kw - cell * 0.6, cell * 0.36, 7);
      x.fillStyle = lin(x, 0, ky + cell * 0.14, 0, ky + cell * 0.5, [[0, '#9ff8ff'], [0.5, '#2fb9d8'], [1, '#13506a']]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(kx + cell * 0.45, ky + cell * 0.16); x.lineTo(kx + cell * 0.75, ky + cell * 0.16); x.lineTo(kx + cell * 0.55, ky + cell * 0.48); x.lineTo(kx + cell * 0.32, ky + cell * 0.48); x.fill();
      [[kx - cell * 0.18, 1], [kx + kw + cell * 0.02, 1]].forEach(([mx]) => { rr(x, mx, ky + cell * 0.3, cell * 0.16, cell * 0.28, 3); x.fillStyle = '#1f1a44'; x.fill(); });
      [kx + cell * 0.18, kx + kw - cell * 0.42].forEach(hx => { x.fillStyle = rad(x, hx + cell * 0.12, ky + cell * 0.08, 0, cell * 0.25, [[0, '#fffbe0'], [0.5, '#ffd34d'], [1, 'rgba(255,211,77,0)']]); x.fillRect(hx - cell * 0.15, ky - cell * 0.2, cell * 0.55, cell * 0.5); });
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1.5; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(kx + kw * 0.32, ky + cell * 0.78 + i * 4); x.lineTo(kx + kw * 0.68, ky + cell * 0.78 + i * 4); x.stroke(); }
      // рама кузова
      rr(x, ox - 6, oy - 4, gw + 12, ROWS * cell + 10, 9); x.fillStyle = lin(x, ox - 6, 0, ox + gw + 6, 0, [[0, '#626a86'], [0.06, '#3a3f56'], [0.94, '#3a3f56'], [1, '#626a86']]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.35)'; for (let yy = oy + 6; yy < oy + ROWS * cell; yy += cell * 0.5) { x.beginPath(); x.arc(ox - 3, yy, 1.1, 0, TAU); x.arc(ox + gw + 3, yy, 1.1, 0, TAU); x.fill(); }
      // деревянный пол
      x.save(); x.beginPath(); x.rect(ox, oy, gw, ROWS * cell); x.clip();
      const pw = cell / 2;
      for (let i = 0; i < COLS * 2; i++) {
        const v = (i * 37 % 5) / 5;
        x.fillStyle = `rgb(${44 + v * 12 | 0},${48 + v * 12 | 0},${66 + v * 14 | 0})`; x.fillRect(ox + i * pw, oy, pw, ROWS * cell);
        x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 0.7;
        for (let j = 0; j < 4; j++) { const lx = ox + i * pw + 3 + Math.random() * (pw - 6); x.beginPath(); x.moveTo(lx, oy); x.bezierCurveTo(lx + 2, oy + ROWS * cell * 0.3, lx - 2, oy + ROWS * cell * 0.7, lx + 1, oy + ROWS * cell); x.stroke(); }
        x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(ox + i * pw, oy, 1, ROWS * cell);
      }
      x.fillStyle = lin(x, 0, oy, 0, oy + ROWS * cell, [[0, 'rgba(0,0,0,.35)'], [0.15, 'rgba(0,0,0,0)'], [0.85, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.3)']]); x.fillRect(ox, oy, gw, ROWS * cell);
      x.strokeStyle = 'rgba(200,230,255,.12)'; x.lineWidth = 1; x.setLineDash([3, 4]);
      for (let i = 1; i < COLS; i++) { x.beginPath(); x.moveTo(ox + i * cell, oy); x.lineTo(ox + i * cell, oy + ROWS * cell); x.stroke(); }
      for (let i = 1; i < ROWS; i++) { x.beginPath(); x.moveTo(ox, oy + i * cell); x.lineTo(ox + gw, oy + i * cell); x.stroke(); }
      x.restore();
      x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 2; x.strokeRect(ox, oy, gw, ROWS * cell);
      // задние фонари
      [ox - 4, ox + gw - 6].forEach(lx => { rr(x, lx, oy + ROWS * cell + 1, 10, 4, 2); x.fillStyle = '#ff3b6b'; x.fill(); });
    });
    const beltSpr = spr(`b21belt|${W}x${ch}`, W - 8, ch, (x, w, h) => {
      rr(x, 0, 0, w, h, 14); x.fillStyle = lin(x, 0, 0, 0, h, [[0, '#2a2c3e'], [1, '#17182a']]); x.fill();
      x.save(); rr(x, 0, 0, w, h, 14); x.clip();
      [0, h - 8].forEach(yy => { x.fillStyle = lin(x, 0, yy, 0, yy + 8, [[0, '#9aa0b8'], [0.5, '#e6e9f5'], [1, '#5a5f78']]); x.fillRect(0, yy, w, 8); x.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 6; i < w; i += 14) x.fillRect(i, yy, 1.5, 8); });
      x.fillStyle = lin(x, 0, 8, 0, h - 8, [[0, 'rgba(0,0,0,.4)'], [0.2, 'rgba(0,0,0,0)'], [0.8, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.45)']]); x.fillRect(0, 8, w, h - 16);
      x.restore();
      x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 1; [1, 2].forEach(i => { x.beginPath(); x.moveTo(i * w / 3, 12); x.lineTo(i * w / 3, h - 12); x.stroke(); });
      rr(x, 0.5, 0.5, w - 1, h - 1, 14); x.strokeStyle = 'rgba(45,226,230,.35)'; x.lineWidth = 1; x.stroke();
    });
    const drawTruck = oy => {
      g.save(); g.translate(0, oy);
      blit(g, truckSpr, gx - 20, gy - cell - 10);
      // заполненные ряды подсвечены
      grid.forEach((r, i) => { if (r.every(Boolean)) { g.fillStyle = 'rgba(212,255,58,.85)'; g.fillRect(gx - 6, gy + i * cell + 3, 3, cell - 6); g.fillRect(gx + gw + 3, gy + i * cell + 3, 3, cell - 6); } });
      placed.forEach(b => {
        const k = clock - b.at < 0.22 ? 1.16 - 0.16 * easeOut((clock - b.at) / 0.22) : 1;
        drawBox(b, gx + b.c * cell, gy + b.r * cell, b.w * cell, b.h * cell, 1, k);
      });
      g.restore();
    };
    loop(api, dt => {
      belt += dt; clock += dt;
      if (phase === 'out') { pt += dt; ty = -((pt / 0.7) ** 2) * (gb + cell * 2); if (pt >= 0.7) { truck++; if (truck > TRUCKS) { ty = 0; reset(); finish(L('Смена окончена!', 'Shift over!')); } else { reset(); phase = 'in'; pt = 0; check(); } } }
      else if (phase === 'in') { pt += dt; const k = Math.min(1, pt / 0.5); ty = (1 - k) * (1 - k) * (H * 0.9); if (k >= 1) { phase = 'play'; ty = 0; updUI(); } }
      blit(g, bg, 0, 0);
      drawTruck(ty);
      // призрак при перетаскивании
      if (drag && drag.moved) {
        const b = offer[drag.i], s = snap(drag);
        if (s) {
          const r0 = clamp(s.r, 0, ROWS - b.h), c0 = clamp(s.c, 0, COLS - b.w), X = gx + c0 * cell, Y = gy + r0 * cell;
          g.fillStyle = s.ok ? 'rgba(212,255,58,.22)' : 'rgba(255,59,107,.25)'; rr(g, X + 1, Y + 1, b.w * cell - 2, b.h * cell - 2, 6); g.fill();
          g.strokeStyle = s.ok ? '#d4ff3a' : '#ff3b6b'; g.lineWidth = 2; g.setLineDash([6, 4]); g.stroke(); g.setLineDash([]);
          if (s.ok) drawBox(b, X, Y, b.w * cell, b.h * cell, 0.35);
        }
        drawBox(b, drag.x - b.w * cell / 2, drag.y - b.h * cell / 2 - drag.lift, b.w * cell, b.h * cell, 0.92, 1.06);
      }
      // конвейер
      blit(g, beltSpr, 4, cy);
      g.save(); rr(g, 4, cy + 8, W - 8, ch - 16, 4); g.clip();
      g.strokeStyle = 'rgba(255,255,255,.045)'; g.lineWidth = 3;
      const offs = (belt * 30) % 22; for (let x = -22 + offs; x < W; x += 22) { g.beginPath(); g.moveTo(x, cy + 8); g.lineTo(x, cy + ch - 8); g.stroke(); }
      g.restore();
      offer.forEach((b, i) => {
        if (drag && drag.moved && drag.i === i) return;
        const cxs = slotW * i + slotW / 2, cys = cy + ch / 2, bw = b.w * sc, bh = b.h * sc;
        const ok = phase !== 'play' || fitsAny(b);
        const age = clock - slotAt[i], inK = age < 0.25 ? easeBack(age / 0.25) : 1;
        if (sel === i) {
          rr(g, slotW * i + 8, cy + 6, slotW - 16, ch - 12, 12); g.fillStyle = 'rgba(125,249,255,.1)'; g.fill();
          g.strokeStyle = 'rgba(125,249,255,.3)'; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#7df9ff'; g.lineWidth = 2; g.stroke();
        }
        const bob = sel === i && !RM() ? Math.sin(clock * 6) * 2 : 0;
        drawBox(b, cxs - bw / 2, cys - bh / 2 + bob, bw, bh, ok ? 1 : 0.35, (sel === i ? 1.08 : 1) * inK);
        if (!ok) { g.fillStyle = '#ff3b6b'; g.beginPath(); g.arc(cxs + bw / 2, cys - bh / 2, 9, 0, TAU); g.fill(); txt(g, '✕', cxs + bw / 2, cys - bh / 2 + 0.5, 11, '#fff', 'center', 900); }
      });
      fx.draw(g, dt);
      popsDraw(g, pops, dt, Math.max(16, cell * 0.36));
      if (msg) {
        g.font = `800 ${Math.round(Math.min(15, W / 25))}px ${FONT}`; const mw = Math.min(W - 16, g.measureText(msg).width + 30), my = gb - cell * 0.75;
        rr(g, W / 2 - mw / 2, my, mw, cell * 0.62, cell * 0.31); g.fillStyle = 'rgba(12,12,24,.88)'; g.fill(); g.strokeStyle = 'rgba(212,255,58,.7)'; g.lineWidth = 1.5; g.stroke();
        txt(g, msg, W / 2, my + cell * 0.31, Math.min(15, W / 25), '#d4ff3a');
      }
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
    let state = 'ready', score = 0, lives = 3, t = 0, spawn = 0.4, items = [], pops = [], trayX = W / 2, target = W / 2, flash = 0, keys = 0, bounce = 9, clock = 0;
    const fx = parts();
    const upd = () => S.hudSet(pill('☕', `<small>${L('Поймано', 'Caught')}</small><b>${score}</b><small>/${WIN}</small>`) + hearts(lives));
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
    const lose = () => { lives--; flash = 0.35; S.shake(); api.sfx.buzzer?.(); upd(); if (lives <= 0 && state === 'run') { state = 'over'; later(api, 700, () => api.end({ score, won: score >= WIN, text: L(`Поймано чашек: ${score}. Цель — ${WIN}.`, `Cups caught: ${score}. Goal: ${WIN}.`) })); } };

    // --- спрайты ---
    const Z = 34 * u, SZ = Math.ceil(Z * 1.5);
    const aura = (x, c) => { x.fillStyle = rad(x, SZ / 2, SZ / 2, Z * 0.2, SZ / 2, [[0, c], [1, 'rgba(0,0,0,0)']]); x.fillRect(0, 0, SZ, SZ); };
    const ITEM = {
      cup: spr(`c22cup|${SZ}`, SZ, SZ, x => {
        const c = SZ / 2, s = Z / 34;
        x.save(); x.translate(c, c + 2 * s); x.scale(s, s);
        x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(0, 15, 17, 4, 0, 0, TAU); x.fill();
        x.fillStyle = lin(x, -17, 0, 17, 0, [[0, '#cfd2e6'], [0.4, '#ffffff'], [1, '#b7bbd4']]); x.beginPath(); x.ellipse(0, 12, 17, 4.5, 0, 0, TAU); x.fill();
        x.lineWidth = 3.2; x.strokeStyle = '#e9ebf7'; x.beginPath(); x.arc(11, 1, 5.5, -1.2, 1.3); x.stroke();
        x.fillStyle = lin(x, -11, 0, 11, 0, [[0, '#d7daf0'], [0.35, '#ffffff'], [1, '#aeb3cf']]);
        x.beginPath(); x.moveTo(-11, -8); x.lineTo(11, -8); x.lineTo(9, 11); x.quadraticCurveTo(0, 13, -9, 11); x.closePath(); x.fill();
        x.fillStyle = '#ff3bd4'; x.fillRect(-10.4, -1, 20.6, 3.2);
        x.fillStyle = '#5a3418'; x.beginPath(); x.ellipse(0, -8, 11, 3, 0, 0, TAU); x.fill();
        x.fillStyle = '#c98d4e'; x.beginPath(); x.ellipse(-1.5, -8.4, 5, 1.2, 0, 0, TAU); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 2; x.lineCap = 'round';
        [[-4, 0], [3, 1]].forEach(([sx, ph]) => { x.beginPath(); x.moveTo(sx, -12); x.bezierCurveTo(sx - 4, -15 - ph, sx + 4, -18, sx, -22 + ph); x.stroke(); });
        x.restore();
      }),
      donut: spr(`c22don|${SZ}`, SZ, SZ, x => {
        const c = SZ / 2, s = Z / 34;
        x.save(); x.translate(c, c); x.scale(s, s);
        x.fillStyle = 'rgba(255,211,77,.25)'; x.beginPath(); x.arc(0, 0, 21, 0, TAU); x.fill();
        x.fillStyle = lin(x, 0, -15, 0, 15, [[0, '#f0b46a'], [1, '#b06d2c']]); x.beginPath(); x.arc(0, 0, 15, 0, TAU); x.fill();
        x.fillStyle = lin(x, 0, -14, 0, 12, [[0, '#ff9be8'], [1, '#ff3bd4']]);
        x.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, r = 12.5 + (i % 2 ? 1.6 : -0.6); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill();
        x.fillStyle = '#2a1608'; x.beginPath(); x.arc(0, 0, 4.6, 0, TAU); x.fill();
        ['#2de2e6', '#d4ff3a', '#fff', '#ffb02e', '#5b5bd6'].forEach((cc, i) => { for (let j = 0; j < 3; j++) { const a = (i * 3 + j) * 0.42, r = 7.5 + (j % 2) * 2.5; x.save(); x.translate(Math.cos(a) * r, Math.sin(a) * r); x.rotate(a * 3); x.fillStyle = cc; x.fillRect(-1.6, -0.6, 3.2, 1.2); x.restore(); } });
        x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.ellipse(-6, -8, 4, 1.6, -0.6, 0, TAU); x.fill();
        x.restore();
      }),
      bug: spr(`c22bug|${SZ}`, SZ, SZ, x => {
        const c = SZ / 2, s = Z / 34;
        aura(x, 'rgba(255,59,107,.35)');
        x.save(); x.translate(c, c); x.scale(s, s);
        x.strokeStyle = '#1a1020'; x.lineWidth = 2; x.lineCap = 'round';
        [-5, 1, 7].forEach(yy => { x.beginPath(); x.moveTo(-6, yy); x.lineTo(-14, yy - 3); x.lineTo(-16, yy + 2); x.moveTo(6, yy); x.lineTo(14, yy - 3); x.lineTo(16, yy + 2); x.stroke(); });
        x.beginPath(); x.moveTo(-3, -12); x.quadraticCurveTo(-6, -19, -10, -19); x.moveTo(3, -12); x.quadraticCurveTo(6, -19, 10, -19); x.stroke();
        x.fillStyle = '#1a1020'; x.beginPath(); x.arc(0, -10, 5.5, 0, TAU); x.fill();
        x.fillStyle = lin(x, -10, -6, 10, 14, [[0, '#ff7a9a'], [0.5, '#e0204e'], [1, '#7a0a28']]); x.beginPath(); x.ellipse(0, 3, 10, 12, 0, 0, TAU); x.fill();
        x.strokeStyle = '#3a0414'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -8); x.lineTo(0, 15); x.stroke();
        x.fillStyle = '#2a0610'; [[-4.5, -1], [4.5, 1], [-4, 8], [4, 9]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 2, 0, TAU); x.fill(); });
        x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-4, -3, 2.4, 4, -0.4, 0, TAU); x.fill();
        x.fillStyle = '#ffec3d'; x.beginPath(); x.arc(-2.3, -11, 1.4, 0, TAU); x.arc(2.3, -11, 1.4, 0, TAU); x.fill();
        x.restore();
      }),
      paper: spr(`c22pap|${SZ}`, SZ, SZ, x => {
        const c = SZ / 2, s = Z / 34;
        aura(x, 'rgba(255,59,107,.3)');
        x.save(); x.translate(c, c); x.scale(s, s);
        x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(-10, -12, 23, 28);
        x.fillStyle = lin(x, -12, -14, 12, 14, [[0, '#ffffff'], [1, '#d9d6e8']]);
        x.beginPath(); x.moveTo(-12, -14); x.lineTo(6, -14); x.lineTo(12, -8); x.lineTo(12, 14); x.lineTo(-12, 14); x.closePath(); x.fill();
        x.fillStyle = '#b9b5cc'; x.beginPath(); x.moveTo(6, -14); x.lineTo(6, -8); x.lineTo(12, -8); x.fill();
        x.fillStyle = '#9a96b3'; for (let i = 0; i < 5; i++) x.fillRect(-8, -8 + i * 4, i === 4 ? 9 : 14, 1.6);
        x.fillStyle = '#ff3b6b'; x.beginPath(); x.arc(6, 8, 6, 0, TAU); x.fill();
        x.fillStyle = '#fff'; x.font = `900 9px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('!', 6, 8.5);
        x.restore();
      }),
    };
    const TW = trayW + 24 * u, TH = 30 * k;
    const traySpr = spr(`c22tray|${Math.round(TW)}|${Math.round(TH)}`, TW, TH, x => {
      const cx = TW / 2, y0 = 10 * k;
      x.fillStyle = rad(x, cx, y0 + 12 * k, 2, trayW * 0.6, [[0, 'rgba(255,59,212,.55)'], [1, 'rgba(255,59,212,0)']]); x.fillRect(0, 0, TW, TH);
      x.save(); x.translate(cx, 0);
      rr(x, -trayW / 2 - 7 * u, y0 - 3 * k, 12 * u, 7 * k, 3); x.fillStyle = '#7d8299'; x.fill();
      rr(x, trayW / 2 - 5 * u, y0 - 3 * k, 12 * u, 7 * k, 3); x.fill();
      rr(x, -trayW / 2, y0, trayW, 10 * k, 5 * k); x.fillStyle = lin(x, 0, y0, 0, y0 + 10 * k, [[0, '#ffffff'], [0.35, '#d4d8ea'], [1, '#7a7f99']]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(-trayW / 2 + 8 * u, y0 + 2 * k, trayW - 16 * u, 1.5);
      x.fillStyle = '#ff3bd4'; x.fillRect(-trayW / 2 + 4 * u, y0 + 9 * k, trayW - 8 * u, 1.5);
      x.restore();
    });
    const bg = spr(`c22bg|${W}x${H}`, W, H, x => {
      x.fillStyle = lin(x, 0, 0, 0, H, [[0, '#181a33'], [1, '#0d0d1c']]); x.fillRect(0, 0, W, H);
      const th = 22 * u, tw = 44 * u;
      for (let r = 0, y = 26 * k; y < H; r++, y += th) for (let xx = (r % 2) * -tw / 2; xx < W; xx += tw) {
        rr(x, xx + 1.5, y + 1.5, tw - 3, th - 3, 4); x.fillStyle = `rgba(120,130,220,${0.05 + ((r * 7 + xx) % 3) * 0.012})`; x.fill();
        x.fillStyle = 'rgba(255,255,255,.04)'; x.fillRect(xx + 4, y + 3, tw - 10, 1.5);
      }
      x.save(); x.globalAlpha = 0.22; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${Math.round(34 * u)}px ${FONT}`;
      x.shadowColor = '#ff3bd4'; x.shadowBlur = 18; x.fillStyle = '#ff8be6'; x.fillText('COFFEE', W / 2, H * 0.38); x.restore();
      x.fillStyle = lin(x, 0, 0, 0, 22 * k, [[0, '#2d2f52'], [1, '#1f2140']]); x.fillRect(0, 0, W, 22 * k);
      x.fillStyle = '#ff3bd4'; x.fillRect(0, 22 * k, W, 2);
      x.fillStyle = lin(x, 0, 24 * k, 0, 60 * k, [[0, 'rgba(255,59,212,.18)'], [1, 'rgba(255,59,212,0)']]); x.fillRect(0, 24 * k, W, 36 * k);
      for (let i = 0; i < 5; i++) { rr(x, W * (0.1 + i * 0.2) - 10 * u, 8 * k, 20 * u, 4 * k, 2); x.fillStyle = '#9aa0b8'; x.fill(); }
      const cy0 = H - 14 * k; x.fillStyle = lin(x, 0, cy0, 0, H, [[0, '#5a3d28'], [1, '#2c1d12']]); x.fillRect(0, cy0, W, H - cy0);
      x.fillStyle = 'rgba(255,220,180,.25)'; x.fillRect(0, cy0, W, 1.5);
      x.fillStyle = rad(x, W / 2, H / 2, H * 0.25, H * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.45)']]); x.fillRect(0, 0, W, H);
    });
    loop(api, dt => {
      clock += dt; bounce += dt;
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
        if (it.kind === 'cup' || it.kind === 'donut') it.rot = Math.sin(it.sw * 0.7) * 0.12;
        if (state === 'run' && it.y > trayY - 22 * k && it.y < trayY + 6 * k && Math.abs(it.x - trayX) < trayW / 2 + 6 * u) {
          items.splice(i, 1);
          if (it.kind === 'cup' || it.kind === 'donut') {
            const v = it.kind === 'donut' ? 3 : 1; score += v; popsAdd(pops, it.x, trayY - 30 * k, '+' + v); api.sfx.item?.(); upd(); bounce = 0;
            fx.burst(it.x, trayY - 4 * k, { n: it.kind === 'donut' ? 18 : 10, kind: 'spark', cols: it.kind === 'donut' ? ['#ff8be6', '#ffd34d', '#fff'] : ['#ffd34d', '#fff', '#d4ff3a'], sp: 160, grav: 200, up: 80, life: 0.55, size: 2.6 });
          }
          else { popsAdd(pops, it.x, trayY - 30 * k, it.kind === 'bug' ? L('баг!', 'bug!') : L('ещё отчёт!', 'more reports!'), '#ff3b6b'); fx.burst(it.x, trayY - 6 * k, { n: 14, cols: it.kind === 'bug' ? ['#e0204e', '#1a1020'] : ['#ffffff', '#c9c6e0'], sp: 200, up: 100, life: 0.6, size: 4 }); lose(); }
          continue;
        }
        if (it.y > H + 30) { items.splice(i, 1); if (state === 'run' && it.kind === 'cup') { popsAdd(pops, it.x, H - 20, L('мимо', 'miss'), '#ff3b6b'); fx.burst(it.x, H - 14 * k, { n: 12, kind: 'spark', cols: ['#7a4a22', '#c98d4e'], sp: 150, up: 140, grav: 600, life: 0.5, size: 3 }); lose(); } }
      }
      blit(g, bg, 0, 0);
      items.forEach(it => blitC(g, ITEM[it.kind], it.x, it.y, it.rot));
      // поднос: пружинит при ловле
      const sq = bounce < 0.25 ? Math.sin(bounce / 0.25 * Math.PI) * 4 * k : 0;
      blit(g, traySpr, trayX - TW / 2, trayY - 10 * k + sq);
      fx.draw(g, dt);
      popsDraw(g, pops, dt, 18 * u);
      if (flash > 0) { flash -= dt; g.fillStyle = `rgba(255,59,107,${Math.max(0, flash)})`; g.fillRect(0, 0, W, H); }
      if (state === 'ready') veil(g, W, H, L('Коснитесь, чтобы начать', 'Tap to start'), L('Ловите ☕ и 🍩, избегайте 🐛 и 📄', 'Catch ☕ and 🍩, avoid 🐛 and 📄'), '☕');
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
    let state = 'ready', speed = 240 * k, dist = 0, t = 0, obs = [], next = W * 0.9, phase = 0, buf = 0, scroll = 0, dust = 0, land = 9;
    const fx = parts();
    const meters = () => Math.floor(dist / M);
    const upd = () => S.hudSet(pill('🏃', `<b>${meters()}</b><small>${L('м', 'm')}</small>`) + pill('🏁', `<span class="bgb3-bar"><u style="width:${Math.min(100, meters() / WIN * 100)}%"></u></span><small>${WIN} ${L('м', 'm')}</small>`));
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
    const crash = () => {
      state = 'over'; api.sfx.stamp?.(); api.buzz?.('danger'); S.shake();
      fx.burst(P.x + 10 * k, P.y - 30 * k, { n: 18, kind: 'spark', cols: ['#ffd34d', '#fff', '#ff3b6b'], sp: 240, grav: 300, life: 0.6, size: 3 });
      later(api, 800, () => api.end({ score: meters(), won: meters() >= WIN, text: L(`Пробежали ${meters()} м по коридору.`, `You ran ${meters()} m down the corridor.`) }));
    };

    // --- спрайты препятствий (рисуются один раз) ---
    const PAD = 6 * k;
    const obsSpr = o => {
      const v = o.id.startsWith('folders') ? Math.round(o.ph) % 4 : 0;
      return spr(`d23|${o.id}|${v}|${Math.round(o.w)}x${Math.round(o.h)}`, o.w + PAD * 2, o.h + PAD * 2, x => {
        x.translate(PAD, PAD); const w = o.w, h = o.h;
        if (o.id !== 'deadline') { x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(w / 2, h, w * 0.6, 3.5 * k, 0, 0, TAU); x.fill(); }
        if (o.id === 'folders' || o.id === 'folders2') {
          const n = 3, hh = h / n, cols = ['#ff3bd4', '#2de2e6', '#ffd34d', '#d4ff3a'];
          for (let i = 0; i < n; i++) {
            const c = cols[(i + v) % 4], X = (i % 2) * 2 * k, Y = h - (i + 1) * hh, ww = w - 2 * k, hb = hh - 1.5 * k;
            rr(x, X, Y, ww, hb, 3 * k); x.fillStyle = lin(x, 0, Y, 0, Y + hb, [[0, shade(c, 0.35)], [0.5, c], [1, shade(c, -0.35)]]); x.fill();
            x.fillStyle = '#f4f2ea'; x.fillRect(X + 2 * k, Y + hb * 0.25, ww - 4 * k, hb * 0.14);
            rr(x, X + ww * 0.38, Y + hb * 0.48, ww * 0.24, hb * 0.32, 1.5 * k); x.fillStyle = 'rgba(255,255,255,.85)'; x.fill();
            x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; rr(x, X, Y, ww, hb, 3 * k); x.stroke();
          }
        } else if (o.id === 'chair') {
          rr(x, w * 0.62, 0, w * 0.32, h * 0.6, 6 * k); x.fillStyle = lin(x, w * 0.62, 0, w * 0.94, 0, [[0, '#4b4b78'], [0.5, '#6c6ca8'], [1, '#34345a']]); x.fill();
          rr(x, w * 0.7, h * 0.08, w * 0.12, h * 0.42, 3 * k); x.fillStyle = 'rgba(255,255,255,.12)'; x.fill();
          rr(x, 0, h * 0.5, w, h * 0.15, 5 * k); x.fillStyle = lin(x, 0, h * 0.5, 0, h * 0.65, [[0, '#7474b4'], [1, '#383862']]); x.fill();
          rr(x, w * 0.05, h * 0.42, w * 0.22, h * 0.06, 2 * k); x.fillStyle = '#2a2a44'; x.fill();
          x.fillStyle = lin(x, w * 0.43, 0, w * 0.55, 0, [[0, '#8a8fa8'], [0.5, '#e4e7f2'], [1, '#6a6f88']]); x.fillRect(w * 0.44, h * 0.65, 4.5 * k, h * 0.24);
          x.fillStyle = '#9aa0b8'; rr(x, w * 0.08, h - 6 * k, w * 0.84, 3.5 * k, 1.5 * k); x.fill();
          x.fillStyle = '#15151f'; [0.12, 0.5, 0.88].forEach(f => { x.beginPath(); x.arc(w * f, h - 2.5 * k, 3 * k, 0, TAU); x.fill(); });
        } else if (o.id === 'cabinet') {
          rr(x, 0, 0, w, h, 3 * k); x.fillStyle = lin(x, 0, 0, w, 0, [[0, '#7b86a6'], [0.15, '#5d6888'], [0.85, '#4b5574'], [1, '#353d58']]); x.fill();
          x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, 0, w, 2 * k);
          for (let i = 0; i < 3; i++) {
            const Y = 3 * k + i * (h - 6 * k) / 3, dh = (h - 6 * k) / 3 - 2 * k;
            rr(x, 3 * k, Y, w - 6 * k, dh, 2 * k); x.fillStyle = lin(x, 0, Y, 0, Y + dh, [[0, '#6c7797'], [1, '#4a5372']]); x.fill();
            x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1; x.stroke();
            rr(x, w / 2 - 5 * k, Y + 5 * k, 10 * k, 3 * k, 1.5 * k); x.fillStyle = '#e4e7f2'; x.fill();
            x.fillStyle = '#f4f2ea'; x.fillRect(w / 2 - 4 * k, Y + dh - 6 * k, 8 * k, 3.5 * k);
          }
        } else {
          x.fillStyle = rad(x, w / 2, h / 2, 2, w * 0.9, [[0, 'rgba(255,59,107,.45)'], [1, 'rgba(255,59,107,0)']]); x.fillRect(-PAD, -PAD, w + PAD * 2, h + PAD * 2);
          rr(x, 0, 0, w, h, 4 * k); x.fillStyle = lin(x, 0, 0, 0, h, [[0, '#ffffff'], [1, '#dcd9ec']]); x.fill();
          x.save(); rr(x, 0, 0, w, h, 4 * k); x.clip(); x.fillStyle = lin(x, 0, 0, 0, h * 0.32, [[0, '#ff6b8b'], [1, '#e0204e']]); x.fillRect(0, 0, w, h * 0.32); x.restore();
          x.fillStyle = '#3a0414'; [0.28, 0.72].forEach(f => { rr(x, w * f - 1.5 * k, -2.5 * k, 3 * k, 5 * k, 1.5 * k); x.fill(); });
          x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${Math.round(h * 0.55)}px ${FONT}`; x.fillStyle = '#e0204e'; x.fillText('!', w / 2, h * 0.67);
        }
      });
    };
    const TW = Math.round(220 * k);
    const wallSpr = spr(`d23wall|${TW}x${H}`, TW, ground, (x, w) => {
      x.fillStyle = lin(x, 0, 0, 0, ground, [[0, '#1a1a33'], [0.7, '#15152a'], [1, '#101022']]); x.fillRect(0, 0, w, ground);
      x.fillStyle = '#1c1c35'; x.fillRect(0, 0, w, H * 0.08); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, H * 0.08, w, 1);
      x.fillStyle = '#1e1e3a'; x.fillRect(0, ground - 24 * k, w, 24 * k); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(0, ground - 24 * k, w, 1.5);
      // дверь
      const dx = 30 * k, dy = ground - 96 * k;
      rr(x, dx - 3 * k, dy - 3 * k, 58 * k, 99 * k, 4 * k); x.fillStyle = '#0f0f20'; x.fill();
      rr(x, dx, dy, 52 * k, 96 * k, 3 * k); x.fillStyle = lin(x, dx, 0, dx + 52 * k, 0, [[0, '#3a2d5c'], [1, '#2a2042']]); x.fill();
      rr(x, dx + 8 * k, dy + 10 * k, 36 * k, 26 * k, 2 * k); x.fillStyle = 'rgba(125,249,255,.18)'; x.fill();
      rr(x, dx + 8 * k, dy + 46 * k, 36 * k, 40 * k, 2 * k); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1.5; x.stroke();
      x.fillStyle = '#d4ff3a'; x.beginPath(); x.arc(dx + 44 * k, dy + 48 * k, 2.6 * k, 0, TAU); x.fill();
      // окно с ночным городом
      const wx = 120 * k, wy = ground - 120 * k, ww = 70 * k, wh = 50 * k;
      x.fillStyle = lin(x, 0, wy, 0, wy + wh, [[0, '#0a1a3a'], [1, '#26205a']]); x.fillRect(wx, wy, ww, wh);
      for (let i = 0; i < 6; i++) { const bx = wx + i * ww / 6, bh = wh * (0.3 + ((i * 53) % 5) / 9); x.fillStyle = '#0c0c1e'; x.fillRect(bx, wy + wh - bh, ww / 6 - 1, bh); x.fillStyle = 'rgba(255,211,77,.7)'; for (let j = 0; j < 4; j++) if ((i + j) % 3) x.fillRect(bx + 2 * k, wy + wh - bh + 4 * k + j * 6 * k, 2 * k, 2 * k); }
      x.strokeStyle = '#3c3c64'; x.lineWidth = 3 * k; x.strokeRect(wx, wy, ww, wh); x.lineWidth = 1.5 * k; x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.stroke();
      // светильник с конусом
      x.fillStyle = lin(x, 0, H * 0.08, 0, ground, [[0, 'rgba(255,250,220,.13)'], [1, 'rgba(255,250,220,0)']]);
      x.beginPath(); x.moveTo(140 * k, H * 0.08); x.lineTo(190 * k, H * 0.08); x.lineTo(205 * k, ground); x.lineTo(125 * k, ground); x.fill();
      rr(x, 138 * k, H * 0.08 - 1, 54 * k, 5 * k, 2 * k); x.fillStyle = '#fff6d0'; x.fill();
      // постер
      rr(x, 96 * k, ground - 70 * k, 14 * k, 20 * k, 2 * k); x.fillStyle = '#ff3bd4'; x.globalAlpha = 0.35; x.fill(); x.globalAlpha = 1;
    });
    const FW = Math.round(48 * k);
    const floorSpr = spr(`d23floor|${W}x${H}`, W + FW * 2, H - ground, (x, w, h) => {
      x.fillStyle = lin(x, 0, 0, 0, h, [[0, '#2a2a48'], [1, '#141426']]); x.fillRect(0, 0, w, h);
      x.fillStyle = lin(x, 0, 0, 0, h * 0.5, [[0, 'rgba(255,59,212,.16)'], [1, 'rgba(255,59,212,0)']]); x.fillRect(0, 2, w, h * 0.5);
      x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 2;
      for (let xx = 0; xx < w + FW; xx += FW) { x.beginPath(); x.moveTo(xx, 2); x.lineTo(xx - 30 * k, h); x.stroke(); }
      x.fillStyle = '#ff3bd4'; x.fillRect(0, 0, w, 2);
    });
    const drawP = () => {
      const x = P.x, y = P.y, sw = P.on ? Math.sin(phase) : 0.6;
      const sq = land < 0.15 ? 1 - Math.sin(land / 0.15 * Math.PI) * 0.12 : 1;
      // тень на полу
      const hgt = clamp((ground - y) / (120 * k), 0, 1);
      g.fillStyle = `rgba(0,0,0,${0.4 - hgt * 0.25})`; g.beginPath(); g.ellipse(x, ground + 2 * k, 14 * k * (1 - hgt * 0.5), 3.5 * k, 0, 0, TAU); g.fill();
      g.save(); g.translate(x, y); g.scale(1 / sq, sq); g.translate(-x, -y);
      g.lineCap = 'round'; g.strokeStyle = '#26264a'; g.lineWidth = 6 * k;
      g.beginPath(); g.moveTo(x, y - 20 * k); g.lineTo(x + sw * 9 * k, y - 2 * k); g.moveTo(x, y - 20 * k); g.lineTo(x - sw * 9 * k, y - (P.on ? 2 * k : 8 * k)); g.stroke();
      g.fillStyle = '#111'; [[x + sw * 9 * k, y - 1 * k], [x - sw * 9 * k, y - (P.on ? 1 * k : 7 * k)]].forEach(([a, b]) => { g.beginPath(); g.ellipse(a + 2 * k, b, 4.5 * k, 2.2 * k, 0, 0, TAU); g.fill(); });
      // рука сзади с портфелем
      g.strokeStyle = '#d9a982'; g.lineWidth = 4.5 * k; g.beginPath(); g.moveTo(x, y - 35 * k); const hx = x - sw * 10 * k, hy = y - 24 * k - (P.on ? 0 : 10 * k); g.lineTo(hx, hy); g.stroke();
      rr(g, hx - 7 * k, hy, 14 * k, 10 * k, 2 * k); g.fillStyle = '#6b4024'; g.fill(); g.fillStyle = '#d4a24c'; g.fillRect(hx - 1.5 * k, hy + 1.5 * k, 3 * k, 2 * k);
      rr(g, x - 9 * k, y - 40 * k, 18 * k, 22 * k, 5 * k); g.fillStyle = lin(g, x - 9 * k, 0, x + 9 * k, 0, [[0, '#1fb5b9'], [0.5, '#2de2e6'], [1, '#179aa0']]); g.fill();
      g.fillStyle = '#f4f2ea'; g.beginPath(); g.moveTo(x - 4 * k, y - 40 * k); g.lineTo(x + 4 * k, y - 40 * k); g.lineTo(x, y - 34 * k); g.fill();
      g.fillStyle = '#ff3bd4'; g.beginPath(); g.moveTo(x - 2 * k, y - 38 * k); g.lineTo(x + 2 * k, y - 38 * k); g.lineTo(x + 3 * k, y - 26 * k); g.lineTo(x, y - 23 * k); g.lineTo(x - 3 * k, y - 26 * k); g.fill();
      g.strokeStyle = '#f0c9a0'; g.lineWidth = 4.5 * k; g.beginPath(); g.moveTo(x, y - 35 * k); g.lineTo(x + sw * 10 * k, y - 26 * k - (P.on ? 0 : 10 * k)); g.stroke();
      g.fillStyle = '#f0c9a0'; g.beginPath(); g.arc(x + 1 * k, y - 47 * k, 7.5 * k, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,140,120,.5)'; g.beginPath(); g.arc(x + 4.5 * k, y - 44 * k, 1.8 * k, 0, TAU); g.fill();
      g.fillStyle = '#3a2516'; g.beginPath(); g.arc(x, y - 49 * k, 7.5 * k, Math.PI * 1.05, TAU * 0.98); g.fill();
      g.beginPath(); g.ellipse(x - 5 * k, y - 50 * k, 3.5 * k, 5 * k, 0.4, 0, TAU); g.fill();
      g.fillStyle = '#111'; g.fillRect(x + 4 * k, y - 48 * k, 2 * k, 2.4 * k);
      g.restore(); g.lineCap = 'butt';
    };
    loop(api, dt => {
      land += dt;
      if (state === 'run') {
        t += dt; speed = Math.min(640 * k, 240 * k + t * 9 * k); dist += speed * dt; scroll += speed * dt; phase += dt * speed / (22 * k);
        buf -= dt;
        if (buf > 0 && P.on) { P.vy = -720 * k; P.on = false; P.ht = 0; buf = 0; fx.burst(P.x, ground, { n: 6, kind: 'puff', cols: ['rgba(200,200,255,.35)'], sp: 70, grav: 0, life: 0.35, size: 3 * k }); }
        if (!P.on) {
          P.ht += dt; const low = P.hold && P.vy < 0 && P.ht < 0.28;
          P.vy += 2300 * k * (low ? 0.45 : 1) * dt; P.y += P.vy * dt;
          if (P.y >= ground) { P.y = ground; P.vy = 0; P.on = true; land = 0; fx.burst(P.x, ground, { n: 8, kind: 'puff', cols: ['rgba(200,200,255,.35)'], sp: 90, grav: 0, life: 0.35, size: 3 * k }); }
        } else if ((dust -= dt) <= 0) { dust = 0.13; fx.burst(P.x - 6 * k, ground - 1, { n: 1, kind: 'puff', cols: ['rgba(200,200,255,.22)'], sp: 30, grav: -20, life: 0.4, size: 2.5 * k, dir: Math.PI, spread: 0.6 }); }
        next -= speed * dt; if (next <= 0) spawn();
        for (let i = obs.length - 1; i >= 0; i--) {
          const o = obs[i]; o.x -= speed * dt; if (o.x + o.w < -30) { obs.splice(i, 1); continue; }
          if (o.id === 'deadline') o.b = ground - 58 * k + Math.sin((o.ph += dt * 4)) * 4 * k;
          const m = 4 * k;
          if (P.x + P.w / 2 - m > o.x && P.x - P.w / 2 + m < o.x + o.w && P.y - m > o.b - o.h && P.y - P.h + m < o.b) { crash(); break; }
        }
        upd();
      } else if (state === 'over') { /* застыли */ } else { phase += dt * 6; }
      // фон: коридор (параллакс из готовых плиток)
      const s1 = (scroll * 0.5) % TW;
      for (let x = -s1; x < W; x += TW) blit(g, wallSpr, x, 0);
      blit(g, floorSpr, -(scroll % FW), ground);
      // линии скорости
      if (state === 'run' && speed > 330 * k && !RM()) {
        const a = Math.min(0.18, (speed - 330 * k) / (1200 * k)); g.fillStyle = `rgba(200,220,255,${a})`;
        for (let i = 0; i < 5; i++) { const ly = H * (0.15 + i * 0.12), lx = W - ((scroll * (1.2 + i * 0.13) + i * 97) % (W + 160 * k)); g.fillRect(lx, ly, 70 * k, 1.5); }
      }
      obs.forEach(o => {
        blit(g, obsSpr(o), o.x - PAD, o.b - o.h - PAD);
        if (o.id === 'deadline') { g.strokeStyle = 'rgba(255,59,107,.55)'; g.lineWidth = 2; g.lineCap = 'round'; const top = o.b - o.h; g.beginPath(); g.moveTo(o.x + o.w + 5 * k, top + o.h * 0.3); g.lineTo(o.x + o.w + 18 * k, top + o.h * 0.3); g.moveTo(o.x + o.w + 5 * k, top + o.h * 0.7); g.lineTo(o.x + o.w + 13 * k, top + o.h * 0.7); g.stroke(); g.lineCap = 'butt'; }
      });
      drawP();
      fx.draw(g, dt);
      if (state === 'ready') veil(g, W, H, L('Коснитесь — прыжок', 'Tap to jump'), L('Держите дольше — прыжок выше', 'Hold longer to jump higher'), '🏃');
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
      const h = pill('⏱', `<b>${left}</b><small>${L('с', 's')}</small>`, left <= 10 && state === 'run' ? 'bgb3-hot' : '') + (streak >= 3 ? pill('🔥', `<b>×${streak}</b>`, 'bgb3-hot') : '') + pill('🗑️', `<small>${L('Спам', 'Spam')}</small><b>${score}</b><small>/${WIN}</small>`);
      if (hud._h !== h) { hud._h = h; hud.innerHTML = h; }
    };
    const overlay = el('div', 'bg24-start'), card = el('div', 'bg24-card', `<span class="bg24-big">📧</span><h3>${L('Входящие горят!', 'Inbox on fire!')}</h3>
      <div class="bg24-rule"><span>🤑</span><div><b>${L('Тапайте спам', 'Tap the spam')}</b><small>${L('«Вы выиграли!», скидки, принцы и казино', '“You won!”, discounts, princes and casinos')}</small></div></div>
      <div class="bg24-rule no"><span>👔</span><div><b>${L('Не трогайте рабочие', 'Leave work mail')}</b><small>${L('Письма от босса и коллег — штраф −2', 'Boss and coworkers — −2 penalty')}</small></div></div>`);
    const go = el('button', 'bgb3-btn', '▶ ' + L('Начать', 'Start')); go.type = 'button'; card.append(go); overlay.append(card); grid.append(overlay);
    go.onclick = () => { overlay.remove(); state = 'run'; api.sfx.sms?.(); };
    const popAt = (i, s, bad) => { const p = el('div', 'bg24-pop' + (bad ? ' bad' : ''), s); cells[i].append(p); later(api, 820, () => p.remove()); };
    const remove = (i, cls) => { const m = mails.get(i); if (!m) return; mails.delete(i); m.node.classList.add(cls); later(api, 320, () => m.node.remove()); };
    cells.forEach((c, i) => {
      on(api, c, 'pointerdown', e => {
        e.preventDefault(); const m = mails.get(i); if (!m || state !== 'run') return;
        if (m.spam) {
          streak++; const v = 1 + (streak % 5 === 0 ? 2 : 0); score += v; api.sfx.stapler?.(); tap(api); remove(i, 'bg24-hit'); popAt(i, (v > 1 ? '🔥 ' : '') + '+' + v);
        } else {
          streak = 0; score = Math.max(0, score - 2); api.sfx.buzzer?.(); mails.delete(i); m.node.classList.add('bg24-bad'); later(api, 320, () => m.node.remove()); popAt(i, '−2', true); shake(grid);
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
        m.life -= dt; const f = Math.max(0, m.life / m.max); m.bar.style.transform = `scaleX(${f})`; m.bar.style.backgroundPosition = `${f * 100}% 0`;
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
    const fx = parts(), rings = [];
    const upd = () => S.hudSet(pill('🪰', `<b>${killed}</b><small>/${TOTAL}</small>`) + pill('⏱', `<b>${t.toFixed(1)}</b><small>${L('с', 's')}</small>`) + hearts(lives));
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
      rings.push({ x: p.x, y: p.y, t: 0, c: hitFly ? '#d4ff3a' : hitHead ? '#ff3b6b' : 'rgba(255,255,255,.6)' });
      if (hitHead) { lives--; hitHead.angry = 1.4; api.sfx.buzzer?.(); popsAdd(pops, hitHead.x, hitHead.y - hr, L('Ай!', 'Ouch!'), '#ff3b6b'); S.shake(); }
      if (hitFly) {
        killed++; splats.push({ x: fly.x, y: fly.y, r: api.rng() * TAU });
        fx.burst(fly.x, fly.y, { n: 12, kind: 'spark', cols: ['#d4ff3a', '#fff', '#2a2a2a'], sp: 200, grav: 0, life: 0.45, size: 2.6 }); popsAdd(pops, fly.x, fly.y - 16 * u, L('Хлоп!', 'Splat!')); api.sfx.stamp?.(); fly = null; respawn = 0.7;
        if (killed >= TOTAL) { upd(); return finish(true); }
      } else if (fly) { fly.scare = 0.9; if (fly.st === 'land') { fly.st = 'fly'; fly.ft = 1 + api.rng(); fly.head = null; } fly.a += Math.PI * (0.5 + api.rng()); }
      upd();
      if (lives <= 0) finish(false);
    });
    // --- спрайты: сцена целиком, головы, мухобойка, клякса ---
    const scene = spr(`f25|${W}x${H}`, W, H, x => {
      x.fillStyle = lin(x, 0, 0, 0, H, [[0, '#1e2036'], [1, '#15162a']]); x.fillRect(0, 0, W, H);
      grain(x, W, H, W * H / 12, 'rgba(255,255,255,.035)', 1.5); grain(x, W, H, W * H / 14, 'rgba(0,0,0,.2)', 1.5);
      x.strokeStyle = 'rgba(120,130,220,.06)'; x.lineWidth = 1; const st = 26 * u;
      for (let d = -H; d < W + H; d += st) { x.beginPath(); x.moveTo(d, 0); x.lineTo(d + H, H); x.moveTo(d, H); x.lineTo(d + H, 0); x.stroke(); }
      x.save(); x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 26; x.shadowOffsetY = 10; rr(x, tx, tyy, tw, th, 26 * u); x.fillStyle = '#6b4a2e'; x.fill(); x.restore();
      x.save(); rr(x, tx, tyy, tw, th, 26 * u); x.clip();
      x.fillStyle = lin(x, tx, tyy, tx + tw, tyy + th, [[0, '#8a5f3a'], [0.5, '#6e4a2c'], [1, '#55371f']]); x.fillRect(tx, tyy, tw, th);
      x.strokeStyle = 'rgba(40,20,5,.22)'; x.lineWidth = 1;
      for (let i = 0; i < 26; i++) { const yy = tyy + Math.random() * th; x.beginPath(); x.moveTo(tx, yy); x.bezierCurveTo(tx + tw * 0.3, yy + (Math.random() - 0.5) * 18 * u, tx + tw * 0.7, yy + (Math.random() - 0.5) * 18 * u, tx + tw, yy + (Math.random() - 0.5) * 8 * u); x.stroke(); }
      x.fillStyle = lin(x, 0, tyy, 0, tyy + th, [[0, 'rgba(255,255,255,.12)'], [0.3, 'rgba(255,255,255,0)']]); x.fillRect(tx, tyy, tw, th);
      x.restore();
      rr(x, tx + 1, tyy + 1, tw - 2, th - 2, 25 * u); x.strokeStyle = 'rgba(255,220,170,.3)'; x.lineWidth = 1.5; x.stroke();
      rr(x, tx + 7 * u, tyy + 7 * u, tw - 14 * u, th - 14 * u, 20 * u); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; x.stroke();
      // ноутбуки
      [[0.28, 0.16, 1], [0.72, 0.16, 1], [0.28, 0.84, -1], [0.72, 0.84, -1]].forEach(([fx0, fy0, dir], i) => {
        const X = tx + tw * fx0, Y = tyy + th * fy0;
        x.save(); x.translate(X, Y); x.scale(1, dir);
        x.fillStyle = 'rgba(0,0,0,.3)'; rr(x, -17 * u, -9 * u, 36 * u, 24 * u, 3 * u); x.fill();
        rr(x, -17 * u, -11 * u, 34 * u, 10 * u, 2 * u); x.fillStyle = lin(x, 0, -11 * u, 0, -1 * u, [[0, '#2a2d40'], [1, '#4a4e66']]); x.fill();
        const sc = i % 2 ? '#2de2e6' : '#ff8be6';
        rr(x, -14 * u, -9.5 * u, 28 * u, 7 * u, 1.5 * u); x.fillStyle = sc; x.globalAlpha = 0.85; x.fill(); x.globalAlpha = 1;
        rr(x, -17 * u, -1 * u, 34 * u, 13 * u, 2.5 * u); x.fillStyle = lin(x, 0, -1 * u, 0, 12 * u, [[0, '#d6d9e8'], [1, '#9aa0b8']]); x.fill();
        x.fillStyle = 'rgba(0,0,0,.18)'; for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) x.fillRect(-14 * u + c * 3.2 * u, 1 * u + r * 2.6 * u, 2.4 * u, 1.8 * u);
        rr(x, -5 * u, 9 * u, 10 * u, 2.5 * u, 1 * u); x.fill();
        x.restore();
      });
      // кружки
      [[0.5, 0.3], [0.15, 0.62], [0.85, 0.4]].forEach(([fx0, fy0], i) => {
        const X = tx + tw * fx0, Y = tyy + th * fy0;
        x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.arc(X + 2 * u, Y + 3 * u, 8 * u, 0, TAU); x.fill();
        x.fillStyle = ['#f4f2ea', '#ff3bd4', '#2de2e6'][i]; x.beginPath(); x.arc(X, Y, 7.5 * u, 0, TAU); x.fill();
        x.fillRect(X + 6 * u, Y - 1.8 * u, 4 * u, 3.6 * u);
        x.fillStyle = rad(x, X - 1.5 * u, Y - 1.5 * u, 0, 5.5 * u, [[0, '#8a5530'], [1, '#3a200c']]); x.beginPath(); x.arc(X, Y, 5.3 * u, 0, TAU); x.fill();
        x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(X - 2 * u, Y - 2 * u, 1.8 * u, 0.9 * u, -0.6, 0, TAU); x.fill();
      });
      // бумаги
      x.save(); x.translate(tx + tw * 0.5, tyy + th * 0.62); x.rotate(0.2);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-18 * u, -12 * u, 40 * u, 28 * u);
      x.fillStyle = '#e8e6dc'; x.save(); x.rotate(-0.12); x.fillRect(-20 * u, -14 * u, 40 * u, 28 * u); x.restore();
      x.fillStyle = '#f8f6ee'; x.fillRect(-20 * u, -14 * u, 40 * u, 28 * u);
      x.fillStyle = '#b9b7c4'; for (let i = 0; i < 4; i++) x.fillRect(-15 * u, -9 * u + i * 6 * u, i === 3 ? 18 * u : 30 * u, 2 * u);
      x.fillStyle = '#ff3b6b'; x.fillRect(4 * u, 6 * u, 10 * u, 5 * u); x.restore();
      // растение в центре
      const px = tx + tw * 0.5, py = tyy + th * 0.46;
      x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.arc(px + 2 * u, py + 3 * u, 11 * u, 0, TAU); x.fill();
      x.fillStyle = '#c9cede'; x.beginPath(); x.arc(px, py, 9 * u, 0, TAU); x.fill();
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; x.fillStyle = i % 2 ? '#3fae5a' : '#2c8a45'; x.beginPath(); x.ellipse(px + Math.cos(a) * 7 * u, py + Math.sin(a) * 7 * u, 7 * u, 3.4 * u, a, 0, TAU); x.fill(); }
      x.fillStyle = '#5fd37a'; x.beginPath(); x.arc(px, py, 3.5 * u, 0, TAU); x.fill();
      x.fillStyle = rad(x, W / 2, H / 2, H * 0.3, H * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.45)']]); x.fillRect(0, 0, W, H);
    });
    const HS = Math.ceil(hr * 3.4);
    const headSpr = (i, angry) => spr(`f25h|${i}|${angry}|${HS}`, HS, HS, x => {
      x.translate(HS / 2, HS / 2);
      x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 8 * u; x.shadowOffsetX = 2 * u; x.shadowOffsetY = 3 * u;
      x.fillStyle = SHIRT[i]; x.beginPath(); x.ellipse(-hr * 0.7, 0, hr * 0.7, hr * 1.35, 0, 0, TAU); x.fill(); x.restore();
      x.fillStyle = lin(x, -hr * 1.4, 0, 0, 0, [[0, shade(SHIRT[i], -0.45)], [1, shade(SHIRT[i], 0.2)]]); x.beginPath(); x.ellipse(-hr * 0.7, 0, hr * 0.7, hr * 1.35, 0, 0, TAU); x.fill();
      x.fillStyle = '#f4f2ea'; x.beginPath(); x.moveTo(-hr * 0.2, -hr * 0.45); x.lineTo(hr * 0.05, 0); x.lineTo(-hr * 0.2, hr * 0.45); x.closePath(); x.fill();
      const skin = angry ? '#ff7b7b' : SKIN[i];
      x.fillStyle = skin; [-1, 1].forEach(sd => { x.beginPath(); x.ellipse(0, sd * hr * 0.78, hr * 0.16, hr * 0.12, 0, 0, TAU); x.fill(); });
      x.fillStyle = rad(x, hr * 0.2, -hr * 0.2, hr * 0.1, hr * 0.85, [[0, shade(skin, 0.25)], [1, shade(skin, -0.2)]]); x.beginPath(); x.arc(0, 0, hr * 0.78, 0, TAU); x.fill();
      x.fillStyle = HAIR[i]; x.beginPath(); x.arc(-hr * 0.12, 0, hr * 0.8, Math.PI * 0.58, Math.PI * 1.42); x.fill();
      x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.ellipse(-hr * 0.5, -hr * 0.25, hr * 0.15, hr * 0.32, 0.3, 0, TAU); x.fill();
      x.fillStyle = '#111'; x.beginPath(); x.arc(hr * 0.36, -hr * 0.25, hr * 0.08, 0, TAU); x.arc(hr * 0.36, hr * 0.25, hr * 0.08, 0, TAU); x.fill();
      x.fillStyle = shade(skin, -0.15); x.beginPath(); x.ellipse(hr * 0.62, 0, hr * 0.12, hr * 0.09, 0, 0, TAU); x.fill();
      if (angry) { x.strokeStyle = '#111'; x.lineWidth = hr * 0.07; x.beginPath(); x.moveTo(hr * 0.5, -hr * 0.4); x.lineTo(hr * 0.42, -hr * 0.14); x.moveTo(hr * 0.5, hr * 0.4); x.lineTo(hr * 0.42, hr * 0.14); x.stroke(); }
    });
    const FS = Math.ceil(22 * u);
    const flyBody = spr(`f25fly|${FS}`, FS, FS, x => {
      x.translate(FS / 2, FS / 2);
      x.fillStyle = rad(x, -1 * u, -1.5 * u, 0.5, 7 * u, [[0, '#4a5560'], [0.6, '#15181c'], [1, '#050506']]); x.beginPath(); x.ellipse(-1 * u, 0, 7 * u, 4.5 * u, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1; x.stroke();
      x.strokeStyle = 'rgba(160,200,140,.35)'; x.lineWidth = 0.8; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(-5 * u + i * 2.5 * u, -3.6 * u); x.lineTo(-5 * u + i * 2.5 * u, 3.6 * u); x.stroke(); }
      x.fillStyle = '#c0182c'; x.beginPath(); x.arc(5 * u, -2.2 * u, 2 * u, 0, TAU); x.arc(5 * u, 2.2 * u, 2 * u, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(5.6 * u, -2.8 * u, 0.7 * u, 0, TAU); x.arc(5.6 * u, 1.6 * u, 0.7 * u, 0, TAU); x.fill();
    });
    const SW = Math.ceil(44 * u), SH = Math.ceil(96 * u);
    const swatter = spr(`f25sw|${SW}`, SW, SH, x => {
      x.translate(SW / 2, 22 * u);
      x.fillStyle = lin(x, -3 * u, 0, 3 * u, 0, [[0, '#7a3cff'], [0.5, '#b58aff'], [1, '#5a20d0']]); rr(x, -3 * u, 16 * u, 6 * u, 56 * u, 3 * u); x.fill();
      rr(x, -19 * u, -19 * u, 38 * u, 38 * u, 8 * u); x.fillStyle = 'rgba(212,255,58,.35)'; x.fill();
      x.strokeStyle = '#d4ff3a'; x.lineWidth = 2.5 * u; x.stroke();
      x.save(); rr(x, -19 * u, -19 * u, 38 * u, 38 * u, 8 * u); x.clip(); x.strokeStyle = 'rgba(212,255,58,.75)'; x.lineWidth = 1;
      for (let j = -16; j <= 16; j += 5) { x.beginPath(); x.moveTo(j * u, -19 * u); x.lineTo(j * u, 19 * u); x.moveTo(-19 * u, j * u); x.lineTo(19 * u, j * u); x.stroke(); }
      x.restore();
    });
    const splatS = spr(`f25sp|${FS}`, FS * 1.4, FS * 1.4, (x, w) => {
      x.translate(w / 2, w / 2); x.fillStyle = 'rgba(40,25,12,.6)';
      x.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = (i % 2 ? 4 : 6.5) * u * (0.8 + Math.random() * 0.4); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill();
      for (let i = 0; i < 6; i++) { const a = Math.random() * TAU, r = (8 + Math.random() * 4) * u; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, (0.8 + Math.random()) * u, 0, TAU); x.fill(); }
    });
    const drawHead = h => {
      blitC(g, headSpr(h.i, h.angry > 0 ? 1 : 0), h.x, h.y, h.face);
      if (h.angry > 0) emo(g, '💢', 18 * u, h.x + hr * 0.6, h.y - hr * 0.6 - (1.4 - h.angry) * 6 * u);
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
      // сцена сверху (готовый спрайт)
      blit(g, scene, 0, 0);
      splats.forEach(s => blitC(g, splatS, s.x, s.y, s.r));
      heads.forEach(drawHead);
      if (fly) {
        const f = fly, lift = f.st === 'fly' ? 6 * u : 1.5 * u;
        g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(f.x + lift, f.y + lift * 1.3, 6 * u, 3.5 * u, f.a, 0, TAU); g.fill();
        if (f.st === 'fly') { g.strokeStyle = 'rgba(125,249,255,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x - Math.cos(f.a) * 18 * u, f.y - Math.sin(f.a) * 18 * u); g.stroke(); }
        g.save(); g.translate(f.x, f.y); g.rotate(f.a);
        const wo = f.st === 'fly' ? Math.sin(f.wing) * 0.5 : 0.15;
        g.fillStyle = 'rgba(220,240,255,.55)'; g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.8;
        g.beginPath(); g.ellipse(-3 * u, -5.5 * u, 7.5 * u, 3.5 * u, -0.7 - wo, 0, TAU); g.fill(); g.stroke();
        g.beginPath(); g.ellipse(-3 * u, 5.5 * u, 7.5 * u, 3.5 * u, 0.7 + wo, 0, TAU); g.fill(); g.stroke();
        g.drawImage(flyBody.c, -FS / 2, -FS / 2, FS, FS);
        g.restore();
      }
      for (let i = swats.length - 1; i >= 0; i--) {
        const s = swats[i]; s.t += dt; if (s.t > 0.22) { swats.splice(i, 1); continue; }
        const sc = 1.25 - 0.25 * easeOut(s.t / 0.08);
        g.save(); g.globalAlpha = 1 - Math.max(0, s.t - 0.1) / 0.12; g.translate(s.x, s.y); g.rotate(s.r); g.scale(sc, sc);
        g.drawImage(swatter.c, -SW / 2, -22 * u, SW, SH); g.restore();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.t += dt; if (r.t > 0.35) { rings.splice(i, 1); continue; }
        g.globalAlpha = 1 - r.t / 0.35; g.strokeStyle = r.c; g.lineWidth = 3 * (1 - r.t / 0.35) + 0.5;
        g.beginPath(); g.arc(r.x, r.y, (10 + easeOut(r.t / 0.35) * 26) * u, 0, TAU); g.stroke(); g.globalAlpha = 1;
      }
      fx.draw(g, dt);
      popsDraw(g, pops, dt, 18 * u);
      if (state === 'ready') veil(g, W, H, L('Коснитесь, чтобы начать', 'Tap to start'), L(`Прихлопните ${TOTAL} мух. Коллеги — не мухи!`, `Swat ${TOTAL} flies. Coworkers aren’t flies!`), '🪰');
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
    const fx = parts(); let hopT = 9, clock = 0;
    const upd = () => S.hudSet(pill('💺', `<b>${meters()}</b><small>${L('м', 'm')}</small>`) + pill('🏁', `<span class="bgb3-bar"><u style="width:${Math.min(100, meters() / WIN * 100)}%"></u></span><small>${WIN} ${L('м', 'm')}</small>`));
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
    // --- спрайты кресел ---
    const CX = Math.ceil(CW / 2 + 8 * u), CT = Math.ceil(40 * u), CB = Math.ceil(38 * u);
    const SEAT = { n: '#2de2e6', roll: '#ff3bd4', boost: '#d4ff3a', broken: '#7a6250' };
    const chairSpr = kind => spr(`j26|${kind}|${Math.round(CW)}`, CX * 2, CT + CB, x => {
      x.translate(CX, CT); const w = CW, seat = SEAT[kind];
      if (kind === 'boost') { x.fillStyle = rad(x, 0, 0, 2, w * 0.7, [[0, 'rgba(212,255,58,.35)'], [1, 'rgba(212,255,58,0)']]); x.fillRect(-CX, -CT, CX * 2, CT + CB); }
      // спинка
      rr(x, w * 0.24, -34 * u, w * 0.26, 36 * u, 7 * u); x.fillStyle = lin(x, w * 0.24, 0, w * 0.5, 0, [[0, '#2a2a48'], [0.45, '#4a4a78'], [1, '#22223c']]); x.fill();
      rr(x, w * 0.29, -30 * u, w * 0.08, 24 * u, 3 * u); x.fillStyle = 'rgba(255,255,255,.12)'; x.fill();
      x.fillStyle = '#5a5f78'; x.fillRect(w * 0.33, 0, 3 * u, 4 * u);
      // подлокотник
      x.strokeStyle = '#3a3a5c'; x.lineWidth = 3 * u; x.lineCap = 'round'; x.beginPath(); x.moveTo(-w * 0.22, -1 * u); x.lineTo(-w * 0.22, -9 * u); x.lineTo(w * 0.12, -9 * u); x.stroke();
      // сиденье
      rr(x, -w / 2, 0, w, 10 * u, 5 * u); x.fillStyle = lin(x, 0, 0, 0, 10 * u, [[0, shade(seat, 0.35)], [0.45, seat], [1, shade(seat, -0.45)]]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.45)'; rr(x, -w / 2 + 6 * u, 1.5 * u, w - 12 * u, 2 * u, 1 * u); x.fill();
      if (kind === 'broken') {
        x.strokeStyle = '#1a1010'; x.lineWidth = 1.8; x.lineCap = 'round'; x.beginPath(); x.moveTo(-4 * u, 0); x.lineTo(2 * u, 5 * u); x.lineTo(-2 * u, 10 * u); x.stroke();
        x.save(); x.translate(w * 0.18, 4 * u); x.rotate(0.5); x.fillStyle = 'rgba(240,230,190,.85)'; x.fillRect(-6 * u, -1.6 * u, 12 * u, 3.2 * u); x.rotate(-1); x.fillRect(-6 * u, -1.6 * u, 12 * u, 3.2 * u); x.restore();
      }
      // газлифт и крестовина
      x.fillStyle = lin(x, -3 * u, 0, 3 * u, 0, [[0, '#7a7f99'], [0.5, '#eef0f8'], [1, '#5a5f78']]); x.fillRect(-2.5 * u, 10 * u, 5 * u, 15 * u);
      x.fillStyle = '#23233a'; rr(x, -4 * u, 10 * u, 8 * u, 4 * u, 1.5 * u); x.fill();
      x.strokeStyle = '#8a8fa8'; x.lineWidth = 3.5 * u; x.lineCap = 'round';
      x.beginPath(); x.moveTo(-w * 0.36, 28 * u); x.lineTo(0, 25 * u); x.lineTo(w * 0.36, 28 * u); x.moveTo(0, 25 * u); x.lineTo(0, 28 * u); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-w * 0.34, 26.6 * u); x.lineTo(0, 23.8 * u); x.lineTo(w * 0.34, 26.6 * u); x.stroke();
      [-0.36, 0, 0.36].forEach(f => { x.fillStyle = '#0d0d14'; x.beginPath(); x.arc(w * f, 31 * u, 3.4 * u, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(w * f - 1 * u, 30 * u, 1 * u, 0, TAU); x.fill(); });
      if (kind === 'boost') {
        x.strokeStyle = '#d4ff3a'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-8 * u, -2 * u);
        for (let i = 0; i < 5; i++) x.lineTo((i % 2 ? -8 : 8) * u, -4 * u - i * 3 * u); x.stroke();
        x.fillStyle = '#d4ff3a'; x.font = `900 ${Math.round(9 * u)}px ${FONT}`; x.textAlign = 'center'; x.fillText('▲', 0, -22 * u);
      }
    });
    const drawChair = (c, sy) => {
      const s = chairSpr(c.kind), sq = c.hit != null && clock - c.hit < 0.18 ? Math.sin((clock - c.hit) / 0.18 * Math.PI) * 4 * u : 0;
      if (c.kind === 'broken' && c.gone) { g.save(); g.translate(c.x, sy); g.rotate(c.fall * 2); g.drawImage(s.c, -CX, -CT, s.w, s.h); g.restore(); }
      else g.drawImage(s.c, c.x - CX, sy - CT + sq, s.w, s.h);
      if (c.kind === 'roll' && c.vx) { const d = Math.sign(c.vx); g.strokeStyle = 'rgba(255,59,212,.45)'; g.lineWidth = 2; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const lx = c.x - d * (CW / 2 + 6 * u + i * 6 * u); g.beginPath(); g.moveTo(lx, sy + 4 * u + i * 6 * u); g.lineTo(lx - d * 8 * u, sy + 4 * u + i * 6 * u); g.stroke(); } g.lineCap = 'butt'; }
    };
    const WH = Math.round(120 * u);
    const wallT = spr(`j26w|${W}x${WH}`, W, WH, (x, w, h) => {
      x.fillStyle = '#121327'; x.fillRect(0, 0, w, h);
      for (let xx = 20 * u; xx < w; xx += 110 * u) {
        const X = xx, Y = 20 * u, ww = 70 * u, hh = 60 * u;
        x.fillStyle = lin(x, 0, Y, 0, Y + hh, [[0, '#0b1838'], [1, '#2a1f55']]); x.fillRect(X, Y, ww, hh);
        for (let i = 0; i < 5; i++) { const bh = hh * (0.25 + ((i * 7 + Math.round(xx)) % 5) / 8), bx = X + i * ww / 5; x.fillStyle = '#0a0a18'; x.fillRect(bx, Y + hh - bh, ww / 5 - 1, bh); x.fillStyle = 'rgba(255,211,77,.55)'; for (let j = 0; j < 5; j++) if ((i * 3 + j) % 4) x.fillRect(bx + 2 * u, Y + hh - bh + 3 * u + j * 5 * u, 1.6 * u, 1.6 * u); }
        x.strokeStyle = '#3a3c62'; x.lineWidth = 3 * u; x.strokeRect(X, Y, ww, hh); x.lineWidth = 1.5 * u; x.beginPath(); x.moveTo(X + ww / 2, Y); x.lineTo(X + ww / 2, Y + hh); x.stroke();
        x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.moveTo(X + 4 * u, Y + 4 * u); x.lineTo(X + 18 * u, Y + 4 * u); x.lineTo(X + 6 * u, Y + 30 * u); x.lineTo(X + 4 * u, Y + 30 * u); x.fill();
        x.fillStyle = '#1b1c36'; x.fillRect(X - 4 * u, Y + hh, ww + 8 * u, 4 * u);
      }
      x.fillStyle = 'rgba(255,255,255,.03)'; x.fillRect(0, h - 2, w, 2);
    });
    const vign = spr(`j26v|${W}x${H}`, W, H, x => { x.fillStyle = rad(x, W / 2, H / 2, H * 0.25, H * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.5)']]); x.fillRect(0, 0, W, H); });
    const drawP = sy => {
      const x = P.x, y = sy, up = P.vy < 0, sq = hopT < 0.16 ? 1 - Math.sin(hopT / 0.16 * Math.PI) * 0.16 : 1;
      g.save(); g.translate(x, y); g.scale(P.face / sq, sq);
      g.lineCap = 'round'; g.strokeStyle = '#26264a'; g.lineWidth = 5.5 * u;
      g.beginPath(); g.moveTo(-3 * u, -16 * u); g.lineTo(-5 * u, -1 * u); g.moveTo(3 * u, -16 * u); g.lineTo(up ? 7 * u : 5 * u, up ? -4 * u : -1 * u); g.stroke();
      g.fillStyle = '#111'; g.beginPath(); g.ellipse(-4 * u, 0, 4 * u, 2 * u, 0, 0, TAU); g.ellipse(up ? 8.5 * u : 6.5 * u, up ? -3 * u : 0, 4 * u, 2 * u, 0, 0, TAU); g.fill();
      rr(g, -9 * u, -36 * u, 18 * u, 21 * u, 5 * u); g.fillStyle = lin(g, -9 * u, 0, 9 * u, 0, [[0, '#e8901a'], [0.5, '#ffb02e'], [1, '#d07a10']]); g.fill();
      g.fillStyle = '#ff3bd4'; g.beginPath(); g.moveTo(-1.8 * u, -35 * u); g.lineTo(1.8 * u, -35 * u); g.lineTo(2.6 * u, -23 * u); g.lineTo(0, -20.5 * u); g.lineTo(-2.6 * u, -23 * u); g.fill();
      g.strokeStyle = '#f0c9a0'; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(-7 * u, -32 * u); g.lineTo(-13 * u, up ? -46 * u : -24 * u); g.moveTo(7 * u, -32 * u); g.lineTo(13 * u, up ? -46 * u : -24 * u); g.stroke();
      g.fillStyle = '#f0c9a0'; g.beginPath(); g.arc(0, -43 * u, 7.5 * u, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,140,120,.5)'; g.beginPath(); g.arc(3.5 * u, -40.5 * u, 1.7 * u, 0, TAU); g.fill();
      g.fillStyle = '#7a3b1e'; g.beginPath(); g.arc(-1 * u, -45 * u, 7.6 * u, Math.PI * 1.02, TAU * 0.99); g.fill();
      g.fillStyle = '#111'; g.fillRect(3 * u, -44.5 * u, 2 * u, 2.4 * u);
      if (up) { g.strokeStyle = '#111'; g.lineWidth = 1.2 * u; g.beginPath(); g.arc(3 * u, -39.5 * u, 2 * u, 0.2, Math.PI - 0.6); g.stroke(); }
      g.restore(); g.lineCap = 'butt';
    };
    loop(api, dt => {
      clock += dt; hopT += dt;
      if (state === 'run') {
        if (P.vy < -JV * 1.05 && !RM() && Math.random() < 0.6) fx.burst(P.x, P.y - camY - 10 * u, { n: 1, kind: 'spark', cols: ['#d4ff3a', '#fff'], sp: 40, grav: 0, life: 0.4, size: 2.2 });
        if (keys) { P.x += keys * 330 * u * dt; P.face = keys; }
        if (P.x < -P.w) P.x += W + P.w * 2; if (P.x > W + P.w) P.x -= W + P.w * 2;
        const prev = P.y; P.vy += GR * dt; P.y += P.vy * dt;
        if (P.vy > 0) for (const c of chairs) {
          if (c.gone || prev > c.y + 2 || P.y < c.y || Math.abs(P.x - c.x) > CW / 2 + 8 * u) continue;
          if (c.kind === 'broken') { c.gone = true; c.fall = 0; api.buzz?.('danger'); fx.burst(c.x, c.y - camY, { n: 10, cols: ['#8a6a50', '#4a3a2e'], sp: 160, life: 0.6, size: 4 }); popsAdd(pops, c.x, c.y - camY - 20 * u, L('хрусь!', 'crack!'), '#ff3b6b'); continue; }
          P.y = c.y; P.vy = c.kind === 'boost' ? -JV * 1.6 : -JV; tap(api); hopT = 0; c.hit = clock;
          fx.burst(P.x, c.y - camY, { n: 6, kind: 'puff', cols: ['rgba(255,255,255,.3)'], sp: 70, grav: 0, life: 0.35, size: 3 * u, dir: Math.PI / 2, spread: 2.5 });
          if (c.kind === 'boost') fx.burst(c.x, c.y - camY, { n: 18, kind: 'spark', cols: ['#d4ff3a', '#fff', '#2de2e6'], sp: 220, grav: 300, life: 0.6, size: 2.6 });
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
      // фон: стена бизнес-центра со скроллом (готовые плитки)
      const par = camY * 0.35;
      for (let y = -((-par) % WH) - WH; y < H + WH; y += WH) blit(g, wallT, 0, y);
      blit(g, vign, 0, 0);
      // отметки этажей каждые 25 м
      const fm = 25 * MPX;
      for (let n = Math.max(1, Math.floor((startY - camY - H) / fm)); n <= Math.ceil((startY - camY) / fm) + 1; n++) {
        const y = startY - n * fm - camY; if (y < -20 || y > H + 20) continue;
        g.strokeStyle = 'rgba(255,59,212,.35)'; g.lineWidth = 1.5; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.setLineDash([]);
        const lb = `${L('этаж', 'floor')} ${n + 1} · ${n * 25} ${L('м', 'm')}`; g.font = `800 ${Math.round(11 * u)}px ${FONT}`; const lw = g.measureText(lb).width + 14 * u;
        rr(g, W - 6 - lw, y - 18 * u, lw, 15 * u, 7.5 * u); g.fillStyle = 'rgba(40,10,40,.85)'; g.fill(); g.strokeStyle = 'rgba(255,59,212,.6)'; g.lineWidth = 1; g.stroke();
        txt(g, lb, W - 6 - lw / 2, y - 10.5 * u, 11 * u, '#ff8be6', 'center', 800);
      }
      chairs.forEach(c => { const sy = c.y - camY; if (sy > -60 && sy < H + 60) drawChair(c, sy); });
      fx.draw(g, dt);
      drawP(P.y - camY);
      popsDraw(g, pops, dt, 16 * u);
      if (state === 'ready') veil(g, W, H, L('Коснитесь и ведите пальцем', 'Touch and drag'), L('Влево-вправо — прыгайте по креслам выше', 'Left-right — bounce up the chairs'), '💺');
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
    const fx = parts(), trail = [];
    const upd = () => S.hudSet(pill('✈️', `<small>${L('Пролётов', 'Gaps')}</small><b>${score}</b>`) + pill('🏁', `<span class="bgb3-bar"><u style="width:${Math.min(100, score / WIN * 100)}%"></u></span><small>${WIN}</small>`));
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
    const crash = () => { if (state !== 'run') return; state = 'over'; api.sfx.stamp?.(); api.buzz?.('danger'); S.shake(); fx.burst(P.x, P.y, { n: 16, cols: ['#ffffff', '#c9d4ff', '#7df9ff'], sp: 200, life: 0.8, size: 5 }); later(api, 800, () => api.end({ score, won: score >= WIN, text: L(`Самолётик пролетел ${score} пролётов.`, `The plane cleared ${score} gaps.`) })); };
    // --- спрайты: воздуховод, плафон, конус света, шкафы, самолётик, фон ---
    const DW = Math.ceil(OW * 0.6);
    const duct = spr(`p27d|${DW}x${H}`, DW, H, (x, w, h) => {
      x.fillStyle = lin(x, 0, 0, w, 0, [[0, '#2a2e44'], [0.35, '#5a6080'], [0.6, '#454a66'], [1, '#22263a']]); x.fillRect(0, 0, w, h);
      for (let y = h - 8; y > 0; y -= 22 * k) { x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(0, y, w, 2); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, y + 2, w, 2); }
    });
    const LH = Math.ceil(30 * k), LW2 = Math.ceil(OW + 8 * u);
    const shadeS = spr(`p27s|${LW2}x${LH}`, LW2, LH + 6 * k, (x, w) => {
      const x0 = (w - OW) / 2;
      x.fillStyle = lin(x, x0, 0, x0 + OW, 0, [[0, '#1aa8ac'], [0.4, '#7df9ff'], [0.7, '#2de2e6'], [1, '#128a8e']]);
      x.beginPath(); x.moveTo(x0 + OW * 0.2, 0); x.lineTo(x0 + OW * 0.8, 0); x.lineTo(x0 + OW, 24 * k); x.lineTo(x0, 24 * k); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(x0 + OW * 0.22, 1, OW * 0.56, 1.5);
      x.fillStyle = rad(x, w / 2, 24 * k, 0, OW * 0.5, [[0, 'rgba(255,250,210,.9)'], [0.5, 'rgba(255,240,170,.35)'], [1, 'rgba(255,240,170,0)']]); x.fillRect(0, 14 * k, w, LH - 8 * k + 6 * k);
      x.fillStyle = '#fff6c8'; x.beginPath(); x.ellipse(w / 2, 24 * k, OW * 0.32, 4 * k, 0, 0, TAU); x.fill();
    });
    const CONE = Math.ceil(OW + 36 * u);
    const cone = spr(`p27c|${CONE}`, CONE, 200, (x, w, h) => {
      x.fillStyle = lin(x, 0, 0, 0, h, [[0, 'rgba(255,230,150,.26)'], [1, 'rgba(255,230,150,0)']]);
      x.beginPath(); x.moveTo(18 * u + 4 * u, 0); x.lineTo(w - 22 * u, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
    });
    const botSpr = (kind, v) => spr(`p27b|${kind}|${v}|${Math.round(OW)}x${H}`, OW, H + 12, (x, w, h) => {
      if (kind === 'cab') {
        rr(x, 0, 0, w, h, 4 * u); x.fillStyle = lin(x, 0, 0, w, 0, [[0, '#7b86a6'], [0.15, '#5d6888'], [0.85, '#4b5574'], [1, '#353d58']]); x.fill();
        x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(2, 0, w - 4, 2);
        for (let y = 6 * k; y < h; y += 38 * k) {
          rr(x, 4 * u, y, w - 8 * u, 32 * k, 2 * u); x.fillStyle = lin(x, 0, y, 0, y + 32 * k, [[0, '#6c7797'], [1, '#4a5372']]); x.fill(); x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1; x.stroke();
          rr(x, w / 2 - 6 * u, y + 6 * k, 12 * u, 3 * k, 1.5); x.fillStyle = '#e4e7f2'; x.fill();
          x.fillStyle = '#f4f2ea'; x.fillRect(w / 2 - 5 * u, y + 22 * k, 10 * u, 5 * k);
        }
      } else if (kind === 'shelf') {
        x.fillStyle = lin(x, 0, 0, w, 0, [[0, '#5a3d28'], [0.5, '#4a3423'], [1, '#3a2818']]); x.fillRect(0, 0, w, h);
        const cl = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ffb02e', '#5b5bd6'];
        for (let y = 4 * k, r = 0; y < h; y += 34 * k, r++) {
          for (let i = 0; i < 5; i++) {
            const c = cl[(i + r + v) % 5], bw = (w - 8 * u) / 5 - 2, bx = 4 * u + i * (w - 8 * u) / 5, bh = 28 * k - (i * 3 + r) % 4 * 2 * k;
            x.fillStyle = lin(x, bx, 0, bx + bw, 0, [[0, shade(c, -0.3)], [0.4, c], [1, shade(c, -0.4)]]); x.fillRect(bx, y + 28 * k - bh, bw, bh);
            x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(bx + 1, y + 28 * k - bh + 4 * k, bw - 2, 2 * k);
          }
          x.fillStyle = '#6b4a30'; x.fillRect(0, y + 28 * k, w, 4 * k); x.fillStyle = 'rgba(255,220,180,.25)'; x.fillRect(0, y + 28 * k, w, 1);
        }
      } else {
        for (let y = 0, i = 0; y < h; y += 30 * k, i++) {
          const c = i % 2 ? '#b97c40' : '#c98d4e', bx = (i % 2) * 3 * u;
          x.fillStyle = lin(x, bx, 0, bx + w - 3 * u, 0, [[0, shade(c, 0.15)], [1, shade(c, -0.25)]]); x.fillRect(bx, y, w - 3 * u, 29 * k);
          x.fillStyle = 'rgba(45,226,230,.75)'; x.fillRect(bx + (w - 3 * u) / 2 - 3 * u, y, 6 * u, 29 * k);
          x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(bx, y + 28 * k, w - 3 * u, 1.2);
          x.fillStyle = '#fbf6ea'; x.fillRect(bx + 4 * u, y + 6 * k, 10 * u, 7 * k);
        }
      }
    });
    const drawCol = c => {
      const x0 = c.x - OW / 2, top = c.y - c.gap / 2, bot = c.y + c.gap / 2;
      g.drawImage(cone.c, c.x - CONE / 2, top, CONE, c.gap);
      g.drawImage(duct.c, c.x - DW / 2, top - 24 * k - H, DW, H);
      g.drawImage(shadeS.c, c.x - LW2 / 2, top - 24 * k, shadeS.w, shadeS.h);
      const bs = botSpr(c.bot, Math.floor(c.hue * 5)); g.drawImage(bs.c, x0, bot, bs.w, bs.h);
    };
    const plane = spr(`p27pl|${Math.round(u * 100)}`, 40 * u, 26 * u, x => {
      x.translate(20 * u, 13 * u); x.scale(u, u);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.moveTo(17, 3); x.lineTo(-12, -5); x.lineTo(-12, 10); x.closePath(); x.fill();
      x.fillStyle = lin(x, -13, -8, 16, 0, [[0, '#e8ecff'], [1, '#ffffff']]); x.beginPath(); x.moveTo(16, 0); x.lineTo(-13, -8); x.lineTo(-7, 0); x.closePath(); x.fill();
      x.fillStyle = lin(x, -13, 7, 16, 0, [[0, '#9aa6e0'], [1, '#d4dcff']]); x.beginPath(); x.moveTo(16, 0); x.lineTo(-7, 0); x.lineTo(-13, 7); x.closePath(); x.fill();
      x.fillStyle = '#b8c4f4'; x.beginPath(); x.moveTo(16, 0); x.lineTo(-7, 0); x.lineTo(-9, 2.5); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(45,226,230,.9)'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(16, 0); x.lineTo(-10, 2.5); x.stroke();
      x.strokeStyle = 'rgba(255,59,212,.8)'; x.beginPath(); x.moveTo(2, -3.6); x.lineTo(-6, -6.4); x.stroke();
    });
    const TW = Math.round(140 * u);
    const bgT = spr(`p27bg|${TW}x${H}`, TW, H, (x, w, h) => {
      x.fillStyle = lin(x, 0, 0, 0, h, [[0, '#0b0b1a'], [1, '#111126']]); x.fillRect(0, 0, w, h);
      const X = 20 * u, Y = h * 0.25, ww = 100 * u, hh = h * 0.45;
      x.fillStyle = lin(x, 0, Y, 0, Y + hh, [[0, '#0a1430'], [0.7, '#1c1844'], [1, '#2a1a4a']]); x.fillRect(X, Y, ww, hh);
      for (let i = 0; i < 6; i++) {
        const bx = X + 4 * u + (i % 3) * 32 * u + (i > 2 ? 14 * u : 0), bh = hh * (0.35 + ((i * 37) % 50) / 100), bw = 18 * u;
        x.fillStyle = i > 2 ? '#0d0c20' : '#141230'; x.fillRect(bx, Y + hh - bh, bw, bh);
        x.fillStyle = 'rgba(255,211,77,.28)'; for (let r = 0; r < bh / (7 * k) - 1; r++) for (let c = 0; c < 3; c++) if ((r * 3 + c + i) % 4) x.fillRect(bx + 2.5 * u + c * 5 * u, Y + hh - bh + 4 * k + r * 7 * k, 2.2 * u, 2.6 * k);
      }
      x.strokeStyle = '#272a48'; x.lineWidth = 4 * u; x.strokeRect(X, Y, ww, hh); x.lineWidth = 2 * u; x.beginPath(); x.moveTo(X + ww / 2, Y); x.lineTo(X + ww / 2, Y + hh); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.05)'; x.beginPath(); x.moveTo(X + 6 * u, Y + 4 * u); x.lineTo(X + 26 * u, Y + 4 * u); x.lineTo(X + 8 * u, Y + hh * 0.6); x.lineTo(X + 6 * u, Y + hh * 0.6); x.fill();
      // силуэты столов и мониторов
      x.fillStyle = '#16162c'; x.fillRect(0, h * 0.82, w, 4 * k); x.fillRect(10 * u, h * 0.82, 3 * u, h * 0.18); x.fillRect(w - 20 * u, h * 0.82, 3 * u, h * 0.18);
      rr(x, 30 * u, h * 0.82 - 26 * k, 36 * u, 24 * k, 2 * u); x.fill(); x.fillStyle = 'rgba(45,226,230,.12)'; rr(x, 33 * u, h * 0.82 - 23 * k, 30 * u, 18 * k, 1.5 * u); x.fill();
      x.fillStyle = '#16162c'; x.fillRect(46 * u, h * 0.82 - 3 * k, 4 * u, 3 * k);
    });
    const frameS = spr(`p27f|${W}x${H}`, W, H, x => {
      x.fillStyle = lin(x, 0, 0, 0, 5 * u, [[0, '#2a2c48'], [1, '#16162a']]); x.fillRect(0, 0, W, 5 * u);
      x.fillStyle = lin(x, 0, H - 7 * u, 0, H, [[0, '#2a2c48'], [1, '#121224']]); x.fillRect(0, H - 7 * u, W, 7 * u);
      x.fillStyle = rad(x, W / 2, H / 2, H * 0.3, H * 0.8, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.45)']]); x.fillRect(0, 0, W, H);
    });
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
          if (!c.passed && c.x + OW / 2 < P.x - 12 * u) { c.passed = true; score++; api.sfx.sms?.(); popsAdd(pops, P.x, P.y - 24 * u, '+1'); fx.burst(P.x, P.y, { n: score === WIN ? 40 : 10, kind: score === WIN ? 'conf' : 'spark', cols: ['#d4ff3a', '#7df9ff', '#fff', '#ff3bd4'], sp: score === WIN ? 260 : 120, grav: score === WIN ? 300 : 0, life: 0.6, size: score === WIN ? 5 : 2.5 }); upd(); }
          if (Math.abs(c.x - P.x) < OW && hits(c)) crash();
        }
        if (P.y < 8 * u || P.y > H - 8 * u) crash();
      } else if (state === 'ready') { t += dt; P.y = H * 0.45 + Math.sin(t * 3) * 8 * k; }
      else if (state === 'over' && P.y < H - 10 * u) { P.vy += 900 * k * dt; P.y = Math.min(H - 10 * u, P.y + P.vy * dt); }
      P.rot = lerp(P.rot, clamp(P.vy / (700 * k), -0.45, 0.7), Math.min(1, dt * 10));
      // фон: ночной опенспейс с окнами (готовые плитки)
      const sx = (scroll * 0.25) % TW;
      for (let x = -sx; x < W; x += TW) blit(g, bgT, x, 0);
      cols.forEach(drawCol);
      blit(g, frameS, 0, 0);
      // след и самолётик
      if (state === 'run') { trail.push(P.x, P.y); if (trail.length > 24) trail.splice(0, 2); }
      const tsp = state === 'run' ? speed() * dt : 0;
      for (let i = 0; i < trail.length; i += 2) { trail[i] -= tsp; g.fillStyle = `rgba(125,249,255,${(i / trail.length) * 0.35})`; g.beginPath(); g.arc(trail[i] - 12 * u, trail[i + 1], 1.6 * u * (i / trail.length + 0.3), 0, TAU); g.fill(); }
      blitC(g, plane, P.x, P.y, P.rot);
      fx.draw(g, dt);
      popsDraw(g, pops, dt, 18 * u);
      if (state === 'ready') veil(g, W, H, L('Тап — подъём', 'Tap to lift'), L('Пролетайте между лампами и шкафами', 'Fly between the lamps and cabinets'), '✈️');
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
    const fx = parts();
    const upd = () => S.hudSet(pill('🗑️', `<small>${L('Попаданий', 'Hits')}</small><b>${hits}</b><small>/${WIN}</small>`) + `<span class="bgb3-pill" style="letter-spacing:1.5px;font-size:12px">${res.map(r => r ? '<span style="color:#d4ff3a">●</span>' : '<span style="color:#ff3b6b">✕</span>').join('')}<span style="opacity:.3">${'○'.repeat(THROWS - res.length)}</span></span>`);
    const walls = () => {
      const l = binX - BW / 2, r = binX + BW / 2, tp = floor - BH, inset = 6 * s;
      return [[l, tp, l + inset, floor], [r, tp, r - inset, floor]];
    };
    // --- спрайты: комната, корзина, шарик, плашка ветра ---
    const room = spr(`k28|${W}x${H}`, W, H, x => {
      x.fillStyle = lin(x, 0, 0, 0, floor, [[0, '#1a1b34'], [1, '#121228']]); x.fillRect(0, 0, W, floor);
      x.strokeStyle = 'rgba(255,255,255,.03)'; x.lineWidth = 1; for (let xx = 30 * s; xx < W; xx += 60 * s) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, floor - 40 * s); x.stroke(); }
      x.fillStyle = '#17182e'; x.fillRect(0, floor - 40 * s, W, 40 * s); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, floor - 40 * s, W, 1.5);
      // постер с графиком
      const px0 = W * 0.76, py0 = 70 * s; rr(x, px0, py0, 52 * s, 40 * s, 3 * s); x.fillStyle = '#23254a'; x.fill(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; x.stroke();
      x.strokeStyle = '#ff3bd4'; x.lineWidth = 2 * s; x.beginPath(); x.moveTo(px0 + 6 * s, py0 + 32 * s); x.lineTo(px0 + 18 * s, py0 + 22 * s); x.lineTo(px0 + 30 * s, py0 + 27 * s); x.lineTo(px0 + 46 * s, py0 + 9 * s); x.stroke();
      // пол
      x.fillStyle = lin(x, 0, floor, 0, H, [[0, '#3a2a22'], [1, '#22170f']]); x.fillRect(0, floor, W, H - floor);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; for (let i = -6; i < 14; i++) { x.beginPath(); x.moveTo(W / 2 + i * 34 * s, floor); x.lineTo(W / 2 + i * 60 * s, H); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(0, floor + 8 * s, W, 1);
      x.fillStyle = '#2de2e6'; x.fillRect(0, floor - 2, W, 2); x.fillStyle = 'rgba(45,226,230,.15)'; x.fillRect(0, floor, W, 6 * s);
      // кондиционер
      const ax = W * 0.5 - 52 * s, ay = 12 * s;
      x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 10 * s; x.shadowOffsetY = 4 * s;
      rr(x, ax, ay, 104 * s, 34 * s, 8 * s); x.fillStyle = '#e8ebf4'; x.fill(); x.restore();
      rr(x, ax, ay, 104 * s, 34 * s, 8 * s); x.fillStyle = lin(x, 0, ay, 0, ay + 34 * s, [[0, '#ffffff'], [0.6, '#e1e5f0'], [1, '#b8bdd0']]); x.fill();
      x.fillStyle = '#8a90a8'; for (let i = 0; i < 3; i++) { rr(x, ax + 10 * s, ay + 20 * s + i * 4 * s, 84 * s, 1.8 * s, 1); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(ax + 8 * s, ay + 3 * s, 70 * s, 1.5 * s);
      // стол игрока
      const dt0 = home.y + R, dw = home.x + 40 * s;
      x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(dw / 2, floor + 2 * s, dw * 0.6, 4 * s, 0, 0, TAU); x.fill();
      x.fillStyle = lin(x, 0, dt0 + 8 * s, 0, floor, [[0, '#3a2a1c'], [1, '#22170f']]); x.fillRect(8 * s, dt0 + 8 * s, 6 * s, floor - dt0 - 8 * s); x.fillRect(home.x + 26 * s, dt0 + 8 * s, 6 * s, floor - dt0 - 8 * s);
      rr(x, home.x - 8 * s, dt0 + 8 * s, 32 * s, 26 * s, 2 * s); x.fillStyle = '#4a3423'; x.fill(); rr(x, home.x + 4 * s, dt0 + 18 * s, 10 * s, 3 * s, 1.5); x.fillStyle = '#d4a24c'; x.fill();
      rr(x, -4, dt0, dw + 4, 9 * s, 2 * s); x.fillStyle = lin(x, 0, dt0, 0, dt0 + 9 * s, [[0, '#8a6040'], [0.3, '#6b4a2e'], [1, '#4a3220']]); x.fill();
      x.fillStyle = 'rgba(255,220,180,.35)'; x.fillRect(0, dt0, dw, 1.2);
      // стопка бумаг на столе
      x.fillStyle = '#e8e6dc'; x.fillRect(10 * s, dt0 - 6 * s, 22 * s, 6 * s); x.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 1; i < 4; i++) x.fillRect(10 * s, dt0 - i * 1.6 * s, 22 * s, 0.6);
      x.fillStyle = rad(x, W / 2, H / 2, H * 0.3, H * 0.8, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.4)']]); x.fillRect(0, 0, W, H);
    });
    const binS = spr(`k28b|${Math.round(BW)}x${Math.round(BH)}`, BW + 20 * s, BH + 14 * s, x => {
      x.translate(10 * s, 6 * s); const l = 0, r = BW, tp = 0, fl = BH;
      x.fillStyle = 'rgba(0,0,0,.4)'; x.beginPath(); x.ellipse(BW / 2, fl + 1 * s, BW * 0.55, 4 * s, 0, 0, TAU); x.fill();
      x.beginPath(); x.moveTo(l, tp); x.lineTo(r, tp); x.lineTo(r - 6 * s, fl); x.lineTo(l + 6 * s, fl); x.closePath();
      x.fillStyle = lin(x, 0, 0, BW, 0, [[0, '#1e1f3a'], [0.35, '#3a3c68'], [0.6, '#2c2d52'], [1, '#17182e']]); x.fill();
      x.save(); x.clip(); x.strokeStyle = 'rgba(255,59,212,.45)'; x.lineWidth = 1.1;
      for (let i = 1; i < 8; i++) { const f = i / 8; x.beginPath(); x.moveTo(l + BW * f, tp); x.lineTo(l + 6 * s + (BW - 12 * s) * f, fl); x.stroke(); }
      for (let yy = 10 * s; yy < BH; yy += 12 * s) { x.beginPath(); x.moveTo(0, yy); x.lineTo(BW, yy); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(BW * 0.18, 0, BW * 0.12, BH);
      x.restore();
      x.fillStyle = '#d0d4e6'; x.fillRect(l + 6 * s, fl - 3 * s, BW - 12 * s, 3 * s);
      rr(x, l - 2, tp - 3 * s, BW + 4, 5 * s, 2.5 * s); x.fillStyle = lin(x, 0, tp - 3 * s, 0, tp + 2 * s, [[0, '#ff9be8'], [1, '#d01ea8']]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(l + 4 * s, tp - 2.4 * s, BW * 0.5, 1);
    });
    const ballS = spr(`k28p|${Math.round(R * 10)}`, R * 2.6, R * 2.6, (x, w) => {
      x.translate(w / 2, w / 2);
      x.fillStyle = rad(x, -R * 0.35, -R * 0.35, R * 0.1, R * 1.1, [[0, '#ffffff'], [0.6, '#ecebf2'], [1, '#b6b4c8']]);
      x.beginPath(); for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, r2 = R * (i % 2 ? 0.84 : 1.06); x.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } x.closePath(); x.fill();
      x.strokeStyle = 'rgba(120,118,150,.7)'; x.lineWidth = 0.9;
      [[-0.5, -0.2, 0.3, 0.1, 0.1, 0.6], [-0.6, 0.4, -0.1, 0.2, 0.2, -0.6], [0.5, -0.6, 0.2, -0.1]].forEach(pts => { x.beginPath(); x.moveTo(pts[0] * R, pts[1] * R); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i] * R, pts[i + 1] * R); x.stroke(); });
      x.fillStyle = 'rgba(90,120,255,.35)'; x.fillRect(-R * 0.6, R * 0.05, R * 0.9, 0.8);
    });
    const windBadge = w => spr(`k28w|${w}|${Math.round(s * 100)}`, 120 * s, 28 * s, (x, bw, bh) => {
      const lbl = w ? `${L('ветер', 'wind')} ${Math.abs(w)}` : L('штиль', 'calm'), col = w ? '#7df9ff' : '#d4ff3a';
      x.font = `800 ${Math.round(12 * s)}px ${FONT}`; const tw = x.measureText(lbl).width + (w ? 30 * s : 18 * s), x0 = (bw - tw) / 2;
      rr(x, x0, 3 * s, tw, bh - 6 * s, (bh - 6 * s) / 2); x.fillStyle = 'rgba(10,12,30,.85)'; x.fill(); x.strokeStyle = w ? 'rgba(125,249,255,.55)' : 'rgba(212,255,58,.55)'; x.lineWidth = 1; x.stroke();
      x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = col;
      if (w) { const d = Math.sign(w), cx = x0 + 13 * s, cy = bh / 2; x.beginPath(); x.moveTo(cx + d * 6 * s, cy); x.lineTo(cx - d * 3 * s, cy - 5 * s); x.lineTo(cx - d * 3 * s, cy + 5 * s); x.closePath(); x.fill(); x.fillText(lbl, x0 + 22 * s, bh / 2 + 0.5); }
      else x.fillText(lbl, x0 + 9 * s, bh / 2 + 0.5);
    });
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
      if (hit) { hits++; api.sfx.item?.(); popsAdd(pops, binX, floor - BH - 20 * s, L('Есть!', 'Score!')); fx.burst(binX, floor - BH, { n: 30, sp: 260, up: 160, life: 0.9, size: 5 * s, dir: -Math.PI / 2, spread: 1.6 }); }
      else { popsAdd(pops, ball.x, ball.y - 20 * s, L('мимо', 'miss'), '#ff3b6b'); fx.burst(ball.x, Math.min(ball.y + R, floor), { n: 6, kind: 'puff', cols: ['rgba(255,255,255,.25)'], sp: 60, grav: 0, life: 0.4, size: 3 * s, dir: -Math.PI / 2, spread: 2.5 }); }
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
      // комната (готовый фон), кондиционер, ветер
      blit(g, room, 0, 0);
      const ax = W * 0.5 - 52 * s, ay = 12 * s;
      g.fillStyle = wind ? '#2de2e6' : '#d4ff3a'; g.beginPath(); g.arc(ax + 94 * s, ay + 9 * s, 2.5 * s, 0, TAU); g.fill();
      g.fillStyle = wind ? 'rgba(45,226,230,.3)' : 'rgba(212,255,58,.3)'; g.beginPath(); g.arc(ax + 94 * s, ay + 9 * s, 5 * s, 0, TAU); g.fill();
      const wy = ay + 52 * s;
      if (wind) {
        const dir = Math.sign(wind);
        g.lineCap = 'round';
        flow.forEach(f => { f.x += wind * 60 * s * dt; if (f.x > W + 40) f.x = -40; if (f.x < -40) f.x = W + 40; const l = f.l * s * (0.6 + Math.abs(wind) * 0.2); g.strokeStyle = 'rgba(125,249,255,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x - dir * l, f.y); g.stroke(); g.fillStyle = 'rgba(125,249,255,.3)'; g.beginPath(); g.arc(f.x, f.y, 1.5, 0, TAU); g.fill(); });
        g.lineCap = 'butt';
      }
      blitC(g, windBadge(wind), W / 2, wy + 6 * s);
      // корзина и шарик
      blit(g, binS, binX - BW / 2 - 10 * s, floor - BH - 6 * s);
      if (state !== 'wait' || !res[res.length - 1]) {
        if (ball.y < floor - R - 2) { const hh = clamp((floor - ball.y) / (300 * s), 0, 1); g.fillStyle = `rgba(0,0,0,${0.3 - hh * 0.2})`; g.beginPath(); g.ellipse(ball.x, floor + 2 * s, R * (1.2 - hh * 0.5), 3 * s, 0, 0, TAU); g.fill(); }
        blitC(g, ballS, ball.x, ball.y, ball.rot);
      }
      if (aim && state === 'aim') {
        const [vx, vy] = vel(aim), pw = Math.hypot(vx, vy) / (980 * s);
        g.strokeStyle = `rgba(212,255,58,${0.25 + pw * 0.4})`; g.lineWidth = 3 * s; g.beginPath(); g.arc(ball.x, ball.y, R + 6 * s, -Math.PI / 2, -Math.PI / 2 + pw * TAU); g.stroke();
        const col = pw > 0.8 ? '255,176,46' : '212,255,58';
        for (let i = 1; i <= 7; i++) { const f = i / 7; g.fillStyle = `rgba(${col},${(0.4 + pw * 0.5) * (1 - f * 0.55)})`; g.beginPath(); g.arc(ball.x + vx * 0.09 * f, ball.y + vy * 0.09 * f, (3.4 - f * 1.6) * s, 0, TAU); g.fill(); }
      }
      fx.draw(g, dt);
      popsDraw(g, pops, dt, 18 * s);
      if (state === 'aim' && n === 0 && !aim) otxt(g, L('Смахните вверх-вправо, чтобы бросить', 'Swipe up and right to throw'), W / 2, H * 0.42, 14 * s, '#e6e3ff', 'center', 800);
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
    const fx = parts();
    const upd = () => S.hudSet(pill('🎳', `<small>${L('Фрейм', 'Frame')}</small><b>${Math.min(frame, FRAMES)}</b><small>/${FRAMES} · ${L('бросок', 'roll')}</small><b>${roll}</b>`) + pill('🥤', `<small>${L('Сбито', 'Pins')}</small><b>${total}</b><small>/${WIN}</small>`));
    // --- спрайты: дорожка, стаканчики, бутылка ---
    const laneS = spr(`w29|${W}x${H}`, W, H, x => {
      x.fillStyle = '#0b0b18'; x.fillRect(0, 0, W, H);
      x.fillStyle = lin(x, 0, 0, lx0 - 20 * s, 0, [[0, '#14142a'], [1, '#1f1a34']]); x.fillRect(0, 0, lx0 - 20 * s, H);
      x.fillStyle = lin(x, lx1 + 20 * s, 0, W, 0, [[0, '#1f1a34'], [1, '#14142a']]); x.fillRect(lx1 + 20 * s, 0, W - lx1 - 20 * s, H);
      x.fillStyle = '#ff3bd4'; x.fillRect(lx0 - 22 * s, 0, 2, H); x.fillRect(lx1 + 20 * s, 0, 2, H);
      x.fillStyle = 'rgba(255,59,212,.15)'; x.fillRect(lx0 - 30 * s, 0, 8 * s, H); x.fillRect(lx1 + 22 * s, 0, 8 * s, H);
      [[lx0 - 18 * s], [lx1 + 2 * s]].forEach(([gx0]) => { x.fillStyle = lin(x, gx0, 0, gx0 + 16 * s, 0, [[0, '#2a2c40'], [0.5, '#0c0c16'], [1, '#2a2c40']]); x.fillRect(gx0, 0, 16 * s, H); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(gx0 + 1, 0, 1, H); });
      x.fillStyle = '#1f1a2c'; x.fillRect(lx0 - 2 * s, 0, 2 * s, H); x.fillRect(lx1, 0, 2 * s, H);
      const pl = 12, pw = LW / pl;
      for (let i = 0; i < pl; i++) {
        const v = ((i * 7) % 5) / 5; x.fillStyle = `rgb(${176 + v * 20 | 0},${122 + v * 16 | 0},${70 + v * 10 | 0})`; x.fillRect(lx0 + i * pw, laneTop, pw + 0.5, H - laneTop);
        x.strokeStyle = 'rgba(90,50,20,.18)'; x.lineWidth = 0.8;
        for (let j = 0; j < 3; j++) { const gx1 = lx0 + i * pw + 2 + Math.random() * (pw - 4); x.beginPath(); x.moveTo(gx1, laneTop); x.bezierCurveTo(gx1 + 1.5, H * 0.3, gx1 - 1.5, H * 0.7, gx1, H); x.stroke(); }
        x.fillStyle = 'rgba(60,30,10,.3)'; x.fillRect(lx0 + i * pw, laneTop, 1, H - laneTop);
      }
      x.fillStyle = lin(x, lx0, 0, lx1, 0, [[0, 'rgba(0,0,0,.25)'], [0.3, 'rgba(255,255,255,.08)'], [0.5, 'rgba(255,255,255,.16)'], [0.7, 'rgba(255,255,255,.08)'], [1, 'rgba(0,0,0,.25)']]); x.fillRect(lx0, laneTop, LW, H - laneTop);
      x.fillStyle = lin(x, 0, laneTop, 0, headY + DY, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); x.fillRect(lx0, laneTop, LW, headY + DY - laneTop);
      x.fillStyle = 'rgba(255,255,255,.18)'; pins.forEach(p => { x.beginPath(); x.arc(p.ox, p.oy, RP * 0.35, 0, TAU); x.fill(); });
      x.fillStyle = lin(x, 0, 0, 0, laneTop, [[0, '#020206'], [1, '#0a0a14']]); x.fillRect(lx0 - 20 * s, 0, LW + 40 * s, laneTop);
      x.fillStyle = 'rgba(255,59,212,.5)'; x.fillRect(lx0 - 20 * s, laneTop - 2, LW + 40 * s, 2);
      x.fillStyle = '#ff3bd4'; x.fillRect(lx0, foul, LW, 2.5); x.fillStyle = 'rgba(255,59,212,.2)'; x.fillRect(lx0, foul - 3, LW, 8);
      [-2, -1, 0, 1, 2].forEach(i => { const ax = cx + i * LW / 7, ay = H * 0.55; x.fillStyle = '#1a6a70'; x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax - 5 * s, ay + 11 * s); x.lineTo(ax + 5 * s, ay + 11 * s); x.closePath(); x.fill(); x.fillStyle = '#2de2e6'; x.beginPath(); x.moveTo(ax, ay - 1); x.lineTo(ax - 4 * s, ay + 9 * s); x.lineTo(ax + 4 * s, ay + 9 * s); x.closePath(); x.fill(); });
      [-2, -1, 0, 1, 2].forEach(i => { x.fillStyle = 'rgba(40,20,5,.45)'; x.beginPath(); x.arc(cx + i * LW / 7, foul + 26 * s, 2.2 * s, 0, TAU); x.fill(); });
    });
    const cupUp = spr(`w29u|${Math.round(RP * 10)}`, RP * 3, RP * 3, (x, w) => {
      x.translate(w / 2, w / 2);
      x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.arc(1.5 * s, 2 * s, RP * 1.05, 0, TAU); x.fill();
      x.fillStyle = lin(x, -RP, -RP, RP, RP, [[0, '#ffffff'], [1, '#c9cada']]); x.beginPath(); x.arc(0, 0, RP, 0, TAU); x.fill();
      x.strokeStyle = '#ff3bd4'; x.lineWidth = 1.8 * s; x.beginPath(); x.arc(0, 0, RP * 0.84, 0, TAU); x.stroke();
      x.fillStyle = rad(x, RP * 0.15, RP * 0.15, 0, RP * 0.7, [[0, '#f4f4fb'], [1, '#9ea0b8']]); x.beginPath(); x.arc(0, 0, RP * 0.68, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(-RP * 0.4, -RP * 0.45, RP * 0.18, 0, TAU); x.fill();
    });
    const cupDown = spr(`w29d|${Math.round(RP * 10)}`, RP * 3, RP * 3, (x, w) => {
      x.translate(w / 2, w / 2);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.moveTo(-RP * 1.1, -RP * 0.5); x.lineTo(RP * 1.2, -RP * 0.3); x.lineTo(RP * 1.2, RP * 0.75); x.lineTo(-RP * 1.1, RP * 0.95); x.closePath(); x.fill();
      x.fillStyle = lin(x, 0, -RP * 0.7, 0, RP * 0.7, [[0, '#ffffff'], [0.5, '#e6e6f0'], [1, '#a9aac0']]);
      x.beginPath(); x.moveTo(-RP * 1.1, -RP * 0.7); x.lineTo(RP * 1.1, -RP * 0.45); x.lineTo(RP * 1.1, RP * 0.45); x.lineTo(-RP * 1.1, RP * 0.7); x.closePath(); x.fill();
      x.fillStyle = '#ff3bd4'; x.fillRect(-RP * 0.2, -RP * 0.6, RP * 0.4, RP * 1.2);
      x.fillStyle = '#d8d8e4'; x.beginPath(); x.ellipse(-RP * 1.1, 0, RP * 0.2, RP * 0.7, 0, 0, TAU); x.fill();
    });
    const bottle = spr(`w29b|${Math.round(RB * 10)}`, RB * 2.6, RB * 1.6, (x, w, h) => {
      x.translate(w / 2 - RB * 0.37, h / 2);
      x.fillStyle = 'rgba(0,0,0,.3)'; rr(x, -RB + 2 * s, -RB * 0.55 + 3 * s, RB * 2, RB * 1.1, RB * 0.5); x.fill();
      rr(x, -RB, -RB * 0.55, RB * 1.75, RB * 1.1, RB * 0.5); x.fillStyle = lin(x, 0, -RB * 0.55, 0, RB * 0.55, [[0, 'rgba(200,250,255,.95)'], [0.4, 'rgba(125,249,255,.8)'], [1, 'rgba(40,140,170,.9)']]); x.fill();
      x.fillStyle = lin(x, 0, -RB * 0.55, 0, RB * 0.55, [[0, '#7df9ff'], [0.5, '#2de2e6'], [1, '#128a8e']]); x.fillRect(-RB * 0.35, -RB * 0.55, RB * 0.55, RB * 1.1);
      x.fillStyle = '#fff'; x.fillRect(-RB * 0.25, -RB * 0.12, RB * 0.35, RB * 0.24);
      rr(x, RB * 0.72, -RB * 0.28, RB * 0.32, RB * 0.56, 2 * s); x.fillStyle = lin(x, 0, -RB * 0.28, 0, RB * 0.28, [[0, '#8a8af0'], [1, '#3a3ab0']]); x.fill();
      x.fillStyle = 'rgba(255,255,255,.7)'; rr(x, -RB * 0.85, -RB * 0.42, RB * 1.4, RB * 0.14, RB * 0.07); x.fill();
    });
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
      if (strike || spare) { api.sfx.coins?.(); fx.burst(cx, H * 0.45, { n: 50, sp: 330, up: 120, life: 1.1, size: 6 * s }); } else if (cnt) { api.sfx.item?.(); fx.burst(cx, headY - DY * 1.5, { n: 12, kind: 'spark', cols: ['#7df9ff', '#fff'], sp: 160, grav: 0, life: 0.5, size: 2.5 * s }); }
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
            if (!ball.gutter && (ball.x < lx0 + RB * 0.3 || ball.x > lx1 - RB * 0.3)) { ball.gutter = true; ball.x = ball.x < cx ? lx0 - 9 * s : lx1 + 9 * s; ball.vx = 0; ball.vy = Math.min(ball.vy, -300 * s); api.buzz?.('danger'); S.shake(); }
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
      // дорожка (готовый фон)
      blit(g, laneS, 0, 0);
      // стаканчики
      pins.forEach(p => {
        if (p.gone && state !== 'roll') return;
        if (p.down) blitC(g, cupDown, p.x, p.y, p.a); else blitC(g, cupUp, p.x + 1.5 * s, p.y + 1.5 * s);
      });
      // бутылка (лежит поперёк хода и катится)
      if (!ball.gone) {
        const dir = Math.hypot(ball.vx, ball.vy) > 1 ? Math.atan2(ball.vy, ball.vx) + Math.PI / 2 : 0;
        g.save(); g.translate(ball.x, ball.y); g.rotate(dir);
        g.drawImage(bottle.c, -bottle.w / 2 + RB * 0.37, -bottle.h / 2, bottle.w, bottle.h);
        const sh = (ball.a % 1) * RB * 1.1 - RB * 0.55; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-RB * 0.9, sh, RB * 1.5, 1.5 * s);
        g.restore();
      }
      fx.draw(g, dt);
      if (aim && aim.pts.length > 1) {
        const a0 = aim.pts[0], a1 = aim.pts[aim.pts.length - 1];
        g.strokeStyle = 'rgba(212,255,58,.7)'; g.lineWidth = 3; g.lineCap = 'round'; g.setLineDash([2, 8]); g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke(); g.setLineDash([]); g.lineCap = 'butt';
        const an = Math.atan2(a1.y - a0.y, a1.x - a0.x); g.fillStyle = '#d4ff3a'; g.beginPath(); g.moveTo(a1.x + Math.cos(an) * 9, a1.y + Math.sin(an) * 9); g.lineTo(a1.x + Math.cos(an + 2.5) * 8, a1.y + Math.sin(an + 2.5) * 8); g.lineTo(a1.x + Math.cos(an - 2.5) * 8, a1.y + Math.sin(an - 2.5) * 8); g.closePath(); g.fill();
      }
      popsDraw(g, pops, dt, 24 * s);
      if (state === 'aim' && !aim && frame === 1 && roll === 1) otxt(g, L('Смахните бутылку вверх', 'Swipe the bottle up'), cx, H * 0.62, 14 * s, '#f2f0ff', 'center', 800);
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
    const fx = parts(), pops = [];
    const upd = () => S.hudSet(pill('⏱', `<small>${L('Раунд', 'Round')}</small><b>${Math.min(round + 1, ROUNDS)}</b><small>/${ROUNDS}</small>`) + pill('⭐', `<small>${L('Очки', 'Score')}</small><b>${total}</b><small>/${WIN}</small>`));
    const fmt = m => { const mm = ((Math.floor(m) % 1440) + 1440) % 1440; return `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`; };
    const startRound = () => { tm = T0 + api.rng() * SPAN * 0.35 + (api.rng() < 0.5 ? 0 : SPAN * 0.6); dir = 1; state = 'run'; btn.disabled = false; btn.textContent = '⏹ ' + L('Стоп!', 'Stop!'); upd(); };
    const stop = () => {
      if (state === 'ready') { startRound(); return; }
      if (state !== 'run') return;
      state = 'shown'; show = 0; btn.disabled = true;
      const err = Math.abs(tm - TARGET); lastErr = err;
      lastPts = err < 0.5 ? 120 : Math.max(0, Math.round(100 - err * 4));
      total += lastPts; round++;
      const sp = el('span', lastPts >= 80 ? 'bgb3-ok' : lastPts < 40 ? 'bg30-bad' : '', `${fmt(tm)} · +${lastPts}`); logEl.append(sp);
      if (lastPts >= 100) api.sfx.coins?.(); else if (lastPts >= 60) api.sfx.item?.(); else api.sfx.stamp?.();
      popsAdd(pops, W / 2, ccy + R * 0.35, '+' + lastPts, lastPts >= 80 ? '#d4ff3a' : lastPts >= 40 ? '#7df9ff' : '#ff3b6b');
      if (lastPts >= 100) fx.burst(W / 2, ccy, { n: 56, sp: 360, up: 120, life: 1.2, size: 6 });
      else if (lastPts >= 60) fx.burst(W / 2, ccy + R + 30, { n: 16, kind: 'spark', cols: ['#d4ff3a', '#fff', '#7df9ff'], sp: 200, grav: 0, life: 0.6, size: 2.6 });
      else if (lastPts < 40) S.shake();
      upd();
      later(api, 1400, () => {
        if (round >= ROUNDS) { state = 'over'; api.end({ score: total, won: total >= WIN, text: L(`Сумма за ${ROUNDS} раундов: ${total}. Цель — ${WIN}.`, `Total over ${ROUNDS} rounds: ${total}. Goal: ${WIN}.`) }); }
        else startRound();
      });
    };
    btn.textContent = '▶ ' + L('Старт', 'Start');
    // --- спрайты: фон, циферблат, шкала ---
    const R = Math.max(40, Math.min(W * 0.3, (H - 148) / 2)), ccx = W / 2, ccy = R + 16, dy = ccy + R + 30;
    const bx = 20, bw = W - 40, by = Math.min(H - 30, dy + 64), bxOf = m => bx + (m - T0) / SPAN * bw;
    const bgS = spr(`t30bg|${W}x${H}`, W, H, x => {
      x.fillStyle = lin(x, 0, 0, 0, H, [[0, '#14142a'], [1, '#0b0b18']]); x.fillRect(0, 0, W, H);
      x.fillStyle = rad(x, ccx, ccy, R * 0.6, R * 2, [[0, 'rgba(45,226,230,.16)'], [1, 'rgba(45,226,230,0)']]); x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.03)'; x.lineWidth = 1; for (let yy = 0; yy < H; yy += 24) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); }
      // циферблат
      x.save(); x.shadowColor = 'rgba(45,226,230,.55)'; x.shadowBlur = 24; x.fillStyle = '#2a2c44'; x.beginPath(); x.arc(ccx, ccy, R + R * 0.07, 0, TAU); x.fill(); x.restore();
      x.fillStyle = lin(x, ccx - R, ccy - R, ccx + R, ccy + R, [[0, '#e8ebf8'], [0.5, '#7a7f99'], [1, '#2a2c44']]); x.beginPath(); x.arc(ccx, ccy, R + R * 0.07, 0, TAU); x.fill();
      x.fillStyle = rad(x, ccx - R * 0.3, ccy - R * 0.35, R * 0.1, R * 1.1, [[0, '#ffffff'], [0.7, '#f0eefb'], [1, '#d2cfe6']]); x.beginPath(); x.arc(ccx, ccy, R, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1.5; x.beginPath(); x.arc(ccx, ccy, R, 0, TAU); x.stroke();
      // сектор «около 18:00» — подсказка, где цель
      x.fillStyle = 'rgba(255,59,212,.1)'; x.beginPath(); x.moveTo(ccx, ccy); x.arc(ccx, ccy, R * 0.92, Math.PI / 2 - 0.13, Math.PI / 2 + 0.13); x.closePath(); x.fill();
      for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, l = i % 5 ? 0.06 : 0.13; x.strokeStyle = i % 5 ? '#5a5878' : '#1d1a2e'; x.lineWidth = i % 5 ? 1 : 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(ccx + Math.sin(a) * R * 0.92, ccy - Math.cos(a) * R * 0.92); x.lineTo(ccx + Math.sin(a) * R * (0.92 - l), ccy - Math.cos(a) * R * (0.92 - l)); x.stroke(); }
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `900 ${Math.round(R * 0.2)}px ${FONT}`; x.fillStyle = '#ff3bd4'; x.fillText('6', ccx, ccy + R * 0.64);
      x.font = `900 ${Math.round(R * 0.17)}px ${FONT}`; x.fillStyle = '#2a2a44'; x.fillText('12', ccx, ccy - R * 0.64); x.fillText('3', ccx + R * 0.66, ccy); x.fillText('9', ccx - R * 0.66, ccy);
      x.font = `800 ${Math.round(R * 0.08)}px ${FONT}`; x.fillStyle = '#8a87a8'; x.fillText('OFFICE · TIME', ccx, ccy - R * 0.36);
      x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(ccx - R * 0.35, ccy - R * 0.5, R * 0.35, R * 0.16, -0.5, 0, TAU); x.fill();
      // шкала 16:00–20:00
      rr(x, bx, by - 8, bw, 16, 8); x.fillStyle = lin(x, 0, by - 8, 0, by + 8, [[0, '#0e0e1e'], [1, '#26264a']]); x.fill(); x.strokeStyle = 'rgba(255,255,255,.1)'; x.lineWidth = 1; x.stroke();
      const tx = bxOf(TARGET), zw = bw * 50 / SPAN;
      x.fillStyle = lin(x, tx - zw / 2, 0, tx + zw / 2, 0, [[0, 'rgba(212,255,58,0)'], [0.5, 'rgba(212,255,58,.45)'], [1, 'rgba(212,255,58,0)']]); x.fillRect(tx - zw / 2, by - 8, zw, 16);
      x.save(); x.shadowColor = '#d4ff3a'; x.shadowBlur = 10; x.fillStyle = '#d4ff3a'; x.fillRect(tx - 1.5, by - 14, 3, 28); x.restore();
      for (let hh = 16; hh <= 20; hh++) { const xx = bxOf(hh * 60); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(xx - 0.5, by + 9, 1, 4); x.font = `700 11px ${FONT}`; x.fillStyle = hh === 18 ? '#d4ff3a' : '#9b98b8'; x.fillText(`${hh}:00`, xx, by + 22); }
    });
    const hand = (a, len, wdt, col) => {
      g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = wdt; g.beginPath(); g.moveTo(ccx + 2, ccy + 3); g.lineTo(ccx + 2 + Math.sin(a) * len, ccy + 3 - Math.cos(a) * len); g.stroke();
      g.strokeStyle = col; g.beginPath(); g.moveTo(ccx - Math.sin(a) * len * 0.15, ccy + Math.cos(a) * len * 0.15); g.lineTo(ccx + Math.sin(a) * len, ccy - Math.cos(a) * len); g.stroke();
    };
    btn.onclick = stop;
    on(api, S.cv, 'pointerdown', e => { e.preventDefault(); stop(); });
    on(api, window, 'keydown', e => { if (e.code === 'Space' || e.key === 'Enter') { if (e.target === btn) return; e.preventDefault(); if (!e.repeat) stop(); } });
    loop(api, dt => {
      if (state === 'run') { tm += dir * SPEEDS[round] * dt; if (tm > T0 + SPAN) tm -= SPAN; }
      if (state === 'shown') show += dt;
      blit(g, bgS, 0, 0);
      const hm = tm % 720, ha = hm / 720 * TAU, ma = (tm % 60) / 60 * TAU;
      g.lineCap = 'round';
      hand(ha, R * 0.5, R * 0.075, '#1d1a2e');
      hand(ma, R * 0.8, R * 0.04, '#ff3bd4');
      g.lineCap = 'butt';
      g.fillStyle = rad(g, ccx - R * 0.02, ccy - R * 0.02, 0, R * 0.08, [[0, '#ffffff'], [1, '#5a5878']]); g.beginPath(); g.arc(ccx, ccy, R * 0.065, 0, TAU); g.fill();
      // цифры в «табло»
      const col = state === 'shown' ? (lastPts >= 80 ? '#d4ff3a' : lastPts >= 40 ? '#7df9ff' : '#ff3b6b') : '#f2f0ff';
      const fs = Math.min(40, W / 9), pw = fs * 3.4, ph = fs * 1.25;
      const pk = state === 'shown' && show < 0.25 ? 1 + Math.sin(show / 0.25 * Math.PI) * 0.08 : 1;
      g.save(); g.translate(W / 2, dy); g.scale(pk, pk);
      rr(g, -pw / 2, -ph / 2, pw, ph, ph / 2); g.fillStyle = 'rgba(8,8,20,.85)'; g.fill(); g.strokeStyle = state === 'shown' ? col : 'rgba(255,255,255,.14)'; g.lineWidth = 1.5; g.stroke();
      txt(g, fmt(tm), 0, 1, fs, col, 'center', 900); g.restore();
      const mx = bxOf(tm);
      g.fillStyle = 'rgba(255,59,212,.35)'; g.fillRect(mx - 1, by - 8, 2, 16);
      g.fillStyle = '#ff3bd4'; g.beginPath(); g.moveTo(mx, by + 6); g.lineTo(mx - 7, by - 12); g.lineTo(mx + 7, by - 12); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(mx, by + 1); g.lineTo(mx - 4, by - 10); g.lineTo(mx, by - 10); g.closePath(); g.fill();
      if (state === 'shown') {
        const m = Math.floor(lastErr), sec = Math.round((lastErr - m) * 60);
        const msg = lastPts === 120 ? L('Ровно! Домой!', 'Spot on! Home time!') : `${L('промах', 'off by')} ${m} ${L('мин', 'min')} ${sec} ${L('с', 's')} · +${lastPts}`;
        g.globalAlpha = Math.min(1, show * 5); txt(g, msg, W / 2, dy + 34, 14, '#c9c6e0', 'center', 800); g.globalAlpha = 1;
      }
      fx.draw(g, dt);
      popsDraw(g, pops, dt, 24);
      if (state === 'ready') veil(g, W, H, L('Коснитесь, чтобы начать', 'Tap to start'), L('Остановите время ровно на 18:00', 'Stop the time exactly at 18:00'), '⏱️');
    });
    upd();
  };
})();
