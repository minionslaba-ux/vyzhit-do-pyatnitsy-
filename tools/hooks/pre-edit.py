#!/usr/bin/env python3
"""Хук Claude Code (PreToolUse: Edit|Write|MultiEdit): не дать сделать опасную правку.
- supabase/schema.sql и уже закоммиченные supabase/update-*.sql не правим: изменения базы — новой датированной миграцией.
- В js/ (код, который уходит в браузер) не должно попасть ничего про service_role / секретные ключи Supabase.
Код выхода 2 + причина в stderr — правка отменяется, Claude видит причину."""
import json, os, re, subprocess, sys

ROOT = os.environ.get('CLAUDE_PROJECT_DIR') or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti = data.get('tool_input') or {}
path = ti.get('file_path') or ''
if not path:
    sys.exit(0)
rel = os.path.relpath(os.path.abspath(path), ROOT)

def block(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)

if rel == 'supabase/schema.sql':
    block('supabase/schema.sql не правим: изменения базы оформляйте новым файлом supabase/update-ГГГГ-ММ-ДД-<что>.sql.')
if re.fullmatch(r'supabase/update-.*\.sql', rel) and os.path.exists(path):
    tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', rel], cwd=ROOT, capture_output=True).returncode == 0
    if tracked:
        block(f'{rel} уже применена и закоммичена — не меняйте её задним числом. Создайте новую миграцию supabase/update-<дата>-<что>.sql.')

new_text = ti.get('content') or ti.get('new_string') or ''
for e in ti.get('edits') or []:
    new_text += '\n' + (e.get('new_string') or '')
if rel.startswith('js/') or rel in ('index.html', 'en.html', 'sw.js'):
    if re.search(r'service_role|SERVICE_ROLE_KEY|sb_secret_', new_text):
        block(f'В {rel} (код уходит в браузер) нельзя писать серверный ключ Supabase (service_role / sb_secret_). В браузере — только публичный anon-ключ из js/config.js.')
sys.exit(0)
