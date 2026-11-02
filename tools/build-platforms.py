#!/usr/bin/env python3
"""Архивы для каталогов браузерных игр: dist/itch.zip и dist/yandex.zip.

Запуск: python3 tools/build-platforms.py
- itch.io: загрузите dist/itch.zip как HTML-проект (Kind of project: HTML, «This file will be played in the browser»).
- Яндекс Игры: загрузите dist/yandex.zip в консоли разработчика. В сборку добавлены SDK (/sdk.js) и js/platform-yandex.js.
"""
import os, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['index.html', 'css/style.css', 'manifest.json', 'sw.js', 'igra-pro-ofis.html',
         'js/i18n.js', 'js/config.js', 'js/cards.js', 'js/content.js', 'js/moder.js', 'js/engine.js', 'js/board.js', 'js/audio.js', 'js/fx.js', 'js/faces.js', 'js/intro.js',
         'js/game.js', 'js/stories.js', 'js/ui-menu.js', 'js/npc.js', 'js/social.js', 'js/officecase.js', 'data/office_cases.json', 'js/retention.js', 'js/meta.js', 'js/hero3d.js', 'js/pets3d.js', 'js/hero.js', 'js/anketa.js', 'js/wish.js', 'js/timer.js', 'js/voice.js', 'js/voice-more.js', 'js/cert.js', 'js/guest.js', 'js/pets.js', 'js/ads.js', 'js/push.js', 'js/streak.js', 'js/session.js', 'js/break.js', 'js/pause.js', 'js/hooks.js', 'js/mole.js', 'js/psy.js', 'js/vk-mini.js', 'data/tips.json', 'data/psy/tips_1.json', 'data/psy/tips_2.json', 'data/psy/tips_3.json', 'data/psy/tips_4.json', 'data/psy/tips_5.json', 'data/psy/tips_6.json', 'data/psy/tests_1.json', 'data/psy/tests_2.json', 'data/psy/tests_3.json', 'data/psy/tests_4.json', 'data/psy/tests_5.json', 'data/psy/tests_6.json', 'data/psy/tests_7.json', 'data/psy/tests_8.json', 'data/psy/tests_9.json', 'data/psy/tests_10.json', 'js/quotes.js', 'data/quotes.json', 'js/break/b1.js', 'js/break/b2.js', 'js/break/b3.js', 'js/break/b4.js', 'js/break/b5.js', 'js/shop.js', 'js/topup.js', 'js/vendor/three.module.min.js', 'js/vendor/three.LICENSE', 'js/login.js', 'js/app.js',
         'data/pool.json', 'data/pool2.json', 'data/pool3.json', 'data/pool_l1a.json', 'data/pool_l1b.json', 'data/pool_l1c.json', 'data/pool_l1d.json', 'data/pool_l2a.json', 'data/pool_l3a.json', 'data/pool_l3b.json', 'data/pool_l3c.json', 'data/pool_l4.json', 'data/pool_l5.json', 'data/pool_l6.json', 'data/pool_l7.json', 'data/pool_l8.json', 'data/pool_l9.json', 'data/pool_l10.json', 'data/pool_l11.json', 'data/pool_l12.json', 'data/pool_l13.json', 'data/events.json', 'data/quiz.json', 'data/chains.json', 'data/interview.json', 'data/cast.json', 'data/stories.json', 'data/season_cards.json', 'data/en/season_cards.json', 'data/cert/ru.json', 'data/cert/en.json']
DIRS = ['icons', 'packs', 'data/en']  # data/en — все английские переводы: без перевода карточка в английскую игру не попадает


def files():
    out = list(FILES)
    for d in DIRS:
        for name in sorted(os.listdir(os.path.join(ROOT, d))):
            out.append(f'{d}/{name}')
    return list(dict.fromkeys(out))  # без дублей (часть файлов есть и в FILES, и в папке из DIRS)


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


def no_rtb(html):
    # Рекламная сеть Яндекса — только на сайте: в каталогах игр своя реклама, чужой код запрещён
    start = html.index('<!-- Yandex.RTB')
    end = html.index('</head>', start)
    return html[:start] + html[end:]


def yandex(html):
    # SDK — до скриптов игры; Telegram-скрипт каталогу не нужен
    start = html.index('<script>\n  // Скрипт Telegram')
    end = html.index('</script>', start) + len('</script>')
    return no_rtb(html[:start] + '<script src="/sdk.js"></script>\n<script src="js/platform-yandex.js"></script>' + html[end:])


build('itch.zip', no_rtb)
build('yandex.zip', yandex, extra=['js/platform-yandex.js'])
