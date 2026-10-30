// Меню и общие экраны: вход, меню, рейтинги, офис и чаты, турниры, приглашения.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- меню ----------
$('profs').innerHTML = Object.entries(PROF).map(([k, p]) => `<label class="prof">
    <input type="radio" name="prof" value="${k}"><b>${p.name}</b><small>${p.perk.replace(/ ([+−]\d+)/g, '\u00a0$1')}</small></label>`).join('');  // «Кукуха −5» не разрывается
$('traits').innerHTML = Object.entries(TRAITS).map(([k, t]) => `<label class="prof">
    <input type="radio" name="trait" value="${k}"><b>${t.name}</b><small>${t.desc}</small></label>`).join('');
const getProf = () => document.querySelector('input[name=prof]:checked')?.value || 'marketer';
const getTrait = () => document.querySelector('input[name=trait]:checked')?.value || 'workaholic';

function renderMenu() {
  applyTheme();
  $('meAva').textContent = prefs.avatar; $('meName').textContent = prefs.name; $('meDept').textContent = prefs.dept || L('без отдела', 'no department');
  myTag.then(t => { $('meId').textContent = `ID ${shortId(t)} · ${registered() ? acctLabel() : prefs.email ? L('войдите снова', 'sign in again') : L('гость', 'guest')}`; });
  $('meRegister').hidden = registered() || !board.online;
  $('meLogin').hidden = !!prefs.email || !board.online; renderAcctBox();
  $('topLogin').hidden = registered() || !board.online || !!window.VDP_PLATFORM;  // гость или истекла сессия — «Войти» на виду
  $('mbAva').textContent = prefs.avatar || '😎';
  $('mbName').textContent = prefs.name ? prefs.name.split(' ')[0] : L('Профиль', 'Profile');
  $('meBadge').classList.toggle('guest', !registered());
  $('delAcct').hidden = !registered() || !!window.VDP_PLATFORM;
  $('psGroup').hidden = $('tgGroup').hidden; $('psGroup').innerHTML = $('tgGroup').innerHTML;
  $('profLogout').hidden = !prefs.email; $('profLogout').textContent = L('Выйти из аккаунта', 'Log out'); delete $('profLogout').dataset.armed; $('meRegister').textContent = prefs.email ? L('Войти', 'Sign in') : L('Регистрация', 'Sign up');
  renderOfficeLine();
  renderChallengeCta();
  for (const id of LOCKED) $(id).classList.toggle('locked', !registered());
  renderInvites();
  renderOnlineBox();
  (document.querySelector(`input[name=prof][value=${prefs.prof}]`) || document.querySelector('input[name=prof]')).checked = true;
  (document.querySelector(`input[name=trait][value=${prefs.trait}]`) || document.querySelector('input[name=trait]')).checked = true;
  setPhase('evening');
  const best = store.get(KEY.best, { step: 0, wins: 0 });
  const seenN = store.get(KEY.seen, []).filter(id => byId[id]).length;
  $('record').textContent = (best.wins ? L(`недель закрыто: ${best.wins}`, `weeks survived: ${best.wins}`) : best.step ? L(`дольше всего: ${dayName(dayOf(best.step))}, ${phaseName(slotPh(best.step)).toLowerCase()}`, `longest run: ${dayName(dayOf(best.step))}, ${phaseName(slotPh(best.step)).toLowerCase()}`) : L('пока нет', 'none yet'))
    + L(` · карточек открыто: ${Math.min(seenN, TOTAL_CARDS)}/${TOTAL_CARDS}`, ` · cards discovered: ${Math.min(seenN, TOTAL_CARDS)}/${TOTAL_CARDS}`);
  const save = store.get(KEY.save, null);
  if (dataLoaded && save && !save.deck?.every(x => byId[x.id])) store.del(KEY.save); // сохранение от старой колоды
  const Cm = store.get(KEY.career, null), careerSave = save && (save.mode || 'career') === 'career';
  // Постоянные коллеги: портрет, кто это и как к вам относятся (только в карьере)
  $('castList').hidden = !Cm;
  if (Cm) $('castList').innerHTML = `<b class="cast-title">${L('Коллеги по работе', 'Your coworkers')}</b>${Object.entries(CAST).map(([k, p]) => {
    const v = (Cm.cast || {})[k] || 0;
    return `<div class="cast-row">${portraitHtml(p.name)}<span><b>${p.name}</b><small>${p.role} · ${L(`глава ${(Cm.castStage || {})[k] || 0} из 8`, `chapter ${(Cm.castStage || {})[k] || 0} of 8`)}</small></span><em class="${v > 0 ? 'up' : v < 0 ? 'down' : ''}" title="${L(`Отношение ${v}`, `Attitude ${v}`)}">${hearts(v)}</em></div>`;
  }).join('')}`;
  for (const [k, row] of Object.keys(CAST).map((k, i) => [k, $('castList').querySelectorAll('.cast-row')[i]])) if (row) setMood(row.querySelector('.face'), moodFor(((Cm?.cast || {})[k] || 0) * 10, true));
  $('careerCard').hidden = !Cm; $('profField').hidden = !!Cm; $('traitField').hidden = !!Cm; $('newCareer').hidden = !Cm;
  $('newCareer').textContent = L('Начать карьеру заново', 'Start career over'); delete $('newCareer').dataset.armed;
  if (Cm) {
    const where = Cm.stage === 'search' ? L('ищет работу', 'job hunting') : Cm.company;
    $('careerCard').innerHTML = `<div class="cc-head"><b>${L('Неделя', 'Week')} ${Math.min(Cm.week, YEAR)}/${YEAR}</b><span>${esc(where)}</span></div>
      <div class="cc-bar"><i style="width:${(Math.min(Cm.week - 1, YEAR) / YEAR) * 100}%"></i></div>
      <div class="stat-box"><b>${Cm.worked}</b><span>${L('отработано', 'worked')}</span></div>
      <div class="stat-box"><b>${Cm.firings}</b><span>${L('увольнений', 'times fired')}</span></div>
      <div class="stat-box"><b>${Cm.companies.length}</b><span>${L('компаний', 'companies')}</span></div>
      <div class="cc-trait">${PROF[Cm.prof].name} · ${TRAITS[Cm.trait || 'workaholic'].name}</div>
      <div class="money" style="grid-column:1/-1"><div><b>${money(Cm.bank || 0)}</b><span>${L(`на счёте · оклад ${Cm.salary || 3}/день`, `in the bank · salary ${money(Cm.salary || 3)}/day`)}</span></div><div><b>${fmtDays(Cm.vacation || 0)} ${L('дн.', 'days')}</b><span>${L(`отпуска из ${VAC_YEAR}`, `vacation of ${VAC_YEAR}`)}</span></div></div>
      ${!careerSave && Cm.stage === 'work' && (Cm.vacation || 0) >= 7 && Cm.week <= YEAR ? '<button class="btn-ghost btn-vac" id="menuVac" style="grid-column:1/-1">' + L('Уйти в отпуск на неделю (7 дн.)', 'Take a week of vacation (7 days)') + '</button>' : ''}`;
    if ($('menuVac')) $('menuVac').onclick = () => { C = store.get(KEY.career, null); takeVacation(); };
    $('start').innerHTML = `${L('Играть', 'Play')}<small>${careerSave ? L('продолжить неделю', 'continue the week') : Cm.stage === 'search' ? L('поиск работы', 'job hunt') : L(`неделя ${Cm.week} из ${YEAR}`, `week ${Cm.week} of ${YEAR}`)}</small>`;
  } else $('start').innerHTML = L('Играть<small>начать карьеру</small>', 'Play<small>start your career</small>');
  const daily = store.get(KEY.daily, {})[today()];
  const sk = streakNow();
  $('startDaily').innerHTML = `${L('Неделя дня', 'Daily Week')}<small>${daily ? `${daily.won ? L('пройдена', 'survived') : L('завалена', 'failed')} · ${L('ещё раз', 'play again')}` : sk ? L(`серия ${sk} дн. · не прервите`, `${sk}-day streak · keep it going`) : `${dayLabel(today())} · ${L('одна на всех', 'same for everyone')}`}</small>`; $('streakLine').textContent = sk ? L(`Серия: ${sk} дн. подряд${daily ? '' : ' — сыграйте сегодня, чтобы не прервать'}`, `Streak: ${sk} days in a row${daily ? '' : ' — play today to keep it alive'}`) : L('Играйте каждый день — растёт серия и бонус в карьеру', 'Play every day to grow your streak and your career bonus');
  $('startPack').hidden = !PACK; if (PACK) $('startPack').textContent = PACK.title;
  $('openCollection').textContent = `${L('Коллекция', 'Collection')} ${Object.keys(endingsGot()).length}/${ENDINGS.length}`;
  renderSound(); show('menu');
  board.touch('menu').catch(() => {}).then(() => { claimReferral(); checkReferrals(); });
  maybeViralPop();
  bus.emit('menu');
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
  : prefs.email ? renderJoin('login', socialVia() ? L(`Сессия входа истекла — войдите через ${viaName(socialVia())} ещё раз.`, `Your session expired — sign in with ${viaName(socialVia())} again.`) : L('Сессия входа истекла. Войдите снова — паролем или по ссылке из письма.', 'Your session expired. Sign in again — with your password or an email link.')) : renderJoin('register', why);
$('openOffice').onclick = needAccount(showOffice, L('«Мой офис» доступен после регистрации: соберите команду и позовите коллег.', '“My Office” unlocks after you sign up: build a team and bring in your coworkers.'));
$('openChat').onclick = needAccount(() => showChat('team'), L('Чаты доступны после регистрации — так коллеги будут знать, кто пишет.', 'Chats unlock after you sign up — so your coworkers know who’s talking.'));
$('meRegister').onclick = () => prefs.email ? renderJoin('login') : renderJoin('register');
$('meLogin').onclick = () => renderJoin('login');
$('topLogin').onclick = () => renderJoin('login', socialVia() ? L(`Сессия входа истекла — войдите через ${viaName(socialVia())} ещё раз.`, `Your session expired — sign in with ${viaName(socialVia())} again.`) : undefined);
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
    const t = myTeamCache && (await board.rpc('my_tournament', { p_id: prefs.playerId }).catch(() => []))[0];
    const fresh = t && Date.now() - new Date(t.starts_at) < 12 * 3600e3 && !store.get('vdp-tours', {})[t.tour_id];
    $('tourCta').hidden = !fresh;
    if (fresh) { $('tourCta').querySelector('span').innerHTML = `<b>${L(`Турнир офиса «${esc(t.team_name)}»`, `Office tournament: “${esc(t.team_name)}”`)}</b> ${new Date(t.starts_at) <= Date.now() ? L('уже идёт — сыграйте свою неделю', 'is on — play your week') : L(`старт ${until(t.starts_at)}`, `starts ${until(t.starts_at)}`)}`;
      $('tourCtaGo').onclick = () => showOffice(); }
    $('meDept').textContent = (prefs.dept || L('без отдела', 'no department')) + (myTeamCache ? L(` · офис «${myTeamCache.name}»`, ` · office “${myTeamCache.name}”`) : '');
  } catch {}
}
$('meId').onclick = async () => {
  const id = shortId(await myTag);
  navigator.clipboard.writeText(id).then(() => toast(L(`ID ${id} скопирован — отправьте его тому, кто собирает офис`, `ID ${id} copied — send it to whoever’s building the office`)), () => toast(L(`Ваш ID: ${id}`, `Your ID: ${id}`)));
};
$('openSuggest').onclick = needAccount(showSuggest, L('Предлагать свои ситуации можно после регистрации: под карточкой будет ваша подпись.', 'Sign up to suggest your own situations — your name goes on the card.'));
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
  socialButtons($('wSocial'));
  $('wNote').textContent = board.online ? '' : L('Регистрация появится, когда к игре подключат общий офис (Supabase). Пока можно играть как гость.', 'Sign-up arrives once the shared office (Supabase) is connected. For now you can play as a guest.');
  joinPanel('welcome');
}
function renderJoin(mode, lead) {
  joinMode = mode;
  const reg = mode === 'register', login = mode === 'login', edit = mode === 'edit';
  $('joinTitle').textContent = (EN ? { register: 'Sign up', login: 'Sign in', guest: 'Guest pass', edit: 'Office badge', profile: 'Your profile' } : { register: 'Регистрация', login: 'Вход', guest: 'Пропуск гостя', edit: 'Пропуск в офис', profile: 'Ваш профиль' })[mode];
  $('joinSub').textContent = (EN ? { register: 'Name, department and email', login: 'Telegram, email or password', guest: 'No sign-up needed', edit: acctLabel() || 'Guest', profile: acctLabel() } : { register: 'Имя, отдел и почта', login: 'Telegram, почта или пароль', guest: 'Без регистрации', edit: acctLabel() || 'Гость', profile: acctLabel() })[mode];
  $('joinLead').hidden = !lead; $('joinLead').textContent = lead || '';
  $('joinName').value = prefs.name || prefs.suggestName || ''; $('joinDept').value = prefs.dept;
  $('joinEmail').value = (socialVia() ? '' : prefs.email) || mailTo || prefs.pendingEmail || ''; $('joinEmail').disabled = !!prefs.email && !socialVia() && !login;
  for (const id of ['joinNameField', 'joinDeptField', 'joinAvaField', 'joinAvatar']) $(id).hidden = login;
  $('joinEmailField').hidden = !(reg || login || (edit && prefs.email && !socialVia()));
  $('joinEmailNote').textContent = prefs.email && !login ? L('Вы вошли по почте — прогресс общий на всех устройствах.', 'You’re signed in by email — your progress syncs across devices.') : L('Пароль не обязателен — без него пришлём ссылку для входа на почту.', 'A password is optional — without one we’ll email you a sign-in link.');
  socialButtons($('joinSocial')); $('joinSocial').hidden ||= !(reg || login);
  $('joinEmailNote').hidden = login;  // при входе про пароль подсказывает поле пароля
  $('joinLink').hidden = !login; $('joinLink').disabled = false;  // при входе — ссылка на почту отдельной кнопкой
  $('joinPassField').hidden = !(reg || login); $('joinPass').value = '';
  $('joinPass').autocomplete = reg ? 'new-password' : 'current-password';
  $('joinPassNote').textContent = reg ? L('Необязательно, от 6 символов. Без пароля входите по ссылке из письма.', 'Optional, 6+ characters. Without one, sign in via an email link.')
    : L('Есть пароль — введите его и нажмите «Войти». Нет пароля или забыли — нажмите «Отправить ссылку для входа».', 'Have a password? Enter it and tap “Log in”. No password or forgot it? Tap “Email me a sign-in link”.');
  (document.querySelector(`input[name=ava][value="${prefs.avatar}"]`) || document.querySelector('input[name=ava]')).checked = true;
  $('joinAvatar').textContent = document.querySelector('input[name=ava]:checked').value;
  $('joinErr').textContent = ''; $('joinName').removeAttribute('aria-invalid'); $('joinEmail').removeAttribute('aria-invalid');
  $('joinGo').textContent = (EN ? { register: 'Sign up', login: 'Log in', guest: 'Play as guest', edit: 'Save', profile: 'Save and play' } : { register: 'Зарегистрироваться', login: 'Войти', guest: 'Играть как гость', edit: 'Сохранить', profile: 'Сохранить и играть' })[mode];
  $('joinGo').disabled = false;
  $('joinRegister').hidden = !(edit && !prefs.email && board.online);
  $('joinLogout').hidden = !(edit && prefs.email); $('joinLogout').textContent = L('Выйти из аккаунта', 'Log out'); delete $('joinLogout').dataset.armed;
  $('joinCancel').hidden = mode === 'profile';
  $('joinNote').hidden = login;
  joinPanel('joinForm');
  (login ? $('joinEmail') : $('joinName')).focus({ preventScroll: true });
}
function renderCheckMail(email) {
  mailTo = email;
  $('mailText').innerHTML = L(`Мы отправили ссылку для входа на <b>${esc(email)}</b>. Откройте письмо на этом устройстве и нажмите ссылку — игра откроется уже под вашим аккаунтом.`, `We sent a sign-in link to <b>${esc(email)}</b>. Open the email on this device and tap the link — the game will open under your account.`);
  $('mailErr').textContent = ''; $('mailGuest').hidden = !prefs.name;
  joinPanel('checkMail');
}
$('wRegister').onclick = () => renderJoin('register');
$('wGuest').onclick = () => renderJoin('guest');
$('wLogin').onclick = () => renderJoin('login');
$('wHow').onclick = () => showIntro();
$('openHow').onclick = () => showIntro();
$('wVideo').onclick = () => showVideo();
$('openVideo').onclick = () => showVideo();
$('joinRegister').onclick = () => renderJoin('register');
$('mailChange').onclick = () => renderJoin(prefs.name ? 'register' : 'login');
$('mailGuest').onclick = () => { renderMenu(); joinFromLink(); };
$('mailResend').onclick = async () => {
  $('mailResend').disabled = true;
  try { await board.sendLink(mailTo); toast(L('Письмо отправлено ещё раз', 'Email sent again')); $('mailErr').textContent = ''; }
  catch (err) { $('mailErr').textContent = L(`Не удалось отправить: ${err.message}`, `Couldn’t send: ${err.message}`); }
  setTimeout(() => { $('mailResend').disabled = false; }, 15000);
};
$('joinName').oninput = () => { $('joinErr').textContent = ''; $('joinName').removeAttribute('aria-invalid'); };
$('joinCancel').onclick = () => prefs.name && !prefs.loggedOut ? renderMenu() : renderWelcome();
$('joinEmail').oninput = () => { $('joinErr').textContent = ''; $('joinEmail').removeAttribute('aria-invalid'); };
const badMail = email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
$('joinLink').onclick = async () => {
  const email = $('joinEmail').value.trim().toLowerCase();
  if (badMail(email)) { $('joinErr').textContent = L('Введите почту, с которой регистрировались.', 'Enter the email you signed up with.'); $('joinEmail').setAttribute('aria-invalid', 'true'); $('joinEmail').focus(); return; }
  $('joinLink').disabled = true;
  try { await board.sendLink(email); renderCheckMail(email); }
  catch (err) { $('joinErr').textContent = L(`Не удалось отправить ссылку: ${err.message}`, `Couldn’t send the link: ${err.message}`); $('joinLink').disabled = false; }
};
$('joinForm').onsubmit = async e => {
  e.preventDefault();
  const email = $('joinEmail').value.trim().toLowerCase();
  if (joinMode === 'login') {
    if (badMail(email)) { $('joinErr').textContent = L('Введите почту, с которой регистрировались.', 'Enter the email you signed up with.'); $('joinEmail').setAttribute('aria-invalid', 'true'); return; }
    $('joinGo').disabled = true;
    const pass = $('joinPass').value;
    try {
      if (pass) { const j = await board.password(email, pass); prefs.hasPass = true; await applySession(sessOf(j), j.user, { via: 'email' }); return; }
      await board.sendLink(email); renderCheckMail(email);
    }
    catch (err) { $('joinErr').textContent = L(`Не удалось отправить ссылку: ${err.message}`, `Couldn’t send the link: ${err.message}`); $('joinGo').disabled = false; }
    return;
  }
  const name = $('joinName').value.trim().replace(/\s+/g, ' ');
  if (name.length < 2) {
    $('joinErr').textContent = L('Введите имя — хотя бы 2 буквы. Его увидят коллеги в рейтинге.', 'Enter a name — at least 2 letters. Your coworkers will see it on the leaderboard.');
    $('joinName').setAttribute('aria-invalid', 'true'); $('joinName').focus(); return;
  }
  prefs.name = name; prefs.dept = $('joinDept').value.trim().replace(/\s+/g, ' ');
  prefs.avatar = document.querySelector('input[name=ava]:checked').value;
  if (joinMode === 'register') {
    if (badMail(email)) { $('joinErr').textContent = L('Укажите почту — на неё придёт ссылка для входа.', 'Enter your email — we’ll send the sign-in link there.'); $('joinEmail').setAttribute('aria-invalid', 'true'); $('joinEmail').focus(); return; }
    store.set(KEY.prefs, prefs);
    await board.touch('menu').catch(() => {});  // профиль гостя сохраняется и перейдёт в аккаунт после входа
    $('joinGo').disabled = true;
    const pass = $('joinPass').value;
    if (pass && pass.length < 6) { $('joinErr').textContent = L('Пароль — хотя бы 6 символов. Или оставьте поле пустым.', 'Password must be 6+ characters — or leave it empty.'); $('joinGo').disabled = false; return; }
    try {
      if (pass) {
        const j = await board.password(email, pass, true);
        if (j.user && Array.isArray(j.user.identities) && !j.user.identities.length) throw new Error(L('эта почта уже зарегистрирована — нажмите «Войти»', 'this email is already registered — tap “Log in”'));
        prefs.hasPass = true;
        if (j.access_token) { await applySession(sessOf(j), j.user, { via: 'email' }); return; }  // подтверждение почты выключено — сразу в игру
      } else await board.sendLink(email);
      prefs.pendingEmail = email; store.set(KEY.prefs, prefs); renderCheckMail(email);
    }
    catch (err) { $('joinErr').textContent = L(`Не удалось отправить ссылку: ${err.message}`, `Couldn’t send the link: ${err.message}`); $('joinGo').disabled = false; }
    return;
  }
  delete prefs.loggedOut;  // выбрали «Играть как гость»
  store.set(KEY.prefs, prefs);
  await board.touch('menu').catch(() => {});
  renderMenu();
};
// Выход из аккаунта: на этом устройстве начинается новый гость
function logoutClick(e) {
  const b = e.currentTarget;
  if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = L('Выйти? Нажмите ещё раз', 'Log out? Tap again'); return; }
  // после выхода игра снова просит войти (или явно играть как гость), а не пускает дальше под старым именем
  board.logout().finally(() => {
    for (const k of ['email', 'pendingEmail', 'playerId', 'session', 'acctName', 'tgLinked', 'vkLinked', 'hasPass', 'suggestName', 'tgRemind']) delete prefs[k];
    prefs.loggedOut = true; store.set(KEY.prefs, prefs); location.reload();
  });
}
$('joinLogout').onclick = logoutClick;
$('profLogout').onclick = logoutClick;
// Язык: русский / английский — игра перезапускается на выбранном
$('langRu').onclick = () => EN && setLang('ru');
$('langEn').onclick = () => !EN && setLang('en');
$(EN ? 'langEn' : 'langRu').classList.add('on');
$('start').onclick = async () => { await whenReady($('start')); continueCareer(); };
// «Мой профиль»: плашка справа вверху открывает панель — данные игрока, аккаунт, справка, второстепенные кнопки.
// Кнопки, которые продвигают игру (позвать друзей, группа в Telegram, установка), — и в меню, и здесь
const profSheet = $('profSheet');
function openProfile() { try { renderMenu(); } catch {} profSheet.hidden = false; $('meBadge').setAttribute('aria-expanded', 'true'); $('psClose').focus({ preventScroll: true }); }
function closeProfile() { if (profSheet.hidden) return; profSheet.hidden = true; $('meBadge').setAttribute('aria-expanded', 'false'); }
$('meBadge').onclick = () => profSheet.hidden ? openProfile() : closeProfile();
$('psClose').onclick = closeProfile;
// клик мимо панели или по кнопке, которая ведёт дальше (новый экран или окно), — панель закрывается
const KEEP_OPEN = ['profLogout', 'tgRemind', 'meId', 'langRu', 'langEn', 'remindDaily'];
profSheet.addEventListener('click', e => {
  if (e.target === profSheet) return closeProfile();
  const b = e.target.closest('button, a');
  if (b && !KEEP_OPEN.includes(b.id) && b.id !== 'psClose') setTimeout(closeProfile, 0);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProfile(); });
$('psInvite').onclick = () => openShare(registered() ? 'team' : 'friends');
$('psGroup').onclick = () => $('tgGroup').click();
$('startDaily').onclick = async () => { await whenReady($('startDaily')); startDaily(); };
$('startPack').onclick = async () => { await whenReady($('startPack')); startPack(); };
// «Начать заново» срабатывает со второго нажатия: окна подтверждения в браузере тут нет
$('newCareer').onclick = () => {
  const b = $('newCareer');
  if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = L('Весь прогресс года сотрётся. Нажмите ещё раз', 'This wipes the whole year. Tap again'); return; }
  store.del(KEY.career); store.del(KEY.save); newCareer();
};

// ---------- рейтинг, неделя дня, отделы, участники ----------
const resultText = e => e.won ? { main: `${e.total}/400`, sub: L('неделя закрыта', 'week survived') } :
  { main: `${dayName(dayOf(e.step)).slice(0, EN ? 3 : 2)}, ${phaseName(slotPh(e.step)).toLowerCase()}`, sub: `${e.death ? resName(e.death) : ''} ${e.overheat ? '100%' : '0%'}` };
const ago = iso => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  return m < 1 ? L('только что', 'just now') : m < 60 ? L(`${m} мин назад`, `${m} min ago`) : m < 1440 ? L(`${Math.floor(m / 60)} ч назад`, `${Math.floor(m / 60)}h ago`) : L(`${Math.floor(m / 1440)} дн. назад`, `${Math.floor(m / 1440)}d ago`);
};
const stepName = st => `${dayName(dayOf(st)).slice(0, EN ? 3 : 2)}, ${phaseName(slotPh(st)).toLowerCase()}`;
function personStatus(p) {
  const fresh = Date.now() - new Date(p.updated_at) < 10 * 60000;
  if (fresh && p.status === 'playing') return `<span class="st play"><i></i>${L('играет', 'playing')} · ${stepName(p.step)}</span>`;
  if (fresh) return `<span class="st on"><i></i>${L('в сети', 'online')}</span>`;
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
    <span class="lb-who"><b>${esc(e.avatar || '')} ${esc(e.name)}</b><small>${esc(e.dept || L('без отдела', 'no department'))}${e.prof ? ` · ${PROF[e.prof]?.name || ''}` : ''}</small></span>
    <span class="lb-res ${e.won ? 'won' : 'lost'}"><b>${r.main}</b><small>${r.sub}</small></span></div>`; }).join('');
async function renderBoard(quiet) {
  const onlyDept = $('onlyDept').checked;
  for (const [m, id] of Object.entries(MODES)) $(id).setAttribute('aria-selected', m === boardMode);
  $('boardTitle').textContent = (EN ? { rating: 'Office leaderboard', daily: `Daily Week ${dayLabel(today())}`, depts: 'Department vs department', people: 'Players' } : { rating: 'Рейтинг офиса', daily: `Неделя дня ${dayLabel(today())}`, depts: 'Отдел против отдела', people: 'Участники' })[boardMode];
  $('onlyDeptBox').hidden = boardMode === 'depts';
  $('boardNote').textContent = !board.online ? L('Общий офис ещё не подключён — показаны данные с этого устройства. Подключение: js/config.js.', 'The shared office isn’t connected yet — showing data from this device. Setup: js/config.js.')
    : (EN ? { rating: 'Each player’s best career week.', daily: 'Same week for everyone. Only your first attempt of the day counts.',
        depts: 'Department average since Monday: a survived week scores its total, a failed one — 10 points per card.', people: 'The list refreshes every 20 seconds.' } : { rating: 'Лучшая неделя каждого игрока в карьере.', daily: 'Одна и та же неделя для всех. В зачёт идёт первая попытка за день.',
        depts: 'Средний результат отдела с понедельника: закрытая неделя — её счёт, проваленная — 10 очков за карточку.', people: 'Список обновляется каждые 20 секунд.' })[boardMode];
  const list = $('boardList');
  if (onlyDept && !prefs.dept && boardMode !== 'depts') {
    $('boardSummary').textContent = '';
    list.innerHTML = L('<div class="lb-empty"><span class="big">Нет отдела</span>Укажите свой отдел (кнопка «Изменить» в меню), чтобы видеть коллег по отделу.</div>', '<div class="lb-empty"><span class="big">No department</span>Set your department (the “Edit” button in the menu) to see your teammates.</div>'); return;
  }
  if (!quiet) list.innerHTML = `<div class="lb-empty">${L('Загружаю…', 'Loading…')}</div>`;
  try {
    const dept = onlyDept ? prefs.dept : '', tag = await myTag;
    if (boardMode === 'people') {
      const rows = await board.people(dept);
      const canInvite = registered() && board.online;  // нет офиса — предложим создать при нажатии
      const live = rows.filter(p => Date.now() - new Date(p.updated_at) < 10 * 60000);
      $('boardSummary').textContent = L(`Участников: ${rows.length} · в сети: ${live.length}`, `Players: ${rows.length} · online: ${live.length}`);
      if (!rows.length) { list.innerHTML = L('<div class="lb-empty"><span class="big">Пусто</span>Пока никого нет.</div>', '<div class="lb-empty"><span class="big">Empty</span>Nobody here yet.</div>'); return; }
      list.innerHTML = rows.map(p => `<div class="lb-row person${p.tag === tag ? ' me' : ''}">
        <span class="lb-ava" aria-hidden="true">${esc(p.avatar || '🙂')}</span>
        <span class="lb-who"><b>${esc(p.name)}${p.tag === tag ? L(' (вы)', ' (you)') : ''}</b><small>${esc(p.dept || L('без отдела', 'no department'))}</small>
          <small class="lb-meta">${L('недель', 'weeks')}: ${p.games || 0} · ${L('побед', 'wins')}: ${p.wins || 0}${p.games ? ` · ${L('лучшее', 'best')}: ${p.best_won ? `${p.best_total}/400` : stepName(p.best_step)}` : ''}</small></span>
        <span class="lb-res">${personStatus(p)}${canInvite && p.tag !== tag && p.short_id ? `<button class="btn-chip" data-invite="${p.short_id}">${L('Позвать в офис', 'Invite to office')}</button>` : ''}</span></div>`).join('');
      bindInvite(list);
    } else if (boardMode === 'depts') {
      const rows = await board.depts();
      $('boardSummary').textContent = cupTime() ? L('Кубок недели вручён', 'This week’s cup has been awarded') : L('Кубок вручат в пятницу в 18:00', 'The cup is awarded Friday at 6 PM');
      if (!rows.length) { list.innerHTML = L('<div class="lb-empty"><span class="big">Пусто</span>На этой неделе отделы ещё не играли. Укажите отдел в пропуске и сыграйте неделю.</div>', '<div class="lb-empty"><span class="big">Empty</span>No department has played this week yet. Add your department to your badge and play a week.</div>'); return; }
      list.innerHTML = rows.map((d, i) => `<div class="lb-row dept${d.dept === prefs.dept ? ' me' : ''}">
        <span class="lb-pos${i === 0 ? ' medal' : ''}">${i === 0 ? (cupTime() ? L('КУБОК', 'CUP') : '01') : String(i + 1).padStart(2, '0')}</span>
        <span class="lb-who"><b>${esc(d.dept)}</b><small>${L(`игроков: ${d.players} · недель: ${d.weeks} · закрыто: ${d.win_rate}%`, `players: ${d.players} · weeks: ${d.weeks} · survived: ${d.win_rate}%`)}</small></span>
        <span class="lb-res won"><b>${d.avg_score}</b><small>${L('средний счёт', 'avg score')}</small></span></div>`).join('');
    } else {
      const rows = boardMode === 'daily' ? await board.daily(today(), dept) : await board.top(dept);
      $('boardSummary').textContent = L(`В рейтинге: ${rows.length}`, `On the board: ${rows.length}`);
      if (!rows.length) { list.innerHTML = `<div class="lb-empty"><span class="big">${L('Пусто', 'Empty')}</span>${boardMode === 'daily' ? L('Сегодня неделю дня ещё никто не сыграл. Станьте первыми!', 'Nobody has played today’s Daily Week yet. Be the first!') : L('Пока никто не доиграл неделю. Станьте первыми!', 'Nobody has finished a week yet. Be the first!')}</div>`; return; }
      list.innerHTML = rowsScore(rows, tag);
    }
  } catch (err) {
    if (!quiet) list.innerHTML = `<div class="lb-empty"><span class="big">${L('Нет связи', 'No connection')}</span>${L('Не удалось загрузить данные', 'Couldn’t load data')}: ${esc(err.message)}</div>`;
  }
}
$('boardBack').onclick = () => { clearInterval(boardTimer); boardFrom === 'end' ? show('end') : renderMenu(); };
$('boardRefresh').onclick = () => renderBoard();
for (const [m, id] of Object.entries(MODES)) $(id).onclick = () => { boardMode = m; renderBoard(); };
$('onlyDept').onchange = () => renderBoard();

// ---------- ID игрока, офис и чаты ----------
const shortId = tag => tag.slice(0, 6).toUpperCase();
const offline = title => {
  views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">${title}</span><h1>${L('Нужен общий офис', 'Shared office required')}</h1>
    <p>${L('Офисы, приглашения и чаты работают через Supabase. Впишите ключи в js/config.js и выполните supabase/schema.sql.', 'Offices, invites and chats run on Supabase. Put your keys in js/config.js and run supabase/schema.sql.')}</p>
    <div class="stack"><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div></div>`;
  show('end'); $('toMenu').onclick = renderMenu;
};
const inviteLink = code => `${location.origin}${location.pathname}?join=${code}`;
const copy = (text, ok) => navigator.clipboard.writeText(text).then(() => toast(ok), () => toast(text));

// ---------- приглашения в офис: список в меню, плашка в любой момент, ответ пригласившему ----------
// Гость видит приглашения; принять — после регистрации (приглашение перейдёт в аккаунт), отклонить — скрыть у себя
const invHidden = () => prefs.invHidden ||= [];
async function myInvites() { return ((await board.rpc('my_invites', { p_id: prefs.playerId })) || []).filter(i => !invHidden().includes(i.invite_id)); }
async function answerInvite(inv, accept) {
  if (!registered()) {
    if (!accept) { invHidden().push(inv.invite_id); store.set(KEY.prefs, prefs); toast(L('Приглашение скрыто', 'Invite hidden')); return true; }
    if (!views.game.hidden) { toast(L('Доиграйте неделю — приглашение ждёт в меню. Чтобы вступить в офис, нужна регистрация', 'Finish your week — the invite is waiting in the menu. You’ll need to sign up to join the office')); return false; }
    renderJoin('register', L(`Чтобы войти в офис «${inv.team_name}», зарегистрируйтесь — приглашение сохранится.`, `Sign up to join the “${inv.team_name}” office — your invite will be saved.`)); return false;
  }
  try {
    const name = await board.rpc('answer_invite', { p_id: prefs.playerId, p_invite: inv.invite_id, p_accept: accept });
    toast(accept ? L(`Вы в офисе «${name}». Загляните в чат офиса!`, `You’re in the “${name}” office. Say hi in the office chat!`) : L('Приглашение отклонено', 'Invite declined')); myTeamCache = null;
    if (!views.menu.hidden) renderMenu();
    return true;
  } catch (err) { toast(err.message); return false; }
}
async function renderInvites() {
  const box = $('invites');
  if (!board.online || !prefs.name) { box.hidden = true; return; }
  try {
    const list = await myInvites();
    box.hidden = !list.length;
    box.innerHTML = list.map((i, n) => `<div class="invite"><span><b>${esc(i.from_name)}</b> ${L(`зовёт вас в офис «${esc(i.team_name)}»`, `invites you to the “${esc(i.team_name)}” office`)}</span>
      <button class="btn-chip" data-a="1" data-n="${n}">${L('Принять', 'Accept')}</button><button class="btn-chip" data-a="0" data-n="${n}">${L('Отказаться', 'Decline')}</button></div>`).join('');
    box.querySelectorAll('button').forEach(b => b.onclick = async () => { if (await answerInvite(list[+b.dataset.n], b.dataset.a === '1')) renderInvites(); });
  } catch { box.hidden = true; }
}
// Плашка нового приглашения — в меню и во время игры, не мешая ходить
function invitePop(inv) {
  const el = $('invitePop');
  el.innerHTML = `<span class="ip-ico" aria-hidden="true">📨</span><span class="ip-text"><b>${esc(inv.from_name)}</b> ${L(`зовёт вас в офис «${esc(inv.team_name)}»`, `invites you to the “${esc(inv.team_name)}” office`)}</span>
    <span class="ip-btns"><button class="btn-main" type="button" data-a="1">${L('Принять', 'Accept')}</button><button class="btn-ghost" type="button" data-a="0">${L('Отказаться', 'Decline')}</button></span>
    <button class="ip-x" type="button" aria-label="${L('Позже', 'Later')}">×</button>`;
  el.hidden = false; FX.pulse(el, 'on', 600);  // звон и вибрация — от колокольчика
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => { if (await answerInvite(inv, b.dataset.a === '1')) { el.hidden = true; renderInvites(); } });
  el.querySelector('.ip-x').onclick = () => { el.hidden = true; };
}
// Раз в 20 секунд: новые приглашения мне и ответы на мои приглашения
let socialBusy = false;
async function pollSocial() {
  if (socialBusy || !board.online || !prefs.name || document.hidden) return;
  socialBusy = true;
  try {
    const seen = prefs.invSeen ||= [], list = await myInvites().catch(() => []);
    const fresh = list.filter(i => !seen.includes(i.invite_id));
    if (fresh.length) {
      seen.push(...fresh.map(i => i.invite_id)); prefs.invSeen = seen.slice(-100); store.set(KEY.prefs, prefs); invitePop(fresh[0]); if (!views.menu.hidden) renderInvites();
      ring(L(`${fresh[0].from_name} зовёт вас в офис «${fresh[0].team_name}»`, `${fresh[0].from_name} invites you to the “${fresh[0].team_name}” office`), () => invitePop(fresh[0]), true, false);
    }
    if (registered()) {
      const sent = (await board.rpc('my_sent_invites', { p_id: prefs.playerId }).catch(() => [])) || [], done = prefs.sentSeen ||= [];
      for (const s of sent.filter(s => !done.includes(s.invite_id))) {
        done.push(s.invite_id); toast(L(`${s.to_name}: приглашение в «${s.team_name}» ${s.status === 'accepted' ? 'принято 🎉' : 'отклонено'}`, `${s.to_name} ${s.status === 'accepted' ? 'accepted 🎉' : 'declined'} your invite to “${s.team_name}”`));
      }
      prefs.sentSeen = done.slice(-100); store.set(KEY.prefs, prefs);
      // новые сообщения в чатах: первый раз только запоминаем, где мы, звоним — на следующие
      const last = (await board.rpc('chat_latest', { p_id: prefs.playerId }).catch(() => [])) || [], cs = prefs.chatSeen ||= {};
      for (const r of last) {
        if (r.channel === 'dm') {  // непрочитанное личное сообщение
          if (r.last_id > (cs.dm || 0) && !dmOpen) ring(L(`${r.from_name} пишет вам`, `${r.from_name} sent you a message`), () => showDmInbox());
          cs.dm = Math.max(cs.dm || 0, r.last_id); continue;
        }
        const open = $('chList') && chatChannel === r.channel;
        if (cs[r.channel] != null && r.last_id > cs[r.channel] && !open)
          ring(L(`${r.from_name} пишет в ${r.channel === 'team' ? 'чате офиса' : 'общем чате'}`, `${r.from_name} posted in ${r.channel === 'team' ? 'the office chat' : 'the general chat'}`), () => showChat(r.channel), r.channel === 'team');
        cs[r.channel] = Math.max(cs[r.channel] || 0, r.last_id);
      }
      store.set(KEY.prefs, prefs);
    }
    if (!views.menu.hidden) renderOnlineBox();
  } finally { socialBusy = false; }
}
setInterval(pollSocial, 20000);

// ---------- колокольчик: звон, вибрация и значок, когда зовут в офис или пишут в чат ----------
const bellQ = [];
function ring(text, open, loud = true, note = true) {
  bellQ.unshift({ text, open }); bellQ.length = Math.min(bellQ.length, 9);
  const b = $('bell'); b.hidden = false; $('bellN').textContent = bellQ.length;
  b.classList.remove('ring'); void b.offsetWidth; b.classList.add('ring');
  sfx.bell?.();
  if (loud) try { TG?.HapticFeedback ? TG.HapticFeedback.notificationOccurred('success') : navigator.vibrate?.([90, 60, 90, 60, 180]); } catch {}
  if (note) toast(`🔔 ${text}`);
}
$('bell').onclick = () => {
  const list = bellQ.splice(0), b = $('bell'); b.hidden = true;
  if (!list.length) return;
  // во время недели не уводим из игры: только напоминаем, что ждёт в меню
  if (!views.game.hidden) { toast(`🔔 ${list[0].text}${list.length > 1 ? L(` и ещё ${list.length - 1}`, ` and ${list.length - 1} more`) : ''}${L('. Откройте после недели в меню', '. Check the menu after your week')}`); return; }
  list[0].open?.();
};

// ---------- кто сейчас в игре: позвать в свой офис ----------
let onlineNow = async () => { const me = await myTag, now = Date.now(); return ((await board.people()) || []).filter(p => p.tag !== me && now - new Date(p.updated_at) < 5 * 60000); };
const onlineRow = p => `<div class="lb-row person"><span class="lb-ava" aria-hidden="true">${esc(p.avatar || '🙂')}</span>
  <span class="lb-who"><b>${esc(p.name)}${p.desk ? ` <span class="desk-mini">${esc(p.desk)}</span>` : ''}</b><small>${esc(p.dept || L('без отдела', 'no department'))}${p.prof && PROF[p.prof] ? ' · ' + PROF[p.prof].name : ''}</small></span>
  <span class="lb-res">${personStatus(p)}${p.short_id ? `<button class="btn-chip" type="button" data-dm="${p.short_id}" data-name="${esc(p.name)}">${L('Написать', 'Message')}</button><button class="btn-chip" type="button" data-invite="${p.short_id}">${L('Позвать', 'Invite')}</button>` : ''}</span></div>`;
const bindInvite = root => {
  root.querySelectorAll('[data-invite]').forEach(b => b.onclick = () => inviteToOffice(b.dataset.invite, b));
  root.querySelectorAll('[data-dm]').forEach(b => b.onclick = () => openDm(b.dataset.dm, b.dataset.name));
};
// Вкладка «Офис»: до 6 игроков в сети
async function renderOnlineBox() {
  const box = $('onlineBox');
  if (!prefs.name) { box.hidden = true; return; }
  try {
    const rows = await onlineNow();
    box.hidden = false;
    box.innerHTML = `<div class="ob-head"><b><i class="live-dot"></i>${L('Сейчас в игре', 'Playing now')}: ${rows.length}</b><button class="btn-chip" type="button" id="obAll">${L('Все участники', 'All players')}</button></div>
      ${rows.length ? `<div class="board-list">${rows.slice(0, 6).map(onlineRow).join('')}</div>` : `<p class="field-note">${L('Пока никого. Позовите коллег по ссылке — кнопка ниже.', 'Nobody yet. Invite coworkers with a link — button below.')}</p>`}`;
    bindInvite(box); $('obAll').onclick = () => openBoard('menu', 'people');
  } catch { box.hidden = true; }
}
// Список в окне — из значка «сейчас в игре» во время недели
async function showOnlineModal() {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass online-modal" role="dialog" aria-modal="true" aria-labelledby="olTitle"><h2 id="olTitle">${L('Сейчас в игре', 'Playing now')}</h2><p>${L('Загружаю…', 'Loading…')}</p></div>`;
  m.hidden = false; m.onclick = e => { if (e.target === m) m.hidden = true; };
  const rows = await onlineNow().catch(() => []);
  m.querySelector('.modal-box').innerHTML = `<h2 id="olTitle">${L('Сейчас в игре', 'Playing now')}: ${rows.length}</h2>
    ${rows.length ? `<div class="board-list">${rows.map(onlineRow).join('')}</div>` : `<p>${L('Сейчас никого нет.', 'Nobody’s on right now.')}</p>`}
    <p class="field-note">${L('Позвать в офис — и вы будете играть турниры и общаться в чате офиса.', 'Invite them to your office — then you can play tournaments and chat together.')}</p>
    <button class="btn-ghost" type="button" id="olClose">${L('Вернуться к неделе', 'Back to the week')}</button>`;
  bindInvite(m); $('olClose').onclick = () => { m.hidden = true; };
}
// Позвать игрока: нужен аккаунт и офис; офиса нет — предложим создать его тут же
let inviteToOffice = async function (short, btn) {
  if (!registered()) {
    toast(L('Звать в свой офис могут зарегистрированные игроки', 'Only registered players can invite people to their office'));
    if (views.game.hidden) { $('modal').hidden = true; renderJoin('register', L('Зарегистрируйтесь — и сможете создать свой офис и позвать в него коллег.', 'Sign up to create your own office and invite your coworkers.')); }
    return;
  }
  let team = myTeamCache || (await board.rpc('my_team', { p_id: prefs.playerId }).catch(() => []))[0];
  if (!team) {
    const name = await askOfficeName();
    if (!name) return;
    try { await board.rpc('create_team', { p_id: prefs.playerId, p_name: name }); team = myTeamCache = (await board.rpc('my_team', { p_id: prefs.playerId }))[0]; }
    catch (err) { toast(err.message); return; }
  }
  try {
    const n = await board.rpc('invite_player', { p_id: prefs.playerId, p_short: short });
    if (btn) { btn.textContent = L('Приглашён', 'Invited'); btn.disabled = true; }
    toast(L(`Приглашение в «${team.name}» отправлено: ${n}`, `Invite to “${team.name}” sent: ${n}`));
  } catch (err) { toast(err.message); }
}
function askOfficeName() {
  return new Promise(done => {
    const el = $('invitePop');
    el.innerHTML = `<form class="ip-form" id="ipForm"><span class="ip-text">${L('<b>Сначала создайте свой офис</b> — в него и позовём.', '<b>Create your office first</b> — that’s where we’ll invite them.')}</span>
      <input id="ipName" maxlength="32" value="${esc(L(`Офис ${prefs.name}`, `${prefs.name}’s Office`).slice(0, 32))}" aria-label="${L('Название офиса', 'Office name')}">
      <span class="ip-btns"><button class="btn-main" type="submit">${L('Создать и позвать', 'Create and invite')}</button><button class="btn-ghost" type="button" id="ipCancel">${L('Отмена', 'Cancel')}</button></span></form>`;
    el.hidden = false;
    $('ipName').focus(); $('ipName').select();
    $('ipCancel').onclick = () => { el.hidden = true; done(null); };
    $('ipForm').onsubmit = e => { e.preventDefault(); const n = $('ipName').value.trim(); if (n.length < 2) { $('ipName').focus(); return; } el.hidden = true; done(n); };
  });
}

async function showOffice() {
  if (!board.online) return offline(L('Мой офис', 'My Office'));
  setPhase('evening');
  views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">${L('Мой офис', 'My Office')}</span><p>${L('Загружаю…', 'Loading…')}</p></div>`; show('end');
  let team;
  try { await board.touch('menu'); team = (await board.rpc('my_team', { p_id: prefs.playerId }))[0]; }
  catch (err) { views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">${L('Мой офис', 'My Office')}</span><h1>${L('Нет связи', 'No connection')}</h1><p>${esc(err.message)}</p><div class="stack"><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div></div>`; $('toMenu').onclick = renderMenu; return; }
  const myId = shortId(await myTag);
  if (!team) {
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">${L(`Мой офис · ваш ID ${myId}`, `My Office · your ID ${myId}`)}</span>
      <h1>${L('Соберите команду', 'Build your team')}</h1>
      <p>${L('Создайте офис и позовите коллег по ссылке или по их ID. Или вступите в офис по коду, который вам прислали.', 'Create an office and invite coworkers by link or by their ID. Or join an office with a code someone sent you.')}</p>
      <form class="inline-form" id="mkForm"><input id="mkName" maxlength="32" placeholder="${L('Название офиса, например «Отдел продаж»', 'Office name, e.g. “Sales Team”')}" aria-label="${L('Название офиса', 'Office name')}"><button class="btn-main" type="submit">${L('Создать', 'Create')}</button></form>
      <form class="inline-form" id="jnForm"><input id="jnCode" maxlength="6" placeholder="${L('Код офиса', 'Office code')}" aria-label="${L('Код офиса', 'Office code')}" autocapitalize="characters"><button class="btn-ghost" type="submit">${L('Вступить', 'Join')}</button></form>
      <p class="join-err" id="ofErr" role="alert"></p>
      <div class="stack"><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div></div>`;
    $('toMenu').onclick = renderMenu;
    $('mkForm').onsubmit = async e => { e.preventDefault(); const n = $('mkName').value.trim();
      if (n.length < 2) { $('ofErr').textContent = L('Название — хотя бы 2 символа.', 'The name needs at least 2 characters.'); return; }
      try { await board.rpc('create_team', { p_id: prefs.playerId, p_name: n }); showOffice(); } catch (err) { $('ofErr').textContent = err.message; } };
    $('jnForm').onsubmit = async e => { e.preventDefault();
      try { const n = await board.rpc('join_team', { p_id: prefs.playerId, p_code: $('jnCode').value }); toast(L(`Вы в офисе «${n}»`, `You’re in the “${n}” office`)); showOffice(); } catch (err) { $('ofErr').textContent = err.message; } };
    return;
  }
  const members = await board.rpc('team_members_list', { p_id: prefs.playerId }).catch(() => []);
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${L('Мой офис', 'My Office')} · ${pl(members.length, 'участник', 'участника', 'участников', 'member', 'members')}</span>
    <h1>${esc(team.name)}</h1>
    <div class="office-code"><span class="kicker">${L('Код офиса', 'Office code')}</span><b>${team.code}</b><small>${esc(inviteLink(team.code))}</small>
      <button class="btn-ghost" id="cpLink">${L('Скопировать ссылку-приглашение', 'Copy invite link')}</button></div>
    <form class="inline-form" id="invForm"><input id="invId" maxlength="6" placeholder="${L('ID игрока, например 3FA9C1', 'Player ID, e.g. 3FA9C1')}" aria-label="${L('ID игрока', 'Player ID')}" autocapitalize="characters"><button class="btn-main" type="submit">${L('Позвать', 'Invite')}</button></form>
    <p class="join-err" id="ofErr" role="alert"></p>
    <div class="members panel board-list">${members.map(m => `<div class="lb-row person${m.is_me ? ' me' : ''}">
      <span class="lb-ava" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
      <span class="lb-who"><b>${esc(m.name)}${m.is_me ? L(' (вы)', ' (you)') : ''}${m.is_owner ? L(' · создатель', ' · founder') : ''}</b><small>${esc(m.dept || L('без отдела', 'no department'))} · ID ${m.short_id}</small></span>
      <span class="lb-res">${personStatus(m)}</span></div>`).join('')}</div>
    <div class="tour-box" id="tourBox"><span class="kicker">${L('Турнир офиса', 'Office tournament')}</span><p class="field-note">${L('Загружаю…', 'Loading…')}</p></div>
    <div class="stack"><button class="btn-main" id="toChat">${L('Чат офиса', 'Office chat')}</button><button class="btn-ghost" id="leave">${L('Покинуть офис', 'Leave office')}</button><button class="btn-ghost" id="toMenu">${L('В главное меню', 'Main menu')}</button></div></div>`;
  $('toMenu').onclick = renderMenu; $('toChat').onclick = () => showChat('team');
  renderTourBox(team);
  $('cpLink').onclick = () => copy(L(`Заходи в наш офис «${team.name}» в игре «Выжить до пятницы»: ${inviteLink(team.code)}`, `Join our “${team.name}” office in Survive till Friday: ${inviteLink(team.code)}`), L('Ссылка скопирована — отправьте её в рабочий чат', 'Link copied — drop it in your work chat'));
  $('invForm').onsubmit = async e => { e.preventDefault();
    try { const n = await board.rpc('invite_player', { p_id: prefs.playerId, p_short: $('invId').value }); $('invId').value = ''; $('ofErr').textContent = ''; toast(L(`Приглашение отправлено: ${n}`, `Invite sent: ${n}`)); }
    catch (err) { $('ofErr').textContent = err.message; } };
  $('leave').onclick = async () => { const b = $('leave');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = L('Точно покинуть офис? Нажмите ещё раз', 'Really leave the office? Tap again'); return; }
    await board.rpc('leave_team', { p_id: prefs.playerId }).catch(err => toast(err.message)); showOffice(); };
}

// ---------- статистика игры: ?stats ----------
async function showStats() {
  views.end.classList.add('screen-view'); show('end'); setPhase('evening');
  views.end.innerHTML = `<div class="screen"><div class="scr-head"><h1>${L('Статистика', 'Stats')}</h1><p class="scr-when">${L('Загружаю…', 'Loading…')}</p></div></div>`;
  try {
    const get = v => fetch(`${window.SUPABASE_CONFIG.url.replace(/\/+$/, '')}/rest/v1/${v}?select=*`, { headers: { apikey: window.SUPABASE_CONFIG.anonKey } }).then(r => r.ok ? r.json() : Promise.reject(new Error(L(`Supabase ответил ${r.status} на ${v}`, `Supabase returned ${r.status} for ${v}`))));
    const [[o], killers, [f], modes] = await Promise.all(['stats_overview', 'stats_killers', 'stats_funnel', 'stats_modes'].map(get));
    const [sources, shares] = await Promise.all(['stats_sources', 'stats_shares'].map(v => get(v).catch(() => [])));  // нет в старой схеме — пропускаем
    const SHARE = EN ? { meme: 'meme card', challenge: 'Daily Week challenge', team: 'invite coworkers', friends: 'invite friends' } : { meme: 'мем-карточка', challenge: 'вызов на неделю дня', team: 'позвать коллег', friends: 'позвать друзей' };
    const box = (v, l) => `<div class="stat-box"><b>${v ?? 0}</b><span>${l}</span></div>`;
    const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
    views.end.innerHTML = `<div class="screen stats">
      <div class="scr-head"><span class="kicker">${L('Только сводные цифры, без личных данных', 'Aggregate numbers only, no personal data')}</span><h1>${L('Статистика игры', 'Game stats')}</h1></div>
      <div class="stats-grid">${box(o.players, L('игроков всего', 'total players'))}${box(o.active_day, L('за сутки', 'last 24 hours'))}${box(o.active_week, L('за неделю', 'last 7 days'))}${box(o.weeks, L('недель сыграно', 'weeks played'))}
        ${box((o.win_rate ?? 0) + '%', L('недель закрыто', 'weeks survived'))}${box((o.quiz_rate ?? 0) + '%', L('верных на втором шансе', 'correct on Second chance'))}${box(o.shares, L('приглашений открыто', 'invites opened'))}${box(o.installs, L('установок на телефон', 'phone installs'))}</div>
      <h2>${L('Воронка', 'Funnel')}</h2>
      <div class="stats-grid">${box(f.opened, L('зашли в игру', 'opened the game'))}${box(`${f.week1} · ${pct(f.week1, f.opened)}`, L('доиграли 1 неделю', 'finished 1 week'))}${box(`${f.week3} · ${pct(f.week3, f.opened)}`, L('3 недели', '3 weeks'))}${box(`${f.week10} · ${pct(f.week10, f.opened)}`, L('10 недель', '10 weeks'))}${box(f.year, L('весь год', 'full year'))}</div>
      <h2>${L('По режимам', 'By mode')}</h2>
      <div class="scr-list">${modes.map(m => `<div class="scr-row"><span class="scr-pos">${m.weeks}</span><span></span><span class="scr-name"><b>${(EN ? { career: 'Career', daily: 'Daily Week', tour: 'Tournament', pack: 'Branded' } : { career: 'Карьера', daily: 'Неделя дня', tour: 'Турнир', pack: 'Брендированная' })[m.mode] || m.mode}</b><small>${L(`в среднем ходов за неделю: ${m.avg_step} из ${WEEK_LEN}`, `avg moves per week: ${m.avg_step} of ${WEEK_LEN}`)}</small></span><span class="scr-res won">${m.win_rate}%</span></div>`).join('') || `<p class="scr-empty">${L('Пока нет данных', 'No data yet')}</p>`}</div>
      <h2>${L('Откуда пришли (30 дней)', 'Traffic sources (30 days)')}</h2>
      <div class="scr-list">${sources.map(s => `<div class="scr-row"><span class="scr-pos">${s.players}</span><span></span><span class="scr-name"><b>${esc(s.source)}</b><small>${L('доиграли неделю', 'finished a week')}: ${s.played} · ${pct(s.played, s.players)}</small></span><span class="scr-res won">${pct(s.players, sources.reduce((a, x) => a + x.players, 0))}</span></div>`).join('') || `<p class="scr-empty">${L('Пока нет данных', 'No data yet')}</p>`}</div>
      <h2>${L('Чем делятся', 'What people share')}</h2>
      <div class="scr-list">${shares.map(s => `<div class="scr-row"><span class="scr-pos">${s.shares}</span><span></span><span class="scr-name"><b>${esc(SHARE[s.kind] || s.kind)}</b></span><span></span></div>`).join('') || `<p class="scr-empty">${L('Пока нет данных', 'No data yet')}</p>`}</div>
      <h2>${L('Карточки, на которых чаще всего увольняют', 'Cards that get people fired most')}</h2>
      <div class="scr-list">${killers.map((k, i) => `<div class="scr-row"><span class="scr-pos">${i + 1}</span><span></span><span class="scr-name"><b>${esc(byId[k.card_id]?.text?.slice(0, 90) || k.card_id)}</b><small>${esc(k.card_id)}</small></span><span class="scr-res lost">${k.losses}</span></div>`).join('') || `<p class="scr-empty">${L('Пока нет данных', 'No data yet')}</p>`}</div>
      <button class="btn-ghost scr-exit" id="stBack">${L('Закрыть', 'Close')}</button></div>`;
  } catch (err) { views.end.innerHTML = `<div class="end-sheet glass"><h1>${L('Нет данных', 'No data')}</h1><p>${esc(err.message)}. ${L('Выполните свежий supabase/schema.sql.', 'Run the latest supabase/schema.sql.')}</p><div class="stack"><button class="btn-ghost" id="stBack">${L('Закрыть', 'Close')}</button></div></div>`; }
  $('stBack').onclick = () => { views.end.classList.remove('screen-view'); history.replaceState(null, '', location.pathname); prefs.name ? renderMenu() : renderWelcome(); };
}

// ---------- турнир офиса ----------
// Создатель офиса назначает старт; все играют одну неделю (по общему seed), в зачёт — первая попытка
const fmtTime = iso => new Date(iso).toLocaleString(LOCALE, { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const until = iso => { const m = Math.round((new Date(iso) - Date.now()) / 60000); return m <= 0 ? L('уже идёт', 'now') : m < 60 ? L(`через ${m} мин`, `in ${m} min`) : m < 1440 ? L(`через ${Math.floor(m / 60)} ч ${m % 60} мин`, `in ${Math.floor(m / 60)}h ${m % 60}m`) : L(`через ${Math.floor(m / 1440)} дн.`, `in ${Math.floor(m / 1440)} days`); };
let tourTimer = null;
async function renderTourBox(team) {
  const box = $('tourBox'); if (!box) return;
  const t = (await board.rpc('my_tournament', { p_id: prefs.playerId }).catch(() => []))[0] || null;
  const played = t && store.get('vdp-tours', {})[t.tour_id];
  const started = t && new Date(t.starts_at) <= Date.now();
  const pad = n => String(n).padStart(2, '0'), soon = new Date(Date.now() + 3600e3);
  const def = `${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:00`;
  box.innerHTML = `<span class="kicker">${L('Турнир офиса', 'Office tournament')}</span>
    ${t ? `<p class="tour-when"><b>${started ? L('Турнир идёт', 'Tournament is on') : L(`Старт ${until(t.starts_at)}`, `Starts ${until(t.starts_at)}`)}</b><span>${fmtTime(t.starts_at)}</span></p>` : `<p class="field-note">${L('Одна и та же неделя для всего офиса, общий старт и таблица итогов на большом экране.', 'Same week for the whole office, one start time, and a results table for the big screen.')}</p>`}
    ${t && started ? `<button class="btn-main" id="tourPlay">${played ? L('Сыграть ещё раз (не в зачёт)', 'Play again (won’t count)') : L('Играть турнир', 'Play the tournament')}</button>` : ''}
    ${t ? `<button class="btn-ghost" id="tourScreen">${L('Экран итогов для проектора', 'Results screen for the projector')}</button>` : ''}
    ${team.is_owner ? `<form class="inline-form" id="tourForm"><input id="tourAt" type="datetime-local" value="${def}" aria-label="${L('Время старта турнира', 'Tournament start time')}"><button class="btn-ghost" type="submit">${t ? L('Новый турнир', 'New tournament') : L('Назначить', 'Schedule')}</button></form>` : t ? '' : `<p class="field-note">${L('Назначить турнир может создатель офиса.', 'Only the office founder can schedule a tournament.')}</p>`}
    <p class="join-err" id="tourErr" role="alert"></p>`;
  if ($('tourPlay')) $('tourPlay').onclick = async () => { await whenReady($('tourPlay')); startTournament(t, !played); };
  if ($('tourScreen')) $('tourScreen').onclick = () => openScreen(t.code);
  if ($('tourForm')) $('tourForm').onsubmit = async e => { e.preventDefault();
    try { await board.rpc('set_tournament', { p_id: prefs.playerId, p_starts: new Date($('tourAt').value).toISOString() }); toast(L('Турнир назначен — коллеги увидят его в «Мой офис» и в меню', 'Tournament scheduled — your coworkers will see it in “My Office” and in the menu')); renderTourBox(team); }
    catch (err) { $('tourErr').textContent = err.message; } };
  clearTimeout(tourTimer);
  if (t && !started) tourTimer = setTimeout(() => renderTourBox(team), 30000);
}
function startTournament(t, ranked) {
  const rng = seeded('vdp-tour-' + t.seed);
  C = null;
  S = newWeekState({ mode: 'tour', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal', rng, extra: { tourId: t.tour_id, tourCode: t.code, tourTeam: t.team_name } });
  S.deck = buildDeck({ type: 'normal', rng, profCard: false, classic: !POOL.length });
  S.ranked = ranked;
  enterGame();
}
// Экран итогов: крупная таблица для проектора, обновляется каждые 10 секунд. Открывается и по ссылке ?screen=КОД
let screenTimer = null;
function openScreen(code) {
  clearInterval(screenTimer);
  views.end.classList.add('screen-view'); show('end'); setPhase('evening');
  const load = async () => {
    if (views.end.hidden || !views.end.classList.contains('screen-view')) return clearInterval(screenTimer);
    let rows = [];
    try { rows = await board.rpc('tournament_board', { p_code: code }); }
    catch (err) { views.end.innerHTML = `<div class="end-sheet glass"><h1>${L('Нет данных', 'No data')}</h1><p>${esc(err.message)}</p><div class="stack"><button class="btn-ghost" id="scrBack">${L('Назад', 'Back')}</button></div></div>`; $('scrBack').onclick = closeScreen; return; }
    const head = rows[0], players = rows.filter(r => r.name);
    views.end.innerHTML = `<div class="screen">
      <div class="scr-head"><span class="kicker">${L('Турнир офиса · обновляется каждые 10 секунд', 'Office tournament · refreshes every 10 seconds')}</span>
        <h1>${head ? esc(head.team_name) : L('Турнир не найден', 'Tournament not found')}</h1>
        ${head ? `<p class="scr-when">${new Date(head.starts_at) > Date.now() ? L(`Старт ${until(head.starts_at)} · ${fmtTime(head.starts_at)}`, `Starts ${until(head.starts_at)} · ${fmtTime(head.starts_at)}`) : L(`Идёт с ${fmtTime(head.starts_at)} · сыграли: ${players.length}`, `Running since ${fmtTime(head.starts_at)} · played: ${players.length}`)}</p>` : ''}</div>
      <div class="scr-list">${players.length ? players.map((r, i) => `<div class="scr-row${i < 3 ? ' top' : ''}">
        <span class="scr-pos">${i + 1}</span><span class="scr-ava" aria-hidden="true">${esc(r.avatar || '🙂')}</span>
        <span class="scr-name"><b>${esc(r.name)}</b><small>${esc(r.dept || '')}</small></span>
        <span class="scr-res ${r.won ? 'won' : 'lost'}">${r.won ? `${r.total}/400` : `${stepName(r.step)} · ${r.death ? resName(r.death) : ''} ${r.overheat ? '100' : '0'}%`}</span></div>`).join('')
        : `<p class="scr-empty">${L('Пока никто не сыграл. Ждём первых результатов!', 'Nobody has played yet. Waiting for the first results!')}</p>`}</div>
      <button class="btn-ghost scr-exit" id="scrBack">${L('Закрыть экран', 'Close screen')}</button></div>`;
    $('scrBack').onclick = closeScreen;
  };
  const closeScreen = () => { clearInterval(screenTimer); views.end.classList.remove('screen-view'); history.replaceState(null, '', location.pathname); prefs.name ? renderMenu() : renderWelcome(); };
  load(); screenTimer = setInterval(load, 10000);
}

// Чаты: офиса (только участники) и общий для всех игроков; обновляются каждые 4 секунды
let chatTimer = null, chatLast = '', chatChannel = '';
async function showChat(channel) {
  if (!board.online) return offline(L('Чат', 'Chat'));
  setPhase('evening'); clearInterval(chatTimer); chatLast = ''; chatChannel = channel;
  views.end.innerHTML = `<div class="chat">
    <div class="board-head"><button class="back-btn" id="chBack" type="button">${L('← Назад', '← Back')}</button><h2>${channel === 'team' ? L('Чат офиса', 'Office chat') : L('Общий чат', 'General chat')}</h2><span class="back-sp"></span></div>
    <div class="tabs" role="tablist"><button class="tab" role="tab" id="chTeam" aria-selected="${channel === 'team'}">${L('Офис', 'Office')}</button><button class="tab" role="tab" id="chAll" aria-selected="${channel === 'global'}">${L('Все игроки', 'Everyone')}</button><button class="tab" role="tab" id="chDm" aria-selected="false">${L('Личные', 'Direct')}</button></div>
    <div class="chat-list panel" id="chList" aria-live="polite"><div class="lb-empty">${L('Загружаю…', 'Loading…')}</div></div>
    <form class="chat-form" id="chForm"><input id="chText" maxlength="300" placeholder="${L('Сообщение', 'Message')}" autocomplete="off" aria-label="${L('Сообщение', 'Message')}"><button class="btn-main" type="submit">${L('Отправить', 'Send')}</button></form>
  </div>`;
  views.end.classList.add('chat-view'); show('end');
  const leave = () => { clearInterval(chatTimer); chatChannel = ''; views.end.classList.remove('chat-view'); };
  $('chBack').onclick = () => { leave(); renderMenu(); };
  $('chTeam').onclick = () => { leave(); showChat('team'); };
  $('chAll').onclick = () => { leave(); showChat('global'); };
  $('chDm').onclick = () => { leave(); showDmInbox(); };
  await board.touch('menu').catch(() => {});
  const load = async () => {
    if (!$('chList')) return clearInterval(chatTimer);
    try {
      const rows = (await board.rpc('get_messages', { p_id: prefs.playerId, p_channel: channel })).reverse();
      const sig = rows.map(r => r.msg_id).join(',');
      const top = Math.max(0, ...rows.map(r => r.msg_id)), cs = prefs.chatSeen ||= {};
      if (top > (cs[channel] || 0)) { cs[channel] = top; store.set(KEY.prefs, prefs); }
      if (sig === chatLast) return;
      chatLast = sig;
      const list = $('chList'), atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
      if (channel === 'team' && !rows.length) {
        const team = (await board.rpc('my_team', { p_id: prefs.playerId }))[0];
        list.innerHTML = team ? L(`<div class="lb-empty"><span class="big">Тишина</span>В чате офиса «${esc(team.name)}» пока пусто. Напишите первыми!</div>`, `<div class="lb-empty"><span class="big">Crickets</span>The “${esc(team.name)}” office chat is empty. Break the ice!</div>`)
          : L('<div class="lb-empty"><span class="big">Нет офиса</span>Чат офиса появится, когда вы создадите офис или вступите в него. А пока есть общий чат.</div>', '<div class="lb-empty"><span class="big">No office</span>The office chat appears once you create or join an office. Meanwhile, there’s the general chat.</div>');
        return;
      }
      list.innerHTML = rows.length ? rows.map(m => `<div class="msg${m.mine ? ' mine' : ''}"><span class="ava-s" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
        <span class="meta">${m.mine ? '' : `<b>${esc(m.name)}</b> · `}${new Date(m.sent_at).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}${m.dept && !m.mine ? ` · ${esc(m.dept)}` : ''}</span>
        <span class="bubble">${esc(m.msg)}</span>
        <span class="msg-act">${m.can_hide ? `<button data-hide="${m.msg_id}">${L('Скрыть', 'Hide')}</button>` : ''}${m.mine ? '' : `<button data-report="${m.msg_id}">${L('Пожаловаться', 'Report')}</button>`}</span></div>`).join('') : L('<div class="lb-empty"><span class="big">Тишина</span>Сообщений пока нет. Напишите первыми!</div>', '<div class="lb-empty"><span class="big">Crickets</span>No messages yet. Break the ice!</div>');
      list.querySelectorAll('[data-hide]').forEach(b => b.onclick = async () => {
        try { await board.rpc('hide_message', { p_id: prefs.playerId, p_msg: +b.dataset.hide }); toast(L('Сообщение скрыто', 'Message hidden')); chatLast = ''; load(); } catch (err) { toast(err.message); } });
      list.querySelectorAll('[data-report]').forEach(b => b.onclick = async () => {
        try { await board.rpc('report_message', { p_id: prefs.playerId, p_msg: +b.dataset.report }); b.textContent = L('Жалоба отправлена', 'Reported'); b.disabled = true; toast(L('Спасибо. После трёх жалоб сообщение скроется', 'Thanks. After three reports the message gets hidden')); chatLast = ''; }
        catch (err) { toast(err.message); } });
      if (atBottom || rows.some(r => r.mine)) list.scrollTop = list.scrollHeight;
    } catch (err) { $('chList').innerHTML = `<div class="lb-empty"><span class="big">${L('Нет связи', 'No connection')}</span>${esc(err.message)}</div>`; }
  };
  $('chForm').onsubmit = async e => {
    e.preventDefault(); const t = $('chText').value.trim(); if (!t) return;
    try { await board.rpc('post_message', { p_id: prefs.playerId, p_channel: channel, p_text: t }); $('chText').value = ''; chatLast = ''; load(); }
    catch (err) { toast(err.message); }
  };
  await load();
  chatTimer = setInterval(() => { if (!document.hidden) load(); }, 4000);
}

// ---------- личные сообщения ----------
// Писать и читать могут зарегистрированные; окно переписки открывается поверх игры и не прерывает неделю
let dmOpen = '', dmTimer = null;
const dmNeedAccount = () => {
  toast(L('Писать игрокам могут зарегистрированные игроки', 'Only registered players can send messages'));
  if (views.game.hidden) { $('modal').hidden = true; renderJoin('register', L('Зарегистрируйтесь — и сможете переписываться с игроками и звать их в свой офис.', 'Sign up to message players and invite them to your office.')); }
};
let openDm = async function (short, name) {
  if (!board.online) return toast(L('Сообщения работают, когда есть связь с сервером', 'Messages need a connection to the server'));
  if (!registered()) return dmNeedAccount();
  const m = $('modal'); clearInterval(dmTimer); dmOpen = short;
  m.innerHTML = `<div class="modal-box glass dm-box" role="dialog" aria-modal="true" aria-labelledby="dmTitle">
    <div class="dm-head"><h2 id="dmTitle">✉ ${esc(name || L('Игрок', 'Player'))}</h2><button class="ip-x" type="button" id="dmClose" aria-label="${L('Закрыть', 'Close')}">×</button></div>
    <div class="dm-list" id="dmList" aria-live="polite"><div class="lb-empty">${L('Загружаю…', 'Loading…')}</div></div>
    <form class="chat-form" id="dmForm"><input id="dmText" maxlength="300" placeholder="${L('Сообщение', 'Message')}" autocomplete="off" aria-label="${L('Сообщение', 'Message')}"><button class="btn-main" type="submit">${L('Отправить', 'Send')}</button></form></div>`;
  m.hidden = false;
  const close = () => { clearInterval(dmTimer); dmOpen = ''; m.hidden = true; };
  $('dmClose').onclick = close; m.onclick = e => { if (e.target === m) close(); };
  let sig = '';
  const load = async () => {
    if (!$('dmList') || dmOpen !== short) return clearInterval(dmTimer);
    try {
      const rows = ((await board.rpc('dm_thread', { p_id: prefs.playerId, p_with: short })) || []).reverse();
      const s2 = rows.map(r => r.msg_id).join(','); if (s2 === sig) return; sig = s2;
      const list = $('dmList');
      list.innerHTML = rows.length ? rows.map(r => `<div class="msg${r.mine ? ' mine' : ''}"><span class="meta">${new Date(r.sent_at).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}</span><span class="bubble">${esc(r.msg)}</span></div>`).join('')
        : `<div class="lb-empty">${L('Напишите первым — например, позовите в свой офис или вызовите на неделю дня.', 'Say hi first — invite them to your office or challenge them to the Daily Week.')}</div>`;
      list.scrollTop = list.scrollHeight;
    } catch (err) { $('dmList').innerHTML = `<div class="lb-empty">${esc(err.message)}</div>`; }
  };
  $('dmForm').onsubmit = async e => {
    e.preventDefault(); const t = $('dmText').value.trim(); if (!t) return;
    try { await board.rpc('send_dm', { p_id: prefs.playerId, p_to: short, p_text: t }); $('dmText').value = ''; sig = ''; load(); bus.emit('dm'); }
    catch (err) { toast(err.message); }
  };
  await load(); dmTimer = setInterval(() => { if (!document.hidden) load(); }, 5000);
  if (matchMedia('(pointer: fine)').matches) $('dmText').focus();
}
// Экран «Личные»: с кем переписка, сколько непрочитанных
async function showDmInbox() {
  if (!board.online) return offline(L('Чат', 'Chat'));
  if (!registered()) return dmNeedAccount();
  setPhase('evening'); clearInterval(chatTimer); chatChannel = 'dm';
  views.end.innerHTML = `<div class="chat">
    <div class="board-head"><button class="back-btn" id="chBack" type="button">${L('← Назад', '← Back')}</button><h2>${L('Личные сообщения', 'Direct messages')}</h2><span class="back-sp"></span></div>
    <div class="tabs" role="tablist"><button class="tab" role="tab" id="chTeam" aria-selected="false">${L('Офис', 'Office')}</button><button class="tab" role="tab" id="chAll" aria-selected="false">${L('Все игроки', 'Everyone')}</button><button class="tab" role="tab" id="chDm" aria-selected="true">${L('Личные', 'Direct')}</button></div>
    <div class="chat-list panel board-list" id="chList"><div class="lb-empty">${L('Загружаю…', 'Loading…')}</div></div></div>`;
  views.end.classList.add('chat-view'); show('end');
  const leave = () => { chatChannel = ''; views.end.classList.remove('chat-view'); };
  $('chBack').onclick = () => { leave(); renderMenu(); };
  $('chTeam').onclick = () => { leave(); showChat('team'); };
  $('chAll').onclick = () => { leave(); showChat('global'); };
  try {
    const rows = (await board.rpc('dm_inbox', { p_id: prefs.playerId })) || [];
    $('chList').innerHTML = rows.length ? rows.map((r, i) => `<button class="lb-row person dm-row" type="button" data-i="${i}"><span class="lb-ava" aria-hidden="true">${esc(r.with_avatar || '🙂')}</span>
      <span class="lb-who"><b>${esc(r.with_name)}</b><small>${esc(r.last_msg.slice(0, 60))}</small></span><span class="lb-res">${r.unread ? `<b class="dm-unread">${r.unread}</b>` : ''}<small>${ago(r.last_at)}</small></span></button>`).join('')
      : `<div class="lb-empty"><span class="big">${L('Пока пусто', 'Nothing yet')}</span>${L('Напишите тому, кто сейчас в игре: лента игроков есть в меню и прямо во время недели.', 'Message someone who’s playing now: the live strip is in the menu and right in the game.')}</div>`;
    $('chList').querySelectorAll('[data-i]').forEach(b => b.onclick = async () => { const r = rows[+b.dataset.i]; await openDm(r.with_short, r.with_name); });
  } catch (err) { $('chList').innerHTML = `<div class="lb-empty">${esc(err.message)}</div>`; }
}
// Карточка игрока из ленты «сейчас в игре»: написать или позвать в офис
function personPop(p) {
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass person-pop" role="dialog" aria-modal="true" aria-labelledby="ppName">
    <span class="pp-ava" aria-hidden="true">${esc(p.avatar || '🙂')}</span><h2 id="ppName">${esc(p.name)}</h2>
    <p>${esc(p.dept || L('без отдела', 'no department'))}${p.prof && PROF[p.prof] ? ' · ' + PROF[p.prof].name : ''}</p><p>${personStatus(p)}</p>
    ${p.rank && typeof RANKS !== 'undefined' && RANKS[p.rank] ? `<p class="pp-rank">🎖️ ${RANKS[p.rank].name}</p>` : ''}${p.desk ? `<p class="pp-desk" title="${L('Рабочий стол', 'Desk')}">${esc(p.desk)}</p>` : ''}
    ${p.npc ? `<p class="npc-note">🎭 ${L('Персонаж игры: отвечает сам, пока живых коллег в сети мало', 'A game character: replies on their own while few real players are online')}</p>` : ''}
    <div class="row2"><button class="btn-main" type="button" id="ppDm">✉ ${L('Написать', 'Message')}</button><button class="btn-ghost" type="button" id="ppInv">🏢 ${L('Позвать в офис', 'Invite to office')}</button></div>
    <button class="btn-ghost" type="button" id="ppClose">${L('Вернуться к неделе', 'Back to the week')}</button></div>`;
  m.hidden = false; m.onclick = e => { if (e.target === m) m.hidden = true; };
  $('ppDm').onclick = () => openDm(p.short_id, p.name);
  $('ppInv').onclick = () => inviteToOffice(p.short_id, $('ppInv'));
  $('ppClose').onclick = () => { m.hidden = true; };
}

// ---------- приглашения в игру: ссылки с ID, плашка, бонус за пришедших ----------
const gameUrl = () => /^https?:/.test(location.href) ? location.origin + location.pathname : 'https://survivefriday.com/';
async function referralLink(kind) {
  const ref = shortId(await myTag);
  let team = null;
  if (kind === 'team' && registered()) team = myTeamCache || (await board.rpc('my_team', { p_id: prefs.playerId }).catch(() => []))[0] || null;
  const tg = window.SUPABASE_CONFIG?.telegram;
  if (tg?.bot) return { url: `https://t.me/${tg.bot}${tg.app ? `/${tg.app}` : ''}?startapp=ref-${ref}${team ? `_join-${team.code}` : ''}`, team };
  return { url: `${gameUrl()}?ref=${ref}${team ? `&join=${team.code}` : ''}`, team };
}
// Ссылка-вызов: та же неделя дня и результат, по которому сравнят; в Telegram — через мини-приложение
async function challengeLink(code) {
  const ref = shortId(await myTag), tg = window.SUPABASE_CONFIG?.telegram;
  if (tg?.bot) return `https://t.me/${tg.bot}${tg.app ? `/${tg.app}` : ''}?startapp=ref-${ref}_ch-${code}`;
  return `${gameUrl()}?ref=${ref}&ch=${code}&by=${encodeURIComponent(prefs.name.slice(0, 24))}`;
}
// Пришли по вызову: запоминаем до игры (переживёт регистрацию и перезагрузку)
function rememberChallenge(code, by, ref) {
  const c = parseChallenge(code);
  if (!c || (prefs.challenge && prefs.challenge.day === c.day && prefs.challenge.ref === ref && prefs.challenge.num === c.num)) return;
  prefs.challenge = { ...c, by: (by || '').slice(0, 24), ref: (ref || '').toUpperCase(), at: Date.now() };
  store.set(KEY.prefs, prefs);
}
{
  const q = new URLSearchParams(location.search);
  if (q.get('ch')) {
    rememberChallenge(q.get('ch'), q.get('by'), q.get('ref'));
    q.delete('ch'); q.delete('by'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  }
}
async function renderChallengeCta() {
  const c = prefs.challenge, el = $('chCta');
  el.hidden = !c || c.done || Date.now() - c.at > 14 * 864e5;
  if (el.hidden) return;
  if (!c.by && c.ref && board.online) {  // из Telegram имя не передаётся — ищем по ID среди участников
    const p = (await board.people().catch(() => [])).find(x => shortId(x.tag) === c.ref);
    if (p?.name) { c.by = p.name; store.set(KEY.prefs, prefs); }
  }
  el.querySelector('span').innerHTML = L(`<b>Вызов: ${esc(chName(c))}</b> ${chResult(c)}. Неделя дня ${dayLabel(c.day)} — та же самая. Сможете лучше?`, `<b>Challenge: ${esc(chName(c))}</b> ${chResult(c)}. Same Daily Week ${dayLabel(c.day)}. Can you beat it?`);
  $('chGo').onclick = async () => { await whenReady($('chGo')); startDaily(c.day); };
}
function shareText(kind, team) {
  return kind === 'team'
    ? (team ? L(`Я в нашем офисе «${team.name}» в игре «Выжить до пятницы». Заходи в команду — проверим, кто дольше продержится до пятницы!`, `I’m in our “${team.name}” office in Survive till Friday. Join the team — let’s see who lasts longest till Friday!`)
            : L('Играю в «Выжить до пятницы» — офисный симулятор, где Босс на 100% хуже увольнения. Давай сыграем всем отделом и сравним, кто дольше продержится!', 'Playing Survive till Friday — the office sim where a Boss at 100% is worse than getting fired. Let’s get the whole department in and see who lasts longest!'))
    : L('Затягивает: «Выжить до пятницы» — офисный симулятор в духе Reigns. Держи Кукуху, Энергию, Босса и Коллег в балансе до пятницы, 18:00. Попробуй!', 'Seriously addictive: Survive till Friday — a Reigns-style office sim. Keep your Sanity, Energy, Boss and Team in balance until Friday, 6 PM. Give it a try!');
}
// Награды за то, что поделились: Telegram и VK — один раз, остальное — раз в день (что ссылку правда отправили, проверить нельзя —
// поэтому суммы скромные; за пришедшего по ссылке игрока, которого засчитывает сервер, — больше)
const SHARE_ONCE = 10, SHARE_DAILY = 5, REF_CASH = 15;
function shareReward(via) {
  const once = via === 'tg' || via === 'vk', today = new Date().toISOString().slice(0, 10);
  prefs.shared ||= {};
  let n = 0;
  if (once && !prefs.shared[via]) { prefs.shared[via] = true; n = SHARE_ONCE; }
  else if (prefs.shareDay !== today) { prefs.shareDay = today; n = SHARE_DAILY; }
  if (!n) return;
  const now = addCash(n); sfx.coins?.();
  toast(L(`🎁 Спасибо, что рассказали об игре! +${money(n)}${now ? '' : ' — придут, когда устроитесь на работу'}`, `🎁 Thanks for spreading the word! +${money(n)}${now ? '' : ' — paid once you get a job'}`));
  dropShareBadge(via);
}
function dropShareBadge(via) { const b = document.querySelector(`.share-big [data-via="${via}"] b`); if (b) b.remove(); }
function bindShare(root) { root.querySelectorAll('[data-share]').forEach(b => b.onclick = () => { snoozeViral(7); openShare(b.dataset.share); }); }
async function openShare(kind) {
  track('share', { detail: kind });
  $('viralPop').hidden = true;  // плашка «Вместе веселее» не должна перекрывать окно
  const m = $('modal');
  const { url, team } = await referralLink(kind), text = shareText(kind, team), full = `${text} ${url}`;
  const enc = encodeURIComponent;
  m.innerHTML = `<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="shTitle">
    <h2 id="shTitle">${L('Позвать в игру', 'Invite to the game')}</h2>
    <div class="share-tabs" role="tablist"><button class="tab" role="tab" data-k="team" aria-selected="${kind === 'team'}">${L('Коллег', 'Coworkers')}</button><button class="tab" role="tab" data-k="friends" aria-selected="${kind === 'friends'}">${L('Друзей', 'Friends')}</button></div>
    ${kind === 'team' && !team ? `<p class="field-note">${registered() ? L('Создайте офис в «Мой офис» — тогда ссылка сразу приведёт коллег в вашу команду.', 'Create an office in “My Office” — then the link drops coworkers straight into your team.') : L('Зарегистрируйтесь и создайте офис — тогда ссылка сразу приведёт коллег в вашу команду.', 'Sign up and create an office — then the link drops coworkers straight into your team.')}</p>` : ''}
    <p class="share-text" id="shText">${esc(full)}</p>
    <div class="share-big">
      <a class="btn-main btn-tg" data-via="tg" href="https://t.me/share/url?url=${enc(url)}&text=${enc(text)}" target="_blank" rel="noopener">${L('Отправить в Telegram', 'Send on Telegram')}${prefs.shared?.tg ? '' : ` <b>+${money(SHARE_ONCE)}</b>`}</a>
      <a class="btn-main btn-vk" data-via="vk" href="https://vk.com/share.php?url=${enc(url)}&title=${enc(text)}" target="_blank" rel="noopener">${L('Рассказать в VK', 'Post on VK')}${prefs.shared?.vk ? '' : ` <b>+${money(SHARE_ONCE)}</b>`}</a>
    </div>
    <div class="share-grid">
      ${!TG && navigator.share ? `<button id="shNative" data-via="native">${L('Отправить…', 'Share…')}</button>` : ''}
      <a href="https://wa.me/?text=${enc(full)}" data-via="wa" target="_blank" rel="noopener">WhatsApp</a>
      <a href="mailto:?subject=${enc(L('Выжить до пятницы', 'Survive till Friday'))}&body=${enc(full)}" data-via="mail">${L('Почта', 'Email')}</a>
      <button id="shCopy" data-via="copy">${L('Скопировать ссылку', 'Copy link')}</button>
    </div>
    <p class="share-count" id="shCount"></p>
    <p class="field-note">${L(`Награды: Telegram и VK — по +${money(SHARE_ONCE)} (один раз), любая другая отправка — +${money(SHARE_DAILY)} раз в день. За каждого, кто впервые придёт по вашей ссылке, — ещё +${money(REF_CASH)} и +1 предмет на неделю.`,
      `Rewards: Telegram and VK — +${money(SHARE_ONCE)} each (once), any other share — +${money(SHARE_DAILY)} once a day. Each new player who joins via your link — +${money(REF_CASH)} and +1 item for the week.`)}</p>
    <button class="btn-ghost" id="shClose">${L('Закрыть', 'Close')}</button></div>`;
  m.hidden = false;
  m.querySelectorAll('.share-tabs .tab').forEach(t => t.onclick = () => openShare(t.dataset.k));
  $('shClose').onclick = () => { m.hidden = true; };
  m.onclick = e => { if (e.target === m) m.hidden = true; };
  m.querySelectorAll('[data-via]').forEach(el => el.addEventListener('click', () => { const v = el.dataset.via; if (v === 'native' || TG && (v === 'tg' || v === 'vk')) return; setTimeout(() => shareReward(v), 600); }));
  $('shCopy').onclick = () => copy(full, L('Приглашение скопировано — вставьте его в чат', 'Invite copied — paste it into a chat'));
  if ($('shNative')) $('shNative').onclick = () => navigator.share({ title: L('Выжить до пятницы', 'Survive till Friday'), text, url }).then(() => shareReward('native')).catch(() => {});
  if (TG) m.querySelector('.btn-tg').onclick = e => { e.preventDefault(); TG.openTelegramLink(`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`); setTimeout(() => shareReward('tg'), 600); };
  if (TG) m.querySelector('.btn-vk').onclick = e => { e.preventDefault(); TG.openLink(`https://vk.com/share.php?url=${enc(url)}&title=${enc(text)}`); setTimeout(() => shareReward('vk'), 600); };
  if (board.online) board.rpc('referral_count', { p_id: prefs.playerId }).then(n => { if ($('shCount')) $('shCount').textContent = L(`По вашим ссылкам пришло: ${n || 0}`, `Joined via your links: ${n || 0}`); }).catch(() => {});
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
  try { await board.rpc('claim_referral', { p_id: prefs.playerId, p_ref: prefs.refBy }); prefs.refClaimed = true; store.set(KEY.prefs, prefs); track('invite', { detail: prefs.refBy }); } catch {}
}
// Бонус пригласившему: новые пришедшие → +1 предмет на следующую неделю за каждого
async function checkReferrals() {
  if (!board.online || !prefs.name) return;
  try {
    const n = await board.rpc('referral_count', { p_id: prefs.playerId }) || 0, seen = prefs.refSeen || 0;
    if (n > seen) {
      prefs.bonusItems = (prefs.bonusItems || 0) + (n - seen); prefs.refSeen = n; store.set(KEY.prefs, prefs);
      addCash(REF_CASH * (n - seen)); sfx.coins?.();
      toast(L(`По вашей ссылке ${n - seen === 1 ? 'пришёл новый игрок' : `пришли новые игроки (${n - seen})`}: +${money(REF_CASH * (n - seen))} и ${pl(n - seen, 'предмет', 'предмета', 'предметов', 'item', 'items')} на следующую неделю`, `${n - seen === 1 ? 'A new player' : `New players (${n - seen})`} joined via your link: +${money(REF_CASH * (n - seen))} and ${pl(n - seen, 'предмет', 'предмета', 'предметов', 'item', 'items')} for next week`));
    }
    if (n >= 3) unlock(['recruiter']);
  } catch {}
}
rememberRef();
