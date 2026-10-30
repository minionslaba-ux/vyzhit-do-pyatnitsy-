# Собрать банк вопросов аттестации из частей data/cert/parts/p*.json в data/cert/ru.json и проверить его
# Формат вопроса: {"t": тема, "d": сложность 1–3, "q": вопрос, "a": [верный, неверный, неверный, неверный]}
import json, glob, collections, sys
TOPICS = {'labor', 'law', 'contract', 'tax', 'ved', 'math', 'bio', 'chem', 'med', 'history', 'geo', 'music', 'fashion', 'jobs'}
def check(items, name):
    bad, seen = [], set()
    for i, x in enumerate(items):
        ok = isinstance(x, dict) and x.get('t') in TOPICS and x.get('d') in (1, 2, 3) and isinstance(x.get('q'), str) and 5 < len(x['q']) <= 160 \
            and isinstance(x.get('a'), list) and len(x['a']) == 4 and all(isinstance(a, str) and a.strip() and len(a) <= 70 for a in x['a']) \
            and len({a.strip().lower() for a in x['a']}) == 4
        key = (x.get('q') or '').strip().lower()
        if not ok or key in seen: bad.append(i)
        seen.add(key)
    print(name, len(items), 'bad', len(bad), dict(collections.Counter(x.get('t') for x in items)), dict(collections.Counter(x.get('d') for x in items)))
    return [x for i, x in enumerate(items) if i not in set(bad)]
parts = []
for f in sorted(glob.glob('data/cert/parts/p*.json')):
    parts += json.load(open(f, encoding='utf-8'))
ru = check(parts, 'ru')
json.dump([{k: x[k] for k in ('t', 'd', 'q', 'a')} for x in ru], open('data/cert/ru.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
try:
    en = check(json.load(open('data/cert/en.json', encoding='utf-8')), 'en')
    json.dump([{k: x[k] for k in ('t', 'd', 'q', 'a')} for x in en], open('data/cert/en.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
except FileNotFoundError: print('en.json missing'); sys.exit(1)
