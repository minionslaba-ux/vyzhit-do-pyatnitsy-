#!/usr/bin/env python3
"""Запасные значения для color-mix() — для старых встроенных браузеров (WebView Android < 111, iOS < 16.2: ВК, Telegram на старых телефонах).
Такой браузер не понимает color-mix и выбрасывает ВСЁ объявление (например, весь фон кнопки) — кнопка становится невидимой.
Скрипт перед каждым объявлением с color-mix вставляет такое же, где color-mix(in srgb, X …, Y …) заменён на X (первый цвет).
Старый браузер берёт запасное, новый — переопределяет его следующим. Повторный запуск ничего не дублирует.
  python3 tools/css-fallbacks.py            — исправить файлы
  python3 tools/css-fallbacks.py --check    — только проверить (код 1, если есть объявления без запасного)"""
import re, sys, glob

def mix_end(s, i):
    d = 0
    for j in range(i, len(s)):
        if s[j] == '(': d += 1
        elif s[j] == ')':
            d -= 1
            if d == 0: return j
    return -1

def args(inner):
    out, d, cur = [], 0, ''
    for ch in inner:
        if ch == '(': d += 1
        if ch == ')': d -= 1
        if ch == ',' and d == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur); return [a.strip() for a in out]

def fallback(value):
    while 'color-mix(' in value:
        i = value.index('color-mix('); j = mix_end(value, i + len('color-mix'))
        a = args(value[i + len('color-mix('):j])
        first = re.sub(r'\s+\d+(\.\d+)?%$', '', a[1]) if len(a) >= 3 else 'transparent'
        if first == 'currentColor': first = 'currentColor'
        value = value[:i] + first + value[j + 1:]
    return value

# Значение с var() браузер не отбрасывает при разборе — оно «ломается» только при отрисовке и тогда сбрасывается в initial
# (фон кнопки пропадает), а не к предыдущему объявлению. Поэтому: в правиле остаётся запасное значение без color-mix,
# а оригинал переезжает в такое же правило внутри @supports (color: color-mix(in srgb, red, blue)) — его применят только новые браузеры.
SUP = '@supports (color: color-mix(in srgb, red, blue))'
RULE = re.compile(r'([^{}]+)\{([^{}]*color-mix\([^{}]*)\}')

def split_decls(body):
    out, d, cur = [], 0, ''
    for ch in body:
        if ch == '(': d += 1
        if ch == ')': d -= 1
        if ch == ';' and d == 0: out.append(cur); cur = ''
        else: cur += ch
    if cur.strip(): out.append(cur)
    return out

def fix(text):
    res, pos, changed = [], 0, 0
    for m in RULE.finditer(text):
        sel_raw, body = m.group(1), m.group(2)
        if text[:m.start()].rstrip().endswith('{') and SUP in text[max(0, m.start() - 80):m.start()]: continue  # уже внутри @supports
        sel = re.sub(r'/\*.*?\*/', '', sel_raw, flags=re.S).strip()
        if not sel or sel.startswith('@') or re.fullmatch(r'(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*', sel): continue
        decls = split_decls(body)
        keep, mix = [], []
        for dcl in decls:
            if 'color-mix(' in dcl:
                prop, _, val = dcl.partition(':')
                keep.append(f'{prop.rstrip()}: {fallback(val.strip())}'); mix.append(dcl.strip())
            else: keep.append(dcl)
        lead = re.match(r'\s*', body).group(0)
        new_rule = f'{sel_raw}{{{";".join(keep).rstrip()}; }}\n{SUP} {{ {sel} {{ {"; ".join(mix)}; }} }}'
        res.append(text[pos:m.start()]); res.append(new_rule); pos = m.end(); changed += 1
    res.append(text[pos:]); return ''.join(res), changed

files = ['css/style.css'] + sorted(glob.glob('js/break/*.js')) + sorted(glob.glob('js/*.js'))
total = 0
for f in files:
    s = open(f, encoding='utf-8').read()
    if 'color-mix(' not in s: continue
    new, n = fix(s)
    total += n
    if n and '--check' not in sys.argv: open(f, 'w', encoding='utf-8').write(new); print(f'{f}: {n} правил с запасным значением')
    elif n: print(f'{f}: {n} правил без запасного значения')
if '--check' in sys.argv: sys.exit(1 if total else 0)
