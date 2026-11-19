// Casona v11: one registry owns geometry, rooms, interactions and navigation.
const W=60,H=60,FL=W*H;
const T={FLOOR:0,WALL:1,TABLE:2,CLOSET:3,WATER:4,PILLAR:5,ALTAR:6,BED:7,SHELF:8,VOID:9,STAIR:10,BUSH:11,GATE:12,VAN:13,PROP:14,BENCH:15};
const walkableT=t=>t===T.FLOOR||t===T.STAIR;
const sightBlockT=t=>t===T.WALL||t===T.CLOSET||t===T.SHELF||t===T.PILLAR;
const ROOMS=[[],[]],RID=[{},{}],LAYOUT_ROOMS=new Map();
for(const r of NDALayout.rooms){const [a,b,c,d]=r.rect,rm={id:r.key,n:r.name,r:[a,b,c-1,d-1],code:r.id,home:r.home};LAYOUT_ROOMS.set(r.id,{f:r.floor,r:ROOMS[r.floor].length});ROOMS[r.floor].push(rm);}
for(const [f,id,n,r]of[[0,'patio','Patio',[18,13,41,26]],[0,'corredor','Corredor',[15,10,44,29]],[0,'afuera','Afuera (la base)',[1,40,58,58]],[1,'vacio','Vacío del patio',[18,13,41,26]],[1,'vaciocapilla','Vacío de la capilla',[24,1,35,5]],[1,'galeria','Galería',[15,10,44,29]],[1,'afuera1','Exterior superior',[0,40,59,59]]])ROOMS[f].push({id,n,r,home:false});
ROOMS.forEach((rs,f)=>rs.forEach((r,i)=>RID[f][r.id]=i));
// Compatibility names remain indexes into real rooms, never duplicate rooms.
Object.assign(RID[0],{sala:RID[0].botica,recp:RID[0].despacho,recn:RID[0].porteria,bano:RID[0].cocina,estudio:RID[0].despacho,servicio:RID[0].aperos});
Object.assign(RID[1],{juegos:RID[1].recn,oratorio:RID[1].coro,archivo:RID[1].salon,azotehuela:RID[1].nana});
const RECTS=ROOMS[0].map(r=>r.r),NO_HOME=ROOMS.map(rs=>rs.filter(r=>!r.home).map(r=>r.id));
const HALLS=[['corredor','patio','escalera'],['galeria','rellano']];
const WATER_ROOMS=[['cocina','patio','traspatio'],['banoalto']];
const BEDROOMS=[[],['recn','recp','abuelo','nana','hija','huespedes']];
const DOOR_DEFS_BY_FLOOR=[[],[]];
for(const d of NDALayout.doors){if(d.kind==='portón')continue;const[a,b,c,e]=d.rect;DOOR_DEFS_BY_FLOOR[d.floor].push([c-a===1?'V':'H',a,b,d.id,d.kind]);}
const DOOR_DEFS=DOOR_DEFS_BY_FLOOR[0];
const grids=[new Uint8Array(FL).fill(T.WALL),new Uint8Array(FL).fill(T.WALL)],roomGrid=[new Int8Array(FL).fill(-1),new Int8Array(FL).fill(-1)];
const fillLayout=(f,r,t,ri)=>{for(let y=r[1];y<r[3];y++)for(let x=r[0];x<r[2];x++){grids[f][y*W+x]=t;if(ri!==undefined)roomGrid[f][y*W+x]=ri;}};
for(const f of[0,1]){
 for(const r of ROOMS[f]){if(['corredor','galeria','vacio','vaciocapilla','afuera','afuera1','patio'].includes(r.id))continue;fillLayout(f,[r.r[0],r.r[1],r.r[2]+1,r.r[3]+1],T.FLOOR,RID[f][r.id]);}
 for(let y=10;y<30;y++)for(let x=15;x<45;x++){const inner=x>=18&&x<42&&y>=13&&y<27;grids[f][y*W+x]=inner&&f?T.VOID:T.FLOOR;roomGrid[f][y*W+x]=RID[f][inner?(f?'vacio':'patio'):(f?'galeria':'corredor')];}
 if(f){fillLayout(1,[24,1,36,6],T.VOID,RID[1].vaciocapilla);fillLayout(1,[49,1,59,9],T.VOID);fillLayout(1,[0,40,60,60],T.VOID,RID[1].afuera1);}
}
for(const d of NDALayout.doors){const adjacent=LAYOUT_ROOMS.get(d.a)||LAYOUT_ROOMS.get(d.b);fillLayout(d.floor,d.rect,T.FLOOR,adjacent?adjacent.r:RID[0].zaguan);}
// Heights and sight collision are independent: low tables never become opaque walls.
const SURF_H={[T.TABLE]:.78,[T.ALTAR]:.95},FURN=[[],[]],LAYOUT_FURN=[],LAYOUT_OCCLUDERS=[];
for(const o of NDALayout.obstacles){if(o.id.startsWith('reserva_'))continue;const[a,b,c,d]=o.rect,type=(o.kind==='prop'||o.kind==='chair')?T.PROP:o.kind==='bench'?T.BENCH:o.kind==='bath'?T.WATER:o.id.startsWith('columna')?T.PILLAR:o.id==='fuente'?T.WATER:(o.id.startsWith('cama_')||o.model==='bed')?T.BED:o.id==='altar_fijo'?T.ALTAR:o.blocksSight?T.SHELF:T.TABLE;fillLayout(o.floor,o.rect,type);FURN[o.floor].push([type,a,b,c-1,d-1]);LAYOUT_FURN.push({...o,type});if(o.blocksSight)LAYOUT_OCCLUDERS.push(o);}
// Continuous height profiles, with a single shared half-height transfer cell per staircase.
const STAIRS=NDALayout.stairs.map(s=>[Math.floor(s.hole[0]),Math.floor(s.hole[1]),Math.ceil(s.hole[2])-1,Math.ceil(s.hole[3])-1]);
const STAIR_DIR=[-1,1],isStair=new Uint8Array(FL),isStairMid=new Uint8Array(FL),STAIR_BLOCK=new Uint8Array(2*FL),STAIR_ENDS=new Set();
const STAIR_PATHS=[[[[11,26],[10,26],[9,26],[8,26],[7,26],[7,25]],[[7,25],[7,24],[8,24],[9,24],[10,24],[11,24]]],[[[38,2],[39,2],[40,2],[41,2]],[[41,2],[42,2],[43,2],[44,2],[45,2]]]];
for(let k=0;k<2;k++){
 const s=NDALayout.stairs[k],r=[Math.floor(s.hole[0]),Math.floor(s.hole[1]),Math.ceil(s.hole[2]),Math.ceil(s.hole[3])];
 for(const f of[0,1])fillLayout(f,r,T.PILLAR);
 const both=new Set(STAIR_PATHS[k].flat().map(([x,y])=>y*W+x));
 for(const i of both){isStair[i]=1;for(const f of[0,1]){grids[f][i]=T.STAIR;STAIR_BLOCK[f*FL+i]=1;}}
 for(const f of[0,1])for(const[x,y]of STAIR_PATHS[k][f])STAIR_BLOCK[f*FL+y*W+x]=0;
 const midpoint=k===0?[7,25]:[41,2];isStairMid[midpoint[1]*W+midpoint[0]]=1;
 for(const f of[0,1]){const p=STAIR_PATHS[k][f][f?STAIR_PATHS[k][f].length-1:0];STAIR_ENDS.add(p[1]*W+p[0]);}
}
const STAIR_INDEX=new Int8Array(FL).fill(-1);STAIR_PATHS.forEach((paths,k)=>paths.flat().forEach(([x,y])=>STAIR_INDEX[y*W+x]=k));
const stairAt=(x,y)=>x<0||y<0||x>=W||y>=H?-1:STAIR_INDEX[(y|0)*W+(x|0)];
function stairProjection(k,x,y){const p=NDALayout.stairs[k].path;let best=null,travel=0,total=0;for(let j=1;j<p.length;j++)total+=Math.hypot(p[j][0]-p[j-1][0],p[j][1]-p[j-1][1]);for(let j=1;j<p.length;j++){const a=p[j-1],b=p[j],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(l*l),0,1),dist=Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);if(!best||dist<best.dist)best={dist,height:(a[2]+(b[2]-a[2])*t)/3.8,p:(travel+l*t)/total};travel+=l;}return best;}
const stairP=(k,x,y)=>stairProjection(k,x,y).p;
const elevOf=e=>{const k=stairAt(e.x,e.y);return k<0?e.f:stairProjection(k,e.x,e.y).height;};
const stairSideBlock=(a,b)=>a!==b&&((isStair[a]&&!isStair[b]&&!STAIR_ENDS.has(a))||(isStair[b]&&!isStair[a]&&!STAIR_ENDS.has(b)));
function stairFlip(w,e,quiet){if(!e||(e.kind==='ghost'&&ethereal(e)))return;const k=stairAt(e.x,e.y);if(k<0)return;const p=stairP(k,e.x,e.y);if(e.f===0&&p>.505)quiet?(e.f=1):changeFloor(w,e,1);else if(e.f===1&&p<.495)quiet?(e.f=0):changeFloor(w,e,0);}
const stairNext=(k,up)=>k===0?{x:7.5,y:up?24.5:26.5}:{x:up?42.5:40.5,y:2.5};
// Exterior keeps the existing van, tables and spawn, with its path centered on the new portón.
fillLayout(0,[0,40,60,60],T.VOID,RID[0].afuera);fillLayout(0,[27,40,33,51],T.FLOOR,RID[0].afuera);fillLayout(0,NDALayout.exterior.apron,T.FLOOR,RID[0].afuera);
for(let y=41;y<57;y++)for(let x=1;x<59;x++)if(grids[0][y*W+x]===T.VOID&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>grids[0][(y+b)*W+x+a]===T.FLOOR))grids[0][y*W+x]=T.BUSH;
fillLayout(0,NDALayout.exterior.fence,T.GATE);fillLayout(0,NDALayout.exterior.van.collision,T.VAN);
for(const r of[[14,51,20,52],[14,55,20,56]]){fillLayout(0,r,T.TABLE);FURN[0].push([T.TABLE,r[0],r[1],r[2]-1,r[3]-1]);LAYOUT_FURN.push({id:'mesa_base_'+r[1],floor:0,rect:r,type:T.TABLE,height:.78});}
const tileAt=(f,x,y)=>x<0||y<0||x>=W||y>=H?T.WALL:grids[f][(y|0)*W+(x|0)];
const roomAt=(f,x,y)=>x<0||y<0||x>=W||y>=H?-1:roomGrid[f][(y|0)*W+(x|0)];
const roomOf=e=>roomAt(e.f,e.x,e.y),roomId=e=>{const r=roomOf(e);return r<0?'':ROOMS[e.f][r].id;},isHall=(f,r)=>r>=0&&HALLS[f].includes(ROOMS[f][r].id);
// Each socket owns one solid cell beside its approach point; keep doorway and stair clearances.
const SPOTS=[];
for(const h of NDALayout.hidingSockets){const f=h.floor,ri=LAYOUT_ROOMS.get(h.room).r,[x,y]=h.preferredSolid;if(tileAt(f,x,y)!==T.FLOOR||tileAt(f,h.x,h.z)!==T.FLOOR)throw Error('Authored hide obstructed: '+h.id);grids[f][y*W+x]=T.CLOSET;SPOTS.push({f,x,y,hx:h.x+.5,hy:h.z+.5,room:ri,id:h.id,type:h.type,mandatory:h.mandatory});}
const SPOT_DEFS=[0,1].map(f=>SPOTS.filter(s=>s.f===f).map(s=>[s.x,s.y]));
// All supporting furniture is authored in the registry; never auto-fill an arbitrary corner.
const ROOM_TILES=ROOMS.map((rs,f)=>rs.map((r,i)=>{const out=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(tileAt(f,x,y)===T.FLOOR&&roomAt(f,x,y)===i)out.push([x,y]);return out;}));
const ROOM_CENTER=ROOMS.map((rs,f)=>rs.map((r,i)=>{const c=[(r.r[0]+r.r[2]+1)/2,(r.r[1]+r.r[3]+1)/2],list=ROOM_TILES[f][i].slice().sort((a,b)=>Math.hypot(a[0]+.5-c[0],a[1]+.5-c[1])-Math.hypot(b[0]+.5-c[0],b[1]+.5-c[1]));return list.length?{f,x:list[0][0]+.5,y:list[0][1]+.5}:null;}));
const randomIn=(f,r)=>{const t=pick(ROOM_TILES[f][r]);if(!t)throw Error('Empty spawn room '+f+':'+r);return{f,x:t[0]+.5,y:t[1]+.5};};
const SURFACES=ROOMS.map((rs,f)=>rs.map((r,i)=>{const out=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(roomAt(f,x,y)===i&&SURF_H[tileAt(f,x,y)]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>walkableT(tileAt(f,x+a,y+b))))out.push([x,y,LAYOUT_FURN.find(o=>o.floor===f&&x>=o.rect[0]&&x<o.rect[2]&&y>=o.rect[1]&&y<o.rect[3])?.height||SURF_H[tileAt(f,x,y)]]);return out;}));
const onFurniture=(f,r)=>{const t=pick(SURFACES[f][r]);if(!t)return Object.assign(randomIn(f,r),{h:0});return{f,x:t[0]+.35+Math.random()*.3,y:t[1]+.35+Math.random()*.3,h:t[2]};};
const SWITCHES=[[],[]];for(const f of[0,1])ROOMS[f].forEach((r,i)=>{if(!ROOM_CENTER[f][i]||['patio','traspatio','afuera'].includes(r.id))return;for(const[o,x,y]of DOOR_DEFS_BY_FLOOR[f]){if(SWITCHES[f][i])break;for(const sd of[-1,1]){const px=o==='V'?x+.5+sd*.9:x+1,py=o==='V'?y+1:y+.5+sd*.9;if(roomAt(f,px,py)!==i)continue;const sx=o==='V'?(sd<0?x-.035:x+1.035):x+2.28,sy=o==='V'?y+2.28:(sd<0?y-.035:y+1.035);if(roomAt(f,o==='V'?sx+sd*.3:sx,o==='V'?sy:sy+sd*.3)!==i)continue;SWITCHES[f][i]={f,r:i,x:sx,y:sy,o,side:sd};}}});
for(const f of[0,1]){const ri=RID[f][f?'galeria':'corredor'],corners=[[15.035,11.5,1],[44.965,11.5,-1],[15.035,28.5,1],[44.965,28.5,-1]];SWITCHES[f][ri]={f,r:ri,x:corners[0][0],y:corners[0][1],o:'V',side:corners[0][2]};for(const[x,y,side]of corners.slice(1))SWITCHES[f].push({f,r:ri,x,y,o:'V',side});}
const ALTAR_POS={f:0,x:30,y:7.5},FUSE={f:0,x:35.5,y:32.5},EXIT={f:0,x:30,y:38.4},ZAG={f:0,x:30,y:38.4},MALETIN={f:0,x:30,y:35};
const HOME_CHOICES=[];ROOMS.forEach((rs,f)=>rs.forEach((r,i)=>{if(r.home)HOME_CHOICES.push({f,r:i});}));
const ROOM_LIST=[];ROOMS.forEach((rs,f)=>rs.forEach((r,i)=>{if(ROOM_CENTER[f][i]&&!['afuera','afuera1','vacio','vaciocapilla'].includes(r.id))ROOM_LIST.push({f,r:i});}));
const PROPS=[];for(const[code,kind]of[['B03','campanita'],['B06','libros'],['B04','grifo'],['B05','grifo'],['B11','reloj'],['B14','radio'],['A06','muneca'],['A08','piano'],['A02','maquina'],['A04','cuna'],['A09','grifo'],['A10','mecedora'],['A01','baul']]){const a=LAYOUT_ROOMS.get(code),p=ROOM_CENTER[a.f][a.r];PROPS.push({id:PROPS.length,f:a.f,kind,x:p.x,y:p.y});}PROPS.push({id:PROPS.length,f:0,kind:'fuente',x:30,y:20});
for(const p of PROPS){const id=p.kind==='grifo'?'prop_grifo_'+roomId(p):p.kind==='piano'?'piano':'prop_'+p.kind,o=NDALayout.obstacles.find(o=>o.id===id&&o.floor===p.f);if(o){p.x=(o.rect[0]+o.rect[2])/2;p.y=(o.rect[1]+o.rect[3])/2;p.owner=o.id;}}

let LAYOUT_HIDE_CACHE=null;
function layoutDistances(f,x,y){const d=new Int16Array(FL).fill(-1),q=new Int32Array(FL);let a=0,b=0;const start=(y|0)*W+(x|0);d[start]=0;q[b++]=start;while(a<b){const u=q[a++],xx=u%W,yy=(u/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=xx+dx,ny=yy+dy,v=ny*W+nx;if(nx<0||ny<0||nx>=W||ny>=H||d[v]>=0||!walkableT(grids[f][v])||STAIR_BLOCK[f*FL+v]||stairSideBlock(u,v))continue;d[v]=d[u]+1;q[b++]=v;}}return d;}
function layoutHideCache(){if(LAYOUT_HIDE_CACHE)return LAYOUT_HIDE_CACHE;const points=[];for(const f of[0,1])for(let y=1;y<39;y++)for(let x=1;x<59;x++){const i=y*W+x;if(walkableT(grids[f][i])&&!STAIR_BLOCK[f*FL+i]&&roomAt(f,x,y)>=0)points.push(f*FL+i);}const distances=SPOTS.map(s=>layoutDistances(s.f,s.hx,s.hy));const covers=SPOTS.map((s,k)=>new Set(points.filter(n=>Math.floor(n/FL)===s.f&&distances[k][n%FL]>=0&&distances[k][n%FL]<=18)));const missing=points.filter(n=>!covers.some(c=>c.has(n)));if(missing.length)throw Error('Hide coverage failed at '+missing.slice(0,12).map(n=>`${n>=FL?1:0}:${n%W},${Math.floor(n%FL/W)}`).join(';'));return LAYOUT_HIDE_CACHE={points,distances,covers};}
function chooseLayoutSpots(){const{points,covers}=layoutHideCache(),act=new Set(SPOTS.flatMap((s,k)=>s.mandatory?[k]:[])),used=new Set([...act].map(k=>SPOTS[k].f+':'+SPOTS[k].room));let missing=new Set(points);for(const k of act)for(const n of covers[k])missing.delete(n);
 while(missing.size){let best=-1,gain=0;for(const k of shuffle(SPOTS.map((s,k)=>k))){if(act.has(k)||used.has(SPOTS[k].f+':'+SPOTS[k].room))continue;let g=0;for(const n of covers[k])if(missing.has(n))g++;if(g>gain){gain=g;best=k;}}if(best<0||!gain)throw Error('No legal hide selection: '+missing.size+' cells uncovered');act.add(best);used.add(SPOTS[best].f+':'+SPOTS[best].room);for(const n of covers[best])missing.delete(n);}
 for(const k of shuffle([...act])){if(SPOTS[k].mandatory)continue;const covered=new Set([...act].filter(j=>j!==k).flatMap(j=>[...covers[j]]));if(points.every(n=>covered.has(n))){act.delete(k);used.delete(SPOTS[k].f+':'+SPOTS[k].room);}}
 for(const k of shuffle(SPOTS.map((s,k)=>k))){if(act.size>=NDALayout.hideBudget.min)break;if(!used.has(SPOTS[k].f+':'+SPOTS[k].room)){act.add(k);used.add(SPOTS[k].f+':'+SPOTS[k].room);}}
 if(act.size>NDALayout.hideBudget.max)throw Error('Hide budget exceeded: '+act.size);const target=Math.min(NDALayout.hideBudget.max,act.size+Math.floor(Math.random()*3));for(const k of shuffle(SPOTS.map((s,k)=>k))){if(act.size>=target)break;if(!used.has(SPOTS[k].f+':'+SPOTS[k].room)){act.add(k);used.add(SPOTS[k].f+':'+SPOTS[k].room);}}return act;
}

const PROP_INFO = {
  mecedora: ['La mecedora se mece sola', 'creak'], grifo: ['Un grifo se abre: corre el agua', 'water'], cuadro: ['¡Un cuadro cae de la pared!', 'crash'], campanita: ['Suena la campanita del altar', 'ding'],
  libros: ['Caen libros de la repisa', 'books'], reloj: ['El reloj da campanadas fuera de hora', 'chime'], muneca: ['La muñeca gira la cabeza', 'creak'], fuente: ['El agua de la fuente salpica', 'water'],
  ventana: ['Una ventana golpetea', 'rattle'], radio: ['El radio se enciende entre estática', 'static'], piano: ['Una nota desafinada en el piano', 'piano'], maquina: ['La máquina de coser traquetea', 'rattle'],
  caballito: ['El caballito de madera se balancea', 'creak'], cajita: ['Una cajita de música empieza a sonar', 'toy'], cuna: ['La cuna se mece', 'creak'], baul: ['La tapa de un baúl se azota', 'crash'],
  papeles: ['Papeles vuelan del archivero', 'books'],
};

