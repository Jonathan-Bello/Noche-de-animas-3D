// ================= v1.2 en 3D: la base de afuera (fachada, techo, camino, arbustos, reja, camioneta, ciudad),
// las teles de las cámaras de video, herramientas con más detalle y aparatos repartidos por la casona =================
FLOOR_COL.afuera = 0x25311f;
let baseTVs = [], camRig = null, camSil = null, irLight = null, tvTurn = 0, devMeshes = null, statueMesh = null;
const lamB = (c, e) => LambertFlat(Object.assign({ color: c, map: paper }, e || {}));
// aleatorio con semilla: la ciudad sale igual cada noche
const seeded = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

const _buildHouse4 = buildHouse;
buildHouse = function () {
  _buildHouse4();
  const B = {}, bb = k => (B[k] = B[k] || new BoxBatch()), grid = grids[0], out = new THREE.Group(); scene.add(out);
  // suelo y calle más allá del mapa
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), LambertFlat({ color: 0x12170f })); ground.rotation.x = -Math.PI / 2; ground.position.set(30, -0.03, 40); out.add(ground);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(220, 5), LambertFlat({ color: 0x2b2826, map: paper })); street.rotation.x = -Math.PI / 2; street.position.set(30, -0.01, 60.5); out.add(street);
  // arbustos, reja y piedras del camino
  for (let y = 39; y < H; y++) for (let x = 0; x < W; x++) {
    const t = grid[y * W + x], cx = x + 0.5, cz = y + 0.5, j = ((x * 7 + y * 13) % 5) / 5;
    if (t === T.BUSH) { bb(j > 0.5 ? 'bush' : 'bush2').add(cx, 0.6 + j * 0.15, cz, 1.08, 1.2 + j * 0.3, 1.08); bb('bush2').add(cx + (j - 0.5) * 0.4, 1.35 + j * 0.3, cz + (0.5 - j) * 0.3, 0.7, 0.5, 0.7); }
    if (t === T.GATE) { for (let k = 0; k < 4; k++) bb('iron').add(x + 0.125 + k * 0.25, 1.75, cz, 0.05, 3.5, 0.05); bb('iron').add(cx, 3.35, cz, 1.0, 0.08, 0.08); bb('iron').add(cx, 0.35, cz, 1.0, 0.08, 0.08); bb('iron').add(cx, 2.6, cz, 1.0, 0.05, 0.05);
      for (let k = 0; k < 4; k++) bb('iron').add(x + 0.125 + k * 0.25, 3.6, cz, 0.04, 0.4 + (k % 2) * 0.2, 0.04);
      if (x === 12 || x === 34 || x === 23) bb('stone').add(cx, 2.0, cz, x === 23 ? 0.3 : 0.9, 4.0, x === 23 ? 0.3 : 0.9); }
    if (t === T.FLOOR && y >= 40 && y <= 50 && x >= 21 && x <= 24) for (let k = 0; k < 2; k++) { const r = seeded(x * 100 + y * 7 + k)(); bb('flag').add(x + 0.28 + k * 0.45, 0.02, cz + (r - 0.5) * 0.3, 0.4 + r * 0.1, 0.05, 0.42); }
  }
  // la fachada: ventanas con reja, cornisa, techo de teja y pretil
  const front = 40.02;
  for (let f = 0; f < 2; f++) { const y0 = f * FH;
    [3, 8, 13, 18, 28, 33, 38, 43, 48, 53].forEach((x, k) => { if (f === 0 && x > 19 && x < 26) return;
      bb('frame').add(x + 1, y0 + 1.75, front + 0.05, 1.5, 1.9, 0.12); bb('glass' + ((k + f) % 3 === 0 ? 'L' : '')).add(x + 1, y0 + 1.75, front + 0.12, 1.2, 1.6, 0.02);
      for (let b = 0; b < 5; b++) bb('iron').add(x + 0.5 + b * 0.25, y0 + 1.75, front + 0.22, 0.04, 1.7, 0.04); bb('iron').add(x + 1, y0 + 2.55, front + 0.22, 1.3, 0.05, 0.05);
      if (f === 1) { bb('stone').add(x + 1, y0 + 0.75, front + 0.35, 1.8, 0.1, 0.6); for (let b = 0; b < 7; b++) bb('iron').add(x + 0.2 + b * 0.27, y0 + 1.25, front + 0.62, 0.03, 0.9, 0.03); bb('iron').add(x + 1, y0 + 1.7, front + 0.62, 1.8, 0.05, 0.05); } }); }
  bb('stone').add(30, FH, front + 0.1, 60.4, 0.22, 0.3); bb('stone').add(30, FH * 2 + 0.1, front + 0.15, 60.6, 0.3, 0.45);
  // balcón sobre el zaguán
  bb('stone').add(23, FH + 0.05, front + 0.55, 3.6, 0.14, 1.1); for (let b = 0; b < 13; b++) bb('iron').add(21.4 + b * 0.27, FH + 0.55, front + 1.05, 0.03, 1.0, 0.03); bb('iron').add(23, FH + 1.05, front + 1.05, 3.6, 0.05, 0.05);
  bb('frame').add(23, FH + 1.3, front + 0.05, 1.6, 2.4, 0.12); bb('glassL').add(23, FH + 1.3, front + 0.12, 1.3, 2.1, 0.02);
  // faroles junto al zaguán y la luz de trabajo de la base
  [20.3, 25.7].forEach(x => { bb('iron').add(x, 2.6, front + 0.2, 0.06, 0.06, 0.4); bb('lamp').add(x, 2.45, front + 0.42, 0.22, 0.34, 0.22); });
  bb('iron').add(13.2, 1.6, 53.3, 0.08, 3.2, 0.08); bb('lamp').add(13.2, 3.25, 53.3, 0.5, 0.18, 0.3);
  const farol = new THREE.PointLight(0xffb860, 6, 11, 1); farol.position.set(23, 2.6, 41.3); scene.add(farol);
  const work = new THREE.PointLight(0xdfe6ff, 9, 13, 1); work.position.set(13.4, 3.1, 53.2); scene.add(work);
  irLight = new THREE.PointLight(0xffffff, 0, 9, 1); scene.add(irLight);
  const mats = { bush: lamB(0x1f3a1c), bush2: lamB(0x2c4a22), iron: lamB(0x161414), stone: lamB(0x8c8070), flag: lamB(0x6f6a62), frame: lamB(0x3a2414), glass: LambertFlat({ color: 0x0a0c14, emissive: 0x05060c }),
    glassL: LambertFlat({ color: 0x40280a, emissive: 0x3a2008 }), lamp: LambertFlat({ color: 0xffd08a, emissive: 0xffb050 }) };
  Object.entries(B).forEach(([k, b]) => { const m = b.mesh(mats[k]); m.castShadow = k === 'bush' || k === 'iron'; out.add(m); });
  // techo: pretil y teja (se esconde en la vista desde arriba, como los techos)
  const roof = new THREE.Group(); roof.userData.f = 1; scene.add(roof); ceilMeshes.push(roof);
  { const r = new BoxBatch(); r.add(30, FH * 2 + 0.05, 20, 60, 0.1, 40); r.add(30, FH * 2 + 0.55, 0.15, 60, 1.0, 0.3); r.add(0.15, FH * 2 + 0.55, 20, 0.3, 1.0, 40); r.add(59.85, FH * 2 + 0.55, 20, 0.3, 1.0, 40); roof.add(r.mesh(lamB(0x4a3a34)));
    const teja = new THREE.Mesh(new THREE.BoxGeometry(60.8, 0.12, 1.9), lamB(0x8a3a22)); teja.position.set(30, FH * 2 + 0.45, 40.3); teja.rotation.x = 0.42; roof.add(teja);
    for (let x = 1; x < 60; x += 6) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.9), lamB(0x8c8070)); g.position.set(x, FH * 2 - 0.15, 40.5); roof.add(g); } }
  // la camioneta de los investigadores
  { const g = new THREE.Group(); g.position.set(30.4, 0, 52.9); out.add(g); const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
    const cream = lamB(0xd9cfb4), wine = lamB(COL.wine), dark = LambertFlat({ color: 0x0b0d14, emissive: 0x04050a }), tire = lamB(0x141212);
    add(new THREE.BoxGeometry(4.4, 1.9, 2.3), cream, -0.3, 1.35, 0); add(new THREE.BoxGeometry(4.42, 0.28, 2.32), wine, -0.3, 0.75, 0);
    add(new THREE.BoxGeometry(1.1, 1.05, 2.2), cream, 2.45, 0.95, 0); add(new THREE.BoxGeometry(0.06, 0.7, 1.9), dark, 2.0, 1.95, 0);
    [-1.155, 1.155].forEach(z => { add(new THREE.BoxGeometry(2.6, 0.6, 0.03), dark, -0.6, 1.85, z); add(new THREE.BoxGeometry(0.9, 0.6, 0.03), dark, 1.3, 1.85, z); });
    [[-1.6, -1.1], [-1.6, 1.1], [1.9, -1.1], [1.9, 1.1]].forEach(([x, z]) => { const t = add(new THREE.CylinderGeometry(0.4, 0.4, 0.28, 12), tire, x, 0.4, z); t.rotation.x = Math.PI / 2; });
    [-0.7, 0.7].forEach(z => add(new THREE.BoxGeometry(0.06, 0.16, 0.3), LambertFlat({ color: 0xffeeb0, emissive: 0xffd070 }), 3.02, 0.95, z));
    // puertas traseras abiertas y luz adentro
    [-1, 1].forEach(sd => { const piv = new THREE.Group(); piv.position.set(-2.5, 0, sd * 1.15); g.add(piv); const d = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 1.12), cream); d.position.set(0, 1.35, -sd * 0.56); piv.add(d); piv.rotation.y = sd * 1.9; });
    add(new THREE.PlaneGeometry(2.1, 1.7), LambertFlat({ color: 0x3a2a14, emissive: 0x2a1a08, side: THREE.DoubleSide }), -2.49, 1.35, 0).rotation.y = Math.PI / 2;
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = '#d9cfb4'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#5a0f1e'; x.font = 'bold 40px serif'; x.fillText('ÁNIMAS · INVESTIGACIÓN', 12, 46); x.font = '26px serif'; x.fillText('paranormal  ·  día y noche', 70, 84);
    [-1.16, 1.16].forEach(z => { const p = add(new THREE.PlaneGeometry(2.8, 0.52), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv) }), -0.6, 1.2, z * 1.002); p.rotation.y = z < 0 ? Math.PI : 0; });
    const inner = new THREE.PointLight(0xffc070, 2.5, 5, 1); inner.position.set(-2.9, 1.6, 0); g.add(inner); }
  // la ciudad colonial de fondo (no se puede ir)
  { const rnd = seeded(1977), C = {}, cb = k => (C[k] = C[k] || new BoxBatch()), cols = [0xb07a3a, 0x9a3f2c, 0x2f4f7a, 0x9a2f5e, 0xc0963a, 0xb8aea0, 0x4f7a5a];
    const block = (x0, x1, z, dir) => { let x = x0; while (x < x1) { const wd = 3 + rnd() * 4, h = 3.2 + rnd() * 3.5, d = 6, c = Math.floor(rnd() * cols.length); cb('c' + c).add(x + wd / 2, h / 2, z + dir * d / 2, wd - 0.1, h, d);
        cb('roof').add(x + wd / 2, h + 0.25, z + dir * d / 2, wd + 0.1, 0.5, d + 0.1);
        for (let k = 0.8; k < wd - 0.6; k += 1.6) { const lit = rnd() < 0.3; cb(lit ? 'winL' : 'win').add(x + k + 0.4, h * 0.6, z - dir * 0.02, 0.7, 1.1, 0.06); } x += wd; } };
    block(-30, 90, 63.2, 1); block(-30, 90, 76, 1);
    for (let z = 36; z < 60; z += 7) { block(-14, -3, z, 1); }
    for (let z = 36; z < 60; z += 7) block(63, 76, z, 1);
    // la iglesia con sus dos torres y la cúpula
    const ch = { x: 42, z: 72 }; cb('c5').add(ch.x, 5, ch.z + 6, 9, 10, 14); cb('roof').add(ch.x, 10.3, ch.z + 6, 9.3, 0.6, 14.3);
    [-3.6, 3.6].forEach(dx => { cb('c0').add(ch.x + dx, 8, ch.z, 2.6, 16, 2.6); cb('c0').add(ch.x + dx, 17, ch.z, 1.8, 2.2, 1.8); cb('win').add(ch.x + dx, 14, ch.z - 1.32, 0.9, 1.6, 0.06); });
    cb('winL').add(ch.x, 6, ch.z - 1.02, 1.6, 2.4, 0.06);
    // faroles de la calle
    for (let x = -20; x < 82; x += 9) { cb('iron').add(x, 1.8, 59.2, 0.1, 3.6, 0.1); cb('winL').add(x, 3.6, 59.2, 0.35, 0.4, 0.35); }
    const cm = { roof: lamB(0x5a2a1e), win: LambertFlat({ color: 0x0b0c12 }), winL: LambertFlat({ color: 0xffc070, emissive: 0xc07820 }), iron: lamB(0x161414) }; cols.forEach((c, k) => cm['c' + k] = lamB(c));
    Object.entries(C).forEach(([k, b]) => out.add(b.mesh(cm[k])));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lamB(0xc0963a)); dome.position.set(ch.x, 10.5, ch.z + 9); out.add(dome);
    [[ch.x - 3.6, 18.6], [ch.x + 3.6, 18.6], [ch.x, 13.8]].forEach(([x, y], k) => { const cr = new THREE.Group(); cr.position.set(x, y, k === 2 ? ch.z + 9 : ch.z); const a = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), lamB(0x161414)), b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.12), lamB(0x161414)); b.position.y = 0.2; cr.add(a, b); out.add(cr); });
    const moon = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), new THREE.MeshBasicMaterial({ color: 0xf3e6cf, fog: false })); moon.position.set(64, 22, 96); moon.lookAt(30, 2, 45); out.add(moon); }
  // la mesa de las teles: una tele vieja por cámara, con su imagen de visión nocturna
  baseTVs = BASE_TVS.map(p => {
    const g = new THREE.Group(); g.position.set(p.x, 0.82, p.y); out.add(g);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.7, 0.62), lamB(0x4a3424)); body.position.y = 0.35; body.castShadow = true; g.add(body);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.3), lamB(0x2a2420)); back.position.set(0, 0.35, -0.42); g.add(back);
    const rt = new THREE.WebGLRenderTarget(160, 120);
    const mat = new THREE.ShaderMaterial({ uniforms: { tex: { value: rt.texture }, t: { value: 0 }, sig: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D tex; uniform float t, sig; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){ vec2 uv = vUv; float n = h(floor(uv * vec2(160.0, 120.0)) + floor(t * 24.0)); vec3 c;
          if (sig < 0.5) c = vec3(n * 0.75);
          else { uv.x += (h(vec2(floor(uv.y * 40.0), floor(t * 10.0))) - 0.5) * 0.006; float l = dot(texture2D(tex, uv).rgb, vec3(0.3, 0.59, 0.11)); l = pow(clamp(l * 3.4, 0.0, 1.0), 0.75); c = vec3(0.3, 1.0, 0.4) * l + n * 0.1; }
          c *= 0.86 + 0.14 * sin(vUv.y * 300.0); float v = length(vUv - 0.5); c *= 1.0 - v * v * 1.5; gl_FragColor = vec4(c, 1.0); }` });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.47), mat); scr.position.set(0, 0.37, 0.315); g.add(scr);
    [0.34, 0.34].forEach((x, k) => { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), lamB(0x161414)); kn.rotation.x = Math.PI / 2; kn.position.set(x, 0.5 - k * 0.14, 0.32); g.add(kn); });
    [-1, 1].forEach(sd => { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4), lamB(0x9a9a9a)); a.position.set(sd * 0.12, 0.95, -0.05); a.rotation.z = -sd * 0.5; g.add(a); });
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32; const x = cv.getContext('2d'); x.fillStyle = '#e8dcb8'; x.fillRect(0, 0, 128, 32); x.fillStyle = '#5a0f1e'; x.font = 'bold 22px monospace'; x.fillText('CÁM ' + (p.k + 1), 14, 24);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.075), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); tag.position.set(-0.2, 0.06, 0.315); g.add(tag);
    return { g, rt, mat, k: p.k };
  });
  camRig = new THREE.PerspectiveCamera(72, 4 / 3, 0.1, 26);
  // la silueta que solo ven las cámaras
  camSil = new THREE.Group(); const sm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
  { const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.95, 4, 10), sm); body.position.y = 1.0; const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), sm); head.position.y = 1.85; camSil.add(body, head);
    [-1, 1].forEach(sd => { const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.7, 3, 6), sm); arm.position.set(sd * 0.36, 1.15, 0.1); arm.rotation.x = -0.5; camSil.add(arm); }); }
  camSil.visible = false; scene.add(camSil);
  devMeshes = null; statueMesh = null;
};

// ---------- aparatos repartidos por la casona: teles, radios y teléfonos viejos ----------
function buildDevices() {
  devMeshes = (w.devices || []).map((d, k) => {
    const g = new THREE.Group(); g.position.set(d.x, d.f * FH + (d.h || 0), d.y); g.rotation.y = (k * 1.7) % 6.28; scene.add(g); let scr = null;
    if (d.kind === 'tv') { const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.56, 0.5), lamB(0x3a2a1a)); b.position.y = 0.28; g.add(b); scr = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.4), new THREE.MeshBasicMaterial({ color: 0x0a0a0a })); scr.position.set(0, 0.3, 0.255); g.add(scr);
      [-1, 1].forEach(sd => { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.5, 4), lamB(0x9a9a9a)); a.position.set(sd * 0.1, 0.75, 0); a.rotation.z = -sd * 0.5; g.add(a); }); }
    else if (d.kind === 'radio') { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.22), lamB(0x6a4428)); b.position.y = 0.16; g.add(b); const sp = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), lamB(0x2a1a10)); sp.position.set(-0.1, 0.17, 0.115); g.add(sp);
      const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), LambertFlat({ color: 0xe8c070, emissive: 0x302008 })); dial.position.set(0.12, 0.2, 0.115); g.add(dial); scr = dial; }
    else { const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.22), lamB(0x161414)); b.position.y = 0.06; g.add(b); const dl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), lamB(0xb8aea0)); dl.position.set(0, 0.13, 0.03); g.add(dl);
      const hs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.06), lamB(0x161414)); hs.position.set(0, 0.17, -0.06); g.add(hs); scr = hs; }
    return { d, g, scr, k };
  });
}
// la tele de un suceso se prende en el aparato que tocó
const _tvShow = tvShow;
tvShow = function (e) { _tvShow(e); if (casMeshes.tv) casMeshes.tv.visible = false; casLocal.tvDev = e.dev; };

function updateBase(t, dt) {
  if (!w || !scene) return; const V = viewer();
  if (!devMeshes && w.devices) buildDevices();
  if (casMeshes.tv) casMeshes.tv.visible = false;
  if (devMeshes) { const live = performance.now() < casLocal.tvUntil;
    for (const m of devMeshes) { m.g.visible = !V || m.d.f === V.f || V.f === 1;
      if (m.d.kind === 'tv') { const on = live && casLocal.tvDev === m.k; if (on && m.scr.material.map !== casMeshes.tvTex) { m.scr.material.map = casMeshes.tvTex; m.scr.material.color.setHex(0xffffff); m.scr.material.needsUpdate = true; }
        if (!on && m.scr.material.map) { m.scr.material.map = null; m.scr.material.color.setHex(0x0a0a0a); m.scr.material.needsUpdate = true; } } } }
  // el doble que no se mueve
  const st = w.statue; if (st) { if (!statueMesh || statueMesh.key !== st.char) { if (statueMesh) scene.remove(statueMesh.r.g); const r = makeCharacter(st.char); scene.add(r.g); statueMesh = { r, key: st.char }; }
    const r = statueMesh.r; r.g.visible = !!V && V.f === st.f; r.g.position.set(st.x, st.f * FH, st.y); r.g.rotation.y = -st.face + Math.PI / 2; } else if (statueMesh) statueMesh.r.g.visible = false;
  // herramientas con más detalle
  for (const it of w.items) { const im = itemMeshes.get(it.id); if (!im) continue;
    if (it.kind === 'emf' && im.leds) { const on = t < it.emfUntil + 0.25, lv = on ? it.emfLvl : 1; im.leds.forEach((l, k) => { l.material.color.setHex(k < lv ? [0x40ff60, 0x90ff40, 0xffe040, 0xff9020, 0xff2020][k] : 0x202020); }); im.ind.visible = false; }
    if (it.kind === 'cam' && im.tri) { const placed = !it.onTable; im.tri.visible = placed; im.body.position.y = placed ? 1.32 : 0.12; im.ind.position.y = placed ? 1.46 : 0.26; if (im.beam) { im.beam.visible = placed; im.beam.position.y = placed ? 1.32 : 0.3; } }
    if (it.kind === 'espejo' && im.mark) { im.mark.position.set(0, 0.42, 0.02); }
    if (it.kind === 'uv' && im.beam) im.beam.visible = false; // en la mesa o en el piso está apagada
  }
  // las teles de la base: una cámara por cuadro, solo si alguien está cerca
  baseTVs.forEach(tv => tv.mat.uniforms.t.value = t);
  if (!baseTVs.length || !V || V.f !== 0 || Math.hypot(V.x - TV_TABLE.x, V.y - TV_TABLE.y) > 10) return;
  tvTurn = (tvTurn + 1) % 3; const tv = baseTVs[tvTurn], cam = w.items.find(it => it.kind === 'cam' && it.tv === tv.k);
  const live = !!(cam && !cam.holder && !cam.onTable && cam.dir !== undefined); tv.mat.uniforms.sig.value = live ? 1 : 0; if (!live) return;
  const cy = cam.f * FH + 1.32; camRig.position.set(cam.x, cy, cam.y); camRig.lookAt(cam.x + Math.cos(cam.dir) * 4, cy - 0.35, cam.y + Math.sin(cam.dir) * 4);
  const f1 = floorGroups[1].visible, gv = ghostMesh.g.visible, cv = ceilMeshes.map(m => m.visible), sc = wallRuns.map(r => r.g.scale.y), fog = scene.fog;
  floorGroups[1].visible = true; ghostMesh.g.visible = false; ceilMeshes.forEach(m => m.visible = cy < m.userData.f * FH + FH - 0.05); wallRuns.forEach(r => r.g.scale.y = 1); scene.fog = null;
  camSil.visible = !!cam.ghostOn; if (camSil.visible) { camSil.position.set(w.g.x, w.g.f * FH, w.g.y); camSil.rotation.y = -Math.atan2(cam.y - w.g.y, cam.x - w.g.x) + Math.PI / 2; }
  irLight.position.set(cam.x, cy, cam.y); irLight.intensity = 7;
  const hid = []; for (const [id, im] of itemMeshes) { if (id === cam.id && im.g.visible) { im.g.visible = false; hid.push(im.g); } if (im.beam && im.beam.visible) { im.beam.visible = false; hid.push(im.beam); } }
  renderer.setRenderTarget(tv.rt); renderer.render(scene, camRig); renderer.setRenderTarget(null);
  hid.forEach(o => o.visible = true); irLight.intensity = 0; camSil.visible = false; floorGroups[1].visible = f1; ghostMesh.g.visible = gv; ceilMeshes.forEach((m, k) => m.visible = cv[k]); wallRuns.forEach((r, k) => r.g.scale.y = sc[k]); scene.fog = fog;
}
const _updateScene4 = updateScene; updateScene = function (t, dt) { _updateScene4(t, dt); updateBase(t, dt); };

// ---------- modelos de herramientas: aristas duras, pocos polígonos ----------
const _makeItemMesh = makeItemMesh;
makeItemMesh = function (it) {
  const im = _makeItemMesh(it), K = it.kind, NEW = ['emf', 'grab', 'termo', 'uv', 'gases', 'espejo', 'cam', 'fotocam']; if (!NEW.includes(K)) return im;
  im.g.remove(im.m); const g = new THREE.Group(); const L = (c, e) => LambertFlat({ color: c, emissive: e || 0x000000 });
  const box = (sx, sy, sz, c, x, y, z, e) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), L(c, e)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const cyl = (r, h, c, x, y, z, rx, rz, n) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, n || 8), L(c)); m.position.set(x, y, z); m.rotation.set(rx || 0, 0, rz || 0); g.add(m); return m; };
  switch (K) {
    case 'emf': box(0.12, 0.05, 0.26, 0x2a2a2e, 0, 0.03, 0); box(0.08, 0.04, 0.1, 0x161618, 0, 0.03, 0.17); im.leds = [0, 1, 2, 3, 4].map(k => box(0.016, 0.012, 0.016, 0x202020, -0.04 + k * 0.02, 0.06, -0.08)); break;
    case 'grab': box(0.09, 0.04, 0.2, 0x222428, 0, 0.025, 0); box(0.07, 0.006, 0.06, 0x2a5a3a, 0, 0.048, -0.04, 0x0a2a10); cyl(0.006, 0.16, 0x9a9a9a, 0.03, 0.04, 0.17, Math.PI / 2 - 0.3);
      for (let k = 0; k < 4; k++) box(0.05, 0.004, 0.006, 0x111111, 0, 0.047, 0.03 + k * 0.012); break;
    case 'termo': box(0.06, 0.035, 0.18, 0xcfd6dd, 0, 0.02, 0); cyl(0.012, 0.1, 0x8a8a8a, 0, 0.02, 0.14, Math.PI / 2); box(0.04, 0.004, 0.05, 0x182028, 0, 0.04, -0.03, 0x0a1a28); break;
    case 'uv': cyl(0.035, 0.26, 0x2a2238, 0, 0.04, 0, Math.PI / 2); cyl(0.05, 0.05, 0x3a3050, 0, 0.04, 0.15, Math.PI / 2); { const lens = new THREE.Mesh(new THREE.CircleGeometry(0.042, 10), new THREE.MeshBasicMaterial({ color: 0x9a5cff })); lens.position.set(0, 0.04, 0.176); g.add(lens); } break;
    case 'gases': box(0.12, 0.18, 0.06, 0xd0b030, 0, 0.09, 0); { const dial = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), L(0xf3e6cf)); dial.position.set(0, 0.12, 0.031); g.add(dial); const nd = box(0.004, 0.04, 0.003, 0x111111, 0, 0.13, 0.033); nd.rotation.z = 0.6; im.needle = nd; }
      cyl(0.01, 0.1, 0x222222, 0.04, 0.22, 0); break;
    case 'espejo': { const fr = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 18), L(0xb8902a, 0x201000)); fr.position.y = 0.42; g.add(fr); const gl = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), L(0xc8d4e4, 0x202838)); gl.position.set(0, 0.42, 0.005); g.add(gl);
      box(0.035, 0.24, 0.03, 0x5a3a20, 0, 0.13, 0); box(0.16, 0.025, 0.12, 0x4a2c18, 0, 0.012, 0); } break;
    case 'cam': if (it.id === undefined) { // en la mano: el tripié plegado, como un palo junto a la cámara
        box(0.3, 0.16, 0.14, 0x2a2a2e, 0, 0.1, 0); const ln = cyl(0.05, 0.12, 0x111111, 0.2, 0.1, 0, 0, Math.PI / 2, 10); const st = cyl(0.025, 0.62, 0x161414, -0.12, 0.0, 0, 0, Math.PI / 2, 6); im.ind.visible = false; break; }
      { const tri = new THREE.Group(); g.add(tri); [0, 2.09, 4.19].forEach(a => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.35, 4), L(0x161414)); leg.position.set(Math.cos(a) * 0.2, 0.62, Math.sin(a) * 0.2); leg.rotation.set(-Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3); tri.add(leg); });
      const body = new THREE.Group(); g.add(body); const add = (sx, sy, sz, c, x, y, z, e) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), L(c, e)); m.position.set(x, y, z); m.castShadow = true; body.add(m); return m; };
      add(0.3, 0.16, 0.14, 0x2a2a2e, 0, 0, 0); add(0.1, 0.06, 0.08, 0x161618, -0.08, 0.1, 0); const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.12, 10), L(0x111111)); lens.rotation.z = Math.PI / 2; lens.position.set(0.2, 0, 0); body.add(lens);
      const gl = new THREE.Mesh(new THREE.CircleGeometry(0.04, 10), new THREE.MeshBasicMaterial({ color: 0x3050a0 })); gl.position.set(0.261, 0, 0); gl.rotation.y = Math.PI / 2; body.add(gl);
      im.tri = tri; im.body = body; im.ind.position.set(0.06, 0.26, 0.05); im.ind.scale.setScalar(0.5); } break;
    case 'fotocam': box(0.2, 0.13, 0.1, 0xe8dcc8, 0, 0.065, 0); cyl(0.04, 0.04, 0x222222, 0, 0.07, 0.06, Math.PI / 2); box(0.04, 0.03, 0.02, 0xffffff, -0.06, 0.12, 0.04, 0x606060); break;
  }
  g.rotation.y = K === 'cam' ? 0 : -Math.PI / 2; im.g.add(g); im.m = g; return im;
};

// ---------- sucesos nuevos: el doble quieto y el eco ----------
const _casSound4 = casSound;
casSound = function (e, p, V) {
  const mine = e.who === ME;
  switch (e.k) {
    case 'telefono': CSFX.ring(p); if (mine && e.near) setTimeout(() => { if (e.leyenda) { duck(1); speak('¡Ay, mis hijos!', { pitch: 0.1, rate: 0.6 }); } else if (!VOICE.playClip(p, e.distort, { prefer: ['pregunta', 'llamado'] })) speak(pick(['¿Hay alguien ahí?', 'Ven… aquí…', 'Ya te vi']), { pitch: 0.2, rate: 0.7 }); }, 3400); return;
    case 'eco': if (mine && V) { const a = Math.random() * 6.28; VOICE.playClip({ f: V.f, x: V.x + Math.cos(a) * 9, y: V.y + Math.sin(a) * 9 }, Math.random() < 0.1, { prefer: ['llamado'] }); } return;
    case 'estatua': return;
    case 'estatuaGrito': if (mine) { shake(0.6); flashUI('nuca'); buzz(200); } return;
    case 'estatuaHabla': if (mine) { if (!VOICE.playClip(p, false, { who: e.as, prefer: ['pregunta', 'frase'], vol: 1.3 })) S('r_breath', p, { vol: 0.8, rate: 0.8 }); } return;
    case 'ecoya': if (mine && V) VOICE.playClip({ f: V.f, x: V.x + 0.6, y: V.y + 0.4 }, false, { last: true, wifi: true, delay: 0.05 }); return;
  }
  _casSound4(e, p, V);
};

// ---------- dónde estoy y la bitácora del líder ----------
let roomTagEl = null, blogEl = null, blogOpen = false, blogSeen = 0, blogDrawT = 0, blogFilter = 'todo';
function hudExtras(t) {
  const game = $('#game'); if (!game) return;
  if (!roomTagEl) { roomTagEl = document.createElement('div'); roomTagEl.id = 'roomTag'; game.appendChild(roomTagEl);
    blogEl = document.createElement('div'); blogEl.id = 'blog'; blogEl.innerHTML = '<button id="blogBtn" title="Bitácora de la casa (solo la ves tú, el líder)">📜 <span></span></button><div id="blogList" hidden></div>'; game.appendChild(blogEl);
    blogEl.querySelector('#blogBtn').onclick = e => { e.stopPropagation(); blogOpen = !blogOpen; blogEl.querySelector('#blogList').hidden = !blogOpen; blogDrawT = 0; }; }
  const V = viewer(); roomTagEl.textContent = V ? `${roomName(V) || '—'} · ${elevOf(V) > 0.02 && elevOf(V) < 0.98 ? 'entre pisos' : V.f ? 'planta alta' : 'planta baja'}${w.huntFreeAt && w.t < w.huntFreeAt && w.phase === 'night' ? ` · 🕊 el ánima no caza antes de las ${clockStr(w.huntFreeAt)}` : ''}` : '';
  const lead = NET.mode !== 'guest' && w.bitacora; blogEl.hidden = !lead; if (!lead) return;
  const L = w.bitacora, nNew = L.length - blogSeen; blogEl.querySelector('#blogBtn span').textContent = blogOpen ? 'Bitácora' : nNew > 0 ? nNew : '';
  if (blogOpen) { blogSeen = L.length; if (t > blogDrawT) { blogDrawT = t + 0.6; const box = blogEl.querySelector('#blogList');
    const F = { todo: () => true, casa: e => e.kind === 'casa', anima: e => e.kind === 'ánima' || e.kind === 'cacería', equipo: e => e.kind === 'equipo' || e.kind === 'cacería' };
    const keepScroll = box.scrollTop;
    box.innerHTML = '<b>Bitácora</b> <span class="small">(solo la ves tú, el líder · lo más nuevo arriba)</span><div class="bf">' + [['todo', 'Todo'], ['casa', '🏚 Casa'], ['anima', '👻 Ánima'], ['equipo', '🧍 Equipo']].map(([k, n]) => `<button data-f="${k}" class="${blogFilter === k ? 'on' : ''}">${n}</button>`).join('') + '</div>'
      + L.filter(F[blogFilter]).slice(-60).reverse().map(e => { const P = e.who !== undefined && w.invs[e.who]; return `<div class="be ${e.kind === 'ánima' ? 'bg' : e.kind === 'cacería' ? 'bh' : e.kind === 'casa' ? 'bc' : 'bt'}"><i>${clockStr(e.t)}</i> <b>${e.kind === 'casa' ? '🏚' : e.kind === 'cacería' ? '⚠' : e.kind === 'ánima' ? '👻' : '🧍'}</b> ${P ? `<span style="color:${P.color}">●</span> ` : ''}${e.txt}${e.room ? ` <span>· ${e.room}</span>` : ''}</div>`; }).join('');
    box.scrollTop = keepScroll; box.querySelectorAll('.bf button').forEach(btn => btn.onclick = ev => { ev.stopPropagation(); blogFilter = btn.dataset.f; blogDrawT = 0; }); } }
}
const _updateScene5 = updateScene; updateScene = function (t, dt) { _updateScene5(t, dt); try { hudExtras(t); } catch (e) {} };
