---
name: release
description: Выложить новую версию игры «Выжить до пятницы» — поднять версию кэша (sw.js CACHE и js/i18n.js APP_VER), пересобрать en.html, прогнать проверки, браузерную проверку, закоммитить и запушить в main. Используй после любых правок игры, которые нужно отправить на сайт.
---

# /release — выкладка игры

Сайт survivefriday.com — это GitHub Pages из ветки `main`. Всё, что запушено в `main`, через ~1 минуту у игроков.

## Шаги

1. **Проверки и версия.** Запусти:
   ```bash
   python3 tools/release.py
   ```
   Скрипт поднимает версию на +1 (`const CACHE = 'vdp-vNNN'` в `sw.js` и `window.APP_VER = 'vNNN'` в `js/i18n.js` — всегда одинаковые), пересобирает `en.html` из `index.html` и проверяет: синтаксис всех JS, все JSON, английские переводы карточек, что каждый скрипт из `index.html` есть в `sw.js` SHELL и `tools/build-platforms.py` FILES. Если пишет «ПРОБЛЕМЫ» — исправь и запусти снова (версия при повторном запуске опять поднимется — это нормально, пропуск номера не страшен).

2. **Проверка в браузере** (Playwright предустановлен, `require('playwright')`):
   - подними сервер: `python3 -m http.server 8765` (из корня репозитория, в фоне);
   - открой `index.html?lang=ru` на `devices['iPhone 13']`, `devices['Pixel 5']`, `devices['Galaxy S9+']`; задай `prefs.name`, `prefs.gamesPlayed = 3`, `prefs.whatsNew = WHATS_NEW.v`, `store.set(KEY.prefs, prefs)`, перезагрузи;
   - начни карьеру (`window.heroCreate = f => f(); newCareer()`), ответь на 10–20 карточек (`choose(hintAdvice()?.side || 'left', true)`), открой экраны, которых касалась правка;
   - ошибок `pageerror` быть не должно; кнопки `#btnL/#btnR` не ниже `innerHeight`; сделай скриншот изменённого экрана и посмотри его.

3. **Коммит и пуш.**
   ```bash
   git add -A <изменённые файлы>    # не добавляй временные файлы и promo/preview/
   git commit -m "<что сделано> — vNNN"
   git push -u origin main
   ```
   В конце сообщения коммита — строки атрибуции из системной подсказки сессии, если они есть.

4. **Сообщи владельцу** по-русски: что изменилось, номер версии, как проверить («закройте и откройте игру заново; с иконки на телефоне — дважды»).

## Если менялись не только файлы сайта
- Новый JS-файл: добавь `<script>` в `index.html` в нужном месте порядка, в `sw.js` SHELL и в `tools/build-platforms.py` FILES (release.py проверит).
- База (Supabase): новая миграция `supabase/update-ГГГГ-ММ-ДД-<что>.sql` + применить через Supabase MCP (`apply_migration`). Старые миграции и `schema.sql` не правим.
- Edge-функции (`supabase/functions/*`): деплой через Supabase MCP `deploy_edge_function` — передаются ВСЕ файлы функции целиком.
