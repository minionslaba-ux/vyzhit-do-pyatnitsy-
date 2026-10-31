// Аттестация: тест из 25 вопросов (трудовое право, юриспруденция, договоры, налоги, ВЭД, математика, биология, химия,
// медицина, история, география, музыка, мода, профессии от кондуктора до космонавта). Банк — data/cert/ru.json (1500 вопросов),
// в английской версии — data/cert/en.json. Вопросы идут от простых к сложным: 8 лёгких, 9 средних, 8 трудных.
// 20 секунд на вопрос. Три подсказки, как в «Кто хочет стать миллионером»: 50 на 50, звонок другу, помощь зала —
// каждая один раз бесплатно, потом можно купить ещё: 3 у.е. с игрового счёта или пополнить счёт картой.
// Сдано (18+ верных) — оклад +0,5 у.е. в день. Одна попытка в день (начатая и брошенная тоже считается). Только в карьере.
const CERT_N = 25, CERT_PASS = 18, CERT_MIX = [8, 9, 8], CERT_TIME = 20, CERT_LIFE_PRICE = 3;
const CERT_TOPICS = {
  labor: ['⚖️', L('Трудовое право', 'Employment')], law: ['🏛️', L('Юриспруденция', 'Law')], contract: ['📝', L('Договорное право', 'Contracts')],
  tax: ['🧾', L('Налоги', 'Taxes')], ved: ['🚢', L('ВЭД', 'Foreign trade')], math: ['➗', L('Математика', 'Math')], bio: ['🧬', L('Биология', 'Biology')],
  chem: ['⚗️', L('Химия', 'Chemistry')], med: ['🩺', L('Медицина', 'Medicine')], history: ['📜', L('История', 'History')], geo: ['🌍', L('География', 'Geography')],
  music: ['🎵', L('Музыка', 'Music')], fashion: ['👗', L('Мода', 'Fashion')], jobs: ['👷', L('Профессии', 'Professions')],
};
const FRIENDS = L([['Серёга из IT', 0], ['Тётя Люба', 1], ['Однокурсник Витя', 0], ['Соседка Ира', 1], ['Бывший начальник', 0], ['Мама', 1], ['Друг детства Костя', 0], ['Бухгалтер Нина Петровна', 1]],
  [['Steve from IT', 0], ['Aunt Lucy', 1], ['Old classmate Vic', 0], ['Neighbor Irene', 1], ['Your ex-boss', 0], ['Mom', 1], ['Childhood friend Kevin', 0], ['Nina from Accounting', 1]]);
let certBank = null;
const certLoad = () => certBank ? Promise.resolve(certBank) : fetch(`data/cert/${EN ? 'en' : 'ru'}.json`).then(r => r.json()).then(b => (certBank = b));
const certCan = C2 => C2 && C2.week <= YEAR && C2.certDay !== today();
const certNextPay = C2 => PAY_BASE + PAY_CERT * ((C2.cert || 0) + 1);

// 25 вопросов: по сложности 8/9/8, тем — разнообразно (не больше 3 из одной), недавно заданные — не повторяем
function certPick(bank) {
  const seen = new Set(store.get('vdp-cert-seen', []));
  const out = [], per = {};
  CERT_MIX.forEach((n, i) => {
    let pool = shuffle(bank.map((q, id) => ({ ...q, id })).filter(q => q.d === i + 1 && !seen.has(q.id)));
    if (pool.length < n * 2) pool = shuffle(bank.map((q, id) => ({ ...q, id })).filter(q => q.d === i + 1));  // круг пройден — начинаем заново
    for (const q of pool) { if (out.filter(x => x.d === i + 1).length >= n) break; if ((per[q.t] || 0) >= 3) continue; per[q.t] = (per[q.t] || 0) + 1; out.push(q); }
    for (const q of pool) { if (out.filter(x => x.d === i + 1).length >= n) break; if (!out.includes(q)) out.push(q); }  // если тем не хватило
  });
  const keep = [...seen, ...out.map(q => q.id)].slice(-Math.floor(bank.length * 0.7));
  store.set('vdp-cert-seen', keep);
  return out.map(q => { const order = shuffle([0, 1, 2, 3]); return { ...q, opts: order.map(k => q.a[k]), ok: order.indexOf(0) }; });
}

// Предложение пройти аттестацию (после недели, раз в день)
function certOffer() {
  const C2 = careerNow(); if (!certCan(C2)) return;
  if (prefs.certOffer === today()) return;
  prefs.certOffer = today(); store.set(KEY.prefs, prefs);
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="coTitle"><span class="lvl-ico" aria-hidden="true">📜</span>
    <h2 id="coTitle">${L('Хотите зарабатывать больше?', 'Want to earn more?')}</h2>
    <p>${L(`Сдайте аттестацию — 25 вопросов из разных областей. Ответите верно на ${CERT_PASS}+ — оклад вырастет с ${money(C2.salary)} до ${money(certNextPay(C2))} в день. Есть три подсказки: 50 на 50, звонок другу и помощь зала.`, `Pass the certification — 25 questions on all sorts of topics. Get ${CERT_PASS}+ right and your pay goes up from ${money(C2.salary)} to ${money(certNextPay(C2))} a day. Three lifelines: 50:50, phone a friend and ask the audience.`)}</p>
    <button class="btn-main" type="button" id="coGo">📜 ${L('Пройти аттестацию', 'Take the exam')}</button>
    <button class="btn-ghost" type="button" id="coLater">${L('Не сейчас', 'Not now')}</button></div>`;
  m.hidden = false;
  $('coGo').onclick = () => { m.hidden = true; certStart(); };
  $('coLater').onclick = () => { m.hidden = true; };
}
bus.on('weekEnd', x => { if (x.mode === 'career' && x.won) setTimeout(() => { if ($('modal').hidden && !views.end.hidden) certOffer(); }, 5200); });

async function certStart(after) {
  const C2 = payFix(careerNow());
  if (!C2) return toast(L('Аттестация — для карьеры: начните её кнопкой «Играть»', 'Certification is part of Career mode — press Play to start one'));
  if (!certCan(C2)) return toast(L('Аттестацию можно проходить раз в день. Возвращайтесь завтра!', 'You can take the exam once a day. Come back tomorrow!'));
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box"><p>${L('Готовим вопросы…', 'Preparing the questions…')}</p></div>`; m.hidden = false;
  let bank; try { bank = await certLoad(); } catch { m.hidden = true; return toast(L('Не удалось загрузить вопросы — проверьте интернет', 'Couldn’t load the questions — check your connection')); }
  C2.certDay = today(); careerSave(C2);  // попытка засчитана сразу — переигрывать нельзя
  track('cert_start', { detail: String(C2.cert || 0) });
  const qs = certPick(bank), life = { half: true, call: true, hall: true };
  let i = 0, score = 0, lock = false, left = CERT_TIME, away = false, warned = false, last = performance.now();
  const stop = () => clearInterval(tick);
  const done = () => { stop(); certResult(C2, score, after); };
  // ответ (k = −1 — время вышло): подсветить верный, через секунду — следующий вопрос с новым таймером
  const answer = k => {
    if (lock) return; lock = true;
    const q = qs[i], btns = [...m.querySelectorAll('.cq-opt')], right = k === q.ok; q.right = right; if (right) score++;
    if (k >= 0) btns[k].classList.add(right ? 'ok' : 'no'); btns[q.ok]?.classList.add('ok');
    if (k < 0) $('cqHelp').innerHTML = `<div class="cq-call">⏱ ${L('Время вышло — ответ не засчитан', 'Time’s up — no answer counted')}</div>`;
    right ? sfx.coins?.() : sfx.sigh?.(); buzz(right ? 'item' : 'danger');
    setTimeout(() => { lock = false; i++; left = CERT_TIME; warned = false; if (i >= CERT_N) done(); else render(); }, right ? 850 : 1500);
  };
  // таймер 20 секунд на вопрос; пауза, пока открыто пополнение баланса или вкладка свёрнута
  const tick = setInterval(() => {
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (!$('cqTime')) return;
    if (lock || away || document.hidden || window.vdpPaused) return;
    left = Math.max(0, left - dt);
    const el = $('cqTime'), bar = $('cqBar');
    el.textContent = `⏱ ${Math.ceil(left)}`; el.classList.toggle('warn', left <= 5); bar.style.width = `${left / CERT_TIME * 100}%`;
    if (left <= 5 && !warned) { warned = true; sfx.buzzer?.(); }
    if (left <= 0) answer(-1);
  }, 200);
  // подсказки: по одной бесплатно; использованную можно купить ещё раз — 3 у.е. с игрового счёта или картой (пополнение)
  const buyLife = (key, use) => {
    if (C2.bank >= CERT_LIFE_PRICE) {
      C2.bank -= CERT_LIFE_PRICE; C2.spent = (C2.spent || 0) + CERT_LIFE_PRICE; careerSave(C2);
      track('cert_life_buy', { detail: key });
      toast(L(`Подсказка куплена: −${money(CERT_LIFE_PRICE)} · на счёте ${money(C2.bank)}`, `Lifeline bought: −${money(CERT_LIFE_PRICE)} · balance ${money(C2.bank)}`));
      use();
    } else if (window.VDP_PLATFORM) toast(L(`Подсказка стоит ${money(CERT_LIFE_PRICE)} — на счёте не хватает`, `A lifeline costs ${money(CERT_LIFE_PRICE)} — not enough balance`));
    else {
      away = true;
      openTopup({ need: lackOf(CERT_LIFE_PRICE), why: L(`Подсказка в аттестации — ${money(CERT_LIFE_PRICE)} · на счёте ${money(C2.bank)} · таймер на паузе`, `An exam lifeline costs ${money(CERT_LIFE_PRICE)} · you have ${money(C2.bank)} · the timer is paused`),
        then: () => { away = false; last = performance.now(); Object.assign(C2, payFix(careerNow()) || {}); render(); } });
    }
  };
  const lifeBtn = (key, id, ico, label) => {
    const q = qs[i], usedHere = key === 'half' ? !!q.gone : false;
    return `<button type="button" class="cq-l${life[key] ? '' : ' buy'}" id="${id}" ${usedHere ? 'disabled' : ''}><b>${ico}</b><small>${life[key] ? label : L(`ещё раз · ${money(CERT_LIFE_PRICE)}`, `again · ${money(CERT_LIFE_PRICE)}`)}</small></button>`;
  };
  const render = () => {
    const q = qs[i], [ico, topic] = CERT_TOPICS[q.t] || ['❓', ''];
    m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="cqText">
      <div class="cq-head"><b>📜 ${L(`Вопрос ${i + 1} из ${CERT_N}`, `Question ${i + 1} of ${CERT_N}`)}</b><span class="cq-time" id="cqTime" role="timer">⏱ ${Math.ceil(left)}</span><span>✓ ${score} · ${L(`нужно ${CERT_PASS}`, `need ${CERT_PASS}`)}</span></div>
      <div class="cq-timer"><i id="cqBar" style="width:${left / CERT_TIME * 100}%"></i></div>
      <div class="cq-dots" aria-hidden="true">${qs.map((x, k) => `<i class="${k < i ? (x.right ? 'ok' : 'no') : k === i ? 'now' : ''} d${x.d}"></i>`).join('')}</div>
      <span class="cq-topic">${ico} ${esc(topic)} · ${['', L('лёгкий', 'easy'), L('средний', 'medium'), L('трудный', 'hard')][q.d]}</span>
      <p class="cq-text" id="cqText">${esc(q.q)}</p>
      <div class="cq-opts">${q.opts.map((o, k) => `<button type="button" class="cq-opt${q.gone?.includes(k) ? ' gone' : ''}" data-k="${k}" ${q.gone?.includes(k) ? 'disabled' : ''}><b>${'ABCD'[k]}</b><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="cq-help" id="cqHelp" aria-live="polite">${q.help || ''}</div>
      <div class="cq-life">${lifeBtn('half', 'clHalf', '50:50', L('убрать два', 'remove two'))}${lifeBtn('call', 'clCall', '📞', L('звонок другу', 'phone a friend'))}${lifeBtn('hall', 'clHall', '👥', L('помощь зала', 'ask the audience'))}</div>
      <p class="field-note cq-note">${L(`${CERT_TIME} секунд на вопрос. Подсказки — по одной бесплатно, потом по ${money(CERT_LIFE_PRICE)} (на счёте ${money(C2.bank)}).`, `${CERT_TIME} seconds per question. One free use of each lifeline, then ${money(CERT_LIFE_PRICE)} each (balance ${money(C2.bank)}).`)}</p>
      <button class="btn-link" type="button" id="cqQuit">${L('Сдаться (попытка сгорит)', 'Give up (attempt is lost)')}</button></div>`;
    m.hidden = false;
    const btns = [...m.querySelectorAll('.cq-opt')];
    btns.forEach(b => b.onclick = () => answer(+b.dataset.k));
    // 50 на 50: убрать два неверных
    const half = () => { life.half = false; sfx.item?.(); q.gone = shuffle([0, 1, 2, 3].filter(k => k !== q.ok)).slice(0, 2); render(); };
    // звонок другу: чем проще вопрос, тем увереннее и точнее друг
    const call = () => {
      life.call = false; sfx.sms?.();
      const live = [0, 1, 2, 3].filter(k => !q.gone?.includes(k)), sure = [0, 0.92, 0.75, 0.58][q.d];
      const pick = Math.random() < sure ? q.ok : rnd(live.filter(k => k !== q.ok)), conf = Math.round((sure - 0.1 + Math.random() * 0.2) * 100);
      const [who, wf] = rnd(FRIENDS);
      q.help = `<div class="cq-call">📞 <b>${esc(who)}:</b> ${L(`«Хм… думаю, это <b>${'ABCD'[pick]}: ${esc(q.opts[pick])}</b>. Уверен${wf ? 'а' : ''} процентов на ${conf}.»`, `“Hmm… I think it’s <b>${'ABCD'[pick]}: ${esc(q.opts[pick])}</b>. I’m about ${conf}% sure.”`)}</div>`;
      say(L(`Думаю, это ${q.opts[pick]}`, `I think it's ${q.opts[pick]}`), { fem: !!wf });
      render();
    };
    // помощь зала: голоса зала, правильный ответ обычно лидирует
    const hall = () => {
      life.hall = false; sfx.item?.();
      const w = [0, 1, 2, 3].map(k => q.gone?.includes(k) ? 0 : k === q.ok ? [0, 60, 42, 30][q.d] + Math.random() * 20 : 5 + Math.random() * 22), sum = w.reduce((a, b) => a + b, 0);
      q.help = `<div class="cq-hall">${w.map((x, k) => `<div><i style="--h:${Math.round(x / sum * 100)}%"></i><b>${Math.round(x / sum * 100)}%</b><span>${'ABCD'[k]}</span></div>`).join('')}</div>`;
      render();
    };
    for (const [id, key, use] of [['clHalf', 'half', half], ['clCall', 'call', call], ['clHall', 'hall', hall]])
      $(id).onclick = () => { if (lock) return; life[key] ? use() : buyLife(key, use); };
    $('cqQuit').onclick = () => { score = Math.min(score, CERT_PASS - 1); done(); };
  };
  render();
}

function certResult(C2, score, after) {
  const m = $('modal'), ok = score >= CERT_PASS, before = C2.salary;
  if (ok) { C2.cert = (C2.cert || 0) + 1; C2.salary = PAY_BASE + PAY_CERT * C2.cert; }
  careerSave(C2);
  track('cert_end', { detail: `${score}:${ok ? 1 : 0}` });
  m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="crTitle"><span class="lvl-ico" aria-hidden="true">${ok ? '🎓' : '📕'}</span>
    <h2 id="crTitle">${ok ? L('Аттестация сдана!', 'Exam passed!') : L('Не сдано', 'Not passed')}</h2>
    <p class="cr-score"><b>${score}</b> / ${CERT_N}</p>
    <p>${ok ? L(`Оклад вырос: ${money(before)} → <b>${money(C2.salary)}</b> в день. Сданных аттестаций: ${C2.cert}.`, `Pay raise: ${money(before)} → <b>${money(C2.salary)}</b> a day. Exams passed: ${C2.cert}.`)
      : L(`Нужно минимум ${CERT_PASS} верных ответов. Новая попытка — завтра, вопросы будут другие.`, `You need at least ${CERT_PASS} right answers. Try again tomorrow — with new questions.`)}</p>
    <button class="btn-main" type="button" id="crOk">${L('Готово', 'Done')}</button></div>`;
  m.hidden = false;
  if (ok) { sfx.win?.(); confetti(); } else sfx.lose?.();
  if (C2.hero) { const t = lineFor(ok ? 'cert_pass' : 'cert_fail', heroFem(C2.hero)); m.querySelector('#crOk').insertAdjacentHTML('beforebegin', `<p class="hero-says">💬 ${esc(C2.hero.name)}: «${esc(t)}»</p>`); setTimeout(() => say(t, heroVoice(C2.hero)), 700); }
  $('crOk').onclick = () => { m.hidden = true; if (!views.menu.hidden) renderMenu(); after?.(); };
}

// Кнопка для меню (карточка карьеры)
const certBtnHtml = C2 => !C2 || C2.week > YEAR ? '' : certCan(C2)
  ? `<button class="btn-ghost btn-cert" type="button" id="certBtn" style="grid-column:1/-1">📜 ${L(`Аттестация: оклад ${money(C2.salary || PAY_BASE)} → ${money(certNextPay(C2))}`, `Certification: pay ${money(C2.salary || PAY_BASE)} → ${money(certNextPay(C2))}`)}</button>`
  : `<button class="btn-ghost btn-cert" type="button" disabled style="grid-column:1/-1">📜 ${L('Аттестация — снова завтра', 'Certification — again tomorrow')}${C2.cert ? L(` · сдано: ${C2.cert}`, ` · passed: ${C2.cert}`) : ''}</button>`;
