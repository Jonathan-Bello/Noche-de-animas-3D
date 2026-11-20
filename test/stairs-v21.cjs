const a=require('./session-casona.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const w=a.newWorld({role:'inv',nInv:1});for(const d of w.doors)d.closed=false;
for(const r of[.30,.32])for(const kind of[null,'termo','tablilla','tv']){
 const e={...w.invs[0],f:0,x:38.5,y:3.05,r,kind:'inv',slots:[kind?{kind,holder:0}:null,null]};
 assert(!a.collides(w,e,e.x,e.y),'El acceso sin barandal debe dejar girar');
 let prev=a.elevOf(e);
 for(let n=0;n<200;n++){a.tryMove(w,e,.04,0);a.stairFlip(w,e);const h=a.elevOf(e);assert(Math.abs(h-prev)<.13,'Salto de altura en la franja lateral');prev=h;}
 assert(e.x>46.3&&e.f===1,'Debe subir por todo el ancho con '+kind+': '+JSON.stringify(e));
 for(let n=0;n<230;n++){a.tryMove(w,e,-.04,0);a.stairFlip(w,e);}assert(e.x<37.7&&e.f===0,'Debe bajar y salir sin engancharse con '+kind);
 const on={...e,f:0,x:40.2,y:3.05};assert(!a.collides(w,on,40.2,3.05));assert(a.collides(w,on,40.2,3.35),'El cuerpo no debe atravesar el barandal');
}
const exitActor={...w.invs[0],f:1,x:45.5,y:2.5,r:.3,kind:'inv',bot:true};let exitReached=false;
for(let k=0;k<700;k++){a.navTo(w,exitActor,{f:1,x:45.5,y:1.5},2.6,1/30);a.stairFlip(w,exitActor);if(exitActor.f===1&&Math.hypot(exitActor.x-45.5,exitActor.y-1.5)<.2){exitReached=true;break;}}
assert(exitReached,'El bot debe rodear el extremo del barandal, sin intentar cruzarlo de lado');
const g={...w.g,f:0,x:37.5,y:4.5,r:.32,kind:'ghost',state:'libre',hunt:{},bot:true},target={f:0,x:40.2,y:3.05};let reached=false;
for(let k=0;k<1400;k++){a.navTo(w,g,target,2.6,1/30);a.stairFlip(w,g);if(Math.hypot(g.x-target.x,g.y-target.y)<.2&&g.f===target.f){reached=true;break;}}
assert(reached,'El ánima debe alcanzar al jugador en la franja ampliada');
assert(a.los(0,40.2,2.8,40.2,3.05,2.5,2.5,w),'La antigua celda gruesa no debe tapar la visión en el paso libre');
const report={passed:true,heldItemTraversals:16,realWidth:true,railCollision:true,ghostReachesWidenedLane:true,noInvisibleSightWall:true,upperExitDetour:true};
fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../test-results/stairs-v21.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
