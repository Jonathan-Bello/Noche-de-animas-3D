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
  if (!S.bottom.skirt) mesh(loftGeo([[0.04, 0.15 * b, 0.105 * b], [-0.06, 0.165 * b, 0.11 * b], [-0.13, 0.15 * b, 0.1 * b]], 8, { capB: true }), pantsM, hips);
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
