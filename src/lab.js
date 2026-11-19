// ================= Laboratorio: la casona como cuarto de pruebas =================
// Cada cuarto tiene puestos con un letrero. Te acercas y pulsas E: el suceso ocurre ahí mismo, a tu lado,
// para oírlo y verlo aislado. Sin cacerías solas, sin muertes y sin que la casa tire dados por su cuenta.
// Funciona en línea: lo que prueba uno lo ven y oyen los demás.
const LAB = [
  // [id, letrero, qué deberías ver/oír, grupo]
  ['ambiente', 'Ambiente', 'Un ruido suelto de la casa: campanas, perro, mecedora, estática, afuera, pétalos o vela.', 'casa'],
  ['pasos', 'Pasos o canicas arriba', 'Pasos en madera o canicas rodando, cerca de ti.', 'casa'],
  ['sombra', 'Sombra sin dueño', 'Una silueta negra a unos metros, frente a ti; se va en 2 s.', 'casa'],
  ['puerta', 'Puerta que se cierra', 'La puerta abierta más cercana se azota.', 'casa'],
  ['zaguan', 'Tocan el zaguán', 'El zaguán se cierra solo y tocan fuerte y desesperados. Ve y abre (E en el zaguán): nadie, un visitante con pista, una niña que señala o tu doble.', 'casa'],
  ['foto', 'Tu cara en un retrato', 'Mira hacia una pared: ahí aparece un retrato tuyo y se queda.', 'casa'],
  ['cadaver', 'Cadáver con tu ropa', 'Un cuerpo tirado con tu ropa. Se esfuma si lo miras de frente.', 'casa'],
  ['telefono', 'Teléfono', 'Suena el teléfono de este puesto; si estás cerca, alguien levanta y repite una frase tuya.', 'casa', 'telefono'],
  ['tv', 'Tele: noticiero', 'Barras de medianoche, un reportero, la foto de un desaparecido y unos ojos que te siguen. Solo estática. E junto a la tele: apagarla.', 'casa', 'tv'],
  ['tvcam', 'Tele: vigilancia', 'Una cámara invisible en una esquina te graba; luego cambia al cuarto de otro compañero y termina con los ojos.', 'casa', 'tv'],
  ['barras', 'Tele: barras 3:33', 'Barras de colores 45 s: «si oyes tu nombre, no contestes». E junto a la tele: apagarla.', 'casa', 'tv'],
  ['radio', 'Radio', 'Estática con frases de ustedes distorsionadas, gritos y respiraciones.', 'casa', 'radio'],
  ['reconectando', '«Reconectando…»', 'Un letrero de reconexión en tu pantalla y pasos.', 'casa'],
  ['clima', 'Relámpago', 'Un relámpago blanco y un trueno (ya no hay pantalla roja).', 'casa'],
  ['rezando', 'Alguien rezando', 'En el cuarto oscuro más cercano hay alguien de rodillas con veladora; se esfuma si te acercas.', 'casa'],
  ['ofrenda', 'Foto en la ofrenda', 'Ve al altar de muertos: hay una foto tuya en la ofrenda.', 'casa'],
  ['pasillo', 'Pasillo que se repite', 'Te mueve a otra parte del mismo pasillo (solo funciona en pasillos).', 'casa'],
  ['senuelo', 'Señuelo', 'La silueta del ánima al fondo; se esfuma si te acercas.', 'casa'],
  ['doble', 'Doble de un compañero', 'Ves a un compañero que no está ahí.', 'casa'],
  ['estatua', 'Doble quieto', 'Un compañero inmóvil. Háblale: contesta con su voz. Tócalo: grito o risa.', 'casa'],
  ['eco', 'Eco lejano', 'Una frase tuya (de las grabadas) suena a lo lejos.', 'casa'],
  ['ecoya', 'Eco inmediato', 'Repite al instante tu última frase, entrecortada como wifi.', 'casa'],
  ['anomalia', 'Anomalía', 'Algo fuera de lugar en el cuarto; se queda.', 'casa'],
  ['leyenda', 'Grito de La Llorona', '«¡Ay, mis hijos!» con coro (en la noche real es 1 entre 64).', 'casa'],
  ['g_chill', 'Ánima: escalofrío', 'Respiración en la nuca y vibración.', 'anima'],
  ['g_luz', 'Ánima: apaga la luz', 'Prende la luz de este cuarto antes: el ánima la apaga.', 'anima'],
  ['g_portazo', 'Ánima: portazo', 'Una puerta cercana se azota fuerte.', 'anima'],
  ['g_mover', 'Ánima: avienta un objeto', 'Un objeto suelto del cuarto cae al piso.', 'anima'],
  ['g_prop', 'Ánima: objeto de la casa', 'Mecedora, piano, campanita… el objeto del cuarto se mueve y suena.', 'anima'],
  ['g_susurro', 'Ánima: susurro', 'Un susurro que imita a un compañero.', 'anima'],
  ['g_apagon', 'Ánima: apagón', 'Se apagan todas las luces del piso y se botan los fusibles.', 'anima'],
  ['g_manifest', 'Ánima: manifestación', 'El ánima se deja ver un instante con su sonido.', 'anima'],
  ['g_huellas', 'Ánima: huellas descalzas', 'Huellas mojadas en el piso.', 'anima'],
  ['g_tecolote', 'Tecolote', 'El canto del tecolote (provisional: ave genérica).', 'anima'],
  ['g_caceria', 'Cacería de prueba (15 s)', 'Focos rojos, latido y pasos del ánima. Aquí no mueres.', 'anima'],
  ['e_emf', 'Evidencia: EMF 5', 'Toma el EMF de este puesto: marca 5 un rato.', 'evid', 'emf'],
  ['e_grab', 'Evidencia: grabadora', 'Toma la grabadora y pregunta (clic) a oscuras: contesta.', 'evid', 'grab'],
  ['e_termo', 'Evidencia: bajo cero', 'Toma el termómetro y quédate quieto junto al letrero 8 s.', 'evid', 'termo'],
  ['e_espejo', 'Evidencia: mano en el espejo', 'Mira el espejo de este puesto de cerca.', 'evid', 'espejo'],
  ['e_uv', 'Evidencia: ceniza con UV', 'Toma la UV y apunta a la puerta más cercana.', 'evid', 'uv'],
  ['e_gases', 'Evidencia: azufre', 'El sensor de gases de este puesto marca rojo.', 'evid', 'gases'],
  ['frases', 'Tus frases grabadas', 'Te dice cuántas frases tuyas tiene la casa y de qué tipo (pregunta, llamado, grito…).', 'voz'],
];
const LAB_BY = Object.fromEntries(LAB.map(l => [l[0], l]));
// puestos: dos por cuarto, recorriendo la casa en orden (el «pasillo que se repite» va en el corredor)
function labPlace() {
  const rooms = ROOM_LIST.filter(r => !isHall(r.f, r.r) && ROOM_TILES[r.f][r.r].length > 12).sort((a, b) => a.f - b.f || ROOM_CENTER[a.f][a.r].y - ROOM_CENTER[b.f][b.r].y || ROOM_CENTER[a.f][a.r].x - ROOM_CENTER[b.f][b.r].x);
  const out = []; let k = 0;
  const spot = (f, r, side) => { const c = ROOM_CENTER[f][r]; for (let d = 1.6; d < 4; d += 0.4) { const p = { f, x: c.x + side * d, y: c.y }; if (walkableT(tileAt(f, p.x, p.y)) && walkableT(tileAt(f, p.x, p.y + 0.6)) && roomAt(f, p.x, p.y) === r) return p; } return { f, x: c.x, y: c.y }; };
  for (const L of LAB) {
    if (L[0] === 'pasillo') { const c = ROOM_CENTER[0][RID[0].corredor]; out.push({ id: L[0], f: 0, x: c.x + 2, y: c.y }); continue; }
    const r = rooms[Math.floor(k / 2) % rooms.length], p = spot(r.f, r.r, k % 2 ? 1 : -1); k++; out.push(Object.assign({ id: L[0] }, p));
  }
  return out.map((s, i) => Object.assign(s, { n: i + 1, room: ROOMS[s.f][roomAt(s.f, s.x, s.y)] ? ROOMS[s.f][roomAt(s.f, s.x, s.y)].n : '' }));
}
const LAB_EV = ['BC', 'CE', 'SU', 'OB', 'LU', 'ES', 'AZ'];
const _newWorldLab = newWorld;
newWorld = function (opt) {
  const w = _newWorldLab(opt); if (!opt || !opt.lab) return w;
  w.lab = true; w.labStations = labPlace(); w.opt.night = 1e9; w.nightLen = 1e9; w.huntFreeAt = 0; w.cas.next = 1e9;
  w.g.def = Object.assign({}, w.g.def, { ev: LAB_EV.slice(), freq: Object.fromEntries(Object.entries(w.g.def.freq || {}).map(([k, v]) => [k, Math.max(1, v)])) }); // el ánima de pruebas deja todas las evidencias
  // cada puesto con aparato o herramienta la tiene a la mano
  w.devices = []; for (const s of w.labStations) { const L = LAB_BY[s.id]; if (!L[4]) continue;
    if (['tv', 'radio', 'telefono'].includes(L[4])) w.devices.push({ kind: L[4], f: s.f, x: s.x, y: s.y + 0.7, h: 0, r: roomAt(s.f, s.x, s.y) });
    else { const it = newItem(L[4], { f: s.f, x: s.x + 0.6, y: s.y + 0.4 }); it.h = 0; it.lab = s.id; if (L[4] === 'espejo') it.dir = 0; w.items.push(it); } }
  w.say('🧪 Laboratorio: cada cuarto tiene puestos con letrero. Acércate y pulsa E para probar el suceso ahí mismo. Aquí no hay cacerías solas ni muertes.', 'a');
  return w;
};
function labNear(w, i) { if (!w.lab) return null; let b = null, bd = 1.5; for (const s of w.labStations) if (s.f === i.f) { const d = d2(s, i); if (d < bd) { bd = d; b = s; } } return b; }
function labGhostAt(w, s, i) { const g = w.g; const a = Math.atan2(i.y - s.y, i.x - s.x) + Math.PI; let p = { f: s.f, x: s.x + Math.cos(a) * 2, y: s.y + Math.sin(a) * 2 }; if (!walkableT(tileAt(p.f, p.x, p.y))) p = { f: s.f, x: s.x, y: s.y };
  Object.assign(g, { f: p.f, x: p.x, y: p.y, state: 'libre', hunt: null, stunUntil: 0, pres: g.def.presMax }); g.ready = { q: 0, e: 0, f: 0, c: 0, v: 0, k: 0, j: 0, n: 0, r: 0, hue: 0 }; w.labHold = w.t + 6; return g; }
function labFire(w, i, s) {
  const L = LAB_BY[s.id], k = s.id, g = w.g; let ok = true;
  w.cas.retry = false; w.cas.retryWhy = '';
  if (k === 'leyenda') w.ev('cas', { k, who: i.id, f: i.f, x: i.x, y: i.y });
  else if (!k.startsWith('g_') && !k.startsWith('e_') && k !== 'frases') {
    if (k === 'ecoya') w.cas.lastTalk[i.id] = w.t; // en pruebas no hace falta haber hablado justo antes
    // si no cabe hacia donde miras, prueba otras direcciones; la anomalía se pone donde no estás mirando
    const face0 = i.face, hid0 = i.hidden; if (k === 'anomalia') i.hidden = 99;
    const tryOnce = () => { w.cas.retry = false; const n0 = w.events.length, h0 = w.hallu, an0 = w.anoms.length; casDo(w, k, i); return !w.cas.retry && (w.events.length > n0 || w.hallu !== h0 || w.anoms.length > an0 || k === 'pasillo'); };
    ok = tryOnce(); for (let a = 0; !ok && a < 8; a++) { i.face = a * Math.PI / 4; ok = tryOnce(); }
    i.face = face0; i.hidden = hid0; if (!ok && ['senuelo', 'sombra', 'doble'].includes(k)) w.cas.retryWhy = w.cas.retryWhy || 'no hay espacio a la vista; párate donde veas lejos';
  } else if (k === 'g_chill') { labGhostAt(w, s, i); Object.assign(g, { x: i.x + 0.8, y: i.y }); ok = gChill(w, g); }
  else if (k === 'g_luz') { labGhostAt(w, s, i); const r = roomOf(i); if (r >= 0 && !w.lights[i.f][r]) { w.lights[i.f][r] = 1; w.fuse[i.f] = true; } Object.assign(g, { x: i.x, y: i.y }); ok = gLightsOff(w, g); }
  else if (k === 'g_portazo') { labGhostAt(w, s, i); w.doors.forEach(d => { if (d.f === i.f && d2(d, i) < 9) d.closed = false; }); ok = gPortazo(w, g); }
  else if (k === 'g_mover') { labGhostAt(w, s, i); const o = w.loose.filter(o => o.f === i.f).sort((a, b) => d2(a, i) - d2(b, i))[0]; if (o) Object.assign(g, { x: o.x, y: o.y }); ok = gMover(w, g); }
  else if (k === 'g_prop') { labGhostAt(w, s, i); const p = PROPS.filter(p => p.f === i.f).sort((a, b) => d2(a, i) - d2(b, i))[0]; if (p) Object.assign(g, { x: p.x, y: p.y }); ok = gProp(w, g); if (p && d2(p, i) > 8) w.say(`El objeto de la casa más cercano está lejos (${roomName(p)}). Ve a oírlo ahí.`, 'i'); }
  else if (k === 'g_susurro') { labGhostAt(w, s, i); ok = gSusurro(w, g); }
  else if (k === 'g_apagon') { labGhostAt(w, s, i); ok = _gApagon(w, g); }
  else if (k === 'g_manifest') { labGhostAt(w, s, i); ok = gManifest(w, g); }
  else if (k === 'g_huellas') { labGhostAt(w, s, i); const a = Math.random() * 6.28; Object.assign(g, { x: i.x + Math.cos(a) * 5, y: i.y + Math.sin(a) * 5 }); if (!walkableT(tileAt(g.f, g.x, g.y))) Object.assign(g, { x: s.x, y: s.y + 2 });
    for (let n = 1; n <= 6; n++) { const p = { f: i.f, x: g.x + (i.x - g.x) * n / 7, y: g.y + (i.y - g.y) * n / 7 }; w.ashes.push({ f: p.f, x: p.x, y: p.y, until: w.t + 90, stepped: true, prints: true, printsUntil: w.t + 90, t: w.t }); }
    w.ev('huellas', { f: i.f, x: i.x, y: i.y, who: i.id }); }
  else if (k === 'g_tecolote') w.ev('tecolote', { f: s.f, x: s.x + 6, y: s.y });
  else if (k === 'g_caceria') { labGhostAt(w, s, i); const p = { f: s.f, x: s.x + 5, y: s.y }; if (walkableT(tileAt(p.f, p.x, p.y))) Object.assign(g, p); g.hunt = { until: w.t + 15, t0: w.t, lab: true }; g.seenT = 0; w.labHold = w.t + 16; w.ev('hunt', {}); w.say('🧪 Cacería de prueba: 15 s. Aquí no mueres.', 'a'); }
  else if (k === 'e_emf') { w.emfSrc.push({ f: s.f, x: s.x + 0.6, y: s.y + 0.4, lvl: 5, until: w.t + 25 }); }
  else if (k === 'e_grab') { labGhostAt(w, s, i); w.labVoiceUntil = w.t + 25; const r = roomOf(i); if (r >= 0) w.lights[i.f][r] = 0; }
  else if (k === 'e_termo') { const r = roomAt(s.f, s.x, s.y); w.rastro[s.f][r] = 100; w.cold[s.f][r] = { f: s.f, x: s.x, y: s.y }; w.labColdUntil = w.t + 60; w.labColdRoom = [s.f, r]; }
  else if (k === 'e_espejo') { const it = w.items.find(t => t.lab === 'e_espejo'); if (it) it.markUntil = Infinity; }
  else if (k === 'e_uv') { const d = w.doors.filter(d => d.f === s.f).sort((a, b) => d2(a, s) - d2(b, s))[0]; if (d) d.printsUntil = w.t + 60; }
  else if (k === 'e_gases') { const it = w.items.find(t => t.lab === 'e_gases'); if (it) it.redUntil = w.t + 30; }
  w.ev('lab', { id: k, who: i.id, ok, why: w.cas.retryWhy || '', f: s.f, x: s.x, y: s.y });
  if (w.bitacora) blog(w, 'casa', `🧪 ${i.name} probó «${L[1]}»: ${ok ? 'funcionó' : 'NO funcionó' + (w.cas.retryWhy ? ' (' + w.cas.retryWhy + ')' : '')}`, s);
  return ok;
}
// E junto a un letrero: probar
const _interactLab = interact;
interact = function (w, i) { const s = labNear(w, i); if (s && !(i.hidden >= 0)) { labFire(w, i, s); return 'lab'; } return _interactLab(w, i); };
// sin muertes, sin cacerías solas, sin tiradas de la casa; el ánima se aparta cuando no se usa
const _killLab = killInv; killInv = function (w, i) { if (w.lab) { w.say(`🧪 El ánima alcanzó a ${i.name} (en pruebas nadie muere).`, 'a'); i.san = 100; const g = w.g; if (g.hunt) g.hunt.until = w.t; return; } return _killLab(w, i); };
const _startHuntLab = startHunt; startHunt = function (w, g) { if (w.lab) return false; return _startHuntLab(w, g); };
const _askLab = askSpirit; askSpirit = function (w, i, it) { if (w.lab && w.t < (w.labVoiceUntil || 0)) { const g = w.g; Object.assign(g, { f: i.f, x: i.x + 1, y: i.y, state: 'libre' }); const R = Math.random; Math.random = () => 0.01; try { return _askLab(w, i, it); } finally { Math.random = R; } } return _askLab(w, i, it); };
const _stepLab = step;
step = function (w, dt, input) {
  _stepLab(w, dt, input); if (!w.lab) return;
  w.cas.next = 1e9; w.opt.night = 1e9; w.invs.forEach(i => { if (i.alive) i.san = Math.max(i.san, 60); });
  const g = w.g; if (g.hunt && !g.hunt.lab) g.hunt = null; if (g.hunt && g.hunt.lab && w.t > g.hunt.until) { g.hunt = null; w.ev('huntEnd'); }
  if (w.t > (w.labHold || 0)) Object.assign(g, { f: 1, x: 29.5, y: 19.5, stunUntil: w.t + 1 }); // fuera de vista, sobre el patio
  if (w.labColdUntil && w.t > w.labColdUntil) { const [f, r] = w.labColdRoom; w.rastro[f][r] = 0; w.labColdUntil = 0; }
};
