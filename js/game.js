(() => {
  // ---------- данные ----------
  const RES = [
    { k: 'psyche', name: 'Кукуха', icon: '🧠' },
    { k: 'energy', name: 'Энергия', icon: '☕' },
    { k: 'boss', name: 'Босс', icon: '💼' },
    { k: 'colleagues', name: 'Коллеги', icon: '🤝' },
  ];
  const PROF = {
    marketer:   { name: 'Маркетолог',  icon: '📣', bonus: { colleagues: 15, psyche: -5 }, perk: 'Коллеги +15 · Кукуха −5' },
    accountant: { name: 'Бухгалтер',   icon: '🧮', bonus: { boss: 15, energy: -5 },       perk: 'Босс +15 · Энергия −5' },
    dev:        { name: 'Программист', icon: '💻', bonus: { psyche: 15, colleagues: -5 }, perk: 'Кукуха +15 · Коллеги −5' },
    sales:      { name: 'Продажник',   icon: '📞', bonus: { energy: 15, psyche: -5 },     perk: 'Энергия +15 · Кукуха −5' },
  };
  const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const DAYS_GEN = ['понедельника', 'вторника', 'среды', 'четверга', 'пятницы'];
  const PHASES = [
    { name: 'Утро', from: 9 * 60, to: 12 * 60 },
    { name: 'День', from: 12 * 60, to: 17 * 60 },
    { name: 'Вечер', from: 17 * 60, to: 19 * 60 },
  ];
  const PHASE_KEY = ['morning', 'day', 'evening'];
  const DAY_QUIP = [
    'Неделя только началась. Кофе налит, нервы пока целы.',
    'Вчерашние письма никуда не делись. Их стало больше.',
    'Экватор недели. Половина пути до свободы.',
    'Четверг — это маленькая пятница. Держитесь.',
    'Последний рывок. До 18:00 рукой подать.',
  ];
  const DEATH = {
    psyche:     { icon: '🌋', title: 'Кукуха 0%', text: 'Вы не выдержали очередного «Асиап» в чате, перевернули кулер с водой и ушли в закат. Вас ищут HR.' },
    energy:     { icon: '😴', title: 'Энергия 0%', text: 'Энергетический кризис. Вы уснули на ковре в переговорной во время важного зума с инвесторами. Вас аккуратно накрыли пледом и уволили.' },
    boss:       { icon: '📦', title: 'Босс 0%', text: 'Шеф вызвал вас «на пару слов» и вручил трудовую книжку. Ваши мемы в общем чате признаны экстремистскими.' },
    colleagues: { icon: '🧊', title: 'Коллеги 0%', text: 'Коллектив объявил вам тотальный бойкот. Никто не передал вам пароль от нового Wi‑Fi и не позвал есть пирог на кухне. Работать в изоляции стало невыносимо.' },
  };

  // CARDS_JSON, DECOR и RANDOM_JSON лежат в js/cards.js
  const norm = c => ({ ...c, ...DECOR[c.id],
    answers: { left: c.answers.left || c.answers.left_switch, right: c.answers.right || c.answers.right_switch } });
  const CARDS = CARDS_JSON.map(norm);
  const RANDOM_CARDS = RANDOM_JSON.map(c => ({ ...norm(c), random: true }));
  const byId = Object.fromEntries([...CARDS, ...RANDOM_CARDS].map(c => [c.id, c]));

  function getRandomCard(standardCard, randomPack) {
    // Генерируем случайное число от 1 до 100
    const chance = Math.floor(Math.random() * 100) + 1;

    // Если выпало меньше или равно 15, выдаем случайное событие вместо стандартного
    if (chance <= 15 && randomPack.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomPack.length);
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
  const KEY = { save: 'vdp-save', best: 'vdp-best', prefs: 'vdp-prefs', career: 'vdp-career' };
  const YEAR = 52;
  const prefs = Object.assign({ name: '', dept: '', avatar: '😎', prof: 'marketer', sound: true }, store.get(KEY.prefs, {}));
  const AVATARS = ['😎', '🤓', '🧐', '😴', '🤠', '🥸', '🤖', '🦄', '🐱', '🐶', '🦊', '🐼'];
  if (!prefs.playerId) {
    prefs.playerId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
    store.set(KEY.prefs, prefs);
  }

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
    return {
      online,
      async touch(status, step = 0) {
        if (!prefs.name) return;
        if (!online) {
          const all = store.get(PEOPLE, {}), m = await me();
          all[m.tag] = { ...all[m.tag], ...m, prof: prefs.prof, status, step, updated_at: new Date().toISOString(), created_at: all[m.tag]?.created_at || new Date().toISOString() };
          store.set(PEOPLE, all); return;
        }
        await req('/rpc/touch_player', { method: 'POST', body: JSON.stringify({ p_id: prefs.playerId, p_name: prefs.name, p_dept: prefs.dept,
          p_avatar: prefs.avatar, p_prof: prefs.prof, p_status: status, p_step: step }) });
      },
      async submit(entry) {
        if (!online) {
          const all = store.get(LOCAL, []); all.push({ ...entry, ...(await me()), created_at: new Date().toISOString() });
          store.set(LOCAL, all.slice(-200)); return;
        }
        await req('/scores', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(entry) });
      },
      async top(dept) {
        if (!online) {
          const bestOf = {};
          for (const e of store.get(LOCAL, [])) if (!bestOf[e.tag] || better(e, bestOf[e.tag]) < 0) bestOf[e.tag] = e;
          return Object.values(bestOf).filter(e => !dept || e.dept === dept).sort(better).slice(0, 100);
        }
        return req(`/leaderboard?select=*&order=won.desc,step.desc,total.desc,created_at.asc&limit=100${dept ? `&dept=eq.${encodeURIComponent(dept)}` : ''}`);
      },
      async people(dept) {
        if (!online) {
          const games = store.get(LOCAL, []);
          return Object.values(store.get(PEOPLE, {})).filter(p => !dept || p.dept === dept).map(p => {
            const mine = games.filter(g => g.tag === p.tag), best = mine.sort(better)[0];
            return { ...p, games: mine.length, wins: mine.filter(g => g.won).length, best_won: best?.won, best_step: best?.step, best_total: best?.total };
          }).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
        }
        return req(`/participants?select=*&order=updated_at.desc&limit=200${dept ? `&dept=eq.${encodeURIComponent(dept)}` : ''}`);
      },
    };
  })();

  // ---------- звук ----------
  let actx;
  function tone(freq, dur = .12, type = 'sine', vol = .05, delay = 0) {
    if (!prefs.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur);
    } catch {}
  }
  const sfx = {
    swipe: () => { tone(420, .08, 'triangle'); tone(640, .08, 'triangle', .04, .05); },
    lose: () => { [330, 262, 196, 147].forEach((f, i) => tone(f, .28, 'sawtooth', .04, i * .16)); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', .06, i * .12)); },
  };

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const views = { join: $('join'), menu: $('menu'), game: $('game'), end: $('end'), board: $('board') };
  const show = v => Object.entries(views).forEach(([k, el]) => el.hidden = k !== v);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  // Неоновые трубки: слева Кукуха и Энергия, справа Босс и Коллеги
  const tube = r => `<div class="tube-wrap" id="st-${r.k}" data-k="${r.k}">
      <span class="arrows" id="mk-${r.k}" aria-hidden="true"></span>
      <div class="tube"><div class="fill" id="fl-${r.k}"></div></div>
      <span class="lbl">${r.name}</span><span class="pct" id="pc-${r.k}">50%</span></div>`;
  $('tubesL').innerHTML = RES.slice(0, 2).map(tube).join('');
  $('tubesR').innerHTML = RES.slice(2).map(tube).join('');
  const setPhase = p => { document.body.dataset.phase = p; };

  function renderSound() {
    for (const b of [$('soundMenu'), $('soundGame')]) { b.textContent = prefs.sound ? '♪' : '×'; b.setAttribute('aria-pressed', prefs.sound); b.title = prefs.sound ? 'Звук включён' : 'Звук выключен'; }
  }
  function toggleSound() { prefs.sound = !prefs.sound; store.set(KEY.prefs, prefs); renderSound(); }
  $('soundMenu').onclick = toggleSound; $('soundGame').onclick = toggleSound;

  // ---------- меню ----------
  $('profs').innerHTML = Object.entries(PROF).map(([k, p]) => `<label class="prof">
      <input type="radio" name="prof" value="${k}"><span class="pe" aria-hidden="true">${p.icon}</span><b>${p.name}</b><small>${p.perk}</small></label>`).join('');
  const getProf = () => document.querySelector('input[name=prof]:checked')?.value || 'marketer';

  function renderMenu() {
    $('meAva').textContent = prefs.avatar; $('meName').textContent = prefs.name; $('meDept').textContent = prefs.dept || 'без отдела';
    const radio = document.querySelector(`input[name=prof][value=${prefs.prof}]`) || document.querySelector('input[name=prof]');
    radio.checked = true;
    setPhase('day');
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    $('record').textContent = best.wins ? `недель закрыто: ${best.wins}` : best.step ? `дольше всего: ${DAYS[Math.floor(best.step / 3)]}, ${PHASES[best.step % 3].name.toLowerCase()}` : 'пока нет';
    const save = store.get(KEY.save, null);
    if (save && !save.deck?.every(x => byId[x.id])) store.del(KEY.save); // сохранение от старой колоды
    const C = store.get(KEY.career, null);
    $('careerCard').hidden = !C; $('profField').hidden = !!C; $('newCareer').hidden = !C;
    $('newCareer').textContent = 'Начать карьеру заново'; delete $('newCareer').dataset.armed;
    if (C) {
      const where = C.stage === 'search' ? 'ищет работу' : C.company;
      $('careerCard').innerHTML = `<div class="cc-head"><b>Неделя ${Math.min(C.week, YEAR)}/${YEAR}</b><span>${esc(where)}</span></div>
        <div class="cc-bar"><i style="width:${(Math.min(C.week - 1, YEAR) / YEAR) * 100}%"></i></div>
        <div class="stat-box"><b>${C.worked}</b><span>отработано</span></div>
        <div class="stat-box"><b>${C.firings}</b><span>увольнений</span></div>
        <div class="stat-box"><b>${C.companies.length}</b><span>компаний</span></div>`;
      $('start').textContent = save ? 'Продолжить неделю' : C.stage === 'search' ? 'Продолжить поиск работы' : `Начать неделю ${C.week}`;
    } else $('start').textContent = 'Начать карьеру';
    renderSound(); show('menu');
    board.touch('menu').catch(() => {});
  }
  $('profs').onchange = () => { prefs.prof = getProf(); store.set(KEY.prefs, prefs); };
  $('openBoard').onclick = () => openBoard('menu', 'rating');
  $('openPeople').onclick = () => openBoard('menu', 'people');
  $('meEdit').onclick = () => renderJoin(true);

  // ---------- пропуск в офис ----------
  $('avatars').innerHTML = AVATARS.map(a => `<label class="ava"><input type="radio" name="ava" value="${a}"><span aria-hidden="true">${a}</span></label>`).join('');
  $('avatars').onchange = () => { $('joinAvatar').textContent = document.querySelector('input[name=ava]:checked').value; };
  function renderJoin(editing) {
    $('joinName').value = prefs.name; $('joinDept').value = prefs.dept;
    (document.querySelector(`input[name=ava][value="${prefs.avatar}"]`) || document.querySelector('input[name=ava]')).checked = true;
    $('joinAvatar').textContent = document.querySelector('input[name=ava]:checked').value;
    $('joinErr').textContent = ''; $('joinName').removeAttribute('aria-invalid');
    $('joinCancel').hidden = !editing; $('joinGo').textContent = editing ? 'Сохранить' : 'Войти в офис';
    setPhase('morning'); show('join');
    if (!editing) $('joinName').focus({ preventScroll: true });
  }
  $('joinName').oninput = () => { $('joinErr').textContent = ''; $('joinName').removeAttribute('aria-invalid'); };
  $('joinCancel').onclick = renderMenu;
  $('joinForm').onsubmit = e => {
    e.preventDefault();
    const name = $('joinName').value.trim().replace(/\s+/g, ' ');
    if (name.length < 2) {
      $('joinErr').textContent = 'Введите имя — хотя бы 2 буквы. Его увидят коллеги в рейтинге.';
      $('joinName').setAttribute('aria-invalid', 'true'); $('joinName').focus(); return;
    }
    prefs.name = name; prefs.dept = $('joinDept').value.trim().replace(/\s+/g, ' ');
    prefs.avatar = document.querySelector('input[name=ava]:checked').value;
    store.set(KEY.prefs, prefs); renderMenu();
  };
  $('start').onclick = () => continueCareer();
  // «Начать заново» срабатывает со второго нажатия: окна подтверждения в браузере тут нет
  $('newCareer').onclick = () => {
    const b = $('newCareer');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Весь прогресс года сотрётся. Нажмите ещё раз'; return; }
    store.del(KEY.career); store.del(KEY.save); newCareer();
  };

  // ---------- игра ----------
  let S = null, busy = false, splashOn = false, splashFor = -1;
  const clamp = v => Math.max(0, Math.min(100, v));
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const PHASE_TIME = ['09:00', '13:00', '17:00'];
  const EASE = 'cubic-bezier(.2,.7,.2,1)';

  function buildDeck(prof) {
    const used = new Set(), deck = [], randomPack = [...RANDOM_CARDS]; // свежая копия на каждую неделю
    for (let i = 0; i < 15; i++) {
      const d = Math.floor(i / 3), ph = PHASES[i % 3];
      const ok = c => c.phase === ph.name && !used.has(c.id) && (!c.prof || c.prof === prof);
      const special = CARDS.filter(c => ok(c) && c.day === DAYS[d]);
      const pool = special.length ? special : CARDS.filter(c => ok(c) && !c.day);
      const standard = rnd(pool); used.add(standard.id);
      const card = getRandomCard(standard, randomPack);
      deck.push({ id: card.id, time: card.time || PHASE_TIME[i % 3] });
    }
    return deck;
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
    prefs.prof = getProf(); store.set(KEY.prefs, prefs);
    const first = rnd(VACANCIES.filter(v => v.level === 1));
    C = { prof: prefs.prof, week: 1, stage: 'work', company: first.name, companies: [first.name], res: null,
      worked: 0, firings: 0, passed: 0, failed: 0 };
    C.res = freshRes(first.perk);
    saveCareer(); startWeek();
  }
  function continueCareer() {
    C = store.get(KEY.career, null);
    if (!C) return newCareer();
    const save = store.get(KEY.save, null);
    if (save && save.deck?.every(x => byId[x.id])) { S = save; return enterGame(); }
    if (C.week > YEAR) return yearEnd();
    if (C.stage === 'search') return jobSearch();
    startWeek();
  }
  function startWeek() {
    S = { name: prefs.name, dept: prefs.dept, prof: C.prof, res: { ...C.res }, step: 0, deck: buildDeck(C.prof) };
    store.set(KEY.save, S);
    enterGame();
  }

  function enterGame() { busy = false; show('game'); splashFor = -1; renderBars(); renderCard(); }

  function renderBars() {
    for (const r of RES) {
      const v = S.res[r.k];
      $('fl-' + r.k).style.setProperty('--v', v);
      $('pc-' + r.k).textContent = v + '%';
      $('st-' + r.k).classList.toggle('danger', v <= 20);
    }
  }

  function renderCard() {
    const slot = S.deck[S.step], c = byId[slot.id], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    const card = $('card');
    card.innerHTML = `<div class="card-head"><span class="who">${esc(c.who)}</span>${c.random ? '<span class="rnd-tag">! СЛУЧАЙНОЕ СОБЫТИЕ</span>' : ''}</div>
      <div class="text">${esc(c.text)}</div>`;
    // вход новой карточки: из translateY(28px) scale(.95) и прозрачности
    card.style.transition = 'none'; card.style.transform = 'translateY(28px) scale(.95)'; card.style.opacity = '0';
    void card.offsetWidth;
    card.style.transition = `transform .38s ${EASE}, opacity .38s, border-color .2s, box-shadow .2s`; card.style.transform = ''; card.style.opacity = '';
    setPhase(PHASE_KEY[S.step % 3]);
    $('btnL').innerHTML = `<span class="ar">←</span><span>${esc(c.answers.left.label)}</span>`;
    $('btnR').innerHTML = `<span>${esc(c.answers.right.label)}</span><span class="ar">→</span>`;
    $('clock').textContent = slot.time;
    $('gCareer').textContent = C ? `Неделя ${C.week}/${YEAR} · ${C.company}` : '';
    $('gDay').textContent = DAYS[d]; $('gPhase').textContent = ph.name.toLowerCase(); $('gNum').textContent = String(S.step + 1).padStart(2, '0');
    $('dots').innerHTML = S.deck.map((_, i) => `<i class="${i < S.step ? 'done' : i === S.step ? 'now' : ''}"></i>`).join('');
    clearPreview();
    if (S.step % 3 === 0 && splashFor !== S.step) { splashFor = S.step; showSplash(d); }
    board.touch('playing', S.step).catch(() => {});
  }

  // Заставка перед началом каждого дня
  function showSplash(d) {
    const el = $('splash');
    el.innerHTML = `<div class="splash-in"><small>${C ? `Неделя ${C.week} из ${YEAR} · ` : ''}День ${d + 1} из 5</small><h2>${DAYS[d]}</h2><p>${DAY_QUIP[d]}</p><span class="tap">нажмите, чтобы начать</span></div>`;
    el.hidden = false; splashOn = true;
    const close = () => { if (!splashOn) return; splashOn = false; el.hidden = true; clearTimeout(t); };
    const t = setTimeout(close, 2200);
    el.onclick = close;
  }

  const current = () => byId[S.deck[S.step].id];
  const answer = side => current().answers[side];

  function preview(side) {
    const eff = answer(side).effects;
    for (const r of RES) {
      const v = eff[r.k] || 0;
      $('mk-' + r.k).innerHTML = v > 0 ? `<span class="u">${v >= 20 ? '▲▲' : '▲'}</span>` : v < 0 ? `<span class="d">${v <= -20 ? '▼▼' : '▼'}</span>` : '';
    }
    $('card').dataset.hot = side;
    $('btnL').classList.toggle('hot', side === 'left'); $('btnR').classList.toggle('hot', side === 'right');
  }
  function clearPreview() {
    for (const r of RES) $('mk-' + r.k).innerHTML = '';
    delete $('card').dataset.hot; $('btnL').classList.remove('hot'); $('btnR').classList.remove('hot');
  }

  function choose(side) {
    if (busy || splashOn || !S) return;
    busy = true; sfx.swipe();
    const card = $('card'), dir = side === 'left' ? -1 : 1;
    card.style.transition = `transform .38s ${EASE}, opacity .38s`;
    card.style.transform = `translateX(${dir * 1100}px) rotate(${dir * 26}deg)`;
    card.style.opacity = '0';
    setTimeout(() => {
      const eff = answer(side).effects;
      for (const [k, v] of Object.entries(eff)) S.res[k] = clamp(S.res[k] + v);
      clearPreview(); renderBars();
      const dead = RES.find(r => S.res[r.k] <= 0);
      const best = store.get(KEY.best, { step: 0, wins: 0 });
      if (dead) { best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save); setTimeout(() => lose(dead.k), 450); return; } // busy остаётся до следующей недели
      S.step++;
      best.step = Math.max(best.step, S.step);
      if (S.step >= 15) { best.wins++; store.set(KEY.best, best); store.del(KEY.save); setTimeout(win, 350); return; }
      store.set(KEY.best, best); store.set(KEY.save, S);
      renderCard(); busy = false;
    }, 380);
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

  // ---------- финал ----------
  function finalGrid(zeroKey) {
    return `<div class="final">${RES.map(r => `<div class="${r.k === zeroKey ? 'zero' : ''}"><b>${S.res[r.k]}%</b><span>${r.name}</span></div>`).join('')}</div>`;
  }
  function nextButtons(primaryId, primaryText) {
    return `<div class="stack"><button class="btn-main" id="${primaryId}">${primaryText}</button>
      <button class="btn-ghost" id="toBoard">Рейтинг офиса</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>`;
  }
  function bindCommon() { $('toMenu').onclick = renderMenu; $('toBoard').onclick = () => openBoard('end', 'rating'); }

  function lose(k) {
    sfx.lose();
    const D = DEATH[k], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    const company = C.company;
    C.firings++; C.week++; C.stage = 'search'; C.res = null; saveCareer();
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Вас уволили · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()} · ${esc(company)}</span>
      <h1 class="lose">НЕДЕЛЯ ЗАВАЛЕНА</h1>
      <p class="cause">${D.title} · ${esc(S.name)}, ${PROF[S.prof].name.toLowerCase()}</p>
      <p>${D.text}</p>
      ${finalGrid(k)}
      <div class="place" id="place" aria-live="polite">Записываю результат в рейтинг…</div>
      ${C.week > YEAR ? nextButtons('next', 'Итоги года') : nextButtons('next', 'Искать работу')}
    </div>`;
    show('end'); bindCommon();
    $('next').onclick = () => C.week > YEAR ? yearEnd() : jobSearch();
    record(false, k);
    $('next').focus({ preventScroll: true });
  }
  function rank(total) { return total >= 280 ? 'Легенда опенспейса' : total >= 220 ? 'Сеньор по выживанию' : total >= 160 ? 'Крепкий мидл' : 'Чудом уцелевший стажёр'; }
  function win() {
    sfx.win();
    const total = RES.reduce((a, r) => a + S.res[r.k], 0), week = C.week;
    // выходные: каждая шкала сдвигается к 50 наполовину
    C.worked++; C.week++; C.res = Object.fromEntries(RES.map(r => [r.k, Math.round((S.res[r.k] + 50) / 2)])); saveCareer();
    const last = C.week > YEAR;
    if (last) confetti();
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Неделя ${week} из ${YEAR} · ${esc(C.company)} · пятница, 18:00</span>
      <h1>${last ? 'Год позади!' : 'Неделя закрыта!'}</h1>
      <p>${last ? 'Последняя пятница года. Выключайте ноутбук и посмотрите итоги.' : 'Выходные сгладят всё наполовину: в понедельник каждая шкала сдвинется к 50%.'}</p>
      <span class="rank">${rank(total)}</span>
      ${finalGrid()}
      <div class="total"><span>Счёт недели</span><b>${total} / 400</b></div>
      <div class="place" id="place" aria-live="polite">Записываю результат в рейтинг…</div>
      <div class="stack"><button class="btn-main" id="next">${last ? 'Итоги года' : `Неделя ${C.week} →`}</button>
        <button class="btn-ghost" id="share">Поделиться результатом</button>
        <button class="btn-ghost" id="toBoard">Рейтинг офиса</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end'); bindCommon();
    $('share').onclick = () => share(total);
    $('next').onclick = () => last ? yearEnd() : startWeek();
    record(true, null);
    $('next').focus({ preventScroll: true });
  }

  // Поиск работы: три вакансии, кроме места, откуда только что уволили
  function jobSearch() {
    if (C.week > YEAR) return yearEnd();
    if (!C.offers?.length) { C.offers = [...VACANCIES].filter(v => v.name !== C.company).sort(() => Math.random() - .5).slice(0, 3).map(v => v.id); saveCareer(); }
    const perkText = p => Object.entries(p).map(([k, v]) => `${RES.find(r => r.k === k).name} ${v > 0 ? '+' : '−'}${Math.abs(v)}`).join(' · ');
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Неделя ${C.week} из ${YEAR} · поиск работы</span>
      <h1>Вакансии</h1>
      <p>Выберите, куда откликнуться. Собеседование займёт неделю: 4 вопроса от HR.</p>
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
    const qs = [...INTERVIEW].sort(() => Math.random() - .5).slice(0, 3).concat(INTERVIEW_LAST);
    const need = { 1: 4, 2: 5, 3: 6 }[v.level];
    let i = 0, score = 0;
    const step = () => {
      const q = qs[i];
      views.end.innerHTML = `<div class="end-sheet glass">
        <span class="kicker">Неделя ${C.week} из ${YEAR} · собеседование · ${esc(v.name)}</span>
        <div class="iv-dots">${qs.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('')}</div>
        <div class="iv-q"><span class="who">HR · вопрос ${i + 1} из ${qs.length}</span><div class="text">${esc(q.q)}</div><div class="iv-reply" id="ivReply" aria-live="polite"></div></div>
        <div class="iv-answers">${[...q.a].sort(() => Math.random() - .5).map(a => `<button class="ans" data-s="${a.score}" data-r="${esc(a.reply)}">${esc(a.label)}</button>`).join('')}</div>
      </div>`;
      show('end');
      const btns = [...views.end.querySelectorAll('.iv-answers .ans')];
      btns.forEach(b => b.onclick = () => {
        btns.forEach(x => x.disabled = true); b.classList.add('picked');
        score += +b.dataset.s; $('ivReply').textContent = `HR: ${b.dataset.r}`; sfx.swipe();
        setTimeout(() => { i++; i < qs.length ? step() : verdict(); }, 1500);
      });
      btns[0].focus({ preventScroll: true });
    };
    const verdict = () => {
      const ok = score >= need;
      C.week++; C.offers = [];
      if (ok) { C.passed++; C.stage = 'work'; C.company = v.name; if (!C.companies.includes(v.name)) C.companies.push(v.name); C.res = freshRes(v.perk); sfx.win(); }
      else { C.failed++; sfx.lose(); }
      saveCareer();
      const over = C.week > YEAR;
      views.end.innerHTML = `<div class="end-sheet glass">
        <span class="kicker">Собеседование · ${esc(v.name)} · ${score} из ${qs.length * 2} баллов, нужно ${need}</span>
        <h1 class="${ok ? '' : 'lose'}">${ok ? 'Оффер!' : 'Мы вам перезвоним'}</h1>
        <p>${ok ? `${esc(v.name)} ждёт вас в понедельник. Новое место — свежий старт: шкалы снова около 50%.` : '…но не перезвонили. Поиск продолжается, впереди новые вакансии.'}</p>
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
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Год позади · ${YEAR} недель · ${esc(prefs.name)}, ${PROF[C.prof].name.toLowerCase()}</span>
      <h1>Итоги года</h1>
      <span class="rank">${yearRank(C.worked)}</span>
      <div class="career-card" style="width:100%">
        <div class="stat-box"><b>${C.worked}</b><span>недель отработано</span></div>
        <div class="stat-box"><b>${C.firings}</b><span>увольнений</span></div>
        <div class="stat-box"><b>${C.passed}/${all}</b><span>собеседований пройдено</span></div>
      </div>
      <p>Где вы успели поработать:</p>
      <ul class="companies">${C.companies.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      <div class="stack"><button class="btn-main" id="again">Новый год карьеры</button>
        <button class="btn-ghost" id="toBoard">Рейтинг офиса</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end'); bindCommon();
    $('again').onclick = () => { store.del(KEY.career); newCareer(); };
    if (C.worked >= 40) confetti();
  }

  // запись результата недели и место в рейтинге
  async function record(won, death) {
    const total = RES.reduce((a, r) => a + S.res[r.k], 0);
    const entry = { player_id: prefs.playerId, name: S.name.slice(0, 24), dept: (S.dept || '').slice(0, 24), prof: S.prof, won,
      step: won ? 15 : S.step, total, psyche: S.res.psyche, energy: S.res.energy, boss: S.res.boss, colleagues: S.res.colleagues, death };
    const el = () => $('place');
    try {
      await board.submit(entry);
      board.touch('finished', entry.step).catch(() => {});
      const list = await board.top(), tag = await myTag;
      const pos = list.findIndex(e => e.tag === tag) + 1;
      if (!el()) return;
      el().innerHTML = pos ? `<b>#${pos}</b><span>ваше место в рейтинге${board.online ? ' офиса' : ' на этом устройстве'} (лучшая неделя)</span>` : '<span>Результат записан в рейтинг</span>';
    } catch (err) {
      if (el()) el().textContent = `Не удалось записать результат: ${err.message}. Проверьте ключи в js/config.js.`;
    }
  }

  const resultText = e => e.won ? { main: `${e.total}/400`, sub: 'неделя закрыта' } :
    { main: `${DAYS[Math.floor(e.step / 3)].slice(0, 2)}, ${PHASES[e.step % 3].name.toLowerCase()}`, sub: `${RES.find(r => r.k === e.death)?.name || ''} 0%` };
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

  let boardFrom = 'menu', boardMode = 'rating', boardTimer = null;
  function openBoard(from, mode) {
    boardFrom = from; boardMode = mode; show('board');
    setPhase(from === 'end' ? document.body.dataset.phase : 'day'); renderBoard();
    clearInterval(boardTimer);
    boardTimer = setInterval(() => { if (views.board.hidden) clearInterval(boardTimer); else if (!document.hidden) renderBoard(true); }, 20000);
  }
  async function renderBoard(quiet) {
    const people = boardMode === 'people', onlyDept = $('onlyDept').checked;
    $('modeRating').setAttribute('aria-selected', !people); $('modePeople').setAttribute('aria-selected', people);
    $('boardTitle').textContent = people ? 'Участники' : 'Рейтинг офиса';
    $('boardNote').textContent = !board.online ? 'Общий офис ещё не подключён — показаны данные с этого устройства. Подключение: js/config.js.'
      : people ? 'Список обновляется каждые 20 секунд.' : 'Лучшая неделя каждого игрока.';
    const list = $('boardList');
    if (onlyDept && !prefs.dept) {
      $('boardSummary').textContent = '';
      list.innerHTML = '<div class="lb-empty"><span class="big">Нет отдела</span>Укажите свой отдел (кнопка «Изменить» в меню), чтобы видеть коллег по отделу.</div>'; return;
    }
    if (!quiet) list.innerHTML = '<div class="lb-empty">Загружаю…</div>';
    try {
      const dept = onlyDept ? prefs.dept : '', tag = await myTag;
      if (people) {
        const rows = await board.people(dept);
        const live = rows.filter(p => Date.now() - new Date(p.updated_at) < 10 * 60000);
        $('boardSummary').textContent = `Участников: ${rows.length} · в сети: ${live.length}`;
        if (!rows.length) { list.innerHTML = '<div class="lb-empty"><span class="big">Пусто</span>Пока никого нет.</div>'; return; }
        list.innerHTML = rows.map(p => `<div class="lb-row person${p.tag === tag ? ' me' : ''}">
          <span class="lb-ava" aria-hidden="true">${esc(p.avatar || '🙂')}</span>
          <span class="lb-who"><b>${esc(p.name)}${p.tag === tag ? ' (вы)' : ''}</b><small>${esc(p.dept || 'без отдела')}</small>
            <small class="lb-meta">недель: ${p.games || 0} · побед: ${p.wins || 0}${p.games ? ` · лучшее: ${p.best_won ? `${p.best_total}/400` : stepName(p.best_step)}` : ''}</small></span>
          <span class="lb-res">${personStatus(p)}</span></div>`).join('');
      } else {
        const rows = await board.top(dept);
        $('boardSummary').textContent = `В рейтинге: ${rows.length}`;
        if (!rows.length) { list.innerHTML = '<div class="lb-empty"><span class="big">Пусто</span>Пока никто не доиграл неделю. Станьте первым!</div>'; return; }
        list.innerHTML = rows.map((e, i) => { const r = resultText(e), medal = i < 3;
          return `<div class="lb-row${e.tag === tag ? ' me' : ''}">
            <span class="lb-pos${medal ? ' medal' : ''}">${String(i + 1).padStart(2, '0')}</span>
            <span class="lb-who"><b>${esc(e.avatar || PROF[e.prof]?.icon || '')} ${esc(e.name)}</b><small>${esc(e.dept || 'без отдела')} · ${PROF[e.prof]?.name || ''}</small></span>
            <span class="lb-res ${e.won ? 'won' : 'lost'}"><b>${r.main}</b><small>${r.sub}</small></span></div>`; }).join('');
      }
    } catch (err) {
      if (!quiet) list.innerHTML = `<div class="lb-empty"><span class="big">Нет связи</span>Не удалось загрузить данные: ${esc(err.message)}</div>`;
    }
  }
  $('boardBack').onclick = () => { clearInterval(boardTimer); boardFrom === 'end' ? show('end') : renderMenu(); };
  $('boardRefresh').onclick = () => renderBoard();
  $('modeRating').onclick = () => { boardMode = 'rating'; renderBoard(); };
  $('modePeople').onclick = () => { boardMode = 'people'; renderBoard(); };
  $('onlyDept').onchange = () => renderBoard();

  // конфетти
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

  // мем-карточка для соцсетей
  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; }
    ctx.fillText(line, x, y); return y + lh;
  }
  async function share(total) {
    try { await document.fonts.ready; } catch {}
    const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    // неоновая мем-карточка 1080 × 1350
    const glow = (c, b) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
    const bg = ctx.createRadialGradient(W * .15, H * 1.1, 0, W * .15, H * 1.1, 900);
    ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H);
    bg.addColorStop(0, 'rgba(178,107,255,.35)'); bg.addColorStop(1, 'rgba(178,107,255,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const bg2 = ctx.createRadialGradient(W * .9, -100, 0, W * .9, -100, 800);
    bg2.addColorStop(0, 'rgba(45,226,230,.3)'); bg2.addColorStop(1, 'rgba(45,226,230,0)'); ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#7df9ff'; glow('rgba(45,226,230,.9)', 20); ctx.font = '700 30px "JetBrains Mono", monospace'; ctx.fillText('ПЯТНИЦА · 18:00 · НЕДЕЛЯ ЗАКРЫТА', 80, 130);
    ctx.fillStyle = '#ffffff'; glow('rgba(255,59,212,.9)', 40); ctx.font = '800 118px Unbounded, "Arial Black", sans-serif'; ctx.fillText('НЕДЕЛЯ', 80, 290);
    ctx.fillStyle = '#ff3bd4'; ctx.fillText('ПРОЙДЕНА', 80, 420);
    glow('transparent', 0); ctx.fillStyle = '#d6d2ef'; ctx.font = '800 42px Nunito, sans-serif';
    let y = wrap(ctx, `${S.name}, ${PROF[S.prof].name.toLowerCase()}. 5 дней, 15 решений, 0 увольнений.`, 80, 540, W - 160, 60);
    y += 40;
    RES.forEach((r, i) => {
      const bx = 80, by = y + i * 100, bw = W - 160 - 220;
      const col = { psyche: '#b26bff', energy: '#c6f01a', boss: '#ff3b6b', colleagues: '#2de2e6' }[r.k];
      ctx.font = '800 38px Nunito, sans-serif'; ctx.fillStyle = '#f2f0ff'; ctx.fillText(r.name, bx, by + 38);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = .6; ctx.beginPath(); ctx.roundRect(bx, by + 54, bw, 32, 16); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = col; glow(col, 24); ctx.beginPath(); ctx.roundRect(bx + 5, by + 59, Math.max(22, (bw - 10) * S.res[r.k] / 100), 22, 11); ctx.fill(); glow('transparent', 0);
      ctx.fillStyle = '#7df9ff'; ctx.font = '700 48px "JetBrains Mono", monospace'; ctx.textAlign = 'right'; ctx.fillText(`${S.res[r.k]}%`, W - 80, by + 84); ctx.textAlign = 'left';
    });
    y += 4 * 100 + 30;
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(80, y, W - 160, 2);
    ctx.fillStyle = '#ffffff'; glow('rgba(255,59,212,.8)', 24); ctx.font = '700 40px "JetBrains Mono", monospace'; ctx.fillText(`СЧЁТ ${total}/400`, 80, y + 70);
    glow('rgba(212,255,58,.7)', 16); ctx.fillStyle = '#d4ff3a'; ctx.textAlign = 'right'; ctx.font = '900 36px Nunito, sans-serif'; ctx.fillText(rank(total), W - 80, y + 70); ctx.textAlign = 'left';
    glow('transparent', 0); ctx.font = '800 32px Nunito, sans-serif'; ctx.fillStyle = '#b9b4d6'; ctx.fillText('А ты доживёшь до пятницы?', 80, H - 90);
    const url = cv.toDataURL('image/png');
    const text = `Неделя пройдена, дотянул(а) до пятницы, 18:00! ${S.name}, ${PROF[S.prof].name.toLowerCase()}. Счёт ${total}/400 — «${rank(total)}». А ты доживёшь?`;
    const m = $('modal');
    m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-label="Мем-карточка">
      <img src="${url}" alt="Мем-карточка с результатом недели">
      <p>Нажмите и удерживайте картинку (на компьютере — правый клик → «Сохранить изображение»), чтобы отправить её в мессенджер.</p>
      <button class="btn-main" id="copyTxt">Скопировать текст</button>
      <div class="toast" id="toast" aria-live="polite"></div>
      <button class="btn-ghost" id="closeM">Закрыть</button></div>`;
    m.hidden = false;
    $('closeM').onclick = () => { m.hidden = true; $('share').focus(); };
    m.onclick = e => { if (e.target === m) m.hidden = true; };
    $('copyTxt').onclick = () => {
      navigator.clipboard.writeText(text).then(() => $('toast').textContent = 'Текст скопирован',
        () => { $('toast').textContent = text; });
    };
    $('copyTxt').focus();
  }

  prefs.name ? renderMenu() : renderJoin(false);
})();
