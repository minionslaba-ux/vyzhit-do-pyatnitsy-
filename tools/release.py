#!/usr/bin/env python3
"""Проверка и выкладка игры.

  python3 tools/release.py --check   — только проверки (их же запускает GitHub Actions):
        синтаксис всех js/*.js и js/break/*.js (node --check), все data/**/*.json читаются,
        переводы data/en/*.json полные (tools/check-en.py), скрипты из index.html есть в sw.js SHELL
        и tools/build-platforms.py FILES, все файлы из этих списков существуют, en.html совпадает с index.html.
  python3 tools/release.py           — то же + поднять версию (CACHE в sw.js и APP_VER в js/i18n.js на +1)
        и пересобрать en.html (tools/make-en.py). Коммит и пуш делает человек или Claude (см. .claude/skills/release).
Выход с кодом 1, если что-то не так.
"""
import glob, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
problems = []


def node_check():
    files = sorted(glob.glob('js/*.js') + glob.glob('js/break/*.js') + ['sw.js'])
    for f in files:
        r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
        if r.returncode:
            problems.append(f'JS syntax: {f}: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "error"}')
    return len(files)


def json_check():
    files = sorted(glob.glob('data/**/*.json', recursive=True) + ['manifest.json'])
    for f in files:
        try:
            with open(f, encoding='utf-8') as fh:
                json.load(fh)
        except Exception as e:
            problems.append(f'JSON: {f}: {e}')
    return len(files)


def en_check():
    names = [os.path.splitext(os.path.basename(p))[0] for p in glob.glob('data/en/*.json')]
    # переводы карточек (у которых есть русский источник с тем же именем и полем answers / card)
    cards = []
    for n in names:
        src = f'data/{n}.json'
        if not os.path.exists(src):
            continue
        try:
            d = json.load(open(src, encoding='utf-8'))
        except Exception:
            continue
        if isinstance(d, list) and d and isinstance(d[0], dict) and ('answers' in d[0] or 'card' in d[0]):
            cards.append(n)
    if cards:
        r = subprocess.run([sys.executable, 'tools/check-en.py', *cards], capture_output=True, text=True)
        if r.returncode:
            problems.append('English translations:\n' + r.stdout.strip())
    return len(cards)


def lists_check():
    idx = open('index.html', encoding='utf-8').read()
    en = open('en.html', encoding='utf-8').read()
    sw = open('sw.js', encoding='utf-8').read()
    bp = open('tools/build-platforms.py', encoding='utf-8').read()
    scripts = [s for s in re.findall(r'<script src="([^"]+)"', idx) if not s.startswith('http')]
    en_scripts = [s for s in re.findall(r'<script src="([^"]+)"', en) if not s.startswith('http')]
    shell = re.findall(r"'([^']+\.(?:js|json|html|css|png|svg|webp))'", sw)
    files = re.findall(r"'([^']+\.(?:js|json|html|css|png|svg|LICENSE))'", bp)
    for s in scripts:
        if s not in shell:
            problems.append(f'sw.js SHELL: нет {s} (офлайн-режим его не закэширует)')
        if s not in files:
            problems.append(f'tools/build-platforms.py FILES: нет {s} (архив для каталогов игр без него сломается)')
    if set(scripts) != set(en_scripts):
        problems.append(f'en.html отличается от index.html по скриптам — запустите python3 tools/make-en.py ({set(scripts) ^ set(en_scripts)})')
    for p in sorted(set(scripts + shell + files)):
        if p in ('./',) or p.startswith('http'):
            continue
        if not os.path.exists(p):
            problems.append(f'файла нет на диске: {p}')
    return len(scripts)


def version():
    sw = open('sw.js', encoding='utf-8').read()
    i18n = open('js/i18n.js', encoding='utf-8').read()
    a = re.search(r"const CACHE = 'vdp-v(\d+)'", sw)
    b = re.search(r"window\.APP_VER = 'v(\d+)'", i18n)
    if not a or not b:
        problems.append('не нашёл версию: CACHE в sw.js или APP_VER в js/i18n.js')
        return None
    if a.group(1) != b.group(1):
        problems.append(f'версии расходятся: sw.js v{a.group(1)}, js/i18n.js v{b.group(1)}')
    return int(a.group(1))


def bump(v):
    n = v + 1
    for f, pat, rep in [('sw.js', r"const CACHE = 'vdp-v\d+'", f"const CACHE = 'vdp-v{n}'"),
                        ('js/i18n.js', r"window\.APP_VER = 'v\d+'", f"window.APP_VER = 'v{n}'")]:
        s = open(f, encoding='utf-8').read()
        open(f, 'w', encoding='utf-8').write(re.sub(pat, rep, s, count=1))
    return n


def main():
    check_only = '--check' in sys.argv
    v = version()
    if not check_only and v is not None and not problems:
        v = bump(v)
        subprocess.run([sys.executable, 'tools/make-en.py'], check=False, capture_output=True)
    js, js_ok = node_check(), None
    nj = json_check()
    ne = en_check()
    ns = lists_check()
    print(f'Версия: v{v} · JS-файлов: {js} · JSON: {nj} · переводов карточек: {ne} · скриптов в index.html: {ns}')
    if problems:
        print('\nПРОБЛЕМЫ:')
        for p in problems:
            print(' -', p)
        sys.exit(1)
    print('Всё в порядке.' + ('' if check_only else f' Новая версия v{v}: закоммитьте и запушьте.'))


if __name__ == '__main__':
    main()
