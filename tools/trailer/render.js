// Покадровый рендер заставки: монтаж trailer.html (кадры игры из capture.js) → PNG → ffmpeg → MP4 (H.264 + AAC, faststart).
// Порядок: python3 -m http.server 8800 (в корне) → node tools/trailer/capture.js → python3 tools/trailer/sound.py tools/trailer/sound.wav
//   → node tools/trailer/render.js tall promo/video/zastavka-9x16.mp4 → node tools/trailer/render.js wide promo/video/zastavka-16x9.mp4
// Постер: node tools/trailer/render.js tall promo/video/poster-9x16.jpg 17.2  (третий аргумент — момент кадра, с)
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const [, , mode, out, still] = process.argv; const T = __dirname;
const CAP = process.env.VDP_CAP || path.join(require('os').tmpdir(), 'vdp-cap');
const wide = mode === 'wide', W = wide ? 1920 : 1080, H = wide ? 1080 : 1920, FPS = 30, DUR = 33.3;
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: W / 2, height: H / 2 }, deviceScaleFactor: 2 }); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(`file://${T}/trailer.html?mode=${wide ? 'wide' : 'tall'}&cap=${encodeURIComponent('file://' + CAP)}${still ? '&poster=1' : ''}`);
  await pg.evaluate(() => window.ready); await pg.waitForTimeout(500);
  if (still) {
    await pg.evaluate(t => frame(t), +still); await pg.waitForTimeout(100);
    await pg.screenshot({ path: out, type: 'jpeg', quality: 88 }); await b.close(); return console.log('ok', out);
  }
  const dir = path.join(require('os').tmpdir(), 'vdp-frames-' + mode); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  for (let i = 0; i < Math.round(FPS * DUR); i++) { await pg.evaluate(t => frame(t), i / FPS); await pg.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.png` }); }
  await b.close(); if (errs.length) console.log('errors', errs);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', dir + '/f%04d.png', '-i', T + '/sound.wav',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-crf', process.env.CRF || '24', '-preset', 'slow', '-maxrate', '1350k', '-bufsize', '2700k', '-vf', `scale=${W}:${H}`,
    '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out]);
  console.log('ok', out, (fs.statSync(out).size / 1024 | 0) + ' KB');
})();
