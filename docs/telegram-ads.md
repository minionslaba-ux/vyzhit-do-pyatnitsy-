# Реклама в Telegram Ads — «Выжить до пятницы»

Объявления ведут сразу в игру внутри Telegram. У каждого своя метка (`utm_…`): игра запишет её при первом открытии,
и в `/stats`, ежедневном отчёте и выгрузке `/export` будет видно, какое объявление привело игроков (источник «Telegram (ads_…)»).

## Объявления (русский)

| Метка | Текст | Символов | Ссылка |
|---|---|---|---|
| `ads_boss` | Босс пишет «есть минутка?» в пятницу в 17:55. Что ответите? Офисная игра: 25 решений до 18:00, четыре шкалы и ни одного лишнего созвона. | 136 | `https://t.me/Survivefridaybot?startapp=utm_ads_boss` |
| `ads_friday` | Доживёте до пятницы, 18:00? Бесплатная игра про офис прямо в Telegram: держите в балансе Кукуху, Энергию, Босса и Коллег. | 121 | `https://t.me/Survivefridaybot?startapp=utm_ads_friday` |
| `ads_dept` | Какой отдел самый стрессоустойчивый? Сыграйте неделю дня и поднимите свой отдел в рейтинге. Бесплатно, без регистрации. | 119 | `https://t.me/Survivefridaybot?startapp=utm_ads_dept` |
| `ads_deadline` | Дедлайн горит, коллеги обиделись, кофе кончился. Офисная игра, где каждое решение имеет последствия. Одна неделя — 5 минут. | 123 | `https://t.me/Survivefridaybot?startapp=utm_ads_deadline` |
| `ads_career` | Карьера от вечного стажёра до генерального директора за 52 недели. Свайпайте решения и не дайте Боссу вас уволить. | 114 | `https://t.me/Survivefridaybot?startapp=utm_ads_career` |
| `ads_daily` | Каждый день — новая неделя, одна на всех. Сравните результат с коллегами и узнайте, кто лучше переживёт понедельник. | 116 | `https://t.me/Survivefridaybot?startapp=utm_ads_daily` |
| `ads_lunch` | Обеденный перерыв на 5 минут? Как раз хватит, чтобы прожить офисную неделю. Игра «Выжить до пятницы» в Telegram. | 112 | `https://t.me/Survivefridaybot?startapp=utm_ads_lunch` |
| `ads_meetings` | Четыре созвона, отчёт к вечеру и HR с опросом. Сможете продержаться до пятницы? Офисная игра бесплатно, прямо в Telegram. | 121 | `https://t.me/Survivefridaybot?startapp=utm_ads_meetings` |

## Объявления (английский)

| Метка | Текст | Символов | Ссылка |
|---|---|---|---|
| `ads_en_boss` | The Boss sends “got a minute?” at 5:55 PM on Friday. What do you say? An office survival game: 25 decisions until 6 PM. | 119 | `https://t.me/Survivefridaybot?startapp=utm_ads_en_boss` |
| `ads_en_friday` | Can you make it to Friday, 6 PM? A free office game right in Telegram: keep Sanity, Energy, Boss and Team in balance. | 117 | `https://t.me/Survivefridaybot?startapp=utm_ads_en_friday` |
| `ads_en_daily` | A new week every day, the same for everyone. Compare scores with coworkers and see who survives Monday best. | 108 | `https://t.me/Survivefridaybot?startapp=utm_ads_en_daily` |

## Настройки кампании

- **Язык:** русский (английские объявления — отдельной кампанией).
- **Тематики каналов:** работа и карьера, офисный юмор, HR, маркетинг, IT-юмор, развлечения и игры.
- **Каналы:** подборка каналов про офисную жизнь, карьеру и работу — аудитория, которая узнаёт себя в карточках игры.
- **Тест:** 3–4 объявления одновременно с одинаковой ставкой. Через несколько тысяч показов у каждого оставить те, что приводят больше игроков (по `/stats` и `/export`), остальные остановить.
- **Ставка и бюджет:** начать с минимальных в кабинете и поднимать у объявлений, которые приводят игроков. Точные минимумы проверьте в кабинете — сторонние обзоры называют разные цифры.

## Как понять, что реклама работает

- Боту в личку: `/stats` (сегодня), `/yesterday`, `/week` — строка «Откуда» покажет «Telegram (ads_boss) N».
- `/export` — в файле у каждого игрока колонка «Откуда пришёл», на листе «Откуда пришли» — сводка по меткам.
- Смотрите не только на переходы, но и на «доиграли 1 неделю» в воронке: это игроки, которые действительно остались.
