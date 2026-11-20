const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let seed=+(process.env.SEED||37);Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let source='const NDALayout='+read('src/layout-v11.json')+';\n'+read('src/placement-layout.js')+'\n'+read('src/logic2.js').replace('/*LAYOUT_RUNTIME*/',read('src/layout-runtime.js'))+'\n'+['rules3.js','rules4.js','decor-runtime.js','layout-rules.js','decor-rules.js','rules5.js'].map(p=>read('src/'+p)).join('\n');
source=source.replace('function navTo(w, e, tg, speed, dt) {','function navTo(w, e, tg, speed, dt) { e._qaNav={target:tg,at:w.t};');
source+=';const _qaNavRun=navTo;navTo=function(w,e,tg,speed,dt){if(e._qaCallsAt!==w.t){e._qaCallsAt=w.t;e._qaCalls=[];}const before={x:e.x,y:e.y,f:e.f},r=_qaNavRun(w,e,tg,speed,dt);e._qaCalls.push({before,target:tg,after:{x:e.x,y:e.y,f:e.f},collides:collides(w,e,e.x,e.y)});return r;};';
const a=new Function('module',source+';return {SWITCHES,newItem,useItem,useItemRaw,dropItem,throwItem,hangRosary,nearSwitch,toggleLight,FUSE,decorWallOccupied,newWorld,step,GHOSTS,SPOTS,ROOMS,STAIR_PATHS,stairAt,navTo,stairFlip,elevOf,collides,snapWalkable,gMover,LAYOUT_FURN,SURFACES,grids,T,roomAt,layoutHideCache};')({exports:{}});
module.exports=a;
if(require.main===module){
 const reports=[];for(const id of (process.env.GHOSTS==='all'?a.GHOSTS.map(g=>g.id):(process.env.GHOSTS||'pena,cucuy,nahual').split(','))){
  const w=a.newWorld({role:'bots',nInv:4,ghost:id,night:600,diff:'normal',equip:'normal'}),visits=new Set(),stalls=[],track=w.invs.map(i=>({x:i.x,y:i.y,f:i.f,t:0}));let ticks=0;if(w.layoutPackingMisses.length)throw Error(JSON.stringify(w.layoutPackingMisses));
  for(;ticks<15000&&!w.over;ticks++){
   a.step(w,.1,{mx:0,my:0,press:new Set()});
   for(const i of w.invs){if(!i.alive||i.escaped)continue;if(![i.x,i.y,i.f,i.san].every(Number.isFinite))throw Error('Nonfinite actor');visits.add(i.f+':'+a.roomAt(i.f,i.x,i.y));const t=track[i.id];if(i.f!==t.f||Math.hypot(i.x-t.x,i.y-t.y)>.35)Object.assign(t,{x:i.x,y:i.y,f:i.f,t:w.t});if(a.stairAt(i.x,i.y)>=0&&i.hidden<0&&w.t-t.t>20&&!stalls.some(s=>s.who===i.id)){stalls.push({who:i.id,t:w.t,f:i.f,x:i.x,y:i.y,nav:i._qaNav,calls:i._qaCalls,collision:a.collides(w,i,i.x,i.y),radius:i.r,reading:i.reading,stun:i.stunUntil,ai:JSON.parse(JSON.stringify(i.ai))});}}
  }
  const r={ghost:id,time:w.t,phase:w.phase,over:w.over,roomsVisited:visits.size,hunts:w.stats.hunts,stalls,actors:w.invs.map(i=>({id:i.id,alive:i.alive,escaped:i.escaped,f:i.f,x:i.x,y:i.y,hidden:i.hidden,ai:i.ai}))};reports.push(r);console.log(JSON.stringify({ghost:r.ghost,time:r.time,win:r.over?.win,hunts:r.hunts,stalls:r.stalls.length,visited:r.roomsVisited}));
 }
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/session-casona.json'),JSON.stringify(reports,null,2));
 if(reports.some(r=>!r.over||r.stalls.length))process.exitCode=1;
}
