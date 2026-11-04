/* сгенерировано tools/make-legacy.js из js/audio.js — не править */
var _a, _b;
let actx;
let sfxBus, sfxSend, sfxMaster, sfxNoise, sfxGraphFor;
const sfxVol = () => {
  var _a2;
  const v = +((_a2 = prefs.vol) != null ? _a2 : 80);
  return Math.max(0, Math.min(100, isFinite(v) ? v : 80)) / 100;
};
const sfxGain = () => sfxVol() ** 1.5;
function sfxBuild(a) {
  sfxGraphFor = a;
  const sr = a.sampleRate;
  sfxNoise = a.createBuffer(1, sr, sr);
  const nd = sfxNoise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const len = Math.floor(sr * 0.6), ir = a.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const x = i / len, k = 0.55 - 0.45 * x;
      lp += k * (Math.random() * 2 - 1 - lp);
      d[i] = lp * Math.pow(1 - x, 2.2) * Math.exp(-x * 4) * (i < sr * 4e-3 ? i / (sr * 4e-3) : 1);
    }
  }
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 14;
  comp.ratio.value = 3.5;
  comp.attack.value = 3e-3;
  comp.release.value = 0.16;
  const lim = a.createDynamicsCompressor();
  lim.threshold.value = -4;
  lim.knee.value = 0;
  lim.ratio.value = 20;
  lim.attack.value = 1e-3;
  lim.release.value = 0.06;
  const soft = a.createWaveShaper(), n = 1024, curve = new Float32Array(n), K = 1.6 / 0.88;
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1) * 2 - 1;
    curve[i] = 0.88 * Math.tanh(x * K) / Math.tanh(K);
  }
  soft.curve = curve;
  soft.oversample = "2x";
  sfxMaster = a.createGain();
  sfxMaster.gain.value = sfxGain();
  sfxBus = a.createGain();
  sfxBus.gain.value = 0.9;
  sfxSend = a.createGain();
  const rev = a.createConvolver();
  rev.normalize = true;
  rev.buffer = ir;
  const revTone = a.createBiquadFilter();
  revTone.type = "lowpass";
  revTone.frequency.value = 4800;
  const revOut = a.createGain();
  revOut.gain.value = 0.55;
  sfxBus.connect(comp);
  sfxSend.connect(rev).connect(revTone).connect(revOut).connect(comp);
  comp.connect(lim).connect(soft).connect(sfxMaster).connect(a.destination);
}
const audio = () => {
  var _a2, _b2;
  if (!prefs.sound || !sfxVol()) return null;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
    if (sfxGraphFor !== actx) sfxBuild(actx);
    if (actx.state === "suspended" && !window.vdpPaused && actx.resume) (_b2 = (_a2 = actx.resume()).catch) == null ? void 0 : _b2.call(_a2, () => {
    });
    return actx;
  } catch (e) {
    return null;
  }
};
(() => {
  const evs = ["pointerdown", "touchend", "keydown"];
  const unlock = () => {
    if (!prefs.sound || window.vdpPaused) return;
    const a = audio();
    if (!a) return;
    try {
      const s = a.createBufferSource();
      s.buffer = a.createBuffer(1, 1, a.sampleRate);
      s.connect(a.destination);
      s.start(0);
    } catch (e) {
    }
    if (a.state === "running") evs.forEach((e) => document.removeEventListener(e, unlock, true));
  };
  evs.forEach((e) => document.addEventListener(e, unlock, true));
})();
function sfxSetVol() {
  if (sfxMaster && actx) {
    try {
      sfxMaster.gain.setTargetAtTime(sfxGain(), actx.currentTime, 0.02);
    } catch (e) {
    }
  }
}
function sVoice(lp = 8e3, wet = 0.15) {
  const a = audio();
  if (!a) return null;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lp;
  f.Q.value = 0.4;
  f.connect(sfxBus);
  if (wet) {
    const s = a.createGain();
    s.gain.value = wet;
    f.connect(s).connect(sfxSend);
  }
  return { a, out: f, t: a.currentTime + 4e-3 };
}
function sOsc(v, f, dur, { type = "sine", vol = 0.1, at = 4e-3, delay = 0, to, toT, det = 0, hold = 0 } = {}) {
  const { a, out } = v, t = v.t + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (det) o.detune.setValueAtTime(det, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + (toT || dur));
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + at);
  if (hold) g.gain.setValueAtTime(vol, t + hold);
  g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function sHiss(v, dur, { vol = 0.1, type = "bandpass", f = 2e3, q = 0.8, to, delay = 0, at = 2e-3, hold = 0 } = {}) {
  const { a, out } = v, t = v.t + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = sfxNoise;
  fl.type = type;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + at);
  if (hold) g.gain.setValueAtTime(vol, t + hold);
  g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
  s.connect(fl).connect(g).connect(out);
  s.start(t, Math.random() * (0.98 - Math.min(dur, 0.9)), dur + 0.02);
}
const sThump = (v, f = 120, to = 60, dur = 0.08, vol = 0.25, delay = 0) => sOsc(v, f, dur, { vol, at: 3e-3, to, delay });
function sGlass(v, f, dur, vol, delay = 0) {
  sOsc(v, f, dur, { vol, at: 3e-3, delay });
  sOsc(v, f, dur * 0.8, { vol: vol * 0.35, at: 3e-3, delay, det: 7 });
  sOsc(v, f * 2.005, dur * 0.45, { vol: vol * 0.18, at: 2e-3, delay });
  sOsc(v, f * 2.76, dur * 0.25, { vol: vol * 0.07, at: 2e-3, delay });
}
function sWarm(v, f, dur, vol, delay = 0) {
  sOsc(v, f, dur, { type: "triangle", vol: vol * 0.6, at: 8e-3, delay });
  sOsc(v, f, dur, { vol: vol * 0.45, at: 0.01, delay, det: 6 });
  sOsc(v, f, dur * 0.9, { vol: vol * 0.45, at: 0.01, delay, det: -6 });
  sOsc(v, f * 2, dur * 0.4, { vol: vol * 0.12, at: 6e-3, delay });
}
const TG = ((_b = (_a = window.Telegram) == null ? void 0 : _a.WebApp) == null ? void 0 : _b.initData) ? window.Telegram.WebApp : null;
function buzz(kind) {
  var _a2;
  if (!prefs.sound) return;
  try {
    if (TG == null ? void 0 : TG.HapticFeedback) {
      if (kind === "tap") TG.HapticFeedback.impactOccurred("light");
      else if (kind === "danger" || kind === "lose") TG.HapticFeedback.notificationOccurred("error");
      else if (kind === "win" || kind === "item") TG.HapticFeedback.notificationOccurred("success");
      return;
    }
    (_a2 = navigator.vibrate) == null ? void 0 : _a2.call(navigator, { tap: 12, item: 25, danger: [30, 40, 30], lose: [60, 40, 140], win: [20, 30, 20, 30, 60] }[kind] || 10);
  } catch (e) {
  }
}
const sfxLast = {};
const sOnce = (name, gap, fn) => () => {
  var _a2;
  const now = performance.now();
  if (now - ((_a2 = sfxLast[name]) != null ? _a2 : -1e9) < gap) return;
  sfxLast[name] = now;
  try {
    fn();
  } catch (e) {
  }
};
const sfx = {
  // клавиша как на телефоне: короткий деревянный щелчок с тёплым телом
  click: sOnce("click", 25, () => {
    const v = sVoice(6e3, 0.05);
    if (!v) return;
    sThump(v, 150, 75, 0.055, 0.3);
    sOsc(v, 1250, 0.03, { type: "triangle", vol: 0.06, at: 1e-3 });
    sHiss(v, 0.018, { vol: 0.13, f: 3200, q: 1.2 });
  }),
  // лёгкий тик (часы, счётчики)
  tick: sOnce("tick", 30, () => {
    const v = sVoice(9e3, 0.04);
    if (!v) return;
    sOsc(v, 2400, 0.025, { vol: 0.045, at: 1e-3 });
    sHiss(v, 0.012, { vol: 0.05, type: "highpass", f: 6e3 });
    sThump(v, 220, 150, 0.03, 0.06);
  }),
  // «пузырёк»
  pop: sOnce("pop", 30, () => {
    const v = sVoice(5e3, 0.1);
    if (!v) return;
    sOsc(v, 520, 0.08, { vol: 0.13, at: 3e-3, to: 1040, toT: 0.05 });
    sOsc(v, 1560, 0.05, { vol: 0.02, at: 2e-3 });
    sThump(v, 140, 80, 0.07, 0.14);
  }),
  // новая карточка: шелест бумаги
  flick: sOnce("flick", 60, () => {
    const v = sVoice(9e3, 0.08);
    if (!v) return;
    sHiss(v, 0.05, { vol: 0.14, f: 3800, to: 1700, q: 0.7, at: 3e-3 });
    sHiss(v, 0.03, { vol: 0.06, f: 1200, q: 1, delay: 0.012 });
    sThump(v, 220, 140, 0.03, 0.05);
  }),
  // ответ свайпом: мягкий «вжух»
  swipe: sOnce("swipe", 60, () => {
    const v = sVoice(6e3, 0.12);
    if (!v) return;
    sHiss(v, 0.2, { vol: 0.1, f: 650, to: 2600, q: 0.9, at: 0.07 });
    sHiss(v, 0.16, { vol: 0.03, type: "lowpass", f: 500, at: 0.05 });
  }),
  // степлер: щелчок механизма + глухое тело + второй «клац»
  stapler: sOnce("stapler", 50, () => {
    const v = sVoice(7e3, 0.08);
    if (!v) return;
    sHiss(v, 0.02, { vol: 0.15, f: 2800, q: 1.5 });
    sOsc(v, 1600, 0.02, { type: "triangle", vol: 0.03, at: 1e-3, to: 900 });
    sThump(v, 170, 80, 0.07, 0.22, 0.012);
    sHiss(v, 0.035, { vol: 0.07, f: 1400, q: 1, delay: 0.05 });
    sThump(v, 120, 70, 0.05, 0.08, 0.05);
  }),
  // штамп: глубокий мягкий удар и бумага
  stamp: sOnce("stamp", 60, () => {
    const v = sVoice(1800, 0.12);
    if (!v) return;
    sThump(v, 105, 48, 0.2, 0.38);
    sHiss(v, 0.09, { vol: 0.18, type: "lowpass", f: 700 });
    sHiss(v, 0.02, { vol: 0.05, f: 1800, q: 1 });
  }),
  // вздох: шумовое «дыхание» с уходящим вниз фильтром
  sigh: sOnce("sigh", 400, () => {
    const v = sVoice(2500, 0.25);
    if (!v) return;
    sHiss(v, 0.7, { vol: 0.1, f: 1100, to: 380, q: 0.8, at: 0.18, delay: 0.03 });
    sOsc(v, 230, 0.6, { vol: 0.015, at: 0.1, to: 150, delay: 0.05 });
  }),
  // покупка/подтверждение: две стеклянные ноты вверх + толчок
  item: sOnce("item", 60, () => {
    buzz("item");
    const v = sVoice(7e3, 0.2);
    if (!v) return;
    sThump(v, 130, 70, 0.09, 0.18);
    sGlass(v, 880, 0.32, 0.085);
    sGlass(v, 1318.5, 0.45, 0.085, 0.075);
  }),
  // монеты: стеклянное «ка-чинг», как оплата телефоном
  coins: sOnce("coins", 80, () => {
    buzz("item");
    const v = sVoice(9e3, 0.26);
    if (!v) return;
    sHiss(v, 0.03, { vol: 0.1, f: 4500, q: 0.8 });
    sThump(v, 160, 90, 0.08, 0.17);
    sGlass(v, 1568, 0.5, 0.08, 0.01);
    sGlass(v, 2093, 0.75, 0.09, 0.11);
    sHiss(v, 0.25, { vol: 0.018, type: "highpass", f: 7e3, at: 0.02, delay: 0.11 });
  }),
  // сообщение: стеклянное уведомление из двух нот
  sms: sOnce("sms", 80, () => {
    const v = sVoice(8e3, 0.28);
    if (!v) return;
    sThump(v, 120, 80, 0.05, 0.07);
    sGlass(v, 1175, 0.4, 0.08);
    sGlass(v, 1568, 0.6, 0.08, 0.12);
  }),
  // настольный звонок «дзинь-дзинь»
  bell: sOnce("bell", 150, () => {
    const v = sVoice(7500, 0.32);
    if (!v) return;
    [0, 0.16].forEach((d, i) => {
      const k = i ? 0.6 : 1;
      sHiss(v, 0.01, { vol: 0.05 * k, type: "highpass", f: 5e3, delay: d });
      sOsc(v, 1318, 0.7, { vol: 0.08 * k, at: 2e-3, delay: d });
      sOsc(v, 1318, 0.6, { vol: 0.035 * k, at: 2e-3, delay: d, det: 5 });
      sOsc(v, 1318 * 2.4, 0.3, { vol: 0.025 * k, at: 2e-3, delay: d });
      sOsc(v, 1318 * 3.9, 0.15, { vol: 0.01 * k, at: 2e-3, delay: d });
    });
  }),
  // зуммер «время выходит»: неприятный, но приглушённый — два «бз-з» с биениями под мягким фильтром
  buzzer: sOnce("buzzer", 200, () => {
    buzz("danger");
    const v = sVoice(1500, 0.12);
    if (!v) return;
    [0, 0.3].forEach((d) => {
      sOsc(v, 117, 0.24, { type: "sawtooth", vol: 0.07, at: 0.012, delay: d, hold: 0.17 });
      sOsc(v, 124, 0.24, { type: "sawtooth", vol: 0.06, at: 0.012, delay: d, hold: 0.17 });
      sOsc(v, 58.5, 0.24, { vol: 0.2, at: 0.01, delay: d, hold: 0.17 });
      sHiss(v, 0.24, { vol: 0.035, f: 420, q: 2, delay: d, at: 0.015, hold: 0.17 });
    });
  }),
  // победа: тёплый восходящий мажорный перезвон
  win: sOnce("win", 300, () => {
    buzz("win");
    const v = sVoice(5200, 0.3);
    if (!v) return;
    sThump(v, 110, 55, 0.14, 0.3);
    sHiss(v, 0.08, { vol: 0.1, type: "lowpass", f: 600 });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => sWarm(v, f, i === 3 ? 0.6 : 0.45, 0.075, 0.04 + i * 0.085));
  }),
  // проигрыш: мягкий нисходящий минор и низкий выдох
  lose: sOnce("lose", 300, () => {
    buzz("lose");
    const v = sVoice(2200, 0.22);
    if (!v) return;
    sThump(v, 95, 45, 0.2, 0.34);
    sHiss(v, 0.1, { vol: 0.13, type: "lowpass", f: 400 });
    [659.25, 523.25, 440].forEach((f, i) => sWarm(v, f, i === 2 ? 0.55 : 0.42, 0.075, 0.06 + i * 0.14));
    sOsc(v, 110, 0.55, { vol: 0.06, at: 0.03, delay: 0.34 });
  })
};
