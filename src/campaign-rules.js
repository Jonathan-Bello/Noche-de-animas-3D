// ================= Campaña (prueba P1 del GDD v2): cuartos tapiados y guarida sorteada con pesos =================
// opt.camp = { open:[códigos de módulo abiertos], last: código abierto más reciente, prev: código de la guarida anterior (si el ánima se quedó) }
const CAMP_INITIAL = ['B08', 'B04', 'B11', 'B13', 'B14', 'B12']; // Comedor, Cocina, Despacho, Portería, Botica (en vez de Despensa seca: solo se entra por la Biblioteca), Zaguán
const CAMP_MOD = new Map((NDALayout.roomModules || []).map(m => [m.id, m]));
const campModOf = (f, r) => (ROOMS[f][r] && ROOMS[f][r].code) || null;
// ¿está abierto este cuarto? la planta alta solo existe si se restauró la escalera principal
function campRoomOpen(open, f, r) {
  if (f === 1 && !open.has('B07')) return false;
  const code = campModOf(f, r); if (!code || !CAMP_MOD.has(code)) return true; // pasillos, patio, galería, afuera
  return open.has(code) || (code === 'A07' && open.has('B07'));
}
const CAMP_FULL_RL = ROOM_LIST.slice(), CAMP_FULL_HC = HOME_CHOICES.slice();
// sorteo de guarida (GDD v2 §3): favorito ×2, último abierto ×0,5, guarida anterior 0
function campPickHome(w, camp, def) {
  const opts = HOME_CHOICES.map(h => { const code = campModOf(h.f, h.r), m = CAMP_MOD.get(code); let wt = 1;
    if (m && m.favorite === def.id) wt *= 2; if (code && code === camp.last) wt *= 0.5; if (code && code === camp.prev) wt = 0; return { h, wt }; }).filter(o => o.wt > 0);
  if (!opts.length) return pick(HOME_CHOICES); let s = opts.reduce((a, o) => a + o.wt, 0) * Math.random(); for (const o of opts) { s -= o.wt; if (s <= 0) return o.h; } return opts[opts.length - 1].h;
}
const _newWorldCamp = newWorld;
newWorld = function (opt) {
  ROOM_LIST.splice(0, ROOM_LIST.length, ...CAMP_FULL_RL); HOME_CHOICES.splice(0, HOME_CHOICES.length, ...CAMP_FULL_HC);
  const camp = opt && opt.camp; if (!camp) return _newWorldCamp(opt);
  const open = new Set(camp.open); const keep = r => campRoomOpen(open, r.f, r.r);
  const rl = CAMP_FULL_RL.filter(keep), hc = CAMP_FULL_HC.filter(keep);
  ROOM_LIST.splice(0, ROOM_LIST.length, ...rl); HOME_CHOICES.splice(0, HOME_CHOICES.length, ...hc);
  const w = _newWorldCamp(opt); w.camp = { open, sealedDoors: [] };
  // puertas tapiadas: cualquier puerta que toque un cuarto cerrado; nadie las cruza (tampoco el ánima)
  const doorDefs = new Map(NDALayout.doors.map(d => [d.id, d])); const sideOpen = (key, f) => { if (!key || key === 'base') return true; const lr = LAYOUT_ROOMS.get(key); if (lr) return campRoomOpen(open, lr.f, lr.r); const r = RID[f] && RID[f][key]; return r === undefined ? (f === 0 || open.has('B07')) : campRoomOpen(open, f, r); };
  const gT = [], iT = []; // casillas vedadas: el ánima (que atraviesa muros fuera de cacería) no entra a ningún cuarto tapiado
  for (const d of w.doors) { const dd = doorDefs.get(d.id); if (!dd || (sideOpen(dd.a, dd.floor) && sideOpen(dd.b, dd.floor))) continue;
    d.sealed = true; d.closed = true; d.locked = true; w.camp.sealedDoors.push(d); for (const [x, y] of d.tiles) { const n = d.f * FL + y * W + x; gT.push(n); iT.push(n); } }
  // escaleras: la principal hasta restaurarla; la de servicio hasta abrir el cuarto de la nana
  STAIR_PATHS.forEach((paths, k) => { const ok = k === 0 ? open.has('B07') : open.has('B07') && open.has('A04'); if (ok) return; w.camp.stairsShut = (w.camp.stairsShut || []).concat(k);
    for (const [x, y] of paths.flat()) for (const f of [0, 1]) { const n = f * FL + y * W + x; gT.push(n); iT.push(n); } });
  for (const f of [0, 1]) for (let n = 0; n < FL; n++) { const r = roomGrid[f][n]; if (r >= 0 && !campRoomOpen(open, f, r)) gT.push(f * FL + n); }
  w.camp.gT = Int32Array.from(gT); w.camp.iT = Int32Array.from(iT); campMasks(w);
  // escondites solo en cuartos abiertos
  for (const k of [...w.spotsActive]) { const s = SPOTS[k]; if (s && !campRoomOpen(open, s.f, s.room)) w.spotsActive.delete(k); }
  // guarida sorteada con los pesos de la campaña
  const g = w.g, h = campPickHome(w, camp, g.def); g.home = { f: h.f, r: h.r }; const p = randomIn(h.f, h.r); g.f = h.f; g.x = p.x; g.y = p.y; w.camp.homeCode = campModOf(h.f, h.r);
  return w;
};
function campMasks(w) { if (!w.camp) return; for (const n of w.camp.gT) w.ghostMask[n] = 1; for (const n of w.camp.iT) w.invMask[n] = 1; w.ghostMaskVer++; w.invMaskVer++; }
const _rebuildMasksCamp = rebuildMasks;
rebuildMasks = function (w) { _rebuildMasksCamp(w); campMasks(w); };
// que ninguna regla ni anomalía abra una puerta tapiada
const _rulesTickCamp = rulesTick;
rulesTick = function (w, dt) { _rulesTickCamp(w, dt); if (w.camp) for (const d of w.camp.sealedDoors) { d.closed = true; d.locked = true; } };
const _interactCamp = interact;
interact = function (w, i) {
  if (w.camp && i && !i.bot) { const d = w.camp.sealedDoors.find(d => d.f === i.f && d2(d, i) < 1.6 && angDiff(Math.atan2(d.y - i.y, d.x - i.x), i.face) < 0.8);
    if (d) { w.actor = i; w.say('Está tapiada con tablas. Se abre al liberar ánimas.', 'i'); w.actor = null; return 'tapiada'; } }
  return _interactCamp(w, i);
};
// los vecinos de un cuarto no cuentan puertas tapiadas (ronda del ánima, rezo, bucle)
const _homeNeighborsCamp = homeNeighbors;
homeNeighbors = function (w, h) { const out = _homeNeighborsCamp(w, h); return w.camp ? out.filter(o => campRoomOpen(w.camp.open, o.f, o.r)) : out; };
const _roomNeighborsCamp = roomNeighbors;
roomNeighbors = function (w, f, r) { const out = _roomNeighborsCamp(w, f, r); return w.camp ? out.filter(n => !n.door.sealed && campRoomOpen(w.camp.open, f, n.r)) : out; };

// ---------- ofertas de cuartos: 3 al azar con puerta a lo abierto + la escalera ----------
function campOffers(openArr, seed) {
  const open = new Set(openArr); const isOpenKey = (key, f) => { if (CAMP_MOD.has(key)) return open.has(key) || (key === 'A07' && open.has('B07')); return f === 0 || open.has('B07'); };
  const cands = [...CAMP_MOD.values()].filter(m => m.purchasable && !open.has(m.id) && m.id !== 'B07' && !['A01', 'A03'].includes(m.id) && // Desván y Coro: Noche grande
    NDALayout.doors.some(d => (d.a === m.id && isOpenKey(d.b, d.floor)) || (d.b === m.id && isOpenKey(d.a, d.floor))));
  let s = seed || 1; const rnd2 = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const sh = cands.slice().sort(() => rnd2() - 0.5).slice(0, 3).map(m => m.id);
  if (!open.has('B07')) sh.push('B07'); return sh;
}
const campRoomName = code => { const lr = LAYOUT_ROOMS.get(code); return lr ? ROOMS[lr.f][lr.r].n : code; };
const campComplement = code => { const m = CAMP_MOD.get(code); const c = m && m.complement; const TXT = { escapeExit: 'segunda salida', upperFloor: 'abre la planta alta', 'lightLimit+1': '+1 al límite de luces' }; return c && c.length ? c.map(k => (ITEMS[k] && ITEMS[k].n) || TXT[k] || k).join(', ') : ''; };
