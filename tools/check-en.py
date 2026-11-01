#!/usr/bin/env python3
"""Проверка английского перевода карточек: python3 tools/check-en.py pool_l1a [pool_l1b ...]
data/en/<name>.json — список {id, who, text, left, right[, origin]} для каждой карточки из data/<name>.json
(для chains.json id берётся из card.id; для season_cards — только те, что ещё не переведены, но файл содержит все)."""
import json, re, sys
CYR = re.compile('[А-Яа-яЁё]')
bad = 0
for name in sys.argv[1:]:
    src = json.load(open(f'data/{name}.json'))
    ids = [(x['card']['id'] if 'card' in x else x['id']) for x in src]
    try: en = json.load(open(f'data/en/{name}.json'))
    except Exception as e: print(name, 'cannot read en:', e); bad += 1; continue
    m = {t.get('id'): t for t in en}
    miss = [i for i in ids if i not in m]
    extra = [t.get('id') for t in en if t.get('id') not in set(ids)]
    errs = []
    for t in en:
        for k in ('who', 'text', 'left', 'right'):
            v = t.get(k)
            if not isinstance(v, str) or not v.strip(): errs.append(f"{t.get('id')}: empty {k}")
            elif CYR.search(v): errs.append(f"{t.get('id')}: cyrillic in {k}")
        if 'card' in str(src[:1]) and name == 'chains' and not t.get('origin'): errs.append(f"{t.get('id')}: chains need origin")
        if len(t.get('left', '')) > 60 or len(t.get('right', '')) > 60: errs.append(f"{t.get('id')}: answer longer than 60 chars")
    print(f"{name}: {len(en)}/{len(ids)} translated, missing {len(miss)}, extra {len(extra)}, problems {len(errs)}")
    for e in (miss[:5] + extra[:5] + errs[:10]): print('   ', e)
    bad += bool(miss or extra or errs)
sys.exit(1 if bad else 0)
