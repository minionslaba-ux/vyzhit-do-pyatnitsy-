// Контент игры «Выжить до пятницы».
// Редактируйте карточки здесь — логика в js/game.js трогать не нужно.

// Карточки недели: JSON в формате заказчика (answers.left / answers.right)
const CARDS_JSON = [
  {
    "id": "mon_morning",
    "day": "Понедельник",
    "phase": "Утро",
    "text": "Утреннее совещание. Босс просит кого-то взять на себя «горящую» задачу ушедшего в отпуск коллеги. Вызоветесь добровольцем?",
    "answers": {
      "left": {
        "label": "Сидеть тихо и не отсвечивать",
        "effects": {
          "psyche": 5,
          "energy": 10,
          "boss": -15,
          "colleagues": 0
        }
      },
      "right": {
        "label": "Я возьмусь! (Героически поднять руку)",
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
    "text": "В разгар работы курьер привез три огромные коробки с пиццей — у коллеги день рождения. Идете на кухню?",
    "answers": {
      "left": {
        "label": "Поздравить и съесть 3 куска",
        "effects": {
          "psyche": 15,
          "energy": 20,
          "boss": -10,
          "colleagues": 15
        }
      },
      "right": {
        "label": "Жестко заигнорить, дедлайн важнее",
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
    "text": "Время 17:58. Вы уже надели куртку, но коллега умоляет помочь ему разобраться с «поехавшей» таблицей в Excel. Поможете?",
    "answers": {
      "left": {
        "label": "«Мой рабочий день окончен, чао!»",
        "effects": {
          "psyche": 15,
          "energy": 10,
          "boss": 0,
          "colleagues": -20
        }
      },
      "right": {
        "label": "Снять куртку и включить компьютер",
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
    "text": "Принтер в коридоре зажевал пачку фотополимерных пластин и страшно дымит. Сисадмина на месте нет. Будете чинить сами?",
    "answers": {
      "left": {
        "label": "Попинать его и уйти",
        "effects": {
          "psyche": -5,
          "energy": 5,
          "boss": -10,
          "colleagues": -5
        }
      },
      "right": {
        "label": "Вскрыть корпус и залезть внутрь",
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
    "text": "Важный клиент прислал ТЗ, написанное КАПСОМ с кучей восклицательных знаков и путаницей в форматах. Будете спорить?",
    "answers": {
      "left": {
        "label": "Принять как есть и страдать",
        "effects": {
          "psyche": -25,
          "energy": -10,
          "boss": 15,
          "colleagues": 0
        }
      },
      "right": {
        "label": "Размотать его аргументами в ответ",
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
    "text": "HR-отдел устраивает обязательный вебинар «Как избежать выгорания на работе» в 18:30. Подключитесь?",
    "answers": {
      "left": {
        "label": "Сказать, что пропал интернет",
        "effects": {
          "psyche": 15,
          "energy": 10,
          "boss": -10,
          "colleagues": -5
        }
      },
      "right": {
        "label": "Слушать лекцию и выгорать сильнее",
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
    "text": "Экватор недели. Организм требует кофе, но на кухне закончилось молоко. Пойдете в кофейню напротив за свой счет?",
    "answers": {
      "left": {
        "label": "Пойти (минус 300 рублей и 15 минут)",
        "effects": {
          "psyche": 20,
          "energy": 25,
          "boss": -5,
          "colleagues": 0
        }
      },
      "right": {
        "label": "Пить растворимый 3-в-1 из заначки",
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
    "text": "Коллеги зовут коллективно заказать суши на обед, но вам нужно сдать отчет до 15:00. Присоединитесь к заказу?",
    "answers": {
      "left": {
        "label": "«Я в деле!» (Остаться без отчета)",
        "effects": {
          "psyche": 15,
          "energy": 15,
          "boss": -20,
          "colleagues": 20
        }
      },
      "right": {
        "label": "Поесть свой суп из контейнера у ПК",
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
    "text": "Босс пишет в рабочий чат: «Коллеги, кто может оперативно разгрузить склад с химией под новые тиражи?» Ответите?",
    "answers": {
      "left": {
        "label": "Поставить смайлик «👍»",
        "effects": {
          "psyche": -10,
          "energy": -25,
          "boss": 25,
          "colleagues": 10
        }
      },
      "right": {
        "label": "Включить режим «Не беспокоить»",
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
    "text": "Вы проспали будильник на 20 минут. Есть шанс успеть, если поехать на такси «Комфорт+» за бешеные деньги. Едем?",
    "answers": {
      "left": {
        "label": "Вызвать такси и приехать вовремя",
        "effects": {
          "psyche": -10,
          "energy": 15,
          "boss": 10,
          "colleagues": 0
        }
      },
      "right": {
        "label": "Поехать на метро и опоздать",
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
    "text": "На общем созвоне коллега пытается свалить косяк со сроками поставки оборудования на ваш отдел. Молчим?",
    "answers": {
      "left": {
        "label": "Промолчать, чтобы не раздувать конфликт",
        "effects": {
          "psyche": -20,
          "energy": -5,
          "boss": -10,
          "colleagues": 10
        }
      },
      "right": {
        "label": "Включить демонстрацию экрана с пруфами",
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
    "text": "Четверг — это маленькая пятница. Коллеги зовут в бар прямо из офиса. Начало через полчаса, но у вас есть недоделки.",
    "answers": {
      "left": {
        "label": "Пойти и заказать два пива сразу",
        "effects": {
          "psyche": 25,
          "energy": -20,
          "boss": -15,
          "colleagues": 25
        }
      },
      "right": {
        "label": "Остаться в пустом темном офисе",
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
    "text": "Выжить осталось немного. Но босс с утра пораньше назначает «стратегическую сессию планирования на следующий квартал». Идем?",
    "answers": {
      "left": {
        "label": "Активно кивать и предлагать идеи",
        "effects": {
          "psyche": -20,
          "energy": -15,
          "boss": 25,
          "colleagues": 0
        }
      },
      "right": {
        "label": "Сидеть с выключенной камерой в Zoom",
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
    "text": "14:00. Приходит рассылка: «Упали сервера, внутренняя CRM не работает, заявки не принимаются». Что делаем?",
    "answers": {
      "left": {
        "label": "Чинить/Писать клиентам вручную",
        "effects": {
          "psyche": -25,
          "energy": -20,
          "boss": 20,
          "colleagues": 10
        }
      },
      "right": {
        "label": "Легально залипать в мемы (Ждать)",
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
    "text": "Время 17:50. Последний рывок. Босс заглядывает в кабинет: «Там клиент просит внести ма-а-аленькую правку, это на 5 минут». Ваши действия?",
    "answers": {
      "left": {
        "label": "«Да, конечно, сейчас сделаю»",
        "effects": {
          "psyche": -30,
          "energy": -20,
          "boss": 30,
          "colleagues": 0
        }
      },
      "right": {
        "label": "«Я уже в лифте, связь плохая, пока!»",
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
  mon_morning: { who: 'Босс', cover_image: '🔥' },
  mon_day: { who: 'Курьер', cover_image: '🍕' },
  mon_evening: { who: 'Коллега', cover_image: '📊', time: '17:58' },
  tue_morning: { who: 'Принтер', cover_image: '🖨️' },
  tue_day: { who: 'Клиент', cover_image: '📢' },
  tue_evening: { who: 'HR', cover_image: '🧯', time: '17:40' },
  wed_morning: { who: 'Кухня', cover_image: '☕' },
  wed_day: { who: 'Коллеги', cover_image: '🍣' },
  wed_evening: { who: 'Рабочий чат', cover_image: '📦' },
  thu_morning: { who: 'Будильник', cover_image: '⏰', time: '08:20' },
  thu_day: { who: 'Общий созвон', cover_image: '🖥️' },
  thu_evening: { who: 'Коллеги', cover_image: '🍺' },
  fri_morning: { who: 'Босс', cover_image: '🗓️' },
  fri_day: { who: 'Рассылка', cover_image: '💥', time: '14:00' },
  fri_evening: { who: 'Босс', cover_image: '✏️', time: '17:50' },
};
// Случайные события: могут выпасть в любой фазе любого дня вместо карточки по расписанию
const RANDOM_JSON = [
  { id: 'rnd_fire_drill', who: 'Охрана', cover_image: '🚨', text: 'Внезапная учебная пожарная тревога. Весь офис выгоняют на улицу на 40 минут.',
    answers: { left: { label: 'Спрятаться в туалете и работать', effects: { psyche: -10, energy: -5, boss: 10, colleagues: -10 } },
               right: { label: 'Выйти и болтать с коллегами', effects: { psyche: 15, energy: 5, boss: -10, colleagues: 15 } } } },
  { id: 'rnd_elevator', who: 'Лифт', cover_image: '🛗', text: 'В лифте вы оказались наедине с генеральным директором. Он смотрит на вас и молчит. Ехать ещё 12 этажей.',
    answers: { left: { label: 'Уткнуться в телефон', effects: { psyche: 5, energy: 0, boss: -10, colleagues: 0 } },
               right: { label: 'Рассказать про свой проект', effects: { psyche: -10, energy: -5, boss: 20, colleagues: 0 } } } },
  { id: 'rnd_cake', who: 'Кухня', cover_image: '🍰', text: 'На кухне стоит торт с запиской «Не трогать! Для бухгалтерии». Вокруг ни души.',
    answers: { left: { label: 'Пройти мимо с достоинством', effects: { psyche: -5, energy: 0, boss: 0, colleagues: 5 } },
               right: { label: 'Отрезать тонкий кусочек', effects: { psyche: 10, energy: 15, boss: 0, colleagues: -15 } } } },
  { id: 'rnd_wifi', who: 'Сисадмин', cover_image: '📶', text: 'В офисе отключили Wi‑Fi до конца дня. Ноутбук превратился в дорогую подставку для кружки.',
    answers: { left: { label: 'Раздать интернет с телефона', effects: { psyche: -10, energy: -5, boss: 15, colleagues: 0 } },
               right: { label: 'Наконец разобрать завалы на столе', effects: { psyche: 15, energy: 5, boss: -10, colleagues: 5 } } } },
  { id: 'rnd_ficus', who: 'HR', cover_image: '🪴', text: 'Офисный фикус, который поручили поливать именно вам, засох. HR просит объяснительную.',
    answers: { left: { label: 'Свалить всё на кондиционер', effects: { psyche: 10, energy: 0, boss: -10, colleagues: -5 } },
               right: { label: 'Купить новый за свой счёт', effects: { psyche: -5, energy: -10, boss: 5, colleagues: 10 } } } },
  { id: 'rnd_ai', who: 'Босс', cover_image: '🤖', text: 'Босс разослал всем ссылку на нейросеть: «Теперь вы будете делать всё в 10 раз быстрее». Сроки уже сократили.',
    answers: { left: { label: 'Тихо работать по-старому', effects: { psyche: 5, energy: 0, boss: -15, colleagues: 0 } },
               right: { label: 'Весь день оттачивать промпты', effects: { psyche: -10, energy: -15, boss: 20, colleagues: 5 } } } },
  { id: 'rnd_massage', who: 'Офис-менеджер', cover_image: '💆', text: 'В офис приехал массажист. Запись по живой очереди, а очередь уже тянется до лифта.',
    answers: { left: { label: 'Не тратить время', effects: { psyche: -5, energy: -5, boss: 5, colleagues: 0 } },
               right: { label: 'Отстоять 40 минут', effects: { psyche: 15, energy: 20, boss: -15, colleagues: 0 } } } },
  { id: 'rnd_parking', who: 'Парковка', cover_image: '🚙', text: 'Ваше парковочное место занял огромный джип. Охранник шепчет: это машина нового финдиректора.',
    answers: { left: { label: 'Оставить гневную записку', effects: { psyche: 15, energy: 0, boss: -20, colleagues: 5 } },
               right: { label: 'Встать за три квартала', effects: { psyche: -10, energy: -15, boss: 5, colleagues: 0 } } } },
];
