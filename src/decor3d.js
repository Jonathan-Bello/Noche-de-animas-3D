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
   case 'medicine_bottle':cy(0,.09,0,.065,.065,.18,P.wine,6);cy(0,.205,0,.025,.065,.05,P.wine,6);cy(0,.247,0,.026,.026,.035,P.wood,6);box(0,.095,.063,.075,.075,.009,P.bone);break;
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
   case 'laundry_basket':basket();box(0,.295,0,.30,.025,.30,P.bone);box(.04,.321,.02,.22,.026,.22,P.teal);break;
   case 'fabric_rolls':for(const[x,z,col]of[[-.10,-.09,P.teal],[.10,-.07,P.wine],[0,.10,P.bone]]){cy(x,.24,z,.075,.075,.48,col,6);cy(x,.487,z,.03,.03,.015,P.wood,6);}break;
   case 'storage_box':box(0,.14,0,.60,.28,.44,P.wood);box(0,.288,0,.62,.024,.46,P.light);box(0,.15,.226,.25,.10,.012,P.bone);for(const x of[-.20,.20])box(x,.145,0,.025,.29,.448,P.reed);break;
   case 'paint_cans':for(const x of[-.115,.115]){cy(x,.115,0,.105,.105,.23,P.dark,8);cy(x,.235,0,.108,.108,.02,P.wood,8);box(x,.11,.101,.12,.09,.018,x<0?P.teal:P.wine);}break;
   case 'brush_jar':cy(0,.08,0,.09,.085,.16,P.clay,6);for(const x of[-.04,.035]){box(x,.215,0,.012,.16,.012,P.wood,x);box(x,.307,0,.045,.04,.028,P.reed);}break;
   case 'lantern':{box(0,.025,0,.25,.05,.23,P.dark);box(0,.20,0,.16,.26,.14,P.light);for(const x of[-.105,.105])for(const z of[-.09,.09])box(x,.19,z,.025,.28,.025,P.dark);const roof=new THREE.ConeGeometry(.17,.09,4);roof.rotateY(Math.PI/4);add(roof,P.dark,0,.365,0);box(0,.435,0,.08,.04,.025,P.dark);break;}
   case 'mortar':cy(0,.075,0,.17,.12,.15,0x827f74,8);cy(0,.155,0,.13,.13,.01,P.dark,8);add(new THREE.CylinderGeometry(.022,.032,.22,6),0xb9b2a2,.065,.13,0,0,0,-.7);break;
   case 'balance':box(0,.025,0,.46,.05,.24,P.wood);cy(0,.20,0,.018,.025,.35,P.gold,6);box(0,.36,0,.48,.025,.04,P.dark);for(const x of[-.19,.19]){box(x,.25,0,.01,.20,.01,P.gold);cy(x,.145,0,.07,.04,.035,P.gold,8);}break;
   case 'candle_group':box(0,.015,0,.44,.03,.25,P.wood);for(const[x,y]of[[-.13,.17],[0,.23],[.13,.20]]){cy(x,y/2+.03,0,.045,.045,y,P.bone,6);box(x,y+.035,0,.009,.015,.009,P.dark);}break;
   case 'flowers_table':cy(0,.09,0,.08,.065,.18,P.clay,6);for(const x of[-.06,0,.06]){box(x,.28,0,.01,.22,.01,P.reed,x*2);add(new THREE.OctahedronGeometry(.04),P.gold,x,.425,0);}break;
   case 'music_sheet':box(0,.003,0,.30,.006,.24,P.bone);for(let k=0;k<5;k++)box(0,.007,(-2+k)*.028,.25,.002,.003,P.wood);for(const x of[-.07,.02,.095])box(x,.011,x*.3,.014,.006,.016,P.dark);break;
   case 'bath_towel':box(0,.019,0,.18,.038,.52,P.bone);for(const z of[-.18,.18])box(0,.04,z,.17,.006,.025,P.teal);break;
   case 'soap':cy(0,.012,0,.07,.06,.024,P.bone,8);box(0,.04,0,.10,.03,.07,P.teal);break;
   case 'photo_table':{box(0,.13,0,.20,.26,.025,P.wood);box(0,.13,.016,.17,.23,.007,P.bone);add(new THREE.CylinderGeometry(.028,.028,.008,6),P.clay,0,.19,.025,Math.PI/2);box(0,.115,.025,.065,.08,.01,P.wine);box(0,.035,-.035,.025,.07,.10,P.wood);break;}
   case 'ink_set':box(0,.01,0,.20,.02,.18,P.wood);cy(-.04,.047,0,.035,.035,.07,P.teal,6);cy(-.04,.088,0,.036,.036,.013,P.dark,6);box(.055,.065,0,.025,.11,.025,P.wood);box(.055,.135,0,.04,.03,.04,P.gold);break;
   case 'wall_sewing':{box(0,.33,0,.64,.66,.025,P.wood);box(0,.12,.015,.60,.04,.16,P.light);for(const[x,col]of[[-.20,P.wine],[0,P.teal],[.20,P.bone]]){cy(x,.22,.015,.065,.065,.16,col,6);cy(x,.305,.015,.075,.075,.015,P.reed,6);cy(x,.135,.015,.075,.075,.015,P.reed,6);}box(-.12,.49,.028,.025,.22,.025,P.dark,.5);box(-.05,.49,.028,.025,.22,.025,P.dark,-.5);box(.18,.49,.03,.13,.16,.025,P.bone);break;}
   case 'wall_tools':{box(0,.4,0,.70,.8,.03,P.wood);box(-.20,.42,.035,.035,.45,.03,P.reed);box(-.20,.64,.04,.21,.065,.075,P.dark);box(.06,.36,.035,.03,.42,.03,P.wood);box(.06,.59,.045,.10,.15,.035,P.dark);box(.24,.25,.045,.035,.26,.035,P.reed);box(.24,.41,.045,.085,.08,.04,P.light);break;}
   case 'rope_coil':{const outer=[],inner=[];for(let k=0;k<8;k++){const a=k*Math.PI/4;outer.push(new THREE.Vector2(Math.cos(a)*.17,.22+Math.sin(a)*.17));inner.unshift(new THREE.Vector2(Math.cos(a)*.12,.22+Math.sin(a)*.12));}const shape=new THREE.Shape(outer);shape.holes.push(new THREE.Path(inner));add(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:1,steps:1}),P.reed);box(0,.44,0,.055,.12,.075,P.dark);break;}
   case 'herb_bundle':{box(0,.52,0,.42,.06,.035,P.wood);for(const x of[-.13,0,.13]){box(x,.31,.015,.012,.39,.012,P.reed);for(const y of[.12,.24,.36]){const leaf=new THREE.ConeGeometry(.05,.13,4);add(leaf,0x526d49,x+.03,y,.02,0,0,-.6);const leaf2=new THREE.ConeGeometry(.05,.13,4);add(leaf2,0x526d49,x-.03,y+.025,.02,0,0,.6);}}break;}
   case 'wall_bathrack':box(0,.49,0,.52,.06,.05,P.wood);box(0,.27,.025,.34,.43,.045,P.bone);box(0,.09,.052,.32,.025,.015,P.teal);box(.19,.14,.015,.12,.035,.15,P.wood);box(.19,.18,.035,.08,.04,.06,P.teal);break;
   case 'wall_keyrack':box(0,.32,0,.48,.36,.03,P.wood);for(const x of[-.15,0,.15]){box(x,.35,.03,.022,.08,.055,P.dark);box(x,.23,.045,.014,.15,.012,P.gold);box(x,.15,.045,.07,.018,.014,P.gold);}break;
   case 'wall_certificate':case 'wall_pattern':case 'music_score':case 'wall_map':case 'wall_devotion':{
    const W=asset==='wall_map'?.62:asset==='music_score'?.48:asset==='wall_devotion'?.44:.50,H=asset==='wall_pattern'?.60:asset==='music_score'?.56:asset==='wall_map'?.58:asset==='wall_devotion'?.54:.52;
    box(0,H/2,0,W,H,.025,P.wood);box(0,H/2,.017,W-.06,H-.06,.008,P.bone);
    if(asset==='wall_pattern'){const shape=new THREE.Shape([[-.12,.12],[.12,.12],[.08,.30],[.16,.32],[.13,.41],[.055,.46],[-.055,.46],[-.13,.41],[-.16,.32],[-.08,.30]].map(p=>new THREE.Vector2(...p)));add(new THREE.ExtrudeGeometry(shape,{depth:.006,bevelEnabled:false,curveSegments:1,steps:1}),P.teal,0,0,.024);}
    else if(asset==='music_score'){for(let k=0;k<5;k++)box(0,.20+k*.035,.026,.36,.004,.005,P.wood);for(const[x,y]of[[-.12,.235],[-.02,.27],[.10,.305]]){box(x,y,.032,.025,.018,.008,P.dark);box(x+.01,y+.05,.031,.006,.10,.008,P.dark);}}
    else if(asset==='wall_map'){for(const[x,y,rz]of[[-.13,.30,.7],[.06,.25,-.4],[.11,.40,.2]])box(x,y,.027,.09,.22,.008,P.teal,rz);for(let k=0;k<3;k++)box(0,.12+k*.14,.033,W-.12,.005,.006,P.reed);}
    else if(asset==='wall_devotion'){(()=>{const flame=new THREE.ConeGeometry(.06,.13,4);flame.scale(1,1,.3);add(flame,P.gold,0,.36,.028);})();box(0,.20,.027,.075,.16,.009,P.wine);box(0,.10,.027,.20,.02,.009,P.teal);}
    else{for(let k=0;k<4;k++)box(0,.20+k*.055,.026,W-.16,.008,.006,P.wood);add(new THREE.CylinderGeometry(.035,.035,.008,6),P.wine,.13,.11,.027,Math.PI/2);}break;}
   default:throw Error('Unknown decoration asset '+asset);
  }
  const mount={wall_sewing:[.20,.33],wall_pattern:[.12,.30],wall_tools:[.20,.40],rope_coil:[.14,.44],herb_bundle:[.18,.52],wall_certificate:[.12,.26],music_score:[.12,.28],wall_bathrack:[.20,.49],wall_keyrack:[.16,.32],wall_map:[.12,.29],wall_devotion:[.12,.27],family_frame:[.12,.23],drawing:[.12,.19],wall_mirror:[.12,.32],wall_hooks:[.16,.64],wall_flowers:[.18,.15],wall_lamp:[.18,.12]}[asset];if(mount)box(0,mount[1],-mount[0]/4-.005,.05,.06,mount[0]/2-.01,P.wood);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.computeVertexNormals();geo.computeBoundingBox();const mesh=new THREE.Mesh(geo,material);mesh.name='asset_'+asset;mesh.castShadow=mesh.receiveShadow=true;return mesh;
 }
 function build(floors){const rooms=new Map();for(const i of NDALayout.decorInstances||[]){if(NDALayout.decorAssets[i.asset].throwable)continue;const p=decorPosition(i),m=create(i.asset);m.position.set(p.x,p.h,p.y);m.rotation.y=i.rotation||0;m.userData.instanceId=i.id;const key=i.room;if(!rooms.has(key)){const g=new THREE.Group();g.name='decor_room_'+key;g.userData.componentIds=[];rooms.set(key,g);floors[p.f].add(g);}rooms.get(key).add(m);rooms.get(key).userData.componentIds.push(i.id);}for(const g of rooms.values())NDAHouseArt.mergeProp(g);}
 return{create,build};
})();
