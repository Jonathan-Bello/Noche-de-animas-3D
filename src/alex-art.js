// Arte aprobado de Alex / El Curandero. Ashen como referencia principal de abstracción.
// Se aplica al rig original; no modifica animateCharacter ni los demás personajes.
const NDAAlexArt = (() => {
// Neo-Retro Vector Sculpture v04. Centimeters are modeled in meters, Y up, +Z front.
const MODEL_HEIGHT=1.70,HEAD_UNIT=MODEL_HEIGHT/6.5;
const palette={
  skin:'#D8A070',hair:'#1A1210',red:'#B32234',wine:'#7A1F2E',teal:'#0E3B44',cream:'#E4C39A',brown:'#594035',boots:'#372C2C',trim:'#B77E49'
};
function createVectorSculptureMaterial(hexColor,options={
}){
  return new THREE.MeshStandardMaterial({
    color:new THREE.Color(hexColor),flatShading:true,roughness:options.roughness??1,metalness:0,side:options.doubleSided?THREE.DoubleSide:THREE.FrontSide,transparent:options.transparent??false,opacity:options.opacity??1,emissive:new THREE.Color(0),emissiveIntensity:0
  });
} const mats=Object.fromEntries(Object.entries(palette).map(([name,c])=>{
  const m=createVectorSculptureMaterial(c);m.name=name;return[name,m];
}));
function finalizeHardEdgedGeometry(g){
  const out=g.index?g.toNonIndexed():g;
  out.computeVertexNormals();
  return out;
} function mesh(parent,name,g,mat){
  const m=new THREE.Mesh(finalizeHardEdgedGeometry(g),typeof mat==='string'?mats[mat]:mat);
  m.name=name;
  m.castShadow=m.receiveShadow=true;
  parent.add(m);
  return m;
} function geo(v,ix){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(v.flat(),3));
  g.setIndex(ix);
  return g;
} function group(parent,name,pivot=[0,0,0]){
  const g=new THREE.Group();
  g.name=name;
  g.position.set(...pivot);
  g.userData.pivot='anatomical_or_garment_anchor';
  parent.add(g);
  return g;
} function ringVertices(rows,angles,inner=0){
  const v=[];
  for(const r of rows)for(const a of angles)v.push([r.x+Math.sin(a)*(r.w-inner),r.y,(r.z||0)+Math.cos(a)*(r.d-inner)]);
  return v;
} function solid(parent,name,rows,mat,n=8){
  const angles=Array.from({
    length:n
  },(_,i)=>i*2*Math.PI/n);
  const v=ringVertices(rows,angles),ix=[];
  for(let k=0;k<rows.length-1;k++)for(let j=0;j<n;j++){
    const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;
    ix.push(a,b,c,b,d,c);
  }for(let j=1;j<n-1;j++){
    ix.push(0,j+1,j);
    const a=(rows.length-1)*n;
    ix.push(a,a+j,a+j+1);
  }return mesh(parent,name,geo(v,ix),mat);
} function shell(parent,name,rows,mat,n=8,t=.02,angles=null,cutArmpits=false){
  angles=angles||Array.from({length:n},(_,i)=>i*2*Math.PI/n);n=angles.length;
  const open=angles[0]!==0,edgeCount=open?n-1:n;
  const outer=ringVertices(rows,angles),inner=ringVertices(rows,angles,t),N=outer.length,v=[...outer,...inner],ix=[],edges=new Map();
  function edge(a,b){const key=Math.min(a,b)+':'+Math.max(a,b);const old=edges.get(key);if(old)old.count++;else edges.set(key,{a,b,count:1});}
  for(let k=0;k<rows.length-1;k++)for(let j=0;j<edgeCount;j++){
    if(cutArmpits&&k>=2&&(j===1||j===5))continue;
    const p=k*n+j,q=k*n+(j+1)%n,r=p+n,s=q+n;
    ix.push(p,q,r,q,s,r,p+N,r+N,q+N,q+N,r+N,s+N);
    edge(p,q);edge(q,s);edge(s,r);edge(r,p);
  }
  // Close every exposed boundary, including the new armholes, with a real thickness rim.
  for(const{a,b,count}of edges.values())if(count===1)ix.push(a,a+N,b,b,a+N,b+N);
  const m=mesh(parent,name,geo(v,ix),mat);m.userData.thicknessMeters=t;m.userData.armholes=cutArmpits;return m;
} function polygon(parent,name,points,t,mat,z=0,holes=[],frontSurface=null){
  const s=new THREE.Shape();
  s.moveTo(...points[0]);
  points.slice(1).forEach(p=>s.lineTo(...p));
  s.closePath();
  for(const hp of holes){
    const h=new THREE.Path();
    h.moveTo(...hp[0]);
    hp.slice(1).forEach(p=>h.lineTo(...p));
    h.closePath();
    s.holes.push(h);
  }const g=new THREE.ExtrudeGeometry(s,{
    depth:t,steps:1,bevelEnabled:false,curveSegments:1
  });
  if(frontSurface){
    const a=g.attributes.position;
    for(let i=0;i<a.count;i++)a.setZ(i,frontSurface(a.getX(i),a.getY(i))-t+a.getZ(i));
  }const m=mesh(parent,name,g,mat);
  m.position.z=z;
  m.userData.thicknessMeters=t;
  return m;
} function wedge(parent,name,corners,mat){
  return mesh(parent,name,geo(corners,[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]),mat);
} function flower(parent,name,x,y,z,r,mat){
  const p=[];
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,rr=i%2?r*.43:r;
    p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);
  }return polygon(parent,name,p,.005,mat,z);
}

function refine(r){
  // Everything is local to the repository's existing torso/head. Joint heights stay untouched.
  const shirtOld=r.torso.children.find(o=>o.isMesh);if(shirtOld)r.torso.remove(shirtOld);
  r.acc.clear();r.hair.clear();
  r.torso.children.filter(o=>o.isMesh&&o.material?.color?.getHex()===0xd8a03a).forEach(o=>r.torso.remove(o));
  const oldFrames=r.head.children.filter(o=>o.isMesh&&o.material?.color?.getHex()===0xf0e2c0);
  oldFrames.forEach(o=>r.head.remove(o));
  const costume=group(r.acc,'alex_ropa_revisada');
  // Replace the original separate shoulder lump and upper sleeve with one continuous garment.
  // Elbow groups, rotations, forearms and hands stay exactly where the existing animation expects.
  for(const arm of[r.armL,r.armR]){
    arm.children.filter(o=>o.isMesh).forEach(o=>arm.remove(o));
    solid(arm,'manga_hombro_continua',[
      {x:0,y:.025,w:.046,d:.046},{x:0,y:-.035,w:.061,d:.060},
      {x:0,y:-.14,w:.052,d:.05},{x:0,y:-.27,w:.044,d:.044}
    ],'wine',6);
  }

  shell(costume,'camisa_ahusada_con_espesor',[
    {x:0,y:-.02,w:.151,d:.104},{x:0,y:.12,w:.139,d:.098},
    {x:0,y:.29,w:.177,d:.117},{x:0,y:.405,w:.192,d:.110},
    {x:0,y:.485,w:.111,d:.082},{x:0,y:.520,w:.061,d:.055}
  ],'wine',8,.020);
  const angles=Array.from({length:8},(_,i)=>Math.PI/8+i*Math.PI/4);
  shell(costume,'chaleco_abierto_ajustado_a_camisa',[
    {x:0,y:.005,w:.177,d:.129},{x:0,y:.14,w:.166,d:.123},
    {x:0,y:.29,w:.203,d:.143},{x:0,y:.40,w:.218,d:.137},
    {x:0,y:.475,w:.138,d:.109}
  ],'teal',8,.020,angles,true);
  // Neck opening ends at the repository's original collar height, immediately below the jaw.
  polygon(costume,'solapa_derecha',[[-.059,.535],[-.004,.499],[-.043,.440],[-.108,.490]],.020,'wine',.070);
  polygon(costume,'solapa_izquierda',[[.004,.499],[.059,.535],[.108,.490],[.043,.440]],.020,'wine',.070);
  flower(costume,'bordado_collar',-.056,.486,.093,.018,'cream');
  for(const y of[.12,.25,.36]){const pts=Array.from({length:6},(_,j)=>[Math.cos(j*Math.PI/3)*.006,y+Math.sin(j*Math.PI/3)*.006]);polygon(costume,'boton_hexagonal',pts,.005,'hair',.119);}
  const shawlMat=createVectorSculptureMaterial('#2E6A64');shawlMat.name='rebozo_verde_repositorio';
  const shawl=group(costume,'rebozo_pieza_continua');
  // Three samples across the ribbon define a broad folded ridge; shell follows torso clearances.
  const path=[[.099,.035,.155],[.107,.25,.151],[.12,.435,.135],[.13,.482,.022],[.12,.435,-.135],[.099,.22,-.15],[.095,.035,-.148]];
  const v=[],ix=[],width=.105,t=.02;
  for(const[x,y,z]of path)for(const[u,d]of[[-.5,0],[0,.010],[.5,0]])v.push([x+width*u,y,z+d]);
  const N=v.length;v.push(...v.map(p=>[p[0],p[1],p[2]-t]));
  for(let k=0;k<path.length-1;k++)for(let j=0;j<2;j++){const a=k*3+j,b=a+1,c=a+3,d=b+3;ix.push(a,b,c,b,d,c,a+N,c+N,b+N,b+N,c+N,d+N);}
  for(let k=0;k<path.length-1;k++)for(const j of[0,2]){const a=k*3+j,b=a+3;ix.push(a,b,a+N,b,b+N,a+N);}
  for(const row of[0,path.length-1])for(let j=0;j<2;j++){const a=row*3+j,b=a+1;ix.push(a,a+N,b,b,a+N,b+N);}
  mesh(shawl,'rebozo_espesor_20mm',geo(v,ix),shawlMat).userData.thicknessMeters=t;
  polygon(shawl,'franja_delantera',[[.047,.07],[.151,.07],[.152,.087],[.048,.087]],.005,'cream',.158);
  polygon(shawl,'franja_posterior',[[.042,.07],[.147,.07],[.148,.087],[.043,.087]],.005,'cream',-.173);
  flower(shawl,'motivo_geometrico_grande',.099,.18,.158,.027,'cream');
  for(let j=0;j<5;j++){const x=.048+j*.021;polygon(shawl,'fleco_'+j,[[x,.035],[x+.012,.035],[x+.01,-.006-(j%2)*.009],[x-.001,-.004]],.008,'cream',.142);}
  // The original skull, nose ridge, ears, neck, head pivot, shoulders and limbs are preserved.
  const hair=r.hair;hair.name='alex_cabello_tres_masas_sin_bolas';
  const hv=[],hi=[];
  for(let row=0;row<4;row++)for(let j=0;j<8;j++){
    const a=j*Math.PI/4,f=Math.max(0,Math.cos(a)),b=Math.max(0,-Math.cos(a));
    const rx=[.102,.126,.111,.051][row],rz=[.098,.122,.111,.055][row];
    const y=[.13+f*.082-b*.048,.209+f*.035-b*.01,.276,.293][row]+(row===2&&j>4?-.006:0);
    hv.push([Math.sin(a)*rx,y,Math.cos(a)*rz-.010]);
  }
  for(let k=0;k<3;k++)for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8,c=a+8,d=b+8;hi.push(a,b,c,b,d,c);}
  for(let j=1;j<7;j++){hi.push(0,j+1,j);hi.push(24,24+j,24+j+1);}
  mesh(hair,'masa_1_envolvente_nuca_sienes',geo(hv,hi),'hair');
  // Broad front locks are sculpted volumes, not flat slabs or primitive balls.
  const hs=(_x,y)=>.128-(y-.18)*.40;
  const hairColors=[createVectorSculptureMaterial('#1A1210'),createVectorSculptureMaterial('#B32234')];hairColors[0].name='cabello_oscuro';hairColors[1].name='mecha_roja';
  function hairVolume(name,outline,center,depth,stripe){
    const n=outline.length,v=outline.map(([x,y])=>[x,y,hs(x,y)]);
    v.push(...outline.map(([x,y])=>[x,y,hs(x,y)-depth]));
    v.push([center[0],center[1],hs(...center)+.022],[center[0],center[1],hs(...center)-depth]);
    const ix=[],groups=[];
    for(let j=0;j<n;j++)ix.push(2*n,j,(j+1)%n);
    for(let j=0;j<n;j++){const next=(j+1)%n;ix.push(2*n+1,next+n,j+n,j,j+n,next,next,j+n,next+n);}
    groups.push([0,ix.length,0]);
    function clip(poly,distance){const out=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=distance(a),db=distance(b);if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((x,k)=>x+(b[k]-x)*t));}}return out;}
    const scalar=p=>stripe==='left'?p[0]-p[1]:p[0]+p[1];
    const low=stripe==='left'?-.336:.321,high=stripe==='left'?-.324:.333,start=ix.length;
    for(let j=0;j<n;j++){
      let poly=[v[2*n],v[j],v[(j+1)%n]];
      poly=clip(poly,p=>scalar(p)-low);if(poly.length<3)continue;
      poly=clip(poly,p=>high-scalar(p));if(poly.length<3)continue;
      const base=v.length;v.push(...poly.map(p=>[p[0],p[1],p[2]+.0015]));
      for(let k=1;k<poly.length-1;k++)ix.push(base,base+k,base+k+1);
    }
    groups.push([start,ix.length-start,1]);
    let area=0;for(let j=0;j<n;j++){const a=outline[j],b=outline[(j+1)%n];area+=a[0]*b[1]-b[0]*a[1];}
    if(area<0)for(let j=0;j<ix.length;j+=3)[ix[j+1],ix[j+2]]=[ix[j+2],ix[j+1]];
    const g=geo(v,ix);g.clearGroups();for(const[start,count,mi]of groups)g.addGroup(start,count,mi);
    return mesh(hair,name,g,hairColors);
  }
  hairVolume('masa_2_onda_esculpida_izquierda',[
    [-.109,.176],[-.129,.213],[-.119,.244],[-.093,.267],[-.054,.299],[-.015,.302],
    [.012,.278],[-.02,.256],[-.052,.239],[-.074,.208],[-.085,.18]
  ],[-.074,.250],.055,'left');
  hairVolume('masa_3_onda_esculpida_derecha',[
    [.012,.279],[.030,.297],[.069,.286],[.105,.262],[.128,.227],[.118,.191],[.096,.172],[.082,.212],[.053,.253]
  ],[.075,.251],.052,'right');
  // Rear accent interpolates the cap's own back facet, avoiding a hovering stripe.
  const rv=[],ri=[];for(let k=0;k<3;k++)for(const u of[.30,.45]){const a=hv[k*8+4],b=hv[k*8+5];rv.push([THREE.MathUtils.lerp(a[0],b[0],u),THREE.MathUtils.lerp(a[1],b[1],u),THREE.MathUtils.lerp(a[2],b[2],u)-.004]);}
  for(let k=0;k<2;k++){const a=k*2,b=a+1,c=a+2,d=a+3;ri.push(a,c,b,b,c,d,b,c,a,d,c,b);}
  mesh(hair,'mecha_nuca_adherida',geo(rv,ri),'red');
  // User correction: round lenses, represented as clean ten-sided polygonal frames.
  const frames=group(r.head,'alex_lentes_redondos');
  const lensMat=createVectorSculptureMaterial('#F0E2C0');lensMat.name='montura_marfil';
  for(const side of[-1,1]){
    const cx=side*.042,cy=.157;
    const outer=Array.from({length:10},(_,j)=>{const a=j*Math.PI*2/10;return[cx+Math.cos(a)*.032,cy+Math.sin(a)*.032];});
    const inner=Array.from({length:10},(_,j)=>{const a=-j*Math.PI*2/10;return[cx+Math.cos(a)*.026,cy+Math.sin(a)*.026];});
    polygon(frames,'aro_redondo_'+side,outer,.006,lensMat,.108,[inner]);
    const q=[[side*.073,.165,.11],[side*.1,.165,-.012],[side*.1,.170,-.012],[side*.073,.170,.11]];
    mesh(frames,'patilla_recta_'+side,geo(q,[0,1,2,0,2,3,2,1,0,3,2,0]),lensMat);
  }
  polygon(frames,'puente_lentes',[[-.015,.157],[.015,.157],[.012,.164],[-.012,.164]],.006,lensMat,.110);
  // Use the original material list for the unmodified spirit-transition function.
  // Each preview instance owns its materials; spirit transitions cannot tint another instance.
  const cloned=new Map();
  function own(m){if(!m.isMeshStandardMaterial)return m;if(!cloned.has(m)){const c=m.clone();c.userData={...m.userData,c:m.color.getHex(),e:0};cloned.set(m,c);}return cloned.get(m);}
  r.g.traverse(o=>{if(o.isMesh&&o.material){o.material=Array.isArray(o.material)?o.material.map(own):own(o.material);o.castShadow=o.receiveShadow=true;}});
  r.mats=[...new Set([...r.mats.map(m=>cloned.get(m)||m),...cloned.values()])];
  r.g.userData={artStudy:'v05',base:'src/chars3d.js',baseBlob:'be7468119d982b9d06d1a88681ea1a3e866ad00f',approval:'approved_2026_11_18',neckAndJointPositions:'original, unchanged',changes:['hair','layered torso clothing','round glasses'],animationFunction:'original animateCharacter, unmodified'};
  return r;
}

return { refine };
})();
