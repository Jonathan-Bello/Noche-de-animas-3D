// ===================== NOCHE DE ÁNIMAS v0.2 · 3D (Three.js), AUDIO E INTERFAZ =====================
import * as THREE from 'three';

const $ = s => document.querySelector(s);
const FH = 3.8, WALL_H = FH;
const COL = { wine: 0x5a0f1e, wine2: 0x7a1f2e, orange: 0xe0782a, gold: 0xf2b04e, plum: 0x4a2347, bone: 0xf3e6cf, night: 0x07050f };
const FLOOR_COL = {
  capilla: 0x5b4060, biblioteca: 0x5e432f, sala: 0x6a3a3e, recp: 0x5a3a52, comedor: 0x60432c, cocina: 0x6e5a44, recn: 0x433f63, bano: 0x3d5266,
  despensa: 0x4f3d2c, zaguan: 0x665035, estudio: 0x58402f, servicio: 0x4a3f3d, patio: 0x58566a, corredor: 0x82503a,
  juegos: 0x56456a, costura: 0x6a4a52, musica: 0x4e3a3a, huespedes: 0x5a3f4f, abuelo: 0x4f4335, banoalto: 0x3d5266, oratorio: 0x5b4060,
  nana: 0x5a4a5e, desvan: 0x4a3c2c, rellano: 0x665035, archivo: 0x4f3d30, azotehuela: 0x5e5a50, galeria: 0x82503a,
};

// ---------- Textura de grano de papel ----------
function paperTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#d8d0c4'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1400; i++) { const v = 180 + Math.random() * 75 | 0; x.fillStyle = `rgba(${v},${v - 8},${v - 16},0.35)`; x.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(120,100,80,0.12)'; x.beginPath(); const a = Math.random() * 128, b = Math.random() * 128; x.moveTo(a, b); x.lineTo(a + Math.random() * 30 - 15, b + Math.random() * 30 - 15); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
function handTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, 128, 128); x.fillStyle = 'rgba(190,120,255,0.95)';
  const hand = (ox, oy, s) => { x.beginPath(); x.ellipse(ox, oy, 14 * s, 18 * s, 0, 0, 7); x.fill(); for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(ox - 14 * s + k * 7 * s, oy - 24 * s - (k === 2 ? 4 : 0) * s, 3 * s, 9 * s, (k - 2) * 0.15, 0, 7); x.fill(); } };
  hand(44, 76, 1); hand(88, 56, 0.9);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- Geometría combinada (cajas) ----------
function boxData(cx, cy, cz, sx, sy, sz) {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2, P = [], N = [], U = [], I = [];
  const faces = [[[1, 0, 0], [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]]], [[-1, 0, 0], [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]]],
    [[0, 1, 0], [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]]], [[0, -1, 0], [[-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1]]],
    [[0, 0, 1], [[1, -1, 1], [1, 1, 1], [-1, 1, 1], [-1, -1, 1]]], [[0, 0, -1], [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]]]];
  faces.forEach(([n, vs]) => { const b = P.length / 3; vs.forEach(([a, bb, c], k) => { P.push(cx + a * hx, cy + bb * hy, cz + c * hz); N.push(...n); U.push(k === 0 || k === 1 ? 0 : 1, k === 0 || k === 3 ? 0 : 1); }); I.push(b, b + 1, b + 2, b, b + 2, b + 3); });
  return { P, N, U, I };
}
class BoxBatch {
  constructor() { this.P = []; this.N = []; this.U = []; this.I = []; }
  add(cx, cy, cz, sx, sy, sz) { const d = boxData(cx, cy, cz, sx, sy, sz), o = this.P.length / 3; this.P.push(...d.P); this.N.push(...d.N); this.U.push(...d.U); d.I.forEach(i => this.I.push(i + o)); }
  mesh(mat) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.P), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.N), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.U), 2));
    g.setIndex(this.I); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
}

// ---------- Estado ----------
let renderer, scene, camera, clock, paper, handT;
let houseArtState=null;
let floorGroups = [], wallRuns = [], doorMeshes = [], candleMeshes = [], lampMeshes = [], spotMeshes = [], exitMesh, altarGlow;
let invMeshes = [], ghostMesh, itemMeshes = new Map(), fxMeshes = new Map(), heardMarks = [];
let flash, botFlashes = [], roomLights = [], velaLights = [], blueLight, ambient, hemi;
let ME = 0; // mi investigador (en línea puede no ser el 0)
let w = null, running = false, viewerMode = 'inv', speedMult = 1, follow = 0;
let audio = null;
const AIM_KINDS = ['uv', 'cam', 'emf', 'termo', 'gases', 'grab', 'espejo', 'radio', 'espejoplata'];
const ASSET = window.ASSET_BASE || 'assets/';
const CARD = { termo: 't0', uv: 't1', grab: 't2', cam: 't3', emf: 't4', espejo: 't5', gases: 't6', te: 'te', rosario: 'ros', ruda: 'ruda', copal: 'copal', tarot: 'tarot', tablilla: 'tablilla', espejoplata: 'espejo_plata', mano: 'mano', muneca: 'muneca', pentagrama: 'pentagrama', radio: 'radio', limpia: 'limpia' };
const EMOJI = { vela: '🕯️', ceniza: '⚱️', cruz: '✝️', pan: '🍞', foco: '💡' };
const IDCARD = { pena: 'anima', matla: 'matlacihuatl', tlahuel: 'tlahuelpuchi' };
const cardImg = (k, cls) => CARD[k] ? `<img class="${cls || 'ci'}" src="${ASSET}c/${CARD[k]}.webp" alt="">` : `<span class="${cls || 'ci'} ce">${EMOJI[k] || '•'}</span>`;
const idCard = G => G.id === 'nachito' ? `${ASSET}c/presencia.webp` : `${ASSET}c/id_${IDCARD[G.id] || G.id}.webp`;
const esCard = G => G.id === 'nachito' ? `${ASSET}c/back01.webp` : `${ASSET}c/es_${IDCARD[G.id] || G.id}.webp`;
const charImg = (id, dead) => { const c = CHARS[id] || CHARS.ines; return c.rol ? `${ASSET}a/${c.img}_${dead ? 'muerto' : 'vivo'}.webp` : `${ASSET}a/${c.img}${dead ? '_espiritu' : ''}.webp`; };
const portrait = (i, dead) => charImg(i.char, dead);
let music = null, amb = null;
function ambience(on) {
  if (!audio) return; const ctx = audio.ctx || audio; if (!ctx.createGain) return;
  if (!on) { if (amb) { try { amb.src.stop(); amb.lfo.stop(); } catch (e) {} amb = null; } return; }
  if (amb) return;
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); let b0 = 0; for (let k = 0; k < len; k++) { b0 = 0.995 * b0 + 0.05 * (Math.random() * 2 - 1); d[k] = b0; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; const gn = ctx.createGain(); gn.gain.value = 0.16;
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency);
  src.connect(lp); lp.connect(gn); gn.connect(audio.master || ctx.destination); src.start(); lfo.start(); amb = { src, lfo, next: 4 };
}
function ambienceTick(dt) {
  if (!amb || !w || !audio || audio.muted) return; amb.next -= dt; if (amb.next > 0) return; amb.next = rnd(5, 16);
  const V = viewer(); if (!V) return; const a = Math.random() * 6.28, r = rnd(5, 14), p = { f: V.f, x: V.x + Math.cos(a) * r, y: V.y + Math.sin(a) * r };
  const k = Math.random(); if (k < 0.35) SFX.creak(p); else if (k < 0.5) SFX.knock ? SFX.knock(p) : SFX.books(p); else if (k < 0.65) SFX.puff(p); else if (k < 0.75) { tone(220, 2.2, 'sine', 0.025, p, -60); tone(165, 2.6, 'sine', 0.02, p, -40, 0.3); } else if (k < 0.85) SFX.rattle(p); else SFX.slide(p);
}
function musicPlay(on) { ambience(on); return; try { if (!music) { music = new Audio(ASSET + 'a/ambiente.mp3'); music.loop = true; music.volume = 0.22; } if (on && !(audio && audio.muted)) music.play().catch(() => {}); else music.pause(); } catch (e) {} }
const keys = new Set(), pressed = new Set();
let mouse = { x: 0, y: 0, has: false }, throwHold = 0, throwing = false;
const joy = { x: 0, y: 0 };
let menuOpt = { role: 'inv', nInv: 3, ghost: 'random', night: 600, equip: 'normal', diff: 'normal', cursed: 'none', char: 'ines', tips: 'si', cam: 'hombro', libreta: 'manual' };

// Escultura vectorial: todo mate y de caras planas, sin la textura de grano (GDD §9.3)
function LambertFlat(o) { o = Object.assign({}, o || {}); if (o.map && o.map === paper) delete o.map; return new THREE.MeshStandardMaterial(Object.assign({ flatShading: true, roughness: 0.95, metalness: 0 }, o)); }
// ---------- Construcción de la casa ----------
// un rectángulo menos los huecos de las escaleras
function holeRects(list) { let out = list.slice(); for (const [a, b, c, d] of STAIRS) { const nx = []; for (const [x0, y0, x1, y1] of out) { if (c < x0 || a > x1 || d < y0 || b > y1) { nx.push([x0, y0, x1, y1]); continue; }
  if (y0 < b) nx.push([x0, y0, x1, b - 1]); if (y1 > d) nx.push([x0, d + 1, x1, y1]); const yy0 = Math.max(y0, b), yy1 = Math.min(y1, d); if (x0 < a) nx.push([x0, yy0, a - 1, yy1]); if (x1 > c) nx.push([c + 1, yy0, x1, yy1]); } out = nx; } return out; }
const elv = e => elevOf(e) * FH;
function buildHouse() {
  scene = new THREE.Scene(); scene.background = new THREE.Color(COL.night); scene.fog = new THREE.Fog(COL.night, 16, 38);
  paper = paperTex(); handT = handTex();
  const lam = (c, extra) => LambertFlat(Object.assign({ color: c, map: paper }, extra || {}));
  floorGroups = [new THREE.Group(), new THREE.Group()]; floorGroups[1].position.y = FH; floorGroups.forEach(g => scene.add(g));
  wallRuns = []; ceilMeshes = []; doorMeshes = []; candleMeshes = []; lampMeshes = []; spotMeshes = [];
  houseArtState=NDAHouseArt.build({floors:floorGroups,world:w});NDADecorArt.build(floorGroups);
  for(let f=0;f<2;f++){const G=floorGroups[f];
    // velas de cada cuarto y focos
    ROOMS[f].forEach((r, i) => { const c = ROOM_CENTER[f][i]; if(!c||['afuera','afuera1','patio','traspatio'].includes(r.id))return;
      const cg=new THREE.Group(),surface=SURFACES[f][i][0];cg.position.set(surface?surface[0]+.25:c.x,surface?surface[2]:0,surface?surface[1]+.25:c.y);cg.visible=!!surface&&r.home&&!NDALayout.decorInstances?.some(i=>i.room===r.code)&&!((w.devices||[]).some(d=>d.f===f&&d.r===i)&&SURFACES[f][i].length<2)&&!(w.altarRoom.f===f&&w.altarRoom.r===i);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), lam(COL.bone)); base.position.y = 0.15; cg.add(base);
      const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), new THREE.MeshBasicMaterial({ color: COL.gold })); fl.position.y = 0.36; fl.scale.y = 1.8; cg.add(fl);
      G.add(cg); candleMeshes.push({ f, r: i, flame: fl });
      const lampY=r.id==='capilla'?5.65:FH-.35;const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), new THREE.MeshBasicMaterial({ color: 0x3a3020 })); lamp.position.set(c.x,lampY,c.y); G.add(lamp); { const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,r.id==='capilla'?1.6:.3,4), lam(0x161414)); cord.position.set(c.x,r.id==='capilla'?6.67:FH-.12,c.y); G.add(cord); const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.18, 8, 1, true), lam(0x7a4a28, { side: THREE.DoubleSide })); shade.position.set(c.x,lampY+.11,c.y); G.add(shade); } lampMeshes.push({ f, r: i, m: lamp });
    });
  }
  // escondites (posibles): activos con puerta entreabierta, inactivos con candado
  NDAHouseArt.buildHides(lam);
  // puertas con bisagra
  doorMeshesBuild();NDAHouseArt.buildDrawers(w);
  // apagadores junto a las puertas y caja de fusibles del Zaguán
  switchMeshes = [];
  SWITCHES.forEach(list => list.forEach(sw => { if (!sw) return; const g = new THREE.Group(); g.position.set(sw.x, 1.25, sw.y); if (sw.o === 'V') g.rotation.y = sw.side < 0 ? -Math.PI / 2 : Math.PI / 2; else g.rotation.y = sw.side < 0 ? Math.PI : 0;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.025), lam(COL.bone)); g.add(plate); const lever = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.07, 0.04), lam(0x3a2414)); lever.position.z = 0.02; g.add(lever);
    floorGroups[sw.f].add(g); switchMeshes.push({ s: sw, g, lever }); }));
  { const g = new THREE.Group(); g.position.set(FUSE.x, 0, FUSE.y); g.rotation.y = -(FUSE.face || 0) + Math.PI / 2;     const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.16), lam(0x5a5a5a)); box.position.set(0, 1.45, 0.02); box.castShadow = true; g.add(box);
    const lampF = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), new THREE.MeshBasicMaterial({ color: 0x40c060 })); lampF.position.set(0.12, 1.62, 0.12); g.add(lampF); floorGroups[FUSE.f].add(g); fuseMesh = { g, lamp: lampF }; }
  // objetos sueltos de cada cuarto (lo que el ánima puede aventar)
  looseMeshes = w.loose.map(o => { const m = makeLooseMesh(o.kind, lam,o); floorGroups[o.f].add(m); return m; });
  // maletín, altar, salida
  
  altarGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.35 })); altarGlow.position.set(ALTAR_POS.x, 1.5, ALTAR_POS.y); floorGroups[ALTAR_POS.f].add(altarGlow);
  { // altar de muertos (cuarto al azar)
    const g = new THREE.Group(); const surface=w.altarSurface;g.position.set(surface.x,surface.h,surface.y);floorGroups[surface.f].add(g); const add = (geo, c, x, y, z, e) => { const m = new THREE.Mesh(geo, lam(c, e ? { emissive: e } : undefined)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    add(new THREE.BoxGeometry(.75,.10,.65),0x5a0f1e,0,.05,0);
    add(new THREE.BoxGeometry(0.78, 0.02, 0.68), 0xf3e6cf, 0, 0.11, 0); for (let k = 0; k < 7; k++) add(new THREE.OctahedronGeometry(0.07), 0xf08a1a, -0.30 + k * 0.10, 0.18, 0.3, 0x3a1800);
    for (let k = 0; k < 4; k++) { add(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6), 0xf3e6cf, -0.27 + k * 0.18, 0.24, 0.12); add(new THREE.OctahedronGeometry(0.03), 0xffc860, -0.27 + k * 0.18, 0.39, 0.12, 0xffa020); }
 }
  // luces
  ambient = new THREE.AmbientLight(0x3a3060, 0.9); scene.add(ambient);
  hemi = new THREE.HemisphereLight(0x6070a0, 0x100810, 0.45); scene.add(hemi);
  flash = new THREE.SpotLight(0xffe6b8, 18, 18, 0.5, 0.45, 1); flash.castShadow = true; flash.shadow.mapSize.set(1024, 1024); flash.shadow.bias = -0.002;flash.shadow.normalBias=.03; scene.add(flash); scene.add(flash.target);
  botFlashes = (NDAVisualQuality.current().detail?[0,1]:[]).map(() => { const s = new THREE.SpotLight(0xffe6b8, 10, 12, 0.5, 0.5, 1); scene.add(s); scene.add(s.target); return s; });
  roomLights = (NDAVisualQuality.current().detail?[0,1,2,3]:[0,1]).map(() => { const p = new THREE.PointLight(0xffd59a, 10, 13, 1); scene.add(p); return p; });
  velaLights = (NDAVisualQuality.current().detail?[0,1]:[0]).map(() => { const p = new THREE.PointLight(0xffa850, 5, 5, 1); scene.add(p); return p; });
  blueLight = new THREE.PointLight(0x7ec8ff, 4, 5, 1);
  if(w.propPositions)w.propPositions.forEach(p=>Object.assign(PROPS[p.id],p));buildProps(lam);
  // personajes
  halluMesh = null; invMeshes = []; itemMeshes = new Map(); fxMeshes = new Map(); heardMarks = [];
  ghostMesh = makeGhostRig(w.g.look, w.g.def.n); scene.add(ghostMesh.g);
  NDAVisualQuality.apply(renderer,flash);
}
let halluMesh = null, ceilMeshes = [], propMeshes = [], switchMeshes = [], fuseMesh = null, looseMeshes = [];
const LOOSE_COL = { jarron: 0xe0782a, plato: 0xf3e6cf, vela: 0xf3e6cf, libro: 0x5a0f1e, taza: 0x23565c, figura: 0xb85a2a, cuadro: 0xb8902a };
function makeLooseMesh(kind, lam,object) {
  if(object?.assetId)return NDADecorArt.create(object.assetId);
  if(kind==='libro'&&object?.shelfId)return NDAHouseArt.bookMesh(object);
  const g = new THREE.Group(), c = LOOSE_COL[kind] || 0x8a6a40, add = (geo, col, y) => { const m = new THREE.Mesh(geo, lam(col)); m.position.y = y; m.castShadow = true; g.add(m); return m; };
  switch (kind) {
    case 'jarron': add(new THREE.CylinderGeometry(0.06, 0.09, 0.12, 6), c, 0.06); add(new THREE.CylinderGeometry(0.04, 0.09, 0.1, 6), c, 0.17); add(new THREE.CylinderGeometry(0.05, 0.04, 0.05, 6), c, 0.245); break;
    case 'plato': add(new THREE.CylinderGeometry(0.13, 0.09, 0.03, 8), c, 0.015); add(new THREE.CylinderGeometry(0.1, 0.1, 0.032, 8), 0x23565c, 0.017); break;
    case 'vela': add(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 6), c, 0.1); add(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 6), 0xb8902a, 0.01); break;
    case 'libro': add(new THREE.BoxGeometry(0.2, 0.05, 0.27), c, 0.025); add(new THREE.BoxGeometry(0.19, 0.04, 0.25), 0xf3e6cf, 0.026); break;
    case 'taza': add(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 6), c, 0.045); add(new THREE.TorusGeometry(0.03, 0.008, 3, 6), c, 0.05).position.x = 0.055; break;
    case 'figura': add(new THREE.CylinderGeometry(0.03, 0.06, 0.14, 5), c, 0.07); add(new THREE.OctahedronGeometry(0.045), c, 0.17); break;
    case 'muneca': add(new THREE.CylinderGeometry(0.05, 0.08, 0.16, 6), 0xf3e6cf, 0.08); add(new THREE.OctahedronGeometry(0.06), 0xe8cfc0, 0.22); add(new THREE.CylinderGeometry(0.065, 0.05, 0.05, 6), 0x2a1418, 0.27); break;
    case 'calavera': add(new THREE.IcosahedronGeometry(0.08, 0), 0xf3e6cf, 0.08); add(new THREE.OctahedronGeometry(0.018), 0xc0396b, 0.1).position.set(-0.03, 0.1, 0.07); add(new THREE.OctahedronGeometry(0.018), 0x23565c, 0.1).position.set(0.03, 0.1, 0.07); break;
    case 'foto': { const m = add(new THREE.BoxGeometry(0.16, 0.2, 0.02), 0x3a2414, 0.1); m.rotation.x = -0.3; add(new THREE.BoxGeometry(0.12, 0.15, 0.025), 0x8a8078, 0.1).rotation.x = -0.3; break; }
    case 'silla': add(new THREE.BoxGeometry(0.42, 0.05, 0.42), 0x6a3e26, 0.45); add(new THREE.BoxGeometry(0.42, 0.5, 0.05), 0x6a3e26, 0.72).position.z = -0.19; [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([x, z]) => { const l = add(new THREE.BoxGeometry(0.04, 0.45, 0.04), 0x4a2a18, 0.22); l.position.x = x; l.position.z = z; }); break;
    case 'cuadro': { const m = add(new THREE.BoxGeometry(0.3, 0.24, 0.025), c, 0.12); m.rotation.x = -0.25; add(new THREE.BoxGeometry(0.24, 0.18, 0.03), 0x23565c, 0.12).rotation.x = -0.25; break; }
  }
  return g;
}
function updateLoose(t) {
  w.loose.forEach((o, k) => { const m = looseMeshes[k]; if (!m) return; m.visible = !o.gone; const a = w.t - o.flyT;
    if (a >= 0 && a < 0.55 && o.from) { const u = a / 0.55; m.position.set(o.from.x + (o.x - o.from.x) * u, o.from.h * (1 - u) + Math.sin(u * Math.PI) * 0.9, o.from.y + (o.y - o.from.y) * u); m.rotation.set(u * 6, o.rot, u * 3);if(o.shelfId){m.position.y+=.13*u;m.rotation.set(-u*Math.PI/2,o.rot*u,0);} }
    else if(o.shelfId&&o.h===0){m.position.set(o.x,.13,o.y);m.rotation.set(-Math.PI/2,o.rot,0);}
    else if (o.float) { m.position.set(o.x, o.h + Math.sin(t * 0.7 + k) * 0.03, o.y); m.rotation.set(0, o.rot + t * 0.15, 0); }
    else if(o.assetId&&o.h===0){const b=m.geometry.boundingBox;m.rotation.set(0,o.rot,o.upside?Math.PI:0);m.position.set(o.x,.018+(o.upside?b.max.y:-b.min.y),o.y);}
    else { m.position.set(o.x, o.h, o.y); m.rotation.set(o.h > 0 ? 0 : (o.anom ? 0 : Math.PI / 2 * (k % 2)), o.rot, o.upside ? Math.PI : 0); } });
  for (let k = looseMeshes.length; k < w.loose.length; k++) { const o = w.loose[k], m = makeLooseMesh(o.kind, c0 => LambertFlat({ color: c0 }),o); floorGroups[o.f].add(m); looseMeshes.push(m); }
}
function buildProps(lam) {
  propMeshes = [];
  for (const p of PROPS) {
    const g = new THREE.Group(); g.position.set(p.x,p.h||0,p.y);g.rotation.y=p.rotationY||0; floorGroups[p.f].add(g); const part = new THREE.Group(); g.add(part);
    const box = (sx, sy, sz, x, y, z, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), lam(c)); m.position.set(x, y, z); m.castShadow = true; part.add(m); return m; };
    const cyl = (r, h, x, y, z, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), lam(c)); m.position.set(x, y, z); m.castShadow = true; part.add(m); return m; };
    if(p.kind==='fuente'){propMeshes.push({p,g,part});continue;}
    if(NDAFurnitureProps.build(part,p)){NDAHouseArt.mergeProp(part);propMeshes.push({p,g,part});continue;}
    switch (p.kind) {
      case 'mecedora': case 'caballito': box(0.6, 0.06, 0.6, 0, 0.45, 0, 0x6a3a20); box(0.6, 0.6, 0.06, 0, 0.8, -0.28, 0x6a3a20); box(0.8, 0.05, 0.08, 0, 0.05, 0.25, 0x4a2a14); box(0.8, 0.05, 0.08, 0, 0.05, -0.25, 0x4a2a14); if (p.kind === 'caballito') { box(0.2, 0.3, 0.5, 0, 0.75, 0, 0xc95f3a); } break;
      case 'cuna':{box(1.65,.08,.75,0,.48,0,0x66412b);box(1.5,.07,.65,0,.56,0,0xe4d4b7);for(const xx of[-.76,.76])for(const zz of[-.30,.30])box(.075,.5,.075,xx,.25,zz,0x66412b);for(const z of[-.36,.36]){box(1.7,.06,.06,0,1.0,z,0x66412b);for(let x=-.78;x<.8;x+=.22)box(.035,.52,.035,x,.74,z,0x66412b);}break;}
      case 'grifo':cyl(.085,.65,0,.325,0,0xe8e8e0);cyl(0.05, 0.3, 0, 1.0, 0, 0xb0b0b0); box(0.5, 0.25, 0.4, 0, 0.75, 0, 0xe8e8e0); break;
      case 'fuente': cyl(0.08, 0.6, 0, 1.0, 0, COL.bone); break;
      case 'cuadro': box(0.7, 0.55, 0.05, 0, 1.6, -0.45, 0xb8902a); box(0.6, 0.45, 0.06, 0, 1.6, -0.43, 0x4a5a6a); break;
      case 'campanita': cyl(0.06,0.12,0,.06,0, COL.gold); break;
      case 'libros': for (let k = 0; k < 3; k++) box(0.25, 0.08, 0.18, 0, 0.04 + k * 0.08, 0, [0xa23b3b, 0x3b6aa2, 0x5f8a4a][k]); break;
      case 'reloj': box(0.4, 1.9, 0.3, 0, 0.95, 0, 0x4a2a14); cyl(0.14, 0.04, 0, 1.6, 0.16, COL.bone).rotation.x = Math.PI / 2; break;
      case 'muneca': box(0.14, 0.25, 0.1, 0, 0.62, 0, 0xe8d0c0); cyl(0.07, 0.12, 0, 0.82, 0, 0xf0dccc); box(0.4, 0.5, 0.4, 0, 0.25, 0, 0x6a3a20); break;
      case 'ventana': box(1.2, 1.1, 0.05, 0, 1.5, -0.45, 0x1a2a50); box(1.3, 0.06, 0.08, 0, 1.5, -0.42, 0x6a3a20); break;
      case 'radio':box(.5,.30,.25,0,.15,0,0x6a3a20); break;
      case 'piano':box(2.6,1.05,1.5,0,.525,-.05,0x1a1012);box(2.4,.05,.25,0,.85,.77,0xf0f0f0);for(let k=0;k<15;k++)box(.035,.04,.14,-1.05+k*.15,.89,.74,0x202020); break;
      case 'maquina':box(.5,.25,.25,0,.17,0,0x202020);box(.6,.045,.35,0,.025,0,0x6a3a20); break;
      case 'cajita': box(0.2, 0.12, 0.15, 0, 0.06, 0, 0xb83a5a); break;
      case 'baul': box(0.9, 0.5, 0.5, 0, 0.25, 0, 0x5b3a20); break;
      case 'papeles': for (let k = 0; k < 5; k++) box(0.2, 0.005, 0.28, Math.sin(k) * 0.3, 0.01 + k * 0.004, Math.cos(k) * 0.3, 0xf0e6cf); break;
    }
    NDAHouseArt.mergeProp(part);propMeshes.push({ p, g, part });
  }
}
function updateProps(t, vf) {
  const pa = w.propAnim || {};
  for (const pm of propMeshes) { pm.g.visible = pm.p.f === vf || vf === 1 || (vf === 0 && pm.p.f === 0); const a = pa[pm.p.id] !== undefined ? w.t - pa[pm.p.id] : 99; const k = Math.max(0, 1 - a / 6);
    switch (pm.p.kind) { case 'mecedora': case 'caballito': case 'muneca': pm.part.rotation.x = Math.sin(t * 4) * 0.18 * k; pm.part.rotation.y = pm.p.kind === 'muneca' ? k * 2.5 : 0; break;
      case 'cuadro': pm.part.position.y = a < 99 ? -1.4 * Math.min(1, a * 2) : 0; pm.part.rotation.z = a < 99 ? 0.6 : 0; break;
      case 'baul': case 'piano': case 'maquina': case 'radio': case 'ventana': case 'reloj': pm.part.position.x = Math.sin(t * 40) * 0.02 * k; break;
      default: pm.part.position.y = Math.abs(Math.sin(t * 6)) * 0.15 * k; } }
}

// ---------- Decoración de la casona (sin colisión) ----------
function doorMeshesBuild(){NDAHouseArt.buildDoors();}
const ITEM_COLOR = { foco: 0xf3e6cf, ceniza: 0x8a8580, cruz: 0xc8b070, pan: 0xc9853a, limpia: 0xf3efe6, tarot: 0x3a1f5a, tablilla: 0xe0a040, espejoplata: 0xd8dce4, mano: 0x8a6a40, muneca: 0xe8c0c8, pentagrama: 0x2a2030, radio: 0x202020, termo: 0xcfd6dd, grab: 0x222428, espejo: 0xd8e0ea, uv: 0x7a3cff, cam: 0x30343a, emf: 0x2d4a2d, gases: 0xd8b030, te: COL.orange, rosario: COL.bone, ruda: 0x4f8a3a, copal: 0x9a8f80, vela: 0xf3e6cf };
function makeItemMesh(it) {
  const g = new THREE.Group(); const c = ITEM_COLOR[it.kind]; let m;
  const lam = (col, e) => LambertFlat({ color: col, emissive: e || 0x000000 });
  const toolModel=NDAToolArt.create(it.kind);
  if(toolModel)m=toolModel;else switch (it.kind) {
    case 'espejo': m = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), lam(c, 0x202830)); m.rotation.x = Math.PI / 2; m.position.y = 0.25; break;
    case 'uv': case 'gases': case 'termo': m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.32, 8), lam(c)); m.rotation.z = Math.PI / 2; m.position.y = 0.1; break;
    case 'rosario': m = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 6, 14), lam(c, 0x302820)); m.rotation.x = Math.PI / 2; m.position.y = 0.05; break;
    case 'ruda': m = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 6), lam(c, 0x0a2008)); m.position.y = 0.18; break;
    case 'copal': m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.12, 10), lam(c)); m.position.y = 0.06; break;
    case 'te': m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 10), lam(c)); m.position.y = 0.07; break;
    case 'vela': m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 8), lam(c)); m.position.y = 0.14; break;
    case 'ceniza': m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), lam(c)); m.scale.y = 0.8; m.position.y = 0.1; break;
    case 'cruz': m = new THREE.Group(); { const v = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.03), lam(c, 0x201808)), h = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.03), lam(c, 0x201808)); v.position.y = 0.21; h.position.y = 0.3; m.add(v, h); } break;
    case 'pan': m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(c, 0x200a00)); break;
    case 'limpia': m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), lam(c)); m.scale.y = 1.3; m.position.y = 0.09; break;
    case 'tarot': m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.3), lam(c, 0x200a30)); m.position.y = 0.03; break;
    case 'tablilla': m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.38), lam(c, 0x301800)); m.position.y = 0.02; break;
    case 'espejoplata': m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), lam(c, 0x405060)); m.rotation.x = Math.PI / 2; m.scale.set(0.8, 1, 1.2); m.position.y = 0.3; break;
    case 'mano': m = new THREE.Group(); for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.16), lam(c)); f.position.set(-0.06 + k * 0.03, 0.04, 0.06); f.rotation.x = -0.4; m.add(f); } { const pal = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.12), lam(c)); pal.position.y = 0.03; m.add(pal); } break;
    case 'muneca': m = new THREE.Group(); { const b = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 8), lam(c)), h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), lam(0xf0dccc)); b.position.y = 0.11; h.position.y = 0.27; m.add(b, h); } break;
    case 'pentagrama': { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); x.strokeStyle = '#d8d0e8'; x.lineWidth = 4; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.stroke(); x.beginPath(); for (let k = 0; k <= 5; k++) { const a = -Math.PI / 2 + k * 4 * Math.PI / 5; x[k ? 'lineTo' : 'moveTo'](64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); } x.stroke();
      m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; break; }
    case 'radio': m = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.06), lam(c)), a = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 4), lam(0x101010)); b.position.y = 0.11; a.position.set(0.03, 0.3, 0); m.add(b, a); } break;
    default: m = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.34), lam(c)); m.position.y = 0.06;
  }
  m.castShadow = true; g.add(m);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 20), new THREE.MeshBasicMaterial({ color: ITEMS[it.kind] && ITEMS[it.kind].cursed ? 0xb050ff : COL.gold, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.02; g.add(halo);
  const ind = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), new THREE.MeshBasicMaterial({ color: 0xff2020 })); ind.position.y = 0.32; ind.visible = false; g.add(ind);
  let beam = null; if (it.kind === 'uv' || it.kind === 'cam') { beam = new THREE.Mesh(new THREE.ConeGeometry(it.kind === 'uv' ? 1.6 : 2.4, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: it.kind === 'uv' ? 0x9a5cff : 0xaaaaaa, transparent: true, opacity: it.kind === 'uv' ? 0.08 : 0.04, depthWrite: false, side: THREE.DoubleSide })); beam.rotation.z = Math.PI / 2; beam.position.set(3, 0.3, 0); const piv = new THREE.Group(); piv.add(beam); g.add(piv); beam = piv; }
  let flame = null; if (it.kind === 'vela') { flame = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), new THREE.MeshBasicMaterial({ color: COL.gold })); flame.position.y = 0.33; flame.scale.y = 1.8; g.add(flame); }
  let mark = null; if (it.kind === 'espejo') { mark = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: handT, transparent: true, depthWrite: false, side: THREE.DoubleSide })); mark.position.set(0, 0.25, 0.03); mark.visible = false; g.add(mark); }
  scene.add(g); return { g, m, halo, ind, beam, flame, mark };
}

let placeMarker = null;
function makePlaceMarker() {
  const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), m); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 3), m); arrow.rotation.z = -Math.PI / 2; arrow.position.set(0.38, 0.05, 0); g.add(arrow);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 4, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xb080ff, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })); cone.rotation.z = Math.PI / 2; cone.position.set(2.2, 0.3, 0); g.add(cone);
  scene.add(g); return { g, ring, arrow, cone, m };
}
function updatePlacement(t) {
  if (!scene) return; if (!placeMarker || placeMarker.g.parent !== scene) placeMarker = makePlaceMarker();
  const me = w && w.opt.role === 'inv' ? w.invs[ME] : null, h = me && me.alive && me.hidden < 0 ? handItem(me) : null;
  if (!h) { placeMarker.g.visible = false; return; }
  let x, y, show = true;
  if (throwing) { const dist = clamp(2 + Math.min(1, throwHold / 1.0) * 6, 1.5, CFG.throwMax); x = me.x; y = me.y; const dx = Math.cos(me.face), dy = Math.sin(me.face); for (let s = 0; s < dist; s += 0.25) { const nx = x + dx * 0.25, ny = y + dy * 0.25; if (!walkableT(tileAt(me.f, nx, ny))) break; x = nx; y = ny; } }
  else { x = me.x + Math.cos(me.face) * 0.5; y = me.y + Math.sin(me.face) * 0.5; show = !!(ITEMS[h.kind].tool && h.kind !== 'termo') || ['cruz', 'ceniza', 'pan', 'vela'].includes(h.kind); }
  placeMarker.g.visible = show; if (!show) return;
  placeMarker.g.position.set(x, me.f * FH, y); placeMarker.g.rotation.y = -me.face;
  placeMarker.arrow.visible = !throwing && ['uv', 'cam', 'emf', 'grab', 'espejo', 'gases'].includes(h.kind); placeMarker.cone.visible = false;
  placeMarker.m.color.setHex(throwing ? 0xff9a4a : COL.gold); placeMarker.m.opacity = 0.4 + Math.sin(t * 5) * 0.15;
}
function footstep(i, speed, self) {
  if (!audio || audio.muted || !w) return; const V = viewer(); if (!V || (V.f !== i.f && !self)) return;
  const p = self ? null : { f: i.f, x: i.x, y: i.y }; const run = speed > 3, r = roomOf(i), outside = r >= 0 && ['patio', 'zaguan'].includes(ROOMS[i.f][r].id);
  const vol = (run ? 0.22 : 0.12) * (self ? 0.7 : 1);
  if (outside) noise(0.09, 'bandpass', 2600, 1.2, vol * 1.2, p); else if (i.f === 1) { noise(0.07, 'lowpass', 420, 1, vol * 1.6, p); if (Math.random() < 0.12) tone(150 + Math.random() * 60, 0.25, 'sawtooth', 0.015, p, 30); }
  else { noise(0.05, 'bandpass', 1400, 1.5, vol, p); noise(0.06, 'lowpass', 300, 1, vol, p); }
}
// ---------- Visibilidad según quién mira ----------
let specIdx = 0; // ya en la camioneta: a qué compañero sigues
addEventListener('keydown', e => { if (w && running && w.opt.role === 'inv' && w.invs[ME] && w.invs[ME].escaped && [' ', 'ArrowRight', 'e', 'E', 'Enter'].includes(e.key)) { specIdx++; e.preventDefault(); } });
function viewer() {
  if (!w) return null;
  if (w.opt.role === 'ghost') return w.g;
  if (w.opt.role === 'inv') { const me = w.invs[ME]; if (me.alive && !me.escaped) return me; if (me.escaped) { const L = w.invs.filter(i => i.alive && !i.escaped); if (L.length) return L[specIdx % L.length]; } return me; }
  const list = [w.g, ...alive(w)]; return list[follow % list.length];
}
function viewKind() { if (!w) return 'inv'; if (w.opt.role === 'ghost') return 'ghost'; if (w.opt.role === 'bots') return 'all'; const me = w.invs[ME]; return me.alive ? 'inv' : 'spirit'; }
const me0 = () => w && w.opt.role === 'inv' ? w.invs[ME] : null;
function ghostOpacity(t, V, vk) {
  const g = w.g, def = g.def;
  if (vk === 'ghost' || vk === 'all') return def.invisible ? 0.35 : 1;
  if (vk === 'spirit') return 0.85;
  if (g.state === 'despertando' || g.state === 'poseyendo' || def.invisible) return 0;
  if (!V || V.f !== g.f) return 0;
  const d = Math.hypot(V.x - g.x, V.y - g.y);
  if (t < g.blindUntil) return Math.sin(t * 30) > 0 ? 0.9 : 0.1;
  if (g.exposed) return 0.8;
  if (g.hunt) return def.visibleHunt(w, g, V) && sees(V,g,20,w) ? (Math.sin(t * 23) + Math.sin(t * 7.3) > -0.5 ? 0.9 : 0.1) : 0;
  if (t < g.revealUntil && d < 10) return 0.6;
  if (d < 2.6 && V.flash && t >= V.flashOffUntil) return 0.22 + Math.sin(t * 5) * 0.06;
  return 0;
}

// ---------- Actualización de la escena ----------
function updateScene(t, dt) {
  const V = viewer(), vk = viewKind(), g = w.g;
  const vf = V ? V.f : 0;
  floorGroups[1].visible = !(vk==='all'&&vf===0);
  floorGroups[0].visible = true;
  for(const m of houseArtState?.meshes||[]){if(m.userData.viewFloor!==undefined)m.visible=vk!=='all'||m.userData.viewFloor<=vf;if(m.userData.ceilingDetail)m.visible=vk!=='all';}
  // muros recortados entre la cámara y el personaje
  for (const r of wallRuns) { const cut = vk === 'all' && r.f === vf && V && r.y > V.y - 0.5 && r.y - V.y < 9 && r.x1 >= V.x - 9 && r.x0 <= V.x + 9; const s = cut ? 0.22 : 1; r.g.scale.y += (s - r.g.scale.y) * Math.min(1, dt * 8); }
  // puertas
  for (const dm of doorMeshes) { const d=dm.d;dm.leaves.forEach((leaf,k)=>{const target=d.closed?0:(k?-dm.base:dm.base)*(1-d.anim*.9);leaf.rotation.y+=(target-leaf.rotation.y)*Math.min(1,dt*10);}); dm.glow.visible = t < d.glowUntil; dm.ruda.visible = t < d.rudaUntil; dm.ros.visible = !!d.rosario; }
  // escondites
  for (const sm of spotMeshes) { const act = w.spotsActive.has(sm.k); sm.lock.visible = !act; sm.slit.visible = !act; const occ = w.invs.some(i => i.alive && i.hidden === sm.k); sm.door.rotation.y = act && !occ ? 0.12 : 0; sm.eyes.visible = w.fx.some(f => f.kind === 'sello_ropero' && Math.hypot(f.x - SPOTS[sm.k].hx, f.y - SPOTS[sm.k].hy) < 0.6 && t - f.t < 6); }
  // velas y focos
  const vIn = V && !['afuera', 'afuera1'].includes((ROOMS[V.f][roomAt(V.f, V.x, V.y)] || {}).id); // los efectos de la cacería solo se ven DENTRO de la casona
  const huntFlick = g.hunt && vIn && Math.random() < 0.35;
  for (const c of candleMeshes) { c.flame.material.color.setHex(COL.gold); c.flame.scale.x = c.flame.scale.z = 1 + Math.sin(t * 13 + c.r) * 0.15; }
  for (const l of lampMeshes) l.m.material.color.setHex(w.burnt[l.f][l.r] ? 0x141010 : w.lights[l.f][l.r] && !huntFlick ? 0xffe6a8 : 0x2a2418);
  for (const sw of switchMeshes) { sw.lever.rotation.x = w.lights[sw.s.f][sw.s.r] ? -0.5 : 0.5; sw.g.visible = sw.s.f === vf || vf === 1; }
  if (fuseMesh) fuseMesh.lamp.material.color.setHex(w.fuse.every(Boolean) ? 0x40c060 : (Math.sin(t * 6) > 0 ? 0xff3020 : 0x401010));
  // luces de cuartos: las más cercanas encendidas en los pisos visibles
  const lit = [];
  ROOMS.forEach((rs, f) => rs.forEach((r, i) => { if (!w.lights[f][i] || r.id === 'vacio' || r.id === 'afuera' || r.id === 'afuera1' || (f === 1 && vf === 0)) return; const c = ROOM_CENTER[f][i]; if (!c) return; lit.push({ f, c, d: V ? Math.hypot(c.x - V.x, c.y - V.y) + (f !== vf ? 12 : 0) : 0, id: r.id }); }));
  lit.sort((a, b) => a.d - b.d);
  roomLights.forEach((p, k) => { const L = lit[k]; if (!L || L.id === 'patio') { p.intensity = 0; if (L) { p.position.set(L.c.x, L.f * FH + 6, L.c.y); p.intensity = 6; p.distance = 30; p.color.setHex(0x8090c0); } return; }
    p.position.set(L.c.x, L.f * FH + FH - 0.5, L.c.y); p.distance = 13; p.color.setHex(0xffd59a); p.intensity = huntFlick ? 1 : 10; });
  const velas = w.items.filter(it => it.kind === 'vela' && it.lit && !it.holder).sort((a, b) => V ? Math.hypot(a.x - V.x, a.y - V.y) - Math.hypot(b.x - V.x, b.y - V.y) : 0);
  velaLights.forEach((p, k) => { const v = velas[k]; p.intensity = 0; if (v) { p.position.set(v.x, v.f * FH + 0.6, v.y); p.intensity = 4 + Math.sin(t * 11 + k) * 0.6; } });
  const hc = ROOM_CENTER[g.home.f][g.home.r]; blueLight.intensity = 0; blueLight.position.set(hc.x, g.home.f * FH + 0.6, hc.y);
  // ambiente según quién mira
  const amb = vk === 'ghost' ? 2.6 : vk === 'spirit' || vk === 'all' ? 2.0 : 1.02;
  ambient.intensity = amb; hemi.intensity=vk==='inv'?.58:.45; ambient.color.setHex(vk === 'ghost' ? 0x5070a0 : 0x3a3060); scene.fog.near = vk === 'inv' ? 14 : 30; scene.fog.far = vk === 'inv' ? 34 : 80;
  // linterna del jugador
  if (V && V.kind === 'inv' && V.alive) { const on = V.flash && t >= V.flashOffUntil; flash.intensity = !on ? 0 : g.hunt && sees(V, g, 12,w) && Math.random() < 0.25 ? 4 : 18; flash.position.set(V.x + Math.cos(V.face + 0.6) * 0.3, elv(V) + 1.3, V.y + Math.sin(V.face + 0.6) * 0.3); if (V === me0() && viewKind() === 'inv') { const dir = camLook.clone().sub(camera.position).normalize(); if (menuOpt.cam === 'fp') flash.position.copy(camera.position).addScaledVector(dir, 0.25).add(new THREE.Vector3(Math.cos(V.face + 1.4) * 0.18, -0.25, Math.sin(V.face + 1.4) * 0.18)); flash.target.position.copy(flash.position).addScaledVector(dir, 8); } else flash.target.position.set(V.x + Math.cos(V.face) * 7, elv(V) + 1.0, V.y + Math.sin(V.face) * 7); }
  else flash.intensity = 0;
  const others = w.invs.filter(i => i !== V && i.alive && !i.escaped && i.flash && t >= i.flashOffUntil && i.hidden < 0 && (i.f === vf || vf === 1));
  botFlashes.forEach((s, k) => { const i = others[k]; s.intensity = i ? 10 : 0; if (i) { s.position.set(i.x, elv(i) + 1.1, i.y); s.target.position.set(i.x + Math.cos(i.face) * 6, i.f * FH, i.y + Math.sin(i.face) * 6); } });
  // investigadores
  while (invMeshes.length < w.invs.length) { const r = makeCharacter(w.invs[invMeshes.length].char, paper); scene.add(r.g); invMeshes.push(r); }
  w.invs.forEach((i, k) => { const m = invMeshes[k]; const isDead = !i.alive;
    let vis = !i.escaped && (i.f === vf || vf === 1) && i.hidden < 0;
    if (vk === 'ghost' && !isDead) vis = vis && w.g.perceived.has(i);
    if (isDead) vis = (vk === 'spirit' || vk === 'all' || vk === 'ghost') && (i.f === vf || vf === 1);
    m.g.visible = vis; m.g.position.set(i.x, elv(i), i.y); m.g.rotation.y = -i.face + Math.PI / 2;
    const fpSelf = menuOpt.cam === 'fp' && vk === 'inv' && i === V && i.alive; m.head.visible = m.hair.visible = !fpSelf; m.torso.children[0].visible = !fpSelf;
    const hk0 = i.slots[i.hand] ? i.slots[i.hand].kind : null;
    const ph0 = m.ph;
    if (!!i.possessed !== !!m.noShadow) { m.noShadow = !!i.possessed; m.g.traverse(o => { if (o.isMesh) o.castShadow = !m.noShadow; }); }
    animateCharacter(m, { x: i.x + i.f * 100, y: i.y, t, dt, hidden: i.hidden >= 0, dead: isDead, manifest: isDead && i.spirit.until > w.t, lamp: !isDead && i.flash && w.t >= i.flashOffUntil, holding: !!hk0, aim: AIM_KINDS.includes(hk0), tremble: isDead ? 0 : clamp01((35 - i.san) / 35) });
    if (i.alive && !i.escaped && i.hidden < 0 && Math.floor(m.ph / Math.PI) !== Math.floor(ph0 / Math.PI) && m.speed > 0.4) footstep(i, m.speed, i === V);
    const hk = i.slots[i.hand] ? i.slots[i.hand].kind : null; if (hk !== m.handKind) { m.handKind = hk; m.hand.clear(); if (hk) { const im = makeItemMesh({ kind: hk }); scene.remove(im.g); im.halo.visible = false; im.g.scale.setScalar(0.8); im.g.rotation.y = -Math.PI / 2; im.g.position.y = -0.06; m.hand.add(im.g); m.handItem = im; } else m.handItem = null; }
    if(m.handItem&&i.slots[i.hand])NDAToolArt.update(m.handItem.m,i.slots[i.hand],t,true);
    if (m.handItem && m.handItem.beam) { m.handItem.beam.visible = i.alive && i.hidden < 0; }
  });
  // ánima
  const op = ghostOpacity(t, V, vk), blind = w.t < g.blindUntil;
  if (blind) ghostMesh.opS = op;
  animateGhostRig(ghostMesh, { x: g.x + g.f * 100, y: g.y, t, dt, hunt: !!g.hunt, blind, stunned: w.t < g.stunUntil && w.t < g.revealUntil, op });
  ghostMesh.g.visible = ghostMesh.opS > 0.01 && (g.f === vf || vf === 1);
  if (ghostMesh.label) ghostMesh.label.visible = false;
  ghostMesh.mat.emissive.setHex(g.hunt ? 0x802020 : 0x405070);
    { const gl = w.t < (g.revealUntil || 0); if (ghostMesh.glossy !== gl) { ghostMesh.glossy = gl; ghostMesh.fade.forEach(m => { const polished = gl && !ghostMesh.g.userData.approvedArt; m.roughness = polished ? 0.08 : 0.95; m.metalness = polished ? 0.55 : 0; m.flatShading = !polished; m.needsUpdate = true; }); } } ghostMesh.eyeMat.color.setHex(g.hunt ? 0xff3b4a : COL.gold);
  ghostMesh.g.position.set(g.x, elv(g), g.y); ghostMesh.g.rotation.y = -g.face + Math.PI / 2;
  // alucinación: un doble tal cual; 1 de cada 10, monstruoso
  { const h = w.hallu, mine = h && V && V.kind === 'inv' && V.id === h.who && vk === 'inv';
    if (mine) { const key = h.char + h.variant + h.t0; if (!halluMesh || halluMesh.key !== key) { if (halluMesh) scene.remove(halluMesh.r.g); const r = makeCharacter(h.char); scene.add(r.g); halluMesh = { r, key, lx: h.x, ly: h.y };
        if (h.variant === 'invertido') r.mats.forEach(m => m.color.setRGB(1 - m.color.r, 1 - m.color.g, 1 - m.color.b)); if (h.variant === 'brillo') r.mats.forEach(m => { m.roughness = 0.08; m.metalness = 0.6; m.flatShading = false; m.needsUpdate = true; });
        if (h.variant === 'largo') { r.armL.scale.y = r.armR.scale.y = 1.7; r.legL.scale.y = r.legR.scale.y = 1.25; r.hips.position.y *= 1.25; r.head.scale.setScalar(0.8); } }
      const r = halluMesh.r, toMe = Math.atan2(V.y - h.y, V.x - h.x), dme = Math.hypot(V.x - h.x, V.y - h.y);
      if (h.beh === 'alejarse') { const nx = h.x - Math.cos(toMe) * 1.1 * dt, ny = h.y - Math.sin(toMe) * 1.1 * dt; if (walkableT(tileAt(h.f, nx, ny))) { h.x = nx; h.y = ny; } }
      else if (h.beh === 'acercarse' && dme > 2.2) { const nx = h.x + Math.cos(toMe) * 0.9 * dt, ny = h.y + Math.sin(toMe) * 0.9 * dt; if (walkableT(tileAt(h.f, nx, ny))) { h.x = nx; h.y = ny; } }
      else if (h.beh === 'espejo') { h.x += (V.vx || 0) * dt; h.y -= (V.vy || 0) * dt; }
      const face = h.beh === 'alejarse' ? toMe + Math.PI : toMe; r.g.visible = true; r.g.position.set(h.x, h.f * FH, h.y); r.g.rotation.y = -face + Math.PI / 2;
      animateCharacter(r, { x: h.x, y: h.y, t, dt, lamp: h.variant === 'normal' && Math.random() > 0.02, tremble: h.variant === 'largo' ? 1 : 0 });
      const lookAt = angDiff(Math.atan2(h.y - V.y, h.x - V.x), yaw) < 0.35;
      if (h.vanish === 'mirar' && lookAt && t - h.t0 > 1.2) h.until = Math.min(h.until, t + 0.1);
      if (h.vanish === 'acercarse' && dme < 2.5) h.until = Math.min(h.until, t + 0.1);
      if (h.vanish === 'parpadeo') { if (lookAt) h.seenOnce = true; else if (h.seenOnce) h.until = Math.min(h.until, t); } }
    else if (halluMesh) halluMesh.r.g.visible = false; }
  // objetos
  const seenIds = new Set();
  for (const it of w.items) { if (it.holder) continue; seenIds.add(it.id); let im = itemMeshes.get(it.id); if (!im) { im = makeItemMesh(it); itemMeshes.set(it.id, im); }
    im.g.visible = layoutItemVisible(w,it)&&(it.f === vf || vf === 1); im.g.position.set(it.x, it.f * FH + (it.h || 0), it.y); im.g.rotation.y = -it.dir;
    im.halo.material.opacity = 0.2 + Math.sin(t * 3 + it.id) * 0.12;
    if (it.kind === 'emf') { const on = t < it.emfUntil; im.ind.visible = on; im.ind.material.color.setHex(it.emfLvl >= 5 ? 0xff2020 : it.emfLvl >= 4 ? 0xff9020 : 0x40ff60); }
    NDAToolArt.update(im.m,it,t);
    if (it.kind === 'gases') { im.ind.visible = t < it.redUntil || t < (it.yellowUntil || 0); im.ind.material.color.setHex(t < it.redUntil ? 0xff2020 : 0xffb020); }
    if (it.kind === 'cam') { im.ind.visible = Math.sin(t * 2) > 0.6; im.ind.material.color.setHex(0xff2020); }
    if (it.kind === 'grab') im.ind.visible = false;
    if (it.kind === 'vela' && im.flame) im.flame.visible = it.lit;
    if (it.kind === 'espejo' && im.mark) { const V2 = viewer(); im.mark.visible = t < it.markUntil && !!V2 && V2.f === it.f && Math.hypot(V2.x - it.x, V2.y - it.y) < 9 && los(V2.f, V2.x, V2.y, it.x, it.y); } // la mano se ve desde lejos
    if (im.beam) im.beam.visible = true;
  }
  for (const [id, im] of itemMeshes) if (!seenIds.has(id)) { scene.remove(im.g); itemMeshes.delete(id); }
  // efectos
  updateFx(t, vf); updateProps(t, vf); updateLoose(t);NDAHouseArt.updateDrawers(w,dt);
  for (const m of ceilMeshes) m.visible = vk!=='all' && camera.position.y < m.userData.f * FH + FH - 0.05;
  // salida y altar
  const xd = w.doors.find(d => d.ext); exitMesh.material.emissive.setHex(xd && xd.locked ? 0x400000 : 0x000000);
  const open = xd && !xd.closed ? 1.4 : 0; exitMesh.leaves.forEach((l, k) => { const tg = (k ? -1 : 1) * open; l.rotation.y += (tg - l.rotation.y) * Math.min(1, dt * 3); });
  altarGlow.material.opacity = w.phase === 'night' ? 0.18 + Math.sin(t * 3) * 0.08 : 0.08;
  // marcas de lo que oye el ánima humana
  if (vk === 'ghost') { while (heardMarks.length < 6) { const m = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 24), new THREE.MeshBasicMaterial({ color: 0x9ad0ff, transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; scene.add(m); heardMarks.push(m); }
    const hs = g.heard.slice(-6); heardMarks.forEach((m, k) => { const h = hs[k]; m.visible = !!h && t - h.t < 2.5; if (h) { const a = (t - h.t) / 2.5; m.position.set(h.x, h.f * FH + 0.05, h.y); m.scale.setScalar(1 + a * 3); m.material.opacity = 0.8 * (1 - a); } }); }
  else heardMarks.forEach(m => (m.visible = false));
}
const FX_COLORS = { ceniza: 0x6a6560, sello_charcos: 0x3a6aa0, sello_escarcha: 0xe8f4ff, sello_monedas: 0xf2c84e, sello_aleteo: 0xf3e6cf, sello_cama: 0xe8d7b8, sello_tornado: 0x7a4a28, sello_reubicado: COL.gold, sello_rezo: 0xc0b0ff, sello_risa: 0xffe6a0, sello_gruñido: 0x803030, sello_rosarioroto: COL.bone, copal: 0xd8d4e8, llanto: 0x7ec8ff, mover: 0x7a4a28, flama: 0x5aa8ff, ruda: 0x4f8a3a };
function updateFx(t, vf) {
  const alive_ = new Set();
  w.fx.forEach((f, k) => { const key = f.kind + ':' + f.t + ':' + f.x.toFixed(2); alive_.add(key); let m = fxMeshes.get(key);
    if (!m) { m = new THREE.Group(); const col = FX_COLORS[f.kind] || 0xffffff;
      if (f.kind === 'ceniza') { const d = new THREE.Mesh(new THREE.CircleGeometry(0.7, 14), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, depthWrite: false })); d.rotation.x = -Math.PI / 2; d.position.y = 0.025; m.add(d); m.userData.disc = d;
        const pr = new THREE.Group(); for (let k = 0; k < 6; k++) { const fp = new THREE.Mesh(new THREE.CircleGeometry(0.08, 8), new THREE.MeshBasicMaterial({ color: 0xc080ff, transparent: true, opacity: 0.95 })); fp.rotation.x = -Math.PI / 2; fp.scale.set(0.7, 1.4, 1); fp.position.set(-0.30 + k * 0.104, 0.03, (k % 2) * 0.16 - 0.08); pr.add(fp); } pr.visible = false; m.add(pr); m.userData.prints = pr; }
      else if (f.kind === 'copal') { for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.9 + Math.random() * 0.6, 10, 8), LambertFlat({ color: col, transparent: true, opacity: 0.28, depthWrite: false })); s.position.set(Math.random() * 3 - 1.5, 0.7 + Math.random(), Math.random() * 3 - 1.5); m.add(s); } }
      else if (f.kind === 'sello_charcos') { for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.22 + Math.random() * 0.1, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 })); s.rotation.x = -Math.PI / 2; s.position.set(i * 0.5, 0.03, Math.sin(i) * 0.3); m.add(s); } }
      else if (f.kind === 'sello_escarcha') { for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.15, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 })); s.rotation.x = -Math.PI / 2; s.position.set(Math.random() * 2 - 1, 0.03, Math.random() * 2 - 1); m.add(s); } }
      else if (f.kind === 'sello_aleteo') { for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.22), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); s.position.set(Math.random() * 2 - 1, 2.2, Math.random() * 2 - 1); s.userData.v = 0.3 + Math.random() * 0.4; m.add(s); } }
      else if (f.kind === 'sello_monedas' || f.kind === 'flama') { const s = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: 0.9 })); s.position.y = 0.3; m.add(s); if (f.kind === 'sello_monedas') for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), LambertFlat({ color: col, emissive: 0x302000 })); c.position.set(Math.random() * 0.8 - 0.4, 0.02, Math.random() * 0.8 - 0.4); m.add(c); } }
      else if (f.kind === 'mover') { }
      else if (f.kind === 'sello_tornado') { for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), LambertFlat({ color: col })); s.userData.a = i * 2.1; m.add(s); } }
      else if (f.kind === 'llanto') { const s = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false })); s.rotation.x = -Math.PI / 2; s.position.y = 0.1; m.add(s); }
      else if (f.kind === 'sello_cama') { const s = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1.6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 })); s.position.y = 0.65; m.add(s); }
      else { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 })); s.position.y = 1.2; m.add(s); }
      scene.add(m); fxMeshes.set(key, m); }
    const age = t - f.t; m.visible = f.f === vf || vf === 1; m.position.set(f.x, f.f * FH, f.y);
    if (f.ash && m.userData.disc) { if (f.ash.stepped) m.userData.disc.scale.set(1.5, 0.7, 1); m.userData.prints.visible = !!f.ash.prints && (w.t < (f.ash.glowUntil || 0) || viewKind() !== 'inv'); }
    m.children.forEach(c => { if (c.userData.v) { c.position.y = Math.max(0.05, 2.2 - age * c.userData.v); c.rotation.z += 0.05; } if (c.userData.a !== undefined) { c.position.set(Math.cos(age * 4 + c.userData.a) * 0.8, 0.8 + Math.sin(age * 3 + c.userData.a) * 0.3, Math.sin(age * 4 + c.userData.a) * 0.8); c.rotation.x += 0.1; } if (f.kind === 'llanto') { c.scale.setScalar(1 + age * 6); c.material.opacity = Math.max(0, 0.8 - age * 0.5); } });
  });
  for (const [k, m] of fxMeshes) if (!alive_.has(k)) { scene.remove(m); fxMeshes.delete(k); }
}

// ---------- Cámara ----------
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
let yaw = -Math.PI / 2, pitch = -0.12;
// Cámara de hombro: detrás y a la derecha del personaje; se acerca si un muro estorba
function updateCamera(dt) {
  const V = viewer(); if (!V) return; const vk = viewKind();
  if(V.hidden<0||!V.alive)camera.userData.hideSpot=-1;
  if (vk === 'all') { const target = new THREE.Vector3(V.x, elv(V) + 0.8, V.y), want = new THREE.Vector3(V.x, elv(V) + 16, V.y + 9);
    camPos.lerp(want, Math.min(1, dt * 5)); camLook.lerp(target, Math.min(1, dt * 6)); if (camPos.distanceTo(want) > 20) { camPos.copy(want); camLook.copy(target); }
    camera.position.copy(camPos); camera.lookAt(camLook); return; }
  const fx = Math.cos(yaw), fy = Math.sin(yaw), rx = -fy, ry = fx; const base = elv(V);
  const head = { x: V.x, y: V.y }, back = vk === 'ghost' ? 3.4 : 2.6, side = 0.62;
  let wx = V.x - fx * back + rx * side, wy = V.y - fy * back + ry * side;
  // colisión con muros en el plano
  const n = 16; let ok = 1;
  for (let k = 1; k <= n; k++) { const t = k / n, px = head.x + (wx - head.x) * t, py = head.y + (wy - head.y) * t;
    if (sightBlockT(tileAt(V.f, px, py)) || (tileAt(V.f, px, py) === T.WALL)) { ok = Math.max(0.15, (k - 1.5) / n); break; } }
  wx = head.x + (wx - head.x) * ok; wy = head.y + (wy - head.y) * ok;
  const rig = V.kind === 'inv' && V.alive ? invMeshes[V.id] : null, bob = rig && vk === 'inv' ? Math.abs(Math.cos(rig.ph)) * 0.05 * Math.min(1, rig.speed / 2.6) : 0;
  if (vk === 'inv' && V.alive && V.hidden >= 0) { const sp = SPOTS[V.hidden], ox = sp.hx - (sp.x + 0.5), oy = sp.hy - (sp.y + 0.5), a0 = Math.atan2(oy, ox);if(camera.userData.hideSpot!==V.hidden){yaw=a0;pitch=0;camera.userData.hideSpot=V.hidden;}const a=a0+clamp(Math.atan2(Math.sin(yaw-a0),Math.cos(yaw-a0)),-.5,.5);
    camera.position.set(sp.x + 0.5 + ox * 0.28, base + (sp.eyeHeight||1.5), sp.y + 0.5 + oy * 0.28); camPos.copy(camera.position); camLook.set(camera.position.x + Math.cos(a) * 4, base + (sp.eyeHeight||1.5)-.1 + Math.sin(pitch) * 2, camera.position.z + Math.sin(a) * 4); camera.lookAt(camLook);
    if (Math.abs(camera.fov - 62) > 0.05) { camera.fov = 62; camera.updateProjectionMatrix(); } return; }
  if (menuOpt.cam === 'fp' && vk === 'inv' && V.alive) { const ey = base + (V.hidden >= 0 ? 0.9 : 1.58) + bob * 0.6; camera.position.set(V.x + fx * 0.12, ey, V.y + fy * 0.12); camPos.copy(camera.position); camLook.set(V.x + fx * 4 * Math.cos(pitch), ey + Math.sin(pitch) * 4, V.y + fy * 4 * Math.cos(pitch)); camera.lookAt(camLook);
    const fovF = rig && rig.speed > 3.0 ? 74 : 68; if (Math.abs(camera.fov - fovF) > 0.05) { camera.fov += (fovF - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); } return; }
  const camY = base + Math.min(FH - 0.35, 1.75 - pitch * 1.2) + bob;
  const fovT = rig && rig.speed > 3.0 ? 56 : 50; if (Math.abs(camera.fov - fovT) > 0.05) { camera.fov += (fovT - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); }
  const want = new THREE.Vector3(wx, camY, wy);
  const look = new THREE.Vector3(V.x + fx * 5 + rx * side, base + 1.45 + Math.tan(pitch) * 5, V.y + fy * 5 + ry * side);
  if (camPos.lengthSq() === 0 || camPos.distanceTo(want) > 6) { camPos.copy(want); camLook.copy(look); }
  camPos.lerp(want, Math.min(1, dt * 12)); camLook.lerp(look, Math.min(1, dt * 14));
  camera.position.copy(camPos); camera.lookAt(camLook);
}
// ---------- Audio procedural ----------
function initAudio() {
  try { audio = { ctx: new (window.AudioContext || window.webkitAudioContext)() }; } catch (e) { audio = null; return; }
  const ctx = audio.ctx; audio.master = ctx.createGain(); audio.master.gain.value = 0.8; audio.master.connect(ctx.destination);
  const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; audio.noise = buf;
  window.__audioCtx = () => audio && audio.ctx; window.__out = out;
  audio.muted = false; audio.nextBeat = 0; audio.nextStep = 0; audio.nextNote = 0; audio.noteI = 0;
}
function out(pos) {
  const ctx = audio.ctx; if (!pos) return audio.master;
  const p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 2; p.maxDistance = 40; p.rolloffFactor = 1.2;
  const y = pos.f * FH + 1.2; if (p.positionX) { p.positionX.value = pos.x; p.positionY.value = y; p.positionZ.value = pos.y; } else p.setPosition(pos.x, y, pos.y);
  p.connect(audio.master); return p;
}
function env(g, t0, a, peak, dec) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec); }
function tone(freq, dur, type, vol, pos, slide, when) { if (!audio || audio.muted) return; const ctx = audio.ctx, t0 = ctx.currentTime + (when || 0); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur); env(g, t0, 0.01, vol || 0.1, dur); o.connect(g); g.connect(out(pos)); o.start(t0); o.stop(t0 + dur + 0.05); }
function noise(dur, ftype, freq, q, vol, pos, when, attack) { if (!audio || audio.muted) return; attack = attack || 0.01; const ctx = audio.ctx, t0 = ctx.currentTime + (when || 0); const s = ctx.createBufferSource(); s.buffer = audio.noise; s.loop = true; const f = ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; f.Q.value = q || 1; const g = ctx.createGain(); env(g, t0, attack, vol || 0.1, dur); s.connect(f); f.connect(g); g.connect(out(pos)); s.start(t0, Math.random()); s.stop(t0 + dur + attack + 0.1); }
function updateListener() {
  if (!audio) return; const L = audio.ctx.listener, V = viewer(); if (!V) return; const x = V.x, y = elv(V) + 1.2, z = V.y;
  if (L.positionX) { L.positionX.value = x; L.positionY.value = y; L.positionZ.value = z; L.forwardX.value = 0; L.forwardY.value = 0; L.forwardZ.value = -1; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; }
  else { L.setPosition(x, y, z); L.setOrientation(0, 0, -1, 0, 1, 0); }
}
const SFX = {
  nape() { const V = viewer(); if (!V) return; const p = { f: V.f, x: V.x, y: V.y + 0.35 }; noise(1.4, 'bandpass', 700, 0.8, 0.5, p, 0, 0.3); noise(1.0, 'bandpass', 2400, 3, 0.12, p, 0.2, 0.2); if (navigator.vibrate) try { navigator.vibrate(120); } catch (e) {} },
  door(p) { tone(70, 0.5, 'triangle', 0.5, p, -30); noise(0.25, 'lowpass', 900, 1, 0.4, p); },
  click(p) { tone(1800, 0.03, 'square', 0.08, p); tone(120, 0.6, 'sawtooth', 0.04, p, -60, 0.03); },
  scrape(p) { noise(0.7, 'bandpass', 400, 2, 0.25, p, 0, 0.1); tone(300, 0.2, 'triangle', 0.15, p, -150, 0.6); },
  whisper(p) { for (let k = 0; k < 4; k++) noise(0.25, 'bandpass', 1500 + Math.random() * 1500, 6, 0.12, p, k * 0.22, 0.05); },
  laugh(p) { for (let k = 0; k < 5; k++) tone(650 + Math.random() * 250, 0.09, 'triangle', 0.12, p, 120, k * 0.13); },
  coins(p) { for (let k = 0; k < 6; k++) tone(2600 + Math.random() * 1500, 0.15, 'sine', 0.08, p, 0, k * 0.07); },
  growl(p) { tone(70, 1.2, 'sawtooth', 0.2, p, -20); noise(1.0, 'lowpass', 300, 1, 0.2, p, 0, 0.1); },
  pray(p) { for (let k = 0; k < 8; k++) noise(0.3, 'bandpass', 500 + (k % 3) * 200, 8, 0.1, p, k * 0.3, 0.05); },
  wings(p) { for (let k = 0; k < 6; k++) noise(0.12, 'bandpass', 900, 1, 0.25, p, k * 0.14, 0.02); },
  frost(p) { for (let k = 0; k < 12; k++) noise(0.03, 'highpass', 5000, 1, 0.12, p, k * 0.08); },
  drip(p) { for (let k = 0; k < 5; k++) tone(1200 + Math.random() * 400, 0.06, 'sine', 0.12, p, 600, k * 0.4); noise(1.5, 'bandpass', 600, 1, 0.08, p, 0, 0.4); },
  beads(p) { for (let k = 0; k < 10; k++) tone(3000 + Math.random() * 1000, 0.03, 'square', 0.04, p, 0, k * 0.05 + Math.random() * 0.03); },
  sheet(p) { noise(0.9, 'bandpass', 1200, 0.7, 0.15, p, 0, 0.3); },
  toy(p) { [784, 659, 698, 523, 587].forEach((f, k) => tone(f, 0.25, 'sine', 0.1, p, 0, k * 0.22)); },
  bell(p) { [220, 440, 554, 660].forEach((f, k) => tone(f, 3, 'sine', 0.12 / (k + 1), p)); },
  beep() { tone(2200, 0.08, 'square', 0.05); tone(2200, 0.08, 'square', 0.05, null, 0, 0.12); },
  si() { tone(330, 0.7, 'sine', 0.15); tone(495, 0.7, 'sine', 0.08, null, 0, 0.05); },
  emf(p, lvl) { for (let k = 0; k < lvl; k++) tone(900 + lvl * 200, 0.04, 'square', 0.05, p, 0, k * 0.08); },
  shutter(p) { noise(0.05, 'highpass', 3000, 1, 0.2, p); noise(0.06, 'highpass', 3000, 1, 0.15, p, 0.09); },
  static(p) { noise(0.8, 'bandpass', 2000, 0.5, 0.12, p); },
  stairs(p) { for (let k = 0; k < 4; k++) tone(90 + k * 5, 0.12, 'triangle', 0.18, p, -20, k * 0.18); },
  copal(p) { noise(2, 'highpass', 3000, 0.5, 0.08, p, 0, 0.2); for (let k = 0; k < 10; k++) noise(0.02, 'bandpass', 4000, 2, 0.15, p, Math.random() * 1.5); },
  rosary(p) { SFX.beads(p); tone(440, 1.2, 'sine', 0.1, p, -80, 0.2); },
  death() { tone(55, 2.5, 'triangle', 0.35, null, -25); noise(2, 'lowpass', 200, 1, 0.3, null, 0, 0.5); },
  pickup() { tone(1200, 0.05, 'sine', 0.06); },
  card(p) { noise(0.12, 'highpass', 3000, 0.7, 0.25, p); tone(400, 0.6, 'sine', 0.06, p, 200, 0.1); },
  slide(p) { noise(0.9, 'bandpass', 700, 2, 0.15, p, 0, 0.1); },
  shimmer(p) { [1320, 1760, 2093].forEach((f, k) => tone(f, 1.4, 'sine', 0.05, p, -30, k * 0.08)); },
  crack(p) { noise(0.08, 'highpass', 2000, 1, 0.5, p); noise(0.12, 'lowpass', 400, 1, 0.3, p, 0.05); },
  giggle(p) { [880, 990, 880, 1046].forEach((f, k) => tone(f, 0.12, 'triangle', 0.06, p, 40, k * 0.14)); },
  match(p) { noise(0.25, 'bandpass', 2500, 1, 0.25, p); tone(200, 0.4, 'sine', 0.04, p, 80, 0.15); },
  clicks(p) { tone(1800, 0.02, 'square', 0.15, p); tone(1800, 0.02, 'square', 0.15, p, 0, 0.18); },
  sizzle(p) { noise(1.2, 'highpass', 4000, 0.5, 0.12, p, 0, 0.05); },
  bite(p) { for (let k = 0; k < 3; k++) noise(0.06, 'bandpass', 1500, 1, 0.3, p, k * 0.12); },
  puff(p) { noise(0.4, 'lowpass', 600, 0.7, 0.2, p, 0, 0.05); },
  creak(p) { tone(180, 0.6, 'sawtooth', 0.05, p, 60); tone(240, 0.5, 'sawtooth', 0.04, p, -50, 0.7); },
  water(p) { noise(2.5, 'bandpass', 1800, 0.6, 0.12, p, 0, 0.2); },
  crash(p) { noise(0.4, 'lowpass', 2500, 1, 0.45, p); tone(90, 0.3, 'triangle', 0.3, p, -40); for (let k = 0; k < 6; k++) tone(2500 + Math.random() * 2000, 0.1, 'square', 0.04, p, 0, 0.05 + k * 0.04); },
  ding(p) { tone(1760, 1.2, 'sine', 0.12, p); tone(2640, 0.8, 'sine', 0.05, p); },
  books(p) { for (let k = 0; k < 4; k++) noise(0.12, 'lowpass', 800, 1, 0.3, p, k * 0.15); },
  chime(p) { [523, 392, 440, 294].forEach((f, k) => tone(f, 1.2, 'sine', 0.1, p, 0, k * 0.6)); },
  rattle(p) { for (let k = 0; k < 14; k++) noise(0.04, 'bandpass', 1200, 3, 0.18, p, k * 0.07); },
  piano(p) { [220, 233, 311].forEach(f => tone(f, 2, 'triangle', 0.1, p)); },
};
const SELLO_SFX = { rezo: 'pray', risa: 'laugh', charcos: 'drip', reubicado: 'laugh', nombre: 'whisper', ropero: 'door', monedas: 'coins', gruñido: 'growl', rosarioroto: 'beads', cama: 'sheet', tornado: 'scrape', aleteo: 'wings', escarcha: 'frost' };
function huntAudio(dt) {
  if (!audio || audio.muted || !w) return; const g = w.g, V = viewer(); if (!g.hunt || !V) return;
  const ctx = audio.ctx, now = ctx.currentTime; const sp = (g.def.huntStart + g.def.accel * g.seenT); const k = Math.min(1, (sp - g.def.huntStart) / Math.max(0.1, g.def.top - g.def.huntStart));
  const d = V.f === g.f ? Math.hypot(V.x - g.x, V.y - g.y) : 30; const near = Math.max(0, 1 - d / 25);
  if (now >= audio.nextBeat) { const iv = 60 / (70 + 90 * k + 40 * near); audio.nextBeat = now + iv; tone(60, 0.12, 'sine', 0.25 + near * 0.3); tone(52, 0.12, 'sine', 0.18 + near * 0.2, null, 0, 0.16); }
  if (now >= audio.nextStep && g.def.id !== 'malaire') { const iv = 0.55 - 0.3 * k; audio.nextStep = now + iv; const p = { f: g.f, x: g.x, y: g.y };
    if (g.def.id === 'nahual') { tone(180, 0.05, 'square', 0.15, p); tone(160, 0.05, 'square', 0.12, p, 0, 0.07); }
    else if (g.def.id === 'planchada') tone(2200, 0.03, 'square', 0.08, p);
    else if (g.def.id === 'nachito') noise(0.04, 'bandpass', 900, 2, 0.15, p);
    else noise(0.18, 'lowpass', 300, 1, 0.3, p, 0, 0.03); }
  else if (g.def.id === 'malaire' && now >= audio.nextStep) { audio.nextStep = now + 1.2; noise(1.2, 'bandpass', 500, 0.6, 0.12, { f: g.f, x: g.x, y: g.y }, 0, 0.4); }
  if (now >= audio.nextNote) { const scale = [196, 233, 262, 294, 311, 392]; const iv = 0.42 - 0.22 * k; audio.nextNote = now + iv; const f = scale[audio.noteI++ % scale.length] * (1 + (Math.random() - 0.5) * 0.03); tone(f, 0.35, 'triangle', 0.05, null, -f * 0.02); }
}
function playEvents() {
  if (!w) return; const V = viewer(), vk = viewKind();
  const now = performance.now() / 1000;
  for (const e of w.events) {
    if (e.type === 'act' || e.type === 'pickup') { const r = invMeshes[e.type === 'pickup' ? e.id : e.who]; if (r) { const kd = e.type === 'pickup' ? 'dip' : e.kind === 'drop' ? 'dip' : e.kind; r.t[kd] = now; } }
    if (!audio || audio.muted) continue;
    const p = e.f !== undefined ? e : null;
    switch (e.type) {
      case 'chill': if (vk === 'inv' && V && e.who === V.id) { SFX.nape(); flashUI('nuca'); } break;
      case 'portazo': SFX.door(p); shake(0.3); break;
      case 'lightsoff': SFX.click(p); break;
      case 'mover': SFX.scrape(p); break;
      case 'susurro': SFX.whisper(p); break;
      case 'sello': SFX[SELLO_SFX[e.kind] || 'whisper'](p); break;
      case 'noise': if(e.kind==='drawer')tone(160,.2,'sawtooth',.04,p,-35);if (e.kind === 'juguete') SFX.toy(p); if (e.kind === 'stairs' || e.kind === 'ghoststairs') SFX.stairs(p); if (e.kind === 'throw') tone(300, 0.08, 'triangle', 0.2, p); break;
      case 'manifest': { const k = e.snd; if (k === 'risa') { SFX.laugh(p); SFX.giggle(p); } else if (k === 'canto') [392, 370, 349, 330].forEach((fq, j) => tone(fq, 0.6, 'sine', 0.22, p, -8, j * 0.45)); else if (k === 'llanto') { for (let j = 0; j < 3; j++) tone(700 - j * 60, 0.7, 'sawtooth', 0.12, p, -300, j * 0.6); } else if (k === 'grito') { noise(0.9, 'bandpass', 1800, 0.6, 0.6, p); tone(900, 0.9, 'sawtooth', 0.3, p, -500); } else { tone(180, 1.6, 'sawtooth', 0.18, p, -40); noise(1.4, 'lowpass', 500, 1, 0.2, p, 0, 0.4); } shake(0.35); break; }
      case 'eco': duck(1.2); setTimeout(() => speak(e.text, { pitch: 0.2, rate: 0.75 }), 1200); break;
      case 'loteria': duck(1.2); setTimeout(() => speak(pick(['¡Corre y se va! ¡La muerte!', '¡La calavera!', '¡El catrín… detrás de ti!', '¡La muerte… y lotería!']), { pitch: 0.6, rate: 1.05 }), 1200); break;
      case 'rezo': if (e.ok === undefined) { duck(1.5); setTimeout(() => speak('aíram evlas et soid, aicarg ed aneip', { pitch: 0.1, rate: 0.6 }), 1500); } else tone(e.ok ? 660 : 160, 0.12, e.ok ? 'sine' : 'square', 0.12, null); break;
      case 'anomSeen': tone(48, 0.9, 'sine', 0.25, null, -10); break;
      case 'toolMsg': tone(1200, 0.08, 'square', 0.12, null); tone(1200, 0.08, 'square', 0.12, null, 0, 0.15); break;
      case 'possess': tone(70, 2.2, 'sawtooth', 0.12, null, -30); noise(1.6, 'lowpass', 300, 1, 0.3, null); break;
      case 'unpossess': noise(0.4, 'highpass', 2000, 0.6, 0.25, null); break;
      case 'halluEnd': noise(0.25, 'highpass', 3000, 0.5, 0.3, null); tone(60, 0.3, 'square', 0.15, null, -20); break;
      case 'doorToggle': SFX.door(p); break;
      case 'hunt': tone(80, 1.2, 'square', 0.08, null, -40); if (e.cursed) { tone(55, 2, 'sawtooth', 0.08, null, -20); SFX.giggle(null); } shake(e.cursed ? 0.7 : 0.4); break;
      case 'ask': SFX.puff && SFX.puff(p); break;
      case 'emf': SFX.emf(p, e.lvl); break;
      case 'grab': SFX.static(p); break;
      case 'termo': SFX.beep(); break;
      case 'copal': SFX.copal(p); break;
      case 'rosario': SFX.rosary(p); break;
      case 'death': SFX.death(); shake(0.8); break;
      case 'huida': case 'dawn': SFX.bell(null); setTimeout(() => SFX.bell(null), 900); break;
      case 'pickup': if (V && e === V) SFX.pickup(); break;
      case 'prop': (SFX[e.snd] || SFX.creak)(p); break;
      case 'tarot': SFX.card(p); break; case 'tablilla': SFX.slide(p); break; case 'espejoplata': SFX.shimmer(p); break; case 'mano': SFX.crack(p); break;
      case 'muneca': SFX.giggle(p); break; case 'vela5': SFX.match(p); break; case 'radio': SFX.static(p); break; case 'chasquidos': SFX.clicks(p); break;
      case 'cruz': SFX.sizzle(p); break; case 'pan': SFX.bite(p); break; case 'limpia': SFX.crack(p); break; case 'ashstep': SFX.puff(p); break; case 'revive': SFX.bell(null); break;
      case 'name': SFX.bell(null); break;
    }
  }
  w.events.length = 0;
}

// ---------- Interfaz ----------
let shakeAmt = 0; function shake(a) { shakeAmt = Math.max(shakeAmt, a); }
function flashUI(kind) { const el = $('#vignette'); el.classList.remove('nuca'); void el.offsetWidth; el.classList.add(kind); }
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function clockStr(t) { const m = 23 * 60 + t / w.opt.night * 420; const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`; }
const bar = (v, max, col) => `<div class="bar"><i style="width:${clamp(v / max * 100, 0, 100)}%;background:${col}"></i></div>`;
const sanCol = s => s > 60 ? '#6fbf73' : s > 40 ? '#f2b04e' : '#e04a5a';
const huntRuleTxt = G => { const h = G.hunt; return { avg: `Promedio ≤ ${h.thr}`, isolated: `Alguien solo con ≤ ${h.thr}`, guardian: 'Alguien en su cuarto con ≤ 60, o promedio ≤ 45', healthiest: `El más sano con ≤ ${h.thr}`, weakest: `El más débil con ≤ ${h.thr}` }[h.type]; };
const itemCount = s => s.kind === 'tarot' ? ` (${s.cards})` : s.kind === 'muneca' ? ` (${s.pins})` : s.kind === 'pentagrama' ? ` (${s.candles}/5)` : s.kind === 'mano' ? ` (${s.wishes})` : s.kind === 'tablilla' ? ` (${3 - s.q})` : s.kind === 'cruz' ? ` (${s.charges})` : s.kind === 'espejoplata' && s.on ? ' (mirando)' : '';
let jSel = null;
function ghostCard(G) {
  const sp = G.speed || 2.2; const rule = huntRuleTxt(G);
  return `<div class="gcard"><p><b>Evidencias:</b> ${G.ev.map(k => EV[k].n).join(', ')}</p><p><b>Caza cuando:</b> ${rule}</p>${G.special ? `<p><b>Habilidad:</b> ${G.special.n}. ${G.special.d}</p>` : ''}${G.passive ? `<p><b>Pasiva:</b> ${G.passive.n}${G.passive.d ? '. ' + G.passive.d : ''}</p>` : ''}<p><b>Sello:</b> ${G.sello.n}${G.sello.parecido ? ` <small>(se confunde con: ${G.sello.parecido})</small>` : ''}</p><p class="small">Velocidad ${sp} m/s · escucha a ${G.hear || 12} m</p></div>`;
}
function casonaJournalMap(){let out='<details><summary>Plano de la casona</summary>';for(const f of[0,1]){out+='<h3>'+(f?'Planta alta':'Planta baja')+'</h3><div style="overflow:auto"><svg width="600" height="400" viewBox="0 0 60 40" role="img" aria-label="Plano de '+(f?'planta alta':'planta baja')+'"><rect width="60" height="40" fill="#302a30"/><rect x="15" y="10" width="30" height="20" fill="#9e8a74"/><rect x="18" y="13" width="24" height="14" fill="#242434"/>';for(const r of NDALayout.rooms.filter(r=>r.floor===f)){const[a,b,c,d]=r.rect;out+='<rect x="'+a+'" y="'+b+'" width="'+(c-a)+'" height="'+(d-b)+'" fill="#e4d4b7"><title>'+r.name+'</title></rect><text x="'+(a+c)/2+'" y="'+((b+d)/2+.5)+'" text-anchor="middle" font-size="1.45" fill="#302a30">'+r.id+'</text>';}for(const d of NDALayout.doors.filter(d=>d.floor===f)){const[a,b,c,e]=d.rect;out+='<rect x="'+a+'" y="'+b+'" width="'+(c-a)+'" height="'+(e-b)+'" fill="#c2aa85"/>';}const me=w.invs[ME];if(me?.f===f&&me.y<39)out+='<circle cx="'+me.x+'" cy="'+me.y+'" r=".55" fill="#df8b34"/>';out+='</svg></div><p class="small">'+NDALayout.rooms.filter(r=>r.floor===f).map(r=>r.id+' '+r.name).join(' · ')+'</p>';}return out+'<p class="small">Norte arriba. La calle y el portón quedan al sur. El punto naranja eres tú.</p></details>';}
function journalHTML(canName) {
  const c = candidates(w, true), p = pruebas(w);
  let h = `<h3>Evidencias <small>clic: marcar ✓ → tachar ✗ → borrar</small></h3>`;
  EV_KEYS.forEach(k => { const st = w.conf[k] ? 'si' : w.discard[k] ? 'no' : 'na'; const by = w.conf[k] && w.conf[k].by && w.conf[k].by !== 'tú' ? ` · ${w.conf[k].by}` : '';
    h += `<div class="ev ${st}" data-ev="${k}"><span>${cardImg(EV[k].tool, 'mci')}${EV[k].n}<small>${ITEMS[EV[k].tool].n}${by}</small></span><b>${st === 'si' ? '✓' : st === 'no' ? '✗' : '?'}</b></div>`; });
  h += `<p class="hint">Marcadas: <b>${p}</b>. Nadie te avisa si una lectura es real: tú decides. Puedes nombrarla cuando quieras: con 0 si la reconoces por su comportamiento, con 1 o 2 arriesgando, y con 3 es segura.</p>`;
  h += `<h3>Ánimas posibles (${c.length})</h3>`;
  GHOSTS.forEach(G => { const ok = c.includes(G) && !(w.discardG && w.discardG[G.id]); h += `<div class="cand ${ok ? '' : 'out'}" data-g="${G.id}"><span>${canName ? `<img class="idc" src="${idCard(G)}" alt="">` : ''}${G.n}<button class="gx" title="Tachar o destachar">${w.discardG && w.discardG[G.id] ? '↺' : '✗'}</button><small>${G.ev.map(k => EV[k].n).join(' · ')}</small></span>${canName ? `<button data-name="${G.id}">Nombrar</button>` : ''}</div>`; });
  if (jSel && !canName) { const G = GT[jSel]; h = h.replace(`data-g="${jSel}">`, `data-g="${jSel}" class="sel">`); h += `<h3>${G.n}</h3>${ghostCard(G)}`; }
  if (w.team.home) h += `<p class="hint">Vive en: <b>${ROOMS[w.team.home.f][w.team.home.r].n}</b></p>`;
  h += `<h3>Dónde buscar objetos</h3><p class="small">Té y pan: Cocina, Comedor, Despensa y Repostería · Rosario y cruz: Capilla y recámaras · Ruda, copal y limpia: Botica, Cocina y Capilla · Veladoras: Capilla y Salón · Ceniza: Cocina y Capilla · Focos: Portería, Despacho y Cuarto de aperos</p>${w.cursed ? `<p class="small">${cardImg(w.cursed, 'mci')} <b>Objeto maldito de esta noche:</b> ${ITEMS[w.cursed].n}, en ${ROOMS[CURSED_PLACES[w.cursed][0]][RID[CURSED_PLACES[w.cursed][0]][CURSED_PLACES[w.cursed][1]]].n}. ${ITEMS[w.cursed].hint}</p>` : ''}`;
  h+=casonaJournalMap();
  return h;
}
function primaryAction(i) {
  if (!i.alive || i.escaped) return null; if (i.hidden >= 0) return { k: 'E', txt: 'Salir del escondite', btn: 'Salir' };
  const ti = (i.y | 0) * W + (i.x | 0);
  if (i.f === EXIT.f && Math.hypot(i.x - EXIT.x, i.y - EXIT.y) < 1.8) return { k: 'E', txt: (w.exitAsk && w.exitAsk[i.id] && w.t - w.exitAsk[i.id] < 4 ? 'Otra vez: subirte y terminar' : 'Subirte a la camioneta') + (i.guess ? ` · apuesta: ${GT[i.guess].n}` : ' · ⚠ aún no apuestas (libreta)'), btn: 'Camioneta' };
  if (i.f === 0 && w.cas && w.cas.knock && w.t < w.cas.knock.until && Math.hypot(i.x - ZAG.x, i.y - ZAG.y) < 1.8) return { k: 'E', txt: 'Alguien toca: abrir el zaguán', btn: 'Abrir' };
  if (i.f === FUSE.f && Math.hypot(i.x - FUSE.x, i.y - FUSE.y) < 1.6 && !w.fuse.every(Boolean)) return { k: 'E', txt: 'Subir los fusibles', btn: 'Fusibles' };
  const s = nearSpot(w, i); if (s >= 0) return { k: 'E', txt: 'Esconderte' + (elecOnW(w, i) ? ' (¡apaga la linterna!)' : ''), btn: 'Esconder' };
  const sn = spotNear(w, i); if (sn && sn.why) return { k: '', txt: sn.why === 'candado' ? '🔒 Este ropero tiene candado esta noche: busca otro escondite' : `Ocupado: ${sn.who.name} está escondido aquí`, btn: '—' };
  const storage=nearLayoutContainer(w,i);if(storage&&!w.items.some(it=>!it.holder&&it.f===i.f&&layoutItemVisible(w,it)&&Math.hypot(it.x-i.x,it.y-i.y)<1.3))return{k:'E',txt:storage.until?'Revisando el cajón…':'Revisar cajón (1 s)',btn:storage.until?'Revisando':'Cajón'};
  let best = null, bd = 1.3; for (const x of w.items) if (!x.holder && x.f === i.f && layoutItemVisible(w,x)) { const d = Math.hypot(x.x - i.x, x.y - i.y); if (d < bd) { bd = d; best = x; } }
  if (best) return { k: 'E', txt: (i.slots.includes(null) || !i.slots[i.hand] ? 'Tomar ' : 'Ranuras llenas: ') + ITEMS[best.kind].n, btn: 'Tomar', item: best };
  const dr = nearDoor(w, i); if (dr) return { k: 'E', txt: dr.closed ? 'Abrir la puerta' : 'Cerrar la puerta', btn: dr.closed ? 'Abrir' : 'Cerrar' };
  return null;
}
const USE_VERB = { termo: 'Quédate quieto para medir', grab: 'Preguntar en voz alta', cam: 'Apuntar (suéltala con G)', foco: 'Cambiar el foco (Q en el apagador)', te: 'Tomar el té', rosario: 'Alzar el rosario', ruda: 'Colgar la ruda en la puerta', copal: 'Encender copal', vela: 'Dejar la veladora', ceniza: 'Regar la ceniza', cruz: 'Dejar la cruz', pan: 'Dejar el pan', limpia: 'Hacer la limpia', tarot: 'Sacar una carta', tablilla: 'Preguntar a la tablilla', espejoplata: 'Mirar en la plata', mano: 'Pedir un deseo', muneca: 'Clavar un alfiler', pentagrama: 'Prender una vela', radio: 'Preguntar por radio' };
const USE_BTN = { termo: 'Medir', grab: 'Preguntar', cam: 'Ver foto', foco: 'Foco', te: 'Beber', rosario: 'Alzar', ruda: 'Colgar', copal: 'Copal', vela: 'Dejar', ceniza: 'Regar', cruz: 'Dejar', pan: 'Dejar', limpia: 'Limpia', tarot: 'Carta', tablilla: 'Preguntar', espejoplata: 'Mirar', mano: 'Desear', muneca: 'Alfiler', pentagrama: 'Vela', radio: 'Radio' };
function contextHint(i) {
  if (i.escaped) return 'En la camioneta: <kbd>Espacio</kbd> o toca la pantalla para ver a otro compañero';
  if (!i.alive) return 'Eres espíritu: <kbd>Espacio</kbd> manifestarte para estorbar al ánima · <kbd>Z</kbd> cambiar de piso';
  if (i.hidden >= 0) return `Escondido. ${elecOnW(w, i) ? '<b class="warn">¡Tu aparato encendido te delata!</b> Apaga la linterna (F) o cambia de ranura. ' : ''}<kbd>E</kbd> salir`;
  const t = []; const h = handItem(i), touch = matchMedia('(pointer: coarse)').matches;
  if (h) { t.push(`<kbd>${touch ? 'Usar' : 'Clic'}</kbd> ${USE_VERB[h.kind] || 'usar'}`); t.push(`<kbd>${touch ? 'Dejar' : 'G'}</kbd> ${h.kind === 'rosario' && w.doors.some(d => d.f === i.f && Math.hypot(d.x - i.x, d.y - i.y) < 1.6) ? 'colgar en la puerta' : 'dejar aquí'}`); t.push(`<kbd>${touch ? 'Aventar' : 'R'}</kbd> aventar`); }
  else t.push(`<kbd>${touch ? 'Ranura' : '1–3'}</kbd> elegir objeto`);
  const sw = nearSwitch(i); if (sw) t.push(`<kbd>${touch ? 'Luz' : 'Q'}</kbd> ${w.burnt[i.f][sw.r] ? (h && h.kind === 'foco' ? 'cambiar el foco' : 'foco fundido') : !w.fuse[i.f] ? 'sin corriente' : w.lights[i.f][sw.r] ? 'apagar la luz' : 'prender la luz'}`);
  return t.join(' · ') || '&nbsp;';
}
// ---------- Retroalimentación ----------
const EV_IDX = { BC: 0, CE: 1, SU: 2, OB: 3, LU: 4, ES: 5, AZ: 6 };
let fb = { san: null, sanT: 0, tips: new Set(), tipQ: [], tipUntil: 0, noiseUntil: 0, lastConf: 0 };
try { const saved = JSON.parse(localStorage.getItem('nda_tips') || '[]'); saved.forEach(k => fb.tips.add(k)); } catch (e) {}
const analogFx = { noVoltees: null, clockUntil: 0, possessT: 0 };
function speak(text, o) { try { if (!('speechSynthesis' in window) || (audio && audio.muted)) return; const u = new SpeechSynthesisUtterance(text); u.lang = 'es-MX'; u.pitch = o && o.pitch !== undefined ? o.pitch : 0.3; u.rate = o && o.rate || 0.8; u.volume = o && o.vol || 0.9; speechSynthesis.speak(u); } catch (e) {} }
function duck(sec) { if (!audio || !audio.master) return; const g0 = audio.master.gain, n = audio.ctx.currentTime; g0.cancelScheduledValues(n); g0.setValueAtTime(g0.value, n); g0.linearRampToValueAtTime(0.0001, n + 0.15); g0.setValueAtTime(0.0001, n + sec); g0.linearRampToValueAtTime(0.8, n + sec + 0.4); }
function bigScare() { const el = document.createElement('div'); el.id = 'bigscare'; el.innerHTML = `<img src="${ASSET}a/presencia.webp" alt="">`; $('#game').appendChild(el); glitch(1.3); noise(0.9, 'bandpass', 1400, 0.7, 0.7, null); tone(840, 0.8, 'sawtooth', 0.35, null, -600); setTimeout(() => el.remove(), 1300); const me = w && w.opt.role === 'inv' ? w.invs[ME] : null; if (me && me.alive) { if (NET.mode === 'guest') netActs.push({ k: 'haunt', v: 10 }); else w.haunt(me, 10); } }
function glitch(sec) { const el = $('#game'); el.classList.remove('glitch'); void el.offsetWidth; el.classList.add('glitch'); clearTimeout(glitch.h); glitch.h = setTimeout(() => el.classList.remove('glitch'), (sec || 0.5) * 1000); }
function toast(html, cls, sec) { const el = $('#toast'); el.innerHTML = html; el.className = 'show ' + (cls || ''); clearTimeout(toast.h); toast.h = setTimeout(() => { el.className = ''; }, (sec || 2.6) * 1000); }
function floater(txt, cls) { const el = document.createElement('div'); el.className = 'floater ' + cls; el.textContent = txt; $('#floaters').appendChild(el); setTimeout(() => el.remove(), 1600); }
function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
function tip(key, html) { if (menuOpt.tips === 'no' || fb.tips.has(key)) return; fb.tips.add(key); try { localStorage.setItem('nda_tips', JSON.stringify([...fb.tips])); } catch (e) {} fb.tipQ.push(html); }
const kb = (k, btn) => `<kbd>${matchMedia('(pointer: coarse)').matches ? btn : k}</kbd>`;
function feedbackEvents() {
  const me = w.opt.role === 'inv' ? w.invs[ME] : null;
  for (const e of w.events) {
    if (e.type === 'burn' && me && e.f === me.f && Math.hypot(e.x - me.x, e.y - me.y) < 10) tip('burn', `Prender y apagar muchas veces <b>funde el foco</b>. Cámbialo con un <b>foco de repuesto</b> en la mano (${kb('Q', 'Luz')} junto al apagador).`);
    if (e.type === 'manifest' || e.type === 'fade' || (e.type === 'hunt') || (e.type === 'halluEnd' && me && e.who === me.id) || (e.type === 'dragOut')) glitch(e.type === 'hunt' ? 0.9 : e.type === 'halluEnd' ? 0.6 : 0.45);
    if (e.type === 'toolMsg' && me && e.who === me.id) analogFx.noVoltees = /VOLTEES|DETRÁS/.test(e.text) ? { yaw0: yaw, until: performance.now() + 6000 } : null;
    if (e.type === 'cas' && e.k === 'bucle' && e.who === ME && e.face !== undefined) yaw = e.face; // el cuarto se repite: entras otra vez mirando hacia adentro
    if (e.type === 'mark' && NET.mode === 'guest' && w.opt.libreta === 'auto' && e.k && !w.conf[e.k]) w.conf[e.k] = { by: 'equipo', t: w.t, how: '' };
    if (e.type === 'reloj') analogFx.clockUntil = performance.now() + 4000;
    if (e.type === 'fakeSys') w.say(`⚠ ${e.name} se desconectó.`, 'i');
    if (e.type === 'possess' && me && e.who === me.id) { glitch(1.2); analogFx.possessT = performance.now(); }
    if (e.type === 'apagon') tip('fuse', `El apagón <b>bota los fusibles</b>: súbelos en la caja del <b>Zaguán</b> con ${kb('E', 'Acción')}.`);
    if (e.type === 'hunt') { toast(e.cursed ? '<b>¡CACERÍA MALDITA!</b><small>Rompe su línea de vista o escóndete</small>' : '<b>¡CACERÍA!</b><small>Rompe su línea de vista o escóndete · apaga los aparatos</small>', 'hunt', 3); buzz([80, 60, 80]); tip('hunt', `En una cacería el ánima <b>acelera mientras te ve</b>. Rompe la línea de vista (vuelta a una esquina), escóndete con ${kb('E', 'Acción')} junto a un ropero o cama, y <b>apaga la linterna</b> (${kb('F', 'Linterna')}): un aparato encendido te delata.`); }
    if (e.type === 'huntEnd') toast('<b>La cacería terminó</b>', 'calm', 1.8);
    if (e.type === 'ritual') toast(w.opt.role === 'ghost' ? '<b>¡Te están nombrando!</b><small>Ve a la Capilla e interrúmpelo</small>' : `<b>Nombrando en el altar…</b><small>${CFG.ritualDur} s · quien nombra no debe moverse</small>`, w.opt.role === 'ghost' ? 'hunt' : 'ev', 3);
    if (e.type === 'ritualFail') toast(w.opt.role === 'ghost' ? '<b>¡Ritual interrumpido!</b>' : '<b>La vela del altar se apagó</b><small>El ánima interrumpió el nombre</small>', w.opt.role === 'ghost' ? 'ev' : 'hunt', 2.6);
    if (e.type === 'apagon') toast('<b>¡Apagón!</b><small>Las linternas fallan</small>', 'hunt', 2);
    if (e.type === 'huida') toast('<b>¡A la salida!</b><small>Sigue la flecha hasta el Zaguán</small>', 'hunt', 3.5);
    if (me && e.type === 'chill' && e.who === me.id) buzz(120);
    if (me && e.type === 'noise' && ['run', 'throw', 'stairs'].includes(e.kind) && e.f === me.f && Math.hypot(e.x - me.x, e.y - me.y) < 1.5) fb.noiseUntil = performance.now() + 700;
    if (me && e.type === 'death' && e.who === me.id) tip('dead', `Eres <b>espíritu</b>: ves al ánima siempre. ${kb('Espacio', 'Usar')} te manifiestas para frenarla; ${kb('Z', 'Piso')} cambias de piso.`);
  }
}
function nightRoulette() {
  const cnt = {}; w.items.filter(it => !TOOLS.includes(it.kind)).forEach(it => (cnt[it.kind] = (cnt[it.kind] || 0) + 1));
  const rn = rr => `${ROOMS[rr.f][rr.r].n} (${rr.f ? 'planta alta' : 'planta baja'})`;
  const miss = ['rosario', 'copal', 'te', 'limpia'].filter(k => !cnt[k]);
  const el = document.createElement('div'); el.id = 'ruleta'; el.innerHTML = `<div class="rbox"><h3>La ruleta de esta noche</h3><p>🕯 <b>Altar:</b> ${rn(w.altarRoom)}</p><p>⚡ <b>Caja de fusibles:</b> ${rn(w.fuseRoom)}</p>
    <p><b>En la casa hay:</b></p><div class="rgrid">${Object.entries(cnt).map(([k, n]) => `<span>${cardImg(k, 'mci')}${ITEMS[k].n} ×${n}</span>`).join('')}</div>${miss.length ? `<p class="small">No hay: ${miss.map(k => ITEMS[k].n).join(', ')}.</p>` : ''}<p class="small">Las 7 herramientas del maletín son las de siempre.</p><button>A la casona</button></div>`;
  $('#game').appendChild(el); el.querySelector('button').onclick = () => el.remove(); setTimeout(() => el.remove(), 14000);
}
function analogTick2() {
  const nv = analogFx.noVoltees; if (nv) { if (performance.now() > nv.until) analogFx.noVoltees = null; else if (Math.abs(Math.atan2(Math.sin(yaw - nv.yaw0), Math.cos(yaw - nv.yaw0))) > 2.5) { analogFx.noVoltees = null; bigScare(); } }
  const P = w.possess, me = w.opt.role === 'inv' ? w.invs[ME] : null, box = $('#possessUI');
  if (P && me && P.who === me.id) { box.hidden = false; box.innerHTML = `<b>Algo mueve tu cuerpo</b><span>Reza: pulsa las teclas en orden</span><div class="seq">${P.seq.map((k, j) => `<kbd class="${j < P.idx ? 'ok' : j === P.idx ? 'now' : ''}">${k.toUpperCase()}</kbd>`).join('')}</div><i class="pbar"><i style="width:${Math.max(0, (P.until - w.t) / CFG.possess.dur * 100)}%"></i></i>`; if (Math.random() < 0.01) glitch(0.25); }
  else box.hidden = true;
}
function feedbackTick(dt) {
  if (w.opt.role !== 'inv') return; const me = w.invs[ME], g = w.g;
  // cordura flotante
  fb.sanT += dt; if (fb.san === null) fb.san = me.san;
  if (fb.sanT >= 0.5) { const d = me.san - fb.san; if (me.alive && d <= -2.5) { floater(`−${Math.round(-d)} cordura`, 'bad'); $('#vignette').classList.remove('hurt'); void $('#vignette').offsetWidth; $('#vignette').classList.add('hurt'); } if (me.alive && d >= 2.5) floater(`+${Math.round(d)} cordura`, 'good'); fb.san = me.san; fb.sanT = 0; }
  // consejos por situación
  if (w.t > 2) tip('start', `Toma las <b>herramientas del maletín</b> (${kb('E', 'Acción')}). Leen el <b>rastro</b> que deja el ánima donde pasa tiempo, y a veces fallan. Encuentra el cuarto frío y <b>provócala</b>: luz apagada, pocos en el cuarto y la grabadora en la mano.`);
  const h = handItem(me); if (h && ITEMS[h.kind].tool) tip('tool_' + h.kind, `<b>${ITEMS[h.kind].n}</b>: ${TOOL_TIP[h.kind]}`);
  if (h && ITEMS[h.kind].cursed) tip('cursed', `<b>Objeto maldito.</b> ${ITEMS[h.kind].hint} Puede desatar una <b>cacería maldita</b>.`);
  if (w.team.home) tip('home', `Su cuarto es <b>${ROOMS[w.team.home.f][w.team.home.r].n}</b>. Deja ahí tus herramientas y vigila desde la puerta.`);
  if (pruebas(w) >= 2) tip('altar', `Cuando estés seguro, nómbrala en el <b>altar de la Capilla</b> con ${kb('E', 'Acción')}. Con 3 evidencias marcadas es segura; con menos, arriesgas.`);
  if (me.alive && me.san < 40) tip('lowsan', `Con la cordura baja el ánima <b>te encuentra aunque no te vea</b> y caza antes. Toma té o haz una limpia; quédate con luz.`);
  if (me.alive && me.hidden >= 0) tip('hidden', `Escondido no te ve, salvo que tengas <b>un aparato encendido en la mano</b>. Apaga la linterna (${kb('F', 'Linterna')}).`);
  if (fb.tipQ.length && performance.now() > fb.tipUntil) { $('#tip').innerHTML = fb.tipQ.shift() + '<button id="tipok">Entendido</button>'; $('#tip').hidden = false; fb.tipUntil = performance.now() + 9000; $('#tipok').onclick = () => { $('#tip').hidden = true; fb.tipUntil = 0; }; }
  else if (fb.tipUntil && performance.now() > fb.tipUntil) { $('#tip').hidden = true; fb.tipUntil = 0; }
}
const TOOL_TIP = { termo: 'sostenlo <b>quieto</b> unos 8 s para que se asiente. Baja más cerca del punto frío; bajo 0 °C es evidencia, de 1 a 3 °C es dudoso.', grab: '<b>pregúntale</b> (Usar) con la luz apagada, a lo más 2 en el cuarto y el ánima cerca. A veces responde; la estática no cuenta.', cam: 'suéltala con <b>G</b> apuntando al cuarto: queda en su tripié. Mira su tele en la base; solo ahí se ve la silueta del ánima.', emf: 'con el ánima a 3 m sube a 2–4; el <b>5</b> es evidencia. El 4 puede ser interferencia.', uv: 'alumbra puertas de un cuarto donde el ánima pasa tiempo. Cada puerta se revisa una vez cada 2 min.', espejo: 'déjalo en su guarida y mira de cerca: vaho solo no cuenta, una mano sí.', gases: 'déjalo donde pasa; la aguja amarilla no cuenta, la roja sí.', foco: 'junto al apagador de un cuarto con el foco fundido, pulsa Q.' };
// pantalla de cada herramienta: solo la ve quien la sostiene (sin avisos de «evidencia»)
function toolReadout(me) {
  const it = handItem(me); if (!it || !me.alive) return '';
  if (it.msg && w.t < it.msg.until && ITEMS[it.kind].elec) return `<div class="dev">${cardImg(it.kind, 'mci')}<div class="scr"><b class="lcd msg">${it.msg.text}</b></div></div>`;
  const k = it.kind, now = w.t, scr = (cls, body, foot) => `<div class="dev ${cls}">${cardImg(k, 'mci')}<div class="scr">${body}</div>${foot ? `<small>${foot}</small>` : ''}</div>`;
  if (k === 'termo') { const st = me.termo; if (!st) return scr('termo', '<b class="lcd">--.-</b>', 'quédate quieto'); const v = st.show !== undefined ? st.show : st.v, set = Math.min(1, st.settle / CFG.termo.settle);
    return scr('termo', `<b class="lcd">${v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}</b><i>°C</i>`, set >= 1 ? 'lectura asentada' : st.settle > 0 ? `asentando <i class="pbar"><i style="width:${set * 100}%"></i></i>` : 'muévete menos'); }
  if (k === 'emf') { const lv = now < it.emfUntil ? it.emfLvl : 1; return scr('emf', `<span class="emf">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= lv ? 'on l' + n : ''}"></i>`).join('')}</span>`); }
  if (k === 'grab') { const sc = it.screen && now < it.screen.until ? it.screen : null; const bars = n => Array.from({ length: 18 }, (_, j) => `<i style="height:${Math.round(2 + (sc && sc.kind === 'voz' ? Math.abs(Math.sin(j * 1.3 + now * 9)) * 14 : sc && sc.kind === 'estatica' ? Math.random() * 9 : Math.random() * 2))}px"></i>`).join('');
    const r = roomOf(me), dark = r >= 0 && !w.lights[me.f][r]; return scr('grab', `<span class="wave">${bars()}</span>`, sc ? (sc.kind === 'voz' ? '…una voz…' : sc.kind === 'estatica' ? 'estática' : 'silencio') : w.t < (it.cd || 0) ? 'escuchando…' : `${dark ? 'a oscuras' : 'hay luz'} · Usar: preguntar`); }
  if (k === 'cam') { const v = it.view && now < it.view.until ? it.view.kind : null; return scr('cam', v === 'flota' ? '<span class="photo float"></span>' : v === 'borrosa' ? '<span class="photo blur"></span>' : v === 'nada' ? '<span class="photo"></span>' : '<b class="lcd sm">REC</b>', v ? '' : 'G: ponla en su tripié · su imagen sale en la tele de la base'); }
  if (k === 'gases') { const red = now < it.redUntil, yel = now < (it.yellowUntil || 0), ang = red ? 70 : yel ? 20 : -60 + Math.min(1, it.gasAcc / 5) * 50; return scr('gases', `<span class="dial"><i style="transform:rotate(${ang}deg)"></i></span>`); }
  if (k === 'espejo') return scr('espejo', now < it.markUntil ? '<span class="mirror hand"></span>' : now < (it.fogUntil || 0) ? '<span class="mirror fog"></span>' : '<span class="mirror"></span>', 'mejor déjalo en su guarida');
  if (k === 'uv') { const glow = w.doors.some(d => d.f === me.f && now < d.glowUntil && Math.hypot(d.x - me.x, d.y - me.y) < 6) || w.ashes.some(a => a.f === me.f && now < (a.glowUntil || 0)); return scr('uv', glow ? '<span class="uvdot on"></span>' : '<span class="uvdot"></span>', 'alumbra puertas y ceniza'); }
  if (k === 'espejoplata') return it.on && w.mirrorView ? `🪞 En la plata: <b>${w.mirrorView.r >= 0 ? ROOMS[w.mirrorView.f][w.mirrorView.r].n : 'pasillo'}</b> · −7,5 cordura/s` : '🪞 Clic para mirar';
  if (ITEMS[k].cursed || ['cruz', 'ceniza', 'pan', 'limpia', 'foco'].includes(k)) return `${cardImg(k, 'mci')}${ITEMS[k].n}${itemCount(it)}`;
  return '';
}
function updateOverlay() {
  const me = w.opt.role === 'inv' ? w.invs[ME] : null, g = w.g;
  const locked = document.pointerLockElement === renderer.domElement, touch = matchMedia('(pointer: coarse)').matches;
  $('#lockhint').hidden = !(running && !touch && !locked && w.opt.role !== 'bots' && $('#modal').hidden);
  if (!me) { $('#prompt').innerHTML = ''; $('#tool').innerHTML = ''; $('#compass').hidden = true; $('#seen').hidden = true; $('#itemlabel').hidden = true; return; }
  const pa = primaryAction(me);
  $('#prompt').innerHTML = pa ? (touch ? `<kbd>${pa.btn}</kbd> ${pa.item ? ITEMS[pa.item.kind].n : ''}` : `<kbd>${pa.k}</kbd> ${pa.txt}`) : '';
  const tr = toolReadout(me); $('#tool').innerHTML = tr; $('#tool').hidden = !tr;
  $('#seen').hidden = !(me.alive && g.hunt && !g.hunt.huida && g.perceived.has(me));
  if (w.ritual && w.ritual.by === me) $('#prompt').innerHTML = `Nombrando… <i class="pbar"><i style="width:${(w.t - w.ritual.t0) / CFG.ritualDur * 100}%"></i></i> no te muevas`;
  $('#noise').hidden = performance.now() > fb.noiseUntil; analogTick2();
  $('#slit').hidden = !(me.alive && me.hidden >= 0); $('#slit').classList.toggle('lit', me.alive && me.hidden >= 0 && elecOnW(w, me));
  // etiqueta sobre el objeto más cercano
  if (pa && pa.item && camera.position && THREE.Vector3.prototype.project) { const v = new THREE.Vector3(pa.item.x, pa.item.f * FH + 0.45, pa.item.y).project(camera); const el = $('#itemlabel'); el.hidden = v.z > 1; el.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - v.y) / 2 * innerHeight) + 'px'; el.innerHTML = cardImg(pa.item.kind, 'mci') + ITEMS[pa.item.kind].n; } else $('#itemlabel').hidden = true;
  // brújula: altar con 2 pruebas, salida en la huida
  let tg = null, lbl = '';
  if (me.alive && w.phase === 'huida') { tg = EXIT; lbl = 'Salida'; } else if (me.alive && me.guess && w.phase === 'night') { tg = EXIT; lbl = 'Camioneta'; }
  const cp = $('#compass'); cp.hidden = !tg;
  if (tg) { const tf = tg.f === undefined ? 0 : tg.f; const a = Math.atan2(tg.y - me.y, tg.x - me.x) - yaw; const dist = Math.hypot(tg.x - me.x, tg.y - me.y);
    cp.innerHTML = `<span class="arr" style="transform:rotate(${a * 180 / Math.PI + 90}deg)">➤</span> ${lbl} · ${dist.toFixed(0)} m${tf !== me.f ? (tf < me.f ? ' · baja' : ' · sube') : ''}`; }
  // botones táctiles con la acción del momento
  if (touch) { const be = document.querySelector('#tbtns button[data-k="e"]'); if (be) be.textContent = pa ? pa.btn : 'Acción'; const bu = document.querySelector('#tbtns button[data-k=" "]'); const h = handItem(me); if (bu) bu.textContent = h ? (USE_BTN[h.kind] || 'Usar') : 'Usar'; }
}
function hudName() { return w && w.g.exposed ? ` · <b class="gname">${w.g.def.n}</b>` : ''; }
function hud() {
  const g = w.g, role = w.opt.role, V = viewer(), vk = viewKind();
  const left = w.phase === 'huida' ? `Huida: <b>${fmt(Math.max(0, w.huida.until - w.t))}</b> · escaparon ${w.huida.escaped}` + hudName() : `Faltan <b>${fmt(Math.max(0, w.opt.night - w.t))}</b> para el Alba` + hudName();
  $('#top').innerHTML = `<span class="hora">${performance.now() < analogFx.clockUntil ? '3:33 a. m.' : clockStr(Math.min(w.t, w.opt.night))}</span><span>${left}</span>${g.hunt && !g.hunt.huida ? '<span class="huntb">¡CACERÍA!</span>' : ''}${w.phase === 'huida' ? '<span class="huntb">¡HUIDA!</span>' : ''}`;
  let L = '';
  if (role === 'inv') {
    const me = w.invs[ME], r = roomOf(me);
    if (me.alive && !me.escaped) {
      L += `<div class="row"><b>Cordura ${Math.round(me.san)}</b>${bar(me.san, 100, sanCol(me.san))}</div><div class="row small">Aliento${bar(me.stam, 100, me.tired ? '#e04a5a' : '#9aa6d9')}</div>
        <div class="row small">📍 ${r >= 0 ? ROOMS[me.f][r].n : '—'} · ${me.f ? 'planta alta' : 'planta baja'} · ${litAt(w, me) ? 'con luz' : 'a oscuras'} (apagador <kbd>Q</kbd>) · linterna ${me.flash && w.t >= me.flashOffUntil ? 'encendida' : 'apagada'} <kbd>F</kbd></div>
        <div class="slots">${me.slots.map((s, k) => `<div class="slot ${me.hand === k ? 'sel' : ''}" data-slot="${k}"><kbd>${k + 1}</kbd>${s ? cardImg(s.kind) + ITEMS[s.kind].n + itemCount(s) : '<em>vacía</em>'}</div>`).join('')}</div>`;
    } else if (me.escaped) { const V = viewer(); L += `<b>Estás en la camioneta.</b> ${V && V !== me ? `Viendo a <b style="color:${V.color}">${V.name}</b> · <kbd>Espacio</kbd> cambiar` : 'Ya no queda nadie adentro.'}`; } else L += '<b>Eres un espíritu.</b> Ves al ánima siempre.';
    if (me.alive && handItem(me) && ITEMS[handItem(me).kind].hint) L += `<p class="small">${ITEMS[handItem(me).kind].hint}</p>`;
    L += '<div class="team">' + w.invs.map(i => `<span style="color:${i.color}"><img class="av" src="${portrait(i, !i.alive)}" alt="">${i.name}${i.alive ? (i.escaped ? ' ✓' : ` ${Math.round(i.san)}`) : ' ✿'}</span>`).join(' · ') + '</div>';
    const hh = contextHint(me); $('#hint').innerHTML = hh; $('#hint').classList.toggle('empty', hh === '&nbsp;'); $('#hint').classList.remove('ghosthint');
  } else {
    const d = g.def, cd = k => Math.max(0, g.ready[k] - w.t);
    const st = { despertando: 'Despertando…', libre: g.hunt ? (g.hunt.huida ? 'Huida' : 'Cazando') : g.returning ? 'Volviendo a tu cuarto' : 'Libre', desvanecida: 'Te desvaneces: te están viendo', descanso: `Inmóvil en tu guarida ${Math.max(0, (g.restUntil || 0) - w.t).toFixed(0)} s` }[g.state];
    L += `<b>${d.n}</b> · te ven como ${LOOK_NAMES[g.look]} · ${ROOMS[g.home.f][g.home.r].n} (${g.home.f ? 'alta' : 'baja'})<div class="row small">Presencia (hambre) ${g.pres.toFixed(0)}/${d.presMax} · ${inHome(g) && !g.hunt ? 'recargas en tu guarida (dejas rastro doble)' : 'baja 1/s: asusta para alimentarte'}${bar(g.pres, d.presMax, g.state === 'libre' ? '#7ec8ff' : '#e04a5a')}</div><div class="row small state">${st}${w.t < g.blindUntil ? ' · ¡CIEGA!' : ''}${g.hunt ? ` · velocidad ${(ghostSpeed(w, g)).toFixed(1)} m/s` : ''}</div>`;
    if (role === 'ghost') {
      const ab = (k, n, ok, extra) => `<div class="ab ${ok ? '' : 'off'}"><kbd>${k}</kbd>${n} <small>${extra}</small></div>`;
      const fq = k => d.freq[k] === 0 ? 'nunca' : d.freq[k] !== 1 ? `×${d.freq[k]}` : '';
      L += ab('Q', 'Escalofrío', gReady(w, g, 'q'), cd('q') ? cd('q').toFixed(0) + ' s' : fq('q')) + ab('E', 'Apagar luz', gReady(w, g, 'e'), d.freq.e === 0 ? 'nunca' : cd('e') ? cd('e').toFixed(0) + ' s' : fq('e'))
        + ab('F', 'Portazo', gReady(w, g, 'f'), d.freq.f === 0 ? 'nunca' : cd('f') ? cd('f').toFixed(0) + ' s' : fq('f')) + ab('C', 'Aventar objeto', gReady(w, g, 'c') && w.loose.some(o => o.f === g.f && Math.hypot(o.x - g.x, o.y - g.y) <= 3.5), d.freq.c === 0 ? 'nunca' : cd('c') ? cd('c').toFixed(0) + ' s' : 'un objeto suelto del cuarto, a 3,5 m')
        + ab('N', 'Apagón', freqOK(g, 'e') && w.t >= g.ready.n && g.pres >= CFG.apagon.cost, w.t < g.ready.n ? (g.ready.n - w.t).toFixed(0) + ' s' : 'toda la planta a oscuras y linternas fallan 4 s') + ab('M', 'Mudanza', g.mudanzas > 0, `tu guarida pasa al cuarto donde estás (quedan ${g.mudanzas})`) + ab('P', 'Poseer', w.t >= (g.ready.p || 0) && g.pres >= CFG.possess.cost, w.t < (g.ready.p || 0) ? Math.ceil(g.ready.p - w.t) + ' s' : 'mueves a alguien a 6 m; solo su sombra lo delata') + ab('Y', 'Anomalía', w.t >= (g.ready.y || 0) && g.pres >= CFG.anomaly.cost, w.t < (g.ready.y || 0) ? Math.ceil(g.ready.y - w.t) + ' s' : 'algo aparece o cambia donde nadie mira') + ab('K', 'Manifestarte', w.t >= (g.ready.k || 0) && g.pres >= CFG.manifest.cost, w.t < (g.ready.k || 0) ? Math.ceil(g.ready.k - w.t) + ' s' : 'apareces de golpe con un sonido a 7 m') + ab('J', 'Alucinación', w.t >= (g.ready.j || 0) && g.pres >= CFG.hallu.cost, w.t < (g.ready.j || 0) ? Math.ceil(g.ready.j - w.t) + ' s' : 'alguien solo ve a un compañero que no está') + ab('G', 'Interferencia', w.t >= g.ready.g && g.pres >= CFG.interf.cost, w.t < g.ready.g ? (g.ready.g - w.t).toFixed(0) + ' s' : 'aparatos a 6 m dan lecturas dudosas 8 s')
        + ab('T', 'Objeto de la casa', gReady(w, g, 'c') && !!nearestProp(w, g, 2.6), nearestProp(w, g, 2.6) ? PROP_INFO[nearestProp(w, g, 2.6).kind][0].toLowerCase() : 'acércate a uno') + ab('V', 'Imitar voz', gReady(w, g, 'v'), d.freq.v === 0 ? 'nunca' : cd('v') ? cd('v').toFixed(0) + ' s' : 'atrae con la voz de un compañero')
        + (d.special ? ab('R', d.special.n, w.t >= g.ready.r && g.state === 'libre', cd('r') ? cd('r').toFixed(0) + ' s' : d.special.d) : '')
        + (() => { const hi = huntInfo(w, g); return ab('H', 'Cazar', canHunt(w, g), canHunt(w, g) ? '¡lista! mata al tocar a alguien' : hi ? (hi.wait > 0 ? `espera ${hi.wait.toFixed(0)} s` : !hi.pres ? 'falta presencia' : 'falta: ' + hi.txt) : ''); })() + ab('B', 'Volver a la guarida', g.state === 'libre' && !g.hunt, 'recargas, pero dejas rastro doble')
        + ab('Z', 'Cambiar de piso', true, g.hunt ? (d.fly ? 'en cualquier punto' : 'en una escalera') : 'atraviesas el techo o el piso')
        + (w.ritual ? `<div class="ab alert">¡Te nombran en el altar! ${(w.ritual.until - w.t).toFixed(1)} s · acércate, asusta o caza a ${w.ritual.by.name}</div>` : '')
        + (w.phase === 'huida' ? ab('X', 'ESPANTO: ' + d.espanto.n, !g.espantoUsed, d.espanto.d) : '');
      L += `<div class="row small">Fuera de cacería <b>atraviesas muros</b>; en cacería usas puertas. · Pasiva: ${d.passive ? d.passive.n : '—'} · Sello: ${d.sello.n}</div>`;
    } else L += `<div class="row small">Velocidad ×${speedMult} (<kbd>+</kbd>/<kbd>−</kbd>) · <kbd>V</kbd> cambia la cámara</div>`;
    const lvl = s => s > 60 ? 'tranquilo' : s > 35 ? 'nervioso' : 'aterrado';
    L += '<div class="team">' + w.invs.map(i => `<span style="color:${i.color}">${i.name} ${i.alive ? (i.escaped ? 'salió' : role === 'bots' ? Math.round(i.san) : lvl(i.san)) : '✿'}${g.perceived.has(i) ? ' 👁' : ''}</span>`).join(' · ') + '</div>';
    $('#hint').classList.add('ghosthint'); $('#hint').classList.remove('empty'); $('#hint').innerHTML = role === 'ghost' ? (g.state === 'descanso' ? 'Inmóvil en tu guarida: solo puedes usar Escalofrío' : 'Tienes hambre: lo que haces no deja evidencia, pero tu rastro sí. Solo ves a quien percibes (👁).') : '';
  }
  $('#left').innerHTML = L;
  // resumen compacto (siempre visible)
  let M = '';
  if (role === 'inv') { const me = w.invs[ME];
    if (me.alive && !me.escaped) { const h = handItem(me); M = `<img class="m-av" src="${portrait(me)}" alt=""><span class="m-san" style="color:${sanCol(me.san)}">🕯 ${Math.round(me.san)}</span><span class="m-bars">${bar(me.san, 100, sanCol(me.san))}${bar(me.stam, 100, me.tired ? '#e04a5a' : '#9aa6d9')}</span><span class="m-hand">${h ? cardImg(h.kind, 'mci') + ITEMS[h.kind].n + itemCount(h) : '✋ nada'}${me.hidden >= 0 ? ' · escondido' : ''}${me.mirror && w.mirrorView ? ` · <b class="mirror">🪞 ${w.mirrorView.r >= 0 ? ROOMS[w.mirrorView.f][w.mirrorView.r].n : 'pasillo'}${w.mirrorView.f ? ' (alta)' : ' (baja)'}</b>` : ''}</span>`; }
    else if (!me.alive && !me.escaped) M = `<img class="m-av" src="${portrait(me, true)}" alt="">✿ Espíritu`;
    else M = me.escaped ? 'Saliste de la casona' : '✿ Espíritu';
  } else { const d = g.def; const cd = k => d.freq[k] === 0 ? '—' : gReady(w, g, k) ? '✓' : g.ready[k] > w.t ? Math.ceil(g.ready[k] - w.t) + 's' : '·';
    M = `<span class="m-san">${d.n}</span><span class="m-bars">${bar(g.pres, d.presMax, g.state === 'libre' ? '#7ec8ff' : '#e04a5a')}</span><span class="m-hand">${g.hunt ? (g.hunt.huida ? 'Huida' : 'Cazando') : g.state === 'libre' ? 'Libre' : g.state === 'descanso' ? 'Inmóvil' : g.state === 'desvanecida' ? 'Desvanecida' : 'Despertando'}</span>`
      + (role === 'ghost' ? `<span class="m-keys">Q ${cd('q')} · E ${cd('e')} · F ${cd('f')} · C ${cd('c')} · V ${cd('v')}${nearestProp(w, g, 2.6) ? ' · T objeto' : ''}${d.special ? ' · R ' + (w.t >= g.ready.r ? '✓' : Math.ceil(g.ready.r - w.t) + 's') : ''} · H ${canHunt(w, g) ? '✓' : '✗'}</span>` : ''); }
  $('#mini').innerHTML = M + '<span class="m-more">ⓘ</span>';
  $('#left').classList.toggle('show', infoPinned || performance.now() < infoUntil);
  // botones táctiles del ánima: atenuar los que no están listos
  if (role === 'ghost') document.querySelectorAll('#tbtns button[data-k]').forEach(b => { const k = b.dataset.k; const ok = k === 'h' ? canHunt(w, g) : k === 'x' ? w.phase === 'huida' && !g.espantoUsed : k === 'r' ? !!g.def.special && w.t >= g.ready.r : ['q', 'e', 'f', 'c', 'v'].includes(k) ? gReady(w, g, k) : true; b.classList.toggle('off', !ok); });
  if (journalOpen) $('#journalIn').innerHTML = journalHTML(false);
  const vis = role === 'inv' ? 'i' : role === 'ghost' ? 'g' : 'x';
  $('#feed').innerHTML = w.log.filter(l => (l.vis === 'a' || l.vis === vis || role === 'bots') && (l.who === undefined || l.who === null || l.who === ME) && w.t - l.t < 7).slice(-3).map(l => `<div>${l.msg}</div>`).join('');
  // subtítulos de sonidos cercanos
  const subs = w.subs.filter(s => V && (vk !== 'inv' || (s.f === V.f && Math.hypot(s.x - V.x, s.y - V.y) <= s.r))).slice(-3);
  $('#subs').innerHTML = subs.map(s => `<div>(${s.text})</div>`).join('');
  $('#vignette').classList.toggle('hunt', !!g.hunt && V && !['afuera', 'afuera1'].includes((ROOMS[V.f][roomAt(V.f, V.x, V.y)] || {}).id)); $('#vignette').classList.toggle('low', V && V.kind === 'inv' && V.alive && V.san < 40);
}
let journalOpen = false, infoPinned = false, infoUntil = 0;
function showInfo(sec) { infoUntil = performance.now() + sec * 1000; }
function freeMouse() { try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {} keys.clear(); }
function toggleJournal() { journalOpen = !journalOpen; $('#journal').hidden = !journalOpen; if (journalOpen) { freeMouse(); $('#journalIn').innerHTML = journalHTML(false); } }
function showNaming(dawn) {
  freeMouse(); $('#modal').hidden = false;
  $('#modalIn').innerHTML = `<h2>${dawn ? 'Amanece' : 'El altar'}</h2><p>${dawn ? 'Última oportunidad: basta 1 prueba. Si fallas, gana el ánima.' : 'Di su nombre. Si aciertas, empieza la huida al Zaguán; si fallas, gana el ánima.'}</p>${journalHTML(true)}<div class="btns">${dawn ? '' : '<button id="closeM" class="ghostbtn">Todavía no</button>'}</div>`;
  const c = $('#closeM'); if (c) c.onclick = () => { $('#modal').hidden = true; };
}
function showEnd() {
  freeMouse();
  const o = w.over, role = w.opt.role, youWin = (role === 'inv' && o.win === 'inv') || (role === 'ghost' && o.win === 'ghost');
  $('#modal').hidden = false;
  $('#modalIn').innerHTML = `<img class="endart" src="${ASSET}a/${o.win === 'inv' ? 'final_vivos' : 'final_anima'}.webp" alt=""><h2>${role === 'bots' ? (o.win === 'inv' ? 'Ganan los investigadores' : 'Gana el ánima') : youWin ? '¡Ganaste!' : 'Perdiste'}</h2><p class="big">${o.cause}</p><div class="endcards"><img src="${idCard(w.g.def)}" alt=""><img src="${esCard(w.g.def)}" alt=""></div>
    <p>Era <b>${w.g.def.n}</b> (${w.g.def.ev.map(k => EV[k].n).join(', ')}), con su cuarto en ${ROOMS[w.g.home.f][w.g.home.r].n}. Sello: ${w.g.def.sello.n}.</p>
    <p class="small">Duración ${fmt(w.t)} · cacerías ${w.stats.hunts}${w.stats.cursed ? ` (${w.stats.cursed} malditas)` : ''} · muertes ${w.stats.deaths} · rosarios ${w.stats.rosaries} · evidencias ${Object.keys(w.conf).length}</p>
    <div class="btns"><button id="again">Jugar otra</button><button id="tomenu" class="ghostbtn">Menú</button></div>`;
  $('#again').onclick = () => start(); $('#tomenu').onclick = () => toMenu();
}
$('#modal').addEventListener('click', e => { const b = e.target.closest('button[data-name]'); if (!b || !w) return; const me = w.invs[ME]; if (NET.mode === 'guest') netActs.push({ k: 'name', id: b.dataset.name }); else nameGhost(w, me, b.dataset.name); $('#modal').hidden = true; });
$('#journal').addEventListener('click', e => { const gd = e.target.closest('[data-g]'); if (gd && w) { const id = gd.dataset.g; if (e.target.closest('.gx')) { w.discardG = w.discardG || {}; w.discardG[id] = !w.discardG[id]; } else jSel = jSel === id ? null : id; $('#journalIn').innerHTML = journalHTML(false); return; }
  const el = e.target.closest('[data-ev]'); if (el && w) { const k = el.dataset.ev; if (w.conf[k]) { delete w.conf[k]; w.discard[k] = true; } else if (w.discard[k]) w.discard[k] = false; else w.conf[k] = { by: 'tú', t: w.t, how: 'a mano' }; $('#journalIn').innerHTML = journalHTML(false); } });
$('#left').addEventListener('click', e => { const s = e.target.closest('[data-slot]'); if (s && w) pressed.add(String(+s.dataset.slot + 1)); });

// ---------- Entrada ----------
const KEYMAP = { arrowup: 'w', arrowdown: 's', arrowleft: 'turnl', arrowright: 'turnr' };
addEventListener('keydown', e => {
  if (!running) return; let k = e.key.toLowerCase(); k = KEYMAP[k] || k;
  if ([' ', 'tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase()) || e.key === ' ' || e.key === 'Tab') e.preventDefault();
  if (k === 'tab') { toggleJournal(); return; } if (k === 'i') { infoPinned = !infoPinned; return; } if (k === 'm') { if (audio) audio.muted = !audio.muted; musicPlay(!(audio && audio.muted)); $('#mute').textContent = audio && audio.muted ? '🔇' : '🔊'; return; }
  if (k === 'r' && w && w.opt.role === 'inv') { if (!throwing) { throwing = true; throwHold = 0; } return; }
  if (k === 'v' && w && w.opt.role === 'inv' && NET.mode !== 'off') { if (!e.repeat) radioSet(true); return; }
  if (!keys.has(k)) pressed.add(k); keys.add(k);
  if (k === 'v' && w && w.opt.role === 'bots') follow++;
  if ((k === '+' || k === '=') && w && w.opt.role === 'bots') speedMult = Math.min(8, speedMult * 2); if (k === '-' && w && w.opt.role === 'bots') speedMult = Math.max(1, speedMult / 2);
});
addEventListener('keyup', e => { let k = e.key.toLowerCase(); k = KEYMAP[k] || k; keys.delete(k); if (k === 'v') radioSet(false); if (k === 'r' && throwing) { throwing = false; pressed.add('throw'); } });
addEventListener('blur', () => keys.clear());
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; if (running && !$('#game').hidden && $('#modal').hidden) { const locked = document.pointerLockElement === (renderer && renderer.domElement); const k = locked ? 0.0026 : 0.004; yaw += (e.movementX || 0) * k; pitch = clamp(pitch - (e.movementY || 0) * k * 0.7, -0.7, 0.55); } });
addEventListener('wheel', e => { if (running && w && w.opt.role === 'inv') pressed.add(e.deltaY > 0 ? 'wheeldown' : 'wheelup'); }, { passive: true });
function canvasDown(e) { if (!running || !w || journalOpen || !$('#modal').hidden) return; if (w.opt.role === 'inv' && w.invs[ME] && w.invs[ME].escaped) { specIdx++; return; } if (e.pointerType !== 'touch' && !matchMedia('(pointer: coarse)').matches && document.pointerLockElement !== renderer.domElement) { try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (err) {} } if (e.button === 0) pressed.add(' '); if (e.button === 2 && w.opt.role === 'inv') { throwing = true; throwHold = 0; } }
function canvasUp(e) { if (e.button === 2 && throwing) { throwing = false; pressed.add('throw'); } }

// ---------- Bucle ----------
let last = 0, hudT = 0;
function frame(ts) {
  if (!running) return; requestAnimationFrame(frame);
  NDAVisualQuality.frame(renderer,ts-last,ts);
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  const vk = viewKind();
  if (keys.has('turnl')) yaw -= dt * 2.2; if (keys.has('turnr')) yaw += dt * 2.2;
  const strafe = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0) + joy.x, fwd = (keys.has('w') ? 1 : 0) - (keys.has('s') ? 1 : 0) - joy.y;
  const fxv = Math.cos(yaw), fyv = Math.sin(yaw);
  let mx = fxv * fwd - fyv * strafe, my = fyv * fwd + fxv * strafe; if (Math.abs(mx) < 1e-4) mx = 0; if (Math.abs(my) < 1e-4) my = 0;
  if (vk === 'all') { mx = 0; my = 0; }
  if (throwing) throwHold += dt;
  const face = yaw;
  const input = w.opt.role === 'bots' ? null : { mx, my, sprint: keys.has('shift'), press: new Set(pressed), face, throwPower: 2 + Math.min(1, throwHold / 1.0) * 6 };
  if (w.opt.role === 'ghost') w.g.face = face;
  if (input && input.press.has('throw')) throwHold = 0;
  if (['1', '2', '3', '4', 'wheelup', 'wheeldown', 'g', 'e', 'throw', ' '].some(k => pressed.has(k))) showInfo(3);
  pressed.clear();
  if (NET.mode === 'host' && NET.started) {
    if (input) w.invs[ME].radio = VOICE.radio;
    step(w, dt, netHostInputs(w, ME, input)); netAfterStep(w);
    NET.sendT -= dt; if (NET.sendT <= 0 || w.over) { NET.sendT = 0.1; netBroadcast(w); }
  } else if (NET.mode === 'guest' && NET.started) {
    const me = w.invs[ME]; w.t += dt;
    if (input) { input.press.forEach(k => NET.pressAcc.add(k)); if (me.alive) netLocalMove(w, me, input, dt); me.radio = VOICE.radio; }
    netSmooth(w, dt, ME);
    NET.inT -= dt; if ((NET.inT <= 0 || NET.pressAcc.size || netActs.length) && input) { NET.inT = 0.05; netSendInput(input, me, netActs.splice(0)); }
  } else {
    const n = w.opt.role === 'bots' ? speedMult : 1;
    for (let k = 0; k < n; k++) step(w, dt, k === 0 ? input : { mx, my, sprint: false, press: new Set(), face });
  }
  if (NET.mode !== 'off' && NET.started) { VOICE.update(w, w.invs[ME] || alive(w).find(i => i === viewer()) || alive(w)[0], yaw); NET.callT = (NET.callT || 0) - dt; if (NET.callT <= 0) { NET.callT = 2; VOICE.callAll(w.invs.filter(i => i.peer)); } }
  if (w.events.some(e => e.type === 'altar' && (e.who === undefined || e.who === ME))) showNaming(false);
  if (w.pendingDawn && $('#modal').hidden && w.opt.role === 'inv') showNaming(true);
  feedbackEvents(); playEvents(); huntAudio(dt); updateListener(); feedbackTick(dt); ambienceTick(dt); updateOverlay(); updatePlacement(ts / 1000);
  updateScene(ts / 1000, dt); updateCamera(dt);
  if (shakeAmt > 0) { camera.position.x += (Math.random() - 0.5) * shakeAmt * 0.3; camera.position.y += (Math.random() - 0.5) * shakeAmt * 0.3; shakeAmt = Math.max(0, shakeAmt - dt * 1.5); }
  renderer.render(scene, camera);
  hudT -= dt; if (hudT <= 0) { hudT = 0.12; hud(); }
  $('#throwbar').hidden = !throwing; if (throwing) $('#throwbar i').style.width = Math.min(100, throwHold * 100) + '%';
  if (w.over) { running = false; showEnd(); }
}

// ---------- Inicio y menú ----------
function setupRenderer() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;NDAVisualQuality.apply(renderer,null);
  $('#stage').appendChild(renderer.domElement);
  renderer.domElement.addEventListener('mousedown', canvasDown); renderer.domElement.addEventListener('mouseup', canvasUp); renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
  camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
  addEventListener('resize', () => { NDAVisualQuality.apply(renderer,flash);renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
}
let netActs = [], bgLast = 0;
setInterval(() => { // si el anfitrión cambia de pestaña, la partida sigue para los demás
  if (!running || !w || NET.mode !== 'host' || !NET.started || !document.hidden) { bgLast = performance.now(); return; }
  const now = performance.now(), dt = Math.min(0.1, (now - bgLast) / 1000); bgLast = now;
  step(w, dt, netHostInputs(w, ME, { mx: 0, my: 0, sprint: false, press: new Set(), face: yaw })); netAfterStep(w); w.events.length = 0;
  NET.sendT -= dt; if (NET.sendT <= 0 || w.over) { NET.sendT = 0.1; netBroadcast(w); }
}, 50);
function radioSet(on) { if (!VOICE.on) return; VOICE.radio = on; if (on) tone(1800, 0.05, 'square', 0.05, null); $('#radioInd') && ($('#radioInd').hidden = !on); }
function start(netStart) {
  galleryStop(); setupRenderer();
  ME = 0; netActs = [];
  if (NET.mode === 'host') {
    const spec = !!($('#onSpec') && $('#onSpec').checked); NET.spec = spec;
    const humans = NET.lobby.filter(p => !spec || p.peer !== NET.id).map(p => ({ name: p.name, char: p.char, peer: p.peer }));
    const lab = !!($('#onLab') && $('#onLab').checked);
    const opt = Object.assign({}, menuOpt, { role: 'inv', humans, nInv: lab ? Math.max(1, humans.length) : Math.max(menuOpt.nInv, humans.length, 1), cursed: menuOpt.cursed, lab });
    w = newWorld(spec ? Object.assign({}, opt, { role: 'bots' }) : opt); netHookWorld(w); NET.started = true; if (spec) { ME = -1; try { VOICE.stream && VOICE.stream.getAudioTracks().forEach(t => t.enabled = false); } catch (e) {} }
    const pkt = Object.assign({ t: 'start', opt: Object.assign({}, opt, { role: 'inv' }) }, netEnc(w, true));
    for (const c of NET.conns.values()) if (c.open) c.send(pkt);
  } else if (NET.mode === 'guest' && netStart) {
    const opt = netStart.opt; w = newWorld(Object.assign({}, opt));
    ME = Math.max(0, opt.humans.findIndex(h => h.peer === NET.id));
    netApply(w, netStart, ME); w.events.length = 0;
  } else w = newWorld(Object.assign({}, menuOpt));
  if(scene){const geos=new Set(),mats=new Set(),textures=new Set();for(const tv of baseTVs||[])tv.rt?.dispose();casa3d?.tvRT?.dispose();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){mats.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}o.shadow?.map?.dispose();});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  buildHouse(); camPos.set(0, 0, 0); yaw = -Math.PI / 2; pitch = -0.12; if (w.opt.role !== 'bots') setTimeout(nightRoulette, 300);
  follow = 0; speedMult = menuOpt.role === 'bots' && NET.mode === 'off' ? 2 : 1; keys.clear(); pressed.clear(); journalOpen = false; $('#journal').hidden = true;
  $('#menu').hidden = true; $('#modal').hidden = true; $('#game').hidden = false; setupTouch();
  running = true; last = performance.now(); requestAnimationFrame(frame); musicPlay(true); fb.san = null; fb.tipQ = []; fb.tipUntil = 0; $('#tip').hidden = true;
}
window.__w = () => w;
// ---------- Galería de personajes y animaciones ----------
const GAL_STATES = [['quieto', 'Quieto'], ['caminar', 'Caminar'], ['correr', 'Correr'], ['linterna', 'Linterna'], ['apuntar', 'Apuntar la UV'], ['tomar', 'Tomar del piso'], ['usar', 'Usar objeto'], ['aventar', 'Aventar'], ['escondido', 'Escondido'], ['miedo', 'Miedo'], ['morir', 'Morir'], ['espiritu', 'Espíritu'], ['manifestar', 'Manifestarse']];
const GAL_GHOST = [['flotar', 'Flotar'], ['cazar', 'Cazar'], ['cegada', 'Cegada (rosario)'], ['atrapada', 'Atrapada (pentagrama)']];
let gal = null;
function startGallery() {
  setupRenderer(); paper = paperTex(); handT = handTex();
  scene = new THREE.Scene(); scene.background = new THREE.Color(COL.night); scene.fog = new THREE.Fog(COL.night, 18, 40);
  scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x3a2020, 1.3)); scene.add(new THREE.AmbientLight(0x6a5a8a, 0.6));
  const key = new THREE.SpotLight(0xffd8a8, 60, 40, 0.9, 0.5, 1); key.position.set(4, 9, 8); key.castShadow = true; scene.add(key); scene.add(key.target);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), LambertFlat({ color: 0x3a2a34, map: paper })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const chars = CHAR_IDS.map((id, k) => { const r = makeCharacter(id, paper); r.g.position.set((k - 6) * 1.05, 0, 1.2 - Math.abs(k - 6) * 0.12); scene.add(r.g); return r; });
  const ghosts = LOOKS.map((lk, k) => { const r = makeGhostRig(lk, null); r.g.position.set((k - 2.5) * 1.9, 0, -2.4); r.opS = 1; scene.add(r.g); return r; });
  gal = { chars, ghosts, st: 0, gst: 0, auto: true, t0: performance.now() / 1000, ang: 0, h: 2.2, dist: 11.5, focus: null, last: performance.now() };
  $('#menu').hidden = true; $('#modal').hidden = true; $('#game').hidden = false; $('#game').classList.add('gal'); $('#galui').hidden = false;
  galleryUI(); requestAnimationFrame(galleryFrame);
}
function galleryStop() { if (!gal) return; gal = null; $('#game').classList.remove('gal'); $('#galui').hidden = true; }
function galleryUI() {
  const b = (arr, cur, attr) => arr.map(([k, n], j) => `<button data-${attr}="${j}" class="${cur === j ? 'on' : ''}">${n}</button>`).join('');
  $('#galui').innerHTML = `<div class="galrow"><b>Personajes</b> ${b(GAL_STATES, gal.auto ? -1 : gal.st, 'st')} <button data-auto="1" class="${gal.auto ? 'on' : ''}">Ciclo automático</button></div>
    <div class="galrow"><b>Ánima</b> ${b(GAL_GHOST, gal.gst, 'gst')} · <span class="small">arrastra para girar · rueda o pellizco para acercar · toca un nombre para enfocarlo</span></div>
    <div class="galrow chips">${CHAR_IDS.map((id, k) => `<button data-focus="${k}" class="${gal.focus === k ? 'on' : ''}"><img src="${charImg(id)}" alt="">${CHARS[id].n}${CHARS[id].rol ? ' · ' + CHARS[id].rol : ''}</button>`).join('')}<button data-focus="-1">Todos</button></div>
    <div class="galnow" id="galnow"></div>`;
}
$('#galui') && $('#galui').addEventListener('click', e => { const t = e.target.closest('button'); if (!t || !gal) return;
  if (t.dataset.st !== undefined) { gal.st = +t.dataset.st; gal.auto = false; gal.t0 = performance.now() / 1000; }
  if (t.dataset.auto) { gal.auto = !gal.auto; }
  if (t.dataset.gst !== undefined) gal.gst = +t.dataset.gst;
  if (t.dataset.focus !== undefined) { const k = +t.dataset.focus; gal.focus = k < 0 ? null : k; gal.dist = k < 0 ? 11.5 : 3.2; gal.h = k < 0 ? 2.2 : 1.3; }
  galleryUI(); });
(() => { let drag = null, pinch = 0; const st = document.getElementById('stage'); if (!st) return;
  st.addEventListener('pointerdown', e => { if (gal) drag = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('pointermove', e => { if (!gal || !drag) return; gal.ang -= (e.clientX - drag.x) * 0.008; gal.h = clamp(gal.h + (e.clientY - drag.y) * 0.01, 0.4, 6); drag = { x: e.clientX, y: e.clientY }; });
  st.addEventListener('wheel', e => { if (gal) gal.dist = clamp(gal.dist * (e.deltaY > 0 ? 1.1 : 0.9), 2, 20); }, { passive: true });
  st.addEventListener('touchmove', e => { if (!gal || e.touches.length !== 2) return; const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) gal.dist = clamp(gal.dist * pinch / d, 2, 20); pinch = d; }, { passive: true });
  st.addEventListener('touchend', () => { pinch = 0; }); })();
function galleryFrame(ts) {
  if (!gal) return; requestAnimationFrame(galleryFrame);
  const t = ts / 1000, dt = Math.min(0.05, (ts - gal.last) / 1000 || 0); gal.last = ts;
  if (gal.auto && t - gal.t0 > 3.5) { gal.st = (gal.st + 1) % GAL_STATES.length; gal.t0 = t; }
  const key = GAL_STATES[gal.st][0], el = t - gal.t0;
  gal.chars.forEach((r, k) => {
    const v = key === 'caminar' ? 2.6 : key === 'correr' ? 3.8 : 0; const st = { x: v * t, y: k * 3, t, dt, run: false, hidden: key === 'escondido', dead: ['morir', 'espiritu', 'manifestar'].includes(key), manifest: key === 'manifestar', lamp: key === 'linterna' || key === 'correr', holding: ['usar', 'aventar', 'apuntar'].includes(key), aim: key === 'apuntar', tremble: key === 'miedo' ? 1 : 0 };
    if (key === 'linterna' || key === 'correr') st.lamp = true;
    if (key === 'tomar' && (el % 1.4) < dt * 1.5) r.t.dip = t; if (key === 'usar' && (el % 1.4) < dt * 1.5) r.t.use = t; if (key === 'aventar' && (el % 1.4) < dt * 1.5) r.t.throw = t;
    if (key === 'espiritu' || key === 'manifestar') { if (r.t.death < 0 || t - r.t.death < 2.9) r.t.death = t - 3; } else if (key === 'morir' && el < dt * 1.5) r.t.death = t; else if (!st.dead) r.t.death = -1;
    if (key === 'morir' && el > 2.4) r.t.death = t - 0.01;
    const want = key === 'apuntar' ? 'uv' : 'te'; if (st.holding && r.handKind !== want) { r.handKind = want; r.hand.clear(); const im = makeItemMesh({ kind: want }); scene.remove(im.g); im.halo.visible = false; im.g.scale.setScalar(0.8); im.g.rotation.y = -Math.PI / 2; im.g.position.y = -0.06; r.hand.add(im.g); }
    if (!st.holding && r.handKind) { r.handKind = null; r.hand.clear(); }
    animateCharacter(r, st); r.g.rotation.y = 0;
  });
  const gk = GAL_GHOST[gal.gst][0];
  gal.ghosts.forEach((r, k) => { animateGhostRig(r, { x: gk === 'cazar' ? 3 * t : 0, y: k * 3, t, dt, hunt: gk === 'cazar', blind: gk === 'cegada', stunned: gk === 'atrapada', op: gk === 'cegada' ? (Math.sin(t * 30) > 0 ? 0.9 : 0.15) : 1 }); if (gk === 'cegada') r.opS = Math.sin(t * 30) > 0 ? 0.9 : 0.15;
    r.mat.emissive.setHex(gk === 'cazar' ? 0x802020 : 0x405070); r.eyeMat.color.setHex(gk === 'cazar' ? 0xff3b4a : COL.gold); });
  const f = gal.focus !== null ? gal.chars[gal.focus].g.position : { x: 0, y: 0, z: -0.4 };
  const tgt = new THREE.Vector3(f.x, gal.focus !== null ? 0.95 : 1.0, f.z), want = new THREE.Vector3(f.x + Math.sin(gal.ang) * gal.dist, gal.h, f.z + Math.cos(gal.ang) * gal.dist);
  camPos.lerp(want, Math.min(1, dt * 5)); camLook.lerp(tgt, Math.min(1, dt * 6)); if (camPos.lengthSq() === 0) { camPos.copy(want); camLook.copy(tgt); }
  camera.position.copy(camPos); camera.lookAt(camLook);
  const nw = $('#galnow'); if (nw) nw.textContent = `Personajes: ${GAL_STATES[gal.st][1]}${gal.auto ? ' (ciclo)' : ''} · Ánima: ${GAL_GHOST[gal.gst][1]}`;
  renderer.render(scene, camera);
}
function toMenu() { if (NET.mode !== 'off' && NET.started) netClose(); running = false; musicPlay(false); galleryStop(); $('#modal').hidden = true; $('#game').hidden = true; $('#menu').hidden = false; }
function setupTouch() {
  const touch = matchMedia('(pointer: coarse)').matches; $('#touch').hidden = !touch || menuOpt.role === 'bots'; if (!touch) return;
  const btns = menuOpt.role === 'ghost' ? [['q', 'Escalofrío'], ['e', 'Luz'], ['f', 'Portazo'], ['c', 'Mover'], ['t', 'Objeto'], ['v', 'Voz'], ['n', 'Apagón'], ['m', 'Mudanza'], ['g', 'Interfer.'], ['k', 'Aparecer'], ['j', 'Alucinar'], ['p', 'Poseer'], ['y', 'Anomalía'], ['r', 'Habilidad'], ['h', 'Cazar'], ['b', 'Volver'], ['z', 'Piso'], ['x', 'Espanto']]
    : [[' ', 'Usar'], ['e', 'Acción'], ['shift', 'Correr'], ['throw', 'Aventar'], ['g', 'Dejar'], ['slot', 'Ranura'], ['q', 'Luz'], ['f', 'Linterna'], ['tab', 'Libreta']];
  $('#tbtns').classList.toggle('ghost', menuOpt.role === 'ghost');
  $('#tbtns').innerHTML = btns.map(([k, n]) => `<button data-k="${k}">${n}</button>`).join('');
  $('#tbtns').querySelectorAll('button').forEach(b => { const k = b.dataset.k;
    b.onpointerdown = e => { e.preventDefault(); if (k === 'slot') { pressed.add('wheeldown'); showInfo(3); return; } if (k === 'tab') { toggleJournal(); return; } if (k === 'throw') { throwing = true; throwHold = 0; return; } pressed.add(k); keys.add(k); };
    b.onpointerup = b.onpointerleave = () => { keys.delete(k); if (k === 'throw' && throwing) { throwing = false; pressed.add('throw'); } }; });
}
{ const pad = $('#joy'), knob = $('#knob'); let id = null, ox = 0, oy = 0;
  const move = e => { if (e.pointerId !== id) return; let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy), m = 45; if (l > m) { dx = dx / l * m; dy = dy / l * m; } knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = Math.abs(dx) > 8 ? dx / m : 0; joy.y = Math.abs(dy) > 8 ? dy / m : 0; };
  pad.addEventListener('pointerdown', e => { id = e.pointerId; const r = pad.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2; pad.setPointerCapture(id); move(e); });
  pad.addEventListener('pointermove', move);
  const up = e => { if (e.pointerId !== id) return; id = null; joy.x = joy.y = 0; knob.style.transform = ''; }; pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up); }

function menu() {
  const seg = (name, opts, cur) => `<div class="seg" data-name="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  $('#opts').innerHTML = `<label>Juegas como</label>${seg('role', [['inv', 'Investigador'], ['ghost', 'Ánima'], ['bots', 'Mirar a los bots']], menuOpt.role)}
    ${menuOpt.role === 'inv' ? `<label>Tu personaje</label><div class="seg chars" data-name="char">${NAMES.map(n => `<button data-v="${n[2]}" class="${menuOpt.char === n[2] ? 'on' : ''}" title="${CHARS[n[2]].rol || 'Investigador'}"><img src="${charImg(n[2])}" alt="">${n[0]}<small>${CHARS[n[2]].rol || 'investigador'}</small></button>`).join('')}</div>` : ''}
    <label class="chk"><input type="checkbox" id="cursedOn" ${menuOpt.cursed !== 'none' ? 'checked' : ''}> Objetos malditos <small>(experimental)</small></label>${menuOpt.cursed !== 'none' ? seg('cursed', [['random', 'Uno al azar'], ...CURSED.map(k => [k, ITEMS[k].n])], menuOpt.cursed) : ''}
    ${menuOpt.role === 'inv' ? `<label>Cámara</label>${seg('cam', [['hombro', 'Sobre el hombro'], ['fp', 'Primera persona']], menuOpt.cam)}` : ''}
    <label>Investigadores ${menuOpt.role === 'inv' ? '(tú incluido)' : ''}</label>${seg('nInv', [[1, '1 · Duelo'], [2, '2'], [3, '3'], [4, '4']], menuOpt.nInv)}
    <label>Ánima ${menuOpt.role === 'inv' ? '(al azar es un misterio)' : ''}</label>${seg('ghost', [['random', 'Al azar'], ...GHOSTS.map(G => [G.id, G.n.replace('El Guardián del Entierro', 'Guardián').replace('Espíritu ', '')])], menuOpt.ghost)}
    <label>Duración de la noche</label>${seg('night', [[480, '8 min'], [600, '10 min'], [720, '12 min']], menuOpt.night)}
    <label>Equipo en la casa</label>${seg('equip', [['escaso', 'Escaso'], ['normal', 'Normal'], ['abundante', 'Abundante']], menuOpt.equip)}
    ${menuOpt.role !== 'bots' ? `<label>Libreta</label>${seg('libreta', [['manual', 'Tú la llenas'], ['auto', 'Los bots anotan lo que ven']], menuOpt.libreta)}` : ''}
    <label>Dificultad</label>${seg('diff', [['facil', 'Fácil'], ['normal', 'Normal'], ['pesadilla', 'Pesadilla']], menuOpt.diff)}
    <label>Calidad gráfica</label>${seg('quality', [['auto','Automática'], ['low','Ligera'], ['balanced','Equilibrada'], ['high','Alta']], NDAVisualQuality.preference)}
    <label>Consejos en pantalla</label>${seg('tips', [['si', 'Sí'], ['no', 'No'], ['reset', 'Volver a mostrarlos']], menuOpt.tips)}`;
  $('#opts').querySelectorAll('.seg button').forEach(b => b.onclick = () => { const n = b.parentElement.dataset.name;if(n==='quality'){NDAVisualQuality.select(b.dataset.v);NDAVisualQuality.apply(renderer,flash);menu();return;} menuOpt[n] = ['nInv', 'night'].includes(n) ? +b.dataset.v : b.dataset.v; if (n === 'tips' && b.dataset.v === 'reset') { fb.tips.clear(); try { localStorage.removeItem('nda_tips'); } catch (e) {} menuOpt.tips = 'si'; } menu(); });
  $('#catalog').innerHTML = `<table><thead><tr><th>Ánima</th><th>Visión cerca / lejos · oído</th><th>Velocidad · caza → tope</th><th>Caza cuando</th><th>Pasiva</th><th>Habilidad</th><th>Sello</th><th>Espanto</th></tr></thead><tbody>` +
    GHOSTS.map(G => `<tr><td><b>${G.n}</b><small>${G.ev.map(k => EV[k].n).join(' · ')}</small></td><td>${G.id === 'cucuy' ? 'oscuro 6/16, luz 3/4' : G.id === 'guardian' ? 'en su cuarto 8/20, fuera 3/6' : `${G.near} / ${G.farMin ? G.farMin + '–' : ''}${G.far} m`} · ${G.hear} m</td><td>${G.id === 'guardian' ? '1,8 / 2,6' : G.speed} · ${G.huntStart} → ${G.top}</td><td>${huntRuleTxt(G)}</td><td>${G.passive ? `<b>${G.passive.n}</b><small>${G.passive.d}</small>` : '—'}</td><td>${G.special ? `<b>${G.special.n}</b><small>${G.special.d}</small>` : '—'}</td><td>${G.sello.n}<small>se confunde con: ${G.sello.parecido}</small></td><td><b>${G.espanto.n}</b><small>${G.espanto.d}</small></td></tr>`).join('') + '</tbody></table>';
}
$('#galBtn').onclick = () => { startGallery(); };
document.addEventListener('change', e => { if (e.target && e.target.id === 'cursedOn') { menuOpt.cursed = e.target.checked ? 'random' : 'none'; menu(); } });
$('#play').onclick = () => { if (!audio) initAudio(); else if (audio.ctx.state === 'suspended') audio.ctx.resume(); start(); };
$('#mute').onclick = () => { if (!audio) return; audio.muted = !audio.muted; $('#mute').textContent = audio.muted ? '🔇' : '🔊'; };
$('#quit').onclick = toMenu; $('#jbtn').onclick = toggleJournal; $('#mini').onclick = () => { infoPinned = !infoPinned; };
{ let lid = null, lx = 0, ly = 0; const st = $('#stage');
  st.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' || lid !== null) return; lid = e.pointerId; lx = e.clientX; ly = e.clientY; });
  st.addEventListener('pointermove', e => { if (e.pointerId !== lid) return; yaw += (e.clientX - lx) * 0.006; pitch = clamp(pitch - (e.clientY - ly) * 0.004, -0.7, 0.55); lx = e.clientX; ly = e.clientY; });
  const end = e => { if (e.pointerId === lid) lid = null; }; st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end); }
$('#simBtn').onclick = () => {
  const per = +$('#simN').value, nInv = +$('#simInv').value; const res = GHOSTS.map(G => ({ G, g: 0, n: 0, time: 0, d: 0, h: 0, causes: {} })); let k = 0; const total = per * res.length; $('#simBtn').disabled = true;
  const tick = () => { const t0 = performance.now();
    while (k < total && performance.now() - t0 < 40) { const r = res[k % res.length]; const sw = newWorld({ role: 'bots', nInv, ghost: r.G.id, night: 900 }); let s = 0; while (!sw.over && s < 12000) { step(sw, 0.1); s++; } r.n++; if (sw.over && sw.over.win === 'ghost') r.g++; r.time += sw.t; r.d += sw.stats.deaths; r.h += sw.stats.hunts; const c = sw.over ? sw.over.cause.replace(/[:(].*$/, '').replace(/\d+ de \d+/, 'N de M').trim() : 'Sin terminar'; r.causes[c] = (r.causes[c] || 0) + 1; k++; }
    const tot = res.reduce((a, r) => a + r.g, 0) / Math.max(1, res.reduce((a, r) => a + r.n, 0)) * 100;
    $('#simOut').innerHTML = `<p>${k}/${total} noches · el ánima gana <b>${tot.toFixed(0)} %</b> (lo justo: 50 %). Bots contra bots: es una brújula, no un veredicto.</p><table><thead><tr><th>Ánima</th><th>Gana</th><th>Dura</th><th>Cacerías</th><th>Muertes</th><th>Cómo termina</th></tr></thead><tbody>` +
      res.map(r => { const p = r.n ? r.g / r.n * 100 : 0, col = Math.abs(p - 50) <= 5 ? '#6fbf73' : Math.abs(p - 50) <= 10 ? '#f2b04e' : '#e04a5a'; return `<tr><td>${r.G.n}</td><td style="color:${col}"><b>${p.toFixed(0)} %</b></td><td>${fmt(r.n ? r.time / r.n : 0)}</td><td>${(r.h / Math.max(1, r.n)).toFixed(1)}</td><td>${(r.d / Math.max(1, r.n)).toFixed(1)}</td><td class="small">${Object.entries(r.causes).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`).join(' · ')}</td></tr>`; }).join('') + '</tbody></table>';
    if (k < total) setTimeout(tick, 0); else $('#simBtn').disabled = false; };
  tick();
};
// ---------- Sala en línea ----------
function onStatus(msg, ok) { const el = $('#onStatus'); el.textContent = msg; el.className = 'small' + (ok === true ? ' ok' : ok === false ? ' bad' : ''); }
function onName() { const v = $('#onName').value.trim(); return (v || (NAMES.find(n => n[2] === menuOpt.char) || NAMES[0])[0]).slice(0, 16); }
function onLobby(list) {
  $('#onLobby').innerHTML = list.length ? list.map((p, k) => `<span class="pl"><img src="${charImg(p.char)}" alt="">${p.name.replace(/[<>&]/g, '')}${k === 0 ? ' <small>(anfitrión)</small>' : ''}${p.peer === NET.id ? ' <small>(tú)</small>' : ''}</span>`).join('') + `<p class="small">${list.length} de 4 investigadores. Los lugares vacíos los ocupan bots según «Investigadores» en Nueva noche.</p>` : '';
  $('#onStart').hidden = NET.mode !== 'host'; $('#onLeave').hidden = NET.mode === 'off';
}
NET.cb.status = onStatus; NET.cb.lobby = onLobby;
NET.cb.snap = d => { if (w && NET.mode === 'guest' && NET.started) netApply(w, d, ME); };
NET.cb.start = d => { if (!audio) initAudio(); else if (audio.ctx.state === 'suspended') audio.ctx.resume(); start(d); };
NET.cb.end = msg => { toast(msg, '', 4); toMenu(); onStatus(msg, false); onLobby([]); };
NET.cb.left = peer => { if (!w) return; const i = w.invs.find(x => x.peer === peer); if (!i || i.escaped) return; i.slots.forEach((s, k) => { if (s) dropItem(w, i, k); }); i.escaped = true; i.left = true; VOICE.close(peer); w.say(`${i.name} se desconectó y soltó lo que traía.`, 'a'); };
$('#onHost').onclick = () => { netHost(onName(), menuOpt.char); onStatus('Creando la sala…'); };
$('#onJoin').onclick = () => { const c = $('#onCode').value.trim().toUpperCase(); if (!/^[A-Z]{4}$/.test(c)) { onStatus('El código son 4 letras.', false); return; } netJoin(c, onName(), menuOpt.char); onStatus('Conectando…'); };
$('#onLeave').onclick = () => { netClose(); onLobby([]); onStatus('Saliste de la sala.'); };
$('#onStart').onclick = () => { if (NET.mode !== 'host') return; if (!audio) initAudio(); else if (audio.ctx.state === 'suspended') audio.ctx.resume(); const lab = $('#onLab') && $('#onLab').checked; if (lab) start.skipSlot = true; try { start(); } finally { start.skipSlot = false; } };
$('#onMic').onclick = async () => { if (!audio) initAudio(); const ok = await VOICE.enable(); $('#onMic').classList.toggle('on', ok); $('#onMic').textContent = ok ? '🎙 Micrófono activo' : '🎙 Activar micrófono'; if (!ok) onStatus(VOICE.err + ' En celular, ábrelo en Chrome o Safari (no dentro de WhatsApp) y revisa el permiso del sitio.', false); };
// si cambias de personaje dentro de la sala, avísale al anfitrión
document.addEventListener('click', e => { const b = e.target.closest('.seg[data-name="char"] button'); if (!b) return; setTimeout(() => { if (NET.mode === 'guest' && NET.hostConn && NET.hostConn.open) NET.hostConn.send({ t: 'char', char: menuOpt.char, name: onName() }); if (NET.mode === 'host' && NET.lobby[0]) { NET.lobby[0].char = menuOpt.char; NET.lobby[0].name = onName(); netLobbyChanged(); } }, 0); });
menu();
window.__game = { get w() { return w; }, setYaw(v) { yaw = v; }, get scene() { return scene; }, get art(){return houseArtState;},quality:NDAVisualQuality,start, menuOpt, step, get ME() { return ME; }, NET, VOICE };
