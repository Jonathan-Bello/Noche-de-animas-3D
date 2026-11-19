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
   case 'linen':for(let k=0;k<3;k++){box(0,.022+k*.043,0,.43-k*.02,.04,.32,[P.bone,P.teal,P.light][k]);box(.14,.043+k*.043,0,.025,.004,.31,P.wine);}break;
   case 'cushion':box(0,.04,0,.43,.08,.40,P.teal);for(const x of[-.12,0,.12])box(x,.082,0,.045,.004,.38,P.light);break;
   case 'suitcase':box(0,.08,0,.54,.16,.38,P.wood);for(const x of[-.16,.16])box(x,.0835,0,.025,.167,.384,P.light);box(0,.187,0,.15,.025,.045,P.dark);box(0,.11,.195,.06,.04,.015,P.gold);break;
   case 'family_frame':{
    box(0,.23,0,.42,.46,.024,P.wood);box(0,.23,.016,.36,.40,.008,P.bone);
    for(const x of[-.195,.195])box(x,.23,.024,.03,.46,.024,P.gold);for(const y of[.015,.445])box(0,y,.024,.36,.03,.024,P.gold);
    for(const [x,y,col]of[[-.095,.31,P.wine],[.095,.31,P.teal],[0,.25,P.clay]]){add(new THREE.CylinderGeometry(.04,.04,.012,6),P.wood,x,y,.027,Math.PI/2);box(x,y-.10,.027,.075,.12,.012,col);}break;}
   case 'drawing':{box(0,.19,0,.40,.38,.024,P.teal);box(0,.19,.017,.35,.33,.01,P.bone);const shape=new THREE.Shape([new THREE.Vector2(0,.12),new THREE.Vector2(.09,.20),new THREE.Vector2(0,.29),new THREE.Vector2(-.09,.20)]);add(new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:false,curveSegments:1,steps:1}),P.wine,0,0,.024);box(-.025,.09,.027,.01,.07,.008,P.wood,-.4);box(.11,.09,.027,.07,.025,.008,P.gold);break;}
   case 'wall_mirror':{add(new THREE.CylinderGeometry(.39,.39,.03,8),P.gold,0,.49,0,Math.PI/2);add(new THREE.CylinderGeometry(.35,.35,.035,8),0x78939b,0,.49,.009,Math.PI/2);box(0,.055,0,.64,.035,.10,P.wood);box(0,.12,0,.1,.12,.04,P.wood);break;}
   case 'wall_hooks':{box(0,.64,0,.42,.06,.035,P.wood);for(const x of[-.14,.14])box(x,.60,.025,.035,.065,.05,P.dark);const shape=new THREE.Shape([[-.10,.10],[.10,.10],[.11,.40],[.19,.39],[.16,.52],[.08,.58],[-.08,.58],[-.16,.52],[-.19,.39],[-.11,.40]].map(p=>new THREE.Vector2(...p)));add(new THREE.ExtrudeGeometry(shape,{depth:.04,bevelEnabled:false,curveSegments:1,steps:1}),P.teal,0,0,-.01);box(0,.56,.035,.10,.025,.012,P.bone);break;}
   case 'comb':box(0,.0125,0,.17,.025,.035,P.light);for(let x=-.07;x<=.071;x+=.02)box(x,.03,0,.009,.02,.055,P.wood);break;
   case 'jewelbox':box(0,.045,0,.25,.09,.19,P.wood);box(0,.105,0,.26,.035,.20,P.wine);box(0,.066,.101,.035,.04,.012,P.gold);break;
   case 'perfume':cy(0,.055,0,.045,.045,.11,P.teal,6);cy(0,.132,0,.018,.025,.044,P.gold,6);box(0,.167,0,.05,.025,.05,P.dark);break;
   case 'booties':for(const x of[-.075,.075]){box(x,.035,.01,.11,.07,.16,P.bone);box(x,.085,-.035,.09,.04,.065,P.light);}break;
   case 'care_basket':basket();box(0,.295,0,.30,.025,.30,P.bone);box(.04,.321,.02,.22,.026,.22,P.teal);break;
   case 'wash_set':cy(-.13,.10,0,.065,.08,.20,P.bone);cy(-.13,.215,0,.055,.065,.03,P.bone);box(-.215,.13,0,.03,.06,.035,P.wood);cy(.105,.035,0,.11,.08,.07,P.teal);cy(.105,.072,0,.085,.085,.008,P.dark);break;
   case 'wall_flowers':box(0,.15,-.04,.07,.30,.035,P.wood);box(0,.10,.015,.32,.04,.14,P.wood);cy(0,.20,.01,.07,.055,.16,P.clay,6);for(const x of[-.075,0,.075]){box(x,.35,.01,.012,.15,.012,P.reed,x*3);add(new THREE.OctahedronGeometry(.045),P.gold,x,.46,.01);}break;
   case 'open_book':box(0,.008,0,.35,.016,.25,P.wine);for(const x of[-.09,.09])box(x,.028,0,.16,.025,.23,P.bone,x<0?-.06:.06);box(0,.034,0,.008,.012,.23,P.gold);break;
   case 'blocks':for(const[x,y,col]of[[-.10,.045,P.wine],[.01,.045,P.teal],[.10,.045,P.gold],[0,.123,P.light]])box(x,y,0,.085,.085,.085,col);break;
   case 'top':cy(0,.06,0,.06,.01,.09,P.clay,6);cy(0,.12,0,.012,.012,.04,P.wood,6);break;
   case 'wall_lamp':{box(0,.12,-.035,.06,.12,.035,P.wood);box(0,.23,0,.06,.04,.11,P.dark);const shade=new THREE.ConeGeometry(.145,.16,6);shade.scale(1,1,.45);add(shade,P.bone,0,.28,0);add(new THREE.OctahedronGeometry(.035),P.light,0,.20,0);break;}
   case 'paper_letters':box(0,.003,0,.28,.006,.21,P.bone);box(.015,.009,.012,.24,.006,.18,P.light);box(0,.013,0,.065,.002,.04,P.wine);break;
   default:throw Error('Unknown decoration asset '+asset);
  }
  const mount={family_frame:[.12,.23],drawing:[.12,.19],wall_mirror:[.12,.32],wall_hooks:[.16,.64],wall_flowers:[.18,.15],wall_lamp:[.18,.12]}[asset];if(mount)box(0,mount[1],-mount[0]/4-.005,.05,.06,mount[0]/2-.01,P.wood);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.computeVertexNormals();geo.computeBoundingBox();const mesh=new THREE.Mesh(geo,material);mesh.name='asset_'+asset;mesh.castShadow=mesh.receiveShadow=true;return mesh;
 }
 function build(floors){const rooms=new Map();for(const i of NDALayout.decorInstances||[]){if(NDALayout.decorAssets[i.asset].throwable)continue;const p=decorPosition(i),m=create(i.asset);m.position.set(p.x,p.h,p.y);m.rotation.y=i.rotation||0;m.userData.instanceId=i.id;const key=i.room;if(!rooms.has(key)){const g=new THREE.Group();g.name='decor_room_'+key;g.userData.componentIds=[];rooms.set(key,g);floors[p.f].add(g);}rooms.get(key).add(m);rooms.get(key).userData.componentIds.push(i.id);}for(const g of rooms.values())NDAHouseArt.mergeProp(g);}
 return{create,build};
})();
