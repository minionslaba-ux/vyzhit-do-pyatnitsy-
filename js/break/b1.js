// «☕ Разминка», игры 1–10: логика и настольные.
(() => {
  // Цвета, важные для игры, — фиксированные (не зависят от темы): вы — розовый, соперник — бирюзовый.
  const CSS = `
.bg1-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 4px 8px 16px; box-sizing: border-box; }
.bg1-h { margin: 12px 0 0; font-size: 19px; text-align: center; letter-spacing: .01em; }
.bg1-note { margin: 0 0 4px; color: var(--text-2); font-size: 13px; text-align: center; max-width: 380px; line-height: 1.4; }
/* меню: карточки вариантов */
.bg1-opts { display: flex; flex-direction: column; gap: 10px; width: min(360px, 100%); }
.bg1-opt { position: relative; display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px 11px 11px; border-radius: 18px; border: 1px solid rgba(255,255,255,.1); background: linear-gradient(160deg, #23203a, #15131f 70%); color: #f2f0ff; font: inherit; text-align: left; cursor: pointer;
  box-shadow: 0 10px 22px -12px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.08); transition: transform .15s var(--ease, ease-out), border-color .2s, box-shadow .2s; animation: bg1-in .35s var(--ease, ease-out) both; }
.bg1-opt:hover, .bg1-opt:focus-visible { border-color: rgba(var(--c-rgb),.65); box-shadow: 0 12px 26px -12px rgba(0,0,0,.9), 0 0 18px rgba(var(--c-rgb),.22), inset 0 1px 0 rgba(255,255,255,.1); outline: none; }
.bg1-opt:active { transform: scale(.97); }
.bg1-oi { flex: none; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; font-size: 27px; line-height: 1; font-weight: 900; color: #fff; letter-spacing: -.02em;
  background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.22), transparent 55%), linear-gradient(150deg, #ff5bd9, #8a3cff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.25), 0 6px 14px -6px rgba(255,59,212,.7); }
.bg1-oi.bg1-t { font-size: 16px; font-family: var(--f-display, inherit); }
.bg1-opt:nth-child(2) .bg1-oi { background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.22), transparent 55%), linear-gradient(150deg, #3ee6ea, #2a6cff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.25), 0 6px 14px -6px rgba(45,226,230,.7); }
.bg1-opt:nth-child(3) .bg1-oi { background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.22), transparent 55%), linear-gradient(150deg, #ffb340, #ff3b6b); box-shadow: inset 0 -3px 0 rgba(0,0,0,.25), 0 6px 14px -6px rgba(255,120,80,.7); }
.bg1-opt:nth-child(4) .bg1-oi { background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.22), transparent 55%), linear-gradient(150deg, #c6ff3a, #19a974); box-shadow: inset 0 -3px 0 rgba(0,0,0,.25), 0 6px 14px -6px rgba(140,230,60,.6); }
.bg1-ot { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bg1-ot b { font-size: 15.5px; }
.bg1-ot small { color: #a9a5c8; font-size: 12.5px; line-height: 1.3; }
.bg1-lv { display: flex; gap: 3px; align-items: flex-end; flex: none; }
.bg1-lv i { width: 5px; border-radius: 2px; background: rgba(255,255,255,.15); }
.bg1-lv i:nth-child(1) { height: 8px; } .bg1-lv i:nth-child(2) { height: 13px; } .bg1-lv i:nth-child(3) { height: 18px; }
.bg1-lv i.on { background: linear-gradient(#d4ff3a, #7bd12a); box-shadow: 0 0 6px rgba(212,255,58,.5); }
.bg1-chev { flex: none; color: rgba(255,255,255,.35); font-size: 24px; line-height: 1; margin-left: 2px; }
@keyframes bg1-in { from { opacity: 0; transform: translateY(10px) scale(.98); } }
/* строка статуса: пилюли */
.bg1-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 440px; font-size: 13.5px; gap: 8px; min-height: 30px; }
.bg1-st, .bg1-dim { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; padding: 3px 12px; border-radius: 999px; box-sizing: border-box; font-variant-numeric: tabular-nums; min-width: 0; line-height: 1.2; }
.bg1-dim { flex: none; white-space: nowrap; }
@media (max-width: 360px) { .bg1-bar { font-size: 12px; gap: 6px; } .bg1-st, .bg1-dim { padding: 3px 9px; } }
.bg1-st { color: #f2f0ff; font-weight: 800; background: linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.04)); border: 1px solid rgba(255,255,255,.12); }
.bg1-st:empty, .bg1-dim:empty { visibility: hidden; }
.bg1-st::before { content: ''; flex: none; width: 8px; height: 8px; border-radius: 50%; background: #7df9ff; box-shadow: 0 0 8px #2de2e6; }
.bg1-st[data-w="me"] { border-color: rgba(255,59,212,.55); background: linear-gradient(180deg, rgba(255,59,212,.28), rgba(255,59,212,.1)); }
.bg1-st[data-w="me"]::before { background: #ff8be6; box-shadow: 0 0 8px #ff3bd4; }
.bg1-st[data-w="ai"] { border-color: rgba(45,226,230,.45); background: linear-gradient(180deg, rgba(45,226,230,.2), rgba(45,226,230,.06)); }
.bg1-st[data-w="ai"]::before { animation: bg1-blink 1s ease-in-out infinite; }
@keyframes bg1-blink { 50% { opacity: .25; } }
.bg1-dim { color: #d8d4f4; font-weight: 700; background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.1); }
.bg1-sc { display: inline-flex; align-items: center; gap: 6px; }
.bg1-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; flex: none; }
.bg1-dot.me { background: radial-gradient(circle at 35% 30%, #ffb3ef, #ff3bd4 60%, #a01f86); box-shadow: 0 0 6px rgba(255,59,212,.7); }
.bg1-dot.ai { background: radial-gradient(circle at 35% 30%, #c6feff, #2de2e6 60%, #13868a); box-shadow: 0 0 6px rgba(45,226,230,.6); }
/* кнопки */
.bg1-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.bg1-btn { border: 1px solid rgba(255,59,212,.55); border-radius: 999px; background: linear-gradient(180deg, rgba(255,59,212,.16), rgba(255,59,212,.04)); color: #ff9be9; padding: 9px 16px; font: inherit; font-weight: 800; font-size: 13.5px; cursor: pointer;
  box-shadow: 0 6px 14px -8px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.1); transition: transform .12s, background .2s, box-shadow .2s; }
.bg1-btn:hover { background: linear-gradient(180deg, rgba(255,59,212,.3), rgba(255,59,212,.1)); }
.bg1-btn:active:not(:disabled) { transform: scale(.96); }
.bg1-btn:disabled { opacity: .45; cursor: default; }
.bg1-btn.bg1-go { border: 0; background: linear-gradient(180deg, #ff6fe0, #e01cb5); color: #fff; box-shadow: 0 8px 18px -6px rgba(255,59,212,.75), inset 0 1px 0 rgba(255,255,255,.4), inset 0 -3px 0 rgba(0,0,0,.18); padding: 11px 22px; font-size: 15px; }
.bg1-btn.bg1-go:disabled { background: linear-gradient(180deg, #3a3550, #2a2640); color: #a9a5c8; box-shadow: inset 0 1px 0 rgba(255,255,255,.08); opacity: 1; }
/* рамка доски */
.bg1-frame { position: relative; padding: 7px; border-radius: 18px; background: linear-gradient(150deg, #3d3658, #1b1828 50%, #2c2642); box-shadow: 0 22px 40px -18px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.16), inset 0 -2px 0 rgba(0,0,0,.4); flex: none; }
.bg1-frame.bg1-wood { background: repeating-linear-gradient(92deg, rgba(255,255,255,.035) 0 2px, transparent 2px 7px), repeating-linear-gradient(88deg, rgba(0,0,0,.12) 0 1px, transparent 1px 11px), linear-gradient(150deg, #6b4128, #3b2214 55%, #57331e); }
.bg1-board { position: relative; display: grid; aspect-ratio: 1; border-radius: 11px; overflow: hidden; background: #14121f; touch-action: manipulation; box-shadow: 0 0 0 1px rgba(0,0,0,.6); }
.bg1-board::after { content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: inherit; box-shadow: inset 0 2px 10px rgba(0,0,0,.55); z-index: 3; }
.bg1-cell { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; cursor: pointer; font-size: calc(var(--cs) * .55); line-height: 1; }
/* клетки: шашки / уголки */
.bg1-dk { background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.05), transparent 70%), linear-gradient(135deg, #2b2440, #1d182c); }
.bg1-lt { background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.12), transparent 70%), linear-gradient(135deg, #847aa4, #645985); }
.bg1-ck .bg1-lt { cursor: default; }
.bg1-zone::before, .bg1-zone2::before { content: ''; position: absolute; inset: 0; pointer-events: none; }
/* цель: ваш угол назначения — розовый, коллеги — бирюзовый */
.bg1-zone::before { background: linear-gradient(135deg, rgba(45,226,230,.34), rgba(45,226,230,.16)); box-shadow: inset 0 0 0 1px rgba(45,226,230,.25); }
.bg1-zone2::before { background: linear-gradient(135deg, rgba(255,59,212,.4), rgba(255,59,212,.2)); box-shadow: inset 0 0 0 1px rgba(255,59,212,.3); }
/* фишка */
.bg1-pc { position: relative; z-index: 1; width: 80%; height: 80%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; font-size: calc(var(--cs) * .36); box-sizing: border-box; transition: transform .18s cubic-bezier(.2,.7,.2,1), box-shadow .18s; }
.bg1-pc::after { content: ''; position: absolute; inset: 17%; border-radius: 50%; box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.28), inset 0 2px 3px rgba(0,0,0,.3), 0 1px 0 rgba(255,255,255,.2); pointer-events: none; }
.bg1-me { background: radial-gradient(circle at 38% 28%, #ffd0f5 0, #ff6fe0 22%, #ff3bd4 48%, #c81aa3 78%, #8f0f74 100%); box-shadow: inset 0 2px 1px rgba(255,255,255,.5), inset 0 -3px 3px rgba(90,0,70,.5), 0 3px 0 #7a0b62, 0 6px 10px rgba(0,0,0,.55), 0 0 12px rgba(255,59,212,.35); }
.bg1-ai { background: radial-gradient(circle at 38% 28%, #e3feff 0, #8ff6f8 22%, #2de2e6 48%, #14a7ab 78%, #0b6c70 100%); box-shadow: inset 0 2px 1px rgba(255,255,255,.55), inset 0 -3px 3px rgba(0,60,62,.5), 0 3px 0 #0a5a5d, 0 6px 10px rgba(0,0,0,.55), 0 0 12px rgba(45,226,230,.3); }
.bg1-pc > span, .bg1-pc > svg { position: relative; z-index: 1; filter: drop-shadow(0 1px 1px rgba(0,0,0,.45)); }
.bg1-pc > svg { width: 52%; height: 52%; }
.bg1-mv .bg1-me { animation: bg1-breathe 1.6s ease-in-out infinite; }
@keyframes bg1-breathe { 50% { box-shadow: inset 0 2px 1px rgba(255,255,255,.5), inset 0 -3px 3px rgba(90,0,70,.5), 0 3px 0 #7a0b62, 0 6px 10px rgba(0,0,0,.55), 0 0 0 3px rgba(255,255,255,.35), 0 0 18px rgba(255,59,212,.7); } }
.bg1-sel { background: radial-gradient(circle, rgba(255,59,212,.45), rgba(255,59,212,.12) 70%), linear-gradient(135deg, #2b2440, #1d182c) !important; }
.bg1-sel .bg1-pc { transform: translateY(-3px) scale(1.12); box-shadow: inset 0 2px 1px rgba(255,255,255,.5), inset 0 -3px 3px rgba(90,0,70,.5), 0 3px 0 #7a0b62, 0 12px 16px rgba(0,0,0,.6), 0 0 0 2px #fff, 0 0 20px rgba(255,59,212,.9); }
.bg1-last::before { content: ''; position: absolute; inset: 2px; border-radius: 6px; background: radial-gradient(circle, rgba(255,214,90,.2), rgba(255,214,90,.05) 70%); box-shadow: inset 0 0 0 1.5px rgba(255,214,90,.55); pointer-events: none; }
.bg1-tg::after { content: ''; position: absolute; z-index: 2; width: 30%; height: 30%; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #f4ffc0, #d4ff3a 55%, #8bc219); box-shadow: 0 0 0 3px rgba(212,255,58,.25), 0 0 12px rgba(212,255,58,.8); animation: bg1-ping 1.2s ease-in-out infinite; pointer-events: none; }
@keyframes bg1-ping { 50% { transform: scale(.78); box-shadow: 0 0 0 6px rgba(212,255,58,.12), 0 0 16px rgba(212,255,58,.9); } }
.bg1-die { position: absolute; animation: bg1-die .32s ease-in forwards; pointer-events: none; }
@keyframes bg1-die { to { transform: scale(.2) rotate(40deg); opacity: 0; } }
/* переговорка: ковролин */
.bg1-rv { background: repeating-linear-gradient(45deg, rgba(255,255,255,.025) 0 2px, transparent 2px 5px), repeating-linear-gradient(-45deg, rgba(0,0,0,.12) 0 2px, transparent 2px 5px), radial-gradient(ellipse at 50% 40%, #2b4a5a, #172a36 80%); }
.bg1-rv .bg1-cell { box-shadow: inset -1px -1px 0 rgba(0,0,0,.35), inset 1px 1px 0 rgba(255,255,255,.05); perspective: 300px; }
.bg1-rv .bg1-cell:nth-child(8n+4), .bg1-rv .bg1-cell:nth-child(8n+5) { background: rgba(255,255,255,.015); }
.bg1-rv .bg1-pc { width: 82%; height: 82%; }
.bg1-rv .bg1-pc > svg { width: 62%; height: 62%; filter: drop-shadow(0 1px 0 rgba(255,255,255,.35)); }
.bg1-rv .bg1-pc::after { inset: 9%; box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.22); }
/* гомоку: тетрадь в клетку */
.bg1-gm { background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.035) 0 1.5px, transparent 2px) 0 0 / var(--cs) var(--cs), radial-gradient(ellipse at 50% 30%, #23214a, #141327 75%); }
.bg1-gm .bg1-cell { box-shadow: inset -.5px -.5px 0 rgba(125,249,255,.14); }
.bg1-gm .bg1-cell:hover:empty { background: rgba(255,59,212,.12); }
.bg1-gm svg { width: 96%; height: 96%; overflow: visible; }
.bg1-gm .bg1-x path { stroke: #ff3bd4; stroke-width: 1.75; stroke-linecap: round; fill: none; }
.bg1-gm .bg1-x path + path + path { stroke: #ffc6f2; stroke-width: .45; opacity: .85; }
.bg1-gm .bg1-x .g { stroke: rgba(255,59,212,.22); stroke-width: 3.2; }
.bg1-gm .bg1-o circle { stroke: #2de2e6; stroke-width: 1.55; fill: none; }
.bg1-gm .bg1-o circle + circle + circle { stroke: #c8feff; stroke-width: .42; opacity: .85; }
.bg1-gm .bg1-o .g { stroke: rgba(45,226,230,.2); stroke-width: 3.1; }
.bg1-new svg { animation: bg1-popin .26s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes bg1-popin { from { transform: scale(.2); opacity: 0; } }
.bg1-gm .bg1-last { background: radial-gradient(circle, rgba(255,214,90,.22), transparent 70%); }
.bg1-gm .bg1-last::before { display: none; }
.bg1-win { background: radial-gradient(circle, rgba(255,226,120,.75), rgba(255,170,40,.28) 78%) !important; animation: bg1-glow 1s ease-in-out infinite; }
@keyframes bg1-glow { 50% { filter: brightness(1.35); } }
/* судоку: блокнот */
.bg1-su { background: #0f0e1a; gap: 3px; padding: 3px; box-sizing: border-box; }
.bg1-su .bg1-cell { background: linear-gradient(160deg, #2a2741, #201d33); border-radius: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,.07); transition: background .15s; }
.bg1-su .bg1-giv { background: linear-gradient(160deg, #3d3858, #2f2b47); cursor: default; box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -2px 0 rgba(0,0,0,.25); }
.bg1-su .bg1-hl { background: linear-gradient(160deg, #332e52, #282442); }
.bg1-su .bg1-bad { background: linear-gradient(160deg, #7a2040, #5a1430); box-shadow: inset 0 0 0 1.5px #ff3b6b; }
.bg1-su .bg1-on { background: linear-gradient(160deg, #6a2a6a, #4a1d55); box-shadow: inset 0 0 0 2px #ff3bd4, 0 0 14px rgba(255,59,212,.5); z-index: 1; }
.bg1-su .bg1-cell:not(.bg1-giv):empty { box-shadow: inset 0 3px 8px rgba(0,0,0,.5); }
.bg1-su .bg1-cell:not(.bg1-giv):not(:empty):not(.bg1-on) { box-shadow: inset 0 -3px 0 rgba(255,59,212,.6), inset 0 1px 0 rgba(255,255,255,.07); }
.bg1-su .bg1-giv { background: linear-gradient(160deg, #4a4470, #39345a) !important; }
.bg1-su .bg1-alt.bg1-giv { background: linear-gradient(160deg, #3f5478, #304362) !important; }
.bg1-su .bg1-alt:not(.bg1-giv):not(.bg1-on):not(.bg1-bad):not(.bg1-hl) { background: linear-gradient(160deg, #24304a, #1b2539); }
.bg1-su .bg1-cell > span { display: inline-block; filter: drop-shadow(0 2px 2px rgba(0,0,0,.4)); }
.bg1-su .bg1-in > span { animation: bg1-popin .24s cubic-bezier(.3,1.6,.5,1) both; }
.bg1-pal { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
.bg1-pal button { width: 48px; height: 50px; border-radius: 14px; border: 1px solid rgba(255,255,255,.12); background: linear-gradient(180deg, #2f2b48, #1c1a2c); font-size: 24px; cursor: pointer; padding: 0; color: #f2f0ff;
  box-shadow: 0 4px 0 #0f0d18, 0 8px 14px -6px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.12); transition: transform .1s, box-shadow .1s; }
.bg1-pal button:hover { border-color: rgba(var(--c-rgb),.6); }
.bg1-pal button:active { transform: translateY(3px) scale(.96); box-shadow: 0 1px 0 #0f0d18, inset 0 1px 0 rgba(255,255,255,.12); }
/* пятнашки: бумаги на деревянном столе */
.bg1-sl { display: block; background: repeating-linear-gradient(91deg, rgba(255,255,255,.03) 0 2px, transparent 2px 9px), repeating-linear-gradient(89deg, rgba(0,0,0,.1) 0 1px, transparent 1px 14px), linear-gradient(160deg, #4a2c1b, #2d1a10); }
.bg1-tile { position: absolute; box-sizing: border-box; padding: 4px; transition: left .16s cubic-bezier(.2,.7,.2,1), top .16s cubic-bezier(.2,.7,.2,1); cursor: pointer; z-index: 1; }
.bg1-tile b { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 6px 14px 6px 6px; color: #2a2340; font-size: calc(var(--cs) * .34); font-weight: 900; gap: 1px; font-variant-numeric: tabular-nums; overflow: hidden;
  background: repeating-linear-gradient(180deg, transparent 0 9px, rgba(70,90,160,.12) 9px 10px), linear-gradient(165deg, #fffdf5, #ece4cf); box-shadow: 0 4px 0 #b9ae93, 0 8px 12px -2px rgba(0,0,0,.55), inset 0 1px 0 #fff; transition: transform .12s; }
.bg1-tile b::after { content: ''; position: absolute; top: 0; right: 0; width: 22%; height: 22%; background: linear-gradient(225deg, #2d1a10 50%, #d8ceb2 50%); border-bottom-left-radius: 4px; box-shadow: -1px 1px 2px rgba(0,0,0,.25); }
.bg1-tile:active b { transform: scale(.96); }
.bg1-tile b i { font-style: normal; font-size: calc(var(--cs) * .22); filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }
.bg1-tile.bg1-ok b { background: repeating-linear-gradient(180deg, transparent 0 9px, rgba(40,140,70,.14) 9px 10px), linear-gradient(165deg, #f6ffe8, #d9efc0); box-shadow: 0 4px 0 #93ad78, 0 8px 12px -2px rgba(0,0,0,.55), inset 0 1px 0 #fff; }
.bg1-tile.bg1-ok b::before { content: '✓'; position: absolute; left: 6%; bottom: 4%; font-size: calc(var(--cs) * .16); color: #2c9a46; font-weight: 900; }
/* печеньки */
.bg1-table { gap: 12px !important; padding: 14px 10px !important; border-radius: 22px; width: min(100%, 440px) !important;
  background: repeating-linear-gradient(91deg, rgba(255,255,255,.03) 0 2px, transparent 2px 9px), radial-gradient(ellipse at 50% 0%, rgba(255,214,150,.12), transparent 70%), linear-gradient(170deg, #3a2418, #24150d); box-shadow: 0 18px 36px -16px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.08); }
.bg1-plate { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 3px; width: 100%; min-height: 58px; padding: 10px 18px; border-radius: 999px; box-sizing: border-box; justify-content: center; transition: box-shadow .2s, transform .2s;
  background: radial-gradient(ellipse at 50% 40%, #fbfaff 0 52%, #e4e0f2 64%, #f7f5ff 72%, #c9c3de 100%); box-shadow: 0 8px 14px -6px rgba(0,0,0,.7), inset 0 -3px 6px rgba(80,70,120,.3), inset 0 2px 2px #fff; }
.bg1-plate.bg1-psel { box-shadow: 0 0 0 3px #ff3bd4, 0 0 22px rgba(255,59,212,.6), inset 0 -3px 6px rgba(80,70,120,.3); }
.bg1-ck2 { position: relative; width: 34px; height: 34px; flex: none; border: 0; padding: 0; cursor: pointer; border-radius: 50%; font-size: 0; transition: transform .16s cubic-bezier(.3,1.5,.5,1), box-shadow .16s;
  background: radial-gradient(circle at 30% 34%, #4b2810 0 7%, transparent 8%), radial-gradient(circle at 66% 28%, #5a3014 0 6%, transparent 7%), radial-gradient(circle at 58% 64%, #4b2810 0 8%, transparent 9%), radial-gradient(circle at 27% 70%, #5a3014 0 5%, transparent 6%), radial-gradient(circle at 76% 55%, #4b2810 0 4%, transparent 5%),
    radial-gradient(circle at 40% 32%, #ffd99a, #e6a75a 55%, #b8732f 90%); box-shadow: inset 0 -2px 3px rgba(90,40,10,.5), inset 0 2px 2px rgba(255,240,200,.5), 0 2px 3px rgba(60,40,80,.45); }
.bg1-ck2:nth-child(3n+1) { rotate: 70deg; } .bg1-ck2:nth-child(3n+2) { rotate: -130deg; }
.bg1-ck2:hover { transform: translateY(-2px); }
.bg1-ck2.bg1-pick { transform: translateY(-6px) scale(1.14); box-shadow: inset 0 -2px 3px rgba(90,40,10,.5), inset 0 2px 2px rgba(255,240,200,.5), 0 8px 10px rgba(60,40,80,.45), 0 0 0 2.5px #ff3bd4, 0 0 14px rgba(255,59,212,.8); }
.bg1-fly { position: fixed; z-index: 56; pointer-events: none; margin: 0; }
.bg1-empty { color: #8e88ad; font-size: 13px; font-weight: 700; }
.bg1-log { color: #d8d4f4; font-size: 13.5px; min-height: 20px; text-align: center; margin: 0; }
/* согласование: столы */
.bg1-ap { touch-action: none; background: #0f0d18; }
.bg1-ap .bg1-cell { background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.08), transparent 60%), linear-gradient(160deg, #6d4a32, #4a3020); box-shadow: inset 0 0 0 2px #0f0d18, inset 0 3px 0 rgba(255,255,255,.12), inset 0 -5px 0 rgba(0,0,0,.25); font-size: calc(var(--cs) * .5); transition: background .15s; }
.bg1-ap .bg1-wall { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03) 0 4px, transparent 4px 8px), #181524; cursor: default; box-shadow: inset 0 0 0 2px #0f0d18; }
.bg1-ap .bg1-wall { font-size: calc(var(--cs) * .42); }
.bg1-ap .bg1-wall { filter: saturate(.55) brightness(.75); }
.bg1-ap .bg1-vis { background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.12), transparent 60%), linear-gradient(160deg, #8a3a7a, #5a2152); }
.bg1-ap .bg1-vis::after { content: '✓'; position: absolute; right: 7%; top: 5%; font-size: calc(var(--cs) * .2); font-weight: 900; color: #d4ff3a; text-shadow: 0 0 6px rgba(212,255,58,.8); }
.bg1-ap .bg1-head { background: radial-gradient(circle, rgba(255,255,255,.2), transparent 70%), linear-gradient(160deg, #ff4fd8, #b0158f); box-shadow: inset 0 0 0 2px #0f0d18, 0 0 0 2px #fff inset, 0 0 18px rgba(255,59,212,.9); z-index: 1; }
.bg1-ap .bg1-st0, .bg1-ap .bg1-end { box-shadow: inset 0 0 0 2px #0f0d18, inset 0 0 0 4px rgba(255,214,90,.7); }
.bg1-ap svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; }
/* лабиринт */
.bg1-mz { display: block; touch-action: none; border-radius: 8px; }
.bg1-pad { display: grid; grid-template-columns: repeat(3, 54px); gap: 6px; }
.bg1-pad button { height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: linear-gradient(180deg, #2f2b48, #1c1a2c); color: #7df9ff; font-size: 18px; font-weight: 900; cursor: pointer;
  box-shadow: 0 4px 0 #0f0d18, 0 8px 14px -6px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.12); transition: transform .1s, box-shadow .1s; }
.bg1-pad button:active { transform: translateY(3px) scale(.96); box-shadow: 0 1px 0 #0f0d18, inset 0 1px 0 rgba(255,255,255,.12); }
/* стопки папок */
.bg1-hn { display: flex; width: min(100%, 440px); gap: 8px; }
.bg1-peg { flex: 1; position: relative; display: flex; flex-direction: column-reverse; align-items: center; gap: 3px; padding: 10px 4px 40px; min-height: 236px; border-radius: 16px; cursor: pointer; transition: box-shadow .2s, transform .15s;
  background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.08), transparent 60%), linear-gradient(180deg, #23203a, #15131f); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 16px 28px -16px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.08); }
.bg1-peg::before { content: ''; position: absolute; bottom: 36px; top: 20px; left: 50%; width: 6px; translate: -50% 0; border-radius: 3px; background: linear-gradient(90deg, #6f6b88, #e4e1f5 45%, #8a86a6); box-shadow: 0 0 6px rgba(0,0,0,.5); }
.bg1-peg::after { content: ''; position: absolute; left: 8%; right: 8%; bottom: 28px; height: 10px; border-radius: 4px; background: linear-gradient(180deg, #8b5a3a, #4a2c1b); box-shadow: 0 3px 6px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.2); }
.bg1-peg:active { transform: scale(.98); }
.bg1-peg.bg1-on { border-color: rgba(255,59,212,.75); box-shadow: 0 0 0 1px rgba(255,59,212,.5), 0 0 22px rgba(255,59,212,.35), 0 16px 28px -16px rgba(0,0,0,.9); }
.bg1-peg small { position: absolute; bottom: 7px; left: 0; right: 0; text-align: center; color: #a9a5c8; font-size: 11.5px; font-weight: 700; }
.bg1-peg:last-child small { color: #d4ff3a; }
.bg1-fd { position: relative; z-index: 1; height: 26px; min-width: 34px; box-sizing: border-box; border-radius: 3px 5px 5px 5px; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 900; color: rgba(20,16,32,.85); font-variant-numeric: tabular-nums; transition: transform .18s cubic-bezier(.2,.7,.2,1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -3px 0 rgba(0,0,0,.18), 0 3px 5px rgba(0,0,0,.45); background-image: linear-gradient(180deg, rgba(255,255,255,.25), rgba(0,0,0,.08)) !important; background-blend-mode: soft-light; }
.bg1-fd::before { content: ''; position: absolute; left: 6px; top: -5px; width: 34%; max-width: 34px; height: 6px; border-radius: 3px 3px 0 0; background: inherit; filter: brightness(.88); }
.bg1-fd.bg1-up { transform: translateY(-14px) scale(1.04); box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 12px 14px rgba(0,0,0,.55), 0 0 16px rgba(255,255,255,.5); }
/* частицы, всплывающие очки, конфетти */
.bg1-pop { position: fixed; z-index: 56; pointer-events: none; translate: -50% -50%; font-weight: 900; font-size: 18px; color: #d4ff3a; text-shadow: 0 2px 0 rgba(0,0,0,.5), 0 0 10px rgba(0,0,0,.6); font-variant-numeric: tabular-nums; animation: bg1-up .9s cubic-bezier(.2,.7,.2,1) forwards; white-space: nowrap; }
@keyframes bg1-up { 0% { opacity: 0; transform: translateY(6px) scale(.6); } 20% { opacity: 1; transform: translateY(-4px) scale(1.15); } 100% { opacity: 0; transform: translateY(-44px) scale(1); } }
.bg1-spark { position: fixed; z-index: 56; width: 7px; height: 7px; margin: -3.5px; border-radius: 50%; pointer-events: none; animation: bg1-spark .6s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes bg1-spark { to { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0; } }
.bg1-conf { position: fixed; inset: 0; z-index: 52; pointer-events: none; overflow: hidden; }
.bg1-conf i { position: absolute; top: -14px; width: 8px; height: 13px; border-radius: 2px; animation: bg1-fall linear forwards; }
@keyframes bg1-fall { to { transform: translate(var(--dx), 105vh) rotate(var(--r)); } }
@media (prefers-reduced-motion: reduce) {
  .bg1-opt, .bg1-mv .bg1-me, .bg1-tg::after, .bg1-win, .bg1-st[data-w="ai"]::before, .bg1-new svg { animation: none !important; }
  .bg1-pc, .bg1-tile, .bg1-fd, .bg1-ck2 { transition: none !important; }
}
`;

  const RM = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const mk = (root, api) => {
    if (!document.getElementById('bg-style-1')) { const s = document.createElement('style'); s.id = 'bg-style-1'; s.textContent = CSS; document.head.append(s); }
    const T = [], I = [], F = [];
    api.onExit(() => { T.forEach(clearTimeout); I.forEach(clearInterval); F.forEach(f => { try { f(); } catch {} }); });
    const el = (tag, cls, html, par) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (par) par.append(e); if (tag === 'button') e.type = 'button'; return e; };
    const fmt = s => { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    const mid = e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    // Победа — конфетти поверх итога
    const end0 = api.end;
    api.end = o => { if (o && o.won) U.confetti(); return end0(o); };
    const U = {
      el, fmt, mid,
      later: (f, ms) => { const id = setTimeout(f, ms); T.push(id); return id; },
      // Косметика (искры, всплывашки): переживает конец партии, но не закрытие окна
      fx: (f, ms) => setTimeout(() => { if (root.isConnected) f(); }, ms),
      every: (f, ms) => { const id = setInterval(f, ms); I.push(id); return id; },
      cleanup: f => F.push(f),
      on: (t, ev, f, o) => { t.addEventListener(ev, f, o); F.push(() => t.removeEventListener(ev, f, o)); },
      // Перетаскивание: фишка едет за пальцем, отпустили на другой клетке — ход. Нажатия по очереди тоже работают.
      // items — клетки/столбики; ghost(i) — что тащить (элемент или null); move(from, to) — сделать ход (to = −1, если мимо)
      drag: (box, items, { ghost = () => null, move }) => {
        let from = -1, g = null, src = null, x0 = 0, y0 = 0, moved = false;
        const at = (x, y) => { const t = document.elementFromPoint(x, y); return items.findIndex(c => c === t || c.contains(t)); };
        const stop = () => { g?.remove(); g = null; if (src) src.style.opacity = ''; src = null; from = -1; };
        box.style.touchAction = 'none';
        U.on(box, 'pointerdown', e => {
          if (e.button > 0) return;
          from = items.findIndex(c => c === e.target || c.contains(e.target)); moved = false; x0 = e.clientX; y0 = e.clientY;
          src = from >= 0 ? ghost(from) : null;
        });
        U.on(box, 'pointermove', e => {
          if (from < 0) return;
          if (!moved && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) {
            moved = true; try { box.setPointerCapture(e.pointerId); } catch {}
            if (src) { const r = src.getBoundingClientRect(); g = src.cloneNode(true);
              Object.assign(g.style, { position: 'fixed', left: 0, top: 0, width: r.width + 'px', height: r.height + 'px', margin: 0, zIndex: 60, pointerEvents: 'none', transform: 'scale(1.18)', transition: 'none', animation: 'none', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.55))' });
              document.body.append(g); src.style.opacity = '.3'; }
          }
          if (g) g.style.translate = `${e.clientX - parseFloat(g.style.width) / 2}px ${e.clientY - parseFloat(g.style.height) / 2}px`;
        });
        U.on(box, 'pointerup', e => {
          const f = from, mv = moved; stop();
          if (f < 0 || !mv) return;   // это было нажатие — сработает обычный клик
          const t = at(e.clientX, e.clientY);
          if (t !== f) move(f, t);
          suppress = true; setTimeout(() => { suppress = false; }, 0);
        });
        U.on(box, 'pointercancel', stop);
        let suppress = false;
        U.on(box, 'click', e => { if (suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
        F.push(stop);
      },
      W: (max = 440) => Math.floor(Math.max(260, Math.min((root.clientWidth || 360) - 16, max))),
      clear: () => { root.innerHTML = ''; return el('div', 'bg1-wrap', null, root); },
      // Меню: карточки с иконкой (i), заголовком (t), подписью (s) и уровнем сложности (d = 1…3)
      menu(title, opts, cb, note) {
        const w = U.clear(); el('h3', 'bg1-h', title, w); if (note) el('p', 'bg1-note', note, w);
        const list = el('div', 'bg1-opts', null, w);
        opts.forEach((o, k) => {
          const b = el('button', 'bg1-opt', `<span class="bg1-oi${o.it ? ' bg1-t' : ''}" aria-hidden="true">${o.i || ''}</span><span class="bg1-ot"><b>${o.t}</b>${o.s ? `<small>${o.s}</small>` : ''}</span>${o.d ? `<span class="bg1-lv" aria-hidden="true">${[1, 2, 3].map(x => `<i${x <= o.d ? ' class="on"' : ''}></i>`).join('')}</span>` : ''}<span class="bg1-chev" aria-hidden="true">›</span>`, list);
          b.style.animationDelay = k * 60 + 'ms';
          b.onclick = () => { api.sfx.click?.(); cb(o.v); };
        });
      },
      // Доска в рамке-«безеле»; рамка — bd.parentNode
      board(w, n, cls, max, frame = '') {
        const W = U.W(max) - 14, fr = el('div', 'bg1-frame ' + frame, null, w), bd = el('div', 'bg1-board ' + (cls || ''), null, fr);
        bd.style.width = W + 'px'; bd.style.gridTemplateColumns = bd.style.gridTemplateRows = `repeat(${n},minmax(0,1fr))`; bd.style.setProperty('--cs', W / n + 'px');
        return bd;
      },
      // Статус хода: who = 'me' | 'ai' | ''
      status(st, text, who = '') { st.textContent = text; if (who) st.dataset.w = who; else delete st.dataset.w; },
      clock(out) {
        let t0 = 0, stopped = null;
        const secs = () => stopped != null ? stopped : t0 ? (performance.now() - t0) / 1000 : 0;
        const show = () => { if (out) out.textContent = '⏱ ' + fmt(secs()); };
        show();
        return { start() { if (!t0) { t0 = performance.now(); U.every(show, 250); } }, stop() { if (stopped == null) stopped = secs(); show(); return Math.round(stopped * 10) / 10; }, secs, get started() { return !!t0; } };
      },
      // Плавный переезд элемента e из точки [x, y] (центр прежнего места) — FLIP
      slide(e, from, ms = 220) {
        if (!e || !from || RM() || !e.animate) return;
        const [x, y] = mid(e), dx = from[0] - x, dy = from[1] - y; if (!dx && !dy) return;
        e.animate([{ transform: `translate(${dx}px,${dy}px) scale(1.08)`, zIndex: 5 }, { transform: 'none', zIndex: 5 }], { duration: ms, easing: EASE });
      },
      // Всплывающая надпись «+10» над элементом
      pop(txt, ref, color) {
        if (!ref) return; const [x, y] = mid(ref), p = el('b', 'bg1-pop', txt, document.body);
        p.style.left = x + 'px'; p.style.top = y + 'px'; if (color) p.style.color = color;
        setTimeout(() => p.remove(), 950);
      },
      // Искры из центра элемента
      burst(ref, colors = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#fff'], n = 10) {
        if (!ref || RM()) return; const [x, y] = mid(ref);
        for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n + Math.random() * .5, d = 22 + Math.random() * 26, s = el('i', 'bg1-spark', null, document.body);
          s.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};box-shadow:0 0 6px ${colors[i % colors.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
          setTimeout(() => s.remove(), 650); }
      },
      shake(e) { if (!e || !e.animate || RM()) return; e.animate([{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(2px)' }, { transform: 'none' }], { duration: 320, easing: 'ease-out' }); },
      confetti() {
        if (RM()) return; const box = el('div', 'bg1-conf', null, document.body), C = ['#ff3bd4', '#2de2e6', '#d4ff3a', '#ffb340', '#b26bff', '#fff'];
        for (let i = 0; i < 46; i++) { const p = el('i', null, null, box);
          p.style.cssText = `left:${Math.random() * 100}%;background:${C[i % C.length]};--dx:${(Math.random() - .5) * 180}px;--r:${(Math.random() - .5) * 1080}deg;animation-delay:${Math.random() * 400}ms;animation-duration:${1500 + Math.random() * 1000}ms;width:${6 + Math.random() * 5}px`; }
        setTimeout(() => box.remove(), 3000);
      },
      // Элементы улетают вверх и тают (печеньки, папки)
      fly(els, dy = -70) {
        if (RM()) return;
        els.forEach((e, k) => { const r = e.getBoundingClientRect(), g = e.cloneNode(true); g.classList.add('bg1-fly');
          Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); document.body.append(g);
          g.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 40}px,${dy}px) scale(.5) rotate(${(Math.random() - .5) * 120}deg)`, opacity: 0 }], { duration: 520, delay: k * 50, easing: EASE, fill: 'both' });
          setTimeout(() => g.remove(), 600 + k * 50); });
      },
    };
    return U;
  };
  // Перерисовать клетку, только если её содержимое изменилось (чтобы анимации не перезапускались)
  const setH = (c, html) => { if (c._h === html) return false; c._h = html; c.innerHTML = html; return true; };
  // Стул (вид сверху) — для «Захвата переговорки»
  const CHAIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="rgba(28,8,40,.72)"><rect x="7" y="1.5" width="10" height="10" rx="3.2"/><rect x="4.5" y="12.2" width="15" height="3.6" rx="1.8"/><rect x="11" y="15.5" width="2" height="4"/><rect x="5" y="19.2" width="14" height="2" rx="1"/><circle cx="6" cy="22.2" r="1.3"/><circle cx="18" cy="22.2" r="1.3"/></g><rect x="8.6" y="3" width="6.8" height="2" rx="1" fill="rgba(255,255,255,.35)"/></svg>';
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
    U.menu(L('Кто сядет за доску?', 'Who takes the board?'), [1, 2, 3].map(v => ({ v, i: LV[v][1], d: v, t: LV[v][0],
      s: [, L('Ходит как попало', 'Moves at random'), L('Смотрит на ход вперёд', 'Looks one move ahead'), L('Просчитывает варианты', 'Calculates deep lines')][v] })), play,
      L('Русские шашки: бить обязательно (и назад тоже), дамка ходит далеко. Ваши шашки — розовые, внизу; ходите первыми. Нажмите шашку, потом клетку (или перетащите пальцем).', 'Russian checkers: captures are mandatory (backwards too), kings fly. Yours are pink, at the bottom; you move first. Tap a piece, then a square (or drag it).'));
    function play(level) {
      let b = Array(64).fill(0);
      for (let s = 0; s < 64; s++) { const r = s >> 3, c = s & 7; if ((r + c) % 2) { if (r < 3) b[s] = -1; else if (r > 4) b[s] = 1; } }
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w);
      const st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
      const bd = U.board(w, 8, 'bg1-ck', 440, 'bg1-wood');
      const cells = []; for (let s = 0; s < 64; s++) { const c = U.el('div', 'bg1-cell ' + (((s >> 3) + (s & 7)) % 2 ? 'bg1-dk' : 'bg1-lt'), null, bd); c.onclick = () => tap(s); cells.push(c); }
      U.drag(bd, cells, { ghost: i => turn === 1 && !done ? cells[i].querySelector('.bg1-me:not(.bg1-die)') : null, move: (f, t) => { if (t < 0) return; if (!sel || sel.path.length === 1) tap(f); tap(t); } });
      const row = U.el('div', 'bg1-row', null, w), give = U.el('button', 'bg1-btn', L('🏳️ Сдаться', '🏳️ Resign'), row);
      give.onclick = () => !done && finish(false, L('Вы сдались. Босс доволен собой.', 'You resigned. The Boss is pleased.'));
      let turn = 1, sel = null, legal = ckMoves(b, 1), last = [], myMoves = 0, quiet = 0, done = false;
      const pre = (p, q) => q.every((x, i) => p[i] === x);
      function render() {
        const tg = new Set(), path = new Set(sel ? sel.path : []), mov = new Set();
        if (turn === 1 && !done) { if (sel) legal.filter(m => pre(m.path, sel.path)).forEach(m => tg.add(m.path[sel.path.length])); legal.forEach(m => mov.add(m.path[0])); }
        cells.forEach((c, s) => {
          const p = b[s];
          setH(c, p ? `<i class="bg1-pc ${p > 0 ? 'bg1-me' : 'bg1-ai'}">${Math.abs(p) === 2 ? '<span>👑</span>' : ''}</i>` : '');
          c.classList.toggle('bg1-tg', tg.has(s)); c.classList.toggle('bg1-sel', path.has(s));
          c.classList.toggle('bg1-mv', !sel && mov.has(s)); c.classList.toggle('bg1-last', last.includes(s));
        });
        cnt.innerHTML = `<span class="bg1-sc"><i class="bg1-dot me"></i>${b.filter(x => x > 0).length} : ${b.filter(x => x < 0).length}<i class="bg1-dot ai"></i>${LV[level][1]}</span>`;
        U.status(st, done ? '' : turn === 1 ? (legal[0]?.caps.length ? L('Ваш ход — бейте!', 'Your move — capture!') : L('Ваш ход', 'Your move')) : L(`${LV[level][0]} думает…`, `${LV[level][0]} is thinking…`), done ? '' : turn === 1 ? 'me' : 'ai');
      }
      function tap(s) {
        if (done || turn !== 1) return;
        if (b[s] > 0 && (!sel || sel.path.length === 1) && legal.some(m => m.path[0] === s)) { sel = { path: [s] }; api.sfx.click?.(); render(); return; }
        if (!sel) { if (b[s] > 0 && legal[0]?.caps.length) { api.toast(L('Бить обязательно — другой шашкой', 'Capturing is mandatory — use another piece')); U.shake(bd.parentNode); } return; }
        const next = legal.filter(m => pre(m.path, sel.path) && m.path[sel.path.length] === s);
        if (!next.length) { if (sel.path.length === 1) { sel = null; render(); } return; }
        const np = [...sel.path, s], full = next.find(m => m.path.length === np.length);
        if (full) return doMove(full, 1);
        sel = { path: np }; render();
      }
      function doMove(m, side) {
        const moved = b[m.path[0]], from = U.mid(cells[m.path[0]]), dead = m.caps.map(x => [x, cells[x].querySelector('.bg1-pc')?.className]), crown = Math.abs(moved) === 1 && Math.abs(ckApply(b, m)[m.path[m.path.length - 1]]) === 2;
        b = ckApply(b, m); last = m.path.slice(); sel = null;
        if (m.caps.length || Math.abs(moved) === 1) quiet = 0; else quiet++;
        if (side === 1) myMoves++;
        if (m.caps.length) api.sfx.stapler?.(); else api.sfx.click?.();
        turn = -side; legal = ckMoves(b, turn); render();
        const to = cells[m.path[m.path.length - 1]];
        U.slide(to.querySelector('.bg1-pc'), from, 160 + 70 * (m.path.length - 1));
        dead.forEach(([x, cl]) => { if (!cl) return; const g = U.el('i', cl + ' bg1-die', null, cells[x]); g.style.animationDelay = '120ms'; U.later(() => g.remove(), 520); U.fx(() => U.burst(cells[x], side === 1 ? ['#ff3bd4', '#ffd0f5', '#d4ff3a'] : ['#2de2e6', '#c6feff', '#fff'], 8), 140); });
        if (m.caps.length && side === 1) U.fx(() => U.pop(`+${m.caps.length}`, to), 160);
        if (crown) U.fx(() => { U.burst(to, ['#ffd75a', '#fff', '#ffb340'], 12); U.pop('👑', to); }, 200);
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
    U.el('p', 'bg1-note', L('Переведите свои 9 фишек в дальний розовый угол раньше коллеги. Ход — на соседнюю клетку или прыжками через любые фишки.', 'Move your 9 pieces to the far pink corner before your colleague. Step to a neighbour or jump over any pieces.'), w);
    const bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
    const bd = U.board(w, 8, '', 440, 'bg1-wood');
    const cells = []; for (let s = 0; s < 64; s++) { const c = U.el('div', 'bg1-cell ' + (((s >> 3) + (s & 7)) % 2 ? 'bg1-dk' : 'bg1-lt') + (inA(s) ? ' bg1-zone2' : inP(s) ? ' bg1-zone' : ''), null, bd); c.onclick = () => tap(s); cells.push(c); }
    U.drag(bd, cells, { ghost: i => turn === 1 && !done ? cells[i].querySelector('.bg1-me') : null, move: (f, t) => { if (t < 0) return; tap(f); tap(t); } });
    let sel = null, ds = [], my = 0, their = 0, turn = 1, done = false, last = [];
    function render() {
      cells.forEach((c, s) => {
        setH(c, b[s] ? `<i class="bg1-pc ${b[s] > 0 ? 'bg1-me' : 'bg1-ai'}"><span>${b[s] > 0 ? '📁' : '🗂️'}</span></i>` : '');
        c.classList.toggle('bg1-sel', s === sel); c.classList.toggle('bg1-tg', ds.includes(s)); c.classList.toggle('bg1-last', last.includes(s));
      });
      cnt.innerHTML = `<span class="bg1-sc"><i class="bg1-dot me"></i>${inGoal(1)}/9 : ${inGoal(-1)}/9<i class="bg1-dot ai"></i></span> · ${L('ход', 'move')} ${my}/${CAP}`;
      U.status(st, done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Коллега думает…', 'Colleague is thinking…'), done ? '' : turn === 1 ? 'me' : 'ai');
    }
    // Переезд фишки: плавно; попала в угол — «+1» и искры
    const anim = (f, t, p) => {
      const from = U.mid(cells[f]); render(); U.slide(cells[t].querySelector('.bg1-pc'), from, 200);
      if (tgt(p)(t) && !tgt(p)(f)) U.fx(() => { U.burst(cells[t], p > 0 ? ['#ff3bd4', '#ffd0f5', '#d4ff3a'] : ['#2de2e6', '#c6feff'], 8); if (p > 0) U.pop('+1', cells[t]); }, 200);
    };
    function tap(s) {
      if (done || turn !== 1) return;
      if (b[s] === 1) { sel = s; ds = dests(s); api.sfx.click?.(); render(); return; }
      if (sel != null && ds.includes(s)) { const f = sel; b[s] = 1; b[sel] = 0; last = [sel, s]; sel = null; ds = []; my++; api.sfx.click?.(); anim(f, s, 1); after(1); }
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
      if (mv) { b[mv[1]] = -1; b[mv[0]] = 0; last = mv; anim(mv[0], mv[1], -1); }
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
    const XS = '<svg viewBox="0 0 10 10" class="bg1-x"><path class="g" d="M2.6 2.6L7.4 7.4M7.4 2.6L2.6 7.4"/><path d="M2.6 2.6L7.4 7.4M7.4 2.6L2.6 7.4"/><path d="M2.6 2.6L7.4 7.4M7.4 2.6L2.6 7.4"/></svg>';
    const OS = '<svg viewBox="0 0 10 10" class="bg1-o"><circle class="g" cx="5" cy="5" r="2.9"/><circle cx="5" cy="5" r="2.9"/><circle cx="5" cy="5" r="2.9"/></svg>';
    const cells = []; for (let s = 0; s < N * N; s++) { const c = U.el('div', 'bg1-cell', null, bd); c.onclick = () => tap(s); cells.push(c); }
    U.el('p', 'bg1-note', L('Вы — <b style="color:#ff6fe0">✕</b>, Бухгалтер — <b style="color:#2de2e6">◯</b>. Пять в ряд по горизонтали, вертикали или диагонали.', 'You are <b style="color:#ff6fe0">✕</b>, the Accountant is <b style="color:#2de2e6">◯</b>. Five in a row in any direction.'), w);
    let turn = 1, done = false, my = 0, last = -1;
    const render = (win = []) => {
      cells.forEach((c, s) => { if (setH(c, b[s] === 1 ? XS : b[s] === 2 ? OS : '')) c.classList.toggle('bg1-new', !!b[s]); c.classList.toggle('bg1-last', s === last); c.classList.toggle('bg1-win', win.includes(s)); });
      U.status(st, done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Бухгалтер считает…', 'The Accountant is counting…'), done ? '' : turn === 1 ? 'me' : 'ai');
      cnt.textContent = L(`Ходов: ${my}`, `Moves: ${my}`);
    };
    function place(s, p) {
      b[s] = p; last = s; api.sfx.click?.();
      const wl = winLine(s, p);
      if (wl) { done = true; render(wl); wl.forEach((x, k) => U.fx(() => U.burst(cells[x], p === 1 ? ['#ff3bd4', '#ffd75a', '#fff'] : ['#2de2e6', '#ffd75a'], 6), k * 70)); if (p !== 1) U.shake(bd.parentNode); return api.end(p === 1 ? { won: true, score: my, lowerBetter: true, text: L(`Пять в ряд за ${my} ходов — Бухгалтер пересчитывает и не верит.`, `Five in a row in ${my} moves!`) } : { won: false, text: L('Бухгалтер свёл баланс: пять в ряд.', 'The Accountant balanced the books: five in a row.') }); }
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
      { v: 4, i: '4×4', it: 1, d: 1, t: L('Разминка', 'Warm-up'), s: L('Четыре значка, квадраты 2×2', 'Four icons, 2×2 boxes') },
      { v: 6, i: '6×6', it: 1, d: 3, t: L('🏆 На время', '🏆 Timed'), s: L('Шесть значков, блоки 2×3 — рекорд считается здесь', 'Six icons, 2×3 boxes — records count here') },
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
        const e = U.el('div', 'bg1-cell' + (giv[i] ? ' bg1-giv' : '') + ((Math.floor(r / br) + Math.floor(c / bc)) % 2 ? ' bg1-alt' : ''), null, bd);
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
        cells.forEach((e, i) => { setH(e, cur[i] >= 0 ? `<span>${icons[cur[i]]}</span>` : ''); e.classList.toggle('bg1-on', i === sel); e.classList.toggle('bg1-bad', bs.has(i) && !giv[i]);
          e.classList.toggle('bg1-hl', sel >= 0 && i !== sel && (Math.floor(i / N) === sr || i % N === sc)); });
        U.status(st, sel < 0 ? L('Выберите клетку', 'Pick a cell') : L('Выберите значок', 'Pick an icon'), sel < 0 ? '' : 'me');
        return bs;
      }
      function put(v) {
        if (done || sel < 0) return; cur[sel] = v; api.sfx.click?.();
        const ce = cells[sel]; ce.classList.remove('bg1-in'); void ce.offsetWidth; ce.classList.toggle('bg1-in', v >= 0);
        const bs = render();
        if (bs.has(sel)) { U.shake(ce); api.buzz?.('tap'); }
        if (!cur.includes(-1) && !bs.size) { done = true; sel = -1; render(); const t = clk.stop(); cells.forEach((e, k) => U.fx(() => U.burst(e, ['#d4ff3a', '#fff', '#2de2e6'], 4), (k % N + Math.floor(k / N)) * 45));
          api.end({ won: true, score: N === 6 ? t : null, lowerBetter: true, text: L(`Судоку ${N}×${N} решено за ${U.fmt(t)}.`, `${N}×${N} sudoku solved in ${U.fmt(t)}.`) }); }
      }
      render();
    }
  };

  // ───────── 5. Пятнашки «Разобрать стол» ─────────
  B[5] = (root, api) => {
    const { L } = api, U = mk(root, api);
    U.menu(L('Разобрать стол', 'Sliding desk'), [
      { v: 3, i: '3×3', it: 1, d: 1, t: L('8 документов', '8 documents'), s: L('Быстрая разминка', 'Quick warm-up') },
      { v: 4, i: '4×4', it: 1, d: 3, t: L('15 документов · 🏆', '15 documents · 🏆'), s: L('Рекорд — по наименьшему числу ходов', 'Record — fewest moves') },
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
      const tl = Object.keys(tiles).map(Number), tEls = tl.map(v => tiles[v]);
      U.drag(bd, tEls, { move: f => tap(a.indexOf(tl[f])) });
      function render() {
        a.forEach((v, i) => { if (!v) return; const t = tiles[v]; t.style.left = (i % N) * cs + 'px'; t.style.top = Math.floor(i / N) * cs + 'px'; t.classList.toggle('bg1-ok', v === i + 1); });
        mv.textContent = L(`Ходов: ${moves}`, `Moves: ${moves}`);
        a.forEach((v, i) => { if (v && v === i + 1 && !okd.has(v) && moves) U.fx(() => U.burst(tiles[v], ['#d4ff3a', '#fff', '#7bd12a'], 6), 160); });
        okd = new Set(a.filter((v, i) => v && v === i + 1));
      }
      let okd = new Set();
      function tap(i) {
        if (done) return; e = a.indexOf(0);
        const r = Math.floor(i / N), c = i % N, er = Math.floor(e / N), ec = e % N;
        if (r !== er && c !== ec) return;
        clk.start();
        const step = r === er ? (c > ec ? 1 : -1) : (r > er ? N : -N);
        while (e !== i) { a[e] = a[e + step]; a[e + step] = 0; e += step; moves++; }
        api.sfx.click?.(); render();
        if (solved()) { done = true; const t = clk.stop();
          Object.values(tiles).forEach((t, k) => U.fx(() => t.animate?.([{ transform: 'none' }, { transform: 'translateY(-8px) scale(1.06)' }, { transform: 'none' }], { duration: 360, easing: 'ease-out' }), 200 + k * 40));
          api.end({ won: true, score: N === 4 ? moves : null, lowerBetter: true, text: L(`Стол разобран: ${moves} ходов за ${U.fmt(t)}.`, `Desk sorted: ${moves} moves in ${U.fmt(t)}.`) }); }
      }
      render();
    }
  };

  // ───────── 6. Последняя печенька ─────────
  B[6] = (root, api) => {
    const { L } = api, U = mk(root, api);
    U.menu(L('Последняя печенька', 'The last cookie'), [
      { v: [1, 0], i: '🍪', d: 1, t: L('Одна тарелка · лёгкий', 'One plate · easy'), s: L('Берите 1–3 печеньки, коллега иногда ошибается', 'Take 1–3 cookies, your colleague sometimes slips') },
      { v: [1, 1], i: '🍪', d: 2, t: L('Одна тарелка · сложный', 'One plate · hard'), s: L('Коллега считает безошибочно', 'Your colleague counts perfectly') },
      { v: [0, 0], i: '🍽️', d: 2, t: L('Несколько тарелок · лёгкий', 'Several plates · easy'), s: L('Берите сколько угодно, но с одной тарелки', 'Take any number, but from one plate') },
      { v: [0, 1], i: '🍽️', d: 3, t: L('Несколько тарелок · сложный', 'Several plates · hard'), s: L('Против бухгалтера-математика', 'Against a math-savvy accountant') },
    ], play, L('Берите печенье по очереди. Кто возьмёт последнее — тот и моет чашки (проигрывает).', 'Take turns. Whoever takes the last cookie washes the mugs (loses).'));
    function play([single, hard]) {
      const max = single ? 3 : Infinity;
      const isP = h => single ? h[0] % 4 === 1 : h.every(x => x <= 1) ? h.filter(x => x === 1).length % 2 === 1 : h.reduce((a, x) => a ^ x, 0) === 0;
      let h;
      if (single) { do h = [13 + Math.floor(Math.random() * 9)]; while (h[0] % 4 === 1); }
      else do h = Array.from({ length: 3 + (Math.random() < .4 ? 1 : 0) }, () => 2 + Math.floor(Math.random() * 5)); while (isP(h));
      const w = U.clear(), bar = U.el('div', 'bg1-bar', null, w), st = U.el('span', 'bg1-st', '', bar), cnt = U.el('span', 'bg1-dim', '', bar);
      const plates = U.el('div', 'bg1-wrap bg1-table', null, w);
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
        U.status(st, done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Коллега выбирает…', 'Colleague is choosing…'), done ? '' : turn === 1 ? 'me' : 'ai');
        go.disabled = !pick || turn !== 1 || done;
        go.textContent = pick ? L(`Взять ${pick.k} 🍪`, `Take ${pick.k} 🍪`) : single ? L('Нажмите на печеньку (1–3)', 'Tap a cookie (1–3)') : L('Нажмите на печеньку', 'Tap a cookie');
      }
      const empty = () => h.every(x => !x);
      go.onclick = () => {
        if (!pick || done || turn !== 1) return;
        U.fly([...plates.querySelectorAll('.bg1-pick')], -80); U.pop(`−${pick.k}`, plates.children[pick.p], '#ff8be6');
        h[pick.p] -= pick.k; log.textContent = L(`Вы взяли ${pick.k} 🍪`, `You took ${pick.k} 🍪`); pick = null; api.sfx.item?.();
        if (empty()) { done = true; render(); U.shake(plates); return api.end({ won: false, text: L('Последняя печенька — ваша. Чашки моете вы ☕', 'The last cookie is yours — you wash the mugs ☕') }); }
        turn = 2; render(); U.later(ai, 800);
      };
      function ai() {
        if (done) return;
        const opts = []; h.forEach((n, p) => { for (let k = 1; k <= Math.min(n, max); k++) opts.push([p, k]); });
        const good = opts.filter(([p, k]) => { const t = h.slice(); t[p] -= k; return isP(t); });
        let m = good.length && (hard || Math.random() < .45) ? api.rnd(good) : api.rnd(opts);
        if (hard && !good.length) m = opts.find(([, k]) => k === 1) || m;
        const pc = [...plates.children[m[0]].querySelectorAll('.bg1-ck2')]; U.fly(pc.slice(pc.length - m[1]), 80); U.pop(`−${m[1]}`, plates.children[m[0]], '#7df9ff');
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
    const bd = U.board(w, 8, 'bg1-rv', 440);
    const cells = []; for (let s = 0; s < 64; s++) { const c = U.el('div', 'bg1-cell', null, bd); c.onclick = () => tap(s); cells.push(c); }
    let turn = 1, done = false, last = -1, mine = legal(1);
    function render() {
      cells.forEach((c, s) => {
        const had = c._h;
        if (setH(c, b[s] ? `<i class="bg1-pc ${b[s] > 0 ? 'bg1-me' : 'bg1-ai'}">${CHAIR}</i>` : '') && b[s] && !RM()) {
          const pc = c.firstChild, d = last < 0 ? 0 : Math.max(Math.abs((s >> 3) - (last >> 3)), Math.abs((s & 7) - (last & 7)));
          if (had) pc.animate?.([{ transform: 'rotateY(90deg) scale(1.15)', filter: 'brightness(1.6)' }, { transform: 'none', filter: 'none' }], { duration: 260, delay: d * 70, easing: EASE, fill: 'backwards' });
          else if (s === last) pc.animate?.([{ transform: 'translateY(-14px) scale(1.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: EASE });
        }
        c.classList.toggle('bg1-tg', turn === 1 && !done && mine.includes(s)); c.classList.toggle('bg1-last', s === last); });
      cnt.innerHTML = `<span class="bg1-sc"><i class="bg1-dot me"></i>${b.filter(x => x > 0).length} : ${b.filter(x => x < 0).length}<i class="bg1-dot ai"></i>${L('продажи', 'Sales')}</span>`;
      U.status(st, done ? '' : turn === 1 ? L('Ваш ход', 'Your move') : L('Отдел продаж ходит…', 'Sales is moving…'), done ? '' : turn === 1 ? 'me' : 'ai');
    }
    function put(s, p) { const f = flips(s, p); f.forEach(x => { b[x] = p; }); b[s] = p; last = s; api.sfx.click?.(); if (p === 1) U.fx(() => U.pop(`+${f.length}`, cells[s]), 120); }
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
        const c = U.el('div', 'bg1-cell' + (desk.has(i) ? '' : ' bg1-wall') + (i === start ? ' bg1-st0' : i === end ? ' bg1-end' : ''), i === start ? '📄' : i === end ? '👔' : desk.has(i) ? api.rnd(SIGN) : api.rnd(WALL), bd);
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
        U.burst(cells[i], ['#d4ff3a', '#ff3bd4', '#fff', '#ffd75a'], 14); U.pop(L('Подписано!', 'Signed!'), cells[i]);
        if (round < SIZES.length - 1) { round++; U.status(st, L('✅ Подписано!', '✅ Signed!'), 'me'); done = true; U.later(() => { done = false; setup(); }, 700); }
        else { done = true; const t = clk.stop(); api.end({ won: true, score: t, lowerBetter: true, text: L(`Три документа согласованы за ${U.fmt(t)}.`, `Three documents approved in ${U.fmt(t)}.`) }); }
      } else if (i === end) { api.toast(L('Директор подпишет последним — обойдите все столы', 'The director signs last — visit every desk first')); U.shake(bd.parentNode); }
    }
    function render() {
      const set = new Set(path);
      cells.forEach((c, i) => { c.classList.toggle('bg1-vis', set.has(i)); c.classList.toggle('bg1-head', i === path[path.length - 1]); });
      const pts = path.map(i => `${i % N + .5},${Math.floor(i / N) + .5}`).join(' ');
      const hd = path[path.length - 1];
      svg.innerHTML = (path.length > 1 ? `<polyline points="${pts}" fill="none" stroke="rgba(255,59,212,.28)" stroke-width=".34" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#ff4fd8" stroke-width=".13" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#ffd0f5" stroke-width=".04" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray=".12 .14"/>` : '')
        + (path.length ? `<circle cx="${hd % N + .5}" cy="${Math.floor(hd / N) + .5}" r=".42" fill="none" stroke="#fff" stroke-width=".05" opacity=".9"/>` : '');
      if (!done) U.status(st, L(`Документ ${round + 1}/3 · подписей ${path.length}/${desk.size}`, `Doc ${round + 1}/3 · signatures ${path.length}/${desk.size}`), path.length ? 'me' : '');
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
    const Wd = U.W(420) - 14, dpr = Math.min(3, window.devicePixelRatio || 1);
    const fr = U.el('div', 'bg1-frame', null, w), cv = U.el('canvas', 'bg1-mz', null, fr);
    const pad = U.el('div', 'bg1-pad', null, w);
    [['', -1], ['↑', 0], ['', -1], ['←', 3], ['↓', 2], ['→', 1]].forEach(([t, d]) => { const bt = U.el('button', '', t, pad); if (d < 0) bt.style.visibility = 'hidden'; else bt.onclick = () => run(d, false); });
    const note = U.el('p', 'bg1-note', L('Свайп — бежать до развилки, стрелки — шаг, тап по коридору — дойти туда.', 'Swipe to run to the next fork, arrows to step, tap a corridor to walk there.'), w);
    // Размер клетки: по ширине и так, чтобы лабиринт со стрелками влез в экран телефона без прокрутки
    const avail = (window.innerHeight || 700) - fr.getBoundingClientRect().top - pad.offsetHeight - note.offsetHeight - 14 - 20 - 16 - 18;
    const cs = Math.max(20, Math.min(Math.floor(Wd / C), Math.floor(avail / R))), MW = cs * C, MH = cs * R;
    cv.width = MW * dpr; cv.height = MH * dpr; cv.style.width = MW + 'px'; cv.style.height = MH + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const off = (wd, ht) => { const c = document.createElement('canvas'); c.width = Math.ceil(wd * dpr); c.height = Math.ceil(ht * dpr); const x = c.getContext('2d'); x.scale(dpr, dpr); return [c, x]; };
    const rr = (x, c, y, wd, ht, r) => { x.beginPath(); x.moveTo(c + r, y); x.arcTo(c + wd, y, c + wd, y + ht, r); x.arcTo(c + wd, y + ht, c, y + ht, r); x.arcTo(c, y + ht, c, y, r); x.arcTo(c, y, c + wd, y, r); x.closePath(); };
    let pos = 0, done = false, steps = 0; const trail = new Set([0]), goal = C * R - 1;
    // Статичный слой (рисуется один раз): ковролин, перегородки, кулер
    const [sc, sk] = off(MW, MH);
    {
      const g = sk.createLinearGradient(0, 0, 0, MH); g.addColorStop(0, '#1d1a36'); g.addColorStop(1, '#14122a'); sk.fillStyle = g; sk.fillRect(0, 0, MW, MH);
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if ((Math.floor(x / 2) + Math.floor(y / 2)) % 2) { sk.fillStyle = 'rgba(255,255,255,.025)'; sk.fillRect(x * cs, y * cs, cs, cs); }
      for (let k = 0; k < MW * MH / 60; k++) { sk.fillStyle = k % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.18)'; sk.fillRect(Math.random() * MW, Math.random() * MH, 1, 1); }
      const gx = (goal % C + .5) * cs, gy = (Math.floor(goal / C) + .5) * cs, gl = sk.createRadialGradient(gx, gy, 0, gx, gy, cs * 2.2);
      gl.addColorStop(0, 'rgba(45,226,230,.35)'); gl.addColorStop(1, 'rgba(45,226,230,0)'); sk.fillStyle = gl; sk.fillRect(gx - cs * 2.2, gy - cs * 2.2, cs * 4.4, cs * 4.4);
      const sp = sk.createRadialGradient(cs / 2, cs / 2, 0, cs / 2, cs / 2, cs * 1.6);
      sp.addColorStop(0, 'rgba(255,59,212,.25)'); sp.addColorStop(1, 'rgba(255,59,212,0)'); sk.fillStyle = sp; sk.fillRect(0, 0, cs * 2, cs * 2);
      const P = new Path2D();
      for (let i = 0; i < C * R; i++) { const x = i % C * cs, y = Math.floor(i / C) * cs, m = wall[i];
        if (m & 1) { P.moveTo(x, y); P.lineTo(x + cs, y); } if (m & 8) { P.moveTo(x, y); P.lineTo(x, y + cs); }
        if (m & 2 && i % C === C - 1) { P.moveTo(x + cs, y); P.lineTo(x + cs, y + cs); } if (m & 4 && Math.floor(i / C) === R - 1) { P.moveTo(x, y + cs); P.lineTo(x + cs, y + cs); } }
      const lw = Math.max(3, cs * .16); sk.lineCap = 'round'; sk.lineJoin = 'round';
      sk.save(); sk.translate(0, 2.5); sk.strokeStyle = 'rgba(0,0,0,.55)'; sk.lineWidth = lw + 2; sk.stroke(P); sk.restore();
      sk.save(); sk.shadowColor = 'rgba(45,226,230,.8)'; sk.shadowBlur = 8; sk.strokeStyle = '#3cc8dc'; sk.lineWidth = lw; sk.stroke(P); sk.restore();
      const wg = sk.createLinearGradient(0, 0, MW, MH); wg.addColorStop(0, '#c9fbff'); wg.addColorStop(1, '#5fc4e0'); sk.strokeStyle = wg; sk.lineWidth = lw * .72; sk.stroke(P);
      sk.save(); sk.translate(-.5, -.8); sk.strokeStyle = 'rgba(255,255,255,.6)'; sk.lineWidth = 1; sk.stroke(P); sk.restore();
      // кулер с бутылью
      const cx = goal % C * cs, cy = Math.floor(goal / C) * cs, u = cs / 10;
      const bg = sk.createLinearGradient(cx + 2 * u, 0, cx + 8 * u, 0); bg.addColorStop(0, '#d9dbe8'); bg.addColorStop(.5, '#ffffff'); bg.addColorStop(1, '#a9abc2');
      sk.fillStyle = 'rgba(0,0,0,.35)'; sk.beginPath(); sk.ellipse(cx + 5 * u, cy + 9.3 * u, 3.4 * u, .8 * u, 0, 0, 7); sk.fill();
      sk.fillStyle = bg; rr(sk, cx + 2.4 * u, cy + 4.6 * u, 5.2 * u, 4.8 * u, u); sk.fill();
      sk.fillStyle = '#3a3f5c'; rr(sk, cx + 4.2 * u, cy + 6 * u, 1.6 * u, 1 * u, .3 * u); sk.fill();
      const wb = sk.createLinearGradient(cx + 3 * u, 0, cx + 7 * u, 0); wb.addColorStop(0, '#2aa8e0'); wb.addColorStop(.45, '#9be8ff'); wb.addColorStop(1, '#1d7fc0');
      sk.fillStyle = wb; rr(sk, cx + 3 * u, cy + .8 * u, 4 * u, 3.6 * u, 1.3 * u); sk.fill(); sk.fillRect(cx + 4.3 * u, cy + 4.2 * u, 1.4 * u, .6 * u);
      sk.fillStyle = 'rgba(255,255,255,.7)'; sk.fillRect(cx + 3.7 * u, cy + 1.6 * u, .5 * u, 2 * u);
    }
    // Спрайт игрока: розовая фишка с персонажем
    const [ps, px2] = off(cs, cs);
    { const r = cs * .42, c0 = cs / 2, g = px2.createRadialGradient(c0 - r * .3, c0 - r * .4, r * .1, c0, c0, r);
      g.addColorStop(0, '#ffd0f5'); g.addColorStop(.5, '#ff3bd4'); g.addColorStop(1, '#a01f86');
      px2.fillStyle = 'rgba(0,0,0,.45)'; px2.beginPath(); px2.arc(c0, c0 + 2, r, 0, 7); px2.fill();
      px2.fillStyle = g; px2.beginPath(); px2.arc(c0, c0, r, 0, 7); px2.fill();
      px2.strokeStyle = '#fff'; px2.lineWidth = Math.max(1.5, cs * .06); px2.stroke();
      px2.font = `${Math.floor(cs * .5)}px sans-serif`; px2.textAlign = 'center'; px2.textBaseline = 'middle'; px2.fillText('🧑‍💼', c0, c0 + 1); }
    // Плавная ходьба: персонаж идёт по очереди клеток q
    let ax = 0, ay = 0, q = [], raf = 0, tl = 0;
    function paint() {
      ctx.clearRect(0, 0, MW, MH); ctx.drawImage(sc, 0, 0, MW, MH);
      ctx.fillStyle = 'rgba(255,90,220,.55)';
      const ahead = new Set(q);
      trail.forEach(i => { if (ahead.has(i)) return; ctx.beginPath(); ctx.arc((i % C + .5) * cs, (Math.floor(i / C) + .5) * cs, cs * .1, 0, 7); ctx.fill(); });
      ctx.drawImage(ps, ax * cs, ay * cs, cs, cs);
    }
    function frame(now) {
      raf = 0; if (!root.isConnected) return;
      let dt = Math.min(64, now - (tl || now)) / 55; tl = now;
      while (q.length && dt > 0) { const tx = q[0] % C, ty = Math.floor(q[0] / C), dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy);
        if (d <= dt) { ax = tx; ay = ty; dt -= d; q.shift(); } else { ax += dx / d * dt; ay += dy / d * dt; dt = 0; } }
      paint(); if (q.length) raf = requestAnimationFrame(frame); else tl = 0;
    }
    function draw() {
      if (RM() || !window.requestAnimationFrame) { q = []; ax = pos % C; ay = Math.floor(pos / C); return paint(); }
      if (!raf) { tl = 0; raf = requestAnimationFrame(frame); }
    }
    U.cleanup(() => { if (raf) cancelAnimationFrame(raf); });
    const canGo = (i, d) => !(wall[i] & DIR[d][2]);
    const stepTo = (i, d) => i + DIR[d][0] + DIR[d][1] * C;
    function move(d) { if (!canGo(pos, d)) return false; pos = stepTo(pos, d); trail.add(pos); q.push(pos); steps++; return true; }
    function run(d, far) {
      if (done) return; clk.start();
      if (!move(d)) { api.buzz?.('tap'); U.shake(fr); return; }
      if (far) { let back = (d + 2) % 4, guard = 0;
        while (pos !== goal && guard++ < 200) { const o = [0, 1, 2, 3].filter(k => k !== back && canGo(pos, k)); if (o.length !== 1) break; move(o[0]); back = (o[0] + 2) % 4; } }
      api.sfx.click?.(); draw(); check();
    }
    function check() {
      if (pos !== goal) return; done = true; const t = clk.stop(); api.sfx.item?.();
      U.fx(() => { const r = cv.getBoundingClientRect(), d = U.el('i', null, null, document.body); Object.assign(d.style, { position: 'fixed', left: r.left + (goal % C) * cs + 'px', top: r.top + Math.floor(goal / C) * cs + 'px', width: cs + 'px', height: cs + 'px' }); U.burst(d, ['#2de2e6', '#9be8ff', '#fff', '#d4ff3a'], 14); d.remove(); }, Math.min(900, q.length * 55));
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
    U.menu(L('Сколько папок в стопке?', 'How many folders?'), [3, 4, 5, 6].map(v => ({ v, i: v, it: 1, d: Math.min(3, v - 2), t: L(`${v} ${v < 5 ? 'папки' : 'папок'}`, `${v} folders`) + (v === 5 ? ' · 🏆' : ''), s: L(`Минимум ${2 ** v - 1} ходов`, `At least ${2 ** v - 1} moves`) + (v === 5 ? L(' · рекорд считается здесь', ' · records count here') : '') })), play,
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
      U.drag(box, els, { ghost: p => done ? null : els[p].querySelector('.bg1-fd:last-of-type'), move: (f, t) => { if (t < 0 || !pegs[f].length) return; sel = -1; tap(f); tap(t); } });
      function render() {
        els.forEach((e, p) => {
          e.innerHTML = `<small>${names[p]}</small>`; e.classList.toggle('bg1-on', p === sel);
          pegs[p].forEach((sz, k) => { const f = U.el('div', 'bg1-fd' + (p === sel && k === pegs[p].length - 1 ? ' bg1-up' : ''), String(sz), e); f.style.width = `${34 + 62 * sz / n}%`; f.style.backgroundColor = COL[(sz - 1) % COL.length]; });
        });
        U.status(mv, L(`Ходов: ${moves} · минимум ${min}`, `Moves: ${moves} · minimum ${min}`), sel >= 0 ? 'me' : '');
      }
      function tap(p) {
        if (done) return;
        if (sel < 0) { if (pegs[p].length) { sel = p; api.sfx.click?.(); } render(); return; }
        if (p === sel) { sel = -1; render(); return; }
        const a = pegs[sel], t = pegs[p], f = a[a.length - 1];
        if (t.length && t[t.length - 1] < f) { api.toast(L('Большую папку нельзя класть на меньшую', 'A bigger folder can’t go on a smaller one')); api.buzz?.('danger'); U.shake(els[p]); sel = -1; render(); return; }
        const fe = els[sel].querySelector('.bg1-fd:last-of-type'), from = fe && U.mid(fe);
        clk.start(); t.push(a.pop()); sel = -1; moves++; api.sfx.click?.(); render();
        U.slide(els[p].querySelector('.bg1-fd:last-of-type'), from, 230);
        if (pegs[2].length === n) { done = true; const s = clk.stop(); U.fx(() => U.burst(els[2], ['#d4ff3a', '#ff3bd4', '#2de2e6', '#fff'], 16), 200);
          api.end({ won: true, score: n === 5 ? moves : null, lowerBetter: true, text: (moves === min ? L('Идеально! ', 'Perfect! ') : '') + L(`${n} папок в архиве: ${moves} ходов (минимум ${min}) за ${U.fmt(s)}.`, `${n} folders archived: ${moves} moves (min ${min}) in ${U.fmt(s)}.`) }); }
      }
      render();
    }
  };
})();
