// Съёмка настоящей игры для заставки: Playwright открывает игру (нужен сервер: python3 -m http.server 8800 в корне),
// время управляется вручную (page.clock + Web Animations), каждая сцена — серия JPEG 1080×1920 в $TMP/vdp-cap/<сцена>/.
// Запуск: node tools/trailer/capture.js [сцена …]   (без аргументов — все сцены)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const OUT = process.env.VDP_CAP || path.join(require('os').tmpdir(), 'vdp-cap');
const URL = process.env.VDP_URL || 'http://localhost:8800/index.html';
const FPS = 30;

// Сервер игры офлайн: лента, рейтинг недели дня и офис — демо-данные
const ago = m => new Date(Date.now() - m * 60e3).toISOString();
const FEED = [
  { kind: 'hero_buy', detail: 'hobby:moto:70', name: 'Марина', avatar: '🦊', m: 2, reactions: { '🔥': 12, '👍': 5 }, gifts: 3 },
  { kind: 'week_end', won: true, name: 'Дима', avatar: '😎', m: 6, reactions: { '👍': 8 }, gifts: 1 },
  { kind: 'pet_adopt', detail: 'cat_ginger', name: 'Аня', avatar: '🐱', m: 11, reactions: { '😂': 3, '🔥': 6 } },
  { kind: 'rank_up', detail: '3', name: 'Игорь', avatar: '🧔', m: 18, reactions: { '👍': 14 }, gifts: 4 },
  { kind: 'fired', detail: '', step: 13, name: 'Лёша', avatar: '🙃', m: 25, reactions: { '😢': 9, '😂': 4 } },
  { kind: 'break_record', detail: '22:48', name: 'Катя', avatar: '🌸', m: 31, reactions: { '🔥': 7 } },
  { kind: 'hero_buy', detail: 'need:car:60', name: 'Тимур', avatar: '🚀', m: 40, reactions: { '🔥': 10 }, gifts: 2 },
  { kind: 'streak_claim', detail: '14', name: 'Ольга', avatar: '☕', m: 52, reactions: { '👍': 4 } },
].map((r, i) => ({ item_id: 900 - i, short_id: 'x' + i, step: 25, mode: 'career', is_me: false, created_at: ago(r.m), ...r }));
const DAILY = [['Катя', '🌸', 'Бухгалтерия', 312], ['Дима', '😎', 'Продажи', 298], ['Костя', '😏', 'Маркетинг', 291], ['Марина', '🦊', 'HR', 276],
  ['Игорь', '🧔', 'IT', 263], ['Аня', '🐱', 'Дизайн', 255], ['Тимур', '🚀', 'Продажи', 240], ['Ольга', '☕', 'Бухгалтерия', 233], ['Лёша', '🙃', 'IT', 0]]
  .map(([name, avatar, dept, total], i) => ({ tag: 't' + i, name, avatar, dept, prof: 'marketer', won: total > 0, step: total ? 25 : 14, total, created_at: ago(30 + i * 7), mode: 'daily' }));

// чат офиса: сообщения, стикеры и подарки (новые — сверху, как отдаёт сервер)
const CHAT = [
  { name: 'Марина', avatar: '🦊', msg: '[st:07]', m: 1 },
  { name: 'Дима', avatar: '😎', msg: 'Кто на кофе? ☕', m: 2 },
  { name: 'Катя', avatar: '🌸', gift: 'donut', gift_to: 'Дима', m: 3 },
  { name: 'Игорь', avatar: '🧔', msg: 'Пятница уже близко, держитесь!', m: 5 },
  { name: 'Аня', avatar: '🐱', msg: '[st:03]', m: 6 },
  { name: 'Тимур', avatar: '🚀', msg: 'Босс опять «на минутку» позвал 😅', m: 8 },
].map((r, i) => ({ msg_id: 50 - i, short_id: 's' + i, dept: '', mine: false, sent_at: ago(r.m), ...r }));

async function open(b) {
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, serviceWorkers: 'block', locale: 'ru-RU', reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('vdp-prefs')) localStorage.setItem('vdp-prefs', JSON.stringify({ name: 'Костя', dept: 'Маркетинг', avatar: '😏', prof: 'marketer', trait: 'workaholic', sound: false, introSeen: 1 }));
    localStorage.setItem('vdp-lang', 'ru');
  });
  await ctx.route(/supabase\.co|mc\.yandex|yandex\.ru|googletagmanager|telegram\.org|vk\.com/, r => {
    const u = r.request().url();
    if (/post_message/.test(u)) { const a = JSON.parse(r.request().postData() || '{}'); CHAT.unshift({ msg_id: 100 + CHAT.length, short_id: 'me', name: 'Костя', avatar: '😏', mine: true, msg: a.p_text, sent_at: new Date().toISOString() }); return r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }); }
    if (/send_gift/.test(u)) { const a = JSON.parse(r.request().postData() || '{}'); CHAT.unshift({ msg_id: 100 + CHAT.length, short_id: 'me', name: 'Костя', avatar: '😏', mine: true, gift: a.p_gift, gift_to: 'Марина', sent_at: new Date().toISOString() }); return r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }); }
    if (/my_team/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ name: 'Отдел маркетинга', code: 'ABC123' }]) });
    const body = /get_messages/.test(u) ? CHAT : /feed_latest/.test(u) ? FEED : /daily_leaderboard/.test(u) ? DAILY : /leaderboard/.test(u) ? DAILY : /supabase/.test(u) ? [] : '';
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('  pageerror:', e.message));
  await p.clock.install();
  await p.goto(URL); await p.waitForFunction(() => typeof dataLoaded !== 'undefined' && dataLoaded && POOL.length > 100, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  // свой персонаж — без окна выбора
  await p.evaluate(() => {
    window.HERO_ORIG = heroCreate;
    window.heroCreate = f => { const C2 = careerNow(); C2.hero = { preset: 'f2', name: 'Анна', married: false, mood: 80, owned: [], last: {}, pending: null, xpWeek: 0, breaks: 0 }; ensureKids?.(C2.hero); careerSave(C2); f(); };
    // время Web Animations двигаем вручную вместе с часами страницы
    window.__adv = dt => { for (const a of document.getAnimations()) { if (a.__t == null) { a.pause(); a.__t = a.currentTime || 0; } a.__t += dt; a.currentTime = a.__t; } };
  });
  // дальше время страницы идёт только по нашей команде: и таймеры игры, и анимации CSS
  await p.clock.pauseAt(Date.now() + 400);
  await p.evaluate(() => window.__adv(0));
  const ev = (fn, arg) => p.evaluate(fn, arg);
  return { p, ctx, ev };
}

// Записать n кадров: каждый кадр — шаг 1/30 с; act(i) вызывается перед кадром (для действий по сценарию)
async function rec(s, name, n, act) {
  const dir = path.join(OUT, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  await s.p.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.__t = a.currentTime || 0; } });
  for (let i = 0; i < n; i++) {
    if (act) await act(i);
    await s.p.clock.runFor(1000 / FPS); await s.p.evaluate(d => window.__adv(d), 1000 / FPS);
    await s.p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 88 });
  }
  console.log('  ', name, n, 'кадров');
}

// ---------- сцены ----------
// ждать ms по часам страницы (шагами по 100 мс; между шагами — немного реального времени на загрузку файлов и 3D)
async function wait(s, ms, realMs = 15) {
  for (let left = ms; left > 0; left -= 100) {
    const d = Math.min(100, left);
    await s.p.clock.runFor(d); await s.p.evaluate(d => window.__adv(d), d);
    if (realMs) await s.p.waitForTimeout(realMs);
  }
}
const load = (s, ms = 2500) => s.p.waitForTimeout(ms);  // реальное время: модели three.js, кадры персонажей
async function week(s, res) {  // карьера → первая неделя, заставка дня и подсказки убраны
  await s.ev(() => newCareer()); await wait(s, 900);
  await s.ev(res => { $('splash').click(); $('coach').hidden = true; document.querySelectorAll('.coach,.tip,#tip').forEach(e => e.hidden = true); if (res) { Object.assign(S.res, res); renderBars(); } }, res);
  await wait(s, 1200);
  // всплывшее предложение (дедлайн, желание героя) — отказаться, чтобы в кадре была карточка
  await s.ev(() => { const m = $('modal'); if (!m.hidden) { const b = [...m.querySelectorAll('button')].find(b => /Отказаться|Не сейчас|Позже|Закрыть/.test(b.textContent)); b ? b.click() : (m.hidden = true); } $('coach').hidden = true; });
  await wait(s, 600);
}
async function menuWithMoney(s) { await week(s); await s.ev(() => { leaveWeek(); const c = careerNow(); c.bank = 140; careerSave(c); }); await wait(s, 800); }
const clickText = (s, sel, txt) => s.ev(([sel, txt]) => { const b = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(txt)); b?.click(); return !!b; }, [sel, txt]);
async function brk(s, n, prep) {
  await menuWithMoney(s);
  await s.ev(n => playBreak(n), n); await load(s, 1500); await wait(s, 1000);
  if (prep) await prep(s); await wait(s, 600);
}
const toon = fn => async s => { await menuWithMoney(s); await s.ev(fn); };
const SCENES = {
  // 1) карточки: появление, подсветка ответа, свайп вправо, новая карточка, свайп влево
  card: async s => {
    await week(s);
    await rec(s, 'card', 150, async i => {
      await s.ev(() => { $('coach').hidden = true; });
      if (i === 12) await s.ev(() => preview('right'));
      if (i === 34) await s.ev(() => { clearPreview(); choose('right'); });
      if (i === 66) await s.ev(() => preview('left'));
      if (i === 88) await s.ev(() => { clearPreview(); choose('left'); });
      if (i === 118) await s.ev(() => preview('right'));
      if (i === 138) await s.ev(() => { clearPreview(); choose('right'); });
    });
  },
  // 2) опасность: шкалы у края — «на грани» и «перегрев»
  danger: async s => {
    await week(s, { psyche: 41, energy: 9, boss: 93, colleagues: 55 });
    await rec(s, 'danger', 50, async i => { if (i === 6) await s.ev(() => preview('right')); });
  },
  // 3) персонаж: настоящее окно выбора, смена героя
  hero: async s => {
    await s.ev(() => { window.heroCreate = HERO_ORIG; newCareer(); });
    await load(s, 3000); await wait(s, 1500); await load(s, 3000);
    await rec(s, 'hero', 54, async i => { if (i === 22) await s.ev(() => document.querySelectorAll('.hero-thumb')[1].click()); });
  },
  moto: async s => {
    await toon(() => { const it = GOODS.flatMap(g => g.items).find(i => i.id === 'moto'); playToon({ kind: 'ride', prop: 'moto', cat: GOODS.find(g => g.items.includes(it)), list: [it], mood: 32, h: careerNow().hero }); })(s);
    await load(s); await wait(s, 3300); await rec(s, 'moto', 40);
  },
  flowers: async s => {
    await toon(() => { const c = GOODS.find(g => g.id === 'flowers'), it = c.items[2]; playToon({ kind: 'delivery', cat: c, list: [it], mood: 18, h: careerNow().hero }); })(s);
    await load(s); await wait(s, 4000); await rec(s, 'flowers', 32);
  },
  pet: async s => {
    await toon(() => { const h = careerNow().hero; h.pets = [{ id: 'p1', kind: 'dog', breed: 'dog_corgi', name: 'Булка', mood: 90, have: [], last: {} }]; petToon('play', h.pets[0], { ico: '🎾', t: 'Мячик' }); })(s);
    await load(s); await wait(s, 2300); await rec(s, 'pet', 32);
  },
  b13: async s => { await brk(s, 13); await rec(s, 'b13', 22, async i => { if (i === 8) await s.p.mouse.click(150, 300); }); },
  b1: async s => { await brk(s, 1, async s => { await clickText(s, '.brk-root button', 'Мидл'); }); await rec(s, 'b1', 22); },
  b32: async s => {
    const type = (w, enter) => s.ev(([w, enter]) => { const k = ch => [...document.querySelectorAll('.bgq4-k')].find(b => b.textContent === ch)?.click(); for (const ch of w) k(ch); if (enter) k('Ввод'); }, [w, enter]);
    await brk(s, 32, async s => { for (const w of ['ПОЧТА', 'ПАПКА']) { await type(w, true); await wait(s, 1500); } });
    await rec(s, 'b32', 22, async i => { if (i % 3 === 0 && i < 15) await type('СТОЛЫ'[i / 3]); });
  },
  b11: async s => { await brk(s, 11, async s => { await clickText(s, '.brk-root button', '3 × 3'); }); await rec(s, 'b11', 22); },
  // --- вторая волна: повышение, редкие вещи, «сними стресс», темы, стикеры, подарки, серия, анкета, цитаты ---
  levelup: async s => {
    await menuWithMoney(s);
    await s.ev(() => { const c = careerNow(); Object.assign(c, { week: 53, worked: 48, passed: 3, failed: 1, firings: 1, earned: 420 }); careerSave(c); C = c; yearEnd(); });
    await wait(s, 300); await s.ev(() => document.querySelector('.lvl-next')?.scrollIntoView({ block: 'center' })); await wait(s, 200);
    await rec(s, 'levelup', 45);
  },
  yacht: async s => {
    await toon(() => { const x = rareItemById('r_yacht'); playToon({ kind: 'ride', prop: 'boat', list: [x], mood: 45, h: careerNow().hero }); })(s);
    await load(s); await wait(s, 2400); await rec(s, 'yacht', 40);
  },
  b46: async s => { await brk(s, 46, async s => { await clickText(s, '.brk-root button', 'Начать'); await wait(s, 1200); }); await rec(s, 'b46', 22); },
  b50: async s => {
    await brk(s, 50); await s.p.mouse.move(90, 300); await s.p.mouse.down();
    for (let i = 0; i < 20; i++) await s.p.mouse.move(90 + i * 9, 300 + 60 * Math.sin(i / 3), { steps: 2 });
    await rec(s, 'b50', 22, async i => { await s.p.mouse.move(270 + i * 9, 300 + 60 * Math.sin((i + 20) / 3), { steps: 2 }); });
    await s.p.mouse.up();
  },
  b49: async s => {
    await brk(s, 49);
    const pt = i => [70 + (i % 8) * 55, 120 + Math.floor(i / 8) * 55 + (i % 2) * 20];
    for (let i = 0; i < 10; i++) { const [x, y] = pt(i * 3); await s.p.mouse.click(x, y); await wait(s, 60, 0); }
    await rec(s, 'b49', 22, async i => { if (i % 2 === 0) { const [x, y] = pt(31 + i * 2); await s.p.mouse.click(x, y); } });
  },
  b48: async s => {
    await brk(s, 48); await s.p.mouse.move(200, 330); await s.p.mouse.down();
    await rec(s, 'b48', 22, async i => { await s.p.mouse.move(200 + 140 * Math.abs(Math.sin(i / 4)), 320 + (i % 3) * 8, { steps: 3 }); });
    await s.p.mouse.up();
  },
  b36: async s => { await brk(s, 36); await rec(s, 'b36', 22); },
  themes: async s => {
    await menuWithMoney(s);
    await s.ev(() => { renderMenu(); openProfile(); $('themePick').scrollIntoView({ block: 'center' }); }); await wait(s, 600);
    const order = [3, 9, 14, 20, 26, 7];
    await rec(s, 'themes', 54, async i => { if (i % 9 === 4) await s.ev(k => document.querySelectorAll('.tp-sw')[k]?.click(), order[(i - 4) / 9]); });
  },
  stickers: async s => {
    await menuWithMoney(s);
    await s.ev(() => showChat('team')); await load(s, 800); await wait(s, 600);
    await rec(s, 'stickers', 54, async i => {
      if (i === 6) await s.ev(() => document.querySelector('.soc-stb')?.click());
      if (i === 28) { await s.ev(() => document.querySelector('.soc-stp [data-st="9"]')?.click()); await load(s, 600); }
      if (i === 30) await load(s, 400);
    });
  },
  gifts: async s => {
    await menuWithMoney(s);
    await s.ev(() => showChat('team')); await load(s, 800); await wait(s, 600);
    await rec(s, 'gifts', 54, async i => {
      if (i === 3) await s.ev(() => socGiftPicker({ kind: 'msg', id: 50, to: 's0', name: 'Марина' }));
      if (i === 13) await s.ev(() => document.querySelector('[data-g="champagne"]')?.click());
      if (i === 22) { await s.ev(() => $('sgGo').click()); await load(s, 600); }
    });
  },
  streak: async s => {
    await menuWithMoney(s);
    await s.ev(() => { prefs.gamesPlayed = 3; prefs.dayStreak = { last: new Date(Date.now() - 864e5).toISOString().slice(0, 10), count: 4, claimed: true }; store.set(KEY.prefs, prefs); if ($('viralPop')) $('viralPop').hidden = true; showDayStreak(); });
    await wait(s, 400); await rec(s, 'streak', 45, async i => { if (i === 22) await s.ev(() => $('stkGo').click()); });
  },
  anketa: async s => { await menuWithMoney(s); await s.ev(() => anketaOpen()); await wait(s, 800); await rec(s, 'anketa', 30); },
  quote: async s => {
    await menuWithMoney(s);
    await s.ev(() => { renderMenu(); }); await load(s, 800); await wait(s, 500);
    await s.ev(() => { if ($('viralPop')) $('viralPop').hidden = true; $('qtDay')?.scrollIntoView({ block: 'center' }); }); await wait(s, 300);
    await rec(s, 'quote', 30, async i => { if (i === 12) { await s.ev(() => $('qtMore').click()); } });
  },
  store: async s => { await menuWithMoney(s); await s.ev(() => openStore()); await wait(s, 400); await rec(s, 'store', 26); },
  feed: async s => { await menuWithMoney(s); await s.ev(() => showFeed()); await wait(s, 200); await rec(s, 'feed', 30); },
  board: async s => { await menuWithMoney(s); await s.ev(() => openBoard('menu', 'daily')); await wait(s, 200); await rec(s, 'board', 30); },
};
module.exports = { open, rec, OUT, SCENES };

if (require.main === module) (async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const n of names) {
    const t = Date.now(), s = await open(b);
    try { await SCENES[n](s); } catch (e) { console.log('  ошибка в сцене', n, e.message); }
    await s.ctx.close(); console.log(n, ((Date.now() - t) / 1000 | 0) + ' с');
  }
  await b.close();
})();
