// Офисные персонажи «в сети»: оживляют ленту «сейчас в игре», когда живых игроков мало.
// Честно помечены «персонаж игры»: отвечают в переписке заготовками и по-своему реагируют на приглашение в офис.
// Подключается после ui-menu.js и до app.js. Переписка с ними хранится только в этом браузере.
const NPCS = [
  { id: 'NPC-VIKA',  avatar: '💅', prof: 'marketer',   name: L('Вика', 'Vicky'),   dept: L('Маркетинг', 'Marketing'),
    say: L(['Привет! Я как раз между двумя созвонами 😅', 'Видели новый мем в общем чате? Это я сделала', 'Если что — я за кофе в 11:30', 'Босс опять спросил «есть минутка?». Минутка была час назад', 'У меня дедлайн, но я всегда рада болтовне'],
           ['Hi! I’m squeezed between two calls 😅', 'Saw the new meme in the team chat? That was me', 'FYI — coffee run at 11:30', 'The boss asked “got a minute?” again. That minute was an hour ago', 'I’m on a deadline, but always up for a chat']),
    invite: L('Ой, я в трёх офисах сразу. Но спасибо, что позвали! 💌', 'Aw, I’m already in three offices. But thanks for asking! 💌') },
  { id: 'NPC-ARTEM', avatar: '🧑‍💻', prof: 'dev',       name: L('Артём', 'Artie'),  dept: L('Разработка', 'Engineering'),
    say: L(['На проде всё горит, но я в порядке 🔥', 'Напишу позже, у меня код ревью', 'У меня работает. Значит, проблема на вашей стороне', 'Сегодня я задеплоил в пятницу. Пожелайте удачи', 'Кофе — это просто код, который превращается в баги'],
           ['Prod’s on fire, but I’m fine 🔥', 'Talk later, I’m in a code review', 'Works on my machine. So it’s on your end', 'I deployed on a Friday today. Wish me luck', 'Coffee is just code that turns into bugs']),
    invite: L('Я бы пошёл, но у меня в офисе стоит мой стул. Я к нему привык', 'I’d come, but my chair is in my office. We’re attached') },
  { id: 'NPC-NINA',  avatar: '👩‍💼', prof: 'hr',        name: L('Нина', 'Nina'),    dept: L('HR', 'HR'),
    say: L(['Здравствуйте! Как ваше настроение по шкале от 1 до 10?', 'Не забудьте заполнить опрос вовлечённости 😊', 'У нас пятничный тимбилдинг, приходите!', 'Я записала ваш отзыв. Очень ценно!', 'Помните: у нас открытая культура обратной связи'],
           ['Hi! How’s your mood on a scale of 1 to 10?', 'Don’t forget the engagement survey 😊', 'Friday team building — you’re invited!', 'I’ve noted your feedback. Super valuable!', 'Remember: we have an open feedback culture']),
    invite: L('Обожаю новые команды! Но по регламенту HR не может состоять в офисах. Удачи вам! 🌷', 'I love new teams! But HR policy says I can’t join offices. Good luck! 🌷') },
  { id: 'NPC-GOSHA', avatar: '🚰', prof: 'cooler',     name: L('Гоша', 'Gus'),     dept: L('Кулер', 'Water Cooler'),
    say: L(['Вода есть. Стаканчиков нет. Держитесь', 'Сменил бутыль — чувствую себя героем', 'У кулера все новости раньше, чем в чате', 'Кто опять поставил пустую бутыль обратно?!', 'Заходите на водопой, у меня свежие сплетни'],
           ['There’s water. No cups. Stay strong', 'Changed the jug — feeling heroic', 'The cooler gets the news before the chat does', 'Who put the empty jug back AGAIN?!', 'Drop by the watering hole — fresh gossip inside']),
    invite: L('Я не могу уйти от кулера. Кулер не может уйти от меня', 'I can’t leave the cooler. The cooler can’t leave me') },
  { id: 'NPC-LEVA',  avatar: '📈', prof: 'sales',      name: L('Лёва', 'Leo'),     dept: L('Продажи', 'Sales'),
    say: L(['Закрыл сделку, пока вы читали это сообщение', 'Давайте созвонимся на 5 минут? Шучу, на 45', 'Клиент сказал «подумаем». Значит, нет', 'Мой KPI смотрит на меня с укором', 'Есть минутка? Хочу продать вам идею'],
           ['Closed a deal while you were reading this', 'Quick 5-minute call? Kidding, 45', 'The client said “we’ll think about it.” That means no', 'My KPI is giving me a disappointed look', 'Got a minute? I want to sell you an idea']),
    invite: L('Только если у вас в офисе есть план продаж. Нет? Тогда до связи! 🤝', 'Only if your office has a sales target. No? Let’s circle back! 🤝') },
  { id: 'NPC-SONYA', avatar: '🎨', prof: 'designer',   name: L('Соня', 'Sonya'),   dept: L('Дизайн', 'Design'),
    say: L(['Мне сказали «сделай красиво». Делаю красиво уже третий день', 'Логотип можно сделать побольше. Нельзя', 'Если вы не любите Comic Sans, мы подружимся', 'Пришла правка «ещё чуть-чуть синее»', 'Нарисовала вам котика. Просто так 🐱'],
           ['They said “make it pretty.” Day three of making it pretty', 'Can we make the logo bigger? No', 'If you hate Comic Sans, we’ll get along', 'New feedback: “a bit more blue”', 'Drew you a cat. Just because 🐱']),
    invite: L('Покажите, какого цвета ваш офис, и я подумаю 🎨', 'Show me your office’s color palette and I’ll think about it 🎨') },
  { id: 'NPC-STAS',  avatar: '🎒', prof: 'intern',     name: L('Стас', 'Stan'),    dept: L('Стажёры', 'Interns'),
    say: L(['Меня снова продлили на стажировке 🙃', 'Можно я просто посижу рядом и поучусь?', 'Подскажите, где у нас принтер? Я ищу его с понедельника', 'Сделал отчёт! Правда, не тот', 'Сегодня мне доверили ключ от переговорки'],
           ['My internship got extended. Again 🙃', 'Can I just sit nearby and learn?', 'Where’s the printer? I’ve been looking since Monday', 'Finished the report! Wrong one, though', 'They trusted me with the meeting room key today']),
    invite: L('Правда можно? Я спрошу у наставника и вернусь… через квартал', 'Really? I’ll ask my mentor and get back to you… next quarter') },
  { id: 'NPC-ZINA',  avatar: '🧾', prof: 'accountant', name: L('Зинаида', 'Zelda'), dept: L('Бухгалтерия', 'Accounting'),
    say: L(['Где ваш авансовый отчёт?', 'Чек от такси без подписи — не чек', 'Квартал закрываем, не отвлекайте. Но вам отвечу', 'Ручку верните, пожалуйста. Да, ту самую', 'Всё сходится до копейки. Я счастлива'],
           ['Where’s your expense report?', 'A cab receipt without a signature isn’t a receipt', 'Closing the quarter, don’t distract me. But I’ll answer you', 'Please return my pen. Yes, that one', 'Everything balances to the cent. I’m happy']),
    invite: L('Пришлите приглашение в трёх экземплярах с печатью', 'Please send the invitation in triplicate, stamped') },
];
// Кто «в сети» сейчас: 3–5 персонажей, состав меняется каждые 10 минут
function npcOnline() {
  const slot = Math.floor(Date.now() / 600000), rnd = seeded('npc-' + slot), n = 3 + Math.floor(rnd() * 3);
  return shuffle([...NPCS], rnd).slice(0, n).map(c => {
    const playing = rnd() < 0.6;
    return { npc: true, tag: c.id, short_id: c.id, name: c.name, avatar: c.avatar, dept: c.dept, prof: c.prof,
      status: playing ? 'playing' : 'menu', step: Math.floor(rnd() * 15), updated_at: new Date(Date.now() - rnd() * 120000).toISOString() };
  });
}
const npcById = id => NPCS.find(c => c.id === id);
// Переписка с персонажем: в браузере, ответ через пару секунд
const npcThreads = () => store.get('vdp-npc-dm', {});
function npcDm(short) {
  const c = npcById(short), m = $('modal'); clearInterval(dmTimer); dmOpen = short;
  m.innerHTML = `<div class="modal-box glass dm-box" role="dialog" aria-modal="true" aria-labelledby="dmTitle">
    <div class="dm-head"><h2 id="dmTitle">✉ ${esc(c.name)} <small class="npc-tag">${L('персонаж игры', 'game character')}</small></h2><button class="ip-x" type="button" id="dmClose" aria-label="${L('Закрыть', 'Close')}">×</button></div>
    <div class="dm-list" id="dmList" aria-live="polite"></div>
    <form class="chat-form" id="dmForm"><input id="dmText" maxlength="300" placeholder="${L('Сообщение', 'Message')}" autocomplete="off" aria-label="${L('Сообщение', 'Message')}"><button class="btn-main" type="submit">${L('Отправить', 'Send')}</button></form></div>`;
  m.hidden = false;
  const close = () => { dmOpen = ''; m.hidden = true; };
  $('dmClose').onclick = close; m.onclick = e => { if (e.target === m) close(); };
  const time = t => new Date(t).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  const draw = () => {
    const th = npcThreads()[short] || [], list = $('dmList'); if (!list) return;
    list.innerHTML = (th.length ? th : [{ mine: false, msg: c.say[0], at: Date.now() }]).map(r => `<div class="msg${r.mine ? ' mine' : ''}"><span class="meta">${time(r.at)}</span><span class="bubble">${esc(r.msg)}</span></div>`).join('')
      + '<div class="msg typing" id="dmTyping" hidden><span class="bubble">…</span></div>';
    list.scrollTop = list.scrollHeight;
  };
  const push = (mine, msg) => { const all = npcThreads(); (all[short] ||= []).push({ mine, msg, at: Date.now() }); all[short] = all[short].slice(-40); store.set('vdp-npc-dm', all); };
  $('dmForm').onsubmit = e => {
    e.preventDefault(); const t = $('dmText').value.trim(); if (!t) return;
    if (!(npcThreads()[short] || []).length) push(false, c.say[0]);
    push(true, t); $('dmText').value = ''; draw();
    $('dmTyping').hidden = false; $('dmList').scrollTop = 1e6;
    setTimeout(() => { const said = (npcThreads()[short] || []).filter(r => !r.mine).length; push(false, c.say[said % c.say.length]); if (dmOpen === short) draw(); sfx.item?.(); }, 1200 + Math.random() * 1800);
  };
  draw();
  if (matchMedia('(pointer: fine)').matches) $('dmText').focus();
}
// Встраиваемся в общий список «сейчас в игре», переписку и приглашения
{
  const realOnline = onlineNow;
  onlineNow = async () => [...(board.online ? await realOnline().catch(() => []) : []), ...npcOnline()];
  const realDm = openDm;
  openDm = (short, name) => npcById(short) ? npcDm(short) : realDm(short, name);
  const realInvite = inviteToOffice;
  inviteToOffice = (short, btn) => {
    const c = npcById(short);
    if (!c) return realInvite(short, btn);
    toast(L(`${c.name}: «${c.invite}»`, `${c.name}: “${c.invite}”`));
    if (btn) { btn.textContent = L('Ответил(а)', 'Replied'); btn.disabled = true; }
  };
}
