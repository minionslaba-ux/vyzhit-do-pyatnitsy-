#!/usr/bin/env python3
"""Проверка контента психолога Миры: python3 tools/check-psy.py файл.json [...]
Тип файла определяется сам:
  советы — [{id, cat, ru, en}]                  (ru/en 50–280 символов)
  тесты  — [{id, cat, ru, en, q: [3 × {ru, en, a: [3 × {ru, en, s: 0|1|2}]}], r: [3 × {ru, en}]}]
           ru/en — название теста; s — «напряжение» ответа (0 — всё хорошо, 2 — тяжело);
           r[0] — итог при сумме 0–2, r[1] — 3–4, r[2] — 5–6 (r — 80–420 символов, с конкретным советом).
Проверяет поля, длины, категории, уникальность id и текстов (в том числе между всеми файлами в одном запуске),
латиницу в ru и кириллицу в en, запретные «медицинские» слова, обращение к игроку на «ты»."""
import json, re, sys, collections

CATS = {
    # ситуации игры
    'fired', 'tired', 'stress', 'streak', 'boss', 'team', 'late', 'session', 'win', 'monday', 'friday',
    # общие темы
    'breaks', 'sleep', 'boundaries', 'workload', 'movement', 'mind', 'social', 'rest', 'help', 'focus',
    'remote', 'digital', 'selfkind', 'keep',
}
BAD_RU = re.compile(r'лечит|вылеч|излеч|диагноз[^а-я]*(?:у вас|ставлю)|таблетк|антидепрессант|препарат|лекарств|витамин|бад\b|алкогол|вино\b|пиво|депресси[яюи] у вас|у вас депресс|гарантир', re.I)
BAD_EN = re.compile(r'\bcures?\b|\bheal(?:s|ed)? (?:your )?burnout|diagnos(?:e|is) (?:you|of you)|\bpills?\b|antidepressant|medication|\bdrugs?\b|vitamin|supplement|alcohol|\bwine\b|\bbeer\b|guarantee', re.I)
TY = re.compile(r'(?<![а-яё])(?:ты|тебя|тебе|тобой|твой|твоя|твоё|твои|твоего|твоей|твоих)(?![а-яё])', re.I)
LAT = re.compile(r'[A-Za-z]{2,}')
CYR = re.compile(r'[А-Яа-яЁё]')

errs, seen_id, seen_txt = [], set(), collections.Counter()


def text(where, ru, en, lo, hi):
    if not isinstance(ru, str) or not isinstance(en, str) or not ru.strip() or not en.strip():
        errs.append(f'{where}: нет ru/en'); return
    if not (lo <= len(ru) <= hi): errs.append(f'{where}: длина ru {len(ru)} (нужно {lo}–{hi})')
    if not (lo * 0.6 <= len(en) <= hi * 1.25): errs.append(f'{where}: длина en {len(en)}')
    if LAT.search(re.sub(r'\b(?:OK|IT|HR|PDF|CRM|KPI|Wi-Fi|e-mail)\b', '', ru)): errs.append(f'{where}: латиница в ru: {LAT.search(ru).group()}')
    if CYR.search(en): errs.append(f'{where}: кириллица в en')
    if BAD_RU.search(ru): errs.append(f'{where}: запретное в ru «{BAD_RU.search(ru).group()}»')
    if BAD_EN.search(en): errs.append(f'{where}: запретное в en «{BAD_EN.search(en).group()}»')
    ru_out = re.sub(r'«[^»]*»', '', ru)  # в цитатах («Думаю о тебе») «ты» можно
    if TY.search(ru_out): errs.append(f'{where}: обращение на «ты» («{TY.search(ru_out).group()}») — к игроку только на «вы»')


def norm(s): return re.sub(r'[^а-яёa-z]+', ' ', s.lower()).strip()


for path in sys.argv[1:]:
    before = len(errs)
    try:
        data = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        errs.append(f'{path}: не читается: {e}'); continue
    if not isinstance(data, list) or not data:
        errs.append(f'{path}: нужен непустой список'); continue
    kind = 'tests' if 'q' in data[0] else 'tips'
    cats = collections.Counter()
    for it in data:
        i = it.get('id', '?')
        if not isinstance(i, str) or not i: errs.append(f'{path}: элемент без id')
        if i in seen_id: errs.append(f'{i}: дубль id')
        seen_id.add(i)
        c = it.get('cat'); cats[c] += 1
        if c not in CATS: errs.append(f'{i}: неизвестная cat «{c}»')
        if kind == 'tips':
            text(i, it.get('ru'), it.get('en'), 50, 280)
            seen_txt[norm(it.get('ru', ''))] += 1
        else:
            text(f'{i}/title', it.get('ru'), it.get('en'), 6, 70)
            q = it.get('q') or []
            if len(q) != 3: errs.append(f'{i}: нужно ровно 3 вопроса')
            for qi, qq in enumerate(q):
                text(f'{i}/q{qi}', qq.get('ru'), qq.get('en'), 12, 160)
                a = qq.get('a') or []
                if len(a) != 3: errs.append(f'{i}/q{qi}: нужно ровно 3 ответа')
                if sorted(x.get('s') for x in a) != [0, 1, 2]: errs.append(f'{i}/q{qi}: у ответов s должны быть 0, 1 и 2')
                for ai, x in enumerate(a): text(f'{i}/q{qi}/a{ai}', x.get('ru'), x.get('en'), 2, 90)
            r = it.get('r') or []
            if len(r) != 3: errs.append(f'{i}: нужно ровно 3 итога r')
            for ri, x in enumerate(r): text(f'{i}/r{ri}', x.get('ru'), x.get('en'), 80, 420)
            seen_txt[norm(it.get('ru', '')) + '|' + norm((q[0].get('ru', '') if q else ''))] += 1
    print(f'{path}: {kind}, {len(data)} шт., категории {dict(sorted(cats.items()))}, проблем {len(errs) - before}')

dups = [t for t, n in seen_txt.items() if n > 1]
for t in dups[:20]: errs.append(f'дубль текста: {t[:70]}')
for e in errs[:40]: print('   ', e)
if len(errs) > 40: print(f'    … и ещё {len(errs) - 40}')
print('Всего проблем:', len(errs))
sys.exit(1 if errs else 0)
