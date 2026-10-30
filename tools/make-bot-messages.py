#!/usr/bin/env python3
"""Сообщения бота для групп Telegram: data/bot/*.json → supabase/functions/tg-daily/messages.ts.
recruit_ru.json — 250 текстов «позовите коллег» (массив строк);
play_ru.json — 250 текстов «играйте сегодня»: {"monday": [...], "friday": [...], "saturday": [...], "any": [...]}.
Запуск: python3 tools/make-bot-messages.py — затем выложить функцию tg-daily."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
recruit = json.loads((root / 'data/bot/recruit_ru.json').read_text(encoding='utf-8'))
play = json.loads((root / 'data/bot/play_ru.json').read_text(encoding='utf-8'))
assert len(set(recruit)) == len(recruit), 'повторы в recruit'
allp = [t for k in ('monday', 'friday', 'saturday', 'any') for t in play[k]]
assert len(set(allp)) == len(allp), 'повторы в play'
out = ('// Сгенерировано tools/make-bot-messages.py из data/bot/*.json — правьте JSON, а не этот файл.\n'
       f'export const RECRUIT_RU: string[] = {json.dumps(recruit, ensure_ascii=False, indent=0)};\n'
       f'export const PLAY_RU: Record<string, string[]> = {json.dumps(play, ensure_ascii=False, indent=0)};\n')
(root / 'supabase/functions/tg-daily/messages.ts').write_text(out, encoding='utf-8')
print('recruit', len(recruit), '| play', {k: len(v) for k, v in play.items()})
