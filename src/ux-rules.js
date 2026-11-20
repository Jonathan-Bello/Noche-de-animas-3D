// ================= v1.8: colocar objetos como en Phasmophobia, ruda solo en puertas, kit doble =================
// colocar en un punto elegido (mantener G): la lógica valida lo que el cliente propone
const PLACE_R = 2.6;
function placeOk(w, i, p) {
  if (!p || p.f !== i.f || Math.hypot(p.x - i.x, p.y - i.y) > PLACE_R || !los(i.f, i.x, i.y, p.x, p.y)) return false;
  const t = tileAt(p.f, p.x, p.y); return walkableT(t) || t === T.TABLE;
}
function doorFor(w, i, p) { return w.doors.filter(d => d.f === i.f && !d.sealed && d2(d, p) <= 1.4 && d2(d, i) <= PLACE_R).sort((a, b) => d2(a, p) - d2(b, p))[0]; }
function placeAt(w, i, p) {
  const it = handItem(i); if (!it) return false;
  if (it.kind === 'ruda' || it.kind === 'rosario') { const d = doorFor(w, i, p); w.actor = i;
    if (!d) { w.say(it.kind === 'ruda' ? 'La ruda solo se cuelga en una puerta.' : 'El rosario se cuelga en una puerta.', 'i'); w.actor = null; return false; }
    const ox = i.x, oy = i.y; i.x = d.x + (i.x - d.x) * 0.01; i.y = d.y + (i.y - d.y) * 0.01; // colgar en esa puerta
    const ok = it.kind === 'ruda' ? useItemRaw(w, i) : hangRosary(w, i); i.x = ox; i.y = oy; w.actor = null; return ok; }
  if (!placeOk(w, i, p)) { if (!i.bot) { w.actor = i; w.say('Ahí no cabe: busca piso libre o una mesa a la vista.', 'i'); w.actor = null; } return false; }
  const k = i.hand, h = tileAt(p.f, p.x, p.y) === T.TABLE ? 0.78 : 0;
  if (it.kind === 'ceniza') { i.slots[k] = null; it.holder = null; const k2 = w.items.indexOf(it); if (k2 >= 0) w.items.splice(k2, 1); scatterAsh(w, { f: p.f, x: p.x, y: p.y }); w.ev('act', { who: i.id, kind: 'drop' }); if (!i.bot) { w.actor = i; w.say('Riegas la ceniza en el piso.', 'i'); w.actor = null; } return true; }
  if (!dropItem(w, i, k)) return false; it.x = p.x; it.y = p.y; it.h = h; it.dir = p.face !== undefined ? p.face : i.face; return true;
}
// la ruda ya no se deja en el piso: con G (sin punto) se cuelga en la puerta de al lado o no pasa nada
const _dropItemUx = dropItem;
dropItem = function (w, i, k) { const it = i.slots[k];
  if (it && it.kind === 'ruda') { const d = w.doors.find(d => d.f === i.f && !d.sealed && d2(d, i) <= 1.6); if (!d) { if (!i.bot) { w.actor = i; w.say('La ruda solo se cuelga en una puerta.', 'i'); w.actor = null; } return false; } const hk = i.hand; i.hand = k; const ok = useItemRaw(w, i); if (!ok) i.hand = hk; return ok; }
  return _dropItemUx(w, i, k); };
// kit doble: dos de cada herramienta en la camioneta (las cámaras ya son 3)
const _newWorldUx = newWorld;
newWorld = function (opt) { const w = _newWorldUx(opt); const base = w.items.filter(it => TOOLS.includes(it.kind) && it.kind !== 'cam' && !it.holder);
  const kinds = [...new Set(base.map(it => it.kind))]; for (const k of kinds) { const it = newItem(k, { f: 0, x: 0, y: 0 }); w.items.push(it); }
  const all = w.items.filter(it => (TOOLS.includes(it.kind) && it.kind !== 'cam') || it.kind === 'fotocam').filter(it => !it.holder && it.f === 0 && (it.y >= 50 || (it.x === 0 && it.y === 0)));
  all.forEach((it, k) => Object.assign(it, { f: 0, x: 14.4 + (k % 7) * 0.82, y: 55.15 + Math.floor(k / 7) * 0.38, h: 0.78 }));
  return w; };
