// Люди игры: рисованные портреты с мимикой и шестеро постоянных коллег.
// Портрет собирается из архетипа роли (причёска, очки, галстук…), настроение меняет брови, глаза и рот.
// Предметы и чаты получают иконку вместо лица.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → fx → faces → game → ui-menu → app.

// ---------- Постоянные коллеги: отношение от −3 до +3, у каждого своя история ----------
const CAST = {
  fedor:   { name: 'Фёдор',           role: 'сосед по столу',          face: { skin: 2, hair: 'short', hairC: '#6b4a2b', beard: true, shirt: '#3a7bd5' } },
  aleksey: { name: 'Алексей',         role: 'оптимизатор процессов',   face: { skin: 0, hair: 'side', hairC: '#2b2b33', glasses: true, shirt: '#2de2e6' } },
  robert:  { name: 'Роберт',          role: 'душа корпоративов',       face: { skin: 1, hair: 'afro', hairC: '#ff3bd4', shirt: '#d4ff3a', bow: true } },
  galya:   { name: 'Галя',            role: 'знает всё обо всех',      face: { skin: 0, hair: 'long', hairC: '#c0392b', shirt: '#b26bff', earrings: true } },
  oleg:    { name: 'Олег',            role: 'из соседнего отдела',     face: { skin: 3, hair: 'messy', hairC: '#1d1d22', shirt: '#ff8a3b', stubble: true } },
  marina:  { name: 'Марина Петровна', role: 'главный бухгалтер',       face: { skin: 1, hair: 'bun', hairC: '#9a9aa6', glasses: true, shirt: '#ff3b6b', beads: true } },
};
// Имена ищутся целым словом (в любом падеже): «Галю» — да, «навигации» — нет
const word = s => new RegExp(`(?<![а-яё])(?:${s})(?![а-яё])`, 'i');
const CAST_RE = { fedor: word('ф[её]дор(?:а|у|ом|е)?'), aleksey: word('алексе(?:й|я|ю|ем|е)'), robert: word('роберт(?:а|у|ом|е)?'),
  galya: word('гал(?:я|и|е|ю|ей)'), oleg: word('олег(?:а|у|ом|е)?'), marina: word('марин(?:а|ы|е|у|ой) петровн(?:а|ы|е|у|ой)') };
const castOf = text => Object.keys(CAST_RE).find(k => CAST_RE[k].test(text || '')) || null;

// ---------- Архетипы ролей ----------
const SKIN = ['#f3d2b8', '#e7b896', '#c98e66', '#8d5a3b'];
const ROLES = [
  [/генеральн|директор(?! по персоналу)|руководств|совет директоров|делегац/i, { skin: 0, hair: 'bald', hairC: '#9a9aa6', glasses: true, shirt: '#22223a', tie: '#ffd23a', bg: '#3a2a10' }],
  [/босс|начальник|заместител|тимлид|менеджер проекта|скрам|капитан/i,           { skin: 1, hair: 'short', hairC: '#55555f', shirt: '#26263f', tie: '#ff3b6b', bg: '#3a1020' }],
  [/hr|кадр|по персоналу|психолог|тренер|наставник|лектор|рекрут/i,               { skin: 0, hair: 'bob', hairC: '#7a3b1e', shirt: '#ff8be6', scarf: true, bg: '#3a1033' }],
  [/бухгалт|финансист|казнач/i,                                                     { skin: 1, hair: 'bun', hairC: '#4a3a2a', glasses: true, shirt: '#b26bff', bg: '#24103a' }],
  [/клиент|заказчик|партн[её]р|поставщик|подрядчик|закупщик|представител|торговый|инвестор|конкурент/i, { skin: 2, hair: 'side', hairC: '#2b2b33', shirt: '#1f4e8c', tie: '#2de2e6', bg: '#0e2a3a' }],
  [/юрист|проверяющ|инспектор|налогов|аудитор/i,                                   { skin: 0, hair: 'side', hairC: '#3a3a44', glasses: true, shirt: '#2a2a2a', tie: '#9a9aa6', bg: '#1c1c28' }],
  [/офис-менеджер|ассистент|секретар|ресепшен|приёмная|завхоз|комендант/i,          { skin: 1, hair: 'long', hairC: '#e0b04a', shirt: '#2de2e6', headset: true, bg: '#0e3033' }],
  [/сисадмин|айтишник|программист|разработчик|техподдерж/i,                         { skin: 2, hair: 'messy', hairC: '#2b2b33', glasses: true, shirt: '#2b2b40', headset: true, bg: '#10203a' }],
  [/стажёр|стажер|новичок|новенький|джун/i,                                         { skin: 0, hair: 'curly', hairC: '#c98e3a', shirt: '#d4ff3a', lanyard: true, bg: '#26330e' }],
  [/курьер|водитель|доставк|грузчик|логист/i,                                       { skin: 3, hair: 'cap', hairC: '#ff8a3b', shirt: '#ff8a3b', bg: '#3a240e' }],
  [/охран|вахт[её]р|сторож/i,                                                       { skin: 1, hair: 'cap', hairC: '#1d1d22', shirt: '#1d1d22', bg: '#151520' }],
  [/уборщ|клининг|сантехник|электрик|маляр|бригад|монтажник|ремонтн/i,             { skin: 2, hair: 'bandana', hairC: '#2de2e6', shirt: '#2d6e8c', bg: '#0e2630' }],
  [/мама|бабушка|т[её]тя|сестра|соседка/i,                                          { skin: 1, hair: 'long', hairC: '#7a4a2b', shirt: '#ff8be6', bg: '#33102a' }],
  [/брат|друг|друзья|одноклассник|сосед(?! по столу)|детектив|стоматолог|фотограф|режисс[её]р|скульптор|организатор|ведущий|модератор|посетитель/i, { skin: 2, hair: 'short', hairC: '#4a3a2a', shirt: '#3a7bd5', bg: '#102033' }],
  [/коллег|сосед по столу|маркетолог|дизайнер|продажник|отдел|сплетниц|менеджер/i, null],  // обычный коллега: внешность по имени
];
const ICONS = [
  [/чат|мессенджер|сообщени|голосов|личные/i, '💬'], [/почт|рассылк|письм|конверт/i, '✉️'], [/будильник|напоминан/i, '⏰'],
  [/календар|график|расписан/i, '📅'], [/принтер|сканер/i, '🖨️'], [/кофе/i, '☕'], [/кулер|бутылк|водоканал|поставщик воды/i, '🚰'],
  [/кухн|столов|холодильник|микроволн|чайник|суп|посудомо|брокколи|конфет/i, '🍽️'], [/лифт/i, '🛗'], [/кот|кошк/i, '🐈'],
  [/п[её]с|собак|корги/i, '🐕'], [/голуб|ворон|попугай|хомяк/i, '🐦'], [/видеозвон|созвон|вебинар|микрофон|запис|zoom/i, '🎥'],
  [/переговорк|совещан|планёрк|брейншторм|ретро|стендап|встреч|демонстрац|презентац|нетворкинг/i, '👥'],
  [/протокол|регламент|приказ|документ|заявлен|архив|отч[её]т|таблиц|оценк|kpi|уч[её]т|статус|задач|таск|бюджет|политик|папка/i, '📋'],
  [/кондиционер|отоплен|вентиляц|жара|погод|солнц|град|датчик/i, '🌡️'], [/телефон|звон|громкая|колл-центр/i, '📞'],
  [/ноутбук|клавиатур|мышь|облак|обновлен|crm|портал|сайт|нейросет|бот|ссылк|розетк|удлинит|компьютер/i, '💻'],
  [/метро|электрич|маршрутк|пробк|самокат|велосип|навигатор|парковк|шлагбаум|турникет|проходн|автобус|лужа/i, '🚇'],
  [/растени|монстер|тополь|дерев/i, '🪴'], [/кресл|стол|шкаф|ламп|вешалк|жалюзи|ящик|диван|гардероб|зеркал|кровать|плед/i, '🪑'],
  [/спина|шея|глаза|желуд|бессонниц|зевот|тревожн|силы|внутренний голос/i, 'self'],
  [/корпоратив|праздник|хеллоуин|новогод|конкурс|подар|санта|шар|лотере|тотализатор|традици|гимн|квест/i, '🎉'],
  [/сериал|гитар|пазл|каток|абонемент|курсы|массаж|парк|набережн|свидание|галерея/i, '🛋️'], [/банк|деньг|зарплат|премия/i, '💰'],
  [/примет|легенд|суеверие|призрак|тайник|загадочн|капсул|люк|дверь/i, '👻'],
];
const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
// Кто говорит → портрет: коллега из CAST, архетип роли, иконка предмета или «внутренний голос» (аватар игрока)
function portraitFor(who) {
  const cast = castOf(who);
  if (cast) return { kind: 'face', key: 'cast:' + cast, p: { ...CAST[cast].face, bg: '#1a1a2e' } };
  for (const [re, p] of ROLES) if (re.test(who)) {
    if (p) return { kind: 'face', key: who, p };
    const h = hash(who), hairs = ['short', 'side', 'long', 'curly', 'bob', 'messy', 'bun'];
    return { kind: 'face', key: who, p: { skin: h % 4, hair: hairs[h % hairs.length], hairC: ['#2b2b33', '#6b4a2b', '#c98e3a', '#7a3b1e', '#1d1d22'][(h >> 3) % 5],
      shirt: ['#3a7bd5', '#2de2e6', '#b26bff', '#ff8a3b', '#d4ff3a', '#ff8be6'][(h >> 5) % 6], glasses: (h >> 7) % 4 === 0, beard: (h >> 9) % 5 === 0, bg: '#141428' } };
  }
  for (const [re, icon] of ICONS) if (re.test(who)) return icon === 'self' ? { kind: 'self' } : { kind: 'icon', icon };
  return { kind: 'icon', icon: '📌' };
}

// ---------- Рисование ----------
const HAIR = {
  short: c => `<path d="M17 28 q0 -14 15 -14 q15 0 15 14 q-4 -7 -15 -7 q-11 0 -15 7z" fill="${c}"/>`,
  side: c => `<path d="M17 29 q-1 -16 16 -16 q14 0 14 13 l-4 -3 q-8 -5 -19 1 z" fill="${c}"/>`,
  long: c => `<path d="M15 46 q-3 -33 17 -33 q20 0 17 33 l-5 0 q2 -14 -2 -21 q-10 4 -21 0 q-4 7 -1 21z" fill="${c}"/>`,
  bob: c => `<path d="M16 40 q-3 -27 16 -27 q19 0 16 27 l-4 0 q1 -12 -3 -17 q-9 3 -18 0 q-4 5 -3 17z" fill="${c}"/>`,
  bun: c => `<circle cx="32" cy="11" r="6" fill="${c}"/><path d="M17 28 q0 -15 15 -15 q15 0 15 15 q-6 -8 -15 -8 q-9 0 -15 8z" fill="${c}"/>`,
  curly: c => `<g fill="${c}">${[[19, 22], [24, 16], [32, 14], [40, 16], [45, 22], [21, 28], [43, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g>`,
  messy: c => `<path d="M17 28 l2 -9 l4 4 l3 -9 l4 6 l4 -7 l3 7 l5 -5 l1 9 l3 4 q-6 -6 -15 -6 q-9 0 -14 6z" fill="${c}"/>`,
  afro: c => `<circle cx="32" cy="22" r="17" fill="${c}"/>`,
  bald: c => `<path d="M17 30 q0 -4 3 -6 M47 30 q0 -4 -3 -6" stroke="${c}" stroke-width="3" fill="none"/>`,
  cap: c => `<path d="M17 25 q0 -12 15 -12 q15 0 15 12z" fill="${c}"/><path d="M30 24 h22 q-1 4 -6 4 h-16z" fill="${c}"/>`,
  bandana: c => `<path d="M17 25 q0 -12 15 -12 q15 0 15 12z" fill="${c}"/><circle cx="18" cy="25" r="3" fill="${c}"/>`,
};
const EXPR = {
  neutral: { brows: 'M21 24 h8 M35 24 h8', eyes: 'dots', mouth: '<path d="M27 43 h10" class="ln"/>' },
  happy:   { brows: 'M21 24 q4 -3 8 0 M35 24 q4 -3 8 0', eyes: 'dots', mouth: '<path d="M26 41 q6 6 12 0" class="ln"/>' },
  joy:     { brows: 'M21 22 q4 -3 8 0 M35 22 q4 -3 8 0', eyes: 'arcs', mouth: '<path d="M25 40 q7 9 14 0z" class="fl"/>' },
  angry:   { brows: 'M21 22 l8 4 M43 22 l-8 4', eyes: 'dots', mouth: '<path d="M26 45 q6 -5 12 0" class="ln"/>' },
  sad:     { brows: 'M21 26 l8 -3 M43 26 l-8 -3', eyes: 'dots', mouth: '<path d="M27 45 q5 -4 10 0" class="ln"/>' },
  shock:   { brows: 'M21 20 q4 -3 8 0 M35 20 q4 -3 8 0', eyes: 'big', mouth: '<ellipse cx="32" cy="44" rx="3.5" ry="4.5" class="fl"/>' },
};
const eyes = t => t === 'arcs' ? '<path d="M22 31 q3 -4 6 0 M36 31 q3 -4 6 0" class="ln"/>'
  : `<g class="eyes"><circle cx="25" cy="31" r="${t === 'big' ? 3.4 : 2.3}"/><circle cx="39" cy="31" r="${t === 'big' ? 3.4 : 2.3}"/></g>`;
function exprSvg(mood) { const e = EXPR[mood] || EXPR.neutral; return `<path d="${e.brows}" class="brow"/>${eyes(e.eyes)}${e.mouth}`; }
function faceSvg(p, mood = 'neutral') {
  const skin = SKIN[p.skin || 0], hair = HAIR[p.hair] || HAIR.short;
  const back = p.hair === 'long' || p.hair === 'bob' || p.hair === 'afro' ? hair(p.hairC) : '';
  return `<svg viewBox="0 0 64 64" class="face-svg" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="${p.bg || '#141428'}"/>${back}
    <path d="M8 64 q2 -14 24 -14 q22 0 24 14z" fill="${p.shirt}"/>
    ${p.tie ? `<path d="M30 51 h4 l2 10 l-4 3 l-4 -3z" fill="${p.tie}"/>` : ''}${p.bow ? '<path d="M26 52 l6 3 l6 -3 v6 l-6 -3 l-6 3z" fill="#ff3bd4"/>' : ''}
    ${p.scarf ? '<path d="M22 52 q10 6 20 0 l-2 5 q-8 4 -16 0z" fill="#ffd23a"/>' : ''}${p.lanyard ? '<path d="M25 51 l7 9 l7 -9" stroke="#2de2e6" stroke-width="2" fill="none"/><rect x="29" y="58" width="6" height="5" fill="#fff"/>' : ''}
    ${p.beads ? '<path d="M24 53 q8 5 16 0" stroke="#fff" stroke-width="2.4" stroke-dasharray="0.1 3.2" stroke-linecap="round" fill="none"/>' : ''}
    <rect x="28" y="44" width="8" height="8" fill="${skin}"/>
    <ellipse cx="32" cy="32" rx="14" ry="16" fill="${skin}"/>
    ${p.beard ? `<path d="M19 36 q1 13 13 13 q12 0 13 -13 q-3 6 -13 6 q-10 0 -13 -6z" fill="${p.hairC}"/>` : ''}
    ${p.stubble ? '<path d="M21 40 q11 10 22 0" stroke="rgba(0,0,0,.25)" stroke-width="5" fill="none"/>' : ''}
    ${back ? '' : hair(p.hairC)}${p.hair === 'long' || p.hair === 'bob' ? `<path d="M18 26 q4 -10 14 -10 q10 0 14 10 q-6 -4 -14 -4 q-8 0 -14 4z" fill="${p.hairC}"/>` : ''}
    ${p.earrings ? '<circle cx="18" cy="38" r="2" fill="#ffd23a"/><circle cx="46" cy="38" r="2" fill="#ffd23a"/>' : ''}
    <g class="expr">${exprSvg('neutral')}</g>
    ${p.glasses ? '<g class="glasses"><circle cx="25" cy="31" r="5.5"/><circle cx="39" cy="31" r="5.5"/><path d="M30.5 31 h3"/></g>' : ''}
    ${p.headset ? '<path d="M17 32 q0 -19 15 -19 q15 0 15 19" stroke="#1d1d22" stroke-width="2.5" fill="none"/><rect x="14" y="29" width="5" height="8" rx="2" fill="#1d1d22"/><path d="M16 37 q2 7 10 7" stroke="#1d1d22" stroke-width="2" fill="none"/>' : ''}
  </svg>`;
}
// Портрет в HTML: лицо (с мимикой), иконка или аватар игрока
function portraitHtml(who, cls = '') {
  const pt = portraitFor(who);
  if (pt.kind === 'face') return `<span class="face ${cls}" data-face="${esc(pt.key)}">${faceSvg(pt.p)}</span>`;
  if (pt.kind === 'self') return `<span class="face icon self ${cls}" aria-hidden="true">${esc(prefs.avatar || '😎')}</span>`;
  return `<span class="face icon ${cls}" aria-hidden="true">${pt.icon}</span>`;
}
// Сменить настроение лица (с короткой «пружинкой»)
function setMood(el, mood) {
  const g = el?.querySelector('.expr');
  if (!g || el.dataset.mood === mood) return;
  el.dataset.mood = mood; g.innerHTML = exprSvg(mood);
  if (!FX.off) FX.pulse(el, 'emote', 400);
}
// Настроение по эффекту ответа: сильный плюс — восторг, минус — злость (начальство, клиенты) или грусть (свои)
function moodFor(v, angryKind) {
  if (v >= 20) return 'joy';
  if (v > 0) return 'happy';
  if (v <= -20) return 'shock';
  if (v < 0) return angryKind ? 'angry' : 'sad';
  return 'neutral';
}
