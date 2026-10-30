// Контент игры «Выжить до пятницы».
// Редактируйте карточки здесь — логику (js/engine.js, js/game.js и др.) трогать не нужно.

// Карточки недели: JSON в формате заказчика (answers.left / answers.right)
const CARDS_JSON = [
  {
    "id": "mon_morning",
    "day": "Понедельник",
    "phase": "Утро",
    "text": L("Утреннее совещание. Босс просит кого-то взять на себя «горящую» задачу ушедшего в отпуск коллеги. Вызоветесь добровольцем?", "Morning stand-up. The boss needs someone to take over a coworker's \"on fire\" task now that they're on vacation. Volunteer?"),
    "answers": {
      "left": {
        "label": L("Сидеть тихо и не отсвечивать", "Sit still and blend into the furniture"),
        "effects": {
          "psyche": 5,
          "energy": 10,
          "boss": -15,
          "colleagues": 0
        }
      },
      "right": {
        "label": L("Я возьмусь! (Героически поднять руку)", "I'll do it! (Raise hand heroically)"),
        "effects": {
          "psyche": -15,
          "energy": -20,
          "boss": 25,
          "colleagues": 5
        }
      }
    }
  },
  {
    "id": "mon_day",
    "day": "Понедельник",
    "phase": "День",
    "text": L("В разгар работы курьер привез три огромные коробки с пиццей — у коллеги день рождения. Идете на кухню?", "Mid-crunch, a delivery guy drops off three giant pizza boxes — it's a coworker's birthday. Heading to the kitchen?"),
    "answers": {
      "left": {
        "label": L("Поздравить и съесть 3 куска", "Say happy birthday and eat 3 slices"),
        "effects": {
          "psyche": 15,
          "energy": 20,
          "boss": -10,
          "colleagues": 15
        }
      },
      "right": {
        "label": L("Жестко заигнорить, дедлайн важнее", "Ignore it hard. Deadline comes first"),
        "effects": {
          "psyche": -10,
          "energy": -5,
          "boss": 15,
          "colleagues": -15
        }
      }
    }
  },
  {
    "id": "mon_evening",
    "day": "Понедельник",
    "phase": "Вечер",
    "text": L("Время 17:58. Вы уже надели куртку, но коллега умоляет помочь ему разобраться с «поехавшей» таблицей в Excel. Поможете?", "5:58 PM. Your jacket is already on, but a coworker begs you to fix an Excel sheet that has \"gone rogue.\" Help out?"),
    "answers": {
      "left": {
        "label": L("«Мой рабочий день окончен, чао!»", "\"My workday is over. Ciao!\""),
        "effects": {
          "psyche": 15,
          "energy": 10,
          "boss": 0,
          "colleagues": -20
        }
      },
      "right": {
        "label": L("Снять куртку и включить компьютер", "Take off the jacket, boot up the PC"),
        "effects": {
          "psyche": -15,
          "energy": -15,
          "boss": 5,
          "colleagues": 25
        }
      }
    }
  },
  {
    "id": "tue_morning",
    "day": "Вторник",
    "phase": "Утро",
    "text": L("Принтер в коридоре зажевал пачку фотополимерных пластин и страшно дымит. Сисадмина на месте нет. Будете чинить сами?", "The hallway printer just ate a stack of photopolymer plates and is smoking ominously. IT is nowhere to be found. Fix it yourself?"),
    "answers": {
      "left": {
        "label": L("Попинать его и уйти", "Kick it and walk away"),
        "effects": {
          "psyche": -5,
          "energy": 5,
          "boss": -10,
          "colleagues": -5
        }
      },
      "right": {
        "label": L("Вскрыть корпус и залезть внутрь", "Pop the case and climb inside"),
        "effects": {
          "psyche": -15,
          "energy": -15,
          "boss": 15,
          "colleagues": 15
        }
      }
    }
  },
  {
    "id": "tue_day",
    "day": "Вторник",
    "phase": "День",
    "text": L("Важный клиент прислал ТЗ, написанное КАПСОМ с кучей восклицательных знаков и путаницей в форматах. Будете спорить?", "A key client sent a project brief WRITTEN IN ALL CAPS, loaded with exclamation marks and mixed-up file formats. Push back?"),
    "answers": {
      "left": {
        "label": L("Принять как есть и страдать", "Accept it as is and suffer"),
        "effects": {
          "psyche": -25,
          "energy": -10,
          "boss": 15,
          "colleagues": 0
        }
      },
      "right": {
        "label": L("Размотать его аргументами в ответ", "Take it apart point by point"),
        "effects": {
          "psyche": 15,
          "energy": -15,
          "boss": -20,
          "colleagues": 10
        }
      }
    }
  },
  {
    "id": "tue_evening",
    "day": "Вторник",
    "phase": "Вечер",
    "text": L("HR-отдел устраивает обязательный вебинар «Как избежать выгорания на работе» в 18:30. Подключитесь?", "HR is hosting a mandatory webinar, \"How to Avoid Burnout at Work,\" at 6:30 PM. Joining?"),
    "answers": {
      "left": {
        "label": L("Сказать, что пропал интернет", "Claim your Wi-Fi died"),
        "effects": {
          "psyche": 15,
          "energy": 10,
          "boss": -10,
          "colleagues": -5
        }
      },
      "right": {
        "label": L("Слушать лекцию и выгорать сильнее", "Attend and burn out even harder"),
        "effects": {
          "psyche": -20,
          "energy": -15,
          "boss": 15,
          "colleagues": 5
        }
      }
    }
  },
  {
    "id": "wed_morning",
    "day": "Среда",
    "phase": "Утро",
    "text": L("Экватор недели. Организм требует кофе, но на кухне закончилось молоко. Пойдете в кофейню напротив за свой счет?", "Hump day. Your body demands coffee, but the office kitchen is out of milk. Hit the café across the street on your own dime?"),
    "answers": {
      "left": {
        "label": L("Пойти (минус 300 рублей и 15 минут)", "Go (minus $6 and 15 minutes)"),
        "effects": {
          "psyche": 20,
          "energy": 25,
          "boss": -5,
          "colleagues": 0
        }
      },
      "right": {
        "label": L("Пить растворимый 3-в-1 из заначки", "Drink the emergency 3-in-1 instant stash"),
        "effects": {
          "psyche": -15,
          "energy": 5,
          "boss": 5,
          "colleagues": 5
        }
      }
    }
  },
  {
    "id": "wed_day",
    "day": "Среда",
    "phase": "День",
    "text": L("Коллеги зовут коллективно заказать суши на обед, но вам нужно сдать отчет до 15:00. Присоединитесь к заказу?", "The team is putting together a group sushi order for lunch, but your report is due by 3 PM. Join in?"),
    "answers": {
      "left": {
        "label": L("«Я в деле!» (Остаться без отчета)", "\"I'm in!\" (Report? What report?)"),
        "effects": {
          "psyche": 15,
          "energy": 15,
          "boss": -20,
          "colleagues": 20
        }
      },
      "right": {
        "label": L("Поесть свой суп из контейнера у ПК", "Eat your sad Tupperware soup at your desk"),
        "effects": {
          "psyche": -15,
          "energy": 5,
          "boss": 20,
          "colleagues": -10
        }
      }
    }
  },
  {
    "id": "wed_evening",
    "day": "Среда",
    "phase": "Вечер",
    "text": L("Босс пишет в рабочий чат: «Коллеги, кто может оперативно разгрузить склад с химией под новые тиражи?» Ответите?", "The boss posts in the team chat: \"Folks, who can quickly clear out the chemicals warehouse for the new print runs?\" Reply?"),
    "answers": {
      "left": {
        "label": L("Поставить смайлик «👍»", "React with a 👍"),
        "effects": {
          "psyche": -10,
          "energy": -25,
          "boss": 25,
          "colleagues": 10
        }
      },
      "right": {
        "label": L("Включить режим «Не беспокоить»", "Turn on Do Not Disturb"),
        "effects": {
          "psyche": 15,
          "energy": 15,
          "boss": -15,
          "colleagues": -5
        }
      }
    }
  },
  {
    "id": "thu_morning",
    "day": "Четверг",
    "phase": "Утро",
    "text": L("Вы проспали будильник на 20 минут. Есть шанс успеть, если поехать на такси «Комфорт+» за бешеные деньги. Едем?", "You slept through your alarm by 20 minutes. You can still make it if you take an Uber Black at surge pricing. Going?"),
    "answers": {
      "left": {
        "label": L("Вызвать такси и приехать вовремя", "Call the Uber and arrive on time"),
        "effects": {
          "psyche": -10,
          "energy": 15,
          "boss": 10,
          "colleagues": 0
        }
      },
      "right": {
        "label": L("Поехать на метро и опоздать", "Take the subway and be late"),
        "effects": {
          "psyche": 5,
          "energy": -15,
          "boss": -20,
          "colleagues": 0
        }
      }
    }
  },
  {
    "id": "thu_day",
    "day": "Четверг",
    "phase": "День",
    "text": L("На общем созвоне коллега пытается свалить косяк со сроками поставки оборудования на ваш отдел. Молчим?", "On the all-hands call, a coworker tries to pin the equipment delivery delays on your department. Stay quiet?"),
    "answers": {
      "left": {
        "label": L("Промолчать, чтобы не раздувать конфликт", "Stay quiet so it doesn't blow up"),
        "effects": {
          "psyche": -20,
          "energy": -5,
          "boss": -10,
          "colleagues": 10
        }
      },
      "right": {
        "label": L("Включить демонстрацию экрана с пруфами", "Share your screen. With receipts"),
        "effects": {
          "psyche": 15,
          "energy": -15,
          "boss": 15,
          "colleagues": -25
        }
      }
    }
  },
  {
    "id": "thu_evening",
    "day": "Четверг",
    "phase": "Вечер",
    "text": L("Четверг — это маленькая пятница. Коллеги зовут в бар прямо из офиса. Начало через полчаса, но у вас есть недоделки.", "Thursday is the new Friday. The team is heading to a bar straight from the office in half an hour, but you've got loose ends."),
    "answers": {
      "left": {
        "label": L("Пойти и заказать два пива сразу", "Go and order two beers at once"),
        "effects": {
          "psyche": 25,
          "energy": -20,
          "boss": -15,
          "colleagues": 25
        }
      },
      "right": {
        "label": L("Остаться в пустом темном офисе", "Stay in the dark, empty office"),
        "effects": {
          "psyche": -25,
          "energy": 5,
          "boss": 25,
          "colleagues": -15
        }
      }
    }
  },
  {
    "id": "fri_morning",
    "day": "Пятница",
    "phase": "Утро",
    "text": L("Выжить осталось немного. Но босс с утра пораньше назначает «стратегическую сессию планирования на следующий квартал». Идем?", "Almost there. But first thing in the morning the boss calls a \"strategic planning session for next quarter.\" Going?"),
    "answers": {
      "left": {
        "label": L("Активно кивать и предлагать идеи", "Nod vigorously and pitch ideas"),
        "effects": {
          "psyche": -20,
          "energy": -15,
          "boss": 25,
          "colleagues": 0
        }
      },
      "right": {
        "label": L("Сидеть с выключенной камерой в Zoom", "Lurk on Zoom with your camera off"),
        "effects": {
          "psyche": 10,
          "energy": 5,
          "boss": -20,
          "colleagues": -5
        }
      }
    }
  },
  {
    "id": "fri_day",
    "day": "Пятница",
    "phase": "День",
    "text": L("14:00. Приходит рассылка: «Упали сервера, внутренняя CRM не работает, заявки не принимаются». Что делаем?", "2:00 PM. Company-wide email: \"Servers are down, the internal CRM is offline, orders aren't coming through.\" What now?"),
    "answers": {
      "left": {
        "label": L("Чинить/Писать клиентам вручную", "Fix stuff / email clients by hand"),
        "effects": {
          "psyche": -25,
          "energy": -20,
          "boss": 20,
          "colleagues": 10
        }
      },
      "right": {
        "label": L("Легально залипать в мемы (Ждать)", "Legally scroll memes (wait it out)"),
        "effects": {
          "psyche": 25,
          "energy": 15,
          "boss": -15,
          "colleagues": 10
        }
      }
    }
  },
  {
    "id": "fri_evening",
    "day": "Пятница",
    "phase": "Вечер",
    "text": L("Время 17:50. Последний рывок. Босс заглядывает в кабинет: «Там клиент просит внести ма-а-аленькую правку, это на 5 минут». Ваши действия?", "5:50 PM. The final stretch. The boss pokes his head in: \"The client wants one teeny-tiny tweak, it's a 5-minute thing.\" Your move?"),
    "answers": {
      "left": {
        "label": L("«Да, конечно, сейчас сделаю»", "\"Sure thing, on it!\""),
        "effects": {
          "psyche": -30,
          "energy": -20,
          "boss": 30,
          "colleagues": 0
        }
      },
      "right": {
        "label": L("«Я уже в лифте, связь плохая, пока!»", "\"I'm in the elevator, bad signal, bye-e-e!\""),
        "effects": {
          "psyche": 30,
          "energy": 20,
          "boss": -30,
          "colleagues": 0
        }
      }
    }
  }
];
// Оформление карточек: кто говорит, иконка-обложка и точное время, если оно названо в тексте
const DECOR = {
  mon_morning: { who: L('Босс', "Boss"), cover_image: '🔥' },
  mon_day: { who: L('Курьер', "Delivery guy"), cover_image: '🍕' },
  mon_evening: { who: L('Коллега', "Coworker"), cover_image: '📊', time: '17:58' },
  tue_morning: { who: L('Принтер', "Printer"), cover_image: '🖨️' },
  tue_day: { who: L('Клиент', "Client"), cover_image: '📢' },
  tue_evening: { who: 'HR', cover_image: '🧯', time: '17:40' },
  wed_morning: { who: L('Кухня', "Kitchen"), cover_image: '☕' },
  wed_day: { who: L('Коллеги', "Coworkers"), cover_image: '🍣' },
  wed_evening: { who: L('Рабочий чат', "Team chat"), cover_image: '📦' },
  thu_morning: { who: L('Будильник', "Alarm clock"), cover_image: '⏰', time: '08:20' },
  thu_day: { who: L('Общий созвон', "All-hands call"), cover_image: '🖥️' },
  thu_evening: { who: L('Коллеги', "Coworkers"), cover_image: '🍺' },
  fri_morning: { who: L('Босс', "Boss"), cover_image: '🗓️' },
  fri_day: { who: L('Рассылка', "Company email"), cover_image: '💥', time: '14:00' },
  fri_evening: { who: L('Босс', "Boss"), cover_image: '✏️', time: '17:50' },
};
// Случайные события: могут выпасть в любой фазе любого дня вместо карточки по расписанию
const RANDOM_JSON = [
  { id: 'rnd_fire_drill', who: L('Охрана', "Security"), cover_image: '🚨', text: L('Внезапная учебная пожарная тревога. Весь офис выгоняют на улицу на 40 минут.', "Surprise fire drill! The whole office gets herded outside for 40 minutes."),
    answers: { left: { label: L('Спрятаться в туалете и работать', "Hide in the restroom and keep working"), effects: { psyche: -10, energy: -5, boss: 10, colleagues: -10 } },
               right: { label: L('Выйти и болтать с коллегами', "Go outside and chat with coworkers"), effects: { psyche: 15, energy: 5, boss: -10, colleagues: 15 } } } },
  { id: 'rnd_elevator', who: L('Лифт', "Elevator"), cover_image: '🛗', text: L('В лифте вы оказались наедине с генеральным директором. Он смотрит на вас и молчит. Ехать ещё 12 этажей.', "You're alone in the elevator with the CEO. He's staring at you in silence. Twelve more floors to go."),
    answers: { left: { label: L('Уткнуться в телефон', "Stare deep into your phone"), effects: { psyche: 5, energy: 0, boss: -10, colleagues: 0 } },
               right: { label: L('Рассказать про свой проект', "Elevator-pitch your project"), effects: { psyche: -10, energy: -5, boss: 20, colleagues: 0 } } } },
  { id: 'rnd_cake', who: L('Кухня', "Kitchen"), cover_image: '🍰', text: L('На кухне стоит торт с запиской «Не трогать! Для бухгалтерии». Вокруг ни души.', "There's a cake in the kitchen with a note: \"DO NOT TOUCH! For Accounting.\" Not a soul around."),
    answers: { left: { label: L('Пройти мимо с достоинством', "Walk past with dignity"), effects: { psyche: -5, energy: 0, boss: 0, colleagues: 5 } },
               right: { label: L('Отрезать тонкий кусочек', "Shave off a tiny sliver"), effects: { psyche: 10, energy: 15, boss: 0, colleagues: -15 } } } },
  { id: 'rnd_wifi', who: L('Сисадмин', "IT guy"), cover_image: '📶', text: L('В офисе отключили Wi‑Fi до конца дня. Ноутбук превратился в дорогую подставку для кружки.', "The office Wi-Fi is down for the rest of the day. Your laptop is now a very expensive coaster."),
    answers: { left: { label: L('Раздать интернет с телефона', "Hotspot off your phone"), effects: { psyche: -10, energy: -5, boss: 15, colleagues: 0 } },
               right: { label: L('Наконец разобрать завалы на столе', "Finally dig out your desk"), effects: { psyche: 15, energy: 5, boss: -10, colleagues: 5 } } } },
  { id: 'rnd_ficus', who: 'HR', cover_image: '🪴', text: L('Офисный фикус, который поручили поливать именно вам, засох. HR просит объяснительную.', "The office ficus you were in charge of watering has died. HR wants a written explanation."),
    answers: { left: { label: L('Свалить всё на кондиционер', "Blame it all on the AC"), effects: { psyche: 10, energy: 0, boss: -10, colleagues: -5 } },
               right: { label: L('Купить новый за свой счёт', "Buy a new one with your own money"), effects: { psyche: -5, energy: -10, boss: 5, colleagues: 10 } } } },
  { id: 'rnd_ai', who: L('Босс', "Boss"), cover_image: '🤖', text: L('Босс разослал всем ссылку на нейросеть: «Теперь вы будете делать всё в 10 раз быстрее». Сроки уже сократили.', "The boss emailed everyone a link to an AI tool: \"Now you'll do everything 10x faster.\" Deadlines have already been cut."),
    answers: { left: { label: L('Тихо работать по-старому', "Quietly keep doing it the old way"), effects: { psyche: 5, energy: 0, boss: -15, colleagues: 0 } },
               right: { label: L('Весь день оттачивать промпты', "Spend all day perfecting prompts"), effects: { psyche: -10, energy: -15, boss: 20, colleagues: 5 } } } },
  { id: 'rnd_massage', who: L('Офис-менеджер', "Office manager"), cover_image: '💆', text: L('В офис приехал массажист. Запись по живой очереди, а очередь уже тянется до лифта.', "A massage therapist is in the office today. First come, first served — and the line already reaches the elevator."),
    answers: { left: { label: L('Не тратить время', "Not worth the time"), effects: { psyche: -5, energy: -5, boss: 5, colleagues: 0 } },
               right: { label: L('Отстоять 40 минут', "Wait in line for 40 minutes"), effects: { psyche: 15, energy: 20, boss: -15, colleagues: 0 } } } },
  { id: 'rnd_parking', who: L('Парковка', "Parking lot"), cover_image: '🚙', text: L('Ваше парковочное место занял огромный джип. Охранник шепчет: это машина нового финдиректора.', "A giant SUV is in your parking spot. The security guard whispers: it belongs to the new CFO."),
    answers: { left: { label: L('Оставить гневную записку', "Leave an angry note"), effects: { psyche: 15, energy: 0, boss: -20, colleagues: 5 } },
               right: { label: L('Встать за три квартала', "Park three blocks away"), effects: { psyche: -10, energy: -15, boss: 5, colleagues: 0 } } } },
];

// ---------- Карьера: вакансии после увольнения ----------
// level — сложность собеседования (1 лёгкое … 3 трудное), perk — стартовый бонус на новом месте
const VACANCIES = [
  { id: 'roga',    name: L('«Рога и копыта»', "Smoke & Mirrors Inc."),          vibe: L('Стабильно, как старый принтер', "Stable, like an old printer"),            level: 1, perk: { psyche: 10 } },
  { id: 'gos',     name: L('ГосТехПром', "GovTechWorks"),                vibe: L('Обед строго в 12:00, зато без сюрпризов', "Lunch at noon sharp, but zero surprises"),  level: 1, perk: { energy: 10 } },
  { id: 'penka',   name: L('Коворкинг «Пенка»', "Latte Foam Coworking"),         vibe: L('Кофе бесплатный, зарплата почти тоже', "Free coffee, and the salary is almost free too"),     level: 1, perk: { energy: 15, boss: -5 } },
  { id: 'vector',  name: L('ООО «Вектор Синергии»', "Synergy Vector LLC"),     vibe: L('Много созвонов, ещё больше смыслов', "Endless calls, even more synergy"),       level: 2, perk: { boss: 10 } },
  { id: 'kotiki',  name: L('Стартап «Блокчейн-Котики»', "BlockchainKitties.io"), vibe: L('Пицца по пятницам, дедлайны вчера', "Pizza Fridays, deadlines due yesterday"),        level: 2, perk: { colleagues: 10, energy: -5 } },
  { id: 'stepler', name: L('Завод «Красный Степлер»', "Red Stapler Factory"),   vibe: L('Смена с 8:00, зато всё понятно', "Shift starts at 8 AM, but at least it all makes sense"),           level: 2, perk: { psyche: 5, colleagues: 5 } },
  { id: 'hype',    name: L('Агентство «Хайп»', "Hype Agency"),          vibe: L('Креатив до утра и дизайнеры в худи', "Brainstorms till dawn and designers in hoodies"),       level: 3, perk: { colleagues: 15, psyche: -10 } },
  { id: 'bank',    name: L('Банк «Надёжный Плюс»', "TrustyPlus Bank"),      vibe: L('Дресс-код, KPI и печеньки по четвергам', "Dress code, KPIs and cookies on Thursdays"),   level: 3, perk: { boss: 10, energy: 5 } },
  { id: 'mega',    name: L('Мега-Холдинг Глобал', "MegaHolding Global"),       vibe: L('Пятый этаж из сорока, лифт по пропуску', "Floor 5 of 40, badge-only elevators"),   level: 3, perk: { boss: 15, psyche: -5 } },
];

// ---------- Карьера: вопросы на собеседовании ----------
// score: 2 — сильный ответ, 1 — так себе, 0 — провал. reply — реакция HR
const INTERVIEW = [
  { q: L('Расскажите о себе.', "Tell me about yourself."), a: [
    { label: L('Коротко: опыт, результаты и почему хочу к вам', "Short version: experience, results, and why I want to work here"), score: 2, reply: L('Чётко и по делу. Записываю.', "Clear and to the point. Writing that down.") },
    { label: L('Я командный игрок, перфекционист и трудоголик', "I'm a team player, a perfectionist and a workaholic"), score: 1, reply: L('Уникально. Сегодня это уже сороковой раз.', "How original. That's the fortieth time today.") },
    { label: L('Ну, детство моё прошло в маленьком городе…', "Well, I grew up in a small town…"), score: 0, reply: L('…и через 20 минут мы всё ещё в девяностых.', "…and twenty minutes later we're still in the nineties.") } ] },
  { q: L('Где вы видите себя через пять лет?', "Where do you see yourself in five years?"), a: [
    { label: L('Здесь же, но с задачами покрупнее', "Right here, with bigger responsibilities"), score: 2, reply: L('Правильный ответ, мы так и запишем.', "Correct answer. We'll put that down.") },
    { label: L('На вашем месте', "In your chair"), score: 1, reply: L('Смело. HR нервно улыбается.', "Bold. HR smiles nervously.") },
    { label: L('На Бали, без ноутбука', "In Bali, without a laptop"), score: 0, reply: L('Мы тоже. Но вопрос был про работу.', "Same. But the question was about work.") } ] },
  { q: L('Ваша главная слабость?', "What's your biggest weakness?"), a: [
    { label: L('Берусь за всё сразу — учусь делегировать', "I take on everything at once — I'm learning to delegate"), score: 2, reply: L('Самокритично и по делу.', "Self-aware and relevant.") },
    { label: L('Иногда слишком много работаю', "Sometimes I just work too hard"), score: 1, reply: L('Классика жанра.', "A true classic.") },
    { label: L('Шоколад', "Chocolate"), score: 0, reply: L('Честно. Но нет.', "Honest. But no.") } ] },
  { q: L('Почему ушли с прошлого места?', "Why did you leave your last job?"), a: [
    { label: L('Меня уволили, и это был полезный урок', "I got fired, and it taught me a lot"), score: 2, reply: L('Ценим честность.', "We appreciate the honesty.") },
    { label: L('Захотелось новых вызовов', "I was looking for new challenges"), score: 1, reply: L('Звучит знакомо.', "Sounds familiar.") },
    { label: L('Там все были идиотами', "Everyone there was an idiot"), score: 0, reply: L('Интересно, что вы потом скажете о нас.', "Can't wait to hear what you'll say about us.") } ] },
  { q: L('Какую зарплату ожидаете?', "What are your salary expectations?"), a: [
    { label: L('Назову вилку по рынку и объясню почему', "I'll give a market-rate range and explain why"), score: 2, reply: L('Аргументированно. Обсудим.', "Well argued. Let's talk.") },
    { label: L('В три раза больше, чем сейчас', "Triple what I make now"), score: 1, reply: L('Мечтать не вредно.', "A person can dream.") },
    { label: L('Сколько не жалко', "Whatever you can spare"), score: 0, reply: L('Нам, честно говоря, жалко всегда.', "Honestly, we can never spare anything.") } ] },
  { q: L('Сколько мячей для гольфа поместится в автобус?', "How many golf balls fit in a school bus?"), a: [
    { label: L('Посчитаю объём салона и мяча, вычту сиденья', "I'd estimate the bus and ball volumes, minus the seats"), score: 2, reply: L('Вот это ход мысли!', "Now that's a thought process!") },
    { label: L('А зачем вам мячи в автобусе?', "Why do you need golf balls in a bus?"), score: 1, reply: L('Хороший вопрос, но отвечать будете вы.', "Good question, but you're the one answering.") },
    { label: L('Сорок два', "Forty-two"), score: 0, reply: L('Отсылку оценили. Ответ — нет.', "Nice reference. Wrong answer.") } ] },
  { q: L('У вас конфликт с коллегой. Что будете делать?', "You have a conflict with a coworker. What do you do?"), a: [
    { label: L('Поговорю один на один и найду решение', "Talk it out one-on-one and find a solution"), score: 2, reply: L('Взрослый подход.', "Very grown-up of you.") },
    { label: L('Пожалуюсь руководителю', "Complain to my manager"), score: 1, reply: L('Ну, тоже вариант.', "Well, that's one option.") },
    { label: L('Напишу в общий чат, пусть все рассудят', "Post it in the group chat and let everyone judge"), score: 0, reply: L('Мы видели такие чаты. Нет.', "We've seen those chats. No.") } ] },
  { q: L('Готовы работать в выходные?', "Are you willing to work weekends?"), a: [
    { label: L('В аврал — да, но не постоянно', "During crunch, yes — but not all the time"), score: 2, reply: L('Здоровый баланс, нравится.', "Healthy balance. We like it.") },
    { label: L('Всегда! Я живу работой', "Always! Work is my life"), score: 1, reply: L('Подозрительно бодро.', "Suspiciously enthusiastic.") },
    { label: L('Нет. Никогда. Ни за что.', "No. Never. Not a chance."), score: 0, reply: L('Принципиально. Понятно.', "Principled. Noted.") } ] },
  { q: L('Почему именно наша компания?', "Why our company?"), a: [
    { label: L('Мне нравится ваш продукт, и вот почему…', "I love your product, and here's why…"), score: 2, reply: L('Видно, что вы готовились.', "You clearly did your homework.") },
    { label: L('Хорошие отзывы и офис у метро', "Good Glassdoor reviews and the office is near the subway"), score: 1, reply: L('Офис и правда у метро.', "The office really is near the subway.") },
    { label: L('Вы первые ответили на резюме', "You were the first to reply to my résumé"), score: 0, reply: L('Спасибо за искренность.', "Thanks for your honesty.") } ] },
];
// Последний вопрос задаётся всегда
const INTERVIEW_LAST = { q: L('Есть вопросы к нам?', "Do you have any questions for us?"), a: [
  { label: L('Как у вас устроены онбординг и развитие?', "How do onboarding and career growth work here?"), score: 2, reply: L('Отличный вопрос, расскажем подробно.', "Great question. Let us walk you through it.") },
  { label: L('Есть ли печеньки на кухне?', "Are there cookies in the kitchen?"), score: 1, reply: L('Есть. Это вам в плюс.', "There are. Points for asking.") },
  { label: L('Когда обед?', "When's lunch?"), score: 0, reply: L('Через три часа. Как и у всех.', "In three hours. Same as everyone.") } ] };
