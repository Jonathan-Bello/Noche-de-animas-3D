// ================= Reglas v1.1 (GDD §2.10–2.14 y §6.9) =================
// Kit del ánima, 22 ánimas, la casona como ente con su dado de 100, límite de luces,
// cacería roja, salir por el zaguán, Hora del ánima, fotos, dinero y tragamonedas.
// Este archivo va después de logic2.js y ajusta sus funciones sin reescribirlo todo.

const DIFF = { facil: { lights: 5, grace: 4, pay: 0.75 }, normal: { lights: 4, grace: 3, pay: 1 }, pesadilla: { lights: 3, grace: 2, pay: 1.5 } };
const CFG0 = { huntGap: CFG.huntGap, huntGrace: CFG.huntGrace };
const PAY = { ev: 20, obj: 25, live: 15 };
ITEMS.fotocam = { n: 'Cámara instantánea', elec: true, hint: 'Espacio: tomas una foto (rollo de 6). Pagan las del ánima, sus rastros y lo raro de la casona.' };

// ---------- Las 9 ánimas que faltaban del juego de cartas (evidencias de las cartas) ----------
GHOSTS.push(
  mk({ id: 'aparecido', n: 'Aparecido', ev: ['BC', 'OB', 'LU'],
    passive: { n: 'Cara de otro', d: 'Cada noche copia el comportamiento de otra ánima, nunca sus evidencias.' },
    sello: { n: 'Pasos de botas que se detienen en la puerta', parecido: 'Pasos' }, espanto: { n: 'Aparición final', d: 'Caza de inmediato.', use(w, g) { g.seenT = 99; } } }),
  mk({ id: 'bruja', n: 'Bruja', ev: ['OB', 'ES', 'AZ'],
    passive: { n: 'Contrahechizo', d: 'Si usan Rosario, Ruda o Copal cerca, se enfurece unos segundos (hace más y caza antes) y luego se debilita.' },
    sello: { n: 'Huele a hierbas quemadas', parecido: 'Olor a azufre' }, espanto: { n: 'Aquelarre', d: 'Todos pierden 10 de cordura.', use(w) { alive(w).forEach(i => w.haunt(i, 10)); } } }),
  mk({ id: 'yohual', n: 'Yohualtepuztli', ev: ['BC', 'OB', 'AZ'], hear: 16,
    passive: { n: 'Hacha nocturna', d: 'Si alguien le grita fuerte (micrófono) durante la cacería, la detiene. Oye las voces más lejos.' },
    sello: { n: 'Golpes secos, como de hacha', parecido: 'Portazo' }, espanto: { n: 'Hacha nocturna', d: 'Caza de inmediato.', use(w, g) { g.seenT = 99; } } }),
  mk({ id: 'cihuateteo', n: 'Cihuateteo', ev: ['BC', 'CE', 'LU'], hunt: { type: 'avg', thr: 55 },
    passive: { n: 'Bajan al atardecer', d: 'Muy activa al inicio de la noche y se calma después; solo ronda pasillos, galería y escaleras; a veces caza dos veces seguidas.' },
    sello: { n: 'Un llanto de recién nacido en el pasillo', parecido: 'Susurro' }, espanto: { n: 'Encrucijada', d: 'Caza dos veces.', use(w, g) { g.seenT = 99; } } }),
  mk({ id: 'xtabay', n: 'Xtabay', ev: ['CE', 'SU', 'ES'], freq: { v: 2 },
    passive: { n: 'Canto de la ceiba', d: 'Si te quedas quieto oyendo su lamento, te jala hacia ella.' },
    sello: { n: 'Huele a flores de xtabentún', parecido: 'Olor a azufre' }, espanto: { n: 'Canto de la ceiba', d: 'Todos pierden 8 de cordura.', use(w) { alive(w).forEach(i => w.haunt(i, 8)); } } }),
  mk({ id: 'cadejo', n: 'El Cadejo Negro', ev: ['CE', 'LU', 'AZ'], top: 3.8,
    passive: { n: 'Sigue el rastro', d: 'En la cacería sigue los pasos recientes de los investigadores: rápido de lejos y lento al alcanzarte.' },
    sello: { n: 'Arrastre de cadenas', parecido: 'Pasos de cacería' }, espanto: { n: 'Arrastre de cadenas', d: 'Caza de inmediato.', use(w, g) { g.seenT = 99; } } }),
  mk({ id: 'mulata', n: 'La Mulata de Córdoba', ev: ['SU', 'ES', 'AZ'],
    passive: { n: 'El barco en la pared', d: 'Tiene dos puntos fijos en la casa y salta entre ellos al instante.' },
    sello: { n: 'Huele a carbón', parecido: 'Olor a azufre' }, espanto: { n: 'El barco en la pared', d: 'Aparece junto a alguien.', use(w, g) { const v = pick(alive(w)); if (v) { g.f = v.f; g.x = v.x; g.y = v.y; snapWalkable(w, g); } } } }),
  mk({ id: 'uaychivo', n: 'El Uay Chivo', ev: ['BC', 'SU', 'AZ'], hunt: { type: 'target', thr: 50 },
    passive: { n: 'Mirada de cabra', d: 'Elige a una persona al inicio y va solo por ella toda la noche.' },
    sello: { n: 'Balido lejano', parecido: 'Susurro' }, espanto: { n: 'Mirada de cabra', d: 'Su elegido pierde 15.', use(w, g) { const v = w.invs[g.prey]; if (v) w.haunt(v, 15); } } }),
  mk({ id: 'charro', n: 'Charro Negro', ev: ['BC', 'CE', 'AZ'], top: 4.4,
    passive: { n: 'Jinete', d: 'En la cacería es muy rápido en línea recta y lento al dar vuelta.' },
    special: { n: 'Cabalgata', cd: 60, d: 'Cruza la planta muy rápido unos segundos.', use(w, g) { if (g.hunt) return false; g.galopeUntil = w.t + 3; return true; }, bot(w, g) { return Math.random() < 0.1; } },
    sello: { n: 'Herraduras sobre piedra', parecido: 'Pasos' }, espanto: { n: 'Trato con el diablo', d: 'Caza de inmediato.', use(w, g) { g.seenT = 99; } } }),
);
GHOSTS.forEach(G => (GT[G.id] = G));

// ---------- Perfil de cada ánima (GDD §6.9) ----------
// voz: h hombre, m mujer, z al azar · can: posesión, apagón, huellas, interferencia · lleva: cerca, medio, lejos
const PROF = {
  pena: { voz: 'z', can: ['int'], mud: 1, veto: 'pasillo' },
  nachito: { voz: 'h', can: [], mud: 2, veto: 'sombra' },
  llorona: { voz: 'm', can: ['hue'], mud: 1, veto: 'foto' },
  chaneque: { voz: 'h', can: [], lleva: 'lejos', mud: 2, veto: 'tv' },
  matla: { voz: 'm', can: ['pos'], lleva: 'medio', mud: 1, veto: 'foto' },
  cucuy: { voz: 'h', can: ['apa'], mud: 1, veto: 'doble' },
  guardian: { voz: 'h', can: ['hue', 'int'], mud: 0, veto: 'pasos' },
  nahual: { voz: 'h', can: ['hue'], mud: 2, veto: 'telefono' },
  demonio: { voz: 'h', can: ['pos', 'int'], mud: 1, veto: 'zaguan' },
  planchada: { voz: 'm', can: ['hue'], lleva: 'cerca', mud: 1, veto: 'cadaver' },
  chocarrero: { voz: 'h', can: ['apa'], lleva: 'cerca', mud: 2, veto: 'nada' },
  tlahuel: { voz: 'm', can: ['pos', 'apa'], mud: 1, veto: 'tecolote' },
  malaire: { voz: 'z', can: ['pos', 'int'], mud: 2, veto: 'sombra' },
  charro: { voz: 'h', can: ['apa'], mud: 1, veto: 'petalos' },
  aparecido: { voz: 'z', can: ['apa', 'int'], mud: 1, veto: 'doble' },
  bruja: { voz: 'm', can: ['int'], lleva: 'medio', mud: 1, veto: 'eco' },
  yohual: { voz: 'h', can: ['hue'], mud: 1, veto: 'serenata' },
  cihuateteo: { voz: 'm', can: ['apa'], mud: 1, veto: 'afuera' },
  xtabay: { voz: 'm', can: ['pos'], mud: 1, veto: 'senuelo' },
  cadejo: { voz: 'h', can: ['hue'], mud: 2, veto: 'anomalia' },
  mulata: { voz: 'm', can: ['int'], lleva: 'lejos', mud: 1, veto: 'pasillo' },
  uaychivo: { voz: 'h', can: ['pos'], mud: 1, veto: 'tvcam' },
};
const can = (g, k) => (PROF[g.def.id] || {}).can && PROF[g.def.id].can.includes(k);
// Ajustes de las que ya existían (lo que pidió el GDD §6.9)
Object.assign(GT.nachito, { darkFear: false, likesLight: true, passive: { n: 'Quiere luz', d: 'Busca cuartos con luz. A oscuras se enoja: come más y hace más. Nunca apaga focos.' }, sello: { n: 'Una risa de niño', parecido: 'Susurro' } });
Object.assign(GT.llorona, { chillMult: undefined, passive: { n: 'Si la oyes lejos, está cerca', d: 'Muy rara vez, en la cacería, su sonido se oye lejos estando a tu lado.' } });
Object.assign(GT.chaneque, { special: null, passive: { n: 'Son muchos', d: 'Se lleva objetos a otro piso. Cuando alguien tira algo, cae otro objeto lejos. Muy rara vez roba algo de tu equipo.' } });
Object.assign(GT.matla, { special: null, passive: { n: 'Caza al que anda solo', d: 'Con el grupo junto casi no hace nada; con alguien solo se activa. Ciega entre 2 y 6 m.' } });
Object.assign(GT.cucuy, { passive: { n: 'Debajo de la cama', d: 'Ve mejor a oscuras. Muy rara vez empieza la cacería desde un escondite.' } });
Object.assign(GT.guardian, { passive: { n: 'Celoso de su oro', d: 'Nunca sale de su cuarto; entre más gente hay cerca, más hace y antes caza.' } });
Object.assign(GT.nahual, { special: null, freq: Object.assign({}, GT.nahual.freq, { v: 1 }), passive: { n: 'Ruleta', d: 'Cada cacería es normal o de bestia: rápida y siguiendo tu olor.' }, sello: { n: 'Pisadas pesadas', parecido: 'Pasos de cacería' } });
Object.assign(GT.demonio, { rosaryBlind: 10, passive: { n: 'Lo sagrado lo hiere más', d: 'Caza más y se repone rápido, pero el Rosario y el Copal le duran el doble.' } });
Object.assign(GT.planchada, { passive: { n: 'Cuida a los enfermos', d: 'Respeta a quien tiene 25 o menos, salvo que todos estén así. A su lado se recupera cordura.' } });
Object.assign(GT.chocarrero, { special: Object.assign({}, GT.chocarrero.special, { cd: 90 }) });
Object.assign(GT.tlahuel, { passive: { n: 'Vuela', d: 'Va por el más débil y es más rápida contra quien tiene poca cordura. El tecolote nunca avisa su cacería.' } });
Object.assign(GT.malaire, { near: 5, far: 14, passive: { n: 'Se ve poco', d: 'Cazando casi no se nota dónde está.' } });
Object.assign(GT.pena, { passive: { n: 'Los rezos la calman', d: 'Cuando la frenan con el Rosario o el Copal, tarda el doble en volver a cazar.' } });
GHOSTS.forEach(G => { if (!G.passive) G.passive = { n: '—', d: '' }; });

// ---------- Mundo nuevo ----------
const _newWorld = newWorld;
newWorld = function (opt) {
  const w = _newWorld(opt), g = w.g, P = PROF[g.def.id] || {}, M = (opt && opt.mods) || {};
  const D = DIFF[w.opt.diff] || DIFF.normal;
  CFG.huntGrace = D.grace; CFG.huntGap = CFG0.huntGap * (M.noche === 'luna' ? 0.7 : 1);
  w.lightLimit = D.lights - (M.noche === 'vieja' ? 1 : 0); w.nightLen = w.opt.night + (M.noche === 'niebla' ? 60 : 0); w.opt.night = w.nightLen;
  w.mods = M; w.casRate = M.noche === 'calma' ? 0.6 : 1; w.hearMult = M.noche === 'tormenta' ? 0.7 : 1;
  g.mudanzas = P.mud === undefined ? 1 : P.mud; g.voice = P.voz === 'z' ? pick(['h', 'm']) : P.voz || 'h';
  w.cas = { next: 50, used: [], knock: null }; w.photos = []; w.exitAsk = {};
  w.obj = shuffle(['guarida', 'escondido', 'foto', 'SU', 'BC', 'CE']).slice(0, 3).map(k => ({ k, done: false }));
  w.items.forEach(it => { if (it.kind === 'rosario') it.uses = 2; });
  w.invs.forEach(i => { i.slots = [null, null, null]; i.hand = 0; }); // 3 lugares; la linterna viene incluida
  // cámaras instantáneas en el maletín (rollo de 6)
  const nCam = 2 + (M.casa === 'camara' ? 1 : 0); for (let k = 0; k < nCam; k++) w.items.push(Object.assign(newItem('fotocam', { f: 0, x: 20.3 + k * 0.95, y: 33.05 }), { h: 0.78, film: 6 + (M.trato === 'rollo' ? 6 : 0) }));
  const addItem = (kind, n) => { const places = ITEM_PLACES[kind] || ITEM_PLACES.vela; for (let k = 0; k < n; k++) { const [f, rid] = places[k % places.length]; const p = onFurniture(f, RID[f][rid]); w.items.push(Object.assign(newItem(kind, p), { h: p.h, uses: kind === 'rosario' ? 2 : undefined })); } };
  if (M.casa === 'velas') addItem('vela', 3); if (M.casa === 'te') addItem('te', 3);
  if (M.casa === 'focos') w.items = w.items.filter(it => it.kind !== 'foco');
  if (M.casa === 'radio' && !w.items.some(it => it.kind === 'radio')) { const [f, rid] = CURSED_PLACES.radio; const p = onFurniture(f, RID[f][rid]); w.items.push(Object.assign(newItem('radio', p), { h: p.h })); }
  if (M.trato === 'copal') { const it = Object.assign(newItem('copal', w.invs[0]), {}); w.items.push(it); const k = w.invs[0].slots.findIndex(s => !s); if (k >= 0) { w.invs[0].slots[k] = it; it.holder = w.invs[0]; } }
  if (M.trato === 'cordura') w.invs.forEach(i => (i.san = 90));
  if (M.trato === 'hambre') g.pres = g.def.presMax * 0.5;
  if (M.trato === 'sinluz') w.fuse[1] = false;
  // perfiles especiales
  if (g.def.id === 'aparecido') { const pool = GHOSTS.filter(G => !['aparecido', 'malaire'].includes(G.id)); const src = pick(pool); g.mimic = src.id;
    for (const k of ['speed', 'huntStart', 'accel', 'top', 'near', 'far', 'farMin', 'hear', 'hunt', 'huntCd', 'noKillBelow', 'fly', 'speedNow', 'vision']) GT.aparecido[k] = src[k]; GT.aparecido.freq = Object.assign({}, src.freq); }
  if (g.def.id === 'uaychivo') { const hs = w.invs.filter(i => !i.bot); g.prey = (hs.length ? pick(hs) : pick(w.invs)).id; }
  if (g.def.id === 'mulata') { const rs = shuffle(HOME_CHOICES.slice()); g.portals = [rs[0], rs[1]].map(r => ROOM_CENTER[r.f][r.r]).map(c => ({ f: c.f !== undefined ? c.f : 0, x: c.x, y: c.y })); g.portals.forEach((p, k) => { const r = [rs[0], rs[1]][k]; p.f = r.f; }); }
  if (g.def.id === 'bruja') { const r = pick(HOME_CHOICES); g.hex = r; }
  return w;
};

// ---------- Habilidades limitadas ----------
const _gPossess = gPossess, _gApagon = gApagon, _gInterf = gInterf, _gAnomaly = gAnomaly;
gPossess = (w, g) => can(g, 'pos') && _gPossess(w, g);
gApagon = (w, g) => can(g, 'apa') && _gApagon(w, g);
gInterf = (w, g) => can(g, 'int') && _gInterf(w, g);
gAnomaly = () => false;      // ahora es de la casona
gHallu = () => false;        // el doble también
function gHuellas(w, g) {    // huellas descalzas que avanzan hacia alguien que está solo
  if (!can(g, 'hue') || g.hunt || w.t < (g.ready.hue || 0)) return false;
  const v = exposedInvs(w).find(i => i.f === g.f && isolated(w, i) && d2(i, g) < 14); if (!v) return false;
  g.ready.hue = w.t + 60; const n = 6; for (let k = 1; k <= n; k++) { const p = { f: v.f, x: g.x + (v.x - g.x) * k / (n + 1), y: g.y + (v.y - g.y) * k / (n + 1) }; w.ashes.push({ f: p.f, x: p.x, y: p.y, until: w.t + 90, stepped: true, prints: true, printsUntil: w.t + 90, t: w.t }); }
  w.haunt(v, 4); w.ev('huellas', { f: v.f, x: v.x, y: v.y, who: v.id }); return true;
}

// ---------- Llevarse: toma algo que nadie ve y lo deja cerca, a media distancia o lejos ----------
function watchedBy(w, p, R) { return alive(w).some(i => i.f === p.f && i.hidden < 0 && sees(i, p, R || 14,w)); }
function llevarse(w, g, forceKind) {
  const tier = forceKind || (PROF[g.def.id] || {}).lleva; if (!tier) return false;
  const loose = w.items.filter(it => !it.holder && it.f === g.f && d2(it, g) < 6 && !watchedBy(w, it));
  const it = pick(loose); if (!it) return false;
  let rr; if (tier === 'cerca') { const r = roomAt(it.f, it.x, it.y); rr = { f: it.f, r: r >= 0 ? r : roomOf(g) }; }
  else if (tier === 'medio') rr = pick(ROOM_LIST.filter(r => r.f === it.f && ROOM_CENTER[r.f][r.r]));
  else rr = pick(ROOM_LIST.filter(r => r.f !== it.f && ROOM_CENTER[r.f][r.r]));
  if (!rr || rr.r < 0) return false; const p = randomIn(rr.f, rr.r); it.f = p.f; it.x = p.x; it.y = p.y; it.h = 0;
  w.ev('llevado', { f: p.f, x: p.x, y: p.y, tier }); return true;
}
const _throwItem = throwItem;
throwItem = function (w, i, power) { const r = _throwItem(w, i, power); if (w.g.def.id === 'chaneque' && Math.random() < 0.35) { const o = pick(w.loose.filter(o => o.f === i.f && d2(o, i) > 8)); if (o) { o.from = { x: o.x, y: o.y, h: o.h }; o.h = 0; o.flyT = w.t; w.noise(o, 12, 'mover'); w.ev('mover', { f: o.f, x: o.x, y: o.y, id: o.id }); } } return r; };

// ---------- Contrahechizo de la Bruja, rezos del Ánima en pena ----------
function holyUsed(w, p) {
  const g = w.g; if (!p) return;
  if (g.def.id === 'bruja' && g.f === p.f && d2(g, p) < 10 && !g.hunt) { g.rageUntil = w.t + 20; g.weakUntil = w.t + 50; g.lastHuntEnd = -999; g.huntReady = 0; w.ev('rabia', { f: g.f, x: g.x, y: g.y }); }
  if (g.def.id === 'pena') g.huntReady = Math.max(g.huntReady || 0, w.t + CFG.huntGap * 2);
}
const _activateRosary = activateRosary;
activateRosary = function (w, by) { _activateRosary(w, by); holyUsed(w, by && by.f !== undefined ? by : w.g); if (w.g.def.id === 'pena') w.g.huntReady = w.t + CFG.huntGap * 2; };

// ---------- Fotos ----------
const _useItemRaw = useItemRaw;
useItemRaw = function (w, i) {
  const it = handItem(i);
  if (it && (it.kind === 'copal' || it.kind === 'ruda')) { const r = _useItemRaw(w, i); if (r) holyUsed(w, i); return r; }
  if (!it || it.kind !== 'fotocam') return _useItemRaw(w, i);
  if (w.t < (it.cd || 0)) return false; if ((it.film || 0) <= 0) { w.say('Se acabó el rollo de esta cámara.', 'i'); return false; }
  it.film--; it.cd = w.t + 1.2;
  const inView = (p, R) => p && p.f === i.f && d2(p, i) <= (R || 12) && angDiff(Math.atan2(p.y - i.y, p.x - i.x), i.face) < 0.45 && los(i.f, i.x, i.y, p.x, p.y);
  const g = w.g, shots = [];
  const ghostSeen = (g.hunt || w.t < g.revealUntil || g.manifestUntil > w.t) && !g.def.invisible && inView(g);
  if (ghostSeen) shots.push([g.hunt ? 'el ánima cazando' : 'el ánima', g.hunt ? 40 : 30, g]);
  const pos = w.possess && w.invs[w.possess.who]; if (pos && pos !== i && inView(pos)) shots.push(['un poseído sin sombra', 25, pos]);
  const pr = w.doors.find(d => d.f === i.f && (d.printsUntil || 0) > w.t && inView(d, 6)) || w.ashes.find(a => a.prints && (a.printsUntil || 0) > w.t && inView(a, 6)); if (pr && i.slots.some(s => s && s.kind === 'uv')) shots.push(['una huella', 10, pr]);
  const mv = w.loose.find(o => w.t - o.flyT < 2.5 && inView(o, 10)); if (mv) shots.push(['un objeto movido', 10, mv]);
  for (const k of ['decoy', 'hallu', 'corpse', 'kneel']) if (w[k] && w[k].until > w.t && inView(w[k], 20)) shots.push([{ decoy: 'una silueta en el pasillo', hallu: 'alguien que no estaba', corpse: 'un cuerpo en el piso', kneel: 'alguien rezando' }[k], 15, w[k]]);
  let best = shots.sort((a, b) => b[1] - a[1])[0], pay = 0, what = 'nada raro', stars = 0;
  if (best) { const dd = d2(best[2], i); stars = dd < 4 ? 3 : dd < 8 ? 2 : 1; pay = Math.round(best[1] * [0, 1, 1.5, 2][stars]); what = best[0]; }
  const cursed = Math.random() < 0.05; if (cursed) { pay += 15; what = (best ? what + ' y ' : '') + 'una sombra al fondo'; w.haunt(i, 5); }
  if (ghostSeen) { const o = w.obj.find(o => o.k === 'foto'); if (o) o.done = true; }
  w.photos.push({ by: i.id, what, pay, stars, cursed, t: w.t });
  w.ev('photo', { who: i.id, f: i.f, x: i.x, y: i.y, what, pay, stars, cursed });
  w.say(pay ? `Foto: ${what}${stars ? ' ' + '★'.repeat(stars) : ''} · $${pay}.` : 'Foto: nada raro.', 'i'); return true;
};

// ---------- Luces: la instalación aguanta pocas a la vez ----------
const litCount = w => w.lights.reduce((s, l, f) => s + Array.from(l).filter((v, r) => v && !isHall(f, r) && !(f === 0 && ['zaguan', 'patio', 'afuera'].includes(ROOMS[0][r].id))).length, 0);
const _toggleLight = toggleLight;
toggleLight = function (w, i) {
  const r = _toggleLight(w, i);
  if (r && litCount(w) > w.lightLimit) { w.fuse = [false, false]; w.lights.forEach(l => l.fill(0)); w.say('¡Se botaron los fusibles! Demasiados focos prendidos: hay que subirlos en la caja.', 'a'); w.ev('fuseBlow', FUSE); }
  return r;
};

// ---------- Cacería: ruleta del Nahual, Cucuy desde un escondite, Llorona invertida… ----------
const _startHunt = startHunt;
startHunt = function (w, g) {
  if (g.def.id === 'cucuy' && Math.random() < 0.2) { const t = exposedInvs(w).filter(i => i.f === g.f).sort((a, b) => d2(a, g) - d2(b, g))[0]; const s = t && SPOTS.filter(s => s.f === g.f).sort((a, b) => Math.hypot(a.hx - t.x, a.hy - t.y) - Math.hypot(b.hx - t.x, b.hy - t.y))[0]; if (s && Math.hypot(s.hx - t.x, s.hy - t.y) < 6) { g.x = s.hx; g.y = s.hy; const hid = w.invs.find(i => i.alive && i.hidden >= 0 && SPOTS[i.hidden] === s); if (hid) { hid.hidden = -1; } } }
  const ok = _startHunt(w, g); if (!ok) return ok;
  if (g.def.id === 'nahual' || (g.def.id === 'aparecido' && g.mimic === 'nahual')) g.hunt.beast = Math.random() < 0.5;
  if (g.def.id === 'llorona') g.hunt.inv = Math.random() < 0.2;
  g.lineT = 0; return ok;
};
const _endHunt = endHunt;
endHunt = function (w, g) {
  const was = g.hunt; const hiddenAlive = w.invs.filter(i => i.alive && i.hidden >= 0); _endHunt(w, g);
  if (was && !was.huida) { if (hiddenAlive.length) { const o = w.obj.find(o => o.k === 'escondido'); if (o) o.done = true; }
    if (g.def.id === 'cihuateteo' && !was.second && Math.random() < 0.3) g.secondHunt = w.t + 8; }
};
const _huntRuleOK = huntRuleOK;
huntRuleOK = function (w, g) { if (g.def.hunt.type === 'target') { const v = w.invs[g.prey]; if (!v || !v.alive || v.escaped) { const a = alive(w); if (!a.length) return false; g.prey = pick(a).id; return false; } return v.san <= g.def.hunt.thr; } return _huntRuleOK(w, g); };
const _ghostSpeed = ghostSpeed;
ghostSpeed = function (w, g) {
  let s = _ghostSpeed(w, g); const id = g.def.id === 'aparecido' ? g.mimic : g.def.id;
  if (w.t < (g.rageUntil || 0)) s *= 1.25; else if (w.t < (g.weakUntil || 0)) s *= 0.8;
  if (g.hunt && !g.hunt.huida) {
    if (g.hunt.beast) s = Math.max(s, 3.6) * 1.1;
    if (id === 'tlahuel') { const t = alive(w).filter(i => i.f === g.f).sort((a, b) => d2(a, g) - d2(b, g))[0]; if (t && t.san < 30) s *= 1.15; }
    if (id === 'cadejo') { const t = alive(w).filter(i => i.f === g.f).sort((a, b) => d2(a, g) - d2(b, g))[0]; if (t) { const d = d2(t, g); s = d > 8 ? 3.8 : d < 3 ? 1.7 : s; } }
    if (id === 'charro') s = Math.min(g.def.top, 2.2 + (g.lineT || 0) * 0.9);
  }
  if (g.galopeUntil > w.t) s *= 2;
  if (w.phase === 'hora') s *= 1.15;
  return s;
};
const _perceives = perceives;
perceives = function (w, g, i) {
  if (g.def.id === 'uaychivo' && g.hunt && g.prey !== undefined) return i.id === g.prey && i.alive && i.f === g.f && (i.hidden < 0 || _perceives(w, g, i));
  if (g.hunt && i.alive && !i.escaped && i.f === g.f && i.hidden < 0 && w.t >= g.blindUntil) {
    if (g.hunt.beast && d2(i, g) < 30) return true;                 // Nahual bestia: huele
    if (g.def.id === 'cadejo' && w.t - (i.lastRun || -99) < 6) return true; // Cadejo: sigue tus pasos
    if (g.def.id === 'bruja' && g.hex && i.f === g.hex.f && roomOf(i) === g.hex.r) return true;
  }
  if (g.def.id === 'yohual' && !g.hunt && i.talking && i.f === g.f && d2(i, g) < 16) return true;
  return _perceives(w, g, i);
};

// ---------- Salir por el zaguán ----------
const _interact = interact;
interact = function (w, i) {
  if (i.hidden < 0 && !i.bot && i.f === 0 && w.cas.knock && w.t < w.cas.knock.until && d2(i, ZAG) < 1.8) { visitor(w, i); return 'visita'; }
  if (i.hidden < 0 && i.f === EXIT.f && d2(i, EXIT) < 1.8 && !i.bot) {
    if (w.exitAsk[i.id] && w.t - w.exitAsk[i.id] < 4) { leaveHouse(w, i); return 'salir'; }
    w.exitAsk[i.id] = w.t; w.say(`¿Subirte a la camioneta y terminar tu noche? ${i.guess ? 'Tu apuesta: ' + GT[i.guess].n + '. ' : 'Aún no marcas tu apuesta en la libreta. '}Pulsa E otra vez.`, 'i'); return 'preguntar';
  }
  return _interact(w, i);
};
function leaveHouse(w, i) {
  if (i.escaped) return; i.escaped = true; i.out = true; i.hidden = -1; i.slots.forEach((s, k) => { if (s) dropItem(w, i, k); });
  w.say(`${i.name} se subió a la camioneta${i.guess ? '' : ' sin apostar'}.`, 'a'); w.ev('escape', { who: i.id });
}
function visitor(w, i) {
  const k = w.cas.knock; w.cas.knock = null; w.ev('visita', { who: i.id });
  if (Math.random() < 0.5) { w.say('Abres el zaguán… no hay nadie. Solo el viento.', 'i'); w.haunt(i, 4); return; }
  const truth = Math.random() < 0.5, other = pick(GHOSTS.filter(G => G !== w.g.def)), who = pick(['La vecina', 'Un señor con sombrero', 'Una niña con una vela', 'El sereno']);
  const said = truth ? `«Dicen que no es ${other.n}»` : `«Dicen que no es ${w.g.def.n}»`;
  w.say(`${who}: ${said}. Se da la vuelta y se pierde en la calle. (Puede ser verdad o mentira.)`, 'i');
}

// ---------- La casona: el otro ente (GDD §2.11) ----------
const CAS = [ // [desde, hasta, suceso]
  [1, 40, 'nada'], [41, 52, 'ambiente'], [53, 56, 'anomalia'], [57, 59, 'senuelo'], [60, 62, 'doble'], [63, 65, 'eco'], [66, 71, 'pasos'],
  [72, 74, 'sombra'], [75, 76, 'sombralag'], [77, 79, 'puerta'], [80, 81, 'serenata'], [82, 84, 'zaguan'], [85, 86, 'foto'], [87, 88, 'cadaver'],
  [89, 90, 'telefono'], [91, 91, 'tv'], [92, 92, 'tvcam'], [93, 93, 'barras'], [94, 94, 'radio'], [95, 95, 'reconectando'], [96, 96, 'clima'],
  [97, 97, 'rezando'], [98, 98, 'ofrenda'], [99, 99, 'pasillo'], [100, 100, 'elige']];
const CAS_ONCE = new Set(['rezando', 'ofrenda', 'pasillo', 'elige']);
const AMBIENTES = ['vela', 'cempasuchil', 'campanas', 'perro', 'mecedora', 'estatica', 'afuera', 'petalos'];
function casRoll(w) {
  const g = w.g, veto = (PROF[g.def.id] || {}).veto; const a = alive(w).filter(i => !i.bot || true); if (!a.length) return;
  let r = 1 + Math.floor(Math.random() * 100) + (a.reduce((s, i) => s + i.san, 0) / a.length < 50 ? 10 : 0); r = Math.min(100, r);
  if (veto === 'nada' && r <= 10) r = 41 + Math.floor(Math.random() * 12);
  let k = CAS.find(([lo, hi]) => r >= lo && r <= hi)[2];
  if (k === 'elige') k = pick(['rezando', 'ofrenda', 'pasillo', 'tvcam', 'cadaver'].filter(x => !w.cas.used.includes(x)).concat(['ambiente']));
  if (CAS_ONCE.has(k) && w.cas.used.includes(k)) k = 'ambiente';
  if (k === veto || (k === 'ambiente' && veto === 'afuera' && false)) return; // la casona le teme: no pasa nada
  w.cas.used.push(k);
  const inside = a.filter(i => !(i.f === 0 && i.y >= 39)); if (!inside.length) return; // afuera no pasa nada raro
  const humans = inside.filter(i => !i.bot); const v = pick(humans.length ? humans : inside); if (!v) return;
  casDo(w, k, v);
}
function casPoint(w, v, dmin, dmax, needView) {
  for (let k = 0; k < 30; k++) { const ang = (needView ? v.face : Math.random() * 6.28) + (Math.random() - 0.5) * (needView ? 1.0 : 6.28), d = dmin + Math.random() * (dmax - dmin), p = { f: v.f, x: v.x + Math.cos(ang) * d, y: v.y + Math.sin(ang) * d };
    if (walkableT(tileAt(p.f, p.x, p.y)) && !(p.f === 0 && p.y >= 38.5) && (!needView || los(p.f, v.x, v.y, p.x, p.y))) return p; }
  return null;
}
function casDo(w, k, v) {
  const E = (data) => w.ev('cas', Object.assign({ k, who: v.id, f: v.f, x: v.x, y: v.y }, data || {}));
  switch (k) {
    case 'ambiente': { const a = pick(AMBIENTES); const r = roomOf(v); const tgt = a === 'petalos' ? (Math.random() < 0.5 ? ROOM_CENTER[w.g.home.f][w.g.home.r] : (w.items.find(it => !it.holder && ['rosario', 'copal', 'te'].includes(it.kind)) || ROOM_CENTER[w.g.home.f][w.g.home.r])) : null;
      if (a === 'vela') { const vv = w.items.find(it => it.kind === 'vela' && it.lit && !it.holder); if (vv) vv.lit = false; }
      E({ a, tgt: tgt ? { f: tgt.f, x: tgt.x, y: tgt.y } : null, room: r >= 0 ? ROOMS[v.f][r].n : '' });
      if (a === 'petalos' && tgt) w.sub(v, 'Un caminito de pétalos de cempasúchil sale de aquí', 6); break; }
    case 'anomalia': { const r = roomOf(v); if (r < 0) break; const p = randomIn(v.f, r); _gAnomaly(w, { f: v.f, x: p.x, y: p.y, state: 'libre', hunt: null, pres: 99, ready: {}, bot: true, def: w.g.def }); break; }
    case 'senuelo': { const p = casPoint(w, v, 10, 18, true); if (!p) break; w.decoy = Object.assign(p, { until: w.t + 8, look: w.g.look, who: v.id }); E({ x: p.x, y: p.y }); break; }
    case 'doble': makeHallu(w, v); break;
    case 'eco': E(); break;
    case 'pasos': E({ up: v.f === 0 }); break;
    case 'sombra': { const p = casPoint(w, v, 3, 6, true); if (p) E({ x: p.x, y: p.y }); break; }
    case 'sombralag': E(); break;
    case 'puerta': { const d = w.doors.filter(d => d.f === v.f && d2(d, v) < 8 && !d.closed && !d.tiles.some(([x, y]) => w.invs.some(i => i.f === d.f && (i.x | 0) === x && (i.y | 0) === y))).sort((a, b) => d2(a, v) - d2(b, v))[0]; if (d) { d.closed = true; d.anim = 0; w.ev('doorToggle', { f: d.f, x: d.x, y: d.y, closed: true }); E({ x: d.x, y: d.y }); } break; }
    case 'serenata': E({ f: 0, x: ZAG.x, y: ZAG.y + 4 }); break;
    case 'zaguan': w.cas.knock = { until: w.t + 25 }; E({ f: 0, x: ZAG.x, y: ZAG.y }); break;
    case 'foto': E(); w.actor = v; w.say('En un retrato de la familia… ahora apareces tú.', 'i'); w.actor = null; break;
    case 'cadaver': { const p = casPoint(w, v, 5, 10, true); if (!p) break; w.corpse = Object.assign(p, { until: w.t + 20, char: v.char, who: v.id }); E({ x: p.x, y: p.y }); break; }
    case 'telefono': { const ph = w.phone || (w.phone = ROOM_CENTER[0][RID[0].sala] || EXIT); E({ f: ph.f !== undefined ? ph.f : 0, x: ph.x, y: ph.y, near: v.f === 0 && d2(v, ph) < 10, distort: Math.random() < 0.1, leyenda: w.g.def.id === 'llorona' && Math.random() < 1 / 64 }); break; }
    case 'tv': case 'tvcam': case 'barras': { const tv = w.tv || (w.tv = ROOM_CENTER[0][RID[0].sala] || EXIT); E({ f: 0, x: tv.x, y: tv.y, names: alive(w).map(i => i.name) }); break; }
    case 'radio': E({ names: w.invs.map(i => i.name) }); break;
    case 'reconectando': case 'clima': E(); break;
    case 'rezando': { const rs = ROOM_LIST.filter(r => !w.lights[r.f][r.r] && !isHall(r.f, r.r) && ROOM_CENTER[r.f][r.r]); const rr = pick(rs); if (!rr) break; const p = randomIn(rr.f, rr.r); w.kneel = Object.assign(p, { until: w.t + 60, char: pick(NAMES)[2] }); E({ f: p.f, x: p.x, y: p.y }); break; }
    case 'ofrenda': w.say(`En la ofrenda del altar apareció una foto de ${v.name}.`, 'a'); E({ f: ALTAR_POS.f, x: ALTAR_POS.x, y: ALTAR_POS.y, name: v.name }); break;
    case 'pasillo': { const r = roomOf(v); if (r < 0 || !isHall(v.f, r) || !isolated(w, v)) break; const p = randomIn(v.f, r); if (d2(p, v) < 5) break; v.x = p.x; v.y = p.y; E(); break; }
  }
}
function casonaTick(w, dt) {
  if (w.phase !== 'night' || w.g.hunt || w.possess) return;
  // anomalías: notarla quita cordura
  for (const me of alive(w)) for (const a of w.anoms) if (a.f === me.f && !a.seen.has(me.id) && sees(me, a, 7,w)) { a.seen.add(me.id); w.haunt(me, 3); w.ev('anomSeen', { f: a.f, x: a.x, y: a.y, who: me.id }); }
  // el señuelo se esfuma si te acercas
  if (w.decoy && (w.t > w.decoy.until || alive(w).some(i => i.f === w.decoy.f && d2(i, w.decoy) < 6))) { const seen = alive(w).filter(i => i.f === w.decoy.f && sees(i, w.decoy, 20,w)); seen.forEach(i => w.haunt(i, 2)); w.decoy = null; }
  if (w.corpse && w.t > w.corpse.until) w.corpse = null; if (w.kneel && w.t > w.kneel.until) w.kneel = null;
  w.cas.next -= dt * w.casRate; if (w.cas.next <= 0) { w.cas.next = 60; casRoll(w); }
}

// ---------- Tic de reglas (cada paso) ----------
function rulesTick(w, dt) {
  const g = w.g, id = g.def.id === 'aparecido' ? g.mimic : g.def.id;
  casonaTick(w, dt);
  if (w.hearMult < 1 && g.heard.length && Math.random() < 0.3) g.heard.pop(); // tormenta: la lluvia tapa los pasos
  // el tecolote: cuando empieza la obligación de cazar, 1 de cada 6 veces canta (nunca miente)
  const urging = (g.urge || 0) > 0; if (urging && !g.urgeOn && w.phase === 'night') { if (g.def.id !== 'tlahuel' && Math.random() < 1 / 6) w.ev('tecolote', { f: g.f, x: g.x, y: g.y }); } g.urgeOn = urging;
  if (g.state !== 'libre' || w.phase !== 'night') return;
  const free = w.t >= g.ai.nextAct;
  // huellas, llevarse
  if (g.bot && free && Math.random() < dt * 0.05 && gHuellas(w, g)) g.ai.nextAct = w.t + actGap(w);
  if (!g.hunt && w.t > (g.llevaT || 40)) { g.llevaT = w.t + rnd(35, 55); llevarse(w, g); }
  if (id === 'chaneque' && !g.hunt && w.t > (g.roboT || 150)) { g.roboT = w.t + rnd(150, 240); if (Math.random() < 0.4) { const v = pick(exposedInvs(w).filter(i => i.slots.some((s, k) => s && k !== i.hand))); if (v) { const ks = v.slots.map((s, k) => s && k !== v.hand ? k : -1).filter(k => k >= 0); const k = pick(ks), it = v.slots[k]; v.slots[k] = null; it.holder = null; const rr = pick(ROOM_LIST.filter(r => ROOM_CENTER[r.f][r.r])); const p = randomIn(rr.f, rr.r); it.f = p.f; it.x = p.x; it.y = p.y; it.h = 0; } } }
  // Nachito quiere luz
  if (g.def.likesLight && !g.hunt) { const hr = g.home; if (!w.lights[hr.f][hr.r]) { const lit = HOME_CHOICES.filter(h => w.lights[h.f][h.r]).sort((a, b) => d2(ROOM_CENTER[a.f][a.r], g) - d2(ROOM_CENTER[b.f][b.r], g))[0];
      if (lit && w.t > (g.lightMoveT || 0)) { g.lightMoveT = w.t + 40; g.home = lit; g.occ = {}; g.ai.wander = ROOM_CENTER[lit.f][lit.r]; }
      else if (!lit) { g.pres -= CFG.hunger.drain * dt; g.ai.nextAct -= dt * 0.8; } } }
  // Guardián: no sale de su cuarto; más gente cerca, más poder
  if (id === 'guardian') { const n = alive(w).filter(i => i.f === g.home.f && roomOf(i) === g.home.r).length; if (n >= 2) g.ai.nextAct -= dt * (n - 1) * 0.6; if (!inHome(g) && !g.hunt) g.returning = true; }
  // Cihuateteo: fuerte al atardecer, calmada después; solo pasillos
  if (id === 'cihuateteo') { const ph = w.t / w.nightLen; g.ai.nextAct -= dt * (ph < 0.33 ? 0.6 : ph > 0.66 ? -0.4 : 0); if (g.ai.wander && !g.hunt && !isHall(g.ai.wander.f, roomAt(g.ai.wander.f, g.ai.wander.x, g.ai.wander.y))) { const h = pick(ROOM_LIST.filter(r => isHall(r.f, r.r) && ROOM_CENTER[r.f][r.r])); if (h) g.ai.wander = randomIn(h.f, h.r); } }
  if (g.secondHunt && w.t >= g.secondHunt && !g.hunt) { g.secondHunt = 0; g.lastHuntEnd = -999; g.huntReady = 0; const ok = _startHunt(w, g); if (ok) { g.hunt.second = true; g.hunt.until = w.t + 10; } }
  // Mulata: salta entre sus dos puntos
  if (id === 'mulata' && g.portals && w.t > (g.portalT || 0)) { const k = g.portals.findIndex(p => p.f === g.f && d2(p, g) < 1.5); if (k >= 0 && Math.random() < (g.hunt ? 0.25 : 0.5)) { const o = g.portals[1 - k]; g.f = o.f; g.x = o.x; g.y = o.y; snapWalkable(w, g); g.portalT = w.t + 20; } else if (!g.hunt && Math.random() < dt * 0.05) g.ai.wander = Object.assign({}, pick(g.portals)); }
  // Charro: suma tiempo en línea recta
  if (g.hunt) { const df = Math.abs(angDiff(g.face, g.lastFace || g.face)); g.lineT = df < 0.08 ? (g.lineT || 0) + dt : df > 0.5 ? 0 : Math.max(0, (g.lineT || 0) - dt); g.lastFace = g.face; }
  // Xtabay: si te quedas quieto oyéndola, te jala
  if (id === 'xtabay' && !g.hunt && w.t - (g.lastSusurro || -99) < 8) for (const i of exposedInvs(w)) { if (i.f !== g.f || d2(i, g) > 8) { i.stillT = 0; continue; } const mv = Math.hypot(i.vx || 0, i.vy || 0); i.stillT = mv < 0.2 ? (i.stillT || 0) + dt : 0; if (i.stillT > 2) { i.pullT = (i.pullT || 0) + dt; if (i.pullT > 1) { i.pullT = 0; const a = Math.atan2(g.y - i.y, g.x - i.x); tryMove(w, i, Math.cos(a) * 0.4, Math.sin(a) * 0.4); w.haunt(i, 1.5); } } }
  // Yohualtepuztli: un grito lo detiene
  if (id === 'yohual' && g.hunt && !g.hunt.huida && w.t > g.hunt.t0 + 2 && alive(w).some(i => i.f === g.f && d2(i, g) < 10 && i.loud)) { w.say('¡Alguien le gritó de frente y el hacha nocturna se detuvo!', 'a'); _endHunt(w, g); g.stunUntil = w.t + 3; }
  // Bruja: su cuarto embrujado
  // Uay Chivo: si muere su elegido, elige otro
  if (g.def.id === 'uaychivo') { const v = w.invs[g.prey]; if (!v || !v.alive || v.escaped) { const a = alive(w); if (a.length) g.prey = pick(a).id; } }
  // Llorona: susurros = llanto
  for (const i of alive(w)) if (Math.hypot(i.vx || 0, i.vy || 0) > CFG.walk + 0.3) i.lastRun = w.t;
}
const _gSusurro = gSusurro;
gSusurro = function (w, g) { const r = _gSusurro(w, g); if (r) { g.lastSusurro = w.t; w.ev('lamento', { f: g.f, x: g.x, y: g.y, voz: g.voice, llorona: g.def.id === 'llorona' }); } return r; };
const _askSpirit = askSpirit;
askSpirit = function (w, i, it) { const r = _askSpirit(w, i, it); if (w.g.def.id === 'llorona' && Math.random() < 1 / 64) w.ev('cas', { k: 'leyenda', who: i.id, f: i.f, x: i.x, y: i.y }); return r; };

// ---------- Bots: se van por el zaguán con su apuesta ----------
botTeam = function (w) {
  const K = botK(w), c = w.objDiscard ? candidates(w, true, K) : candidates(w, false, K), p = pruebas(w, K); const bots = alive(w).filter(i => i.bot); if (!bots.length || w.phase !== 'night') return;
  const humansIn = w.invs.some(i => !i.bot && i.alive && !i.escaped), left = w.nightLen - w.t;
  const ready = p >= 3 || (p >= 2 && c.length === 1) || (left < 75 && p >= 1) || left < 40;
  if (!ready) return;
  for (const b of bots) if (!b.leave) { b.guess = (c.length ? pick(c) : pick(GHOSTS)).id; if (!humansIn || left < 60) b.leave = true; }
  if (humansIn && !w.team.hinted) { w.say(`${bots[0].name}: «${c.length === 1 ? 'Tiene que ser ' + c[0].n : 'Puede ser ' + c.slice(0, 3).map(x => x.n).join(', ')}. Cuando quieran, nos subimos a la camioneta».`, 'a'); w.team.hinted = true; }
};

// ---------- Fin de la noche: Hora del ánima, amanecer y resultados ----------
function startHora(w) {
  const g = w.g; w.phase = 'hora'; w.hora = { until: w.t + 90 }; w.opt.night = 1e9;
  if (g.state !== 'libre') { g.state = 'libre'; } endPossess(w);
  g.hunt = { until: Infinity, t0: w.t - 10, huida: true, hora: true }; g.pres = g.def.presMax; snapWalkable(w, g); g.seenT = 0; g.slowMult = 1.15;
  w.hiddenTried = new Set(); w.say('¡Llegó el alba y siguen adentro! La salida se trabó: aguanten 90 segundos.', 'a'); w.ev('hora');
}
function horaTick(w, dt) {
  const g = w.g; g.pres = g.def.presMax;
  // esconderse ya no es seguro: la mitad de las veces te saca
  for (const i of w.invs) if (i.alive && i.hidden >= 0) { const s = SPOTS[i.hidden]; if (s.f === g.f && Math.hypot(s.hx - g.x, s.hy - g.y) < 1.2 && !w.hiddenTried.has(i.hidden)) { w.hiddenTried.add(i.hidden); if (Math.random() < 0.5) { i.hidden = -1; w.say(`¡El ánima sacó a ${i.name} del escondite!`, 'a'); } } }
  if (w.t >= w.hora.until) { w.phase = 'amanecer'; w.amanecer = { until: w.t + 45 }; g.hunt = null; g.state = 'descanso'; g.restUntil = Infinity; w.say('Sale el sol. La puerta de la casona se abre: ¡salgan!', 'a'); w.ev('amanece'); }
}
function finishNight(w) {
  const res = w.invs.map(i => { const out = !!i.out && i.alive, ok = i.guess === w.g.def.id; return { id: i.id, name: i.name, bot: i.bot, out, alive: i.alive, guess: i.guess || null, ok }; });
  const win = res.some(r => r.out && r.ok) ? 'inv' : 'ghost';
  const evid = w.g.def.ev.filter(k => w.obs[k]).length;
  w.obj.forEach(o => { if (['SU', 'BC', 'CE'].includes(o.k)) o.done = !!w.obs[o.k]; });
  const objDone = w.obj.filter(o => o.done).length, M = w.mods || {}, curse = ['cordura', 'hambre', 'sinluz'].includes(M.trato) ? 1.2 : 1, dm = (DIFF[w.opt.diff] || DIFF.normal).pay;
  const pay = {}; res.forEach(r => { const fotos = w.photos.filter(p => p.by === r.id).reduce((s, p) => s + p.pay, 0); let base = evid * PAY.ev + objDone * PAY.obj + (r.out ? PAY.live : 0) + fotos;
    const mult = r.guess ? (r.ok ? (evid >= 3 ? 2 : evid === 2 ? 1.5 : 1) : 0.5) : 0.5; pay[r.id] = Math.round(base * mult * dm * curse); r.pay = pay[r.id]; r.fotos = fotos; });
  const okOut = res.filter(r => r.out && r.ok).map(r => r.name);
  w.over = { win, res, pay, evid, objDone, cause: win === 'inv' ? `${okOut.join(', ')} salió con la apuesta correcta` : res.some(r => r.out) ? 'Nadie que salió acertó' : 'Nadie salió con vida' };
}
const _step = step;
step = function (w, dt, input) {
  if (w.over) return;
  if (w.phase === 'night' && w.t + dt >= w.nightLen && alive(w).length) startHora(w);
  // los bots que ya se van caminan al zaguán (el motor no los mueve este paso)
  for (const b of w.invs) if (b.bot && b.leave && b.alive && !b.escaped && w.phase !== 'hora') b.stunUntil = w.t + dt * 1.5;
  if (w.phase === 'hora' || w.phase === 'amanecer') w.opt.night = 1e9;
  _step(w, dt, input);
  if (w.over && /No quedó ningún investigador/.test(w.over.cause || '')) w.over = null;
  if (w.over) return;
  for (const b of w.invs) if (b.bot && b.leave && b.alive && !b.escaped && w.phase !== 'hora') { if (navTo(w, b, EXIT, CFG.walk, dt) || (b.f === EXIT.f && d2(b, EXIT) < 1.2)) leaveHouse(w, b); }
  if (w.phase === 'hora') horaTick(w, dt);
  if (w.phase === 'amanecer' && w.t > w.amanecer.until) alive(w).forEach(i => leaveHouse(w, i));
  rulesTick(w, dt);
  const inside = alive(w), humansIn = inside.filter(i => !i.bot);
  const anyHuman = w.invs.some(i => !i.bot);
  if (!inside.length || (anyHuman && !humansIn.length && !w.invs.some(i => !i.bot && i.alive && !i.escaped))) {
    if (anyHuman && inside.length) inside.forEach(b => { b.guess = b.guess || null; }); finishNight(w);
  }
};
