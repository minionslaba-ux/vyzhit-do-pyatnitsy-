// Аттестация: тест из 25 вопросов (трудовое право, юриспруденция, договоры, налоги, ВЭД, математика, биология, химия,
// медицина, история, география, музыка, мода, профессии от кондуктора до космонавта). Банк — data/cert/ru.json (1500 вопросов),
// в английской версии — data/cert/en.json. Вопросы идут от простых к сложным: 8 лёгких, 9 средних, 8 трудных.
// Три подсказки на попытку, как в «Кто хочет стать миллионером»: 50 на 50, звонок другу, помощь зала.
// Сдано (18+ верных) — оклад +0,5 у.е. в день. Одна попытка в день (начатая и брошенная тоже считается). Только в карьере.
const CERT_N = 25, CERT_PASS = 18, CERT_MIX = [8, 9, 8];
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
  let i = 0, score = 0, lock = false;
  const done = () => certResult(C2, score, after);
  const render = () => {
    const q = qs[i], [ico, topic] = CERT_TOPICS[q.t] || ['❓', ''];
    m.innerHTML = `<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="cqText">
      <div class="cq-head"><b>📜 ${L(`Вопрос ${i + 1} из ${CERT_N}`, `Question ${i + 1} of ${CERT_N}`)}</b><span>✓ ${score} · ${L(`нужно ${CERT_PASS}`, `need ${CERT_PASS}`)}</span></div>
      <div class="cq-dots" aria-hidden="true">${qs.map((x, k) => `<i class="${k < i ? (x.right ? 'ok' : 'no') : k === i ? 'now' : ''} d${x.d}"></i>`).join('')}</div>
      <span class="cq-topic">${ico} ${esc(topic)} · ${['', L('лёгкий', 'easy'), L('средний', 'medium'), L('трудный', 'hard')][q.d]}</span>
      <p class="cq-text" id="cqText">${esc(q.q)}</p>
      <div class="cq-opts">${q.opts.map((o, k) => `<button type="button" class="cq-opt" data-k="${k}"><b>${'ABCD'[k]}</b><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="cq-help" id="cqHelp" aria-live="polite"></div>
      <div class="cq-life">
        <button type="button" class="cq-l" id="clHalf" ${life.half ? '' : 'disabled'}><b>50:50</b><small>${L('убрать два', 'remove two')}</small></button>
        <button type="button" class="cq-l" id="clCall" ${life.call ? '' : 'disabled'}><b>📞</b><small>${L('звонок другу', 'phone a friend')}</small></button>
        <button type="button" class="cq-l" id="clHall" ${life.hall ? '' : 'disabled'}><b>👥</b><small>${L('помощь зала', 'ask the audience')}</small></button></div>
      <button class="btn-link" type="button" id="cqQuit">${L('Сдаться (попытка сгорит)', 'Give up (attempt is lost)')}</button></div>`;
    m.hidden = false;
    const btns = [...m.querySelectorAll('.cq-opt')];
    btns.forEach(b => b.onclick = () => {
      if (lock) return; lock = true;
      const k = +b.dataset.k, right = k === q.ok; q.right = right; if (right) score++;
      b.classList.add(right ? 'ok' : 'no'); btns[q.ok].classList.add('ok');
      right ? sfx.coins?.() : sfx.sigh?.(); buzz(right ? 'item' : 'danger');
      setTimeout(() => { lock = false; i++; if (i >= CERT_N) done(); else render(); }, right ? 850 : 1500);
    });
    // 50 на 50: убрать два неверных
    $('clHalf').onclick = () => {
      if (!life.half) return; life.half = false; $('clHalf').disabled = true; sfx.item?.();
      shuffle([0, 1, 2, 3].filter(k => k !== q.ok)).slice(0, 2).forEach(k => { btns[k].disabled = true; btns[k].classList.add('gone'); });
    };
    // звонок другу: чем проще вопрос, тем увереннее и точнее друг
    $('clCall').onclick = () => {
      if (!life.call) return; life.call = false; $('clCall').disabled = true; sfx.sms?.();
      const live = btns.map((b, k) => k).filter(k => !btns[k].disabled), sure = [0, 0.92, 0.75, 0.58][q.d];
      const pick = Math.random() < sure ? q.ok : rnd(live.filter(k => k !== q.ok)), conf = Math.round((sure - 0.1 + Math.random() * 0.2) * 100);
      const [who, wf] = rnd(FRIENDS);
      $('cqHelp').innerHTML = `<div class="cq-call">📞 <b>${esc(who)}:</b> ${L(`«Хм… думаю, это <b>${'ABCD'[pick]}: ${esc(q.opts[pick])}</b>. Уверен${wf ? 'а' : ''} процентов на ${conf}.»`, `“Hmm… I think it’s <b>${'ABCD'[pick]}: ${esc(q.opts[pick])}</b>. I’m about ${conf}% sure.”`)}</div>`;
      say(L(`Думаю, это ${q.opts[pick]}`, `I think it's ${q.opts[pick]}`), { fem: !!wf });
    };
    // помощь зала: голоса зала, правильный ответ обычно лидирует
    $('clHall').onclick = () => {
      if (!life.hall) return; life.hall = false; $('clHall').disabled = true; sfx.item?.();
      const w = btns.map((b, k) => b.disabled ? 0 : k === q.ok ? [0, 60, 42, 30][q.d] + Math.random() * 20 : 5 + Math.random() * 22), sum = w.reduce((a, b) => a + b, 0);
      const pct = w.map(x => Math.round(x / sum * 100));
      $('cqHelp').innerHTML = `<div class="cq-hall">${pct.map((p, k) => `<div><i style="--h:${p}%"></i><b>${p}%</b><span>${'ABCD'[k]}</span></div>`).join('')}</div>`;
    };
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
