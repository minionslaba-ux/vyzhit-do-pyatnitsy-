#!/usr/bin/env python3
"""Раскладывает контент Миры по пачкам для игры: python3 tools/psy-split.py ПАПКА_С_ИСХОДНИКАМИ
Берёт ПАПКА/tips_*.json и ПАПКА/tests_*.json (формат — tools/check-psy.py) и пишет
data/psy/tips_1…6.json и data/psy/tests_1…5.json. Темы перемешиваются по кругу, чтобы в каждой пачке были все категории:
игра грузит одну случайную пачку (js/psy.js, PSY_TIP_CHUNKS / PSY_TEST_CHUNKS), бот — тоже (tg-bot/admin.ts, PSY_CHUNKS)."""
import glob, json, os, random, sys, collections

src = sys.argv[1] if len(sys.argv) > 1 else '/home/user/psy-raw'
OUT = 'data/psy'
PLAN = {'tips': 6, 'tests': 5}
os.makedirs(OUT, exist_ok=True)
for kind, n in PLAN.items():
    items = []
    for f in sorted(glob.glob(f'{src}/{kind}_*.json')):
        items += json.load(open(f, encoding='utf-8'))
    if not items:
        print(f'{kind}: нет исходников в {src}'); continue
    by = collections.defaultdict(list)
    for it in items: by[it['cat']].append(it)
    rnd = random.Random(42)
    for v in by.values(): rnd.shuffle(v)
    chunks = [[] for _ in range(n)]
    i = 0
    for cat in sorted(by):
        for it in by[cat]:
            chunks[i % n].append(it); i += 1
    for k, ch in enumerate(chunks, 1):
        rnd.shuffle(ch)
        with open(f'{OUT}/{kind}_{k}.json', 'w', encoding='utf-8') as fh:
            json.dump(ch, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'{kind}: {len(items)} → {n} пачек по ~{len(items) // n}, категорий {len(by)}')
