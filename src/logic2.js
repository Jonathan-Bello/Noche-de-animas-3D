// ===================== NOCHE DE ÁNIMAS v0.2 · MOTOR DE REGLAS =====================
// Sin DOM ni gráficos: corre en el navegador o en node (simulador).
'use strict';

// ---------- Utilidades ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };

// ---------- Evidencias y herramientas ----------
const EV = {
  BC: { n: 'Bajo cero', tool: 'termo' }, SU: { n: 'Susurros', tool: 'grab' }, ES: { n: 'Marcas en el espejo', tool: 'espejo' },
  CE: { n: 'Huellas de ceniza', tool: 'uv' }, OB: { n: 'Silueta en cámara', tool: 'cam' }, LU: { n: 'EMF 5', tool: 'emf' },
  AZ: { n: 'Olor a azufre', tool: 'gases' },
};
const EV_KEYS = Object.keys(EV);
const ITEMS = {
  termo: { n: 'Termómetro', tool: 'BC', elec: true }, grab: { n: 'Grabadora', tool: 'SU', elec: true },
  espejo: { n: 'Espejo de mano', tool: 'ES', elec: false }, uv: { n: 'Lámpara UV', tool: 'CE', elec: true },
  cam: { n: 'Cámara de movimiento', tool: 'OB', elec: true }, emf: { n: 'Detector EMF', tool: 'LU', elec: true },
  gases: { n: 'Sensor de gases', tool: 'AZ', elec: true },
  te: { n: 'Té de tila' }, rosario: { n: 'Rosario' }, ruda: { n: 'Ruda' }, copal: { n: 'Copal' }, vela: { n: 'Veladora' },
  ceniza: { n: 'Puño de ceniza', hint: 'Espacio o G: la riegas en el piso. Si el ánima pasa, la pisa; con la UV se ven sus huellas.' },
  cruz: { n: 'Cruz de palma', hint: 'Déjala (G): no puede empezar una cacería a 4 m. Aguanta 2.' },
  pan: { n: 'Pan de muerto', hint: 'Déjalo de ofrenda (G): atrae al ánima, que se lo come y recupera presencia.' },
  foco: { n: 'Foco de repuesto', hint: 'Junto al apagador de un cuarto con el foco fundido, Q lo cambia.' },
  limpia: { n: 'Limpia con huevo', hint: 'Espacio: +20 de cordura a quienes estén a 4 m. Si el huevo sale negro, el ánima anda cerca.' },
  tarot: { n: 'Tarot', cursed: true, hint: 'Espacio: sacas una carta. Puede salvarte… o condenarte.' },
  tablilla: { n: 'Tablilla espiritista', cursed: true, hint: 'Espacio: haces la siguiente pregunta (¿dónde estás?, ¿qué no eres?, ¿estás aquí?). Cada una cuesta 15 de cordura.' },
  espejoplata: { n: 'Espejo de plata', cursed: true, hint: 'Espacio: miras en la plata dónde está el ánima. Te come la cordura mientras miras.' },
  mano: { n: 'Mano del mono', cursed: true, hint: 'Espacio: pides un deseo. Siempre se cobra.' },
  muneca: { n: 'Muñeca de la isla', cursed: true, hint: 'Espacio: clavas un alfiler y el ánima mueve algo. Uno de los alfileres es el del corazón.' },
  pentagrama: { n: 'Pentagrama', cursed: true, hint: 'Espacio: prendes una de sus 5 velas (12 de cordura cada una). Con la quinta, el ánima aparece atrapada, muestra una de sus evidencias… y luego caza sin que sirva el copal.' },
  radio: { n: 'Radio', cursed: true, elec: true, hint: 'Espacio: preguntas por la radio. Si el ánima está cerca, responde con dos chasquidos.' },
};
const TOOLS = ['termo', 'grab', 'espejo', 'uv', 'cam', 'emf', 'gases'];
const CURSED = ['tarot', 'tablilla', 'espejoplata', 'mano', 'muneca', 'pentagrama', 'radio'];

// ---------- Números del juego ----------
const CFG = {
  grace: 15, huidaDur: 90, selloStart: 150, selloGap: 75, selloSound: 10, selloSight: 8,
  walk: 2.6, sprint: 3.7, stamDrain: 20, stamWalk: 10, stamRest: 25, stamMin: 40,
  darkDrain: 0.12, hallDrain: 0.05, nearDrain: 0.4, nearR: 3, homeDrain: 0.25, hiddenHuntDrain: 0.3,
  chill: { cd: 10, cost: 2, r: 4, dmg: 10 }, cds: { e: 6, f: 8, c: 8, v: 12 },
  huntDur: 15, huntFirst: 210, huntGap: 90, huntGrace: 3, huntMinPres: 12, killDist: 0.6, lostSight: 3,
  te: 25, rosaryBlind: 5, rudaDur: 40, copal: { r: 3, dur: 6, stun: 3 }, vela: { r: 3, dur: 90 },
  throwMax: 8, slots: 4,
  force: { 1: 0.2, 2: 1.1, 3: 2.4, 4: 3.4 },
  equip: { // cantidades por número de investigadores
    te: [3, 4, 6, 8], rosario: [1, 2, 3, 4], ruda: [1, 1, 2, 2], copal: [1, 2, 2, 3], vela: [2, 3, 4, 4],
    ceniza: [2, 2, 3, 4], cruz: [1, 1, 2, 2], pan: [1, 1, 2, 2], limpia: [1, 1, 1, 2], foco: [2, 2, 3, 3],
  },
  equipPreset: { escaso: { mult: 0.6, force: 1.15 }, normal: { mult: 1, force: 1 }, abundante: { mult: 1.5, force: 0.85 } },
  uvTime: { facil: 30, normal: 20, pesadilla: 10 },
  ash: { r: 0.8, dur: 240, prints: 90 }, cruz: { r: 4, charges: 2, cd: 20 }, pan: { eat: 4, pres: 10 }, limpia: { r: 4, heal: 20, sense: 8 },
  cursedHunt: 10, ritualDur: 6, ritualBreak: 8, stealthCost: 2.5, mudanzas: 2, apagon: { cost: 6, cd: 60 }, accel: 14, decel: 18,
  // núcleo v2
  rastro: { gain: 1, decay: 0.3, homeMult: 2 }, hunger: { drain: 0.4, hunt: 1.2, home: 1, feed: 1 }, fade: { show: 3, rest: 20 },
  termo: { settle: 8, noise: 1.5 }, grab: { p: 0.4, r: 8, cd: 6, hear: 3, maxPeople: 2 }, emfP: 0.2, uv: { p: 0.35, min: 30, re: 60, glow: 60 },
  cam: { p: 0.25, min: 50 }, esp: { p: 0.25, min: 40 }, gasP: 0.5, interf: { r: 6, cd: 20, dur: 8, cost: 4 }, bulb: { flips: 6, win: 30 }, mustHunt: 60, possess: { cd: 100, cost: 8, dur: 16, drain: 1.2 }, anomaly: { cd: 22, cost: 3, max: 14 }, analog: { gap: [150, 230] }, manifest: { cd: 30, cost: 4, dmg: 5, show: 1.6 }, hallu: { cd: 35, cost: 5, dur: 3.2 }, tablillaCost: 15, mirrorDrain: 7.5, mirrorMin: 20, pinCost: 5, candleCost: 12, radio: { cost: 5, r: 10, cd: 8 },
};

/*LAYOUT_RUNTIME*/

// ---------- Navegación (campos de distancia bajo demanda) ----------
const NN = 2 * FL;
const fieldCache = new Map();
function buildField(target, mode, mask) {
  const dist = new Uint16Array(NN).fill(65535), q = new Int32Array(NN); let h = 0, t = 0;
  dist[target] = 0; q[t++] = target;
  while (h < t) {
    const u = q[h++], f = u >= FL ? 1 : 0, i = u - f * FL, x = i % W, y = (i / W) | 0, du = dist[u] + 1;
    const tryN = v => { if (dist[v] !== 65535) return; const vf = v >= FL ? 1 : 0, vi = v - vf * FL; if (!walkableT(grids[vf][vi]) || (mask && mask[v])) return; if (mode !== 'fly' && (STAIR_BLOCK[v] || (vf === f && stairSideBlock(i, vi)))) return; dist[v] = du; q[t++] = v; };
    if (x > 0) tryN(u - 1); if (x < W - 1) tryN(u + 1); if (y > 0) tryN(u - W); if (y < H - 1) tryN(u + W);
    const other = f ? u - FL : u + FL;
    if ((mode !== 'fly' && isStairMid[i]) || (mode === 'fly' && walkableT(grids[1 - f][i]))) tryN(other);
  }
  return dist;
}
function getField(target, mode, mask, ver) {
  const key = mode + ':' + target + ':' + (mask ? ver : 0);
  let fld = fieldCache.get(key);
  if (!fld) { fld = buildField(target, mode, mask); fieldCache.set(key, fld); if (fieldCache.size > 500) fieldCache.delete(fieldCache.keys().next().value); }
  return fld;
}
const nodeOf = e => e.f * FL + (e.y | 0) * W + (e.x | 0);
const ethereal = e => e.kind === 'ghost' && !e.hunt && e.state !== 'despertando';
function solidFor(w, e, f, tx, ty) {
  const t = tileAt(f, tx, ty);
  if (e.kind === 'ghost' && ty >= 39) return true; // el ánima no sale de la casona
  if (ethereal(e)) { if (tx < 1 || ty < 1 || tx >= W - 1 || ty >= H - 1 || t === T.VOID) return true; const n = f * FL + ty * W + tx; return !!w.ghostMask[n] && !w.ghostMask[nodeOf(e)]; }
  if (!walkableT(t)) return true;
  const n = f * FL + ty * W + tx;
  const ci=(e.y|0)*W+(e.x|0),ni=ty*W+tx;
  // The capsule spans both sides of the half-height landing before its root changes floor.
  const transferClearance=isStairMid[ci]&&isStair[ni]&&stairAt(e.x,e.y)===stairAt(tx+.5,ty+.5);
  if (!(e.kind === 'ghost' && e.def.fly) && ((STAIR_BLOCK[n]&&!transferClearance) || stairSideBlock(ci,ni))) return true;
  if (w.doorTile) { const dd = w.doorTile.get(n); if (dd && dd.closed) return true; }
  if (e.kind === 'ghost' && w.ghostMask[n] && !w.ghostMask[nodeOf(e)]) return true;
  if (e.kind === 'inv' && w.invMask[n]) return true;
  return false;
}
function collides(w, e, x, y) {
  const r = e.r;
  for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++)
    if (solidFor(w, e, e.f, tx, ty)) { const cx = clamp(x, tx, tx + 1), cy = clamp(y, ty, ty + 1); if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true; }
  return false;
}
function tryMove(w, e, dx, dy) {
  if (e.kind === 'ghost' && e.def.darkFear && e.hunt && !e.hunt.huida && enteringDark(w, e, e.x + dx, e.y + dy)) return;
  if (e.noclip) { e.x = clamp(e.x + dx, 0.5, W - 0.5); e.y = clamp(e.y + dy, 0.5, H - 0.5); return; }
  for (const k of [1, 0.5, 0.25]) if (!collides(w, e, e.x + dx * k, e.y)) { e.x += dx * k; break; }
  for (const k of [1, 0.5, 0.25]) if (!collides(w, e, e.x, e.y + dy * k)) { e.y += dy * k; break; }
}
function steer(w, e, px, py, speed, dt) {
  const dx = px - e.x, dy = py - e.y, l = Math.hypot(dx, dy); if (l < 0.008) return true;
  const s = Math.min(l, speed * dt); tryMove(w, e, dx / l * s, dy / l * s); e.face = Math.atan2(dy, dx); return false;
}
function snapWalkable(w, e) {
  if (!collides(w, e, e.x, e.y)) return; let best = null, bd = 99;
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = (e.x | 0) + dx + 0.5, y = (e.y | 0) + dy + 0.5; if (!walkableT(tileAt(e.f, x, y)) || collides(w, e, x, y)) continue; const d = Math.hypot(x - e.x, y - e.y); if (d < bd) { bd = d; best = { x, y }; } }
  if (best) { e.x = best.x; e.y = best.y; }
}
function changeFloor(w, e, nf) { e.f = nf; w.noise(e, 6, e.kind === 'ghost' ? 'ghoststairs' : 'stairs'); if (e.kind === 'ghost' && e.def.id === 'tlahuel') emitSello(w, e, 'aleteo'); }
// mueve a e hacia target {f,x,y}; devuelve true al llegar
function navTo(w, e, tg, speed, dt) {
  if (!tg) return true;
  // Recover an off-centre capsule at a stair entry without jumping to another cell or floor.
  if(stairAt(e.x,e.y)>=0&&collides(w,e,e.x,e.y)){
    const x=(e.x|0)+.5,y=(e.y|0)+.5;
    if(Math.hypot(x-e.x,y-e.y)<.6&&!collides(w,e,x,y)){e.x=x;e.y=y;}
  }
  if (ethereal(e)) { if (tg.f !== e.f) { const t2 = tileAt(tg.f, e.x, e.y); if (t2 !== T.VOID) { changeFloor(w, e, tg.f); return false; } } else return steer(w, e, tg.x, tg.y, speed, dt); }
  const mode = e.kind === 'ghost' && e.def.fly ? 'fly' : 'walk';
  const mask = e.kind === 'ghost' ? w.ghostMask : w.invMask, ver = e.kind === 'ghost' ? w.ghostMaskVer : w.invMaskVer;
  const tn = nodeOf(tg), cn = nodeOf(e);
  if (tn === cn) return steer(w, e, tg.x, tg.y, speed, dt);
  const fld = getField(tn, mode, mask, ver);
  if(w.t<(e.doorActionUntil||0))return false;
  if(e.bot||e.kind==='ghost'){const door=w.doors.find(d=>d.f===e.f&&d.closed&&!d.locked&&!(e.kind==='ghost'&&d.ext)&&d2(d,e)<1.8&&fld[nodeOf(d)]<=fld[cn]);if(door){door.closed=false;door.anim=0;e.doorActionUntil=w.t+(e.kind==='ghost'?.65:.35);w.noise(door,6,'door');return false;}}
  if (fld[cn] === 65535) { if (tg.f === e.f) steer(w, e, tg.x, tg.y, speed, dt); return false; }
  const cx = e.x | 0, cy = e.y | 0, f = e.f; let best = -1, bd = fld[cn], bx = 0, by = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue; const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const n = f * FL + ny * W + nx; if (fld[n] === 65535) continue;
    if(mode!=='fly'&&(stairSideBlock(cy*W+cx,ny*W+nx)||(dx&&dy&&(isStair[cy*W+cx]||isStair[ny*W+nx]))))continue;
    if (dx && dy && (fld[f * FL + cy * W + nx] === 65535 || fld[f * FL + ny * W + cx] === 65535)) continue;
    const d = fld[n] + (dx && dy ? 0.4 : 0); if (d < bd) { bd = d; best = n; bx = nx; by = ny; }
  }
  const other = (1 - f) * FL + cy * W + cx;
  if ((mode === 'fly' || isStairMid[cy * W + cx]) && fld[other] < bd && fld[other] < fld[cn]) { const k = stairAt(e.x, e.y); if (k >= 0 && mode === 'walk') { const p=stairNext(k,f===0); steer(w,e,p.x,p.y,speed,dt); return false; } changeFloor(w, e, 1 - f); return false; }
  if (best < 0) return steer(w, e, tg.x, tg.y, speed, dt);
  if(mode==='walk'&&(isStair[cy*W+cx]||isStair[by*W+bx])){
    // Centre the entry before advancing; diagonal approaches otherwise catch the capsule on the rail.
    const alignX=by!==cy&&Math.abs(e.x-cx-.5)>.035,alignY=bx!==cx&&Math.abs(e.y-cy-.5)>.035;
    if(alignX||alignY){steer(w,e,alignX?cx+.5:e.x,alignY?cy+.5:e.y,speed,dt);return false;}
  }
  steer(w, e, bx + 0.5, by + 0.5, speed, dt); return false;
}
const pathLen = (w, a, b, mode = 'walk') => { if (!a || !b) return 999; const fld = getField(nodeOf(b), mode, null, 0); const v = fld[nodeOf(a)]; return v === 65535 ? 999 : v; };
// Línea de vista en un piso
function los(f, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, n = Math.ceil(Math.hypot(dx, dy) * 3);
  for (let i = 1; i < n; i++) { const t = i / n; if (sightBlockT(tileAt(f, ax + dx * t, ay + dy * t))) return false; }
  return true;
}
const sees = (a,b,R,world) => a.f===b.f&&d2(a,b)<=R&&los(a.f,a.x,a.y,b.x,b.y,1.55+(elevOf(a)-a.f)*3.8,1.55+(elevOf(b)-b.f)*3.8,world);

// ---------- Las ánimas ----------
const BASE = {
  id: 'pena', n: 'Ánima en pena', ev: ['CE', 'SU', 'LU'], presMax: 30, recharge: 2, speed: 2.2, huntStart: 2.4, accel: 0.15, top: 4.0,
  near: 5, far: 14, farMin: 0, hear: 12, huntCd: 25, freq: { q: 1, e: 1, f: 1, c: 1, v: 1 }, chillDmg: 10, fly: false,
  hunt: { type: 'avg', thr: 50 }, visibleHunt: () => true, invisible: false,
  passive: null, special: null,
  sello: { n: 'Rezo lejano', parecido: 'Susurro' }, espanto: { n: 'Penitencia', d: 'Todos pierden 15 de cordura; caza de inmediato.' },
  vision(w, g, inv) { return { near: this.near, far: this.far, farMin: this.farMin }; },
  speedNow(w, g) { return this.speed; }, rechargeNow() { return this.recharge; },
};
const mk = o => Object.assign({}, BASE, o, { freq: Object.assign({}, BASE.freq, o.freq || {}) });
const alive = w => w.invs.filter(i => i.alive && !i.escaped);
const exposedInvs = w => alive(w).filter(i => i.hidden < 0);
const isolated = (w, inv) => alive(w).length > 1 && !alive(w).some(o => o !== inv && o.f === inv.f && d2(o, inv) < 6);
function nearestIn(w, g, R, filt) { let b = null, bd = R; for (const i of exposedInvs(w)) { if (i.f !== g.f || (filt && !filt(i))) continue; const d = d2(i, g); if (d <= bd) { bd = d; b = i; } } return b; }

const GHOSTS = [
  mk({}),
  mk({ id: 'nachito', n: 'Nachito', ev: ['SU', 'OB', 'ES'], presMax: 35, speed: 2.6, huntStart: 2.8, accel: 0.06, top: 3.4, near: 3, far: 8, hear: 14,
    hunt: { type: 'avg', thr: 40 }, freq: { e: 0, c: 2 }, darkFear: true,
    passive: { n: 'Pavor a la oscuridad', d: 'Solo entra a un cuarto oscuro encendiendo antes su luz; cazando se detiene en la puerta.' },
    special: { n: 'Juguetes', cd: 25, d: 'Un juguete suena en otro cuarto del mismo piso (señuelo).',
      use(w, g) { const rs = ROOM_LIST.filter(r => r.f === g.f && r.r !== roomOf(g) && ROOM_CENTER[r.f][r.r]); const r = pick(rs); const p = ROOM_CENTER[r.f][r.r]; w.noise(p, 20, 'juguete'); w.sub(p, 'Suena un juguete de cuerda a lo lejos', 20); return true; },
      bot(w, g) { return Math.random() < 0.2; } },
    sello: { n: 'Una luz se enciende sola y se oye una risa de niño', parecido: 'EMF 5' },
    espanto: { n: 'Que no se apague', d: 'Enciende todas las luces y corre a su tope desde el inicio.', use(w, g) { w.lights.forEach(l => l.fill(1)); w.lights[1][RID[1].vacio] = 0; g.seenT = 99; } } }),
  mk({ id: 'llorona', n: 'La Llorona', ev: ['BC', 'SU', 'ES'], near: 4, far: 18, hear: 16, freq: { v: 2 },
    passive: { n: 'Junto al agua', d: 'Su Escalofrío quita 50 % más en Cocina, Baño, Baño alto y Patio.' },
    chillMult(w, g) { return WATER_ROOMS[g.f].includes(roomId(g)) ? 1.5 : 1; },
    special: { n: 'Llanto', cd: 30, d: '−8 de cordura a quien esté a 8 m; la delata.',
      use(w, g) { exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 8).forEach(i => w.haunt(i, 8)); g.revealUntil = w.t + 1.5; w.sub(g, '¡Ay, mis hijos!', 20); w.fxAdd('llanto', g); return true; },
      bot(w, g) { const n = exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 8); return n.length >= 2 || n.some(i => i.san < 55); } },
    sello: { n: 'Charcos que van hacia el agua', parecido: 'Huellas de ceniza' }, selloEvery: 45,
    espanto: { n: 'Llanto eterno', d: 'Todos van 30 % más lento durante 6 s.', use(w) { alive(w).forEach(i => (i.slowUntil = w.t + 6)); } } }),
  mk({ id: 'chaneque', n: 'Chaneque', ev: ['CE', 'SU', 'OB'], presMax: 40, speed: 2.6, huntStart: 2.8, top: 4.0, near: 3, far: 10, hear: 20,
    hunt: { type: 'avg', thr: 45 }, freq: { c: 2, e: 0.5 },
    passive: { n: 'Travieso', d: 'Roba un objeto al pasar junto a alguien y lo esconde en otro cuarto (cada 20 s).' },
    special: { n: 'Esconderse en el monte', cd: 25, d: 'Cuesta 6 s de presencia: aparece en el cuarto de un investigador.',
      use(w, g) { if (g.hunt || g.pres < 8) return false; const v = pick(exposedInvs(w)); if (!v) return false; const r = roomOf(v); if (r < 0) return false;
        let p = randomIn(v.f, r); for (let k = 0; k < 8 && d2(p, v) < 3; k++) p = randomIn(v.f, r); g.f = p.f; g.x = p.x; g.y = p.y; g.pres -= 6; return true; },
      bot(w, g) { return !g.hunt && g.pres > 18 && !exposedInvs(w).some(i => i.f === g.f && d2(i, g) < 10); } },
    sello: { n: 'Lo robado aparece en otro cuarto, con una risita', parecido: 'Mover un objeto' },
    espanto: { n: 'Juego del monte', d: 'Cada investigador aparece en un cuarto al azar de su piso y suelta sus objetos.',
      use(w) { alive(w).forEach(i => { i.slots.forEach((it, k) => { if (it) { dropItem(w, i, k); } }); const rs = ROOM_LIST.filter(r => r.f === i.f && !NO_HOME[r.f].includes(ROOMS[r.f][r.r].id)); const p = randomIn(i.f, pick(rs).r); i.x = p.x; i.y = p.y; i.hidden = -1; }); } } }),
  mk({ id: 'matla', n: 'Matlacíhuatl', ev: ['BC', 'CE', 'ES'], presMax: 22, speed: 2.3, near: 2, far: 20, farMin: 6, hear: 10,
    hunt: { type: 'isolated', thr: 50 }, freq: { v: 1.5, f: 0.5 },
    passive: { n: 'Caza al que anda solo', d: 'Doble efecto contra quien no tiene a nadie a 6 m. Ciega entre 2 y 6 m.' },
    haunteMult(w, g, inv) { return isolated(w, inv) ? 2 : 1; },
    special: { n: 'La red', cd: 25, inHunt: true, d: 'Inmoviliza 3 s al investigador más cercano a 3 m.',
      use(w, g) { const v = nearestIn(w, g, 3); if (!v) return false; v.stunUntil = w.t + 3; w.sub(v, 'Una red invisible te atrapa', 8); return true; },
      bot(w, g) { const v = nearestIn(w, g, 3); return !!v && (g.hunt || isolated(w, v)); } },
    sello: { n: 'Dice el nombre de quien anda solo', parecido: 'Susurro' },
    espanto: { n: 'La red', d: 'Quien vaya solo queda atrapado 5 s.', use(w) { alive(w).filter(i => isolated(w, i)).forEach(i => (i.stunUntil = w.t + 5)); } } }),
  mk({ id: 'cucuy', n: 'El Cucuy', ev: ['CE', 'OB', 'ES'], freq: { e: 2 },
    vision(w, g, inv) { const lit = litAt(w, inv); return lit ? { near: 3, far: 4, farMin: 0 } : { near: 6, far: 16, farMin: 0 }; },
    visibleHunt(w, g, viewer) { return litAt(w, g) || (viewer && d2(viewer, g) <= 1.5); },
    passive: { n: 'Desde la penumbra', d: 'Cazando no se ve a oscuras; saca de un escondite a quien esté dentro si se queda 3 s junto a él.' },
    special: { n: 'Apagón', cd: 20, d: 'Apaga los cuartos a 10 m.',
      use(w, g) { let n = 0; ROOMS[g.f].forEach((r, i) => { const c = ROOM_CENTER[g.f][i]; if (c && w.lights[g.f][i] && d2(c, g) <= 10 && !(g.f === 0 && r.id === 'patio')) { w.lights[g.f][i] = 0; n++; } }); if (n) { w.sub(g, 'Se va la luz en varios cuartos', 25); w.ev('lightsoff'); } return n > 0; },
      bot(w, g) { return exposedInvs(w).some(i => i.f === g.f && litAt(w, i) && d2(i, g) < 12); } },
    sello: { n: 'Un escondite se abre solo y se ven ojos', parecido: 'Portazo' },
    espanto: { n: 'Desde la penumbra', d: 'Apagón en toda la casa y saca a todos de los escondites.', use(w) { w.lights.forEach(l => l.fill(0)); w.lights[0][RID[0].patio] = 1; alive(w).forEach(i => (i.hidden = -1)); } } }),
  mk({ id: 'guardian', n: 'El Guardián del Entierro', ev: ['BC', 'SU', 'OB'], presMax: 45, top: 3.6, freq: { f: 0.5 },
    hunt: { type: 'guardian' },
    vision(w, g) { return inHome(g) ? { near: 8, far: 20, farMin: 0 } : { near: 3, far: 6, farMin: 0 }; },
    speedNow(w, g) { return inHome(g) ? 2.6 : 1.8; }, rechargeNow() { return 4; },
    passive: { n: 'Celoso de su oro', d: 'Lento fuera de su cuarto, rápido dentro; recarga al doble; su cuarto quita 0,4 por segundo.' },
    special: { n: 'Flama azul', cd: 25, d: '−6 y −0,3/s por 10 s al de menos cordura a 6 m.',
      use(w, g) { const v = exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 6).sort((a, b) => a.san - b.san)[0]; if (!v) return false; w.haunt(v, 6); v.curseUntil = w.t + 10; w.fxAdd('flama', v); return true; },
      bot(w, g) { return !!nearestIn(w, g, 6); } },
    sello: { n: 'Suenan monedas y sale una flamita azul del piso', parecido: 'Velas azules' },
    espanto: { n: 'Maldición del entierro', d: 'Cierra la puerta del Zaguán 15 s.', use(w) { w.exitBlockedUntil = w.t + 15; } } }),
  mk({ id: 'nahual', n: 'Nahual', ev: ['CE', 'OB', 'AZ'], huntStart: 2.6, accel: 0.25, top: 4.5, near: 6, far: 8, hear: 25, hunt: { type: 'avg', thr: 45 }, freq: { v: 0, q: 1.5 },
    speedNow(w, g) { return w.t < (g.transUntil || 0) ? 3.1 : 2.2; },
    passive: { n: 'Bestia', d: 'No habla; oye y huele de lejos; acelera más rápido que nadie.' },
    special: { n: 'Transformarse', cd: 45, d: '8 s a +40 % de velocidad, fuera de cacería.', use(w, g) { if (g.hunt) return false; g.transUntil = w.t + 8; emitSello(w, g, 'gruñido'); return true; },
      bot(w, g) { return !!nearestIn(w, g, 14) && !g.hunt; } },
    sello: { n: 'Gruñido y pisadas de animal', parecido: 'Pasos de cacería' },
    espanto: { n: 'La bestia', d: 'Caza a su velocidad tope desde el primer segundo.', use(w, g) { g.seenT = 99; } } }),
  mk({ id: 'demonio', n: 'Demonio', ev: ['SU', 'LU', 'AZ'], presMax: 26, huntCd: 15, hunt: { type: 'avg', thr: 60 }, freq: { q: 1.5 }, rosaryBlind: 2,
    passive: { n: 'Sin miedo al Rosario', d: 'El Rosario solo lo ciega 2 s.' },
    special: { n: 'Infierno', cd: 30, d: '−6 a todos los de su piso, sin delatarlo.', use(w, g) { exposedInvs(w).filter(i => i.f === g.f).forEach(i => w.haunt(i, 6)); w.sub(g, 'El aire se vuelve irrespirable', 30); return true; },
      bot(w, g) { return exposedInvs(w).filter(i => i.f === g.f).length >= 2; } },
    sello: { n: 'Las cuentas de un rosario se rompen', parecido: 'Mover un objeto' },
    espanto: { n: 'Infierno', d: 'El Rosario y el Copal no sirven durante la huida.', use(w) { w.noHoly = true; } } }),
  mk({ id: 'planchada', n: 'La Planchada', ev: ['OB', 'LU', 'ES'], speed: 2.0, huntStart: 2.2, top: 3.6, hear: 8, hunt: { type: 'healthiest', thr: 60 }, freq: { f: 0, c: 0.5 }, noKillBelow: 25,
    passive: { n: 'Cuida a los enfermos', d: 'Nunca mata a quien tiene 25 o menos; a su lado se recupera 1 por segundo.' },
    special: { n: 'Ronda', cd: 30, d: 'Aparece junto a quien tenga más cordura.',
      use(w, g) { if (g.hunt) return false; const v = exposedInvs(w).sort((a, b) => b.san - a.san)[0]; if (!v || v.f !== g.f && false) return false; const r = roomOf(v); if (r < 0) return false; let p = randomIn(v.f, r); for (let k = 0; k < 8 && d2(p, v) < 3; k++) p = randomIn(v.f, r); g.f = p.f; g.x = p.x; g.y = p.y; return true; },
      bot(w, g) { return Math.random() < 0.3; } },
    sello: { n: 'Una cama se tiende sola y huele a almidón', parecido: 'Mover un objeto' },
    espanto: { n: 'Ronda nocturna', d: 'Persigue al más sano y lo ve a través de los muros.', use(w, g) { g.xray = true; } } }),
  mk({ id: 'chocarrero', n: 'Espíritu Chocarrero', ev: ['SU', 'OB', 'LU'], speed: 2.4, huntStart: 2.4, top: 3.6, hunt: { type: 'avg', thr: 45 }, freq: { f: 2, c: 3, e: 1.5, q: 0.5 }, chillDmg: 6,
    passive: { n: 'Poltergeist', d: 'Muchos fenómenos, pero su Escalofrío quita solo 6.' },
    special: { n: 'Tornado de objetos', cd: 25, d: '−4 por objeto (hasta −12) a quienes estén en su cuarto.',
      use(w, g) { const r = roomOf(g); const v = exposedInvs(w).filter(i => i.f === g.f && roomOf(i) === r); v.forEach(i => w.haunt(i, 12)); ghostEvent(w, g, 'move'); ghostEvent(w, g, 'move'); w.fxAdd('tornado', g); w.sub(g, 'Los objetos vuelan por el cuarto', 15); return v.length > 0; },
      bot(w, g) { const r = roomOf(g); return exposedInvs(w).some(i => i.f === g.f && roomOf(i) === r); } },
    sello: { n: 'Tres o más objetos se mueven a la vez', parecido: 'Mover un objeto' },
    espanto: { n: 'Tornado', d: 'Traba todas las puertas del piso del ánima durante 10 s.', use(w, g) { w.lockDoorsFloor = g.f; w.lockDoorsUntil = w.t + 10; rebuildMasks(w); } } }),
  mk({ id: 'tlahuel', n: 'Tlahuelpuchi', ev: ['LU', 'ES', 'AZ'], huntStart: 2.6, near: 4, far: 16, hunt: { type: 'weakest', thr: 35 }, freq: { e: 1.5 }, fly: true,
    passive: { n: 'Vuela', d: 'Cambia de piso por cualquier punto, sin escaleras.' },
    special: { n: 'Vuelo', cd: 15, inHunt: true, d: 'Sube o baja de piso al instante.',
      use(w, g) { const nf = 1 - g.f; if (!walkableT(tileAt(nf, g.x, g.y))) return false; changeFloor(w, g, nf); return true; },
      bot(w, g) { const t = w.invs.find(i => i.alive && !i.escaped && i.f !== g.f); return !!t && Math.random() < 0.4; } },
    sello: { n: 'Aleteo y plumas que caen del techo', parecido: 'Viento' },
    espanto: { n: 'Vuelo de sangre', d: 'Aparece junto al más débil.', use(w, g) { const v = alive(w).sort((a, b) => a.san - b.san)[0]; if (v) { g.f = v.f; g.x = v.x + 1; g.y = v.y; if (collides(w, g, g.x, g.y)) { g.x = v.x; g.y = v.y; } } } } }),
  mk({ id: 'malaire', n: 'El Mal Aire', ev: ['BC', 'LU', 'ES'], speed: 2.0, huntStart: 2.2, top: 3.2, near: 6, far: 6, hear: 10, hunt: { type: 'avg', thr: 45 }, freq: { q: 2 }, invisible: true,
    passive: { n: 'Invisible', d: 'Nunca se ve, ni cazando; solo vaho.' },
    special: { n: 'Soplo', cd: 20, d: 'Apaga linternas 5 s a 6 m.', use(w, g) { const v = exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 6); v.forEach(i => (i.flashOffUntil = w.t + 5)); if (v.length) w.sub(g, 'Un soplo helado apaga las linternas', 10); return v.length > 0; },
      bot(w, g) { return !!nearestIn(w, g, 6); } },
    sello: { n: 'Escarcha que crece en ventanas y espejos', parecido: 'Bajo cero' }, selloEvery: 40,
    espanto: { n: 'Soplo del mal viento', d: 'Apaga todas las linternas 10 s.', use(w) { alive(w).forEach(i => (i.flashOffUntil = w.t + 10)); } } }),
];
const GT = {}; GHOSTS.forEach(g => (GT[g.id] = g));

// ---------- Mundo ----------
const NAMES = [['Inés', '#c0396b', 'ines'], ['Rafael', '#6a9a4a', 'rafael'], ['Mateo', '#9a2a3a', 'mateo'], ['Tomás', '#2a8a8a', 'tomas'], ['Amalia', '#d8b030', 'amalia'],
  ['Jhonnatan', '#5b8bd9', 'vigia'], ['Ángel', '#e04a5a', 'improvisador'], ['Robert', '#e0902a', 'tecnico'], ['Fermín', '#3aa0a0', 'detective'], ['Alex', '#7ac08a', 'curandero'], ['Alex', '#c95fb5', 'sensitivo'], ['Jenny', '#e8c840', 'devota'], ['Jorge', '#a08a6a', 'guardaespaldas']];
const LOOKS = ['velo', 'blanca', 'sombra', 'nino', 'anciano', 'humo'];
const LOOK_NAMES = { velo: 'una presencia encapuchada con rebozo de papel picado', blanca: 'una mujer de blanco', sombra: 'una sombra alta de brazos largos', nino: 'un niño en camisón', anciano: 'un anciano de sarape y sombrero', humo: 'una nube de humo con ojos' };
const inHome = g => g.f === g.home.f && roomOf(g) === g.home.r;
function litAt(w, e) {
  const r = roomOf(e); if (r >= 0 && w.lights[e.f][r]) return true;
  return w.items.some(it => it.kind === 'vela' && it.lit && it.f === e.f && d2(it, e) <= CFG.vela.r);
}
function rebuildMasks(w) {
  w.ghostMask.fill(0); w.invMask.fill(0);
  w.doors.forEach(d => { if (w.t < d.rudaUntil) { d.tiles.forEach(([x, y]) => (w.ghostMask[d.f * FL + y * W + x] = 1)); const rr = d.rudaRoom; if (rr && rr.r >= 0 && !isHall(rr.f, rr.r)) for (let n = 0; n < FL; n++) if (roomGrid[rr.f][n] === rr.r) w.ghostMask[rr.f * FL + n] = 1; } });
  w.clouds.forEach(c => { for (let y = Math.floor(c.y - c.r); y <= c.y + c.r; y++) for (let x = Math.floor(c.x - c.r); x <= c.x + c.r; x++) if (x >= 0 && y >= 0 && x < W && y < H && Math.hypot(x + 0.5 - c.x, y + 0.5 - c.y) <= c.r) w.ghostMask[c.f * FL + y * W + x] = 1; });
  if (w.t < w.lockDoorsUntil) w.doors.filter(d => d.f === w.lockDoorsFloor).forEach(d => d.tiles.forEach(([x, y]) => (w.invMask[d.f * FL + y * W + x] = 1)));
  w.ghostMaskVer++; w.invMaskVer++;
}
function chooseSpots(){return chooseLayoutSpots();}
const ITEM_PLACES={te:[[0,'cocina'],[0,'comedor'],[0,'despensa'],[0,'reposteria']],rosario:[[0,'capilla'],[1,'abuelo'],[1,'recp'],[1,'nana']],ruda:[[0,'botica'],[0,'cocina'],[1,'abuelo']],copal:[[0,'capilla'],[0,'botica'],[1,'desvan']],vela:[[0,'capilla'],[1,'salon'],[0,'comedor']],ceniza:[[0,'cocina'],[0,'capilla']],cruz:[[0,'capilla'],[1,'abuelo']],pan:[[0,'comedor'],[0,'cocina']],limpia:[[0,'botica'],[0,'cocina']],foco:[[0,'porteria'],[0,'despacho'],[0,'aperos']]};
// Un objeto maldito por noche, siempre en su lugar (como en las cartas: cada uno tiene su historia en la casa)
const CURSED_PLACES = { tarot:[0,'botica'],tablilla:[1,'desvan'],espejoplata:[1,'hija'],mano:[0,'despacho'],muneca:[1,'recn'],pentagrama:[0,'capilla'],radio:[0,'despacho'] };
const TAROT = [['sol', 1], ['luna', 1], ['ermitano', 1], ['muerte', 1], ['rueda', 2], ['diablo', 2], ['torre', 2]];
const TAROT_N = { sol: 'El Sol', luna: 'La Luna', ermitano: 'El Ermitaño', muerte: 'La Muerte', rueda: 'La Rueda de la Fortuna', diablo: 'El Diablo', torre: 'La Torre' };
let ITEM_ID = 1;
const LOOSE_KINDS = ['jarron', 'plato', 'vela', 'libro', 'taza', 'figura', 'cuadro'];
const ANOM_KINDS = ['muneca', 'calavera', 'foto', 'silla'];
const LOOSE_N = { muneca: 'una muñeca', calavera: 'una calavera de azúcar', foto: 'una foto', silla: 'una silla', jarron: 'un jarrón', plato: 'un plato', vela: 'una vela', libro: 'un libro', taza: 'una taza', figura: 'una figura de barro', cuadro: 'un cuadro' };
function newItem(kind, p) { const it = { id: ITEM_ID++, kind, f: p.f, x: p.x, y: p.y, dir: 0, lit: false, litUntil: 0, rec: false, photo: false, emfLvl: 0, emfUntil: 0, markUntil: 0, redUntil: 0, gasAcc: 0, cd: 0 };
  if (kind === 'cruz') it.charges = CFG.cruz.charges; if (kind === 'tarot') it.cards = 10; if (kind === 'tablilla') it.q = 0; if (kind === 'mano') it.wishes = 2;
  if (kind === 'muneca') { it.pins = 10; it.heart = (Math.random() * 10) | 0; } if (kind === 'pentagrama') it.candles = 0; if (kind === 'pan') it.eat = 0; return it; }

function newWorld(opt) {
  opt = Object.assign({ role: 'inv', nInv: 3, ghost: 'random', night: 600, equip: 'normal', diff: 'normal', cursed: 'random' }, opt);
  const n = opt.nInv;
  const w = { t: 0, opt, invs: [], items: [], doors: [], clouds: [], fx: [], ashes: [], noCopalUntil: 0, pendingCursed: null, subs: [], log: [], events: [], noises: [],
    lights: [new Uint8Array(ROOMS[0].length), new Uint8Array(ROOMS[1].length)], conf: {}, discard: {}, selloSeen: false,
    phase: 'night', over: null, huida: null, pendingDawn: false, team: { home: null, visited: new Set(), hinted: false, toolsPlaced: false },
    ghostMask: new Uint8Array(NN), invMask: new Uint8Array(NN), ghostMaskVer: 1, invMaskVer: 1, lockDoorsUntil: 0, lockDoorsFloor: 0, exitBlockedUntil: 0, noHoly: false,
    stats: { deaths: 0, hunts: 0, rosaries: 0, conf: 0 }, spotsActive: chooseSpots(),
    rastro: [new Float32Array(ROOMS[0].length), new Float32Array(ROOMS[1].length)], flips: [ROOMS[0].map(() => []), ROOMS[1].map(() => [])], burnt: [new Uint8Array(ROOMS[0].length), new Uint8Array(ROOMS[1].length)], fuse: [true, true], obs: {}, loose: [], cold: [[], []], anoms: [], analogNext: rnd(CFG.analog.gap[0], CFG.analog.gap[1]), lines: [] };
  w.force = (CFG.force[n] || 1) * (CFG.equipPreset[opt.equip] || CFG.equipPreset.normal).force;
  w.lights[0][RID[0].zaguan] = 1; w.lights[0][RID[0].patio] = 1;
  { // ruleta de la noche: altar y caja de fusibles en cuartos al azar
    const pool = HOME_CHOICES.filter(h => !(h.f === 0 && ['zaguan'].includes(ROOMS[0][h.r].id)));
    const ar=pick(pool),surface=SURFACES[ar.f][ar.r][0];w.altarSurface={f:ar.f,x:surface[0]+.5,y:surface[1]+.5,h:surface[2]};const around=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>walkableT(tileAt(ar.f,surface[0]+dx,surface[1]+dy)));Object.assign(ALTAR_POS,{f:ar.f,x:surface[0]+.5+around[0],y:surface[1]+.5+around[1]});w.altarRoom=ar;
    const fr = pick(pool.filter(h => !(h.f === ar.f && h.r === ar.r))); const nearDoorT = (x, y) => DOOR_DEFS_BY_FLOOR[fr.f].some(([o, dx, dy]) => Math.abs(x - (o === 'V' ? dx : dx + 0.5)) <= (o === 'V' ? 1 : 1.5) && Math.abs(y - (o === 'V' ? dy + 0.5 : dy)) <= (o === 'V' ? 1.5 : 1));
    const ft = shuffle(ROOM_TILES[fr.f][fr.r].slice()).find(([x, y]) => !nearDoorT(x, y) && !isStair[y * W + x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => grids[fr.f][(y + dy) * W + x + dx] === T.WALL)) || ROOM_TILES[fr.f][fr.r][0];
    const wd = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) => grids[fr.f][(ft[1] + dy) * W + ft[0] + dx] === T.WALL) || [0, -1];
    FUSE.f = fr.f; FUSE.x = ft[0] + 0.5 + wd[0] * 0.38; FUSE.y = ft[1] + 0.5 + wd[1] * 0.38; FUSE.face = Math.atan2(-wd[1], -wd[0]); w.fuseRoom = fr;
  }
  NDALayout.doors.forEach(def=>{if(def.kind==='arco abierto')return;const[a,b,c,e]=def.rect,o=c-a===1?'V':'H',tiles=[];for(let y=b;y<e;y++)for(let x=a;x<c;x++)tiles.push([x,y]);w.doors.push({f:def.floor,o,tiles,x:(a+c)/2,y:(b+e)/2,angle:0,touchedAt:-99,glowUntil:0,rudaUntil:0,rosario:false,anim:0,id:def.id,arch:def.kind==='arco abierto',ext:def.kind==='portón'});});
  w.doorTile = new Map(); w.doors.forEach(d => d.tiles.forEach(([x, y]) => w.doorTile.set(d.f * FL + y * W + x, d)));
  // Helpers del mundo
  w.say = (msg, vis = 'a') => { if (vis === 'a' && /: «/.test(msg) && w.lines) { w.lines.push(msg); if (w.lines.length > 20) w.lines.shift(); } w.log.push({ t: w.t, msg, vis, who: vis === 'i' && w.actor ? w.actor.id : undefined }); if (w.log.length > 120) w.log.shift(); };
  w.ev = (type, data) => w.events.push(Object.assign({ type }, data || {}));
  w.noise = (p, r, kind) => { w.noises.push({ f: p.f, x: p.x, y: p.y, r, kind, t: w.t }); w.ev('noise', { kind, f: p.f, x: p.x, y: p.y }); };
  w.sub = (p, text, r) => w.subs.push({ f: p.f, x: p.x, y: p.y, text, r: r || 12, t: w.t });
  ROOMS.forEach((rs, f) => rs.forEach((rm, r) => { if (!ROOM_TILES[f][r].length) return; w.cold[f][r] = randomIn(f, r); if (isHall(f, r) || ['vacio', 'zaguan', 'afuera'].includes(rm.id)) return; const n = SURFACES[f][r].length ? 2 + (Math.random() < 0.5 ? 1 : 0) : 0; for (let k = 0; k < n; k++) { const p = onFurniture(f, r); w.loose.push({ id: w.loose.length, kind: pick(LOOSE_KINDS), f, x: p.x, y: p.y, h: p.h, rot: Math.random() * 6.28, flyT: -99, from: null }); } }));
  w.fxAdd = (kind, p, extra) => w.fx.push(Object.assign({ kind, f: p.f, x: p.x, y: p.y, t: w.t, ttl: 30 }, extra || {}));
  w.haunt = (i, amt) => { if (!i.alive) return; const s0 = i.san; i.san = Math.max(0, i.san - amt * w.force * (w.g.def.haunteMult ? w.g.def.haunteMult(w, w.g, i) : 1)); const g = w.g; if (g && w.phase === 'night' && g.state === 'libre') g.pres = Math.min(g.def.presMax, g.pres + (s0 - i.san) / Math.max(1, w.force) * CFG.hunger.feed * 1.5); };
  // Investigadores
  const human = opt.role === 'inv';
  const HUM = opt.humans || null; // en línea: [{name, char, peer}] ocupan los primeros lugares
  for (let k = 0; k < n; k++) {
    if (k === 0) { const first = NAMES.find(x => x[2] === opt.char) || NAMES[0]; const rest = shuffle(NAMES.filter(x => x !== first && x[0] !== first[0])); w.roster = []; for (const x of rest) if (!w.roster.some(y => y[0] === x[0])) w.roster.push(x); w.roster.unshift(first); }
    const order = w.roster;
    let [name, color, char] = human ? order[k] : order[k + 1];
    if (HUM && HUM[k]) { const ch = NAMES.find(x => x[2] === HUM[k].char) || order[k]; color = ch[1]; char = ch[2]; name = HUM[k].name || ch[0]; }
    w.invs.push({ kind: 'inv', id: k, name, color, char, bot: HUM ? !HUM[k] : !(human && k === 0), peer: HUM && HUM[k] ? HUM[k].peer : null, pe: 0, f: 0, x: 19.5 + k * 1.2, y: 35.5, r: 0.3, face: -Math.PI / 2,
      alive: true, escaped: false, san: 100, stam: 100, tired: false, slots: [null, null, null, null], hand: 0, flash: true, flashOffUntil: 0,
      hidden: -1, stunUntil: 0, curseUntil: 0, slowUntil: 0, reading: null, spirit: { cd: 0 }, ai: { state: 'gear', goal: null, think: 0, wantTools: [] } });
  }
  // Ánima
  const def = opt.ghost === 'random' || !GT[opt.ghost] ? pick(GHOSTS) : GT[opt.ghost];
  const home = pick(HOME_CHOICES), hc = ROOM_CENTER[home.f][home.r];
  w.g = { kind: 'ghost', def, home, f: home.f, x: hc.x, y: hc.y, r: 0.32, face: 0, pres: def.presMax, state: 'despertando', hunt: null, huntReady: 0,
    ready: { q: 0, e: 0, f: 0, c: 0, v: 0, r: 0, n: 0, m: 0, g: 0, k: 0, j: 0, p: 0, y: 0 }, interfUntil: 0, mudanzas: CFG.mudanzas, stunUntil: 0, blindUntil: 0, revealUntil: 0, slowUntil: 0, returning: false, seenT: 0, lastSeenAt: -99,
    outsideT: 0, phenoCount: 0, exposed: false, espantoUsed: false, perceived: new Map(), heard: [], bot: opt.role !== 'ghost', occ: {}, selloCd: {}, ai: { target: null, until: 0, wander: null, nextAct: CFG.grace + rnd(4, 10), think: 0 }, look: pick(LOOKS) };
  // Equipo: herramientas en el maletín; consumibles en la casa
  TOOLS.forEach((k, i) => w.items.push(Object.assign(newItem(k, { f: 0, x: 20.3 + (i % 4) * 0.95, y: 32.35 + Math.floor(i / 4) * 0.35 }), { h: 0.78 })));
  const mult = (CFG.equipPreset[opt.equip] || CFG.equipPreset.normal).mult;
  Object.entries(CFG.equip).forEach(([k, arr]) => { const cnt = Math.max(1, Math.round(arr[n - 1] * mult)); const places = ITEM_PLACES[k];
    for (let j = 0; j < cnt; j++) { const [f, rid] = places[j % places.length]; const p = onFurniture(f, RID[f][rid]); w.items.push(Object.assign(newItem(k, p), { h: p.h })); } });
  // Objeto maldito de la noche
  const ck = opt.cursed === 'random' ? pick(CURSED) : CURSED.includes(opt.cursed) ? opt.cursed : null;
  if (ck) { const [f, rid] = CURSED_PLACES[ck]; const cp = onFurniture(f, RID[f][rid]); const it = Object.assign(newItem(ck, cp), { h: cp.h }); w.items.push(it); w.cursed = ck; }
  // Bots: reparto de herramientas
  const bots = w.invs.filter(i => i.bot); const tl = shuffle(TOOLS.slice());
  bots.forEach((b, i) => { b.ai.wantTools = tl.filter((_, j) => j % bots.length === i).slice(0, 3); });
  w.say(`Es la noche del 1 de noviembre. Entran a la casona${human ? '' : ''}.`, 'a');
  if (opt.role === 'ghost') w.say(`Esta noche te ven como ${LOOK_NAMES[w.g.look]}.`, 'g');
  if (opt.role === 'ghost') w.say(`Eres ${def.n}. Tu guarida: ${ROOMS[home.f][home.r].n} (${home.f ? 'planta alta' : 'planta baja'}). Tu presencia baja siempre: aliméntate asustando o descansa en tu guarida.`, 'g');
  return w;
}

// ---------- Deducción ----------
// w.conf = la libreta del equipo (la llenan las personas; los bots solo si la libreta automática está activa)
// w.botConf = lo que los bots vieron con sus propios ojos (lo usan para decidir, no se marca solo)
const pruebas = (w, K) => Object.keys(K || w.conf).length;
const botK = w => Object.assign({}, w.botConf || {}, w.conf);
function candidates(w, useDiscards, K) {
  return GHOSTS.filter(G => Object.keys(K || w.conf).every(k => G.ev.includes(k)) && (!useDiscards || !Object.keys(w.discard).some(k => w.discard[k] && G.ev.includes(k))));
}
function confirmEv(w, k, by, how) {
  if (!w.g.def.ev.includes(k)) return; w.botConf = w.botConf || {}; const auto = w.opt.libreta === 'auto' || !w.invs.some(i => !i.bot);
  if (w.botConf[k] && (w.conf[k] || !auto)) return; const first = !w.botConf[k]; w.botConf[k] = { by: by ? by.name : '?', t: w.t, how }; if (first) w.stats.conf++;
  if (auto) { if (w.conf[k]) return; w.conf[k] = w.botConf[k]; w.say(`${by ? by.name : 'Alguien'} anota en la libreta: ${EV[k].n} (${how}).`, 'a'); w.ev('mark', { k }); }
  else w.say(`${by ? by.name : 'Alguien'}: «¡Vi ${EV[k].n.toLowerCase()}! (${how})». Tú decides si lo anotas.`, 'a');
}
// una lectura positiva real: los bots la anotan; la persona la ve en su aparato y decide
function observe(w, k, by, how) { if (!by || !by.alive || !w.g.def.ev.includes(k)) return; w.obs[k] = w.obs[k] || w.t; if (by.bot) confirmEv(w, k, by, how); }
function witnessOf(w, p, R) { return alive(w).filter(i => i.hidden < 0 && sees(i, p, R,w)).sort((a, b) => d2(a, p) - d2(b, p))[0]; }
// temperatura en un punto: baja con el rastro; bajo cero solo con la evidencia y en el punto frío
function tempAt(w, f, x, y) {
  const r = roomAt(f, x, y); if (r < 0) return 18; const ras = w.rastro[f][r], c = w.cold[f][r], g = w.g;
  const dc = c ? Math.hypot(c.x - x, c.y - y) : 9, k = clamp(1.15 - dc / 5, 0.35, 1);
  if (g.def.ev.includes('BC') && ras >= 60 && dc <= 2.5) return -0.4 - (ras - 60) * 0.065;
  return Math.max(g.def.ev.includes('BC') ? -0.2 : 1, 18.5 - 0.165 * ras * k);
}
function selloOK(w) { return w.t >= CFG.selloStart && w.t >= (w.nextSello || 0); }
function emitSello(w, g, kind) {
  if (!selloOK(w)) return false;
  w.nextSello = w.t + CFG.selloGap;
  const p = { f: g.f, x: g.x, y: g.y };
  const sound = ['rezo', 'risa', 'nombre', 'monedas', 'gruñido', 'rosarioroto', 'aleteo'].includes(kind);
  const text = { rezo: 'Se oye un rosario rezado en voz baja', risa: 'Una luz se enciende sola… y se oye una risa de niño', charcos: 'Charcos de agua en el piso, hacia el agua',
    reubicado: 'Una risita… algo cayó en este cuarto', nombre: '', ropero: 'Un escondite se abre solo… se ven ojos', monedas: 'Suenan monedas; una flamita azul sale del piso',
    gruñido: 'Un gruñido y pisadas de animal', rosarioroto: 'Las cuentas de un rosario se rompen y ruedan', cama: 'Una cama se tiende sola; huele a almidón',
    tornado: 'Tres objetos se mueven a la vez', aleteo: 'Un aleteo… caen plumas del techo', escarcha: 'La escarcha crece en la ventana' }[kind] || kind;
  w.fxAdd('sello_' + kind, p, { ttl: 25 });
  w.ev('sello', { kind, f: p.f, x: p.x, y: p.y });
  if (kind === 'nombre') return true;
  w.sub(p, text, sound ? CFG.selloSound + 2 : CFG.selloSight + 2);
  for (const i of alive(w)) {
    const ok = sound ? (i.f === p.f && d2(i, p) <= CFG.selloSound) : sees(i, p, CFG.selloSight,w);
    if (ok) { w.ev('selloSeen', { who: i.id }); break; }
  }
}

// ---------- Eventos del ánima y herramientas ----------
function ghostEvent(w, g, type, extra) {
  const ev = Object.assign({ type, f: g.f, x: g.x, y: g.y, t: w.t }, extra || {});
  if ((type === 'door' || type === 'portazo') && ev.door) { ev.door.touchedAt = w.t; ev.door.anim = 1; }
  if (type !== 'door') { g.phenoCount++; if (g.def.id === 'chocarrero' && g.phenoCount % 3 === 0) emitSello(w, g, 'tornado'); }
  if (g.def.id === 'demonio' && type !== 'door') { const v = exposedInvs(w).find(i => i.f === g.f && d2(i, g) <= 4 && i.slots.some(s => s && s.kind === 'rosario')); if (v && w.t > (g.selloCd.rosario || 0)) { g.selloCd.rosario = w.t + 30; emitSello(w, g, 'rosarioroto'); } }
}
function itemPos(w, it) { if (it.holder) return it.holder.alive && !it.holder.escaped ? { f: it.holder.f, x: it.holder.x, y: it.holder.y } : null; return it; }
// revisión continua de herramientas (cada 0,25 s): leen rastro y cercanía, fallan y nunca dan un positivo falso
const chance = (p, dt, per) => Math.random() < 1 - Math.pow(1 - p, dt / (per || 1));
function toolTick(w, dt) {
  const g = w.g, has = k => g.def.ev.includes(k), awake = g.state !== 'despertando' && g.state !== 'desvanecida' && w.phase === 'night';
  const interf = p => w.t < g.interfUntil && p.f === g.f && d2(p, g) <= CFG.interf.r;
  for (const it of w.items) {
    const p = itemPos(w, it); if (!p) continue;
    const held = it.holder && it.holder.alive && it.holder.slots[it.holder.hand] === it ? it.holder : null;
    const near = awake && p.f === g.f ? d2(p, g) : 99, rr = roomAt(p.f, p.x, p.y), ras = rr >= 0 ? w.rastro[p.f][rr] : 0;
    switch (it.kind) {
      case 'emf': if (w.t >= it.emfUntil) { let lv = 1, dur = 0.5; if (near <= 3) { if (has('LU') && chance(CFG.emfP, dt)) { lv = 5; dur = 3; } else { lv = 2 + ((Math.random() * 2) | 0); dur = 1; } } else if (near <= 6 && Math.random() < 0.15) lv = 2;
        if (interf(p) && lv < 4 && Math.random() < 0.5) { lv = 4; dur = 1.5; } it.emfLvl = lv; it.emfUntil = w.t + dur; if (lv === 5) { w.ev('emf', Object.assign({ lvl: 5 }, p)); observe(w, 'LU', held || witnessOf(w, p, 6), 'EMF 5'); } } break;
      case 'espejo': if (!it.holder && w.t > it.markUntil && w.t > (it.fogUntil || 0)) { if (has('ES') && ras >= CFG.esp.min && chance(CFG.esp.p, dt, 60)) { it.markUntil = w.t + 30; w.ev('espejo', p); } else if ((ras >= CFG.esp.min || interf(p)) && chance(0.2, dt, 60)) it.fogUntil = w.t + 20; }
        if (w.t < it.markUntil) observe(w, 'ES', held || witnessOf(w, p, 8), 'una mano en el vaho del espejo'); break;
      case 'gases': if (near <= 3) it.gasAcc += dt; if (it.gasAcc >= 5) { it.gasAcc = 0; if (has('AZ') && Math.random() < CFG.gasP) { it.redUntil = w.t + 30; w.ev('gases', p); } else it.yellowUntil = w.t + 12; }
        if (w.t < it.redUntil) observe(w, 'AZ', held || witnessOf(w, p, 5), 'la aguja en rojo'); break;
      case 'cam': if (!it.holder && !it.photo && ras >= CFG.cam.min && chance(CFG.cam.p, dt, 60)) it.photo = has('OB') ? 'flota' : Math.random() < 0.35 ? 'borrosa' : null;
        if (!it.holder && !it.photo && interf(p) && chance(0.15, dt, 10)) it.photo = 'borrosa'; break;
      case 'termo': if (held) { const h = held, moved = h.tLast ? Math.hypot(h.x - h.tLast.x, h.y - h.tLast.y) > 0.08 || h.tLast.f !== h.f : true; h.tLast = { f: h.f, x: h.x, y: h.y };
          const tg = tempAt(w, h.f, h.x, h.y) + (interf(h) ? (Math.random() - 0.5) * 8 : 0); const st = h.termo || (h.termo = { v: 18, settle: 0 });
          if (moved) { st.settle = 0; st.v += (18 + (Math.random() - 0.5) * 2 - st.v) * 0.35; } else { st.settle += dt; st.v += (tg - st.v) * Math.min(1, dt / 2.4); }
          st.show = st.v + (st.settle > 0 ? Math.sin(w.t * 1.7 + h.id) * CFG.termo.noise * Math.max(0.35, 1 - st.settle / 12) : (Math.random() - 0.5) * 3);
          if (st.settle >= CFG.termo.settle && st.v < 0) observe(w, 'BC', h, `${st.v.toFixed(1)} °C`);
          if (h.bot && st.settle >= CFG.termo.settle) { const r = roomOf(h); if (r >= 0 && !isHall(h.f, r)) { if (st.v < 9 && (!w.team.home || w.rastro[h.f][r] > (w.team.home.f === h.f && w.team.home.r === r ? -1 : w.rastro[w.team.home.f][w.team.home.r]))) { if (!w.team.home || w.team.home.f !== h.f || w.team.home.r !== r) w.say(`${h.name}: «Aquí hace mucho frío. Aquí vive».`, 'a'); w.team.home = { f: h.f, r }; } else if (st.v > 13 && w.team.home && w.team.home.f === h.f && w.team.home.r === r) { w.team.home = null; w.say(`${h.name}: «Aquí ya no hace frío… se fue».`, 'a'); } } } }
        break;
      case 'uv': if (held) { const h = held;
          for (const d of w.doors) { if (d.f !== h.f || d2(d, h) > 4.2 || angDiff(Math.atan2(d.y - h.y, d.x - h.x), h.face) > 0.6) continue;
            const rs = [roomAt(d.f, d.x + (d.o === 'V' ? 0.9 : 0), d.y + (d.o === 'V' ? 0 : 0.9)), roomAt(d.f, d.x - (d.o === 'V' ? 0.9 : 0), d.y - (d.o === 'V' ? 0 : 0.9))].filter(r => r >= 0);
            const ras2 = Math.max(0, ...rs.map(r => w.rastro[d.f][r]));
            if (ras2 >= CFG.uv.min && w.t - (d.uvT || -999) >= CFG.uv.re) { d.uvT = w.t; if (has('CE') && Math.random() < CFG.uv.p) d.printsUntil = w.t + CFG.uv.glow; }
            if (w.t < (d.printsUntil || 0)) { d.glowUntil = w.t + 0.4; observe(w, 'CE', h, 'huellas de ceniza bajo la luz UV'); } } }
        break;
    }
    if (it.kind === 'vela' && it.lit && w.t > it.litUntil) it.lit = false;
  }
  for (const a of w.ashes) if (a.prints && w.t < a.printsUntil) { const wit = alive(w).find(i => i.f === a.f && d2(i, a) <= 3 && handItem(i) && handItem(i).kind === 'uv'); if (wit) { a.glowUntil = w.t + 2; observe(w, 'CE', wit, 'huellas en la ceniza bajo la UV'); } }
}
function roomTemp(w, f, r) { const c = w.cold[f][r] || ROOM_CENTER[f][r]; return c ? tempAt(w, f, c.x, c.y) : 18; }

// ---------- Acciones de investigadores ----------
const handItem = i => i.slots[i.hand];
function pickUp(w, i) {
  let best = null, bd = 1.3;
  for (const it of w.items) if (!it.holder && layoutItemVisible(w,it) && it.f === i.f && d2(it, i) < bd) { bd = d2(it, i); best = it; }
  if (!best) return false;
  let slot = i.slots[i.hand] ? i.slots.indexOf(null) : i.hand; if (slot < 0) { if (!i.bot) w.say('No tienes ranuras libres.', 'i'); return false; }
  i.slots[slot] = best; best.holder = i; best.lit = false;
  if (best.kind === 'ruda' || best.kind === 'rosario') w.doors.forEach(d => { if (d.rosarioItem === best) { d.rosarioItem = null; d.rosario = false; } });
  if (!i.bot) w.say(`Tomaste: ${ITEMS[best.kind].n}.`, 'i'); w.ev('pickup', i); return true;
}
function dropItem(w, i, k) {
  const it = i.slots[k]; if (!it) return false; if (i.alive) w.ev('act', { who: i.id, kind: 'drop' }); i.slots[k] = null; it.holder = null; it.f = i.f;
  it.x = i.x + Math.cos(i.face) * 0.5; it.y = i.y + Math.sin(i.face) * 0.5; if (collidesPt(it)) { it.x = i.x; it.y = i.y; }
  it.dir = i.face; it.h = 0;
  if (it.kind === 'vela') { it.lit = true; it.litUntil = w.t + CFG.vela.dur; }
  if (it.kind === 'ceniza') { scatterAsh(w, it); w.items.splice(w.items.indexOf(it), 1); if (!i.bot) w.say('Riegas la ceniza en el piso.', 'i'); }
  if (it.kind === 'radio' && it.on) it.on = false;
  return true;
}
const collidesPt = p => !walkableT(tileAt(p.f, p.x, p.y));
// punto caminable junto a un objeto apoyado en un mueble
function approach(p) { if (walkableT(tileAt(p.f, p.x, p.y))) return p; let best = p, bd = 9; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const x = (p.x | 0) + dx + 0.5, y = (p.y | 0) + dy + 0.5; if (walkableT(tileAt(p.f, x, y))) { const d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; best = { f: p.f, x, y }; } } } return best; }
function throwItem(w, i, power) {
  const k = i.hand, it = i.slots[k]; if (!it) return false; w.ev('act', { who: i.id, kind: 'throw' });
  const dist = clamp(power, 1.5, CFG.throwMax); let x = i.x, y = i.y; const dx = Math.cos(i.face), dy = Math.sin(i.face);
  for (let s = 0; s < dist; s += 0.25) { const nx = x + dx * 0.25, ny = y + dy * 0.25; if (!walkableT(tileAt(i.f, nx, ny))) break; x = nx; y = ny; }
  i.slots[k] = null; it.holder = null; it.f = i.f; it.x = x; it.y = y; it.dir = i.face; it.lit = false; it.h = 0;
  w.noise(it, 1.5, 'throw'); w.ev('throw', { from: { f: i.f, x: i.x, y: i.y }, to: { f: it.f, x, y }, kind: it.kind });
  if (it.kind === 'copal' && !w.noHoly) { spawnCloud(w, it); w.items.splice(w.items.indexOf(it), 1); }
  if (it.kind === 'rosario' && !w.noHoly && w.g.f === it.f && d2(w.g, it) <= 1.5) { activateRosary(w, i); w.items.splice(w.items.indexOf(it), 1); }
  return true;
}
function spawnCloud(w, p) {
  const g = w.g; if (w.t < w.noCopalUntil) { w.say('El copal no prende: el pentagrama lo apaga.', 'a'); return; } w.clouds.push({ f: p.f, x: p.x, y: p.y, r: CFG.copal.r, until: w.t + CFG.copal.dur }); w.fxAdd('copal', p, { ttl: CFG.copal.dur });
  if (g.f === p.f && d2(g, p) <= CFG.copal.r) { g.stunUntil = w.t + CFG.copal.stun; if (g.hunt && !g.hunt.huida) endHunt(w, g); w.say('El humo del copal detiene al ánima.', 'a'); }
  rebuildMasks(w); w.ev('copal', p);
}
function activateRosary(w, by) {
  const g = w.g; g.blindUntil = w.t + (g.def.rosaryBlind || CFG.rosaryBlind); g.seenT = 0; g.perceived.clear(); w.stats.rosaries++;
  w.say(`${by.name} alza el rosario: el ánima titila y queda ciega.`, 'a'); w.ev('rosario', g);
}
function useItem(w, i) { const it = handItem(i); const ok = useItemRaw(w, i); if (ok && it) w.ev('act', { who: i.id, kind: ['vela', 'cruz', 'pan', 'ceniza'].includes(it.kind) ? 'drop' : 'use' }); return ok; }
function useItemRaw(w, i) {
  const it = handItem(i); if (!it || i.hidden >= 0) return false; const g = w.g;
  switch (it.kind) {
    case 'te': i.san = Math.min(100, i.san + CFG.te); consume(w, i); w.say(`${i.name} toma té de tila.`, 'a'); return true;
    case 'rosario': if (!w.noHoly && g.f === i.f && d2(g, i) <= 3 && g.state !== 'despertando') { activateRosary(w, i); consume(w, i); return true; } if (!i.bot) w.say('El rosario no hace nada: el ánima no está a 3 m.', 'i'); return false;
    case 'ruda': { const d = w.doors.find(d => d.f === i.f && d2(d, i) <= 1.6); if (!d) { if (!i.bot) w.say('Hay que estar junto a una puerta para colgar la ruda.', 'i'); return false; } d.rudaUntil = w.t + CFG.rudaDur; d.rudaRoom = { f: i.f, r: roomOf(i) }; consume(w, i); rebuildMasks(w); w.say(`${i.name} cuelga ruda en la puerta.`, 'a'); w.fxAdd('ruda', d, { ttl: CFG.rudaDur }); return true; }
    case 'copal': if (w.noHoly) return false; spawnCloud(w, i); consume(w, i); return true;
    case 'vela': case 'cruz': case 'pan': case 'ceniza': return dropItem(w, i, i.hand);
    case 'limpia': { const a = alive(w).filter(o => o.f === i.f && d2(o, i) <= CFG.limpia.r); a.forEach(o => { o.san = Math.min(100, o.san + CFG.limpia.heal); o.curseUntil = 0; });
      const pg = w.items.find(t => t.kind === 'pentagrama'); if (pg) pg.candles = 0;
      const black = g.state !== 'despertando' && g.f === i.f && d2(g, i) <= CFG.limpia.sense; consume(w, i);
      w.say(`${i.name} hace una limpia con huevo (${a.length} ${a.length === 1 ? 'persona' : 'personas'}). ` + (black ? 'El huevo sale negro: el ánima está muy cerca.' : 'El huevo sale limpio.'), 'a'); w.ev('limpia', i); return true; }
    case 'tarot': case 'tablilla': case 'espejoplata': case 'mano': case 'muneca': case 'pentagrama': case 'radio': return useCursed(w, i, it);
    case 'termo': if (!i.bot) w.say('El termómetro mide solo mientras lo sostienes: quédate quieto para que se asiente.', 'i'); return false;
    case 'grab': return askSpirit(w, i, it);
    case 'cam': it.view = { kind: it.photo || 'nada', until: w.t + 5 }; it.photo = null; /* solo cuenta la silueta vista en la tele de la base */ return true;
    default: if (!i.bot) w.say(ITEMS[it.kind].hint || `${ITEMS[it.kind].n}: déjala (G) donde va a pasar el ánima, o llévala en la mano.`, 'i'); return false;
  }
}
// Grabadora: preguntar en voz alta, a oscuras, pocos en el cuarto y el ánima cerca
function askSpirit(w, i, it) {
  if (w.t < (it.cd || 0)) return false; it.cd = w.t + CFG.grab.cd; const g = w.g, r = roomOf(i);
  const dark = r >= 0 && !w.lights[i.f][r], few = alive(w).filter(o => o.f === i.f && roomOf(o) === r).length <= CFG.grab.maxPeople, near = g.state === 'libre' && g.f === i.f && d2(g, i) <= CFG.grab.r;
  w.noise(i, 6, 'pregunta'); w.ev('ask', { who: i.id, f: i.f, x: i.x, y: i.y }); g.lastAsk = { f: i.f, x: i.x, y: i.y, t: w.t };
  let kind = 'nada';
  if (dark && few && near && g.def.ev.includes('SU') && Math.random() < CFG.grab.p) kind = 'voz';
  else if ((near && Math.random() < 0.35) || (w.t < g.interfUntil && d2(g, i) <= CFG.interf.r)) kind = 'estatica';
  it.screen = { kind, until: w.t + 5, cond: { dark, few } };
  const words = ['…aquí…', '…frío…', '…no te vayas…', '…mi casa…', '…detrás…'];
  if (kind === 'voz') { w.sub(i, `Grabadora: «${pick(words)}»`, CFG.grab.hear); observe(w, 'SU', i, 'una voz en la grabadora'); }
  else if (kind === 'estatica') w.sub(i, 'Grabadora: estática… sílabas sueltas', CFG.grab.hear);
  return true;
}
// ---------- Objetos de la casa y malditos ----------
function scatterAsh(w, p) { const a = { f: p.f, x: p.x, y: p.y, until: w.t + CFG.ash.dur, stepped: false, prints: false, t: w.t }; w.ashes.push(a); w.fxAdd('ceniza', p, { ttl: CFG.ash.dur, ash: a }); }
function cursedHunt(w, target, why) {
  const g = w.g; if (w.phase !== 'night' || (g.hunt && !g.hunt.huida) || w.over) return false;
  if (g.state !== 'libre') { g.state = 'libre'; } g.pres = Math.max(g.pres, 15); g.stunUntil = 0; g.returning = false;
  if (target && (g.f !== target.f || d2(g, target) > 14)) { const r = roomOf(target); let p = null;
    for (let k = 0; k < 20; k++) { const q = r >= 0 && !isHall(target.f, r) ? randomIn(target.f, r) : null; if (q && d2(q, target) >= 4) { p = q; break; } }
    if (!p) { const cands = ROOM_LIST.filter(rr => rr.f === target.f && ROOM_CENTER[rr.f][rr.r]).map(rr => ROOM_CENTER[rr.f][rr.r]).filter(c => d2(c, target) >= 5).sort((a, b) => d2(a, target) - d2(b, target)); p = cands[0]; }
    if (p) { g.f = p.f; g.x = p.x; g.y = p.y; } }
  g.hunt = { until: w.t + CFG.huntDur + CFG.cursedHunt, cursed: true }; snapWalkable(w, g); g.seenT = 0; w.stats.hunts++; w.stats.cursed = (w.stats.cursed || 0) + 1;
  if (target) g.ai.target = { f: target.f, x: target.x, y: target.y, t: w.t, who: target };
  w.say(`¡CACERÍA MALDITA! ${why || ''}`, 'a'); w.ev('hunt', { cursed: true }); return true;
}
function discardOne(w) { const k = shuffle(EV_KEYS.filter(k => !w.g.def.ev.includes(k) && !w.discard[k]))[0]; if (k) { w.discard[k] = true; w.objDiscard = true; } return k; }
function forcedInteraction(w, g) { if (g.state === 'despertando' || g.hunt) return false; const old = g.ready.c; g.ready.c = 0; const ok = gMover(w, g) || (nearestProp(w, g, 2.6) && gProp(w, g)); if (!ok) g.ready.c = old; if (!ok) ghostEvent(w, g, 'move'); return true; }
function useCursed(w, i, it) {
  const g = w.g, me = !i.bot, room = (e) => { const r = roomOf(e); return r >= 0 ? ROOMS[e.f][r].n : 'el pasillo'; };
  if (w.phase !== 'night') { if (me) w.say('Ya no hay tiempo para eso: ¡a la salida!', 'i'); return false; }
  switch (it.kind) {
    case 'tarot': {
      const card = weightedPick(TAROT.map(c => c[0]), TAROT.map(c => c[1])); it.cards--; w.ev('tarot', Object.assign({ card }, i));
      let txt = '';
      if (card === 'sol') { i.san = 100; txt = 'tu cordura vuelve completa.'; }
      if (card === 'luna') { i.san = 0; txt = 'tu cordura cae a cero.'; }
      if (card === 'ermitano') { g.lockHomeUntil = w.t + 60; if (!g.hunt) g.returning = true; txt = 'el ánima queda encerrada en su cuarto 1 minuto.'; }
      if (card === 'rueda') { const up = Math.random() < 0.5; i.san = clamp(i.san + (up ? 25 : -25), 0, 100); txt = up ? 'ganas 25 de cordura.' : 'pierdes 25 de cordura.'; }
      if (card === 'diablo') { if (g.state !== 'despertando' && !g.hunt) { g.f = i.f; const a = Math.random() * 6.28; const p = { f: i.f, x: i.x + Math.cos(a) * 3, y: i.y + Math.sin(a) * 3 }; if (walkableT(tileAt(p.f, p.x, p.y))) { g.x = p.x; g.y = p.y; } g.revealUntil = w.t + 3; } w.haunt(i, 10); txt = 'el ánima se aparece junto a ti.'; }
      if (card === 'torre') { forcedInteraction(w, g); txt = 'algo se mueve donde está el ánima.'; }
      if (card === 'muerte') cursedHunt(w, i, `${i.name} sacó La Muerte.`); else w.say(`${i.name} saca ${TAROT_N[card]}: ${txt}`, 'a');
      if (it.cards <= 0) { consume(w, i); w.say('El mazo de tarot se deshace en ceniza.', 'a'); }
      return true; }
    case 'tablilla': {
      if (i.san < CFG.tablillaCost) { consume(w, i); w.say('La tablilla se parte en dos: no te alcanzó la cordura.', 'a'); cursedHunt(w, i, 'La tablilla se rompió.'); return true; }
      i.san -= CFG.tablillaCost; it.q++; w.ev('tablilla', i);
      if (it.q === 1) { w.team.home = { f: g.home.f, r: g.home.r }; w.say(`${i.name} pregunta «¿dónde estás?». La tablilla deletrea: ${ROOMS[g.home.f][g.home.r].n.toUpperCase()}.`, 'a'); }
      else if (it.q === 2) { const k = discardOne(w); w.say(`${i.name} pregunta «¿qué no eres?». La tablilla deletrea: ${k ? EV[k].n.toUpperCase() : 'NADA'}.`, 'a'); }
      else { const near = g.f === i.f && d2(g, i) <= 10; w.say(`${i.name} pregunta «¿estás aquí?». La tablilla va a ${near ? 'SÍ' : 'NO'}… y luego a ADIÓS.`, 'a'); if (near) g.revealUntil = w.t + 2; consume(w, i); }
      return true; }
    case 'espejoplata': { it.on = !it.on; if (it.on) { it.spent = 0; i.mirror = it; w.say(`En la plata se ve ${room(g)}${g.f ? ' (planta alta)' : ' (planta baja)'}.`, i.bot ? 'x' : 'i'); w.ev('espejoplata', i); if (inHome(g)) w.team.home = { f: g.home.f, r: g.home.r }; }
      else { if (it.spent < CFG.mirrorMin) i.san = Math.max(0, i.san - (CFG.mirrorMin - it.spent)); i.mirror = null; } return true; }
    case 'mano': {
      const dead = w.invs.filter(o => !o.alive && !o.escaped); it.wishes--; w.ev('mano', i);
      if (dead.length) { const o = dead[0]; if (Math.random() < 0.5) { o.alive = true; o.noclip = false; o.hidden = -1; o.san = 50; o.f = i.f; o.x = i.x; o.y = i.y; w.say(`${i.name} pide que vuelva ${o.name}. Un dedo se cierra… y ${o.name} respira otra vez.`, 'a'); w.ev('revive', { who: o.id }); }
        else { w.say(`${i.name} pide que vuelva ${o.name}. La mano cobra: ${i.name} cae al piso.`, 'a'); killInv(w, i); } }
      else { const k = discardOne(w); w.say(`${i.name} desea saber. La mano le muestra que no es ${k ? EV[k].n : '…'}, y el ánima viene por ti.`, 'a'); cursedHunt(w, i, 'La mano del mono cobró el deseo.'); }
      if (it.wishes <= 0 && i.slots.includes(it)) consume(w, i); return true; }
    case 'muneca': {
      const heart = it.pins - 1 === it.heart; it.pins--; i.san = Math.max(0, i.san - CFG.pinCost); w.ev('muneca', i);
      if (heart) { consume(w, i); w.say(`${i.name} clava el alfiler del corazón. La muñeca se ríe.`, 'a'); cursedHunt(w, i, 'El alfiler del corazón.'); return true; }
      forcedInteraction(w, g); w.say(`${i.name} clava un alfiler (${it.pins} quedan). Algo se mueve en la casa.`, me ? 'i' : 'x');
      if (it.pins <= 0) consume(w, i); return true; }
    case 'pentagrama': {
      it.candles++; i.san = Math.max(0, i.san - CFG.candleCost); w.ev('vela5', i); w.sub(i, `Una vela del pentagrama se enciende (${it.candles}/5)`, 8);
      if (it.candles >= 5) { consume(w, i); if (g.state !== 'despertando') { g.state = 'libre'; g.f = i.f; const a = Math.random() * 6.28; const p = { f: i.f, x: i.x + Math.cos(a) * 2, y: i.y + Math.sin(a) * 2 }; if (walkableT(tileAt(p.f, p.x, p.y))) { g.x = p.x; g.y = p.y; } else { g.x = i.x; g.y = i.y; }
          g.stunUntil = w.t + 5; g.revealUntil = w.t + 5; w.noCopalUntil = w.t + 35; w.pendingCursed = { t: w.t + 5, who: i };
          const k = shuffle(g.def.ev.filter(k => !w.conf[k]))[0];
          w.say(`¡El ánima aparece atrapada en el pentagrama! Tienen 5 segundos antes de que se libere.`, 'a'); if (k) confirmEv(w, k, i, 'el ánima la mostró atrapada en el pentagrama'); } }
      return true; }
    case 'radio': {
      if (w.t < it.cd) { if (me) w.say('La radio sigue con estática…', 'i'); return false; } it.cd = w.t + CFG.radio.cd; i.san = Math.max(0, i.san - CFG.radio.cost); w.noise(i, 14, 'radio'); w.ev('radio', i);
      const d = g.state !== 'despertando' && g.f === i.f ? d2(g, i) : 99;
      if (d <= CFG.radio.r) { w.say(`Dos chasquidos responden en la radio… desde ${room(g)}.`, 'a'); w.ev('chasquidos', g); if (d <= 4 && Math.random() < 0.25) cursedHunt(w, i, 'Del otro lado de la radio, algo dejó de jugar.'); }
      else w.say('Solo estática en la radio.', me ? 'i' : 'x');
      return true; }
  }
  return false;
}
function consume(w, i) { const it = i.slots[i.hand]; i.slots[i.hand] = null; const k = w.items.indexOf(it); if (k >= 0) w.items.splice(k, 1); }
function hangRosary(w, i) { const it = handItem(i); if (!it || it.kind !== 'rosario') return false; const d = w.doors.find(d => d.f === i.f && d2(d, i) <= 1.6 && !d.rosario); if (!d) return false;
  i.slots[i.hand] = null; it.holder = null; it.f = d.f; it.x = d.x; it.y = d.y; d.rosario = true; d.rosarioItem = it; w.say(`${i.name} cuelga un rosario en la puerta.`, 'a'); return true; }
function nearSpot(w, i) { let b = -1, bd = 0.9; w.spotsActive.forEach(k => { const s = SPOTS[k]; if (s.f !== i.f) return; const d = Math.hypot(s.hx - i.x, s.hy - i.y); if (d < bd && !w.invs.some(o => o.alive && o.hidden === k)) { bd = d; b = k; } }); return b; }
function interact(w, i) {
  if (i.hidden >= 0) { i.hidden = -1; return 'salir'; }
  if (resetFuse(w, i)) return 'fusibles';
  const s = nearSpot(w, i); if (s >= 0) { i.hidden = s; i.x = SPOTS[s].hx; i.y = SPOTS[s].hy; i.reading = null; return 'esconder'; }
  if (pickUp(w, i)) return 'tomar';
  const dr = nearDoor(w, i); if (dr) { dr.closed = !dr.closed; dr.anim = 0; w.noise(dr, 4, 'door'); w.ev('doorToggle', { f: dr.f, x: dr.x, y: dr.y, closed: dr.closed }); return 'puerta'; }
  return null;
}
function nearSwitch(i, R) { let b = null, bd = R || 1.6; for (const s of SWITCHES[i.f]) if (s) { const d = Math.hypot(s.x - i.x, s.y - i.y); if (d < bd) { bd = d; b = s; } } return b; }
function nearDoor(w, i) { let b = null, bd = 1.7; for (const d of w.doors) if (d.f === i.f) { const dd = Math.hypot(d.x - i.x, d.y - i.y); if (dd < bd && !d.tiles.some(([x, y]) => x === (i.x | 0) && y === (i.y | 0))) { bd = dd; b = d; } } return b; }
// escondite cercano y por qué no se puede usar
function spotNear(w, i) { let b = null, bd = 1.0; SPOTS.forEach((s, k) => { if (s.f !== i.f) return; const d = Math.hypot(s.hx - i.x, s.hy - i.y); if (d < bd) { bd = d; b = k; } }); if (b === null) return null; const occ = w.invs.find(o => o.alive && o.hidden === b && o !== i); return { k: b, why: !w.spotsActive.has(b) ? 'candado' : occ ? 'ocupado' : null, who: occ }; }
function toggleLight(w, i) {
  let sw = nearSwitch(i); if (!sw && i.bot) { const r0 = roomOf(i); sw = r0 >= 0 ? SWITCHES[i.f][r0] : null; }
  if (!sw) { if (!i.bot) w.say('La luz se prende en el apagador, junto a la puerta.', 'i'); return false; }
  const r = sw.r, h = handItem(i);
  if (w.burnt[i.f][r]) { if (h && h.kind === 'foco') { consume(w, i); w.burnt[i.f][r] = 0; w.flips[i.f][r] = []; w.lights[i.f][r] = w.fuse[i.f] ? 1 : 0; w.say(`${i.name} cambia el foco de ${ROOMS[i.f][r].n}.`, 'a'); w.ev('switch', sw); return true; } if (!i.bot) w.say('El foco está fundido: trae un foco de repuesto.', 'i'); w.ev('click', sw); return false; }
  if (!w.fuse[i.f]) { if (!i.bot) w.say('No hay corriente en esta planta: revisa la caja de fusibles del Zaguán.', 'i'); w.ev('click', sw); return false; }
  w.lights[i.f][r] = w.lights[i.f][r] ? 0 : 1; w.ev('switch', sw);
  const fl = w.flips[i.f][r]; fl.push(w.t); while (fl.length && w.t - fl[0] > CFG.bulb.win) fl.shift();
  if (fl.length >= CFG.bulb.flips && w.lights[i.f][r]) { w.lights[i.f][r] = 0; w.burnt[i.f][r] = 1; w.sub(sw, '¡Paf! El foco se fundió', 8); w.ev('burn', sw); }
  return true;
}
function resetFuse(w, i) { if (i.f !== FUSE.f || Math.hypot(i.x - FUSE.x, i.y - FUSE.y) > 1.6) return false; const off = w.fuse.map((v, f) => v ? -1 : f).filter(f => f >= 0); if (!off.length) { if (!i.bot) w.say('Los fusibles están bien.', 'i'); return true; } off.forEach(f => (w.fuse[f] = true)); w.say(`${i.name} sube los fusibles: vuelve la corriente.`, 'a'); w.ev('fuse', FUSE); return true; }

function nameGhost(w, by, id) {
  if (w.phase !== 'night' && !w.pendingDawn) return;
  if (w.ritual) return; w.ritual = { by, id, until: w.t + CFG.ritualDur, san0: by.san, t0: w.t };
  w.say(`${by.name} empieza a nombrarla en el altar: «Eres ${GT[id].n}…» (${CFG.ritualDur} s)`, 'a'); w.say('¡Te están nombrando en el altar de la Capilla! Interrúmpelo: acércate, asusta o caza a quien nombra.', 'g'); w.ev('ritual', by);
}
function finishName(w) {
  const { by, id } = w.ritual; w.ritual = null;
  w.say(`${by.name} termina en el altar: «¡Eres ${GT[id].n}!»`, 'a'); w.ev('name');
  if (id !== w.g.def.id) { w.over = { win: 'ghost', cause: `Nombre equivocado: era ${w.g.def.n}` }; return; }
  const dawn = w.pendingDawn || !!w.dawnBots; w.pendingDawn = false;
  startHuida(w, dawn);
}
function startHuida(w, dawn) {
  const g = w.g; w.phase = 'huida'; g.exposed = true; g.pres = g.def.presMax; g.state = 'libre'; g.returning = false;
  w.huida = { until: w.t + CFG.huidaDur, aliveAtStart: alive(w).length, escaped: 0, dawn };
  g.hunt = { until: Infinity, huida: true }; snapWalkable(w, g); g.seenT = 0; g.espantoUsed = dawn; g.slowMult = dawn ? 0.7 : 1;
  w.say(dawn ? '¡Amanece! Corran al Zaguán: el ánima está débil.' : '¡La nombraron! La casona despierta: ¡corran al Zaguán!', 'a'); w.ev('huida');
}

// ---------- Ánima: acciones ----------
const huntThr = (w, rule) => (rule.thr || 0) - (w.invs.length === 1 ? 10 : 0);
function huntRuleOK(w, g) {
  const a = alive(w); if (!a.length) return false; const rule = g.def.hunt, thr = huntThr(w, rule);
  switch (rule.type) {
    case 'avg': return a.reduce((s, i) => s + i.san, 0) / a.length <= thr;
    case 'isolated': return a.some(i => isolated(w, i) && i.san <= thr) || (a.length === 1 && a[0].san <= thr);
    case 'guardian': return a.some(i => i.f === g.home.f && roomOf(i) === g.home.r && i.san <= 60) || a.reduce((s, i) => s + i.san, 0) / a.length <= huntThr(w, { thr: 45 });
    case 'healthiest': return Math.max(...a.map(i => i.san)) <= thr;
    case 'weakest': return Math.min(...a.map(i => i.san)) <= thr;
  }
  return false;
}
const canHunt = (w, g) => w.phase === 'night' && g.state === 'libre' && !g.hunt && w.t >= CFG.huntFirst && w.t >= (g.lastHuntEnd || -999) + CFG.huntGap && w.t >= (g.lockHomeUntil || 0) && w.t >= g.huntReady && g.pres >= CFG.huntMinPres && w.t >= g.stunUntil && huntRuleOK(w, g);
function startHunt(w, g) { if (!canHunt(w, g)) return false;
  const cr = w.items.find(it => it.kind === 'cruz' && !it.holder && it.f === g.f && d2(it, g) <= CFG.cruz.r); if (cr) { cr.charges--; g.huntReady = w.t + CFG.cruz.cd; w.sub(cr, 'La cruz de palma se chamusca', 10); w.ev('cruz', cr); if (cr.charges <= 0) { w.items.splice(w.items.indexOf(cr), 1); scatterAsh(w, cr); w.say('Una cruz de palma se hizo ceniza.', 'a'); } return false; }
  g.hunt = { until: w.t + CFG.huntDur, t0: w.t }; snapWalkable(w, g); g.returning = false; g.seenT = 0; w.stats.hunts++; w.say('¡CACERÍA! Los focos zumban en rojo.', 'a'); w.ev('hunt'); if (g.def.id === 'nahual') emitSello(w, g, 'gruñido'); return true; }
function endHunt(w, g) { if (!g.hunt || g.hunt.huida) return; g.hunt = null; g.lastHuntEnd = w.t; g.huntReady = w.t + g.def.huntCd; w.say('La cacería terminó.', 'a'); w.ev('huntEnd'); }
const freqOK = (g, k) => g.def.freq[k] > 0;
const cdFor = (g, k, base) => base / g.def.freq[k];
function gReady(w, g, k) { return freqOK(g, k) && w.t >= g.ready[k] && w.t >= g.stunUntil && (g.state === 'libre' || (k === 'q' && g.state === 'descanso')) && !(g.hunt && !g.hunt.huida && k !== 'r'); }
function gChill(w, g) {
  g.lastAct = { f: g.f, x: g.x, y: g.y, t: w.t };
  if (!gReady(w, g, 'q') || (g.hunt && !g.hunt.huida)) return false; g.ready.q = w.t + cdFor(g, 'q', CFG.chill.cd); g.pres = Math.max(0.1, g.pres - CFG.chill.cost); g.revealUntil = w.t + 1;
  const mult = g.def.chillMult ? g.def.chillMult(w, g) : 1;
  exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= CFG.chill.r).forEach(i => { w.haunt(i, g.def.chillDmg * mult); w.ev('chill', { who: i.id }); });
  ghostEvent(w, g, 'chill'); return true;
}
function gLightsOff(w, g) {
  const r = roomOf(g); let done = false;
  if (gReady(w, g, 'e') && r >= 0 && w.lights[g.f][r] && !['patio', 'vacio'].includes(ROOMS[g.f][r].id)) { w.lights[g.f][r] = 0; done = true; w.sub(g, 'Clic. Un foco se muere con un zumbido', 10); }
  const v = w.items.find(it => it.kind === 'vela' && it.lit && it.f === g.f && d2(it, g) <= 3);
  if (gReady(w, g, 'e') && v) { v.lit = false; done = true; w.sub(v, 'Una veladora se apaga sola', 8); }
  if (done) { g.ready.e = w.t + cdFor(g, 'e', CFG.cds.e); ghostEvent(w, g, 'switch'); w.ev('lightsoff', g); }
  return done;
}
function nearestDoor(w, g, R) { let b = null, bd = R; for (const d of w.doors) if (d.f === g.f) { const dd = d2(d, g); if (dd < bd) { bd = dd; b = d; } } return b; }
function gPortazo(w, g) {
  if (!gReady(w, g, 'f')) return false; const ds = w.doors.filter(d => d.f === g.f && d2(d, g) <= 9).sort((a, b) => d2(b, g) - d2(a, g)); const d = ds[0]; if (!d) return false;
  g.ready.f = w.t + cdFor(g, 'f', CFG.cds.f); d.closed = true; w.noise(d, 20, 'portazo'); w.sub(d, '¡PAM! El viento azota una puerta… pasos que se alejan', 20);
  exposedInvs(w).filter(i => i.f === g.f && roomOf(i) === roomAt(d.f, d.x, d.y - 0.6)).forEach(i => w.haunt(i, 3));
  ghostEvent(w, g, 'portazo', { door: d }); w.ev('portazo', d); return true;
}
function gMover(w, g) {
  if (!gReady(w, g, 'c')) return false;
  const r0 = roomOf(g); const cand = w.loose.filter(o => o.f === g.f && d2(o, g) <= 3.5 && w.t - o.flyT > 1.2).sort((a, b) => (roomAt(a.f, a.x, a.y) !== r0) - (roomAt(b.f, b.x, b.y) !== r0) || d2(a, g) - d2(b, g));
  const o = cand[0]; if (!o) return false; g.ready.c = w.t + cdFor(g, 'c', CFG.cds.c);
  let tx = o.x, ty = o.y; for (let k = 0; k < 12; k++) { const a = Math.random() * 6.28, dd = 1.5 + Math.random() * 1.6, nx = o.x + Math.cos(a) * dd, ny = o.y + Math.sin(a) * dd; if (walkableT(tileAt(o.f, nx, ny)) && los(o.f,o.releaseX??o.x,o.releaseY??o.y,nx,ny,(o.h||0)+.2,(o.h||0)+.2,w)) { tx = nx; ty = ny; break; } }
  o.from = { x: o.x, y: o.y, h: o.h };delete o.releaseX;delete o.releaseY;o.x = tx; o.y = ty; o.h = 0; o.flyT = w.t; o.rot = Math.random() * 6.28;
  w.noise(o, 12, 'mover'); w.sub(o, `Cae ${LOOSE_N[o.kind]} al piso`, 12);
  exposedInvs(w).filter(i => i.f === o.f && d2(i, o) <= 4).forEach(i => w.haunt(i, 2));
  ghostEvent(w, g, 'move'); w.ev('mover', { f: o.f, x: o.x, y: o.y, id: o.id }); return true;
}
function nearestProp(w, g, R) { let b = null, bd = R; for (const p of PROPS) if (p.f === g.f) { const d = d2(p, g); if (d < bd) { bd = d; b = p; } } return b; }
function gProp(w, g) {
  if (!gReady(w, g, 'c')) return false; const p = nearestProp(w, g, 2.6); if (!p) return false;
  if(p.kind==='libros')return gMover(w,g);
  g.ready.c = w.t + cdFor(g, 'c', CFG.cds.c); w.propAnim = w.propAnim || {}; w.propAnim[p.id] = w.t;
  const [txt, snd] = PROP_INFO[p.kind]; w.sub(p, txt, 14); w.noise(p, 14, 'prop'); w.ev('prop', { f: p.f, x: p.x, y: p.y, snd });
  exposedInvs(w).filter(i => i.f === p.f && roomOf(i) === roomAt(p.f, p.x, p.y)).forEach(i => w.haunt(i, 2));
  ghostEvent(w, g, 'move'); return true;
}
function gSusurro(w, g) {
  if (!gReady(w, g, 'v')) return false; g.ready.v = w.t + cdFor(g, 'v', CFG.cds.v);
  // imita la voz de alguien que no está cerca para atraer a los demás
  const far = alive(w).filter(i => !(i.f === g.f && d2(i, g) < 8)); const who = far.length ? pick(far) : null;
  const lines = ['¡Vengan, aquí está!', '¡Ayúdenme!', 'Encontré algo, vengan…', '¿Hay alguien ahí?'];
  if (who) { w.sub(g, `${who.name}: «${pick(lines)}»`, 16); g.lastLure = { f: g.f, x: g.x, y: g.y, t: w.t, as: who.name };
    alive(w).filter(i => i.bot && i !== who && i.f === g.f && d2(i, g) <= 16 && i.hidden < 0).forEach(i => { if (Math.random() < 0.55) i.ai.lure = { f: g.f, x: g.x, y: g.y, until: w.t + 12 }; }); }
  else w.sub(g, 'Un susurro sin palabras', 8);
  w.noise(g, 8, 'susurro'); ghostEvent(w, g, 'whisper'); w.ev('susurro', Object.assign({ fake: !!who }, g)); return true;
}
function gApagon(w, g) {
  if (!freqOK(g, 'e') || w.t < g.ready.n || g.state !== 'libre' || (g.hunt && !g.hunt.huida) || g.pres < CFG.apagon.cost) return false;
  g.ready.n = w.t + CFG.apagon.cd; g.pres -= CFG.apagon.cost; for (let r = 0; r < w.lights[g.f].length; r++) w.lights[g.f][r] = 0; w.fuse[g.f] = false;
  w.invs.filter(i => i.alive && i.f === g.f).forEach(i => { i.flashOffUntil = Math.max(i.flashOffUntil || 0, w.t + 4); w.haunt(i, 3); });
  w.items.filter(it => it.kind === 'vela' && it.lit && it.f === g.f).forEach(it => (it.lit = false));
  w.say(`¡Apagón en la planta ${g.f ? 'alta' : 'baja'}! Se botaron los fusibles.`, 'a'); ghostEvent(w, g, 'switch'); w.ev('apagon', g); return true;
}
const MANIFEST_SND = { pena: 'canto', llorona: 'llanto', matla: 'canto', nachito: 'risa', chaneque: 'risa', chocarrero: 'risa', cucuy: 'grito', guardian: 'quejido', nahual: 'grito', demonio: 'grito', planchada: 'quejido', tlahuel: 'grito', malaire: 'quejido' };
function gManifest(w, g) {
  if (w.t < (g.ready.k || 0) || g.state !== 'libre' || (g.hunt && !g.hunt.huida) || g.pres < CFG.manifest.cost) return false;
  const v = exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 7).sort((a, b) => d2(a, g) - d2(b, g))[0]; if (!v) return false;
  g.ready.k = w.t + CFG.manifest.cd; g.pres -= CFG.manifest.cost; g.lastMan = { f: g.f, x: g.x, y: g.y, t: w.t }; g.revealUntil = w.t + CFG.manifest.show; const snd = MANIFEST_SND[g.def.id] || 'quejido';
  exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 7 && sees(i, g, 7,w)).forEach(i => w.haunt(i, CFG.manifest.dmg));
  w.sub(g, { canto: 'Un canto lejano, de golpe', llanto: '¡Un llanto desgarrado!', risa: '¡Una risa aguda!', grito: '¡UN GRITO!', quejido: 'Un quejido largo' }[snd], 14);
  w.ev('manifest', { f: g.f, x: g.x, y: g.y, snd }); ghostEvent(w, g, 'manifest'); return true;
}
// alucinación: alguien solo ve a un compañero que no está ahí
function gHallu(w, g) {
  if (w.t < (g.ready.j || 0) || g.state !== 'libre' || g.hunt || g.pres < CFG.hallu.cost) return false;
  const vs = exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 14 && (isolated(w, i) || alive(w).length === 1)); const v = vs.find(i => !i.bot) || vs[0]; if (!v) return false;
  if (!makeHallu(w, v, true)) return false; g.ready.j = w.t + CFG.hallu.cd; g.pres -= CFG.hallu.cost; return true;
}
// Posesión: el ánima mueve el cuerpo de alguien; el único rastro visible es que no proyecta sombra
function gPossess(w, g) {
  if (w.t < (g.ready.p || 0) || g.state !== 'libre' || g.hunt || g.pres < CFG.possess.cost || w.possess) return false;
  const vs = exposedInvs(w).filter(i => i.f === g.f && d2(i, g) <= 6 && !(w.ritual && w.ritual.by === i)).sort((a, b) => d2(a, g) - d2(b, g)); const v = vs[0]; if (!v) return false;
  g.ready.p = w.t + CFG.possess.cd; g.pres -= CFG.possess.cost; const keys = ['w', 'a', 's', 'd', 'q', 'e'];
  w.possess = { who: v.id, until: w.t + CFG.possess.dur, t0: w.t, seq: Array.from({ length: 7 }, () => pick(keys)), idx: 0, goal: null, pause: 0 };
  g.state = 'poseyendo'; g.f = v.f; g.x = v.x; g.y = v.y; v.possessed = true; v.flash = false; if (handItem(v)) dropItem(w, v, v.hand);
  w.ev('possess', { who: v.id }); if (!g.bot) w.say(`Poseíste a ${v.name}: muévelo con WASD. Nadie lo nota… salvo su sombra.`, 'g'); return true;
}
function endPossess(w) { const P = w.possess; if (!P) return; const v = w.invs[P.who], g = w.g; if (v) { v.possessed = false; v.ai.state = v.ai.state === 'name' ? 'explore' : v.ai.state; } g.state = 'libre'; if (v) { g.f = v.f; g.x = v.x + rnd(-0.6, 0.6); g.y = v.y + rnd(-0.6, 0.6); snapWalkable(w, g); } w.possess = null; w.ev('unpossess', { who: P.who }); }
function possessTick(w, dt, human) {
  const P = w.possess; if (!P) return; const v = w.invs[P.who], g = w.g;
  if (!v || !v.alive || w.t >= P.until || w.phase !== 'night') { endPossess(w); return; }
  w.haunt(v, CFG.possess.drain * dt); g.f = v.f; g.x = v.x; g.y = v.y;
  if (!v.bot && human && human.press) { const p = human.press, want = P.seq[P.idx]; for (const k of ['w', 'a', 's', 'd', 'q', 'e']) if (p.has(k)) { if (k === want) { P.idx++; P.until -= 2.2; w.ev('rezo', { ok: true }); if (P.idx >= P.seq.length) { endPossess(w); w.say('Rezaste completo: el ánima salió de tu cuerpo.', 'a'); return; } } else { P.until += 0.8; w.ev('rezo', { ok: false }); } break; } }
  // el ánima (persona) mueve el cuerpo; el bot lo mueve raro: de espaldas, se detiene frente a la pared y avienta cosas
  if (!g.bot && human && (human.mx || human.my)) { const l = Math.hypot(human.mx, human.my); tryMove(w, v, human.mx / l * CFG.walk * 0.8 * dt, human.my / l * CFG.walk * 0.8 * dt); v.face = Math.atan2(human.my, human.mx) + Math.PI; return; }
  if (P.pause > 0) { P.pause -= dt; return; }
  if (!P.goal || d2(P.goal, v) < 0.5) { const r = roomOf(v); P.goal = r >= 0 ? randomIn(v.f, r) : { f: v.f, x: v.x + rnd(-2, 2), y: v.y + rnd(-2, 2) }; if (Math.random() < 0.4) { P.pause = rnd(2, 4); v.face += Math.PI; }
    const o = w.loose.find(o => o.f === v.f && d2(o, v) < 2.2 && w.t - o.flyT > 2); if (o && Math.random() < 0.6) { const a = Math.random() * 6.28; o.from = { x: o.x, y: o.y, h: o.h }; const nx = o.x + Math.cos(a) * 1.6, ny = o.y + Math.sin(a) * 1.6; if (walkableT(tileAt(o.f, nx, ny))) { o.x = nx; o.y = ny; } o.h = 0; o.flyT = w.t; w.noise(o, 10, 'mover'); w.ev('mover', { f: o.f, x: o.x, y: o.y, id: o.id }); } }
  const dx = P.goal.x - v.x, dy = P.goal.y - v.y, l = Math.hypot(dx, dy) || 1; if (!walkableT(tileAt(v.f, P.goal.x, P.goal.y)) || navTo(w, v, P.goal, CFG.walk * 0.55, dt)) P.goal = null; v.face = Math.atan2(dy, dx) + Math.PI; // camina de espaldas
}
// Anomalía: algo aparece o cambia donde nadie está mirando
function gAnomaly(w, g) {
  if (w.t < (g.ready.y || 0) || g.state !== 'libre' || g.hunt || g.pres < CFG.anomaly.cost) return false;
  const watched = p => alive(w).some(i => i.f === p.f && i.hidden < 0 && sees(i, p, 14,w));
  const r = roomOf(g); if(r<0||!ROOMS[g.f][r].home)return false;let p=null;
  for (let k = 0; k < 10 && !p; k++) { const q = Math.random() < 0.6 && SURFACES[g.f][r].length ? onFurniture(g.f, r) : Object.assign(randomIn(g.f, r), { h: 0 }); if (d2(q, g) < 4.5 && !watched(q)) p = q; }
  if (!p) { if (!g.bot) w.say('Anomalía: alguien está mirando. Hazlo donde no te vean.', 'g'); return false; }
  g.ready.y = w.t + CFG.anomaly.cd; g.pres -= CFG.anomaly.cost;
  const near = w.loose.filter(o => o.f === g.f && d2(o, g) < 5 && !watched(o)); const kinds = ['aparece', 'aparece']; if (near.length) kinds.push('flota', 'flota'); if (near.some(o => o.kind === 'cuadro')) kinds.push('invertido'); if (w.doors.some(d => d.f === g.f && d2(d, g) < 5 && !watched(d))) kinds.push('puerta');
  const kind = pick(kinds); let at = p;
  if (kind === 'aparece') { const o = { id: w.loose.length, kind: pick(ANOM_KINDS), f: p.f, x: p.x, y: p.y, h: p.h, rot: Math.random() * 6.28, flyT: -99, from: null, anom: true }; w.loose.push(o); at = o; }
  else if (kind === 'flota') { const o = pick(near); o.h = 1.1 + Math.random() * 0.6; o.float = true; o.flyT = -99; at = o; }
  else if (kind === 'invertido') { const o = near.find(o => o.kind === 'cuadro'); o.upside = true; at = o; }
  else { const d = w.doors.filter(d => d.f === g.f && d2(d, g) < 5 && !watched(d))[0]; d.closed = !d.closed; at = d; }
  if (w.anoms.length >= CFG.anomaly.max) w.anoms.shift();
  w.anoms.push({ f: at.f, x: at.x, y: at.y, kind, t: w.t, seen: new Set() }); w.ev('anomaly', { f: at.f, x: at.x, y: at.y, kind }); return true;
}
// El director del terror analógico: cosas raras para quien juega (no cambian las lecturas)
function analogTick(w, dt) {
  const me = w.invs.find(i => !i.bot && i.alive); if (!me || w.phase !== 'night' || w.g.hunt || w.possess) return;
  for (const a of w.anoms) if (a.f === me.f && !a.seen.has(me.id) && sees(me, a, 7,w)) { a.seen.add(me.id); w.haunt(me, 3); w.ev('anomSeen', { f: a.f, x: a.x, y: a.y }); }
  if (w.t < w.analogNext) return; w.analogNext = w.t + rnd(CFG.analog.gap[0], CFG.analog.gap[1]) * (0.55 + 0.45 * me.san / 100);
  const opts = ['eco', 'loteria', 'rezo', 'reloj', 'sistema']; const h = handItem(me); if (h && ITEMS[h.kind].elec) opts.push('herramienta', 'herramienta'); if (isolated(w, me) && !w.hallu) opts.push('doble', 'doble');
  const k = pick(opts);
  if (k === 'doble') makeHallu(w, me);
  else if (k === 'herramienta') { h.msg = { text: pick(['NO VOLTEES', 'NO VOLTEES', 'DETRÁS DE TI', 'SIGUES AQUÍ', '3:33', 'YA TE VI']), until: w.t + 6 }; w.ev('toolMsg', { who: me.id, text: h.msg.text }); }
  else if (k === 'sistema') { const b = w.invs.filter(i => i.bot && i.alive); if (b.length) w.ev('fakeSys', { name: pick(b).name }); }
  else if (k === 'eco') { const l = w.lines.length ? pick(w.lines) : null; w.ev('eco', { text: l ? l.replace(/^[^«]*«|»$/g, '') : 'Ven… aquí…' }); }
  else w.ev(k, {});
}
function makeHallu(w, v, viaGhost) {
  const mates = w.invs.filter(o => o !== v); const as = mates.length ? pick(mates) : v; let p = null;
  for (let k = 0; k < 16 && !p; k++) { const a = v.face + (Math.random() - 0.5) * 1.4, dd = 4 + Math.random() * 6, q = { f: v.f, x: v.x + Math.cos(a) * dd, y: v.y + Math.sin(a) * dd }; if (walkableT(tileAt(q.f, q.x, q.y)) && los(q.f, v.x, v.y, q.x, q.y)) p = q; }
  if (!p) return false;
  w.hallu = { who: v.id, char: as.char, name: as.name, f: p.f, x: p.x, y: p.y, until: w.t + rnd(2.5, 6), t0: w.t, variant: Math.random() < 0.1 ? pick(['largo', 'invertido', 'brillo']) : 'normal', beh: pick(['quieto', 'alejarse', 'acercarse', 'espejo']), vanish: pick(['mirar', 'acercarse', 'parpadeo']) };
  w.ev('hallu', { who: v.id }); return true;
}
function gInterf(w, g) {
  if (w.t < g.ready.g || g.state !== 'libre' || (g.hunt && !g.hunt.huida) || g.pres < CFG.interf.cost) return false;
  g.ready.g = w.t + CFG.interf.cd; g.pres -= CFG.interf.cost; g.interfUntil = w.t + CFG.interf.dur; w.ev('interf', g); return true;
}
function gMudanza(w, g) {
  const r = roomOf(g); if (g.mudanzas <= 0 || g.hunt || g.state !== 'libre' || r < 0 || isHall(g.f, r) || ROOMS[g.f][r].id === 'vacio' || (g.home.f === g.f && g.home.r === r) || g.pres < 15) return false;
  g.mudanzas--; g.pres -= 10; g.home = { f: g.f, r }; g.occ = {}; w.say(`Te mudaste a ${ROOMS[g.f][r].n}. El rastro viejo se enfría en unos 2 minutos (te quedan ${g.mudanzas}).`, 'g'); w.sub(g, 'Un frío se mueve por la casa', 12); w.ev('mudanza', g); return true;
}
function huntInfo(w, g) {
  const a = alive(w); if (!a.length) return null; const rule = g.def.hunt, thr = huntThr(w, rule), avg = a.reduce((s, i) => s + i.san, 0) / a.length;
  const txt = { avg: `cordura promedio ${avg.toFixed(0)} ≤ ${thr}`, isolated: `alguien solo con cordura ≤ ${thr}`, guardian: 'alguien en tu cuarto con ≤ 60, o promedio ≤ 45', healthiest: `todos con cordura ≤ ${thr} (el más sano tiene ${Math.max(...a.map(i => i.san)).toFixed(0)})`, weakest: `alguien con cordura ≤ ${thr} (el más bajo tiene ${Math.min(...a.map(i => i.san)).toFixed(0)})` }[rule.type];
  return { ok: huntRuleOK(w, g), txt, wait: Math.max(0, g.huntReady - w.t), pres: g.pres >= CFG.huntMinPres };
}
function gSpecial(w, g) {
  const s = g.def.special; if (!s || w.t < g.ready.r || w.t < g.stunUntil || !(g.state === 'libre') || (g.hunt && !s.inHunt && !g.hunt.huida)) return false;
  if (s.use(w, g)) { g.ready.r = w.t + s.cd; ghostEvent(w, g, 'special'); return true; } return false;
}
function gEspanto(w, g) { if (w.phase !== 'huida' || g.espantoUsed) return false; g.espantoUsed = true; const e = g.def.espanto; if (e.use) e.use(w, g); else alive(w).forEach(i => w.haunt(i, 15)); w.say(`ESPANTO: ${e.n}. ${e.d}`, 'a'); w.ev('espanto'); return true; }

// Percepción del ánima
function perceives(w, g, i) {
  if (!i.alive || i.escaped || i.f !== g.f || w.t < g.blindUntil) return false;
  const d = d2(i, g);
  if (i.hidden >= 0) return elecOnW(w, i) && d <= 6;
  if (g.xray) return true;
  const v = g.def.vision(w, g, i);
  if (d <= v.near && los(g.f,g.x,g.y,i.x,i.y,1.55+(elevOf(g)-g.f)*3.8,1.55+(elevOf(i)-i.f)*3.8,w)) return true;
  if (d <= v.far && d >= v.farMin && angDiff(Math.atan2(i.y - g.y, i.x - g.x), g.face) <= Math.PI / 3 && los(g.f,g.x,g.y,i.x,i.y,1.55+(elevOf(g)-g.f)*3.8,1.55+(elevOf(i)-i.f)*3.8,w)) return true;
  if (i.san <= 25) return true;
  return false;
}
const elecOnW = (w, i) => (i.flash && w.t >= i.flashOffUntil) || (handItem(i) && !!ITEMS[handItem(i).kind].elec);

// ---------- Bot: investigador ----------
function botInv(w, b, dt) {
  const g = w.g, ai = b.ai; const sp = (w.t < b.slowUntil ? 0.7 : 1);
  if (w.phase === 'huida') { if (b.hidden >= 0 && (!g.hunt || !perceives(w, g, b))) b.hidden = -1; const run = b.stam > 5 && !b.tired; moveBot(w, b, EXIT, (run ? CFG.sprint : CFG.walk) * sp, dt, run); return; }
  if (b.hidden >= 0) { if (!g.hunt && w.t > ai.unhideAt) { b.hidden = -1; b.flash = true; } return; }
  if (b.reading) return;
  if (w.ritual && w.ritual.by === b) return;
  // cordura
  const teK = b.slots.findIndex(s => s && s.kind === 'te'); if (b.san < 45 && teK >= 0) { b.hand = teK; useItem(w, b); }
  const lmK = b.slots.findIndex(s => s && s.kind === 'limpia'); if (b.san < 40 && teK < 0 && lmK >= 0) { b.hand = lmK; useItem(w, b); }
  // cacería
  const gSeen = g.state !== 'despertando' && g.f === b.f && (d2(g, b) < 3 || (g.hunt && sees(b, g, 12,w)) || w.t < g.revealUntil && d2(g, b) < 10);
  if (g.hunt && gSeen) {
    if (!ai.react) ai.react = w.t + rnd(0.4, 1.3);
    if (w.t >= ai.react) {
      const rk = b.slots.findIndex(s => s && s.kind === 'rosario'); if (rk >= 0 && d2(g, b) < 2) { b.hand = rk; if (useItem(w, b)) return; }
      const ck = b.slots.findIndex(s => s && s.kind === 'copal'); if (ck >= 0 && d2(g, b) < 4) { b.hand = ck; b.face = Math.atan2(g.y - b.y, g.x - b.x); throwItem(w, b, d2(g, b)); return; }
      // escondite cercano
      let best = -1, bd = 19; w.spotsActive.forEach(k => { const s = SPOTS[k]; if (s.f !== b.f || w.invs.some(o => o.alive && o.hidden === k)) return; const pl = pathLen(w, b, { f: s.f, x: s.hx, y: s.hy }); if (pl < bd && d2({ x: s.hx, y: s.hy }, g) > 2.5) { bd = pl; best = k; } });
      if (best >= 0) { const s = SPOTS[best]; const tg = { f: s.f, x: s.hx, y: s.hy }; if (Math.hypot(s.hx - b.x, s.hy - b.y) < 0.6) { b.hidden = best; b.flash = false; const e = b.slots.findIndex(x => !x || !ITEMS[x.kind].elec); b.hand = e >= 0 ? e : b.hand; ai.unhideAt = w.t + rnd(2, 4); return; }
        const run = !b.tired && b.stam > 5; moveBot(w, b, tg, (run ? CFG.sprint : CFG.walk) * sp, dt, run); return; }
      if (!ai.flee || w.t > ai.fleeUntil) { let bp = null, bdist = -1; ROOM_LIST.filter(r => r.f === b.f).forEach(r => { const c = ROOM_CENTER[r.f][r.r]; if (!c) return; const dd = pathLen(w, c, g); if (dd < 999 && dd > bdist) { bdist = dd; bp = c; } }); ai.flee = bp; ai.fleeUntil = w.t + 3; }
      const run = !b.tired && b.stam > 5; moveBot(w, b, ai.flee, (run ? CFG.sprint : CFG.walk) * sp, dt, run); return;
    }
  } else ai.react = 0;
  // reaccionar a la actividad: grabadora al oír algo, EMF en mano al caminar
  { const lm = g.lastMan && w.t - g.lastMan.t < 8 ? g.lastMan : (g.lastAct && w.t - g.lastAct.t < 8 ? g.lastAct : null); const gk = b.slots.findIndex(s => s && s.kind === 'grab');
    if (lm && gk >= 0 && lm.f === b.f && d2(lm, b) < 9) { b.hand = gk; if (w.t >= (b.slots[gk].cd || 0)) useItem(w, b); }
    else if (!ai.study) { const ek = b.slots.findIndex(s => s && s.kind === 'emf'); if (ek >= 0) b.hand = ek; } }
  // recoger consumibles cercanos
  if (stairAt(b.x,b.y)<0&&b.slots.filter(x => !x).length >= 1 && !(b.f === 0 && b.y >= 39)) { const it = w.items.find(t => !t.holder && t.f === b.f && ['te', 'rosario', 'copal'].includes(t.kind) && !b.slots.some(x => x && x.kind === t.kind) && d2(t, b) < 6);
    if (it) { if (d2(it, b) < 1.2) { const e = b.slots.indexOf(null); b.hand = e; pickUp(w, b); } else { moveBot(w, b, approach(it), CFG.walk * sp, dt); return; } } }
  ai.think -= dt;
  if (ai.lure && w.t < ai.lure.until && !g.hunt) { if (moveBot(w, b, ai.lure, CFG.walk * sp, dt) || d2(ai.lure, b) < 1.2 && b.f === ai.lure.f) { if (ai.lure.fuse) resetFuse(w, b); ai.lure = null; } return; }
  // estados
  if (botResupply(w, b, dt, sp)) return;
  if (ai.state === 'gear') {
    const want = ai.wantTools.filter(k => !b.slots.some(s => s && s.kind === k));
    const it = w.items.find(t => !t.holder && want.includes(t.kind));
    if (!it || !b.slots.includes(null)) { ai.state = 'explore'; return; }
    if (d2(it, b) < 1.2 && it.f === b.f) { b.hand = b.slots.indexOf(null); pickUp(w, b); } else moveBot(w, b, approach(it), CFG.walk * sp, dt);
    return;
  }
  const home = w.team.home;
  if (!home && (ai.state === 'setup' || ai.state === 'watch')) ai.state = 'explore';
  if (home && ai.state === 'explore') ai.state = 'setup';
  if (ai.state === 'setup') {
    let placeable = b.slots.findIndex(s => s && ['cruz', 'ceniza'].includes(s.kind)); if (placeable < 0) placeable = b.slots.findIndex(s => s && ['espejo', 'cam', 'gases'].includes(s.kind) && !(s.kind === 'emf' && b.slots.some(x => x && ['grab', 'uv', 'termo'].includes(x.kind)) === false && Math.random() < 0));
    if (placeable < 0) { ai.state = 'watch'; return; }
    if (!ai.place || ai.placeK !== placeable) { ai.placeK = placeable; const kind = b.slots[placeable].kind; const c = ROOM_CENTER[home.f][home.r];
      if (kind === 'uv') { const d = w.doors.filter(d => d.f === home.f).sort((a, b2) => d2(a, c) - d2(b2, c))[0]; let p = randomIn(home.f, home.r); for (let k = 0; k < 10 && (d2(p, d) < 2.5 || d2(p, d) > 7); k++) p = randomIn(home.f, home.r); ai.place = p; ai.aim = d; }
      else { ai.place = randomIn(home.f, home.r); ai.aim = c; } }
    if (moveBot(w, b, ai.place, CFG.walk * sp, dt) || d2(ai.place, b) < 0.5 && b.f === ai.place.f) { b.face = Math.atan2(ai.aim.y - b.y, ai.aim.x - b.x); dropItem(w, b, ai.placeK); ai.place = null; }
    return;
  }
  if (ai.state === 'watch') {
    if (!ai.goal || ai.think <= 0 || (d2(ai.goal, b) < 0.6 && b.f === ai.goal.f)) {
      ai.think = rnd(8, 14);
      // revisar grabadora o cámara dejadas, o vigilar desde fuera
      const rev = w.items.find(t => !t.holder && t.kind === 'cam' && t.photo && t.f === b.f && d2(t, b) < 14);
      if (rev && Math.random() < 0.6) ai.goal = Object.assign({ review: rev }, approach(rev));
      else { const c = ROOM_CENTER[home.f][home.r]; const ring = ROOM_LIST.filter(r => r.f === home.f && !(r.r === home.r) && ROOM_CENTER[r.f][r.r] && d2(ROOM_CENTER[r.f][r.r], c) < 18); ai.goal = Math.random() < 0.35 ? randomIn(home.f, home.r) : ROOM_CENTER[pick(ring).f][pick(ring).r] || randomIn(home.f, home.r); }
    }
    if (ai.goal.review && d2(ai.goal.review, b) < 1.25 && b.f === ai.goal.f) { const it = ai.goal.review; if (b.slots.includes(null) && !it.holder) { b.hand = b.slots.indexOf(null); pickUp(w, b); useItem(w, b); b.face = Math.atan2(ROOM_CENTER[home.f][home.r].y - b.y, ROOM_CENTER[home.f][home.r].x - b.x); dropItem(w, b, b.hand); } ai.goal = null; return; }
    if (botStudy(w, b, home, dt, sp)) return;
    moveBot(w, b, ai.goal, CFG.walk * sp, dt); lightUp(w, b); return;
  }
  // explorar
  if (!ai.goal || ai.think <= 0 || (d2(ai.goal, b) < 0.6 && b.f === ai.goal.f)) {
    const r = roomOf(b); if (r >= 0) w.team.visited.add(b.f + ':' + r);
    const td = b.ai.termoDone || {}, hasT = b.slots.some(s => s && s.kind === 'termo');
    const un = HOME_CHOICES.filter(h => hasT ? (td[h.f + ':' + h.r] || -999) < w.t - 150 : !w.team.visited.has(h.f + ':' + h.r)); const tg = un.length ? un.sort((a, c) => pathLen(w, b, ROOM_CENTER[a.f][a.r]) - pathLen(w, b, ROOM_CENTER[c.f][c.r]))[Math.min(un.length - 1, (Math.random() * 3) | 0)] : pick(HOME_CHOICES);
    ai.goal = randomIn(tg.f, tg.r); ai.think = rnd(10, 16);
  }
  if (botTermoSweep(w, b, dt)) return; lightUp(w, b); moveBot(w, b, ai.goal, CFG.walk * sp, dt);
}
// explorar: detenerse en cada cuarto con el termómetro quieto hasta que se asiente
function botTermoSweep(w, b, dt) {
  if(stairAt(b.x,b.y)>=0)return false;
  const k = b.slots.findIndex(s => s && s.kind === 'termo'), r = roomOf(b); if (k < 0 || r < 0 || isHall(b.f, r) || ['afuera', 'zaguan'].includes(ROOMS[b.f][r].id)) return false;
  const key = b.f + ':' + r; b.ai.termoDone = b.ai.termoDone || {}; if ((b.ai.termoDone[key] || -99) > w.t - 45) return false;
  const c = w.cold[b.f][r]; b.hand = k; if (!b.ai.sweep || b.ai.sweep.key !== key) b.ai.sweep = { key, p: Math.random() < 0.6 && c ? { f: b.f, x: c.x + rnd(-1, 1), y: c.y + rnd(-1, 1) } : randomIn(b.f, r), t: 0 };
  const sw = b.ai.sweep; if (d2(sw.p, b) > 0.5) { if (navTo(w, b, sw.p, CFG.walk, dt) || !walkableT(tileAt(sw.p.f, sw.p.x, sw.p.y))) sw.p = { f: b.f, x: b.x, y: b.y }; return true; }
  sw.t += dt; if (sw.t > CFG.termo.settle + 2) { b.ai.termoDone[key] = w.t; b.ai.sweep = null; } return true;
}
// en la guarida: provocar y leer (grabadora a oscuras, termómetro en el punto frío, UV a las puertas)
function botStudy(w, b, home, dt, sp) {
  const ai = b.ai, inRoom = b.f === home.f && roomOf(b) === home.r, g = w.g;
  if (!ai.study || w.t > ai.study.until) { const opts = []; if (b.slots.some(s => s && s.kind === 'grab')) opts.push('grab', 'grab'); if (b.slots.some(s => s && s.kind === 'termo')) opts.push('termo'); if (b.slots.some(s => s && s.kind === 'uv')) opts.push('uv'); if (b.slots.some(s => s && s.kind === 'emf')) opts.push('emf');
    ai.study = opts.length && Math.random() < 0.7 ? { kind: pick(opts), until: w.t + rnd(20, 34), p: null } : null; if (!ai.study) return false; }
  const st = ai.study, k = b.slots.findIndex(s => s && s.kind === st.kind); if (k < 0) { ai.study = null; return false; } b.hand = k;
  if (!st.p) { const c = w.cold[home.f][home.r]; st.p = st.kind === 'termo' && c ? { f: home.f, x: c.x, y: c.y } : randomIn(home.f, home.r); if (!walkableT(tileAt(st.p.f, st.p.x, st.p.y))) st.p = randomIn(home.f, home.r); }
  if (st.kind === 'uv') { const d = w.doors.filter(d => d.f === home.f).sort((a, c) => d2(a, ROOM_CENTER[home.f][home.r]) - d2(c, ROOM_CENTER[home.f][home.r]))[0]; if (d) { if (d2(d, b) > 2.5) { navTo(w, b, d, CFG.walk * sp, dt); return true; } b.face = Math.atan2(d.y - b.y, d.x - b.x); return true; } }
  if (!inRoom || d2(st.p, b) > 0.6) { navTo(w, b, st.p, CFG.walk * sp, dt); return true; }
  if (st.kind === 'grab') { const r = roomOf(b); if (w.lights[b.f][r] && SWITCHES[b.f][r] && Math.random() < 0.3) toggleLight(w, b); const it = b.slots[k]; if (w.t >= (it.cd || 0) && Math.random() < 0.5) useItem(w, b); }
  return true;
}
function termoUse(w, b) { const r = roomOf(b); const k = b.slots.findIndex(s => s && s.kind === 'termo'); if (k < 0 || r < 0 || isHall(b.f, r)) return; const key = b.f + ':' + r; b.ai.termoDone = b.ai.termoDone || {}; if ((b.ai.termoDone[key] || -99) > w.t - 40) return; b.ai.termoDone[key] = w.t; b.hand = k; useItem(w, b); }
function lightUp(w, b) { const r = roomOf(b); if (r >= 0 && !w.lights[b.f][r] && !isHall(b.f, r) && ROOMS[b.f][r].id !== 'vacio' && Math.random() < 0.02) { if (!w.fuse[b.f]) { if (b.f === 0 && Math.random() < 0.2) b.ai.lure = { f: 0, x: FUSE.x, y: FUSE.y, until: w.t + 25, fuse: true }; return; } if (w.burnt[b.f][r]) { const fk = b.slots.findIndex(s => s && s.kind === 'foco'); if (fk >= 0) { b.hand = fk; toggleLight(w, b); } return; } toggleLight(w, b); } }
function moveBot(w, b, tg, speed, dt, run) { if (run) { b.stam -= CFG.stamDrain * dt; if (b.stam <= 0) { b.stam = 0; b.tired = true; } } return navTo(w, b, tg, speed, dt); }
function botTeam(w) {
  const humanAlive = w.invs.some(i => !i.bot && i.alive && !i.escaped); const K = botK(w), c = w.objDiscard ? candidates(w, true, K) : candidates(w, false, K), p = pruebas(w, K); const speaker = alive(w).find(i => i.bot); if (!speaker || w.phase !== 'night') return;
  const left = w.opt.night - w.t;
  if ((p >= 3 || (p >= 2 && c.length === 1) || (left < 90 && p >= 1))) {
    if (humanAlive) { if (!w.team.hinted) { w.say(`${speaker.name}: «${c.length === 1 ? 'Por la libreta, tiene que ser ' + c[0].n : 'Puede ser ' + c.map(x => x.n).join(', ')}. Vamos al altar».`, 'a'); w.team.hinted = true; } return; }
    const nm = alive(w).sort((a, b) => pathLen(w, a, ALTAR_POS) - pathLen(w, b, ALTAR_POS))[0];
    nm.ai.state = 'name'; nm.ai.nameId = pick(c).id;
  }
}

// ---------- Bot: ánima (máquina de estados con motivos) ----------
// Rondar (tranquila) · Acechar (oye o le hablan) · Alimentarse (hambre: asusta a quien está solo o a oscuras) · Engañar (la están estudiando) · Cazar (puede y debe)
function ghostMotive(w, g) {
  const ai = g.ai, hunger = 1 - g.pres / g.def.presMax, home = g.home;
  const inHomeInvs = alive(w).filter(i => i.f === home.f && roomOf(i) === home.r).length;
  const toolsHome = w.items.filter(it => !it.holder && TOOLS.includes(it.kind) && it.f === home.f && roomAt(it.f, it.x, it.y) === home.r).length;
  const hcM = ROOM_CENTER[home.f][home.r], TERR = 12; // territorial: solo acecha a quien se mete cerca de su guarida
  const prey = alive(w).filter(i => i.hidden < 0 && i.f === home.f && Math.hypot(i.x - hcM.x, i.y - hcM.y) < TERR).map(i => ({ i, s: (isolated(w, i) ? 2 : 0) + (litAt(w, i) ? 0 : 1.5) + (100 - i.san) / 40 + (i.f === g.f ? 1 : 0) - (i.f === g.f ? d2(i, g) / 12 : 2) + (i.f === ALTAR_POS.f && d2(i, ALTAR_POS) < 3 && i.ai.stillT && w.t > i.ai.stillT ? 1.5 : 0) })).sort((a, b) => b.s - a.s)[0];
  const S = { rondar: 0.7 + (inHome(g) ? -Math.min(0.4, (ai.restless || 0) / 120) : 0), acechar: g.lastAsk && w.t - g.lastAsk.t < 12 && g.lastAsk.f === home.f && Math.hypot(g.lastAsk.x - hcM.x, g.lastAsk.y - hcM.y) < TERR + 4 ? 1.1 : 0, alimentarse: prey && hunger > 0.5 ? (hunger - 0.5) * 2.4 + prey.s * 0.08 : 0, enganar: (inHomeInvs >= 2 ? 0.6 : 0) + toolsHome * 0.15 + (pruebas(w) >= 2 ? 0.4 : 0), cazar: canHunt(w, g) ? 0.5 + hunger + (g.urge || 0) / 60 : 0 };
  return { state: Object.keys(S).sort((a, b) => S[b] - S[a])[0], prey: prey && prey.i, S };
}
function botGhost(w, g, dt) {
  const ai = g.ai, sp = ghostSpeed(w, g);
  if (g.returning) return;
  let seen = null, sd = 1e9; for (const i of alive(w)) if (g.perceived.has(i)) { const d = d2(i, g); if (d < sd) { sd = d; seen = i; } }
  if (seen) { if (!ai.target || w.t - ai.target.t > 3) ai.seenSince = w.t; ai.target = { f: seen.f, x: seen.x, y: seen.y, t: w.t, who: seen }; }
  const heard = g.heard.length ? g.heard[g.heard.length - 1] : null;
  if (w.phase === 'huida') {
    if (!g.espantoUsed && (seen && sd < 10 || alive(w).some(i => i.f === 0 && d2(i, ZAG) < 6))) gEspanto(w, g);
    if (g.def.special && g.def.special.bot(w, g)) gSpecial(w, g);
    const near = alive(w).sort((a, b) => (a.f !== g.f) - (b.f !== g.f) || d2(a, g) - d2(b, g))[0];
    navTo(w, g, seen || (ai.target && w.t - ai.target.t < 6 ? ai.target : null) || near || { f: 0, x: 22.5, y: 34.5 }, sp, dt); return;
  }
  if (w.ritual && !g.hunt) { const by = w.ritual.by; if (g.f === by.f && d2(g, by) <= CFG.chill.r) gChill(w, g); if (g.f === by.f && d2(g, by) <= 7) gManifest(w, g); navTo(w, g, by, ghostSpeed(w, g) * 1.3, dt); return; }
  if (inHome(g) && !g.hunt) ai.restless = (ai.restless || 0) + dt; else ai.restless = Math.max(0, (ai.restless || 0) - dt * 2);
  ai.think -= dt; if (ai.think <= 0 || !ai.mot) { ai.think = 1.2; ai.mot = ghostMotive(w, g); g.mood = ai.mot.state; }
  const M = ai.mot, free = w.t >= ai.nextAct, prey = M.prey;
  const s0 = g.def.special; if (free && s0 && w.t >= g.ready.r && (!g.hunt || s0.inHunt) && s0.bot(w, g)) { if (gSpecial(w, g)) ai.nextAct = w.t + actGap(w); }
  if (g.hunt) {
    const tg = seen || (ai.target && w.t - ai.target.t < 5 ? ai.target : null) || (heard && w.t - heard.t < 5 ? heard : null) || (prey && prey.f === g.f ? prey : null);
    if (tg) navTo(w, g, tg, sp, dt); else { if (!ai.wander || d2(ai.wander, g) < 0.6 || ai.wander.f !== g.f) ai.wander = randomIn(g.f, pick(ROOM_LIST.filter(r => r.f === g.f && ROOM_CENTER[r.f][r.r])).r); navTo(w, g, ai.wander, sp, dt); }
    return;
  }
  switch (M.state) {
    case 'cazar': if (startHunt(w, g)) { ai.nextAct = w.t + actGap(w); return; } // si no pudo, se alimenta
    // falls through
    case 'alimentarse': {
      if (!prey) break; const far = prey.f !== g.f || d2(prey, g) > 4.5;
      if (far) { if (free && Math.random() < dt * 0.05 && gAnomaly(w, g)) ai.nextAct = w.t + actGap(w); navTo(w, g, prey, sp, dt); if (prey.f === g.f && d2(prey, g) < 14 && free && Math.random() < dt * 0.25 && gHallu(w, g)) ai.nextAct = w.t + actGap(w); return; }
      if (free && isolated(w, prey) && Math.random() < 0.15 && gPossess(w, g)) { ai.nextAct = w.t + actGap(w); return; }
      if (free) { const opts = []; if (gReady(w, g, 'q')) opts.push('q'); if (gReady(w, g, 'e')) opts.push('e'); if (gReady(w, g, 'c')) opts.push('c'); if (w.t >= (g.ready.k || 0)) opts.push('k', 'k');
        const k = opts.length ? pick(opts) : null; const ok = k === 'k' ? gManifest(w, g) : k ? doPheno(w, g, k) : false; if (ok) ai.nextAct = w.t + actGap(w) * 1.3; }
      const a = w.t * 0.7 + g.x; steer(w, g, prey.x + Math.cos(a) * 3, prey.y + Math.sin(a) * 3, sp * 0.6, dt); return; }
    case 'acechar': navTo(w, g, g.lastAsk, sp, dt); if (free && d2(g, g.lastAsk) < 6 && Math.random() < dt * 0.4) { if (doPheno(w, g, pick(['v', 'e', 'c']))) ai.nextAct = w.t + actGap(w); } return;
    case 'enganar': {
      if (free && w.t >= g.ready.g && alive(w).some(i => i.f === g.f && d2(i, g) <= CFG.interf.r && handItem(i) && ITEMS[handItem(i).kind].elec)) { if (gInterf(w, g)) { ai.nextAct = w.t + actGap(w); return; } }
      if (free && gReady(w, g, 'f') && Math.random() < dt * 0.5) { if (gPortazo(w, g)) { ai.nextAct = w.t + actGap(w); ai.hush = w.t + 15; return; } } // "se fue"... pero se queda quieta
      if (w.t < (ai.hush || 0)) { if (free && Math.random() < dt * 0.2) gAnomaly(w, g); return; }
      if (free && gReady(w, g, 'v') && Math.random() < dt * 0.3) { if (gSusurro(w, g)) ai.nextAct = w.t + actGap(w); }
      if (g.mudanzas > 0 && pruebas(w, botK(w)) >= 2 && !ai.reloc && Math.random() < dt * 0.02) ai.reloc = pick(HOME_CHOICES.filter(h => !(h.f === g.home.f && h.r === g.home.r)));
      if (ai.reloc) { if (g.f === ai.reloc.f && roomOf(g) === ai.reloc.r) { gMudanza(w, g); ai.reloc = null; } else { navTo(w, g, ROOM_CENTER[ai.reloc.f][ai.reloc.r], sp, dt); return; } }
      break; }
  }
  // rondar: su guarida y los cuartos vecinos; la inquietud la empuja a salir
  if (!ai.wander || (d2(ai.wander, g) < 0.6 && ai.wander.f === g.f) || w.t > ai.wanderUntil) {
    const hc = ROOM_CENTER[g.home.f][g.home.r]; const near = homeNeighbors(w, g.home);
    const r = near.length && ((ai.restless || 0) > 60 || Math.random() < 0.15) ? pick(near) : g.home; ai.wander = randomIn(r.f, r.r); ai.wanderUntil = w.t + 20; // solo sale a los cuartos con puerta a su guarida
    const pan = w.items.find(it => it.kind === 'pan' && !it.holder && it.f === g.home.f && d2(it, hc) < 14); if (pan && Math.random() < 0.6) ai.wander = approach(pan); /* el pan solo la atrae si está cerca de su guarida */
  }
  if (free && Math.random() < dt * 0.03 && gAnomaly(w, g)) ai.nextAct = w.t + actGap(w);
  if (free) randomPheno(w, g, 0.02, dt);
  navTo(w, g, ai.wander, sp * 0.8, dt);
}
// cuartos que comparten puerta con la guarida (su territorio de ronda)
function homeNeighbors(w, h) { const key = h.f + ':' + h.r; w._nb = w._nb || {}; if (w._nb[key]) return w._nb[key]; const out = new Map();
  for (const d of w.doors) { if (d.f !== h.f) continue; const ax = d.o === 'V' ? 0.9 : 0, ay = d.o === 'V' ? 0 : 0.9; const a = roomAt(d.f, d.x + ax, d.y + ay), b = roomAt(d.f, d.x - ax, d.y - ay);
    const o = a === h.r ? b : b === h.r ? a : -1; if (o >= 0 && o !== h.r && ROOM_CENTER[h.f][o] && !['afuera', 'afuera1', 'vacio', 'vaciocapilla'].includes(ROOMS[h.f][o].id)) out.set(o, { f: h.f, r: o }); }
  return (w._nb[key] = [...out.values()]); }
function weightedPick(opts, ws) { const tot = ws.reduce((a, b) => a + b, 0); let r = Math.random() * tot; for (let i = 0; i < opts.length; i++) { r -= ws[i]; if (r <= 0) return opts[i]; } return opts[opts.length - 1]; }
function doPheno(w, g, k) { return k === 'q' ? gChill(w, g) : k === 'e' ? gLightsOff(w, g) : k === 'f' ? gPortazo(w, g) : k === 'c' ? (Math.random() < 0.6 ? (gMover(w, g) || gProp(w, g)) : (gProp(w, g) || gMover(w, g))) : gSusurro(w, g); }
function randomPheno(w, g, rate, dt) { if (Math.random() < rate * dt) { const opts = ['e', 'f', 'c', 'v'].filter(k => gReady(w, g, k)); if (opts.length && doPheno(w, g, weightedPick(opts, opts.map(k => g.def.freq[k])))) g.ai.nextAct = w.t + actGap(w); } }
const actGap = w => w.opt.diff === 'pesadilla' ? rnd(6, 10) : w.opt.diff === 'facil' ? rnd(14, 22) : rnd(10, 16); // menos cosas, más legibles
function ghostSpeed(w, g) {
  let s;
  if (g.hunt) s = Math.min(g.def.top, g.def.huntStart + g.def.accel * g.seenT); else s = g.def.speedNow(w, g);
  if (g.hunt && g.hunt.huida) s *= (g.slowMult || 1);
  if (g.hunt && !g.hunt.huida && w.t < (g.hunt.t0 || 0) + CFG.huntGrace) s *= 0.5;
  if (w.t < g.slowUntil) s *= 0.5;
  return s;
}

// ---------- Paso de simulación ----------
// input del humano: { mx, my, sprint, press:Set, face }
function step(w, dt, input) {
  if (w.over || w.pendingDawn) return;
  w.t += dt; const g = w.g, def = g.def;
  const NOIN = { mx: 0, my: 0, sprint: false, press: new Set() };
  const multi = !!(input && input.multi);
  const human = multi ? (input.ghost || NOIN) : (input || NOIN);
  const inOf = i => multi ? (input.by[i.id] || NOIN) : human;
  // nubes, máscaras
  if (w.clouds.some(c => w.t > c.until) || w.doors.some(d => d.rudaUntil && w.t > d.rudaUntil && !d.rudaDone) || (w.lockDoorsUntil && w.t > w.lockDoorsUntil)) {
    w.clouds = w.clouds.filter(c => w.t <= c.until); w.doors.forEach(d => { if (d.rudaUntil && w.t > d.rudaUntil) { d.rudaDone = true; d.rudaUntil = 0; } }); if (w.t > w.lockDoorsUntil) w.lockDoorsUntil = 0; rebuildMasks(w); }
  w.noises = w.noises.filter(n => w.t - n.t < 0.5); w.subs = w.subs.filter(s => w.t - s.t < 4); w.fx = w.fx.filter(f => w.t - f.t < f.ttl);

  // ----- Ánima -----
  const wasTile = g.f * FL + (g.y | 0) * W + (g.x | 0);
  const inH = inHome(g);
  if (g.state === 'despertando') { if (w.t >= CFG.grace) { g.state = 'libre'; w.say('Algo despertó en la casona.', 'a'); } }
  else if (g.state === 'poseyendo') { }
  else if (g.state === 'desvanecida') { if (w.t >= g.fadeUntil) { const hc = ROOM_CENTER[g.home.f][g.home.r]; g.f = hc.f !== undefined ? hc.f : g.home.f; g.x = hc.x; g.y = hc.y; g.state = 'descanso'; g.restUntil = w.t + CFG.fade.rest; w.say(`Quedas inmóvil en tu guarida ${CFG.fade.rest} s.`, 'g'); } }
  else if (g.state === 'descanso') { g.pres = Math.min(def.presMax, g.pres + CFG.hunger.home * dt); if (!g.bot && human.press.has('q')) gChill(w, g); if (g.bot && nearestIn(w, g, 3.5)) gChill(w, g); if (w.t >= g.restUntil) { g.state = 'libre'; w.say('Puedes moverte otra vez.', 'g'); } }
  else {
    if (w.phase === 'night') { if ((inH && !g.hunt) || g.state === 'poseyendo') { /* en la guarida (o poseyendo) el hambre se congela */ } else g.pres -= dt * (g.hunt ? CFG.hunger.hunt : CFG.hunger.drain); }
    if (g.pres <= 0) { g.pres = 0; endHunt(w, g); g.state = 'desvanecida'; g.fadeUntil = w.t + CFG.fade.show; g.revealUntil = w.t + CFG.fade.show; g.returning = false;
      w.fxAdd('flama', g, { ttl: CFG.fade.show }); w.sub(g, `Una figura se deja ver un instante… (${def.sello.n})`, 12); w.ev('fade', { f: g.f, x: g.x, y: g.y }); w.say('Te desvaneciste: te vieron un instante.', 'g'); }
    else if (w.t >= g.stunUntil) {
      if (g.bot) botGhost(w, g, dt);
      else {
        const p = human.press;
        const act = (k, fn, name) => { if (!p.has(k)) return; const before = alive(w).map(i => [i, i.san]); const ok = fn(w, g);
          if (!ok) { const why = { q: 'Escalofrío: aún no está listo o no hay nadie a 4 m.', e: 'No hay foco encendido ni veladora cerca.', f: 'No hay puerta a 6 m o aún no está listo.', c: 'No hay objetos sueltos a 3,5 m o aún no está listo.', t: 'No hay mueble a 2,6 m o aún no está listo.', v: 'Aún no está listo.', h: 'Aún no puedes cazar (mira la condición en tu panel).', n: 'Apagón: aún no está listo o te falta presencia.', m: 'Mudanza: entra a otro cuarto (no pasillo) con 15 de presencia.', g: 'Interferencia: aún no está lista o te falta presencia.', k: 'Manifestación: nadie a 7 m o aún no está lista.', j: 'Alucinación: necesitas a alguien solo a 14 m.', p: 'Posesión: necesitas a alguien a 6 m, o aún no está lista.', y: 'Anomalía: aún no está lista.' }[k]; if (why) w.say(why, 'g'); return; }
          const hits = before.filter(([i, s]) => i.san < s - 0.01).map(([i, s]) => `${i.name} −${Math.round(s - i.san)}`);
          w.say(`${name}: ${hits.length ? hits.join(', ') + ' (te alimentas)' : 'nadie lo sintió de cerca'}.`, 'g'); };
        act('q', gChill, 'Escalofrío'); act('e', gLightsOff, 'Luz apagada'); act('f', gPortazo, 'Portazo'); act('c', gMover, 'Objeto movido'); act('t', gProp, 'Mueble'); act('v', gSusurro, 'Voz imitada'); act('n', gApagon, 'Apagón'); act('m', gMudanza, 'Mudanza');
        if (p.has('r')) gSpecial(w, g); act('h', startHunt, 'Cacería'); if (p.has('x')) gEspanto(w, g);
        act('g', gInterf, 'Interferencia'); act('k', gManifest, 'Manifestación'); act('j', gHallu, 'Alucinación'); act('p', gPossess, 'Posesión'); act('y', gAnomaly, 'Anomalía');
        if (p.has('b') && !g.hunt) g.returning = true;
        if (p.has('z')) { if (ethereal(g) && tileAt(1 - g.f, g.x, g.y) !== T.VOID) changeFloor(w, g, 1 - g.f); else if (def.fly && walkableT(tileAt(1 - g.f, g.x, g.y))) changeFloor(w, g, 1 - g.f); else if (isStair[(g.y | 0) * W + (g.x | 0)]) changeFloor(w, g, 1 - g.f); }
        if (human.mx || human.my) { g.returning = false; const l = Math.hypot(human.mx, human.my), s = ghostSpeed(w, g) * dt; const nx = g.x + human.mx / l * s, ny = g.y + human.my / l * s;
          if (!(def.darkFear && g.hunt && !g.hunt.huida && enteringDark(w, g, nx, ny))) tryMove(w, g, human.mx / l * s, human.my / l * s); g.face = human.face !== undefined ? human.face : Math.atan2(human.my, human.mx); }
      }
      if (w.t < (g.lockHomeUntil || 0) && !g.hunt && !inHome(g)) g.returning = true;
      if (g.returning) { navTo(w, g, ROOM_CENTER[g.home.f][g.home.r], ghostSpeed(w, g), dt); if (inHome(g) && d2(g, ROOM_CENTER[g.home.f][g.home.r]) < 2) g.returning = false; }
    }
  }
  // Nachito: enciende la luz al entrar a un cuarto oscuro (sello)
  if (def.darkFear && g.state === 'libre' && !g.hunt && selloOK(w)) { const r = roomOf(g); if (r >= 0 && !w.lights[g.f][r] && !isHall(g.f, r) && ROOMS[g.f][r].id !== 'vacio') { w.lights[g.f][r] = 1; emitSello(w, g, 'risa'); ghostEvent(w, g, 'switch'); } }
  // pasa por una puerta
  const nowTile = g.f * FL + (g.y | 0) * W + (g.x | 0);
  { const rNow = roomOf(g); if (g.lastRoom !== undefined && rNow >= 0 && g.lastRoom >= 0 && rNow !== g.lastRoom && g.lastRoomF === g.f) { const d = w.doors.find(d => d.f === g.f && d2(d, g) <= 3); if (d && !d.tiles.some(([x, y]) => x === (g.x | 0) && y === (g.y | 0))) ghostEvent(w, g, 'door', { door: d }); } if (rNow >= 0) { g.lastRoom = rNow; g.lastRoomF = g.f; } }
  if (nowTile !== wasTile && g.state !== 'despertando') {
    const d = w.doors.find(d => d.f === g.f && d.tiles.some(([x, y]) => x === (g.x | 0) && y === (g.y | 0)));
    if (d) { ghostEvent(w, g, 'door', { door: d }); if (d.closed && !ethereal(g)) { d.closed = false; d.anim = 1; w.noise(d, 10, 'door'); }
      if (g.def.ev.includes('CE') && ghostSpeed(w, g) >= 2.4 && Math.random() < 0.45) d.printsUntil = Math.max(d.printsUntil || 0, w.t + 90); if (d.rosario && g.hunt && !w.noHoly) { d.rosario = false; const it = d.rosarioItem; d.rosarioItem = null; if (it) w.items.splice(w.items.indexOf(it), 1); activateRosary(w, { name: 'El rosario colgado' }); } }
    // atrapada en humo de copal
    if (w.ghostMask[nowTile]) { g.stunUntil = w.t + CFG.copal.stun; }
  }
  // ocupación de cuartos (termómetro)
  { const key = g.f + ':' + roomOf(g); for (const k in g.occ) g.occ[k] *= Math.pow(0.5, dt / 20); g.occ[key] = (g.occ[key] || 0) + dt;
    const gr = roomOf(g), active = !['despertando', 'desvanecida'].includes(g.state) && w.phase === 'night';
    for (let f = 0; f < 2; f++) for (let r = 0; r < w.rastro[f].length; r++) { if (active && f === g.f && r === gr) w.rastro[f][r] = Math.min(100, w.rastro[f][r] + CFG.rastro.gain * dt * (inHome(g) && !g.hunt ? CFG.rastro.homeMult : 1)); else if (w.rastro[f][r] > 0) w.rastro[f][r] = Math.max(0, w.rastro[f][r] - CFG.rastro.decay * dt); } }
  possessTick(w, dt, multi ? (w.possess ? (w.g.bot ? inOf(w.invs[w.possess.who]) : human) : NOIN) : human); analogTick(w, dt);
  if (w.hallu && w.t >= w.hallu.until) { const v = w.invs[w.hallu.who]; if (v && v.alive) w.haunt(v, 4); w.ev('halluEnd', { who: w.hallu.who }); w.hallu = null; }
  // pasivas y sellos periódicos
  if (g.state === 'libre' && w.phase === 'night') {
    if (!inHome(g)) g.outsideT += dt;
    const every = def.selloEvery || (def.id === 'pena' ? 60 : 0);
    if (every && g.outsideT >= every) { g.outsideT = 0; emitSello(w, g, def.id === 'llorona' ? 'charcos' : def.id === 'malaire' ? 'escarcha' : 'rezo'); }
    if (false && def.id === 'chaneque' && !g.hunt && w.t > (g.selloCd.robo || 0)) { const v = exposedInvs(w).find(i => i.f === g.f && d2(i, g) < 1.4 && i.slots.some(s => s)); if (v) { const ks = v.slots.map((s, k) => s ? k : -1).filter(k => k >= 0); const k = pick(ks); const it = v.slots[k]; v.slots[k] = null; it.holder = null; const rr = pick(ROOM_LIST.filter(r => ROOM_CENTER[r.f][r.r] && !(r.f === v.f && r.r === roomOf(v)))); const p = randomIn(rr.f, rr.r); it.f = p.f; it.x = p.x; it.y = p.y; g.selloCd.robo = w.t + 20; w.say(`A ${v.name} le desapareció: ${ITEMS[it.kind].n}.`, 'a'); emitSello(w, it, 'reubicado'); } }
    if (def.id === 'matla') { for (const i of exposedInvs(w)) { if (i.f === g.f && d2(i, g) <= 8 && isolated(w, i)) { i.matlaT = (i.matlaT || 0) + dt; if (i.matlaT >= 10 && selloOK(w)) { i.matlaT = 0; w.nextSello = w.t + CFG.selloGap; const p = { f: g.f, x: g.x, y: g.y }; w.sub(p, `«…${i.name}…»`, 14); w.ev('sello', { kind: 'nombre', f: g.f, x: g.x, y: g.y });  } } else i.matlaT = 0; } }
    if (def.id === 'cucuy' && g.pres > def.presMax / 2 && w.t > (g.selloCd.ropero || 0)) { const s = SPOTS.find(s => s.f === g.f && Math.hypot(s.x + 0.5 - g.x, s.y + 0.5 - g.y) < 1.6); if (s) { g.selloCd.ropero = w.t + 25; emitSello(w, { f: s.f, x: s.hx, y: s.hy }, 'ropero'); } }
    if (def.id === 'guardian' && w.t > (g.selloCd.monedas || 0) && exposedInvs(w).some(i => i.f === g.home.f && roomOf(i) === g.home.r)) { g.selloCd.monedas = w.t + 20; emitSello(w, ROOM_CENTER[g.home.f][g.home.r], 'monedas'); }
    if (def.id === 'planchada') { const r = roomOf(g); const k = g.f + ':' + r; if (r >= 0 && BEDROOMS[g.f].includes(ROOMS[g.f][r].id) && g.lastRoomKey !== k && w.t > (g.selloCd.cama || 0)) { g.selloCd.cama = w.t + 30; emitSello(w, g, 'cama'); } g.lastRoomKey = k; }
  }
  if (def.id === 'guardian' && g.state !== 'despertando') exposedInvs(w).forEach(i => { if (i.f === g.home.f && roomOf(i) === g.home.r) w.haunt(i, 0.4 * dt); });
  if (def.id === 'planchada' && g.state !== 'despertando') exposedInvs(w).forEach(i => { if (i.f === g.f && i.san <= 25 && d2(i, g) < 3) i.san = Math.min(100, i.san + dt); });
  // Cucuy saca de escondites cazando
  if (false && def.id === 'cucuy' && g.hunt) { const v = w.invs.find(i => i.alive && i.hidden >= 0 && SPOTS[i.hidden].f === g.f && Math.hypot(SPOTS[i.hidden].hx - g.x, SPOTS[i.hidden].hy - g.y) < 1.3); if (v) { g.pull = (g.pull || 0) + dt; if (g.pull >= 3) { v.hidden = -1; g.pull = 0; w.say(`¡El Cucuy sacó a ${v.name} del escondite!`, 'a'); } } else g.pull = 0; }

  // Percepción del ánima
  g.perceived.clear(); let anySeen = false;
  for (const i of alive(w)) if (perceives(w, g, i)) { g.perceived.set(i, w.t); if (i.hidden < 0 || true) anySeen = true; }
  for (const n of w.noises) { if (!['run', 'throw', 'stairs'].includes(n.kind)) continue; const r = Math.min(g.def.hear * (n.kind === 'throw' ? 1.5 : 1), n.r * 3); if ((n.f === g.f && d2(n, g) <= r) || (n.f !== g.f && d2(n, g) <= r / 2)) g.heard.push({ f: n.f, x: n.x, y: n.y, t: w.t, kind: n.kind }); }
  if (g.heard.length > 20) g.heard.splice(0, g.heard.length - 20);
  // dead voices: el ánima "oye" a los muertos (humano: se muestra en HUD)
  if (g.hunt) { if (anySeen && w.t >= g.blindUntil) { g.seenT += dt; g.lastSeenAt = w.t; } else if (w.t - g.lastSeenAt > CFG.lostSight && g.seenT < 90) g.seenT = 0; }

  // obligación de cacería: si puede cazar y no lo hace, el impulso la obliga
  if (w.phase === 'night' && g.state === 'libre' && !g.hunt) { if (huntRuleOK(w, g) && g.pres >= CFG.huntMinPres) { g.urge = (g.urge || 0) + dt; if (g.urge >= (def.mustHunt || CFG.mustHunt) && canHunt(w, g)) { if (startHunt(w, g)) { g.urge = 0; if (!g.bot) w.say('No pudiste contenerte: empezó la cacería.', 'g'); } } } else g.urge = Math.max(0, (g.urge || 0) - dt * 0.5); }
  // en la cacería avienta lo que encuentra a su paso
  if (g.hunt && !g.hunt.huida) for (const o of w.loose) if (o.f === g.f && d2(o, g) < 1.4 && w.t - o.flyT > 3) { const a = g.face + (Math.random() - 0.5) * 2, nx = o.x + Math.cos(a) * 1.8, ny = o.y + Math.sin(a) * 1.8; if (walkableT(tileAt(o.f, nx, ny))) { o.from = { x: o.x, y: o.y, h: o.h }; o.x = nx; o.y = ny; o.h = 0; o.flyT = w.t; o.rot = Math.random() * 6.28; w.ev('mover', { f: o.f, x: o.x, y: o.y, id: o.id }); } }
  // ----- Ritual en el altar -----
  if (w.ritual) { const rt = w.ritual, by = rt.by; const broken = !by.alive || by.escaped || by.f !== ALTAR_POS.f || Math.hypot(by.x - ALTAR_POS.x, by.y - ALTAR_POS.y) > 2.8 || by.san < rt.san0 - CFG.ritualBreak || (g.state !== 'despertando' && g.f === by.f && d2(g, by) < 1.6);
    if (broken) { w.ritual = null; if (by.alive) by.san = Math.max(0, by.san - 5); w.say('La vela del altar se apaga: el nombre no se completó.', 'a'); w.say('¡Interrumpiste el ritual!', 'g'); w.ev('ritualFail', by); }
    else if (w.t >= rt.until) finishName(w); }
  // ----- Objetos de la casa -----
  if (w.pendingCursed && w.t >= w.pendingCursed.t) { const pc = w.pendingCursed; w.pendingCursed = null; cursedHunt(w, pc.who.alive ? pc.who : alive(w)[0], 'El pentagrama se apagó.'); }
  if (g.state !== 'despertando' && !(def.fly)) for (const a of w.ashes) if (!a.stepped && a.f === g.f && d2(a, g) <= CFG.ash.r) { a.stepped = true; a.prints = def.ev.includes('CE'); a.printsUntil = w.t + CFG.ash.prints; w.sub(a, 'Algo pasó sobre la ceniza', 8); w.ev('ashstep', a); }
  if (w.ashes.length && w.ashes.some(a => w.t > a.until)) w.ashes = w.ashes.filter(a => w.t <= a.until);
  if (!g.hunt && g.state === 'libre' && w.phase === 'night') { const pan = w.items.find(it => it.kind === 'pan' && !it.holder && it.f === g.f && d2(it, g) <= 1.3); if (pan) { pan.eat += dt; if (pan.eat >= CFG.pan.eat) { w.items.splice(w.items.indexOf(pan), 1); g.pres = Math.min(def.presMax, g.pres + CFG.pan.pres); w.sub(pan, 'Alguien mordió el pan de la ofrenda', 12); ghostEvent(w, g, 'move'); w.ev('pan', pan); if (!g.bot) w.say('Te comiste el pan de la ofrenda: +presencia.', 'g'); } } }
  // espejo de plata en uso
  for (const i of w.invs) if (i.mirror) { const it = i.mirror; if (!i.alive || handItem(i) !== it || !it.on) { if (it.on && it.spent < CFG.mirrorMin) i.san = Math.max(0, i.san - (CFG.mirrorMin - it.spent)); it.on = false; i.mirror = null; continue; }
    const d = CFG.mirrorDrain * dt; it.spent += d; i.san = Math.max(0, i.san - d); w.mirrorView = { t: w.t, f: g.f, r: roomOf(g) };
    if (i.san <= 0) { it.on = false; i.mirror = null; consume(w, i); w.say('El espejo de plata se estrella.', 'a'); cursedHunt(w, i, 'El espejo se rompió.'); } }
  // ----- Cacería -----
  if (g.hunt) {
    if (!g.hunt.huida && w.t >= g.hunt.until) endHunt(w, g);
    else if (w.t >= g.blindUntil && w.t >= g.stunUntil && (g.hunt.huida || w.t >= (g.hunt.t0 || 0) + CFG.huntGrace)) for (const i of w.invs) {
      const hidLit = i.hidden >= 0 && elecOnW(w, i) && Math.hypot(SPOTS[i.hidden].hx - g.x, SPOTS[i.hidden].hy - g.y) < 1.2;
      if (!i.alive || i.escaped || i.f !== g.f || (i.hidden >= 0 && !hidLit) || (!hidLit && d2(i, g) > CFG.killDist)) continue;
      if (hidLit) { i.hidden = -1; w.say(`¡El ánima abrió el escondite de ${i.name}: su linterna seguía encendida!`, 'a'); w.ev('dragOut', { who: i.id }); }
      if (def.noKillBelow && i.san <= def.noKillBelow && alive(w).some(o => o.san > def.noKillBelow)) continue;
      const rk = i.slots.findIndex(s => s && s.kind === 'rosario');
      if (rk >= 0 && !w.noHoly) { const it = i.slots[rk]; it.uses = (it.uses === undefined ? 2 : it.uses) - 1; if (it.uses <= 0) { i.slots[rk] = null; w.items.splice(w.items.indexOf(it), 1); w.say(`El rosario de ${i.name} se rompió.`, 'a'); } activateRosary(w, i); break; }
      killInv(w, i); if (!g.hunt.huida) { endHunt(w, g); break; }
    }
  }

  // ----- Investigadores -----
  for (const i of w.invs) {
    if (i.escaped) continue;
    const hin = inOf(i);
    if (!i.alive) { if (!i.bot) spiritControl(w, i, hin, dt); continue; }
    const r = roomOf(i);
    const lit = litAt(w, i);
    if (i.hidden >= 0) { if (g.hunt) w.haunt(i, CFG.hiddenHuntDrain * dt / w.force); i.stam = Math.min(100, i.stam + CFG.stamRest * dt); }
    else if (g.state !== 'despertando' && w.phase === 'night' && !(r >= 0 && ['afuera', 'afuera1'].includes(ROOMS[i.f][r].id))) { // afuera (la base) no se pierde cordura
      if (!lit) i.san = Math.max(0, i.san - (isHall(i.f, r) ? CFG.hallDrain : CFG.darkDrain) * dt);
      if (g.f === i.f && d2(i, g) <= CFG.nearR) w.haunt(i, CFG.nearDrain * dt);
      if (w.t < i.curseUntil) w.haunt(i, 0.3 * dt);
      if (inHome(g) && i.f === g.home.f && r === g.home.r) w.haunt(i, CFG.homeDrain * dt);
    }
    if (false && i.reading) { i.reading.t += dt; if (i.reading.t >= i.reading.dur) { i.reading = null; const rr = roomOf(i); if (rr >= 0) { const tC = roomTemp(w, i.f, rr); i.lastTemp = { v: tC, r: rr, f: i.f, t: w.t }; w.say(`${i.name} · Termómetro en ${ROOMS[i.f][rr].n}: ${tC.toFixed(1)} °C`, i.bot ? 'x' : 'i'); w.ev('termo', { temp: tC });
      if (w.team.home && w.team.home.f === i.f && w.team.home.r === rr && tC >= 10) { w.team.home = null; w.say(`${i.name}: «Aquí ya no hace frío… se fue a otro cuarto».`, 'a'); }
      if (tC < 0) { confirmEv(w, 'BC', i, `${tC.toFixed(1)} °C`); if (!w.team.home) { w.team.home = { f: i.f, r: rr }; } } else if (tC < 10 && !w.team.home) { w.team.home = { f: i.f, r: rr }; w.say(`${i.name}: «Este cuarto está muy frío. Aquí vive».`, 'a'); } } } }
    if (w.t < i.stunUntil || i.possessed) continue;
    // aliento
    if (i.stam <= 0) i.tired = true; if (i.tired && i.stam >= CFG.stamMin) i.tired = false;
    if (i.bot) {
      if (i.ai.state === 'name' && w.phase === 'night') { if (navTo(w, i, ALTAR_POS, CFG.walk, dt) || d2(i, ALTAR_POS) < 1.5 && i.f === ALTAR_POS.f) nameGhost(w, i, i.ai.nameId); }
      else botInv(w, i, dt);
      if (!(i.ai.running)) i.stam = Math.min(100, i.stam + CFG.stamWalk * dt * 0.5);
    } else {
      w.actor = i; const p = hin.press;
      const NS = i.slots.length; for (let k = 0; k < NS; k++) if (p.has(String(k + 1))) i.hand = k;
      if (p.has('wheelup')) i.hand = (i.hand + NS - 1) % NS; if (p.has('wheeldown')) i.hand = (i.hand + 1) % NS;
      if (p.has('e')) { const res = interact(w, i); if (res === 'altar') w.ev('altar', { who: i.id }); }
      if (p.has('q')) toggleLight(w, i);
      if (p.has('f')) i.flash = !i.flash;
      if (p.has('g') && handItem(i)) { const it = handItem(i); if (it.kind === 'rosario' && hangRosary(w, i)) {} else dropItem(w, i, i.hand); }
      if (p.has('throw') && handItem(i)) throwItem(w, i, hin.throwPower || 6);
      if (p.has(' ')) useItem(w, i);
      i.vx = i.vx || 0; i.vy = i.vy || 0;
      if (i.remote) { if (hin.face !== undefined) i.face = hin.face; if (hin.sprint && hin.moving) { w.noiseT = (w.noiseT || 0) + dt; if (w.noiseT > 0.4) { w.noiseT = 0; w.noise(i, 5, 'run'); } } } else {
      if (i.hidden >= 0 || !(hin.mx || hin.my)) { const k = Math.max(0, 1 - CFG.decel * dt / Math.max(0.01, Math.hypot(i.vx, i.vy))); i.vx *= k; i.vy *= k; if (i.hidden < 0 && Math.hypot(i.vx, i.vy) > 0.01) tryMove(w, i, i.vx * dt, i.vy * dt); }
      if (i.hidden < 0 && (hin.mx || hin.my)) {
        if (i.reading) i.reading = null;
        let sp = CFG.walk; const running = hin.sprint && !i.tired && i.stam > 0;
        if (running) { sp = CFG.sprint; i.stam = Math.max(0, i.stam - CFG.stamDrain * dt); w.noiseT = (w.noiseT || 0) + dt; if (w.noiseT > 0.4) { w.noiseT = 0; w.noise(i, 5, 'run'); } }
        else i.stam = Math.min(100, i.stam + CFG.stamWalk * dt);
        if (w.t < i.slowUntil) sp *= 0.7;
        const l = Math.hypot(hin.mx, hin.my), tx = hin.mx / l * sp, ty = hin.my / l * sp, dvx = tx - i.vx, dvy = ty - i.vy, dl = Math.hypot(dvx, dvy), a = CFG.accel * dt;
        if (dl > a) { i.vx += dvx / dl * a; i.vy += dvy / dl * a; } else { i.vx = tx; i.vy = ty; }
        const ox = i.x, oy = i.y; tryMove(w, i, i.vx * dt, i.vy * dt); if (Math.abs(i.x - ox) < 1e-5) i.vx *= 0.5; if (Math.abs(i.y - oy) < 1e-5) i.vy *= 0.5;
        if (hin.face === undefined) i.face = Math.atan2(hin.my, hin.mx);
      } else if (i.hidden < 0) i.stam = Math.min(100, i.stam + CFG.stamRest * dt);
      if (hin.face !== undefined) i.face = hin.face;
      }
      w.actor = null;
    }
    if (i.f === ALTAR_POS.f && d2(i, ALTAR_POS) < 3 && Math.hypot(i.vx || 0, i.vy || 0) < 0.3) { if (!i.ai.stillT) i.ai.stillT = w.t + 20; } else i.ai.stillT = 0;
    // escape
    if (w.phase === 'huida' && i.f === 0 && d2(i, EXIT) < 1.2 && w.t >= w.exitBlockedUntil) { i.escaped = true; w.huida.escaped++; w.say(`${i.name} salió de la casona.`, 'a'); w.ev('escape'); }
  }
  // escalones de investigadores bot que cruzan pisos ya se manejan en navTo
  w.toolT = (w.toolT || 0) - dt; if (w.toolT <= 0) { w.toolT = 0.25; toolTick(w, 0.25); }
  w.thinkT = (w.thinkT || 0) - dt; if (w.thinkT <= 0) { w.thinkT = 1; botTeam(w); }
  // puertas: animación
  for (const d of w.doors) if (d.anim > 0) d.anim = Math.max(0, d.anim - dt * 0.8);

  // ----- Fin -----
  const al = alive(w);
  if (w.phase === 'huida') {
    const need = Math.max(1, Math.ceil(w.huida.aliveAtStart / 2)), hd = w.huida;
    if (hd.escaped >= need) w.over = { win: 'inv', cause: `Escaparon ${hd.escaped} de ${hd.aliveAtStart}` };
    else if (hd.escaped + al.length < need) w.over = { win: 'ghost', cause: `En la huida solo escaparon ${hd.escaped} de ${hd.aliveAtStart}` };
    else if (w.t >= hd.until) w.over = { win: 'ghost', cause: `Se acabó el tiempo de la huida: escaparon ${hd.escaped} de ${hd.aliveAtStart}` };
    return;
  }
  if (!al.length) { w.over = { win: 'ghost', cause: 'No quedó ningún investigador' }; return; }
  if (w.t >= w.opt.night) {
    if (w.invs.some(i => !i.bot && i.alive)) { w.pendingDawn = true; w.say('Amanece: última oportunidad para nombrarla con lo que sepan.', 'a'); w.ev('dawn'); return; }
    if (w.t > w.opt.night + 45) { w.over = { win: 'ghost', cause: 'Llegó el Alba sin nombrarla' }; return; }
    const c = candidates(w, false, botK(w)); if (!w.ritual) { w.dawnBots = true; const nm = al.sort((a, b) => pathLen(w, a, ALTAR_POS) - pathLen(w, b, ALTAR_POS))[0]; nm.ai.state = 'name'; nm.ai.nameId = pick(c.length ? c : GHOSTS).id; }
  }
}
function enteringDark(w, g, nx, ny) { const r0 = roomOf(g), r1 = roomAt(g.f, nx, ny); return r1 >= 0 && r1 !== r0 && !w.lights[g.f][r1] && !isHall(g.f, r1); }
function killInv(w, i) {
  i.alive = false; i.reading = null; i.hidden = -1; w.stats.deaths++; w.say(`${i.name} fue alcanzado por el ánima.`, 'a'); w.ev('death', { who: i.id });
  i.slots.forEach((s, k) => { if (s) dropItem(w, i, k); }); i.noclip = true;
}
function spiritControl(w, i, human, dt) {
  const p = human.press; i.noclip = true; if (human.face !== undefined) i.face = human.face;
  if (human.mx || human.my) { const l = Math.hypot(human.mx, human.my); i.x = clamp(i.x + human.mx / l * 4 * dt, 0.5, W - 0.5); i.y = clamp(i.y + human.my / l * 4 * dt, 0.5, H - 0.5); }
  if (p.has('z')) i.f = 1 - i.f;
  if (p.has(' ') && w.t >= i.spirit.cd) { i.spirit.cd = w.t + 30; i.spirit.until = w.t + 3; i.spirit.x = i.x; i.spirit.y = i.y; i.spirit.f = i.f; w.say('Te manifiestas para estorbar al ánima.', 'i'); w.ev('manifest'); }
  const g = w.g; if (i.spirit.until > w.t && g.f === i.spirit.f && Math.hypot(g.x - i.spirit.x, g.y - i.spirit.y) < 1) g.slowUntil = w.t + 2;
}

if (typeof module !== 'undefined') module.exports = { gPossess, gAnomaly, makeHallu, analogTick, gManifest, gHallu, spotNear, nearDoor, ALTAR_POS, ghostMotive, tempAt, SWITCHES, FUSE, SURFACES, gInterf, askSpirit, huntInfo, gApagon, gMudanza, NAMES, CURSED_PLACES, CURSED, cursedHunt, useItem, ITEM_PLACES, PROPS, CFG, EV, EV_KEYS, ITEMS, TOOLS, GHOSTS, GT, ROOMS, SPOTS, newWorld, step, pruebas, candidates, alive, W, H, grids, T, nameGhost, perceives };
