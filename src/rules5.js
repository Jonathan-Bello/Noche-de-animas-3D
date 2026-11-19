// ================= v1.6: casona más variada y bots que investigan con método =================
ITEMS.cam.n = 'Cámara de video';

// ---------- utilidades de cuartos ----------
// cuartos que comparten puerta con (f, r); sirve para el bucle del pasillo y para el rezo
function roomNeighbors(w, f, r) {
  w._rn = w._rn || {}; const key = f + ':' + r; if (w._rn[key]) return w._rn[key]; const out = [];
  for (const d of w.doors) { if (d.f !== f) continue; const ax = d.o === 'V' ? 0.9 : 0, ay = d.o === 'V' ? 0 : 0.9;
    const a = roomAt(f, d.x + ax, d.y + ay), b = roomAt(f, d.x - ax, d.y - ay); const o = a === r ? b : b === r ? a : -1;
    if (o >= 0 && o !== r && !['afuera', 'afuera1'].includes(ROOMS[f][o].id)) out.push({ r: o, door: d, sideIn: a === r ? { x: d.x + ax * 1.25, y: d.y + ay * 1.25 } : { x: d.x - ax * 1.25, y: d.y - ay * 1.25 }, sideOut: a === r ? { x: d.x - ax * 1.25, y: d.y - ay * 1.25 } : { x: d.x + ax * 1.25, y: d.y + ay * 1.25 } }); }
  return (w._rn[key] = out);
}
const isOutside = i => i.f === 0 && i.y >= 39;

// ---------- la casona: tabla nueva (1d100) ----------
// común: ambiente, pasos, anomalía · medio: puerta, eco, sombra, zaguán, aparatos · raro: lo demás · muy raro: señuelo, estatua
CAS.splice(0, CAS.length, [1, 38, 'nada'], [39, 44, 'ambiente'], [45, 50, 'pasos'], [51, 57, 'anomalia'], [58, 61, 'puerta'], [62, 64, 'eco'], [65, 67, 'sombra'],
  [68, 71, 'zaguan'], [72, 73, 'telefono'], [74, 75, 'tv'], [76, 76, 'tvcam'], [77, 77, 'barras'], [78, 79, 'radio'], [80, 81, 'cadaver'], [82, 83, 'doble'],
  [84, 85, 'rezando'], [86, 87, 'foto'], [88, 89, 'clima'], [90, 91, 'reconectando'], [92, 94, 'ecoya'], [95, 95, 'ofrenda'], [96, 97, 'pasillo'],
  [98, 98, 'senuelo'], [99, 99, 'estatua'], [100, 100, 'elige']);
CAS_TXT.pasillo = 'el cuarto se repite (bucle)'; CAS_TXT.bucle = 'el cuarto se repitió'; CAS_SAN.bucle = 3;

// si falla, no pasa nada: la casona se queda en silencio (ya no vuelve a tirar)
casRoll = function (w) {
  const g = w.g, veto = (PROF[g.def.id] || {}).veto, a = alive(w); if (!a.length) return;
  const inside = a.filter(i => !isOutside(i)), tries = w.cas.reroll || 0; w.cas.reroll = 0; w.cas.retry = false; w.cas.retryWhy = '';
  if (!inside.length) { blog(w, 'casa', '🎲 No tira: todos están afuera.'); return; }
  const avg = a.reduce((s, i) => s + i.san, 0) / a.length, r0 = 1 + Math.floor(Math.random() * 100); let r = Math.min(100, r0 + (avg < 50 ? 10 : 0));
  if (veto === 'nada' && r <= 10) r = 41 + Math.floor(Math.random() * 12);
  let k = CAS.find(([lo, hi]) => r >= lo && r <= hi)[2], note = '';
  const tir = `🎲 ${r0}${avg < 50 ? ' +10 por cordura baja' : ''}${tries ? ` (tiro ${tries + 1})` : ''}`;
  if (k === 'elige') { k = pick(['rezando', 'ofrenda', 'pasillo', 'tvcam', 'cadaver'].filter(x => !w.cas.used.includes(x))) || 'nada'; note = ' (sacó «elige»)'; }
  if (CAS_ONCE.has(k) && w.cas.used.includes(k)) { blog(w, 'casa', `${tir} → «${CAS_TXT[k]}» ya salió esta noche: silencio.`); return; }
  const recent = w.cas.used.filter(x => x !== 'nada').slice(-2);
  if (k !== 'nada' && recent.includes(k)) { blog(w, 'casa', `${tir} → «${CAS_TXT[k]}» acaba de pasar: silencio.`); return; }
  if (k === veto) { blog(w, 'casa', `${tir} → «${CAS_TXT[k]}», pero esta ánima lo prohíbe: silencio.`); return; }
  if (k === 'nada') { w.cas.used.push(k); blog(w, 'casa', `${tir} → nada.`); return; }
  const humans = inside.filter(i => !i.bot), v = pick(humans.length ? humans : inside), n0 = w.events.length, h0 = w.hallu, an0 = w.anoms.length, arm0 = w.cas.ecoArm, loop0 = w.loop;
  casDo(w, k, v);
  const ev = w.events.slice(n0).find(e => e.type === 'cas'), armed = (k === 'ecoya' && w.cas.ecoArm !== arm0) || (k === 'pasillo' && w.loop !== loop0);
  const done = !w.cas.retry && (ev || armed || (k === 'doble' && w.hallu !== h0) || (k === 'anomalia' && w.anoms.length > an0));
  if (!done) { blog(w, 'casa', `${tir} → intentó «${CAS_TXT[k]}» con ${v.name}, pero ${w.cas.retryWhy || 'no encontró dónde hacerlo'}: la casona se queda en silencio.`, v); return; }
  w.cas.used.push(k); w.stats.cas = (w.stats.cas || 0) + 1;
  blog(w, 'casa', `${tir} → «${CAS_TXT[k]}» con ${v.name}${note}${armed && k === 'ecoya' ? ' (espera a que hable)' : armed ? ' (espera a que salga del cuarto)' : ''}.`, ev || w.hallu || v);
  if (k === 'anomalia' || armed) return;
  w.cas.pend = { k, t: w.t, who: v.id, p: ev ? { f: ev.f, x: ev.x, y: ev.y } : { f: v.f, x: v.x, y: v.y }, tries };
};

// mejor búsqueda de lugar a la vista: rayos dentro del campo de visión, el más largo que quepa
casPoint = function (w, v, dmin, dmax, needView) {
  const angs = []; for (let k = 0; k < 13; k++) angs.push((k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.09);
  if (!needView) for (let k = 0; k < 12; k++) angs.push(Math.random() * 6.28);
  for (const da of angs) { const ang = (needView ? v.face : 0) + da; let reach = 0;
    for (let s = 0.4; s <= dmax; s += 0.2) { const x = v.x + Math.cos(ang) * s, y = v.y + Math.sin(ang) * s; if (!walkableT(tileAt(v.f, x, y)) || !los(v.f, v.x, v.y, x, y)) break; reach = s; }
    const want = Math.min(reach - 0.5, dmin + Math.random() * (dmax - dmin)); if (want >= Math.max(2.2, dmin * 0.55)) { const p = { f: v.f, x: v.x + Math.cos(ang) * want, y: v.y + Math.sin(ang) * want }; if (!(p.f === 0 && p.y >= 38.5)&&layoutPlacementAllowed(p.f,p.x,p.y,.45)) return p; } }
  return null;
};
// el doble: si no cabe lejos, más cerca
const _makeHallu5 = makeHallu;
makeHallu = function (w, v, viaGhost) { if (_makeHallu5(w, v, viaGhost)) return true; const p = casPoint(w, v, 2.5, 6, true); if (!p) return false; const f0 = v.face; v.face = Math.atan2(p.y - v.y, p.x - v.x); const ok = _makeHallu5(w, v, viaGhost); v.face = f0; return ok; };
// el retrato: busca pared girando poco a poco
const _casRetrato5 = casRetrato;
casRetrato = function (w, v) { const f0 = v.face; for (const da of [0, 0.5, -0.5, 1, -1, 1.57, -1.57, 3.14]) { w.cas.retry = false; v.face = f0 + da; _casRetrato5(w, v); if (!w.cas.retry) break; } v.face = f0; };

// aparatos: la casona usa el más cercano a la guarida del ánima (obliga a ir a buscarlo)
nearDevice = function (w, kind) { const h = ROOM_CENTER[w.g.home.f][w.g.home.r]; return (w.devices || []).filter(d => d.kind === kind).sort((a, b) => (a.f !== h.f ? 60 : 0) + d2(a, h) - ((b.f !== h.f ? 60 : 0) + d2(b, h)))[0]; };

// anomalía: aparece aunque no haya nadie; en su guarida o en cualquier cuarto donde nadie esté mirando
function casAnomalia(w, v) {
  const rooms = ROOM_LIST.filter(r => ROOMS[r.f][r.r].home && ROOM_CENTER[r.f][r.r]); const order = shuffle(rooms.slice()); if (Math.random() < 0.5) order.unshift(w.g.home);
  for (const rr of order.slice(0, 14)) { const p = randomIn(rr.f, rr.r); if (_gAnomaly(w, { f: rr.f, x: p.x, y: p.y, state: 'libre', hunt: null, pres: 99, ready: {}, bot: true, def: w.g.def })) return; }
  w.cas.retry = true; w.cas.retryWhy = 'todos los cuartos estaban vigilados';
}
// rezando: en el cuarto de junto, a la vista desde la puerta, con su veladora
function casRezando5(w, v) {
  const r = roomOf(v); if (r < 0) { w.cas.retry = true; w.cas.retryWhy = 'la persona no está en un cuarto'; return; }
  const opts = shuffle(roomNeighbors(w, v.f, r).filter(n => !isHall(v.f, n.r) && !n.door.closed && los(v.f, v.x, v.y, n.door.x, n.door.y)));
  for (const n of opts) { const dx = n.sideOut.x - n.sideIn.x, dy = n.sideOut.y - n.sideIn.y, l = Math.hypot(dx, dy) || 1;
    for (const s of [2.2, 1.6, 1.1]) { const p = { f: v.f, x: n.sideOut.x + dx / l * s, y: n.sideOut.y + dy / l * s }; if (layoutPlacementAllowed(p.f,p.x,p.y,.45)&&roomAt(p.f, p.x, p.y) === n.r && walkableT(tileAt(p.f, p.x, p.y)) && los(v.f, v.x, v.y, p.x, p.y)) {
      w.lights[v.f][n.r] = 0; w.kneel = Object.assign(p, { until: w.t + 40, char: pick(NAMES)[2] }); w.ev('cas', { k: 'rezando', who: v.id, f: p.f, x: p.x, y: p.y }); return; } } }
  w.cas.retry = true; w.cas.retryWhy = 'no hay un cuarto de junto a la vista';
}
const _casDo5 = casDo;
casDo = function (w, k, v) {
  if (k === 'anomalia') return casAnomalia(w, v);
  if (k === 'rezando') return casRezando5(w, v);
  if (k === 'zaguan') { const near = alive(w).filter(i => !isOutside(i) && i.f === 0 && pathLen(w, i, { f: 0, x: ZAG.x, y: ZAG.y }) < 16); if (near.length) { w.cas.retry = true; w.cas.retryWhy = `${near[0].name} está cerca del zaguán (tiene que ser lejos)`; return; } }
  if (k === 'ecoya') { const last = w.cas.lastTalk[v.id]; if (last !== undefined && w.t - last <= 4) { w.ev('cas', { k, who: v.id, f: v.f, x: v.x, y: v.y }); return; } w.cas.ecoArm = { who: v.id, t0: w.t, until: w.t + 90 }; return; }
  if (k === 'pasillo') { const r = roomOf(v), nb = r >= 0 ? roomNeighbors(w, v.f, r) : [], from = nb.find(n => n.r === v._prev);
    if (r < 0 || nb.length < 2 || !from) { w.cas.retry = true; w.cas.retryWhy = nb.length < 2 ? 'ese cuarto tiene una sola salida' : 'no se sabe por dónde entró'; return; }
    w.loop = { who: v.id, f: v.f, r, from: from.r, loops: 0, max: Math.random() < 0.6 ? 1 : 2, until: w.t + 120 }; return; }
  return _casDo5(w, k, v);
};
// el zaguán se oye en toda la casa
const _casNoticed5 = casNoticed;
casNoticed = function (w, pd) { if (pd.k === 'zaguan') return alive(w).filter(i => !isOutside(i)); return _casNoticed5(w, pd); };

// cada frame de la casona: eco en espera, bucle del cuarto, anomalías que se esfuman
const _casonaTick5 = casonaTick4;
casonaTick4 = function (w, dt) {
  _casonaTick5(w, dt); if (w.phase !== 'night') return;
  for (const i of w.invs) { if (!i.alive) continue; const r = roomOf(i); if (r >= 0 && (r !== i._room || i.f !== i._roomF)) { if (i.f === i._roomF) i._prev = i._room; i._room = r; i._roomF = i.f; } }
  // eco inmediato: espera a que la persona hable y lo repite en cuanto se calla
  const ea = w.cas.ecoArm; if (ea) { const v = w.invs[ea.who], last = w.cas.lastTalk[ea.who];
    if (!v || !v.alive || w.t > ea.until) { w.cas.ecoArm = null; blog(w, 'casa', '   Eco inmediato: nadie habló a tiempo, se perdió.'); }
    else if (last !== undefined && last > ea.t0 && !v.talking && w.t - last > 0.7 && w.t - last < 3) { w.cas.ecoArm = null; w.ev('cas', { k: 'ecoya', who: v.id, f: v.f, x: v.x, y: v.y }); w.haunt(v, CAS_SAN.ecoya); blog(w, 'casa', `   Eco inmediato: repitió lo que dijo ${v.name}.`, v); } }
  // bucle: si sale por otra puerta, vuelve a entrar al mismo cuarto por donde entró
  const L = w.loop; if (L) { const v = w.invs[L.who];
    if (!v || !v.alive || w.t > L.until || w.g.hunt) w.loop = null;
    else if (v.f === L.f) { const r = roomOf(v);
      if (r >= 0 && r !== L.r) {
        if (r === L.from) { w.loop = null; blog(w, 'casa', `   ${v.name} salió del bucle por donde entró.`, v); }
        else if (L.loops < L.max) { const n = roomNeighbors(w, L.f, L.r).find(n => n.r === L.from); if (!n) { w.loop = null; return; }
          v.x = n.sideIn.x; v.y = n.sideIn.y; v.face = Math.atan2(n.sideIn.y - n.door.y, n.sideIn.x - n.door.x); L.loops++; v._prev = L.from; v._room = L.r;
          w.ev('cas', { k: 'bucle', who: v.id, f: v.f, x: v.x, y: v.y, face: v.face }); w.haunt(v, CAS_SAN.bucle); blog(w, 'casa', `   ${v.name} cruzó la puerta… y entró otra vez al mismo cuarto (${L.loops}/${L.max}).`, v); }
        else { w.loop = null; blog(w, 'casa', `   ${v.name} salió del bucle.`, v); } } } }
  // anomalías vistas: 1 de 10 se esfuma un rato después, cuando nadie la mira
  for (const a of w.anoms.slice()) {
    if (!a.ref) a.ref = a.kind === 'puerta' ? w.doors.filter(d => d.f === a.f).sort((p, q) => d2(p, a) - d2(q, a))[0] : w.loose.filter(o => o.f === a.f).sort((p, q) => d2(p, a) - d2(q, a))[0];
    if (a.seen.size && a.vanishAt === undefined) a.vanishAt = Math.random() < 0.1 ? w.t + rnd(8, 20) : null;
    if (a.vanishAt && w.t > a.vanishAt && !alive(w).some(i => i.f === a.f && sees(i, a, 9, w))) { const o = a.ref;
      if (o) { if (a.kind === 'aparece') { o.gone = true; o.h = -30; } else if (a.kind === 'flota') { o.float = false; o.h = 0; } else if (a.kind === 'invertido') o.upside = false; else if (a.kind === 'puerta') { o.closed = !o.closed; o.anim = 1; } }
      w.anoms.splice(w.anoms.indexOf(a), 1); blog(w, 'casa', '   La anomalía que vieron ya no está.', a); }
  }
};

// ================= Bots: investigan con método =================
const EV_TOOL = {}; for (const k of TOOLS) EV_TOOL[ITEMS[k].tool] = k;
const TOOL_ORDER = ['termo', 'emf', 'cam', 'gases', 'espejo', 'grab', 'uv']; // desempate: lo más rápido de leer primero
const RULE_T = { BC: 80, LU: 170, OB: 160, AZ: 210, ES: 240, SU: 160, CE: 160 }; // segundos en la guarida sin verla → la descartan
// lo que creen los bots: confirmadas (botConf + libreta), descartadas (ruled) y candidatas
const candB = w => { const K = botK(w), ru = w.team.ruled || new Set(); return GHOSTS.filter(G => Object.keys(K).every(k => G.ev.includes(k)) && ![...ru].some(k => G.ev.includes(k))); };
// qué herramienta conviene: la que parte mejor a las candidatas (máxima información)
function toolScore(w, kind) { const e = ITEMS[kind].tool, K = botK(w); if (K[e] || (w.team.ruled && w.team.ruled.has(e))) return -1; const c = candB(w), n = c.length, wi = c.filter(G => G.ev.includes(e)).length; return Math.min(wi, n - wi) + (wi ? 0.5 : 0) - TOOL_ORDER.indexOf(kind) * 0.01; }
const bestTools = w => TOOLS.filter(k => toolScore(w, k) >= 0).sort((a, b) => toolScore(w, b) - toolScore(w, a));
// hablar: una frase cada tanto, para no saturar
function bsay(w, b, txt, prio) { const T = w.team; if (!prio && (w.t < (T.talkAt || 0) || w.t < (b.ai.talkAt || 0))) return false; T.talkAt = w.t + 6; b.ai.talkAt = w.t + 14; w.say(`${b.name}: «${txt}»`, 'a'); blog(w, 'equipo', `🗣 ${b.name}: «${txt}»`, b, b.id); return true; }
const rName = (f, r) => ROOMS[f][r].n;

const _newWorld5 = newWorld;
newWorld = function (opt) {
  const w = _newWorld5(opt); w.team.ruled = new Set(); w.team.expo = {}; w.team.claim = {}; w.team.swept = {}; w.team.emfHits = {}; w.stats.order = []; w.stats.falsos = 0; w.stats.descartes = []; w.cas.ecoArm = null; w.loop = null;
  const bots = w.invs.filter(i => i.bot); bots.forEach((b, k) => { b.ai.wantTools = TOOL_ORDER.filter((_, j) => j % bots.length === k).slice(0, 2); b.ai.errDone = Math.random() < 0.4; }); // 6 de cada 10 bots pueden equivocarse una vez
  return w;
};

// explorar: cada bot se apunta un cuarto distinto; si alguien oye algo, van ahí
const _botInv5 = botInv;
botInv = function (w, b, dt) {
  const ai = b.ai, T = w.team;
  // equiparse al inicio: toma justo la herramienta que quiere (no la que le quede más cerca en la mesa)
  if (ai.state === 'gear' && w.phase === 'night' && !w.g.hunt && b.hidden < 0) { const want = ai.wantTools.filter(k => !b.slots.some(s => s && s.kind === k)); const it = w.items.filter(t => !t.holder && want.includes(t.kind)).sort((x, y) => d2(x, b) - d2(y, b))[0];
    if (!it || !b.slots.includes(null)) { ai.state = 'explore'; ai.goal = null; } else { if (it.f === b.f && d2(it, b) < 1.6) { it.x = b.x; it.y = b.y; b.hand = b.slots.indexOf(null); pickUp(w, b); } else moveBot(w, b, approach(it), CFG.walk, dt); return; } }
  if (w.phase === 'night' && !T.home && ai.state === 'explore' && !w.g.hunt && (!ai.goal || ai.think <= 0 || (d2(ai.goal, b) < 0.6 && b.f === ai.goal.f))) {
    for (const k in T.claim) if (T.claim[k].id === b.id || w.t > T.claim[k].until) delete T.claim[k];
    const heard = (w.emfSrc || []).filter(e => w.t - (e.until - 20) < 15 && e.f === b.f && d2(e, b) < 14).pop() || (w.g.lastMan && w.t - w.g.lastMan.t < 10 && w.g.lastMan.f === b.f && d2(w.g.lastMan, b) < 12 ? w.g.lastMan : null);
    let tg = null;
    if (heard) { const r = roomAt(heard.f, heard.x, heard.y); if (r >= 0 && !isHall(heard.f, r)) { tg = { f: heard.f, r }; T.heard = T.heard || {}; T.heard[heard.f + ':' + r] = (T.heard[heard.f + ':' + r] || 0) + 1; bsay(w, b, `Oí algo por ${rName(tg.f, tg.r)}, voy a ver.`); } }
    if (!tg) { const fc = [0, 0]; for (const k in T.claim) fc[+k[0]]++; const fl = fc[0] === fc[1] ? b.f : fc[0] < fc[1] ? 0 : 1; // se reparten los pisos
      const hd = T.heard || {}, sc = h => pathLen(w, b, ROOM_CENTER[h.f][h.r]) + (h.f !== fl ? 40 : 0) - (hd[h.f + ':' + h.r] || 0) * 25 - (T.emfHits[h.f + ':' + h.r] || 0) * 25; // primero donde se oyó algo o marcó el EMF
      const un = HOME_CHOICES.filter(h => !T.claim[h.f + ':' + h.r] && (T.swept[h.f + ':' + h.r] || -999) < w.t - 180).sort((a, c) => sc(a) - sc(c));
      tg = un[0] || pick(HOME_CHOICES); if (un[0] && Math.random() < 0.5) bsay(w, b, `Yo reviso ${rName(tg.f, tg.r)}.`); }
    T.claim[tg.f + ':' + tg.r] = { id: b.id, until: w.t + 40 }; ai.goal = randomIn(tg.f, tg.r); ai.think = 30;
  }
  _botInv5(w, b, dt);
  if (ai.termoDone) for (const k in ai.termoDone) T.swept[k] = Math.max(T.swept[k] || -999, ai.termoDone[k]);
};
// la grabadora solo contesta a oscuras: apagan la luz siempre
const _botStudy5 = botStudy;
botStudy = function (w, b, home, dt, sp) { const st = b.ai.study; if (st && st.kind === 'grab' && b.f === home.f && roomOf(b) === home.r) { const r = roomOf(b); if (w.lights[b.f][r] && SWITCHES[b.f][r]) { toggleLight(w, b); bsay(w, b, 'Apago la luz para la grabadora.'); } } return _botStudy5(w, b, home, dt, sp); };

// reabastecer: toman primero la herramienta que más ánimas descarta
const _botResupply5 = botResupply;
botResupply = function (w, b, dt, sp) {
  const was = b.ai.state, r = _botResupply5(w, b, dt, sp);
  // al salir de la mesa: si trae algo que no es lo que más conviene, lo cambia por la mejor herramienta disponible
  if (was === 'resupply' && b.ai.state !== 'resupply') { const best = bestTools(w).filter(k => !alive(w).some(o => o.slots.some(x => x && x.kind === k))); const pool = best.filter(k => w.items.some(t => !t.holder && t.kind === k && t.f === 0 && t.y >= 50));
    for (let s = 0; s < b.slots.length && pool.length; s++) { const x = b.slots[s]; if (!x || !TOOLS.includes(x.kind) || best.indexOf(x.kind) >= 0 && best.indexOf(x.kind) <= best.indexOf(pool[0])) continue; const t = w.items.find(t => !t.holder && t.kind === pool[0] && t.f === 0 && t.y >= 50); if (!t) break;
      dropItem(w, b, s); Object.assign(x, { f: 0, x: 14.4 + Math.random() * 5, y: 55.3, h: 0.78 }); t.x = b.x; t.y = b.y; t.f = b.f; b.hand = s; pickUp(w, b); pool.shift(); }
    const tk = b.slots.filter(x => x && TOOLS.includes(x.kind)).map(x => ITEMS[x.kind].n.toLowerCase()); if (tk.length) bsay(w, b, `Me llevo ${tk.join(' y ')}.`); }
  return r;
};

// cada medio segundo: exposición de herramientas en la guarida, descartes, EMF que delata, errores y su corrección
const _rulesTick5 = rulesTick;
rulesTick = function (w, dt) {
  _rulesTick5(w, dt); if (w.phase !== 'night' || !w.team) return; const T = w.team; T.acc = (T.acc || 0) + dt; if (T.acc < 0.5) return; const st = T.acc; T.acc = 0;
  const bots = alive(w).filter(i => i.bot), home = T.home;
  // el EMF marcando seguido en el mismo cuarto delata la guarida
  for (const b of bots) { const h = handItem(b); if (!h || h.kind !== 'emf') continue; for (const e of w.emfSrc || []) { if (e.seenBy && e.seenBy.has(b.id)) continue; if (e.f === b.f && d2(e, b) < 4.5 && e.lvl >= 2 && w.t < e.until) { (e.seenBy = e.seenBy || new Set()).add(b.id); const r = roomAt(e.f, e.x, e.y); if (r < 0 || isHall(e.f, r)) continue; const key = e.f + ':' + r; T.emfHits[key] = (T.emfHits[key] || 0) + 1;
    if (e.lvl < 5) bsay(w, b, `EMF ${e.lvl} en ${rName(e.f, r)}. No es 5, pero algo hay.`);
    if (!T.home && T.emfHits[key] >= 3) { T.home = { f: e.f, r }; bsay(w, b, `El EMF marca seguido en ${rName(e.f, r)}: aquí vive.`, true); }
    else if (T.home && !(T.home.f === e.f && T.home.r === r) && T.emfHits[key] >= (T.emfHits[T.home.f + ':' + T.home.r] || 0) + 3 && !Object.keys(botK(w)).length) { T.home = { f: e.f, r }; T.expo = {}; T.ruled.clear(); bsay(w, b, `Creo que nos equivocamos de cuarto: el EMF marca más en ${rName(e.f, r)}. Vamos para allá.`, true); } } } }
  if (home && !T.homeSaid) { T.homeSaid = true; const b = bots[0]; if (b) bsay(w, b, `La guarida es ${rName(home.f, home.r)}. Llevemos el equipo ahí.`, true); w.stats.homeT = w.t; }
  if (!home) return;
  // exposición: herramienta en la guarida (dejada o en la mano) sin resultado → la descartan
  const inHomeP = p => p.f === home.f && roomAt(p.f, p.x, p.y) === home.r, used = new Set();
  for (const it of w.items) if (!it.holder && TOOLS.includes(it.kind) && inHomeP(it)) used.add(it.kind);
  for (const i of alive(w)) { const h = handItem(i); if (h && TOOLS.includes(h.kind) && inHomeP(i) && (h.kind !== 'grab' || !w.lights[i.f][home.r])) used.add(h.kind); }
  const K = botK(w);
  for (const kind of used) { const e = ITEMS[kind].tool; T.expo[e] = (T.expo[e] || 0) + st;
    if (!w.stats.order.some(o => o.k === kind)) { w.stats.order.push({ k: kind, t: Math.round(w.t) }); blog(w, 'equipo', `🧰 Primera vez con ${ITEMS[kind].n} en la guarida (${w.stats.order.length}.º)`, home); }
    if (!K[e] && !T.ruled.has(e) && T.expo[e] > RULE_T[e]) { T.ruled.add(e); w.stats.descartes.push(e); const b = bots[0]; if (b) bsay(w, b, `Llevamos rato con ${ITEMS[kind].n.toLowerCase()} en ${rName(home.f, home.r)} y nada: no creo que sea ${EV[e].n.toLowerCase()}.`, true); } }
  // errores: a veces un bot cree ver algo que no está; luego lo corrige
  for (const b of bots) { if (b.ai.errDone || !(b.f === home.f && roomOf(b) === home.r)) continue; const h = handItem(b); if (!h || !TOOLS.includes(h.kind)) continue; const e = ITEMS[h.kind].tool;
    if (!K[e] && !T.ruled.has(e) && !w.g.def.ev.includes(e) && Math.random() < st / 300) { b.ai.errDone = true; w.botConf = w.botConf || {}; w.botConf[e] = { by: b.name, t: w.t, how: 'creo', wrong: true }; w.stats.falsos++;
      if (w.opt.libreta === 'auto' || !w.invs.some(i => !i.bot)) w.conf[e] = w.botConf[e];
      bsay(w, b, `¡Creo que vi ${EV[e].n.toLowerCase()}!`, true); blog(w, 'equipo', `❌ ${b.name} se equivocó: cree ver ${EV[e].n} (el ánima no la tiene)`, b, b.id); } }
  for (const e in (w.botConf || {})) { const x = w.botConf[e]; if (!x.wrong) continue; if (w.t - x.t > 75 + Math.random() * 60 || !candB(w).length) { delete w.botConf[e]; if (w.conf[e] && w.conf[e].wrong) delete w.conf[e]; const b = bots.find(i => i.name === x.by) || bots[0]; if (b) bsay(w, b, `No… lo volví a revisar: no era ${EV[e].n.toLowerCase()}. Me equivoqué.`, true); } }
  // si nada cuadra, desconfían de sus descartes
  if (!candB(w).length && T.ruled.size) { T.ruled.clear(); T.expo = {}; const b = bots[0]; if (b) bsay(w, b, 'Algo no cuadra. Volvamos a revisar todo.', true); }
};

// decidir: no adivinan; buscan al menos 2 pruebas y se van cuando solo queda una candidata (o se acaba el tiempo)
botTeam = function (w) {
  const bots = alive(w).filter(i => i.bot); if (!bots.length || w.phase !== 'night') return; const K = botK(w), p = Object.keys(K).length, c = candB(w);
  const humansIn = w.invs.some(i => !i.bot && i.alive && !i.escaped), left = w.nightLen - w.t;
  // cuenta en voz alta lo que falta, de vez en cuando
  if (w.team.home && w.t > (w.team.sumAt || 0)) { w.team.sumAt = w.t + 70; const miss = bestTools(w).slice(0, 2).map(k => ITEMS[k].n.toLowerCase()); bsay(w, bots[0], `Llevamos ${p} prueba${p === 1 ? '' : 's'}; quedan ${c.length} ánimas posibles${miss.length ? '. Falta probar ' + miss.join(' y ') : ''}.`); }
  const sure = p >= 3 || (p >= 2 && c.length === 1) , late = p >= 2 && left < 60, forced = left < 25;
  if (!(sure || late || forced)) return;
  const best = c.length ? pick(c) : pick(GHOSTS);
  for (const b of bots) if (!b.leave) { b.guess = best.id; if (!humansIn || left < 60) b.leave = true; }
  if (!w.team.leaveSaid) { w.team.leaveSaid = true; w.stats.leaveP = p; w.stats.leaveC = c.length; w.stats.sure = sure;
    bsay(w, bots[0], sure ? `Tiene que ser ${best.n}. ${humansIn ? 'Cuando quieran, a la camioneta.' : 'Vámonos.'}` : `No estamos seguros… ${c.length > 1 ? 'puede ser ' + c.slice(0, 3).map(x => x.n).join(', ') : best.n}.`, true); }
};

// ---------- Bots: la luz con cabeza (no botar los fusibles) ----------
// al salir de un cuarto que queda vacío, apagan la luz; antes de prender una, si ya casi se botan los fusibles, no la prenden (o apagan la de un cuarto vacío)
const roomEmpty = (w, f, r) => !alive(w).some(i => i.f === f && roomOf(i) === r);
function botLightOff(w, b, f, r, why) { const sw = SWITCHES[f] && SWITCHES[f][r]; if (!sw || !w.lights[f][r]) return false; w.lights[f][r] = 0; w.ev('switch', sw); blog(w, 'equipo', `${b.name} apaga la luz de ${rName(f, r)} (${why})`, b, b.id); return true; }
const _lightUp5 = lightUp;
lightUp = function (w, b) {
  const r = roomOf(b); if (r < 0 || w.lights[b.f][r] || isHall(b.f, r)) return _lightUp5(w, b);
  if (litCount(w) >= (w.lightLimit || 99) - 1) { // ya casi: apaga primero una vacía; si no hay, se queda a oscuras
    const spare = ROOM_LIST.find(x => w.lights[x.f][x.r] && !isHall(x.f, x.r) && roomEmpty(w, x.f, x.r));
    if (!spare || !botLightOff(w, b, spare.f, spare.r, 'para no botar los fusibles')) return; }
  return _lightUp5(w, b);
};
const _rulesTick5b = rulesTick;
rulesTick = function (w, dt) { _rulesTick5b(w, dt); if (w.phase !== 'night') return;
  for (const b of alive(w)) { if (!b.bot) continue; const r = roomOf(b), last = b.ai.lastRoom;
    if (r >= 0 && last && (last.r !== r || last.f !== b.f)) { if (w.lights[last.f][last.r] && !isHall(last.f, last.r) && roomEmpty(w, last.f, last.r) && !(w.team.home && w.team.home.f === last.f && w.team.home.r === last.r && alive(w).some(i => i.ai && i.ai.state === 'watch'))) botLightOff(w, b, last.f, last.r, 'ya no hay nadie'); }
    if (r >= 0) b.ai.lastRoom = { f: b.f, r }; } };

// ---------- al terminar cada cacería, se apagan todas las luces de los cuartos (afuera no) ----------
const _endHunt5 = endHunt;
endHunt = function (w, g) { const was = !!g.hunt && !g.hunt.huida; _endHunt5(w, g); if (!was || g.hunt) return;
  let n = 0; w.lights.forEach((l, f) => l.forEach((v, r) => { if (v && !['afuera', 'afuera1'].includes(ROOMS[f][r].id)) { l[r] = 0; n++; } }));
  if (n) { w.ev('lightsoff', { f: g.f, x: g.x, y: g.y }); blog(w, 'casa', `💡 Terminó la cacería: se apagaron todas las luces (${n}).`); } };
// zaguán: solo si no hay nadie vivo afuera de la casona (los muertos no cuentan)
const _casDo5z = casDo;
casDo = function (w, k, v) { if (k === 'zaguan' && alive(w).some(i => isOutside(i) && !i.escaped)) { w.cas.retry = true; w.cas.retryWhy = 'hay alguien afuera de la casona'; return; } return _casDo5z(w, k, v); };
