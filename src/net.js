// ================= En línea: sala con código, anfitrión y voz =================
// El navegador de quien crea la sala es el anfitrión: corre la partida (casona, ánima bot y reglas)
// y manda el estado a los demás ~10 veces por segundo. Cada invitado mueve su propio cuerpo
// (para que no se sienta retraso) y manda lo que hace. PeerJS solo presenta a los navegadores;
// la partida y la voz viajan directo entre ellos (WebRTC).
const NET_ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };
const NET = {
  mode: 'off',            // 'off' | 'host' | 'guest'
  peer: null, code: '', id: '', hostConn: null, conns: new Map(),
  me: { name: '', char: 'ines' }, lobby: [], started: false,
  inputs: new Map(),       // anfitrión: peer -> última entrada del invitado
  outEv: [], outLog: [], sendT: 0, inT: 0, pressAcc: new Set(),
  localPe: 0, cb: {},      // callbacks de la interfaz: lobby, start, status, end
};
const netStatus = (msg, ok) => { if (NET.cb.status) NET.cb.status(msg, ok); };
function netCode4() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; return Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join(''); }

function netHost(name, char) {
  if (!window.Peer) { netStatus('No cargó la librería de red (PeerJS). Revisa tu internet.', false); return; }
  netClose(); NET.mode = 'host'; NET.code = netCode4(); NET.me = { name, char };
  NET.peer = new Peer('nda3d-' + NET.code, { config: NET_ICE });
  NET.peer.on('open', id => { NET.id = id; NET.lobby = [{ peer: id, name, char }]; netLobbyChanged(); netStatus(`Sala ${NET.code} creada. Comparte el código.`, true); });
  NET.peer.on('connection', c => netGuestConn(c));
  NET.peer.on('call', call => VOICE.answer(call));
  NET.peer.on('error', e => { if (e.type === 'unavailable-id') { netStatus('Ese código ya existe; vuelve a crear la sala.', false); return; } netStatus('Error de red: ' + e.type, false); });
  NET.peer.on('disconnected', () => { try { NET.peer.reconnect(); } catch (e) {} });
}
function netJoin(code, name, char) {
  if (!window.Peer) { netStatus('No cargó la librería de red (PeerJS). Revisa tu internet.', false); return; }
  netClose(); NET.mode = 'guest'; NET.code = code; NET.me = { name, char };
  NET.peer = new Peer({ config: NET_ICE });
  NET.peer.on('open', id => {
    NET.id = id; netStatus('Buscando la sala…');
    const c = NET.peer.connect('nda3d-' + code, { reliable: true, metadata: { name, char } }); NET.hostConn = c;
    c.on('open', () => netStatus(`Dentro de la sala ${code}. Espera a que el anfitrión empiece.`, true));
    c.on('data', d => netGuestData(d));
    c.on('close', () => { netStatus('El anfitrión cerró la sala.', false); if (NET.cb.end) NET.cb.end('El anfitrión salió de la partida.'); });
  });
  NET.peer.on('call', call => VOICE.answer(call));
  NET.peer.on('error', e => netStatus(e.type === 'peer-unavailable' ? 'No existe una sala con ese código.' : 'Error de red: ' + e.type, false));
  NET.peer.on('disconnected', () => { try { NET.peer.reconnect(); } catch (e) {} });
}
function netClose() {
  VOICE.stopAll();
  try { if (NET.peer) NET.peer.destroy(); } catch (e) {}
  Object.assign(NET, { mode: 'off', peer: null, hostConn: null, conns: new Map(), lobby: [], started: false, inputs: new Map(), outEv: [], outLog: [] });
}
function netLobbyChanged() {
  // un personaje por jugador: si se repite, el anfitrión le da otro libre
  const used = new Set();
  for (const p of NET.lobby) { if (used.has(p.char)) { const free = NAMES.find(n => !used.has(n[2])); if (free) p.char = free[2]; } used.add(p.char); }
  if (NET.mode === 'host') for (const c of NET.conns.values()) if (c.open) c.send({ t: 'lobby', p: NET.lobby, code: NET.code });
  if (NET.cb.lobby) NET.cb.lobby(NET.lobby);
}
function netGuestConn(c) {
  c.on('open', () => {
    if (NET.started || NET.lobby.length >= 4) { c.send({ t: 'full', why: NET.started ? 'La partida ya empezó.' : 'La sala está llena (4 investigadores).' }); setTimeout(() => c.close(), 300); return; }
    NET.conns.set(c.peer, c); const m = c.metadata || {};
    NET.lobby.push({ peer: c.peer, name: String(m.name || 'Investigador').slice(0, 16), char: m.char || 'ines' }); netLobbyChanged();
  });
  c.on('data', d => netHostData(c, d));
  c.on('close', () => {
    NET.conns.delete(c.peer); NET.inputs.delete(c.peer); VOICE.close(c.peer);
    if (!NET.started) { NET.lobby = NET.lobby.filter(p => p.peer !== c.peer); netLobbyChanged(); return; }
    if (NET.cb.left) NET.cb.left(c.peer);
  });
}
function netHostData(c, d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'in') { const prev = NET.inputs.get(c.peer); const acc = prev ? prev.press : new Set(); (d.press || []).forEach(k => acc.add(k)); NET.inputs.set(c.peer, Object.assign({}, d, { press: acc, acts: (prev && prev.acts || []).concat(d.acts || []) })); }
  if (d.t === 'clip' && typeof d.d === 'string' && d.d.length < 60000) { const W_ = window.__game && window.__game.w, inv = W_ && W_.invs.find(i => i.peer === c.peer); if (inv) { VOICE.gotClip(inv.id, d.tag, d.d); for (const o of NET.conns.values()) if (o.open && o !== c) o.send({ t: 'clip', who: inv.id, tag: d.tag, d: d.d }); } }
  if (d.t === 'char') { const p = NET.lobby.find(p => p.peer === c.peer); if (p) { p.char = d.char; p.name = String(d.name || p.name).slice(0, 16); netLobbyChanged(); } }
}
function netGuestData(d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'lobby') { NET.lobby = d.p; if (NET.cb.lobby) NET.cb.lobby(NET.lobby); }
  else if (d.t === 'full') netStatus(d.why, false);
  else if (d.t === 'start') { NET.started = true; if (NET.cb.start) NET.cb.start(d); }
  else if (d.t === 'snap') { if (NET.cb.snap) NET.cb.snap(d); }
  else if (d.t === 'clip') VOICE.gotClip(d.who, d.tag, d.d);
}

// ---------- serializar el mundo ----------
const NET_SKIP = new Set(['ghostMask', 'invMask', 'doorTile', 'events', 'log', 'opt', 'roster', 'say', 'ev', 'noise', 'sub', 'fxAdd', 'haunt', 'lines', 'conf', 'discard', 'discardG', 'team']);
function netEnc(w, full) {
  const invs = new Set(w.invs), its = new Set(w.items), dr = new Map(w.doors.map((d, k) => [d, k]));
  const R = v => Math.round(v * 1000) / 1000;
  function E(v, canon) {
    if (v === null || v === undefined) return v;
    const ty = typeof v;
    if (ty === 'number') return Number.isFinite(v) ? R(v) : (v > 0 ? 1e9 : v < 0 ? -1e9 : 0);
    if (ty === 'string' || ty === 'boolean') return v;
    if (ty !== 'object') return undefined;
    if (!canon) { if (invs.has(v)) return { $i: v.id }; if (its.has(v)) return { $t: v.id }; if (dr.has(v)) return { $d: dr.get(v) }; if (v === w.g) return { $g: 1 }; if (GHOSTS.includes(v)) return { $G: v.id }; }
    if (ArrayBuffer.isView(v)) return { $a: Array.from(v, R) };
    if (v instanceof Set) return { $s: [...v].map(x => E(x)) };
    if (v instanceof Map) return { $m: [...v].map(([k, x]) => [E(k), E(x)]) };
    if (Array.isArray(v)) return v.map(x => { const e = E(x); return e === undefined ? null : e; });
    const o = {}; for (const k in v) { const e = E(v[k]); if (e !== undefined) o[k] = e; } return o;
  }
  const out = { ALTAR: Object.assign({}, ALTAR_POS), FUSE: Object.assign({}, FUSE) };
  // objetos, puertas y objetos sueltos casi no cambian: solo se mandan los que cambiaron (y todo cada 3 s)
  const key = full || !NET.cache || w.t - NET.cache.t > 3; if (key) NET.cache = { t: w.t, items: new Map(), doors: [], loose: [] };
  const C = NET.cache, diff = (arr, store, canon, idOf) => { const ch = []; arr.forEach((x, k) => { const e = E(x, canon), j = JSON.stringify(e), id = idOf ? idOf(x, k) : k; if (store instanceof Map ? store.get(id) !== j : store[id] !== j) { if (store instanceof Map) store.set(id, j); else store[id] = j; ch.push([id, e]); } }); return ch; };
  for (const k in w) {
    if (NET_SKIP.has(k)) continue;
    if (k === 'invs') out.invs = w.invs.map(x => E(x, true));
    else if (k === 'items') out.items = { ids: w.items.map(x => x.id), ch: diff(w.items, C.items, true, x => x.id) };
    else if (k === 'doors') out.doors = { ch: diff(w.doors, C.doors, true) };
    else if (k === 'loose') out.loose = { n: w.loose.length, ch: diff(w.loose, C.loose, false) };
    else if (k === 'g') out.g = E(w.g, true);
    else { const e = E(w[k]); if (e !== undefined) out[k] = e; }
  }
  const ev = NET.outEv.map(e => E(e)); NET.outEv = [];
  const lg = NET.outLog; NET.outLog = [];
  return { s: out, ev, lg };
}
// invitado: aplica el estado del anfitrión sobre su propio mundo (mismos objetos, para no romper el render)
function netApply(w, pkt, meIdx) {
  const s = pkt.s, byId = new Map(w.items.map(x => [x.id, x]));
  const items = s.items.ids.map(id => byId.get(id) || { id }); const itemMap = new Map(items.map(x => [x.id, x]));
  const D = v => {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(D);
    if ('$i' in v) return w.invs[v.$i] || null; if ('$t' in v) return itemMap.get(v.$t) || null; if ('$d' in v) return w.doors[v.$d] || null;
    if ('$g' in v) return w.g; if ('$G' in v) return GT[v.$G]; if ('$a' in v) return v.$a;
    if ('$s' in v) return new Set(v.$s.map(D)); if ('$m' in v) return new Map(v.$m.map(([k, x]) => [D(k), D(x)]));
    const o = {}; for (const k in v) o[k] = D(v[k]); return o;
  };
  const put = (tgt, o, keep) => { for (const k in o) if (!keep || !keep.has(k)) tgt[k] = D(o[k]); };
  Object.assign(ALTAR_POS, s.ALTAR); Object.assign(FUSE, s.FUSE);
  for (const [id, o] of s.items.ch) { const it = itemMap.get(id); if (it) put(it, o); } w.items = items;
  for (const [k, o] of s.doors.ch) if (w.doors[k]) put(w.doors[k], o);
  if (s.loose) { w.loose.length = Math.min(w.loose.length, s.loose.n); for (const [k, o] of s.loose.ch) { if (!w.loose[k]) w.loose[k] = {}; put(w.loose[k], o); } }
  // investigadores: el mío lo muevo yo (salvo que el anfitrión me haya movido); los demás se suavizan
  const POSE = new Set(['x', 'y', 'face', 'vx', 'vy', 'stam', 'tired']);
  s.invs.forEach((o, k) => {
    const i = w.invs[k]; if (!i) return;
    if (k === meIdx) {
      const forced = o.pe !== NET.localPe || !o.alive || o.hidden >= 0 || o.possessed;
      if (forced) { NET.localPe = o.pe; put(i, o); } else put(i, o, POSE);
    } else {
      const tx = o.x, ty = o.y, far = i.f !== o.f || Math.hypot((i.x || 0) - tx, (i.y || 0) - ty) > 3;
      put(i, o, POSE); i._tx = tx; i._ty = ty; i._tf = o.face; if (far || i.x === undefined) { i.x = tx; i.y = ty; i.face = o.face; }
    }
  });
  { const g = w.g, o = s.g, far = g.f !== o.f || Math.hypot(g.x - o.x, g.y - o.y) > 3; put(g, o, POSE); g._tx = o.x; g._ty = o.y; g._tf = o.face; if (far) { g.x = o.x; g.y = o.y; g.face = o.face; } }
  for (const k in s) { if (['items', 'doors', 'loose', 'invs', 'g', 'ALTAR', 'FUSE'].includes(k)) continue; w[k] = D(s[k]); }
  for (const e of pkt.ev || []) w.events.push(D(e));
  for (const l of pkt.lg || []) { w.log.push(l); if (w.log.length > 120) w.log.shift(); }
}
// invitado: suaviza a los demás entre paquetes
function netSmooth(w, dt, meIdx) {
  const k = Math.min(1, dt * 12);
  const lerpA = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
  for (const i of w.invs) if (i.id !== meIdx && i._tx !== undefined) { i.x += (i._tx - i.x) * k; i.y += (i._ty - i.y) * k; if (i._tf !== undefined) i.face = lerpA(i.face, i._tf); }
  const g = w.g; if (g._tx !== undefined) { g.x += (g._tx - g.x) * k; g.y += (g._ty - g.y) * k; if (g._tf !== undefined) g.face = lerpA(g.face, g._tf); }
}
// invitado: mueve su propio cuerpo con las mismas reglas que el motor
function netLocalMove(w, i, inp, dt) {
  if (!i.alive || i.escaped || i.hidden >= 0 || i.possessed || w.t < (i.stunUntil || 0)) return false;
  i.vx = i.vx || 0; i.vy = i.vy || 0;
  if (!(inp.mx || inp.my)) {
    const k = Math.max(0, 1 - CFG.decel * dt / Math.max(0.01, Math.hypot(i.vx, i.vy))); i.vx *= k; i.vy *= k; if (Math.hypot(i.vx, i.vy) > 0.01) tryMove(w, i, i.vx * dt, i.vy * dt);
    i.stam = Math.min(100, i.stam + CFG.stamRest * dt);
  } else {
    let sp = CFG.walk; const running = inp.sprint && !i.tired && i.stam > 0;
    if (running) { sp = CFG.sprint; i.stam = Math.max(0, i.stam - CFG.stamDrain * dt); } else i.stam = Math.min(100, i.stam + CFG.stamWalk * dt);
    if (i.stam <= 0) i.tired = true; if (i.tired && i.stam >= CFG.stamMin) i.tired = false;
    if (w.t < (i.slowUntil || 0)) sp *= 0.7;
    const l = Math.hypot(inp.mx, inp.my), tx = inp.mx / l * sp, ty = inp.my / l * sp, dvx = tx - i.vx, dvy = ty - i.vy, dl = Math.hypot(dvx, dvy), a = CFG.accel * dt;
    if (dl > a) { i.vx += dvx / dl * a; i.vy += dvy / dl * a; } else { i.vx = tx; i.vy = ty; }
    const ox = i.x, oy = i.y; tryMove(w, i, i.vx * dt, i.vy * dt); if (Math.abs(i.x - ox) < 1e-5) i.vx *= 0.5; if (Math.abs(i.y - oy) < 1e-5) i.vy *= 0.5;
  }
  if (inp.face !== undefined) i.face = inp.face;
  return true;
}
// anfitrión: guarda eventos y mensajes para mandarlos a los invitados
function netHookWorld(w) {
  const ev0 = w.ev, say0 = w.say;
  w.ev = (type, data) => { ev0(type, data); NET.outEv.push(Object.assign({ type }, data || {})); if (NET.outEv.length > 200) NET.outEv.shift(); };
  w.say = (msg, vis) => { say0(msg, vis); NET.outLog.push(Object.assign({}, w.log[w.log.length - 1])); if (NET.outLog.length > 60) NET.outLog.shift(); };
}
// anfitrión: arma la entrada del paso con la de cada humano y aplica sus posiciones
function netHostInputs(w, localIdx, localInput) {
  const by = {}; by[localIdx] = localInput;
  for (const i of w.invs) {
    if (!i.peer || i.id === localIdx || i.escaped) continue;
    i.remote = true;
    const d = NET.inputs.get(i.peer);
    if (!d) { by[i.id] = { mx: 0, my: 0, sprint: false, press: new Set() }; continue; }
    const poseOk = d.pe === i.pe && i.alive && i.hidden < 0 && !i.possessed;
    if (poseOk && typeof d.x === 'number') { i.x = d.x; i.y = d.y; i.vx = d.vx || 0; i.vy = d.vy || 0; i.stam = d.stam; i.tired = !!d.tired; i._ax = d.x; i._ay = d.y; i._af = i.f; } else { i._ax = i.x; i._ay = i.y; i._af = i.f; }
    i.radio = !!d.radio; i.loud = !!d.loud; i.talking = !!d.talk; if (d.guess !== undefined) i.guess = d.guess; if (d.jr) i.journal = d.jr;
    by[i.id] = { mx: i.alive ? 0 : d.mx || 0, my: i.alive ? 0 : d.my || 0, sprint: !!d.sprint, moving: !!d.moving, face: d.face, press: d.press || new Set(), throwPower: d.tp };
    for (const a of d.acts || []) netAct(w, i, a);
    d.press = new Set(); d.acts = [];
  }
  return { multi: true, ghost: null, by };
}
function netAct(w, i, a) {
  if (!a || typeof a !== 'object') return;
  if (a.k === 'name' && GT[a.id]) nameGhost(w, i, a.id);
  if (a.k === 'haunt' && i.alive) w.haunt(i, Math.min(15, +a.v || 0));
}
// anfitrión: si el motor movió a alguien (escalera, escondite, posesión), sube su época para que su navegador lo acepte
function netAfterStep(w) {
  for (const i of w.invs) if (i.remote && i._ax !== undefined && (Math.hypot(i.x - i._ax, i.y - i._ay) > 0.25 || i.f !== i._af)) i.pe = (i.pe || 0) + 1;
}
function netBroadcast(w) {
  if (!NET.conns.size) { NET.outEv = []; NET.outLog = []; return; }
  const pkt = Object.assign({ t: 'snap' }, netEnc(w, false));
  for (const c of NET.conns.values()) if (c.open) c.send(pkt);
}
function netSendInput(inp, me, acts) {
  const c = NET.hostConn; if (!c || !c.open) return;
  c.send({ t: 'in', x: me.x, y: me.y, vx: me.vx, vy: me.vy, stam: me.stam, tired: me.tired, face: inp.face, sprint: inp.sprint, moving: !!(inp.mx || inp.my), mx: inp.mx, my: inp.my, tp: inp.throwPower, radio: !!me.radio, loud: !!me.loud, talk: !!me.talking, guess: NET.myGuess, jr: NET.journalOut || null, press: [...NET.pressAcc], acts, pe: NET.localPe });
  NET.pressAcc.clear(); NET.journalOut = null;
}

// ---------- Voz por cercanía ----------
// Distancia máxima 15 m; un muro entre los dos baja el volumen; otro piso casi no se oye.
// Mantener V habla por radio: se oye a cualquier distancia con sonido de radio.
const VOICE = {
  stream: null, calls: new Map(), ctx: null, radio: false, on: false, err: '',
  clips: [], ring: null, ringPos: 0, sr: 48000,
  ac() { if (!this.ctx) this.ctx = (window.__audioCtx && window.__audioCtx()) || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  async enable() {
    if (this.stream) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { this.err = 'Este navegador no permite el micrófono aquí.'; return false; }
    try { this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { this.err = 'Micrófono bloqueado (' + e.name + ').'; return false; }
    this.on = true; this.capture(); return true;
  },
  callAll(humans) { if (!this.stream || !NET.peer) return; for (const h of humans) if (h.peer && h.peer !== NET.id && !this.calls.has(h.peer) && NET.id < h.peer) this.setup(h.peer, NET.peer.call(h.peer, this.stream)); },
  answer(call) { if (this.calls.has(call.peer)) this.close(call.peer); this.setup(call.peer, call); if (this.stream) call.answer(this.stream); else call.answer(); },
  setup(id, call) {
    const e = { call }; this.calls.set(id, e);
    call.on('stream', s => this.attach(id, s));
    call.on('close', () => { if (this.calls.get(id) === e) this.calls.delete(id); });
    call.on('error', () => {});
  },
  attach(id, stream) {
    const e = this.calls.get(id); if (!e || e.src) return; const a = this.ac();
    e.el = new Audio(); e.el.srcObject = stream; e.el.muted = true; e.el.play().catch(() => {});
    e.src = a.createMediaStreamSource(stream);
    e.pan = a.createStereoPanner ? a.createStereoPanner() : null;
    e.lp = a.createBiquadFilter(); e.lp.type = 'lowpass'; e.lp.frequency.value = 12000;
    e.g = a.createGain(); e.g.gain.value = 0;
    let n = e.src.connect(e.lp).connect(e.g); if (e.pan) n = n.connect(e.pan); n.connect(a.destination);
    const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500; const lp2 = a.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 2800;
    const sh = a.createWaveShaper(); const c = new Float32Array(256); for (let k = 0; k < 256; k++) { const x = k / 255 * 2 - 1; c[k] = Math.tanh(3 * x) * 0.8; } sh.curve = c;
    e.gr = a.createGain(); e.gr.gain.value = 0; e.src.connect(hp).connect(lp2).connect(sh).connect(e.gr).connect(a.destination);
  },
  close(id) { const e = this.calls.get(id); if (!e) return; try { e.call.close(); } catch (er) {} if (e.el) e.el.srcObject = null; this.calls.delete(id); },
  stopAll() { for (const id of [...this.calls.keys()]) this.close(id); },
  // volumen de cada voz según dónde está cada quien en la casona
  update(w, me, yaw) {
    if (!me || !this.calls.size) return; const a = this.ac(), now = a.currentTime;
    for (const [id, e] of this.calls) {
      if (!e.g) continue; const o = w.invs.find(i => i.peer === id); if (!o) continue;
      let v = 0, muff = false;
      const bothDead = !me.alive && !o.alive, mixed = me.alive !== o.alive;
      if (!mixed || bothDead) {
        const d = Math.hypot(o.x - me.x, o.y - me.y);
        if (o.f === me.f) { v = Math.max(0, 1 - d / 15); if (!los(me.f, me.x, me.y, o.x, o.y)) { v *= 0.35; muff = true; } }
        else { v = Math.max(0, 1 - d / 8) * 0.25; muff = true; }
        v = v * v;
      }
      if (o.escaped || me.escaped) v = 0;
      e.vol = v; e.g.gain.setTargetAtTime(v, now, 0.08); e.lp.frequency.setTargetAtTime(muff ? 900 : 12000, now, 0.1);
      if (e.pan) { const ang = Math.atan2(o.y - me.y, o.x - me.x) - yaw; e.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, Math.sin(ang))) * 0.7, now, 0.1); }
      e.gr.gain.setTargetAtTime(o.radio && o.alive && me.alive ? 0.9 : 0, now, 0.05);
    }
  },
  // frases robadas: frases cortas entre pausas, solo en la memoria de esta pestaña (máximo 5)
  capture() {
    const a = this.ac(); this.sr = a.sampleRate; this.ring = new Float32Array(Math.ceil(this.sr * 6));
    const src = a.createMediaStreamSource(this.stream), sp = a.createScriptProcessor(2048, 1, 1), z = a.createGain(); z.gain.value = 0;
    src.connect(sp); sp.connect(z).connect(a.destination);
    let speaking = false, spT = 0, silent = 0, noise = 0.01;
    sp.onaudioprocess = ev => {
      const x = ev.inputBuffer.getChannelData(0); let s = 0;
      for (let i = 0; i < x.length; i++) { this.ring[this.ringPos] = x[i]; this.ringPos = (this.ringPos + 1) % this.ring.length; s += x[i] * x[i]; }
      const rms = Math.sqrt(s / x.length), blk = x.length / this.sr; this.level = rms;
      if (!speaking) { noise = noise * 0.98 + rms * 0.02; if (rms > Math.max(0.02, noise * 3)) { speaking = true; spT = 0; silent = 0; } }
      else { spT += blk; if (rms < Math.max(0.015, noise * 2)) silent += blk; else silent = 0; if (silent > 0.45) { speaking = false; const dur = spT - silent + 0.15; if (dur > 0.35 && dur < 3.2) this.keep(dur + silent); } else if (spT > 4) speaking = false; }
    };
  },
  keep(back) {
    const n = Math.min(this.ring.length, Math.ceil((back + 0.1) * this.sr)), out = new Float32Array(n); for (let i = 0; i < n; i++) out[i] = this.ring[(this.ringPos - n + i + this.ring.length) % this.ring.length];
    const clip = { d: out, sr: this.sr, tag: this.tagOf(out, this.sr, back), t: performance.now() }; this.clips.push(clip); while (this.clips.length > 5) this.clips.shift(); this.share(clip);
  },
  // ¿qué clase de frase es? grito (muy fuerte), llamado (corta, como un nombre), pregunta (el tono sube al final) o frase
  tagOf(x, sr, dur) {
    let pk = 0; for (let i = 0; i < x.length; i += 64) { let s = 0; const e = Math.min(x.length, i + 512); for (let j = i; j < e; j++) s += x[j] * x[j]; pk = Math.max(pk, Math.sqrt(s / Math.max(1, e - i))); }
    if (pk > 0.22) return 'grito'; if (dur < 0.9) return 'llamado';
    const f0 = (c) => { const N = Math.min(2048, Math.floor(sr * 0.045)), st = Math.max(0, Math.min(x.length - N, Math.floor(c))); let best = 0, bl = 0, e0 = 0; for (let i = 0; i < N; i++) e0 += x[st + i] * x[st + i]; if (e0 < 1e-4) return 0;
      for (let L = Math.floor(sr / 400); L < Math.floor(sr / 75) && L < N; L++) { let s = 0; for (let i = 0; i < N - L; i++) s += x[st + i] * x[st + i + L]; if (s > best) { best = s; bl = L; } } return best / e0 > 0.35 && bl ? sr / bl : 0; };
    const mid = f0(x.length * 0.45), end = f0(x.length - sr * 0.5); return mid && end && end > mid * 1.1 ? 'pregunta' : 'frase';
  },
  // en línea: la frase viaja comprimida (8 kHz, 8 bits) para que la casona la use con la voz de ese jugador; solo vive en la memoria
  byInv: {}, shareT: 0,
  share(clip) {
    if (NET.mode === 'off' || performance.now() - this.shareT < 6000) return; this.shareT = performance.now();
    const step = clip.sr / 8000, n = Math.floor(clip.d.length / step), q = new Int8Array(n); let pk = 0.001; for (let i = 0; i < clip.d.length; i++) pk = Math.max(pk, Math.abs(clip.d[i]));
    for (let i = 0; i < n; i++) q[i] = Math.max(-127, Math.min(127, Math.round(clip.d[Math.floor(i * step)] / pk * 110)));
    let bin = ''; for (let i = 0; i < n; i++) bin += String.fromCharCode(q[i] & 255); const d = btoa(bin);
    if (NET.mode === 'host') { const who = window.__game ? window.__game.ME : 0; this.gotClip(who, clip.tag, d); for (const c of NET.conns.values()) if (c.open) c.send({ t: 'clip', who, tag: clip.tag, d }); }
    else if (NET.hostConn && NET.hostConn.open) NET.hostConn.send({ t: 'clip', tag: clip.tag, d });
  },
  gotClip(who, tag, d) {
    try { const bin = atob(d), f = new Float32Array(bin.length); for (let i = 0; i < bin.length; i++) { const v = bin.charCodeAt(i); f[i] = (v > 127 ? v - 256 : v) / 140; }
      const L = this.byInv[who] || (this.byInv[who] = []); L.push({ d: f, sr: 8000, tag, t: performance.now() }); while (L.length > 4) L.shift(); } catch (e) {}
  },
  pick(list, prefer) { if (!list || !list.length) return null; const a = prefer ? list.filter(c => prefer.includes(c.tag)) : []; if (a.length) return a[Math.floor(Math.random() * a.length)]; const b = list.filter(c => c.tag !== 'grito'); return (b.length ? b : list)[Math.floor(Math.random() * (b.length ? b : list).length)]; },
  // la casona usa una frase: sonido de bocina; 1 de cada 10, al revés y grave; «wifi»: se entrecorta
  playClip(pos, distort, o) {
    o = o || {}; const list = o.who !== undefined ? this.byInv[o.who] : this.clips;
    const c = o.last ? (this.clips.length && performance.now() - this.clips[this.clips.length - 1].t < 8000 ? this.clips[this.clips.length - 1] : null) : this.pick(list, o.prefer);
    if (!c) return false; const a = this.ac(), src = c.d || c, sr = c.sr || this.sr;
    const b = a.createBuffer(1, src.length, sr), d = b.getChannelData(0); if (distort) for (let i = 0; i < d.length; i++) d[i] = src[d.length - 1 - i]; else d.set(src);
    if (o.wifi) { const seg = Math.floor(sr * 0.06); for (let s0 = seg; s0 < d.length - seg; s0 += seg) { const r = Math.random(); if (r < 0.22) d.copyWithin(s0, s0 - seg, s0); else if (r < 0.3) d.fill(0, s0, s0 + seg); } for (let i = 0; i < d.length; i++) d[i] = Math.round(d[i] * 10) / 10; }
    const s = a.createBufferSource(); s.buffer = b; if (distort) s.playbackRate.value = 0.72;
    const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = o.wifi ? 600 : 400; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.wifi ? 2600 : 3000; const g = a.createGain(); g.gain.value = o.vol || 1.1;
    s.connect(hp).connect(lp).connect(g).connect(pos && window.__out ? window.__out(pos) : a.destination); s.start(a.currentTime + (o.delay || 0.2)); return true;
  },
};
