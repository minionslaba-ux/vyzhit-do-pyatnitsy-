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
  const PHASE_ICO = ['🌅', '☀️', '🌆'];
  const DAY_QUIP = [
    'Неделя только началась. Кофе налит, нервы пока целы.',
    'Вчерашние письма никуда не делись. Их стало больше.',
    'Экватор недели. Половина пути до свободы.',
    'Четверг — это маленькая пятница. Держитесь.',
    'Последний рывок. До 18:00 рукой подать.',
  ];
  // Цвет сцены на карточке зависит от того, кто говорит
  const SPEAKER = { 'Босс': '#ff6b6b', 'Коллега': '#4d9bff', 'Коллеги': '#4d9bff', 'HR': '#ff7fc8', 'Клиент': '#a27bff',
    'Рабочий чат': '#22c3c3', 'Общий созвон': '#22c3c3', 'Рассылка': '#ff9a1f', 'Принтер': '#9aa5b8', 'Кухня': '#ffb347', 'Курьер': '#ffb347', 'Будильник': '#ffcf3f' };
  const SPEAKER_POOL = ['#ff6b6b', '#4d9bff', '#ff7fc8', '#a27bff', '#22c3c3', '#ff9a1f', '#5fd36b'];
  const speakerColor = who => SPEAKER[who] || SPEAKER_POOL[[...who].reduce((a, ch) => a + ch.charCodeAt(0), 0) % SPEAKER_POOL.length];

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
  const KEY = { save: 'vdp-save', best: 'vdp-best', prefs: 'vdp-prefs' };
  const prefs = Object.assign({ name: '', prof: 'marketer', sound: true }, store.get(KEY.prefs, {}));

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
  const views = { menu: $('menu'), game: $('game'), end: $('end') };
  const show = v => Object.entries(views).forEach(([k, el]) => el.hidden = k !== v);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const RING = 2 * Math.PI * 19;
  $('bars').innerHTML = RES.map(r => `<div class="stat" id="st-${r.k}" data-k="${r.k}">
      <div class="marker" id="mk-${r.k}"></div>
      <div class="ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="trk" cx="22" cy="22" r="19"/><circle class="val" id="fl-${r.k}" cx="22" cy="22" r="19" stroke-dasharray="${RING}" stroke-dashoffset="${RING / 2}"/></svg><span class="ico" aria-hidden="true">${r.icon}</span></div>
      <div class="pct" id="pc-${r.k}">50%</div><div class="nm">${r.name}</div></div>`).join('');

  // Силуэт города внизу экрана: одинаковый при каждом запуске
  (() => {
    let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let x = -4, out = '';
    while (x < 400) {
      const w = 22 + Math.floor(r() * 30), h = 34 + Math.floor(r() * 80);
      out += `<rect class="bld" x="${x}" y="${120 - h}" width="${w}" height="${h + 2}"/>`;
      for (let wy = 120 - h + 8; wy < 114; wy += 10) for (let wx = x + 5; wx < x + w - 6; wx += 8)
        if (r() > .3) out += `<rect class="win${r() > .45 ? ' lit' : ''}" x="${wx}" y="${wy}" width="4" height="5"/>`;
      x += w + 2 + Math.floor(r() * 4);
    }
    $('city').innerHTML = out;
  })();
  const setPhase = p => { document.body.dataset.phase = p; };

  function renderSound() { $('soundMenu').textContent = $('soundGame').textContent = prefs.sound ? '🔊' : '🔇'; }
  function toggleSound() { prefs.sound = !prefs.sound; store.set(KEY.prefs, prefs); renderSound(); }
  $('soundMenu').onclick = toggleSound; $('soundGame').onclick = toggleSound;

  // ---------- меню ----------
  $('profs').innerHTML = Object.entries(PROF).map(([k, p]) => `<label class="prof">
      <input type="radio" name="prof" value="${k}"><span class="pe" aria-hidden="true">${p.icon}</span><b>${p.name}</b><small>${p.perk}</small></label>`).join('');
  const getProf = () => document.querySelector('input[name=prof]:checked')?.value || 'marketer';

  function renderMenu() {
    $('name').value = prefs.name;
    const radio = document.querySelector(`input[name=prof][value=${prefs.prof}]`) || document.querySelector('input[name=prof]');
    radio.checked = true;
    setPhase('day');
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    $('record').textContent = best.wins ? `неделя пройдена · побед: ${best.wins}` :
      best.step ? `дожили до: ${DAYS[Math.floor(best.step / 3)]}, ${PHASES[best.step % 3].name.toLowerCase()}` : 'пока нет';
    let save = store.get(KEY.save, null);
    if (save && !save.deck?.every(x => byId[x.id])) { store.del(KEY.save); save = null; } // сохранение от старой колоды
    $('resume').hidden = !save;
    if (save) $('resume').textContent = `Продолжить: ${DAYS[Math.floor(save.step / 3)]}, ${PHASES[save.step % 3].name.toLowerCase()}`;
    renderSound(); show('menu');
  }
  $('profs').onchange = () => { prefs.prof = getProf(); store.set(KEY.prefs, prefs); };
  $('name').oninput = () => { prefs.name = $('name').value.trim(); store.set(KEY.prefs, prefs); };
  $('start').onclick = () => newGame();
  $('resume').onclick = () => { S = store.get(KEY.save, null); if (S) enterGame(); };

  // ---------- игра ----------
  let S = null, busy = false, splashOn = false, splashFor = -1;
  const clamp = v => Math.max(0, Math.min(100, v));
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  function buildDeck(prof) {
    const used = new Set(), deck = [], randomPack = [...RANDOM_CARDS]; // свежая копия на каждую неделю
    for (let i = 0; i < 15; i++) {
      const d = Math.floor(i / 3), ph = PHASES[i % 3];
      const ok = c => c.phase === ph.name && !used.has(c.id) && (!c.prof || c.prof === prof);
      const special = CARDS.filter(c => ok(c) && c.day === DAYS[d]);
      const pool = special.length ? special : CARDS.filter(c => ok(c) && !c.day);
      const standard = rnd(pool); used.add(standard.id);
      const card = getRandomCard(standard, randomPack);
      const span = (ph.to - ph.from - 20) / 5;
      deck.push({ id: card.id, time: card.time || fmt(ph.from + 10 + Math.floor(Math.random() * span) * 5) });
    }
    return deck;
  }

  function newGame() {
    prefs.name = $('name').value.trim(); prefs.prof = getProf(); store.set(KEY.prefs, prefs);
    const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
    for (const [k, v] of Object.entries(PROF[prefs.prof].bonus)) res[k] = clamp(res[k] + v);
    S = { name: prefs.name || 'Сотрудник месяца', prof: prefs.prof, res, step: 0, deck: buildDeck(prefs.prof) };
    splashFor = -1;
    store.set(KEY.save, S);
    enterGame();
  }

  function enterGame() { show('game'); splashFor = -1; renderBars(); renderCard(); }

  function renderBars(delta) {
    for (const r of RES) {
      const v = S.res[r.k];
      const st = $('st-' + r.k);
      $('fl-' + r.k).setAttribute('stroke-dashoffset', RING * (1 - v / 100));
      $('pc-' + r.k).textContent = v + '%';
      st.classList.toggle('danger', v <= 20);
      if (delta && delta[r.k]) {
        st.classList.remove('bump'); void st.offsetWidth; st.classList.add('bump');
        const pop = document.createElement('span');
        pop.className = 'pop ' + (delta[r.k] > 0 ? 'up' : 'down'); pop.textContent = delta[r.k] > 0 ? '▲' : '▼';
        st.appendChild(pop); setTimeout(() => pop.remove(), 900);
      }
    }
  }

  function renderCard() {
    const slot = S.deck[S.step], c = byId[slot.id], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    const card = $('card');
    card.style.transition = 'none'; card.style.transform = '';
    card.innerHTML = `<div class="scene" style="--sp:${speakerColor(c.who)}">
        ${c.random ? '<div class="rnd-tag">⚡ Случайное событие ⚡</div>' : ''}
        <div class="sticker" aria-hidden="true">${c.cover_image}</div>
        <div class="who">${esc(c.who)}</div></div>
      <div class="text">${esc(c.text)}</div>
      <div class="stamp l">${esc(c.answers.left.label)}</div><div class="stamp r">${esc(c.answers.right.label)}</div>`;
    card.classList.toggle('is-random', !!c.random);
    setPhase(PHASE_KEY[S.step % 3]);
    $('phIco').textContent = PHASE_ICO[S.step % 3];
    card.classList.remove('enter'); void card.offsetWidth; card.classList.add('enter');
    $('btnL').innerHTML = `<small>← Влево</small><span>${esc(c.answers.left.label)}</span>`;
    $('btnR').innerHTML = `<small>Вправо →</small><span>${esc(c.answers.right.label)}</span>`;
    $('when').textContent = `${DAYS[d].toUpperCase()} | ${ph.name.toUpperCase()} (${slot.time})`;
    $('dots').innerHTML = DAYS.map((dn, dd) => `<span class="wd${dd === d ? ' cur' : ''}"><em>${dn.slice(0, 2)}</em>${[0, 1, 2].map(p => { const i = dd * 3 + p;
      return `<i class="${i < S.step ? 'done' : i === S.step ? 'now' : ''}"></i>`; }).join('')}</span>`).join('');
    clearPreview();
    if (S.step % 3 === 0 && splashFor !== S.step) { splashFor = S.step; showSplash(d); }
  }

  // Заставка перед началом каждого дня
  function showSplash(d) {
    const el = $('splash');
    el.innerHTML = `<div class="splash-in"><small>День ${d + 1} из 5</small><h2>${DAYS[d]}</h2><p>${DAY_QUIP[d]}</p><span class="tap">нажмите, чтобы начать</span></div>`;
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
      const v = eff[r.k] || 0, m = $('mk-' + r.k);
      m.className = 'marker' + (v ? ' show ' + (v > 0 ? 'up' : 'down') + (Math.abs(v) >= 15 ? ' big' : '') : '');
      m.textContent = v ? (v > 0 ? '▲' : '▼') : '';
    }
  }
  function clearPreview() { for (const r of RES) { $('mk-' + r.k).className = 'marker'; } }

  function choose(side) {
    if (busy || splashOn || !S) return;
    busy = true; sfx.swipe();
    const card = $('card'), dir = side === 'left' ? -1 : 1;
    card.style.transition = 'transform .28s ease-in, opacity .28s';
    card.style.transform = `translateX(${dir * 140}%) rotate(${dir * 22}deg)`;
    card.style.opacity = '0';
    setTimeout(() => {
      card.style.opacity = '';
      const eff = answer(side).effects;
      for (const [k, v] of Object.entries(eff)) S.res[k] = clamp(S.res[k] + v);
      renderBars(eff);
      const dead = RES.find(r => S.res[r.k] <= 0);
      const best = store.get(KEY.best, { step: 0, wins: 0 });
      if (dead) { best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save); busy = false; setTimeout(() => lose(dead.k), 450); return; }
      S.step++;
      best.step = Math.max(best.step, S.step);
      if (S.step >= 15) { best.wins++; store.set(KEY.best, best); store.del(KEY.save); busy = false; setTimeout(win, 350); return; }
      store.set(KEY.best, best); store.set(KEY.save, S);
      renderCard(); busy = false;
    }, 280);
  }

  // свайп
  (() => {
    const card = $('card'); let x0 = 0, dx = 0, t0 = 0, drag = false, pid = null;
    card.addEventListener('pointerdown', e => {
      if (busy || splashOn) return; drag = true; pid = e.pointerId; x0 = e.clientX; dx = 0; t0 = performance.now();
      card.setPointerCapture(pid); card.style.transition = 'none';
    });
    card.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== pid) return;
      dx = e.clientX - x0;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      const a = Math.min(1, Math.max(0, (Math.abs(dx) - 20) / 70));
      card.querySelector('.stamp.l').style.opacity = dx < 0 ? a : 0;
      card.querySelector('.stamp.r').style.opacity = dx > 0 ? a : 0;
      if (Math.abs(dx) > 24) preview(dx < 0 ? 'left' : 'right'); else clearPreview();
    });
    const end = e => {
      if (!drag || e.pointerId !== pid) return; drag = false;
      const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) > 100 || (Math.abs(dx) > 45 && v > .6)) { choose(dx < 0 ? 'left' : 'right'); return; }
      card.style.transition = 'transform .25s cubic-bezier(.3,1.5,.5,1)'; card.style.transform = '';
      card.querySelectorAll('.stamp').forEach(l => l.style.opacity = 0); clearPreview();
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
    return `<div class="final">${RES.map(r => `<div class="${r.k === zeroKey ? 'zero' : ''}"><b>${S.res[r.k]}%</b><span>${r.icon} ${r.name}</span></div>`).join('')}</div>`;
  }
  function lose(k) {
    sfx.lose();
    const D = DEATH[k], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    views.end.innerHTML = `<div class="end-sheet panel">
      <div class="fired" aria-hidden="true">УВОЛЕН</div>
      <div class="memo">Приказ об увольнении · ${esc(S.name)}, ${PROF[S.prof].name.toLowerCase()}</div>
      <div class="big-ico" aria-hidden="true">${D.icon}</div>
      <h1 class="lose">НЕДЕЛЯ ЗАВАЛЕНА</h1>
      <p class="cause">${D.title} · ${DAYS[d]}, ${ph.name.toLowerCase()} (${S.deck[S.step].time})</p>
      <p>${D.text}</p>
      ${finalGrid(k)}
      <div class="stack"><button class="btn-main" id="retry">Попробовать снова</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end');
    $('retry').onclick = () => newGame(); $('toMenu').onclick = renderMenu;
    $('retry').focus({ preventScroll: true });
  }
  function rank(total) { return total >= 280 ? 'Легенда опенспейса' : total >= 220 ? 'Сеньор по выживанию' : total >= 160 ? 'Крепкий мидл' : 'Чудом уцелевший стажёр'; }
  function win() {
    sfx.win(); confetti();
    const total = RES.reduce((a, r) => a + S.res[r.k], 0);
    setPhase('evening');
    views.end.innerHTML = `<div class="end-sheet panel">
      <div class="memo">Пятница, 18:00 · ${esc(S.name)}, ${PROF[S.prof].name.toLowerCase()}</div>
      <div class="big-ico" aria-hidden="true">🎉</div>
      <h1>Вы <span class="hl">выжили!</span></h1>
      <p>Ноутбук закрыт, уведомления выключены. Звание недели: <span class="rank">${rank(total)}</span></p>
      ${finalGrid()}
      <div class="total"><span>Итоговый счёт</span><b>${total} / 400</b></div>
      <div class="stack"><button class="btn-main" id="share">Поделиться результатом</button><button class="btn-ghost" id="again">Ещё одна неделя</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end');
    $('share').onclick = () => share(total); $('again').onclick = () => newGame(); $('toMenu').onclick = renderMenu;
    $('share').focus({ preventScroll: true });
  }

  // конфетти
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('confetti'), ctx = cv.getContext('2d'), dpr = devicePixelRatio || 1;
    cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cs = getComputedStyle(document.documentElement);
    const cols = ['--sun', '--yes', '--no', '--res-psyche', '--res-boss', '--res-energy'].map(v => cs.getPropertyValue(v).trim());
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
    const ink = '#1d1433', hl = '#ffd23f';
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2c1a5e'); bg.addColorStop(.5, '#8a3f9a'); bg.addColorStop(1, '#ff8a5b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = ink; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.roundRect(48, 48, W - 96, H - 96, 48); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ink; ctx.font = '700 28px Unbounded, sans-serif'; ctx.fillText('ПЯТНИЦА, 18:00 · ОТЧЁТ О ВЫЖИВАНИИ', 80, 130);
    ctx.fillStyle = hl; ctx.fillRect(72, 330, 700, 120);
    ctx.fillStyle = ink; ctx.font = '900 112px Unbounded, "Arial Black", sans-serif'; ctx.fillText('НЕДЕЛЯ', 80, 290);
    ctx.fillText('ПРОЙДЕНА', 80, 425);
    ctx.font = '800 42px Nunito, sans-serif';
    let y = wrap(ctx, `${S.name}, ${PROF[S.prof].name.toLowerCase()}. 5 дней, 15 решений, 0 увольнений.`, 80, 540, W - 160, 60);
    y += 40;
    RES.forEach((r, i) => {
      const bx = 80, by = y + i * 100, bw = W - 160 - 220;
      const col = { psyche: '#b26bff', energy: '#ff9a1f', boss: '#2f7dff', colleagues: '#12c2a0' }[r.k];
      ctx.font = '800 38px Nunito, sans-serif'; ctx.fillStyle = ink; ctx.fillText(`${r.icon} ${r.name}`, bx, by + 38);
      ctx.fillStyle = '#ece8f6'; ctx.beginPath(); ctx.roundRect(bx, by + 56, bw, 28, 14); ctx.fill();
      ctx.fillStyle = S.res[r.k] <= 20 ? '#ff4d5e' : col; ctx.beginPath(); ctx.roundRect(bx, by + 56, Math.max(28, bw * S.res[r.k] / 100), 28, 14); ctx.fill();
      ctx.fillStyle = ink; ctx.font = '900 50px Unbounded, sans-serif'; ctx.textAlign = 'right'; ctx.fillText(`${S.res[r.k]}%`, W - 80, by + 84); ctx.textAlign = 'left';
    });
    y += 4 * 100 + 30;
    ctx.fillStyle = ink; ctx.fillRect(80, y, W - 160, 4);
    ctx.font = '900 38px Unbounded, sans-serif'; ctx.fillText(`СЧЁТ ${total}/400`, 80, y + 70);
    ctx.textAlign = 'right'; ctx.font = '900 36px Nunito, sans-serif'; ctx.fillText(rank(total), W - 80, y + 70); ctx.textAlign = 'left';
    ctx.font = '800 32px Nunito, sans-serif'; ctx.fillStyle = '#625b78'; ctx.fillText('А ты доживёшь до пятницы?', 80, H - 90);
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

  renderMenu();
})();
