// Звук и вибрация: степлер, штамп, вздох; тактильный отклик в Telegram и на телефоне.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- звук: мягкий «дорогой» синтез ----------
// Всё рисуется WebAudio на лету: слоистые синусы/треугольники с лёгкой расстройкой, мягкая атака,
// экспоненциальный спад, фильтр низких частот, тихий «бас-толчок» для веса и короткая комната (свёртка).
// Общая шина: компрессор → лимитер → мягкое ограничение → громкость (prefs.vol, 0–100) → выход.
let actx;                      // общий AudioContext (его же ставит на паузу ads.js во время ролика)
let sfxBus, sfxSend, sfxMaster, sfxNoise, sfxGraphFor;
const sfxVol = () => { const v = +(prefs.vol ?? 80); return Math.max(0, Math.min(100, isFinite(v) ? v : 80)) / 100; };
const sfxGain = () => sfxVol() ** 1.5;   // громкость на слух ровнее, чем линейно

function sfxBuild(a) {
  sfxGraphFor = a;
  const sr = a.sampleRate;
  // шум на 1 с — один на все звуки, каждый раз читаем со случайного места
  sfxNoise = a.createBuffer(1, sr, sr);
  const nd = sfxNoise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  // импульс «небольшой комнаты»: 0,6 с, хвост темнеет к концу
  const len = Math.floor(sr * .6), ir = a.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c); let lp = 0;
    for (let i = 0; i < len; i++) {
      const x = i / len, k = .55 - .45 * x;               // к хвосту сглаживаем сильнее — он темнее
      lp += k * ((Math.random() * 2 - 1) - lp);
      d[i] = lp * Math.pow(1 - x, 2.2) * Math.exp(-x * 4) * (i < sr * .004 ? i / (sr * .004) : 1);
    }
  }
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 3.5; comp.attack.value = .003; comp.release.value = .16;
  const lim = a.createDynamicsCompressor();
  lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .06;
  // мягкое ограничение: почти линейно на тихом, никогда не выше 0,88
  const soft = a.createWaveShaper(), n = 1024, curve = new Float32Array(n), K = 1.6 / .88;
  for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curve[i] = .88 * Math.tanh(x * K) / Math.tanh(K); }
  soft.curve = curve; soft.oversample = '2x';
  sfxMaster = a.createGain(); sfxMaster.gain.value = sfxGain();
  sfxBus = a.createGain(); sfxBus.gain.value = .9;
  sfxSend = a.createGain();
  const rev = a.createConvolver(); rev.normalize = true; rev.buffer = ir;
  const revTone = a.createBiquadFilter(); revTone.type = 'lowpass'; revTone.frequency.value = 4800;
  const revOut = a.createGain(); revOut.gain.value = .55;
  sfxBus.connect(comp);
  sfxSend.connect(rev).connect(revTone).connect(revOut).connect(comp);
  comp.connect(lim).connect(soft).connect(sfxMaster).connect(a.destination);
}
// Контекст создаём лениво (на первом звуке/жесте); выключенный звук или громкость 0 — ничего не строим
const audio = () => {
  if (!prefs.sound || !sfxVol()) return null;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    if (sfxGraphFor !== actx) sfxBuild(actx);
    if (actx.state === 'suspended' && !window.vdpPaused && actx.resume) actx.resume().catch?.(() => {});
    return actx;
  } catch { return null; }
};
// Разблокировка звука на первом жесте (iOS/Safari и автоплей-политика Chrome)
(() => {
  const evs = ['pointerdown', 'touchend', 'keydown'];
  const unlock = () => {
    if (!prefs.sound || window.vdpPaused) return;
    const a = audio(); if (!a) return;
    try { const s = a.createBufferSource(); s.buffer = a.createBuffer(1, 1, a.sampleRate); s.connect(a.destination); s.start(0); } catch {}
    if (a.state === 'running') evs.forEach(e => document.removeEventListener(e, unlock, true));
  };
  evs.forEach(e => document.addEventListener(e, unlock, true));
})();
// Плавно применить новую громкость (ползунок в профиле)
function sfxSetVol() { if (sfxMaster && actx) { try { sfxMaster.gain.setTargetAtTime(sfxGain(), actx.currentTime, .02); } catch {} } }

// Голос одного звука: свой фильтр + отправка в комнату. Слои подключаются к v.out, старт в v.t
function sVoice(lp = 8000, wet = .15) {
  const a = audio(); if (!a) return null;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = .4;
  f.connect(sfxBus);
  if (wet) { const s = a.createGain(); s.gain.value = wet; f.connect(s).connect(sfxSend); }
  return { a, out: f, t: a.currentTime + .004 };
}
// Тон: мягкая атака, экспоненциальный спад; hold — держать уровень до этого момента (для зуммера)
function sOsc(v, f, dur, { type = 'sine', vol = .1, at = .004, delay = 0, to, toT, det = 0, hold = 0 } = {}) {
  const { a, out } = v, t = v.t + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (det) o.detune.setValueAtTime(det, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + (toT || dur));
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + at);
  if (hold) g.gain.setValueAtTime(vol, t + hold);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(out); o.start(t); o.stop(t + dur + .02);
}
// Шумовой слой из общего буфера через фильтр
function sHiss(v, dur, { vol = .1, type = 'bandpass', f = 2000, q = .8, to, delay = 0, at = .002, hold = 0 } = {}) {
  const { a, out } = v, t = v.t + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = sfxNoise; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + at);
  if (hold) g.gain.setValueAtTime(vol, t + hold);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl).connect(g).connect(out); s.start(t, Math.random() * (.98 - Math.min(dur, .9)), dur + .02);
}
// «Тактильный» толчок снизу: синус с падающим тоном
const sThump = (v, f = 120, to = 60, dur = .08, vol = .25, delay = 0) => sOsc(v, f, dur, { vol, at: .003, to, delay });
// Стеклянная нота: основной тон + лёгкая расстройка + призвуки, которые гаснут быстрее
function sGlass(v, f, dur, vol, delay = 0) {
  sOsc(v, f, dur, { vol, at: .003, delay });
  sOsc(v, f, dur * .8, { vol: vol * .35, at: .003, delay, det: 7 });
  sOsc(v, f * 2.005, dur * .45, { vol: vol * .18, at: .002, delay });
  sOsc(v, f * 2.76, dur * .25, { vol: vol * .07, at: .002, delay });
}
// Тёплая нота: треугольник + пара синусов ±6 центов + октава сверху
function sWarm(v, f, dur, vol, delay = 0) {
  sOsc(v, f, dur, { type: 'triangle', vol: vol * .6, at: .008, delay });
  sOsc(v, f, dur, { vol: vol * .45, at: .01, delay, det: 6 });
  sOsc(v, f, dur * .9, { vol: vol * .45, at: .01, delay, det: -6 });
  sOsc(v, f * 2, dur * .4, { vol: vol * .12, at: .006, delay });
}

// Вибрация: в Telegram — родной отклик, в браузере телефона — navigator.vibrate
const TG = window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : null;
function buzz(kind) {
  if (!prefs.sound) return;
  try {
    if (TG?.HapticFeedback) {
      if (kind === 'tap') TG.HapticFeedback.impactOccurred('light');
      else if (kind === 'danger' || kind === 'lose') TG.HapticFeedback.notificationOccurred('error');
      else if (kind === 'win' || kind === 'item') TG.HapticFeedback.notificationOccurred('success');
      return;
    }
    navigator.vibrate?.({ tap: 12, item: 25, danger: [30, 40, 30], lose: [60, 40, 140], win: [20, 30, 20, 30, 60] }[kind] || 10);
  } catch {}
}

// Один и тот же звук не чаще раза в gap мс: мини-игры зовут часто — не плодим узлы и не забиваем микс
const sfxLast = {};
const sOnce = (name, gap, fn) => () => {
  const now = performance.now();
  if (now - (sfxLast[name] ?? -1e9) < gap) return;
  sfxLast[name] = now;
  try { fn(); } catch {}
};
const sfx = {
  // клавиша как на телефоне: короткий деревянный щелчок с тёплым телом
  click: sOnce('click', 25, () => { const v = sVoice(6000, .05); if (!v) return;
    sThump(v, 150, 75, .055, .3); sOsc(v, 1250, .03, { type: 'triangle', vol: .06, at: .001 }); sHiss(v, .018, { vol: .13, f: 3200, q: 1.2 }); }),
  // лёгкий тик (часы, счётчики)
  tick: sOnce('tick', 30, () => { const v = sVoice(9000, .04); if (!v) return;
    sOsc(v, 2400, .025, { vol: .045, at: .001 }); sHiss(v, .012, { vol: .05, type: 'highpass', f: 6000 }); sThump(v, 220, 150, .03, .06); }),
  // «пузырёк»
  pop: sOnce('pop', 30, () => { const v = sVoice(5000, .1); if (!v) return;
    sOsc(v, 520, .08, { vol: .13, at: .003, to: 1040, toT: .05 }); sOsc(v, 1560, .05, { vol: .02, at: .002 }); sThump(v, 140, 80, .07, .14); }),
  // новая карточка: шелест бумаги
  flick: sOnce('flick', 60, () => { const v = sVoice(9000, .08); if (!v) return;
    sHiss(v, .05, { vol: .14, f: 3800, to: 1700, q: .7, at: .003 }); sHiss(v, .03, { vol: .06, f: 1200, q: 1, delay: .012 }); sThump(v, 220, 140, .03, .05); }),
  // ответ свайпом: мягкий «вжух»
  swipe: sOnce('swipe', 60, () => { const v = sVoice(6000, .12); if (!v) return;
    sHiss(v, .2, { vol: .1, f: 650, to: 2600, q: .9, at: .07 }); sHiss(v, .16, { vol: .03, type: 'lowpass', f: 500, at: .05 }); }),
  // степлер: щелчок механизма + глухое тело + второй «клац»
  stapler: sOnce('stapler', 50, () => { const v = sVoice(7000, .08); if (!v) return;
    sHiss(v, .02, { vol: .15, f: 2800, q: 1.5 }); sOsc(v, 1600, .02, { type: 'triangle', vol: .03, at: .001, to: 900 });
    sThump(v, 170, 80, .07, .22, .012); sHiss(v, .035, { vol: .07, f: 1400, q: 1, delay: .05 }); sThump(v, 120, 70, .05, .08, .05); }),
  // штамп: глубокий мягкий удар и бумага
  stamp: sOnce('stamp', 60, () => { const v = sVoice(1800, .12); if (!v) return;
    sThump(v, 105, 48, .2, .38); sHiss(v, .09, { vol: .18, type: 'lowpass', f: 700 }); sHiss(v, .02, { vol: .05, f: 1800, q: 1 }); }),
  // вздох: шумовое «дыхание» с уходящим вниз фильтром
  sigh: sOnce('sigh', 400, () => { const v = sVoice(2500, .25); if (!v) return;
    sHiss(v, .7, { vol: .1, f: 1100, to: 380, q: .8, at: .18, delay: .03 }); sOsc(v, 230, .6, { vol: .015, at: .1, to: 150, delay: .05 }); }),
  // покупка/подтверждение: две стеклянные ноты вверх + толчок
  item: sOnce('item', 60, () => { buzz('item'); const v = sVoice(7000, .2); if (!v) return;
    sThump(v, 130, 70, .09, .18); sGlass(v, 880, .32, .085); sGlass(v, 1318.5, .45, .085, .075); }),
  // монеты: стеклянное «ка-чинг», как оплата телефоном
  coins: sOnce('coins', 80, () => { buzz('item'); const v = sVoice(9000, .26); if (!v) return;
    sHiss(v, .03, { vol: .1, f: 4500, q: .8 }); sThump(v, 160, 90, .08, .17);
    sGlass(v, 1568, .5, .08, .01); sGlass(v, 2093, .75, .09, .11);
    sHiss(v, .25, { vol: .018, type: 'highpass', f: 7000, at: .02, delay: .11 }); }),
  // сообщение: стеклянное уведомление из двух нот
  sms: sOnce('sms', 80, () => { const v = sVoice(8000, .28); if (!v) return;
    sThump(v, 120, 80, .05, .07); sGlass(v, 1175, .4, .08); sGlass(v, 1568, .6, .08, .12); }),
  // настольный звонок «дзинь-дзинь»
  bell: sOnce('bell', 150, () => { const v = sVoice(7500, .32); if (!v) return;
    [0, .16].forEach((d, i) => { const k = i ? .6 : 1;
      sHiss(v, .01, { vol: .05 * k, type: 'highpass', f: 5000, delay: d });
      sOsc(v, 1318, .7, { vol: .08 * k, at: .002, delay: d }); sOsc(v, 1318, .6, { vol: .035 * k, at: .002, delay: d, det: 5 });
      sOsc(v, 1318 * 2.4, .3, { vol: .025 * k, at: .002, delay: d }); sOsc(v, 1318 * 3.9, .15, { vol: .01 * k, at: .002, delay: d }); }); }),
  // зуммер «время выходит»: неприятный, но приглушённый — два «бз-з» с биениями под мягким фильтром
  buzzer: sOnce('buzzer', 200, () => { buzz('danger'); const v = sVoice(1500, .12); if (!v) return;
    [0, .3].forEach(d => {
      sOsc(v, 117, .24, { type: 'sawtooth', vol: .07, at: .012, delay: d, hold: .17 });
      sOsc(v, 124, .24, { type: 'sawtooth', vol: .06, at: .012, delay: d, hold: .17 });
      sOsc(v, 58.5, .24, { vol: .2, at: .01, delay: d, hold: .17 });
      sHiss(v, .24, { vol: .035, f: 420, q: 2, delay: d, at: .015, hold: .17 }); }); }),
  // победа: тёплый восходящий мажорный перезвон
  win: sOnce('win', 300, () => { buzz('win'); const v = sVoice(5200, .3); if (!v) return;
    sThump(v, 110, 55, .14, .3); sHiss(v, .08, { vol: .1, type: 'lowpass', f: 600 });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => sWarm(v, f, i === 3 ? .6 : .45, .075, .04 + i * .085)); }),
  // проигрыш: мягкий нисходящий минор и низкий выдох
  lose: sOnce('lose', 300, () => { buzz('lose'); const v = sVoice(2200, .22); if (!v) return;
    sThump(v, 95, 45, .2, .34); sHiss(v, .1, { vol: .13, type: 'lowpass', f: 400 });
    [659.25, 523.25, 440].forEach((f, i) => sWarm(v, f, i === 2 ? .55 : .42, .075, .06 + i * .14));
    sOsc(v, 110, .55, { vol: .06, at: .03, delay: .34 }); }),
};
