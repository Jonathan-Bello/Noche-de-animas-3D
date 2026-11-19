import * as THREE from '../vendor/three.module.js';
// ---------- Personajes 3D: escultura vectorial de aristas duras (núcleo v2, 18-nov) ----------
// Estilo: low-poly de caras planas, mate, sin rostro. Cada prenda es una capa con grosor. Fuente: hojas aprobadas del paquete v02.
// Mira hacia +Z; mano derecha en −X (linterna), izquierda en +X (objeto). Metros; la altura sale de la hoja de cada personaje.
const CHARS = {
  ines: { n: 'Inés', color: '#c0396b', img: 'inv_ines', h: 164, fem: true, skin: 0xc68a5e, hair: { c: 0x2a1418, s: 'braid', len: 0.44 }, top: 0xf1e4cf, trim: 0x8c1e3c, bottom: { c: 0x4a2347, skirt: 0.62 }, shoe: 0x5a3a24,
    acc: [['rebozo', 0xa0285e, 0x5a0f1e], ['flower', 0xe0782a], ['earrings']] },
  rafael: { n: 'Rafael', color: '#6a9a4a', img: 'inv_rafael', h: 182, build: 1.06, skin: 0xb87a4e, hair: { c: 0x2a1a10, s: 'wavy' }, top: 0xe6d8bc, bottom: { c: 0x6a3e26 }, shoe: 0x4a2c18,
    acc: [['vest', 0x4e6a3c, 0x3a5030], ['bandana', 0xb02018], ['beard', 0x2a1a10], ['mustache', 0x2a1a10]] },
  mateo: { n: 'Mateo', color: '#9a2a3a', img: 'inv_mateo', h: 175, skin: 0xd0a07c, hair: { c: 0x3a2418, s: 'short', grey: 0x8a8078 }, top: 0xeee4d0, bottom: { c: 0x5a3a26 }, shoe: 0x3a2214,
    acc: [['vest', 0x5a0f1e], ['jacket', 0x7a2a3a], ['rosary', 0xc08a2a]] },
  tomas: { n: 'Tomás', color: '#2a8a8a', img: 'inv_tomas', h: 178, skin: 0xbf8052, hair: { c: 0x2a1a10, s: 'short' }, top: 0xeee4d0, bottom: { c: 0x5a3a26 }, shoe: 0x3a2214,
    acc: [['poncho', 0x23565c, 0xf0e6d0], ['hat', 0x23565c], ['satchel', 0x8a5228], ['mustache', 0x2a1a10]] },
  amalia: { n: 'Amalia', color: '#d8b030', img: 'inv_amalia', h: 160, fem: true, skin: 0xb07a58, hair: { c: 0x2b1a24, s: 'braid', len: 0.42, grey: 0x9a948c }, top: 0xeee0c8, bottom: { c: 0x5a7a3a, skirt: 0.66 }, shoe: 0x5a3a24,
    acc: [['rebozo', 0xf0e4cc, 0x7a1e2e], ['earrings']] },
  vigia: { n: 'Jhonnatan', rol: 'El vigía', color: '#5b8bd9', img: 'rol_vigia', h: 176, skin: 0xc6865a, hair: { c: 0x3a2016, s: 'wavy' }, top: 0x4e72b0, bottom: { c: 0x3a2a2a }, shoe: 0x4a2c18,
    acc: [['vest', 0x8a2232, 0xd8b030], ['scarf', 0x2f6a5e], ['satchel', 0x7a4a24]] },
  improvisador: { n: 'Ángel', rol: 'El improvisador', color: '#e04a5a', img: 'rol_improvisador', h: 171, skin: 0xd0955e, hair: { c: 0x1a1414, s: 'curly' }, top: 0xa6192e, trim: 0xf0e2c0, bottom: { c: 0x3a2e30 }, shoe: 0x5a4030,
    acc: [['hood', 0xa6192e], ['glasses', 0x141010]] },
  tecnico: { n: 'Robert', rol: 'El técnico', color: '#e0902a', img: 'rol_tecnico', h: 184, build: 1.2, skin: 0xb8744a, hair: { c: 0x2a1a10, s: 'curly' }, top: 0xeee2c8, bottom: { c: 0xc07a28 }, shoe: 0x4a2c18,
    acc: [['overalls', 0xc07a28], ['bandana', 0xa02020]] },
  detective: { n: 'Fermín', rol: 'El detective', color: '#3aa0a0', img: 'rol_detective', h: 174, skin: 0xcf9a6a, hair: { c: 0x2a1a14, s: 'curly' }, top: 0xeee4d0, bottom: { c: 0x5a3a26 }, shoe: 0x3a2214,
    acc: [['poncho', 0x1f5050, 0xf0e6d0], ['hat', 0x235a5a], ['satchel', 0x7a4a24]] },
  curandero: { n: 'Alex', rol: 'El curandero', color: '#7ac08a', img: 'rol_curandero', h: 170, skin: 0xd8a070, hair: { c: 0x1a1210, s: 'wavy', streak: 0xb32234 }, top: 0x7a1f2e, trim: 0xd8a03a, bottom: { c: 0x5a3a26 }, shoe: 0x3a2214,
    acc: [['vest', 0x0e3b44], ['shawl', 0x2e6a64, 0xe4c39a], ['glasses', 0xf0e2c0]] },
  sensitivo: { n: 'Alex', rol: 'El sensitivo', color: '#c95fb5', img: 'rol_sensitivo', h: 170, skin: 0xd8a070, face: 0xf0e6d6, hair: { c: 0x1a1210, s: 'wavy', streak: 0xb32234 }, top: 0x7a1f2e, trim: 0x5a0f1e, bottom: { c: 0x3a1418 }, shoe: 0x2a1410,
    acc: [['facepaint']] },
  devota: { n: 'Jenny', rol: 'La devota', color: '#e8c840', img: 'rol_devota', h: 166, fem: true, skin: 0xd8a070, hair: { c: 0x8a3a1a, s: 'wavy', bob: true }, top: 0xf2e6d0, trim: 0x8c1e3c, bottom: { c: 0x860c33, skirt: 0.64 }, shoe: 0x5a3a24,
    acc: [['rebozo', 0x1f6a66, 0xe8d8b8], ['earrings'], ['rosary', 0xc08a2a]] },
  guardaespaldas: { n: 'Jorge', rol: 'El guardaespaldas', color: '#a08a6a', img: 'rol_guardaespaldas', h: 180, build: 1.16, skin: 0xd8a080, hair: { c: 0x4a1a26, s: 'short', fringe: true }, top: 0x2a1827, bottom: { c: 0x2a1827 }, shoe: 0x1a1414,
    acc: [['coat', 0xa08a64, 0x6f6340], ['glasses', 0x141010]] },
};
const CHAR_IDS = Object.keys(CHARS);
const charLabel = id => CHARS[id] ? CHARS[id].n + (CHARS[id].rol ? ` (${CHARS[id].rol.replace(/^(El|La) /, '').toLowerCase()})` : '') : id;

// ---------- Kit de escultura de aristas duras ----------
// anillos: [y, rx, rz, dz, dx]. seg 5–8. a0 = ángulo del primer vértice (0 = arista al frente). arc < 2π deja la prenda abierta.
function loftGeo(rings, seg, o) {
  o = o || {}; const a0 = o.a0 === undefined ? Math.PI / seg : o.a0, arc = o.arc || Math.PI * 2, closed = arc >= Math.PI * 2 - 1e-6, n = closed ? seg : seg + 1;
  const P = rings.map(([y, rx, rz, dz, dx], ri) => { const out = []; for (let k = 0; k < n; k++) { const a = a0 + arc * k / seg, pf = o.pleat && k % 2 ? 1 + o.pleat : 1;
    const jy = o.jag && ri === rings.length - 1 ? (k % 2 ? o.jag : -o.jag * 0.4) * (o.jagUp ? -1 : 1) : 0; out.push([Math.sin(a) * rx * pf + (dx || 0), y + jy, Math.cos(a) * rz * pf + (dz || 0)]); } return out; });
  const v = []; const tri = (a, b, c) => v.push(...a, ...b, ...c);
  for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < seg; k++) { const k2 = closed ? (k + 1) % n : k + 1; const a = P[i][k], b = P[i][k2], c = P[i + 1][k2], d = P[i + 1][k]; tri(a, b, c); tri(a, c, d); }
  const cap = (ring, y) => { const c = [0, y, 0]; ring.forEach((p, k) => { if (!closed && k === ring.length - 1) return; c[0] += 0; }); const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length, cz = ring.reduce((s, p) => s + p[2], 0) / ring.length; for (let k = 0; k < seg; k++) { const k2 = closed ? (k + 1) % n : k + 1; if (k2 >= ring.length) break; tri([cx, y, cz], ring[k], ring[k2]); } };
  if (o.capB) cap(P[0], P[0][0][1]); if (o.capT) cap(P[P.length - 1], P[P.length - 1][0][1]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.computeVertexNormals(); return geo;
}
const prismGeo = (rt, rb, h, seg, o) => loftGeo([[0, rb, rb], [h, rt, rt]], seg, Object.assign({ capB: true, capT: true }, o || {}));
// caja en cuña: anchos abajo/arriba y fondo abajo/arriba
const wedgeGeo = (wb, wt, h, db, dt, o) => loftGeo([[0, wb / 2 * 1.414, db / 2 * 1.414], [h, wt / 2 * 1.414, dt / 2 * 1.414]], 4, Object.assign({ a0: Math.PI / 4, capB: true, capT: true }, o || {}));
const gemGeo = (r, d) => { const g = new THREE.IcosahedronGeometry(r, d || 0); return g.index ? g.toNonIndexed() : g; };
const octGeo = r => { const g = new THREE.OctahedronGeometry(r, 0); return g.index ? g.toNonIndexed() : g; };
const ringGeo = (R, t, seg) => new THREE.TorusGeometry(R, t, 3, seg || 8);
function vecMat(hex, o) {
  o = o || {}; const m = new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: o.roughness === undefined ? 0.95 : o.roughness, metalness: o.metalness || 0, side: THREE.DoubleSide,
    transparent: !!o.transparent, opacity: o.opacity === undefined ? 1 : o.opacity, emissive: o.emissive || 0x000000, emissiveIntensity: o.emissiveIntensity === undefined ? 1 : o.emissiveIntensity, depthWrite: o.depthWrite === undefined ? true : o.depthWrite });
  return m;
}

function makeBaseCharacter(id) {
  const S = CHARS[id] || CHARS.ines, b = S.build || 1, k = (S.h || 170) / 170, mats = [];
  const M = {}; const L = (c, o) => { const key = c + (o ? JSON.stringify(o) : ''); if (M[key]) return M[key]; const m = vecMat(c, o); m.userData = { c, e: 0 }; mats.push(m); M[key] = m; return m; };
  const mesh = (geo, mat, parent, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, mat); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const grp = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; };
  const fem = !!S.fem, skinC = S.skin, skin = L(skinC), face = L(S.face || skinC), top = L(S.top), pantsM = L(S.bottom.c), shoe = L(S.shoe || 0x3a2214), hairM = L(S.hair.c), dark = L(0x141010);
  const g = new THREE.Group(), root = grp(g); root.scale.setScalar(k); const body = grp(root), hipY = 0.9, hips = grp(body, 0, hipY, 0);
  const has = kind => S.acc.some(a => a[0] === kind);
  // ---- piernas: muslo y espinilla ahusados, bota en cuña ----
  const legs = [1, -1].map(sd => {
    const p = grp(hips, sd * 0.085 * b, -0.03, 0);
    mesh(loftGeo([[0, 0.078 * b, 0.08 * b], [-0.2, 0.07 * b, 0.072 * b], [-0.41, 0.052, 0.056]], 6, { capT: true }), pantsM, p);
    const kn = grp(p, 0, -0.41, 0);
    mesh(loftGeo([[0.01, 0.054, 0.058], [-0.16, 0.05, 0.056, 0.006], [-0.38, 0.038, 0.042]], 6), pantsM, kn);
    mesh(loftGeo([[-0.3, 0.046, 0.05], [-0.42, 0.046, 0.05]], 6), shoe, kn); // caña de la bota
    const foot = mesh(loftGeo([[0, 0.052, 0.07, 0.03], [0.055, 0.05, 0.075, 0.035], [0.075, 0.042, 0.05, 0.0]], 6, { capB: true, capT: true, a0: Math.PI / 6 }), shoe, kn, 0, -0.47, 0.02);
    foot.scale.set(1, 1, 1.25); p.userData.knee = kn; return p; });
  // cadera
  if (!S.bottom.skirt) mesh(loftGeo([[0.04, 0.15 * b, 0.105 * b], [-0.06, 0.165 * b, 0.11 * b], [-0.13, 0.15 * b, 0.1 * b]], 8, { capB: true, capT: true }), pantsM, hips);
  else { const len = S.bottom.skirt; mesh(loftGeo([[0.05, 0.145 * b, 0.105 * b], [-0.08, 0.2 * b, 0.16 * b], [-len * 0.55, 0.27 * b, 0.23 * b], [-len, 0.31 * b, 0.28 * b]], 10, { pleat: 0.09, jag: 0.012 }), L(S.bottom.c), hips);
    mesh(loftGeo([[-len + 0.1, 0.285 * b, 0.255 * b], [-len + 0.06, 0.3 * b, 0.27 * b]], 10, { pleat: 0.09 }), L(S.trim || S.bottom.c), hips); }
  // ---- torso: pecho trapezoidal, cintura estrecha ----
  const torso = grp(hips, 0, 0, 0), ch = fem ? 0.165 : 0.175;
  mesh(loftGeo([[-0.02, 0.15 * b, 0.1 * b], [0.12, (fem ? 0.13 : 0.145) * b, 0.095 * b], [0.27, ch * b, 0.115 * b, 0.01], [0.4, 0.19 * b, 0.105 * b], [0.47, 0.12 * b, 0.085 * b], [0.52, 0.06, 0.055]], 8, { capB: true }), top, torso);
  if (S.trim && !has('hood') && !has('overalls')) mesh(loftGeo([[0.44, 0.13 * b, 0.092 * b, 0.004], [0.4, 0.17 * b, 0.112 * b, 0.004]], 8, { a0: -Math.PI * 0.32, arc: Math.PI * 0.64 }), L(S.trim), torso); // bordado del pecho
  // ---- cabeza escultórica sin rasgos ----
  const head = grp(torso, 0, 0.5, 0);
  mesh(prismGeo(0.045, 0.05, 0.1, 6), skin, head, 0, -0.02, 0);
  const skull = mesh(loftGeo([[0.04, 0.03, 0.03, 0.035], [0.065, 0.06, 0.055, 0.032], [0.1, 0.082, 0.086, 0.014], [0.155, 0.094, 0.102, 0.004], [0.205, 0.096, 0.104], [0.25, 0.078, 0.088, -0.006], [0.272, 0.03, 0.036, -0.01]], 8, { a0: 0, capB: true, capT: true }), face, head);
  skull.scale.set(fem ? 0.95 : 1, 1, 1);
  mesh(wedgeGeo(0.014, 0.004, 0.05, 0.02, 0.008), face, head, 0, 0.125, 0.104, -0.18); // puente nasal
  [-1, 1].forEach(sd => mesh(wedgeGeo(0.012, 0.012, 0.045, 0.03, 0.02), skin, head, sd * 0.095, 0.13, -0.005, 0, 0, sd * 0.12)); // orejas
  // ---- cabello en masas grandes ----
  const hair = grp(head, 0, 0, 0), hs = S.hair.s, hc = S.hair;
  const capRings = [[0.17, 0.104, 0.11, 0.002], [0.215, 0.106, 0.114], [0.26, 0.088, 0.098, -0.008], [0.292, 0.035, 0.04, -0.012]];
  const vol = hs === 'curly' ? 1.14 : hs === 'wavy' ? 1.08 : 1.03;
  mesh(loftGeo(capRings.map(([y, rx, rz, dz]) => [y + (vol - 1) * 0.12, rx * vol, rz * vol, dz]), 8, { capT: true, a0: 0 }), hairM, hair);
  const backLow = hs === 'short' ? 0.1 : hs === 'curly' ? 0.08 : hc.bob ? 0.02 : 0.06;
  mesh(loftGeo([[backLow, 0.098 * vol, 0.1 * vol, -0.012], [0.15, 0.108 * vol, 0.112 * vol, -0.006], [0.21, 0.108 * vol, 0.114 * vol]], 8, { a0: Math.PI * 0.42, arc: Math.PI * 1.16, jag: hs === 'short' ? 0 : 0.018, jagUp: false }), hairM, hair);
  if (hc.fringe) mesh(wedgeGeo(0.15, 0.17, 0.045, 0.03, 0.05), hairM, hair, 0.015, 0.225, 0.085, 0.45, 0, -0.08); // flequillo
  if (hs === 'wavy') { mesh(gemGeo(0.062), hairM, hair, 0.04, 0.262, 0.05).scale.set(1.35, 0.6, 1); mesh(gemGeo(0.058), hairM, hair, -0.05, 0.268, 0.0).scale.set(1.3, 0.55, 1.2); if (hc.bob) [-1, 1].forEach(sd => mesh(gemGeo(0.07), hairM, hair, sd * 0.09, 0.09, -0.02).scale.set(0.7, 1.2, 1.1)); }
  if (hs === 'curly') [[0.06, 0.27, 0.05], [-0.05, 0.275, 0.04], [0.09, 0.21, -0.05], [-0.09, 0.21, -0.05], [0, 0.285, -0.05], [0, 0.19, -0.1], [0.1, 0.15, -0.0], [-0.1, 0.15, -0.0]].forEach(([x, y, z], j) => mesh(gemGeo(0.05 + (j % 3) * 0.007), hairM, hair, x, y, z).scale.set(1.1, 0.85, 1.1));
  if (hs === 'braid') { const grey = hc.grey ? L(hc.grey) : hairM; for (let j = 0; j < 9; j++) { const m = mesh(octGeo(0.05 - j * 0.0025), j % 2 && hc.grey ? grey : hairM, hair, 0, 0.07 - j * (hc.len || 0.4) / 8, -0.112 - j * 0.006); m.scale.set(1, 1.4, 0.8); m.rotation.y = j % 2 ? 0.4 : -0.4; } }
  if (hc.grey && hs !== 'braid') mesh(wedgeGeo(0.05, 0.03, 0.06, 0.02, 0.01), L(hc.grey), hair, 0.09, 0.15, 0.02, 0, 0, -0.15);
  if (hc.streak) { const st = L(hc.streak); mesh(wedgeGeo(0.045, 0.03, 0.09, 0.016, 0.01), st, hair, 0.075, 0.17, 0.075, 0.2, 0, -0.35); mesh(wedgeGeo(0.05, 0.03, 0.1, 0.016, 0.01), st, hair, -0.05, 0.1, -0.112, -0.15); }
  // ---- brazos con codo y mano en mitón ----
  const sleeve = has('coat') || has('jacket') ? L((S.acc.find(a => ['coat', 'jacket'].includes(a[0])) || [])[1]) : top;
  const arms = [1, -1].map(sd => {
    const p = grp(torso, sd * 0.2 * b, 0.42, 0); p.rotation.z = sd * 0.07;
    if (!has('poncho')) mesh(gemGeo(0.054 * b), sleeve, p, 0, -0.03, 0);
    mesh(loftGeo([[0, 0.058 * b, 0.058 * b], [-0.14, 0.052 * b, 0.05 * b], [-0.27, 0.044, 0.044]], 6), sleeve, p);
    const el = grp(p, 0, -0.27, 0);
    mesh(loftGeo([[0.01, 0.045, 0.045], [-0.12, 0.042, 0.04, 0.006], [-0.21, 0.034, 0.032]], 6, { capB: true }), sleeve, el);
    if (S.trim && sleeve === top) mesh(loftGeo([[-0.17, 0.04, 0.038], [-0.2, 0.036, 0.034]], 6), L(S.trim), el);
    mesh(wedgeGeo(0.06, 0.055, 0.075, 0.03, 0.026), skin, el, 0, -0.29, 0.004); // palma
    mesh(wedgeGeo(0.055, 0.03, 0.05, 0.026, 0.018), skin, el, 0, -0.335, 0.008, 0.25); // dedos
    mesh(wedgeGeo(0.018, 0.012, 0.045, 0.018, 0.012), skin, el, -sd * 0.032, -0.27, 0.018, 0.3, 0, -sd * 0.5); // pulgar
    p.userData.elbow = el; return p; });
  const armL = arms[0], armR = arms[1];
  const handL = grp(armL.userData.elbow, 0, -0.3, 0.03), handR = grp(armR.userData.elbow, 0, -0.29, 0.02);
  mesh(prismGeo(0.024, 0.026, 0.15, 6), L(0x3a3a3a, { metalness: 0.2, roughness: 0.9 }), handR, 0, 0, -0.03, Math.PI / 2);
  mesh(prismGeo(0.036, 0.028, 0.035, 6), L(0x5a5a5a, { metalness: 0.2, roughness: 0.9 }), handR, 0, 0, 0.115, Math.PI / 2);
  const lamp = mesh(octGeo(0.028), new THREE.MeshBasicMaterial({ color: 0xffe6a0 }), handR, 0, 0, 0.155);
  // ---- capas de ropa y accesorios ----
  const acc = grp(torso, 0, 0, 0), T = (r) => r * b;
  for (const [kind, c, c2] of S.acc) {
    const m = c !== undefined ? L(c) : null;
    switch (kind) {
      case 'vest': mesh(loftGeo([[0.0, T(0.162), T(0.112)], [0.14, T(0.15), T(0.106)], [0.27, T(0.18), T(0.125), 0.01], [0.4, T(0.2), T(0.115)], [0.46, T(0.13), T(0.094)]], 8, { a0: 0.34, arc: Math.PI * 2 - 0.68, jag: 0.012 }), m, acc);
        if (c2) [-1, 1].forEach(sd => mesh(wedgeGeo(0.05, 0.05, 0.05, 0.012, 0.012), L(c2), acc, sd * 0.08, 0.2, T(0.122))); break;
      case 'jacket': mesh(loftGeo([[-0.2, T(0.2), T(0.15)], [0.0, T(0.172), T(0.122)], [0.27, T(0.186), T(0.13), 0.01], [0.4, T(0.206), T(0.12)], [0.47, T(0.135), T(0.1)]], 8, { a0: 0.4, arc: Math.PI * 2 - 0.8, jag: 0.015 }), m, acc);
        [-1, 1].forEach(sd => mesh(wedgeGeo(0.07, 0.04, 0.16, 0.012, 0.012), m, acc, sd * 0.06, 0.32, T(0.13), -0.2, 0, sd * -0.3)); break;
      case 'coat': mesh(loftGeo([[-0.56, T(0.27), T(0.22)], [-0.2, T(0.22), T(0.16)], [0.05, T(0.18), T(0.13)], [0.27, T(0.19), T(0.135), 0.01], [0.4, T(0.21), T(0.124)], [0.47, T(0.14), T(0.102)]], 8, { a0: 0.36, arc: Math.PI * 2 - 0.72, pleat: 0.03, jag: 0.02 }), m, acc);
        [-1, 1].forEach(sd => mesh(wedgeGeo(0.08, 0.05, 0.2, 0.014, 0.014), L(c2 || c), acc, sd * 0.07, 0.3, T(0.135), -0.18, 0, sd * -0.32));
        mesh(loftGeo([[0.47, T(0.15), T(0.11)], [0.52, T(0.11), T(0.09)]], 8, { a0: Math.PI * 0.5, arc: Math.PI }), m, acc); break; // cuello alzado
      case 'hood': mesh(loftGeo([[0.42, T(0.12), T(0.1), -0.06], [0.5, T(0.15), T(0.12), -0.09], [0.6, T(0.12), T(0.1), -0.11], [0.66, 0.05, 0.05, -0.12]], 7, { a0: Math.PI * 0.55, arc: Math.PI * 0.9, capT: true }), m, acc);
        [-1, 1].forEach(sd => mesh(prismGeo(0.006, 0.006, 0.16, 4), L(S.trim || 0xf0e2c0), acc, sd * 0.045, 0.29, T(0.112)));
        mesh(wedgeGeo(0.2, 0.22, 0.1, 0.02, 0.02), m, acc, 0, 0.1, T(0.1)); mesh(loftGeo([[0.0, T(0.155), T(0.108)], [0.03, T(0.155), T(0.108)]], 8), L(S.trim || 0xf0e2c0), acc); break;
      case 'poncho': { const P = [[0.53, 0.075, 0.075], [0.49, T(0.2), T(0.17)], [0.3, T(0.31), T(0.26)], [-0.16, T(0.35), T(0.3)]]; mesh(loftGeo(P, 4, { a0: 0 }), m, acc);
        mesh(loftGeo([[-0.04, T(0.342), T(0.292)], [-0.08, T(0.345), T(0.295)]], 4, { a0: 0 }), L(c2), acc); mesh(loftGeo([[0.22, T(0.282), T(0.236)], [0.19, T(0.29), T(0.245)]], 4, { a0: 0 }), L(c2), acc);
        mesh(loftGeo([[-0.16, T(0.35), T(0.3)], [-0.23, T(0.353), T(0.303)]], 24, { a0: 0, jag: 0.03 }), L(c2), acc); break; } // flecos en zigzag
      case 'rebozo': mesh(loftGeo([[0.52, 0.075, 0.07], [0.48, T(0.17), T(0.13)], [0.38, T(0.225), T(0.16)], [0.2, T(0.25), T(0.18)]], 8, { jag: 0.02 }), m, acc);
        mesh(wedgeGeo(0.12, 0.1, 0.5, 0.025, 0.025), m, acc, T(0.12), -0.24, T(0.14), 0, 0, 0.08); mesh(wedgeGeo(0.12, 0.1, 0.42, 0.025, 0.025), m, acc, T(-0.05), -0.16, T(-0.17), 0, 0, -0.06);
        if (c2) { mesh(loftGeo([[0.23, T(0.247), T(0.178)], [0.2, T(0.252), T(0.182)]], 8), L(c2), acc); mesh(wedgeGeo(0.124, 0.124, 0.04, 0.028, 0.028), L(c2), acc, T(0.12), -0.24, T(0.14), 0, 0, 0.08); mesh(loftGeo([[-0.24, 0.07, 0.016], [-0.29, 0.07, 0.016]], 12, { jag: 0.025 }), L(c2), acc).position.set(T(0.12), 0, T(0.14)); } break;
      case 'shawl': mesh(gemGeo(0.085), m, acc, T(0.15), 0.42, 0).scale.set(1, 0.55, 1.6);
        mesh(wedgeGeo(0.12, 0.13, 0.42, 0.026, 0.026), m, acc, T(0.1), 0.02, T(0.125), 0, 0, 0.12); mesh(wedgeGeo(0.12, 0.13, 0.42, 0.026, 0.026), m, acc, T(0.1), 0.02, T(-0.125), 0, 0, 0.12);
        if (c2) [1, -1].forEach(sd => { mesh(wedgeGeo(0.124, 0.124, 0.035, 0.028, 0.028), L(c2), acc, T(0.1), 0.06, sd * T(0.126), 0, 0, 0.12); mesh(loftGeo([[0, 0.062, 0.014], [-0.05, 0.062, 0.014]], 10, { jag: 0.022 }), L(c2), acc).position.set(T(0.1), 0.02, sd * T(0.126)); }); break;
      case 'scarf': mesh(loftGeo([[0.44, 0.1, 0.085], [0.5, 0.09, 0.08]], 8), m, acc); mesh(wedgeGeo(0.07, 0.06, 0.26, 0.02, 0.02), m, acc, 0.05, 0.18, T(0.135), 0.1, 0, 0.1); mesh(wedgeGeo(0.065, 0.055, 0.2, 0.02, 0.02), m, acc, -0.01, 0.24, T(0.14), 0.1, 0, -0.12); break;
      case 'bandana': mesh(loftGeo([[0.46, 0.075, 0.068], [0.5, 0.068, 0.062]], 8), m, acc); mesh(new THREE.ConeGeometry(0.075, 0.12, 3), m, acc, 0, 0.4, T(0.1), Math.PI + 0.3, 0, 0); break;
      case 'overalls': mesh(loftGeo([[-0.02, T(0.156), T(0.108)], [0.13, T(0.15), T(0.104)]], 8), m, acc); mesh(wedgeGeo(T(0.22), T(0.2), 0.2, 0.02, 0.02), m, acc, 0, 0.12, T(0.1));
        [1, -1].forEach(sd => { mesh(wedgeGeo(0.035, 0.035, 0.34, 0.012, 0.012), m, acc, sd * 0.075, 0.2, T(0.112), 0.1); mesh(wedgeGeo(0.035, 0.035, 0.34, 0.012, 0.012), m, acc, sd * 0.06, 0.16, T(-0.108), -0.12, 0, sd * 0.25); mesh(octGeo(0.014), L(0xd8b030, { metalness: 0.25 }), acc, sd * 0.075, 0.32, T(0.122)); });
        mesh(wedgeGeo(0.08, 0.08, 0.06, 0.03, 0.03), L(0x8a5228), acc, 0, 0.16, T(0.12)); break;
      case 'satchel': { const pon = has('poncho'), bx = pon ? T(-0.2) : T(-0.21), by = pon ? -0.42 : -0.12, bz = pon ? 0.1 : 0.02; mesh(wedgeGeo(0.16, 0.15, 0.17, 0.06, 0.05), m, acc, bx, by, bz, 0, Math.PI / 2); mesh(wedgeGeo(0.165, 0.16, 0.07, 0.064, 0.062), L(c), acc, bx - 0.005, by + 0.12, bz, 0, Math.PI / 2).rotation.z = 0.08;
        if (!pon) { const zo = has('coat') ? T(0.15) : T(0.128); [1, -1].forEach(sd => mesh(wedgeGeo(0.03, 0.03, 0.66, 0.01, 0.01), m, acc, T(-0.2), -0.04, sd * zo, 0, 0, -0.6)); } break; }
      case 'rosary': mesh(ringGeo(0.07, 0.006, 10), m, acc, 0, 0.35, T(0.1), 0.45); mesh(wedgeGeo(0.014, 0.014, 0.05, 0.008, 0.008), m, acc, 0, 0.25, T(0.122)); mesh(wedgeGeo(0.034, 0.034, 0.012, 0.008, 0.008), m, acc, 0, 0.283, T(0.122)); break;
      case 'hat': mesh(loftGeo([[0.255, 0.3, 0.3], [0.262, 0.3, 0.3], [0.262, 0.12, 0.12]], 8, { a0: 0, capB: true }), m, head); mesh(loftGeo([[0.26, 0.118, 0.12], [0.35, 0.105, 0.11], [0.385, 0.06, 0.07]], 8, { capT: true }), m, head); mesh(loftGeo([[0.265, 0.121, 0.123], [0.29, 0.119, 0.121]], 8), dark, head); break;
      case 'glasses': { const gm = L(c || 0x101010); [-1, 1].forEach(sd => { const r = mesh(ringGeo(0.028, 0.005, 6), gm, head, sd * 0.042, 0.155, 0.098); r.rotation.z = Math.PI / 6; mesh(wedgeGeo(0.005, 0.005, 0.09, 0.005, 0.005), gm, head, sd * 0.09, 0.155, 0.05, Math.PI / 2); }); mesh(wedgeGeo(0.026, 0.026, 0.005, 0.005, 0.005), gm, head, 0, 0.158, 0.106); break; }
      case 'earrings': [-1, 1].forEach(sd => mesh(octGeo(0.014), L(0xd8a020, { metalness: 0.25 }), head, sd * 0.1, 0.09, 0.0)); break;
      case 'flower': for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; mesh(octGeo(0.024), m, head, -0.085 + Math.cos(a) * 0.026, 0.25 + Math.sin(a) * 0.026, 0.06); } mesh(octGeo(0.015), L(0xf2c84e), head, -0.085, 0.25, 0.07); break;
      case 'beard': mesh(loftGeo([[0.04, 0.035, 0.03, 0.062], [0.075, 0.075, 0.07, 0.036], [0.11, 0.09, 0.08, 0.022]], 6, { a0: -Math.PI * 0.5, arc: Math.PI, capB: true }), m, head); break;
      case 'mustache': mesh(wedgeGeo(0.08, 0.05, 0.022, 0.018, 0.012), m, head, 0, 0.088, 0.1, 0.25); break;
      case 'facepaint': { const blk = L(0x141010), red = L(0x8c1e2a); [-1, 1].forEach(sd => { const p = mesh(octGeo(0.03), red, head, sd * 0.042, 0.158, 0.088); p.scale.set(1.1, 0.8, 0.35); }); mesh(octGeo(0.014), blk, head, 0, 0.12, 0.112).scale.set(1, 0.8, 0.5); mesh(wedgeGeo(0.08, 0.08, 0.006, 0.004, 0.004), blk, head, 0, 0.085, 0.1); break; }
    }
  }
  if (!S.acc.some(a => ['coat', 'poncho', 'hood', 'jacket', 'rebozo', 'scarf'].includes(a[0]))) [-1, 1].forEach(sd => mesh(wedgeGeo(0.06, 0.03, 0.05, 0.012, 0.012), top, acc, sd * 0.04, 0.47, T(0.07), -0.6, 0, sd * 0.5)); // cuello de camisa
  const spirit = mesh(gemGeo(0.5, 1), new THREE.MeshBasicMaterial({ color: 0x9ad0ff, transparent: true, opacity: 0.18, depthWrite: false }), g, 0, 0.95, 0); spirit.scale.y = 1.6; spirit.visible = false; spirit.castShadow = false;
  const characterRig = { id, g, root, body, hips, hipY, torso, head, hair, armL, armR, legL: legs[0], legR: legs[1], hand: handL, handR, lamp, acc, spirit, mats, handKind: null,
    ph: 0, prev: null, speed: 0, seed: Math.random() * 10, t: { dip: -9, use: -9, throw: -9, death: -1 }, ghostly: 0, scaleK: k };
  return id === 'curandero' && typeof NDAAlexArt !== 'undefined' ? NDAAlexArt.refine(characterRig) : characterRig;
}

const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const ease = p => p * p * (3 - 2 * p);
// st: { x, y, t, dt, hidden, dead, manifest, lamp, holding, aim, tremble }
function animateBaseCharacter(r, st) {
  const { t, dt } = st, H0 = r.hipY;
  if (r.prev) { const v = Math.hypot(st.x - r.prev.x, st.y - r.prev.y) / Math.max(1e-3, dt); r.speed += ((v > 8 ? 0 : v) - r.speed) * Math.min(1, dt * 10); }
  r.prev = { x: st.x, y: st.y };
  const sp = st.dead ? 0 : r.speed / (r.scaleK || 1), run = sp > 3.0;
  r.ph += dt * sp * 2.8;
  const A = Math.min(run ? 0.8 : 0.55, sp * 0.2), s = Math.sin(r.ph);
  const kL = r.legL.userData.knee, kR = r.legR.userData.knee, eL = r.armL.userData.elbow, eR = r.armR.userData.elbow;
  r.body.position.set(0, 0, 0); r.body.rotation.set(0, 0, 0); r.torso.rotation.set(0, 0, 0); r.head.rotation.set(0, 0, 0); r.hips.position.y = H0; r.hips.rotation.set(0, 0, 0);
  r.legL.rotation.set(s * A, 0, 0); r.legR.rotation.set(-s * A, 0, 0);
  kL.rotation.x = Math.max(0, Math.sin(r.ph + 1.6)) * A * 1.5; kR.rotation.x = Math.max(0, Math.sin(r.ph + 1.6 + Math.PI)) * A * 1.5;
  r.armL.rotation.set(-s * A * 0.75, 0, 0.07); r.armR.rotation.set(s * A * 0.75, 0, -0.07);
  eL.rotation.x = -0.15 - (run ? 1.1 : A * 0.5); eR.rotation.x = -0.15 - (run ? 1.1 : A * 0.5);
  r.body.position.y = Math.abs(Math.cos(r.ph)) * 0.035 * Math.min(1, sp / 2);
  r.hips.rotation.y = s * A * 0.12; r.torso.rotation.y = -s * A * 0.2;
  r.torso.rotation.x = run ? 0.24 : sp * 0.02;
  r.torso.scale.y = 1 + Math.sin(t * 2.3 + r.seed) * 0.01 * (sp < 0.3 ? 1 : 0.3);
  r.head.rotation.y = Math.sin(t * 0.43 + r.seed) * 0.4 * (sp < 0.3 ? 1 : 0.12) - r.torso.rotation.y;
  if (st.lamp && !st.dead) { r.armR.rotation.set(-0.95 + s * A * 0.12, 0.1, -0.12); eR.rotation.x = -0.55; }
  if (st.aim && !st.dead) { r.armL.rotation.set(-0.95 + s * A * 0.1, -0.1, 0.12); eL.rotation.x = -0.55; }
  else if (st.holding && !st.dead) { r.armL.rotation.x = Math.min(r.armL.rotation.x, -0.25); eL.rotation.x = -0.9; }
  let crouch = st.hidden ? 1 : 0; const pd = (t - r.t.dip) / 0.55; if (pd >= 0 && pd < 1) crouch = Math.max(crouch, Math.sin(pd * Math.PI));
  if (crouch > 0) { r.hips.position.y = H0 - 0.42 * crouch; r.legL.rotation.x = r.legR.rotation.x = -1.4 * crouch; kL.rotation.x = kR.rotation.x = 2.3 * crouch; r.legL.rotation.z = 0.15 * crouch; r.legR.rotation.z = -0.15 * crouch; r.torso.rotation.x = 0.45 * crouch; r.armL.rotation.x = Math.min(r.armL.rotation.x, -0.9 * crouch); r.head.rotation.x = -0.25 * crouch; }
  const pu = (t - r.t.use) / 0.7; if (pu >= 0 && pu < 1) { const kk = Math.sin(pu * Math.PI); r.armL.rotation.x = -1.6 * kk + r.armL.rotation.x * (1 - kk); eL.rotation.x = -0.6 * kk + eL.rotation.x * (1 - kk); r.head.rotation.x = -0.2 * kk; }
  const pt = (t - r.t.throw) / 0.5; if (pt >= 0 && pt < 1) { r.armL.rotation.x = pt < 0.35 ? 1.1 * ease(pt / 0.35) : 1.1 - 3.0 * ease((pt - 0.35) / 0.65); eL.rotation.x = pt < 0.35 ? -1.2 : -0.2; r.torso.rotation.y = pt < 0.35 ? 0.3 * (pt / 0.35) : 0.3 - 0.6 * ((pt - 0.35) / 0.65); }
  if (st.tremble > 0 && !st.dead) { r.head.rotation.z = Math.sin(t * 37) * 0.04 * st.tremble; r.torso.rotation.z = Math.sin(t * 29) * 0.015 * st.tremble; r.armR.rotation.z += Math.sin(t * 31) * 0.03 * st.tremble; }
  if (st.dead) {
    if (r.t.death < 0) r.t.death = t;
    const pdd = (t - r.t.death);
    if (pdd < 1.6) { const kk = ease(clamp01(pdd / 0.7)); r.body.rotation.x = -1.45 * kk; r.body.position.y = 0.12 * kk; r.body.position.z = -0.4 * kk; r.armL.rotation.x = r.armR.rotation.x = -2.2 * kk; r.armL.rotation.z = 0.5 * kk; r.armR.rotation.z = -0.5 * kk; eL.rotation.x = eR.rotation.x = -0.2 * kk; r.legL.rotation.x = 0.15 * kk; r.legR.rotation.x = -0.1 * kk; kL.rotation.x = 0.25 * kk; kR.rotation.x = 0.1 * kk; setGhostly(r, 0); }
    else { const kk = clamp01((pdd - 1.6) / 1.2); setGhostly(r, kk); r.body.position.y = 0.25 * kk + Math.sin(t * 1.5 + r.seed) * 0.08 * kk; r.legL.rotation.x = 0.25 + Math.sin(t * 1.1) * 0.12; r.legR.rotation.x = 0.15 + Math.sin(t * 1.1 + 1) * 0.12; kL.rotation.x = 0.4; kR.rotation.x = 0.3;
      const out = st.manifest ? 1 : 0.25; r.armL.rotation.set(-0.3, 0, 0.6 + out * 0.9); r.armR.rotation.set(-0.3, 0, -0.6 - out * 0.9); eL.rotation.x = eR.rotation.x = -0.3; r.head.rotation.x = -0.15; r.spirit.visible = !!st.manifest && kk > 0.5; r.spirit.material.opacity = 0.07 * kk; }
    r.lamp.visible = false;
  } else { if (r.t.death >= 0) { r.t.death = -1; setGhostly(r, 0); } r.spirit.visible = false; r.lamp.visible = !!st.lamp; }
  r.handR.visible = !!st.lamp && !st.dead;
  r.hand.rotation.set(-(r.armL.rotation.x + eL.rotation.x) - r.torso.rotation.x - r.body.rotation.x, -r.armL.rotation.y, -r.armL.rotation.z);
  r.handR.rotation.set(-(r.armR.rotation.x + eR.rotation.x) - r.torso.rotation.x, -r.armR.rotation.y, -r.armR.rotation.z);
}
function setGhostly(r, k) {
  if (Math.abs(k - r.ghostly) < 0.01) return; r.ghostly = k;
  for (const m of r.mats) { m.transparent = k > 0; m.opacity = 1 - 0.6 * k; m.depthWrite = k < 0.5; if (m.emissive) m.emissive.setHex(k > 0 ? 0x2a4a80 : 0x000000); }
}

// ---------- Ánima: las 6 apariencias (hojas aprobadas) en aristas duras ----------
const LOOK_SPEC = {
  velo: { body: 0x8c1e4e, body2: 0x5a0f2e, hi: 0xd04a7a, skin: 0x2a1018 },
  blanca: { body: 0xf0e4cc, body2: 0xd8c8a8, hi: 0xfff6e4, hair: 0x1e1622, skin: 0xe8dcc8 },
  sombra: { body: 0x2a1a3a, body2: 0x1a1430, hi: 0x5a3a6a, skin: 0x100c1c },
  nino: { body: 0xeee2c8, body2: 0xd6c6a6, hi: 0xfff4de, hair: 0x2a1a20, skin: 0xd8b898 },
  anciano: { body: 0x7a1a2e, body2: 0xf0e2c4, hi: 0xd8a84a, skin: 0xc0906a, hat: 0xd8b878 },
  humo: { body: 0x23565c, body2: 0x3e7a7a, hi: 0x8ab8b0, skin: 0x0e2a2e },
};
function makeGhostRig(look, labelText) {
  const C = LOOK_SPEC[look] || LOOK_SPEC.velo, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); const fade = [];
  const F = (hex, emis) => { const m = vecMat(hex, { transparent: true, opacity: 0.9, emissive: emis || 0x000000, depthWrite: true }); fade.push(m); return m; };
  const mat = F(C.body, 0x0a0a14), robe = F(C.body2), darkM = F(C.skin), hiM = F(C.hi);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf2b04e, transparent: true });
  const add = (geo, m, parent, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(o); return o; };
  const ripple = []; let headY = 1.6, eyeZ = 0.1, sh = { y: 1.38, x: 0.22, len: 0.62, m: mat, hand: darkM };
  const head = new THREE.Group();
  const skull = (m, s) => add(loftGeo([[0.0, 0.03, 0.03, 0.03], [0.05, 0.075, 0.08, 0.012], [0.11, 0.09, 0.098], [0.17, 0.088, 0.095], [0.215, 0.06, 0.068, -0.006], [0.235, 0.02, 0.024]], 8, { a0: 0, capB: true, capT: true }), m, head, 0, -0.1, 0).scale.setScalar(s || 1);
  switch (look) {
    case 'blanca': {
      ripple.push(add(loftGeo([[0.0, 0.5, 0.46], [0.5, 0.36, 0.32], [1.0, 0.22, 0.17], [1.3, 0.16, 0.12]], 12, { pleat: 0.08, jag: 0.06, jagUp: false }), mat, inner, 0, 0, 0));
      add(loftGeo([[1.25, 0.17, 0.12], [1.42, 0.19, 0.12], [1.5, 0.1, 0.08]], 8), mat, inner);
      add(loftGeo([[1.68, 0.11, 0.1, -0.03], [1.5, 0.15, 0.12, -0.07], [1.05, 0.12, 0.06, -0.12]], 8, { a0: Math.PI * 0.5, arc: Math.PI, jag: 0.06 }), F(C.hair), inner); // pelo largo
      headY = 1.58; skull(darkM, 1); eyeZ = 0.09; sh = { y: 1.4, x: 0.2, len: 0.6, m: mat, hand: darkM }; break; }
    case 'sombra': {
      ripple.push(add(loftGeo([[0.0, 0.2, 0.16], [0.5, 0.17, 0.13], [1.3, 0.2, 0.13], [1.8, 0.26, 0.15], [2.0, 0.12, 0.1]], 7, { jag: 0.1 }), mat, inner));
      headY = 2.12; skull(darkM, 1.05); add(loftGeo([[2.0, 0.12, 0.1, -0.02], [2.3, 0.15, 0.12, -0.03], [2.4, 0.05, 0.05, -0.04]], 7, { capT: true, a0: Math.PI * 0.4, arc: Math.PI * 1.2 }), robe, inner);
      eyeZ = 0.1; sh = { y: 1.9, x: 0.26, len: 1.35, m: mat, hand: darkM }; break; }
    case 'nino': {
      ripple.push(add(loftGeo([[0.12, 0.27, 0.24], [0.5, 0.2, 0.17], [0.85, 0.15, 0.12], [0.95, 0.07, 0.06]], 10, { pleat: 0.06, jag: 0.04 }), mat, inner));
      [-0.06, 0.06].forEach(x => add(wedgeGeo(0.05, 0.04, 0.12, 0.08, 0.05), darkM, inner, x, 0.0, 0.02));
      headY = 1.02; skull(darkM, 0.95); add(loftGeo([[0.12, 0.1, 0.1, -0.005], [0.2, 0.1, 0.105], [0.25, 0.04, 0.045]], 8, { capT: true, jag: 0.015 }), F(C.hair), head, 0, -0.1, 0);
      eyeZ = 0.09; sh = { y: 0.86, x: 0.15, len: 0.36, m: mat, hand: darkM }; break; }
    case 'anciano': {
      ripple.push(add(loftGeo([[0.05, 0.22, 0.2], [0.75, 0.2, 0.16]], 8, { jag: 0.03 }), F(0xe8dcc4), inner));
      add(loftGeo([[1.42, 0.07, 0.07], [1.36, 0.26, 0.26], [1.0, 0.4, 0.4], [0.62, 0.44, 0.44]], 4, { a0: 0, jag: 0.03 }), mat, inner); // sarape
      add(loftGeo([[0.86, 0.425, 0.425], [0.8, 0.43, 0.43]], 4, { a0: 0 }), robe, inner); add(loftGeo([[1.1, 0.36, 0.36], [1.05, 0.38, 0.38]], 4, { a0: 0 }), hiM, inner);
      headY = 1.46; skull(darkM, 1); add(wedgeGeo(0.09, 0.06, 0.02, 0.02, 0.012), F(0xd8d0c4), head, 0, -0.025, 0.088, 0.25);
      const hatM = F(C.hat); add(loftGeo([[0.13, 0.36, 0.36], [0.14, 0.36, 0.36], [0.14, 0.12, 0.12]], 8, { a0: 0 }), hatM, head); add(loftGeo([[0.13, 0.11, 0.115], [0.27, 0.09, 0.095], [0.3, 0.04, 0.04]], 8, { capT: true }), hatM, head);
      add(prismGeo(0.016, 0.02, 1.0, 5), robe, inner, 0.32, 0.0, 0.12, 0, 0, -0.06); // bastón
      eyeZ = 0.09; sh = { y: 1.28, x: 0.24, len: 0.55, m: mat, hand: darkM }; break; }
    case 'humo': {
      for (let j = 0; j < 6; j++) ripple.push(add(loftGeo([[0, 0.34 - j * 0.03, 0.28 - j * 0.025], [0.22, 0.3 - j * 0.03, 0.25 - j * 0.02]], 7, { jag: 0.05, a0: j * 0.5 }), j % 2 ? robe : mat, inner, Math.sin(j * 2.1) * 0.08, 0.35 + j * 0.2, Math.cos(j * 1.7) * 0.06));
      add(gemGeo(0.26, 0), hiM, inner, 0, 1.55, 0.04).scale.set(1.2, 0.75, 0.8);
      headY = 1.56; eyeZ = 0.22; sh = { y: 1.2, x: 0.2, len: 0.0, m: mat, hand: mat }; break; }
    default: { // encapuchada con rebozo de papel picado
      ripple.push(add(loftGeo([[0.0, 0.52, 0.46], [0.6, 0.38, 0.32], [1.2, 0.25, 0.2], [1.5, 0.18, 0.15]], 12, { pleat: 0.08, jag: 0.07 }), mat, inner));
      for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2, y = 0.3 + (j % 3) * 0.35, rr = 0.47 - (j % 3) * 0.1; add(octGeo(0.05), hiM, inner, Math.sin(a) * rr, y, Math.cos(a) * rr * 0.9).scale.set(1, 1.4, 0.25); } // calado del papel picado
      add(loftGeo([[1.35, 0.21, 0.18], [1.62, 0.18, 0.17, -0.01], [1.82, 0.09, 0.09, -0.04], [1.9, 0.02, 0.02, -0.06]], 8, { a0: 0.55, arc: Math.PI * 2 - 1.1 }), robe, inner); // capucha abierta
      headY = 1.6; add(gemGeo(0.11, 0), darkM, head, 0, 0.0, 0.03).scale.set(0.85, 1.05, 0.7); eyeZ = 0.1; sh = { y: 1.36, x: 0.22, len: 0.62, m: robe, hand: darkM }; break; }
  }
  head.position.set(0, headY, 0); inner.add(head);
  const eyes = look === 'humo' ? [-0.07, 0.07].map(dx => add(octGeo(0.035), darkM, head, dx, 0.0, eyeZ)) : [-0.04, 0.04].map(dx => add(octGeo(0.016), eyeMat, head, dx, 0.0, eyeZ));
  eyes.forEach(e => e.scale.set(1, 0.6, 0.3));
  const arms = [1, -1].map(sd => { const p = new THREE.Group(); p.position.set(sd * sh.x, sh.y, 0); inner.add(p); if (sh.len > 0) { add(loftGeo([[0, 0.05, 0.045], [-sh.len * 0.55, 0.04, 0.035], [-sh.len, 0.026, 0.024]], 6, { jag: look === 'sombra' ? 0.04 : 0 }), sh.m, p);
    add(wedgeGeo(0.05, 0.03, look === 'sombra' ? 0.22 : 0.08, 0.025, 0.012), sh.hand, p, 0, -sh.len - (look === 'sombra' ? 0.22 : 0.08), 0); } return p; });
  let label = null;
  if (labelText && typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); if (x) { x.font = '600 52px Georgia, serif'; x.textAlign = 'center'; x.fillStyle = 'rgba(18,13,34,0.75)'; x.fillRect(0, 10, 512, 76); x.fillStyle = '#f2b04e'; x.fillText(labelText, 256, 66); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); label.scale.set(2.4, 0.45, 1); label.position.y = 2.7; label.visible = false; g.add(label); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return { g, inner, head, arms, ripple, mat, darkM, robe, eyeMat, eyes, fade, label, look, opS: 0, prev: null, speed: 0 };
}
// st: { x, y, t, dt, hunt, blind, stunned, op }
function animateGhostRig(r, st) {
  const { t, dt } = st;
  if (r.prev) { const v = Math.hypot(st.x - r.prev.x, st.y - r.prev.y) / Math.max(1e-3, dt); r.speed += ((v > 8 ? 0 : v) - r.speed) * Math.min(1, dt * 8); } r.prev = { x: st.x, y: st.y };
  r.opS += (st.op - r.opS) * Math.min(1, dt * (st.op > r.opS ? 5 : 3));
  const o = r.opS; r.fade.forEach(m => { m.opacity = o * 0.9; m.depthWrite = o > 0.6; }); r.eyeMat.opacity = o;
  r.g.visible = o > 0.02;
  // movimiento cuadro por cuadro: el ánima "salta" a 12 fps, los vivos se mueven fluido
  const tq = Math.floor(t * 12) / 12;
  const hunt = st.hunt ? 1 : 0, lean = hunt * Math.min(0.4, 0.15 + r.speed * 0.06);
  r.inner.position.y = (hunt ? 0.04 : 0.09) * Math.sin(tq * (hunt ? 5 : 1.8)) + 0.05;
  r.inner.rotation.set(lean, 0, Math.sin(tq * 1.3) * 0.05 * (1 - hunt));
  r.ripple.forEach((m, k) => { const s = 1 + Math.sin(tq * 3 + k * 1.3) * (r.look === 'humo' ? 0.1 : 0.035); m.scale.set(s, 1, s); if (r.look === 'humo') m.rotation.y = tq * 0.4 * (k % 2 ? 1 : -1); });
  r.head.rotation.set(-lean * 0.6, Math.sin(tq * 0.7) * 0.3 * (1 - hunt), Math.sin(tq * 0.5) * 0.15);
  r.arms.forEach((a, k) => { const sd = k ? -1 : 1; if (hunt) { a.rotation.set(-1.35 + Math.sin(tq * 9 + k * 3) * 0.18, 0, sd * 0.15); } else a.rotation.set(Math.sin(tq * 1.4 + k) * 0.12, 0, sd * (0.12 + Math.sin(tq * 0.9 + k) * 0.05)); });
  if (st.blind) { r.inner.rotation.z = Math.sin(tq * 40) * 0.12; r.arms.forEach((a, k) => a.rotation.set(-2.6, 0, (k ? -1 : 1) * 0.6)); }
  if (st.stunned) { r.inner.rotation.y = Math.sin(tq * 14) * 0.5; }
  r.eyes.forEach(e => e.scale.set(hunt ? 1.6 : 1, hunt ? 1 : 0.6, 0.3));
}

// Arte aprobado de Alex / El Curandero. Ashen como referencia principal de abstracción.
// Se aplica al rig original; no modifica animateCharacter ni los demás personajes.
const NDAAlexArt = (() => {
// Neo-Retro Vector Sculpture v04. Centimeters are modeled in meters, Y up, +Z front.
const MODEL_HEIGHT=1.70,HEAD_UNIT=MODEL_HEIGHT/6.5;
const palette={
  skin:'#D8A070',hair:'#1A1210',red:'#B32234',wine:'#7A1F2E',teal:'#0E3B44',cream:'#E4C39A',brown:'#594035',boots:'#372C2C',trim:'#B77E49'
};
function createVectorSculptureMaterial(hexColor,options={
}){
  return new THREE.MeshStandardMaterial({
    color:new THREE.Color(hexColor),flatShading:true,roughness:options.roughness??1,metalness:0,side:options.doubleSided?THREE.DoubleSide:THREE.FrontSide,transparent:options.transparent??false,opacity:options.opacity??1,emissive:new THREE.Color(0),emissiveIntensity:0
  });
} const mats=Object.fromEntries(Object.entries(palette).map(([name,c])=>{
  const m=createVectorSculptureMaterial(c);m.name=name;return[name,m];
}));
function finalizeHardEdgedGeometry(g){
  const out=g.index?g.toNonIndexed():g;
  out.computeVertexNormals();
  return out;
} function mesh(parent,name,g,mat){
  const m=new THREE.Mesh(finalizeHardEdgedGeometry(g),typeof mat==='string'?mats[mat]:mat);
  m.name=name;
  m.castShadow=m.receiveShadow=true;
  parent.add(m);
  return m;
} function geo(v,ix){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v.flat(),3));
  g.setIndex(ix);
  return g;
} function group(parent,name,pivot=[0,0,0]){
  const g=new THREE.Group();
  g.name=name;
  g.position.set(...pivot);
  g.userData.pivot='anatomical_or_garment_anchor';
  parent.add(g);
  return g;
} function ringVertices(rows,angles,inner=0){
  const v=[];
  for(const r of rows)for(const a of angles)v.push([r.x+Math.sin(a)*(r.w-inner),r.y,(r.z||0)+Math.cos(a)*(r.d-inner)]);
  return v;
} function solid(parent,name,rows,mat,n=8){
  const angles=Array.from({
    length:n
  },(_,i)=>i*2*Math.PI/n);
  const v=ringVertices(rows,angles),ix=[];
  for(let k=0;k<rows.length-1;k++)for(let j=0;j<n;j++){
    const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;
    ix.push(a,b,c,b,d,c);
  }for(let j=1;j<n-1;j++){
    ix.push(0,j+1,j);
    const a=(rows.length-1)*n;
    ix.push(a,a+j,a+j+1);
  }return mesh(parent,name,geo(v,ix),mat);
} function shell(parent,name,rows,mat,n=8,t=.02,angles=null,cutArmpits=false){
  angles=angles||Array.from({length:n},(_,i)=>i*2*Math.PI/n);n=angles.length;
  const open=angles[0]!==0,edgeCount=open?n-1:n;
  const outer=ringVertices(rows,angles),inner=ringVertices(rows,angles,t),N=outer.length,v=[...outer,...inner],ix=[],edges=new Map();
  function edge(a,b){const key=Math.min(a,b)+':'+Math.max(a,b);const old=edges.get(key);if(old)old.count++;else edges.set(key,{a,b,count:1});}
  for(let k=0;k<rows.length-1;k++)for(let j=0;j<edgeCount;j++){
    if(cutArmpits&&k>=2&&(j===1||j===5))continue;
    const p=k*n+j,q=k*n+(j+1)%n,r=p+n,s=q+n;
    ix.push(p,q,r,q,s,r,p+N,r+N,q+N,q+N,r+N,s+N);
    edge(p,q);edge(q,s);edge(s,r);edge(r,p);
  }
  // Close every exposed boundary, including the new armholes, with a real thickness rim.
  for(const{a,b,count}of edges.values())if(count===1)ix.push(a,a+N,b,b,a+N,b+N);
  const m=mesh(parent,name,geo(v,ix),mat);m.userData.thicknessMeters=t;m.userData.armholes=cutArmpits;return m;
} function polygon(parent,name,points,t,mat,z=0,holes=[],frontSurface=null){
  const s=new THREE.Shape();
  s.moveTo(...points[0]);
  points.slice(1).forEach(p=>s.lineTo(...p));
  s.closePath();
  for(const hp of holes){
    const h=new THREE.Path();
    h.moveTo(...hp[0]);
    hp.slice(1).forEach(p=>h.lineTo(...p));
    h.closePath();
    s.holes.push(h);
  }const g=new THREE.ExtrudeGeometry(s,{
    depth:t,steps:1,bevelEnabled:false,curveSegments:1
  });
  if(frontSurface){
    const a=g.attributes.position;
    for(let i=0;i<a.count;i++)a.setZ(i,frontSurface(a.getX(i),a.getY(i))-t+a.getZ(i));
  }const m=mesh(parent,name,g,mat);
  m.position.z=z;
  m.userData.thicknessMeters=t;
  return m;
} function wedge(parent,name,corners,mat){
  return mesh(parent,name,geo(corners,[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]),mat);
} function flower(parent,name,x,y,z,r,mat){
  const p=[];
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,rr=i%2?r*.43:r;
    p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);
  }return polygon(parent,name,p,.005,mat,z);
}

function refine(r){
  // Everything is local to the repository's existing torso/head. Joint heights stay untouched.
  const shirtOld=r.torso.children.find(o=>o.isMesh);if(shirtOld)r.torso.remove(shirtOld);
  r.acc.clear();r.hair.clear();
  r.torso.children.filter(o=>o.isMesh&&o.material?.color?.getHex()===0xd8a03a).forEach(o=>r.torso.remove(o));
  const oldFrames=r.head.children.filter(o=>o.isMesh&&o.material?.color?.getHex()===0xf0e2c0);
  oldFrames.forEach(o=>r.head.remove(o));
  const costume=group(r.acc,'alex_ropa_revisada');
  // Replace the original separate shoulder lump and upper sleeve with one continuous garment.
  // Elbow groups, rotations, forearms and hands stay exactly where the existing animation expects.
  for(const arm of[r.armL,r.armR]){
    arm.children.filter(o=>o.isMesh).forEach(o=>arm.remove(o));
    solid(arm,'manga_hombro_continua',[
      {x:0,y:.025,w:.046,d:.046},{x:0,y:-.035,w:.061,d:.060},
      {x:0,y:-.14,w:.052,d:.05},{x:0,y:-.27,w:.044,d:.044}
    ],'wine',6);
  }

  shell(costume,'camisa_ahusada_con_espesor',[
    {x:0,y:-.02,w:.151,d:.104},{x:0,y:.12,w:.139,d:.098},
    {x:0,y:.29,w:.177,d:.117},{x:0,y:.405,w:.192,d:.110},
    {x:0,y:.485,w:.111,d:.082},{x:0,y:.520,w:.061,d:.055}
  ],'wine',8,.020);
  const angles=Array.from({length:8},(_,i)=>Math.PI/8+i*Math.PI/4);
  shell(costume,'chaleco_abierto_ajustado_a_camisa',[
    {x:0,y:.005,w:.177,d:.129},{x:0,y:.14,w:.166,d:.123},
    {x:0,y:.29,w:.203,d:.143},{x:0,y:.40,w:.218,d:.137},
    {x:0,y:.475,w:.138,d:.109}
  ],'teal',8,.020,angles,true);
  // Neck opening ends at the repository's original collar height, immediately below the jaw.
  polygon(costume,'solapa_derecha',[[-.059,.535],[-.004,.499],[-.043,.440],[-.108,.490]],.020,'wine',.070);
  polygon(costume,'solapa_izquierda',[[.004,.499],[.059,.535],[.108,.490],[.043,.440]],.020,'wine',.070);
  flower(costume,'bordado_collar',-.056,.486,.093,.018,'cream');
  for(const y of[.12,.25,.36]){const pts=Array.from({length:6},(_,j)=>[Math.cos(j*Math.PI/3)*.006,y+Math.sin(j*Math.PI/3)*.006]);polygon(costume,'boton_hexagonal',pts,.005,'hair',.119);}
  const shawlMat=createVectorSculptureMaterial('#2E6A64');shawlMat.name='rebozo_verde_repositorio';
  const shawl=group(costume,'rebozo_pieza_continua');
  // Three samples across the ribbon define a broad folded ridge; shell follows torso clearances.
  const path=[[.099,.035,.155],[.107,.25,.151],[.12,.435,.135],[.13,.482,.022],[.12,.435,-.135],[.099,.22,-.15],[.095,.035,-.148]];
  const v=[],ix=[],width=.105,t=.02;
  for(const[x,y,z]of path)for(const[u,d]of[[-.5,0],[0,.010],[.5,0]])v.push([x+width*u,y,z+d]);
  const N=v.length;v.push(...v.map(p=>[p[0],p[1],p[2]-t]));
  for(let k=0;k<path.length-1;k++)for(let j=0;j<2;j++){const a=k*3+j,b=a+1,c=a+3,d=b+3;ix.push(a,b,c,b,d,c,a+N,c+N,b+N,b+N,c+N,d+N);}
  for(let k=0;k<path.length-1;k++)for(const j of[0,2]){const a=k*3+j,b=a+3;ix.push(a,b,a+N,b,b+N,a+N);}
  for(const row of[0,path.length-1])for(let j=0;j<2;j++){const a=row*3+j,b=a+1;ix.push(a,a+N,b,b,a+N,b+N);}
  mesh(shawl,'rebozo_espesor_20mm',geo(v,ix),shawlMat).userData.thicknessMeters=t;
  polygon(shawl,'franja_delantera',[[.047,.07],[.151,.07],[.152,.087],[.048,.087]],.005,'cream',.158);
  polygon(shawl,'franja_posterior',[[.042,.07],[.147,.07],[.148,.087],[.043,.087]],.005,'cream',-.173);
  flower(shawl,'motivo_geometrico_grande',.099,.18,.158,.027,'cream');
  for(let j=0;j<5;j++){const x=.048+j*.021;polygon(shawl,'fleco_'+j,[[x,.035],[x+.012,.035],[x+.01,-.006-(j%2)*.009],[x-.001,-.004]],.008,'cream',.142);}
  // The original skull, nose ridge, ears, neck, head pivot, shoulders and limbs are preserved.
  const hair=r.hair;hair.name='alex_cabello_tres_masas_sin_bolas';
  const hv=[],hi=[];
  for(let row=0;row<4;row++)for(let j=0;j<8;j++){
    const a=j*Math.PI/4,f=Math.max(0,Math.cos(a)),b=Math.max(0,-Math.cos(a));
    const rx=[.102,.126,.111,.051][row],rz=[.098,.122,.111,.055][row];
    const y=[.13+f*.082-b*.048,.209+f*.035-b*.01,.276,.293][row]+(row===2&&j>4?-.006:0);
    hv.push([Math.sin(a)*rx,y,Math.cos(a)*rz-.010]);
  }
  for(let k=0;k<3;k++)for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8,c=a+8,d=b+8;hi.push(a,b,c,b,d,c);}
  for(let j=1;j<7;j++){hi.push(0,j+1,j);hi.push(24,24+j,24+j+1);}
  mesh(hair,'masa_1_envolvente_nuca_sienes',geo(hv,hi),'hair');
  // Broad front locks are sculpted volumes, not flat slabs or primitive balls.
  const hs=(_x,y)=>.128-(y-.18)*.40;
  const hairColors=[createVectorSculptureMaterial('#1A1210'),createVectorSculptureMaterial('#B32234')];hairColors[0].name='cabello_oscuro';hairColors[1].name='mecha_roja';
  function hairVolume(name,outline,center,depth,stripe){
    const n=outline.length,v=outline.map(([x,y])=>[x,y,hs(x,y)]);
    v.push(...outline.map(([x,y])=>[x,y,hs(x,y)-depth]));
    v.push([center[0],center[1],hs(...center)+.022],[center[0],center[1],hs(...center)-depth]);
    const ix=[],groups=[];
    for(let j=0;j<n;j++)ix.push(2*n,j,(j+1)%n);
    for(let j=0;j<n;j++){const next=(j+1)%n;ix.push(2*n+1,next+n,j+n,j,j+n,next,next,j+n,next+n);}
    groups.push([0,ix.length,0]);
    function clip(poly,distance){const out=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=distance(a),db=distance(b);if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((x,k)=>x+(b[k]-x)*t));}}return out;}
    const scalar=p=>stripe==='left'?p[0]-p[1]:p[0]+p[1];
    const low=stripe==='left'?-.336:.321,high=stripe==='left'?-.324:.333,start=ix.length;
    for(let j=0;j<n;j++){
      let poly=[v[2*n],v[j],v[(j+1)%n]];
      poly=clip(poly,p=>scalar(p)-low);if(poly.length<3)continue;
      poly=clip(poly,p=>high-scalar(p));if(poly.length<3)continue;
      const base=v.length;v.push(...poly.map(p=>[p[0],p[1],p[2]+.0015]));
      for(let k=1;k<poly.length-1;k++)ix.push(base,base+k,base+k+1);
    }
    groups.push([start,ix.length-start,1]);
    let area=0;for(let j=0;j<n;j++){const a=outline[j],b=outline[(j+1)%n];area+=a[0]*b[1]-b[0]*a[1];}
    if(area<0)for(let j=0;j<ix.length;j+=3)[ix[j+1],ix[j+2]]=[ix[j+2],ix[j+1]];
    const g=geo(v,ix);g.clearGroups();for(const[start,count,mi]of groups)g.addGroup(start,count,mi);
    return mesh(hair,name,g,hairColors);
  }
  hairVolume('masa_2_onda_esculpida_izquierda',[
    [-.109,.176],[-.129,.213],[-.119,.244],[-.093,.267],[-.054,.299],[-.015,.302],
    [.012,.278],[-.02,.256],[-.052,.239],[-.074,.208],[-.085,.18]
  ],[-.074,.250],.055,'left');
  hairVolume('masa_3_onda_esculpida_derecha',[
    [.012,.279],[.030,.297],[.069,.286],[.105,.262],[.128,.227],[.118,.191],[.096,.172],[.082,.212],[.053,.253]
  ],[.075,.251],.052,'right');
  // Rear accent interpolates the cap's own back facet, avoiding a hovering stripe.
  const rv=[],ri=[];for(let k=0;k<3;k++)for(const u of[.30,.45]){const a=hv[k*8+4],b=hv[k*8+5];rv.push([THREE.MathUtils.lerp(a[0],b[0],u),THREE.MathUtils.lerp(a[1],b[1],u),THREE.MathUtils.lerp(a[2],b[2],u)-.004]);}
  for(let k=0;k<2;k++){const a=k*2,b=a+1,c=a+2,d=a+3;ri.push(a,c,b,b,c,d,b,c,a,d,c,b);}
  mesh(hair,'mecha_nuca_adherida',geo(rv,ri),'red');
  // User correction: round lenses, represented as clean ten-sided polygonal frames.
  const frames=group(r.head,'alex_lentes_redondos');
  const lensMat=createVectorSculptureMaterial('#F0E2C0');lensMat.name='montura_marfil';
  for(const side of[-1,1]){
    const cx=side*.042,cy=.157;
    const outer=Array.from({length:10},(_,j)=>{const a=j*Math.PI*2/10;return[cx+Math.cos(a)*.032,cy+Math.sin(a)*.032];});
    const inner=Array.from({length:10},(_,j)=>{const a=-j*Math.PI*2/10;return[cx+Math.cos(a)*.026,cy+Math.sin(a)*.026];});
    polygon(frames,'aro_redondo_'+side,outer,.006,lensMat,.108,[inner]);
    const q=[[side*.073,.165,.11],[side*.1,.165,-.012],[side*.1,.170,-.012],[side*.073,.170,.11]];
    mesh(frames,'patilla_recta_'+side,geo(q,[0,1,2,0,2,3,2,1,0,3,2,0]),lensMat);
  }
  polygon(frames,'puente_lentes',[[-.015,.157],[.015,.157],[.012,.164],[-.012,.164]],.006,lensMat,.110);
  // Use the original material list for the unmodified spirit-transition function.
  // Each preview instance owns its materials; spirit transitions cannot tint another instance.
  const cloned=new Map();
  function own(m){if(!m.isMeshStandardMaterial)return m;if(!cloned.has(m)){const c=m.clone();c.userData={...m.userData,c:m.color.getHex(),e:0};cloned.set(m,c);}return cloned.get(m);}
  r.g.traverse(o=>{if(o.isMesh&&o.material){o.material=Array.isArray(o.material)?o.material.map(own):own(o.material);o.castShadow=o.receiveShadow=true;}});
  r.mats=[...new Set([...r.mats.map(m=>cloned.get(m)||m),...cloned.values()])];
  r.g.userData={artStudy:'v05',base:'src/chars3d.js',baseBlob:'be7468119d982b9d06d1a88681ea1a3e866ad00f',approval:'approved_2026_11_18',neckAndJointPositions:'original, unchanged',changes:['hair','layered torso clothing','round glasses'],animationFunction:'original animateCharacter, unmodified'};
  return r;
}

return { refine };
})();

// Elenco aprobado por el usuario; Sensitivo catrin rojo corregido a peticion.
// Las funciones originales del rig permanecen en chars3d.js como makeBaseCharacter/animateBaseCharacter.
const NDAElencoArt = (() => {
const makeCharacter=makeBaseCharacter,originalAnimate=animateBaseCharacter;
// Neo-Retro Vector Sculpture v04. Centimeters are modeled in meters, Y up, +Z front.
const MODEL_HEIGHT=1.70,HEAD_UNIT=MODEL_HEIGHT/6.5;
const palette={
  skin:'#D8A070',hair:'#1A1210',red:'#B32234',wine:'#7A1F2E',teal:'#0E3B44',cream:'#E4C39A',brown:'#594035',boots:'#372C2C',trim:'#B77E49'
};
function createVectorSculptureMaterial(hexColor,options={
}){
  return new THREE.MeshStandardMaterial({
    color:new THREE.Color(hexColor),flatShading:true,roughness:options.roughness??1,metalness:0,side:options.doubleSided?THREE.DoubleSide:THREE.FrontSide,transparent:options.transparent??false,opacity:options.opacity??1,emissive:new THREE.Color(0),emissiveIntensity:0
  });
} const mats=Object.fromEntries(Object.entries(palette).map(([name,c])=>{
  const m=createVectorSculptureMaterial(c);m.name=name;return[name,m];
}));
function finalizeHardEdgedGeometry(g){
  const out=g.index?g.toNonIndexed():g;
  out.computeVertexNormals();
  return out;
} function mesh(parent,name,g,mat){
  const m=new THREE.Mesh(finalizeHardEdgedGeometry(g),typeof mat==='string'?mats[mat]:mat);
  m.name=name;
  m.castShadow=m.receiveShadow=true;
  parent.add(m);
  return m;
} function geo(v,ix){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v.flat(),3));
  g.setIndex(ix);
  return g;
} function group(parent,name,pivot=[0,0,0]){
  const g=new THREE.Group();
  g.name=name;
  g.position.set(...pivot);
  g.userData.pivot='anatomical_or_garment_anchor';
  parent.add(g);
  return g;
} function ringVertices(rows,angles,inner=0){
  const v=[];
  for(const r of rows)for(const a of angles)v.push([r.x+Math.sin(a)*(r.w-inner),r.y,(r.z||0)+Math.cos(a)*(r.d-inner)]);
  return v;
} function solid(parent,name,rows,mat,n=8){
  const angles=Array.from({
    length:n
  },(_,i)=>i*2*Math.PI/n);
  const v=ringVertices(rows,angles),ix=[];
  for(let k=0;k<rows.length-1;k++)for(let j=0;j<n;j++){
    const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;
    ix.push(a,b,c,b,d,c);
  }for(let j=1;j<n-1;j++){
    ix.push(0,j+1,j);
    const a=(rows.length-1)*n;
    ix.push(a,a+j,a+j+1);
  }return mesh(parent,name,geo(v,ix),mat);
} function shell(parent,name,rows,mat,n=8,t=.02,angles=null,cutArmpits=false){
  angles=angles||Array.from({length:n},(_,i)=>i*2*Math.PI/n);n=angles.length;
  const open=angles[0]!==0,edgeCount=open?n-1:n;
  const outer=ringVertices(rows,angles),inner=ringVertices(rows,angles,t),N=outer.length,v=[...outer,...inner],ix=[],edges=new Map();
  function edge(a,b){const key=Math.min(a,b)+':'+Math.max(a,b);const old=edges.get(key);if(old)old.count++;else edges.set(key,{a,b,count:1});}
  for(let k=0;k<rows.length-1;k++)for(let j=0;j<edgeCount;j++){
    if(cutArmpits&&k>=2&&(j===1||j===5))continue;
    const p=k*n+j,q=k*n+(j+1)%n,r=p+n,s=q+n;
    ix.push(p,q,r,q,s,r,p+N,r+N,q+N,q+N,r+N,s+N);
    edge(p,q);edge(q,s);edge(s,r);edge(r,p);
  }
  // Close every exposed boundary, including the new armholes, with a real thickness rim.
  for(const{a,b,count}of edges.values())if(count===1)ix.push(a,a+N,b,b,a+N,b+N);
  const m=mesh(parent,name,geo(v,ix),mat);m.userData.thicknessMeters=t;m.userData.armholes=cutArmpits;return m;
} function polygon(parent,name,points,t,mat,z=0,holes=[],frontSurface=null){
  const s=new THREE.Shape();
  s.moveTo(...points[0]);
  points.slice(1).forEach(p=>s.lineTo(...p));
  s.closePath();
  for(const hp of holes){
    const h=new THREE.Path();
    h.moveTo(...hp[0]);
    hp.slice(1).forEach(p=>h.lineTo(...p));
    h.closePath();
    s.holes.push(h);
  }const g=new THREE.ExtrudeGeometry(s,{
    depth:t,steps:1,bevelEnabled:false,curveSegments:1
  });
  if(frontSurface){
    const a=g.attributes.position;
    for(let i=0;i<a.count;i++)a.setZ(i,frontSurface(a.getX(i),a.getY(i))-t+a.getZ(i));
  }const m=mesh(parent,name,g,mat);
  m.position.z=z;
  m.userData.thicknessMeters=t;
  return m;
} function wedge(parent,name,corners,mat){
  return mesh(parent,name,geo(corners,[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]),mat);
} function flower(parent,name,x,y,z,r,mat){
  const p=[];
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,rr=i%2?r*.43:r;
    p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);
  }return polygon(parent,name,p,.005,mat,z);
}

const material=createVectorSculptureMaterial;
// Project color onto existing planar facets: paint rather than a separate mask.
function frontSurfaceOf(mesh){
 const p=mesh.geometry.attributes.position,ix=mesh.geometry.index;
 return(x,y)=>{let best=-Infinity;const count=ix?ix.count:p.count;
  for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),[A,B,C]=ids.map(j=>[p.getX(j),p.getY(j),p.getZ(j)]);
   const d=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(d)<1e-10)continue;
   const u=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/d,v=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/d,w=1-u-v;
   if(u>=-1e-5&&v>=-1e-5&&w>=-1e-5)best=Math.max(best,u*A[2]+v*B[2]+w*C[2]);
  }return Number.isFinite(best)?best+.0018:.10;
 };
}
function makeAlexStudy({original=false}={}){
 const r=makeCharacter('curandero');if(original)return r;
 r.id='sensitivo';r.g.name='Alex_Sensitivo_Catrin_Rojo';
 const remove=[];r.acc.traverse(o=>{if(['chaleco_abierto_ajustado_a_camisa','rebozo_pieza_continua'].includes(o.name))remove.push(o);});for(const o of remove)o.parent.remove(o);
 const glasses=r.head.getObjectByName('alex_lentes_redondos');if(glasses)glasses.parent.remove(glasses);
 const mat=(hex,name)=>{const m=createVectorSculptureMaterial(hex);m.name=name;m.userData={c:m.color.getHex(),e:0};return m;};
 const ivory=mat('#F0E0CA','maquillaje_catrin_marfil'),red=mat('#B5263C','maquillaje_rojo_carmesi'),wine=mat('#591221','maquillaje_vino_oscuro');
 const shirt=mat('#AD2237','camisa_elegante_roja'),embroidery=mat('#651729','adornos_rojo_oscuro'),pants=mat('#3A1418','pantalon_vino'),boots=mat('#2A1410','calzado_vino');
 // Exact approved body, hair, neck and limb geometry; only materials and paint/embroidery change.
 r.g.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const c=o.material?.color?.getHex();if(c===0x7a1f2e)o.material=shirt;else if(c===0xd8a03a)o.material=embroidery;else if(c===0x5a3a26)o.material=pants;else if(c===0x3a2214)o.material=boots;});
 const skull=r.head.children.find(o=>o.isMesh&&o.position.lengthSq()===0);skull.material=ivory;skull.name='rostro_vivo_pintado_catrin';
 const surface=frontSurfaceOf(skull),paint=new THREE.Group();paint.name='maquillaje_catrin_rojo';r.head.add(paint);
 const draw=(name,points,m)=>polygon(paint,name,points,.0012,m,0,[],surface);
 for(const side of[-1,1]){
  const x=side*.043,y=.162;
  draw('roseton_rojo_catrin',Array.from({length:16},(_,j)=>{const a=j*Math.PI/8,k=j%2?.85:1;return[x+Math.cos(a)*.036*k,y+Math.sin(a)*.033*k];}),red);
  draw('cuenca_pintada_vino',Array.from({length:8},(_,j)=>{const a=j*Math.PI/4;return[x+Math.cos(a)*.023,y+Math.sin(a)*.020];}),wine);
  draw('arabesco_mejilla',[[side*.027,.119],[side*.047,.123],[side*.066,.112],[side*.06,.105],[side*.045,.114],[side*.032,.111]],red);
 }
 const nose=r.head.children.find(o=>o.isMesh&&Math.abs(o.position.y-.125)<1e-6&&Math.abs(o.position.z-.104)<1e-6);if(nose)nose.material=wine;
 draw('nariz_pintada',[[-.008,.128],[.008,.128],[0,.143]],wine);
 draw('sonrisa_catrin_pintada',[[-.066,.100],[-.044,.091],[0,.085],[.044,.091],[.066,.100],[.061,.094],[.043,.086],[0,.080],[-.043,.086],[-.061,.094]],red);
 for(let j=-3;j<=3;j++){const x=j*.012,y=.084+Math.abs(j)*.002;draw('raya_maquillaje_dientes',[[x-.0013,y-.006],[x+.0013,y-.006],[x+.0013,y+.006],[x-.0013,y+.006]],wine);}
 draw('cruz_frontal_roja',[[-.003,.203],[.003,.203],[.003,.212],[.010,.212],[.010,.217],[.003,.217],[.003,.228],[-.003,.228],[-.003,.217],[-.010,.217],[-.010,.212],[-.003,.212]],red);
 draw('diamante_menton',[[0,.048],[.009,.058],[0,.069],[-.009,.058]],red);
 const shirtMesh=r.acc.getObjectByName('camisa_ahusada_con_espesor'),shirtSurface=frontSurfaceOf(shirtMesh),ornament=new THREE.Group();ornament.name='camisa_roja_bordado_oscuro';r.acc.add(ornament);
 for(const side of[-1,1]){
  for(const y of[.12,.24,.35]){const x=side*.075;polygon(ornament,'flor_bordada_rojo_oscuro',Array.from({length:12},(_,j)=>{const a=j*Math.PI/6,rad=j%2?.010:.026;return[x+Math.cos(a)*rad,y+Math.sin(a)*rad];}),.0015,embroidery,0,[],shirtSurface);}
  polygon(ornament,'tallo_bordado',[[side*.073,.08],[side*.078,.08],[side*.078,.39],[side*.073,.39]],.0015,embroidery,0,[],shirtSurface);
 }
 r.acc.traverse(o=>{if(o.name==='bordado_collar')o.material=embroidery;});
 const mats=new Set();r.g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial)mats.add(m);});r.mats=[...mats];
 r.g.userData={...r.g.userData,artStudy:'sensitivo_catrin_rojo_v08',approval:'user_requested_2026_11_19',identity:'Alex vivo maquillado de catrin, mismo cuerpo y cabello',face:'maquillaje rojo y vino sobre marfil; sin globos oculares ni pupilas'};
 return r;
}

const IDS=Object.keys(CHARS);
const DESIGN={
 ines:{title:'Inés',silhouette:'Falda campana en tres niveles; cintura marcada y rebozo magenta bajo los hombros.',hair:'Trenza gruesa continua hasta media espalda, raya diagonal y flor naranja.',key:'Blusa marfil, bordado guinda, falda ciruela y aros.'},
 rafael:{title:'Rafael',silhouette:'Pecho amplio, chaleco verde de trabajo con cuatro bolsillos; mangas remangadas.',hair:'Onda oscura barrida hacia atrás y nuca corta; barba compacta facetada.',key:'Pañuelo rojo, camisa beige y equipo de campo.'},
 mateo:{title:'Padre Mateo',silhouette:'Saco vino entallado, faldones cortos, solapas largas y chaleco guinda.',hair:'Raya lateral baja, poco volumen y canas discretas en las sienes.',key:'Sin barba ni bigote; camisa marfil y rosario ámbar.'},
 tomas:{title:'Tomás',silhouette:'Poncho largo asimétrico sobre un cuerpo estrecho; sombrero de ala amplia.',hair:'Pelo corto bajo sombrero; bigote geométrico, sin barba.',key:'Petróleo y crema, grecas escalonadas y morral de cuero.'},
 amalia:{title:'Amalia',silhouette:'Falda verde en A más estrecha; rebozo marfil triangular con punta larga.',hair:'Trenza más estrecha y larga, con canas integradas en la masa.',key:'Bordado guinda, aros y silueta de manta protectora.'},
 vigia:{title:'Jhonnatan · Vigía',silhouette:'Torso alargado, chaleco guinda ajustado, pañuelo verde y morral cruzado.',hair:'Raya central con alas laterales y nuca media, sin mechas rojas.',key:'Camisa azul y bordado ocre; sin lentes ni barba.'},
 improvisador:{title:'Ángel · Improvisador',silhouette:'Chaqueta roja más estrecha, capucha recogida con volumen y dobladillo recto.',hair:'Flequillo angular irregular y volumen superior compacto, sin esferas.',key:'Lentes rectangulares negros gruesos, bordados y cordones crema.'},
 tecnico:{title:'Robert · Técnico',silhouette:'Hombros anchos, torso robusto, overol ocre y pantalón de trabajo amplio.',hair:'Base corta y un mechón elevado grande, barrido hacia un lado.',key:'Pañuelo MORADO solicitado, camisa marfil y herramientas en peto.'},
 detective:{title:'Fermín · Detective',silhouette:'Poncho más corto y simétrico que el de Tomás, sombrero más compacto.',hair:'Onda superior corta, laterales limpios; sin barba ni bigote.',key:'Petróleo, grecas crema, morral y hebilla ámbar.'},
 curandero:{title:'Alex · Curandero',silhouette:'Versión aprobada, sin cambio de proporciones ni cuello.',hair:'Tres masas aprobadas, raya central y mechas rojizas.',key:'Lentes redondos, camisa vino, chaleco petróleo y rebozo verde.'},
 sensitivo:{title:'Alex · Sensitivo',silhouette:'Mismo cuerpo, cabello y camisa del Curandero; sin chaleco ni rebozo.',hair:'Exactamente el cabello aprobado de Alex.',key:'Maquillaje de catrín rojo y vino; camisa roja elegante con adornos rojo oscuro; sin lentes.'},
 devota:{title:'Jenny · Devota',silhouette:'Falda vino con caída más recogida arriba y vuelo al bajo; rebozo petróleo diagonal.',hair:'Bob castaño rojizo hasta la nuca, ondas amplias y puntas angulares.',key:'Blusa marfil con bordado guinda, aros y rosario.'},
 guardaespaldas:{title:'Jorge · Guardaespaldas',silhouette:'Trapecio robusto con abrigo largo taupe, solapas grandes y abertura frontal.',hair:'Corte corto con flequillo sesgado y matices vino; sin barba.',key:'Lentes rectangulares finos, interior oscuro, cinturón posterior.'}
};
const B=0x201619,CREAM=0xeee0c8,GOLD=0xc08a2a;
function mat(c){const m=material(c);m.userData={c:new THREE.Color(c).getHex(),e:0};return m;}
function rows(list,b=1){return list.map(([y,w,d,z=0,x=0])=>({y,w:w*b,d:d*b,z,x}));}
function clearMeshes(g){for(const o of [...g.children])if(o.isMesh)g.remove(o);}
function panel(p,n,pts,c,z=.14,t=.007){return polygon(p,n,pts,t,c,z);}
function box(p,n,x,y,z,w,h,d,c){const m=mesh(p,n,new THREE.BoxGeometry(w,h,d),c);m.position.set(x,y,z);return m;}
function segment(p,n,a,b,r,c){const A=new THREE.Vector3(...a),Z=new THREE.Vector3(...b),v=Z.clone().sub(A);const m=mesh(p,n,new THREE.CylinderGeometry(r,r,v.length(),4),c);m.position.copy(A.add(Z).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
function facetedMass(p,n,outline,c,depth=.045,surface=(x,y)=>.138-(y-.18)*.34){
 const N=outline.length,v=outline.map(([x,y])=>[x,y,surface(x,y)]),ix=[];
 v.push(...outline.map(([x,y])=>[x,y,surface(x,y)-depth]));
 const center=outline.reduce((a,[x,y])=>[a[0]+x/N,a[1]+y/N],[0,0]);v.push([center[0],center[1],surface(...center)+.018]);
 for(let j=0;j<N;j++){const k=(j+1)%N;ix.push(2*N,j,k,j,j+N,k,k,j+N,k+N);}
 for(let j=1;j<N-1;j++)ix.push(N,N+j+1,N+j);
 return mesh(p,n,geo(v,ix),c);
}
function ribbon(p,n,path,width,c,t=.008){
 const v=[],ix=[];for(const[x,y,z]of path)v.push([x-width/2,y,z],[x+width/2,y,z+.004]);
 const N=v.length;v.push(...v.map(([x,y,z])=>[x,y,z-t]));
 for(let i=0;i<path.length-1;i++){const a=i*2,b=a+1,d=a+2,e=a+3;ix.push(a,b,d,b,e,d,a+N,d+N,b+N,b+N,d+N,e+N,a,d,a+N,d,d+N,a+N,b,b+N,e,e,b+N,e+N);}
 for(const a of[0,N-2])ix.push(a,a+N,a+1,a+1,a+N,a+N+1);
 return mesh(p,n,geo(v,ix),c);
}
function fringe(p,name,x,y,z,width,c,count=9){for(let i=0;i<count;i++){const a=x-width/2+i*width/count;panel(p,name+i,[[a,y],[a+width/count*.5,y],[a+width/count*.45,y-.034],[a-.002,y-.030]],c,z,.006);}}
function collar(p,c,b=1){panel(p,'cuello_solapa_I',[[-.065,.522],[-.005,.486],[-.047,.442],[-.111,.484]],c,.083);panel(p,'cuello_solapa_D',[[.005,.486],[.065,.522],[.111,.484],[.047,.442]],c,.083);}
function buttons(p,c,z=.124){for(const y of[.11,.23,.35])panel(p,'boton',Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*.005,y+Math.sin(i*Math.PI/3)*.005]),c,z);}
function embroidered(p,x,y,z,c,scale=1){flower(p,'bordado_flor',x,y,z,.018*scale,c);}
function glasses(r,thick=false){const g=group(r.head,'lentes_rectangulares'),c=mat(B),w=.064,h=.042,t=thick?.006:.003;
 for(const sd of[-1,1]){const x=sd*.042;panel(g,'aro_rectangular',[[x-w/2,.16-h/2],[x+w/2,.16-h/2],[x+w/2,.16+h/2],[x-w/2,.16+h/2]],c,.114,.006);const m=g.children.at(-1);g.remove(m);
 polygon(g,'montura_con_hueco',[[x-w/2,.16-h/2],[x+w/2,.16-h/2],[x+w/2,.16+h/2],[x-w/2,.16+h/2]],.006,c,.114,[[[x-w/2+t,.16-h/2+t],[x-w/2+t,.16+h/2-t],[x+w/2-t,.16+h/2-t],[x+w/2-t,.16-h/2+t]]]);
 segment(g,'patilla',[sd*.076,.17,.115],[sd*.103,.17,-.018],t/2,c);}
 segment(g,'puente',[-.012,.16,.117],[.012,.16,.117],thick?.003:.002,c);
}
function earrings(r){const c=mat(GOLD);for(const sd of[-1,1]){const pts=Array.from({length:8},(_,i)=>[sd*.106+Math.cos(i*Math.PI/4)*.016,.102+Math.sin(i*Math.PI/4)*.022]);const hole=Array.from({length:8},(_,i)=>[sd*.106+Math.cos(-i*Math.PI/4)*.011,.102+Math.sin(-i*Math.PI/4)*.016]);polygon(r.head,'aro_dorado',pts,.004,c,.009,[hole]);}}
function rosary(p,x=.1,y=.27,z=.17){const c=mat(GOLD);const pts=Array.from({length:11},(_,j)=>{const a=j*Math.PI*2/11;return[x+Math.cos(a)*.037,y+Math.sin(a)*.052,z];});
 for(let j=0;j<pts.length;j++){segment(p,'hilo_rosario',pts[j],pts[(j+1)%pts.length],.0015,c);const m=mesh(p,'cuenta_ambar',new THREE.OctahedronGeometry(.005),c);m.position.set(...pts[j]);}
 box(p,'cruz_vertical',x,y-.074,z,.007,.035,.006,c);box(p,'cruz_horizontal',x,y-.069,z,.022,.006,.006,c);
}
function scarf(p,c){ribbon(p,'panuelo_cuello',[[-.075,.48,.064],[0,.421,.145],[.075,.48,.064]],.052,c);panel(p,'nudo_panuelo',[[-.024,.438],[.019,.438],[.032,.410],[0,.390],[-.022,.414]],c,.155);panel(p,'colas_panuelo',[[-.012,.411],[.035,.404],[.060,.29],[.011,.32],[-.036,.27]],c,.15);}
function bag(p,b=1,pon=false){const leather=mat(0x87512c),dark=mat(0x62341f),gold=mat(GOLD);
 ribbon(p,'correa_morral',[[.17*b,.46,pon?.19:.104],[.08*b,.26,pon?.245:.167],[-.11*b,.04,pon?.24:.15],[-.18*b,-.10,pon?.23:.14]],.027,leather);
 const g=group(p,'morral_lateral',[pon?-.23*b:-.18*b,pon?-.22:-.075,pon?.185:.035]);solid(g,'cuerpo_morral',rows([[-.16,.075,.055],[0,.083,.06],[.035,.075,.052]]),leather,6);
 panel(g,'tapa_morral',[[-.08,.024],[.08,.024],[.074,-.04],[0,-.069],[-.073,-.04]],dark,.058);box(g,'hebilla',0,-.045,.07,.027,.023,.007,gold);
}
function vest(p,b,c,pockets=false){const g=group(p,'chaleco_con_sisas');shell(g,'cuerpo_chaleco',rows([[0,.17,.128],[.14,.159,.125],[.29,.2,.143],[.4,.213,.139],[.475,.137,.107]],b),c,8,.017,Array.from({length:8},(_,i)=>Math.PI/8+i*Math.PI/4),true);
 if(pockets)for(const sd of[-1,1])for(const y of[.13,.29]){const x=sd*.112*b;panel(g,'bolsillo_con_tapa',[[x-.034,y-.036],[x+.034,y-.036],[x+.034,y+.012],[x-.034,y+.012]],c,.146*b);box(g,'tapa',x,y+.013,.155*b,.07,.012,.008,c);}
 return g;
}
function coat(r,c,long=false){const b=CHARS[r.id].build||1,g=group(r.acc,'saco_con_sisas'),base=long?-.55:-.18;
 shell(g,'prenda_abierta_con_grosor',rows([[base,.225,.16],[.02,.184,.142],[.17,.17,.134],[.30,.205,.149],[.40,.226,.143],[.475,.142,.113]],b),c,8,.019,Array.from({length:8},(_,i)=>Math.PI/8+i*Math.PI/4),true);
 const lap=mat(long?0x796c51:0x632333);
 for(const sd of[-1,1])panel(g,'solapa_ancha',[[sd*.07,.49],[sd*.163,.41],[sd*.121,.35],[sd*.153,.32],[sd*.063,.12]],lap,.147*b);
 if(long){box(g,'cinturon_posterior',0,.09,-.164*b,.31*b,.026,.012,lap);for(const sd of[-1,1])box(g,'bolsillo_abrigo',sd*.16,-.1,.148*b,.068,.022,.012,lap);}
 return g;
}
function hair(r,S){r.hair.clear();const g=r.hair,c=mat(S.hair.c),shade=mat(new THREE.Color(S.hair.c).multiplyScalar(1.18)),id=r.id;
 const low=id==='devota'?.035:id==='vigia'?.075:.125,high=id==='tecnico'?.301:id==='improvisador'?.300:.283;
 const v=[],ix=[];for(let row=0;row<4;row++)for(let j=0;j<8;j++){const a=j*Math.PI/4,f=Math.max(0,Math.cos(a)),back=Math.max(0,-Math.cos(a));let y=[low+f*(.218-low)-back*.02,.222,high-.025,high][row];
  const radius=[.106,.115,.093,.037][row],zrad=[.104,.123,.105,.052][row];v.push([Math.sin(a)*radius,y,Math.cos(a)*zrad-.011]);}
 for(let row=0;row<3;row++)for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;ix.push(a,b,a+8,b,b+8,a+8);}for(let j=1;j<7;j++){ix.push(0,j+1,j,24,24+j,24+j+1);}mesh(g,'masa_nuca_sienes_cerrada',geo(v,ix),c);
 const waveLeft=[[-.109,.173],[-.128,.218],[-.106,.259],[-.045,.297],[.01,.282],[-.037,.250],[-.071,.225],[-.083,.182]];
 const waveRight=[[.002,.281],[.045,.291],[.093,.267],[.123,.221],[.105,.175],[.081,.212],[.053,.25]];
 if(id==='ines'||id==='amalia'){
  facetedMass(g,'raya_diagonal',[[-.109,.198],[-.104,.254],[-.05,.283],[.038,.276],[.082,.254],[-.027,.237],[-.077,.199]],c,.04);
  const len=id==='ines'?.41:.46,points=[];for(let j=0;j<9;j++)points.push([j%2?.012:-.012,.12-j*len/8,-.13-j*.009]);
  // One continuous braid, with alternating angular cross sections and a sealed tip.
  const vertices=[],indices=[];for(let j=0;j<points.length;j++){const[x,y,z]=points[j],w=.045-j*.0032;for(let k=0;k<6;k++){const a=k*Math.PI/3+(j%2?.35:-.35);vertices.push([x+Math.cos(a)*w,y,z+Math.sin(a)*w*.8]);}}
  for(let j=0;j<8;j++)for(let k=0;k<6;k++){const a=j*6+k,b=j*6+(k+1)%6;indices.push(a,b,a+6,b,b+6,a+6);}for(let k=1;k<5;k++)indices.push(48,48+k,48+k+1);const braid=mesh(g,'trenza_continua_sin_bolas',geo(vertices,indices),c);
  braid.userData.rearLengthMeters=len;
  if(id==='amalia'){ribbon(g,'mechon_cana',[[.04,.27,-.095],[.065,.21,-.115],[.023,.12,-.159],[-.01,-.12,-.20]],.013,mat(0xaaa39c));facetedMass(g,'cana_sien',[[-.08,.235],[-.095,.20],[-.092,.16],[-.08,.19],[-.063,.24]],mat(0xaaa39c),.005);}
  else flower(g,'flor_naranja',-.104,.164,.025,.035,mat(0xe0782a));
 }else if(id==='devota'){
  facetedMass(g,'bob_onda_izquierda',[[-.112,.045],[-.131,.083],[-.135,.154],[-.12,.234],[-.063,.286],[.004,.282],[-.028,.249],[-.078,.209],[-.075,.13],[-.091,.091],[-.075,.054]],shade,.065);
  facetedMass(g,'bob_onda_derecha',[[.005,.283],[.061,.286],[.117,.245],[.133,.17],[.125,.09],[.099,.046],[.083,.069],[.09,.116],[.078,.177],[.073,.232],[.029,.257]],c,.065);
 }else if(id==='vigia'){
  facetedMass(g,'onda_partida_I',waveLeft,c,.052);facetedMass(g,'onda_partida_D',waveRight,shade,.05);
 }else if(id==='tecnico'){
  facetedMass(g,'mechon_elevado',[[-.111,.211],[-.122,.263],[-.074,.308],[-.015,.330],[.043,.322],[.096,.281],[.08,.226],[.047,.209],[.054,.256],[.008,.273],[-.059,.244]],shade,.069);
 }else if(id==='improvisador'){
  facetedMass(g,'flequillo_irregular',[[-.112,.19],[-.124,.245],[-.098,.285],[-.04,.308],[.021,.292],[.089,.268],[.108,.216],[.076,.227],[.055,.193],[.03,.228],[-.005,.205],[-.03,.241],[-.064,.214],[-.082,.231]],shade,.055);
 }else if(id==='guardaespaldas'){
  facetedMass(g,'flequillo_corto_sesgado',[[-.109,.204],[-.109,.255],[-.044,.284],[.061,.27],[.109,.235],[.096,.198],[.074,.219],[.051,.197],[.027,.23],[-.003,.208],[-.017,.238],[-.064,.212]],shade,.038);
 }else if(id==='rafael'){
  facetedMass(g,'onda_retrocedida',[[-.113,.213],[-.119,.257],[-.078,.296],[-.021,.306],[.075,.274],[.101,.232],[.074,.244],[.019,.264],[-.041,.246],[-.085,.209]],shade,.055);
 }else{
  facetedMass(g,'raya_lateral_baja',[[-.108,.205],[-.108,.249],[-.067,.281],[.014,.29],[.081,.267],[.096,.233],[.055,.248],[-.015,.264],[-.055,.234],[-.086,.204]],shade,.036);
  if(id==='mateo')for(const sd of[-1,1])facetedMass(g,'cana_discreta',[[sd*.083,.17],[sd*.1,.19],[sd*.1,.223],[sd*.083,.213]],mat(0x8a8078),.005);
 }
 if(id==='rafael'){
  facetedMass(r.head,'barba_compacta',[[-.079,.116],[-.066,.079],[-.036,.037],[.028,.035],[.069,.078],[.079,.116],[.045,.087],[-.04,.087]],c,.025,(x,y)=>.10-Math.abs(x)*.16);
 }
 if(id==='rafael'||id==='tomas')for(const sd of[-1,1])facetedMass(r.head,'bigote_identitario',[[0,.107],[sd*.018,.118],[sd*.057,.101],[sd*.056,.09],[sd*.025,.097],[0,.099]],c,.007,()=>.11);
}
function hat(r,detective){const c=mat(detective?0x235a5a:0x23565c),cream=mat(CREAM),g=group(r.head,'sombrero_octagonal');
 solid(g,'ala_con_espesor',rows([[.262,detective?.166:.184,.15],[.275,detective?.168:.187,.153]]),c,8);
 solid(g,'copa',rows([[.275,.105,.10],[.365,.089,.085],[.381,.077,.074]]),c,8);
 shell(g,'cinta_sombrero',rows([[.29,.107,.102],[.308,.103,.098]]),cream,8,.004);
}
function poncho(r,c,detective){const b=CHARS[r.id].build||1,g=group(r.acc,'poncho_continuo'),low=detective?-.13:-.31;
 const angles=Array.from({length:8},(_,i)=>i*Math.PI/4),v=[],ix=[];
 const ring=[[.53,.073,.07],[.46,.245*b,.18],[.18,.32*b,.215],[low,.31*b,.225]];
 for(let k=0;k<ring.length;k++)for(const a of angles){const[y,w,d]=ring[k];let yy=y;if(k===3)yy+=Math.abs(Math.sin(a))*.18+(detective?0:Math.sin(a)*.085);v.push([Math.sin(a)*w,yy,Math.cos(a)*d]);}
 const N=v.length;v.push(...v.map(([x,y,z])=>[x*.975,y+.002,z*.965]));
 for(let row=0;row<3;row++)for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;ix.push(a,b,a+8,b,b+8,a+8,a+N,a+8+N,b+N,b+N,a+8+N,b+8+N);}
 for(const row of[0,3])for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;ix.push(a,a+N,b,b,a+N,b+N);}mesh(g,'manta_cerrada_espesor_sin_paneles_sueltos',geo(v,ix),c);
 const cream=mat(CREAM);
 // Embroidery is projected onto the actual front surface, avoiding floating strips.
 function front(x,y){let r=ring.length-2;for(let k=0;k<ring.length-1;k++)if(y<=ring[k][0]&&y>=ring[k+1][0]){r=k;break;}
  const a=ring[r],b=ring[r+1],t=THREE.MathUtils.clamp((y-a[0])/(b[0]-a[0]),0,1),w=THREE.MathUtils.lerp(a[1],b[1],t),d=THREE.MathUtils.lerp(a[2],b[2],t);
  return d*(1-(1-Math.SQRT1_2)*Math.abs(x)/(w*Math.SQRT1_2))+.004;
 }
 const bands=[.25,detective?.015:-.10];
 for(const y of bands){polygon(g,'franja_bordada',[[-.185,y-.012],[.185,y-.012],[.185,y+.012],[-.185,y+.012]],.003,cream,0,[],front);
  for(let j=-2;j<=2;j++){const x=j*.067;polygon(g,'greca_escalonada',[[x-.02,y+.032],[x-.01,y+.032],[x-.01,y+.041],[x+.01,y+.041],[x+.01,y+.032],[x+.02,y+.032],[x+.02,y+.022],[x+.01,y+.022],[x+.01,y+.015],[x-.01,y+.015],[x-.01,y+.022],[x-.02,y+.022]],.003,cream,0,[],front);}
 }
 for(let j=-5;j<=5;j++){const x=j*.028,y=low+Math.abs(x)/.31*.18+(detective?0:x/.31*.085),z=.225*(1-(1-Math.SQRT1_2)*Math.abs(x)/(.31*Math.SQRT1_2));fringe(g,'fleco_poncho',x,y+.006,z+.002,.015,cream,1);}
 // Deformation data keep arm lift response attached to the same original shoulder joints.
 r.reviewPoncho=g;r.g.userData.poncho=true;
 return g;
}
function skirt(r,S){for(const o of [...r.hips.children])if(o.isMesh)r.hips.remove(o);
 const id=r.id,c=mat(S.bottom.c),trim=mat(id==='ines'?0x8c1e3c:id==='amalia'?0x989646:0xe4c39a);
 const ring=id==='ines'?[[.02,.145,.11],[-.14,.21,.145],[-.34,.255,.17],[-.755,.31,.19]]:id==='amalia'?[[.02,.145,.108],[-.18,.19,.132],[-.4,.235,.155],[-.77,.265,.18]]:[[.02,.14,.107],[-.17,.19,.14],[-.43,.23,.155],[-.76,.293,.188]];
 const g=group(r.hips,'falda_una_sola_superficie');
 const skirtMesh=mesh(g,'falda_plegada_con_bajo',loftGeo(ring,16,{a0:0,pleat:.06}),c);skirtMesh.material.side=THREE.DoubleSide;r.reviewSkirt=g;
 for(const [y,w,d]of ring.slice(2)){shell(g,'cenefa_integrada',rows([[y+.023,w-.002,d-.001],[y+.006,w+.001,d+.001]]),trim,8,.004);}
 if(id==='ines')for(const [y,w,d]of[[-.21,.226,.157],[-.40,.27,.18]])shell(g,'volante_angular',rows([[y+.045,w-.014,d-.006],[y,w,d]]),c,8,.006);
 if(id==='devota')for(let j=-3;j<=3;j++)flower(g,'bordado_bajo_falda',j*.055,-.70,.187,.014,trim);
 return g;
}
function wrap(r,S){const id=r.id,c=mat(id==='ines'?0xa0285e:id==='amalia'?0xf0e4cc:0x1f6a66),trim=mat(id==='ines'?0x5a0f1e:id==='amalia'?0x7a1e2e:0xe8d8b8),g=group(r.acc,'rebozo_continuo');
 if(id==='amalia'){
  // Single hollow eight-sided mantle with sloping hem, and a real neck aperture.
  const rings=[[.485,.078,.069],[.38,.235,.142],[.08,.27,.16],[-.17,.252,.17]];const angles=Array.from({length:8},(_,i)=>i*Math.PI/4);const v=[],ix=[];
  for(let k=0;k<4;k++)for(const a of angles)v.push([Math.sin(a)*rings[k][1],rings[k][0]+(k===3?Math.abs(Math.sin(a))*.25:0),Math.cos(a)*rings[k][2]]);
  const N=v.length;v.push(...v.map(([x,y,z])=>[x*.977,y,z*.96]));for(let k=0;k<3;k++)for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8;ix.push(a,b,a+8,b,b+8,a+8,a+N,a+8+N,b+N,b+N,a+8+N,b+8+N);}for(const k of[0,3])for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8;ix.push(a,a+N,b,b,a+N,b+N);}mesh(g,'manta_marfil_continua',geo(v,ix),c);
  for(let j=-2;j<=2;j++)flower(g,'bordado_manta',j*.065,.21,.148-Math.abs(j)*.018,.022,trim);
  fringe(g,'flecos_manta',0,-.17,.175,.27,c,10);
 }else{
  const y=id==='ines'?.29:.38;
  ribbon(g,'banda_sobre_espalda',[[-.21,y-.10,-.08],[-.18,y+.035,-.16],[0,y-.01,-.17],[.18,y+.035,-.16],[.21,y-.10,-.08]],.15,c);
  ribbon(g,'caida_frente_I',[[-.21,y-.10,-.08],[-.2,y-.09,.04],[-.18,y-.16,.13],[-.16,y-.30,.16],[-.21,y-.49,.15]],.12,c);
  ribbon(g,'caida_frente_D',[[.21,y-.10,-.08],[.2,y-.09,.04],[.19,y-.16,.13],[.16,y-.28,.16],[.15,y-.40,.16]],.105,c);
  for(const sd of[-1,1]){flower(g,'motivo_rebozo',sd*.165,y-.23,.17,.025,trim);fringe(g,'fleco',sd*.18,y-(sd<0?.49:.40),.15,.1,trim,5);}
 }
 return g;
}
function hood(r,c){const g=group(r.acc,'capucha_recogida'),dark=mat(0x620e23),cream=mat(CREAM);
 shell(g,'capucha_hueca',rows([[.38,.13,.095,-.055],[.46,.146,.10,-.085],[.55,.116,.076,-.095]]),c,8,.018);
 for(const sd of[-1,1]){segment(g,'cordon_capucha',[sd*.055,.46,.116],[sd*.053,.31,.137],.003,cream);box(g,'terminal_cordon',sd*.053,.303,.137,.006,.018,.007,cream);}
 box(g,'cremallera',0,.21,.13,.009,.39,.006,dark);
 for(const sd of[-1,1])for(const y of[.08,.18,.28,.38])flower(g,'bordado_chaqueta',sd*.076,y,.13,.012,cream);
}
function overalls(r){const b=1.2,c=mat(0xc07a28),dark=mat(0x995722),gold=mat(GOLD),purple=mat(0x72509a);
 shell(r.acc,'cintura_overol',rows([[-.04,.168,.123],[.10,.169,.126]],b),c,8,.012);
 panel(r.acc,'peto_ochre',[[-.123,.09],[.123,.09],[.113,.34],[-.113,.34]],c,.165,.013);
 for(const sd of[-1,1]){ribbon(r.acc,'tirante_overol',[[sd*.10,.13,.18],[sd*.11,.34,.177],[sd*.135,.47,.09],[sd*.13,.4,-.15],[sd*.11,.13,-.158]],.033,c);
  box(r.acc,'hebilla_tirante',sd*.11,.326,.19,.029,.033,.007,gold);box(r.acc,'bolsillo_pierna',sd*.10,-.11,.12,.082,.1,.014,dark);}
 box(r.acc,'bolsillo_peto',0,.21,.189,.15,.079,.012,dark);
 for(const [x,col,h]of[[-.04,0x326a64,.058],[0,0x756389,.048],[.04,0x718786,.067]]){box(r.acc,'herramienta_peto',x,.275,.19,.012,h,.012,mat(col));}
 scarf(r.acc,purple);
}
function makeReviewCharacter(id,{original=false}={}){
 if(original)return makeCharacter(id);
 if(id==='curandero')return makeCharacter(id);
 if(id==='sensitivo')return makeAlexStudy();
 const r=makeCharacter(id),S=CHARS[id],b=S.build||1;const top=mat(S.top),sleeve=mat(id==='mateo'?0x7a2a3a:id==='guardaespaldas'?0xa08a64:S.top),skin=mat(S.skin),dark=mat(B);
 r.acc.clear();r.hair.clear();clearMeshes(r.torso);for(const o of r.head.children.filter(o=>o.isMesh).slice(5))r.head.remove(o);
 // Preserve every original animation group. Only attached mesh geometry is replaced.
 const width=id==='improvisador'?.91:id==='tecnico'?1.03:id==='mateo'?.94:1;
 shell(r.acc,'camisa_entallada',rows([[-.02,.149,.105],[.12,S.fem?.123:.139,.099],[.29,S.fem?.16:.179,.117],[.402,.19,.11],[.48,.112,.081],[.52,.06,.055]],b*width),top,8,.014);
 collar(r.acc,top,b);buttons(r.acc,dark,.123*b);
 for(const arm of[r.armL,r.armR]){
  clearMeshes(arm);solid(arm,'manga_superior_continua',rows([[.022,.046,.046],[-.035,.061,.059],[-.14,.052,.05],[-.27,.044,.044]],b*width),sleeve,6);
  const elbow=arm.userData.elbow;
  // Replace lower sleeve only, retain palm/fingers and hand anchor object identities.
  for(const o of [...elbow.children])if(o.isMesh&&o.position.y===0)elbow.remove(o);
  const rolled=['rafael','tecnico'].includes(id);
  solid(elbow,rolled?'antebrazo_piel':'manga_inferior',rows([[.01,.045,.045],[-.11,.041,.04],[-.21,.034,.032]]),rolled?skin:sleeve,6);
  if(rolled)shell(elbow,'puno_remangado',rows([[.004,.052,.051],[-.055,.051,.05]]),top,6,.008);
  else shell(elbow,'ribete_puno',rows([[-.175,.038,.037],[-.2,.036,.034]]),mat(S.trim||S.top),6,.004);
 }
 hair(r,S);
 if(S.bottom.skirt){skirt(r,S);wrap(r,S);earrings(r);for(let j=-2;j<=2;j++)flower(r.acc,'bordado_blusa',j*.039,.405,.121-Math.abs(j*.039)*.42,.014,mat(S.trim||0x8c1e3c));}
 if(id==='rafael'){vest(r.acc,b,mat(0x4e6a3c),true);scarf(r.acc,mat(0xb02018));}
 if(id==='mateo'){vest(r.acc,b,mat(0x5a0f1e));coat(r,mat(0x7a2a3a));rosary(r.acc,.065,.27,.17);}
 if(id==='tomas'||id==='detective'){poncho(r,mat(S.acc[0][1]),id==='detective');hat(r,id==='detective');bag(r.acc,b,true);}
 if(id==='vigia'){
  vest(r.acc,b,mat(0x8a2232));scarf(r.acc,mat(0x2f6a5e));bag(r.acc,b);
  for(const sd of[-1,1])for(const y of[.1,.22,.34])flower(r.acc,'bordado_chaleco',sd*.095,y,.142,.014,mat(0xd8b030));
 }
 if(id==='improvisador'){hood(r,top);glasses(r,true);}
 if(id==='tecnico')overalls(r);
 if(id==='devota')rosary(r.acc,.075,.23,.18);
 if(id==='guardaespaldas'){coat(r,mat(0xa08a64),true);glasses(r);}
 const mats=new Set();r.g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial){m.flatShading=true;m.roughness=1;m.metalness=0;m.userData={c:m.color.getHex(),e:0};mats.add(m);}});r.mats=[...mats];
 r.g.name='NDA_'+id+'_elenco_aprobado';r.g.userData={...r.g.userData,approval:'approved_2026_11_19',identity:DESIGN[id],source:'original procedural rig; anatomy and animation anchors unchanged'};
 return r;
}
function deformCloth(group,fn){
 group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;if(!o.userData.restPositions)o.userData.restPositions=Array.from(p.array);const a=o.userData.restPositions;
  for(let i=0;i<p.count;i++){const v=fn(a[i*3]+o.position.x,a[i*3+1]+o.position.y,a[i*3+2]+o.position.z);p.setXYZ(i,v[0]-o.position.x,v[1]-o.position.y,v[2]-o.position.z);}p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();
 });
}
function animateCharacter(r,s){
 originalAnimate(r,s);const crouch=THREE.MathUtils.clamp((r.hipY-r.hips.position.y)/.42,0,1);
 if(r.reviewSkirt)deformCloth(r.reviewSkirt,(x,y,z)=>[x*(1+.1*crouch),y*(1-.45*crouch),z+crouch*.45*THREE.MathUtils.clamp(-y/.14,0,1)*THREE.MathUtils.clamp(z/.15,0,1)]);
 if(r.reviewPoncho)deformCloth(r.reviewPoncho,(x,y,z)=>{const arm=x<0?r.armR:r.armL,lift=Math.max(0,-arm.rotation.x),w=Math.pow(THREE.MathUtils.clamp((Math.abs(x)-.09)/.23,0,1),2)*THREE.MathUtils.clamp((y+.03)/.25,0,1);return[x,y+lift*.035*w,z+lift*.16*w];});
}

return {makeReviewCharacter,animateCharacter};
})();
function makeCharacter(id){return NDAElencoArt.makeReviewCharacter(CHARS[id]?id:'ines');}
function animateCharacter(r,s){return NDAElencoArt.animateCharacter(r,s);}

export {CHARS,CHAR_IDS,makeCharacter,animateCharacter,makeGhostRig,animateGhostRig,loftGeo};
