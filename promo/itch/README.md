# «Выжить до пятницы» на itch.io

`dist/itch.zip` (собирает `python3 tools/build-platforms.py`) — **оболочка**: одна страница с окном на
`https://survivefriday.com/?src=itch&utm_source=itch`. Игра на itch обновляется сама вместе с сайтом — архив перезаливать не нужно.
Внутри — режим без оплаты (`window.ITCH` → `NO_PAY`, js/i18n.js). Язык — по браузеру игрока (англоязычным — английский).

## Как выложить
1. itch.io → Register (почта) → вверху справа ▾ → **Upload new project**.
2. **Title:** `Survive till Friday` · **Project URL:** `survive-till-friday`
3. **Short description:** `An office card game about burnout: survive 25 decisions until Friday, 6 PM`
4. **Classification:** Games · **Kind of project:** **HTML**
5. **Pricing:** No payments (или «Donate» — только если есть PayPal/Stripe)
6. **Uploads:** загрузить `dist/itch.zip` → галочка **This file will be played in the browser**
7. **Embed options:** Viewport `420 × 760` (портретная), ✓ Mobile friendly (Orientation: Portrait), ✓ Fullscreen button,
   ✗ Automatically start on page load — оставить выкл.
8. **Description** — текст ниже. **Genre:** Card Game / Simulation. **Tags:** `office`, `card-game`, `swipe`, `funny`, `minigames`, `simulation`, `casual`, `singleplayer`, `russian`
9. **Cover image:** `cover-630x500.png` · **Screenshots:** `01…07-*.png` (эта папка)
10. **Visibility:** Public → Save.

## Description (EN)
> **Survive till Friday** is an office card game about burnout — with a sense of humour.
>
> From Monday 9 AM to Friday 6 PM you make 25 decisions. Swipe left or right, and four meters move: **Sanity, Energy, Boss and Team**. Let any of them hit 0% or 100% — and your week is over.
>
> • A 52-week career and 13 levels: from office plankton to your own startup
> • Thousands of office situations: deadlines, "got a minute?", endless calls and the last cookie
> • 54 one-minute break games: hide from coworkers, look smart on a video call, coffee vs the task pile-up
> • Mira, the office psychologist: tips and quick self-checks
> • Overheat meter: keep your character from burning out
> • Daily Week — the same for everyone, with a leaderboard
>
> Free, no sign-up needed. Russian and English.
> 🤖 All characters are fictional. Mira's tips are about healthy habits and don't replace a professional.
