// Звук и вибрация: степлер, штамп, вздох; тактильный отклик в Telegram и на телефоне.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- звук: степлер, штамп, вздох ----------
let actx;
const audio = () => { if (!prefs.sound) return null; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); return actx; } catch { return null; } };
function tone(freq, dur = .12, type = 'sine', vol = .05, delay = 0, to) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur);
}
function noise(dur, vol, filter, freq, delay = 0, freqTo, attack = .002) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, len = Math.ceil(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = buf; f.type = filter; f.frequency.setValueAtTime(freq, t); if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + dur);
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
const sfx = {
  stapler: () => { noise(.03, .25, 'highpass', 2500); tone(1800, .025, 'square', .03); tone(140, .07, 'sine', .12, .02, 70); noise(.05, .12, 'bandpass', 900, .05); },
  stamp: () => { tone(95, .18, 'sine', .25, 0, 55); noise(.09, .3, 'lowpass', 500); },
  sigh: () => { noise(.75, .07, 'bandpass', 1100, .05, 380, .18); tone(230, .6, 'sine', .015, .05, 150); },
  lose: () => { buzz('lose'); sfx.stamp(); [330, 262, 196, 147].forEach((f, i) => tone(f, .28, 'sawtooth', .035, .2 + i * .16)); },
  win: () => { buzz('win'); sfx.stamp(); [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .06, .15 + i * .12)); },
  bell: () => { [1318, 1760, 1318].forEach((f, i) => tone(f, .35, 'triangle', .05, i * .14)); tone(2637, .5, 'sine', .015, .05); },
  item: () => { buzz('item'); [880, 1320].forEach((f, i) => tone(f, .12, 'triangle', .05, i * .07)); },
};
