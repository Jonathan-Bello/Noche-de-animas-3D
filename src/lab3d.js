// ================= Laboratorio en 3D: letreros, aviso «E Probar» y qué debiste oír =================
let labMeshes = null;
const LAB_COL = { casa: '#e0782a', anima: '#b07aff', evid: '#5fd08a', voz: '#6fb0ff' };
function labBuild() {
  labMeshes = w.labStations.map(s => { const L = LAB_BY[s.id], g = new THREE.Group(); g.position.set(s.x, s.f * FH, s.y); scene.add(g);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 0.45), LambertFlat({ color: 0x3a2414 })); ped.position.y = 0.45; g.add(ped);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), new THREE.MeshBasicMaterial({ color: LAB_COL[L[3]] })); btn.position.y = 0.93; g.add(btn);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const x = cv.getContext('2d');
    x.fillStyle = 'rgba(18,13,34,.9)'; x.fillRect(0, 0, 512, 160); x.strokeStyle = LAB_COL[L[3]]; x.lineWidth = 8; x.strokeRect(4, 4, 504, 152);
    x.fillStyle = LAB_COL[L[3]]; x.font = 'bold 30px sans-serif'; x.fillText(`${s.n}. ${{ casa: 'CASA', anima: 'ÁNIMA', evid: 'EVIDENCIA', voz: 'VOZ' }[L[3]]}`, 20, 44);
    x.fillStyle = '#f3e6cf'; x.font = 'bold 36px sans-serif'; const words = L[1].split(' '); let line = '', y = 92; for (const wd of words) { if (x.measureText(line + wd).width > 470) { x.fillText(line, 20, y); line = ''; y += 40; } line += wd + ' '; } x.fillText(line, 20, y);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: true })); sp.scale.set(1.6, 0.5, 1); sp.position.y = 1.9; g.add(sp);
    return { s, g }; });
}
const _updateSceneLab = updateScene;
updateScene = function (t, dt) { _updateSceneLab(t, dt); if (!w || !w.lab) return; if (!labMeshes) labBuild(); const V = viewer(); for (const m of labMeshes) m.g.visible = !!V && (m.s.f === V.f || V.f === 1) && Math.hypot(V.x - m.s.x, V.y - m.s.y) < 20; };
const _buildHouseLab = buildHouse; buildHouse = function () { labMeshes = null; _buildHouseLab(); };
const _primaryLab = primaryAction;
primaryAction = function (i) { if (w && w.lab && i && i.alive && !i.escaped && i.hidden < 0) { const s = labNear(w, i); if (s) return { k: 'E', txt: `Probar: ${LAB_BY[s.id][1]}`, btn: 'Probar' }; } return _primaryLab(i); };
const _nightRouletteLab = nightRoulette; nightRoulette = function () { if (w && w.lab) return; _nightRouletteLab(); };
// qué pasó y qué debiste oír o ver
const _playEventsLab = playEvents;
playEvents = function () {
  if (w && w.lab) for (const e of w.events) if (e.type === 'lab') { const L = LAB_BY[e.id], P = w.invs[e.who];
    let extra = '';
    if (e.id === 'frases' && e.who === ME) { const tags = {}; VOICE.clips.forEach(c => tags[c.tag] = (tags[c.tag] || 0) + 1); const mates = Object.entries(VOICE.byInv || {}).filter(([k]) => +k !== ME).map(([k, l]) => `${w.invs[k] ? w.invs[k].name : k}: ${l.length}`);
      extra = VOICE.on ? `<br>Tus frases guardadas: <b>${VOICE.clips.length}</b>${VOICE.clips.length ? ' (' + Object.entries(tags).map(([k, n]) => `${n} ${k}`).join(', ') + ')' : ' — habla con pausas: frases de 0.4 a 3 s'}${mates.length ? '<br>De tus compañeros: ' + mates.join(' · ') : ''}` : '<br><b>El micrófono está apagado.</b> Actívalo en «Jugar en línea» para que la casa pueda usar tu voz.'; }
    toast(`🧪 <b>${P ? P.name : ''}</b> probó <b>${L[1]}</b> ${e.ok ? '' : `<span class="warn">— no funcionó${e.why ? ': ' + e.why : ''}</span>`}<br><span class="small">${L[2]}</span>${extra}`, '', e.id === 'frases' ? 9 : 6); }
  _playEventsLab();
};
// menú: entrar al laboratorio
{ const b = document.createElement('button'); b.id = 'labBtn'; b.textContent = '🧪 Laboratorio de sucesos y sonidos'; b.className = 'ghostbtn'; b.style.marginTop = '8px'; const play = $('#play'); if (play) play.insertAdjacentElement('afterend', b);
  b.onclick = () => { if (!audio) initAudio(); else if (audio.ctx.state === 'suspended') audio.ctx.resume(); const keep = { role: menuOpt.role, nInv: menuOpt.nInv }; Object.assign(menuOpt, { lab: true, role: 'inv', nInv: 1 }); start.skipSlot = true; try { start(); } finally { start.skipSlot = false; Object.assign(menuOpt, keep, { lab: false }); } }; }
const _hudLab = hud; hud = function () { _hudLab(); if (w && w.lab) $('#top').innerHTML = `<span class="hora">🧪</span><span>Laboratorio · ${w.labStations.length} puestos en ${new Set(w.labStations.map(s => s.room)).size} cuartos · <b>E</b> junto a un letrero</span>`; };
