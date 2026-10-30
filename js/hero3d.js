// 3D-аватар игрока: объёмная фигура из простых форм (three.js), со светом, тенями и «живой» анимацией —
// дыхание, моргание, взгляд по сторонам, эмоции (happy / neutral / sad / ask), жест «просит» и действия для мультиков
// (идёт, несёт, радуется, прыгает, смотрит в телефон, кружится).
// three.js (js/vendor, MIT) грузится только когда аватар нужен на экране: игра без него не тяжелеет.
// Описание внешности — объект preset из js/hero.js (HERO_PRESETS).
let THREE_P = null;
const three = () => THREE_P || (THREE_P = import('./vendor/three.module.min.js'));

// Собрать фигуру персонажа. Возвращает группу и «рычаги» для анимации.
// Пропорции — «модельные»: длинные ноги, голова чуть крупнее реальной (лицо читается и в полный рост), у женщин — талия,
// бёдра и мягкий силуэт, у мужчин — широкие плечи и V-образный торс. Материалы с мягким блеском (sheen) — кожа и ткань не «деревянные».
function buildHero(T, p) {
  const f = p.g === 'f', H = f ? 0.95 : 1, fa = f && !p.kid;  // женские фигуры чуть ниже; fa — взрослая (у детей без макияжа и каблуков)
  const phys = (color, rough, extra = {}) => new T.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, ...extra });
  const tint = (c, k) => new T.Color(c).lerp(new T.Color('#ffffff'), k);
  const skin = phys(p.skin, 0.5, { sheen: 0.35, sheenColor: tint(p.skin, 0.5), sheenRoughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.6 });
  const cloth = c => phys(c, 0.78, { sheen: 0.6, sheenColor: tint(c, 0.35), sheenRoughness: 0.8 });
  const hairM = phys(p.hairColor, 0.38, { sheen: 1, sheenColor: tint(p.hairColor, 0.45), sheenRoughness: 0.35 });
  const dress = f && p.dress, skirt = f && (p.skirt || dress);
  const shirt = cloth(p.top), pants = cloth(dress ? p.top : p.bottom), shoe = phys(p.shoes || (f ? '#2a1a22' : '#1c1c22'), 0.32, { clearcoat: 0.6 });
  const sleeve = p.jacket ? cloth(p.jacket) : shirt;
  const root = new T.Group(), body = new T.Group();
  root.add(body);
  const add = (geo, m, x = 0, y = 0, z = 0, parent = body) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const sph = (r, ws = 28, hs = 20) => new T.SphereGeometry(r, ws, hs);
  const lathe = (pts, k = 1, seg = 36) => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(r * k, y)), seg);
  // ноги: одна плавная форма бедро → колено → икра → щиколотка; группа на тазобедренном суставе — для ходьбы
  const legProf = f ? [[0, -0.87], [0.03, -0.86], [0.034, -0.8], [0.045, -0.68], [0.056, -0.57], [0.048, -0.46], [0.052, -0.42], [0.07, -0.28], [0.086, -0.12], [0.09, -0.02], [0, 0.03]]
                    : [[0, -0.87], [0.036, -0.86], [0.04, -0.8], [0.05, -0.66], [0.062, -0.56], [0.055, -0.46], [0.058, -0.42], [0.072, -0.3], [0.085, -0.12], [0.088, -0.02], [0, 0.03]];
  const legs = [];
  for (const s of [-1, 1]) {
    const lg = new T.Group(); lg.position.set(s * (f ? 0.082 : 0.092) * H, 0.93 * H, 0); body.add(lg);
    lg.scale.setScalar(H);
    if (skirt) add(lathe(legProf, 1), skin, 0, 0, 0, lg);
    else add(lathe(legProf.map(([r, y]) => [y < -0.78 ? r : Math.max(r * 1.12, 0.05), y]), 1), pants, 0, 0, 0, lg);
    const sh = add(sph(0.062), shoe, 0, -0.845, 0.035, lg); sh.scale.set(0.9, 0.55, 1.75);
    if (p.heels ?? fa) { sh.position.y = -0.83; sh.rotation.x = 0.28; add(new T.CylinderGeometry(0.008, 0.012, 0.06, 10), shoe, 0, -0.87, -0.06, lg); }
    legs.push(lg);
  }
  // таз, торс (тело вращения: талия, грудь, плечи; сплющен спереди-назад)
  const hip = add(sph(0.178), pants, 0, 0.93 * H, 0); hip.scale.set(skirt ? 0.82 : f ? 1.0 : 0.98, 0.5, skirt ? 0.6 : f ? 0.7 : 0.64);
  const prof = f ? [[0.172, 0], [0.152, 0.1], [0.128, 0.2], [0.145, 0.3], [0.16, 0.4], [0.16, 0.48], [0.156, 0.54], [0.12, 0.585], [0.05, 0.605]]
                 : [[0.175, 0], [0.165, 0.1], [0.158, 0.2], [0.185, 0.32], [0.21, 0.44], [0.222, 0.52], [0.215, 0.57], [0.17, 0.61], [0.09, 0.635], [0.05, 0.64]];
  // торс; у женщин спереди на уровне груди форма плавно выдаётся вперёд (деформация вершин — без «приклеенных» шаров)
  const torsoGeo = (k, seg = 40, a0, al) => {
    const g = new T.LatheGeometry(prof.map(([r, y]) => new T.Vector2(r * H * k, y * H)), seg, a0, al);
    if (fa) { const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / H, z = pos.getZ(i); if (z > 0) pos.setZ(i, z * (1 + 0.55 * Math.exp(-(((y - 0.39) / 0.075) ** 2)) * (z / (0.16 * k * H)) ** 2)); } g.computeVertexNormals(); }
    return g;
  };
  const torso = add(torsoGeo(1), shirt, 0, 0.86 * H, 0);
  torso.scale.z = f ? 0.64 : 0.62;
  const chest = torso;
    if (!skirt && !p.short) { const belt = add(new T.TorusGeometry(0.172 * H, 0.011, 8, 40), phys('#2a2026', 0.35, { clearcoat: 0.5 }), 0, 0.885 * H, 0); belt.rotation.x = Math.PI / 2; belt.scale.y = f ? 0.66 : 0.63; }
  if (skirt) {  // юбка-трапеция; платье — длиннее
    const len = dress ? 0.56 : 0.4;
    const sk = add(new T.CylinderGeometry(0.162 * H, (dress ? 0.29 : 0.24) * H, len * H, 40, 1, true), pants, 0, (0.99 - len / 2) * H, 0); sk.material.side = T.DoubleSide; sk.scale.z = 0.85;
  }
  if (p.tie) { const t = add(new T.BoxGeometry(0.034, 0.26, 0.01), cloth(p.tie), 0, 1.26 * H, 0.138); t.rotation.x = -0.14; }
  if (p.jacket) {  // пиджак: чуть шире торса, открыт спереди
    const jk = add(torsoGeo(1.07, 40, Math.PI * 0.14, Math.PI * 1.72), cloth(p.jacket), 0, 0.84 * H, 0);
    jk.scale.z = 0.72; jk.material.side = T.DoubleSide;
  }
  // руки: плечо → предплечье → кисть; кольцо на безымянном у тех, кто в браке
  const arms = [], sx = f ? 0.158 : 0.212;
  for (const s of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(s * sx * H, 1.39 * H, 0); body.add(sh);
    add(sph(f ? 0.046 : 0.06), sleeve, 0, 0, 0, sh);
    add(new T.CapsuleGeometry(f ? 0.042 : 0.054, 0.24, 8, 16), sleeve, 0, -0.16, 0, sh);
    const el = new T.Group(); el.position.set(0, -0.31, 0); sh.add(el);
    add(new T.CapsuleGeometry(f ? 0.035 : 0.045, 0.22, 8, 16), p.short && !p.jacket ? skin : sleeve, 0, -0.13, 0, el);
    const hand = add(sph(f ? 0.04 : 0.047), skin, 0, -0.285, 0.005, el); hand.scale.set(0.85, 1.2, 0.68);
    if (s === -1 && p.married) { const ring = add(new T.TorusGeometry(0.019, 0.006, 8, 20), phys('#f0c75a', 0.2, { metalness: 0.9, clearcoat: 1 }), 0, -0.305, 0, el); ring.rotation.x = Math.PI / 2; }
    sh.rotation.z = s * (f ? 0.2 : 0.12);
    arms.push({ sh, el, rest: s * (f ? 0.2 : 0.12) });
  }
  // шея и голова
  add(new T.CylinderGeometry(f ? 0.04 : 0.052, f ? 0.046 : 0.058, 0.14, 20), skin, 0, 1.53 * H, 0);
  const head = new T.Group(); head.position.set(0, 1.7 * H, 0.008); head.scale.setScalar(f ? 1.22 : 1.26); body.add(head);
  // голова — одна гладкая форма «яйцом» с сужением к подбородку; у женщин — уже и мягче
  const headProf = f ? [[0, -0.124], [0.036, -0.119], [0.064, -0.103], [0.088, -0.074], [0.103, -0.038], [0.11, 0.002], [0.111, 0.042], [0.104, 0.08], [0.084, 0.11], [0.052, 0.13], [0, 0.138]]
                     : [[0, -0.128], [0.048, -0.123], [0.08, -0.104], [0.097, -0.074], [0.107, -0.038], [0.112, 0.002], [0.112, 0.042], [0.104, 0.08], [0.084, 0.11], [0.052, 0.13], [0, 0.138]];
  const skull = add(new T.LatheGeometry(headProf.map(([r, y]) => new T.Vector2(r, y)), 48), skin, 0, 0, 0, head); skull.scale.set(f ? 0.9 : 0.94, 1, 1.0);
  for (const s of [-1, 1]) { const ear = add(sph(0.024), skin, s * (f ? 0.1 : 0.106), 0, -0.005, head); ear.scale.set(0.45, 1, 0.8); }
  const nose = add(sph(f ? 0.014 : 0.017), skin, 0, -0.014, 0.114, head); nose.scale.set(0.9, 1.1, 1.25);
  const bridge = add(new T.CapsuleGeometry(f ? 0.008 : 0.01, 0.03, 4, 10), skin, 0, 0.006, 0.106, head); bridge.rotation.x = 0.35;
  // глаза: белок, радужка, зрачок, блик; веко для моргания; у женщин — крупнее, с выразительными ресницами
  const eyes = [], lids = [], er = f ? 0.025 : 0.022;
  for (const s of [-1, 1]) {
    const eg = new T.Group(); eg.position.set(s * 0.041, 0.016, 0.091); head.add(eg);
    const white = add(sph(er), phys('#f8f5f0', 0.2, { clearcoat: 1, clearcoatRoughness: 0.1 }), 0, 0, 0, eg); white.scale.set(1, 0.82, 0.6);
    add(new T.CircleGeometry(er * 0.56, 28), phys(p.eyes || '#4a3a2a', 0.25, { clearcoat: 1 }), 0, -0.001, er * 0.605, eg);
    add(new T.CircleGeometry(er * 0.27, 20), phys('#0b0b0d', 0.2), 0, -0.001, er * 0.617, eg);
    add(new T.CircleGeometry(er * 0.11, 12), new T.MeshBasicMaterial({ color: '#ffffff' }), er * 0.15, er * 0.14, er * 0.63, eg);
    const lid = add(sph(er + 0.0015, 20, 12), skin, 0, 0.0005, 0.001, eg); lid.scale.set(1.04, 0.05, 0.7); lids.push(lid);
    const lash = add(new T.TorusGeometry(er * 0.93, f ? 0.0026 : 0.0016, 6, 20, Math.PI), phys('#140e0c', 0.5), 0, 0.002, er * 0.35, eg); lash.scale.set(1, 0.85, 1);
    if (fa) { const wing = add(new T.CapsuleGeometry(0.0022, 0.012, 3, 6), phys('#140e0c', 0.5), s * er * 0.98, er * 0.32, er * 0.3, eg); wing.rotation.z = s * -1.0; }  // стрелка у внешнего уголка
    const cheek = add(sph(0.02), new T.MeshStandardMaterial({ color: '#ff8f9a', transparent: true, opacity: f ? 0.18 : 0.08, roughness: 0.9, depthWrite: false }), s * 0.008, -0.042, -0.002, eg); cheek.scale.set(1.15, 0.6, 0.35); cheek.castShadow = false;
    eyes.push(eg);
  }
  const brows = [-1, 1].map(s => {
    if (f) { const b = add(new T.TorusGeometry(0.024, 0.0028, 6, 16, Math.PI * 0.62), hairM, s * 0.041, 0.034, 0.104, head); b.rotation.z = Math.PI * 0.19; b.scale.y = 0.55; b.userData = { rz: b.rotation.z, y: 0.034 }; return b; }
    const b = add(new T.BoxGeometry(0.038, 0.0085, 0.009), hairM, s * 0.042, 0.05, 0.106, head); b.userData = { rz: 0, y: 0.05 }; return b;
  });
  // рот: губы и тонкая линия между ними; изгиб линии — эмоция (улыбка / ровно / грусть), «просит» — приоткрыт.
  // У женщин — помада (цвет губ из пресета почти без смешивания с кожей)
  const lipCol = new T.Color(p.lips || '#b86a62').lerp(new T.Color(p.skin), fa ? 0.12 : 0.5);
  const lipM = phys(lipCol, 0.35, { clearcoat: fa ? 0.7 : 0.1, clearcoatRoughness: 0.3 });
  const mouth = new T.Group(); mouth.position.set(0, -0.056, 0.102); head.add(mouth);
  const upLip = add(sph(0.017, 24, 16), lipM, 0, 0.0035, 0, mouth); upLip.scale.set(f ? 1.2 : 1.25, f ? 0.3 : 0.24, 0.45);
  const loLip = add(sph(0.017, 24, 16), lipM, 0, -0.0048, 0.0005, mouth); loLip.scale.set(f ? 1.05 : 1.1, f ? 0.42 : 0.33, 0.5);
  const lineM = phys('#4e2626', 0.6);
  let line = null;
  const mouthO = add(sph(0.0105, 20, 14), phys('#3a1616', 0.6), 0, -0.002, 0.002, mouth); mouthO.scale.set(1.05, 0.95, 0.35); mouthO.visible = false;
  const setMouth = e => {  // c — прогиб середины: минус — уголки вверх (улыбка), плюс — вниз (грусть)
    const c = { happy: -0.0095, neutral: -0.0015, sad: 0.006, ask: -0.002 }[e] ?? -0.0015, w = e === 'happy' ? 0.022 : 0.018;
    if (line) { mouth.remove(line); line.geometry.dispose(); }
    const curve = new T.QuadraticBezierCurve3(new T.Vector3(-w, 0, 0.0035), new T.Vector3(0, c * 2, 0.0065), new T.Vector3(w, 0, 0.0035));
    line = add(new T.TubeGeometry(curve, 16, 0.0015, 6, false), lineM, 0, 0, 0, mouth); line.receiveShadow = false;
    line.visible = e !== 'ask'; mouthO.visible = e === 'ask';
    upLip.position.y = e === 'ask' ? 0.0075 : 0.0035; loLip.position.y = e === 'ask' ? -0.0105 : e === 'happy' ? -0.0058 : -0.0048;
  };
  setMouth('neutral');
  // причёски
  const hs = p.hair;
  if (hs !== 'bald') {
    const cap = add(new T.SphereGeometry(0.126, 40, 24, 0, Math.PI * 2, 0, hs === 'buzz' ? Math.PI * 0.42 : Math.PI * 0.5), hairM, 0, 0.012, -0.006, head);
    cap.scale.set(f ? 0.93 : 0.96, 1.14, 1.04); cap.rotation.x = -0.18;
    if (hs === 'quiff') { const q = add(sph(0.07), hairM, 0.01, 0.112, 0.052, head); q.scale.set(1.3, 0.55, 0.9); q.rotation.z = -0.15; }
    if (hs === 'short' || hs === 'quiff') for (const s of [-1, 1]) { const sb = add(sph(0.05), hairM, s * 0.097, 0.03, -0.02, head); sb.scale.set(0.42, 0.9, 1.3); }
    if (hs === 'short') { const fr = add(sph(0.06), hairM, 0.02, 0.1, 0.06, head); fr.scale.set(1.4, 0.45, 0.8); fr.rotation.z = -0.2; }
    if (hs === 'bob' || hs === 'long' || hs === 'ponytail' || hs === 'bun') {
      const back = add(sph(0.127, 36, 24), hairM, 0, -0.003, -0.03, head); back.scale.set(1.0, 1.1, 0.96);
      for (const s of [-1, 1]) { const side = add(new T.CapsuleGeometry(0.04, hs === 'long' ? 0.26 : hs === 'bob' ? 0.11 : 0.04, 8, 16), hairM, s * 0.092, hs === 'long' ? -0.12 : -0.06, -0.008, head); side.scale.z = 1.45; side.rotation.z = s * 0.06; }
    }
    if (hs === 'long') {  // длинные волны: копна сзади и пряди через плечо
      const l = add(new T.CapsuleGeometry(0.105, 0.24, 8, 20), hairM, 0, -0.15, -0.065, head); l.scale.set(1.12, 1, 0.6);
    }
    if (hs === 'bob') { const nape = add(sph(0.1), hairM, 0, -0.07, -0.05, head); nape.scale.set(1.15, 0.7, 0.9); }
    if (hs === 'bun') { add(sph(0.055), hairM, 0, 0.1, -0.08, head); }
    if (hs === 'ponytail') { const pt = add(new T.CapsuleGeometry(0.036, 0.24, 8, 16), hairM, 0, -0.1, -0.135, head); pt.rotation.x = 0.3; add(sph(0.034), hairM, 0, 0.04, -0.118, head); }
    if (f) { const fr = add(sph(0.07), hairM, -0.035, 0.075, 0.072, head); fr.scale.set(1.2, 0.36, 0.55); fr.rotation.z = 0.45; }  // косая чёлка
  }
  if (p.beard) {
    const bd = add(new T.SphereGeometry(0.1, 32, 20, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.42), phys(p.beardColor || p.hairColor, 0.7, { sheen: 0.6 }), 0, -0.035, 0.012, head);
    bd.scale.set(0.92, 1.05, 1.02);
    const mus = add(new T.CapsuleGeometry(0.008, 0.035, 4, 8), phys(p.beardColor || p.hairColor, 0.7), 0, -0.038, 0.112, head); mus.rotation.z = Math.PI / 2;
  }
  if (p.glasses) {
    const gm = phys('#1a1a1f', 0.25, { metalness: 0.5, clearcoat: 1 });
    for (const s of [-1, 1]) add(new T.TorusGeometry(f ? 0.028 : 0.026, 0.0026, 8, 28), gm, s * 0.041, 0.018, 0.122, head);
    add(new T.BoxGeometry(0.03, 0.004, 0.004), gm, 0, 0.022, 0.123, head);
    for (const s of [-1, 1]) { const arm = add(new T.BoxGeometry(0.004, 0.004, 0.1), gm, s * 0.07, 0.022, 0.07, head); arm.rotation.y = s * 0.12; }
  }
  head.traverse(o => { o.receiveShadow = false; });  // без самозатенения лица: иначе «грязные» пятна на подбородке
  if (p.kid) { root.scale.setScalar(0.64); head.scale.multiplyScalar(1.24); }  // ребёнок: меньше ростом, голова крупнее
  root.userData = { body, head, chest, arms, legs, eyes, lids, brows, setMouth, mouthEmo: 'neutral', H, f, kid: !!p.kid };
  return root;
}


// ---------- предметы для мультиков: транспорт и удочка ----------
// Строятся в координатах персонажа (смотрит в +z, сиденье — в начале координат), крепятся к нему и едут вместе.
// seat — насколько опустить тело (сесть), legs — поза ног: число (сидя, ноги вперёд), 'pedal' (крутит педали), 'push' (отталкивается)
const PROPS = {
  moto:    { seat: -0.3, legs: -1.15, arms: [-1.0, 0.12, -0.7] },
  bike:    { seat: -0.07, legs: 'pedal', arms: [-0.95, 0.1, -0.65] },
  car:     { seat: -0.5, legs: -1.45, arms: [-0.95, 0.05, -0.75] },
  boat:    { seat: -0.58, legs: -1.4, arms: 'row' },
  scooter: { seat: 0.07, legs: 'push', arms: [-0.9, 0.08, -0.55] },
  skate:   { seat: 0.1, legs: 'push', arms: [-0.1, 1.0, -0.2] },
  rod:     { seat: 0, legs: 0, arms: [-1.0, 0.05, -0.55] },
};
function buildProp(T, kind) {
  const g = new T.Group(), wheels = [];
  const M = (color, rough = 0.4, extra = {}) => new T.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0.1, clearcoat: 0.6, ...extra });
  const add = (geo, m, x = 0, y = 0, z = 0) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  const bar = (a, b, r, m) => {  // цилиндр между двумя точками
    const A = new T.Vector3(...a), B = new T.Vector3(...b), d = B.clone().sub(A);
    const o = add(new T.CylinderGeometry(r, r, d.length(), 12), m); o.position.copy(A).add(B).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); return o;
  };
  const wheel = (z, r, tube, x = 0, tire = M('#18181c', 0.8, { clearcoat: 0 })) => {
    const w = new T.Group(); w.position.set(x, r, z); g.add(w);
    const t = new T.Mesh(new T.TorusGeometry(r - tube, tube, 12, 36), tire); t.rotation.y = Math.PI / 2; t.castShadow = true; w.add(t);
    const hub = new T.Mesh(new T.CylinderGeometry(r * 0.32, r * 0.32, tube * 1.6, 16), M('#c9ccd4', 0.25, { metalness: 0.8 })); hub.rotation.z = Math.PI / 2; w.add(hub);
    for (let i = 0; i < 3; i++) { const sp = new T.Mesh(new T.BoxGeometry(0.01, (r - tube) * 2, 0.012), M('#c9ccd4', 0.3, { metalness: 0.8 })); sp.rotation.x = i * Math.PI / 3; w.add(sp); }
    wheels.push({ w, r }); return w;
  };
  const chrome = M('#d8dbe2', 0.2, { metalness: 0.9 }), black = M('#1b1b20', 0.5);
  if (kind === 'moto') {
    const red = M('#d6283a', 0.3);
    wheel(0.58, 0.28, 0.07); wheel(-0.5, 0.29, 0.08);
    const body = add(new T.BoxGeometry(0.2, 0.22, 0.72), red, 0, 0.52, 0.05); body.rotation.x = 0.08;
    const tank = add(new T.SphereGeometry(0.16, 24, 16), red, 0, 0.7, 0.24); tank.scale.set(0.85, 0.6, 1.3);
    add(new T.BoxGeometry(0.24, 0.07, 0.42), black, 0, 0.66, -0.16);
    bar([0, 0.28, 0.58], [0, 0.92, 0.42], 0.025, chrome);
    const hb = add(new T.CylinderGeometry(0.018, 0.018, 0.6, 10), black, 0, 0.94, 0.4); hb.rotation.z = Math.PI / 2;
    add(new T.SphereGeometry(0.06, 16, 12), new T.MeshStandardMaterial({ color: '#fff6c8', emissive: '#ffe680', emissiveIntensity: 1.2 }), 0, 0.8, 0.52);
    bar([0.13, 0.33, -0.05], [0.13, 0.4, -0.62], 0.035, chrome);
    add(new T.BoxGeometry(0.16, 0.18, 0.22), M('#2a2a30', 0.4, { metalness: 0.6 }), 0, 0.38, 0.12);  // мотор
  }
  if (kind === 'bike' || kind === 'scooter' || kind === 'skate') {
    const col = M(kind === 'bike' ? '#1fa5d6' : kind === 'scooter' ? '#ff5c8a' : '#ffb02e', 0.35);
    if (kind === 'bike') {
      wheel(0.52, 0.32, 0.025); wheel(-0.5, 0.32, 0.025);
      const B = [0, 0.38, 0.02], S = [0, 0.86, -0.06], Hd = [0, 0.86, 0.42];
      bar(B, S, 0.02, col); bar(S, Hd, 0.02, col); bar(B, Hd, 0.022, col); bar(B, [0, 0.32, -0.5], 0.016, col); bar(S, [0, 0.32, -0.5], 0.016, col);
      bar(Hd, [0, 0.32, 0.52], 0.018, chrome); bar([0, 0.86, 0.42], [0, 1.0, 0.4], 0.018, chrome);
      const hb = add(new T.CylinderGeometry(0.015, 0.015, 0.5, 10), black, 0, 1.0, 0.4); hb.rotation.z = Math.PI / 2;
      const seat = add(new T.BoxGeometry(0.12, 0.05, 0.22), black, 0, 0.9, -0.06);
      seat.scale.x = 1;
    } else if (kind === 'scooter') {
      wheel(0.3, 0.07, 0.025); wheel(-0.3, 0.07, 0.025);
      add(new T.BoxGeometry(0.14, 0.035, 0.6), col, 0, 0.1, 0);
      bar([0, 0.1, 0.3], [0, 1.0, 0.33], 0.02, chrome);
      const hb = add(new T.CylinderGeometry(0.016, 0.016, 0.42, 10), black, 0, 1.0, 0.33); hb.rotation.z = Math.PI / 2;
    } else {
      for (const x of [-0.08, 0.08]) { wheel(0.25, 0.045, 0.02, x, M('#f5f0e6', 0.5)); wheel(-0.25, 0.045, 0.02, x, M('#f5f0e6', 0.5)); }
      const d = add(new T.BoxGeometry(0.22, 0.025, 0.78), col, 0, 0.1, 0); d.scale.set(1, 1, 1);
    }
  }
  if (kind === 'car') {
    const paint = M('#e8b23a', 0.25);
    for (const x of [-0.43, 0.43]) { wheel(0.95, 0.25, 0.08, x); wheel(-0.5, 0.25, 0.08, x); }
    add(new T.BoxGeometry(0.86, 0.34, 1.95), paint, 0, 0.42, 0.22);
    const hood = add(new T.BoxGeometry(0.84, 0.1, 0.7), paint, 0, 0.62, 0.8); hood.rotation.x = 0.06;
    const ws = add(new T.BoxGeometry(0.8, 0.32, 0.02), new T.MeshPhysicalMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.45, roughness: 0.05 }), 0, 0.8, 0.42); ws.rotation.x = -0.45;
    add(new T.BoxGeometry(0.4, 0.5, 0.1), M('#3a2a24', 0.6), 0, 0.72, -0.28);  // спинка сиденья
    const st = add(new T.TorusGeometry(0.11, 0.015, 8, 24), black, 0, 0.82, 0.3); st.rotation.x = -0.5;
    for (const x of [-0.3, 0.3]) add(new T.SphereGeometry(0.06, 14, 10), new T.MeshStandardMaterial({ color: '#fff6c8', emissive: '#ffe680', emissiveIntensity: 1 }), x, 0.5, 1.2);
  }
  if (kind === 'boat') {
    const hull = M('#f4f6fa', 0.3), stripe = M('#2563c9', 0.3);
    const outline = (k, z0) => { const sh = new T.Shape(); [[-0.33, -0.85], [0.33, -0.85], [0.34, 0.45], [0, 1.05], [-0.34, 0.45]].forEach(([x, z], i) => sh[i ? 'lineTo' : 'moveTo'](x * k, -z * k)); return sh; };
    const h = add(new T.ExtrudeGeometry(outline(1), { depth: 0.26, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 }), hull, 0, 0.03, 0); h.rotation.x = -Math.PI / 2;
    const st = add(new T.ExtrudeGeometry(outline(1.02), { depth: 0.05, bevelEnabled: false }), stripe, 0, 0.22, 0); st.rotation.x = -Math.PI / 2;
    add(new T.BoxGeometry(0.6, 0.05, 0.3), M('#9a6a3a', 0.6), 0, 0.33, 0);
    add(new T.BoxGeometry(0.16, 0.36, 0.16), black, 0, 0.36, -0.86);  // мотор
  }
  if (kind === 'rod') {
    const rod = bar([0.05, 0.98, 0.32], [0.12, 1.85, 1.3], 0.012, M('#3a2a1a', 0.5));
    bar([0.12, 1.85, 1.3], [0.14, 0.25, 1.55], 0.004, new T.MeshBasicMaterial({ color: '#f0f0f0' }));
    add(new T.SphereGeometry(0.035, 14, 10), M('#ff3b3b', 0.3), 0.14, 0.25, 1.55);
    add(new T.CylinderGeometry(0.04, 0.04, 0.04, 16), chrome, 0.08, 1.05, 0.38).rotation.z = Math.PI / 2;
    rod.castShadow = true;
  }
  g.userData = { wheels };
  return g;
}

// Сцена, свет, камера. framing: 'full' — во весь рост, 'bust' — по пояс
function makeScene(T, canvas, framing, stage = false) {  // stage — сцена мультика: земля шире, без светящегося круга
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(framing === 'full' ? 30 : 24, 1, 0.1, 20);
  scene.add(new T.HemisphereLight('#e4ecff', '#3a2c48', 1.0));
  const key = new T.DirectionalLight('#fff3e6', 2.4); key.position.set(1.6, 3.2, 2.6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 0.5; key.shadow.camera.far = 8; key.shadow.radius = 4; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  const sc = stage ? 3.2 : 1.2; for (const k of ['left', 'bottom']) key.shadow.camera[k] = -sc; for (const k of ['right', 'top']) key.shadow.camera[k] = sc;
  scene.add(key);
  const fill = new T.DirectionalLight('#ffe9dc', 0.9); fill.position.set(-0.6, 1.6, 3); scene.add(fill);  // мягкий фронтальный — лицо не в тени
  const rim = new T.DirectionalLight('#7ff3ff', 1.4); rim.position.set(-2, 2.2, -2.5); scene.add(rim);
  const rim2 = new T.DirectionalLight('#ff8ae6', 0.7); rim2.position.set(2.4, 1.2, -2); scene.add(rim2);
  const ground = new T.Mesh(new T.CircleGeometry(stage ? 6 : 0.75, 48), new T.ShadowMaterial({ opacity: 0.38 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const glow = new T.Mesh(new T.RingGeometry(0.5, 0.62, 64), new T.MeshBasicMaterial({ color: '#2de2e6', transparent: true, opacity: 0.35 })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.002; if (!stage) scene.add(glow);
  // full — во весь рост; bust — по пояс; face — лицо и плечи (превью)
  const aim = { full: [0.9, 4.0, 0.2], bust: [1.47, 2.1, 0.06], face: [1.67, 1.25, 0.02], kid: [0.66, 2.9, 0.1], pet: [0.48, 2.7, 0.2], wide: [0.8, 6.4, 0.3] }[framing] || [0.9, 4.0, 0.2];
  cam.position.set(0, aim[0] + aim[2], aim[1]); cam.lookAt(0, aim[0], 0);
  return { renderer, scene, cam };
}

const EMO = {
  happy:   { brow: 0.12, browY: 0.052 },
  neutral: { brow: 0, browY: 0.05 },
  sad:     { brow: -0.28, browY: 0.047 },
  ask:     { brow: 0.22, browY: 0.056 },
};

// Брови под эмоцию (от базового положения каждой брови)
const setBrows = (u, emo) => { for (const [i, b] of u.brows.entries()) { b.rotation.z = b.userData.rz + (i ? -1 : 1) * emo.brow; b.position.y = b.userData.y + emo.browY - 0.05; } };

// Позы рук для действий мультиков: [плечо x, плечо z (наружу), локоть x] — для левой и правой руки
const POSE = {
  walk:  t => { const w = Math.sin(t * 7) * 0.42; return [[w, 0, -0.15], [-w, 0, -0.15]]; },
  hold:  () => [[-0.75, -0.05, -0.95], [-0.75, -0.05, -0.95]],
  cheer: t => [[-0.2, 2.45 + Math.sin(t * 9) * 0.18, -0.35], [-0.2, 2.45 + Math.sin(t * 9 + 1) * 0.18, -0.35]],
  jump:  () => [[-0.1, 2.3, -0.3], [-0.1, 2.3, -0.3]],
  phone: () => [[0.03, 0, -0.05], [-0.65, 0.2, -2.1]],
  give:  () => [[0.03, 0, -0.05], [-1.25, 0.05, -0.15]],
  hug:   t => [[-1.1, 0.5 + Math.sin(t * 3) * 0.05, -0.9], [-1.1, 0.5 + Math.sin(t * 3) * 0.05, -0.9]],
  spin:  () => [[0, 0.5, -0.2], [0, 0.5, -0.2]],
  show:  t => [[0.03, 0, -0.05], [-1.3 + Math.sin(t * 2) * 0.05, 0.18, -0.45]],  // протягивает покупку к зрителю
};

// Картинка-предмет (эмодзи) как спрайт: всегда повёрнута к камере и рисуется поверх — покупку видно, даже если рука перед телом
const emojiSprite = (T, e, size) => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); g.font = '100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 64, 70);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
  const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); s.renderOrder = 10; s.scale.setScalar(size); return s;
};

// Живой просмотр на canvas. Возвращает { setEmotion, setPreset, setAction, dispose }; null — если WebGL недоступен.
// setAction('walk' | 'hold' | 'cheer' | 'jump' | 'phone' | 'give' | 'hug' | 'spin' | null) — движения для мультиков
async function heroViewer(canvas, preset, { framing = 'full', emotion = 'neutral', interactive = true, yawRest = null, stage = false } = {}) {
  let T; try { T = await three(); } catch { return null; }
  let ctx; try { ctx = makeScene(T, canvas, framing, stage); } catch { return null; }
  const { renderer, scene, cam } = ctx;
  let hero = buildHero(T, preset), emo = EMO[emotion] || EMO.neutral, emoName = emotion, action = null, actT = 0, prop = null, propK = null, moving = 0, held = null;
  scene.add(hero);
  const size = () => { const w = canvas.clientWidth || 200, h = canvas.clientHeight || 260; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size();
  let yaw = yawRest ?? -0.35, drag = null, raf = 0, alive = true, nextBlink = performance.now() + 1500, t0 = performance.now(), last = t0;
  if (interactive) {
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, yaw }; canvas.setPointerCapture?.(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (drag) yaw = drag.yaw + (e.clientX - drag.x) * 0.012; });
    const up = () => { drag = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null; ro?.observe(canvas);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ka = 0.12;  // плавность — от времени кадра: на медленных устройствах позы успевают так же
  const ease = (o, k, v) => { o[k] += (v - o[k]) * ka; };
  const frame = now => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); last = now; ka = 1 - Math.exp(-dt * 8);
    if (document.hidden || !canvas.isConnected) return;
    const t = (now - t0) / 1000, u = hero.userData, at = (now - actT) / 1000;
    if (action === 'spin') yaw += dt * 7.5;
    else if (!drag) {
      const rest = yawRest ?? Math.sin(t * 0.25) * 0.35 - 0.2;  // сам медленно возвращается и чуть поворачивается
      if (Math.abs(yaw - rest) > Math.PI) yaw = rest + ((yaw - rest) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;  // после вращения — кратчайший путь
      yaw += (rest - yaw) * (yawRest != null ? 0.08 : 0.015);
    }
    hero.rotation.y = yaw;
    if (!RM) {
      u.chest.scale.y = 1 + Math.sin(t * 1.6) * 0.012;                    // дыхание
      u.head.rotation.y = action ? Math.sin(t * 0.9) * 0.1 : Math.sin(t * 0.5) * 0.18;
      u.head.rotation.x = Math.sin(t * 0.37) * 0.04 + (action === 'phone' ? 0.3 : emoName === 'sad' ? 0.14 : emoName === 'ask' ? -0.06 : 0);
      let by = Math.sin(t * 1.6) * 0.004;
      if (action === 'walk') by = Math.abs(Math.sin(t * 7)) * 0.018;
      if (action === 'jump') by = Math.max(0, Math.sin(at * 5.5)) * 0.13;
      if (action === 'cheer') by = Math.abs(Math.sin(t * 4.5)) * 0.03;
      if (!action && emoName === 'happy') by += Math.abs(Math.sin(t * 2.2)) * 0.006;
      const P = PROPS[propK];
      if (P) {  // сидит на транспорте / рыбачит
        const bob = propK === 'boat' ? Math.sin(t * 2.2) * 0.025 : 0;
        prop.position.y = bob; if (propK === 'rod') prop.rotation.x = Math.sin(t * 1.3) * 0.02;
        u.body.position.y = P.seat + bob + (propK === 'moto' || propK === 'car' ? Math.sin(t * 30) * 0.002 * moving : 0);
        const L0 = P.legs === 'pedal' ? -0.75 + Math.sin(t * 8) * 0.35 : P.legs === 'push' ? 0 : P.legs, L1 = P.legs === 'pedal' ? -0.75 - Math.sin(t * 8) * 0.35 : P.legs === 'push' ? Math.max(0, Math.sin(t * 5)) * 0.45 * moving : P.legs;
        ease(u.legs[0].rotation, 'x', L0); ease(u.legs[1].rotation, 'x', L1);
      } else {
        u.body.position.y = by;
        const w = action === 'walk' ? Math.sin(t * 7) * 0.45 : 0;
        ease(u.legs[0].rotation, 'x', w); ease(u.legs[1].rotation, 'x', -w);
      }
      const propArms = P && !action ? (P.arms === 'row' ? [[-0.8 + Math.sin(t * 3) * 0.4, 0.15, -0.3], [-0.8 + Math.sin(t * 3) * 0.4, 0.15, -0.3]] : [P.arms, P.arms]) : null;
      const pose = propArms || POSE[action]?.(at) || [[Math.sin(t * 1.1) * 0.04, 0, -0.05], emoName === 'ask' ? [-0.95, 0, -0.7 + Math.sin(t * 2.4) * 0.08] : [0.03, 0, -0.05]];  // «просит»: правая рука ладонью вверх
      u.arms.forEach((a, i) => { const [x, z, e] = pose[i], s = i ? 1 : -1; ease(a.sh.rotation, 'x', x); ease(a.sh.rotation, 'z', a.rest + s * z); ease(a.el.rotation, 'x', e); });
    }
    // моргание
    const blink = now > nextBlink ? Math.min(1, (now - nextBlink) / 70) : 0;
    const lidY = blink < 1 ? 0.05 + Math.sin(blink * Math.PI) * 0.95 : 0.05;
    if (now > nextBlink + 140) nextBlink = now + 2200 + Math.random() * 2600;
    for (const l of u.lids) l.scale.y = lidY;
    setBrows(u, emo);
    if (u.mouthEmo !== emoName) { u.setMouth(emoName); u.mouthEmo = emoName; }  // геометрию рта — только при смене эмоции
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);
  return {
    setEmotion(e) { emo = EMO[e] || EMO.neutral; emoName = e; },
    setPreset(p) { const x = hero.position.x; scene.remove(hero); hero = buildHero(T, p); hero.position.x = x; if (prop) hero.add(prop); if (held) hero.userData.arms[1].el.add(held); scene.add(hero); },
    setAction(a) { action = a || null; actT = performance.now(); },
    setProp(k) {  // транспорт или удочка — крепится к персонажу
      if (prop) { hero.remove(prop); prop = null; } propK = PROPS[k] ? k : null;
      if (propK) { prop = buildProp(T, propK); hero.add(prop); }
    },
    place(x, z = 0) {  // переместить (колёса крутятся сами); moving — для покачивания и отталкивания ногой
      const dx = Math.hypot(x - hero.position.x, z - hero.position.z); moving = dx > 0.001 ? 1 : moving * 0.9;
      for (const { w, r } of prop?.userData.wheels || []) w.rotation.x += dx / (r * hero.scale.x);
      hero.position.x = x; hero.position.z = z;
    },
    setYaw(v) { yawRest = v; },
    hold(e, size = 0.3) {  // покупка в правой руке (null — убрать)
      const hand = hero.userData.arms[1].el;
      if (held) { held.parent?.remove(held); held.material.map.dispose(); held = null; }
      if (e) { held = emojiSprite(T, e, size / (hero.userData.kid ? 0.8 : 1)); held.position.set(0, -0.36, 0.06); hand.add(held); }
    },
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
    setBrows(u, EMO.happy);
    u.setMouth('happy');
    renderer.render(scene, cam); out.push(canvas.toDataURL('image/png'));
    scene.remove(hero);
  }
  renderer.dispose(); renderer.forceContextLoss?.();
  return out;
}
