#!/usr/bin/env python3
"""Архивы для каталогов браузерных игр: dist/itch.zip и dist/yandex.zip.

Запуск: python3 tools/build-platforms.py
- itch.io: загрузите dist/itch.zip как HTML-проект (Kind of project: HTML, «This file will be played in the browser»).
- Яндекс Игры: загрузите dist/yandex.zip в консоли разработчика. В сборку добавлены SDK (/sdk.js) и js/platform-yandex.js.
"""
import os, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['index.html', 'css/style.css', 'manifest.json', 'sw.js', 'igra-pro-ofis.html',
         'js/config.js', 'js/cards.js', 'js/content.js', 'js/engine.js', 'js/board.js', 'js/audio.js',
         'js/game.js', 'js/ui-menu.js', 'js/app.js',
         'data/pool.json', 'data/quiz.json', 'data/chains.json', 'data/interview.json']
DIRS = ['icons', 'packs']


def files():
    out = list(FILES)
    for d in DIRS:
        for name in sorted(os.listdir(os.path.join(ROOT, d))):
            out.append(f'{d}/{name}')
    return out


def build(name, patch_index=None, extra=()):
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    path = os.path.join(ROOT, 'dist', name)
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in files() + list(extra):
            data = open(os.path.join(ROOT, f), 'rb').read()
            if f == 'index.html' and patch_index:
                data = patch_index(data.decode()).encode()
            z.writestr(f, data)
    print(f'{path}: {os.path.getsize(path) // 1024} КБ')


def yandex(html):
    # SDK — до скриптов игры; Telegram-скрипт каталогу не нужен
    tg = '<script src="https://telegram.org/js/telegram-web-app.js"></script>'
    assert tg in html
    return html.replace(tg, '<script src="/sdk.js"></script>\n<script src="js/platform-yandex.js"></script>')


build('itch.zip')
build('yandex.zip', yandex, extra=['js/platform-yandex.js'])
