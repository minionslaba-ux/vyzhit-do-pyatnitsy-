// Контент механик «Выжить до пятницы»: перегрев, цепочки, виды недель, карточки профессий,
// предметы, черты характера, реакции персонажей и концовки-ачивки.
// Формат карточек тот же, что в cards.js: { id, who, text, answers: { left: {label, effects}, right: {label, effects} } }.

// ---------- Перегрев: проигрыш при 100% ----------
const DEATH_HIGH = {
  psyche:     { title: 'Кукуха 100%', text: 'Вы достигли просветления: перестали отвечать на письма, повесили табличку «Не беспокоить, я в моменте» и ушли медитировать в переговорку. Навсегда.' },
  energy:     { title: 'Энергия 100%', text: 'Гиперактивность. Вы переделали работу всего отдела, сломали кофемашину и заставили всех делать зарядку. Вас попросили отдохнуть — на другой работе.' },
  boss:       { title: 'Босс 100%', text: 'Босс в таком восторге, что назначил вас ответственным за всё. Теперь у вас 14 проектов, три отдела и ни одного выходного. Это хуже увольнения.' },
  colleagues: { title: 'Коллеги 100%', text: 'Вы стали душой компании и теперь возглавляете все корпоративы, дни рождения и тимбилдинги. На работу времени не осталось — её отдали другому.' },
};

// ---------- Цепочки: решение возвращается через пару дней ----------
// from — карточка и сторона ответа, at — день и фаза, куда придёт последствие
const CHAINS = [
  { from: 'mon_morning', side: 'right', at: { day: 'Четверг', phase: 'День' }, origin: 'Понедельник: «Я возьмусь!»',
    card: { id: 'chain_hot_deadline', who: 'Босс', text: 'Помните «горящую» задачу коллеги, которую вы героически взяли в понедельник? Её дедлайн — сегодня. Готово процентов тридцать.',
      answers: { left: { label: 'Честно попросить перенос', effects: { psyche: 5, energy: 5, boss: -15, colleagues: 0 } },
                 right: { label: 'Сидеть до ночи, но сдать', effects: { psyche: -10, energy: -20, boss: 20, colleagues: 5 } } } } },
  { from: 'mon_day', side: 'left', at: { day: 'Вторник', phase: 'День' }, origin: 'Понедельник: пицца с именинником',
    card: { id: 'chain_cake', who: 'Коллега', text: 'Вчерашний именинник запомнил, как вы его поздравили, и принёс вам лично последний кусок торта.',
      answers: { left: { label: 'Отказаться, я на диете', effects: { psyche: -5, energy: 0, boss: 0, colleagues: -5 } },
                 right: { label: 'Съесть с благодарностью', effects: { psyche: 10, energy: 10, boss: -5, colleagues: 10 } } } } },
  { from: 'tue_day', side: 'right', at: { day: 'Пятница', phase: 'Утро' }, origin: 'Вторник: спор с клиентом',
    card: { id: 'chain_client_complaint', who: 'Клиент', text: 'Клиент, которого вы во вторник размотали аргументами, пожаловался генеральному директору. Письмо в копии у всего отдела.',
      answers: { left: { label: 'Извиниться и сгладить', effects: { psyche: -15, energy: -5, boss: 10, colleagues: 0 } },
                 right: { label: 'Стоять на своём', effects: { psyche: 10, energy: 0, boss: -20, colleagues: 10 } } } } },
  { from: 'wed_evening', side: 'left', at: { day: 'Четверг', phase: 'Утро' }, origin: 'Среда: разгрузка склада',
    card: { id: 'chain_back', who: 'Спина', text: 'После вечерней разгрузки склада спина не разгибается. А в девять утра уже планёрка.',
      answers: { left: { label: 'Работать стоя и терпеть', effects: { psyche: -5, energy: -15, boss: 5, colleagues: 0 } },
                 right: { label: 'Отгул до обеда', effects: { psyche: 5, energy: 15, boss: -15, colleagues: 0 } } } } },
  { from: 'thu_evening', side: 'left', at: { day: 'Пятница', phase: 'Утро' }, origin: 'Четверг: бар с коллегами',
    card: { id: 'chain_hangover', who: 'Утро после бара', text: 'Голова гудит после вчерашних «двух пив сразу», а в 9:00 стратегическая сессия у босса.',
      answers: { left: { label: 'Прийти и молча кивать', effects: { psyche: -10, energy: -15, boss: 5, colleagues: 5 } },
                 right: { label: 'Работать сегодня из дома', effects: { psyche: 5, energy: 10, boss: -15, colleagues: 0 } } } } },
];

// ---------- Виды недель: свои карточки и правила ----------
// rules: bossMul — во сколько раз сильнее эффекты по Боссу, psycheNegMul — множитель минусов по Кукухе,
// hideBoss — скрыть подсказки по Боссу, bossStart — Босс в начале недели, start — бонусы на старте,
// randomChance — шанс случайного события в процентах, items — сколько предметов выдать
const WEEK_TYPES = {
  normal: { title: 'Обычная неделя', rule: 'Ничего особенного. Ну, почти.', rules: {} },
  reports: { title: 'Неделя отчётов', rule: 'Конец квартала: всё про Босса весит в полтора раза больше, а на случайности нет времени.',
    rules: { bossMul: 1.5, randomChance: 0 },
    cards: [
      { day: 'Понедельник', phase: 'Утро', id: 'rep_template', who: 'Босс', text: 'Квартальный отчёт нужен к пятнице. Шаблон снова поменяли — теперь 40 вкладок.',
        answers: { left: { label: 'Сделать в старом шаблоне', effects: { psyche: 5, energy: 5, boss: -15, colleagues: 0 } },
                   right: { label: 'Переделать в новом', effects: { psyche: -5, energy: -15, boss: 15, colleagues: 0 } } } },
      { day: 'Вторник', phase: 'Вечер', id: 'rep_kopeyki', who: 'Бухгалтерия', text: 'Цифры в отчёте не сходятся на три копейки. Бухгалтерия не уйдёт домой, пока не найдёт их.',
        answers: { left: { label: 'Округлить и забыть', effects: { psyche: 10, energy: 5, boss: -10, colleagues: -5 } },
                   right: { label: 'Искать копейки до ночи', effects: { psyche: -5, energy: -20, boss: 10, colleagues: 10 } } } },
      { day: 'Четверг', phase: 'День', id: 'rep_copy', who: 'Коллега', text: 'Коллега просит скопировать ваш раздел отчёта себе. «Мы же одна команда!»',
        answers: { left: { label: 'Нет, это моя работа', effects: { psyche: 5, energy: 0, boss: 5, colleagues: -15 } },
                   right: { label: 'Бери, не жалко', effects: { psyche: -5, energy: 0, boss: -10, colleagues: 15 } } } },
      { day: 'Пятница', phase: 'День', id: 'rep_slides', who: 'Босс', text: 'Отчёт сдан! Босс просит «пару слайдов» к нему для совета директоров. К понедельнику.',
        answers: { left: { label: 'Сделаю в понедельник', effects: { psyche: 10, energy: 5, boss: -10, colleagues: 0 } },
                   right: { label: 'Сделаю прямо сейчас', effects: { psyche: -10, energy: -15, boss: 15, colleagues: 0 } } } },
    ] },
  vacation: { title: 'Неделя перед отпуском', rule: 'Мысли уже на пляже: Энергия +10 на старте, минусы по Кукухе вдвое слабее, но случайностей больше.',
    rules: { psycheNegMul: .5, randomChance: 30, start: { energy: 10 }, items: 2 },
    cards: [
      { day: 'Понедельник', phase: 'Утро', id: 'vac_signed', who: 'HR', text: 'Заявление на отпуск подписано! До свободы пять рабочих дней.',
        answers: { left: { label: 'Работать как обычно', effects: { psyche: -5, energy: 0, boss: 5, colleagues: 0 } },
                   right: { label: 'Мысленно уже на пляже', effects: { psyche: 15, energy: 0, boss: -10, colleagues: 0 } } } },
      { day: 'Среда', phase: 'День', id: 'vac_tails', who: 'Босс', text: '«Перед отпуском закрой, пожалуйста, все хвосты». Хвостов — двадцать три.',
        answers: { left: { label: 'Закрыть самые важные', effects: { psyche: 0, energy: -10, boss: 5, colleagues: 0 } },
                   right: { label: 'Закрыть все до одного', effects: { psyche: -10, energy: -25, boss: 20, colleagues: 0 } } } },
      { day: 'Четверг', phase: 'Вечер', id: 'vac_souvenirs', who: 'Коллеги', text: 'Коллеги просят привезти сувениры из отпуска. Всем. И чтобы не магнитики.',
        answers: { left: { label: 'Только магнитики', effects: { psyche: 5, energy: 0, boss: 0, colleagues: -5 } },
                   right: { label: 'Завести таблицу заказов', effects: { psyche: -10, energy: -5, boss: 0, colleagues: 15 } } } },
      { day: 'Пятница', phase: 'Вечер', id: 'vac_autoreply', time: '17:30', who: 'Почта', text: '17:30. Последний час перед отпуском. Включить автоответ?',
        answers: { left: { label: 'Ещё разок проверю почту', effects: { psyche: -15, energy: -5, boss: 10, colleagues: 0 } },
                   right: { label: 'Автоответ и бегом', effects: { psyche: 20, energy: 10, boss: -10, colleagues: 0 } } } },
    ] },
  newboss: { title: 'Неделя с новым боссом', rule: 'Новый босс непредсказуем: подсказки по шкале «Босс» скрыты, а сама шкала начинает с 50%.',
    rules: { hideBoss: true, bossStart: 50 },
    cards: [
      { day: 'Понедельник', phase: 'Утро', id: 'nb_intro', who: 'Новый босс', text: 'Новый босс собирает всех и просит рассказать, «чем вы тут вообще занимаетесь».',
        answers: { left: { label: 'Скромно, в двух словах', effects: { psyche: 5, energy: 0, boss: -10, colleagues: 0 } },
                   right: { label: 'Презентация на 20 слайдов', effects: { psyche: 0, energy: -15, boss: 15, colleagues: -5 } } } },
      { day: 'Вторник', phase: 'День', id: 'nb_process', who: 'Новый босс', text: 'Новый босс отменил все ваши процессы и ввёл свои. С понедельника.',
        answers: { left: { label: 'Тихо работать по-старому', effects: { psyche: 10, energy: 0, boss: -15, colleagues: 0 } },
                   right: { label: 'Перестроиться', effects: { psyche: -10, energy: -15, boss: 15, colleagues: 0 } } } },
      { day: 'Среда', phase: 'Вечер', id: 'nb_gossip', who: 'Коллеги', text: 'Коллеги на кухне обсуждают нового босса. Зовут вас присоединиться.',
        answers: { left: { label: 'Не участвовать', effects: { psyche: 0, energy: 0, boss: 5, colleagues: -10 } },
                   right: { label: 'Поддержать разговор', effects: { psyche: 5, energy: 0, boss: -10, colleagues: 15 } } } },
      { day: 'Четверг', phase: 'Утро', id: 'nb_report', who: 'Новый босс', text: 'Новый босс хочет ежедневный отчёт о проделанной работе. В 8:30.',
        answers: { left: { label: 'Предложить раз в неделю', effects: { psyche: 10, energy: 0, boss: -10, colleagues: 5 } },
                   right: { label: 'Согласиться', effects: { psyche: -5, energy: -15, boss: 10, colleagues: 0 } } } },
    ] },
};

// ---------- Карточки профессий: одна выпадает каждую неделю ----------
const PROF_CARDS = {
  marketer: [
    { id: 'pm_viral', who: 'Босс', text: 'Нужен вирусный ролик к утру. Бюджет — 0 ₽, но «вы же креативные».',
      answers: { left: { label: 'Без бюджета не взлетит', effects: { psyche: 10, energy: 0, boss: -15, colleagues: 0 } }, right: { label: 'Сниму на телефон', effects: { psyche: 0, energy: -15, boss: 15, colleagues: 0 } } } },
    { id: 'pm_likes', who: 'Соцсети', text: 'Пост компании набрал три лайка. Один — от вашей мамы.',
      answers: { left: { label: 'Это органика, так и надо', effects: { psyche: 10, energy: 0, boss: -10, colleagues: 0 } }, right: { label: 'Запустить рекламу за свои', effects: { psyche: -10, energy: -5, boss: 10, colleagues: 0 } } } },
    { id: 'pm_apple', who: 'Директор', text: 'Директор хочет сайт «как у Apple, но дешевле и вчера».',
      answers: { left: { label: 'Объяснить, что так не бывает', effects: { psyche: 0, energy: 0, boss: -10, colleagues: 5 } }, right: { label: 'Сделать «как у Apple»', effects: { psyche: -5, energy: -20, boss: 15, colleagues: 0 } } } },
    { id: 'pm_leads', who: 'Отдел продаж', text: 'Продажники говорят, что лиды плохие и это ваша вина.',
      answers: { left: { label: 'Это вы плохо продаёте', effects: { psyche: 10, energy: 0, boss: 0, colleagues: -15 } }, right: { label: 'Провести общую встречу', effects: { psyche: 0, energy: -10, boss: 5, colleagues: 10 } } } },
  ],
  accountant: [
    { id: 'pa_taxi', who: 'Отдел продаж', text: 'Продажники принесли чеки за такси на 40 000 ₽ «на переговоры». Ни одной подписи.',
      answers: { left: { label: 'Вернуть на доработку', effects: { psyche: 0, energy: 0, boss: 10, colleagues: -15 } }, right: { label: 'Провести как есть', effects: { psyche: -10, energy: 0, boss: -10, colleagues: 15 } } } },
    { id: 'pa_tax', who: 'Налоговая', text: 'Налоговая прислала требование. Срок ответа — вчера.',
      answers: { left: { label: 'Позвонить и договориться', effects: { psyche: -10, energy: -5, boss: 10, colleagues: 0 } }, right: { label: 'Паниковать вместе с отделом', effects: { psyche: -20, energy: -5, boss: 0, colleagues: 10 } } } },
    { id: 'pa_1c', who: '1С', text: '1С обновилась сама. Ни один отчёт не открывается.',
      answers: { left: { label: 'Ждать сисадмина', effects: { psyche: 5, energy: 0, boss: -10, colleagues: 0 } }, right: { label: 'Чинить самостоятельно', effects: { psyche: -5, energy: -15, boss: 15, colleagues: 0 } } } },
    { id: 'pa_advance', who: 'Коллега', text: 'Коллега просит аванс «до пятницы». Пятница в следующем месяце.',
      answers: { left: { label: 'Только по заявлению', effects: { psyche: 0, energy: 0, boss: 10, colleagues: -10 } }, right: { label: 'Пойти навстречу', effects: { psyche: 0, energy: 0, boss: -10, colleagues: 15 } } } },
  ],
  dev: [
    { id: 'pd_button', who: 'Продакт', text: 'Продакт просит «маленькую кнопку». В приложенном ТЗ 40 страниц.',
      answers: { left: { label: 'Оценить в три месяца', effects: { psyche: 10, energy: 0, boss: -10, colleagues: 0 } }, right: { label: 'Сделаю к пятнице', effects: { psyche: 0, energy: -20, boss: 15, colleagues: 0 } } } },
    { id: 'pd_prod', who: 'Мониторинг', text: 'Упал прод, а вы на обеде. Телефон вибрирует без остановки.',
      answers: { left: { label: 'Доесть обед', effects: { psyche: 10, energy: 5, boss: -15, colleagues: 0 } }, right: { label: 'Чинить с телефона', effects: { psyche: -10, energy: -10, boss: 10, colleagues: 5 } } } },
    { id: 'pd_junior', who: 'Джун', text: 'Джун спрашивает, почему ваш код работает. Вы не знаете.',
      answers: { left: { label: '«Это магия» — и уйти', effects: { psyche: 5, energy: 0, boss: 0, colleagues: -10 } }, right: { label: 'Разобраться вместе', effects: { psyche: 0, energy: -10, boss: 0, colleagues: 15 } } } },
    { id: 'pd_review', who: 'Код-ревью', text: 'К вашему пул-реквесту 148 комментариев. Половина — про пробелы.',
      answers: { left: { label: 'Ответить «ок» на все', effects: { psyche: 10, energy: 0, boss: -5, colleagues: -10 } }, right: { label: 'Исправить всё', effects: { psyche: -5, energy: -20, boss: 0, colleagues: 10 } } } },
  ],
  sales: [
    { id: 'ps_feature', who: 'Клиент', text: 'Клиент подпишет договор прямо сейчас, если пообещать функцию, которой нет.',
      answers: { left: { label: 'Честно отказать', effects: { psyche: 10, energy: 0, boss: -15, colleagues: 0 } }, right: { label: 'Пообещать', effects: { psyche: -5, energy: 0, boss: 20, colleagues: -15 } } } },
    { id: 'ps_plan', who: 'Босс', text: 'План продаж подняли на 30% в середине месяца. «Вы же справитесь».',
      answers: { left: { label: 'Возмутиться', effects: { psyche: 10, energy: 0, boss: -10, colleagues: 5 } }, right: { label: 'Обзвонить всю базу', effects: { psyche: -5, energy: -20, boss: 15, colleagues: 0 } } } },
    { id: 'ps_silent', who: 'Клиент', text: 'Клиент не отвечает уже неделю. Написать в восьмой раз?',
      answers: { left: { label: 'Отпустить', effects: { psyche: 10, energy: 5, boss: -10, colleagues: 0 } }, right: { label: 'Позвонить с чужого номера', effects: { psyche: -10, energy: -5, boss: 10, colleagues: 0 } } } },
    { id: 'ps_stolen', who: 'Коллега', text: 'Коллега из соседнего отдела увёл вашего клиента.',
      answers: { left: { label: 'Промолчать', effects: { psyche: -15, energy: 0, boss: 0, colleagues: 5 } }, right: { label: 'Разобраться при всех', effects: { psyche: 10, energy: -5, boss: 5, colleagues: -15 } } } },
  ],
};

// ---------- Предметы: отменяют один удар по своей шкале (−10 и сильнее) ----------
const ITEMS = {
  coffee:     { name: 'Кофе',              stat: 'energy',     text: 'отменит удар по Энергии' },
  headphones: { name: 'Наушники',          stat: 'psyche',     text: 'отменят удар по Кукухе' },
  sicknote:   { name: 'Справка от врача',  stat: 'boss',       text: 'отменит удар по Боссу' },
  cookies:    { name: 'Печеньки',          stat: 'colleagues', text: 'отменят удар по Коллегам' },
};

// ---------- Черта характера: меняет тексты финалов ----------
const TRAITS = {
  workaholic: { name: 'Трудоголик', desc: 'Живёт работой',
    win: 'Вы закрыли неделю и уже открыли задачи на следующую. Ноутбук остался включённым — на всякий случай.',
    lose: 'Даже увольнение вы восприняли как задачу: резюме обновлено за 15 минут, сопроводительное — за 10.',
    year: 'Год пролетел как один длинный рабочий день. Отпуск? Какой отпуск?' },
  soul: { name: 'Душа компании', desc: 'Знает всех по имени',
    win: 'Пятница, 18:00 — и весь отдел ждёт вас в баре. Без вас не начинают.',
    lose: 'Коллеги скинулись на прощальный торт и плакали громче всех.',
    year: 'За год вы организовали 14 дней рождения и знаете, как зовут кота каждого коллеги.' },
  saboteur: { name: 'Тихий саботажник', desc: 'Делает ровно сколько нужно',
    win: 'Вы пережили неделю, ни разу не сделав больше необходимого. Это мастерство.',
    lose: 'Уходя, вы тихо поменяли пароль от Wi‑Fi на «пятница».',
    year: 'За год никто так и не понял, чем именно вы занимаетесь. И это успех.' },
};

// ---------- Реакции персонажей на ответ ----------
const REACTIONS = {
  boss:       { name: 'Босс',    color: '#ff3b6b', pos: ['Вот это подход!', 'Отлично, так держать.', 'Запишу в вашу характеристику.'], neg: ['Мы ещё поговорим.', 'Хм. Неожиданно.', 'Зайдите ко мне потом.'] },
  colleagues: { name: 'Коллеги', color: '#2de2e6', pos: ['Вот это по-нашему!', 'С нас пицца!', 'Ты лучший!'], neg: ['Ну спасибо…', 'Запомним.', 'Обидно, вообще-то.'] },
  hr:         { name: 'HR',      color: '#ff8be6', pos: ['Отличная вовлечённость!', 'Отмечу в опросе.'], neg: ['Это повлияет на ваш eNPS.', 'Пройдите тренинг, пожалуйста.'] },
  client:     { name: 'Клиент',  color: '#b26bff', pos: ['Приятно работать с профессионалами.', 'Подписываем!'], neg: ['Я буду жаловаться.', 'Рассмотрим других подрядчиков.'] },
  self:       { name: 'Внутренний голос', color: '#d4ff3a', pos: ['Так держать.', 'Красиво.', 'Вот это я понимаю.'], neg: ['Ну зачем…', 'Мы это ещё вспомним.', 'Ой.'] },
};

// ---------- Концовки-ачивки ----------
const ENDINGS = [
  { id: 'cake',      title: 'Уволен на торт бухгалтерии',  hint: 'Отрезать кусочек торта и не дожить до пятницы' },
  { id: 'boss_fri',  title: 'Стал боссом к пятнице',       hint: 'Довести Босса до 100% в пятницу' },
  { id: 'party',     title: 'Король корпоративов',          hint: 'Коллеги на 100%' },
  { id: 'zen',       title: 'Просветление в переговорке',   hint: 'Кукуха на 100%' },
  { id: 'battery',   title: 'Вечный двигатель',             hint: 'Энергия на 100%' },
  { id: 'cooler',    title: 'Кулер перевёрнут',             hint: 'Кукуха упала до нуля' },
  { id: 'zoom',      title: 'Сон на зуме с инвесторами',    hint: 'Энергия упала до нуля' },
  { id: 'two_words', title: 'На пару слов',                 hint: 'Босс упал до нуля' },
  { id: 'wifi',      title: 'Без пароля от Wi‑Fi',          hint: 'Коллеги упали до нуля' },
  { id: 'monday',    title: 'Понедельник — день тяжёлый',   hint: 'Проиграть в понедельник' },
  { id: 'almost',    title: 'Пятница была так близко',                hint: 'Проиграть в пятницу вечером' },
  { id: 'zen_week',  title: 'Идеальный баланс',             hint: 'Закрыть неделю со всеми шкалами от 40 до 60%' },
  { id: 'edge',      title: 'Неделя на краю',               hint: 'Закрыть неделю со шкалой ниже 10% или выше 90%' },
  { id: 'items2',    title: 'Мастер отговорок',             hint: 'Использовать за неделю два предмета' },
  { id: 'perfect_iv', title: 'Звезда собеседований',        hint: 'Набрать 8 из 8 на собеседовании' },
  { id: 'nomad',     title: 'Перекати-поле',                hint: 'Поработать в пяти компаниях за год' },
  { id: 'iron',      title: 'Железный сотрудник года',      hint: 'Отработать все 52 недели без увольнений' },
  { id: 'quiz_saved', title: 'Спасён эрудицией',             hint: 'Ответить на вопрос второго шанса и остаться на работе' },
  { id: 'quiz_fail',  title: 'Знание — не всегда сила',      hint: 'Не ответить на вопрос второго шанса' },
];
