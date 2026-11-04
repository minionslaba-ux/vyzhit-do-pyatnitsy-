/* сгенерировано tools/make-legacy.js из js/officecase.js — не править */
let ocData = null, ocLoading = null, ocLast = null, ocClaiming = false;
const ocLang = () => EN ? "en" : "ru";
const ocTx = (o) => o && (o[ocLang()] || o.ru) || "";
const ocLoad = () => ocData ? Promise.resolve(ocData) : ocLoading || (ocLoading = (window.OFFICE_CASES_JSON ? Promise.resolve(window.OFFICE_CASES_JSON) : fetch("data/office_cases.json").then((r) => {
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
})).then((d) => ocData = d).finally(() => {
  ocLoading = null;
}));
const ocCase = (st) => ocData && ocData.cases[(st.case_no % ocData.cases.length + ocData.cases.length) % ocData.cases.length];
function ocMyClues(st, cs) {
  const n = cs.clues.length, off = (st.week_no || 0) % n, slot = Math.max(0, st.my_slot || 0);
  const a = (off + 2 * slot) % n, b = (off + 2 * slot + 1) % n;
  return a === b ? [a] : [a, b];
}
const ocTrait = (id) => {
  var _a;
  const t = (_a = ocData == null ? void 0 : ocData.traits) == null ? void 0 : _a[id];
  return t ? '<span class="oc-chip">'.concat(t.ico, " ").concat(esc(t[ocLang()] || t.ru), "</span>") : "";
};
const ocSusName = (s) => "".concat(esc(ocTx(s.name)));
const ocLeft = (st) => {
  const ms = new Date(st.closes_at) - Date.now(), h = Math.max(0, Math.floor(ms / 36e5));
  return h >= 48 ? L("ещё ".concat(Math.floor(h / 24), " дн."), "".concat(Math.floor(h / 24), " days left")) : h >= 1 ? L("ещё ".concat(h, " ч"), "".concat(h, "h left")) : L("меньше часа", "under an hour");
};
const ocState = () => board.rpc("office_case_state", { p_id: prefs.playerId });
async function ocClaim() {
  var _a;
  if (ocClaiming || !registered() || !board.online) return 0;
  ocClaiming = true;
  try {
    const n = +await board.rpc("office_case_claim", { p_id: prefs.playerId }) || 0;
    if (n > 0) {
      addCash(n);
      (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
      toast(L("🕵️ Дело недели: +".concat(money(n), " на счёт"), "🕵️ Case of the week: +".concat(money(n), " to your balance")));
      track("ocase_reward", { detail: String(n) });
    }
    return n;
  } catch (e) {
    return 0;
  } finally {
    ocClaiming = false;
  }
}
async function ocRenderBox(team, members) {
  const box = $("ocBox");
  if (!box) return;
  const head = '<span class="kicker oc-kick">🕵️ '.concat(L("Дело недели", "Case of the week"), "</span>");
  if (!team) {
    box.innerHTML = "".concat(head, '<p class="field-note">').concat(L("В офисе каждую неделю — новое дело: кто съел торт, кто сломал принтер… У каждого коллеги свои улики, разгадываете вместе в чате офиса.", "Every week your office gets a new case: who ate the cake, who broke the printer… Each coworker holds different clues — you crack it together in the office chat."), "</p>");
    box.hidden = false;
    return;
  }
  box.innerHTML = "".concat(head, '<p class="field-note">').concat(L("Загружаю…", "Loading…"), "</p>");
  box.hidden = false;
  let st;
  try {
    [st] = await Promise.all([ocState(), ocLoad()]);
  } catch (err) {
    box.innerHTML = "".concat(head, '<p class="field-note">').concat(L("Дело пока не загрузилось", "Couldn’t load the case"), ": ").concat(esc(err.message), "</p>");
    return;
  }
  if (!box.isConnected) return;
  ocLast = st;
  if (!st || !st.team) {
    box.hidden = true;
    return;
  }
  const cs = ocCase(st);
  if (!cs) {
    box.hidden = true;
    return;
  }
  if (st.members < 2) {
    box.innerHTML = "".concat(head, '<h2 class="oc-title">').concat(cs.ico, " ").concat(esc(ocTx(cs.title)), '</h2>\n      <p class="oc-intro">').concat(esc(ocTx(cs.intro)), '</p>\n      <div class="oc-solo"><b>').concat(L("Расследовать в одиночку нельзя", "This case needs a team"), "</b>\n      <span>").concat(L("Улики раздаются всем участникам офиса — у каждого свои. Позовите хотя бы одного коллегу, и дело откроется.", "Clues are split between office members — everyone gets different ones. Invite at least one coworker to open the case."), '</span></div>\n      <button class="btn-main" type="button" id="ocInvite">👥 ').concat(L("Позвать коллег", "Invite coworkers"), "</button>");
    $("ocInvite").onclick = () => openShare("team");
    return;
  }
  ocDraw(box, st, cs);
  if (st.closed && st.my_vote != null && !st.my_rewarded) ocClaim().then((n) => {
    if (n && $("ocReward")) $("ocReward").textContent = L("Награда получена: +".concat(money(n)), "Reward received: +".concat(money(n)));
  });
}
function ocDraw(box, st, cs) {
  const head = '<span class="kicker oc-kick">🕵️ '.concat(L("Дело недели", "Case of the week")).concat(st.closed ? "" : " · ".concat(ocLeft(st)), "</span>");
  const tally = st.tally || [], closed = !!st.closed, mine = ocMyClues(st, cs);
  const sus = cs.suspects.map((s, i) => {
    const me = st.my_vote === i, guilty = closed && st.culprit === i;
    return '<button type="button" class="oc-sus'.concat(me ? " me" : "").concat(guilty ? " guilty" : "").concat(closed && !guilty ? " cleared" : "", '" data-sus="').concat(i, '"').concat(closed ? " disabled" : "", ' aria-pressed="').concat(me, '">\n      <span class="oc-ava" aria-hidden="true">').concat(s.ico, '</span>\n      <span class="oc-who"><b>').concat(ocSusName(s), "</b><small>").concat(esc(ocTx(s.role)), ' · <i class="npc-tag">🤖 ').concat(L("персонаж", "character"), '</i></small><span class="oc-chips">').concat(s.traits.map(ocTrait).join(""), '</span></span>\n      <span class="oc-mark">').concat(closed ? "".concat(guilty ? '<em class="oc-stamp">'.concat(L("Виновен!", "Guilty!"), "</em>") : "", "<small>").concat(pl(tally[i] || 0, "голос", "голоса", "голосов", "vote", "votes"), "</small>") : me ? '<em class="oc-mine">✔ '.concat(L("ваш голос", "your vote"), "</em>") : '<small class="oc-pick">'.concat(L("Голосовать", "Vote"), "</small>"), "</span></button>");
  }).join("");
  const clues = mine.map((k) => '<div class="oc-clue"><span class="oc-clue-t">🔎 '.concat(esc(ocTx(cs.clues[k])), "</span>\n    ").concat(closed ? "" : '<button type="button" class="btn-ghost oc-share" data-clue="'.concat(k, '">💬 ').concat(L("Поделиться уликой в чате", "Share this clue in chat"), "</button>"), "</div>")).join("");
  const progress = closed ? "" : '<p class="oc-prog"><span class="oc-bar"><i style="width:'.concat(Math.min(100, Math.round(100 * st.voted / Math.max(1, st.need))), '%"></i></span>\n    ').concat(L("Проголосовали ".concat(st.voted, " из ").concat(st.members, ". Дело закроется при ").concat(st.need, " голосах или в воскресенье в 23:59 (МСК)."), "".concat(st.voted, " of ").concat(st.members, " voted. The case closes at ").concat(st.need, " votes or on Sunday at 23:59 (Moscow time).")), "</p>");
  let result = "";
  if (closed) {
    const cul = cs.suspects[st.culprit] || {}, voters = st.voters || [], right = voters.filter((v) => v.right);
    const myRight = st.my_vote != null && st.my_vote === st.culprit;
    result = '<div class="oc-result'.concat(st.solved ? " solved" : "", '">\n      <b class="oc-res-h">').concat(st.solved ? L("🎉 Офис раскрыл дело!", "🎉 Your office cracked the case!") : L("🌀 Дело закрыто, но не раскрыто", "🌀 Case closed — but not cracked"), "</b>\n      <span>").concat(L("Виновный", "The culprit"), ": <b>").concat(cul.ico || "", " ").concat(ocSusName(cul), "</b> (").concat(esc(ocTx(cul.role)), "). ").concat(st.solved ? L("Большинство указало верно.", "The majority got it right.") : L("Большинство подозревало другого — в следующий раз делитесь уликами активнее!", "The majority suspected someone else — share more clues next time!"), '</span>\n      <div class="oc-voters">').concat(voters.map((v) => '<span class="oc-voter'.concat(v.right ? " ok" : "").concat(v.is_me ? " me" : "", '">').concat(v.right ? "✅" : "❌", " ").concat(esc(v.avatar || "🙂"), " ").concat(esc(v.name)).concat(v.is_me ? L(" (вы)", " (you)") : "", " → ").concat(ocSusName(cs.suspects[v.suspect] || {}), "</span>")).join(""), '</div>\n      <span class="oc-guess">').concat(right.length ? L("Угадали: ".concat(right.length, " из ").concat(voters.length, "."), "Guessed right: ".concat(right.length, " of ").concat(voters.length, ".")) : L("Никто не угадал — преступник оказался хитрее.", "Nobody guessed — the culprit was too clever."), "</span>\n      ").concat(st.my_vote == null ? '<span class="oc-rw">'.concat(L("Вы не успели проголосовать — новое дело в понедельник.", "You didn’t vote this time — a new case arrives on Monday."), "</span>") : '<span class="oc-rw" id="ocReward">'.concat(st.my_rewarded ? L("Награда за это дело уже на счёте.", "Your reward for this case is already in your balance.") : myRight ? L("Вы угадали: +".concat(money(6), " (+1 за голос и +5 за верный ответ)."), "You got it: +".concat(money(6), " (+1 for voting, +5 for the right answer).")) : L("+".concat(money(1), " за участие в расследовании."), "+".concat(money(1), " for joining the investigation.")), "</span>"), "\n    </div>");
  }
  box.innerHTML = "".concat(head, '\n    <h2 class="oc-title">').concat(cs.ico, " ").concat(esc(ocTx(cs.title)), '</h2>\n    <p class="oc-intro">').concat(esc(ocTx(cs.intro)), "</p>\n    ").concat(result, '\n    <span class="oc-sub">').concat(closed ? L("Подозреваемые", "Suspects") : L("Подозреваемые — нажмите, чтобы проголосовать", "Suspects — tap to vote"), '</span>\n    <div class="oc-suspects">').concat(sus, "</div>\n    ").concat(progress, '\n    <span class="oc-sub">🔒 ').concat(L("Ваши улики — их видите только вы", "Your clues — only you can see them"), '</span>\n    <div class="oc-clues">').concat(clues, "</div>\n    ").concat(closed ? "" : '<p class="field-note">'.concat(L("У коллег — другие улики. Соберите все в чате офиса: каждая снимает подозрение с кого-то или указывает на примету.", "Your coworkers hold other clues. Pool them in the office chat: each one clears a suspect or points to a trait."), "</p>"), '\n    <div class="oc-foot"><span class="oc-count">🗂 ').concat(L("Раскрыто дел: ".concat(st.solved_total || 0), "Cases cracked: ".concat(st.solved_total || 0)), '</span>\n      <button class="btn-ghost oc-chat" type="button" id="ocChat">💬 ').concat(L("Обсудить в чате офиса", "Discuss in office chat"), '</button></div>\n    <p class="join-err" id="ocErr" role="alert"></p>');
  $("ocChat").onclick = () => showChat("team");
  box.querySelectorAll("[data-sus]").forEach((b) => b.onclick = () => ocVote(+b.dataset.sus, box, cs));
  box.querySelectorAll("[data-clue]").forEach((b) => b.onclick = () => ocShare(b, cs, +b.dataset.clue));
}
async function ocVote(i, box, cs) {
  var _a;
  if (ocLast && ocLast.my_vote === i) return;
  box.querySelectorAll("[data-sus]").forEach((b) => {
    b.disabled = true;
  });
  try {
    const st = await board.rpc("office_case_vote", { p_id: prefs.playerId, p_suspect: i });
    ocLast = st;
    (_a = sfx.tap) == null ? void 0 : _a.call(sfx);
    track("ocase_vote", { detail: "".concat(cs.id, ":").concat(i) });
    toast(st.closed ? L("Голос учтён — дело закрыто! Смотрите итог", "Vote counted — the case is closed! See the result") : L("Голос за «".concat(ocTx(cs.suspects[i].name), "» учтён. Его можно поменять, пока дело открыто"), "Vote for ".concat(ocTx(cs.suspects[i].name), " counted. You can change it while the case is open")));
    ocDraw(box, st, cs);
    if (st.closed && !st.my_rewarded) ocClaim();
    ocRenderBanner();
  } catch (err) {
    box.querySelectorAll("[data-sus]").forEach((b) => {
      b.disabled = false;
    });
    if ($("ocErr")) $("ocErr").textContent = err.message;
  }
}
async function ocShare(btn, cs, k) {
  btn.disabled = true;
  const text = L("🔎 Улика по делу «".concat(ocTx(cs.title), "»: ").concat(cs.clues[k].ru), "🔎 Clue for “".concat(ocTx(cs.title), "”: ").concat(cs.clues[k].en));
  try {
    await board.rpc("post_message", { p_id: prefs.playerId, p_channel: "team", p_text: text.length > 300 ? text.slice(0, 299) + "…" : text });
    btn.textContent = L("✔ Отправлено в чат офиса", "✔ Sent to the office chat");
    track("ocase_share", { detail: cs.id });
  } catch (err) {
    btn.disabled = false;
    toast(err.message);
  }
}
let ocBannerAt = 0;
async function ocRenderBanner() {
  const pane = $("paneOffice");
  if (!pane) return;
  let el = $("ocBanner");
  if (!el) {
    el = Object.assign(document.createElement("div"), { id: "ocBanner", className: "oc-banner", hidden: true });
    const anchor = $("officeCta") || pane.firstChild;
    pane.insertBefore(el, anchor);
  }
  if (!board.online || window.VDP_PLATFORM) {
    el.hidden = true;
    return;
  }
  if (!registered()) {
    el.innerHTML = '<span class="oc-b-ico" aria-hidden="true">🕵️</span><span class="oc-b-t"><b>'.concat(L("Дело недели", "Case of the week"), "</b>").concat(L("Детектив для офиса: у каждого коллеги свои улики, разгадываете вместе.", "A whodunit for your office: every coworker holds different clues — solve it together."), '</span>\n      <button class="btn-main" type="button" id="ocBGo">').concat(L("Открыть", "Unlock"), "</button>");
    el.hidden = false;
    $("ocBGo").onclick = () => {
      if (typeof REG_WHAT === "object") REG_WHAT.officecase = L("«Дело недели» в офисе", "The office “Case of the week”");
      if (needReg("officecase")) showOffice();
    };
    return;
  }
  if (Date.now() - ocBannerAt < 2e4 && ocLast) return ocBannerDraw(el, ocLast);
  try {
    const [st] = await Promise.all([ocState(), ocLoad()]);
    ocLast = st;
    ocBannerAt = Date.now();
    ocBannerDraw(el, st);
    if (st && st.closed && st.my_vote != null && !st.my_rewarded) ocClaim();
  } catch (e) {
    el.hidden = true;
  }
}
function ocBannerDraw(el, st) {
  const cs = st && st.team && ocCase(st);
  if (!cs) {
    el.hidden = true;
    return;
  }
  const solo = st.members < 2;
  const line = solo ? L("Нужна команда: позовите хотя бы одного коллегу — и дело откроется.", "Needs a team: invite at least one coworker to open the case.") : st.closed ? st.solved ? L("Раскрыто! Виновный найден · раскрыто дел: ".concat(st.solved_total), "Cracked! Culprit found · cases cracked: ".concat(st.solved_total)) : L("Дело закрыто — посмотрите, кто виновен", "Case closed — see who did it") : st.my_vote != null ? L("Ваш голос учтён · проголосовали ".concat(st.voted, " из ").concat(st.members), "You voted · ".concat(st.voted, " of ").concat(st.members, " voted")) : L("У вас 2 секретные улики · проголосовали ".concat(st.voted, " из ").concat(st.members), "You hold 2 secret clues · ".concat(st.voted, " of ").concat(st.members, " voted"));
  el.innerHTML = '<span class="oc-b-ico" aria-hidden="true">'.concat(cs.ico, '</span><span class="oc-b-t"><b>🕵️ ').concat(esc(ocTx(cs.title)), "</b>").concat(esc(line), '</span>\n    <button class="btn-main" type="button" id="ocBGo">').concat(solo ? L("Позвать", "Invite") : st.closed ? L("Итог", "Result") : L("Расследовать", "Investigate"), "</button>");
  el.classList.toggle("done", !!st.closed);
  el.hidden = false;
  $("ocBGo").onclick = solo ? () => openShare("team") : () => showOffice();
}
bus.on("menu", () => setTimeout(ocRenderBanner, 400));
