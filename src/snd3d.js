// ================= Sonidos grabados (provisionales, de bancos gratuitos; ver assets/s/CREDITOS.txt) =================
// Cada sonido sintetizado se cambia por una grabación cuando ya cargó; si no, suena el sintetizado como antes.
const SND_FILES = ['door_open1', 'door_open2', 'door_close1', 'door_close2', 'slam1', 'slam2', 'knock1', 'knock2', 'handle', 'creak1', 'creak2', 'door_creak', 'marbles1', 'marbles2',
  'ring', 'phone_pick', 'phone_hang', 'tv_on', 'tv_off', 'switch_on', 'switch_off', 'fuse', 'power_off', 'scrape1', 'scrape2', 'scream1', 'scream2', 'scream_fc1', 'scream_fc2', 'scream_fc3', 'bodyfall',
  'van_door', 'amb_out', 'drip', 'match', 'chain', 'chain2', 'gas', 'bonk', 'feedback', 'book_throw', 'book', 'ceramic_break', 'grass1', 'grass2', 'grass3', 'picture', 'rumble', 'mouth', 'cough',
  'wood1', 'wood2', 'wood3', 'wood4', 'stone1', 'stone2', 'bell_heavy', 'bell1', 'bell2', 'bell_small', 'thunder', 'rain', 'static1', 'static2', 'hiss', 'howl', 'bark', 'breath1', 'breath2',
  'weird1', 'weird2', 'weird3', 'weird4', 'growl1', 'growl2', 'glass_break1', 'glass_break2', 'fall1', 'fall2', 'wood_break', 'crack1', 'crack2', 'keys', 'cineboom', 'haunted_hum', 'dark_woosh',
  'choir', 'glass_rub', 'crow', 'guitar', 'glitch1', 'glitch2', 'beep', 'buzz',
  'r_growly', 'r_echo', 'r_breath', 'r_riser', 'r_zombies', 'static3', 'wings', 'puff', 'laugh1', 'laugh2', 'laugh3', 'laugh4', 'laugh5', 'heart1', 'heart2', 'snap', 'pickup', 'click_btn', 'ding', 'latch', 'toy'];
const SND = { buf: {}, loading: false, loops: {} };
function sndLoad() {
  if (SND.loading || !audio || !audio.ctx) return; SND.loading = true;
  SND_FILES.forEach(k => fetch(`${ASSET}s/${k}.mp3`).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && audio.ctx.decodeAudioData(b)).then(d => { if (d) SND.buf[k] = d; }).catch(() => {}));
}
// toca una grabación (o una de varias): pos = lugar en la casa (null = en tu cabeza)
function S(keys, pos, o) {
  if (!audio || audio.muted) return true; o = o || {}; const list = (Array.isArray(keys) ? keys : [keys]).filter(k => SND.buf[k]); if (!list.length) return false;
  const ctx = audio.ctx, src = ctx.createBufferSource(); src.buffer = SND.buf[list[Math.floor(Math.random() * list.length)]];
  src.playbackRate.value = (o.rate || 1) * (o.vary ? 1 + (Math.random() - 0.5) * o.vary : 1);
  const g = ctx.createGain(); g.gain.value = o.vol === undefined ? 0.8 : o.vol; let node = src;
  if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; node.connect(f); node = f; }
  if (o.hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = o.hp; node.connect(f); node = f; }
  node.connect(g).connect(o.far && pos ? outFar(pos) : out(pos)); const t0 = ctx.currentTime + (o.delay || 0); src.start(t0, o.offset || 0);
  if (o.dur) { g.gain.setValueAtTime(g.gain.value, t0 + o.dur - 0.05); g.gain.linearRampToValueAtTime(0.0001, t0 + o.dur); src.stop(t0 + o.dur + 0.02); }
  if (o.cut) src.stop(t0 + o.cut); // corte seco (la serenata)
  return true;
}
// se oye en toda la casa (bajito lejos): para el zaguán que exige que vayan
function outFar(pos) { const ctx = audio.ctx, p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 7; p.maxDistance = 80; p.rolloffFactor = 0.45; const y = pos.f * FH + 1.2; if (p.positionX) { p.positionX.value = pos.x; p.positionY.value = y; p.positionZ.value = pos.y; } else p.setPosition(pos.x, y, pos.y); p.connect(audio.master); return p; }
// sonido en bucle con volumen ajustable (ambiente de afuera, lluvia, zumbido de la cacería)
function sndLoop(k, vol) {
  if (!audio || !SND.buf[k]) return; let L = SND.loops[k];
  if (!L) { const ctx = audio.ctx, src = ctx.createBufferSource(); src.buffer = SND.buf[k]; src.loop = true; const g = ctx.createGain(); g.gain.value = 0; src.connect(g).connect(audio.master); src.start(); L = SND.loops[k] = { src, g }; }
  L.g.gain.setTargetAtTime(audio.muted ? 0 : vol, audio.ctx.currentTime, 0.4);
}
const _initAudioS = initAudio; initAudio = function () { _initAudioS(); sndLoad(); };

// ---------- los sonidos de siempre, ahora grabados ----------
const swap = (obj, name, fn) => { const old = obj[name]; obj[name] = function (...a) { if (!fn(...a) && old) old.apply(obj, a); }; };
swap(SFX, 'door', p => S(['door_close1', 'door_close2', 'slam1'], p, { vary: 0.1 }));
swap(SFX, 'click', p => S('switch_off', p, { vol: 0.9 }));
swap(SFX, 'scrape', p => S(['scrape1', 'scrape2', 'fall1'], p, { vary: 0.15 }));
swap(SFX, 'whisper', p => S(['breath1', 'breath2'], p, { rate: 0.85, vol: 0.5, hp: 500 }));
swap(SFX, 'growl', p => S(['growl1', 'growl2'], p, { rate: 0.8 }));
swap(SFX, 'pray', p => S('choir', p, { rate: 0.8, vol: 0.5 }));
swap(SFX, 'drip', p => S('drip', p, { dur: 3, vol: 0.6 }));
swap(SFX, 'water', p => S('drip', p, { dur: 2.5, offset: 5, vol: 0.6 }));
swap(SFX, 'beads', p => S('marbles2', p));
swap(SFX, 'bell', p => S(['bell_heavy', 'bell1'], p, { rate: 0.7, vol: 0.7 }));
swap(SFX, 'static', p => S(['static1', 'static2'], p, { dur: 1.2, vol: 0.45 }));
swap(SFX, 'stairs', p => { if (!SND.buf.wood1) return false; for (let k = 0; k < 4; k++) S(['wood1', 'wood2', 'wood3', 'wood4'], p, { delay: k * 0.22, vol: 0.7, rate: 0.85 }); return true; });
swap(SFX, 'death', () => { if (!SND.buf.scream_fc1) return false; S(['scream_fc1', 'scream_fc2', 'scream_fc3'], null, { vol: 1 }); S('bodyfall', null, { delay: 0.6 }); S('cineboom', null, { vol: 0.8 }); return true; });
swap(SFX, 'crack', p => S(['crack1', 'crack2'], p));
swap(SFX, 'match', p => S('match', p));
swap(SFX, 'creak', p => S(['creak1', 'creak2', 'door_creak'], p, { vary: 0.15, dur: 2 }));
swap(SFX, 'crash', p => S(['glass_break1', 'glass_break2', 'ceramic_break', 'wood_break'], p));
swap(SFX, 'nape', () => { const V = viewer(); S(['breath1', 'breath2'], V ? { f: V.f, x: V.x, y: V.y + 0.3 } : null, { vol: 0.9, rate: 0.9 }); return false; }); // la respiración y el escalofrío sintetizado juntos
swap(SFX, 'rosary', p => S(['chain', 'chain2'], p, { vol: 0.6 }));
swap(CSFX, 'howl', p => S(Math.random() < 0.7 ? 'howl' : 'bark', p, { rate: 0.9 }));
swap(CSFX, 'marbles', p => S(['marbles1', 'marbles2'], p));
swap(CSFX, 'steps', p => { if (!SND.buf.wood1) return false; for (let k = 0; k < 5; k++) S(['wood1', 'wood2', 'wood3', 'wood4'], p, { delay: k * 0.5, vol: 0.8, rate: 0.8 }); return true; });
swap(CSFX, 'knock', p => { if (!SND.buf.knock1) return false; S(['knock1', 'knock2'], p, { vol: 1 }); return true; });
swap(CSFX, 'ring', p => S('ring', p, { vol: 0.9, dur: 3.3 }));
swap(CSFX, 'serenata', p => S('guitar', p, { vol: 0.7, cut: 2.2 + Math.random() }));
swap(CSFX, 'static', (p, d) => S(['static1', 'static2'], p, { dur: d || 1.5, vol: 0.5 }));
swap(CSFX, 'thunder', () => S('thunder', null, { vol: 1 }));
swap(CSFX, 'lamento', p => S('choir', p, { rate: 0.7, vol: 0.55, lp: 1500 }));

// pasos: madera adentro, piedra en el zaguán y el camino, pasto afuera
const _footstepS = footstep;
footstep = function (i, speed, self) {
  if (!audio || audio.muted || !w || !SND.buf.wood1) return _footstepS(i, speed, self); const V = viewer(); if (!V || (V.f !== i.f && !self)) return;
  const p = self ? null : { f: i.f, x: i.x, y: i.y }, run = speed > 3, r = roomOf(i), id = r >= 0 ? ROOMS[i.f][r].id : '';
  const set = id === 'afuera' ? (i.y < 50 && i.x >= 21 && i.x <= 25 ? ['stone1', 'stone2'] : ['grass1', 'grass2', 'grass3']) : ['patio', 'zaguan'].includes(id) ? ['stone1', 'stone2'] : ['wood1', 'wood2', 'wood3', 'wood4'];
  S(set, p, { vol: (run ? 0.55 : 0.32) * (self ? 0.7 : 1), vary: 0.15, lp: i.f === 1 && !self ? 900 : 0 });
};

// sucesos con sonido propio, para que se entienda qué pasó
const _playEventsS = playEvents;
playEvents = function () {
  if (w && audio && !audio.muted) { const V = viewer();
    for (const e of w.events) { const p = e.f !== undefined ? { f: e.f, x: e.x, y: e.y } : null;
      switch (e.type) {
        case 'hunt': S('cineboom', null, { vol: 0.9 }); S('bonk', null, { vol: 0.35, rate: 0.6, delay: 0.3 }); break;
        case 'fuseBlow': S('fuse', p, { vol: 1 }); S('power_off', null, { vol: 0.7, delay: 0.2 }); break;
        case 'lightsoff': S('power_off', null, { vol: 0.4 }); break;
        case 'throw': S(e.kind && ['jarron', 'plato', 'taza'].includes(e.kind) ? ['glass_break1', 'glass_break2', 'ceramic_break'] : ['fall1', 'fall2', 'book_throw'], e.to || p, { vol: 0.9 }); break;
        case 'escape': if (V && e.who === V.id) S('van_door', null, { vol: 0.9 }); break;
        case 'anomaly': case 'anomSeen': if (V && (e.who === undefined || e.who === V.id)) S(['weird3', 'weird4', 'glass_rub'], p, { vol: 0.6 }); break;
        case 'espejo': S('glass_rub', p, { vol: 0.7 }); break;
        case 'manifest': S('dark_woosh', p, { vol: 0.8 }); break;
        case 'gases': S('gas', p, { vol: 0.5, dur: 2 }); break;
        case 'possess': S(['growl1', 'growl2'], null, { rate: 0.7 }); break;
        case 'visita': S('handle', { f: 0, x: ZAG.x, y: ZAG.y }); break;
        case 'cas': {
          const mine = V && e.who === V.id;
          if (e.k === 'tv' || e.k === 'tvcam' || e.k === 'barras') S('tv_on', p, { vol: 0.9 });
          if (e.k === 'telefono' && mine && e.near) S('phone_pick', p, { delay: 3.2, vol: 0.8 });
          if (e.k === 'estatuaGrito' && mine) { if (Math.random() < 0.5) { S(['scream_fc1', 'scream_fc2', 'scream_fc3'], p, { vol: 1.2, rate: 0.82, lp: 3500 }); S(['growl1', 'growl2'], p, { vol: 0.9, rate: 0.7, delay: 0.1 }); S('cineboom', null, { vol: 0.7 }); } else { S(['laugh1', 'laugh2', 'laugh3'], p, { vol: 1.1, rate: 0.55, lp: 1800 }); S('r_growly', p, { vol: 0.7, delay: 0.2 }); S('dark_woosh', null, { vol: 0.6 }); } }
          if (e.k === 'estatuaHabla' && mine) S('mouth', p, { vol: 0.2, dur: 0.6 });
          if ((e.k === 'pasillo' || e.k === 'reconectando' || e.k === 'sombralag') && mine) S(['glitch1', 'glitch2'], null, { vol: 0.6 });
          if (e.k === 'sombra' && mine) S('dark_woosh', p, { vol: 0.7 });
          if (e.k === 'foto' && mine) S('picture', null, { vol: 0.8 });
          if (e.k === 'ofrenda') S('bell_small', p, { vol: 0.8 });
          if (e.k === 'cadaver' && mine) S('bodyfall', p, { vol: 0.7 });
          if (e.k === 'puerta') S(['slam1', 'slam2'], p, { vol: 0.9 });
          if (e.k === 'zaguan') S('handle', p, { delay: 1.6, vol: 0.7 });
          if (e.k === 'ambiente' && e.a === 'campanas') S('bell_heavy', null, { rate: 0.55, vol: 0.5 });
          if (e.k === 'ambiente' && e.a === 'vela') S('match', p, { rate: 0.7, vol: 0.4 });
          if (e.k === 'ambiente' && e.a === 'mecedora') S(['creak1', 'creak2'], p, { dur: 2.5 });
          if (e.k === 'ambiente' && e.a === 'afuera') S(['crow', 'bark'], { f: 0, x: e.x + 14, y: e.y + 6 }, { vol: 0.6 });
          break; }
      } } }
  _playEventsS();
};
// ambiente: afuera, grillos y calle a lo lejos; adentro un zumbido grave que sube en la cacería
function sndAmbience() {
  if (!audio || !w || !running) return; const V = viewer(); const outside = V && V.f === 0 && V.y >= 39;
  sndLoop('amb_out', outside ? 0.35 : 0.04); sndLoop('haunted_hum', w.g.hunt && !outside ? 0.35 : outside ? 0 : 0.06);
  if ((w.mods || {}).noche === 'tormenta') sndLoop('rain', outside ? 0.5 : 0.18);
}
const _updateSceneS = updateScene; updateScene = function (t, dt) { _updateSceneS(t, dt); try { sndAmbience(); } catch (e) {} };
const _toMenuS = toMenu; toMenu = function () { Object.values(SND.loops).forEach(L => L.g.gain.value = 0); _toMenuS(); };
window.__snd = SND;

// ---------- ya nada sintetizado: todo suena con grabaciones (si una no cargó, no suena) ----------
const SYNTH_OFF = true;
const _toneS = tone, _noiseS = noise;
tone = function (...a) { if (!SYNTH_OFF) _toneS(...a); };
noise = function (...a) { if (!SYNTH_OFF) _noiseS(...a); };
ambience = function () {}; // el viejo zumbido de ruido generado
const laughK = ['laugh1', 'laugh2', 'laugh3', 'laugh4'];
const set = (obj, name, fn) => { obj[name] = fn; };
set(SFX, 'laugh', p => S(laughK, p, { rate: 0.75, vol: 0.9, lp: 2500 }));
set(SFX, 'giggle', p => S(laughK, p, { rate: 1.15, vol: 0.7, hp: 400 }));
set(SFX, 'coins', p => S('keys', p, { vol: 0.6 }));
set(SFX, 'wings', p => S('wings', p, { vol: 0.8, rate: 0.9 }));
set(SFX, 'frost', p => S('glass_rub', p, { vol: 0.6, rate: 1.2 }));
set(SFX, 'sheet', p => S('wings', p, { vol: 0.5, rate: 0.6, lp: 1200 }));
set(SFX, 'toy', p => S('toy', p, { vol: 0.8 }));
set(SFX, 'si', () => S('ding', null, { vol: 0.6 }));
set(SFX, 'emf', (p, lvl) => { for (let k = 0; k < (lvl || 1); k++) S('beep', p, { vol: 0.35, rate: 0.8 + (lvl || 1) * 0.12, delay: k * 0.09 }); });
set(SFX, 'shutter', p => { S('click_btn', p, { vol: 0.9 }); S('latch', p, { vol: 0.5, delay: 0.06, rate: 1.3 }); });
set(SFX, 'copal', p => { S('match', p, { vol: 0.7 }); S('gas', p, { vol: 0.3, dur: 1.5, delay: 0.3 }); });
set(SFX, 'pickup', () => S('pickup', null, { vol: 0.5 }));
set(SFX, 'card', p => S('book', p, { vol: 0.6, rate: 1.3 }));
set(SFX, 'slide', p => S('picture', p, { vol: 0.7 }));
set(SFX, 'shimmer', p => S('glass_rub', p, { vol: 0.7 }));
set(SFX, 'clicks', p => { for (let k = 0; k < 4; k++) S('snap', p, { delay: k * 0.18, vol: 0.6, vary: 0.2 }); });
set(SFX, 'sizzle', p => S('gas', p, { vol: 0.5, dur: 1.2 }));
set(SFX, 'bite', p => S(['crack1', 'crack2'], p, { vol: 0.5, rate: 1.4 }));
set(SFX, 'puff', p => S('puff', p, { vol: 0.6 }));
set(SFX, 'beep', () => S('beep', null, { vol: 0.4 }));
set(SFX, 'growl', p => S(['growl1', 'growl2'], p, { rate: 0.8 }));
set(CSFX, 'owl', p => S('crow', p, { vol: 0.7, rate: 0.8 })); // PROVISIONAL: el tecolote suena a ave genérica (cuervo); falta un tecolote de verdad
set(CSFX, 'wet', p => { for (let k = 0; k < 4; k++) S('drip', p, { offset: 2 + k, dur: 0.3, delay: k * 0.4, vol: 0.6 }); });
set(CSFX, 'llanto', p => S('choir', p, { rate: 0.6, vol: 0.7, lp: 1800 }));
set(CSFX, 'shutter', p => SFX.shutter(p));
// la cacería: latido (bombo grave) y pasos pesados del ánima
huntAudio = function (dt) {
  if (!audio || audio.muted || !w) return; const g = w.g, V = viewer(); if (!g.hunt || !V) return;
  const now = audio.ctx.currentTime, sp = g.def.huntStart + g.def.accel * g.seenT, k = Math.min(1, (sp - g.def.huntStart) / Math.max(0.1, g.def.top - g.def.huntStart));
  const d = V.f === g.f ? Math.hypot(V.x - g.x, V.y - g.y) : 30, near = Math.max(0, 1 - d / 25), p = { f: g.f, x: g.x, y: g.y };
  if (now >= audio.nextBeat) { audio.nextBeat = now + 60 / (70 + 90 * k + 40 * near); S('heart2', null, { vol: 0.5 + near * 0.5, rate: 0.7 }); S('heart2', null, { vol: 0.35 + near * 0.3, rate: 0.7, delay: 0.16 }); }
  if (now >= audio.nextStep) { const id = g.def.id; audio.nextStep = now + (id === 'malaire' ? 1.2 : 0.55 - 0.3 * k);
    if (id === 'malaire') S(['breath1', 'breath2'], p, { vol: 0.5, rate: 0.7 });
    else if (id === 'nahual' || id === 'cadejo') { S(['wood1', 'wood2'], p, { vol: 0.7, rate: 1.4 }); S(['wood3', 'wood4'], p, { vol: 0.6, rate: 1.4, delay: 0.07 }); }
    else if (id === 'planchada') S('snap', p, { vol: 0.6, rate: 1.4 });
    else if (id === 'nachito') S(['wood1', 'wood2', 'wood3'], p, { vol: 0.5, rate: 1.5 });
    else S(['wood1', 'wood2', 'wood3', 'wood4', 'stone1'], p, { vol: 1, rate: 0.6, lp: 1800 }); }
};
// la voz de la casa en la grabadora y el teléfono sin frases: estática en vez de voz sintética rara

// crujidos de la casa vieja de vez en cuando (adentro)
let ambT = 8;
const _sndAmbience = sndAmbience;
sndAmbience = function () { _sndAmbience(); };
function sndCreaks(dt) {
  if (!audio || audio.muted || !w || !running) return; ambT -= dt; if (ambT > 0) return; ambT = rnd(6, 16);
  const V = viewer(); if (!V || (V.f === 0 && V.y >= 39)) return; const a = Math.random() * 6.28, r = rnd(5, 14), p = { f: V.f, x: V.x + Math.cos(a) * r, y: V.y + Math.sin(a) * r };
  const k = Math.random(); if (k < 0.45) S(['creak1', 'creak2', 'door_creak'], p, { vol: 0.35, dur: 1.6, vary: 0.3 }); else if (k < 0.7) S(['crack1', 'crack2'], p, { vol: 0.3 }); else S(['wood1', 'wood2'], p, { vol: 0.25, rate: 0.7, lp: 900 });
}
const _updateSceneS2 = updateScene; updateScene = function (t, dt) { _updateSceneS2(t, dt); try { sndCreaks(dt || 0.016); } catch (e) {} };
// ---------- volumen de efectos y de voces ----------
const VOL = (() => { try { return Object.assign({ fx: 1, voz: 1 }, JSON.parse(localStorage.getItem('nda_vol') || '{}')); } catch (e) { return { fx: 1, voz: 1 }; } })();
function volApply() { if (audio && audio.master) audio.master.gain.value = 0.8 * VOL.fx; VOICE.vol = VOL.voz; try { localStorage.setItem('nda_vol', JSON.stringify(VOL)); } catch (e) {} }
{ const fx = $('#volFx'), vz = $('#volVoz'); if (fx) { fx.value = VOL.fx; vz.value = VOL.voz; fx.oninput = () => { VOL.fx = +fx.value; volApply(); }; vz.oninput = () => { VOL.voz = +vz.value; volApply(); }; }
  const btn = $('#volBtn'); if (btn) btn.onclick = e => { e.stopPropagation(); $('#volPanel').hidden = !$('#volPanel').hidden; }; }
const _initAudioV = initAudio; initAudio = function () { _initAudioV(); volApply(); };
VOICE.vol = VOL.voz;

// ---------- sin voces de computadora: todo lo que antes "hablaba" con síntesis de voz ----------
// usa frases grabadas de los jugadores (distorsionadas) o sonidos grabados
speak = function (text, o) {
  try { if (audio && audio.muted) return; const V = typeof viewer === 'function' ? viewer() : null, p = V ? { f: V.f, x: V.x + 2, y: V.y + 1 } : null;
    if (/mis hijos/i.test(text || '')) { S(SND_FILES.includes('llorona') ? 'llorona' : ['scream_fc1', 'scream_fc2'], p, { vol: 0.8, rate: 0.85 }); return; }
    if (typeof VOICE !== 'undefined' && VOICE.clips && VOICE.clips.length && VOICE.playClip(p, Math.random() < 0.5, {})) return;
    S(['r_echo', 'weird1', 'weird3', 'breath1', 'r_breath'], p, { vol: 0.7, vary: 0.1 }); } catch (e) {}
};
