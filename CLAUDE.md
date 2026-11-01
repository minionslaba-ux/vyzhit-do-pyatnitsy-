# «Выжить до пятницы» / Survive till Friday — памятка для Claude

Браузерная офисная карточная игра «от выгорания»: 25 решений (свайп влево/вправо) с понедельника 9:00 до пятницы 18:00, четыре шкалы — Кукуха (psyche), Энергия (energy), Босс (boss), Коллеги (colleagues); 0% или 100% — конец недели. Карьера — 3 уровня по 52 недели, 3D-персонаж с потребностями, дети, питомцы, 51 мини-игра «Разминка», неделя дня, офисы, чат, турниры.

- Сайт: **survivefriday.com** — GitHub Pages из ветки `main` (репозиторий minionslaba-ux/vyzhit-do-pyatnitsy-). Всё в `main` через ~1 минуту у игроков.
- Telegram: бот **@Survivefridaybot** (мини-приложение), основная группа игры.
- Бэкенд: Supabase, проект `auequuxfcwdshblqrwbd` (база + Edge Functions на Deno).
- Владелец общается по-русски. Отвечай по-русски, просто и по делу.

## Жёсткие правила
- **Никогда не проси, не храни и не коммить секреты** (токен бота, service_role, ключи оплаты). Владелец добавляет секреты сам в Supabase → Edge Functions → Secrets. В браузерный код — только публичный anon-ключ (`js/config.js`).
- **NPC не выдавать за реальных людей**: у них пометка «🤖 персонаж игры», в счётчиках «в игре» их не считать.
- **Пол не угадывать** по имени. Игрок — на «вы», без родовых форм. Реплики персонажа — с подстановками `{а}`, `{ся}`, `{ла}` (`genderLine()` в `js/voice.js`).
- **Без медицинских обещаний** («лечит выгорание» и т. п.) — «перерыв», «переключиться», «снять стресс в игре».
- Не клонировать чужие игры. Не публиковать почту владельца.
- Оплата (Robokassa) — зона владельца; цены в рублях без его просьбы не менять.
- Все тексты в игре — двуязычные: `L('по-русски', 'in English')`.

## Устройство
- Ванильный JS без сборки, общий глобальный скоуп. **Порядок `<script>` в `index.html` важен.** `en.html` генерируется: `python3 tools/make-en.py` (не править руками).
- Ключевые файлы: `js/engine.js` (данные, уровни, `dataReady`), `js/game.js` (неделя, карточки, `choose`, экраны итогов, `track`), `js/ui-menu.js` (меню, профиль, «Поделиться» + `vkShare`), `js/meta.js` (задания, `addCash`), `js/hero.js` + `js/hero3d.js` + `js/wish.js` (персонаж, потребности `NEEDS`, мультики `playToon`), `js/voice.js` + `js/voice-more.js` (реплики), `js/break.js` + `js/break/b1…b5.js` (мини-игры), `js/pause.js` (серия пауз, «Тяжёлый день», дыхание), `js/hooks.js` (реванш, учебная неделя, золотая карточка, быстрая смена), `js/stories.js`, `js/session.js`, `js/retention.js`, `js/ads.js` (реклама РСЯ), `js/shop.js`, `js/social.js`, `js/guest.js` (`needReg`).
- Данные: `data/pool*.json` (карточки по уровням, `LEVEL_FILES` в engine.js), `data/en/*.json` — переводы по id (карточки без перевода в английскую игру не попадают), `data/bot/*.json` — тексты бота и пушей.
- Шина событий: `bus.on('deck'|'answer'|'weekEnd'|'menu'|'breakEnd', …)` — новые механики лучше вешать на неё, а не вписывать в game.js.
- Высота экрана: `--app-h` (js/i18n.js). В обычном браузере экраны кроме недели прокручиваются всей страницей (`html.docscroll`), в Telegram и PWA — внутри. Неделя — один экран без прокрутки.

## Выкладка — команда `/release`
`python3 tools/release.py` поднимает версию (`CACHE` в `sw.js` = `APP_VER` в `js/i18n.js`), пересобирает en.html и проверяет всё; потом браузерная проверка, коммит, `git push -u origin main`. Подробно — `.claude/skills/release/SKILL.md`. Только проверки: `python3 tools/release.py --check`.
Новый JS-файл → в `index.html`, `sw.js` SHELL и `tools/build-platforms.py` FILES.

## Проверка в браузере
Playwright предустановлен: `python3 -m http.server 8765` + `require('playwright')`, устройства `iPhone 13`, `Pixel 5`, `Galaxy S9+` (320 px — самый узкий). Supabase из песочницы недоступен — сетевые функции проверяй через Supabase MCP.

## Supabase
- Изменения базы — **новой** миграцией `supabase/update-ГГГГ-ММ-ДД-<что>.sql` + `apply_migration`. `schema.sql` и старые миграции не правим (хук не даст).
- Edge Functions (`supabase/functions/*`): `tg-bot` (index.ts + admin.ts + report.ts — команды владельца `/help`, `/stats`, `/push`, `/rpush`, `/news`, `/event`, `/idea`, `/ideas`…), `tg-daily` (ежедневный пост 12:31 МСК + «Разминка дня»), `push-send`, `push-subscribe`, `tg-notify` (сообщение владельцу), `tg-pin`, `robokassa-*`. Деплой — `deploy_edge_function` со **всеми** файлами функции целиком. После деплоя tg-bot — `net.http_get('…/functions/v1/tg-bot?setup=1')`.
- Защищённые вызовы из SQL: `cron_key` из `push_keys`, одноразовые коды в `bot_test_tokens`.

## Идеи владельца из бота
`/idea текст` в боте → таблица `public.dev_ideas` (status new/in_progress/done/skipped/question, reply, commit). Разбор: сделать понятные правки фронтенда, неоднозначное — `question` с вопросом, рискованное (платежи, данные игроков, схема БД, секреты) — `skipped` с причиной; отчёт владельцу — `net.http_post` в `tg-notify` с `cron_key`. Владелец может попросить «посмотри идеи из бота».

## Хуки (`.claude/settings.json`)
После правки: JSON в `data/` проверяется на валидность (+ `tools/check-en.py` для переводов), JS — `node --check`. До правки: блок `schema.sql`, закоммиченных миграций и секретных ключей в браузерном коде.
