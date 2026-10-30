# Звук заставки: синтвейв-бас и бочка 112 bpm, свайпы, щелчки, пар перегрева, звонок 18:00, финальный аккорд
import numpy as np, wave, sys
SR = 44100; DUR = 15.0; n = int(SR * DUR); t = np.arange(n) / SR
out = np.zeros(n)
def add(sig, at):
    i = int(at * SR); j = min(n, i + len(sig)); out[i:j] += sig[:j - i]
def env(L, a=.005, r=.2):
    x = np.arange(int(L * SR)) / SR; return np.minimum(1, x / a) * np.exp(-x / r)
beat = 60 / 112
# бочка и хэт с 2.6 до 10.4 и с 13.2
for k in range(80):
    at = 2.6 + k * beat
    if at > 10.4: break
    L = .35; x = np.arange(int(L * SR)) / SR
    add(np.sin(2 * np.pi * (50 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 9) * .55, at)
    add(np.random.randn(int(.05 * SR)) * env(.05, .001, .015) * .12, at + beat / 2)
# бас: арпеджио ля-минора
notes = [55, 55, 65.4, 73.4, 55, 55, 82.4, 73.4]
for k in range(64):
    at = 2.6 + k * beat / 2
    if at > 10.4: break
    f = notes[k % 8]; L = beat / 2; x = np.arange(int(L * SR)) / SR
    saw = 2 * (x * f % 1) - 1
    add(saw * np.exp(-x * 5) * .16, at)
# пэд с начала (неоновое «включение»)
x = t[:int(2.6 * SR)]
pad = sum(np.sin(2 * np.pi * f * x) for f in (220, 261.6, 329.6)) / 3 * np.minimum(1, x / 1.2) * .14
add(pad, 0)
# свайпы (шум с фильтром «вжух») и щелчок степлера
def whoosh():
    L = .35; x = np.arange(int(L * SR)) / SR; s = np.random.randn(len(x))
    s = np.convolve(s, np.ones(12) / 12, 'same'); return s * np.sin(np.pi * x / L) * .35
def click():
    L = .06; x = np.arange(int(L * SR)) / SR; return (np.random.randn(len(x)) * .6 + np.sin(2 * np.pi * 1800 * x)) * np.exp(-x * 90) * .4
for at in (4.4, 6.6): add(whoosh(), at); add(click(), at + .1)
# всплывающие числа: «динь»
for at in (4.65, 6.85):
    L = .25; x = np.arange(int(L * SR)) / SR; add(np.sin(2 * np.pi * 1320 * x) * np.exp(-x * 14) * .18, at)
# быстрые дни: тики
for k in range(12): add(click() * .5, 7.6 + k * .12)
# перегрев: шипение и удар
L = 1.0; x = np.arange(int(L * SR)) / SR
add(np.random.randn(len(x)) * np.minimum(1, x / .6) * .12, 9.2); add(np.sin(2 * np.pi * (60 + 200 * np.exp(-x * 8)) * x) * np.exp(-x * 4) * .5, 10.1)
# 18:00 — звонок и открытие дверей
for i, f in enumerate((1046.5, 1318.5, 1568)):
    L = 1.2; x = np.arange(int(L * SR)) / SR; add(np.sin(2 * np.pi * f * x) * np.exp(-x * 3) * .16, 11.4 + i * .09)
add(whoosh() * 1.4, 11.5)
# финальный аккорд и пульс бочки на концовке
x = t[:int(1.8 * SR)]
add(sum(np.sin(2 * np.pi * f * x) for f in (220, 277.2, 329.6, 440)) / 4 * np.minimum(1, x / .05) * np.exp(-x * 1.2) * .3, 13.2)
for k in range(4):
    L = .35; x = np.arange(int(L * SR)) / SR; add(np.sin(2 * np.pi * (50 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 9) * .5, 13.2 + k * beat)
out = out / max(1e-9, np.abs(out).max()) * .85
out[-int(.4 * SR):] *= np.linspace(1, 0, int(.4 * SR))
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes()); w.close()
print('sound ok')
