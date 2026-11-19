// ================= Reglas v1.2: la base, cámaras de video, espejo pasivo, EMF y grabadora al estilo Phasmophobia =================
// y una casona más lista: si nadie nota un suceso en 5 s vuelve a tirar, aparatos repartidos por la casa,
// sucesos que quitan cordura, el doble que no se mueve y el eco que repite lo que acabas de decir.

// ---------- Afuera: la base de los investigadores ----------
const OUT_R = RID[0].afuera;
Object.assign(EXIT, { f: 0, x: 27.3, y: 52.6 });          // la puerta de la camioneta: aquí se termina la noche
Object.assign(MALETIN, { f: 0, x: 16.5, y: 54.4 });       // mesa del equipo
const TV_TABLE = { f: 0, x: 16.5, y: 51.5 };              // mesa con las teles de las cámaras
const BASE_TVS = [0, 1, 2].map(k => ({ f: 0, x: 14.9 + k * 2, y: 51.45, k }));
ITEMS.cam = { n: 'Cámara de video', tool: 'OB', elec: true, hint: 'Déjala con G apuntando al cuarto (queda en su tripié). Su imagen se ve en la tele de la base: solo ahí se ve la silueta del ánima moviéndose.' };
ITEMS.espejo = Object.assign({}, ITEMS.espejo, { hint: 'Déjalo con G en un cuarto. Si el ánima tiene esta evidencia, tarde o temprano deja una mano marcada en el vaho.' });
ITEMS.emf = Object.assign({}, ITEMS.emf, { hint: 'Marca 2 a 4 donde el ánima tocó algo (puertas, objetos, luces) durante 20 s. El 5 solo lo dan las ánimas con esta evidencia.' });
ITEMS.grab = Object.assign({}, ITEMS.grab, { hint: 'Clic: haces una pregunta. Solo contesta a oscuras, con 1 o 2 personas en el cuarto y el ánima cerca.' });
CFG.emfP = 0; CFG.cam.p = 0; CFG.esp.p = 0;
const AGE = { nachito: 'niño', chaneque: 'niño', llorona: 'joven', matla: 'joven', xtabay: 'joven', planchada: 'adulta', mulata: 'adulta', cihuateteo: 'joven', bruja: 'vieja', tlahuel: 'vieja', pena: 'adulto', cucuy: 'viejo', guardian: 'viejo', nahual: 'adulto', demonio: 'viejo', chocarrero: 'adulto', malaire: 'viejo', charro: 'adulto', aparecido: 'adulto', yohual: 'viejo', cadejo: 'viejo', uaychivo: 'viejo' };
// cuánto asusta cada suceso de la casona a quien lo nota
const CAS_SAN = { ambiente: 1, pasos: 2, sombra: 3, sombralag: 2, puerta: 2, serenata: 2, zaguan: 2, foto: 3, cadaver: 4, telefono: 3, tv: 3, tvcam: 4, barras: 2, radio: 3, reconectando: 2, clima: 2, rezando: 4, ofrenda: 3, pasillo: 4, senuelo: 2, doble: 3, eco: 3, estatua: 2, ecoya: 3 };
CAS.splice(0, CAS.length, [1, 40, 'nada'], [41, 48, 'ambiente'], [49, 50, 'estatua'], [51, 52, 'ecoya'], [53, 56, 'anomalia'], [57, 59, 'senuelo'], [60, 62, 'doble'], [63, 65, 'eco'], [66, 71, 'pasos'],
  [72, 74, 'sombra'], [75, 76, 'sombralag'], [77, 79, 'puerta'], [80, 81, 'serenata'], [82, 84, 'zaguan'], [85, 86, 'foto'], [87, 88, 'cadaver'],
  [89, 90, 'telefono'], [91, 91, 'tv'], [92, 92, 'tvcam'], [93, 93, 'barras'], [94, 94, 'radio'], [95, 95, 'reconectando'], [96, 96, 'clima'],
  [97, 97, 'rezando'], [98, 98, 'ofrenda'], [99, 99, 'pasillo'], [100, 100, 'elige']);

const _newWorld4 = newWorld;
newWorld = function (opt) {
  const w = _newWorld4(opt);
  // el equipo está en la mesa de la base; las cámaras de video, frente a su tele
  const tools = w.items.filter(it => TOOLS.includes(it.kind) || it.kind === 'fotocam');
  let cams = tools.filter(it => it.kind === 'cam'); while (cams.length < 3) { const c = newItem('cam', MALETIN); w.items.push(c); cams.push(c); }
  cams.slice(0, 3).forEach((c, k) => Object.assign(c, { f: 0, x: BASE_TVS[k].x, y: 51.85, h: 0.78, tv: k, dir: -Math.PI / 2, onTable: true }));
  tools.filter(it => it.kind !== 'cam').forEach((it, k) => Object.assign(it, { f: 0, x: 14.4 + (k % 6) * 0.95, y: 55.2 + Math.floor(k / 6) * 0.35, h: 0.78 }));
  w.invs.forEach((i, k) => { i.f = 0; i.x = 20.5 + k * 1.1; i.y = 53; i.face = -Math.PI / 2; });
  w.lights[0][OUT_R] = 1;
  w.doors.push({ f: 0, o: 'H', tiles: [[22, 39], [23, 39]], x: 23, y: 39.5, angle: 0, touchedAt: -99, glowUntil: 0, rudaUntil: 0, rosario: false, anim: 0, ext: true });
  // aparatos repartidos al azar: puede que haya o no en cada cuarto
  const rooms = shuffle(ROOM_LIST.filter(r => !isHall(r.f, r.r) && SURFACES[r.f][r.r] && SURFACES[r.f][r.r].length));
  w.devices = []; const put = (kind, n) => { for (let k = 0; k < n && rooms.length; k++) { const r = rooms.pop(), p = onFurniture(r.f, r.r); w.devices.push({ kind, f: r.f, x: p.x, y: p.y, h: p.h, r: r.r }); } };
  put('tv', 1 + Math.floor(Math.random() * 3)); put('radio', 1 + Math.floor(Math.random() * 2)); put('telefono', 1 + Math.floor(Math.random() * 2));
  w.emfSrc = []; w.cas.pend = null; w.cas.lastTalk = {};
  return w;
};
CFG.anomaly.max = 40;

// ---------- EMF al estilo Phasmophobia: marca donde el ánima tocó algo ----------
const _ghostEvent = ghostEvent;
ghostEvent = function (w, g, type, extra) {
  _ghostEvent(w, g, type, extra);
  const lvl = { door: 2, whisper: 2, espejo: 2, portazo: 3, move: 3, switch: 3, chill: 4, manifest: 4, special: 4 }[type] || 3;
  w.emfSrc.push({ f: g.f, x: g.x, y: g.y, lvl: g.def.ev.includes('LU') && Math.random() < 0.25 ? 5 : lvl, until: w.t + 20 }); if (w.emfSrc.length > 30) w.emfSrc.shift();
};
const _toolTick = toolTick;
toolTick = function (w, dt) {
  _toolTick(w, dt);
  w.emfSrc = w.emfSrc.filter(s => s.until > w.t);
  for (const it of w.items) {
    const p = itemPos(w, it); if (!p) continue;
    if (it.kind === 'emf') { let lv = 1; for (const s of w.emfSrc) if (s.f === p.f && d2(s, p) <= 2.2) lv = Math.max(lv, s.lvl);
      const held = it.holder && it.holder.alive && it.holder.slots[it.holder.hand] === it ? it.holder : null;
      if (lv === 5 && it.emfLvl !== 5) w.ev('emf', Object.assign({ lvl: 5 }, p)); it.emfLvl = lv; it.emfUntil = w.t + 0.3;
      if (lv === 5) observe(w, 'LU', held || witnessOf(w, p, 6), 'EMF 5'); }
  }
};

// ---------- Grabadora al estilo de la caja de espíritus ----------
const QUESTIONS = [['¿Dónde estás?', 'donde'], ['¿Qué edad tienes?', 'edad'], ['¿Qué quieres?', 'quiere']];
askSpirit = function (w, i, it) {
  if (w.t < (it.cd || 0)) return false; it.cd = w.t + 5; const g = w.g, r = roomOf(i);
  it.q = ((it.q === undefined ? -1 : it.q) + 1) % QUESTIONS.length; const [qt, qk] = QUESTIONS[it.q];
  const dark = r >= 0 && !w.lights[i.f][r], few = alive(w).filter(o => o.f === i.f && roomOf(o) === r).length <= 2, near = g.state === 'libre' && g.f === i.f && d2(g, i) <= 6;
  w.noise(i, 6, 'pregunta'); w.ev('ask', { who: i.id, f: i.f, x: i.x, y: i.y, q: qt }); g.lastAsk = { f: i.f, x: i.x, y: i.y, t: w.t };
  let kind = 'nada', ans = '';
  if (dark && few && near && g.def.ev.includes('SU') && Math.random() < 0.33) { kind = 'voz'; const d = d2(g, i);
    ans = qk === 'donde' ? (d < 2.5 ? 'aquí' : d < 4.5 ? 'cerca' : 'lejos') : qk === 'edad' ? (AGE[g.def.id] || 'viejo') : (canHunt(w, g) || (g.urge || 0) > 0 ? pick(['muerte', 'matar', 'tú']) : pick(['mi casa', 'que te vayas', 'frío'])); }
  else if (near && Math.random() < 0.3 || (w.t < g.interfUntil && d2(g, i) <= CFG.interf.r)) kind = 'estatica';
  it.screen = { kind, until: w.t + 5, cond: { dark, few }, q: qt, ans };
  w.actor = i;
  if (kind === 'voz') { w.sub(i, `Grabadora: ${qt} … «${ans}»`, CFG.grab.hear); observe(w, 'SU', i, 'una voz en la grabadora'); }
  else if (kind === 'estatica') w.sub(i, `Grabadora: ${qt} … estática, sílabas sueltas`, CFG.grab.hear);
  else w.say(`Grabadora: ${qt} … nada.${!dark ? ' (Hay luz.)' : ''}${!few ? ' (Hay mucha gente.)' : ''}`, 'i');
  w.actor = null;
  if (g.def.id === 'llorona' && Math.random() < 1 / 64) w.ev('cas', { k: 'leyenda', who: i.id, f: i.f, x: i.x, y: i.y });
  return true;
};

// ---------- Cámaras de video en tripié ----------
const _dropItem = dropItem;
dropItem = function (w, i, k) { const it = i.slots[k]; const r = _dropItem(w, i, k); if (r && it && it.kind === 'cam') { it.dir = i.face; it.onTable = false; it.h = 0; w.actor = i; w.say('Dejaste la cámara en su tripié. Su imagen se ve en la tele de la base.', 'i'); w.actor = null; } return r; };
const _useItemRaw4 = useItemRaw;
useItemRaw = function (w, i) { const it = handItem(i); if (it && it.kind === 'cam') { w.actor = i; w.say('Déjala con G apuntando hacia donde quieres vigilar.', 'i'); w.actor = null; return true; } return _useItemRaw4(w, i); };
function camSees(w, it, p) {
  const c = itemPos(w, it); if (!c || it.holder || it.onTable || it.dir === undefined) return false;
  return p.f === c.f && d2(p, c) < 12 && angDiff(Math.atan2(p.y - c.y, p.x - c.x), it.dir) < 0.62 && los(c.f, c.x, c.y, p.x, p.y);
}
function camTick(w, dt) {
  const g = w.g, moving = Math.hypot(g.x - (g.camPx || g.x), g.y - (g.camPy || g.y)) > 0.05 * dt * 20; g.camPx = g.x; g.camPy = g.y;
  const vis = g.def.ev.includes('OB') && moving && g.state !== 'desvanecida' && g.state !== 'despertando';
  for (const it of w.items) if (it.kind === 'cam') { it.ghostOn = vis && camSees(w, it, g); if (it.ghostOn) it.lastGhost = w.t; }
  // ver la tele de la base cuenta como evidencia
  const watchers = alive(w).filter(i => i.f === 0 && d2(i, TV_TABLE) < 4.2 && angDiff(Math.atan2(TV_TABLE.y - 0.3 - i.y, TV_TABLE.x - i.x), i.face) < 1.2);
  for (const it of w.items) if (it.kind === 'cam' && it.tv !== undefined && w.t - (it.lastGhost || -99) < 1.5) for (const i of watchers) observe(w, 'OB', i, `una silueta que se mueve en la cámara ${it.tv + 1}`);
}
// ---------- Espejo: como un libro, el ánima tira un dado cerca de él (1 entre 20) ----------
function espejoTick(w, dt) {
  const g = w.g; if (g.state !== 'libre' || w.phase !== 'night') return;
  for (const it of w.items) if (it.kind === 'espejo' && !it.holder && w.t >= (it.markUntil || 0) && it.f === g.f && d2(it, g) < 4) {
    it.diceT = (it.diceT || 0) + dt; if (it.diceT < 10) continue; it.diceT = 0;
    if (g.def.ev.includes('ES') && Math.random() < 1 / 20) { it.markUntil = Infinity; w.ev('espejo', { f: it.f, x: it.x, y: it.y }); ghostEvent(w, g, 'espejo'); }
  }
}

// ---------- La casona, más lista ----------
function nearDevice(w, kind, v, R) { return (w.devices || []).filter(d => d.kind === kind && d.f === v.f && d2(d, v) <= (R || 22)).sort((a, b) => d2(a, v) - d2(b, v))[0]; }
const _casDo = casDo;
casDo = function (w, k, v) {
  let dv = null;
  if (['tv', 'tvcam', 'barras', 'telefono', 'radio'].includes(k)) { // necesita un aparato cerca de alguien
    dv = nearDevice(w, k === 'telefono' ? 'telefono' : k === 'radio' ? 'radio' : 'tv', v); if (!dv) { w.cas.retry = true; return; }
    w.tv = { f: dv.f, x: dv.x, y: dv.y }; w.phone = { f: dv.f, x: dv.x, y: dv.y };
  }
  if (k === 'estatua') { const mates = w.invs.filter(o => o !== v && !o.escaped); const as = pick(mates.length ? mates : [v]); const p = casPoint(w, v, 4, 9, true); if (!p) { w.cas.retry = true; return; }
    w.statue = { f: p.f, x: p.x, y: p.y, who: v.id, as: as.id, char: as.char, name: as.name, bot: !!as.bot, until: w.t + 40, face: Math.atan2(v.y - p.y, v.x - p.x) }; w.ev('cas', { k, who: v.id, f: p.f, x: p.x, y: p.y, as: as.id }); return; }
  if (k === 'ecoya') { const last = w.cas.lastTalk[v.id]; if (last === undefined || w.t - last > 4) { w.cas.retry = true; return; } w.ev('cas', { k, who: v.id, f: v.f, x: v.x, y: v.y }); return; }
  if (k === 'radio') { w.ev('cas', { k, who: v.id, f: dv.f, x: dv.x, y: dv.y, dev: w.devices.indexOf(dv), names: w.invs.map(i => i.name) }); return; }
  const n0 = w.events.length; _casDo(w, k, v);
  const ev = w.events.slice(n0).find(e => e.type === 'cas' && e.k === k);
  if (ev && dv) { ev.f = dv.f; ev.x = dv.x; ev.y = dv.y; ev.dev = w.devices.indexOf(dv); if (k === 'telefono') ev.near = v.f === dv.f && d2(v, dv) < 10; }
};
// ¿lo notó alguien? (visto o a distancia de oído)
function casNoticed(w, pd) {
  const k = pd.k, p = pd.p, a = alive(w);
  if (['sombralag', 'reconectando', 'clima', 'foto', 'pasillo', 'ofrenda', 'eco', 'ecoya'].includes(k)) return a.filter(i => i.id === pd.who);
  if (['senuelo', 'cadaver', 'rezando', 'sombra', 'doble', 'estatua'].includes(k)) { const o = k === 'senuelo' ? w.decoy : k === 'cadaver' ? w.corpse : k === 'rezando' ? w.kneel : k === 'doble' ? w.hallu : k === 'estatua' ? w.statue : p; if (!o) return []; return a.filter(i => i.f === o.f && sees(i, o, 20)); }
  const R = ['tv', 'tvcam', 'barras'].includes(k) ? 10 : 15; return a.filter(i => p && i.f === p.f && d2(i, p) <= R);
}
function casonaTick4(w, dt) {
  if (w.phase !== 'night') return;
  for (const i of alive(w)) if (i.talking) w.cas.lastTalk[i.id] = w.t;
  // el doble quieto: si lo tocas, grita; si le hablas, contesta con algo que dijo tu amigo
  const st = w.statue; if (st) { const v = w.invs[st.who]; if (w.t > st.until || !v || !v.alive) w.statue = null;
    else if (v.f === st.f && d2(v, st) < 1.1) { w.ev('cas', { k: 'estatuaGrito', who: v.id, f: st.f, x: st.x, y: st.y }); w.haunt(v, 6); w.statue = null; }
    else if (v.f === st.f && d2(v, st) < 5 && v.talking && w.t > (st.replyT || 0)) { st.replyT = w.t + 6; w.ev('cas', { k: 'estatuaHabla', who: v.id, as: st.as, f: st.f, x: st.x, y: st.y, name: st.name }); } }
  // si nadie notó el suceso en 5 s, la casona vuelve a tirar
  const pd = w.cas.pend; if (pd && w.t >= pd.t + 0.3) { const seen = casNoticed(w, pd);
    if (seen.length) { seen.forEach(i => w.haunt(i, CAS_SAN[pd.k] || 1)); w.cas.pend = null; }
    else if (w.t > pd.t + 5) { w.cas.pend = null; if (pd.tries < 2) { w.cas.next = 0; w.cas.reroll = pd.tries + 1; } } }
}
const _casRoll = casRoll;
casRoll = function (w) {
  const n0 = w.events.length, used0 = w.cas.used.length, h0 = w.hallu, tries = w.cas.reroll || 0; w.cas.reroll = 0; w.cas.retry = false;
  _casRoll(w);
  const k = w.cas.used.length > used0 ? w.cas.used[w.cas.used.length - 1] : null; if (!k || k === 'nada' || k === 'anomalia') return;
  if (w.cas.retry && tries < 2) { w.cas.next = 0; w.cas.reroll = tries + 1; return; }
  const ev = w.events.slice(n0).find(e => e.type === 'cas'); const who = ev ? ev.who : w.hallu && w.hallu !== h0 ? w.hallu.who : null; if (who === null || who === undefined) return;
  w.cas.pend = { k, t: w.t, who, p: ev ? { f: ev.f, x: ev.x, y: ev.y } : null, tries };
};
const _rulesTick = rulesTick;
rulesTick = function (w, dt) { _rulesTick(w, dt); const g = w.g; if (g.f === 0 && g.y >= 38.9) { const c = ROOM_CENTER[g.home.f][g.home.r] || ROOM_CENTER[0][RID[0].sala]; g.f = c.f; g.x = c.x; g.y = c.y; } casonaTick4(w, dt); camTick(w, dt); espejoTick(w, dt); botMonitor(w, dt); };
// bots: a veces van a ver las teles de la base
function botMonitor(w, dt) {
  if (w.phase !== 'night') return; const placed = w.items.some(it => it.kind === 'cam' && !it.holder && !it.onTable); if (!placed) return;
  for (const b of alive(w)) if (b.bot && !b.leave) { if (!b.monitor && Math.random() < dt / 120) b.monitor = { until: w.t + 40 }; if (b.monitor) { if (w.t > b.monitor.until) b.monitor = null; else { b.stunUntil = w.t + dt * 1.5; if (navTo(w, b, { f: 0, x: TV_TABLE.x, y: TV_TABLE.y + 1.2 }, CFG.walk, dt)) b.face = -Math.PI / 2; } } }
}
// bots: dejan una cámara apuntando a la guarida cuando la conocen
const _stepB = step;
step = function (w, dt, input) {
  _stepB(w, dt, input);
  for (const i of w.invs) if (i.alive && !i.escaped) stairFlip(w, i); stairFlip(w, w.g);
  const xd = w.doors.find(d => d.ext); if (xd && xd.locked && w.phase !== 'hora') { xd.locked = false; xd.closed = false; xd.anim = 1; }
  const home = w.team && w.team.home; if (!home) return;
  for (const b of alive(w)) if (b.bot) { const k = b.slots.findIndex(s => s && (s.kind === 'cam' || s.kind === 'espejo')); if (k >= 0 && b.f === home.f && roomOf(b) === home.r) { const c = ROOM_CENTER[home.f][home.r]; if (c) b.face = Math.atan2(c.y - b.y, c.x - b.x); dropItem(w, b, k); } }
};
// la puerta de la casona se traba en la Hora del ánima; afuera el ánima no puede salir
const _startHora = startHora;
startHora = function (w) { _startHora(w); const d = w.doors.find(d => d.ext); if (d) { d.closed = true; d.locked = true; } w.say('¡Llegó el alba! La puerta de la casona se trabó: los de adentro aguanten 90 segundos.', 'a'); };
const _interact4 = interact;
interact = function (w, i) {
  const d = w.doors.find(d => d.ext); if (d && d.locked && w.phase === 'hora' && i.f === 0 && d2(i, d) < 1.6) { w.actor = i; w.say('La puerta de la casona no abre. Aguanta hasta que salga el sol.', 'i'); w.actor = null; return 'trabada'; }
  return _interact4(w, i);
};
// la maldición no te sigue afuera
const _cursedHunt = cursedHunt;
cursedHunt = function (w, target, why) { if (target && target.f === 0 && target.y >= 39) target = null; return _cursedHunt(w, target, why); };

// ---------- Bitácora del líder: qué hace la casa y el ánima (solo la ve quien crea la sala) ----------
const CAS_TXT = { nada: 'tiró… nada', ambiente: 'ruido de ambiente', anomalia: 'dejó una anomalía', senuelo: 'señuelo: la silueta del ánima al fondo', doble: 'un doble de un compañero', eco: 'eco: una frase lejana', pasos: 'pasos o canicas arriba',
  sombra: 'una sombra sin dueño', sombralag: 'la sombra que se retrasa', puerta: 'cerró una puerta', serenata: 'serenata afuera que se corta', zaguan: 'tocan el zaguán', foto: 'tu cara en un retrato', cadaver: 'un cadáver con su ropa',
  telefono: 'suena un teléfono', tv: 'noticiero en una tele', tvcam: 'tele de vigilancia', barras: 'barras de colores 3:33', radio: 'radio con desaparecidos', reconectando: '«Reconectando…»', clima: 'clima con falla', rezando: 'alguien rezando con veladora',
  ofrenda: 'foto en la ofrenda', pasillo: 'pasillo que se repite', estatua: 'doble quieto de un compañero', estatuaGrito: 'tocaron al doble quieto: ¡grito!', estatuaHabla: 'el doble quieto contestó con su voz', ecoya: 'eco al instante (falla de wifi)', leyenda: 'grito de La Llorona (1 entre 64)' };
const G_TXT = { door: 'movió una puerta', portazo: 'dio un portazo', move: 'aventó o movió un objeto', switch: 'prendió o apagó una luz', manifest: 'se manifestó', chill: 'escalofrío', whisper: 'susurró', special: 'usó su habilidad', espejo: 'marcó el espejo' };
const roomName = p => { if (!p || p.f === undefined) return ''; if (stairAt(p.x, p.y) >= 0) return 'Escalera'; const r = roomAt(p.f, p.x, p.y); return r >= 0 ? ROOMS[p.f][r].n : ''; };
function blog(w, kind, txt, p) { (w.bitacora || (w.bitacora = [])).push({ t: w.t, kind, txt, room: roomName(p) }); if (w.bitacora.length > 80) w.bitacora.shift(); }
const _newWorldB = newWorld;
newWorld = function (opt) {
  const w = _newWorldB(opt); w.bitacora = []; const ev0 = w.ev;
  w.ev = (type, data) => { ev0(type, data); const d = data || {}, who = d.who !== undefined && w.invs[d.who] ? w.invs[d.who].name : '';
    if (type === 'cas') blog(w, 'casa', (CAS_TXT[d.k] || d.k) + (who ? ' → ' + who : ''), d);
    else if (type === 'hunt') blog(w, 'cacería', d.cursed ? '¡CACERÍA MALDITA!' : '¡Empieza una cacería!', w.g);
    else if (type === 'tecolote') blog(w, 'ánima', 'cantó el tecolote: ya puede cazar', w.g);
    else if (type === 'fuseBlow') blog(w, 'casa', 'se botaron los fusibles', FUSE);
    else if (type === 'anomSeen') blog(w, 'casa', 'alguien vio una anomalía' + (who ? ' → ' + who : ''), d);
    else if (type === 'lamento') blog(w, 'ánima', 'un lamento', d); };
  return w;
};
const _ghostEventB = ghostEvent;
ghostEvent = function (w, g, type, extra) { _ghostEventB(w, g, type, extra); if (G_TXT[type] && w.bitacora) blog(w, 'ánima', G_TXT[type], g); };
// la casona dice si alguien lo notó o si vuelve a tirar
const _casonaTick4 = casonaTick4;
casonaTick4 = function (w, dt) { const pd = w.cas.pend; _casonaTick4(w, dt); if (pd && !w.cas.pend && w.bitacora) { const ok = w.t < pd.t + 5 && casNoticed(w, pd).length; blog(w, 'casa', ok ? `lo notaron (−${CAS_SAN[pd.k] || 1} de cordura)` : 'nadie lo notó en 5 s: vuelve a tirar', pd.p); } };
const _casRollB = casRoll;
casRoll = function (w) { const n = w.cas.used.length; _casRollB(w); if (!w.bitacora) return; const k = w.cas.used.length > n ? w.cas.used[w.cas.used.length - 1] : null;
  if (!k) blog(w, 'casa', 'tiró un suceso que esta ánima le prohíbe: nada'); else if (k === 'nada') blog(w, 'casa', 'tiró… nada'); else if (k === 'anomalia') blog(w, 'casa', 'dejó una anomalía (se queda)', w.anoms[w.anoms.length - 1]); };
