const fs=require('node:fs'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..');
const read=p=>fs.readFileSync(require('node:path').join(root,p),'utf8');
let source='const NDALayout='+read('src/layout-v11.json')+';\n'+read('src/placement-layout.js')+'\n'+read('src/logic2.js').replace('/*LAYOUT_RUNTIME*/',read('src/layout-runtime.js'))+'\n'+read('src/rules3.js')+'\n'+read('src/rules4.js')+'\n'+read('src/decor-runtime.js')+'\n'+read('src/layout-rules.js')+'\n'+read('src/decor-rules.js')+'\n'+read('src/rules5.js');
const api=new Function('module',source+';return {botInv,botTermoSweep,layoutPlacementAllowed,SPAWN_TILES,casPoint,casRezando5,randomIn,newWorld,step,interact,pickUp,layoutItemVisible,layoutBeginSearch,chooseSpots,SPOTS,ROOMS,ROOM_TILES,ROOM_CENTER,HOME_CHOICES,SURFACES,layoutHideCache,grids,T,STAIR_BLOCK,STAIR_PATHS,stairProjection,layoutDistances,navTo,stairFlip,elevOf,pathLen,los,gMover,sees};')({exports:{}});
console.log('rooms',api.ROOMS.map(r=>r.length),'spots',api.SPOTS.length);
assert.equal(api.HOME_CHOICES.length,22);assert.equal(api.SPOTS.length,24);
const c=api.layoutHideCache();console.log('coverage cells',c.points.length);
let min=Infinity,max=0;for(let seed=0;seed<100;seed++){const a=api.chooseSpots();min=Math.min(min,a.size);max=Math.max(max,a.size);assert(a.size>=20&&a.size<=22);const covered=new Set([...a].flatMap(k=>[...c.covers[k]]));assert(c.points.every(n=>covered.has(n)));const rooms=[...a].map(k=>api.SPOTS[k].f+':'+api.SPOTS[k].room);assert.equal(new Set(rooms).size,rooms.length);}
console.log('active range',min,max);
const w=api.newWorld({nInv:1,role:'inv',equip:'normal',night:600});console.log('world',w.invs.length,'doors',w.doors.length,'hides',w.spotsActive.size);
assert.deepEqual(w.layoutPackingMisses,[]);
for(const d of w.doors)d.closed=false;
for(const [start,target,label]of[[{f:0,x:12.5,y:26.5},{f:1,x:12.5,y:24.5},'principal up'],[{f:1,x:12.5,y:24.5},{f:0,x:12.5,y:26.5},'principal down'],[{f:0,x:38.5,y:2.5},{f:1,x:46.5,y:2.5},'service up'],[{f:1,x:46.5,y:2.5},{f:0,x:38.5,y:2.5},'service down']]){
 const e={...w.invs[0],...start,bot:true,kind:'inv',r:.3},heights=[];let arrived=false;
 for(let i=0;i<2400;i++){api.navTo(w,e,target,2.6,1/60);api.stairFlip(w,e);heights.push(api.elevOf(e));if(e.f===target.f&&Math.hypot(e.x-target.x,e.y-target.y)<.3){arrived=true;break;}}
 assert(arrived,`${label}: stopped at ${JSON.stringify({f:e.f,x:e.x,y:e.y})}`);assert(heights.every(Number.isFinite));assert(Math.max(...heights.slice(1).map((h,i)=>Math.abs(h-heights[i])))<.13,`${label}: height jump`);console.log(label,'frames',heights.length);
}
for(const h of api.HOME_CHOICES){const target=api.ROOM_CENTER[h.f][h.r],e={...w.invs[0],f:0,x:27.5,y:50.5,bot:true,kind:'inv',r:.3};let arrived=false;for(let k=0;k<7200;k++){api.navTo(w,e,target,2.6,1/30);api.stairFlip(w,e);if(e.f===target.f&&Math.hypot(e.x-target.x,e.y-target.y)<.3){arrived=true;break;}}assert(arrived,'Room unreachable: '+api.ROOMS[h.f][h.r].id+JSON.stringify({f:e.f,x:e.x,y:e.y,target,dist:api.pathLen(w,e,target)}));}
console.log('all 22 rooms reached from base');
const door=w.doors.find(d=>d.f===0&&Math.abs(d.x-30)<.01&&Math.abs(d.y-9.5)<.01);assert(door);door.closed=true;assert.equal(api.los(0,30,8.3,30,10.7,1.55,1.55,w),false);door.closed=false;assert.equal(api.los(0,30,8.3,30,10.7,1.55,1.55,w),true);
assert.equal(api.los(0,4.5,14.5,9.5,14.5),false);assert.equal(api.los(0,4.5,14.5,9.5,14.5,2.5,2.5),true);assert.equal(api.los(0,48.5,15.5,56.5,15.5),true);assert.equal(api.los(0,44.5,18.5,47.5,18.5),true);console.log('doors, tall occluders, low tables and broken windows passed');
const kinds=new Map();for(let k=0;k<60;k++){const next=api.newWorld({nInv:1+k%4,role:k%2?'bots':'inv',equip:['escaso','normal','abundante'][k%3],diff:['facil','normal','pesadilla'][k%3],night:600});if(next.layoutPackingMisses.length)for(const m of next.layoutPackingMisses)kinds.set(m.kind+':'+m.room,(kinds.get(m.kind+':'+m.room)||0)+1);assert(next.containers.every(c=>c.items.length<=2));assert(next.items.filter(it=>it.y<39&&!it.holder).every(it=>it.h>0),'Spawned floor loot');}
assert.equal(kinds.size,0,'Surface packing failed: '+JSON.stringify([...kinds]));console.log('60 complete nights placed without surface conflicts');
const stored=w.items.find(it=>it.containerId!==undefined),cbox=w.containers[stored.containerId],i=w.invs[0];Object.assign(i,{f:cbox.f,x:cbox.ax,y:cbox.ay,hidden:-1,alive:true,escaped:false,bot:false});w.g.stunUntil=1e9;assert.equal(api.layoutItemVisible(w,stored),false);api.layoutBeginSearch(w,i,cbox);for(let n=0;n<40;n++)api.step(w,1/30,{mx:0,my:0,press:new Set()});assert.equal(cbox.open,true);assert.equal(api.layoutItemVisible(w,stored),true);assert(api.pickUp(w,i));console.log('drawer search, reveal and pickup passed');

// The actual investigators and ghost use radii .30 and .32, including offset approaches.
for(const radius of[.30,.32])for(const dt of[1/60,.05,.1])for(const [start,tg]of[
 [{f:0,x:12.5,y:26.15},{f:1,x:12.5,y:24.5}],
 [{f:1,x:12.5,y:24.85},{f:0,x:12.5,y:26.5}],
 [{f:0,x:38.5,y:2.15},{f:1,x:46.5,y:2.5}],
 [{f:1,x:46.5,y:2.85},{f:0,x:38.5,y:2.5}]]){
 const e={...w.invs[0],...start,kind:radius===.32?'ghost':'inv',def:{fly:false},hunt:{},r:radius,bot:true,doorActionUntil:0};w.doors.forEach(d=>d.closed=false);let arrived=false;
 for(let n=0;n<4000;n++){api.navTo(w,e,tg,2.6,dt);api.stairFlip(w,e);if(e.f===tg.f&&Math.hypot(e.x-tg.x,e.y-tg.y)<.35){arrived=true;break;}}
 assert(arrived,'Real capsule stalled '+JSON.stringify({radius,dt,start,e:{f:e.f,x:e.x,y:e.y}}));
}
console.log('24 offset traversals passed with real .30/.32m capsules');

const bookWorld=api.newWorld({role:'bots',nInv:4,ghost:'pena'}),books=bookWorld.loose.filter(o=>o.shelfId);assert.equal(books.length,24);const book=books[0],original={x:book.x,y:book.y,h:book.h};bookWorld.loose=[book];bookWorld.t=100;Object.assign(bookWorld.g,{f:0,x:book.x,y:15.5,state:'libre',stunUntil:0});bookWorld.g.ready.c=0;assert(api.gMover(bookWorld,bookWorld.g));assert.equal(book.h,0);assert.deepEqual(book.from,original);assert(Math.hypot(book.x-original.x,book.y-original.y)>.5);console.log('24 independent shelf books, real throw with no decorative duplicate passed');

const closed=w.doors.find(d=>d.f===0&&d.x===30&&d.y===9.5),aView={f:0,x:30,y:8.3},bView={f:0,x:30,y:10.7};closed.closed=true;assert.equal(api.sees(aView,bView,10,w),false);closed.closed=false;assert.equal(api.sees(aView,bView,10,w),true);console.log('Actor sight respects closed/open door state');

for(let z=40;z<57;z++)assert.equal(api.grids[0][z*60+30],api.T.FLOOR,'Truck blocks entry path');
assert.equal(api.ROOMS[0].some(r=>r.id==='aperos'&&r.n==='Cuarto de aperos'),true);
const refuge=api.SPOTS.find(s=>s.id==='HB10');assert.deepEqual([refuge.x,refuge.y,refuge.hx,refuge.hy],[13,37,12.5,37.5]);
for(const target of[{f:0,x:16.5,y:54.4},{f:0,x:34.3,y:53.4}]){const actor={...w.invs[0],f:0,x:30.5,y:49.5,r:.3,bot:true};let ok=false;for(let k=0;k<3000;k++){api.navTo(w,actor,target,2.6,1/60);if(Math.hypot(actor.x-target.x,actor.y-target.y)<.3){ok=true;break;}}assert(ok,'Equipment or van exit inaccessible');}
console.log('Equipment access, central path, relocated truck and aperos refuge passed');

// Check eligible random cells and actual CAS placement against shared reservations.
let samples=0;for(let f=0;f<2;f++)for(let r=0;r<api.SPAWN_TILES[f].length;r++)for(const[x,y]of api.SPAWN_TILES[f][r]){assert(api.layoutPlacementAllowed(f,x+.5,y+.5,.35));samples++;}
for(let k=0;k<500;k++){const rr=api.HOME_CHOICES[k%api.HOME_CHOICES.length],p=api.randomIn(rr.f,rr.r),v={...w.invs[0],...p,face:k*.1};assert(api.layoutPlacementAllowed(p.f,p.x,p.y,.35));const point=api.casPoint(w,v,2.5,6,false);if(point)assert(api.layoutPlacementAllowed(point.f,point.x,point.y,.45));w.kneel=null;api.casRezando5(w,v);if(w.kneel)assert(api.layoutPlacementAllowed(w.kneel.f,w.kneel.x,w.kneel.y,.45));}
console.log(samples,'eligible spawn cells and 500 CAS placements clear of doors/stairs');

const decorWorld=api.newWorld({role:'inv',nInv:1}),components=decorWorld.loose.filter(o=>o.componentId);assert.equal(components.length,28);assert.equal(new Set(components.map(o=>o.componentId)).size,28);
for(const o of components){const w=api.newWorld({role:'inv',nInv:1});w.loose=[{...o}];w.t=100;Object.assign(w.g,{f:o.f,x:o.x,y:o.y,state:'libre',hunt:null,stunUntil:0});w.g.ready.c=0;assert(api.gMover(w,w.g),'Cannot throw '+o.componentId);assert.equal(w.loose[0].h,0);assert(Math.hypot(w.loose[0].x-o.x,w.loose[0].y-o.y)>.5,'No displacement '+o.componentId);assert.equal(api.grids[o.f][(w.loose[0].y|0)*60+(w.loose[0].x|0)],0);assert(api.layoutPlacementAllowed(o.f,w.loose[0].x,w.loose[0].y,.3));}
console.log('28 unique authored components throw through actual game action without door obstruction');

const scanWorld=api.newWorld({role:'inv',nInv:1}),scanner={...scanWorld.invs[0],x:38.5,y:1.98,f:0,r:.3,slots:[{kind:'termo'},null],ai:{sweep:{key:'0:3',p:{f:0,x:37.5,y:3.5},t:0}}};scanWorld.doors.forEach(d=>d.closed=false);let closest=99;for(let k=0;k<100;k++){if(!api.botTermoSweep(scanWorld,scanner,.1))api.navTo(scanWorld,scanner,{f:0,x:42.5,y:37.5},2.6,.1);closest=Math.min(closest,Math.hypot(scanner.x-37.5,scanner.y-3.5));}assert(closest<.55,'Thermometer scan alternated with exploration at stair entry');console.log('Thermometer scan completes its approach across a stair entry without oscillation');

const supplyWorld=api.newWorld({role:'bots',nInv:4}),collector=supplyWorld.invs[0],tea=supplyWorld.items.find(it=>it.kind==='te'&&!it.holder);assert(tea);for(const it of supplyWorld.items)if(it!==tea&&!it.holder){it.f=0;it.x=15;it.y=54;}Object.assign(tea,{f:0,x:37.5,y:4.25,h:.78});delete tea.containerId;Object.assign(collector,{f:0,x:38.5,y:1.7675696818,slots:[null,null],hidden:-1,alive:true,bot:true});Object.assign(collector.ai,{state:'resupply',goal:{f:0,x:24.5,y:1.5}});Object.assign(supplyWorld.g,{f:1,x:30,y:20,hunt:null});supplyWorld.doors.forEach(d=>d.closed=false);let supplyClosest=99;for(let k=0;k<100;k++){api.botInv(supplyWorld,collector,.1);api.stairFlip(supplyWorld,collector);supplyClosest=Math.min(supplyClosest,Math.hypot(collector.x-37.5,collector.y-3.5));}assert(supplyClosest<.55,'Supply pickup alternated with resupply at the stair entry');console.log('Nearby supply detour completes across the stair entry before returning to base');
