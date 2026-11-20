// Scene-specific rules: all coordinates and room references come from the v11 registry.
function layoutWindowVolume(win){const[a,z]=win.start,[c,e]=win.end;return a!==c?[a,z,c,z+1]:[win.wall.startsWith('oeste')?a-1:a,z,win.wall.startsWith('oeste')?a:a+1,e];}
function layoutWindowNear(f,x,y,r=.7){return NDALayout.windows.some(win=>{const a=layoutWindowVolume(win),bottom=win.floor*3.8+win.sillRelative,top=bottom+win.height;return f*3.8+1.25<top&&f*3.8+1.75>bottom&&x>=a[0]-r&&x<=a[2]+r&&y>=a[1]-r&&y<=a[3]+r;});}
function nearLayoutContainer(w,i){if(i.hidden>=0)return null;return(w.containers||[]).filter(c=>!c.open&&c.f===i.f&&Math.hypot(c.ax-i.x,c.ay-i.y)<1.45).sort((a,b)=>a.id-b.id)[0]||null;}
function layoutItemVisible(w,it){if(it.containerId===undefined)return true;const c=w.containers?.[it.containerId];return!c||c.open||it.f!==c.f||Math.hypot(it.x-it.stowX,it.y-it.stowY)>.35;}
function layoutBeginSearch(w,i,c){if(!c||c.open)return false;if(!c.until){c.until=w.t+1;c.by=i.id;w.noise({f:c.f,x:c.x,y:c.y},6,'drawer');}return true;}
function layoutItemRadius(kind){return{rosario:.18,ruda:.14,cruz:.18,pan:.15,tablilla:.37,pentagrama:.35,fotocam:.17,radio:.16,espejoplata:.16}[kind]||.13;}
function layoutSurfacePacking(w){
 const taken=[],reserve=(f,x,y,r)=>taken.push({f,x,y,r});w.layoutPackingMisses=[];
 for(const i of NDALayout.decorInstances||[]){const p=decorPosition(i),a=NDALayout.decorAssets[i.asset];const owner=NDALayout.obstacles.find(o=>o.id===i.support);if(!a.mount&&p.h>.7&&a.height>.03&&p.h<owner.height+.3&&p.h+a.height>owner.height-.05)reserve(p.f,p.x,p.y,a.radius+.06);}
 reserve(w.altarSurface.f,w.altarSurface.x,w.altarSurface.y,.55);
 for(const f of[0,1])ROOMS[f].forEach((r,ri)=>{const s=SURFACES[f][ri][0];if(s&&r.home&&!NDALayout.decorInstances?.some(i=>i.room===r.code)&&!((w.devices||[]).some(d=>d.f===f&&d.r===ri)&&SURFACES[f][ri].length<2))reserve(f,s[0]+.25,s[1]+.25,.14);});
 const place=(o,radius=.13)=>{
  const original={f:o.f,r:roomAt(o.f,o.x,o.y)},options=[original];
  for(const[f,id]of ITEM_PLACES[o.kind]||[]){const r=RID[f][id];if(!options.some(q=>q.f===f&&q.r===r))options.push({f,r});}
  for(const option of options){const points=[];for(const[x,y,h]of SURFACES[option.f][option.r]||[])for(const dx of(radius>.25?[.5]:[.16,.5,.84]))for(const dy of(radius>.25?[.5]:[.16,.5,.84]))points.push({f:option.f,x:x+dx,y:y+dy,h});points.sort((a,b)=>Math.hypot(a.x-o.x,a.y-o.y)-Math.hypot(b.x-o.x,b.y-o.y));const point=points.find(p=>layoutPlacementAllowed(p.f,p.x,p.y,radius)&&!taken.some(t=>t.f===p.f&&Math.hypot(t.x-p.x,t.y-p.y)<t.r+radius));if(point){Object.assign(o,point);reserve(point.f,point.x,point.y,radius);return true;}}
  w.layoutPackingMisses.push({kind:o.kind,f:o.f,room:ROOMS[o.f][original.r]?.id});return false;
 };

 // Large devices claim their surface first; loose clutter and consumables fill remaining slots.
 for(const d of (w.devices||[]).slice().sort((a,b)=>(b.kind==='tv')-(a.kind==='tv')))place(d,d.kind==='tv'?.47:.28);
 for(const it of w.items)if(!it.holder&&!(it.f===0&&it.y>=40)&&layoutItemRadius(it.kind)>.25)place(it,layoutItemRadius(it.kind));
 for(const p of PROPS)if(['campanita','libros','radio','maquina','muneca'].includes(p.kind)){const a=LAYOUT_ROOMS.get(NDALayout.rooms.find(r=>r.floor===p.f&&r.key===roomId(p))?.id);if(a&&SURFACES[p.f][a.r]?.length){const s=SURFACES[p.f][a.r][0];p.x=s[0]+.65;p.y=s[1]+.65;p.h=s[2];place(p,.18);}}
 for(const o of w.loose)place(o,['plato','cuadro','jarron','libro'].includes(o.kind)?.16:.10);
 for(const it of w.items)if(!it.holder&&!(it.f===0&&it.y>=40)&&layoutItemRadius(it.kind)<=.25)place(it,layoutItemRadius(it.kind));
}
const _newWorldLayout=newWorld;
newWorld=function(opt){fieldCache.clear();const w=_newWorldLayout(opt);w.layout=NDALayout.version;
 const contents={despensa:['jarron','taza'],planchaduria:['taza','libro'],capilla:['vela','figura'],cocina:['plato','taza'],biblioteca:['libro','libro'],comedor:['plato','taza'],reposteria:['plato','jarron'],aperos:['jarron','libro'],despacho:['libro','cuadro'],porteria:['taza','libro'],botica:['jarron','figura'],desvan:['cuadro','libro'],costura:['taza','libro'],nana:['vela','cuadro'],recn:['libro','figura'],musica:['libro','taza'],banoalto:['jarron','taza'],huespedes:['cuadro','taza'],abuelo:['vela','cuadro'],recp:['cuadro','vela'],salon:['jarron','figura'],hija:['cuadro','jarron']};
 for(const o of w.loose){const kinds=contents[roomId(o)];if(kinds)o.kind=kinds[o.id%kinds.length];}
 // Keep the fuse box on solid plaster, never on a real window or behind a moving door.
 const fr=w.fuseRoom,candidates=shuffle(ROOM_TILES[fr.f][fr.r].slice());for(const[x,y]of candidates){const side=[[1,0],[-1,0],[0,1],[0,-1]].find(([a,b])=>tileAt(fr.f,x+a,y+b)===T.WALL);if(!side||decorWallOccupied(fr.f,x+.5+side[0]*.38,y+.5+side[1]*.38)||layoutWindowNear(fr.f,x+.5+side[0]*.5,y+.5+side[1]*.5)||w.doors.some(d=>d.f===fr.f&&Math.hypot(d.x-x-.5,d.y-y-.5)<2)||SPOTS.some(s=>s.f===fr.f&&Math.hypot(s.hx-x-.5,s.hy-y-.5)<1.5))continue;Object.assign(FUSE,{f:fr.f,x:x+.5+side[0]*.38,y:y+.5+side[1]*.38,face:Math.atan2(-side[1],-side[0])});break;}
 layoutSurfacePacking(w);
 for(const shelf of LAYOUT_FURN.filter(o=>o.model==='bookcase'))for(const h of[.18,.65,1.12,1.59])for(let k=0;k<6;k++){
  const angle=shelf.rotation||0,co=Math.cos(angle),si=Math.sin(angle),turn=Math.round(angle/(Math.PI/2))%2,W0=turn?shelf.rect[3]-shelf.rect[1]:shelf.rect[2]-shelf.rect[0],D0=turn?shelf.rect[2]-shelf.rect[0]:shelf.rect[3]-shelf.rect[1],lx=-W0/2+.3+k*.27,lz=D0/2-.38,x=(shelf.rect[0]+shelf.rect[2])/2+co*lx+si*lz,y=(shelf.rect[1]+shelf.rect[3])/2-si*lx+co*lz;
  w.loose.push({id:w.loose.length,kind:'libro',f:shelf.floor,x,y,h,rot:angle,flyT:-99,from:null,shelfId:shelf.id,releaseX:x+si*.5,releaseY:y+co*.5});
 }
 w.propPositions=PROPS.map(p=>({id:p.id,f:p.f,x:p.x,y:p.y,h:p.h||0,rotationY:p.rotationY||0}));
 w.containers=[];for(const h of HOME_CHOICES){const s=SURFACES[h.f][h.r].find(([x,y])=>tileAt(h.f,x,y)===T.TABLE)||SURFACES[h.f][h.r][0];if(!s)continue;const side=[[0,1],[0,-1],[-1,0],[1,0]].find(([dx,dy])=>walkableT(tileAt(h.f,s[0]+dx,s[1]+dy)));if(!side)continue;for(let level=0;level<3;level++)w.containers.push({id:w.containers.length,f:h.f,room:h.r,x:s[0]+.5,y:s[1]+.5,h:s[2],ax:s[0]+.5+side[0],ay:s[1]+.5+side[1],dx:side[0],dy:side[1],level,open:false,until:0,by:-1,items:[]});}
 for(const it of shuffle(w.items.filter(it=>!it.holder&&!TOOLS.includes(it.kind)&&it.kind!=='fotocam'&&it.y<39))){const ri=roomAt(it.f,it.x,it.y),c=w.containers.find(c=>c.f===it.f&&c.room===ri&&c.items.length<2&&Math.hypot(it.x-c.ax,it.y-c.ay)<1.25);if(c){c.items.push(it.id);it.containerId=c.id;it.stowX=it.x;it.stowY=it.y;}}
 return w;
};
const _pickUpLayout=pickUp;
pickUp=function(w,i){const stored=w.items.filter(it=>!it.holder&&it.f===i.f&&!layoutItemVisible(w,it)&&d2(i,it)<1.6).sort((a,b)=>d2(a,i)-d2(b,i))[0];if(stored&&!w.items.some(it=>!it.holder&&it.f===i.f&&layoutItemVisible(w,it)&&d2(i,it)<1.3)){layoutBeginSearch(w,i,w.containers[stored.containerId]);return false;}const ok=_pickUpLayout(w,i);if(ok)for(const it of i.slots)if(it)delete it.containerId;return ok;};
const _interactLayout=interact;
interact=function(w,i){if(i.hidden>=0||i.f===FUSE.f&&d2(i,FUSE)<1.6&&!w.fuse.every(Boolean)||nearSpot(w,i)>=0)return _interactLayout(w,i);const free=w.items.some(it=>!it.holder&&it.f===i.f&&layoutItemVisible(w,it)&&d2(i,it)<1.3);const c=nearLayoutContainer(w,i);if(c&&!free){layoutBeginSearch(w,i,c);return'cajon';}return _interactLayout(w,i);};
const _stepLayout=step;
step=function(w,dt,input){_stepLayout(w,dt,input);for(const c of w.containers||[])if(c.until&&!c.open){const i=w.invs[c.by];if(!i||!i.alive||i.escaped||i.f!==c.f||Math.hypot(i.x-c.ax,i.y-c.ay)>1.65||i.hidden>=0){c.until=0;c.by=-1;continue;}if(w.t>=c.until){c.open=true;c.until=0;w.ev('drawerOpen',{f:c.f,x:c.x,y:c.y,who:i.id,empty:!c.items.some(id=>w.items.some(it=>it.id===id&&!it.holder&&it.f===c.f))});}}};
// A single visibility height grid is shared by the AI and the investigator-side checks.
const LAYOUT_SIGHT_HEIGHT=[new Float32Array(FL),new Float32Array(FL)];
for(const f of[0,1])for(let i=0;i<FL;i++){const t=grids[f][i];LAYOUT_SIGHT_HEIGHT[f][i]=t===T.WALL||t===T.PILLAR?3.8:t===T.CLOSET?2:0;}
for(const s of SPOTS)LAYOUT_SIGHT_HEIGHT[s.f][s.y*W+s.x]=/arcon|baul/.test(s.type)?1.05:2;
for(const o of LAYOUT_OCCLUDERS)for(let y=o.rect[1];y<o.rect[3];y++)for(let x=o.rect[0];x<o.rect[2];x++)LAYOUT_SIGHT_HEIGHT[o.floor][y*W+x]=o.height;
for(const o of LAYOUT_FURN.filter(o=>o.type===T.PILLAR))for(let y=o.rect[1];y<o.rect[3];y++)for(let x=o.rect[0];x<o.rect[2];x++)LAYOUT_SIGHT_HEIGHT[1][y*W+x]=3.8;
const LAYOUT_SIGHT_LOOKUP={portals:[[],[]],windows:[[],[]],precise:[[],[]]};
for(const d of NDALayout.doors)for(let y=d.rect[1];y<d.rect[3];y++)for(let x=d.rect[0];x<d.rect[2];x++)LAYOUT_SIGHT_LOOKUP.portals[d.floor][y*W+x]=d;
for(const w of NDALayout.windows){const r=layoutWindowVolume(w),bottom=w.floor*3.8+w.sillRelative,top=bottom+w.height;for(const f of[0,1])if(f*3.8<top&&(f+1)*3.8>bottom)for(let y=Math.floor(r[1]);y<r[3];y++)for(let x=Math.floor(r[0]);x<r[2];x++)(LAYOUT_SIGHT_LOOKUP.windows[f][y*W+x]||=([])).push(w);}
for(const o of LAYOUT_OCCLUDERS)if(o.sightRect)for(let y=o.rect[1];y<o.rect[3];y++)for(let x=o.rect[0];x<o.rect[2];x++)LAYOUT_SIGHT_LOOKUP.precise[o.floor][y*W+x]=o;
function layoutPortalHead(d,x,y){const r=d.rect,u=Math.min(r[2]-r[0]===1?y-r[1]:x-r[0],r[2]-r[0]===1?r[3]-y:r[2]-x),spring=d.kind==='portón'?2.5:2.1,apex=d.kind==='portón'?3.25:2.6;return spring+(u<.36?u*.5:.18+(u-.36)*(apex-spring-.18)/.64);}
los=function(f,ax,ay,bx,by,az=1.55,bz=1.55,world){
 const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)*8));let prevHeight=f*3.8+az;
 for(let k=1;k<n;k++){
  const t=k/n,x=ax+(bx-ax)*t,y=ay+(by-ay)*t,globalHeight=f*3.8+az+(bz-az)*t,level=Math.max(0,Math.min(1,Math.floor(globalHeight/3.8))),h=globalHeight-level*3.8,i=(y|0)*W+(x|0);
  if(x<0||y<0||x>=W||y>=H)return false;
  if((prevHeight<3.8)!==(globalHeight<3.8)&&tileAt(1,x,y)!==T.VOID&&!NDALayout.stairs.some(s=>x>=s.hole[0]&&x<=s.hole[2]&&y>=s.hole[1]&&y<=s.hole[3]))return false;prevHeight=globalHeight;
  let block=LAYOUT_SIGHT_HEIGHT[level][i];
  const precise=LAYOUT_SIGHT_LOOKUP.precise[level][i];if(precise){const r=precise.sightRect;if(x<r[0]||x>=r[2]||y<r[1]||y>=r[3])block=0;}
  if(block&&tileAt(level,x,y)===T.WALL){const window=LAYOUT_SIGHT_LOOKUP.windows[level][i]?.find(w=>{const r=layoutWindowVolume(w),bottom=w.floor*3.8+w.sillRelative;return x>=r[0]&&x<r[2]&&y>=r[1]&&y<r[3]&&globalHeight>=bottom&&globalHeight<bottom+w.height;});if(window&&['abierta','vidrio roto'].includes(window.state))block=0;}
  const portal=LAYOUT_SIGHT_LOOKUP.portals[level][i];if(portal&&h>layoutPortalHead(portal,x,y))return false;
  if(world?.doorTile?.get(level*FL+i)?.closed&&h<2.6)return false;
  if(h>=0&&h<block)return false;
 }return true;
};
