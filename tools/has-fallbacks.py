#!/usr/bin/env python3
"""Двойники для правил с :has() в css/style.css — для старых встроенных браузеров (WebView Android < 105, iOS < 15.4).
Такой браузер выбрасывает правило с :has() целиком. После каждого такого правила вставляется копия, где :has(...) заменён
на обычные классы, которые ставит js/app.js («Замена :has()»): html.v-game, html.m-modal, .prof.sel и т. д.
Повторный запуск ничего не дублирует. --check — только проверить (код 1, если есть :has без двойника)."""
import re, sys
MAP = [  # что заменить → на что (порядок важен: длинные раньше)
    ('html.docscroll:has(#game[hidden])', 'html.docscroll:not(.v-game)'),
    ('body:has(#game:not([hidden]))', 'html.v-game body'),
    ('body:has(#menu:not([hidden]))', 'html.v-menu body'),
    ('body:has(#menu[hidden])', 'html:not(.v-menu) body'),
    ('body:has(#profSheet:not([hidden]))', 'html.m-prof body'),
    ('body:has(#modal:not([hidden]))', 'html.m-modal body'),
    ('.app:has(#game:not([hidden]))', 'html.v-game .app'),
    ('.app:has(.end.screen-view:not([hidden]))', 'html.v-end .app'),
    (':has(.live-strip:not([hidden]))', '.live-on'),
    (':has(#dlBar:not([hidden]))', '.dl-on'),
    (':has(.card-tools)', '.has-tools'),
    (':has(input:checked)', '.sel'),
]
SKIP = (':has(input:focus-visible)',)  # только рамка фокуса — без двойника
MARK = '/* без :has */'
p = 'css/style.css'
s = open(p, encoding='utf-8').read()
RULE = re.compile(r'([^{}]*:has\([^{}]*)\{([^{}]*)\}')
out, pos, n, miss = [], 0, 0, []
for m in RULE.finditer(s):
    sel, body = m.group(1), m.group(2)
    after = s[m.end():m.end() + 200]
    if after.lstrip().startswith(MARK): continue
    parts = [x.strip() for x in re.sub(r'/\*.*?\*/', '', sel, flags=re.S).split(',')]
    new = []
    for part in parts:
        if ':has(' not in part: new.append(part); continue
        if any(k in part for k in SKIP): continue
        q = part
        for a, b in MAP: q = q.replace(a, b)
        if ':has(' in q: miss.append(part); continue
        new.append(q)
    if not [x for x in new if x not in parts]: continue
    out.append(s[pos:m.end()]); out.append(f'\n{MARK} {", ".join(new)} {{{body}}}'); pos = m.end(); n += 1
out.append(s[pos:])
if '--check' in sys.argv:
    print(f'без двойника: {n}'); [print('  нет замены:', x) for x in miss]; sys.exit(1 if n else 0)
open(p, 'w', encoding='utf-8').write(''.join(out))
print(f'{p}: +{n} двойников'); [print('  нет замены:', x) for x in miss]
