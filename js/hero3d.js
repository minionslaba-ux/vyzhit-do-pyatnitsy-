// 3D-аватар игрока: объёмная фигура из простых форм (three.js), со светом, тенями и «живой» анимацией —
// дыхание, моргание, взгляд по сторонам, эмоции (happy / neutral / sad / ask), жест «просит».
// three.js (js/vendor, MIT) грузится только когда аватар нужен на экране: игра без него не тяжелеет.
// Описание внешности — объект preset из js/hero.js (HERO_PRESETS).
let THREE_P = null;
const three = () => THREE_P || (THREE_P = import('./vendor/three.module.min.js'));

// Собрать фигуру персонажа. Возвращает группу и «рычаги» для анимации
function buildHero(T, p) {
  const f = p.g === 'f', H = f ? 0.95 : 1;  // женские фигуры чуть ниже
  const mat = (color, rough = 0.62, extra = {}) => new T.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
  const skin = mat(p.skin, 0.55), hairM = mat(p.hairColor, 0.48), shirt = mat(p.top, 0.7), pants = mat(p.bottom, 0.75), shoe = mat(p.shoes || '#1c1c22', 0.4);
  const root = new T.Group(), body = new T.Group();
  root.add(body);
  const add = (geo, m, x = 0, y = 0, z = 0, parent = body) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const sph = (r, ws = 28, hs = 20) => new T.SphereGeometry(r, ws, hs);
  // ноги, обувь, таз
  for (const s of [-1, 1]) {
    const sh = add(sph(0.07), shoe, s * 0.095 * H, 0.045, 0.035); sh.scale.set(1, 0.62, 1.75);
    if (!(f && p.skirt)) add(new T.CapsuleGeometry(0.072, 0.68, 8, 20), pants, s * 0.095 * H, 0.47 * H, 0);
    else add(new T.CapsuleGeometry(0.052, 0.62, 8, 16), skin, s * 0.085 * H, 0.44 * H, 0);  // ноги под юбкой
  }
  if (f && p.skirt) { const sk = add(new T.CylinderGeometry(0.16, 0.25, 0.42, 32, 1, true), pants, 0, 0.7 * H, 0); sk.material.side = T.DoubleSide; }
  const hip = add(sph(0.2), pants, 0, 0.87 * H, 0); hip.scale.set(f ? 1.05 : 1, 0.6, 0.66);
  // торс — тело вращения: талия, грудь, плечи; сплющен спереди-назад
  const prof = f ? [[0.17, 0], [0.155, 0.12], [0.14, 0.24], [0.175, 0.38], [0.185, 0.47], [0.16, 0.56], [0.06, 0.6]]
                 : [[0.18, 0], [0.185, 0.12], [0.185, 0.26], [0.21, 0.42], [0.22, 0.5], [0.17, 0.58], [0.06, 0.62]];
  const torso = add(new T.LatheGeometry(prof.map(([r, y]) => new T.Vector2(r * H, y * H)), 40), shirt, 0, 0.86 * H, 0);
  torso.scale.z = 0.66;
  const chest = torso;
  if (p.tie) { const t = add(new T.BoxGeometry(0.035, 0.26, 0.01), mat(p.tie, 0.5), 0, 1.25 * H, 0.142); t.rotation.x = -0.12; }
  if (p.jacket) {  // пиджак: чуть шире торса, открыт спереди
    const jk = add(new T.LatheGeometry(prof.map(([r, y]) => new T.Vector2(r * H * 1.06, y * H)), 40, Math.PI * 0.14, Math.PI * 1.72), mat(p.jacket, 0.7), 0, 0.86 * H, 0);  // вырез спереди (угол 0 — смотрит на зрителя)
    jk.scale.z = 0.7; jk.material.side = T.DoubleSide;
  }
  // руки: плечо → предплечье → кисть; кольцо на безымянном у тех, кто в браке
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(s * 0.215 * H, 1.37 * H, 0); body.add(sh);
    add(sph(0.068), p.jacket ? mat(p.jacket, 0.7) : shirt, 0, 0, 0, sh);
    const up = add(new T.CapsuleGeometry(0.055, 0.24, 8, 16), p.jacket ? mat(p.jacket, 0.7) : shirt, 0, -0.16, 0, sh);
    const el = new T.Group(); el.position.set(0, -0.31, 0); sh.add(el);
    add(new T.CapsuleGeometry(0.046, 0.22, 8, 16), p.short ? skin : (p.jacket ? mat(p.jacket, 0.7) : shirt), 0, -0.13, 0, el);
    const hand = add(sph(0.047), skin, 0, -0.29, 0.005, el); hand.scale.set(0.85, 1.15, 0.7);
    if (s === -1 && p.married) { const ring = add(new T.TorusGeometry(0.02, 0.006, 8, 20), mat('#e8c25a', 0.25, { metalness: 0.9 }), 0, -0.31, 0, el); ring.rotation.x = Math.PI / 2; }
    sh.rotation.z = s * 0.1;
    arms.push({ sh, el });
  }
  // шея и голова
  add(new T.CylinderGeometry(0.05, 0.056, 0.12, 20), skin, 0, 1.5 * H, 0);
  const head = new T.Group(); head.position.set(0, 1.68 * H, 0.008); head.scale.setScalar(1.28); body.add(head);  // голова чуть крупнее реальной — лицо читается и в полный рост
  // голова — одна гладкая форма «яйцом» с сужением к подбородку (две пересекающиеся сферы давали рваный шов на челюсти)
  const headProf = [[0, -0.128], [0.042, -0.122], [0.072, -0.104], [0.093, -0.074], [0.106, -0.038], [0.112, 0.002], [0.112, 0.042], [0.104, 0.08], [0.084, 0.11], [0.052, 0.13], [0, 0.138]];
  const skull = add(new T.LatheGeometry(headProf.map(([r, y]) => new T.Vector2(r, y)), 48), skin, 0, 0, 0, head); skull.scale.set(0.93, 1, 1.0);
  for (const s of [-1, 1]) { const ear = add(sph(0.024), skin, s * 0.106, 0, -0.005, head); ear.scale.set(0.45, 1, 0.8); }
  const nose = add(sph(0.017), skin, 0, -0.012, 0.116, head); nose.scale.set(0.85, 1.15, 1.25);
  // глаза: белок, радужка, зрачок, блик; веко для моргания
  const eyes = [], lids = [];
  for (const s of [-1, 1]) {
    const eg = new T.Group(); eg.position.set(s * 0.042, 0.016, 0.092); head.add(eg);
    const white = add(sph(0.023), mat('#f7f4ef', 0.25), 0, 0, 0, eg); white.scale.set(1, 0.85, 0.6);
    add(new T.CircleGeometry(0.0125, 28), mat(p.eyes || '#4a3a2a', 0.3), 0, -0.001, 0.0141, eg);
    add(new T.CircleGeometry(0.0065, 20), mat('#0b0b0d', 0.2), 0, -0.001, 0.0144, eg);
    add(new T.CircleGeometry(0.0026, 12), new T.MeshBasicMaterial({ color: '#ffffff' }), 0.0035, 0.003, 0.0147, eg);
    const lid = add(sph(0.0245, 20, 12), skin, 0, 0.0005, 0.001, eg); lid.scale.set(1.04, 0.05, 0.7); lids.push(lid);
    const lash = add(new T.TorusGeometry(0.0215, 0.0016, 6, 20, Math.PI), mat('#1a1410', 0.5), 0, 0.002, 0.008, eg); lash.scale.set(1, 0.85, 1);
    const cheek = add(sph(0.02), new T.MeshStandardMaterial({ color: '#ff9c9c', transparent: true, opacity: 0.1, roughness: 0.9, depthWrite: false }), s * 0.006, -0.04, -0.002, eg); cheek.scale.set(1.1, 0.6, 0.35); cheek.castShadow = false;
    eyes.push(eg);
  }
  const brows = [-1, 1].map(s => { const b = add(new T.BoxGeometry(0.036, 0.0065, 0.008), hairM, s * 0.042, 0.05, 0.106, head); return b; });
  // рот: дуга-улыбка; для «просит» и «грустит» — меняем изгиб
  // рот: мягкие губы почти в тон кожи и тонкая линия между ними; изгиб линии — эмоция (улыбка / ровно / грусть), «просит» — приоткрыт
  const lipCol = new T.Color(p.lips || '#b86a62').lerp(new T.Color(p.skin), 0.45);
  const mouth = new T.Group(); mouth.position.set(0, -0.055, 0.103); head.add(mouth);
  const upLip = add(sph(0.017, 24, 16), mat(lipCol, 0.45), 0, 0.0035, 0, mouth); upLip.scale.set(1.25, 0.24, 0.42);
  const loLip = add(sph(0.017, 24, 16), mat(lipCol, 0.4), 0, -0.0045, 0.0005, mouth); loLip.scale.set(1.1, 0.33, 0.48);
  const lineM = mat('#4e2626', 0.6);
  let line = null;
  const mouthO = add(sph(0.0105, 20, 14), mat('#3a1616', 0.6), 0, -0.002, 0.002, mouth); mouthO.scale.set(1.05, 0.95, 0.35); mouthO.visible = false;
  const setMouth = e => {  // c — прогиб середины: минус — уголки вверх (улыбка), плюс — вниз (грусть)
    const c = { happy: -0.0095, neutral: -0.0015, sad: 0.006, ask: -0.002 }[e] ?? -0.0015, w = e === 'happy' ? 0.022 : 0.018;
    if (line) { mouth.remove(line); line.geometry.dispose(); }
    const curve = new T.QuadraticBezierCurve3(new T.Vector3(-w, 0, 0.0035), new T.Vector3(0, c * 2, 0.0065), new T.Vector3(w, 0, 0.0035));
    line = add(new T.TubeGeometry(curve, 16, 0.0015, 6, false), lineM, 0, 0, 0, mouth); line.receiveShadow = false;
    line.visible = e !== 'ask'; mouthO.visible = e === 'ask';
    upLip.position.y = e === 'ask' ? 0.0075 : 0.0035; loLip.position.y = e === 'ask' ? -0.0105 : e === 'happy' ? -0.0055 : -0.0045;
    upLip.rotation.z = loLip.rotation.z = 0;
  };
  setMouth('neutral');
  // причёски
  const hs = p.hair;
  if (hs !== 'bald') {
    const cap = add(new T.SphereGeometry(0.126, 40, 24, 0, Math.PI * 2, 0, hs === 'buzz' ? Math.PI * 0.42 : Math.PI * 0.5), hairM, 0, 0.012, -0.006, head);
    cap.scale.set(0.95, 1.12, 1.03); cap.rotation.x = -0.18;
    if (hs === 'quiff') { const q = add(sph(0.07), hairM, 0, 0.11, 0.05, head); q.scale.set(1.3, 0.55, 0.9); }
    if (hs === 'short' || hs === 'quiff') for (const s of [-1, 1]) { const sb = add(sph(0.05), hairM, s * 0.095, 0.03, -0.02, head); sb.scale.set(0.45, 0.9, 1.3); }
    if (hs === 'bob' || hs === 'long' || hs === 'ponytail' || hs === 'bun') {
      const back = add(sph(0.125, 36, 24), hairM, 0, -0.005, -0.03, head); back.scale.set(1.02, 1.1, 0.95);
      for (const s of [-1, 1]) { const side = add(new T.CapsuleGeometry(0.04, hs === 'long' ? 0.24 : hs === 'bob' ? 0.1 : 0.04, 8, 16), hairM, s * 0.095, hs === 'long' ? -0.13 : -0.06, -0.005, head); side.scale.z = 1.5; }
    }
    if (hs === 'long') { const l = add(new T.CapsuleGeometry(0.1, 0.22, 8, 20), hairM, 0, -0.15, -0.06, head); l.scale.set(1.05, 1, 0.55); }
    if (hs === 'bun') add(sph(0.055), hairM, 0, 0.1, -0.08, head);
    if (hs === 'ponytail') { const pt = add(new T.CapsuleGeometry(0.035, 0.2, 8, 16), hairM, 0, -0.08, -0.13, head); pt.rotation.x = 0.35; add(sph(0.032), hairM, 0, 0.04, -0.115, head); }
    if (f) { const fr = add(sph(0.08), hairM, -0.03, 0.08, 0.065, head); fr.scale.set(1.25, 0.45, 0.7); fr.rotation.z = 0.25; }
  }
  if (p.beard) {
    const bd = add(new T.SphereGeometry(0.1, 32, 20, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.42), mat(p.beardColor || p.hairColor, 0.7), 0, -0.035, 0.012, head);
    bd.scale.set(0.9, 1.05, 1.02);
    const mus = add(new T.CapsuleGeometry(0.008, 0.035, 4, 8), mat(p.beardColor || p.hairColor, 0.7), 0, -0.037, 0.112, head); mus.rotation.z = Math.PI / 2;
  }
  if (p.glasses) {
    const gm = mat('#1a1a1f', 0.3, { metalness: 0.4 });
    for (const s of [-1, 1]) add(new T.TorusGeometry(0.026, 0.0028, 8, 28), gm, s * 0.042, 0.018, 0.122, head);
    add(new T.BoxGeometry(0.03, 0.004, 0.004), gm, 0, 0.022, 0.123, head);
    for (const s of [-1, 1]) { const arm = add(new T.BoxGeometry(0.004, 0.004, 0.1), gm, s * 0.07, 0.022, 0.07, head); arm.rotation.y = s * 0.12; }
  }
  head.traverse(o => { o.receiveShadow = false; });  // без самозатенения лица: иначе «грязные» пятна на подбородке
  root.userData = { body, head, chest, arms, eyes, lids, brows, setMouth, mouthEmo: 'neutral', H };
  return root;
}

// Сцена, свет, камера. framing: 'full' — во весь рост, 'bust' — по пояс
function makeScene(T, canvas, framing) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(framing === 'full' ? 30 : 24, 1, 0.1, 20);
  scene.add(new T.HemisphereLight('#e4ecff', '#3a2c48', 1.0));
  const key = new T.DirectionalLight('#fff3e6', 2.4); key.position.set(1.6, 3.2, 2.6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 8; key.shadow.radius = 4; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  for (const k of ['left', 'bottom']) key.shadow.camera[k] = -1.2; for (const k of ['right', 'top']) key.shadow.camera[k] = 1.2;
  scene.add(key);
  const fill = new T.DirectionalLight('#ffe9dc', 0.9); fill.position.set(-0.6, 1.6, 3); scene.add(fill);  // мягкий фронтальный — лицо не в тени
  const rim = new T.DirectionalLight('#7ff3ff', 1.4); rim.position.set(-2, 2.2, -2.5); scene.add(rim);
  const rim2 = new T.DirectionalLight('#ff8ae6', 0.7); rim2.position.set(2.4, 1.2, -2); scene.add(rim2);
  const ground = new T.Mesh(new T.CircleGeometry(0.75, 48), new T.ShadowMaterial({ opacity: 0.38 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const glow = new T.Mesh(new T.RingGeometry(0.5, 0.62, 64), new T.MeshBasicMaterial({ color: '#2de2e6', transparent: true, opacity: 0.35 })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.002; scene.add(glow);
  // full — во весь рост; bust — по пояс; face — лицо и плечи (превью)
  const aim = { full: [0.9, 4.0, 0.2], bust: [1.38, 2.0, 0.06], face: [1.58, 1.25, 0.02] }[framing] || [0.9, 4.0, 0.2];
  cam.position.set(0, aim[0] + aim[2], aim[1]); cam.lookAt(0, aim[0], 0);
  return { renderer, scene, cam };
}

const EMO = {
  happy:   { brow: 0.12, browY: 0.052 },
  neutral: { brow: 0, browY: 0.05 },
  sad:     { brow: -0.28, browY: 0.047 },
  ask:     { brow: 0.22, browY: 0.056 },
};

// Живой просмотр на canvas. Возвращает { setEmotion, setPreset, dispose }; null — если WebGL недоступен
async function heroViewer(canvas, preset, { framing = 'full', emotion = 'neutral', interactive = true } = {}) {
  let T; try { T = await three(); } catch { return null; }
  let ctx; try { ctx = makeScene(T, canvas, framing); } catch { return null; }
  const { renderer, scene, cam } = ctx;
  let hero = buildHero(T, preset), emo = EMO[emotion] || EMO.neutral, emoName = emotion;
  scene.add(hero);
  const size = () => { const w = canvas.clientWidth || 200, h = canvas.clientHeight || 260; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size();
  let yaw = -0.35, drag = null, raf = 0, alive = true, nextBlink = performance.now() + 1500, t0 = performance.now();
  if (interactive) {
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, yaw }; canvas.setPointerCapture?.(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (drag) yaw = drag.yaw + (e.clientX - drag.x) * 0.012; });
    const up = () => { drag = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null; ro?.observe(canvas);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = now => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden || !canvas.isConnected) return;
    const t = (now - t0) / 1000, u = hero.userData;
    if (!drag) yaw += (Math.sin(t * 0.25) * 0.35 - 0.2 - yaw) * 0.015;  // сам медленно возвращается и чуть поворачивается
    hero.rotation.y = yaw;
    if (!RM) {
      u.chest.scale.y = 1 + Math.sin(t * 1.6) * 0.012;                    // дыхание
      u.head.rotation.y = Math.sin(t * 0.5) * 0.18; u.head.rotation.x = Math.sin(t * 0.37) * 0.04 + (emoName === 'sad' ? 0.14 : emoName === 'ask' ? -0.06 : 0);
      u.body.position.y = Math.sin(t * 1.6) * 0.004;
      const ask = emoName === 'ask';  // «просит»: правая рука поднята ладонью вверх, слегка покачивается
      u.arms[1].sh.rotation.x += ((ask ? -0.95 : 0.03) - u.arms[1].sh.rotation.x) * 0.08;
      u.arms[1].el.rotation.x += ((ask ? -0.7 + Math.sin(t * 2.4) * 0.08 : -0.05) - u.arms[1].el.rotation.x) * 0.08;
      u.arms[0].sh.rotation.x = Math.sin(t * 1.1) * 0.04;
      if (emoName === 'happy') u.body.position.y += Math.abs(Math.sin(t * 2.2)) * 0.006;
    }
    // моргание
    const blink = now > nextBlink ? Math.min(1, (now - nextBlink) / 70) : 0;
    const lidY = blink < 1 ? 0.05 + Math.sin(blink * Math.PI) * 0.95 : 0.05;
    if (now > nextBlink + 140) nextBlink = now + 2200 + Math.random() * 2600;
    for (const l of u.lids) l.scale.y = lidY;
    for (const [i, b] of u.brows.entries()) { b.rotation.z = (i ? -1 : 1) * emo.brow; b.position.y = emo.browY; }
    if (u.mouthEmo !== emoName) { u.setMouth(emoName); u.mouthEmo = emoName; }  // геометрию рта — только при смене эмоции
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);
  return {
    setEmotion(e) { emo = EMO[e] || EMO.neutral; emoName = e; },
    setPreset(p) { scene.remove(hero); hero = buildHero(T, p); scene.add(hero); },
    dispose() { alive = false; cancelAnimationFrame(raf); ro?.disconnect(); renderer.dispose(); renderer.forceContextLoss?.(); },
  };
}

// Картинки-превью всех персонажей одним рендером (для выбора — не держим 10 WebGL-сцен)
async function heroSnapshots(presets, w = 160, h = 200) {
  const T = await three(), canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const { renderer, scene, cam } = makeScene(T, canvas, 'face');
  renderer.setPixelRatio(1); renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  const out = [];
  for (const p of presets) {
    const hero = buildHero(T, p); hero.rotation.y = -0.25; scene.add(hero);
    const u = hero.userData; for (const l of u.lids) l.scale.y = 0.05;
    for (const [i, b] of u.brows.entries()) b.rotation.z = (i ? -1 : 1) * EMO.happy.brow;
    u.setMouth('happy');
    renderer.render(scene, cam); out.push(canvas.toDataURL('image/png'));
    scene.remove(hero);
  }
  renderer.dispose(); renderer.forceContextLoss?.();
  return out;
}
