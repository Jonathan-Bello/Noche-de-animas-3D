const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),a=require('./session-casona.cjs');
const root=path.join(__dirname,'..');globalThis.NDAItemComponents=JSON.parse(fs.readFileSync(path.join(root,'src/items-components.json'),'utf8'));
new Function(fs.readFileSync(path.join(root,'src/tools-art3d.js'),'utf8'))();new Function(fs.readFileSync(path.join(root,'src/items-art3d.js'),'utf8'))();
const art=globalThis.NDAItemArt;
function setup(kind){const w=a.newWorld({role:'inv',nInv:1,cursed:'random'}),m=w.invs[0];m.san=80;m.f=0;m.x=30;m.y=25;m.face=0;w.g.state='libre';w.g.f=0;w.g.x=33;w.g.y=25;const it=a.newItem(kind,m);it.holder=m;w.items.push(it);m.slots=[it,null,null];m.hand=0;return{w,m,it};}
const reports=[];
for(const k of ['te','copal','limpia','ceniza','vela','cruz','pan','tarot','tablilla','espejoplata','mano','muneca','pentagrama','radio','fotocam']){
 const{w,m,it}=setup(k);if(k==='fotocam')it.film=6;if(k==='muneca')it.heart=0;
 assert(a.useItem(w,m),'action failed '+k);const state=art.read(k,it,w.t,{held:it.holder===m});
 if(['te','copal','limpia','ceniza'].includes(k))assert(!w.items.includes(it),k);
 if(k==='te')assert(m.san>80);
 if(k==='copal')assert(w.clouds.length>0);
 if(k==='ceniza')assert(w.ashes.length===1);
 if(k==='vela'){assert(it.lit);assert(!it.holder);assert(state.lit);}
 if(['pan','cruz'].includes(k))assert(!it.holder);
 if(k==='tarot')assert.equal(state.remaining,9);
 if(k==='tablilla')assert.equal(state.questions,1);
 if(k==='espejoplata')assert(state.on);
 if(k==='mano')assert.equal(state.used,1);
 if(k==='muneca')assert.equal(state.used,1);
 if(k==='pentagrama')assert.equal(state.candles,1);
 if(k==='radio')assert(state.wait);
 if(k==='fotocam')assert.equal(state.digits,'05');
 reports.push({kind:k,consumed:!w.items.includes(it),state});
}
for(const k of ['ruda','rosario']){
 const{w,m,it}=setup(k),d=w.doors[0];Object.assign(m,{f:d.f,x:d.x,y:d.y});
 if(k==='ruda'){assert(a.useItem(w,m));assert(!w.items.includes(it));assert(d.rudaUntil>w.t);}
 else{assert(a.hangRosary(w,m));assert.equal(d.rosarioItem,it);assert(art.read(k,it,w.t,{hung:true}).hung);}
 reports.push({kind:k,doorAttachment:true});
}
{const{w,m,it}=setup('vela');a.dropItem(w,m,0);assert(it.lit);m.slots[0]=it;it.holder=m;a.throwItem(w,m,2);assert.equal(it.lit,false);}
{const{w,m,it}=setup('foco');const sw=a.SWITCHES[0].find(Boolean);
 assert(sw);m.x=sw.x;m.y=sw.y;m.f=sw.f;w.burnt[m.f][sw.r]=1;assert(a.toggleLight(w,m));assert(!w.items.includes(it));reports.push({kind:'foco',replaced:true});}
assert.equal(art.panel('muneca',{pins:6,heart:0},10),art.panel('muneca',{pins:6,heart:9},10));
assert.equal(art.panel('radio',{cd:12,near:true},10),art.panel('radio',{cd:12,near:false},10));
assert.equal(art.read('vela',{lit:true,litUntil:9},10).lit,false);
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/items-usage.json'),JSON.stringify(reports,null,2));
console.log('18 real item actions, counters, consumption, candle extinction, door attachments and no hidden-outcome leakage passed.');
