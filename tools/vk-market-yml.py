#!/usr/bin/env python3
"""Файл товаров для ВКонтакте: promo/vk/market.yml (YML). ВК загружает его по ссылке https://survivefriday.com/promo/vk/market.yml.
Цены берутся из функции оплаты — единственного источника цен: supabase/functions/robokassa-pay/index.ts (TIERS и PRODUCTS),
поэтому файл всегда совпадает с тем, что реально спишет Робокасса. Запускается из tools/release.py при каждой выкладке.
  python3 tools/vk-market-yml.py          — пересобрать файл
  python3 tools/vk-market-yml.py --check  — только проверить, что файл актуален (код выхода 1, если нет)
Картинки — promo/vk/market/<id>.png (tools/vk-market.js); цены на картинках пересоберите тем же скриптом, если они поменялись."""
import os, re, sys
from xml.sax.saxutils import escape as x

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAY = open(os.path.join(ROOT, 'supabase/functions/robokassa-pay/index.ts'), encoding='utf-8').read()
TIERS = [tuple(map(int, t)) for t in re.findall(r'\[(\d+),\s*(\d+)\]', re.search(r'const TIERS = \[(.*?)\];', PAY).group(1))]
PROD = {m[0]: (int(m[1]), int(m[2])) for m in re.findall(r"(\w+): \{ ue: (\d+), rub: (\d+)", PAY)}
per = lambda n: [p for f, p in TIERS if n >= f][-1]
S = 'https://survivefriday.com/'
FOOT = 'Цифровой товар: начисляется на ваш аккаунт в игре сразу после оплаты. Оплата на сайте survivefriday.com через Робокассу.'
BON = 'Первое пополнение — +50% у.е. в подарок.'
USE = 'У.е. тратятся в игре: предметы в сумку, подсказки, «Мощь», курсы и покупки для персонажа, редкие питомцы, «Без рекламы».'

def ue(n, extra=''):
    p = per(n); sk = round(100 - p)
    return (f'ue-{n}', 1, f'{n} у.е. — игровая валюта', n * p, str(n),
            f'{n} у.е. на счёт карьеры ({p} ₽ за 1 у.е.{f", скидка {sk}%" if sk else ""}).{extra} {USE} {BON} {FOOT}')

st_ue, st_rub = PROD['starter']; cf_ue, cf_rub = PROD['coffee']
ITEMS = [
    ('starter', 2, 'Стартовый набор', st_rub, 'starter', f'Лучший старт для новой карьеры: {st_ue} у.е. на счёт, купон на премиум-тему оформления на выбор, купон на редкого питомца и 3 бесплатные подсказки. Разовое предложение: один раз на аккаунт, со 2-й недели карьеры, если вы ещё ничего не покупали. {FOOT}'),
    ue(25, ' Самый частый выбор.'), ue(10), ue(50), ue(100, ' Самая выгодная цена.'),
    ('coffee', 2, 'Кофе разработчикам', cf_rub, 'coffee', f'Скажите спасибо команде игры: постоянный значок «☕ Меценат» в профиле (со счётчиком покупок) и {cf_ue} у.е. на счёт карьеры. Можно покупать повторно. {FOOT}'),
]
out = ['<?xml version="1.0" encoding="UTF-8"?>', '<yml_catalog date="2026-11-02T12:00:00+03:00">', '<shop>', '<name>Выжить до пятницы</name>', '<company>Выжить до пятницы</company>',
       f'<url>{S}</url>', '<currencies><currency id="RUR" rate="1"/></currencies>',
       '<categories><category id="1">Игровая валюта</category><category id="2">Наборы</category></categories>', '<offers>']
for id_, cat, name, price, buy, desc in ITEMS:
    out.append(f'<offer id="{id_}" available="true"><url>{x(S + "?buy=" + buy + "&utm_source=vk_market")}</url><price>{price}</price><currencyId>RUR</currencyId>'
               f'<categoryId>{cat}</categoryId><picture>{S}promo/vk/market/{id_}.png?v=2</picture><name>{x(name)}</name><description>{x(desc)}</description></offer>')
out += ['</offers>', '</shop>', '</yml_catalog>']
text = '\n'.join(out) + '\n'
path = os.path.join(ROOT, 'promo/vk/market.yml')
old = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
if '--check' in sys.argv:
    if old != text: print('promo/vk/market.yml устарел — цены в robokassa-pay поменялись: запустите python3 tools/vk-market-yml.py'); sys.exit(1)
    print('market.yml актуален'); sys.exit(0)
if old != text: open(path, 'w', encoding='utf-8').write(text); print('market.yml обновлён')
