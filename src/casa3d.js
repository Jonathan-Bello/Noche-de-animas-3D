// ================= v1.4 en 3D: sombra en la pared, retratos, ofrenda, teles modeladas, radio, zaguán desesperado =================
glitch = function () {}; // el efecto rojo de estática ya no se usa: sacaba de la inmersión
const imgCache = {};
const imgOf = id => { if (!imgCache[id]) { const im = new Image(); im.src = charImg(id); imgCache[id] = im; } return imgCache[id]; };
const texOf = id => { const k = 't:' + id; if (!imgCache[k]) imgCache[k] = new THREE.TextureLoader().load(charImg(id)); return imgCache[k]; };
let casa3d = { portraits: [], ofrenda: null, shadow: null, tvRT: null, tvRig: null, pix: null, cvSmall: null, tvcamT: 0, nextStatic: 0, nextKnock: 0 };
const _buildHouseC = buildHouse; buildHouse = function () { casa3d = { portraits: [], ofrenda: null, shadow: null, tvRT: null, tvRig: null, pix: null, cvSmall: null, tvcamT: 0, nextStatic: 0, nextKnock: 0 }; _buildHouseC(); };

// ---------- 3. La sombra sin dueño: la sombra de alguien invisible en la pared ----------
spawnShadow = function (e) {
  const V = viewer(); if (!V || !scene) return; const dx = Math.cos(yaw), dy = Math.sin(yaw); let hit = null, x = V.x, y = V.y;
  for (let s = 0.4; s < 9; s += 0.08) { const nx = V.x + dx * s, ny = V.y + dy * s; if (tileAt(V.f, nx, ny) === T.WALL) { hit = { x: nx, y: ny, s }; break; } x = nx; y = ny; }
  if (!hit || hit.s < 1.6) return;
  const tx = hit.x | 0, ty = hit.y | 0, nx = tx !== (x | 0) ? Math.sign((x | 0) - tx) : 0, ny = nx ? 0 : Math.sign((y | 0) - ty);
  const wx = nx ? (nx > 0 ? tx + 1.02 : tx - 0.02) : hit.x, wy = ny ? (ny > 0 ? ty + 1.02 : ty - 0.02) : hit.y;
  // la silueta proyectada en la pared (se ve aunque no apuntes la linterna)
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256; const c = cv.getContext('2d'); c.filter = 'blur(6px)'; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(64, 46, 20, 25, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(30, 82); c.quadraticCurveTo(64, 66, 98, 82); c.lineTo(106, 190); c.lineTo(86, 250); c.lineTo(42, 250); c.lineTo(22, 190); c.closePath(); c.fill();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0, depthWrite: false }));
  m.position.set(wx, V.f * FH + 1.15, wy); m.rotation.y = nx ? (nx > 0 ? Math.PI / 2 : -Math.PI / 2) : (ny > 0 ? 0 : Math.PI); scene.add(m);
  // y alguien invisible entre tú y la pared, que tapa la luz de la linterna
  const r = makeCharacter('ines'); const inv = m0 => { const m1 = m0.clone(); m1.colorWrite = false; m1.depthWrite = false; return m1; }; r.g.traverse(o => { if (o.material) { o.material = Array.isArray(o.material) ? o.material.map(inv) : inv(o.material); o.castShadow = true; } });
  r.g.position.set(wx + nx * 1.3, V.f * FH, wy + ny * 1.3); r.g.rotation.y = -Math.atan2(V.y - wy, V.x - wx) + Math.PI / 2; scene.add(r.g);
  if (casa3d.shadow) { scene.remove(casa3d.shadow.m); scene.remove(casa3d.shadow.g); } casa3d.shadow = { m, g: r.g, t0: performance.now(), dx: nx ? 0 : 1, dz: nx ? 1 : 0 };
};
function shadowTick(now) {
  const s = casa3d.shadow; if (!s) return; const k = (now - s.t0) / 1000;
  s.m.material.opacity = k < 0.4 ? k / 0.4 * 0.6 : k < 2.2 ? 0.6 : Math.max(0, 0.6 - (k - 2.2) / 0.6 * 0.6);
  const slide = k * 0.9; s.m.position.x += s.dx * 0.01; s.m.position.z += s.dz * 0.01; s.g.position.x += s.dx * 0.01; s.g.position.z += s.dz * 0.01;
  if (k > 2.9) { scene.remove(s.m); scene.remove(s.g); casa3d.shadow = null; }
}

// ---------- 8. retratos que cambian · 18. foto en la ofrenda ----------
function portraitMesh(char, wdt, hgt) {
  const g = new THREE.Group(); const fr = new THREE.Mesh(new THREE.BoxGeometry(wdt + 0.12, hgt + 0.12, 0.05), LambertFlat({ color: 0x6a4a1a })); g.add(fr);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(wdt, hgt), new THREE.MeshLambertMaterial({ map: texOf(char), color: 0x9a9a9a })); pic.position.z = 0.03; g.add(pic); return g;
}
function portraitsTick() {
  const P = w.portraits || []; while (casa3d.portraits.length < P.length) { const p = P[casa3d.portraits.length], g = portraitMesh(p.char, 0.55, 0.75);
    g.position.set(p.x, p.f * FH + 1.75, p.y); g.rotation.y = p.nx ? (p.nx > 0 ? Math.PI / 2 : -Math.PI / 2) : (p.ny > 0 ? 0 : Math.PI); scene.add(g); casa3d.portraits.push(g); }
  const o = w.ofrenda; if (o && (!casa3d.ofrenda || casa3d.ofrenda.char !== o.char)) { if (casa3d.ofrenda) scene.remove(casa3d.ofrenda.g); const g = portraitMesh(o.char, 0.26, 0.34);
    g.position.set(w.altarSurface.x,w.altarSurface.f*FH+w.altarSurface.h+.29,w.altarSurface.y-.12); g.rotation.x = -0.15; scene.add(g); casa3d.ofrenda = { g, char: o.char }; }
}

// ---------- 20. el señuelo metido en la pared tiembla ----------
function decoyTick() { const dc = w.decoy, m = casMeshes.decoy; if (!dc || !m || !m.g.visible) return; const inWall = !walkableT(tileAt(dc.f, dc.x, dc.y)) || !walkableT(tileAt(dc.f, dc.x + 0.3, dc.y)) || !walkableT(tileAt(dc.f, dc.x - 0.3, dc.y));
  if (inWall) { m.g.position.x += (Math.random() - 0.5) * 0.12; m.g.position.z += (Math.random() - 0.5) * 0.12; m.g.rotation.y += (Math.random() - 0.5) * 0.3; } }

// ---------- teles: noticiero, vigilancia y barras, dibujados en la pantalla ----------
const TVW = 256, TVH = 192;
function noiseOver(ctx, a) { for (let k = 0; k < 260; k++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * a})`; ctx.fillRect(Math.random() * TVW, Math.random() * TVH, 2 + Math.random() * 3, 1); } }
function drawBars(ctx, t, txt) { const cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0']; cols.forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(k * 37, 0, 37, 128); });
  ['#0000c0', '#111', '#c000c0', '#111', '#00c0c0', '#111', '#c0c0c0'].forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(k * 37, 128, 37, 16); }); ctx.fillStyle = '#000'; ctx.fillRect(0, 144, 256, 48);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; (txt || []).forEach((l, k) => ctx.fillText(l, 12, 162 + k * 18)); }
function drawEyes(ctx, t, lookX, lookY) {
  ctx.fillStyle = '#050303'; ctx.fillRect(0, 0, TVW, TVH); const blink = (t % 2.6) > 2.45 ? 0.1 : 1;
  for (const cx of [80, 176]) { ctx.save(); ctx.translate(cx, 96); ctx.scale(1, blink);
    ctx.fillStyle = '#d8d0c0'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 22, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#4a1010'; ctx.lineWidth = 1.5; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-40 + k * 3, -6 + k * 3); ctx.lineTo(-22, 0); ctx.stroke(); }
    const px = lookX * 22, py = lookY * 9; ctx.fillStyle = '#3a1a10'; ctx.beginPath(); ctx.arc(px, py, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(px - 5, py - 6, 3, 3); ctx.restore(); }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, TVW, TVH); noiseOver(ctx, 0.12); }
function drawNews(ctx, el, missing) {
  ctx.fillStyle = '#0b1a3a'; ctx.fillRect(0, 0, TVW, TVH); ctx.fillStyle = '#16305e'; ctx.fillRect(0, 120, TVW, 72);
  // reportero
  ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.moveTo(40, 150); ctx.quadraticCurveTo(80, 104, 120, 150); ctx.fill(); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(74, 118, 12, 20); ctx.fillStyle = '#7a1020'; ctx.fillRect(77, 122, 6, 22);
  ctx.fillStyle = '#c99a78'; ctx.beginPath(); ctx.ellipse(80, 88, 18, 23, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(80, 72, 19, 10, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#111'; ctx.fillRect(71, 84, 5, 3); ctx.fillRect(84, 84, 5, 3); const mo = Math.random() < 0.5 ? 2 : 6; ctx.fillStyle = '#3a1010'; ctx.fillRect(75, 98, 10, mo);
  ctx.fillStyle = '#5a3a2a'; ctx.fillRect(20, 150, 216, 10); // escritorio
  ctx.fillStyle = '#b01010'; ctx.fillRect(0, 8, 150, 22); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('ÚLTIMA HORA', 10, 24);
  // cintillo
  ctx.fillStyle = '#000'; ctx.fillRect(0, 170, TVW, 22); ctx.fillStyle = '#ffd040'; ctx.font = '12px sans-serif'; const msg = '  REPORTAN DESAPARECIDOS EN LA CASONA DEL FINAL DE LA CALLE · NO SALGA DE SU CASA · NO ABRA SI TOCAN ·'; ctx.fillText(msg, 256 - (el * 60) % 900, 185);
  if (el > 7.5 && missing) { ctx.fillStyle = '#eee'; ctx.fillRect(150, 40, 96, 118); ctx.fillStyle = '#b01010'; ctx.fillRect(150, 40, 96, 16); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('DESAPARECIDO', 154, 52);
    const im = imgOf(missing.char); if (im.complete && im.naturalWidth) { ctx.save(); ctx.filter = 'grayscale(1) contrast(1.2)'; ctx.drawImage(im, 156, 58, 84, 78); ctx.restore(); } ctx.fillStyle = '#111'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(missing.name.slice(0, 13), 156, 150); }
  noiseOver(ctx, 0.08);
}
function tvLook(d) { const V = viewer(), m = devMeshes && devMeshes.find(x => x.d === d); if (!V || !m) return [0, 0]; const th = m.g.rotation.y, vx = V.x - d.x, vy = V.y - d.y, l = Math.hypot(vx, vy) || 1; return [Math.max(-1, Math.min(1, (vx * Math.cos(th) - vy * Math.sin(th)) / l * 1.6)), 0.2]; }
// la cámara de vigilancia: una esquina del cuarto donde está esa persona
function tvcamFrame(target) {
  if (!casa3d.tvRT) { casa3d.tvRT = new THREE.WebGLRenderTarget(160, 120); casa3d.tvRig = new THREE.PerspectiveCamera(80, 4 / 3, 0.1, 26); casa3d.pix = new Uint8Array(160 * 120 * 4); casa3d.cvSmall = document.createElement('canvas'); casa3d.cvSmall.width = 160; casa3d.cvSmall.height = 120; }
  const r = roomOf(target); if (r < 0) return false; const [x0, y0, x1, y1] = ROOMS[target.f][r].r; const corners = [[x0 + 0.6, y0 + 0.6], [x1 + 0.4, y0 + 0.6], [x0 + 0.6, y1 + 0.4], [x1 + 0.4, y1 + 0.4]].filter(([x, y]) => walkableT(tileAt(target.f, x, y)) && los(target.f, x, y, target.x, target.y));
  if (!corners.length) return false; const [cx, cy] = corners.sort((a, b) => Math.hypot(b[0] - target.x, b[1] - target.y) - Math.hypot(a[0] - target.x, a[1] - target.y))[0];
  const cam = casa3d.tvRig, base = target.f * FH; cam.position.set(cx, base + FH - 0.45, cy); cam.lookAt(target.x, base + 0.9, target.y);
  const f1 = floorGroups[1].visible, cv = ceilMeshes.map(m => m.visible), sc = wallRuns.map(q => q.g.scale.y), gv = ghostMesh.g.visible;
  floorGroups[1].visible = target.f === 1; ceilMeshes.forEach(m => m.visible = cam.position.y < m.userData.f * FH + FH - 0.05); wallRuns.forEach(q => q.g.scale.y = 1); ghostMesh.g.visible = false;
  irLight.position.set(cx, base + FH - 0.6, cy); irLight.intensity = 22; renderer.setRenderTarget(casa3d.tvRT); renderer.render(scene, cam); irLight.intensity = 0; renderer.readRenderTargetPixels(casa3d.tvRT, 0, 0, 160, 120, casa3d.pix); renderer.setRenderTarget(null);
  floorGroups[1].visible = f1; ceilMeshes.forEach((m, k) => m.visible = cv[k]); wallRuns.forEach((q, k) => q.g.scale.y = sc[k]); ghostMesh.g.visible = gv;
  const c = casa3d.cvSmall.getContext('2d'), img = c.createImageData(160, 120); for (let yy = 0; yy < 120; yy++) img.data.set(casa3d.pix.subarray((119 - yy) * 640, (120 - yy) * 640), yy * 640); c.putImageData(img, 0, 0); return true;
}
tvDraw = function (now) {
  const ctx = casMeshes.tvCtx; if (!ctx || !w) return; const tv = w.tvOn; if (!tv) { if (casLocal.tvDrawn !== 'off') { ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, TVW, TVH); casMeshes.tvTex.needsUpdate = true; casLocal.tvDrawn = 'off'; } return; }
  casLocal.tvDrawn = tv.k; const el = w.t - tv.t0, left = tv.until - w.t, d = w.devices && w.devices[tv.dev], [lx, ly] = d ? tvLook(d) : [0, 0];
  if (tv.k === 'barras') { drawBars(ctx, el, ['3:33 · SI OYES TU NOMBRE,', 'NO CONTESTES']); noiseOver(ctx, 0.06); }
  else if (tv.k === 'tv') { if (el < 3.5) { drawBars(ctx, el, ['FIN DE LA TRANSMISIÓN', '00:00']); noiseOver(ctx, 0.25); } else if (left > 5) drawNews(ctx, el, w.invs[tv.missing]); else drawEyes(ctx, el, lx, ly); }
  else if (tv.k === 'tvcam') { if (left <= 3.5) drawEyes(ctx, el, lx, ly); else {
      const ids = tv.targets || [tv.who], tg = w.invs[ids[Math.floor(el / 6) % ids.length]]; const V = viewer(); const near = V && d && V.f === d.f && Math.hypot(V.x - d.x, V.y - d.y) < 14;
      if (tg && near && (casa3d.tvcamT++ % 3 === 0)) tvcamFrame(tg);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, TVW, TVH); if (casa3d.cvSmall) { ctx.save(); ctx.filter = 'grayscale(1) brightness(3.6) contrast(1.3)'; ctx.drawImage(casa3d.cvSmall, 0, 0, TVW, TVH); ctx.restore(); }
      for (let yy = 0; yy < TVH; yy += 3) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, yy, TVW, 1); }
      ctx.fillStyle = Math.floor(el * 2) % 2 ? '#e22' : '#600'; ctx.beginPath(); ctx.arc(14, 14, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#eee'; ctx.font = '11px monospace';
      ctx.fillText(`REC  CAM 0${(Math.floor(el / 6) % 3) + 2} · ${tg ? (roomName(tg) || '').toUpperCase().slice(0, 16) : ''}`, 24, 18); ctx.fillText(`03:33:${String(Math.floor(el) % 60).padStart(2, '0')}`, 190, 182); noiseOver(ctx, 0.06); } }
  casMeshes.tvTex.needsUpdate = true;
};
tvShow = function (e) { ensureTV(); if (casMeshes.tv) casMeshes.tv.visible = false; S('tv_on', e.f !== undefined ? { f: e.f, x: e.x, y: e.y } : null, { vol: 0.9 }); casa3d.nextStatic = 0; };

// ---------- radio: estática con frases suyas distorsionadas, gritos y respiraciones ----------
function radioPhrase(c, pos, delay) {
  const a = audio.ctx, src = c.d || c, sr = c.sr || 22050, b = a.createBuffer(1, src.length, sr), dd = b.getChannelData(0); dd.set(src);
  for (let i = 0; i < dd.length; i++) dd[i] = Math.tanh(dd[i] * 6) * 0.5; // saturada
  const s = a.createBufferSource(); s.buffer = b; s.playbackRate.value = 0.82 + Math.random() * 0.12;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.2; const g = a.createGain(); g.gain.value = 1.1 * VOL.voz;
  s.connect(bp).connect(g).connect(out(pos)); s.start(a.currentTime + delay); return true;
}
function radioPlay(e) {
  const p = e.f !== undefined ? { f: e.f, x: e.x, y: e.y } : null; S(['static1', 'static2', 'static3'], p, { vol: 0.5, dur: 10 }); S('hiss', p, { vol: 0.3, dur: 10 });
  const pool = VOICE.clips.slice(); Object.values(VOICE.byInv || {}).forEach(L => pool.push(...L)); let tt = 1.2;
  for (let k = 0; k < 3; k++) { if (pool.length && Math.random() < 0.75) radioPhrase(pool[Math.floor(Math.random() * pool.length)], p, tt); else S(pick([['r_zombies'], ['r_riser'], ['r_echo'], ['scream1', 'scream2'], ['r_breath', 'breath1']]), p, { vol: 0.55, delay: tt, hp: 500, lp: 2600, rate: 0.85 }); tt += 2.2 + Math.random() * 1.2; }
  if (Math.random() < 0.5) S(['scream_fc1', 'scream_fc2', 'scream_fc3'], p, { vol: 0.5, delay: 8.2, hp: 700, lp: 2400 });
}
const _casSoundC = casSound;
casSound = function (e, p, V) {
  if (e.k === 'radio') return radioPlay(e);
  if (e.k === 'leyenda' && SND.buf.llorona) { duck(1); S('llorona', p, { vol: 1 }); S('choir', p, { rate: 0.6, vol: 0.5, lp: 1800 }); return; }
  if (e.k === 'zaguan') { casa3d.nextKnock = 0; return; } // los golpes los da el bucle de abajo
  if (e.k === 'serenata' || e.k === 'sombralag') return;
  return _casSoundC(e, p, V);
};
// zaguán: golpes fuertes y desesperados que se oyen en toda la casa hasta que alguien abre
function knockTick(now) {
  const k = w.cas && w.cas.knock; if (!k || w.t > k.until || !audio || audio.muted) return; if (now < casa3d.nextKnock) return; casa3d.nextKnock = now + 2400 + Math.random() * 1400;
  const p = { f: 0, x: ZAG.x, y: ZAG.y + 0.7 }, n = 4 + Math.floor(Math.random() * 4); let tt = 0;
  for (let i = 0; i < n; i++) { S(['knock1', 'knock2', 'slam1'], p, { vol: 1.5, far: true, delay: tt, rate: 0.9 + Math.random() * 0.25, offset: 0 }); tt += 0.11 + Math.random() * 0.12; }
  if (Math.random() < 0.6) S('handle', p, { vol: 1.2, far: true, delay: tt + 0.2, rate: 1.3 });
  if (Math.random() < 0.25) S(['r_breath', 'breath2'], p, { vol: 0.8, far: true, delay: tt + 0.5 });
}
// estática cerca de la tele encendida
function tvStaticTick(now) { const tv = w.tvOn, d = tv && w.devices && w.devices[tv.dev]; if (!d || now < casa3d.nextStatic) return; casa3d.nextStatic = now + 2400; S(['static1', 'static2', 'static3'], { f: d.f, x: d.x, y: d.y }, { vol: tv.k === 'barras' ? 0.25 : 0.4, dur: 2.6 }); }
const _playEventsC = playEvents;
playEvents = function () { if (w) for (const e of w.events) if (e.type === 'tvoff') S('tv_off', { f: e.f, x: e.x, y: e.y }, { vol: 0.9 }); _playEventsC(); };
// apagar la tele: aviso
const _primaryC = primaryAction;
primaryAction = function (i) { if (w && w.tvOn && i && i.alive && !i.escaped) { const d = w.devices && w.devices[w.tvOn.dev]; if (d && d.f === i.f && Math.hypot(d.x - i.x, d.y - i.y) < 1.9) return { k: 'E', txt: 'Apagar la tele', btn: 'Apagar' }; } return _primaryC(i); };
const _updateSceneC = updateScene;
updateScene = function (t, dt) {
  _updateSceneC(t, dt); if (!w || !scene) return; const now = performance.now();
  if (w.tvOn) { casLocal.tvUntil = now + 500; casLocal.tvDev = w.tvOn.dev; casLocal.tvMode = w.tvOn.k; } else casLocal.tvUntil = 0;
  try { shadowTick(now); portraitsTick(); decoyTick(); knockTick(now); tvStaticTick(now); } catch (e) { console.warn(e); }
};
// la bitácora avisa cuando se guarda una frase (para probar el eco y el teléfono)
window.__onClip = (c, who) => { if (!w || !w.bitacora) return; const P = who === null || who === undefined ? w.invs[ME] : w.invs[who]; blog(w, 'equipo', `🎙 Se guardó una frase de ${P ? P.name : 'ti'} (${c.tag}, ${(c.d.length / (c.sr || 22050)).toFixed(1)} s)`, P, P && P.id); };
window.__casM = () => casMeshes;
window.__casa3dpix = () => casa3d.pix;
