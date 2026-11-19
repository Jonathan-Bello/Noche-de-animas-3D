// ================= Casona v1.1: lo que se ve y se oye de las reglas nuevas =================
// Sucesos de la casona, voces del ánima por género, fotos, libreta con colores, apuesta y salida,
// Hora del ánima, dinero y tragamonedas. Va después de game3d.js (mismo módulo).

const WALLET_KEY = 'nda_dinero';
const wallet = { get() { try { return +localStorage.getItem(WALLET_KEY) || 0; } catch (e) { return 0; } }, add(v) { try { localStorage.setItem(WALLET_KEY, String(Math.max(0, this.get() + v))); } catch (e) {} } };
const casLocal = { corpseGone: 0, kneelGone: 0, decoyKey: null, tvMode: null, tvUntil: 0, tvNames: [], reconUntil: 0 };
let casMeshes = { decoy: null, corpse: null, kneel: null, kneelLight: null, shadow: null, shadowUntil: 0, tv: null, tvTex: null, tvCtx: null };
const eyesImg = new Image(); eyesImg.src = ASSET + 'a/presencia.webp';

// ---------- sonidos de la casona (sintetizados; reemplazables por audio real) ----------
const CSFX = {
  owl(p) { [0, 0.55].forEach(d => { tone(330, 0.45, 'sine', 0.05, p, -40, d); tone(165, 0.45, 'sine', 0.02, p, -20, d); }); },
  howl(p) { tone(420, 2.4, 'sawtooth', 0.025, p, 260); tone(410, 2.4, 'sine', 0.03, p, 240, 0.05); },
  marbles(p) { let tt = 0; for (let k = 0; k < 14; k++) { tt += 0.06 + k * 0.012; tone(2400 + Math.random() * 600, 0.02, 'square', 0.03, p, 0, tt); } },
  steps(p) { for (let k = 0; k < 5; k++) noise(0.14, 'lowpass', 260, 1, 0.22, p, k * 0.45, 0.02); },
  knock(p) { for (let k = 0; k < 3; k++) noise(0.1, 'lowpass', 180, 1, 0.5, p, k * 0.35, 0.005); },
  ring(p) { for (let k = 0; k < 3; k++) { tone(440, 0.45, 'sine', 0.08, p, 0, k * 1.1); tone(480, 0.45, 'sine', 0.08, p, 0, k * 1.1); } },
  serenata(p) { const n = [196, 247, 294, 392, 294, 247, 220, 262, 330, 440, 330, 262]; n.forEach((f, k) => tone(f, 0.5, 'triangle', 0.09, p, 0, k * 0.35)); setTimeout(() => { noise(0.8, 'bandpass', 1600, 0.6, 0.4, p); tone(900, 0.7, 'sawtooth', 0.2, p, -500); }, n.length * 350 + 200); },
  static(p, d) { noise(d || 1.4, 'bandpass', 3000, 0.4, 0.18, p, 0, 0.05); },
  thunder() { noise(2.2, 'lowpass', 120, 0.7, 0.6, null, 0, 0.02); },
  shutter(p) { noise(0.05, 'highpass', 4000, 0.8, 0.3, p); tone(1800, 0.04, 'square', 0.05, p, 0, 0.06); },
  wet(p) { for (let k = 0; k < 4; k++) noise(0.08, 'bandpass', 700, 3, 0.15, p, k * 0.4); },
  lamento(p, voz) { if (voz === 'm') { tone(620, 1.4, 'sine', 0.07, p, -220); tone(640, 1.4, 'triangle', 0.03, p, -230, 0.05); } else { tone(170, 1.6, 'sawtooth', 0.05, p, -50); noise(1.2, 'lowpass', 400, 1, 0.08, p, 0, 0.3); } },
  llanto(p) { for (let j = 0; j < 3; j++) tone(700 - j * 60, 0.7, 'sawtooth', 0.12, p, -300, j * 0.6); },
};
const AMB_TXT = { vela: 'Una veladora se apagó sola', cempasuchil: 'Huele a cempasúchil', campanas: 'Campanadas a deshoras', perro: 'Un perro aúlla a lo lejos', mecedora: 'Una mecedora se mece sola', estatica: 'Se oye estática en este cuarto', afuera: 'Afuera, un niño juega con una pelota', petalos: 'Un caminito de pétalos de cempasúchil' };

function casEvents() {
  if (!w) return; const V = viewer(), mine = e => e.who === ME;
  for (const e of w.events) {
    const p = e.f !== undefined ? { f: e.f, x: e.x, y: e.y } : null;
    if (e.type === 'photo') { if (mine(e)) { const el = document.createElement('div'); el.className = 'photoflash'; $('#game').appendChild(el); setTimeout(() => el.remove(), 400); toast(e.pay ? `📷 ${e.what} ${'★'.repeat(e.stars || 0)} · <b>$${e.pay}</b>` : '📷 Nada raro en la foto.', '', 2.5); if (e.cursed) glitch(0.6); } if (audio && !audio.muted) CSFX.shutter(p); continue; }
    if (!audio || audio.muted) { if (e.type === 'cas' && mine(e) && e.k === 'reconectando') casLocal.reconUntil = performance.now() + 2000; continue; }
    switch (e.type) {
      case 'tecolote': { const a = Math.random() * 6.28; CSFX.owl(V ? { f: V.f, x: V.x + Math.cos(a) * 22, y: V.y + Math.sin(a) * 22 } : null); break; }
      case 'lamento': if (e.llorona) CSFX.llanto(p); else CSFX.lamento(p, e.voz); break;
      case 'fuseBlow': tone(70, 0.5, 'square', 0.25, p); noise(0.3, 'highpass', 3000, 0.5, 0.3, p); shake(0.3); break;
      case 'hora': [0, 1.4, 2.8].forEach(d => setTimeout(() => SFX.bell(null), d * 1000)); shake(0.5); flashUI('nuca'); break;
      case 'amanece': SFX.bell(null); tone(880, 0.2, 'sine', 0.05, null, 300, 0.4); break;
      case 'escape': SFX.door(p); break;
      case 'visita': SFX.door({ f: EXIT.f, x: EXIT.x, y: EXIT.y }); break;
      case 'huellas': CSFX.wet(p); break;
      case 'cas': casSound(e, p, V); break;
    }
  }
}
function casSound(e, p, V) {
  const mine = e.who === ME;
  switch (e.k) {
    case 'ambiente': { const a = e.a; if (a === 'campanas') SFX.bell(p); else if (a === 'perro') CSFX.howl({ f: e.f, x: e.x + 18, y: e.y }); else if (a === 'mecedora') SFX.creak(p); else if (a === 'estatica') CSFX.static(p); else if (a === 'afuera') { SFX.giggle && SFX.giggle({ f: 0, x: EXIT.x, y: EXIT.y + 3 }); for (let k = 0; k < 3; k++) tone(140, 0.08, 'sine', 0.12, { f: 0, x: EXIT.x, y: EXIT.y + 3 }, -40, k * 0.5); } else if (a === 'vela') noise(0.3, 'highpass', 2000, 0.6, 0.1, p);
      if (mine && AMB_TXT[a]) floater(AMB_TXT[a], 'cas'); break; }
    case 'pasos': if (mine) { const q = { f: e.f, x: e.x + (Math.random() - 0.5) * 3, y: e.y + (Math.random() - 0.5) * 3 }; Math.random() < 0.5 ? CSFX.marbles(q) : CSFX.steps(q); } break;
    case 'sombralag': if (mine) glitch(0.45); break;
    case 'sombra': if (mine) { spawnShadow(e); tone(48, 1, 'sine', 0.2, null, -10); } break;
    case 'serenata': CSFX.serenata(p); break;
    case 'zaguan': CSFX.knock(p); break;
    case 'foto': if (mine) tone(52, 1.2, 'sine', 0.2, null, -12); break;
    case 'telefono': CSFX.ring(p); if (mine && e.near) setTimeout(() => { if (e.leyenda) { duck(1); speak('¡Ay, mis hijos!', { pitch: 0.1, rate: 0.6 }); } else if (!VOICE.playClip(p, e.distort)) speak(pick(['¿Hay alguien ahí?', 'Ven… aquí…', 'Ya te vi']), { pitch: 0.2, rate: 0.7 }); }, 3400); break;
    case 'eco': if (mine && V) { const a = Math.random() * 6.28; VOICE.playClip({ f: V.f, x: V.x + Math.cos(a) * 9, y: V.y + Math.sin(a) * 9 }, Math.random() < 0.1); } break;
    case 'leyenda': duck(1); setTimeout(() => speak('¡Ay, mis hijos!', { pitch: 0.1, rate: 0.6 }), 900); CSFX.llanto(p); break;
    case 'tv': case 'tvcam': case 'barras': tvShow(e); break;
    case 'radio': CSFX.static(null, 4); duck(1.2); setTimeout(() => speak(`…reportan como desaparecidos a: ${(e.names || []).join(', ')}. Si los ven, no les abran…`, { pitch: 0.5, rate: 0.85 }), 1200); break;
    case 'reconectando': if (mine) { casLocal.reconUntil = performance.now() + 2000; CSFX.steps(V ? { f: V.f, x: V.x + 2, y: V.y } : null); } break;
    case 'clima': if (mine) { const el = document.createElement('div'); el.className = 'redsky'; $('#game').appendChild(el); setTimeout(() => el.remove(), 2000); CSFX.thunder(); glitch(0.4); } break;
    case 'ofrenda': SFX.bell(p); break;
    case 'pasillo': if (mine) { glitch(0.7); tone(60, 0.6, 'sine', 0.2, null, -15); } break;
    case 'puerta': SFX.door(p); break;
    case 'rezando': break;
    case 'cadaver': if (mine) casLocal.corpseGone = 0; break;
  }
}
const _playEvents = playEvents; playEvents = function () { casEvents(); _playEvents(); };

// ---------- figuras: señuelo, cuerpo, persona rezando, sombra sin dueño, televisión ----------
function spawnShadow(e) {
  if (!casMeshes.shadow) { const s = new THREE.Shape(); s.moveTo(-0.22, 0); s.lineTo(-0.2, 1.2); s.lineTo(-0.32, 1.35); s.lineTo(-0.12, 1.5); s.absarc(0, 1.68, 0.16, -1.2, Math.PI + 1.2, false); s.lineTo(0.32, 1.35); s.lineTo(0.2, 1.2); s.lineTo(0.22, 0); s.lineTo(-0.22, 0);
    casMeshes.shadow = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })); scene.add(casMeshes.shadow); }
  const V = viewer(); if (!V) return; const m = casMeshes.shadow; m.visible = true; m.position.set(e.x, e.f * FH + 0.02, e.y); m.rotation.y = -Math.atan2(V.y - e.y, V.x - e.x) + Math.PI / 2; casMeshes.shadowUntil = performance.now() + 2500;
}
function ensureTV() {
  if (casMeshes.tv || !w) return; const r = ROOMS[0][RID[0].sala]; if (!r) return; const [x0, y0, x1, y1] = r.r;
  const c = document.createElement('canvas'); c.width = 256; c.height = 192; const ctx = c.getContext('2d'); ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 256, 192);
  const tex = new THREE.CanvasTexture(c); const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.6), LambertFlat({ color: 0x3a2a1a })); body.position.y = 0.35; g.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.5), new THREE.MeshBasicMaterial({ map: tex })); scr.position.set(0, 0.38, 0.31); g.add(scr);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.55), LambertFlat({ color: 0x4a3420 })); stand.position.y = -0.27; g.add(stand);
  g.position.set(x0 + 1.0, 0.55, (y0 + y1) / 2 + 0.5); g.rotation.y = Math.PI / 2; scene.add(g);
  casMeshes.tv = g; casMeshes.tvTex = tex; casMeshes.tvCtx = ctx; w.tv = { f: 0, x: x0 + 1.0, y: (y0 + y1) / 2 + 0.5 };
}
function tvShow(e) { ensureTV(); casLocal.tvMode = e.k; casLocal.tvUntil = performance.now() + (e.k === 'tv' ? 14000 : 9000); casLocal.tvNames = e.names || []; const p = w.tv;
  if (e.k === 'tv') { CSFX.static(p, 0.8); setTimeout(() => speak(`Interrumpimos la transmisión. Reportan un asesinato en la casona del final de la calle. Las víctimas: ${(e.names || []).join(', ')}.`, { pitch: 0.6, rate: 0.95 }), 900); }
  if (e.k === 'barras') tone(1000, 4, 'sine', 0.05, p); if (e.k === 'tvcam') CSFX.static(p, 0.5); }
function tvDraw(now) {
  const ctx = casMeshes.tvCtx; if (!ctx) return; const mode = now < casLocal.tvUntil ? casLocal.tvMode : null;
  if (!mode) { if (casLocal.tvDrawn !== 'off') { ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 256, 192); casMeshes.tvTex.needsUpdate = true; casLocal.tvDrawn = 'off'; } return; }
  casLocal.tvDrawn = mode; const left = casLocal.tvUntil - now;
  if (mode === 'barras') { ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(k * 37, 0, 37, 130); }); ctx.fillStyle = '#000'; ctx.fillRect(0, 130, 256, 62); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.fillText('3:33 · SI OYES TU NOMBRE,', 12, 156); ctx.fillText('NO CONTESTES', 12, 176); }
  else if (mode === 'tvcam') { ctx.fillStyle = '#0b0f0b'; ctx.fillRect(0, 0, 256, 192); for (let k = 0; k < 400; k++) { ctx.fillStyle = `rgba(200,255,200,${Math.random() * 0.12})`; ctx.fillRect(Math.random() * 256, Math.random() * 192, 2, 2); }
    ctx.fillStyle = '#d33'; ctx.beginPath(); ctx.arc(14, 14, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#cfc'; ctx.font = '12px monospace'; ctx.fillText('EN VIVO · CÁMARA 3', 24, 18);
    for (const i of w.invs) if (i.alive && !i.escaped) { ctx.fillStyle = i.color; const x = i.x / W * 236 + 10, y = i.y / H * 150 + 30; ctx.fillRect(x - 3, y - 6, 6, 12); ctx.fillStyle = '#cfc'; ctx.fillText(i.name, x + 5, y); } }
  else { ctx.fillStyle = '#10204a'; ctx.fillRect(0, 0, 256, 192); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('NOTICIAS · ÚLTIMA HORA', 12, 26); ctx.font = '12px sans-serif'; ctx.fillText('Asesinato en la casona', 12, 52); casLocal.tvNames.slice(0, 4).forEach((n, k) => ctx.fillText('· ' + n, 16, 74 + k * 16));
    if (left < 2500 && eyesImg.complete) ctx.drawImage(eyesImg, 0, 0, 256, 192); for (let k = 0; k < 200; k++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`; ctx.fillRect(Math.random() * 256, Math.random() * 192, 2, 1); } }
  casMeshes.tvTex.needsUpdate = true;
}
function casScene(t, dt) {
  if (!w || !scene) return; const V = viewer(), now = performance.now(); ensureTV(); tvDraw(now);
  if (casMeshes.shadow && now > casMeshes.shadowUntil) casMeshes.shadow.visible = false;
  // señuelo: la silueta del ánima al fondo del pasillo; se esfuma si te acercas
  const dc = w.decoy; if (dc && V) { const key = dc.x + ':' + dc.y; if (!casMeshes.decoy || casLocal.decoyKey !== w.g.look) { if (casMeshes.decoy) scene.remove(casMeshes.decoy.g); casMeshes.decoy = makeGhostRig(w.g.look, ''); scene.add(casMeshes.decoy.g); casLocal.decoyKey = w.g.look; }
    const d = V.f === dc.f ? Math.hypot(V.x - dc.x, V.y - dc.y) : 99; const m = casMeshes.decoy; m.g.visible = d >= 6 && d <= 22 && V.f === dc.f; m.g.position.set(dc.x, dc.f * FH, dc.y); m.g.rotation.y = -Math.atan2(V.y - dc.y, V.x - dc.x) + Math.PI / 2; animateGhostRig(m, { x: dc.x + dc.f * 100, y: dc.y, t, dt, hunt: false, op: 0.85 }); }
  else if (casMeshes.decoy) casMeshes.decoy.g.visible = false;
  // un cuerpo tirado con tu ropa: desaparece al mirarlo de frente
  const cp = w.corpse; if (cp && V && casLocal.corpseGone !== cp.until) { if (!casMeshes.corpse || casMeshes.corpse.char !== cp.char) { if (casMeshes.corpse) scene.remove(casMeshes.corpse.r.g); const r = makeCharacter(cp.char); r.mats.forEach(mm => { mm.color.multiplyScalar(0.45); }); scene.add(r.g); casMeshes.corpse = { r, char: cp.char }; }
    const r = casMeshes.corpse.r; r.g.visible = V.f === cp.f; r.g.position.set(cp.x, cp.f * FH + 0.15, cp.y); r.g.rotation.set(-Math.PI / 2, 0, 0.6);
    const look = angDiff(Math.atan2(cp.y - V.y, cp.x - V.x), yaw) < 0.3 && Math.hypot(V.x - cp.x, V.y - cp.y) < 9; if (look) { cp.lookT = (cp.lookT || 0) + dt; if (cp.lookT > 0.6) { casLocal.corpseGone = cp.until; r.g.visible = false; tone(50, 0.8, 'sine', 0.2, null, -10); } } }
  else if (casMeshes.corpse) casMeshes.corpse.r.g.visible = false;
  // alguien de rodillas rezando con una veladora, en un cuarto oscuro
  const kn = w.kneel; if (kn && V && casLocal.kneelGone !== kn.until) { if (!casMeshes.kneel) { const r = makeCharacter(kn.char); r.mats.forEach(mm => mm.color.multiplyScalar(0.6)); scene.add(r.g); const L = new THREE.PointLight(0xffb050, 2, 4); scene.add(L); casMeshes.kneel = r; casMeshes.kneelLight = L; }
    const r = casMeshes.kneel; r.g.visible = V.f === kn.f; r.g.position.set(kn.x, kn.f * FH - 0.45, kn.y); r.g.rotation.y = 0.8; casMeshes.kneelLight.position.set(kn.x + 0.4, kn.f * FH + 0.3, kn.y + 0.2); casMeshes.kneelLight.visible = r.g.visible; casMeshes.kneelLight.intensity = 1.6 + Math.sin(t * 13) * 0.4;
    if (V.f === kn.f && Math.hypot(V.x - kn.x, V.y - kn.y) < 4) { casLocal.kneelGone = kn.until; r.g.visible = false; casMeshes.kneelLight.visible = false; noise(0.3, 'highpass', 2500, 0.5, 0.15, null); } }
  else if (casMeshes.kneel) { casMeshes.kneel.g.visible = false; casMeshes.kneelLight.visible = false; }
  $('#recon').hidden = now > casLocal.reconUntil;
}
const _updateScene = updateScene; updateScene = function (t, dt) { _updateScene(t, dt); casScene(t, dt); };
const _buildHouse = buildHouse; buildHouse = function () { casMeshes = { decoy: null, corpse: null, kneel: null, kneelLight: null, shadow: null, shadowUntil: 0, tv: null, tvTex: null, tvCtx: null }; Object.assign(casLocal, { corpseGone: 0, kneelGone: 0, decoyKey: null, tvMode: null, tvUntil: 0, tvDrawn: null }); _buildHouse(); };

// ---------- la Llorona: muy rara vez, en la cacería, sus pasos se oyen lejos estando cerca ----------
const _huntAudio = huntAudio;
huntAudio = function (dt) {
  const g = w && w.g, V = viewer();
  if (g && g.hunt && g.hunt.inv && V && V.f === g.f) { const gx = g.x, gy = g.y, d = Math.hypot(V.x - gx, V.y - gy) || 0.01, d2_ = Math.max(1.5, 24 - d); g.x = V.x + (gx - V.x) / d * d2_; g.y = V.y + (gy - V.y) / d * d2_; _huntAudio(dt); g.x = gx; g.y = gy; return; }
  _huntAudio(dt);
};

// ---------- voz propia: ¿estoy hablando o gritando? (para el Yohualtepuztli) ----------
setInterval(() => { if (!w || !VOICE.on) return; const me = w.invs[ME]; if (!me) return; const l = VOICE.level || 0; me.talking = l > 0.03; if (l > 0.14) casLocal.loudUntil = performance.now() + 600; me.loud = performance.now() < (casLocal.loudUntil || 0); }, 100);

// ---------- libreta con colores y apuesta ----------
function myJournal() { return { c: Object.keys(w.conf || {}), d: Object.keys(w.discard || {}).filter(k => w.discard[k]), g: Object.keys(w.discardG || {}).filter(k => w.discardG[k]) }; }
function syncJournal() { if (!w) return; const j = myJournal(); const me = w.invs[ME]; if (NET.mode === 'guest') NET.journalOut = j; else if (me) me.journal = j; }
function myGuess() { return NET.mode === 'guest' ? NET.myGuess : w && w.invs[ME] && w.invs[ME].guess; }
function setGuess(id) { if (NET.mode === 'guest') NET.myGuess = id; else if (w) w.invs[ME].guess = id; toast(`Tu apuesta: <b>${GT[id].n}</b>. Para terminar, sal por el zaguán.`, '', 3); }
journalHTML = function (canName) {
  const c = candidates(w, true), p = pruebas(w), others = w.invs.filter(i => i.id !== ME && !i.bot && i.journal);
  const dots = (k, kind) => others.map(i => { const j = i.journal; const st = (kind === 'ev' ? (j.c.includes(k) ? '✓' : j.d.includes(k) ? '✗' : '') : (j.g.includes(k) ? '✗' : '')); return st ? `<i class="jd" style="background:${i.color}" title="${i.name}">${st}</i>` : ''; }).join('');
  let h = `<h3>Evidencias <small>clic: marcar ✓ → tachar ✗ → borrar · los puntos de color son las marcas de tus compañeros</small></h3>`;
  EV_KEYS.forEach(k => { const st = w.conf[k] ? 'si' : w.discard[k] ? 'no' : 'na';
    h += `<div class="ev ${st}" data-ev="${k}"><span>${cardImg(EV[k].tool, 'mci')}${EV[k].n}<small>${ITEMS[EV[k].tool].n}</small></span><span class="jdots">${dots(k, 'ev')}</span><b>${st === 'si' ? '✓' : st === 'no' ? '✗' : '?'}</b></div>`; });
  const gs = myGuess();
  h += `<p class="hint">Marcadas: <b>${p}</b>. Nadie te avisa si una lectura es real. ${gs ? `Tu apuesta: <b>${GT[gs].n}</b>.` : 'Elige un ánima y márcala como tu apuesta.'} Para terminar la noche, <b>sal por el zaguán</b>: el resultado se ve afuera.</p>`;
  h += `<h3>Ánimas posibles (${c.length})</h3>`;
  GHOSTS.forEach(G => { const ok = c.includes(G) && !(w.discardG && w.discardG[G.id]); h += `<div class="cand ${ok ? '' : 'out'} ${gs === G.id ? 'guess' : ''}" data-g="${G.id}"><span>${G.n}${gs === G.id ? ' 🎯' : ''}<button class="gx" title="Tachar o destachar">${w.discardG && w.discardG[G.id] ? '↺' : '✗'}</button><small>${G.ev.map(k => EV[k].n).join(' · ')}</small></span><span class="jdots">${dots(G.id, 'g')}</span></div>`; });
  if (jSel) { const G = GT[jSel]; h = h.replace(`data-g="${jSel}">`, `data-g="${jSel}" class="sel">`); h += `<h3>${G.n}</h3><p><button class="guessbtn" data-guess="${G.id}">🎯 Esta es mi apuesta</button></p><p class="small"><b>${G.passive.n}.</b> ${G.passive.d}</p>`; }
  const obj = (w.obj || []).map(o => `${o.done ? '✅' : '⬜'} ${{ guarida: 'Encontrar su guarida antes del minuto 5', escondido: 'Sobrevivir a una cacería escondido', foto: 'Tomarle una foto al ánima', SU: 'Que la grabadora conteste', BC: 'Medir bajo cero', CE: 'Ver sus huellas con la UV' }[o.k]}`).join('<br>');
  h += `<h3>Objetivos de la noche <small>$25 cada uno</small></h3><p class="small">${obj}</p>`;
  h += `<h3>La casa</h3><p class="small">La instalación aguanta <b>${w.lightLimit}</b> focos prendidos a la vez; uno más y se botan los fusibles. Tu cámara instantánea tiene rollo de 6: las fotos del ánima, sus rastros y lo raro de la casona pagan.</p>`;
  return h;
};
$('#journal').addEventListener('click', e => { const b = e.target.closest('[data-guess]'); if (b) { setGuess(b.dataset.guess); $('#journalIn').innerHTML = journalHTML(false); return; } setTimeout(syncJournal, 0); });
showNaming = function () {};

// ---------- barra superior: Hora del ánima, amanecer, dinero ----------
const _hud = hud;
hud = function () {
  _hud(); const me = w.invs[ME];
  if (w.phase === 'hora') $('#top').innerHTML = `<span class="hora">5:59 a. m.</span><span><b>¡HORA DEL ÁNIMA!</b> La salida está trabada: aguanten <b>${fmt(Math.max(0, w.hora.until - w.t))}</b></span><span class="huntb">¡CACERÍA!</span>`;
  else if (w.phase === 'amanecer') $('#top').innerHTML = `<span class="hora">6:00 a. m.</span><span>Sale el sol: <b>salgan por el zaguán</b></span>`;
  if (w.opt.role === 'inv' && me) { const gs = myGuess(); const lit = litCount(w); const extra = `<div class="row small">🎯 ${gs ? GT[gs].n : '<em>sin apuesta</em> (libreta)'} · 💡 ${lit}/${w.lightLimit} focos · 📷 ${me.slots.filter(s => s && s.kind === 'fotocam').map(s => s.film).join(', ') || '—'}</div>`; const L = $('#left'); if (L && !L.querySelector('.casx')) L.insertAdjacentHTML('beforeend', `<div class="casx">${extra}</div>`); }
};

// ---------- final: quién salió, quién acertó y cuánto ganó ----------
showEnd = function () {
  freeMouse(); const o = w.over; $('#modal').hidden = false; const me = w.invs[ME];
  if (!o.res) return; const mine = o.res.find(r => r.id === ME);
  if (!o.paidLocal && mine && w.opt.role === 'inv') { wallet.add(mine.pay || 0); o.paidLocal = true; }
  const youWin = w.opt.role === 'inv' ? !!(mine && mine.out && mine.ok) : o.win === 'ghost';
  $('#modalIn').innerHTML = `<img class="endart" src="${ASSET}a/${o.win === 'inv' ? 'final_vivos' : 'final_anima'}.webp" alt=""><h2>${w.opt.role === 'bots' ? (o.win === 'inv' ? 'Ganan los investigadores' : 'Gana el ánima') : youWin ? '¡Acertaste y saliste con vida!' : 'Perdiste'}</h2><p class="big">${o.cause}</p>
    <p>Era <b>${w.g.def.n}</b> (${w.g.def.ev.map(k => EV[k].n).join(', ')}), con voz de ${w.g.voice === 'm' ? 'mujer' : 'hombre'} y su guarida en ${ROOMS[w.g.home.f][w.g.home.r].n}.${w.g.mimic ? ` Esta noche copiaba a ${GT[w.g.mimic].n}.` : ''}</p>
    <table class="endt"><thead><tr><th>Investigador</th><th>Salió</th><th>Apuesta</th><th>Fotos</th><th>Ganó</th></tr></thead><tbody>${o.res.map(r => `<tr${r.id === ME ? ' class="me"' : ''}><td>${r.name}${r.bot ? ' <small>(bot)</small>' : ''}</td><td>${r.out ? 'Sí' : r.alive ? 'No' : 'Murió'}</td><td>${r.guess ? GT[r.guess].n + (r.ok ? ' ✓' : ' ✗') : '—'}</td><td>$${r.fotos || 0}</td><td><b>$${r.pay}</b></td></tr>`).join('')}</tbody></table>
    <p class="small">Evidencias reales encontradas: ${o.evid} ($20 c/u) · objetivos: ${o.objDone} de 3 ($25 c/u) · salir con vida $15 · acertar multiplica (×2 con 3 evidencias), fallar o no apostar ×0,5.</p>
    <p>Tu dinero: <b>$${wallet.get()}</b></p>
    <div class="btns">${NET.mode === 'guest' ? '' : '<button id="again">Jugar otra</button>'}<button id="tomenu" class="ghostbtn">Menú</button></div>`;
  const ag = $('#again'); if (ag) ag.onclick = () => start(); $('#tomenu').onclick = () => toMenu();
};

// ---------- la ruleta de la noche ahora dice también la tragamonedas y los objetivos ----------
nightRoulette = function () {
  const cnt = {}; w.items.filter(it => !TOOLS.includes(it.kind)).forEach(it => (cnt[it.kind] = (cnt[it.kind] || 0) + 1));
  const rn = rr => `${ROOMS[rr.f][rr.r].n} (${rr.f ? 'planta alta' : 'planta baja'})`; const M = w.mods || {};
  const el = document.createElement('div'); el.id = 'ruleta'; el.innerHTML = `<div class="rbox"><h3>Esta noche</h3>${M.casa ? `<p>🎰 ${SLOT.casa.find(x => x.id === M.casa).n} · ${SLOT.noche.find(x => x.id === M.noche).n} · ${SLOT.trato.find(x => x.id === M.trato).n}</p>` : ''}<p>🕯 <b>Altar:</b> ${rn(w.altarRoom)} · ⚡ <b>Fusibles:</b> ${rn(w.fuseRoom)} · 💡 aguanta <b>${w.lightLimit}</b> focos</p>
    <p><b>En la casa hay:</b></p><div class="rgrid">${Object.entries(cnt).map(([k, n]) => `<span>${cardImg(k, 'mci')}${ITEMS[k].n} ×${n}</span>`).join('')}</div><p class="small">Llevas 3 lugares de equipo y la linterna. Para terminar, marca tu apuesta en la libreta y <b>sal por el zaguán</b> antes del alba.</p><button>A la casona</button></div>`;
  $('#game').appendChild(el); el.querySelector('button').onclick = () => el.remove(); setTimeout(() => el.remove(), 14000);
};

// ---------- tragamonedas al inicio de la noche ----------
const SLOT = {
  casa: [{ id: 'velas', n: 'Más veladoras' }, { id: 'radio', n: 'Una radio en la casa' }, { id: 'camara', n: 'Una cámara de más' }, { id: 'focos', n: 'Sin focos de repuesto' }, { id: 'te', n: 'Más té de tila' }],
  noche: [{ id: 'tormenta', n: 'Tormenta: el ánima oye menos' }, { id: 'luna', n: 'Luna llena: cacerías más seguidas' }, { id: 'niebla', n: 'Niebla: la noche dura 1 min más' }, { id: 'vieja', n: 'Instalación vieja: un foco menos' }, { id: 'calma', n: 'Noche tranquila: la casona hace menos' }],
  trato: [{ id: 'rollo', n: '+1 rollo de fotos', b: true }, { id: 'copal', n: 'Empiezan con un Copal', b: true }, { id: 'cordura', n: 'Cordura inicial −10 (paga ×1,2)' }, { id: 'hambre', n: 'El ánima empieza hambrienta (paga ×1,2)' }, { id: 'sinluz', n: 'Sin luz arriba (paga ×1,2)' }],
};
let slotSpins = 0;
function slotRoll(k) { menuOpt.mods = menuOpt.mods || {}; menuOpt.mods[k] = pick(SLOT[k]).id; }
function showSlot(done) {
  menuOpt.mods = {}; slotSpins = 0; ['casa', 'noche', 'trato'].forEach(slotRoll);
  const el = document.createElement('div'); el.id = 'slot'; document.body.appendChild(el);
  const cost = () => [30, 60, 120][Math.min(2, slotSpins)];
  const draw = () => { const M = menuOpt.mods, cash = wallet.get();
    el.innerHTML = `<div class="sbox"><h2>🎰 La tragamonedas de la noche</h2><div class="reels">${['casa', 'noche', 'trato'].map(k => `<div class="reel"><small>${{ casa: 'La casa', noche: 'La noche', trato: 'El trato' }[k]}</small><b>${SLOT[k].find(x => x.id === M[k]).n}</b><button data-one="${k}" ${cash < 20 ? 'disabled' : ''}>Girar este · $20</button></div>`).join('')}</div>
      <p>Tu dinero: <b>$${cash}</b></p><div class="btns"><button id="spinAll" ${cash < cost() ? 'disabled' : ''}>Girar los tres · $${cost()}</button><button id="slotGo">¡A la casona!</button></div><p class="small">El dinero se gana en cada noche: evidencias, objetivos, fotos y salir con vida. Nunca compra ventaja para deducir.</p></div>`;
    el.querySelectorAll('[data-one]').forEach(b => b.onclick = () => { if (wallet.get() < 20) return; wallet.add(-20); slotRoll(b.dataset.one); tone(600, 0.1, 'square', 0.05, null); draw(); });
    el.querySelector('#spinAll').onclick = () => { const c = cost(); if (wallet.get() < c) return; wallet.add(-c); slotSpins++; ['casa', 'noche', 'trato'].forEach(slotRoll); tone(500, 0.3, 'square', 0.05, null, 400); draw(); };
    el.querySelector('#slotGo').onclick = () => { el.remove(); done(); }; };
  draw();
}
const _start = start;
start = function (netStart) { if (!netStart && NET.mode !== 'guest' && !start.skipSlot && menuOpt.role !== 'bots') { if (!audio) initAudio(); showSlot(() => { start.skipSlot = true; try { _start(); } finally { start.skipSlot = false; } }); return; } if (menuOpt.role === 'bots') menuOpt.mods = {}; _start(netStart); syncJournal(); };
{ const box = document.createElement('p'); box.className = 'small'; box.id = 'walletLine'; const opts = $('#opts'); if (opts && opts.parentElement) opts.parentElement.insertBefore(box, $('#play')); const upd = () => { box.innerHTML = `💰 Tu dinero: <b>$${wallet.get()}</b> · al empezar gira la tragamonedas de la noche.`; }; upd(); setInterval(upd, 2000); }
document.body.insertAdjacentHTML('beforeend', '<div id="recon" hidden><div>Reconectando…</div></div>');
EMOJI.fotocam = '📷';
