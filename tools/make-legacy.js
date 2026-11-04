// Копия игры для старых браузеров: old.html и old-en.html + legacy/js/*.js
// Зачем: игра написана на современном JS (?. ?? ||= — Chrome 85+, Safari 14+). На телефонах без сервисов Google (Honor, Huawei)
// и на старых Android встроенный браузер (WebView) годами не обновляется — там игра не запускалась и висела на первом экране.
// index.html / en.html в самом начале проверяют, понимает ли браузер новый код; если нет — сразу переходят на old.html / old-en.html.
// Здесь каждый скрипт из index.html переводится esbuild в старый синтаксис (те же глобальные переменные, без сборки в один файл).
// Запуск: node tools/make-legacy.js (делает tools/release.py; esbuild — npm install в папке tools).
const fs = require('fs');
const path = require('path');
const esbuild = require('./node_modules/esbuild');
const ROOT = path.join(__dirname, '..');
const TARGET = ['chrome64', 'safari12', 'firefox62'];  // ~2018: старые WebView Android 8–10, iOS 12
const OUT = 'legacy';

const pages = [['index.html', 'old.html'], ['en.html', 'old-en.html']];
const done = new Set();
let n = 0;
for (const [src, dst] of pages) {
  let html = fs.readFileSync(path.join(ROOT, src), 'utf8');
  const scripts = [...html.matchAll(/<script src="(js\/[^"]+\.js)"/g)].map(m => m[1]);
  for (const s of scripts) {
    if (done.has(s)) continue; done.add(s);
    const code = fs.readFileSync(path.join(ROOT, s), 'utf8');
    const out = esbuild.transformSync(code, { loader: 'js', target: TARGET, charset: 'utf8', legalComments: 'none', supported: { 'dynamic-import': true } });
    // import('./vendor/…') в обычном скрипте считается от адреса самого скрипта — из legacy/js/ ведём на исходную папку js/
    out.code = out.code.replace(/import\((['"])\.\/vendor\//g, 'import($1../../js/vendor/');
    const file = path.join(ROOT, OUT, s);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `/* сгенерировано tools/make-legacy.js из ${s} — не править */\n` + out.code);
    n++;
  }
  // страница: те же файлы из legacy/, без проверки браузера в начале (иначе — бесконечный переход)
  html = html.replace(/<script src="(js\/[^"]+\.js)"/g, `<script src="${OUT}/$1"`)
    .replace(/<script id="legacyGate">[\s\S]*?<\/script>\n?/, '')
    .replace('<html ', '<html data-legacy="1" ');
  // поисковикам — основная страница
  html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, follow">');
  fs.writeFileSync(path.join(ROOT, dst), html);
}
console.log(`legacy: ${n} скриптов → ${OUT}/js, страницы old.html, old-en.html`);
