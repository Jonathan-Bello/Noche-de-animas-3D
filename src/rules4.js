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
CFG.emfP = 0; CFG.cam.p = 0; CFG.esp.p = 0; CFG.uv.p = 0.5; CFG.uv.re = 40;
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

  // aparatos repartidos al azar: puede que haya o no en cada cuarto
  const rooms = shuffle(ROOM_LIST.filter(r => !isHall(r.f, r.r) && SURFACES[r.f][r.r] && SURFACES[r.f][r.r].length));
  w.devices = []; const put = (kind, n) => { for (let k = 0; k < n && rooms.length; k++) { const index=rooms.findIndex(r=>!(w.altarRoom.f===r.f&&w.altarRoom.r===r.r&&SURFACES[r.f][r.r].length<=2)&&(kind!=='tv'||SURFACES[r.f][r.r].length>=2));if(index<0)break;const r=rooms.splice(index,1)[0],p=onFurniture(r.f,r.r); w.devices.push({ kind, f: r.f, x: p.x, y: p.y, h: p.h, r: r.r }); } };
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

// ---------- Pulso de la guarida: toques pequeños y callados en su cuarto (EMF 2-3, a veces 5) ----------
// Menos sucesos por toda la casa, pero el cuarto del ánima "se siente vivo": así se puede encontrar.
const _toolTickP = toolTick;
toolTick = function (w, dt) {
  _toolTickP(w, dt); const g = w.g; if (!g || g.hunt || g.state !== 'libre' || w.phase !== 'night' || (w.opt && w.opt.lab)) return;
  if (w.t < (g.pulseAt || 0)) return; g.pulseAt = w.t + rnd(22, 38);
  if (!(g.f === g.home.f && roomOf(g) === g.home.r)) return;
  const p = randomIn(g.home.f, g.home.r); w.emfSrc.push({ f: p.f, x: p.x, y: p.y, lvl: g.def.ev.includes('LU') && Math.random() < 0.3 ? 5 : 2 + (Math.random() < 0.5 ? 1 : 0), until: w.t + 20 });
  w.rastro[g.home.f][g.home.r] = Math.min(100, w.rastro[g.home.f][g.home.r] + 6); w.ev('pulso', p);
  if (typeof CSFX !== 'undefined') {} // el sonido lo pone la capa 3D (crujido suave)
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
  for (const it of w.items) if (it.kind === 'espejo' && !it.holder && w.t >= (it.markUntil || 0) && it.f === g.f && d2(it, g) < 5) {
    it.diceT = (it.diceT || 0) + dt; if (it.diceT < 8) continue; it.diceT = 0;
    if (g.def.ev.includes('ES') && Math.random() < 1 / 7) { it.markUntil = Infinity; w.ev('espejo', { f: it.f, x: it.x, y: it.y }); ghostEvent(w, g, 'espejo'); }
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
  const home = w.team && w.team.home, hot = (w.emfSrc || []).filter(e => w.t - (e.until - 20) < 25).pop(), hotR = hot ? { f: hot.f, r: roomAt(hot.f, hot.x, hot.y) } : null;
  for (const b of alive(w)) if (b.bot && !(b.f === 0 && b.y >= 39)) { const k = b.slots.findIndex(s => s && ['cam', 'espejo', 'gases'].includes(s.kind)); if (k < 0) continue; const r = roomOf(b), here = home ? b.f === home.f && r === home.r : hotR && hotR.r >= 0 && b.f === hotR.f && r === hotR.r && !isHall(b.f, r);
    if (here) { const c = ROOM_CENTER[b.f][r]; if (c) b.face = Math.atan2(c.y - b.y, c.x - b.x); const it = b.slots[k]; dropItem(w, b, k); blog(w, 'equipo', `${b.name} deja ${ITEMS[it.kind].n} en ${roomName(b)} ${home ? '(la guarida)' : '(ahí hubo actividad hace poco)'}`, b, b.id); } }
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
const _ghostEventB = ghostEvent;
ghostEvent = function (w, g, type, extra) { _ghostEventB(w, g, type, extra); if (G_TXT[type] && w.bitacora) blog(w, 'ánima', G_TXT[type], g); };
// la casona dice si alguien lo notó o si vuelve a tirar
const _casonaTick4 = casonaTick4;
casonaTick4 = function (w, dt) { const pd = w.cas.pend; _casonaTick4(w, dt); if (pd && !w.cas.pend && w.bitacora) { const ok = w.t < pd.t + 5 && casNoticed(w, pd).length; blog(w, 'casa', ok ? `lo notaron (−${CAS_SAN[pd.k] || 1} de cordura)` : 'nadie lo notó en 5 s: vuelve a tirar', pd.p); } };
const _casRollB = casRoll;
casRoll = function (w) { const n = w.cas.used.length; _casRollB(w); if (!w.bitacora) return; const k = w.cas.used.length > n ? w.cas.used[w.cas.used.length - 1] : null;
  if (!k) blog(w, 'casa', 'tiró un suceso que esta ánima le prohíbe: nada'); else if (k === 'nada') blog(w, 'casa', 'tiró… nada'); else if (k === 'anomalia') blog(w, 'casa', 'dejó una anomalía (se queda)', w.anoms[w.anoms.length - 1]); };

// ================= v1.3 =================
// ---------- periodo de gracia: el ánima no caza en las primeras horas (fácil 2 h, normal 1 h, pesadilla nada) ----------
const GRACE_H = { facil: 2, normal: 1, pesadilla: 0 };
const _newWorldG = newWorld;
newWorld = function (opt) { const w = _newWorldG(opt); w.huntFreeAt = (GRACE_H[w.opt.diff] !== undefined ? GRACE_H[w.opt.diff] : 1) * w.nightLen / 7; return w; };
const _startHuntG = startHunt;
startHunt = function (w, g) { if (w.t < (w.huntFreeAt || 0) && !(g.hunt && g.hunt.huida)) return false; return _startHuntG(w, g); };

// ---------- bots: llevan 2 herramientas y un lugar libre; regresan a la base a cambiar equipo ----------
const _newWorldBots = newWorld;
newWorld = function (opt) {
  const w = _newWorldBots(opt); const bots = w.invs.filter(i => i.bot), tl = shuffle(TOOLS.slice());
  bots.forEach((b, k) => { b.ai.wantTools = tl.filter((_, j) => j % bots.length === k).slice(0, 2); b.ai.nextResupply = rnd(150, 210); });
  return w;
};
const toolNeeded = (w, kind) => { const k = ITEMS[kind] && ITEMS[kind].tool; return k && !w.obs[k] && !(w.team && w.team.ruled && w.team.ruled.has && w.team.ruled.has(k)); };
function botResupply(w, b, dt, sp) {
  const ai = b.ai, g = w.g; if (g.hunt || b.leave || w.phase !== 'night') return false;
  if (ai.state !== 'resupply') {
    const lowSan = b.san < 45 && !b.slots.some(x => x && x.kind === 'te') && w.items.some(t => !t.holder && t.kind === 'te' && t.f === 0 && t.y >= 50);
    const free = b.slots.filter(x => !x).length, waiting = w.items.some(t => !t.holder && TOOLS.includes(t.kind) && t.f === 0 && t.y >= 50 && toolNeeded(w, t.kind));
    const useless = b.slots.some(x => x && TOOLS.includes(x.kind) && !toolNeeded(w, x.kind));
    if (ai.state !== 'gear' && (lowSan || (w.t > ai.nextResupply && (waiting && (free >= 1 || useless))))) { ai.state = 'resupply'; ai.prevState = ai.state; ai.why = lowSan ? 'por té de tila (cordura baja)' : useless ? 'a cambiar herramientas que ya no sirven' : 'por herramientas que nadie ha usado'; }
    else return false;
  }
  const spot = { f: 0, x: MALETIN.x, y: 54.2 };
  if (!(b.f === 0 && d2(b, spot) < 1.3)) { moveBot(w, b, spot, CFG.walk * sp, dt); return true; }
  // en la mesa: dejar lo que ya no sirve y tomar lo que falta
  b.slots.forEach((x, k) => { if (x && TOOLS.includes(x.kind) && !toolNeeded(w, x.kind)) { b.face = Math.PI / 2; dropItem(w, b, k); Object.assign(x, { f: 0, x: 14.4 + Math.random() * 5, y: 55.3, h: 0.78 }); blog(w, 'equipo', `${b.name} deja en la mesa: ${ITEMS[x.kind].n} (esa evidencia ya se sabe)`, b); } });
  const take = kinds => { for (const kd of kinds) { if (!b.slots.includes(null)) return; const t = w.items.find(t => !t.holder && t.kind === kd && t.f === 0 && t.y >= 50); if (t) { t.x = b.x; t.y = b.y; t.f = b.f; b.hand = b.slots.indexOf(null); pickUp(w, b); } } };
  if (b.san < 60 && !b.slots.some(x => x && x.kind === 'te')) take(['te']);
  take(shuffle(TOOLS.filter(k => toolNeeded(w, k) && !w.invs.some(o => o.alive && o.slots.some(x => x && x.kind === k)) && !w.items.some(t => t.kind === k && !(t.f === 0 && t.y >= 50)))));
  ai.state = w.team.home ? 'setup' : 'explore'; ai.goal = null; ai.nextResupply = w.t + rnd(150, 210); return true;
}

// ---------- bitácora detallada: casa, ánima y cada persona ----------
let BITA_MAX = 300;
function blog2(w, kind, txt, p, who) { if (!w.bitacora) return; w.bitacora.push({ t: w.t, kind, txt, room: roomName(p), who }); if (w.bitacora.length > BITA_MAX) w.bitacora.splice(0, w.bitacora.length - BITA_MAX); }
blog = blog2;
// la casa: la tirada completa, qué intentó y cómo le fue
casRoll = function (w) {
  const g = w.g, veto = (PROF[g.def.id] || {}).veto, a = alive(w); if (!a.length) return;
  const inside = a.filter(i => !(i.f === 0 && i.y >= 39)), tries = w.cas.reroll || 0; w.cas.reroll = 0; w.cas.retry = false; w.cas.retryWhy = '';
  if (!inside.length) { blog(w, 'casa', '🎲 No tira: todos están afuera.'); return; }
  const avg = a.reduce((s, i) => s + i.san, 0) / a.length, r0 = 1 + Math.floor(Math.random() * 100); let r = Math.min(100, r0 + (avg < 50 ? 10 : 0));
  if (veto === 'nada' && r <= 10) r = 41 + Math.floor(Math.random() * 12);
  let k = CAS.find(([lo, hi]) => r >= lo && r <= hi)[2], note = '';
  if (k === 'elige') { k = pick(['rezando', 'ofrenda', 'pasillo', 'tvcam', 'cadaver'].filter(x => !w.cas.used.includes(x)).concat(['ambiente'])); note = ' (sacó «elige» y escogió esto)'; }
  if (CAS_ONCE.has(k) && w.cas.used.includes(k)) { note = ` («${CAS_TXT[k]}» ya salió esta noche: se cambia por ambiente)`; k = 'ambiente'; }
  const tir = `🎲 ${r0}${avg < 50 ? ' +10 por cordura baja' : ''}${tries ? ` (tiro ${tries + 1})` : ''}`;
  if (k === veto) { blog(w, 'casa', `${tir} → «${CAS_TXT[k]}», pero esta ánima lo prohíbe: no pasa nada.`); return; }
  w.cas.used.push(k);
  if (k === 'nada') { blog(w, 'casa', `${tir} → nada.`); return; }
  const humans = inside.filter(i => !i.bot), v = pick(humans.length ? humans : inside), n0 = w.events.length, h0 = w.hallu, an0 = w.anoms.length;
  casDo(w, k, v);
  const ev = w.events.slice(n0).find(e => e.type === 'cas'), done = !w.cas.retry && (ev || (k === 'doble' && w.hallu !== h0) || (k === 'anomalia' && w.anoms.length > an0));
  if (!done) { blog(w, 'casa', `${tir} → intentó «${CAS_TXT[k]}» con ${v.name}, pero ${w.cas.retryWhy || 'no encontró dónde hacerlo'}${tries < 2 ? '. Vuelve a tirar.' : '. Se rinde.'}`, v); if (tries < 2) { w.cas.next = 0; w.cas.reroll = tries + 1; } return; }
  blog(w, 'casa', `${tir} → «${CAS_TXT[k]}» con ${v.name}${note}.`, ev || w.hallu || v);
  if (k === 'anomalia') return;
  w.cas.pend = { k, t: w.t, who: v.id, p: ev ? { f: ev.f, x: ev.x, y: ev.y } : { f: v.f, x: v.x, y: v.y }, tries };
};
const _casDoWhy = casDo;
casDo = function (w, k, v) { _casDoWhy(w, k, v); if (w.cas.retry && !w.cas.retryWhy) w.cas.retryWhy = ['tv', 'tvcam', 'barras', 'telefono', 'radio'].includes(k) ? `no hay ${k === 'telefono' ? 'teléfono' : k === 'radio' ? 'radio' : 'tele'} cerca de esa persona` : k === 'estatua' ? 'no había lugar a la vista' : k === 'ecoya' ? 'esa persona no ha hablado en los últimos 4 s' : 'no encontró dónde hacerlo'; };
casonaTick4 = (function (base) { return function (w, dt) { const pd = w.cas.pend, seen = pd && w.t >= pd.t + 0.3 ? casNoticed(w, pd) : []; base(w, dt);
  if (pd && !w.cas.pend) { if (seen.length) blog(w, 'casa', `   «${CAS_TXT[pd.k]}»: lo notó ${seen.map(i => i.name).join(', ')} (−${CAS_SAN[pd.k] || 1} de cordura).`, pd.p); else blog(w, 'casa', `   «${CAS_TXT[pd.k]}»: nadie lo notó en 5 s${pd.tries < 2 ? ' → vuelve a tirar' : ''}.`, pd.p); } }; })(_casonaTick4);
// eventos: la casa (los que no son tirada), el ánima y las personas
const _newWorldL = newWorld;
newWorld = function (opt) {
  const w = _newWorldL(opt); w.bitacora = []; const ev0 = w.ev;
  w.ev = (type, data) => { ev0(type, data); const d = data || {}, P = d.who !== undefined && w.invs[d.who], who = P ? P.name : '';
    if (type === 'cas' && ['estatuaGrito', 'estatuaHabla', 'leyenda'].includes(d.k)) blog(w, 'casa', `   ${CAS_TXT[d.k]}${who ? ' → ' + who : ''}`, d);
    else if (type === 'hunt') blog(w, 'cacería', `¡${d.cursed ? 'CACERÍA MALDITA' : 'Empieza una cacería'}! ${w.g.ai && w.g.ai.target && w.g.ai.target.who ? 'Va tras ' + w.g.ai.target.who.name : ''}`, w.g);
    else if (type === 'tecolote') blog(w, 'ánima', 'cantó el tecolote: ya tiene ganas de cazar', w.g);
    else if (type === 'fuseBlow') blog(w, 'casa', '⚡ se botaron los fusibles (demasiados focos)', FUSE);
    else if (type === 'anomSeen') blog(w, 'casa', `   ${who || 'alguien'} vio una anomalía (−3 de cordura)`, d);
    else if (type === 'lamento') blog(w, 'ánima', 'un lamento', d);
    else if (type === 'death') blog(w, 'cacería', `☠ ${who || 'alguien'} murió`, P || d);
    else if (type === 'escape') blog(w, 'equipo', `${who} se subió a la camioneta${P && P.guess ? ' · apuesta: ' + GT[P.guess].n : ' sin apostar'}`, P);
    else if (type === 'visita') blog(w, 'equipo', `${who} abrió el zaguán`, ZAG); };
  // lo que ve el equipo
  w.says = []; const say0 = w.say; w.say = (txt, ch) => { say0(txt, ch); if (ch === 'i' && w.actor) blog(w, 'equipo', `${w.actor.name}: ${String(txt).replace(/<[^>]+>/g, '')}`, w.actor, w.actor.id); };
  return w;
};
const _observeL = observe;
observe = function (w, k, by, how) { const had = !!w.obs[k]; _observeL(w, k, by, how); if (by && by.alive && w.g.def.ev.includes(k) && !(w.seenBy && w.seenBy[k + by.id])) { (w.seenBy = w.seenBy || {})[k + by.id] = 1; blog(w, 'equipo', `🔎 ${by.name} vio evidencia: ${EVN[k] || k} (${how})${had ? '' : ' — primera vez esta noche'}`, by, by.id); } };
const EVN = { BC: 'bajo cero', CE: 'ceniza con UV', SU: 'susurros', OB: 'objetos/silueta en cámara', LU: 'EMF 5', ES: 'mano en el espejo', AZ: 'azufre' };
const _pickUpL = pickUp; pickUp = function (w, i) { const n = i.slots.filter(Boolean).length, r = _pickUpL(w, i); if (r && i.slots.filter(Boolean).length > n) { const it = i.slots[i.hand] || i.slots.find(Boolean); blog(w, 'equipo', `${i.name} toma: ${it ? ITEMS[it.kind].n : 'algo'}`, i, i.id); } return r; };
const _dropItemL = dropItem; dropItem = function (w, i, k) { const it = i.slots[k], r = _dropItemL(w, i, k); if (r && it && i.alive && !i.escaped) blog(w, 'equipo', `${i.name} deja: ${ITEMS[it.kind].n}`, i, i.id); return r; };
const _useItemRawL = useItemRaw; useItemRaw = function (w, i) { const it = handItem(i), r = _useItemRawL(w, i); if (r && it && !['emf', 'termo', 'cam', 'grab'].includes(it.kind)) blog(w, 'equipo', `${i.name} usa: ${ITEMS[it.kind].n}`, i, i.id); return r; };
const _toggleLightL = toggleLight; toggleLight = function (w, i) { const r0 = roomOf(i), before = r0 >= 0 ? w.lights[i.f][r0] : null, r = _toggleLightL(w, i); if (r0 >= 0 && w.lights[i.f][r0] !== before) blog(w, 'equipo', `${i.name} ${w.lights[i.f][r0] ? 'prende' : 'apaga'} la luz`, i, i.id); return r; };

// qué hace cada quien (y por qué está quieto)
function doingOf(w, b) {
  const ai = b.ai || {}, g = w.g, R = p => p && p.f !== undefined ? roomName(p) || 'un pasillo' : '';
  if (!b.alive) return 'es espíritu'; if (b.escaped) return 'está en la camioneta';
  if (b.hidden >= 0) return 'está escondido';
  if (!b.bot) { const h = handItem(b); return `está en ${R(b) || 'la casa'}${h ? ' con ' + ITEMS[h.kind].n : ''}`; }
  if (g.hunt && ai.react) return 'huye de la cacería';
  if (b.leave) return `va a la camioneta para apostar por ${b.guess ? GT[b.guess].n : '¿?'}`;
  if (b.monitor) return 'va a ver las teles de la base';
  if (ai.lure && ai.lure.fuse) return 'va a subir los fusibles';
  if (ai.state === 'resupply') return `regresa a la base ${ai.why || ''}`;
  if (ai.state === 'gear') return `toma su equipo (${(ai.wantTools || []).map(k => ITEMS[k].n).join(', ')})`;
  if (ai.state === 'setup') { const it = b.slots[ai.placeK]; return `pone ${it ? ITEMS[it.kind].n : 'equipo'} en la guarida (${R(w.team.home && ROOM_CENTER[w.team.home.f][w.team.home.r] && Object.assign({ f: w.team.home.f }, ROOM_CENTER[w.team.home.f][w.team.home.r]))})`; }
  if (ai.state === 'watch') return ai.study ? `estudia la guarida con ${ITEMS[ai.study.kind] ? ITEMS[ai.study.kind].n : ai.study.kind}` : 'ronda la guarida';
  if (ai.sweep) return `mide la temperatura en ${R(b)}`;
  return `explora rumbo a ${R(ai.goal) || '¿?'}${w.team.home ? '' : ' (buscan la guarida)'}`;
}
function teamWatch(w, dt) {
  if (!w.bitacora || w.phase === 'hora' && false) return;
  for (const b of w.invs) { const d = doingOf(w, b), m = b._log || (b._log = { d: '', t: -9, x: b.x, y: b.y, st: 0, stLog: 0 });
    if (d !== m.d && w.t - m.t > 2.5) { if (b.bot || /espíritu|camioneta|escondido/.test(d)) blog(w, 'equipo', `${b.name} ${d}`, b, b.id); m.d = d; m.t = w.t; }
    // ¿quieto?
    const mv = Math.hypot(b.x - m.x, b.y - m.y); m.x = b.x; m.y = b.y;
    if (b.alive && !b.escaped && b.hidden < 0 && mv < 0.01) m.st += dt; else m.st = 0;
    if (b.bot && m.st > 8 && w.t - m.stLog > 20 && !/estudia|mide|teles/.test(d)) { m.stLog = w.t; const ai = b.ai;
      const why = w.t < (b.stunUntil || 0) ? 'está aturdido o esperando' : b.reading ? 'está leyendo algo' : w.ritual && w.ritual.by === b ? 'hace un ritual' : ai.goal && pathLen(w, b, ai.goal) >= 999 ? `no encuentra camino a ${roomName(ai.goal) || 'su destino'}` : ai.goal ? `no avanza hacia ${roomName(ai.goal) || 'su destino'} (algo le estorba)` : 'no tiene nada que hacer';
      blog(w, 'equipo', `⏸ ${b.name} lleva ${Math.round(m.st)} s quieto: ${why}`, b, b.id); }
    // personas: cambios de cuarto
    if (!b.bot && b.alive && !b.escaped) { const rn = roomName(b); if (rn !== m.room) { m.roomT = (m.roomT || 0) + dt; if (m.roomT > 3) { m.room = rn; m.roomT = 0; blog(w, 'equipo', `${b.name} entra a ${rn || 'un pasillo'}`, b, b.id); } } else m.roomT = 0; }
  }
}
// el ánima: qué quiere y por qué
function ghostWatch(w, dt) {
  const g = w.g; if (!g.bot || w.phase !== 'night') return; g._wT = (g._wT || 0) - dt; if (g._wT > 0) return; g._wT = 1;
  const m = ghostMotive(w, g), hunger = Math.round((1 - g.pres / g.def.presMax) * 100);
  const txt = { rondar: 'ronda tranquila', acechar: 'acecha: le hablaron o preguntaron hace poco', alimentarse: `tiene hambre (${hunger} %)${m.prey ? ' y busca a ' + m.prey.name : ''}`, enganar: 'quiere engañar: hay gente o equipo en su guarida', cazar: `quiere cazar${w.t < w.huntFreeAt ? ', pero aún es temprano (periodo de gracia)' : ''}` }[m.state];
  if (m.state !== g._mot) { g._mot = m.state; blog(w, 'ánima', `👻 ${txt}`, g); }
}
const _rulesTickL = rulesTick; rulesTick = function (w, dt) { _rulesTickL(w, dt); try { teamWatch(w, dt); ghostWatch(w, dt); } catch (e) {} };

// ================= v1.4: la casa, afinada con la retroalimentación =================
// fuera la sombra que se retrasa y la serenata
CAS.splice(0, CAS.length, [1, 40, 'nada'], [41, 48, 'ambiente'], [49, 50, 'estatua'], [51, 52, 'ecoya'], [53, 56, 'anomalia'], [57, 59, 'senuelo'], [60, 62, 'doble'], [63, 65, 'eco'], [66, 72, 'pasos'],
  [73, 76, 'sombra'], [77, 80, 'puerta'], [81, 84, 'zaguan'], [85, 86, 'foto'], [87, 88, 'cadaver'], [89, 90, 'telefono'], [91, 91, 'tv'], [92, 92, 'tvcam'], [93, 93, 'barras'], [94, 94, 'radio'],
  [95, 95, 'reconectando'], [96, 96, 'clima'], [97, 97, 'rezando'], [98, 98, 'ofrenda'], [99, 99, 'pasillo'], [100, 100, 'elige']);
const VIS_TXT = { nadie: 'nadie (solo viento)', pista: 'un visitante con una pista (verdad o mentira)', nino: 'una niña con veladora que señala dónde está el ánima', doble: 'tu doble, afuera' };
function casZaguan(w, v) {
  const d = w.doors.find(d => d.ext); if (d) { d.closed = true; d.anim = 1; }
  const kind = pick(['nadie', 'pista', 'pista', 'nino', 'doble']); w.cas.knock = { until: w.t + 40, kind, t0: w.t };
  w.ev('cas', { k: 'zaguan', who: v.id, f: 0, x: ZAG.x, y: ZAG.y + 0.6 }); blog(w, 'casa', `   El zaguán se cerró solo y tocan desesperados. Detrás: ${VIS_TXT[kind]}.`, ZAG);
}
visitor = function (w, i) {
  const k = w.cas.knock, kind = k ? k.kind : 'nadie', g = w.g; w.cas.knock = null; const d = w.doors.find(d => d.ext); if (d) { d.closed = false; d.anim = 1; }
  w.ev('visita', { who: i.id, kind }); w.actor = i;
  if (kind === 'nadie') { w.say('Abres el zaguán… no hay nadie. El viento azota la puerta contra la pared.', 'i'); w.haunt(i, 4); }
  else if (kind === 'pista') { const truth = Math.random() < 0.5, other = pick(GHOSTS.filter(G => G !== w.g.def)), who = pick(['La vecina', 'Un señor con sombrero', 'El sereno', 'Una señora con rebozo']);
    w.say(`${who}: «Dicen que no es ${truth ? other.n : w.g.def.n}». Se da la vuelta y se pierde en la calle. (Puede ser verdad o mentira.)`, 'i'); }
  else if (kind === 'nino') { const up = g.home.f === 1, truth = Math.random() < 0.7, says = truth ? up : !up; w.say(`Una niña con una veladora te mira y señala ${says ? 'hacia arriba' : 'hacia abajo'}: «La señora está ${says ? 'arriba' : 'abajo'}». La vela se apaga y ya no está.`, 'i'); w.haunt(i, 3); }
  else { w.say('Afuera estás tú… o alguien idéntico a ti. Sonríe, se da la vuelta y camina hacia la calle.', 'i'); w.haunt(i, 8); }
  w.actor = null; blog(w, 'casa', `   ${i.name} abrió el zaguán: ${VIS_TXT[kind]}.`, ZAG);
};
function casRezando(w, v) {
  const rs = ROOM_LIST.filter(r => r.f === v.f && !isHall(r.f, r.r) && ROOM_CENTER[r.f][r.r] && r.r !== roomOf(v)).map(r => ({ r, d: pathLen(w, v, ROOM_CENTER[r.f][r.r]) })).filter(o => o.d < 30).sort((a, b) => a.d - b.d);
  const o = rs.find(o => !w.lights[o.r.f][o.r.r]) || rs[0]; if (!o) { w.cas.retry = true; w.cas.retryWhy = 'no hay un cuarto cerca'; return; }
  w.lights[o.r.f][o.r.r] = 0; const p = randomIn(o.r.f, o.r.r); w.kneel = Object.assign(p, { until: w.t + 60, char: pick(NAMES)[2] });
  w.ev('cas', { k: 'rezando', who: v.id, f: p.f, x: p.x, y: p.y });
}
function casRetrato(w, v) {
  const dx = Math.cos(v.face), dy = Math.sin(v.face); let x = v.x, y = v.y, hit = null;
  for (let s = 0.3; s < 9; s += 0.08) { const nx = v.x + dx * s, ny = v.y + dy * s; if (tileAt(v.f, nx, ny) === T.WALL) { hit = { x: nx, y: ny }; break; } x = nx; y = ny; }
  if (!hit) { w.cas.retry = true; w.cas.retryWhy = 'no hay pared enfrente'; return; }
  const tx = hit.x | 0, ty = hit.y | 0, px = x | 0, py = y | 0, nx = tx !== px ? Math.sign(px - tx) : 0, ny = nx ? 0 : Math.sign(py - ty);
  const p = { f: v.f, x: nx ? (nx > 0 ? tx + 1.03 : tx - 0.03) : hit.x, y: ny ? (ny > 0 ? ty + 1.03 : ty - 0.03) : hit.y, nx, ny, char: v.char, name: v.name };
  (w.portraits || (w.portraits = [])).push(p); w.actor = v; w.say('En el retrato de la pared… ahora apareces tú.', 'i'); w.actor = null; w.ev('cas', { k: 'foto', who: v.id, f: p.f, x: p.x, y: p.y });
}
const _casDo14 = casDo;
casDo = function (w, k, v) {
  if (k === 'zaguan') return casZaguan(w, v);
  if (k === 'rezando') return casRezando(w, v);
  if (k === 'foto') return casRetrato(w, v);
  if (k === 'ofrenda') { w.ofrenda = { char: v.char, name: v.name, t: w.t }; w.say(`En la ofrenda apareció una foto de ${v.name}.`, 'a'); w.ev('cas', { k, who: v.id, f: ALTAR_POS.f, x: ALTAR_POS.x, y: ALTAR_POS.y, name: v.name }); return; }
  if (k === 'tv' || k === 'tvcam' || k === 'barras') { const n0 = w.events.length; _casDo14(w, k, v); if (w.cas.retry) return; const ev = w.events.slice(n0).find(e => e.type === 'cas' && e.k === k);
    const mates = alive(w).filter(i => i !== v && !(i.f === 0 && i.y >= 39)); w.tvOn = { k, dev: ev ? ev.dev : -1, t0: w.t, until: w.t + { tv: 19, tvcam: 18, barras: 45 }[k], who: v.id, missing: pick(w.invs).id, targets: [v.id].concat(mates.length ? [pick(mates).id] : []) }; return; }
  return _casDo14(w, k, v);
};
// la tele se apaga sola al terminar, o si alguien se acerca y la apaga (E)
const tvDev = w => w.tvOn && w.devices && w.devices[w.tvOn.dev];
const _interact14 = interact;
interact = function (w, i) { const d = tvDev(w); if (d && d.f === i.f && d2(d, i) < 1.9) { w.ev('tvoff', { f: d.f, x: d.x, y: d.y, who: i.id }); blog(w, 'equipo', `${i.name} apaga la tele`, i, i.id); w.tvOn = null; return 'tv'; } return _interact14(w, i); };
const _step14 = step; step = function (w, dt, input) { _step14(w, dt, input); if (w.tvOn && w.t > w.tvOn.until) { const d = tvDev(w); w.tvOn = null; if (d) w.ev('tvoff', { f: d.f, x: d.x, y: d.y }); } };
// anomalías: cuál fue
const ANOM_TXT = { flota: 'un objeto flota en el aire', invertido: 'un cuadro quedó de cabeza', puerta: 'una puerta cambió sola (abierta ↔ cerrada)' };
const _newWorld14 = newWorld;
newWorld = function (opt) { const w = _newWorld14(opt), ev1 = w.ev; w.portraits = []; w.ofrenda = null; w.tvOn = null;
  w.ev = (type, d) => { ev1(type, d); if (type === 'anomaly' && d) { const o = w.loose.filter(o => o.f === d.f).sort((a, b) => d2(a, d) - d2(b, d))[0]; blog(w, 'casa', `   Anomalía: ${d.kind === 'aparece' && o ? `apareció ${LOOSE_N[o.kind]} que no estaba` : ANOM_TXT[d.kind] || d.kind}`, d); } };
  return w; };
