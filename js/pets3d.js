// 3D-питомцы: кошки, собаки, попугаи и рыбки в аквариуме — разных пород и окраса (породы — PET_BREEDS в js/pets.js).
// Собираются из простых форм three.js, как и персонаж (js/hero3d.js), с «живой» анимацией: дыхание, хвост, моргание,
// и действиями для мультиков: eat (ест из миски), play (прыгает), happy (радуется), sad (грустит).

function buildPet(T, b) {
  const g = new T.Group(), s = b.size || 1;
  const phys = (color, rough = 0.8, extra = {}) => new T.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, ...extra });
  const fur = c => phys(c, 0.85, { sheen: 0.8, sheenColor: new T.Color(c).lerp(new T.Color('#ffffff'), 0.4), sheenRoughness: 0.6 });
  const add = (geo, m, x = 0, y = 0, z = 0, parent = g) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const sph = (r, w = 24, h = 18) => new T.SphereGeometry(r, w, h);
  const body = new T.Group(); g.add(body);
  const u = { body, tail: null, head: null, ears: [], eyes: [], legs: [], wings: [], fish: null, kind: b.kind };
  const main = fur(b.color), alt = fur(b.alt || b.color), pt = b.points ? fur(b.points) : main;
  const eye = (parent, x, y, z, r, col, slit) => {
    const e = new T.Group(); e.position.set(x, y, z); parent.add(e);
    add(sph(r, 16, 12), phys(col || '#3a2a1a', 0.2, { clearcoat: 1 }), 0, 0, 0, e).scale.set(1, 1, 0.6);
    const p = add(sph(r * 0.55, 12, 10), phys('#0a0a0c', 0.2), 0, 0, r * 0.35, e); p.scale.set(slit ? 0.35 : 1, 1, 0.5);
    add(sph(r * 0.2, 8, 6), new T.MeshBasicMaterial({ color: '#ffffff' }), r * 0.3, r * 0.35, r * 0.55, e);
    u.eyes.push(e); return e;
  };
  if (b.kind === 'cat' || b.kind === 'dog') {
    const dog = b.kind === 'dog', legH = (b.shortLegs ? 0.13 : dog ? 0.27 : 0.24), bodyY = legH + (dog ? 0.17 : 0.15), len = b.long ? 2.3 : dog ? 1.55 : 1.45;
    const torso = add(sph(dog ? 0.2 : 0.18, 28, 20), main, 0, bodyY, 0, body); torso.scale.set(dog ? 0.9 : 0.85, 0.82, len);
    if (b.belly) { const be = add(sph(dog ? 0.17 : 0.15, 24, 16), alt, 0, bodyY - 0.05, 0.08, body); be.scale.set(0.8, 0.7, len * 0.8); }
    if (b.stripes) for (let i = 0; i < 4; i++) { const st = add(sph(0.06, 16, 10), fur(b.stripes), 0, bodyY + 0.13, -0.16 + i * 0.11, body); st.scale.set(2.1, 0.35, 0.45); }
    if (b.mane) { const mn = add(sph(0.17, 24, 16), main, 0, bodyY + 0.08, 0.17 * len * 0.6, body); mn.scale.set(1.15, 1.05, 0.9); }
    // ноги и лапы
    const zf = 0.17 * len * 0.62, legR = dog ? 0.042 : 0.034;
    for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const lg = new T.Group(); lg.position.set(x * (dog ? 0.1 : 0.085), legH, z * zf); body.add(lg);
      add(new T.CapsuleGeometry(legR, legH, 6, 12), b.points ? pt : main, 0, -legH / 2 + 0.04, 0, lg);  // нога уходит в тело — без зазора
      add(sph(legR * 1.2, 12, 10), b.paws ? fur(b.paws) : b.points ? pt : main, 0, -legH + 0.01, 0.015, lg).scale.set(1, 0.6, 1.3);
      u.legs.push(lg);
    }
    // голова
    const head = new T.Group(); head.position.set(0, bodyY + (dog ? 0.2 : 0.17), 0.17 * len * 0.75 + (dog ? 0.08 : 0.06)); body.add(head); u.head = head;
    const hr = dog ? 0.14 : 0.13;
    add(sph(hr, 28, 20), b.mask ? pt : main, 0, 0, 0, head).scale.set(1.08, 0.98, 1);
    if (b.face) add(sph(hr * 0.75, 20, 14), fur(b.face), 0, -0.035, 0.05, head).scale.set(1.05, 0.8, 0.9);
    if (dog) {
      const flat = b.flat;
      const mz = add(sph(0.075, 20, 14), b.muzzle ? fur(b.muzzle) : b.face ? fur(b.face) : main, 0, -0.04, hr * 0.85, head); mz.scale.set(1.05, 0.85, flat ? 0.6 : 1.4);
      add(sph(0.028, 12, 10), phys('#141414', 0.3, { clearcoat: 1 }), 0, -0.01, hr * 0.85 + (flat ? 0.05 : 0.105), head);
      const tongue = add(sph(0.025, 12, 8), phys('#ff7a8a', 0.5), 0, -0.085, hr * 0.85 + (flat ? 0.03 : 0.07), head); tongue.scale.set(1, 0.4, 1.3); u.tongue = tongue;
      eye(head, -0.055, 0.035, hr * 0.85, 0.024, b.eyes || '#3a2414');
      eye(head, 0.055, 0.035, hr * 0.85, 0.024, b.eyes || '#3a2414');
      for (const sx of [-1, 1]) {
        if (b.ears === 'floppy') { const ear = add(sph(0.065, 16, 12), b.earColor ? fur(b.earColor) : main, sx * 0.12, -0.02, -0.01, head); ear.scale.set(0.35, 1.2, 0.8); ear.rotation.z = sx * 0.25; u.ears.push(ear); }
        else { const ear = add(new T.ConeGeometry(b.ears === 'big' ? 0.06 : 0.045, b.ears === 'big' ? 0.15 : 0.11, 12), b.earColor ? fur(b.earColor) : main, sx * 0.075, hr * 0.85, -0.01, head); ear.rotation.z = -sx * 0.25; u.ears.push(ear); }
      }
      // хвост: прямой (виляет) или колечком на спине
      const tail = new T.Group(); tail.position.set(0, bodyY + 0.06, -0.17 * len * 0.85); body.add(tail); u.tail = tail;
      if (b.curl) { const t = add(new T.TorusGeometry(0.055, 0.028, 10, 20, Math.PI * 1.5), main, 0, 0.07, -0.01, tail); t.rotation.y = Math.PI / 2; }
      else if (!b.stub) { const t = add(new T.CylinderGeometry(0.018, 0.03, 0.22, 10), main, 0, 0.09, -0.06, tail); t.rotation.x = -0.7; }
    } else {
      add(sph(0.045, 14, 10), b.face ? fur(b.face) : main, -0.03, -0.05, hr * 0.8, head).scale.set(1, 0.8, 0.8);
      add(sph(0.045, 14, 10), b.face ? fur(b.face) : main, 0.03, -0.05, hr * 0.8, head).scale.set(1, 0.8, 0.8);
      add(sph(0.016, 10, 8), phys('#f08a9a', 0.4), 0, -0.025, hr * 0.98, head).scale.set(1.2, 0.8, 0.8);
      eye(head, -0.05, 0.02, hr * 0.82, 0.03, b.eyes || '#7ac943', true);
      eye(head, 0.05, 0.02, hr * 0.82, 0.03, b.eyes || '#7ac943', true);
      const wm = new T.MeshBasicMaterial({ color: '#f2f2f2' });
      for (const sx of [-1, 1]) for (const k of [-1, 0, 1]) { const w = add(new T.CylinderGeometry(0.0018, 0.0018, 0.13, 4), wm, sx * 0.09, -0.045 + k * 0.012, hr * 0.78, head); w.rotation.z = Math.PI / 2 + k * 0.12 * sx; w.castShadow = false; }
      for (const sx of [-1, 1]) {
        const big = b.ears === 'big';
        const ear = add(new T.ConeGeometry(big ? 0.07 : 0.05, big ? 0.15 : 0.1, 4), b.points ? pt : main, sx * 0.075, hr * 0.8, -0.01, head); ear.rotation.z = -sx * 0.3; ear.rotation.y = Math.PI / 4; u.ears.push(ear);
        add(new T.ConeGeometry(big ? 0.045 : 0.03, big ? 0.1 : 0.065, 4), phys('#f2a6b0', 0.6), sx * 0.075, hr * 0.78, 0.008, head).rotation.set(0, Math.PI / 4, -sx * 0.3);
        if (b.tufts) add(new T.ConeGeometry(0.01, 0.06, 6), main, sx * 0.095, hr * 0.8 + 0.08, -0.01, head).rotation.z = -sx * 0.3;
      }
      const tail = new T.Group(); tail.position.set(0, bodyY + 0.02, -0.17 * len * 0.85); body.add(tail); u.tail = tail;
      const curve = new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(0, 0.12, -0.12), new T.Vector3(0, 0.3, -0.13), new T.Vector3(0, 0.38, -0.05)]);
      add(new T.TubeGeometry(curve, 20, b.fluffy ? 0.045 : 0.025, 10, false), b.points ? pt : b.stripes ? fur(b.stripes) : main, 0, 0, 0, tail);
    }
    if (b.collar) { const c = add(new T.TorusGeometry(dog ? 0.1 : 0.085, 0.015, 8, 24), phys(b.collar, 0.4, { clearcoat: 0.6 }), 0, head.position.y - 0.1, head.position.z - 0.06, body); c.rotation.x = Math.PI / 2 + 0.5; }
  }
  if (b.kind === 'parrot') {
    const stand = phys('#8a5a32', 0.7);
    add(new T.CylinderGeometry(0.02, 0.02, 0.5, 10), stand, 0, 0.42, 0).rotation.z = Math.PI / 2;
    add(new T.CylinderGeometry(0.02, 0.02, 0.42, 10), stand, 0, 0.21, 0);
    add(new T.CylinderGeometry(0.14, 0.16, 0.03, 20), stand, 0, 0.015, 0);
    const bodyM = fur(b.color), wingM = fur(b.alt || b.color);
    const tr = add(sph(0.11, 24, 18), bodyM, 0, 0.58, 0, body); tr.scale.set(0.95, 1.35, 1); tr.rotation.x = 0.2;
    if (b.belly) add(sph(0.09, 20, 14), fur(b.belly), 0, 0.56, 0.035, body).scale.set(0.85, 1.3, 0.9);
    const head = new T.Group(); head.position.set(0, 0.76, 0.035); body.add(head); u.head = head;
    add(sph(0.08, 22, 16), fur(b.head || b.color), 0, 0, 0, head);
    if (b.cheek) for (const sx of [-1, 1]) add(sph(0.025, 12, 10), fur(b.cheek), sx * 0.055, -0.015, 0.035, head).scale.set(0.5, 1, 1);
    const beak = add(new T.ConeGeometry(0.028, 0.07, 12), phys(b.beak || '#3a3a3a', 0.35, { clearcoat: 0.6 }), 0, -0.02, 0.085, head); beak.rotation.x = Math.PI / 2 + 0.6;
    eye(head, -0.045, 0.015, 0.058, 0.016, '#111'); eye(head, 0.045, 0.015, 0.058, 0.016, '#111');
    if (b.crest) for (let i = 0; i < 4; i++) { const c = add(new T.ConeGeometry(0.012, 0.11 - i * 0.012, 6), fur(b.crest), 0, 0.08, -0.01 - i * 0.012, head); c.rotation.x = -0.4 - i * 0.18; }
    for (const sx of [-1, 1]) { const wg = new T.Group(); wg.position.set(sx * 0.095, 0.62, -0.01); body.add(wg); const w = add(sph(0.08, 18, 14), wingM, 0, -0.04, -0.02, wg); w.scale.set(0.3, 1.2, 0.9); u.wings.push(wg); }
    const tl = add(new T.BoxGeometry(0.06, b.longTail ? 0.42 : 0.2, 0.012), fur(b.tail || b.alt || b.color), 0, b.longTail ? 0.32 : 0.42, -0.08, body); tl.rotation.x = 0.35; u.tail = tl;
    for (const sx of [-1, 1]) add(sph(0.018, 10, 8), phys('#7a7a7a', 0.6), sx * 0.035, 0.445, 0.02, body);
  }
  if (b.kind === 'fish') {
    const tank = new T.Group(); g.add(tank);
    add(new T.BoxGeometry(0.8, 0.24, 0.34), phys('#7a5a3a', 0.7), 0, 0.12, 0, tank);  // тумба
    add(new T.BoxGeometry(0.9, 0.06, 0.4), phys('#2a2a32', 0.5), 0, 0.27, 0, tank);
    add(new T.BoxGeometry(0.86, 0.4, 0.36), new T.MeshPhysicalMaterial({ color: '#9fdcff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0, depthWrite: false }), 0, 0.5, 0, tank).castShadow = false;
    add(new T.BoxGeometry(0.84, 0.05, 0.34), phys('#e8d2a0', 0.95), 0, 0.325, 0, tank);
    for (const [x, h] of [[-0.3, 0.22], [-0.24, 0.16], [0.3, 0.26]]) add(new T.ConeGeometry(0.03, h, 8), phys('#2fa84f', 0.6), x, 0.35 + h / 2, -0.08, tank);
    add(new T.BoxGeometry(0.9, 0.03, 0.4), phys('#3a3a44', 0.4), 0, 0.715, 0, tank);
    const fish = new T.Group(); fish.position.set(0, 0.52, 0.02); g.add(fish); u.fish = fish;
    const fm = phys(b.color, 0.35, { clearcoat: 0.8, sheen: 0.5 });
    add(sph(0.05, 20, 14), fm, 0, 0, 0, fish).scale.set(1.6 * (b.slim ? 0.9 : 1), 1, 0.55);
    if (b.stripe) add(sph(0.05, 16, 10), phys(b.stripe, 0.3, { emissive: b.stripe, emissiveIntensity: 0.4 }), 0.01, 0.005, 0, fish).scale.set(1.3, 0.25, 0.58);
    const tail = add(new T.ConeGeometry(b.bigTail ? 0.07 : 0.045, b.bigTail ? 0.12 : 0.07, 3), phys(b.alt || b.color, 0.4, { transparent: true, opacity: 0.9 }), -0.1 - (b.bigTail ? 0.03 : 0), 0, 0, fish); tail.rotation.z = Math.PI / 2; tail.scale.z = 0.25; u.tail = tail;
    if (b.bigTail) { const fin = add(new T.ConeGeometry(0.05, 0.08, 3), phys(b.alt || b.color, 0.4, { transparent: true, opacity: 0.85 }), 0, 0.06, 0, fish); fin.scale.z = 0.2; }
    eye(fish, 0.055, 0.012, 0.022, 0.009, '#111');
    u.bubbles = [];
    for (let i = 0; i < 5; i++) { const bb = add(sph(0.01, 8, 6), new T.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.7 }), 0.2, 0.36 + i * 0.07, 0.05); bb.castShadow = false; u.bubbles.push(bb); }
  }
  // редкие породы из магазина (js/shop.js): корона и/или мерцающие искры вокруг
  if (b.crown && u.head) {
    const gold = phys(b.crown, 0.25, { metalness: 0.9, clearcoat: 1 }), top = u.kind === 'parrot' ? 0.07 : 0.12;
    const cr = new T.Group(); cr.position.set(0, top, -0.01); u.head.add(cr);
    add(new T.CylinderGeometry(0.05, 0.055, 0.035, 16, 1, true), gold, 0, 0, 0, cr);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(new T.ConeGeometry(0.012, 0.04, 6), gold, Math.cos(a) * 0.05, 0.035, Math.sin(a) * 0.05, cr); }
    add(sph(0.012, 10, 8), phys('#ff2e55', 0.2, { clearcoat: 1 }), 0, 0.005, 0.054, cr);
  }
  if (b.glow) {
    const sp = new T.Group(); sp.position.y = u.kind === 'fish' ? 0.5 : u.kind === 'parrot' ? 0.6 : 0.35; g.add(sp); u.sparkle = sp;
    const gm = new T.MeshBasicMaterial({ color: b.glow, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const o = add(new T.OctahedronGeometry(0.018), gm, Math.cos(a) * 0.32, Math.sin(i * 1.7) * 0.08, Math.sin(a) * 0.32, sp); o.castShadow = false; }
  }
  g.scale.setScalar(s);
  g.userData = u;
  return g;
}

// Живой просмотр питомца. Возвращает { setAction, setSpec, hold, dispose }; null — без WebGL
async function petViewer(canvas, breed, { action = null, interactive = true, yawRest = -0.5, stage = false } = {}) {
  let T; try { T = await three(); } catch { return null; }
  let ctx; try { ctx = makeScene(T, canvas, 'pet', stage); } catch { return null; }
  const { renderer, scene, cam } = ctx;
  let pet = buildPet(T, breed), act = action, actT = performance.now(), held = null, alive = true, raf = 0, yaw = yawRest, drag = null, t0 = performance.now(), nextBlink = t0 + 1200;
  scene.add(pet);
  const size = () => { const w = canvas.clientWidth || 200, h = canvas.clientHeight || 200; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size();
  if (interactive) {
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, yaw }; });
    canvas.addEventListener('pointermove', e => { if (drag) yaw = drag.yaw + (e.clientX - drag.x) * 0.012; });
    for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, () => { drag = null; });
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null; ro?.observe(canvas);
  const RMp = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = now => {
    if (!alive) return; raf = requestAnimationFrame(frame);
    if (document.hidden || !canvas.isConnected || window.vdpPaused) return;
    const t = (now - t0) / 1000, at = (now - actT) / 1000, u = pet.userData;
    if (!drag) yaw += ((yawRest + Math.sin(t * 0.3) * 0.25) - yaw) * 0.03;
    pet.rotation.y = u.kind === 'fish' ? 0 : yaw;
    if (!RMp) {
      const happy = act === 'happy' || act === 'play';
      u.body.position.y = act === 'play' ? Math.abs(Math.sin(at * 6)) * 0.12 : act === 'happy' ? Math.abs(Math.sin(at * 9)) * 0.025 : Math.sin(t * 2) * 0.004;
      if (u.body.scale) u.body.scale.y = 1 + Math.sin(t * 2.2) * 0.015;
      if (u.head) {
        u.head.rotation.x = act === 'eat' ? 0.55 + Math.abs(Math.sin(at * 5)) * 0.15 : act === 'sad' ? 0.35 : u.kind === 'parrot' && happy ? Math.sin(at * 10) * 0.3 : Math.sin(t * 0.7) * 0.06;
        u.head.rotation.y = act ? 0 : Math.sin(t * 0.5) * 0.3;
        u.head.rotation.z = act === 'play' && u.kind === 'dog' ? Math.sin(at * 3) * 0.2 : 0;
      }
      if (u.tail && u.kind !== 'fish' && u.kind !== 'parrot') { u.tail.rotation.y = Math.sin(t * (happy ? 18 : act === 'sad' ? 1 : 4)) * (happy ? 0.6 : 0.2); u.tail.rotation.x = act === 'sad' ? 0.5 : 0; }
      if (u.kind === 'parrot') { u.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (happy ? 0.4 + Math.sin(at * 22) * 0.5 : 0.05); }); u.tail.rotation.x = 0.35 + Math.sin(t * 2) * 0.05; }
      for (const e of u.ears) e.rotation.x = act === 'sad' ? -0.5 : 0;
      if (u.tongue) u.tongue.visible = happy;
      if (u.kind === 'fish') {
        const sp = happy ? 1.8 : act === 'eat' ? 0.6 : 0.8, x = Math.sin(t * sp) * 0.28, dir = Math.cos(t * sp) >= 0 ? 1 : -1;
        u.fish.position.x = x; u.fish.position.y = act === 'eat' ? 0.62 + Math.sin(t * 4) * 0.01 : 0.5 + Math.sin(t * 1.3) * 0.05;
        u.fish.rotation.y = dir > 0 ? 0 : Math.PI; u.tail.rotation.y = Math.sin(t * 14) * 0.5;
        u.bubbles.forEach((bb, i) => { bb.position.y = 0.36 + ((t * 0.15 + i * 0.07) % 0.34); });
      }
    }
    if (u.sparkle) { u.sparkle.rotation.y = t * 0.8; u.sparkle.children.forEach((o, i) => { o.rotation.y = t * 3 + i; o.scale.setScalar(0.7 + Math.abs(Math.sin(t * 2 + i)) * 0.6); }); }
    const blink = now > nextBlink && now < nextBlink + 120; if (now > nextBlink + 120) nextBlink = now + 2500 + Math.random() * 2500;
    for (const e of u.eyes) e.scale.y = blink ? 0.1 : 1;
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);
  return {
    setAction(a) { act = a || null; actT = performance.now(); },
    setSpec(b) { scene.remove(pet); pet = buildPet(T, b); if (held) pet.add(held); scene.add(pet); },
    hold(e, size = 0.22) {  // миска, игрушка, шприц — перед мордочкой
      if (held) { held.parent?.remove(held); held.material.map.dispose(); held = null; }
      if (e) { held = emojiSprite(T, e, size); const k = pet.userData.kind; held.position.set(k === 'fish' ? 0.25 : 0.12, k === 'parrot' ? 0.5 : k === 'fish' ? 0.85 : 0.1, k === 'fish' ? 0.25 : 0.42); pet.add(held); }
    },
    dispose() { alive = false; cancelAnimationFrame(raf); ro?.disconnect(); renderer.dispose(); renderer.forceContextLoss?.(); },
  };
}
