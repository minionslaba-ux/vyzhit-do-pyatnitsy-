# Звук заставки (33 с, без чужой музыки — всё синтезируется): крючок с тиканьем часов и подъёмом,
# «дроп» в 2,1 с — электро-бит 128 bpm (бочка, клэп, хэты, бас с «качелями», арпеджио), удары на склейках,
# сирена на «опасности», свайпы, монетки на покупках, блипы в мини-играх, финальный аккорд.
# Тайминг совпадает с trailer.html: B = 60/128, D = 2.1, at(k) = D + k·B.
# Запуск: python3 tools/trailer/sound.py tools/trailer/sound.wav
import numpy as np, wave, sys
SR = 44100; DUR = 33.3; n = int(SR * DUR)
L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(7)
B = 60 / 128; D = 2.1
at = lambda k: D + k * B
END = at(61)

def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR); j = min(n, i + len(sig))
    if i >= n or j <= i: return
    s = sig[:j - i] * g
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))
def T(sec): return np.arange(int(sec * SR)) / SR
def env(x, a, r): return np.minimum(1, x / a) * np.exp(-x / r)
def lp(s, k):  # простой фильтр низких частот (скользящее среднее)
    return np.convolve(s, np.ones(k) / k, 'same')
def saw(f, x): return 2 * ((x * f) % 1) - 1
def sq(f, x): return np.sign(np.sin(2 * np.pi * f * x))

def kick(g=1.0):
    x = T(.4); return np.sin(2 * np.pi * (45 * x + 110 / 28 * (1 - np.exp(-x * 28)))) * np.exp(-x * 7) * g
def clap():
    x = T(.25); s = rng.standard_normal(len(x)); s = s - lp(s, 6)
    e = np.exp(-x * 25) + .6 * np.exp(-np.maximum(0, x - .012) * 30) * (x > .012) + .4 * np.exp(-np.maximum(0, x - .024) * 30) * (x > .024)
    return s * e * .5
def hat(open_=False):
    x = T(.18 if open_ else .05); s = rng.standard_normal(len(x)); s = s - lp(s, 3)
    return s * np.exp(-x * (18 if open_ else 70)) * .12
def boom():  # удар-«бум» на склейках
    x = T(1.2); return (np.sin(2 * np.pi * (38 * x + 160 / 9 * (1 - np.exp(-x * 9)))) * np.exp(-x * 2.8) * .9
                        + lp(rng.standard_normal(len(x)), 4) * np.exp(-x * 12) * .25)
def whoosh(L_=.32, up=True):
    x = T(L_); s = rng.standard_normal(len(x)); k = 3 if up else 10
    s = s - lp(s, k); return s * np.sin(np.pi * x / L_) ** 2 * .22
def blip(f, L_=.09, g=.16):
    x = T(L_); return sq(f, x) * env(x, .002, L_ / 3) * g
def coin():
    x = T(.35); return (np.sin(2 * np.pi * 1975 * x) * (x < .07) + np.sin(2 * np.pi * 2637 * x) * (x >= .07)) * np.exp(-x * 9) * .18

# ---------- крючок 0–2,1 с: тиканье, подъём, два удара на словах ----------
for k in range(14):
    t = .05 + k * .14
    x = T(.03); add(np.sin(2 * np.pi * (2400 if k % 2 else 1800) * x) * np.exp(-x * 160) * .35, t, .3 if k % 2 else -.3)
x = T(2.1)
riser = lp(rng.standard_normal(len(x)), 2) * (x / 2.1) ** 2.2 * .35
riser += saw(110 * 2 ** (x * 1.2), x) * (x / 2.1) ** 2 * .08
add(riser, 0)
add(boom() * .9, .02); add(boom() * .8, .42)
add(blip(880, .12, .12), .8); add(blip(1320, .12, .12), .95)
# «стоп»-хлопок перед дропом
add(clap() * 1.2, at(0) - B / 2)

# ---------- основной бит с дропа до финала ----------
bass_notes = [55.0, 55.0, 65.41, 73.42, 55.0, 82.41, 73.42, 65.41]   # ля-минор
arp = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25]
k = 0
while at(k / 4) < END:
    t = at(k / 4); beat = k // 4; sub = k % 4
    calm = 30 <= beat < 34   # «Сними стресс»: бочка и арпеджио молчат, только бас, хэты и пэд
    if sub == 0 and not calm:
        add(kick(), t)
        if beat % 2 == 1: add(clap(), t, 0)
    add(hat(open_=(sub == 2)), t, .35 if sub % 2 else -.35, .9 if sub == 2 else .6)
    # бас: восьмые с «качелями» (тише сразу после бочки)
    if sub in (0, 2):
        f = bass_notes[(k // 2) % 8]; x = T(B / 2)
        s = lp(saw(f, x) + .5 * saw(f * 1.01, x), 6) * env(x, .004, .16)
        add(s, t, 0, .3 if sub == 2 else .18)
    # арпеджио — шестнадцатые, громче после 4-й доли
    if beat >= 4 and not calm:
        f = arp[k % 8] * (2 if beat >= 20 else 1); x = T(B / 4)
        add(sq(f, x) * env(x, .002, .05) * .045, t, -.5 if k % 2 else .5)
    k += 1
# удары и «вжух» на склейках
CUTS = [10, 13, 16, 19, 22, 24.5, 26, 28.5, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 42.5, 46, 49.5, 52.5, 54.5, 56.5, 58, 59.5]
for kk in CUTS:
    if 30 < kk < 34: continue
    add(whoosh(.28), at(kk) - .2, .4 if int(kk * 2) % 2 else -.4)
for kk in [10, 13, 16, 19, 22, 34, 39, 42.5, 49.5, 56.5]: add(boom() * .55, at(kk))
def chime(f, g=.12):
    x = T(1.2); return sum(np.sin(2 * np.pi * f * m * x) / m for m in (1, 2.01, 3.03)) * np.exp(-x * 3.2) * g
# «Выгорел на работе?» — низкий «бум», «Перезагрузись» — восходящий перелив
add(boom() * .6, at(0) + .05); [add(chime(f, .09), at(2) + i * .07) for i, f in enumerate((523.25, 659.25, 783.99, 1046.5))]
# свайпы карточек
for t in (at(0) + 1.10, at(0) + 2.78, at(0) + 4.36): add(whoosh(.3), t, .6); add(blip(1600, .05, .1), t + .25)
# опасность: сирена
x = T(3 * B); add(np.sin(2 * np.pi * (700 + 250 * np.sin(2 * np.pi * 2.2 * x)) * x) * .07 * np.minimum(1, x / .1) * np.minimum(1, (3 * B - x) / .1), at(10))
# герой, карьера (три ступени), повышение (фанфара)
add(blip(1046.5, .4, .08), at(13) + .1)
for i, f in enumerate((523.25, 659.25, 783.99)): add(blip(f, .25, .12), at(16) + .3 + i * B * .8)
for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)): add(blip(f, .18 if i < 3 else .5, .11), at(19) + .1 + i * .12)
# покупки: монетки
for kk in (22.2, 24.6, 26.1, 28.6): add(coin(), at(kk))
# «Сними стресс»: мягкий пэд и колокольчики
x = T(4 * B); pad = sum(np.sin(2 * np.pi * f * x) for f in (220, 277.18, 329.63, 415.3)) / 4
add(pad * np.minimum(1, x / .3) * np.minimum(1, (4 * B - x) / .3) * .22, at(30))
for i, f in enumerate((659.25, 783.99, 987.77, 880)): add(chime(f), at(30 + i) + .03)
# мини-игры: блипы на каждой склейке
for i, kk in enumerate((34, 35, 36, 37, 38)): add(blip([660, 784, 880, 988, 1175][i], .1, .13), at(kk) + .05)
# темы: «щелчок» на каждую смену цвета
for i in range(6): add(blip(1200 + i * 110, .06, .1), at(39) + (4 + 9 * i) / 30)
# стикер «шлёп», подарок — «бум» и монетки, серия дней — монетки
add(boom() * .35, at(42.5) + 28 / 30); add(blip(900, .08, .12), at(42.5) + 28 / 30)
add(coin(), at(46) + 22 / 30); add(chime(1318.5, .1), at(46) + 22 / 30 + .05)
add(coin(), at(49.5) + 22 / 30); add(coin(), at(49.5) + 22 / 30 + .12)
# анкета — «печать», цитаты — перелистывание
add(clap() * .8, at(52.5) + .1); add(whoosh(.25), at(54.5) + 12 / 30)
# магазин, лента, рейтинг: «дзынь» уведомлений
for kk in (56.6, 58.1, 59.6): add(np.sin(2 * np.pi * 1568 * T(.3)) * np.exp(-T(.3) * 12) * .14, at(kk))

# ---------- финал: удар, аккорд, отзвук ----------
add(boom() * 1.1, END); add(kick(1.2), END)
x = T(DUR - END)
chord = sum(lp(saw(f, x), 8) + np.sin(2 * np.pi * f * x) for f in (220, 261.63, 329.63, 440, 523.25)) / 10
add(chord * np.minimum(1, x / .02) * np.exp(-x * .7) * .55, END)
for i, f in enumerate((1046.5, 1318.5, 1568, 2093)): add(np.sin(2 * np.pi * f * T(1.2)) * np.exp(-T(1.2) * 3) * .1, END + .3 + i * .09, .3 * (i % 2 * 2 - 1))
for kk in range(4): add(kick(.6), END + B * (kk + 1)) if kk < 3 else None

out = np.stack([L, R], 1)
out = np.tanh(out / np.abs(out).max() * 1.6) / np.tanh(1.6) * .9   # мягкий лимитер
fade = int(.5 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype('<i2').tobytes()); w.close()
print('sound ok')
