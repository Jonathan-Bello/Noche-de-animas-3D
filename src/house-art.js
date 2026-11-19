// Primera muestra de la casona: antigua y vivida, terror legible, materiales mate.
const NDAVisualQuality=(()=>{
 const profiles={low:{dpr:1,shadow:0,detail:false},balanced:{dpr:1.35,shadow:768,detail:true},high:{dpr:2,shadow:1024,detail:true}};
 let preference='auto';try{const value=localStorage.getItem('nda_visual_quality');if(['auto','low','balanced','high'].includes(value))preference=value;}catch(e){}
 function current(){const mobile=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;return profiles[preference==='auto'?(mobile?'low':'balanced'):preference]||profiles.balanced;}
 function select(value){preference=['auto','low','balanced','high'].includes(value)?value:'auto';try{localStorage.setItem('nda_visual_quality',preference);}catch(e){}}
 function apply(renderer,light){const p=current();if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,p.dpr));renderer.shadowMap.enabled=p.shadow>0;}if(light){light.castShadow=p.shadow>0;const size=p.shadow||512;if(light.shadow.mapSize.x!==size){light.shadow.map?.dispose();light.shadow.map=null;light.shadow.mapSize.set(size,size);}}}
 return{get preference(){return preference;},current,select,apply};
})();
const NDAHouseArt=(()=>{
 const pilot=new Set(['capilla','zaguan','patio','corredor']);
 const P={stone:0xbca480,stoneLight:0xd5c3a4,stoneShade:0x927d62,wine:0x6b2030,wood:0x66412b,woodLight:0x8e603a,woodDark:0x412a20,bone:0xe4d4b7,teal:0x315c5b,terra:0xa15c3a,green:0x3f5941,gold:0xba8d49,water:0x274c58};
 function ownsPoint(f,x,z){const r=roomAt(f,x,z);return f===0&&r>=0&&pilot.has(ROOMS[f][r].id);}
 function replacesTile(f,t,x,z){if(f!==0)return false;const id=ROOMS[f][roomAt(f,x,z)]?.id;return(t===T.TABLE&&['capilla','zaguan'].includes(id))||(t===T.ALTAR&&id==='capilla')||(t===T.WATER&&id==='patio');}
 class Batch{
  constructor(name){this.name=name;this.p=[];this.n=[];this.c=[];}
  add(input,color,x=0,y=0,z=0,rx=0,ry=0,rz=0){const g=input.index?input.toNonIndexed():input.clone(),matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1));g.applyMatrix4(matrix);if(!g.attributes.normal)g.computeVertexNormals();
   const p=g.attributes.position,n=g.attributes.normal,c=new THREE.Color(color);for(let i=0;i<p.count;i++){this.p.push(p.getX(i),p.getY(i),p.getZ(i));this.n.push(n.getX(i),n.getY(i),n.getZ(i));const tone=n.getY(i)>.5?1.035:n.getY(i)<-.5?.86:1;this.c.push(c.r*tone,c.g*tone,c.b*tone);}g.dispose();input.dispose();
  }
  finish(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeBoundingBox();g.computeBoundingSphere();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,metalness:0}));m.name=this.name;m.castShadow=m.receiveShadow=true;m.userData.NDAHouseArt=true;m.userData.triangles=this.p.length/9;return m;}
 }
 function box(b,x,y,z,w,h,d,c,ry=0){b.add(new THREE.BoxGeometry(w,h,d),c,x,y,z,0,ry);}
 function profile(b,x,z,rows,c,n=8){const raw=loftGeo(rows,n,{capB:true,capT:true,a0:0}),g=NDACharacterMeshQC.repair(raw);raw.dispose();b.add(g,c,x,0,z);}
 function poly(b,points,depth,color,x=0,y=0,z=0,ry=0,holes=[]){const s=new THREE.Shape();s.moveTo(...points[0]);for(const p of points.slice(1))s.lineTo(...p);s.closePath();for(const pts of holes){const h=new THREE.Path();h.moveTo(...pts[0]);for(const p of pts.slice(1))h.lineTo(...p);h.closePath();s.holes.push(h);}b.add(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:1,steps:1}),color,x,y,z,0,ry);}
 function floor(b,r,c1,c2,tile){const[x0,z0,x1,z1]=r;for(let z=z0;z<z1+1-.01;z+=tile)for(let x=x0;x<x1+1-.01;x+=tile){const w=Math.min(tile,x1+1-x),d=Math.min(tile,z1+1-z),index=Math.round((x-x0)/tile)+Math.round((z-z0)/tile);b.add(new THREE.PlaneGeometry(w-.014,d-.014),index%2?c1:c2,x+w/2,.029,z+d/2,-Math.PI/2);}
  const w=x1-x0+1,d=z1-z0+1,cx=(x0+x1+1)/2,cz=(z0+z1+1)/2;
  for(const sd of[-1,1]){box(b,cx,.035,cz+sd*(d/2-.16),w,.012,.12,P.wine);box(b,cx+sd*(w/2-.16),.035,cz,.12,.012,d,P.wine);}
 }
 function arch(b,x,z,span,spring,apex,ry=0,depth=.16){const r=span/2,R=r+.18,outline=[];
  for(let i=0;i<=6;i++){const a=Math.PI-i*Math.PI/6;outline.push([Math.cos(a)*R,spring+Math.sin(a)*(apex-spring+.16)]);}
  for(let i=6;i>=0;i--){const a=Math.PI-i*Math.PI/6;outline.push([Math.cos(a)*r,spring+Math.sin(a)*(apex-spring)]);}
  poly(b,outline,depth,P.stoneLight,x,0,z-depth/2,ry);
  for(const sd of[-1,1]){const px=Math.cos(ry)*sd*(r+.09),pz=-Math.sin(ry)*sd*(r+.09);box(b,x+px,spring/2,z+pz,.18,spring,.20,P.stone,ry);box(b,x+px,.13,z+pz,.28,.26,.26,P.stoneShade,ry);}
 }
 function plant(b,x,z,scale=1){profile(b,x,z,[[0,.12*scale,.12*scale],[.05*scale,.14*scale,.14*scale],[.30*scale,.18*scale,.18*scale],[.35*scale,.185*scale,.185*scale]],P.terra);profile(b,x,z,[[.29*scale,.187*scale,.187*scale],[.33*scale,.187*scale,.187*scale]],P.bone);
  for(let j=0;j<7;j++){const a=j*Math.PI*2/7,lean=j%2?.28:.52,c=j%2?P.green:0x627857,pts=[[-.035*scale,0],[.02*scale,.23*scale],[0,.48*scale],[-.065*scale,.22*scale]];const shape=new THREE.Shape();shape.moveTo(...pts[0]);pts.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();b.add(new THREE.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:false,curveSegments:1}),c,x,.32*scale,z,lean,a,0);}
 }
 function table(b,x,z,w,d,chapel=false){box(b,x,.74,z,w-.04,.08,d-.04,P.woodLight);box(b,x,.665,z,w-.09,.07,d-.09,P.wood);
  for(const sx of[-1,1])for(const sz of[-1,1]){const xx=x+sx*(w/2-.16),zz=z+sz*(d/2-.15);box(b,xx,.34,zz,.12,.68,.12,P.woodDark);box(b,xx,.12,zz,.18,.12,.18,P.wood);}
  box(b,x,.24,z,w-.28,.07,.08,P.woodDark);if(chapel){box(b,x,.788,z,w-.24,.012,d-.34,P.wine);for(const sd of[-1,1])box(b,x+sd*(w/2-.22),.796,z,.035,.008,d-.38,P.gold);}
 }
 function frame(b,x,y,z,w,h,ry=0){box(b,x,y,z,w+.12,h+.12,.065,P.woodDark,ry);const offset=new THREE.Vector3(0,0,.04).applyAxisAngle(new THREE.Vector3(0,1,0),ry);box(b,x+offset.x,y,z+offset.z,w,h,.018,P.gold,ry);const o2=new THREE.Vector3(0,0,.055).applyAxisAngle(new THREE.Vector3(0,1,0),ry);box(b,x+o2.x,y,z+o2.z,w-.09,h-.09,.014,P.bone,ry);const o3=new THREE.Vector3(0,0,.069).applyAxisAngle(new THREE.Vector3(0,1,0),ry);poly(b,[[-w*.22,-h*.28],[w*.22,-h*.28],[w*.14,h*.03],[0,h*.22],[-w*.14,h*.03]],.006,P.wine,x+o3.x,y,z+o3.z,ry);}
 function fountain(b){const x=30,z=20,outer=[[-2.9,-1.5],[-2.5,-1.9],[2.5,-1.9],[2.9,-1.5],[2.9,1.5],[2.5,1.9],[-2.5,1.9],[-2.9,1.5]],inner=outer.map(([a,c])=>[a*.90,c*.86]);
  // Horizontal hollow coping and water inside the exact existing blocked water footprint.
  const s=new THREE.Shape();s.moveTo(...outer[0]);outer.slice(1).forEach(p=>s.lineTo(...p));s.closePath();const hole=new THREE.Path();hole.moveTo(...inner[0]);inner.slice(1).forEach(p=>hole.lineTo(...p));hole.closePath();s.holes.push(hole);
  b.add(new THREE.ExtrudeGeometry(s,{depth:.40,bevelEnabled:false,curveSegments:1}),P.stone,x,.05,z,-Math.PI/2);b.add(new THREE.ShapeGeometry(new THREE.Shape(inner.map(p=>new THREE.Vector2(...p)))),P.water,x,.29,z,-Math.PI/2);
  profile(b,x,z,[[.18,.46,.46],[.36,.42,.42],[.39,.30,.30],[1.02,.17,.17],[1.15,.31,.31]],P.stoneShade);
  profile(b,x,z,[[1.05,.29,.29],[1.21,.81,.81],[1.30,.84,.84],[1.34,.68,.68]],P.stoneLight);
  profile(b,x,z,[[1.33,.14,.14],[1.74,.12,.12],[1.78,.23,.23],[1.88,.48,.48],[1.95,.50,.50]],P.stone);
  b.add(new THREE.CircleGeometry(.43,8),P.water,x,1.953,z,-Math.PI/2);profile(b,x,z,[[1.96,.07,.07],[2.15,.065,.065],[2.23,.015,.015]],P.water,6);
 }
 function build({floors,world,candles=[]}){
  const batches=new Map(),get=id=>{if(!batches.has(id))batches.set(id,new Batch('arte_piloto_'+id));return batches.get(id);},detail=NDAVisualQuality.current().detail;
  for(const id of pilot){const r=ROOMS[0][RID[0][id]].r;if(id!=='corredor')floor(get(id),r,id==='patio'?0x837b6d:id==='capilla'?0x8d7771:0xa28a6b,id==='patio'?0x716c61:id==='capilla'?0x826d69:0x957d61,id==='patio'?1.2:.8);}
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){
   if(tileAt(0,x,z)===T.WALL)for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const ri=roomAt(0,x+dx,z+dz),id=ROOMS[0][ri]?.id;if(!pilot.has(id)||!walkableT(tileAt(0,x+dx,z+dz)))continue;const b=get(id),xx=x+.5+dx*.515,zz=z+.5+dz*.515;box(b,xx,.25,zz,dx?.045:1,.50,dz?.045:1,P.stoneShade);box(b,xx,.52,zz,dx?.065:1,.065,dz?.065:1,P.stoneLight);box(b,xx,3.41,zz,dx?.075:1,.12,dz?.075:1,P.stone);}
   if(tileAt(0,x,z)===T.PILLAR&&ownsPoint(0,x,z)){const b=get('corredor');box(b,x+.5,.14,z+.5,.83,.28,.83,P.stoneShade);box(b,x+.5,.31,z+.5,.73,.08,.73,P.stoneLight);box(b,x+.5,3.35,z+.5,.80,.18,.80,P.stone);box(b,x+.5,3.51,z+.5,.9,.12,.9,P.stoneLight);}
  }
  for(const d of world.doors){if(d.f!==0)continue;const rooms=d.o==='V'?[roomAt(0,d.x-.9,d.y),roomAt(0,d.x+.9,d.y)]:[roomAt(0,d.x,d.y-.9),roomAt(0,d.x,d.y+.9)];if(!rooms.some(i=>pilot.has(ROOMS[0][i]?.id)))continue;const b=get('corredor');for(const sd of[-1,1]){const off=d.o==='V'?[sd*.57,0]:[0,sd*.57];arch(b,d.x+off[0],d.y+off[1],1.93,1.99,2.29,d.o==='V'?Math.PI/2:0,.12);}}
  const pillars=[];for(let z=9;z<31;z++)for(let x=14;x<46;x++)if(tileAt(0,x,z)===T.PILLAR)pillars.push({x:x+.5,z:z+.5});
  for(const p of pillars)for(const dir of[[1,0],[0,1]]){const next=pillars.filter(q=>dir[0]?q.z===p.z&&q.x>p.x:q.x===p.x&&q.z>p.z).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];if(!next)continue;const span=Math.hypot(next.x-p.x,next.z-p.z);if(span>8)continue;arch(get('corredor'),(p.x+next.x)/2,(p.z+next.z)/2,span-.70,2.47,3.36,dir[0]?0:Math.PI/2,.32);}
  for(const[t,x0,z0,x1,z1]of FURN[0]){const id=ROOMS[0][roomAt(0,x0,z0)]?.id;if(t===T.TABLE&&['capilla','zaguan'].includes(id))table(get(id),(x0+x1+1)/2,(z0+z1+1)/2,x1-x0+1,z1-z0+1,id==='capilla');}
  const chapel=get('capilla');box(chapel,7,.44,1.5,3.95,.88,.94,P.woodDark);box(chapel,7,.922,1.5,4,.056,.98,P.bone);box(chapel,7,1.60,.97,4.35,1.28,.12,P.wood);
  for(const sd of[-1,1]){profile(chapel,7+sd*1.98,1.18,[[.93,.16,.16],[1.13,.16,.16],[2.37,.10,.10],[2.49,.18,.18]],P.gold);box(chapel,7+sd*1.04,1.70,1.08,1.40,1.25,.10,P.wine);}
  arch(chapel,7,1.25,1.45,2.02,2.92,0,.14);box(chapel,7,1.93,1.37,.075,.78,.06,P.woodDark);box(chapel,7,2.10,1.37,.45,.075,.075,P.woodDark);
  for(const sd of[-1,1])frame(chapel,7+sd*2.3,2.11,1.16,.43,.58);
  const entry=get('zaguan');for(const sd of[-1,1]){box(entry,23+sd*1.32,1.45,39.0,.18,2.9,.18,P.woodLight);box(entry,23+sd*1.30,.14,39.0,.31,.28,.31,P.stoneLight);}box(entry,23,2.92,39.0,2.94,.18,.18,P.stone);
  frame(entry,20.0,1.83,30.99,.63,.87);frame(entry,26.5,1.83,30.99,.63,.87);
  for(const[x,z]of[[16.2,37.8],[28.4,31.7],[19.0,14.1],[40.6,25.6],[19.1,25.6],[40.5,14.2]]){if(world.doors.some(d=>d.f===0&&Math.hypot(d.x-x,d.y-z)<1.25))continue;plant(get(roomAt(0,x,z)===RID[0].zaguan?'zaguan':'patio'),x,z,.9);}
  fountain(get('patio'));
  if(detail){for(const b of[chapel,entry]){const x=b===chapel?4.25:16.30,z=b===chapel?4.5:37.45;box(b,x,.797,z,.30,.034,.22,P.teal,.15);box(b,x+.4,.80,z+.07,.16,.04,.23,P.wine,-.2);profile(b,x+.75,z,[[.78,.07,.07],[.90,.085,.085],[.92,.075,.075]],P.terra,6);}
   for(let i=0;i<7;i++){const x=5.5+i*.5;profile(chapel,x,1.42,[[.95,.07,.07],[1.03,.12,.12],[1.1,.045,.045]],P.terra,6);for(let j=0;j<4;j++)profile(chapel,x+Math.cos(j*Math.PI/2)*.045,1.42+Math.sin(j*Math.PI/2)*.045,[[1.08,.035,.035],[1.15,.064,.064],[1.21,.018,.018]],j%2?0xcb8a35:0xd69a44,5);}
  }
  for(const c of candles){if(c.f!==0)continue;const id=ROOMS[0][c.r]?.id,g=c.flame.parent;if(id==='capilla')g.position.set(4.5,.78,4.5);else if(id==='zaguan')g.position.set(18.55,.78,37.25);else if(id==='patio'||id==='corredor')g.visible=false;}
  const meshes=[];for(const[id,b]of batches){if(!b.p.length)continue;const m=b.finish();m.userData.zone=id;floors[0].add(m);meshes.push(m);}return{zones:[...pilot],meshes,triangles:meshes.reduce((n,m)=>n+m.userData.triangles,0),quality:NDAVisualQuality.preference};
 }
 return{build,ownsPoint,replacesTile};
})();
