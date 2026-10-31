// «☕ Разминка», игры 41–50: память и внимание (41–45) и расслабление (46–50).
// Контракт — js/break.js: BREAK_IMPL[n] = (root, api) => { … }. Всё внутри IIFE, наружу ничего не утекает.
(() => {
  const IMPL = window.BREAK_IMPL = window.BREAK_IMPL || {};

  // ---------- общие помощники ----------
  const CSS = `
.bgs5-root { position: relative; }
.bgs5-hud { display: flex; justify-content: space-between; align-items: center; gap: 6px; width: 100%; padding: 2px 0 6px; font-weight: 800; font-size: 13px; font-variant-numeric: tabular-nums; }
.bgs5-hud > span { padding: 5px 11px; border-radius: 999px; white-space: nowrap; background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03)); border: 1px solid rgba(255,255,255,.12); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 2px 8px rgba(0,0,0,.3); }
.bgs5-hud > span:empty { visibility: hidden; }
.bgs5-hud .t { color: var(--cyan-l); } .bgs5-hud .t.low { color: #ff6b88; border-color: rgba(255,59,107,.55); animation: bgs5pulse 1s ease-in-out infinite; }
.bgs5-hud .k { color: #ffb648; border-color: rgba(255,182,72,.45); }
@keyframes bgs5pulse { 50% { box-shadow: 0 0 14px rgba(255,59,107,.55); } }
.bgs5-msg { margin: 2px 0 8px; min-height: 22px; text-align: center; color: var(--text-2); font-size: 14px; line-height: 1.35; }
.bgs5-bar { width: 100%; height: 8px; border-radius: 4px; background: rgba(255,255,255,.07); box-shadow: inset 0 1px 2px rgba(0,0,0,.55); overflow: hidden; margin: 8px 0; }
.bgs5-bar i { display: block; height: 100%; width: 100%; border-radius: 4px; background: linear-gradient(90deg, #2de2e6, #ff3bd4); box-shadow: 0 0 10px rgba(255,59,212,.45); }
.bgs5-btn { padding: 10px 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,.14); background: linear-gradient(180deg, rgba(255,255,255,.11), rgba(255,255,255,.03)); color: var(--text); font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; touch-action: manipulation;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 3px 10px rgba(0,0,0,.35); transition: transform .12s ease-out, box-shadow .2s, border-color .2s, color .2s, background .2s; }
.bgs5-btn:active:not(:disabled), .btn-main.bgs5-done:active:not(:disabled) { transform: scale(.96); }
.bgs5-btn.on { border-color: var(--cyan); box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 0 16px rgba(var(--c-rgb),.4); color: var(--cyan-l); }
.bgs5-btn:disabled { opacity: .4; cursor: default; }
.bgs5-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: 100%; margin: 8px 0; }
.bgs5-done { width: auto; min-width: 180px; padding: 13px 26px; transition: transform .12s ease-out, box-shadow .3s; background: linear-gradient(90deg, var(--magenta) var(--p, 100%), rgba(var(--m-rgb),.25) var(--p, 100%)); }
.bgs5-done:disabled { box-shadow: none; color: rgba(var(--w-rgb),.75); cursor: default; }
.bgs5-calm { border-radius: 26px; padding-top: 4px; background: radial-gradient(120% 55% at 50% 0%, rgba(111,199,168,.13), transparent 65%), radial-gradient(110% 50% at 50% 100%, rgba(130,140,255,.10), transparent 70%); }
.bgs5-calm .bgs5-done { border-radius: 999px; border: 1px solid rgba(160,240,210,.35); background: linear-gradient(90deg, #9cebd0, #6fc7a8 var(--p, 100%), rgba(111,199,168,.16) var(--p, 100%)); box-shadow: 0 6px 22px rgba(111,199,168,.38), inset 0 1px 0 rgba(255,255,255,.45); color: #0b1a16; }
.bgs5-calm .bgs5-done:disabled { box-shadow: inset 0 1px 0 rgba(255,255,255,.08); color: rgba(var(--w-rgb),.8); }
.bgs5-calm .bgs5-btn.on { border-color: rgba(143,224,196,.75); color: #c9fbe8; box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 0 16px rgba(111,199,168,.35); }
.bgs5-calm .bgs5-hud > span { background: linear-gradient(180deg, rgba(200,255,235,.10), rgba(200,255,235,.03)); border-color: rgba(180,240,220,.18); }
.bgs5-shake { animation: bgs5shake .3s; }
@keyframes bgs5shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes bgs5bump { 40% { transform: scale(1.08); } }
@keyframes bgs5in { from { transform: scale(.5) translateY(-6px); opacity: 0; } }
.bgs5-cv { display: block; touch-action: none; border-radius: 18px; box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 14px 32px rgba(0,0,0,.5); }
.bgs5-pop { position: absolute; z-index: 6; pointer-events: none; font: 900 20px var(--f-display); font-variant-numeric: tabular-nums; white-space: nowrap; text-shadow: 0 2px 8px rgba(0,0,0,.7); animation: bgs5pop .9s ease-out forwards; }
@keyframes bgs5pop { 0% { opacity: 0; transform: translate(-50%, 6px) scale(.6); } 18% { opacity: 1; transform: translate(-50%, -6px) scale(1.15); } 100% { opacity: 0; transform: translate(-50%, -48px) scale(1); } }
.bgs5-spk { position: absolute; z-index: 6; width: 8px; height: 8px; margin: -4px; border-radius: 50%; pointer-events: none; background: var(--sc); box-shadow: 0 0 8px var(--sc); animation: bgs5spk .65s ease-out forwards; }
@keyframes bgs5spk { to { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0; } }
/* 41 */
.bg41-desk { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; width: 100%; padding: 12px; margin: 4px 0 2px; border-radius: 20px; transition: filter .25s;
  background: radial-gradient(70% 55% at 22% 0%, rgba(255,214,150,.26), transparent 70%), repeating-linear-gradient(91deg, transparent 0 6px, rgba(0,0,0,.08) 6px 8px, rgba(255,235,200,.03) 8px 15px, transparent 15px 23px), linear-gradient(170deg, #77523a, #54382a 55%, #3e2a1e);
  border: 1px solid #9a7050; box-shadow: inset 0 2px 0 rgba(255,230,190,.28), inset 0 -12px 26px rgba(0,0,0,.35), 0 0 0 5px #2a1c13, 0 0 0 6px rgba(255,255,255,.08), 0 14px 30px rgba(0,0,0,.55); }
.bg41-c { aspect-ratio: 1.15; display: grid; place-items: center; font-size: clamp(26px, 8vw, 40px); border-radius: 12px; background: rgba(0,0,0,.13); box-shadow: inset 0 1px 3px rgba(0,0,0,.35), 0 1px 0 rgba(255,235,200,.06); }
.bg41-c i { font-style: normal; filter: drop-shadow(0 4px 3px rgba(0,0,0,.45)); animation: bgs5in .3s cubic-bezier(.3,1.5,.6,1) backwards; animation-delay: var(--d, 0s); }
.bg41-off { filter: blur(8px) brightness(.4) saturate(.5); }
.bg41-opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; margin-top: 2px; }
.bg41-opts .bgs5-btn { grid-column: 1 / -1; padding: 13px; border-color: rgba(var(--c-rgb),.6); color: var(--cyan-l); }
.bg41-o { aspect-ratio: 1.9; font-size: 30px; border-radius: 14px; border: 1px solid rgba(255,255,255,.12); cursor: pointer; touch-action: manipulation; background: radial-gradient(60% 70% at 50% 30%, rgba(255,255,255,.08), transparent 70%), linear-gradient(180deg, #25253c, #17172a);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 4px 12px rgba(0,0,0,.4); transition: transform .12s ease-out, box-shadow .2s, opacity .2s; animation: bgs5in .25s ease-out backwards; animation-delay: var(--d, 0s); }
.bg41-o:active:not(:disabled) { transform: scale(.94); }
.bg41-o.ok { border-color: #3ee08f; background: linear-gradient(180deg, #1f5039, #133325); box-shadow: 0 0 18px rgba(62,224,143,.55); animation: bgs5bump .3s; }
.bg41-o.bad { border-color: #ff3b6b; background: linear-gradient(180deg, #4e1d2c, #2a121a); opacity: .75; }
/* 42 */
.bg42-chute { position: relative; width: 100%; height: 240px; overflow: hidden; border-radius: 18px; border: 1px solid rgba(255,255,255,.1);
  background: linear-gradient(180deg, rgba(0,0,0,.4), transparent 28%), repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 2px, transparent 2px 46px), linear-gradient(180deg, #1d1d30, #111120); box-shadow: inset 0 10px 22px rgba(0,0,0,.55); }
.bg42-chute::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: linear-gradient(90deg, transparent, rgba(255,59,107,.75), transparent); box-shadow: 0 0 12px rgba(255,59,107,.6); }
.bg42-l { position: absolute; left: 50%; top: 0; width: min(80%, 300px); padding: 13px 44px 14px 13px; border-radius: 10px; color: #2a2433; cursor: grab; touch-action: none;
  background: linear-gradient(180deg, #fffaf0, #eee4cf); box-shadow: 0 12px 24px rgba(0,0,0,.55), inset 0 -2px 0 rgba(0,0,0,.08), inset 0 1px 0 #fff; }
.bg42-l::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 5px; border-radius: 10px 10px 0 0; background: repeating-linear-gradient(135deg, #e8455f 0 8px, #fffaf0 8px 13px, #3a7be0 13px 21px, #fffaf0 21px 26px); }
.bg42-l::after { content: '✉'; position: absolute; right: 10px; top: 12px; width: 24px; height: 28px; display: grid; place-items: center; font-size: 14px; color: #8a3a2a; border-radius: 3px; transform: rotate(5deg);
  background: linear-gradient(135deg, #ffd88a, #ff9f73); outline: 2px dotted #fffaf0; outline-offset: -3px; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.bg42-l small { display: block; font-size: 11px; color: #7a7088; }
.bg42-l b { display: block; font-size: 16px; line-height: 1.2; margin: 3px 0 4px; }
.bg42-st { position: absolute; right: 10px; bottom: -9px; padding: 2px 8px; border: 2px solid var(--sc); color: var(--sc); background: #2a2433; border-radius: 6px; font-size: 11px; font-weight: 900; letter-spacing: .04em; transform: rotate(-6deg); text-transform: uppercase; box-shadow: 0 3px 8px rgba(0,0,0,.35); }
.bg42-l.fly { transition: transform .22s ease-in, opacity .22s; opacity: 0; }
.bg42-f { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; width: 100%; margin-top: 18px; }
.bg42-f button { position: relative; padding: 10px 2px 8px; border-radius: 4px 12px 12px 12px; border: 0; border-top: 2px solid var(--fc); color: #fff; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fc) 42%, #1a1a28), color-mix(in srgb, var(--fc) 18%, #12121d)); box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 6px 14px rgba(0,0,0,.45); transition: transform .15s ease-out, box-shadow .2s; }
.bg42-f button::before { content: ''; position: absolute; left: 0; top: -9px; width: 46%; height: 9px; border-radius: 6px 8px 0 0; background: color-mix(in srgb, var(--fc) 55%, #1a1a28); box-shadow: inset 0 1px 0 rgba(255,255,255,.2); }
.bg42-f button span { display: block; font-size: 26px; filter: drop-shadow(0 3px 3px rgba(0,0,0,.45)); }
.bg42-f button:active { transform: scale(.95); }
.bg42-f button.ok { box-shadow: 0 0 22px var(--fc), inset 0 1px 0 rgba(255,255,255,.3); transform: scale(1.06); } .bg42-f button.bad { background: linear-gradient(180deg, #5a1e2e, #2a121a); border-top-color: #ff3b6b; }
/* 43 */
.bg43-card { width: 100%; margin: 4px 0 2px; padding: 8px 8px 4px; border-radius: 22px; border: 1px solid rgba(255,255,255,.1); background: radial-gradient(80% 100% at 50% 0%, rgba(255,255,255,.08), transparent 70%), linear-gradient(180deg, #1d1d30, #111120); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.45); }
.bg43-word { min-height: 96px; display: grid; place-items: center; font-size: clamp(32px, 10.5vw, 56px); font-weight: 900; letter-spacing: .03em; font-family: var(--f-display); }
.bg43-word span { display: inline-block; animation: bg43in .18s ease-out; text-shadow: 0 0 22px color-mix(in srgb, currentColor 45%, transparent), 0 3px 0 rgba(0,0,0,.45); }
@keyframes bg43in { from { scale: .75; opacity: 0; } }
.bg43-pad { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; margin-top: 12px; }
.bg43-pad button { padding: 18px 6px; border-radius: 16px; border: 0; color: #10101a; font: inherit; font-size: 15px; font-weight: 900; letter-spacing: .03em; cursor: pointer; touch-action: manipulation; transition: transform .1s ease-out;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bc), #fff 28%), var(--bc) 55%, color-mix(in srgb, var(--bc), #000 15%)); box-shadow: inset 0 2px 0 rgba(255,255,255,.45), inset 0 -3px 0 rgba(0,0,0,.2), 0 6px 16px color-mix(in srgb, var(--bc) 35%, transparent); }
.bg43-pad button:active { transform: scale(.95); }
.bg43-pad button:last-child:nth-child(odd) { grid-column: 1 / -1; }
.bg43-fb { height: 22px; font-weight: 800; text-align: center; font-size: 14px; }
/* 44 */
.bg44-calc { width: 100%; max-width: 370px; margin-top: 6px; padding: 14px; border-radius: 26px; border: 1px solid rgba(255,255,255,.12); background: linear-gradient(170deg, #2a2a42, #16162a); box-shadow: inset 0 1px 0 rgba(255,255,255,.14), inset 0 -4px 10px rgba(0,0,0,.35), 0 16px 34px rgba(0,0,0,.5); }
.bg44-lcd { padding: 10px 16px 8px; border-radius: 14px; text-align: right; background: linear-gradient(180deg, #11302a, #0a1d19); box-shadow: inset 0 3px 12px rgba(0,0,0,.75), 0 1px 0 rgba(255,255,255,.08); }
.bg44-q { font: 900 clamp(22px, 7vw, 32px) var(--f-mono); color: #9fffd6; text-shadow: 0 0 10px rgba(80,255,190,.45); white-space: nowrap; }
.bg44-a { min-height: 50px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(159,255,214,.22); font: 900 36px/46px var(--f-mono); color: #eafff6; text-shadow: 0 0 12px rgba(160,255,220,.5); }
.bg44-a:empty::after { content: '_'; opacity: .45; animation: bg44blink 1s steps(1) infinite; }
@keyframes bg44blink { 50% { opacity: 0; } }
.bg44-a.ok { color: #d4ff3a; text-shadow: 0 0 14px rgba(212,255,58,.6); } .bg44-a.bad { color: #ff6b88; text-shadow: 0 0 14px rgba(255,59,107,.6); }
.bg44-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; width: 100%; margin-top: 14px; }
.bg44-pad button { padding: 13px 0; border-radius: 14px; border: 1px solid rgba(255,255,255,.1); color: var(--text); font: 800 24px var(--f-mono); cursor: pointer; touch-action: manipulation; transition: transform .08s, box-shadow .08s;
  background: linear-gradient(180deg, #34344e, #24243a); box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 4px 0 #101020, 0 6px 12px rgba(0,0,0,.35); }
.bg44-pad button:active { transform: translateY(3px); box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 1px 0 #101020; }
.bg44-pad .bk { color: #ffb0c0; }
.bg44-pad .go { color: #fff; border: 0; background: linear-gradient(180deg, #ff6be0, #ff3bd4 55%, #c81fa6); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 4px 0 #7a1066, 0 6px 16px rgba(255,59,212,.4); }
.bg44-pad .go:active { box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 1px 0 #7a1066; }
/* 45 */
.bg45-dots { display: flex; justify-content: center; gap: 6px; margin: 0 0 8px; }
.bg45-dots i { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,.12); box-shadow: inset 0 1px 2px rgba(0,0,0,.5); transition: background .25s, transform .25s; }
.bg45-dots i.cur { background: var(--cyan); transform: scale(1.3); box-shadow: 0 0 8px rgba(var(--c-rgb),.7); } .bg45-dots i.y { background: #3ee08f; } .bg45-dots i.n { background: #ff3b6b; }
.bg45-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; }
.bg45-grid button { aspect-ratio: 1.35; font-size: clamp(40px, 13vw, 60px); border-radius: 20px; border: 1px solid rgba(255,255,255,.12); cursor: pointer; touch-action: manipulation;
  background: radial-gradient(60% 55% at 50% 45%, rgba(255,255,255,.10), transparent 70%), linear-gradient(180deg, #24243c, #15152a); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 8px 20px rgba(0,0,0,.45);
  transition: transform .15s ease-out, opacity .25s, box-shadow .25s; animation: bgs5in .3s cubic-bezier(.3,1.4,.6,1) backwards; animation-delay: var(--d, 0s); }
.bg45-grid button span { display: inline-block; filter: drop-shadow(0 6px 5px rgba(0,0,0,.45)); }
.bg45-grid button:active:not(:disabled) { transform: scale(.95); }
.bg45-grid button.ok { border-color: #3ee08f; background: radial-gradient(60% 55% at 50% 45%, rgba(62,224,143,.25), transparent 70%), linear-gradient(180deg, #1d4434, #12261e); box-shadow: 0 0 22px rgba(62,224,143,.5); animation: bgs5bump .35s; }
.bg45-grid button.bad { border-color: #ff3b6b; background: linear-gradient(180deg, #4a1d2a, #26121a); }
.bg45-grid button.dim { opacity: .35; transform: scale(.96); }
.bg45-why { min-height: 44px; margin: 10px 0 0; padding: 0 6px; text-align: center; font-size: 15px; line-height: 1.35; }
.bg45-why:not(:empty) { padding: 9px 12px; border-radius: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); animation: bgs5in .25s ease-out; }
/* 46 */
.bg46-pats { display: flex; gap: 8px; width: 100%; margin: 4px 0; }
.bg46-pat { flex: 1; display: flex; align-items: center; gap: 8px; text-align: left; padding: 8px 10px; }
.bg46-pat > span { font-size: 22px; } .bg46-pat b { display: block; font-size: 13px; } .bg46-pat small { display: block; font-size: 11px; font-weight: 600; color: var(--text-2); }
.bg46-snd { flex: none; width: 48px; padding: 0; font-size: 20px; }
.bg46-stage { --s: 0; position: relative; width: min(100%, 310px); aspect-ratio: 1; display: grid; place-items: center; margin: 4px 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(120,200,220,.13), rgba(80,90,180,.06) 55%, transparent 70%); }
.bg46-ring { position: absolute; inset: 3%; border-radius: 50%; background: conic-gradient(rgba(170,245,220,.9) var(--a, 0deg), rgba(255,255,255,.07) 0);
  -webkit-mask: radial-gradient(closest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)); mask: radial-gradient(closest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)); filter: drop-shadow(0 0 6px rgba(170,245,220,.5)); }
.bg46-fl { position: absolute; inset: 0; transform: rotate(calc(var(--s) * 45deg)); }
.bg46-fl i { position: absolute; left: 50%; top: 50%; width: 44%; height: 44%; margin: -22% 0 0 -22%; border-radius: 50%; mix-blend-mode: screen;
  background: radial-gradient(circle at 50% 40%, rgba(170,240,225,.55), rgba(110,160,255,.22) 60%, rgba(110,160,255,0) 72%);
  transform: rotate(calc(var(--k) * 60deg)) translateY(calc(var(--s) * -42%)) scale(calc(.55 + var(--s) * .45)); }
.bg46-c { position: absolute; width: 50%; aspect-ratio: 1; border-radius: 50%; transform: scale(.45);
  background: radial-gradient(circle at 38% 32%, rgba(255,255,255,.9), rgba(180,240,235,.75) 18%, rgba(100,180,210,.55) 55%, rgba(60,100,170,.3)); box-shadow: 0 0 40px rgba(140,220,230,.45), inset 0 -10px 24px rgba(40,70,140,.35); }
.bg46-txt { position: relative; text-align: center; color: #f2fbff; text-shadow: 0 1px 10px rgba(10,20,40,.7); }
.bg46-txt b { display: block; font-size: 22px; } .bg46-txt span { font: 900 40px var(--f-mono); font-variant-numeric: tabular-nums; }
.bg46-d { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: rgba(210,255,240,.7); box-shadow: 0 0 6px rgba(200,255,240,.8); animation: bg46d var(--t) linear infinite; animation-delay: var(--dl); opacity: 0; }
@keyframes bg46d { 0% { transform: translateY(20px); opacity: 0; } 20% { opacity: .8; } 100% { transform: translateY(-120px); opacity: 0; } }
/* 47 */
.bg47-info { width: 100%; display: flex; justify-content: center; gap: 6px; margin-bottom: 8px; font-size: 11px; color: var(--text-2); }
.bg47-info > div { flex: 1; display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 14px; background: linear-gradient(180deg, rgba(200,255,235,.10), rgba(200,255,235,.03)); border: 1px solid rgba(180,240,220,.16); line-height: 1.15; }
.bg47-info > div > span { font-size: 18px; } .bg47-info b { display: block; color: var(--text); font-size: 15px; font-variant-numeric: tabular-nums; }
.bg47-wat { border-color: rgba(120,200,255,.6) !important; color: #cfeaff !important; box-shadow: 0 0 16px rgba(90,170,255,.35), inset 0 1px 0 rgba(255,255,255,.15) !important; background: linear-gradient(180deg, rgba(120,190,255,.22), rgba(120,190,255,.06)) !important; }
/* 48 */
.bg48-hud { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 10px; font-weight: 800; font-size: 13px; }
.bg48-meter { flex: 1; height: 14px; border-radius: 7px; background: rgba(255,255,255,.07); box-shadow: inset 0 1px 3px rgba(0,0,0,.5); overflow: hidden; border: 1px solid rgba(255,255,255,.08); }
.bg48-meter i { display: block; height: 100%; width: 0; border-radius: 7px; background: linear-gradient(90deg, #ffb3cf, #ff7ab8 60%, #ff5ca8); box-shadow: 0 0 12px rgba(255,120,180,.6), inset 0 1px 0 rgba(255,255,255,.5); transition: width .15s; }
.bg48-hud .h { font-size: 20px; transition: transform .2s; } .bg48-hud .h.on { animation: bg48beat .7s ease-in-out infinite; }
.bg48-hud .pc { min-width: 46px; text-align: right; font-variant-numeric: tabular-nums; }
@keyframes bg48beat { 30% { transform: scale(1.25); } 60% { transform: scale(.95); } }
/* 49 */
.bg49-sheet { position: relative; display: grid; gap: var(--g); padding: 12px 10px; width: 100%; border-radius: 16px; touch-action: none; overflow: hidden;
  background: linear-gradient(125deg, rgba(255,255,255,.16), rgba(255,255,255,.04) 35%, rgba(255,255,255,.10) 55%, rgba(255,255,255,.03) 80%), linear-gradient(160deg, #6a6fb0, #4c7f9a 55%, #5a9a8e);
  border: 1px solid rgba(230,245,255,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 14px 30px rgba(0,0,0,.45); }
.bg49-r { display: flex; justify-content: center; gap: var(--g); }
.bg49-b { position: relative; width: var(--s); height: var(--s); flex: none; border-radius: 50%;
  background: radial-gradient(circle at 33% 28%, rgba(255,255,255,.95) 0 7%, rgba(255,255,255,.4) 13%, rgba(220,240,255,.12) 40%, rgba(200,230,255,.2) 68%, rgba(255,255,255,.55) 78%, rgba(200,230,255,.08) 84%);
  box-shadow: inset 0 -4px 6px rgba(60,90,160,.28), inset 0 2px 3px rgba(255,255,255,.35), 0 3px 5px rgba(20,30,70,.3); }
.bg49-b.p { background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.05), rgba(255,255,255,.12) 55%, rgba(255,255,255,.22) 66%, transparent 72%), conic-gradient(from 20deg, rgba(255,255,255,.07), transparent 20%, rgba(255,255,255,.1) 40%, transparent 60%, rgba(255,255,255,.08) 80%, transparent);
  box-shadow: inset 0 1px 3px rgba(20,30,70,.35); animation: bg49pop .2s ease-out; }
.bg49-b.p::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; border: 2px solid rgba(255,255,255,.8); pointer-events: none; animation: bg49ring .35s ease-out forwards; }
@keyframes bg49pop { 0% { transform: scale(1.18); } 100% { transform: scale(.9); } }
@keyframes bg49ring { from { transform: scale(.8); opacity: 1; } to { transform: scale(1.7); opacity: 0; } }
.bg49-cnt { font: 900 22px var(--f-mono); color: #d8f0ff; text-shadow: 0 0 10px rgba(160,220,255,.5); }
.bg49-hud > span { display: flex; align-items: center; gap: 6px; padding: 3px 12px; }
/* 50 */
.bgs5-row.bg50-tools { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 4px 0 8px; }
.bg50-tools .bgs5-btn { padding: 6px 2px 5px; font-size: 11px; line-height: 1.15; } .bg50-tools .bgs5-btn span { display: block; font-size: 19px; margin-bottom: 1px; }
.bg50-wrap { position: relative; border-radius: 18px; overflow: hidden;
  background: repeating-linear-gradient(90deg, rgba(0,0,0,.0) 0 5px, rgba(0,0,0,.12) 5px 6px, rgba(255,220,180,.05) 6px 11px, transparent 11px 17px), linear-gradient(160deg, #6a4a32, #3e2a1c);
  box-shadow: inset 0 1px 0 rgba(255,220,180,.35), inset 0 -2px 0 rgba(0,0,0,.4), 0 14px 32px rgba(0,0,0,.55); }
.bg50-wrap canvas { position: absolute; left: 6px; top: 6px; border-radius: 12px; }
.bg50-wrap canvas + canvas { pointer-events: none; }
.bg50-wrap::after { content: ''; position: absolute; inset: 6px; border-radius: 12px; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(0,0,0,.35), inset 0 4px 14px rgba(60,40,20,.45), inset 0 0 40px rgba(90,70,40,.25);
  background: radial-gradient(90% 70% at 20% 0%, rgba(255,240,210,.16), transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(60,40,30,.12), transparent 70%); }
@media (prefers-reduced-motion: reduce) { .bgs5-shake { animation: none; } .bgs5-spk, .bg46-d { display: none; } .bg49-b.p::after { display: none; } }
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
  const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
  const shake = el => { if (RM()) return; el.classList.remove('bgs5-shake'); void el.offsetWidth; el.classList.add('bgs5-shake'); };
  const prep = (root, calm) => { style(); root.classList.add('bgs5-root'); if (calm) root.classList.add('bgs5-calm'); };
  // Всплывающие «+10» и искры — относительно root (position: relative)
  const relPos = (root, el) => { const r = el.getBoundingClientRect(), o = root.getBoundingClientRect(); return [r.left - o.left + r.width / 2, r.top - o.top + r.height / 2]; };
  const popTxt = (root, el, txt, col = '#d4ff3a') => { const [x, y] = relPos(root, el), s = document.createElement('span'); s.className = 'bgs5-pop'; s.textContent = txt; s.style.cssText = `left:${x}px;top:${y - 16}px;color:${col}`; root.append(s); setTimeout(() => s.remove(), 950); };
  const burst = (root, el, cols, n = 10) => {
    if (RM()) return; const [x, y] = relPos(root, el);
    for (let i = 0; i < n; i++) { const s = document.createElement('i'), a = Math.random() * 6.283, d = 28 + Math.random() * 42; s.className = 'bgs5-spk'; s.style.cssText = `left:${x}px;top:${y}px;--sc:${cols[i % cols.length]};--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px`; root.append(s); setTimeout(() => s.remove(), 700); }
  };
  // Цвета для канваса: смешать hex с другим hex (t=0 — первый)
  const hexRgb = h => { h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  const offCv = (w, h) => { const d = DPR(), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * d)); cv.height = Math.max(1, Math.round(h * d)); const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return [cv, c]; };

  // ================= 41. Запомни стол =================
  const DESK = ['📎', '✏️', '🖊️', '📏', '📐', '📌', '🗂️', '📁', '📒', '🧮', '☕', '🍪', '🖥️', '⌨️', '🖱️', '📱', '🎧', '💡', '🪴', '🔑', '✂️', '🗓️', '📦', '🍎', '🧾', '🖨️', '⏰', '🏆', '🧸', '🕶️', '🍩', '🧃', '📷', '🔦', '🧲', '🍌'];
  IMPL[41] = (root, api) => {
    prep(root); const K = kit(api), L = api.L;
    const PLAN = [[8, 1], [9, 1], [10, 's'], [11, 2], [12, 2]];
    let round = -1, score = 0, good = 0, phase = 'idle', tLeft = 0, tMax = 1, tAsk = 0, cur = null, gone = [], found = 0;
    root.innerHTML = `<div class="bgs5-hud"><span class="r"></span><span class="s"></span></div><p class="bgs5-msg"></p>
      <div class="bg41-desk"></div><div class="bgs5-bar"><i></i></div><div class="bg41-opts"></div>`;
    const q = s => root.querySelector(s), desk = q('.bg41-desk'), opts = q('.bg41-opts'), msg = q('.bgs5-msg'), bar = q('.bgs5-bar i');
    const hud = () => { q('.r').textContent = L(`Раунд ${round + 1} из 5`, `Round ${round + 1} of 5`); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); };
    const draw = cells => { let k = 0; desk.innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="bg41-c">${cells[i] ? `<i style="--d:${(k++ * .04).toFixed(2)}s">${cells[i]}</i>` : ''}</span>`).join(''); };
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
        opts.innerHTML = ch.map((e, i) => `<button class="bg41-o" type="button" data-e="${e}" style="--d:${i * .04}s">${e}</button>`).join('');
        opts.querySelectorAll('button').forEach(b => { b.onclick = () => pick(b); });
      });
    };
    const pick = b => {
      if (phase !== 'ask' || b.disabled) return;
      b.disabled = true;
      if (gone.includes(b.dataset.e)) {
        const pts = 10 + Math.max(0, 5 - Math.floor(tAsk));
        b.classList.add('ok'); found++; score += pts; hud(); api.sfx.item?.(); popTxt(root, b, `+${pts}`); burst(root, b, ['#3ee08f', '#d4ff3a', '#fff']);
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
    prep(root); const K = kit(api), L = api.L, R = api.rng;
    let time = 60, score = 0, ok = 0, streak = 0, el = 0, cur = null, y = 0, drag = null, over = false;
    root.innerHTML = `<div class="bgs5-hud"><span class="t"></span><span class="s"></span><span class="k"></span></div><div class="bgs5-bar tb"><i></i></div>
      <p class="bgs5-msg">${L('Перетащите письмо в папку или нажмите на папку', 'Drag the letter to a folder or tap the folder')}</p>
      <div class="bg42-chute"></div><div class="bg42-f">${DEPTS.map((d, i) => `<button type="button" data-d="${i}" style="--fc:${d.c}"><span>${d.i}</span>${L(...d.n)}</button>`).join('')}</div>`;
    const q = s => root.querySelector(s), chute = q('.bg42-chute'), folders = [...root.querySelectorAll('[data-d]')];
    const hud = () => { const t = q('.t'); t.textContent = fmtT(time); t.classList.toggle('low', time < 10); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); q('.k').textContent = streak >= 3 ? `🔥×${streak}` : ''; q('.tb i').style.width = Math.max(0, time / 60 * 100) + '%'; };
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
      if (i === c.d) { ok++; streak++; const pts = 10 + 2 * Math.min(streak, 5); score += pts; flash(i, 'ok'); api.sfx.stapler?.(); api.buzz('tap'); K.after(150, () => { popTxt(root, folders[i], `+${pts}`, DEPTS[i].c); burst(root, folders[i], [DEPTS[i].c, '#fff'], 8); }); }
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
    prep(root); const K = kit(api), L = api.L, R = api.rng;
    let time = 45, el = 0, score = 0, right = 0, wrong = 0, streak = 0, ink = 0, nC = 4, over = false, order = [0, 1, 2, 3];
    root.innerHTML = `<div class="bgs5-hud"><span class="t"></span><span class="s"></span><span class="k"></span></div>
      <p class="bgs5-msg">${L('Жмите цвет, которым написано слово', 'Tap the colour the word is written in')}</p>
      <div class="bgs5-bar tb"><i></i></div><div class="bg43-card"><div class="bg43-word"></div><div class="bg43-fb"></div></div><div class="bg43-pad"></div>`;
    const q = s => root.querySelector(s), word = q('.bg43-word'), pad = q('.bg43-pad'), fb = q('.bg43-fb');
    const hud = () => { const t = q('.t'); t.textContent = fmtT(time); t.classList.toggle('low', time < 10); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); q('.k').textContent = streak >= 3 ? `🔥×${streak}` : ''; q('.tb i').style.width = Math.max(0, time / 45 * 100) + '%'; };
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
      if (i === ink) { right++; streak++; const pts = 10 + Math.min(streak, 10); score += pts; fb.textContent = '✓'; fb.style.color = 'var(--up)'; popTxt(root, word, `+${pts}`, INKS[ink][2]); api.buzz('tap'); beep(880 + Math.min(streak, 8) * 40, .08, 'triangle', .04); }
      else { wrong++; streak = 0; score = Math.max(0, score - 5); fb.textContent = L(`✗ Это был ${INKS[ink][0].toLowerCase()}`, `✗ It was ${INKS[ink][1].toLowerCase()}`); fb.style.color = 'var(--down)'; api.sfx.stamp?.(); api.buzz('danger'); shake(q('.bg43-card')); }
      hud(); next();
    };
    K.loop(dt => { if (over) return; time -= dt; el += dt; if (time <= 0) { over = true; time = 0; api.end({ score, won: right >= 15, text: L(`Верно: ${right} · ошибок: ${wrong}`, `Correct: ${right} · mistakes: ${wrong}`) }); } hud(); });
    hud(); next();
  };

  // ================= 44. Бухгалтерия в уме =================
  IMPL[44] = (root, api) => {
    prep(root); const K = kit(api), L = api.L, R = api.rng;
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
      <div class="bgs5-bar tb"><i></i></div><div class="bg44-calc"><div class="bg44-lcd"><div class="bg44-q"></div><div class="bg44-a"></div></div>
      <div class="bg44-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" data-k="${d}">${d}</button>`).join('')}<button type="button" class="bk" data-k="b">⌫</button><button type="button" data-k="0">0</button><button type="button" class="go" data-k="ok">✓</button></div></div>`;
    const q = s => root.querySelector(s), qEl = q('.bg44-q'), aEl = q('.bg44-a');
    const hud = () => { const t = q('.t'); t.textContent = fmtT(time); t.classList.toggle('low', time < 10); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); q('.lv').textContent = L(`Уровень ${lv + 1}`, `Level ${lv + 1}`); q('.tb i').style.width = Math.max(0, time / 60 * 100) + '%'; };
    const next = () => { lv = Math.min(4, Math.floor(solved / 3)); task = gen(lv); qEl.textContent = `${task[0]} = ?`; inp = ''; aEl.textContent = ''; aEl.className = 'bg44-a'; lock = false; hud(); };
    const fail = () => {
      wrong++; time -= 3; lock = true; aEl.className = 'bg44-a bad'; aEl.textContent = `${task[1]}`; api.sfx.stamp?.(); api.buzz('danger'); shake(q('.bg44-calc')); popTxt(root, aEl, L('−3 с', '−3 s'), '#ff6b88');
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
    const win = () => { solved++; score += PTS[lv]; lock = true; aEl.className = 'bg44-a ok'; popTxt(root, aEl, `+${PTS[lv]}`); burst(root, aEl, ['#d4ff3a', '#9fffd6', '#fff'], 8); api.buzz('tap'); beep(1046, .09, 'triangle', .05); beep(1568, .1, 'triangle', .04, .06); K.after(250, () => { if (!over) next(); }); };
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
    prep(root); const K = kit(api), L = api.L, R = api.rng;
    const sets = api.shuffle(ODD, R).slice(0, 10);
    let round = -1, right = 0, score = 0, t = 0, busy = false;
    root.innerHTML = `<div class="bgs5-hud"><span class="r"></span><span class="s"></span></div>
      <p class="bgs5-msg">${L('Какой предмет здесь лишний?', 'Which one doesn’t belong?')}</p><div class="bg45-dots">${'<i></i>'.repeat(10)}</div><div class="bg45-grid"></div><p class="bg45-why"></p><div class="bgs5-row"></div>`;
    const q = s => root.querySelector(s), grid = q('.bg45-grid'), why = q('.bg45-why'), row = q('.bgs5-row'), dots = [...root.querySelectorAll('.bg45-dots i')];
    const hud = () => { q('.r').textContent = L(`Вопрос ${round + 1} из 10`, `Question ${round + 1} of 10`); q('.s').textContent = L(`Очки: ${score}`, `Score: ${score}`); };
    K.loop(dt => { if (!busy) t += dt; });
    const next = () => {
      round++; if (round >= 10) return api.end({ score, won: right >= 6, text: L(`Верных ответов: ${right} из 10`, `Correct answers: ${right} of 10`) });
      const [s] = sets[round], [a, b] = s.split('|'), odd = b.trim(), items = api.shuffle([...a.trim().split(/\s+/), odd], R);
      grid.innerHTML = items.map((e, i) => `<button type="button" data-e="${e}" style="--d:${i * .05}s"><span>${e}</span></button>`).join('');
      dots[round].classList.add('cur');
      why.textContent = ''; row.innerHTML = ''; busy = false; t = 0; hud();
      grid.querySelectorAll('button').forEach(btn => { btn.onclick = () => pick(btn, odd); });
    };
    const pick = (btn, odd) => {
      if (busy) return; busy = true;
      const set = sets[round], good = btn.dataset.e === odd;
      grid.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.dataset.e === odd) x.classList.add('ok'); else if (x !== btn) x.classList.add('dim'); });
      dots[round].classList.remove('cur'); dots[round].classList.add(good ? 'y' : 'n');
      if (good) { const pts = 10 + (t <= 3 ? 5 : t <= 6 ? 2 : 0); right++; score += pts; api.sfx.item?.(); popTxt(root, btn, `+${pts}`); burst(root, btn, ['#3ee08f', '#d4ff3a', '#fff'], 12); }
      else { btn.classList.add('bad'); api.sfx.stamp?.(); api.buzz('danger'); shake(btn); }
      why.innerHTML = `${good ? '✅' : '❌'} ${api.esc(L(set[1], set[2]))}`; hud();
      row.innerHTML = `<button class="bgs5-btn on" type="button" style="min-width:160px;padding:12px 22px">${round < 9 ? L('Дальше →', 'Next →') : L('Итог', 'Finish')}</button>`;
      row.querySelector('button').onclick = next;
    };
    next();
  };

  // ================= 46. Дыхание перед планёркой =================
  IMPL[46] = (root, api) => {
    prep(root); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const PAT = {
      box: { n: L('Квадрат', 'Box'), i: '🔷', sub: L('4-4-4-4 · фокус', '4-4-4-4 · focus'), ph: [['in', 4], ['hold', 4], ['out', 4], ['hold2', 4]] },
      r478: { n: L('4-7-8', '4-7-8'), i: '🌙', sub: L('глубокий покой', 'deep calm'), ph: [['in', 4], ['hold', 7], ['out', 8]] },
    };
    const CUE = { in: L('Вдох', 'Breathe in'), hold: L('Задержка', 'Hold'), out: L('Выдох', 'Breathe out'), hold2: L('Пауза', 'Pause') };
    let pat = 'box', run = false, done = false, el = 0, pi = 0, pt = 0, cycles = 0, snd = soundOn(), lastSec = -1;
    const dust = Array.from({ length: 10 }, (_, i) => `<b class="bg46-d" style="left:${12 + (i * 37) % 76}%;top:${40 + (i * 23) % 50}%;--t:${6 + (i % 4) * 1.7}s;--dl:${-(i * 1.3).toFixed(1)}s"></b>`).join('');
    root.innerHTML = `<div class="bg46-pats">${Object.entries(PAT).map(([k, p]) => `<button type="button" class="bgs5-btn bg46-pat${k === pat ? ' on' : ''}" data-p="${k}"><span>${p.i}</span><span><b>${p.n}</b><small>${p.sub}</small></span></button>`).join('')}
      <button type="button" class="bgs5-btn bg46-snd snd" aria-label="${L('Звук', 'Sound')}">${snd ? '🔔' : '🔕'}</button></div>
      <div class="bg46-stage">${dust}<div class="bg46-ring"></div><div class="bg46-fl">${[0, 1, 2, 3, 4, 5].map(k => `<i style="--k:${k}"></i>`).join('')}</div><div class="bg46-c"></div><div class="bg46-txt"><b>${L('Сядьте удобно', 'Get comfortable')}</b><span></span></div></div>
      <p class="bgs5-msg">${L('Плечи вниз, телефон на беззвучный. Минута — только для вас.', 'Shoulders down, phone on silent. One minute just for you.')}</p>
      <div class="bgs5-bar"><i style="width:0%"></i></div>
      <div class="bgs5-row"><button type="button" class="bgs5-btn on go" style="padding:13px 22px">▶ ${L('Начать', 'Start')}</button><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), stage = q('.bg46-stage'), circ = q('.bg46-c'), cue = q('.bg46-txt b'), num = q('.bg46-txt span'), bar = q('.bgs5-bar i'), msg = q('.bgs5-msg'), go = q('.go');
    const dBtn = q('.bgs5-done'); let unlockT = 0;
    dBtn.disabled = true; dBtn.style.setProperty('--p', '0%');
    dBtn.onclick = () => { if (!dBtn.disabled) api.end({ won: true, score: null, text: L(`Дыхательных циклов: ${cycles}. Теперь можно и на планёрку.`, `Breathing cycles: ${cycles}. Ready for the stand-up.`) }); };
    root.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { if (run) return; pat = b.dataset.p; root.querySelectorAll('[data-p]').forEach(x => x.classList.toggle('on', x === b)); }; });
    q('.snd').onclick = e => { snd = !snd; e.currentTarget.textContent = snd ? '🔔' : '🔕'; };
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
          if (el >= 56) { run = false; done = true; circ.style.transform = 'scale(.6)'; stage.style.setProperty('--s', '.3'); stage.style.setProperty('--a', '360deg'); cue.textContent = L('Отлично', 'Well done'); num.textContent = '🌿'; msg.textContent = L('Спокойствие сохранено. Можно возвращаться к делам.', 'Calm restored. Back to work when you’re ready.'); bar.style.width = '100%'; dBtn.disabled = false; dBtn.style.setProperty('--p', '100%'); go.disabled = false; go.textContent = L('Ещё минуту', 'One more minute'); el = 0; root.querySelectorAll('[data-p]').forEach(b => { b.disabled = false; }); return; }
        }
        [kind, dur] = ph[pi]; lastSec = -1; chime(kind);
      }
      const x = Math.min(1, pt / dur), sc = kind === 'in' ? .45 + .55 * ease(x) : kind === 'out' ? 1 - .55 * ease(x) : kind === 'hold' ? 1 : .45;
      circ.style.transform = `scale(${sc.toFixed(4)})`; stage.style.setProperty('--s', ((sc - .45) / .55).toFixed(4)); stage.style.setProperty('--a', (x * 360).toFixed(1) + 'deg');
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
    prep(root); const K = kit(api), L = api.L;
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
    const w = W(root), h = Math.round(Math.min(w * 1.05, Math.max(300, innerHeight - 298), 460));
    root.innerHTML = `<div class="bg47-info"><div><span>🌱</span><div><b class="st"></b>${L('стадия', 'stage')}</div></div><div><span>🔥</span><div><b class="sk"></b>${L('дней подряд', 'day streak')}</div></div><div><span>💧</span><div><b class="nx"></b>${L('до роста', 'to grow')}</div></div></div>
      <canvas class="bgs5-cv"></canvas><p class="bgs5-msg"></p>
      <div class="bgs5-row"><button type="button" class="bgs5-btn on wat bg47-wat">💧 ${L('Полить', 'Water')}</button><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
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
    // ---- геометрия сцены ----
    const k = h / 380, cx = w / 2, sillTop = h - 36, pw = Math.min(118, w * .3), ph = Math.min(84, h * .2), potBot = sillTop + 6, py = potBot - ph;
    const wx = Math.round(w * .13), wy = 22, ww = Math.round(w * .74), wh = Math.round(sillTop - 34 - wy);
    const hr = new Date().getHours(), tod = hr >= 7 && hr < 17 ? 'day' : (hr >= 17 && hr < 21) || (hr >= 5 && hr < 7) ? 'eve' : 'night';
    const SKY = { day: ['#5f9fd8', '#9cc9ea', '#e6f3f7'], eve: ['#2c2c68', '#a85f8c', '#f6b27a'], night: ['#0a0f2c', '#18204a', '#343766'] }[tod];
    const CITY = { day: ['#9fb6cc', '#6f88a4', 'rgba(255,250,220,.0)'], eve: ['#5a4a7e', '#3a2e58', 'rgba(255,214,140,.85)'], night: ['#202546', '#151a33', 'rgba(255,214,120,.9)'] }[tod];
    const sunX = wx + ww * (tod === 'eve' ? .26 : .76), sunY = wy + wh * (tod === 'eve' ? .74 : .22);
    // ---- статичный фон рисуется один раз ----
    const [bgCv, b] = offCv(w, h);
    {
      const wall = b.createLinearGradient(0, 0, 0, h); wall.addColorStop(0, '#2c2643'); wall.addColorStop(1, '#1b182b'); b.fillStyle = wall; b.fillRect(0, 0, w, h);
      b.fillStyle = 'rgba(255,255,255,.018)'; for (let x = 0; x < w; x += 18) b.fillRect(x, 0, 9, h);
      const glow = b.createRadialGradient(cx, wy + wh * .5, 10, cx, wy + wh * .5, w * .75); glow.addColorStop(0, tod === 'night' ? 'rgba(120,140,255,.14)' : 'rgba(255,214,160,.2)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = glow; b.fillRect(0, 0, w, h);
      // небо, светило, город
      b.save(); b.beginPath(); b.rect(wx, wy, ww, wh); b.clip();
      const sky = b.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, SKY[0]); sky.addColorStop(.6, SKY[1]); sky.addColorStop(1, SKY[2]); b.fillStyle = sky; b.fillRect(wx, wy, ww, wh);
      if (tod === 'night') { b.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { const sx = wx + (i * 97.3 % ww), sy = wy + (i * 53.7 % (wh * .6)); b.globalAlpha = .3 + (i % 5) * .14; b.fillRect(sx, sy, 1.4, 1.4); } b.globalAlpha = 1; }
      const sg = b.createRadialGradient(sunX, sunY, 2, sunX, sunY, ww * .45);
      sg.addColorStop(0, tod === 'night' ? 'rgba(220,230,255,.5)' : tod === 'eve' ? 'rgba(255,200,120,.75)' : 'rgba(255,255,230,.8)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); b.fillStyle = sg; b.fillRect(wx, wy, ww, wh);
      b.fillStyle = tod === 'night' ? '#eef0ff' : tod === 'eve' ? '#ffcf8a' : '#fffbe8'; b.beginPath(); b.arc(sunX, sunY, tod === 'night' ? 11 : 14, 0, 7); b.fill();
      if (tod === 'night') { b.fillStyle = SKY[1]; b.beginPath(); b.arc(sunX + 5, sunY - 3, 10, 0, 7); b.fill(); }
      [[CITY[0], .55, 7], [CITY[1], .3, 11]].forEach(([col, hh, seed], layer) => {
        let x = wx - 6; while (x < wx + ww) {
          const bw = 18 + (seed * x * 7.1 % 22), bh = wh * hh * (.45 + (seed * x * 3.3 % 55) / 100); b.fillStyle = col; b.fillRect(x, wy + wh - bh, bw, bh);
          if (layer && tod !== 'day') { b.fillStyle = CITY[2]; for (let yy = wy + wh - bh + 5; yy < wy + wh - 4; yy += 8) for (let xx = x + 3; xx < x + bw - 4; xx += 6) if ((xx * 13 + yy * 7) % 5 < 2) b.fillRect(xx, yy, 2.5, 3.5); }
          x += bw + 2;
        }
      });
      b.restore();
      // рама
      const frame = (x, y, fw, fh) => { const g = b.createLinearGradient(x, y, x + fw, y + fh); g.addColorStop(0, '#f1ece2'); g.addColorStop(1, '#bfb5a4'); b.fillStyle = g; b.fillRect(x, y, fw, fh); };
      const ft = 9; frame(wx - ft, wy - ft, ww + ft * 2, ft); frame(wx - ft, wy + wh, ww + ft * 2, ft); frame(wx - ft, wy, ft, wh); frame(wx + ww, wy, ft, wh);
      frame(cx - 3.5, wy, 7, wh); frame(wx, wy + wh * .3, ww, 6);
      b.strokeStyle = 'rgba(0,0,0,.25)'; b.lineWidth = 2; b.strokeRect(wx + 1, wy + 1, ww - 2, wh - 2);
      b.fillStyle = 'rgba(255,255,255,.07)'; b.beginPath(); b.moveTo(wx + ww * .1, wy + wh); b.lineTo(wx + ww * .3, wy + wh * .3 + 6); b.lineTo(wx + ww * .38, wy + wh * .3 + 6); b.lineTo(wx + ww * .18, wy + wh); b.fill();
      b.beginPath(); b.moveTo(wx + ww * .6, wy + wh * .3); b.lineTo(wx + ww * .7, wy); b.lineTo(wx + ww * .74, wy); b.lineTo(wx + ww * .64, wy + wh * .3); b.fill();
      // карниз и шторы
      const rod = b.createLinearGradient(0, wy - 20, 0, wy - 14); rod.addColorStop(0, '#e8c98a'); rod.addColorStop(1, '#9a7a40'); b.fillStyle = rod; b.fillRect(wx - 26, wy - 20, ww + 52, 5);
      [wx - 30, wx + ww + 30].forEach(x => { b.fillStyle = '#d8b878'; b.beginPath(); b.arc(x, wy - 17.5, 5, 0, 7); b.fill(); });
      [-1, 1].forEach(sd => {
        const x0 = sd < 0 ? wx - 24 : wx + ww + 24, x1 = x0 - sd * (ww * .2), tieY = wy + wh * .58, bot = sillTop - 2, xt = x0 - sd * ww * .06;
        const g = b.createLinearGradient(Math.min(x0, x1), 0, Math.max(x0, x1), 0);
        for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, i % 2 ? '#8fbfac' : '#5f8f7e');
        b.fillStyle = g; b.beginPath(); b.moveTo(x0, wy - 16); b.lineTo(x1, wy - 16); b.quadraticCurveTo(x1, tieY - 30, xt, tieY); b.quadraticCurveTo(xt - sd * 4, bot - 30, x1 + sd * 6, bot); b.lineTo(x0, bot); b.closePath(); b.fill();
        b.fillStyle = 'rgba(0,0,0,.18)'; b.fillRect(Math.min(x0, x0 - sd * 6), wy - 16, 6, bot - wy + 16);
        b.fillStyle = '#e6c27a'; b.beginPath(); b.ellipse(xt - sd * 2, tieY, 4, 7, 0, 0, 7); b.fill();
      });
      // луч света на подоконник
      const ray = b.createLinearGradient(0, wy + wh, 0, sillTop + 10); ray.addColorStop(0, tod === 'night' ? 'rgba(170,190,255,.08)' : 'rgba(255,230,180,.16)'); ray.addColorStop(1, 'rgba(255,230,180,0)');
      b.fillStyle = ray; b.beginPath(); b.moveTo(wx, wy + wh + 9); b.lineTo(wx + ww, wy + wh + 9); b.lineTo(wx + ww + 30, sillTop + 10); b.lineTo(wx - 30, sillTop + 10); b.fill();
      // подоконник
      const st1 = b.createLinearGradient(0, sillTop, 0, sillTop + 11); st1.addColorStop(0, '#f3ede1'); st1.addColorStop(1, '#d6ccb9'); b.fillStyle = st1; b.fillRect(0, sillTop, w, 11);
      const st2 = b.createLinearGradient(0, sillTop + 11, 0, h - 8); st2.addColorStop(0, '#b9ae9a'); st2.addColorStop(1, '#8d8473'); b.fillStyle = st2; b.fillRect(0, sillTop + 11, w, h - 8 - sillTop - 11);
      b.fillStyle = 'rgba(255,255,255,.5)'; b.fillRect(0, sillTop, w, 1);
      const sh = b.createLinearGradient(0, h - 8, 0, h); sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = sh; b.fillRect(0, h - 8, w, 8);
      // горшок: тень, блюдце, корпус, поясок, бортик
      b.fillStyle = 'rgba(40,30,20,.3)'; b.beginPath(); b.ellipse(cx + 6, potBot + 3, pw * .62, 5, 0, 0, 7); b.fill();
      const sau = b.createLinearGradient(0, potBot - 5, 0, potBot + 3); sau.addColorStop(0, '#d98a62'); sau.addColorStop(1, '#93492c'); b.fillStyle = sau;
      b.beginPath(); b.moveTo(cx - pw * .5, potBot - 5); b.lineTo(cx + pw * .5, potBot - 5); b.lineTo(cx + pw * .44, potBot + 3); b.lineTo(cx - pw * .44, potBot + 3); b.fill();
      const body = b.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0); body.addColorStop(0, '#8f4328'); body.addColorStop(.3, '#d8774c'); body.addColorStop(.48, '#eb9468'); body.addColorStop(1, '#843b22');
      b.fillStyle = body; b.beginPath(); b.moveTo(cx - pw / 2 + 2, py + 14); b.lineTo(cx + pw / 2 - 2, py + 14); b.lineTo(cx + pw * .36, potBot - 4); b.quadraticCurveTo(cx, potBot + 1, cx - pw * .36, potBot - 4); b.closePath(); b.fill();
      const bandY = py + 14 + (ph - 18) * .42, bw0 = pw / 2 - 2 - (pw / 2 - 2 - pw * .36) * .42;
      b.fillStyle = 'rgba(248,226,196,.85)'; b.fillRect(cx - bw0, bandY, bw0 * 2, 6);
      b.fillStyle = '#c4613a'; for (let x = cx - bw0 + 6; x < cx + bw0 - 3; x += 10) { b.beginPath(); b.arc(x, bandY + 3, 1.6, 0, 7); b.fill(); }
      const rim = b.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0); rim.addColorStop(0, '#a04e30'); rim.addColorStop(.4, '#ee9a70'); rim.addColorStop(1, '#93452a');
      b.fillStyle = rim; b.beginPath(); b.roundRect ? b.roundRect(cx - pw / 2 - 6, py, pw + 12, 16, 4) : b.rect(cx - pw / 2 - 6, py, pw + 12, 16); b.fill();
      b.fillStyle = 'rgba(255,230,200,.45)'; b.fillRect(cx - pw / 2 - 4, py + 1, pw + 8, 1.5);
      b.fillStyle = 'rgba(0,0,0,.22)'; b.fillRect(cx - pw / 2 - 2, py + 14, pw + 4, 3);
      b.fillStyle = '#3a2418'; b.beginPath(); b.ellipse(cx, py + 4, pw / 2 - 1, 6.5, 0, 0, 7); b.fill();
    }
    // спрайт облака
    const [cloud, cc] = offCv(110, 44);
    { const g = cc.createLinearGradient(0, 0, 0, 44); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(225,232,245,.75)'); cc.fillStyle = g; [[30, 28, 16], [52, 20, 20], [76, 27, 15], [55, 32, 18], [92, 32, 10], [16, 34, 9]].forEach(([x, y, r]) => { cc.beginPath(); cc.arc(x, y, r, 0, 7); cc.fill(); }); }
    const grains = Array.from({ length: 16 }, (_, i) => [((i * 37) % 100) / 100 - .5, ((i * 61) % 100) / 100 - .5, i % 3]);
    const motes = Array.from({ length: 12 }, (_, i) => ({ x: wx + (i * 53) % ww, y: wy + wh + ((i * 29) % Math.max(10, sillTop - wy - wh)), s: .6 + (i % 3) * .5, p: i }));
    let sparks = [], ripples = [], pourAcc = 0, fdt = 1 / 60;
    const sparkle = (n, x0, y0, rx, ry) => { if (RM()) n = Math.min(n, 4); for (let i = 0; i < n; i++) sparks.push({ x: x0 + (Math.random() - .5) * rx * 2, y: y0 + (Math.random() - .5) * ry * 2, life: .9 + Math.random() * .7, s: 3 + Math.random() * 4, vy: -12 - Math.random() * 16 }); };
    q('.wat').onclick = () => {
      if (can > 0) return;
      can = 1.7; pourAcc = 0; beep(660, .5, 'sine', .02, .35, 520);
      if (!watered()) {
        const before = stageOf(st.g);
        st.streak = since === 1 ? st.streak + 1 : 1;
        st.g++; st.last = td; st.cnt = 1; st.best = Math.max(st.best, st.streak); save();
        droop = 0; wet = 1;
        const up = stageOf(st.g) > before;
        K.after(1500, () => { msg.textContent = up ? L(`Ура! Новая стадия: ${NAMES[stageOf(st.g)]}.`, `Hooray! New stage: ${NAMES[stageOf(st.g)]}.`) : L('Цветок благодарно расправил листья.', 'The plant spreads its leaves gratefully.'); if (up) api.sfx.item?.(); info(); sparkle(up ? 30 : 12, cx, py - 80 * k, 70 * k, 70 * k); });
        unlockIn = 2.5;
      } else {
        st.cnt++; save(); droop = Math.min(1, .3 + .2 * (st.cnt - 1)); wet = 1;
        K.after(1500, () => { msg.textContent = L('Хватит! Земля и так мокрая — цветок слегка поник.', 'Enough! The soil is soaked — the plant droops a little.'); });
        unlockIn = Math.min(unlockIn, 1);
      }
    };
    cv.addEventListener('pointerdown', e => { wig = 1; beep(1200 + Math.random() * 300, .15, 'sine', .012); const r = cv.getBoundingClientRect(); sparkle(4, e.clientX - r.left, e.clientY - r.top, 14, 14); });
    let PAL = null;
    const leaf = (x, y, len, ang, shade) => {
      c.save(); c.translate(x, y); c.rotate(ang);
      const g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, shade ? PAL[2] : PAL[1]); g.addColorStop(1, shade ? PAL[1] : PAL[0]);
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * .3, -len * .42, len * .75, -len * .32, len, 0); c.bezierCurveTo(len * .75, len * .3, len * .3, len * .38, 0, 0); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1; c.beginPath(); c.moveTo(len * .08, 0); c.quadraticCurveTo(len * .5, -len * .04, len * .92, 0); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(len * .2, -len * .16); c.quadraticCurveTo(len * .55, -len * .3, len * .85, -len * .1); c.stroke();
      c.restore();
    };
    const flower = (x, y, r, open) => {
      if (r <= 0) return;
      c.save(); c.translate(x, y);
      if (!open) {
        const g = c.createLinearGradient(0, -r * .8, 0, r * .5); g.addColorStop(0, '#ffc2d8'); g.addColorStop(1, '#e0628f');
        c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r * .5, r * .78, 0, 0, 7); c.fill();
        c.fillStyle = PAL[2]; c.beginPath(); c.moveTo(-r * .55, r * .25); c.quadraticCurveTo(0, r * .9, r * .55, r * .25); c.quadraticCurveTo(0, r * .5, -r * .55, r * .25); c.fill();
        c.restore(); return;
      }
      const g = c.createRadialGradient(0, 0, r * .1, 0, 0, r * 1.15); g.addColorStop(0, '#fff4f8'); g.addColorStop(.45, '#ffb6d3'); g.addColorStop(1, '#ec6d9c');
      c.fillStyle = g; for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.ellipse(0, -r * .58, r * .38, r * .6, 0, 0, 7); c.fill(); }
      const cg = c.createRadialGradient(-r * .08, -r * .08, 1, 0, 0, r * .34); cg.addColorStop(0, '#fff6b0'); cg.addColorStop(1, '#f0a92e');
      c.fillStyle = cg; c.beginPath(); c.arc(0, 0, r * .32, 0, 7); c.fill(); c.restore();
    };
    const drawCan = () => {
      const p = 1.7 - can, enter = Math.min(1, p / .35), exit = Math.max(0, (p - 1.35) / .35), e = 1 - (1 - enter) ** 3, tilt = -.08 - .5 * Math.min(1, Math.max(0, (p - .25) / .2)) * (1 - exit);
      const sc = Math.max(.85, Math.min(1.15, k * 1.05)), tipX = cx + 22, tipY = h * .22;
      const bx = tipX + 52 * sc + (1 - e) * (w * .6) + exit * w * .6, by = tipY - 16 * sc;
      c.save(); c.translate(bx, by); c.scale(sc, sc); c.rotate(tilt);
      const g = c.createLinearGradient(0, -18, 0, 18); g.addColorStop(0, '#a7ecd6'); g.addColorStop(.5, '#5cc1a3'); g.addColorStop(1, '#2f8a72');
      c.strokeStyle = '#3f9f86'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-18, 6); c.lineTo(-48, -12); c.stroke();
      c.fillStyle = '#4fb093'; c.beginPath(); c.ellipse(-50, -13, 4, 7, -.9, 0, 7); c.fill();
      c.strokeStyle = '#3f9f86'; c.lineWidth = 4.5; c.beginPath(); c.arc(12, -14, 13, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      c.fillStyle = g; c.beginPath(); c.roundRect ? c.roundRect(-22, -18, 44, 36, 9) : c.rect(-22, -18, 44, 36); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-17, -14, 30, 3);
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(-9, -1, -4, -8, 0, -3); c.bezierCurveTo(4, -8, 9, -1, 0, 6); c.fill();
      c.restore();
      return [tipX, tipY, p > .45 && p < 1.35];
    };
    const draw = t => {
      c.drawImage(bgCv, 0, 0, w, h);
      // облака за стеклом
      c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); c.globalAlpha = tod === 'night' ? .18 : .8;
      for (let i = 0; i < 3; i++) { const cw = 70 + i * 16, x0 = wx - cw + ((t * (5 + i * 2) + i * ww * .45) % (ww + cw)); c.drawImage(cloud, x0, wy + 10 + i * wh * .13, cw, cw * .4); }
      c.restore(); c.globalAlpha = 1;
      // пылинки в луче
      if (tod !== 'night' && !RM()) { c.fillStyle = 'rgba(255,240,200,.55)'; motes.forEach(m => { const yy = m.y - ((t * 6 * m.s) % 40), xx = m.x + Math.sin(t * .7 + m.p) * 6; c.globalAlpha = .25 + .25 * Math.sin(t + m.p); c.fillRect(xx, yy, m.s * 1.6, m.s * 1.6); }); c.globalAlpha = 1; }
      // земля
      c.fillStyle = mix('#6a4a35', '#3a2618', Math.min(1, wet)); c.beginPath(); c.ellipse(cx, py + 5, pw / 2 - 4, 5, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,230,200,.18)'; grains.forEach(([gx, gy, kk]) => { c.fillRect(cx + gx * (pw - 14), py + 5 + gy * 6, 1.6 + kk * .4, 1.4); });
      if (wet > .3) { c.fillStyle = `rgba(200,230,255,${(wet - .3) * .25})`; c.beginPath(); c.ellipse(cx - 10, py + 4, 14, 2, 0, 0, 7); c.fill(); }
      // растение
      const s = stageOf(st.g), sway = Math.sin(t * 1.3) * 3 + Math.sin(t * 7) * wig * 6, dr = droopT, dt2 = Math.max(0, Math.min(1, (dr - .3) / .5));
      PAL = [mix('#a8ee8e', '#d3d07e', dt2), mix('#5fc05c', '#a2ad58', dt2), mix('#2c7a3a', '#6b7438', dt2)];
      if (s < 5) {
        const hs = [34, 70, 108, 140, 165][s] * k, tipX = cx + sway + dr * 26, tipY = py + 2 - hs + dr * hs * .25;
        const ctrlX = cx + dr * 4, ctrlY = py - hs * .5;
        const pt = u => [(1 - u) * (1 - u) * cx + 2 * (1 - u) * u * ctrlX + u * u * tipX, (1 - u) * (1 - u) * (py + 2) + 2 * (1 - u) * u * ctrlY + u * u * tipY];
        const sg = c.createLinearGradient(0, py, 0, tipY); sg.addColorStop(0, PAL[2]); sg.addColorStop(1, PAL[1]);
        c.strokeStyle = sg; c.lineWidth = 3 + s; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, py + 4); c.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 1, py + 2); c.quadraticCurveTo(ctrlX - 1.5, ctrlY, tipX - 1, tipY); c.stroke();
        const nL = Math.min(12, 2 + Math.floor(st.g * 1.3));
        for (let i = 0; i < nL; i++) {
          const u = .25 + .7 * (i + 1) / (nL + 1), [x, y] = pt(u), side = i % 2 ? 1 : -1, len = (14 + s * 6) * k * (1.1 - u * .35) * 1.1;
          leaf(x, y, len, side > 0 ? -.5 + dr * 1.1 + Math.sin(t * 2 + i) * .05 : Math.PI + .5 - dr * 1.1 + Math.sin(t * 2 + i) * .05, i % 3 === 0);
        }
        leaf(tipX, tipY, 14 * k + s * 3, -Math.PI / 2 + .6 + dr, false); leaf(tipX, tipY, 14 * k + s * 3, -Math.PI / 2 - .6 + dr, false);
        if (s >= 3) { flower(tipX, tipY - 6 * k, 10 * k + (s - 3) * 5, s >= 4); const [bx, by] = pt(.7); flower(bx + 18 * k, by - 4, 7 * k + (s - 3) * 4, s >= 4); const [b2x, b2y] = pt(.55); flower(b2x - 18 * k, b2y - 2, 6 * k + (s - 3) * 3, s >= 4); }
      } else {
        const extra = Math.min(1, (st.g - 16) / 20), th = (120 + 40 * extra) * k, tx = cx + sway * .4 + dr * 6;
        const tg = c.createLinearGradient(cx - 6, 0, cx + 6, 0); tg.addColorStop(0, '#5a3a24'); tg.addColorStop(.5, '#8a6040'); tg.addColorStop(1, '#4a2e1c');
        c.strokeStyle = tg; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, py + 4); c.quadraticCurveTo(cx - 6, py - th * .5, tx, py - th); c.stroke();
        c.strokeStyle = '#6b4a30'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - 2, py - th * .55); c.lineTo(cx - 28 * k, py - th * .8); c.moveTo(cx + 1, py - th * .7); c.lineTo(cx + 30 * k, py - th * .92); c.stroke();
        const R0 = (52 + 18 * extra) * k, blobs = [[0, -1, 1], [-.75, -.55, .75], [.75, -.6, .78], [-.4, -1.25, .7], [.45, -1.3, .72], [0, -.4, .7]];
        blobs.forEach(([bx, by, br], i) => {
          const X = tx + bx * R0 + Math.sin(t * 1.2 + i) * 2, Y = py - th + 16 * k + by * R0 * .55 + dr * 10, rr = br * R0 * .62;
          const g = c.createRadialGradient(X - rr * .35, Y - rr * .4, rr * .1, X, Y, rr); g.addColorStop(0, PAL[0]); g.addColorStop(.6, PAL[1]); g.addColorStop(1, PAL[2]);
          c.fillStyle = g; c.beginPath(); c.arc(X, Y, rr, 0, 7); c.fill();
        });
        for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = R0 * (.25 + (i % 4) * .17); flower(tx + Math.cos(a) * rr, py - th - 10 * k + Math.sin(a) * rr * .5 + dr * 10, 6.5 * k, true); }
      }
      // лейка, капли, брызги
      if (can > 0) {
        const [tx0, ty0, pouring] = drawCan();
        if (pouring) { pourAcc += fdt * 34; while (pourAcc >= 1) { pourAcc--; drops.push({ x: tx0 - 26 + Math.random() * 6, y: ty0 + 14 + Math.random() * 4, vx: -18 - Math.random() * 22, vy: 30 + Math.random() * 30 }); } }
      }
      c.lineCap = 'round';
      drops.forEach(d => { c.strokeStyle = 'rgba(150,210,255,.9)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - d.vx * .025, d.y - d.vy * .025); c.stroke(); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(d.x - .6, d.y - 1.5, 1.2, 1.2); });
      ripples.forEach(r => { c.strokeStyle = `rgba(190,225,255,${r.life * 1.6})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(r.x, r.y, (1 - r.life / .45) * 10 + 2, (1 - r.life / .45) * 2.5 + 1, 0, 0, 7); c.stroke(); });
      sparks.forEach(p => { const a = Math.max(0, Math.min(1, p.life)), r = p.s * (.6 + .4 * a); c.fillStyle = `rgba(255,248,200,${a})`; c.beginPath(); c.moveTo(p.x, p.y - r); c.quadraticCurveTo(p.x, p.y, p.x + r, p.y); c.quadraticCurveTo(p.x, p.y, p.x, p.y + r); c.quadraticCurveTo(p.x, p.y, p.x - r, p.y); c.quadraticCurveTo(p.x, p.y, p.x, p.y - r); c.fill(); });
    };
    K.loop((dt, t) => {
      can = Math.max(0, can - dt); wig = Math.max(0, wig - dt * 1.5); wet = Math.max(watered() ? .4 : 0, wet - dt * .05);
      droopT += (droop - droopT) * Math.min(1, dt * 1.5);
      drops.forEach(d => { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 520 * dt; if (d.y >= py + 3) { d.dead = true; if (ripples.length < 14) ripples.push({ x: d.x, y: py + 5, life: .45 }); } });
      drops = drops.filter(d => !d.dead && d.y < h);
      ripples.forEach(r => { r.life -= dt; }); ripples = ripples.filter(r => r.life > 0);
      sparks.forEach(p => { p.life -= dt; p.y += p.vy * dt; }); sparks = sparks.filter(p => p.life > 0);
      if (unlockIn < Infinity) { unlockIn -= dt; if (unlockIn <= 0) { unlockIn = Infinity; dBtn.disabled = false; dBtn.style.setProperty('--p', '100%'); } }
      fdt = dt; draw(t);
    });
    info(); greet();
  };

  // ================= 48. Погладь кота =================
  IMPL[48] = (root, api) => {
    prep(root); const K = kit(api), L = api.L;
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
    const w = W(root), h = Math.round(Math.min(w * 1.05, Math.max(280, innerHeight - 292), 460));
    root.innerHTML = `<p class="bgs5-msg">${INTRO}</p><canvas class="bgs5-cv"></canvas>
      <div class="bg48-hud"><span class="h">💗</span><span>${pet.kind === 'cat' ? L('Мурчание', 'Purr') : L('Радость', 'Joy')}</span><div class="bg48-meter"><i></i></div><span class="pc">0%</span></div>
      <div class="bgs5-row"><button type="button" class="btn-main bgs5-done">${L('Готово', 'Done')}</button></div>`;
    const q = s => root.querySelector(s), cv = q('canvas'), c = sizeCanvas(cv, w, h), meter = q('.bg48-meter i'), pc = q('.pc'), msg = q('.bgs5-msg'), hIco = q('.bg48-hud .h');
    let joy = 0, total = 0, full = false, stroking = 0, last = null, hearts = [], blink = 0, purrT = 0, buzzT = 0, tilt = 0, trail = [], bubbles = [], fishX = 0, fishDir = 1;
    doneButton(K, api, q('.bgs5-done'), 20, () => ({ won: true, score: null, text: full ? HAPPY + ' 💗' : L(`Минутка нежности: ${nm} 💗`, `A moment of tenderness: ${nm} 💗`) }));
    const S = Math.min(w, h * 1.1) / 420, cx = w / 2, cy = h * .5;
    const inside = (x, y) => ((x - cx) / (175 * S)) ** 2 + ((y - cy) / (170 * S)) ** 2 < 1;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    K.on(cv, 'pointerdown', e => { cv.setPointerCapture?.(e.pointerId); last = pos(e); ac(); });
    K.on(cv, 'pointermove', e => {
      if (!last) return; const p = pos(e), d = Math.hypot(p[0] - last[0], p[1] - last[1]);
      if (inside(...p) && d > 1) {
        stroking = .35; joy = Math.min(100, joy + d / S * .06); total += d;
        if (Math.random() < d / 40) hearts.push({ x: p[0], y: p[1], vy: -40 - Math.random() * 40, vx: (Math.random() - .5) * 30, life: 1.4, s: 14 + Math.random() * 12 });
        if (!RM() && trail.length < 40) trail.push({ x: p[0], y: p[1], life: .45 });
      }
      last = p;
    });
    const up = () => { last = null; }; K.on(cv, 'pointerup', up); K.on(cv, 'pointercancel', up);
    const col = spec.color || '#9a9aa5', alt = spec.face || spec.alt || '#e8e2d8', eyeC = spec.eyes || '#7ac943';
    const ell = (x, y, rx, ry, f, rot = 0) => { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
    // объём: светлее сверху-слева, темнее к краю
    const vol = (x, y, rx, ry, base, rot = 0, lt = .24, dk = .3) => {
      const g = c.createRadialGradient(x - rx * .3, y - ry * .45, Math.min(rx, ry) * .1, x, y, Math.max(rx, ry) * 1.05);
      g.addColorStop(0, mix(base, '#ffffff', lt)); g.addColorStop(.55, base); g.addColorStop(1, mix(base, '#000000', dk)); ell(x, y, rx, ry, g, rot);
    };
    // ---- комната: рисуется один раз ----
    const [bgCv, b] = offCv(w, h);
    {
      const floorY = cy + 95 * S;
      const wall = b.createLinearGradient(0, 0, 0, floorY); wall.addColorStop(0, '#3a2b4c'); wall.addColorStop(1, '#4a3550'); b.fillStyle = wall; b.fillRect(0, 0, w, floorY);
      b.fillStyle = 'rgba(255,220,240,.05)'; for (let y = 12; y < floorY; y += 22) for (let x = (y / 22 % 2) * 11 + 6; x < w; x += 22) { b.beginPath(); b.arc(x, y, 1.6, 0, 7); b.fill(); }
      // окошко с закатом
      const ox = w * .07, oy = h * .07, ow = w * .26, oh = h * .34;
      const sky = b.createLinearGradient(0, oy, 0, oy + oh); sky.addColorStop(0, '#5a5aa0'); sky.addColorStop(.6, '#e48fa0'); sky.addColorStop(1, '#ffc98a'); b.fillStyle = sky; b.fillRect(ox, oy, ow, oh);
      b.fillStyle = 'rgba(255,240,200,.9)'; b.beginPath(); b.arc(ox + ow * .62, oy + oh * .72, ow * .12, 0, 7); b.fill();
      b.fillStyle = '#3d3060'; b.fillRect(ox, oy + oh * .82, ow, oh * .18);
      b.strokeStyle = '#e9dccb'; b.lineWidth = 5; b.strokeRect(ox, oy, ow, oh); b.lineWidth = 3; b.beginPath(); b.moveTo(ox + ow / 2, oy); b.lineTo(ox + ow / 2, oy + oh); b.moveTo(ox, oy + oh * .45); b.lineTo(ox + ow, oy + oh * .45); b.stroke();
      const lg = b.createRadialGradient(ox + ow / 2, oy + oh / 2, 4, ox + ow / 2, oy + oh / 2, w * .55); lg.addColorStop(0, 'rgba(255,190,150,.22)'); lg.addColorStop(1, 'rgba(255,190,150,0)'); b.fillStyle = lg; b.fillRect(0, 0, w, h);
      // картинка на стене
      const fx = w * .74, fy = h * .1, fw = w * .17, fh = w * .13;
      b.fillStyle = '#c99a5a'; b.fillRect(fx - 4, fy - 4, fw + 8, fh + 8); const pg = b.createLinearGradient(0, fy, 0, fy + fh); pg.addColorStop(0, '#9fd3c7'); pg.addColorStop(1, '#4f8f8a'); b.fillStyle = pg; b.fillRect(fx, fy, fw, fh);
      b.fillStyle = '#2f6a63'; b.beginPath(); b.moveTo(fx, fy + fh); b.lineTo(fx + fw * .35, fy + fh * .4); b.lineTo(fx + fw * .6, fy + fh * .75); b.lineTo(fx + fw * .8, fy + fh * .5); b.lineTo(fx + fw, fy + fh); b.fill();
      // пол и плинтус
      const fl = b.createLinearGradient(0, floorY, 0, h); fl.addColorStop(0, '#6a4632'); fl.addColorStop(1, '#3e281c'); b.fillStyle = fl; b.fillRect(0, floorY, w, h - floorY);
      b.strokeStyle = 'rgba(0,0,0,.22)'; b.lineWidth = 1; for (let i = 1; i < 5; i++) { const y = floorY + (h - floorY) * (i / 5) ** 1.3; b.beginPath(); b.moveTo(0, y); b.lineTo(w, y); b.stroke(); }
      b.fillStyle = '#d9c8b4'; b.fillRect(0, floorY - 4, w, 5); b.fillStyle = 'rgba(0,0,0,.25)'; b.fillRect(0, floorY + 1, w, 2);
      // коврик
      const rugY = cy + 128 * S;
      [['#b8607d', 200], ['#e79bb0', 186], ['#f6d2d2', 166], ['#e79bb0', 150], ['#c9708a', 136]].forEach(([cl, r]) => { b.fillStyle = cl; b.beginPath(); b.ellipse(cx, rugY, r * S, r * .2 * S, 0, 0, 7); b.fill(); });
      if (pet.kind === 'cat' || pet.kind === 'dog') {
        // подушка
        b.fillStyle = 'rgba(0,0,0,.25)'; b.beginPath(); b.ellipse(cx, rugY + 4 * S, 168 * S, 30 * S, 0, 0, 7); b.fill();
        const cg = b.createRadialGradient(cx - 40 * S, rugY - 20 * S, 10 * S, cx, rugY - 6 * S, 175 * S); cg.addColorStop(0, '#8fd8c8'); cg.addColorStop(.6, '#4fa597'); cg.addColorStop(1, '#2b6a62');
        b.fillStyle = cg; b.beginPath(); b.ellipse(cx, rugY - 8 * S, 165 * S, 36 * S, 0, 0, 7); b.fill();
        b.strokeStyle = 'rgba(220,255,245,.55)'; b.lineWidth = 3 * S; b.beginPath(); b.ellipse(cx, rugY - 8 * S, 160 * S, 32 * S, 0, Math.PI * 1.05, Math.PI * 1.95); b.stroke();
      }
    }
    // спрайт сердечка
    const [heart, hc] = offCv(40, 40);
    {
      const hp = () => { hc.beginPath(); hc.moveTo(20, 34); hc.bezierCurveTo(4, 24, 2, 12, 10, 7); hc.bezierCurveTo(15, 4, 19, 7, 20, 11); hc.bezierCurveTo(21, 7, 25, 4, 30, 7); hc.bezierCurveTo(38, 12, 36, 24, 20, 34); };
      const g = hc.createLinearGradient(0, 4, 0, 34); g.addColorStop(0, '#ffb3d0'); g.addColorStop(1, '#ff4f97'); hc.shadowColor = 'rgba(255,80,150,.7)'; hc.shadowBlur = 6; hc.fillStyle = g; hp(); hc.fill();
      hc.shadowBlur = 0; hc.fillStyle = 'rgba(255,255,255,.75)'; hc.beginPath(); hc.ellipse(13, 12, 3.5, 2.2, -.6, 0, 7); hc.fill();
    }
    const eyes = (x, y, happy, round) => {
      [-1, 1].forEach(sd => {
        const ex = x + sd * 30 * S;
        if (happy || blink > 0) { c.strokeStyle = '#2a2026'; c.lineWidth = 4.5 * S; c.lineCap = 'round'; c.beginPath(); c.arc(ex, y + 4 * S, 11 * S, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); return; }
        if (round) { ell(ex, y, 10.5 * S, 11.5 * S, '#1c1418'); ell(ex + 3.5 * S, y - 4 * S, 3.6 * S, 3.6 * S, '#fff'); ell(ex - 3 * S, y + 4 * S, 1.6 * S, 1.6 * S, 'rgba(255,255,255,.7)'); return; }
        const g = c.createRadialGradient(ex, y + 5 * S, 1, ex, y, 13 * S); g.addColorStop(0, mix(eyeC, '#ffffff', .45)); g.addColorStop(1, mix(eyeC, '#000000', .2));
        ell(ex, y, 12.5 * S, 13.5 * S, '#1c1418'); ell(ex, y, 11.5 * S, 12.5 * S, g);
        ell(ex, y, (stroking > 0 ? 6.5 : 3.6) * S, 11 * S, '#151015'); ell(ex + 4 * S, y - 5 * S, 3.4 * S, 3.4 * S, 'rgba(255,255,255,.95)'); ell(ex - 4 * S, y + 5 * S, 1.6 * S, 1.6 * S, 'rgba(255,255,255,.6)');
      });
    };
    const blush = (x, y) => { if (joy < 12) return; const a = Math.min(.5, joy / 180); [-1, 1].forEach(sd => ell(x + sd * 44 * S, y, 13 * S, 8 * S, `rgba(255,120,160,${a})`)); };
    const headTurn = (hx, hy, fn) => { c.save(); c.translate(hx, hy + 50 * S); c.rotate(tilt); c.translate(-hx, -(hy + 50 * S)); fn(); c.restore(); };
    const drawCat = t => {
      const br = 1 + Math.sin(t * (stroking > 0 ? 6 : 2)) * .012, hx = cx, hy = cy - 45 * S, happy = joy > 35 && stroking > 0 || full && stroking > 0;
      // хвост
      const tw = Math.sin(t * 1.4) * 22 * S, tail = () => { c.beginPath(); c.moveTo(cx + 95 * S, cy + 80 * S); c.bezierCurveTo(cx + 175 * S, cy + 70 * S, cx + 150 * S + tw, cy - 10 * S, cx + 165 * S + tw, cy - 40 * S); };
      c.lineCap = 'round'; c.strokeStyle = mix(col, '#000000', .15); c.lineWidth = 21 * S; tail(); c.stroke();
      c.strokeStyle = mix(col, '#ffffff', .18); c.lineWidth = 8 * S; c.save(); c.translate(-3 * S, -3 * S); tail(); c.stroke(); c.restore();
      ell(cx, cy + 118 * S, 135 * S, 16 * S, 'rgba(0,0,0,.25)');
      // тело
      c.save(); c.translate(cx, cy + 50 * S); c.scale(br, br); vol(0, 0, 125 * S, 72 * S, col); if (spec.belly || spec.face) vol(0, 22 * S, 70 * S, 40 * S, alt, 0, .2, .12);
      if (spec.stripes) { c.strokeStyle = spec.stripes; c.lineWidth = 7 * S; c.lineCap = 'round'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 34 * S, -64 * S, 26 * S, Math.PI * .35, Math.PI * .65); c.stroke(); } }
      c.restore();
      [-1, 1].forEach(sd => { vol(cx + sd * 45 * S, cy + 112 * S, 26 * S, 14 * S, alt, 0, .2, .15); c.strokeStyle = mix(alt, '#000000', .3); c.lineWidth = 1.6 * S; [-7, 7].forEach(o => { c.beginPath(); c.moveTo(cx + sd * 45 * S + o * S, cy + 118 * S); c.lineTo(cx + sd * 45 * S + o * S, cy + 124 * S); c.stroke(); }); });
      headTurn(hx, hy, () => {
        // уши
        const earC = spec.points || col, eh = spec.ears === 'big' ? 115 : 98;
        [-1, 1].forEach(sd => {
          const g = c.createLinearGradient(0, hy - eh * S, 0, hy - 20 * S); g.addColorStop(0, mix(earC, '#000000', .2)); g.addColorStop(1, earC);
          c.fillStyle = g; c.beginPath(); c.moveTo(hx + sd * 70 * S, hy - 18 * S); c.quadraticCurveTo(hx + sd * 66 * S, hy - eh * .8 * S, hx + sd * 58 * S, hy - eh * S); c.quadraticCurveTo(hx + sd * 34 * S, hy - 76 * S, hx + sd * 14 * S, hy - 60 * S); c.fill();
          const ig = c.createLinearGradient(0, hy - (eh - 16) * S, 0, hy - 30 * S); ig.addColorStop(0, '#f7b9c8'); ig.addColorStop(1, '#d97a95');
          c.fillStyle = ig; c.beginPath(); c.moveTo(hx + sd * 58 * S, hy - 28 * S); c.quadraticCurveTo(hx + sd * 57 * S, hy - (eh - 30) * S, hx + sd * 54 * S, hy - (eh - 16) * S); c.quadraticCurveTo(hx + sd * 36 * S, hy - 70 * S, hx + sd * 28 * S, hy - 56 * S); c.fill();
        });
        vol(hx, hy, 78 * S, 66 * S, col);
        if (spec.face || spec.mask) vol(hx, hy + 22 * S, 52 * S, 38 * S, spec.mask ? (spec.points || '#4a3428') : spec.face, 0, .15, .12);
        if (spec.stripes) { c.strokeStyle = spec.stripes; c.lineWidth = 6 * S; c.lineCap = 'round'; [-18, 0, 18].forEach(o => { c.beginPath(); c.moveTo(hx + o * S, hy - 62 * S); c.lineTo(hx + o * .7 * S, hy - 38 * S); c.stroke(); }); }
        blush(hx, hy + 16 * S);
        eyes(hx, hy - 6 * S, happy, false);
        const ng = c.createLinearGradient(0, hy + 13 * S, 0, hy + 23 * S); ng.addColorStop(0, '#ffb0c2'); ng.addColorStop(1, '#d9708a');
        c.fillStyle = ng; c.beginPath(); c.moveTo(hx - 8.5 * S, hy + 13 * S); c.quadraticCurveTo(hx, hy + 11 * S, hx + 8.5 * S, hy + 13 * S); c.quadraticCurveTo(hx + 2 * S, hy + 23 * S, hx, hy + 23 * S); c.quadraticCurveTo(hx - 2 * S, hy + 23 * S, hx - 8.5 * S, hy + 13 * S); c.fill();
        c.strokeStyle = '#3a2a30'; c.lineWidth = 2.5 * S; c.lineCap = 'round'; c.beginPath(); c.arc(hx - 7 * S, hy + 24 * S, 7 * S, .1, Math.PI - .1); c.moveTo(hx + 14 * S, hy + 24 * S); c.arc(hx + 7 * S, hy + 24 * S, 7 * S, .1, Math.PI - .1); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5 * S; [-1, 1].forEach(sd => [-6, 2, 10].forEach(o => { c.beginPath(); c.moveTo(hx + sd * 30 * S, hy + 20 * S + o * .3 * S); c.quadraticCurveTo(hx + sd * 62 * S, hy + 12 * S + o * S, hx + sd * 94 * S, hy + 14 * S + o * 1.6 * S); c.stroke(); }));
        if (spec.collar) { c.strokeStyle = spec.collar; c.lineWidth = 8 * S; c.beginPath(); c.arc(hx, hy + 10 * S, 62 * S, Math.PI * .25, Math.PI * .75); c.stroke(); vol(hx, hy + 72 * S, 7 * S, 7 * S, '#f2c84a'); }
      });
      // мурчание: мягкие волны
      if (stroking > 0 && !RM()) { c.lineWidth = 2.2 * S; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = (.45 - i * .12) * (.5 + .5 * Math.sin(t * 12 - i * 1.3)); c.strokeStyle = `rgba(255,220,240,${a})`; [-1, 1].forEach(sd => { c.beginPath(); c.arc(cx + sd * (128 + i * 11) * S, cy + 30 * S, (10 + i * 8) * S, sd > 0 ? -.6 : Math.PI - .6, sd > 0 ? .6 : Math.PI + .6); c.stroke(); }); } }
    };
    const drawDog = t => {
      const hx = cx, hy = cy - 45 * S, happy = joy > 35 && stroking > 0 || full && stroking > 0, wag = Math.sin(t * (stroking > 0 ? 18 : 4)) * (stroking > 0 ? .5 : .2);
      c.save(); c.translate(cx + 110 * S, cy + 60 * S); c.rotate(-.9 + wag); c.strokeStyle = mix(col, '#000000', .12); c.lineWidth = 16 * S; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -(spec.stub ? 25 : 70) * S); c.stroke();
      c.strokeStyle = mix(col, '#ffffff', .2); c.lineWidth = 6 * S; c.beginPath(); c.moveTo(-3 * S, -4 * S); c.lineTo(-3 * S, -(spec.stub ? 22 : 64) * S); c.stroke(); c.restore();
      ell(cx, cy + 118 * S, 135 * S, 16 * S, 'rgba(0,0,0,.25)');
      vol(cx, cy + 50 * S, 125 * S, 72 * S, col); if (spec.belly) vol(cx, cy + 72 * S, 70 * S, 40 * S, spec.alt || '#f6efe4', 0, .15, .1);
      [-1, 1].forEach(sd => vol(cx + sd * 45 * S, cy + 112 * S, 26 * S, 14 * S, spec.alt || col, 0, .2, .15));
      headTurn(hx, hy, () => {
        const earC = spec.earColor || mix(col, '#000000', .12);
        if (spec.ears === 'floppy' || !spec.ears) [-1, 1].forEach(sd => vol(hx + sd * 70 * S, hy + 5 * S, 22 * S, 48 * S, earC, sd * (.35 + Math.sin(t * 3) * .04 + (happy ? .12 : 0)), .15, .3));
        else [-1, 1].forEach(sd => { const g = c.createLinearGradient(0, hy - 110 * S, 0, hy - 30 * S); g.addColorStop(0, mix(earC, '#000000', .15)); g.addColorStop(1, earC); c.fillStyle = g; c.beginPath(); c.moveTo(hx + sd * 64 * S, hy - 28 * S); c.quadraticCurveTo(hx + sd * 70 * S, hy - 90 * S, hx + sd * 60 * S, hy - 110 * S); c.quadraticCurveTo(hx + sd * 34 * S, hy - 80 * S, hx + sd * 18 * S, hy - 58 * S); c.fill(); ell(hx + sd * 50 * S, hy - 62 * S, 8 * S, 22 * S, 'rgba(240,160,180,.6)', sd * -.35); });
        vol(hx, hy, 72 * S, 64 * S, col);
        if (spec.face) vol(hx, hy + 10 * S, 40 * S, 50 * S, spec.face, 0, .15, .1);
        vol(hx, hy + 26 * S, 36 * S, 26 * S, spec.muzzle || (spec.face || '#f2e6d4'), 0, .2, .15);
        blush(hx, hy + 18 * S);
        eyes(hx, hy - 12 * S, happy, true);
        vol(hx, hy + 14 * S, 13 * S, 9 * S, '#2a2024', 0, .35, .2);
        if (happy) { const tg = c.createLinearGradient(0, hy + 40 * S, 0, hy + 60 * S); tg.addColorStop(0, '#ff8aa6'); tg.addColorStop(1, '#e0557a'); c.fillStyle = tg; c.beginPath(); c.ellipse(hx, hy + 42 * S, 10 * S, 16 * S, 0, 0, Math.PI); c.fill(); }
        c.strokeStyle = '#3a2a30'; c.lineWidth = 2.5 * S; c.lineCap = 'round'; c.beginPath(); c.arc(hx - 8 * S, hy + 30 * S, 8 * S, .1, Math.PI - .1); c.moveTo(hx + 16 * S, hy + 30 * S); c.arc(hx + 8 * S, hy + 30 * S, 8 * S, .1, Math.PI - .1); c.stroke();
        if (spec.collar) { c.strokeStyle = spec.collar; c.lineWidth = 8 * S; c.beginPath(); c.arc(hx, hy + 8 * S, 64 * S, Math.PI * .28, Math.PI * .72); c.stroke(); vol(hx, hy + 74 * S, 7 * S, 7 * S, '#f2c84a'); }
      });
    };
    const drawParrot = t => {
      const bob = Math.sin(t * 2) * 4 * S + (stroking > 0 ? Math.sin(t * 14) * 2 * S : 0), fl = 1 + (stroking > 0 ? .05 : 0), happy = joy > 35 && stroking > 0 || full && stroking > 0;
      const pY = cy + 100 * S, bodyC = col, wingC = spec.alt || mix(col, '#000000', .25), headC = spec.head || col, tailC = spec.tail || wingC;
      // жердочка
      const pg = c.createLinearGradient(0, pY - 8 * S, 0, pY + 8 * S); pg.addColorStop(0, '#a5774e'); pg.addColorStop(1, '#5e3e26');
      c.strokeStyle = pg; c.lineWidth = 15 * S; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 175 * S, pY + 6 * S); c.quadraticCurveTo(cx, pY - 6 * S, cx + 175 * S, pY + 4 * S); c.stroke();
      [[-150, -1], [140, 1]].forEach(([x, sd]) => { ell(cx + x * S, pY - 12 * S, 14 * S, 6 * S, '#6fae5a', sd * .6); });
      // хвост
      c.save(); c.translate(cx + 18 * S, cy + 60 * S + bob); c.rotate(.25 + Math.sin(t * 1.5) * .04);
      const tl = (spec.longTail ? 130 : 85) * S, tg = c.createLinearGradient(0, 0, 0, tl); tg.addColorStop(0, tailC); tg.addColorStop(1, mix(tailC, '#000000', .3));
      c.fillStyle = tg; c.beginPath(); c.moveTo(-16 * S, 0); c.lineTo(16 * S, 0); c.lineTo(7 * S, tl); c.lineTo(-7 * S, tl * .92); c.closePath(); c.fill(); c.restore();
      // тело и крыло
      vol(cx, cy + 15 * S + bob, 64 * S * fl, 92 * S * fl, bodyC, -.12);
      c.save(); c.translate(cx + 28 * S, cy + 22 * S + bob); c.rotate(-.2 + (happy ? Math.sin(t * 16) * .06 : 0));
      vol(0, 0, 36 * S, 72 * S, wingC, 0, .2, .3); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2 * S; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, (10 + i * 16) * S, 26 * S, Math.PI * .15, Math.PI * .85); c.stroke(); } c.restore();
      // голова
      const hx = cx - 10 * S, hy = cy - 82 * S + bob;
      headTurn(hx, hy, () => {
        if (spec.crest) { c.fillStyle = spec.crest; for (let i = -1; i <= 1; i++) { c.save(); c.translate(hx + i * 12 * S, hy - 44 * S); c.rotate(i * .35 + (happy ? -.2 : 0)); c.beginPath(); c.ellipse(0, -18 * S - (happy ? 6 * S : 0), 7 * S, 24 * S, 0, 0, 7); c.fill(); c.restore(); } }
        vol(hx, hy, 56 * S * fl, 54 * S * fl, headC);
        if (spec.cheek) ell(hx - 22 * S, hy + 16 * S, 13 * S, 11 * S, spec.cheek);
        blush(hx + 4 * S, hy + 20 * S);
        if (happy || blink > 0) { c.strokeStyle = '#2a2026'; c.lineWidth = 4 * S; c.lineCap = 'round'; c.beginPath(); c.arc(hx - 18 * S, hy - 2 * S, 9 * S, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
        else { ell(hx - 18 * S, hy - 6 * S, 13 * S, 13 * S, '#fff'); ell(hx - 20 * S, hy - 6 * S, 7 * S, 7.5 * S, '#1c1418'); ell(hx - 17.5 * S, hy - 9 * S, 2.6 * S, 2.6 * S, '#fff'); }
        const bc = spec.beak || '#f0d9a0', bg = c.createLinearGradient(hx - 75 * S, 0, hx - 35 * S, 0); bg.addColorStop(0, mix(bc, '#000000', .25)); bg.addColorStop(1, mix(bc, '#ffffff', .2));
        c.fillStyle = bg; c.beginPath(); c.moveTo(hx - 40 * S, hy - 4 * S); c.quadraticCurveTo(hx - 78 * S, hy - 4 * S, hx - 70 * S, hy + 30 * S); c.quadraticCurveTo(hx - 58 * S, hy + 14 * S, hx - 40 * S, hy + 16 * S); c.closePath(); c.fill();
        c.fillStyle = mix(bc, '#000000', .35); c.beginPath(); c.moveTo(hx - 42 * S, hy + 16 * S); c.quadraticCurveTo(hx - 56 * S, hy + 16 * S, hx - 58 * S, hy + 26 * S); c.quadraticCurveTo(hx - 46 * S, hy + 28 * S, hx - 40 * S, hy + 22 * S); c.fill();
      });
      // лапки
      c.strokeStyle = '#8a8a94'; c.lineWidth = 5 * S; c.lineCap = 'round'; [-14, 18].forEach(o => { c.beginPath(); c.moveTo(cx + o * S, pY - 22 * S); c.lineTo(cx + o * S, pY - 6 * S); c.moveTo(cx + (o - 8) * S, pY - 5 * S); c.lineTo(cx + (o + 8) * S, pY - 5 * S); c.stroke(); });
    };
    const drawFish = t => {
      const tx = cx - 170 * S, ty = cy - 130 * S, tw = 340 * S, th = 270 * S, r = 22 * S;
      ell(cx, ty + th + 10 * S, tw * .55, 14 * S, 'rgba(0,0,0,.3)');
      c.save(); c.beginPath(); c.roundRect ? c.roundRect(tx, ty, tw, th, r) : c.rect(tx, ty, tw, th); c.clip();
      const wg = c.createLinearGradient(0, ty, 0, ty + th); wg.addColorStop(0, '#5ec3dd'); wg.addColorStop(.5, '#2a87b0'); wg.addColorStop(1, '#174f78'); c.fillStyle = wg; c.fillRect(tx, ty, tw, th);
      c.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 3; i++) { const x0 = tx + tw * (.15 + i * .3) + Math.sin(t * .5 + i) * 10 * S; c.beginPath(); c.moveTo(x0, ty); c.lineTo(x0 + 30 * S, ty); c.lineTo(x0 - 10 * S, ty + th); c.lineTo(x0 - 50 * S, ty + th); c.fill(); }
      c.lineCap = 'round'; [[-.3, '#3f9a5a', 90], [-.22, '#2f7d48', 120], [.32, '#3f9a5a', 100], [.38, '#57b46e', 70]].forEach(([fx, cl, hh], i) => { const x0 = cx + fx * tw; c.strokeStyle = cl; c.lineWidth = 9 * S; c.beginPath(); c.moveTo(x0, ty + th - 10 * S); c.quadraticCurveTo(x0 + Math.sin(t * 1.3 + i) * 18 * S, ty + th - hh * .6 * S, x0 + Math.sin(t * 1.1 + i + 1) * 12 * S, ty + th - hh * S); c.stroke(); });
      const sg = c.createLinearGradient(0, ty + th - 30 * S, 0, ty + th); sg.addColorStop(0, '#e6cf98'); sg.addColorStop(1, '#b89a5e'); c.fillStyle = sg;
      c.beginPath(); c.moveTo(tx, ty + th - 18 * S); c.quadraticCurveTo(cx - 60 * S, ty + th - 34 * S, cx, ty + th - 22 * S); c.quadraticCurveTo(cx + 80 * S, ty + th - 12 * S, tx + tw, ty + th - 26 * S); c.lineTo(tx + tw, ty + th); c.lineTo(tx, ty + th); c.fill();
      [[-.1, '#8a8f99', 12], [.06, '#c9b8a0', 9], [.2, '#7d8792', 14]].forEach(([fx, cl, rr]) => vol(cx + fx * tw, ty + th - 16 * S, rr * S, rr * .6 * S, cl));
      // рыбка
      const target = last && stroking > 0 ? Math.max(tx + 70 * S, Math.min(tx + tw - 70 * S, last[0])) : cx + Math.sin(t * .8) * 85 * S;
      const nx = fishX + (target - fishX) * Math.min(1, .04 * 60 / 60 * 3); if (Math.abs(nx - fishX) > .3) fishDir = nx > fishX ? 1 : -1; fishX = nx;
      const fy = cy - 10 * S + Math.sin(t * 1.7) * 14 * S, wagF = Math.sin(t * (stroking > 0 ? 14 : 7)) * .3, ry = (spec.slim ? 22 : 32) * S, rx = 56 * S;
      c.save(); c.translate(fishX, fy); c.scale(fishDir, 1);
      c.save(); c.translate(-rx * .85, 0); c.rotate(wagF); const tl = (spec.bigTail ? 52 : 34) * S, tg = c.createLinearGradient(0, 0, -tl, 0); tg.addColorStop(0, spec.alt || col); tg.addColorStop(1, mix(spec.alt || col, '#ffffff', .35));
      c.fillStyle = tg; c.globalAlpha = .9; c.beginPath(); c.moveTo(4 * S, 0); c.quadraticCurveTo(-tl * .6, -tl * .9, -tl, -tl * .75); c.quadraticCurveTo(-tl * .7, 0, -tl, tl * .75); c.quadraticCurveTo(-tl * .6, tl * .9, 4 * S, 0); c.fill(); c.globalAlpha = 1; c.restore();
      c.fillStyle = mix(spec.alt || col, '#000000', .1); c.beginPath(); c.moveTo(-20 * S, -ry * .8); c.quadraticCurveTo(0, -ry * 1.7, 22 * S, -ry * .85); c.fill();
      const bgF = c.createLinearGradient(0, -ry, 0, ry); bgF.addColorStop(0, mix(col, '#ffffff', .3)); bgF.addColorStop(.6, col); bgF.addColorStop(1, mix(col, '#000000', .25));
      c.fillStyle = bgF; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fill();
      if (spec.stripe) { c.fillStyle = spec.stripe; c.beginPath(); c.ellipse(4 * S, -ry * .1, rx * .85, ry * .18, 0, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.5 * S; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc((-18 + i * 14) * S, 0, ry * .55, -.9, .9); c.stroke(); }
      ell(16 * S, ry * .35, 14 * S, 7 * S, mix(spec.alt || col, '#ffffff', .2), .5);
      ell(rx * .55, -ry * .22, 9 * S, 9 * S, '#fff'); ell(rx * .58, -ry * .22, 5 * S, 5.5 * S, '#1c1418'); ell(rx * .6, -ry * .3, 1.8 * S, 1.8 * S, '#fff');
      if (joy > 12) ell(rx * .5, ry * .2, 7 * S, 4 * S, `rgba(255,120,160,${Math.min(.5, joy / 180)})`);
      c.restore();
      c.strokeStyle = 'rgba(220,245,255,.75)'; c.lineWidth = 1.4 * S; bubbles.forEach(bb => { c.beginPath(); c.arc(bb.x, bb.y, bb.r, 0, 7); c.stroke(); });
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(tx + 12 * S, ty + 12 * S); c.lineTo(tx + 40 * S, ty + 12 * S); c.lineTo(tx + 12 * S, ty + 90 * S); c.fill();
      c.strokeStyle = 'rgba(200,240,255,.6)'; c.lineWidth = 3 * S; c.beginPath(); c.roundRect ? c.roundRect(tx, ty, tw, th, r) : c.rect(tx, ty, tw, th); c.stroke();
      c.fillStyle = '#2b2f3a'; c.fillRect(tx - 6 * S, ty - 8 * S, tw + 12 * S, 10 * S);
    };
    fishX = cx;
    K.loop((dt, t) => {
      stroking = Math.max(0, stroking - dt); blink = blink > 0 ? blink - dt : (Math.random() < dt * .25 ? .15 : 0);
      if (stroking <= 0) joy = Math.max(0, joy - dt * 2);
      tilt += ((last && stroking > 0 ? Math.max(-1, Math.min(1, (last[0] - cx) / (150 * S))) * .14 : 0) - tilt) * Math.min(1, dt * 6);
      if (joy >= 100 && !full) { full = true; msg.innerHTML = HAPPY + ' 💗'; api.sfx.item?.(); for (let i = 0; i < (RM() ? 5 : 14); i++) hearts.push({ x: cx + (Math.random() - .5) * 200 * S, y: cy, vy: -60 - Math.random() * 60, vx: (Math.random() - .5) * 60, life: 1.8, s: 16 + Math.random() * 14 }); }
      if (stroking > 0) {
        purrT -= dt; buzzT -= dt;
        if (purrT <= 0) { purrT = pet.kind === 'cat' ? .34 : .9; if (pet.kind === 'cat') { hiss(.3, .05 + joy / 2500, 'lowpass', 140, 1); beep(48, .28, 'sine', .04, 0, 40); } else if (pet.kind === 'parrot') beep(2200 + Math.random() * 800, .07, 'sine', .02, 0, 3000); else if (pet.kind === 'fish') beep(500 + Math.random() * 300, .08, 'sine', .015, 0, 900); }
        if (buzzT <= 0 && joy > 25) { buzzT = 1.1; api.buzz('tap'); }
      }
      if (pet.kind === 'fish') { if (Math.random() < dt * (stroking > 0 ? 6 : 1.5) && bubbles.length < 30) bubbles.push({ x: fishX + (Math.random() - .5) * 40 * S, y: cy, r: (2 + Math.random() * 4) * S, v: 30 + Math.random() * 30 }); bubbles.forEach(bb => { bb.y -= bb.v * dt; bb.x += Math.sin(t * 3 + bb.v) * .3; }); bubbles = bubbles.filter(bb => bb.y > cy - 130 * S); }
      c.drawImage(bgCv, 0, 0, w, h);
      if (pet.kind === 'cat') drawCat(t); else if (pet.kind === 'dog') drawDog(t); else if (pet.kind === 'parrot') drawParrot(t); else drawFish(t);
      trail.forEach(p => { p.life -= dt; const a = Math.max(0, p.life / .45); c.fillStyle = `rgba(255,236,250,${a * .7})`; c.beginPath(); c.arc(p.x, p.y, 2 + a * 4, 0, 7); c.fill(); }); trail = trail.filter(p => p.life > 0);
      hearts.forEach(p => { p.life -= dt; p.y += p.vy * dt; p.x += p.vx * dt; c.globalAlpha = Math.max(0, Math.min(1, p.life)); const s2 = p.s * 1.3; c.drawImage(heart, p.x - s2 / 2, p.y - s2 / 2, s2, s2); });
      c.globalAlpha = 1; hearts = hearts.filter(p => p.life > 0);
      meter.style.width = joy.toFixed(1) + '%'; pc.textContent = Math.round(joy) + '%'; hIco.classList.toggle('on', stroking > 0 || full);
    });
  };

  // ================= 49. Пупырка =================
  IMPL[49] = (root, api) => {
    prep(root); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const w = W(root), cols = Math.max(6, Math.min(10, Math.floor((w - 20) / 44))), gap = 6, sz = Math.floor((w - 20 - gap * cols - (gap + 1) / 2) / (cols + .5));
    const rows = Math.max(6, Math.min(10, Math.floor((Math.max(380, innerHeight - 330)) / (sz + gap))));
    let popped = 0, sheets = 0, left = 0, down = false;
    root.innerHTML = `<div class="bgs5-hud bg49-hud"><span>🫧 ${L('Лопнуто', 'Popped')}: <span class="bg49-cnt">0</span></span><button type="button" class="bgs5-btn nw">🔄 ${L('Новый лист', 'New sheet')}</button></div>
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
    prep(root); const K = kit(api), L = api.L;
    root.classList.add('bgs5-calm');
    const w = W(root) - 12, h = Math.round(Math.min(w * 1.15, Math.max(280, innerHeight - 356), 560));
    let tool = 'rake', tines = 4, stones = [], strokes = 0, last = null, dir = null;
    root.innerHTML = `<div class="bgs5-row bg50-tools"><button type="button" class="bgs5-btn on" data-t="rake"><span>🪮</span>${L('Грабли', 'Rake')}</button><button type="button" class="bgs5-btn" data-t="stone"><span>🪨</span>${L('Камень', 'Stone')}</button>
      <button type="button" class="bgs5-btn tn"></button><button type="button" class="bgs5-btn clr"><span>〰️</span>${L('Разровнять', 'Smooth')}</button></div>
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
    // камень — готовый спрайт: объём, крапинки, блик, иногда мох
    const stoneSprite = s => {
      const size = Math.ceil(s.r * 2.6 + 16), [cv, x] = offCv(size, size), o = size / 2, rx = s.r * 1.05, ry = s.r * .85;
      const sh = x.createRadialGradient(o + 4, o + 7, s.r * .3, o + 4, o + 7, s.r * 1.3); sh.addColorStop(0, 'rgba(50,35,20,.45)'); sh.addColorStop(1, 'rgba(50,35,20,0)');
      x.fillStyle = sh; x.beginPath(); x.ellipse(o + 4, o + 7, rx * 1.25, ry * 1.2, s.a, 0, 7); x.fill();
      const g = x.createRadialGradient(o - s.r * .35, o - s.r * .45, s.r * .08, o, o, s.r * 1.12); g.addColorStop(0, mix(s.c[0], '#ffffff', .25)); g.addColorStop(.45, s.c[0]); g.addColorStop(1, s.c[1]);
      x.fillStyle = g; x.beginPath(); x.ellipse(o, o, rx, ry, s.a, 0, 7); x.fill();
      x.save(); x.clip();
      for (let i = 0; i < 18; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.16)'; x.beginPath(); x.arc(o + (Math.random() - .5) * rx * 1.8, o + (Math.random() - .5) * ry * 1.8, .6 + Math.random() * 1.1, 0, 7); x.fill(); }
      if (s.moss) { const m = x.createRadialGradient(o - s.r * .2, o - ry, 1, o - s.r * .2, o - ry, s.r * .9); m.addColorStop(0, 'rgba(120,160,70,.9)'); m.addColorStop(1, 'rgba(90,130,60,0)'); x.fillStyle = m; x.fillRect(0, 0, size, size); }
      x.restore();
      x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(o, o, rx * .9, ry * .86, s.a, Math.PI * 1.05, Math.PI * 1.55); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.ellipse(o - s.r * .35, o - s.r * .38, s.r * .28, s.r * .14, -.5, 0, 7); x.fill();
      return cv;
    };
    const drawStones = () => {
      top.clearRect(0, 0, w, h);
      stones.forEach(s => { s.spr = s.spr || stoneSprite(s); const z = s.spr.width / DPR(); top.drawImage(s.spr, s.x - z / 2, s.y - z / 2, z, z); });
    };
    const setTn = () => { tn.innerHTML = `<span>${'│'.repeat(tines)}</span>${tines} ${L(tines < 5 ? 'зубца' : 'зубцов', 'tines')}`; };
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
        const s = { x: p[0], y: p[1], r, a: Math.random() * 3, c: gs, moss: Math.random() < .3 }; stones.push(s); ringStone(s); drawStones(); beep(110, .18, 'sine', .07, 0, 80); api.buzz('tap');
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
    [[.3, .32], [.68, .62]].forEach(([fx, fy], i) => { const s = { x: w * fx, y: h * fy, r: 18 + i * 6, a: i, c: ['#9a968e', '#4e4a46'], moss: i === 1 }; stones.push(s); ringStone(s); });
    drawStones();
  };
})();
