// ================= v1.8 · UI/UX: herramientas en la mano, colocar con sombra y aro, zoom a la tele, libreta animada =================
(() => { const st = document.createElement('style'); st.textContent = `
#top{font-size:16px!important;padding:8px 20px!important}
#left{width:380px!important;font-size:15px!important}
.slot{padding:8px 10px!important;min-height:44px;font-size:15px!important}
#tool{font-size:17px!important;bottom:62px!important}
#tool .vmnote{display:flex;flex-direction:column;align-items:center;gap:2px;white-space:normal;max-width:420px;text-align:center}
#tool .vmnote b{font-size:17px}#tool .vmnote small{font-size:15px;opacity:.9}
#prompt{font-size:18px!important}
#journal{width:440px!important;font-size:15px!important;transform:translateX(36px) scale(.98);opacity:0;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s}
#journal.jopen{transform:none;opacity:1}
#journal .ev{min-height:46px;padding:6px 10px;border-radius:8px;user-select:none;transition:background .12s,transform .08s}
#journal .ev:hover{background:rgba(242,176,78,.12)}#journal .ev:active{transform:scale(.98)}
#journal .ev b{min-width:34px;text-align:center;font-size:18px;padding:4px 8px}
#journal .cand{min-height:40px;padding:4px 6px}#journal .gx{min-width:34px;min-height:30px}
#quit,#jbtn,#mute,#volBtn{width:46px!important;height:46px!important;font-size:18px!important}
#journal .gx{min-width:40px!important;min-height:36px!important}#blogBtn{min-height:40px!important;font-size:14px!important}
#ruleta button,#modal button{min-height:44px}
#mini span{font-size:15px!important}#left .row,#left span,#left em{font-size:14.5px!important}#feed div{font-size:15px!important}
#hint kbd,#lockhint kbd{font-size:13px!important}#journalIn small{font-size:13px!important}#journalIn p.small{font-size:14px!important}#roomTag div{font-size:13.5px!important}
#uiHint{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);background:rgba(18,13,34,.88);border:1px solid rgba(242,176,78,.4);border-radius:10px;padding:8px 14px;font-size:17px;z-index:5;pointer-events:none}
#uiHint[hidden]{display:none}#uiHint kbd{background:#2a1a24;border:1px solid #5a3a4a;border-radius:6px;padding:1px 7px}
`; document.head.appendChild(st);
  const hint = document.createElement('div'); hint.id = 'uiHint'; hint.hidden = true; ($('#game') || document.body).appendChild(hint); })();
function uiHint(html) { const h = $('#uiHint'); if (!h) return; if (!html) { h.hidden = true; return; } if (h.innerHTML !== html) h.innerHTML = html; h.hidden = false; }
function uiMenuOpen() { const vp = $('#volPanel'), bl = $('#blogList'); return (vp && !vp.hidden) || (bl && !bl.hidden); }
const uiMe = () => (w && w.opt.role === 'inv' && ME >= 0 ? w.invs[ME] : null);

// ---------- libreta: animación, sin perder clics ni el scroll ----------
let jDown = false, jLast = '', jHover = false, jT = 0;
$('#journal').addEventListener('pointerdown', () => { jDown = true; }); $('#journal').addEventListener('pointerenter', () => { jHover = true; }); $('#journal').addEventListener('pointerleave', () => { jHover = false; }); addEventListener('pointerup', () => setTimeout(() => { jDown = false; }, 0));
function uiJournalRefresh() { if (jDown || jHover || !w || performance.now() - jT < 1000) return; jT = performance.now(); /* con el puntero encima, la libreta no cambia bajo el dedo */ const h = journalHTML(false); if (h === jLast) return; const j = $('#journal'), sc = j.scrollTop; $('#journalIn').innerHTML = h; jLast = h; j.scrollTop = sc; }
toggleJournal = function () { journalOpen = !journalOpen; const j = $('#journal');
  if (journalOpen) { freeMouse(); jLast = ''; uiJournalRefresh(); j.hidden = false; j.classList.remove('jopen'); void j.offsetWidth; j.classList.add('jopen'); }
  else { j.classList.remove('jopen'); setTimeout(() => { if (!journalOpen) j.hidden = true; }, 230); } };
$('#journal').addEventListener('click', () => { jLast = $('#journalIn').innerHTML; }, true);

// ---------- herramientas en la mano (vista cercana, con su propia luz) ----------
const VM = { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(40, 1, 0.01, 10), pivot: new THREE.Group(), g: null, kind: null, patchedFor: null, rt: null, rtCam: new THREE.PerspectiveCamera(62, 4 / 3, 0.05, 40), screen: null, mirrorRT: null, frame: 0 };
VM.scene.add(new THREE.AmbientLight(0xffffff, 1.0)); { const d = new THREE.DirectionalLight(0xffe8c8, 1.3); d.position.set(-1, 2, 2); VM.scene.add(d); } VM.scene.add(VM.pivot);
function vmPatch() { if (!renderer || VM.patchedFor === renderer) return; const orig = renderer.render.bind(renderer); VM.patchedFor = renderer;
  renderer.render = (s, c) => { orig(s, c); if (s === scene && c === camera && VM.g && VM.pivot.visible && !renderer.getRenderTarget()) { VM.cam.aspect = camera.aspect; VM.cam.updateProjectionMatrix(); const ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth(); orig(VM.scene, VM.cam); renderer.autoClear = ac; } }; }
function vmSet(kind) {
  if (VM.g) { VM.pivot.remove(VM.g); NDAToolArt.dispose(VM.g); VM.g = null; } if (VM.screen) { VM.pivot.remove(VM.screen); VM.screen = null; }
  VM.kind = kind; if (!kind) return; const g = NDAToolArt.create(kind); if (!g) return; VM.g = g;
  const box = new THREE.Box3().setFromObject(g), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3()), k = 0.13 / Math.max(size.x, size.y, size.z, 0.01);
  g.scale.setScalar(k); g.position.copy(c).multiplyScalar(-k); VM.pivot.add(g); VM.size = size.clone().multiplyScalar(k);
  if (kind === 'cam') { if (!VM.rt) VM.rt = new THREE.WebGLRenderTarget(256, 192); VM.screen = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.06), new THREE.MeshBasicMaterial({ map: VM.rt.texture, color: 0xc8ffd0 })); VM.screen.position.set(-VM.size.x / 2 - 0.05, 0.015, 0.01); VM.screen.rotation.y = 0.35; VM.pivot.add(VM.screen); }
  if (kind === 'espejo') { if (!VM.mirrorRT) VM.mirrorRT = new THREE.WebGLRenderTarget(192, 192); const glass = g.userData.tool.glass; if (glass) { glass.material = glass.material.clone(); glass.material.map = VM.mirrorRT.texture; VM.mirrorRT.texture.wrapS = THREE.RepeatWrapping; VM.mirrorRT.texture.repeat.x = -1; glass.material.needsUpdate = true; } }
}
function vmUpdate(t) {
  vmPatch(); const me = uiMe(); const it = me && me.alive && me.hidden < 0 ? handItem(me) : null; const kind = it && NDAToolArt.kinds.includes(it.kind) ? it.kind : null;
  if (kind !== VM.kind) vmSet(kind);
  VM.pivot.visible = !!VM.g && !journalOpen && !TZ.on && !PL.on && $('#modal').hidden && w.opt.role === 'inv'; if (!VM.pivot.visible) return;
  const V = me, rig = invMeshes[ME], mv = rig ? Math.min(1, rig.speed / 2.6) : 0;
  VM.pivot.position.set(0.24 * Math.min(1.4, camera.aspect / 1.6), -0.1 + Math.sin(t * 7) * 0.005 * mv, -0.55); VM.pivot.rotation.set(0.1, -0.32 + Math.sin(t * 3.5) * 0.02 * mv, 0);
  NDAToolArt.update(VM.g, it, w.t, true, { termo: me.termo, uvVisible: me.flash });
  VM.frame++;
  if (kind === 'cam' && VM.rt && VM.frame % 2 === 0) { VM.rtCam.position.copy(camera.position); VM.rtCam.quaternion.copy(camera.quaternion); VM.rtCam.updateMatrixWorld(); renderer.setRenderTarget(VM.rt); renderer.render(scene, VM.rtCam); renderer.setRenderTarget(null); }
  if (kind === 'espejo' && VM.mirrorRT && VM.frame % 3 === 0) { const fx = Math.cos(yaw), fy = Math.sin(yaw), y0 = elv(V) + 1.45; VM.rtCam.position.set(V.x + fx * 0.9, y0, V.y + fy * 0.9); VM.rtCam.lookAt(V.x, y0 - 0.1, V.y); renderer.setRenderTarget(VM.mirrorRT); renderer.render(scene, VM.rtCam); renderer.setRenderTarget(null); }
}
// el panel de abajo ya no dibuja la pantalla: solo dice qué es y qué hacer (la lectura está en el aparato)
const _toolReadoutUx = toolReadout;
toolReadout = function (me) { const it = handItem(me); if (it && me.alive && NDAToolArt.kinds.includes(it.kind) && VM.g && w.opt.role === 'inv') { const s = NDAToolArt.read(it.kind, it, w.t, { termo: me.termo, held: true }); const name = (NDAToolComponents.tools[it.kind] || {}).name || ITEMS[it.kind].n;
  const tip = { cam: '', espejo: 'Mantén G para dejarlo', gases: 'Mantén G para dejarlo', emf: 'Acércalo a donde pasó algo', termo: 'Quieto 8 s para leer', grab: 'Espacio: preguntar (a oscuras)', uv: 'Apunta a puertas y ceniza' }[it.kind] || '';
  return `<div class="dev vmnote"><b>${name}</b><small>${s.message || s.label}${tip ? ' · ' + tip : ''}</small></div>`; } return _toolReadoutUx(me); };

// ---------- colocar como en Phasmophobia: mantener G, sombra del objeto y aro del área de efecto ----------
const PL = { on: false, face: 0, p: null, ok: false, grp: null, ring: null, kind: null, req: null, door: null };
const PLACE_RING = { cruz: 4, vela: 3, ceniza: 0.8, pan: 1.3, espejo: 5, gases: 3, emf: 2.2, grab: 6, uv: 4.2, radio: 4, muneca: 3, pentagrama: 2, ruda: 0.9, rosario: 0.9, cam: 8 };
function uiTakePlace() { const r = PL.req; PL.req = null; return r; }
function plStart(me) { const it = handItem(me); PL.on = true; PL.kind = it.kind; PL.face = yaw; PL.grp = new THREE.Group(); scene.add(PL.grp);
  let ghost = NDAToolArt.kinds.includes(it.kind) ? NDAToolArt.create(it.kind) : null;
  if (!ghost) { ghost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), new THREE.MeshBasicMaterial({ color: 0xf2e6cf })); ghost.position.y = 0.11; }
  ghost.traverse(o => { if (o.isMesh) { o.material = (Array.isArray(o.material) ? o.material[0] : o.material).clone(); o.material.transparent = true; o.material.opacity = 0.45; o.material.depthWrite = false; o.castShadow = false; } });
  PL.ghost = ghost; PL.grp.add(ghost); const r = PLACE_RING[it.kind] || 0.6;
  const geo = it.kind === 'cam' ? new THREE.CircleGeometry(r, 24, -Math.PI / 6, Math.PI / 3) : new THREE.RingGeometry(Math.max(0.05, r - 0.06), r, 64);
  PL.ring = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x6ad07a, transparent: true, opacity: it.kind === 'cam' ? 0.18 : 0.55, side: THREE.DoubleSide, depthWrite: false })); PL.ring.rotation.x = -Math.PI / 2; PL.ring.position.y = 0.03; PL.grp.add(PL.ring); }
function plEnd(cancel) { if (!PL.on) return; PL.on = false; if (PL.grp) { scene.remove(PL.grp); PL.grp.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); PL.grp = null; }
  if (cancel) return; const me = uiMe(); if (!me) return;
  if (PL.ok) { PL.req = { f: PL.p.f, x: PL.p.x, y: PL.p.y, face: PL.face }; pressed.add('g'); } else toast(PL.kind === 'ruda' || PL.kind === 'rosario' ? 'Solo se cuelga en una puerta' : 'Ahí no se puede dejar', '', 1.6); }
function plUpdate() { const me = uiMe(); if (!PL.on) return; if (!me || !me.alive || !handItem(me)) { plEnd(true); return; }
  const d = clamp(1.6 + pitch * 4, 0.6, 2.4), p = { f: me.f, x: me.x + Math.cos(yaw) * d, y: me.y + Math.sin(yaw) * d };
  if (PL.kind === 'ruda' || PL.kind === 'rosario') { const dr = doorFor(w, me, p); PL.ok = !!dr; if (dr) { p.x = dr.x; p.y = dr.y; } }
  else PL.ok = placeOk(w, me, p);
  PL.p = p; const h = tileAt(p.f, p.x, p.y) === T.TABLE ? 0.78 : 0; PL.grp.position.set(p.x, elv(p) + h, p.y); PL.ghost.rotation.y = -PL.face + Math.PI / 2;
  PL.ring.rotation.z = PL.kind === 'cam' ? -PL.face : 0; PL.ring.material.color.set(PL.ok ? 0x6ad07a : 0xd05a4a);
  uiHint(`Suelta <kbd>G</kbd> para ${PL.kind === 'ruda' || PL.kind === 'rosario' ? 'colgarlo en la puerta' : 'dejarlo'} · rueda: girar · el aro es su alcance`); }

// ---------- acercarse a la tele de la base: se agacha y la pantalla llena la vista ----------
const TZ = { on: false, k: -1 };
function tzNear(me) { if (!me || me.f !== 0 || typeof BASE_TVS === 'undefined') return -1; let best = -1, bd = 1.9; BASE_TVS.forEach((p, k) => { const dd = Math.hypot(me.x - p.x, me.y - p.y); if (dd < bd && angDiff(Math.atan2(p.y - me.y, p.x - me.x), yaw) < 1.0) { bd = dd; best = k; } }); return best; }
function tzSet(on, k) { TZ.on = on; if (on) { TZ.k = k; keys.clear(); } else { const rig = invMeshes[ME]; if (rig && rig.g) rig.g.visible = true; if (w) for (const it of w.items) { const im = itemMeshes.get(it.id); if (im) im.g.visible = true; } } const tv = baseTVs && baseTVs[TZ.k]; if (tv && tv.rt) tv.rt.setSize(on ? 320 : 160, on ? 240 : 120); }
const _updateCameraUx = updateCamera;
updateCamera = function (dt) { _updateCameraUx(dt); if (!TZ.on || !w) return; const p = BASE_TVS[TZ.k]; if (!p) { TZ.on = false; return; }
  const rig = invMeshes[ME]; if (rig && rig.g) rig.g.visible = false; const pr = $('#prompt'); if (pr) pr.innerHTML = ''; const lh = $('#lockhint'); if (lh) lh.hidden = true;
  for (const it of w.items) if (it.onTable && !it.holder) { const im = itemMeshes.get(it.id); if (im) im.g.visible = false; } // las cámaras de la mesa no tapan la tele
  const want = new THREE.Vector3(p.x, 1.2, p.y + 0.7); camera.position.lerp(want, Math.min(1, dt * 6)); camPos.copy(camera.position); camera.lookAt(p.x, 1.17, p.y); if (camera.fov !== 40) { camera.fov = 40; camera.updateProjectionMatrix(); } };
const _animateCharacterUx = animateCharacter;
animateCharacter = function (r, st) { if (TZ.on && w && invMeshes[ME] === r) st = Object.assign({}, st, { hidden: true }); return _animateCharacterUx(r, st); };

// ---------- teclas: G (colocar), E (tele), Esc (cerrar), rueda (girar al colocar) ----------
addEventListener('keydown', e => { if (!running || !w) return; const k = e.key.toLowerCase(), me = uiMe();
  if (k === 'escape' && journalOpen) { toggleJournal(); e.preventDefault(); return; }
  if (TZ.on && ['w', 'a', 's', 'd', 'e', 'escape', 'arrowup', 'arrowdown'].includes(k)) { tzSet(false); e.stopImmediatePropagation(); e.preventDefault(); return; }
  if (!me || journalOpen) return;
  if (k === 'g' && me.alive && handItem(me) && w.opt.role === 'inv') { e.stopImmediatePropagation(); e.preventDefault(); if (!PL.on && !e.repeat) plStart(me); return; }
  if (k === 'e' && me.alive && !e.repeat) { const t = tzNear(me); if (t >= 0) { tzSet(true, t); e.stopImmediatePropagation(); e.preventDefault(); } }
}, true);
addEventListener('keyup', e => { if (e.key.toLowerCase() === 'g' && PL.on) { e.stopImmediatePropagation(); plEnd(false); } }, true);
addEventListener('wheel', e => { if (PL.on) { PL.face += e.deltaY > 0 ? 0.3 : -0.3; e.stopImmediatePropagation(); } }, { capture: true, passive: true });
addEventListener('blur', () => { if (PL.on) plEnd(true); });

// cada cuadro, antes de dibujar
const _updateSceneUx = updateScene;
updateScene = function (t, dt) { _updateSceneUx(t, dt); try { plUpdate(); vmUpdate(t); const me = uiMe();
  if (!PL.on) { if (TZ.on) uiHint('<kbd>E</kbd> o moverte: alejarte de la tele'); else if (me && me.alive && tzNear(me) >= 0 && $('#modal').hidden) uiHint('<kbd>E</kbd> acercarte a la tele'); else uiHint(''); } } catch (err) { console.warn(err); } };
window.__ui = { VM, PL, TZ, get yaw() { return yaw; } };
