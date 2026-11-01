#!/usr/bin/env python3
"""Хук Claude Code (PostToolUse: Edit|Write|MultiEdit): после правки файла сразу проверить его.
- data/**/*.json — JSON читается; если это перевод data/en/<имя>.json карточек — tools/check-en.py <имя>
- js/**/*.js, sw.js — node --check
Код выхода 2 + текст в stderr — Claude увидит ошибку и исправит."""
import json, os, subprocess, sys

ROOT = os.environ.get('CLAUDE_PROJECT_DIR') or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
path = (data.get('tool_input') or {}).get('file_path') or ''
if not path:
    sys.exit(0)
rel = os.path.relpath(os.path.abspath(path), ROOT)
if rel.startswith('..') or not os.path.exists(path):
    sys.exit(0)

def fail(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)

if rel.endswith('.json') and (rel.startswith('data/') or rel == 'manifest.json'):
    try:
        json.load(open(path, encoding='utf-8'))
    except Exception as e:
        fail(f'Сломан JSON в {rel}: {e}. Игра не загрузит этот файл — исправьте.')
    parts = rel.split('/')
    if len(parts) == 3 and parts[1] == 'en':
        name = os.path.splitext(parts[2])[0]
        src = os.path.join(ROOT, 'data', name + '.json')
        if os.path.exists(src):
            try:
                d = json.load(open(src, encoding='utf-8'))
                is_cards = isinstance(d, list) and d and isinstance(d[0], dict) and ('answers' in d[0] or 'card' in d[0])
            except Exception:
                is_cards = False
            if is_cards:
                r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools/check-en.py'), name], capture_output=True, text=True, cwd=ROOT)
                if r.returncode:
                    fail(f'Перевод {rel} не прошёл проверку:\n{r.stdout.strip()}')
elif rel.endswith('.js') and (rel.startswith('js/') or rel == 'sw.js'):
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    if r.returncode:
        fail(f'Синтаксическая ошибка в {rel}:\n{r.stderr.strip()[-800:]}')
sys.exit(0)
