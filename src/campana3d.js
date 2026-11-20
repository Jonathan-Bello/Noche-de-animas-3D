// ================= Campaña (prueba P1): guardado del anfitrión, siguiente noche y elección de cuartos =================
const CAMP_KEY = 'nda_campana_p1', CAMP_SIZE = 6, CAMP_KEYS_PER = 3;
function campLoad() { try { return JSON.parse(localStorage.getItem(CAMP_KEY) || 'null'); } catch (e) { return null; } }
function campSave(c) { try { localStorage.setItem(CAMP_KEY, JSON.stringify(c)); } catch (e) {} }
function campNew() {
  const pool = shuffle(GHOSTS.filter(G => G.id !== 'charro').map(G => G.id)).slice(0, CAMP_SIZE);
  const c = { v: 1, size: CAMP_SIZE, pool: pool.slice(1), active: pool[0], freed: [], night: 1, keys: 0, open: CAMP_INITIAL.slice(), last: null, prev: null, homes: [], done: false, offers: null };
  campSave(c); return c;
}
function campStatus(c) { if (!c) return 'Sin campaña guardada.'; if (c.done) return `Campaña terminada: ${c.freed.length}/${c.size} liberadas. Falta la Noche grande (prueba P3).`;
  return `Noche ${c.night} · liberadas ${c.freed.length}/${c.size} · ${c.open.length} cuartos abiertos${c.keys ? ` · ${c.keys} llave${c.keys > 1 ? 's' : ''} sin usar` : ''}`; }
// arrancar la noche: la campaña fija el ánima y los cuartos abiertos
const _startCamp = start;
start = function (netStart) {
  if (menuOpt.modo !== 'campana' || NET.mode === 'guest' || netStart) return _startCamp(netStart);
  let c = campLoad(); if (!c || c.done) c = campNew();
  const g0 = menuOpt.ghost; menuOpt.ghost = c.active; menuOpt.camp = { open: c.open, last: c.last, prev: c.prev };
  try { _startCamp(netStart); } finally { menuOpt.ghost = g0; delete menuOpt.camp; }
};
// al terminar: liberada o se queda; llaves y cuartos
const _showEndCamp = showEnd;
showEnd = function () {
  _showEndCamp(); if (!w || !w.opt.camp) return; const box = document.createElement('div'); box.className = 'campbox';
  if (NET.mode === 'guest') { box.innerHTML = '<p>Campaña: el anfitrión elige los cuartos.</p>'; $('#modalIn').appendChild(box); return; }
  let c = campLoad(); if (!c) return;
  if (!w._campDone) { w._campDone = true; const freed = w.over && w.over.win === 'inv'; const id = w.g.def.id;
    c.homes.push({ night: c.night, ghost: id, home: w.camp.homeCode, last: c.last, freed: !!freed, t: Math.round(w.t), open: c.open.length });
    if (freed) { c.freed.push(id); c.keys += CAMP_KEYS_PER; c.prev = null; c.active = c.pool.shift() || null; if (!c.active) c.done = true; }
    else c.prev = w.camp.homeCode; // se queda y se muda
    c.night++; c.offers = c.keys ? campOffers(c.open, c.night * 7919 + c.open.length) : null; campSave(c);
    box.dataset.res = freed ? 'ok' : 'no'; }
  const render = () => { c = campLoad();
    const last = c.homes[c.homes.length - 1] || {};
    let h = `<h3>Campaña</h3><p>${last.freed ? `<b>${GT[last.ghost].n}</b> quedó liberada.` : `<b>${GT[last.ghost] ? GT[last.ghost].n : 'El ánima'}</b> se queda en la casona y mañana estará en otro cuarto.`} ${campStatus(c)}</p>`;
    if (c.keys && c.offers && c.offers.length) h += `<p>Usa una llave para destapiar un cuarto (${c.keys} disponible${c.keys > 1 ? 's' : ''}):</p><div class="btns">` + c.offers.map(code => `<button data-camp-room="${code}">${campRoomName(code)}${campComplement(code) ? `<small> · ${campComplement(code)}</small>` : ''}</button>`).join('') + '</div>';
    if (c.done) h += '<p>Las 6 ánimas están libres. La Noche grande con el Charro Negro llega en la prueba P3.</p>';
    h += `<p class="small"><button class="ghostbtn" data-camp-new>Empezar campaña nueva</button></p>`; box.innerHTML = h;
    const again = $('#again'); if (again) again.textContent = c.done ? 'Nueva campaña' : 'Siguiente noche'; };
  box.addEventListener('click', e => { const b = e.target.closest('[data-camp-room]'); if (b) { const cc = campLoad(); if (cc.keys > 0 && !cc.open.includes(b.dataset.campRoom)) { cc.open.push(b.dataset.campRoom); cc.last = b.dataset.campRoom; cc.keys--; cc.offers = cc.keys ? campOffers(cc.open, cc.night * 7919 + cc.open.length) : null; campSave(cc); } render(); return; }
    if (e.target.closest('[data-camp-new]')) { campNew(); render(); } });
  $('#modalIn').appendChild(box); render();
};
