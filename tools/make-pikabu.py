#!/usr/bin/env python3
"""Страница игры для Пикабу Игр: pikabu/index.html (https://survivefriday.com/pikabu/ — «Ссылка на игру» в Студии Пикабу).

Собирается из index.html, не править руками. Запуск: python3 tools/make-pikabu.py (делает tools/release.py).
- <base href="/">: скрипты, стили и данные берутся из корня сайта — та же игра, обновляется вместе с ним;
- без SEO-разметки, счётчика Метрики, рекламы РСЯ, офлайн-режима (service worker), скрипта Telegram и проверки старого браузера;
- без нашего сервера (SUPABASE_CONFIG пустой): чат, рейтинг, турниры, вход и оплата на сайте сами скрыты;
- язык — русский; js/platform-pikabu.js — SDK Пикабу (реклама, облачные сохранения), скрытие ссылок.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()


def cut(html, start, end, repl=''):
    i = html.index(start)
    j = html.index(end, i) + len(end)
    return html[:i] + repl + html[j:]


head_keep = src[src.index('<link rel="preconnect"'):src.index('<!-- Yandex.RTB')]
head = ('<!doctype html>\n<html lang="ru" translate="no" data-pikabu="1">\n<head>\n<meta charset="utf-8">\n<base href="/">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">\n'
        '<meta name="theme-color" content="#07070d">\n<meta name="robots" content="noindex, nofollow">\n'
        '<link rel="icon" href="icons/favicon-96.png" type="image/png" sizes="96x96">\n'
        '<title>Выжить до пятницы</title>\n'
        + head_keep +
        '<!-- сгенерировано tools/make-pikabu.py из index.html — не править -->\n'
        '<script>window.PIKABU = 1; try { localStorage.setItem("vdp-lang", "ru"); } catch (e) {}</script>\n'
        '<script src="js/platform-pikabu.js"></script>\n</head>\n')

body = src[src.index('<body'):]
body = re.sub(r'<noscript>.*?</noscript>\n?', '', body, flags=re.S)
body = cut(body, '<script>\n  // Скрипт Telegram', '</script>\n')
body = cut(body, '<script>/* ранняя регистрация офлайн-режима', '</script>\n')
# без нашего сервера: board.online = false (js/board.js читает SUPABASE_CONFIG при загрузке)
cfg = '<script src="js/config.js"></script>\n'
assert cfg in body, 'нет js/config.js'
# адрес сервера и публичный ключ — только для проверки покупок Пикабу (функция pikabu-verify), остальной сервер выключен
body = body.replace(cfg, cfg + '<script>window.PK_SB = { url: SUPABASE_CONFIG.url, key: SUPABASE_CONFIG.anonKey }; SUPABASE_CONFIG.url = ""; SUPABASE_CONFIG.anonKey = "";</script>\n', 1)

out = head + body
for bad in ('mc.yandex', 'yandex.ru/ads', 'telegram-web-app.js', 'serviceWorker.register', 'legacyGate'):
    if bad in out:
        sys.exit(f'make-pikabu: в странице осталось «{bad}»')
os.makedirs(os.path.join(ROOT, 'pikabu'), exist_ok=True)
open(os.path.join(ROOT, 'pikabu', 'index.html'), 'w', encoding='utf-8').write(out)
print(f'pikabu/index.html: {len(out) // 1024} КБ')
