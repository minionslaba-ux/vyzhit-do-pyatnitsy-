(() => {
  // ---------- данные ----------
  const RES = [
    { k: 'psyche', name: 'Кукуха', icon: '🧠' },
    { k: 'energy', name: 'Энергия', icon: '☕' },
    { k: 'boss', name: 'Босс', icon: '💼' },
    { k: 'colleagues', name: 'Коллеги', icon: '🤝' },
  ];
  const PROF = {
    marketer:   { name: 'Маркетолог',  bonus: { colleagues: 15, psyche: -5 }, perk: 'Душа компании: Коллеги +15, Кукуха −5' },
    accountant: { name: 'Бухгалтер',   bonus: { boss: 15, energy: -5 },       perk: 'Ценный кадр: Босс +15, Энергия −5' },
    dev:        { name: 'Программист', bonus: { psyche: 15, colleagues: -5 }, perk: 'В наушниках: Кукуха +15, Коллеги −5' },
    sales:      { name: 'Продажник',   bonus: { energy: 15, psyche: -5 },     perk: 'На энтузиазме: Энергия +15, Кукуха −5' },
  };
  const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const DAYS_GEN = ['понедельника', 'вторника', 'среды', 'четверга', 'пятницы'];
  const PHASES = [
    { name: 'Утро', from: 9 * 60, to: 12 * 60 },
    { name: 'День', from: 12 * 60, to: 17 * 60 },
    { name: 'Вечер', from: 17 * 60, to: 19 * 60 },
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

  $('bars').innerHTML = RES.map(r => `<div class="stat" id="st-${r.k}">
      <div class="marker" id="mk-${r.k}"></div>
      <div class="tile"><div class="fill" id="fl-${r.k}"></div><span class="ico" aria-hidden="true">${r.icon}</span></div>
      <div class="pct" id="pc-${r.k}">50%</div><div class="nm">${r.name}</div></div>`).join('');

  function renderSound() { $('soundMenu').textContent = $('soundGame').textContent = prefs.sound ? '🔊' : '🔇'; }
  function toggleSound() { prefs.sound = !prefs.sound; store.set(KEY.prefs, prefs); renderSound(); }
  $('soundMenu').onclick = toggleSound; $('soundGame').onclick = toggleSound;

  // ---------- меню ----------
  function renderMenu() {
    $('name').value = prefs.name; $('prof').value = prefs.prof;
    $('perk').textContent = PROF[prefs.prof].perk;
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    $('record').textContent = best.wins ? `неделя пройдена · побед: ${best.wins}` :
      best.step ? `дожили до: ${DAYS[Math.floor(best.step / 3)]}, ${PHASES[best.step % 3].name.toLowerCase()}` : 'пока нет';
    let save = store.get(KEY.save, null);
    if (save && !save.deck?.every(x => byId[x.id])) { store.del(KEY.save); save = null; } // сохранение от старой колоды
    $('resume').hidden = !save;
    if (save) $('resume').textContent = `Продолжить: ${DAYS[Math.floor(save.step / 3)]}, ${PHASES[save.step % 3].name.toLowerCase()}`;
    renderSound(); show('menu');
  }
  $('prof').onchange = () => { prefs.prof = $('prof').value; $('perk').textContent = PROF[prefs.prof].perk; store.set(KEY.prefs, prefs); };
  $('name').oninput = () => { prefs.name = $('name').value.trim(); store.set(KEY.prefs, prefs); };
  $('start').onclick = () => newGame();
  $('resume').onclick = () => { S = store.get(KEY.save, null); if (S) enterGame(); };

  // ---------- игра ----------
  let S = null, busy = false;
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
    prefs.name = $('name').value.trim(); prefs.prof = $('prof').value; store.set(KEY.prefs, prefs);
    const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
    for (const [k, v] of Object.entries(PROF[prefs.prof].bonus)) res[k] = clamp(res[k] + v);
    S = { name: prefs.name || 'Сотрудник месяца', prof: prefs.prof, res, step: 0, deck: buildDeck(prefs.prof) };
    store.set(KEY.save, S);
    enterGame();
  }

  function enterGame() { show('game'); renderBars(); renderCard(); }

  function renderBars(delta) {
    for (const r of RES) {
      const v = S.res[r.k];
      $('fl-' + r.k).style.height = v + '%';
      $('fl-' + r.k).classList.toggle('low', v <= 20);
      $('pc-' + r.k).textContent = v + '%';
      if (delta && delta[r.k]) {
        const st = $('st-' + r.k), cls = delta[r.k] > 0 ? 'flash-up' : 'flash-down';
        st.classList.remove('flash-up', 'flash-down'); void st.offsetWidth; st.classList.add(cls);
      }
    }
  }

  function renderCard() {
    const slot = S.deck[S.step], c = byId[slot.id], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
    const card = $('card');
    card.style.transition = 'none'; card.style.transform = '';
    card.innerHTML = `<div class="who"><span>${esc(c.who)}</span>${c.random ? '<span class="rnd-tag">Случайное событие</span>' : ''}</div>
      <div class="cover" aria-hidden="true">${c.cover_image}</div>
      <div class="text">${esc(c.text)}</div>
      <div class="lbl l">${esc(c.answers.left.label)}</div><div class="lbl r">${esc(c.answers.right.label)}</div>`;
    card.classList.remove('enter'); void card.offsetWidth; card.classList.add('enter');
    $('btnL').innerHTML = `<small>← Влево</small><span>${esc(c.answers.left.label)}</span>`;
    $('btnR').innerHTML = `<small>Вправо →</small><span>${esc(c.answers.right.label)}</span>`;
    $('when').textContent = `${DAYS[d].toUpperCase()} | ${ph.name.toUpperCase()} (${slot.time})`;
    $('dots').innerHTML = S.deck.map((_, i) => `<i class="${i < S.step ? 'done' : i === S.step ? 'now' : ''} ${i && i % 3 === 0 ? 'gap' : ''}"></i>`).join('');
    clearPreview();
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
    if (busy || !S) return;
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
      if (busy) return; drag = true; pid = e.pointerId; x0 = e.clientX; dx = 0; t0 = performance.now();
      card.setPointerCapture(pid); card.style.transition = 'none';
    });
    card.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== pid) return;
      dx = e.clientX - x0;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      const a = Math.min(1, Math.max(0, (Math.abs(dx) - 20) / 70));
      card.querySelector('.lbl.l').style.opacity = dx < 0 ? a : 0;
      card.querySelector('.lbl.r').style.opacity = dx > 0 ? a : 0;
      if (Math.abs(dx) > 24) preview(dx < 0 ? 'left' : 'right'); else clearPreview();
    });
    const end = e => {
      if (!drag || e.pointerId !== pid) return; drag = false;
      const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) > 100 || (Math.abs(dx) > 45 && v > .6)) { choose(dx < 0 ? 'left' : 'right'); return; }
      card.style.transition = 'transform .25s cubic-bezier(.3,1.5,.5,1)'; card.style.transform = '';
      card.querySelectorAll('.lbl').forEach(l => l.style.opacity = 0); clearPreview();
    };
    card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
  })();

  for (const [id, side] of [['btnL', 'left'], ['btnR', 'right']]) {
    const b = $(id);
    b.addEventListener('mouseenter', () => !busy && preview(side));
    b.addEventListener('focus', () => !busy && preview(side));
    b.addEventListener('mouseleave', clearPreview);
    b.addEventListener('blur', clearPreview);
    b.addEventListener('click', () => choose(side));
  }
  document.addEventListener('keydown', e => {
    if (views.game.hidden || !$('modal').hidden) return;
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
    views.end.innerHTML = `<div class="end-sheet">
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
    views.end.innerHTML = `<div class="end-sheet">
      <div class="memo">Пятница, 18:00 · ${esc(S.name)}, ${PROF[S.prof].name.toLowerCase()}</div>
      <div class="big-ico" aria-hidden="true">🎉</div>
      <h1>ВЫ <span class="mark">ВЫЖИЛИ!</span></h1>
      <p>Ноутбук закрыт, уведомления выключены. Звание недели: <b>${rank(total)}</b>.</p>
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
    const cols = ['--accent', '--yes', '--no', '--ink'].map(v => cs.getPropertyValue(v).trim());
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
    const ink = '#17202a', paper = '#e9eeeb', hl = '#ffd84d';
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = ink; ctx.font = '700 30px "JetBrains Mono", monospace'; ctx.fillText('ПЯТНИЦА, 18:00 · ОТЧЁТ О ВЫЖИВАНИИ', 80, 120);
    ctx.fillStyle = hl; ctx.fillRect(72, 250, 640, 70);
    ctx.fillStyle = ink; ctx.font = '800 118px Unbounded, "Arial Black", sans-serif'; ctx.fillText('НЕДЕЛЯ', 80, 300);
    ctx.fillText('ПРОЙДЕНА', 80, 430);
    ctx.font = '500 44px "Golos Text", sans-serif';
    let y = wrap(ctx, `${S.name}, ${PROF[S.prof].name.toLowerCase()}. 5 дней, 15 решений, 0 увольнений.`, 80, 540, W - 160, 60);
    y += 40;
    RES.forEach((r, i) => {
      const bx = 80, by = y + i * 120, bw = W - 160 - 170;
      ctx.font = '600 38px "Golos Text", sans-serif'; ctx.fillStyle = ink; ctx.fillText(`${r.icon} ${r.name}`, bx, by + 38);
      ctx.fillStyle = '#cdd6d2'; ctx.fillRect(bx, by + 58, bw, 26);
      ctx.fillStyle = S.res[r.k] <= 20 ? '#d43f38' : ink; ctx.fillRect(bx, by + 58, bw * S.res[r.k] / 100, 26);
      ctx.fillStyle = ink; ctx.font = '700 52px "JetBrains Mono", monospace'; ctx.textAlign = 'right'; ctx.fillText(`${S.res[r.k]}%`, W - 80, by + 84); ctx.textAlign = 'left';
    });
    y += 4 * 120 + 30;
    ctx.fillStyle = ink; ctx.fillRect(80, y, W - 160, 4);
    ctx.font = '700 40px "JetBrains Mono", monospace'; ctx.fillText(`СЧЁТ ${total}/400`, 80, y + 70);
    ctx.textAlign = 'right'; ctx.font = '600 36px "Golos Text", sans-serif'; ctx.fillText(rank(total), W - 80, y + 70); ctx.textAlign = 'left';
    ctx.font = '700 30px "JetBrains Mono", monospace'; ctx.fillStyle = '#5d6a6f'; ctx.fillText('А ты доживёшь до пятницы?', 80, H - 80);
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
