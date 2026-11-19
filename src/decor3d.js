// Reusable component factories. Shared by the game and the visual editor.
const NDADecorArt=globalThis.NDADecorArt=(()=>{
 const P={wood:0x66412b,reed:0xad895b,light:0xd6b981,clay:0xa15c3a,teal:0x315c5b,bone:0xe4d4b7,wine:0x6b2030,dark:0x302c31,gold:0xba8d49};
 const material=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,metalness:0});
 function create(asset){const p=[],c=[];
  function add(geo,color,x=0,y=0,z=0,rx=0,ry=0,rz=0){const g=geo.index?geo.toNonIndexed():geo;g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1)));const col=new THREE.Color(color);p.push(...g.attributes.position.array);for(let k=0;k<g.attributes.position.count;k++)c.push(col.r,col.g,col.b);g.dispose();if(g!==geo)geo.dispose();}
  const box=(x,y,z,w,h,d,col,rz=0)=>add(new THREE.BoxGeometry(w,h,d),col,x,y,z,0,0,rz),cy=(x,y,z,rt,rb,h,col,n=8)=>add(new THREE.CylinderGeometry(rt,rb,h,n),col,x,y,z);
  const basket=()=>{cy(0,.13,0,.23,.17,.26,P.reed);cy(0,.265,0,.235,.235,.025,P.wood);cy(0,.282,0,.205,.205,.014,P.dark);for(let y=.05;y<.25;y+=.065)cy(0,y,0,.18+y*.19,.18+y*.19,.012,P.light);};
  switch(asset){
   case 'basket':basket();break;
   case 'sack':cy(0,.20,0,.23,.20,.4,P.bone,6);cy(0,.43,0,.08,.20,.10,P.reed,6);box(0,.41,0,.17,.025,.17,P.wood);break;
   case 'jar':cy(0,.10,0,.085,.085,.20,P.teal,6);cy(0,.215,0,.09,.09,.03,P.wood,6);box(0,.10,.075,.08,.08,.025,P.bone);break;
   case 'molinillo':cy(0,.16,0,.018,.018,.32,P.wood,6);for(const y of[.045,.085,.125])cy(0,y,0,.065,.065,.02,P.light,8);break;
   case 'cup':cy(0,.06,0,.07,.055,.12,P.clay,8);cy(0,.124,0,.055,.055,.009,P.dark,8);box(.085,.075,0,.04,.07,.035,P.clay);break;
   case 'plate':cy(0,.02,0,.16,.12,.04,P.bone);cy(0,.043,0,.115,.115,.008,P.teal);break;
   case 'pot':cy(0,.13,0,.21,.14,.26,P.clay);cy(0,.285,0,.14,.20,.05,P.clay);cy(0,.313,0,.12,.12,.01,P.dark);for(const x of[-.23,.23])box(x,.21,0,.08,.055,.07,P.wood);break;
   case 'comal':cy(0,.025,0,.29,.29,.05,P.dark);for(const x of[-.30,.30])box(x,.025,0,.08,.035,.07,P.dark);break;
   case 'bread':box(0,.015,0,.5,.03,.32,P.wood);for(const x of[-.12,.12]){cy(x,.08,0,.105,.10,.10,P.gold,6);box(x,.136,0,.025,.008,.12,P.bone);}break;
   case 'maize':basket();for(const x of[-.09,.09])add(new THREE.CylinderGeometry(.055,.045,.25,6),P.gold,x,.29,0,0,0,.45);break;
   case 'runner':box(0,.005,0,1.3,.01,.28,P.wine);for(const x of[-.5,-.25,0,.25,.5])box(x,.012,0,.10,.004,.16,P.gold);break;
   case 'tinaja':cy(0,.27,0,.24,.18,.54,P.clay);cy(0,.60,0,.12,.24,.12,P.clay);cy(0,.67,0,.14,.12,.04,P.wood);break;
   default:throw Error('Unknown decoration asset '+asset);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);mesh.name='asset_'+asset;mesh.castShadow=mesh.receiveShadow=true;return mesh;
 }
 function build(floors){const rooms=new Map();for(const i of NDALayout.decorInstances||[]){if(NDALayout.decorAssets[i.asset].throwable)continue;const p=decorPosition(i),m=create(i.asset);m.position.set(p.x,p.h,p.y);m.rotation.y=i.rotation||0;m.userData.instanceId=i.id;const key=i.room;if(!rooms.has(key)){const g=new THREE.Group();g.name='decor_room_'+key;g.userData.componentIds=[];rooms.set(key,g);floors[p.f].add(g);}rooms.get(key).add(m);rooms.get(key).userData.componentIds.push(i.id);}for(const g of rooms.values())NDAHouseArt.mergeProp(g);}
 return{create,build};
})();
