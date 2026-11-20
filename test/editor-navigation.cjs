// Runs against whichever authored layout is being proposed, including translated stairs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const layout=JSON.parse(read('src/layout-v11.json'));
const source='const NDALayout='+JSON.stringify(layout)+';\n'+['stair-layout.js','placement-layout.js','logic2.js','rules3.js','rules4.js','decor-runtime.js','layout-rules.js','decor-rules.js','rules5.js'].map(f=>read('src/'+f).replace('/*LAYOUT_RUNTIME*/',read('src/layout-runtime.js'))).join('\n');
const a=new Function('module',source+';return {newWorld,navTo,stairFlip,elevOf,STAIR_PATHS,ROOM_CENTER,HOME_CHOICES,ROOMS,layoutHideCache};')({exports:{}});
const w=a.newWorld({role:'inv',nInv:4}),cache=a.layoutHideCache();assert(cache.points.length>3000);
for(const d of w.doors)d.closed=false;
function travel(start,tg,label){const e={...w.invs[0],...start,kind:'inv',bot:true,r:.32};let last=a.elevOf(e),arrived=false;
 for(let k=0;k<7200;k++){a.navTo(w,e,tg,2.6,1/30);a.stairFlip(w,e);const y=a.elevOf(e);assert(Number.isFinite(y),label+': altura inválida');assert(Math.abs(y-last)<.25,label+': salto entre pisos');last=y;if(e.f===tg.f&&Math.hypot(e.x-tg.x,e.y-tg.y)<.3){arrived=true;break;}}
 assert(arrived,label+': no hay una ruta transitable para jugadores y bots');}
for(let k=0;k<a.STAIR_PATHS.length;k++){const p=a.STAIR_PATHS[k],lo=p[0][0],hi=p[1].at(-1);for(const up of[true,false]){const s=up?lo:hi,t=up?hi:lo;travel({f:up?0:1,x:s[0]+.5,y:s[1]+.5},{f:up?1:0,x:t[0]+.5,y:t[1]+.5},'Escalera '+layout.stairs[k].id);}}
for(const h of a.HOME_CHOICES)travel({f:0,x:27.5,y:50.5},a.ROOM_CENTER[h.f][h.r],a.ROOMS[h.f][h.r].n);
for(let k=0;k<20;k++){const next=a.newWorld({role:'inv',nInv:4});assert.deepEqual(next.layoutPackingMisses,[],'No caben los objetos aleatorios en las superficies disponibles');}
console.log('Conexiones entre pisos, acceso a 22 cuartos, cobertura de escondites y 20 distribuciones: correctos.');
