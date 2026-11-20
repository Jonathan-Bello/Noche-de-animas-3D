// Inventory art reads only public item state; no random outcomes or ghost queries.
const NDAItemArt=globalThis.NDAItemArt=(()=>{
 const kinds=['te','rosario','ruda','copal','vela','ceniza','cruz','pan','foco','limpia','fotocam','tarot','tablilla','espejoplata','mano','muneca','pentagrama','radio'];
 const count=(n,fallback,max)=>Number.isFinite(n)?Math.max(0,Math.min(max,n)):fallback;
 function read(kind,it={},t=0,ctx={}){
  const s={kind,digits:'',progress:0,tone:'normal',label:'Preparado',held:!!ctx.held,hung:!!ctx.hung};
  if(kind==='vela'){s.lit=!!it.lit&&t<(it.litUntil||0);s.label=s.lit?'Encendida':'Apagada';}
  if(kind==='cruz'){s.remaining=count(it.charges,2,2);s.label=s.remaining+(s.remaining===1?' carga':' cargas');}
  if(kind==='rosario'){s.remaining=count(it.uses,2,2);s.label=ctx.hung?'Colgado en la puerta':s.remaining+(s.remaining===1?' uso':' usos');}
  if(kind==='tarot'){s.remaining=count(it.cards,10,10);s.label=s.remaining+(s.remaining===1?' carta restante':' cartas restantes');}
  if(kind==='tablilla'){s.questions=count(it.q,0,3);s.label=s.questions+' / 3 preguntas';}
  if(kind==='espejoplata'){s.on=!!it.on;s.label=s.on?'Mirando en la plata':'Usar: mirar';}
  if(kind==='mano'){s.remaining=count(it.wishes,2,2);s.used=2-s.remaining;s.label=s.remaining+(s.remaining===1?' deseo restante':' deseos restantes');}
  if(kind==='muneca'){s.remaining=count(it.pins,10,10);s.used=10-s.remaining;s.label=s.remaining+(s.remaining===1?' alfiler restante':' alfileres restantes');/* heart is deliberately never inspected. */}
  if(kind==='pentagrama'){s.candles=count(it.candles,0,5);s.label=s.candles+' / 5 velas';}
  if(kind==='radio'){s.wait=t<(it.cd||0);s.label=s.wait?'Esperando para preguntar':'Usar: preguntar';/* no proximity light or made-up answer. */}
  if(kind==='fotocam'){s.remaining=count(it.film,0,99);s.digits=String(s.remaining).padStart(2,'0');s.label=s.remaining+(s.remaining===1?' foto restante':' fotos restantes');}
  return s;
 }
 function apply(g,it,t,held,ctx){
  const s=g.userData.tool,st=s.state,kind=s.kind;
  g.rotation.x=!held&&!ctx.hung&&['rosario','ruda','cruz'].includes(kind)?-Math.PI/2:0;
  g.position.z=g.rotation.x?{rosario:.15,ruda:.12,cruz:.155}[kind]:0;
  g.position.y=g.rotation.x?{rosario:.009,ruda:.0165,cruz:.0045}[kind]:0;
  for(const node of s.parts.values()){
   const p=node.userData.part,r=p.role||'';
   if(r.startsWith('flame')){const n=Number(r.slice(5));node.visible=kind==='vela'?st.lit:n<st.candles;node.scale.set(1,.94+Math.sin(t*9+n)*.06,1);}
   if(r.startsWith('charge'))node.visible=Number(r.slice(6))<st.remaining;
   if(/^card\d+$/.test(r))node.visible=Number(r.slice(4))<st.remaining;
   if(r==='cardtop'){node.visible=st.remaining>0;node.position.y=p.position[1]+(st.remaining-10)*.003;}
   if(r==='pointer'){node.position.x=p.position[0]+[0,-.085,.085,0][st.questions];node.position.z=p.position[2]+[0,0,-.04,.07][st.questions];}
   if(r.startsWith('finger')){const n=Number(r.slice(6));node.rotation.x=p.rotation[0]+(n<st.used?1.35:0);}
   if(/^pin\d+$/.test(r))node.visible=Number(r.slice(3))<st.used;
   if(r==='silverview')node.children[0].material.color.set(st.on?'#aeb8bb':p.color);
   if(r==='radio_tune')node.position.x=p.position[0]+(st.wait?Math.sin(t*7)*.01:0);
  }
 }
 function create(kind,options={}){
  if(!kinds.includes(kind))return null;
  const definition=options.definition||globalThis.NDAItemComponents?.tools[kind];
  const g=NDAToolArt.create(kind,{...options,definition,stateAdapter:read,applyState:apply});
  if(g){g.name='item_'+kind;g.userData.item={kind,version:'objetos-v18'};}return g;
 }
 function demo(kind,phase,held=false){
  const n=phase==='normal'?0:phase==='doubtful'?1:2,it={kind,uses:[2,1,1][n],charges:[2,1,1][n],cards:[10,7,2][n],q:n,wishes:[2,1,1][n],pins:[10,7,3][n],candles:[0,2,4][n],on:n>0,film:[6,3,0][n],lit:n>0,litUntil:10,cd:n>0?10:0};
  return{it,ctx:{held,hung:false}};
 }
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function panel(kind,it,t,ctx={}){const s=read(kind,it,t,ctx);return `<svg viewBox="0 0 160 68" role="img" aria-label="${escape(s.label)}"><path d="M1 1H159V67H1Z" fill="#232b30" stroke="#ba8d49"/><text x="80" y="37" text-anchor="middle" fill="#d8cdb5" font-size="12" font-family="monospace">${escape(s.label)}</text></svg>`;}
 return{version:'objetos-v18',kinds,create,read,demo,panel,update:NDAToolArt.update,dispose:NDAToolArt.dispose};
})();
