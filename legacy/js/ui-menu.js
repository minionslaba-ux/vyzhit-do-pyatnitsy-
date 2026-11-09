/* сгенерировано tools/make-legacy.js из js/ui-menu.js — не править */
$("profs").innerHTML = Object.entries(PROF).map(([k, p]) => '<label class="prof">\n    <input type="radio" name="prof" value="'.concat(k, '"><b>').concat(p.name, "</b><small>").concat(p.perk.replace(/ ([+−]\d+)/g, " $1"), "</small></label>")).join("");
$("traits").innerHTML = Object.entries(TRAITS).map(([k, t]) => '<label class="prof">\n    <input type="radio" name="trait" value="'.concat(k, '"><b>').concat(t.name, "</b><small>").concat(t.desc, "</small></label>")).join("");
const getProf = () => {
  var _a;
  return ((_a = document.querySelector("input[name=prof]:checked")) == null ? void 0 : _a.value) || "marketer";
};
const getTrait = () => {
  var _a;
  return ((_a = document.querySelector("input[name=trait]:checked")) == null ? void 0 : _a.value) || "workaholic";
};
function renderMenu() {
  var _a;
  applyTheme();
  $("meAva").textContent = prefs.avatar;
  $("meName").textContent = prefs.name;
  $("meDept").textContent = prefs.dept || L("без отдела", "no department");
  myTag.then((t) => {
    $("meId").textContent = "".concat(window.APP_VER || "", " · ID ").concat(shortId(t), " · ").concat(registered() ? acctLabel() : prefs.email ? L("войдите снова", "sign in again") : L("гость", "guest"));
  });
  $("meRegister").hidden = registered() || !board.online;
  $("meLogin").hidden = !!prefs.email || !board.online;
  renderAcctBox();
  $("topLogin").hidden = registered() || !board.online || !!window.VDP_PLATFORM;
  $("mbAva").textContent = prefs.avatar || "😎";
  $("mbName").textContent = prefs.name ? prefs.name.split(" ")[0] : L("Профиль", "Profile");
  $("meBadge").classList.toggle("guest", !registered());
  $("delAcct").hidden = !registered() || !!window.VDP_PLATFORM;
  $("psGroup").hidden = $("tgGroup").hidden;
  $("psGroup").innerHTML = $("tgGroup").innerHTML;
  $("profLogout").hidden = !prefs.email;
  $("profLogout").textContent = L("Выйти из аккаунта", "Log out");
  delete $("profLogout").dataset.armed;
  $("meRegister").textContent = prefs.email ? L("Войти", "Sign in") : L("Регистрация", "Sign up");
  renderOfficeLine();
  renderChallengeCta();
  for (const id of LOCKED) $(id).classList.toggle("locked", !registered());
  renderInvites();
  renderOnlineBox();
  (document.querySelector("input[name=prof][value=".concat(prefs.prof, "]")) || document.querySelector("input[name=prof]")).checked = true;
  (document.querySelector("input[name=trait][value=".concat(prefs.trait, "]")) || document.querySelector("input[name=trait]")).checked = true;
  setPhase("evening");
  const best = store.get(KEY.best, { step: 0, wins: 0 });
  const seenN = store.get(KEY.seen, []).filter((id) => byId[id]).length;
  $("record").textContent = (best.wins ? L("недель закрыто: ".concat(best.wins), "weeks survived: ".concat(best.wins)) : best.step ? L("дольше всего: ".concat(dayName(dayOf(best.step)), ", ").concat(phaseName(slotPh(best.step)).toLowerCase()), "longest run: ".concat(dayName(dayOf(best.step)), ", ").concat(phaseName(slotPh(best.step)).toLowerCase())) : L("пока нет", "none yet")) + L(" · карточек открыто: ".concat(Math.min(seenN, TOTAL_CARDS), "/").concat(TOTAL_CARDS), " · cards discovered: ".concat(Math.min(seenN, TOTAL_CARDS), "/").concat(TOTAL_CARDS));
  const save = store.get(KEY.save, null);
  if (poolDone && save && !((_a = save.deck) == null ? void 0 : _a.every((x) => byId[x.id]))) store.del(KEY.save);
  const Cm = store.get(KEY.career, null), careerSave = save && (save.mode || "career") === "career";
  $("castList").hidden = !Cm;
  if (Cm) $("castList").innerHTML = '<b class="cast-title">'.concat(L("Коллеги по работе", "Your coworkers"), "</b>").concat(Object.entries(CAST).map(([k, p]) => {
    const v = (Cm.cast || {})[k] || 0;
    return '<div class="cast-row">'.concat(portraitHtml(p.name), "<span><b>").concat(p.name, "</b><small>").concat(p.role, " · ").concat(L("глава ".concat((Cm.castStage || {})[k] || 0, " из 8"), "chapter ".concat((Cm.castStage || {})[k] || 0, " of 8")), '</small></span><em class="').concat(v > 0 ? "up" : v < 0 ? "down" : "", '" title="').concat(L("Отношение ".concat(v), "Attitude ".concat(v)), '">').concat(hearts(v), "</em></div>");
  }).join(""));
  for (const [k, row] of Object.keys(CAST).map((k2, i) => [k2, $("castList").querySelectorAll(".cast-row")[i]])) if (row) setMood(row.querySelector(".face"), moodFor((((Cm == null ? void 0 : Cm.cast) || {})[k] || 0) * 10, true));
  $("careerCard").hidden = !Cm;
  $("profField").hidden = !!Cm;
  $("traitField").hidden = !!Cm;
  $("newCareer").hidden = !Cm;
  $("newCareer").textContent = L("Начать карьеру заново", "Start career over");
  delete $("newCareer").dataset.armed;
  if (Cm && Cm.payV !== 2) {
    payFix(Cm);
    store.set(KEY.career, Cm);
  }
  if (Cm) {
    const where = Cm.stage === "search" ? L("ищет работу", "job hunting") : Cm.company;
    $("careerCard").innerHTML = '<div class="cc-level">'.concat(LEVELS[levelOf(Cm)].ico, " ").concat(L("Уровень ".concat(levelOf(Cm), " из ").concat(LEVEL_MAX), "Level ".concat(levelOf(Cm), " of ").concat(LEVEL_MAX)), " · ").concat(LEVELS[levelOf(Cm)].name, '</div><div class="cc-head"><b>').concat(L("Неделя", "Week"), " ").concat(Math.min(Cm.week, YEAR), "/").concat(YEAR, "</b><span>").concat(esc(where), '</span></div>\n      <div class="cc-bar"><i style="width:').concat(Math.min(Cm.week - 1, YEAR) / YEAR * 100, '%"></i></div>\n      <div class="stat-box"><b>').concat(Cm.worked, "</b><span>").concat(L("отработано", "worked"), '</span></div>\n      <div class="stat-box"><b>').concat(Cm.firings, "</b><span>").concat(L("увольнений", "times fired"), '</span></div>\n      <div class="stat-box"><b>').concat(Cm.companies.length, "</b><span>").concat(L("компаний", "companies"), '</span></div>\n      <div class="cc-trait">').concat(esc(profLabel(Cm.prof)), " · ").concat(TRAITS[Cm.trait || "workaholic"].name, '</div>\n      <div class="money" style="grid-column:1/-1"><div><b>').concat(money(Cm.bank || 0), "</b><span>").concat(L("на счёте · оклад ".concat(money(Cm.salary || 2), "/день"), "in the bank · salary ".concat(money(Cm.salary || 2), "/day")), "</span>").concat(window.VDP_PLATFORM ? "" : topupBtn(0, ""), "</div><div><b>").concat(fmtDays(Cm.vacation || 0), " ").concat(L("дн.", "days"), "</b><span>").concat(L("отпуска из ".concat(VAC_YEAR), "vacation of ".concat(VAC_YEAR)), "</span></div></div>\n      ").concat(certBtnHtml(Cm), "\n      ").concat(certAdHtml(Cm), "\n      ").concat(adBtnHtml('btn-ghost btn-ad" style="grid-column:1/-1'), "\n      ").concat(!careerSave && Cm.stage === "work" && (Cm.vacation || 0) >= 7 && Cm.week <= YEAR ? '<button class="btn-ghost btn-vac" id="menuVac" style="grid-column:1/-1">' + L("Уйти в отпуск на неделю (7 дн.)", "Take a week of vacation (7 days)") + "</button>" : "");
    if ($("certBtn")) $("certBtn").onclick = () => certStart();
    if ($("menuVac")) $("menuVac").onclick = () => {
      C = store.get(KEY.career, null);
      takeVacation();
    };
    $("start").innerHTML = careerSave ? "".concat(L("Продолжить неделю", "Continue the week"), "<small>").concat(L("карточка ".concat(Math.min((save.step || 0) + 1, WEEK_LEN), " из ").concat(WEEK_LEN), "card ".concat(Math.min((save.step || 0) + 1, WEEK_LEN), " of ").concat(WEEK_LEN)), "</small>") : "".concat(L("Играть", "Play"), "<small>").concat(Cm.stage === "search" ? L("поиск работы", "job hunt") : L("неделя ".concat(Cm.week, " из ").concat(YEAR), "week ".concat(Cm.week, " of ").concat(YEAR)), "</small>");
  } else $("start").innerHTML = L("Играть<small>начать карьеру</small>", "Play<small>start your career</small>");
  const daily = store.get(KEY.daily, {})[today()];
  const sk = streakNow();
  $("startDaily").innerHTML = "".concat(L("Неделя дня", "Daily Week"), "<small>").concat(daily ? "".concat(daily.won ? L("пройдена", "survived") : L("завалена", "failed"), " · ").concat(L("ещё раз", "play again")) : sk ? L("серия ".concat(sk, " дн. · не прервите"), "".concat(sk, "-day streak · keep it going")) : "".concat(dayLabel(today()), " · ").concat(L("одна на всех", "same for everyone")), "</small>");
  $("streakLine").textContent = sk ? L("Серия: ".concat(sk, " дн. подряд").concat(daily ? "" : " — сыграйте сегодня, чтобы не прервать"), "Streak: ".concat(sk, " days in a row").concat(daily ? "" : " — play today to keep it alive")) : L("Играйте каждый день — растёт серия и бонус в карьеру", "Play every day to grow your streak and your career bonus");
  $("startPack").hidden = !PACK;
  if (PACK) $("startPack").textContent = PACK.title;
  $("openCollection").textContent = "".concat(L("Коллекция", "Collection"), " ").concat(Object.keys(endingsGot()).length, "/").concat(ENDINGS.length);
  renderSound();
  show("menu");
  board.touch("menu").catch(() => {
  }).then(() => {
    claimReferral();
    checkReferrals();
  });
  maybeViralPop();
  bus.emit("menu");
}
$("profs").onchange = () => {
  prefs.prof = getProf();
  store.set(KEY.prefs, prefs);
};
$("profOwn").value = prefs.profCustom || "";
$("profOwn").oninput = () => {
  prefs.profCustom = $("profOwn").value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 28);
  store.set(KEY.prefs, prefs);
};
$("profOwn").onchange = () => {
  if (prefs.profCustom) track("prof_custom");
};
$("traits").onchange = () => {
  prefs.trait = getTrait();
  store.set(KEY.prefs, prefs);
};
$("openBoard").onclick = () => openBoard("menu", "rating");
$("openPeople").onclick = () => openBoard("menu", "people");
$("openCollection").onclick = showCollection;
const registered = () => !!(prefs.email && prefs.session);
const LOCKED = ["openOffice", "openChat", "openSuggest"];
const needAccount = (fn, why) => () => registered() || !board.online ? fn() : prefs.email ? renderJoin("login", socialVia() ? L("Сессия входа истекла — войдите через ".concat(viaName(socialVia()), " ещё раз."), "Your session expired — sign in with ".concat(viaName(socialVia()), " again.")) : L("Сессия входа истекла. Войдите снова — паролем или по ссылке из письма.", "Your session expired. Sign in again — with your password or an email link.")) : renderJoin("register", why);
$("openOffice").onclick = needAccount(showOffice, L("«Мой офис» доступен после регистрации: соберите команду и позовите коллег.", "“My Office” unlocks after you sign up: build a team and bring in your coworkers."));
$("openChat").onclick = needAccount(() => showChat("team"), L("Чаты доступны после регистрации — так коллеги будут знать, кто пишет.", "Chats unlock after you sign up — so your coworkers know who’s talking."));
$("meRegister").onclick = () => prefs.email ? renderJoin("login") : renderJoin("register");
$("meLogin").onclick = () => renderJoin("login");
$("topLogin").onclick = () => renderJoin("login", socialVia() ? L("Сессия входа истекла — войдите через ".concat(viaName(socialVia()), " ещё раз."), "Your session expired — sign in with ".concat(viaName(socialVia()), " again.")) : void 0);
$("ctaOffice").onclick = () => showOffice();
$("openInvite").onclick = () => openShare(registered() ? "team" : "friends");
let myTeamCache = null;
async function renderOfficeLine() {
  $("officeCta").hidden = true;
  if (!registered() || !board.online) {
    myTeamCache = null;
    return;
  }
  try {
    myTeamCache = (await board.rpc("my_team", { p_id: prefs.playerId }))[0] || null;
    $("officeCta").hidden = !!myTeamCache;
    const t = myTeamCache && (await board.rpc("my_tournament", { p_id: prefs.playerId }).catch(() => []))[0];
    const fresh = t && Date.now() - new Date(t.starts_at) < 12 * 36e5 && !store.get("vdp-tours", {})[t.tour_id];
    $("tourCta").hidden = !fresh;
    if (fresh) {
      $("tourCta").querySelector("span").innerHTML = "<b>".concat(L("Турнир офиса «".concat(esc(t.team_name), "»"), "Office tournament: “".concat(esc(t.team_name), "”")), "</b> ").concat(new Date(t.starts_at) <= Date.now() ? L("уже идёт — сыграйте свою неделю", "is on — play your week") : L("старт ".concat(until(t.starts_at)), "starts ".concat(until(t.starts_at))));
      $("tourCtaGo").onclick = () => showOffice();
    }
    $("meDept").textContent = (prefs.dept || L("без отдела", "no department")) + (myTeamCache ? L(" · офис «".concat(myTeamCache.name, "»"), " · office “".concat(myTeamCache.name, "”")) : "");
  } catch (e) {
  }
}
$("meId").onclick = async () => {
  const id = shortId(await myTag);
  navigator.clipboard.writeText(id).then(() => toast(L("ID ".concat(id, " скопирован — отправьте его тому, кто собирает офис"), "ID ".concat(id, " copied — send it to whoever’s building the office"))), () => toast(L("Ваш ID: ".concat(id), "Your ID: ".concat(id))));
};
$("openSuggest").onclick = needAccount(showSuggest, L("Предлагать свои ситуации можно после регистрации: под карточкой будет ваша подпись.", "Sign up to suggest your own situations — your name goes on the card."));
$("meEdit").onclick = () => renderJoin("edit");
$("avatars").innerHTML = AVATARS.map((a) => '<label class="ava"><input type="radio" name="ava" value="'.concat(a, '"><span aria-hidden="true">').concat(a, "</span></label>")).join("");
$("avatars").onchange = () => {
  $("joinAvatar").textContent = document.querySelector("input[name=ava]:checked").value;
};
let joinMode = "welcome", mailTo = "";
function joinPanel(id) {
  for (const p of ["welcome", "joinForm", "checkMail"]) $(p).hidden = p !== id;
  setPhase("morning");
  show("join");
}
function renderWelcome() {
  joinMode = "welcome";
  $("wRegister").hidden = $("wLogin").hidden = !board.online;
  socialButtons($("wSocial"));
  $("wNote").textContent = board.online ? "" : L("Регистрация появится, когда к игре подключат общий офис (Supabase). Пока можно играть как гость.", "Sign-up arrives once the shared office (Supabase) is connected. For now you can play as a guest.");
  joinPanel("welcome");
}
function renderJoin(mode, lead) {
  var _a;
  if (window.VK_MINI && (mode === "login" || mode === "register") && typeof vkLogin === "function" && board.online) {
    toast(L("Входим через ВКонтакте…", "Signing in with VK…"));
    return vkLogin();
  }
  joinMode = mode;
  const reg = mode === "register", login = mode === "login", edit = mode === "edit";
  $("joinTitle").textContent = (EN ? { register: "Sign up", login: "Sign in", guest: "Guest pass", edit: "Office badge", profile: "Your profile" } : { register: "Регистрация", login: "Вход", guest: "Пропуск гостя", edit: "Пропуск в офис", profile: "Ваш профиль" })[mode];
  $("joinSub").textContent = (EN ? { register: "Name, department and email", login: "Telegram, email or password", guest: "No sign-up needed", edit: acctLabel() || "Guest", profile: acctLabel() } : { register: "Имя, отдел и почта", login: "Telegram, почта или пароль", guest: "Без регистрации", edit: acctLabel() || "Гость", profile: acctLabel() })[mode];
  $("joinLead").hidden = !lead;
  $("joinLead").textContent = lead || "";
  $("joinName").value = prefs.name || prefs.suggestName || "";
  $("joinDept").value = prefs.dept;
  $("joinEmail").value = (socialVia() ? "" : prefs.email) || mailTo || prefs.pendingEmail || "";
  $("joinEmail").disabled = !!prefs.email && !socialVia() && !login;
  for (const id of ["joinNameField", "joinDeptField", "joinAvaField", "joinAvatar"]) $(id).hidden = login;
  $("joinEmailField").hidden = !(reg || login || edit && prefs.email && !socialVia());
  $("joinEmailNote").textContent = prefs.email && !login ? L("Вы вошли по почте — прогресс общий на всех устройствах.", "You’re signed in by email — your progress syncs across devices.") : L("Пароль не обязателен — без него пришлём ссылку для входа на почту.", "A password is optional — without one we’ll email you a sign-in link.");
  socialButtons($("joinSocial"));
  (_a = $("joinSocial")).hidden || (_a.hidden = !(reg || login));
  $("joinEmailNote").hidden = login;
  $("joinLink").hidden = !login;
  $("joinLink").disabled = false;
  $("joinPassField").hidden = !(reg || login);
  $("joinPass").value = "";
  $("joinPass").autocomplete = reg ? "new-password" : "current-password";
  $("joinPassNote").textContent = reg ? L("Необязательно, от 6 символов. Без пароля входите по ссылке из письма.", "Optional, 6+ characters. Without one, sign in via an email link.") : L("Есть пароль — введите его и нажмите «Войти». Нет пароля или забыли — нажмите «Отправить ссылку для входа».", "Have a password? Enter it and tap “Log in”. No password or forgot it? Tap “Email me a sign-in link”.");
  (document.querySelector('input[name=ava][value="'.concat(prefs.avatar, '"]')) || document.querySelector("input[name=ava]")).checked = true;
  $("joinAvatar").textContent = document.querySelector("input[name=ava]:checked").value;
  $("joinErr").textContent = "";
  $("joinName").removeAttribute("aria-invalid");
  $("joinEmail").removeAttribute("aria-invalid");
  $("joinGo").textContent = (EN ? { register: "Sign up", login: "Log in", guest: "Play as guest", edit: "Save", profile: "Save and play" } : { register: "Зарегистрироваться", login: "Войти", guest: "Играть как гость", edit: "Сохранить", profile: "Сохранить и играть" })[mode];
  $("joinGo").disabled = false;
  $("joinRegister").hidden = !(edit && !prefs.email && board.online);
  $("joinLogout").hidden = !(edit && prefs.email);
  $("joinLogout").textContent = L("Выйти из аккаунта", "Log out");
  delete $("joinLogout").dataset.armed;
  $("joinCancel").hidden = mode === "profile";
  $("joinNote").hidden = login;
  $("joinConsent").hidden = !(reg || login);
  joinPanel("joinForm");
  (login ? $("joinEmail") : $("joinName")).focus({ preventScroll: true });
}
function renderCheckMail(email) {
  mailTo = email;
  $("mailText").innerHTML = L("Мы отправили ссылку для входа на <b>".concat(esc(email), "</b>. Откройте письмо на этом устройстве и нажмите ссылку — игра откроется уже под вашим аккаунтом."), "We sent a sign-in link to <b>".concat(esc(email), "</b>. Open the email on this device and tap the link — the game will open under your account."));
  $("mailErr").textContent = "";
  $("mailGuest").hidden = !prefs.name;
  joinPanel("checkMail");
}
$("wRegister").onclick = () => renderJoin("register");
$("wGuest").onclick = () => renderJoin("guest");
$("wLogin").onclick = () => renderJoin("login");
$("wHow").onclick = () => showIntro();
$("openHow").onclick = () => showIntro();
$("wVideo").onclick = () => showVideo();
$("openVideo").onclick = () => showVideo();
$("joinRegister").onclick = () => renderJoin("register");
$("mailChange").onclick = () => renderJoin(prefs.name ? "register" : "login");
$("mailGuest").onclick = () => {
  renderMenu();
  joinFromLink();
};
$("mailResend").onclick = async () => {
  $("mailResend").disabled = true;
  try {
    await board.sendLink(mailTo);
    toast(L("Письмо отправлено ещё раз", "Email sent again"));
    $("mailErr").textContent = "";
  } catch (err) {
    $("mailErr").textContent = L("Не удалось отправить: ".concat(err.message), "Couldn’t send: ".concat(err.message));
  }
  setTimeout(() => {
    $("mailResend").disabled = false;
  }, 15e3);
};
$("joinName").oninput = () => {
  $("joinErr").textContent = "";
  $("joinName").removeAttribute("aria-invalid");
};
$("joinCancel").onclick = () => prefs.name && !prefs.loggedOut ? renderMenu() : renderWelcome();
$("joinEmail").oninput = () => {
  $("joinErr").textContent = "";
  $("joinEmail").removeAttribute("aria-invalid");
};
const badMail = (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
$("joinLink").onclick = async () => {
  const email = $("joinEmail").value.trim().toLowerCase();
  if (badMail(email)) {
    $("joinErr").textContent = L("Введите почту, с которой регистрировались.", "Enter the email you signed up with.");
    $("joinEmail").setAttribute("aria-invalid", "true");
    $("joinEmail").focus();
    return;
  }
  $("joinLink").disabled = true;
  try {
    await board.sendLink(email);
    renderCheckMail(email);
  } catch (err) {
    $("joinErr").textContent = L("Не удалось отправить ссылку: ".concat(err.message), "Couldn’t send the link: ".concat(err.message));
    $("joinLink").disabled = false;
  }
};
$("joinForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("joinEmail").value.trim().toLowerCase();
  if (joinMode === "login") {
    if (badMail(email)) {
      $("joinErr").textContent = L("Введите почту, с которой регистрировались.", "Enter the email you signed up with.");
      $("joinEmail").setAttribute("aria-invalid", "true");
      return;
    }
    $("joinGo").disabled = true;
    const pass = $("joinPass").value;
    try {
      if (pass) {
        const j = await board.password(email, pass);
        prefs.hasPass = true;
        await applySession(sessOf(j), j.user, { via: "email" });
        return;
      }
      await board.sendLink(email);
      renderCheckMail(email);
    } catch (err) {
      $("joinErr").textContent = L("Не удалось отправить ссылку: ".concat(err.message), "Couldn’t send the link: ".concat(err.message));
      $("joinGo").disabled = false;
    }
    return;
  }
  const name = $("joinName").value.trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    $("joinErr").textContent = L("Введите имя — хотя бы 2 буквы. Его увидят коллеги в рейтинге.", "Enter a name — at least 2 letters. Your coworkers will see it on the leaderboard.");
    $("joinName").setAttribute("aria-invalid", "true");
    $("joinName").focus();
    return;
  }
  const dept0 = $("joinDept").value.trim().replace(/\s+/g, " ");
  if (MOD.bad(name)) {
    $("joinErr").textContent = L("Такое имя не подойдёт: его видят все игроки. Давайте без грубостей и ссылок.", "That name won’t work — everyone can see it. Please keep it clean, no links.");
    $("joinName").setAttribute("aria-invalid", "true");
    $("joinName").focus();
    return;
  }
  if (MOD.bad(dept0)) {
    $("joinErr").textContent = L("Такой отдел не подойдёт: его видят все игроки. Напишите настоящий отдел или оставьте поле пустым.", "That department won’t work — everyone can see it. Use a real one or leave it empty.");
    $("joinDept").setAttribute("aria-invalid", "true");
    $("joinDept").focus();
    return;
  }
  prefs.name = name;
  prefs.dept = dept0;
  prefs.avatar = document.querySelector("input[name=ava]:checked").value;
  if (joinMode === "register") {
    if (badMail(email)) {
      $("joinErr").textContent = L("Укажите почту — на неё придёт ссылка для входа.", "Enter your email — we’ll send the sign-in link there.");
      $("joinEmail").setAttribute("aria-invalid", "true");
      $("joinEmail").focus();
      return;
    }
    store.set(KEY.prefs, prefs);
    await board.touch("menu").catch(() => {
    });
    $("joinGo").disabled = true;
    const pass = $("joinPass").value;
    if (pass && pass.length < 6) {
      $("joinErr").textContent = L("Пароль — хотя бы 6 символов. Или оставьте поле пустым.", "Password must be 6+ characters — or leave it empty.");
      $("joinGo").disabled = false;
      return;
    }
    try {
      if (pass) {
        const j = await board.password(email, pass, true);
        if (j.user && Array.isArray(j.user.identities) && !j.user.identities.length) throw new Error(L("эта почта уже зарегистрирована — нажмите «Войти»", "this email is already registered — tap “Log in”"));
        prefs.hasPass = true;
        if (j.access_token) {
          await applySession(sessOf(j), j.user, { via: "email" });
          return;
        }
      } else await board.sendLink(email);
      prefs.pendingEmail = email;
      store.set(KEY.prefs, prefs);
      renderCheckMail(email);
    } catch (err) {
      $("joinErr").textContent = L("Не удалось отправить ссылку: ".concat(err.message), "Couldn’t send the link: ".concat(err.message));
      $("joinGo").disabled = false;
    }
    return;
  }
  delete prefs.loggedOut;
  store.set(KEY.prefs, prefs);
  await board.touch("menu").catch(() => {
  });
  renderMenu();
};
function logoutClick(e) {
  const b = e.currentTarget;
  if (!b.dataset.armed) {
    b.dataset.armed = "1";
    b.textContent = L("Выйти? Нажмите ещё раз", "Log out? Tap again");
    return;
  }
  board.logout().finally(() => {
    for (const k of ["email", "pendingEmail", "playerId", "session", "acctName", "tgLinked", "vkLinked", "hasPass", "suggestName", "tgRemind"]) delete prefs[k];
    prefs.loggedOut = true;
    store.set(KEY.prefs, prefs);
    location.reload();
  });
}
$("joinLogout").onclick = logoutClick;
$("profLogout").onclick = logoutClick;
$("langRu").onclick = () => EN && setLang("ru");
$("langEn").onclick = () => !EN && setLang("en");
$(EN ? "langEn" : "langRu").classList.add("on");
$("start").onclick = async () => {
  await whenReady($("start"), levelOf(C || store.get(KEY.career, null)) > 1);
  continueCareer();
};
const profSheet = $("profSheet");
function openProfile() {
  try {
    renderMenu();
  } catch (e) {
  }
  profSheet.hidden = false;
  $("meBadge").setAttribute("aria-expanded", "true");
  $("psClose").focus({ preventScroll: true });
}
function closeProfile() {
  if (profSheet.hidden) return;
  profSheet.hidden = true;
  $("meBadge").setAttribute("aria-expanded", "false");
}
$("meBadge").onclick = () => profSheet.hidden ? openProfile() : closeProfile();
$("psClose").onclick = closeProfile;
const KEEP_OPEN = ["profLogout", "tgRemind", "meId", "langRu", "langEn", "remindDaily"];
profSheet.addEventListener("click", (e) => {
  if (e.target === profSheet) return closeProfile();
  const b = e.target.closest("button, a");
  if (b && !KEEP_OPEN.includes(b.id) && b.id !== "psClose") setTimeout(closeProfile, 0);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProfile();
});
$("psInvite").onclick = () => openShare(registered() ? "team" : "friends");
$("psGroup").onclick = () => $("tgGroup").click();
$("startDaily").onclick = async () => {
  await whenReady($("startDaily"), true);
  startDaily();
};
$("startPack").onclick = async () => {
  await whenReady($("startPack"));
  startPack();
};
$("newCareer").onclick = () => {
  const b = $("newCareer");
  if (!b.dataset.armed) {
    b.dataset.armed = "1";
    b.textContent = L("Весь прогресс года сотрётся. Нажмите ещё раз", "This wipes the whole year. Tap again");
    return;
  }
  store.del(KEY.career);
  store.del(KEY.save);
  newCareer();
};
const resultText = (e) => e.won ? { main: "".concat(e.total, "/400"), sub: L("неделя закрыта", "week survived") } : { main: "".concat(dayName(dayOf(e.step)).slice(0, EN ? 3 : 2), ", ").concat(phaseName(slotPh(e.step)).toLowerCase()), sub: "".concat(e.death ? resName(e.death) : "", " ").concat(e.overheat ? "100%" : "0%") };
const ago = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 6e4));
  return m < 1 ? L("только что", "just now") : m < 60 ? L("".concat(m, " мин назад"), "".concat(m, " min ago")) : m < 1440 ? L("".concat(Math.floor(m / 60), " ч назад"), "".concat(Math.floor(m / 60), "h ago")) : L("".concat(Math.floor(m / 1440), " дн. назад"), "".concat(Math.floor(m / 1440), "d ago"));
};
const stepName = (st) => "".concat(dayName(dayOf(st)).slice(0, EN ? 3 : 2), ", ").concat(phaseName(slotPh(st)).toLowerCase());
function personStatus(p) {
  if (p.npc) return '<span class="st on"><i></i>'.concat(L("на связи", "available"), "</span>");
  const fresh = Date.now() - new Date(p.updated_at) < 10 * 6e4;
  if (fresh && p.status === "playing") return '<span class="st play"><i></i>'.concat(L("играет", "playing"), " · ").concat(stepName(p.step), "</span>");
  if (fresh) return '<span class="st on"><i></i>'.concat(L("в сети", "online"), "</span>");
  return '<span class="st"><i></i>'.concat(ago(p.updated_at), "</span>");
}
const cupTime = () => {
  const n = /* @__PURE__ */ new Date(), wd = (n.getDay() + 6) % 7;
  return wd > 4 || wd === 4 && n.getHours() >= 18;
};
let boardFrom = "menu", boardMode = "rating", boardTimer = null;
const MODES = { rating: "modeRating", daily: "modeDaily", depts: "modeDepts", people: "modePeople" };
function openBoard(from, mode) {
  boardFrom = from;
  boardMode = mode;
  show("board");
  renderBoard();
  clearInterval(boardTimer);
  boardTimer = setInterval(() => {
    if (views.board.hidden) clearInterval(boardTimer);
    else if (!document.hidden) renderBoard(true);
  }, 2e4);
}
const rowsScore = (rows, tag) => rows.map((e, i) => {
  const r = resultText(e), medal = i < 3;
  return '<div class="lb-row'.concat(e.tag === tag ? " me" : "", '">\n    <span class="lb-pos').concat(medal ? " medal" : "", '">').concat(String(i + 1).padStart(2, "0"), '</span>\n    <span class="lb-who"><b>').concat(esc(e.avatar || ""), " ").concat(esc(e.name), "</b><small>").concat(esc(e.dept || L("без отдела", "no department"))).concat(e.prof ? " · ".concat(esc(profOf(e))) : "", '</small></span>\n    <span class="lb-res ').concat(e.won ? "won" : "lost", '"><b>').concat(r.main, "</b><small>").concat(r.sub, "</small></span></div>");
}).join("");
async function renderBoard(quiet) {
  const onlyDept = $("onlyDept").checked;
  for (const [m, id] of Object.entries(MODES)) $(id).setAttribute("aria-selected", m === boardMode);
  $("boardTitle").textContent = (EN ? { rating: "Office leaderboard", daily: "Daily Week ".concat(dayLabel(today())), depts: "Department vs department", people: "Players" } : { rating: "Рейтинг офиса", daily: "Неделя дня ".concat(dayLabel(today())), depts: "Отдел против отдела", people: "Участники" })[boardMode];
  $("onlyDeptBox").hidden = boardMode === "depts";
  $("boardNote").textContent = !board.online ? L("Общий офис ещё не подключён — показаны данные с этого устройства. Подключение: js/config.js.", "The shared office isn’t connected yet — showing data from this device. Setup: js/config.js.") : (EN ? {
    rating: "Each player’s best career week.",
    daily: "Same week for everyone. Only your first attempt of the day counts.",
    depts: "Department average since Monday: a survived week scores its total, a failed one — 10 points per card.",
    people: "The list refreshes every 20 seconds."
  } : {
    rating: "Лучшая неделя каждого игрока в карьере.",
    daily: "Одна и та же неделя для всех. В зачёт идёт первая попытка за день.",
    depts: "Средний результат отдела с понедельника: закрытая неделя — её счёт, проваленная — 10 очков за карточку.",
    people: "Список обновляется каждые 20 секунд."
  })[boardMode];
  const list = $("boardList");
  if (onlyDept && !prefs.dept && boardMode !== "depts") {
    $("boardSummary").textContent = "";
    list.innerHTML = L('<div class="lb-empty"><span class="big">Нет отдела</span>Укажите свой отдел (кнопка «Изменить» в меню), чтобы видеть коллег по отделу.</div>', '<div class="lb-empty"><span class="big">No department</span>Set your department (the “Edit” button in the menu) to see your teammates.</div>');
    return;
  }
  if (!quiet) list.innerHTML = '<div class="lb-empty">'.concat(L("Загружаю…", "Loading…"), "</div>");
  try {
    const dept = onlyDept ? prefs.dept : "", tag = await myTag;
    if (boardMode === "people") {
      const rows = await board.people(dept);
      const canInvite = registered() && board.online;
      const live = rows.filter((p) => Date.now() - new Date(p.updated_at) < 10 * 6e4);
      $("boardSummary").textContent = L("Участников: ".concat(rows.length, " · в сети: ").concat(live.length), "Players: ".concat(rows.length, " · online: ").concat(live.length));
      if (!rows.length) {
        list.innerHTML = L('<div class="lb-empty"><span class="big">Пусто</span>Пока никого нет.</div>', '<div class="lb-empty"><span class="big">Empty</span>Nobody here yet.</div>');
        return;
      }
      list.innerHTML = rows.map((p) => '<div class="lb-row person'.concat(p.tag === tag ? " me" : "", '">\n        <span class="lb-ava" aria-hidden="true">').concat(esc(p.avatar || "🙂"), '</span>\n        <span class="lb-who"><b>').concat(esc(p.name)).concat(p.tag === tag ? L(" (вы)", " (you)") : "", "</b><small>").concat(p.npc ? '<span class="npc-tag" style="margin:0">🤖 '.concat(L("персонаж игры", "game character"), "</span> · ") : "").concat(esc(p.dept || L("без отдела", "no department"))).concat(p.prof_custom ? " · " + esc(profOf(p)) : "", '</small>\n          <small class="lb-meta">').concat(L("недель", "weeks"), ": ").concat(p.games || 0, " · ").concat(L("побед", "wins"), ": ").concat(p.wins || 0).concat(p.games ? " · ".concat(L("лучшее", "best"), ": ").concat(p.best_won ? "".concat(p.best_total, "/400") : stepName(p.best_step)) : "", '</small></span>\n        <span class="lb-res">').concat(personStatus(p)).concat(canInvite && p.tag !== tag && p.short_id ? '<button class="btn-chip" data-invite="'.concat(p.short_id, '">').concat(L("Позвать в офис", "Invite to office"), "</button>") : "", "</span></div>")).join("");
      bindInvite(list);
    } else if (boardMode === "depts") {
      const rows = await board.depts();
      $("boardSummary").textContent = cupTime() ? L("Кубок недели вручён", "This week’s cup has been awarded") : L("Кубок вручат в пятницу в 18:00", "The cup is awarded Friday at 6 PM");
      if (!rows.length) {
        list.innerHTML = L('<div class="lb-empty"><span class="big">Пусто</span>На этой неделе отделы ещё не играли. Укажите отдел в пропуске и сыграйте неделю.</div>', '<div class="lb-empty"><span class="big">Empty</span>No department has played this week yet. Add your department to your badge and play a week.</div>');
        return;
      }
      list.innerHTML = rows.map((d, i) => '<div class="lb-row dept'.concat(d.dept === prefs.dept ? " me" : "", '">\n        <span class="lb-pos').concat(i === 0 ? " medal" : "", '">').concat(i === 0 ? cupTime() ? L("КУБОК", "CUP") : "01" : String(i + 1).padStart(2, "0"), '</span>\n        <span class="lb-who"><b>').concat(esc(d.dept), "</b><small>").concat(L("игроков: ".concat(d.players, " · недель: ").concat(d.weeks, " · закрыто: ").concat(d.win_rate, "%"), "players: ".concat(d.players, " · weeks: ").concat(d.weeks, " · survived: ").concat(d.win_rate, "%")), '</small></span>\n        <span class="lb-res won"><b>').concat(d.avg_score, "</b><small>").concat(L("средний счёт", "avg score"), "</small></span></div>")).join("");
    } else {
      const rows = boardMode === "daily" ? await board.daily(today(), dept) : await board.top(dept);
      $("boardSummary").textContent = L("В рейтинге: ".concat(rows.length), "On the board: ".concat(rows.length));
      if (!rows.length) {
        list.innerHTML = '<div class="lb-empty"><span class="big">'.concat(L("Пусто", "Empty"), "</span>").concat(boardMode === "daily" ? L("Сегодня неделю дня ещё никто не сыграл. Станьте первыми!", "Nobody has played today’s Daily Week yet. Be the first!") : L("Пока никто не доиграл неделю. Станьте первыми!", "Nobody has finished a week yet. Be the first!"), "</div>");
        return;
      }
      list.innerHTML = rowsScore(rows, tag);
    }
  } catch (err) {
    if (!quiet) list.innerHTML = '<div class="lb-empty"><span class="big">'.concat(L("Нет связи", "No connection"), "</span>").concat(L("Не удалось загрузить данные", "Couldn’t load data"), ": ").concat(esc(err.message), "</div>");
  }
}
$("boardBack").onclick = () => {
  clearInterval(boardTimer);
  boardFrom === "end" ? show("end") : renderMenu();
};
$("boardRefresh").onclick = () => renderBoard();
for (const [m, id] of Object.entries(MODES)) $(id).onclick = () => {
  boardMode = m;
  renderBoard();
};
$("onlyDept").onchange = () => renderBoard();
const shortId = (tag) => tag.slice(0, 6).toUpperCase();
const offline = (title) => {
  views.end.innerHTML = '<div class="end-sheet glass"><span class="kicker">'.concat(title, "</span><h1>").concat(L("Нужен общий офис", "Shared office required"), "</h1>\n    <p>").concat(L("Офисы, приглашения и чаты работают через Supabase. Впишите ключи в js/config.js и выполните supabase/schema.sql.", "Offices, invites and chats run on Supabase. Put your keys in js/config.js and run supabase/schema.sql."), '</p>\n    <div class="stack"><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div></div>");
  show("end");
  $("toMenu").onclick = renderMenu;
};
const inviteLink = (code) => "".concat(location.origin).concat(location.pathname, "?join=").concat(code);
const copy = (text, ok) => navigator.clipboard.writeText(text).then(() => toast(ok), () => toast(text));
const invHidden = () => prefs.invHidden || (prefs.invHidden = []);
async function myInvites() {
  return (await board.rpc("my_invites", { p_id: prefs.playerId }) || []).filter((i) => !invHidden().includes(i.invite_id));
}
async function answerInvite(inv, accept) {
  if (!registered()) {
    if (!accept) {
      invHidden().push(inv.invite_id);
      store.set(KEY.prefs, prefs);
      toast(L("Приглашение скрыто", "Invite hidden"));
      return true;
    }
    if (!views.game.hidden) {
      toast(L("Доиграйте неделю — приглашение ждёт в меню. Чтобы вступить в офис, нужна регистрация", "Finish your week — the invite is waiting in the menu. You’ll need to sign up to join the office"));
      return false;
    }
    renderJoin("register", L("Чтобы войти в офис «".concat(inv.team_name, "», зарегистрируйтесь — приглашение сохранится."), "Sign up to join the “".concat(inv.team_name, "” office — your invite will be saved.")));
    return false;
  }
  try {
    const name = await board.rpc("answer_invite", { p_id: prefs.playerId, p_invite: inv.invite_id, p_accept: accept });
    toast(accept ? L("Вы в офисе «".concat(name, "». Загляните в чат офиса!"), "You’re in the “".concat(name, "” office. Say hi in the office chat!")) : L("Приглашение отклонено", "Invite declined"));
    myTeamCache = null;
    if (!views.menu.hidden) renderMenu();
    return true;
  } catch (err) {
    toast(err.message);
    return false;
  }
}
async function renderInvites() {
  const box = $("invites");
  if (!board.online || !prefs.name) {
    box.hidden = true;
    return;
  }
  try {
    const list = await myInvites();
    box.hidden = !list.length;
    box.innerHTML = list.map((i, n) => '<div class="invite"><span><b>'.concat(esc(i.from_name), "</b> ").concat(L("зовёт вас в офис «".concat(esc(i.team_name), "»"), "invites you to the “".concat(esc(i.team_name), "” office")), '</span>\n      <button class="btn-chip" data-a="1" data-n="').concat(n, '">').concat(L("Принять", "Accept"), '</button><button class="btn-chip" data-a="0" data-n="').concat(n, '">').concat(L("Отказаться", "Decline"), "</button></div>")).join("");
    box.querySelectorAll("button").forEach((b) => b.onclick = async () => {
      if (await answerInvite(list[+b.dataset.n], b.dataset.a === "1")) renderInvites();
    });
  } catch (e) {
    box.hidden = true;
  }
}
function invitePop(inv) {
  const el = $("invitePop");
  el.innerHTML = '<span class="ip-ico" aria-hidden="true">📨</span><span class="ip-text"><b>'.concat(esc(inv.from_name), "</b> ").concat(L("зовёт вас в офис «".concat(esc(inv.team_name), "»"), "invites you to the “".concat(esc(inv.team_name), "” office")), '</span>\n    <span class="ip-btns"><button class="btn-main" type="button" data-a="1">').concat(L("Принять", "Accept"), '</button><button class="btn-ghost" type="button" data-a="0">').concat(L("Отказаться", "Decline"), '</button></span>\n    <button class="ip-x" type="button" aria-label="').concat(L("Позже", "Later"), '">×</button>');
  el.hidden = false;
  FX.pulse(el, "on", 600);
  el.querySelectorAll("[data-a]").forEach((b) => b.onclick = async () => {
    if (await answerInvite(inv, b.dataset.a === "1")) {
      el.hidden = true;
      renderInvites();
    }
  });
  el.querySelector(".ip-x").onclick = () => {
    el.hidden = true;
  };
}
let socialBusy = false;
async function pollSocial() {
  if (socialBusy || !board.online || !prefs.name || document.hidden) return;
  socialBusy = true;
  try {
    const seen = prefs.invSeen || (prefs.invSeen = []), list = await myInvites().catch(() => []);
    const fresh = list.filter((i) => !seen.includes(i.invite_id));
    if (fresh.length) {
      seen.push(...fresh.map((i) => i.invite_id));
      prefs.invSeen = seen.slice(-100);
      store.set(KEY.prefs, prefs);
      invitePop(fresh[0]);
      if (!views.menu.hidden) renderInvites();
      ring(L("".concat(fresh[0].from_name, " зовёт вас в офис «").concat(fresh[0].team_name, "»"), "".concat(fresh[0].from_name, " invites you to the “").concat(fresh[0].team_name, "” office")), () => invitePop(fresh[0]), true, false);
    }
    if (registered()) {
      const sent = await board.rpc("my_sent_invites", { p_id: prefs.playerId }).catch(() => []) || [], done = prefs.sentSeen || (prefs.sentSeen = []);
      for (const s of sent.filter((s2) => !done.includes(s2.invite_id))) {
        done.push(s.invite_id);
        toast(L("".concat(s.to_name, ": приглашение в «").concat(s.team_name, "» ").concat(s.status === "accepted" ? "принято 🎉" : "отклонено"), "".concat(s.to_name, " ").concat(s.status === "accepted" ? "accepted 🎉" : "declined", " your invite to “").concat(s.team_name, "”")));
      }
      prefs.sentSeen = done.slice(-100);
      store.set(KEY.prefs, prefs);
      const last = await board.rpc("chat_latest", { p_id: prefs.playerId }).catch(() => []) || [], cs = prefs.chatSeen || (prefs.chatSeen = {});
      for (const r of last) {
        if (r.channel === "dm") {
          if (r.last_id > (cs.dm || 0) && !dmOpen) ring(L("".concat(r.from_name, " пишет вам"), "".concat(r.from_name, " sent you a message")), () => showDmInbox());
          cs.dm = Math.max(cs.dm || 0, r.last_id);
          continue;
        }
        const open = $("chList") && chatChannel === r.channel;
        if (cs[r.channel] != null && r.last_id > cs[r.channel] && !open)
          ring(L("".concat(r.from_name, " пишет в ").concat(r.channel === "team" ? "чате офиса" : "общем чате"), "".concat(r.from_name, " posted in ").concat(r.channel === "team" ? "the office chat" : "the general chat")), () => showChat(r.channel), r.channel === "team");
        cs[r.channel] = Math.max(cs[r.channel] || 0, r.last_id);
      }
      store.set(KEY.prefs, prefs);
    }
    if (!views.menu.hidden) renderOnlineBox();
  } finally {
    socialBusy = false;
  }
}
setInterval(pollSocial, 2e4);
const bellQ = [];
function ring(text, open, loud = true, note = true) {
  var _a, _b;
  bellQ.unshift({ text, open });
  bellQ.length = Math.min(bellQ.length, 9);
  const b = $("bell");
  b.hidden = false;
  $("bellN").textContent = bellQ.length;
  b.classList.remove("ring");
  void b.offsetWidth;
  b.classList.add("ring");
  (_a = sfx.bell) == null ? void 0 : _a.call(sfx);
  if (loud) try {
    (TG == null ? void 0 : TG.HapticFeedback) ? TG.HapticFeedback.notificationOccurred("success") : (_b = navigator.vibrate) == null ? void 0 : _b.call(navigator, [90, 60, 90, 60, 180]);
  } catch (e) {
  }
  if (note) toast("🔔 ".concat(text));
}
$("bell").onclick = () => {
  var _a, _b;
  const list = bellQ.splice(0), b = $("bell");
  b.hidden = true;
  if (!list.length) return;
  if (!views.game.hidden) {
    toast("🔔 ".concat(list[0].text).concat(list.length > 1 ? L(" и ещё ".concat(list.length - 1), " and ".concat(list.length - 1, " more")) : "").concat(L(". Откройте после недели в меню", ". Check the menu after your week")));
    return;
  }
  (_b = (_a = list[0]).open) == null ? void 0 : _b.call(_a);
};
let onlineNow = async () => {
  const me = await myTag, now = Date.now();
  return (await board.people() || []).filter((p) => p.tag !== me && now - new Date(p.updated_at) < 5 * 6e4);
};
const onlineRow = (p) => '<div class="lb-row person"><span class="lb-ava" aria-hidden="true">'.concat(esc(p.avatar || "🙂"), '</span>\n  <span class="lb-who"><b>').concat(esc(p.name)).concat(p.desk ? ' <span class="desk-mini">'.concat(esc(p.desk), "</span>") : "", "</b><small>").concat(p.npc ? '<span class="npc-tag" style="margin:0">🤖 '.concat(L("персонаж игры", "game character"), "</span> · ") : "").concat(esc(p.dept || L("без отдела", "no department"))).concat(p.prof && PROF[p.prof] ? " · " + esc(profOf(p)) : "", '</small></span>\n  <span class="lb-res">').concat(personStatus(p)).concat(p.short_id ? '<button class="btn-chip" type="button" data-dm="'.concat(p.short_id, '" data-name="').concat(esc(p.name), '">').concat(L("Написать", "Message"), '</button><button class="btn-chip" type="button" data-invite="').concat(p.short_id, '">').concat(L("Позвать", "Invite"), "</button>") : "", "</span></div>");
const bindInvite = (root) => {
  root.querySelectorAll("[data-invite]").forEach((b) => b.onclick = () => inviteToOffice(b.dataset.invite, b));
  root.querySelectorAll("[data-dm]").forEach((b) => b.onclick = () => openDm(b.dataset.dm, b.dataset.name));
};
async function renderOnlineBox() {
  const box = $("onlineBox");
  if (!prefs.name) {
    box.hidden = true;
    return;
  }
  try {
    const rows = await onlineNow();
    box.hidden = false;
    box.innerHTML = '<div class="ob-head"><b><i class="live-dot"></i>'.concat(L("Сейчас в игре", "Playing now"), ": ").concat(rows.filter((r) => !r.npc).length, '</b><button class="btn-chip" type="button" id="obAll">').concat(L("Все участники", "All players"), "</button></div>\n      ").concat(rows.length ? '<div class="board-list">'.concat(rows.slice(0, 6).map(onlineRow).join(""), "</div>") : '<p class="field-note">'.concat(L("Пока никого. Позовите коллег по ссылке — кнопка ниже.", "Nobody yet. Invite coworkers with a link — button below."), "</p>"));
    bindInvite(box);
    $("obAll").onclick = () => openBoard("menu", "people");
  } catch (e) {
    box.hidden = true;
  }
}
async function showOnlineModal() {
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass online-modal" role="dialog" aria-modal="true" aria-labelledby="olTitle"><h2 id="olTitle">'.concat(L("Сейчас в игре", "Playing now"), "</h2><p>").concat(L("Загружаю…", "Loading…"), "</p></div>");
  m.hidden = false;
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
  const rows = await onlineNow().catch(() => []);
  m.querySelector(".modal-box").innerHTML = '<h2 id="olTitle">'.concat(L("Сейчас в игре", "Playing now"), ": ").concat(rows.filter((r) => !r.npc).length, "</h2>\n    ").concat(rows.length ? '<div class="board-list">'.concat(rows.map(onlineRow).join(""), "</div>") : "<p>".concat(L("Сейчас никого нет.", "Nobody’s on right now."), "</p>"), '\n    <p class="field-note">').concat(L("Позвать в офис — и вы будете играть турниры и общаться в чате офиса.", "Invite them to your office — then you can play tournaments and chat together."), '</p>\n    <button class="btn-ghost" type="button" id="olClose">').concat(L("Вернуться к неделе", "Back to the week"), "</button>");
  bindInvite(m);
  $("olClose").onclick = () => {
    m.hidden = true;
  };
}
let inviteToOffice = async function(short, btn) {
  if (!registered()) {
    toast(L("Звать в свой офис могут зарегистрированные игроки", "Only registered players can invite people to their office"));
    if (views.game.hidden) {
      $("modal").hidden = true;
      renderJoin("register", L("Зарегистрируйтесь — и сможете создать свой офис и позвать в него коллег.", "Sign up to create your own office and invite your coworkers."));
    }
    return;
  }
  let team = myTeamCache || (await board.rpc("my_team", { p_id: prefs.playerId }).catch(() => []))[0];
  if (!team) {
    const name = await askOfficeName();
    if (!name) return;
    if (MOD.bad(name)) {
      toast(L("Такое название офиса не подойдёт — давайте без грубостей", "That office name won’t work — please keep it clean"));
      return;
    }
    try {
      await board.rpc("create_team", { p_id: prefs.playerId, p_name: name });
      team = myTeamCache = (await board.rpc("my_team", { p_id: prefs.playerId }))[0];
    } catch (err) {
      toast(err.message);
      return;
    }
  }
  try {
    const n = await board.rpc("invite_player", { p_id: prefs.playerId, p_short: short });
    if (btn) {
      btn.textContent = L("Приглашён", "Invited");
      btn.disabled = true;
    }
    toast(L("Приглашение в «".concat(team.name, "» отправлено: ").concat(n), "Invite to “".concat(team.name, "” sent: ").concat(n)));
  } catch (err) {
    toast(err.message);
  }
};
function askOfficeName() {
  return new Promise((done) => {
    const el = $("invitePop");
    el.innerHTML = '<form class="ip-form" id="ipForm"><span class="ip-text">'.concat(L("<b>Сначала создайте свой офис</b> — в него и позовём.", "<b>Create your office first</b> — that’s where we’ll invite them."), '</span>\n      <input id="ipName" maxlength="32" value="').concat(esc(L("Офис ".concat(prefs.name), "".concat(prefs.name, "’s Office")).slice(0, 32)), '" aria-label="').concat(L("Название офиса", "Office name"), '">\n      <span class="ip-btns"><button class="btn-main" type="submit">').concat(L("Создать и позвать", "Create and invite"), '</button><button class="btn-ghost" type="button" id="ipCancel">').concat(L("Отмена", "Cancel"), "</button></span></form>");
    el.hidden = false;
    $("ipName").focus();
    $("ipName").select();
    $("ipCancel").onclick = () => {
      el.hidden = true;
      done(null);
    };
    $("ipForm").onsubmit = (e) => {
      e.preventDefault();
      const n = $("ipName").value.trim();
      if (n.length < 2) {
        $("ipName").focus();
        return;
      }
      el.hidden = true;
      done(n);
    };
  });
}
async function showOffice() {
  if (!board.online) return offline(L("Мой офис", "My Office"));
  setPhase("evening");
  views.end.innerHTML = '<div class="end-sheet glass"><span class="kicker">'.concat(L("Мой офис", "My Office"), "</span><p>").concat(L("Загружаю…", "Loading…"), "</p></div>");
  show("end");
  let team;
  try {
    await board.touch("menu");
    team = (await board.rpc("my_team", { p_id: prefs.playerId }))[0];
  } catch (err) {
    views.end.innerHTML = '<div class="end-sheet glass"><span class="kicker">'.concat(L("Мой офис", "My Office"), "</span><h1>").concat(L("Нет связи", "No connection"), "</h1><p>").concat(esc(err.message), '</p><div class="stack"><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div></div>");
    $("toMenu").onclick = renderMenu;
    return;
  }
  const myId = shortId(await myTag);
  if (!team) {
    views.end.innerHTML = '<div class="end-sheet glass">\n      <span class="kicker">'.concat(L("Мой офис · ваш ID ".concat(myId), "My Office · your ID ".concat(myId)), "</span>\n      <h1>").concat(L("Соберите команду", "Build your team"), "</h1>\n      <p>").concat(L("Создайте офис и позовите коллег по ссылке или по их ID. Или вступите в офис по коду, который вам прислали.", "Create an office and invite coworkers by link or by their ID. Or join an office with a code someone sent you."), '</p>\n      <form class="inline-form" id="mkForm"><input id="mkName" maxlength="32" placeholder="').concat(L("Название офиса, например «Отдел продаж»", "Office name, e.g. “Sales Team”"), '" aria-label="').concat(L("Название офиса", "Office name"), '"><button class="btn-main" type="submit">').concat(L("Создать", "Create"), '</button></form>\n      <form class="inline-form" id="jnForm"><input id="jnCode" maxlength="6" placeholder="').concat(L("Код офиса", "Office code"), '" aria-label="').concat(L("Код офиса", "Office code"), '" autocapitalize="characters"><button class="btn-ghost" type="submit">').concat(L("Вступить", "Join"), '</button></form>\n      <p class="join-err" id="ofErr" role="alert"></p>\n      <div class="oc-box" id="ocBox" hidden></div>\n      <div class="stack"><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div></div>");
    $("toMenu").onclick = renderMenu;
    if (typeof ocRenderBox === "function") ocRenderBox(null);
    $("mkForm").onsubmit = async (e) => {
      e.preventDefault();
      const n = $("mkName").value.trim();
      if (n.length < 2) {
        $("ofErr").textContent = L("Название — хотя бы 2 символа.", "The name needs at least 2 characters.");
        return;
      }
      if (MOD.bad(n)) {
        $("ofErr").textContent = L("Такое название офиса не подойдёт — давайте без грубостей.", "That office name won’t work — please keep it clean.");
        return;
      }
      try {
        await board.rpc("create_team", { p_id: prefs.playerId, p_name: n });
        showOffice();
      } catch (err) {
        $("ofErr").textContent = err.message;
      }
    };
    $("jnForm").onsubmit = async (e) => {
      e.preventDefault();
      try {
        const n = await board.rpc("join_team", { p_id: prefs.playerId, p_code: $("jnCode").value });
        toast(L("Вы в офисе «".concat(n, "»"), "You’re in the “".concat(n, "” office")));
        showOffice();
      } catch (err) {
        $("ofErr").textContent = err.message;
      }
    };
    return;
  }
  const members = await board.rpc("team_members_list", { p_id: prefs.playerId }).catch(() => []);
  views.end.innerHTML = '<div class="end-sheet glass">\n    <span class="kicker">'.concat(L("Мой офис", "My Office"), " · ").concat(pl(members.length, "участник", "участника", "участников", "member", "members"), "</span>\n    <h1>").concat(esc(team.name), '</h1>\n    <div class="oc-box" id="ocBox" hidden></div>\n    <div class="office-code"><span class="kicker">').concat(L("Код офиса", "Office code"), "</span><b>").concat(team.code, "</b><small>").concat(esc(inviteLink(team.code)), '</small>\n      <button class="btn-ghost" id="cpLink">').concat(L("Скопировать ссылку-приглашение", "Copy invite link"), '</button></div>\n    <form class="inline-form" id="invForm"><input id="invId" maxlength="6" placeholder="').concat(L("ID игрока, например 3FA9C1", "Player ID, e.g. 3FA9C1"), '" aria-label="').concat(L("ID игрока", "Player ID"), '" autocapitalize="characters"><button class="btn-main" type="submit">').concat(L("Позвать", "Invite"), '</button></form>\n    <p class="join-err" id="ofErr" role="alert"></p>\n    <div class="members panel board-list">').concat(members.map((m) => '<div class="lb-row person'.concat(m.is_me ? " me" : "", '">\n      <span class="lb-ava" aria-hidden="true">').concat(esc(m.avatar || "🙂"), '</span>\n      <span class="lb-who"><b>').concat(esc(m.name)).concat(m.is_me ? L(" (вы)", " (you)") : "").concat(m.is_owner ? L(" · создатель", " · founder") : "", "</b><small>").concat(esc(m.dept || L("без отдела", "no department")), " · ID ").concat(m.short_id, '</small></span>\n      <span class="lb-res">').concat(personStatus(m), "</span></div>")).join(""), '</div>\n    <div class="tour-box" id="tourBox"><span class="kicker">').concat(L("Турнир офиса", "Office tournament"), '</span><p class="field-note">').concat(L("Загружаю…", "Loading…"), '</p></div>\n    <div class="stack"><button class="btn-main" id="toChat">').concat(L("Чат офиса", "Office chat"), '</button><button class="btn-ghost" id="leave">').concat(L("Покинуть офис", "Leave office"), '</button><button class="btn-ghost" id="toMenu">').concat(L("В главное меню", "Main menu"), "</button></div></div>");
  $("toMenu").onclick = renderMenu;
  $("toChat").onclick = () => showChat("team");
  renderTourBox(team);
  if (typeof ocRenderBox === "function") ocRenderBox(team, members);
  $("cpLink").onclick = () => copy(L("Заходи в наш офис «".concat(team.name, "» в игре «Выжить до пятницы»: ").concat(inviteLink(team.code)), "Join our “".concat(team.name, "” office in Survive till Friday: ").concat(inviteLink(team.code))), L("Ссылка скопирована — отправьте её в рабочий чат", "Link copied — drop it in your work chat"));
  $("invForm").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const n = await board.rpc("invite_player", { p_id: prefs.playerId, p_short: $("invId").value });
      $("invId").value = "";
      $("ofErr").textContent = "";
      toast(L("Приглашение отправлено: ".concat(n), "Invite sent: ".concat(n)));
    } catch (err) {
      $("ofErr").textContent = err.message;
    }
  };
  $("leave").onclick = async () => {
    const b = $("leave");
    if (!b.dataset.armed) {
      b.dataset.armed = "1";
      b.textContent = L("Точно покинуть офис? Нажмите ещё раз", "Really leave the office? Tap again");
      return;
    }
    await board.rpc("leave_team", { p_id: prefs.playerId }).catch((err) => toast(err.message));
    showOffice();
  };
}
async function showStats() {
  var _a, _b;
  views.end.classList.add("screen-view");
  show("end");
  setPhase("evening");
  views.end.innerHTML = '<div class="screen"><div class="scr-head"><h1>'.concat(L("Статистика", "Stats"), '</h1><p class="scr-when">').concat(L("Загружаю…", "Loading…"), "</p></div></div>");
  try {
    const get = (v) => fetch("".concat(window.SUPABASE_CONFIG.url.replace(/\/+$/, ""), "/rest/v1/").concat(v, "?select=*"), { headers: { apikey: window.SUPABASE_CONFIG.anonKey } }).then((r) => r.ok ? r.json() : Promise.reject(new Error(L("Supabase ответил ".concat(r.status, " на ").concat(v), "Supabase returned ".concat(r.status, " for ").concat(v)))));
    const [[o], killers, [f], modes] = await Promise.all(["stats_overview", "stats_killers", "stats_funnel", "stats_modes"].map(get));
    const [sources, shares] = await Promise.all(["stats_sources", "stats_shares"].map((v) => get(v).catch(() => [])));
    const SHARE = EN ? { meme: "meme card", challenge: "Daily Week challenge", team: "invite coworkers", friends: "invite friends" } : { meme: "мем-карточка", challenge: "вызов на неделю дня", team: "позвать коллег", friends: "позвать друзей" };
    const box = (v, l) => '<div class="stat-box"><b>'.concat(v != null ? v : 0, "</b><span>").concat(l, "</span></div>");
    const pct = (a, b) => b ? Math.round(100 * a / b) + "%" : "—";
    views.end.innerHTML = '<div class="screen stats">\n      <div class="scr-head"><span class="kicker">'.concat(L("Только сводные цифры, без личных данных", "Aggregate numbers only, no personal data"), "</span><h1>").concat(L("Статистика игры", "Game stats"), '</h1></div>\n      <div class="stats-grid">').concat(box(o.players, L("игроков всего", "total players"))).concat(box(o.active_day, L("за сутки", "last 24 hours"))).concat(box(o.active_week, L("за неделю", "last 7 days"))).concat(box(o.weeks, L("недель сыграно", "weeks played")), "\n        ").concat(box(((_a = o.win_rate) != null ? _a : 0) + "%", L("недель закрыто", "weeks survived"))).concat(box(((_b = o.quiz_rate) != null ? _b : 0) + "%", L("верных на втором шансе", "correct on Second chance"))).concat(box(o.shares, L("приглашений открыто", "invites opened"))).concat(box(o.installs, L("установок на телефон", "phone installs")), "</div>\n      <h2>").concat(L("Воронка", "Funnel"), '</h2>\n      <div class="stats-grid">').concat(box(f.opened, L("зашли в игру", "opened the game"))).concat(box("".concat(f.week1, " · ").concat(pct(f.week1, f.opened)), L("доиграли 1 неделю", "finished 1 week"))).concat(box("".concat(f.week3, " · ").concat(pct(f.week3, f.opened)), L("3 недели", "3 weeks"))).concat(box("".concat(f.week10, " · ").concat(pct(f.week10, f.opened)), L("10 недель", "10 weeks"))).concat(box(f.year, L("весь год", "full year")), "</div>\n      <h2>").concat(L("По режимам", "By mode"), '</h2>\n      <div class="scr-list">').concat(modes.map((m) => '<div class="scr-row"><span class="scr-pos">'.concat(m.weeks, '</span><span></span><span class="scr-name"><b>').concat((EN ? { career: "Career", daily: "Daily Week", tour: "Tournament", pack: "Branded" } : { career: "Карьера", daily: "Неделя дня", tour: "Турнир", pack: "Брендированная" })[m.mode] || m.mode, "</b><small>").concat(L("в среднем ходов за неделю: ".concat(m.avg_step, " из ").concat(WEEK_LEN), "avg moves per week: ".concat(m.avg_step, " of ").concat(WEEK_LEN)), '</small></span><span class="scr-res won">').concat(m.win_rate, "%</span></div>")).join("") || '<p class="scr-empty">'.concat(L("Пока нет данных", "No data yet"), "</p>"), "</div>\n      <h2>").concat(L("Откуда пришли (30 дней)", "Traffic sources (30 days)"), '</h2>\n      <div class="scr-list">').concat(sources.map((s) => '<div class="scr-row"><span class="scr-pos">'.concat(s.players, '</span><span></span><span class="scr-name"><b>').concat(esc(s.source), "</b><small>").concat(L("доиграли неделю", "finished a week"), ": ").concat(s.played, " · ").concat(pct(s.played, s.players), '</small></span><span class="scr-res won">').concat(pct(s.players, sources.reduce((a, x) => a + x.players, 0)), "</span></div>")).join("") || '<p class="scr-empty">'.concat(L("Пока нет данных", "No data yet"), "</p>"), "</div>\n      <h2>").concat(L("Чем делятся", "What people share"), '</h2>\n      <div class="scr-list">').concat(shares.map((s) => '<div class="scr-row"><span class="scr-pos">'.concat(s.shares, '</span><span></span><span class="scr-name"><b>').concat(esc(SHARE[s.kind] || s.kind), "</b></span><span></span></div>")).join("") || '<p class="scr-empty">'.concat(L("Пока нет данных", "No data yet"), "</p>"), "</div>\n      <h2>").concat(L("Карточки, на которых чаще всего увольняют", "Cards that get people fired most"), '</h2>\n      <div class="scr-list">').concat(killers.map((k, i) => {
      var _a2, _b2;
      return '<div class="scr-row"><span class="scr-pos">'.concat(i + 1, '</span><span></span><span class="scr-name"><b>').concat(esc(((_b2 = (_a2 = byId[k.card_id]) == null ? void 0 : _a2.text) == null ? void 0 : _b2.slice(0, 90)) || k.card_id), "</b><small>").concat(esc(k.card_id), '</small></span><span class="scr-res lost">').concat(k.losses, "</span></div>");
    }).join("") || '<p class="scr-empty">'.concat(L("Пока нет данных", "No data yet"), "</p>"), '</div>\n      <button class="btn-ghost scr-exit" id="stBack">').concat(L("Закрыть", "Close"), "</button></div>");
  } catch (err) {
    views.end.innerHTML = '<div class="end-sheet glass"><h1>'.concat(L("Нет данных", "No data"), "</h1><p>").concat(esc(err.message), ". ").concat(L("Выполните свежий supabase/schema.sql.", "Run the latest supabase/schema.sql."), '</p><div class="stack"><button class="btn-ghost" id="stBack">').concat(L("Закрыть", "Close"), "</button></div></div>");
  }
  $("stBack").onclick = () => {
    views.end.classList.remove("screen-view");
    history.replaceState(null, "", location.pathname);
    prefs.name ? renderMenu() : renderWelcome();
  };
}
const fmtTime = (iso) => new Date(iso).toLocaleString(LOCALE, { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const until = (iso) => {
  const m = Math.round((new Date(iso) - Date.now()) / 6e4);
  return m <= 0 ? L("уже идёт", "now") : m < 60 ? L("через ".concat(m, " мин"), "in ".concat(m, " min")) : m < 1440 ? L("через ".concat(Math.floor(m / 60), " ч ").concat(m % 60, " мин"), "in ".concat(Math.floor(m / 60), "h ").concat(m % 60, "m")) : L("через ".concat(Math.floor(m / 1440), " дн."), "in ".concat(Math.floor(m / 1440), " days"));
};
let tourTimer = null;
async function renderTourBox(team) {
  const box = $("tourBox");
  if (!box) return;
  const t = (await board.rpc("my_tournament", { p_id: prefs.playerId }).catch(() => []))[0] || null;
  const played = t && store.get("vdp-tours", {})[t.tour_id];
  const started = t && new Date(t.starts_at) <= Date.now();
  const pad = (n) => String(n).padStart(2, "0"), soon = new Date(Date.now() + 36e5);
  const def = "".concat(soon.getFullYear(), "-").concat(pad(soon.getMonth() + 1), "-").concat(pad(soon.getDate()), "T").concat(pad(soon.getHours()), ":00");
  box.innerHTML = '<span class="kicker">'.concat(L("Турнир офиса", "Office tournament"), "</span>\n    ").concat(t ? '<p class="tour-when"><b>'.concat(started ? L("Турнир идёт", "Tournament is on") : L("Старт ".concat(until(t.starts_at)), "Starts ".concat(until(t.starts_at))), "</b><span>").concat(fmtTime(t.starts_at), "</span></p>") : '<p class="field-note">'.concat(L("Одна и та же неделя для всего офиса, общий старт и таблица итогов на большом экране.", "Same week for the whole office, one start time, and a results table for the big screen."), "</p>"), "\n    ").concat(t && started ? '<button class="btn-main" id="tourPlay">'.concat(played ? L("Сыграть ещё раз (не в зачёт)", "Play again (won’t count)") : L("Играть турнир", "Play the tournament"), "</button>") : "", "\n    ").concat(t ? '<button class="btn-ghost" id="tourScreen">'.concat(L("Экран итогов для проектора", "Results screen for the projector"), "</button>") : "", "\n    ").concat(team.is_owner ? '<form class="inline-form" id="tourForm"><input id="tourAt" type="datetime-local" value="'.concat(def, '" aria-label="').concat(L("Время старта турнира", "Tournament start time"), '"><button class="btn-ghost" type="submit">').concat(t ? L("Новый турнир", "New tournament") : L("Назначить", "Schedule"), "</button></form>") : t ? "" : '<p class="field-note">'.concat(L("Назначить турнир может создатель офиса.", "Only the office founder can schedule a tournament."), "</p>"), '\n    <p class="join-err" id="tourErr" role="alert"></p>');
  if ($("tourPlay")) $("tourPlay").onclick = async () => {
    await whenReady($("tourPlay"), true);
    startTournament(t, !played);
  };
  if ($("tourScreen")) $("tourScreen").onclick = () => openScreen(t.code);
  if ($("tourForm")) $("tourForm").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await board.rpc("set_tournament", { p_id: prefs.playerId, p_starts: new Date($("tourAt").value).toISOString() });
      toast(L("Турнир назначен — коллеги увидят его в «Мой офис» и в меню", "Tournament scheduled — your coworkers will see it in “My Office” and in the menu"));
      renderTourBox(team);
    } catch (err) {
      $("tourErr").textContent = err.message;
    }
  };
  clearTimeout(tourTimer);
  if (t && !started) tourTimer = setTimeout(() => renderTourBox(team), 3e4);
}
function startTournament(t, ranked) {
  if (!poolDone) return void poolFull().then(() => startTournament(t, ranked));
  const rng = seeded("vdp-tour-" + t.seed);
  C = null;
  S = newWeekState({ mode: "tour", res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: "normal", rng, extra: { tourId: t.tour_id, tourCode: t.code, tourTeam: t.team_name } });
  S.deck = buildDeck({ type: "normal", rng, profCard: false, classic: !POOL.length });
  S.ranked = ranked;
  enterGame();
}
let screenTimer = null;
function openScreen(code) {
  clearInterval(screenTimer);
  views.end.classList.add("screen-view");
  show("end");
  setPhase("evening");
  const load = async () => {
    if (views.end.hidden || !views.end.classList.contains("screen-view")) return clearInterval(screenTimer);
    let rows = [];
    try {
      rows = await board.rpc("tournament_board", { p_code: code });
    } catch (err) {
      views.end.innerHTML = '<div class="end-sheet glass"><h1>'.concat(L("Нет данных", "No data"), "</h1><p>").concat(esc(err.message), '</p><div class="stack"><button class="btn-ghost" id="scrBack">').concat(L("Назад", "Back"), "</button></div></div>");
      $("scrBack").onclick = closeScreen;
      return;
    }
    const head = rows[0], players = rows.filter((r) => r.name);
    views.end.innerHTML = '<div class="screen">\n      <div class="scr-head"><span class="kicker">'.concat(L("Турнир офиса · обновляется каждые 10 секунд", "Office tournament · refreshes every 10 seconds"), "</span>\n        <h1>").concat(head ? esc(head.team_name) : L("Турнир не найден", "Tournament not found"), "</h1>\n        ").concat(head ? '<p class="scr-when">'.concat(new Date(head.starts_at) > Date.now() ? L("Старт ".concat(until(head.starts_at), " · ").concat(fmtTime(head.starts_at)), "Starts ".concat(until(head.starts_at), " · ").concat(fmtTime(head.starts_at))) : L("Идёт с ".concat(fmtTime(head.starts_at), " · сыграли: ").concat(players.length), "Running since ".concat(fmtTime(head.starts_at), " · played: ").concat(players.length)), "</p>") : "", '</div>\n      <div class="scr-list">').concat(players.length ? players.map((r, i) => '<div class="scr-row'.concat(i < 3 ? " top" : "", '">\n        <span class="scr-pos">').concat(i + 1, '</span><span class="scr-ava" aria-hidden="true">').concat(esc(r.avatar || "🙂"), '</span>\n        <span class="scr-name"><b>').concat(esc(r.name), "</b><small>").concat(esc(r.dept || ""), '</small></span>\n        <span class="scr-res ').concat(r.won ? "won" : "lost", '">').concat(r.won ? "".concat(r.total, "/400") : "".concat(stepName(r.step), " · ").concat(r.death ? resName(r.death) : "", " ").concat(r.overheat ? "100" : "0", "%"), "</span></div>")).join("") : '<p class="scr-empty">'.concat(L("Пока никто не сыграл. Ждём первых результатов!", "Nobody has played yet. Waiting for the first results!"), "</p>"), '</div>\n      <button class="btn-ghost scr-exit" id="scrBack">').concat(L("Закрыть экран", "Close screen"), "</button></div>");
    $("scrBack").onclick = closeScreen;
  };
  const closeScreen = () => {
    clearInterval(screenTimer);
    views.end.classList.remove("screen-view");
    history.replaceState(null, "", location.pathname);
    prefs.name ? renderMenu() : renderWelcome();
  };
  load();
  screenTimer = setInterval(load, 1e4);
}
let chatTimer = null, chatLast = "", chatChannel = "";
async function showChat(channel) {
  if (!board.online) return offline(L("Чат", "Chat"));
  setPhase("evening");
  clearInterval(chatTimer);
  chatLast = "";
  chatChannel = channel;
  views.end.innerHTML = '<div class="chat">\n    <div class="board-head"><button class="back-btn" id="chBack" type="button">'.concat(L("← Назад", "← Back"), "</button><h2>").concat(channel === "team" ? L("Чат офиса", "Office chat") : L("Общий чат", "General chat"), '</h2><span class="back-sp"></span></div>\n    <div class="tabs tabs4" role="tablist"><button class="tab" role="tab" id="chFeed" aria-selected="false">').concat(L("Лента", "Feed"), '</button><button class="tab" role="tab" id="chTeam" aria-selected="').concat(channel === "team", '">').concat(L("Офис", "Office"), '</button><button class="tab" role="tab" id="chAll" aria-selected="').concat(channel === "global", '">').concat(L("Все игроки", "Everyone"), '</button><button class="tab" role="tab" id="chDm" aria-selected="false">').concat(L("Личные", "Direct"), '</button></div>\n    <div class="chat-list panel" id="chList" aria-live="polite"><div class="lb-empty">').concat(L("Загружаю…", "Loading…"), '</div></div>\n    <form class="chat-form" id="chForm"><input id="chText" maxlength="300" placeholder="').concat(L("Сообщение", "Message"), '" autocomplete="off" aria-label="').concat(L("Сообщение", "Message"), '"><button class="btn-main" type="submit">').concat(L("Отправить", "Send"), "</button></form>\n  </div>");
  views.end.classList.add("chat-view");
  show("end");
  const leave = () => {
    clearInterval(chatTimer);
    chatChannel = "";
    views.end.classList.remove("chat-view");
  };
  $("chBack").onclick = () => {
    leave();
    renderMenu();
  };
  $("chTeam").onclick = () => {
    leave();
    showChat("team");
  };
  $("chAll").onclick = () => {
    leave();
    showChat("global");
  };
  $("chDm").onclick = () => {
    leave();
    showDmInbox();
  };
  $("chFeed").onclick = () => {
    leave();
    showFeed();
  };
  socChatExtras();
  await board.touch("menu").catch(() => {
  });
  const load = async () => {
    if (!$("chList")) return clearInterval(chatTimer);
    try {
      const rows = (await board.rpc("get_messages", { p_id: prefs.playerId, p_channel: channel })).reverse();
      const sig = rows.map((r) => r.msg_id).join(",");
      const top = Math.max(0, ...rows.map((r) => r.msg_id)), cs = prefs.chatSeen || (prefs.chatSeen = {});
      if (top > (cs[channel] || 0)) {
        cs[channel] = top;
        store.set(KEY.prefs, prefs);
      }
      if (sig === chatLast) return;
      chatLast = sig;
      const list = $("chList"), atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
      if (channel === "team" && !rows.length) {
        const team = (await board.rpc("my_team", { p_id: prefs.playerId }))[0];
        list.innerHTML = team ? L('<div class="lb-empty"><span class="big">Тишина</span>В чате офиса «'.concat(esc(team.name), "» пока пусто. Напишите первыми!</div>"), '<div class="lb-empty"><span class="big">Crickets</span>The “'.concat(esc(team.name), "” office chat is empty. Break the ice!</div>")) : L('<div class="lb-empty"><span class="big">Нет офиса</span>Чат офиса появится, когда вы создадите офис или вступите в него. А пока есть общий чат.</div>', '<div class="lb-empty"><span class="big">No office</span>The office chat appears once you create or join an office. Meanwhile, there’s the general chat.</div>');
        return;
      }
      list.innerHTML = rows.length ? rows.map((m) => '<div class="msg'.concat(m.mine ? " mine" : "", '"><span class="ava-s" aria-hidden="true">').concat(esc(m.avatar || "🙂"), '</span>\n        <span class="meta">').concat(m.mine ? "" : "<b>".concat(esc(m.name), "</b> · ")).concat(new Date(m.sent_at).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })).concat(m.dept && !m.mine ? " · ".concat(esc(m.dept)) : "", "</span>\n        ").concat(m.gift ? socGiftBubble(m.name, m.gift_to, m.gift) : socMsgHtml(m.msg), "\n        ").concat(socSlot("msg", m.msg_id, m.short_id, m.name, m.mine), '\n        <span class="msg-act">').concat(m.can_hide ? '<button data-hide="'.concat(m.msg_id, '">').concat(L("Скрыть", "Hide"), "</button>") : "").concat(m.mine ? "" : '<button data-report="'.concat(m.msg_id, '">').concat(L("Пожаловаться", "Report"), "</button>"), "</span></div>")).join("") : L('<div class="lb-empty"><span class="big">Тишина</span>Сообщений пока нет. Напишите первыми!</div>', '<div class="lb-empty"><span class="big">Crickets</span>No messages yet. Break the ice!</div>');
      socDecorate(list, "msg");
      list.querySelectorAll("[data-hide]").forEach((b) => b.onclick = async () => {
        try {
          await board.rpc("hide_message", { p_id: prefs.playerId, p_msg: +b.dataset.hide });
          toast(L("Сообщение скрыто", "Message hidden"));
          chatLast = "";
          load();
        } catch (err) {
          toast(err.message);
        }
      });
      list.querySelectorAll("[data-report]").forEach((b) => b.onclick = async () => {
        try {
          await board.rpc("report_message", { p_id: prefs.playerId, p_msg: +b.dataset.report });
          b.textContent = L("Жалоба отправлена", "Reported");
          b.disabled = true;
          toast(L("Спасибо. После трёх жалоб сообщение скроется", "Thanks. After three reports the message gets hidden"));
          chatLast = "";
        } catch (err) {
          toast(err.message);
        }
      });
      if (atBottom || rows.some((r) => r.mine)) list.scrollTop = list.scrollHeight;
    } catch (err) {
      $("chList").innerHTML = '<div class="lb-empty"><span class="big">'.concat(L("Нет связи", "No connection"), "</span>").concat(esc(err.message), "</div>");
    }
  };
  $("chForm").onsubmit = async (e) => {
    e.preventDefault();
    const t = $("chText").value.trim();
    if (!t) return;
    if (MOD.rude(t)) {
      toast(L("Сообщение не отправлено: давайте без грубостей", "Message not sent: please keep it civil"));
      return;
    }
    try {
      await board.rpc("post_message", { p_id: prefs.playerId, p_channel: channel, p_text: t });
      $("chText").value = "";
      chatLast = "";
      load();
    } catch (err) {
      toast(err.message);
    }
  };
  await load();
  chatTimer = setInterval(() => {
    if (!document.hidden) load();
  }, 4e3);
}
let dmOpen = "", dmTimer = null;
const dmNeedAccount = () => {
  toast(L("Писать игрокам могут зарегистрированные игроки", "Only registered players can send messages"));
  if (views.game.hidden) {
    $("modal").hidden = true;
    renderJoin("register", L("Зарегистрируйтесь — и сможете переписываться с игроками и звать их в свой офис.", "Sign up to message players and invite them to your office."));
  }
};
let openDm = async function(short, name) {
  if (!board.online) return toast(L("Сообщения работают, когда есть связь с сервером", "Messages need a connection to the server"));
  if (!registered()) return dmNeedAccount();
  const m = $("modal");
  clearInterval(dmTimer);
  dmOpen = short;
  m.innerHTML = '<div class="modal-box glass dm-box" role="dialog" aria-modal="true" aria-labelledby="dmTitle">\n    <div class="dm-head"><h2 id="dmTitle">✉ '.concat(esc(name || L("Игрок", "Player")), '</h2><button class="btn-chip soc-dm-gift" type="button" id="dmGift">🎁 ').concat(L("Подарок", "Gift"), '</button><button class="ip-x" type="button" id="dmClose" aria-label="').concat(L("Закрыть", "Close"), '">×</button></div>\n    <div class="dm-list" id="dmList" aria-live="polite"><div class="lb-empty">').concat(L("Загружаю…", "Loading…"), '</div></div>\n    <form class="chat-form" id="dmForm"><input id="dmText" maxlength="300" placeholder="').concat(L("Сообщение", "Message"), '" autocomplete="off" aria-label="').concat(L("Сообщение", "Message"), '"><button class="btn-main" type="submit">').concat(L("Отправить", "Send"), "</button></form></div>");
  m.hidden = false;
  const close = () => {
    clearInterval(dmTimer);
    dmOpen = "";
    m.hidden = true;
  };
  $("dmClose").onclick = close;
  m.onclick = (e) => {
    if (e.target === m) close();
  };
  $("dmGift").onclick = () => {
    clearInterval(dmTimer);
    dmOpen = "";
    socGiftPicker({ kind: lastId ? "dm" : "profile", id: lastId || null, to: short, name, back: () => openDm(short, name) });
  };
  let sig = "", lastId = 0;
  const load = async () => {
    if (!$("dmList") || dmOpen !== short) return clearInterval(dmTimer);
    try {
      const rows = (await board.rpc("dm_thread", { p_id: prefs.playerId, p_with: short }) || []).reverse();
      const s2 = rows.map((r) => r.msg_id).join(",");
      if (s2 === sig) return;
      sig = s2;
      lastId = rows.length ? rows[rows.length - 1].msg_id : 0;
      const list = $("dmList");
      list.innerHTML = rows.length ? rows.map((r) => '<div class="msg'.concat(r.mine ? " mine" : "", '"><span class="meta">').concat(new Date(r.sent_at).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }), "</span>").concat(r.gift ? socGiftBubble(r.mine ? L("Вы", "You") : name, r.mine ? name : L("вам", "you"), r.gift) : socMsgHtml(r.msg)).concat(r.mine ? "" : socSlot("dm", r.msg_id, short, name, false), "</div>")).join("") : '<div class="lb-empty">'.concat(L("Напишите первым — например, позовите в свой офис или вызовите на неделю дня.", "Say hi first — invite them to your office or challenge them to the Daily Week."), "</div>");
      list.scrollTop = list.scrollHeight;
      socDecorate(list, "dm");
    } catch (err) {
      $("dmList").innerHTML = '<div class="lb-empty">'.concat(esc(err.message), "</div>");
    }
  };
  $("dmForm").onsubmit = async (e) => {
    e.preventDefault();
    const t = $("dmText").value.trim();
    if (!t) return;
    if (MOD.rude(t)) {
      toast(L("Сообщение не отправлено: давайте без грубостей", "Message not sent: please keep it civil"));
      return;
    }
    try {
      await board.rpc("send_dm", { p_id: prefs.playerId, p_to: short, p_text: t });
      $("dmText").value = "";
      sig = "";
      load();
      bus.emit("dm");
    } catch (err) {
      toast(err.message);
    }
  };
  await load();
  dmTimer = setInterval(() => {
    if (!document.hidden) load();
  }, 5e3);
  if (matchMedia("(pointer: fine)").matches) $("dmText").focus();
};
async function showDmInbox() {
  if (!board.online) return offline(L("Чат", "Chat"));
  if (!registered()) return dmNeedAccount();
  setPhase("evening");
  clearInterval(chatTimer);
  chatChannel = "dm";
  views.end.innerHTML = '<div class="chat">\n    <div class="board-head"><button class="back-btn" id="chBack" type="button">'.concat(L("← Назад", "← Back"), "</button><h2>").concat(L("Личные сообщения", "Direct messages"), '</h2><span class="back-sp"></span></div>\n    <div class="tabs tabs4" role="tablist"><button class="tab" role="tab" id="chFeed" aria-selected="false">').concat(L("Лента", "Feed"), '</button><button class="tab" role="tab" id="chTeam" aria-selected="false">').concat(L("Офис", "Office"), '</button><button class="tab" role="tab" id="chAll" aria-selected="false">').concat(L("Все игроки", "Everyone"), '</button><button class="tab" role="tab" id="chDm" aria-selected="true">').concat(L("Личные", "Direct"), '</button></div>\n    <div class="chat-list panel board-list" id="chList"><div class="lb-empty">').concat(L("Загружаю…", "Loading…"), "</div></div></div>");
  views.end.classList.add("chat-view");
  show("end");
  const leave = () => {
    chatChannel = "";
    views.end.classList.remove("chat-view");
  };
  $("chBack").onclick = () => {
    leave();
    renderMenu();
  };
  $("chTeam").onclick = () => {
    leave();
    showChat("team");
  };
  $("chAll").onclick = () => {
    leave();
    showChat("global");
  };
  $("chFeed").onclick = () => {
    leave();
    showFeed();
  };
  try {
    const rows = await board.rpc("dm_inbox", { p_id: prefs.playerId }) || [];
    $("chList").innerHTML = rows.length ? rows.map((r, i) => '<button class="lb-row person dm-row" type="button" data-i="'.concat(i, '"><span class="lb-ava" aria-hidden="true">').concat(esc(r.with_avatar || "🙂"), '</span>\n      <span class="lb-who"><b>').concat(esc(r.with_name), "</b><small>").concat(esc(r.last_msg.slice(0, 60)), '</small></span><span class="lb-res">').concat(r.unread ? '<b class="dm-unread">'.concat(r.unread, "</b>") : "", "<small>").concat(ago(r.last_at), "</small></span></button>")).join("") : '<div class="lb-empty"><span class="big">'.concat(L("Пока пусто", "Nothing yet"), "</span>").concat(L("Напишите тому, кто сейчас в игре: лента игроков есть в меню и прямо во время недели.", "Message someone who’s playing now: the live strip is in the menu and right in the game."), "</div>");
    $("chList").querySelectorAll("[data-i]").forEach((b) => b.onclick = async () => {
      const r = rows[+b.dataset.i];
      await openDm(r.with_short, r.with_name);
    });
  } catch (err) {
    $("chList").innerHTML = '<div class="lb-empty">'.concat(esc(err.message), "</div>");
  }
}
function personPop(p) {
  const m = $("modal");
  m.innerHTML = '<div class="modal-box glass person-pop" role="dialog" aria-modal="true" aria-labelledby="ppName">\n    <span class="pp-ava" aria-hidden="true">'.concat(esc(p.avatar || "🙂"), '</span><h2 id="ppName">').concat(esc(p.name), "</h2>\n    <p>").concat(esc(p.dept || L("без отдела", "no department"))).concat(p.prof && PROF[p.prof] ? " · " + esc(profOf(p)) : "").concat(p.prof_custom && !p.npc ? ' <button class="btn-link soc-rep-title" type="button" data-rep-title="'.concat(esc(p.short_id || ""), '">').concat(L("Пожаловаться на название", "Report title"), "</button>") : "", "</p><p>").concat(personStatus(p), "</p>\n    ").concat(p.rank && typeof RANKS !== "undefined" && RANKS[p.rank] ? '<p class="pp-rank">🎖️ '.concat(RANKS[p.rank].name, "</p>") : "").concat(p.desk ? '<p class="pp-desk" title="'.concat(L("Рабочий стол", "Desk"), '">').concat(esc(p.desk), "</p>") : "", "\n    ").concat(p.npc ? '<p class="npc-note">🎭 '.concat(L("Персонаж игры: отвечает сам, пока живых коллег в сети мало", "A game character: replies on their own while few real players are online"), "</p>") : "", '\n    <div class="row2"><button class="btn-main" type="button" id="ppDm">✉ ').concat(L("Написать", "Message"), '</button><button class="btn-ghost" type="button" id="ppInv">🏢 ').concat(L("Позвать в офис", "Invite to office"), '</button></div>\n    <button class="btn-ghost" type="button" id="ppClose">').concat(L("Вернуться к неделе", "Back to the week"), "</button></div>");
  m.hidden = false;
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
  $("ppDm").onclick = () => openDm(p.short_id, p.name);
  $("ppInv").onclick = () => inviteToOffice(p.short_id, $("ppInv"));
  $("ppClose").onclick = () => {
    m.hidden = true;
  };
}
const gameUrl = () => /^https?:/.test(location.href) ? location.origin + location.pathname.replace(/old(-en)?\.html$/, (m, en) => en ? "en.html" : "") : "https://survivefriday.com/";
async function referralLink(kind) {
  var _a;
  const ref = shortId(await myTag);
  let team = null;
  if (kind === "team" && registered()) team = myTeamCache || (await board.rpc("my_team", { p_id: prefs.playerId }).catch(() => []))[0] || null;
  const tg = (_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.telegram;
  if (window.VK_MINI && window.VK_APP_ID) return { url: "https://vk.com/app".concat(VK_APP_ID, "#ref-").concat(ref).concat(team ? "_join-".concat(team.code) : ""), team };
  if (tg == null ? void 0 : tg.bot) return { url: "https://t.me/".concat(tg.bot).concat(tg.app ? "/".concat(tg.app) : "", "?startapp=ref-").concat(ref).concat(team ? "_join-".concat(team.code) : ""), team };
  return { url: "".concat(gameUrl(), "?ref=").concat(ref).concat(team ? "&join=".concat(team.code) : ""), team };
}
async function challengeLink(code) {
  var _a;
  const ref = shortId(await myTag), tg = (_a = window.SUPABASE_CONFIG) == null ? void 0 : _a.telegram;
  if (window.VK_MINI && window.VK_APP_ID) return "https://vk.com/app".concat(VK_APP_ID, "#ref-").concat(ref, "_ch-").concat(code);
  if (tg == null ? void 0 : tg.bot) return "https://t.me/".concat(tg.bot).concat(tg.app ? "/".concat(tg.app) : "", "?startapp=ref-").concat(ref, "_ch-").concat(code);
  return "".concat(gameUrl(), "?ref=").concat(ref, "&ch=").concat(code, "&by=").concat(encodeURIComponent(prefs.name.slice(0, 24)));
}
function rememberChallenge(code, by, ref) {
  const c = parseChallenge(code);
  if (!c || prefs.challenge && prefs.challenge.day === c.day && prefs.challenge.ref === ref && prefs.challenge.num === c.num) return;
  prefs.challenge = { ...c, by: (by || "").slice(0, 24), ref: (ref || "").toUpperCase(), at: Date.now() };
  store.set(KEY.prefs, prefs);
}
{
  const q = new URLSearchParams(location.search);
  if (q.get("ch")) {
    rememberChallenge(q.get("ch"), q.get("by"), q.get("ref"));
    q.delete("ch");
    q.delete("by");
    history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
  }
}
async function renderChallengeCta() {
  const c = prefs.challenge, el = $("chCta");
  el.hidden = !c || c.done || Date.now() - c.at > 14 * 864e5;
  if (el.hidden) return;
  if (!c.by && c.ref && board.online) {
    const p = (await board.people().catch(() => [])).find((x) => shortId(x.tag) === c.ref);
    if (p == null ? void 0 : p.name) {
      c.by = p.name;
      store.set(KEY.prefs, prefs);
    }
  }
  el.querySelector("span").innerHTML = L("<b>Вызов: ".concat(esc(chName(c)), "</b> ").concat(chResult(c), ". Неделя дня ").concat(dayLabel(c.day), " — та же самая. Сможете лучше?"), "<b>Challenge: ".concat(esc(chName(c)), "</b> ").concat(chResult(c), ". Same Daily Week ").concat(dayLabel(c.day), ". Can you beat it?"));
  $("chGo").onclick = async () => {
    await whenReady($("chGo"), true);
    startDaily(c.day);
  };
}
function shareText(kind, team) {
  return kind === "team" ? team ? L("Я в нашем офисе «".concat(team.name, "» в игре «Выжить до пятницы». Заходи в команду — проверим, кто дольше продержится до пятницы!"), "I’m in our “".concat(team.name, "” office in Survive till Friday. Join the team — let’s see who lasts longest till Friday!")) : L("Играю в «Выжить до пятницы» — офисный симулятор, где Босс на 100% хуже увольнения. Давай сыграем всем отделом и сравним, кто дольше продержится!", "Playing Survive till Friday — the office sim where a Boss at 100% is worse than getting fired. Let’s get the whole department in and see who lasts longest!") : L("Затягивает: «Выжить до пятницы» — офисный симулятор в духе Reigns. Держи Кукуху, Энергию, Босса и Коллег в балансе до пятницы, 18:00. Попробуй!", "Seriously addictive: Survive till Friday — a Reigns-style office sim. Keep your Sanity, Energy, Boss and Team in balance until Friday, 6 PM. Give it a try!");
}
const SHARE_ONCE = 10, SHARE_DAILY = 5, REF_CASH = 15;
function shareReward(via) {
  var _a;
  if (window.VK_MINI) return;
  const once = via === "tg" || via === "vk", today2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  prefs.shared || (prefs.shared = {});
  let n = 0;
  if (once && !prefs.shared[via]) {
    prefs.shared[via] = true;
    n = SHARE_ONCE;
  } else if (prefs.shareDay !== today2) {
    prefs.shareDay = today2;
    n = SHARE_DAILY;
  }
  if (!n) return;
  const now = addCash(n);
  (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
  toast(L("🎁 Спасибо, что рассказали об игре! +".concat(money(n)).concat(now ? "" : " — придут, когда устроитесь на работу"), "🎁 Thanks for spreading the word! +".concat(money(n)).concat(now ? "" : " — paid once you get a job")));
  dropShareBadge(via);
}
function dropShareBadge(via) {
  const b = document.querySelector('.share-big [data-via="'.concat(via, '"] b'));
  if (b) b.remove();
}
function bindShare(root) {
  root.querySelectorAll("[data-share]").forEach((b) => b.onclick = () => {
    snoozeViral(7);
    openShare(b.dataset.share);
  });
}
function vkShare(url, title, what = "") {
  var _a;
  if (window.VK_MINI && window.vkBridge) {
    vkBridge("VKWebAppShare", { link: url.replace(/^https:\/\/t\.me\/.*/, "https://vk.com/app" + (window.VK_APP_ID || "")) });
    track("share", { detail: "vk_app:".concat(what) });
    return;
  }
  if (/^https:\/\/t\.me\//.test(url)) {
    const sp = new URL(url).searchParams.get("startapp") || "", q = new URLSearchParams();
    for (const [k, v] of sp.split("_").map((x) => x.split(/-(.+)/))) if (["ref", "join", "ch"].includes(k) && v) q.set(k, v);
    if (q.has("ch") && prefs.name) q.set("by", prefs.name.slice(0, 24));
    q.set("utm_source", "vk");
    url = "".concat(typeof gameUrl === "function" ? gameUrl() : "https://survivefriday.com/", "?").concat(q);
  }
  const u = "https://vk.com/share.php?url=" + encodeURIComponent(url);
  if (title && ((_a = navigator.clipboard) == null ? void 0 : _a.writeText)) navigator.clipboard.writeText("".concat(title, " ").concat(url)).then(() => toast(L("Текст скопирован — вставьте его в запись ВКонтакте", "Text copied — paste it into your VK post")), () => {
  });
  track("share", { detail: "vk" + (what ? ":" + what : "") });
  if (TG == null ? void 0 : TG.openLink) TG.openLink(u);
  else window.open(u, "_blank", "noopener");
}
async function openShare(kind) {
  var _a, _b;
  track("share", { detail: kind });
  $("viralPop").hidden = true;
  const m = $("modal");
  const { url, team } = await referralLink(kind), text = shareText(kind, team), full = "".concat(text, " ").concat(url);
  const enc = encodeURIComponent;
  m.innerHTML = '<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="shTitle">\n    <h2 id="shTitle">'.concat(L("Позвать в игру", "Invite to the game"), '</h2>\n    <div class="share-tabs" role="tablist"><button class="tab" role="tab" data-k="team" aria-selected="').concat(kind === "team", '">').concat(L("Коллег", "Coworkers"), '</button><button class="tab" role="tab" data-k="friends" aria-selected="').concat(kind === "friends", '">').concat(L("Друзей", "Friends"), "</button></div>\n    ").concat(kind === "team" && !team ? '<p class="field-note">'.concat(registered() ? L("Создайте офис в «Мой офис» — тогда ссылка сразу приведёт коллег в вашу команду.", "Create an office in “My Office” — then the link drops coworkers straight into your team.") : L("Зарегистрируйтесь и создайте офис — тогда ссылка сразу приведёт коллег в вашу команду.", "Sign up and create an office — then the link drops coworkers straight into your team."), "</p>") : "", '\n    <p class="share-text" id="shText">').concat(esc(full), '</p>\n    <div class="share-big">\n      <a class="btn-main btn-tg" data-via="tg" href="https://t.me/share/url?url=').concat(enc(url), "&text=").concat(enc(text), '" target="_blank" rel="noopener">').concat(L("Отправить в Telegram", "Send on Telegram")).concat(((_a = prefs.shared) == null ? void 0 : _a.tg) ? "" : " <b>+".concat(money(SHARE_ONCE), "</b>"), '</a>\n      <a class="btn-main btn-vk" data-via="vk" href="https://vk.com/share.php?url=').concat(enc(url), '" target="_blank" rel="noopener">').concat(L("Рассказать в VK", "Post on VK")).concat(((_b = prefs.shared) == null ? void 0 : _b.vk) || window.VK_MINI ? "" : " <b>+".concat(money(SHARE_ONCE), "</b>"), '</a>\n    </div>\n    <div class="share-grid">\n      ').concat(!TG && navigator.share ? '<button id="shNative" data-via="native">'.concat(L("Отправить…", "Share…"), "</button>") : "", '\n      <a href="https://wa.me/?text=').concat(enc(full), '" data-via="wa" target="_blank" rel="noopener">WhatsApp</a>\n      <a href="mailto:?subject=').concat(enc(L("Выжить до пятницы", "Survive till Friday")), "&body=").concat(enc(full), '" data-via="mail">').concat(L("Почта", "Email"), '</a>\n      <button id="shCopy" data-via="copy">').concat(L("Скопировать ссылку", "Copy link"), '</button>\n    </div>\n    <p class="share-count" id="shCount"></p>\n    <p class="field-note">').concat(window.VK_MINI ? L("За каждого, кто впервые придёт по вашей ссылке, — +".concat(money(REF_CASH), " и +1 предмет на неделю."), "Each new player who joins via your link — +".concat(money(REF_CASH), " and +1 item for the week.")) : "").concat(window.VK_MINI ? "" : L(
    "Награды: Telegram и VK — по +".concat(money(SHARE_ONCE), " (один раз), любая другая отправка — +").concat(money(SHARE_DAILY), " раз в день. За каждого, кто впервые придёт по вашей ссылке, — ещё +").concat(money(REF_CASH), " и +1 предмет на неделю."),
    "Rewards: Telegram and VK — +".concat(money(SHARE_ONCE), " each (once), any other share — +").concat(money(SHARE_DAILY), " once a day. Each new player who joins via your link — +").concat(money(REF_CASH), " and +1 item for the week.")
  ), '</p>\n    <button class="btn-ghost" id="shClose">').concat(L("Закрыть", "Close"), "</button></div>");
  m.hidden = false;
  m.querySelectorAll(".share-tabs .tab").forEach((t) => t.onclick = () => openShare(t.dataset.k));
  $("shClose").onclick = () => {
    m.hidden = true;
  };
  m.onclick = (e) => {
    if (e.target === m) m.hidden = true;
  };
  m.querySelectorAll("[data-via]").forEach((el) => el.addEventListener("click", () => {
    const v = el.dataset.via;
    if (v === "native" || TG && (v === "tg" || v === "vk")) return;
    setTimeout(() => shareReward(v), 600);
  }));
  $("shCopy").onclick = () => copy(full, L("Приглашение скопировано — вставьте его в чат", "Invite copied — paste it into a chat"));
  if ($("shNative")) $("shNative").onclick = () => navigator.share({ title: L("Выжить до пятницы", "Survive till Friday"), text, url }).then(() => shareReward("native")).catch(() => {
  });
  if (TG) m.querySelector(".btn-tg").onclick = (e) => {
    e.preventDefault();
    TG.openTelegramLink("https://t.me/share/url?url=".concat(enc(url), "&text=").concat(enc(text)));
    setTimeout(() => shareReward("tg"), 600);
  };
  m.querySelector(".btn-vk").onclick = (e) => {
    e.preventDefault();
    vkShare(url, text, "invite");
    setTimeout(() => shareReward("vk"), 600);
  };
  if (board.online) board.rpc("referral_count", { p_id: prefs.playerId }).then((n) => {
    if ($("shCount")) $("shCount").textContent = L("По вашим ссылкам пришло: ".concat(n || 0), "Joined via your links: ".concat(n || 0));
  }).catch(() => {
  });
}
const snoozeViral = (days) => {
  prefs.viralSnooze = Date.now() + days * 864e5;
  store.set(KEY.prefs, prefs);
  $("viralPop").hidden = true;
};
function maybeViralPop() {
  const pop = $("viralPop");
  pop.hidden = !((prefs.gamesPlayed || 0) >= 1 && Date.now() > (prefs.viralSnooze || 0));
}
$("viralX").onclick = () => snoozeViral(2);
bindShare($("viralPop"));
function rememberRef() {
  const q = new URLSearchParams(location.search), ref = q.get("ref");
  if (!ref) return;
  if (!prefs.refClaimed) {
    prefs.refBy = ref.toUpperCase();
    store.set(KEY.prefs, prefs);
  }
  q.delete("ref");
  history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
}
async function claimReferral() {
  if (!board.online || !prefs.refBy || prefs.refClaimed || !prefs.name) return;
  if (prefs.refBy === shortId(await myTag)) {
    delete prefs.refBy;
    store.set(KEY.prefs, prefs);
    return;
  }
  try {
    await board.rpc("claim_referral", { p_id: prefs.playerId, p_ref: prefs.refBy });
    prefs.refClaimed = true;
    store.set(KEY.prefs, prefs);
    track("invite", { detail: prefs.refBy });
  } catch (e) {
  }
}
async function checkReferrals() {
  var _a;
  if (!board.online || !prefs.name) return;
  try {
    const n = await board.rpc("referral_count", { p_id: prefs.playerId }) || 0, seen = prefs.refSeen || 0;
    if (n > seen) {
      prefs.bonusItems = (prefs.bonusItems || 0) + (n - seen);
      prefs.refSeen = n;
      store.set(KEY.prefs, prefs);
      addCash(REF_CASH * (n - seen));
      (_a = sfx.coins) == null ? void 0 : _a.call(sfx);
      toast(L("По вашей ссылке ".concat(n - seen === 1 ? "пришёл новый игрок" : "пришли новые игроки (".concat(n - seen, ")"), ": +").concat(money(REF_CASH * (n - seen)), " и ").concat(pl(n - seen, "предмет", "предмета", "предметов", "item", "items"), " на следующую неделю"), "".concat(n - seen === 1 ? "A new player" : "New players (".concat(n - seen, ")"), " joined via your link: +").concat(money(REF_CASH * (n - seen)), " and ").concat(pl(n - seen, "предмет", "предмета", "предметов", "item", "items"), " for next week")));
    }
    if (n >= 3) unlock(["recruiter"]);
  } catch (e) {
  }
}
rememberRef();
