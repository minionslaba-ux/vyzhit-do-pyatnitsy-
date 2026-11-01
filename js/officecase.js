// «Дело недели» — кооперативный детектив для офиса (команды живых игроков).
// Каждую московскую неделю у офиса одно дело из data/office_cases.json (номер выбирает сервер по id офиса и неделе).
// Подозреваемые — выдуманные персонажи, реальных коллег никто не обвиняет. У каждого участника 1–2 СВОИ улики
// (по порядку вступления в офис), поэтому разгадать дело можно только вместе: делитесь уликами в чате офиса.
// Голос — один на неделю, его можно менять, пока дело открыто. Дело закрывается, когда проголосовали 60% офиса
// (минимум двое), или в воскресенье в 23:59 МСК. Награда: +1 у.е. за голос, +5 у.е. за верный ответ (после ответа сервера).
// Сервер: supabase/update-2026-11-02-office-case.sql (office_case_state, office_case_vote, office_case_claim).
// Разметка: блок #ocBox на экране «Мой офис» (js/ui-menu.js → ocRenderBox) и баннер в меню над «Мой офис».

let ocData = null, ocLoading = null, ocLast = null, ocClaiming = false;
const ocLang = () => EN ? 'en' : 'ru';
const ocTx = o => (o && (o[ocLang()] || o.ru)) || '';
const ocLoad = () => ocData ? Promise.resolve(ocData) : ocLoading || (ocLoading = (window.OFFICE_CASES_JSON ? Promise.resolve(window.OFFICE_CASES_JSON)
  : fetch('data/office_cases.json').then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }))
  .then(d => (ocData = d)).finally(() => { ocLoading = null; }));
const ocCase = st => ocData && ocData.cases[((st.case_no % ocData.cases.length) + ocData.cases.length) % ocData.cases.length];
// Свои улики: две подряд, сдвиг — по неделе и месту игрока в офисе (у соседей по офису — разные улики)
function ocMyClues(st, cs) {
  const n = cs.clues.length, off = (st.week_no || 0) % n, slot = Math.max(0, st.my_slot || 0);
  const a = (off + 2 * slot) % n, b = (off + 2 * slot + 1) % n;
  return a === b ? [a] : [a, b];
}
const ocTrait = id => { const t = ocData?.traits?.[id]; return t ? `<span class="oc-chip">${t.ico} ${esc(t[ocLang()] || t.ru)}</span>` : ''; };
const ocSusName = s => `${esc(ocTx(s.name))}`;
const ocLeft = st => {
  const ms = new Date(st.closes_at) - Date.now(), h = Math.max(0, Math.floor(ms / 3600e3));
  return h >= 48 ? L(`ещё ${Math.floor(h / 24)} дн.`, `${Math.floor(h / 24)} days left`) : h >= 1 ? L(`ещё ${h} ч`, `${h}h left`) : L('меньше часа', 'under an hour');
};
const ocState = () => board.rpc('office_case_state', { p_id: prefs.playerId });

// Награда за закрытое дело: сервер отдаёт сумму один раз, деньги — на счёт карьеры
async function ocClaim() {
  if (ocClaiming || !registered() || !board.online) return 0;
  ocClaiming = true;
  try {
    const n = +(await board.rpc('office_case_claim', { p_id: prefs.playerId })) || 0;
    if (n > 0) {
      addCash(n); sfx.coins?.();
      toast(L(`🕵️ Дело недели: +${money(n)} на счёт`, `🕵️ Case of the week: +${money(n)} to your balance`));
      track('ocase_reward', { detail: String(n) });
    }
    return n;
  } catch { return 0; } finally { ocClaiming = false; }
}

// ---------- экран «Мой офис» ----------
async function ocRenderBox(team, members) {
  const box = $('ocBox'); if (!box) return;
  const head = `<span class="kicker oc-kick">🕵️ ${L('Дело недели', 'Case of the week')}</span>`;
  if (!team) {  // офиса нет — коротко, что это такое
    box.innerHTML = `${head}<p class="field-note">${L('В офисе каждую неделю — новое дело: кто съел торт, кто сломал принтер… У каждого коллеги свои улики, разгадываете вместе в чате офиса.', 'Every week your office gets a new case: who ate the cake, who broke the printer… Each coworker holds different clues — you crack it together in the office chat.')}</p>`;
    box.hidden = false; return;
  }
  box.innerHTML = `${head}<p class="field-note">${L('Загружаю…', 'Loading…')}</p>`; box.hidden = false;
  let st;
  try { [st] = await Promise.all([ocState(), ocLoad()]); }
  catch (err) { box.innerHTML = `${head}<p class="field-note">${L('Дело пока не загрузилось', 'Couldn’t load the case')}: ${esc(err.message)}</p>`; return; }
  if (!box.isConnected) return;
  ocLast = st;
  if (!st || !st.team) { box.hidden = true; return; }
  const cs = ocCase(st); if (!cs) { box.hidden = true; return; }
  if (st.members < 2) {  // офис из одного человека — сначала позвать коллег
    box.innerHTML = `${head}<h2 class="oc-title">${cs.ico} ${esc(ocTx(cs.title))}</h2>
      <p class="oc-intro">${esc(ocTx(cs.intro))}</p>
      <div class="oc-solo"><b>${L('Расследовать в одиночку нельзя', 'This case needs a team')}</b>
      <span>${L('Улики раздаются всем участникам офиса — у каждого свои. Позовите хотя бы одного коллегу, и дело откроется.', 'Clues are split between office members — everyone gets different ones. Invite at least one coworker to open the case.')}</span></div>
      <button class="btn-main" type="button" id="ocInvite">👥 ${L('Позвать коллег', 'Invite coworkers')}</button>`;
    $('ocInvite').onclick = () => openShare('team');
    return;
  }
  ocDraw(box, st, cs);
  if (st.closed && st.my_vote != null && !st.my_rewarded) ocClaim().then(n => { if (n && $('ocReward')) $('ocReward').textContent = L(`Награда получена: +${money(n)}`, `Reward received: +${money(n)}`); });
}

function ocDraw(box, st, cs) {
  const head = `<span class="kicker oc-kick">🕵️ ${L('Дело недели', 'Case of the week')}${st.closed ? '' : ` · ${ocLeft(st)}`}</span>`;
  const tally = st.tally || [], closed = !!st.closed, mine = ocMyClues(st, cs);
  const sus = cs.suspects.map((s, i) => {
    const me = st.my_vote === i, guilty = closed && st.culprit === i;
    return `<button type="button" class="oc-sus${me ? ' me' : ''}${guilty ? ' guilty' : ''}${closed && !guilty ? ' cleared' : ''}" data-sus="${i}"${closed ? ' disabled' : ''} aria-pressed="${me}">
      <span class="oc-ava" aria-hidden="true">${s.ico}</span>
      <span class="oc-who"><b>${ocSusName(s)}</b><small>${esc(ocTx(s.role))} · <i class="npc-tag">🤖 ${L('персонаж', 'character')}</i></small><span class="oc-chips">${s.traits.map(ocTrait).join('')}</span></span>
      <span class="oc-mark">${closed ? `${guilty ? `<em class="oc-stamp">${L('Виновен!', 'Guilty!')}</em>` : ''}<small>${pl(tally[i] || 0, 'голос', 'голоса', 'голосов', 'vote', 'votes')}</small>` : me ? `<em class="oc-mine">✔ ${L('ваш голос', 'your vote')}</em>` : `<small class="oc-pick">${L('Голосовать', 'Vote')}</small>`}</span></button>`;
  }).join('');
  const clues = mine.map(k => `<div class="oc-clue"><span class="oc-clue-t">🔎 ${esc(ocTx(cs.clues[k]))}</span>
    ${closed ? '' : `<button type="button" class="btn-ghost oc-share" data-clue="${k}">💬 ${L('Поделиться уликой в чате', 'Share this clue in chat')}</button>`}</div>`).join('');
  const progress = closed ? '' : `<p class="oc-prog"><span class="oc-bar"><i style="width:${Math.min(100, Math.round(100 * st.voted / Math.max(1, st.need)))}%"></i></span>
    ${L(`Проголосовали ${st.voted} из ${st.members}. Дело закроется при ${st.need} голосах или в воскресенье в 23:59 (МСК).`, `${st.voted} of ${st.members} voted. The case closes at ${st.need} votes or on Sunday at 23:59 (Moscow time).`)}</p>`;
  let result = '';
  if (closed) {
    const cul = cs.suspects[st.culprit] || {}, voters = st.voters || [], right = voters.filter(v => v.right);
    const myRight = st.my_vote != null && st.my_vote === st.culprit;
    result = `<div class="oc-result${st.solved ? ' solved' : ''}">
      <b class="oc-res-h">${st.solved ? L('🎉 Офис раскрыл дело!', '🎉 Your office cracked the case!') : L('🌀 Дело закрыто, но не раскрыто', '🌀 Case closed — but not cracked')}</b>
      <span>${L('Виновный', 'The culprit')}: <b>${cul.ico || ''} ${ocSusName(cul)}</b> (${esc(ocTx(cul.role))}). ${st.solved ? L('Большинство указало верно.', 'The majority got it right.') : L('Большинство подозревало другого — в следующий раз делитесь уликами активнее!', 'The majority suspected someone else — share more clues next time!')}</span>
      <div class="oc-voters">${voters.map(v => `<span class="oc-voter${v.right ? ' ok' : ''}${v.is_me ? ' me' : ''}">${v.right ? '✅' : '❌'} ${esc(v.avatar || '🙂')} ${esc(v.name)}${v.is_me ? L(' (вы)', ' (you)') : ''} → ${ocSusName(cs.suspects[v.suspect] || {})}</span>`).join('')}</div>
      <span class="oc-guess">${right.length ? L(`Угадали: ${right.length} из ${voters.length}.`, `Guessed right: ${right.length} of ${voters.length}.`) : L('Никто не угадал — преступник оказался хитрее.', 'Nobody guessed — the culprit was too clever.')}</span>
      ${st.my_vote == null ? `<span class="oc-rw">${L('Вы не успели проголосовать — новое дело в понедельник.', 'You didn’t vote this time — a new case arrives on Monday.')}</span>`
        : `<span class="oc-rw" id="ocReward">${st.my_rewarded ? L('Награда за это дело уже на счёте.', 'Your reward for this case is already in your balance.') : myRight ? L(`Вы угадали: +${money(6)} (+1 за голос и +5 за верный ответ).`, `You got it: +${money(6)} (+1 for voting, +5 for the right answer).`) : L(`+${money(1)} за участие в расследовании.`, `+${money(1)} for joining the investigation.`)}</span>`}
    </div>`;
  }
  box.innerHTML = `${head}
    <h2 class="oc-title">${cs.ico} ${esc(ocTx(cs.title))}</h2>
    <p class="oc-intro">${esc(ocTx(cs.intro))}</p>
    ${result}
    <span class="oc-sub">${closed ? L('Подозреваемые', 'Suspects') : L('Подозреваемые — нажмите, чтобы проголосовать', 'Suspects — tap to vote')}</span>
    <div class="oc-suspects">${sus}</div>
    ${progress}
    <span class="oc-sub">🔒 ${L('Ваши улики — их видите только вы', 'Your clues — only you can see them')}</span>
    <div class="oc-clues">${clues}</div>
    ${closed ? '' : `<p class="field-note">${L('У коллег — другие улики. Соберите все в чате офиса: каждая снимает подозрение с кого-то или указывает на примету.', 'Your coworkers hold other clues. Pool them in the office chat: each one clears a suspect or points to a trait.')}</p>`}
    <div class="oc-foot"><span class="oc-count">🗂 ${L(`Раскрыто дел: ${st.solved_total || 0}`, `Cases cracked: ${st.solved_total || 0}`)}</span>
      <button class="btn-ghost oc-chat" type="button" id="ocChat">💬 ${L('Обсудить в чате офиса', 'Discuss in office chat')}</button></div>
    <p class="join-err" id="ocErr" role="alert"></p>`;
  $('ocChat').onclick = () => showChat('team');
  box.querySelectorAll('[data-sus]').forEach(b => b.onclick = () => ocVote(+b.dataset.sus, box, cs));
  box.querySelectorAll('[data-clue]').forEach(b => b.onclick = () => ocShare(b, cs, +b.dataset.clue));
}

async function ocVote(i, box, cs) {
  if (ocLast && ocLast.my_vote === i) return;
  box.querySelectorAll('[data-sus]').forEach(b => { b.disabled = true; });
  try {
    const st = await board.rpc('office_case_vote', { p_id: prefs.playerId, p_suspect: i });
    ocLast = st; sfx.tap?.();
    track('ocase_vote', { detail: `${cs.id}:${i}` });
    toast(st.closed ? L('Голос учтён — дело закрыто! Смотрите итог', 'Vote counted — the case is closed! See the result') : L(`Голос за «${ocTx(cs.suspects[i].name)}» учтён. Его можно поменять, пока дело открыто`, `Vote for ${ocTx(cs.suspects[i].name)} counted. You can change it while the case is open`));
    ocDraw(box, st, cs);
    if (st.closed && !st.my_rewarded) ocClaim();
    ocRenderBanner();
  } catch (err) {
    box.querySelectorAll('[data-sus]').forEach(b => { b.disabled = false; });
    if ($('ocErr')) $('ocErr').textContent = err.message;
  }
}

async function ocShare(btn, cs, k) {
  btn.disabled = true;
  const text = L(`🔎 Улика по делу «${ocTx(cs.title)}»: ${cs.clues[k].ru}`, `🔎 Clue for “${ocTx(cs.title)}”: ${cs.clues[k].en}`);
  try {
    await board.rpc('post_message', { p_id: prefs.playerId, p_channel: 'team', p_text: text.length > 300 ? text.slice(0, 299) + '…' : text });
    btn.textContent = L('✔ Отправлено в чат офиса', '✔ Sent to the office chat');
    track('ocase_share', { detail: cs.id });
  } catch (err) { btn.disabled = false; toast(err.message); }
}

// ---------- баннер в главном меню ----------
let ocBannerAt = 0;
async function ocRenderBanner() {
  const pane = $('paneOffice'); if (!pane) return;
  let el = $('ocBanner');
  if (!el) {
    el = Object.assign(document.createElement('div'), { id: 'ocBanner', className: 'oc-banner', hidden: true });
    const anchor = $('officeCta') || pane.firstChild;
    pane.insertBefore(el, anchor);
  }
  if (!board.online || window.VDP_PLATFORM) { el.hidden = true; return; }
  if (!registered()) {  // гость: что это и зачем регистрироваться
    el.innerHTML = `<span class="oc-b-ico" aria-hidden="true">🕵️</span><span class="oc-b-t"><b>${L('Дело недели', 'Case of the week')}</b>${L('Детектив для офиса: у каждого коллеги свои улики, разгадываете вместе.', 'A whodunit for your office: every coworker holds different clues — solve it together.')}</span>
      <button class="btn-main" type="button" id="ocBGo">${L('Открыть', 'Unlock')}</button>`;
    el.hidden = false;
    $('ocBGo').onclick = () => { if (typeof REG_WHAT === 'object') REG_WHAT.officecase = L('«Дело недели» в офисе', 'The office “Case of the week”'); if (needReg('officecase')) showOffice(); };
    return;
  }
  if (Date.now() - ocBannerAt < 20000 && ocLast) return ocBannerDraw(el, ocLast);
  try {
    const [st] = await Promise.all([ocState(), ocLoad()]);
    ocLast = st; ocBannerAt = Date.now();
    ocBannerDraw(el, st);
    if (st && st.closed && st.my_vote != null && !st.my_rewarded) ocClaim();
  } catch { el.hidden = true; }
}
function ocBannerDraw(el, st) {
  const cs = st && st.team && ocCase(st);
  if (!cs) { el.hidden = true; return; }  // без офиса — в меню уже есть «Создать офис»
  const solo = st.members < 2;
  const line = solo ? L('Нужна команда: позовите хотя бы одного коллегу — и дело откроется.', 'Needs a team: invite at least one coworker to open the case.')
    : st.closed ? (st.solved ? L(`Раскрыто! Виновный найден · раскрыто дел: ${st.solved_total}`, `Cracked! Culprit found · cases cracked: ${st.solved_total}`) : L('Дело закрыто — посмотрите, кто виновен', 'Case closed — see who did it'))
    : st.my_vote != null ? L(`Ваш голос учтён · проголосовали ${st.voted} из ${st.members}`, `You voted · ${st.voted} of ${st.members} voted`)
    : L(`У вас 2 секретные улики · проголосовали ${st.voted} из ${st.members}`, `You hold 2 secret clues · ${st.voted} of ${st.members} voted`);
  el.innerHTML = `<span class="oc-b-ico" aria-hidden="true">${cs.ico}</span><span class="oc-b-t"><b>🕵️ ${esc(ocTx(cs.title))}</b>${esc(line)}</span>
    <button class="btn-main" type="button" id="ocBGo">${solo ? L('Позвать', 'Invite') : st.closed ? L('Итог', 'Result') : L('Расследовать', 'Investigate')}</button>`;
  el.classList.toggle('done', !!st.closed);
  el.hidden = false;
  $('ocBGo').onclick = solo ? () => openShare('team') : () => showOffice();
}
bus.on('menu', () => setTimeout(ocRenderBanner, 400));
