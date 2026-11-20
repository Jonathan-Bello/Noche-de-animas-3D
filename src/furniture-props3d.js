// Readable object silhouettes, rigid facets and matte colours; no change to event ownership.
const NDAFurnitureProps=(()=>{
 const C={wood:0x66412b,dark:0x412a20,light:0x8e603a,bone:0xe4d4b7,gold:0xba8d49,iron:0x302c31,teal:0x315c5b,terra:0xa15c3a,wine:0x6b2030};
 function build(part,p){
  const add=(geo,color,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,flatShading:true,roughness:1,metalness:0}));m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;part.add(m);return m;};
  const box=(w,h,d,x,y,z,c=C.wood,ry=0)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,0,ry);
  const cyl=(rt,rb,h,x,y,z,c=C.wood,rx=0,rz=0)=>add(new THREE.CylinderGeometry(rt,rb,h,8),c,x,y,z,rx,0,rz);
  const poly=(pts,depth,x,y,z,c=C.wood,ry=0)=>add(new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(v=>new THREE.Vector2(...v))),{depth,bevelEnabled:false,curveSegments:1}),c,x,y,z,0,ry);
  const rockers=()=>{for(const xx of[-.26,.26])poly([[-.44,.13],[-.26,.04],[.26,.04],[.44,.13],[.44,.19],[.25,.10],[-.25,.10],[-.44,.19]],.065,xx-.032,0,0,C.dark,Math.PI/2);};
  if(p.kind==='cuna'){const model=NDAFurnitureArt.create('prop_cuna');for(const child of model.children.slice())part.add(child);return true;}
  switch(p.kind){
   case 'mecedora':
    rockers();box(.58,.07,.58,0,.47,0,C.light);for(const xx of[-.23,.23])for(const zz of[-.22,.22])box(.055,.37,.055,xx,.28,zz,C.dark);
    for(const xx of[-.23,0,.23])box(.045,.66,.045,xx,.82,-.26,C.wood);box(.60,.08,.07,0,1.12,-.26,C.light);
    for(const xx of[-.32,.32]){box(.06,.06,.60,xx,.72,0,C.light);box(.045,.22,.045,xx,.59,.20,C.dark);}return true;
   case 'caballito':
    rockers();cyl(.17,.17,.48,0,.55,0,C.terra,0,Math.PI/2);for(const xx of[-.16,.16])for(const zz of[-.12,.12])box(.055,.30,.055,xx,.33,zz,C.dark);
    poly([[-.15,0],[.03,.44],[.20,.50],[.30,.38],[.28,.28],[.14,.26],[.06,0]],.18,.08,.55,-.09,C.light);
    poly([[0,0],[.06,.17],[.10,.02]],.04,.18,1.03,-.02,C.dark);box(.24,.06,.36,-.03,.75,0,C.wine);box(.045,.25,.045,-.29,.63,0,C.dark);return true;
   case 'maquina':
    box(.62,.045,.36,0,.023,0,C.wood);poly([[-.24,0],[.25,0],[.25,.08],[.17,.09],[.17,.31],[-.17,.31],[-.23,.24],[-.23,.16],[-.13,.16],[-.13,.23],[.06,.23],[.06,.07],[-.24,.07]],.14,0,.045,-.07,C.iron);
    cyl(.115,.115,.04,.23,.26,0,C.dark,0,Math.PI/2);box(.012,.15,.012,-.18,.13,.10,C.gold);return true;
   case 'grifo':
    box(.20,.62,.22,0,.31,0,C.bone);for(const[x,z,w,d]of[[0,-.18,.54,.10],[0,.18,.54,.10],[-.22,0,.10,.26],[.22,0,.10,.26]])box(w,.22,d,x,.73,z,C.bone);box(.36,.035,.26,0,.64,0,C.teal);
    box(.04,.27,.04,0,.97,-.13,C.iron);box(.04,.04,.18,0,1.09,-.06,C.iron);for(const xx of[-.15,.15])box(.10,.035,.055,xx,.89,-.13,C.gold);return true;
   case 'reloj':
    box(.4,1.83,.30,0,.915,0,C.dark);box(.46,.08,.35,0,.07,0,C.light);poly([[-.24,0],[.24,0],[.18,.15],[0,.23],[-.18,.15]],.32,0,1.80,-.16,C.wood);
    box(.25,.68,.025,0,.75,.16,C.iron);box(.018,.44,.025,0,.82,.18,C.gold);cyl(.075,.075,.018,0,.58,.19,C.gold,Math.PI/2);
    cyl(.145,.145,.025,0,1.55,.17,C.bone,Math.PI/2);box(.014,.12,.02,0,1.60,.195,C.iron);box(.10,.014,.02,.04,1.55,.196,C.iron);return true;
   case 'radio':
    box(.5,.30,.25,0,.15,0,C.wood);cyl(.09,.09,.018,-.12,.15,.134,C.iron,Math.PI/2);box(.16,.045,.02,.12,.23,.137,C.gold);for(const xx of[.07,.17])cyl(.023,.023,.026,xx,.09,.14,C.dark,Math.PI/2);box(.012,.34,.012,.20,.43,-.07,C.iron);return true;
   case 'muneca':
    cyl(.06,.13,.24,0,.60,0,C.wine);cyl(.067,.054,.12,0,.81,0,C.bone);cyl(.072,.06,.045,0,.88,0,C.dark);
    for(const xx of[-.14,.14])box(.045,.17,.045,xx,.66,0,C.bone);for(const xx of[-.055,.055])box(.04,.17,.045,xx,.40,0,C.bone);box(.38,.40,.36,0,.20,0,C.wood);return true;
   case 'campanita':cyl(.025,.075,.11,0,.065,0,C.gold);box(.025,.08,.025,0,.16,0,C.dark);return true;
   case 'baul':box(.86,.40,.48,0,.20,0,C.wood);poly([[-.43,0],[.43,0],[.35,.14],[-.35,.14]],.48,0,.4,-.24,C.light);for(const xx of[-.27,.27])box(.04,.38,.49,xx,.21,0,C.iron);box(.10,.12,.025,0,.37,.26,C.gold);return true;
   default:return false;
  }
 }
 return{build};
})();
