(() => {
  // ---------- данные ----------
  const RES = [
    { k: 'psyche', name: 'Кукуха' },
    { k: 'energy', name: 'Энергия' },
    { k: 'boss', name: 'Босс' },
    { k: 'colleagues', name: 'Коллеги' },
  ];
  const resName = k => RES.find(r => r.k === k).name;
  const PROF = {
    marketer:   { name: 'Маркетолог',  icon: '📣', bonus: { colleagues: 15, psyche: -5 }, perk: 'Коллеги +15 · Кукуха −5' },
    accountant: { name: 'Бухгалтер',   icon: '🧮', bonus: { boss: 15, energy: -5 },       perk: 'Босс +15 · Энергия −5' },
    dev:        { name: 'Программист', icon: '💻', bonus: { psyche: 15, colleagues: -5 }, perk: 'Кукуха +15 · Коллеги −5' },
    sales:      { name: 'Продажник',   icon: '📞', bonus: { energy: 15, psyche: -5 },     perk: 'Энергия +15 · Кукуха −5' },
  };
  const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const PHASES = [{ name: 'Утро' }, { name: 'День' }, { name: 'Вечер' }];
  const PHASE_KEY = ['morning', 'day', 'evening'];
  const PHASE_TIME = ['09:00', '13:00', '17:00'];
  const DAY_QUIP = [
    'Неделя только началась. Кофе налит, нервы пока целы.',
    'Вчерашние письма никуда не делись. Их стало больше.',
    'Экватор недели. Половина пути до свободы.',
    'Четверг — это маленькая пятница. Держитесь.',
    'Последний рывок. До 18:00 рукой подать.',
  ];
  const DEATH = {
    psyche:     { title: 'Кукуха 0%', text: 'Вы не выдержали очередного «Асиап» в чате, перевернули кулер с водой и ушли в закат. Вас ищут HR.' },
    energy:     { title: 'Энергия 0%', text: 'Энергетический кризис. Вы уснули на ковре в переговорной во время важного зума с инвесторами. Вас аккуратно накрыли пледом и уволили.' },
    boss:       { title: 'Босс 0%', text: 'Шеф вызвал вас «на пару слов» и вручил трудовую книжку. Ваши мемы в общем чате признаны экстремистскими.' },
    colleagues: { title: 'Коллеги 0%', text: 'Коллектив объявил вам тотальный бойкот. Никто не передал вам пароль от нового Wi‑Fi и не позвал есть пирог на кухне. Работать в изоляции стало невыносимо.' },
  };

  // Карточки: CARDS_JSON, DECOR, RANDOM_JSON — в js/cards.js; цепочки, недели, профессии — в js/content.js
  const norm = c => ({ ...c, ...(DECOR[c.id] || {}),
    answers: { left: c.answers.left || c.answers.left_switch, right: c.answers.right || c.answers.right_switch } });
  const CARDS = CARDS_JSON.map(norm);
  const RANDOM_CARDS = RANDOM_JSON.map(c => ({ ...norm(c), random: true }));
  const CHAIN_CARDS = CHAINS.map(ch => ({ ...norm(ch.card), chain: ch.origin }));
  const TYPE_CARDS = Object.values(WEEK_TYPES).flatMap(t => (t.cards || []).map(norm));
  const PROF_ALL = Object.values(PROF_CARDS).flat().map(c => ({ ...norm(c), profCard: true }));
  const POOL = POOL_JSON.map(norm);  // большой пул из js/pool.js: каждая карточка выпадает один раз
  const QUIZ = typeof QUIZ_JSON === 'undefined' ? [] : QUIZ_JSON;  // вопросы второго шанса из js/quiz.js
  const SUGGESTED = [];  // одобренные карточки от коллег, загружаются из Supabase
  let PACK = null, PACK_CARDS = [];
  const byId = Object.fromEntries([...CARDS, ...RANDOM_CARDS, ...CHAIN_CARDS, ...TYPE_CARDS, ...PROF_ALL, ...POOL].map(c => [c.id, c]));
  const TOTAL_CARDS = CARDS.length + RANDOM_CARDS.length + TYPE_CARDS.length + PROF_ALL.length + POOL.length;

  function getRandomCard(standardCard, randomPack, percent = 15, random = Math.random) {
    // Генерируем случайное число от 1 до 100
    const chance = Math.floor(random() * 100) + 1;

    // Если выпало меньше или равно 15 (или шансу недели), выдаем случайное событие вместо стандартного
    if (chance <= percent && randomPack.length > 0) {
      const randomIndex = Math.floor(random() * randomPack.length);
      // Достаем карточку и удаляем её из пула, чтобы не повторялась за одну неделю
      return randomPack.splice(randomIndex, 1)[0];
    }

    return standardCard;
  }

  // ---------- хранилище ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const KEY = { save: 'vdp-save', best: 'vdp-best', prefs: 'vdp-prefs', career: 'vdp-career', endings: 'vdp-endings', daily: 'vdp-daily', seen: 'vdp-seen', qseen: 'vdp-quiz-seen' };
  const YEAR = 52;
  const prefs = Object.assign({ name: '', dept: '', avatar: '😎', prof: 'marketer', trait: 'workaholic', sound: true }, store.get(KEY.prefs, {}));
  const AVATARS = ['😎', '🤓', '🧐', '😴', '🤠', '🥸', '🤖', '🦄', '🐱', '🐶', '🦊', '🐼'];
  if (!prefs.playerId) {
    prefs.playerId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
    store.set(KEY.prefs, prefs);
  }
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dayLabel = iso => iso.split('-').reverse().slice(0, 2).join('.');

  // Детерминированный генератор: одинаковая неделя дня у всех
  const seeded = str => { let h = 1779033703 ^ str.length; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353), h = h << 13 | h >>> 19;
    let a = h >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  // ---------- общий рейтинг и участники ----------
  // С ключами Supabase из js/config.js данные общие для всего офиса, без них — хранятся в этом браузере.
  // Чужие player_id наружу не отдаются: строки узнаются по tag = SHA-256(player_id).
  async function sha256hex(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch { return 'local-' + text; }
  }
  const myTag = sha256hex(prefs.playerId);
  const board = (() => {
    const cfg = window.SUPABASE_CONFIG || {};
    const online = !!(cfg.url && cfg.anonKey);
    const base = online ? cfg.url.replace(/\/+$/, '') + '/rest/v1' : '';
    // Ключ нового формата (sb_publishable_…) передаётся только в apikey; старый anon-ключ (JWT) — ещё и как Bearer
    const headers = online ? { apikey: cfg.anonKey, 'Content-Type': 'application/json',
      ...(cfg.anonKey.startsWith('eyJ') ? { Authorization: `Bearer ${cfg.anonKey}` } : {}) } : {};
    const better = (a, b) => (b.won - a.won) || (b.step - a.step) || (b.total - a.total) || (a.created_at < b.created_at ? -1 : 1);
    const LOCAL = 'vdp-board', PEOPLE = 'vdp-people';
    const req = async (path, opts = {}) => {
      const r = await fetch(`${base}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
      if (!r.ok) {
        let detail = '';
        try { const j = await r.json(); detail = [j.code, j.message].filter(Boolean).join(' '); } catch {}
        throw new Error(`Supabase ответил ${r.status} на ${path.split('?')[0]}${detail ? ` (${detail})` : ''}`);
      }
      return r.status === 204 || opts.method === 'POST' ? null : r.json();
    };
    const me = async () => ({ tag: await myTag, name: prefs.name, dept: prefs.dept, avatar: prefs.avatar });
    const authBase = online ? cfg.url.replace(/\/+$/, '') + '/auth/v1' : '';
    // Токен входа: хранится в браузере и продлевается сам; база по нему проверяет, кто вы
    let refreshing = null;
    async function token() {
      const ss = prefs.session;
      if (!online || !ss) return null;
      if (ss.exp - Date.now() > 60000) return ss.access;
      refreshing = refreshing || (async () => {
        const r = await fetch(`${authBase}/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: cfg.anonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: ss.refresh }) });
        if (!r.ok) { delete prefs.session; store.set(KEY.prefs, prefs); toast('Сессия входа истекла — войдите по почте ещё раз'); return null; }
        const j = await r.json();
        prefs.session = { access: j.access_token, refresh: j.refresh_token, exp: (j.expires_at ? j.expires_at * 1000 : Date.now() + j.expires_in * 1000) };
        store.set(KEY.prefs, prefs);
        return j.access_token;
      })().finally(() => { refreshing = null; });
      return refreshing;
    }
    const authHeaders = async (explicit) => { const t = explicit || await token(); return t ? { Authorization: `Bearer ${t}` } : {}; };
    const deptQ = dept => dept ? `&dept=eq.${encodeURIComponent(dept)}` : '';
    return {
      online, token,
      async logout() { const t = prefs.session?.access; if (t) await fetch(`${authBase}/logout`, { method: 'POST', headers: { apikey: cfg.anonKey, Authorization: `Bearer ${t}` } }).catch(() => {}); },
      async touch(status, step = 0) {
        if (!prefs.name) return;
        if (!online) {
          const all = store.get(PEOPLE, {}), m = await me();
          all[m.tag] = { ...all[m.tag], ...m, prof: prefs.prof, status, step, updated_at: new Date().toISOString(), created_at: all[m.tag]?.created_at || new Date().toISOString() };
          store.set(PEOPLE, all); return;
        }
        await req('/rpc/touch_player', { method: 'POST', headers: await authHeaders(), body: JSON.stringify({ p_id: prefs.playerId, p_name: prefs.name, p_dept: prefs.dept,
          p_avatar: prefs.avatar, p_prof: prefs.prof, p_status: status, p_step: step }) });
      },
      async submit(entry) {
        if (!online) {
          const all = store.get(LOCAL, []); all.push({ ...entry, ...(await me()), created_at: new Date().toISOString() });
          store.set(LOCAL, all.slice(-300)); return;
        }
        const auth = await authHeaders();
        const post = body => req('/scores', { method: 'POST', headers: { Prefer: 'return=minimal', ...auth }, body: JSON.stringify(body) });
        try { await post(entry); }
        catch (err) {
          // база со старой схемой: без колонок mode/day/overheat. Неделю дня так не записать — просим обновить schema.sql
          if (!/PGRST204|column/i.test(err.message)) throw err;
          if (entry.mode !== 'career') throw new Error('обновите базу: выполните свежий supabase/schema.sql');
          const { mode, day, overheat, ...old } = entry; await post(old);
        }
      },
      async top(dept) {
        if (!online) {
          const bestOf = {};
          for (const e of store.get(LOCAL, []).filter(e => (e.mode || 'career') === 'career')) if (!bestOf[e.tag] || better(e, bestOf[e.tag]) < 0) bestOf[e.tag] = e;
          return Object.values(bestOf).filter(e => !dept || e.dept === dept).sort(better).slice(0, 100);
        }
        return req(`/leaderboard?select=*&order=won.desc,step.desc,total.desc,created_at.asc&limit=100${deptQ(dept)}`);
      },
      async daily(day, dept) {
        if (!online) {
          const first = {};
          for (const e of store.get(LOCAL, []).filter(e => e.mode === 'daily' && e.day === day)) if (!first[e.tag]) first[e.tag] = e;
          return Object.values(first).filter(e => !dept || e.dept === dept).sort(better);
        }
        return req(`/daily_leaderboard?select=*&day=eq.${day}&order=won.desc,step.desc,total.desc,created_at.asc&limit=100${deptQ(dept)}`);
      },
      async depts() {
        if (!online) {
          const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
          const by = {};
          for (const e of store.get(LOCAL, []).filter(e => e.dept && e.mode !== 'pack' && new Date(e.created_at) >= monday)) {
            const d = by[e.dept] = by[e.dept] || { dept: e.dept, players: new Set(), weeks: 0, sum: 0, wins: 0 };
            d.players.add(e.tag); d.weeks++; d.sum += e.won ? e.total : e.step * 10; d.wins += e.won ? 1 : 0;
          }
          return Object.values(by).map(d => ({ dept: d.dept, players: d.players.size, weeks: d.weeks, avg_score: Math.round(d.sum / d.weeks), win_rate: Math.round(100 * d.wins / d.weeks) }))
            .sort((a, b) => b.avg_score - a.avg_score);
        }
        return req('/dept_week?select=*&order=avg_score.desc');
      },
      async people(dept) {
        if (!online) {
          const games = store.get(LOCAL, []);
          return Object.values(store.get(PEOPLE, {})).filter(p => !dept || p.dept === dept).map(p => {
            const mine = games.filter(g => g.tag === p.tag), best = [...mine].sort(better)[0];
            return { ...p, games: mine.length, wins: mine.filter(g => g.won).length, best_won: best?.won, best_step: best?.step, best_total: best?.total };
          }).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
        }
        return req(`/participants?select=*&order=updated_at.desc&limit=200${deptQ(dept)}`);
      },
      async suggest(card) {
        if (!online) throw new Error('общий офис не подключён: предложения принимаются только с ключами Supabase');
        const auth = await authHeaders();
        if (!auth.Authorization) throw new Error('предлагать карточки можно после входа по почте');
        await req('/suggestions', { method: 'POST', headers: { Prefer: 'return=minimal', ...auth }, body: JSON.stringify({ ...card, player_id: prefs.playerId }) });
      },
      async approved() { return online ? req('/approved_cards?select=*&limit=200') : []; },
      // Функции офисов и чатов; ошибки из базы приходят готовым русским текстом
      async rpc(name, args, token) {
        if (!online) throw new Error('общий офис не подключён: нужны ключи Supabase в js/config.js');
        const r = await fetch(`${base}/rpc/${name}`, { method: 'POST', body: JSON.stringify(args),
          headers: { ...headers, ...(await authHeaders(token)) } });
        const t = await r.text();
        if (!r.ok) { let m = ''; try { m = JSON.parse(t).message; } catch {} throw new Error(m || `Supabase ответил ${r.status}`); }
        return t ? JSON.parse(t) : null;
      },
      // Регистрация: ссылка для входа на почту (Supabase Auth)
      async sendLink(email) {
        const redirect = location.origin + location.pathname;
        const r = await fetch(`${cfg.url.replace(/\/+$/, '')}/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, {
          method: 'POST', headers: { apikey: cfg.anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, create_user: true }) });
        if (!r.ok) { let m = ''; try { const j = await r.json(); m = j.msg || j.message || j.error_description || ''; } catch {} throw new Error(m || `Supabase ответил ${r.status}`); }
      },
      async user(token) {
        const r = await fetch(`${cfg.url.replace(/\/+$/, '')}/auth/v1/user`, { headers: { apikey: cfg.anonKey, Authorization: `Bearer ${token}` } });
        if (!r.ok) throw new Error(`вход не удался (${r.status})`);
        return r.json();
      },
    };
  })();

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
  const sfx = {
    stapler: () => { noise(.03, .25, 'highpass', 2500); tone(1800, .025, 'square', .03); tone(140, .07, 'sine', .12, .02, 70); noise(.05, .12, 'bandpass', 900, .05); },
    stamp: () => { tone(95, .18, 'sine', .25, 0, 55); noise(.09, .3, 'lowpass', 500); },
    sigh: () => { noise(.75, .07, 'bandpass', 1100, .05, 380, .18); tone(230, .6, 'sine', .015, .05, 150); },
    lose: () => { sfx.stamp(); [330, 262, 196, 147].forEach((f, i) => tone(f, .28, 'sawtooth', .035, .2 + i * .16)); },
    win: () => { sfx.stamp(); [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .06, .15 + i * .12)); },
    item: () => { [880, 1320].forEach((f, i) => tone(f, .12, 'triangle', .05, i * .07)); },
  };

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const views = { join: $('join'), menu: $('menu'), game: $('game'), end: $('end'), board: $('board') };
  const show = v => Object.entries(views).forEach(([k, el]) => el.hidden = k !== v);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const rnd = (a, r = Math.random) => a[Math.floor(r() * a.length)];
  const shuffle = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = v => Math.max(0, Math.min(100, v));
  const EASE = 'cubic-bezier(.2,.7,.2,1)';

  // Неоновые трубки: слева Кукуха и Энергия, справа Босс и Коллеги
  const tube = r => `<div class="tube-wrap" id="st-${r.k}" data-k="${r.k}">
      <span class="arrows" id="mk-${r.k}" aria-hidden="true"></span>
      <div class="tube"><div class="fill" id="fl-${r.k}"></div></div>
      <span class="lbl">${r.name}</span><span class="pct" id="pc-${r.k}">50%</span></div>`;
  $('tubesL').innerHTML = RES.slice(0, 2).map(tube).join('');
  $('tubesR').innerHTML = RES.slice(2).map(tube).join('');
  const setPhase = p => { document.body.dataset.phase = p; };

  // Офис за окном: утром пусто, днём все на местах, вечером горит одна лампа
  (() => {
    let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let city = '', x = 104;
    while (x < 1096) {
      const w = 30 + Math.floor(r() * 50), h = 60 + Math.floor(r() * 140);
      city += `<rect class="bld" x="${x}" y="${250 - h}" width="${w}" height="${h}"/>`;
      for (let wy = 256 - h; wy < 240; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12)
        if (r() > .35) city += `<rect class="cw${r() > .55 ? ' lit' : ''}" x="${wx}" y="${wy}" width="5" height="7"/>`;
      x += w + 4;
    }
    const desk = (dx, i) => `<g class="desk${i === 3 ? ' last' : ''}">
      <rect class="mon" x="${dx + 60}" y="228" width="86" height="54" rx="4"/><rect class="stand" x="${dx + 98}" y="282" width="10" height="10"/>
      <g class="person"><circle cx="${dx + 103}" cy="262" r="15"/><path d="M${dx + 72} 300 q31 -34 62 0z"/></g>
      <rect class="top" x="${dx}" y="292" width="210" height="8" rx="2"/><rect class="leg" x="${dx + 10}" y="300" width="6" height="56"/><rect class="leg" x="${dx + 194}" y="300" width="6" height="56"/>
      ${i === 3 ? `<polygon class="lamp-glow" points="${dx + 176},214 ${dx + 120},292 ${dx + 220},292"/><path class="lamp" d="M${dx + 196} 292 v-62 l-24 -14"/><path class="lamp" d="M${dx + 160} 214 h28 l-6 -10 h-16z"/>` : ''}
    </g>`;
    $('office').innerHTML = `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">
      <rect class="sky" x="100" y="20" width="1000" height="232"/>${city}
      <rect class="frame" x="100" y="20" width="1000" height="232"/><path class="frame" d="M350 20v232M600 20v232M850 20v232"/>
      <rect class="floor" x="0" y="356" width="1200" height="44"/>${[110, 380, 650, 920].map(desk).join('')}</svg>`;
  })();

  function renderSound() {
    for (const b of [$('soundMenu'), $('soundGame')]) { b.textContent = prefs.sound ? '♪' : '×'; b.setAttribute('aria-pressed', prefs.sound); b.title = prefs.sound ? 'Звук включён' : 'Звук выключен'; }
  }
  function toggleSound() { prefs.sound = !prefs.sound; store.set(KEY.prefs, prefs); renderSound(); }
  $('soundMenu').onclick = toggleSound; $('soundGame').onclick = toggleSound;

  let toastT;
  function toast(text) { const t = $('toastBar'); t.textContent = text; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

  // ---------- концовки-ачивки ----------
  const endingsGot = () => store.get(KEY.endings, {});
  function unlock(ids) {
    const got = endingsGot(), fresh = ids.filter(id => id && !got[id]);
    for (const id of fresh) got[id] = new Date().toISOString();
    if (fresh.length) store.set(KEY.endings, got);
    return fresh.map(id => ENDINGS.find(e => e.id === id)).filter(Boolean);
  }
  const endingsHtml = list => list.length ? `<div class="unlocked">${list.map(e => `<span>Новая концовка: «${esc(e.title)}»</span>`).join('')}</div>` : '';

  // ---------- меню ----------
  $('profs').innerHTML = Object.entries(PROF).map(([k, p]) => `<label class="prof">
      <input type="radio" name="prof" value="${k}"><b>${p.name}</b><small>${p.perk}</small></label>`).join('');
  $('traits').innerHTML = Object.entries(TRAITS).map(([k, t]) => `<label class="prof">
      <input type="radio" name="trait" value="${k}"><b>${t.name}</b><small>${t.desc}</small></label>`).join('');
  const getProf = () => document.querySelector('input[name=prof]:checked')?.value || 'marketer';
  const getTrait = () => document.querySelector('input[name=trait]:checked')?.value || 'workaholic';

  function renderMenu() {
    $('meAva').textContent = prefs.avatar; $('meName').textContent = prefs.name; $('meDept').textContent = prefs.dept || 'без отдела';
    myTag.then(t => { $('meId').textContent = `ID ${shortId(t)} · ${registered() ? prefs.email : prefs.email ? 'войдите снова' : 'гость'}`; });
    $('meRegister').hidden = registered() || !board.online; $('meRegister').textContent = prefs.email ? 'Войти' : 'Регистрация';
    renderOfficeLine();
    for (const id of LOCKED) $(id).classList.toggle('locked', !registered());
    renderInvites();
    (document.querySelector(`input[name=prof][value=${prefs.prof}]`) || document.querySelector('input[name=prof]')).checked = true;
    (document.querySelector(`input[name=trait][value=${prefs.trait}]`) || document.querySelector('input[name=trait]')).checked = true;
    setPhase('evening');
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    const seenN = store.get(KEY.seen, []).filter(id => byId[id]).length;
    $('record').textContent = (best.wins ? `недель закрыто: ${best.wins}` : best.step ? `дольше всего: ${DAYS[Math.floor(best.step / 3)]}, ${PHASES[best.step % 3].name.toLowerCase()}` : 'пока нет')
      + ` · карточек открыто: ${Math.min(seenN, TOTAL_CARDS)}/${TOTAL_CARDS}`;
    const save = store.get(KEY.save, null);
    if (save && !save.deck?.every(x => byId[x.id])) store.del(KEY.save); // сохранение от старой колоды
    const Cm = store.get(KEY.career, null), careerSave = save && (save.mode || 'career') === 'career';
    $('careerCard').hidden = !Cm; $('profField').hidden = !!Cm; $('traitField').hidden = !!Cm; $('newCareer').hidden = !Cm;
    $('newCareer').textContent = 'Начать карьеру заново'; delete $('newCareer').dataset.armed;
    if (Cm) {
      const where = Cm.stage === 'search' ? 'ищет работу' : Cm.company;
      $('careerCard').innerHTML = `<div class="cc-head"><b>Неделя ${Math.min(Cm.week, YEAR)}/${YEAR}</b><span>${esc(where)}</span></div>
        <div class="cc-bar"><i style="width:${(Math.min(Cm.week - 1, YEAR) / YEAR) * 100}%"></i></div>
        <div class="stat-box"><b>${Cm.worked}</b><span>отработано</span></div>
        <div class="stat-box"><b>${Cm.firings}</b><span>увольнений</span></div>
        <div class="stat-box"><b>${Cm.companies.length}</b><span>компаний</span></div>
        <div class="cc-trait">${PROF[Cm.prof].name} · ${TRAITS[Cm.trait || 'workaholic'].name}</div>`;
      $('start').textContent = careerSave ? 'Продолжить неделю' : Cm.stage === 'search' ? 'Продолжить поиск работы' : `Начать неделю ${Cm.week}`;
    } else $('start').textContent = 'Начать карьеру';
    const daily = store.get(KEY.daily, {})[today()];
    $('startDaily').textContent = daily ? `Неделя дня ${dayLabel(today())} · ${daily.won ? 'пройдена' : 'завалена'}, сыграть ещё` : `Неделя дня ${dayLabel(today())} · одна на весь офис`;
    $('startPack').hidden = !PACK; if (PACK) $('startPack').textContent = PACK.title;
    $('openCollection').textContent = `Коллекция ${Object.keys(endingsGot()).length}/${ENDINGS.length}`;
    renderSound(); show('menu');
    board.touch('menu').catch(() => {}).then(() => { claimReferral(); checkReferrals(); });
    maybeViralPop();
  }
  $('profs').onchange = () => { prefs.prof = getProf(); store.set(KEY.prefs, prefs); };
  $('traits').onchange = () => { prefs.trait = getTrait(); store.set(KEY.prefs, prefs); };
  $('openBoard').onclick = () => openBoard('menu', 'rating');
  $('openPeople').onclick = () => openBoard('menu', 'people');
  $('openCollection').onclick = showCollection;
  // Только для зарегистрированных: офис, чаты, свои карточки. Гостю предлагаем регистрацию
  const registered = () => !!(prefs.email && prefs.session);
  const LOCKED = ['openOffice', 'openChat', 'openSuggest'];
  const needAccount = (fn, why) => () => registered() || !board.online ? fn()
    : prefs.email ? renderJoin('login', 'Сессия входа истекла. Пришлём новую ссылку на вашу почту.') : renderJoin('register', why);
  $('openOffice').onclick = needAccount(showOffice, '«Мой офис» доступен после регистрации: соберите команду и позовите коллег.');
  $('openChat').onclick = needAccount(() => showChat('team'), 'Чаты доступны после регистрации — так коллеги будут знать, кто пишет.');
  $('meRegister').onclick = () => prefs.email ? renderJoin('login', 'Пришлём новую ссылку для входа на вашу почту.') : renderJoin('register');
  $('ctaOffice').onclick = () => showOffice();
  $('openInvite').onclick = () => openShare(registered() ? 'team' : 'friends');
  // Зарегистрированному без офиса — предложение создать свой; с офисом — его название под именем
  let myTeamCache = null;
  async function renderOfficeLine() {
    $('officeCta').hidden = true;
    if (!registered() || !board.online) { myTeamCache = null; return; }
    try {
      myTeamCache = (await board.rpc('my_team', { p_id: prefs.playerId }))[0] || null;
      $('officeCta').hidden = !!myTeamCache;
      $('meDept').textContent = (prefs.dept || 'без отдела') + (myTeamCache ? ` · офис «${myTeamCache.name}»` : '');
    } catch {}
  }
  $('meId').onclick = async () => {
    const id = shortId(await myTag);
    navigator.clipboard.writeText(id).then(() => toast(`ID ${id} скопирован — отправьте его тому, кто собирает офис`), () => toast(`Ваш ID: ${id}`));
  };
  $('openSuggest').onclick = needAccount(showSuggest, 'Предлагать свои ситуации можно после регистрации: под карточкой будет ваша подпись.');
  $('meEdit').onclick = () => renderJoin('edit');

  // ---------- пропуск в офис ----------
  $('avatars').innerHTML = AVATARS.map(a => `<label class="ava"><input type="radio" name="ava" value="${a}"><span aria-hidden="true">${a}</span></label>`).join('');
  $('avatars').onchange = () => { $('joinAvatar').textContent = document.querySelector('input[name=ava]:checked').value; };
  // Режимы: welcome — выбор; register — имя и почта; login — только почта; guest — без почты; edit — правка профиля
  let joinMode = 'welcome', mailTo = '';
  function joinPanel(id) { for (const p of ['welcome', 'joinForm', 'checkMail']) $(p).hidden = p !== id; setPhase('morning'); show('join'); }
  function renderWelcome() {
    joinMode = 'welcome';
    $('wRegister').hidden = $('wLogin').hidden = !board.online;
    $('wNote').textContent = board.online ? '' : 'Регистрация появится, когда к игре подключат общий офис (Supabase). Пока можно играть как гость.';
    joinPanel('welcome');
  }
  function renderJoin(mode, lead) {
    joinMode = mode;
    const reg = mode === 'register', login = mode === 'login', edit = mode === 'edit';
    $('joinTitle').textContent = { register: 'Регистрация', login: 'Вход', guest: 'Пропуск гостя', edit: 'Пропуск в офис', profile: 'Ваш профиль' }[mode];
    $('joinSub').textContent = { register: 'Имя, отдел и почта', login: 'Пришлём ссылку на почту', guest: 'Без регистрации', edit: prefs.email || 'Гость', profile: prefs.email || '' }[mode];
    $('joinLead').hidden = !lead; $('joinLead').textContent = lead || '';
    $('joinName').value = prefs.name; $('joinDept').value = prefs.dept;
    $('joinEmail').value = prefs.email || mailTo || prefs.pendingEmail || ''; $('joinEmail').disabled = !!prefs.email && !login;
    for (const id of ['joinNameField', 'joinDeptField', 'joinAvaField', 'joinAvatar']) $(id).hidden = login;
    $('joinEmailField').hidden = !(reg || login || (edit && prefs.email));
    $('joinEmailNote').textContent = prefs.email ? 'Вы вошли по почте — прогресс общий на всех устройствах.' : 'Пришлём ссылку для входа — пароль не нужен.';
    (document.querySelector(`input[name=ava][value="${prefs.avatar}"]`) || document.querySelector('input[name=ava]')).checked = true;
    $('joinAvatar').textContent = document.querySelector('input[name=ava]:checked').value;
    $('joinErr').textContent = ''; $('joinName').removeAttribute('aria-invalid'); $('joinEmail').removeAttribute('aria-invalid');
    $('joinGo').textContent = { register: 'Зарегистрироваться', login: 'Получить ссылку для входа', guest: 'Играть как гость', edit: 'Сохранить', profile: 'Сохранить и играть' }[mode];
    $('joinGo').disabled = false;
    $('joinRegister').hidden = !(edit && !prefs.email && board.online);
    $('joinLogout').hidden = !(edit && prefs.email); $('joinLogout').textContent = 'Выйти из аккаунта'; delete $('joinLogout').dataset.armed;
    $('joinCancel').hidden = mode === 'profile';
    $('joinNote').hidden = login;
    joinPanel('joinForm');
    (login ? $('joinEmail') : $('joinName')).focus({ preventScroll: true });
  }
  function renderCheckMail(email) {
    mailTo = email;
    $('mailText').innerHTML = `Мы отправили ссылку для входа на <b>${esc(email)}</b>. Откройте письмо на этом устройстве и нажмите ссылку — игра откроется уже под вашим аккаунтом.`;
    $('mailErr').textContent = ''; $('mailGuest').hidden = !prefs.name;
    joinPanel('checkMail');
  }
  $('wRegister').onclick = () => renderJoin('register');
  $('wGuest').onclick = () => renderJoin('guest');
  $('wLogin').onclick = () => renderJoin('login');
  $('joinRegister').onclick = () => renderJoin('register');
  $('mailChange').onclick = () => renderJoin(prefs.name ? 'register' : 'login');
  $('mailGuest').onclick = () => { renderMenu(); joinFromLink(); };
  $('mailResend').onclick = async () => {
    $('mailResend').disabled = true;
    try { await board.sendLink(mailTo); toast('Письмо отправлено ещё раз'); $('mailErr').textContent = ''; }
    catch (err) { $('mailErr').textContent = `Не удалось отправить: ${err.message}`; }
    setTimeout(() => { $('mailResend').disabled = false; }, 15000);
  };
  $('joinName').oninput = () => { $('joinErr').textContent = ''; $('joinName').removeAttribute('aria-invalid'); };
  $('joinCancel').onclick = () => prefs.name ? renderMenu() : renderWelcome();
  $('joinEmail').oninput = () => { $('joinErr').textContent = ''; $('joinEmail').removeAttribute('aria-invalid'); };
  const badMail = email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $('joinForm').onsubmit = async e => {
    e.preventDefault();
    const email = $('joinEmail').value.trim().toLowerCase();
    if (joinMode === 'login') {
      if (badMail(email)) { $('joinErr').textContent = 'Введите почту, с которой регистрировались.'; $('joinEmail').setAttribute('aria-invalid', 'true'); return; }
      $('joinGo').disabled = true;
      try { await board.sendLink(email); renderCheckMail(email); }
      catch (err) { $('joinErr').textContent = `Не удалось отправить ссылку: ${err.message}`; $('joinGo').disabled = false; }
      return;
    }
    const name = $('joinName').value.trim().replace(/\s+/g, ' ');
    if (name.length < 2) {
      $('joinErr').textContent = 'Введите имя — хотя бы 2 буквы. Его увидят коллеги в рейтинге.';
      $('joinName').setAttribute('aria-invalid', 'true'); $('joinName').focus(); return;
    }
    prefs.name = name; prefs.dept = $('joinDept').value.trim().replace(/\s+/g, ' ');
    prefs.avatar = document.querySelector('input[name=ava]:checked').value;
    if (joinMode === 'register') {
      if (badMail(email)) { $('joinErr').textContent = 'Укажите почту — на неё придёт ссылка для входа.'; $('joinEmail').setAttribute('aria-invalid', 'true'); $('joinEmail').focus(); return; }
      store.set(KEY.prefs, prefs);
      await board.touch('menu').catch(() => {});  // профиль гостя сохраняется и перейдёт в аккаунт после входа
      $('joinGo').disabled = true;
      try { await board.sendLink(email); prefs.pendingEmail = email; store.set(KEY.prefs, prefs); renderCheckMail(email); }
      catch (err) { $('joinErr').textContent = `Не удалось отправить ссылку: ${err.message}`; $('joinGo').disabled = false; }
      return;
    }
    store.set(KEY.prefs, prefs);
    await board.touch('menu').catch(() => {});
    renderMenu();
  };
  // Выход из аккаунта: на этом устройстве начинается новый гость
  $('joinLogout').onclick = () => {
    const b = $('joinLogout');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Выйти? Нажмите ещё раз'; return; }
    board.logout().finally(() => { delete prefs.email; delete prefs.pendingEmail; delete prefs.playerId; delete prefs.session; store.set(KEY.prefs, prefs); location.reload(); });
  };
  $('start').onclick = () => continueCareer();
  $('startDaily').onclick = () => startDaily();
  $('startPack').onclick = () => startPack();
  // «Начать заново» срабатывает со второго нажатия: окна подтверждения в браузере тут нет
  $('newCareer').onclick = () => {
    const b = $('newCareer');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Весь прогресс года сотрётся. Нажмите ещё раз'; return; }
    store.del(KEY.career); store.del(KEY.save); newCareer();
  };

  // ---------- сборка недели ----------
  let S = null, busy = false, splashOn = false, splashFor = -1;
  const slotOf = (day, phase) => DAYS.indexOf(day) * 3 + PHASES.findIndex(p => p.name === phase);

  // Неделя: карточки по расписанию → карточки вида недели (или пакета) → одна карточка профессии → случайные события
  // classic — классическая неделя из cards.js; иначе карточки берутся из большого пула.
  // seen — уже показанные карточки: из них ничего не берётся, так карточки не повторяются
  function buildDeck({ prof, type = 'normal', rng = Math.random, extraRandom = [], profCard = true, packCards = [], classic = true, seen = null }) {
    const unseen = c => !seen || !seen.has(c.id);
    const used = new Set(), deck = [], randomPack = [...RANDOM_CARDS, ...extraRandom].filter(unseen); // свежая копия на каждую неделю
    const rules = WEEK_TYPES[type].rules, fixed = new Map();
    for (const c of [...(WEEK_TYPES[type].cards || []).filter(unseen), ...packCards]) fixed.set(slotOf(c.day, c.phase), c.id);
    for (let i = 0; i < 15; i++) {
      const d = Math.floor(i / 3), ph = PHASES[i % 3];
      if (fixed.has(i)) { const c = byId[fixed.get(i)]; deck.push({ id: c.id, time: c.time || PHASE_TIME[i % 3], fixed: true }); continue; }
      const ok = c => c.phase === ph.name && !used.has(c.id);
      const fresh = classic ? [] : POOL.filter(c => ok(c) && unseen(c));
      const special = CARDS.filter(c => ok(c) && c.day === DAYS[d]);
      const pool = fresh.length ? fresh : special.length ? special : CARDS.filter(c => ok(c) && !c.day);
      const standard = rnd(pool, rng); used.add(standard.id);
      deck.push({ id: standard.id, time: standard.time || PHASE_TIME[i % 3] });
    }
    const profLeft = profCard && prof && PROF_CARDS[prof] ? PROF_CARDS[prof].filter(unseen) : [];
    if (profLeft.length) {
      const free = deck.map((s, i) => s.fixed ? -1 : i).filter(i => i > 0 && i !== 14 && i >= 0);
      const i = rnd(free, rng), c = byId[rnd(profLeft, rng).id];
      deck[i] = { id: c.id, time: PHASE_TIME[i % 3], fixed: true };
    }
    deck.forEach((s, i) => {
      if (s.fixed) return;
      const card = getRandomCard(byId[s.id], randomPack, rules.randomChance ?? 15, rng);
      if (card.id !== s.id) deck[i] = { id: card.id, time: card.time || PHASE_TIME[i % 3] };
    });
    return deck;
  }
  const giveItems = (n, rng = Math.random) => shuffle(Object.keys(ITEMS), rng).slice(0, n);

  function weekTypeFor(week, newJob) {
    if (newJob) return 'newboss';
    if (week % 13 === 0) return 'reports';
    if (week === 25 || week === 51) return 'vacation';
    return 'normal';
  }
  function newWeekState({ mode, res, type, rng = Math.random, extra = {} }) {
    const rules = WEEK_TYPES[type].rules;
    res = { ...res };
    for (const [k, v] of Object.entries(rules.start || {})) res[k] = clamp(res[k] + v);
    if (rules.bossStart) res.boss = rules.bossStart;
    for (const k in res) res[k] = Math.max(5, Math.min(95, res[k]));
    let n = rules.items || (rng() < .5 ? 1 : 2);
    if (mode === 'career' && prefs.bonusItems > 0) { const add = Math.min(prefs.bonusItems, 4 - n); n += add; prefs.bonusItems -= add; store.set(KEY.prefs, prefs); }
    return { mode, name: prefs.name, dept: prefs.dept, prof: extra.prof || prefs.prof, trait: extra.trait || prefs.trait, res, step: 0, type,
      items: giveItems(n, rng), used: [], flags: {}, ...extra };
  }

  // ---------- карьера: 52 недели ----------
  let C = null;
  const saveCareer = () => store.set(KEY.career, C);
  const vacancy = id => VACANCIES.find(v => v.id === id);
  const freshRes = perk => {
    const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
    for (const b of [PROF[C.prof].bonus, perk || {}]) for (const [k, v] of Object.entries(b)) res[k] = clamp(res[k] + v);
    return res;
  };
  function newCareer() {
    prefs.prof = getProf(); prefs.trait = getTrait(); store.set(KEY.prefs, prefs);
    const first = rnd(VACANCIES.filter(v => v.level === 1));
    C = { prof: prefs.prof, trait: prefs.trait, week: 1, stage: 'work', company: first.name, companies: [first.name], res: null,
      worked: 0, firings: 0, passed: 0, failed: 0, newJob: false };
    C.res = freshRes(first.perk);
    saveCareer(); startWeek();
  }
  function continueCareer() {
    C = store.get(KEY.career, null);
    if (!C) return newCareer();
    C.trait = C.trait || prefs.trait;
    const save = store.get(KEY.save, null);
    if (save && (save.mode || 'career') === 'career' && save.deck?.every(x => byId[x.id])) { S = { items: [], used: [], flags: {}, type: 'normal', mode: 'career', ...save }; return enterGame(); }
    if (C.week > YEAR) return yearEnd();
    if (C.stage === 'search') return jobSearch();
    startWeek();
  }
  // Показанные карточки копятся между карьерами; когда в фазе дня почти не остаётся новых, круг начинается заново
  function seenSet() {
    const seen = new Set(store.get(KEY.seen, []));
    for (const ph of PHASES) {
      const left = POOL.filter(c => c.phase === ph.name && !seen.has(c.id)).length;
      if (POOL.length && left < 5) POOL.filter(c => c.phase === ph.name).forEach(c => seen.delete(c.id));
    }
    return seen;
  }
  function startWeek() {
    const type = weekTypeFor(C.week, C.newJob);
    C.newJob = false; saveCareer();
    S = newWeekState({ mode: 'career', res: C.res, type, extra: { prof: C.prof, trait: C.trait } });
    const seen = seenSet(), classic = !seen.has('__classic') || !POOL.length;  // классическая неделя — только в самый первый раз
    S.deck = buildDeck({ prof: C.prof, type, extraRandom: SUGGESTED, classic, seen });
    for (const s of S.deck) seen.add(s.id);
    if (classic) seen.add('__classic');
    store.set(KEY.seen, [...seen]);
    store.set(KEY.save, S);
    enterGame();
  }

  // ---------- неделя дня и брендированная неделя ----------
  function startDaily() {
    const day = today(), rng = seeded('vdp-daily-' + day);
    C = null;
    S = newWeekState({ mode: 'daily', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal', rng, extra: { day } });
    S.deck = buildDeck({ type: 'normal', rng, profCard: false, classic: !POOL.length });
    S.ranked = !store.get(KEY.daily, {})[day];
    enterGame();
  }
  function startPack() {
    if (!PACK) return;
    C = null;
    S = newWeekState({ mode: 'pack', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal' });
    S.deck = buildDeck({ type: 'normal', profCard: false, packCards: PACK_CARDS, classic: !POOL.length });
    enterGame();
  }

  // ---------- игровой экран ----------
  function enterGame() { busy = false; show('game'); splashFor = -1; renderBars(); renderCard(); }

  function renderBars() {
    for (const r of RES) {
      const v = S.res[r.k];
      $('fl-' + r.k).style.setProperty('--v', v);
      $('pc-' + r.k).textContent = v + '%';
      $('st-' + r.k).classList.toggle('danger', v <= 20 || v >= 80);
    }
    $('inv').innerHTML = S.items.map(id => `<span class="item${S.used.includes(id) ? ' used' : ''}" title="${ITEMS[id].text}">${ITEMS[id].name}</span>`).join('');
  }
  const headerLine = () => S.mode === 'career' && C ? `Неделя ${C.week}/${YEAR} · ${C.company}` : S.mode === 'daily' ? `Неделя дня ${dayLabel(S.day)}${S.ranked ? '' : ' · не в зачёт'}` : PACK?.company || '';

  function renderCard() {
    const slot = S.deck[S.step], c = byId[slot.id], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    const card = $('card');
    const tag = slot.origin ? `<span class="rnd-tag chain">← ${esc(slot.origin)}</span>` : c.author ? `<span class="rnd-tag">ОТ КОЛЛЕГИ · ${esc(c.author)}</span>`
      : c.random ? '<span class="rnd-tag">! СЛУЧАЙНОЕ СОБЫТИЕ</span>' : c.profCard ? `<span class="rnd-tag prof">${PROF[S.prof].name.toUpperCase()}</span>` : '';
    card.innerHTML = `<div class="card-head"><span class="who">${esc(c.who)}</span>${tag}</div><div class="text">${esc(c.text)}</div>`;
    // вход новой карточки: из translateY(28px) scale(.95) и прозрачности
    card.style.transition = 'none'; card.style.transform = 'translateY(28px) scale(.95)'; card.style.opacity = '0';
    void card.offsetWidth;
    card.style.transition = `transform .38s ${EASE}, opacity .38s, border-color .2s, box-shadow .2s`; card.style.transform = ''; card.style.opacity = '';
    setPhase(PHASE_KEY[S.step % 3]);
    $('btnL').innerHTML = `<span class="ar">←</span><span>${esc(c.answers.left.label)}</span>`;
    $('btnR').innerHTML = `<span>${esc(c.answers.right.label)}</span><span class="ar">→</span>`;
    $('clock').textContent = slot.time;
    $('gCareer').textContent = headerLine();
    $('gType').textContent = S.type !== 'normal' ? WEEK_TYPES[S.type].title : '';
    $('gDay').textContent = DAYS[d]; $('gPhase').textContent = ph.name.toLowerCase(); $('gNum').textContent = String(S.step + 1).padStart(2, '0');
    $('dots').innerHTML = S.deck.map((s, i) => `<i class="${i < S.step ? 'done' : i === S.step ? 'now' : ''}${s.origin && i > S.step ? ' chain' : ''}"></i>`).join('');
    clearPreview();
    if (S.step % 3 === 0 && splashFor !== S.step) { splashFor = S.step; showSplash(d); }
    board.touch('playing', S.step).catch(() => {});
  }

  // Заставка перед началом каждого дня; в понедельник — вид недели и выданные предметы
  function showSplash(d) {
    const el = $('splash'), T = WEEK_TYPES[S.type];
    const top = S.mode === 'career' && C ? `Неделя ${C.week} из ${YEAR} · ` : S.mode === 'daily' ? `Неделя дня ${dayLabel(S.day)} · ` : '';
    const extra = d === 0 ? `<div class="splash-week">${S.mode === 'pack' ? esc(PACK.intro) : `<b>${T.title}</b>${S.type !== 'normal' ? `<span>${T.rule}</span>` : ''}`}
      <span class="splash-items">В сумке: ${S.items.map(i => ITEMS[i].name).join(', ')} — ${S.items.length > 1 ? 'каждый отменит' : 'отменит'} один сильный удар по своей шкале.</span></div>` : '';
    el.innerHTML = `<div class="splash-in"><small>${top}День ${d + 1} из 5</small><h2>${DAYS[d]}</h2><p>${DAY_QUIP[d]}</p>${extra}<span class="tap">нажмите, чтобы начать</span></div>`;
    el.hidden = false; splashOn = true;
    const close = () => { if (!splashOn) return; splashOn = false; el.hidden = true; clearTimeout(t); };
    const t = setTimeout(close, d === 0 ? 4200 : 2200);
    el.onclick = close;
  }

  const current = () => byId[S.deck[S.step].id];
  // Эффекты ответа с правилами недели; предметы гасят удары −10 и сильнее
  function effectsOf(side) {
    const rules = WEEK_TYPES[S.type].rules, raw = current().answers[side].effects, eff = {}, blocked = [];
    const free = S.items.filter(i => !S.used.includes(i));
    for (const r of RES) {
      let v = raw[r.k] || 0;
      if (r.k === 'boss' && rules.bossMul) v = Math.round(v * rules.bossMul / 5) * 5;
      if (r.k === 'psyche' && v < 0 && rules.psycheNegMul) v = Math.round(v * rules.psycheNegMul / 5) * 5;
      const item = v <= -10 && free.find(i => ITEMS[i].stat === r.k && !blocked.some(b => b.item === i));
      if (item) blocked.push({ item, stat: r.k, v });
      eff[r.k] = item ? 0 : v;
    }
    return { eff, blocked };
  }

  function preview(side) {
    const { eff, blocked } = effectsOf(side), hide = WEEK_TYPES[S.type].rules.hideBoss;
    for (const r of RES) {
      const v = eff[r.k], m = $('mk-' + r.k);
      if (blocked.some(b => b.stat === r.k)) m.innerHTML = '<span class="s" title="Удар погасит предмет">◆</span>';
      else if (hide && r.k === 'boss' && (current().answers[side].effects.boss || 0)) m.innerHTML = '<span class="q">?</span>';
      else m.innerHTML = v > 0 ? `<span class="u">${v >= 20 ? '▲▲' : '▲'}</span>` : v < 0 ? `<span class="d">${v <= -20 ? '▼▼' : '▼'}</span>` : '';
    }
    $('card').dataset.hot = side;
    $('btnL').classList.toggle('hot', side === 'left'); $('btnR').classList.toggle('hot', side === 'right');
  }
  function clearPreview() {
    for (const r of RES) $('mk-' + r.k).innerHTML = '';
    delete $('card').dataset.hot; $('btnL').classList.remove('hot'); $('btnR').classList.remove('hot');
  }

  // Реплика персонажа на ваш ответ — своим цветом
  function reactionGroup(who) {
    if (/босс|директор/i.test(who)) return ['boss', 'boss'];
    if (/hr|кадр|офис-менеджер/i.test(who)) return ['hr', 'boss'];
    if (/клиент|налогов/i.test(who)) return ['client', 'boss'];
    if (/коллег|чат|созвон|курьер|джун|отдел|бухгалтер|именин/i.test(who)) return ['colleagues', 'colleagues'];
    return ['self', 'psyche'];
  }
  function react(card, eff) {
    const [g, stat] = reactionGroup(card.who), R = REACTIONS[g];
    const mood = (eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0)) >= 0 ? 'pos' : 'neg';
    const el = $('react');
    el.style.setProperty('--rc', R.color);
    el.innerHTML = `<b>${g === 'self' ? R.name : esc(card.who)}</b> ${esc(rnd(R[mood]))}`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  }

  function choose(side) {
    if (busy || splashOn || !S) return;
    busy = true; sfx.stapler();
    const card = $('card'), dir = side === 'left' ? -1 : 1, c = current();
    card.style.transition = `transform .38s ${EASE}, opacity .38s`;
    card.style.transform = `translateX(${dir * 1100}px) rotate(${dir * 26}deg)`;
    card.style.opacity = '0';
    setTimeout(() => {
      const { eff, blocked } = effectsOf(side);
      for (const b of blocked) { S.used.push(b.item); toast(`${ITEMS[b.item].name}: удар по шкале «${resName(b.stat)}» отменён`); sfx.item(); }
      for (const [k, v] of Object.entries(eff)) S.res[k] = clamp(S.res[k] + v);
      if (Object.values(eff).some(v => v <= -15)) sfx.sigh();
      if (c.id === 'rnd_cake' && side === 'right') S.flags.cake = true;
      // цепочка: решение вернётся в другой день недели
      const ch = CHAINS.find(x => x.from === c.id && x.side === side), at = ch && slotOf(ch.at.day, ch.at.phase);
      if (ch && at > S.step) S.deck[at] = { id: ch.card.id, time: PHASE_TIME[at % 3], fixed: true, origin: ch.origin };
      clearPreview(); renderBars(); react(c, eff);
      const deadLow = RES.find(r => S.res[r.k] <= 0), deadHigh = RES.find(r => S.res[r.k] >= 100), dead = deadLow || deadHigh;
      const best = store.get(KEY.best, { step: 0, wins: 0 });
      if (dead && !S.chanceUsed && QUIZ.length) { setTimeout(() => secondChance(dead.k, !deadLow), 650); return; }  // второй шанс — раз в неделю
      if (dead) { best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save); setTimeout(() => lose(dead.k, !deadLow), 650); return; } // busy остаётся до следующей недели
      advance();
    }, 380);
  }
  // Переход к следующей карточке (или к финалу недели)
  function advance() {
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    S.step++;
    best.step = Math.max(best.step, S.step);
    if (S.step >= 15) { best.wins++; store.set(KEY.best, best); store.del(KEY.save); setTimeout(win, 550); return; }
    store.set(KEY.best, best); if (S.mode === 'career') store.set(KEY.save, S);
    renderCard(); busy = false;
  }

  // ---------- второй шанс: вопрос на эрудицию ----------
  // Шкала дошла до 0 или 100 → вопрос с 4 вариантами и 20 секундами. Верно — шкала отступает от края на 20%, неделя продолжается
  const QUIZ_TIME = 20;
  function pickQuestion() {
    let seen = new Set(store.get(KEY.qseen, []));
    let left = QUIZ.filter(q => !seen.has(q.id));
    if (!left.length) { seen = new Set(); left = QUIZ; }  // все вопросы заданы — круг начинается заново
    const q = rnd(left); seen.add(q.id); store.set(KEY.qseen, [...seen]);
    return q;
  }
  function secondChance(k, high) {
    S.chanceUsed = true; if (S.mode === 'career') store.set(KEY.save, S);
    const q = pickQuestion(), el = $('quiz');
    el.innerHTML = `<div class="quiz-box">
      <span class="kicker">Второй шанс · ${resName(k)} ${high ? '100' : '0'}%</span>
      <h2 id="quizTitle">Вопрос на эрудицию</h2>
      <p class="q-lead">Ответьте верно — и шкала «${resName(k)}» отступит от края на 20%. Ошибка — увольнение.</p>
      <span class="q-topic">${esc(q.topic)}</span>
      <div class="q-text">${esc(q.q)}</div>
      <div class="q-timer" aria-hidden="true"><i id="qBar"></i></div>
      <div class="q-opts">${q.options.map((o, i) => `<button class="q-opt" data-i="${i}"><span class="n">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>
      <div id="qAfter" hidden><p class="q-result" id="qRes"></p><p class="q-fact">${esc(q.fact)}</p><div class="stack" style="margin-top:12px"><button class="btn-main" id="qNext"></button></div></div>
    </div>`;
    el.hidden = false; sfx.sigh();
    const bar = $('qBar'); bar.style.setProperty('--qt', QUIZ_TIME + 's'); void bar.offsetWidth; bar.classList.add('run');
    const btns = [...el.querySelectorAll('.q-opt')];
    let done = false;
    const finish = picked => {
      if (done) return; done = true; clearTimeout(timer); document.removeEventListener('keydown', keys);
      const ok = picked === q.answer;
      btns.forEach((b, i) => { b.disabled = true; if (i === q.answer) b.classList.add('right'); else if (i === picked) b.classList.add('wrong'); });
      bar.style.animationPlayState = 'paused';
      $('qRes').className = 'q-result ' + (ok ? 'ok' : 'bad');
      $('qRes').textContent = ok ? `Верно! «${resName(k)}» отступает от края на 20%.` : picked === -1 ? `Время вышло. Правильный ответ: «${q.options[q.answer]}».` : `Неверно. Правильный ответ: «${q.options[q.answer]}».`;
      $('qNext').textContent = ok ? 'Продолжить неделю' : 'Принять судьбу';
      $('qAfter').hidden = false; $('qNext').focus({ preventScroll: true });
      ok ? sfx.item() : sfx.stamp();
      $('qNext').onclick = () => {
        el.hidden = true;
        if (ok) {
          S.res[k] = high ? 80 : 20; S.flags.saved = true;
          const got = unlock(['quiz_saved']); if (got.length) toast(`Новая концовка: «${got[0].title}»`);
          renderBars(); advance();
        } else {
          unlock(['quiz_fail']);
          const best = store.get(KEY.best, { step: 0, wins: 0 });
          best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save);
          lose(k, high);
        }
      };
    };
    const timer = setTimeout(() => finish(-1), QUIZ_TIME * 1000);
    const keys = e => { const n = +e.key; if (n >= 1 && n <= 4) { e.preventDefault(); finish(n - 1); } };
    document.addEventListener('keydown', keys);
    btns.forEach(b => b.onclick = () => finish(+b.dataset.i));
    btns[0].focus({ preventScroll: true });
  }

  // свайп: превью после 40 px, выбор после 140 px (на узком экране — после 30 % ширины)
  (() => {
    const card = $('card'); let x0 = 0, dx = 0, t0 = 0, drag = false, pid = null;
    card.addEventListener('pointerdown', e => {
      if (busy || splashOn) return; drag = true; pid = e.pointerId; x0 = e.clientX; dx = 0; t0 = performance.now();
      card.setPointerCapture(pid); card.style.transition = 'border-color .2s, box-shadow .2s';
    });
    card.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== pid) return;
      dx = e.clientX - x0;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      if (Math.abs(dx) > 40) preview(dx < 0 ? 'left' : 'right'); else clearPreview();
    });
    const end = e => {
      if (!drag || e.pointerId !== pid) return; drag = false;
      const limit = Math.min(140, innerWidth * .3), v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) > limit || (Math.abs(dx) > 50 && v > .7)) { choose(dx < 0 ? 'left' : 'right'); return; }
      card.style.transition = `transform .3s ${EASE}, border-color .2s, box-shadow .2s`; card.style.transform = ''; clearPreview();
    };
    card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
  })();

  for (const [id, side] of [['btnL', 'left'], ['btnR', 'right']]) {
    const b = $(id);
    b.addEventListener('mouseenter', () => !busy && !splashOn && preview(side));
    b.addEventListener('focus', () => !busy && !splashOn && preview(side));
    b.addEventListener('mouseleave', clearPreview);
    b.addEventListener('blur', clearPreview);
    b.addEventListener('click', () => choose(side));
  }
  document.addEventListener('keydown', e => {
    if (views.game.hidden || !$('modal').hidden) return;
    if (splashOn && (e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow'))) { e.preventDefault(); $('splash').click(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); choose('left'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); choose('right'); }
  });

  // ---------- финалы недели ----------
  function finalGrid(zeroKey) {
    return `<div class="final">${RES.map(r => `<div class="${r.k === zeroKey ? 'zero' : ''}"><b>${S.res[r.k]}%</b><span>${r.name}</span></div>`).join('')}</div>`;
  }
  const viralHtml = () => `<div class="viral"><b>Позовите коллег — проверим, кто дольше продержится до пятницы</b>
    <div class="row2"><button class="btn-main" data-share="team">Позвать коллег</button><button class="btn-ghost" data-share="friends">Рассказать друзьям</button></div></div>`;
  function bindCommon() { bindShare(views.end); $('toMenu').onclick = renderMenu; if ($('toBoard')) $('toBoard').onclick = () => openBoard('end', S?.mode === 'daily' ? 'daily' : 'rating'); }
  const traitText = (kind, trait) => TRAITS[trait || 'workaholic'][kind];
  function rank(total) { return total >= 280 ? 'Легенда опенспейса' : total >= 220 ? 'Сеньор по выживанию' : total >= 160 ? 'Крепкий мидл' : 'Чудом уцелевший стажёр'; }

  function weekEndings(won, k, high) {
    const ids = [], d = Math.floor(S.step / 3);
    if (S.used.length >= 2) ids.push('items2');
    if (won) {
      const v = Object.values(S.res);
      if (v.every(x => x >= 40 && x <= 60)) ids.push('zen_week');
      if (v.some(x => x < 10 || x > 90)) ids.push('edge');
    } else {
      ids.push(high ? { boss: d === 4 ? 'boss_fri' : null, colleagues: 'party', psyche: 'zen', energy: 'battery' }[k]
        : { psyche: 'cooler', energy: 'zoom', boss: 'two_words', colleagues: 'wifi' }[k]);
      if (d === 0) ids.push('monday');
      if (S.step === 14) ids.push('almost');
      if (S.flags.cake) ids.push('cake');
    }
    return unlock(ids);
  }

  function lose(k, high) {
    sfx.lose();
    const D = (high ? DEATH_HIGH : DEATH)[k], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    const got = weekEndings(false, k, high), career = S.mode === 'career' && C;
    let next = '';
    if (career) {
      var company = C.company;
      C.firings++; C.week++; C.stage = 'search'; C.res = null; saveCareer();
      next = C.week > YEAR ? 'Итоги года' : 'Искать работу';
    }
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">${career ? `Вас уволили · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()} · ${esc(company)}` : `Неделя закончилась досрочно · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()}`}</span>
      <h1 class="lose">${high ? 'ПЕРЕГРЕВ' : 'НЕДЕЛЯ ЗАВАЛЕНА'}</h1>
      <p class="cause">${D.title} · ${esc(S.name)}, ${PROF[S.prof].name.toLowerCase()}</p>
      <p>${D.text}</p>
      <p class="trait-line">${TRAITS[S.trait || 'workaholic'].name}: ${traitText('lose', S.trait)}</p>
      ${finalGrid(k)}
      ${endingsHtml(got)}
      <div class="place" id="place" aria-live="polite">Записываю результат в рейтинг…</div>
      ${viralHtml()}
      <div class="stack">${career ? `<button class="btn-main" id="next">${next}</button>` : `<button class="btn-main" id="next">${S.mode === 'daily' ? 'Сыграть неделю дня ещё раз' : 'Сыграть ещё раз'}</button>`}
        <button class="btn-ghost" id="share">Мем-карточка для чата</button>
        <button class="btn-ghost" id="toBoard">${S.mode === 'daily' ? 'Рейтинг дня' : 'Рейтинг офиса'}</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end'); bindCommon();
    $('share').onclick = () => share(false, k);
    $('next').onclick = () => career ? (C.week > YEAR ? yearEnd() : jobSearch()) : S.mode === 'daily' ? startDaily() : startPack();
    record(false, k, high);
    $('next').focus({ preventScroll: true });
  }

  function win() {
    sfx.win();
    const total = RES.reduce((a, r) => a + S.res[r.k], 0), got = weekEndings(true), career = S.mode === 'career' && C;
    let week, last = false;
    if (career) {
      week = C.week;
      // выходные: каждая шкала сдвигается к 50 наполовину
      C.worked++; C.week++; C.res = Object.fromEntries(RES.map(r => [r.k, Math.round((S.res[r.k] + 50) / 2)])); saveCareer();
      last = C.week > YEAR;
    }
    if (last || !career) confetti();
    const kicker = career ? `Неделя ${week} из ${YEAR} · ${esc(C.company)} · пятница, 18:00` : S.mode === 'daily' ? `Неделя дня ${dayLabel(S.day)} · пятница, 18:00` : `${esc(PACK.title)} · пятница, 18:00`;
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">${kicker}</span>
      <h1>${last ? 'Год позади!' : 'Неделя закрыта!'}</h1>
      <p>${traitText('win', S.trait)}</p>
      ${career && !last ? '<p class="trait-line">Выходные сгладят всё наполовину: в понедельник каждая шкала сдвинется к 50%.</p>' : ''}
      <span class="rank">${rank(total)}</span>
      ${finalGrid()}
      <div class="total"><span>Счёт недели</span><b>${total} / 400</b></div>
      ${endingsHtml(got)}
      <div class="place" id="place" aria-live="polite">Записываю результат в рейтинг…</div>
      ${viralHtml()}
      <div class="stack"><button class="btn-main" id="next">${career ? (last ? 'Итоги года' : `Неделя ${C.week} →`) : 'В главное меню'}</button>
        <button class="btn-ghost" id="share">Мем-карточка для чата</button>
        <button class="btn-ghost" id="toBoard">${S.mode === 'daily' ? 'Рейтинг дня' : 'Рейтинг офиса'}</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end'); bindCommon();
    $('share').onclick = () => share(true);
    $('next').onclick = () => career ? (last ? yearEnd() : startWeek()) : renderMenu();
    record(true, null, false);
    $('next').focus({ preventScroll: true });
  }

  // Поиск работы: три вакансии, кроме места, откуда только что уволили
  function jobSearch() {
    if (C.week > YEAR) return yearEnd();
    if (!C.offers?.length) { C.offers = shuffle(VACANCIES.filter(v => v.name !== C.company)).slice(0, 3).map(v => v.id); saveCareer(); }
    const perkText = p => Object.entries(p).map(([k, v]) => `${resName(k)} ${v > 0 ? '+' : '−'}${Math.abs(v)}`).join(' · ');
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Неделя ${C.week} из ${YEAR} · поиск работы</span>
      <h1>Вакансии</h1>
      <p>Выберите, куда откликнуться. Собеседование займёт неделю: 4 вопроса от HR. Первая неделя на новом месте — с новым боссом.</p>
      <div class="vacancies">${C.offers.map(id => { const v = vacancy(id);
        return `<button class="vac" data-id="${v.id}"><b>${esc(v.name)}</b><span class="lvl">${'●'.repeat(v.level)}${'○'.repeat(3 - v.level)}</span>
          <small>${esc(v.vibe)}</small><span class="perk">старт: ${perkText(v.perk)}</span></button>`; }).join('')}</div>
      <div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end');
    $('toMenu').onclick = renderMenu;
    views.end.querySelectorAll('.vac').forEach(b => b.onclick = () => interview(vacancy(b.dataset.id)));
    board.touch('menu').catch(() => {});
  }

  // Собеседование: 3 случайных вопроса + финальный, проходной балл зависит от сложности
  function interview(v) {
    const qs = shuffle(INTERVIEW).slice(0, 3).concat(INTERVIEW_LAST);
    const need = { 1: 4, 2: 5, 3: 6 }[v.level];
    let i = 0, score = 0;
    const step = () => {
      const q = qs[i];
      views.end.innerHTML = `<div class="end-sheet glass">
        <span class="kicker">Неделя ${C.week} из ${YEAR} · собеседование · ${esc(v.name)}</span>
        <div class="iv-dots">${qs.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('')}</div>
        <div class="iv-q"><span class="who">HR · вопрос ${i + 1} из ${qs.length}</span><div class="text">${esc(q.q)}</div><div class="iv-reply" id="ivReply" aria-live="polite"></div></div>
        <div class="iv-answers">${shuffle(q.a).map(a => `<button class="ans" data-s="${a.score}" data-r="${esc(a.reply)}">${esc(a.label)}</button>`).join('')}</div>
      </div>`;
      show('end');
      const btns = [...views.end.querySelectorAll('.iv-answers .ans')];
      btns.forEach(b => b.onclick = () => {
        btns.forEach(x => x.disabled = true); b.classList.add('picked');
        score += +b.dataset.s; $('ivReply').textContent = `HR: ${b.dataset.r}`; sfx.stapler();
        setTimeout(() => { i++; i < qs.length ? step() : verdict(); }, 1500);
      });
      btns[0].focus({ preventScroll: true });
    };
    const verdict = () => {
      const ok = score >= need, got = unlock([score === qs.length * 2 ? 'perfect_iv' : null]);
      C.week++; C.offers = [];
      if (ok) { C.passed++; C.stage = 'work'; C.newJob = true; C.company = v.name; if (!C.companies.includes(v.name)) C.companies.push(v.name); C.res = freshRes(v.perk); sfx.win(); }
      else { C.failed++; sfx.lose(); }
      saveCareer();
      const over = C.week > YEAR;
      views.end.innerHTML = `<div class="end-sheet glass">
        <span class="kicker">Собеседование · ${esc(v.name)} · ${score} из ${qs.length * 2} баллов, нужно ${need}</span>
        <h1 class="${ok ? '' : 'lose'}">${ok ? 'Оффер!' : 'Мы вам перезвоним'}</h1>
        <p>${ok ? `${esc(v.name)} ждёт вас в понедельник. Новое место — свежий старт: шкалы снова около 50%.` : '…но не перезвонили. Поиск продолжается, впереди новые вакансии.'}</p>
        ${endingsHtml(got)}
        <div class="stack"><button class="btn-main" id="next">${over ? 'Итоги года' : ok ? `Выйти на работу · неделя ${C.week}` : `Искать дальше · неделя ${C.week}`}</button>
          <button class="btn-ghost" id="toMenu">В главное меню</button></div>
      </div>`;
      show('end');
      $('toMenu').onclick = renderMenu;
      $('next').onclick = () => over ? yearEnd() : ok ? startWeek() : jobSearch();
      $('next').focus({ preventScroll: true });
      if (ok) confetti();
    };
    step();
  }

  function yearRank(w) { return w >= 52 ? 'Железный сотрудник года' : w >= 40 ? 'Опора офиса' : w >= 26 ? 'Опытный выживальщик' : w >= 10 ? 'Вечный соискатель' : 'Свободный художник'; }
  function yearEnd() {
    store.del(KEY.save);
    const all = C.passed + C.failed;
    const got = unlock([C.companies.length >= 5 ? 'nomad' : null, C.worked >= YEAR && !C.firings ? 'iron' : null]);
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Год позади · ${YEAR} недель · ${esc(prefs.name)}, ${PROF[C.prof].name.toLowerCase()}</span>
      <h1>Итоги года</h1>
      <span class="rank">${yearRank(C.worked)}</span>
      <p>${traitText('year', C.trait)}</p>
      <div class="career-card" style="width:100%">
        <div class="stat-box"><b>${C.worked}</b><span>недель отработано</span></div>
        <div class="stat-box"><b>${C.firings}</b><span>увольнений</span></div>
        <div class="stat-box"><b>${C.passed}/${all}</b><span>собеседований пройдено</span></div>
      </div>
      <p>Где вы успели поработать:</p>
      <ul class="companies">${C.companies.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      ${endingsHtml(got)}
      <div class="stack"><button class="btn-main" id="again">Новый год карьеры</button>
        <button class="btn-ghost" id="toBoard">Рейтинг офиса</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end'); bindCommon();
    $('again').onclick = () => { store.del(KEY.career); newCareer(); };
    if (C.worked >= 40) confetti();
  }

  // ---------- коллекция концовок ----------
  function showCollection() {
    const got = endingsGot();
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Открыто ${Object.keys(got).length} из ${ENDINGS.length}</span>
      <h1>Коллекция концовок</h1>
      <div class="collection">${ENDINGS.map(e => got[e.id]
        ? `<div class="ach on"><b>${esc(e.title)}</b><small>${esc(e.hint)}</small></div>`
        : `<div class="ach"><b>???</b><small>${esc(e.hint)}</small></div>`).join('')}</div>
      <div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    setPhase('evening'); show('end'); $('toMenu').onclick = renderMenu;
  }

  // ---------- «Предложи ситуацию» ----------
  function showSuggest() {
    const sel = (side, k) => `<label class="eff"><span>${resName(k)}</span><select id="ef-${side}-${k}">
      <option value="-20">▼▼</option><option value="-10">▼</option><option value="0" selected>—</option><option value="10">▲</option><option value="20">▲▲</option></select></label>`;
    views.end.innerHTML = `<form class="end-sheet glass suggest" id="sgForm" novalidate>
      <span class="kicker">Карточка от коллеги · после модерации появится в игре с подписью «${esc(prefs.name)}»</span>
      <h1>Предложить ситуацию</h1>
      <div class="field"><label for="sgWho">Кто говорит</label><input id="sgWho" type="text" maxlength="24" value="Коллега"></div>
      <div class="field"><label for="sgText">Ситуация *</label><textarea id="sgText" maxlength="240" rows="3" placeholder="Например: «Коллега третий раз за день просит „быстро глянуть“ его отчёт»"></textarea></div>
      <div class="sg-side"><div class="field"><label for="sgLeft">Ответ влево *</label><input id="sgLeft" type="text" maxlength="60" placeholder="Отказать"></div>
        <div class="effs">${RES.map(r => sel('l', r.k)).join('')}</div></div>
      <div class="sg-side"><div class="field"><label for="sgRight">Ответ вправо *</label><input id="sgRight" type="text" maxlength="60" placeholder="Согласиться"></div>
        <div class="effs">${RES.map(r => sel('r', r.k)).join('')}</div></div>
      <p class="join-err" id="sgErr" role="alert"></p>
      <div class="stack"><button class="btn-main" type="submit" id="sgGo">Отправить на модерацию</button><button class="btn-ghost" type="button" id="toMenu">В главное меню</button></div>
    </form>`;
    setPhase('evening'); show('end'); $('toMenu').onclick = renderMenu;
    $('sgForm').onsubmit = async e => {
      e.preventDefault();
      const text = $('sgText').value.trim(), l = $('sgLeft').value.trim(), r = $('sgRight').value.trim();
      if (text.length < 10 || !l || !r) { $('sgErr').textContent = 'Опишите ситуацию (хотя бы 10 символов) и оба ответа.'; return; }
      const effs = side => Object.fromEntries(RES.map(x => [x.k, +$(`ef-${side}-${x.k}`).value]));
      $('sgGo').disabled = true; $('sgGo').textContent = 'Отправляю…';
      try {
        await board.suggest({ author: prefs.name, who: $('sgWho').value.trim() || 'Коллега', text, left_label: l, right_label: r, left_effects: effs('l'), right_effects: effs('r') });
        views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">Отправлено</span><h1>Спасибо!</h1>
          <p>Карточка ушла на модерацию. Когда её одобрят, она начнёт выпадать как случайное событие с подписью «${esc(prefs.name)}».</p>
          <div class="stack"><button class="btn-main" id="again">Предложить ещё</button><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
        $('again').onclick = showSuggest; $('toMenu').onclick = renderMenu;
      } catch (err) { $('sgErr').textContent = `Не получилось отправить: ${err.message}`; $('sgGo').disabled = false; $('sgGo').textContent = 'Отправить на модерацию'; }
    };
  }

  // ---------- запись результата и место в рейтинге ----------
  async function record(won, death, high) {
    const total = RES.reduce((a, r) => a + S.res[r.k], 0);
    prefs.gamesPlayed = (prefs.gamesPlayed || 0) + 1; store.set(KEY.prefs, prefs);
    if (S.mode === 'daily') {
      const all = store.get(KEY.daily, {});
      if (!all[S.day]) { all[S.day] = { won, total }; store.set(KEY.daily, all); }
    }
    const el = () => $('place');
    if (S.mode === 'pack' || (S.mode === 'daily' && !S.ranked)) { if (el()) el().textContent = S.mode === 'pack' ? 'Брендированная неделя в общий рейтинг не идёт.' : 'Повторная попытка: в рейтинг дня идёт только первая.'; return; }
    const entry = { player_id: prefs.playerId, name: S.name.slice(0, 24), dept: (S.dept || '').slice(0, 24), prof: S.prof, won,
      step: won ? 15 : S.step, total, psyche: S.res.psyche, energy: S.res.energy, boss: S.res.boss, colleagues: S.res.colleagues, death,
      mode: S.mode, day: S.mode === 'daily' ? S.day : null, overheat: !!high };
    try {
      await board.submit(entry);
      board.touch('finished', entry.step).catch(() => {});
      const list = S.mode === 'daily' ? await board.daily(S.day) : await board.top(), tag = await myTag;
      const pos = list.findIndex(e => e.tag === tag) + 1;
      if (!el()) return;
      el().innerHTML = pos ? `<b>#${pos}</b><span>${S.mode === 'daily' ? `место в рейтинге дня из ${list.length}` : `ваше место в рейтинге${board.online ? ' офиса' : ' на этом устройстве'} (лучшая неделя)`}</span>` : '<span>Результат записан в рейтинг</span>';
    } catch (err) {
      if (el()) el().textContent = `Не удалось записать результат: ${err.message}.`;
    }
  }

  // ---------- рейтинг, неделя дня, отделы, участники ----------
  const resultText = e => e.won ? { main: `${e.total}/400`, sub: 'неделя закрыта' } :
    { main: `${DAYS[Math.floor(e.step / 3)].slice(0, 2)}, ${PHASES[e.step % 3].name.toLowerCase()}`, sub: `${e.death ? resName(e.death) : ''} ${e.overheat ? '100%' : '0%'}` };
  const ago = iso => {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
    return m < 1 ? 'только что' : m < 60 ? `${m} мин назад` : m < 1440 ? `${Math.floor(m / 60)} ч назад` : `${Math.floor(m / 1440)} дн. назад`;
  };
  const stepName = st => `${DAYS[Math.min(4, Math.floor(st / 3))].slice(0, 2)}, ${PHASES[st % 3].name.toLowerCase()}`;
  function personStatus(p) {
    const fresh = Date.now() - new Date(p.updated_at) < 10 * 60000;
    if (fresh && p.status === 'playing') return `<span class="st play"><i></i>играет · ${stepName(p.step)}</span>`;
    if (fresh) return '<span class="st on"><i></i>в сети</span>';
    return `<span class="st"><i></i>${ago(p.updated_at)}</span>`;
  }
  const cupTime = () => { const n = new Date(), wd = (n.getDay() + 6) % 7; return wd > 4 || (wd === 4 && n.getHours() >= 18); };

  let boardFrom = 'menu', boardMode = 'rating', boardTimer = null;
  const MODES = { rating: 'modeRating', daily: 'modeDaily', depts: 'modeDepts', people: 'modePeople' };
  function openBoard(from, mode) {
    boardFrom = from; boardMode = mode; show('board'); renderBoard();
    clearInterval(boardTimer);
    boardTimer = setInterval(() => { if (views.board.hidden) clearInterval(boardTimer); else if (!document.hidden) renderBoard(true); }, 20000);
  }
  const rowsScore = (rows, tag) => rows.map((e, i) => { const r = resultText(e), medal = i < 3;
    return `<div class="lb-row${e.tag === tag ? ' me' : ''}">
      <span class="lb-pos${medal ? ' medal' : ''}">${String(i + 1).padStart(2, '0')}</span>
      <span class="lb-who"><b>${esc(e.avatar || '')} ${esc(e.name)}</b><small>${esc(e.dept || 'без отдела')}${e.prof ? ` · ${PROF[e.prof]?.name || ''}` : ''}</small></span>
      <span class="lb-res ${e.won ? 'won' : 'lost'}"><b>${r.main}</b><small>${r.sub}</small></span></div>`; }).join('');
  async function renderBoard(quiet) {
    const onlyDept = $('onlyDept').checked;
    for (const [m, id] of Object.entries(MODES)) $(id).setAttribute('aria-selected', m === boardMode);
    $('boardTitle').textContent = { rating: 'Рейтинг офиса', daily: `Неделя дня ${dayLabel(today())}`, depts: 'Отдел против отдела', people: 'Участники' }[boardMode];
    $('onlyDeptBox').hidden = boardMode === 'depts';
    $('boardNote').textContent = !board.online ? 'Общий офис ещё не подключён — показаны данные с этого устройства. Подключение: js/config.js.'
      : { rating: 'Лучшая неделя каждого игрока в карьере.', daily: 'Одна и та же неделя для всех. В зачёт идёт первая попытка за день.',
          depts: 'Средний результат отдела с понедельника: закрытая неделя — её счёт, проваленная — 10 очков за карточку.', people: 'Список обновляется каждые 20 секунд.' }[boardMode];
    const list = $('boardList');
    if (onlyDept && !prefs.dept && boardMode !== 'depts') {
      $('boardSummary').textContent = '';
      list.innerHTML = '<div class="lb-empty"><span class="big">Нет отдела</span>Укажите свой отдел (кнопка «Изменить» в меню), чтобы видеть коллег по отделу.</div>'; return;
    }
    if (!quiet) list.innerHTML = '<div class="lb-empty">Загружаю…</div>';
    try {
      const dept = onlyDept ? prefs.dept : '', tag = await myTag;
      if (boardMode === 'people') {
        const rows = await board.people(dept);
        const canInvite = registered() && board.online && !!(myTeamCache || (await board.rpc('my_team', { p_id: prefs.playerId }).catch(() => []))[0]);
        const live = rows.filter(p => Date.now() - new Date(p.updated_at) < 10 * 60000);
        $('boardSummary').textContent = `Участников: ${rows.length} · в сети: ${live.length}`;
        if (!rows.length) { list.innerHTML = '<div class="lb-empty"><span class="big">Пусто</span>Пока никого нет.</div>'; return; }
        list.innerHTML = rows.map(p => `<div class="lb-row person${p.tag === tag ? ' me' : ''}">
          <span class="lb-ava" aria-hidden="true">${esc(p.avatar || '🙂')}</span>
          <span class="lb-who"><b>${esc(p.name)}${p.tag === tag ? ' (вы)' : ''}</b><small>${esc(p.dept || 'без отдела')}</small>
            <small class="lb-meta">недель: ${p.games || 0} · побед: ${p.wins || 0}${p.games ? ` · лучшее: ${p.best_won ? `${p.best_total}/400` : stepName(p.best_step)}` : ''}</small></span>
          <span class="lb-res">${personStatus(p)}${canInvite && p.tag !== tag && p.short_id ? `<button class="btn-chip" data-invite="${p.short_id}">Позвать в офис</button>` : ''}</span></div>`).join('');
        list.querySelectorAll('[data-invite]').forEach(b => b.onclick = async () => {
          try { const n = await board.rpc('invite_player', { p_id: prefs.playerId, p_short: b.dataset.invite }); b.textContent = 'Приглашён'; b.disabled = true; toast(`Приглашение отправлено: ${n}`); }
          catch (err) { toast(err.message); }
        });
      } else if (boardMode === 'depts') {
        const rows = await board.depts();
        $('boardSummary').textContent = cupTime() ? 'Кубок недели вручён' : 'Кубок вручат в пятницу в 18:00';
        if (!rows.length) { list.innerHTML = '<div class="lb-empty"><span class="big">Пусто</span>На этой неделе отделы ещё не играли. Укажите отдел в пропуске и сыграйте неделю.</div>'; return; }
        list.innerHTML = rows.map((d, i) => `<div class="lb-row dept${d.dept === prefs.dept ? ' me' : ''}">
          <span class="lb-pos${i === 0 ? ' medal' : ''}">${i === 0 ? (cupTime() ? 'КУБОК' : '01') : String(i + 1).padStart(2, '0')}</span>
          <span class="lb-who"><b>${esc(d.dept)}</b><small>игроков: ${d.players} · недель: ${d.weeks} · закрыто: ${d.win_rate}%</small></span>
          <span class="lb-res won"><b>${d.avg_score}</b><small>средний счёт</small></span></div>`).join('');
      } else {
        const rows = boardMode === 'daily' ? await board.daily(today(), dept) : await board.top(dept);
        $('boardSummary').textContent = `В рейтинге: ${rows.length}`;
        if (!rows.length) { list.innerHTML = `<div class="lb-empty"><span class="big">Пусто</span>${boardMode === 'daily' ? 'Сегодня неделю дня ещё никто не сыграл. Станьте первым!' : 'Пока никто не доиграл неделю. Станьте первым!'}</div>`; return; }
        list.innerHTML = rowsScore(rows, tag);
      }
    } catch (err) {
      if (!quiet) list.innerHTML = `<div class="lb-empty"><span class="big">Нет связи</span>Не удалось загрузить данные: ${esc(err.message)}</div>`;
    }
  }
  $('boardBack').onclick = () => { clearInterval(boardTimer); boardFrom === 'end' ? show('end') : renderMenu(); };
  $('boardRefresh').onclick = () => renderBoard();
  for (const [m, id] of Object.entries(MODES)) $(id).onclick = () => { boardMode = m; renderBoard(); };
  $('onlyDept').onchange = () => renderBoard();

  // ---------- конфетти ----------
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('confetti'), ctx = cv.getContext('2d'), dpr = devicePixelRatio || 1;
    cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cs = getComputedStyle(document.documentElement);
    const cols = ['--magenta', '--cyan', '--up', '--down', '--cyan-l'].map(v => cs.getPropertyValue(v).trim()).concat('#b26bff');
    const P = Array.from({ length: 170 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: rnd(cols) }));
    const t0 = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of P) { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
      if (now - t0 < 4200) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
    })(t0);
  }

  // ---------- мем-карточка для чата ----------
  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; }
    ctx.fillText(line, x, y); return y + lh;
  }
  // «Неделя пережита: Кукуха 12%, Босс 88%» — самая низкая и самая высокая шкала
  function memeLine(won) {
    const sorted = [...RES].sort((a, b) => S.res[a.k] - S.res[b.k]), lo = sorted[0], hi = sorted[3];
    const d = Math.floor(S.step / 3);
    return `${won ? 'Я пережил(а) неделю' : `Неделя завалена в ${['понедельник', 'вторник', 'среду', 'четверг', 'пятницу'][d]}`}: ${lo.name} ${S.res[lo.k]}%, ${hi.name} ${S.res[hi.k]}%`;
  }
  async function share(won, k) {
    try { await document.fonts.ready; } catch {}
    const total = RES.reduce((a, r) => a + S.res[r.k], 0);
    const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const glow = (c, b) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
    ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W * .15, H * 1.1, 0, W * .15, H * 1.1, 900);
    bg.addColorStop(0, 'rgba(178,107,255,.35)'); bg.addColorStop(1, 'rgba(178,107,255,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const bg2 = ctx.createRadialGradient(W * .9, -100, 0, W * .9, -100, 800);
    bg2.addColorStop(0, 'rgba(45,226,230,.3)'); bg2.addColorStop(1, 'rgba(45,226,230,0)'); ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
    const kick = S.mode === 'daily' ? `НЕДЕЛЯ ДНЯ ${dayLabel(S.day)}` : S.mode === 'career' && C ? `НЕДЕЛЯ ${Math.max(1, C.week - 1)} ИЗ ${YEAR}` : 'ВЫЖИТЬ ДО ПЯТНИЦЫ';
    ctx.fillStyle = '#7df9ff'; glow('rgba(45,226,230,.9)', 20); ctx.font = '700 30px "JetBrains Mono", monospace'; ctx.fillText(kick, 80, 130);
    ctx.fillStyle = '#ffffff'; glow(won ? 'rgba(255,59,212,.9)' : 'rgba(255,59,107,.9)', 40); ctx.font = '800 118px Unbounded, "Arial Black", sans-serif'; ctx.fillText('НЕДЕЛЯ', 80, 290);
    ctx.fillStyle = won ? '#ff3bd4' : '#ff3b6b'; ctx.fillText(won ? 'ПЕРЕЖИТА' : 'ЗАВАЛЕНА', 80, 420);
    glow('transparent', 0); ctx.fillStyle = '#d6d2ef'; ctx.font = '800 42px Nunito, sans-serif';
    let y = wrap(ctx, `${memeLine(won)}.`, 80, 540, W - 160, 58);
    y += 30;
    RES.forEach((r, i) => {
      const bx = 80, by = y + i * 100, bw = W - 160 - 220;
      const col = { psyche: '#b26bff', energy: '#c6f01a', boss: '#ff3b6b', colleagues: '#2de2e6' }[r.k];
      ctx.font = '800 38px Nunito, sans-serif'; ctx.fillStyle = '#f2f0ff'; ctx.fillText(r.name, bx, by + 38);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = .6; ctx.beginPath(); ctx.roundRect(bx, by + 54, bw, 32, 16); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = col; glow(col, 24); ctx.beginPath(); ctx.roundRect(bx + 5, by + 59, Math.max(22, (bw - 10) * S.res[r.k] / 100), 22, 11); ctx.fill(); glow('transparent', 0);
      ctx.fillStyle = r.k === k ? '#ff3b6b' : '#7df9ff'; ctx.font = '700 48px "JetBrains Mono", monospace'; ctx.textAlign = 'right'; ctx.fillText(`${S.res[r.k]}%`, W - 80, by + 84); ctx.textAlign = 'left';
    });
    y += 4 * 100 + 30;
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(80, y, W - 160, 2);
    ctx.fillStyle = '#ffffff'; glow('rgba(255,59,212,.8)', 24); ctx.font = '700 40px "JetBrains Mono", monospace'; ctx.fillText(won ? `СЧЁТ ${total}/400` : S.name.toUpperCase(), 80, y + 70);
    glow('rgba(212,255,58,.7)', 16); ctx.fillStyle = '#d4ff3a'; ctx.textAlign = 'right'; ctx.font = '900 36px Nunito, sans-serif'; ctx.fillText(won ? rank(total) : TRAITS[S.trait || 'workaholic'].name, W - 80, y + 70); ctx.textAlign = 'left';
    glow('transparent', 0); ctx.font = '800 32px Nunito, sans-serif'; ctx.fillStyle = '#b9b4d6'; ctx.fillText('А ты доживёшь до пятницы?', 80, H - 90);
    const url = cv.toDataURL('image/png');
    const link = /^https?:/.test(location.href) ? ` ${location.origin}${location.pathname}` : '';
    const text = `${memeLine(won)}. «Выжить до пятницы»${S.mode === 'daily' ? `, неделя дня ${dayLabel(S.day)}` : ''}. А ты доживёшь?${link}`;
    const m = $('modal');
    m.innerHTML = `<div class="modal-box glass" role="dialog" aria-modal="true" aria-label="Мем-карточка">
      <img src="${url}" alt="Мем-карточка: ${esc(memeLine(won))}">
      <p>Нажмите и удерживайте картинку (на компьютере — правый клик → «Сохранить изображение»), чтобы отправить её в рабочий чат.</p>
      ${navigator.canShare ? '<button class="btn-main" id="shareImg">Отправить картинку</button>' : ''}
      <button class="${navigator.canShare ? 'btn-ghost' : 'btn-main'}" id="copyTxt">Скопировать текст для чата</button>
      <div class="toast" id="toast" aria-live="polite"></div>
      <button class="btn-ghost" id="closeM">Закрыть</button></div>`;
    m.hidden = false;
    $('closeM').onclick = () => { m.hidden = true; $('share')?.focus(); };
    m.onclick = e => { if (e.target === m) m.hidden = true; };
    if ($('shareImg')) $('shareImg').onclick = async () => {
      try {
        const blob = await (await fetch(url)).blob(), file = new File([blob], 'vyzhit-do-pyatnitsy.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text });
        else await navigator.share({ text });
      } catch {}
    };
    $('copyTxt').onclick = () => {
      navigator.clipboard.writeText(text).then(() => $('toast').textContent = 'Текст скопирован',
        () => { $('toast').textContent = text; });
    };
    $('copyTxt').focus();
  }

  // ---------- ID игрока, офис и чаты ----------
  const shortId = tag => tag.slice(0, 6).toUpperCase();
  const offline = title => {
    views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">${title}</span><h1>Нужен общий офис</h1>
      <p>Офисы, приглашения и чаты работают через Supabase. Впишите ключи в js/config.js и выполните supabase/schema.sql.</p>
      <div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
    show('end'); $('toMenu').onclick = renderMenu;
  };
  const inviteLink = code => `${location.origin}${location.pathname}?join=${code}`;
  const copy = (text, ok) => navigator.clipboard.writeText(text).then(() => toast(ok), () => toast(text));

  async function renderInvites() {
    const box = $('invites');
    if (!board.online || !prefs.name || !registered()) { box.hidden = true; return; }
    try {
      const list = await board.rpc('my_invites', { p_id: prefs.playerId });
      box.hidden = !list.length;
      box.innerHTML = list.map(i => `<div class="invite"><span><b>${esc(i.from_name)}</b> зовёт вас в офис «${esc(i.team_name)}»</span>
        <button class="btn-chip" data-a="1" data-id="${i.invite_id}">Принять</button><button class="btn-chip" data-a="0" data-id="${i.invite_id}">Нет</button></div>`).join('');
      box.querySelectorAll('button').forEach(b => b.onclick = async () => {
        try { const name = await board.rpc('answer_invite', { p_id: prefs.playerId, p_invite: +b.dataset.id, p_accept: b.dataset.a === '1' });
          toast(b.dataset.a === '1' ? `Вы в офисе «${name}»` : 'Приглашение отклонено'); renderInvites(); }
        catch (err) { toast(err.message); }
      });
    } catch { box.hidden = true; }
  }

  async function showOffice() {
    if (!board.online) return offline('Мой офис');
    setPhase('evening');
    views.end.innerHTML = '<div class="end-sheet glass"><span class="kicker">Мой офис</span><p>Загружаю…</p></div>'; show('end');
    let team;
    try { await board.touch('menu'); team = (await board.rpc('my_team', { p_id: prefs.playerId }))[0]; }
    catch (err) { views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">Мой офис</span><h1>Нет связи</h1><p>${esc(err.message)}</p><div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`; $('toMenu').onclick = renderMenu; return; }
    const myId = shortId(await myTag);
    if (!team) {
      views.end.innerHTML = `<div class="end-sheet glass">
        <span class="kicker">Мой офис · ваш ID ${myId}</span>
        <h1>Соберите команду</h1>
        <p>Создайте офис и позовите коллег по ссылке или по их ID. Или вступите в офис по коду, который вам прислали.</p>
        <form class="inline-form" id="mkForm"><input id="mkName" maxlength="32" placeholder="Название офиса, например «Отдел продаж»" aria-label="Название офиса"><button class="btn-main" type="submit">Создать</button></form>
        <form class="inline-form" id="jnForm"><input id="jnCode" maxlength="6" placeholder="Код офиса" aria-label="Код офиса" autocapitalize="characters"><button class="btn-ghost" type="submit">Вступить</button></form>
        <p class="join-err" id="ofErr" role="alert"></p>
        <div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
      $('toMenu').onclick = renderMenu;
      $('mkForm').onsubmit = async e => { e.preventDefault(); const n = $('mkName').value.trim();
        if (n.length < 2) { $('ofErr').textContent = 'Название — хотя бы 2 символа.'; return; }
        try { await board.rpc('create_team', { p_id: prefs.playerId, p_name: n }); showOffice(); } catch (err) { $('ofErr').textContent = err.message; } };
      $('jnForm').onsubmit = async e => { e.preventDefault();
        try { const n = await board.rpc('join_team', { p_id: prefs.playerId, p_code: $('jnCode').value }); toast(`Вы в офисе «${n}»`); showOffice(); } catch (err) { $('ofErr').textContent = err.message; } };
      return;
    }
    const members = await board.rpc('team_members_list', { p_id: prefs.playerId }).catch(() => []);
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Мой офис · ${members.length} ${members.length === 1 ? 'участник' : members.length < 5 ? 'участника' : 'участников'}</span>
      <h1>${esc(team.name)}</h1>
      <div class="office-code"><span class="kicker">Код офиса</span><b>${team.code}</b><small>${esc(inviteLink(team.code))}</small>
        <button class="btn-ghost" id="cpLink">Скопировать ссылку-приглашение</button></div>
      <form class="inline-form" id="invForm"><input id="invId" maxlength="6" placeholder="ID игрока, например 3FA9C1" aria-label="ID игрока" autocapitalize="characters"><button class="btn-main" type="submit">Позвать</button></form>
      <p class="join-err" id="ofErr" role="alert"></p>
      <div class="members panel board-list">${members.map(m => `<div class="lb-row person${m.is_me ? ' me' : ''}">
        <span class="lb-ava" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
        <span class="lb-who"><b>${esc(m.name)}${m.is_me ? ' (вы)' : ''}${m.is_owner ? ' · создатель' : ''}</b><small>${esc(m.dept || 'без отдела')} · ID ${m.short_id}</small></span>
        <span class="lb-res">${personStatus(m)}</span></div>`).join('')}</div>
      <div class="stack"><button class="btn-main" id="toChat">Чат офиса</button><button class="btn-ghost" id="leave">Покинуть офис</button><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
    $('toMenu').onclick = renderMenu; $('toChat').onclick = () => showChat('team');
    $('cpLink').onclick = () => copy(`Заходи в наш офис «${team.name}» в игре «Выжить до пятницы»: ${inviteLink(team.code)}`, 'Ссылка скопирована — отправьте её в рабочий чат');
    $('invForm').onsubmit = async e => { e.preventDefault();
      try { const n = await board.rpc('invite_player', { p_id: prefs.playerId, p_short: $('invId').value }); $('invId').value = ''; $('ofErr').textContent = ''; toast(`Приглашение отправлено: ${n}`); }
      catch (err) { $('ofErr').textContent = err.message; } };
    $('leave').onclick = async () => { const b = $('leave');
      if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Точно покинуть офис? Нажмите ещё раз'; return; }
      await board.rpc('leave_team', { p_id: prefs.playerId }).catch(err => toast(err.message)); showOffice(); };
  }

  // Чаты: офиса (только участники) и общий для всех игроков; обновляются каждые 4 секунды
  let chatTimer = null, chatLast = '';
  async function showChat(channel) {
    if (!board.online) return offline('Чат');
    setPhase('evening'); clearInterval(chatTimer); chatLast = '';
    views.end.innerHTML = `<div class="chat">
      <div class="board-head"><button class="icon-btn pill" id="chBack" aria-label="Назад">←</button><h2>${channel === 'team' ? 'Чат офиса' : 'Общий чат'}</h2><span style="width:38px"></span></div>
      <div class="tabs" role="tablist"><button class="tab" role="tab" id="chTeam" aria-selected="${channel === 'team'}">Офис</button><button class="tab" role="tab" id="chAll" aria-selected="${channel === 'global'}">Все игроки</button></div>
      <div class="chat-list panel" id="chList" aria-live="polite"><div class="lb-empty">Загружаю…</div></div>
      <form class="chat-form" id="chForm"><input id="chText" maxlength="300" placeholder="Сообщение" autocomplete="off" aria-label="Сообщение"><button class="btn-main" type="submit">Отправить</button></form>
    </div>`;
    views.end.classList.add('chat-view'); show('end');
    const leave = () => { clearInterval(chatTimer); views.end.classList.remove('chat-view'); };
    $('chBack').onclick = () => { leave(); renderMenu(); };
    $('chTeam').onclick = () => { leave(); showChat('team'); };
    $('chAll').onclick = () => { leave(); showChat('global'); };
    await board.touch('menu').catch(() => {});
    const load = async () => {
      if (!$('chList')) return clearInterval(chatTimer);
      try {
        const rows = (await board.rpc('get_messages', { p_id: prefs.playerId, p_channel: channel })).reverse();
        const sig = rows.map(r => r.msg_id).join(',');
        if (sig === chatLast) return;
        chatLast = sig;
        const list = $('chList'), atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
        if (channel === 'team' && !rows.length) {
          const team = (await board.rpc('my_team', { p_id: prefs.playerId }))[0];
          list.innerHTML = team ? `<div class="lb-empty"><span class="big">Тишина</span>В чате офиса «${esc(team.name)}» пока пусто. Напишите первым!</div>`
            : '<div class="lb-empty"><span class="big">Нет офиса</span>Чат офиса появится, когда вы создадите офис или вступите в него. А пока есть общий чат.</div>';
          return;
        }
        list.innerHTML = rows.length ? rows.map(m => `<div class="msg${m.mine ? ' mine' : ''}"><span class="ava-s" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
          <span class="meta">${m.mine ? '' : `<b>${esc(m.name)}</b> · `}${new Date(m.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}${m.dept && !m.mine ? ` · ${esc(m.dept)}` : ''}</span>
          <span class="bubble">${esc(m.msg)}</span></div>`).join('') : '<div class="lb-empty"><span class="big">Тишина</span>Сообщений пока нет. Напишите первым!</div>';
        if (atBottom || rows.some(r => r.mine)) list.scrollTop = list.scrollHeight;
      } catch (err) { $('chList').innerHTML = `<div class="lb-empty"><span class="big">Нет связи</span>${esc(err.message)}</div>`; }
    };
    $('chForm').onsubmit = async e => {
      e.preventDefault(); const t = $('chText').value.trim(); if (!t) return;
      try { await board.rpc('post_message', { p_id: prefs.playerId, p_channel: channel, p_text: t }); $('chText').value = ''; chatLast = ''; load(); }
      catch (err) { toast(err.message); }
    };
    await load();
    chatTimer = setInterval(() => { if (!document.hidden) load(); }, 4000);
  }

  // ---------- приглашения в игру: ссылки с ID, плашка, бонус за пришедших ----------
  const gameUrl = () => /^https?:/.test(location.href) ? location.origin + location.pathname : 'https://minionslaba-ux.github.io/vyzhit-do-pyatnitsy-/';
  async function referralLink(kind) {
    const ref = shortId(await myTag);
    let team = null;
    if (kind === 'team' && registered()) team = myTeamCache || (await board.rpc('my_team', { p_id: prefs.playerId }).catch(() => []))[0] || null;
    return { url: `${gameUrl()}?ref=${ref}${team ? `&join=${team.code}` : ''}`, team };
  }
  function shareText(kind, team) {
    return kind === 'team'
      ? (team ? `Я в нашем офисе «${team.name}» в игре «Выжить до пятницы». Заходи в команду — проверим, кто дольше продержится до пятницы!`
              : 'Играю в «Выжить до пятницы» — офисный симулятор, где Босс на 100% хуже увольнения. Давай сыграем всем отделом и сравним, кто дольше продержится!')
      : 'Затягивает: «Выжить до пятницы» — офисный симулятор в духе Reigns. Держи Кукуху, Энергию, Босса и Коллег в балансе до пятницы, 18:00. Попробуй!';
  }
  function bindShare(root) { root.querySelectorAll('[data-share]').forEach(b => b.onclick = () => { snoozeViral(7); openShare(b.dataset.share); }); }
  async function openShare(kind) {
    const m = $('modal');
    const { url, team } = await referralLink(kind), text = shareText(kind, team), full = `${text} ${url}`;
    const enc = encodeURIComponent;
    m.innerHTML = `<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="shTitle">
      <h2 id="shTitle">Позвать в игру</h2>
      <div class="share-tabs" role="tablist"><button class="tab" role="tab" data-k="team" aria-selected="${kind === 'team'}">Коллег</button><button class="tab" role="tab" data-k="friends" aria-selected="${kind === 'friends'}">Друзей</button></div>
      ${kind === 'team' && !team ? `<p class="field-note">${registered() ? 'Создайте офис в «Мой офис» — тогда ссылка сразу приведёт коллег в вашу команду.' : 'Зарегистрируйтесь и создайте офис — тогда ссылка сразу приведёт коллег в вашу команду.'}</p>` : ''}
      <p class="share-text" id="shText">${esc(full)}</p>
      <div class="share-grid">
        ${navigator.share ? '<button id="shNative">Отправить…</button>' : ''}
        <a href="https://t.me/share/url?url=${enc(url)}&text=${enc(text)}" target="_blank" rel="noopener">Telegram</a>
        <a href="https://wa.me/?text=${enc(full)}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://vk.com/share.php?url=${enc(url)}&title=${enc(text)}" target="_blank" rel="noopener">ВКонтакте</a>
        <a href="mailto:?subject=${enc('Выжить до пятницы')}&body=${enc(full)}">Почта</a>
        <button id="shCopy">Скопировать ссылку</button>
      </div>
      <p class="share-count" id="shCount"></p>
      <p class="field-note">За каждого, кто впервые придёт по вашей ссылке, — +1 предмет на следующую неделю карьеры.</p>
      <button class="btn-ghost" id="shClose">Закрыть</button></div>`;
    m.hidden = false;
    m.querySelectorAll('.share-tabs .tab').forEach(t => t.onclick = () => openShare(t.dataset.k));
    $('shClose').onclick = () => { m.hidden = true; };
    m.onclick = e => { if (e.target === m) m.hidden = true; };
    $('shCopy').onclick = () => copy(full, 'Приглашение скопировано — вставьте его в чат');
    if ($('shNative')) $('shNative').onclick = () => navigator.share({ title: 'Выжить до пятницы', text, url }).catch(() => {});
    if (board.online) board.rpc('referral_count', { p_id: prefs.playerId }).then(n => { if ($('shCount')) $('shCount').textContent = `По вашим ссылкам пришло: ${n || 0}`; }).catch(() => {});
  }
  // Плашка в меню: после первой сыгранной недели, не чаще раза в двое суток после закрытия
  const snoozeViral = days => { prefs.viralSnooze = Date.now() + days * 864e5; store.set(KEY.prefs, prefs); $('viralPop').hidden = true; };
  function maybeViralPop() {
    const pop = $('viralPop');
    pop.hidden = !((prefs.gamesPlayed || 0) >= 1 && Date.now() > (prefs.viralSnooze || 0));
  }
  $('viralX').onclick = () => snoozeViral(2);
  bindShare($('viralPop'));
  // Кто пришёл по ссылке ?ref=ID — засчитываем пригласившему
  function rememberRef() {
    const q = new URLSearchParams(location.search), ref = q.get('ref');
    if (!ref) return;
    if (!prefs.refClaimed) { prefs.refBy = ref.toUpperCase(); store.set(KEY.prefs, prefs); }
    q.delete('ref'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  }
  async function claimReferral() {
    if (!board.online || !prefs.refBy || prefs.refClaimed || !prefs.name) return;
    if (prefs.refBy === shortId(await myTag)) { delete prefs.refBy; store.set(KEY.prefs, prefs); return; }
    try { await board.rpc('claim_referral', { p_id: prefs.playerId, p_ref: prefs.refBy }); prefs.refClaimed = true; store.set(KEY.prefs, prefs); } catch {}
  }
  // Бонус пригласившему: новые пришедшие → +1 предмет на следующую неделю за каждого
  async function checkReferrals() {
    if (!board.online || !prefs.name) return;
    try {
      const n = await board.rpc('referral_count', { p_id: prefs.playerId }) || 0, seen = prefs.refSeen || 0;
      if (n > seen) {
        prefs.bonusItems = (prefs.bonusItems || 0) + (n - seen); prefs.refSeen = n; store.set(KEY.prefs, prefs);
        toast(`По вашей ссылке ${n - seen === 1 ? 'пришёл новый игрок' : `пришли ${n - seen} новых игрока`}: +${n - seen} предм. на следующую неделю`);
      }
      if (n >= 3) unlock(['recruiter']);
    } catch {}
  }
  rememberRef();

  // ---------- старт: брендированная неделя (?pack=имя) и карточки от коллег ----------
  (async () => {
    const pack = new URLSearchParams(location.search).get('pack');
    if (pack && /^[a-z0-9_-]+$/i.test(pack)) {
      try {
        const r = await fetch(`packs/${pack}.json`);
        if (r.ok) {
          PACK = await r.json();
          PACK_CARDS = (PACK.cards || []).filter(c => DAYS.includes(c.day) && PHASES.some(p => p.name === c.phase)).map(c => ({ ...norm(c), id: 'pack_' + c.id }));
          for (const c of PACK_CARDS) byId[c.id] = c;
          if (/^#[0-9a-f]{6}$/i.test(PACK.accent || '')) document.documentElement.style.setProperty('--magenta', PACK.accent);
          if (!views.menu.hidden) renderMenu();
        }
      } catch {}
    }
    try {
      for (const s of await board.approved()) {
        const c = { id: 'sug_' + s.id, who: s.who || 'Коллега', text: s.text, author: s.author, random: true,
          answers: { left: { label: s.left_label, effects: s.left_effects || {} }, right: { label: s.right_label, effects: s.right_effects || {} } } };
        byId[c.id] = c; SUGGESTED.push(c);
      }
    } catch {}
  })();

  // Вход по ссылке из письма: в адресе #access_token=… — игрок становится аккаунтом, гостевой прогресс переносится
  async function finishLogin() {
    const h = new URLSearchParams(location.hash.slice(1));
    const clean = () => history.replaceState(null, '', location.pathname + location.search);
    if (h.get('error')) { clean(); toast(`Вход не удался: ${h.get('error_description') || h.get('error')}. Отправьте ссылку ещё раз.`); return false; }
    const token = h.get('access_token');
    if (!token || !board.online) return false;
    clean();
    try {
      const user = await board.user(token);
      if (prefs.playerId !== user.id) {
        if (prefs.name) await board.rpc('merge_player', { p_from: prefs.playerId, p_to: user.id }, token).catch(() => {});
        prefs.playerId = user.id;
      }
      prefs.email = user.email; delete prefs.pendingEmail;
      const exp = +h.get('expires_at') ? +h.get('expires_at') * 1000 : Date.now() + (+h.get('expires_in') || 3600) * 1000;
      prefs.session = { access: token, refresh: h.get('refresh_token'), exp };
      const prof = (await board.rpc('get_profile', { p_id: user.id }).catch(() => []))[0];
      if (prof && !prefs.name) Object.assign(prefs, { name: prof.name, dept: prof.dept, avatar: prof.avatar || prefs.avatar });
      store.set(KEY.prefs, prefs);
      location.reload();  // ID игрока сменился — перезапускаем игру с ним
      return true;
    } catch (err) { toast(`Вход не удался: ${err.message}`); return false; }
  }
  // Приглашение по ссылке ?join=КОД
  async function joinFromLink() {
    const q = new URLSearchParams(location.search), code = q.get('join') || prefs.pendingJoin;
    if (q.get('join')) { prefs.pendingJoin = q.get('join'); store.set(KEY.prefs, prefs); q.delete('join'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); }
    if (!code || !prefs.name || !board.online) return;
    if (!registered()) { toast('Чтобы вступить в офис по приглашению, зарегистрируйтесь — после входа вы окажетесь в нём сами'); return; }
    try { await board.touch('menu'); const n = await board.rpc('join_team', { p_id: prefs.playerId, p_code: code }); toast(`Вы в офисе «${n}». Загляните в чат офиса!`); }
    catch (err) { toast(err.message); }
    delete prefs.pendingJoin; store.set(KEY.prefs, prefs);
  }
  const origSubmit = $('joinForm').onsubmit;
  $('joinForm').onsubmit = async e => { await origSubmit(e); if (prefs.name && !views.menu.hidden) joinFromLink(); };

  finishLogin().then(reloading => {
    if (reloading) return;
    if (prefs.email && !prefs.name) renderJoin('profile', 'Вход выполнен. Осталось представиться коллегам.');
    else if (prefs.name) renderMenu();
    else renderWelcome();
    joinFromLink();
  });
})();
