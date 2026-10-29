// Симуляция баланса «Выжить до пятницы»: сколько недель закрывают разные игроки.
// Запуск: node tools/balance.js [множитель эффектов]
// «Внимательный» игрок видит только то, что показывает игра: направление (▲/▼) и силу (одна или две стрелки).
const fs = require('fs');
const pool = JSON.parse(fs.readFileSync(__dirname + '/../data/pool.json', 'utf8'));
const KEYS = ['psyche', 'energy', 'boss', 'colleagues'];
const SCALE = +(process.argv[2] || 1);
const byPhase = ph => pool.filter(c => c.phase === ph);
const PH = ['Утро', 'День', 'Вечер'];
const rnd = a => a[Math.floor(Math.random() * a.length)];
const eff = (c, side) => Object.fromEntries(KEYS.map(k => [k, Math.round((c.answers[side].effects[k] || 0) * SCALE / 5) * 5]));
const seen = v => v === 0 ? 0 : v > 0 ? (v >= 20 ? 2 : 1) : (v <= -20 ? -2 : -1);  // что видно в подсказке
function week(strategy, { items = 1.5, chance = 0.6 } = {}) {
  const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
  let inv = Math.random() < items - 1 ? 2 : 1, saved = false;
  for (let i = 0; i < 15; i++) {
    const c = rnd(byPhase(PH[i % 3]));
    const side = strategy(c, res);
    const e = eff(c, side);
    for (const k of KEYS) {
      let v = e[k];
      if (v <= -10 && inv > 0 && Math.random() < .5) { v = 0; inv--; }  // предмет на случайную шкалу
      res[k] = Math.max(0, Math.min(100, res[k] + v));
    }
    const dead = KEYS.find(k => res[k] <= 0 || res[k] >= 100);
    if (dead) {
      if (!saved && Math.random() < chance) { saved = true; res[dead] = res[dead] >= 100 ? 80 : 20; continue; }  // второй шанс: доля верных ответов
      return false;
    }
  }
  return true;
}
const random = () => Math.random() < .5 ? 'left' : 'right';
const careful = (c, res) => {  // выбирает сторону, где шкалы после хода ближе к 50 и дальше от краёв
  const score = side => KEYS.reduce((a, k) => { const v = res[k] + seen(c.answers[side].effects[k] || 0) * 10; return a + Math.abs(v - 50) + (v <= 10 || v >= 90 ? 80 : 0); }, 0);
  return score('left') <= score('right') ? 'left' : 'right';
};
const N = 20000;
for (const [name, st] of [['случайный', random], ['внимательный', careful]]) {
  for (const [label, opt] of [['без помощи', { items: 0, chance: 0 }], ['с предметами и вторым шансом', {}]]) {
    let ok = 0; for (let i = 0; i < N; i++) if (week(st, opt)) ok++;
    console.log(`${name.padEnd(13)} ${label.padEnd(30)} закрывают неделю: ${(100 * ok / N).toFixed(1)}%`);
  }
}
