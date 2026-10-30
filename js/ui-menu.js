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
  $('meAva').textContent = prefs.avatar; $('meName').textContent = prefs.name; $('meDept').textContent = prefs.dept || 'без отдела';
  myTag.then(t => { $('meId').textContent = `ID ${shortId(t)} · ${registered() ? prefs.email : prefs.email ? 'войдите снова' : 'гость'}`; });
  $('meRegister').hidden = registered() || !board.online; $('meRegister').textContent = prefs.email ? 'Войти' : 'Регистрация';
  renderOfficeLine();
  renderChallengeCta();
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
  if (dataLoaded && save && !save.deck?.every(x => byId[x.id])) store.del(KEY.save); // сохранение от старой колоды
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
      <div class="cc-trait">${PROF[Cm.prof].name} · ${TRAITS[Cm.trait || 'workaholic'].name}</div>
      <div class="money" style="grid-column:1/-1"><div><b>${Cm.bank || 0} у.е.</b><span>на счёте · оклад ${Cm.salary || 3}/день</span></div><div><b>${fmtDays(Cm.vacation || 0)} дн.</b><span>отпуска из ${VAC_YEAR}</span></div></div>
      ${!careerSave && Cm.stage === 'work' && (Cm.vacation || 0) >= 7 && Cm.week <= YEAR ? '<button class="btn-ghost btn-vac" id="menuVac" style="grid-column:1/-1">Уйти в отпуск на неделю (7 дн.)</button>' : ''}`;
    if ($('menuVac')) $('menuVac').onclick = () => { C = store.get(KEY.career, null); takeVacation(); };
    $('start').innerHTML = `Играть<small>${careerSave ? 'продолжить неделю' : Cm.stage === 'search' ? 'поиск работы' : `неделя ${Cm.week} из ${YEAR}`}</small>`;
  } else $('start').innerHTML = 'Играть<small>начать карьеру</small>';
  const daily = store.get(KEY.daily, {})[today()];
  const sk = streakNow();
  $('startDaily').innerHTML = `Неделя дня<small>${daily ? `${daily.won ? 'пройдена' : 'завалена'} · ещё раз` : sk ? `серия ${sk} дн. · не прервите` : `${dayLabel(today())} · одна на всех`}</small>`; $('streakLine').textContent = sk ? `Серия: ${sk} дн. подряд${daily ? '' : ' — сыграйте сегодня, чтобы не прервать'}` : 'Играйте каждый день — растёт серия и бонус в карьеру';
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
    const t = myTeamCache && (await board.rpc('my_tournament', { p_id: prefs.playerId }).catch(() => []))[0];
    const fresh = t && Date.now() - new Date(t.starts_at) < 12 * 3600e3 && !store.get('vdp-tours', {})[t.tour_id];
    $('tourCta').hidden = !fresh;
    if (fresh) { $('tourCta').querySelector('span').innerHTML = `<b>Турнир офиса «${esc(t.team_name)}»</b> ${new Date(t.starts_at) <= Date.now() ? 'уже идёт — сыграйте свою неделю' : `старт ${until(t.starts_at)}`}`;
      $('tourCtaGo').onclick = () => showOffice(); }
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
$('start').onclick = async () => { await whenReady($('start')); continueCareer(); };
// Вкладки меню: «Офис» (команда, чат, рейтинг) и «Профиль» (серия, коллекция, установка)
function menuTab(name) {
  prefs.menuTab = name; store.set(KEY.prefs, prefs);
  for (const [t, p] of [['tabOffice', 'paneOffice'], ['tabProfile', 'paneProfile']]) {
    const on = t === (name === 'profile' ? 'tabProfile' : 'tabOffice');
    $(t).setAttribute('aria-selected', on); $(p).hidden = !on;
  }
}
$('tabOffice').onclick = () => menuTab('office');
$('tabProfile').onclick = () => menuTab('profile');
menuTab(prefs.menuTab || 'office');
$('startDaily').onclick = async () => { await whenReady($('startDaily')); startDaily(); };
$('startPack').onclick = async () => { await whenReady($('startPack')); startPack(); };
// «Начать заново» срабатывает со второго нажатия: окна подтверждения в браузере тут нет
$('newCareer').onclick = () => {
  const b = $('newCareer');
  if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Весь прогресс года сотрётся. Нажмите ещё раз'; return; }
  store.del(KEY.career); store.del(KEY.save); newCareer();
};

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
      if (!rows.length) { list.innerHTML = `<div class="lb-empty"><span class="big">Пусто</span>${boardMode === 'daily' ? 'Сегодня неделю дня ещё никто не сыграл. Станьте первыми!' : 'Пока никто не доиграл неделю. Станьте первыми!'}</div>`; return; }
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
    <span class="kicker">Мой офис · ${plural(members.length, 'участник', 'участника', 'участников')}</span>
    <h1>${esc(team.name)}</h1>
    <div class="office-code"><span class="kicker">Код офиса</span><b>${team.code}</b><small>${esc(inviteLink(team.code))}</small>
      <button class="btn-ghost" id="cpLink">Скопировать ссылку-приглашение</button></div>
    <form class="inline-form" id="invForm"><input id="invId" maxlength="6" placeholder="ID игрока, например 3FA9C1" aria-label="ID игрока" autocapitalize="characters"><button class="btn-main" type="submit">Позвать</button></form>
    <p class="join-err" id="ofErr" role="alert"></p>
    <div class="members panel board-list">${members.map(m => `<div class="lb-row person${m.is_me ? ' me' : ''}">
      <span class="lb-ava" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
      <span class="lb-who"><b>${esc(m.name)}${m.is_me ? ' (вы)' : ''}${m.is_owner ? ' · создатель' : ''}</b><small>${esc(m.dept || 'без отдела')} · ID ${m.short_id}</small></span>
      <span class="lb-res">${personStatus(m)}</span></div>`).join('')}</div>
    <div class="tour-box" id="tourBox"><span class="kicker">Турнир офиса</span><p class="field-note">Загружаю…</p></div>
    <div class="stack"><button class="btn-main" id="toChat">Чат офиса</button><button class="btn-ghost" id="leave">Покинуть офис</button><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
  $('toMenu').onclick = renderMenu; $('toChat').onclick = () => showChat('team');
  renderTourBox(team);
  $('cpLink').onclick = () => copy(`Заходи в наш офис «${team.name}» в игре «Выжить до пятницы»: ${inviteLink(team.code)}`, 'Ссылка скопирована — отправьте её в рабочий чат');
  $('invForm').onsubmit = async e => { e.preventDefault();
    try { const n = await board.rpc('invite_player', { p_id: prefs.playerId, p_short: $('invId').value }); $('invId').value = ''; $('ofErr').textContent = ''; toast(`Приглашение отправлено: ${n}`); }
    catch (err) { $('ofErr').textContent = err.message; } };
  $('leave').onclick = async () => { const b = $('leave');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Точно покинуть офис? Нажмите ещё раз'; return; }
    await board.rpc('leave_team', { p_id: prefs.playerId }).catch(err => toast(err.message)); showOffice(); };
}

// ---------- статистика игры: ?stats ----------
async function showStats() {
  views.end.classList.add('screen-view'); show('end'); setPhase('evening');
  views.end.innerHTML = '<div class="screen"><div class="scr-head"><h1>Статистика</h1><p class="scr-when">Загружаю…</p></div></div>';
  try {
    const get = v => fetch(`${window.SUPABASE_CONFIG.url.replace(/\/+$/, '')}/rest/v1/${v}?select=*`, { headers: { apikey: window.SUPABASE_CONFIG.anonKey } }).then(r => r.ok ? r.json() : Promise.reject(new Error(`Supabase ответил ${r.status} на ${v}`)));
    const [[o], killers, [f], modes] = await Promise.all(['stats_overview', 'stats_killers', 'stats_funnel', 'stats_modes'].map(get));
    const [sources, shares] = await Promise.all(['stats_sources', 'stats_shares'].map(v => get(v).catch(() => [])));  // нет в старой схеме — пропускаем
    const SHARE = { meme: 'мем-карточка', challenge: 'вызов на неделю дня', team: 'позвать коллег', friends: 'позвать друзей' };
    const box = (v, l) => `<div class="stat-box"><b>${v ?? 0}</b><span>${l}</span></div>`;
    const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
    views.end.innerHTML = `<div class="screen stats">
      <div class="scr-head"><span class="kicker">Только сводные цифры, без личных данных</span><h1>Статистика игры</h1></div>
      <div class="stats-grid">${box(o.players, 'игроков всего')}${box(o.active_day, 'за сутки')}${box(o.active_week, 'за неделю')}${box(o.weeks, 'недель сыграно')}
        ${box((o.win_rate ?? 0) + '%', 'недель закрыто')}${box((o.quiz_rate ?? 0) + '%', 'верных на втором шансе')}${box(o.shares, 'приглашений открыто')}${box(o.installs, 'установок на телефон')}</div>
      <h2>Воронка</h2>
      <div class="stats-grid">${box(f.opened, 'зашли в игру')}${box(`${f.week1} · ${pct(f.week1, f.opened)}`, 'доиграли 1 неделю')}${box(`${f.week3} · ${pct(f.week3, f.opened)}`, '3 недели')}${box(`${f.week10} · ${pct(f.week10, f.opened)}`, '10 недель')}${box(f.year, 'весь год')}</div>
      <h2>По режимам</h2>
      <div class="scr-list">${modes.map(m => `<div class="scr-row"><span class="scr-pos">${m.weeks}</span><span></span><span class="scr-name"><b>${({ career: 'Карьера', daily: 'Неделя дня', tour: 'Турнир', pack: 'Брендированная' })[m.mode] || m.mode}</b><small>в среднем ходов за неделю: ${m.avg_step} из 15</small></span><span class="scr-res won">${m.win_rate}%</span></div>`).join('') || '<p class="scr-empty">Пока нет данных</p>'}</div>
      <h2>Откуда пришли (30 дней)</h2>
      <div class="scr-list">${sources.map(s => `<div class="scr-row"><span class="scr-pos">${s.players}</span><span></span><span class="scr-name"><b>${esc(s.source)}</b><small>доиграли неделю: ${s.played} · ${pct(s.played, s.players)}</small></span><span class="scr-res won">${pct(s.players, sources.reduce((a, x) => a + x.players, 0))}</span></div>`).join('') || '<p class="scr-empty">Пока нет данных</p>'}</div>
      <h2>Чем делятся</h2>
      <div class="scr-list">${shares.map(s => `<div class="scr-row"><span class="scr-pos">${s.shares}</span><span></span><span class="scr-name"><b>${esc(SHARE[s.kind] || s.kind)}</b></span><span></span></div>`).join('') || '<p class="scr-empty">Пока нет данных</p>'}</div>
      <h2>Карточки, на которых чаще всего увольняют</h2>
      <div class="scr-list">${killers.map((k, i) => `<div class="scr-row"><span class="scr-pos">${i + 1}</span><span></span><span class="scr-name"><b>${esc(byId[k.card_id]?.text?.slice(0, 90) || k.card_id)}</b><small>${esc(k.card_id)}</small></span><span class="scr-res lost">${k.losses}</span></div>`).join('') || '<p class="scr-empty">Пока нет данных</p>'}</div>
      <button class="btn-ghost scr-exit" id="stBack">Закрыть</button></div>`;
  } catch (err) { views.end.innerHTML = `<div class="end-sheet glass"><h1>Нет данных</h1><p>${esc(err.message)}. Выполните свежий supabase/schema.sql.</p><div class="stack"><button class="btn-ghost" id="stBack">Закрыть</button></div></div>`; }
  $('stBack').onclick = () => { views.end.classList.remove('screen-view'); history.replaceState(null, '', location.pathname); prefs.name ? renderMenu() : renderWelcome(); };
}

// ---------- турнир офиса ----------
// Создатель офиса назначает старт; все играют одну неделю (по общему seed), в зачёт — первая попытка
const fmtTime = iso => new Date(iso).toLocaleString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const until = iso => { const m = Math.round((new Date(iso) - Date.now()) / 60000); return m <= 0 ? 'уже идёт' : m < 60 ? `через ${m} мин` : m < 1440 ? `через ${Math.floor(m / 60)} ч ${m % 60} мин` : `через ${Math.floor(m / 1440)} дн.`; };
let tourTimer = null;
async function renderTourBox(team) {
  const box = $('tourBox'); if (!box) return;
  const t = (await board.rpc('my_tournament', { p_id: prefs.playerId }).catch(() => []))[0] || null;
  const played = t && store.get('vdp-tours', {})[t.tour_id];
  const started = t && new Date(t.starts_at) <= Date.now();
  const pad = n => String(n).padStart(2, '0'), soon = new Date(Date.now() + 3600e3);
  const def = `${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:00`;
  box.innerHTML = `<span class="kicker">Турнир офиса</span>
    ${t ? `<p class="tour-when"><b>${started ? 'Турнир идёт' : `Старт ${until(t.starts_at)}`}</b><span>${fmtTime(t.starts_at)}</span></p>` : '<p class="field-note">Одна и та же неделя для всего офиса, общий старт и таблица итогов на большом экране.</p>'}
    ${t && started ? `<button class="btn-main" id="tourPlay">${played ? 'Сыграть ещё раз (не в зачёт)' : 'Играть турнир'}</button>` : ''}
    ${t ? `<button class="btn-ghost" id="tourScreen">Экран итогов для проектора</button>` : ''}
    ${team.is_owner ? `<form class="inline-form" id="tourForm"><input id="tourAt" type="datetime-local" value="${def}" aria-label="Время старта турнира"><button class="btn-ghost" type="submit">${t ? 'Новый турнир' : 'Назначить'}</button></form>` : t ? '' : '<p class="field-note">Назначить турнир может создатель офиса.</p>'}
    <p class="join-err" id="tourErr" role="alert"></p>`;
  if ($('tourPlay')) $('tourPlay').onclick = async () => { await whenReady($('tourPlay')); startTournament(t, !played); };
  if ($('tourScreen')) $('tourScreen').onclick = () => openScreen(t.code);
  if ($('tourForm')) $('tourForm').onsubmit = async e => { e.preventDefault();
    try { await board.rpc('set_tournament', { p_id: prefs.playerId, p_starts: new Date($('tourAt').value).toISOString() }); toast('Турнир назначен — коллеги увидят его в «Мой офис» и в меню'); renderTourBox(team); }
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
    catch (err) { views.end.innerHTML = `<div class="end-sheet glass"><h1>Нет данных</h1><p>${esc(err.message)}</p><div class="stack"><button class="btn-ghost" id="scrBack">Назад</button></div></div>`; $('scrBack').onclick = closeScreen; return; }
    const head = rows[0], players = rows.filter(r => r.name);
    views.end.innerHTML = `<div class="screen">
      <div class="scr-head"><span class="kicker">Турнир офиса · обновляется каждые 10 секунд</span>
        <h1>${head ? esc(head.team_name) : 'Турнир не найден'}</h1>
        ${head ? `<p class="scr-when">${new Date(head.starts_at) > Date.now() ? `Старт ${until(head.starts_at)} · ${fmtTime(head.starts_at)}` : `Идёт с ${fmtTime(head.starts_at)} · сыграли: ${players.length}`}</p>` : ''}</div>
      <div class="scr-list">${players.length ? players.map((r, i) => `<div class="scr-row${i < 3 ? ' top' : ''}">
        <span class="scr-pos">${i + 1}</span><span class="scr-ava" aria-hidden="true">${esc(r.avatar || '🙂')}</span>
        <span class="scr-name"><b>${esc(r.name)}</b><small>${esc(r.dept || '')}</small></span>
        <span class="scr-res ${r.won ? 'won' : 'lost'}">${r.won ? `${r.total}/400` : `${stepName(r.step)} · ${r.death ? resName(r.death) : ''} ${r.overheat ? '100' : '0'}%`}</span></div>`).join('')
        : '<p class="scr-empty">Пока никто не сыграл. Ждём первых результатов!</p>'}</div>
      <button class="btn-ghost scr-exit" id="scrBack">Закрыть экран</button></div>`;
    $('scrBack').onclick = closeScreen;
  };
  const closeScreen = () => { clearInterval(screenTimer); views.end.classList.remove('screen-view'); history.replaceState(null, '', location.pathname); prefs.name ? renderMenu() : renderWelcome(); };
  load(); screenTimer = setInterval(load, 10000);
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
        list.innerHTML = team ? `<div class="lb-empty"><span class="big">Тишина</span>В чате офиса «${esc(team.name)}» пока пусто. Напишите первыми!</div>`
          : '<div class="lb-empty"><span class="big">Нет офиса</span>Чат офиса появится, когда вы создадите офис или вступите в него. А пока есть общий чат.</div>';
        return;
      }
      list.innerHTML = rows.length ? rows.map(m => `<div class="msg${m.mine ? ' mine' : ''}"><span class="ava-s" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
        <span class="meta">${m.mine ? '' : `<b>${esc(m.name)}</b> · `}${new Date(m.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}${m.dept && !m.mine ? ` · ${esc(m.dept)}` : ''}</span>
        <span class="bubble">${esc(m.msg)}</span>
        <span class="msg-act">${m.can_hide ? `<button data-hide="${m.msg_id}">Скрыть</button>` : ''}${m.mine ? '' : `<button data-report="${m.msg_id}">Пожаловаться</button>`}</span></div>`).join('') : '<div class="lb-empty"><span class="big">Тишина</span>Сообщений пока нет. Напишите первыми!</div>';
      list.querySelectorAll('[data-hide]').forEach(b => b.onclick = async () => {
        try { await board.rpc('hide_message', { p_id: prefs.playerId, p_msg: +b.dataset.hide }); toast('Сообщение скрыто'); chatLast = ''; load(); } catch (err) { toast(err.message); } });
      list.querySelectorAll('[data-report]').forEach(b => b.onclick = async () => {
        try { await board.rpc('report_message', { p_id: prefs.playerId, p_msg: +b.dataset.report }); b.textContent = 'Жалоба отправлена'; b.disabled = true; toast('Спасибо. После трёх жалоб сообщение скроется'); chatLast = ''; }
        catch (err) { toast(err.message); } });
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
  el.querySelector('span').innerHTML = `<b>Вызов: ${esc(chName(c))}</b> ${chResult(c)}. Неделя дня ${dayLabel(c.day)} — та же самая. Сможете лучше?`;
  $('chGo').onclick = async () => { await whenReady($('chGo')); startDaily(c.day); };
}
function shareText(kind, team) {
  return kind === 'team'
    ? (team ? `Я в нашем офисе «${team.name}» в игре «Выжить до пятницы». Заходи в команду — проверим, кто дольше продержится до пятницы!`
            : 'Играю в «Выжить до пятницы» — офисный симулятор, где Босс на 100% хуже увольнения. Давай сыграем всем отделом и сравним, кто дольше продержится!')
    : 'Затягивает: «Выжить до пятницы» — офисный симулятор в духе Reigns. Держи Кукуху, Энергию, Босса и Коллег в балансе до пятницы, 18:00. Попробуй!';
}
function bindShare(root) { root.querySelectorAll('[data-share]').forEach(b => b.onclick = () => { snoozeViral(7); openShare(b.dataset.share); }); }
async function openShare(kind) {
  track('share', { detail: kind });
  const m = $('modal');
  const { url, team } = await referralLink(kind), text = shareText(kind, team), full = `${text} ${url}`;
  const enc = encodeURIComponent;
  m.innerHTML = `<div class="modal-box glass share-box" role="dialog" aria-modal="true" aria-labelledby="shTitle">
    <h2 id="shTitle">Позвать в игру</h2>
    <div class="share-tabs" role="tablist"><button class="tab" role="tab" data-k="team" aria-selected="${kind === 'team'}">Коллег</button><button class="tab" role="tab" data-k="friends" aria-selected="${kind === 'friends'}">Друзей</button></div>
    ${kind === 'team' && !team ? `<p class="field-note">${registered() ? 'Создайте офис в «Мой офис» — тогда ссылка сразу приведёт коллег в вашу команду.' : 'Зарегистрируйтесь и создайте офис — тогда ссылка сразу приведёт коллег в вашу команду.'}</p>` : ''}
    <p class="share-text" id="shText">${esc(full)}</p>
    <div class="share-grid">
      ${TG ? '<button id="shTg">Отправить в чат Telegram</button>' : navigator.share ? '<button id="shNative">Отправить…</button>' : ''}
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
  if ($('shTg')) $('shTg').onclick = () => TG.openTelegramLink(`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`);
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
  try { await board.rpc('claim_referral', { p_id: prefs.playerId, p_ref: prefs.refBy }); prefs.refClaimed = true; store.set(KEY.prefs, prefs); track('invite', { detail: prefs.refBy }); } catch {}
}
// Бонус пригласившему: новые пришедшие → +1 предмет на следующую неделю за каждого
async function checkReferrals() {
  if (!board.online || !prefs.name) return;
  try {
    const n = await board.rpc('referral_count', { p_id: prefs.playerId }) || 0, seen = prefs.refSeen || 0;
    if (n > seen) {
      prefs.bonusItems = (prefs.bonusItems || 0) + (n - seen); prefs.refSeen = n; store.set(KEY.prefs, prefs);
      toast(`По вашей ссылке ${n - seen === 1 ? 'пришёл новый игрок' : `пришли новые игроки (${n - seen})`}. Бонус на следующую неделю: ${plural(n - seen, 'предмет', 'предмета', 'предметов')}`);
    }
    if (n >= 3) unlock(['recruiter']);
  } catch {}
}
rememberRef();
