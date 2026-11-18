// Sustituto de PeerJS para pruebas locales: conecta pestañas del mismo navegador con BroadcastChannel.
(function () {
  const bc = new BroadcastChannel('fakepeer'); const peers = new Map();
  const uid = () => Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
  class Emitter { constructor() { this._h = {}; } on(e, f) { (this._h[e] = this._h[e] || []).push(f); return this; } emit(e, ...a) { (this._h[e] || []).forEach(f => { try { f(...a); } catch (err) { console.error(err); } }); } }
  class Conn extends Emitter {
    constructor(owner, remote, cid, metadata) { super(); this.owner = owner; this.peer = remote; this.cid = cid; this.metadata = metadata; this.open = false; }
    send(d) { if (!this.open) return; bc.postMessage({ to: this.peer, from: this.owner.id, type: 'data', cid: this.cid, d: JSON.parse(JSON.stringify(d)) }); }
    close() { if (!this.open) return; this.open = false; bc.postMessage({ to: this.peer, from: this.owner.id, type: 'close', cid: this.cid }); this.emit('close'); }
  }
  class Peer extends Emitter {
    constructor(id) { super(); this.id = typeof id === 'string' ? id : uid(); this.conns = new Map(); peers.set(this.id, this); (window.__fp = window.__fp || []).push(this);
      setTimeout(() => this.emit('open', this.id), 30); }
    connect(remote, opt) { const c = new Conn(this, remote, uid(), opt && opt.metadata); this.conns.set(c.cid, c);
      bc.postMessage({ to: remote, from: this.id, type: 'connect', cid: c.cid, meta: c.metadata });
      c._t = setTimeout(() => { if (!c.open) this.emit('error', { type: 'peer-unavailable' }); }, 1500); return c; }
    call() { const e = new Emitter(); e.close = () => {}; e.answer = () => {}; return e; }
    reconnect() {} destroy() { for (const c of this.conns.values()) c.close(); peers.delete(this.id); }
  }
  bc.onmessage = ({ data: m }) => {
    const p = [...peers.values()].find(x => x.id === m.to); if (!p) return;
    if (m.type === 'connect') { const c = new Conn(p, m.from, m.cid, m.meta); p.conns.set(c.cid, c); c.open = true; p.emit('connection', c); setTimeout(() => c.emit('open'), 0); bc.postMessage({ to: m.from, from: p.id, type: 'accept', cid: m.cid }); }
    else { const c = p.conns.get(m.cid); if (!c) return;
      if (m.type === 'accept') { clearTimeout(c._t); c.open = true; c.emit('open'); }
      else if (m.type === 'data') c.emit('data', m.d);
      else if (m.type === 'close') { c.open = false; c.emit('close'); } }
  };
  window.Peer = Peer;
})();
addEventListener('pagehide', () => { try { for (const p of (window.__fp || [])) p.destroy(); } catch (e) {} });
