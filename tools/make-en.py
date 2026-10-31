#!/usr/bin/env python3
"""Собрать en.html — английскую страницу игры для поисковиков: тот же index.html, но с английскими тегами,
<html lang="en">, английским текстом в разметке и языком игры «en». Запускать после каждого изменения index.html:
    python3 tools/make-en.py
"""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
s = (root / 'index.html').read_text()
a, b = s.index('<title>'), s.index('</script>', s.index('application/ld+json')) + len('</script>')
ld = [{"@context": "https://schema.org", "@type": "VideoGame", "name": "Survive till Friday", "alternateName": ["Выжить до пятницы", "Survive till Friday — office game"],
       "url": "https://survivefriday.com/en.html", "image": "https://survivefriday.com/icons/og-en-1200x630.jpg", "screenshot": "https://survivefriday.com/icons/og-en-1200x630.jpg",
       "description": "A free office survival game in your browser, no sign-up: swipe through decisions, keep your Sanity, Energy, Boss and Team in balance and make it to Friday, 6 p.m. A 52-week career, a Daily Week, department leaderboards, office chats and tournaments.",
       "genre": ["Card game", "Simulation", "Casual"], "keywords": "office game, work simulator, office survival game, browser game, free online game, no sign-up, swipe game, Reigns-like, game for coworkers",
       "gamePlatform": ["Web browser", "Android", "iOS"], "applicationCategory": "GameApplication", "operatingSystem": "Any", "playMode": ["SinglePlayer", "MultiPlayer"],
       "inLanguage": ["en", "ru"], "author": {"@type": "Person", "name": "Konstantin Moiseenko", "alternateName": "Константин Моисеенко"},
       "publisher": {"@type": "Person", "name": "Konstantin Moiseenko"}, "isAccessibleForFree": True,
       "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}},
      {"@context": "https://schema.org", "@type": "WebSite", "name": "Survive till Friday", "alternateName": "Выжить до пятницы", "url": "https://survivefriday.com/en.html", "inLanguage": "en"}]
head = '\n'.join([
    '<title>Survive till Friday — free office survival game, no sign-up</title>',
    '<meta name="description" content="A free office game in your browser: swipe through decisions, keep your Sanity, Energy, Boss and Team in balance and make it to Friday, 6 p.m. Play on your phone or computer, no sign-up. Daily Week, department leaderboards, office tournaments.">',
    '<meta name="keywords" content="office game, work simulator, office survival game, game about work, free online game, browser game, no sign-up game, game for coworkers, team building game, survive till friday, swipe game, Reigns">',
    '<meta name="author" content="Konstantin Moiseenko">',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<link rel="canonical" href="https://survivefriday.com/en.html">',
    '<link rel="alternate" hreflang="ru" href="https://survivefriday.com/">',
    '<link rel="alternate" hreflang="en" href="https://survivefriday.com/en.html">',
    '<link rel="alternate" hreflang="x-default" href="https://survivefriday.com/">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Survive till Friday">',
    '<meta property="og:title" content="Survive till Friday — a coffee-break office game">',
    '<meta property="og:description" content="The boss, deadlines and coworkers: make it to Friday, 6 p.m. One Daily Week for the whole office — see who lasts longest.">',
    '<meta property="og:url" content="https://survivefriday.com/en.html">',
    '<meta property="og:image" content="https://survivefriday.com/icons/og-en-1200x630.jpg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Survive till Friday: neon meters Sanity, Energy, Boss, Team and a card from the Boss">',
    '<meta property="og:locale" content="en_US">',
    '<meta property="og:locale:alternate" content="ru_RU">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="Survive till Friday — a coffee-break office game">',
    '<meta name="twitter:description" content="Make it to Friday, 6 p.m.: swipe through decisions and keep four meters in balance.">',
    '<meta name="twitter:image" content="https://survivefriday.com/icons/og-en-1200x630.jpg">',
    '<meta name="application-name" content="Survive till Friday">',
    '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False, separators=(',', ':')) + '</script>'])
s = s[:a] + head + s[b:]
s = s.replace('<html lang="ru"', '<html lang="en"', 1).replace('content="Выжить до пт">', 'content="Till Friday">', 1)
# язык игры на этой странице — английский (до загрузки js/i18n.js)
s = s.replace('<script src="js/i18n.js"></script>', "<script>try { localStorage.setItem('vdp-lang', 'en'); } catch (e) {}</script>\n<script src=\"js/i18n.js\"></script>", 1)
# английский текст сразу в разметке — его видят поисковики без JavaScript (только простые элементы без вложенных тегов)
s = re.sub(r'(data-en="([^"<>]*)"[^<>]*>)([^<]*)(<)', lambda m: m.group(1) + m.group(2) + m.group(4), s)
s = s.replace('<!doctype html>', '<!doctype html>\n<!-- Собрано tools/make-en.py из index.html — не править вручную -->', 1)
(root / 'en.html').write_text(s)
print('en.html готов')
