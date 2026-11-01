#!/usr/bin/env python3
"""Проверка файла карточек: python3 tools/check-cards.py pool_l4 [pool_l5 ...]
Формат data/<имя>.json: [{id, phase: Утро|День|Вечер, who, text, answers: {left: {label, effects}, right: {label, effects}}}]
effects — psyche, energy, boss, colleagues: числа, кратные 5, от -15 до 15.
Проверяет: уникальные id, поля, длины, эффекты, у каждого ответа есть и плюс, и минус (выбор — компромисс),
ответы карточки не одинаковые, фазы примерно поровну, нет дублей текста, нет латиницы-кириллицы не к месту.
Если есть data/en/<имя>.json — дополнительно запускает tools/check-en.py."""
import json, os, re, subprocess, sys, collections

KEYS = ('psyche', 'energy', 'boss', 'colleagues')
bad_total = 0
for name in sys.argv[1:]:
    path = f'data/{name}.json'
    errs = []
    try:
        cards = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        print(f'{name}: не читается: {e}'); bad_total += 1; continue
    ids, texts = collections.Counter(), collections.Counter()
    phases = collections.Counter()
    for c in cards:
        cid = c.get('id', '?')
        ids[cid] += 1
        for k in ('id', 'phase', 'who', 'text'):
            if not isinstance(c.get(k), str) or not c[k].strip():
                errs.append(f'{cid}: нет поля {k}')
        if c.get('phase') not in ('Утро', 'День', 'Вечер'):
            errs.append(f'{cid}: phase должна быть Утро/День/Вечер')
        phases[c.get('phase')] += 1
        t = c.get('text', '')
        texts[t.strip().lower()] += 1
        if not (40 <= len(t) <= 260):
            errs.append(f'{cid}: длина текста {len(t)} (нужно 40–260)')
        if len(c.get('who', '')) > 28:
            errs.append(f'{cid}: who длиннее 28')
        a = c.get('answers') or {}
        sigs = []
        for side in ('left', 'right'):
            ans = a.get(side) or {}
            lab, eff = ans.get('label', ''), ans.get('effects') or {}
            if not lab or len(lab) > 42:
                errs.append(f'{cid}/{side}: label пустой или длиннее 42')
            if set(eff) != set(KEYS):
                errs.append(f'{cid}/{side}: effects должны быть ровно {KEYS}')
                continue
            vals = [eff[k] for k in KEYS]
            if any((not isinstance(v, int)) or v % 5 or v < -15 or v > 15 for v in vals):
                errs.append(f'{cid}/{side}: эффекты кратны 5 и в пределах −15…15 ({vals})')
            if not any(v > 0 for v in vals) or not any(v < 0 for v in vals):
                errs.append(f'{cid}/{side}: у ответа должен быть и плюс, и минус ({vals})')
            sigs.append(tuple(vals))
        if len(sigs) == 2 and sigs[0] == sigs[1]:
            errs.append(f'{cid}: у ответов одинаковые эффекты')
    for i, n in ids.items():
        if n > 1: errs.append(f'дубль id {i}')
    for t, n in texts.items():
        if n > 1: errs.append(f'дубль текста: {t[:60]}')
    if cards:
        lo, hi = min(phases.values()), max(phases.values())
        if hi - lo > len(cards) * 0.1:
            errs.append(f'фазы неравномерно: {dict(phases)}')
    print(f'{name}: карточек {len(cards)}, фазы {dict(phases)}, проблем {len(errs)}')
    for e in errs[:15]: print('   ', e)
    if os.path.exists(f'data/en/{name}.json'):
        r = subprocess.run([sys.executable, 'tools/check-en.py', name], capture_output=True, text=True)
        print('   ' + r.stdout.strip().replace('\n', '\n   '))
        if r.returncode: errs.append('en')
    bad_total += bool(errs)
sys.exit(1 if bad_total else 0)
