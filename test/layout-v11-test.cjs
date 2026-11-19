const fs=require('node:fs'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..');
const read=p=>fs.readFileSync(require('node:path').join(root,p),'utf8');
let source='const NDALayout='+read('src/layout-v11.json')+';\n'+read('src/logic2.js').replace('/*LAYOUT_RUNTIME*/',read('src/layout-runtime.js'))+'\n'+read('src/rules3.js')+'\n'+read('src/rules4.js')+'\n'+read('src/layout-rules.js');
const api=new Function('module',source+';return {newWorld,step,interact,pickUp,layoutItemVisible,layoutBeginSearch,chooseSpots,SPOTS,ROOMS,ROOM_TILES,ROOM_CENTER,HOME_CHOICES,SURFACES,layoutHideCache,grids,T,STAIR_BLOCK,STAIR_PATHS,stairProjection,layoutDistances,navTo,stairFlip,elevOf,pathLen,los};')({exports:{}});
console.log('rooms',api.ROOMS.map(r=>r.length),'spots',api.SPOTS.length);
assert.equal(api.HOME_CHOICES.length,22);assert.equal(api.SPOTS.length,24);
const c=api.layoutHideCache();console.log('coverage cells',c.points.length);
let min=Infinity,max=0;for(let seed=0;seed<100;seed++){const a=api.chooseSpots();min=Math.min(min,a.size);max=Math.max(max,a.size);assert(a.size>=18&&a.size<=20);const covered=new Set([...a].flatMap(k=>[...c.covers[k]]));assert(c.points.every(n=>covered.has(n)));const rooms=[...a].map(k=>api.SPOTS[k].f+':'+api.SPOTS[k].room);assert.equal(new Set(rooms).size,rooms.length);}
console.log('active range',min,max);
const w=api.newWorld({nInv:1,role:'inv',equip:'normal',night:600});console.log('world',w.invs.length,'doors',w.doors.length,'hides',w.spotsActive.size);
assert.deepEqual(w.layoutPackingMisses,[]);
for(const d of w.doors)d.closed=false;
for(const [start,target,label]of[[{f:0,x:12.5,y:26.5},{f:1,x:12.5,y:24.5},'principal up'],[{f:1,x:12.5,y:24.5},{f:0,x:12.5,y:26.5},'principal down'],[{f:0,x:38.5,y:2.5},{f:1,x:46.5,y:2.5},'service up'],[{f:1,x:46.5,y:2.5},{f:0,x:38.5,y:2.5},'service down']]){
 const e={...w.invs[0],...start,bot:true,kind:'inv',r:.22},heights=[];let arrived=false;
 for(let i=0;i<2400;i++){api.navTo(w,e,target,2.6,1/60);api.stairFlip(w,e);heights.push(api.elevOf(e));if(e.f===target.f&&Math.hypot(e.x-target.x,e.y-target.y)<.3){arrived=true;break;}}
 assert(arrived,`${label}: stopped at ${JSON.stringify({f:e.f,x:e.x,y:e.y})}`);assert(heights.every(Number.isFinite));assert(Math.max(...heights.slice(1).map((h,i)=>Math.abs(h-heights[i])))<.13,`${label}: height jump`);console.log(label,'frames',heights.length);
}
for(const h of api.HOME_CHOICES){const target=api.ROOM_CENTER[h.f][h.r],e={...w.invs[0],f:0,x:27.5,y:50.5,bot:true,kind:'inv',r:.22};let arrived=false;for(let k=0;k<7200;k++){api.navTo(w,e,target,2.6,1/30);api.stairFlip(w,e);if(e.f===target.f&&Math.hypot(e.x-target.x,e.y-target.y)<.3){arrived=true;break;}}assert(arrived,'Room unreachable: '+api.ROOMS[h.f][h.r].id+JSON.stringify({f:e.f,x:e.x,y:e.y,target,dist:api.pathLen(w,e,target)}));}
console.log('all 22 rooms reached from base');
const door=w.doors.find(d=>d.f===0&&Math.abs(d.x-30)<.01&&Math.abs(d.y-9.5)<.01);assert(door);door.closed=true;assert.equal(api.los(0,30,8.3,30,10.7,1.55,1.55,w),false);door.closed=false;assert.equal(api.los(0,30,8.3,30,10.7,1.55,1.55,w),true);
assert.equal(api.los(0,4.5,14.5,9.5,14.5),false);assert.equal(api.los(0,4.5,14.5,9.5,14.5,2.5,2.5),true);assert.equal(api.los(0,48.5,15.5,56.5,15.5),true);assert.equal(api.los(0,44.5,18.5,47.5,18.5),true);console.log('doors, tall occluders, low tables and broken windows passed');
const kinds=new Map();for(let k=0;k<60;k++){const next=api.newWorld({nInv:1+k%4,role:k%2?'bots':'inv',equip:['escaso','normal','abundante'][k%3],diff:['facil','normal','pesadilla'][k%3],night:600});if(next.layoutPackingMisses.length)for(const m of next.layoutPackingMisses)kinds.set(m.kind+':'+m.room,(kinds.get(m.kind+':'+m.room)||0)+1);assert(next.containers.every(c=>c.items.length<=2));assert(next.items.filter(it=>it.y<39&&!it.holder).every(it=>it.h>0),'Spawned floor loot');}
assert.equal(kinds.size,0,'Surface packing failed: '+JSON.stringify([...kinds]));console.log('60 complete nights placed without surface conflicts');
const stored=w.items.find(it=>it.containerId!==undefined),cbox=w.containers[stored.containerId],i=w.invs[0];Object.assign(i,{f:cbox.f,x:cbox.ax,y:cbox.ay,hidden:-1,alive:true,escaped:false,bot:false});w.g.stunUntil=1e9;assert.equal(api.layoutItemVisible(w,stored),false);api.layoutBeginSearch(w,i,cbox);for(let n=0;n<40;n++)api.step(w,1/30,{mx:0,my:0,press:new Set()});assert.equal(cbox.open,true);assert.equal(api.layoutItemVisible(w,stored),true);assert(api.pickUp(w,i));console.log('drawer search, reveal and pickup passed');
