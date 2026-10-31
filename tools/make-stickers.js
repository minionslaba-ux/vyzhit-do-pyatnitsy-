// Стикерпак для Telegram: рендерит tools/stickers.html?n=1…24 в data/stickers/NN.png (512×512, прозрачный фон)
// и пишет data/stickers/emoji.json (эмодзи к каждому стикеру — их требует Telegram).
// Запуск из корня репозитория: node tools/make-stickers.js [n …]   (без номеров — все)
// Сам поднимает статический сервер: python3 -m http.server 8799. Проверка и сжатие PNG — python3 + PIL.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'data/stickers'), PORT = 8799;
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  try {
    for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${PORT}/tools/stickers.html`); break; } catch { await wait(100); } }
    const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const pg = await b.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await pg.goto(`http://127.0.0.1:${PORT}/tools/stickers.html?n=1`);
    await pg.waitForFunction(() => window.__ready, null, { timeout: 60000 });
    const list = await pg.evaluate(() => window.STICKERS.map(s => ({ cap: s.cap, emoji: s.emoji })));
    const only = process.argv.slice(2).map(Number).filter(Boolean);
    const nums = only.length ? only : list.map((_, i) => i + 1);
    for (const n of nums) {
      await pg.goto(`http://127.0.0.1:${PORT}/tools/stickers.html?n=${n}`);
      await pg.waitForFunction(() => window.__ready, null, { timeout: 60000 });
      const err = await pg.evaluate(() => window.__error);
      if (err) throw new Error(`sticker ${n}: ${err}`);
      const file = path.join(OUT, String(n).padStart(2, '0') + '.png');
      await pg.locator('#out').screenshot({ path: file, omitBackground: true });
      console.log(n, list[n - 1].cap);
    }
    await b.close();
    if (errs.length) console.log('page errors:', errs);
    const emoji = list.map((s, i) => ({ file: String(i + 1).padStart(2, '0') + '.png', emoji: s.emoji.slice(0, 3) }));
    fs.writeFileSync(path.join(OUT, 'emoji.json'), '[\n' + emoji.map(e => ' ' + JSON.stringify(e)).join(',\n') + '\n]\n');
    // проверка: 512×512, есть альфа и прозрачные пиксели, < 512 КБ (иначе — квантизация с сохранением альфы)
    console.log(execFileSync('python3', ['-c', `
import sys, os, glob
from PIL import Image
bad = 0
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))):
    im = Image.open(f)
    if os.path.getsize(f) >= 500 * 1024:
        im.convert('RGBA').quantize(256, method=Image.Quantize.FASTOCTREE).save(f, optimize=True)
        im = Image.open(f)
    rgba = im.convert('RGBA'); a = rgba.getchannel('A')
    ok = im.size == (512, 512) and a.getextrema()[0] == 0 and os.path.getsize(f) < 512 * 1024
    bad += not ok
    print(os.path.basename(f), im.size, im.mode, os.path.getsize(f) // 1024, 'KB', 'ok' if ok else 'FAIL')
sys.exit(1 if bad else 0)
`, OUT], { encoding: 'utf8' }));
  } finally { srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
